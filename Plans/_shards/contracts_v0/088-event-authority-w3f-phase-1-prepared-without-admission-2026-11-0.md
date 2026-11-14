# Shard 088: Event Authority W3F Phase 1 — Prepared Without Admission (2026-11-05)

Source: `Plans/Contracts_V0.md`

Source lines: L45849-L47165

Source SHA256: `4623d6a821793daf4f7eaeeecbb64981e0a86fcd21d2f483f414d14bebe1982f`

---

## Event Authority W3F Phase 1 — Prepared Without Admission (2026-11-05)

Newly authored owner contracts under deck 2 item 9.a A. This section adds no admitted family and enables no native writer. The per-family base search is recorded in `reports/event-authority-20261105/W3F-search.json`. Criterion 12 remains PARTIAL until the shared number/time rules and guard-isolation tool pass review and phase 2 runs.

### CV-1450 - autonomy.ceiling_checked Resolved Payload And Owner Contract

```yaml
plan_unit_id: CV-1450
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract for `autonomy.ceiling_checked@1.0.0`; search/reuse evidence: `reports/event-authority-20261105/W3F-search.json` entry `autonomy.ceiling_checked`, base `f9c5de6561dff0a53a48e530f2a5c6804a7e941d`. Existing definitions reused: Permissions_System P0-PLAN-ACT-PERMISSION-BOUNDARY receipt paragraph; PRECEDENCE-LAYERS; Run_Modes runtime enum. The family is prepared without admission; membership is ABSENT, never inferred from this unit or its schema. The family candidate id is `event-family-autonomy-ceiling-checked`.

  2. Owner and semantic boundary. Reuse the existing AutonomyCeilingReceipt verbatim in role, runtime-mode enum ask|plan|regular|yolo, permission-layer precedence and existing mutation classifier. mutation_class must equal the existing classifier output for the original parsed tool/provider invocation; this unit invents no new mutation classes. The runtime computes requested/effective mode, inherited ceiling, permission snapshot and decision independently of model/tool fields; requires_approval=false never overrides Ask/Plan read-only or widens a parent ceiling. Parse -> schema -> ceiling -> synced ceiling receipt -> Permissions/FileSafe -> dispatch. block or require_approval cannot dispatch; allow alone still cannot bypass the later Permissions/FileSafe checks. At least one genuine tool_call_ref or provider_message_ref resolves this invocation. block/require_approval has a non-null owner reason; allow has null reason. EventRecord attempt/run/time join the original receipt, created_at_utc=occurred_at_utc; Storage owns persistence timestamps. A derived by-attempt projection is the PS-mandated inspection surface and can never authorize an invocation or reconstruct a lost original ceiling receipt.

  3. Producer and publication. Only `RuntimeAutonomyCeiling.check_after_parse@1.0.0` may prepare this exact fact after the actual owner gate. Immutable original input and original owner operation identity are captured before calling helpers. The owner source/body commit (where this fact reports an independently committed source) precedes append. Explicitly adopt SP-286 and CV-339 `storage.first_append_receipt.resolve.v2`: actual original complete EventRecord/semantic input in the same Storage instance resolves the original eleven-field AppendReceipt, original four-field result and exact original wire/full-value commitments. Source commit -> body/pack durability -> family append -> original synced first receipt -> publication is the order. Mutation-authorizing, graph-lock and UI-waited receipts are barrier-class under SP-336/SP-347; no downstream mutation passes the receipt boundary. Missing acknowledgement stays fenced; neither tail absence nor caller flags prove never-issued. With no independent durable source, append is the canonical body commit, never an invented prior canonical value.

  4. Closed payload. `Plans/event_payloads/w3f/autonomy_ceiling_checked.schema.json` is the family's complete, independently closed 1.0.0 resolved-body schema. Every required-present nullable field remains present. Exact type precedes value comparisons (boolean is not integer; string booleans/numbers/null/arrays/objects never coerce). Every identifier/digest full-matches including trailing-LF rejection. Format annotations are enforced by the reviewed shared timestamp profile, not a silently skipped JSON Schema format. An unresolved $ref in any branch refuses schema installation eagerly.

  5. Scope and identity. This family's candidate payload is `pm.event_payload.autonomy.ceiling_checked.v1@1.0.0` at `Plans/event_payloads/w3f/autonomy_ceiling_checked.schema.json`. The schema closes the resolved body, not a new envelope. Adopt `Plans/Contracts_V0.md#EventRecord`, CV-317 and CV-366 by name. Match context.scope_kind/project_id/thread_id to EventRecord and actual accepted owner context; the genuine owning Server/Host/root/worktree/remote joins must all agree. No focus fallback, empty Project, hidden root, cross-Server or cross-thread substitution. Project scope uses Storage's exact `project~{base64url_no_pad(UTF8(project_id))}` partition; application scope is `app`, project_id null and an actual owning Server/Host. Discovery additionally requires its real thread/admitted root under T-161; prompts require their actual target thread under CV-314. Other thread/root/worktree/remote refs are present only when the genuine operation has them; no working root is invented for a rootless inbox or non-file invocation. owner_operation_id equals the genuine original receipt_id for this one parsed invocation and policy decision; attempt_id alone never dedupes multiple checks. Receipt IDs cannot be reminted by model output, retry, or restore. owner_operation_id is exactly the original receipt_id. event_id is `evt_w3f_` plus lowercase SHA-256 of RFC 8785 JSON array of strings [actual storage_instance_id, Storage-owned recovery_epoch in its canonical decimal string form, actual scope_partition, exact event_type, owner_operation_id]. Application idempotency_key is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}` (lowercase hex of exact UTF-8); Project idempotency_key is `w3f:{event_type}:{hex(owner_operation_id)}`. All identity inputs, including the actual original Storage recovery_epoch, are frozen at first preparation and retained on every retry; a later restore/current epoch never remints the original. No timestamp/retry counter/focus or projection revision enters identity. Recompute expected identities from captured trusted original inputs, never a supplied digest. No numeric or timestamp code is owned here: producer-semantic digest and numeric/date-time qualification stay in EventRecord/CV-317/CV-339/SP-236 and the reviewed shared CV-1100/CV-1101/SP-1100/SP-1101 successors adopted in phase 2. Until those reviewed prerequisites and this family's admission exist the current writer is unavailable. No schema cap narrows Storage uint64.

  6. Replay and idempotency. Adopt the unchanged EventRecord producer_semantic_digest field set and SP-286 full-value comparison, never Storage-assigned sequence/timestamps as caller semantics. Current writer/retry uses dedupe_by_idempotency_key; normal append rejects projector_replay_only as replay_only_not_appendable even for an otherwise valid original. Same actual scoped key and original semantic body returns the actual original receipt/result and no second event/effect. Different body with that identity is idempotency_conflict; behind/unavailable dedupe is dedupe_unavailable. Rebuild/historical read uses the original authenticated recipe and cannot search, verify, execute, authorize, dispatch, charge Usage, notify or write canonical state. It never restarts a retention clock.

  7. Retention. `retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0`. Storage Case L-3 exact class applies: receipt/audit authority, indefinite and no count eviction, storage pressure fails closed. Discovery reset/disable never deletes the redacted durable receipt (SP-217, RAP-031). Original first-receipt/dedupe/source custody keeps its own policy; every actual hold/reference/backup dependency applies. No body-dereference grant follows from event retention. G15/G23/G26 recommendations in the recount are leads only, not name-based assignments. No new lifetime or deletion rule is chosen here.

  8. Redaction and custody. Seglog is the only canonical event history; original full-value first-receipt custody belongs to SP-286/CV-339 and survives coherent mandatory backup with referenced payload packs, original identity/recipe and recovery controls. Redb/index/GUI/caches never reconstruct lost canonical authority. Keep original accepted input values stable in the live owner operation until its first append settles; there is no newly durable pending-operation journal. On process loss resolve only an actual known original identity; a missing/uncertain source or receipt is unavailable, never permission to mint a replacement. A separately accepted new operation has a genuinely new owner identity, never relabelled restored/retried work. On a verified older restore no omitted request is automatically resumed. Discovery source_receipt_ref may be null when there was no independent existing receipt; a self-reference is not independent custody. Trusted original append/admission custody, not retention of mutable request caches, authenticates valid historical bytes. Every read resolves current access/deletion/tombstone/hold authority for the exact source and checks it again immediately before disclosure; retention/hold never restores visibility. Raw prompts/queries/hidden paths/provider content/credentials/SSH secrets never enter this body; refs are opaque owner-issued objects, never substitute capability. Bodies above SP-337's 16 KiB inline limit use its BLAKE3/size/media payload reference, exact pack bytes durable before referencing acknowledgement. Validate the resolved complete body. Measure every stored part, including any redb value, against storage_profile.value_limit_bytes; externalizing the body never exempts another part from its limit. For a value without an admitted large-value shape, fail that write/advance closed rather than invent a pointer codec.

  9. Transitions and ordering. Use only this family's semantic predicates in paragraph 2. Source identity, state, policy, exact payload, full-value custody and current writer admission must all remain valid at the final append boundary after all helpers; otherwise zero new effect. Per-source actual causal order is preserved through EventRecord sequence and original causation. No timestamp-based dedupe or inferred cross-node order overrides the envelope owner. Historical readers verify the original lawful fact without demanding today's live state. A duplicate is an original-result read, never another transition.

  10. Consumers/checkpoints. This family explicitly adopts `SP-1450` and SP-278 `reader.storage.event_record_index@1.0.0`, including its nine-field durable token (DL-076), full ten-field live read transaction token and no persisted redb_snapshot_id. Operating read consumer is `reader.autonomy.ceiling_checked@1.0.0`; its source/selector/currentness and custody rules are exact-family, not borrowed from another row. Its mandated inspection projection, projector and CAS checkpoint are independently closed in SP-1450; projection/receipt presence never authorizes execution.

  11. Compatibility and withdrawal. Current writes require this exact family/version/schema/source grant and normal replay policy; unknown future versions are unavailable. No deployed predecessor payload or family-specific converter was found; preserve any genuinely admitted historical envelope through its original verified registry revision and schema/number/time recipe, never relabel it 1.0.0 or rerun current live-state guards. A caller-controlled recipe/version cannot select history. At withdrawal the actual family registry cutoff fences this producer before append (including retry); existing SP-286 original receipt reads remain read-only. Stop new reads/materialization for a withdrawn schema/reader, invalidate its in-flight authority lease, and fence any affected derived generation. StorageMigrationCoordinator installs a separately reviewed successor codec/reader and rebuilds only derived state from the still admitted canonical source under SP-278; it publishes the new reader/generation atomically before reads resume. No source rewrite, schema URI rebind, original receipt reconstruction, native effect or silent upgrade. A malformed/withdrawn/foreign retained record is refused; valid retained history may be read after the current live object changes, with current disclosure controls. Phase 2 must test both directions.

  12. Oracles. `Plans/w3f_event_oracle_plan.json` holds this family's predicate inventory. Phase 2 (2026-11-13) implements it as the executable synthetic checker `scripts/pm_w3f_event_oracles.py`: every refusal is one named single-predicate row of a generated Method B guard table (`scripts/pm_w3f_table_*.py`), proved by the gated shared `scripts/pm_guard_isolation.py` through `scripts/pm-w3f-guard-tables.py`; rows no input can refuse first stay alone in their own table with a written proof. Its complete positives and one-defect negatives are `Plans/w3f_event_fixtures.json` (built by `scripts/pm-w3f-cases.py`), and Storage's sealed write custody stand-in for SP-1101 retained reads is `Plans/w3f_original_custody.json`. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 `date_time` with each field's owner profile; no lane serializer, cap or timestamp grammar is added. This is synthetic oracle evidence only: native work, writer admission and membership stay NOT_RUN/ABSENT.
gui_related: false
gui_classification_reason: Event storage, identity and custody contract; visual presentation belongs to existing
  owners.
depends_on:
- CV-317
- CV-339
- CV-366
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens:
- autonomy.ceiling_checked@1.0.0
- reports/event-authority-20261105/W3F-search.json
- autonomy.ceiling_checked
- f9c5de6561dff0a53a48e530f2a5c6804a7e941d
- event-family-autonomy-ceiling-checked
- RuntimeAutonomyCeiling.check_after_parse@1.0.0
- storage.first_append_receipt.resolve.v2
- Plans/event_payloads/w3f/autonomy_ceiling_checked.schema.json
- pm.event_payload.autonomy.ceiling_checked.v1@1.0.0
- Plans/event_payloads/w3f/autonomy_ceiling_checked.schema.json
- Plans/Contracts_V0.md#EventRecord
- project~{base64url_no_pad(UTF8(project_id))}
- app
- evt_w3f_
- application@1:{hex(server_id)}:{hex(owner_operation_id)}
- w3f:{event_type}:{hex(owner_operation_id)}
- retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0
- SP-1450
- reader.storage.event_record_index@1.0.0
- reader.autonomy.ceiling_checked@1.0.0
- Plans/w3f_event_oracle_plan.json
- scripts/pm_guard_isolation.py
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```

### CV-1451 - discovery.backpressure Resolved Payload And Owner Contract

```yaml
plan_unit_id: CV-1451
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract for `discovery.backpressure@1.0.0`; search/reuse evidence: `reports/event-authority-20261105/W3F-search.json` entry `discovery.backpressure`, base `f9c5de6561dff0a53a48e530f2a5c6804a7e941d`. Existing definitions reused: CV-291; T-161/T-162/T-163; SP-217; RAP-031. The family is prepared without admission; membership is ABSENT, never inferred from this unit or its schema. The family candidate id is `event-family-discovery-backpressure`.

  2. Owner and semantic boundary. records one actually reached resource-cap degradation/refusal; never creates a search result or execution authority. fallback_state=backpressure and error_code=backpressure; budget and elapsed come from the original scheduler observation, not a fabricated retry. Reuse CV-291 exact enums and receipt minima, T-161 request/result identity, SP-217 cache isolation, and RAP-031 redacted browsing. query_digest is lowercase SHA-256 of RFC 8785 JSON array [request_id, exact query_text] from the original authorized transient request; no raw query or hidden path persists. candidate_count and selected IDs are independently derived from the genuine post-policy snapshot. Present-null cache_versions is allowed only when no cache was used; otherwise all five original versions/hashes join, as does source_index_generation. ssh_trust is present-null only for a non-SSH request; SSH joins the actual host identity, current trust and same permission snapshot before use. Exact verification uses the existing verifier receipt, never a discovery score. This newly authored technical binding grants no extra search, trust, permission, merge of physical indexes or deletion behavior.

  3. Producer and publication. Only `DiscoveryService resource scheduler@1.0.0` may prepare this exact fact after the actual owner gate. Immutable original input and original owner operation identity are captured before calling helpers. The owner source/body commit (where this fact reports an independently committed source) precedes append. Explicitly adopt SP-286 and CV-339 `storage.first_append_receipt.resolve.v2`: actual original complete EventRecord/semantic input in the same Storage instance resolves the original eleven-field AppendReceipt, original four-field result and exact original wire/full-value commitments. Source commit -> body/pack durability -> family append -> original synced first receipt -> publication is the order. Mutation-authorizing, graph-lock and UI-waited receipts are barrier-class under SP-336/SP-347; no downstream mutation passes the receipt boundary. Missing acknowledgement stays fenced; neither tail absence nor caller flags prove never-issued. With no independent durable source, append is the canonical body commit, never an invented prior canonical value.

  4. Closed payload. `Plans/event_payloads/w3f/discovery_backpressure.schema.json` is the family's complete, independently closed 1.0.0 resolved-body schema. Every required-present nullable field remains present. Exact type precedes value comparisons (boolean is not integer; string booleans/numbers/null/arrays/objects never coerce). Every identifier/digest full-matches including trailing-LF rejection. Format annotations are enforced by the reviewed shared timestamp profile, not a silently skipped JSON Schema format. An unresolved $ref in any branch refuses schema installation eagerly.

  5. Scope and identity. This family's candidate payload is `pm.event_payload.discovery.backpressure.v1@1.0.0` at `Plans/event_payloads/w3f/discovery_backpressure.schema.json`. The schema closes the resolved body, not a new envelope. Adopt `Plans/Contracts_V0.md#EventRecord`, CV-317 and CV-366 by name. Match context.scope_kind/project_id/thread_id to EventRecord and actual accepted owner context; the genuine owning Server/Host/root/worktree/remote joins must all agree. No focus fallback, empty Project, hidden root, cross-Server or cross-thread substitution. Project scope uses Storage's exact `project~{base64url_no_pad(UTF8(project_id))}` partition; application scope is `app`, project_id null and an actual owning Server/Host. Discovery additionally requires its real thread/admitted root under T-161; prompts require their actual target thread under CV-314. Other thread/root/worktree/remote refs are present only when the genuine operation has them; no working root is invented for a rootless inbox or non-file invocation. owner_operation_id equals the original receipt_id, allocated once when this exact receipt fact is accepted and retained across retry; distinct selections/verification/fallback observations have their genuine distinct original receipt IDs. request_id alone is not the event identity. owner_operation_id is exactly the original receipt_id. event_id is `evt_w3f_` plus lowercase SHA-256 of RFC 8785 JSON array of strings [actual storage_instance_id, Storage-owned recovery_epoch in its canonical decimal string form, actual scope_partition, exact event_type, owner_operation_id]. Application idempotency_key is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}` (lowercase hex of exact UTF-8); Project idempotency_key is `w3f:{event_type}:{hex(owner_operation_id)}`. All identity inputs, including the actual original Storage recovery_epoch, are frozen at first preparation and retained on every retry; a later restore/current epoch never remints the original. No timestamp/retry counter/focus or projection revision enters identity. Recompute expected identities from captured trusted original inputs, never a supplied digest. No numeric or timestamp code is owned here: producer-semantic digest and numeric/date-time qualification stay in EventRecord/CV-317/CV-339/SP-236 and the reviewed shared CV-1100/CV-1101/SP-1100/SP-1101 successors adopted in phase 2. Until those reviewed prerequisites and this family's admission exist the current writer is unavailable. No schema cap narrows Storage uint64.

  6. Replay and idempotency. Adopt the unchanged EventRecord producer_semantic_digest field set and SP-286 full-value comparison, never Storage-assigned sequence/timestamps as caller semantics. Current writer/retry uses dedupe_by_idempotency_key; normal append rejects projector_replay_only as replay_only_not_appendable even for an otherwise valid original. Same actual scoped key and original semantic body returns the actual original receipt/result and no second event/effect. Different body with that identity is idempotency_conflict; behind/unavailable dedupe is dedupe_unavailable. Rebuild/historical read uses the original authenticated recipe and cannot search, verify, execute, authorize, dispatch, charge Usage, notify or write canonical state. It never restarts a retention clock.

  7. Retention. `retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0`. Storage Case L-3 exact class applies: receipt/audit authority, indefinite and no count eviction, storage pressure fails closed. Discovery reset/disable never deletes the redacted durable receipt (SP-217, RAP-031). Original first-receipt/dedupe/source custody keeps its own policy; every actual hold/reference/backup dependency applies. No body-dereference grant follows from event retention. G15/G23/G26 recommendations in the recount are leads only, not name-based assignments. No new lifetime or deletion rule is chosen here.

  8. Redaction and custody. Seglog is the only canonical event history; original full-value first-receipt custody belongs to SP-286/CV-339 and survives coherent mandatory backup with referenced payload packs, original identity/recipe and recovery controls. Redb/index/GUI/caches never reconstruct lost canonical authority. Keep original accepted input values stable in the live owner operation until its first append settles; there is no newly durable pending-operation journal. On process loss resolve only an actual known original identity; a missing/uncertain source or receipt is unavailable, never permission to mint a replacement. A separately accepted new operation has a genuinely new owner identity, never relabelled restored/retried work. On a verified older restore no omitted request is automatically resumed. Discovery source_receipt_ref may be null when there was no independent existing receipt; a self-reference is not independent custody. Trusted original append/admission custody, not retention of mutable request caches, authenticates valid historical bytes. Every read resolves current access/deletion/tombstone/hold authority for the exact source and checks it again immediately before disclosure; retention/hold never restores visibility. Raw prompts/queries/hidden paths/provider content/credentials/SSH secrets never enter this body; refs are opaque owner-issued objects, never substitute capability. Bodies above SP-337's 16 KiB inline limit use its BLAKE3/size/media payload reference, exact pack bytes durable before referencing acknowledgement. Validate the resolved complete body. Measure every stored part, including any redb value, against storage_profile.value_limit_bytes; externalizing the body never exempts another part from its limit. For a value without an admitted large-value shape, fail that write/advance closed rather than invent a pointer codec.

  9. Transitions and ordering. Use only this family's semantic predicates in paragraph 2. Source identity, state, policy, exact payload, full-value custody and current writer admission must all remain valid at the final append boundary after all helpers; otherwise zero new effect. Per-source actual causal order is preserved through EventRecord sequence and original causation. No timestamp-based dedupe or inferred cross-node order overrides the envelope owner. Historical readers verify the original lawful fact without demanding today's live state. A duplicate is an original-result read, never another transition.

  10. Consumers/checkpoints. This family explicitly adopts `SP-1451` and SP-278 `reader.storage.event_record_index@1.0.0`, including its nine-field durable token (DL-076), full ten-field live read transaction token and no persisted redb_snapshot_id. Operating read consumer is `reader.discovery.backpressure@1.0.0`; its source/selector/currentness and custody rules are exact-family, not borrowed from another row. Family checkpoint disposition is none_required: this consumer owns no durable projection, cursor, receipt, acknowledgement, cache or advance. Only the generic independently published SP-278 checkpoint advances; read/interruption/retry leaves no family-owned effect. No family CAS is applicable because there is no durable advance. The output is one in-memory, bounded, original-family observation after final source/token/access revalidation.

  11. Compatibility and withdrawal. Current writes require this exact family/version/schema/source grant and normal replay policy; unknown future versions are unavailable. No deployed predecessor payload or family-specific converter was found; preserve any genuinely admitted historical envelope through its original verified registry revision and schema/number/time recipe, never relabel it 1.0.0 or rerun current live-state guards. A caller-controlled recipe/version cannot select history. At withdrawal the actual family registry cutoff fences this producer before append (including retry); existing SP-286 original receipt reads remain read-only. Stop new reads/materialization for a withdrawn schema/reader, invalidate its in-flight authority lease, and fence any affected derived generation. StorageMigrationCoordinator installs a separately reviewed successor codec/reader and rebuilds only derived state from the still admitted canonical source under SP-278; it publishes the new reader/generation atomically before reads resume. No source rewrite, schema URI rebind, original receipt reconstruction, native effect or silent upgrade. A malformed/withdrawn/foreign retained record is refused; valid retained history may be read after the current live object changes, with current disclosure controls. Phase 2 must test both directions.

  12. Oracles. `Plans/w3f_event_oracle_plan.json` holds this family's predicate inventory. Phase 2 (2026-11-13) implements it as the executable synthetic checker `scripts/pm_w3f_event_oracles.py`: every refusal is one named single-predicate row of a generated Method B guard table (`scripts/pm_w3f_table_*.py`), proved by the gated shared `scripts/pm_guard_isolation.py` through `scripts/pm-w3f-guard-tables.py`; rows no input can refuse first stay alone in their own table with a written proof. Its complete positives and one-defect negatives are `Plans/w3f_event_fixtures.json` (built by `scripts/pm-w3f-cases.py`), and Storage's sealed write custody stand-in for SP-1101 retained reads is `Plans/w3f_original_custody.json`. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 `date_time` with each field's owner profile; no lane serializer, cap or timestamp grammar is added. This is synthetic oracle evidence only: native work, writer admission and membership stay NOT_RUN/ABSENT.
gui_related: false
gui_classification_reason: Event storage, identity and custody contract; visual presentation belongs to existing
  owners.
depends_on:
- CV-317
- CV-339
- CV-366
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens:
- discovery.backpressure@1.0.0
- reports/event-authority-20261105/W3F-search.json
- discovery.backpressure
- f9c5de6561dff0a53a48e530f2a5c6804a7e941d
- event-family-discovery-backpressure
- DiscoveryService resource scheduler@1.0.0
- storage.first_append_receipt.resolve.v2
- Plans/event_payloads/w3f/discovery_backpressure.schema.json
- pm.event_payload.discovery.backpressure.v1@1.0.0
- Plans/event_payloads/w3f/discovery_backpressure.schema.json
- Plans/Contracts_V0.md#EventRecord
- project~{base64url_no_pad(UTF8(project_id))}
- app
- evt_w3f_
- application@1:{hex(server_id)}:{hex(owner_operation_id)}
- w3f:{event_type}:{hex(owner_operation_id)}
- retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0
- SP-1451
- reader.storage.event_record_index@1.0.0
- reader.discovery.backpressure@1.0.0
- Plans/w3f_event_oracle_plan.json
- scripts/pm_guard_isolation.py
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```

