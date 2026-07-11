/**
 * Constant Folder
 * Evaluates and simplifies constant expressions
 */

const { ASTNode } = require('../parser');

class ConstantFolder {
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

            case 'BinaryOp':
                const left = this.transformNode(node.left);
                const right = this.transformNode(node.right);
                
                if (left.type === 'Number' && right.type === 'Number') {
                    const result = this.evaluateBinaryOp(left.value, node.operator, right.value);
                    if (result !== null) {
                        return new ASTNode('Number', { value: result.toString() });
                    }
                }
                
                return new ASTNode('BinaryOp', { left, operator: node.operator, right });

            case 'UnaryOp':
                const expr = this.transformNode(node.expr);
                
                if (expr.type === 'Number') {
                    const result = this.evaluateUnaryOp(node.operator, expr.value);
                    if (result !== null) {
                        return new ASTNode('Number', { value: result.toString() });
                    }
                }
                
                return new ASTNode('UnaryOp', { operator: node.operator, expr });

            case 'LocalAssignment':
                return new ASTNode('LocalAssignment', {
                    names: node.names,
                    initializers: node.initializers?.map(expr => this.transformNode(expr)) || []
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
                    step: node.step ? this.transformNode(node.step) : null,
                    body: node.body.map(stmt => this.transformNode(stmt))
                });

            case 'FunctionCall':
                return new ASTNode('FunctionCall', {
                    callee: this.transformNode(node.callee),
                    args: node.args.map(arg => this.transformNode(arg))
                });

            default:
                return node;
        }
    }

    evaluateBinaryOp(left, op, right) {
        const l = parseFloat(left);
        const r = parseFloat(right);

        if (isNaN(l) || isNaN(r)) return null;

        switch (op) {
            case '+': return l + r;
            case '-': return l - r;
            case '*': return l * r;
            case '/': return r !== 0 ? l / r : null;
            case '%': return r !== 0 ? l % r : null;
            case '^': return Math.pow(l, r);
            default: return null;
        }
    }

    evaluateUnaryOp(op, value) {
        const v = parseFloat(value);
        if (isNaN(v)) return null;

        switch (op) {
            case '-': return -v;
            case '#': return null;
            case 'not': return v === 0 ? 1 : 0;
            default: return null;
        }
    }
}

module.exports = { ConstantFolder };
