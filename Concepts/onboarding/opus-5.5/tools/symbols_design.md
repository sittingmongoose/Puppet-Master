<!-- The brief the three drawing agents worked from on 2026-10-09, kept for future redraws. Its scratch paths
     (/home/sittingmongoose/pm-scratch/..., /tmp/pm7sym-*) were theirs; any venv with fontTools and brotli works. -->

# PM Symbols: design brief for the drawing agents (2026-10-09)

PMConcept7 (the Puppet Master GUI concept) embeds its text fonts (Inter, Poppins, Nunito, IBM Plex Mono, M PLUS 1 as
"PM NieR Sans", JetBrains Mono as "PM NieR Mono"). None of them contains the 21 symbol characters the page uses, so
each computer drew them from its own fonts. We are drawing our own versions as SVG. A generator packs them into a small
variable font (`PM Symbols` and `PM Symbols Mono`). The page then uses them inside every one of its text faces, for
those characters only.

## Where things are

- Worktree: `/home/sittingmongoose/.t3/worktrees/PuppetMaster/fix-pm7-embedded-fonts-20261009` (call it `$W`).
- SVGs: `$W/Concepts/onboarding/opus-5.5/src/fonts/symbols/svg/<style>/<weight>/uXXXX.svg`, using the uppercase hex
  codepoint, 4 digits (`u2192.svg`, `u0394.svg`).
  - `<style>`: `sans` (proportional; sits beside Inter, Poppins, Nunito and M PLUS 1) or `mono` (sits beside IBM Plex
    Mono, JetBrains Mono and terminal text).
  - `<weight>`: `400` and `700`.
  - Every glyph needs all four: sans/400, sans/700, mono/400, mono/700.
