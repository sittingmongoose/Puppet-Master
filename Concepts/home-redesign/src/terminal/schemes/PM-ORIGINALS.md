# Puppet Master's own terminal colour schemes

`pm-originals.json` (same folder) holds the seven colour schemes Puppet Master authored for D15. They are licensed
`PM-authored`; no third-party scheme file was copied. The two YoRHa schemes reuse colour values from NieR Mode's
palette (see section 9). Authored 2026-10-09 by the terminal concept build (branch `concept/home-terminal-20261009`).

| Scheme | id | Appearance | Default for | Pairs with | Foreground | Lowest of ANSI 1-7, 9-15 | ANSI 8 | Selection text |
|---|---|---|---|---|---|---|---|---|
| PM Phosphor Green | `pm-phosphor-green` | dark | Retro dark | PM Paper Teletype | 12.70:1 | 7.02:1 (4 blue) | 3.84:1 | 7.65:1 |
| PM Phosphor Amber | `pm-phosphor-amber` | dark | Retro dark, sibling | PM Paper Teletype | 11.38:1 | 6.20:1 (1 red) | 3.84:1 | 7.05:1 |
| PM Paper Teletype | `pm-paper-teletype` | light | Retro light | Phosphor Green or Amber | 14.07:1 | 4.72:1 (14 bright cyan) | 3.11:1 | 11.62:1 |
| PM YoRHa Parchment | `pm-yorha-parchment` | light | NieR light | PM YoRHa Ink | 9.76:1 | 4.71:1 (6 cyan) | 3.13:1 | 6.12:1 |
| PM YoRHa Ink | `pm-yorha-ink` | dark | NieR dark | PM YoRHa Parchment | 9.09:1 | 5.44:1 (1 and 9, rust) | 3.68:1 | 6.66:1 |
| PM High Contrast Light | `pm-high-contrast-light` | light | none (`look: null`, offered in every look) | PM High Contrast Dark | 21.00:1 | 7.07:1 (13 bright magenta); all 16 at least 7.07:1 | 7.23:1 | 10.05:1 |
| PM High Contrast Dark | `pm-high-contrast-dark` | dark | none (`look: null`, offered in every look) | PM High Contrast Light | 21.00:1 | 9.49:1 (1 red); all 16 at least 8.33:1 | 12.04:1 | 12.78:1 |

## 1. Rules every scheme meets

Ratios are WCAG 2.x contrast ratios: relative luminance `L = 0.2126 R + 0.7152 G + 0.0722 B` over linearised sRGB
(`c / 12.92` up to 0.04045, else `((c + 0.055) / 1.055) ^ 2.4`), ratio `(L1 + 0.05) / (L2 + 0.05)`. Every number in
this file was computed from the hex values in `pm-originals.json` with that formula by a short Python script (not
kept; section 6 is its output).

| Pair | Floor | High Contrast schemes |
|---|---|---|
| foreground on background | 7:1 | 7:1 |
| ANSI 1-7 and 9-15 on background | 4.5:1 | 7:1 |
| ANSI 8 (bright black, the dim comment colour) on background | 3:1 | 7:1 |
| ANSI 0 on background | none on dark schemes; light schemes reach it anyway | 7:1 (all sixteen) |
| selectionForeground on selectionBackground | 4.5:1 | 7:1 |
| cursor on background | 3:1 | 3:1 |
| cursorText on cursor (not required; checked) | 4.5:1 | 7:1 |
| role `link` on background | 4.5:1 | 7:1 |
| foreground on role `searchMatch` and on `searchCurrent` | 4.5:1 | 7:1 |
| role `markOk`, `markFail` on background | 4.5:1 | 4.5:1 |
| role `markNeutral`, `progress`, `attention` on background | 3:1 (WCAG 1.4.11 non-text) | 3:1 |

Colours were designed in OKLCH (Ottosson's OKLab in polar form) and converted to sRGB; a colour outside sRGB had its
chroma reduced at constant L and hue. The tables list the measured OKLCH of the final hex, so where a measured chroma
is lower than the value named in the rationale, sRGB clipped it.

## 2. What the roles mean (for the renderer)

| Role | Meaning |
|---|---|
| `link` | Text colour of OSC 8 hyperlinks, detected URLs and `path:line:col` links. The hover underline uses the same colour. |
| `searchMatch` | Background fill of every find match. The cell keeps its own text colour; the scheme guarantees the foreground at 4.5:1 (7:1 in HC) on it. |
| `searchCurrent` | Background fill of the current match, stronger than `searchMatch`; text kept the same way. Recommended: the renderer also draws a 1 px outline in the foreground colour around the current match (section 8). |
| `markOk`, `markFail`, `markNeutral` | The shell-integration command mark glyph on a prompt line (D13): exit 0, non-zero exit, and no exit yet (running, or never finished). Glyph colours only; never a stripe. |
| `progress` | OSC 9;4 progress bar (state 1, and the static indeterminate state 3). Error state 2 uses `markFail`; paused state 4 uses `markNeutral`. |
| `attention` | The attention mark (needs input, finished in the background) inside the terminal. |
| `glow` | Phosphor schemes only: the tint of the bloom (`T.FXGL` glow pass and the no-GPU CSS text-shadow). Absent from every other scheme, which for NieR also means "no glow" (D16). |

Selection: every PM scheme sets `selectionForeground`, and the renderer must use it. The foreground on the selection
fill alone is only 1.21-2.09:1 in these schemes (they use reverse video or solid ink), so a renderer that kept the
cells' own colours inside a selection would fail the floor.

## 3. Design rationale

### 3.1 The phosphor schemes: one phosphor, sixteen shades of it

A monochrome tube has one colour. Both phosphor schemes build all sixteen ANSI colours, the foreground, the cursor and
the selection out of a single phosphor hue, so the screen reads as one tube. Errors and warnings still have to read, so
each ANSI slot is placed on three axes inside the phosphor family:

1. **Hue lanes.** The phosphor has a core hue and two edges no more than 30 degrees (OKLCH hue) from it. The warm
   edge carries red (and, on green, yellow); the cool edge carries blue and cyan; green, white and the foreground stay
   on the core.
2. **Luminance tiers** (OKLab L): dim, normal, hot and brightest. Every hue-shifted colour also sits on a different
   tier from green and from the foreground, so the distinction survives colour-vision deficiency (the deuteranope and
   protanope distances in section 6 come from a full-severity Machado 2009 simulation).
3. **Chroma.** The error colour is the most saturated slot; the warning colour is pale. Saturated against pale
   separates red from yellow even where their lightness is close.

**PM Phosphor Green** (P1 style). Core hue 146, the anatomy mock's `#7cf08a` (h 146.4). Background L 0.165 (the unlit
tube), foreground L 0.845 C 0.175.