### CV-1452 - discovery.candidates_returned Resolved Payload And Owner Contract

```yaml
plan_unit_id: CV-1452
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract for `discovery.candidates_returned@1.0.0`; search/reuse evidence: `reports/event-authority-20261105/W3F-search.json` entry `discovery.candidates_returned`, base `f9c5de6561dff0a53a48e530f2a5c6804a7e941d`. Existing definitions reused: CV-291; T-161/T-162/T-163; SP-217; RAP-031. The family is prepared without admission; membership is ABSENT, never inferred from this unit or its schema. The family candidate id is `event-family-discovery-candidates-returned`.

  2. Owner and semantic boundary. records the visible post-policy result set and its freshness. candidate_count equals only the permitted visible set; hidden/denied candidates never contribute to the count or selected IDs. Reuse CV-291 exact enums and receipt minima, T-161 request/result identity, SP-217 cache isolation, and RAP-031 redacted browsing. query_digest is lowercase SHA-256 of RFC 8785 JSON array [request_id, exact query_text] from the original authorized transient request; no raw query or hidden path persists. candidate_count and selected IDs are independently derived from the genuine post-policy snapshot. Present-null cache_versions is allowed only when no cache was used; otherwise all five original versions/hashes join, as does source_index_generation. ssh_trust is present-null only for a non-SSH request; SSH joins the actual host identity, current trust and same permission snapshot before use. Exact verification uses the existing verifier receipt, never a discovery score. This newly authored technical binding grants no extra search, trust, permission, merge of physical indexes or deletion behavior.

  3. Producer and publication. Only `DiscoveryService post-policy result publisher@1.0.0` may prepare this exact fact after the actual owner gate. Immutable original input and original owner operation identity are captured before calling helpers. The owner source/body commit (where this fact reports an independently committed source) precedes append. Explicitly adopt SP-286 and CV-339 `storage.first_append_receipt.resolve.v2`: actual original complete EventRecord/semantic input in the same Storage instance resolves the original eleven-field AppendReceipt, original four-field result and exact original wire/full-value commitments. Source commit -> body/pack durability -> family append -> original synced first receipt -> publication is the order. Mutation-authorizing, graph-lock and UI-waited receipts are barrier-class under SP-336/SP-347; no downstream mutation passes the receipt boundary. Missing acknowledgement stays fenced; neither tail absence nor caller flags prove never-issued. With no independent durable source, append is the canonical body commit, never an invented prior canonical value.

  4. Closed payload. `Plans/event_payloads/w3f/discovery_candidates_returned.schema.json` is the family's complete, independently closed 1.0.0 resolved-body schema. Every required-present nullable field remains present. Exact type precedes value comparisons (boolean is not integer; string booleans/numbers/null/arrays/objects never coerce). Every identifier/digest full-matches including trailing-LF rejection. Format annotations are enforced by the reviewed shared timestamp profile, not a silently skipped JSON Schema format. An unresolved $ref in any branch refuses schema installation eagerly.

  5. Scope and identity. This family's candidate payload is `pm.event_payload.discovery.candidates_returned.v1@1.0.0` at `Plans/event_payloads/w3f/discovery_candidates_returned.schema.json`. The schema closes the resolved body, not a new envelope. Adopt `Plans/Contracts_V0.md#EventRecord`, CV-317 and CV-366 by name. Match context.scope_kind/project_id/thread_id to EventRecord and actual accepted owner context; the genuine owning Server/Host/root/worktree/remote joins must all agree. No focus fallback, empty Project, hidden root, cross-Server or cross-thread substitution. Project scope uses Storage's exact `project~{base64url_no_pad(UTF8(project_id))}` partition; application scope is `app`, project_id null and an actual owning Server/Host. Discovery additionally requires its real thread/admitted root under T-161; prompts require their actual target thread under CV-314. Other thread/root/worktree/remote refs are present only when the genuine operation has them; no working root is invented for a rootless inbox or non-file invocation. owner_operation_id equals the original receipt_id, allocated once when this exact receipt fact is accepted and retained across retry; distinct selections/verification/fallback observations have their genuine distinct original receipt IDs. request_id alone is not the event identity. owner_operation_id is exactly the original receipt_id. event_id is `evt_w3f_` plus lowercase SHA-256 of RFC 8785 JSON array of strings [actual storage_instance_id, Storage-owned recovery_epoch in its canonical decimal string form, actual scope_partition, exact event_type, owner_operation_id]. Application idempotency_key is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}` (lowercase hex of exact UTF-8); Project idempotency_key is `w3f:{event_type}:{hex(owner_operation_id)}`. All identity inputs, including the actual original Storage recovery_epoch, are frozen at first preparation and retained on every retry; a later restore/current epoch never remints the original. No timestamp/retry counter/focus or projection revision enters identity. Recompute expected identities from captured trusted original inputs, never a supplied digest. No numeric or timestamp code is owned here: producer-semantic digest and numeric/date-time qualification stay in EventRecord/CV-317/CV-339/SP-236 and the reviewed shared CV-1100/CV-1101/SP-1100/SP-1101 successors adopted in phase 2. Until those reviewed prerequisites and this family's admission exist the current writer is unavailable. No schema cap narrows Storage uint64.

  6. Replay and idempotency. Adopt the unchanged EventRecord producer_semantic_digest field set and SP-286 full-value comparison, never Storage-assigned sequence/timestamps as caller semantics. Current writer/retry uses dedupe_by_idempotency_key; normal append rejects projector_replay_only as replay_only_not_appendable even for an otherwise valid original. Same actual scoped key and original semantic body returns the actual original receipt/result and no second event/effect. Different body with that identity is idempotency_conflict; behind/unavailable dedupe is dedupe_unavailable. Rebuild/historical read uses the original authenticated recipe and cannot search, verify, execute, authorize, dispatch, charge Usage, notify or write canonical state. It never restarts a retention clock.

  7. Retention. `retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0`. Storage Case L-3 exact class applies: receipt/audit authority, indefinite and no count eviction, storage pressure fails closed. Discovery reset/disable never deletes the redacted durable receipt (SP-217, RAP-031). Original first-receipt/dedupe/source custody keeps its own policy; every actual hold/reference/backup dependency applies. No body-dereference grant follows from event retention. G15/G23/G26 recommendations in the recount are leads only, not name-based assignments. No new lifetime or deletion rule is chosen here.

  8. Redaction and custody. Seglog is the only canonical event history; original full-value first-receipt custody belongs to SP-286/CV-339 and survives coherent mandatory backup with referenced payload packs, original identity/recipe and recovery controls. Redb/index/GUI/caches never reconstruct lost canonical authority. Keep original accepted input values stable in the live owner operation until its first append settles; there is no newly durable pending-operation journal. On process loss resolve only an actual known original identity; a missing/uncertain source or receipt is unavailable, never permission to mint a replacement. A separately accepted new operation has a genuinely new owner identity, never relabelled restored/retried work. On a verified older restore no omitted request is automatically resumed. Discovery source_receipt_ref may be null when there was no independent existing receipt; a self-reference is not independent custody. Trusted original append/admission custody, not retention of mutable request caches, authenticates valid historical bytes. Every read resolves current access/deletion/tombstone/hold authority for the exact source and checks it again immediately before disclosure; retention/hold never restores visibility. Raw prompts/queries/hidden paths/provider content/credentials/SSH secrets never enter this body; refs are opaque owner-issued objects, never substitute capability. Bodies above SP-337's 16 KiB inline limit use its BLAKE3/size/media payload reference, exact pack bytes durable before referencing acknowledgement. Validate the resolved complete body. Measure every stored part, including any redb value, against storage_profile.value_limit_bytes; externalizing the body never exempts another part from its limit. For a value without an admitted large-value shape, fail that write/advance closed rather than invent a pointer codec.

  9. Transitions and ordering. Use only this family's semantic predicates in paragraph 2. Source identity, state, policy, exact payload, full-value custody and current writer admission must all remain valid at the final append boundary after all helpers; otherwise zero new effect. Per-source actual causal order is preserved through EventRecord sequence and original causation. No timestamp-based dedupe or inferred cross-node order overrides the envelope owner. Historical readers verify the original lawful fact without demanding today's live state. A duplicate is an original-result read, never another transition.

  10. Consumers/checkpoints. This family explicitly adopts `SP-1452` and SP-278 `reader.storage.event_record_index@1.0.0`, including its nine-field durable token (DL-076), full ten-field live read transaction token and no persisted redb_snapshot_id. Operating read consumer is `reader.discovery.candidates_returned@1.0.0`; its source/selector/currentness and custody rules are exact-family, not borrowed from another row. Family checkpoint disposition is none_required: this consumer owns no durable projection, cursor, receipt, acknowledgement, cache or advance. Only the generic independently published SP-278 checkpoint advances; read/interruption/retry leaves no family-owned effect. No family CAS is applicable because there is no durable advance. The output is one in-memory, bounded, original-family observation after final source/token/access revalidation.

  11. Compatibility and withdrawal. Current writes require this exact family/version/schema/source grant and normal replay policy; unknown future versions are unavailable. No deployed predecessor payload or family-specific converter was found; preserve any genuinely admitted historical envelope through its original verified registry revision and schema/number/time recipe, never relabel it 1.0.0 or rerun current live-state guards. A caller-controlled recipe/version cannot select history. At withdrawal the actual family registry cutoff fences this producer before append (including retry); existing SP-286 original receipt reads remain read-only. Stop new reads/materialization for a withdrawn schema/reader, invalidate its in-flight authority lease, and fence any affected derived generation. StorageMigrationCoordinator installs a separately reviewed successor codec/reader and rebuilds only derived state from the still admitted canonical source under SP-278; it publishes the new reader/generation atomically before reads resume. No source rewrite, schema URI rebind, original receipt reconstruction, native effect or silent upgrade. A malformed/withdrawn/foreign retained record is refused; valid retained history may be read after the current live object changes, with current disclosure controls. Phase 2 must test both directions.

  12. Oracles. `Plans/w3f_event_oracle_plan.json` holds this family's predicate inventory. Phase 2 (2026-11-13) implements it as the executable synthetic checker `scripts/pm_w3f_event_oracles.py`: every refusal is one named single-predicate row of a generated Method B guard table (`scripts/pm_w3f_table_*.py`), proved by the gated shared `scripts/pm_guard_isolation.py` through `scripts/pm-w3f-guard-tables.py`; rows no input can refuse first stay alone in their own table with a written proof. Its complete positives and one-defect negatives are `Plans/w3f_event_fixtures.json` (built by `scripts/pm-w3f-cases.py`), and Storage's sealed write custody stand-in for SP-1101 retained reads is `Plans/w3f_original_custody.json`. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 `date_time` with each field's owner profile; no lane serializer, cap or timestamp grammar is added. This is synthetic oracle evidence only: native work, writer admission and membership stay NOT_RUN/ABSENT.
gui_related: false
gui_classification_reason: Event storage, identity and custody contract; visual presentation belongs to existing
  owners.
depends_on:
- CV-317
- CV-339
- CV-366
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens:
- discovery.candidates_returned@1.0.0
- reports/event-authority-20261105/W3F-search.json
- discovery.candidates_returned
- f9c5de6561dff0a53a48e530f2a5c6804a7e941d
- event-family-discovery-candidates-returned
- DiscoveryService post-policy result publisher@1.0.0
- storage.first_append_receipt.resolve.v2
- Plans/event_payloads/w3f/discovery_candidates_returned.schema.json
- pm.event_payload.discovery.candidates_returned.v1@1.0.0
- Plans/event_payloads/w3f/discovery_candidates_returned.schema.json
- Plans/Contracts_V0.md#EventRecord
- project~{base64url_no_pad(UTF8(project_id))}
- app
- evt_w3f_
- application@1:{hex(server_id)}:{hex(owner_operation_id)}
- w3f:{event_type}:{hex(owner_operation_id)}
- retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0
- SP-1452
- reader.storage.event_record_index@1.0.0
- reader.discovery.candidates_returned@1.0.0
- Plans/w3f_event_oracle_plan.json
- scripts/pm_guard_isolation.py
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```

### CV-1453 - discovery.disabled Resolved Payload And Owner Contract

```yaml
plan_unit_id: CV-1453
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract for `discovery.disabled@1.0.0`; search/reuse evidence: `reports/event-authority-20261105/W3F-search.json` entry `discovery.disabled`, base `f9c5de6561dff0a53a48e530f2a5c6804a7e941d`. Existing definitions reused: CV-291; T-161/T-162/T-163; SP-217; RAP-031. The family is prepared without admission; membership is ABSENT, never inferred from this unit or its schema. The family candidate id is `event-family-discovery-disabled`.

  2. Owner and semantic boundary. records an actual disabled discovery refusal/degradation. fallback_state=disabled and error_code=discovery_disabled; no index query executes after this refusal. Reuse CV-291 exact enums and receipt minima, T-161 request/result identity, SP-217 cache isolation, and RAP-031 redacted browsing. query_digest is lowercase SHA-256 of RFC 8785 JSON array [request_id, exact query_text] from the original authorized transient request; no raw query or hidden path persists. candidate_count and selected IDs are independently derived from the genuine post-policy snapshot. Present-null cache_versions is allowed only when no cache was used; otherwise all five original versions/hashes join, as does source_index_generation. ssh_trust is present-null only for a non-SSH request; SSH joins the actual host identity, current trust and same permission snapshot before use. Exact verification uses the existing verifier receipt, never a discovery score. This newly authored technical binding grants no extra search, trust, permission, merge of physical indexes or deletion behavior.

  3. Producer and publication. Only `DiscoveryService enable/kill-switch gate@1.0.0` may prepare this exact fact after the actual owner gate. Immutable original input and original owner operation identity are captured before calling helpers. The owner source/body commit (where this fact reports an independently committed source) precedes append. Explicitly adopt SP-286 and CV-339 `storage.first_append_receipt.resolve.v2`: actual original complete EventRecord/semantic input in the same Storage instance resolves the original eleven-field AppendReceipt, original four-field result and exact original wire/full-value commitments. Source commit -> body/pack durability -> family append -> original synced first receipt -> publication is the order. Mutation-authorizing, graph-lock and UI-waited receipts are barrier-class under SP-336/SP-347; no downstream mutation passes the receipt boundary. Missing acknowledgement stays fenced; neither tail absence nor caller flags prove never-issued. With no independent durable source, append is the canonical body commit, never an invented prior canonical value.

  4. Closed payload. `Plans/event_payloads/w3f/discovery_disabled.schema.json` is the family's complete, independently closed 1.0.0 resolved-body schema. Every required-present nullable field remains present. Exact type precedes value comparisons (boolean is not integer; string booleans/numbers/null/arrays/objects never coerce). Every identifier/digest full-matches including trailing-LF rejection. Format annotations are enforced by the reviewed shared timestamp profile, not a silently skipped JSON Schema format. An unresolved $ref in any branch refuses schema installation eagerly.

  5. Scope and identity. This family's candidate payload is `pm.event_payload.discovery.disabled.v1@1.0.0` at `Plans/event_payloads/w3f/discovery_disabled.schema.json`. The schema closes the resolved body, not a new envelope. Adopt `Plans/Contracts_V0.md#EventRecord`, CV-317 and CV-366 by name. Match context.scope_kind/project_id/thread_id to EventRecord and actual accepted owner context; the genuine owning Server/Host/root/worktree/remote joins must all agree. No focus fallback, empty Project, hidden root, cross-Server or cross-thread substitution. Project scope uses Storage's exact `project~{base64url_no_pad(UTF8(project_id))}` partition; application scope is `app`, project_id null and an actual owning Server/Host. Discovery additionally requires its real thread/admitted root under T-161; prompts require their actual target thread under CV-314. Other thread/root/worktree/remote refs are present only when the genuine operation has them; no working root is invented for a rootless inbox or non-file invocation. owner_operation_id equals the original receipt_id, allocated once when this exact receipt fact is accepted and retained across retry; distinct selections/verification/fallback observations have their genuine distinct original receipt IDs. request_id alone is not the event identity. owner_operation_id is exactly the original receipt_id. event_id is `evt_w3f_` plus lowercase SHA-256 of RFC 8785 JSON array of strings [actual storage_instance_id, Storage-owned recovery_epoch in its canonical decimal string form, actual scope_partition, exact event_type, owner_operation_id]. Application idempotency_key is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}` (lowercase hex of exact UTF-8); Project idempotency_key is `w3f:{event_type}:{hex(owner_operation_id)}`. All identity inputs, including the actual original Storage recovery_epoch, are frozen at first preparation and retained on every retry; a later restore/current epoch never remints the original. No timestamp/retry counter/focus or projection revision enters identity. Recompute expected identities from captured trusted original inputs, never a supplied digest. No numeric or timestamp code is owned here: producer-semantic digest and numeric/date-time qualification stay in EventRecord/CV-317/CV-339/SP-236 and the reviewed shared CV-1100/CV-1101/SP-1100/SP-1101 successors adopted in phase 2. Until those reviewed prerequisites and this family's admission exist the current writer is unavailable. No schema cap narrows Storage uint64.

  6. Replay and idempotency. Adopt the unchanged EventRecord producer_semantic_digest field set and SP-286 full-value comparison, never Storage-assigned sequence/timestamps as caller semantics. Current writer/retry uses dedupe_by_idempotency_key; normal append rejects projector_replay_only as replay_only_not_appendable even for an otherwise valid original. Same actual scoped key and original semantic body returns the actual original receipt/result and no second event/effect. Different body with that identity is idempotency_conflict; behind/unavailable dedupe is dedupe_unavailable. Rebuild/historical read uses the original authenticated recipe and cannot search, verify, execute, authorize, dispatch, charge Usage, notify or write canonical state. It never restarts a retention clock.

  7. Retention. `retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0`. Storage Case L-3 exact class applies: receipt/audit authority, indefinite and no count eviction, storage pressure fails closed. Discovery reset/disable never deletes the redacted durable receipt (SP-217, RAP-031). Original first-receipt/dedupe/source custody keeps its own policy; every actual hold/reference/backup dependency applies. No body-dereference grant follows from event retention. G15/G23/G26 recommendations in the recount are leads only, not name-based assignments. No new lifetime or deletion rule is chosen here.

  8. Redaction and custody. Seglog is the only canonical event history; original full-value first-receipt custody belongs to SP-286/CV-339 and survives coherent mandatory backup with referenced payload packs, original identity/recipe and recovery controls. Redb/index/GUI/caches never reconstruct lost canonical authority. Keep original accepted input values stable in the live owner operation until its first append settles; there is no newly durable pending-operation journal. On process loss resolve only an actual known original identity; a missing/uncertain source or receipt is unavailable, never permission to mint a replacement. A separately accepted new operation has a genuinely new owner identity, never relabelled restored/retried work. On a verified older restore no omitted request is automatically resumed. Discovery source_receipt_ref may be null when there was no independent existing receipt; a self-reference is not independent custody. Trusted original append/admission custody, not retention of mutable request caches, authenticates valid historical bytes. Every read resolves current access/deletion/tombstone/hold authority for the exact source and checks it again immediately before disclosure; retention/hold never restores visibility. Raw prompts/queries/hidden paths/provider content/credentials/SSH secrets never enter this body; refs are opaque owner-issued objects, never substitute capability. Bodies above SP-337's 16 KiB inline limit use its BLAKE3/size/media payload reference, exact pack bytes durable before referencing acknowledgement. Validate the resolved complete body. Measure every stored part, including any redb value, against storage_profile.value_limit_bytes; externalizing the body never exempts another part from its limit. For a value without an admitted large-value shape, fail that write/advance closed rather than invent a pointer codec.

  9. Transitions and ordering. Use only this family's semantic predicates in paragraph 2. Source identity, state, policy, exact payload, full-value custody and current writer admission must all remain valid at the final append boundary after all helpers; otherwise zero new effect. Per-source actual causal order is preserved through EventRecord sequence and original causation. No timestamp-based dedupe or inferred cross-node order overrides the envelope owner. Historical readers verify the original lawful fact without demanding today's live state. A duplicate is an original-result read, never another transition.

  10. Consumers/checkpoints. This family explicitly adopts `SP-1453` and SP-278 `reader.storage.event_record_index@1.0.0`, including its nine-field durable token (DL-076), full ten-field live read transaction token and no persisted redb_snapshot_id. Operating read consumer is `reader.discovery.disabled@1.0.0`; its source/selector/currentness and custody rules are exact-family, not borrowed from another row. Family checkpoint disposition is none_required: this consumer owns no durable projection, cursor, receipt, acknowledgement, cache or advance. Only the generic independently published SP-278 checkpoint advances; read/interruption/retry leaves no family-owned effect. No family CAS is applicable because there is no durable advance. The output is one in-memory, bounded, original-family observation after final source/token/access revalidation.

  11. Compatibility and withdrawal. Current writes require this exact family/version/schema/source grant and normal replay policy; unknown future versions are unavailable. No deployed predecessor payload or family-specific converter was found; preserve any genuinely admitted historical envelope through its original verified registry revision and schema/number/time recipe, never relabel it 1.0.0 or rerun current live-state guards. A caller-controlled recipe/version cannot select history. At withdrawal the actual family registry cutoff fences this producer before append (including retry); existing SP-286 original receipt reads remain read-only. Stop new reads/materialization for a withdrawn schema/reader, invalidate its in-flight authority lease, and fence any affected derived generation. StorageMigrationCoordinator installs a separately reviewed successor codec/reader and rebuilds only derived state from the still admitted canonical source under SP-278; it publishes the new reader/generation atomically before reads resume. No source rewrite, schema URI rebind, original receipt reconstruction, native effect or silent upgrade. A malformed/withdrawn/foreign retained record is refused; valid retained history may be read after the current live object changes, with current disclosure controls. Phase 2 must test both directions.

  12. Oracles. `Plans/w3f_event_oracle_plan.json` holds this family's predicate inventory. Phase 2 (2026-11-13) implements it as the executable synthetic checker `scripts/pm_w3f_event_oracles.py`: every refusal is one named single-predicate row of a generated Method B guard table (`scripts/pm_w3f_table_*.py`), proved by the gated shared `scripts/pm_guard_isolation.py` through `scripts/pm-w3f-guard-tables.py`; rows no input can refuse first stay alone in their own table with a written proof. Its complete positives and one-defect negatives are `Plans/w3f_event_fixtures.json` (built by `scripts/pm-w3f-cases.py`), and Storage's sealed write custody stand-in for SP-1101 retained reads is `Plans/w3f_original_custody.json`. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 `date_time` with each field's owner profile; no lane serializer, cap or timestamp grammar is added. This is synthetic oracle evidence only: native work, writer admission and membership stay NOT_RUN/ABSENT.
gui_related: false
gui_classification_reason: Event storage, identity and custody contract; visual presentation belongs to existing
  owners.
depends_on:
- CV-317
- CV-339
- CV-366
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens:
- discovery.disabled@1.0.0
- reports/event-authority-20261105/W3F-search.json
- discovery.disabled
- f9c5de6561dff0a53a48e530f2a5c6804a7e941d
- event-family-discovery-disabled
- DiscoveryService enable/kill-switch gate@1.0.0
- storage.first_append_receipt.resolve.v2
- Plans/event_payloads/w3f/discovery_disabled.schema.json
- pm.event_payload.discovery.disabled.v1@1.0.0
- Plans/event_payloads/w3f/discovery_disabled.schema.json
- Plans/Contracts_V0.md#EventRecord
- project~{base64url_no_pad(UTF8(project_id))}
- app
- evt_w3f_
- application@1:{hex(server_id)}:{hex(owner_operation_id)}
- w3f:{event_type}:{hex(owner_operation_id)}
- retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0
- SP-1453
- reader.storage.event_record_index@1.0.0
- reader.discovery.disabled@1.0.0
- Plans/w3f_event_oracle_plan.json
- scripts/pm_guard_isolation.py
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```

