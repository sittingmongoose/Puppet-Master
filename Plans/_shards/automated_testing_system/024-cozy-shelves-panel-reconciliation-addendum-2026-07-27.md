# Shard 024: Cozy Shelves Panel Reconciliation Addendum - 2026-07-27

Source: `Plans/Automated_Testing_System.md`

Source lines: L2676-L2988

Source SHA256: `f80d0273a215fb466f82cbcb35b83864cec554a22ff778e30c8c7d49d16822cb`

---

## Cozy Shelves Panel Reconciliation Addendum - 2026-07-27

This addendum closes the Testing-surface spec gaps exposed by the winning Cozy Shelves left-rail concept (`Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html` and `c2-cozy-shelves-files.html`, source lineage only; no concept HTML, CSS, or class names are copied into spec). It follows the FABLE addendum pattern of this document: prose intent, then new PlanUnits. No existing PlanUnit block, preserved exact token, canonical text, or retired bridge is edited; supersession is expressed only through the new units' explicit amendment notes. Four things are adjudicated here: (1) the two `cmd.testing.*` command families are reconciled with the UI Command Catalog's Cozy Shelves addendum (UCC-134) - the run-scoped family is canon for runs, the session-scoped family stays a distinct live canon, and the newly minted `cmd.testing.quarantine` / `cmd.testing.quarantine.release` rows are registered as consumed here; (2) the three divergent TestRunReceipt field inventories (ATS-004, ATS-019 host fields, FABLE file format) are merged into one canonical field table of which all three prior inventories become views; (3) the receipt `status` enum gains `skipped` as a first-class distinct status that is never counted as pass, and `blocked` is adjudicated non-terminal with explicit watch/cancel gating; (4) the Testing rail panel gets a presentation contract binding the five FABLE regions to the shared unified expander row contract (owned outside this document by the GUI spec surface; referenced, never re-owned here) and restating the receipt-honesty invariants. The implementation base is the c2 concept files patched in place, and the rail width envelope is 240px minimum / 480px maximum / 280px default with 220px as a test-only adversarial width (user decision 2026-07-27). This addendum does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

### Merged TestRunReceipt field schema

The canonical TestRunReceipt is the union below. The ATS-004 inventory, the ATS-019 containerized-host inventory, and the FABLE file format (Test Adapter Interface And TestRunReceipt, 2026-07-08) are henceforth three views of this one schema: none is edited, none is retired, and no view may be cited as the complete schema. `visual_evidence_refs[]` is the canonical spelling; `visual_artifact_refs[]` is the recorded FABLE-file-format compatibility spelling of the same field. `receipt_id` (receipt identity) and `test_run_id` (run identity) are distinct fields and both are required.

| Field | Presence | Source view | Notes |
|---|---|---|---|
| `test_run_id` | required | FABLE file format | run identity |
| `receipt_id` | required | ATS-004 | receipt identity, distinct from `test_run_id` |
| `adapter_id` | required | FABLE file format | |
| `test_kind` | required | FABLE file format | |
| `target_ref` | required | FABLE file format | |
| `started_at_utc` | required | FABLE file format | |
| `ended_at_utc` | required, null until terminal | FABLE file format | null while `queued`, `running`, or `blocked` |
| `status` | required | FABLE file format | enum per ATS-027 below |
| `passed_count` / `failed_count` / `skipped_count` / `error_count` | required | FABLE file format | on `cancelled` these carry the partial counts observed before cancellation |
| `log_artifact_refs[]` | required, may be empty | FABLE file format | |
| `visual_evidence_refs[]` | required, may be empty | ATS-004 / ATS-019 | `visual_artifact_refs[]` is the FABLE compatibility spelling |
| `coverage_ref` | optional | FABLE file format | |
| `failure_refs[]` | required, may be empty | FABLE file format | |
| `schema_version` | required | FABLE file format | |
| `test_strategy_ref` | required | ATS-004 | |
| `test_case_refs` | required | ATS-004 | |
| `generated_test_ids` / `reused_test_ids` | required, may be empty | ATS-004 | |
| `verification_command` | required | ATS-004 | |
| `expected_artifacts` | required | ATS-004 | |
| `evidence_refs` | required | ATS-004 | |
| `flake_policy` | required | ATS-004 | |
| `test_gap_policy` | required | ATS-004 | |
| `host_capability_ref` | required when containerized host used | ATS-019 | |
| `host_profile_id` | required when containerized host used | ATS-019 | or host requirement shape |
| `host_instance_ref` or `host_instance_id` | required when containerized host used | ATS-019 | |
| `host_assignment_ref` or `host_assignment_id` | required when containerized host used | ATS-019 | |
| `runtime_family` | required when containerized host used | ATS-019 | |
| `runtime_context_ref` | required when containerized host used | ATS-019 | |
| `compose_scenario_ref` | optional | ATS-019 | |
| image/build refs | required when containerized host used | ATS-019 | |
| port/access URL refs | required when containerized host used | ATS-019 | |
| preflight receipt ref | required when containerized host used | ATS-019 | |
| launch receipt ref | required when containerized host used | ATS-019 | |
| harness probe receipt ref | required when containerized host used | ATS-019 | |
| cleanup receipt ref | required when containerized host used | ATS-019 | also the artifact-disposition carrier for `cancelled` runs |
| retain-on-failure state | required when containerized host used | ATS-019 | |
| blocker payload | required when blocked | ATS-019 | `blocked_reason_code` plus ordered `allowed_action_ids[]` |

