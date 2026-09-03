# Shard 029: Packet-owner command and Touch Closure wiring addendum - 2026-08-31

Source: `Plans/Wiring_Matrix.md`

Source lines: L3964-L4037

Source SHA256: `d108a46be70fbc2c9a91dc216f291f8238ed1201412f6582a4ad93a1ccad03f6`

---

## Packet-owner command and Touch Closure wiring addendum - 2026-08-31

The Settings/Onboarding/Doctor/Server/WAN/Backup/Browser/Capture/SCM/Forge/plugin/performance wave uses `Plans/touch_closure.json` as its bidirectional coverage register and `Plans/Wiring_Matrix.production.json` as the production-intent row set. Each canonical command has one catalog entry and one sole handler target, while every GUI-required command has every intended visible consumer enumerated in reverse. Typed local UI actions use the same availability, disabled-reason, accessibility, return-route, and evidence discipline but do not receive fictitious domain handlers or EventRecords.

Current Product Onboarding uses exactly thirteen typed local actions: `ui.onboarding.start`, `ui.onboarding.next`, `ui.onboarding.back`, `ui.onboarding.close`, `ui.onboarding.skip`, `ui.onboarding.defer`, `ui.onboarding.open_details`, `ui.onboarding.more_ways`, `ui.onboarding.choose_simple_path`, `ui.onboarding.open_owner_flow`, `ui.onboarding.run_automatic_preparation`, `ui.onboarding.choose_first_project`, and `ui.onboarding.finish`. These are not semantic commands or production wiring rows. The main path is exactly `welcome` -> `simple_path` -> `first_project` -> `source_control_setup` -> `server_storage_client` -> `remote_access_setup` -> `review_setup_plan` -> `automatic_preparation` -> `ready`; connect existing is exactly `welcome` -> `simple_path` -> `remote_access_setup` -> `review_setup_plan` -> `automatic_preparation` -> `ready`. Every pre-Review choice is a local draft transition or cached read. No network probe, owner route, or mutation may begin until the person confirms the current Review Setup Plan revision; Automatic Preparation then dispatches the approved-plan hash once and observes current owner projections.

The actions use `pm.product_onboarding.action_request.v1` -> `pm.product_onboarding.action_result.v1`, including closed applied/disabled/rejected results and zero-dispatch/zero-write disabled or rejected behavior. Each request carries closed normalized secret-free `local_context`; its only fields are `intent`, optional `review_confirmation`, `scope`, `branch_kind`, `branch_step`, `selection_ref`, `target_ref`, `owner_operation_ref`, `owner_branch_ref`, `expanded`, `start_tour`, and `recovery_condition`, so arbitrary/raw payloads and secret-bearing values fail closed. Setup/project disclosure and branch-local `more_ways` updates use different intent/scope/choice/branch combinations. Whole-session Skip yields `session_skipped`/skipped status, while Project/Remote-Access optional-scope Skip yields `optional_scope_skipped` and leaves the session active. Defer durably preserves the exact path, stage, draft, queued/reviewed revisions, Review confirmation, approved-plan hash, Automatic Preparation currentness, independent backend/forge/Server/Storage/Client choices, active branch, bounded history, continuation generation, initiating Client, and return focus; Close is a non-completion dismissal; and Details is an ephemeral same-stage disclosure with no persistence or owner command. A selected owner route uses that owner's existing canonical command and sole handler; no generic Onboarding wrapper handler is created. The predecessor `cmd.onboarding.first_run.open`, `cmd.onboarding.provider_setup.open`, `cmd.onboarding.provider_setup.use_provider`, `cmd.onboarding.skip_to_planning_wizard`, `cmd.onboarding.free_models.review`, `cmd.onboarding.free_models.defer`, `cmd.onboarding.review_setup`, `cmd.onboarding.open_planning_wizard`, `cmd.onboarding.free_models.refresh`, `cmd.onboarding.free_models.retry`, and `cmd.onboarding.free_models.setup` spellings are source-lineage-only: none is a production row or compatibility alias. The separate packet candidates `cmd.onboarding.back`, `cmd.onboarding.cancel`, `cmd.onboarding.continue`, `cmd.onboarding.defer`, `cmd.onboarding.finish`, `cmd.onboarding.open_details`, `cmd.onboarding.resume`, and `cmd.onboarding.skip` are source-lineage candidate tokens only and are rejected as commands, aliases, and handlers because typed local `ui.onboarding.*` actions own their semantics.