### CV-1454 - discovery.fallback Resolved Payload And Owner Contract

```yaml
plan_unit_id: CV-1454
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract for `discovery.fallback@1.0.0`; search/reuse evidence: `reports/event-authority-20261105/W3F-search.json` entry `discovery.fallback`, base `f9c5de6561dff0a53a48e530f2a5c6804a7e941d`. Existing definitions reused: CV-291; T-161/T-162/T-163; SP-217; RAP-031. The family is prepared without admission; membership is ABSENT, never inferred from this unit or its schema. The family candidate id is `event-family-discovery-fallback`.

  2. Owner and semantic boundary. records an actually selected fallback path and reason. fallback_state is index_cold, stale_index, fallback_scan, remote_cache, ssh_manifest or over_budget, not none; existing permission/SSH trust still gates the selected route. Reuse CV-291 exact enums and receipt minima, T-161 request/result identity, SP-217 cache isolation, and RAP-031 redacted browsing. query_digest is lowercase SHA-256 of RFC 8785 JSON array [request_id, exact query_text] from the original authorized transient request; no raw query or hidden path persists. candidate_count and selected IDs are independently derived from the genuine post-policy snapshot. Present-null cache_versions is allowed only when no cache was used; otherwise all five original versions/hashes join, as does source_index_generation. ssh_trust is present-null only for a non-SSH request; SSH joins the actual host identity, current trust and same permission snapshot before use. Exact verification uses the existing verifier receipt, never a discovery score. This newly authored technical binding grants no extra search, trust, permission, merge of physical indexes or deletion behavior.

  3. Producer and publication. Only `DiscoveryService fallback resolver@1.0.0` may prepare this exact fact after the actual owner gate. Immutable original input and original owner operation identity are captured before calling helpers. The owner source/body commit (where this fact reports an independently committed source) precedes append. Explicitly adopt SP-286 and CV-339 `storage.first_append_receipt.resolve.v2`: actual original complete EventRecord/semantic input in the same Storage instance resolves the original eleven-field AppendReceipt, original four-field result and exact original wire/full-value commitments. Source commit -> body/pack durability -> family append -> original synced first receipt -> publication is the order. Mutation-authorizing, graph-lock and UI-waited receipts are barrier-class under SP-336/SP-347; no downstream mutation passes the receipt boundary. Missing acknowledgement stays fenced; neither tail absence nor caller flags prove never-issued. With no independent durable source, append is the canonical body commit, never an invented prior canonical value.

  4. Closed payload. `Plans/event_payloads/w3f/discovery_fallback.schema.json` is the family's complete, independently closed 1.0.0 resolved-body schema. Every required-present nullable field remains present. Exact type precedes value comparisons (boolean is not integer; string booleans/numbers/null/arrays/objects never coerce). Every identifier/digest full-matches including trailing-LF rejection. Format annotations are enforced by the reviewed shared timestamp profile, not a silently skipped JSON Schema format. An unresolved $ref in any branch refuses schema installation eagerly.

  5. Scope and identity. This family's candidate payload is `pm.event_payload.discovery.fallback.v1@1.0.0` at `Plans/event_payloads/w3f/discovery_fallback.schema.json`. The schema closes the resolved body, not a new envelope. Adopt `Plans/Contracts_V0.md#EventRecord`, CV-317 and CV-366 by name. Match context.scope_kind/project_id/thread_id to EventRecord and actual accepted owner context; the genuine owning Server/Host/root/worktree/remote joins must all agree. No focus fallback, empty Project, hidden root, cross-Server or cross-thread substitution. Project scope uses Storage's exact `project~{base64url_no_pad(UTF8(project_id))}` partition; application scope is `app`, project_id null and an actual owning Server/Host. Discovery additionally requires its real thread/admitted root under T-161; prompts require their actual target thread under CV-314. Other thread/root/worktree/remote refs are present only when the genuine operation has them; no working root is invented for a rootless inbox or non-file invocation. owner_operation_id equals the original receipt_id, allocated once when this exact receipt fact is accepted and retained across retry; distinct selections/verification/fallback observations have their genuine distinct original receipt IDs. request_id alone is not the event identity. owner_operation_id is exactly the original receipt_id. event_id is `evt_w3f_` plus lowercase SHA-256 of RFC 8785 JSON array of strings [actual storage_instance_id, Storage-owned recovery_epoch in its canonical decimal string form, actual scope_partition, exact event_type, owner_operation_id]. Application idempotency_key is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}` (lowercase hex of exact UTF-8); Project idempotency_key is `w3f:{event_type}:{hex(owner_operation_id)}`. All identity inputs, including the actual original Storage recovery_epoch, are frozen at first preparation and retained on every retry; a later restore/current epoch never remints the original. No timestamp/retry counter/focus or projection revision enters identity. Recompute expected identities from captured trusted original inputs, never a supplied digest. No numeric or timestamp code is owned here: producer-semantic digest and numeric/date-time qualification stay in EventRecord/CV-317/CV-339/SP-236 and the reviewed shared CV-1100/CV-1101/SP-1100/SP-1101 successors adopted in phase 2. Until those reviewed prerequisites and this family's admission exist the current writer is unavailable. No schema cap narrows Storage uint64.

  6. Replay and idempotency. Adopt the unchanged EventRecord producer_semantic_digest field set and SP-286 full-value comparison, never Storage-assigned sequence/timestamps as caller semantics. Current writer/retry uses dedupe_by_idempotency_key; normal append rejects projector_replay_only as replay_only_not_appendable even for an otherwise valid original. Same actual scoped key and original semantic body returns the actual original receipt/result and no second event/effect. Different body with that identity is idempotency_conflict; behind/unavailable dedupe is dedupe_unavailable. Rebuild/historical read uses the original authenticated recipe and cannot search, verify, execute, authorize, dispatch, charge Usage, notify or write canonical state. It never restarts a retention clock.

  7. Retention. `retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0`. Storage Case L-3 exact class applies: receipt/audit authority, indefinite and no count eviction, storage pressure fails closed. Discovery reset/disable never deletes the redacted durable receipt (SP-217, RAP-031). Original first-receipt/dedupe/source custody keeps its own policy; every actual hold/reference/backup dependency applies. No body-dereference grant follows from event retention. G15/G23/G26 recommendations in the recount are leads only, not name-based assignments. No new lifetime or deletion rule is chosen here.

  8. Redaction and custody. Seglog is the only canonical event history; original full-value first-receipt custody belongs to SP-286/CV-339 and survives coherent mandatory backup with referenced payload packs, original identity/recipe and recovery controls. Redb/index/GUI/caches never reconstruct lost canonical authority. Keep original accepted input values stable in the live owner operation until its first append settles; there is no newly durable pending-operation journal. On process loss resolve only an actual known original identity; a missing/uncertain source or receipt is unavailable, never permission to mint a replacement. A separately accepted new operation has a genuinely new owner identity, never relabelled restored/retried work. On a verified older restore no omitted request is automatically resumed. Discovery source_receipt_ref may be null when there was no independent existing receipt; a self-reference is not independent custody. Trusted original append/admission custody, not retention of mutable request caches, authenticates valid historical bytes. Every read resolves current access/deletion/tombstone/hold authority for the exact source and checks it again immediately before disclosure; retention/hold never restores visibility. Raw prompts/queries/hidden paths/provider content/credentials/SSH secrets never enter this body; refs are opaque owner-issued objects, never substitute capability. Bodies above SP-337's 16 KiB inline limit use its BLAKE3/size/media payload reference, exact pack bytes durable before referencing acknowledgement. Validate the resolved complete body. Measure every stored part, including any redb value, against storage_profile.value_limit_bytes; externalizing the body never exempts another part from its limit. For a value without an admitted large-value shape, fail that write/advance closed rather than invent a pointer codec.

  9. Transitions and ordering. Use only this family's semantic predicates in paragraph 2. Source identity, state, policy, exact payload, full-value custody and current writer admission must all remain valid at the final append boundary after all helpers; otherwise zero new effect. Per-source actual causal order is preserved through EventRecord sequence and original causation. No timestamp-based dedupe or inferred cross-node order overrides the envelope owner. Historical readers verify the original lawful fact without demanding today's live state. A duplicate is an original-result read, never another transition.

  10. Consumers/checkpoints. This family explicitly adopts `SP-1454` and SP-278 `reader.storage.event_record_index@1.0.0`, including its nine-field durable token (DL-076), full ten-field live read transaction token and no persisted redb_snapshot_id. Operating read consumer is `reader.discovery.fallback@1.0.0`; its source/selector/currentness and custody rules are exact-family, not borrowed from another row. Family checkpoint disposition is none_required: this consumer owns no durable projection, cursor, receipt, acknowledgement, cache or advance. Only the generic independently published SP-278 checkpoint advances; read/interruption/retry leaves no family-owned effect. No family CAS is applicable because there is no durable advance. The output is one in-memory, bounded, original-family observation after final source/token/access revalidation.

  11. Compatibility and withdrawal. Current writes require this exact family/version/schema/source grant and normal replay policy; unknown future versions are unavailable. No deployed predecessor payload or family-specific converter was found; preserve any genuinely admitted historical envelope through its original verified registry revision and schema/number/time recipe, never relabel it 1.0.0 or rerun current live-state guards. A caller-controlled recipe/version cannot select history. At withdrawal the actual family registry cutoff fences this producer before append (including retry); existing SP-286 original receipt reads remain read-only. Stop new reads/materialization for a withdrawn schema/reader, invalidate its in-flight authority lease, and fence any affected derived generation. StorageMigrationCoordinator installs a separately reviewed successor codec/reader and rebuilds only derived state from the still admitted canonical source under SP-278; it publishes the new reader/generation atomically before reads resume. No source rewrite, schema URI rebind, original receipt reconstruction, native effect or silent upgrade. A malformed/withdrawn/foreign retained record is refused; valid retained history may be read after the current live object changes, with current disclosure controls. Phase 2 must test both directions.

  12. Oracles. `Plans/w3f_event_oracle_plan.json` holds this family's predicate inventory. Phase 2 (2026-11-13) implements it as the executable synthetic checker `scripts/pm_w3f_event_oracles.py`: every refusal is one named single-predicate row of a generated Method B guard table (`scripts/pm_w3f_table_*.py`), proved by the gated shared `scripts/pm_guard_isolation.py` through `scripts/pm-w3f-guard-tables.py`; rows no input can refuse first stay alone in their own table with a written proof. Its complete positives and one-defect negatives are `Plans/w3f_event_fixtures.json` (built by `scripts/pm-w3f-cases.py`), and Storage's sealed write custody stand-in for SP-1101 retained reads is `Plans/w3f_original_custody.json`. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 `date_time` with each field's owner profile; no lane serializer, cap or timestamp grammar is added. This is synthetic oracle evidence only: native work, writer admission and membership stay NOT_RUN/ABSENT.
gui_related: false
gui_classification_reason: Event storage, identity and custody contract; visual presentation belongs to existing
  owners.
depends_on:
- CV-317
- CV-339
- CV-366
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens:
- discovery.fallback@1.0.0
- reports/event-authority-20261105/W3F-search.json
- discovery.fallback
- f9c5de6561dff0a53a48e530f2a5c6804a7e941d
- event-family-discovery-fallback
- DiscoveryService fallback resolver@1.0.0
- storage.first_append_receipt.resolve.v2
- Plans/event_payloads/w3f/discovery_fallback.schema.json
- pm.event_payload.discovery.fallback.v1@1.0.0
- Plans/event_payloads/w3f/discovery_fallback.schema.json
- Plans/Contracts_V0.md#EventRecord
- project~{base64url_no_pad(UTF8(project_id))}
- app
- evt_w3f_
- application@1:{hex(server_id)}:{hex(owner_operation_id)}
- w3f:{event_type}:{hex(owner_operation_id)}
- retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0
- SP-1454
- reader.storage.event_record_index@1.0.0
- reader.discovery.fallback@1.0.0
- Plans/w3f_event_oracle_plan.json
- scripts/pm_guard_isolation.py
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```

### CV-1455 - discovery.invoked Resolved Payload And Owner Contract

```yaml
plan_unit_id: CV-1455
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract for `discovery.invoked@1.0.0`; search/reuse evidence: `reports/event-authority-20261105/W3F-search.json` entry `discovery.invoked`, base `f9c5de6561dff0a53a48e530f2a5c6804a7e941d`. Existing definitions reused: CV-291; T-161/T-162/T-163; SP-217; RAP-031. The family is prepared without admission; membership is ABSENT, never inferred from this unit or its schema. The family candidate id is `event-family-discovery-invoked`.

  2. Owner and semantic boundary. records the accepted discovery request context before search. Receipt commits before the accepted search is published; invoked is not evidence of returned or verified content. Reuse CV-291 exact enums and receipt minima, T-161 request/result identity, SP-217 cache isolation, and RAP-031 redacted browsing. query_digest is lowercase SHA-256 of RFC 8785 JSON array [request_id, exact query_text] from the original authorized transient request; no raw query or hidden path persists. candidate_count and selected IDs are independently derived from the genuine post-policy snapshot. Present-null cache_versions is allowed only when no cache was used; otherwise all five original versions/hashes join, as does source_index_generation. ssh_trust is present-null only for a non-SSH request; SSH joins the actual host identity, current trust and same permission snapshot before use. Exact verification uses the existing verifier receipt, never a discovery score. This newly authored technical binding grants no extra search, trust, permission, merge of physical indexes or deletion behavior.

  3. Producer and publication. Only `DiscoveryService discover_paths admission@1.0.0` may prepare this exact fact after the actual owner gate. Immutable original input and original owner operation identity are captured before calling helpers. The owner source/body commit (where this fact reports an independently committed source) precedes append. Explicitly adopt SP-286 and CV-339 `storage.first_append_receipt.resolve.v2`: actual original complete EventRecord/semantic input in the same Storage instance resolves the original eleven-field AppendReceipt, original four-field result and exact original wire/full-value commitments. Source commit -> body/pack durability -> family append -> original synced first receipt -> publication is the order. Mutation-authorizing, graph-lock and UI-waited receipts are barrier-class under SP-336/SP-347; no downstream mutation passes the receipt boundary. Missing acknowledgement stays fenced; neither tail absence nor caller flags prove never-issued. With no independent durable source, append is the canonical body commit, never an invented prior canonical value.

  4. Closed payload. `Plans/event_payloads/w3f/discovery_invoked.schema.json` is the family's complete, independently closed 1.0.0 resolved-body schema. Every required-present nullable field remains present. Exact type precedes value comparisons (boolean is not integer; string booleans/numbers/null/arrays/objects never coerce). Every identifier/digest full-matches including trailing-LF rejection. Format annotations are enforced by the reviewed shared timestamp profile, not a silently skipped JSON Schema format. An unresolved $ref in any branch refuses schema installation eagerly.

  5. Scope and identity. This family's candidate payload is `pm.event_payload.discovery.invoked.v1@1.0.0` at `Plans/event_payloads/w3f/discovery_invoked.schema.json`. The schema closes the resolved body, not a new envelope. Adopt `Plans/Contracts_V0.md#EventRecord`, CV-317 and CV-366 by name. Match context.scope_kind/project_id/thread_id to EventRecord and actual accepted owner context; the genuine owning Server/Host/root/worktree/remote joins must all agree. No focus fallback, empty Project, hidden root, cross-Server or cross-thread substitution. Project scope uses Storage's exact `project~{base64url_no_pad(UTF8(project_id))}` partition; application scope is `app`, project_id null and an actual owning Server/Host. Discovery additionally requires its real thread/admitted root under T-161; prompts require their actual target thread under CV-314. Other thread/root/worktree/remote refs are present only when the genuine operation has them; no working root is invented for a rootless inbox or non-file invocation. owner_operation_id equals the original receipt_id, allocated once when this exact receipt fact is accepted and retained across retry; distinct selections/verification/fallback observations have their genuine distinct original receipt IDs. request_id alone is not the event identity. owner_operation_id is exactly the original receipt_id. event_id is `evt_w3f_` plus lowercase SHA-256 of RFC 8785 JSON array of strings [actual storage_instance_id, Storage-owned recovery_epoch in its canonical decimal string form, actual scope_partition, exact event_type, owner_operation_id]. Application idempotency_key is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}` (lowercase hex of exact UTF-8); Project idempotency_key is `w3f:{event_type}:{hex(owner_operation_id)}`. All identity inputs, including the actual original Storage recovery_epoch, are frozen at first preparation and retained on every retry; a later restore/current epoch never remints the original. No timestamp/retry counter/focus or projection revision enters identity. Recompute expected identities from captured trusted original inputs, never a supplied digest. No numeric or timestamp code is owned here: producer-semantic digest and numeric/date-time qualification stay in EventRecord/CV-317/CV-339/SP-236 and the reviewed shared CV-1100/CV-1101/SP-1100/SP-1101 successors adopted in phase 2. Until those reviewed prerequisites and this family's admission exist the current writer is unavailable. No schema cap narrows Storage uint64.

  6. Replay and idempotency. Adopt the unchanged EventRecord producer_semantic_digest field set and SP-286 full-value comparison, never Storage-assigned sequence/timestamps as caller semantics. Current writer/retry uses dedupe_by_idempotency_key; normal append rejects projector_replay_only as replay_only_not_appendable even for an otherwise valid original. Same actual scoped key and original semantic body returns the actual original receipt/result and no second event/effect. Different body with that identity is idempotency_conflict; behind/unavailable dedupe is dedupe_unavailable. Rebuild/historical read uses the original authenticated recipe and cannot search, verify, execute, authorize, dispatch, charge Usage, notify or write canonical state. It never restarts a retention clock.

  7. Retention. `retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0`. Storage Case L-3 exact class applies: receipt/audit authority, indefinite and no count eviction, storage pressure fails closed. Discovery reset/disable never deletes the redacted durable receipt (SP-217, RAP-031). Original first-receipt/dedupe/source custody keeps its own policy; every actual hold/reference/backup dependency applies. No body-dereference grant follows from event retention. G15/G23/G26 recommendations in the recount are leads only, not name-based assignments. No new lifetime or deletion rule is chosen here.

  8. Redaction and custody. Seglog is the only canonical event history; original full-value first-receipt custody belongs to SP-286/CV-339 and survives coherent mandatory backup with referenced payload packs, original identity/recipe and recovery controls. Redb/index/GUI/caches never reconstruct lost canonical authority. Keep original accepted input values stable in the live owner operation until its first append settles; there is no newly durable pending-operation journal. On process loss resolve only an actual known original identity; a missing/uncertain source or receipt is unavailable, never permission to mint a replacement. A separately accepted new operation has a genuinely new owner identity, never relabelled restored/retried work. On a verified older restore no omitted request is automatically resumed. Discovery source_receipt_ref may be null when there was no independent existing receipt; a self-reference is not independent custody. Trusted original append/admission custody, not retention of mutable request caches, authenticates valid historical bytes. Every read resolves current access/deletion/tombstone/hold authority for the exact source and checks it again immediately before disclosure; retention/hold never restores visibility. Raw prompts/queries/hidden paths/provider content/credentials/SSH secrets never enter this body; refs are opaque owner-issued objects, never substitute capability. Bodies above SP-337's 16 KiB inline limit use its BLAKE3/size/media payload reference, exact pack bytes durable before referencing acknowledgement. Validate the resolved complete body. Measure every stored part, including any redb value, against storage_profile.value_limit_bytes; externalizing the body never exempts another part from its limit. For a value without an admitted large-value shape, fail that write/advance closed rather than invent a pointer codec.

  9. Transitions and ordering. Use only this family's semantic predicates in paragraph 2. Source identity, state, policy, exact payload, full-value custody and current writer admission must all remain valid at the final append boundary after all helpers; otherwise zero new effect. Per-source actual causal order is preserved through EventRecord sequence and original causation. No timestamp-based dedupe or inferred cross-node order overrides the envelope owner. Historical readers verify the original lawful fact without demanding today's live state. A duplicate is an original-result read, never another transition.

  10. Consumers/checkpoints. This family explicitly adopts `SP-1455` and SP-278 `reader.storage.event_record_index@1.0.0`, including its nine-field durable token (DL-076), full ten-field live read transaction token and no persisted redb_snapshot_id. Operating read consumer is `reader.discovery.invoked@1.0.0`; its source/selector/currentness and custody rules are exact-family, not borrowed from another row. Family checkpoint disposition is none_required: this consumer owns no durable projection, cursor, receipt, acknowledgement, cache or advance. Only the generic independently published SP-278 checkpoint advances; read/interruption/retry leaves no family-owned effect. No family CAS is applicable because there is no durable advance. The output is one in-memory, bounded, original-family observation after final source/token/access revalidation.

  11. Compatibility and withdrawal. Current writes require this exact family/version/schema/source grant and normal replay policy; unknown future versions are unavailable. No deployed predecessor payload or family-specific converter was found; preserve any genuinely admitted historical envelope through its original verified registry revision and schema/number/time recipe, never relabel it 1.0.0 or rerun current live-state guards. A caller-controlled recipe/version cannot select history. At withdrawal the actual family registry cutoff fences this producer before append (including retry); existing SP-286 original receipt reads remain read-only. Stop new reads/materialization for a withdrawn schema/reader, invalidate its in-flight authority lease, and fence any affected derived generation. StorageMigrationCoordinator installs a separately reviewed successor codec/reader and rebuilds only derived state from the still admitted canonical source under SP-278; it publishes the new reader/generation atomically before reads resume. No source rewrite, schema URI rebind, original receipt reconstruction, native effect or silent upgrade. A malformed/withdrawn/foreign retained record is refused; valid retained history may be read after the current live object changes, with current disclosure controls. Phase 2 must test both directions.

  12. Oracles. `Plans/w3f_event_oracle_plan.json` holds this family's predicate inventory. Phase 2 (2026-11-13) implements it as the executable synthetic checker `scripts/pm_w3f_event_oracles.py`: every refusal is one named single-predicate row of a generated Method B guard table (`scripts/pm_w3f_table_*.py`), proved by the gated shared `scripts/pm_guard_isolation.py` through `scripts/pm-w3f-guard-tables.py`; rows no input can refuse first stay alone in their own table with a written proof. Its complete positives and one-defect negatives are `Plans/w3f_event_fixtures.json` (built by `scripts/pm-w3f-cases.py`), and Storage's sealed write custody stand-in for SP-1101 retained reads is `Plans/w3f_original_custody.json`. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 `date_time` with each field's owner profile; no lane serializer, cap or timestamp grammar is added. This is synthetic oracle evidence only: native work, writer admission and membership stay NOT_RUN/ABSENT.
gui_related: false
gui_classification_reason: Event storage, identity and custody contract; visual presentation belongs to existing
  owners.
depends_on:
- CV-317
- CV-339
- CV-366
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens:
- discovery.invoked@1.0.0
- reports/event-authority-20261105/W3F-search.json
- discovery.invoked
- f9c5de6561dff0a53a48e530f2a5c6804a7e941d
- event-family-discovery-invoked
- DiscoveryService discover_paths admission@1.0.0
- storage.first_append_receipt.resolve.v2
- Plans/event_payloads/w3f/discovery_invoked.schema.json
- pm.event_payload.discovery.invoked.v1@1.0.0
- Plans/event_payloads/w3f/discovery_invoked.schema.json
- Plans/Contracts_V0.md#EventRecord
- project~{base64url_no_pad(UTF8(project_id))}
- app
- evt_w3f_
- application@1:{hex(server_id)}:{hex(owner_operation_id)}
- w3f:{event_type}:{hex(owner_operation_id)}
- retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0
- SP-1455
- reader.storage.event_record_index@1.0.0
- reader.discovery.invoked@1.0.0
- Plans/w3f_event_oracle_plan.json
- scripts/pm_guard_isolation.py
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```

