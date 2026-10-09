# Embedded web fonts

The page's own faces, declared in `src/css/01-webfonts.css` and inlined as data: URIs by `tools/build.py` (through
`settings_layer.inline_fonts`). Nothing here is loaded over the network at runtime. All are under the SIL Open Font
License 1.1; NieR Mode's faces live separately in `src/settings/nier/fonts`.

Fetched 2026-10-09. Each family is split by `unicode-range` the way Google Fonts serves it: the Latin file, declared last
so it draws everything it has, and one slice per other script the family carries (Latin Extended, Vietnamese, Cyrillic
and Cyrillic Extended, Greek and Greek Extended, Devanagari), so the browser decodes only the slices a page uses. The
slices were added on 2026-10-09 (DL-161 amended: wider-than-Latin coverage) from the same font versions as the Latin
files; every `unicode-range` is Google's for that slice. Gelasio stays Latin only: it sets one Latin "i".

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
| `inter-cyrillic-ext-100-900-italic.woff2` | Google Fonts css2 `Inter:ital,wght@0,100..900;1,100..900`, cyrillic-ext (Inter 4.001, v20) | `39689184132e9fba` |
| `inter-cyrillic-100-900-italic.woff2` | Google Fonts css2 `Inter:ital,wght@0,100..900;1,100..900`, cyrillic (Inter 4.001, v20) | `47d42151dff6d13f` |
| `inter-greek-ext-100-900-italic.woff2` | Google Fonts css2 `Inter:ital,wght@0,100..900;1,100..900`, greek-ext (Inter 4.001, v20) | `787fc783f35c9133` |
| `inter-greek-100-900-italic.woff2` | Google Fonts css2 `Inter:ital,wght@0,100..900;1,100..900`, greek (Inter 4.001, v20) | `29e273a42cac8240` |
| `inter-vietnamese-100-900-italic.woff2` | Google Fonts css2 `Inter:ital,wght@0,100..900;1,100..900`, vietnamese (Inter 4.001, v20) | `1991ed5832eb07f7` |
| `inter-latin-ext-100-900-italic.woff2` | Google Fonts css2 `Inter:ital,wght@0,100..900;1,100..900`, latin-ext (Inter 4.001, v20) | `71254244ccb1ec21` |
| `inter-cyrillic-ext-100-900-normal.woff2` | Google Fonts css2 `Inter:ital,wght@0,100..900;1,100..900`, cyrillic-ext (Inter 4.001, v20) | `ca157063339ac4ad` |
| `inter-cyrillic-100-900-normal.woff2` | Google Fonts css2 `Inter:ital,wght@0,100..900;1,100..900`, cyrillic (Inter 4.001, v20) | `71d5ee93cc1e9f1d` |
| `inter-greek-ext-100-900-normal.woff2` | Google Fonts css2 `Inter:ital,wght@0,100..900;1,100..900`, greek-ext (Inter 4.001, v20) | `6e9e020a25f9b56d` |
| `inter-greek-100-900-normal.woff2` | Google Fonts css2 `Inter:ital,wght@0,100..900;1,100..900`, greek (Inter 4.001, v20) | `1be3448e292fbf05` |
| `inter-vietnamese-100-900-normal.woff2` | Google Fonts css2 `Inter:ital,wght@0,100..900;1,100..900`, vietnamese (Inter 4.001, v20) | `5c66f9e07e90c6d4` |
| `inter-latin-ext-100-900-normal.woff2` | Google Fonts css2 `Inter:ital,wght@0,100..900;1,100..900`, latin-ext (Inter 4.001, v20) | `34b9c504cab7a73e` |
| `poppins-devanagari-400-italic.woff2` | Google Fonts css2 `Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600`, devanagari (4.004, v24) | `cde48c89e89f53ae` |
| `poppins-latin-ext-400-italic.woff2` | Google Fonts css2 `Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600`, latin-ext (4.004, v24) | `1e91b430ebe5aa34` |
| `poppins-devanagari-600-italic.woff2` | Google Fonts css2 `Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600`, devanagari (4.004, v24) | `73b9ec8afb28abd1` |
| `poppins-latin-ext-600-italic.woff2` | Google Fonts css2 `Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600`, latin-ext (4.004, v24) | `10a9b6414cbebd69` |
| `poppins-devanagari-400-normal.woff2` | Google Fonts css2 `Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600`, devanagari (4.004, v24) | `6b986471df6084ba` |
| `poppins-latin-ext-400-normal.woff2` | Google Fonts css2 `Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600`, latin-ext (4.004, v24) | `0b1fcab42c18b69b` |
| `poppins-devanagari-500-normal.woff2` | Google Fonts css2 `Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600`, devanagari (4.004, v24) | `f018c9ad67dc6c2c` |
| `poppins-latin-ext-500-normal.woff2` | Google Fonts css2 `Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600`, latin-ext (4.004, v24) | `af5fda16a19169e0` |
| `poppins-devanagari-600-normal.woff2` | Google Fonts css2 `Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600`, devanagari (4.004, v24) | `58dba357cb1e89bf` |
| `poppins-latin-ext-600-normal.woff2` | Google Fonts css2 `Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600`, latin-ext (4.004, v24) | `bb1f2d582e7fba58` |
| `poppins-devanagari-700-normal.woff2` | Google Fonts css2 `Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600`, devanagari (4.004, v24) | `de10eb6f1f452594` |
| `poppins-latin-ext-700-normal.woff2` | Google Fonts css2 `Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600`, latin-ext (4.004, v24) | `ccfd87f69ef00d81` |
| `poppins-devanagari-800-normal.woff2` | Google Fonts css2 `Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600`, devanagari (4.004, v24) | `6c6bb57f25ccf0ee` |
| `poppins-latin-ext-800-normal.woff2` | Google Fonts css2 `Poppins:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600`, latin-ext (4.004, v24) | `a72eccfa6cfa9c26` |
| `nunito-cyrillic-ext-200-1000-normal.woff2` | Google Fonts css2 `Nunito:wght@200..1000`, cyrillic-ext (Nunito 3.602) | `88985ca614d50fbe` |
| `nunito-cyrillic-200-1000-normal.woff2` | Google Fonts css2 `Nunito:wght@200..1000`, cyrillic (Nunito 3.602) | `63b14e3ef0966785` |
| `nunito-vietnamese-200-1000-normal.woff2` | Google Fonts css2 `Nunito:wght@200..1000`, vietnamese (Nunito 3.602) | `61e5958cf3c73142` |
| `nunito-latin-ext-200-1000-normal.woff2` | Google Fonts css2 `Nunito:wght@200..1000`, latin-ext (Nunito 3.602) | `2c8d792869818ecb` |
| `ibm-plex-mono-cyrillic-ext-400-italic.woff2` | Google Fonts css2 `IBM Plex Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600`, cyrillic-ext (2.3) | `a0b3b8cbe5a516e7` |
| `ibm-plex-mono-cyrillic-400-italic.woff2` | Google Fonts css2 `IBM Plex Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600`, cyrillic (2.3) | `4aded3f2f2a7d27d` |
| `ibm-plex-mono-vietnamese-400-italic.woff2` | Google Fonts css2 `IBM Plex Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600`, vietnamese (2.3) | `a6bab38af4f9c761` |
| `ibm-plex-mono-latin-ext-400-italic.woff2` | Google Fonts css2 `IBM Plex Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600`, latin-ext (2.3) | `1b07eee6df7d26b3` |
| `ibm-plex-mono-cyrillic-ext-600-italic.woff2` | Google Fonts css2 `IBM Plex Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600`, cyrillic-ext (2.3) | `4d51c1c24f011b0d` |
| `ibm-plex-mono-cyrillic-600-italic.woff2` | Google Fonts css2 `IBM Plex Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600`, cyrillic (2.3) | `20811c3ee42d0e1d` |
| `ibm-plex-mono-vietnamese-600-italic.woff2` | Google Fonts css2 `IBM Plex Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600`, vietnamese (2.3) | `a6816ab1d293a41f` |
| `ibm-plex-mono-latin-ext-600-italic.woff2` | Google Fonts css2 `IBM Plex Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600`, latin-ext (2.3) | `979f73fb848c6002` |
| `ibm-plex-mono-cyrillic-ext-400-normal.woff2` | Google Fonts css2 `IBM Plex Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600`, cyrillic-ext (2.3) | `f8c22ec1804bd696` |
| `ibm-plex-mono-cyrillic-400-normal.woff2` | Google Fonts css2 `IBM Plex Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600`, cyrillic (2.3) | `7635422bd10ddbbc` |
| `ibm-plex-mono-vietnamese-400-normal.woff2` | Google Fonts css2 `IBM Plex Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600`, vietnamese (2.3) | `62632b6375305e70` |
| `ibm-plex-mono-latin-ext-400-normal.woff2` | Google Fonts css2 `IBM Plex Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600`, latin-ext (2.3) | `6bc0f226a5b7884a` |
| `ibm-plex-mono-cyrillic-ext-500-normal.woff2` | Google Fonts css2 `IBM Plex Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600`, cyrillic-ext (2.3) | `3febe5c7f22e4b07` |
| `ibm-plex-mono-cyrillic-500-normal.woff2` | Google Fonts css2 `IBM Plex Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600`, cyrillic (2.3) | `1d89462e86cb8e87` |
| `ibm-plex-mono-vietnamese-500-normal.woff2` | Google Fonts css2 `IBM Plex Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600`, vietnamese (2.3) | `781633d95de88040` |
| `ibm-plex-mono-latin-ext-500-normal.woff2` | Google Fonts css2 `IBM Plex Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600`, latin-ext (2.3) | `6bb06407c97584b0` |
| `ibm-plex-mono-cyrillic-ext-600-normal.woff2` | Google Fonts css2 `IBM Plex Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600`, cyrillic-ext (2.3) | `83109cdd4f8665b4` |
| `ibm-plex-mono-cyrillic-600-normal.woff2` | Google Fonts css2 `IBM Plex Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600`, cyrillic (2.3) | `2b05a8695c7f9f4a` |
| `ibm-plex-mono-vietnamese-600-normal.woff2` | Google Fonts css2 `IBM Plex Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600`, vietnamese (2.3) | `51b74d53e106ba8a` |
| `ibm-plex-mono-latin-ext-600-normal.woff2` | Google Fonts css2 `IBM Plex Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600`, latin-ext (2.3) | `32057cf50dd14bdb` |
| `ibm-plex-mono-cyrillic-ext-700-normal.woff2` | Google Fonts css2 `IBM Plex Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600`, cyrillic-ext (2.3) | `31fbbf2279dd1bdf` |
| `ibm-plex-mono-cyrillic-700-normal.woff2` | Google Fonts css2 `IBM Plex Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600`, cyrillic (2.3) | `104701bedfa06b56` |
| `ibm-plex-mono-vietnamese-700-normal.woff2` | Google Fonts css2 `IBM Plex Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600`, vietnamese (2.3) | `6de519604eba816d` |
| `ibm-plex-mono-latin-ext-700-normal.woff2` | Google Fonts css2 `IBM Plex Mono:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600`, latin-ext (2.3) | `5b9b81f54dd69635` |
| `OFL-Inter.txt` | https://github.com/google/fonts/blob/main/ofl/inter/OFL.txt | `5b9321a4298cfeb6` |
| `OFL-Poppins.txt` | https://github.com/google/fonts/blob/main/ofl/poppins/OFL.txt | `6be04893d770899a` |
| `OFL-IBMPlexMono.txt` | https://github.com/google/fonts/blob/main/ofl/ibmplexmono/OFL.txt | `7e6b2818edbd8f6a` |
| `OFL-Nunito.txt` | https://github.com/google/fonts/blob/main/ofl/nunito/OFL.txt | `580df76c95a1ec5a` |
| `OFL-Gelasio.txt` | https://github.com/google/fonts/blob/main/ofl/gelasio/OFL.txt | `b393cb01867c919b` |

