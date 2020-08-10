import { WeightSuccessResponse } from '../types';

const nodePrinter = require('@thiagoelg/node-printer');

// const findPrinter = () => {
//   return nodePrinter
//     .getPrinters()
//     .find((printer: any) => printer.portName && printer.portName.includes('USBPOS'));
// };

export const printReceipt = (weight: WeightSuccessResponse) => {
  return printText(
    `=====================
Weight:        ${weight.weight};
Unit price:    ${weight.unit_price};

Total price:   ${weight.selling_price};
=====================`,
  );
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

// (async () => {
//   const data =  "some text some text some text some text some textsome textsome textv v some text some text some text some text some textsome textsome textsome text"
//   printText(data)
//     .then((job) => console.log('success, jobid =>', job))
//     .catch(console.log);
// })();
