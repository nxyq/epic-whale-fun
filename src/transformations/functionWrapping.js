/**
 * Function Wrapper
 * Wraps functions with additional layers to hide logic
 */

const { ASTNode } = require('../parser');

class FunctionWrapper {
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

            case 'FunctionDeclaration':
                // Wrap function with a closure
                if (Math.random() > 0.5) {
                    return this.wrapFunction(node);
                }
                return new ASTNode('FunctionDeclaration', {
                    name: node.name,
                    params: node.params,
                    body: node.body.map(stmt => this.transformNode(stmt))
                });

            case 'If':
                return new ASTNode('If', {
                    condition: node.condition,
                    thenBlock: node.thenBlock.map(stmt => this.transformNode(stmt)),
                    elseBlock: node.elseBlock.map(stmt => this.transformNode(stmt))
                });

            default:
                return node;
        }
    }

    wrapFunction(funcNode) {
        const wrappedName = `__wrapped_${this.counter++}`;
        const paramList = funcNode.params.join(', ');

        // Create wrapper function that calls the original
        return new ASTNode('FunctionDeclaration', {
            name: funcNode.name,
            params: funcNode.params,
            body: [
                new ASTNode('LocalAssignment', {
                    names: [wrappedName],
                    initializers: [
                        new ASTNode('AnonymousFunction', {
                            params: funcNode.params,
                            body: funcNode.body
                        })
                    ]
                }),
                new ASTNode('Return', {
                    values: [
                        new ASTNode('FunctionCall', {
                            callee: new ASTNode('Identifier', { name: wrappedName }),
                            args: funcNode.params.map(p => new ASTNode('Identifier', { name: p }))
                        })
                    ]
                })
            ]
        });
    }
}

module.exports = { FunctionWrapper };
