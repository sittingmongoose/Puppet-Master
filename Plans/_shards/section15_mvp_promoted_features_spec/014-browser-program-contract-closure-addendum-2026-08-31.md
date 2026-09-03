# Shard 014: Browser Program contract closure addendum — 2026-08-31

Source: `Plans/Section15_MVP_Promoted_Features_Spec.md`

Source lines: L8734-L8980

Source SHA256: `cddc39f6018cb3977d9b4e9548a521c5befbf8d24e634cced5730046cb3b622c`

---

## Browser Program contract closure addendum — 2026-08-31

This addendum closes the static owner/schema gap identified for PM Browser Script, typed BrowserProgram execution, ProgramWorkspace, representation/query, controller and handoff receipts, adaptive routing, routines/adapters, and truthful progress. It extends SMPFS-142 through SMPFS-145 without weakening their PM-native, protected-auth, lease-fencing, or no-Playwright boundaries. Runtime implementation and proof remain open.

### Browser Program machine schema identity

`Plans/section15_browser_program_contracts.schema.json` is the Draft 2020-12 union-schema document. Its aggregate `$id`, `pm.section15_browser_program_contracts.schema.v1`, identifies only that schema document and is not a payload schema identity. Every record is addressed by exactly one stable `(schema_id, record_kind)` pair:

| `record_kind` | canonical payload `schema_id` |
|---|---|
| `browser_program_compile_request` | `pm.browser_program.compile_request.v1` |
| `browser_program_compile_result` | `pm.browser_program.compile_result.v1` |
| `browser_program_compile_error` | `pm.browser_program.compile_error.v1` |
| `browser_program` | `pm.browser_program.program.v1` |
| `program_workspace_revision` | `pm.browser_program.workspace_revision.v1` |
| `representation_query` | `pm.browser_program.representation_query.v1` |
| `representation_query_result` | `pm.browser_program.representation_query_result.v1` |
| `browser_controller_lease_receipt` | `pm.browser_program.controller_lease_receipt.v1` |
| `browser_program_segment_receipt` | `pm.browser_program.segment_receipt.v1` |
| `browser_handoff_receipt` | `pm.browser_program.handoff_receipt.v1` |
| `browser_transfer_receipt` | `pm.browser_program.transfer_receipt.v1` |
| `browser_routing_decision` | `pm.browser_program.routing_decision.v1` |
| `browser_routine_record` | `pm.browser_program.routine_record.v1` |
| `external_browser_adapter_receipt` | `pm.browser_program.external_adapter_receipt.v1` |
| `browser_program_result` | `pm.browser_program.result.v1` |
| `browser_command_request` | `pm.browser_program.command_request.v1` |
| `browser_command_result` | `pm.browser_program.command_result.v1` |
| `browser_command_error` | `pm.browser_program.command_error.v1` |
| `browser_command_availability` | `pm.browser_program.command_availability.v1` |
| `browser_command_disabled_reason` | `pm.browser_program.command_disabled_reason.v1` |
| `browser_observable_work_projection` | `pm.browser_program.observable_work_projection.v1` |

Validators and storage routing fail closed when either member is missing, unknown, or mismatched. The former aggregate payload ID is migration input only: an explicit pre-validation migrator must first identify one exact known `record_kind`, rewrite to its canonical ID above, and retain migration provenance; unknown or missing kinds are rejected. The aggregate ID is never persisted as record identity and is not accepted as a compatibility alias during normal validation. No Browser Program record admits `AuthBrowserSession`, protected-auth content, credentials, cookie/storage state, capture, or automation authority; only `ordinary` browser subjects validate.

The existing fifteen canonical `cmd.browser.workspace.*`, `cmd.browser.page.*`, and `cmd.browser.program.*` identities in §15.11 use one owner-DRY `browser_command_scope` discriminator and five generic request/result/error/availability/disabled-reason record shapes. Each command ID has command-specific required workspace, page, PageGeneration, controller, representation, program, ProgramWorkspace revision, checkpoint/effect, policy, or capability fields as applicable. Fields for arbitrary JavaScript, raw browser protocol, hidden interpreters, `AuthBrowserSession`, protected-auth state, and `cmd.playwright.*` do not exist in the closed scope. These are static owner contracts only: the central command catalog, native BrowserRuntimeService handlers, production wiring, Event Authority admission, and runtime/security/visual proof remain absent.

### SMPFS-147 - PM Browser Script Compiler And Typed BrowserProgram

