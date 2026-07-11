/**
 * Code Generator
 * Converts AST back to Lua code
 */

class CodeGenerator {
    constructor(options = {}) {
        this.options = options;
        this.indentLevel = 0;
        this.indentString = '    ';
    }

    generate(ast) {
        if (!ast) return '';
        return this.generateNode(ast);
    }

    generateNode(node) {
        if (!node) return '';
        
        switch (node.type) {
            case 'Block':
                return this.generateBlock(node);
            case 'LocalAssignment':
                return this.generateLocalAssignment(node);
            case 'If':
                return this.generateIf(node);
            case 'While':
                return this.generateWhile(node);
            case 'For':
                return this.generateFor(node);
            case 'FunctionDeclaration':
                return this.generateFunctionDeclaration(node);
            case 'Return':
                return this.generateReturn(node);
            case 'Break':
                return this.indent() + 'break';
            case 'Do':
                return this.generateDo(node);
            case 'Repeat':
                return this.generateRepeat(node);
            case 'BinaryOp':
                return this.generateBinaryOp(node);
            case 'UnaryOp':
                return this.generateUnaryOp(node);
            case 'FunctionCall':
                return this.generateFunctionCall(node);
            case 'MethodCall':
                return this.generateMethodCall(node);
            case 'MemberAccess':
                return this.generateMemberAccess(node);
            case 'IndexAccess':
                return this.generateIndexAccess(node);
            case 'Identifier':
                return node.name;
            case 'Number':
                return node.value;
            case 'String':
                return this.escapeString(node.value);
            case 'Boolean':
                return node.value ? 'true' : 'false';
            case 'Nil':
                return 'nil';
            case 'Table':
                return this.generateTable(node);
            case 'AnonymousFunction':
                return this.generateAnonymousFunction(node);
            case 'RawCode':
                return node.code;
            default:
                return '';
        }
    }

    generateBlock(node) {
        return node.statements
            .map(stmt => {
                if (!stmt) return '';
                const code = this.generateNode(stmt);
                return code.startsWith(this.indent()) ? code : this.indent() + code;
            })
            .filter(line => line.trim())
            .join('\n');
    }

    generateLocalAssignment(node) {
        const names = node.names.join(', ');
        let code = `local ${names}`;
        
        if (node.initializers && node.initializers.length > 0) {
            const values = node.initializers.map(expr => this.generateNode(expr)).join(', ');
            code += ` = ${values}`;
        }
        
        return code;
    }

    generateIf(node) {
        let code = `if ${this.generateNode(node.condition)} then\n`;
        
        this.indentLevel++;
        const { ASTNode } = require('./parser');
        code += this.generateBlock(new ASTNode('Block', { statements: node.thenBlock }));
        this.indentLevel--;
        
        if (node.elseBlock && node.elseBlock.length > 0) {
            if (node.elseBlock[0] && node.elseBlock[0].type === 'If') {
                code += '\n' + this.indent() + this.generateNode(node.elseBlock[0]).replace(/^if /, 'elseif ');
            } else {
                code += '\n' + this.indent() + 'else\n';
                this.indentLevel++;
                code += this.generateBlock(new ASTNode('Block', { statements: node.elseBlock }));
                this.indentLevel--;
                code += '\n' + this.indent() + 'end';
            }
        } else {
            code += '\n' + this.indent() + 'end';
        }
        
        return code;
    }

    generateWhile(node) {
        let code = `while ${this.generateNode(node.condition)} do\n`;
        
        this.indentLevel++;
        const { ASTNode } = require('./parser');
        code += this.generateBlock(new ASTNode('Block', { statements: node.body }));
        this.indentLevel--;
        
        code += '\n' + this.indent() + 'end';
        return code;
    }

    generateFor(node) {
        let code = `for ${node.variable} = ${this.generateNode(node.start)}, ${this.generateNode(node.end)}`;
        
        if (node.step) {
            code += `, ${this.generateNode(node.step)}`;
        }
        
        code += ' do\n';
        
        this.indentLevel++;
        const { ASTNode } = require('./parser');
        code += this.generateBlock(new ASTNode('Block', { statements: node.body }));
        this.indentLevel--;
        
        code += '\n' + this.indent() + 'end';
        return code;
    }

    generateFunctionDeclaration(node) {
        const params = node.params.join(', ');
        let code = `function ${node.name}(${params})\n`;
        
        this.indentLevel++;
        const { ASTNode } = require('./parser');
        code += this.generateBlock(new ASTNode('Block', { statements: node.body }));
        this.indentLevel--;
        
        code += '\n' + this.indent() + 'end';
        return code;
    }

    generateAnonymousFunction(node) {
        const params = node.params.join(', ');
        let code = `function(${params})\n`;
        
        this.indentLevel++;
        const { ASTNode } = require('./parser');
        code += this.generateBlock(new ASTNode('Block', { statements: node.body }));
        this.indentLevel--;
        
        code += '\n' + this.indent() + 'end';
        return code;
    }

    generateReturn(node) {
        if (node.values && node.values.length > 0) {
            const values = node.values.map(expr => this.generateNode(expr)).join(', ');
            return `return ${values}`;
        }
        return 'return';
    }

    generateDo(node) {
        let code = 'do\n';
        
        this.indentLevel++;
        const { ASTNode } = require('./parser');
        code += this.generateBlock(new ASTNode('Block', { statements: node.body }));
        this.indentLevel--;
        
        code += '\n' + this.indent() + 'end';
        return code;
    }

    generateRepeat(node) {
        let code = 'repeat\n';
        
        this.indentLevel++;
        const { ASTNode } = require('./parser');
        code += this.generateBlock(new ASTNode('Block', { statements: node.body }));
        this.indentLevel--;
        
        code += '\n' + this.indent() + 'until ' + this.generateNode(node.condition);
        return code;
    }

    generateBinaryOp(node) {
        return `${this.generateNode(node.left)} ${node.operator} ${this.generateNode(node.right)}`;
    }

    generateUnaryOp(node) {
        return `${node.operator}${this.generateNode(node.expr)}`;
    }

    generateFunctionCall(node) {
        const args = node.args.map(arg => this.generateNode(arg)).join(', ');
        return `${this.generateNode(node.callee)}(${args})`;
    }

    generateMethodCall(node) {
        const args = node.args.map(arg => this.generateNode(arg)).join(', ');
        return `${this.generateNode(node.object)}:${node.method}(${args})`;
    }

    generateMemberAccess(node) {
        return `${this.generateNode(node.object)}.${node.property}`;
    }

    generateIndexAccess(node) {
        return `${this.generateNode(node.object)}[${this.generateNode(node.index)}]`;
    }

    generateTable(node) {
        if (!node.fields || node.fields.length === 0) {
            return '{}';
        }
        
        let code = '{\n';
        this.indentLevel++;
        
        node.fields.forEach((field, index) => {
            if (field.type === 'TableField') {
                const keyStr = typeof field.key === 'string' ? field.key : this.generateNode(field.key);
                code += this.indent() + `[${keyStr}] = ${this.generateNode(field.value)}`;
            } else {
                code += this.indent() + this.generateNode(field);
            }
            if (index < node.fields.length - 1) code += ',';
            code += '\n';
        });
        
        this.indentLevel--;
        code += this.indent() + '}';
        return code;
    }

    escapeString(str) {
        const escaped = str
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n')
            .replace(/\t/g, '\\t')
            .replace(/\r/g, '\\r');
        return `"${escaped}"`;
    }

    indent() {
        return this.indentString.repeat(this.indentLevel);
    }
}

module.exports = { CodeGenerator };
