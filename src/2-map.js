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
    DK: ["x", "#C8102E", "#FFFFFF", 12 / 37, 4 / 37, 12 / 28, 4 / 28], SE: ["x", "#006AA7", "#FECC00", 5 / 16, 2 / 16, 4 / 10, 2 / 10] };
  function flagImage(cc) {
    var W = 76, H = 52, c = document.createElement("canvas");
    c.width = W; c.height = H;
    var g = c.getContext("2d"), x = 4, y = 4, w = W - 8, h = H - 8;
    g.shadowColor = "rgba(15,23,42,.35)"; g.shadowBlur = 6; g.shadowOffsetY = 2;
    g.fillStyle = "#fff"; g.fillRect(x - 2, y - 2, w + 4, h + 4);
    g.shadowColor = "transparent";
    var f = FLAGS[cc] || FLAGS.NL, vertical = f[0] === "v";
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
  function questsGeo() {
    var feats = [];
    allQuests.forEach(function (q) {
      var p = ll(q);
      if (!p) return;
      if (ui.cat !== "all" && q.cat !== ui.cat) return;
      if (ui.area !== "all" && (q.cid !== cityId || q.area !== ui.area)) return;
      var done = isDone(q);
      if (ui.myMap && !done) return; // "My map": only the places you have done
      feats.push(point(p, { key: q.key, done: done ? 1 : 0, title: q.title, icon: "pin-" + q.cat + (done ? "-done" : inSeason(q) ? "" : "-off") }));
    });
    return fc(feats);
  }
  // ── Walking routes for trails ──
  // The real path along streets comes from the OpenStreetMap foot router (FOSSGIS) the first time a trail is shown,
  // and is kept on this device. Until then a trail is drawn with straight lines and its distance is an estimate.
  var ROUTE_KEY = "citydisco.routes.v1", routes = {}, routePending = {};
  try { routes = JSON.parse(localStorage.getItem(ROUTE_KEY) || "{}") || {}; } catch (e) { routes = {}; }
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
        routes[routeSig(t)] = { c: rt.geometry.coordinates.map(function (p) { return [Math.round(p[0] * 1e5) / 1e5, Math.round(p[1] * 1e5) / 1e5]; }),
          km: Math.round(rt.distance / 100) / 10, min: Math.round(rt.duration / 60) };
        try { localStorage.setItem(ROUTE_KEY, JSON.stringify(routes)); } catch (e) { /* storage full: keep it for this session */ }
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
      ["pulse", "circle-color"]].forEach(function (x) { map.setPaintProperty(x[0], x[1], ac); });
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

