import { forkJoin, merge, of } from 'rxjs';
import { catchError, first, tap, timeout } from 'rxjs/operators';
import { BufferTranslator } from '../classes/BufferTranslator';
import { Pipe } from '../classes/Pipe';
import { ScaleTranslator } from '../classes/ScaleTranslator';
import { IN_PIPE_PATH, OUT_PIPE_PATH } from '../config';
import { mainWindow } from '../electron';
import { ConnectResponse, Settings, ValidatedSettings, WeightSuccessResponseWithReceiptInfo } from '../types';
import { _b } from '../utils/bytesConvertion';
import { log } from '../utils/logger';
import { printReceipt } from '../utils/printer';
import { stateService } from './StateService';

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
      output: merge(this.output_pipe.errors$, this.output_pipe.is_connected$).pipe(first((v) => !!v)),
    })
      .pipe(
        first((v) => !!v),
        tap(({ input, output }) => {
          const hasErrors = input instanceof Error || output instanceof Error;
          const areTruthy = input && output;
          mainWindow?.webContents.send('connection-changed', { isConnected: areTruthy && !hasErrors });
          if (hasErrors) {
            log('errors while connecting to pipes', input, output);
          }
        }),
      )
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
      mainWindow?.webContents.send('connection-changed', { isConnected: false });
    }
  }

  /**
   * getter for connection state (both pipes)
   */
  get isConnected() {
    const initialized = Boolean(this.input_pipe && this.output_pipe);
    const isConnected =
      initialized && this.input_pipe.is_connected$.getValue() && this.output_pipe.is_connected$.getValue();
    mainWindow?.webContents.send('connection-changed', { isConnected });
    return isConnected;
  }

  /**
   * send a request to scale and awaits for the response
   * async, returns promise
   * @param buffer - data to be sent
   */
  private performRawRequest(buffer: Buffer): Promise<Buffer> {
    return new Promise((resolve) => {
      const dataSub = this.output_pipe.data$
        .pipe(
          timeout(1000),
          catchError((_) => {
            log('request timeout');
            return of(Buffer.from([_b.NAK]));
          }),
        )
        .subscribe((response) => {
          log('SCALE RESPONSE =>', response);
          dataSub.unsubscribe();
          resolve(response);
        });
      log('SCALE REQ =>', buffer);
      this.input_pipe.socket.write(buffer);
    });
  }

  /**
   * send a request to scale and awaits for the response
   * async, returns promise
   * @param buffer - data to be sent
   */
  private async requestScale(request: Buffer): Promise<Buffer> {
    const scaleResp = await this.performRawRequest(request);
    // handle checksum
    if (BufferTranslator.isChecksumRequired(scaleResp)) {
      const [left, right] = BufferTranslator.parseChecksumRotations(scaleResp);
      const checksum = Buffer.concat([BufferTranslator.rotateLeft(left), BufferTranslator.rotateRight(right)]);
      const prefix = Buffer.from([_b.EOT, _b.STX, _b.D1, _b.D0, _b.ESC]);
      const suffix = Buffer.from([_b.ETX]);
      await this.performRawRequest(Buffer.concat([prefix, checksum, suffix]));
      const response = await this.performRawRequest(Buffer.from([_b.EOT, _b.ENQ]));
      const isChecksumValid = response.slice(4, 5).equals(Buffer.from([0x31]));
      if (!isChecksumValid) {
        log('checksum requested => ', scaleResp);
        log('checksum send => ', checksum);
        throw new Error('checksum incorrect');
      } else {
        log('checksum ok');
        return this.performRawRequest(request);
      }
      // if ok send initial, return resp
    } else {
      return scaleResp;
    }
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
  async getWeight(): Promise<WeightSuccessResponseWithReceiptInfo> {
    const weight = await this.requestCurrentWeight();
    if (BufferTranslator.isNak(weight)) {
      const why = await this.requestNakExplanation();
      throw BufferTranslator.parseNakReason(why);
    } else {
      const parsedWeight = BufferTranslator.parseValidWeight(weight);
      let errors;
      try {
        await printReceipt(parsedWeight);
      } catch (error) {
        log('printing failed:', error);
        errors = error;
      }
      return { ...parsedWeight, receipt_printed: !Boolean(errors), receipt_print_errors: errors };
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
      should_print_barcode: settings.should_print_barcode as boolean,
      should_print_additional_text: settings.should_print_additional_text as boolean,
      ean: settings.ean as string,
    };
    const scaleResp = await this.requestScale(BufferTranslator.createSettingsRequest(scaleSettings));
    if (BufferTranslator.isNak(scaleResp)) {
      const why = await this.requestNakExplanation();
      throw BufferTranslator.parseNakReason(why);
    }
    if (BufferTranslator.isAck(scaleResp)) {
      stateService.setSettingState(scaleSettings);
      return true;
    } else {
      log('Unknown resp');
      log(scaleResp);
      return false;
    }
  }

  /**
   * display logic version number on scale and screen or hide it
   */
  async toggleLogicVersionDisplay(shouldBeShown: boolean, timeout?: number) {
    const { EOT, STX, D0, D1, D2, ESC, ETX } = _b;
    const hideQuery = Buffer.from([EOT, STX, D2, D0, ESC, D0, ETX]);

    const handleNak = async (request: Promise<Buffer>) => {
      const buf = await request;
      if (!BufferTranslator.isNak(buf)) return;
      const reason = await this.requestNakExplanation();
      throw BufferTranslator.parseNakReason(reason);
    };

    if (!shouldBeShown) return handleNak(this.requestScale(hideQuery));
    else {
      const showQuery = Buffer.from([EOT, STX, D2, D0, ESC, D1, ETX]);
      timeout;
      setTimeout(() => {
        this.requestScale(hideQuery);
      }, timeout);
      return handleNak(this.requestScale(showQuery));
    }
  }
}

export const scaleCommunicationService = new ScaleCommunicationService();
