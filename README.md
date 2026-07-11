# LuaU Obfuscator

A comprehensive Lua/LuaU obfuscator built in Node.js for Roblox development. This tool transforms readable Lua code into heavily obfuscated versions while maintaining functionality.

## Features

- **Name Obfuscation**: Renames variables, functions, and parameters to meaningless identifiers
- **String Encryption**: Encodes string literals with a decoder function
- **Control Flow Obfuscation**: Wraps code in dummy conditionals to complicate analysis
- **Comment Removal**: Strips all comments from the code
- **Lexer & Parser**: Full tokenization and AST-based transformation pipeline
- **Code Generator**: Converts transformed AST back to valid Lua code

## Installation

```bash
npm install
```

## Usage

### Command Line

```javascript
const Obfuscator = require('./src/obfuscator');

const obfuscator = new Obfuscator({
    renameVariables: true,
    stringEncryption: true,
    removeComments: true,
    addJunkCode: false,
    controlFlow: true
});

// Obfuscate code string
const code = `
local function greet(name)
    print("Hello, " .. name)
end

greet("World")
`;

const obfuscatedCode = obfuscator.obfuscate(code);
console.log(obfuscatedCode);
```

### Obfuscate a File

```javascript
const obfuscatedCode = obfuscator.obfuscateFile('script.lua');
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `renameVariables` | boolean | `true` | Rename local variables |
| `renameGlobals` | boolean | `true` | Rename global functions |
| `stringEncryption` | boolean | `true` | Encrypt string literals |
| `removeComments` | boolean | `true` | Remove all comments |
| `addJunkCode` | boolean | `false` | Add non-functional junk code |
| `controlFlow` | boolean | `true` | Add control flow obfuscation |
| `constantFolding` | boolean | `false` | Simplify constant expressions |

## Architecture

### Components

1. **Lexer** (`src/lexer.js`)
   - Tokenizes Lua/LuaU source code
   - Handles strings, numbers, identifiers, operators, and keywords
   - Preserves line and column information for debugging

2. **Parser** (`src/parser.js`)
   - Builds an Abstract Syntax Tree (AST) from tokens
   - Supports full Lua syntax including tables, functions, and control flow
   - Generates an in-memory representation for transformation

3. **Transformations** (`src/transformations/`)
   - **nameObfuscator.js**: Renames identifiers and tracks scope
   - **stringEncoder.js**: Encodes string literals with decoder
   - **controlFlow.js**: Wraps statements in dummy conditionals

4. **Code Generator** (`src/codeGenerator.js`)
   - Traverses the AST and generates Lua code
   - Handles indentation and formatting
   - Preserves code semantics

### Transformation Pipeline

```
Source Code
    ↓
Lexer (Tokenization)
    ↓
Parser (AST Generation)
    ↓
Name Obfuscator
    ↓
String Encoder
    ↓
Control Flow Transformer
    ↓
Code Generator
    ↓
Obfuscated Code
```

## Example

**Input:**
```lua
local function greet(name)
    print("Hello, " .. name)
    return name
end

local message = "World"
greet(message)
```

**Output:**
```lua
local __obf_s = (function()
    local __obf_t = {}
    local __obf_f = function(s)
        if __obf_t[s] then return __obf_t[s] end
        local result = ''
        for i = 1, #s do
            local b = string.byte(s, i)
            result = result .. string.char((b + 42) % 256)
        end
        __obf_t[s] = result
        return result
    end
    return __obf_f
end)()
function a(b)
    if b == b then
        print(__obf_s("encoded_hello"))
        return b
    end
end
local c = __obf_s("encoded_world")
a(c)
```

## Testing

Run the test suite:

```bash
node test.js
```

The test suite includes:
- Simple variable assignments
- Function declarations
- String literals
- Control flow statements
- Loops
- Tables
- Comments
- Anonymous functions
- Method calls
- Complex expressions

## Limitations

- Does not support Lua 5.2+ GoTo statements
- String escape sequences are limited
- Multiline comments in strings may have issues
- Some advanced metatable operations may not parse correctly

## Performance

- Typical obfuscation speed: 1-5ms per KB of code
- Memory usage: ~10-20x the size of input code (due to AST)
- Optimized for code clarity, not production performance

## Security Notes

This obfuscator provides:
- **Readability obfuscation** - Makes code harder to understand at a glance
- **Basic decompilation protection** - Makes decompilation tools less useful

This obfuscator does NOT provide:
- **Cryptographic security** - Determined reversing can still extract original logic
- **Protection against dumps** - Runtime memory dumps can reveal deobfuscated code
- **Watermarking/License checking** - No built-in protection against copying

## License

MIT

## Contributing

Feel free to submit issues and pull requests to improve the obfuscator!

## Disclaimer

Use this tool responsibly. Do not use it for malicious purposes or to obfuscate malware.
