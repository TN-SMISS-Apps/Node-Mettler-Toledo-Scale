import { WeightSuccessResponse } from '../types';
import { BrowserWindow, app } from 'electron';
import bwipjs from 'bwip-js';
import ejs from 'ejs';
import { log } from '../utils/logger';
import { join } from 'path';

export const printReceipt = async (
  weight: WeightSuccessResponse,
  shouldPrintAdditionalText = true,
) => {
  // const barcode = await generateBarcode({ scale: 2 });
  ejs.renderFile(
    join(app.getAppPath(), 'dist/templates/receipt.ejs'),
    { ...weight, shouldPrintAdditionalText },
    (err, data) => {
      if (err) {
        log(err);
      }
      const workerWindow: BrowserWindow | undefined = new BrowserWindow({ show: false });
      workerWindow.loadURL('data:text/html;charset=utf-8,' + encodeURI(data));
      workerWindow.webContents.on('did-finish-load', () => {
        workerWindow.webContents.print(
          { silent: true, margins: { marginType: 'none' } },
          (success, err) => {
            if (success) log('success');
            if (err) log('err', err);
            workerWindow.close();
          },
        );
      });
    },
  );
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
          log(err);
        } else {
          resolve('data:image/png;base64,' + buffer.toString('base64'));
        }
      },
    );
  });
}
