module.exports = {
    root: true,
    env : {
        node  : true,
        es2017: true,
    },
    parser       : '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2019,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    rules: {
        /* Block style */
        'curly': [
            'error',
            'multi-or-nest',
            'consistent',
        ],
        'brace-style'                     : ['error', 'stroustrup'],
        'nonblock-statement-body-position': ['error', 'below'],

        /* Spacing */
        '@typescript-eslint/indent': ['error', 4],
        'no-multi-spaces'          : ['error', {
            ignoreEOLComments: true,
            exceptions       : {
                'Property'          : true,
                'VariableDeclarator': true,
                'ImportDeclaration' : true,
            },
        }],
        'array-bracket-spacing'               : 'error',
        'comma-spacing'                       : 'error',
        'func-call-spacing'                   : 'off',
        '@typescript-eslint/func-call-spacing': 'error',
        'key-spacing'                         : ['warn', { align: 'colon' }],
        'keyword-spacing'                     : 'error',
        'object-curly-spacing'                : ['error', 'always'],
        'space-before-blocks'                 : 'error',
        'space-before-function-paren'         : ['error', {
            named: 'never',
        }],
        'space-in-parens'              : 'error',
        'space-infix-ops'              : 'error',
        'space-unary-ops'              : 'error',
        'switch-colon-spacing'         : 'error',
        'template-tag-spacing'         : 'error',
        'arrow-spacing'                : 'error',
        'rest-spread-spacing'          : 'error',
        'template-curly-spacing'       : 'error',
        'no-trailing-spaces'           : 'error',
        'no-whitespace-before-property': 'error',

        /* Other style related rules */
        'arrow-body-style': 'error',
        'arrow-parens'    : ['error', 'as-needed', {
            requireForBlockBody: true,
        }],
        'comma-dangle'            : ['warn', 'always-multiline'],
        'comma-style'             : 'error',
        'one-var'                 : ['error', 'never'],
        'max-len'                 : ['warn', 100],
        'newline-per-chained-call': ['error', { ignoreChainWithDepth: 3 }],
        'linebreak-style'         : ['error', 'unix'],
        'eol-last'                : 'error',
        'semi'                    : 'off',
        '@typescript-eslint/semi' : 'error',

        /* Types */
        '@typescript-eslint/explicit-function-return-type': 'off',

        /* Non-compiled files */
        '@typescript-eslint/no-var-requires': 'off',
    },
    overrides: [
        /* Compiled files */
        {
            files: [
                "src/**/*.ts",
                "test/**/*.ts",
                "build/src/**/*.ts",
            ],
            rules: {
                '@typescript-eslint/no-var-requires': 'error',
            },
        },
        /* Tests */
        {
            files: [
                "test/**/*.ts",
            ],
            env: {
                "mocha": true,
            },
        },
    ],
};
