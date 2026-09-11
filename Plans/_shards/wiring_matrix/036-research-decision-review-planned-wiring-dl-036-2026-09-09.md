# Shard 036: Research Decision Review Planned Wiring — DL-036 (2026-09-09)

Source: `Plans/Wiring_Matrix.md`

Source lines: L4421-L4670

Source SHA256: `b36a08a7a664cb36bb9af94bb1605ac4be2bf71e904509ec739453d0c6c3ae67`

---

## Research Decision Review Planned Wiring — DL-036 (2026-09-09)

These are owner/consumer planning obligations, with current runtime disposition explicit. The six questionnaire lifecycle commands documented by UCC-161 remain `candidate_not_registered` and have exact explained exclusions in the machine wiring inventory; this addendum creates no native handler or production row. Future admission removes the exact corresponding exclusion atomically with command/handler registration and complete production wiring. The existing artifact navigation production-intent row is reused without claiming its native implementation works.

| Surface / producer | Shared dispatch / owner | Typed effect and consumer | Required future verification |
|---|---|---|---|
| One current decision card: choice and conditional text | UCC-161 draft update / ACD-459 | CV-328 questionnaire profile draft only | No defaults, auto-submit or fifth response; reload preserves unsubmitted text. |
| Explicit four-response submission | UCC-161 submit / CV-328 and SP-258 | Host-derived user response; durable pending/approved/denied/denied_with_changes projection | Exact identity/revision, user source, required text, idempotent retry and storage-failure recovery; no unacknowledged advancement. |
| Ask a question round and research answer | Shared submit / top-level question owner | Same pending item and correlated inquiry/answer under ACD-459 | Questionnaire submission cannot consume decision; no duplicate research request on replay, no automatic next item. |
| Dismiss, resume, lifecycle expiry or unavailable state | Corresponding UCC-161 lifecycle command | Existing questionnaire outcome; SP-258 disposition unchanged | Same decision item and recorded round state restored; a fresh round follows CV-328. No fabricated decision or re-asking an answered item. |
| Open complete artifact before/during/after cards | Existing `cmd.nav.open_subject` and canonical `OpenSubject` | Complete packet read/navigation with no disposition mutation | Existing route/permission/currentness contract, explicit missing backing and no duplicate navigation registry row. |
| Persisted disposition → planning run | SP-258 → PWIZ-027 | Approved topics, excluded proposals, exact denied-with-changes amendments, pending inquiries | No silent approval of changed proposal; PWIZ-010 execution gate remains separate. |

Command receipts describe the actual dispatch/result; they are not user decisions or invented persisted event producers. Matching authoritative disposition state controls text statuses under F3-550. The fixture matrix covers duplicate delivery, stale packet/item revision, dismissal, interrupted research, late answer, reload, packet reorder/republication, persistence failure and unavailable artifact. General questionnaire multiple-item submission remains unchanged outside this specialized one-at-a-time decision profile.

### WM-053 — Research Decision Review

