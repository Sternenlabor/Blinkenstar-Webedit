module.exports = {
    root: true,
    env: {
        browser: true,
        es2022: true,
        node: true
    },
    parser: '@babel/eslint-parser',
    parserOptions: {
        requireConfigFile: false,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true
        },
        babelOptions: {
            presets: ['@babel/preset-react', '@babel/preset-typescript']
        }
    },
    globals: {
        require: false,
        __PROD__: false,
        __DEV__: false,
        global: false,
        BASE_URL: false
    },
    rules: {
        'max-lines': 0,
        'no-unused-vars': 'off'
    }
}
