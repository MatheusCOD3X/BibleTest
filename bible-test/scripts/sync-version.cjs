const fs = require('fs');
const path = require('path');

const packagePath = path.resolve(__dirname, '../package.json');
const outPath = path.resolve(__dirname, '../src/environments/version.ts');

const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const version = pkg.version || '0.0.0';

const output = `export const APP_VERSION = '${version}';\n`;

if (fs.existsSync(outPath)) {
  const current = fs.readFileSync(outPath, 'utf8');
  if (current === output) {
    process.exit(0);
  }
}

fs.writeFileSync(outPath, output, 'utf8');
console.log(`Updated APP_VERSION to ${version}`);