5.6 Pro embeds 39 of these files: Inter upright, Poppins 400-700 and IBM Plex Mono 400-700, each with its Latin file
and slices. They must stay byte-identical to what 5.6 Pro embeds, so both concepts render the same face
(Plans/DRY_Rules.md DR-050). 5.6 Pro's NieR faces (`nier-fonts.js`) are generated from `src/settings/nier/fonts` in the
order of `13-nier.css` by its `nier_palette_56.py`. `tools/build.py --check` decodes every face 5.6 Pro embeds and fails if one is missing here
byte for byte. If 5.6 Pro changes its faces, decode them again into this folder and update this table.

Georgia, which the base page names for the info badges' "i", is proprietary and cannot be embedded. Gelasio (by Eben
Sorkin) is drawn to Georgia's metrics and is declared under the family name `Georgia`.

## NieR Mode's slices (`src/settings/nier/fonts`)

`mplus1-latin-var.woff2` (PM NieR Sans) and `jetbrains-mono-latin-var.woff2` (PM NieR Mono) are unchanged; these slices add
the other scripts each carries, declared before them in `src/settings/styles.d/13-nier.css`. M PLUS 1's Japanese (116
slices, 2,599,644 bytes) is not embedded. Licences: `src/settings/nier/fonts/OFL-MPLUS1.txt` and `OFL-JetBrainsMono.txt`.

