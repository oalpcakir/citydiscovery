// Network first, cache as fallback: always the latest version when online, the last one fetched when offline.
var CACHE = "citydiscovery-v9";
var CORE = ["./", "index.html", "styles.css", "app.js", "cloud.js", "firebase-config.js", "cities/amsterdam.js", "cities/rotterdam.js", "cities/denhaag.js", "cities/utrecht.js", "cities/eindhoven.js", "cities/denbosch.js", "cities/breda.js", "cities/arnhem.js", "cities/maastricht.js", "cities/zwolle.js", "cities/enschede.js", "cities/groningen.js", "cities/leeuwarden.js", "cities/middelburg.js", "cities/brussel.js", "cities/antwerpen.js", "cities/gent.js", "cities/brugge.js", "cities/luik.js", "cities/leuven.js", "cities/mons.js", "cities/hasselt.js", "cities/namur.js", "regions.js", "countries.js", "moved.js", "vendor/maplibre-gl.js", "vendor/maplibre-gl.css", "icon.svg", "manifest.webmanifest"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req, { cache: "no-cache" }).then(function (res) {
      if (res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
      return res;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (hit) { return hit || caches.match("index.html"); });
    })
  );
});
