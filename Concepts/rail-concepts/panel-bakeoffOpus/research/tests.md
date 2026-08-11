# TESTING side panel — design brief

Net-new design. Current stub (`Concepts/PMConcept7.html:15794-15818`, 25 lines) shows a policy chip, a fake "214 passed" row and two buttons. It has none of the five mandated regions, no state machine, no redaction surface. Widths: **240 min / 380 default / 480 max**.

Panel identity: `testing` is canonical in the side-panel inventory (`Plans/FinalGUISpec.md:L6263-L6319`). Owner boundary is hard: **this panel displays and wires; it must not define or duplicate test execution semantics** (`Plans/FinalGUISpec.md:L30321-L30372`, negative constraint). `Plans/Automated_Testing_System.md` owns runner selection, policy semantics, and result production.

---

## 1. Required regions, canonical order

The region set is **non-negotiable and named verbatim** in spec: "Panel layout contains `run_list`, `active_run_detail`, `failure_list`, `artifact_preview`, and `redaction_notice`." (`Plans/Automated_Testing_System.md:L2231-L2237`)

| # | Region | Purpose |
|---|--------|---------|
| 0 | `capability_header` (derived) | Effective testing capability + visibility policy projection; the runtime-disabled reason lives here. Required by `Plans/Automated_Testing_System.md:L83-L98` (global/per-project rows, inherited/effective state) even though it is not in the five-name list — it is the only place the disabled reason can render. |
| 1 | `run_list` | Reverse-chronological `TestRunReceipt` rows. Selection driver for regions 2-4. |
| 2 | `active_run_detail` | The selected receipt: status, counts, adapter, target, timing. Host of Watch/Cancel/Open receipt/Export. |
| 3 | `failure_list` | `failure_refs[]` entries for the selected run. Empty-state when `failed_count == 0`. |
| 4 | `artifact_preview` | `log_artifact_refs[]` + `visual_artifact_refs[]`, post-redaction only. |
| 5 | `redaction_notice` | Redaction state for whatever region 4 is about to show. **Renders above the preview, not below it** — it is a gate, not a footnote. |

Region 0 also hosts the visible-session projection chip (`show_when_possible`, visible active, collapsed, detached, backgrounded, non-embeddable — `Plans/Automated_Testing_System.md:L83-L98`, `L648-L726`).

## 2. State machine

**Panel-level: runtime-disabled → enabled.** Testing stays runtime-disabled until *all* of: target adapter configured, capability probe returns `available`, permission snapshot current, required fixtures exist, and the invocation can produce a `TestRunReceipt` without claiming PNC-019 certification. The transition event is `testing.runtime_enabled_for_adapter` carrying `adapter_id`, `project_id`, `capability_probe_ref`, `permission_snapshot_id`, `enabled_at_utc`, `reason_code` (`Plans/Automated_Testing_System.md:L2239-L2245`). Enablement is **per adapter**, so the panel can be half-enabled: `cargo` enabled, `playwright` not. Design for a per-adapter enablement chip, not one global boolean.

**Run-level:** `TestRunReceipt.status` ∈ `queued | running | passed | failed | cancelled | blocked | inconclusive` (`Plans/Automated_Testing_System.md:L2221-L2229`). Terminal = everything except `queued|running`.

**Capability projections (per family, global and per-project rows):** value `Auto | On | Off`, plus projections `unavailable`, `blocked-needs-authority`, `prohibited-by-policy` (`Plans/Automated_Testing_System.md:L83-L98`, `ATS-008` at `L581-L646`). Semantics that must show in copy: `Auto` may discover/select/install within authority; `On` blocks or asks for authority when unavailable; **`Off` prohibits use and never counts as successful verification** — never render an `Off` family as a green pass.

**Button enablement derives from status, not from the UI's own idea of state** (`Plans/Automated_Testing_System.md:L2231-L2237`):
- Watch, Cancel → enabled for `queued|running`
- Open receipt → enabled for any terminal state
- Export bundle → enabled when `log_artifact_refs[]` or `visual_artifact_refs[]` non-empty
- Run → `adapter_configured && capability_probe_available && permission_snapshot_current && fixtures_present` (`Plans/UI_Command_Catalog.md:L8298-L8313`)