### CV-1456 - discovery.selected Resolved Payload And Owner Contract

```yaml
plan_unit_id: CV-1456
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract for `discovery.selected@1.0.0`; search/reuse evidence: `reports/event-authority-20261105/W3F-search.json` entry `discovery.selected`, base `f9c5de6561dff0a53a48e530f2a5c6804a7e941d`. Existing definitions reused: CV-291; T-161/T-162/T-163; SP-217; RAP-031. The family is prepared without admission; membership is ABSENT, never inferred from this unit or its schema. The family candidate id is `event-family-discovery-selected`.

  2. Owner and semantic boundary. records selection of an allowed opaque result. selected_result_ids is nonempty and every id belongs to the original request post-policy result snapshot; selecting a result neither opens a forbidden path nor verifies content. Reuse CV-291 exact enums and receipt minima, T-161 request/result identity, SP-217 cache isolation, and RAP-031 redacted browsing. query_digest is lowercase SHA-256 of RFC 8785 JSON array [request_id, exact query_text] from the original authorized transient request; no raw query or hidden path persists. candidate_count and selected IDs are independently derived from the genuine post-policy snapshot. Present-null cache_versions is allowed only when no cache was used; otherwise all five original versions/hashes join, as does source_index_generation. ssh_trust is present-null only for a non-SSH request; SSH joins the actual host identity, current trust and same permission snapshot before use. Exact verification uses the existing verifier receipt, never a discovery score. This newly authored technical binding grants no extra search, trust, permission, merge of physical indexes or deletion behavior.

  3. Producer and publication. Only `DiscoveryService opaque-result selection handler@1.0.0` may prepare this exact fact after the actual owner gate. Immutable original input and original owner operation identity are captured before calling helpers. The owner source/body commit (where this fact reports an independently committed source) precedes append. Explicitly adopt SP-286 and CV-339 `storage.first_append_receipt.resolve.v2`: actual original complete EventRecord/semantic input in the same Storage instance resolves the original eleven-field AppendReceipt, original four-field result and exact original wire/full-value commitments. Source commit -> body/pack durability -> family append -> original synced first receipt -> publication is the order. Mutation-authorizing, graph-lock and UI-waited receipts are barrier-class under SP-336/SP-347; no downstream mutation passes the receipt boundary. Missing acknowledgement stays fenced; neither tail absence nor caller flags prove never-issued. With no independent durable source, append is the canonical body commit, never an invented prior canonical value.

  4. Closed payload. `Plans/event_payloads/w3f/discovery_selected.schema.json` is the family's complete, independently closed 1.0.0 resolved-body schema. Every required-present nullable field remains present. Exact type precedes value comparisons (boolean is not integer; string booleans/numbers/null/arrays/objects never coerce). Every identifier/digest full-matches including trailing-LF rejection. Format annotations are enforced by the reviewed shared timestamp profile, not a silently skipped JSON Schema format. An unresolved $ref in any branch refuses schema installation eagerly.

  5. Scope and identity. This family's candidate payload is `pm.event_payload.discovery.selected.v1@1.0.0` at `Plans/event_payloads/w3f/discovery_selected.schema.json`. The schema closes the resolved body, not a new envelope. Adopt `Plans/Contracts_V0.md#EventRecord`, CV-317 and CV-366 by name. Match context.scope_kind/project_id/thread_id to EventRecord and actual accepted owner context; the genuine owning Server/Host/root/worktree/remote joins must all agree. No focus fallback, empty Project, hidden root, cross-Server or cross-thread substitution. Project scope uses Storage's exact `project~{base64url_no_pad(UTF8(project_id))}` partition; application scope is `app`, project_id null and an actual owning Server/Host. Discovery additionally requires its real thread/admitted root under T-161; prompts require their actual target thread under CV-314. Other thread/root/worktree/remote refs are present only when the genuine operation has them; no working root is invented for a rootless inbox or non-file invocation. owner_operation_id equals the original receipt_id, allocated once when this exact receipt fact is accepted and retained across retry; distinct selections/verification/fallback observations have their genuine distinct original receipt IDs. request_id alone is not the event identity. owner_operation_id is exactly the original receipt_id. event_id is `evt_w3f_` plus lowercase SHA-256 of RFC 8785 JSON array of strings [actual storage_instance_id, Storage-owned recovery_epoch in its canonical decimal string form, actual scope_partition, exact event_type, owner_operation_id]. Application idempotency_key is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}` (lowercase hex of exact UTF-8); Project idempotency_key is `w3f:{event_type}:{hex(owner_operation_id)}`. All identity inputs, including the actual original Storage recovery_epoch, are frozen at first preparation and retained on every retry; a later restore/current epoch never remints the original. No timestamp/retry counter/focus or projection revision enters identity. Recompute expected identities from captured trusted original inputs, never a supplied digest. No numeric or timestamp code is owned here: producer-semantic digest and numeric/date-time qualification stay in EventRecord/CV-317/CV-339/SP-236 and the reviewed shared CV-1100/CV-1101/SP-1100/SP-1101 successors adopted in phase 2. Until those reviewed prerequisites and this family's admission exist the current writer is unavailable. No schema cap narrows Storage uint64.

  6. Replay and idempotency. Adopt the unchanged EventRecord producer_semantic_digest field set and SP-286 full-value comparison, never Storage-assigned sequence/timestamps as caller semantics. Current writer/retry uses dedupe_by_idempotency_key; normal append rejects projector_replay_only as replay_only_not_appendable even for an otherwise valid original. Same actual scoped key and original semantic body returns the actual original receipt/result and no second event/effect. Different body with that identity is idempotency_conflict; behind/unavailable dedupe is dedupe_unavailable. Rebuild/historical read uses the original authenticated recipe and cannot search, verify, execute, authorize, dispatch, charge Usage, notify or write canonical state. It never restarts a retention clock.

  7. Retention. `retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0`. Storage Case L-3 exact class applies: receipt/audit authority, indefinite and no count eviction, storage pressure fails closed. Discovery reset/disable never deletes the redacted durable receipt (SP-217, RAP-031). Original first-receipt/dedupe/source custody keeps its own policy; every actual hold/reference/backup dependency applies. No body-dereference grant follows from event retention. G15/G23/G26 recommendations in the recount are leads only, not name-based assignments. No new lifetime or deletion rule is chosen here.

  8. Redaction and custody. Seglog is the only canonical event history; original full-value first-receipt custody belongs to SP-286/CV-339 and survives coherent mandatory backup with referenced payload packs, original identity/recipe and recovery controls. Redb/index/GUI/caches never reconstruct lost canonical authority. Keep original accepted input values stable in the live owner operation until its first append settles; there is no newly durable pending-operation journal. On process loss resolve only an actual known original identity; a missing/uncertain source or receipt is unavailable, never permission to mint a replacement. A separately accepted new operation has a genuinely new owner identity, never relabelled restored/retried work. On a verified older restore no omitted request is automatically resumed. Discovery source_receipt_ref may be null when there was no independent existing receipt; a self-reference is not independent custody. Trusted original append/admission custody, not retention of mutable request caches, authenticates valid historical bytes. Every read resolves current access/deletion/tombstone/hold authority for the exact source and checks it again immediately before disclosure; retention/hold never restores visibility. Raw prompts/queries/hidden paths/provider content/credentials/SSH secrets never enter this body; refs are opaque owner-issued objects, never substitute capability. Bodies above SP-337's 16 KiB inline limit use its BLAKE3/size/media payload reference, exact pack bytes durable before referencing acknowledgement. Validate the resolved complete body. Measure every stored part, including any redb value, against storage_profile.value_limit_bytes; externalizing the body never exempts another part from its limit. For a value without an admitted large-value shape, fail that write/advance closed rather than invent a pointer codec.

  9. Transitions and ordering. Use only this family's semantic predicates in paragraph 2. Source identity, state, policy, exact payload, full-value custody and current writer admission must all remain valid at the final append boundary after all helpers; otherwise zero new effect. Per-source actual causal order is preserved through EventRecord sequence and original causation. No timestamp-based dedupe or inferred cross-node order overrides the envelope owner. Historical readers verify the original lawful fact without demanding today's live state. A duplicate is an original-result read, never another transition.

  10. Consumers/checkpoints. This family explicitly adopts `SP-1456` and SP-278 `reader.storage.event_record_index@1.0.0`, including its nine-field durable token (DL-076), full ten-field live read transaction token and no persisted redb_snapshot_id. Operating read consumer is `reader.discovery.selected@1.0.0`; its source/selector/currentness and custody rules are exact-family, not borrowed from another row. Family checkpoint disposition is none_required: this consumer owns no durable projection, cursor, receipt, acknowledgement, cache or advance. Only the generic independently published SP-278 checkpoint advances; read/interruption/retry leaves no family-owned effect. No family CAS is applicable because there is no durable advance. The output is one in-memory, bounded, original-family observation after final source/token/access revalidation.

  11. Compatibility and withdrawal. Current writes require this exact family/version/schema/source grant and normal replay policy; unknown future versions are unavailable. No deployed predecessor payload or family-specific converter was found; preserve any genuinely admitted historical envelope through its original verified registry revision and schema/number/time recipe, never relabel it 1.0.0 or rerun current live-state guards. A caller-controlled recipe/version cannot select history. At withdrawal the actual family registry cutoff fences this producer before append (including retry); existing SP-286 original receipt reads remain read-only. Stop new reads/materialization for a withdrawn schema/reader, invalidate its in-flight authority lease, and fence any affected derived generation. StorageMigrationCoordinator installs a separately reviewed successor codec/reader and rebuilds only derived state from the still admitted canonical source under SP-278; it publishes the new reader/generation atomically before reads resume. No source rewrite, schema URI rebind, original receipt reconstruction, native effect or silent upgrade. A malformed/withdrawn/foreign retained record is refused; valid retained history may be read after the current live object changes, with current disclosure controls. Phase 2 must test both directions.

  12. Oracles. `Plans/w3f_event_oracle_plan.json` holds this family's predicate inventory. Phase 2 (2026-11-13) implements it as the executable synthetic checker `scripts/pm_w3f_event_oracles.py`: every refusal is one named single-predicate row of a generated Method B guard table (`scripts/pm_w3f_table_*.py`), proved by the gated shared `scripts/pm_guard_isolation.py` through `scripts/pm-w3f-guard-tables.py`; rows no input can refuse first stay alone in their own table with a written proof. Its complete positives and one-defect negatives are `Plans/w3f_event_fixtures.json` (built by `scripts/pm-w3f-cases.py`), and Storage's sealed write custody stand-in for SP-1101 retained reads is `Plans/w3f_original_custody.json`. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 `date_time` with each field's owner profile; no lane serializer, cap or timestamp grammar is added. This is synthetic oracle evidence only: native work, writer admission and membership stay NOT_RUN/ABSENT.
gui_related: false
gui_classification_reason: Event storage, identity and custody contract; visual presentation belongs to existing
  owners.
depends_on:
- CV-317
- CV-339
- CV-366
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens:
- discovery.selected@1.0.0
- reports/event-authority-20261105/W3F-search.json
- discovery.selected
- f9c5de6561dff0a53a48e530f2a5c6804a7e941d
- event-family-discovery-selected
- DiscoveryService opaque-result selection handler@1.0.0
- storage.first_append_receipt.resolve.v2
- Plans/event_payloads/w3f/discovery_selected.schema.json
- pm.event_payload.discovery.selected.v1@1.0.0
- Plans/event_payloads/w3f/discovery_selected.schema.json
- Plans/Contracts_V0.md#EventRecord
- project~{base64url_no_pad(UTF8(project_id))}
- app
- evt_w3f_
- application@1:{hex(server_id)}:{hex(owner_operation_id)}
- w3f:{event_type}:{hex(owner_operation_id)}
- retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0
- SP-1456
- reader.storage.event_record_index@1.0.0
- reader.discovery.selected@1.0.0
- Plans/w3f_event_oracle_plan.json
- scripts/pm_guard_isolation.py
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```

### CV-1457 - discovery.unsupported Resolved Payload And Owner Contract

```yaml
plan_unit_id: CV-1457
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract for `discovery.unsupported@1.0.0`; search/reuse evidence: `reports/event-authority-20261105/W3F-search.json` entry `discovery.unsupported`, base `f9c5de6561dff0a53a48e530f2a5c6804a7e941d`. Existing definitions reused: CV-291; T-161/T-162/T-163; SP-217; RAP-031. The family is prepared without admission; membership is ABSENT, never inferred from this unit or its schema. The family candidate id is `event-family-discovery-unsupported`.

  2. Owner and semantic boundary. records unsupported discovery refusal/degradation. fallback_state=unsupported and error_code=discovery_unsupported; unsupported capability is not successful discovery. Reuse CV-291 exact enums and receipt minima, T-161 request/result identity, SP-217 cache isolation, and RAP-031 redacted browsing. query_digest is lowercase SHA-256 of RFC 8785 JSON array [request_id, exact query_text] from the original authorized transient request; no raw query or hidden path persists. candidate_count and selected IDs are independently derived from the genuine post-policy snapshot. Present-null cache_versions is allowed only when no cache was used; otherwise all five original versions/hashes join, as does source_index_generation. ssh_trust is present-null only for a non-SSH request; SSH joins the actual host identity, current trust and same permission snapshot before use. Exact verification uses the existing verifier receipt, never a discovery score. This newly authored technical binding grants no extra search, trust, permission, merge of physical indexes or deletion behavior.

  3. Producer and publication. Only `DiscoveryService capability gate@1.0.0` may prepare this exact fact after the actual owner gate. Immutable original input and original owner operation identity are captured before calling helpers. The owner source/body commit (where this fact reports an independently committed source) precedes append. Explicitly adopt SP-286 and CV-339 `storage.first_append_receipt.resolve.v2`: actual original complete EventRecord/semantic input in the same Storage instance resolves the original eleven-field AppendReceipt, original four-field result and exact original wire/full-value commitments. Source commit -> body/pack durability -> family append -> original synced first receipt -> publication is the order. Mutation-authorizing, graph-lock and UI-waited receipts are barrier-class under SP-336/SP-347; no downstream mutation passes the receipt boundary. Missing acknowledgement stays fenced; neither tail absence nor caller flags prove never-issued. With no independent durable source, append is the canonical body commit, never an invented prior canonical value.

  4. Closed payload. `Plans/event_payloads/w3f/discovery_unsupported.schema.json` is the family's complete, independently closed 1.0.0 resolved-body schema. Every required-present nullable field remains present. Exact type precedes value comparisons (boolean is not integer; string booleans/numbers/null/arrays/objects never coerce). Every identifier/digest full-matches including trailing-LF rejection. Format annotations are enforced by the reviewed shared timestamp profile, not a silently skipped JSON Schema format. An unresolved $ref in any branch refuses schema installation eagerly.

  5. Scope and identity. This family's candidate payload is `pm.event_payload.discovery.unsupported.v1@1.0.0` at `Plans/event_payloads/w3f/discovery_unsupported.schema.json`. The schema closes the resolved body, not a new envelope. Adopt `Plans/Contracts_V0.md#EventRecord`, CV-317 and CV-366 by name. Match context.scope_kind/project_id/thread_id to EventRecord and actual accepted owner context; the genuine owning Server/Host/root/worktree/remote joins must all agree. No focus fallback, empty Project, hidden root, cross-Server or cross-thread substitution. Project scope uses Storage's exact `project~{base64url_no_pad(UTF8(project_id))}` partition; application scope is `app`, project_id null and an actual owning Server/Host. Discovery additionally requires its real thread/admitted root under T-161; prompts require their actual target thread under CV-314. Other thread/root/worktree/remote refs are present only when the genuine operation has them; no working root is invented for a rootless inbox or non-file invocation. owner_operation_id equals the original receipt_id, allocated once when this exact receipt fact is accepted and retained across retry; distinct selections/verification/fallback observations have their genuine distinct original receipt IDs. request_id alone is not the event identity. owner_operation_id is exactly the original receipt_id. event_id is `evt_w3f_` plus lowercase SHA-256 of RFC 8785 JSON array of strings [actual storage_instance_id, Storage-owned recovery_epoch in its canonical decimal string form, actual scope_partition, exact event_type, owner_operation_id]. Application idempotency_key is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}` (lowercase hex of exact UTF-8); Project idempotency_key is `w3f:{event_type}:{hex(owner_operation_id)}`. All identity inputs, including the actual original Storage recovery_epoch, are frozen at first preparation and retained on every retry; a later restore/current epoch never remints the original. No timestamp/retry counter/focus or projection revision enters identity. Recompute expected identities from captured trusted original inputs, never a supplied digest. No numeric or timestamp code is owned here: producer-semantic digest and numeric/date-time qualification stay in EventRecord/CV-317/CV-339/SP-236 and the reviewed shared CV-1100/CV-1101/SP-1100/SP-1101 successors adopted in phase 2. Until those reviewed prerequisites and this family's admission exist the current writer is unavailable. No schema cap narrows Storage uint64.

  6. Replay and idempotency. Adopt the unchanged EventRecord producer_semantic_digest field set and SP-286 full-value comparison, never Storage-assigned sequence/timestamps as caller semantics. Current writer/retry uses dedupe_by_idempotency_key; normal append rejects projector_replay_only as replay_only_not_appendable even for an otherwise valid original. Same actual scoped key and original semantic body returns the actual original receipt/result and no second event/effect. Different body with that identity is idempotency_conflict; behind/unavailable dedupe is dedupe_unavailable. Rebuild/historical read uses the original authenticated recipe and cannot search, verify, execute, authorize, dispatch, charge Usage, notify or write canonical state. It never restarts a retention clock.

  7. Retention. `retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0`. Storage Case L-3 exact class applies: receipt/audit authority, indefinite and no count eviction, storage pressure fails closed. Discovery reset/disable never deletes the redacted durable receipt (SP-217, RAP-031). Original first-receipt/dedupe/source custody keeps its own policy; every actual hold/reference/backup dependency applies. No body-dereference grant follows from event retention. G15/G23/G26 recommendations in the recount are leads only, not name-based assignments. No new lifetime or deletion rule is chosen here.

  8. Redaction and custody. Seglog is the only canonical event history; original full-value first-receipt custody belongs to SP-286/CV-339 and survives coherent mandatory backup with referenced payload packs, original identity/recipe and recovery controls. Redb/index/GUI/caches never reconstruct lost canonical authority. Keep original accepted input values stable in the live owner operation until its first append settles; there is no newly durable pending-operation journal. On process loss resolve only an actual known original identity; a missing/uncertain source or receipt is unavailable, never permission to mint a replacement. A separately accepted new operation has a genuinely new owner identity, never relabelled restored/retried work. On a verified older restore no omitted request is automatically resumed. Discovery source_receipt_ref may be null when there was no independent existing receipt; a self-reference is not independent custody. Trusted original append/admission custody, not retention of mutable request caches, authenticates valid historical bytes. Every read resolves current access/deletion/tombstone/hold authority for the exact source and checks it again immediately before disclosure; retention/hold never restores visibility. Raw prompts/queries/hidden paths/provider content/credentials/SSH secrets never enter this body; refs are opaque owner-issued objects, never substitute capability. Bodies above SP-337's 16 KiB inline limit use its BLAKE3/size/media payload reference, exact pack bytes durable before referencing acknowledgement. Validate the resolved complete body. Measure every stored part, including any redb value, against storage_profile.value_limit_bytes; externalizing the body never exempts another part from its limit. For a value without an admitted large-value shape, fail that write/advance closed rather than invent a pointer codec.

  9. Transitions and ordering. Use only this family's semantic predicates in paragraph 2. Source identity, state, policy, exact payload, full-value custody and current writer admission must all remain valid at the final append boundary after all helpers; otherwise zero new effect. Per-source actual causal order is preserved through EventRecord sequence and original causation. No timestamp-based dedupe or inferred cross-node order overrides the envelope owner. Historical readers verify the original lawful fact without demanding today's live state. A duplicate is an original-result read, never another transition.

  10. Consumers/checkpoints. This family explicitly adopts `SP-1457` and SP-278 `reader.storage.event_record_index@1.0.0`, including its nine-field durable token (DL-076), full ten-field live read transaction token and no persisted redb_snapshot_id. Operating read consumer is `reader.discovery.unsupported@1.0.0`; its source/selector/currentness and custody rules are exact-family, not borrowed from another row. Family checkpoint disposition is none_required: this consumer owns no durable projection, cursor, receipt, acknowledgement, cache or advance. Only the generic independently published SP-278 checkpoint advances; read/interruption/retry leaves no family-owned effect. No family CAS is applicable because there is no durable advance. The output is one in-memory, bounded, original-family observation after final source/token/access revalidation.

  11. Compatibility and withdrawal. Current writes require this exact family/version/schema/source grant and normal replay policy; unknown future versions are unavailable. No deployed predecessor payload or family-specific converter was found; preserve any genuinely admitted historical envelope through its original verified registry revision and schema/number/time recipe, never relabel it 1.0.0 or rerun current live-state guards. A caller-controlled recipe/version cannot select history. At withdrawal the actual family registry cutoff fences this producer before append (including retry); existing SP-286 original receipt reads remain read-only. Stop new reads/materialization for a withdrawn schema/reader, invalidate its in-flight authority lease, and fence any affected derived generation. StorageMigrationCoordinator installs a separately reviewed successor codec/reader and rebuilds only derived state from the still admitted canonical source under SP-278; it publishes the new reader/generation atomically before reads resume. No source rewrite, schema URI rebind, original receipt reconstruction, native effect or silent upgrade. A malformed/withdrawn/foreign retained record is refused; valid retained history may be read after the current live object changes, with current disclosure controls. Phase 2 must test both directions.

  12. Oracles. `Plans/w3f_event_oracle_plan.json` holds this family's predicate inventory. Phase 2 (2026-11-13) implements it as the executable synthetic checker `scripts/pm_w3f_event_oracles.py`: every refusal is one named single-predicate row of a generated Method B guard table (`scripts/pm_w3f_table_*.py`), proved by the gated shared `scripts/pm_guard_isolation.py` through `scripts/pm-w3f-guard-tables.py`; rows no input can refuse first stay alone in their own table with a written proof. Its complete positives and one-defect negatives are `Plans/w3f_event_fixtures.json` (built by `scripts/pm-w3f-cases.py`), and Storage's sealed write custody stand-in for SP-1101 retained reads is `Plans/w3f_original_custody.json`. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 `date_time` with each field's owner profile; no lane serializer, cap or timestamp grammar is added. This is synthetic oracle evidence only: native work, writer admission and membership stay NOT_RUN/ABSENT.
gui_related: false
gui_classification_reason: Event storage, identity and custody contract; visual presentation belongs to existing
  owners.
depends_on:
- CV-317
- CV-339
- CV-366
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens:
- discovery.unsupported@1.0.0
- reports/event-authority-20261105/W3F-search.json
- discovery.unsupported
- f9c5de6561dff0a53a48e530f2a5c6804a7e941d
- event-family-discovery-unsupported
- DiscoveryService capability gate@1.0.0
- storage.first_append_receipt.resolve.v2
- Plans/event_payloads/w3f/discovery_unsupported.schema.json
- pm.event_payload.discovery.unsupported.v1@1.0.0
- Plans/event_payloads/w3f/discovery_unsupported.schema.json
- Plans/Contracts_V0.md#EventRecord
- project~{base64url_no_pad(UTF8(project_id))}
- app
- evt_w3f_
- application@1:{hex(server_id)}:{hex(owner_operation_id)}
- w3f:{event_type}:{hex(owner_operation_id)}
- retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0
- SP-1457
- reader.storage.event_record_index@1.0.0
- reader.discovery.unsupported@1.0.0
- Plans/w3f_event_oracle_plan.json
- scripts/pm_guard_isolation.py
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```