```yaml
plan_unit_id: SMPFS-147
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: PM Browser Script is a compact declarative named-action language compiled through parser, type/name/effect/limit/capability/permission/FileSafe preflight into versioned BrowserProgram and BrowserProgramAST; failures are source-spanned and no-effect, and every program carries source/compiler/API/capability/AST hashes, bounded result policy, ordinary-session security class, and no arbitrary code or ambient host authority.
gui_related: false
gui_classification_reason: This unit owns compiler, AST, hashing, preflight, authority, and result contracts rather than visible presentation.
depends_on: [SMPFS-142, SMPFS-143, SMPFS-145]
unblocks: [SMPFS-148, SMPFS-149, SMPFS-151, SMPFS-152]
acceptance_criteria:
  - Compact source and validated AST compile to the same reproducible typed program when hashes/digests match.
  - Parse/type/name/effect/limit/capability/permission/FileSafe failure returns exact spans and no_effect true before any mutation.
  - AST admits only named actions, bounded queries/local operators, checkpoints, and declared capture/bookmark requests.
  - Protected-auth, Python/host code, arbitrary page code, raw protocol, filesystem/process/environment/keychain/socket, and Playwright-shaped authority are structurally absent.
validation_surfaces: [Plans/section15_browser_program_contract_fixtures.json, future compiler no-effect and hash-reproducibility matrix]
risk_class: browser_script_compiler_or_authority_escape
reasoning_tier: high
context_scope: pm_browser_script_compiler
implementation_surfaces: [Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/section15_browser_program_contracts.schema.json]
node_compile_hint: {mode: browser_program_contract_only, create_worknodes: false, create_nodeseeds: false}
preserved_exact_tokens: [PM Browser Script, BrowserProgram, BrowserProgramAST, no_effect, source_hash, compiler_hash, api_digest, capability_profile_hash, ast_hash]
source_lineage: [source_ref:egolite-requirement:EGO-001, source_ref:egolite-requirement:HBU-001, source_ref:egolite-requirement:HBU-002, source_ref:egolite-requirement:HBU-003, source_ref:egolite-requirement:HBU-025, source_ref:egolite-requirement:BRW-003, source_ref:egolite-requirement:BRW-004, source_ref:packet:PKT-04/01_IMPLEMENTATION_PACKET.md:181-257]
negative_constraints:
  - Do not add a hidden interpreter or arbitrary-code compatibility path.
  - Do not treat successful compilation as execution or test proof.
```

### SMPFS-148 - ProgramWorkspace Segments Effects And Reconstructive Handoff

```yaml
plan_unit_id: SMPFS-148
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: ProgramWorkspace is revisioned typed durable local state with bounded data/reference classes and pure local operators, not a host directory. Programs execute in dependency-ordered bounded segments with expected revision, output/effect ranges, user_step_label, retry/idempotency, exact cancellation/timeout terminals, effect reconciliation, durable checkpoints/spills, and reconstructive host handoff that fences the source and never claims live process migration.
gui_related: true
gui_classification_reason: Technical Details exposes workspace revision, checkpoint, segment, timeout/effect reconciliation, and destination Host/Environment.
depends_on: [SMPFS-147, SMPFS-144]
unblocks: [SMPFS-152]
acceptance_criteria:
  - Workspace changes require expected revision and emit a new revision receipt; large values spill only to typed artifacts.
  - Unknown effect state blocks retry until explicit reconciliation.
  - Cancellation and timeout preserve completed, rejected, unknown, artifact/capture, and safe-next-action truth.
  - Handoff checkpoints eligible durable state, finalizes evidence, fences the source, reconstructs exact destination topology, and rejects unfenced/unknown-effect retry.
validation_surfaces: [Plans/section15_browser_program_contract_fixtures.json, future cancellation timeout duplicate-effect and handoff reconstruction matrix]
risk_class: program_workspace_effect_or_handoff_drift
reasoning_tier: high
context_scope: program_workspace_and_handoff
implementation_surfaces: [Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Shared_Integration_Runtime.md, Plans/FileSafe.md]
node_compile_hint: {mode: browser_program_contract_only, create_worknodes: false, create_nodeseeds: false}
preserved_exact_tokens: [ProgramWorkspace, cancelled_confirmed, timed_out_stopped, timed_out_effects_reconciled, timed_out_effect_state_unknown, user_step_label]
source_lineage: [source_ref:egolite-requirement:HBU-006, source_ref:egolite-requirement:HBU-007, source_ref:egolite-requirement:HBU-008, source_ref:egolite-requirement:HBU-009, source_ref:egolite-requirement:BRW-012, source_ref:packet:PKT-04/01_IMPLEMENTATION_PACKET.md:259-309, source_ref:packet:PKT-04/01_IMPLEMENTATION_PACKET.md:388, source_ref:packet:PKT-04/07_VALIDATION_AND_ACCEPTANCE.md:44-51]
negative_constraints:
  - Do not materialize ProgramWorkspace as a host directory or accept stdout/log paths as artifact authority.
  - Do not claim live stack/process migration during handoff.
```

