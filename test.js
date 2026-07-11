/**
 * Test Suite for LuaU Obfuscator
 */

const Obfuscator = require('./src/obfuscator');

// Test cases
const testCases = [
    {
        name: 'Simple Variable Assignment',
        code: `local x = 10
local y = 20
local z = x + y
print(z)`
    },
    {
        name: 'Function Declaration',
        code: `local function add(a, b)
    return a + b
end

local result = add(5, 10)
print(result)`
    },
    {
        name: 'String Literals',
        code: `local greeting = "Hello, World!"
local name = "Alice"
print(greeting .. " " .. name)`
    },
    {
        name: 'Control Flow',
        code: `local x = 10
if x > 5 then
    print("x is greater than 5")
else
    print("x is less than or equal to 5")
end`
    },
    {
        name: 'Loop',
        code: `for i = 1, 5 do
    print(i)
end`
    },
    {
        name: 'Table',
        code: `local tbl = {
    x = 10,
    y = 20,
    ["z"] = 30
}
print(tbl.x)`
    },
    {
        name: 'Comments',
        code: `-- This is a comment
local x = 10 -- inline comment
print(x) -- print x`
    },
    {
        name: 'Anonymous Function',
        code: `local fn = function(x)
    return x * 2
end

print(fn(5))`
    },
    {
        name: 'Method Call',
        code: `local obj = {}
function obj:method()
    return "Hello"
end

print(obj:method())`
    },
    {
        name: 'Complex Expression',
        code: `local a = 5
local b = 10
local c = a + b * 2 - (a / 2)
print(c)`
    }
];

// Run tests
function runTests() {
    console.log('='.repeat(80));
    console.log('LuaU Obfuscator Test Suite');
    console.log('='.repeat(80));
    console.log();

    const obfuscator = new Obfuscator({
        renameVariables: true,
        stringEncryption: true,
        removeComments: true,
        addJunkCode: false,
        controlFlow: true
    });

    testCases.forEach((testCase, index) => {
        console.log(`Test ${index + 1}: ${testCase.name}`);
        console.log('-'.repeat(80));
        
        try {
            const obfuscated = obfuscator.obfuscate(testCase.code);
            
            console.log('Original:');
            console.log(testCase.code);
            console.log();
            
            console.log('Obfuscated:');
            console.log(obfuscated);
            console.log();
            
            // Check that obfuscated code is different
            if (obfuscated !== testCase.code) {
                console.log('✓ Code was obfuscated successfully');
            } else {
                console.log('✗ Code was NOT obfuscated (possible error)');
            }
        } catch (error) {
            console.log(`✗ Test failed with error: ${error.message}`);
        }
        
        console.log();
        console.log('='.repeat(80));
        console.log();
    });

    // Test with file
    console.log('File Obfuscation Test');
    console.log('-'.repeat(80));
    
    const fs = require('fs');
    const testFile = 'test_code.lua';
    const testContent = `local function fibonacci(n)
    if n <= 1 then
        return n
    end
    return fibonacci(n - 1) + fibonacci(n - 2)
end

for i = 1, 10 do
    print(fibonacci(i))
end`;

    fs.writeFileSync(testFile, testContent);

    try {
        const obfuscated = obfuscator.obfuscateFile(testFile);
        console.log('Original File Content:');
        console.log(testContent);
        console.log();
        
        console.log('Obfuscated File Content:');
        console.log(obfuscated);
        console.log();
        
        // Save obfuscated version
        const obfuscatedFile = 'test_code_obfuscated.lua';
        fs.writeFileSync(obfuscatedFile, obfuscated);
        console.log(`✓ Obfuscated code saved to: ${obfuscatedFile}`);
    } catch (error) {
        console.log(`✗ File obfuscation failed: ${error.message}`);
    } finally {
        fs.unlinkSync(testFile);
    }
}

// Run tests
runTests();