### CV-1458 - discovery.verified Resolved Payload And Owner Contract

```yaml
plan_unit_id: CV-1458
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract for `discovery.verified@1.0.0`; search/reuse evidence: `reports/event-authority-20261105/W3F-search.json` entry `discovery.verified`, base `f9c5de6561dff0a53a48e530f2a5c6804a7e941d`. Existing definitions reused: CV-291; T-161/T-162/T-163; SP-217; RAP-031. The family is prepared without admission; membership is ABSENT, never inferred from this unit or its schema. The family candidate id is `event-family-discovery-verified`.

  2. Owner and semantic boundary. records an existing exact verification receipt linked to discovery. verification_receipt_ref is non-null and resolves a genuine exact verifier result for this request/selected opaque IDs; ranking alone never satisfies verification. Reuse CV-291 exact enums and receipt minima, T-161 request/result identity, SP-217 cache isolation, and RAP-031 redacted browsing. query_digest is lowercase SHA-256 of RFC 8785 JSON array [request_id, exact query_text] from the original authorized transient request; no raw query or hidden path persists. candidate_count and selected IDs are independently derived from the genuine post-policy snapshot. Present-null cache_versions is allowed only when no cache was used; otherwise all five original versions/hashes join, as does source_index_generation. ssh_trust is present-null only for a non-SSH request; SSH joins the actual host identity, current trust and same permission snapshot before use. Exact verification uses the existing verifier receipt, never a discovery score. This newly authored technical binding grants no extra search, trust, permission, merge of physical indexes or deletion behavior.

  3. Producer and publication. Only `DiscoveryService exact-verification receipt bridge@1.0.0` may prepare this exact fact after the actual owner gate. Immutable original input and original owner operation identity are captured before calling helpers. The owner source/body commit (where this fact reports an independently committed source) precedes append. Explicitly adopt SP-286 and CV-339 `storage.first_append_receipt.resolve.v2`: actual original complete EventRecord/semantic input in the same Storage instance resolves the original eleven-field AppendReceipt, original four-field result and exact original wire/full-value commitments. Source commit -> body/pack durability -> family append -> original synced first receipt -> publication is the order. Mutation-authorizing, graph-lock and UI-waited receipts are barrier-class under SP-336/SP-347; no downstream mutation passes the receipt boundary. Missing acknowledgement stays fenced; neither tail absence nor caller flags prove never-issued. With no independent durable source, append is the canonical body commit, never an invented prior canonical value.

  4. Closed payload. `Plans/event_payloads/w3f/discovery_verified.schema.json` is the family's complete, independently closed 1.0.0 resolved-body schema. Every required-present nullable field remains present. Exact type precedes value comparisons (boolean is not integer; string booleans/numbers/null/arrays/objects never coerce). Every identifier/digest full-matches including trailing-LF rejection. Format annotations are enforced by the reviewed shared timestamp profile, not a silently skipped JSON Schema format. An unresolved $ref in any branch refuses schema installation eagerly.

  5. Scope and identity. This family's candidate payload is `pm.event_payload.discovery.verified.v1@1.0.0` at `Plans/event_payloads/w3f/discovery_verified.schema.json`. The schema closes the resolved body, not a new envelope. Adopt `Plans/Contracts_V0.md#EventRecord`, CV-317 and CV-366 by name. Match context.scope_kind/project_id/thread_id to EventRecord and actual accepted owner context; the genuine owning Server/Host/root/worktree/remote joins must all agree. No focus fallback, empty Project, hidden root, cross-Server or cross-thread substitution. Project scope uses Storage's exact `project~{base64url_no_pad(UTF8(project_id))}` partition; application scope is `app`, project_id null and an actual owning Server/Host. Discovery additionally requires its real thread/admitted root under T-161; prompts require their actual target thread under CV-314. Other thread/root/worktree/remote refs are present only when the genuine operation has them; no working root is invented for a rootless inbox or non-file invocation. owner_operation_id equals the original receipt_id, allocated once when this exact receipt fact is accepted and retained across retry; distinct selections/verification/fallback observations have their genuine distinct original receipt IDs. request_id alone is not the event identity. owner_operation_id is exactly the original receipt_id. event_id is `evt_w3f_` plus lowercase SHA-256 of RFC 8785 JSON array of strings [actual storage_instance_id, Storage-owned recovery_epoch in its canonical decimal string form, actual scope_partition, exact event_type, owner_operation_id]. Application idempotency_key is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}` (lowercase hex of exact UTF-8); Project idempotency_key is `w3f:{event_type}:{hex(owner_operation_id)}`. All identity inputs, including the actual original Storage recovery_epoch, are frozen at first preparation and retained on every retry; a later restore/current epoch never remints the original. No timestamp/retry counter/focus or projection revision enters identity. Recompute expected identities from captured trusted original inputs, never a supplied digest. No numeric or timestamp code is owned here: producer-semantic digest and numeric/date-time qualification stay in EventRecord/CV-317/CV-339/SP-236 and the reviewed shared CV-1100/CV-1101/SP-1100/SP-1101 successors adopted in phase 2. Until those reviewed prerequisites and this family's admission exist the current writer is unavailable. No schema cap narrows Storage uint64.

  6. Replay and idempotency. Adopt the unchanged EventRecord producer_semantic_digest field set and SP-286 full-value comparison, never Storage-assigned sequence/timestamps as caller semantics. Current writer/retry uses dedupe_by_idempotency_key; normal append rejects projector_replay_only as replay_only_not_appendable even for an otherwise valid original. Same actual scoped key and original semantic body returns the actual original receipt/result and no second event/effect. Different body with that identity is idempotency_conflict; behind/unavailable dedupe is dedupe_unavailable. Rebuild/historical read uses the original authenticated recipe and cannot search, verify, execute, authorize, dispatch, charge Usage, notify or write canonical state. It never restarts a retention clock.

  7. Retention. `retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0`. Storage Case L-3 exact class applies: receipt/audit authority, indefinite and no count eviction, storage pressure fails closed. Discovery reset/disable never deletes the redacted durable receipt (SP-217, RAP-031). Original first-receipt/dedupe/source custody keeps its own policy; every actual hold/reference/backup dependency applies. No body-dereference grant follows from event retention. G15/G23/G26 recommendations in the recount are leads only, not name-based assignments. No new lifetime or deletion rule is chosen here.

  8. Redaction and custody. Seglog is the only canonical event history; original full-value first-receipt custody belongs to SP-286/CV-339 and survives coherent mandatory backup with referenced payload packs, original identity/recipe and recovery controls. Redb/index/GUI/caches never reconstruct lost canonical authority. Keep original accepted input values stable in the live owner operation until its first append settles; there is no newly durable pending-operation journal. On process loss resolve only an actual known original identity; a missing/uncertain source or receipt is unavailable, never permission to mint a replacement. A separately accepted new operation has a genuinely new owner identity, never relabelled restored/retried work. On a verified older restore no omitted request is automatically resumed. Discovery source_receipt_ref may be null when there was no independent existing receipt; a self-reference is not independent custody. Trusted original append/admission custody, not retention of mutable request caches, authenticates valid historical bytes. Every read resolves current access/deletion/tombstone/hold authority for the exact source and checks it again immediately before disclosure; retention/hold never restores visibility. Raw prompts/queries/hidden paths/provider content/credentials/SSH secrets never enter this body; refs are opaque owner-issued objects, never substitute capability. Bodies above SP-337's 16 KiB inline limit use its BLAKE3/size/media payload reference, exact pack bytes durable before referencing acknowledgement. Validate the resolved complete body. Measure every stored part, including any redb value, against storage_profile.value_limit_bytes; externalizing the body never exempts another part from its limit. For a value without an admitted large-value shape, fail that write/advance closed rather than invent a pointer codec.

  9. Transitions and ordering. Use only this family's semantic predicates in paragraph 2. Source identity, state, policy, exact payload, full-value custody and current writer admission must all remain valid at the final append boundary after all helpers; otherwise zero new effect. Per-source actual causal order is preserved through EventRecord sequence and original causation. No timestamp-based dedupe or inferred cross-node order overrides the envelope owner. Historical readers verify the original lawful fact without demanding today's live state. A duplicate is an original-result read, never another transition.

  10. Consumers/checkpoints. This family explicitly adopts `SP-1458` and SP-278 `reader.storage.event_record_index@1.0.0`, including its nine-field durable token (DL-076), full ten-field live read transaction token and no persisted redb_snapshot_id. Operating read consumer is `reader.discovery.verified@1.0.0`; its source/selector/currentness and custody rules are exact-family, not borrowed from another row. Family checkpoint disposition is none_required: this consumer owns no durable projection, cursor, receipt, acknowledgement, cache or advance. Only the generic independently published SP-278 checkpoint advances; read/interruption/retry leaves no family-owned effect. No family CAS is applicable because there is no durable advance. The output is one in-memory, bounded, original-family observation after final source/token/access revalidation.

  11. Compatibility and withdrawal. Current writes require this exact family/version/schema/source grant and normal replay policy; unknown future versions are unavailable. No deployed predecessor payload or family-specific converter was found; preserve any genuinely admitted historical envelope through its original verified registry revision and schema/number/time recipe, never relabel it 1.0.0 or rerun current live-state guards. A caller-controlled recipe/version cannot select history. At withdrawal the actual family registry cutoff fences this producer before append (including retry); existing SP-286 original receipt reads remain read-only. Stop new reads/materialization for a withdrawn schema/reader, invalidate its in-flight authority lease, and fence any affected derived generation. StorageMigrationCoordinator installs a separately reviewed successor codec/reader and rebuilds only derived state from the still admitted canonical source under SP-278; it publishes the new reader/generation atomically before reads resume. No source rewrite, schema URI rebind, original receipt reconstruction, native effect or silent upgrade. A malformed/withdrawn/foreign retained record is refused; valid retained history may be read after the current live object changes, with current disclosure controls. Phase 2 must test both directions.

  12. Oracles. `Plans/w3f_event_oracle_plan.json` holds this family's predicate inventory. Phase 2 (2026-11-13) implements it as the executable synthetic checker `scripts/pm_w3f_event_oracles.py`: every refusal is one named single-predicate row of a generated Method B guard table (`scripts/pm_w3f_table_*.py`), proved by the gated shared `scripts/pm_guard_isolation.py` through `scripts/pm-w3f-guard-tables.py`; rows no input can refuse first stay alone in their own table with a written proof. Its complete positives and one-defect negatives are `Plans/w3f_event_fixtures.json` (built by `scripts/pm-w3f-cases.py`), and Storage's sealed write custody stand-in for SP-1101 retained reads is `Plans/w3f_original_custody.json`. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 `date_time` with each field's owner profile; no lane serializer, cap or timestamp grammar is added. This is synthetic oracle evidence only: native work, writer admission and membership stay NOT_RUN/ABSENT.
gui_related: false
gui_classification_reason: Event storage, identity and custody contract; visual presentation belongs to existing
  owners.
depends_on:
- CV-317
- CV-339
- CV-366
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens:
- discovery.verified@1.0.0
- reports/event-authority-20261105/W3F-search.json
- discovery.verified
- f9c5de6561dff0a53a48e530f2a5c6804a7e941d
- event-family-discovery-verified
- DiscoveryService exact-verification receipt bridge@1.0.0
- storage.first_append_receipt.resolve.v2
- Plans/event_payloads/w3f/discovery_verified.schema.json
- pm.event_payload.discovery.verified.v1@1.0.0
- Plans/event_payloads/w3f/discovery_verified.schema.json
- Plans/Contracts_V0.md#EventRecord
- project~{base64url_no_pad(UTF8(project_id))}
- app
- evt_w3f_
- application@1:{hex(server_id)}:{hex(owner_operation_id)}
- w3f:{event_type}:{hex(owner_operation_id)}
- retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0
- SP-1458
- reader.storage.event_record_index@1.0.0
- reader.discovery.verified@1.0.0
- Plans/w3f_event_oracle_plan.json
- scripts/pm_guard_isolation.py
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```

### CV-1460 - run.graph_canonical_locked Resolved Payload And Owner Contract

```yaml
plan_unit_id: CV-1460
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract for `run.graph_canonical_locked@1.0.0`; search/reuse evidence: `reports/event-authority-20261105/W3F-search.json` entry `run.graph_canonical_locked`, base `f9c5de6561dff0a53a48e530f2a5c6804a7e941d`. Existing definitions reused: Executor graph-lock boundary; replan generation lifecycle; EP-088; Wiring_Matrix canonical graph wiring; Project_Output_Artifacts canonical graph. The family is prepared without admission; membership is ABSENT, never inferred from this unit or its schema. The family candidate id is `event-family-run-graph-canonical-locked`.

  2. Owner and semantic boundary. Reuse the canonical Executor graph-lock boundary and generation lifecycle. Only project scope is supported for this Project canonical graph; app operation support elsewhere is not inherited. Validate the exact genuine approved canonical graph (all node/edge/dependency IDs, graph digest and approval refs) through its existing graph owner before lock commit. A graph digest is checked from the actual canonical artifact bytes under that artifact owner recipe, not a new serializer here. Original canonical graph body commit and graph_commit_receipt_ref precede event append. The original event first receipt precedes new dispatch acceptance. Initial generation is 0 with null previous_generation and previous_lock_event_id. Applied structural replan increments once (u32 domain, no wrap) and joins prior lock/run/approved graph; stale attempts/safe points/blocked projections are queryable but never resumable. Invalid post-lock structure stops new dispatch as graph_integrity; no flattening or silent degraded execution. The event is evidence of an existing graph commit, never authority to reconstruct or change the canonical graph.

  3. Producer and publication. Only `ExecutorCanonicalGraph.commit_lock@1.0.0` may prepare this exact fact after the actual owner gate. Immutable original input and original owner operation identity are captured before calling helpers. The owner source/body commit (where this fact reports an independently committed source) precedes append. Explicitly adopt SP-286 and CV-339 `storage.first_append_receipt.resolve.v2`: actual original complete EventRecord/semantic input in the same Storage instance resolves the original eleven-field AppendReceipt, original four-field result and exact original wire/full-value commitments. Source commit -> body/pack durability -> family append -> original synced first receipt -> publication is the order. Mutation-authorizing, graph-lock and UI-waited receipts are barrier-class under SP-336/SP-347; no downstream mutation passes the receipt boundary. Missing acknowledgement stays fenced; neither tail absence nor caller flags prove never-issued. With no independent durable source, append is the canonical body commit, never an invented prior canonical value.

  4. Closed payload. `Plans/event_payloads/w3f/run_graph_canonical_locked.schema.json` is the family's complete, independently closed 1.0.0 resolved-body schema. Every required-present nullable field remains present. Exact type precedes value comparisons (boolean is not integer; string booleans/numbers/null/arrays/objects never coerce). Every identifier/digest full-matches including trailing-LF rejection. Format annotations are enforced by the reviewed shared timestamp profile, not a silently skipped JSON Schema format. An unresolved $ref in any branch refuses schema installation eagerly.

  5. Scope and identity. This family's candidate payload is `pm.event_payload.run.graph_canonical_locked.v1@1.0.0` at `Plans/event_payloads/w3f/run_graph_canonical_locked.schema.json`. The schema closes the resolved body, not a new envelope. Adopt `Plans/Contracts_V0.md#EventRecord`, CV-317 and CV-366 by name. Match context.scope_kind/project_id/thread_id to EventRecord and actual accepted owner context; the genuine owning Server/Host/root/worktree/remote joins must all agree. No focus fallback, empty Project, hidden root, cross-Server or cross-thread substitution. Project scope uses Storage's exact `project~{base64url_no_pad(UTF8(project_id))}` partition; application scope is `app`, project_id null and an actual owning Server/Host. Discovery additionally requires its real thread/admitted root under T-161; prompts require their actual target thread under CV-314. Other thread/root/worktree/remote refs are present only when the genuine operation has them; no working root is invented for a rootless inbox or non-file invocation. owner_operation_id equals genuine original lock_id, stable for that accepted graph commit; the same (run_id,replan_generation) cannot name two canonical graph digests. An initial lock has generation zero and no predecessor; an applied structural replan has the exact prior generation plus one, an original prior lock and its new approved graph. owner_operation_id is exactly the original lock_id. event_id is `evt_w3f_` plus lowercase SHA-256 of RFC 8785 JSON array of strings [actual storage_instance_id, Storage-owned recovery_epoch in its canonical decimal string form, actual scope_partition, exact event_type, owner_operation_id]. Application idempotency_key is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}` (lowercase hex of exact UTF-8); Project idempotency_key is `w3f:{event_type}:{hex(owner_operation_id)}`. All identity inputs, including the actual original Storage recovery_epoch, are frozen at first preparation and retained on every retry; a later restore/current epoch never remints the original. No timestamp/retry counter/focus or projection revision enters identity. Recompute expected identities from captured trusted original inputs, never a supplied digest. No numeric or timestamp code is owned here: producer-semantic digest and numeric/date-time qualification stay in EventRecord/CV-317/CV-339/SP-236 and the reviewed shared CV-1100/CV-1101/SP-1100/SP-1101 successors adopted in phase 2. Until those reviewed prerequisites and this family's admission exist the current writer is unavailable. No schema cap narrows Storage uint64.

  6. Replay and idempotency. Adopt the unchanged EventRecord producer_semantic_digest field set and SP-286 full-value comparison, never Storage-assigned sequence/timestamps as caller semantics. Current writer/retry uses dedupe_by_idempotency_key; normal append rejects projector_replay_only as replay_only_not_appendable even for an otherwise valid original. Same actual scoped key and original semantic body returns the actual original receipt/result and no second event/effect. Different body with that identity is idempotency_conflict; behind/unavailable dedupe is dedupe_unavailable. Rebuild/historical read uses the original authenticated recipe and cannot search, verify, execute, authorize, dispatch, charge Usage, notify or write canonical state. It never restarts a retention clock.

  7. Retention. `retention_policy_ref=RP-RUNTIME-365D@1.0.0`. Storage Case L-3 exact class applies: Runtime/run/node/attempt, anchored to the real run completion, 365 days, 1,000,000/run plus 5,000,000/project, roll successor; no imaginary run. Original first-receipt/dedupe/source custody keeps its own policy; every actual hold/reference/backup dependency applies. No body-dereference grant follows from event retention. G15/G23/G26 recommendations in the recount are leads only, not name-based assignments. No new lifetime or deletion rule is chosen here.

  8. Redaction and custody. Seglog is the only canonical event history; original full-value first-receipt custody belongs to SP-286/CV-339 and survives coherent mandatory backup with referenced payload packs, original identity/recipe and recovery controls. Redb/index/GUI/caches never reconstruct lost canonical authority. Keep original accepted input values stable in the live owner operation until its first append settles; there is no newly durable pending-operation journal. On process loss resolve only an actual known original identity; a missing/uncertain source or receipt is unavailable, never permission to mint a replacement. A separately accepted new operation has a genuinely new owner identity, never relabelled restored/retried work. On a verified older restore no omitted request is automatically resumed. Discovery source_receipt_ref may be null when there was no independent existing receipt; a self-reference is not independent custody. Trusted original append/admission custody, not retention of mutable request caches, authenticates valid historical bytes. Every read resolves current access/deletion/tombstone/hold authority for the exact source and checks it again immediately before disclosure; retention/hold never restores visibility. Raw prompts/queries/hidden paths/provider content/credentials/SSH secrets never enter this body; refs are opaque owner-issued objects, never substitute capability. Bodies above SP-337's 16 KiB inline limit use its BLAKE3/size/media payload reference, exact pack bytes durable before referencing acknowledgement. Validate the resolved complete body. Measure every stored part, including any redb value, against storage_profile.value_limit_bytes; externalizing the body never exempts another part from its limit. For a value without an admitted large-value shape, fail that write/advance closed rather than invent a pointer codec.

  9. Transitions and ordering. Use only this family's semantic predicates in paragraph 2. Source identity, state, policy, exact payload, full-value custody and current writer admission must all remain valid at the final append boundary after all helpers; otherwise zero new effect. Per-source actual causal order is preserved through EventRecord sequence and original causation. No timestamp-based dedupe or inferred cross-node order overrides the envelope owner. Historical readers verify the original lawful fact without demanding today's live state. A duplicate is an original-result read, never another transition.

  10. Consumers/checkpoints. This family explicitly adopts `SP-1460` and SP-278 `reader.storage.event_record_index@1.0.0`, including its nine-field durable token (DL-076), full ten-field live read transaction token and no persisted redb_snapshot_id. Operating read consumer is `reader.run.graph_canonical_locked@1.0.0`; its source/selector/currentness and custody rules are exact-family, not borrowed from another row. Family checkpoint disposition is none_required: this consumer owns no durable projection, cursor, receipt, acknowledgement, cache or advance. Only the generic independently published SP-278 checkpoint advances; read/interruption/retry leaves no family-owned effect. No family CAS is applicable because there is no durable advance. The output is one in-memory, bounded, original-family observation after final source/token/access revalidation.

  11. Compatibility and withdrawal. Current writes require this exact family/version/schema/source grant and normal replay policy; unknown future versions are unavailable. No deployed predecessor payload or family-specific converter was found; preserve any genuinely admitted historical envelope through its original verified registry revision and schema/number/time recipe, never relabel it 1.0.0 or rerun current live-state guards. A caller-controlled recipe/version cannot select history. At withdrawal the actual family registry cutoff fences this producer before append (including retry); existing SP-286 original receipt reads remain read-only. Stop new reads/materialization for a withdrawn schema/reader, invalidate its in-flight authority lease, and fence any affected derived generation. StorageMigrationCoordinator installs a separately reviewed successor codec/reader and rebuilds only derived state from the still admitted canonical source under SP-278; it publishes the new reader/generation atomically before reads resume. No source rewrite, schema URI rebind, original receipt reconstruction, native effect or silent upgrade. A malformed/withdrawn/foreign retained record is refused; valid retained history may be read after the current live object changes, with current disclosure controls. Phase 2 must test both directions.

  12. Oracles. `Plans/w3f_event_oracle_plan.json` holds this family's predicate inventory. Phase 2 (2026-11-13) implements it as the executable synthetic checker `scripts/pm_w3f_event_oracles.py`: every refusal is one named single-predicate row of a generated Method B guard table (`scripts/pm_w3f_table_*.py`), proved by the gated shared `scripts/pm_guard_isolation.py` through `scripts/pm-w3f-guard-tables.py`; rows no input can refuse first stay alone in their own table with a written proof. Its complete positives and one-defect negatives are `Plans/w3f_event_fixtures.json` (built by `scripts/pm-w3f-cases.py`), and Storage's sealed write custody stand-in for SP-1101 retained reads is `Plans/w3f_original_custody.json`. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 `date_time` with each field's owner profile; no lane serializer, cap or timestamp grammar is added. This is synthetic oracle evidence only: native work, writer admission and membership stay NOT_RUN/ABSENT.
gui_related: false
gui_classification_reason: Event storage, identity and custody contract; visual presentation belongs to existing
  owners.
depends_on:
- CV-317
- CV-339
- CV-366
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens:
- run.graph_canonical_locked@1.0.0
- reports/event-authority-20261105/W3F-search.json
- run.graph_canonical_locked
- f9c5de6561dff0a53a48e530f2a5c6804a7e941d
- event-family-run-graph-canonical-locked
- ExecutorCanonicalGraph.commit_lock@1.0.0
- storage.first_append_receipt.resolve.v2
- Plans/event_payloads/w3f/run_graph_canonical_locked.schema.json
- pm.event_payload.run.graph_canonical_locked.v1@1.0.0
- Plans/event_payloads/w3f/run_graph_canonical_locked.schema.json
- Plans/Contracts_V0.md#EventRecord
- project~{base64url_no_pad(UTF8(project_id))}
- app
- evt_w3f_
- application@1:{hex(server_id)}:{hex(owner_operation_id)}
- w3f:{event_type}:{hex(owner_operation_id)}
- retention_policy_ref=RP-RUNTIME-365D@1.0.0
- SP-1460
- reader.storage.event_record_index@1.0.0
- reader.run.graph_canonical_locked@1.0.0
- Plans/w3f_event_oracle_plan.json
- scripts/pm_guard_isolation.py
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```

