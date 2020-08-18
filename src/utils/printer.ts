import { WeightSuccessResponse } from '../types';

let nodePrinter: any;

try {
  nodePrinter = require('@thiagoelg/node-printer');
} catch (error) {
  console.log('node printer error');
  console.log(error);
  // stub
  nodePrinter = {
    printDirect: (options: any) => console.log(options),
  };
}

export const printReceipt = (weight: WeightSuccessResponse) => {
  const text = `
Grundpreis:            ${weight.unit_price} EUR / 1kg;
Gewogenes Gewicht:     ${weight.weight} kg;
Preis:                 ${weight.selling_price} EUR;
  
  `;
  return printText(text);
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
