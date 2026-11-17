# Turning on cloud save (Firebase)

The app already contains sign-in and cloud sync (`web/cloud.js`). It stays hidden until `web/firebase-config.js` holds a Firebase config. Setup takes about five minutes and uses the free Spark plan; no billing account is needed, because photos are stored in Firestore rather than Cloud Storage.

1. **Create the project.** Go to https://console.firebase.google.com, choose *Add project*, name it (for example `city-discovery`) and skip Google Analytics.
2. **Turn on sign-in.** *Build → Authentication → Get started → Sign-in method*:
   - enable **Email/Password**;
   - enable **Google** (pick your support email). Google sign-in shows up on the website only; the Android app uses email, because Google blocks its sign-in inside app WebViews.
3. **Allow the website.** *Authentication → Settings → Authorized domains → Add domain*: `oalpcakir.github.io`.
4. **Create the database.** *Build → Firestore Database → Create database*, start in **production mode**, location **eur3 (europe-west)**.
5. **Protect it.** *Firestore → Rules*: replace everything with the contents of [`firestore.rules`](../firestore.rules) and press *Publish*. Each explorer can then only read and write their own data.
6. **Get the config.** *Project settings (gear) → General → Your apps → Web (`</>`)*, register an app called `City Discovery` (no hosting needed) and copy the `firebaseConfig` object.
7. **Plug it in.** Paste it into `web/firebase-config.js` as `window.FIREBASE_CONFIG = { ... };` and push. The config values are public identifiers, not secrets; the rules from step 5 are what keep data private.

After the push, the Hero tab shows *Account → Sign in or create an account*. Signing in merges what is on the device with what is in the cloud (the newest change wins per quest), then keeps both in sync. Photos are uploaded as compressed copies (max 1280 px).