### CV-1461 - session_prompt.admitted Resolved Payload And Owner Contract

```yaml
plan_unit_id: CV-1461
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract for `session_prompt.admitted@1.0.0`; search/reuse evidence: `reports/event-authority-20261105/W3F-search.json` entry `session_prompt.admitted`, base `f9c5de6561dff0a53a48e530f2a5c6804a7e941d`. Existing definitions reused: CV-308; CV-314; CV-317/CV-366; Assistant Chat questionnaire/inbox owner. The family is prepared without admission; membership is ABSENT, never inferred from this unit or its schema. The family candidate id is `event-family-session-prompt-admitted`.

  2. Owner and semantic boundary. Reuse CV-308 admission fields and CV-314 exact inbox identity. Only queued -> admitted; admitted_at_ms is non-null, duplicate_of/execution_ref/rejection_reason_code are null. This is inbox acceptance, never runtime start. payload idempotency_key equals the EventRecord idempotency_key under the exact recipe below. target_thread_id=thread_id=context.thread_id and EventRecord.thread_id; source_session_id is the genuine bound source session. Prompt and execution remain separate. Normalization is an explicitly versioned newly authored technical binding: normalize only CRLF and bare CR to LF in the original complete Unicode scalar prompt; preserve every other scalar, space and order; prompt_hash is SHA-256 of its UTF-8 bytes. normalization_recipe_ref selects this immutable W3F 1.0.0 recipe and joins the actual redacted source custody; it cannot be caller-selected. This fills the searched missing normalized-hash recipe without changing submitted text or exposing it. A changed hash under the same original prompt tuple is a conflict; a duplicate returns the original admission/result with no new execution, not a second event. Replay must never execute a prompt. All other CV-308 states remain owned inbox states; no fifth event family is created. Reuse CV-314: original operation identity is the UTF-8 JSON array [source_session_id,prompt_id,target_thread_id,prompt_hash,admission_state] with the exact four-field prompt tuple selecting the inbox admission, and the exact state component selecting this existing lifecycle fact. admission_id is allocated at the original inbox admission and stays stable across its lifecycle; duplicate delivery never allocates a new admission.

  3. Producer and publication. Only `SessionPromptInbox.admitted@1.0.0` may prepare this exact fact after the actual owner gate. Immutable original input and original owner operation identity are captured before calling helpers. The owner source/body commit (where this fact reports an independently committed source) precedes append. Explicitly adopt SP-286 and CV-339 `storage.first_append_receipt.resolve.v2`: actual original complete EventRecord/semantic input in the same Storage instance resolves the original eleven-field AppendReceipt, original four-field result and exact original wire/full-value commitments. Source commit -> body/pack durability -> family append -> original synced first receipt -> publication is the order. Mutation-authorizing, graph-lock and UI-waited receipts are barrier-class under SP-336/SP-347; no downstream mutation passes the receipt boundary. Missing acknowledgement stays fenced; neither tail absence nor caller flags prove never-issued. With no independent durable source, append is the canonical body commit, never an invented prior canonical value.

  4. Closed payload. `Plans/event_payloads/w3f/session_prompt_admitted.schema.json` is the family's complete, independently closed 1.0.0 resolved-body schema. Every required-present nullable field remains present. Exact type precedes value comparisons (boolean is not integer; string booleans/numbers/null/arrays/objects never coerce). Every identifier/digest full-matches including trailing-LF rejection. Format annotations are enforced by the reviewed shared timestamp profile, not a silently skipped JSON Schema format. An unresolved $ref in any branch refuses schema installation eagerly.

  5. Scope and identity. This family's candidate payload is `pm.event_payload.session_prompt.admitted.v1@1.0.0` at `Plans/event_payloads/w3f/session_prompt_admitted.schema.json`. The schema closes the resolved body, not a new envelope. Adopt `Plans/Contracts_V0.md#EventRecord`, CV-317 and CV-366 by name. Match context.scope_kind/project_id/thread_id to EventRecord and actual accepted owner context; the genuine owning Server/Host/root/worktree/remote joins must all agree. No focus fallback, empty Project, hidden root, cross-Server or cross-thread substitution. Project scope uses Storage's exact `project~{base64url_no_pad(UTF8(project_id))}` partition; application scope is `app`, project_id null and an actual owning Server/Host. Discovery additionally requires its real thread/admitted root under T-161; prompts require their actual target thread under CV-314. Other thread/root/worktree/remote refs are present only when the genuine operation has them; no working root is invented for a rootless inbox or non-file invocation. Reuse CV-314: original operation identity is the UTF-8 JSON array [source_session_id,prompt_id,target_thread_id,prompt_hash,admission_state] with the exact four-field prompt tuple selecting the inbox admission, and the exact state component selecting this existing lifecycle fact. admission_id is allocated at the original inbox admission and stays stable across its lifecycle; duplicate delivery never allocates a new admission. owner_operation_id is exactly the canonical JSON string array [source_session_id,prompt_id,target_thread_id,prompt_hash,admission_state] specified here; source_session_id is CV-314 session_id. This exact immutable state component is the optional-effect discriminator required by CV-366. event_id is `evt_w3f_` plus lowercase SHA-256 of RFC 8785 JSON array of strings [actual storage_instance_id, Storage-owned recovery_epoch in its canonical decimal string form, actual scope_partition, exact event_type, owner_operation_id]. Application idempotency_key is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}` (lowercase hex of exact UTF-8); Project idempotency_key is `w3f:{event_type}:{hex(owner_operation_id)}`. All identity inputs, including the actual original Storage recovery_epoch, are frozen at first preparation and retained on every retry; a later restore/current epoch never remints the original. No timestamp/retry counter/focus or projection revision enters identity. Recompute expected identities from captured trusted original inputs, never a supplied digest. No numeric or timestamp code is owned here: producer-semantic digest and numeric/date-time qualification stay in EventRecord/CV-317/CV-339/SP-236 and the reviewed shared CV-1100/CV-1101/SP-1100/SP-1101 successors adopted in phase 2. Until those reviewed prerequisites and this family's admission exist the current writer is unavailable. No schema cap narrows Storage uint64.

  6. Replay and idempotency. Adopt the unchanged EventRecord producer_semantic_digest field set and SP-286 full-value comparison, never Storage-assigned sequence/timestamps as caller semantics. Current writer/retry uses dedupe_by_idempotency_key; normal append rejects projector_replay_only as replay_only_not_appendable even for an otherwise valid original. Same actual scoped key and original semantic body returns the actual original receipt/result and no second event/effect. Different body with that identity is idempotency_conflict; behind/unavailable dedupe is dedupe_unavailable. Rebuild/historical read uses the original authenticated recipe and cannot search, verify, execute, authorize, dispatch, charge Usage, notify or write canonical state. It never restarts a retention clock.

  7. Retention. `retention_policy_ref=RP-CHAT-THREAD-LIFETIME@1.0.0`, bound by DL-456 (E-CARDS-3 item 4.a, option A) as Storage's third-sitting assignment records it (`Plans/storage-plan.md`, "Kept as long as the target chat exists, four session-prompt request histories (DL-456)"). session_prompt.admitted is kept as long as its target chat exists, in Project and application chats alike. It counts together with every other family using that chat's existing 250,000-entry shared limit and continues in a linked continuation of the same chat's history, kept and deleted with that chat, instead of silently dropping history. Deleting the target chat hides it immediately, purges unheld active copies within 24 hours and backup bytes within 30 days; a hold delays purge and never restores visibility. No new application allowance is created, and the prompt text keeps its own lifetime. Original first-receipt/dedupe/source custody keeps its own policy; every actual hold/reference/backup dependency applies. No body-dereference grant follows from event retention. This binding adds no lifetime or deletion rule beyond DL-456.

  8. Redaction and custody. Seglog is the only canonical event history; original full-value first-receipt custody belongs to SP-286/CV-339 and survives coherent mandatory backup with referenced payload packs, original identity/recipe and recovery controls. Redb/index/GUI/caches never reconstruct lost canonical authority. Keep original accepted input values stable in the live owner operation until its first append settles; there is no newly durable pending-operation journal. On process loss resolve only an actual known original identity; a missing/uncertain source or receipt is unavailable, never permission to mint a replacement. A separately accepted new operation has a genuinely new owner identity, never relabelled restored/retried work. On a verified older restore no omitted request is automatically resumed. Discovery source_receipt_ref may be null when there was no independent existing receipt; a self-reference is not independent custody. Trusted original append/admission custody, not retention of mutable request caches, authenticates valid historical bytes. Every read resolves current access/deletion/tombstone/hold authority for the exact source and checks it again immediately before disclosure; retention/hold never restores visibility. Raw prompts/queries/hidden paths/provider content/credentials/SSH secrets never enter this body; refs are opaque owner-issued objects, never substitute capability. Bodies above SP-337's 16 KiB inline limit use its BLAKE3/size/media payload reference, exact pack bytes durable before referencing acknowledgement. Validate the resolved complete body. Measure every stored part, including any redb value, against storage_profile.value_limit_bytes; externalizing the body never exempts another part from its limit. For a value without an admitted large-value shape, fail that write/advance closed rather than invent a pointer codec.

  9. Transitions and ordering. Use only this family's semantic predicates in paragraph 2. Source identity, state, policy, exact payload, full-value custody and current writer admission must all remain valid at the final append boundary after all helpers; otherwise zero new effect. Per-source actual causal order is preserved through EventRecord sequence and original causation. No timestamp-based dedupe or inferred cross-node order overrides the envelope owner. Historical readers verify the original lawful fact without demanding today's live state. A duplicate is an original-result read, never another transition.

  10. Consumers/checkpoints. This family explicitly adopts `SP-1461` and SP-278 `reader.storage.event_record_index@1.0.0`, including its nine-field durable token (DL-076), full ten-field live read transaction token and no persisted redb_snapshot_id. Operating read consumer is `reader.session_prompt.admitted@1.0.0`; its source/selector/currentness and custody rules are exact-family, not borrowed from another row. Family checkpoint disposition is none_required: this consumer owns no durable projection, cursor, receipt, acknowledgement, cache or advance. Only the generic independently published SP-278 checkpoint advances; read/interruption/retry leaves no family-owned effect. No family CAS is applicable because there is no durable advance. The output is one in-memory, bounded, original-family observation after final source/token/access revalidation.

  11. Compatibility and withdrawal. Current writes require this exact family/version/schema/source grant and normal replay policy; unknown future versions are unavailable. No deployed predecessor payload or family-specific converter was found; preserve any genuinely admitted historical envelope through its original verified registry revision and schema/number/time recipe, never relabel it 1.0.0 or rerun current live-state guards. A caller-controlled recipe/version cannot select history. At withdrawal the actual family registry cutoff fences this producer before append (including retry); existing SP-286 original receipt reads remain read-only. Stop new reads/materialization for a withdrawn schema/reader, invalidate its in-flight authority lease, and fence any affected derived generation. StorageMigrationCoordinator installs a separately reviewed successor codec/reader and rebuilds only derived state from the still admitted canonical source under SP-278; it publishes the new reader/generation atomically before reads resume. No source rewrite, schema URI rebind, original receipt reconstruction, native effect or silent upgrade. A malformed/withdrawn/foreign retained record is refused; valid retained history may be read after the current live object changes, with current disclosure controls. Phase 2 must test both directions.

  12. Oracles. `Plans/w3f_event_oracle_plan.json` holds this family's predicate inventory. Phase 2 (2026-11-13) implements it as the executable synthetic checker `scripts/pm_w3f_event_oracles.py`: every refusal is one named single-predicate row of a generated Method B guard table (`scripts/pm_w3f_table_*.py`), proved by the gated shared `scripts/pm_guard_isolation.py` through `scripts/pm-w3f-guard-tables.py`; rows no input can refuse first stay alone in their own table with a written proof. Its complete positives and one-defect negatives are `Plans/w3f_event_fixtures.json` (built by `scripts/pm-w3f-cases.py`), and Storage's sealed write custody stand-in for SP-1101 retained reads is `Plans/w3f_original_custody.json`. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 `date_time` with each field's owner profile; no lane serializer, cap or timestamp grammar is added. This is synthetic oracle evidence only: native work, writer admission and membership stay NOT_RUN/ABSENT.
gui_related: true
gui_classification_reason: User-visible inbox/receipt inspection consumes this contract.
depends_on:
- CV-317
- CV-339
- CV-366
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens:
- session_prompt.admitted@1.0.0
- reports/event-authority-20261105/W3F-search.json
- session_prompt.admitted
- f9c5de6561dff0a53a48e530f2a5c6804a7e941d
- event-family-session-prompt-admitted
- SessionPromptInbox.admitted@1.0.0
- storage.first_append_receipt.resolve.v2
- Plans/event_payloads/w3f/session_prompt_admitted.schema.json
- pm.event_payload.session_prompt.admitted.v1@1.0.0
- Plans/event_payloads/w3f/session_prompt_admitted.schema.json
- Plans/Contracts_V0.md#EventRecord
- project~{base64url_no_pad(UTF8(project_id))}
- app
- evt_w3f_
- application@1:{hex(server_id)}:{hex(owner_operation_id)}
- w3f:{event_type}:{hex(owner_operation_id)}
- retention_policy_ref=RP-CHAT-THREAD-LIFETIME@1.0.0
- SP-1461
- reader.storage.event_record_index@1.0.0
- reader.session_prompt.admitted@1.0.0
- Plans/w3f_event_oracle_plan.json
- scripts/pm_guard_isolation.py
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```

### CV-1462 - session_prompt.cancelled Resolved Payload And Owner Contract

```yaml
plan_unit_id: CV-1462
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract for `session_prompt.cancelled@1.0.0`; search/reuse evidence: `reports/event-authority-20261105/W3F-search.json` entry `session_prompt.cancelled`, base `f9c5de6561dff0a53a48e530f2a5c6804a7e941d`. Existing definitions reused: CV-308; CV-314; CV-317/CV-366; Assistant Chat questionnaire/inbox owner. The family is prepared without admission; membership is ABSENT, never inferred from this unit or its schema. The family candidate id is `event-family-session-prompt-cancelled`.

  2. Owner and semantic boundary. Reuse CV-308 admission fields and CV-314 exact inbox identity. Only queued or admitted -> cancelled_before_execution, with no execution bound. execution_ref and duplicate_of are null. No cancellation after execution binding is represented by this family. payload idempotency_key equals the EventRecord idempotency_key under the exact recipe below. target_thread_id=thread_id=context.thread_id and EventRecord.thread_id; source_session_id is the genuine bound source session. Prompt and execution remain separate. Normalization is an explicitly versioned newly authored technical binding: normalize only CRLF and bare CR to LF in the original complete Unicode scalar prompt; preserve every other scalar, space and order; prompt_hash is SHA-256 of its UTF-8 bytes. normalization_recipe_ref selects this immutable W3F 1.0.0 recipe and joins the actual redacted source custody; it cannot be caller-selected. This fills the searched missing normalized-hash recipe without changing submitted text or exposing it. A changed hash under the same original prompt tuple is a conflict; a duplicate returns the original admission/result with no new execution, not a second event. Replay must never execute a prompt. All other CV-308 states remain owned inbox states; no fifth event family is created. Reuse CV-314: original operation identity is the UTF-8 JSON array [source_session_id,prompt_id,target_thread_id,prompt_hash,admission_state] with the exact four-field prompt tuple selecting the inbox admission, and the exact state component selecting this existing lifecycle fact. admission_id is allocated at the original inbox admission and stays stable across its lifecycle; duplicate delivery never allocates a new admission.

  3. Producer and publication. Only `SessionPromptInbox.cancelled@1.0.0` may prepare this exact fact after the actual owner gate. Immutable original input and original owner operation identity are captured before calling helpers. The owner source/body commit (where this fact reports an independently committed source) precedes append. Explicitly adopt SP-286 and CV-339 `storage.first_append_receipt.resolve.v2`: actual original complete EventRecord/semantic input in the same Storage instance resolves the original eleven-field AppendReceipt, original four-field result and exact original wire/full-value commitments. Source commit -> body/pack durability -> family append -> original synced first receipt -> publication is the order. Mutation-authorizing, graph-lock and UI-waited receipts are barrier-class under SP-336/SP-347; no downstream mutation passes the receipt boundary. Missing acknowledgement stays fenced; neither tail absence nor caller flags prove never-issued. With no independent durable source, append is the canonical body commit, never an invented prior canonical value.

  4. Closed payload. `Plans/event_payloads/w3f/session_prompt_cancelled.schema.json` is the family's complete, independently closed 1.0.0 resolved-body schema. Every required-present nullable field remains present. Exact type precedes value comparisons (boolean is not integer; string booleans/numbers/null/arrays/objects never coerce). Every identifier/digest full-matches including trailing-LF rejection. Format annotations are enforced by the reviewed shared timestamp profile, not a silently skipped JSON Schema format. An unresolved $ref in any branch refuses schema installation eagerly.

  5. Scope and identity. This family's candidate payload is `pm.event_payload.session_prompt.cancelled.v1@1.0.0` at `Plans/event_payloads/w3f/session_prompt_cancelled.schema.json`. The schema closes the resolved body, not a new envelope. Adopt `Plans/Contracts_V0.md#EventRecord`, CV-317 and CV-366 by name. Match context.scope_kind/project_id/thread_id to EventRecord and actual accepted owner context; the genuine owning Server/Host/root/worktree/remote joins must all agree. No focus fallback, empty Project, hidden root, cross-Server or cross-thread substitution. Project scope uses Storage's exact `project~{base64url_no_pad(UTF8(project_id))}` partition; application scope is `app`, project_id null and an actual owning Server/Host. Discovery additionally requires its real thread/admitted root under T-161; prompts require their actual target thread under CV-314. Other thread/root/worktree/remote refs are present only when the genuine operation has them; no working root is invented for a rootless inbox or non-file invocation. Reuse CV-314: original operation identity is the UTF-8 JSON array [source_session_id,prompt_id,target_thread_id,prompt_hash,admission_state] with the exact four-field prompt tuple selecting the inbox admission, and the exact state component selecting this existing lifecycle fact. admission_id is allocated at the original inbox admission and stays stable across its lifecycle; duplicate delivery never allocates a new admission. owner_operation_id is exactly the canonical JSON string array [source_session_id,prompt_id,target_thread_id,prompt_hash,admission_state] specified here; source_session_id is CV-314 session_id. This exact immutable state component is the optional-effect discriminator required by CV-366. event_id is `evt_w3f_` plus lowercase SHA-256 of RFC 8785 JSON array of strings [actual storage_instance_id, Storage-owned recovery_epoch in its canonical decimal string form, actual scope_partition, exact event_type, owner_operation_id]. Application idempotency_key is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}` (lowercase hex of exact UTF-8); Project idempotency_key is `w3f:{event_type}:{hex(owner_operation_id)}`. All identity inputs, including the actual original Storage recovery_epoch, are frozen at first preparation and retained on every retry; a later restore/current epoch never remints the original. No timestamp/retry counter/focus or projection revision enters identity. Recompute expected identities from captured trusted original inputs, never a supplied digest. No numeric or timestamp code is owned here: producer-semantic digest and numeric/date-time qualification stay in EventRecord/CV-317/CV-339/SP-236 and the reviewed shared CV-1100/CV-1101/SP-1100/SP-1101 successors adopted in phase 2. Until those reviewed prerequisites and this family's admission exist the current writer is unavailable. No schema cap narrows Storage uint64.

  6. Replay and idempotency. Adopt the unchanged EventRecord producer_semantic_digest field set and SP-286 full-value comparison, never Storage-assigned sequence/timestamps as caller semantics. Current writer/retry uses dedupe_by_idempotency_key; normal append rejects projector_replay_only as replay_only_not_appendable even for an otherwise valid original. Same actual scoped key and original semantic body returns the actual original receipt/result and no second event/effect. Different body with that identity is idempotency_conflict; behind/unavailable dedupe is dedupe_unavailable. Rebuild/historical read uses the original authenticated recipe and cannot search, verify, execute, authorize, dispatch, charge Usage, notify or write canonical state. It never restarts a retention clock.

  7. Retention. `retention_policy_ref=RP-CHAT-THREAD-LIFETIME@1.0.0`, bound by DL-456 (E-CARDS-3 item 4.a, option A) as Storage's third-sitting assignment records it (`Plans/storage-plan.md`, "Kept as long as the target chat exists, four session-prompt request histories (DL-456)"). session_prompt.cancelled is kept as long as its target chat exists, in Project and application chats alike. It counts together with every other family using that chat's existing 250,000-entry shared limit and continues in a linked continuation of the same chat's history, kept and deleted with that chat, instead of silently dropping history. Deleting the target chat hides it immediately, purges unheld active copies within 24 hours and backup bytes within 30 days; a hold delays purge and never restores visibility. No new application allowance is created, and the prompt text keeps its own lifetime. Original first-receipt/dedupe/source custody keeps its own policy; every actual hold/reference/backup dependency applies. No body-dereference grant follows from event retention. This binding adds no lifetime or deletion rule beyond DL-456.

  8. Redaction and custody. Seglog is the only canonical event history; original full-value first-receipt custody belongs to SP-286/CV-339 and survives coherent mandatory backup with referenced payload packs, original identity/recipe and recovery controls. Redb/index/GUI/caches never reconstruct lost canonical authority. Keep original accepted input values stable in the live owner operation until its first append settles; there is no newly durable pending-operation journal. On process loss resolve only an actual known original identity; a missing/uncertain source or receipt is unavailable, never permission to mint a replacement. A separately accepted new operation has a genuinely new owner identity, never relabelled restored/retried work. On a verified older restore no omitted request is automatically resumed. Discovery source_receipt_ref may be null when there was no independent existing receipt; a self-reference is not independent custody. Trusted original append/admission custody, not retention of mutable request caches, authenticates valid historical bytes. Every read resolves current access/deletion/tombstone/hold authority for the exact source and checks it again immediately before disclosure; retention/hold never restores visibility. Raw prompts/queries/hidden paths/provider content/credentials/SSH secrets never enter this body; refs are opaque owner-issued objects, never substitute capability. Bodies above SP-337's 16 KiB inline limit use its BLAKE3/size/media payload reference, exact pack bytes durable before referencing acknowledgement. Validate the resolved complete body. Measure every stored part, including any redb value, against storage_profile.value_limit_bytes; externalizing the body never exempts another part from its limit. For a value without an admitted large-value shape, fail that write/advance closed rather than invent a pointer codec.

  9. Transitions and ordering. Use only this family's semantic predicates in paragraph 2. Source identity, state, policy, exact payload, full-value custody and current writer admission must all remain valid at the final append boundary after all helpers; otherwise zero new effect. Per-source actual causal order is preserved through EventRecord sequence and original causation. No timestamp-based dedupe or inferred cross-node order overrides the envelope owner. Historical readers verify the original lawful fact without demanding today's live state. A duplicate is an original-result read, never another transition.

  10. Consumers/checkpoints. This family explicitly adopts `SP-1462` and SP-278 `reader.storage.event_record_index@1.0.0`, including its nine-field durable token (DL-076), full ten-field live read transaction token and no persisted redb_snapshot_id. Operating read consumer is `reader.session_prompt.cancelled@1.0.0`; its source/selector/currentness and custody rules are exact-family, not borrowed from another row. Family checkpoint disposition is none_required: this consumer owns no durable projection, cursor, receipt, acknowledgement, cache or advance. Only the generic independently published SP-278 checkpoint advances; read/interruption/retry leaves no family-owned effect. No family CAS is applicable because there is no durable advance. The output is one in-memory, bounded, original-family observation after final source/token/access revalidation.

  11. Compatibility and withdrawal. Current writes require this exact family/version/schema/source grant and normal replay policy; unknown future versions are unavailable. No deployed predecessor payload or family-specific converter was found; preserve any genuinely admitted historical envelope through its original verified registry revision and schema/number/time recipe, never relabel it 1.0.0 or rerun current live-state guards. A caller-controlled recipe/version cannot select history. At withdrawal the actual family registry cutoff fences this producer before append (including retry); existing SP-286 original receipt reads remain read-only. Stop new reads/materialization for a withdrawn schema/reader, invalidate its in-flight authority lease, and fence any affected derived generation. StorageMigrationCoordinator installs a separately reviewed successor codec/reader and rebuilds only derived state from the still admitted canonical source under SP-278; it publishes the new reader/generation atomically before reads resume. No source rewrite, schema URI rebind, original receipt reconstruction, native effect or silent upgrade. A malformed/withdrawn/foreign retained record is refused; valid retained history may be read after the current live object changes, with current disclosure controls. Phase 2 must test both directions.

  12. Oracles. `Plans/w3f_event_oracle_plan.json` holds this family's predicate inventory. Phase 2 (2026-11-13) implements it as the executable synthetic checker `scripts/pm_w3f_event_oracles.py`: every refusal is one named single-predicate row of a generated Method B guard table (`scripts/pm_w3f_table_*.py`), proved by the gated shared `scripts/pm_guard_isolation.py` through `scripts/pm-w3f-guard-tables.py`; rows no input can refuse first stay alone in their own table with a written proof. Its complete positives and one-defect negatives are `Plans/w3f_event_fixtures.json` (built by `scripts/pm-w3f-cases.py`), and Storage's sealed write custody stand-in for SP-1101 retained reads is `Plans/w3f_original_custody.json`. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 `date_time` with each field's owner profile; no lane serializer, cap or timestamp grammar is added. This is synthetic oracle evidence only: native work, writer admission and membership stay NOT_RUN/ABSENT.
gui_related: true
gui_classification_reason: User-visible inbox/receipt inspection consumes this contract.
depends_on:
- CV-317
- CV-339
- CV-366
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens:
- session_prompt.cancelled@1.0.0
- reports/event-authority-20261105/W3F-search.json
- session_prompt.cancelled
- f9c5de6561dff0a53a48e530f2a5c6804a7e941d
- event-family-session-prompt-cancelled
- SessionPromptInbox.cancelled@1.0.0
- storage.first_append_receipt.resolve.v2
- Plans/event_payloads/w3f/session_prompt_cancelled.schema.json
- pm.event_payload.session_prompt.cancelled.v1@1.0.0
- Plans/event_payloads/w3f/session_prompt_cancelled.schema.json
- Plans/Contracts_V0.md#EventRecord
- project~{base64url_no_pad(UTF8(project_id))}
- app
- evt_w3f_
- application@1:{hex(server_id)}:{hex(owner_operation_id)}
- w3f:{event_type}:{hex(owner_operation_id)}
- retention_policy_ref=RP-CHAT-THREAD-LIFETIME@1.0.0
- SP-1462
- reader.storage.event_record_index@1.0.0
- reader.session_prompt.cancelled@1.0.0
- Plans/w3f_event_oracle_plan.json
- scripts/pm_guard_isolation.py
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```

