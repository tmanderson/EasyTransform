const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

const babelrc = JSON.parse(fs.readFileSync('./.babelrc'));

const PRODUCTION_BUILD = /^prod/i.test(process.env.NODE_ENV);

module.exports = {
  target: 'web',
  devtool: PRODUCTION_BUILD ? 'nosources-source-map' : 'cheap-module-eval-source-map',

  context: __dirname,
  entry: './src/index.js',

  resolve: {
    extensions: ['.js', '.jsx', '.scss'],
    modules: [path.resolve(__dirname, 'node_modules'), path.resolve(__dirname, 'client')],
  },

  output: {
    filename: 'easytransform.js',
    library: 'EZT',
    libraryTarget: 'window',
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
  plugins:
    PRODUCTION_BUILD ? [
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
      }),
      new webpack.optimize.UglifyJsPlugin({
        beautify: false,
        mangle: {
          screw_ie8: true,
          keep_fnames: true
        },
        compress: {
          screw_ie8: true
        },
        comments: false
      })
    ] : [],
};
