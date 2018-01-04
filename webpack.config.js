const webpack = require('webpack');
const path = require('path');

const SRC = './src';
const HTDOCS = './public';
const BASE_PATH = '';
const DEST = `${HTDOCS}${BASE_PATH}`;


module.exports = {
    entry: [
        `${SRC}/js/script.js`,
    ],
    output: {
        path:     path.resolve(__dirname, `${DEST}/js`),
        publicPath: `${DEST}/js`,
        filename: 'script.js'
    },
    devtool: 'source-map',

    module: {
        rules: [
            {
                test:    /\.js$/,
                exclude: /node_modules(?!\/webpack-dev-server)/,
                loader:  'babel-loader',
                options: {
                    presets: [
                        ['es2015']
                    ]
                }
            }
        ]
    },

    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true
        }),
    ],
};