### CV-1463 - session_prompt.expired Resolved Payload And Owner Contract

```yaml
plan_unit_id: CV-1463
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract for `session_prompt.expired@1.0.0`; search/reuse evidence: `reports/event-authority-20261105/W3F-search.json` entry `session_prompt.expired`, base `f9c5de6561dff0a53a48e530f2a5c6804a7e941d`. Existing definitions reused: CV-308; CV-314; CV-317/CV-366; Assistant Chat questionnaire/inbox owner. The family is prepared without admission; membership is ABSENT, never inferred from this unit or its schema. The family candidate id is `event-family-session-prompt-expired`.

  2. Owner and semantic boundary. Reuse CV-308 admission fields and CV-314 exact inbox identity. Only queued or admitted -> expired under the actual existing expiry source; no default timeout is invented. execution_ref and duplicate_of are null. payload idempotency_key equals the EventRecord idempotency_key under the exact recipe below. target_thread_id=thread_id=context.thread_id and EventRecord.thread_id; source_session_id is the genuine bound source session. Prompt and execution remain separate. Normalization is an explicitly versioned newly authored technical binding: normalize only CRLF and bare CR to LF in the original complete Unicode scalar prompt; preserve every other scalar, space and order; prompt_hash is SHA-256 of its UTF-8 bytes. normalization_recipe_ref selects this immutable W3F 1.0.0 recipe and joins the actual redacted source custody; it cannot be caller-selected. This fills the searched missing normalized-hash recipe without changing submitted text or exposing it. A changed hash under the same original prompt tuple is a conflict; a duplicate returns the original admission/result with no new execution, not a second event. Replay must never execute a prompt. All other CV-308 states remain owned inbox states; no fifth event family is created. Reuse CV-314: original operation identity is the UTF-8 JSON array [source_session_id,prompt_id,target_thread_id,prompt_hash,admission_state] with the exact four-field prompt tuple selecting the inbox admission, and the exact state component selecting this existing lifecycle fact. admission_id is allocated at the original inbox admission and stays stable across its lifecycle; duplicate delivery never allocates a new admission.

  3. Producer and publication. Only `SessionPromptInbox.expired@1.0.0` may prepare this exact fact after the actual owner gate. Immutable original input and original owner operation identity are captured before calling helpers. The owner source/body commit (where this fact reports an independently committed source) precedes append. Explicitly adopt SP-286 and CV-339 `storage.first_append_receipt.resolve.v2`: actual original complete EventRecord/semantic input in the same Storage instance resolves the original eleven-field AppendReceipt, original four-field result and exact original wire/full-value commitments. Source commit -> body/pack durability -> family append -> original synced first receipt -> publication is the order. Mutation-authorizing, graph-lock and UI-waited receipts are barrier-class under SP-336/SP-347; no downstream mutation passes the receipt boundary. Missing acknowledgement stays fenced; neither tail absence nor caller flags prove never-issued. With no independent durable source, append is the canonical body commit, never an invented prior canonical value.

  4. Closed payload. `Plans/event_payloads/w3f/session_prompt_expired.schema.json` is the family's complete, independently closed 1.0.0 resolved-body schema. Every required-present nullable field remains present. Exact type precedes value comparisons (boolean is not integer; string booleans/numbers/null/arrays/objects never coerce). Every identifier/digest full-matches including trailing-LF rejection. Format annotations are enforced by the reviewed shared timestamp profile, not a silently skipped JSON Schema format. An unresolved $ref in any branch refuses schema installation eagerly.

  5. Scope and identity. This family's candidate payload is `pm.event_payload.session_prompt.expired.v1@1.0.0` at `Plans/event_payloads/w3f/session_prompt_expired.schema.json`. The schema closes the resolved body, not a new envelope. Adopt `Plans/Contracts_V0.md#EventRecord`, CV-317 and CV-366 by name. Match context.scope_kind/project_id/thread_id to EventRecord and actual accepted owner context; the genuine owning Server/Host/root/worktree/remote joins must all agree. No focus fallback, empty Project, hidden root, cross-Server or cross-thread substitution. Project scope uses Storage's exact `project~{base64url_no_pad(UTF8(project_id))}` partition; application scope is `app`, project_id null and an actual owning Server/Host. Discovery additionally requires its real thread/admitted root under T-161; prompts require their actual target thread under CV-314. Other thread/root/worktree/remote refs are present only when the genuine operation has them; no working root is invented for a rootless inbox or non-file invocation. Reuse CV-314: original operation identity is the UTF-8 JSON array [source_session_id,prompt_id,target_thread_id,prompt_hash,admission_state] with the exact four-field prompt tuple selecting the inbox admission, and the exact state component selecting this existing lifecycle fact. admission_id is allocated at the original inbox admission and stays stable across its lifecycle; duplicate delivery never allocates a new admission. owner_operation_id is exactly the canonical JSON string array [source_session_id,prompt_id,target_thread_id,prompt_hash,admission_state] specified here; source_session_id is CV-314 session_id. This exact immutable state component is the optional-effect discriminator required by CV-366. event_id is `evt_w3f_` plus lowercase SHA-256 of RFC 8785 JSON array of strings [actual storage_instance_id, Storage-owned recovery_epoch in its canonical decimal string form, actual scope_partition, exact event_type, owner_operation_id]. Application idempotency_key is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}` (lowercase hex of exact UTF-8); Project idempotency_key is `w3f:{event_type}:{hex(owner_operation_id)}`. All identity inputs, including the actual original Storage recovery_epoch, are frozen at first preparation and retained on every retry; a later restore/current epoch never remints the original. No timestamp/retry counter/focus or projection revision enters identity. Recompute expected identities from captured trusted original inputs, never a supplied digest. No numeric or timestamp code is owned here: producer-semantic digest and numeric/date-time qualification stay in EventRecord/CV-317/CV-339/SP-236 and the reviewed shared CV-1100/CV-1101/SP-1100/SP-1101 successors adopted in phase 2. Until those reviewed prerequisites and this family's admission exist the current writer is unavailable. No schema cap narrows Storage uint64.

  6. Replay and idempotency. Adopt the unchanged EventRecord producer_semantic_digest field set and SP-286 full-value comparison, never Storage-assigned sequence/timestamps as caller semantics. Current writer/retry uses dedupe_by_idempotency_key; normal append rejects projector_replay_only as replay_only_not_appendable even for an otherwise valid original. Same actual scoped key and original semantic body returns the actual original receipt/result and no second event/effect. Different body with that identity is idempotency_conflict; behind/unavailable dedupe is dedupe_unavailable. Rebuild/historical read uses the original authenticated recipe and cannot search, verify, execute, authorize, dispatch, charge Usage, notify or write canonical state. It never restarts a retention clock.

  7. Retention. `retention_policy_ref=RP-CHAT-THREAD-LIFETIME@1.0.0`, bound by DL-456 (E-CARDS-3 item 4.a, option A) as Storage's third-sitting assignment records it (`Plans/storage-plan.md`, "Kept as long as the target chat exists, four session-prompt request histories (DL-456)"). session_prompt.expired is kept as long as its target chat exists, in Project and application chats alike. It counts together with every other family using that chat's existing 250,000-entry shared limit and continues in a linked continuation of the same chat's history, kept and deleted with that chat, instead of silently dropping history. Deleting the target chat hides it immediately, purges unheld active copies within 24 hours and backup bytes within 30 days; a hold delays purge and never restores visibility. No new application allowance is created, and the prompt text keeps its own lifetime. Original first-receipt/dedupe/source custody keeps its own policy; every actual hold/reference/backup dependency applies. No body-dereference grant follows from event retention. This binding adds no lifetime or deletion rule beyond DL-456.

  8. Redaction and custody. Seglog is the only canonical event history; original full-value first-receipt custody belongs to SP-286/CV-339 and survives coherent mandatory backup with referenced payload packs, original identity/recipe and recovery controls. Redb/index/GUI/caches never reconstruct lost canonical authority. Keep original accepted input values stable in the live owner operation until its first append settles; there is no newly durable pending-operation journal. On process loss resolve only an actual known original identity; a missing/uncertain source or receipt is unavailable, never permission to mint a replacement. A separately accepted new operation has a genuinely new owner identity, never relabelled restored/retried work. On a verified older restore no omitted request is automatically resumed. Discovery source_receipt_ref may be null when there was no independent existing receipt; a self-reference is not independent custody. Trusted original append/admission custody, not retention of mutable request caches, authenticates valid historical bytes. Every read resolves current access/deletion/tombstone/hold authority for the exact source and checks it again immediately before disclosure; retention/hold never restores visibility. Raw prompts/queries/hidden paths/provider content/credentials/SSH secrets never enter this body; refs are opaque owner-issued objects, never substitute capability. Bodies above SP-337's 16 KiB inline limit use its BLAKE3/size/media payload reference, exact pack bytes durable before referencing acknowledgement. Validate the resolved complete body. Measure every stored part, including any redb value, against storage_profile.value_limit_bytes; externalizing the body never exempts another part from its limit. For a value without an admitted large-value shape, fail that write/advance closed rather than invent a pointer codec.

  9. Transitions and ordering. Use only this family's semantic predicates in paragraph 2. Source identity, state, policy, exact payload, full-value custody and current writer admission must all remain valid at the final append boundary after all helpers; otherwise zero new effect. Per-source actual causal order is preserved through EventRecord sequence and original causation. No timestamp-based dedupe or inferred cross-node order overrides the envelope owner. Historical readers verify the original lawful fact without demanding today's live state. A duplicate is an original-result read, never another transition.

  10. Consumers/checkpoints. This family explicitly adopts `SP-1463` and SP-278 `reader.storage.event_record_index@1.0.0`, including its nine-field durable token (DL-076), full ten-field live read transaction token and no persisted redb_snapshot_id. Operating read consumer is `reader.session_prompt.expired@1.0.0`; its source/selector/currentness and custody rules are exact-family, not borrowed from another row. Family checkpoint disposition is none_required: this consumer owns no durable projection, cursor, receipt, acknowledgement, cache or advance. Only the generic independently published SP-278 checkpoint advances; read/interruption/retry leaves no family-owned effect. No family CAS is applicable because there is no durable advance. The output is one in-memory, bounded, original-family observation after final source/token/access revalidation.

  11. Compatibility and withdrawal. Current writes require this exact family/version/schema/source grant and normal replay policy; unknown future versions are unavailable. No deployed predecessor payload or family-specific converter was found; preserve any genuinely admitted historical envelope through its original verified registry revision and schema/number/time recipe, never relabel it 1.0.0 or rerun current live-state guards. A caller-controlled recipe/version cannot select history. At withdrawal the actual family registry cutoff fences this producer before append (including retry); existing SP-286 original receipt reads remain read-only. Stop new reads/materialization for a withdrawn schema/reader, invalidate its in-flight authority lease, and fence any affected derived generation. StorageMigrationCoordinator installs a separately reviewed successor codec/reader and rebuilds only derived state from the still admitted canonical source under SP-278; it publishes the new reader/generation atomically before reads resume. No source rewrite, schema URI rebind, original receipt reconstruction, native effect or silent upgrade. A malformed/withdrawn/foreign retained record is refused; valid retained history may be read after the current live object changes, with current disclosure controls. Phase 2 must test both directions.

  12. Oracles. `Plans/w3f_event_oracle_plan.json` holds this family's predicate inventory. Phase 2 (2026-11-13) implements it as the executable synthetic checker `scripts/pm_w3f_event_oracles.py`: every refusal is one named single-predicate row of a generated Method B guard table (`scripts/pm_w3f_table_*.py`), proved by the gated shared `scripts/pm_guard_isolation.py` through `scripts/pm-w3f-guard-tables.py`; rows no input can refuse first stay alone in their own table with a written proof. Its complete positives and one-defect negatives are `Plans/w3f_event_fixtures.json` (built by `scripts/pm-w3f-cases.py`), and Storage's sealed write custody stand-in for SP-1101 retained reads is `Plans/w3f_original_custody.json`. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 `date_time` with each field's owner profile; no lane serializer, cap or timestamp grammar is added. This is synthetic oracle evidence only: native work, writer admission and membership stay NOT_RUN/ABSENT.
