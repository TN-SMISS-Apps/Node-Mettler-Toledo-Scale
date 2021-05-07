import { RequestHandler, Router } from 'express';
import { mainWindow } from '../electron';
import { log } from './../utils/logger';

export const windowRouter = Router();

const ShowView: RequestHandler = async (_, res) => {
    log('Show window with logs');
    mainWindow?.setAlwaysOnTop(true, 'screen-saver');
    mainWindow?.show();
    const hideLogs = false;
    mainWindow?.webContents.send('logs_hide', { hideLogs });
    setImmediate(() => {
        mainWindow?.setAlwaysOnTop(false);
        res.sendStatus(200);
    });
};

const HideView: RequestHandler = async (_, res) => {
    mainWindow?.hide();
    res.sendStatus(200);
};

const ToggleView: RequestHandler = async (_, res) => {
    if (mainWindow?.isVisible()) mainWindow?.hide();
    else {
        mainWindow?.setAlwaysOnTop(true, 'screen-saver');
        mainWindow?.setMenuBarVisibility(false);
        // mainWindow?.removeMenu();
        mainWindow?.setSize(320, 450);
        mainWindow?.show();
        setImmediate(() => {
            mainWindow?.setAlwaysOnTop(false);
            // mainWindow?.setSize(300,320);
        });
        const hideLogs = true;
        mainWindow?.webContents.send('logs_hide', { hideLogs });
    }
    res.sendStatus(200);
};

windowRouter.post('/show', ShowView);
windowRouter.post('/hide', HideView);
windowRouter.post('/toggle', ToggleView);
