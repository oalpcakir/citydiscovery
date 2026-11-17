// Built by tools/build.py from src/*.js. Edit the parts in src/, not this file.
(function () {
  "use strict";

  var APP_VERSION = "0.14.0";
  var STORE_KEY = "citydiscovery.v1";
  var REPO = "https://github.com/oalpcakir/citydiscovery";
  var CATS = {
    gor: { label: "See", icon: "landmark", color: "#3b82f6" },
    ye: { label: "Eat & drink", icon: "utensils", color: "#f97316" },
    dene: { label: "Do", icon: "sparkles", color: "#a855f7" }
  };
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var STYLE_LIGHT = "https://tiles.openfreemap.org/styles/liberty";
  var STYLE_DARK = "https://tiles.openfreemap.org/styles/positron"; // lightness-inverted at load time
  var FALLBACK_COLORS = ["#f43f5e", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#14b8a6", "#ec4899"];
  var OVERVIEW_ZOOM = 9.5; // below this the map shows whole regions instead of pins
  var ICONS = window.ICONS || {};
  var PHOTOS = window.PHOTOS || {};

  // ── Persistent state ───────────────────────────────────────
  // { city, theme, sound, lb, profile, saved: { key: ±ms }, done: { "<region>/<quest>": { at, note, photos, v, d, u } } }
  var store = load();
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(STORE_KEY));
      if (s && typeof s === "object" && s.done) return s;
    } catch (e) { /* corrupt data: start fresh */ }
    return { city: null, done: {} };
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { toast("Could not save"); }
    if (window.cdCloud && window.cdCloud.onLocalChange) window.cdCloud.onLocalChange();
  }

  var cities = window.CITIES || {};
  // Quests that moved to another region keep their progress (see tools/reassign_quests.py and web/moved.js).
  function migrateMoved() {
    var M = window.MOVED || {}, n = 0;
    Object.keys(store.done).forEach(function (k) {
      var to = M[k];
      if (to && !store.done[to]) { store.done[to] = store.done[k]; delete store.done[k]; n++; }
    });
    if (store.profile && store.profile.home && !cities[store.profile.home]) store.profile.home = "";
    if (n) save();
  }
  migrateMoved();
  var cityId = cities[store.city] ? store.city : Object.keys(cities)[0];
  var city = cities[cityId];
  var ui = { tab: "map", cat: "all", area: "all", show: "todo", qview: "all", q: "", near: false, pos: null, open: null, trail: null };

  // All regions' quests in one list; each knows its region (cid) and storage key.
  var allQuests = [], byKey = {};
  Object.keys(cities).forEach(function (id, i) {
    cities[id].color = (window.REGION_COLORS && window.REGION_COLORS[id]) || FALLBACK_COLORS[i % FALLBACK_COLORS.length];
    cities[id].quests.forEach(function (q) {
      q.cid = id; q.key = id + "/" + q.id;
      allQuests.push(q); byKey[q.key] = q;
    });
  });

  function ic(name, cls) {
    return '<svg class="ic' + (cls ? " " + cls : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || "") + '</svg>';
  }
  function rec(q) { return store.done[q.key]; }
  function isDone(q) { var r = rec(q); return !!(r && r.at); }
  function isSaved(q) { return (store.saved || {})[q.key] > 0; }
  function inSeason(q) { return !q.months || q.months.indexOf(new Date().getMonth() + 1) !== -1; }
  function ll(q) { var c = cities[q.cid]; return c.coords && c.coords[q.id]; }
  function photoOf(q) { return PHOTOS[q.key] || null; }
  function thumb(url, w) { return url.replace(/\/\d+px-/, "/" + w + "px-"); }
  function km(a, b) {
    return Math.hypot((a[0] - b[0]) * 111.32, (a[1] - b[1]) * 111.32 * Math.cos((a[0] * Math.PI) / 180));
  }
  function kmText(d) { return d < 1 ? Math.round(d * 1000 / 10) * 10 + " m" : d < 10 ? d.toFixed(1) + " km" : Math.round(d) + " km"; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmt(n) { return Number(n).toLocaleString("en-GB"); }
  function seasonText(q) { return q.months ? q.months.map(function (m) { return MONTHS[m - 1]; }).join(", ") : ""; }
  function stats(list) {
    var d = list.filter(isDone).length;
    return { done: d, total: list.length, pct: list.length ? Math.round((d / list.length) * 100) : 0 };
  }
  function inArea(a) { return city.quests.filter(function (q) { return q.area === a; }); }
  function cityStats(id) { return stats(cities[id].quests); }
  function cityCenter(c) { return [(c.bounds[0][1] + c.bounds[1][1]) / 2, (c.bounds[0][0] + c.bounds[1][0]) / 2]; } // [lng, lat]
  function levelFor(pct) {
    var L = city.levels;
    return L[Math.min(L.length - 1, Math.floor((pct / 100) * (L.length - 1) + 0.0001))];
  }
  function theme() {
    var t = store.theme || "light";
    if (t === "auto") t = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    return t;
  }
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", theme());
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", theme() === "dark" ? "#171c26" : "#f4f6fb");
  }
  function dayKey(t) { var d = t ? new Date(t) : new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }

  // ── Badges ─────────────────────────────────────────────────
  // Badges and XP are never stored; they are recomputed from the completion log.
  var TIERS = [
    { key: "bronze", label: "Bronze", xp: 100 },
    { key: "silver", label: "Silver", xp: 200 },
    { key: "gold", label: "Gold", xp: 400 }
  ];
  var SPECIAL_XP = 150;
  var CAT_BADGES = {
    gor: { icon: "👀", name: "Sightseer" },
    ye: { icon: "🍴", name: "Foodie" },
    dene: { icon: "✨", name: "Adventurer" }
  };
  function areaQuests(c, a) { return c.quests.filter(function (q) { return q.area === a; }); }
  function badges(c) {
    var out = [];
    function tiered(id, group, meta, list, what) {
      var s = stats(list);
      var goals = [Math.max(1, Math.ceil(s.total / 3)), Math.max(1, Math.ceil((s.total * 2) / 3)), s.total];
      var tier = 0;
      goals.forEach(function (g) { if (s.total && s.done >= g) tier++; });
      out.push({ id: id, group: group, icon: meta.icon, name: meta.name, desc: what, tier: tier, max: 3,
        have: s.done, goal: tier < 3 ? goals[tier] : s.total });
    }
    function single(id, icon, name, desc, have, goal) {
      out.push({ id: id, group: "Special", icon: icon, name: name, desc: desc, tier: have >= goal ? 1 : 0, max: 1,
        have: Math.min(have, goal), goal: goal });
    }
    Object.keys(c.areas).forEach(function (a) {
      var meta = (c.areaBadges && c.areaBadges[a]) || { icon: "📍", name: c.areas[a] };
      tiered("area-" + a, "Areas", meta, areaQuests(c, a), c.areas[a] + " quests");
    });
    Object.keys(CATS).forEach(function (k) {
      tiered("cat-" + k, "Categories", CAT_BADGES[k], c.quests.filter(function (q) { return q.cat === k; }), CATS[k].label + " quests");
    });
    var done = c.quests.filter(isDone), perDay = {}, bestDay = 0;
    done.forEach(function (q) {
      var d = new Date(rec(q).at).toDateString();
      perDay[d] = (perDay[d] || 0) + 1;
      if (perDay[d] > bestDay) bestDay = perDay[d];
    });
    var areaKeys = Object.keys(c.areas);
    var touched = areaKeys.filter(function (a) { return done.some(function (q) { return q.area === a; }); }).length;
    var count = function (f) { return c.quests.filter(function (q) { var r = rec(q); return r && r.at && f(r); }).length; };
    single("first", "👣", "First Steps", "Complete your first quest here", done.length, 1);
    single("ten", "🔟", "Warm-up", "Complete 10 quests here", done.length, Math.min(10, c.quests.length));
    single("half", "🧭", "Halfway There", "Complete half of all quests here", done.length, Math.ceil(c.quests.length / 2));
    single("everywhere", "🗺️", "All Corners", "Complete a quest in every area", touched, areaKeys.length);
    single("fullday", "⚡", "Packed Day", "Complete 3 quests in one day", bestDay, 3);
    single("season", "🍂", "Season Hunter", "Complete 3 seasonal quests", done.filter(function (q) { return q.months; }).length, 3);
    single("diary", "📓", "Diary Keeper", "Write notes on 5 quests", count(function (r) { return r.note; }), 5);
    single("photog", "📸", "Photographer", "Add photos to 5 quests", count(function (r) { return r.photos; }), 5);
    single("boots", "📍", "Boots on the Ground", "Check in on the spot 5 times", count(function (r) { return r.v; }), 5);
    single("trail", "🥾", "Trailblazer", "Finish a trail here", (trailsByCity[c.id] || []).filter(trailDone).length, 1);
    single("all", "👑", c.levels[c.levels.length - 1], "Complete every quest here", done.length, c.quests.length);
    return out;
  }
  function badgeXp(b) {
    if (b.max === 1) return b.tier * SPECIAL_XP;
    var x = 0;
    for (var t = 0; t < b.tier; t++) x += TIERS[t].xp;
    return x;
  }
  function earnedKeys(list) {
    var keys = {};
    list.forEach(function (b) { for (var t = 1; t <= b.tier; t++) keys[b.id + ":" + t] = true; });
    return keys;
  }
  function tierLabel(b) { return !b.tier ? "Locked" : b.max === 1 ? "Unlocked" : TIERS[b.tier - 1].label; }

  // ── Trails: short walks through nearby quests, built from the quest data ──
  var trails = [], trailsByCity = {}, trailById = {}, TRAIL_XP = 200;
  (function buildTrails() {
    Object.keys(cities).forEach(function (id) {
      var c = cities[id], list = [];
      Object.keys(c.areas).forEach(function (a) {
        if (a === "cevre") return;
        var qs = c.quests.filter(function (q) { return q.area === a && ll(q); });
        if (qs.length < 4) return;
        var cx = 0, cy = 0;
        qs.forEach(function (q) { cx += ll(q)[0] / qs.length; cy += ll(q)[1] / qs.length; });
        var picked = [qs.slice().sort(function (x, y) { return km(ll(x), [cx, cy]) - km(ll(y), [cx, cy]); })[0]];
        while (picked.length < 5) {
          var last = picked[picked.length - 1], best = null, bd = 1.2;
          qs.forEach(function (q) {
            if (picked.indexOf(q) !== -1) return;
            var d = km(ll(last), ll(q));
            if (d < bd) { bd = d; best = q; }
          });
          if (!best) break;
          picked.push(best);
        }
        if (picked.length >= 4) list.push({ id: id + ":walk:" + a, cid: id, icon: "footprints", name: c.areas[a] + " walk", quests: picked });
      });
      var ctr = cityCenter(c), food = c.quests.filter(function (q) { return q.cat === "ye" && q.area !== "cevre" && ll(q); })
        .sort(function (x, y) { return km(ll(x), [ctr[1], ctr[0]]) - km(ll(y), [ctr[1], ctr[0]]); }).slice(0, 4);
      if (food.length === 4) list.push({ id: id + ":taste", cid: id, icon: "utensils", name: "Taste of " + c.name, quests: food });
      list.forEach(function (t) {
        t.km = 0;
        for (var i = 1; i < t.quests.length; i++) t.km += km(ll(t.quests[i - 1]), ll(t.quests[i]));
        trailById[t.id] = t;
      });
      trailsByCity[id] = list;
      trails = trails.concat(list);
    });
  })();
  function trailDone(t) { return t.quests.every(isDone); }
  function trailStats(t) { return stats(t.quests); }

  // ── Explorer profile ───────────────────────────────────────
  var CLASSES = {
    scholar: { name: "Scholar", icon: "🏛️", desc: "+25% XP on See quests", cat: "gor" },
    gourmand: { name: "Gourmand", icon: "🍴", desc: "+25% XP on Eat & drink quests", cat: "ye" },
    daredevil: { name: "Daredevil", icon: "✨", desc: "+25% XP on Do quests", cat: "dene" },
    nomad: { name: "Nomad", icon: "🧭", desc: "+25% XP on day trips outside the city", far: true }
  };
  // Things you unlock by levelling up. `value` is what gets equipped.
  var UNLOCKS = [
    { type: "avatar", value: "🎒", level: 1 }, { type: "avatar", value: "🚲", level: 1 },
    { type: "avatar", value: "🌷", level: 1 }, { type: "avatar", value: "🧭", level: 1 },
    { type: "avatar", value: "🧀", level: 3 }, { type: "avatar", value: "🦉", level: 5 },
    { type: "avatar", value: "🦊", level: 8 }, { type: "avatar", value: "🦁", level: 12 },
    { type: "avatar", value: "🐉", level: 20 }, { type: "avatar", value: "👑", level: 30 },
    { type: "avatar", value: "🦄", level: 40 },
    { type: "frame", value: "none", name: "Simple", level: 1 }, { type: "frame", value: "bronze", name: "Bronze", level: 4 },
    { type: "frame", value: "silver", name: "Silver", level: 10 }, { type: "frame", value: "gold", name: "Gold", level: 18 },
    { type: "frame", value: "aurora", name: "Aurora", level: 28 }, { type: "frame", value: "legend", name: "Legend", level: 45 },
    { type: "accent", value: "mint", name: "Mint", color: "#0e9f6e", level: 1 }, { type: "accent", value: "ocean", name: "Ocean", color: "#0284c7", level: 3 },
    { type: "accent", value: "sunset", name: "Sunset", color: "#ea580c", level: 7 }, { type: "accent", value: "berry", name: "Berry", color: "#db2777", level: 12 },
    { type: "accent", value: "royal", name: "Royal", color: "#7c3aed", level: 18 }, { type: "accent", value: "gilded", name: "Gilded", color: "#b45309", level: 25 }
  ];
  function profile() {
    var p = store.profile || {};
    return { name: p.name || "", avatar: p.avatar || "🎒", cls: p.cls || "", frame: p.frame || "none",
      accent: p.accent || "mint", title: p.title || "", home: p.home || "" };
  }
  function unlockLabel(u) {
    return u.type === "avatar" ? u.value + " avatar" : u.type === "frame" ? u.name + " frame" : u.name + " colour";
  }

  // ── Quest of the day ───────────────────────────────────────
  // The same quest all day: picked from your home region by the date, skipping ones you finished earlier.
  function dailyQuest() {
    var home = cities[profile().home] || city;
    var pool = home.quests.filter(function (q) { return inSeason(q) && q.area !== "cevre"; });
    if (!pool.length) pool = home.quests;
    var seed = 0, s = dayKey() + home.id;
    for (var i = 0; i < s.length; i++) seed = (seed * 31 + s.charCodeAt(i)) >>> 0;
    for (var n = 0; n < pool.length; n++) {
      var q = pool[(seed + n) % pool.length], r = rec(q);
      if (!r || !r.at || r.d === dayKey()) return q;
    }
    return null;
  }

  // ── RPG progression ────────────────────────────────────────
  // One hero across all regions. XP comes from quests (with bonuses), badges and trails; levels follow a curve.
  var XP = { quest: 100, seasonal: 50, far: 50, area: 50, region: 150, journal: 25, photo: 25, checkin: 50, daily: 50 };
  var TITLES = [[1, "Wanderer"], [3, "Explorer"], [6, "Pathfinder"], [10, "Trailblazer"], [15, "Navigator"],
    [20, "Cartographer"], [30, "Voyager"], [40, "Lorekeeper"], [55, "Legend"], [75, "Mythic Explorer"]];
  var ATTRS = [
    { key: "gor", name: "Curiosity", icon: "landmark", desc: "Grows with every sight you see" },
    { key: "ye", name: "Appetite", icon: "utensils", desc: "Grows with every taste you try" },
    { key: "dene", name: "Courage", icon: "sparkles", desc: "Grows with every experience" },
    { key: "far", name: "Wanderlust", icon: "navigation", desc: "Grows with every trip beyond the city" }
  ];
  function xpForLevel(L) { return L <= 1 ? 0 : Math.round((120 * Math.pow(L - 1, 1.6)) / 10) * 10; }
  function levelInfo(xp) {
    var L = 1;
    while (L < 99 && xpForLevel(L + 1) <= xp) L++;
    var t = TITLES[0];
    TITLES.forEach(function (x) { if (L >= x[0]) t = x; });
    var lo = xpForLevel(L), hi = xpForLevel(L + 1);
    return { level: L, title: t[1], into: xp - lo, need: hi - lo, pct: Math.min(100, Math.round(((xp - lo) / (hi - lo)) * 100)) };
  }
  function attrInfo(x) {
    var L = 1 + Math.floor(Math.sqrt(x / 60)), lo = 60 * (L - 1) * (L - 1), hi = 60 * L * L;
    return { level: L, pct: Math.round(((x - lo) / (hi - lo)) * 100) };
  }
  function weekOf(t) { return Math.floor((t / 86400000 + 3) / 7); } // weeks start on Monday (UTC)
  // Replays every completion in time order, so bonuses depend on what you had done before.
  // With `previewKey`, that quest is added as if completed now (used to show the reward in advance).
  function progress(previewKey) {
    var log = [], cls = CLASSES[profile().cls];
    Object.keys(store.done).forEach(function (k) {
      var r = store.done[k];
      if (r && r.at && byKey[k]) log.push({ q: byKey[k], at: r.at, note: !!r.note, photos: r.photos || 0, v: r.v, d: r.d });
    });
    if (previewKey && byKey[previewKey] && !isDone(byKey[previewKey])) {
      var dq = dailyQuest();
      log.push({ q: byKey[previewKey], at: Date.now(), preview: true, d: dq && dq.key === previewKey });
    }
    log.sort(function (a, b) { return a.at - b.at; });
    var seenArea = {}, seenRegion = {}, weeks = {}, attr = { gor: 0, ye: 0, dene: 0, far: 0 }, xp = 0, gains = [];
    log.forEach(function (e) {
      var q = e.q, parts = [["Quest", XP.quest]];
      if (q.months) parts.push(["Seasonal", XP.seasonal]);
      if (q.area === "cevre") parts.push(["Day trip", XP.far]);
      if (!seenRegion[q.cid]) { seenRegion[q.cid] = 1; parts.push(["New region", XP.region]); }
      var ak = q.cid + "/" + q.area;
      if (!seenArea[ak]) { seenArea[ak] = 1; parts.push(["New area", XP.area]); }
      if (e.d) parts.push(["Quest of the day", XP.daily]);
      if (e.v) parts.push(["Checked in", XP.checkin]);
      if (e.note) parts.push(["Journal", XP.journal]);
      if (e.photos) parts.push(["Snapshot", XP.photo]);
      var sum = parts.reduce(function (s, p) { return s + p[1]; }, 0);
      if (cls && (cls.cat ? q.cat === cls.cat : q.area === "cevre")) {
        var cb = Math.round(sum * 0.25);
        parts.push([cls.name + " class", cb]); sum += cb;
      }
      var w = weekOf(e.at), streak = 1;
      weeks[w] = 1;
      while (weeks[w - streak]) streak++;
      if (streak > 1) {
        var bonus = Math.round(sum * Math.min(0.5, 0.1 * (streak - 1)));
        parts.push([streak + "-week streak", bonus]); sum += bonus;
      }
      xp += sum; attr[q.cat] += sum;
      if (q.area === "cevre") attr.far += sum;
      gains.push({ q: q, at: e.at, xp: sum, parts: parts, preview: !!e.preview });
    });
    var bxp = 0, earned = 0;
    Object.keys(cities).forEach(function (id) {
      badges(cities[id]).forEach(function (b) { bxp += badgeXp(b); earned += b.tier; });
    });
    var tdone = trails.filter(trailDone).length;
    var now = weekOf(Date.now()), streakNow = 0, start = weeks[now] ? now : weeks[now - 1] ? now - 1 : null;
    if (start !== null) { streakNow = 1; while (weeks[start - streakNow]) streakNow++; }
    var total = xp + bxp + tdone * TRAIL_XP, info = levelInfo(total);
    info.xp = total; info.badgeXp = bxp; info.badges = earned; info.attr = attr; info.gains = gains; info.trails = tdone;
    info.streak = streakNow; info.thisWeek = !!weeks[now];
    info.regions = Object.keys(seenRegion).length; info.areas = Object.keys(seenArea).length;
    info.quests = log.filter(function (e) { return !e.preview; }).length;
    return info;
  }
  function heroTitle(p) {
    var pr = profile();
    return pr.title && TITLES.some(function (t) { return t[1] === pr.title && p.level >= t[0]; }) ? pr.title : p.title;
  }

  // ── Region switching ───────────────────────────────────────
  // The current region changes while you pan the map; the map itself never reloads.
  function setCurrent(id) {
    if (!cities[id]) return;
    if (id !== cityId) {
      cityId = id; city = cities[id];
      store.city = id; save();
      ui.area = "all";
    }
    render();
  }
  function setCity(id, fly) {
    if (!cities[id]) return;
    setCurrent(id);
    if (fly) flyToRegion();
  }

  // ── Map ────────────────────────────────────────────────────
  var $map = document.getElementById("map");
  var map = null, mapState = "idle", mapReady = false, mePos = null, badgeCache = {}, pinIcons = null;
  var REGIONS = window.REGIONS || {};
  var PAD = { top: 150, bottom: 110, left: 30, right: 30 };

  function parseColor(s) {
    s = s.trim();
    var m, a = 1;
    if ((m = /^#([0-9a-f]{3,8})$/i.exec(s))) {
      var h = m[1];
      if (h.length < 6) h = h.split("").map(function (c) { return c + c; }).join("");
      if (h.length === 8) a = parseInt(h.slice(6, 8), 16) / 255;
      return { rgb: [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)], a: a };
    }
    if ((m = /^rgba?\(([^)]+)\)$/i.exec(s))) {
      var p = m[1].split(/[ ,\/]+/).filter(Boolean).map(parseFloat);
      return { rgb: [p[0], p[1], p[2]], a: p.length > 3 ? p[3] : 1 };
    }
    if ((m = /^hsla?\(([^)]+)\)$/i.exec(s))) {
      var q = m[1].split(/[ ,\/]+/).filter(Boolean).map(parseFloat);
      return { rgb: hslToRgb(q[0], q[1] / 100, q[2] / 100), a: q.length > 3 ? q[3] : 1 };
    }
    return null;
  }
  function hslToRgb(h, s, l) {
    h = (((h % 360) + 360) % 360) / 360;
    if (s === 0) { var g = Math.round(l * 255); return [g, g, g]; }
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    function hue(t) {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p;
    }
    return [Math.round(hue(h + 1 / 3) * 255), Math.round(hue(h) * 255), Math.round(hue(h - 1 / 3) * 255)];
  }
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, h = 0, s = 0;
    if (mx !== mn) {
      var d = mx - mn;
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h *= 60;
    }
    return [h, s, l];
  }
  // Dark map = the light "positron" style with every colour's lightness flipped.
  function darkColor(str, plain) {
    var c = parseColor(str);
    if (!c) return str;
    var hsl = rgbToHsl(c.rgb[0], c.rgb[1], c.rgb[2]), l = 1 - hsl[2];
    if (!plain) l = 0.13 + l * 0.5;
    var rgb = hslToRgb(hsl[0], Math.min(hsl[1], 0.5), l);
    return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + c.a + ")";
  }
  function darkenValue(v, plain) {
    if (typeof v === "string") return darkColor(v, plain);
    if (Array.isArray(v)) return v.map(function (x) { return darkenValue(x, plain); });
    if (v && typeof v === "object") {
      var o = {};
      Object.keys(v).forEach(function (k) { o[k] = darkenValue(v[k], plain); });
      return o;
    }
    return v;
  }
  var styleCache = {};
  function loadStyle(t) {
    if (styleCache[t]) return Promise.resolve(JSON.parse(styleCache[t]));
    return fetch(t === "dark" ? STYLE_DARK : STYLE_LIGHT).then(function (r) { return r.json(); }).then(function (style) {
      style.layers.forEach(function (l) {
        // Our pins replace the basemap's own points of interest, and we draw our own country names with flags.
        if (/^poi|^housenumber/.test(l.id) || (l.type === "symbol" && /country/.test(l.id))) { l.layout = l.layout || {}; l.layout.visibility = "none"; }
        if (t === "dark" && l.paint) {
          Object.keys(l.paint).forEach(function (k) {
            if (/color$/.test(k)) l.paint[k] = darkenValue(l.paint[k], /^(text|icon)/.test(k) || k === "text-halo-color");
          });
        }
      });
      styleCache[t] = JSON.stringify(style);
      return style;
    });
  }

  // Pin artwork: the interface icons drawn onto round markers.
  function svgImage(name, color, size) {
    return new Promise(function (res) {
      var img = new Image(size, size);
      img.onload = function () { res(img); };
      img.onerror = function () { res(null); };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="' + color +
        '" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || "") + '</svg>');
    });
  }
  function loadPinIcons() {
    if (pinIcons) return Promise.resolve();
    var jobs = Object.keys(CATS).map(function (c) { return svgImage(CATS[c].icon, CATS[c].color, 44).then(function (i) { return [c, i]; }); });
    jobs.push(svgImage("check", "#ffffff", 48).then(function (i) { return ["check", i]; }));
    return Promise.all(jobs).then(function (list) { pinIcons = {}; list.forEach(function (x) { pinIcons[x[0]] = x[1]; }); });
  }
  function pinImage(cat, mode) {
    var S = 88, c = document.createElement("canvas"), color = CATS[cat].color;
    c.width = c.height = S;
    var g = c.getContext("2d");
    g.globalAlpha = mode === "off" ? 0.55 : 1;
    g.shadowColor = "rgba(15,23,42,.35)"; g.shadowBlur = 8; g.shadowOffsetY = 3;
    g.beginPath(); g.arc(S / 2, S / 2 - 2, 32, 0, 7);
    g.fillStyle = mode === "done" ? color : "#ffffff"; g.fill();
    g.shadowColor = "transparent";
    g.lineWidth = 7; g.strokeStyle = color; g.stroke();
    var img = pinIcons && pinIcons[mode === "done" ? "check" : cat];
    if (img) { var w = mode === "done" ? 44 : 40; g.drawImage(img, (S - w) / 2, (S - w) / 2 - 2, w, w); }
    return g.getImageData(0, 0, S, S);
  }
  function badgeImage(color, pct, cur) {
    var S = 112, c = document.createElement("canvas");
    c.width = c.height = S;
    var g = c.getContext("2d"), m = S / 2, r = 36;
    g.shadowColor = "rgba(15,23,42,.38)"; g.shadowBlur = 10; g.shadowOffsetY = 3;
    g.beginPath(); g.arc(m, m, r + 9, 0, 7); g.fillStyle = pct >= 100 ? "#f59e0b" : cur ? color : "#ffffff"; g.fill();
    g.shadowColor = "transparent";
    g.beginPath(); g.arc(m, m, r + 2, 0, 7); g.fillStyle = "#ffffff"; g.fill();
    g.lineWidth = 9; g.strokeStyle = "#e5e7eb";
    g.beginPath(); g.arc(m, m, r - 6, 0, 7); g.stroke();
    if (pct > 0) {
      g.strokeStyle = color; g.lineCap = "round";
      g.beginPath(); g.arc(m, m, r - 6, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * Math.max(pct, 3)) / 100); g.stroke();
    }
    g.fillStyle = "#0f172a"; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = "800 22px system-ui, -apple-system, 'Segoe UI', sans-serif";
    g.fillText(pct + "%", m, m + 1);
    return g.getImageData(0, 0, S, S);
  }
  // Tricolours: stripe direction, then the three colours.
  var FLAGS = { NL: ["h", "#AE1C28", "#FFFFFF", "#21468B"], BE: ["v", "#111111", "#FDDA24", "#EF3340"],
    DE: ["h", "#000000", "#DD0000", "#FFCE00"], LU: ["h", "#EF3340", "#FFFFFF", "#00A3E0"] };
  function flagImage(cc) {
    var W = 76, H = 52, c = document.createElement("canvas");
    c.width = W; c.height = H;
    var g = c.getContext("2d"), x = 4, y = 4, w = W - 8, h = H - 8;
    g.shadowColor = "rgba(15,23,42,.35)"; g.shadowBlur = 6; g.shadowOffsetY = 2;
    g.fillStyle = "#fff"; g.fillRect(x - 2, y - 2, w + 4, h + 4);
    g.shadowColor = "transparent";
    var f = FLAGS[cc] || FLAGS.NL, vertical = f[0] === "v";
    f.slice(1).forEach(function (col, i) {
      g.fillStyle = col;
      if (vertical) g.fillRect(x + (w / 3) * i, y, w / 3 + 1, h); else g.fillRect(x, y + (h / 3) * i, w, h / 3 + 1);
    });
    return g.getImageData(0, 0, W, H);
  }

  // Completion colour: unexplored regions sit under grey "fog"; the more you complete, the more vivid their colour.
  function mixHex(a, b, t) {
    var x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16), out = "#";
    [16, 8, 0].forEach(function (sh) {
      var v = Math.round(((x >> sh) & 255) * (1 - t) + ((y >> sh) & 255) * t);
      out += (v < 16 ? "0" : "") + v.toString(16);
    });
    return out;
  }
  function regionPaint(color, pct) {
    if (!pct) return { fill: "#94a3b8", fop: 0.2 };
    var k = Math.pow(pct / 100, 0.7);
    return { fill: mixHex("#e2e8f0", color, 0.35 + 0.65 * k), fop: 0.24 + 0.4 * k };
  }
  function fc(features) { return { type: "FeatureCollection", features: features }; }
  function point(p, props) { return { type: "Feature", properties: props || {}, geometry: { type: "Point", coordinates: [p[1], p[0]] } }; }
  // Regions are lists of polygons; a polygon is a list of rings (outer first), a ring is [[lat, lng], ...].
  // Regions without quests yet ("coming soon") are drawn in quiet grey.
  var SOON = window.REGION_INFO || {};
  function isSoon(id) { return !cities[id] && !!SOON[id]; }
  function regionsGeo() {
    var feats = [];
    Object.keys(REGIONS).forEach(function (id) {
      var props;
      if (cities[id]) {
        var s = cityStats(id), rp = regionPaint(cities[id].color, s.pct);
        props = { id: id, color: cities[id].color, pct: s.pct, full: s.pct >= 100 ? 1 : 0, fill: rp.fill, fop: rp.fop, soon: 0 };
      } else if (isSoon(id)) {
        props = { id: id, color: "#94a3b8", pct: 0, full: 0, fill: "#cbd5e1", fop: 0.14, soon: 1 };
      } else return;
      REGIONS[id].forEach(function (poly) {
        feats.push({ type: "Feature", geometry: { type: "Polygon", coordinates: poly.map(function (ring) {
          var pts = ring.map(function (p) { return [p[1], p[0]]; });
          pts.push(pts[0]);
          return pts;
        }) }, properties: props });
      });
    });
    return fc(feats);
  }
  function soonPoints() {
    return fc(Object.keys(SOON).filter(isSoon).map(function (id) {
      return point(SOON[id].at, { id: id, name: SOON[id].name });
    }));
  }
  function countriesGeo(points) {
    var C = window.COUNTRIES || {}, feats = [];
    Object.keys(C).forEach(function (cc) {
      if (points) feats.push(point(C[cc].label, { cc: cc, name: C[cc].name.toUpperCase() }));
      else C[cc].outline.forEach(function (ring) {
        feats.push({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: ring.map(function (p) { return [p[1], p[0]]; }) } });
      });
    });
    return fc(feats);
  }
  function badgePoints() {
    return fc(Object.keys(cities).map(function (id) {
      var st = cityStats(id), c = cityCenter(cities[id]);
      return point([c[1], c[0]], { id: id, name: cities[id].name, count: st.done + " / " + st.total, img: "rb-" + id + (id === cityId ? "-cur" : "") });
    }));
  }
  function questsGeo() {
    var feats = [];
    allQuests.forEach(function (q) {
      var p = ll(q);
      if (!p) return;
      if (ui.cat !== "all" && q.cat !== ui.cat) return;
      if (ui.area !== "all" && (q.cid !== cityId || q.area !== ui.area)) return;
      var done = isDone(q);
      feats.push(point(p, { key: q.key, done: done ? 1 : 0, title: q.title, icon: "pin-" + q.cat + (done ? "-done" : inSeason(q) ? "" : "-off") }));
    });
    return fc(feats);
  }
  function trailGeo() {
    var t = ui.trail && trailById[ui.trail];
    if (!t) return fc([]);
    return fc([{ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: t.quests.map(function (q) { return [ll(q)[1], ll(q)[0]]; }) } }]);
  }
  function accent() { return getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#0e9f6e"; }

  function setupOverlays() {
    Object.keys(CATS).forEach(function (c) {
      [["", "normal"], ["-done", "done"], ["-off", "off"]].forEach(function (m) {
        var id = "pin-" + c + m[0];
        if (map.hasImage(id)) map.removeImage(id);
        map.addImage(id, pinImage(c, m[1]), { pixelRatio: 2 });
      });
    });
    Object.keys(window.COUNTRIES || {}).forEach(function (cc) {
      if (map.hasImage("flag-" + cc)) map.removeImage("flag-" + cc);
      map.addImage("flag-" + cc, flagImage(cc), { pixelRatio: 2 });
    });
    var first;
    map.getStyle().layers.some(function (l) { if (l.type === "symbol") { first = l.id; return true; } });
    var ac = accent(), dark = theme() === "dark", txt = dark ? "#f1f5f9" : "#0f172a", halo = dark ? "#171c26" : "#ffffff";
    var zw = function (a, b) { return ["interpolate", ["linear"], ["zoom"], 6, a, 12, b]; };
    var round = { "line-join": "round" };
    badgeCache = {};

    map.addSource("regions", { type: "geojson", data: regionsGeo() });
    map.addLayer({ id: "region-fill", type: "fill", source: "regions", paint: { "fill-color": ["get", "fill"],
      "fill-opacity": ["interpolate", ["linear"], ["zoom"], 6, ["get", "fop"], 9.5, ["get", "fop"], 11.5, ["*", ["get", "fop"], 0.2], 13, 0.02] } }, first);
    map.addLayer({ id: "region-hover", type: "fill", source: "regions", filter: ["==", ["get", "id"], ""],
      paint: { "fill-color": ["get", "color"], "fill-opacity": 0.3 } }, first);
    map.addLayer({ id: "region-casing", type: "line", source: "regions", layout: round,
      paint: { "line-color": "#ffffff", "line-opacity": 0.9, "line-blur": 0.6, "line-width": zw(3.5, 7) } }, first);
    map.addLayer({ id: "region-line", type: "line", source: "regions", layout: round,
      paint: { "line-color": ["get", "color"], "line-opacity": ["case", [">", ["get", "pct"], 0], 1, 0.55], "line-width": zw(1.8, 3) } }, first);
    map.addLayer({ id: "region-gold", type: "line", source: "regions", filter: ["==", ["get", "full"], 1], layout: round,
      paint: { "line-color": "#f59e0b", "line-blur": 0.5, "line-width": zw(4, 7) } }, first);
    map.addLayer({ id: "region-cur", type: "line", source: "regions", layout: round, filter: ["==", ["get", "id"], cityId],
      paint: { "line-color": ["get", "color"], "line-width": zw(3.4, 5.5) } }, first);
    map.addSource("countries", { type: "geojson", data: countriesGeo(false) });
    map.addLayer({ id: "country-casing", type: "line", source: "countries", layout: round,
      paint: { "line-color": "#ffffff", "line-opacity": 0.95, "line-width": zw(6, 10) } }, first);
    map.addLayer({ id: "country-line", type: "line", source: "countries", layout: round,
      paint: { "line-color": "#1e293b", "line-opacity": 0.85, "line-dasharray": [3, 1.6], "line-width": zw(2.4, 3.6) } }, first);

    map.addSource("trail", { type: "geojson", data: trailGeo() });
    map.addLayer({ id: "trail-casing", type: "line", source: "trail", layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "#ffffff", "line-width": 8, "line-opacity": 0.9 } });
    map.addLayer({ id: "trail-line", type: "line", source: "trail", layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": ac, "line-width": 4, "line-dasharray": [0.2, 1.8] } });

    map.addSource("quests", { type: "geojson", data: questsGeo(), cluster: true, clusterMaxZoom: 13, clusterRadius: 46 });
    map.addLayer({ id: "done-glow", type: "circle", source: "quests", minzoom: 9,
      filter: ["all", ["!", ["has", "point_count"]], ["==", ["get", "done"], 1]],
      paint: { "circle-color": ac, "circle-opacity": 0.22, "circle-radius": ["interpolate", ["exponential", 2], ["zoom"], 9, 1.7, 18, 874] } });
    map.addLayer({ id: "clusters", type: "circle", source: "quests", minzoom: 9, filter: ["has", "point_count"], paint: {
      "circle-color": ac, "circle-opacity": 0.96, "circle-stroke-color": "#ffffff", "circle-stroke-width": 3,
      "circle-radius": ["step", ["get", "point_count"], 17, 8, 21, 25, 26, 60, 31] } });
    map.addLayer({ id: "cluster-count", type: "symbol", source: "quests", minzoom: 9, filter: ["has", "point_count"],
      layout: { "text-field": ["get", "point_count_abbreviated"], "text-font": ["Noto Sans Bold"], "text-size": 13, "text-allow-overlap": true },
      paint: { "text-color": "#ffffff" } });
    map.addLayer({ id: "pins", type: "symbol", source: "quests", minzoom: 9, filter: ["!", ["has", "point_count"]], layout: {
      "icon-image": ["get", "icon"], "icon-allow-overlap": true, "icon-ignore-placement": true,
      "icon-size": ["interpolate", ["linear"], ["zoom"], 9, 0.62, 14, 0.9, 17, 1.05] } });
    map.addLayer({ id: "pin-labels", type: "symbol", source: "quests", minzoom: 14.6, filter: ["!", ["has", "point_count"]], layout: {
      "text-field": ["get", "title"], "text-font": ["Noto Sans Bold"], "text-size": 12, "text-max-width": 9,
      "text-anchor": "top", "text-offset": [0, 1.35], "text-optional": true },
      paint: { "text-color": txt, "text-halo-color": halo, "text-halo-width": 2 } });

    map.addSource("sel", { type: "geojson", data: fc([]) });
    map.addLayer({ id: "sel-ring", type: "circle", source: "sel", paint: {
      "circle-radius": 30, "circle-color": ac, "circle-opacity": 0.12, "circle-stroke-color": ac, "circle-stroke-width": 3 } });
    map.addSource("country-points", { type: "geojson", data: countriesGeo(true) });
    map.addLayer({ id: "country-labels", type: "symbol", source: "country-points", maxzoom: 8.8, layout: {
      "icon-image": ["concat", "flag-", ["get", "cc"]], "icon-anchor": "bottom", "icon-allow-overlap": true,
      "text-field": ["get", "name"], "text-font": ["Noto Sans Bold"], "text-size": 14, "text-letter-spacing": 0.18,
      "text-anchor": "top", "text-offset": [0, 0.3], "text-allow-overlap": true },
      paint: { "text-color": "#1e293b", "text-halo-color": "#ffffff", "text-halo-width": 2.6 } });
    map.addSource("soon-points", { type: "geojson", data: soonPoints() });
    map.addLayer({ id: "soon-labels", type: "symbol", source: "soon-points", minzoom: 6.3, maxzoom: OVERVIEW_ZOOM, layout: {
      "text-field": ["format", ["get", "name"], {}, "\n", {}, "Coming soon", { "font-scale": 0.8 }],
      "text-font": ["Noto Sans Bold"], "text-size": 12, "text-line-height": 1.15, "text-padding": 6 },
      paint: { "text-color": dark ? "#94a3b8" : "#64748b", "text-halo-color": halo, "text-halo-width": 2 } });
    map.addSource("region-points", { type: "geojson", data: badgePoints() });
    map.addLayer({ id: "region-badges", type: "symbol", source: "region-points", maxzoom: OVERVIEW_ZOOM, layout: {
      "icon-image": ["get", "img"], "icon-allow-overlap": true, "icon-ignore-placement": true,
      "text-field": ["format", ["get", "name"], {}, "\n", {}, ["get", "count"], { "font-scale": 0.85, "text-color": "#475569" }],
      "text-font": ["Noto Sans Bold"], "text-size": 13, "text-anchor": "top", "text-offset": [0, 2.3], "text-line-height": 1.15,
      "text-allow-overlap": true, "text-ignore-placement": true },
      paint: { "text-color": "#0f172a", "text-halo-color": "#ffffff", "text-halo-width": 2.4 } });
    map.addSource("me", { type: "geojson", data: fc(mePos ? [point([mePos[1], mePos[0]])] : []) });
    map.addLayer({ id: "me-halo", type: "circle", source: "me", paint: { "circle-radius": 22, "circle-color": "#2f7df6", "circle-opacity": 0.2 } });
    map.addLayer({ id: "me-dot", type: "circle", source: "me", paint: {
      "circle-radius": 8, "circle-color": "#2f7df6", "circle-stroke-color": "#ffffff", "circle-stroke-width": 3.5 } });
    map.addSource("pulse", { type: "geojson", data: fc([]) });
    map.addLayer({ id: "pulse", type: "circle", source: "pulse", paint: { "circle-radius": 12, "circle-color": ac, "circle-opacity": 0 } });
    mapReady = true;
    setMapState("ready");
    refreshMap();
    onZoom();
  }
  // Region bubbles are drawn by the map itself (not page elements), so they stay put however the map is tilted.
  function refreshRegionBadges() {
    Object.keys(cities).forEach(function (id) {
      var pct = cityStats(id).pct;
      [false, true].forEach(function (cur) {
        var key = "rb-" + id + (cur ? "-cur" : ""), sig = pct + ":" + cities[id].color;
        if (badgeCache[key] === sig) return;
        var img = badgeImage(cities[id].color, pct, cur);
        if (map.hasImage(key)) map.updateImage(key, img); else map.addImage(key, img, { pixelRatio: 2 });
        badgeCache[key] = sig;
      });
    });
    setSrc("region-points", badgePoints());
  }
  function setMapState(s) {
    if (mapState === s) return;
    mapState = s;
    var el = document.getElementById("mapstate");
    if (el) el.outerHTML = mapStateHtml();
  }
  function mapStateHtml() {
    if (mapState === "ready") return '<div id="mapstate" hidden></div>';
    if (mapState === "failed") {
      return '<div id="mapstate" class="mapstate"><div class="ms-card">' + ic("cloud") + '<b>The map could not load</b>' +
        '<span>Check your internet connection. Your quests and progress still work in the Quests tab.</span>' +
        '<button class="btn" data-act="map-retry">Try again</button></div></div>';
    }
    return '<div id="mapstate" class="mapstate"><div class="ms-load"><i></i>Loading the map…</div></div>';
  }
  function ensureMap() {
    if (map || mapState !== "idle") return;
    if (!window.maplibregl) { setMapState("failed"); return; }
    setMapState("loading");
    var slow = setTimeout(function () { if (!mapReady) setMapState("failed"); }, 20000);
    Promise.all([loadStyle(theme()), loadPinIcons()]).then(function (res) {
      map = new maplibregl.Map({
        container: $map, style: res[0], attributionControl: false, maxPitch: 65, minZoom: 5.5, maxZoom: 19,
        bounds: [[city.bounds[0][1], city.bounds[0][0]], [city.bounds[1][1], city.bounds[1][0]]], fitBoundsOptions: { padding: PAD }
      });
      map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
      map.on("load", function () { clearTimeout(slow); setupOverlays(); });
      map.on("zoom", onZoom);
      map.on("moveend", onMove);
      map.on("click", onMapClick);
      map.on("mousemove", onMapHover);
    }).catch(function () { clearTimeout(slow); setMapState("failed"); });
  }
  function retryMap() {
    if (map && !mapReady) { try { map.remove(); } catch (e) { /* ignore */ } map = null; }
    mapState = "idle";
    ensureMap();
  }
  function onZoom() {
    if (!map) return;
    document.body.classList.toggle("zoomed", map.getZoom() >= 11);
  }
  function inRing(ring, lng, lat) {
    var inside = false;
    for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      var yi = ring[i][0], xi = ring[i][1], yj = ring[j][0], xj = ring[j][1];
      if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function regionAt(lng, lat) {
    var found = null;
    Object.keys(REGIONS).some(function (id) {
      var hit = REGIONS[id].some(function (poly) {
        if (!inRing(poly[0], lng, lat)) return false;
        for (var h = 1; h < poly.length; h++) if (inRing(poly[h], lng, lat)) return false;
        return true;
      });
      if (hit) found = id;
      return hit;
    });
    return found && cities[found] ? found : null;
  }
  function onMove() {
    if (ui.tab !== "map" || !mapReady) return;
    // Panning into another region switches to it (not while a quest card is open).
    if (map.getZoom() >= OVERVIEW_ZOOM && !ui.open) {
      var c = map.getCenter(), id = regionAt(c.lng, c.lat);
      if (id && id !== cityId) setCurrent(id);
    }
  }
  function onMapClick(e) {
    if (!mapReady) return;
    var badge = map.queryRenderedFeatures(e.point, { layers: ["region-badges"] })[0];
    if (badge) { setCity(badge.properties.id, true); return; }
    var hit = map.queryRenderedFeatures(e.point, { layers: ["pins", "clusters"] })[0];
    if (hit && hit.layer.id === "pins") { var q = byKey[hit.properties.key]; if (q) openQuest(q); return; }
    if (hit) {
      map.getSource("quests").getClusterExpansionZoom(hit.properties.cluster_id).then(function (z) {
        map.easeTo({ center: hit.geometry.coordinates, zoom: Math.min(z + 0.2, 17) });
      });
      return;
    }
    if (map.getZoom() < OVERVIEW_ZOOM) {
      var r = map.queryRenderedFeatures(e.point, { layers: ["region-fill"] })[0];
      if (r && r.properties.soon) { toast(SOON[r.properties.id].name + ": quests coming soon"); return; }
      if (r) { setCity(r.properties.id, true); return; }
    }
    if (ui.open) closeSheet();
  }
  function onMapHover(e) {
    if (!mapReady) return;
    var onPin = map.queryRenderedFeatures(e.point, { layers: ["pins", "clusters", "region-badges"] }).length > 0;
    var r = !onPin && map.getZoom() < OVERVIEW_ZOOM ? map.queryRenderedFeatures(e.point, { layers: ["region-fill"] })[0] : null;
    map.getCanvas().style.cursor = onPin || r ? "pointer" : "";
    map.setFilter("region-hover", ["==", ["get", "id"], r && !r.properties.soon ? r.properties.id : ""]);
  }
  function refreshMap() {
    if (!mapReady) return;
    setSrc("quests", questsGeo());
    setSrc("regions", regionsGeo());
    setSrc("trail", trailGeo());
    map.setFilter("region-cur", ["==", ["get", "id"], cityId]);
    refreshRegionBadges();
  }
  // Only resize when the map container just became visible; resizing fires move events.
  function updateMap(resize) {
    ensureMap();
    if (!map) return;
    if (resize) map.resize();
    refreshMap();
  }
  function setSrc(id, data) { var s = map && map.getSource(id); if (s) s.setData(data); }
  function setSelected(q) {
    if (!mapReady) return;
    var p = q && ll(q);
    setSrc("sel", fc(p ? [point(p)] : []));
  }
  function focusQuest(q) {
    var p = ll(q);
    if (!map || !p) return;
    map.easeTo({ center: [p[1], p[0]], zoom: Math.max(map.getZoom(), 15.5), offset: [0, -Math.round(window.innerHeight * 0.17)], duration: 800 });
  }
  function fitPoints(pts, maxZoom) {
    if (!map || !pts.length) return;
    var b = new maplibregl.LngLatBounds();
    pts.forEach(function (p) { b.extend([p[1], p[0]]); });
    map.fitBounds(b, { padding: { top: 170, bottom: 150, left: 50, right: 50 }, duration: 900, maxZoom: maxZoom || 15.5 });
  }
  function flyToRegion() {
    if (!map) return;
    var b = city.bounds;
    map.fitBounds([[b[0][1], b[0][0]], [b[1][1], b[1][0]]], { padding: PAD, duration: 1000, maxZoom: 15 });
  }
  function flyToArea() {
    if (ui.area === "all") flyToRegion();
    else fitPoints(inArea(ui.area).map(ll).filter(Boolean));
  }
  function showOverview() {
    if (!map) return;
    var b = new maplibregl.LngLatBounds();
    Object.keys(cities).forEach(function (id) { b.extend(cityCenter(cities[id])); });
    map.fitBounds(b, { padding: { top: 140, bottom: 120, left: 40, right: 40 }, duration: 1000, maxZoom: OVERVIEW_ZOOM - 0.6, pitch: 0, bearing: 0 });
  }
  function toggleTilt() {
    if (!map) return;
    var flat = map.getPitch() < 5;
    map.easeTo({ pitch: flat ? 58 : 0, bearing: flat ? map.getBearing() : 0, zoom: flat ? Math.max(map.getZoom(), 15) : map.getZoom(), duration: 800 });
  }
  // Asks the device where you are. Resolves with [lat, lng].
  function whereAmI() {
    return new Promise(function (res, rej) {
      if (!navigator.geolocation) { rej(new Error("unsupported")); return; }
      navigator.geolocation.getCurrentPosition(function (pos) {
        mePos = [pos.coords.longitude, pos.coords.latitude];
        ui.pos = [pos.coords.latitude, pos.coords.longitude];
        if (mapReady) setSrc("me", fc([point(ui.pos)]));
        res(ui.pos);
      }, rej, { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 });
    });
  }
  function locate() {
    toast("Finding you…");
    whereAmI().then(function (p) {
      if (map) map.flyTo({ center: [p[1], p[0]], zoom: Math.max(map.getZoom(), 15), duration: 1200 });
    }, function () { toast("Could not get your location. Check the location permission."); });
  }
  function switchTheme() {
    applyTheme();
    if (!map || !mapReady) return;
    mapReady = false;
    loadStyle(theme()).then(function (style) {
      map.once("style.load", setupOverlays);
      map.setStyle(style, { diff: false });
    });
  }
  function applyAccent() {
    document.documentElement.setAttribute("data-accent", profile().accent);
    if (!mapReady) return;
    var ac = accent();
    [["clusters", "circle-color"], ["done-glow", "circle-color"], ["sel-ring", "circle-color"], ["sel-ring", "circle-stroke-color"],
      ["pulse", "circle-color"], ["trail-line", "line-color"]].forEach(function (x) { map.setPaintProperty(x[0], x[1], ac); });
  }
  // A ripple on the map where a quest was just completed.
  function pulseAt(q) {
    var p = q && ll(q);
    if (!mapReady || !p || reducedMotion()) return;
    setSrc("pulse", fc([point(p)]));
    var t0 = performance.now(), dur = 1400;
    (function f(t) {
      if (!mapReady || !map.getLayer("pulse")) return;
      var k = ((t - t0) % (dur / 2)) / (dur / 2);
      map.setPaintProperty("pulse", "circle-radius", 12 + 70 * k);
      map.setPaintProperty("pulse", "circle-opacity", t - t0 < dur ? 0.5 * (1 - k) : 0);
      if (t - t0 < dur) requestAnimationFrame(f);
    })(t0);
  }

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
  var CC = { Netherlands: "nl", Belgium: "be", Germany: "de", Luxembourg: "lu" };

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
  function renderMapUI() {
    var s = stats(city.quests), p = progress(), pr = profile(), dq = dailyQuest();
    var todo = dq && !isDone(dq);
    return '<div class="map-top">' +
      '<div class="topcard glass">' +
        '<button class="plain" data-tab="hero" aria-label="Your hero, level ' + p.level + '">' + avatarHtml(pr, p) + '</button>' +
        '<div class="grow"><button class="tc-city" data-act="regions">' + flagHtml(city.country) + esc(city.name) + ' ' + ic("chevron-down", "sm") + '</button>' +
        '<div class="tc-sub">' + esc(heroTitle(p)) + ' · ' + fmt(p.into) + ' / ' + fmt(p.need) + ' XP' +
          (p.streak ? ' · <span class="fire">' + ic("flame", "sm") + p.streak + '</span>' : "") + '</div>' + bar(p.pct, "xp") + '</div>' +
        ring(s.pct) + '</div>' +
      '<div class="chips">' + catChips() + '</div>' +
      '<div class="chips area-row">' + areaChips() + '</div>' +
      '</div>' + mapStateHtml() +
      '<div class="mapctl">' +
        '<button class="glass desk" data-act="zoom-in" aria-label="Zoom in">' + ic("plus") + '</button>' +
        '<button class="glass desk" data-act="zoom-out" aria-label="Zoom out">' + ic("minus") + '</button>' +
        '<button class="glass" data-act="locate" aria-label="My location">' + ic("locate-fixed") + '</button>' +
        '<button class="glass" data-act="tilt" aria-label="Tilt the map">' + ic("box") + '</button>' +
        '<button class="glass" data-act="overview" aria-label="All regions">' + ic("globe") + '</button>' +
        '<button class="glass" data-act="suggest" aria-label="Surprise me">' + ic("dices") + '</button>' +
      '</div>' +
      (todo
        ? '<button class="fab" data-open="' + esc(dq.key) + '">' + ic("star") + '<span><small>Quest of the day · +' + XP.daily + ' XP</small>' + esc(dq.title) + '</span></button>'
        : '<button class="fab done" data-act="suggest">' + ic("check") + '<span><small>Quest of the day done</small>Surprise me with another</span></button>');
  }

  // ── Quests screen ──────────────────────────────────────────
  function questRow(q, o) {
    o = o || {};
    var c = cities[q.cid], r = rec(q) || {}, ph = photoOf(q), done = isDone(q), bits = [];
    if (o.region) bits.push(esc(c.name));
    bits.push(esc(c.areas[q.area]));
    if (o.dist !== undefined) bits.push(kmText(o.dist));
    if (q.months) bits.push(inSeason(q) ? "In season" : "Season: " + seasonText(q));
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
    return Object.keys(city.areas).map(function (a) {
      var part = list.filter(function (q) { return q.area === a; });
      if (!part.length) return "";
      var s = stats(inArea(a));
      return '<div class="ghead"><b>' + esc(city.areas[a]) + '</b><span>' + s.done + ' / ' + s.total + '</span></div>' + part.map(function (q) { return questRow(q); }).join("");
    }).join("");
  }
  function trailCard(t) {
    var s = trailStats(t);
    return '<button class="card trail' + (s.done === s.total ? " done" : "") + '" data-trail="' + esc(t.id) + '">' +
      '<span class="tile acc">' + ic(t.icon) + '</span><div class="body"><div class="t">' + esc(t.name) + '</div>' +
      '<div class="m">' + t.quests.length + ' stops · ' + kmText(t.km) + ' · ' + (s.done === s.total ? "Complete" : s.done + " / " + s.total + " done") + '</div>' + bar(s.pct) + '</div>' +
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
      return soon[n] ? '<div class="rsoon">' + ic("calendar", "sm") + soon[n] + ' more ' + (soon[n] === 1 ? "region" : "regions") + ' coming soon</div>' : "";
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
      '<h2>Backup</h2><div class="panel"><button class="btn ghost" data-act="export">' + ic("copy") + 'Copy progress to clipboard</button>' +
        '<button class="btn ghost" data-act="import">' + ic("download") + 'Restore from backup</button>' +
        '<p class="note">The backup text holds your progress and profile, not your photos. Signing in backs up everything.</p></div>' +
      '<h2>About</h2><div class="panel"><a class="btn ghost" target="_blank" rel="noopener" href="' + REPO + '/issues/new?title=' +
        encodeURIComponent("Feedback: ") + '">' + ic("triangle-alert") + 'Report a problem or idea</a>' +
        '<p class="note">Map data © OpenStreetMap contributors, tiles by OpenFreeMap. Quest photos from Wikimedia Commons under free licences, credited on each quest. Icons by Lucide.</p></div></div>';
  }

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
      (first ? '<p class="note center" style="margin-top:-6px">Rediscover where you live, one quest at a time. Earn XP, level up and unlock new looks.</p>' : "") +
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
