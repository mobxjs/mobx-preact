module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "jest/globals": true
    },
    "globals": {
        "process": true
    },
    "extends": ["eslint:recommended", "plugin:react/recommended"],
    "parser": "babel-eslint",
    "parserOptions": {
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true,
            "jsx": true
        },
        "sourceType": "module"
    },
    "plugins": [
        "react",
        "jest",
    ],
    "settings": {
        "react": {
            "pragma": "h"
        }
    },
    "rules": {
        "curly" : [
            "error", "all"
        ],
        "brace-style": [
            1, "1tbs", {
            "allowSingleLine": false
        }
        ],
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-unused-vars": [
            "error",
            { "varsIgnorePattern": "^h$" }
        ],
        "comma-dangle": [
            "error",
            "always-multiline"
        ],
        "no-multiple-empty-lines" : [
            "error",
            { max: 1 }
        ],
        "padded-blocks" : [
            "error",
            { "blocks" : "never" }
        ],
        "react/forbid-component-props": [
            "off"
        ],
        "react/no-unknown-property" : [
            "off"
        ],
        "react/prop-types" : [
            "off"
        ],
        "react/jsx-key" : [
            "off"
        ],
        "react/display-name" : [
            "off"
        ],
        "react/no-direct-mutation-state" : [
            "warn"
        ]
    }
};