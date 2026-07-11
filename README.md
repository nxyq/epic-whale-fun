# LuaU Obfuscator - Advanced Edition

A powerful, feature-rich Lua/LuaU code obfuscator for Roblox development with multiple obfuscation presets and advanced transformations.

## 🎯 Features

- **Name Obfuscation**: Renames variables, functions, and parameters
- **String Encryption**: Encodes strings with decoder function
- **Control Flow Obfuscation**: Wraps code in dummy conditionals
- **Dead Code Injection**: Adds unreachable code blocks
- **Variable Splitting**: Decomposes variables into multiple operations
- **Array Flattening**: Converts tables into separate statements
- **Function Wrapping**: Wraps functions with closure layers
- **Property Obfuscation**: Obfuscates table property access
- **Junk Code Generation**: Generates realistic-looking unused code
- **Constant Folding**: Simplifies constant expressions
- **Comment Removal**: Strips all comments
- **Full Lua Support**: Complete lexer/parser for Lua syntax

## 📦 Installation

```bash
npm install
```

## 🚀 Quick Start

### Command Line Usage

```bash
# Using default preset (medium)
node index.js input.lua

# With specific preset
node index.js --preset heavy input.lua output.lua

# Custom output filename
node index.js --preset extreme input.lua obfuscated.lua
```

### Presets

| Preset | Features | Use Case |
|--------|----------|----------|
| **light** | Name renaming + comments removed | Minimal obfuscation |
| **medium** | + String encryption + Control flow | Balanced protection |
| **heavy** | + Dead code + Variable splitting + Junk | Strong protection |
| **extreme** | + Array flattening + Function wrapping | Maximum protection |
| **debug** | No transformations | Testing/debugging |

### Programmatic Usage

```javascript
const Obfuscator = require('./src/obfuscator');

const obfuscator = new Obfuscator({
    renameVariables: true,
    renameGlobals: true,
    stringEncryption: true,
    controlFlow: true,
    deadCodeInjection: true,
    variableSplitting: true,
    arrayFlattening: true,
    functionWrapping: true,
    propertyObfuscation: true,
    addJunkCode: true
});

const code = `
local function add(a, b)
    return a + b
end
local result = add(5, 10)
print(result)
`;

const obfuscated = obfuscator.obfuscate(code);
console.log(obfuscated);
```

## 📋 Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `renameVariables` | boolean | `true` | Rename local variables |
| `renameGlobals` | boolean | `true` | Rename global functions |
| `stringEncryption` | boolean | `true` | Encrypt string literals |
| `removeComments` | boolean | `true` | Remove all comments |
| `addJunkCode` | boolean | `false` | Add non-functional code |
| `controlFlow` | boolean | `true` | Add control flow obfuscation |
| `constantFolding` | boolean | `true` | Simplify constants |
| `deadCodeInjection` | boolean | `false` | Inject unreachable code |
| `variableSplitting` | boolean | `false` | Split variable assignments |
| `arrayFlattening` | boolean | `false` | Flatten tables |
| `functionWrapping` | boolean | `false` | Wrap functions |
| `propertyObfuscation` | boolean | `false` | Obfuscate property access |

## 🏗️ Architecture

### Components

1. **Lexer** (`src/lexer.js`)
   - Tokenizes Lua/LuaU code
   - Handles all Lua syntax elements
   - Tracks line/column information

2. **Parser** (`src/parser.js`)
   - Builds Abstract Syntax Tree (AST)
   - Full Lua grammar support
   - Error recovery

3. **Transformations** (`src/transformations/`)
   - `nameObfuscator.js` - Variable/function renaming
   - `stringEncoder.js` - String encryption with decoder
   - `controlFlow.js` - Dummy conditionals
   - `deadCodeInjection.js` - Unreachable code blocks
   - `variableSplitting.js` - Decompose assignments
   - `arrayFlattening.js` - Table to statements
   - `functionWrapping.js` - Closure wrapping
   - `propertyObfuscation.js` - Property access obfuscation
   - `junkCode.js` - Generate fake code
   - `constantFolding.js` - Optimize constants

4. **Code Generator** (`src/codeGenerator.js`)
   - Generates Lua from AST
   - Proper formatting/indentation
   - Semantic preservation

### Transformation Pipeline

```
Source Code
    ↓
Lexer (Tokenization)
    ↓
Parser (AST)
    ↓
Constant Folding
    ↓
Name Obfuscation
    ↓
Property Obfuscation
    ↓
Variable Splitting
    ↓
Array Flattening
    ↓
String Encryption
    ↓
Control Flow
    ↓
Dead Code Injection
    ↓
Junk Code Generation
    ↓
Function Wrapping
    ↓
Code Generator
    ↓
Obfuscated Code
```

## 🧪 Testing

```bash
node test.js
```

Tests cover:
- Variable assignments
- Functions
- Strings & tables
- Control flow
- Loops
- Complex expressions

## ⚙️ CLI Options

```bash
node index.js --help
```

Shows all available presets and options.

## 📈 Performance

- **Speed**: 1-10ms per KB
- **Compression Ratio**: 1.0-3.0x
- **Memory**: ~10-20x input size (AST overhead)

## 🔒 Security Notes

**Provides:**
- Readability obfuscation
- Basic decompilation resistance
- Variable name hiding
- String encryption

**Does NOT provide:**
- Cryptographic security
- Runtime memory protection
- Malware embedding
- Watermarking

## 🛠️ Advanced Usage

### Custom Presets

```javascript
const Obfuscator = require('./src/obfuscator');

const custom = new Obfuscator({
    renameVariables: true,
    stringEncryption: true,
    deadCodeInjection: true,
    functionWrapping: false
});

const result = custom.obfuscate(code);
```

### File Processing

```javascript
const obfuscator = new Obfuscator({ /* options */ });
const result = obfuscator.obfuscateFile('input.lua');
fs.writeFileSync('output.lua', result);
```

## 📝 Examples

See `examples/` directory for:
- Simple scripts
- Complex functions
- Table operations
- Method calls

## 🐛 Debugging

Enable debug mode:
```bash
DEBUG=1 node index.js --preset debug input.lua
```

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please ensure:
- Code follows existing style
- Tests pass
- Features are documented

## ⚠️ Disclaimer

Use responsibly. This tool is for:
- ✅ Protecting your own code
- ✅ Learning obfuscation techniques
- ✅ Academic research

Do NOT use for:
- ❌ Obfuscating malware
- ❌ Bypassing security measures
- ❌ Malicious purposes