- Generator: `$W/Concepts/onboarding/opus-5.5/tools/symbols_font.py`. Run it with the scratch venv:
  `/home/sittingmongoose/pm-scratch/pm7-symbols-20261009/venv/bin/python $W/Concepts/onboarding/opus-5.5/tools/symbols_font.py --preview /tmp/pm7sym-<you> --lenient`
  This builds the two fonts from every SVG present (other agents' too) and writes `/tmp/pm7sym-<you>/preview.html`.
  It prints a `SKIPPED` line for every glyph that is missing or invalid, with the reason. Never use `--write`; the lead
  runs it.
- Screenshot (GPU Chrome; never use other browsers or `--disable-gpu`):
  `cd /home/sittingmongoose/pm-scratch/pm7-symbols-20261009 && node shot.mjs /tmp/pm7sym-<you>/preview.html /tmp/pm7sym-<you>/p.png 1500`
  Then look at the PNG. The preview shows each glyph at 64 px (sans and mono, 400 and 700, with a red outline at the
  advance width), the system font's version in grey for reference, and the glyph inside Inter, Poppins, Plex Mono and
  NieR text at 12-14 px. It also has running text, bold text and a terminal sample.

## SVG format (the generator rejects anything else)

- Coordinates are font units, 1000 per em, with y pointing down and the baseline at y = 0. Above the baseline is
  negative y.
- `viewBox="0 -800 ADVANCE 1000"`. ADVANCE is the glyph's advance width, the same in 400 and 700. Mono ADVANCE is
  exactly 600.
- Only `<path d="...">` elements, filled (black, no fill attribute needed). No `stroke`, `transform`, `<g>`, `<circle>`,
  `<rect>` or arc commands (`A`/`a`). Draw circles and round ends as cubic Béziers (`C`); the usual circle uses 4
  cubics with handle length 0.5523 × radius.
- **Weight compatibility:** for a given style, the 400 and 700 files of a glyph must have the same paths, the same
  commands in the same order and the same number of points. Only the coordinates differ, because the font
  interpolates between them for weights 500/600. Write the 700 file by moving the 400 file's points; never redraw it
  with a different structure. The sans and mono drawings need not be compatible with each other.
- Holes (the inside of a ring, the "!" cut out of a triangle) wind in the direction opposite to their outer contour.
  The fill is nonzero. Overlapping contours of the same direction are allowed, but separate non-overlapping shapes
  are better.
- Use only `M L H V C Q Z` (absolute or relative). Each `C` command holds exactly one cubic segment.

## Reference metrics (units of 1/1000 em, measured from the embedded fonts)

| | value |
|---|---|
| cap height (top of "H") | y = -710 |
| x-height (top of "x") | y = -540 |
| math axis (centre of "-", "=", "+": arrows and math signs centre here) | y = -320 |
| stem, regular (400) | 88-92 |
| stem, bold (700) | 147-171 (aim ~150) |
| hyphen at 400 | spans y -270 to -350 (80 thick), centred -310 |
| "=" at 400 | bars about 80 thick, at about y -390 and -250 |
| sidebearings (sans) | about 40-70 each side |
| Inter "0" advance | ~630; Inter "H" advance ~745 |
| mono advance | 600 (Plex Mono and JetBrains Mono are both 600/1000) |

Keep every outline between y = -800 and y = +200; the font's line box is exactly that em. Box-drawing lines may
touch those limits.

## Style

- Match Inter at regular and bold: geometric, monoline (one stroke width per weight), flat cut terminals (not rounded),
  crisp mitred or squarish joins. The look is calm and neutral; no calligraphic contrast and no decoration.
- Legibility at 11-14 px comes first. Avoid hairline details, and keep counters open at 12 px. Check the 12 px column.
- Optical sizing: symbols should look the same visual weight as letters at the same font weight. Bold symbols must
  look bold beside bold text.
- Mono versions fit their 600 advance. Arrows become shorter rather than thinner, and nothing may touch the advance
  edges except box-drawing lines, which run edge to edge (x 0 to 600) so they join across characters.
- The system reference column shows the conventional shape and size; follow its proportions loosely, not its style.

## Glyph notes

- **→ U+2192, ↔ U+2194:** stroke on the math axis, open arrowheads (two strokes meeting at the tip, like Inter's
  arrows), head arms about 45°. Sans advance about 800-900 for →; ↔ a bit wider.
- **↳ U+21B3:** a vertical stroke from near cap height down to the math axis, then turning right into an arrowhead. It
  marks a sub-row in lists, so give it a clear corner.
- **➜ U+279C** (terminal prompt, Vite style): heavy, with rounded tips (Unicode name: heavy round-tipped
  rightwards arrow). It is the one round-ended glyph, and noticeably heavier than →.
- **▶ U+25B6, ▸ U+25B8, ▼ U+25BC:** solid triangles. ▶ and ▼ about cap-height tall and centred on the math axis; ▸ is
  the small one, about x-height tall. Weight changes their size only slightly (700 a touch larger).
- **⌄ U+2304:** a down chevron (stroke, open), small, below the math axis, used as a disclosure marker.
- **✓ U+2713:** check mark, short arm and long arm, monoline, roughly x-height to cap-height tall, sitting on the
  baseline.
- **✕ U+2715:** two crossing strokes in an x-height-ish square centred on the math axis (a close icon). **✖ U+2716:**
  the heavy version, about 1.6× the stroke.
- **⚠ U+26A0:** outlined triangle with an exclamation mark cut inside, cap height. It must read at 12 px, so keep
  the outline stroke solid and the "!" clear. A filled triangle with the "!" knocked out is acceptable if the outline
  version clogs at 12 px; decide from the preview and say which you chose.
- **● U+25CF:** solid circle, about 0.6 em across, centred on the math axis. **■ U+25A0:** solid square of similar
  optical size.
- **≤ U+2264, ≈ U+2248:** math signs on the math axis, matching the "=" bar thickness and width. **Δ U+0394:** Greek
  capital delta, cap height, matching Inter's capitals. **⌘ U+2318:** the command key (four loops), about cap-height
  tall.
- **─ U+2500, │ U+2502, ═ U+2550:** box drawing. Mono: ─ spans x 0 to 600 on the math axis at stem thickness; │ spans
  y -800 to +200 at x 300; ═ is two lines, at about y -390 and -250 like "=", running edge to edge. Sans versions: the
  same at a 600 advance.

## Rules

- Write only your own glyphs' SVG files. Do not edit any other file, do not touch other agents' glyphs, and do not run
  git (no add, commit or stash).
- Delete your `/tmp/pm7sym-<you>` folder when you finish, except for the final `p.png`, which the lead looks at.
  Report the PNG's path.
- Finish with: the files you wrote, any SKIPPED lines left for your glyphs (there should be none), and design choices
  the lead should know about (for example, ⚠ outline or filled).