| File | Source | SHA-256 (first 16) |
|---|---|---|
| `jetbrains-mono-cyrillic-ext-var.woff2` | Google Fonts css2 `JetBrains Mono:wght@100..800`, cyrillic-ext (2.211) | `593ccd6fe36e299e` |
| `jetbrains-mono-cyrillic-var.woff2` | Google Fonts css2 `JetBrains Mono:wght@100..800`, cyrillic (2.211) | `d274604c40757f98` |
| `jetbrains-mono-greek-var.woff2` | Google Fonts css2 `JetBrains Mono:wght@100..800`, greek (2.211) | `ee863198077f3093` |
| `jetbrains-mono-vietnamese-var.woff2` | Google Fonts css2 `JetBrains Mono:wght@100..800`, vietnamese (2.211) | `2288795da89dd97e` |
| `jetbrains-mono-latin-ext-var.woff2` | Google Fonts css2 `JetBrains Mono:wght@100..800`, latin-ext (2.211) | `79bfdab9ba467e26` |
| `mplus1-vietnamese-var.woff2` | Google Fonts css2 `M PLUS 1:wght@100..900`, vietnamese (1.100) | `d04e0dfea99a126c` |
| `mplus1-latin-ext-var.woff2` | Google Fonts css2 `M PLUS 1:wght@100..900`, latin-ext (1.100) | `18ddfd35cd0156af` |

## PM Symbols (`pm-symbols-sans.woff2`, `pm-symbols-mono.woff2`)

The 21 symbol characters the page uses that no text face above carries (arrows, check and cross marks, triangles,
the warning sign, dots, math signs, the command key and box-drawing lines). They were drawn for Puppet Master on
2026-10-09 as SVG in `symbols/svg/<sans|mono>/<400|700>/uXXXX.svg`, are our own work, and carry no third-party licence.
`tools/symbols_font.py --write` builds them into two variable fonts (wght 400-700; the mono one is 600 units wide), and
`src/css/03-symbols.css` attaches them to every embedded text face for those characters only. The tool needs
fontTools and brotli, which the build itself does not: `python3 -m venv v && v/bin/pip install fonttools brotli`, then
`v/bin/python tools/symbols_font.py --write` (or `--check`, or `--preview DIR`). The SVG format is in the tool's docstring; the
design brief the glyphs were drawn from is `tools/symbols_design.md`.
