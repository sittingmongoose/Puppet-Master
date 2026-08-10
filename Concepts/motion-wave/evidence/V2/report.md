# V2 Verification Report — #panel-files (PMConcept7.html, PM7 Motion Wave)

Agent: **V2** (report-only, fresh run) · Date: 2026-08-02
Target: `http://127.0.0.1:8793/PMConcept7.html` (served from `Concepts/`)
Rig: standalone Playwright, chromium headless, viewport 1440×900. Build artifact NOT modified.
Motion proven via `el.getAnimations()` sampled mid-flight (rAF trajectories, max-capture), computed
transition timing functions, WAAPI ink/chevron/sprout sampling, and class-state assertions. Toasts
proven by wrapping `window.toast`. Reduced motion verified via BOTH `page.emulateMedia({reducedMotion:'reduce'})`
and the `data-motion="reduced"` / `data-reduced-motion="1"` attribute paths. Themes via `documentElement[data-theme]`.

Build under test = full motion wave + the 4 post-verification fixes (FIX1 tray hover, FIX2 .sh-fp guard,
FIX3 reason resolver, FIX4 reduced-motion dot kill). Item 3's disabled-reason check is the FIX3 path.

## Verdict: 102 / 107 PASS — 5 FAIL (1 fix-coverage gap, 1 label bug, 1 variant gap, 2 ctx-menu issues)

Console: **0 errors** beyond the favicon baseline in every mode (normal, both reduced paths, all three
themes, all stress runs). No uncaught page errors, no failed requests.

| # | Area | Result |
|---|------|--------|
| 1 | Lifecycle (rail open/close, enter/exit anim, slot hidden) | **PASS** |
| 2 | Inner tabs Explorer/Changed/Open + `#fmTabInk` stretch + direction-aware cascade | **PASS** |
| 3 | Root worktree sprout `#fmRootMenu` (overshoot, pick pop, close anims) | **FAIL×1** — disabled-item reason toast generic |
| 4 | Banner Refresh / Pop out (toast + `:active` squash) | **PASS** |
| 5 | Toolbar (new file/folder, collapse-all, hide-ignored, filter toggle, flash) | **FAIL×1** — collapse-all label never flips to "Expand all" |
| 6 | Filter row (live filter, count, clear, focus ring) | **PASS** |
| 7 | Tree (11 folders expand/collapse, chevron overshoot, cascade, multiselect, keyboard, type-ahead) | **PASS** |
| 8 | Hover quick-actions (5 variants, reveal slide+fade, minibtn toast/lift) | **FAIL×1** — README.md lacks "Open preview" variant |
| 9 | Changed pane (3 shelves, shelf toggle, changerow cascade, actions) | **PASS** |
| 10 | Open pane (OPEN EDITORS expand/actions, RECENT shelf) | **PASS** |
| 11 | Context menu (sprout at click point, submenus, Paste logic, keyboard, retarget) | **FAIL×2** — no close-on-item-click; no Stage on git rows |
| 12 | Footer `#fmIndexChip` pulse + reduced-motion kill + resume | **PASS** |
| 13 | Reduced-motion full pass (media + attr): zero anims, functional, states correct | **PASS** |
| 14 | Themes friendly-dark / retro-light / glass-light: distinct easing personality | **PASS** |
| 15 | Interrupt stress (tab ×8, accordion ×8, retarget ×5): settle clean | **PASS** |
| 16 | Console errors | **PASS** (0 beyond favicon) |

---

## FAILURES — exact repro

### 3 — Worktree sprout: aria-disabled item shows the GENERIC reason, not its own [FAIL, fix-coverage gap]
- Repro: open Files panel → click `#fmRootBtn` → click the `spike/r2-storage` item (`aria-disabled="true"`).
- Expected (scope + the just-landed FIX3): toast carrying the item's own reason —
  `"spike/r2-storage is read-only in this demo (manual worktree)"`.
