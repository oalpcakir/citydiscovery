# City Disco

A map-first app for (re)discovering the Netherlands and Belgium through quests: things to see, eat and drink, and do. Complete quests to earn XP, level up your hero and collect badges per region.

- **Live web app:** https://oalpcakir.github.io/citydiscovery/
- **Android:** a thin WebView shell that loads the web app, so publishing the website updates the app. Build the APK with `cd android && ./gradlew assembleDebug` (output in `android/app/build/outputs/apk/debug/`).

## How it fits together

| Path | What it is |
|---|---|
| `src/1-core.js` … `src/4-sheets.js` | The app's code in four parts (data and progression, map, screens, sheets). `python tools/build.py` joins them into `web/app.js`; edit the parts, not the built file. |
| `web/index.html`, `web/app.js`, `web/styles.css` | The page, the built app and its styles. |
| `web/icons.js` | The interface icons (Lucide, ISC licence). |
| `web/photos.js` | A cover photo per quest where a free one exists, from `tools/find_photos.py` (Wikipedia and Wikimedia Commons, with author and licence for the credit line). |
| `web/cities/<region>.js` | Quests for one region: areas, badges, level titles, coordinates and the quests themselves. |
| `web/regions.js` | Region outlines from `tools/rebuild_regions.py`: every Dutch municipality (CBS) and every Belgian arrondissement, German district and Luxembourg (Eurostat NUTS-3, 1:3 million) joins the hub city in `tools/hubs.json` that is fastest to reach by road in the same country (OSRM, cached in `tools/traveltimes.json`). Borders are fixed; content never moves them. Hubs without a region file yet show on the map as "coming soon" (`REGION_INFO`). |
| `web/vendor/` | MapLibre GL (vector map). Basemap tiles come from OpenFreeMap. |
| `content/*.json` | Raw output of the sourced research per region (new quests with source links, and proposed fixes). |
| `tools/` | `merge_content.py` adds research output to a region; `geocheck.py` + `geoapply.py` cross-check coordinates against OpenStreetMap; `rebuild_regions.py` regenerates the region outlines; `reassign_quests.py` moves quests to the region they fall in; `regions_io.py` reads and writes region files. |
| `web/cloud.js`, `web/firebase-config.js`, `firestore.rules` | Optional cloud save with Firebase (sign-in, sync of progress, profile and photos). Off until configured: see [docs/firebase-setup.md](docs/firebase-setup.md). |
| `web/moved.js` | Quests that moved region (old key to new key); the app migrates saved progress and photos. |
| `android/` | The Android shell (WebView, ETag-revalidated offline cache, location permission). |
| `.github/workflows/pages.yml` | Publishes `web/` to GitHub Pages on every push to `main`. |

## Progression

XP comes from quests (100, plus bonuses for seasonal quests, day trips, the first quest in a new region or area, journal notes, checking in on the spot, the quest of the day, and a weekly streak of up to +50%), from finishing trails (short walks the app builds from nearby quests, 200 XP each) and from badges. Everything is recomputed from the completion log stored in the browser's `localStorage`, so nothing can get out of sync.

## Adding content

1. Research quests into `content/<region>.json` (format in `tools/merge_content.py`).
2. `python tools/merge_content.py <region> content/<region>.json`
3. `python tools/geocheck.py web/cities/<region>.js > geo.txt` then `python tools/geoapply.py web/cities geo.txt`
4. Run `tools/reassign_quests.py` (needs `shapely`) to move any quest that falls in another region; it records moves in `web/moved.js`.
   To add a region, add a hub to `tools/hubs.json`, run `tools/rebuild_regions.py` (boundary files listed in its header) and `tools/build_countries.py`, then `tools/reassign_quests.py`.
   To fill a "coming soon" region, give its hub a `new` block (levels and areas) in `tools/hubs.json` and run `tools/reassign_quests.py`; it creates the empty region file.
5. Run `python tools/find_photos.py` to look up cover photos for the new quests (it only looks up quests it has not seen before).
6. Commit and push; the site and the app update within a minute.

## Keeping quests current

`python tools/validate.py` checks the quest data for mistakes a machine can find (missing fields, unknown areas, pins outside their region, duplicate ids, malformed photo entries); run it before publishing content.


`python tools/closedcheck.py > closed.txt` compares every eat & drink quest with OpenStreetMap (open, closed or no match nearby) and lists quests whose text mentions a year. The doubtful ones get checked by hand or by a researcher, and `python tools/apply_audit.py audit.json` removes the closed ones and applies text fixes (format in the script).
