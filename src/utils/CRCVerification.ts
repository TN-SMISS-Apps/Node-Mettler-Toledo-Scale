import { crc16, crc32 } from 'crc';
import { app } from 'electron';
import { promises as fs } from 'fs';
import path from 'path';
const bytenode = require('bytenode');

const crcFile = './crc.jsc';
const sourceFile = './electron.jsc';

const { checksum } = eval('require')(crcFile);

export async function verifyCRC(): Promise<[boolean, string]> {
    const compiledAppPath = path.join(app.getAppPath(), 'dist', sourceFile);
    const compiledAppContents = await fs.readFile(compiledAppPath);
    const evaluatedCRC = crc32(compiledAppContents).toString(16);
    return [checksum === evaluatedCRC, checksum];
}
