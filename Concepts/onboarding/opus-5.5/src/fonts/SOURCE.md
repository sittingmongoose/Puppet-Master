# Embedded web fonts

The page's own faces, declared in `src/css/01-webfonts.css` and inlined as data: URIs by `tools/build.py` (through
`settings_layer.inline_fonts`). Nothing here is loaded over the network at runtime. All are Latin subsets under the SIL
Open Font License 1.1; NieR Mode's faces live separately in `src/settings/nier/fonts`.

Fetched 2026-10-09.

| File | Source | SHA-256 (first 16) |
|---|---|---|
| `inter-latin-100-900-normal.woff2` | 5.6 Pro `styles.css` @font-face Inter, decoded byte-for-byte (identical to Google Fonts' Inter v20 latin, Inter 4.001) | `3100e775e8616cd2` |
| `poppins-latin-400-normal.woff2` | 5.6 Pro `styles.css` @font-face Poppins 400 (identical to Google Fonts' Poppins v24 latin, 4.004) | `7d93459d86585bfc` |
| `poppins-latin-500-normal.woff2` | 5.6 Pro `styles.css` @font-face Poppins 500 (identical to Google Fonts) | `cd36de204aca2d5f` |
| `poppins-latin-600-normal.woff2` | 5.6 Pro `styles.css` @font-face Poppins 600 (identical to Google Fonts) | `f4e80d9dfd374d02` |
| `poppins-latin-700-normal.woff2` | 5.6 Pro `styles.css` @font-face Poppins 700 (identical to Google Fonts) | `9338e65fc077355c` |
| `ibm-plex-mono-latin-400-normal.woff2` | 5.6 Pro `pmx-system.css` @font-face IBM Plex Mono 400 (Plex Mono 2.3) | `64bc2a00d28ef824` |
| `ibm-plex-mono-latin-500-normal.woff2` | 5.6 Pro `pmx-system.css` @font-face IBM Plex Mono 500 | `7cc6a8cf805d59d3` |
| `ibm-plex-mono-latin-600-normal.woff2` | 5.6 Pro `pmx-system.css` @font-face IBM Plex Mono 600 | `080d1ddb7975daec` |
| `ibm-plex-mono-latin-700-normal.woff2` | 5.6 Pro `pmx-system.css` @font-face IBM Plex Mono 700 | `a93b6deaacd55cb3` |
| `inter-latin-100-900-italic.woff2` | Google Fonts css2 `Inter:ital,wght@1,100..900`, latin (Inter 4.001) | `7291b5970da22374` |
| `poppins-latin-800-normal.woff2` | Google Fonts css2 `Poppins:wght@800`, latin (4.004) | `60bf0aba6526436f` |
| `poppins-latin-400-italic.woff2` | Google Fonts css2 `Poppins:ital,wght@1,400`, latin (4.004) | `50d0c1742d80ac71` |
| `poppins-latin-600-italic.woff2` | Google Fonts css2 `Poppins:ital,wght@1,600`, latin (4.004) | `3ad6c8bd3624555d` |
| `ibm-plex-mono-latin-400-italic.woff2` | Google Fonts css2 `IBM Plex Mono:ital,wght@1,400`, latin (2.3) | `0840095faae86403` |
| `ibm-plex-mono-latin-600-italic.woff2` | Google Fonts css2 `IBM Plex Mono:ital,wght@1,600`, latin (2.3) | `42a8ca72a19c5ee1` |
| `nunito-latin-200-1000-normal.woff2` | Google Fonts css2 `Nunito:wght@200..1000`, latin (Nunito 3.602) | `ba344451eab25b21` |
| `gelasio-latin-700-italic.woff2` | Google Fonts css2 `Gelasio:ital,wght@1,700`, latin (Gelasio 1.008) | `33881ef5fa10796d` |
| `OFL-Inter.txt` | https://github.com/google/fonts/blob/main/ofl/inter/OFL.txt | `5b9321a4298cfeb6` |
| `OFL-Poppins.txt` | https://github.com/google/fonts/blob/main/ofl/poppins/OFL.txt | `6be04893d770899a` |
| `OFL-IBMPlexMono.txt` | https://github.com/google/fonts/blob/main/ofl/ibmplexmono/OFL.txt | `7e6b2818edbd8f6a` |
| `OFL-Nunito.txt` | https://github.com/google/fonts/blob/main/ofl/nunito/OFL.txt | `580df76c95a1ec5a` |
| `OFL-Gelasio.txt` | https://github.com/google/fonts/blob/main/ofl/gelasio/OFL.txt | `b393cb01867c919b` |

The nine 5.6 Pro files must stay byte-identical to what 5.6 Pro embeds, so both concepts render the same face
(Plans/DRY_Rules.md DR-050). `tools/build.py --check` decodes every face 5.6 Pro embeds and fails if one is missing here
byte for byte. If 5.6 Pro changes its faces, decode them again into this folder and update this table.

Georgia, which the base page names for the info badges' "i", is proprietary and cannot be embedded. Gelasio (by Eben
Sorkin) is drawn to Georgia's metrics and is declared under the family name `Georgia`.

## PM Symbols (`pm-symbols-sans.woff2`, `pm-symbols-mono.woff2`)

The 21 symbol characters the page uses that no text face above carries (arrows, check and cross marks, triangles,
the warning sign, dots, math signs, the command key and box-drawing lines). They were drawn for Puppet Master on
2026-10-09 as SVG in `symbols/svg/<sans|mono>/<400|700>/uXXXX.svg`, are our own work, and carry no third-party licence.
`tools/symbols_font.py --write` builds them into two variable fonts (wght 400-700; the mono one is 600 units wide), and
`src/css/03-symbols.css` attaches them to every embedded text face for those characters only. The tool needs
fontTools and brotli, which the build itself does not: `python3 -m venv v && v/bin/pip install fonttools brotli`, then
`v/bin/python tools/symbols_font.py --write` (or `--check`, or `--preview DIR`). The SVG format is in the tool's docstring; the
design brief the glyphs were drawn from is `tools/symbols_design.md`.
