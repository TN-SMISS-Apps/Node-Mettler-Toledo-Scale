import { ReceiptContext, WeightSuccessResponse } from '../types';
import { BrowserWindow, app, dialog } from 'electron';
import { log } from '../utils/logger';
import { join } from 'path';
import { promises as fs } from 'fs';
import { mainWindow } from '../electron';
import bwipjs from 'bwip-js';
import ejs from 'ejs';

/**
 * main function for printing receiptss
 */
export const printReceipt = async (
  weight: WeightSuccessResponse,
  shouldPrintAdditionalText = true,
  shouldPrintBarcode = true
) => {
  const context: ReceiptContext = { ...weight, shouldPrintAdditionalText, shouldPrintBarcode };
  if (shouldPrintBarcode) {
    const barcode = await generateBarcode({ scale: 0.75 });
    context.barcode = barcode;
  }
  // render template
  ejs.renderFile(join(app.getAppPath(), 'dist/templates/receipt.ejs'), context, (err, data) => {
    if (err) return log(err);
    // create browser window
    const workerWindow: BrowserWindow | undefined = new BrowserWindow({
      show: false,
    });
    workerWindow.loadURL('data:text/html;charset=utf-8,' + encodeURI(data));
    // determine if there are any printers available (assuming no printers = dev env)
    const action = workerWindow.webContents.getPrinters().length > 0 ? sendToPrinter : saveAsPDF;
    // start printing
    workerWindow.webContents.on('did-finish-load', () => {
      action(workerWindow);
    });
  });
};

/**
 * sends window to default printer
 */
function sendToPrinter(workerWindow: BrowserWindow) {
  workerWindow.webContents.print({ silent: true, margins: { marginType: 'none' } }, (success, err) => {
    if (success) log('success');
    if (err) log('err', err);
    workerWindow.close();
  });
}

/**
 * saves window as pdf
 */
async function saveAsPDF(workerWindow: BrowserWindow) {
  const { filePath } = await dialog.showSaveDialog(mainWindow!, {
    filters: [{ name: 'receipt', extensions: ['pdf'] }],
  });
  if (filePath) {
    try {
      const pdfData = await workerWindow.webContents.printToPDF({});
      await fs.writeFile(filePath, pdfData);
      log('success');
    } catch (error) {
      log('err', error);
    }
  } else {
    log('cancelled');
  }
}

function generateBarcode({ text = '123456789012', scale = 1, height = 10 }): Promise<string> {
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
      }
    );
  });
}
