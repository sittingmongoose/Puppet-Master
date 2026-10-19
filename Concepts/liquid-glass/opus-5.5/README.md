# Liquid Glass: the Glass look restyled after Apple's Liquid Glass (Opus 5.5)

The concept surface of the Liquid Glass thread (pm-mail `pm7-liquid-glass`, brief
`/mnt/Cursor/share/puppet-master/2026-10-10-design-consistency-threads/BRIEF-liquid-glass.md`). It covers Usage plus the
left rail, in Glass Dark and Glass Light. `NOTE.md` says what is borrowed from Apple's Liquid Glass (iOS and macOS 26
and 27) and what is not. The review packet (cards, film, GPU stills, results) is in
`/mnt/Cursor/share/puppet-master/2026-10-11-liquid-glass-concept/`. Nothing here is published into PMConcept7 until Jared
answers the cards; the rollout then moves these rules into the surfaces' own sources.

## How it is built

The concept is one stylesheet and one script over the published page. Everything is gated on `html[data-lg="on"]` and
a Glass look, so every other look, and Glass with `data-lg="off"`, draws exactly what PMConcept7 draws today.

| File | What |
|---|---|
| `src/lg.css` | The material: tokens, the one slab and the painted frost, the toolbar band and the sidebar, the title bar, the lens, the rail, Usage, press and light, the CPU path (7b), clarity, accessibility, and the concept's own control |
| `src/lg.js` | The plates, the lenses and their liquid motion, the pointer light, the press, the menu bloom, the sweep, focus recede, GPU/CPU detection, the concept control (status bar, Alt+Shift+L) and `window.PM_LG` |
| `src/wallpapers.json` | Tide and Pearl, baked by `tools/bake.mjs`: the wall, and its frost (the wall as the 34 px, 160 % slab sees it) |
| `index.html` | The live concept in the Concept Hub: the published PMConcept7 in a frame, with the three sources injected (needs http) |
| `tools/build_proto.py --out <file>` | The same as one file for the share folder; never writes into `Concepts/` |

Switches on `<html>`:
- `data-lg` on/off;
- `data-lg-tier` gpu/cpu (detected from the WebGL renderer and a frame-time check; `?lgtier=` forces it);
- `data-lg-clarity` 0..4 (2, the default, is canon's numbers);
- `data-lg-frost="painted"`, which the drag engine sets while a plate is carried (Jared's option A, a 140 ms crossfade);
- `data-lg-rt` (Reduce Transparency) and `data-lg-hc` (Increase Contrast).

URL forms: `?lg=off`, `?lgclarity=`, `?lgrt=1`, `?lghc=1`, and `?lgkeep=1`, which keeps this browser's look on the first
visit.

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

## Published source slots

The surviving old Glass rules also live here as plain CSS in `src/slots/`.
Each fragment is one exact authored rule, named by its B0-r2 rule id beneath its
original source path. Its former location contains a one-line comment such as
`/* @pm7-lg-slot onboarding/opus-5.5/base/style/style-002/G0001.css */`.
The filename is relative to this package's `src/slots/` directory.

`onboarding/opus-5.5/tools/base_source.py:read_text_source` replaces that comment
with the fragment's exact UTF-8 bytes. The existing `base/manifest.json` still
owns base block order. The feature CSS readers use the same helper before their
existing joins, rail macro expansion, Usage host scoping, and glyph rewriting.
No rule is appended to `lg-css`; each retains its original block and position.
Whitespace around a slot remains in the original source, and a fragment has no
added final newline. For CSS sources and fragments, the reader rejects missing,
duplicate, nested, malformed, out-of-package, CR, BOM, or invalid UTF-8 inputs
instead of normalizing them. Other feature text keeps its existing read behavior;
manifest script bodies retain the base assembler's strict byte guard.

Edit the fragment to change its rule. `scripts/pm7-where.py` follows the source
comment and names the fragment, including when rail macros expand its selector.
Do not regenerate these fragments from an old page. The B1 move preserves token
values and scopes without consolidation; all 28 Wizard/Orchestrator-related
survivors remain in their original source files. The four publication checks
and exact page hashes verify that this source relocation preserves output bytes.

## Rules this keeps

F3-427 (one shell blur, plain fills inside, baked wallpaper), F3-431 (closed blur budget, no SVG filters, colours
precomputed per detent), F3-428 (the wallpaper modes), DL-184 / F3-648 (no pills; controls 6 px with 3 px inside, the
no-pills tokens), and DR-072 (cards keep magnet and glow; the glow becomes the edge light).
