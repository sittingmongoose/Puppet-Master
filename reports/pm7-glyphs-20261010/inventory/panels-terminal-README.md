# W3: glyph census of the unpublished panels and terminal packages

Mechanical census per SPEC.md. Inputs are the read-only snapshots; `file` paths
below are relative to each snapshot's `src/` dir (`panels/...`, `terminal/...`).
No repository was edited, committed, or pushed.

## Counts

- `icons.csv`: 152 rows = 123 svg + 23 retro-text + 6 css; 128 unique icon names
  (105 panels, 23 terminal). Tab-kind icons (`tab_kind=y`): 21
  (16 panels core + 4 run per-type + 1 terminal-tab svg-string).
- `status.csv`: 122 rows across 31 vocabs (84 panels, 38 terminal).
- `mapping-draft.csv`: 250 rows (128 icon names + 122 states);
  confidence 176 high / 70 med / 4 low; NONE used 24x (icons) + 31x (states).
  State keys hit: working 18, failed 17, complete 14, waiting 9, recovering 6,
  pending 6, idle 5, blocked 5, skipped 4, paused 4, waiting-dep 3.
  Never hit: reviewing, mixed.
- `contact-sheet.html`: all 123 svg icons at 16px and 32px. No screenshot taken.

## Where the owners' description did not match the files

1. Retro glyphs are not on every icon: only 17 of 69 core names have one
   (the tab-kind icons, `06-icons.js:77-80`) plus the 6 kind-registered ones.
2. Dashboard "STATE (Working, Needs you, Waiting, Done)" is the FILTER group
   list (`30-dashboard.js:429-435`); the real STATE table has 8 states (`:419-426`).
3. Plan steps have no "not admitted" concept; the plain ring is idle/next
   ("not started", `MARK_WORD :367`, `stepMark` else-branch `:373`).
4. Terminal agent modes are driving/paused/permission/secret
   (`78-agent.js:53-68`): "asking" is named `permission`, and `ended` (`:118`)
   removes the row instead of drawing a mode.
5. There is no swatch tick in `76-popover.js` (or anywhere in terminal):
   the swatch is an `Aa` + 6 ANSI bars chip (`:71-75`) and selection is an
   `aria-selected` background (`css/20-overlays.css:87`).
6. Strip `busy` has no visual: `data-busy` is set (`32-strip.js:300`) but no
   `[data-busy]` rule exists in any css. It surfaces only via kind widgets
   (plan pulse dot, browser load bar) and header rows.
7. `T.ICONS` (clock, branch, folder, `70-view.js:15-17`) is dead: zero
   references. The header uses host icons `git` (for the branch!) and `clock`.
8. EVENT_KIND names icon `route` (`48-transcript.js:75`) but it is not
   registered; `eventGlyph` special-cases it (`:80`) and notices map it to
   `link` (`:571`). `PMW.icon('route')` would silently draw the file fallback.
9. `close` and `cross` are byte-identical paths (`06-icons.js:29` vs `:50`).
10. Core icons with zero panels references: `folder`, `widget`, `chevronUp`
    (`git` is unused in panels but used by the terminal header via the host).
11. `WRAP_ICON` (`22-tools.js:59`) is defined and never used.
12. `problems` core icon vs tools `MARKS.warn`: two near-identical triangles
    with different coordinates (one meaning, two shapes).
13. Card `waiting` reads "Needs input" (`80-card.js:105`), not "Waiting".
14. Artifact `Pinned` is a Ready-overlay (`44-artifact.js:931`), not a
    `STATUS_WORD` key; `Rendering` covers both loading and retrying.

## Open questions for the lead

1. Drop or adopt the dead code (`T.ICONS`, `WRAP_ICON`, folder/widget/chevronUp)?
2. Should `busy` gain a strip visual, or stay kind-local?
3. Register a real `route` icon or keep the special-case + link fallback?
4. Merge the close/cross twins into one neon `close`?
5. Circled-X error marks (tools, document) vs neon triangle errors: redraw?
6. Neon has no agent square, dirty dot, attention square, or preview italic:
   new tab-state marks needed?
7. Per-look progress-bar styling (terminal SPEC:283): in glyph scope?
8. Find toggles (`Aa`/underlined-ab/`.*`) and the swatch chip are text, not
   glyphs: confirm exclusion.
9. Run puppets treated as illustration (excluded); agree votes treated as
   states: correct split?
10. `T.ICONS.branch` vs host `git` for the header branch fact: which wins?

## Top 10 findings

1. `close` == `cross`: one shape, two names (chrome-close vs delete/failed).
2. Gutter hollow dot = prompt-awaiting-input AND ended-indeterminate
   (one shape, two states; only aria text differs).
3. The agent square *replaces* the gutter ok/run/fail glyph (authorship hides
   state; only fail keeps its colour via `.pmt-mark-agent.pmt-mark-fail`).
4. One hollow attention square, six triggers: background-open, bell, notify,
   long-command-done, secret prompt, permission ask.
5. More shared marks: transcript queued==waiting, run working==reading,
   plan next==idle.
6. Two warning triangles (`problems` icon vs `MARKS.warn`, different coords).
7. Step glyphs copy core paths verbatim (`step:run`==`terminal`,
   `step:search`==`search`, `step:edit`==`rename`): WILL drift.
8. Retro collisions: file/code share `#`; `::` is the only two-cell core glyph.
9. The check `M3.5 8.5l3 3 6-7` is reused in 4 places (core, tools ok,
   gutter ok, card ok): the single consistent glyph.
10. The terminal tab-kind icon is an inline svg-string with no retro glyph,
    while every panels tab-kind icon has both.
