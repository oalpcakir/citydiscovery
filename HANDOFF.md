# Parallel Engineering Handoff (v0.19.1)

Changes made while content generation was paused:
1. **Static Trail Routes (`tools/build_routes.py` -> `web/routes.js`)**: Precomputes walking paths for all 350 trails so the live client makes zero external routing calls. Run `python tools/build_routes.py` after adding or moving quests. Cached in `tools/trail_routes_cache.json`.
2. **Offline Cache (`web/sw.js`)**: Added `routes.js` to `CORE`, bumped cache to `citydiscovery-v60`, and added stale cache cleanup on `activate`.
3. **Android Native Image Share (`MainActivity.java`, `AndroidManifest.xml`, `res/xml/file_paths.xml`, `src/4-sheets.js`)**: Added `CityDiscoAndroid.shareImage(base64DataUrl)` and `FileProvider` so the Explorer Card share button opens the native Android share sheet directly.
4. **Content Untouched**: Zero edits were made to `web/cities/*.js`, `content/*.json`, `web/photos.js`, or `web/moved.js`.
