import { app, BrowserWindow } from 'electron';
import { app as expressApp } from './server';
import { PORT } from './config';
import { printReceipt } from './utils/printer';

function createWindow() {
  let win: BrowserWindow | null = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  expressApp.listen(PORT, () => {
    console.log('Listening on', PORT);
    console.log('version', '4.0.0');
  });

  // TODO: path?
  win.loadFile('dist/templates/electron.html');
  // win.hide();

  const exampleWeightResponse = {
    scale_status: '',
    selling_price: 0.75,
    unit_price: 4.22,
    weight: 0.178,
  };
  
  printReceipt(exampleWeightResponse)


  win.on('closed', function () {
    win = null;
    app.quit();
  });
}


app.whenReady().then(createWindow);