- Actual: `"Outside the Tastebook demo script — everything in the main story is clickable though."`
- Root cause (proven): the item stores its reason in `data-demo-arg` via the `demo.reason` action
  (`PMConcept7.html:17... : `data-demo-action="demo.reason" data-demo-arg="spike/r2-storage is read-only…"`),
  with **no** `data-demo-reason`. But the delegated router's disabled branch fires FIRST on
  `aria-disabled="true"` and early-returns before the `demo.reason` action runs:
  ```js
  // PMConcept7.html:30494-30498
  if (… el.getAttribute('aria-disabled') === 'true' || el.dataset.demoDisabled) {
    var code = el.dataset.demoReason || el.dataset.demoDisabled || 'demo_scope';  // -> 'demo_scope'
    say(guard.reason(code)); return;   // demo.reason action never fires; data-demo-arg never read
  }
  ```
  FIX3 (`REASONS[code] || code || REASONS.demo_scope`, :28569) is correct but never sees the free text
  here — the code passed is the literal `'demo_scope'` fallback. FIX3's verified cases (panel-testing
  Quarantine, docker Push, git Run-workflow) all carried the reason in `data-demo-reason`, which this
  element does not. So this element slipped through the fix.
- Guard itself is fine: no action fires, exactly one toast. Severity: minor (feedback copy). Suggested
  fix: read the reason from `data-demo-arg` when `data-demo-action === 'demo.reason'` in the disabled
  branch, or add `data-demo-reason` to the item.

### 5 — `#fmCollapseAll` label never flips to "Expand all" after collapse-all [FAIL, minor UX]
- Repro: expand any folders → click `#fmCollapseAll`. All 11 folders collapse (`aria-expanded=false`,
  0 `.fm-folder.open`), but the `#fmCollapseLbl` still reads **"Collapse all"** (should be "Expand all").
  Verified stable at 1200 ms post-click (not a timing blip). The button still *works* (re-click expands
  all, and the label then correctly reads "Collapse all").
- Root cause (proven): on collapse, `animate(node,false)` removes `.open` only inside `finish()`,
  which runs on `transitionend` / a 340 ms timeout (`PMConcept7.html:44418-44423`). But the collapse-all
  handler calls `refresh()` **synchronously** right after kicking off the animations (`:44541`), while
  every folder still has `.open`. `refresh()` reads `tree.querySelector('.fm-folder.open')` (`:44513`)
  → `anyOpen=true` → label "Collapse all". `finish()` never re-runs `refresh()`, so the label stays stale
  until the next manual interaction. The expand direction is fine because `animate(_,true)` adds `.open`
  synchronously (`:44405`) before `refresh()` runs.
- Suggested fix: call `window.__fmRefreshCollapse()` from `finish()` (or on a 360 ms timeout in the
  collapse-all handler).

### 8 — README.md hover quick-actions lack the "Open preview" variant [FAIL, variant gap]
- Repro: hover the `README.md` row (`data-kind="md"`). Quick actions reveal as
  `[Add to chat · Copy relative path · Open in terminal]` — the generic plain-file set.
- Expected (scope): `[Open preview · Copy path]` for the markdown/README variant.
- Root cause (proven): the authored static markup gives README.md exactly that variant
  (`PMConcept7.html:17085`: `Open preview (cmd.file.open_with → workspace_preview)` + `Copy relative path`),
  but `buildTrails()` strips every authored `.fm-quick` at runtime and rebuilds them by `data-kind`
  (`:44266-44284`): `folder` → new-file/new-folder/terminal; `data-git` → stage/diff/discard; binary/generic
  → save-local-copy; **everything else (incl. `md`) → plain-file set**. There is no `kind === 'md'` branch,
  so the preview variant is lost. 4 of the 5 variants are correct (folder / plain / git-M / binary all
  verified with the right sets + slide+fade reveal + minibtn toast + hover lift `scale(1.08)`).
- Impact: low — "Open preview" is still reachable via the context menu (Open with… → Workspace preview);
  only the hover shortcut is missing. Suggested fix: add an `md`/image branch to `buildTrails`.

### 11a — Context menu NEVER closes on item click [FAIL, interaction defect]
- Repro: right-click any tree row → click a top-level item (e.g. "New file") **or** a submenu item
  (Copy path → Copy relative path). The action fires (toast: `cmd.file.new_file …` / `cmd.file.copy_path → relative …`)
  but `#fileContextMenu` stays `is-open` (verified `open:true, is-closing:false` for a full 1500 ms). Only
  Escape / outside-click / opening another menu close it (all animated).
- Root cause (proven): PMMenu's close-on-pick handler lives in `upgradeWrap` and is attached **only** to
  `.pm6-tb-menu-wrap` menus inside `#sidePanelSlot`/`#bottomDebugHost` (`PMConcept7.html:43363-43384, 43422-43425`).
  `#fileContextMenu` (`.fm-ctx.pm-ctx-menu`) is never upgraded, so it has no item-click→close handler. The
  document-level `closeAll` explicitly EXCLUDES `.pm-ctx-menu` (`:43414-43416`), so internal clicks don't
  close it either. Net: every ctx item executes its action but leaves the menu open — non-standard for a
  context menu. Everything else about the menu is correct: sprouts from the click point
  (`--pm6-sprout-ox/oy = Math.max(0, x-fx / y-fy)`, `:43407-43410`; transform-origin tracked the click in
  every probe incl. keyboard-open `-16px 433px`), overshoot (scale peak 1.021 via `cubic-bezier(.22,1.55,.36,1)`),
  `pm-menu-in` item cascade, "Open with…" flyout (5 items) + "Copy path" flyout (relative/full), Paste
  enabled on folder / disabled on file (`#fmCtxPaste` aria-disabled toggled per `data-kind`, `:44180`),
  Shift+F10 open with origin at the row's left edge, Escape closes animated (`is-closing` sampled), and
  rapid retarget ×5 leaves a single open menu with no stuck `is-closing`.
- Suggested fix: attach a click handler to `#fileContextMenu` that closes on `[role="menuitem"]:not([aria-disabled="true"])`
  pick (mirroring `upgradeWrap`'s `close(menu)`), or add `.pm-ctx-menu` item-click close to PMMenu.

### 11c — No "Stage" action in the context menu for git-modified rows [FAIL, content gap]
- Repro: right-click a git-modified row (`src/routes/recipes.rs`, `data-git="M"`). Menu items:
  `[New file, New folder, Open with…, Open in system default, Open diff, Reveal in terminal, Cut, Copy,
  Paste, Copy path, Save local copy, Find in files, Open other worktree…, Compare with worktree…, Rename, Delete]`.
  **Open diff is present**, but **Stage is absent** (there is no Stage item anywhere in `#fileContextMenu`).
- Root cause: the context menu is a **fixed** item set; the only per-target adaptation is Paste's
  `aria-disabled` (`:44180`). Git staging is offered via the row quick-actions (hover → "Stage changes")
  and the Changed pane, but not via the context menu. Scope expected "Stage/Open diff present".
- Impact: low-medium (staging is reachable two other ways). Suggested fix: conditionally add a Stage item
  for `[data-git]` targets, or adjust scope to match the fixed-menu design.

---

## Adjudicated harness artifacts (investigated, NOT product issues)

- **1 "slot .hidden"**: `#panel-files` itself hides via `display:none` (removal of `.active`); the `.hidden`
  class goes on the **slot** (`#sidePanelSlot`) — `PMPANEL.applyInstant` `s.classList.toggle('hidden', !targetId)`
  (`:44747`). Both correct. Exit (`railPanelOut`, scale+−12px sampled) and enter (`railPanelIn`) both run and settle to 0 anims.
- **3 "label didn't update on pick"**: the visible label is the `.pm6-tb-menu-label` span, which DID update to
  `orch/lane-b-api` (I initially read the `title` attr, which stays "main"). Selection moved + `.is-selected` popped + menu closed animated.
- **3 Escape/outside close**: both close animated — `.is-closing` + 3 running anims, transform scales back toward
  the trigger (1.0→0.80 over ~200 ms). An earlier 0-sample was a state bug (a toggle had already closed the menu).
- **5/6 "rows not hiding"**: hiding is applied to the `.fm-node` **wrapper** (`n.style.display='none'`, `:44661`),
  not `.fm-row`; a child's own computed `display` is not `none` when its parent is hidden. Measured via
  `getClientRects()`: hide-ignored hides all 3 `data-ignored` rows (0 rendered); filter "route" → 36→9 nodes,
  "4 matches", ancestor folders preserved; clear restores 36.
- **7 "8/8 overshoot"**: 3 folders (`web/src`, `web/src/routes`, `web/src/routes/recipe/[id]`) are pre-opened at
  load by `revealActive()` (ancestors of the active file). All 8 that animated overshot >90°; collapse verified
  all 11 (`chevClose` 11/11, 0 remaining).
- **7 ".active-file moves on click"**: `.active-file` is a static "current file" marker (authored at `:17001`,
  never reassigned) with a distinct accent-tint background (CSS `:16279`). Click = selection + `cmd.file.open` toast; distinct styling verified (transparent vs accent-12%).
- **7 type-ahead**: works — 'm'→`main.rs`, 'b'→`binary-asset.bin`, 'r'→`routes`. An earlier miss was type-ahead buffer accumulation ("mb").
- **8 recipes.rs reveal**: needed `src/routes` expanded (recipes.rs hidden otherwise); once visible, reveals correctly (op 0→1, `[Stage/Open diff/Discard]`).
- **10 "OPEN EDITORS rows"**: `.fm-openrow` also matched the 5 RECENT rows; OPEN EDITORS genuinely has 3 (+page.svelte/recipes.rs/mixed_fractions.rs).
- **13 chevron "anim" under reduce**: a **0.01 ms** CSS transition (standard duration-kill pattern); rotation snaps
  0→90° with zero intermediate frames and `panelArea` running=0 after settle. `data-reduced-motion="1"` uses `transition:none` directly (`:16470`).
- **14 "retro chevron overshoot"**: the 102° overshoot is **baked into the theme-independent `chevOpen` keyframes**
  (`:15279`: `rotate(calc(var(--pm-chev-deg,90deg) * 1.1333))`), so every theme's chevron peaks at 102°. Per-theme
  personality lives in `--acc-ease` (friendly spring `.34,1.56,.64,1` / retro snap `.2,0,0,1` / glass settle `.24,1.34,.4,1`)
  and `--pm-travel` (12 / 4 / 14 px) — all confirmed distinct. Retro's snap is real (in the accordion easing), just not in the chevron overshoot amount.
- **15 accordion spam**: interrupt-safe — after ×8 (and ×7) rapid clicks the folder settles consistently, inline
  `max-height`/`opacity` cleared by `finish()`, collapse owned by `.open`→`display:none` (CSS `:16327-16328`),
  chevron animation `finished` (not running), and it reopens fully. `chevAnims:1` was a fill:both finished animation.

---

## Screenshots (all in `shots/`)

1. `v2-01-lifecycle-open.png` — files panel active (post reopen enter-anim)
2. `v2-02-tab-changed.png` / `v2-03-tab-explorer-ink.png` — `#fmTabInk` stretch mid-flight + landing (widths 77→164→77 px)
3. `v2-04-rootmenu-open.png` / `v2-05-rootmenu-closed.png` — worktree sprout (overshoot peak scaleX 1.028) + animated exit
4. `v2-06-banner.png` — banner Refresh/Pop-out
5. `v2-07-collapse-flash.png` — `#fmTree.pm-flashing` peak after collapse-all
6. `v2-08-filter-reveal.png` / `v2-09-filter-route.png` — filter wrap reveal + live "route" filter (4 matches)
7. `v2-10-tree-expanded.png` — all folders expanded; chevron overshoot 102° (`chevOpen`), `pmKidIn` cascade
8. `v2-11-multiselect.png` — multi-select + `#fmSelBar`
9. `v2-12-quickactions.png` — hover quick-actions revealed (slide+fade)
10. `v2-13-changed-pane.png` / `v2-14-open-pane.png` — Changed shelves + Open editors
11. `v2-15-ctx-clickpoint.png` — context menu sprouted AT the click point
12. `v2-16-ctx-submenu.png` — "Open with…" submenu flyout (5 items)
13. `v2-17-footer-pulse.png` — `#fmIndexChip` dot pulse (shPulse)
14. `v2-18-reduced-media.png` / `v2-18-reduced-attr.png` — reduced-motion end states (0 anims, functional)
15. `v2-19-theme-friendly-dark.png` / `-retro-light.png` / `-glass-light.png` — theme personality matrix
16. `v2-20-stress-final.png` — post-stress settled state

Raw machine data: `/tmp/v2-results.json` (per-check), `final-results.json` (adjudicated summary).

---

## Motion-quality observations (expert pass)

- **Genuinely polished.** The W-series system is coherent and high-craft: chevron overshoot (102° spring) +
  `pmKidIn` row cascade + grid-rows accordion settle + `pmMenuIn` menu cascade all feel intentional and land cleanly.
  Ink FLIP stretch is pixel-accurate (≤0.34 px on every tab hop, both directions). Context-menu sprout-from-click-point
  is correctly implemented (transform-origin tracks the clamped/flipped click offset).
- **Per-theme personality is real and distinct** — friendly spring / retro snap / glass settle are measurably different
  easings with different travel (12/4/14 px); not just token theater.
- **Reduced motion is thorough** for the panel scope: both media and attr paths kill panel enter/exit, ink, tree cascade,
  chevron, menu sprout, and flash; the index-chip pulse is killed-but-visible and resumes; everything stays functional.
  The 0.01 ms-duration pattern leaves a 1-frame `getAnimations()` blip but settles to zero (imperceptible).
- **Stress-hardened**: rapid tab/accordion/retarget spam all settle to the correct last state with no stuck classes and
  zero console errors. Accordion interrupts are handled by per-node timer/`finish()` cleanup.
- **The 5 failures are all shallow** (copy/label/variant/wiring), not motion defects — none cause jank, broken state, or
  stuck animations. The most user-visible is 11a (context menu not dismissing on selection). The glass-theme ctx offset
  measured exactly 6 px (the documented backdrop-filter containing-block quirk) and the menu remained fully usable.
- **One micro-note (not scored):** `#fmRootBtn[title]` is not updated on worktree pick (stays "main") while the visible
  label updates correctly — the tooltip lags the label. Cosmetic.
