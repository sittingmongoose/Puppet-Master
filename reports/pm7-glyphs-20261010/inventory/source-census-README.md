# W2 source census: PM7 glyph tables + status vocabularies (phase 1)

Source census for the PMConcept7 glyph replacement. All paths below are
relative to R = the Puppet Master worktree
`/home/sittingmongoose/.t3/worktrees/PuppetMaster/concept-pm7-glyphs-20261010`.

R commit: `88ae42bbdc7fb251beee92bdefa4295206de8cd2`
(`concept(glyphs): decision card GLY-1 ...`, 2026-10-10).

Census sources (per SPEC.md): `Concepts/pm7-tools/base/PM7-base.html`,
`Concepts/onboarding/opus-5.5/src/**` (+ `tools/symbols_design.md` as the
PM Symbols brief), `Concepts/leftrail-redesign/src/**` (+
`tools/rail_layer.py`), `Concepts/usage-redesign/src/**` + `marks/`, and
`Concepts/chat-assistant-concepts/5.6 Pro/neon-icons.js` (comparison target
only). No repository file was edited; no browser was used.

## Files

- `neon-registry.json` — 5.6 Pro `PM56_NEON` evaluated in node (123 glyphs):
  version, TONES, ROLES, ALIAS (30), STATUS (13 state specs), and per glyph
  role/act/moving/aliases/own/status plus `icon(name, 24)` markup.
- `neon-registry.html` — the 123 neon glyphs rendered at 24px in a grid
  (from the extracted markup; open directly, no server needed).
- `icon-tables.csv` — one row per glyph name per icon-DEFINING table:
  table_id, file, line, helper_or_var, glyph_name, markup,
  used_by_surfaces, notes. 522 rows, 25 tables (list + counts below).
- `inline-svgs.csv` — inline `<svg>` NOT from a table (deduped repeats note
  their repeat lines in context). 85 rows. Excluded: charts/graph canvases,
  art scenes, identicon/QR generators, empty containers (see notes below).
- `symbol-chars.csv` — symbol chars in strings/markup/CSS (ranges
  U+2190–2BFF, U+25A0–25FF, U+2700–27BF, emoji; numeric entities and CSS
  escapes decoded). One row per distinct char per line. 229 use rows +
  21 PM Symbols coverage rows = 250. Comment-only decoration excluded
  (435 occurrences, mostly `──`/`══` divider comments).
- `status-vocab.csv` — state name -> shape/glyph/class/colour mappings.
  138 rows, 24 vocabs.
- `mapping-draft.csv` — proposed neon name for every T-core, T-bridge,
  T-art and T-usage-svg glyph (202 rows: 92 high / 39 medium / 71 low;
  49 with no neon equivalent, listed below).
- `status-draft.csv` — proposed neon st-* glyph + tone for each of the 17
  V-rail states.

## Counts

icon-tables.csv (522): T-core 43, T-bridge 75 (72 + 3 aliases), T-term 21,
T-term-split 2, T-term-wg 1, T-single 10, T-aliasmap 60, T-rail-solid 17,
T-jj 2, T-art 20, T-retro 20, T-marks 26, T-marks-map 76, T-symbols 21,
T-usage-svg 64, T-nierworld 4, T-themenum 2, T-looksliders 1, T-o55back 1,
T-wave 2, T-railcss 3, T-cssbg 6, T-chat 27, T-usage-base 17, T-lookmenu 1.

inline-svgs.csv (85) by surface: home 19, chat 19, rail 12, usage 9,
topbar 7, wizard 6, onboarding 6, settings 3, statusbar 2, tour 2.

status-vocab.csv (138): V-rail 17, V-orchbadge 13, V-deadcss 12, V-proj 7,
V-sa 7, V-wizschip 7, V-usage-state 7, V-s4 6, V-opstate 6, V-gitfile 6,
V-tourpips 6, V-kit-tone 5, V-thread 4, V-wizpill 4, V-wiztstate 4,
V-statusbar 4, V-notify 4, V-dashdot 4, V-health 3, V-toast 3, V-onbrail 3,
V-orchfresh 2, V-wt 2, V-usage-live 2.

neon-registry: 123 glyphs, 30 aliases, 13 status specs, misses [].

## PM7 icon names with no neon match (49, with defining file:line)

T-core palette `Concepts/pm7-tools/base/PM7-base.html:34284`;
puzzle :34288; film :34291; toolbox :34294; scales :34300; home :34309;
robot :34310; plant :34312; party :34313; dial :34317; layers :34322;
bell :34323. T-bridge actions
`Concepts/pm7-tools/base/PM7-base.html:57416`; agents :57419;
arrowDn :57464; arrowUp :57463; bell :57449; bpCond :57485; bpLog :57486;
flame :57444; grip :57465; key :57459; layers :57443; scissors :57408;
stash :57454. T-art cloud
`Concepts/onboarding/opus-5.5/src/js/50-art-core.js:717`; key :722;
phone :728; seed :713; server :719. T-usage-svg arrowDown
`Concepts/usage-redesign/src/js/00-core.js:182`; arrowUp :181;
briefcase :203; coin :187; diamond :179; drag :69; gauge :56; grip :206;
halfCircle :175; key :170; layers :65; minusCircle :172; notch :188;
provider :183; pulse :67; tidy :198; tool :66; toolGrip :209; wallet :57.
(Why per name: mapping-draft.csv. Notable neon gaps: bell, home, layers,
key, cloud, gauge.)

