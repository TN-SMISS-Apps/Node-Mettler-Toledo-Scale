import net from 'net';
import { _b } from './bytesConvertion';

/**
 * Emulator creates 2 pipes for input and output
 * responds with stubs to basic commands such as:
 * - get weight
 * - set settings
 * - why nak
 */

const { EOT, ENQ, NAK, ACK, STX, ESC, ETX, D0, D1, D2, D3, D4, D5, D6, D8, D9 } = _b;

const _pref = '\\\\.\\pipe\\';

const NODEIn = _pref + 'NODEIn';
const NODEOut = _pref + 'NODEOut';

let nodeOutStream: any;

const has = (buf: Buffer) => (buf2: Buffer) => Buffer.from(buf).includes(buf2);

const REQ = {
  WEIGHT: Buffer.from([EOT, ENQ]),
  SETTINGS: Buffer.from([EOT, STX, D0, D5, ESC]),
  WHY_NAK: Buffer.from([EOT, STX, D0, D8, ETX]),
  LOGIC_VERSION: Buffer.from([EOT, STX, D2, D0, ESC]),
};

const RESP = {
  NAK: Buffer.from([NAK]),
  ACK: Buffer.from([ACK]),
  NAK_REASON: Buffer.from([STX, D0, D9, ESC, D0, D1, ETX]),
  // prettier-ignore
  WEIGHT: Buffer.from([STX,D0,D2,ESC,D3,ESC,D0,D2,D0,D0,D0,ESC,D1,D2,D3,D4,D5,D6,ESC,D2,D4,D6,D9,D1,D2, ETX]),
};

let hasSettings = false;

const NODEInserver = net.createServer((stream) => {
  stream.on('data', (data) => {
    const includes = has(data);
    if (includes(REQ.SETTINGS)) {
      hasSettings = true;
      const resp = Math.random() > 0.8 ? RESP.NAK : RESP.ACK;
      nodeOutStream.write(resp);
    }
    if (includes(REQ.WEIGHT)) {
      const resp = hasSettings ? RESP.WEIGHT : RESP.NAK;
      nodeOutStream.write(resp);
      hasSettings = false;
    }
    if (includes(REQ.WHY_NAK)) {
      nodeOutStream.write(RESP.NAK_REASON);
    }
    if (includes(REQ.LOGIC_VERSION)) {
      const resp = Math.random() > 0.8 ? RESP.NAK : RESP.ACK;
      nodeOutStream.write(resp);
    }
    console.log('NODEInserver:data => ', data);
  });
});

//@ts-ignore
NODEInserver.listen(NODEIn, (_: any) => console.log('NODEInServer: on listening'));

const NODEOutserver = net.createServer((stream) => {
  nodeOutStream = stream;
});

//@ts-ignore
NODEOutserver.listen(NODEOut, (_) => console.log('NODEOutServer: on listening'));

function closeServers() {
  try {
    NODEInserver.close();
    NODEOutserver.close();
  } catch (error) {
    console.log(error);
  }
}

process.on('SIGINT', closeServers);
process.on('beforeExit', closeServers);
