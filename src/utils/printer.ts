import { WeightSuccessResponse } from '../types';
const iconv = require('iconv-lite');

const nodePrinter = require('@thiagoelg/node-printer');

// const findPrinter = () => {
//   return nodePrinter
//     .getPrinters()
//     .find((printer: any) => printer.portName && printer.portName.includes('USBPOS'));
// };

export const printReceipt = (weight: WeightSuccessResponse) => {
  const text = `
Grundpreis:            ${weight.unit_price} € / 1kg;
Gewogenes Gewicht:     ${weight.weight} kg;
Preis:                 ${weight.selling_price} €;
  
  `;
  return printText(iconv.encode(text, 'win1251'));
};

const printText = async (text: string) => {
  return new Promise((resolve, reject) => {
    nodePrinter.printDirect({
      data: text,
      success: (jobid: string) => resolve(jobid),
      error: (error: any) => reject(error),
    });
  });
};
