/**
 * Dead Code Injector
 * Injects unreachable code blocks to confuse deobfuscators
 */

const { ASTNode } = require('../parser');

class DeadCodeInjector {
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
                const statements = [];
                node.statements.forEach(stmt => {
                    statements.push(this.transformNode(stmt));
                    
                    // Randomly inject dead code
                    if (Math.random() > 0.6) {
                        statements.push(this.generateDeadCode());
                    }
                });
                return new ASTNode('Block', { statements });

            case 'FunctionDeclaration':
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

            case 'While':
                return new ASTNode('While', {
                    condition: node.condition,
                    body: node.body.map(stmt => this.transformNode(stmt))
                });

            case 'For':
                return new ASTNode('For', {
                    variable: node.variable,
                    start: node.start,
                    end: node.end,
                    step: node.step,
                    body: node.body.map(stmt => this.transformNode(stmt))
                });

            default:
                return node;
        }
    }

    generateDeadCode() {
        const types = [
            () => this.generateUnreachableIf(),
            () => this.generateUnusedVariable(),
            () => this.generateDeadLoop()
        ];
        
        return types[Math.floor(Math.random() * types.length)]();
    }

    generateUnreachableIf() {
        return new ASTNode('If', {
            condition: new ASTNode('Boolean', { value: false }),
            thenBlock: [
                new ASTNode('LocalAssignment', {
                    names: [`__dead_${this.counter++}`],
                    initializers: [new ASTNode('String', { value: 'unreachable' })]
                })
            ],
            elseBlock: []
        });
    }

    generateUnusedVariable() {
        return new ASTNode('LocalAssignment', {
            names: [`__unused_${this.counter++}`],
            initializers: [
                new ASTNode('BinaryOp', {
                    left: new ASTNode('Number', { value: Math.floor(Math.random() * 1000).toString() }),
                    operator: '+',
                    right: new ASTNode('Number', { value: Math.floor(Math.random() * 1000).toString() })
                })
            ]
        });
    }

    generateDeadLoop() {
        return new ASTNode('Do', {
            body: [
                new ASTNode('If', {
                    condition: new ASTNode('Boolean', { value: false }),
                    thenBlock: [
                        new ASTNode('While', {
                            condition: new ASTNode('Boolean', { value: true }),
                            body: [new ASTNode('Break')]
                        })
                    ],
                    elseBlock: []
                })
            ]
        });
    }
}

module.exports = { DeadCodeInjector };
