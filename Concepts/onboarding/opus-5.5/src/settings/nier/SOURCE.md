# NieR Mode sources

Inputs for NieR Mode (Settings > Theme & colors). Fetched 2026-09-28; nothing here is loaded over the network at runtime.

| File | Source | SHA-256 |
|---|---|---|
| `nier-automata.json` | https://github.com/SunkenInTime/t3-themes/blob/main/themes/nier-automata.json (by SunkenInTime; shown at https://t3themes.com/themes/nier-automata/) | `2f07b66284a53c9a…` |
| `fonts/jetbrains-mono-latin-var.woff2` | Google Fonts, JetBrains Mono, Latin subset, variable wght 100-800 (SIL OFL 1.1) | `83c005d49d8a6a50…` |
| `fonts/mplus1-latin-var.woff2` | Google Fonts, M PLUS 1, Latin subset, variable wght 100-900 (SIL OFL 1.1) | `77ee7372ddeaf2b2…` |
| `fonts/OFL-JetBrainsMono.txt` | https://github.com/JetBrains/JetBrainsMono/blob/master/OFL.txt | `a76abf002c49097d…` |
| `fonts/OFL-MPLUS1.txt` | https://github.com/google/fonts/blob/main/ofl/mplus1/OFL.txt | `04971e3fcee60b24…` |

The in-game NieR: Automata UI face is Fontworks' FOT-Rodin (commercial). M PLUS 1 is the embedded stand-in ("PM NieR Sans"),
JetBrains Mono the code face ("PM NieR Mono"); styles.d/13-nier.css declares both and tools/settings_layer.py inlines them
as data: URIs.

Chosen 2026-09-28 over Zen Kaku Gothic New (the other candidate fetched the same day) from a side-by-side render of
menus, labels, numbers and wide-tracked capitals on the NieR parchment: M PLUS 1 is the closer match to Rodin's Latin, a
clean geometric-humanist gothic with open counters, a round, fairly wide set and a tall x-height (x/H 0.71 against Zen
Kaku Gothic New's 0.69; its Latin is also 16% narrower and reads a size smaller at the app's 13-15 px, which Rodin does
not). One variable file also gives every weight from 400 to 700 for 34 KB, where Zen Kaku Gothic New needed three static
files. The Zen Kaku Gothic New files and licence were removed.