### SMPFS-149 - Exact-Generation PageRepresentation And RepresentationQuery

```yaml
plan_unit_id: SMPFS-149
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Browser Program PageRepresentation and RepresentationQuery are exact-PageGeneration, budgeted, scoped, coverage-bearing and invalidation-aware with minimal/standard/full/scoped/delta modes, bounded local query operators, deterministic continuation, one base index per generation, concurrent bounded frame collection, truthful partial/root-only results, stale rejection, and generation-scoped collision-detected action/node IDs.
gui_related: true
gui_classification_reason: Browser and Technical Details expose human coverage, degradation, continuation, and stale/partial status.
depends_on: [SMPFS-147, SMPFS-144]
unblocks: [SMPFS-152]
acceptance_criteria:
  - Query and mutation authority always name exact BrowserPage and PageGeneration.
  - Coverage identifies frame/shadow/cross-origin/virtualized/listener/style/layout omissions and budget exhaustion.
  - Delta requires an admitted base and stale generations cannot be presented as current.
  - Site Reader and Browser Program representations remain explicitly distinct owners.
validation_surfaces: [Plans/section15_browser_program_contract_fixtures.json, future large-page budget partial stale and synthetic-ID collision matrix]
risk_class: representation_generation_coverage_or_owner_drift
reasoning_tier: high
context_scope: browser_program_representation_query
implementation_surfaces: [Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Tools.md]
node_compile_hint: {mode: browser_program_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:EGO-003, source_ref:egolite-requirement:HBU-010, source_ref:egolite-requirement:HBU-011, source_ref:egolite-requirement:BRW-014, source_ref:packet:PKT-04/01_IMPLEMENTATION_PACKET.md:309-356, source_ref:packet:PKT-04/09_HERMES_BROWSER_USE_INTEGRATION_DELTA.md:109-139]
negative_constraints:
  - Do not cite Site Reader representation as the full Browser Program action representation.
  - Do not accept stale or partial data as complete/current.
```

### SMPFS-150 - BrowserWorkspace Isolation Controller Takeover And Transfer

```yaml
plan_unit_id: SMPFS-150
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: BrowserWorkspace is the independently mutable isolation unit; compatible CEF process sharing is allowed only under a truthful compatibility key, while incompatible trust/profile/proxy/device/locale/extension/GPU/codec/crash/reproduction/recording state isolates. Exactly one fenced mutating controller lease exists per page generation; read-only viewers coexist; takeover/delegation and FileSafe transfers are explicit, scoped, timed, and receipted; focus/viewer/client changes confer no authority.
gui_related: true
gui_classification_reason: Testing and Browser cards show actual Host/Environment, controller/takeover state, requested/effective visibility, transfer state, and disabled reasons.
depends_on: [SMPFS-144, SMPFS-148]
unblocks: [SMPFS-152]
acceptance_criteria:
  - Shared-process compatibility never merges workspace identity/storage/controller/evidence/failure state.
  - One controller wins same-generation mutation; every stale/losing action is rejected without mutation.
  - Takeover/delegation fences late old-holder actions and emits scoped source/destination receipts.
  - FileSafe alone mediates upload/download with exact artifact/target/permission/disposition.
validation_surfaces: [Plans/section15_browser_program_contract_fixtures.json, future 1 4 10 governor race isolation transfer and crash-blast-radius matrix]
risk_class: browser_workspace_isolation_or_controller_escape
reasoning_tier: high
context_scope: browser_workspace_controller_and_transfer
implementation_surfaces: [Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Shared_Integration_Runtime.md, Plans/FileSafe.md]
node_compile_hint: {mode: browser_program_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:BRW-005, source_ref:egolite-requirement:BRW-006, source_ref:egolite-requirement:BRW-007, source_ref:egolite-requirement:BRW-008, source_ref:egolite-requirement:BRW-012, source_ref:packet:PKT-04/01_IMPLEMENTATION_PACKET.md:94-102, source_ref:packet:PKT-04/01_IMPLEMENTATION_PACKET.md:388]
negative_constraints:
  - Do not infer mutation authority from focus, visibility, client, viewer, or tab selection.
  - Do not retain incompatible workspaces in one crash/security domain.
```

