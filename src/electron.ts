import { app, BrowserWindow, ipcMain } from 'electron';
import * as config from './config';
import { PORT } from './config';
import { app as expressApp } from './server';
import { scaleCommunicationService } from './services/ScaleCommunicationService';
import { log } from './utils/logger';
const { version } = require('../package');

export let mainWindow: BrowserWindow | null;

function createApplicationWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    title: `Faktura Modul HF ScaIF v${version}`,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow!.loadFile('dist/templates/electron.html');
  mainWindow.webContents.once('did-finish-load', () => {
    log(config);
    expressApp.listen(PORT, () => {
      log('API listening on', PORT);
      log('version', version);
    });
    scaleCommunicationService.init();
  });

  mainWindow!.on('closed', function () {
    mainWindow = null;
    app.quit();
  });

  ipcMain.on('connection-toggle', (_, { isConnected }) => {
    isConnected ? scaleCommunicationService.init() : scaleCommunicationService.destroy();
  });
}

function createLoadingScreen() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 550,
    title: `Faktura Modul HF ScaIF v${version}`,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  mainWindow!.loadFile('dist/templates/loadingScreen.html');
  mainWindow!.on('closed', function () {
    mainWindow = null;
    app.quit();
  });
}

app.whenReady().then((_) => {
  const hasSquirrelEvents = process.argv.some((arg) => arg.includes('--squirrel'));
  // if no events => dev environment or regular run
  if (!hasSquirrelEvents) {
    createApplicationWindow();
    // else production env
  } else {
    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
      case '--squirrel-install':
        return createLoadingScreen();
      case '--squirrel-firstrun':
        return createApplicationWindow();
      default:
        // not sure if this will be required
        return createApplicationWindow();
    }
  }
});