| Slot | Lane (hue) | Tier (L) | Chroma | Reads as |
|---|---|---|---|---|
| 2 green | core 146 | 0.745, one step under the foreground | 0.20 | deeper phosphor: success, additions |
| 1 red | warm, core -24 = 122 | 0.885, hot: above the foreground (+0.04) and green (+0.14) | 0.20, the slot's limit | hot yellow-green: errors, deletions |
| 3 yellow | warm, core -14 = 132 | 0.950, brightest coloured tier | 0.12, pale | bright pale lime: warnings |
| 9 bright red, 11 bright yellow | warm, core -26 and -22 | 0.925 and 0.955 | 0.20 and 0.16 (0.126 after clipping) | |
| 4 blue, 12 bright blue | cool, core +24 = 170 | 0.680 (dim) and 0.770 | 0.11 | blue-green: directories |
| 6 cyan, 14 bright cyan | cool, core +18 = 164 | 0.800 and 0.885 | 0.12 | aqua: symlinks, links |
| 5 magenta, 13 bright magenta | core +10 = 156 | 0.725 and 0.815 | 0.06, grey-green | |
| 7 white, 15 bright white | core | 0.815 and 0.975 | 0.055 and 0.035 | pale phosphor, white-hot centre |
| 8 bright black | core | 0.535, dim tier | 0.085 | comments (3.84:1) |
| 0 black | core | 0.320 | 0.05 | unlit phosphor; the fill for `40` |

Measured: red against green dE 0.162 (deuteranope 0.157, protanope 0.121), yellow against green 0.227, red against
yellow 0.113, red against the foreground 0.090. In the preview, `error[E0308]` reads hot yellow-green, `warning` bright
and pale, `Compiling` and diff additions deep green, and all three read apart from the body text.

**PM Phosphor Amber** (P3 style). Core hue 70, between `#ffb000` (h 76) and `#ffb347` (h 72). On amber the warm edge
is a real red-orange, so red goes the other way in luminance: deeper and more saturated rather than brighter.

| Slot | Lane (hue) | Tier (L) | Chroma | Reads as |
|---|---|---|---|---|
| 2 green | core 70 | 0.795, one step under the foreground (0.835) | 0.165 | plain amber: success |
| 1 red | warm, core -30 = 40 | 0.680, under green (-0.114) and the foreground (-0.155) | 0.19, the limit | deep red-orange: errors |
| 3 yellow | cool, core +24 = 94 | 0.925, brightest coloured tier | 0.13 | pale gold: warnings |
| 9 bright red, 11 bright yellow | core -30 and core +30 | 0.735 and 0.945 | 0.19 and 0.13 | |
| 4 blue, 12 bright blue | core -10 = 60 | 0.680 (dim) and 0.770 | 0.07, brown-amber | |
| 5 magenta, 13 bright magenta | core -20 = 50 | 0.730 and 0.810 | 0.075, dusty rose-amber | |
| 6 cyan, 14 bright cyan | core +16 = 86 | 0.835 and 0.905 | 0.075, straw | |
| 7 white, 15 bright white | core +6 and +8 | 0.845 and 0.970 | 0.045 and 0.03, cream | |
| 8 bright black | core -4 | 0.545, dim tier | 0.07 | comments (3.84:1) |

Measured: red against green dE 0.149 (deuteranope 0.114, protanope 0.159), yellow against green 0.151, red against
yellow 0.289.

Both phosphors: the cursor is an overdriven block (L 0.90 green, 0.89 amber) with background-coloured text; the
selection is reverse video, a phosphor fill one step under the foreground (L 0.70) with background-coloured text, so a
selection never looks like the cursor. `searchMatch` is a dark core-hue fill (L 0.315) and `searchCurrent` a warm-lane
fill (L 0.46 green, 0.40 amber), so the current match differs by hue as well as strength. `glow` is the core hue at
high chroma (`#12fb56`, `#ffa842`). Retro's scanlines and glow (D16) are drawn by the effects layer; these colours
were judged under a stand-in for it: a 1 px dark scanline (black at 0.30) every 3 px, two blooms in the glow colour
(1.5 px at 0.60 alpha and 9 px at 0.28 alpha), a glass tint of the glow colour at 6 % in the centre and a vignette to
black at 0.38 at the edges.

### 3.2 PM Paper Teletype

Carbon ink on warm roll paper, after cool-retro-term's E-Ink profile and period teleprinter and duplicator inks: a
two-colour ribbon's red, blue-black, ink green, ochre, teal and the violet of a hectograph (ditto) copy. Paper is OKLCH
0.945 0.022 85 (`#f4ecdd`, a shade warmer and darker than the Retro light page `#F5F0E8`, so the terminal reads as a
sheet on the page). Ink is 0.24 0.012 70 (`#231e19`, 14.07:1). The six inks sit at L 0.43-0.50 with chroma 0.07-0.15;
the "bright" inks are the same inks fresh (L +0.02 to +0.06, more chroma), all at 4.5:1 or more. White (7) is a pencil
grey and bright white (15) a soft pencil, because on paper "white" text must still read; bright black (8) is faded ink
for comments (3.11:1). Selection is reverse video (ink fill, paper text), the Retro idiom (D23's reverse-video tabs).
The search fills are a pale ochre wash and an ochre highlighter. Paper Teletype has no glow.

### 3.3 PM YoRHa Parchment and PM YoRHa Ink

Parchment and ink from NieR Mode's own palette (`nier/nier-automata.json` and the generated tables of
`styles.d/13-nier.css`), so the terminal and the NieR editor read as one page. Every colour the palette has is used as
is; the hues it lacks are derived at the palette's own low chroma. Nothing is saturated (chroma at most 0.105, the
palette's rust) and nothing glows.

- Background, foreground and cursor are the palette's `terminalBackground`, `terminalForeground` and `terminalCursor`
  (`#ccc8b1` and `#211f1b` light, `#2b2923` and `#d1cdb7` dark). The research report's suggested softer ink `#4E4B42`
  is 5.3:1 on parchment, under the 7:1 floor; the palette's ink is 9.76:1.
- Errors use the single rust red of the palette at text strength, `errorForeground` (`#7d3427` light, `#d98a77`
  dark). ANSI 1 and 9 are both that rust, and so is `markFail`. The palette's `error` (`#a94a38`, `#c96b57`) is 3.6:1
  and 4.0:1, too weak for text.
- Warnings use `warningForeground` (`#5c5022`, `#d3c47e`), the palette's ochre.
- Green: the palette's derived ok-text olive (`#525426`, h 111) was only 0.019 dE from the ochre, and in the preview
  `build.sh` and `warning` looked the same. Green moved to moss, h 132 light and h 130 dark at the palette's lightness
  and chroma (`#425731`, `#a9c68c`); that doubles the distance to the ochre (0.040 light, 0.056 dark) and stays an
  earth tone.
- Blue, magenta and cyan are derived slate (h 235), plum (h 345) and sage (h 190) at chroma 0.028-0.046.
- Light "bright" colours are deeper inks (L 0.35-0.39, bolder on paper; 9 stays the rust); dark "bright" colours are
  paler (L 0.82-0.88).
- Selection follows the game's selected menu row: solid ink with parchment text on Parchment (`#4d4b3f`, the palette's
  `textMuted`, with `#dcd8c2`, its on-ink colour; 6.12:1) and solid parchment with ink text on Ink (`#b5b096`, the
  dark `update` colour, with the background; 6.66:1).
- Search fills are palette colours: Parchment uses `terminalSelection` `#aeaa93` and `warning` `#a08e42`; Ink uses the
  dark `terminalSelection` `#45433a` and the ochre `#5c5022`.
