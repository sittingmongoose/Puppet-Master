# Shard 063: W3C Event Authority phase-1 prepared contracts - 2026-11-05

Source: `Plans/Automated_Testing_System.md`

Source lines: L12954-L13316

Source SHA256: `f8ea41765327d5d0508d27999695154fbd7dbbff24b2317b2fc5cc971f3b737f`

---

## W3C Event Authority phase-1 prepared contracts - 2026-11-05

These new per-family units are proposals prepared without admission. Existing event and storage family registries remain unchanged.


### ATS-1220 - testing.runtime_enabled_for_adapter prepared owner contract

```yaml
plan_unit_id: ATS-1220
unit_type: interface_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: 'NEWLY AUTHORED owner contract for `testing.runtime_enabled_for_adapter@1.0.0`, prepared without
  admission under deck-2 item 9.a A (DL-450 reference; answer bytes and premise evidence in the W3C report).
  The current exact-name search found only the registration requirement, no full event definition or alias.
  This contract reuses sections 1-9 and the exact `adapter_readiness_source` record definition, not another
  event family''s bindings. Saved fact: The Project-bound testing adapter changed from runtime-disabled to
  runtime-enabled after all five existing owner prerequisites were proven.


  Producer: `AutomatedTestingService.commit_adapter_readiness` under the existing TestCaptureService or Testing
  owner; no dispatcher/handler exists by virtue of this binding. Scope is `project_only`. Capture adopts TCME-008''s
  real No project Server/Host/Environment/thread/session context. Project source schemas stay exact. New application
  source siblings are in Plans/test_capture_application_records.schema.json, with `.application.v1` identities,
  null project_id and actual optional run binding; no old Project resource is relaxed. Readiness stays Project-only
  as its existing project_id field requires. Missing native source capture or physical admission is unavailable,
  never a synthetic all-true receipt.


  The closed payload and all fields are defined by CV-1320; its source_record resolves the immutable actual
  `adapter_readiness_source` record (the new application sibling only for application capture), except supplemental
  bookmark/pause/stop/interruption/redaction/failure receipts which are original typed command/owner outcomes
  and do not invent a second capture service. Before-record is required for a state/quality/target change and
  null only where no predecessor exists. The payload''s explicit subject fields equal the dereferenced source/request,
  and its permission ref equals the captured operation. The original request and prior snapshots are captured
  before the effect; post-state and result snapshots are captured only when the genuine outcome is committed,
  preserving the original owner currentness and writer-generation joins. Exact original schema IDs, record_kind,
  subject, actor, target, Server, Host, Environment, source location and scope must agree field by field. Verify
  hashes from actual immutable bytes, not a caller digest. A missing source record or late effect is not reconstructed
  from focus, a newest artifact or user claims.


  Family-specific predicates: (1) The exact adapter is configured and its current exact-target capability probe
  is available. (2) The permission snapshot is current for the same Project/actor/adapter/target. (3) Every
  required fixture in the owner-selected requirement set exists with its exact hash; the caller cannot shrink
  that set. (4) A real adapter probe/invocation proves it can produce the complete current merged TestRunReceipt,
  not a partial prior view. (5) The prior readiness state is runtime-disabled and the committed successor is
  runtime-enabled; this is not PNC-019 certification.


  Producer ordering: validate admission, physical schema, scope, permission, resource, currentness and authoritative
  dedupe; CAS the immutable original request intent/operation row in SP-1320 before any effect.

  The request captures the original adapter-readiness evaluation input, exact adapter/target, owner-selected
  prerequisite refs and prior disabled state before enablement. Its selected closed request schema is distinct
  from the completed payload.

  Pending stores null outcome_record, producer_semantics, original_event and first_append; no video hash, failure
  record or completed result is needed.

  The existing owner performs the authorized action once. On genuine source-outcome commitment, CAS pending
  -> outcome_committed, binding and freezing both outcome_record and the complete EventRecord producer-semantic
  input from that outcome and the original request.

  Outcome-backed snapshots are captured at this boundary, with original request/pre-state/permission custody
  preserved; outcome fields are never predicted before the effect.

  No cross-store transaction is asserted. Append only the frozen outcome_committed input with durability_class=barrier.
  Resolve original full-value custody, CAS event_committed, then terminal before publication. Explicitly adopt
  SP-286 and CV-339 strict stored v2, `storage.first_append_receipt.resolve_full_value.v1` as the full-value
  resolver role (use the CV-339-defined actual interface name and shapes, never a local receipt format), and
  SP-336/SP-347 full-flush commit-frame issuance. First original receipt/custody precedes terminal operation
  publication and every dependent visible result. Pending crash reconciliation reads actual original action/source/receipt
  evidence; it never repeats an uncertain external action. A missing or contradictory original fences retry
  and exposes recovery/unavailable rather than minting completion.


  Identity and replay: adopt Contracts_V0.md#EventRecord, CV-317, CV-339 and CV-366 by name. Capture one owner_operation_id
  and one family effect component in the immutable intent. Event ID is `w3c@1:` + hex(exact UTF-8 original
  storage_instance_id) + `:` + hex(exact UTF-8 owner_operation_id) + `:` + hex(exact UTF-8 event_type), globally
  checked by Storage. Project idempotency key is `testing.runtime_enabled_for_adapter@1:` + hex(exact UTF-8
  owner_operation_id); app key is exactly `application@1:{hex(server_id)}:{hex(owner_operation_id)}` using
  CV-366''s actual Server and original effect-specific operation identity. Distinct effects reserve distinct
  operation components before commitment. Scope partition remains app or Storage''s reversible project~ encoding.
  Copy occurred_at_utc and producer_sequence_id from the immutable original owner input; all Storage-assigned
  sequence/timestamps/receipt terms come only from authenticated Storage custody. Producer-semantic comparison
  is exactly EventRecord''s caller-owned preimage and excludes Storage metadata. Shared owner number/time editions
  govern; this lane defines no number, timestamp or physical-codec algorithm. Same identity/same digest returns
  the original full value/result without a second capture, encode, bookmark, read audit, notification or event.
  Different digest conflicts; dedupe_unavailable refuses. Current append/retry refuses projector_replay_only
  as replay_only_not_appendable. Historical compatibility-only reads never pass through current-writer admission.


  Retention: `RP-AUTHORITY-INDEFINITE`. This exact saved fact is approval/receipt authority or raw/derived
  source lineage under Storage Case L-3, not the census analogy. This assignment retains only these ref-only
  history facts and canonical original operation/receipt custody; media, privacy, Project deletion and source
  policies remain their own owners. Canonical original operation/receipt authority uses RP-AUTHORITY-INDEFINITE;
  the derived family uses RP-PROJECTION-3GEN and never holds expired source history alive. Unknown history
  policy retains indefinitely/no-count-eviction as materially incomplete, without authorizing admission. Legal/recovery/user-preserve/live-source/backup/derived-lineage
  holds remain unioned. Artifact deletion can restrict/unlink media under its existing owner without rewriting
  a retained event or disclosing the linked body.


  Custody: exact media bytes stay immutable under SP-343 and SP-337; metadata contains only bounded safe refs/IDs,
  never media/base64, raw labels/content, credentials or protected-auth content. Restore preserves original
  intent/source snapshots, raw/derived lineage, referenced packs and Storage receipt custody at one BRS-031
  boundary; source/current writer mismatch fences mutation. Raw and derived identities prune independently;
  missing originals, gaps, corrupt segments and failures remain truthful. Present access/deletion/restriction
  and redaction checks run on every read/advance/replay/recovery path. Valid retained history survives a later
  live-state or permission-generation change, while present content access is still checked.


  Consumer/checkpoint: operating consumer `view.testing.testing_runtime_enabled_for_adapter@1.0.0` and `view.runtime_artifacts.testing_runtime_enabled_for_adapter@1.0.0`
  read only `reader.testing.runtime_enabled_for_adapter@1.0.0`''s verified ref-only projection. Neither certifies
  a test, native runtime or provenance beyond this exact saved result. Explicitly adopt SP-278 and DL-076''s
  nine-field DurableGenericToken in SP-1320; use that family''s exact checkpoint key/schema, source-currentness
  coverage, atomic projection/cursor predecessor CAS, retention/translation/rebuild and read-time identity
  checks. A mismatch or lag returns unavailable/lag, not authoritative absence. Replay is passive and cannot
  execute tools, encoders, commands, network calls, notifications, usage charges or new canonical events.


  Compatibility and withdrawal: current proposed schema/reader version is 1.0.0 and no historical capture event
  admission is claimed. Legacy aggregate capture IDs migrate only by TCME-006''s explicit exact record-kind
  selection; no missing source is invented. Future readers dispatch by authenticated original schema/recipe
  edition (SP-286/CV-339 custody), preserve valid retained originals under the write-time recipe and refuse
  substituted editions or unknown selectors. Before withdrawal, disable writer admission under the original
  generation, settle/fence pending operations, record the exact cutoff under existing governance, and prohibit
  new effects or re-minting. Invalidate this reader and checkpoint generation; a reviewed compatible successor
  must rebuild from retained exact source/custody before disclosure. Withdrawn or invalid originals are unavailable.
  No new event records the withdrawal here. Criterion 12 is the per-family oracle plan in ATS-1221,
  executable in phase 2 (scripts/pm_w3c_event_oracles.py over Plans/w3c_event_fixtures.json, every guard row
  proved by the gated shared tool); native execution is NOT_RUN.


  Phase-aware recovery: compare a retry with the complete original request and pre-effect inputs first, excluding
  Storage-assigned metadata; do not require or compute a future event-payload digest. Same request while pending
  returns pending/recovery and never repeats an uncertain action. A proved never-started action may run once
  under the original admission and action fence. An action already performed but not yet bound reconciles only
  its genuine original result, CAS-binds outcome_committed once, and never re-encodes or synthesizes success/failure.
  Unknown or contradictory action evidence remains fenced. After binding, EventRecord caller-preimage equality
  governs append retries; the request, identity, outcome and preimage remain immutable. A crash after append
  uses original receipt resolution before publication. Competing attempts use complete-row/head CAS. For demonstration
  created/failed, both potential family components refer to the same original encoder command/action fence;
  reservation of a possible outcome is not permission for a second encoding. Only the genuinely committed selected
  outcome can append its family event.


  Empty-history checkpoint: use only the explicit {mode: empty} projection and paired null last-event cursors
  after authenticated complete same-Storage coverage at the SP-278 token boundary. Missing, lagging or unverifiable
  source coverage returns unavailable, never absence. Nonempty inline/external projections resolve the genuine
  completed payload and match the last original EventRecord identity/sequence and full-value custody in this
  scope. Verify that relation on every reader path; projection and cursor commit by predecessor CAS as one
  transaction.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- ATS-026
- ATS-027
- CV-1320
- SP-1320
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 is met by the phase-2 executable synthetic oracles and gated guard-tool proof named in
  ATS-1221; native execution stays NOT_RUN and membership ABSENT.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.runtime_enabled_for_adapter
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### ATS-1221 - W3C phase-1 per-family oracle plan

```yaml
plan_unit_id: ATS-1221
unit_type: interface_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: 'NEWLY AUTHORED per-family criterion-12 oracle PLAN for the exact 21 names in Plans/w3c_test_capture_event_oracle_plan.json.
  Each named family owns an independent guard inventory, source-backed positives, one-defect negative plans,
  passive retained-history positives, oversized-part custody cases and native NOT_RUN obligations. Phase 1
  wrote it as a plan; phase 2 makes it executable (below).


  After reviewed plans/ea-numrule-20261105 and plans/ea-guardtool-20261105 foundation adoption, phase 2 materializes
  the corpus using their shared number/time helper and pm_guard_isolation. Expand each compound source or schema
  guard into individual field/predicate assertions. A schema required/enum/const/pattern/length/type/additionalProperties/ref/format
  constraint is a separate predicate; every active predicate gets positive and negative coverage. Construct
  each negative from a valid complete source world with exactly one defect; recompute all dependent snapshots,
  source copies, commitments, keys, CAS heads and receipt terms to preserve unrelated invariants. Removing
  only its guard must make that case pass. A duplicate set is the same field and same predicate at several
  sites: removing any single site still rejects for that predicate, removing all permits the case. Shared refusal
  codes, enforcement sites or compound keywords never justify merging distinct predicates. Machine proof inventories
  every enforcement site and reports uncovered guards and masked fixtures. No lane proof implementation is
  authored in phase 1.


  Check every standing BRIEF-DRAFT item: source/digest/identity verification; Storage-owned metadata; retained-read/current-write
  separation and authenticated edition selection; exact types/string representations; eager ref resolution;
  every stored-part size; custody on advance/retry/replay/recovery; one-defect isolation; honest grades; shared
  numeric domains and timestamp grammars; present disclosure/withdrawal fences. No passing schema or planning
  check demonstrates media, real adapter readiness, native execution, PNC-019 or release certification.


  Phase-1 review round 1 plans a valid pending request without any output, real outcome commitment, action-before-outcome
  crash reconciliation, outcome-before-append recovery, and receipt-before-publication recovery in each scope.
  Pending request comparison is separate from the later frozen EventRecord producer preimage. Each missing
  phase obligation, changed original request, premature publication, uncertain repeated action and altered
  frozen outcome is a separate one-defect negative; preserve all peer copies and proofs. Phase 2 executes
  each of these cases.


  Phase-1 review round 1 also plans empty, nonempty inline and nonempty external checkpoints in each applicable
  scope. Empty uses only {mode: empty} and paired null cursors with independently authenticated complete coverage.
  Each cursor/projection shape mismatch, omitted source range, mismatched token identity and otherwise valid
  foreign last-event body is a separate one-defect negative. Keep source worlds, hashes, copied fields and
  keys coherent apart from that one relation; isolate cursor predicates separately and never weaken the entire
  conditional. Phase 2 executes read/advance/replay/rebuild coverage verification.


  Phase 2 (2026-11-13, executable synthetic oracles). scripts/pm_w3c_event_oracles.py is the complete
  checker for the 21 families over six paths: install (eager schema reference closure through the unchanged
  Corpus registry), append (current writer, CV-339/SP-286 first-receipt custody, publication order), retry
  (phase-aware request and frozen-preimage comparison, original result), history (SP-1101 retained read),
  operation (each canonical operation CAS step: pending, outcome binding with the uncertain-action fence,
  commit custody, terminal, withdrawal, restore) and checkpoint (SP-278 token, empty and nonempty coverage,
  cursors, last-event joins, predecessor CAS, RP-PROJECTION-3GEN generations). Every refusal is one named
  guard row with one predicate and one code in a generated table of at most eight rows
  (scripts/pm_w3c_table_*.py, generator scripts/pm-w3c-table-generate.py); the row compares the raw facts
  the checker observed for it, and the gated shared tool proves each row (scripts/pm-w3c-guard-tables.py).
  Validation keeps every owner schema keyword except the operation phase oneOf and the checkpoint cursor
  if/then pairs, which named rows restore predicate by predicate; format uuid and pattern-only fields
  without a line guard have explicit full-match rows. Plans/w3c_event_fixtures.json (builder
  scripts/pm-w3c-cases.py) holds complete positives per family, scope edition and path, and one-defect
  negatives each built from a named positive by changing one owner value at the stage that owns it, so every
  copy, hash, key and commitment follows it. Numbers use the shared NUMRULE calls (current_integer,
  storage_uint64, producer_semantic_bytes/_digest, full_value_commitment, storage_value_bytes,
  verify_payload_bytes, RetainedDispatcher); timestamps use the shared pm_event_datetime checks with each
  owner profile. A retained read selects its recipe only from the sealed receipt for that exact original in
  Plans/w3c_original_custody.json and the scenario''s Store, and the checker compares the sealed store before
  and after every read. Native execution stays NOT_RUN and membership ABSENT.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- ATS-1220