## 3. Ranked feature inventory

**P0 — visible at 240px.** Runtime-enabled/disabled chip with reason; Run button; `run_list` collapsed to one line per run (status dot + truncated target + relative time); `active_run_detail` reduced to status chip + pass/fail/skip/error counts; `failure_list` as a count-badge row that expands; `redaction_notice` when redaction is pending/failed. Redaction notice is P0 at every width — it is a display gate.

**P1 — 380px default.** Full `run_list` rows with adapter + duration; `active_run_detail` with adapter_id, target_ref, started/ended; failure rows with assertion text truncated to one line; `artifact_preview` thumbnail strip; Watch/Cancel/Open receipt/Export as a 4-button row; capability family rows with `Auto/On/Off` segmented control (`Plans/UI_Command_Catalog.md:L7970-L7982`).

**P2 — overflow, sheet, or 480px only.** Per-family global-vs-project inheritance table; visible-session controls (open/watch/background/detach); redaction profile inspector; containerized-host fields (`host_profile_id`, `host_instance_ref`, port/access URL refs, preflight/launch/cleanup receipt refs — `Plans/Automated_Testing_System.md:L1534-L1622`); TestStrategy `coverageLevel` (`Basic|Standard|Comprehensive`) and `requiredCapabilityRefs` (`Plans/test_strategy.schema.json`); GUI-automation manifest drill-down (`browser_sessions`, `timeline_path`, `checks_path` — `Plans/gui_automation_manifest.schema.json`); dev-preview/smoke-test controls, which must be absent in production builds unless explicitly configured (`Plans/Automated_Testing_System.md:L104-L164`, ATS-023).

## 4. Command list — fully cataloged, no invention needed

All 13 exist. 7 already carry `Side panels > Testing` wiring rows in `Plans/Wiring_Matrix.production.json` (`catalog.testing_run`, `_watch_run`, `_cancel_run`, `_open_receipt`, `_open_failure`, `_export_bundle`, `_open_panel`). The 6 capability/session commands are wired to **Settings**, not this panel — see §9.

| Command | Trigger element | Preconditions | Kind / flag |
|---|---|---|---|
| `cmd.testing.open_panel` | Activity bar icon | `panel_available` | `navigation_wrapper` |
| `cmd.testing.run` | Run button, `active_run_detail` header | `adapter_configured && capability_probe_available && permission_snapshot_current && fixtures_present` | `domain_action`, mutating |
| `cmd.testing.watch_run` | Run row / detail | `run_status_queued_or_running` | `domain_action`, view-only ("never starts or completes tests") |
| `cmd.testing.cancel_run` | Detail button | `run_status_queued_or_running && permission_allowed` | `domain_action`, **destructive-adjacent**: needs confirm. Lands as status `cancelled`; **deletes no receipts** |
| `cmd.testing.open_receipt` | Detail button, run row context menu | `run_status_terminal` | `navigation_wrapper` |
| `cmd.testing.open_failure` | `failure_list` row | `failure_refs_present` | `navigation_wrapper` |
| `cmd.testing.export_bundle` | Detail overflow | `log_or_visual_artifacts_present` | `domain_action`, **egress** — export leaves the app; confirm + redaction attestation |
| `cmd.testing.capability_policy.set` | Capability family row segmented control | policy owner available + authority present | `domain_action`, **approval-gated** (authority snapshot) |
| `cmd.testing.visibility_policy.set` | Header visibility chip | scope + redaction profile ref | `domain_action` |
| `cmd.testing.session.open` | Visible-session chip | session id, target surface, route, redaction profile | `domain_action` |
| `cmd.testing.session.watch` | Visible-session chip | session id, stream identity, fallback route | `domain_action` |
| `cmd.testing.session.background` | Session overflow | background reason, continuation policy | `domain_action` |
| `cmd.testing.session.redaction.inspect` | `redaction_notice` action | artifact/evidence refs, redaction profile | `navigation_wrapper`, **sensitive** |

