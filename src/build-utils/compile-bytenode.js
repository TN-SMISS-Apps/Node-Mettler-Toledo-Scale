'use strict';
const path = require('path');
const fs = require('fs').promises;
const { app } = require('electron');
const { crc16, crc32 } = require('crc');
const bytenode = require('bytenode');
const v8 = require('v8');

(async () => {
    try {
        const distDir = path.resolve(__dirname, '../../dist');
        const compiledAppPath = distDir + '/electron.jsc';
        v8.setFlagsFromString('--no-lazy');

        bytenode.compileFile(distDir + '/bundle.js', compiledAppPath);

        // construct crc
        const compiledAppContents = await fs.readFile(compiledAppPath);
        const crc = crc32(compiledAppContents).toString(16).padStart(4, '0');
        // const crc = crc32(compiledAppContents).toString(16);

        await fs.writeFile(
            distDir + '/crc.js',
            `module.exports = { checksum: '${crc}' }`
        );
        bytenode.compileFile(distDir + '/crc.js', distDir + '/crc.jsc');
    } catch (error) {
        throw new Error(error);
    } finally {
        app.quit();
    }
})();
