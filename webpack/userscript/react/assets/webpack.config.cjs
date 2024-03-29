// Generated using webpack-cli https://github.com/webpack/webpack-cli
const webpack = require('webpack');
const path = require('path');
const { readFileSync } = require('fs');
const TerserPlugin = require('terser-webpack-plugin');
const isProduction = process.env.NODE_ENV == 'production';

const banner = '*/\n' + String(readFileSync('gm.header')) + '\n/*';

const config = {
  entry: {
    index: './src/main.tsx'
  },
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].user.js'
  },
  optimization: {
    minimizer: [new TerserPlugin({
      terserOptions: {
        compress: true,
      },
      extractComments: {
        condition: 'all',
        banner: banner,
      }
    })]
  },
  plugins: [
    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
    new webpack.BannerPlugin({
      raw: true,
      banner: `/*! ${banner} */`,
    })
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/i,
        loader: 'ts-loader',
        exclude: ['/node_modules/'],
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader',
        ],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
      },

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx'],
  },
};

module.exports = () => {
    if (isProduction) {
        config.mode = 'production';
    } else {
        config.mode = 'development';
    }
    return config;
};
