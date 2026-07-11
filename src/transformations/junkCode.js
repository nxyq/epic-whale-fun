/**
 * Junk Code Generator
 * Generates realistic-looking but useless code
 */

const { ASTNode } = require('../parser');

class JunkCodeGenerator {
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
                    if (Math.random() > 0.65) {
                        statements.push(this.generateJunk());
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

    generateJunk() {
        const types = [
            () => this.generateJunkFunction(),
            () => this.generateJunkCalculation(),
            () => this.generateJunkTable(),
            () => this.generateJunkLoop()
        ];

        return types[Math.floor(Math.random() * types.length)]();
    }

    generateJunkFunction() {
        const funcName = `__junk_func_${this.counter++}`;
        return new ASTNode('FunctionDeclaration', {
            name: funcName,
            params: [],
            body: [
                new ASTNode('Return', {
                    values: [new ASTNode('Number', { value: Math.floor(Math.random() * 9999).toString() })]
                })
            ]
        });
    }

    generateJunkCalculation() {
        return new ASTNode('LocalAssignment', {
            names: [`__junk_var_${this.counter++}`],
            initializers: [
                new ASTNode('BinaryOp', {
                    left: new ASTNode('Number', { value: Math.floor(Math.random() * 1000).toString() }),
                    operator: this.randomOperator(),
                    right: new ASTNode('Number', { value: Math.floor(Math.random() * 1000).toString() })
                })
            ]
        });
    }

    generateJunkTable() {
        const fields = [];
        for (let i = 0; i < 3; i++) {
            fields.push(
                new ASTNode('TableField', {
                    key: new ASTNode('String', { value: `key_${i}` }),
                    value: new ASTNode('Number', { value: Math.floor(Math.random() * 1000).toString() })
                })
            );
        }

        return new ASTNode('LocalAssignment', {
            names: [`__junk_tbl_${this.counter++}`],
            initializers: [
                new ASTNode('Table', { fields })
            ]
        });
    }

    generateJunkLoop() {
        return new ASTNode('For', {
            variable: `__junk_i_${this.counter++}`,
            start: new ASTNode('Number', { value: '1' }),
            end: new ASTNode('Number', { value: Math.floor(Math.random() * 10).toString() }),
            step: null,
            body: [
                new ASTNode('LocalAssignment', {
                    names: [`__junk_tmp_${this.counter}`],
                    initializers: [new ASTNode('Number', { value: '0' })]
                })
            ]
        });
    }

    randomOperator() {
        const ops = ['+', '-', '*', '/', '%'];
        return ops[Math.floor(Math.random() * ops.length)];
    }
}

module.exports = { JunkCodeGenerator };
