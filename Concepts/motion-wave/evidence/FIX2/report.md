# FIX2 — PM7 Motion Wave Fix Pass (V2: File Manager verification)

**Agent:** FIX2 · **Target:** `Concepts/PMConcept7.html` (build artifact) @ `localhost:8799`
**Viewport:** 1440x900, Chromium headless · **Engine:** standalone Playwright (report-only on the artifact; all edits in `Concepts/pm7-tools/base/PM7-base.html`)
**Run date:** 2026-08-02

## 1. Governance

- New `BASE_SHA = 26fb95105bcbd208a31b92f4e5a71eac4f9a31835ea585a6295e11a0c02a21fa` (was `54846c71…`). Pinned in `build_pm7.py`; matches `shasum -a 256` of base.
- `python3 Concepts/pm7-tools/build_pm7.py --out Concepts/PMConcept7.html --outdir <scratch>` -> 3,195,787 bytes.
- Gates 4/4: brace_balance PASS, css_vars_defined PASS, js_node_check PASS, no_emoji PASS.
- Built-output signatures grepped (single occurrence each): `PMMenu.close(ctx)` (built:44625); `demoReason || el.dataset.demoArg` (built:30495); `setTimeout(refresh, 360)` (built:44547); `kind === 'md'` (built:44288).

## 2. Edit sites (all in base/PM7-base.html)

| Fix | Base site | Change |
|---|---|---|
| A | submenus IIFE in `wireFiles` (base ~45622, after `ctx.addEventListener('pm-ctx-open', closeAllSub)`) | added a `ctx` click handler: leaf `.fm-ctx-item` (submenu leaves + aria-disabled included) -> `closeAllSub(); PMMenu.close(ctx)`; submenu parent triggers (`.fm-ctx-wrap[data-sub] > .fm-ctx-item`) are skipped (their own handler `stopPropagation`s, so hover flyouts stay open). Reuses the engine's animated exit (`.is-closing` + 240ms) instead of mirroring the class dance. |
| B | delegated `routerHandler` disabled branch (base ~31540) | `var code = el.dataset.demoReason \|\| el.dataset.demoArg \|\| el.dataset.demoDisabled \|\| 'demo_scope'` (added `el.dataset.demoArg` between reason and disabled). `guard.reason` resolves unknown codes verbatim, so `demo.reason`-style elements toast their authored arg. |
| C | `collapseAllTb` btn click handler (base ~45553, after the sync `refresh()`) | added `setTimeout(refresh, 360)` to re-read the label after `collapseAnim.finish()` strips `.open` at the ~340ms settle (reduce() finishes sync, so the extra pass just re-confirms). |
| D | `buildTrails` branch chain (base ~45300, between readonly and the plain-file else) | added `else if (kind === 'md')` -> `eye`/Open preview (`cmd.file.open_with`) + `copy`/Copy relative path (`cmd.file.copy_path`), reproducing the authored README set with `path`-interpolated args. Only `data-kind="md"` row in the tree is README.md. |

## 3. Behavioral verification (Playwright, built artifact)

Raw data: `verify-results.json`. Console: 0 page errors, 0 console errors (favicon-404 baseline = none observed). Theme friendly-dark, Files panel visible, 36 tree rows, toast hooked.

- **FIX A** — close-on-pick:
  - A1 Open diff: open=is-open/block; +40ms is-closing/block; +340ms display none; toast `cmd.git.diff_open -> hand off identity + repo_id + worktree_id to Source Control`. PASS.
  - A2 submenu: hover "Open with…" -> wrap.open=true, sub display block, root menu still is-open (no close); click "Source editor" -> +40ms is-closing, +340ms none; toast `cmd.file.open_with -> source_editor` (whole menu closed). PASS.
  - A3 aria-disabled "Open in system default": +40ms is-closing, +340ms none; toast `system_default is not in the MVP open_with enum; separate future handoff` (specific, closes). PASS.
  - A4 Escape -> display none. A5 outside-click -> display none. PASS (unchanged).
  - A6 rapid right-click retarget row<->row: exactly 1 `.is-open`, not closing. PASS (clean).
- **FIX B** — spike/r2-storage toast = `spike/r2-storage is read-only in this demo (manual worktree)` (its OWN arg, NOT "Outside the Tastebook demo script"). Regressions: testing tr-2219 Quarantine = `already quarantined 2d`; docker publish Push = `image not built yet` (both data-demo-reason, unchanged). PASS.
- **FIX C** — start "Collapse all" (3 open); after collapse "Expand all" (0/11) after 600ms settle; after expand "Collapse all" (11/11); rapid spam x5 -> "Expand all" (0/11, matches final); reduce() path -> toggles sync, label "Collapse all" (11/11) correct immediately. PASS.
- **FIX D** — README.md quick actions = [Open preview, Copy relative path] (actions cmd.file.open_with + cmd.file.copy_path). Regression sets unchanged: folder = [New file here, New folder here, Open in terminal]; git (recipes.rs) = [Stage changes, Open diff, Discard changes]; plain (main.rs) = [Add to chat, Copy relative path, Open in terminal]. PASS.

## 4. Screenshots

`fixA-context-open.png` (full fm-ctx open, "Open in system default" greyed n/a); `fixB-rootmenu.png`; `fixC-collapse-label.png`; `fixD-readme-quick.png` (README.md hover = eye + copy only).

## 5. Surprises

- tb-menu's own `upgradeWrap` disabled-pick path actually returns early WITHOUT closing (and the document click handler excludes `.pm6-tb-menu`), so tb-menu disabled picks do not self-close in shipped code; the FIX A requirement ("toast AND close") was therefore satisfied explicitly via the new ctx handler rather than by literal mirroring of tb-menu. The explicit verification requirement (close) was met regardless.
- Only one `data-kind="md"` row exists (README.md) and no md row carries `data-git`, so the D branch is perfectly isolated; placed after the git/readonly branches so any future git-tracked md keeps the git variant.
- The toast API renders into the notify stack (#rsStack); capturing required wrapping `window.toast` (preserving its .important/.push/.clear) since `say()` reads it at call time.