### SMPFS-151 - Browser Routing Routines Screenshot Policy And External Adapters

```yaml
plan_unit_id: SMPFS-151
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Browser routing preserves orthogonal requested/effective strategy, runtime, source, visibility, and capture dimensions; public static content prefers Search/Fetch/Site Reader before browser escalation while private/LAN/localhost remains authorized private. Screenshot model attachment is auto/always/never and independent of artifact identity. Routines are typed/versioned/hashed/scoped/fixture-validated/provenance-bearing/reversible. Optional adapters are isolated typed bounded processes and close billable sessions explicitly.
gui_related: true
gui_classification_reason: Settings and Technical Details expose automatic strategy, effective fallback, screenshot policy, routine state, external cost/session state, and resource/remote limits.
depends_on: [SMPFS-147, SMPFS-149, SMPFS-150, TCME-001]
unblocks: [SMPFS-152]
acceptance_criteria:
  - Changing one routing dimension never silently changes source authority, permission, visibility, runtime, or capture target.
  - Screenshot attachment policy cannot bypass capture identity, permission, redaction, or budgets.
  - Routine promotion is explicit and later capability/API/fixture/policy drift invalidates or disables it.
  - External adapters use allowlisted env, scoped credentials, private runtime, typed IPC/artifacts, independent budgets, process-tree cancellation, and explicit billable close.
  - The controlled benchmark runner requires all four exact arms and the current preregistered `4 arms × 2 tiers × 1 task × 1 trial = 8 cells` denominator, every held-condition pin, and all `36 leaves/cell = 288` success/call/token/byte/time/resource/intervention/evidence/recording-overhead observations; unavailable arms remain explicit and make the result not comparable rather than silently disappearing.
  - Current static PM7 evidence may retain an `open_not_comparable` receipt, but no savings, winner, ordering, runtime, provider, network, or readiness claim exists until every cell executes under held conditions.
validation_surfaces: [Plans/section15_browser_program_contract_fixtures.json, scratchpad/pm-integration-20260831/audits/egolite-four-arm-benchmark-current/runner.py, scratchpad/pm-integration-20260831/audits/egolite-four-arm-benchmark-current/self_test.py, controlled production benchmark evidence]
risk_class: browser_routing_routine_or_adapter_authority_drift
reasoning_tier: high
context_scope: browser_routing_routines_adapters
implementation_surfaces: [Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Test_Capture_and_Motion_Evidence.md, Plans/Tools.md, scratchpad/pm-integration-20260831/audits/egolite-four-arm-benchmark-current]
node_compile_hint: {mode: browser_program_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:HBU-012, source_ref:egolite-requirement:HBU-014, source_ref:egolite-requirement:HBU-016, source_ref:egolite-requirement:HBU-019, source_ref:egolite-requirement:HBU-020, source_ref:egolite-requirement:HBU-024, source_ref:packet:PKT-04/09_HERMES_BROWSER_USE_INTEGRATION_DELTA.md:140-219]
negative_constraints:
  - Do not treat an optional adapter or benchmark hypothesis as Browser Program ownership or empirical proof.
  - Do not expose global Expert Mode or Python/Browser Use/Playwright product jargon.
```

### SMPFS-152 - Browser Receipts ObservableWork Command GUI And Migration Projection

