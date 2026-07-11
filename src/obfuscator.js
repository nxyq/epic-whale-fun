/**
 * Main Obfuscator Class
 * Coordinates all obfuscation transformations
 */

const { Lexer } = require('./lexer');
const { Parser } = require('./parser');
const { NameObfuscator } = require('./transformations/nameObfuscator');
const { StringEncoder } = require('./transformations/stringEncoder');
const { ControlFlowTransformer } = require('./transformations/controlFlow');
const { CodeGenerator } = require('./codeGenerator');

class Obfuscator {
    constructor(options = {}) {
        this.options = {
            renameVariables: options.renameVariables !== false,
            renameGlobals: options.renameGlobals !== false,
            stringEncryption: options.stringEncryption !== false,
            removeComments: options.removeComments !== false,
            addJunkCode: options.addJunkCode !== false,
            controlFlow: options.controlFlow !== false,
            constantFolding: options.constantFolding !== false,
            ...options
        };
    }

    obfuscate(code) {
        try {
            // Lexical Analysis
            const lexer = new Lexer(code);
            const tokens = lexer.tokenize();

            // Parsing
            const parser = new Parser(tokens);
            const ast = parser.parse();

            // Apply Transformations
            let transformedAST = ast;

            if (this.options.renameVariables || this.options.renameGlobals) {
                const nameObfuscator = new NameObfuscator({
                    renameVariables: this.options.renameVariables,
                    renameGlobals: this.options.renameGlobals
                });
                transformedAST = nameObfuscator.transform(transformedAST);
            }

            if (this.options.stringEncryption) {
                const stringEncoder = new StringEncoder();
                transformedAST = stringEncoder.transform(transformedAST);
            }

            if (this.options.controlFlow) {
                const controlFlowTransformer = new ControlFlowTransformer();
                transformedAST = controlFlowTransformer.transform(transformedAST);
            }

            // Code Generation
            const codeGenerator = new CodeGenerator(this.options);
            const obfuscatedCode = codeGenerator.generate(transformedAST);

            return obfuscatedCode;
        } catch (error) {
            console.error('Obfuscation Error:', error.message);
            // Return original code on error
            return code;
        }
    }

    obfuscateFile(filePath) {
        const fs = require('fs');
        const code = fs.readFileSync(filePath, 'utf-8');
        return this.obfuscate(code);
    }
}

module.exports = Obfuscator;
