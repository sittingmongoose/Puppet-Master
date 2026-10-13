# The wallpaper picker contract (pm7-wallpapers, 2026-10-13)

How Glass and any later owner add wallpapers so that every one sits in the same Settings gallery and works in every
look. It keeps the shape pm7-liquid-glass published on 2026-10-13 (`share/2026-10-13-glass-v3/PICKER-CONTRACT.md`):
the same saved key, the same `<html>` attributes and the same image variables, so `glass.js` and this package agree
while both are on a page. Nothing here is canon yet. The setting, its command and its wiring are proposed for their
owners in `reports/pm7-all-look-wallpapers-20261013/OWNER-PROPOSAL.md`.

## Add a wallpaper

1. Draw both prints, `<id>-dark.webp` and `<id>-light.webp`: 2560 x 1440 WebP, at most about 230 KB each (the build
   refuses anything over 235,520 bytes). Keep each print's detail toward the edges and its middle quiet: Basic,
   Friendly, Retro and NieR Mode cover the middle with opaque panels, and Glass frosts whatever is behind a sheet.
   Draw the dark print for dark looks and the light print for light looks, at the contrast the look's text needs.
2. Add an entry to your family's fragment in `catalog.d/`. One owner owns one fragment file, so two owners never edit
   the same file:

   ```json
   { "id": "aurora", "name": "Aurora", "description": "One line, shown when the pointer rests on the tile.",
     "files": { "dark": "../../liquid-glass/opus-5.5/src/walls/aurora-dark.webp", "light": "..." },
     "default_for": null }
   ```

   - `id` is one lowercase word, unique across all fragments, and stable: the saved choice stores it.
   - `files` are relative to `Concepts/wallpapers/opus-5.5/`. They can stay in the owner's own folder (Glass's do).
   - `default_for` names the look that shows this wallpaper while the choice is "Look's own" (`glass`, `basic`,
     `friendly`, `retro` or `nier`), or `null`. Each look has at most one. Glass uses Ribbons. The other looks have
     none and keep their own background until Jared decides otherwise. Before giving a look other than Glass a
     default, `glass.js` has to read this catalog for its "Look's own" (follow-up F2 below). Until then it assumes only
     Glass has a default.
3. A new family is a new fragment, `catalog.d/<NN>-<family>.json`, with `family`, `label`, `owner`, `order` (the
   `NN`), `about` and `wallpapers`. The gallery shows families in file order.
4. Run `node tools/walls.mjs --no-walls --only <id>` for the 320 x 180 thumbnails the gallery shows. The gallery never
   decodes the full prints. Then run `python3 tools/build_walls.py --check`.

## The choice and its effect

| | |
|---|---|
| Saved choice | `localStorage['pm-lg-wallpaper']`: `'look'` (the default) or a wallpaper `id`. One choice for every look. In the product: `general.visual.wallpaper` (proposed). |
| One-visit override | `?lgwall=<id>`, read before the saved choice, the way `glass.js` reads it. |
| On show | `<html data-lg-wall="<id>">`: the chosen id, or the look's default while the choice is `'look'`, or absent. |
| Non-Glass look showing one | `<html data-lg-wall-any>` present. |
| Images | `--lg-wall-<id>-<dark\|light>` on `html`. The build adds the ones the page lacks and reuses identical ones already there. |
| Glass | `--lg-wall` takes the print for the mode. `glass.js` bakes its frost and rims from it. |
| Basic, Friendly, Retro | `--lg-wall-any` takes the print. The body carries it, and the shell's grounds go clear around the panels. The Usage board and Settings Home show it under a light veil of the look's ground. |
| NieR Mode | As the other looks, and the wallpaper takes the place of NieR's ground and its ink scene. "Look's own" brings NieR's background setting back. |
| Stale choice | A saved id that this build lacks is set back to `'look'` when the page loads. Nothing paints a missing image, and `glass.js` agrees at its next pass. |

Both writers compute `data-lg-wall` and `data-lg-wall-any` with the same rule. This package rewrites them only when
the look changes or a choice is made, and never in answer to the other writer, so the two can never answer each
other in a loop.

## The gallery

- It is one row, `setting-general.visual.wallpaper`, in Settings > App & Input > Theme & colors, right after
  Light or dark. It replaces an older injected picker in the same place.
- It is one radiogroup. "Look's own" comes first, with a line that says what the look shows, then every family in
  catalog order under its name. Each tile shows the thumbnail in the current print and the wallpaper's name. The
  accessible name adds the family, and the pointer shows the description through the app's hover labels
  (`data-pm-hover-label` / `-detail`).
- The chosen tile has the accent edge and a check, and it is the one tab stop. Left and Right move through every tile,
  Up and Down move to the nearest tile in the next row as drawn, Home and End go to the ends, and Space or Enter
  chooses. The arrows choose as they move, and the app repaints a quarter second after the last step.
- The look's own controls draw the tiles: its surface and line tokens, its corners (`--pm-ctl-r`, square in Retro and
  NieR), and no pills. The grid holds five columns and falls to four, three and two as the section narrows
  (container queries). Nothing animates.
- The Changed mark shows while a wallpaper is chosen. Choosing "Look's own" clears it.

## Follow-ups for other owners (not done here)

- F1, Glass (pm7-liquid-glass): `glass.js` can drop `WALLS`, `pickerHtml`, `mountPicker`, `renderPickers` and the
  wallpaper rows of its concept control, and `glass.css` can drop its per-id rules (sections 1 and 9), once this
  package lands. The generated rules cover every catalog id.
- F2, Glass: `applyWall` reads `window.PM_WALLPAPERS_CATALOG` for each look's default instead of assuming Ribbons for
  Glass only. This is needed before any other look gets a `default_for`.
- F3, the product's Settings and the canon owners: `general.visual.wallpaper` in the settings inventory, saved per
  project like Theme, first-paint application, the Settings search entry, and loading prints as files instead of data
  URLs. See the owner proposal.
