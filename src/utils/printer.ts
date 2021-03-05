import { ReceiptContext, WeightSuccessResponse } from '../types';
import { BrowserWindow, app, dialog } from 'electron';
import { log } from '../utils/logger';
import { join } from 'path';
import { promises as fs } from 'fs';
import { mainWindow } from '../electron';
import { stateService } from '../services/StateService';
import { verifyCRC } from './CRCVerification';
import bwipjs from 'bwip-js';
import ejs from 'ejs';

/**
 * main function for printing receiptss
 */
export const printReceipt = async (weight: WeightSuccessResponse) => {
    const {
        description_text,
        should_print_additional_text,
        should_print_barcode,
        ean,
    } = stateService.getSettingsState();
    const [checksumOk, crc] = await verifyCRC();
    const date = new Date();
    const dateStr =
        addZ(date.getDate()) +
        '.' +
        addZ(date.getMonth() + 1) +
        '.' +
        date.getFullYear() +
        '; ' +
        date.getHours() +
        '.' +
        addZ(date.getMinutes()) +
        ' Uhr';

    const context: ReceiptContext = {
        ...weight,
        description_text,
        should_print_barcode,
        should_print_additional_text,
        date: dateStr,
        crc: crc.toUpperCase(),
    };

    if (should_print_barcode) {
        const formatted_price = plainFloats({
            n: context.selling_price,
            is_weight: false,
        });
        const formatted_weight = plainFloats({
            n: context.weight,
            is_weight: true,
        });
        const qrtext = `${ean}|${description_text}|${formatted_weight}|${formatted_price}`;
        const barcode = await generateBarcode({ text: qrtext, scale: 1 });
        context.barcode = barcode;
    }
    // render template
    ejs.renderFile(
        join(app.getAppPath(), 'dist/templates/receipt.ejs'),
        context,
        (err, data) => {
            if (err) return log(err);
            // create browser window
            const workerWindow: BrowserWindow | undefined = new BrowserWindow({
                show: false,
            });
            workerWindow.loadURL(
                'data:text/html;charset=utf-8,' + encodeURI(data)
            );
            // determine if there are any printers available (assuming no printers = dev env)
            const action =
                workerWindow.webContents.getPrinters().length > 0
                    ? sendToPrinter
                    : saveAsPDF;
            // start printing
            workerWindow.webContents.on('did-finish-load', () => {
                action(workerWindow);
            });
        }
    );
};

/**
 * sends window to default printer
 */
function sendToPrinter(workerWindow: BrowserWindow) {
    workerWindow.webContents.print(
        { silent: true, margins: { marginType: 'none' } },
        (success, err) => {
            if (success) log('printed successfully');
            if (err) log('err while printing', err);
            workerWindow.close();
        }
    );
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
            log('pdf file created successfully');
        } catch (error) {
            log('err while saving pdf', error);
        }
    } else {
        log('saving cancelled');
    }
}

function generateBarcode({
    text = '123456789012',
    scale = 1,
}): Promise<string> {
    return new Promise((resolve, reject) => {
        bwipjs.toBuffer(
            {
                bcid: 'qrcode',
                text,
                scale,
                // height,
                // includetext: true,
                textxalign: 'center',
            },
            (err, buffer) => {
                if (err) {
                    reject(err);
                    log(err);
                } else {
                    resolve(
                        'data:image/png;base64,' + buffer.toString('base64')
                    );
                }
            }
        );
    });
}

function addZ(n: number) {
    return n < 10 ? '0' + n : '' + n;
}

function plainFloats({ n, is_weight }: { n: number; is_weight: boolean }) {
    let whole = Math.floor(n);
    let fraction = 0;
    let test = '';
    if (is_weight) {
        fraction = Math.round((n - whole) * 1000);
        test = `${whole.toString()}${fraction.toString().padEnd(3, '0')}`;
    } else {
        fraction = Math.round((n - whole) * 100);
        test = `${whole.toString()}${fraction.toString().padEnd(2, '0')}`;
    }

    return test;
}
