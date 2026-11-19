// Network first, cache as fallback: always the latest version when online, the last one fetched when offline.
var CACHE = "citydiscovery-v78";
var CORE = ["./", "index.html", "styles.css", "app.js", "routes.js", "dishes.js", "cloud.js", "icons.js", "photos.js", "firebase-config.js", "cities/amsterdam.js", "cities/rotterdam.js", "cities/denhaag.js", "cities/utrecht.js", "cities/eindhoven.js", "cities/denbosch.js", "cities/breda.js", "cities/arnhem.js", "cities/maastricht.js", "cities/zwolle.js", "cities/enschede.js", "cities/groningen.js", "cities/leeuwarden.js", "cities/middelburg.js", "cities/brussel.js", "cities/antwerpen.js", "cities/gent.js", "cities/brugge.js", "cities/luik.js", "cities/leuven.js", "cities/mons.js", "cities/hasselt.js", "cities/namur.js", "cities/luxembourg.js", "cities/aachen.js", "cities/koeln.js", "cities/duesseldorf.js", "cities/trier.js", "cities/frankfurt.js", "cities/hamburg.js", "cities/oldenburg.js", "cities/bremen.js", "cities/kiel.js", "cities/luebeck.js", "cities/berlin.js", "cities/muenchen.js", "cities/paris.js", "cities/lille.js", "cities/boulogne.js", "cities/amiens.js", "cities/reims.js", "cities/strasbourg.js", "cities/lyon.js", "cities/nice.js", "cities/kobenhavn.js", "cities/odense.js", "cities/aarhus.js", "cities/ribe.js", "cities/aalborg.js", "cities/malmo.js", "cities/versailles.js", "cities/fontainebleau.js", "cities/colmar.js", "cities/mannheim.js", "cities/mainz.js", "cities/koblenz.js", "cities/bonn.js", "cities/kempten.js", "cities/rosenheim.js", "cities/potsdam.js", "cities/ankara.js", "cities/basel.js", "cities/bern.js", "cities/biarritz.js", "cities/bielefeld.js", "cities/bordeaux.js", "cities/braunschweig.js", "cities/caen.js", "cities/chemnitz.js", "cities/chur.js", "cities/dortmund.js", "cities/dresden.js", "cities/erfurt.js", "cities/essen.js", "cities/freiburg.js", "cities/geneve.js", "cities/grenoble.js", "cities/hannover.js", "cities/istanbul.js", "cities/izmir.js", "cities/karlsruhe.js", "cities/konstanz.js", "cities/lugano.js", "cities/luzern.js", "cities/marseille.js", "cities/muenster.js", "cities/nantes.js", "cities/nuernberg.js", "cities/regensburg.js", "cities/rennes.js", "cities/rouen.js", "cities/sauerland.js", "cities/stgallen.js", "cities/stuttgart.js", "cities/toulouse.js", "cities/tours.js", "cities/ulm.js", "cities/valais.js", "cities/wuerzburg.js", "cities/zuerich.js", "regions.js", "countries.js", "moved.js", "vendor/maplibre-gl.js", "vendor/maplibre-gl.css", "icon.svg", "favicon.svg", "icon-192.png", "fonts/bricolage-grotesque-latin.woff2", "privacy.html", "manifest.webmanifest"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

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
