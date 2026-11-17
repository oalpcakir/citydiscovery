(function () {
  "use strict";

  var APP_VERSION = "0.1.0";
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
  var ui = { tab: "gorevler", cat: "all", area: "all", show: "todo", open: null };

  function key(q) { return cityId + "/" + q.id; }
  function rec(q) { return store.done[key(q)]; }
  function isDone(q) { var r = rec(q); return !!(r && r.at); }
  function inSeason(q) { return !q.months || q.months.indexOf(new Date().getMonth() + 1) !== -1; }
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
  function levelFor(pct) {
    var L = city.levels;
    return L[Math.min(L.length - 1, Math.floor((pct / 100) * (L.length - 1) + 0.0001))];
  }

  // ── Çizim ──────────────────────────────────────────────────
  var $app = document.getElementById("app");
  var $sheet = document.getElementById("sheet");
  var $backdrop = document.getElementById("sheet-backdrop");
  var $toast = document.getElementById("toast");

  function render() {
    var s = stats(city.quests);
    var C = 2 * Math.PI * 26;
    var html =
      '<header class="hero">' +
        '<div class="hero-top"><div class="grow">' +
          '<h1>' + esc(city.name) + '</h1>' +
          '<div class="sub">' + esc(city.subtitle || city.country || "") + '</div>' +
        '</div>' +
        '<div class="ring"><svg viewBox="0 0 64 64">' +
          '<circle class="track" cx="32" cy="32" r="26"/>' +
          '<circle class="bar" cx="32" cy="32" r="26" stroke-dasharray="' + C.toFixed(1) +
            '" stroke-dashoffset="' + (C * (1 - s.pct / 100)).toFixed(1) + '"/>' +
        '</svg><span>%' + s.pct + '</span></div></div>' +
        '<div class="level"><span>Seviye: <b>' + esc(levelFor(s.pct)) + '</b></span>' +
          '<span>' + s.done + ' / ' + s.total + ' görev</span></div>' +
        (ui.tab === "gorevler" ? '<button class="suggest" data-act="suggest">🎲 Bugün ne yapsam?</button>' : "") +
      '</header>';

    html += ui.tab === "gorevler" ? renderQuests() : renderProgress();

    html += '<nav class="tabs">' +
      tabBtn("gorevler", "🧭", "Görevler") + tabBtn("ilerleme", "🏆", "İlerleme") + '</nav>';
    $app.innerHTML = html;
  }
  function tabBtn(id, ic, label) {
    return '<button data-tab="' + id + '" class="' + (ui.tab === id ? "on" : "") + '"><span class="ic">' + ic + '</span>' + label + '</button>';
  }
  function chip(group, val, label, small) {
    return '<button class="chip' + (small ? " small" : "") + (ui[group] === val ? " on" : "") +
      '" data-f="' + group + '" data-v="' + val + '">' + esc(label) + '</button>';
  }

  function visibleQuests() {
    return city.quests.filter(function (q) {
      if (ui.cat !== "all" && q.cat !== ui.cat) return false;
      if (ui.area !== "all" && q.area !== ui.area) return false;
      if (ui.show === "todo" && isDone(q)) return false;
      if (ui.show === "done" && !isDone(q)) return false;
      return true;
    });
  }

  function renderQuests() {
    var html = '<div class="filters"><div class="chips">' + chip("cat", "all", "Hepsi");
    Object.keys(CATS).forEach(function (c) { html += chip("cat", c, CATS[c].icon + " " + CATS[c].label); });
    html += '</div><div class="chips">' + chip("area", "all", "Her yer", true);
    Object.keys(city.areas).forEach(function (a) { html += chip("area", a, city.areas[a], true); });
    html += '</div><div class="chips">' +
      chip("show", "todo", "Yapılacak", true) + chip("show", "done", "Yapıldı", true) + chip("show", "all", "Tümü", true) +
      '</div></div>';

    var list = visibleQuests();
    html += '<div class="count">' + list.length + ' görev</div><div class="list">';
    if (!list.length) {
      html += '<div class="empty">' + (ui.show === "done" ? "Henüz tamamlanan görev yok. İlkini seç!" : "Bu filtrede görev kalmadı 🎉") + '</div>';
    }
    list.forEach(function (q) {
      var meta = city.areas[q.area] + (q.months ? " · " + (inSeason(q) ? "Şimdi sezonu" : "Sezon: " + seasonText(q)) : "");
      html += '<button class="card ' + q.cat + (isDone(q) ? " done" : "") + '" data-open="' + q.id + '">' +
        '<div class="body"><div class="t">' + esc(q.title) + '</div><div class="m">' + CATS[q.cat].icon + " " + esc(meta) + '</div></div>' +
        '<span class="check' + (isDone(q) ? " on" : "") + '" data-toggle="' + q.id + '" role="checkbox" aria-checked="' + isDone(q) +
        '" aria-label="Tamamlandı">✓</span></button>';
    });
    return html + '</div>';
  }

  function renderProgress() {
    var html = '<div class="section"><h2>Kategoriler</h2><div class="panel">';
    Object.keys(CATS).forEach(function (c) {
      html += meterRow(CATS[c].icon + " " + CATS[c].label, stats(city.quests.filter(function (q) { return q.cat === c; })), c);
    });
    html += '</div><h2>Bölgeler</h2><div class="panel">';
    Object.keys(city.areas).forEach(function (a) {
      html += meterRow(city.areas[a], stats(city.quests.filter(function (q) { return q.area === a; })), "");
    });
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
    html += '</div><h2>Yedek</h2><div class="panel">' +
      '<button class="btn ghost" data-act="export">İlerlemeyi panoya kopyala</button>' +
      '<button class="btn ghost" data-act="import">Yedekten geri yükle</button>' +
      '<p class="note">İlerlemen sadece bu telefonda durur. Sürüm ' + APP_VERSION + '</p></div></div>';
    return html;
  }
  function meterRow(label, s, cls) {
    return '<div class="row ' + cls + '"><div class="row-h"><span>' + esc(label) + '</span><span>' + s.done + ' / ' + s.total + '</span></div>' +
      '<div class="meter"><i style="width:' + s.pct + '%"></i></div></div>';
  }

  // ── Görev detayı ───────────────────────────────────────────
  function openSheet(id) {
    var q = city.quests.filter(function (x) { return x.id === id; })[0];
    if (!q) return;
    ui.open = id;
    var r = rec(q) || {};
    var tags = (q.tags || []).slice();
    if (q.months) tags.push("sezon: " + seasonText(q));
    var maps = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q.q || q.title + " " + city.name);
    $sheet.className = q.cat;
    $sheet.innerHTML =
      '<div class="grab"></div>' +
      '<span class="badge">' + CATS[q.cat].icon + " " + CATS[q.cat].label + " · " + esc(city.areas[q.area]) + '</span>' +
      '<h3>' + esc(q.title) + '</h3>' +
      (tags.length ? '<div class="tags">' + tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join("") + '</div>' : "") +
      '<p>' + esc(q.desc) + '</p>' +
      (q.tip ? '<p class="tip"><b>İpucu:</b> ' + esc(q.tip) + '</p>' : "") +
      '<label class="lbl" for="note">Notun' + (r.at ? " · " + new Date(r.at).toLocaleDateString("tr-TR") + " tarihinde yapıldı" : "") + '</label>' +
      '<textarea id="note" placeholder="Nasıldı? Kiminle gittin?">' + esc(r.note || "") + '</textarea>' +
      '<div class="actions">' +
        '<button class="btn" data-act="toggle-open">' + (isDone(q) ? "Yapılmadı olarak işaretle" : "✓ Yaptım!") + '</button>' +
        '<a class="btn ghost" href="' + maps + '" target="_blank" rel="noopener">Haritada aç</a>' +
        '<button class="btn ghost" data-act="close">Kapat</button>' +
      '</div>';
    $sheet.hidden = false; $backdrop.hidden = false;
    $sheet.scrollTop = 0;
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
  function toggle(id) {
    var k = cityId + "/" + id, r = store.done[k] || {};
    var nowDone = !r.at;
    r.at = nowDone ? Date.now() : 0;
    if (!r.at && !r.note) delete store.done[k]; else store.done[k] = r;
    save();
    if (nowDone) {
      var s = stats(city.quests);
      toast(s.done === s.total ? "Hepsi tamam. Echte Rotterdammer! 🎉" : "Tamamlandı! " + s.done + " / " + s.total);
    }
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
    if (t.dataset.toggle) { e.stopPropagation(); toggle(t.dataset.toggle); render(); return; }
    if (t.dataset.open) { openSheet(t.dataset.open); return; }
    if (t.dataset.f) { ui[t.dataset.f] = t.dataset.v; render(); return; }
    if (t.dataset.tab) { ui.tab = t.dataset.tab; render(); window.scrollTo(0, 0); return; }
    switch (t.dataset.act) {
      case "suggest": suggest(); break;
      case "close": closeSheet(); break;
      case "toggle-open": saveNote(); toggle(ui.open); closeSheet(); break;
      case "export": exportData(); break;
      case "import": importData(); break;
    }
  });
  // Android geri tuşu / Esc: açık detayı kapat (kabuk bu fonksiyonu çağırır)
  window.cdBack = function () { if (ui.open) { closeSheet(); return true; } return false; };
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") window.cdBack(); });

  render();

  // Android kabuğu çevrimdışı kopyayı kendi yönetir; service worker sadece tarayıcıda gerekir.
  var inShell = navigator.userAgent.indexOf("CityDiscoveryShell") !== -1;
  if (!inShell && "serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }
})();