Current Guided Tour uses exactly ten typed local actions: `ui.guided_tour.start`, `ui.guided_tour.next`, `ui.guided_tour.back`, `ui.guided_tour.pause`, `ui.guided_tour.resume`, `ui.guided_tour.skip`, `ui.guided_tour.focus_route`, `ui.guided_tour.toggle_eli5`, `ui.guided_tour.finish`, and `ui.guided_tour.replay`. Its exact scene order is `usage` -> `planning_wizard` -> `chat_teacher`. The Tour observes existing `cmd.widget.remove`/`cmd.widget.add` results for the Usage Watch moment, advances Try only from the exact mounted Usage-card Options control, advances Planning only from the exact mounted intent-chip result, and uses existing `cmd.panel.switch`/`cmd.panel.redock` behavior to finish with Assistant Chat at the far right. `cmd.panel.undock`, `cmd.widget.configure`, `cmd.widget.move`, `cmd.widget.resize`, `cmd.workspace_layout.move_surface`, and `cmd.workspace_layout.resize_surface` remain separately owned Home/Widget behaviors and are not Tour checkpoints. `ui.guided_tour.restore_layout`, `ui.guided_tour.keep_layout`, and `ui.guided_tour.toggle_reduced_motion` are retired current actions; Skip performs exact restoration, Finish keeps Chat at the far right, and Reduced Motion remains Settings-owned.

The retired Settings spellings `cmd.settings.open_notifications`, `cmd.settings.category.reset`, and `cmd.settings.suggestion.dismiss` are likewise source-lineage-only and are neither production rows nor compatibility aliases. Exact Settings navigation uses `cmd.settings.open`; reset and dismissal compose `cmd.settings.transaction.preview` plus `cmd.settings.transaction.apply`.

Rows whose Rust/native dispatcher, owner handler, persistence adapter, or runtime receipt does not exist remain `planned`/`partial` with explicit evidence requirements. PMConcept7 action logs, fixture adapters, schemas, and browser verifiers are concept/static evidence only. Event candidates stay `receipt_only_no_eventrecord_pending_event_authority` unless their individual family is admitted into `Plans/event_family_registry.json` with a closed payload contract.

ContractRef: ContractName:Plans/touch_closure.json, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Commands_System.md, ContractName:Plans/event_family_registry.json

### WM-046 - Bidirectional Touch Closure and production-intent wiring

