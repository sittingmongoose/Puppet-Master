# Kimiicon — Handoff to next agent

## Mission (from Jared)
Theme-appropriate variants of his Puppet Master logo (puppet control-bar + strings + `{PM}`)
for GUI header, app icon, tray icon, and **animated** loading indicator. Deliverables live in
a browsing dashboard where he can preview and download any of them. He is exploring what is
possible — creativity in the animations is welcome.

**Hard constraint: only touch `Concepts/Kimiicon/`. Never modify PMConcept7.html or anything else.**

## Current state — DONE and verified
- `tools/build_svgs.py` — parametric generator. **Run it with `python3 tools/build_svgs.py`.**
  Wrote 56 valid-XML SVGs: `static/icon-{theme}.svg` (8) + `animated/{style}-{theme}.svg` (48) + `manifest.json`.
- `png/{theme}/icon-{16,24,32,48,64,128,256,512,1024}.png` — 9 per theme, from 1024px masters
  rendered via headless Chromium. Masters verified visually (geometry + colors correct).
- `ico/icon-{theme}.ico` (8) — PNG-compressed, 7 sizes, `file`-validated.
- `icns/icon-{theme}.icns` (8) — via `iconutil`, `file`-validated.
- `tools/export_raster.py` — sips downsample + struct ICO writer + iconutil. Re-runnable.
- `source/pm-logo-original.svg` — Jared's original, kept for lineage.
- Broken `tools/.venv` (cairosvg, missing native cairo) was deleted — do not recreate.

## Themes (colors baked into `build_svgs.py` THEMES)
basic-light `#0056B3/#FFFFFF r4` · basic-dark `#64B5F6/#121212 r4` ·
retro-light `#0047AB/#F5F0E8 r0` · retro-dark `#00FF41/#1A1A1A r0` ·
glass-light `#8B6ED9/#FFFFFF r9` · glass-dark `#B79CFF/#241B36 r9` ·
friendly-light `#3F9CC7/#FFFFFF r9` · friendly-dark `#6FC6E8/#211E26 r9`
(THEMES also carries `page`/`ink` = dashboard card background + label color per theme.)

## Animation styles (SMIL, run inside `<img>` — no JS/CSS)
puppet-sway (signature: bar rocks, strings pendulum out of phase, marionette bobs) ·
breathe (braces scale-pulse, PM counter-pulse, glow) · string-pluck (damped skew ripple) ·
draw-on (stroke trace → fill → hold → loop) · mobile-spin (whole assembly rotates) · sheen (light sweep).

## SVG geometry notes (if regenerating)
Groups: badge rect / bar paths (BAR_A, BAR_B, BAR_MAIN) / STRING_L, STRING_R rects /
marionette (BRACE_L, M_LETTER, P_FILL, **P_BADGE**, BRACE_R).
**P_BADGE must stay badge-colored** — it is an overprinted P detail (was cls-2 in the original).
Pivots/centers are defined as constants at the top of `build_svgs.py`.

## Dashboard — DONE and verified (second agent, browser-use MCP)
- `tools/build_dashboard.py` → `dashboard.html` (~3.5 MB self-contained: 56 SVGs as JS strings +
  88 binaries as base64; previews via Blob URLs in `<img>`; all downloads Blob-based so `file://` works).
- UI: sticky header (title + live puppet-sway logo), theme tabs w/ swatches, motion chips,
  **platform map** (Windows=ICO / macOS=ICNS / Linux=PNG set / Web+Slint=SVG), static cards with
  64/32/16px tray-legibility previews + hex chips + [SVG][PNG+size][ICO][ICNS] buttons,
  6 animated blocks × 8 live themed cells, per-style static-fallback notes, Slint footer note.
- Verified: zero console errors; 73 blob `<img>` previews all loaded; SMIL motion proven (viewport
  screenshots 800 ms apart differ); download pipeline exercised for static SVG, PNG@512, ICO, ICNS,
  animated SVG (all correct blob MIME + non-zero size); theme+motion filters and reset behave.
- **Jared's cross-platform requirement is covered by the platform map + ICO/ICNS/PNG/SVG formats.**
- To view: open `dashboard.html` directly (file:// is fine) or serve the folder.

## Environment gotchas (learned the hard way)
- **file:// is blocked** in the Playwright MCP. An http server is already running:
  `nohup python3 -m http.server 8931 --directory Concepts/Kimiicon` (log `/tmp/kimiicon-server.log`).
  Use `http://127.0.0.1:8931/...`.
- **Playwright MCP is SHARED with other platforms and wedged once** (every call timed out 30 s,
  self-recovered). Be conservative: few calls, no heavy loops, close your tabs. Do NOT restart it.
- `run_code_unsafe` sandbox: `require` undefined, dynamic `import()` throws
  ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING. To write files use `page.screenshot({path: '/abs/x.png'})`
  (omitBackground works) — that is how the PNG masters were made.
- No rsvg-convert / ImageMagick / native cairo on this machine. `sips` + `iconutil` are the pipeline.
- Retro themes (r=0) intentionally produce fully-opaque square PNGs (`hasAlpha: no`) — by design.

## Regeneration cheat sheet
```
cd Concepts/Kimiicon
python3 tools/build_svgs.py        # 56 SVGs + manifest.json
python3 tools/export_raster.py     # PNG sizes + ICO + ICNS (needs masters present)
python3 tools/build_dashboard.py   # dashboard.html (~3.5 MB)
```

Serve dashboard for testing: `python3 -m http.server 8931 --directory Concepts/Kimiicon`
→ `http://127.0.0.1:8931/dashboard.html`

## Status: COMPLETE — no remaining work. Re-verify after any regeneration.
