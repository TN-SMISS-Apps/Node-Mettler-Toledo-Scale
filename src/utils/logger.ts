import { mainWindow } from '../electron';

export const log = (...args: any[]) => {
  console.log(args);
  try {
    args.forEach((toLog) => {
      if (typeof toLog === 'string') {
        return mainWindow?.webContents.send('log', toLog);
      }
      if (Buffer.isBuffer(toLog)) {
        // @ts-ignore
        mainWindow?.webContents.send('log', `${toLog.inspect().replace('<', '&lt;').replace('>', '&gt;')}`);
      } else {
        if (toLog.toString) {
          mainWindow?.webContents.send('log', toLog.toString());
        } else {
          mainWindow?.webContents.send('log', JSON.stringify(toLog));
        }
      }
    });
  } catch (error) {
    console.log(args);
  }
};
