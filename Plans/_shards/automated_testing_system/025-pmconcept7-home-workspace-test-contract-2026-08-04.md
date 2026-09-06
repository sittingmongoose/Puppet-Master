# Shard 025: PMConcept7 Home Workspace test contract — 2026-08-04

Source: `Plans/Automated_Testing_System.md`

Source lines: L2990-L3087

Source SHA256: `92a37e73a67b4a820fc5be5ef5b1033682608005a6cf09da37b46ab2455ba2e7`

---

## PMConcept7 Home Workspace test contract — 2026-08-04

Amended 2026-08-12 — the matrix must assert observable geometry, not dispatch counts. Two
Home defects shipped green because their fixtures asserted only that one command was
emitted, or only that a global "last opened file" marker was set. Every fixture that
covers a visible outcome now asserts that outcome: a resize fixture asserts the rendered
surface box changed on both sides of the gesture and treats a commit that moves zero
pixels as a failure; a move fixture asserts a lifted item, a placeholder seated in the
target host, and a neighbour's transform-free layout position changing before any drop;
an open-in-panel fixture asserts the rendered buffer and the tab, in all four panels; a
collapse fixture asserts the panel height on both sides of the toggle and that the control
stays visible and hit-testable on the collapsed strip.

Case set changes: the target-picker drop-rail cases are retired with the rail, and their
coverage moves to drags over the live layout plus an outer-edge-band case for a dock that
is currently empty. The per-surface `Move or dock` menu-inventory case is replaced by a
grab-handle case that proves one handle per eligible surface, an accessible name, keyboard
pick-up/move/drop reaching every host with one command and one persist, and the polite
live region. Loss of pointer capture is removed as a cancellation vector; Escape, pointer
cancellation and window blur remain. New coverage: editor tab drag-reorder surviving a
re-render, the width-aware overflow chip in every open panel including panels opened on
demand, the contact-aware tab silhouette's flush-contact and independent left/right corner
states, and dashboard widget reorder and grid-snap resize.

The Home Workspace live matrix is a required GUI/runtime fixture family, not a
visual-only smoke test. It covers panel/browser/File Manager paths; movement,
docking, floating, resize, cancellation, lost capture, Escape/blur, and reduced
motion; terminal section/workgroup limits and identity preservation; reload,
corruption, migration, and off-screen recovery; one-command/one-persist semantic
commit behavior; and zero console/page errors. The visual matrix captures
`1024x768`, `1280x800`, `1600x900`, and `2200x1200` in default, all-open,
edge-docked, and floating layouts, with all eight themes for all-open, Friendly
Dark and Glass Light across all layouts, plus reduced-motion captures.

The required cross-product is exactly 72 deterministic fresh-context cases:
eight themes by four viewports with all surfaces open (32), Friendly Dark and
Glass Light by four additional layouts by four viewports (32), and both anchor
themes by reduced motion by four viewports (8). Additional layouts are default,
edge-docked, floating, and terminal-max. Listeners for console and page errors are
installed before navigation, non-loopback requests are blocked, storage/theme/motion
state is seeded deterministically, and each case records geometry, identity, and
runtime errors. A direct headful pass additionally checks perceived no-jump pickup,
reflow, glow/recovery, scrolling, real blur, keyboard/focus, clipping, popup
fallback, and cursor cleanup.

Each fixture records the layout revision before and after the gesture, command
count, persistence count, stable surface identities, and any disabled reason. A
cancelled or rejected gesture must prove byte-equivalent model restoration and zero
semantic dispatch/persist. Identity fixtures prove no duplicate buffer, browser
session, chat identity, terminal session, or PTY. Screenshots are evidence only
when paired with the live harness result and page/console error log.

### ATS-029 - Home Workspace Executable Certification Matrix

