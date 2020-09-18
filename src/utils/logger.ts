import { mainWindow } from '../electron';

export const log = (...args: any[]) => {
  console.log(args);
  try {
    const log = args
      .map((toLog) => {
        if (typeof toLog === 'string') {
          return toLog;
        }
        if (toLog instanceof Error) {
          return toLog.message;
        }
        if (Buffer.isBuffer(toLog)) {
          // @ts-ignore
          return `${toLog.inspect().replace('<', '&lt;').replace('>', '&gt;')}`;
        } else {
          return JSON.stringify(toLog, null, 2);
        }
      })
      .join(' ');
    mainWindow?.webContents.send('log', log);
  } catch (error) {
    console.log(args);
  }
};