## Reproduce

Extractors live in /tmp (kept out of this folder on purpose):

```
cd /tmp
node w2-neon-extract.cjs        # neon-registry.json + .html
python3 w2-callers2.py          # /tmp/w2-callers.json (caller index)
python3 w2-t1b.py               # icon-tables.csv part A (T-core/T-bridge/T-term/T-single)
python3 w2-t1c.py               # part B (aliasmaps/rail/jj/art/retro/marks)
python3 w2-t1d.py               # part C (symbols/usage/nier/theme/wave/railcss/cssbg)
python3 w2-t1e.py               # surface/notes patch (variable-dispatched tables)
python3 w2-t1f.py               # T-chat + T-usage-base
python3 w2-t2.py                # inline-svgs.csv
python3 w2-t3.py                # symbol-chars.csv
python3 w2-t4.py                # status-vocab.csv
python3 w2-t6.py                # mapping-draft.csv
python3 w2-t7.py                # status-draft.csv
```

plus a few one-line appends/patches run inline (PRIMARY_ICONS aliases,
T-lookmenu row, usage SVG block 2/3 rows, multiline markup joins,
V-gitfile fixes, v2 surface repatch). Verification greps were ad-hoc;
every CSV row carries its own file:line.

## Asked for but not done, and why

1. The spec frames PM7-base.html as the frozen base that build.py
   publishes from, but build.py pins and reads
   `Concepts/Onboarding concepts/TestPMConcept.html` (sha256 f1eb...d5...,
   `tools/build.py` TARGET/PIN), NOT PM7-base.html (sha256 7bbc...0d...).
   I censused PM7-base.html exactly as the spec lists. Consequence: the
   Settings engine `iconPaths` table + `icon(name)` helper that the opus
   settings kit's ~40 `icon:` names resolve to lives in TestPMConcept.html
   (~line 41940, confirmed read-only) and is OUTSIDE the census sources;
   the settings_layer MARKER comment is absent from PM7-base.html
   (`grep -c PM51_SETTINGS_REFRESH` = 0). Affected callers are flagged
   `CAUTION: ... engine iconPaths` in icon-tables.csv notes.
2. `used_by_surfaces` for shared names (check, folder, spark, globe, ...)
   counts every table defining the name; the column is name-based, not a
   per-call-site proof. Variable dispatch (ICON_CATALOG loop, gilt
   `glyph(st)`, `ICONS[o.icon]`) is attributed in notes instead of counts.
3. Inline-svgs `meaning_guess` for 4 activity-bar glyphs is marked
   uncertain (gh-actions/testing/agents/more paths are ambiguous at
   `PM7-base.html:22220-22231`); all other guesses come from the
   surrounding id/class/title/aria-label on the same line.

## Surprises (one line each)

- T-bridge `add` only fills MISSING keys, so its 10 twins of T-core names
  never render (`Concepts/pm7-tools/base/PM7-base.html:57493-57497`).
- PM7-base.html is NOT the build input; build.py pins TestPMConcept.html
  (`Concepts/onboarding/opus-5.5/tools/build.py` TARGET/PIN vs
  `Concepts/pm7-tools/base/PM7-base.html` sha 7bbc...0d).
- Settings-kit `icon:` names resolve outside the census sources (engine
  `iconPaths`, TestPMConcept.html:~41940; MARKER absent from PM7-base).
- PM7-base embeds a frozen older usage SVG map (17 keys, lacks `filter`)
  that usage_layer deletes at publish (`PM7-base.html:26463-26481`).
- usage_layer removes all of section 15 incl. the T-single usage grip/
  kebab/resize (`Concepts/usage-redesign/tools/usage_layer.py` REMOVED).
- Neon has no bell, home, layers, key, cloud, or gauge
  (`neon-registry.json`, 123-name list).
- T-bridge has chevD/chevL/chevR but no chevU
  (`Concepts/pm7-tools/base/PM7-base.html:57421-57423`).
- PM7 `tests` IS a check-in-circle, mapping to neon check-circle
  (`Concepts/pm7-tools/base/PM7-base.html:57418`).
- PM7 art `rewind` is a clock+restore-arrow (history), not triangles
  (`Concepts/onboarding/opus-5.5/src/js/50-art-core.js:721`).
- PM7 bridge `files` IS a folder drawing, not stacked files
  (`Concepts/pm7-tools/base/PM7-base.html:57413`).
- PM7 art `power` IS a lightning zigzag, mapping to neon lightning
  (`Concepts/onboarding/opus-5.5/src/js/50-art-core.js:726`).
- `▾` U+25BE (settings Show-more caret, `PM7-base.html:33963`), `−` U+2212
  (diff stats + tour/rail deltas) and `↻` U+21BB (home dash row) are used
  but NOT in the 21-codepoint PM Symbols cover
...[truncated 1458 chars]