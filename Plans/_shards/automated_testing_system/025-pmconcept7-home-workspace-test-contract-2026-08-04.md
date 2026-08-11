# Shard 025: PMConcept7 Home Workspace test contract — 2026-08-04

Source: `Plans/Automated_Testing_System.md`

Source lines: L2826-L2897

Source SHA256: `e31f410d13c34109b0e8f74e9a342035c71d0ced1bf04c8c8ac6a087851b96b3`

---

## PMConcept7 Home Workspace test contract — 2026-08-04

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
- All four editor and Browser targets and all four File Manager targets are exercised through visible production controls.
- Every surface host route, resizer, cancellation path, terminal cap, popup fallback, corruption variant, migration, write failure, reload, and second clean reload is executable.
- Fifth pane and fifth section rejection are visibly disabled with exact reasons and zero dispatch.
- The visual matrix contains exactly 72 deterministic fresh-context captures and has zero major overlap, clipping, false controls, console errors, page errors, or focus/cursor residue.
- A fresh second pipeline build is byte-identical to Concepts/PMConcept7.html and all PM7/static/Plans/governance gates pass in disposable shadows.
validation_surfaces:
- node Concepts/pm7-tools/verify/home_workspace_matrix.mjs
- node Concepts/pm7-tools/verify/smoke.mjs
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-plan-index.py validate
risk_class: false_green_home_certification
reasoning_tier: standard
context_scope: home_live_certification
implementation_surfaces: [Plans/Automated_Testing_System.md, Concepts/pm7-tools/verify/home_workspace_matrix.mjs]
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
owner_hints: [Plans/Automated_Testing_System.md, Plans/UI_Wiring_Rules.md]
```
