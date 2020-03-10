import { Settings } from 'http2';
import { ValidatedSettings } from '../types';

/**
 * translates data from scale language to human readable
 * and vice versa
 */
export class ScaleTranslator {
  /**
   * translates from 00467 to js float
   * @param num string to be converted, e.g. 00467
   * @param precision decimal numbers count
   */
  static translateStringToFloat(num: string, precision: number): number {
    const sub1 = num.slice(0, num.length - precision);
    console.log(sub1);
    const sub2 = num.slice(num.length - precision);
    console.log(sub2);
    return Number(sub1 + '.' + sub2);
  }

  /**
   * oposite of translateStringToFloat
   * @param num input number
   * @param precision decimal numbers count
   * @param length total length of output string
   */
  static translateFloatToString(num: number, precision: number, length: number): string {
    let k = num.toString().split('.');
    k[1] = k[1].padEnd(precision, '0');
    k[0] = k[0].padStart(length - precision, '0');
    return k.join('');
  }
}
