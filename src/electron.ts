import { app, BrowserWindow, ipcMain } from 'electron';
import * as config from './config';
import { PORT } from './config';
import { app as expressApp } from './server';
import { scaleCommunicationService } from './services/ScaleCommunicationService';
import { log } from './utils/logger';
const { version } = require('../package');

export let mainWindow: BrowserWindow | null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow!.loadFile('dist/templates/electron.html');
  mainWindow.webContents.on('did-finish-load', () => {
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
}

ipcMain.on('connection-toggle', (_, { isConnected }) => {
  if (isConnected) {
    scaleCommunicationService.init();
  } else {
    scaleCommunicationService.destroy();
  }
});

app.whenReady().then(createWindow);
