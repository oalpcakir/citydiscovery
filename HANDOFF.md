# Parallel Engineering Handoff (v0.19.1)

Changes made while content generation was paused:
1. **Static Trail Routes (`tools/build_routes.py` -> `web/routes.js`)**: Precomputes walking paths for all trails so the live client does not hit `routing.openstreetmap.de` rate limits on launch. Run `python tools/build_routes.py` after adding or moving quests. Cached in `tools/trail_routes_cache.json`.
2. **Android Native Image Share (`MainActivity.java` + `src/4-sheets.js`)**: Added `CityDiscoAndroid.shareImage(base64DataUrl)` JavascriptInterface so the Explorer Card share button opens the native Android share sheet directly.
3. **Content Untouched**: Zero edits were made to `web/cities/*.js`, `content/*.json`, `web/photos.js`, or `web/moved.js`.
