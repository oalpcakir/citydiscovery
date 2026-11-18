// Cloud save with Firebase: sign-in (email + password everywhere, Google on the web), sync of progress,
// profile and photos to Firestore, and place suggestions. Does nothing until web/firebase-config.js has a config.
// Data layout:  users/{uid}             { data: "<JSON of the synced store>", photoIds: [...], updated }
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
    syncNow: syncNow, onLocalChange: onLocalChange, photoAdded: photoAdded, photoDeleted: photoDeleted, deleteAccount: deleteAccount,
    suggest: suggest, mySuggestions: mySuggestions, allSuggestions: allSuggestions, setSuggestion: setSuggestion
  };
  if (!api.available) return;

  var auth, fs, pushTimer = null, unsub = null, dirty = false, lastPull = 0, inflight = {};
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
        stopListening();
        if (u) { syncNow(); listen(); } else changed();
      });
    })
    .catch(function (e) { api.error = e.message; changed(); });

  // Leaving the app sends any change still waiting; coming back (or back online) catches up.
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") flush();
    else if (api.user && Date.now() - lastPull > 30000) syncNow();
  });
  window.addEventListener("pagehide", flush);
  window.addEventListener("online", function () { if (api.user) syncNow(); });

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
      "auth/operation-not-allowed": "This sign-in method isn't enabled in Firebase yet.",
      "auth/requires-recent-login": "For safety, sign out, sign in again and then repeat this.",
      "permission-denied": "The cloud refused this request. Try signing out and in again."
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

  // ── Merge: the newest change wins (quest records carry `u`; saved quests carry ±time) ──
  function merge(local, remote) {
    var out = JSON.parse(JSON.stringify(local)), touched = false;
    remote = remote || {};
    out.done = out.done || {};
    Object.keys(remote.done || {}).forEach(function (k) {
      var a = out.done[k], b = remote.done[k];
      if (!a || (b.u || 0) > (a.u || 0)) { out.done[k] = b; touched = true; }
    });
    Object.keys(remote.saved || {}).forEach(function (k) {
      out.saved = out.saved || {};
      if (Math.abs(remote.saved[k]) > Math.abs(out.saved[k] || 0)) { out.saved[k] = remote.saved[k]; touched = true; }
    });
    if (remote.profile && (!out.profile || (remote.profile.updated || 0) > (out.profile.updated || 0))) { out.profile = remote.profile; touched = true; }
    // Kept badge tiers and bonus XP only ever go up (see "Earned stays earned" in the app).
    Object.keys(remote.kept || {}).forEach(function (k) {
      out.kept = out.kept || {};
      if (remote.kept[k] > (out.kept[k] || 0)) { out.kept[k] = remote.kept[k]; touched = true; }
    });
    if ((remote.bonus || 0) > (out.bonus || 0)) { out.bonus = remote.bonus; touched = true; }
    ["theme", "sound"].forEach(function (k) { if (out[k] === undefined && remote[k] !== undefined) { out[k] = remote[k]; touched = true; } });
    return { store: out, changed: touched };
  }
  function synced(s) { return { done: s.done || {}, saved: s.saved || {}, profile: s.profile || null, theme: s.theme, sound: s.sound, kept: s.kept || {}, bonus: s.bonus || 0 }; }
  function userDoc() { return fs.collection("users").doc(api.user.uid); }
  function photoDoc(id) { return userDoc().collection("photos").doc(id.replace(/\//g, "~")); }

  // Merges cloud data into this device; true when anything here changed.
  function absorb(remote) {
    if (!remote || !app()) return false;
    var m = merge(app().getStore(), remote);
    if (m.changed) app().applyStore(m.store);
    return m.changed;
  }

  // ── Live updates: a change saved on another device arrives here within about a second ──
  function listen() {
    var uid = api.user.uid;
    unsub = userDoc().onSnapshot(function (snap) {
      if (!api.user || api.user.uid !== uid || snap.metadata.hasPendingWrites || !snap.exists) return;
      var v = snap.data();
      lastPull = Date.now();
      if (v.data) absorb(JSON.parse(v.data));
      syncPhotos(v.photoIds || [], v.photoGone || []).catch(function () {});
    }, function (e) {
      unsub = null; // the listener has stopped; coming back to the app starts a fresh sync
      if (auth.currentUser) { api.error = friendly(e); changed(); }
    });
  }
  function stopListening() { if (unsub) { unsub(); unsub = null; } }

  function syncNow() {
    if (!api.user || !app()) return Promise.resolve();
    clearTimeout(pushTimer); pushTimer = null;
    api.busy = true; changed();
    fs.collection("leaderboard").doc(api.user.uid).delete().catch(function () {}); // the leaderboard was retired
    return push().then(function (r) {
      if (!unsub && api.user) listen();
      return syncPhotos(r.photoIds, r.photoGone);
    }).then(function () {
      api.error = "";
    }).catch(function (e) {
      api.error = friendly(e);
    }).then(function () { api.busy = false; changed(); });
  }
  // Reads the cloud copy, merges it with this device and writes the result in one transaction,
  // so a device that has been away can never overwrite what another device saved meanwhile.
  function push() {
    if (!api.user || !app()) return Promise.resolve({ photoIds: [], photoGone: [] });
    var ref = userDoc(), out = null;
    dirty = false;
    return fs.runTransaction(function (t) {
      return t.get(ref).then(function (snap) {
        var v = snap.exists ? snap.data() : {};
        var m = merge(app().getStore(), v.data ? JSON.parse(v.data) : null), data = JSON.stringify(synced(m.store));
        out = { store: m.store, changed: m.changed, photoIds: v.photoIds || [], photoGone: v.photoGone || [] };
        if (data !== v.data) t.set(ref, { data: data, updated: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
      });
    }).then(function () {
      if (out.changed) absorb(out.store);
      api.lastSync = lastPull = Date.now();
      return out;
    }, function (e) { dirty = true; throw e; });
  }
  function onLocalChange() {
    if (!api.user) return;
    dirty = true;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(flush, 1500);
  }
  function flush() {
    clearTimeout(pushTimer); pushTimer = null;
    if (!api.user || !dirty) return;
    push().then(changed).catch(function (e) { api.error = friendly(e); changed(); });
  }

  // ── Place suggestions (reviewed by the admins in CD_ADMINS) ─
  // suggestions/{id} { uid, by, place, cat, why, ll: [lat, lng], region, status: new|accepted|rejected|added, created }
  function suggest(s) {
    return wrap(function () {
      if (!api.user) throw new Error("Sign in first.");
      return fs.collection("suggestions").add({ uid: api.user.uid, kind: s.kind || "place", quest: s.quest || "", by: s.by, place: s.place, cat: s.cat, why: s.why, ll: s.ll,
        region: s.region || "", status: "new", created: firebase.firestore.FieldValue.serverTimestamp() });
    });
  }
  function listOf(snap) {
    return snap.docs.map(function (d) { var v = d.data(); v.id = d.id; v.at = v.created && v.created.toMillis ? v.created.toMillis() : 0; return v; })
      .sort(function (a, b) { return (a.status === "new" ? 0 : 1) - (b.status === "new" ? 0 : 1) || b.at - a.at; });
  }
  function mySuggestions() {
    return wrap(function () { return fs.collection("suggestions").where("uid", "==", api.user.uid).get().then(listOf); });
  }
  function allSuggestions() {
    return wrap(function () { return fs.collection("suggestions").get().then(listOf); });
  }
  function setSuggestion(id, status) {
    return wrap(function () { return fs.collection("suggestions").doc(id).update({ status: status }); });
  }

  // ── Delete the account and everything stored for it in the cloud ──
  function deleteAccount() {
    return wrap(function () {
      if (!api.user) throw new Error("Sign in first.");
      var quiet = function (p) { return p.catch(function () {}); };
      clearTimeout(pushTimer); stopListening();
      return userDoc().collection("photos").get().then(function (snap) {
        return Promise.all(snap.docs.map(function (d) { return d.ref.delete(); }));
      }).then(function () {
        return quiet(fs.collection("suggestions").where("uid", "==", api.user.uid).get().then(function (snap) {
          return Promise.all(snap.docs.map(function (d) { return d.ref.delete(); }));
        }));
      }).then(function () { return quiet(fs.collection("leaderboard").doc(api.user.uid).delete()); }) // entries from the retired leaderboard
        .then(function () { return userDoc().delete(); })
        .then(function () { return auth.currentUser.delete(); });
    });
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
  // One upload or download per photo at a time (live updates and a sync can ask for the same photo).
  function once(id, fn) {
    if (inflight[id]) return inflight[id];
    var p = inflight[id] = fn();
    var done = function () { delete inflight[id]; };
    p.then(done, done);
    return p;
  }
  // Deleted photos are listed in photoGone, so other devices remove their copy instead of uploading it again.
  function dropLocal(ids) {
    if (!ids.length || !window.indexedDB) return Promise.resolve();
    return new Promise(function (res) {
      var r = indexedDB.open("citydiscovery", 1); // the app's photo database (see the photo code in the app)
      r.onsuccess = function () {
        var d = r.result, t;
        try { t = d.transaction("photos", "readwrite"); } catch (e) { d.close(); res(); return; }
        ids.forEach(function (id) { t.objectStore("photos").delete(id); });
        t.oncomplete = t.onerror = t.onabort = function () { d.close(); res(); };
      };
      r.onerror = function () { res(); };
    });
  }
  function syncPhotos(remoteIds, gone) {
    return app().photos.all().then(function (local) {
      var localIds = {}, remote = {}, isGone = {};
      local.forEach(function (p) { localIds[p.id] = p; });
      remoteIds.forEach(function (id) { remote[id] = 1; });
      (gone || []).forEach(function (id) { isGone[id] = 1; });
      var ups = local.filter(function (p) { return !remote[p.id] && !isGone[p.id]; })
        .map(function (p) { return once(p.id, function () { return upload(p); }); });
      var drops = local.filter(function (p) { return isGone[p.id]; }).map(function (p) { return p.id; });
      var downs = remoteIds.filter(function (id) { return !localIds[id] && !isGone[id]; }).map(function (id) {
        return once(id, function () {
          return photoDoc(id).get().then(function (d) {
            if (!d.exists) return;
            var v = d.data(), bin = atob(v.data), arr = new Uint8Array(bin.length);
            for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
            return app().photos.put({ id: id, key: v.key, at: v.at, blob: new Blob([arr], { type: "image/jpeg" }) });
          });
        });
      });
      return Promise.all(ups.concat(downs, [dropLocal(drops)])).then(function () {
        if (downs.length || drops.length) app().photosChanged();
      });
    });
  }
  function photoAdded(p) {
    if (api.user) once(p.id, function () { return upload(p); }).catch(function (e) { api.error = friendly(e); changed(); });
  }
  function photoDeleted(id) {
    if (!api.user) return;
    var F = firebase.firestore.FieldValue;
    userDoc().set({ photoIds: F.arrayRemove(id), photoGone: F.arrayUnion(id) }, { merge: true })
      .then(function () { return photoDoc(id).delete(); })
      .catch(function (e) { api.error = friendly(e); changed(); });
  }
})();