gui_related: true
gui_classification_reason: User-visible inbox/receipt inspection consumes this contract.
depends_on:
- CV-317
- CV-339
- CV-366
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens:
- session_prompt.expired@1.0.0
- reports/event-authority-20261105/W3F-search.json
- session_prompt.expired
- f9c5de6561dff0a53a48e530f2a5c6804a7e941d
- event-family-session-prompt-expired
- SessionPromptInbox.expired@1.0.0
- storage.first_append_receipt.resolve.v2
- Plans/event_payloads/w3f/session_prompt_expired.schema.json
- pm.event_payload.session_prompt.expired.v1@1.0.0
- Plans/event_payloads/w3f/session_prompt_expired.schema.json
- Plans/Contracts_V0.md#EventRecord
- project~{base64url_no_pad(UTF8(project_id))}
- app
- evt_w3f_
- application@1:{hex(server_id)}:{hex(owner_operation_id)}
- w3f:{event_type}:{hex(owner_operation_id)}
- retention_policy_ref=RP-CHAT-THREAD-LIFETIME@1.0.0
- SP-1463
- reader.storage.event_record_index@1.0.0
- reader.session_prompt.expired@1.0.0
- Plans/w3f_event_oracle_plan.json
- scripts/pm_guard_isolation.py
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```

### CV-1464 - session_prompt.rejected Resolved Payload And Owner Contract

```yaml
plan_unit_id: CV-1464
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract for `session_prompt.rejected@1.0.0`; search/reuse evidence: `reports/event-authority-20261105/W3F-search.json` entry `session_prompt.rejected`, base `f9c5de6561dff0a53a48e530f2a5c6804a7e941d`. Existing definitions reused: CV-308; CV-314; CV-317/CV-366; Assistant Chat questionnaire/inbox owner. The family is prepared without admission; membership is ABSENT, never inferred from this unit or its schema. The family candidate id is `event-family-session-prompt-rejected`.

  2. Owner and semantic boundary. Reuse CV-308 admission fields and CV-314 exact inbox identity. An actually refused inbox request -> rejected with non-null rejection_reason_code and null execution_ref, duplicate_of and admitted_at_ms. No prior admitted/terminal operation may be relabelled rejected. payload idempotency_key equals the EventRecord idempotency_key under the exact recipe below. target_thread_id=thread_id=context.thread_id and EventRecord.thread_id; source_session_id is the genuine bound source session. Prompt and execution remain separate. Normalization is an explicitly versioned newly authored technical binding: normalize only CRLF and bare CR to LF in the original complete Unicode scalar prompt; preserve every other scalar, space and order; prompt_hash is SHA-256 of its UTF-8 bytes. normalization_recipe_ref selects this immutable W3F 1.0.0 recipe and joins the actual redacted source custody; it cannot be caller-selected. This fills the searched missing normalized-hash recipe without changing submitted text or exposing it. A changed hash under the same original prompt tuple is a conflict; a duplicate returns the original admission/result with no new execution, not a second event. Replay must never execute a prompt. All other CV-308 states remain owned inbox states; no fifth event family is created. Reuse CV-314: original operation identity is the UTF-8 JSON array [source_session_id,prompt_id,target_thread_id,prompt_hash,admission_state] with the exact four-field prompt tuple selecting the inbox admission, and the exact state component selecting this existing lifecycle fact. admission_id is allocated at the original inbox admission and stays stable across its lifecycle; duplicate delivery never allocates a new admission.

  3. Producer and publication. Only `SessionPromptInbox.rejected@1.0.0` may prepare this exact fact after the actual owner gate. Immutable original input and original owner operation identity are captured before calling helpers. The owner source/body commit (where this fact reports an independently committed source) precedes append. Explicitly adopt SP-286 and CV-339 `storage.first_append_receipt.resolve.v2`: actual original complete EventRecord/semantic input in the same Storage instance resolves the original eleven-field AppendReceipt, original four-field result and exact original wire/full-value commitments. Source commit -> body/pack durability -> family append -> original synced first receipt -> publication is the order. Mutation-authorizing, graph-lock and UI-waited receipts are barrier-class under SP-336/SP-347; no downstream mutation passes the receipt boundary. Missing acknowledgement stays fenced; neither tail absence nor caller flags prove never-issued. With no independent durable source, append is the canonical body commit, never an invented prior canonical value.

  4. Closed payload. `Plans/event_payloads/w3f/session_prompt_rejected.schema.json` is the family's complete, independently closed 1.0.0 resolved-body schema. Every required-present nullable field remains present. Exact type precedes value comparisons (boolean is not integer; string booleans/numbers/null/arrays/objects never coerce). Every identifier/digest full-matches including trailing-LF rejection. Format annotations are enforced by the reviewed shared timestamp profile, not a silently skipped JSON Schema format. An unresolved $ref in any branch refuses schema installation eagerly.

  5. Scope and identity. This family's candidate payload is `pm.event_payload.session_prompt.rejected.v1@1.0.0` at `Plans/event_payloads/w3f/session_prompt_rejected.schema.json`. The schema closes the resolved body, not a new envelope. Adopt `Plans/Contracts_V0.md#EventRecord`, CV-317 and CV-366 by name. Match context.scope_kind/project_id/thread_id to EventRecord and actual accepted owner context; the genuine owning Server/Host/root/worktree/remote joins must all agree. No focus fallback, empty Project, hidden root, cross-Server or cross-thread substitution. Project scope uses Storage's exact `project~{base64url_no_pad(UTF8(project_id))}` partition; application scope is `app`, project_id null and an actual owning Server/Host. Discovery additionally requires its real thread/admitted root under T-161; prompts require their actual target thread under CV-314. Other thread/root/worktree/remote refs are present only when the genuine operation has them; no working root is invented for a rootless inbox or non-file invocation. Reuse CV-314: original operation identity is the UTF-8 JSON array [source_session_id,prompt_id,target_thread_id,prompt_hash,admission_state] with the exact four-field prompt tuple selecting the inbox admission, and the exact state component selecting this existing lifecycle fact. admission_id is allocated at the original inbox admission and stays stable across its lifecycle; duplicate delivery never allocates a new admission. owner_operation_id is exactly the canonical JSON string array [source_session_id,prompt_id,target_thread_id,prompt_hash,admission_state] specified here; source_session_id is CV-314 session_id. This exact immutable state component is the optional-effect discriminator required by CV-366. event_id is `evt_w3f_` plus lowercase SHA-256 of RFC 8785 JSON array of strings [actual storage_instance_id, Storage-owned recovery_epoch in its canonical decimal string form, actual scope_partition, exact event_type, owner_operation_id]. Application idempotency_key is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}` (lowercase hex of exact UTF-8); Project idempotency_key is `w3f:{event_type}:{hex(owner_operation_id)}`. All identity inputs, including the actual original Storage recovery_epoch, are frozen at first preparation and retained on every retry; a later restore/current epoch never remints the original. No timestamp/retry counter/focus or projection revision enters identity. Recompute expected identities from captured trusted original inputs, never a supplied digest. No numeric or timestamp code is owned here: producer-semantic digest and numeric/date-time qualification stay in EventRecord/CV-317/CV-339/SP-236 and the reviewed shared CV-1100/CV-1101/SP-1100/SP-1101 successors adopted in phase 2. Until those reviewed prerequisites and this family's admission exist the current writer is unavailable. No schema cap narrows Storage uint64.

  6. Replay and idempotency. Adopt the unchanged EventRecord producer_semantic_digest field set and SP-286 full-value comparison, never Storage-assigned sequence/timestamps as caller semantics. Current writer/retry uses dedupe_by_idempotency_key; normal append rejects projector_replay_only as replay_only_not_appendable even for an otherwise valid original. Same actual scoped key and original semantic body returns the actual original receipt/result and no second event/effect. Different body with that identity is idempotency_conflict; behind/unavailable dedupe is dedupe_unavailable. Rebuild/historical read uses the original authenticated recipe and cannot search, verify, execute, authorize, dispatch, charge Usage, notify or write canonical state. It never restarts a retention clock.

  7. Retention. `retention_policy_ref=RP-CHAT-THREAD-LIFETIME@1.0.0`, bound by DL-456 (E-CARDS-3 item 4.a, option A) as Storage's third-sitting assignment records it (`Plans/storage-plan.md`, "Kept as long as the target chat exists, four session-prompt request histories (DL-456)"). session_prompt.rejected is kept as long as its target chat exists, in Project and application chats alike. It counts together with every other family using that chat's existing 250,000-entry shared limit and continues in a linked continuation of the same chat's history, kept and deleted with that chat, instead of silently dropping history. Deleting the target chat hides it immediately, purges unheld active copies within 24 hours and backup bytes within 30 days; a hold delays purge and never restores visibility. No new application allowance is created, and the prompt text keeps its own lifetime. Original first-receipt/dedupe/source custody keeps its own policy; every actual hold/reference/backup dependency applies. No body-dereference grant follows from event retention. This binding adds no lifetime or deletion rule beyond DL-456.

  8. Redaction and custody. Seglog is the only canonical event history; original full-value first-receipt custody belongs to SP-286/CV-339 and survives coherent mandatory backup with referenced payload packs, original identity/recipe and recovery controls. Redb/index/GUI/caches never reconstruct lost canonical authority. Keep original accepted input values stable in the live owner operation until its first append settles; there is no newly durable pending-operation journal. On process loss resolve only an actual known original identity; a missing/uncertain source or receipt is unavailable, never permission to mint a replacement. A separately accepted new operation has a genuinely new owner identity, never relabelled restored/retried work. On a verified older restore no omitted request is automatically resumed. Discovery source_receipt_ref may be null when there was no independent existing receipt; a self-reference is not independent custody. Trusted original append/admission custody, not retention of mutable request caches, authenticates valid historical bytes. Every read resolves current access/deletion/tombstone/hold authority for the exact source and checks it again immediately before disclosure; retention/hold never restores visibility. Raw prompts/queries/hidden paths/provider content/credentials/SSH secrets never enter this body; refs are opaque owner-issued objects, never substitute capability. Bodies above SP-337's 16 KiB inline limit use its BLAKE3/size/media payload reference, exact pack bytes durable before referencing acknowledgement. Validate the resolved complete body. Measure every stored part, including any redb value, against storage_profile.value_limit_bytes; externalizing the body never exempts another part from its limit. For a value without an admitted large-value shape, fail that write/advance closed rather than invent a pointer codec.

  9. Transitions and ordering. Use only this family's semantic predicates in paragraph 2. Source identity, state, policy, exact payload, full-value custody and current writer admission must all remain valid at the final append boundary after all helpers; otherwise zero new effect. Per-source actual causal order is preserved through EventRecord sequence and original causation. No timestamp-based dedupe or inferred cross-node order overrides the envelope owner. Historical readers verify the original lawful fact without demanding today's live state. A duplicate is an original-result read, never another transition.

  10. Consumers/checkpoints. This family explicitly adopts `SP-1464` and SP-278 `reader.storage.event_record_index@1.0.0`, including its nine-field durable token (DL-076), full ten-field live read transaction token and no persisted redb_snapshot_id. Operating read consumer is `reader.session_prompt.rejected@1.0.0`; its source/selector/currentness and custody rules are exact-family, not borrowed from another row. Family checkpoint disposition is none_required: this consumer owns no durable projection, cursor, receipt, acknowledgement, cache or advance. Only the generic independently published SP-278 checkpoint advances; read/interruption/retry leaves no family-owned effect. No family CAS is applicable because there is no durable advance. The output is one in-memory, bounded, original-family observation after final source/token/access revalidation.

  11. Compatibility and withdrawal. Current writes require this exact family/version/schema/source grant and normal replay policy; unknown future versions are unavailable. No deployed predecessor payload or family-specific converter was found; preserve any genuinely admitted historical envelope through its original verified registry revision and schema/number/time recipe, never relabel it 1.0.0 or rerun current live-state guards. A caller-controlled recipe/version cannot select history. At withdrawal the actual family registry cutoff fences this producer before append (including retry); existing SP-286 original receipt reads remain read-only. Stop new reads/materialization for a withdrawn schema/reader, invalidate its in-flight authority lease, and fence any affected derived generation. StorageMigrationCoordinator installs a separately reviewed successor codec/reader and rebuilds only derived state from the still admitted canonical source under SP-278; it publishes the new reader/generation atomically before reads resume. No source rewrite, schema URI rebind, original receipt reconstruction, native effect or silent upgrade. A malformed/withdrawn/foreign retained record is refused; valid retained history may be read after the current live object changes, with current disclosure controls. Phase 2 must test both directions.

  12. Oracles. `Plans/w3f_event_oracle_plan.json` holds this family's predicate inventory. Phase 2 (2026-11-13) implements it as the executable synthetic checker `scripts/pm_w3f_event_oracles.py`: every refusal is one named single-predicate row of a generated Method B guard table (`scripts/pm_w3f_table_*.py`), proved by the gated shared `scripts/pm_guard_isolation.py` through `scripts/pm-w3f-guard-tables.py`; rows no input can refuse first stay alone in their own table with a written proof. Its complete positives and one-defect negatives are `Plans/w3f_event_fixtures.json` (built by `scripts/pm-w3f-cases.py`), and Storage's sealed write custody stand-in for SP-1101 retained reads is `Plans/w3f_original_custody.json`. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 `date_time` with each field's owner profile; no lane serializer, cap or timestamp grammar is added. This is synthetic oracle evidence only: native work, writer admission and membership stay NOT_RUN/ABSENT.
gui_related: true
gui_classification_reason: User-visible inbox/receipt inspection consumes this contract.
depends_on:
- CV-317
- CV-339
- CV-366
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens:
- session_prompt.rejected@1.0.0
- reports/event-authority-20261105/W3F-search.json
- session_prompt.rejected
- f9c5de6561dff0a53a48e530f2a5c6804a7e941d
- event-family-session-prompt-rejected
- SessionPromptInbox.rejected@1.0.0
- storage.first_append_receipt.resolve.v2
- Plans/event_payloads/w3f/session_prompt_rejected.schema.json
- pm.event_payload.session_prompt.rejected.v1@1.0.0
- Plans/event_payloads/w3f/session_prompt_rejected.schema.json
- Plans/Contracts_V0.md#EventRecord
- project~{base64url_no_pad(UTF8(project_id))}
- app
- evt_w3f_
- application@1:{hex(server_id)}:{hex(owner_operation_id)}
- w3f:{event_type}:{hex(owner_operation_id)}
- retention_policy_ref=RP-CHAT-THREAD-LIFETIME@1.0.0
- SP-1464
- reader.storage.event_record_index@1.0.0
- reader.session_prompt.rejected@1.0.0
- Plans/w3f_event_oracle_plan.json
- scripts/pm_guard_isolation.py
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```

### CV-1459 - planning.question_budget_exhausted Resolved Payload And Owner Contract

```yaml
plan_unit_id: CV-1459
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: |-
  Newly authored owner contract for `planning.question_budget_exhausted@1.0.0`; search/reuse evidence: `reports/event-authority-20261105/W3F-search.json` entry `planning.question_budget_exhausted`, base `f9c5de6561dff0a53a48e530f2a5c6804a7e941d`. Existing definitions reused: Assistant_Plan_Runtime QMAX-005..016, its backend mappings, and Contracts_V0 Additive Correction v4 / Effect dispositions. The family is prepared without admission; membership is ABSENT, never inferred from this unit or its schema. The family candidate id is `event-family-planning-question-budget-exhausted`.

  2. Owner and semantic boundary. Reuse Assistant_Plan_Runtime QMAX-005..007, QMAX-006 and QMAX-014..016 plus Contracts_V0 Additive Correction v4 / Effect dispositions (the actual heading). This event records the actual typed refusal of one attempted question admission at zero remaining and the required continuation, not merely a full charged set or a later projection with exhausted=true. No extra QuestionItem, rejected question text, new counter, run failure, automatic Grill confirmation or budget-only Build blocker is created. The actual coordinator captures one immutable exhaustion_id when that result is reached; it is not a question_item_id. budget_run_id is the genuine workflow_id for Plan/Deep Plan or collaboration_run_id for BrainStorm/Crew/Chat Room; a Plan revision shares that run's count. backend and question_records_ref resolve the original durably presented records: regular Plan -> existing questionnaire records, Deep Plan -> DeepPlanLedgerSession, BrainStorm/Crew/Chat Room -> QuestionBank. No ledger is opened for regular Plan and the Wonderer never charges questions. assistant_plan_id and strategy are actual Plan bindings (null for Crew/Chat Room); Crew/Chat Room have base_limit=0 and an enabled Grill bank. No counter is per participant. policy_ref and every budget field equal the captured owner decision snapshot: effective_limit=base_limit+(grill_me_enabled ? grill_me_extension : 0), questions_asked is the count of distinct first durably presented QuestionItems, questions_remaining=max(0,effective_limit-questions_asked)=0. Valid history may have questions_asked greater than effective_limit after reconfiguration; never demand equality. Reused answers, research and retries do not charge. result is question_budget_exhausted; continuation is await_grill_confirmation when Grill Me is on, otherwise synthesis. Preserve visible unresolved open items and the existing explicit build_blocker-only rule. The fact is the typed result/continuation at that instant, so later reconfiguration cannot rewrite it. Event occurred_at_utc is the original decision time; no extra family timestamp is introduced.

  3. Producer and publication. Only `PlanningQuestionAdmissionCoordinator.exhaustion_result@1.0.0`, the existing questionnaire/ledger/bank admission owner for the actual backend, prepares this exact fact when QMAX-014..015 returns the typed refusal, never at the last successful charge or from a GUI projection. Capture actual owner context, decision snapshot and exhaustion_id before helpers. Explicitly adopt SP-286 and CV-339 storage.first_append_receipt.resolve.v2: authenticate the actual complete original EventRecord/semantic input, eleven-field AppendReceipt, four-field result and full-value commitments in the same Storage instance. Existing durable charged-record truth precedes decision; body/pack durability -> family append -> original synced receipt -> event publication. This event append is canonical custody for this exhaustion fact when admitted, not a newly invented separate saved refusal record. source_receipt_ref is null unless an independently existing original result receipt actually exists; it cannot self-reference. No extra pending-operation journal is introduced. Uncertain/lost acknowledgement remains fenced and resolves the actual original identity, never remints it. This draft does not alter QMAX user-visible continuation or enable a writer before admission.

  4. Closed payload. `Plans/event_payloads/w3f/planning_question_budget_exhausted.schema.json` is the family's complete, independently closed 1.0.0 resolved-body schema. Every required-present nullable field remains present. Exact type precedes value comparisons (boolean is not integer; string booleans/numbers/null/arrays/objects never coerce). Every identifier/digest full-matches including trailing-LF rejection. Format annotations are enforced by the reviewed shared timestamp profile, not a silently skipped JSON Schema format. An unresolved $ref in any branch refuses schema installation eagerly.

  5. Scope and identity. This family's candidate payload is `pm.event_payload.planning.question_budget_exhausted.v1@1.0.0` at `Plans/event_payloads/w3f/planning_question_budget_exhausted.schema.json`. The schema closes the resolved body, not a new envelope. Adopt `Plans/Contracts_V0.md#EventRecord`, CV-317 and CV-366 by name. Match context.scope_kind/project_id/thread_id to EventRecord and actual accepted owner context; the genuine owning Server/Host/root/worktree/remote joins must all agree. No focus fallback, empty Project, hidden root, cross-Server or cross-thread substitution. Project scope uses Storage's exact `project~{base64url_no_pad(UTF8(project_id))}` partition; application scope is `app`, project_id null and an actual owning Server/Host. This planning fact requires its genuine owning thread; it does not require or invent a working root. Other thread/root/worktree/remote refs are present only when the genuine operation has them; no working root is invented for a rootless planning operation or non-file invocation. owner_operation_id equals the genuine exhaustion_id for this actual typed refusal; distinct later refused admissions have distinct actual operation identities, while retry/restore retains the first identity. It never equals an invented rejected QuestionItem or a Plan version. event_id is `evt_w3f_` plus lowercase SHA-256 of RFC 8785 JSON array of strings [actual storage_instance_id, Storage-owned recovery_epoch in its canonical decimal string form, actual scope_partition, exact event_type, owner_operation_id]. Application idempotency_key is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}` (lowercase hex of exact UTF-8); Project idempotency_key is `w3f:{event_type}:{hex(owner_operation_id)}`. All identity inputs, including the actual original Storage recovery_epoch, are frozen at first preparation and retained on every retry; a later restore/current epoch never remints the original. No timestamp/retry counter/focus or projection revision enters identity. Recompute expected identities from captured trusted original inputs, never a supplied digest. No numeric or timestamp code is owned here: producer-semantic digest and numeric/date-time qualification stay in EventRecord/CV-317/CV-339/SP-236 and the reviewed shared CV-1100/CV-1101/SP-1100/SP-1101 successors adopted in phase 2. Until those reviewed prerequisites and this family's admission exist the current writer is unavailable. No schema cap narrows Storage uint64.

  6. Replay and idempotency. Adopt the unchanged EventRecord producer_semantic_digest field set and SP-286 full-value comparison, never Storage-assigned sequence/timestamps as caller semantics. Current writer/retry uses dedupe_by_idempotency_key; normal append rejects projector_replay_only as replay_only_not_appendable even for an otherwise valid original. Same actual scoped key and original semantic body returns the actual original receipt/result and no second event/effect. Different body with that identity is idempotency_conflict; behind/unavailable dedupe is dedupe_unavailable. Rebuild/historical read uses the original authenticated recipe and cannot ask or charge a question, confirm Grill Me, execute Build, notify or write canonical state. It never restarts a retention clock.

  7. Retention. Bound by DL-457 (E-CARDS-3 item 5.a, option A) as Storage's third-sitting assignment records it (`Plans/storage-plan.md`, "Kept seven years, the question-budget refusal history (DL-457)" and the "Project first-save anchor adapter for RP-OPERATIONAL-2555D@1.0.0 (DL-455, DL-457)"). Project records: `retention_policy_ref=RP-OPERATIONAL-2555D@1.0.0`, sharing the existing 2,000,000-entry seven-year Project allowance, with its terminal_transition anchor read through Storage's Project first-save anchor adapter. Application records: `retention_policy_ref=RP-QUESTION-BUDGET-APPLICATION-2555D@1.0.0` (count key `app:question_budget`), one separate 2,000,000-entry allowance across this type's Plan, Deep Plan and question-bank sources together in one Puppet Master Server's saved history shared by its connected Clients, with no fresh allowance per chat, workflow, participant or question source. Keep 2,555 days (220,752,000 seconds) from the first successful save that survives a restart of the actual refusal and next-step result; where this event is the only saved refusal, its own first such save is that save, and an independently existing original result uses its own proved first-save time. Never wait for planning or a future execution run to finish, and never restart the clock on retry, reprocessing old history, reconfiguration or restore. Remove only expired unprotected entries; refuse new history writes if full and none may expire. Ordinary chat and Plan deletion do not shorten this separate content-free history's window; explicit Project and application data deletion and current access rules still apply. Source question records, original receipts, holds and backup dependencies retain their own existing policies; event retention never extends access to question content. This binding adds no lifetime or deletion rule beyond DL-457.

  8. Redaction and custody. Seglog is the only canonical event history; original full-value first-receipt custody belongs to SP-286/CV-339 and survives coherent mandatory backup with referenced payload packs, original identity/recipe and recovery controls. Redb/index/GUI/caches never reconstruct lost canonical authority. Keep original accepted input values stable in the live owner operation until its first append settles; there is no newly durable pending-operation journal. On process loss resolve only an actual known original identity; a missing/uncertain source or receipt is unavailable, never permission to mint a replacement. A separately accepted new operation has a genuinely new owner identity, never relabelled restored/retried work. On a verified older restore no omitted request is automatically resumed. The source_receipt_ref is null when there was no independent existing receipt; a self-reference is not independent custody. Trusted original append/admission custody, not retention of mutable request caches, authenticates valid historical bytes. Every read resolves current access/deletion/tombstone/hold authority for the exact source and checks it again immediately before disclosure; retention/hold never restores visibility. Raw question/answer text, prompts, hidden paths, provider content, credentials or secrets never enter this body; refs are opaque owner-issued objects, never substitute capability. Bodies above SP-337's 16 KiB inline limit use its BLAKE3/size/media payload reference, exact pack bytes durable before referencing acknowledgement. Validate the resolved complete body. Measure every stored part, including any redb value, against storage_profile.value_limit_bytes; externalizing the body never exempts another part from its limit. For a value without an admitted large-value shape, fail that write/advance closed rather than invent a pointer codec.

  9. Transitions and ordering. Use only this family's semantic predicates in paragraph 2. Source identity, state, policy, exact payload, full-value custody and current writer admission must all remain valid at the final append boundary after all helpers; otherwise zero new effect. Per-source actual causal order is preserved through EventRecord sequence and original causation. No timestamp-based dedupe or inferred cross-node order overrides the envelope owner. Historical readers verify the original lawful fact without demanding today's live state. A duplicate is an original-result read, never another transition.

  10. Consumers/checkpoints. This family explicitly adopts `SP-1459` and SP-278 `reader.storage.event_record_index@1.0.0`, including its nine-field durable token (DL-076), full ten-field live read transaction token and no persisted redb_snapshot_id. Operating read consumer is `reader.planning.question_budget_exhausted@1.0.0`; its source/selector/currentness and custody rules are exact-family, not borrowed from another row. Family checkpoint disposition is none_required: this consumer owns no durable projection, cursor, receipt, acknowledgement, cache or advance. Only the generic independently published SP-278 checkpoint advances; read/interruption/retry leaves no family-owned effect. No family CAS is applicable because there is no durable advance. The output is one in-memory, bounded, original-family observation after final source/token/access revalidation.

  11. Compatibility and withdrawal. Current writes require this exact family/version/schema/source grant and normal replay policy; unknown future versions are unavailable. No deployed predecessor payload or family-specific converter was found; preserve any genuinely admitted historical envelope through its original verified registry revision and schema/number/time recipe, never relabel it 1.0.0 or rerun current live-state guards. A caller-controlled recipe/version cannot select history. At withdrawal the actual family registry cutoff fences this producer before append (including retry); existing SP-286 original receipt reads remain read-only. Stop new reads/materialization for a withdrawn schema/reader, invalidate its in-flight authority lease, and fence any affected derived generation. StorageMigrationCoordinator installs a separately reviewed successor codec/reader and rebuilds only derived state from the still admitted canonical source under SP-278; it publishes the new reader/generation atomically before reads resume. No source rewrite, schema URI rebind, original receipt reconstruction, native effect or silent upgrade. A malformed/withdrawn/foreign retained record is refused; valid retained history may be read after the current live object changes, with current disclosure controls. Phase 2 must test both directions.

  12. Oracles. `Plans/w3f_event_oracle_plan.json` holds this family's predicate inventory. Phase 2 (2026-11-13) implements it as the executable synthetic checker `scripts/pm_w3f_event_oracles.py`: every refusal is one named single-predicate row of a generated Method B guard table (`scripts/pm_w3f_table_*.py`), proved by the gated shared `scripts/pm_guard_isolation.py` through `scripts/pm-w3f-guard-tables.py`; rows no input can refuse first stay alone in their own table with a written proof. Its complete positives and one-defect negatives are `Plans/w3f_event_fixtures.json` (built by `scripts/pm-w3f-cases.py`), and Storage's sealed write custody stand-in for SP-1101 retained reads is `Plans/w3f_original_custody.json`. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 `date_time` with each field's owner profile; no lane serializer, cap or timestamp grammar is added. This is synthetic oracle evidence only: native work, writer admission and membership stay NOT_RUN/ABSENT.
gui_related: false
gui_classification_reason: Event storage, identity and custody contract; visual presentation belongs to existing owners.
depends_on:
- CV-317
- CV-339
- CV-366
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens:
- planning.question_budget_exhausted@1.0.0
- QMAX-014..015
- RP-OPERATIONAL-2555D@1.0.0
- RP-QUESTION-BUDGET-APPLICATION-2555D@1.0.0
- Plans/w3f_event_oracle_plan.json
- scripts/pm_guard_isolation.py
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```
