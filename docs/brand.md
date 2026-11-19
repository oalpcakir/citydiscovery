# City Disco brand: Mirror Pin

The rules for how City Disco looks and sounds. Route A ("Mirror Pin") was chosen on 2026-11-18 from the three concepts in `docs/brand-routes.html`.

## Positioning and voice

- **Who it is for:** people who think they already know their city, and weekend visitors who want more than a top-10 list.
- **Promise:** seven countries turned into a map you complete, one quest at a time. It rewards doing, and always has a next thing to do.
- **Personality:** curious, upbeat, local, clear. The map comes first, decoration second.
- **Voice:** short, second person, concrete names and numbers. Excitement comes from the fact, not from exclamation marks.
  - Yes: "Climb the Domtoren. 465 steps, best view in Utrecht." / "Quest done. +40 XP, two to go for level 8."
  - No: "Embark on an unforgettable journey!" / "Congratulations!!! You are amazing!!!"
- English only, everywhere.

## The mark

A map pin whose head is a small disco ball (a mint ball with a white facet grid and one spark-yellow tile), plus a four-point spark at the top right. Discovery, plus a night out.

| File | Use |
|---|---|
| `web/icon.svg` | Main mark on a mint rounded square. Manifest "any" icon, welcome sheet. |
| `web/favicon.svg` | Small sizes (under ~48 px): no facet grid, so it stays crisp. Browser tab icon. |
| `web/icon-192.png`, `web/icon-512.png` | Rounded square on transparent, from `icon.svg`. |
| `web/icon-maskable-512.png` | Full-bleed mint, mark at 80 % so it survives any mask. |
| `web/apple-touch-icon.png` | 180 px, full-bleed (iOS rounds it). |
| `web/og.png` | 1200 × 630 link preview. |
| `docs/brand/icon-dark.svg`, `icon-maskable.svg` | Dark-ground version and maskable source. |
| `docs/brand/wordmark.svg`, `wordmark-dark.svg` | Wordmark with the font embedded. |
| `android/.../drawable/ic_launcher_fg.xml` | Adaptive-icon foreground, mark at 66 % inside the 66 dp safe zone, on `@color/accent` (mint). |
| `android/.../drawable/ic_launcher_mono.xml` | Android 13+ themed (monochrome) icon. |

All of these come from one script: change the geometry or colours in `tools/brand_assets.py` and run `python tools/brand_assets.py` (needs Chrome or Edge for the PNGs). The two Android XML files are hand-ported from the same paths; update them if the mark changes.

Rules:
- Keep clear space of at least the spark's width around the mark.
- Never recolour the pin to a category colour, stretch it, add shadows inside it, or put it on a busy photo.
- On light grounds: white pin on mint tile, or mint pin with a white ball (as on the map in `og.png`). On dark grounds use `icon-dark.svg` (mint pin on night ground).

## Wordmark

`city disco` in lowercase, Bricolage Grotesque ExtraBold (800), letter-spacing −3 %, with the spark at the top right after the final "o". Night ink on light, `#edf3f1` on dark. In running text the name is written "City Disco".

## Colour

Light first; dark is an option in Settings. Tokens live at the top of `web/styles.css`.

| Role | Token | Light | Dark |
|---|---|---|---|
| Background ("daylight") | `--bg` | `#f4f7f5` | `#141c21` |
| Card | `--card` | `#ffffff` | `#1e2a31` |
| Text ("night ink") | `--text` | `#0f1f2e` | `#edf3f1` |
| Secondary text | `--muted` | `#5a6b78` | `#9db0b8` |
| Lines | `--line` | `#e2e9e5` | `#2e3c45` |
| Brand mint | `--accent` | `#0e9f6e` | `#34d399` |
| Mint text | `--accent-ink` | `#047857` | `#6ee7b7` |
| Mint tint | `--accent-soft` | `#dff5ec` | `#173a30` |
| Spark (XP, rewards) | `--spark` | `#ffc53d` | `#ffd66b` |
| Spark text / tint | `--spark-ink` / `--spark-soft` | `#9a6700` / `#fff4d6` | `#ffd66b` / `#3a3016` |

