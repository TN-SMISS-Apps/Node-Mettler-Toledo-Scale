import repl from 'repl';
import { BufferTranslator } from './classes/BufferTranslator';
import { ScaleTranslator } from './classes/ScaleTranslator';
import { Pipe } from './classes/Pipe';
import { _b } from './utils/bytesConvertion';
import { scaleCommunicationService } from './services/ScaleCommunicationService';

scaleCommunicationService.init().then(async (_) => {
  console.log('connected to pipes');
  const r = repl.start();

  Object.assign(r.context, {
    BufferTranslator,
    ScaleTranslator,
    Pipe,
    _b,
    scaleCommunicationService,
  });
});