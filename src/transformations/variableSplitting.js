/**
 * Variable Splitter
 * Splits single variable assignments into multiple operations
 */

const { ASTNode } = require('../parser');

class VariableSplitter {
    constructor() {
        this.counter = 0;
    }

    transform(ast) {
        return this.transformNode(ast);
    }

    transformNode(node) {
        if (!node) return node;

        switch (node.type) {
            case 'Block':
                const newStatements = [];
                node.statements.forEach(stmt => {
                    const transformed = this.transformNode(stmt);
                    if (Array.isArray(transformed)) {
                        newStatements.push(...transformed);
                    } else {
                        newStatements.push(transformed);
                    }
                });
                return new ASTNode('Block', { statements: newStatements });

            case 'LocalAssignment':
                if (node.initializers.length === 1 && node.initializers[0].type === 'Number' && Math.random() > 0.5) {
                    const value = parseInt(node.initializers[0].value);
                    if (value > 100) {
                        return this.splitNumericAssignment(node.names[0], value);
                    }
                }
                return node;

            case 'FunctionDeclaration':
                return new ASTNode('FunctionDeclaration', {
                    name: node.name,
                    params: node.params,
                    body: this.transformNode(new ASTNode('Block', { statements: node.body })).statements
                });

            default:
                return node;
        }
    }

    splitNumericAssignment(varName, value) {
        const parts = this.decomposeNumber(value);
        const statements = [];

        // Start with first part
        statements.push(new ASTNode('LocalAssignment', {
            names: [varName],
            initializers: [new ASTNode('Number', { value: parts[0].toString() })]
        }));

        // Add remaining parts
        for (let i = 1; i < parts.length; i++) {
            statements.push(new ASTNode('LocalAssignment', {
                names: [`__tmp_${this.counter++}`],
                initializers: [
                    new ASTNode('BinaryOp', {
                        left: new ASTNode('Identifier', { name: varName }),
                        operator: '+',
                        right: new ASTNode('Number', { value: parts[i].toString() })
                    })
                ]
            }));
            
            statements.push(new ASTNode('LocalAssignment', {
                names: [varName],
                initializers: [new ASTNode('Identifier', { name: `__tmp_${this.counter - 1}` })]
            }));
        }

        return statements;
    }

    decomposeNumber(value) {
        const parts = [];
        let remaining = value;
        const partSize = Math.floor(value / (2 + Math.random() * 3));

        while (remaining > 0) {
            const part = Math.min(partSize, remaining);
            parts.push(part);
            remaining -= part;
        }

        return parts;
    }
}

module.exports = { VariableSplitter };
