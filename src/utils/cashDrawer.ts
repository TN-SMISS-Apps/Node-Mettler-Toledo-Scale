import { BrowserWindow, ipcMain } from 'electron';
import SerialPort, { OpenOptions } from 'serialport';
import { localStorage } from './localStorage';
import { log } from './logger';

const COM_PORT_STORAGE_KEY = 'selected-com-port';
const CANDIDATE_PID = 'VID_067B&PID_2303';
const OPEN_CASH_DRAWER_COMMAND = Buffer.from([0x1b, 0x70, 0, 50, 50]);
const CASH_DRAWER_OPTIONS: OpenOptions = {
  baudRate: 115200,
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
  autoOpen: false,
};

export class CashDrawerSettings {
  static window?: BrowserWindow | null;

  static createWindow() {
    if (!this.window) {
      this.window = new BrowserWindow({
        width: 400,
        height: 140,
        title: 'Cash drawer settings',
        webPreferences: {
          nodeIntegration: true,
        },
      });

      this.window.loadFile('dist/templates/cashDrawerSettings.html');
      this.window.webContents.on('did-finish-load', async () => {
        const ports = await SerialPort.list();
        const savedPort = localStorage.get(COM_PORT_STORAGE_KEY);
        this.window!.webContents.send('list-com-ports', { ports, savedPort });
      });

      const testPort = (_: any, { port }: { port: string }) => attemptToOpenDrawer(port).then(log).catch(log);

      const savePort = (_: any, { port }: { port: string }) => {
        log('save port', port);
        localStorage.set(COM_PORT_STORAGE_KEY, port);
        this.window?.close();
      };

      ipcMain.on('test-port', testPort);
      ipcMain.once('save-port', savePort);

      this.window.on('closed', () => {
        this.window = null;
        ipcMain.removeListener('test-port', testPort);
        ipcMain.removeListener('save-port', savePort);
      });
    } else {
      this.window.show();
    }
  }
}

/**
 * sends predefined command with predefined settings
 * rejects if open or write failed
 * resolves with success message if no errors
 */
export function attemptToOpenDrawer(path: string = localStorage.get(COM_PORT_STORAGE_KEY) as string) {
  return new Promise((resolve, reject) => {
    const port = new SerialPort(path, CASH_DRAWER_OPTIONS);
    const closeAndReject = (error: Error) => {
      if (port.isOpen) port.close();
      reject(error);
    };
    port.open((err) => {
      if (err) closeAndReject(err);
      else {
        port.write(OPEN_CASH_DRAWER_COMMAND, (err) => {
          if (err) closeAndReject(err);
          else {
            port.close();
            resolve('no errors');
          }
        });
      }
    });
  });
}

/**
 * preselects com port if nothing is defined in settings
 */
export async function makeSureSettingsHaveComPort() {
  const existing = localStorage.get(COM_PORT_STORAGE_KEY);
  if (existing) return existing;
  const ports = await SerialPort.list();
  let candidate = ports.find((port) => port.pnpId?.includes(CANDIDATE_PID));
  if (!candidate) candidate = ports.find((port) => port.vendorId && port.productId) || ports[0];
  return localStorage.set(COM_PORT_STORAGE_KEY, candidate.path);
}
