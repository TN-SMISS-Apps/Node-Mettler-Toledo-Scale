import { _b } from '../utils/bytesConvertion';
import { ScaleTranslator } from './ScaleTranslator';
import { BadRequestError, WeightSuccessResponse, Settings } from '../types';

export class BufferTranslator {
  /**
   * checks if provided buffer is NAK (negative acknowledgement)
   */
  static isNak(buf: Buffer): boolean {
    return buf.equals(Buffer.from([_b.NAK]));
  }

  /**
   * checks if provided buffer is ACK (acknowledgement)
   */
  static isAck(buf: Buffer): boolean {
    return buf.equals(Buffer.from([_b.ACK]));
  }

  /**
   * checks if provided buffer is checksum request
   */
  static isChecksumRequired(buf: Buffer): boolean {
    return Buffer.from(buf).includes(Buffer.from([_b.STX, _b.D1, _b.D1, _b.ESC, _b.D2]));
  }

  /**
   * get Z values (left\right rotations) from checksum request
   */
  static parseChecksumRotations(buf: Buffer): [number, number] {
    const rotations = Buffer.from(buf).slice(5, 7);
    const left = Number('0x' + String.fromCharCode(rotations[0]));
    const right = Number('0x' + String.fromCharCode(rotations[1]));
    return [left, right];
  }

  /**
   * removes START and END, splits buffer into subbuffers divided by chunks
   * @param _buf - buffer to be parsed
   * @param separator - byte to be splitted by (ESC = default)
   */
  static parse(_buf: Buffer, separator: number = _b.ESC): Buffer[] {
    let buf = Buffer.from(_buf);
    // remove STX and ETX bytes
    buf = buf.slice(1, buf.length - 1);

    // get chunks splited by separator
    const chunks: Buffer[] = [];
    let separator_index = buf.indexOf(separator);
    while (separator_index != -1) {
      const chunk = buf.slice(0, separator_index);
      chunks.push(chunk);
      buf = buf.slice(separator_index + 1);
      separator_index = buf.indexOf(separator);
    }
    chunks.push(buf);

    return chunks;
  }

  /**
   * checks nak reason according to dialog6 docs
   */
  static parseNakReason(_buf: Buffer): BadRequestError {
    if (this.isNak(_buf)) {
      return { message: 'No response from scale', error_code: 'TIMEOUT' };
    }
    const chunks = this.parse(_buf);
    const error_code = chunks[1].toString('utf8');
    const message = ((): string => {
      // prettier-ignore
      switch (error_code) {
        case '00': return 'there is no error present';
        case '01': return 'GENERAL error on scale';
        case '02': return 'PARITY error, or more characters than permitted';
        case '10': return 'incorrect record number detected';
        case '11': return 'no valid unit price';
        case '12': return 'no valid tare value received';
        case '13': return 'no valid text received';
        case '20': return 'scale still in motion (no equilibrium)';
        case '21': return 'no motion since last weighing operation';
        case '22': return 'price calculation not yet available';
        case '30': return 'scale in MIN range';
        case '31': return 'scale in underload range or negative weight display';
        case '32': return 'scale in overload range';
        case '33': return 'scale was not unloaded for approx. 2 minutes';
        case '56': return 'Scanners with scale sentry function: the weighing item was not positioned correctly on the load plate';
        default:
          return 'Unknown error';
      }
    })();
    return { message, error_code };
  }

  /**
   * parses weight data from buffer
   */
  static parseValidWeight(_buf: Buffer): WeightSuccessResponse {
    let chunks = this.parse(_buf);
    const [_, b_scale_status, b_weight, b_unit_price, b_selling_price] = chunks;
    const scale_status = ((): string => {
      // prettier-ignore
      switch (b_scale_status[0]) {
        case _b.D0: return 'lb : oz / 1/8 oz';
        case _b.D1: return 'lb / 0,01';
        case _b.D2: return 'lb / 0,005';
        case _b.D3: return 'kg; 3 decimal places';
        case _b.D4: return 'kg; 2 decimal places';
        default:
          return 'Unknown param';
      }
    })();

    const weight = b_weight.toString('utf8');
    const unit_price = b_unit_price.toString('utf8');
    const selling_price = b_selling_price.toString('utf8');
    // TODO: to normal values
    return {
      scale_status,
      weight: ScaleTranslator.translateStringToFloat(weight, 3),
      unit_price: ScaleTranslator.translateStringToFloat(unit_price, unit_price.length - 4),
      selling_price: ScaleTranslator.translateStringToFloat(selling_price, 2),
    };
  }

  /**
   * create a buffer for changing price/tare/text values
   * from Settings object
   */
  static createSettingsRequest(settings: Settings): Buffer {
    const start = Buffer.from([_b.EOT, _b.STX, _b.D0, _b.D5]);

    const esc = Buffer.from([_b.ESC]);

    const unit_price = Buffer.from(settings.unit_price, 'ascii');
    const tare = Buffer.from(settings.tare, 'ascii');
    const text = Buffer.from(settings.description_text, 'ascii');

    const end = Buffer.from([_b.ETX]);
    return Buffer.concat([start, esc, unit_price, esc, tare, esc, text, end]);
  }

  /**
   * rotates fixed checksum value
   * @param bits rotation turns
   */
  static rotateLeft(bits: number) {
    const value = 0x4711;
    const temp1 = value << bits;
    const temp2 = (value & 0xffff) >> (16 - bits);
    return Buffer.from(((temp1 | temp2) & 0xffff).toString(16).toUpperCase());
  }

  /**
   * rotates fixed checksum value
   * @param bits rotation turns
   */
  static rotateRight(bits: number) {
    const value = 0xf336;
    const temp1 = (value & 0xffff) >> bits;
    const temp2 = value << (16 - bits);
    return Buffer.from(((temp1 | temp2) & 0xffff).toString(16).toUpperCase());
  }
}
