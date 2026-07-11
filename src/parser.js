/**
 * Parser for Lua/LuaU
 * Converts tokens into an Abstract Syntax Tree (AST)
 */

const { TokenType } = require('./lexer');

class ASTNode {
    constructor(type, properties = {}) {
        this.type = type;
        Object.assign(this, properties);
    }
}

class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.current = 0;
    }

    parse() {
        const statements = [];
        
        while (!this.isAtEnd()) {
            const stmt = this.statement();
            if (stmt) {
                statements.push(stmt);
            }
        }
        
        return new ASTNode('Block', { statements });
    }

    statement() {
        // Skip newlines
        while (this.match(TokenType.NEWLINE)) {}
        
        if (this.isAtEnd()) return null;
        
        if (this.match(TokenType.KEYWORD)) {
            const keyword = this.previous().value;
            
            switch (keyword) {
                case 'local':
                    return this.localStatement();
                case 'if':
                    return this.ifStatement();
                case 'while':
                    return this.whileStatement();
                case 'for':
                    return this.forStatement();
                case 'function':
                    return this.functionStatement();
                case 'return':
                    return this.returnStatement();
                case 'break':
                    return new ASTNode('Break');
                case 'do':
                    return this.doStatement();
                case 'repeat':
                    return this.repeatStatement();
                default:
                    this.current--;
                    return this.expressionStatement();
            }
        }
        
        return this.expressionStatement();
    }

    localStatement() {
        const names = [];
        
        do {
            names.push(this.consume(TokenType.IDENTIFIER, 'Expected identifier').value);
        } while (this.match(TokenType.COMMA));
        
        let initializers = [];
        if (this.match(TokenType.ASSIGN)) {
            do {
                initializers.push(this.expression());
            } while (this.match(TokenType.COMMA));
        }
        
        this.consumeStatementEnd();
        
        return new ASTNode('LocalAssignment', { names, initializers });
    }

    ifStatement() {
        const condition = this.expression();
        this.consume(TokenType.KEYWORD, 'Expected "then"');
        
        const thenBlock = [];
        while (!this.check(TokenType.KEYWORD) || 
               (this.peek().value !== 'end' && this.peek().value !== 'else' && this.peek().value !== 'elseif')) {
            const stmt = this.statement();
            if (stmt) thenBlock.push(stmt);
        }
        
        let elseBlock = [];
        let elseIfBlock = null;
        
        if (this.check(TokenType.KEYWORD)) {
            const keyword = this.peek().value;
            
            if (keyword === 'elseif') {
                this.advance();
                elseIfBlock = this.ifStatement();
                return new ASTNode('If', { condition, thenBlock, elseBlock: [elseIfBlock] });
            } else if (keyword === 'else') {
                this.advance();
                while (!this.check(TokenType.KEYWORD) || this.peek().value !== 'end') {
                    const stmt = this.statement();
                    if (stmt) elseBlock.push(stmt);
                }
            }
        }
        
        this.consume(TokenType.KEYWORD, 'Expected "end"');
        
        return new ASTNode('If', { condition, thenBlock, elseBlock });
    }

    whileStatement() {
        const condition = this.expression();
        this.consume(TokenType.KEYWORD, 'Expected "do"');
        
        const body = [];
        while (!this.check(TokenType.KEYWORD) || this.peek().value !== 'end') {
            const stmt = this.statement();
            if (stmt) body.push(stmt);
        }
        
        this.consume(TokenType.KEYWORD, 'Expected "end"');
        
        return new ASTNode('While', { condition, body });
    }

    forStatement() {
        const variable = this.consume(TokenType.IDENTIFIER, 'Expected identifier').value;
        this.consume(TokenType.ASSIGN, 'Expected "="');
        
        const start = this.expression();
        this.consume(TokenType.COMMA, 'Expected ","');
        const end = this.expression();
        
        let step = null;
        if (this.match(TokenType.COMMA)) {
            step = this.expression();
        }
        
        this.consume(TokenType.KEYWORD, 'Expected "do"');
        
        const body = [];
        while (!this.check(TokenType.KEYWORD) || this.peek().value !== 'end') {
            const stmt = this.statement();
            if (stmt) body.push(stmt);
        }
        
        this.consume(TokenType.KEYWORD, 'Expected "end"');
        
        return new ASTNode('For', { variable, start, end, step, body });
    }

    functionStatement() {
        const name = this.consume(TokenType.IDENTIFIER, 'Expected function name').value;
        this.consume(TokenType.LPAREN, 'Expected "("');
        
        const params = [];
        if (!this.check(TokenType.RPAREN)) {
            do {
                params.push(this.consume(TokenType.IDENTIFIER, 'Expected parameter name').value);
            } while (this.match(TokenType.COMMA));
        }
        
        this.consume(TokenType.RPAREN, 'Expected ")"');
        
        const body = [];
        while (!this.check(TokenType.KEYWORD) || this.peek().value !== 'end') {
            const stmt = this.statement();
            if (stmt) body.push(stmt);
        }
        
        this.consume(TokenType.KEYWORD, 'Expected "end"');
        
        return new ASTNode('FunctionDeclaration', { name, params, body });
    }

    returnStatement() {
        const values = [];
        
        if (!this.check(TokenType.KEYWORD) && !this.check(TokenType.SEMICOLON) && !this.isAtEnd()) {
            do {
                values.push(this.expression());
            } while (this.match(TokenType.COMMA));
        }
        
        this.consumeStatementEnd();
        
        return new ASTNode('Return', { values });
    }

    doStatement() {
        const body = [];
        while (!this.check(TokenType.KEYWORD) || this.peek().value !== 'end') {
            const stmt = this.statement();
            if (stmt) body.push(stmt);
        }
        
        this.consume(TokenType.KEYWORD, 'Expected "end"');
        this.consumeStatementEnd();
        
        return new ASTNode('Do', { body });
    }

    repeatStatement() {
        const body = [];
        while (!this.check(TokenType.KEYWORD) || this.peek().value !== 'until') {
            const stmt = this.statement();
            if (stmt) body.push(stmt);
        }
        
        this.consume(TokenType.KEYWORD, 'Expected "until"');
        const condition = this.expression();
        this.consumeStatementEnd();
        
        return new ASTNode('Repeat', { body, condition });
    }

    expressionStatement() {
        const expr = this.expression();
        this.consumeStatementEnd();
        return expr;
    }

    expression() {
        return this.or();
    }

    or() {
        let expr = this.and();
        
        while (this.match(TokenType.OR)) {
            const operator = this.previous().value;
            const right = this.and();
            expr = new ASTNode('BinaryOp', { left: expr, operator, right });
        }
        
        return expr;
    }

    and() {
        let expr = this.equality();
        
        while (this.match(TokenType.AND)) {
            const operator = this.previous().value;
            const right = this.equality();
            expr = new ASTNode('BinaryOp', { left: expr, operator, right });
        }
        
        return expr;
    }

    equality() {
        let expr = this.relational();
        
        while (this.match(TokenType.EQ, TokenType.NE)) {
            const operator = this.previous().value;
            const right = this.relational();
            expr = new ASTNode('BinaryOp', { left: expr, operator, right });
        }
        
        return expr;
    }

    relational() {
        let expr = this.concatenation();
        
        while (this.match(TokenType.LT, TokenType.LE, TokenType.GT, TokenType.GE)) {
            const operator = this.previous().value;
            const right = this.concatenation();
            expr = new ASTNode('BinaryOp', { left: expr, operator, right });
        }
        
        return expr;
    }

    concatenation() {
        let expr = this.additive();
        
        while (this.match(TokenType.CONCAT)) {
            const operator = this.previous().value;
            const right = this.additive();
            expr = new ASTNode('BinaryOp', { left: expr, operator, right });
        }
        
        return expr;
    }

    additive() {
        let expr = this.multiplicative();
        
        while (this.match(TokenType.PLUS, TokenType.MINUS)) {
            const operator = this.previous().value;
            const right = this.multiplicative();
            expr = new ASTNode('BinaryOp', { left: expr, operator, right });
        }
        
        return expr;
    }

    multiplicative() {
        let expr = this.power();
        
        while (this.match(TokenType.MULTIPLY, TokenType.DIVIDE, TokenType.MODULO)) {
            const operator = this.previous().value;
            const right = this.power();
            expr = new ASTNode('BinaryOp', { left: expr, operator, right });
        }
        
        return expr;
    }

    power() {
        let expr = this.unary();
        
        if (this.match(TokenType.POWER)) {
            const operator = this.previous().value;
            const right = this.power();
            expr = new ASTNode('BinaryOp', { left: expr, operator, right });
        }
        
        return expr;
    }

    unary() {
        if (this.match(TokenType.NOT, TokenType.MINUS, TokenType.HASH)) {
            const operator = this.previous().value;
            const expr = this.unary();
            return new ASTNode('UnaryOp', { operator, expr });
        }
        
        return this.postfix();
    }

    postfix() {
        let expr = this.primary();
        
        while (true) {
            if (this.match(TokenType.DOT)) {
                const property = this.consume(TokenType.IDENTIFIER, 'Expected property name').value;
                expr = new ASTNode('MemberAccess', { object: expr, property });
            } else if (this.match(TokenType.LBRACKET)) {
                const index = this.expression();
                this.consume(TokenType.RBRACKET, 'Expected "]"');
                expr = new ASTNode('IndexAccess', { object: expr, index });
            } else if (this.match(TokenType.LPAREN)) {
                const args = [];
                if (!this.check(TokenType.RPAREN)) {
                    do {
                        args.push(this.expression());
                    } while (this.match(TokenType.COMMA));
                }
                this.consume(TokenType.RPAREN, 'Expected ")"');
                expr = new ASTNode('FunctionCall', { callee: expr, args });
            } else if (this.match(TokenType.COLON)) {
                const method = this.consume(TokenType.IDENTIFIER, 'Expected method name').value;
                this.consume(TokenType.LPAREN, 'Expected "("');
                const args = [];
                if (!this.check(TokenType.RPAREN)) {
                    do {
                        args.push(this.expression());
                    } while (this.match(TokenType.COMMA));
                }
                this.consume(TokenType.RPAREN, 'Expected ")"');
                expr = new ASTNode('MethodCall', { object: expr, method, args });
            } else {
                break;
            }
        }
        
        return expr;
    }

    primary() {
        if (this.match(TokenType.NUMBER)) {
            return new ASTNode('Number', { value: this.previous().value });
        }
        
        if (this.match(TokenType.STRING)) {
            return new ASTNode('String', { value: this.previous().value });
        }
        
        if (this.match(TokenType.KEYWORD)) {
            const keyword = this.previous().value;
            if (keyword === 'true' || keyword === 'false') {
                return new ASTNode('Boolean', { value: keyword === 'true' });
            }
            if (keyword === 'nil') {
                return new ASTNode('Nil');
            }
            if (keyword === 'function') {
                return this.anonymousFunction();
            }
            this.current--;
        }
        
        if (this.match(TokenType.IDENTIFIER)) {
            return new ASTNode('Identifier', { name: this.previous().value });
        }
        
        if (this.match(TokenType.LBRACE)) {
            return this.tableConstructor();
        }
        
        if (this.match(TokenType.LPAREN)) {
            const expr = this.expression();
            this.consume(TokenType.RPAREN, 'Expected ")"');
            return expr;
        }
        
        throw new Error('Unexpected token: ' + this.peek().type);
    }

    anonymousFunction() {
        this.consume(TokenType.LPAREN, 'Expected "("');
        
        const params = [];
        if (!this.check(TokenType.RPAREN)) {
            do {
                params.push(this.consume(TokenType.IDENTIFIER, 'Expected parameter name').value);
            } while (this.match(TokenType.COMMA));
        }
        
        this.consume(TokenType.RPAREN, 'Expected ")"');
        
        const body = [];
        while (!this.check(TokenType.KEYWORD) || this.peek().value !== 'end') {
            const stmt = this.statement();
            if (stmt) body.push(stmt);
        }
        
        this.consume(TokenType.KEYWORD, 'Expected "end"');
        
        return new ASTNode('AnonymousFunction', { params, body });
    }

    tableConstructor() {
        const fields = [];
        
        while (!this.check(TokenType.RBRACE)) {
            if (this.check(TokenType.LBRACKET)) {
                // [key] = value
                this.advance();
                const key = this.expression();
                this.consume(TokenType.RBRACKET, 'Expected "]"');
                this.consume(TokenType.ASSIGN, 'Expected "="');
                const value = this.expression();
                fields.push(new ASTNode('TableField', { key, value }));
            } else if (this.check(TokenType.IDENTIFIER) && this.peekNext().type === TokenType.ASSIGN) {
                // key = value
                const key = this.consume(TokenType.IDENTIFIER, 'Expected identifier').value;
                this.consume(TokenType.ASSIGN, 'Expected "="');
                const value = this.expression();
                fields.push(new ASTNode('TableField', { key: new ASTNode('String', { value: key }), value }));
            } else {
                // value
                fields.push(this.expression());
            }
            
            if (!this.match(TokenType.COMMA)) break;
        }
        
        this.consume(TokenType.RBRACE, 'Expected "}"');
        
        return new ASTNode('Table', { fields });
    }

    match(...types) {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    check(type) {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    advance() {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    isAtEnd() {
        return this.peek().type === TokenType.EOF;
    }

    peek() {
        return this.tokens[this.current];
    }

    peekNext() {
        if (this.current + 1 >= this.tokens.length) return this.tokens[this.tokens.length - 1];
        return this.tokens[this.current + 1];
    }

    previous() {
        return this.tokens[this.current - 1];
    }

    consume(type, message) {
        if (this.check(type)) return this.advance();
        throw new Error(message + ' at line ' + this.peek().line);
    }

    consumeStatementEnd() {
        while (this.match(TokenType.SEMICOLON, TokenType.NEWLINE)) {}
    }
}

module.exports = { Parser, ASTNode };
