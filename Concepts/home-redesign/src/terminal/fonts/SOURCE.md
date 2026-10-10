# Terminal fonts

The faces of the terminal tab. `Concepts/home-redesign/src/terminal/css/00-fonts.css` declares one @font-face per WOFF2
file below, each as `url("o55font:<file>")`. The home layer inlines each reference as a data: URI (CONTRACT section 1.1),
so nothing here is loaded over the network at runtime. The files go through the DL-161 embedding pipeline once that
branch is on main. Six WOFF2 files are Latin subsets (the Google Fonts `latin` block, or the NieR bytes already in the
page). `pmt-departure-mono-400.woff2` is the full v1.500 release font (1186 glyphs), not a subset. Every ASCII glyph
(0x20 to 0x7E) is present in each face.

Fetched 2026-10-09. The Google Fonts CSS API was asked with a desktop Chrome user agent, so it serves WOFF2.

| File | Source | SHA-256 (first 16) | Bytes | Licence |
|---|---|---|---|---|
| `pmt-jetbrains-mono-latin-var.woff2` | Copy of `Concepts/onboarding/opus-5.5/src/settings/nier/fonts/jetbrains-mono-latin-var.woff2`, byte for byte (the PM NieR Mono bytes; JetBrains Mono 2.211, wght 400-800). The NieR folder records no fetch URL. | `83c005d49d8a6a50` | 31432 | SIL OFL 1.1 |
| `pmt-jetbrains-mono-latin-var-italic.woff2` | https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbX2o-flEEny0FZhsfKu5WU4xD-CwOnSA.woff2 (css2 `JetBrains+Mono:ital,wght@1,100..800`, latin) | `a8afa085e9ca5e53` | 42964 | SIL OFL 1.1 |
| `pmt-vt323-latin-400.woff2` | https://fonts.gstatic.com/s/vt323/v18/pxiKyp0ihIEF2isfFJU.woff2 (css2 `VT323`, latin) | `8ddbebcc10481541` | 17936 | SIL OFL 1.1 |
| `pmt-sixtyfour-latin-var.woff2` | https://fonts.gstatic.com/s/sixtyfour/v3/OD5BuMCT1numDm3nakXHq0C5.woff2 (css2 `Sixtyfour:BLED,SCAN@0..100,-53..100`, latin) | `df188df1d5e123c7` | 4236 | SIL OFL 1.1 |
| `pmt-atkinson-hyperlegible-mono-latin-var.woff2` | https://fonts.gstatic.com/s/atkinsonhyperlegiblemono/v8/tss4AoFBci4C4gvhPXrt3wjT1MqSzhA4t7IIcncBiwKthFw.woff2 (css2 `Atkinson+Hyperlegible+Mono:ital,wght@0,200..800;1,200..800`, latin, normal) | `2706b1ee4f452e74` | 17752 | SIL OFL 1.1 |
| `pmt-atkinson-hyperlegible-mono-latin-var-italic.woff2` | https://fonts.gstatic.com/s/atkinsonhyperlegiblemono/v8/tss6AoFBci4C4gvhPXrt3wjT1MqSzhA4t7IIcncBiwKotF6JGQ.woff2 (same css2 request, latin, italic) | `13db24b4da3f549a` | 19084 | SIL OFL 1.1 |
| `pmt-departure-mono-400.woff2` | https://github.com/rektdeckard/departure-mono/releases/download/v1.500/DepartureMono-1.500.zip, member `DepartureMono-1.500/DepartureMono-Regular.woff2` | `5b4fed1daa90708a` | 22496 | SIL OFL 1.1 (see below) |
| `OFL-JetBrainsMono.txt` | Copy of `Concepts/onboarding/opus-5.5/src/settings/nier/fonts/OFL-JetBrainsMono.txt` | `a76abf002c49097d` | 4399 | licence text |
| `OFL-VT323.txt` | https://github.com/google/fonts/blob/main/ofl/vt323/OFL.txt | `27d9af34210253e7` | 4367 | licence text |
| `OFL-Sixtyfour.txt` | https://github.com/google/fonts/blob/main/ofl/sixtyfour/OFL.txt | `a5ef1337c7efa6a7` | 4401 | licence text |
| `OFL-AtkinsonHyperlegibleMono.txt` | https://github.com/google/fonts/blob/main/ofl/atkinsonhyperlegiblemono/OFL.txt | `1ebb31cf7393164f` | 4436 | licence text |
| `LICENSE-DepartureMono.txt` | The `LICENSE` inside the v1.500 release zip (SIL OFL 1.1, Copyright 2022-2024 Helena Zhang) | `b65e42750f3cb654` | 4357 | licence text |

## Metrics

Verified with fontTools (`hhea`, `OS/2`, `head`, `hmtx`, `fvar`) on the files as they sit in this folder. The advance is
the one shared by every ASCII glyph. "em" is advance divided by unitsPerEm.

