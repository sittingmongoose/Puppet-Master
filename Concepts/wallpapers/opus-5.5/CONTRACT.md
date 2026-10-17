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
| Glass | `--lg-wall` on `body` takes the print for the mode. The derived image is non-inherited; immutable source images stay on `html`. `glass.js` prepares its frost before the choice is published. Two permanent background layers inherit the body’s ground color directly, with no computed-style read on a choice, and crossfade the print over 240 ms. A print whose frost is already prepared fades, and its frost and root identity commit, in one task when that fade starts. Fade-first (B3, F6, Jared 2026-10-16): a print whose frost still has to be made starts its fade as soon as Glass has decoded it (`PM_LG.prepareWallpaper(url, { printed })`, called once before the bake; Glass bakes after that fade's first frame), instead of waiting for the bake; its frost and root identity commit when the bake is ready, with a 240 ms target-less `Animation` as the fade, and the planes clear once both the print fade and that crossfade end. While an uncommitted fade still shows, a new choice fades from that print; a look or mode change ends it at once. Finished or cancelled print planes clear their image and color; only the body retains the settled print. A failed or invalidated preparation still commits the current choice through the ordinary image/frost fallback; stale choices and modes cannot commit. `PM_LG.commitWallpaper(id, url, viewport, fade)` receives the actual print `Animation` as its optional fourth argument. The paired Glass implementation uses its duration, easing and completion to crossfade each shown sheet’s frost through a transient `::after` overlay, without adding DOM nodes. The nonanimated path passes no animation and swaps frost immediately. Glass removes overlays when that animation finishes or is cancelled, synchronously replaces an earlier fade on a new commit, and clears them on look/mode changes, leaving Glass or enabling Reduced Motion. Stale completion handlers cannot clear a later fade. `paintChoice()` returns the committed choice while `choice()` returns the selected one. |
| Idle preparation | Visible and nearby gallery choices use `PM_LG.prepareWallpaper(url, { canRun, idle: true })`, one idle job at a time (intents pass `idle: false`; with the page's `PM_WARM` queue Glass makes an idle job's frost in that queue's cpu steps, F6). A job may start with at least 2 ms of idle budget; after three otherwise-eligible low-budget callbacks, one ordinary task retries with every input, busy, navigation and epoch guard checked again. New input resets that refusal streak. The optional guard is checked again after decoding, before baking frost; a cancelled job resolves `false` without changing visible pixels. Warming pauses for input, Settings navigation and `PM_BUSY()` (with cover-marker fallbacks), and never blocks a choice. Hover and keyboard focus advance the newest intended tile outside idle once the pointer has been still for 50 ms (B3, F5; background warming keeps its 120 ms). Pointerdown (or Enter/Space) requests that tile without waiting for its own input quiet period; pending input, scrolling, navigation, cover/busy and epoch guards still apply, including after decode. Intent has its own single flight beside the idle queue's, so it never waits for a background job on another print; a sweep replaces the pending request and never settles, so it launches no intent bake. Glass bakes a print once however many prepares ask for it. New intent supersedes an older speculative decode. Missing immutable URLs are read after layout, never forced from pointerdown. Glass decides whether a pair is still kept or needs preparing; an old idle-success record cannot assume that the byte-bounded frost cache retained it. Focus generated by a pointerdown preserves that immediate request. Leaving the tile, closing Settings, hiding the page, changing mode or resizing cancels pending intent as appropriate. Pointer movement/entry restart the quiet period, and scrolling requires 120 ms of quiet before any speculative bake. Glass retains ownership of its two decoded images and a frost cache bounded by 32 MiB of encoded bytes with LRU eviction, without an entry-count cap. The gallery keeps no image cache of its own beyond immutable source URLs. Every visible or nearby choice is eligible when Liquid Glass is on, ordered by hovered tile, distance to the pointer and then visible order using IntersectionObserver geometry; opaque looks and Glass with Liquid Glass off warm at most two. A mode or viewport change invalidates the warm queue. |
| Visible decoded retention | When available, `PM_LG.retainVisible(urls)` receives the current-mode print URLs in the gallery's visible/nearby IntersectionObserver set (160 px margin). The gallery republishes after scroll settles, on open, and on mode/viewport changes; page/gallery close, document hiding, NieR and Liquid Glass off publish an empty set. Missing catalog URLs are read in the shared after-layout phase. This API only updates retention; it must not synchronously bake or decode. Glass owns the retained decoded pairs, the committed/preparing pairs and release of other pairs after 60 seconds. There is no keepalive timer or gallery-owned image cache. Older Glass builds without the API retain their existing behavior. |
| Cached image source | `PM_WALLPAPERS.sourceUrl(id, mode?)` returns the prepared catalog image URL without reading style or layout. The mode is `light` or `dark`, defaulting to the current theme mode. Preparation fills this cache before `data-lg-wall` is published. `undefined` means that a boot-time consumer needs its existing fallback; `null` means that this print has no image. Root-attribute observers should use this cache rather than forcing the pending root style with `getComputedStyle`. |
| Basic, Friendly, Retro | `--lg-wall-any` on `body` takes the print without inheriting to the interface. The body carries it, and the shell's grounds go clear around the panels. The Usage board and Settings Home show it under a light veil of the look's ground. |
| NieR Mode | As the other looks, and the wallpaper takes the place of NieR's ground and its ink scene. "Look's own" brings NieR's background setting back. |
| Stale choice | A saved id that this build lacks is set back to `'look'` when the page loads. Nothing paints a missing image, and `glass.js` agrees at its next pass. |
| Most recent wins (Jared #18, 2026-10-14) | Two controls decide what shows behind NieR Mode: this gallery (`general.visual.wallpaper`) and NieR Mode's customizer (`general.visual.nier-background`). The most recent change wins, from either control. This package is the only writer of the wallpaper choice. A gallery pick sets it to the id. When the committed NieR background changes (`PM_NIER.onChange`, reason `background`), the package sets the choice to `'look'`, so NieR's choice shows. The customizer writes only `general.visual.nier-background`. A NieR preview is not a change. |

Both writers compute `data-lg-wall` and `data-lg-wall-any` with the same rule. This package rewrites them only when
the look changes or a choice is made, and never in answer to the other writer, so the two can never answer each
other in a loop.

## The NieR family

Jared #11 (2026-10-14): Archive, Signal, Fragments, Hatch and Flora left the catalog; their files stay in `src/walls`.
The NieR family is NieR Mode's own six scenes, with the same ids as its scene sources
(`Concepts/onboarding/opus-5.5/src/settings/nier/scenes/<id>.svg`) and the customizer's names:

| id | Name |
|---|---|
| `city` | City Ruins |
| `bunker` | The Bunker |
| `desert` | Desert |
| `forest` | Forest Castle |
| `park` | Amusement Park |
| `flooded` | Flooded City |

`tools/nier_prints.mjs` draws their prints and thumbnails from those SVGs.
- Prints are drawn the way NieR's scene layer shows a scene: the parchment ground, the ink at 15 % in light or 20 % in
  dark, and the paper fade at the top. So the same scene looks the same whether it was chosen here or in the customizer.
- Thumbnails are drawn in full ink, like the customizer's own scene tiles.
- Edit a scene in its SVG, then run the tool again. Never edit the prints by hand.

## The gallery

- It is one row, `setting-general.visual.wallpaper`, in Settings > App & Input > Theme & colors, right after
  Light or dark. It replaces an older injected picker in the same place.
- It is one radiogroup. "Look's own" comes first, with a line that says what the look shows, then every family in
  catalog order under its name. Each tile shows the thumbnail in the current print and the wallpaper's name. The
  accessible name adds the family, and the pointer shows the description through the app's hover labels
  (`data-pm-hover-label` / `-detail`).
- The chosen tile has the accent edge and a check, and it is the one tab stop. Left and Right move through every tile,
  Up and Down move to the nearest tile in the next row as drawn, Home and End go to the ends, and Space or Enter
  chooses. The arrows choose as they move. After the next frame and a 160 ms pause after the last step, preparation begins; the print then crossfades over 240 ms as soon as it is decoded, and the panels' frost follows when it is ready (fade-first; an immediate swap under Reduced Motion).
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
