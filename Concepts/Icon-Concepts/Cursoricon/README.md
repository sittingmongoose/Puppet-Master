# Cursoricon — PM logo theme + loading Mix Lab

> Agent label: **Cursor**

Theme-matched static marks, chrome/tray optical tiers, and eight film-level
loading motions composable across all eight PMConcept7 themes, plus a
self-contained download dashboard with baked app/tray rasters.

> Concept work only (same status as `Concepts/PMConcept7.html`). Nothing outside
> `Concepts/Cursoricon/` is written by this pipeline except the vendored source
> logo copy. Canonical product truth stays in `Plans/**`.

## Open

Double-click `index.html` — no server, no CDN. Works over `file://`.
Chrome is recommended for multi-file downloads.

## Regenerate / verify

Requires `/opt/homebrew/bin/resvg` (Homebrew `resvg`) and macOS `iconutil` for ICNS.

```
python3 generate.py          # rebuild all generated files + index data region
python3 generate.py --check  # exit 1 if any generated artifact drifted
```

## Layout

```
README.md
generate.py
index.html
source/                 pristine SVG + reference PNG
icons/static/           pm-<theme>.svg                 (8 full)
icons/chrome/           pm-<theme>.svg                 (8 title-bar optical)
icons/animated/         pm-<motion>-<theme>.svg        (64)
icons/tray/             Template + white SVG
icons/app/
  pm-app-master.svg
  png/pm-app-{16..1024}.png
  pm-app.ico
  pm-app.icns
  tray/                 Template + white PNGs
manifest.json
```

## Motions (film-level, theme-swappable)

Caret Conductor · Cozy Pluck · Caustic Sweep · Depth Float ·
Phosphor Trace · Hard Shadow Kick · Metronome Bar · Assemble Loop

Mix Lab previews and downloads are **byte-identical** to the on-disk animated SVGs.
