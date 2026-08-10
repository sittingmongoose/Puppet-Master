# FINAL — PM7 Motion Wave Combined-Build Sweep

**Agent:** FINAL sweep · **Target:** `Concepts/PMConcept7.html` (built artifact) @ `http://127.0.0.1:8792/PMConcept7.html`
**Base sha:** `26fb95105bcbd208a31b92f4e5a71eac4f9a31835ea585a6295e11a0c02a21fa` · **Run date:** 2026-08-02
**Rig:** standalone Playwright, chromium headless, 1440×900 · **Mode:** REPORT-ONLY (artifact not modified)
**Scope:** prove the COMBINED build (full motion system + FIX1 + FIX2) has no interaction regressions across surfaces.

## Verdict: 29 / 29 PASS — combined build is healthy, no interaction regressions.

Console: **0** errors / **0** page errors / **0** failed requests beyond the favicon-404 baseline (item 10), across normal mode, both reduced-motion paths, and theme switches. Motion sampled mid-flight via `getAnimations()` polling + WAAPI; toasts captured by observing `.rs-card` nodes (read at query-time); themes via `documentElement[data-theme]`; reduced motion via BOTH `data-reduced-motion="1"` and `emulateMedia({reducedMotion:'reduce'})`.

| # | Surface / assertion | Result | Evidence |
|---|---|---|---|
| 1a | Rail: open docker → indicator FLIP runs mid-flight | PASS | indicator peak anims=1 during flight |
| 1b | Rail: indicator lands ≤1px on docker | PASS | land err=**0.00px** (232→232), settled anims=0 |
| 1c | Rail: docker panel opened | PASS | panel-docker active |
| 1d | Rail: hover icon scale knob | PASS | `.symbol` scale=1.150 (`--ab-hover-scale`) |
| 1e | Rail: re-click closes → exit anim → hidden | PASS | `.pm-panel-exit` mid=1, settled display=none, 0 stuck |
| 2a | More tray: populated → open (sprout + row cascade) | PASS | data-empty=0, 3 rows, delays `[0\|0.026\|0.052]s`, sprout anims=2 |
| 2b | Tray: hover row → translateX(2px) (**FIX1**) | PASS | transform=`matrix(1,0,0,1,2,0)` exactly |
| 2c | Tray: click row → icon restores (land anim) + decrements | PASS | `.ab-icon-land` fired, rows 3→2, tray stays open |
| 2d | Tray: last restore → tray exits ANIMATED + More data-empty=1 | PASS | `.pm-ab-tray-closing` sampled, tray gone, data-empty=1 |
| 3 | Panel lifecycle: rapid files→search→source settles, final=last | PASS | 0 stuck `.pm-panel-enter`/`.pm-panel-exit`, active=[panel-source] |
| 4a | Search: `.sh-fp` filename click → toast, NO toggle (**FIX2** guard) | PASS | toast `cmd.search.open_result -> src/services/import.rs`, group open unchanged |
| 4b | Search: `#shScopeMenu` opens animated, pick closes animated | PASS | open anims=2, pick `is-closing`=true, settled closed, label=Open Files |
| 5a | FM: `#fmCollapseAll` → label flips to "Expand all" after settle (**FIX C**) | PASS | label="Expand all", 0 open folders |
| 5b | FM: expand-all back → label "Collapse all" | PASS | label="Collapse all", 11 open |
| 5c | FM: expand folder → chevron overshoot + kid cascade | PASS | chevron peak=**102.0°** (>90 overshoot), 4 kid anims, delays `[0\|.026\|.052\|.078]s` |
| 5d | FM: README.md hover → [Open preview, Copy relative path] (**FIX D**) | PASS | quick-actions=[Open preview, Copy relative path] |
| 5e | FM: right-click file → click leaf → menu closes ANIMATED + toast (**FIX A**) | PASS | `is-closing`=true, settled closed, toast `cmd.file.new_file -> …` |
| 5f | FM: folder ctx → "Open with…" stays open → click inside closes WHOLE menu | PASS | submenu open + root open, inside pick → whole menu `is-closing`, toast `cmd.file.open_with -> source_editor` |
| 5g | FM: Escape closes ctx menu (animated path intact) | PASS | open→closed, display=none |
| 6a | Reasons: testing tr-2219 Quarantine → specific text (**FIX B + FIX1**) | PASS | toast="already quarantined 2d" (trailing `×` = toast close-glyph) |
| 6b | Reasons: `#fmRootMenu` spike/r2-storage → its OWN text (**FIX B** data-demo-arg) | PASS | toast="spike/r2-storage is read-only in this demo (manual worktree)" |
| 7a | Artifacts: family tab switch → survivors FLIP + flash | PASS | mid anims=10, `.pm-flashing`=true, survivor transform anim=true |
| 7b | Artifacts: sort → By family (FLIP reorder) | PASS | label="By family", mid anims=11, order reordered |
| 8a | Docker: running dot pulses (normal) | PASS | 3 `.dot-run`, dotPulse running=2, opacity=1 |
| 8b | Reduced: `data-reduced-motion=1` → dotPulse dead, dot visible | PASS | dotPulse running=0, opacity=1, bg=`rgb(255,173,147)` |
| 8c | Reduced: `emulateMedia(reduce)` → dotPulse dead, dot visible | PASS | dotPulse running=0, opacity=1 |
| 8d | Reduced: unset → dotPulse resumes | PASS | dotPulse running=2 |
| 9 | Theme: friendly-dark spring vs retro-light snap on testing accordion | PASS | friendly=`cubic-bezier(.34,1.56,.64,1)` (overshoot) vs retro=`cubic-bezier(.2,0,0,1)` (snap) |
| 10 | Console: zero errors beyond favicon 404 | PASS | 0 console / 0 page / 0 failed reqs |

