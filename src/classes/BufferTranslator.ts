import { _b } from '../utils/bytesConvertion';

export class BufferTranslator {
  static isNak(buf: Buffer): boolean {
    return buf.equals(Buffer.from([_b.NAK]));
  }

  static parse(_buf: Buffer, separator: number = _b.ESC): Buffer[] {
    let buf = Buffer.from(_buf);
    // remove STX and ETX bytes
    buf = buf.slice(1, buf.length - 1);

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

  static parseNakReason(_buf: Buffer) {
    const chunks = this.parse(_buf);
    // TODO: finish
    console.log(Array.from(chunks[1].values()))
  }
}
