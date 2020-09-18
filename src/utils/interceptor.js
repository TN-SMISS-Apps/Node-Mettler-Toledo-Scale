const net = require('net');
const readline = require('readline');

const _pref = '\\\\.\\pipe\\';

const VCOIn = _pref + 'VCOIn';
const VCOOut = _pref + 'VCOOut';

const NODEIn = _pref + 'NODEIn';
const NODEOut = _pref + 'NODEOut';

try {
  // connect to scale
  const VCOInclient = net.connect(VCOIn);
  const VCOOutclient = net.connect(VCOOut);
  VCOInclient.on('ready', (_) => console.log('VCOInclient connected'));
  VCOOutclient.on('ready', (_) => console.log('VCOOutclient connected'));

  let nodeOutStream;

  //   create input server
  const NODEInserver = net.createServer((stream) => {
    stream.on('data', (data) => {
      // 04 02 31 30 1b
      if (data.includes(Buffer.from([0x04, 0x02, 0x31, 0x30, 0x1b]))) {
        console.log('NODEInserver:data, CHECKSUM SENT => ', data);
      } else {
        console.log('NODEInserver:data => ', data);
      }
      VCOInclient.write(data);
    });
  });

  NODEInserver.listen(NODEIn, (_) => console.log('NODEInServer: on listening'));
  const NODEOutserver = net.createServer((stream) => {
    nodeOutStream = stream;
  });
  NODEOutserver.listen(NODEOut, (_) => console.log('NODEOutServer: on listening'));

  function closeServers() {
    try {
      NODEInserver.close();
      NODEOutserver.close();
    } catch (error) {
      console.log(error);
    }
  }

  VCOOutclient.on('data', (data) => {
    if (data.includes(Buffer.from([0x2, 0x31, 0x31, 0x1b, 0x32]))) {
      console.log('VCOOutclient:data, CHECKSUM REQUESTED => ', data);
    } else {
      console.log('VCOOutclient:data => ', data);
    }
    if (nodeOutStream) nodeOutStream.write(data);
  });

  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.on('keypress', (str, key) => {
    if (key.ctrl && key.name === 'c') {
      process.exit();
    } else if (key.ctrl) {
      switch (key.name) {
        case 'k':
          VCOInclient.write(Buffer.from([0x4, 0x2, 0x32, 0x30, 0x1b, 0x31, 0x03]));
          setTimeout(() => {
            VCOInclient.write(Buffer.from([0x4, 0x2, 0x32, 0x30, 0x1b, 0x30, 0x03]));
          }, 1000);
          break;
        default:
          break;
      }
    }
  });
} catch (error) {
  closeServers();
  process.exit();
}

process.on('SIGINT', closeServers);
process.on('beforeExit', closeServers);
