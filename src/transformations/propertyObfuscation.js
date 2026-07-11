/**
 * Property Obfuscator
 * Obfuscates table property access patterns
 */

const { ASTNode } = require('../parser');

class PropertyObfuscator {
    constructor() {
        this.propertyMap = new Map();
        this.counter = 0;
    }

    transform(ast) {
        return this.transformNode(ast);
    }

    transformNode(node) {
        if (!node) return node;

        switch (node.type) {
            case 'Block':
                return new ASTNode('Block', {
                    statements: node.statements.map(stmt => this.transformNode(stmt))
                });

            case 'MemberAccess':
                const obfuscatedProp = this.obfuscateProperty(node.property);
                return new ASTNode('IndexAccess', {
                    object: this.transformNode(node.object),
                    index: new ASTNode('String', { value: obfuscatedProp })
                });

            case 'MethodCall':
                return new ASTNode('MethodCall', {
                    object: this.transformNode(node.object),
                    method: node.method,
                    args: node.args.map(arg => this.transformNode(arg))
                });

            case 'Table':
                return new ASTNode('Table', {
                    fields: node.fields.map(field => {
                        if (field.type === 'TableField') {
                            return new ASTNode('TableField', {
                                key: this.transformNode(field.key),
                                value: this.transformNode(field.value)
                            });
                        }
                        return this.transformNode(field);
                    })
                });

            case 'LocalAssignment':
                return new ASTNode('LocalAssignment', {
                    names: node.names,
                    initializers: node.initializers.map(expr => this.transformNode(expr))
                });

            case 'FunctionCall':
                return new ASTNode('FunctionCall', {
                    callee: this.transformNode(node.callee),
                    args: node.args.map(arg => this.transformNode(arg))
                });

            case 'BinaryOp':
                return new ASTNode('BinaryOp', {
                    left: this.transformNode(node.left),
                    operator: node.operator,
                    right: this.transformNode(node.right)
                });

            case 'FunctionDeclaration':
                return new ASTNode('FunctionDeclaration', {
                    name: node.name,
                    params: node.params,
                    body: node.body.map(stmt => this.transformNode(stmt))
                });

            case 'If':
                return new ASTNode('If', {
                    condition: this.transformNode(node.condition),
                    thenBlock: node.thenBlock.map(stmt => this.transformNode(stmt)),
                    elseBlock: node.elseBlock.map(stmt => this.transformNode(stmt))
                });

            default:
                return node;
        }
    }

    obfuscateProperty(property) {
        if (!this.propertyMap.has(property)) {
            this.propertyMap.set(property, property);
        }
        return this.propertyMap.get(property);
    }
}

module.exports = { PropertyObfuscator };
