(function () {
  "use strict";

  var APP_VERSION = "0.19.1";
  var STORE_KEY = "citydiscovery.v1";
  var REPO = "https://github.com/oalpcakir/citydiscovery";
  var CATS = {
    gor: { label: "See", icon: "landmark", color: "#2f7cf6" },
    ye: { label: "Eat & drink", icon: "utensils", color: "#f97316" },
    dene: { label: "Do", icon: "sparkles", color: "#9b5cf6" }
  };
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var STYLE_LIGHT = "https://tiles.openfreemap.org/styles/liberty";
  var STYLE_DARK = "https://tiles.openfreemap.org/styles/positron"; // lightness-inverted at load time
  var FALLBACK_COLORS = ["#f43f5e", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#14b8a6", "#ec4899"];
  var OVERVIEW_ZOOM = 9.5; // below this the map shows whole regions instead of pins
  var ICONS = window.ICONS || {};
  var PHOTOS = window.PHOTOS || {};

  // ── Persistent state ───────────────────────────────────────
  // { city, theme, sound, profile, saved: { key: ±ms }, done: { "<region>/<quest>": { at, note, photos, v, d, u } },
  //   kept: { "<region>:<badge>": tier }, bonus: xp }  (kept and bonus: see "Earned stays earned" below)
  var store = load();
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(STORE_KEY));
      if (s && typeof s === "object" && s.done) return s;
    } catch (e) { /* corrupt data: start fresh */ }
    return { city: null, done: {} };
  }
  function save() {
    snapshotEarned();
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
  // Days until a seasonal quest's current season ends (its run of consecutive months), or null when it has no season now.
  function seasonDaysLeft(q) {
    if (!q.months || q.months.length >= 12 || !inSeason(q)) return null;
    var now = new Date(), y = now.getFullYear(), m = now.getMonth(); // m: 0-11
    for (var i = 0; i < 11 && q.months.indexOf(((m + 1) % 12) + 1) !== -1; i++) { m++; if (m > 11) { m = 0; y++; } }
    var end = new Date(y, m + 1, 1); // the first day after the season
    return Math.max(1, Math.ceil((end - now) / 86400000));
  }
  function leftText(d) { return d <= 1 ? "Last day" : d <= 7 ? "Last " + d + " days" : d + " days left"; }
  // Seasonal quests you can do right now, the ones ending soonest first.
  function seasonalNow(list) {
    return list.filter(function (q) { return seasonDaysLeft(q) !== null && !isDone(q); })
      .sort(function (a, b) { return seasonDaysLeft(a) - seasonDaysLeft(b); });
  }
  function ll(q) { var c = cities[q.cid]; return c.coords && c.coords[q.id]; }
  function photoOf(q) { return PHOTOS[q.key] || null; }
  // Wikimedia only serves thumbnails in standard widths; ask for the smallest one at least w wide.
  var THUMB_SIZES = [120, 250, 330, 500, 960];
  function thumb(url, w) {
    var s = THUMB_SIZES.filter(function (x) { return x >= w; })[0] || 960;
    return url.replace(/\/\d+px-/, "/" + s + "px-");
  }
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
    if (m) m.setAttribute("content", theme() === "dark" ? "#141c21" : "#f4f7f5");
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
      tier = Math.max(tier, keptTier(c.id, id));
      out.push({ id: id, group: group, icon: meta.icon, name: meta.name, desc: what, tier: tier, max: 3,
        have: s.done, goal: tier < 3 ? goals[tier] : s.total });
    }
    function single(id, icon, name, desc, have, goal) {
      var got = have >= goal || keptTier(c.id, id) > 0;
      out.push({ id: id, group: "Special", icon: icon, name: name, desc: desc, tier: got ? 1 : 0, max: 1,
        have: got ? goal : Math.min(have, goal), goal: goal });
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
  // ── Earned stays earned ──
  // Badge tiers depend on how many quests a region has, and quests get added or retired. So that an update never takes
  // a badge or XP away: while the quest list is unchanged we remember what you have (store.earned, store.xpLast); when
  // the app starts with a changed quest list, those become a floor (store.kept for badges, store.bonus for XP).
  function keptTier(cid, id) { return (store.kept && store.kept[cid + ":" + id]) || 0; }
  function contentSig() {
    var s = 0, str = Object.keys(cities).map(function (id) { return id + cities[id].quests.length; }).join(",");
    for (var i = 0; i < str.length; i++) s = (s * 31 + str.charCodeAt(i)) >>> 0;
    return String(s);
  }
  var snapshotting = false;
  function snapshotEarned() {
    if (snapshotting || typeof progress !== "function") return;
    snapshotting = true;
    try {
      var earned = {};
      Object.keys(cities).forEach(function (id) {
        badges(cities[id]).forEach(function (b) { if (b.tier) earned[id + ":" + b.id] = b.tier; });
      });
      store.earned = earned; store.sig = contentSig();
      store.xpLast = progress().xp - (store.bonus || 0);
    } finally { snapshotting = false; }
  }
  function keepEarned() { // run once at start
    if (store.sig && store.sig !== contentSig()) {
      store.kept = store.kept || {};
      Object.keys(store.earned || {}).forEach(function (k) { store.kept[k] = Math.max(store.kept[k] || 0, store.earned[k]); });
      var now = progress().xp - (store.bonus || 0);
      if (store.xpLast > now) store.bonus = (store.bonus || 0) + (store.xpLast - now);
    }
    snapshotEarned();
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { /* ignore */ }
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

  // ── Trails: themed walks through nearby quests, built from the quest data ──
  // Each region gets a highlights walk per city area, a food crawl, a rainy-day walk and "day out" walks for towns
  // in its surroundings. Stops are put in walking order; distances are straight lines times 1.3 (streets are not straight),
  // and the time adds about 15 minutes per stop.
  // tools/build_routes.py repeats this trail-building logic in Python to precompute the street paths: keep the two in step,
  // or changed trails fall back to asking the router live.
  var trails = [], trailsByCity = {}, trailById = {}, TRAIL_XP = 200;
  var TRAIL_COLORS = ["#e11d48", "#2563eb", "#16a34a", "#d97706", "#7c3aed", "#0891b2", "#db2777", "#65a30d"];
  function routeKm(list) {
    var t = 0;
    for (var i = 1; i < list.length; i++) t += km(ll(list[i - 1]), ll(list[i]));
    return t;
  }
  // Best short route through a pool: nearest-neighbour from several starts, then 2-opt to untangle it.
  function bestRoute(pool, minStops, maxStops, maxKm) {
    pool = pool.filter(ll);
    if (pool.length < minStops) return null;
    var best = null;
    pool.slice(0, 24).forEach(function (start) {
      var route = [start], total = 0;
      while (route.length < maxStops) {
        var last = route[route.length - 1], pick = null, pd = Infinity;
        pool.forEach(function (q) {
          if (route.indexOf(q) !== -1) return;
          var d = km(ll(last), ll(q));
          if (d < pd) { pd = d; pick = q; }
        });
        if (!pick || total + pd > maxKm) break;
        route.push(pick); total += pd;
      }
      if (route.length < minStops) return;
      var cats = {}; route.forEach(function (q) { cats[q.cat] = 1; });
      var score = route.length * 10 + Object.keys(cats).length * 3 - total;
      if (!best || score > best.score) best = { score: score, route: route };
    });
    if (!best) return null;
    var r = best.route.slice(), improved = true;
    while (improved) {
      improved = false;
      for (var i = 1; i < r.length - 1; i++) {
        for (var j = i + 1; j < r.length; j++) {
          var cand = r.slice(0, i).concat(r.slice(i, j + 1).reverse(), r.slice(j + 1));
          if (routeKm(cand) < routeKm(r) - 0.01) { r = cand; improved = true; }
        }
      }
    }
    return r;
  }
  // The town a group of surrounding quests is in: the most common last word of their map names ("Burg Satzvey Mechernich").
  function townOf(list) {
    var count = {};
    list.forEach(function (q) {
      var w = (q.q || "").trim().split(/\s+/).pop();
      if (w && /^[A-ZÀ-Ý]/.test(w)) count[w] = (count[w] || 0) + 1;
    });
    var top = Object.keys(count).sort(function (a, b) { return count[b] - count[a]; })[0];
    return top && count[top] >= 2 ? top : null;
  }
  (function buildTrails() {
    Object.keys(cities).forEach(function (id) {
      // Seasonal quests (events, markets) stay out: a trail should work on any day.
      var c = cities[id], list = [], inCity = c.quests.filter(function (q) { return q.area !== "cevre" && ll(q) && !q.months; });
      var add = function (key, icon, name, sub, route) {
        if (!route) return;
        if (list.some(function (t) { return t.quests.filter(function (q) { return route.indexOf(q) !== -1; }).length > route.length / 2; })) return; // mostly a repeat
        list.push({ id: id + ":" + key, cid: id, icon: icon, name: name, sub: sub, quests: route });
      };
      Object.keys(c.areas).forEach(function (a) {
        if (a === "cevre") return;
        var pool = inCity.filter(function (q) { return q.area === a && q.cat !== "ye"; });
        add("walk:" + a, "footprints", c.areas[a] + " highlights", "The best sights and things to do in " + c.areas[a] + ", on foot", bestRoute(pool, 4, 7, 3.2));
      });
      add("taste", "utensils", "Taste of " + c.name, "A food and drink crawl: local dishes, snacks and drinks",
        bestRoute(inCity.filter(function (q) { return q.cat === "ye"; }), 4, 6, 3.5));
      add("rain", "cloud", "Rainy day in " + c.name, "Indoor stops for a grey day",
        bestRoute(inCity.filter(function (q) { return (q.tags || []).indexOf("rainy day") !== -1; }), 3, 5, 4));
      // Day outs: towns in the surroundings with three or more quests close together
      var rest = c.quests.filter(function (q) { return q.area === "cevre" && ll(q) && !q.months; }), groups = [];
      rest.forEach(function (q) {
        var g = groups.filter(function (g) { return g.some(function (x) { return km(ll(x), ll(q)) < 2.5; }); })[0];
        if (g) g.push(q); else groups.push([q]);
      });
      groups.filter(function (g) { return g.length >= 3; }).sort(function (a, b) { return b.length - a.length; }).slice(0, 4).forEach(function (g, i) {
        var town = townOf(g);
        add("day:" + i, "map", town ? town + " day out" : "Day out: " + g[0].title, "A day trip: " + g.length + " quests close together" + (town ? " in and around " + town : ""), bestRoute(g, 3, 6, 6));
      });
      list.forEach(function (t, i) {
        t.km = routeKm(t.quests) * 1.3;
        t.mins = Math.round(((t.km / 4.5) * 60 + t.quests.length * 15) / 15) * 15; // walking plus about 15 minutes per stop
        t.color = TRAIL_COLORS[i % TRAIL_COLORS.length];
        trailById[t.id] = t;
      });
      trailsByCity[id] = list;
      trails = trails.concat(list);
    });
  })();
  function trailDone(t) { return t.quests.every(isDone); }
  function trailStats(t) { return stats(t.quests); }
  function trailNext(t) { return t.quests.filter(function (q) { return !isDone(q); })[0] || null; }
  // Walking distance along streets once the route is known; until then an estimate, marked with "≈".
  function trailKmText(t) { return (t.routed ? "" : "≈ ") + kmText(t.km) + " walk"; }
  function trailTime(t) { return t.mins >= 60 ? Math.floor(t.mins / 60) + " h" + (t.mins % 60 ? " " + (t.mins % 60) + " min" : "") : Math.max(10, t.mins) + " min"; }

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
      accent: p.accent || "mint", title: p.title || "", home: p.home || "", noStats: !!p.noStats };
  }
  function unlockLabel(u) {
    return u.type === "avatar" ? u.value + " avatar" : u.type === "frame" ? u.name + " frame" : u.name + " colour";
  }

  // ── Quest of the day ───────────────────────────────────────
  // The same quest all day: picked from your home region by the date, skipping ones you finished earlier.
  // A seasonal quest whose season ends within three weeks gets priority, so it is not missed.
  function dailyQuest() {
    var home = cities[profile().home] || city;
    var seed = 0, s = dayKey() + home.id;
    for (var i = 0; i < s.length; i++) seed = (seed * 31 + s.charCodeAt(i)) >>> 0;
    // (done today still counts, so the quest of the day stays the same after you finish it)
    var ending = home.quests.filter(function (q) {
      var d = seasonDaysLeft(q), r = rec(q);
      return d !== null && d <= 21 && (!r || !r.at || r.d === dayKey());
    }).sort(function (a, b) { return a.id < b.id ? -1 : 1; });
    if (ending.length) return ending[seed % ending.length];
    var pool = home.quests.filter(function (q) { return inSeason(q) && q.area !== "cevre"; });
    if (!pool.length) pool = home.quests;
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
    var total = xp + bxp + tdone * TRAIL_XP + (store.bonus || 0), info = levelInfo(total);
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

