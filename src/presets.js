/**
 * Obfuscation Presets
 * Pre-configured settings for different obfuscation levels
 */

const PRESETS = {
    light: {
        renameVariables: true,
        renameGlobals: false,
        stringEncryption: false,
        removeComments: true,
        addJunkCode: false,
        controlFlow: false,
        constantFolding: false,
        deadCodeInjection: false,
        variableSplitting: false,
        arrayFlattening: false,
        functionWrapping: false,
        propertyObfuscation: false
    },

    medium: {
        renameVariables: true,
        renameGlobals: true,
        stringEncryption: true,
        removeComments: true,
        addJunkCode: false,
        controlFlow: true,
        constantFolding: true,
        deadCodeInjection: false,
        variableSplitting: false,
        arrayFlattening: false,
        functionWrapping: false,
        propertyObfuscation: false
    },

    heavy: {
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
        functionWrapping: false,
        propertyObfuscation: true
    },

    extreme: {
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
        functionWrapping: true,
        propertyObfuscation: true
    },

    debug: {
        renameVariables: false,
        renameGlobals: false,
        stringEncryption: false,
        removeComments: false,
        addJunkCode: false,
        controlFlow: false,
        constantFolding: false,
        deadCodeInjection: false,
        variableSplitting: false,
        arrayFlattening: false,
        functionWrapping: false,
        propertyObfuscation: false
    }
};

module.exports = { PRESETS };