- `progress` is the ink itself (D16's "ink line with square head"); `attention` is the ochre.

### 3.4 PM High Contrast Light and Dark

Pure white and pure black grounds, and all sixteen ANSI colours at 7:1 or more, ANSI 0 and 8 included. On HC Dark
that makes ANSI 0 a light grey (`#a3a3a3`, 8.33:1); on HC Light, ANSI 7 and 15 are dark greys (`#3d3d3d`, `#262626`).
No slot is ever invisible on the default background. HC Light's colours were solved for their contrast in OKLCH:
normal colours at 8.0:1, bright colours at 7.1:1 with more chroma. HC Dark uses light tints (8.3 to 21:1). HC Dark's
cursor is yellow (`#ffd60a`), so it never looks like white text; its selection is light blue with black text
(12.78:1). HC Light's selection is deep blue with white text (10.05:1). The cost of "every slot at 7:1" is
black-on-colour text: on HC Dark `\e[30;43m` gives 1.79:1, and on HC Light `\e[30;47m` gives 1.93:1, so the cell
contrast floor must be on whenever an HC scheme is active (section 8).

## 4. Light and dark pairing

With "Follow theme" on, switching the page between light and dark swaps the scheme for its partner.

| Look | Dark | Light |
|---|---|---|
| Retro | PM Phosphor Green (default), or PM Phosphor Amber | PM Paper Teletype |
| NieR | PM YoRHa Ink | PM YoRHa Parchment |
| any look (accessibility) | PM High Contrast Dark | PM High Contrast Light |

Paper Teletype has two dark partners: going dark from Paper Teletype returns to the phosphor the user last chose
(Green when they never chose one). Green and Amber both go light to Paper Teletype.

## 5. Light schemes and the white slots

On the three light schemes ANSI 7 and 15 are greys that read on the background (Paper 5.09:1 and 7.86:1, Parchment
5.21:1 and 6.03:1, HC Light 10.86:1 and 15.13:1), because programs written for dark terminals print bright white
(`97`) as ordinary text. GitHub Light does the same (its white is `#6e7781`, `schemes/github.json`). The price is that
a light scheme's `47` background is a grey: ink on it is 3.04:1 on Paper and 1.88:1 on Parchment, which the cell
contrast floor corrects.

## 6. Every colour, with its ratio

"Ratio" is against the background unless the row says otherwise. "Floor" is the rule from section 1.

### PM Phosphor Green (`pm-phosphor-green`, dark)

| Slot | Hex | OKLCH (L C h) | Ratio | Floor | Note |
|---|---|---|---|---|---|
| background | `#071109` | 0.164 0.023 150 | 1.00:1 |  | unlit tube, core hue +4 |
| foreground | `#77ea83` | 0.845 0.176 146 | 12.70:1 | 7 | core hue 146, normal intensity |
| cursor | `#7eff8c` | 0.900 0.192 146 | 15.16:1 | 3 | core, overdriven block |
| cursorText | `#071109` | 0.164 0.023 150 | 15.16:1 on cursor | 4.5 | = background |
| selectionBackground | `#58b762` | 0.701 0.151 146 | 7.65:1 |  | core, a step under the foreground (reverse video) |
| selectionForeground | `#071109` | 0.164 0.023 150 | 7.65:1 on selection | 4.5 | = background |
| 0 black | `#203a24` | 0.320 0.050 148 | 1.55:1 | none | unlit phosphor (fill for 40) |
| 1 red | `#c4ec35` | 0.884 0.199 122 | 14.08:1 | 4.5 | warm lane, core -24, hot tier |
| 2 green | `#3dcc56` | 0.745 0.200 146 | 9.12:1 | 4.5 | core, one step under the foreground |
| 3 yellow | `#d3ffb0` | 0.950 0.112 132 | 17.11:1 | 4.5 | warm lane, core -14, brightest pale tier |
| 4 blue | `#42ae8e` | 0.680 0.110 170 | 7.02:1 | 4.5 | cool lane, core +24, dim tier |
| 5 magenta | `#88b297` | 0.725 0.060 156 | 8.11:1 | 4.5 | core +10, low chroma |
| 6 cyan | `#6bd6a9` | 0.800 0.120 164 | 10.81:1 | 4.5 | cool lane, core +18 |
| 7 white | `#accdae` | 0.816 0.056 147 | 11.07:1 | 4.5 | core, low chroma (pale phosphor) |
| 8 bright black | `#4b7a4f` | 0.534 0.084 146 | 3.84:1 | 3 | core, dim tier: comments |
| 9 bright red | `#d6f941` | 0.926 0.200 120 | 16.00:1 | 4.5 | warm lane, core -26 |
| 10 bright green | `#25e954` | 0.816 0.241 146 | 11.77:1 | 4.5 | core, full chroma |
| 11 bright yellow | `#deff9f` | 0.955 0.126 124 | 17.30:1 | 4.5 | warm lane, core -22 |
| 12 bright blue | `#62cba9` | 0.770 0.110 170 | 9.73:1 | 4.5 | cool lane, core +24 |
| 13 bright magenta | `#a1d0b1` | 0.816 0.066 156 | 11.14:1 | 4.5 | core +10, low chroma |
| 14 bright cyan | `#87f2c4` | 0.884 0.120 164 | 14.20:1 | 4.5 | cool lane, core +18 |
| 15 bright white | `#e9fee9` | 0.976 0.035 145 | 18.13:1 | 4.5 | core, near white: the white-hot centre |
| role link | `#87f2c4` | 0.884 0.120 164 | 14.20:1 | 4.5 | = 14 |
| role searchMatch | `#163b1a` | 0.316 0.071 146 | 8.29:1 fg on fill | 4.5 | core, dark fill |
| role searchCurrent | `#4f6015` | 0.459 0.100 122 | 4.60:1 fg on fill | 4.5 | warm lane fill (core -24) |
| role markOk | `#3dcc56` | 0.745 0.200 146 | 9.12:1 | 4.5 | = 2 |
| role markFail | `#c4ec35` | 0.884 0.199 122 | 14.08:1 | 4.5 | = 1 |
| role markNeutral | `#4b7a4f` | 0.534 0.084 146 | 3.84:1 | 3 | = 8 |
| role progress | `#77ea83` | 0.845 0.176 146 | 12.70:1 | 3 | = foreground |
| role attention | `#d3ffb0` | 0.950 0.112 132 | 17.11:1 | 3 | = 3 |
| role glow | `#12fb56` | 0.861 0.261 146 | 13.68:1 | none | core at the sRGB chroma limit |

Foreground on the selection fill alone (if a renderer ignored selectionForeground): 1.66:1.

Separation (OKLab distance; full-severity deuteranope and protanope simulations, Machado 2009):

| Pair | dE | dE deutan | dE protan | dL |
|---|---|---|---|---|
| 1 red / 2 green | 0.162 | 0.157 | 0.121 | +0.139 |
| 3 yellow / 2 green | 0.227 | 0.209 | 0.178 | +0.205 |
| 1 red / 3 yellow | 0.113 | 0.105 | 0.114 | -0.066 |
| 9 bright red / 10 bright green | 0.153 | 0.120 | 0.073 | +0.110 |
| 11 bright yellow / 10 bright green | 0.192 | 0.139 | 0.103 | +0.139 |
| 1 red / 10 bright green | 0.121 | 0.083 | 0.041 | +0.068 |
| 9 bright red / 2 green | 0.202 | 0.194 | 0.154 | +0.181 |
| 1 red / foreground | 0.090 | 0.086 | 0.070 | +0.039 |

### PM Phosphor Amber (`pm-phosphor-amber`, dark)

| Slot | Hex | OKLCH (L C h) | Ratio | Floor | Note |
|---|---|---|---|---|---|
| background | `#150c06` | 0.165 0.020 57 | 1.00:1 |  | unlit tube, core hue -10 |
| foreground | `#ffb963` | 0.835 0.131 70 | 11.38:1 | 7 | core hue 70, normal intensity |
| cursor | `#ffd29e` | 0.891 0.084 70 | 13.77:1 | 3 | core, overdriven block |
| cursorText | `#150c06` | 0.165 0.020 57 | 13.77:1 on cursor | 4.5 | = background |
| selectionBackground | `#d58d25` | 0.700 0.140 70 | 7.05:1 |  | core, a step under the foreground (reverse video) |
| selectionForeground | `#150c06` | 0.165 0.020 57 | 7.05:1 on selection | 4.5 | = background |
| 0 black | `#432d1a` | 0.318 0.045 61 | 1.50:1 | none | unlit phosphor |
| 1 red | `#f5642b` | 0.680 0.191 40 | 6.20:1 | 4.5 | warm lane, core -30: deep red-orange |
| 2 green | `#fea621` | 0.794 0.165 70 | 9.83:1 | 4.5 | core, one step under the foreground |
| 3 yellow | `#ffe58b` | 0.924 0.114 94 | 15.48:1 | 4.5 | cool lane, core +24, bright pale tier |
| 4 blue | `#b98e6c` | 0.679 0.070 60 | 6.58:1 | 4.5 | core -10, low chroma, dim tier |
| 5 magenta | `#cf9a7d` | 0.729 0.076 50 | 7.88:1 | 4.5 | core -20, low chroma |
| 6 cyan | `#dfc691` | 0.835 0.075 86 | 11.61:1 | 4.5 | core +16, low chroma (straw) |
| 7 white | `#ddc9ac` | 0.845 0.045 77 | 11.98:1 | 4.5 | core +6, low chroma (cream) |
| 8 bright black | `#8c6843` | 0.545 0.070 66 | 3.84:1 | 3 | core -4, dim tier: comments |
| 9 bright red | `#ff7f51` | 0.735 0.168 40 | 7.73:1 | 4.5 | warm lane, core -30 |
| 10 bright green | `#ffc781` | 0.865 0.108 72 | 12.64:1 | 4.5 | core +2 |
| 11 bright yellow | `#ffef90` | 0.945 0.117 100 | 16.56:1 | 4.5 | cool lane, core +30 |
| 12 bright blue | `#d8a984` | 0.769 0.075 60 | 9.13:1 | 4.5 | core -10, low chroma |
| 13 bright magenta | `#e9b396` | 0.809 0.075 50 | 10.44:1 | 4.5 | core -20, low chroma |
| 14 bright cyan | `#f6dda7` | 0.905 0.075 86 | 14.55:1 | 4.5 | core +16, low chroma |
| 15 bright white | `#fff3e2` | 0.969 0.026 77 | 17.63:1 | 4.5 | core +8, near white |
| role link | `#f6dda7` | 0.905 0.075 86 | 14.55:1 | 4.5 | = 14 |
| role searchMatch | `#462b0b` | 0.316 0.060 67 | 7.68:1 fg on fill | 4.5 | core, dark fill |
| role searchCurrent | `#6f341f` | 0.399 0.090 40 | 5.66:1 fg on fill | 4.5 | warm lane fill (core -30) |
| role markOk | `#fea621` | 0.794 0.165 70 | 9.83:1 | 4.5 | = 2 |
| role markFail | `#f5642b` | 0.680 0.191 40 | 6.20:1 | 4.5 | = 1 |
| role markNeutral | `#8c6843` | 0.545 0.070 66 | 3.84:1 | 3 | = 8 |
| role progress | `#ffb963` | 0.835 0.131 70 | 11.38:1 | 3 | = foreground |
| role attention | `#ffe58b` | 0.924 0.114 94 | 15.48:1 | 3 | = 3 |
| role glow | `#ffa842` | 0.801 0.152 66 | 10.06:1 | none | core -4, high chroma |

Foreground on the selection fill alone (if a renderer ignored selectionForeground): 1.61:1.

Separation (OKLab distance; full-severity deuteranope and protanope simulations, Machado 2009):

| Pair | dE | dE deutan | dE protan | dL |
|---|---|---|---|---|
| 1 red / 2 green | 0.149 | 0.114 | 0.159 | -0.114 |
| 3 yellow / 2 green | 0.151 | 0.134 | 0.169 | +0.130 |
| 1 red / 3 yellow | 0.289 | 0.238 | 0.318 | -0.245 |
| 9 bright red / 10 bright green | 0.161 | 0.123 | 0.176 | -0.130 |
| 11 bright yellow / 10 bright green | 0.097 | 0.075 | 0.102 | +0.080 |
| 1 red / 10 bright green | 0.218 | 0.180 | 0.244 | -0.185 |
| 9 bright red / 2 green | 0.104 | 0.069 | 0.105 | -0.059 |
| 1 red / foreground | 0.185 | 0.149 | 0.206 | -0.155 |

### PM Paper Teletype (`pm-paper-teletype`, light)

| Slot | Hex | OKLCH (L C h) | Ratio | Floor | Note |
|---|---|---|---|---|---|
| background | `#f4ecdd` | 0.945 0.022 83 | 1.00:1 |  | warm roll paper |
| foreground | `#231e19` | 0.239 0.012 67 | 14.07:1 | 7 | carbon ink |
| cursor | `#231e19` | 0.239 0.012 67 | 14.07:1 | 3 | = foreground (ink block) |
| cursorText | `#f4ecdd` | 0.945 0.022 83 | 14.07:1 on cursor | 4.5 | = background |
| selectionBackground | `#322d26` | 0.300 0.014 76 | 11.62:1 |  | ink (reverse video) |
| selectionForeground | `#f4ecdd` | 0.945 0.022 83 | 11.62:1 on selection | 4.5 | = background |
| 0 black | `#181512` | 0.198 0.008 67 | 15.49:1 | none | carbon |
| 1 red | `#a13126` | 0.480 0.150 29 | 6.00:1 | 4.5 | ribbon red |
| 2 green | `#346b37` | 0.476 0.100 145 | 5.41:1 | 4.5 | ink green |
| 3 yellow | `#815b16` | 0.499 0.095 77 | 5.20:1 | 4.5 | ochre |
| 4 blue | `#2d4d8b` | 0.429 0.110 262 | 7.03:1 | 4.5 | blue-black ink |
| 5 magenta | `#783b82` | 0.460 0.129 322 | 6.51:1 | 4.5 | ditto (hectograph) violet |
| 6 cyan | `#216970` | 0.480 0.070 204 | 5.39:1 | 4.5 | teal ink |
| 7 white | `#67635c` | 0.501 0.012 82 | 5.09:1 | 4.5 | pencil grey (must read on paper) |
| 8 bright black | `#8b857d` | 0.620 0.014 75 | 3.11:1 | 3 | faded ink: comments |
| 9 bright red | `#b83a28` | 0.530 0.165 31 | 4.87:1 | 4.5 | ribbon red, fresh |
| 10 bright green | `#337538` | 0.504 0.115 145 | 4.78:1 | 4.5 | ink green, fresh |
| 11 bright yellow | `#8b5f0d` | 0.520 0.105 76 | 4.78:1 | 4.5 | ochre, fresh |
| 12 bright blue | `#355da9` | 0.489 0.130 262 | 5.44:1 | 4.5 | blue-black, fresh |
| 13 bright magenta | `#8b4496` | 0.509 0.145 322 | 5.32:1 | 4.5 | ditto violet, fresh |
| 14 bright cyan | `#1a737c` | 0.510 0.080 205 | 4.72:1 | 4.5 | teal, fresh |
| 15 bright white | `#4b4741` | 0.400 0.011 78 | 7.86:1 | 4.5 | soft pencil |
| role link | `#2d4d8b` | 0.429 0.110 262 | 7.03:1 | 4.5 | = 4 |
| role searchMatch | `#efdcb1` | 0.899 0.060 87 | 12.23:1 fg on fill | 4.5 | pale ochre wash |
| role searchCurrent | `#edbb64` | 0.820 0.120 80 | 9.36:1 fg on fill | 4.5 | ochre highlighter |
| role markOk | `#346b37` | 0.476 0.100 145 | 5.41:1 | 4.5 | = 2 |
| role markFail | `#a13126` | 0.480 0.150 29 | 6.00:1 | 4.5 | = 1 |
| role markNeutral | `#8b857d` | 0.620 0.014 75 | 3.11:1 | 3 | = 8 |
| role progress | `#231e19` | 0.239 0.012 67 | 14.07:1 | 3 | = foreground |
| role attention | `#a13126` | 0.480 0.150 29 | 6.00:1 | 3 | = 1 |

Foreground on the selection fill alone (if a renderer ignored selectionForeground): 1.21:1.

### PM YoRHa Parchment (`pm-yorha-parchment`, light)

| Slot | Hex | OKLCH (L C h) | Ratio | Floor | Note |
|---|---|---|---|---|---|
| background | `#ccc8b1` | 0.830 0.032 99 | 1.00:1 |  | nier-automata.json terminalBackground |
| foreground | `#211f1b` | 0.240 0.008 85 | 9.76:1 | 7 | terminalForeground (ink) |
| cursor | `#211f1b` | 0.240 0.008 85 | 9.76:1 | 3 | terminalCursor |
| cursorText | `#dcd8c2` | 0.879 0.030 99 | 11.47:1 on cursor | 4.5 | accentForeground (on-ink) |
| selectionBackground | `#4d4b3f` | 0.411 0.020 99 | 5.21:1 |  | textMuted: solid ink, the game's selected row |
| selectionForeground | `#dcd8c2` | 0.879 0.030 99 | 6.12:1 on selection | 4.5 | accentForeground |
| 0 black | `#211f1b` | 0.240 0.008 85 | 9.76:1 | none | ink |
| 1 red | `#7d3427` | 0.423 0.105 32 | 5.21:1 | 4.5 | errorForeground: the palette's rust |
| 2 green | `#425731` | 0.429 0.065 132 | 4.72:1 | 4.5 | moss, derived from --o55-nier-ok-text (h 111 to 132) |
| 3 yellow | `#5c5022` | 0.433 0.066 95 | 4.75:1 | 4.5 | warningForeground (ochre) |
| 4 blue | `#3e505a` | 0.420 0.028 233 | 4.99:1 | 4.5 | slate, derived |
| 5 magenta | `#5d4452` | 0.419 0.040 344 | 5.16:1 | 4.5 | plum, derived |
| 6 cyan | `#3b5654` | 0.431 0.033 190 | 4.71:1 | 4.5 | sage, derived |
| 7 white | `#4d4b3f` | 0.411 0.020 99 | 5.21:1 | 4.5 | textMuted |
| 8 bright black | `#6f6c5e` | 0.530 0.022 97 | 3.13:1 | 3 | faded ink, derived: comments |
| 9 bright red | `#7d3427` | 0.423 0.105 32 | 5.21:1 | 4.5 | errorForeground (the single rust) |
| 10 bright green | `#364b23` | 0.384 0.068 132 | 5.70:1 | 4.5 | deep moss, derived |
| 11 bright yellow | `#524413` | 0.391 0.068 93 | 5.68:1 | 4.5 | deep ochre, derived |
| 12 bright blue | `#2c3e4b` | 0.354 0.032 240 | 6.57:1 | 4.5 | deep slate, derived |
| 13 bright magenta | `#4e3343` | 0.359 0.046 343 | 6.64:1 | 4.5 | deep plum, derived |
| 14 bright cyan | `#274543` | 0.366 0.036 190 | 6.17:1 | 4.5 | deep sage, derived |
| 15 bright white | `#454138` | 0.376 0.016 87 | 6.03:1 | 4.5 | updateForeground |
| role link | `#2c3e4b` | 0.354 0.032 240 | 6.57:1 | 4.5 | = 12 |
| role searchMatch | `#aeaa93` | 0.735 0.032 99 | 7.03:1 fg on fill | 4.5 | terminalSelection |
| role searchCurrent | `#a08e42` | 0.647 0.099 96 | 5.05:1 fg on fill | 4.5 | warning |
| role markOk | `#425731` | 0.429 0.065 132 | 4.72:1 | 4.5 | = 2 |
| role markFail | `#7d3427` | 0.423 0.105 32 | 5.21:1 | 4.5 | = 1 |
| role markNeutral | `#4d4b3f` | 0.411 0.020 99 | 5.21:1 | 3 | = 7 |
| role progress | `#211f1b` | 0.240 0.008 85 | 9.76:1 | 3 | = foreground (ink line) |
| role attention | `#5c5022` | 0.433 0.066 95 | 4.75:1 | 3 | = 3 |

Foreground on the selection fill alone (if a renderer ignored selectionForeground): 1.88:1.

### PM YoRHa Ink (`pm-yorha-ink`, dark)

| Slot | Hex | OKLCH (L C h) | Ratio | Floor | Note |
|---|---|---|---|---|---|
| background | `#2b2923` | 0.281 0.011 92 | 1.00:1 |  | dark terminalBackground |
| foreground | `#d1cdb7` | 0.846 0.030 99 | 9.09:1 | 7 | dark terminalForeground |
| cursor | `#d1cdb7` | 0.846 0.030 99 | 9.09:1 | 3 | dark terminalCursor |
| cursorText | `#2b2923` | 0.281 0.011 92 | 9.09:1 on cursor | 4.5 | = background |
| selectionBackground | `#b5b096` | 0.754 0.036 98 | 6.66:1 |  | dark update: solid parchment |
| selectionForeground | `#2b2923` | 0.281 0.011 92 | 6.66:1 on selection | 4.5 | = background |
| 0 black | `#3d3b33` | 0.352 0.014 95 | 1.30:1 | none | dark secondary |
| 1 red | `#d98a77` | 0.710 0.101 34 | 5.44:1 | 4.5 | dark errorForeground: the palette's rust |
| 2 green | `#a9c68c` | 0.790 0.085 130 | 7.72:1 | 4.5 | moss, derived from dark ok-text (h 110 to 130) |
| 3 yellow | `#d3c47e` | 0.817 0.091 98 | 8.29:1 | 4.5 | dark warningForeground |
| 4 blue | `#99aebb` | 0.739 0.030 235 | 6.32:1 | 4.5 | slate, derived |
| 5 magenta | `#bfa1b1` | 0.740 0.041 345 | 6.20:1 | 4.5 | plum, derived |
| 6 cyan | `#96b5b3` | 0.749 0.034 192 | 6.62:1 | 4.5 | sage, derived |
| 7 white | `#a8a593` | 0.719 0.026 99 | 5.86:1 | 4.5 | dark textMuted |
| 8 bright black | `#848073` | 0.600 0.020 93 | 3.68:1 | 3 | faded parchment, derived: comments |
| 9 bright red | `#d98a77` | 0.710 0.101 34 | 5.44:1 | 4.5 | dark errorForeground (the single rust) |
| 10 bright green | `#c0dca5` | 0.860 0.079 130 | 9.71:1 | 4.5 | pale moss, derived |
| 11 bright yellow | `#e6d89b` | 0.879 0.080 97 | 10.15:1 | 4.5 | pale ochre, derived |
| 12 bright blue | `#b2c8d5` | 0.820 0.030 234 | 8.39:1 | 4.5 | pale slate, derived |
| 13 bright magenta | `#d8baca` | 0.819 0.040 345 | 8.17:1 | 4.5 | pale plum, derived |
| 14 bright cyan | `#afcfcc` | 0.830 0.034 190 | 8.74:1 | 4.5 | pale sage, derived |
| 15 bright white | `#dcd8c2` | 0.879 0.030 99 | 10.14:1 | 4.5 | accentForeground (light) |
| role link | `#b2c8d5` | 0.820 0.030 234 | 8.39:1 | 4.5 | = 12 |
| role searchMatch | `#45433a` | 0.382 0.015 97 | 6.20:1 fg on fill | 4.5 | dark terminalSelection |
| role searchCurrent | `#5c5022` | 0.433 0.066 95 | 5.00:1 fg on fill | 4.5 | light warningForeground as an ochre fill |
| role markOk | `#a9c68c` | 0.790 0.085 130 | 7.72:1 | 4.5 | = 2 |
| role markFail | `#d98a77` | 0.710 0.101 34 | 5.44:1 | 4.5 | = 1 |
| role markNeutral | `#9d9986` | 0.681 0.027 97 | 5.08:1 | 3 | dark sidebarMutedForeground |
| role progress | `#d1cdb7` | 0.846 0.030 99 | 9.09:1 | 3 | = foreground |
| role attention | `#d3c47e` | 0.817 0.091 98 | 8.29:1 | 3 | = 3 |

Foreground on the selection fill alone (if a renderer ignored selectionForeground): 1.37:1.

### PM High Contrast Light (`pm-high-contrast-light`, light)

| Slot | Hex | OKLCH (L C h) | Ratio | Floor | Note |
|---|---|---|---|---|---|
| background | `#ffffff` | 1.000 0.000 90 | 1.00:1 |  |  |
| foreground | `#000000` | 0.000 0.000 0 | 21.00:1 | 7 |  |
| cursor | `#000000` | 0.000 0.000 0 | 21.00:1 | 3 |  |
| cursorText | `#ffffff` | 1.000 0.000 90 | 21.00:1 on cursor | 7 |  |
| selectionBackground | `#0a3d91` | 0.386 0.148 261 | 10.05:1 |  |  |
| selectionForeground | `#ffffff` | 1.000 0.000 90 | 10.05:1 on selection | 7 |  |
| 0 black | `#000000` | 0.000 0.000 0 | 21.00:1 | 7 |  |
| 1 red | `#a50018` | 0.455 0.184 25 | 8.04:1 | 7 | solved for 8.0:1 |
| 2 green | `#005e15` | 0.419 0.132 145 | 8.04:1 | 7 | solved for 8.0:1 |
| 3 yellow | `#6b4b00` | 0.436 0.090 80 | 7.98:1 | 7 | solved for 8.0:1 |
| 4 blue | `#0445c0` | 0.444 0.201 262 | 8.02:1 | 7 | solved for 8.0:1 |
| 5 magenta | `#8a1593` | 0.459 0.200 325 | 8.05:1 | 7 | solved for 8.0:1 |
| 6 cyan | `#005a65` | 0.428 0.074 209 | 7.92:1 | 7 | solved for 8.0:1 |
| 7 white | `#3d3d3d` | 0.360 0.000 90 | 10.86:1 | 7 | dark grey: white must read on white |
| 8 bright black | `#575757` | 0.457 0.000 90 | 7.23:1 | 7 |  |
| 9 bright red | `#b4000a` | 0.484 0.198 28 | 7.13:1 | 7 | solved for 7.1:1 |
| 10 bright green | `#1b6600` | 0.447 0.144 140 | 7.13:1 | 7 | solved for 7.1:1 |
| 11 bright yellow | `#795000` | 0.465 0.098 75 | 7.09:1 | 7 | solved for 7.1:1 |
| 12 bright blue | `#1f4bcf` | 0.475 0.209 265 | 7.08:1 | 7 | solved for 7.1:1 |
| 13 bright magenta | `#9120a7` | 0.490 0.210 320 | 7.07:1 | 7 | solved for 7.1:1 |
| 14 bright cyan | `#00626b` | 0.453 0.077 206 | 7.10:1 | 7 | solved for 7.1:1 |
| 15 bright white | `#262626` | 0.269 0.000 90 | 15.13:1 | 7 | darkest grey |
| role link | `#0445c0` | 0.444 0.201 262 | 8.02:1 | 7 | = 4 |
| role searchMatch | `#fff09a` | 0.948 0.108 100 | 18.18:1 fg on fill | 7 |  |
| role searchCurrent | `#ffb000` | 0.812 0.170 76 | 11.46:1 fg on fill | 7 |  |
| role markOk | `#005e15` | 0.419 0.132 145 | 8.04:1 | 4.5 | = 2 |
| role markFail | `#a50018` | 0.455 0.184 25 | 8.04:1 | 4.5 | = 1 |
| role markNeutral | `#575757` | 0.457 0.000 90 | 7.23:1 | 3 | = 8 |
| role progress | `#0445c0` | 0.444 0.201 262 | 8.02:1 | 3 | = 4 |
| role attention | `#6b4b00` | 0.436 0.090 80 | 7.98:1 | 3 | = 3 |

Foreground on the selection fill alone (if a renderer ignored selectionForeground): 2.09:1.

### PM High Contrast Dark (`pm-high-contrast-dark`, dark)

| Slot | Hex | OKLCH (L C h) | Ratio | Floor | Note |
|---|---|---|---|---|---|
| background | `#000000` | 0.000 0.000 0 | 1.00:1 |  |  |
| foreground | `#ffffff` | 1.000 0.000 90 | 21.00:1 | 7 |  |
| cursor | `#ffd60a` | 0.885 0.181 95 | 14.88:1 | 3 | yellow, distinct from white text |
| cursorText | `#000000` | 0.000 0.000 0 | 14.88:1 on cursor | 7 |  |
| selectionBackground | `#9ccfff` | 0.836 0.086 247 | 12.78:1 |  |  |
| selectionForeground | `#000000` | 0.000 0.000 0 | 12.78:1 on selection | 7 |  |
| 0 black | `#a3a3a3` | 0.715 0.000 90 | 8.33:1 | 7 | light grey: black must read on black |
| 1 red | `#ff8f80` | 0.767 0.138 29 | 9.49:1 | 7 |  |
| 2 green | `#5ee87d` | 0.830 0.190 148 | 13.31:1 | 7 |  |
| 3 yellow | `#ffd60a` | 0.885 0.181 95 | 14.88:1 | 7 |  |
| 4 blue | `#8fb8ff` | 0.781 0.111 261 | 10.47:1 | 7 |  |
| 5 magenta | `#f0a3ff` | 0.821 0.149 321 | 11.39:1 | 7 |  |
| 6 cyan | `#5ce1f0` | 0.842 0.117 206 | 13.48:1 | 7 |  |
| 7 white | `#e6e6e6` | 0.925 0.000 90 | 16.83:1 | 7 |  |
| 8 bright black | `#c4c4c4` | 0.820 0.000 90 | 12.04:1 | 7 |  |
| 9 bright red | `#ffb3a8` | 0.836 0.091 28 | 12.27:1 | 7 |  |
| 10 bright green | `#a2f5b2` | 0.900 0.122 150 | 16.24:1 | 7 |  |
| 11 bright yellow | `#ffe970` | 0.929 0.143 99 | 17.14:1 | 7 |  |
| 12 bright blue | `#bdd5ff` | 0.869 0.064 262 | 14.13:1 | 7 |  |
| 13 bright magenta | `#f7c8ff` | 0.891 0.089 321 | 14.66:1 | 7 |  |
| 14 bright cyan | `#a6f0f7` | 0.909 0.073 203 | 16.43:1 | 7 |  |
| 15 bright white | `#ffffff` | 1.000 0.000 90 | 21.00:1 | 7 |  |
| role link | `#8fb8ff` | 0.781 0.111 261 | 10.47:1 | 7 | = 4 |
| role searchMatch | `#3d3600` | 0.330 0.069 101 | 12.17:1 fg on fill | 7 |  |
| role searchCurrent | `#704f00` | 0.452 0.093 81 | 7.48:1 fg on fill | 7 |  |
| role markOk | `#5ee87d` | 0.830 0.190 148 | 13.31:1 | 4.5 | = 2 |
| role markFail | `#ff8f80` | 0.767 0.138 29 | 9.49:1 | 4.5 | = 1 |
| role markNeutral | `#c4c4c4` | 0.820 0.000 90 | 12.04:1 | 3 | = 8 |
| role progress | `#8fb8ff` | 0.781 0.111 261 | 10.47:1 | 3 | = 4 |
| role attention | `#ffd60a` | 0.885 0.181 95 | 14.88:1 | 3 | = 3 |

Foreground on the selection fill alone (if a renderer ignored selectionForeground): 1.64:1.

## 7. Roles for third-party schemes (recommendation)

Third-party schemes (`schemes/<family>.json`) carry no `roles`. This is the recommended way to derive them; nothing
here changes those files. One rule set serves every look; only `progress` and `glow` depend on the look. `ensure`
means `T.color.ensure(colour, background, floor)`: move the colour's OKLab L away from the background until the floor
holds, hue untouched.

| Role | Rule | Floor |
|---|---|---|
| `link` | ANSI 4 if it reaches the floor, else ANSI 12, else `ensure(ANSI 4)` | 4.5:1 |
| `searchMatch` | dark scheme: OKLCH(L of background + 0.10, 0.045, hue of ANSI 3); light: OKLCH(0.94, 0.07, hue of ANSI 3). Step L by 0.01 (down on dark, up on light) until the foreground reaches the floor on it | foreground 4.5:1 on the fill |
| `searchCurrent` | dark: OKLCH(L of background + 0.20, 0.10, hue of ANSI 3); light: OKLCH(0.86, 0.13, hue of ANSI 3); same stepping. Plus the 1 px outline of section 8 | foreground 4.5:1 on the fill |
| `markOk` | ANSI 2, else ANSI 10, else `ensure(ANSI 2)` | 4.5:1 |
| `markFail` | ANSI 1, else ANSI 9, else `ensure(ANSI 1)` | 4.5:1 |
| `markNeutral` | ANSI 8, else `ensure(ANSI 8)`; when ANSI 8 equals ANSI 0 or the foreground, `ensure(mix(foreground, background, 0.45))` | 3:1 |
| `progress` | Friendly, Glass, Basic: the `link` colour. Retro, NieR: the foreground (Retro's block bar, NieR's ink line) | 3:1 |
| `attention` | ANSI 3, else ANSI 11, else `ensure(ANSI 3)` | 3:1 |
| `glow` | Retro look only: the foreground. Every other look: none | none |

Applied to the third-party per-look defaults (colours from the builder's files, SHA-256 in section 9; each ratio is
against the background, and for the two search fills it is the foreground on the fill):

| Look | Scheme | Foreground on background | link | searchMatch | searchCurrent | markOk | markFail | markNeutral | progress | attention | Match/current dE |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Friendly | Catppuccin Latte | 7.06:1 | `#1b63f1` 4.53 | `#ffe7ce` 6.68 | `#ffc485` 5.13 | `#227e05` 4.58 | `#d20f39` 4.80 | `#6c6f85` 4.37 | `#1b63f1` 4.53 | `#c47a05` 3.03 | 0.102 |
| Friendly | Catppuccin Mocha | 11.34:1 | `#89b4fa` 7.79 | `#43371c` 8.06 | `#694f00` 5.34 | `#a6e3a1` 11.03 | `#f38ba8` 7.08 | `#66697f` 3.04 | `#89b4fa` 7.79 | `#f9e2af` 12.91 | 0.110 |
| Glass | Tokyo Night Day | 4.52:1 | `#0761ca` 4.55 | `#ffe7c7` 4.88 | `#ffdfb4` 4.59 | `#506c30` 4.60 | `#c80a4d` 4.50 | `#7a7e9c` 3.07 | `#0761ca` 4.55 | `#8c6c3e` 3.75 | 0.026 |
| Glass | Tokyo Night Storm | 9.02:1 | `#7aa2f7` 5.78 | `#514027` 6.16 | `#744d00` 4.64 | `#9ece6a` 7.97 | `#f7768e` 5.51 | `#697193` 3.04 | `#7aa2f7` 5.78 | `#e0af68` 7.28 | 0.086 |
| Basic | One Half Light | 10.86:1 | `#057baf` 4.51 | `#ffe7c6` 9.45 | `#ffc66f` 7.32 | `#1d8534` 4.51 | `#cd4036` 4.59 | `#8f9095` 3.05 | `#057baf` 4.51 | `#c18401` 3.06 | 0.107 |
| Basic | One Half Dark | 10.48:1 | `#61afef` 5.92 | `#524329` 7.17 | `#7d5a04` 4.71 | `#98c379` 6.94 | `#e36f78` 4.54 | `#6b7589` 3.02 | `#61afef` 5.92 | `#e5c07b` 8.10 | 0.114 |

Where a rule replaced the upstream colour because it fell under its floor:

- Catppuccin Latte: link ensured from #1e66f5; markOk ensured from #40a02b; attention ensured from #df8e1d.
- Catppuccin Mocha: markNeutral ensured from #585b70.
- Tokyo Night Day: link ensured from #2e7de9; markOk ensured from #587539; markFail ensured from #f52a65; markNeutral ensured from #a1a6c5.
- Tokyo Night Storm: markNeutral ensured from #414868.
- One Half Light: link ensured from #0184bc; markOk ensured from #40a14f; markFail ensured from #e45649; markNeutral from mix(fg, bg, 0.45) because ansi 8 equals ansi 0 or the foreground.
- One Half Dark: markFail ensured from #e06c75; markNeutral ensured from #5d677a.

The same values as `roles` objects, keyed by scheme id:

```json
{
  "catppuccin-latte": {"link": "#1b63f1", "searchMatch": "#ffe7ce", "searchCurrent": "#ffc485", "markOk": "#227e05", "markFail": "#d20f39", "markNeutral": "#6c6f85", "progress": "#1b63f1", "attention": "#c47a05"},
  "catppuccin-mocha": {"link": "#89b4fa", "searchMatch": "#43371c", "searchCurrent": "#694f00", "markOk": "#a6e3a1", "markFail": "#f38ba8", "markNeutral": "#66697f", "progress": "#89b4fa", "attention": "#f9e2af"},
  "tokyo-night-day": {"link": "#0761ca", "searchMatch": "#ffe7c7", "searchCurrent": "#ffdfb4", "markOk": "#506c30", "markFail": "#c80a4d", "markNeutral": "#7a7e9c", "progress": "#0761ca", "attention": "#8c6c3e"},
  "tokyo-night-storm": {"link": "#7aa2f7", "searchMatch": "#514027", "searchCurrent": "#744d00", "markOk": "#9ece6a", "markFail": "#f7768e", "markNeutral": "#697193", "progress": "#7aa2f7", "attention": "#e0af68"},
  "one-half-light": {"link": "#057baf", "searchMatch": "#ffe7c6", "searchCurrent": "#ffc66f", "markOk": "#1d8534", "markFail": "#cd4036", "markNeutral": "#8f9095", "progress": "#057baf", "attention": "#c18401"},
  "one-half-dark": {"link": "#61afef", "searchMatch": "#524329", "searchCurrent": "#7d5a04", "markOk": "#98c379", "markFail": "#e36f78", "markNeutral": "#6b7589", "progress": "#61afef", "attention": "#e5c07b"}
}
```

## 8. Notes for the renderer and the appearance model

- **Selection.** Paint selected cells in `selectionForeground` on `selectionBackground` (section 2). Every PM scheme
  sets both.
- **Current match outline.** Draw a 1 px outline in the foreground colour around the current find match, in every
  scheme. The fills alone can be close: Tokyo Night Day's two derived fills are 0.026 dE apart because its foreground
  is only 4.52:1 on its own background, and on HC Dark the fills are 1.73:1 and 2.81:1 against black.
- **Cell contrast floor.** The PM schemes meet every rule above without the appearance model's minimum-contrast floor.
  The floor still matters for cell pairs no scheme controls: black text on a coloured background (HC Dark
  `\e[30;43m` 1.79:1), a light scheme's `47` background (Parchment 1.88:1), and ANSI-coloured text over a search
  fill. Recommendation: floor on by default at 4.5:1 for cell pairs, and 7:1 whenever an HC scheme is active.
- **Colours outside the sixteen under a phosphor.** `palette256` builds the xterm cube and grey ramp from fixed RGB, so
  `\e[38;5;196m` or `\e[38;2;255;0;0m` would paint pure red on a phosphor tube and break the one-phosphor look.
  Recommendation: when the active scheme has a `glow` role, map indices 16-255 and truecolor onto the phosphor by
  brightness, the way cool-retro-term does with its colour amount at 0: take the colour's OKLab L as `t`, then
  `L' = L8 + (L15 - L8) * t`, `h' = hue of the foreground`, `C' = chroma of the foreground * min(1, L' / L of the
  foreground)`, clipped into sRGB, where L8 and L15 are the lightness of ANSI 8 and 15. The schema has no field for
  this; whether to do it and whether images are tinted too is the lead's call (open issue).
- **Look field.** `look` is `"retro"` or `"nier"` for the per-look defaults and `null` for the High Contrast pair,
  which are offered in every look and are no look's default.

## 9. Sources

| Input | Used for | SHA-256 |
|---|---|---|
| `Concepts/PMConcept7.html` | Retro tokens, lines 305-410 (retro-dark, retro-light page colours) | `f97ec04e566d4ddbc9d68ba565c55349f48dcacdac524e134810c1802579d904` |
| `Concepts/onboarding/opus-5.5/src/settings/nier/nier-automata.json` | NieR palette (SunkenInTime, NieR: Automata theme for T3) | `2f07b66284a53c9a7010902ea932631d589d18827838b10fec15959de3c68b9a` |
| `Concepts/onboarding/opus-5.5/src/settings/styles.d/13-nier.css` | generated NieR tables: --terminal-*, --o55-nier-term-*, --o55-nier-ok-text | `1bce8bfc37546a1c0d3088c0d5d3ac2d2d6275c9861e8398071bd4aaaa0b52d9` |
| `/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/research-terminal-emulators.md` | sections 6.4 (scheme mapping, NieR suggestions) and 6.5 (effects) | `462b9e67b07ee1886d727a922dffa247303c3974c34402544d9c1c31954fb5a5` |
| `/mnt/Cursor/share/puppet-master/2026-10-09-home-panels-terminal/proposal-visual.html` | section 5: Retro phosphor #7cf08a on #0a0f0a, NieR parchment | `52dd51521a1266e39a2ab6b274176d89666baaaacb1d933e5cc2237c151ab981` |
| `/mnt/Cursor/share/puppet-master/2026-10-09-home-panels-terminal/DECISIONS.md` | D15, D16, D22, D23 | `0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64` |
| `Concepts/home-redesign/src/terminal/schemes/catppuccin.json` | section 7: Catppuccin Latte and Mocha | `53736306d112988ba629e68437efa70384fbc258c490303c745ec10d5402b5b2` |
| `Concepts/home-redesign/src/terminal/schemes/tokyo-night.json` | section 7: Tokyo Night Day and Storm | `84febfea2123e67d8f279258318154e31bcbe73d358de950c5f502821ff6653c` |
| `Concepts/home-redesign/src/terminal/schemes/one-half.json` | section 7: One Half Light and Dark | `40d5d3394bdc0fd84d64c237d63e647551d3587d984a4563bbde42e15ff44654` |
| `Concepts/home-redesign/src/terminal/schemes/github.json` | section 5: GitHub Light white slot | `38a947b3e08dac89ac7b25a426162aca96c9b99883503788b71492ff79264f65` |

`nier/SOURCE.md` records where `nier-automata.json` came from but no licence for it. The YoRHa schemes reuse its
colour values only (no file, no text); whether that needs a licence note is an open question for the lead.
