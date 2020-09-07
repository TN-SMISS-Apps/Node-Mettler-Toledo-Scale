import { WeightSuccessResponse } from '../types';
import { BrowserWindow } from 'electron';
import bwipjs from 'bwip-js';
import ejs from 'ejs';

export const printReceipt = async (
  weight: WeightSuccessResponse,
  shouldPrintAdditionalText = false,
) => {
  // const barcode = await generateBarcode({ scale: 2 });
  ejs.renderFile(
    'dist/templates/receipt.ejs',
    { ...weight, shouldPrintAdditionalText },
    (err, data) => {
      if (err) {
        console.log(err);
      }
      const workerWindow: BrowserWindow | undefined = new BrowserWindow({ show: false });
      workerWindow.loadURL('data:text/html;charset=utf-8,' + encodeURI(data));
      workerWindow.webContents.on('did-finish-load', () => {
        workerWindow.webContents.print(
          { silent: true, margins: { marginType: 'none' } },
          (success, err) => {
            if (success) console.log('success');
            if (err) console.log('err', err);
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
          console.log(err);
        } else {
          resolve('data:image/png;base64,' + buffer.toString('base64'));
        }
      },
    );
  });
}
