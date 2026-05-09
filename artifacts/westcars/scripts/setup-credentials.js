const fs = require('fs');
const path = require('path');

const keystoreB64 = process.env.KEYSTORE_B64;
const keystorePassword = process.env.KEYSTORE_PASSWORD;
const keyPassword = process.env.KEY_PASSWORD;
const keyAlias = '2409d8e96f55c9e2557b4ebe6786a888';

if (!keystoreB64 || !keystorePassword || !keyPassword) {
  console.error('Missing required env vars: KEYSTORE_B64, KEYSTORE_PASSWORD, KEY_PASSWORD');
  process.exit(1);
}

const keystorePath = path.join(__dirname, '..', 'upload-keystore.jks');
fs.writeFileSync(keystorePath, Buffer.from(keystoreB64, 'base64'));
console.log('Keystore written to', keystorePath);

const credentials = {
  android: {
    keystore: {
      keystorePath: './upload-keystore.jks',
      keystorePassword,
      keyAlias,
      keyPassword,
    },
  },
};

const credPath = path.join(__dirname, '..', 'credentials.json');
fs.writeFileSync(credPath, JSON.stringify(credentials, null, 2));
console.log('credentials.json written');
