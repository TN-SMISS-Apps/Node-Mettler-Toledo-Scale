'use strict';
const path = require('path');

const { app } = require('electron');

const p = path.resolve(__dirname, '../../dist');

const bytenode = require('bytenode');

const v8 = require('v8');

v8.setFlagsFromString('--no-lazy');

bytenode.compileFile(p + '/bundle.js', p + '/electron.jsc');

app.quit();
