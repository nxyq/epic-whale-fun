#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Obfuscator = require('./src/obfuscator');
const { PRESETS } = require('./src/presets');

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
        showHelp();
        process.exit(0);
    }

    let preset = 'medium';
    let inputFile = null;
    let outputFile = null;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--preset' && i + 1 < args.length) {
            preset = args[++i];
        } else if (!inputFile) {
            inputFile = args[i];
        } else if (!outputFile) {
            outputFile = args[i];
        }
    }

    if (!inputFile) {
        console.error('Error: Input file is required');
        showHelp();
        process.exit(1);
    }

    if (!outputFile) {
        const ext = path.extname(inputFile);
        const base = path.basename(inputFile, ext);
        outputFile = path.join(path.dirname(inputFile), `${base}_obfuscated${ext}`);
    }

    return { preset, inputFile, outputFile };
}

function showHelp() {
    console.log(`
LuaU Obfuscator - Advanced Lua/LuaU Code Obfuscation

Usage:
    node index.js [options] <input.lua> [output.lua]

Options:
    --preset <preset>   Obfuscation preset (default: medium)
    --help              Show this help message

Presets:
    light               Light obfuscation (basic name renaming)
    medium              Medium obfuscation (names + strings + control flow)
    heavy               Heavy obfuscation (all features enabled)
    extreme             Extreme obfuscation (all features + junk code)
    debug               Debug mode (show transformations without obfuscation)

Examples:
    node index.js input.lua
    node index.js --preset heavy input.lua output.lua
    node index.js --preset extreme script.lua obfuscated.lua
    `);
}

async function main() {
    try {
        const { preset, inputFile, outputFile } = parseArgs();

        // Validate preset
        if (!PRESETS[preset]) {
            console.error(`Error: Unknown preset "${preset}"`);
            console.log(`Available presets: ${Object.keys(PRESETS).join(', ')}`);
            process.exit(1);
        }

        // Check if input file exists
        if (!fs.existsSync(inputFile)) {
            console.error(`Error: Input file not found: ${inputFile}`);
            process.exit(1);
        }

        // Read input file
        const inputCode = fs.readFileSync(inputFile, 'utf-8');
        
        console.log(`📝 Input file: ${inputFile}`);
        console.log(`⚙️  Preset: ${preset}`);
        console.log(`📦 Input size: ${inputCode.length} bytes`);

        // Create obfuscator with preset config
        const obfuscator = new Obfuscator(PRESETS[preset]);

        // Obfuscate code
        console.log('🔄 Obfuscating...');
        const startTime = Date.now();
        const obfuscatedCode = obfuscator.obfuscate(inputCode);
        const endTime = Date.now();

        // Write output file
        fs.writeFileSync(outputFile, obfuscatedCode, 'utf-8');

        console.log(`✅ Output file: ${outputFile}`);
        console.log(`📦 Output size: ${obfuscatedCode.length} bytes`);
        console.log(`📊 Compression ratio: ${(obfuscatedCode.length / inputCode.length).toFixed(2)}x`);
        console.log(`⏱️  Time: ${endTime - startTime}ms`);
        console.log(`\n✨ Obfuscation complete!`);

    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        if (process.env.DEBUG) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

// Make it executable
if (require.main === module) {
    main();
}

module.exports = Obfuscator;
