import { OUT_PIPE_PATH, IN_PIPE_PATH } from '../config';
import { Pipe } from '../classes/Pipe';
import { _b } from '../utils/bytesConvertion';
import { merge, forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { ConnectResponse } from '../types';
import { BufferTranslator } from '../classes/BufferTranslator';

// handles
class ScaleCommunicationService {
  input_pipe!: Pipe;
  output_pipe!: Pipe;

  constructor() {}

  init(): Promise<ConnectResponse> {
    // TODO: handle when only 1 pipe connects
    if (this.isConnected) {
      return Promise.resolve({ input: true, output: true });
    }
    this.input_pipe = new Pipe(IN_PIPE_PATH);
    this.input_pipe.connect();
    this.output_pipe = new Pipe(OUT_PIPE_PATH);
    this.output_pipe.connect();

    return forkJoin({
      input: merge(this.input_pipe.errors$, this.input_pipe.is_connected$).pipe(first(v => !!v)),
      output: merge(this.output_pipe.errors$, this.output_pipe.is_connected$).pipe(first(v => !!v)),
    })
      .pipe(first(v => !!v))
      .toPromise();
  }

  destroy() {
    if (this.isConnected) {
      this.input_pipe.disconnect();
      this.output_pipe.disconnect();
    }
  }

  get isConnected() {
    const initialized = Boolean(this.input_pipe && this.output_pipe);
    return (
      initialized &&
      this.input_pipe.is_connected$.getValue() &&
      this.output_pipe.is_connected$.getValue()
    );
  }

  private requestScale(buffer: Buffer): Promise<Buffer> {
    return new Promise(resolve => {
      const dataSub = this.output_pipe.data$.subscribe(response => {
        console.log(response);
        dataSub.unsubscribe();
        resolve(response);
      });
      this.input_pipe.socket.write(buffer);
    });
  }

  private async requestCurrentWeight(): Promise<Buffer> {
    const { EOT, ENQ } = _b;
    const buf = Buffer.from([EOT, ENQ]);
    return this.requestScale(buf);
  }

  private async requestNakExplanation(): Promise<Buffer> {
    const { EOT, STX, D0, D8, ETX } = _b;
    const buf = Buffer.from([EOT, STX, D0, D8, ETX]);
    return this.requestScale(buf);
  }

  async getWeight() {
    const weight = await this.requestCurrentWeight();
    if (BufferTranslator.isNak(weight)) {
      const why = await this.requestNakExplanation();
      throw BufferTranslator.parseNakReason(why);
    } else {
      return BufferTranslator.parseValidWeight(weight)
    }
  }
}

export const scaleCommunicationService = new ScaleCommunicationService();
