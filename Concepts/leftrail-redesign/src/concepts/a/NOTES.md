# Concept A (Ledger): builder notes

Files: 00-a.js (shared helpers: rows, sections, tabs+ink, scaffold, motion), 10-files.js, 20-source.js, 30-docker.js,
40-bar.js (activity bar), 90-register.js (register), a-10-panel.css (panels), a-20-bar.css (bar), a-30-themes.css
(theme + NieR polish).

Decisions
- Reach: every view pane and every row detail is rendered eagerly (hidden); data-pmr-nav only on controls that reveal
  (closed disclosures, inactive tabs, menu triggers, More-menu items, tree row select / closed folder expand). Never on
  collapse. Full boot (before review 1) reached everything: files 205 / source 148 / docker 153 seen, 0 missing.
- Row/section expansion is per mount (inst.open); engine switch keeps tab (twin mapping) + open state via A.keep.
- Line 1 = name (+ glyph or letter at its right). Line 2 = facts left; right column = diff (no time), status word, time.
  Facts that do not fit drop off whole (fitFacts); only the first may end with an ellipsis. Prose names wrap (2 lines):
  commits, current change, publish steps, scenarios, the ops tray. Identifiers middle-truncate (fitNames, canvas).
- Tree: click selects (+opens a closed folder; click a selected open folder closes it); file name carries cmd.file.open;
  selection bar at the bottom (Explorer only) shows the selected file's quick actions + a menu (selection + context).
- Accent fill only for section primaries (Commit, Up, Build image); row primaries are bordered "first" buttons.
- Tabs: fit measured against the strip's content box (padding excluded), gap 11 px so Source fits three tabs at 280.

Status
- [x] Files, Source (Git + Jujutsu), Docker, bar, themes file
- [x] review 1 fixes 1-6 applied (triggers keep their label, prose wraps, status word on line 2 right, fact drop,
      fixture ok-state, tab gap)
- [x] Retro fact-drop fixed (2 px safety, refit after web fonts load)
- [x] full check + --shots: rail boot ok (0 missing, 0 fails, all themes + NieR); shots reviewed and deleted
- [x] gates: two-column ledger (source column no longer truncated); Source fits Changes, Worktrees, History at 280 (tab gap 11)
- [x] final full check on the last build: rail boot ok (files 205 / source 148 / docker 153 seen, 0 missing; 0 errors; 0 fails)
- [x] motion: outgoing pane fades in place (Basic/Friendly/Glass), Retro/NieR cut
- [x] report sent to the lead