```yaml
plan_unit_id: WM-053
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: The DL-036 planning matrix maps shared questionnaire dispatch, same-item inquiry return, artifact
  navigation, durable dispositions and downstream planning, while retaining truthful candidate inventory and the
  separate build gate.
gui_related: true
gui_classification_reason: User-visible decision commands, response sequencing and truthful availability.
depends_on:
- UCC-161
- UIW-022
- CV-328
- SP-258
- PWIZ-027
- F3-550
unblocks: []
acceptance_criteria:
- All six table rows resolve to UCC-161, CV-328, SP-258, ACD-459, PWIZ-027 and F3-550 without a private answer
  store, new approve/deny command family or fabricated native producer.
- Six exact candidate exclusions match actual unregistered lifecycle IDs and are removed atomically on real admission;
  the existing artifact-open intent remains unexcluded.
- Native fixtures must prove required conditional text, authenticated user source, exact current identity, idempotent
  replay and durable acknowledgement before advancement.
- Ask/answer and lifecycle fixtures preserve the same pending decision; resume/republication restores terminal
  outcomes without re-asking.
- Full artifact access has no decision mutation and reports unavailable backing explicitly. Text status has no
  colored border bars/stripes or emoji glyphs.
- Dispositions feed planning topics/exclusions/exact amendments only; no command receipt, generic questionnaire
  submission or feature approval bypasses PWIZ-010.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py validate-wiring-matrix
- python3 scripts/pm-plans-verify.py run-gates
- Future native decision-review fixtures for response, identity, replay, persistence and dismissal.
risk_class: decision_authority_or_disposition_loss
reasoning_tier: high
context_scope: research_audit_decision_review
implementation_surfaces:
- Plans/Wiring_Matrix.md
- Plans/Wiring_Matrix.production.json
- Plans/Wiring_Matrix.production.exclusions.json
- Plans/assistant-chat-design.md
- Plans/Planning_Wizard.md
node_compile_hint:
  mode: accepted_planning_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-036
- Plans/ledgers/v2/pldg-20260909-001-research-decision-review/records/design_atoms.jsonl:atom-0005
- Plans/ledgers/v2/pldg-20260909-001-research-decision-review/source_shards/decision_authority_20260909.md
negative_constraints:
- No auto-submit, auto-approval or auto-denial on dismissal, expiry or navigation.
- No agent-originated answer or client-declared user identity as decision authority.
- No fifth response, new approve/deny command family or rewrite of general questionnaire enums.
- No duplicate inquiry, disposition or amendment on replay; no re-asking an answered item.
- No execution approval, runtime implementation, WorkNodes, NodeSeeds or fabricated production wiring.
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-036, ContractName:Plans/assistant-chat-design.md#ACD-459, ContractName:Plans/Contracts_V0.md#CV-328, ContractName:Plans/storage-plan.md#SP-258, ContractName:Plans/Planning_Wizard.md#PWIZ-027, ContractName:Plans/FinalGUISpec.md#F3-550, ContractName:Plans/UI_Command_Catalog.md#UCC-161, ContractName:Plans/UI_Wiring_Rules.md#UIW-022, ContractName:Plans/Wiring_Matrix.md#WM-053

### WM-054 - Browser Command Event Reverse Coverage

```yaml
plan_unit_id: WM-054
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  The fifteen existing Browser production-intent rows consume the exact command_event_bindings in the scoped
  admission manifest while retaining owner-DRY request/result/error/availability/permission refs, disabled reasons,
  selectors and future handler targets. This is static reverse coverage, not implemented dispatch.
gui_related: true
gui_classification_reason: Browser controls retain truthful disabled state and exact command/result/event wiring.
depends_on: [SMPFS-157, CV-330]
unblocks: []
acceptance_criteria:
  - All fifteen canonical commands are covered exactly once by the admission bindings and production-intent rows; no additional Browser or protected-auth command family is created.
  - Workspace/page transitions map to their actual owner events; page evaluate emits navigation/document-generation events only when those transitions occur.
  - Representation capture/delta/query map to their selected admitted transitions; program run/pause/resume/cancel consume the declared lifecycle events with compiler/segment/workspace subevents independently admitted.
  - Inspect is read-only/no-effect and receipt-only by contract; it does not require an invented inspect EventRecord.
  - Handler-unavailable, pre-dispatch rejection, acceptance-only and no-change results produce zero transition events and no fabricated successful outcome.
  - Every control remains handler_unavailable until exact native handler and effect proof exists; a selector, catalog row, schema, receipt or event registration is not runtime or UI wiring proof.
