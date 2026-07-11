/**
 * Lexer for Lua/LuaU
 * Tokenizes Lua code into a stream of tokens
 */

const TokenType = {
    // Literals
    NUMBER: 'NUMBER',
    STRING: 'STRING',
    BOOLEAN: 'BOOLEAN',
    NIL: 'NIL',
    
    // Identifiers and Keywords
    IDENTIFIER: 'IDENTIFIER',
    KEYWORD: 'KEYWORD',
    
    // Operators
    PLUS: 'PLUS',
    MINUS: 'MINUS',
    MULTIPLY: 'MULTIPLY',
    DIVIDE: 'DIVIDE',
    MODULO: 'MODULO',
    POWER: 'POWER',
    CONCAT: 'CONCAT',
    ASSIGN: 'ASSIGN',
    EQ: 'EQ',
    NE: 'NE',
    LT: 'LT',
    LE: 'LE',
    GT: 'GT',
    GE: 'GE',
    AND: 'AND',
    OR: 'OR',
    NOT: 'NOT',
    HASH: 'HASH',
    
    // Delimiters
    LPAREN: 'LPAREN',
    RPAREN: 'RPAREN',
    LBRACE: 'LBRACE',
    RBRACE: 'RBRACE',
    LBRACKET: 'LBRACKET',
    RBRACKET: 'RBRACKET',
    SEMICOLON: 'SEMICOLON',
    COMMA: 'COMMA',
    DOT: 'DOT',
    COLON: 'COLON',
    ARROW: 'ARROW',
    
    // Special
    EOF: 'EOF',
    NEWLINE: 'NEWLINE',
    COMMENT: 'COMMENT'
};

const KEYWORDS = new Set([
    'and', 'break', 'do', 'else', 'elseif', 'end', 'false',
    'for', 'function', 'if', 'in', 'local', 'nil', 'not', 'or',
    'repeat', 'return', 'then', 'true', 'until', 'while',
    'export', 'type', 'interface', 'typeof'
]);

class Token {
    constructor(type, value, line, column) {
        this.type = type;
        this.value = value;
        this.line = line;
        this.column = column;
    }
}

class Lexer {
    constructor(input) {
        this.input = input;
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.tokens = [];
    }

    tokenize() {
        while (this.position < this.input.length) {
            this.skipWhitespace();
            
            if (this.position >= this.input.length) break;
            
            const char = this.input[this.position];
            
            // Comments
            if (char === '-' && this.peek() === '-') {
                this.skipComment();
                continue;
            }
            
            // Strings
            if (char === '"' || char === "'") {
                this.tokens.push(this.readString());
                continue;
            }
            
            // Multiline strings
            if (char === '[' && this.peek() === '[') {
                this.tokens.push(this.readMultilineString());
                continue;
            }
            
            // Numbers
            if (this.isDigit(char)) {
                this.tokens.push(this.readNumber());
                continue;
            }
            
            // Identifiers and Keywords
            if (this.isIdentifierStart(char)) {
                this.tokens.push(this.readIdentifier());
                continue;
            }
            
            // Operators and Delimiters
            const token = this.readOperatorOrDelimiter();
            if (token) {
                this.tokens.push(token);
            }
        }
        
        this.tokens.push(new Token(TokenType.EOF, null, this.line, this.column));
        return this.tokens;
    }

    skipWhitespace() {
        while (this.position < this.input.length) {
            const char = this.input[this.position];
            if (char === ' ' || char === '\t' || char === '\r') {
                this.advance();
            } else if (char === '\n') {
                this.advance();
                this.line++;
                this.column = 1;
            } else {
                break;
            }
        }
    }

    skipComment() {
        const startLine = this.line;
        const startCol = this.column;
        
        // Skip --
        this.advance();
        this.advance();
        
        // Check for multiline comment
        if (this.input[this.position] === '[' && this.peek() === '[') {
            this.advance();
            this.advance();
            
            while (this.position < this.input.length) {
                if (this.input[this.position] === ']' && this.peek() === ']') {
                    this.advance();
                    this.advance();
                    break;
                }
                if (this.input[this.position] === '\n') {
                    this.line++;
                    this.column = 1;
                } else {
                    this.column++;
                }
                this.position++;
            }
        } else {
            // Single line comment
            while (this.position < this.input.length && this.input[this.position] !== '\n') {
                this.advance();
            }
        }
    }