### ATS-025 - Testing Command Family Adjudication And Quarantine Consumption

```yaml
plan_unit_id: ATS-025
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  The run-scoped family cmd.testing.run, cmd.testing.watch_run, cmd.testing.cancel_run, cmd.testing.open_receipt,
  cmd.testing.open_failure, cmd.testing.export_bundle, and cmd.testing.open_panel is the canonical command surface
  for test runs. The session-scoped family cmd.testing.session.open, cmd.testing.session.watch,
  cmd.testing.session.background, and cmd.testing.session.redaction.inspect is a distinct live canon for visible
  test sessions per the 2026-07-02 addendum. Both families stay live, neither aliases the other, and watch_run
  versus session.watch is a scope split, not a duplication - this mirrors and consumes UI_Command_Catalog UCC-134
  rather than re-adjudicating it. cmd.testing.quarantine and cmd.testing.quarantine.release (minted by UCC-134,
  two-step confirmation) are registered here as consumed commands: quarantine is a state mutation over test
  identity, not a run action; it produces its own receipt, changes counting only through the flaky counting
  policy of ATS-028, never deletes or edits any TestRunReceipt, and releases only through its paired command.
  Rerun and rerun-failed-only are affordances over cmd.testing.run carrying rerun_of_receipt_ref and failed_only
  selection arguments; no new command id is minted by this document.
gui_related: true
gui_classification_reason: Adjudicates the user-visible Testing command families and quarantine controls consumed by the Testing rail panel.
depends_on: [ATS-009, ATS-010, UCC-134]
unblocks: [ATS-028]
acceptance_criteria:
  - No alias metadata links the run-scoped and session-scoped testing families, and both remain live.
  - cmd.testing.quarantine and cmd.testing.quarantine.release produce separate receipts, mutate test identity state only, and never delete or mutate TestRunReceipt records.
  - Rerun and rerun-failed-only dispatch through cmd.testing.run with rerun_of_receipt_ref and failed_only arguments rather than new command ids.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: testing_command_family_drift
reasoning_tier: standard
context_scope: cozy_shelves_testing_command_adjudication
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: cozy_shelves_testing_command_adjudication
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)"
  - "Plans/UI_Command_Catalog.md (UCC-134, Cozy Shelves Panel Reconciliation Addendum - 2026-07-27)"
  - "Plans/Automated_Testing_System.md (GUI visible testing repair addendum 2026-07-02; FABLE GUI Result Surfacing 2026-07-08)"
preserved_exact_tokens:
  - "cmd.testing.run"
  - "cmd.testing.watch_run"
  - "cmd.testing.session.watch"
  - "cmd.testing.quarantine"
  - "cmd.testing.quarantine.release"
  - "rerun_of_receipt_ref"
  - "failed_only"
negative_constraints:
  - Do not alias run-scoped testing commands to session-scoped ones or collapse the two families.
  - Do not let quarantine or release delete, edit, or reinterpret any existing TestRunReceipt.
  - Do not mint new cmd.* ids in this document; command minting authority stays with UI_Command_Catalog.md.
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/UI_Command_Catalog.md
```

### ATS-026 - Merged Canonical TestRunReceipt Field Schema

