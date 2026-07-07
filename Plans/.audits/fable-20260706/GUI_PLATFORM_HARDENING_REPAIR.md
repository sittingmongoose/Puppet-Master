# GUI Platform Hardening Repair

Audit: `fable-20260706`

Generated: `2026-07-07T16:54:19Z`

Scope: process/spec hardening only. This repair does not create WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, or production build tasks. It does not repair the broader FABLE P0/P1 backlog.

## Finding Closed

- `fable-20260706-p0-gui-toolkit-truth-spec-lock-vs-final-gui`

This finding is no longer open in the effective FABLE projection. Historical audit/currentness/buildability rows may remain as source evidence, but the effective projection is `repaired_superseded`.

## Canonical GUI Platform Contract

- Native desktop implementation remains Rust plus Slint `.slint` markup.
- Slint `1.17.1` is the selected/currentness decision dated `2026-07-07`.
- Rust stable `1.96.1` was verified on `2026-07-02`.
- Runtime implementation must reverify official Rust and Slint releases before any coding or build work.
- React, Tauri, DOM-rendered product UI, and HTML/CSS/JS product shells are forbidden.
- Slint/WASM web may use only minimal HTML/canvas bootstrap and generated/minimal JavaScript glue needed to load the WASM canvas client, attach assets/canvas, and connect to approved local services.

## Hardening Changes

- `Plans/FinalGUISpec.md` Appendix B now separates Rust verification from the Slint `1.17.1` currentness decision and adds the reverify-before-runtime-implementation rule.
- `Plans/FinalGUISpec.md` F3-030 now allows the Slint/WASM web bootstrap exception while still forbidding React/Tauri/DOM-rendered product UI and HTML/CSS/JS product shells.
- `Plans/FinalGUISpec.md` F3-030/F3-417 and `Plans/Automated_Testing_System.md` now surface `python3 scripts/pm-plans-verify.py validate-gui-asset-policy`.
- `scripts/pm-gui-asset-policy.py` now scans future GUI expected-output surfaces: `ui`, `src`, `app`, `apps`, `crates`, `frontend`, `web`, `wasm`, `native`, `assets`, `resources`, `tests`, `fixtures`, and `snapshots`.
- `scripts/pm-gui-asset-policy.py validate` is a backwards-compatible alias for the default invocation.
- `scripts/pm-plans-verify.py` exposes `validate-gui-asset-policy` and includes it in `run-gates` and `audit-governance`.
- `not_applicable` remains a passing governance state while no GUI source tree exists.

## Validator Coverage

The GUI asset policy validator fails GUI source on:

- emoji, Extended_Pictographic-style characters, Dingbat-style symbols, and arrow/symbol pseudo-icons;
- remote or CDN icon fonts/SVGs;
- SVG assets without approved `icon_manifest.json` entries;
- `icon_id` references that do not resolve to manifest entries;
- icon-only controls without accessible labels, semantic labels, tooltips, fallback text, or visible labels.

The validator also preserves valid local SVG namespace usage such as `http://www.w3.org/2000/svg`; that namespace is not treated as a remote CDN asset.

## Projection Updates

- `Plans/.audits/fable-20260706/currentness_check_report.json` contains an `effective_supersessions` row for the GUI toolkit finding.
- `Plans/.audits/fable-20260706/buildability_repair_registry.jsonl` marks the exact GUI toolkit finding as `repaired_superseded`.
- `Plans/.audits/fable-20260706/effective_status.json` points to this hardening repair and lists the exact superseded finding.
- `Plans/.audits/fable-20260706/P0_P1_REPAIR_PLAN.md` marks only this item as closed/superseded; the remaining P0/P1 rows stay open or unchanged.

## Validation Receipts

- `python3 scripts/pm-gui-asset-policy.py`: `not_applicable`, exit 0, no GUI source checked.
- `python3 scripts/pm-gui-asset-policy.py validate`: `not_applicable`, exit 0, no GUI source checked.
- `python3 scripts/pm-plans-verify.py validate-gui-asset-policy`: `pass`, treating raw `not_applicable` as a valid pre-GUI-source state.
- Temporary negative probe outside the repo returned exit 1 and reported the intended failures: U+2192 pseudo-icon, U+2728 pictographic symbol, CDN SVG reference, missing icon manifest, and unlabeled icon-only control.

## Stop Rule

This repair is complete only for GUI platform currentness/process hardening. It must not be used as evidence that storage, platform specs, FileSafe, UI command catalog, wiring matrix, runtime lifecycle, Contracts V0, Goal Runtime, Executor, referenced-doc, progression-gate, or PlanUnit behavioral acceptance findings are closed.
