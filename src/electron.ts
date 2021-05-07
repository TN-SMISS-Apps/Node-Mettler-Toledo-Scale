import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import * as config from './config';
import { PORT, PORT_HTTPS } from './config';
import { app as expressApp } from './server';
import https from 'https';
import http from 'http';
import fs from 'fs';
import { scaleCommunicationService } from './services/ScaleCommunicationService';
import { verifyCRC } from './utils/CRCVerification';
import { log } from './utils/logger';
const { version } = require('../package.json');

export let mainWindow: BrowserWindow | null;

function createApplicationWindow() {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 400,
        frame: false,
        focusable: false,
        title: `Faktura Modul HF ScaIF v${version}`,
        webPreferences: {
            nodeIntegration: true,
        },
    });
    mainWindow!.setPosition(10, 150);
    mainWindow!.setSkipTaskbar(true);

    mainWindow!.loadFile('dist/templates/electron.html');
    mainWindow.webContents.once('did-finish-load', async () => {
        const [checksumOk, crc] = await verifyCRC();
        if (!checksumOk) {
            dialog.showMessageBox(mainWindow!, {
                message: 'Checksum mismatch',
            });
            setTimeout(() => {
                return mainWindow!.close();
            }, 1000);
        } else {
            log('Checksums ok');
            log(config);
            mainWindow!.webContents.send('set-crc', { crc });
            mainWindow!.on('close', (event) => {
                event.preventDefault();
                mainWindow!.hide();
            });
            // expressApp.listen(PORT, () => {
            //     log('API listening on', PORT);
            //     log('version', version);
            // });

            // const httpsOptions = {
            //     key: fs.readFileSync('C:/xampp/apache/conf/ssl.key/server.key'),
            //     cert: fs.readFileSync(
            //         'C:/xampp/apache/conf/ssl.crt/server.crt'
            //     ),
            // };
            const httpsOptions = {
                key: fs.readFileSync('C:/xampp/apache/conf/test/privkey5.pem'),
                cert: fs.readFileSync('C:/xampp/apache/conf/test/cert5.pem'),
            };
            const httpsServer = https
                .createServer(httpsOptions, expressApp)
                .listen(PORT_HTTPS, () => {
                    log('API listening on', PORT_HTTPS);
                    log('version', version);
                });
            const httpServer = http
                .createServer(expressApp)
                .listen(PORT, () => {
                    log('API listening on', PORT);
                    log('version', version);
                });

            scaleCommunicationService.init();
            //HERE DO NOT HIDE WINDOWS
            // setTimeout(() => {
            //     return mainWindow!.hide();
            // }, 6000);
        }
    });

    mainWindow!.on('closed', function () {
        mainWindow = null;
        app.quit();
    });

    ipcMain.on('connection-toggle', (_, { isConnected }) => {
        isConnected
            ? scaleCommunicationService.init()
            : scaleCommunicationService.destroy();
    });
}

function createLoadingScreen() {
    mainWindow = new BrowserWindow({
        width: 600,
        height: 550,
        title: `Faktura Modul HF ScaIF v${version}`,
        frame: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
        },
    });
    mainWindow!.loadFile('dist/templates/loadingScreen.html');
    mainWindow!.on('closed', function () {
        mainWindow = null;
        app.quit();
    });
}

app.whenReady().then((_) => {
    const hasSquirrelEvents = process.argv.some((arg) =>
        arg.includes('--squirrel')
    );
    // if no events => dev environment or regular run
    if (!hasSquirrelEvents) {
        createApplicationWindow();
        // else production env
    } else {
        const squirrelEvent = process.argv[1];
        switch (squirrelEvent) {
            case '--squirrel-install':
                return createLoadingScreen();
            case '--squirrel-firstrun':
                return createApplicationWindow();
            default:
                // not sure if this will be required
                return createApplicationWindow();
        }
    }
});