    readString() {
        const startLine = this.line;
        const startCol = this.column;
        const quote = this.input[this.position];
        this.advance();
        
        let value = '';
        while (this.position < this.input.length && this.input[this.position] !== quote) {
            if (this.input[this.position] === '\\') {
                this.advance();
                const char = this.input[this.position];
                switch (char) {
                    case 'n': value += '\n'; break;
                    case 't': value += '\t'; break;
                    case 'r': value += '\r'; break;
                    case '\\': value += '\\'; break;
                    case '"': value += '"'; break;
                    case "'": value += "'"; break;
                    default: value += char;
                }
                this.advance();
            } else {
                value += this.input[this.position];
                this.advance();
            }
        }
        
        if (this.position < this.input.length) {
            this.advance(); // closing quote
        }
        
        return new Token(TokenType.STRING, value, startLine, startCol);
    }

    readMultilineString() {
        const startLine = this.line;
        const startCol = this.column;
        
        // Skip [[
        this.advance();
        this.advance();
        
        let value = '';
        while (this.position < this.input.length) {
            if (this.input[this.position] === ']' && this.peek() === ']') {
                this.advance();
                this.advance();
                break;
            }
            if (this.input[this.position] === '\n') {
                this.line++;
                this.column = 1;
            } else {
                this.column++;
            }
            value += this.input[this.position];
            this.position++;
        }
        
        return new Token(TokenType.STRING, value, startLine, startCol);
    }

    readNumber() {
        const startLine = this.line;
        const startCol = this.column;
        let value = '';
        
        while (this.position < this.input.length && this.isDigit(this.input[this.position])) {
            value += this.input[this.position];
            this.advance();
        }
        
        if (this.input[this.position] === '.' && this.isDigit(this.peek())) {
            value += this.input[this.position];
            this.advance();
            
            while (this.position < this.input.length && this.isDigit(this.input[this.position])) {
                value += this.input[this.position];
                this.advance();
            }
        }
        
        return new Token(TokenType.NUMBER, value, startLine, startCol);
    }

    readIdentifier() {
        const startLine = this.line;
        const startCol = this.column;
        let value = '';
        
        while (this.position < this.input.length && 
               (this.isIdentifierChar(this.input[this.position]))) {
            value += this.input[this.position];
            this.advance();
        }
        
        const type = KEYWORDS.has(value) ? TokenType.KEYWORD : TokenType.IDENTIFIER;
        return new Token(type, value, startLine, startCol);
    }

    readOperatorOrDelimiter() {
        const startLine = this.line;
        const startCol = this.column;
        const char = this.input[this.position];
        const next = this.peek();
        
        const twoCharOps = {
            '==': TokenType.EQ,
            '~=': TokenType.NE,
            '<=': TokenType.LE,
            '>=': TokenType.GE,
            '..': TokenType.CONCAT,
            '->': TokenType.ARROW
        };
        
        const twoChar = char + next;
        if (twoCharOps[twoChar]) {
            this.advance();
            this.advance();
            return new Token(twoCharOps[twoChar], twoChar, startLine, startCol);
        }
        
        const oneCharOps = {
            '+': TokenType.PLUS,
            '-': TokenType.MINUS,
            '*': TokenType.MULTIPLY,
            '/': TokenType.DIVIDE,
            '%': TokenType.MODULO,
            '^': TokenType.POWER,
            '=': TokenType.ASSIGN,
            '<': TokenType.LT,
            '>': TokenType.GT,
            '#': TokenType.HASH,
            '(': TokenType.LPAREN,
            ')': TokenType.RPAREN,
            '{': TokenType.LBRACE,
            '}': TokenType.RBRACE,
            '[': TokenType.LBRACKET,
            ']': TokenType.RBRACKET,
            ';': TokenType.SEMICOLON,
            ',': TokenType.COMMA,
            '.': TokenType.DOT,
            ':': TokenType.COLON
        };
        
        if (oneCharOps[char]) {
            this.advance();
            return new Token(oneCharOps[char], char, startLine, startCol);
        }
        
        this.advance();
        return null;
    }

    advance() {
        this.position++;
        this.column++;
    }

    peek(offset = 1) {
        const pos = this.position + offset;
        return pos < this.input.length ? this.input[pos] : '';
    }

    isDigit(char) {
        return char >= '0' && char <= '9';
    }

    isIdentifierStart(char) {
        return (char >= 'a' && char <= 'z') || 
               (char >= 'A' && char <= 'Z') || 
               char === '_';
    }

    isIdentifierChar(char) {
        return this.isIdentifierStart(char) || this.isDigit(char);
    }
}

module.exports = { Lexer, TokenType, Token, KEYWORDS };