validation_surfaces: [python3 scripts/pm-browser-event-admission.py, python3 scripts/pm-plans-verify.py validate-wiring-matrix, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json, future native Browser disabled-state and effect-event wiring fixtures]
risk_class: browser_command_event_reverse_coverage_or_false_dispatch
reasoning_tier: high
context_scope: browser_command_event_wiring
implementation_surfaces: [Plans/Wiring_Matrix.md, Plans/Wiring_Matrix.production.json, Plans/browser_event_admission.json, Plans/touch_closure.json]
node_compile_hint: {mode: static_wiring_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:packet:PKT-04/04_COMMAND_EVENT_WIRING_REGISTER.md, USER-PACKET-GAP-CLOSURE-20260910]
negative_constraints: [No native handler or producer proof from production-intent rows., No new Browser inspect event or protected-auth automation route., No availability lift or false success.]
```

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-166, ContractName:Plans/Contracts_V0.md#CV-330, ContractName:Plans/browser_event_admission.json, ContractName:Plans/Wiring_Matrix.production.json


### WM-055 - One Production Response Contract With Separate Typed Results

```yaml
plan_unit_id: WM-055
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: "The production matrix carries one response_contract_ref for all existing command rows. Per-row typed result refs remain owned contracts, not duplicate UI response envelopes or evidence of native adapter implementation."
gui_related: true
gui_classification_reason: This governs visible command feedback and control wiring.
depends_on: [CV-331, UIW-023]
unblocks: []
acceptance_criteria:
  - "Require response_contract_ref to equal Plans/ui_command_response.schema.json in the production response gate; retain historical matrix examples without treating them as production proof."
  - "At the response-bridge snapshot, 1154 production-intent rows inherited the declared envelope; 387 had explicit typed result schema refs and 767 did not. WM-056 records subsequent peer-row exclusions; derive the current counts from the actual matrix. Neither snapshot is adapter certification."
  - "All twenty-six shared-runtime commands have exact typed result refs inheriting the required command outcome binding."
  - "No row, handler, availability, event effect, candidate exclusion or command identity is added or lifted merely by adding the root reference."
  - "Native admission still requires actual typed-result resolution, authenticated owner verification, effect receipts and end-to-end interaction proof."