## FIX coverage confirmed in the combined build
- **FIX1** (2b tray-row hover translateX(2px)) — live. Cascade fill-mode `backwards` intact (2a stagger + settle to opacity 1).
- **FIX2 / .sh-fp guard** (4a) — filename click toasts and does NOT toggle the group.
- **FIX A** (5e/5f ctx close-on-pick) — leaf pick AND submenu-leaf pick both close the whole `#fileContextMenu` animated + toast; Escape/outside paths unchanged (5g).
- **FIX B** (6a data-demo-reason verbatim; 6b data-demo-arg fallback) — tr-2219 → its reason; spike/r2-storage → its own arg text (no longer the generic demo_scope).
- **FIX C** (5a collapse-all label refresh after settle) — label flips to "Expand all" post-360ms.
- **FIX D** (5d README md quick-actions) — [Open preview, Copy relative path].

## Notes / adjudications (harness, not product)
- Item 2 reached the tray via the documented `pm.activity_bar_order:v2` persistence key (headless drag >4px is flaky) — same route as FIX1 evidence; the drag/restore machinery itself is exercised by 2c/2d (land pop + animated exit).
- Tray exits animated only on the LAST restore (stays open while rows remain) — correct UX; verified explicitly in 2c (decrement) + 2d (animated exit on empty).
- Toast text carries a trailing `×` (the toast dismiss button); stripped for the 6a exact-match. Toasts render into `#rsStage` (a sibling of `#rsStack`), so capture watched `.rs-card` body-wide.
- The pre-existing V2 "no Stage item in ctx menu for git rows" content gap (V2 §11c) is out of this sweep's scope and was never claimed fixed by FIX1/FIX2; not a regression.

## Screenshots (`shots/`)
`final-01-docker-pulse.png` (docker panel, live `.dot-run` pulse) · `final-02-ctx-menu.png` (`#fileContextMenu` sprouted on a folder row) · `final-03-artifacts.png` (Runtime Artifacts, family tabs + sort).

Raw machine data: `sweep-results.json` (29 per-check records + console/page/request error arrays).
