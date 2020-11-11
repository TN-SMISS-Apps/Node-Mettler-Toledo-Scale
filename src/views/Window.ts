import { RequestHandler, Router } from 'express';
import { mainWindow } from '../electron';

export const windowRouter = Router();

const ShowView: RequestHandler = async (_, res) => {
  mainWindow?.setAlwaysOnTop(true);
  mainWindow?.show();
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
    console.log('test1');
    mainWindow?.setAlwaysOnTop(true);    
    mainWindow?.show();
    setImmediate(() => {
        mainWindow?.setAlwaysOnTop(false);
    });
    const hideLogs = true;
    mainWindow?.webContents.send('logs_hide', {hideLogs});
    console.log('test2');    
  }
  res.sendStatus(200);
};

windowRouter.post('/show', ShowView);
windowRouter.post('/hide', HideView);
windowRouter.post('/toggle', ToggleView);
