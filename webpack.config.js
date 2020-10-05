const path = require('path');
const cp = require('child_process');
const fs = require('fs');
const CopyPlugin = require('copy-webpack-plugin');

const DIST_PATH = path.resolve(__dirname, 'dist');
const BUNDLE_PATH = DIST_PATH + '/bundle.js';

class BytenodeCompilerPlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    compiler.hooks.done.tap('BytenodeCompilerPlugin', async (params) => {
      // check if files compiled
      try {
        await fs.promises.stat(BUNDLE_PATH);
      } catch (error) {
        return console.log(error);
      }

      // compile to bc
      cp.execSync('npm run compile:bytenode');
      console.log('COMPILED BYTENODE');
    });
  }
}

module.exports = {
  entry: {
    bundle: './src/electron.ts',
  },
  target: 'electron-main',
  externals: {
    express: 'require("express")',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new BytenodeCompilerPlugin(),
    new CopyPlugin({
      patterns: [
        { from: './src/templates', to: './templates' },
        { from: './src/build-utils/run-bytenode.js', to: './run-bytenode.js' },
      ],
      options: {
        concurrency: 100,
      },
    }),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: DIST_PATH,
  },
};
