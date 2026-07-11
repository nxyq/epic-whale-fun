const Obfuscator = require('./src/obfuscator');
const fs = require('fs');
const path = require('path');

// Example usage
const exampleCode = `
local function greet(name)
    print("Hello, " .. name)
    return name
end

local message = "World"
greet(message)
`;

const obfuscator = new Obfuscator({
    renameVariables: true,
    stringEncryption: true,
    removeComments: true,
    addJunkCode: true,
    controlFlow: true
});

const obfuscatedCode = obfuscator.obfuscate(exampleCode);
console.log("=== Original Code ===");
console.log(exampleCode);
console.log("\n=== Obfuscated Code ===");
console.log(obfuscatedCode);

module.exports = Obfuscator;