| Face (file) | unitsPerEm | advance | advance (em) | ascender | descender | lineGap | glyphs | variation axes |
|---|---|---|---|---|---|---|---|---|
| JetBrains Mono upright (`pmt-jetbrains-mono-latin-var`) | 1000 | 600 | 0.600 | 1020 | -300 | 0 | 394 | wght 400..800 (default 400) |
| JetBrains Mono italic (`pmt-jetbrains-mono-latin-var-italic`) | 1000 | 600 | 0.600 | 1020 | -300 | 0 | 394 | wght 100..800 (default 400) |
| VT323 (`pmt-vt323-latin-400`) | 1000 | 400 | 0.400 | 800 | -200 | 0 | 235 | none (one weight, 400) |
| Sixtyfour (`pmt-sixtyfour-latin-var`) | 1024 | 1024 | 1.000 | 896 | -128 | 0 | 228 | SCAN -53..100 (default 0); BLED 0..100 (default 0) |
| Atkinson Hyperlegible Mono normal (`pmt-atkinson-hyperlegible-mono-latin-var`) | 1000 | 632 | 0.632 | 984 | -316 | 0 | 237 | wght 200..800 (default 200) |
| Atkinson Hyperlegible Mono italic (`pmt-atkinson-hyperlegible-mono-latin-var-italic`) | 1000 | 632 | 0.632 | 984 | -316 | 0 | 237 | wght 200..800 (default 200) |
| Departure Mono (`pmt-departure-mono-400`) | 550 | 350 | 0.636 | 550 | -150 | 0 | 1186 | none (one weight, 400) |

The ascender, descender and lineGap columns are the hhea values. In every face the OS/2 typo values equal them and
USE_TYPO_METRICS is set. The OS/2 win ascent / descent are: JetBrains Mono 1020 / 300, VT323 1040 / 240, Sixtyfour
1024 / 256, Atkinson Hyperlegible Mono 996 / 411, Departure Mono 550 / 150.

Monospace: every ASCII glyph has one advance in every face. fontTools checked that at the default instance and at every
corner of each variation space (JetBrains Mono wght 400 and 800 upright, 100 and 800 italic; Atkinson 200 and 800;
Sixtyfour all four BLED and SCAN corners). Chrome, loading these files at their default position, measured the same
advance for every ASCII glyph in each family at 100 px: 60, 40, 100, 63.2 and 63.64.

Cell width for a font size S is advance (em) x S, before the terminal's own rounding (`cellW` in ARCHITECTURE.md
section 5). Box-drawing and block cells are not measured from these faces (see the rules below).

## Rules

- These are terminal faces, and they are never mirrored into PM Symbols. The page's `src/css/03-symbols.css` (opus-5.5
  package) mirrors the PM Symbols faces only into Inter, Poppins, IBM Plex Mono, PM NieR Sans and PM NieR Mono, the
  families in `SYMBOL_MIRRORED` (`tools/settings_layer.py`). None of the terminal families is among them. The page's symbol
  set includes the box-drawing lines U+2500, U+2502 and U+2550, so a mirror would replace the terminal's own line glyphs.
- Box-drawing (U+2500 to U+257F), block (U+2580 to U+259F), braille (U+2800 to U+28FF) and powerline (from U+E0B0) cells
  are drawn procedurally by the terminal (`js/22-glyphs.js`). No terminal face is asked for them. Departure Mono has its
  own U+2500 and U+2588 glyphs, and the terminal still draws those itself. None of these faces has U+2800 or U+E0B0.
- JetBrains Mono reuses the PM NieR Mono bytes. `pmt-jetbrains-mono-latin-var.woff2` is a byte-for-byte copy of the NieR
  file (31432 bytes, about 31 KB), duplicated under the general family name rather than aliased at runtime, for
  robustness: the terminal does not depend on the NieR face being declared.

## What the checks found

- The upright JetBrains Mono file has a wght axis of 400 to 800, not 100 to 800. Its @font-face therefore declares
  `font-weight: 400 800`. Thin upright weights would need a new file from Google Fonts (100 to 800). That would break the
  byte-for-byte reuse, so it was not fetched.
- Departure Mono is SIL OFL 1.1, not MIT as the brief says. Its own name table (IDs 13 and 14), the release zip's LICENSE
  and the repository README (which lists the font as SIL OFL and the site as MIT) all agree. The MIT licence at the
  repository root covers the site code, so `LICENSE-DepartureMono.txt` holds the OFL 1.1 text. Both licences are
  permissive (D17).
- Sixtyfour has no wght axis. Set its axes with `font-variation-settings: "BLED" n, "SCAN" n`.
- VT323, Sixtyfour and Departure Mono have a single weight (400). Without `font-synthesis-weight: none`, a bold request
  is met by the browser's synthetic bold.
- Atkinson Hyperlegible Mono's variable default instance is ExtraLight (wght 200), and its name table family is
  "Atkinson Hyperlegible Mono ExtraLight". The browser uses the CSS family name, and `font-weight` picks the instance.
