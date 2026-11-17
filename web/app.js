(function () {
  "use strict";

  var APP_VERSION = "0.9.0";
  var STORE_KEY = "citydiscovery.v1";
  var CATS = {
    gor: { label: "See", icon: "👀", color: "#3b82f6" },
    ye: { label: "Eat & drink", icon: "🍴", color: "#f97316" },
    dene: { label: "Do", icon: "✨", color: "#a855f7" }
  };
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var STYLE_LIGHT = "https://tiles.openfreemap.org/styles/liberty";
  var STYLE_DARK = "https://tiles.openfreemap.org/styles/positron"; // lightness-inverted at load time
  var FALLBACK_COLORS = ["#f43f5e", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#14b8a6", "#ec4899",
    "#84cc16", "#6366f1", "#f97316", "#06b6d4", "#eab308", "#8b5cf6", "#10b981"];
  var OVERVIEW_ZOOM = 9.5; // below this the map shows whole regions instead of pins

  // ── Persistent state ───────────────────────────────────────
  // { city, theme, done: { "<region>/<quest>": { at: ms, note } } }
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
  }

  var cities = window.CITIES || {};
  var cityId = cities[store.city] ? store.city : Object.keys(cities)[0];
  var city = cities[cityId];
  var ui = { tab: "map", cat: "all", area: "all", show: "todo", open: null };

  // All regions' quests in one list; each knows its region (cid) and storage key.
  var allQuests = [], byKey = {};
  Object.keys(cities).forEach(function (id, i) {
    cities[id].color = (window.REGION_COLORS && window.REGION_COLORS[id]) || FALLBACK_COLORS[i % FALLBACK_COLORS.length];
    cities[id].quests.forEach(function (q) {
      q.cid = id; q.key = id + "/" + q.id;
      allQuests.push(q); byKey[q.key] = q;
    });
  });

  function rec(q) { return store.done[q.key]; }
  function isDone(q) { var r = rec(q); return !!(r && r.at); }
  function inSeason(q) { return !q.months || q.months.indexOf(new Date().getMonth() + 1) !== -1; }
  function ll(q) { var c = cities[q.cid]; return c.coords && c.coords[q.id]; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
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
    var notes = c.quests.filter(function (q) { var r = rec(q); return r && r.note; }).length;
    single("first", "👣", "First Steps", "Complete your first quest here", done.length, 1);
    single("ten", "🔟", "Warm-up", "Complete 10 quests here", done.length, Math.min(10, c.quests.length));
    single("half", "🧭", "Halfway There", "Complete half of all quests here", done.length, Math.ceil(c.quests.length / 2));
    single("everywhere", "🗺️", "All Corners", "Complete a quest in every area", touched, areaKeys.length);
    single("fullday", "⚡", "Packed Day", "Complete 3 quests in one day", bestDay, 3);
    single("season", "🍂", "Season Hunter", "Complete 3 seasonal quests", done.filter(function (q) { return q.months; }).length, 3);
    single("diary", "📓", "Diary Keeper", "Write notes on 5 quests", notes, 5);
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

  // ── RPG progression ────────────────────────────────────────
  // One hero across all regions. XP comes from quests (with bonuses) and badges; levels follow a curve.
  var XP = { quest: 100, seasonal: 50, far: 50, area: 50, region: 150, journal: 25 };
  var TITLES = [[1, "Wanderer", "🎒"], [3, "Explorer", "🧭"], [6, "Pathfinder", "🥾"], [10, "Trailblazer", "🔥"],
    [15, "Navigator", "⛵"], [20, "Cartographer", "🗺️"], [30, "Voyager", "🚀"], [40, "Lorekeeper", "📜"],
    [55, "Legend", "🏆"], [75, "Mythic Explorer", "🐉"]];
  var ATTRS = [
    { key: "gor", name: "Curiosity", icon: "👀", desc: "Grows with every sight you see" },
    { key: "ye", name: "Appetite", icon: "🍴", desc: "Grows with every taste you try" },
    { key: "dene", name: "Courage", icon: "✨", desc: "Grows with every experience" },
    { key: "far", name: "Wanderlust", icon: "🧭", desc: "Grows with every trip beyond the city" }
  ];
  function xpForLevel(L) { return L <= 1 ? 0 : Math.round((120 * Math.pow(L - 1, 1.6)) / 10) * 10; }
  function levelInfo(xp) {
    var L = 1;
    while (L < 99 && xpForLevel(L + 1) <= xp) L++;
    var t = TITLES[0];
    TITLES.forEach(function (x) { if (L >= x[0]) t = x; });
    var lo = xpForLevel(L), hi = xpForLevel(L + 1);
    return { level: L, title: t[1], icon: t[2], into: xp - lo, need: hi - lo, pct: Math.min(100, Math.round(((xp - lo) / (hi - lo)) * 100)) };
  }
  function attrInfo(x) {
    var L = 1 + Math.floor(Math.sqrt(x / 60)), lo = 60 * (L - 1) * (L - 1), hi = 60 * L * L;
    return { level: L, pct: Math.round(((x - lo) / (hi - lo)) * 100) };
  }
  function weekOf(t) { return Math.floor((t / 86400000 + 3) / 7); } // weeks start on Monday (UTC)
  // Replays every completion in time order, so bonuses depend on what you had done before.
  // With `previewKey`, that quest is added as if completed now (used to show the reward in advance).
  function progress(previewKey) {
    var log = [];
    Object.keys(store.done).forEach(function (k) {
      var r = store.done[k];
      if (r && r.at && byKey[k]) log.push({ q: byKey[k], at: r.at, note: !!r.note });
    });
    if (previewKey && byKey[previewKey] && !isDone(byKey[previewKey])) log.push({ q: byKey[previewKey], at: Date.now(), note: false, preview: true });
    log.sort(function (a, b) { return a.at - b.at; });
    var seenArea = {}, seenRegion = {}, weeks = {}, attr = { gor: 0, ye: 0, dene: 0, far: 0 }, xp = 0, gains = [];
    log.forEach(function (e) {
      var q = e.q, parts = [["Quest", XP.quest]];
      if (q.months) parts.push(["Seasonal", XP.seasonal]);
      if (q.area === "cevre") parts.push(["Day trip", XP.far]);
      if (!seenRegion[q.cid]) { seenRegion[q.cid] = 1; parts.push(["New region", XP.region]); }
      var ak = q.cid + "/" + q.area;
      if (!seenArea[ak]) { seenArea[ak] = 1; parts.push(["New area", XP.area]); }
      if (e.note) parts.push(["Journal", XP.journal]);
      var w = weekOf(e.at), streak = 1;
      weeks[w] = 1;
      while (weeks[w - streak]) streak++;
      var sum = parts.reduce(function (s, p) { return s + p[1]; }, 0);
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
    var now = weekOf(Date.now()), streakNow = 0, start = weeks[now] ? now : weeks[now - 1] ? now - 1 : null;
    if (start !== null) { streakNow = 1; while (weeks[start - streakNow]) streakNow++; }
    var info = levelInfo(xp + bxp);
    info.xp = xp + bxp; info.badgeXp = bxp; info.badges = earned; info.attr = attr; info.gains = gains;
    info.streak = streakNow; info.thisWeek = !!weeks[now];
    info.regions = Object.keys(seenRegion).length; info.areas = Object.keys(seenArea).length;
    info.quests = log.filter(function (e) { return !e.preview; }).length;
    return info;
  }

  // ── Region switching ───────────────────────────────────────
  // Current region changes while you pan the map; the map itself never reloads.
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
  var map = null, mapLoading = false, mapReady = false, mePos = null, badgeCache = {};
  var REGIONS = window.REGIONS || {};

  function parseColor(s) {
    s = s.trim();
    var m, a = 1, rgb;
    if ((m = /^#([0-9a-f]{3,8})$/i.exec(s))) {
      var h = m[1];
      if (h.length < 6) h = h.split("").map(function (c) { return c + c; }).join("");
      rgb = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
      if (h.length === 8) a = parseInt(h.slice(6, 8), 16) / 255;
      return { rgb: rgb, a: a };
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
    h = ((h % 360) + 360) % 360 / 360;
    function f(t) {
      t = (t + 1) % 1;
      if (t < 1 / 6) return 6 * t; if (t < 1 / 2) return 1; if (t < 2 / 3) return (2 / 3 - t) * 6; return 0;
    }
    function ch(o) { var k = f(h + o); return Math.round(255 * (l + s * (k - 0.5) * (1 - Math.abs(2 * l - 1)) * 2)); }
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
    var hsl = rgbToHsl(c.rgb[0], c.rgb[1], c.rgb[2]);
    var l = 1 - hsl[2];
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
        // Our pins replace the basemap's own points of interest.
        if (/^poi|^housenumber/.test(l.id)) { l.layout = l.layout || {}; l.layout.visibility = "none"; }
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

  function pinImage(color, glyph, mode) {
    var S = 88, c = document.createElement("canvas");
    c.width = c.height = S;
    var g = c.getContext("2d");
    g.globalAlpha = mode === "off" ? 0.55 : 1;
    g.shadowColor = "rgba(15,23,42,.35)"; g.shadowBlur = 8; g.shadowOffsetY = 3;
    g.beginPath(); g.arc(S / 2, S / 2 - 2, 32, 0, 7);
    g.fillStyle = mode === "done" ? color : "#ffffff"; g.fill();
    g.shadowColor = "transparent";
    g.lineWidth = 7; g.strokeStyle = color; g.stroke();
    g.textAlign = "center"; g.textBaseline = "middle";
    if (mode === "done") { g.fillStyle = "#fff"; g.font = "800 34px system-ui, sans-serif"; g.fillText("✓", S / 2, S / 2); }
    else { g.font = "30px 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif"; g.fillText(glyph, S / 2, S / 2 + 2); }
    return g.getImageData(0, 0, S, S);
  }

  function badgeImage(color, pct, cur) {
    var S = 112, c = document.createElement("canvas");
    c.width = c.height = S;
    var g = c.getContext("2d"), m = S / 2, r = 36;
    g.shadowColor = "rgba(15,23,42,.38)"; g.shadowBlur = 10; g.shadowOffsetY = 3;
    g.beginPath(); g.arc(m, m, r + 9, 0, 7); g.fillStyle = cur ? color : "#ffffff"; g.fill();
    g.shadowColor = "transparent";
    g.beginPath(); g.arc(m, m, r + 2, 0, 7); g.fillStyle = "#ffffff"; g.fill();
    g.lineWidth = 9; g.strokeStyle = "#e5e7eb";
    g.beginPath(); g.arc(m, m, r - 6, 0, 7); g.stroke();
    if (pct > 0) {
      g.strokeStyle = color; g.lineCap = "round";
      g.beginPath(); g.arc(m, m, r - 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(pct, 3) / 100); g.stroke();
    }
    g.fillStyle = "#0f172a"; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = "800 22px system-ui, -apple-system, 'Segoe UI', sans-serif";
    g.fillText(pct + "%", m, m + 1);
    return g.getImageData(0, 0, S, S);
  }
  // Regions are lists of polygons; a polygon is a list of rings (outer first), a ring is [[lat, lng], ...].
  function regionsGeo() {
    var feats = [];
    Object.keys(REGIONS).forEach(function (id) {
      if (!cities[id]) return;
      var s = cityStats(id);
      REGIONS[id].forEach(function (poly) {
        var rings = poly.map(function (ring) {
          var pts = ring.map(function (p) { return [p[1], p[0]]; });
          pts.push(pts[0]);
          return pts;
        });
        feats.push({ type: "Feature", geometry: { type: "Polygon", coordinates: rings },
          properties: { id: id, name: cities[id].name, color: cities[id].color, op: 0.4 + 0.3 * s.pct / 100 } });
      });
    });
    return { type: "FeatureCollection", features: feats };
  }
  function badgePoints() {
    return { type: "FeatureCollection", features: Object.keys(cities).map(function (id) {
      return { type: "Feature", geometry: { type: "Point", coordinates: cityCenter(cities[id]) },
        properties: { id: id, name: cities[id].name, img: "rb-" + id + (id === cityId ? "-cur" : "") } };
    }) };
  }
  function meGeo() {
    return { type: "FeatureCollection", features: mePos ? [{ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: mePos } }] : [] };
  }
  function questsGeo() {
    var feats = [];
    allQuests.forEach(function (q) {
      var p = ll(q);
      if (!p) return;
      if (ui.cat !== "all" && q.cat !== ui.cat) return;
      if (ui.area !== "all" && (q.cid !== cityId || q.area !== ui.area)) return;
      var done = isDone(q);
      feats.push({ type: "Feature", geometry: { type: "Point", coordinates: [p[1], p[0]] },
        properties: { key: q.key, cat: q.cat, done: done ? 1 : 0, title: q.title,
          icon: "pin-" + q.cat + (done ? "-done" : inSeason(q) ? "" : "-off") } });
    });
    return { type: "FeatureCollection", features: feats };
  }
  function accent() { return getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#0e9f6e"; }

  function setupOverlays() {
    // Images
    Object.keys(CATS).forEach(function (c) {
      [["", "normal"], ["-done", "done"], ["-off", "off"]].forEach(function (m) {
        var id = "pin-" + c + m[0];
        if (map.hasImage(id)) map.removeImage(id);
        map.addImage(id, pinImage(CATS[c].color, CATS[c].icon, m[1]), { pixelRatio: 2 });
      });
    });
    var firstSymbol;
    map.getStyle().layers.some(function (l) { if (l.type === "symbol") { firstSymbol = l.id; return true; } });
    var ac = accent(), txt = theme() === "dark" ? "#f1f5f9" : "#0f172a", halo = theme() === "dark" ? "#171c26" : "#ffffff";

    badgeCache = {};
    map.addSource("regions", { type: "geojson", data: regionsGeo() });
    map.addLayer({ id: "region-fill", type: "fill", source: "regions", paint: {
      "fill-color": ["get", "color"],
      "fill-opacity": ["interpolate", ["linear"], ["zoom"], 6, ["get", "op"], 9.5, ["get", "op"], 11.5, ["*", ["get", "op"], 0.16], 13, 0.02] } }, firstSymbol);
    map.addLayer({ id: "region-hover", type: "fill", source: "regions", filter: ["==", ["get", "id"], ""], paint: {
      "fill-color": ["get", "color"], "fill-opacity": 0.3 } }, firstSymbol);
    map.addLayer({ id: "region-casing", type: "line", source: "regions", layout: { "line-join": "round" }, paint: {
      "line-color": "#ffffff", "line-opacity": 0.9, "line-blur": 0.6,
      "line-width": ["interpolate", ["linear"], ["zoom"], 6, 3.5, 12, 7] } }, firstSymbol);
    map.addLayer({ id: "region-line", type: "line", source: "regions", layout: { "line-join": "round" }, paint: {
      "line-color": ["get", "color"], "line-width": ["interpolate", ["linear"], ["zoom"], 6, 1.8, 12, 3] } }, firstSymbol);
    map.addLayer({ id: "region-cur", type: "line", source: "regions", layout: { "line-join": "round" }, filter: ["==", ["get", "id"], cityId], paint: {
      "line-color": ["get", "color"], "line-width": ["interpolate", ["linear"], ["zoom"], 6, 3.4, 12, 5.5] } }, firstSymbol);

    map.addSource("quests", { type: "geojson", data: questsGeo(), cluster: true, clusterMaxZoom: 13, clusterRadius: 46 });
    map.addLayer({ id: "done-glow", type: "circle", source: "quests", minzoom: 9,
      filter: ["all", ["!", ["has", "point_count"]], ["==", ["get", "done"], 1]],
      paint: { "circle-color": ac, "circle-opacity": 0.22, "circle-radius": ["interpolate", ["exponential", 2], ["zoom"], 9, 1.7, 18, 874] } });
    map.addLayer({ id: "clusters", type: "circle", source: "quests", minzoom: 9, filter: ["has", "point_count"], paint: {
      "circle-color": ac, "circle-opacity": 0.96, "circle-stroke-color": "#ffffff", "circle-stroke-width": 3,
      "circle-radius": ["step", ["get", "point_count"], 17, 8, 21, 25, 26, 60, 31] } });
    map.addLayer({ id: "cluster-count", type: "symbol", source: "quests", minzoom: 9, filter: ["has", "point_count"], layout: {
      "text-field": ["get", "point_count_abbreviated"], "text-font": ["Noto Sans Bold"], "text-size": 13, "text-allow-overlap": true },
      paint: { "text-color": "#ffffff" } });
    map.addLayer({ id: "pins", type: "symbol", source: "quests", minzoom: 9, filter: ["!", ["has", "point_count"]], layout: {
      "icon-image": ["get", "icon"], "icon-allow-overlap": true, "icon-ignore-placement": true,
      "icon-size": ["interpolate", ["linear"], ["zoom"], 9, 0.62, 14, 0.9, 17, 1.05] } });
    map.addLayer({ id: "pin-labels", type: "symbol", source: "quests", minzoom: 14.6, filter: ["!", ["has", "point_count"]], layout: {
      "text-field": ["get", "title"], "text-font": ["Noto Sans Bold"], "text-size": 12, "text-max-width": 9,
      "text-anchor": "top", "text-offset": [0, 1.35], "text-optional": true },
      paint: { "text-color": txt, "text-halo-color": halo, "text-halo-width": 2 } });

    map.addSource("sel", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
    map.addLayer({ id: "sel-ring", type: "circle", source: "sel", paint: {
      "circle-radius": 30, "circle-color": ac, "circle-opacity": 0.12, "circle-stroke-color": ac, "circle-stroke-width": 3 } });
    map.addSource("region-points", { type: "geojson", data: badgePoints() });
    map.addLayer({ id: "region-badges", type: "symbol", source: "region-points", maxzoom: OVERVIEW_ZOOM, layout: {
      "icon-image": ["get", "img"], "icon-allow-overlap": true, "icon-ignore-placement": true,
      "text-field": ["get", "name"], "text-font": ["Noto Sans Bold"], "text-size": 13, "text-anchor": "top", "text-offset": [0, 2.3],
      "text-allow-overlap": true, "text-ignore-placement": true },
      paint: { "text-color": "#0f172a", "text-halo-color": "#ffffff", "text-halo-width": 2.4 } });

    map.addSource("me", { type: "geojson", data: meGeo() });
    map.addLayer({ id: "me-halo", type: "circle", source: "me", paint: { "circle-radius": 22, "circle-color": "#2f7df6", "circle-opacity": 0.2 } });
    map.addLayer({ id: "me-dot", type: "circle", source: "me", paint: {
      "circle-radius": 8, "circle-color": "#2f7df6", "circle-stroke-color": "#ffffff", "circle-stroke-width": 3.5 } });
    mapReady = true;
    refreshMap();
  }

  // Region bubbles are drawn by the map itself (not DOM markers), so they stay put however the map is tilted or rotated.
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
    map.getSource("region-points").setData(badgePoints());
  }

  function ensureMap() {
    if (map || mapLoading) return;
    if (!window.maplibregl) { toast("Map library failed to load"); return; }
    mapLoading = true;
    loadStyle(theme()).then(function (style) {
      var pad = { top: 200, bottom: 100, left: 30, right: 30 };
      map = new maplibregl.Map({
        container: $map, style: style, attributionControl: false, maxPitch: 65, minZoom: 5.5, maxZoom: 19,
        bounds: [[city.bounds[0][1], city.bounds[0][0]], [city.bounds[1][1], city.bounds[1][0]]], fitBoundsOptions: { padding: pad }
      });
      map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");
      map.on("load", setupOverlays);
      map.on("moveend", onMove);
      map.on("click", onMapClick);
      map.on("mousemove", onMapHover);
      map.on("error", function (e) { if (e && e.error && /Failed to fetch|NetworkError/i.test(String(e.error.message))) mapLoading = false; });
    }).catch(function () { mapLoading = false; toast("The map needs an internet connection"); });
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
      if (id && id !== cityId) { setCurrent(id); return; }
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
      if (r) { setCity(r.properties.id, true); return; }
    }
    if (ui.open) closeSheet();
  }
  function onMapHover(e) {
    if (!mapReady) return;
    var onPin = map.queryRenderedFeatures(e.point, { layers: ["pins", "clusters", "region-badges"] }).length > 0;
    var r = !onPin && map.getZoom() < OVERVIEW_ZOOM ? map.queryRenderedFeatures(e.point, { layers: ["region-fill"] })[0] : null;
    map.getCanvas().style.cursor = onPin || r ? "pointer" : "";
    map.setFilter("region-hover", ["==", ["get", "id"], r ? r.properties.id : ""]);
  }
  function refreshMap() {
    if (!mapReady) return;
    map.getSource("quests").setData(questsGeo());
    map.getSource("regions").setData(regionsGeo());
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
  function setSelected(q) {
    if (!mapReady) return;
    var p = q && ll(q);
    map.getSource("sel").setData({ type: "FeatureCollection", features: p ? [{ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [p[1], p[0]] } }] : [] });
  }
  function focusQuest(q) {
    var p = ll(q);
    if (!map || !p) return;
    map.easeTo({ center: [p[1], p[0]], zoom: Math.max(map.getZoom(), 15.5), offset: [0, -Math.round(window.innerHeight * 0.17)], duration: 800 });
  }
  function flyToRegion() {
    if (!map) return;
    var b = city.bounds;
    map.fitBounds([[b[0][1], b[0][0]], [b[1][1], b[1][0]]], { padding: { top: 200, bottom: 100, left: 30, right: 30 }, duration: 1000, maxZoom: 15 });
  }
  function flyToArea() {
    if (!map) return;
    if (ui.area === "all") { flyToRegion(); return; }
    var pts = inArea(ui.area).map(ll).filter(Boolean);
    if (!pts.length) return;
    var b = new maplibregl.LngLatBounds();
    pts.forEach(function (p) { b.extend([p[1], p[0]]); });
    map.fitBounds(b, { padding: { top: 220, bottom: 140, left: 50, right: 50 }, duration: 900, maxZoom: 15.5 });
  }
  function showOverview() {
    if (!map) return;
    var b = new maplibregl.LngLatBounds();
    Object.keys(cities).forEach(function (id) { b.extend(cityCenter(cities[id])); });
    map.fitBounds(b, { padding: { top: 190, bottom: 110, left: 40, right: 40 }, duration: 1000, maxZoom: OVERVIEW_ZOOM - 0.6, pitch: 0, bearing: 0 });
  }
  function toggleTilt() {
    if (!map) return;
    var flat = map.getPitch() < 5;
    map.easeTo({ pitch: flat ? 58 : 0, bearing: flat ? map.getBearing() : 0, zoom: flat ? Math.max(map.getZoom(), 15) : map.getZoom(), duration: 800 });
  }
  function locate() {
    if (!map) return;
    if (!navigator.geolocation) { toast("Location is not supported on this device"); return; }
    toast("Finding you…");
    navigator.geolocation.getCurrentPosition(function (pos) {
      var p = [pos.coords.longitude, pos.coords.latitude];
      mePos = p;
      if (mapReady) map.getSource("me").setData(meGeo());
      map.flyTo({ center: p, zoom: Math.max(map.getZoom(), 15), duration: 1200 });
    }, function () { toast("Could not get your location. Check the location permission."); },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 });
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

  // ── Rendering ──────────────────────────────────────────────
  var $app = document.getElementById("app");
  var $sheet = document.getElementById("sheet");
  var $backdrop = document.getElementById("sheet-backdrop");
  var $toast = document.getElementById("toast");

  function ring(pct, big) {
    var C = 2 * Math.PI * 26;
    return '<div class="ring' + (big ? " big" : "") + '"><svg viewBox="0 0 64 64">' +
      '<circle class="track" cx="32" cy="32" r="26"/>' +
      '<circle class="bar" cx="32" cy="32" r="26" stroke-dasharray="' + C.toFixed(1) +
      '" stroke-dashoffset="' + (C * (1 - pct / 100)).toFixed(1) + '"/></svg><span>' + pct + '%</span></div>';
  }
  function bar(pct, cls) { return '<div class="meter' + (cls ? " " + cls : "") + '"><i style="width:' + pct + '%"></i></div>'; }
  function fmt(n) { return Number(n).toLocaleString("en-GB"); }
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
  function tabBtn(id, ic, label) {
    return '<button data-tab="' + id + '" class="' + (ui.tab === id ? "on" : "") + '"><span class="ic">' + ic + '</span>' + label + '</button>';
  }
  function head(title, sub, picker) {
    return '<header class="head"><h1>' + (picker ? '<button data-act="regions">' + esc(title) + ' <i>▾</i></button>' : esc(title)) +
      '</h1><p>' + esc(sub) + '</p></header>';
  }

  function render() {
    var onMap = ui.tab === "map", wasHidden = $map.hidden;
    $map.hidden = !onMap;
    var html = onMap ? renderMapUI() : ui.tab === "quests" ? renderQuests() : ui.tab === "badges" ? renderBadges() : renderHero();
    html += '<nav class="tabs">' + tabBtn("map", "🗺️", "Map") + tabBtn("quests", "📋", "Quests") +
      tabBtn("badges", "🏅", "Badges") + tabBtn("hero", "🧙", "Hero") + '</nav>';
    $app.innerHTML = html;
    document.body.classList.toggle("on-map", onMap);
    if (onMap) updateMap(wasHidden);
  }

  function renderMapUI() {
    var s = stats(city.quests), p = progress();
    return '<div class="map-top">' +
      '<div class="topcard glass">' +
        '<button class="lvl" data-tab="hero" aria-label="Your hero, level ' + p.level + '"><span>' + p.icon + '</span><b>' + p.level + '</b></button>' +
        '<div class="grow"><button class="tc-city" data-act="regions">' + esc(city.name) + ' <i>▾</i></button>' +
        '<div class="tc-sub">' + esc(p.title) + ' · ' + fmt(p.into) + ' / ' + fmt(p.need) + ' XP</div>' + bar(p.pct, "xp") + '</div>' +
        ring(s.pct) + '</div>' +
      '<div class="chips">' + catChips() + '</div>' +
      '<div class="chips">' + areaChips() + '</div>' +
      '</div>' +
      '<div class="mapctl">' +
        '<button class="glass" data-act="zoom-in" aria-label="Zoom in">+</button>' +
        '<button class="glass" data-act="zoom-out" aria-label="Zoom out">−</button>' +
        '<button class="glass" data-act="locate" aria-label="My location">◎</button>' +
        '<button class="glass t3d" data-act="tilt" aria-label="Tilt the map">3D</button>' +
        '<button class="glass" data-act="overview" aria-label="All regions">🌍</button>' +
      '</div>' +
      '<button class="fab" data-act="suggest">🎲 Surprise me</button>';
  }

  function listQuests() {
    return city.quests.filter(function (q) {
      if (ui.cat !== "all" && q.cat !== ui.cat) return false;
      if (ui.area !== "all" && q.area !== ui.area) return false;
      if (ui.show === "todo" && isDone(q)) return false;
      if (ui.show === "done" && !isDone(q)) return false;
      return true;
    });
  }
  function renderQuests() {
    var list = listQuests(), s = stats(city.quests);
    var html = head(city.name, s.done + " of " + s.total + " quests done · showing " + list.length, true) +
      '<div class="filters"><div class="chips">' + catChips() + '</div><div class="chips">' + areaChips() + '</div>' +
      '<div class="chips">' + chip("show", "todo", "To do") + chip("show", "done", "Done") + chip("show", "all", "All") + '</div></div>' +
      '<div class="list">';
    if (!list.length) {
      html += '<div class="empty">' + (ui.show === "done" ? "Nothing completed yet. Pick your first one!" : "Nothing left in this filter 🎉") + '</div>';
    }
    list.forEach(function (q) {
      var meta = city.areas[q.area] + (q.months ? " · " + (inSeason(q) ? "In season now" : "Season: " + seasonText(q)) : "");
      html += '<button class="card ' + q.cat + (isDone(q) ? " done" : "") + '" data-open="' + esc(q.key) + '">' +
        '<span class="tile">' + CATS[q.cat].icon + '</span>' +
        '<div class="body"><div class="t">' + esc(q.title) + '</div><div class="m">' + esc(meta) + '</div></div>' +
        '<span class="check' + (isDone(q) ? " on" : "") + '" data-toggle="' + esc(q.key) + '" role="checkbox" aria-checked="' + isDone(q) +
        '" aria-label="Done">✓</span></button>';
    });
    return html + '</div>';
  }

  function renderBadges() {
    var list = badges(city), groups = [], got = 0, all = 0, bx = 0;
    list.forEach(function (b) {
      got += b.tier; all += b.max; bx += badgeXp(b);
      if (groups.indexOf(b.group) === -1) groups.push(b.group);
    });
    var html = head("Badges", "Earn them in " + city.name + ". Every badge gives XP.", true) + '<div class="section">' +
      '<div class="panel score"><div><b>' + got + ' / ' + all + '</b><span>badges</span></div><div><b>' + fmt(bx) +
      '</b><span>XP from badges</span></div></div>';
    groups.forEach(function (g) {
      html += '<h2>' + esc(g) + '</h2><div class="badges">';
      list.filter(function (b) { return b.group === g; }).forEach(function (b) { html += badgeCard(b); });
      html += '</div>';
    });
    return html + '<p class="note">Bronze +100 XP · Silver +200 · Gold +400 · Special +150</p></div>';
  }
  function badgeCard(b) {
    var cls = !b.tier ? "locked" : b.max === 1 ? "gold" : TIERS[b.tier - 1].key;
    var stars = "";
    if (b.max > 1) for (var i = 0; i < b.max; i++) stars += i < b.tier ? "★" : "☆";
    var full = b.tier === b.max;
    var pct = full ? 100 : Math.round((b.have / b.goal) * 100);
    var next = b.max > 1 ? TIERS[b.tier] : { label: "Unlock", xp: SPECIAL_XP };
    return '<div class="bdg ' + cls + '"><div class="bi">' + b.icon + '</div>' +
      '<div class="bn">' + esc(b.name) + '</div>' +
      '<div class="bt">' + (stars ? stars + " " : "") + tierLabel(b) + '</div>' +
      '<div class="bd">' + esc(b.desc) + '</div>' + bar(pct) +
      '<div class="bp">' + (full ? "Complete" : b.have + " / " + b.goal + " · " + (b.max > 1 ? next.label + " " : "") + "+" + next.xp + " XP") + '</div></div>';
  }

  function renderHero() {
    var p = progress(), s = stats(city.quests), t = store.theme || "light", nRegions = Object.keys(cities).length;
    var next = Math.min(50, 10 * (p.thisWeek ? p.streak - 1 : p.streak));
    var html = head("Your hero", "Every quest you complete, anywhere, earns XP") + '<div class="section">' +
      '<div class="panel hero"><div class="avatar" style="--p:' + p.pct + '%"><span>' + p.icon + '</span></div>' +
        '<div class="grow"><div class="lv">Level ' + p.level + '</div><div class="ttl">' + esc(p.title) + '</div>' + bar(p.pct, "xp") +
        '<div class="ls">' + fmt(p.into) + ' / ' + fmt(p.need) + ' XP to level ' + (p.level + 1) + ' · ' + fmt(p.xp) + ' XP in total</div></div></div>' +
      '<div class="streak' + (p.streak ? " on" : "") + '">' + (p.streak
        ? "🔥 " + p.streak + "-week streak" + (next ? " · quests this week earn +" + next + "% XP" : "")
        : "Complete a quest this week to start a streak. Every week in a row adds +10% XP, up to +50%.") + '</div>' +
      '<div class="stats">' +
        '<div class="stat"><b>' + p.quests + '</b><span>Quests</span></div>' +
        '<div class="stat"><b>' + p.regions + '/' + nRegions + '</b><span>Regions</span></div>' +
        '<div class="stat"><b>' + p.areas + '</b><span>Areas found</span></div>' +
        '<div class="stat"><b>' + p.badges + '</b><span>Badges</span></div></div>' +
      '<h2>Attributes</h2><div class="panel">';
    ATTRS.forEach(function (a) {
      var x = p.attr[a.key], ai = attrInfo(x);
      html += '<div class="attr"><span class="ai">' + a.icon + '</span><div class="grow"><div class="an">' + a.name +
        ' <span>Lv ' + ai.level + '</span></div><small>' + a.desc + ' · ' + fmt(x) + ' XP</small>' + bar(ai.pct) + '</div></div>';
    });
    html += '</div><h2>Recent XP</h2><div class="panel">';
    var gains = p.gains.slice(-8).reverse();
    if (!gains.length) html += '<div class="note" style="margin:0">No XP yet. Your first quest also earns New region and New area bonuses.</div>';
    gains.forEach(function (g) {
      html += '<div class="gain"><div class="grow"><b>' + esc(g.q.title) + '</b><small>' +
        g.parts.map(function (x) { return esc(x[0]) + " +" + x[1]; }).join(" · ") + '</small></div><span>+' + g.xp + '</span></div>';
    });
    html += '</div><h2>How XP works</h2><div class="panel"><ul class="rules">' +
      '<li>Quest +' + XP.quest + ', seasonal quest +' + XP.seasonal + ', day trip outside the city +' + XP.far + '</li>' +
      '<li>First quest in a new region +' + XP.region + ', in a new area +' + XP.area + '</li>' +
      '<li>A note in your journal +' + XP.journal + '</li>' +
      '<li>Weekly streak: +10% per week in a row, up to +50%</li>' +
      '<li>Badges: Bronze +100, Silver +200, Gold +400, Special +150</li></ul></div>';

    html += '<h2>' + esc(city.name) + '</h2><div class="panel profile">' + ring(s.pct, true) + '<div class="grow"><div class="lvx">' +
      esc(levelFor(s.pct)) + '</div><div class="ls">' + s.done + ' / ' + s.total + ' quests · ' +
      (city.subtitle ? esc(city.subtitle) + ' · ' : '') + esc(city.country) + '</div></div></div><div class="panel" style="margin-top:10px">';
    Object.keys(CATS).forEach(function (c) {
      html += meterRow(CATS[c].icon + " " + CATS[c].label, stats(city.quests.filter(function (q) { return q.cat === c; })), c);
    });
    Object.keys(city.areas).forEach(function (a) { html += meterRow(city.areas[a], stats(inArea(a)), ""); });
    html += '</div><h2>All regions</h2><div class="panel">' + regionRows() + '</div>';
    html += '<h2>Appearance</h2><div class="panel"><div class="seg">' +
      ["light", "dark", "auto"].map(function (m) {
        return '<button class="' + (t === m ? "on" : "") + '" data-theme-set="' + m + '">' + m[0].toUpperCase() + m.slice(1) + '</button>';
      }).join("") + '</div></div>';
    return html + '<h2>Backup</h2><div class="panel">' +
      '<button class="btn ghost" data-act="export">Copy progress to clipboard</button>' +
      '<button class="btn ghost" data-act="import">Restore from backup</button>' +
      '<p class="note">Your progress is stored on this device only. Version ' + APP_VERSION + '</p></div></div>';
  }
  function regionRows() {
    var html = "", last = null;
    Object.keys(cities).forEach(function (id) {
      var c = cities[id], s = cityStats(id);
      if (c.country !== last) { html += '<div class="rgroup">' + esc(c.country) + '</div>'; last = c.country; }
      html += '<button class="rrow' + (id === cityId ? " cur" : "") + '" data-city="' + id + '">' +
        '<i class="dot big" style="background:' + c.color + '"></i>' +
        '<div class="grow"><div class="rn">' + esc(c.name) + ' <small>' + esc(c.subtitle || "") + '</small></div>' + bar(s.pct) + '</div>' +
        '<span class="rp">' + s.done + ' / ' + s.total + '</span></button>';
    });
    return html;
  }
  function openRegions() {
    closeSheetSilently();
    showSheet("regions", '<div class="cel-h">Choose a region</div>' + regionRows() +
      '<div class="actions"><button class="btn plain" data-act="close">Close</button></div>', true);
  }
  function meterRow(label, s, cls) {
    return '<div class="row ' + cls + '"><div class="row-h"><span>' + esc(label) + '</span><span>' + s.done + ' / ' + s.total + '</span></div>' +
      bar(s.pct) + '</div>';
  }

  // ── Quest card / sheet ─────────────────────────────────────
  // On the map the card floats above the nav bar so the map stays usable; elsewhere it is a modal bottom sheet.
  function showSheet(cls, html, modal) {
    var card = ui.tab === "map" && !modal;
    $sheet.className = cls + (card ? " mapcard" : "");
    $sheet.innerHTML = '<div class="grab"></div>' + html;
    $sheet.hidden = false; $backdrop.hidden = card;
    document.body.classList.toggle("card-open", card);
    $sheet.scrollTop = 0;
  }
  function closeSheetSilently() {
    saveNote();
    ui.open = null; $sheet.hidden = true; $backdrop.hidden = true;
    document.body.classList.remove("card-open");
  }
  function openQuest(q) {
    if (q.cid !== cityId) setCurrent(q.cid);
    openSheet(q.key);
  }
  function rewardHtml(q) {
    if (isDone(q)) {
      var g = progress().gains.filter(function (x) { return x.q === q; })[0];
      return g ? '<div class="reward done">✓ You earned +' + g.xp + ' XP here</div>' : "";
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
    var c = cities[q.cid], r = rec(q) || {};
    var tags = (q.tags || []).slice();
    if (q.months) tags.push("season: " + seasonText(q));
    var maps = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q.q || q.title + " " + c.name);
    showSheet(q.cat,
      '<button class="x" data-act="close" aria-label="Close">✕</button>' +
      '<div class="sh"><span class="tile">' + CATS[q.cat].icon + '</span><div class="grow">' +
        '<span class="badge">' + CATS[q.cat].label + " · " + esc(c.areas[q.area]) + '</span>' +
        '<h3>' + esc(q.title) + '</h3></div></div>' + rewardHtml(q) +
      '<div class="two">' +
        '<button class="btn' + (isDone(q) ? " ghost" : "") + '" data-act="toggle-open">' + (isDone(q) ? "✓ Done · undo" : "✓ I did it!") + '</button>' +
        '<a class="btn ghost" href="' + maps + '" target="_blank" rel="noopener">Directions</a></div>' +
      (tags.length ? '<div class="tags">' + tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join("") + '</div>' : "") +
      '<p>' + esc(q.desc) + '</p>' +
      (q.tip ? '<p class="tip"><b>Tip:</b> ' + esc(q.tip) + '</p>' : "") +
      (q.src && q.src.length ? '<p class="src">Sources: ' + q.src.map(function (u) {
        return '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(u.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]) + '</a>';
      }).join(" · ") + '</p>' : "") +
      '<label class="lbl" for="note">Journal' + (r.at ? " · done on " + new Date(r.at).toLocaleDateString("en-GB") : "") +
        ' <small>(+' + XP.journal + ' XP once the quest is done)</small></label>' +
      '<textarea id="note" placeholder="How was it? Who came along?">' + esc(r.note || "") + '</textarea>' +
      (ui.tab !== "map" && ll(q) ? '<div class="actions"><button class="btn ghost" data-act="to-map">Show on map</button></div>' : ""));
    if (ui.tab === "map") { setSelected(q); focusQuest(q); }
  }
  function closeSheet() {
    closeSheetSilently();
    setSelected(null);
    render();
  }
  function saveNote() {
    var el = document.getElementById("note");
    if (!el || !ui.open || $sheet.hidden) return;
    var k = ui.open, note = el.value.trim(), r = store.done[k];
    if (!r && !note) return;
    r = r || { at: 0 };
    if ((r.note || "") === note) return;
    r.note = note;
    if (!r.at && !note) delete store.done[k]; else store.done[k] = r;
    save();
  }
  // Marks a quest done or not done. Returns what was earned (null when undoing).
  function toggle(key) {
    var q = byKey[key];
    if (!q) return null;
    var c = cities[q.cid], r = store.done[key] || {};
    var before = progress(), beforeBadges = earnedKeys(badges(c));
    var nowDone = !r.at;
    r.at = nowDone ? Date.now() : 0;
    if (!r.at && !r.note) delete store.done[key]; else store.done[key] = r;
    save();
    if (!nowDone) return null;
    var after = progress();
    return {
      gained: after.xp - before.xp,
      fresh: badges(c).filter(function (b) { return b.tier && !beforeBadges[b.id + ":" + b.tier]; }),
      level: after.level > before.level ? after : null,
      newTitle: after.title !== before.title
    };
  }
  function reward(res) {
    if (!res) return;
    if (res.fresh.length || res.level) celebrate(res);
    else toast("+" + res.gained + " XP");
  }
  function celebrate(res) {
    closeSheetSilently();
    var html = "";
    if (res.level) {
      html += '<div class="levelup"><div class="burst">' + res.level.icon + '</div><div class="cel-h">Level up!</div>' +
        '<div class="lu">You reached level ' + res.level.level + (res.newTitle ? ' and earned the title <b>' + esc(res.level.title) + '</b>' : ' · ' + esc(res.level.title)) + '</div></div>';
    }
    if (res.fresh.length) {
      html += '<div class="cel-h' + (res.level ? " small" : "") + '">' + (res.fresh.length > 1 ? "New badges!" : "New badge!") + '</div>' +
        res.fresh.map(function (b) {
          var cls = b.max === 1 ? "gold" : TIERS[b.tier - 1].key;
          var xp = b.max === 1 ? SPECIAL_XP : TIERS[b.tier - 1].xp;
          return '<div class="cel ' + cls + '"><div class="bi">' + b.icon + '</div><div><div class="bn">' + esc(b.name) +
            (b.max > 1 ? " · " + TIERS[b.tier - 1].label : "") + '</div><div class="bd">' + esc(b.desc) + ' · +' + xp + ' XP</div></div></div>';
        }).join("");
    }
    html += '<p class="note center">+' + res.gained + ' XP in total</p>' +
      '<div class="actions"><button class="btn" data-act="close">Awesome!</button>' +
      (res.level ? '<button class="btn ghost" data-act="to-hero">See my hero</button>' : '<button class="btn ghost" data-act="to-badges">See my badges</button>') + '</div>';
    showSheet("celebrate", html, true);
  }
  function suggest() {
    var pool = city.quests.filter(function (q) { return !isDone(q) && inSeason(q); });
    var filtered = pool.filter(function (q) {
      return (ui.cat === "all" || q.cat === ui.cat) && (ui.area === "all" || q.area === ui.area);
    });
    if (filtered.length) pool = filtered;
    if (!pool.length) { toast("Nothing left to do here 🎉"); return; }
    openSheet(pool[Math.floor(Math.random() * pool.length)].key);
  }

  var toastTimer;
  function toast(msg) {
    $toast.textContent = msg; $toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { $toast.hidden = true; }, 2400);
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
      save(); render(); toast("Backup restored");
    } catch (e) { toast("Could not read the backup"); }
  }

  // ── Events ─────────────────────────────────────────────────
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-toggle],[data-open],[data-f],[data-tab],[data-act],[data-city],[data-theme-set]");
    if (!t) { if (e.target === $backdrop) closeSheet(); return; }
    var res;
    if (t.dataset.toggle) {
      e.stopPropagation();
      res = toggle(t.dataset.toggle); render(); reward(res);
      return;
    }
    if (t.dataset.themeSet) { store.theme = t.dataset.themeSet; save(); switchTheme(); render(); return; }
    if (t.dataset.open) { openSheet(t.dataset.open); return; }
    if (t.dataset.city) {
      closeSheetSilently();
      ui.tab = "map";
      setCity(t.dataset.city, true);
      return;
    }
    if (t.dataset.f) {
      ui[t.dataset.f] = t.dataset.v; render();
      if (ui.tab === "map" && t.dataset.f === "area") flyToArea();
      return;
    }
    if (t.dataset.tab) { closeSheetSilently(); ui.tab = t.dataset.tab; render(); window.scrollTo(0, 0); return; }
    switch (t.dataset.act) {
      case "suggest": suggest(); break;
      case "regions": openRegions(); break;
      case "overview": showOverview(); break;
      case "zoom-in": if (map) map.zoomIn(); break;
      case "zoom-out": if (map) map.zoomOut(); break;
      case "tilt": toggleTilt(); break;
      case "locate": locate(); break;
      case "close": closeSheet(); break;
      case "toggle-open":
        saveNote(); res = toggle(ui.open); closeSheet(); reward(res);
        break;
      case "to-badges": closeSheet(); ui.tab = "badges"; render(); window.scrollTo(0, 0); break;
      case "to-hero": closeSheet(); ui.tab = "hero"; render(); window.scrollTo(0, 0); break;
      case "to-map": {
        var q = byKey[ui.open];
        closeSheet(); ui.tab = "map"; ui.cat = "all"; ui.area = "all"; render();
        if (q) openSheet(q.key);
        break;
      }
      case "export": exportData(); break;
      case "import": importData(); break;
    }
  });
  // Android back button / Esc closes an open card (the Android shell calls this).
  window.cdBack = function () { if (!$sheet.hidden) { closeSheet(); return true; } return false; };
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") window.cdBack(); });
  window.addEventListener("pagehide", saveNote);
  window.cdMap = function () { return map; }; // for testing and debugging
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var onScheme = function () { if (store.theme === "auto") { switchTheme(); render(); } };
    if (mq.addEventListener) mq.addEventListener("change", onScheme);
  }

  applyTheme();
  render();

  // The Android shell manages its own offline copy; the service worker is for browsers only.
  var inShell = navigator.userAgent.indexOf("CityDiscoveryShell") !== -1;
  if (!inShell && "serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }
})();
