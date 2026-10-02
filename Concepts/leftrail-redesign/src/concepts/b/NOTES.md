# Concept B (Stack) — builder notes

Status (2026-10-02, final): full check passes after motion fixes (reach files 205/0, source 146/0, docker 153/0;
no fails, 0 console errors). Shots reviewed and deleted. Review 1 (lead, B-review-1.md): fixes 1-2 done (state word left the title row; Files trigger keeps its width, tools wrap right). fix 3 done (tree end column = letter or capped count, words in hover). fix 4 done (+/- on line 2 right). fixes 5-6 done (Docker identity: trigger + ready, one where-line, counts line, facts in the disclosure; local trigger radius dropped). split meta no-wrap, tree chevron 24px. full check passes again (0 missing, no fails); touched places shot, reviewed and deleted. Review 1 complete.
no fails) with --shots. Fixed after shots: glass bar symbols lose their backdrop blur (tiles everywhere), friendly tile tint. Shots reviewed and deleted. Title flights now measured before any animation (verified exact start/end both ways). NieR slice fill fixed (delayed slices sat on screen). Next: motion polish (verify NieR slices render), report. Files: 00-b.js engine, 10-files.js, 20-source.js, 30-docker.js,
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

Motion (for the lead's films)
- Push (drill row / destination / chevron): new page translateX(28px)->0 + fade in (delay 12% of dur), old page drifts
  -8.4px and fades over 62% of dur, then is hidden (kept for back). Head cross-fades (snapshot fades out and slides 25%,
  new head slides in 35%). Two title flights: tapped label -> page title (scale 13->15px), old title -> back label.
  Basic 220ms ease(.22,1,.36,1); Friendly 380ms spring overshoot on push; Glass 300ms glide, old page scales to .985;
  Retro 160ms steps(2,start), old page snaps out, flights steps(3); NieR 320ms: six ink slices sweep across
  (steps(8), 16ms stagger) with the 8px square cursor on the leading edge, pages swap with steps(3).
- Pop (back button, crumb, Left/Backspace/Alt+Left/Escape, active bar icon): reverse; title flies back to its row;
  the row flashes the selection tint once (1s, stepped in Retro/NieR).
- Sideways (title menu): horizontal slide in the target's order, no flights.
- Summary first show: entrance stagger (18ms step, 0 in Retro/NieR), "Needs you" group slides open (height, slow).
- Engine switch: tile slides (spring transition), destinations re-stagger, changed counts tick (translateY + fade).
- Bar: active tile pops (scale .84->1 spring) on panel switch; depth pips scale in/out per level.
- Reduced motion: nothing animates (M.reduced + CSS kill).
