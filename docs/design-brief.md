# City Disco: design brief for outside work

What to have a designer (or an image tool) make, in what order, and the prompt to give them. The brand rules live in [brand.md](brand.md); everything here has to sit inside them.

## The product in one paragraph

City Disco is a free, English-only web and Android app that turns 75 regions in nine European countries (the Netherlands, Belgium, Luxembourg, Germany, France, Denmark, Sweden, Switzerland, Türkiye) into a map you complete. You do quests (see, eat & drink, do), walk trails, tick off each region's must-eat dishes, earn XP, level up an explorer and collect badges. The map and search are plain and fast (the utility layer); the explorer screen, quest board, badges and completion moments feel like an indie game (the game layer). Audience: adults, locals who think they know their city and weekend visitors. It should feel like a modern travel magazine crossed with a light RPG, never like a children's game and never like a sterile SaaS dashboard.

## Fixed brand inputs (do not change)

| Role | Hex |
|---|---|
| Brand mint | `#0e9f6e` (text on light: `#047857`, tint `#dff5ec`) |
| Night ink (text, outlines) | `#0f1f2e` |
| Daylight background | `#f4f7f5`, cards `#ffffff` |
| Spark (XP, rewards) | `#ffc53d` (text `#9a6700`) |
| See (blue) | `#2f7cf6` |
| Eat & drink (orange) | `#f97316` |
| Do (purple) | `#9b5cf6` |
| Badge tiers | bronze `#c47a45`, silver `#94a3b8`, gold `#e0a800` |

- Logo: "Mirror Pin", a map pin whose head is a mint disco ball with a white facet grid and one spark-yellow tile, plus a four-point spark. Files in `web/icon.svg` and `docs/brand/`.
- Type: Bricolage Grotesque 600–800 for display, Inter or system UI for body.
- Icons in the UI: Lucide, 2 px stroke, round caps.
- Dark mode exists (`#141c21` ground), so every asset must read on both light and dark.

## What to make

| # | Asset | Count | Format and size | Priority | Where it goes |
|---|---|---|---|---|---|
| 1 | Logo polish: optically balanced Mirror Pin, wordmark converted to outlines, horizontal lockup (mark + "city disco"), mono version | 1 set | SVG | P0 | Desktop rail, welcome sheet, share cards, store |
| 2 | Play Store graphics: feature graphic, 5 phone screenshot frames with captions | 1 + 5 | PNG 1024×500, 1080×1920 | P0 | Store listing |
| 3 | Category fallback illustrations: See, Eat & drink, Do | 3 | SVG or WebP, 1200×800, safe crop to 16:9 and 1:1 | P1 | Quest cover when no photo exists (many quests), today's adventure card |
| 4 | Explorer avatars to replace emoji (backpack, bike, tulip, compass, cheese, owl, fox, lion, dragon, crown, unicorn: the unlock order) | 11 | Transparent WebP/PNG, 512×512, head-and-shoulders or object in a circle-safe area | P1 | Avatar on map card, explorer screen, share card |
| 5 | Class emblems: Scholar (See), Gourmand (Eat & drink), Daredevil (Do), Nomad (day trips) | 4 | SVG, 96×96 | P1 | Class pill, profile editor |
| 6 | Badge template: round badge with bronze, silver, gold and special frames around one centre symbol; locked state as a silhouette | 1 template, 4 frames | SVG | P1 | Badges screen, badge cabinet |
| 7 | Badge centre symbols: First Steps, Warm-up, Halfway There, All Corners, Local Palate, the three category badges | 8 | SVG, single-colour-friendly | P1 | Inside the badge template |
| 8 | Must-eat stamp frame: a passport-stamp ring that the dish emoji or a small dish drawing sits in (inked and blank states) | 1 | SVG | P1 | Must-eats strip on the quest board |
| 9 | Completion and level-up illustration: a short, celebratory spot illustration | 2 | SVG/Lottie under 60 KB | P1 | Quest complete sheet, level-up |
| 10 | Empty states: no quests in this filter, nothing saved yet, region coming soon | 3 | SVG, 320×200 | P2 | Lists |
| 11 | Region symbols: one landmark mark per region (Erasmus Bridge for Rotterdam, Dom tower for Utrecht, Anıtkabir for Ankara...) in one consistent line style | 75 | SVG, 128×128 | P2 | Region badge, region picker, share card. Avoid landmarks whose image rights are enforced (Atomium) |
| 12 | Share card template: level, region progress, avatar, logo | 1 | Figma frame, 1080×1350 | P2 | "Share card" button |

Keep asset count small and reusable: tiers change the frame, not the drawing; region symbols share one grid and stroke.

## Designer prompt

Copy this for a human designer or an image model. For an image model, add one asset line from the table at the end.

> Design assets for **City Disco**, a map app that turns European cities into a game: you complete quests (see, eat & drink, do), walk trails, eat each region's must-eat dishes, level up an explorer and collect badges. Art direction: **"Urban Adventure Club"**: modern city culture, travel stickers, passport stamps, enamel pins and a light RPG feel, aimed at adults. Think a modern travel magazine crossed with an indie adventure game; not a children's game, not an old treasure-map parchment look, not generic SaaS.
>
> Style: flat vector with confident shapes, 2 px rounded strokes in night ink `#0f1f2e`, limited fills, slight sticker or stamp texture allowed but no heavy grunge, no gradients except a soft mint-to-yellow glow for rewards. Palette is fixed: brand mint `#0e9f6e`, mint tint `#dff5ec`, spark yellow `#ffc53d` for rewards, daylight `#f4f7f5` and white backgrounds; category accents only where a category is meant: See `#2f7cf6`, Eat & drink `#f97316`, Do `#9b5cf6`; badge tiers bronze `#c47a45`, silver `#94a3b8`, gold `#e0a800`. Every asset must also read on a dark `#141c21` background.
>
> The logo is the existing "Mirror Pin" (a map pin whose head is a mint disco ball with a white facet grid and one yellow tile, plus a four-point spark); keep it and refine it, do not replace it. Headlines use Bricolage Grotesque ExtraBold. Characters are stylised, adult, diverse, with hats, bags and outfits that suggest city exploring; friendly, not cute. Landmarks are simplified line drawings, recognisable at 48 px. No text inside illustrations, no real brand logos, no copyrighted characters.
>
> Deliver SVG for logos, badges, stamps, emblems and region symbols; transparent WebP or PNG at 2x for characters and illustrations; one source file (Figma preferred) with components for badge frames and the stamp.
>
> Asset: _[one line from the table, e.g. "the Eat & drink category fallback illustration, 1200×800, a market stall with bread, cheese and a coffee cup, room for a title at the bottom left"]_
