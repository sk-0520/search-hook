/**
 * 各種 manifest のバージョンを統一する。
 */
const fs = require('fs');
const path = require('path');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const packageVersion = packageJson['version'];

const filePath = path.join('dist', 'manifest.json');
const targetJson = JSON.parse(fs.readFileSync(filePath), 'utf8');
targetJson['version'] = packageVersion;
fs.writeFileSync(filePath, JSON.stringify(targetJson, undefined, 2));
