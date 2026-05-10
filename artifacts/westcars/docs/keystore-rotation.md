# Android Upload Keystore — Security & Rotation Runbook

## Where the keystore lives

The Android upload keystore is stored **only in GitHub Secrets** — never in the repository or workspace. The files `upload-keystore.jks` and `credentials.json` are generated at build time by `scripts/setup-credentials.js` from environment variables and exist only for the duration of the EAS build. Both files are blocked from commits by `.gitignore`.

| Secret name         | What it contains                                  |
|---------------------|---------------------------------------------------|
| `KEYSTORE_B64`      | The `.jks` keystore file, base64-encoded          |
| `KEYSTORE_PASSWORD` | Password for the keystore file itself             |
| `KEY_PASSWORD`      | Password for the signing key inside the keystore  |

Location of secrets: GitHub repo → **Settings → Secrets and variables → Actions**

---

## How CI signing works

During an EAS production build the following happens automatically:

1. `eas.json` `prebuildCommand` runs `sh scripts/run-setup-credentials.sh`
2. That script calls `node scripts/setup-credentials.js`
3. `setup-credentials.js` reads `KEYSTORE_B64`, decodes it to `upload-keystore.jks`, and writes `credentials.json` with the passwords
4. EAS picks up `credentials.json` (via `credentialsSource: "local"`) and signs the AAB
5. Both generated files are deleted when the EAS build runner terminates

No plaintext keystore or passwords ever enter the git history.

---

## How to rotate the keystore (generate a new one)

Run on your local machine (requires Java JDK 8+):

```bash
keytool -genkeypair \
  -v \
  -storetype PKCS12 \
  -keystore new-upload-keystore.jks \
  -alias upload \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

You will be prompted for:
- **Keystore password** — use a strong random value (e.g. `openssl rand -hex 20`)
- **Key password** — use a different strong random value
- Distinguished name fields (name, org, city, country)

Keep a note of both passwords — you will need them for the GitHub Secrets update below.

---

## How to update GitHub Secrets after rotating

1. Base64-encode the new keystore:
   ```bash
   # macOS / Linux
   base64 -i new-upload-keystore.jks | tr -d '\n' > keystore_b64.txt
   ```

2. Open the GitHub repo → **Settings → Secrets and variables → Actions**

3. Update the three secrets:
   - **`KEYSTORE_B64`** — paste the full contents of `keystore_b64.txt`
   - **`KEYSTORE_PASSWORD`** — the keystore password chosen above
   - **`KEY_PASSWORD`** — the key password chosen above

4. Delete `keystore_b64.txt` and `new-upload-keystore.jks` from your machine.

5. Trigger a test build: GitHub Actions → **EAS Build (Android Production)** → **Run workflow**. Confirm the build succeeds and the AAB is signed.

---

## Google Play App Signing note

If you are enrolled in **Google Play App Signing** (recommended), the keystore used in CI is your *upload key*, not the final app signing key (Google holds that). To rotate the upload key:

1. Go to Play Console → **Setup → App integrity → Upload key certificate**
2. Request an upload key reset by following Google's process
3. Generate a new keystore (steps above) and send the certificate to Google for verification
4. Once Google confirms, update GitHub Secrets (steps above)

If you are **not** enrolled in Play App Signing, this keystore IS your app signing key. Losing it means you cannot publish updates to the same listing. Keep a secure offline backup (e.g. encrypted cloud storage or a password manager).

---

## Emergency: keystore or passwords may be compromised

1. **Immediately** generate a new keystore and update all three GitHub Secrets so no further builds use the compromised key.
2. If enrolled in Play App Signing, file an upload-key reset request with Google Play support.
3. Audit the git log — if `upload-keystore.jks` or `credentials.json` were ever committed by mistake, treat the key as compromised and rotate regardless.
4. Revoke any other secrets (API keys, tokens) that may have been exposed at the same time.

---

## Files that must never be committed

Already in `artifacts/westcars/.gitignore`:

```
*.jks
credentials.json
upload-keystore.jks
new-upload-key.jks
play-store-service-account.json
GoogleService-Info.plist
```

Do not remove these entries. Run `git ls-files | grep -E '\.jks|credentials\.json'` periodically to confirm none slipped through.
