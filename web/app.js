(function () {
  "use strict";

  var APP_VERSION = "0.3.0";
  var STORE_KEY = "citydiscovery.v1";
  var CATS = {
    gor: { label: "Görülecek", icon: "👁️" },
    ye: { label: "Yenilecek", icon: "🍴" },
    dene: { label: "Deneyim", icon: "✨" }
  };
  var MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

  // ── Kalıcı durum ───────────────────────────────────────────
  // { city: "rotterdam", done: { "<city>/<quest>": { at: ms, note: "" } } }
  var store = load();
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(STORE_KEY));
      if (s && typeof s === "object" && s.done) return s;
    } catch (e) { /* bozuk veri: sıfırdan başla */ }
    return { city: null, done: {} };
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { toast("Kaydedilemedi"); }
  }

  var cities = window.CITIES || {};
  var cityId = cities[store.city] ? store.city : Object.keys(cities)[0];
  var city = cities[cityId];

  // ── Geçici arayüz durumu ───────────────────────────────────
  var ui = { tab: "harita", cat: "all", area: "all", show: "todo", open: null };

  function key(q) { return cityId + "/" + q.id; }
  function rec(q) { return store.done[key(q)]; }
  function isDone(q) { var r = rec(q); return !!(r && r.at); }
  function inSeason(q) { return !q.months || q.months.indexOf(new Date().getMonth() + 1) !== -1; }
  function ll(q) { return city.coords && city.coords[q.id]; }
  function byId(id) { return city.quests.filter(function (x) { return x.id === id; })[0]; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function seasonText(q) {
    if (!q.months) return "";
    return q.months.map(function (m) { return MONTHS[m - 1]; }).join(", ");
  }
  function stats(list) {
    var d = list.filter(isDone).length;
    return { done: d, total: list.length, pct: list.length ? Math.round((d / list.length) * 100) : 0 };
  }
  function inArea(a) { return city.quests.filter(function (q) { return q.area === a; }); }
  function levelFor(pct) {
    var L = city.levels;
    return L[Math.min(L.length - 1, Math.floor((pct / 100) * (L.length - 1) + 0.0001))];
  }

  // ── Rozetler ve puan ───────────────────────────────────────
  // Rozetler kayıtlı tutulmaz, her seferinde tamamlanan görevlerden hesaplanır.
  var TIERS = [
    { key: "bronz", label: "Bronz", pts: 25 },
    { key: "gumus", label: "Gümüş", pts: 50 },
    { key: "altin", label: "Altın", pts: 100 }
  ];
  var QUEST_PTS = 10, SPECIAL_PTS = 30;
  var CAT_BADGES = {
    gor: { icon: "👁️", name: "Gözlemci" },
    ye: { icon: "🍴", name: "Gurme" },
    dene: { icon: "✨", name: "Maceraperest" }
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
      out.push({ id: id, group: "Özel", icon: icon, name: name, desc: desc, tier: have >= goal ? 1 : 0, max: 1,
        have: Math.min(have, goal), goal: goal });
    }

    Object.keys(city.areas).forEach(function (a) {
      var meta = (city.areaBadges && city.areaBadges[a]) || { icon: "📍", name: city.areas[a] };
      tiered("area-" + a, "Bölgeler", meta, inArea(a), city.areas[a] + " görevleri");
    });
    Object.keys(CATS).forEach(function (c) {
      tiered("cat-" + c, "Kategoriler", CAT_BADGES[c], city.quests.filter(function (q) { return q.cat === c; }), CATS[c].label + " görevleri");
    });

    var done = city.quests.filter(isDone);
    var perDay = {}, bestDay = 0;
    done.forEach(function (q) {
      var d = new Date(rec(q).at).toDateString();
      perDay[d] = (perDay[d] || 0) + 1;
      if (perDay[d] > bestDay) bestDay = perDay[d];
    });
    var areaKeys = Object.keys(city.areas);
    var areasTouched = areaKeys.filter(function (a) { return done.some(function (q) { return q.area === a; }); }).length;
    var notes = city.quests.filter(function (q) { var r = rec(q); return r && r.note; }).length;

    single("first", "👣", "İlk Adım", "İlk görevini tamamla", done.length, 1);
    single("ten", "🔟", "Isınma Turu", "10 görev tamamla", done.length, Math.min(10, city.quests.length));
    single("half", "🧭", "Yarı Yol", "Görevlerin yarısını tamamla", done.length, Math.ceil(city.quests.length / 2));
    single("everywhere", "🗺️", "Her Köşeden", "Her bölgeden en az bir görev", areasTouched, areaKeys.length);
    single("fullday", "⚡", "Dolu Dolu Gün", "Aynı gün 3 görev tamamla", bestDay, 3);
    single("season", "🍂", "Mevsim Avcısı", "3 mevsimlik görev tamamla", done.filter(function (q) { return q.months; }).length, 3);
    single("diary", "📓", "Günlük Tutan", "5 göreve not yaz", notes, 5);
    single("all", "👑", city.levels[city.levels.length - 1], "Bütün görevleri tamamla", done.length, city.quests.length);
    return out;
  }
  function earnedKeys(list) {
    var keys = {};
    list.forEach(function (b) { for (var t = 1; t <= b.tier; t++) keys[b.id + ":" + t] = true; });
    return keys;
  }
  function tierLabel(b) {
    if (!b.tier) return "Kilitli";
    return b.max === 1 ? "Kazanıldı" : TIERS[b.tier - 1].label;
  }
  function points() {
    var p = city.quests.filter(isDone).length * QUEST_PTS;
    badges().forEach(function (b) {
      if (b.max === 1) p += b.tier * SPECIAL_PTS;
      else for (var t = 0; t < b.tier; t++) p += TIERS[t].pts;
    });
    return p;
  }

  // ── Harita ─────────────────────────────────────────────────
  var $map = document.getElementById("map");
  var map = null, pinLayer = null, glowLayer = null;

  function ensureMap() {
    if (map || !window.L) return !!map;
    var dark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    map = L.map($map, { zoomControl: false, attributionControl: true, minZoom: 9, maxZoom: 18 });
    map.attributionControl.setPrefix(false);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/" + (dark ? "dark_all" : "light_all") + "/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd", maxZoom: 20,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);
    glowLayer = L.layerGroup().addTo(map);
    pinLayer = L.layerGroup().addTo(map);
    map.fitBounds(city.bounds);
    return true;
  }
  function mapQuests() {
    return city.quests.filter(function (q) {
      return ll(q) && (ui.cat === "all" || q.cat === ui.cat) && (ui.area === "all" || q.area === ui.area);
    });
  }
  function updateMap() {
    if (!ensureMap()) return;
    map.invalidateSize();
    pinLayer.clearLayers(); glowLayer.clearLayers();
    var accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#0b7a43";
    mapQuests().forEach(function (q) {
      var done = isDone(q);
      // Tamamlanan yerlerin çevresi haritada renklenir.
      if (done) L.circle(ll(q), { radius: 320, stroke: false, fillColor: accent, fillOpacity: 0.2, interactive: false }).addTo(glowLayer);
      var icon = L.divIcon({
        className: "", iconSize: [34, 34], iconAnchor: [17, 17],
        html: '<div class="pin ' + q.cat + (done ? " done" : "") + (!done && !inSeason(q) ? " off" : "") + '">' + (done ? "✓" : CATS[q.cat].icon) + '</div>'
      });
      L.marker(ll(q), { icon: icon, title: q.title, zIndexOffset: done ? 0 : 500 })
        .on("click", function () { openSheet(q.id); })
        .addTo(pinLayer);
    });
  }
  // Görevi, alttan açılan detay sayfasının üstünde kalacak şekilde ortalar.
  function focusQuest(q) {
    if (!map || !ll(q)) return;
    var z = Math.max(map.getZoom(), 15);
    var p = map.project(ll(q), z);
    p.y += map.getSize().y * 0.22;
    map.setView(map.unproject(p, z), z, { animate: true });
  }
  function flyToArea() {
    if (!map) return;
    if (ui.area === "all") { map.flyToBounds(city.bounds, { duration: 0.6 }); return; }
    var pts = inArea(ui.area).map(ll).filter(Boolean);
    if (pts.length) map.flyToBounds(L.latLngBounds(pts).pad(0.25), { duration: 0.6, maxZoom: 15 });
  }

  // ── Çizim ──────────────────────────────────────────────────
  var $app = document.getElementById("app");
  var $sheet = document.getElementById("sheet");
  var $backdrop = document.getElementById("sheet-backdrop");
  var $toast = document.getElementById("toast");

  function ring(pct, big) {
    var C = 2 * Math.PI * 26;
    return '<div class="ring' + (big ? " big" : "") + '"><svg viewBox="0 0 64 64">' +
      '<circle class="track" cx="32" cy="32" r="26"/>' +
      '<circle class="bar" cx="32" cy="32" r="26" stroke-dasharray="' + C.toFixed(1) +
      '" stroke-dashoffset="' + (C * (1 - pct / 100)).toFixed(1) + '"/></svg><span>%' + pct + '</span></div>';
  }
  function chip(group, val, label) {
    return '<button class="chip' + (ui[group] === val ? " on" : "") + '" data-f="' + group + '" data-v="' + val + '">' + label + '</button>';
  }
  function catChips() {
    var h = chip("cat", "all", "Hepsi");
    Object.keys(CATS).forEach(function (c) { h += chip("cat", c, CATS[c].icon + " " + CATS[c].label); });
    return h;
  }
  function areaChips() {
    var h = chip("area", "all", "Her yer");
    Object.keys(city.areas).forEach(function (a) {
      h += chip("area", a, esc(city.areas[a]) + " <small>%" + stats(inArea(a)).pct + "</small>");
    });
    return h;
  }
  function tabBtn(id, ic, label) {
    return '<button data-tab="' + id + '" class="' + (ui.tab === id ? "on" : "") + '"><span class="ic">' + ic + '</span>' + label + '</button>';
  }
  function head(title, sub) {
    return '<header class="head"><h1>' + esc(title) + '</h1><p>' + esc(sub) + '</p></header>';
  }

  function render() {
    var onMap = ui.tab === "harita";
    $map.hidden = !onMap;
    var html = onMap ? renderMapUI() : ui.tab === "gorevler" ? renderQuests() : ui.tab === "rozetler" ? renderBadges() : renderProfile();
    html += '<nav class="tabs">' + tabBtn("harita", "🗺️", "Harita") + tabBtn("gorevler", "📋", "Görevler") +
      tabBtn("rozetler", "🏅", "Rozetler") + tabBtn("profil", "🏆", "Profil") + '</nav>';
    $app.innerHTML = html;
    if (onMap) updateMap();
  }

  function renderMapUI() {
    var s = stats(city.quests);
    return '<div class="map-top">' +
      '<div class="topcard glass"><div class="grow"><div class="tc-city">' + esc(city.name) + '</div>' +
        '<div class="tc-sub">' + s.done + ' / ' + s.total + ' görev · ' + points() + ' puan · ' + esc(levelFor(s.pct)) + '</div></div>' +
        ring(s.pct) + '</div>' +
      '<div class="chips">' + catChips() + '</div>' +
      '<div class="chips">' + areaChips() + '</div>' +
      '</div>' +
      '<button class="fab" data-act="suggest">🎲 Bugün ne yapsam?</button>';
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
    var html = head("Görevler", list.length + " görev listeleniyor") +
      '<div class="filters"><div class="chips">' + catChips() + '</div><div class="chips">' + areaChips() + '</div>' +
      '<div class="chips">' + chip("show", "todo", "Yapılacak") + chip("show", "done", "Yapıldı") + chip("show", "all", "Tümü") + '</div></div>' +
      '<div class="list">';
    if (!list.length) {
      html += '<div class="empty">' + (ui.show === "done" ? "Henüz tamamlanan görev yok. İlkini seç!" : "Bu filtrede görev kalmadı 🎉") + '</div>';
    }
    list.forEach(function (q) {
      var meta = city.areas[q.area] + (q.months ? " · " + (inSeason(q) ? "Şimdi sezonu" : "Sezon: " + seasonText(q)) : "");
      html += '<button class="card ' + q.cat + (isDone(q) ? " done" : "") + '" data-open="' + q.id + '">' +
        '<span class="tile">' + CATS[q.cat].icon + '</span>' +
        '<div class="body"><div class="t">' + esc(q.title) + '</div><div class="m">' + esc(meta) + '</div></div>' +
        '<span class="check' + (isDone(q) ? " on" : "") + '" data-toggle="' + q.id + '" role="checkbox" aria-checked="' + isDone(q) +
        '" aria-label="Tamamlandı">✓</span></button>';
    });
    return html + '</div>';
  }

  function renderBadges() {
    var list = badges(), groups = [], got = 0, all = 0;
    list.forEach(function (b) {
      got += b.tier; all += b.max;
      if (groups.indexOf(b.group) === -1) groups.push(b.group);
    });
    var html = head("Rozetler", "Bölgeleri ve kategorileri tamamladıkça kazan") + '<div class="section">' +
      '<div class="panel score"><div><b>' + points() + '</b><span>puan</span></div><div><b>' + got + ' / ' + all +
      '</b><span>rozet</span></div></div>';
    groups.forEach(function (g) {
      html += '<h2>' + esc(g) + '</h2><div class="badges">';
      list.filter(function (b) { return b.group === g; }).forEach(function (b) { html += badgeCard(b); });
      html += '</div>';
    });
    return html + '<p class="note">Görev 10 puan · Bronz 25 · Gümüş 50 · Altın 100 · Özel rozet 30</p></div>';
  }
  function badgeCard(b) {
    var cls = !b.tier ? "locked" : b.max === 1 ? "altin" : TIERS[b.tier - 1].key;
    var stars = "";
    if (b.max > 1) for (var i = 0; i < b.max; i++) stars += i < b.tier ? "★" : "☆";
    var full = b.tier === b.max;
    var pct = full ? 100 : Math.round((b.have / b.goal) * 100);
    return '<div class="bdg ' + cls + '"><div class="bi">' + b.icon + '</div>' +
      '<div class="bn">' + esc(b.name) + '</div>' +
      '<div class="bt">' + (stars ? stars + " " : "") + tierLabel(b) + '</div>' +
      '<div class="bd">' + esc(b.desc) + '</div>' +
      '<div class="meter"><i style="width:' + pct + '%"></i></div>' +
      '<div class="bp">' + (full ? "Tamamlandı" : b.have + " / " + b.goal +
        (b.max > 1 ? " · sıradaki: " + TIERS[b.tier].label : "")) + '</div></div>';
  }

  function renderProfile() {
    var s = stats(city.quests);
    var html = head(city.name, (city.subtitle ? city.subtitle + " · " : "") + city.country) + '<div class="section">' +
      '<div class="panel profile">' + ring(s.pct, true) + '<div class="grow"><div class="lv">' + esc(levelFor(s.pct)) + '</div>' +
      '<div class="ls">' + s.done + ' / ' + s.total + ' görev · ' + points() + ' puan</div></div></div>' +
      '<h2>Kategoriler</h2><div class="panel">';
    Object.keys(CATS).forEach(function (c) {
      html += meterRow(CATS[c].icon + " " + CATS[c].label, stats(city.quests.filter(function (q) { return q.cat === c; })), c);
    });
    html += '</div><h2>Bölgeler</h2><div class="panel">';
    Object.keys(city.areas).forEach(function (a) { html += meterRow(city.areas[a], stats(inArea(a)), ""); });
    html += '</div>';

    var recent = city.quests.filter(isDone).sort(function (a, b) { return rec(b).at - rec(a).at; }).slice(0, 8);
    html += '<h2>Son yaptıkların</h2><div class="panel">';
    if (!recent.length) html += '<div class="note" style="margin:0">Henüz bir şey yok. Bu hafta sonu bir görev seç.</div>';
    else {
      html += '<div class="recent">';
      recent.forEach(function (q) {
        html += '<div><b>' + esc(q.title) + '</b><span>' + new Date(rec(q).at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }) + '</span></div>';
      });
      html += '</div>';
    }
    return html + '</div><h2>Yedek</h2><div class="panel">' +
      '<button class="btn ghost" data-act="export">İlerlemeyi panoya kopyala</button>' +
      '<button class="btn ghost" data-act="import">Yedekten geri yükle</button>' +
      '<p class="note">İlerlemen sadece bu cihazda durur. Sürüm ' + APP_VERSION + '</p></div></div>';
  }
  function meterRow(label, s, cls) {
    return '<div class="row ' + cls + '"><div class="row-h"><span>' + esc(label) + '</span><span>' + s.done + ' / ' + s.total + '</span></div>' +
      '<div class="meter"><i style="width:' + s.pct + '%"></i></div></div>';
  }

  // ── Görev detayı ───────────────────────────────────────────
  function showSheet(cls, html) {
    $sheet.className = cls;
    $sheet.innerHTML = '<div class="grab"></div>' + html;
    $sheet.hidden = false; $backdrop.hidden = false;
    $sheet.scrollTop = 0;
  }
  function openSheet(id) {
    var q = byId(id);
    if (!q) return;
    ui.open = id;
    var r = rec(q) || {};
    var tags = (q.tags || []).slice();
    if (q.months) tags.push("sezon: " + seasonText(q));
    var maps = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q.q || q.title + " " + city.name);
    showSheet(q.cat,
      '<div class="sh"><span class="tile">' + CATS[q.cat].icon + '</span><div class="grow">' +
        '<span class="badge">' + CATS[q.cat].label + " · " + esc(city.areas[q.area]) + '</span>' +
        '<h3>' + esc(q.title) + '</h3></div></div>' +
      (tags.length ? '<div class="tags">' + tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join("") + '</div>' : "") +
      '<p>' + esc(q.desc) + '</p>' +
      (q.tip ? '<p class="tip"><b>İpucu:</b> ' + esc(q.tip) + '</p>' : "") +
      '<label class="lbl" for="note">Notun' + (r.at ? " · " + new Date(r.at).toLocaleDateString("tr-TR") + " tarihinde yapıldı" : "") + '</label>' +
      '<textarea id="note" placeholder="Nasıldı? Kiminle gittin?">' + esc(r.note || "") + '</textarea>' +
      '<div class="actions">' +
        '<button class="btn" data-act="toggle-open">' + (isDone(q) ? "Yapılmadı olarak işaretle" : "✓ Yaptım!") + '</button>' +
        '<div class="two">' +
          (ui.tab !== "harita" && ll(q) ? '<button class="btn ghost" data-act="to-map">Haritada göster</button>' : "") +
          '<a class="btn ghost" href="' + maps + '" target="_blank" rel="noopener">Yol tarifi</a></div>' +
        '<button class="btn plain" data-act="close">Kapat</button>' +
      '</div>');
    if (ui.tab === "harita") focusQuest(q);
  }
  function closeSheet() {
    saveNote();
    ui.open = null;
    $sheet.hidden = true; $backdrop.hidden = true;
    render();
  }
  function saveNote() {
    var el = document.getElementById("note");
    if (!el || !ui.open) return;
    var k = cityId + "/" + ui.open, note = el.value.trim(), r = store.done[k];
    if (!r && !note) return;
    r = r || { at: 0 };
    r.note = note;
    if (!r.at && !note) delete store.done[k]; else store.done[k] = r;
    save();
  }
  // Yeni kazanılan rozetleri döndürür (yoksa boş liste).
  function toggle(id) {
    var k = cityId + "/" + id, r = store.done[k] || {};
    var before = earnedKeys(badges());
    var nowDone = !r.at;
    r.at = nowDone ? Date.now() : 0;
    if (!r.at && !r.note) delete store.done[k]; else store.done[k] = r;
    save();
    if (!nowDone) return [];
    // Aynı rozetin birden fazla kademesi birden açıldıysa sadece en yükseğini göster.
    var fresh = badges().filter(function (b) { return b.tier && !before[b.id + ":" + b.tier]; });
    if (!fresh.length) {
      var s = stats(city.quests);
      toast("+" + QUEST_PTS + " puan · " + s.done + " / " + s.total);
    }
    return fresh;
  }
  function celebrate(list) {
    ui.open = null;
    showSheet("celebrate", '<div class="cel-h">' + (list.length > 1 ? "Yeni rozetler!" : "Yeni rozet!") + '</div>' +
      list.map(function (b) {
        var cls = b.max === 1 ? "altin" : TIERS[b.tier - 1].key;
        var pts = b.max === 1 ? SPECIAL_PTS : TIERS[b.tier - 1].pts;
        return '<div class="cel ' + cls + '"><div class="bi">' + b.icon + '</div><div><div class="bn">' + esc(b.name) +
          (b.max > 1 ? " · " + TIERS[b.tier - 1].label : "") + '</div><div class="bd">' + esc(b.desc) + ' · +' + pts + ' puan</div></div></div>';
      }).join("") +
      '<div class="actions"><button class="btn" data-act="close">Harika!</button>' +
      '<button class="btn ghost" data-act="to-badges">Rozetlerime bak</button></div>');
  }
  function suggest() {
    var pool = city.quests.filter(function (q) { return !isDone(q) && inSeason(q); });
    var filtered = pool.filter(function (q) {
      return (ui.cat === "all" || q.cat === ui.cat) && (ui.area === "all" || q.area === ui.area);
    });
    if (filtered.length) pool = filtered;
    if (!pool.length) { toast("Yapılacak görev kalmadı 🎉"); return; }
    openSheet(pool[Math.floor(Math.random() * pool.length)].id);
  }

  var toastTimer;
  function toast(msg) {
    $toast.textContent = msg; $toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { $toast.hidden = true; }, 2200);
  }

  function exportData() {
    var text = JSON.stringify(store);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast("Panoya kopyalandı"); }, function () { prompt("Kopyala:", text); });
    } else prompt("Kopyala:", text);
  }
  function importData() {
    var text = prompt("Yedek metnini yapıştır:");
    if (!text) return;
    try {
      var s = JSON.parse(text);
      if (!s || typeof s.done !== "object") throw new Error("format");
      Object.keys(s.done).forEach(function (k) { store.done[k] = s.done[k]; });
      save(); render(); toast("Yedek yüklendi");
    } catch (e) { toast("Yedek okunamadı"); }
  }

  // ── Olaylar ────────────────────────────────────────────────
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-toggle],[data-open],[data-f],[data-tab],[data-act]");
    if (!t) { if (e.target === $backdrop) closeSheet(); return; }
    var fresh, q;
    if (t.dataset.toggle) {
      e.stopPropagation();
      fresh = toggle(t.dataset.toggle); render();
      if (fresh.length) celebrate(fresh);
      return;
    }
    if (t.dataset.open) { openSheet(t.dataset.open); return; }
    if (t.dataset.f) {
      ui[t.dataset.f] = t.dataset.v; render();
      if (ui.tab === "harita" && t.dataset.f === "area") flyToArea();
      return;
    }
    if (t.dataset.tab) { ui.tab = t.dataset.tab; render(); window.scrollTo(0, 0); return; }
    switch (t.dataset.act) {
      case "suggest": suggest(); break;
      case "close": closeSheet(); break;
      case "toggle-open":
        saveNote(); fresh = toggle(ui.open); closeSheet();
        if (fresh.length) celebrate(fresh);
        break;
      case "to-badges": closeSheet(); ui.tab = "rozetler"; render(); window.scrollTo(0, 0); break;
      case "to-map":
        q = byId(ui.open);
        closeSheet(); ui.tab = "harita"; ui.cat = "all"; ui.area = "all"; render();
        if (q) focusQuest(q);
        break;
      case "export": exportData(); break;
      case "import": importData(); break;
    }
  });
  // Android geri tuşu / Esc: açık detayı kapat (kabuk bu fonksiyonu çağırır)
  window.cdBack = function () { if (!$sheet.hidden) { closeSheet(); return true; } return false; };
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") window.cdBack(); });

  render();

  // Android kabuğu çevrimdışı kopyayı kendi yönetir; service worker sadece tarayıcıda gerekir.
  var inShell = navigator.userAgent.indexOf("CityDiscoveryShell") !== -1;
  if (!inShell && "serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }
})();