Neutrals lean slightly green-blue toward the mint, never pure grey. Mint is the only colour for primary buttons and selected states. Spark is reserved for XP, level-ups and rewards; never use it for body text on white (use `--spark-ink`).

### Quest categories

| Category | Token | Light | Dark | Icon |
|---|---|---|---|---|
| See | `--gor` | `#2f7cf6` | `#6aa5ff` | landmark |
| Eat & drink | `--ye` | `#f97316` | `#ffa15c` | utensils |
| Do | `--dene` | `#9b5cf6` | `#b794ff` | sparkles |

The light values are also in `CATS` in `src/1-core.js` (used for map dots). Category colours mark category only: chips, map dots, the small tag on a quest. They are never used for buttons or for the brand.

### XP, levels and badges

- XP bar and reward pills use `--grad`: accent into spark. It follows the unlocked accent, so it always ends warm.
- Level numbers, the hero title, page titles and big numbers use the display face (below).
- Badges: circle with a coloured ring (tier or accent), white or card-coloured centre, one Lucide icon or number in the middle. Locked badges use `--line` with a muted lock.

### Accent unlocks

Mint is the default. Ocean, Sunset, Berry, Royal and Gilded stay as level rewards and only replace `--accent`, `--accent-ink`, `--accent-soft` (and `--on-accent` in dark). They never change the logo, the category colours or the spark.

### Regions

Region colours (`web/regions.js`) are a fixed set of ten Tailwind-500 hues, used only for region outlines and the region dot. They sit next to the brand, not inside it: never use a region colour for buttons, text or the mark.

### Utility layer and game layer

The map, search, filters and quest details are the **utility layer**: plain cards, neutral surfaces, nothing that slows you down. The explorer screen, the quest board's feature card, the badge cabinet and the completion sheet are the **game layer**: same tokens, warmer surfaces.

- `--game` (a mint-to-spark tint over the card colour) and `--game-line` are for game-layer panels only. Never on the map or map controls.
- Quest types keep their own card shape rather than a rarity system: today's adventure is a large feature card (photo cover when there is one, spark "+50 bonus XP" pill), seasonal quests sit in the spark-edged strip, trails have a dashed route line and a spark XP pill.
- Numbers in stats and XP use tabular figures.
- The completion moment stays short (XP counts up in under a second, the level bar and region bar fill) and is closed with "Keep exploring".

### Words

Use: "Your explorer" (not profile or hero), "Today's adventure" (not quest of the day), "Explorer leveled up", "Uncharted territory" for a region with nothing done, "Your adventure list" for saved quests. Errors, sync, location and account deletion stay plain and literal.

## Typography

| Role | Face | Where |
|---|---|---|
| Display | **Bricolage Grotesque** 600–800, self-hosted at `web/fonts/bricolage-grotesque-latin.woff2` (latin subset, variable) | Wordmark, page titles, section headings, sheet titles, level names, big numbers (`--f-display`) |
| Body | **Inter** if installed, otherwise the system UI font (`--f-body`) | Everything else |

Both are SIL Open Font License. Bricolage is self-hosted so the app works offline and sends nothing to Google. Use the display face for short text only; never for paragraphs, buttons or chips. Headings use negative letter-spacing (−1 % to −3 %).

## Icons and avatars

Lucide icons (ISC licence), 2 px stroke, round caps. Emoji avatars stay. The welcome sheet shows the mark (`icon.svg`) instead of a generic pin.

## Outside help

- **Name check:** before any public launch, search "City Disco" in the EUIPO and Benelux (BOIP) trademark registers (classes 9 and 41) and on the Play Store.
- **Designer polish (optional):** a freelance logo designer can refine the hand-built mark (optical balance, outlined wordmark, store graphics) if the app grows.
- The wordmark SVG embeds the font file; converting it to outlines needs a font tool (for example fontTools or a vector editor).
