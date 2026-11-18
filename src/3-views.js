  // ── Photos you take (IndexedDB; the store only keeps a count per quest) ──
  var MAX_PHOTOS = 6, dbp = null, urlCache = {};
  function db() {
    if (dbp) return dbp;
    dbp = new Promise(function (res, rej) {
      if (!window.indexedDB) { rej(new Error("no indexedDB")); return; }
      var r = indexedDB.open("citydiscovery", 1);
      r.onupgradeneeded = function () { r.result.createObjectStore("photos", { keyPath: "id" }).createIndex("key", "key"); };
      r.onsuccess = function () { res(r.result); };
      r.onerror = function () { rej(r.error); };
    });
    return dbp;
  }
  function tx(mode, fn) {
    return db().then(function (d) {
      return new Promise(function (res, rej) {
        var t = d.transaction("photos", mode), out = fn(t.objectStore("photos"));
        t.oncomplete = function () { res(out && out.result !== undefined ? out.result : out); };
        t.onerror = function () { rej(t.error); };
      });
    });
  }
  function photosFor(key) { return tx("readonly", function (s) { return s.index("key").getAll(key); }); }
  function allPhotos() { return tx("readonly", function (s) { return s.getAll(); }).then(function (l) { return l.sort(function (a, b) { return b.at - a.at; }); }); }
  function photoUrl(p) { return urlCache[p.id] || (urlCache[p.id] = URL.createObjectURL(p.blob)); }
  // Shrinks a picked image to at most 1600px so photos stay small on the device.
  function shrink(file) {
    return new Promise(function (res, rej) {
      var img = new Image(), u = URL.createObjectURL(file);
      img.onload = function () {
        var k = Math.min(1, 1600 / Math.max(img.width, img.height)), c = document.createElement("canvas");
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(u);
        c.toBlob(function (b) { if (b) res(b); else rej(new Error("encode")); }, "image/jpeg", 0.84);
      };
      img.onerror = function () { URL.revokeObjectURL(u); rej(new Error("decode")); };
      img.src = u;
    });
  }
  function setPhotoCount(key, n) {
    var r = store.done[key] || { at: 0 };
    if (n) r.photos = n; else delete r.photos;
    r.u = Date.now(); store.done[key] = r;
    save();
  }
  function addPhotos(key, files) {
    var before = progress().xp;
    photosFor(key).then(function (have) {
      var list = files.slice(0, Math.max(0, MAX_PHOTOS - have.length));
      if (!list.length) { toast("Up to " + MAX_PHOTOS + " photos per quest"); return; }
      toast("Saving photo…");
      return Promise.all(list.map(shrink)).then(function (blobs) {
        var recs = blobs.map(function (b, i) { var t = Date.now() + i; return { id: key + "@" + t, key: key, at: t, blob: b }; });
        return tx("readwrite", function (s) { recs.forEach(function (r) { s.put(r); }); }).then(function () {
          if (window.cdCloud) recs.forEach(function (r) { window.cdCloud.photoAdded(r); });
          setPhotoCount(key, have.length + blobs.length);
          var gained = progress().xp - before;
          if (gained > 0) { toast("+" + gained + " XP for your photo"); chime(false); buzz(25); } else toast("Photo saved");
          refreshAfterPhoto(key, gained);
        });
      });
    }).catch(function () { toast("Could not save the photo"); });
  }
  function deletePhoto(id, key) {
    tx("readwrite", function (s) { s.delete(id); }).then(function () { return photosFor(key); }).then(function (left) {
      if (urlCache[id]) { URL.revokeObjectURL(urlCache[id]); delete urlCache[id]; }
      if (window.cdCloud) window.cdCloud.photoDeleted(id);
      setPhotoCount(key, left.length);
      toast("Photo removed");
      closeSheet();
    });
  }
  function photoRow(key) {
    return '<div class="photos" data-photos="' + esc(key) + '">' +
      '<label class="ph-add"><input type="file" accept="image/*" multiple data-photo="' + esc(key) + '" hidden>' +
      ic("camera", "big") + '<span>Add photo<small>+' + XP.photo + ' XP for the first</small></span></label></div>';
  }
  function fillPhotos(root) {
    [].forEach.call(root.querySelectorAll("[data-photos]"), function (box) {
      photosFor(box.dataset.photos).then(function (list) {
        list.sort(function (a, b) { return a.at - b.at; }).forEach(function (p) {
          var b = document.createElement("button");
          b.className = "ph"; b.dataset.photoId = p.id; b.dataset.photoKey = p.key;
          b.style.backgroundImage = "url(" + photoUrl(p) + ")";
          b.setAttribute("aria-label", "Open photo");
          box.insertBefore(b, box.querySelector(".ph-add"));
        });
      }).catch(function () {});
    });
  }
  function fillMemories() {
    var box = document.getElementById("memories");
    if (!box) return;
    allPhotos().then(function (list) {
      list = list.filter(function (p) { return byKey[p.key]; });
      if (!list.length) { box.innerHTML = '<div class="note flat">Photos you add to completed quests collect here.</div>'; return; }
      box.innerHTML = '<div class="mem">' + list.slice(0, 9).map(function (p) {
        return '<button class="ph big" data-photo-id="' + esc(p.id) + '" data-photo-key="' + esc(p.key) + '" style="background-image:url(' + photoUrl(p) + ')">' +
          '<span>' + esc(byKey[p.key].title) + '</span></button>';
      }).join("") + '</div>' + (list.length > 9 ? '<p class="note">+' + (list.length - 9) + ' more on your quests</p>' : "");
    }).catch(function () { box.innerHTML = '<div class="note flat">Photos are not available in this browser.</div>'; });
  }
  function refreshAfterPhoto(key, gained) {
    if ($sheet.hidden) return;
    if ($sheet.classList.contains("complete")) {
      var el = document.getElementById("qcxp");
      if (el && gained > 0) countUp(el, +el.textContent, +el.textContent + gained, 600);
      var box = $sheet.querySelector("[data-photos]");
      if (box) { [].forEach.call(box.querySelectorAll(".ph"), function (n) { n.remove(); }); fillPhotos($sheet); }
    } else if (ui.open === key) openSheet(key);
  }

  // ── Juice: sound, haptics, confetti, counters ──────────────
  var actx = null;
  function chime(big) {
    if (store.sound === false) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      (big ? [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98] : [659.25, 830.61, 987.77]).forEach(function (f, i) {
        var o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + i * (big ? 0.08 : 0.07);
        o.type = "triangle"; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.16, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t + (big ? 0.7 : 0.4));
        o.connect(g); g.connect(actx.destination); o.start(t); o.stop(t + 0.8);
      });
    } catch (e) { /* audio is optional */ }
  }
  function buzz(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) { /* optional */ } }
  function reducedMotion() { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
  function confetti(big) {
    if (reducedMotion()) return;
    var c = document.createElement("canvas"), dpr = window.devicePixelRatio || 1;
    c.className = "confetti"; document.body.appendChild(c);
    var W = (c.width = innerWidth * dpr), H = (c.height = innerHeight * dpr), g = c.getContext("2d");
    var cols = [accent(), "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#facc15"], P = [];
    for (var i = 0; i < (big ? 240 : 130); i++) {
      P.push({ x: W / 2 + (Math.random() - 0.5) * W * 0.2, y: H * 0.38, vx: (Math.random() - 0.5) * W * 0.028,
        vy: -Math.random() * H * 0.028 - H * 0.008, s: (5 + Math.random() * 7) * dpr, r: Math.random() * 6,
        vr: (Math.random() - 0.5) * 0.35, c: cols[i % cols.length] });
    }
    var t0 = performance.now(), life = big ? 3200 : 2400;
    setTimeout(function () { c.remove(); }, life + 400);
    (function frame(t) {
      var dt = t - t0;
      g.clearRect(0, 0, W, H);
      P.forEach(function (p) {
        p.vy += H * 0.0008; p.x += p.vx; p.y += p.vy; p.vx *= 0.985; p.r += p.vr;
        g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c;
        g.globalAlpha = Math.max(0, 1 - dt / life); g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); g.restore();
      });
      if (dt < life) requestAnimationFrame(frame);
    })(t0);
  }
  function countUp(el, from, to, ms) {
    if (!el) return;
    var t0 = performance.now(), done = false;
    (function f(t) {
      if (done) return;
      var k = Math.min(1, (t - t0) / ms);
      el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(f); else done = true;
    })(t0);
    // Animation frames pause in background tabs; make sure the final number always lands.
    setTimeout(function () { done = true; el.textContent = to; }, ms + 200);
  }

  // ── Building blocks ────────────────────────────────────────
  var $app = document.getElementById("app");
  var $sheet = document.getElementById("sheet");
  var $backdrop = document.getElementById("sheet-backdrop");
  var $toast = document.getElementById("toast");
  var CC = { Netherlands: "nl", Belgium: "be", Germany: "de", Luxembourg: "lu", France: "fr" };

  function ring(pct, big) {
    var C = 2 * Math.PI * 26;
    return '<div class="ring' + (big ? " big" : "") + '"><svg viewBox="0 0 64 64">' +
      '<circle class="track" cx="32" cy="32" r="26"/>' +
      '<circle class="bar" cx="32" cy="32" r="26" stroke-dasharray="' + C.toFixed(1) +
      '" stroke-dashoffset="' + (C * (1 - pct / 100)).toFixed(1) + '"/></svg><span>' + pct + '%</span></div>';
  }
  function bar(pct, cls) { return '<div class="meter' + (cls ? " " + cls : "") + '"><i style="width:' + pct + '%"></i></div>'; }
  function flagHtml(country) { return CC[country] ? '<i class="flag fl-' + CC[country] + '" aria-hidden="true"></i>' : ""; }
  function chip(group, val, label, dot) {
    return '<button class="chip' + (ui[group] === val ? " on" : "") + '" data-f="' + group + '" data-v="' + val + '">' +
      (dot ? '<i class="dot" style="background:' + dot + '"></i>' : "") + label + '</button>';
  }
  function catChips() {
    var h = chip("cat", "all", "All");
    Object.keys(CATS).forEach(function (c) { h += chip("cat", c, CATS[c].label, CATS[c].color); });
    return h;
  }
  function areaChips() {
    var h = chip("area", "all", "Everywhere");
    Object.keys(city.areas).forEach(function (a) {
      h += chip("area", a, esc(city.areas[a]) + " <small>" + stats(inArea(a)).pct + "%</small>");
    });
    return h;
  }
  function seg(attr, cur, items) {
    return '<div class="seg">' + items.map(function (x) {
      return '<button class="' + (cur === x[0] ? "on" : "") + '" ' + attr + '="' + x[0] + '">' + x[1] + '</button>';
    }).join("") + '</div>';
  }
  function head(title, sub, o) {
    o = o || {};
    return '<header class="head">' + (o.back ? '<button class="hbtn" data-tab="hero" aria-label="Back">' + ic("chevron-left") + '</button>' : "") +
      '<div class="grow"><h1>' + (o.picker ? '<button data-act="regions">' + flagHtml(city.country) + esc(title) + ' ' + ic("chevron-down", "sm") + '</button>' : esc(title)) +
      '</h1><p>' + esc(sub) + '</p></div>' +
      (o.gear ? '<button class="hbtn" data-tab="settings" aria-label="Settings">' + ic("settings") + '</button>' : "") + '</header>';
  }
  function countryStats() {
    var out = {};
    Object.keys(cities).forEach(function (id) {
      var c = cities[id], s2 = cityStats(id), o = out[c.country] || (out[c.country] = { regions: 0, started: 0, done: 0, total: 0 });
      o.regions++; if (s2.done) o.started++; o.done += s2.done; o.total += s2.total;
    });
    return out;
  }
  function meterRow(label, s, cls) {
    return '<div class="row ' + cls + '"><div class="row-h"><span>' + label + '</span><span>' + s.done + ' / ' + s.total + '</span></div>' +
      bar(s.pct) + '</div>';
  }
  function avatarHtml(pr, p, cls) {
    return '<span class="av ' + (cls || "") + ' fr-' + pr.frame + '"><span>' + pr.avatar + '</span>' + (p ? '<b>' + p.level + '</b>' : "") + '</span>';
  }

  function render() {
    var onMap = ui.tab === "map", wasHidden = $map.hidden, heroish = /^(hero|stats|settings)$/.test(ui.tab);
    $map.hidden = !onMap;
    var views = { map: renderMapUI, quests: renderQuests, badges: renderBadges, hero: renderHero, stats: renderStats, settings: renderSettings };
    var tab = function (id, icon, label, on) {
      return '<button data-tab="' + id + '" class="' + (on ? "on" : "") + '">' + ic(icon) + '<span>' + label + '</span></button>';
    };
    $app.innerHTML = views[ui.tab]() + '<nav class="tabs">' + tab("map", "map", "Map", onMap) + tab("quests", "list-checks", "Quests", ui.tab === "quests") +
      tab("badges", "award", "Badges", ui.tab === "badges") + tab("hero", "user-round", "Hero", heroish) + '</nav>';
    document.body.classList.toggle("on-map", onMap);
    if (onMap) updateMap(wasHidden);
    if (ui.tab === "hero") { fillMemories(); loadBoard(); }
  }

  // ── Map screen ─────────────────────────────────────────────
  // Phones: the map fills the screen with floating controls. Wide screens (1024px+): a side panel holds the
  // region card, search, filters and the quest list next to the map.
  var WIDE = window.matchMedia ? window.matchMedia("(min-width: 1024px)") : { matches: false };
  function isWide() { return WIDE.matches; }
  function topcardHtml(glass) {
    var s = stats(city.quests), p = progress(), pr = profile();
    return '<div class="topcard' + (glass ? " glass" : "") + '">' +
      '<button class="plain" data-tab="hero" aria-label="Your hero, level ' + p.level + '">' + avatarHtml(pr, p) + '</button>' +
      '<div class="grow"><button class="tc-city" data-act="regions">' + flagHtml(city.country) + esc(city.name) + ' ' + ic("chevron-down", "sm") + '</button>' +
      '<div class="tc-sub">' + esc(heroTitle(p)) + ' · ' + fmt(p.into) + ' / ' + fmt(p.need) + ' XP' +
        (p.streak ? ' · <span class="fire">' + ic("flame", "sm") + p.streak + '</span>' : "") + '</div>' + bar(p.pct, "xp") + '</div>' +
      (glass ? '<button class="tc-search" data-act="search-open" aria-label="Search places">' + ic("search") + '</button>' : "") +
      ring(s.pct) + '</div>';
  }
  function searchBarHtml(closable) {
    return '<label class="sbar' + (closable ? " glass" : "") + '">' + ic("search") +
      '<input id="psearch" type="search" placeholder="Search a city, place or quest" autocomplete="off" value="' + esc(ui.sq || "") + '">' +
      (closable ? '<button class="plain" data-act="search-close" aria-label="Close search">' + ic("x") + '</button>' : "") + '</label>';
  }
  // Quests closest to a spot (from every region), for "Quests near here".
  function nearListHtml() {
    var here = ui.panelAt;
    var rows = allQuests.filter(ll).map(function (q) { return [q, km(here, ll(q))]; })
      .sort(function (a, b) { return a[1] - b[1]; }).slice(0, 25);
    return '<div class="ghead"><b>' + ic("locate-fixed", "sm") + 'Near this spot</b><button class="linkbtn" data-act="panel-close">Close</button></div>' +
      '<div class="list flush">' + rows.map(function (x) { return questRow(x[0], { dist: x[1], region: x[0].cid !== cityId }); }).join("") + '</div>';
  }
  // ── Trails on the map ──
  function trailMeta(t) {
    var s = trailStats(t);
    return t.quests.length + ' stops · ' + kmText(t.km) + ' · ' + trailTime(t) + (s.done ? ' · ' + s.done + '/' + s.total + ' done' : "");
  }
  function trailPickHtml() {
    var list = trailsByCity[cityId] || [];
    return '<div class="ghead"><b>' + ic("route", "sm") + 'Trails in ' + esc(city.name) + '</b><button class="linkbtn" data-act="panel-close">Close</button></div>' +
      (list.length ? '<p class="note flat">Tap a trail here or its line on the map. Finish every stop for +' + TRAIL_XP + ' XP.</p><div class="list flush">' +
        list.map(function (t) {
          var done = trailDone(t);
          return '<button class="card tcard' + (done ? " done" : "") + '" data-act="trail-follow" data-id="' + esc(t.id) + '" style="--tc:' + t.color + '">' +
            '<span class="tile" style="--c:' + t.color + '">' + ic(t.icon) + '</span><div class="body"><div class="t">' + esc(t.name) + '</div>' +
            '<div class="m">' + esc(t.sub) + '</div><div class="m">' + trailMeta(t) + '</div></div><span class="xp">' + (done ? ic("check") : "+" + TRAIL_XP) + '</span></button>';
        }).join("") + '</div>' : '<div class="empty">No trails in this region yet.</div>');
  }
  function trailStopsHtml(t) {
    return '<div class="tb-stops">' + t.quests.map(function (q, i) {
      return '<button class="tstop' + (isDone(q) ? " on" : "") + '" data-open="' + esc(q.key) + '" style="--tc:' + t.color + '" aria-label="Stop ' + (i + 1) + ': ' + esc(q.title) + '">' + (i + 1) + '</button>';
    }).join('<i></i>') + '</div>';
  }
  function trailNextHtml(t) {
    var next = trailNext(t);
    return next ? '<button class="btn tb-next" data-open="' + esc(next.key) + '">' + ic("navigation", "sm") + 'Next stop: ' + esc(next.title) + '</button>'
      : '<div class="reward done">' + ic("check", "sm") + 'Trail complete · +' + TRAIL_XP + ' XP</div>';
  }
  function trailBarHtml() {
    var t = trailById[ui.trail];
    return '<div class="trailbar glass" style="--tc:' + t.color + '"><div class="tb-h"><span class="tile sm" style="--c:' + t.color + '">' + ic(t.icon) + '</span>' +
      '<div class="grow"><b>' + esc(t.name) + '</b><small>' + trailMeta(t) + '</small></div>' +
      '<button class="hbtn" data-act="trail-end" aria-label="Stop following this trail">' + ic("x") + '</button></div>' + trailStopsHtml(t) + trailNextHtml(t) + '</div>';
  }
  function trailDetailHtml() {
    var t = trailById[ui.trail];
    return '<div class="ghead"><b>' + ic("route", "sm") + 'Following a trail</b><button class="linkbtn" data-act="trail-end">End</button></div>' +
      '<div class="tdetail" style="--tc:' + t.color + '"><h3>' + esc(t.name) + '</h3><p class="note flat">' + esc(t.sub) + '</p><p class="note flat">' + trailMeta(t) + '</p>' +
      trailStopsHtml(t) + trailNextHtml(t) + '</div>' +
      '<div class="list flush">' + t.quests.map(function (q, i) { return questRow(q, { n: i + 1 }); }).join("") + '</div>';
  }
  function sideBodyHtml() {
    if ((ui.sq || "").trim()) return searchResultsHtml();
    if (ui.trail && trailById[ui.trail]) return trailDetailHtml();
    if (ui.panel === "trails") return trailPickHtml();
    if (ui.panel === "near" && ui.panelAt) return nearListHtml();
    return '<button class="btn ghost trailsbtn" data-act="trails">' + ic("route") + 'Trails in ' + esc(city.name) + ' <small>' + (trailsByCity[cityId] || []).length + '</small></button>' +
      '<div class="chips">' + catChips() + '<i class="sep"></i>' + chip("show", "todo", "To do") + chip("show", "done", "Done") + chip("show", "all", "Both") + '</div>' +
      '<div class="chips">' + areaChips() + '</div><div class="list flush">' + questListHtml() + '</div>';
  }
  function mapCtlHtml() {
    return '<div class="mapctl">' +
      '<button class="glass desk" data-act="zoom-in" aria-label="Zoom in">' + ic("plus") + '</button>' +
      '<button class="glass desk" data-act="zoom-out" aria-label="Zoom out">' + ic("minus") + '</button>' +
      '<button class="glass keep" data-act="locate" aria-label="My location">' + ic("locate-fixed") + '</button>' +
      '<button class="glass keep' + (ui.panel === "trails" || ui.trail ? " on" : "") + '" data-act="trails" aria-label="Trails">' + ic("route") + '</button>' +
      '<button class="glass" data-act="tilt" aria-label="Tilt the map">' + ic("box") + '</button>' +
      '<button class="glass" data-act="overview" aria-label="All regions">' + ic("globe") + '</button>' +
      '<button class="glass" data-act="suggest" aria-label="Surprise me">' + ic("dices") + '</button>' +
      '<button class="glass rec" data-act="rec-start" aria-label="Suggest a place">' + ic("map-pin") + ic("plus", "mini") + '</button>' +
      '</div>';
  }
  function fabHtml() {
    var dq = dailyQuest();
    return dq && !isDone(dq)
      ? '<button class="fab" data-open="' + esc(dq.key) + '">' + ic("star") + '<span><small>Quest of the day · +' + XP.daily + ' XP' +
        (seasonDaysLeft(dq) !== null ? ' · ' + leftText(seasonDaysLeft(dq)).toLowerCase() : "") + '</small>' + esc(dq.title) + '</span></button>'
      : '<button class="fab done" data-act="suggest">' + ic("check") + '<span><small>Quest of the day done</small>Surprise me with another</span></button>';
  }
  function renderMapUI() {
    var wide = isWide();
    document.body.classList.toggle("pinmode", !!ui.pinMode);
    var side = wide ? '<aside class="side">' + topcardHtml(false) + searchBarHtml(false) + '<div id="presults" class="sidebody">' + sideBodyHtml() + '</div></aside>' : "";
    if (ui.pinMode) {
      return side + mapStateHtml() + '<div class="pm-pin" aria-hidden="true">' + ic("map-pin") + '</div>' +
        '<div class="pm-bar glass"><div class="pm-t"><b>Suggest a place</b><span>Move the map (or tap) so the pin sits on the spot</span></div>' +
        '<div class="pm-btns"><button class="btn plain" data-act="rec-cancel">Cancel</button><button class="btn" data-act="rec-here">' + ic("check", "sm") + 'Use this spot</button></div></div>';
    }
    if (wide) { document.body.classList.remove("has-bar"); return side + mapStateHtml() + mapCtlHtml() + (ui.trail ? "" : fabHtml()); }
    var top = ui.searchOpen
      ? searchBarHtml(true) + '<div id="presults" class="sres glass">' + searchResultsHtml() + '</div>'
      : topcardHtml(true) + '<div class="chips">' + catChips() + '</div><div class="chips area-row">' + areaChips() + '</div>';
    var bottom = ui.searchOpen ? "" : ui.trail && trailById[ui.trail] ? trailBarHtml()
      : ui.panel === "trails" ? '<div class="nearpanel glass">' + trailPickHtml() + '</div>'
      : ui.panel === "near" && ui.panelAt ? '<div class="nearpanel glass">' + nearListHtml() + '</div>' : "";
    document.body.classList.toggle("has-bar", !!bottom);
    return '<div class="map-top">' + top + '</div>' + mapStateHtml() + bottom + mapCtlHtml() + (bottom ? "" : fabHtml());
  }

  // ── Place search: regions, quests and (online) any town or address ──
  function fold(s) { return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(); }
  var placeCache = {}, placeTimer = null;
  function searchResultsHtml() {
    var q = fold((ui.sq || "").trim());
    if (!q) return '<div class="note flat sres-hint">Type a city, town, address or quest.</div>';
    var html = "", info = window.REGION_INFO || {};
    var regs = Object.keys(cities).concat(Object.keys(info).filter(function (id) { return !cities[id]; })).filter(function (id) {
      var n = cities[id] ? cities[id].name + " " + (cities[id].subtitle || "") : info[id].name + " " + info[id].subtitle;
      return fold(n).indexOf(q) !== -1;
    }).slice(0, 5);
    if (regs.length) {
      html += '<div class="sgroup">Regions</div>' + regs.map(function (id) {
        var c = cities[id], cc = c ? c.country : (window.COUNTRIES[info[id].cc] || {}).name;
        return '<button class="srow" data-goto-region="' + id + '">' + flagHtml(cc) + '<span class="grow"><b>' + esc(c ? c.name : info[id].name) + '</b><small>' +
          (c ? cityStats(id).total + " quests" : "Coming soon") + '</small></span></button>';
      }).join("");
    }
    var qs = allQuests.filter(function (x) { return fold(x.title + " " + x.q).indexOf(q) !== -1; }).slice(0, 6);
    if (qs.length) {
      html += '<div class="sgroup">Quests</div>' + qs.map(function (x) {
        return '<button class="srow" data-open="' + esc(x.key) + '"><span class="tile sm ' + x.cat + '">' + ic(CATS[x.cat].icon) + '</span><span class="grow"><b>' + esc(x.title) +
          '</b><small>' + esc(cities[x.cid].name) + ' · ' + esc(cities[x.cid].areas[x.area]) + '</small></span></button>';
      }).join("");
    }
    var places = placeCache[q];
    html += '<div class="sgroup">Places</div>';
    if (places === undefined) html += '<div class="note flat sres-hint">Searching the map…</div>';
    else if (!places.length) html += '<div class="note flat sres-hint">No places found.</div>';
    else html += places.map(function (p) {
      return '<button class="srow" data-goto-place="' + p.lat + "," + p.lng + "," + p.zoom + '">' + ic("map-pin") + '<span class="grow"><b>' + esc(p.name) +
        '</b><small>' + esc(p.sub) + '</small></span></button>';
    }).join("");
    return html;
  }
  // Towns and addresses come from Photon (OpenStreetMap search by Komoot), limited to our countries.
  function findPlaces(raw) {
    var q = fold(raw.trim());
    clearTimeout(placeTimer);
    if (q.length < 2 || placeCache[q] !== undefined) return;
    placeTimer = setTimeout(function () {
      var url = "https://photon.komoot.io/api/?limit=6&lang=en&bbox=-5.5,41.2,15.6,55.2&q=" + encodeURIComponent(raw.trim());
      fetch(url).then(function (r) { return r.json(); }).then(function (d) {
        var seen = {};
        placeCache[q] = (d.features || []).map(function (f) {
          var p = f.properties || {}, t = p.osm_value, c = f.geometry.coordinates;
          var zoom = /^(country|state)$/.test(t) ? 7 : /^(city|county)$/.test(t) ? 11.5 : /^(town|municipality|borough)$/.test(t) ? 12.5 : /^(village|suburb|hamlet|neighbourhood|quarter)$/.test(t) ? 14 : 16;
          return { name: p.name || p.street || raw, sub: [p.city && p.city !== p.name ? p.city : "", p.state, p.country].filter(Boolean).join(", "), lat: c[1], lng: c[0], zoom: zoom };
        }).filter(function (p) { var k = p.name + "|" + p.sub; if (seen[k]) return false; seen[k] = 1; return true; });
      }, function () { placeCache[q] = []; }).then(function () {
        if (fold((ui.sq || "").trim()) === q) { var box = document.getElementById("presults"); if (box) box.innerHTML = searchResultsHtml(); }
      });
    }, 280);
  }

  // ── Quests screen ──────────────────────────────────────────
  function questRow(q, o) {
    o = o || {};
    var c = cities[q.cid], r = rec(q) || {}, ph = photoOf(q), done = isDone(q), bits = [];
    if (o.region) bits.push(esc(c.name));
    bits.push(esc(c.areas[q.area]));
    if (o.dist !== undefined) bits.push(kmText(o.dist));
    var left = seasonDaysLeft(q);
    if (q.months) bits.push(left !== null ? '<span class="season' + (left <= 14 ? " soon" : "") + '">' + ic("calendar", "sm") + (done ? "In season" : leftText(left)) + '</span>'
      : inSeason(q) ? "In season" : "Season: " + seasonText(q));
    if (r.photos) bits.push(ic("camera", "sm") + r.photos);
    return '<div class="card ' + q.cat + (done ? " done" : "") + '" data-open="' + esc(q.key) + '" role="button" tabindex="0">' +
      (o.n ? '<span class="num">' + o.n + '</span>' : "") +
      (ph ? '<img class="thumb" loading="lazy" alt="" src="' + esc(thumb(ph[0], 120)) + '">' : '<span class="tile">' + ic(CATS[q.cat].icon) + '</span>') +
      '<div class="body"><div class="t">' + esc(q.title) + '</div><div class="m">' + bits.join(" · ") + '</div></div>' +
      (isSaved(q) && !done ? '<span class="saved">' + ic("bookmark") + '</span>' : "") +
      '<button class="check' + (done ? " on" : "") + '" data-toggle="' + esc(q.key) + '" aria-pressed="' + done + '" aria-label="' +
        (done ? "Mark as not done" : "Mark as done") + '">' + ic("check") + '</button></div>';
  }
  function questListHtml() {
    var needle = ui.q.trim().toLowerCase();
    var list = city.quests.filter(function (q) {
      if (ui.cat !== "all" && q.cat !== ui.cat) return false;
      if (ui.show === "todo" && isDone(q)) return false;
      if (ui.show === "done" && !isDone(q)) return false;
      if (needle && (q.title + " " + q.desc + " " + city.areas[q.area] + " " + q.q).toLowerCase().indexOf(needle) === -1) return false;
      return true;
    });
    if (!list.length) {
      return '<div class="empty">' + (needle ? 'No quests match "' + esc(ui.q.trim()) + '".' : ui.show === "done" ? "Nothing completed here yet. Pick your first one!" : "Nothing left in this filter.") + '</div>';
    }
    if (ui.near && ui.pos) {
      return list.filter(ll).map(function (q) { return [q, km(ui.pos, ll(q))]; }).sort(function (a, b) { return a[1] - b[1]; })
        .map(function (x) { return questRow(x[0], { dist: x[1] }); }).join("");
    }
    if (needle) return list.map(function (q) { return questRow(q); }).join("");
    return seasonStrip() + Object.keys(city.areas).map(function (a) {
      var part = list.filter(function (q) { return q.area === a; });
      if (!part.length) return "";
      var s = stats(inArea(a));
      return '<div class="ghead"><b>' + esc(city.areas[a]) + '</b><span>' + s.done + ' / ' + s.total + '</span></div>' + part.map(function (q) { return questRow(q); }).join("");
    }).join("");
  }
  // Seasonal quests open right now, soonest ending first: "do it before it's gone".
  function seasonStrip() {
    var list = seasonalNow(city.quests).filter(function (q) { return ui.cat === "all" || q.cat === ui.cat; });
    if (!list.length || ui.show === "done") return "";
    return '<div class="ghead"><b>' + ic("calendar", "sm") + 'In season now</b><span>do them before they end</span></div><div class="sstrip">' +
      list.slice(0, 10).map(function (q) {
        var d = seasonDaysLeft(q), ph = photoOf(q);
        return '<button class="scard ' + q.cat + '" data-open="' + esc(q.key) + '">' +
          (ph ? '<img alt="" loading="lazy" src="' + esc(thumb(ph[0], 240)) + '">' : '<span class="tile">' + ic(CATS[q.cat].icon) + '</span>') +
          '<span class="sleft' + (d <= 14 ? " soon" : "") + '">' + leftText(d) + '</span><b>' + esc(q.title) + '</b></button>';
      }).join("") + '</div>';
  }
  function trailCard(t) {
    var s = trailStats(t);
    return '<button class="card trail' + (s.done === s.total ? " done" : "") + '" data-trail="' + esc(t.id) + '">' +
      '<span class="tile acc">' + ic(t.icon) + '</span><div class="body"><div class="t">' + esc(t.name) + '</div>' +
      '<div class="m">' + esc(t.sub) + '</div><div class="m">' + t.quests.length + ' stops · ' + kmText(t.km) + ' · ' + trailTime(t) + ' · ' + (s.done === s.total ? "Complete" : s.done + " / " + s.total + " done") + '</div>' + bar(s.pct) + '</div>' +
      '<span class="xp">+' + TRAIL_XP + '</span></button>';
  }
  function renderQuests() {
    var s = stats(city.quests), html = head(city.name, s.done + " of " + s.total + " quests done", { picker: true }) +
      '<div class="filters">' + seg("data-qview", ui.qview, [["all", "Quests"], ["trails", "Trails"], ["saved", "Saved"]]);
    if (ui.qview === "all") {
      html += '<div class="searchrow"><label class="search">' + ic("search") + '<input id="qsearch" type="search" placeholder="Search ' + esc(city.name) +
        '" value="' + esc(ui.q) + '" autocomplete="off"></label>' +
        '<button class="chip' + (ui.near ? " on" : "") + '" data-act="near">' + ic("locate-fixed", "sm") + 'Near me</button></div>' +
        '<div class="chips">' + catChips() + '<i class="sep"></i>' + chip("show", "todo", "To do") + chip("show", "done", "Done") + chip("show", "all", "Both") + '</div></div>' +
        '<div class="list" id="qlist">' + questListHtml() + '</div>';
    } else if (ui.qview === "trails") {
      var list = trailsByCity[cityId] || [];
      html += '</div><div class="list"><p class="note flat">Short walks through quests that sit close together. Finish every stop for +' + TRAIL_XP + ' XP.</p>' +
        (list.length ? list.map(trailCard).join("") : '<div class="empty">No trails in this region yet.</div>') + '</div>';
    } else {
      var saved = allQuests.filter(isSaved).sort(function (a, b) { return store.saved[b.key] - store.saved[a.key]; });
      html += '</div><div class="list">' + (saved.length ? saved.map(function (q) { return questRow(q, { region: true }); }).join("")
        : '<div class="empty">' + ic("bookmark", "big") + '<br>Tap the bookmark on any quest to save it for later.<br>Saved quests from every region collect here.</div>') + '</div>';
    }
    return html;
  }

  // ── Badges screen ──────────────────────────────────────────
  function renderBadges() {
    var list = badges(city), groups = [], got = 0, all = 0, bx = 0;
    list.forEach(function (b) {
      got += b.tier; all += b.max; bx += badgeXp(b);
      if (groups.indexOf(b.group) === -1) groups.push(b.group);
    });
    var html = head(city.name, "Badges earn XP. Each region has its own set.", { picker: true }) + '<div class="section">' +
      '<div class="panel score"><div><b>' + got + ' / ' + all + '</b><span>badges</span></div><div><b>' + fmt(bx) +
      '</b><span>XP from badges</span></div></div>';
    groups.forEach(function (g) {
      html += '<h2>' + esc(g) + '</h2><div class="badges">' + list.filter(function (b) { return b.group === g; }).map(badgeCard).join("") + '</div>';
    });
    return html + '<p class="note">Bronze +100 XP · Silver +200 · Gold +400 · Special +150</p></div>';
  }
  function badgeCard(b) {
    var cls = !b.tier ? "locked" : b.max === 1 ? "gold" : TIERS[b.tier - 1].key, stars = "";
    if (b.max > 1) for (var i = 0; i < b.max; i++) stars += i < b.tier ? "★" : "☆";
    var full = b.tier === b.max, pct = full ? 100 : Math.round((b.have / b.goal) * 100);
    var next = b.max > 1 ? TIERS[b.tier] : { label: "", xp: SPECIAL_XP };
    return '<div class="bdg ' + cls + '"><div class="bi">' + b.icon + '</div><div class="bn">' + esc(b.name) + '</div>' +
      '<div class="bt">' + (stars ? stars + " " : "") + tierLabel(b) + '</div><div class="bd">' + esc(b.desc) + '</div>' + bar(pct) +
      '<div class="bp">' + (full ? "Complete" : b.have + " / " + b.goal + " · " + (next.label ? next.label + " " : "") + "+" + next.xp + " XP") + '</div></div>';
  }

  // ── Hero, stats and settings ───────────────────────────────
  function unlockTile(u, lv) {
    var locked = u.level > lv;
    var face = u.type === "avatar" ? '<span class="uf">' + u.value + '</span>' :
      u.type === "frame" ? '<span class="uf fr fr-' + u.value + '">' + profile().avatar + '</span>' :
      '<span class="uf sw" style="background:' + u.color + '"></span>';
    return '<div class="ut' + (locked ? " locked" : "") + '">' + face + '<small>' + (locked ? "Lv " + u.level : esc(u.name || "Avatar")) + '</small></div>';
  }
  function renderHero() {
    var p = progress(), pr = profile(), cls = CLASSES[pr.cls], dq = dailyQuest();
    var next = Math.min(50, 10 * (p.thisWeek ? p.streak - 1 : p.streak));
    var upcoming = UNLOCKS.filter(function (u) { return u.level > p.level; }).sort(function (a, b) { return a.level - b.level; });
    var html = head("Your hero", "Every quest, anywhere, earns XP", { gear: true }) + '<div class="section">' +
      '<div class="panel hero">' + avatarHtml(pr, null, "xl") +
        '<div class="grow"><div class="lv">Level ' + p.level + (cls ? ' · ' + cls.name : '') + '</div>' +
        '<div class="ttl">' + esc(pr.name || "Explorer") + '</div><div class="sub">' + esc(heroTitle(p)) + '</div>' + bar(p.pct, "xp") +
        '<div class="ls">' + fmt(p.into) + ' / ' + fmt(p.need) + ' XP to level ' + (p.level + 1) + '</div></div>' +
        '<button class="edit" data-act="profile" aria-label="Edit your explorer">' + ic("pencil") + '</button></div>' +
      '<div class="streak' + (p.streak ? " on" : "") + '">' + ic("flame") + '<span>' + (p.streak
        ? p.streak + "-week streak" + (next ? ". Quests this week earn +" + next + "% XP" : "")
        : "Complete a quest this week to start a streak: +10% XP per week in a row, up to +50%") + '</span></div>' +
      '<div class="stats">' +
        '<div class="stat"><b>' + fmt(p.xp) + '</b><span>Total XP</span></div>' +
        '<div class="stat"><b>' + p.quests + '</b><span>Quests</span></div>' +
        '<div class="stat"><b>' + p.regions + '/' + Object.keys(cities).length + '</b><span>Regions</span></div>' +
        '<div class="stat"><b>' + p.badges + '</b><span>Badges</span></div></div>';
    if (dq) {
      html += '<button class="panel daily" data-open="' + esc(dq.key) + '">' + ic("star", "big") + '<div class="grow"><small>Quest of the day' +
        (isDone(dq) ? " · done" : " · +" + XP.daily + " XP bonus") + '</small><b>' + esc(dq.title) + '</b></div>' + ic(isDone(dq) ? "check" : "chevron-right") + '</button>';
    }
    html += '<div class="two"><button class="btn ghost" data-tab="stats">' + ic("chart-column") + 'Stats</button>' +
      '<button class="btn ghost" data-act="share">' + ic("share-2") + 'Share card</button></div>' +
      '<h2>Unlocks</h2><div class="panel">' +
        (upcoming.length ? '<div class="nextu">Next at level ' + upcoming[0].level + ': <b>' + esc(unlockLabel(upcoming[0])) + '</b></div>' : '<div class="nextu">Everything unlocked. Legendary.</div>') +
        '<div class="ugrid">' + UNLOCKS.map(function (u) { return unlockTile(u, p.level); }).join("") + '</div>' +
        '<button class="btn ghost" data-act="profile" style="margin-top:12px">Customize your explorer</button></div>' +
      '<h2>Memories</h2><div class="panel" id="memories"><div class="note flat">Loading…</div></div>' +
      '<h2>Leaderboard</h2><div class="panel" id="board">' + boardHtml() + '</div></div>';
    return html;
  }
  function boardHtml() {
    var C = window.cdCloud;
    if (!C || !C.available) return '<div class="note flat">The leaderboard needs cloud save, which is not available right now.</div>';
    if (!C.user) return '<p class="note flat" style="margin-bottom:12px">See how you compare with other explorers.</p><button class="btn ghost" data-act="auth">Sign in to join</button>';
    if (!store.lb) {
      return '<p class="note flat" style="margin-bottom:12px">Join to compare levels with other explorers. Only your explorer name, avatar, level and totals are shown, never your email.</p>' +
        '<button class="btn" data-act="lb-on">Join the leaderboard</button>';
    }
    if (C.boardError) return '<div class="note flat err">' + esc(C.boardError) + '</div>';
    if (!C.board) return '<div class="note flat">Loading…</div>';
    return C.board.map(function (e, i) {
      return '<div class="lbrow' + (e.uid === C.user.uid ? " me" : "") + '"><span class="rank">' + (i + 1) + '</span><span class="lba">' + esc(e.avatar || "🎒") + '</span>' +
        '<div class="grow"><b>' + esc(e.name || "Explorer") + '</b><small>' + esc(e.title || "") + ' · ' + (e.quests || 0) + ' quests</small></div>' +
        '<span class="lbx"><b>Lv ' + (e.level || 1) + '</b><small>' + fmt(e.xp || 0) + ' XP</small></span></div>';
    }).join("") || '<div class="note flat">Nobody here yet. You are the first!</div>';
  }
  function loadBoard() {
    var C = window.cdCloud;
    if (C && C.user && store.lb && !C.board && C.loadBoard) C.loadBoard();
  }
  // Regions without quests yet, counted per country name.
  function soonCounts() {
    var info = window.REGION_INFO || {}, names = window.COUNTRIES || {}, out = {};
    Object.keys(info).forEach(function (id) {
      if (cities[id] || !names[info[id].cc]) return;
      var n = names[info[id].cc].name;
      out[n] = (out[n] || 0) + 1;
    });
    return out;
  }
  function regionRows() {
    var html = "", last = null, cs = countryStats(), soon = soonCounts();
    var soonRow = function (n) {
      return soon[n] ? '<div class="rsoon">' + ic("calendar", "sm") + soon[n] + (cs[n] ? " more " : " ") + (soon[n] === 1 ? "region" : "regions") + ' coming soon</div>' : "";
    };
    Object.keys(cities).forEach(function (id) {
      var c = cities[id], s = cityStats(id);
      if (c.country !== last) {
        if (last) html += soonRow(last);
        html += '<div class="rgroup">' + flagHtml(c.country) + esc(c.country) + ' <small>' + cs[c.country].started + ' / ' + cs[c.country].regions + (cs[c.country].regions === 1 ? ' region' : ' regions') + ' started</small></div>';
        last = c.country;
      }
      html += '<button class="rrow' + (id === cityId ? " cur" : "") + '" data-city="' + id + '">' +
        '<i class="dot big" style="background:' + c.color + '"></i>' +
        '<div class="grow"><div class="rn">' + esc(c.name) + ' <small>' + esc(c.subtitle || "") + '</small></div>' + bar(s.pct) + '</div>' +
        '<span class="rp">' + s.done + ' / ' + s.total + '</span></button>';
    });
    if (last) html += soonRow(last);
    Object.keys(soon).forEach(function (n) {
      if (!cs[n]) html += '<div class="rgroup">' + flagHtml(n) + esc(n) + '</div>' + soonRow(n);
    });
    return html;
  }
  function renderStats() {
    var p = progress(), s = stats(city.quests), cs = countryStats();
    var html = head("Stats", fmt(p.xp) + " XP across " + p.quests + (p.quests === 1 ? " quest" : " quests"), { back: true }) + '<div class="section"><div class="countries">' +
      Object.keys(cs).map(function (n) {
        var o = cs[n], pct = o.total ? Math.round((o.done / o.total) * 100) : 0;
        return '<div class="ctry"><div class="ctry-h">' + flagHtml(n) + '<b>' + esc(n) + '</b><span>' + pct + '%</span></div>' + bar(pct) +
          '<small>' + o.done + ' / ' + o.total + ' quests · ' + o.started + ' / ' + o.regions + ' regions</small></div>';
      }).join("") + '</div><h2>Attributes</h2><div class="panel">';
    ATTRS.forEach(function (a) {
      var x = p.attr[a.key], ai = attrInfo(x);
      html += '<div class="attr"><span class="ai">' + ic(a.icon) + '</span><div class="grow"><div class="an">' + a.name +
        ' <span>Lv ' + ai.level + '</span></div><small>' + a.desc + ' · ' + fmt(x) + ' XP</small>' + bar(ai.pct, "xp") + '</div></div>';
    });
    html += '</div><h2>' + flagHtml(city.country) + esc(city.name) + '</h2><div class="panel profile">' + ring(s.pct, true) + '<div class="grow"><div class="lvx">' +
      esc(levelFor(s.pct)) + '</div><div class="ls">' + s.done + ' / ' + s.total + ' quests · ' + (trailsByCity[cityId] || []).filter(trailDone).length + ' trails</div></div></div>' +
      '<div class="panel" style="margin-top:10px">';
    Object.keys(CATS).forEach(function (c) {
      html += meterRow(ic(CATS[c].icon, "sm") + CATS[c].label, stats(city.quests.filter(function (q) { return q.cat === c; })), c);
    });
    Object.keys(city.areas).forEach(function (a) { html += meterRow(esc(city.areas[a]), stats(inArea(a)), ""); });
    html += '</div><h2>All regions</h2><div class="panel">' + regionRows() + '</div><h2>Recent XP</h2><div class="panel">';
    var gains = p.gains.slice(-8).reverse();
    if (!gains.length) html += '<div class="note flat">No XP yet. Your first quest also earns New region and New area bonuses.</div>';
    gains.forEach(function (g) {
      html += '<div class="gain"><div class="grow"><b>' + esc(g.q.title) + '</b><small>' +
        g.parts.map(function (x) { return esc(x[0]) + " +" + x[1]; }).join(" · ") + '</small></div><span>+' + g.xp + '</span></div>';
    });
    return html + '</div><h2>How XP works</h2><div class="panel"><ul class="rules">' +
      '<li>Quest +' + XP.quest + ', seasonal +' + XP.seasonal + ', day trip outside the city +' + XP.far + '</li>' +
      '<li>First quest in a new region +' + XP.region + ', in a new area +' + XP.area + '</li>' +
      '<li>Quest of the day +' + XP.daily + ', checking in on the spot +' + XP.checkin + '</li>' +
      '<li>A journal note +' + XP.journal + ', a photo +' + XP.photo + '</li>' +
      '<li>Your class: +25% on its kind of quest</li>' +
      '<li>Weekly streak: +10% per week in a row, up to +50%</li>' +
      '<li>Finishing a trail +' + TRAIL_XP + '. Badges: Bronze +100, Silver +200, Gold +400, Special +150</li></ul></div></div>';
  }
  function ago(t) {
    var s2 = Math.round((Date.now() - t) / 1000);
    return s2 < 60 ? "just now" : s2 < 3600 ? Math.round(s2 / 60) + " min ago" : new Date(t).toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }
  function accountHtml() {
    var C = window.cdCloud;
    if (!C || !C.available) return '<div class="note flat">Cloud save is not set up. Your explorer lives on this device; use Backup below to move it.</div>';
    if (!C.ready && !C.error) return '<div class="note flat">Connecting…</div>';
    var err = C.error ? '<p class="note err">' + esc(C.error) + '</p>' : "";
    if (!C.user) {
      return '<p class="note flat" style="margin-bottom:12px">Sign in to keep your explorer, progress and photos in the cloud and pick up on any device.</p>' +
        '<button class="btn" data-act="auth">Sign in or create an account</button>' + err;
    }
    return '<div class="acct">' + ic("cloud", "big") + '<div class="grow"><b>' + esc(C.user.email || C.user.name || "Signed in") + '</b><small>' +
      (C.busy ? "Syncing…" : C.lastSync ? "Saved to the cloud " + ago(C.lastSync) : "Not synced yet") + '</small></div></div>' + err +
      '<div class="two" style="margin:12px 0 0"><button class="btn ghost" data-act="sync">' + ic("refresh-cw") + 'Sync now</button>' +
      '<button class="btn plain" data-act="signout">Sign out</button></div>';
  }
  function switchHtml(act, on, label) {
    return '<div class="setrow"><span>' + label + '</span><button class="switch' + (on ? " on" : "") + '" data-act="' + act + '" role="switch" aria-checked="' + !!on + '" aria-label="' + label + '"><i></i></button></div>';
  }
  function renderSettings() {
    var t = store.theme || "light";
    return head("Settings", "City Disco " + APP_VERSION, { back: true }) + '<div class="section">' +
      '<h2 class="first">Account</h2><div class="panel" id="account">' + accountHtml() + '</div>' +
      '<h2>Preferences</h2><div class="panel"><div class="setrow"><span>Appearance</span>' +
        seg("data-theme-set", t, [["light", "Light"], ["dark", "Dark"], ["auto", "Auto"]]) + '</div>' +
        switchHtml("sound", store.sound !== false, "Sounds") + switchHtml("lb-toggle", !!store.lb, "Show me on the leaderboard") + '</div>' +
      '<h2>Suggestions</h2><div class="panel"><button class="btn ghost" data-act="rec-start">' + ic("map-pin") + 'Suggest a place</button>' +
        '<button class="btn ghost" data-act="rec-mine">' + ic("list-checks") + 'Your suggestions</button>' +
        (isAdmin() ? '<button class="btn" data-act="rec-review">' + ic("star") + 'Review suggestions</button>' : "") + '</div>' +
      '<h2>Backup</h2><div class="panel"><button class="btn ghost" data-act="export">' + ic("copy") + 'Copy progress to clipboard</button>' +
        '<button class="btn ghost" data-act="import">' + ic("download") + 'Restore from backup</button>' +
        '<p class="note">The backup text holds your progress and profile, not your photos. Signing in backs up everything.</p></div>' +
      '<h2>About</h2><div class="panel"><a class="btn ghost" target="_blank" rel="noopener" href="' + REPO + '/issues/new?title=' +
        encodeURIComponent("Feedback: ") + '">' + ic("triangle-alert") + 'Report a problem or idea</a>' +
        '<p class="note">Map data © OpenStreetMap contributors, tiles by OpenFreeMap, place search by Photon (Komoot). Quest photos from Wikimedia Commons under free licences, credited on each quest. Icons by Lucide.</p></div></div>';
  }

