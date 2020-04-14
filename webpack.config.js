const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  target: 'node',
  output: {
    filename: 'journal',
    path: path.resolve(__dirname, 'dist/'),
  },
  plugins: [
    new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
  ],
  node: {
    __dirname: false,
  },
};
