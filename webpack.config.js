const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
var WatchIgnorePlugin = require('watch-ignore-webpack-plugin')

const babelrc = JSON.parse(fs.readFileSync('./.babelrc'));

module.exports = {
  target: 'web',
  devtool: 'eval',

  context: __dirname,
  entry: './src/index.js',

  resolve: {
    extensions: ['.js', '.jsx', '.scss'],
    modules: [path.resolve(__dirname, 'node_modules'), path.resolve(__dirname, 'client')],
  },

  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: path.resolve(__dirname, 'node_modules'),
        options: {
          "presets": [
            ["env", {
              "modules": false,
              "loose": true
            }],
            "react",
          ],
          "plugins": babelrc.plugins
        }
      },
      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: {
              modules: true,
              camelCase: true,
              localIdentName: '[path][name]__[local]--[hash:base64:5]',
              importLoaders: 1,
            }
          },
          {
            loader: 'sass-loader',
            options: {
              includePaths: [
                path.resolve(__dirname, './assets/styles')
              ],
            }
          },
        ]
      },
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      '__DEV__': true,
    }),
  ],
};
