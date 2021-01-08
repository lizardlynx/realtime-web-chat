'use strict';

const assert = require('assert').strict;
const fs = require('fs');
const FileManager = require('../../node-js/fileManager').FileManager;

//finds files to check
function readAllFiles(dir) {
  fs.readdir(dir, (err, files) => {
    if (err) console.log('Unable to scan directory: ' + err);
    files.forEach(file => {
      if (fs.lstatSync(file).isDirectory()) return;
      it('File Manager ' + file + ' should return buffer', async () => {
        const fileManager = new FileManager();
        const data = await fileManager.readFile(file);
        const result = Buffer.isBuffer(data);
        assert.strictEqual(result, true);
      });
    });
  });
}

describe('FileManager', () => {
  //check readFile and readFileInfo
  it('File Manager ReadFile should return buffer', () => {
    readAllFiles('./');
  });
});
