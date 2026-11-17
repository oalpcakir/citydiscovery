(function () {
  "use strict";

  var APP_VERSION = "0.6.0";
  var STORE_KEY = "citydiscovery.v1";
  var CATS = {
    gor: { label: "See", icon: "👀", color: "#3b82f6" },
    ye: { label: "Eat & drink", icon: "🍴", color: "#f97316" },
    dene: { label: "Do", icon: "✨", color: "#a855f7" }
  };
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var STYLE_LIGHT = "https://tiles.openfreemap.org/styles/liberty";
  var STYLE_DARK = "https://tiles.openfreemap.org/styles/positron"; // lightness-inverted at load time
  var REGION_COLORS = ["#f43f5e", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#14b8a6", "#ec4899",
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
    cities[id].color = REGION_COLORS[i % REGION_COLORS.length];
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

  // ── Badges and points ──────────────────────────────────────
  // Badges are never stored; they are recomputed from completed quests.
  var TIERS = [
    { key: "bronze", label: "Bronze", pts: 25 },
    { key: "silver", label: "Silver", pts: 50 },
    { key: "gold", label: "Gold", pts: 100 }
  ];
  var QUEST_PTS = 10, SPECIAL_PTS = 30;
  var CAT_BADGES = {
    gor: { icon: "👀", name: "Sightseer" },
    ye: { icon: "🍴", name: "Foodie" },
    dene: { icon: "✨", name: "Adventurer" }
  };

  function badges() {
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
    Object.keys(city.areas).forEach(function (a) {
      var meta = (city.areaBadges && city.areaBadges[a]) || { icon: "📍", name: city.areas[a] };
      tiered("area-" + a, "Areas", meta, inArea(a), city.areas[a] + " quests");
    });
    Object.keys(CATS).forEach(function (c) {
      tiered("cat-" + c, "Categories", CAT_BADGES[c], city.quests.filter(function (q) { return q.cat === c; }), CATS[c].label + " quests");
    });
    var done = city.quests.filter(isDone), perDay = {}, bestDay = 0;
    done.forEach(function (q) {
      var d = new Date(rec(q).at).toDateString();
      perDay[d] = (perDay[d] || 0) + 1;
      if (perDay[d] > bestDay) bestDay = perDay[d];
    });
    var areaKeys = Object.keys(city.areas);
    var touched = areaKeys.filter(function (a) { return done.some(function (q) { return q.area === a; }); }).length;
    var notes = city.quests.filter(function (q) { var r = rec(q); return r && r.note; }).length;
    single("first", "👣", "First Steps", "Complete your first quest", done.length, 1);
    single("ten", "🔟", "Warm-up", "Complete 10 quests", done.length, Math.min(10, city.quests.length));
    single("half", "🧭", "Halfway There", "Complete half of all quests", done.length, Math.ceil(city.quests.length / 2));
    single("everywhere", "🗺️", "All Corners", "Complete a quest in every area", touched, areaKeys.length);
    single("fullday", "⚡", "Packed Day", "Complete 3 quests in one day", bestDay, 3);
    single("season", "🍂", "Season Hunter", "Complete 3 seasonal quests", done.filter(function (q) { return q.months; }).length, 3);
    single("diary", "📓", "Diary Keeper", "Write notes on 5 quests", notes, 5);
    single("all", "👑", city.levels[city.levels.length - 1], "Complete every quest", done.length, city.quests.length);
    return out;
  }
  function earnedKeys(list) {
    var keys = {};
    list.forEach(function (b) { for (var t = 1; t <= b.tier; t++) keys[b.id + ":" + t] = true; });
    return keys;
  }
  function tierLabel(b) { return !b.tier ? "Locked" : b.max === 1 ? "Unlocked" : TIERS[b.tier - 1].label; }
  function points() {
    var p = city.quests.filter(isDone).length * QUEST_PTS;
    badges().forEach(function (b) {
      if (b.max === 1) p += b.tier * SPECIAL_PTS;
      else for (var t = 0; t < b.tier; t++) p += TIERS[t].pts;
    });
    return p;
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
  var map = null, mapLoading = false, mapReady = false, meMarker = null, regionMarkers = {};
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

  function regionsGeo() {
    var feats = [];
    Object.keys(REGIONS).forEach(function (id) {
      if (!cities[id]) return;
      var s = cityStats(id);
      REGIONS[id].forEach(function (ring) {
        var pts = ring.map(function (p) { return [p[1], p[0]]; });
        pts.push(pts[0]);
        feats.push({ type: "Feature", geometry: { type: "Polygon", coordinates: [pts] },
          properties: { id: id, name: cities[id].name, color: cities[id].color, op: 0.2 + 0.4 * s.pct / 100 } });
      });
    });
    return { type: "FeatureCollection", features: feats };
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

    map.addSource("regions", { type: "geojson", data: regionsGeo() });
    map.addLayer({ id: "region-fill", type: "fill", source: "regions", paint: {
      "fill-color": ["get", "color"],
      "fill-opacity": ["interpolate", ["linear"], ["zoom"], 7, ["get", "op"], 10, ["*", ["get", "op"], 0.35], 12.5, 0.03] } }, firstSymbol);
    map.addLayer({ id: "region-hover", type: "fill", source: "regions", filter: ["==", ["get", "id"], ""], paint: {
      "fill-color": ["get", "color"], "fill-opacity": 0.35 } }, firstSymbol);
    map.addLayer({ id: "region-line", type: "line", source: "regions", paint: {
      "line-color": ["get", "color"], "line-width": 1.6,
      "line-opacity": ["interpolate", ["linear"], ["zoom"], 8, 0.9, 13, 0.3] } }, firstSymbol);
    map.addLayer({ id: "region-cur", type: "line", source: "regions", filter: ["==", ["get", "id"], cityId], paint: {
      "line-color": ["get", "color"], "line-width": 3.2, "line-opacity": 0.95 } }, firstSymbol);

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
    mapReady = true;
    refreshMap();
  }

  function createRegionMarkers() {
    Object.keys(cities).forEach(function (id) {
      var el = document.createElement("div");
      el.className = "rb";
      el.addEventListener("click", function (e) { e.stopPropagation(); setCity(id, true); });
      regionMarkers[id] = { el: el, marker: new maplibregl.Marker({ element: el, anchor: "center" }).setLngLat(cityCenter(cities[id])).addTo(map) };
    });
  }
  function refreshRegionMarkers() {
    Object.keys(regionMarkers).forEach(function (id) {
      var s = cityStats(id), el = regionMarkers[id].el;
      el.className = "rb" + (id === cityId ? " cur" : "");
      el.innerHTML = '<b style="--p:' + s.pct + '%;--c:' + cities[id].color + '"><i>' + s.pct + '%</i></b><span>' + esc(cities[id].name) + '</span>';
    });
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
      map.on("load", function () { setupOverlays(); createRegionMarkers(); refreshRegionMarkers(); onZoom(); });
      map.on("zoom", onZoom);
      map.on("moveend", onMove);
      map.on("click", onMapClick);
      map.on("mousemove", onMapHover);
      map.on("error", function (e) { if (e && e.error && /Failed to fetch|NetworkError/i.test(String(e.error.message))) mapLoading = false; });
    }).catch(function () { mapLoading = false; toast("The map needs an internet connection"); });
  }
  function onZoom() {
    if (!map) return;
    $map.classList.toggle("overview", map.getZoom() < OVERVIEW_ZOOM);
  }
  function regionAt(lng, lat) {
    var found = null;
    Object.keys(REGIONS).some(function (id) {
      return REGIONS[id].some(function (ring) {
        var inside = false;
        for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
          var yi = ring[i][0], xi = ring[i][1], yj = ring[j][0], xj = ring[j][1];
          if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
        }
        if (inside) found = id;
        return inside;
      });
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
    var hit = map.queryRenderedFeatures(e.point, { layers: ["pins", "clusters"] })[0];
    if (hit && hit.layer.id === "pins") { var q = byKey[hit.properties.key]; if (q) openQuest(q); return; }
    if (hit) {
      map.getSource("quests").getClusterExpansionZoom(hit.properties.cluster_id).then(function (z) {
        map.easeTo({ center: hit.geometry.coordinates, zoom: Math.min(z + 0.2, 17) });
      });
      return;
    }
    if (map.getZoom() < OVERVIEW_ZOOM + 1.5) {
      var r = map.queryRenderedFeatures(e.point, { layers: ["region-fill"] })[0];
      if (r) { setCity(r.properties.id, true); return; }
    }
    if (ui.open) closeSheet();
  }
  function onMapHover(e) {
    if (!mapReady) return;
    var onPin = map.queryRenderedFeatures(e.point, { layers: ["pins", "clusters"] }).length > 0;
    var r = !onPin && map.getZoom() < OVERVIEW_ZOOM + 1.5 ? map.queryRenderedFeatures(e.point, { layers: ["region-fill"] })[0] : null;
    map.getCanvas().style.cursor = onPin || r ? "pointer" : "";
    map.setFilter("region-hover", ["==", ["get", "id"], r ? r.properties.id : ""]);
  }
  function refreshMap() {
    if (!mapReady) return;
    map.getSource("quests").setData(questsGeo());
    map.getSource("regions").setData(regionsGeo());
    map.setFilter("region-cur", ["==", ["get", "id"], cityId]);
    refreshRegionMarkers();
  }
  function updateMap() {
    ensureMap();
    if (!map) return;
    map.resize();
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
      if (meMarker) meMarker.setLngLat(p);
      else {
        var el = document.createElement("div"); el.className = "me";
        meMarker = new maplibregl.Marker({ element: el }).setLngLat(p).addTo(map);
      }
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
    var onMap = ui.tab === "map";
    $map.hidden = !onMap;
    var html = onMap ? renderMapUI() : ui.tab === "quests" ? renderQuests() : ui.tab === "badges" ? renderBadges() : renderProfile();
    html += '<nav class="tabs">' + tabBtn("map", "🗺️", "Map") + tabBtn("quests", "📋", "Quests") +
      tabBtn("badges", "🏅", "Badges") + tabBtn("profile", "🏆", "Profile") + '</nav>';
    $app.innerHTML = html;
    document.body.classList.toggle("on-map", onMap);
    if (onMap) updateMap();
  }

  function renderMapUI() {
    var s = stats(city.quests);
    return '<div class="map-top">' +
      '<div class="topcard glass"><div class="grow"><button class="tc-city" data-act="regions">' + esc(city.name) + ' <i>▾</i></button>' +
        '<div class="tc-sub">' + s.done + ' / ' + s.total + ' quests · ' + points() + ' pts · ' + esc(levelFor(s.pct)) + '</div></div>' +
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
    var list = listQuests();
    var html = head(city.name, list.length + " quests", true) +
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
    var list = badges(), groups = [], got = 0, all = 0;
    list.forEach(function (b) {
      got += b.tier; all += b.max;
      if (groups.indexOf(b.group) === -1) groups.push(b.group);
    });
    var html = head("Badges", "Complete areas and categories in " + city.name, true) + '<div class="section">' +
      '<div class="panel score"><div><b>' + points() + '</b><span>points</span></div><div><b>' + got + ' / ' + all +
      '</b><span>badges</span></div></div>';
    groups.forEach(function (g) {
      html += '<h2>' + esc(g) + '</h2><div class="badges">';
      list.filter(function (b) { return b.group === g; }).forEach(function (b) { html += badgeCard(b); });
      html += '</div>';
    });
    return html + '<p class="note">Quest 10 pts · Bronze 25 · Silver 50 · Gold 100 · Special badge 30</p></div>';
  }
  function badgeCard(b) {
    var cls = !b.tier ? "locked" : b.max === 1 ? "gold" : TIERS[b.tier - 1].key;
    var stars = "";
    if (b.max > 1) for (var i = 0; i < b.max; i++) stars += i < b.tier ? "★" : "☆";
    var full = b.tier === b.max;
    var pct = full ? 100 : Math.round((b.have / b.goal) * 100);
    return '<div class="bdg ' + cls + '"><div class="bi">' + b.icon + '</div>' +
      '<div class="bn">' + esc(b.name) + '</div>' +
      '<div class="bt">' + (stars ? stars + " " : "") + tierLabel(b) + '</div>' +
      '<div class="bd">' + esc(b.desc) + '</div>' +
      '<div class="meter"><i style="width:' + pct + '%"></i></div>' +
      '<div class="bp">' + (full ? "Complete" : b.have + " / " + b.goal +
        (b.max > 1 ? " · next: " + TIERS[b.tier].label : "")) + '</div></div>';
  }

  function renderProfile() {
    var s = stats(city.quests), t = store.theme || "light";
    var html = head(city.name, (city.subtitle ? city.subtitle + " · " : "") + city.country, true) + '<div class="section">' +
      '<div class="panel profile">' + ring(s.pct, true) + '<div class="grow"><div class="lv">' + esc(levelFor(s.pct)) + '</div>' +
      '<div class="ls">' + s.done + ' / ' + s.total + ' quests · ' + points() + ' pts</div></div></div>' +
      '<h2>Categories</h2><div class="panel">';
    Object.keys(CATS).forEach(function (c) {
      html += meterRow(CATS[c].icon + " " + CATS[c].label, stats(city.quests.filter(function (q) { return q.cat === c; })), c);
    });
    html += '</div><h2>' + esc(city.name) + ' areas</h2><div class="panel">';
    Object.keys(city.areas).forEach(function (a) { html += meterRow(city.areas[a], stats(inArea(a)), ""); });
    html += '</div><h2>All regions</h2><div class="panel">' + regionRows() + '</div>';

    var recent = city.quests.filter(isDone).sort(function (a, b) { return rec(b).at - rec(a).at; }).slice(0, 8);
    html += '<h2>Recently done</h2><div class="panel">';
    if (!recent.length) html += '<div class="note" style="margin:0">Nothing yet. Pick a quest for this weekend.</div>';
    else {
      html += '<div class="recent">';
      recent.forEach(function (q) {
        html += '<div><b>' + esc(q.title) + '</b><span>' + new Date(rec(q).at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + '</span></div>';
      });
      html += '</div>';
    }
    html += '</div><h2>Appearance</h2><div class="panel"><div class="seg">' +
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
        '<div class="grow"><div class="rn">' + esc(c.name) + ' <small>' + esc(c.subtitle || "") + '</small></div>' +
        '<div class="meter"><i style="width:' + s.pct + '%"></i></div></div>' +
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
      '<div class="meter"><i style="width:' + s.pct + '%"></i></div></div>';
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
    ui.open = null; $sheet.hidden = true; $backdrop.hidden = true;
    document.body.classList.remove("card-open");
  }
  function openQuest(q) {
    if (q.cid !== cityId) setCurrent(q.cid);
    openSheet(q.key);
  }
  function openSheet(key) {
    var q = byKey[key];
    if (!q) return;
    ui.open = key;
    var c = cities[q.cid], r = rec(q) || {};
    var tags = (q.tags || []).slice();
    if (q.months) tags.push("season: " + seasonText(q));
    var maps = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q.q || q.title + " " + c.name);
    showSheet(q.cat,
      '<button class="x" data-act="close" aria-label="Close">✕</button>' +
      '<div class="sh"><span class="tile">' + CATS[q.cat].icon + '</span><div class="grow">' +
        '<span class="badge">' + CATS[q.cat].label + " · " + esc(c.areas[q.area]) + '</span>' +
        '<h3>' + esc(q.title) + '</h3></div></div>' +
      '<div class="two">' +
        '<button class="btn' + (isDone(q) ? " ghost" : "") + '" data-act="toggle-open">' + (isDone(q) ? "✓ Done · undo" : "✓ I did it!") + '</button>' +
        '<a class="btn ghost" href="' + maps + '" target="_blank" rel="noopener">Directions</a></div>' +
      (tags.length ? '<div class="tags">' + tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join("") + '</div>' : "") +
      '<p>' + esc(q.desc) + '</p>' +
      (q.tip ? '<p class="tip"><b>Tip:</b> ' + esc(q.tip) + '</p>' : "") +
      (q.src && q.src.length ? '<p class="src">Sources: ' + q.src.map(function (u) {
        return '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(u.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]) + '</a>';
      }).join(" · ") + '</p>' : "") +
      '<label class="lbl" for="note">Your notes' + (r.at ? " · done on " + new Date(r.at).toLocaleDateString("en-GB") : "") + '</label>' +
      '<textarea id="note" placeholder="How was it? Who came along?">' + esc(r.note || "") + '</textarea>' +
      (ui.tab !== "map" && ll(q) ? '<div class="actions"><button class="btn ghost" data-act="to-map">Show on map</button></div>' : ""));
    if (ui.tab === "map") { setSelected(q); focusQuest(q); }
  }
  function closeSheet() {
    saveNote();
    closeSheetSilently();
    setSelected(null);
    render();
  }
  function saveNote() {
    var el = document.getElementById("note");
    if (!el || !ui.open) return;
    var k = ui.open, note = el.value.trim(), r = store.done[k];
    if (!r && !note) return;
    r = r || { at: 0 };
    r.note = note;
    if (!r.at && !note) delete store.done[k]; else store.done[k] = r;
    save();
  }
  // Returns newly earned badges (empty list if none).
  function toggle(key) {
    var r = store.done[key] || {};
    var before = earnedKeys(badges());
    var nowDone = !r.at;
    r.at = nowDone ? Date.now() : 0;
    if (!r.at && !r.note) delete store.done[key]; else store.done[key] = r;
    save();
    if (!nowDone) return [];
    var fresh = badges().filter(function (b) { return b.tier && !before[b.id + ":" + b.tier]; });
    if (!fresh.length) {
      var s = stats(city.quests);
      toast("+" + QUEST_PTS + " pts · " + s.done + " / " + s.total);
    }
    return fresh;
  }
  function celebrate(list) {
    closeSheetSilently();
    showSheet("celebrate", '<div class="cel-h">' + (list.length > 1 ? "New badges!" : "New badge!") + '</div>' +
      list.map(function (b) {
        var cls = b.max === 1 ? "gold" : TIERS[b.tier - 1].key;
        var pts = b.max === 1 ? SPECIAL_PTS : TIERS[b.tier - 1].pts;
        return '<div class="cel ' + cls + '"><div class="bi">' + b.icon + '</div><div><div class="bn">' + esc(b.name) +
          (b.max > 1 ? " · " + TIERS[b.tier - 1].label : "") + '</div><div class="bd">' + esc(b.desc) + ' · +' + pts + ' pts</div></div></div>';
      }).join("") +
      '<div class="actions"><button class="btn" data-act="close">Awesome!</button>' +
      '<button class="btn ghost" data-act="to-badges">See my badges</button></div>', true);
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
    var fresh;
    if (t.dataset.toggle) {
      e.stopPropagation();
      fresh = toggle(t.dataset.toggle); render();
      if (fresh.length) celebrate(fresh);
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
        saveNote(); fresh = toggle(ui.open); closeSheet();
        if (fresh.length) celebrate(fresh);
        break;
      case "to-badges": closeSheet(); ui.tab = "badges"; render(); window.scrollTo(0, 0); break;
      case "to-map": {
        var q = byKey[ui.open];
        closeSheet(); ui.tab = "map"; ui.cat = "all"; ui.area = "all"; render();
        if (q) { openSheet(q.key); }
        break;
      }
      case "export": exportData(); break;
      case "import": importData(); break;
    }
  });
  // Android back button / Esc closes an open card (the Android shell calls this).
  window.cdBack = function () { if (!$sheet.hidden) { closeSheet(); return true; } return false; };
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") window.cdBack(); });
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
