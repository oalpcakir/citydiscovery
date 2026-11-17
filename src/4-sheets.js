  // ── Sheets ─────────────────────────────────────────────────
  // On the map a quest opens as a card floating above the nav bar, so the map stays usable; elsewhere it is a modal sheet.
  function showSheet(cls, html, modal) {
    var card = ui.tab === "map" && !modal;
    $sheet.className = cls + (card ? " mapcard" : "");
    $sheet.innerHTML = '<div class="grab"></div>' + html;
    $sheet.hidden = false; $backdrop.hidden = card;
    document.body.classList.toggle("card-open", card);
    $sheet.scrollTop = 0;
    fillPhotos($sheet);
  }
  function closeSheetSilently() {
    saveNote();
    ui.open = null; $sheet.hidden = true; $backdrop.hidden = true;
    document.body.classList.remove("card-open");
  }
  function closeSheet() {
    closeSheetSilently();
    setSelected(null);
    render();
    if (ui.lastDone) {
      var q = byKey[ui.lastDone];
      ui.lastDone = null;
      if (ui.tab === "map") setTimeout(function () { pulseAt(q); }, 150);
    }
  }
  var X = '<button class="x" data-act="close" aria-label="Close">' + ic("x") + '</button>';

  function openQuest(q) {
    if (q.cid !== cityId) setCurrent(q.cid);
    openSheet(q.key);
  }
  function rewardHtml(q) {
    if (isDone(q)) {
      var g = progress().gains.filter(function (x) { return x.q === q; })[0];
      return g ? '<div class="reward done">' + ic("check", "sm") + 'You earned +' + g.xp + ' XP here' + (rec(q).v ? " · checked in" : "") + '</div>' : "";
    }
    var pv = progress(q.key).gains.filter(function (x) { return x.preview; })[0];
    if (!pv) return "";
    return '<div class="reward"><b>+' + pv.xp + ' XP</b>' + pv.parts.slice(1).map(function (x) {
      return '<span>' + esc(x[0]) + ' +' + x[1] + '</span>';
    }).join("") + '</div>';
  }
  function openSheet(key) {
    var q = byKey[key];
    if (!q) return;
    if (ui.open && ui.open !== key) saveNote();
    ui.open = key;
    var c = cities[q.cid], r = rec(q) || {}, done = isDone(q), ph = photoOf(q), saved = isSaved(q);
    var tags = (q.tags || []).slice();
    if (q.months) tags.push("season: " + seasonText(q));
    var maps = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q.q || q.title + " " + c.name);
    var report = REPO + "/issues/new?title=" + encodeURIComponent("Quest problem: " + q.title) + "&body=" +
      encodeURIComponent("Quest: " + q.key + "\n\nWhat is wrong (closed, moved, wrong pin, wrong info)?\n");
    showSheet(q.cat + (ph ? " hasph" : ""), X +
      (ph ? '<div class="cover" style="background-image:url(' + esc(ph[0]) + ')"><a href="' + esc(ph[3]) + '" target="_blank" rel="noopener">Photo: ' +
        esc(ph[1]) + ' · ' + esc(ph[2]) + '</a></div>' : "") +
      '<div class="sh"><span class="tile">' + ic(CATS[q.cat].icon) + '</span><div class="grow">' +
        '<span class="badge">' + CATS[q.cat].label + " · " + esc(c.areas[q.area]) + '</span>' +
        '<h3>' + esc(q.title) + '</h3></div></div>' + rewardHtml(q) +
      '<div class="two">' +
        '<button class="btn' + (done ? " ghost" : " go") + '" data-act="toggle-open">' + ic("check") + (done ? "Done · undo" : "I did it!") + '</button>' +
        '<a class="btn ghost" href="' + maps + '" target="_blank" rel="noopener">' + ic("navigation") + 'Directions</a></div>' +
      '<div class="two">' +
        (done ? "" : '<button class="btn soft" data-act="checkin">' + ic("map-pin") + 'Check in +' + XP.checkin + '</button>') +
        '<button class="btn soft' + (saved ? " on" : "") + '" data-act="save-quest">' + ic("bookmark") + (saved ? "Saved" : "Save for later") + '</button></div>' +
      (tags.length ? '<div class="tags">' + tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join("") + '</div>' : "") +
      '<p>' + esc(q.desc) + '</p>' +
      (q.tip ? '<p class="tip"><b>Tip:</b> ' + esc(q.tip) + '</p>' : "") +
      (done ? '<label class="lbl">Memories</label>' + photoRow(q.key) : "") +
      '<label class="lbl" for="note">Journal' + (r.at ? " · done on " + new Date(r.at).toLocaleDateString("en-GB") : "") +
        ' <small>(+' + XP.journal + ' XP once the quest is done)</small></label>' +
      '<textarea id="note" placeholder="How was it? Who came along?">' + esc(r.note || "") + '</textarea>' +
      '<div class="foot">' +
        (ui.tab !== "map" && ll(q) ? '<button data-act="to-map">' + ic("map", "sm") + 'Show on map</button>' : "") +
        '<a href="' + report + '" target="_blank" rel="noopener">' + ic("triangle-alert", "sm") + 'Report a problem</a>' +
        (q.src && q.src.length ? '<span>Sources: ' + q.src.map(function (u) {
          return '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(u.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]) + '</a>';
        }).join(", ") + '</span>' : "") + '</div>');
    if (ui.tab === "map") { setSelected(q); focusQuest(q); }
  }
  function saveNote() {
    var el = document.getElementById("note");
    if (!el || !ui.open || $sheet.hidden) return;
    var k = ui.open, note = el.value.trim(), r = store.done[k];
    if (!r && !note) return;
    r = r || { at: 0 };
    if ((r.note || "") === note) return;
    r.note = note; r.u = Date.now();
    store.done[k] = r;
    save();
  }
  function toggleSaved(key) {
    store.saved = store.saved || {};
    var on = store.saved[key] > 0;
    store.saved[key] = on ? -Date.now() : Date.now();
    save();
    toast(on ? "Removed from Saved" : "Saved for later");
  }
  // Marks a quest done or not done. Returns what changed (null when undoing).
  function toggle(key, opts) {
    var q = byKey[key];
    if (!q) return null;
    var c = cities[q.cid], r = store.done[key] || {};
    var before = progress(), beforeBadges = earnedKeys(badges(c)), beforeTrails = trails.filter(trailDone);
    var nowDone = !r.at, dq = dailyQuest();
    if (nowDone) {
      r.at = Date.now();
      if (opts && opts.v) r.v = 1;
      if (dq && dq.key === key) r.d = dayKey();
    } else { r.at = 0; delete r.v; delete r.d; }
    r.u = Date.now(); store.done[key] = r;
    save();
    if (!nowDone) { toast("Marked as not done"); return null; }
    var after = progress();
    return {
      q: q, before: before, after: after, gained: after.xp - before.xp,
      fresh: badges(c).filter(function (b) { return b.tier && !beforeBadges[b.id + ":" + b.tier]; }),
      unlocks: UNLOCKS.filter(function (u) { return u.level > before.level && u.level <= after.level; }),
      trails: trails.filter(function (t) { return trailDone(t) && beforeTrails.indexOf(t) === -1; })
    };
  }
  function checkIn(key) {
    var q = byKey[key];
    if (!q || !ll(q)) return;
    toast("Checking where you are…");
    whereAmI().then(function (p) {
      var d = km(p, ll(q));
      if (d > 0.25) { toast("You are " + kmText(d) + " away. Get within 250 m to check in."); return; }
      saveNote();
      var res = toggle(key, { v: true });
      closeSheet();
      showComplete(res);
    }, function () { toast("Could not get your location. Check the location permission."); });
  }
  // The "quest complete" moment: confetti, a chime, a buzz, the XP counting up and the level bar filling.
  function showComplete(res) {
    if (!res) return;
    var q = res.q, b = res.before, a = res.after, lu = a.level > b.level;
    var g = a.gains.filter(function (x) { return x.q === q; })[0], parts = g ? g.parts.slice() : [];
    res.trails.forEach(function (t) { parts.push([t.name, TRAIL_XP]); });
    ui.lastDone = q.key;
    var html = '<div class="qc">' +
      '<div class="qc-badge ' + q.cat + '"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="23"/><path d="M15 27l7.5 7.5L37 19"/></svg></div>' +
      '<div class="qc-k">Quest complete</div><h3 class="qc-t">' + esc(q.title) + '</h3>' +
      '<div class="qc-xp">+<b id="qcxp">0</b> XP</div>' +
      '<div class="qc-parts">' + parts.map(function (p, i) {
        return '<span style="animation-delay:' + (350 + i * 110) + 'ms">' + esc(p[0]) + ' +' + p[1] + '</span>';
      }).join("") + '</div>' +
      '<div class="qc-lv"><span id="qclv">Lv ' + b.level + '</span><div class="meter xp"><i id="qcbar" style="width:' + b.pct + '%"></i></div><span id="qcnx">Lv ' + (b.level + 1) + '</span></div>';
    if (lu) {
      html += '<div class="levelup"><div class="burst">' + profile().avatar + '</div><div class="cel-h">Level ' + a.level + '!</div>' +
        '<div class="lu">' + (a.title !== b.title ? 'New title: <b>' + esc(a.title) + '</b>' : esc(a.title)) + '</div>' +
        (res.unlocks.length ? '<div class="unl">' + res.unlocks.map(function (u) { return '<span>' + ic("lock", "sm") + esc(unlockLabel(u)) + '</span>'; }).join("") + '</div>' : "") + '</div>';
    }
    res.trails.forEach(function (t) {
      html += '<div class="cel gold"><div class="bi">🥾</div><div><div class="bn">Trail complete: ' + esc(t.name) + '</div><div class="bd">All ' + t.quests.length + ' stops done · +' + TRAIL_XP + ' XP</div></div></div>';
    });
    if (res.fresh.length) {
      html += '<div class="cel-h small">' + (res.fresh.length > 1 ? "New badges!" : "New badge!") + '</div>' +
        res.fresh.map(function (bd) {
          var cls = bd.max === 1 ? "gold" : TIERS[bd.tier - 1].key, xp = bd.max === 1 ? SPECIAL_XP : TIERS[bd.tier - 1].xp;
          return '<div class="cel ' + cls + '"><div class="bi">' + bd.icon + '</div><div><div class="bn">' + esc(bd.name) +
            (bd.max > 1 ? " · " + TIERS[bd.tier - 1].label : "") + '</div><div class="bd">' + esc(bd.desc) + ' · +' + xp + ' XP</div></div></div>';
        }).join("");
    }
    html += '<div class="qc-mem"><div class="qc-k2">Capture the memory</div>' + photoRow(q.key) +
      '<textarea id="note" placeholder="A line for your journal (+' + XP.journal + ' XP)">' + esc((rec(q) || {}).note || "") + '</textarea></div>' +
      '<div class="actions"><button class="btn" data-act="close">Done</button>' +
      (lu ? '<button class="btn ghost" data-act="share">' + ic("share-2") + 'Share your level</button>' : "") + '</div></div>';
    closeSheetSilently();
    showSheet("complete", html, true);
    ui.open = q.key;
    chime(lu || res.fresh.length > 0 || res.trails.length > 0);
    buzz(lu ? [40, 60, 40, 60, 140] : [30, 50, 80]);
    confetti(lu || res.trails.length > 0);
    countUp(document.getElementById("qcxp"), 0, res.gained, 1100);
    var barEl = document.getElementById("qcbar");
    setTimeout(function () {
      if (!barEl) return;
      if (!lu) { barEl.style.width = a.pct + "%"; return; }
      barEl.style.width = "100%";
      setTimeout(function () {
        barEl.style.transition = "none"; barEl.style.width = "0%";
        document.getElementById("qclv").textContent = "Lv " + a.level;
        document.getElementById("qcnx").textContent = "Lv " + (a.level + 1);
        setTimeout(function () { barEl.style.transition = ""; barEl.style.width = a.pct + "%"; }, 40);
      }, 750);
    }, 450);
  }
  function suggest() {
    var pool = city.quests.filter(function (q) { return !isDone(q) && inSeason(q); });
    var filtered = pool.filter(function (q) {
      return (ui.cat === "all" || q.cat === ui.cat) && (ui.area === "all" || q.area === ui.area);
    });
    if (filtered.length) pool = filtered;
    if (!pool.length) { toast("Nothing left to do here"); return; }
    openSheet(pool[Math.floor(Math.random() * pool.length)].key);
  }
  function openTrail(id) {
    var t = trailById[id];
    if (!t) return;
    var s = trailStats(t);
    closeSheetSilently();
    showSheet("trailsheet", X + '<div class="sh"><span class="tile acc">' + ic(t.icon) + '</span><div class="grow">' +
      '<span class="badge acc">Trail · ' + t.quests.length + ' stops · ' + kmText(t.km) + '</span><h3>' + esc(t.name) + '</h3></div></div>' +
      '<div class="reward">' + (s.done === s.total ? '<b>Complete</b>' : '<b>+' + TRAIL_XP + ' XP</b><span>for finishing all ' + s.total + ' stops</span><span>' + s.done + ' / ' + s.total + ' done</span>') + '</div>' +
      '<div class="list flush">' + t.quests.map(function (q, i) { return questRow(q, { n: i + 1 }); }).join("") + '</div>' +
      '<div class="actions"><button class="btn" data-act="trail-map" data-id="' + esc(id) + '">' + ic("route") + 'Show the route on the map</button></div>', true);
  }
  function openRegions() {
    closeSheetSilently();
    showSheet("regions", X + '<div class="cel-h">Choose a region</div>' + regionRows(), true);
  }
  function openPhoto(id, key) {
    var q = byKey[key];
    photosFor(key).then(function (list) {
      var p = list.filter(function (x) { return x.id === id; })[0];
      if (!p) return;
      closeSheetSilently();
      showSheet("photo", X + '<img class="lb" src="' + photoUrl(p) + '" alt="">' +
        '<div class="lb-t">' + esc(q ? q.title : "") + '</div><div class="note">' + new Date(p.at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) + '</div>' +
        '<div class="two" style="margin-top:12px"><button class="btn ghost" data-open="' + esc(key) + '">Open quest</button>' +
        '<button class="btn plain danger" data-act="photo-del" data-id="' + esc(id) + '" data-key="' + esc(key) + '">' + ic("trash-2") + 'Delete</button></div>', true);
    });
  }

  // ── Share card ─────────────────────────────────────────────
  function shareCard() {
    var p = progress(), pr = profile(), c = document.createElement("canvas"), W = 1080, H = 1350, ac = accent();
    c.width = W; c.height = H;
    var g = c.getContext("2d"), grad = g.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, ac); grad.addColorStop(1, mixHex(/^#[0-9a-f]{6}$/i.test(ac) ? ac : "#0e9f6e", "#0f172a", 0.55));
    g.fillStyle = grad; g.fillRect(0, 0, W, H);
    g.globalAlpha = 0.08; g.fillStyle = "#fff";
    for (var i = 0; i < 7; i++) { g.beginPath(); g.arc(W * (0.1 + 0.15 * i), H * (i % 2 ? 0.18 : 0.86), 120 + 30 * i, 0, 7); g.fill(); }
    g.globalAlpha = 1; g.textAlign = "center"; g.textBaseline = "middle";
    g.beginPath(); g.arc(W / 2, 360, 190, 0, 7); g.fillStyle = "#fff"; g.fill();
    g.font = "220px 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif"; g.fillText(pr.avatar, W / 2, 375);
    g.fillStyle = "#fff"; g.font = "800 92px system-ui, sans-serif"; g.fillText(pr.name || "Explorer", W / 2, 660);
    g.font = "600 54px system-ui, sans-serif"; g.globalAlpha = 0.9; g.fillText("Level " + p.level + " · " + heroTitle(p), W / 2, 750); g.globalAlpha = 1;
    [[p.quests, "quests"], [p.regions, "regions"], [p.badges, "badges"]].forEach(function (x, k) {
      var cx = W / 2 + (k - 1) * 300;
      g.globalAlpha = 0.16; g.fillStyle = "#fff"; g.fillRect(cx - 130, 860, 260, 210); g.globalAlpha = 1;
      g.font = "800 96px system-ui, sans-serif"; g.fillText(String(x[0]), cx, 945);
      g.font = "600 40px system-ui, sans-serif"; g.fillText(x[1], cx, 1025);
    });
    g.font = "700 46px system-ui, sans-serif"; g.globalAlpha = 0.85;
    g.fillText(fmt(p.xp) + " XP" + (p.streak ? "  ·  " + p.streak + "-week streak" : ""), W / 2, 1160);
    g.font = "800 44px system-ui, sans-serif"; g.globalAlpha = 1; g.fillText("CITY DISCO", W / 2, 1265);
    c.toBlob(function (blob) {
      if (!blob) return;
      ui.shareBlob = blob;
      var url = URL.createObjectURL(blob);
      var can = !!(navigator.canShare && navigator.canShare({ files: [new File([blob], "city-disco.png", { type: "image/png" })] }));
      closeSheetSilently();
      showSheet("share", X + '<div class="cel-h">Your explorer card</div><img class="lb sharecard" src="' + url + '" alt="Your explorer card">' +
        '<div class="actions">' + (can ? '<button class="btn" data-act="share-send">' + ic("share-2") + 'Share</button>' : "") +
        '<a class="btn ghost" href="' + url + '" download="city-disco.png">' + ic("download") + 'Save image</a>' +
        '<p class="note center">On Android, press and hold the picture to save or share it.</p></div>', true);
    }, "image/png");
  }

  // ── Profile editor (also the first-run onboarding) ─────────
  function pickBtn(type, value, face, cur, lockedAt) {
    return '<button class="pk' + (cur === value ? " on" : "") + (lockedAt ? " locked" : "") + '" data-pick="' + type + '" data-v="' + esc(value) + '"' +
      (lockedAt ? ' disabled' : '') + '>' + face + (lockedAt ? '<small>Lv ' + lockedAt + '</small>' : '') + '</button>';
  }
  function openProfile(first) {
    var pr = profile(), lv = progress().level;
    ui.draft = JSON.parse(JSON.stringify(pr));
    var lockAt = function (u) { return u.level > lv ? u.level : 0; };
    var of = function (type) { return UNLOCKS.filter(function (u) { return u.type === type; }); };
    var html = (first ? '<div class="welcome">' + ic("map-pin") + '</div>' : X) +
      '<div class="cel-h">' + (first ? "Welcome to City Disco" : "Your explorer") + '</div>' +
      (first ? '<p class="note center" style="margin-top:-6px">Rediscover the Netherlands and Belgium one quest at a time. Earn XP, level up and unlock new looks.</p>' : "") +
      '<label class="lbl" for="pname">Explorer name</label><input id="pname" class="inp" maxlength="24" placeholder="e.g. Tulip Ranger" value="' + esc(pr.name) + '">' +
      '<label class="lbl">Avatar</label><div class="pick">' + of("avatar").map(function (u) {
        return pickBtn("avatar", u.value, '<span class="pe">' + u.value + '</span>', pr.avatar, lockAt(u));
      }).join("") + '</div>' +
      '<label class="lbl">Class <small>(a bonus for your travel style)</small></label><div class="pick cls">' + Object.keys(CLASSES).map(function (k) {
        var c = CLASSES[k];
        return pickBtn("cls", k, '<span class="pe">' + c.icon + '</span><span class="pc"><b>' + c.name + '</b><small>' + c.desc + '</small></span>', pr.cls, 0);
      }).join("") + '</div>' +
      '<label class="lbl" for="phome">Home region <small>(your quest of the day comes from here)</small></label><select id="phome" class="inp">' + Object.keys(cities).map(function (id) {
        return '<option value="' + id + '"' + ((pr.home || cityId) === id ? " selected" : "") + '>' + esc(cities[id].name) + ' (' + esc(cities[id].country) + ')</option>';
      }).join("") + '</select>';
    if (!first) {
      html += '<label class="lbl">Frame</label><div class="pick">' + of("frame").map(function (u) {
          return pickBtn("frame", u.value, '<span class="pe fr fr-' + u.value + '">' + pr.avatar + '</span><small class="pn">' + u.name + '</small>', pr.frame, lockAt(u));
        }).join("") + '</div><label class="lbl">Colour</label><div class="pick">' + of("accent").map(function (u) {
          return pickBtn("accent", u.value, '<span class="pe sw" style="background:' + u.color + '"></span><small class="pn">' + u.name + '</small>', pr.accent, lockAt(u));
        }).join("") + '</div><label class="lbl">Title</label><div class="pick">' + pickBtn("title", "", '<span class="pt">Automatic</span>', pr.title, 0) +
        TITLES.map(function (t) { return pickBtn("title", t[1], '<span class="pt">' + t[1] + '</span>', pr.title, t[0] > lv ? t[0] : 0); }).join("") + '</div>';
    }
    html += '<div class="actions"><button class="btn" data-act="save-profile" data-first="' + (first ? 1 : 0) + '">' + (first ? "Start exploring" : "Save") + '</button>' +
      (first ? '<button class="btn plain" data-act="skip-profile">Skip for now</button>' : "") + '</div>';
    closeSheetSilently();
    showSheet("editor", html, true);
  }
  function saveProfile(first) {
    var d = ui.draft || profile();
    d.name = ((document.getElementById("pname") || {}).value || "").trim().slice(0, 24);
    d.home = (document.getElementById("phome") || {}).value || d.home;
    d.created = (store.profile && store.profile.created) || Date.now();
    d.updated = Date.now();
    store.profile = d;
    save();
    applyAccent();
    closeSheet();
    if (first && d.home) setCity(d.home, true);
    toast(first ? "Welcome, " + (d.name || "explorer") + "! Your first quest awaits." : "Profile saved");
  }

  // ── Account (cloud save, see cloud.js) ─────────────────────
  function openAuth(mode) {
    var C = window.cdCloud, up = mode === "signup";
    ui.authMode = up ? "signup" : "signin";
    closeSheetSilently();
    showSheet("auth", X + '<div class="welcome">' + ic("cloud") + '</div><div class="cel-h">' + (up ? "Create your account" : "Welcome back") + '</div>' +
      '<p class="note center" style="margin-top:-6px">Your explorer, progress and photos, safe in the cloud.</p>' +
      (C.googleAvailable ? '<button class="btn ghost gbtn" data-act="auth-google"><b>G</b> Continue with Google</button><div class="or"><span>or with email</span></div>' : "") +
      '<label class="lbl" for="aemail">Email</label><input id="aemail" class="inp" type="email" autocomplete="email" inputmode="email">' +
      '<label class="lbl" for="apass">Password</label><input id="apass" class="inp" type="password" minlength="6" autocomplete="' + (up ? "new-password" : "current-password") + '">' +
      '<p class="note err" id="aerr" hidden></p>' +
      '<div class="actions"><button class="btn" data-act="auth-submit">' + (up ? "Create account" : "Sign in") + '</button>' +
      '<button class="btn plain" data-act="auth-switch">' + (up ? "I already have an account" : "New here? Create an account") + '</button>' +
      (up ? "" : '<button class="btn plain" data-act="auth-reset">Forgot your password?</button>') + '</div>', true);
  }
  function authError(msg) {
    var el = document.getElementById("aerr");
    if (el) { el.textContent = msg; el.hidden = !msg; }
  }
  function authDo(promise, done) {
    var btns = $sheet.querySelectorAll(".actions .btn, .gbtn"), set = function (on) { [].forEach.call(btns, function (b) { b.disabled = on; }); };
    set(true); authError("");
    promise.then(function () { set(false); if (done) done(); }, function (e) { set(false); authError(e.message); });
  }
  window.cdApp = {
    getStore: function () { return store; },
    applyStore: function (s2) {
      store = s2; store.done = store.done || {};
      migrateMoved();
      try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { /* ignore */ }
      applyTheme(); applyAccent();
      if ($sheet.hidden) render();
    },
    // What the leaderboard shows about you (null when you have not joined).
    getScore: function () {
      if (!store.lb) return null;
      var p = progress(), pr = profile();
      return { name: pr.name || "Explorer", avatar: pr.avatar, title: heroTitle(p), level: p.level, xp: p.xp, quests: p.quests, regions: p.regions, updated: Date.now() };
    },
    cloudChanged: function () {
      var C = window.cdCloud, box = document.getElementById("account"), board = document.getElementById("board");
      if (box) box.innerHTML = accountHtml();
      if (board) { board.innerHTML = boardHtml(); loadBoard(); }
      if (C && C.user && !$sheet.hidden && $sheet.classList.contains("auth")) { closeSheet(); toast("Signed in as " + (C.user.email || C.user.name)); }
    },
    photos: { all: allPhotos, put: function (rec2) { return tx("readwrite", function (st) { st.put(rec2); }); } },
    photosChanged: function () { fillMemories(); }
  };
  // Photos saved under a quest key that has since moved region follow it.
  function migratePhotoKeys() {
    var M = window.MOVED || {};
    allPhotos().then(function (list) {
      var stale = list.filter(function (ph) { return M[ph.key]; });
      if (stale.length) tx("readwrite", function (st) { stale.forEach(function (ph) { ph.key = M[ph.key]; st.put(ph); }); });
    }).catch(function () {});
  }

  var toastTimer;
  function toast(msg) {
    $toast.textContent = msg; $toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { $toast.hidden = true; }, 2600);
  }
  function exportData() {
    var text = JSON.stringify(store);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast("Copied to clipboard"); }, function () { prompt("Copy this:", text); });
    } else prompt("Copy this:", text);
  }
  function importData() {
    var text = prompt("Paste your backup text:");
    if (!text) return;
    try {
      var s = JSON.parse(text);
      if (!s || typeof s.done !== "object") throw new Error("format");
      Object.keys(s.done).forEach(function (k) { store.done[k] = s.done[k]; });
      if (s.profile && !store.profile) store.profile = s.profile;
      if (s.saved) { store.saved = store.saved || {}; Object.keys(s.saved).forEach(function (k) { store.saved[k] = s.saved[k]; }); }
      migrateMoved(); save(); applyAccent(); render(); toast("Backup restored");
    } catch (e) { toast("Could not read the backup"); }
  }
  function nearMe() {
    if (ui.near) { ui.near = false; render(); return; }
    toast("Finding you…");
    whereAmI().then(function () { ui.near = true; render(); }, function () { toast("Could not get your location. Check the location permission."); });
  }

  // ── Events ─────────────────────────────────────────────────
  var SEL = "[data-toggle],[data-open],[data-f],[data-tab],[data-act],[data-city],[data-theme-set],[data-pick],[data-photo-id],[data-qview],[data-trail]";
  document.addEventListener("click", function (e) {
    var t = e.target.closest(SEL);
    if (!t) { if (e.target === $backdrop) closeSheet(); return; }
    var d = t.dataset, res, q;
    if (d.toggle) {
      var inSheet = !$sheet.hidden && $sheet.contains(t);
      res = toggle(d.toggle);
      if (inSheet && !res) { openTrail(ui.trailOpen); return; }
      render();
      showComplete(res);
      return;
    }
    if (d.photoId) { openPhoto(d.photoId, d.photoKey); return; }
    if (d.pick) {
      if (t.disabled) return;
      ui.draft = ui.draft || profile();
      ui.draft[d.pick] = d.v;
      [].forEach.call(t.parentNode.querySelectorAll(".pk"), function (n) { n.classList.remove("on"); });
      t.classList.add("on");
      return;
    }
    if (d.themeSet) { store.theme = d.themeSet; save(); switchTheme(); render(); return; }
    if (d.qview) { ui.qview = d.qview; render(); return; }
    if (d.trail) { ui.trailOpen = d.trail; openTrail(d.trail); return; }
    if (d.open) { q = byKey[d.open]; closeSheetSilently(); if (q) openQuest(q); return; }
    if (d.city) { closeSheetSilently(); ui.tab = "map"; ui.trail = null; setCity(d.city, true); return; }
    if (d.f) {
      ui[d.f] = d.v; render();
      if (ui.tab === "map" && d.f === "area") flyToArea();
      return;
    }
    if (d.tab) { closeSheetSilently(); ui.tab = d.tab; render(); window.scrollTo(0, 0); return; }
    switch (d.act) {
      case "suggest": suggest(); break;
      case "regions": openRegions(); break;
      case "overview": showOverview(); break;
      case "zoom-in": if (map) map.zoomIn(); break;
      case "zoom-out": if (map) map.zoomOut(); break;
      case "tilt": toggleTilt(); break;
      case "locate": locate(); break;
      case "near": nearMe(); break;
      case "map-retry": retryMap(); break;
      case "close": closeSheet(); break;
      case "toggle-open": saveNote(); res = toggle(ui.open); closeSheet(); showComplete(res); break;
      case "checkin": checkIn(ui.open); break;
      case "save-quest": q = ui.open; saveNote(); toggleSaved(q); openSheet(q); break;
      case "to-map":
        q = byKey[ui.open];
        closeSheet(); ui.tab = "map"; ui.cat = "all"; ui.area = "all"; render();
        if (q) openSheet(q.key);
        break;
      case "trail-map": {
        var tr = trailById[d.id];
        closeSheetSilently(); ui.trail = d.id; ui.tab = "map"; ui.cat = "all"; ui.area = "all";
        if (tr.cid !== cityId) setCurrent(tr.cid); else render();
        setTimeout(function () { fitPoints(tr.quests.map(ll), 16); }, 60);
        toast(tr.name + ": follow the dotted line");
        break;
      }
      case "share": shareCard(); break;
      case "share-send":
        if (ui.shareBlob && navigator.share) {
          navigator.share({ files: [new File([ui.shareBlob], "city-disco.png", { type: "image/png" })], title: "My City Disco explorer" }).catch(function () {});
        }
        break;
      case "profile": openProfile(false); break;
      case "save-profile": saveProfile(d.first === "1"); break;
      case "skip-profile": store.profile = profile(); store.profile.created = store.profile.updated = Date.now(); save(); closeSheet(); break;
      case "photo-del": if (confirm("Delete this photo? This cannot be undone.")) deletePhoto(d.id, d.key); break;
      case "sound": store.sound = store.sound === false; save(); render(); if (store.sound) chime(false); break;
      case "lb-on": case "lb-toggle":
        store.lb = d.act === "lb-on" ? true : !store.lb;
        if (window.cdCloud) window.cdCloud.board = null;
        save(); render();
        if (store.lb && window.cdCloud && !window.cdCloud.user) toast("Sign in to appear on the leaderboard");
        break;
      case "auth": openAuth("signin"); break;
      case "auth-switch": openAuth(ui.authMode === "signup" ? "signin" : "signup"); break;
      case "auth-submit": {
        var em = document.getElementById("aemail").value.trim(), pw = document.getElementById("apass").value;
        if (!em || !pw) { authError("Enter your email and a password."); break; }
        authDo(ui.authMode === "signup" ? window.cdCloud.signUp(em, pw) : window.cdCloud.signIn(em, pw));
        break;
      }
      case "auth-reset": {
        var em2 = document.getElementById("aemail").value.trim();
        if (!em2) { authError("Enter your email first, then tap this again."); break; }
        authDo(window.cdCloud.resetPassword(em2), function () { toast("Check your inbox for a reset link"); });
        break;
      }
      case "auth-google": authDo(window.cdCloud.signInGoogle()); break;
      case "signout": window.cdCloud.signOut().then(function () { toast("Signed out. Your progress stays on this device."); render(); }); break;
      case "sync": window.cdCloud.syncNow(); break;
      case "export": exportData(); break;
      case "import": importData(); break;
    }
  });
  document.addEventListener("input", function (e) {
    if (e.target.id !== "qsearch") return;
    ui.q = e.target.value;
    var box = document.getElementById("qlist");
    if (box) box.innerHTML = questListHtml();
  });
  document.addEventListener("change", function (e) {
    var key = e.target && e.target.dataset && e.target.dataset.photo;
    // Copy the files first: clearing the input empties its live FileList.
    if (key && e.target.files && e.target.files.length) { addPhotos(key, [].slice.call(e.target.files)); e.target.value = ""; }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") window.cdBack();
    if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("card") && e.target.dataset.open) { e.preventDefault(); e.target.click(); }
  });
  // Android back button / Esc: close an open card, then leave sub-pages (the Android shell calls this).
  window.cdBack = function () {
    if (!$sheet.hidden) { closeSheet(); return true; }
    if (ui.tab === "stats" || ui.tab === "settings") { ui.tab = "hero"; render(); return true; }
    if (ui.tab !== "map") { ui.tab = "map"; render(); return true; }
    return false;
  };
  window.addEventListener("pagehide", saveNote);
  window.cdMap = function () { return map; }; // for testing and debugging
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (mq.addEventListener) mq.addEventListener("change", function () { if (store.theme === "auto") { switchTheme(); render(); } });
  }

  applyTheme();
  applyAccent();
  render();
  if (!store.profile) openProfile(true);
  migratePhotoKeys();

  // The Android shell manages its own offline copy; the service worker is for browsers only.
  var inShell = navigator.userAgent.indexOf("CityDiscoveryShell") !== -1;
  if (!inShell && "serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }
})();
