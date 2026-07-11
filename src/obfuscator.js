/**
 * Main Obfuscator Class
 * Coordinates all obfuscation transformations
 */

const { Lexer } = require('./lexer');
const { Parser } = require('./parser');
const { NameObfuscator } = require('./transformations/nameObfuscator');
const { StringEncoder } = require('./transformations/stringEncoder');
const { ControlFlowTransformer } = require('./transformations/controlFlow');
const { DeadCodeInjector } = require('./transformations/deadCodeInjection');
const { VariableSplitter } = require('./transformations/variableSplitting');
const { ArrayFlattener } = require('./transformations/arrayFlattening');
const { FunctionWrapper } = require('./transformations/functionWrapping');
const { PropertyObfuscator } = require('./transformations/propertyObfuscation');
const { JunkCodeGenerator } = require('./transformations/junkCode');
const { ConstantFolder } = require('./transformations/constantFolding');
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
            deadCodeInjection: options.deadCodeInjection !== false,
            variableSplitting: options.variableSplitting !== false,
            arrayFlattening: options.arrayFlattening !== false,
            functionWrapping: options.functionWrapping !== false,
            propertyObfuscation: options.propertyObfuscation !== false,
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
            let ast = parser.parse();

            // Apply Transformations in order
            if (this.options.constantFolding) {
                const constantFolder = new ConstantFolder();
                ast = constantFolder.transform(ast);
            }

            if (this.options.renameVariables || this.options.renameGlobals) {
                const nameObfuscator = new NameObfuscator({
                    renameVariables: this.options.renameVariables,
                    renameGlobals: this.options.renameGlobals
                });
                ast = nameObfuscator.transform(ast);
            }

            if (this.options.propertyObfuscation) {
                const propertyObfuscator = new PropertyObfuscator();
                ast = propertyObfuscator.transform(ast);
            }

            if (this.options.variableSplitting) {
                const variableSplitter = new VariableSplitter();
                ast = variableSplitter.transform(ast);
            }

            if (this.options.arrayFlattening) {
                const arrayFlattener = new ArrayFlattener();
                ast = arrayFlattener.transform(ast);
            }

            if (this.options.stringEncryption) {
                const stringEncoder = new StringEncoder();
                ast = stringEncoder.transform(ast);
            }

            if (this.options.controlFlow) {
                const controlFlowTransformer = new ControlFlowTransformer();
                ast = controlFlowTransformer.transform(ast);
            }

            if (this.options.deadCodeInjection) {
                const deadCodeInjector = new DeadCodeInjector();
                ast = deadCodeInjector.transform(ast);
            }

            if (this.options.addJunkCode) {
                const junkCodeGenerator = new JunkCodeGenerator();
                ast = junkCodeGenerator.transform(ast);
            }

            if (this.options.functionWrapping) {
                const functionWrapper = new FunctionWrapper();
                ast = functionWrapper.transform(ast);
            }

            // Code Generation
            const codeGenerator = new CodeGenerator(this.options);
            const obfuscatedCode = codeGenerator.generate(ast);

            return obfuscatedCode;
        } catch (error) {
            console.error('Obfuscation Error:', error.message);
            if (process.env.DEBUG) {
                console.error(error.stack);
            }
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
