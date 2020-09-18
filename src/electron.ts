import { app, BrowserWindow, ipcMain } from 'electron';
import { app as expressApp } from './server';
import { PORT } from './config';
import { log } from './utils/logger';
import { scaleCommunicationService } from './services/ScaleCommunicationService';
import * as config from './config';

export let mainWindow: BrowserWindow | null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  expressApp.listen(PORT, () => {
    console.log('Listening on', PORT);
    console.log('version', '4.2.0');
  });

  mainWindow!.loadFile('dist/templates/electron.html');
  mainWindow.webContents.on('did-finish-load', () => {
    log(config);
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
