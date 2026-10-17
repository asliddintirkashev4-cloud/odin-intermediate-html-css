const path = require('node:path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'restaurant.bundle.js',
    clean: true,
    publicPath: '',
  },
  module: {
    rules: [
      {test: /\.css$/i, use: ['style-loader', 'css-loader']},
      {test: /\.svg$/i, type: 'asset/inline'},
    ],
  },
  plugins: [new HtmlWebpackPlugin({template: './src/template.html', filename: 'index.html'})],
  devServer: {port: 8080, hot: true},
};
