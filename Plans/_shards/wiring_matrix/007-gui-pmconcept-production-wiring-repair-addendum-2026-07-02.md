# Shard 007: GUI / PMConcept production wiring repair addendum (2026-07-02)

Source: `Plans/Wiring_Matrix.md`

Source lines: L144-L199

Source SHA256: `14eb404da1cb1d6e601b5eb4def272d087cae91eeddff0e0ad5803b613004e2a`

---

## GUI / PMConcept production wiring repair addendum (2026-07-02)

This addendum closes the GUI wiring defects from the PMConcept readiness report. It does not create WorkNodes, NodeSeeds, executable queues, implementation code, runtime dispatch, generated governance artifacts, or a governance seal.

### Production JSON artifact

`Plans/Wiring_Matrix.production.json` is the production wiring-matrix JSON artifact for the current GUI/PMConcept repair packet and validates against `Plans/Wiring_Matrix.schema.json`. It contains one map entry per schema-valid production command/control binding, keyed by `ui_element_id`, with `ui_command_id`, `handler_location`, expected event types, acceptance checks, and required evidence. `Plans/Wiring_Matrix.production.exclusions.json` records command-family roots, parser false positives, glob tokens, invalid historical aliases, and compatibility-only namespace roots that must not count as production coverage.

The schema command pattern now allows underscores in every command segment so accepted namespaces such as `cmd.source_control.*`, `cmd.prd_builder.*`, `cmd.planning_wizard.*`, and `cmd.plan_compile.*` can be represented without inventing alternate command names.

### PMConcept control reconciliation artifact

`Plans/PMConcept_Control_Reconciliation.json` inventories PMConcept controls and dispositions. The current generated summary is:

| Metric | Count |
|---|---:|
| Control-like nodes inventoried | 1284 |
| Inline-handler controls | 339 |
| Controls containing `cmd.*` tokens | 71 |
| Controls with accessibility gaps | 267 |
| Controls with local/demo/mock markers | 64 |
| Production wiring required | 44 |
| Production-intended controls missing a command | 0 |
| Concept-only controls pending owner adjudication before promotion | 1175 |
| Retired or re-scoped non-launch controls | 1 |

Controls marked `concept_fixture_only` are source-lineage fixtures only and cannot satisfy acceptance evidence. Controls marked `concept_only_needs_owner_adjudication` remain source-lineage concept controls until an owner doc promotes them and adds command, state selector, disabled reason, handler, receipt/event effect, and test evidence. Controls marked `retired_or_rescoped_non_launch_authority` include stale `START`, `BUILD`, and `Approve & Continue` launch semantics.

### Approve And Build wiring rule

The production `Approve And Build` control maps to `cmd.planning_wizard.approve_and_build` and the high-risk row `planning.wizard.final_review.approve_and_build` in `Plans/Wiring_Matrix.production.json`. Acceptance evidence must prove:

- final-review CAS fields match the displayed ApprovedPlanPack, PlanningRun revision, topic map version, project-context hash, PlanUnit index hash, acceptance-unit index hash, testing policy hash, and final audit/closure hash;
- stale CAS inputs fail closed with bounded revalidation or final-review refresh;
- success atomically writes `approval_cas_receipt`, `PlanApproved`, and `PlanCompileRun_created_or_bound`;
- duplicate idempotency key plus identical CAS inputs returns the same `PlanCompileRun`;
- Orchestrator Plan Compile opens as pending-launch or durable-run projection, not as a tab-switch-only success;
- no ordinary `START`, `BUILD`, or `Approve & Continue` control can create a second build launch from the same approval inputs.

### Visible testing wiring rule

The production matrix rows for `cmd.testing.capability_policy.set`, `cmd.testing.visibility_policy.set`, `cmd.testing.session.open`, `cmd.testing.session.watch`, `cmd.testing.session.background`, and `cmd.testing.session.redaction.inspect` are required for visible testing readiness. Evidence must cover global and per-project `Auto` / `On` / `Off`, inheritance/effective-policy projection, `show_when_possible`, `Open` / `Watch`, browser navigation/click/form/assertion/screenshot/console/network streams, native preview/simulator/emulator/device streams, redaction-before-display/persist, disabled reasons, and background continuation.

### Accessibility evidence rule

Every retained production control in PMConcept or Final GUI wiring evidence must prove:

`ui_element_id -> accessible_name -> role -> keyboard_contract -> state_attributes -> disabled_reason_projection -> ui_command_id -> handler_location -> expected_event_types -> evidence_required`

The acceptance bar is zero unnamed actionable controls, zero retained custom clickable elements without keyboard parity, correct tab/menu/disclosure state semantics, visible focus handling, and disabled reason projection for every disabled production action.

ContractRef: SchemaID:Wiring_Matrix.schema.json, ContractName:Plans/Contracts_V0.md#EventRecord

---

<a id="section-4"></a>
