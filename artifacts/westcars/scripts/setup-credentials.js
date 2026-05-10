/**
 * setup-credentials.js
 *
 * Generates upload-keystore.jks and credentials.json from GitHub Secrets at
 * build time. This is the ONLY authorised way to produce these files.
 *
 * Neither file should ever exist in the repository or be committed:
 *   - upload-keystore.jks  → blocked by .gitignore (*.jks)
 *   - credentials.json     → blocked by .gitignore (credentials.json)
 *
 * Required environment variables (set as GitHub Actions secrets):
 *   KEYSTORE_B64      — the .jks keystore file, base64-encoded
 *   KEYSTORE_PASSWORD — keystore file password
 *   KEY_PASSWORD      — signing key password
 *
 * See docs/keystore-rotation.md for key rotation instructions.
 */
const fs = require('fs');
const path = require('path');

const keystoreB64     = process.env.KEYSTORE_B64;
const keystorePassword = process.env.KEYSTORE_PASSWORD;
const keyPassword      = process.env.KEY_PASSWORD;
const keyAlias         = '2409d8e96f55c9e2557b4ebe6786a888';

if (!keystoreB64 || !keystorePassword || !keyPassword) {
  console.error(
    'ERROR: Missing required environment variables: KEYSTORE_B64, KEYSTORE_PASSWORD, KEY_PASSWORD\n' +
    'These must be set as GitHub Actions secrets. See docs/keystore-rotation.md for details.'
  );
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
console.log('credentials.json written (from secrets — not committed)');
