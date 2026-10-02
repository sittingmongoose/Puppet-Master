# Concept A (Ledger): builder notes

Files: 00-a.js (shared helpers: rows, sections, tabs+ink, scaffold, motion), 10-files.js, 20-source.js, 30-docker.js,
40-bar.js (activity bar), 90-register.js (register; falls back to a generic panel when a renderer is missing),
a-10-panel.css (panels), a-20-bar.css (bar), a-30-themes.css (theme + NieR polish).

Decisions
- Reach: every view pane and every row detail is rendered eagerly (hidden); data-pmr-nav only on controls that reveal
  (closed disclosures, inactive tabs, menu triggers, tree row select / closed folder expand). Never on collapse.
- Row/section expansion is per mount (inst.open); engine switch keeps tab + open state via A.keep. Tab per panel is
  remembered in A.tabMemo for the page session.
- Diff numbers sit on line 2's right when the row has no time (names get the width); letter/glyph stays on line 1.
- Tree: click selects (+opens a closed folder; click a selected open folder closes it); file name carries cmd.file.open;
  selection bar at the bottom shows the selected file's quick actions (PMR.fileQuick) + menu (selection + context).
- Accent fill only for section primaries (Commit, Up, Build image); row primaries are bordered "first" buttons.

Status
- [x] 00-a.js, a-10-panel.css, 10-files.js, 90-register.js written
- [x] build + Files look checked (basic-dark 280)
- [x] 20-source.js  - [x] 30-docker.js (first pass)  - [ ] 40-bar.js + a-20-bar.css  - [ ] themes/NieR polish  - [ ] full check + shots
