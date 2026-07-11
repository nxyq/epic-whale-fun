/**
 * Control Flow Transformer
 * Adds control flow obfuscation by wrapping code in dummy conditionals
 */

const { ASTNode } = require('../parser');

class ControlFlowTransformer {
    constructor(options = {}) {
        this.options = options;
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
                    statements: node.statements.map(stmt => this.transformStatement(stmt))
                });
            
            case 'FunctionDeclaration':
                return new ASTNode('FunctionDeclaration', {
                    name: node.name,
                    params: node.params,
                    body: node.body.map(stmt => this.transformStatement(stmt))
                });
            
            case 'AnonymousFunction':
                return new ASTNode('AnonymousFunction', {
                    params: node.params,
                    body: node.body.map(stmt => this.transformStatement(stmt))
                });
            
            case 'If':
                return new ASTNode('If', {
                    condition: node.condition,
                    thenBlock: node.thenBlock.map(stmt => this.transformStatement(stmt)),
                    elseBlock: node.elseBlock.map(stmt => this.transformStatement(stmt))
                });
            
            case 'While':
                return new ASTNode('While', {
                    condition: node.condition,
                    body: node.body.map(stmt => this.transformStatement(stmt))
                });
            
            case 'For':
                return new ASTNode('For', {
                    variable: node.variable,
                    start: node.start,
                    end: node.end,
                    step: node.step,
                    body: node.body.map(stmt => this.transformStatement(stmt))
                });
            
            case 'Do':
                return new ASTNode('Do', {
                    body: node.body.map(stmt => this.transformStatement(stmt))
                });
            
            case 'Repeat':
                return new ASTNode('Repeat', {
                    body: node.body.map(stmt => this.transformStatement(stmt)),
                    condition: node.condition
                });
            
            default:
                return node;
        }
    }

    transformStatement(stmt) {
        if (!stmt) return stmt;
        
        // Skip control flow transformation for certain statements
        if (stmt.type === 'Return' || stmt.type === 'Break' || stmt.type === 'LocalAssignment') {
            return stmt;
        }
        
        // Randomly wrap statements in dummy conditionals
        if (Math.random() > 0.5 && stmt.type !== 'If' && stmt.type !== 'While' && stmt.type !== 'For') {
            return this.wrapInControlFlow(stmt);
        }
        
        return this.transformNode(stmt);
    }

    wrapInControlFlow(stmt) {
        const condVar = this.generateVariableName();
        
        // Create: if condVar == condVar then ... end
        return new ASTNode('If', {
            condition: new ASTNode('BinaryOp', {
                left: new ASTNode('Identifier', { name: condVar }),
                operator: '==',
                right: new ASTNode('Identifier', { name: condVar })
            }),
            thenBlock: [this.transformNode(stmt)],
            elseBlock: []
        });
    }

    generateVariableName() {
        return `__obf_cf_${this.counter++}`;
    }
}

module.exports = { ControlFlowTransformer };
