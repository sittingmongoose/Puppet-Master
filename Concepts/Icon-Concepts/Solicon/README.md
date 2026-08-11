# Solicon

Solicon is the isolated Puppet Master identity and loading-motion gallery. It
contains theme-aware logo candidates, small-size companions, native app/tray
exports, and a local comparison dashboard. Nothing in this folder is wired into
PMConcept7 or the future Slint application automatically.

Open `index.html` directly, or serve `Concepts/Icon-Concepts/Solicon/` from
localhost. The dashboard has no package install, build step, network dependency,
remote font, or CDN requirement.

## Design Context

### Users

The primary user is the Puppet Master creator comparing and selecting a durable
brand mark. The eventual audience is desktop-app users who encounter the mark in
the title bar, launcher, system tray, startup/loading surfaces, and long-running
operations. The gallery supports close visual comparison at a desk as well as
quick inspection on phone and tablet widths.

### Brand Personality

The library deliberately explores three compatible voices instead of forcing a
single mood prematurely:

- friendly technical: warm, capable, calm, and approachable;
- precision industrial: controlled, mechanical, efficient, and tool-like;
- expressive futuristic: layered, energetic, and visibly agentic.

### Aesthetic Direction

The supplied crossed-control/PM mark remains the identity anchor. Theme matching
comes from the eight PMConcept7 palettes. The flat treatment preserves the
original two-color construction; the character treatment adds family-specific
material, corners, edges, and accent distribution. Motion communicates active
work without bounce, elastic easing, or decorative noise.

### Design Principles

1. Preserve recognition before adding character.
2. Judge tiny marks at their real rendered size.
3. Make motion communicate indeterminate work, not completion.
4. Keep every asset local, accessible, theme-derived, and reproducible.
5. Treat browser animation as presentation evidence and provide a separate Slint
   motion recipe for future native implementation.

## Contents

- `source/` keeps the untouched input SVG and the normalized layered master.
- `assets/static/` contains 32 theme/treatment/form SVGs.
- `assets/loaders/` contains 256 self-contained animated SVGs.
- `exports/` contains PNG, ICNS, ICO, and tray-state deliverables.
- `manifest/` contains palette provenance, the versioned asset manifest, schema,
  and Slint-portable motion specification.
- `bundles/` contains deterministic theme, motion, treatment, platform, and full
  library ZIPs.
- `verification/` is ignored and generated on demand for local reports and
  visual/browser witnesses; its outputs are not retained in the repository.
- `tools/` contains the deterministic generator and verification programs.

## Regenerate and verify

Asset generation is macOS-native and requires the system `qlmanage` and
`iconutil` tools. Browser verification requires Node.js, npm, and an installed
Google Chrome. By default Playwright launches Chrome's `chrome` channel; set
`SOLICON_CHROME_CHANNEL`, `SOLICON_CHROME_EXECUTABLE`, or `CHROME_BIN` to
override that selection.

```sh
python3 Concepts/Icon-Concepts/Solicon/tools/build_assets.py
python3 Concepts/Icon-Concepts/Solicon/tools/verify_assets.py
solicon_modules="$(mktemp -d)"
trap 'rm -rf "$solicon_modules"' EXIT
npm install --prefix "$solicon_modules" --no-save playwright-core
node Concepts/Icon-Concepts/Solicon/tools/browser_test.mjs --modules "$solicon_modules/node_modules"
python3 Concepts/Icon-Concepts/Solicon/tools/check_reproducibility.py
```

`SOLICON_PLAYWRIGHT_MODULE` may supply the same `node_modules` directory instead
of `--modules`. The browser test also falls back to a normally resolvable
`playwright-core` package and fails closed with the scratch-install commands if
none of those sources is available. Dependency installation never needs to
write into the repository.

The generator fails closed if the supplied source SVG has changed. It snapshots
the current PMConcept7 hash and exact theme-token values on every generation,
then verifies that both protected inputs remain unchanged when generation ends.

## Native integration note

The animated SVG files are standalone browser/download assets. Slint documents
SVG as an image source and supplies its own property-animation and
`animation-tick()` systems. A production Slint loader should therefore recompose
the stable layers listed in `manifest/motion-spec.json`; it must not assume that
the renderer executes CSS animation embedded in an SVG. The motion spec also
contains an opacity-only fallback for the software renderer.

- <https://docs.slint.dev/latest/docs/slint/reference/elements/image/>
- <https://docs.slint.dev/latest/docs/slint/guide/language/coding/animation/>
- <https://docs.slint.dev/latest/docs/slint/reference/common/>
