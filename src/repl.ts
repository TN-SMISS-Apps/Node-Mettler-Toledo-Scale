import repl from 'repl';
import { BufferTranslator } from './classes/BufferTranslator';
import { ScaleTranslator } from './classes/ScaleTranslator';
import { Pipe } from './classes/Pipe';
import { _b } from './utils/bytesConvertion';
import { scaleCommunicationService } from './services/ScaleCommunicationService';
import { printReceipt } from './utils/printer';
import { WeightSuccessResponse } from './types';

scaleCommunicationService.init().then(async (_) => {
  console.log('connected to pipes');
  const r = repl.start();

  const exampleWeightResponse: WeightSuccessResponse = {
    scale_status: '',
    selling_price: 0.75,
    unit_price: 4.22,
    weight: 0.178,
  };

  Object.assign(r.context, {
    BufferTranslator,
    ScaleTranslator,
    Pipe,
    _b,
    scaleCommunicationService,
    printReceipt,
    exampleWeightResponse
  });
});
