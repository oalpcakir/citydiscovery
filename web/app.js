// Built by tools/build.py from src/*.js. Edit the parts in src/, not this file.
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
  var allQuests = [], byKey = {}, dishByKey = {};
  Object.keys(cities).forEach(function (id, i) {
    cities[id].color = (window.REGION_COLORS && window.REGION_COLORS[id]) || FALLBACK_COLORS[i % FALLBACK_COLORS.length];
    cities[id].quests.forEach(function (q) {
      q.cid = id; q.key = id + "/" + q.id;
      allQuests.push(q); byKey[q.key] = q;
    });
    // Must-eat dishes (web/dishes.js): eaten anywhere in the region, ticked off like a quest under "<id>/dish:<dish id>".
    cities[id].dishes = ((window.DISHES || {})[id] || []).map(function (d) {
      d.cid = id; d.key = id + "/dish:" + d.id; dishByKey[d.key] = d;
      return d;
    });
  });
  function dishEaten(d) { var r = store.done[d.key]; return !!(r && r.at); }

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
    if (c.dishes && c.dishes.length) {
      single("palate", "🍽️", "Local Palate", "Eat all " + c.dishes.length + " must-eat dishes", c.dishes.filter(dishEaten).length, c.dishes.length);
    }
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
  // `fits(route, q)`, when given, says whether q may join the route (used to keep a taste trail eatable).
  function bestRoute(pool, minStops, maxStops, maxKm, fits) {
    pool = pool.filter(ll);
    if (pool.length < minStops) return null;
    var best = null;
    pool.slice(0, 24).forEach(function (start) {
      var route = [start], total = 0;
      while (route.length < maxStops) {
        var last = route[route.length - 1], pick = null, pd = Infinity;
        pool.forEach(function (q) {
          if (route.indexOf(q) !== -1 || (fits && !fits(route, q))) return;
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
  // A taste trail has to be eatable in one afternoon: one proper meal, one drink, one sweet, one coffee, two snacks.
  // `kind` is set on eat & drink quests by tools/food_kinds.py.
  var TASTE_MAX = { meal: 1, drink: 1, sweet: 1, coffee: 1, snack: 2 };
  function tasteFits(route, q) {
    var k = q.kind || "meal";
    return route.filter(function (x) { return (x.kind || "meal") === k; }).length < (TASTE_MAX[k] || 1);
  }
  function tasteSub(route) {
    var n = {}, parts = [];
    route.forEach(function (q) { var k = q.kind || "meal"; n[k] = (n[k] || 0) + 1; });
    if (n.coffee) parts.push("coffee");
    if (n.snack) parts.push(n.snack > 1 ? "two snacks" : "a snack");
    if (n.sweet) parts.push("something sweet");
    if (n.meal) parts.push("one proper meal");
    if (n.drink) parts.push("a local drink");
    var last = parts.pop();
    return "An eating walk: " + (parts.length ? parts.join(", ") + " and " + last : last);
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
      var taste = bestRoute(inCity.filter(function (q) { return q.cat === "ye"; }), 4, 6, 3.5, tasteFits);
      if (taste) add("taste", "utensils", "Taste of " + c.name, tasteSub(taste), taste);
      add("rain", "cloud", "Rainy day in " + c.name, "Indoor stops for a grey day",
        bestRoute(inCity.filter(function (q) { return (q.tags || []).indexOf("rainy day") !== -1; }), 3, 5, 4));
      // Day outs: towns in the surroundings with three or more quests close together
      var rest = c.quests.filter(function (q) { return q.area === "cevre" && ll(q) && !q.months; }), groups = [];
      rest.forEach(function (q) {
        var g = groups.filter(function (g) { return g.some(function (x) { return km(ll(x), ll(q)) < 2.5; }); })[0];
        if (g) g.push(q); else groups.push([q]);
      });
      groups.filter(function (g) { return g.length >= 3; }).sort(function (a, b) { return b.length - a.length; }).slice(0, 4).forEach(function (g, i) {
        // A hand-picked name (trailNames in the region file, keyed by any quest of the group) beats a guessed town.
        var named = g.map(function (q) { return (c.trailNames || {})[q.id]; }).filter(Boolean)[0], town = townOf(g);
        var name = named || (town ? town + " day out" : "Day out: " + g[0].title);
        add("day:" + i, "map", name, "A day trip from " + c.name + ": " + g.length + " quests close together", bestRoute(g, 3, 6, 6));
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
    // Avatar and frame go into HTML as they are, so only accept safe values (a pasted backup can hold anything).
    var safe = function (v, re, d) { return typeof v === "string" && re.test(v) ? v : d; };
    return { name: p.name || "", avatar: safe(p.avatar, /^[^<>&"'\s]{1,12}$/, "🎒"), cls: p.cls || "", frame: safe(p.frame, /^[a-z]{1,20}$/, "none"),
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
  var XP = { quest: 100, seasonal: 50, far: 50, area: 50, region: 150, journal: 25, photo: 25, checkin: 50, daily: 50, dish: 50 };
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
      if (e.d) parts.push(["Today's adventure", XP.daily]);
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
    var dishes = Object.keys(store.done).filter(function (k) { return dishByKey[k] && store.done[k].at; }).length;
    xp += dishes * XP.dish; attr.ye += dishes * XP.dish;
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
    info.quests = log.filter(function (e) { return !e.preview; }).length; info.dishes = dishes;
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
    g.lineWidth = 9; g.strokeStyle = mixHex("#ffffff", color, 0.3);
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
  // Tricolours: stripe direction, then the three colours. "x": a Nordic cross: field and cross colour, then where the
  // upright starts and how wide it is (share of the width), and the same for the bar (share of the height).
  var FLAGS = { NL: ["h", "#AE1C28", "#FFFFFF", "#21468B"], BE: ["v", "#111111", "#FDDA24", "#EF3340"],
    DE: ["h", "#000000", "#DD0000", "#FFCE00"], LU: ["h", "#EF3340", "#FFFFFF", "#00A3E0"], FR: ["v", "#002395", "#FFFFFF", "#ED2939"],
    DK: ["x", "#C8102E", "#FFFFFF", 12 / 37, 4 / 37, 12 / 28, 4 / 28], SE: ["x", "#006AA7", "#FECC00", 5 / 16, 2 / 16, 4 / 10, 2 / 10],
    CH: ["ch", "#DA291C"], TR: ["tr", "#E30A17"] };
  function flagImage(cc) {
    var W = 76, H = 52, c = document.createElement("canvas");
    c.width = W; c.height = H;
    var g = c.getContext("2d"), x = 4, y = 4, w = W - 8, h = H - 8;
    g.shadowColor = "rgba(15,23,42,.35)"; g.shadowBlur = 6; g.shadowOffsetY = 2;
    g.fillStyle = "#fff"; g.fillRect(x - 2, y - 2, w + 4, h + 4);
    g.shadowColor = "transparent";
    var f = FLAGS[cc] || FLAGS.NL, vertical = f[0] === "v";
    if (f[0] === "ch") { // red field, white Greek cross
      var a = h * 0.2, l = h * 0.64, cx = x + w / 2, cy = y + h / 2;
      g.fillStyle = f[1]; g.fillRect(x, y, w, h);
      g.fillStyle = "#FFFFFF"; g.fillRect(cx - a / 2, cy - l / 2, a, l); g.fillRect(cx - l / 2, cy - a / 2, l, a);
      return g.getImageData(0, 0, W, H);
    }
    if (f[0] === "tr") { // red field, white crescent and star
      var my = y + h / 2, R1 = h * 0.25, R2 = h * 0.2, sr = h * 0.125, sx = x + w * 0.53;
      g.fillStyle = f[1]; g.fillRect(x, y, w, h);
      g.fillStyle = "#FFFFFF"; g.beginPath(); g.arc(x + w * 0.36, my, R1, 0, 2 * Math.PI); g.fill();
      g.fillStyle = f[1]; g.beginPath(); g.arc(x + w * 0.36 + R1 * 0.25, my, R2, 0, 2 * Math.PI); g.fill();
      g.fillStyle = "#FFFFFF"; g.beginPath();
      for (var k = 0; k < 10; k++) {
        var ang = Math.PI + k * Math.PI / 5, rr = k % 2 ? sr * 0.38 : sr;
        g.lineTo(sx + rr * Math.cos(ang), my + rr * Math.sin(ang));
      }
      g.closePath(); g.fill();
      return g.getImageData(0, 0, W, H);
    }
    if (f[0] === "x") {
      g.fillStyle = f[1]; g.fillRect(x, y, w, h);
      g.fillStyle = f[2]; g.fillRect(x + w * f[3], y, w * f[4], h); g.fillRect(x, y + h * f[5], w, h * f[6]);
      return g.getImageData(0, 0, W, H);
    }
    f.slice(1).forEach(function (col, i) {
      g.fillStyle = col;
      if (vertical) g.fillRect(x + (w / 3) * i, y, w / 3 + 1, h); else g.fillRect(x, y + (h / 3) * i, w, h / 3 + 1);
    });
    return g.getImageData(0, 0, W, H);
  }

  // Completion colour: unexplored regions show a light tint of their own colour; the more you complete, the more vivid it gets.
  function mixHex(a, b, t) {
    var x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16), out = "#";
    [16, 8, 0].forEach(function (sh) {
      var v = Math.round(((x >> sh) & 255) * (1 - t) + ((y >> sh) & 255) * t);
      out += (v < 16 ? "0" : "") + v.toString(16);
    });
    return out;
  }
  function regionPaint(color, pct) {
    var k = Math.pow((pct || 0) / 100, 0.7);
    return { fill: mixHex("#e2e8f0", color, 0.55 + 0.45 * k), fop: 0.22 + 0.4 * k };
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
      return point([c[1], c[0]], { id: id, name: cities[id].name, count: st.done + " / " + st.total, img: "rb-" + id + (id === cityId ? "-cur" : ""),
        rank: (id === cityId ? 0 : 100000) - st.pct * 100 - st.total });
    }));
  }
  // Area names (Marais, Lund, Bornholm...) as quiet map labels, placed at the middle of each area's quests.
  // "cevre" (the surroundings) is spread out, and an area named like its region adds nothing, so neither gets a label.
  function areaLabelsGeo() {
    var groups = {};
    allQuests.forEach(function (q) {
      var c = cities[q.cid], p = ll(q);
      if (!p || q.area === "cevre" || !c.areas[q.area] || c.areas[q.area] === c.name) return;
      (groups[q.cid + "/" + q.area] = groups[q.cid + "/" + q.area] || { name: c.areas[q.area], lat: [], lng: [] });
      groups[q.cid + "/" + q.area].lat.push(p[0]); groups[q.cid + "/" + q.area].lng.push(p[1]);
    });
    var mid = function (a) { a.sort(function (x, y) { return x - y; }); return a[Math.floor(a.length / 2)]; };
    return fc(Object.keys(groups).filter(function (k) { return groups[k].lat.length >= 3; }).map(function (k) {
      var g = groups[k];
      return point([mid(g.lat), mid(g.lng)], { name: g.name });
    }));
  }
  // With an area picked, its quests stay bright and the rest of the region fades (dimmed=true) instead of vanishing.
  function selArea() { return ui.area !== "all" && city.areas[ui.area] ? ui.area : null; }
  function questsGeo(dimmed) {
    var feats = [], area = selArea();
    allQuests.forEach(function (q) {
      var p = ll(q);
      if (!p) return;
      if (ui.cat !== "all" && q.cat !== ui.cat) return;
      var inArea = !area || (q.cid === cityId && q.area === area);
      if (dimmed ? inArea || !area || q.cid !== cityId : !inArea) return;
      var done = isDone(q);
      if (ui.myMap && !done) return; // "My map": only the places you have done
      feats.push(point(p, { key: q.key, done: done ? 1 : 0, title: q.title, icon: "pin-" + q.cat + (done ? "-done" : inSeason(q) ? "" : "-off") }));
    });
    return fc(feats);
  }
  // A soft outline around the picked area's quests: each pin padded by ~250 m, then the convex hull of it all.
  // Areas are groups of quests, not official districts, so this stays a light dashed shape. Far outliers are left out.
  function areaHullGeo() {
    var area = selArea();
    if (!area) return fc([]);
    var pts = city.quests.filter(function (q) { return q.area === area && ll(q); }).map(ll);
    if (pts.length < 2) return fc([]);
    var mid = function (a) { a = a.slice().sort(function (x, y) { return x - y; }); return a[Math.floor(a.length / 2)]; };
    var c = [mid(pts.map(function (p) { return p[0]; })), mid(pts.map(function (p) { return p[1]; }))];
    var d = pts.map(function (p) { return km(c, p); }), lim = Math.max(3, 2.5 * mid(d));
    pts = pts.filter(function (p, i) { return d[i] <= lim; });
    var cloud = [], r = 0.25, kx = 1 / (111.32 * Math.cos((c[0] * Math.PI) / 180)), ky = 1 / 110.57;
    pts.forEach(function (p) {
      for (var i = 0; i < 12; i++) { var a = (i / 12) * 2 * Math.PI; cloud.push([p[1] + Math.cos(a) * r * kx, p[0] + Math.sin(a) * r * ky]); }
    });
    cloud.sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    var cross = function (o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }, lo = [], hi = [];
    cloud.forEach(function (p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); });
    cloud.slice().reverse().forEach(function (p) { while (hi.length >= 2 && cross(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); });
    var ring = lo.slice(0, -1).concat(hi.slice(0, -1));
    ring.push(ring[0]);
    var top = ring.reduce(function (m, p) { return p[1] > m[1] ? p : m; }, ring[0]);
    return fc([{ type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [ring] } },
      { type: "Feature", properties: { name: city.areas[area] }, geometry: { type: "Point", coordinates: [c[1], top[1]] } }]);
  }
  // ── Walking routes for trails ──
  // The real paths along streets are precomputed by tools/build_routes.py into routes.js (window.TRAIL_ROUTES).
  // A trail that is not in there (its stops changed since the last build) asks the OpenStreetMap foot router (FOSSGIS)
  // the first time it is shown, and only those routes are kept on this device. Until then it is drawn with straight lines.
  var ROUTE_KEY = "citydisco.routes.v1", BUILT = window.TRAIL_ROUTES || {}, localRoutes = {}, routePending = {};
  try {
    var saved = JSON.parse(localStorage.getItem(ROUTE_KEY) || "{}") || {};
    Object.keys(saved).forEach(function (k) { if (!BUILT[k]) localRoutes[k] = saved[k]; }); // drop what routes.js now has
  } catch (e) { /* ignore */ }
  var routes = Object.assign({}, localRoutes, BUILT);
  function routeSig(t) { return t.quests.map(function (q) { return ll(q)[0].toFixed(4) + "," + ll(q)[1].toFixed(4); }).join(";"); }
  function applyRoute(t) {
    var r = routes[routeSig(t)];
    if (!r) return false;
    t.route = r.c; t.km = r.km; t.routed = true;
    t.mins = Math.round((r.min + t.quests.length * 15) / 15) * 15;
    return true;
  }
  trails.forEach(applyRoute);
  function ensureRoute(t) {
    if (!t || t.routed || routePending[t.id]) return Promise.resolve();
    routePending[t.id] = true;
    var path = t.quests.map(function (q) { return ll(q)[1].toFixed(5) + "," + ll(q)[0].toFixed(5); }).join(";");
    return fetch("https://routing.openstreetmap.de/routed-foot/route/v1/driving/" + path + "?overview=full&geometries=geojson")
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var rt = d && d.code === "Ok" && d.routes && d.routes[0];
        if (!rt) return;
        routes[routeSig(t)] = localRoutes[routeSig(t)] = { c: rt.geometry.coordinates.map(function (p) { return [Math.round(p[0] * 1e5) / 1e5, Math.round(p[1] * 1e5) / 1e5]; }),
          km: Math.round(rt.distance / 100) / 10, min: Math.round(rt.duration / 60) };
        try { localStorage.setItem(ROUTE_KEY, JSON.stringify(localRoutes)); } catch (e) { /* storage full: keep it for this session */ }
        applyRoute(t);
        if (ui.tab === "map" && (ui.trail === t.id || ui.panel === "trails")) { refreshMap(); if ($sheet.hidden) render(); }
      })
      .catch(function () { /* offline or router busy: keep the straight lines */ });
  }
  function ensureRoutes(list) { // one at a time, to go easy on the free router
    list.reduce(function (p, t) { return p.then(function () { return ensureRoute(t); }); }, Promise.resolve());
  }
  function lineOf(t) { return { type: "LineString", coordinates: t.route || t.quests.map(function (q) { return [ll(q)[1], ll(q)[0]]; }) }; }
  // The trail you follow, drawn solid with numbered stops.
  function trailGeo() {
    var t = ui.trail && trailById[ui.trail];
    return fc(t ? [{ type: "Feature", properties: { color: t.color }, geometry: lineOf(t) }] : []);
  }
  function trailStopsGeo() {
    var t = ui.trail && trailById[ui.trail];
    return fc(t ? t.quests.map(function (q, i) { return point(ll(q), { n: String(i + 1), key: q.key, done: isDone(q) ? 1 : 0, color: t.color }); }) : []);
  }
  // While you pick a trail, every trail of the region is shown in its own colour.
  function trailsAllGeo() {
    if (ui.panel !== "trails" || ui.trail) return fc([]);
    return fc((trailsByCity[cityId] || []).map(function (t) { return { type: "Feature", properties: { id: t.id, color: t.color }, geometry: lineOf(t) }; }));
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
      paint: { "line-color": "#ffffff", "line-opacity": 0.9, "line-blur": 0.6, "line-width": zw(3, 7) } }, first);
    map.addLayer({ id: "region-line", type: "line", source: "regions", layout: round,
      paint: { "line-color": ["get", "color"], "line-opacity": ["case", [">", ["get", "pct"], 0], 1, 0.85], "line-width": zw(2.2, 3) } }, first);
    map.addLayer({ id: "region-gold", type: "line", source: "regions", filter: ["==", ["get", "full"], 1], layout: round,
      paint: { "line-color": "#f59e0b", "line-blur": 0.5, "line-width": zw(4, 7) } }, first);
    map.addLayer({ id: "region-cur", type: "line", source: "regions", layout: round, filter: ["==", ["get", "id"], cityId],
      paint: { "line-color": ["get", "color"], "line-width": zw(3.4, 5.5) } }, first);
    map.addSource("countries", { type: "geojson", data: countriesGeo(false) });
    map.addLayer({ id: "country-casing", type: "line", source: "countries", layout: round,
      paint: { "line-color": "#ffffff", "line-opacity": 0.95, "line-width": zw(6, 10) } }, first);
    map.addLayer({ id: "country-line", type: "line", source: "countries", layout: round,
      paint: { "line-color": "#1e293b", "line-opacity": 0.85, "line-dasharray": [3, 1.6], "line-width": zw(2.4, 3.6) } }, first);

    var rnd = { "line-join": "round", "line-cap": "round" };
    map.addSource("trails-all", { type: "geojson", data: trailsAllGeo() });
    map.addLayer({ id: "trails-all-casing", type: "line", source: "trails-all", layout: rnd, paint: { "line-color": "#ffffff", "line-width": 9, "line-opacity": 0.9 } });
    map.addLayer({ id: "trails-all-line", type: "line", source: "trails-all", layout: rnd, paint: { "line-color": ["get", "color"], "line-width": 5, "line-opacity": 0.9 } });
    map.addSource("trail", { type: "geojson", data: trailGeo() });
    map.addLayer({ id: "trail-casing", type: "line", source: "trail", layout: rnd, paint: { "line-color": "#ffffff", "line-width": 10, "line-opacity": 0.95 } });
    map.addLayer({ id: "trail-line", type: "line", source: "trail", layout: rnd, paint: { "line-color": ["get", "color"], "line-width": 6 } });

    // The picked area: soft fill and dashed edge, the rest of the region's pins faded underneath the bright ones.
    map.addSource("area-hull", { type: "geojson", data: areaHullGeo() });
    map.addLayer({ id: "area-hull-fill", type: "fill", source: "area-hull", filter: ["==", ["geometry-type"], "Polygon"],
      paint: { "fill-color": ac, "fill-opacity": dark ? 0.12 : 0.08 } });
    map.addLayer({ id: "area-hull-line", type: "line", source: "area-hull", filter: ["==", ["geometry-type"], "Polygon"], layout: round,
      paint: { "line-color": ac, "line-width": 2, "line-opacity": 0.75, "line-dasharray": [2, 2] } });
    map.addSource("quests-dim", { type: "geojson", data: questsGeo(true) });
    map.addLayer({ id: "pins-dim", type: "symbol", source: "quests-dim", minzoom: 9, layout: {
      "icon-image": ["get", "icon"], "icon-allow-overlap": true, "icon-ignore-placement": true,
      "icon-size": ["interpolate", ["linear"], ["zoom"], 9, 0.5, 14, 0.72, 17, 0.85] }, paint: { "icon-opacity": 0.3 } });
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
    // Area names sit beside the middle of their quests (where a cluster usually is), on whichever side is free.
    map.addSource("area-labels", { type: "geojson", data: areaLabelsGeo() });
    map.addLayer({ id: "area-labels", type: "symbol", source: "area-labels", minzoom: OVERVIEW_ZOOM, maxzoom: 14.6, layout: {
      "text-field": ["upcase", ["get", "name"]], "text-font": ["Noto Sans Bold"], "text-letter-spacing": 0.14, "text-max-width": 9,
      "text-size": ["interpolate", ["linear"], ["zoom"], 9.5, 11, 13, 13.5],
      "text-variable-anchor": ["top", "bottom", "left", "right"], "text-radial-offset": 2.4, "text-padding": 6 },
      paint: { "text-color": dark ? "#94a3b8" : "#64748b", "text-halo-color": halo, "text-halo-width": 2.2 } });
    map.addLayer({ id: "area-hull-label", type: "symbol", source: "area-hull", filter: ["==", ["geometry-type"], "Point"], layout: {
      "text-field": ["upcase", ["get", "name"]], "text-font": ["Noto Sans Bold"], "text-letter-spacing": 0.14, "text-size": 13.5,
      "text-anchor": "bottom", "text-offset": [0, -0.4], "text-allow-overlap": true },
      paint: { "text-color": ac, "text-halo-color": halo, "text-halo-width": 2.4 } });
    map.addLayer({ id: "pin-labels", type: "symbol", source: "quests", minzoom: 14.6, filter: ["!", ["has", "point_count"]], layout: {
      "text-field": ["get", "title"], "text-font": ["Noto Sans Bold"], "text-size": 12, "text-max-width": 9,
      "text-anchor": "top", "text-offset": [0, 1.35], "text-optional": true },
      paint: { "text-color": txt, "text-halo-color": halo, "text-halo-width": 2 } });

    map.addSource("trail-stops", { type: "geojson", data: trailStopsGeo() });
    map.addLayer({ id: "trail-stops", type: "circle", source: "trail-stops", paint: {
      "circle-radius": 13, "circle-color": ["case", ["==", ["get", "done"], 1], ["get", "color"], "#ffffff"],
      "circle-stroke-color": ["get", "color"], "circle-stroke-width": 3.5 } });
    map.addLayer({ id: "trail-stop-n", type: "symbol", source: "trail-stops", layout: {
      "text-field": ["get", "n"], "text-font": ["Noto Sans Bold"], "text-size": 13, "text-allow-overlap": true, "text-ignore-placement": true },
      paint: { "text-color": ["case", ["==", ["get", "done"], 1], "#ffffff", ["get", "color"]] } });
    map.addSource("sel", { type: "geojson", data: fc([]) });
    map.addLayer({ id: "sel-ring", type: "circle", source: "sel", paint: {
      "circle-radius": 30, "circle-color": ac, "circle-opacity": 0.12, "circle-stroke-color": ac, "circle-stroke-width": 3 } });
    map.addSource("country-points", { type: "geojson", data: countriesGeo(true) });
    map.addLayer({ id: "country-labels", type: "symbol", source: "country-points", maxzoom: 8.8, layout: {
      "icon-image": ["concat", "flag-", ["get", "cc"]], "icon-anchor": "bottom", "icon-padding": 4,
      "text-field": ["get", "name"], "text-font": ["Noto Sans Bold"], "text-size": 14, "text-letter-spacing": 0.18,
      "text-anchor": "top", "text-offset": [0, 0.3], "text-padding": 4 },
      paint: { "text-color": "#1e293b", "text-halo-color": "#ffffff", "text-halo-width": 2.6 } });
    map.addSource("soon-points", { type: "geojson", data: soonPoints() });
    map.addLayer({ id: "soon-labels", type: "symbol", source: "soon-points", minzoom: 6.3, maxzoom: OVERVIEW_ZOOM, layout: {
      "text-field": ["format", ["get", "name"], {}, "\n", {}, "Coming soon", { "font-scale": 0.8 }],
      "text-font": ["Noto Sans Bold"], "text-size": 12, "text-line-height": 1.15, "text-padding": 6 },
      paint: { "text-color": dark ? "#94a3b8" : "#64748b", "text-halo-color": halo, "text-halo-width": 2 } });
    map.addSource("region-points", { type: "geojson", data: badgePoints() });
    // Zoomed out, bubbles shrink and take turns: the current region first, then those with the most progress and quests.
    // A name that does not fit is left out rather than drawn over its neighbours.
    var zs = function (a, b, c) { return ["interpolate", ["linear"], ["zoom"], 5, a, 7.5, b, 9, c]; };
    map.addLayer({ id: "region-badges", type: "symbol", source: "region-points", maxzoom: OVERVIEW_ZOOM, layout: {
      "icon-image": ["get", "img"], "icon-size": zs(0.55, 0.78, 1), "icon-padding": 1,
      "symbol-sort-key": ["get", "rank"],
      "text-field": ["format", ["get", "name"], {}, "\n", {}, ["get", "count"], { "font-scale": 0.85, "text-color": "#475569" }],
      "text-font": ["Noto Sans Bold"], "text-size": zs(11, 12, 13), "text-anchor": "top",
      "text-offset": zs(["literal", [0, 1.45]], ["literal", [0, 1.85]], ["literal", [0, 2.3]]), "text-line-height": 1.15,
      "text-optional": true, "text-padding": 3 },
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
    // Give up after 20 s, but not while the page is in the background (browsers pause drawing there).
    var slow, giveUp = function () {
      if (mapReady) return;
      if (document.hidden) { slow = setTimeout(giveUp, 5000); return; }
      setMapState("failed");
    };
    slow = setTimeout(giveUp, 20000);
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
      // Right-click (desktop) or long-press (touch) opens the map menu.
      map.on("contextmenu", function (e) { e.preventDefault(); openCtx(e.lngLat, e.originalEvent); });
      var press = null;
      map.on("touchstart", function (e) {
        clearTimeout(press && press.t);
        if (e.points.length !== 1) { press = null; return; }
        var p0 = e.point, ll0 = e.lngLat, oe = e.originalEvent.touches[0];
        press = { p: p0, t: setTimeout(function () { press = null; if (navigator.vibrate) navigator.vibrate(12); openCtx(ll0, { clientX: oe.clientX, clientY: oe.clientY }); }, 550) };
      });
      map.on("touchmove", function (e) { if (press && (Math.abs(e.point.x - press.p.x) > 10 || Math.abs(e.point.y - press.p.y) > 10)) { clearTimeout(press.t); press = null; } });
      map.on("touchend", function () { if (press) { clearTimeout(press.t); press = null; } });
      map.on("movestart", function (e) { if (e.originalEvent) closeCtx(); });
    }).catch(function () { clearTimeout(slow); setMapState("failed"); });
  }
  // ── Map menu (right-click / long-press) ──
  function openCtx(lngLat, at) {
    if (ui.pinMode) return;
    closeCtx();
    var id = regionAnyAt(lngLat.lng, lngLat.lat), lat = lngLat.lat.toFixed(5), lng = lngLat.lng.toFixed(5);
    ui.ctx = [lngLat.lat, lngLat.lng];
    var where = id ? esc(regionName(id)) + (cities[id] ? "" : " · coming soon") : "Outside our regions";
    var el = document.createElement("div");
    el.id = "ctxmenu"; el.className = "ctxmenu glass"; el.setAttribute("role", "menu");
    el.innerHTML = '<div class="cx-h"><b>' + where + '</b><small>' + lat + ', ' + lng + '</small></div>' +
      '<button role="menuitem" data-act="ctx-suggest">' + ic("map-pin") + 'Suggest a place here</button>' +
      (id && cities[id] ? '<button role="menuitem" data-act="ctx-near">' + ic("list-checks") + 'Quests near here</button>' : "") +
      '<button role="menuitem" data-act="ctx-dir">' + ic("navigation") + 'Directions to here</button>' +
      '<button role="menuitem" data-act="ctx-copy">' + ic("copy") + 'Copy coordinates</button>' +
      (map.getZoom() < 15 ? '<button role="menuitem" data-act="ctx-zoom">' + ic("plus") + 'Zoom in here</button>' : "");
    document.body.appendChild(el);
    var w = el.offsetWidth, h = el.offsetHeight, x = at && at.clientX !== undefined ? at.clientX : innerWidth / 2, y = at && at.clientY !== undefined ? at.clientY : innerHeight / 2;
    el.style.left = Math.max(8, Math.min(x, innerWidth - w - 8)) + "px";
    el.style.top = Math.max(8, Math.min(y, innerHeight - h - 8)) + "px";
  }
  function closeCtx() {
    var el = document.getElementById("ctxmenu");
    if (el) el.remove();
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
    var found = regionAnyAt(lng, lat);
    return found && cities[found] ? found : null;
  }
  // Any region (also "coming soon" ones) that contains the point.
  function regionAnyAt(lng, lat) {
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
    return found;
  }
  function regionName(id) { return cities[id] ? cities[id].name : SOON[id] ? SOON[id].name : ""; }
  function onMove() {
    if (ui.tab !== "map" || !mapReady || ui.pinMode) return;
    // Panning into another region switches to it (not while a quest card is open).
    if (map.getZoom() >= OVERVIEW_ZOOM && !ui.open) {
      var c = map.getCenter(), id = regionAt(c.lng, c.lat);
      if (id && id !== cityId) setCurrent(id);
    }
  }
  function onMapClick(e) {
    if (!mapReady) return;
    if (ui.pinMode) { map.easeTo({ center: e.lngLat, duration: 400 }); return; } // tap to move the suggestion pin there
    var badge = map.queryRenderedFeatures(e.point, { layers: ["region-badges"] })[0];
    if (badge) { setCity(badge.properties.id, true); return; }
    var stop = map.queryRenderedFeatures(e.point, { layers: ["trail-stops"] })[0];
    if (stop && byKey[stop.properties.key]) { openQuest(byKey[stop.properties.key]); return; }
    var tl = map.queryRenderedFeatures([[e.point.x - 6, e.point.y - 6], [e.point.x + 6, e.point.y + 6]], { layers: ["trails-all-line"] })[0];
    if (tl) { followTrail(tl.properties.id); return; }
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
    var onPin = map.queryRenderedFeatures(e.point, { layers: ["pins", "clusters", "region-badges", "trail-stops", "trails-all-line"] }).length > 0;
    var r = !onPin && map.getZoom() < OVERVIEW_ZOOM ? map.queryRenderedFeatures(e.point, { layers: ["region-fill"] })[0] : null;
    map.getCanvas().style.cursor = onPin || r ? "pointer" : "";
    map.setFilter("region-hover", ["==", ["get", "id"], r && !r.properties.soon ? r.properties.id : ""]);
  }
  function refreshMap() {
    if (!mapReady) return;
    setSrc("quests", questsGeo());
    setSrc("quests-dim", questsGeo(true));
    setSrc("area-hull", areaHullGeo());
    // The picked area already has its own label on the outline.
    map.setFilter("area-labels", selArea() ? ["!=", ["get", "name"], city.areas[selArea()]] : null);
    setSrc("regions", regionsGeo());
    setSrc("trail", trailGeo());
    setSrc("trail-stops", trailStopsGeo());
    setSrc("trails-all", trailsAllGeo());
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
        ui.acc = pos.coords.accuracy || 0; // metres
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
      ["pulse", "circle-color"], ["area-hull-fill", "fill-color"], ["area-hull-line", "line-color"], ["area-hull-label", "text-color"]].forEach(function (x) { map.setPaintProperty(x[0], x[1], ac); });
  }
  // A ripple on the map where a quest was just completed.
  function pulseAt(q) { // a quest, or a plain [lat, lng]
    var p = Array.isArray(q) ? q : q && ll(q);
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
  var CC = { Netherlands: "nl", Belgium: "be", Germany: "de", Luxembourg: "lu", France: "fr", Denmark: "dk", Sweden: "se", Switzerland: "ch", "Türkiye": "tr" };

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
    var onMap = ui.tab === "map", wasHidden = $map.hidden, heroish = /^(hero|settings)$/.test(ui.tab);
    $map.hidden = !onMap;
    var views = { map: renderMapUI, quests: renderQuests, badges: renderBadges, hero: renderHero, stats: renderStats, settings: renderSettings };
    var tab = function (id, icon, label, on) {
      return '<button data-tab="' + id + '" class="' + (on ? "on" : "") + '">' + ic(icon) + '<span>' + label + '</span></button>';
    };
    $app.innerHTML = views[ui.tab]() + '<nav class="tabs"><button class="rail-logo" data-tab="map" aria-label="City Disco, back to the map">' +
      '<img src="icon.svg" alt="" width="44" height="44"><span>city disco</span></button>' + tab("map", "map", "Map", onMap) + tab("quests", "list-checks", "Quests", ui.tab === "quests") +
      tab("badges", "award", "Badges", ui.tab === "badges") + tab("stats", "chart-column", "Stats", ui.tab === "stats") + tab("hero", "user-round", "Explorer", heroish) + '</nav>';
    document.body.classList.toggle("on-map", onMap);
    if (onMap) updateMap(wasHidden);
    if (ui.tab === "hero") fillMemories();
  }

  // ── Map screen ─────────────────────────────────────────────
  // Phones: the map fills the screen with floating controls. Wide screens (1024px+): a side panel holds the
  // region card, search, filters and the quest list next to the map.
  var WIDE = window.matchMedia ? window.matchMedia("(min-width: 1024px)") : { matches: false };
  function isWide() { return WIDE.matches; }
  function topcardHtml(glass) {
    var s = stats(city.quests), p = progress(), pr = profile();
    return '<div class="topcard' + (glass ? " glass" : "") + '">' +
      '<button class="plain" data-tab="hero" aria-label="Your explorer, level ' + p.level + '">' + avatarHtml(pr, p) + '</button>' +
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
    return t.quests.length + ' stops · ' + trailKmText(t) + ' · ' + trailTime(t) + (s.done ? ' · ' + s.done + '/' + s.total + ' done' : "");
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
    if (ui.myMap) {
      var n = allQuests.filter(isDone).length;
      return '<button class="fab done" data-act="my-map-end">' + ic("x") + '<span><small>My map · ' + fmt(n) + (n === 1 ? " place" : " places") + ' you have done</small>Show all quests</span></button>';
    }
    return dq && !isDone(dq)
      ? '<button class="fab" data-open="' + esc(dq.key) + '">' + ic("star") + '<span><small>Today\'s adventure · +' + XP.daily + ' XP' +
        (seasonDaysLeft(dq) !== null ? ' · ' + leftText(seasonDaysLeft(dq)).toLowerCase() : "") + '</small>' + esc(dq.title) + '</span></button>'
      : '<button class="fab done" data-act="suggest">' + ic("check") + '<span><small>Today\'s adventure done</small>Surprise me with another</span></button>';
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
      var url = "https://photon.komoot.io/api/?limit=6&lang=en&bbox=-5.5,41.2,24.5,69.2&q=" + encodeURIComponent(raw.trim());
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
    // Area chips only exist on the map screen, so the area filter applies there and not on the quest board.
    var area = ui.tab === "map" && ui.area !== "all" && city.areas[ui.area] ? ui.area : null;
    var list = city.quests.filter(function (q) {
      if (area && q.area !== area) return false;
      if (ui.cat !== "all" && q.cat !== ui.cat) return false;
      if (ui.show === "todo" && isDone(q)) return false;
      if (ui.show === "done" && !isDone(q)) return false;
      if (needle && (q.title + " " + q.desc + " " + city.areas[q.area] + " " + q.q).toLowerCase().indexOf(needle) === -1) return false;
      return true;
    });
    if (!list.length) {
      return '<div class="empty">' + (needle ? 'No quests match "' + esc(ui.q.trim()) + '".' : ui.show === "done" ? "Uncharted territory. Pick your first quest." : "All done in this filter.") + '</div>';
    }
    if (ui.near && ui.pos) {
      return list.filter(ll).map(function (q) { return [q, km(ui.pos, ll(q))]; }).sort(function (a, b) { return a[1] - b[1]; })
        .map(function (x) { return questRow(x[0], { dist: x[1] }); }).join("");
    }
    if (needle) return list.map(function (q) { return questRow(q); }).join("");
    return (ui.tab === "quests" ? todayCard() + mustEatStrip() : "") + seasonStrip() + Object.keys(city.areas).map(function (a) {
      var part = list.filter(function (q) { return q.area === a; });
      if (!part.length) return "";
      var s = stats(inArea(a));
      return '<div class="ghead"><b>' + esc(city.areas[a]) + '</b><span>' + s.done + ' / ' + s.total + '</span></div>' + part.map(function (q) { return questRow(q); }).join("");
    }).join("");
  }
  // The quest of the day as the board's feature card (photo cover when there is one).
  function todayCard() {
    var dq = dailyQuest();
    if (!dq || isDone(dq) || ui.show === "done" || (ui.cat !== "all" && dq.cat !== ui.cat)) return "";
    var ph = photoOf(dq), c = cities[dq.cid], left = seasonDaysLeft(dq);
    return '<button class="today ' + dq.cat + (ph ? " hasph" : "") + '" data-open="' + esc(dq.key) + '"' +
      (ph ? ' style="background-image:url(' + esc(thumb(ph[0], 640)) + ')"' : "") + '>' +
      '<span class="td-top"><span class="td-k">' + ic("star", "sm") + 'Today\'s adventure</span><span class="td-xp">+' + XP.daily + ' bonus XP</span></span>' +
      '<span class="td-b"><span class="td-cat">' + ic(CATS[dq.cat].icon, "sm") + CATS[dq.cat].label + ' · ' + esc(c.areas[dq.area]) +
        (dq.cid !== cityId ? ' · ' + esc(c.name) : "") + (left !== null ? ' · ' + leftText(left).toLowerCase() : "") + '</span>' +
      '<b>' + esc(dq.title) + '</b><span class="td-go">View quest' + ic("chevron-right", "sm") + '</span></span></button>';
  }
  // The region's must-eat dishes as a row of stamps: tap one to tick it off, "See all" opens the full list.
  function mustEatStrip() {
    var list = city.dishes || [];
    if (!list.length || ui.show === "done" || (ui.cat !== "all" && ui.cat !== "ye")) return "";
    var eaten = list.filter(dishEaten).length, all = eaten === list.length;
    return '<div class="musteat' + (all ? " full" : "") + '"><div class="me-h"><span class="me-k">' + ic("utensils", "sm") + 'Must-eats in ' + esc(city.name) + '</span>' +
      '<b>' + eaten + ' / ' + list.length + '</b><button class="linkbtn" data-qview="dishes">See all</button></div>' +
      '<div class="stamps">' + list.map(function (d) {
        var on = dishEaten(d);
        return '<button class="stamp' + (on ? " on" : "") + '" data-dish="' + esc(d.key) + '" aria-pressed="' + on + '" aria-label="' +
          (on ? esc(d.name) + ", eaten. Tap to undo" : "I ate " + esc(d.name)) + '"><span class="st-i">' + d.icon + (on ? '<i>' + ic("check") + '</i>' : "") + '</span>' +
          '<span class="st-n">' + esc(d.name) + '</span></button>';
      }).join("") + '</div>' +
      '<div class="me-f">' + (all ? "Local Palate earned. You have eaten your way through " + esc(city.name) + "."
        : "Eat them anywhere in the region · +" + XP.dish + " XP each, all " + list.length + " earn Local Palate") + '</div></div>';
  }
  // Seasonal quests open right now, soonest ending first: "do it before it's gone".
  function seasonStrip() {
    var area = ui.tab === "map" && ui.area !== "all" ? ui.area : null;
    var list = seasonalNow(city.quests).filter(function (q) { return (ui.cat === "all" || q.cat === ui.cat) && (!area || q.area === area); });
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
      '<div class="m">' + esc(t.sub) + '</div><div class="m">' + t.quests.length + ' stops · ' + trailKmText(t) + ' · ' + trailTime(t) + ' · ' + (s.done === s.total ? "Complete" : s.done + " / " + s.total + " done") + '</div>' + bar(s.pct) + '</div>' +
      '<span class="xp">+' + TRAIL_XP + '</span></button>';
  }
  // Quests in this region that mention a dish, so you know where to try it.
  function dishSpots(d) {
    var kw = (d.kw || []).map(fold).filter(Boolean);
    if (!kw.length) return [];
    return city.quests.filter(function (q) {
      if (q.cat !== "ye") return false;
      var t = fold(q.title + " " + q.desc);
      return kw.some(function (k) { return t.indexOf(k) !== -1; });
    }).slice(0, 3);
  }
  function dishesHtml() {
    var list = city.dishes || [];
    if (!list.length) return '<div class="empty">' + ic("utensils", "big") + '<br>Nothing around here yet.<br>Must-eat dishes for ' + esc(city.name) + ' are on their way.</div>';
    var eaten = list.filter(dishEaten).length;
    return '<div class="panel dishhead"><div class="grow"><b>' + eaten + ' / ' + list.length + ' eaten</b>' +
      '<small>The dishes that make ' + esc(city.name) + '. Eat them anywhere in the region: +' + XP.dish + ' XP each, all ' + list.length + ' earn the Local Palate badge.</small>' +
      bar(Math.round((eaten / list.length) * 100), "xp") + '</div></div>' +
      list.map(function (d) {
        var on = dishEaten(d), spots = dishSpots(d);
        return '<div class="dish' + (on ? " done" : "") + '"><span class="dish-i">' + d.icon + '</span><div class="grow">' +
          '<div class="t">' + esc(d.name) + (d.local && d.local !== d.name ? ' <small>' + esc(d.local) + '</small>' : "") + '</div>' +
          '<p>' + esc(d.desc) + '</p>' +
          (spots.length ? '<div class="spots"><span>Try it at</span>' + spots.map(function (q) {
            return '<button class="chip" data-open="' + esc(q.key) + '">' + esc(q.title.replace(/^.*\bat\s+/, "")) + '</button>';
          }).join("") + '</div>' : "") + '</div>' +
          '<button class="check' + (on ? " on" : "") + '" data-dish="' + esc(d.key) + '" aria-pressed="' + on + '" aria-label="' +
            (on ? "Mark " + esc(d.name) + " as not eaten" : "I ate " + esc(d.name)) + '">' + ic("check") + '</button></div>';
      }).join("");
  }
  function renderQuests() {
    var s = stats(city.quests), html = head(city.name, s.done + " of " + s.total + " quests done", { picker: true }) +
      '<div class="filters">' + seg("data-qview", ui.qview, [["all", "Quests"], ["trails", "Trails"], ["dishes", "Must-eats"], ["saved", "Saved"]]);
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
    } else if (ui.qview === "dishes") {
      html += '</div><div class="list">' + dishesHtml() + '</div>';
    } else {
      var saved = allQuests.filter(isSaved).sort(function (a, b) { return store.saved[b.key] - store.saved[a.key]; });
      html += '</div><div class="list">' + (saved.length ? saved.map(function (q) { return questRow(q, { region: true }); }).join("")
        : '<div class="empty">' + ic("bookmark", "big") + '<br>Your adventure list is empty.<br>Tap the bookmark on any quest to save it here, from any region.</div>') + '</div>';
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
  // Every badge earned in any region, best tier first: the hero's trophy shelf.
  function badgeCabinet() {
    var got = [];
    Object.keys(cities).forEach(function (id) {
      badges(cities[id]).forEach(function (b) {
        if (b.tier) got.push({ b: b, cid: id, cls: b.max === 1 ? "gold" : TIERS[b.tier - 1].key, rank: b.max === 1 ? 3 : b.tier });
      });
    });
    got.sort(function (a, b) { return b.rank - a.rank; });
    var shown = got.slice(0, 11);
    return '<h2>Badge cabinet <span class="h2n">' + got.length + ' collected</span></h2><button class="panel cabinet" data-tab="badges">' +
      (got.length ? '<div class="shelf">' + shown.map(function (x) {
        return '<span class="cab ' + x.cls + '" title="' + esc(x.b.name + " · " + cities[x.cid].name) + '">' + x.b.icon + '</span>';
      }).join("") + (got.length > shown.length ? '<span class="cab more">+' + (got.length - shown.length) + '</span>' : "") + '</div>'
        : '<div class="shelf">' + [0, 1, 2, 3, 4].map(function () { return '<span class="cab empty">' + ic("lock", "sm") + '</span>'; }).join("") + '</div>' +
          '<div class="note flat">Your first quest in a region earns First Steps.</div>') +
      '<span class="cab-go">See all badges in ' + esc(city.name) + ic("chevron-right", "sm") + '</span></button>';
  }
  function masteryHtml(p) {
    var cls = CLASSES[profile().cls];
    return '<h2>Explorer mastery</h2><div class="panel mastery">' + ATTRS.map(function (a) {
      var x = p.attr[a.key], ai = attrInfo(x), fav = cls && (cls.cat ? cls.cat === a.key : a.key === "far");
      return '<div class="attr ' + (CATS[a.key] ? a.key : "") + '"><span class="ai">' + ic(a.icon) + '</span><div class="grow"><div class="an">' + a.name +
        (fav ? ' <em>' + esc(cls.name) + ' bonus</em>' : "") + '<span>Lv ' + ai.level + '</span></div><small>' + a.desc + ' · ' + fmt(x) + ' XP</small>' + bar(ai.pct) + '</div></div>';
    }).join("") + '</div>';
  }
  function renderHero() {
    var p = progress(), pr = profile(), cls = CLASSES[pr.cls], dq = dailyQuest();
    var next = Math.min(50, 10 * (p.thisWeek ? p.streak - 1 : p.streak));
    var upcoming = UNLOCKS.filter(function (u) { return u.level > p.level; }).sort(function (a, b) { return a.level - b.level; });
    var html = head("Your explorer", "One explorer, every region", { gear: true }) + '<div class="section">' +
      '<div class="panel charcard">' +
        '<button class="edit" data-act="profile" aria-label="Customize your explorer">' + ic("pencil") + '</button>' +
        '<div class="cc-av">' + avatarHtml(pr, null, "xl") + '</div>' +
        '<div class="cc-lv"><span class="lvpill">Level ' + p.level + '</span>' + (cls ? '<span class="clspill">' + cls.icon + ' ' + esc(cls.name) + '</span>' : "") + '</div>' +
        '<div class="ttl">' + esc(pr.name || "Explorer") + '</div><div class="sub">' + esc(heroTitle(p)) + '</div>' +
        '<div class="cc-xp"><b>' + fmt(p.xp) + '</b> XP</div>' + bar(p.pct, "xp big") +
        '<div class="ls">' + fmt(p.need - p.into) + ' XP to level ' + (p.level + 1) + '</div>' +
        '<div class="cc-stats">' +
          '<div><b>' + fmt(p.quests) + '</b><span>Quests</span></div>' +
          '<div><b>' + p.regions + '</b><span>' + (p.regions === 1 ? "Region" : "Regions") + '</span></div>' +
          '<div class="' + (p.streak ? "hot" : "") + '"><b>' + ic("flame", "sm") + p.streak + ' wk</b><span>Streak</span></div>' +
          '<div><b>' + p.badges + '</b><span>Badges</span></div></div>' +
        (cls ? "" : '<button class="btn ghost" data-act="profile" style="margin-top:12px">Pick your class</button>') + '</div>' +
      (p.streak && !next ? "" : '<div class="streak' + (p.streak ? " on" : "") + '">' + ic("flame") + '<span>' + (p.streak
        ? p.streak + "-week streak. Quests this week earn +" + next + "% XP"
        : "Complete a quest this week to start a streak: +10% XP per week in a row, up to +50%") + '</span></div>');
    if (dq) {
      html += '<button class="panel daily" data-open="' + esc(dq.key) + '">' + ic("star", "big") + '<div class="grow"><small>Today\'s adventure' +
        (isDone(dq) ? " · done" : " · +" + XP.daily + " XP bonus") + '</small><b>' + esc(dq.title) + '</b></div>' + ic(isDone(dq) ? "check" : "chevron-right") + '</button>';
    }
    html += '<button class="btn ghost" data-act="share" style="margin-top:10px">' + ic("share-2") + 'Share card</button>' +
      masteryHtml(p) + badgeCabinet() +
      '<h2>Unlocks</h2><div class="panel">' +
        (upcoming.length ? '<div class="nextu">Next at level ' + upcoming[0].level + ': <b>' + esc(unlockLabel(upcoming[0])) + '</b></div>' : '<div class="nextu">Everything unlocked. Legendary.</div>') +
        '<div class="ugrid">' + UNLOCKS.map(function (u) { return unlockTile(u, p.level); }).join("") + '</div>' +
        '<button class="btn ghost" data-act="profile" style="margin-top:12px">Customize your explorer</button></div>' +
      '<h2>Memories</h2><div class="panel" id="memories"><div class="note flat">Loading…</div></div></div>';
    return html;
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
  // ── Your travels: totals, furthest points and records, all from the completion log ──
  function dms(v, pos, neg) {
    var a = Math.abs(v), d = Math.floor(a), m = Math.round((a - d) * 60);
    if (m === 60) { d++; m = 0; }
    return d + "° " + m + "′ " + (v >= 0 ? pos : neg);
  }
  function travelStats() {
    var done = allQuests.filter(isDone), regs = {}, ctry = {}, areas = {}, cats = { gor: 0, ye: 0, dene: 0 };
    var ext = {}, days = {}, weeks = {}, first = null, notes = 0, photos = 0, checkins = 0, areaTotal = 0;
    Object.keys(cities).forEach(function (id) { areaTotal += Object.keys(cities[id].areas).length; });
    done.forEach(function (q) {
      var r = rec(q), p = ll(q), dk = dayKey(r.at);
      regs[q.cid] = (regs[q.cid] || 0) + 1; ctry[cities[q.cid].country] = 1; areas[q.cid + "/" + q.area] = 1; cats[q.cat]++;
      if (p) {
        if (!ext.n || p[0] > ll(ext.n)[0]) ext.n = q;
        if (!ext.s || p[0] < ll(ext.s)[0]) ext.s = q;
        if (!ext.e || p[1] > ll(ext.e)[1]) ext.e = q;
        if (!ext.w || p[1] < ll(ext.w)[1]) ext.w = q;
      }
      days[dk] = days[dk] || { n: 0, at: r.at }; days[dk].n++;
      weeks[weekOf(r.at)] = 1;
      if (!first || r.at < rec(first).at) first = q;
      if (r.note) notes++;
      if (r.photos) photos++;
      if (r.v) checkins++;
    });
    var best = null, top = null, run = 0, longest = 0;
    Object.keys(days).forEach(function (k) { if (!best || days[k].n > best.n) best = days[k]; });
    Object.keys(regs).forEach(function (id) { if (!top || regs[id] > regs[top]) top = id; });
    Object.keys(weeks).map(Number).sort(function (a, b) { return a - b; }).forEach(function (w, i, a) {
      run = i && a[i - 1] === w - 1 ? run + 1 : 1;
      if (run > longest) longest = run;
    });
    return { done: done, regs: regs, ctry: ctry, areas: Object.keys(areas).length, areaTotal: areaTotal, cats: cats, ext: ext,
      first: first, best: best, top: top, longest: longest, days: Object.keys(days).length, notes: notes, photos: photos, checkins: checkins };
  }
  function pctOf(a, b) { return b ? Math.round((a / b) * 100) : 0; }
  function countLine(label, a, b) {
    return '<div class="tl"><span>' + label + '</span><b>' + fmt(a) + '</b><small>/ ' + fmt(b) + ' (' + pctOf(a, b) + '%)</small></div>';
  }
  function extRow(dir, q) {
    if (!q) return "";
    var p = ll(q), c = cities[q.cid];
    return '<button class="ext" data-open="' + esc(q.key) + '"><span class="ed">' + dir + '</span><div class="grow"><b>' + flagHtml(c.country) + esc(q.title) + '</b>' +
      '<small>' + esc(c.name) + ' · ' + dms(p[0], "N", "S") + ', ' + dms(p[1], "E", "W") + '</small></div>' + ic("chevron-right", "sm") + '</button>';
  }
  function dateText(t) { return new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  function yearRecap(t) {
    var y = new Date().getFullYear(), list = t.done.filter(function (q) { return new Date(rec(q).at).getFullYear() === y; });
    if (!list.length) return "";
    var per = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], regs = {}, cats = { gor: 0, ye: 0, dene: 0 }, newRegs = 0;
    list.forEach(function (q) { per[new Date(rec(q).at).getMonth()]++; regs[q.cid] = 1; cats[q.cat]++; });
    Object.keys(regs).forEach(function (id) { // a region counts as new when its first quest was done this year
      var firstHere = t.done.filter(function (q) { return q.cid === id; }).reduce(function (m, q) { return Math.min(m, rec(q).at); }, Infinity);
      if (new Date(firstHere).getFullYear() === y) newRegs++;
    });
    var max = Math.max.apply(null, per), peak = per.indexOf(max), topCat = Object.keys(cats).sort(function (a, b) { return cats[b] - cats[a]; })[0];
    return '<h2>Your ' + y + '</h2><div class="panel"><div class="yr-n"><div><b>' + list.length + '</b><span>quests</span></div>' +
      '<div><b>' + Object.keys(regs).length + '</b><span>regions</span></div><div><b>' + newRegs + '</b><span>new regions</span></div></div>' +
      '<div class="months">' + per.map(function (n, i) {
        return '<div class="mo' + (i === peak ? " pk" : "") + '"><i style="height:' + (max ? Math.max(n ? 8 : 0, Math.round((n / max) * 100)) : 0) + '%"></i><small>' + MONTHS[i][0] + '</small></div>';
      }).join("") + '</div><p class="note flat">Busiest month: <b>' + MONTHS[peak] + '</b> (' + max + ') · mostly ' + ic(CATS[topCat].icon, "sm") + '<b>' + CATS[topCat].label + '</b></p></div>';
  }
  function renderYou() {
    var t = travelStats(), C = window.COUNTRIES || {}, soon = soonCounts(), regTotal = Object.keys(cities).length;
    Object.keys(soon).forEach(function (n) { regTotal += soon[n]; });
    var ctryNames = Object.keys(C).map(function (cc) { return C[cc].name; });
    var html = '<div class="panel travel"><div class="tv-h">' + avatarHtml(profile(), null, "lg") + '<div class="grow"><b>' + esc(profile().name || "Explorer") + '</b>' +
      '<small>Places visited: <em>' + fmt(t.done.length) + '</em></small></div>' +
      '<button class="btn soft sm" data-act="my-map">' + ic("map", "sm") + 'My map</button></div>' +
      countLine("Quests", t.done.length, allQuests.length) +
      countLine("Regions", Object.keys(t.regs).length, regTotal) +
      countLine("Countries", Object.keys(t.ctry).length, ctryNames.length) +
      countLine("Areas", t.areas, t.areaTotal) +
      '<div class="flags">' + ctryNames.map(function (n) { return '<span class="fg' + (t.ctry[n] ? " on" : "") + '" title="' + esc(n) + '">' + flagHtml(n) + '</span>'; }).join("") + '</div>' +
      '<div class="cats3">' + Object.keys(CATS).map(function (c) {
        var tot = allQuests.filter(function (q) { return q.cat === c; }).length;
        return '<div class="' + c + '">' + ic(CATS[c].icon, "sm") + '<b>' + t.cats[c] + '</b><small>' + CATS[c].label + '</small>' + bar(pctOf(t.cats[c], tot)) + '</div>';
      }).join("") + '</div></div>';
    if (!t.done.length) return html + '<div class="note">Complete your first quest to see your furthest points and records here.</div>';
    html += '<h2>Furthest points</h2><div class="panel exts">' + extRow("N", t.ext.n) + extRow("S", t.ext.s) + extRow("E", t.ext.e) + extRow("W", t.ext.w) + '</div>';
    html += '<h2>Records</h2><div class="panel recs">' +
      '<div><small>Explorer since</small><b>' + dateText(rec(t.first).at) + '</b><span>' + esc(t.first.title) + '</span></div>' +
      '<div><small>Busiest day</small><b>' + t.best.n + (t.best.n === 1 ? " quest" : " quests") + '</b><span>' + dateText(t.best.at) + '</span></div>' +
      '<div><small>Longest streak</small><b>' + t.longest + (t.longest === 1 ? " week" : " weeks") + '</b><span>in a row</span></div>' +
      '<div><small>Most explored</small><b>' + flagHtml(cities[t.top].country) + esc(cities[t.top].name) + '</b><span>' + t.regs[t.top] + ' quests</span></div>' +
      '<div><small>Days out</small><b>' + t.days + '</b><span>with a quest</span></div>' +
      '<div><small>Journal</small><b>' + t.notes + ' notes</b><span>' + t.photos + ' with photos · ' + t.checkins + ' check-ins</span></div></div>';
    return html + yearRecap(t);
  }

  // ── Everyone: totals over all signed-in explorers, published once a day as community.json ──
  // (tools/community_stats.py)
  var community = null;
  function loadCommunity() {
    if (community) return;
    community = { loading: true };
    fetch("community.json", { cache: "no-cache" }).then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; }).then(function (d) {
      community = d || {};
      if (ui.tab === "stats" && ui.statsView === "everyone" && $sheet.hidden) render();
    });
  }
  loadCommunity();
  function doneBy(key) { return (community && community.quests && community.quests[key]) || 0; }
  function rankRows(items, label) { // items: [{ n, html, attr }] sorted by n; equal counts share a rank
    var rank = 0;
    return '<div class="rk-h"><span>#</span><span class="grow">' + label + '</span><span>Explorers</span></div>' + items.map(function (x, i) {
      if (!i || x.n !== items[i - 1].n) rank = i + 1;
      return '<button class="rk" ' + x.attr + '><span class="rkn">' + rank + '.</span><div class="grow">' + x.html + '</div><span class="rc">' + fmt(x.n) + '</span></button>';
    }).join("");
  }
  function topBy(counts, n) {
    return Object.keys(counts || {}).filter(function (k) { return counts[k] > 0; }).sort(function (a, b) { return counts[b] - counts[a] || (a < b ? -1 : 1); }).slice(0, n);
  }
  function questItem(k, counts) {
    var q = byKey[k], c = cities[q.cid];
    return { n: counts[k], attr: 'data-open="' + esc(k) + '"', html: '<b>' + ic(CATS[q.cat].icon, "sm") + esc(q.title) + '</b><small>' + flagHtml(c.country) + esc(c.name) + '</small>' };
  }
  function renderEveryone() {
    if (!community || community.loading) { loadCommunity(); return '<div class="note">Loading…</div>'; }
    if (!community.explorers) {
      return '<div class="empty">' + ic("users", "big") + '<b>Rankings are on their way</b><p>Once enough explorers have signed in, this shows the most explored regions, the most loved quests and hidden gems. Updated once a day.</p></div>';
    }
    var cat = ui.evCat || "all", Q = community.quests || {}, R = community.recent || {};
    var inCat = function (counts) { var o = {}; Object.keys(counts).forEach(function (k) { var q = byKey[k]; if (q && (cat === "all" || q.cat === cat)) o[k] = counts[k]; }); return o; };
    var regs = {}; Object.keys(community.regions || {}).forEach(function (id) { if (cities[id]) regs[id] = community.regions[id]; });
    var html = '<p class="note flat center">' + fmt(community.explorers) + (community.explorers === 1 ? ' explorer' : ' explorers') + ' · updated ' + dateText(community.updated) + '</p>';
    html += '<h2>Most explored regions</h2><div class="panel ranks">' + rankRows(topBy(regs, 25).map(function (id) {
      var c = cities[id];
      return { n: regs[id], attr: 'data-city="' + id + '"', html: '<b>' + flagHtml(c.country) + esc(c.name) + '</b><small>' + esc(c.subtitle || c.country) + '</small>' };
    }), "Region") + '</div>';
    html += '<h2>Most loved quests</h2><div class="chips">' + [["all", "All"]].concat(Object.keys(CATS).map(function (c) { return [c, CATS[c].label]; })).map(function (x) {
      return '<button class="chip' + (cat === x[0] ? " on" : "") + '" data-ev-cat="' + x[0] + '">' + x[1] + '</button>';
    }).join("") + '</div>';
    var qc = inCat(Q), top = topBy(qc, 25);
    html += '<div class="panel ranks">' + (top.length ? rankRows(top.map(function (k) { return questItem(k, qc); }), "Quest") : '<div class="note flat">No quests here yet.</div>') + '</div>';
    var rc = inCat(R), trend = topBy(rc, 10);
    if (trend.length) html += '<h2>Trending this month</h2><div class="panel ranks">' + rankRows(trend.map(function (k) { return questItem(k, rc); }), "Quest") + '</div>';
    // Hidden gems: quests with a photo in the regions people explore most, that hardly anyone has done yet.
    var dk = dayKey(), mix = function (q) { // a different order every day
      var s = 0, str = q.key + dk;
      for (var i = 0; i < str.length; i++) s = (s * 31 + str.charCodeAt(i)) >>> 0;
      return s;
    };
    var gems = allQuests.filter(function (q) {
      return regs[q.cid] && !Q[q.key] && photoOf(q) && !isDone(q) && (cat === "all" || q.cat === cat);
    }).sort(function (a, b) { return mix(a) - mix(b); }).slice(0, 8);
    if (gems.length) html += '<h2>Hidden gems</h2><p class="note flat">Few explorers have found these yet.</p><div class="list">' + gems.map(function (q) { return questRow(q); }).join("") + '</div>';
    var ctry = community.countries || {};
    html += '<h2>Countries</h2><div class="panel ranks">' + rankRows(topBy(ctry, 20).map(function (n) {
      return { n: ctry[n], attr: "", html: '<b>' + flagHtml(n) + esc(n) + '</b>' };
    }), "Country") + '</div>';
    return html + '<p class="note center">Counts come from signed-in explorers, updated once a day. You can leave yourself out in Settings.</p>';
  }

  function renderStats() {
    var p = progress(), s = stats(city.quests), cs = countryStats(), view = ui.statsView || "you";
    var html = head("Stats", fmt(p.xp) + " XP across " + p.quests + (p.quests === 1 ? " quest" : " quests")) + '<div class="section">' +
      seg("data-stats-view", view, [["you", "You"], ["everyone", "Everyone"]]);
    if (view === "everyone") return html + renderEveryone() + '</div>';
    html += renderYou() + '<h2>Countries</h2><div class="countries">' +
      Object.keys(cs).map(function (n) {
        var o = cs[n], pct = o.total ? Math.round((o.done / o.total) * 100) : 0;
        return '<div class="ctry"><div class="ctry-h">' + flagHtml(n) + '<b>' + esc(n) + '</b><span>' + pct + '%</span></div>' + bar(pct) +
          '<small>' + o.done + ' / ' + o.total + ' quests · ' + o.started + ' / ' + o.regions + ' regions</small></div>';
      }).join("") + '</div>';
    html += '<h2>' + flagHtml(city.country) + esc(city.name) + '</h2><div class="panel profile">' + ring(s.pct, true) + '<div class="grow"><div class="lvx">' +
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
      '<li>Today\'s adventure +' + XP.daily + ', checking in on the spot +' + XP.checkin + '</li>' +
      '<li>A journal note +' + XP.journal + ', a photo +' + XP.photo + '</li>' +
      '<li>Each must-eat dish of a region +' + XP.dish + '</li>' +
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
      '<button class="btn plain" data-act="signout">Sign out</button></div>' +
      '<button class="btn plain danger" data-act="account-delete">Delete my account</button>';
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
        switchHtml("sound", store.sound !== false, "Sounds") +
        switchHtml("stats-optin", !(store.profile && store.profile.noStats), "Count me in the community rankings") +
        '<p class="note">When you are signed in, the quests you have done are added to anonymous daily totals ("Done by 120 explorers"). Your name and account are never shown.</p></div>' +
      '<h2>Suggestions</h2><div class="panel"><button class="btn ghost" data-act="rec-start">' + ic("map-pin") + 'Suggest a place</button>' +
        '<button class="btn ghost" data-act="rec-mine">' + ic("list-checks") + 'Your suggestions</button>' +
        (isAdmin() ? '<button class="btn" data-act="rec-review">' + ic("star") + 'Review suggestions</button>' : "") + '</div>' +
      '<h2>Backup</h2><div class="panel"><button class="btn ghost" data-act="export">' + ic("copy") + 'Copy progress to clipboard</button>' +
        '<button class="btn ghost" data-act="import">' + ic("download") + 'Restore from backup</button>' +
        '<p class="note">The backup text holds your progress and profile, not your photos. Signing in backs up everything.</p></div>' +
      '<h2>About</h2><div class="panel"><button class="btn ghost" data-act="feedback">' + ic("triangle-alert") + 'Send feedback or report a problem</button>' +
        '<a class="btn ghost" href="privacy.html" target="_blank" rel="noopener">' + ic("lock") + 'Privacy</a>' +
        '<p class="note">Map data © OpenStreetMap contributors, tiles by OpenFreeMap, place search by Photon (Komoot). Quest photos from Wikimedia Commons under free licences, credited on each quest. Icons by Lucide.</p></div></div>';
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
        '<h3>' + esc(q.title) + '</h3>' + (doneBy(q.key) ? '<small class="doneby">' + ic("users", "sm") + 'Done by ' + fmt(doneBy(q.key)) + (doneBy(q.key) === 1 ? ' explorer' : ' explorers') + '</small>' : "") +
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
      (up ? '<p class="note center">Your email, progress and photos are stored in Google Firebase (EU) so you can sync. <a href="privacy.html" target="_blank" rel="noopener">Privacy</a></p>' : "") +
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
