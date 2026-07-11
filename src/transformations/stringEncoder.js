/**
 * String Encoder
 * Encodes string literals to make them harder to read
 */

const { ASTNode } = require('../parser');

class StringEncoder {
    constructor(options = {}) {
        this.options = options;
        this.stringMap = new Map();
        this.stringCounter = 0;
        this.decoderGenerated = false;
    }

    transform(ast) {
        this.stringMap.clear();
        this.collectStrings(ast);
        
        if (this.stringMap.size > 0) {
            const statements = [];
            statements.push(this.generateDecoder());
            statements.push(...ast.statements.map(stmt => this.transformNode(stmt)));
            
            return new ASTNode('Block', { statements });
        }
        
        return ast;
    }

    collectStrings(node) {
        if (!node) return;
        
        switch (node.type) {
            case 'Block':
                node.statements.forEach(stmt => this.collectStrings(stmt));
                break;
            
            case 'String':
                if (!this.stringMap.has(node.value)) {
                    this.stringMap.set(node.value, this.encodeString(node.value));
                }
                break;
            
            case 'LocalAssignment':
                node.initializers?.forEach(expr => this.collectStrings(expr));
                node.names?.forEach(name => this.collectStrings(name));
                break;
            
            case 'BinaryOp':
                this.collectStrings(node.left);
                this.collectStrings(node.right);
                break;
            
            case 'UnaryOp':
                this.collectStrings(node.expr);
                break;
            
            case 'FunctionCall':
                this.collectStrings(node.callee);
                node.args?.forEach(arg => this.collectStrings(arg));
                break;
            
            case 'MethodCall':
                this.collectStrings(node.object);
                node.args?.forEach(arg => this.collectStrings(arg));
                break;
            
            case 'Table':
                node.fields?.forEach(field => {
                    if (field.type === 'TableField') {
                        this.collectStrings(field.key);
                        this.collectStrings(field.value);
                    } else {
                        this.collectStrings(field);
                    }
                });
                break;
            
            case 'FunctionDeclaration':
            case 'AnonymousFunction':
                node.body?.forEach(stmt => this.collectStrings(stmt));
                break;
            
            case 'If':
                this.collectStrings(node.condition);
                node.thenBlock?.forEach(stmt => this.collectStrings(stmt));
                node.elseBlock?.forEach(stmt => this.collectStrings(stmt));
                break;
            
            case 'While':
                this.collectStrings(node.condition);
                node.body?.forEach(stmt => this.collectStrings(stmt));
                break;
            
            case 'For':
                this.collectStrings(node.start);
                this.collectStrings(node.end);
                this.collectStrings(node.step);
                node.body?.forEach(stmt => this.collectStrings(stmt));
                break;
            
            case 'Return':
                node.values?.forEach(val => this.collectStrings(val));
                break;
            
            case 'Do':
                node.body?.forEach(stmt => this.collectStrings(stmt));
                break;
            
            case 'Repeat':
                node.body?.forEach(stmt => this.collectStrings(stmt));
                this.collectStrings(node.condition);
                break;
            
            case 'MemberAccess':
                this.collectStrings(node.object);
                break;
            
            case 'IndexAccess':
                this.collectStrings(node.object);
                this.collectStrings(node.index);
                break;
        }
    }

    transformNode(node) {
        if (!node) return node;
        
        switch (node.type) {
            case 'String':
                const encoded = this.stringMap.get(node.value);
                return new ASTNode('FunctionCall', {
                    callee: new ASTNode('Identifier', { name: '__obf_s' }),
                    args: [new ASTNode('String', { value: encoded })]
                });
            
            case 'Block':
                return new ASTNode('Block', {
                    statements: node.statements.map(stmt => this.transformNode(stmt))
                });
            
            case 'LocalAssignment':
                return new ASTNode('LocalAssignment', {
                    names: node.names,
                    initializers: node.initializers?.map(expr => this.transformNode(expr)) || []
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
                    args: node.args?.map(arg => this.transformNode(arg)) || []
                });
            
            case 'MethodCall':
                return new ASTNode('MethodCall', {
                    object: this.transformNode(node.object),
                    method: node.method,
                    args: node.args?.map(arg => this.transformNode(arg)) || []
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
            
            case 'FunctionDeclaration':
                return new ASTNode('FunctionDeclaration', {
                    name: node.name,
                    params: node.params,
                    body: node.body.map(stmt => this.transformNode(stmt))
                });
            
            case 'AnonymousFunction':
                return new ASTNode('AnonymousFunction', {
                    params: node.params,
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
            
            case 'For':
                return new ASTNode('For', {
                    variable: node.variable,
                    start: this.transformNode(node.start),
                    end: this.transformNode(node.end),
                    step: this.transformNode(node.step),
                    body: node.body.map(stmt => this.transformNode(stmt))
                });
            
            case 'Return':
                return new ASTNode('Return', {
                    values: node.values?.map(val => this.transformNode(val)) || []
                });
            
            case 'Do':
                return new ASTNode('Do', {
                    body: node.body.map(stmt => this.transformNode(stmt))
                });
            
            case 'Repeat':
                return new ASTNode('Repeat', {
                    body: node.body.map(stmt => this.transformNode(stmt)),
                    condition: this.transformNode(node.condition)
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
            
            default:
                return node;
        }
    }

    generateDecoder() {
        const decoderCode = `local __obf_s = (function()
    local __obf_t = {}
    local __obf_f = function(s)
        if __obf_t[s] then return __obf_t[s] end
        local result = ''
        for i = 1, #s do
            local b = string.byte(s, i)
            result = result .. string.char((b + 42) % 256)
        end
        __obf_t[s] = result
        return result
    end
    return __obf_f
end)()`;
        
        return new ASTNode('RawCode', { code: decoderCode });
    }

    encodeString(str) {
        let encoded = '';
        for (let i = 0; i < str.length; i++) {
            const charCode = str.charCodeAt(i);
            const encoded_char = String.fromCharCode((charCode - 42 + 256) % 256);
            encoded += encoded_char;
        }
        return encoded;
    }
}

module.exports = { StringEncoder };
