# Liquid Glass: the Glass look restyled after Apple's Liquid Glass (Opus 5.5)

The concept surface of the Liquid Glass thread (pm-mail `pm7-liquid-glass`, brief
`/mnt/Cursor/share/puppet-master/2026-10-10-design-consistency-threads/BRIEF-liquid-glass.md`). It covers Usage plus the
left rail, in Glass Dark and Glass Light. `NOTE.md` says what is borrowed from Apple's Liquid Glass (iOS and macOS 26
and 27) and what is not. The review packet (cards, film, GPU stills, results) is in
`/mnt/Cursor/share/puppet-master/2026-10-11-liquid-glass-concept/`. That dated packet records the prototype; the
published Glass look now always uses Liquid Glass with a wallpaper.

## How it is built

The material is gated on `html[data-lg="on"]` and a Glass look. Glass always uses Liquid Glass with a wallpaper;
every other look keeps its own material.

| File | What |
|---|---|
| `src/lg.css` | The material: tokens, the one slab and the painted frost, the toolbar band and the sidebar, the title bar, the lens, the rail, Usage, press and light, the CPU path (7b), clarity, accessibility, and the concept's own control |
| `src/lg.js` | The plates, the lenses and their liquid motion, the pointer light, the press, the menu bloom, the sweep, focus recede, GPU/CPU detection and `window.PM_LG` |
| `src/wallpapers.json` | Tide and Pearl, baked by `tools/bake.mjs`: the wall, and its frost (the wall as the 34 px, 160 % slab sees it) |
| `index.html` | The live concept in the Concept Hub: the published PMConcept7 in a frame, with the three sources injected (needs http) |
| `tools/build_proto.py --out <file>` | The same as one file for the share folder; never writes into `Concepts/` |

Attributes on `<html>`:
- `data-lg="on"` (always used by Glass);
- `data-lg-tier` gpu/cpu (detected from the WebGL renderer and a frame-time check; `?lgtier=` forces it);
- `data-lg-clarity` 0..4 (2, the default, is canon's numbers);
- `data-lg-frost="painted"`, which the drag engine sets while a plate is carried (Jared's option A, a 140 ms crossfade);
- `data-lg-rt` (Reduce Transparency) and `data-lg-hc` (Increase Contrast).

Current URL controls are `?lgtier=gpu|cpu` and the visit-only wallpaper override `?lgwall=<id>`.
`PM_LG.set` keeps `data-lg` on; the off switch and Alt+Shift+L shortcut are retired.
The gallery and `PM_LG.wall` save `general.visual.wallpaper` through the active Project Settings adapter.
The old `pm-lg-wallpaper` preference can seed only a readable Project snapshot whose canonical choice is absent;
an explicit Project choice wins, and rendering without a Project writes nothing.

## Checks (tools write outside the repository)

| Tool | Gate |
|---|---|
| `tools/contrast.mjs <page> <out.json> [--tier gpu\|cpu] [--clarity 0,2,4]` | Text 4.5:1 and glyphs 3:1, each label against the worst real pixel behind it (exits 1 on a failure) |
| `tools/frametime.mjs <page> <out.json>` (`AB=1` on the P1000) | Frame intervals over one scripted run: today, the CPU path and the live blur |
| `tools/film.mjs <file url> <out.mp4>` (P1000) | The GPU film with chapters |
| `tools/stills.mjs <file url> <dir>` (P1000) | The GPU stills |
| `python3 Concepts/ConceptHub/validate.py Concepts/liquid-glass/opus-5.5` | The concept folder |

Results at presentation (2026-10-11): 0 contrast failures, lowest text 4.54:1 and lowest glyph 3.21:1, in both looks, at
clarity 0, 2 and 4, on both paths. On Nas1's CPU, the share of frames over 20 ms was:

| Look | Today | CPU path |
|---|---|---|
| Dark | 0.144 | 0.160 |
| Light | 0.270 | 0.216 |

On the P1000's GPU it was 0.31 and 0.29 against today's 0.79 and 0.69.

## Rules this keeps

F3-427 (one shell blur, plain fills inside, baked wallpaper), F3-431 (closed blur budget, no SVG filters, colours
precomputed per detent), F3-428 (the wallpaper modes), DL-184 / F3-648 (no pills; controls 6 px with 3 px inside, the
no-pills tokens), and DR-072 (cards keep magnet and glow; the glow becomes the edge light).
