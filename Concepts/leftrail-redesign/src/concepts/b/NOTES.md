# Concept B (Stack) — builder notes

Status (2026-10-02): engine, Files, Source Control (Git + Jujutsu), Docker, bar written; --quick passes. Next: full
check (reach), screenshots per theme + NieR, polish. Files: 00-b.js engine, 10-files.js, 20-source.js, 30-docker.js,
40-bar.js, 90-register.js, b.css.

Decisions
- One page-stack engine per panel (00-b.js). Pages are cached in the stage while on the path (hidden with `hidden`,
  scroll restored); popped pages are removed. Head = nav row (root: panel title + state + icon actions; deeper: back
  button `‹ Parent` [data-pmr-nav=back, first in DOM] + thin crumb above it at depth >= 3 (ancestors above the parent)).
- Deep page title lives at the top of the page body (15px, wraps) and is a PMR.menu trigger listing siblings
  (menu items carry NO data-pmr-nav on purpose: a sideways jump crawled depth-first would skip the rows of the page the
  menu was opened on).
- Rows: file-like rows = body runs the primary open action, trailing chevron drills; object rows = whole row drills.
- Motion: push/pop shared-axis slide (28px in, -8.4px out), title flights (row label -> page title, old title -> back
  label), head cross-fade; per family: basic crisp, friendly spring, glass scale .985, retro steps(2), NieR slice wipe.
- Crawler contract: drill -> one visible [data-pmr-nav=back]; title menus are [data-pmr-nav=menu].

Files map
- 00-b.js engine (Stack, row/section/dest/facts/actions builders, transitions, NieR slices), 10-files.js,
  15-views.js (area/item pages from fixture views, shared by Source + Docker), 20-source.js, 30-docker.js,
  40-bar.js (tile, depth pips, attention dot, expanded names + current page), 90-register.js, b.css.
- Private build: ~/PM-Experiments/leftrail-redesign-20261002/builds/b/ (tools/shot.mjs = my screenshot driver).
