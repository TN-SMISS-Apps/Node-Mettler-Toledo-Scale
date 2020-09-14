import { mainWindow } from '../electron';

export const log = (...args: any[]) => {
  console.log(args);
  try {
    const log = args.map((toLog) => {
      if (typeof toLog === 'string') {
        return toLog
      }
      if (Buffer.isBuffer(toLog)) {
        // @ts-ignore
        return `${toLog.inspect().replace('<', '&lt;').replace('>', '&gt;')}`;
      } else {
          return JSON.stringify(toLog, null, 2);
      }
    }).join(' ');
    mainWindow?.webContents.send('log', log)
  } catch (error) {
    console.log(args);
  }
};

// export const log = (...args: any[]) => {
//   console.log(args);
//   try {
//     args.forEach((toLog) => {
//       if (typeof toLog === 'string') {
//         return mainWindow?.webContents.send('log', toLog);
//       }
//       if (Buffer.isBuffer(toLog)) {
//         // @ts-ignore
//         mainWindow?.webContents.send('log', `${toLog.inspect().replace('<', '&lt;').replace('>', '&gt;')}`);
//       } else {
//           mainWindow?.webContents.send('log', JSON.stringify(toLog, null, 2));
//       }
//     });
//   } catch (error) {
//     console.log(args);
//   }
// };
