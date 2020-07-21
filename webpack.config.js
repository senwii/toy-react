const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

const IS_PRODUCTION = process.env.NODE_ENV !== 'development'

module.exports =  {
    mode: IS_PRODUCTION ? 'production' : 'development',
    entry: './main.js',
    output: {
        path: path.resolve('dist/'),
        filename: 'entry.[contenthash].js',
        chunkFilename: '[name].[contenthash].js',
    },
    devtool: 'source-map',
    devServer: {
        contentBase: path.resolve('dist/'),
        compress: true,
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                loader: 'babel-loader',
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            chunks: ['main'],
            template: path.resolve('public/index.html'),
        }),
    ]
}
