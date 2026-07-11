#!/usr/bin/env node

/**
 * Example LuaU Obfuscator Usage Script
 * Demonstrates how to use the obfuscator programmatically
 */

const Obfuscator = require('./src/obfuscator');
const fs = require('fs');
const path = require('path');

// Example 1: Simple obfuscation with default settings
console.log('='.repeat(60));
console.log('Example 1: Simple Obfuscation (Light Preset)');
console.log('='.repeat(60));

const simpleCode = `
local function greet(name)
    print("Hello, " .. name)
end

greet("World")
`;

const lightObfuscator = new Obfuscator({
    renameVariables: true,
    renameGlobals: false,
    stringEncryption: false,
    removeComments: true,
    controlFlow: false,
    deadCodeInjection: false
});

const lightResult = lightObfuscator.obfuscate(simpleCode);
console.log('\nOriginal:');
console.log(simpleCode);
console.log('\nObfuscated (Light):');
console.log(lightResult);

// Example 2: Medium obfuscation
console.log('\n' + '='.repeat(60));
console.log('Example 2: Medium Obfuscation');
console.log('='.repeat(60));

const mediumObfuscator = new Obfuscator({
    renameVariables: true,
    renameGlobals: true,
    stringEncryption: true,
    removeComments: true,
    controlFlow: true,
    constantFolding: true
});

const mediumResult = mediumObfuscator.obfuscate(simpleCode);
console.log('\nObfuscated (Medium):');
console.log(mediumResult);

// Example 3: Heavy obfuscation
console.log('\n' + '='.repeat(60));
console.log('Example 3: Heavy Obfuscation');
console.log('='.repeat(60));

const complexCode = `
local function fibonacci(n)
    if n <= 1 then
        return n
    end
    return fibonacci(n - 1) + fibonacci(n - 2)
end

-- Calculate fibonacci
for i = 1, 10 do
    local result = fibonacci(i)
    print("fib(" .. i .. ") = " .. result)
end
`;

const heavyObfuscator = new Obfuscator({
    renameVariables: true,
    renameGlobals: true,
    stringEncryption: true,
    removeComments: true,
    addJunkCode: true,
    controlFlow: true,
    constantFolding: true,
    deadCodeInjection: true,
    variableSplitting: true,
    arrayFlattening: true
});

const heavyResult = heavyObfuscator.obfuscate(complexCode);
console.log('\nOriginal:');
console.log(complexCode);
console.log('\nObfuscated (Heavy):');
console.log(heavyResult.substring(0, 500) + '...\n[TRUNCATED FOR DISPLAY]');

// Example 4: File-based obfuscation
console.log('='.repeat(60));
console.log('Example 4: File-Based Obfuscation');
console.log('='.repeat(60));

// Create a sample file
const sampleFile = 'sample_input.lua';
const sampleCode = `
local config = {
    apiUrl = "https://api.example.com",
    apiKey = "SECRET_KEY_12345",
    timeout = 5000,
    retries = 3
}

function makeRequest(endpoint, data)
    print("Sending request to: " .. config.apiUrl .. endpoint)
    return true
end

makeRequest("/users", {id = 1})
`;

if (!fs.existsSync(sampleFile)) {
    fs.writeFileSync(sampleFile, sampleCode);
    console.log(`\nCreated sample file: ${sampleFile}`);
}

const extremeObfuscator = new Obfuscator({
    renameVariables: true,
    renameGlobals: true,
    stringEncryption: true,
    removeComments: true,
    addJunkCode: true,
    controlFlow: true,
    constantFolding: true,
    deadCodeInjection: true,
    variableSplitting: true,
    arrayFlattening: true,
    functionWrapping: true
});

try {
    const fileObfuscated = extremeObfuscator.obfuscateFile(sampleFile);
    const outputFile = 'sample_output.lua';
    fs.writeFileSync(outputFile, fileObfuscated);
    console.log(`✓ Obfuscated file saved to: ${outputFile}`);
    console.log(`  Original size: ${sampleCode.length} bytes`);
    console.log(`  Obfuscated size: ${fileObfuscated.length} bytes`);
    console.log(`  Ratio: ${(fileObfuscated.length / sampleCode.length).toFixed(2)}x`);
} catch (error) {
    console.error(`Error: ${error.message}`);
}

console.log('\n' + '='.repeat(60));
console.log('Examples completed!');
console.log('='.repeat(60));
