/**
 * Array Flattener
 * Converts tables/arrays into separate variables
 */

const { ASTNode } = require('../parser');

class ArrayFlattener {
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
                return new ASTNode('Block', {
                    statements: node.statements.map(stmt => this.transformNode(stmt))
                });

            case 'LocalAssignment':
                if (node.initializers.length === 1 && node.initializers[0].type === 'Table' && Math.random() > 0.7) {
                    return this.flattenTable(node.names[0], node.initializers[0]);
                }
                return node;

            case 'Table':
                return new ASTNode('Table', {
                    fields: node.fields.map(field => this.transformNode(field))
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

    flattenTable(varName, tableNode) {
        const statements = [];
        let fieldIndex = 0;

        // Create main table
        statements.push(new ASTNode('LocalAssignment', {
            names: [varName],
            initializers: [new ASTNode('Table', { fields: [] })]
        }));

        // Add fields one by one
        tableNode.fields.forEach(field => {
            if (field.type === 'TableField') {
                const key = field.key.value || field.key.name;
                statements.push(new ASTNode('FunctionCall', {
                    callee: new ASTNode('MemberAccess', {
                        object: new ASTNode('Identifier', { name: 'table' }),
                        property: 'insert'
                    }),
                    args: [
                        new ASTNode('Identifier', { name: varName }),
                        field.value
                    ]
                }));
            }
        });

        return statements;
    }
}

module.exports = { ArrayFlattener };