```yaml
plan_unit_id: ATS-029
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Home Workspace certification combines source-hashed control-to-command coverage, live visible interaction tests, persistence and fault-injection tests, stable-identity lifecycle tests, zero browser errors, and an exact 72-case visual matrix plus a direct headful pass.
gui_related: true
gui_classification_reason: The verification exercises and captures user-visible Home behavior across themes, sizes, layouts, motion, menus, gestures, and failures.
split_recommended: false
depends_on: [ATS-028, F3-501, F3-502, F3-503, UIW-010, SP-245]
unblocks: []
acceptance_criteria:
- All four editor and Browser targets and all four File Manager targets are exercised through visible production controls, and each asserts the rendered buffer rather than a dispatch count or a global marker.
- The factory-state fixture proves Browser Preview and Automation remain owned by Panel 1 in the exact stable `Preview -> Automation -> overflow/actions anchor` group order, Browser Preview is active, inactive Automation is not painted or keyboard-focusable, overflow fitting cannot resurrect it, and a settled multi-frame observation records zero recurring child-list moves involving either owner tab.
- Every surface host route, resizer, cancellation path, terminal cap, popup fallback, corruption variant, migration, write failure, reload, and second clean reload is executable; host routes are exercised through the grab handle by pointer and by keyboard, and resizers assert changed rendered geometry.
- Fifth pane and fifth section rejection are visibly disabled with exact reasons and zero dispatch.
- The visual matrix contains exactly 72 deterministic fresh-context captures and has zero major overlap, clipping, false controls, console errors, page errors, or focus/cursor residue.
- "Amended 2026-08-13: the live matrix additionally carries the topbar_reset_layout_row, chat_popout_stays_in_canvas, grip_corner_hit_target_and_zorder, boot_never_floating, and dead_space_self_heal fixtures; the compact-menu fixture asserts four rows including Reset Layout; the drag fixture asserts the placeholder follows the pointer at the pickup-time footprint without jitter; and the resize fixture asserts adjacent-pair symmetry, post-commit stability, and floating height via the corner handle. The 72-case visual matrix is structurally unchanged."
- A fresh second pipeline build is byte-identical to Concepts/PMConcept7.html and all PM7/static/Plans/governance gates pass in disposable shadows.
validation_surfaces:
- node Concepts/pm7-tools/verify/home_workspace_matrix.mjs
- node Concepts/pm7-tools/verify/smoke.mjs
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-plan-index.py validate
risk_class: false_green_home_certification
reasoning_tier: standard
context_scope: home_live_certification
implementation_surfaces: [Plans/Automated_Testing_System.md, Concepts/pm7-tools/home_workspace_source.py, Concepts/pm7-tools/verify/home_workspace_matrix.mjs]
node_compile_hint:
  mode: home_executable_matrix
  create_worknodes: false
source_lineage:
- PMConcept7_Home_Workspace_Audit_Packet_v1/audit/05_LIVE_VISUAL_TEST_PROTOCOL.md
preserved_exact_tokens: [72, zero console errors, second clean reload, byte-identical]
negative_constraints:
- Do not substitute an internal API for a missing visible production control.
- Do not count screenshots or declarative wiring rows alone as test proof.
compatibility_only_notes: []
stale_retired_dispositions:
- The prior 15-check 34-shot Home harness is retired as certification authority.
- "Amended 2026-08-12: fixtures that assert only command/persist counts are retired as sufficient evidence for a visible outcome; the drop-rail target fixtures and the per-surface Move or dock menu-inventory fixture are retired with the affordances they covered; loss of pointer capture is retired as a cancellation vector."
- "Amended 2026-08-13: the window-exit-floats drag fixture branch is retired with the behavior it covered (window exit is now invalid_target); the three-row compact-menu assertion and the reset-forbidden regex are retired with the four-row menu; any fixture that accepts a floating surface at boot is retired (boot demotes floating to last_docked_host)."
owner_hints: [Plans/Automated_Testing_System.md, Plans/UI_Wiring_Rules.md]
```
