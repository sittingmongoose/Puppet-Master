# GUI Platform Currentness Repair - FABLE 20260706

Generated: 2026-07-07T14:25:22Z

## Closure

- Source finding: `fable-20260706-p0-gui-toolkit-truth-spec-lock-vs-final-gui`
- Deterministic closure finding: `sfk-4332f4dc0daf756614caa8f3`
- Status: `repair_validated`

## Decisions Applied

- Active GUI toolkit target is Slint 1.17.1.
- Native desktop uses Slint Winit with Skia compiled in and selected by default on Windows, Linux, and macOS.
- Renderer fallback order is `SLINT_BACKEND`, persisted preference, Winit + Skia, Winit + FemtoVG-wgpu, then Winit software emergency mode.
- First GUI build includes native desktop plus a Rust Slint/WASM canvas web GUI.
- Browser-only WASM routes PTY, filesystem watching/mutation, process/container operations, and browser automation through the trusted local daemon.
- CEF embedding, system tray, native detached Slint windows/redock, and raw native OS drag/drop remain `native_full` with web alternatives or disabled/degraded states.
- Production GUI uses bundled SVG `icon_id` assets and no emoji, emoji-like pictographs, Unicode pseudo-icons, network/CDN icons, or icon-only state carriers.

## Evidence

- `Plans/Spec_Lock.json` now pins `locked_decisions.ui.toolkit_version = 1.17.1`.
- `Plans/FinalGUISpec.md` owns F3-417 and the renderer/web/daemon/capability/icon contracts.
- `Plans/Automated_Testing_System.md` owns ATS-023 for Slint/WASM dev preview and smoke tests.
- `Plans/UI_Command_Catalog.md` owns UCC-107 for development-preview command controls only.
- `scripts/pm-gui-asset-policy.py` enforces the SVG/no-emoji policy once GUI source exists and reports pending/not-applicable while no GUI source exists.

## Scope Boundary

This repair does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, production build tasks, or product build artifacts. Broader FABLE P0/P1 findings remain in their original backlog unless separately repaired.

## Validator Receipts

- `python3 scripts/pm-gui-asset-policy.py` -> `not_applicable`; no GUI source tree exists yet, so the policy is pending until GUI source is introduced.
- `python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/fable-20260706 --require-closure-matrix --require-effective-status --source-artifact gui_platform_currentness_findings.jsonl` -> `pass`; repair-required count is 0 and terminal state is `repair_validated`.
- `python3 scripts/pm-plans-verify.py verify-spec-lock` -> `pass`.
- `python3 scripts/pm-plans-verify.py validate-implementation-readiness` -> `pass`; `buildability_gate_passed=true` and node readiness is `ready_for_node_compile` after the bounded PNC-019 certification harness, with no product WorkNodes or build artifacts emitted by this repair.
- `python3 scripts/pm-plans-verify.py validate-wiring-matrix` -> `pass`; `cmd.gui_dev_preview.*` is excluded from production wiring.
- `python3 scripts/pm-plans-verify.py validate-plan-migration` -> `pass`.
- `python3 scripts/pm-shard-plans.py --check` -> `pass`; 78 docs and 1414 shards checked.
- `python3 scripts/pm-plans-verify.py run-gates` -> `pass`.
- Wrapper hangs: none observed.