```yaml
plan_unit_id: ATS-026
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  The merged TestRunReceipt field table in this addendum is the one canonical TestRunReceipt schema: the union of
  the ATS-004 inventory (receipt_id, test_strategy_ref, test_case_refs, generated_test_ids, reused_test_ids,
  verification_command, expected_artifacts, evidence_refs, visual_evidence_refs, flake_policy, test_gap_policy),
  the ATS-019 containerized-host inventory, and the FABLE file format (test_run_id, adapter_id, test_kind,
  target_ref, started_at_utc, ended_at_utc, status, counts, log_artifact_refs, visual_artifact_refs, coverage_ref,
  failure_refs, schema_version). Amendment note: this supersedes-by-extension the three prior inventories, which
  remain unedited and accurate as views of the merged schema; no prior inventory may be cited as complete.
  receipt_id and test_run_id are distinct required identities. visual_evidence_refs is canonical and
  visual_artifact_refs is its recorded FABLE compatibility spelling. Host fields are required exactly when a
  containerized host is used. A cancelled receipt carries the partial passed/failed/skipped/error counts observed
  before cancellation plus the artifact disposition through the cleanup/retention receipt ref; cancellation
  deletes no receipts and no artifacts outside recorded retention policy.
gui_related: false
gui_classification_reason: This unit owns the receipt data schema; presentation of the receipt belongs to ATS-028.
depends_on: [ATS-004, ATS-019]
unblocks: [ATS-027, ATS-028]
acceptance_criteria:
  - Schema fixtures validate the full merged field table, including presence rules (required, required-when-containerized, required-when-blocked, null-until-terminal) for every field.
  - A receipt satisfying only one prior inventory fails validation whenever the run context requires fields from another view.
  - Cancelled receipts prove partial counts plus artifact disposition, and prove that no receipt or retained artifact was deleted by cancellation.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future merged TestRunReceipt schema fixtures
risk_class: test_run_receipt_schema_divergence
reasoning_tier: high
context_scope: cozy_shelves_testrunreceipt_merge
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/Contracts_V0.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: cozy_shelves_testrunreceipt_merged_schema
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Automated_Testing_System.md (ATS-004; ATS-019; FABLE Test Adapter Interface And TestRunReceipt 2026-07-08)"
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)"
preserved_exact_tokens:
  - "TestRunReceipt"
  - "test_run_id"
  - "receipt_id"
  - "test_strategy_ref"
  - "flake_policy"
  - "test_gap_policy"
  - "host_capability_ref"
  - "visual_evidence_refs"
  - "schema_version"
negative_constraints:
  - Do not edit, retire, or fork the three prior inventories; they remain views of the merged schema.
  - Do not allow any single prior view to be cited as the complete TestRunReceipt schema.
  - Do not let cancellation delete receipts or bypass recorded retention disposition.
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/Contracts_V0.md
```

### ATS-027 - TestRunReceipt Status Enum Skipped And Blocked Adjudication

```yaml
plan_unit_id: ATS-027
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  The TestRunReceipt status enum is queued, running, passed, failed, skipped, cancelled, blocked, and
  inconclusive. Amendment note: this supersedes-by-extension the FABLE 2026-07-08 status list by adding skipped
  as a first-class distinct status; the FABLE list is not edited. skipped is never counted as, rendered as, or
  aggregated into pass at any level - run, row, rollup, or gate - and a skipped run never satisfies a required
  oracle, matching the existing fail-closed posture. Terminal statuses are exactly passed, failed, skipped,
  cancelled, and inconclusive. blocked is non-terminal: a blocked run keeps watch enabled (view-only), keeps
  cancel enabled subject to permission, does not enable open_receipt terminal affordances, carries the blocker
  payload (blocked_reason_code plus ordered allowed_action_ids[]), and resolves only by transitioning to running,
  cancelled, or another terminal status. blocked is never failed and never pass.
gui_related: true
gui_classification_reason: Status enum membership and terminality directly gate the watch, cancel, and open-receipt affordances users see.
depends_on: [ATS-026]
unblocks: [ATS-028]
acceptance_criteria:
  - Enum fixtures accept exactly the eight members and reject aliases, unknown members, and skipped-as-pass aggregation at every rollup level.
  - Blocked-run fixtures prove watch and cancel remain enabled, terminal-only affordances remain disabled, and the blocker payload carries blocked_reason_code plus ordered allowed_action_ids[].
  - Transition fixtures prove blocked resolves only to running, cancelled, or a terminal status, and that no terminal state transitions further.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future merged TestRunReceipt schema fixtures
risk_class: test_status_false_positive
reasoning_tier: high
context_scope: cozy_shelves_test_status_enum
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: cozy_shelves_test_status_adjudication
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Automated_Testing_System.md (FABLE Test Adapter Interface And TestRunReceipt 2026-07-08; Case L skipped/inconclusive posture)"
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)"
preserved_exact_tokens:
  - "skipped"
  - "blocked"
  - "inconclusive"
  - "blocked_reason_code"
  - "allowed_action_ids"
negative_constraints:
  - Do not count, render, or aggregate skipped as pass anywhere.
  - Do not treat blocked as terminal, as failed, or as pass.
  - Do not enable terminal-only affordances for a blocked run.
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/UI_Command_Catalog.md
```

