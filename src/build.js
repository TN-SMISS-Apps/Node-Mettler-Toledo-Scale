const electronInstaller = require('electron-winstaller');
const path = require('path');
const { version, author, description } = require('../package');

const settings = {
  appDirectory: './release/node-mt-middleware-win32-x64',
  // Specify the existing folder where
  outputDirectory: './exes',
  authors: author,
  description,
  // The name of the executable of your built
  exe: `./Node-mt-middleware.exe`,
//   setupIcon: './assets/favicon.ico',
  version,
  setupExe: `Node-mt-middleware-v${version}.exe`,
  noMsi: true,
};

(async function () {
  try {
    await electronInstaller.createWindowsInstaller(settings);
    console.log('exe created successfully');
  } catch (e) {
    console.log(e);
  }
})();
