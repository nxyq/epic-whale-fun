/**
 * Name Obfuscator
 * Renames variables, functions, and properties to meaningless names
 */

const { ASTNode } = require('../parser');

class NameObfuscator {
    constructor(options = {}) {
        this.options = {
            renameVariables: options.renameVariables !== false,
            renameGlobals: options.renameGlobals !== false
        };
        
        this.varMap = new Map();
        this.globalVars = new Set();
        this.localVars = new Set();
        this.nameCounter = 0;
    }

    transform(ast) {
        this.collectVariables(ast);
        return this.transformNode(ast);
    }

    collectVariables(node) {
        if (!node) return;
        
        switch (node.type) {
            case 'Block':
                node.statements.forEach(stmt => this.collectVariables(stmt));
                break;
            
            case 'LocalAssignment':
                node.names.forEach(name => {
                    this.localVars.add(name);
                });
                node.initializers?.forEach(expr => this.collectVariables(expr));
                break;
            
            case 'FunctionDeclaration':
                this.globalVars.add(node.name);
                node.params.forEach(param => this.localVars.add(param));
                node.body.forEach(stmt => this.collectVariables(stmt));
                break;
            
            case 'AnonymousFunction':
                node.params.forEach(param => this.localVars.add(param));
                node.body.forEach(stmt => this.collectVariables(stmt));
                break;
            
            case 'If':
                this.collectVariables(node.condition);
                node.thenBlock.forEach(stmt => this.collectVariables(stmt));
                node.elseBlock.forEach(stmt => this.collectVariables(stmt));
                break;
            
            case 'While':
                this.collectVariables(node.condition);
                node.body.forEach(stmt => this.collectVariables(stmt));
                break;
            
            case 'For':
                this.localVars.add(node.variable);
                this.collectVariables(node.start);
                this.collectVariables(node.end);
                this.collectVariables(node.step);
                node.body.forEach(stmt => this.collectVariables(stmt));
                break;
            
            case 'BinaryOp':
                this.collectVariables(node.left);
                this.collectVariables(node.right);
                break;
            
            case 'UnaryOp':
                this.collectVariables(node.expr);
                break;
            
            case 'FunctionCall':
                this.collectVariables(node.callee);
                node.args.forEach(arg => this.collectVariables(arg));
                break;
            
            case 'MethodCall':
                this.collectVariables(node.object);
                node.args.forEach(arg => this.collectVariables(arg));
                break;
            
            case 'MemberAccess':
                this.collectVariables(node.object);
                break;
            
            case 'IndexAccess':
                this.collectVariables(node.object);
                this.collectVariables(node.index);
                break;
            
            case 'Table':
                node.fields?.forEach(field => {
                    if (field.type === 'TableField') {
                        this.collectVariables(field.key);
                        this.collectVariables(field.value);
                    } else {
                        this.collectVariables(field);
                    }
                });
                break;
            
            case 'Return':
                node.values?.forEach(val => this.collectVariables(val));
                break;
            
            case 'Do':
                node.body.forEach(stmt => this.collectVariables(stmt));
                break;
            
            case 'Repeat':
                node.body.forEach(stmt => this.collectVariables(stmt));
                this.collectVariables(node.condition);
                break;
        }
    }

