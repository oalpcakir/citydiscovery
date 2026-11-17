// Cloud save with Firebase: sign-in (email + password everywhere, Google on the web) and sync of progress,
// profile and photos to Firestore. Does nothing until web/firebase-config.js provides a config.
// Data layout:  users/{uid}            { data: "<JSON of the synced store>", photoIds: [...], updated }
//               users/{uid}/photos/{id} { key, at, data: "<base64 JPEG>" }
(function () {
  "use strict";
  var SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
  var cfg = window.FIREBASE_CONFIG;
  var inShell = navigator.userAgent.indexOf("CityDiscoveryShell") !== -1;
  var api = window.cdCloud = {
    available: !!(cfg && cfg.apiKey), ready: false, user: null, busy: false, lastSync: 0, error: "",
    googleAvailable: !inShell, // Google blocks its sign-in inside embedded Android WebViews
    signIn: signIn, signUp: signUp, resetPassword: resetPassword, signInGoogle: signInGoogle, signOut: signOut,
    syncNow: syncNow, onLocalChange: onLocalChange, photoAdded: photoAdded, photoDeleted: photoDeleted
  };
  if (!api.available) return;

  var auth, fs, pushTimer = null;
  function app() { return window.cdApp; }
  function load(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = function () { rej(new Error("Could not load " + src)); };
      document.head.appendChild(s);
    });
  }
  var started = load(SDK + "firebase-app-compat.js")
    .then(function () { return Promise.all([load(SDK + "firebase-auth-compat.js"), load(SDK + "firebase-firestore-compat.js")]); })
    .then(function () {
      firebase.initializeApp(cfg);
      auth = firebase.auth();
      fs = firebase.firestore();
      api.ready = true;
      auth.onAuthStateChanged(function (u) {
        api.user = u ? { uid: u.uid, email: u.email || "", name: u.displayName || "" } : null;
        if (u) syncNow(); else changed();
      });
    })
    .catch(function (e) { api.error = e.message; changed(); });

  function changed() { if (app()) app().cloudChanged(); }
  function friendly(e) {
    var c = (e && e.code) || "";
    var map = {
      "auth/invalid-email": "That email address doesn't look right.",
      "auth/missing-password": "Enter a password.",
      "auth/weak-password": "Use a password of at least 6 characters.",
      "auth/email-already-in-use": "There is already an account with this email. Sign in instead.",
      "auth/invalid-credential": "Email or password is wrong.",
      "auth/wrong-password": "Email or password is wrong.",
      "auth/user-not-found": "No account with this email yet. Create one instead.",
      "auth/too-many-requests": "Too many attempts. Wait a moment and try again.",
      "auth/network-request-failed": "No connection. Check your internet and try again.",
      "auth/popup-closed-by-user": "Sign-in window closed before finishing.",
      "auth/operation-not-allowed": "This sign-in method isn't enabled in Firebase yet."
    };
    if (c.indexOf("auth/api-key-not-valid") === 0) return "Cloud save isn't set up correctly yet (the Firebase API key is invalid).";
    return map[c] || (e && e.message) || "Something went wrong.";
  }
  function wrap(p) { return started.then(function () { return p(); }).catch(function (e) { throw new Error(friendly(e)); }); }
  function signIn(email, pass) { return wrap(function () { return auth.signInWithEmailAndPassword(email, pass); }); }
  function signUp(email, pass) { return wrap(function () { return auth.createUserWithEmailAndPassword(email, pass); }); }
  function resetPassword(email) { return wrap(function () { return auth.sendPasswordResetEmail(email); }); }
  function signInGoogle() { return wrap(function () { return auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()); }); }
  function signOut() { return wrap(function () { return auth.signOut(); }); }

  // ── Merge: newest record wins (each record carries `u`, its last change time) ──
  function merge(local, remote) {
    var out = JSON.parse(JSON.stringify(local)), changedLocal = false;
    out.done = out.done || {};
    Object.keys((remote && remote.done) || {}).forEach(function (k) {
      var a = out.done[k], b = remote.done[k];
      if (!a || (b.u || 0) > (a.u || 0)) { out.done[k] = b; changedLocal = true; }
    });
    if (remote && remote.profile && (!out.profile || (remote.profile.updated || 0) > (out.profile.updated || 0))) {
      out.profile = remote.profile; changedLocal = true;
    }
    ["theme", "sound"].forEach(function (k) { if (out[k] === undefined && remote && remote[k] !== undefined) { out[k] = remote[k]; changedLocal = true; } });
    return { store: out, changed: changedLocal };
  }
  function synced(s) { return { done: s.done || {}, profile: s.profile || null, theme: s.theme, sound: s.sound }; }
  function userDoc() { return fs.collection("users").doc(api.user.uid); }
  function photoDoc(id) { return userDoc().collection("photos").doc(id.replace(/\//g, "~")); }

  function syncNow() {
    if (!api.user || !app()) return Promise.resolve();
    api.busy = true; changed();
    return userDoc().get().then(function (snap) {
      var remote = snap.exists && snap.data().data ? JSON.parse(snap.data().data) : null;
      var remoteIds = snap.exists ? (snap.data().photoIds || []) : [];
      var m = merge(app().getStore(), remote);
      if (m.changed) app().applyStore(m.store);
      return push().then(function () { return syncPhotos(remoteIds); });
    }).then(function () {
      api.lastSync = Date.now(); api.error = "";
    }).catch(function (e) {
      api.error = friendly(e);
    }).then(function () { api.busy = false; changed(); });
  }
  function push() {
    if (!api.user || !app()) return Promise.resolve();
    return userDoc().set({ data: JSON.stringify(synced(app().getStore())), updated: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true })
      .then(function () { api.lastSync = Date.now(); });
  }
  function onLocalChange() {
    if (!api.user) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(function () { push().then(changed).catch(function (e) { api.error = friendly(e); changed(); }); }, 1500);
  }

  // ── Photos: compressed copies, one document each ─────────
  function toCloudJpeg(blob) {
    return new Promise(function (res, rej) {
      var img = new Image(), u = URL.createObjectURL(blob);
      img.onload = function () {
        var k = Math.min(1, 1280 / Math.max(img.width, img.height)), c = document.createElement("canvas");
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(u);
        res(c.toDataURL("image/jpeg", 0.72).split(",")[1]);
      };
      img.onerror = function () { URL.revokeObjectURL(u); rej(new Error("decode")); };
      img.src = u;
    });
  }
  function upload(p) {
    return toCloudJpeg(p.blob).then(function (b64) {
      return photoDoc(p.id).set({ key: p.key, at: p.at, data: b64 });
    }).then(function () {
      return userDoc().set({ photoIds: firebase.firestore.FieldValue.arrayUnion(p.id) }, { merge: true });
    });
  }
  function syncPhotos(remoteIds) {
    return app().photos.all().then(function (local) {
      var localIds = {}, remote = {};
      local.forEach(function (p) { localIds[p.id] = p; });
      remoteIds.forEach(function (id) { remote[id] = 1; });
      var ups = local.filter(function (p) { return !remote[p.id]; }).map(upload);
      var downs = remoteIds.filter(function (id) { return !localIds[id]; }).map(function (id) {
        return photoDoc(id).get().then(function (d) {
          if (!d.exists) return;
          var v = d.data(), bin = atob(v.data), arr = new Uint8Array(bin.length);
          for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
          return app().photos.put({ id: id, key: v.key, at: v.at, blob: new Blob([arr], { type: "image/jpeg" }) });
        });
      });
      return Promise.all(ups.concat(downs)).then(function () { if (downs.length) app().photosChanged(); });
    });
  }
  function photoAdded(p) { if (api.user) upload(p).catch(function (e) { api.error = friendly(e); changed(); }); }
  function photoDeleted(id) {
    if (!api.user) return;
    photoDoc(id).delete().then(function () {
      return userDoc().set({ photoIds: firebase.firestore.FieldValue.arrayRemove(id) }, { merge: true });
    }).catch(function (e) { api.error = friendly(e); changed(); });
  }
})();