Sources: `Plans/UI_Command_Catalog.md:L8298-L8313` and `:L7970-L7982`; ids adopted verbatim from `Plans/Automated_Testing_System.md:L2231-L2237`.

## 5. Row anatomy

**`run_list` row.** Available metadata (all from `TestRunReceipt`, `Plans/Automated_Testing_System.md:L2221-L2229`): `test_run_id`, `adapter_id`, `test_kind`, `target_ref`, `started_at_utc`, `ended_at_utc`, `status`, `passed_count`, `failed_count`, `skipped_count`, `error_count`, `log_artifact_refs[]`, `visual_artifact_refs[]`, `coverage_ref?`, `failure_refs[]`, `schema_version`.

Worst realistic identity strings:
- `cargo test — import worker suite` = **32 chars**
- `containerized-host/compose:web-e2e` = **34 chars** (adapter + scenario target)
- `puppet-master-rs::executor::preflight_revalidation_guard` = **56 chars** (single-test target_ref)
- `tr_01J9ZQ8K3M7XA4B2C6D8E0F1G2` = **29 chars** (ULID run id — never a primary label; ID lives in tooltip/receipt)

At 240px with a 24px status dot and a 24px hit target for the row action, ~150px of text remain ≈ 20-22 chars at 13px. **Middle-elide `target_ref`, never head-truncate** — the discriminating token is the trailing segment (`preflight_revalidation_guard`, not `puppet-master-rs`). Two-line row at 380px: line 1 = target, line 2 = adapter + counts + relative time.

**Status vocabulary (exact, do not paraphrase):** `queued`, `running`, `passed`, `failed`, `cancelled`, `blocked`, `inconclusive`. `blocked` and `inconclusive` are distinct from `failed` and must not collapse into a red chip — `blocked` routes to an authority/permission action, `inconclusive` routes to the receipt.

**`failure_list` row.** `assertion failed: left == right at src/import/normalize.rs:412` = **62 chars**. One line at 240px is impossible; render failure name only (`import::normalize_units` = **23 chars**) with the assertion text on expand. Required row action: `cmd.testing.open_failure`.

**`artifact_preview` row.** `runtime_artifact.screenshot:art_01J9ZQ8K3M7X` = **44 chars**. Show artifact kind icon + short label; the ref is tooltip-only.

## 6. Redaction and blocked states — hard gate

Direct quote, `Plans/Automated_Testing_System.md:L83-L98`:

> "Screenshots, videos, logs, console output, network traces, and artifact previews apply secret and sensitive-data redaction before display or persistence. Redaction failures block display/persistence until resolved or explicitly authorized by the owning policy; they do not silently downgrade evidence quality."

Reinforced in ATS-009 (`Plans/Automated_Testing_System.md:L648-L726`): "Visible testing, screenshots, video, logs, console, network traces, and artifacts apply secret and sensitive-data redaction before display or persistence," with the negative constraint "Do not expose credentials, tokens, personal data, or protected project content through visible testing."

Design consequences:
1. `artifact_preview` has **three** states, not two: `redacted_ok` (render), `redaction_pending` (render placeholder + spinner, never the raw asset), `redaction_failed` (render nothing; `redaction_notice` occupies the region with the blocking reason and an authorize route).
2. `redaction_notice` is **not dismissible** while `redaction_failed` holds. Dismissal implies the user saw the artifact.
3. No optimistic render. There is no "show blurred and sharpen later" affordance — that is a silent downgrade.
4. The authorize path is an explicit owning-policy action, not a checkbox in this panel; the panel routes to it via `cmd.testing.session.redaction.inspect`.

**Blocked states.** `blocked-needs-authority` (has an authority request route), `prohibited-by-policy` (terminal for this project; the only route is Settings), `unavailable` (adapter/probe missing; route is adapter config). All three carry a reason label and, per the wider GUI blocked contract, `blocked_reason_code` + `allowed_action_ids[]` (`Plans/FinalGUISpec.md:L3984-L4005`). A `blocked` run status is a receipt outcome and must show its blocker payload, not a generic failure chip.

