const path = require('path');
const cp = require('child_process');
const fs = require('fs');

const DIST_PATH = path.resolve(__dirname, 'dist');
const BUNDLE_NAME = 'bundle.js';
const BUNDLE_PATH = DIST_PATH + '/' + BUNDLE_NAME;

class BytenodeCompilerPlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    compiler.hooks.done.tap('BytenodeCompilerPlugin', async (params) => {
      try {
        await fs.promises.stat(BUNDLE_PATH);
        cp.execSync('npm run compile:bytenode');
        await fs.promises.unlink(BUNDLE_PATH);
        console.log('COMPILED BYTENODE');
      } catch (error) {
        console.log(error);
        console.log('NO BUNDLE FOUND');
      }
    });
  }
}

module.exports = {
  entry: './src/electron.ts',
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
  plugins: [new BytenodeCompilerPlugin()],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: BUNDLE_NAME,
    path: DIST_PATH,
  },
};
