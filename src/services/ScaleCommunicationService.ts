import { OUT_PIPE_PATH, IN_PIPE_PATH } from '../config';
import { Pipe } from '../classes/Pipe';
import { _b } from '../utils/bytesConvertion';
import { merge, forkJoin } from 'rxjs';
import { first } from 'rxjs/operators';
import { ConnectResponse, ValidatedSettings, Settings } from '../types';
import { BufferTranslator } from '../classes/BufferTranslator';
import { ScaleTranslator } from '../classes/ScaleTranslator';

// handles
class ScaleCommunicationService {
  input_pipe!: Pipe;
  output_pipe!: Pipe;

  constructor() {}

  /**
   * claims scale pipes
   * highest level connect function
   */
  init(): Promise<ConnectResponse> {
    // TODO: handle when only 1 pipe connects
    if (this.isConnected) {
      return Promise.resolve({ input: true, output: true });
    }
    this.input_pipe = new Pipe(IN_PIPE_PATH);
    this.input_pipe.connect();
    if (IN_PIPE_PATH !== OUT_PIPE_PATH) {
      this.output_pipe = new Pipe(OUT_PIPE_PATH);
      this.output_pipe.connect();
    } else {
      this.output_pipe = this.input_pipe;
    }

    return forkJoin({
      input: merge(this.input_pipe.errors$, this.input_pipe.is_connected$).pipe(first((v) => !!v)),
      output: merge(this.output_pipe.errors$, this.output_pipe.is_connected$).pipe(
        first((v) => !!v),
      ),
    })
      .pipe(first((v) => !!v))
      .toPromise();
  }

  /**
   * disconnects from pipes
   * highest level disconnect func
   */
  destroy() {
    if (this.isConnected) {
      this.input_pipe.disconnect();
      this.output_pipe.disconnect();
    }
  }

  /**
   * getter for connection state (both pipes)
   */
  get isConnected() {
    const initialized = Boolean(this.input_pipe && this.output_pipe);
    return (
      initialized &&
      this.input_pipe.is_connected$.getValue() &&
      this.output_pipe.is_connected$.getValue()
    );
  }

  /**
   * send a request to scale and awaits for the response
   * async, returns promise
   * @param buffer - data to be sent
   */
  private performRawRequest(buffer: Buffer): Promise<Buffer> {
    return new Promise((resolve) => {
      const dataSub = this.output_pipe.data$.subscribe((response) => {
        console.log('SCALE RESPONSE =>', response);
        dataSub.unsubscribe();
        resolve(response);
      });
      this.input_pipe.socket.write(buffer);
    });
  }

  /**
   * send a request to scale and awaits for the response
   * async, returns promise
   * @param buffer - data to be sent
   */
  private async requestScale(buffer: Buffer): Promise<Buffer> {
    const scaleResp = await this.requestScale(buffer);
    if (BufferTranslator.isChecksumRequired(scaleResp)) {
      //
      // const
    } else {
      return scaleResp;
    }
    // const scaleResp = await this.requestScale(
    //   BufferTranslator.createSettingsRequest(scaleSettings),
    // );
    // if (BufferTranslator.isNak(scaleResp)) {
    //   const why = await this.requestNakExplanation();
    //   throw BufferTranslator.parseNakReason(why);
    // }
    // if (BufferTranslator.isAck(scaleResp)) {
    //   return true;
    // } else {
    //   console.log('Unknown resp');
    //   console.log(scaleResp);
    //   return false;
    // }
  }

  /**
   * send a request for current weight without any handles
   */
  private async requestCurrentWeight(): Promise<Buffer> {
    const { EOT, ENQ } = _b;
    const buf = Buffer.from([EOT, ENQ]);
    return this.requestScale(buf);
  }

  /**
   * when nak is received we need to ask scale what's wrong,
   * so this function does this
   */
  private async requestNakExplanation(): Promise<Buffer> {
    const { EOT, STX, D0, D8, ETX } = _b;
    const buf = Buffer.from([EOT, STX, D0, D8, ETX]);
    return this.requestScale(buf);
  }

  /**
   * get current weight with nak handle
   * returns valid, human-readable response
   */
  async getWeight() {
    const weight = await this.requestCurrentWeight();
    if (BufferTranslator.isNak(weight)) {
      const why = await this.requestNakExplanation();
      throw BufferTranslator.parseNakReason(why);
    } else {
      return BufferTranslator.parseValidWeight(weight);
    }
  }

  /**
   * send settings to scale and check response
   */
  async setSettings(settings: ValidatedSettings): Promise<boolean> {
    const scaleSettings: Settings = {
      description_text: settings.description_text as string,
      tare: ScaleTranslator.translateFloatToString(settings.tare as number, 3, 4),
      unit_price: ScaleTranslator.translateFloatToString(settings.unit_price as number, 2, 6),
    };
    const scaleResp = await this.requestScale(
      BufferTranslator.createSettingsRequest(scaleSettings),
    );
    if (BufferTranslator.isNak(scaleResp)) {
      const why = await this.requestNakExplanation();
      throw BufferTranslator.parseNakReason(why);
    }
    if (BufferTranslator.isAck(scaleResp)) {
      return true;
    } else {
      console.log('Unknown resp');
      console.log(scaleResp);
      return false;
    }
  }
}

export const scaleCommunicationService = new ScaleCommunicationService();