### ATS-028 - Testing Rail Panel Presentation And Receipt Honesty Contract

```yaml
plan_unit_id: ATS-028
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  The Testing rail panel renders the regions run_list, active_run_detail, failure_list, artifact_preview, and
  redaction_notice inside the rail width envelope of 240px minimum, 480px maximum, 280px default, with 220px as a
  test-only adversarial width (user decision 2026-07-27). Every run row and failure row binds to the shared
  unified expander row contract owned outside this document: collapsed by default, header as a single accessible
  button with aria-expanded, body slot order kv-facts then status-detail then blocked-reason-detail then actions
  then overflow, roughly 200px body cap with internal scroll, blocked reasons always visible outside the
  collapsible body, and destructive actions routed through the shared confirm surface. All row and button states
  derive from TestRunReceipt.status per ATS-027; no panel-local run state is invented. Receipt-honesty
  invariants: receipts are marked stale/retired and visually dimmed when relevant files change after the run or
  when the receipt is rehydrated after app restart, and stale green is visually distinct from fresh green;
  errored (error_count from harness/compile/setup failure) renders distinct from failed and ranks above failed in
  rollups using severity order running > errored > failed > queued > passed > skipped; a run in which zero tests
  executed renders as a warning-state receipt and never green; completed_with_approved_verification_exception
  never renders as passed. Rerun and rerun-failed-only affordances appear on terminal receipts per ATS-025 and
  are hidden or disabled with reason while a run is queued, running, or blocked. Flaky tests show n/m attempt
  badges and a passed-with-flaky-count summary, governed by an explicit flaky counting-policy setting whose
  default never hides flakiness; repeated flaky results feed the cmd.testing.quarantine suggestion flow.
  Cancelled runs render their partial counts plus artifact disposition from the receipt. The panel is a
  projection/consumer only: it cites, never re-owns, the visible-session surface (ATS-009), artifact presentation
  (Runtime_Artifacts_Panel.md), and the expander contract owner.
gui_related: true
gui_classification_reason: This unit defines the visible Testing panel regions, expander binding, status rendering, and honesty invariants.
depends_on: [ATS-025, ATS-026, ATS-027, ATS-009]
unblocks: []
acceptance_criteria:
  - The five regions render within the 240/480/280 envelope without horizontal overflow, and the 220px adversarial fixture degrades without hiding blocked reasons or the redaction_notice.
  - Expander fixtures prove collapsed-by-default rows, single-button aria-expanded headers, the canonical body slot order, the body cap with internal scroll, and blocked reasons outside the collapsible body.
  - Honesty fixtures prove stale/retired dimming after file change and app restart, errored-distinct-from-failed rendering and severity ranking, zero-tests-ran warning never green, and approved-exception never rendered as passed.
  - Flaky fixtures prove n/m attempt badges, passed-with-flaky-count summaries, counting-policy setting effect, and the quarantine suggestion flow; cancelled fixtures prove partial counts plus artifact disposition rendering.
  - Rerun fixtures prove rerun and rerun-failed-only appear only on terminal receipts and carry disabled reasons otherwise.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
compatibility_only_notes:
  - "Slint compatibility: panel surfaces are opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, color math precomputed; glass appears only as pre-blurred wallpaper."
risk_class: testing_panel_receipt_honesty_gap
reasoning_tier: high
context_scope: cozy_shelves_testing_panel_presentation
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: cozy_shelves_testing_panel_presentation
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)"
  - "Plans/Automated_Testing_System.md (FABLE GUI Result Surfacing 2026-07-08; ATS-009 visible sessions and redaction)"
  - "user decision 2026-07-27 (rail width envelope 240/480/280, 220 test-only)"
preserved_exact_tokens:
  - "run_list"
  - "active_run_detail"
  - "failure_list"
  - "artifact_preview"
  - "redaction_notice"
  - "completed_with_approved_verification_exception"
  - "blocked_reason_code"
  - "allowed_action_ids"
negative_constraints:
  - Do not invent panel-local run states; all states derive from TestRunReceipt.status.
  - Do not render skipped, blocked, zero-tests-ran, stale, or approved-exception receipts as green or passed.
  - Do not re-own the visible-session surface, artifact presentation, or the unified expander contract; cite their owners.
  - Do not copy concept HTML, CSS, or class names into spec or production surfaces.
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Runtime_Artifacts_Panel.md
```