```yaml
plan_unit_id: WM-046
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  Every touched canonical command has exactly one catalog identity, one request/result/error/availability/permission
  contract, one sole owner-handler route, one production-intent wiring row, and reverse coverage to every intended GUI
  consumer. Every touched local UI action has a typed action contract, accessibility and disabled behavior, exact return,
  and reverse consumer coverage without a false domain handler. The hash-bound SSYS-023 packet disposition registry is
  transitive input: canonical replacements require rows, typed local actions require rows, and retired or rejected packet
  spellings remain non-actionable. Missing native dispatch, handler, persistence, event admission, or runtime receipt
  remains explicitly planned or partial; schemas, fixtures, PMConcept7 simulations, and browser evidence cannot satisfy
  those dimensions.
gui_related: true
gui_classification_reason: Connects every touched visible control and command to handlers, consumers, responses, and evidence.
split_recommended: false
depends_on: [WM-045, DR-040, UIW-013, SSYS-023]
unblocks: []
acceptance_criteria:
  - Commands, handlers, and GUI consumers are each complete in both directions with no duplicate primary ID or owner.
  - Typed local actions carry availability, disabled reason, accessibility, and exact-return evidence without fictitious runtime command rows.
  - "Product Onboarding exposes exactly the thirteen `ui.onboarding.*` typed local actions and routes owner work through existing owner commands/handlers; no `cmd.onboarding.*` production row, compatibility alias, generic handler, or EventRecord is admitted."
  - "Product Onboarding follows the exact nine-stage main and six-stage connect-existing paths; pre-Review work is local draft/cached read only, current Review confirmation fences every owner dispatch, and Automatic Preparation observes the once-dispatched approved plan with exact revision/hash/currentness fields."
  - "Every Product Onboarding request carries the closed normalized secret-free local_context; more_ways and skip variants are exact and non-ambiguous, and arbitrary/raw/secret-bearing context is rejected."
  - "Guided Tour exposes exactly ten typed local actions and exactly three scenes in Usage/Planning Wizard/Assistant Chat order; its only Tour-observed owner commands are panel switch/redock and widget remove/add, while unrelated Home/Widget commands retain separate consumers."
  - "The packet candidates `cmd.onboarding.back`, `cmd.onboarding.cancel`, `cmd.onboarding.continue`, `cmd.onboarding.defer`, `cmd.onboarding.finish`, `cmd.onboarding.open_details`, `cmd.onboarding.resume`, and `cmd.onboarding.skip` are source-lineage only and rejected as commands, aliases, and handlers."
  - "`cmd.settings.open_notifications`, `cmd.settings.category.reset`, and `cmd.settings.suggestion.dismiss` remain source-lineage-only and appear as neither production rows nor compatibility aliases."
  - "The exact seven local actions `settings.search.focus`, `settings.search.result.activate`, `settings.category.select`, `settings.subcategory.select`, `settings.setting.focus`, `settings.scope.details.open`, and `settings.provider.installation.select` have Touch Closure rows and no domain handlers."
  - "The named projections `settings.manager.teacher-help`, `settings.manager.project-search-index`, and `settings.manager.dry-method` have presentation rows, while their four owner commands retain their existing sole owner routes and reverse consumers."
  - The 80-token Settings registry retains the exact 41/7/1/31 disposition partition, and no replacement spelling, retired bakeoff token, or rejected token becomes a command or alias.
  - Orphan controls, commands without handlers, handlers without commands, missing reverse consumers, duplicate IDs, stale PlanRefs, and incomplete Touch Closure rows fail gates.
  - Event effects remain receipt-only unless individually admitted by Event Authority.
  - Concept, static, browser, native-runtime, visual, motion, accessibility, performance, and readiness evidence classes remain separate.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-touch-closure-verify.py
  - python3 scripts/pm-plan-index.py validate
risk_class: one_way_or_false_production_wiring
reasoning_tier: high
context_scope: packet_owner_touch_closure_wiring
implementation_surfaces: [Plans/Wiring_Matrix.md, Plans/Wiring_Matrix.production.json, Plans/Wiring_Matrix.production.exclusions.json, Plans/touch_closure.json]
node_compile_hint: {mode: touch_closure_wiring, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - approved Parallel Canon, Settings, and PMConcept7 Integration Plan
  - scratchpad/approval-gated-touch-closure-packet-custody-20260831-001/central-contract-map/central-contract-map.json
  - scratchpad/pm-integration-20260831/audits/settings-owner-closure/settings-owner-central-delta-proposal.json
preserved_exact_tokens: [planned, partial, receipt_only_no_eventrecord_pending_event_authority, "ui.onboarding.*", cmd.settings.open, cmd.settings.transaction.preview, cmd.settings.transaction.apply]
negative_constraints:
  - Do not claim production wiring from PMConcept7 or browser evidence.
  - Do not assign two handlers or owners to one primary command.
  - Do not admit an EventRecord family through a wiring row.
  - Do not omit reverse GUI coverage for a GUI-required command.
  - "Do not normalize a predecessor `cmd.onboarding.*` or retired Settings spelling into a production row or compatibility alias."
owner_hints: [Plans/Wiring_Matrix.md, Plans/UI_Command_Catalog.md, Plans/Commands_System.md]
```