    transformNode(node) {
        if (!node) return node;
        
        switch (node.type) {
            case 'Block':
                return new ASTNode('Block', {
                    statements: node.statements.map(stmt => this.transformNode(stmt))
                });
            
            case 'LocalAssignment':
                return new ASTNode('LocalAssignment', {
                    names: node.names.map(name => this.obfuscateName(name, true)),
                    initializers: node.initializers?.map(expr => this.transformNode(expr)) || []
                });
            
            case 'FunctionDeclaration':
                return new ASTNode('FunctionDeclaration', {
                    name: this.obfuscateName(node.name, false),
                    params: node.params.map(param => this.obfuscateName(param, true)),
                    body: node.body.map(stmt => this.transformNode(stmt))
                });
            
            case 'AnonymousFunction':
                return new ASTNode('AnonymousFunction', {
                    params: node.params.map(param => this.obfuscateName(param, true)),
                    body: node.body.map(stmt => this.transformNode(stmt))
                });
            
            case 'Identifier':
                return new ASTNode('Identifier', {
                    name: this.obfuscateName(node.name, false)
                });
            
            case 'For':
                return new ASTNode('For', {
                    variable: this.obfuscateName(node.variable, true),
                    start: this.transformNode(node.start),
                    end: this.transformNode(node.end),
                    step: this.transformNode(node.step),
                    body: node.body.map(stmt => this.transformNode(stmt))
                });
            
            case 'If':
                return new ASTNode('If', {
                    condition: this.transformNode(node.condition),
                    thenBlock: node.thenBlock.map(stmt => this.transformNode(stmt)),
                    elseBlock: node.elseBlock.map(stmt => this.transformNode(stmt))
                });
            
            case 'While':
                return new ASTNode('While', {
                    condition: this.transformNode(node.condition),
                    body: node.body.map(stmt => this.transformNode(stmt))
                });
            
            case 'Repeat':
                return new ASTNode('Repeat', {
                    body: node.body.map(stmt => this.transformNode(stmt)),
                    condition: this.transformNode(node.condition)
                });
            
            case 'BinaryOp':
                return new ASTNode('BinaryOp', {
                    left: this.transformNode(node.left),
                    operator: node.operator,
                    right: this.transformNode(node.right)
                });
            
            case 'UnaryOp':
                return new ASTNode('UnaryOp', {
                    operator: node.operator,
                    expr: this.transformNode(node.expr)
                });
            
            case 'FunctionCall':
                return new ASTNode('FunctionCall', {
                    callee: this.transformNode(node.callee),
                    args: node.args.map(arg => this.transformNode(arg))
                });
            
            case 'MethodCall':
                return new ASTNode('MethodCall', {
                    object: this.transformNode(node.object),
                    method: node.method,
                    args: node.args.map(arg => this.transformNode(arg))
                });
            
            case 'MemberAccess':
                return new ASTNode('MemberAccess', {
                    object: this.transformNode(node.object),
                    property: node.property
                });
            
            case 'IndexAccess':
                return new ASTNode('IndexAccess', {
                    object: this.transformNode(node.object),
                    index: this.transformNode(node.index)
                });
            
            case 'Table':
                return new ASTNode('Table', {
                    fields: node.fields?.map(field => {
                        if (field.type === 'TableField') {
                            return new ASTNode('TableField', {
                                key: this.transformNode(field.key),
                                value: this.transformNode(field.value)
                            });
                        }
                        return this.transformNode(field);
                    }) || []
                });
            
            case 'Return':
                return new ASTNode('Return', {
                    values: node.values?.map(val => this.transformNode(val)) || []
                });
            
            case 'Do':
                return new ASTNode('Do', {
                    body: node.body.map(stmt => this.transformNode(stmt))
                });
            
            default:
                return node;
        }
    }

    obfuscateName(name, isLocal) {
        if (!this.options.renameVariables && isLocal) return name;
        if (!this.options.renameGlobals && !isLocal) return name;
        
        // Don't obfuscate special names
        if (name.startsWith('__') || name === '_' || name === 'self') {
            return name;
        }
        
        if (!this.varMap.has(name)) {
            const obfuscatedName = this.generateObfuscatedName();
            this.varMap.set(name, obfuscatedName);
        }
        
        return this.varMap.get(name);
    }

    generateObfuscatedName() {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_';
        let name = '';
        let counter = this.nameCounter++;
        
        do {
            name = chars[counter % chars.length] + name;
            counter = Math.floor(counter / chars.length);
        } while (counter > 0);
        
        return name;
    }
}

module.exports = { NameObfuscator };
