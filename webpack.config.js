/* eslint no-sync: 0, no-undef: 0 */
const path = require('path')
const webpack = require('webpack')
const fs = require('fs')
const dotenv = require('dotenv')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')

const nodeEnv = (process.env.NODE_ENV || 'development').trim()
const envFile = `.env.${nodeEnv}`
const envVars = fs.existsSync(envFile) ? dotenv.config({ path: envFile }).parsed : {}
const envKeys = Object.keys(envVars).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(envVars[next])
    return prev
}, {})

const __DEV__ = nodeEnv !== 'production'

const clientApiUrl = process.env.API_URL || '/api'

// Use "source-map" (without the leading '#') which is the valid devtool value in webpack 5.
const devtool = __DEV__ ? 'source-map' : false

const plugins = [
    new webpack.DefinePlugin({
        // spread your dotenv vars (if any), then override/add API_URL from cross-env:
        ...envKeys,
        'process.env.API_URL': JSON.stringify(clientApiUrl),
        __DEV__: JSON.stringify(__DEV__),
        __PROD__: JSON.stringify(!__DEV__),
        BASE_URL: JSON.stringify(`${process.env.BASE_URL || ''}`),
        HOST: JSON.stringify(`${process.env.HOST || ''}`)
    }),
    new HtmlWebpackPlugin({
        filename: 'index.html',
        template: 'src/index.html',
        minify: {},
        inject: 'body',
        hash: true
    }),
    new FaviconsWebpackPlugin({
        logo: 'src/assets/logo.png', // your “master” logo
        mode: 'webapp', // generate a full webapp manifest
        devMode: 'webapp', // same in dev
        cache: true, // speed up rebuilds
        inject: true, // auto-inject <link> tags into HtmlWebpackPlugin
        prefix: 'icons/[fullhash]/', // optional sub-folder
        publicPath: '/'
    })
]

module.exports = {
    mode: nodeEnv,
    context: __dirname,
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        // allow imports without a '.js' extension
        fullySpecified: false,
        modules: [path.resolve('src'), 'node_modules'],
        alias: {}
    },
    entry: ['core-js/stable', './src/index.js'],
    output: {
        path: path.resolve('public'),
        filename: 'app-[fullhash].js',
        publicPath: `${process.env.BASE_URL || '/'}`
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                resolve: {
                    fullySpecified: false
                }
            },
            {
                test: /\.jsx?$/,
                exclude: /(node_modules|primusClient)/,
                loader: 'babel-loader',
                options: { cacheDirectory: true }
            },
            {
                // Leave inline-css-loader rule as is.
                test: /\.(CSS|css)\.js$/,
                exclude: /(node_modules)/,
                loader: 'inline-css-loader'
            },
            { test: /\.pdf$/, loader: 'file-loader' },
            { test: /\.(eot|ttf|otf|woff2?)(\?.*)?$/, loader: 'file-loader' },
            { test: /\.(jpg|png|gif|jpeg|ico)$/, loader: 'url-loader' },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            { test: /\.svg$/, loader: 'svg-inline-loader' }
        ]
    },
    plugins,
    devtool
}