- SP-278
- SP-286
- CV-339
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 is met by the phase-2 executable synthetic oracles and gated guard-tool proof named in
  ATS-1221; native execution stays NOT_RUN and membership ABSENT.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens: []
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### ATS-1222 - testing.receipt.recorded owner investigation boundary

```yaml
plan_unit_id: ATS-1222
unit_type: interface_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: 'The W3C owner investigation finds testing.receipt.recorded only in Plans/.implementation_readiness/non_executable_closure_evidence.json#/event_payload_contract_registry,
  with source scope spec_schema_validator_fixture_only_no_runtime_artifact_emission. Its payload points to the existing
  test_run_receipt, while ATS-026 owns the complete merged TestRunReceipt and ATS-025 prohibits quarantine/release
  from editing old receipts. No current Testing/Storage semantic owner sentence declares this dotted spelling an
  alias, delivery-only label, or separately required EventRecord. The readiness row''s event_type key alone proves
  none of those outcomes. No contract, alias/exclusion application, event admission or new saved-history type is
  authored for it here. Keep existing TestRunReceipt persistence, commands and projections intact. Owner classification
  remains OPEN pending exact authority: Does testing.receipt.recorded name only the existing saved TestRunReceipt
  result/notification, an alias of an admitted family (which exact one), or an additional durable EventRecord? A
  demonstrated new-history requirement or conflicting-owner choice goes to Jared; mere missing proof is not an exclusion.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume existing
  projections.
depends_on:
- ATS-026
- ATS-025
- CV-317
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof is inferred.
- Criterion 12 is met by the phase-2 executable synthetic oracles and gated guard-tool proof named in
  ATS-1221; native execution stays NOT_RUN and membership ABSENT.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens: []
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```