## 7. Minimum viable 240px surface

Ruthless cut, top to bottom, one column, 24px minimum hit targets (`Plans/FinalGUISpec.md:L2144-L2147`):

1. **Header, 28px** — panel label + enablement dot. Disabled state replaces everything below with a single reason line and one action (`Configure adapter` / `Request authority` / `Open Settings`). Do not show an empty run list on a disabled panel.
2. **Run button, 32px full width** — disabled with the precondition reason as its tooltip and accessible label.
3. **`run_list`, up to 5 rows @ 32px** — dot + middle-elided target + relative time. Tap selects.
4. **`active_run_detail`, 2 lines** — status chip + `214 / 1 / 3 / 0` counts strip; a 2-button row (contextual pair only: Watch+Cancel while live, Receipt+Export when terminal — never four buttons at 240px).
5. **`failure_list`, 1 collapsed row** — "1 failure" badge; tap expands over the list.
6. **`artifact_preview`, 1 row** — count + kind icons; tap opens a sheet.
7. **`redaction_notice`** — appears only when non-clean, and when it appears it takes priority position directly above `artifact_preview`.

Everything else — capability policy grid, visible-session controls, containerized-host fields, coverage — goes to an overflow menu and a full-height sheet. Per §12.2, at 240px "all extras behind overflow menu" is the sanctioned pattern (`Plans/FinalGUISpec.md:L2081-L2090`).

## 8. The 3 hardest layout constraints

1. **Five mandated regions in a 240px column that also has to stay scannable.** The region names are contractual, so none can be dropped — but five stacked sections at 240px means each gets ~80-100px before scrolling. Resolution: regions 3-5 collapse to single summary rows that expand in place; only `run_list` and `active_run_detail` are ever simultaneously expanded.
2. **`target_ref` strings run to 56+ chars against ~150px of usable text.** No wrapping strategy saves it; middle-elision plus a second metadata line at 380px+ is the only honest answer, and the full string must be reachable (tooltip at desktop, long-press sheet elsewhere).
3. **`redaction_notice` must pre-empt `artifact_preview` without reflowing the whole panel.** It appears asynchronously, after the run is already selected and the preview region has claimed space. Reserve the preview region's height for the notice so the arrival of a redaction failure does not push `failure_list` off-screen mid-read.

## 9. Open questions / spec gaps

- **The 6 capability/session commands are wired to Settings, not this panel.** `Plans/Wiring_Matrix.production.json` places `cmd.testing.capability_policy.set`, `.visibility_policy.set`, `.session.*` under `Settings > Testing Capability` and `Visible Testing Session`. But `Plans/Automated_Testing_System.md:L83-L98` requires the *production GUI* to expose capability rows and visible-session projections, and this panel is the natural host. **Decision needed:** does the Testing panel get read-only projections of Settings-owned policy (my recommendation, mirrors the F3-451 "display and wires" boundary), or does it get duplicate write controls? Read-only projection + a route to Settings resolves it without new wiring rows.
- **`failure_refs[]` has no defined entry shape.** `TestRunReceipt` names the array but nothing defines what a failure entry contains — no name, message, file, line, or stack fields anywhere in `Plans/Automated_Testing_System.md`. `failure_list` row anatomy above is inferred. Needs an owner decision.
- **No `test_run_list` projection contract.** Nothing specifies ordering, page size, retention, or which project/run scope the list covers. Assumed: reverse-chronological by `started_at_utc`, project-scoped.
- **Per-adapter enablement is implied but not stated.** `testing.runtime_enabled_for_adapter` carries `adapter_id`, so enablement is per-adapter; the panel-level "runtime-disabled" language reads as global. Confirm the mixed state is legal and design for it.
- **No `cmd.testing.rerun_failed`** despite `cmd.actions.rerun_failed` existing generically in the wiring matrix. Worth proposing if the panel wants a failure-scoped rerun.
- **Redaction pending has no state token.** Spec gives clean and failed; a pending/in-progress state is operationally certain but unnamed. Proposed vocabulary: `redaction_clean | redaction_pending | redaction_failed`.
