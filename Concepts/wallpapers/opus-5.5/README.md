# Wallpapers for every look (Opus 5.5)

The wallpaper set and the Settings gallery of the PM7 wallpapers thread (pm-mail `pm7-wallpapers`, 2026-10-13), after
Jared's direction of 2026-10-11 ("add a setting in settings to change wallpapers ... The user should be able to choose
any wallpaper for their background ... Ribbon is default for the glass theme") and his review of 2026-10-13 ("5
options for wallpapers for the other themes each. All are selectable by any theme").

- **28 wallpapers, 56 prints.** Glass has 8 (Ribbons, the Glass default, with Prism and Orbs, plus the five of
  2026-10-13), drawn by pm7-liquid-glass. Basic, Friendly, Retro and NieR have 5 each, drawn here. Every wallpaper
  has a dark and a light print, and the look's mode picks the print.
- **One choice for every look:** "Look's own" (the default) or any wallpaper. The gallery is the row
  `setting-general.visual.wallpaper` in Settings > App & Input > Theme & colors.
- `CONTRACT.md` is how Glass and later owners add wallpapers, and how the choice reaches the page.

## The set

| Family | Wallpapers | Voice |
|---|---|---|
| Basic | Blueprint, Contour, Folds, Sheets, Arcs | Calm, work-first structure (drafting, survey lines, paper) at low contrast, with its detail at the edges |
| Friendly | Dot Wave, Channels, Bubbles, Hills, Soft Stripes | The DS, 3DS, Wii and Wii U menus, Cocoon and iiSU: soft rounded forms, pastel light, and the dot pattern in every one |
| Retro | Horizon, Peaks, Circuit, Dither, Stars | Phosphor (dark) and printed-manual (light) pixel art, drawn small and scaled up by whole pixels; square and stepped |
| NieR | City Ruins, The Bunker, Desert, Forest Castle, Amusement Park, Flooded City | NieR Mode's own six ink scenes, drawn from its scene art (`tools/nier_prints.mjs`), as faint as NieR Mode shows them (Jared #11, 2026-10-14; the five earlier prints left the catalog) |

All art is original and drawn in code from fixed seeds (`tools/art.js`). The references are mood, not material.

## Files

| Path | What |
|---|---|
| `catalog.d/<NN>-<family>.json` | The catalog, one fragment per owner. `10-glass.json` belongs to pm7-liquid-glass, and its images stay in `Concepts/liquid-glass/opus-5.5/src/walls/` |
| `src/walls/<id>-<dark\|light>.webp` | The 40 prints drawn here: 2560 x 1440 WebP, quality 0.84 (lossless for the pixel-art Retro set) |
| `src/thumbs/<id>-<dark\|light>.webp` | 320 x 180 thumbnails of all 56 prints, which the gallery shows instead of decoding the full images |
| `src/wallpapers.js` | The choice, its paint on `<html>` and the gallery (`window.PM_WALLPAPERS` is the test hook) |
| `src/wallpapers.css` | The paint in Basic, Friendly, Retro and NieR Mode, and the gallery |
| `tools/art.js`, `tools/walls.mjs` | The art and its driver: `node tools/walls.mjs [--cdp <endpoint>] [--only id,..] [--no-walls] [--sheet <png>]` |
| `tools/build_walls.py` | `--check` validates the catalog and every file. `--base <page> --out <page>` layers the set onto a page, outside `Concepts/` |
| `index.html`, `concept-hub.json` | The Concept Hub entry: a quiet shell over the chosen wallpaper in the Hub's look, the gallery, and every print |

## Building the review page

The review page is the published PMConcept7 with Glass and then the wallpapers on top, written to the share folder:

```
python3 Concepts/liquid-glass/opus-5.5/tools/build_proto.py --out /tmp/glass.html
python3 Concepts/wallpapers/opus-5.5/tools/build_walls.py --base /tmp/glass.html --out <share>/PMConcept7-Wallpapers-r1.html
```

The build reuses Glass's images that are already on the page, after checking that the bytes are the same, and adds
the rest. Nothing here edits PMConcept7, `glass.js`, `glass.css` or the Settings sources. The product wiring
(`general.visual.wallpaper`, saved with the other look settings, first paint, search, files instead of data URLs) is
proposed for its owners in `reports/pm7-all-look-wallpapers-20261013/OWNER-PROPOSAL.md`.
