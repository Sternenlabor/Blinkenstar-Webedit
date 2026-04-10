const babelParser = require('@babel/eslint-parser')

module.exports = [
    {
        files: ['src/**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            parser: babelParser,
            parserOptions: {
                requireConfigFile: false,
                sourceType: 'module',
                ecmaVersion: 'latest',
                ecmaFeatures: {
                    jsx: true
                },
                babelOptions: {
                    presets: ['@babel/preset-react', '@babel/preset-typescript']
                }
            },
            globals: {
                require: 'readonly',
                __PROD__: 'readonly',
                __DEV__: 'readonly',
                global: 'readonly',
                BASE_URL: 'readonly'
            }
        },
        rules: {
            'max-lines': 'off',
            'no-unused-vars': 'off'
        }
    }
]
