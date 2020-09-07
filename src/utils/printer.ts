import { WeightSuccessResponse } from '../types';
import { BrowserWindow } from 'electron';
import bwipjs from 'bwip-js';
import ejs from 'ejs';

export const printReceipt = async (weight: WeightSuccessResponse) => {
  const barcode = await generateBarcode({scale: 2});
  ejs.renderFile('dist/templates/receipt.ejs', { ...weight, barcode }, (err, data) => {
    if (err) {
      console.log(err);
    }
    const workerWindow: BrowserWindow | undefined = new BrowserWindow({ show: false });
    workerWindow.loadURL('data:text/html;charset=utf-8,' + encodeURI(data));
    workerWindow.webContents.on('did-finish-load', () => {
      workerWindow.webContents.printToPDF({}).then((buf) => {
        const fs = require('fs').promises;
        fs.writeFile('testik.pdf', buf).then(console.log).catch(console.log);
      });
    });
  });
};

function generateBarcode({ text = '123456789012', scale = 1, height = 10 }) {
  return new Promise((resolve, reject) => {
    bwipjs.toBuffer(
      {
        bcid: 'ean13',
        text,
        scale,
        height,
        includetext: true,
        textxalign: 'center',
      },
      (err, buffer) => {
        if (err) {
          reject(err);
          console.log(err);
        } else {
          resolve('data:image/png;base64,' + buffer.toString('base64'));
        }
      },
    );
  });
}