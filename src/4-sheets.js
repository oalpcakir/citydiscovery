  // ── Sheets ─────────────────────────────────────────────────
  // On the map a quest opens as a card floating above the nav bar, so the map stays usable; elsewhere it is a modal sheet.
  function showSheet(cls, html, modal) {
    var card = ui.tab === "map" && !modal;
    $sheet.className = cls + (card ? " mapcard" : "");
    $sheet.innerHTML = '<div class="grab"></div>' + html;
    $sheet.hidden = false; $backdrop.hidden = card;
    document.body.classList.toggle("card-open", card);
    $sheet.scrollTop = 0;
    if (!card) { $sheet.setAttribute("tabindex", "-1"); try { $sheet.focus({ preventScroll: true }); } catch (e) { /* older browsers */ } }
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
    if (q.months) tags.push(seasonDaysLeft(q) !== null && !done ? "season ends: " + leftText(seasonDaysLeft(q)).toLowerCase() : "season: " + seasonText(q));
    var maps = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q.q || q.title + " " + c.name);
    showSheet(q.cat + (ph ? " hasph" : ""), X +
      (ph ? '<div class="cover" style="background-image:url(' + esc(ph[0]) + ')"><a href="' + esc(ph[3]) + '" target="_blank" rel="noopener">Photo: ' +
        esc(ph[1]) + ' · ' + esc(ph[2]) + '</a></div>' : "") +
      '<div class="sh"><span class="tile">' + ic(CATS[q.cat].icon) + '</span><div class="grow">' +
        '<span class="badge">' + CATS[q.cat].label + " · " + esc(c.areas[q.area]) + '</span>' +
        '<h3>' + esc(q.title) + '</h3>' + (doneBy(q.key) ? '<small class="doneby">' + ic("users", "sm") + 'Done by ' + fmt(doneBy(q.key)) + ' explorers</small>' : "") +
        '</div></div>' + rewardHtml(q) +
      '<div class="two">' + (done
        ? '<button class="btn ghost" data-act="toggle-open">' + ic("check") + 'Done · undo</button>' +
          '<a class="btn ghost" href="' + maps + '" target="_blank" rel="noopener">' + ic("navigation") + 'Directions</a>'
        : '<a class="btn" href="' + maps + '" target="_blank" rel="noopener">' + ic("navigation") + 'Directions</a>' +
          '<button class="btn ghost" data-act="toggle-open">' + ic("check") + 'I did it!</button>') + '</div>' +
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
        '<button data-act="share-quest">' + ic("share-2", "sm") + 'Share</button>' +
        '<button data-act="report">' + ic("triangle-alert", "sm") + 'Report a problem</button>' +
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
  // Ticks a must-eat dish on or off. Small reward on the spot; finishing the list earns Local Palate.
  function toggleDish(key) {
    var d = dishByKey[key];
    if (!d) return;
    var c = cities[d.cid], before = progress(), had = earnedKeys(badges(c)), r = store.done[key] || {};
    r.at = r.at ? 0 : Date.now(); r.u = Date.now(); store.done[key] = r;
    save();
    if (!r.at) { toast("Marked as not eaten"); render(); return; }
    var after = progress(), gained = after.xp - before.xp;
    var fresh = badges(c).filter(function (b) { return b.tier && !had[b.id + ":" + b.tier]; });
    render();
    if (fresh.length) {
      toast(fresh[0].icon + " " + fresh[0].name + " · +" + gained + " XP");
      chime(true); buzz([30, 50, 80]); confetti(false);
    } else {
      toast(d.icon + " " + d.name + " eaten · +" + gained + " XP");
      chime(false); buzz(25);
    }
  }
  function checkIn(key) {
    var q = byKey[key];
    if (!q || !ll(q)) return;
    toast("Checking where you are…");
    whereAmI().then(function (p) {
      var d = km(p, ll(q));
      var slack = Math.min(ui.acc || 0, 200) / 1000; // a weak signal should not fail you
      if (d > 0.25 + slack) { toast("You are " + kmText(d) + " away. Get within 250 m to check in."); return; }
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
    var rc = cities[q.cid], rs = stats(rc.quests), rAfter = rs.pct, rBefore = rs.total ? Math.round(((rs.done - 1) / rs.total) * 100) : 0;
    ui.lastDone = q.key;
    var html = '<div class="qc">' +
      '<div class="qc-badge ' + q.cat + '"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="23"/><path d="M15 27l7.5 7.5L37 19"/></svg></div>' +
      '<div class="qc-k">Quest complete</div><h3 class="qc-t">' + esc(q.title) + '</h3>' +
      '<div class="qc-xp">+<b id="qcxp">0</b> XP</div>' +
      '<div class="qc-parts">' + parts.map(function (p, i) {
        return '<span style="animation-delay:' + (350 + i * 110) + 'ms">' + esc(p[0]) + ' +' + p[1] + '</span>';
      }).join("") + '</div>' +
      '<div class="qc-lv"><span id="qclv">Lv ' + b.level + '</span><div class="meter xp"><i id="qcbar" style="width:' + b.pct + '%"></i></div><span id="qcnx">Lv ' + (b.level + 1) + '</span></div>' +
      '<div class="qc-reg"><span>' + flagHtml(rc.country) + esc(rc.name) + '</span><div class="meter"><i id="qcreg" style="width:' + rBefore + '%"></i></div><b><span id="qcregp">' + rBefore + '</span>%</b></div>';
    if (lu) {
      html += '<div class="levelup"><div class="burst">' + profile().avatar + '</div><div class="qc-k">Explorer leveled up</div><div class="cel-h">Level ' + a.level + '</div>' +
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
      '<div class="actions"><button class="btn" data-act="close">Keep exploring</button>' +
      (lu ? '<button class="btn ghost" data-act="share">' + ic("share-2") + 'Share your level</button>' : "") + '</div></div>';
    closeSheetSilently();
    showSheet("complete", html, true);
    ui.open = q.key;
    chime(lu || res.fresh.length > 0 || res.trails.length > 0);
    buzz(lu ? [40, 60, 40, 60, 140] : [30, 50, 80]);
    confetti(lu || res.trails.length > 0);
    countUp(document.getElementById("qcxp"), 0, res.gained, 800);
    var barEl = document.getElementById("qcbar"), regEl = document.getElementById("qcreg");
    setTimeout(function () {
      if (regEl) regEl.style.width = rAfter + "%";
      countUp(document.getElementById("qcregp"), rBefore, rAfter, 500);
    }, 650);
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
    ensureRoute(t);
    closeSheetSilently();
    showSheet("trailsheet", X + '<div class="sh"><span class="tile acc">' + ic(t.icon) + '</span><div class="grow">' +
      '<span class="badge acc">Trail · ' + t.quests.length + ' stops · ' + trailKmText(t) + ' · ' + trailTime(t) + '</span><h3>' + esc(t.name) + '</h3></div></div>' +
      '<p>' + esc(t.sub) + '</p>' +
      '<div class="reward">' + (s.done === s.total ? '<b>Complete</b>' : '<b>+' + TRAIL_XP + ' XP</b><span>for finishing all ' + s.total + ' stops</span><span>' + s.done + ' / ' + s.total + ' done</span>') + '</div>' +
      '<div class="list flush">' + t.quests.map(function (q, i) { return questRow(q, { n: i + 1 }); }).join("") + '</div>' +
      '<div class="actions"><button class="btn" data-act="trail-map" data-id="' + esc(id) + '">' + ic("route") + 'Follow it on the map</button></div>', true);
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
      var hasNativeShare = !!(window.CityDiscoAndroid && window.CityDiscoAndroid.shareImage);
      var can = hasNativeShare || !!(navigator.canShare && navigator.canShare({ files: [new File([blob], "city-disco.png", { type: "image/png" })] }));
      closeSheetSilently();
      showSheet("share", X + '<div class="cel-h">Your explorer card</div><img class="lb sharecard" src="' + url + '" alt="Your explorer card">' +
        '<div class="actions">' + (can ? '<button class="btn" data-act="share-send">' + ic("share-2") + 'Share</button>' : "") +
        '<a class="btn ghost" href="' + url + '" download="city-disco.png">' + ic("download") + 'Save image</a>' +
        (hasNativeShare ? '' : '<p class="note center">On Android, press and hold the picture to save or share it.</p>') + '</div>', true);
    }, "image/png");
  }

  // ── Profile editor (also the first-run onboarding) ─────────
  function pickBtn(type, value, face, cur, lockedAt) {
    return '<button class="pk' + (cur === value ? " on" : "") + (lockedAt ? " locked" : "") + '" data-pick="' + type + '" data-v="' + esc(value) + '"' +
      (lockedAt ? ' disabled' : '') + '>' + face + (lockedAt ? '<small>Lv ' + lockedAt + '</small>' : '') + '</button>';
  }
  // First run: one question (where are you?), then straight to the map. The explorer is set up after the first quest.
  function openWelcome() {
    closeSheetSilently();
    showSheet("editor", '<div class="welcome"><img src="icon.svg" alt=""></div><div class="cel-h">Welcome to City Disco</div>' +
      '<p class="note center" style="margin-top:-6px">Your city, your adventure. Find things to see, eat and do around you, tick them off and level up.</p>' +
      '<label class="lbl" for="whome">Where do you want to start?</label><select id="whome" class="inp">' + Object.keys(cities).map(function (id) {
        return '<option value="' + id + '"' + (cityId === id ? " selected" : "") + '>' + esc(cities[id].name) + ' (' + esc(cities[id].country) + ')</option>';
      }).join("") + '</select>' +
      '<div class="actions"><button class="btn" data-act="welcome-go">Start exploring</button></div>' +
      '<p class="note center">No account needed. Your progress is saved on this device. <a href="privacy.html" target="_blank" rel="noopener">Privacy</a></p>', true);
  }
  function startFresh(home) {
    store.profile = profile();
    store.profile.home = home || cityId; store.profile.setup = 0;
    store.profile.created = store.profile.updated = Date.now();
    save();
  }
  function openProfile(first, intro) {
    var pr = profile(), lv = progress().level;
    ui.draft = JSON.parse(JSON.stringify(pr));
    var lockAt = function (u) { return u.level > lv ? u.level : 0; };
    var of = function (type) { return UNLOCKS.filter(function (u) { return u.type === type; }); };
    var html = (first ? '<div class="welcome"><img src="icon.svg" alt=""></div>' : X) +
      '<div class="cel-h">' + (first ? "Welcome to City Disco" : intro ? "First quest done!" : "Your explorer") + '</div>' +
      (intro ? '<p class="note center" style="margin-top:-6px">Now make your explorer yours: a name, a face and a class with its own XP bonus.</p>' : "") +
      (first ? '<p class="note center" style="margin-top:-6px">Rediscover where you live, one quest at a time. Earn XP, level up and unlock new looks.</p>' : "") +
      '<label class="lbl" for="pname">Explorer name</label><input id="pname" class="inp" maxlength="24" placeholder="e.g. Tulip Ranger" value="' + esc(pr.name) + '">' +
      '<label class="lbl">Avatar</label><div class="pick">' + of("avatar").map(function (u) {
        return pickBtn("avatar", u.value, '<span class="pe">' + u.value + '</span>', pr.avatar, lockAt(u));
      }).join("") + '</div>' +
      '<label class="lbl">Class <small>(a bonus for your travel style)</small></label><div class="pick cls">' + Object.keys(CLASSES).map(function (k) {
        var c = CLASSES[k];
        return pickBtn("cls", k, '<span class="pe">' + c.icon + '</span><span class="pc"><b>' + c.name + '</b><small>' + c.desc + '</small></span>', pr.cls, 0);
      }).join("") + '</div>' +
      '<label class="lbl" for="phome">Home region <small>(today\'s adventure comes from here)</small></label><select id="phome" class="inp">' + Object.keys(cities).map(function (id) {
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
    d.updated = Date.now(); d.setup = 1;
    store.profile = d;
    save();
    applyAccent();
    closeSheet();
    if (first && d.home) setCity(d.home, true);
    toast(first ? "Welcome, " + (d.name || "explorer") + "! Your first quest awaits." : "Profile saved");
  }

  // ── Suggest a place: pin it on the map, describe it, send it for review ──
  function isAdmin() {
    var C = window.cdCloud;
    return !!(C && C.user && (window.CD_ADMINS || []).indexOf(C.user.uid) !== -1);
  }
  function recStart() {
    closeSheetSilently();
    ui.tab = "map"; ui.pinMode = true; render();
    ensureMap();
    if (map && map.getZoom() < 13) map.easeTo({ zoom: 14, duration: 700 });
  }
  function recCancel() { ui.pinMode = false; render(); }
  function recHere() {
    if (!mapReady) { toast("Wait for the map to load"); return; }
    var c = map.getCenter();
    ui.recDraft = { ll: [Math.round(c.lat * 1e5) / 1e5, Math.round(c.lng * 1e5) / 1e5], region: regionAnyAt(c.lng, c.lat) || "", cat: (ui.recDraft || {}).cat || "gor" };
    ui.pinMode = false; render();
    openRecForm();
  }
  function openRecForm() {
    var d = ui.recDraft, C = window.cdCloud, signed = C && C.user;
    var where = d.region ? esc(regionName(d.region)) : "Outside our regions";
    showSheet("recform", X + '<div class="welcome">' + ic("map-pin") + '</div><div class="cel-h">Suggest a place</div>' +
      '<p class="note center" style="margin-top:-6px">' + where + ' · ' + d.ll[0].toFixed(4) + ', ' + d.ll[1].toFixed(4) +
        ' · <button class="linkbtn" data-act="rec-start">Move the pin</button></p>' +
      '<label class="lbl" for="rplace">What is it?</label><input id="rplace" class="inp" maxlength="80" placeholder="Name of the place, dish or event" value="' + esc(d.place || "") + '">' +
      '<label class="lbl">Kind of quest</label><div class="chips wrap">' + Object.keys(CATS).map(function (k) {
        return '<button class="chip' + (d.cat === k ? " on" : "") + '" data-act="rec-cat" data-v="' + k + '"><i class="dot" style="background:' + CATS[k].color + '"></i>' + CATS[k].label + '</button>';
      }).join("") + '</div>' +
      '<label class="lbl" for="rwhy">Why should people go?</label><textarea id="rwhy" class="inp" rows="4" maxlength="600" placeholder="What makes it special, and a tip if you have one">' + esc(d.why || "") + '</textarea>' +
      '<p class="note err" id="rerr" hidden></p>' +
      '<div class="actions">' + (signed ? '<button class="btn" data-act="rec-send">' + ic("share-2") + 'Send suggestion</button>'
        : '<p class="note center">Sign in to send suggestions, so we can tell you when yours becomes a quest.</p><button class="btn" data-act="rec-auth">Sign in</button>') +
      '</div><p class="note center">We check every suggestion before it becomes a quest.</p>', true);
  }
  function recKeepSafe() { if (ui.recDraft && document.getElementById("rplace")) recKeep(); }
  function recKeep() {
    var p = document.getElementById("rplace"), w = document.getElementById("rwhy");
    if (p) ui.recDraft.place = p.value;
    if (w) ui.recDraft.why = w.value;
  }
  function recSend() {
    recKeep();
    var d = ui.recDraft, err = document.getElementById("rerr"), btn = $sheet.querySelector('[data-act="rec-send"]');
    var fail = function (m) { err.textContent = m; err.hidden = false; };
    if (!(d.place || "").trim()) return fail("Give the place a name.");
    if ((d.why || "").trim().length < 10) return fail("Tell us in a sentence why it is worth a visit.");
    btn.disabled = true;
    window.cdCloud.suggest({ place: d.place.trim(), cat: d.cat, why: d.why.trim(), ll: d.ll, region: d.region, by: profile().name || "Explorer" })
      .then(function () {
        ui.recDraft = null; closeSheet(); chime(false); toast("Thanks! Your suggestion is on its way");
      }, function (e) { btn.disabled = false; fail(e.message); });
  }
  // ── Report a problem / feedback (lands in the same review list as suggestions) ──
  var REASONS = ["It has closed", "It moved", "The pin is in the wrong place", "The description is wrong", "Something else"];
  function openReport(key) {
    var q = key && byKey[key], C = window.cdCloud, signed = C && C.user;
    ui.report = { key: q ? q.key : "" };
    closeSheetSilently();
    showSheet("recform", X + '<div class="welcome">' + ic("triangle-alert") + '</div><div class="cel-h">' + (q ? "Report a problem" : "Send feedback") + '</div>' +
      (q ? '<p class="note center" style="margin-top:-6px">' + esc(q.title) + '</p><label class="lbl" for="rreason">What is wrong?</label><select id="rreason" class="inp">' +
        REASONS.map(function (r) { return '<option>' + r + '</option>'; }).join("") + '</select>' : "") +
      '<label class="lbl" for="rtext">' + (q ? "Details" : "Your message") + '</label><textarea id="rtext" class="inp" rows="4" maxlength="500" placeholder="' +
        (q ? "What did you find when you were there?" : "An idea, a bug, anything") + '"></textarea>' +
      '<p class="note err" id="rerr" hidden></p><div class="actions">' +
      (signed ? '<button class="btn" data-act="report-send">Send</button>'
        : '<p class="note center">Sign in to send this, so we can get back to you.</p><button class="btn" data-act="auth">Sign in</button>') + '</div>', true);
  }
  function sendReport() {
    var q = byKey[ui.report.key], text = (document.getElementById("rtext").value || "").trim(), err = document.getElementById("rerr");
    var reason = q ? document.getElementById("rreason").value : "Feedback", btn = $sheet.querySelector('[data-act="report-send"]');
    if (!q && text.length < 5) { err.textContent = "Write a few words first."; err.hidden = false; return; }
    btn.disabled = true;
    window.cdCloud.suggest({ kind: q ? "report" : "feedback", quest: q ? q.key : "", place: (q ? q.title : "Feedback").slice(0, 80), cat: q ? q.cat : "gor",
      why: (reason + (text ? ": " + text : "")).slice(0, 600), ll: q && ll(q) ? ll(q) : [0, 0], region: q ? q.cid : "", by: profile().name || "Explorer" })
      .then(function () { closeSheet(); toast("Thanks! We will look into it"); }, function (e) { btn.disabled = false; err.textContent = e.message; err.hidden = false; });
  }
  function shareQuest(key) {
    var q = byKey[key];
    if (!q) return;
    var url = location.origin + location.pathname + "#q=" + encodeURIComponent(q.key);
    if (navigator.share) { navigator.share({ title: q.title, text: q.title + " · City Disco", url: url }).catch(function () {}); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { toast("Link copied"); }, function () { prompt("Copy this link:", url); });
    else prompt("Copy this link:", url);
  }
  var REC_STATUS = { "new": "Waiting for review", accepted: "Accepted: coming as a quest", rejected: "Not this time", added: "Added as a quest" };
  function recList(mine) {
    var C = window.cdCloud;
    if (!C || !C.user) { openAuth("signin"); return; }
    closeSheetSilently();
    showSheet("recs", X + '<div class="cel-h">' + (mine ? "Your suggestions" : "Review suggestions") + '</div><div id="reclist"><div class="note center">Loading…</div></div>', true);
    (mine ? C.mySuggestions() : C.allSuggestions()).then(function (list) {
      var box = document.getElementById("reclist");
      if (!box) return;
      ui.recs = list;
      box.innerHTML = !list.length ? '<div class="empty">' + (mine ? "You have not suggested anything yet. Tap the pin button on the map to start." : "No suggestions yet.") + '</div>' :
        list.map(function (s) {
          return '<div class="recrow ' + s.cat + '"><div class="grow"><b>' + esc(s.place) + '</b><small>' +
            (s.kind === "report" ? "Problem report" : s.kind === "feedback" ? "Feedback" : esc(CATS[s.cat] ? CATS[s.cat].label : s.cat)) + ' · ' +
            esc(regionName(s.region) || "outside our regions") + (mine ? "" : " · by " + esc(s.by || "Explorer")) + '</small><p>' + esc(s.why) + '</p>' +
            '<span class="rstat ' + s.status + '">' + esc(REC_STATUS[s.status] || s.status) + '</span></div>' +
            '<div class="recbtns"><button class="hbtn" data-act="rec-show" data-id="' + esc(s.id) + '" aria-label="Show on map">' + ic("map") + '</button>' +
            (mine ? "" : '<button class="hbtn" data-act="rec-set" data-id="' + esc(s.id) + '" data-v="accepted" aria-label="Accept">' + ic("check") + '</button>' +
              '<button class="hbtn" data-act="rec-set" data-id="' + esc(s.id) + '" data-v="rejected" aria-label="Reject">' + ic("x") + '</button>') + '</div></div>';
        }).join("") + (mine ? "" : '<button class="btn ghost" data-act="rec-export">' + ic("copy") + 'Copy accepted suggestions</button>' +
          '<p class="note">Paste the copied text to Claude to turn accepted suggestions into quests.</p>');
    }, function (e) {
      var box = document.getElementById("reclist");
      if (box) box.innerHTML = '<div class="note err">' + esc(e.message) + '</div>';
    });
  }
  function recShow(id) {
    var s = (ui.recs || []).filter(function (x) { return x.id === id; })[0];
    if (!s) return;
    closeSheet(); ui.tab = "map"; render();
    setTimeout(function () { if (map) map.easeTo({ center: [s.ll[1], s.ll[0]], zoom: 16, duration: 900 }); setTimeout(function () { pulseAt(s.ll); }, 950); }, 80);
  }
  function recExport() {
    var acc = (ui.recs || []).filter(function (s) { return s.status === "accepted"; }).map(function (s) {
      return { id: s.id, place: s.place, cat: s.cat, why: s.why, ll: s.ll, region: s.region, by: s.by };
    });
    if (!acc.length) { toast("Accept a suggestion first"); return; }
    var text = JSON.stringify({ suggestions: acc }, null, 1);
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { toast("Copied " + acc.length + " suggestions"); }, function () { prompt("Copy this:", text); });
    else prompt("Copy this:", text);
  }

  function endSearch() { ui.searchOpen = false; ui.sq = ""; }
  function followTrail(id) {
    var tr = trailById[id];
    if (!tr) return;
    closeSheetSilently(); endSearch();
    ui.trail = id; ui.panel = null; ui.tab = "map"; ui.cat = "all"; ui.area = "all";
    ensureRoute(tr);
    if (tr.cid !== cityId) setCurrent(tr.cid); else render();
    setTimeout(function () { fitPoints(tr.quests.map(ll), 16); }, 60);
  }
  function gotoRegion(id) {
    endSearch(); closeSheetSilently(); ui.tab = "map";
    if (cities[id]) { ui.trail = null; setCity(id, true); return; }
    var info = (window.REGION_INFO || {})[id];
    render();
    if (map && info) map.flyTo({ center: [info.at[1], info.at[0]], zoom: 8.6, duration: 1400 });
    if (info) toast(info.name + ": quests coming soon");
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
    cloudChanged: function () {
      var C = window.cdCloud, box = document.getElementById("account");
      if (box) box.innerHTML = accountHtml();
      if (C && C.user && !$sheet.hidden && $sheet.classList.contains("auth")) {
        closeSheet(); toast("Signed in as " + (C.user.email || C.user.name));
        if (ui.recDraft && ui.recDraft.ll) openRecForm(); // back to the suggestion you were writing
      }
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
  var SEL = "[data-dish],[data-goto-region],[data-goto-place],[data-toggle],[data-open],[data-f],[data-tab],[data-act],[data-city],[data-theme-set],[data-pick],[data-photo-id],[data-qview],[data-trail],[data-stats-view],[data-ev-cat]";
  document.addEventListener("click", function (e) {
    var t = e.target.closest(SEL);
    if (document.getElementById("ctxmenu") && !(t && t.closest("#ctxmenu"))) closeCtx();
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
    if (d.dish) { toggleDish(d.dish); return; }
    if (d.photoId) { openPhoto(d.photoId, d.photoKey); return; }
    if (d.gotoRegion) { gotoRegion(d.gotoRegion); return; }
    if (d.gotoPlace) {
      var gp = d.gotoPlace.split(",").map(Number);
      endSearch(); ui.tab = "map"; render();
      if (map) map.flyTo({ center: [gp[1], gp[0]], zoom: gp[2], duration: 1400, essential: true });
      setTimeout(function () { pulseAt([gp[0], gp[1]]); }, 1450);
      return;
    }
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
    if (d.statsView) { ui.statsView = d.statsView; render(); return; }
    if (d.evCat) { ui.evCat = d.evCat; render(); return; }
    if (d.trail) { ui.trailOpen = d.trail; openTrail(d.trail); return; }
    if (d.open) { q = byKey[d.open]; closeSheetSilently(); if (ui.searchOpen) endSearch(); if (q) openQuest(q); return; }
    if (d.city) { closeSheetSilently(); ui.tab = "map"; ui.trail = null; setCity(d.city, true); return; }
    if (d.f) {
      ui[d.f] = d.v; render();
      if (ui.tab === "map" && d.f === "area") flyToArea();
      return;
    }
    if (d.tab) { closeSheetSilently(); ui.pinMode = false; ui.tab = d.tab; render(); window.scrollTo(0, 0); return; }
    switch (d.act) {
      case "suggest": suggest(); break;
      case "musteats": closeSheetSilently(); ui.tab = "quests"; ui.qview = "dishes"; render(); window.scrollTo(0, 0); break;
      case "regions": openRegions(); break;
      case "overview": showOverview(); break;
      case "zoom-in": if (map) map.zoomIn(); break;
      case "zoom-out": if (map) map.zoomOut(); break;
      case "tilt": toggleTilt(); break;
      case "locate": locate(); break;
      case "near": nearMe(); break;
      case "map-retry": retryMap(); break;
      case "close":
        closeSheet();
        // After the first finished quest: time to make the explorer yours.
        if (store.profile && store.profile.setup === 0 && progress().quests >= 1) { store.profile.setup = 1; save(); openProfile(false, true); }
        break;
      case "toggle-open": saveNote(); res = toggle(ui.open); closeSheet(); showComplete(res); break;
      case "checkin": checkIn(ui.open); break;
      case "save-quest": q = ui.open; saveNote(); toggleSaved(q); openSheet(q); break;
      case "to-map":
        q = byKey[ui.open];
        closeSheet(); ui.tab = "map"; ui.cat = "all"; ui.area = "all"; render();
        if (q) openSheet(q.key);
        break;
      case "trail-map": case "trail-follow": followTrail(d.id); break;
      case "trail-end": ui.trail = null; render(); break;
      case "trails": {
        closeCtx(); endSearch();
        var opening = ui.panel !== "trails" || !!ui.trail;
        ui.trail = null; ui.panel = opening ? "trails" : null; ui.tab = "map"; render();
        var tl = trailsByCity[cityId] || [];
        if (opening) ensureRoutes(tl);
        if (opening && tl.length) fitPoints([].concat.apply([], tl.map(function (x) { return x.quests.map(ll); })), 15);
        break;
      }
      case "my-map": {
        var pts = allQuests.filter(isDone).map(ll).filter(Boolean);
        closeSheetSilently(); ui.myMap = true; ui.trail = null; ui.panel = null; ui.cat = "all"; ui.area = "all"; ui.tab = "map"; render();
        if (pts.length) setTimeout(function () { fitPoints(pts, 12); }, 60);
        break;
      }
      case "my-map-end": ui.myMap = false; render(); break;
      case "stats-optin":
        store.profile = store.profile || {};
        store.profile.noStats = !store.profile.noStats;
        store.profile.updated = Date.now(); // so the choice wins when devices merge
        save(); render();
        break;
      case "share": shareCard(); break;
      case "share-send":
        if (ui.shareBlob && window.CityDiscoAndroid && window.CityDiscoAndroid.shareImage) {
          var rd = new FileReader();
          rd.onload = function () { window.CityDiscoAndroid.shareImage(rd.result); };
          rd.readAsDataURL(ui.shareBlob);
        } else if (ui.shareBlob && navigator.share) {
          navigator.share({ files: [new File([ui.shareBlob], "city-disco.png", { type: "image/png" })], title: "My City Disco explorer" }).catch(function () {});
        }
        break;
      case "profile": openProfile(false); break;
      case "save-profile": saveProfile(d.first === "1"); break;
      case "skip-profile": startFresh(); closeSheet(); break;
      case "photo-del": if (confirm("Delete this photo? This cannot be undone.")) deletePhoto(d.id, d.key); break;
      case "sound": store.sound = store.sound === false; save(); render(); if (store.sound) chime(false); break;
      case "welcome-go": {
        var wh = (document.getElementById("whome") || {}).value;
        startFresh(wh); closeSheet(); if (wh) setCity(wh, true);
        break;
      }
      case "report": saveNote(); openReport(ui.open); break;
      case "feedback": openReport(null); break;
      case "report-send": sendReport(); break;
      case "share-quest": shareQuest(ui.open); break;
      case "account-delete":
        if (!confirm("Delete your account? Your cloud save, cloud photos and suggestions are removed for good. Progress on this device stays.")) break;
        t.disabled = true;
        window.cdCloud.deleteAccount().then(function () { toast("Account deleted"); render(); }, function (e) { t.disabled = false; toast(e.message); });
        break;
      case "ctx-suggest": {
        closeCtx();
        var cid2 = regionAnyAt(ui.ctx[1], ui.ctx[0]) || "";
        ui.recDraft = { ll: [Math.round(ui.ctx[0] * 1e5) / 1e5, Math.round(ui.ctx[1] * 1e5) / 1e5], region: cid2, cat: "gor" };
        openRecForm();
        break;
      }
      case "ctx-near": {
        closeCtx();
        var cid3 = regionAt(ui.ctx[1], ui.ctx[0]);
        ui.panel = "near"; ui.panelAt = ui.ctx.slice(); endSearch();
        if (cid3 && cid3 !== cityId) setCurrent(cid3); else render();
        pulseAt(ui.panelAt);
        break;
      }
      case "panel-close": ui.panel = null; render(); break;
      case "search-open":
        ui.searchOpen = true; ui.sq = ""; render();
        setTimeout(function () { var el = document.getElementById("psearch"); if (el) el.focus(); }, 30);
        break;
      case "search-close": endSearch(); render(); break;
      case "ctx-dir": closeCtx(); window.open("https://www.google.com/maps/dir/?api=1&destination=" + ui.ctx[0].toFixed(5) + "," + ui.ctx[1].toFixed(5), "_blank", "noopener"); break;
      case "ctx-copy": {
        closeCtx();
        var txt = ui.ctx[0].toFixed(5) + ", " + ui.ctx[1].toFixed(5);
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { toast("Copied " + txt); }, function () { prompt("Copy this:", txt); });
        else prompt("Copy this:", txt);
        break;
      }
      case "ctx-zoom": closeCtx(); if (map) map.easeTo({ center: [ui.ctx[1], ui.ctx[0]], zoom: Math.max(map.getZoom() + 2, 15), duration: 700 }); break;
      case "rec-start": recKeepSafe(); recStart(); break;
      case "rec-cancel": recCancel(); break;
      case "rec-here": recHere(); break;
      case "rec-cat":
        recKeep(); ui.recDraft.cat = d.v;
        [].forEach.call(t.parentNode.querySelectorAll(".chip"), function (n) { n.classList.toggle("on", n === t); });
        break;
      case "rec-send": recSend(); break;
      case "rec-auth": recKeep(); openAuth("signin"); break;
      case "rec-mine": recList(true); break;
      case "rec-review": recList(false); break;
      case "rec-show": recShow(d.id); break;
      case "rec-set":
        t.disabled = true;
        window.cdCloud.setSuggestion(d.id, d.v).then(function () { toast(d.v === "accepted" ? "Accepted" : "Rejected"); recList(false); },
          function (e) { t.disabled = false; toast(e.message); });
        break;
      case "rec-export": recExport(); break;
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
    if (e.target.id === "psearch") {
      ui.sq = e.target.value;
      findPlaces(ui.sq);
      var pr2 = document.getElementById("presults");
      if (pr2) pr2.innerHTML = isWide() ? sideBodyHtml() : searchResultsHtml();
      return;
    }
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
    if (e.key === "Tab" && !$sheet.hidden && !$backdrop.hidden) {
      var f = [].filter.call($sheet.querySelectorAll('button, a[href], input, select, textarea'), function (n) { return !n.disabled && n.offsetParent !== null; });
      if (f.length) {
        var first = f[0], last = f[f.length - 1];
        if (!$sheet.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
        else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    if (e.key === "Escape") window.cdBack();
    if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("card") && e.target.dataset.open) { e.preventDefault(); e.target.click(); }
  });
  // Android back button / Esc: close an open card, then leave sub-pages (the Android shell calls this).
  window.cdBack = function () {
    if (document.getElementById("ctxmenu")) { closeCtx(); return true; }
    if (ui.searchOpen || ui.sq) { endSearch(); render(); return true; }
    if (!$sheet.hidden) { closeSheet(); return true; }
    if (ui.pinMode) { recCancel(); return true; }
    if (ui.tab === "settings") { ui.tab = "hero"; render(); return true; }
    if (ui.tab !== "map") { ui.tab = "map"; render(); return true; }
    return false;
  };
  window.addEventListener("pagehide", saveNote);
  // Crossing the wide-screen width switches between the phone and the side-panel layout.
  var lastWide = isWide();
  function layoutCheck() {
    if (isWide() === lastWide) return;
    lastWide = isWide(); endSearch(); render();
    if (map) setTimeout(function () { map.resize(); }, 50);
  }
  if (WIDE.addEventListener) WIDE.addEventListener("change", layoutCheck);
  window.addEventListener("resize", layoutCheck);
  window.cdMap = function () { return map; }; // for testing and debugging
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (mq.addEventListener) mq.addEventListener("change", function () { if (store.theme === "auto") { switchTheme(); render(); } });
  }

  applyTheme();
  applyAccent();
  render();
  keepEarned();
  // A shared link (#q=<region>/<quest>) opens that quest; a first-time visitor lands on it directly.
  var linked = byKey[decodeURIComponent((location.hash.match(/[#&]q=([^&]+)/) || [])[1] || "")];
  if (linked) {
    if (!store.profile) startFresh(linked.cid);
    setTimeout(function () { openQuest(linked); }, 50);
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { /* keep the hash */ }
  } else if (!store.profile) openWelcome();
  migratePhotoKeys();

  // The Android shell manages its own offline copy; the service worker is for browsers only.
  var inShell = navigator.userAgent.indexOf("CityDiscoveryShell") !== -1;
  // Browser back button: close the open card or panel first, like the Android back button. (The shell calls cdBack itself.)
  if (!inShell && window.history && history.pushState) {
    history.replaceState({ cd: "base" }, "");
    history.pushState({ cd: "app" }, "");
    window.addEventListener("popstate", function () {
      if (window.cdBack()) history.pushState({ cd: "app" }, ""); else history.back();
    });
  }
  if (!inShell && "serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }
})();