```yaml
plan_unit_id: SMPFS-152
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Browser compile/execution, workspace revision, segment/effect, representation, lease/takeover, routing, routine, adapter, handoff, and owner-DRY command request/result/error/availability/disabled-reason records preserve exact lineage and truthful effect state. The fifteen canonical cmd.browser.workspace/page/program identities have discriminated static schemas, while central catalog registration, native BrowserRuntimeService handlers, production wiring, Event Authority admission, and runtime proof remain absent. GUI/Settings/Technical Details show human requested/effective, Host/Environment, progress, coverage, degradation, controller, reconciliation, and safe actions without treating static contracts or progress as success.
gui_related: true
gui_classification_reason: This unit owns the visible Browser/Testing/Settings/Technical Details projections and safe action states.
depends_on: [SMPFS-147, SMPFS-148, SMPFS-149, SMPFS-150, SMPFS-151]
unblocks: []
acceptance_criteria:
  - Every long browser operation exposes ObservableWork without converting queued/admitted/lease-held/visible/artifact-present into a verdict.
  - The generic command scope admits exactly the fifteen canonical command IDs and discriminates their required workspace/page/generation/program/controller/representation fields; protected AuthBrowserSession and arbitrary-code/protocol fields are structurally untargetable.
  - Future dispatch must target exact workspace/page/generation/program/lease identities through one registered native handler; this static contract does not claim that handler, catalog row, or production wiring exists.
  - GUI shows human state first and confines raw hashes/AST/generation/lease/budgets/checkpoints to Technical Details.
  - Migration either losslessly normalizes legacy code/evaluate/global/focus inputs or fails typed/no-effect without inventing runtime proof.
validation_surfaces: [Plans/section15_browser_program_contract_fixtures.json, future command reverse-coverage GUI disabled-state migration and protected-boundary matrix]
risk_class: browser_receipt_progress_wiring_or_migration_drift
reasoning_tier: high
context_scope: browser_observable_work_and_projection
implementation_surfaces: [Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: browser_program_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:EGO-002, source_ref:egolite-requirement:HBU-013, source_ref:egolite-requirement:HBU-017, source_ref:egolite-requirement:HBU-021, source_ref:egolite-requirement:HBU-023, source_ref:egolite-requirement:GUI-011, source_ref:egolite-requirement:GUI-013, source_ref:packet:PKT-04/01_IMPLEMENTATION_PACKET.md:257, source_ref:packet:PKT-04/01_IMPLEMENTATION_PACKET.md:798]
negative_constraints:
  - Do not infer central catalog registration, native handlers, production wiring, admitted events, or dispatch availability from the owner schema.
  - Do not convert static schema/fixture/catalog validation into runtime, security, visual, performance, migration, or empirical proof.
```

### SMPFS-153 - Browser Program Record-Addressable Schema Identity

```yaml
plan_unit_id: SMPFS-153
unit_type: constraint
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Every Browser Program payload uses one stable unique schema_id paired with one exact record_kind; the union schema aggregate ID identifies only the schema document, legacy aggregate payload IDs require explicit fail-closed pre-validation migration, and ordinary Browser records structurally exclude AuthBrowserSession and protected-auth state.
gui_related: false
gui_classification_reason: This unit owns record identity, migration, storage addressing, and protected-auth structural exclusion rather than visible presentation.
depends_on: [SMPFS-143, SMPFS-147, SMPFS-152]
unblocks: []
acceptance_criteria:
  - All twenty-one top-level record branches have unique schema_id constants and unique record_kind constants.
  - A schema_id and record_kind mismatch, missing member, unknown member, or legacy aggregate payload ID fails ordinary validation.
  - Legacy migration resolves one exact known record_kind before rewriting the payload ID and preserves migration provenance; it never guesses.
  - AuthBrowserSession and protected-auth subjects, content, credentials, cookie/storage state, capture, and automation authority remain structurally absent from ordinary Browser Program records.
validation_surfaces: [Plans/section15_browser_program_contracts.schema.json, Plans/section15_browser_program_contract_fixtures.json, future storage registry and migration fixture matrix]
risk_class: browser_record_schema_identity_ambiguity_or_protected_auth_escape
reasoning_tier: high
context_scope: browser_program_record_identity
implementation_surfaces: [Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/section15_browser_program_contracts.schema.json]
node_compile_hint: {mode: browser_program_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:packet:PKT-04/04_COMMAND_EVENT_WIRING_REGISTER.md:144-161, source_ref:packet:PKT-04/07_VALIDATION_AND_ACCEPTANCE.md:44-78]
negative_constraints:
  - Do not persist or route the aggregate union-schema ID as a record schema identity.
  - Do not accept a legacy ID, unknown record kind, mismatched pair, or protected-auth payload by inference.
```

### Browser Program migration coverage

This addendum writes product canon, PlanUnits, and machine contract/fixture owners only. The fifteen Browser command request/result/error/availability/disabled-reason shapes are now statically specified and fixture-covered, but this creates no WorkNodes, NodeSeeds, executable queues, BrowserRuntimeService implementation, compiler, CEF process, adapter, GUI, native command handler, production wiring, Event Authority admission, generated governance artifact, benchmark result, or runtime-certification claim. Central command catalog, event, wiring, index registration, and consumer-doc reconciliation remain root-owned follow-on work.
