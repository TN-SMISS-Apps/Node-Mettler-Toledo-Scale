import { _b } from '../utils/bytesConvertion';
import { BadRequestError, WeightSuccessResponse } from '../types';

export class BufferTranslator {
  // checks if buffer is nak
  static isNak(buf: Buffer): boolean {
    return buf.equals(Buffer.from([_b.NAK]));
  }

  // removes START and END, splits buffer into subbuffers divided by chunks
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

  // checks nak reason according to dialog6 docs
  static parseNakReason(_buf: Buffer): BadRequestError {
    const chunks = this.parse(_buf);
    const response_bytes = Array.from(chunks[1].values());
    const error_code = response_bytes.join('');
    const message = ((): string => {
      // prettier-ignore
      switch (error_code) {
        case [_b.D0, _b.D0].join(''): return 'there is no error present';
        case [_b.D0, _b.D1].join(''): return 'GENERAL error on scale';
        case [_b.D0, _b.D2].join(''): return 'PARITY error, or more characters than permitted';
        case [_b.D1, _b.D0].join(''): return 'incorrect record number detected';
        case [_b.D1, _b.D1].join(''): return 'no valid unit price';
        case [_b.D1, _b.D2].join(''): return 'no valid tare value received';
        case [_b.D1, _b.D3].join(''): return 'no valid text received';
        case [_b.D2, _b.D0].join(''): return 'scale still in motion (no equilibrium)';
        case [_b.D2, _b.D1].join(''): return 'no motion since last weighing operation';
        case [_b.D2, _b.D2].join(''): return 'price calculation not yet available';
        case [_b.D3, _b.D0].join(''): return 'scale in MIN range';
        case [_b.D3, _b.D1].join(''): return 'scale in underload range or negative weight display';
        case [_b.D3, _b.D2].join(''): return 'scale in overload range';
        case [_b.D3, _b.D3].join(''): return 'scale was not unloaded for approx. 2 minutes';
        case [_b.D5, _b.D6].join(''): return 'Scanners with scale sentry function: the weighing item was not positioned correctly on the load plate';
        default:
          return 'Unknown error';
      }
    })();
    return { message, error_code };
  }

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
    return {
      scale_status,
      weight,
      unit_price,
      selling_price,
    };
  }
}