validation_surfaces: [Plans/ui_command_response_fixtures.json, tests/test_pm_ui_command_response.py, python3 scripts/pm-plans-verify.py validate-ui-command-response, python3 scripts/pm-plan-index.py validate]
risk_class: command_response_identity_or_false_completion
reasoning_tier: high
context_scope: central_command_response_bridge
implementation_surfaces: [Plans/Wiring_Matrix.schema.json, Plans/Wiring_Matrix.production.json, scripts/pm-ui-command-response.py]
node_compile_hint: {mode: static_command_response_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [USER-PACKET-GAP-CLOSURE-20260910, Plans/Shared_Integration_Runtime.md#SIR-015]
negative_constraints:
  - No native dispatcher, owner authentication, effect execution, new command, event or physical storage-family admission is proved by static fixtures.
  - No second command outcome owner, fabricated operation scope, automatic retry of unknown effects, or governance/readiness lift.
```

ContractRef: ContractName:Plans/Contracts_V0.md#CV-331, ContractName:Plans/ui_command_response.schema.json, ContractName:Plans/Shared_Integration_Runtime.md#SIR-015

### WM-056 - Bounded Gap-Repair Touch Inventory And Whole-Command Accounting

The table below is the exact additional Touch Closure inventory for the September 10 gap repair:
nine existing BSD commands, seven existing Context Lens commands, and twenty-two existing
commands affected by the owner-reference/sole-handler repair. The fifteen scoped Browser
program commands and `cmd.bsd.set` already have rows and are not duplicated. This is an explicit
bounded extension, not permission to turn every catalog mention, alias, source candidate or
unrelated production command into a new packet denominator.

<!-- gap-repair-touch-inventory-20260910:start -->
| Canonical command | Touch profile | Canonical owner PlanUnit |
|---|---|---|
| `cmd.bsd.configure` | `TCP-GAP-001` | `Plans/Back_Seat_Driver.md#BSD-020` |
| `cmd.bsd.workflow.configure` | `TCP-GAP-002` | `Plans/Back_Seat_Driver.md#BSD-020` |
| `cmd.bsd.assignment.pause` | `TCP-GAP-003` | `Plans/Back_Seat_Driver.md#BSD-020` |
| `cmd.bsd.assignment.resume` | `TCP-GAP-004` | `Plans/Back_Seat_Driver.md#BSD-020` |
| `cmd.bsd.assignment.retry` | `TCP-GAP-005` | `Plans/Back_Seat_Driver.md#BSD-020` |
| `cmd.bsd.assignment.stop` | `TCP-GAP-006` | `Plans/Back_Seat_Driver.md#BSD-020` |
| `cmd.bsd.finding.open` | `TCP-GAP-007` | `Plans/Back_Seat_Driver.md#BSD-020` |
| `cmd.bsd.open_usage` | `TCP-GAP-008` | `Plans/Back_Seat_Driver.md#BSD-020` |
| `cmd.bsd.open_transcript` | `TCP-GAP-009` | `Plans/Back_Seat_Driver.md#BSD-020` |
| `cmd.chat.context_lens.toggle` | `TCP-GAP-010` | `Plans/assistant-chat-design.md#ACD-460` |
| `cmd.chat.context_lens.set_mode` | `TCP-GAP-011` | `Plans/assistant-chat-design.md#ACD-460` |
| `cmd.chat.context_lens.turn_off` | `TCP-GAP-012` | `Plans/assistant-chat-design.md#ACD-460` |
| `cmd.chat.context_lens.toggle_message_selection` | `TCP-GAP-013` | `Plans/assistant-chat-design.md#ACD-460` |
| `cmd.chat.context_lens.clear_selection` | `TCP-GAP-014` | `Plans/assistant-chat-design.md#ACD-460` |
| `cmd.chat.context_lens.apply_subcompact` | `TCP-GAP-015` | `Plans/assistant-chat-design.md#ACD-460` |
| `cmd.chat.context_lens.revert_subcompact` | `TCP-GAP-016` | `Plans/assistant-chat-design.md#ACD-460` |
| `cmd.chat.attachment.add` | `TCP-GAP-017` | `Plans/FileManager.md#F-082` |
| `cmd.chat.attachment.remove` | `TCP-GAP-018` | `Plans/FileManager.md#F-082` |
| `cmd.chat.attachment.retry` | `TCP-GAP-019` | `Plans/FileManager.md#F-082` |
| `cmd.chat.attachment.open` | `TCP-GAP-020` | `Plans/FileManager.md#F-082` |
| `cmd.chat.attachment.download` | `TCP-GAP-021` | `Plans/FileManager.md#F-082` |
| `cmd.chat.attachment.details` | `TCP-GAP-022` | `Plans/FileManager.md#F-082` |
| `cmd.chat.attachment.freeze_reference` | `TCP-GAP-023` | `Plans/FileManager.md#F-082` |
| `cmd.chat.attachment.save_to_project` | `TCP-GAP-024` | `Plans/FileManager.md#F-082` |
| `cmd.chat.composer.destination.set` | `TCP-GAP-025` | `Plans/assistant-chat-design.md#ACD-462` |
| `cmd.chat.thread.regenerate_title` | `TCP-GAP-026` | `Plans/assistant-chat-design.md#ACD-462` |
| `cmd.chat.goal.propose_update` | `TCP-GAP-027` | `Plans/Goal_Runtime_System.md#GRS-054` |
| `cmd.chat.plan.build` | `TCP-GAP-028` | `Plans/Assistant_Plan_Runtime.md#APR-007` |
| `cmd.chat.plan.build_with_crew` | `TCP-GAP-029` | `Plans/Assistant_Plan_Runtime.md#APR-011` |
| `cmd.chat.plan.export` | `TCP-GAP-030` | `Plans/Assistant_Plan_Runtime.md#APR-003` |
| `cmd.chat.crew_auto.set` | `TCP-GAP-031` | `Plans/Collaborative_Workflows.md#CWR-004` |
| `cmd.collaboration.start` | `TCP-GAP-032` | `Plans/Collaborative_Workflows.md#CWR-001` |
| `cmd.brainstorm.synthesize_plan` | `TCP-GAP-033` | `Plans/Collaborative_Workflows.md#CWR-007` |
| `cmd.browser.capture.full_to_chat` | `TCP-GAP-034` | `Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-089` |
| `cmd.browser.capture.region_to_chat` | `TCP-GAP-035` | `Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-089` |
| `cmd.browser.component.send_now` | `TCP-GAP-036` | `Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-090` |
| `cmd.browser.component.add_to_composer` | `TCP-GAP-037` | `Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-090` |
| `cmd.chat.revert` | `TCP-GAP-038` | `Plans/assistant-chat-design.md#ACD-217` |
<!-- gap-repair-touch-inventory-20260910:end -->

Every entry remains partial. A Markdown payload/result/error reference identifies the current
owner declaration and its gap; it is not a materialized JSON schema. None of these rows proves
native dispatch, authenticated owner-result resolution, durable effects, event producers,
reverse-surface interaction, accessibility, visual or motion acceptance. Required unadmitted
event families block their effects: a receipt or an empty expected-event list is no substitute.
Existing historical audit identities and alias/source cases remain retained even when an
illegal peer production row is removed.

Whole-command accounting separately enumerates every actual production row and unique command,
including commands outside the packet Touch inventory, without silently treating them as reviewed
or implemented. It validates actual references, exact exclusions and one handler identity per
canonical command. Missing machine request/result bindings remain visible in that accounting.
The single shared exclusion predicate is consumed by both the standard wiring gate and the
read-only inspector; it must not fork into conflicting alias rules.

```yaml
plan_unit_id: WM-056
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  The bounded gap-repair table adds exactly thirty-eight existing commands to partial Touch Closure.
  Whole-production command accounting is separate from the packet denominator and cannot promote
  structural coverage to semantic review or native proof. Excluded aliases and retired commands
  have no peer production row, and each canonical command has one sole handler identity across surfaces.
gui_related: true
gui_classification_reason: Visible command controls retain exact owner, disabled, trigger and return coverage.
depends_on: [WM-046, DR-040, DR-041, BSD-020, ACD-460, ACD-462, F-082]
unblocks: []
acceptance_criteria:
  - The exact thirty-eight listed commands each have one partial Touch Closure row and the listed owner/profile; unrelated catalog or source tokens cannot expand that set.
  - This repair moves the retained Touch inventory from 606 rows/93 profiles to 644 rows/131 profiles, preserves its 58 exclusions and 64 alias bindings, and removes eleven forbidden peer production rows from the 1154-row predecessor. These scoped counts are not native or semantic-review verdicts.
  - The eleven excluded production spellings are cmd.actions.pin/unpin, seven cmd.github_actions compatibility spellings, retired cmd.chat.delete_message, and file-only cmd.chat.add_file_reference. The last retains its catalog signature and normalizes to cmd.chat.attachment.add before every gate; preserve its source identity and reject folder input without a peer handler.
  - Existing Browser and BSD mode rows remain single; BSD mode request/result/error refs resolve to the existing shared-runtime schemas without a parallel contract family.
  - Each new profile names its actual sole future handler and actual production placements plus intended family consumers; no native wiring status is inferred.
  - Markdown declarations remain explicitly unmaterialized machine-contract gaps and cannot establish complete payload, result or error coverage.
  - Every production row and unique command is separately accounted, including out-of-packet commands and missing machine bindings.
  - Exact excluded tokens cannot reappear as peer production rows, and differing handler identities for one canonical command fail the standard gate.
  - Historical source cases, superseded spellings and missing runtime findings remain retained; removal of a peer row cannot erase them from the audit.
  - No native implementation, event family, storage family, WorkNode, NodeSeed, readiness unlock or governance seal is admitted by this repair.
validation_surfaces: [scripts/pm-touch-closure-verify.py, scripts/pm-assistant-contract-check.py, scripts/pm_wiring_inventory.py, tests/test_pm_touch_closure_source.py, python3 scripts/pm-plans-verify.py validate-wiring-matrix]
risk_class: omitted_touch_or_false_whole_command_closure
reasoning_tier: high
context_scope: bounded_packet_gap_accounting
implementation_surfaces: [Plans/Wiring_Matrix.md, Plans/touch_closure.json, Plans/Wiring_Matrix.production.json, Plans/Wiring_Matrix.production.exclusions.json]
node_compile_hint: {mode: static_inventory_and_contract_references_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [USER-PACKET-GAP-CLOSURE-20260910, Plans/UI_Command_Catalog.md#UCC-156, Plans/UI_Command_Catalog.md#UCC-158, Plans/Back_Seat_Driver.md, Plans/assistant-chat-design.md]
negative_constraints: [No ambient-token denominator expansion., No fabricated machine schema or native evidence., No duplicate owner handler or alias production row., No audit-case deletion or false aggregate pass.]
```

ContractRef: ContractName:Plans/DRY_Rules.md#DR-040, ContractName:Plans/DRY_Rules.md#DR-041, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Wiring_Rules.md, ContractName:Plans/touch_closure.json
