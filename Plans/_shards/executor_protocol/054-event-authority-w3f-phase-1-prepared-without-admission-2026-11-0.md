# Shard 054: Event Authority W3F Phase 1 — Prepared Without Admission (2026-11-05)

Source: `Plans/Executor_Protocol.md`

Source lines: L12528-L12620

Source SHA256: `abd395ea9120a1e020240c663816cd390aac571f804a4ff6b97accb2b456ddf3`

---

## Event Authority W3F Phase 1 — Prepared Without Admission (2026-11-05)

Newly authored owner contracts under deck 2 item 9.a A. This section adds no admitted family and enables no native writer. The per-family base search is recorded in `reports/event-authority-20261105/W3F-search.json`. Criterion 12 remains PARTIAL until the shared number/time rules and guard-isolation tool pass review and phase 2 runs.

### EP-1460 - Canonical Graph Lock Event Adoption

```yaml
plan_unit_id: EP-1460
unit_type: interface_contract
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: |-
  Newly authored owner contract for `run.graph_canonical_locked@1.0.0`; search/reuse evidence: `reports/event-authority-20261105/W3F-search.json` entry `run.graph_canonical_locked`, base `f9c5de6561dff0a53a48e530f2a5c6804a7e941d`. Existing definitions reused: Executor graph-lock boundary; replan generation lifecycle; EP-088; Wiring_Matrix canonical graph wiring; Project_Output_Artifacts canonical graph. The family is prepared without admission; membership is ABSENT, never inferred from this unit or its schema. The family candidate id is `event-family-run-graph-canonical-locked`.

  2. Owner and semantic boundary. Reuse the canonical Executor graph-lock boundary and generation lifecycle. Only project scope is supported for this Project canonical graph; app operation support elsewhere is not inherited. Validate the exact genuine approved canonical graph (all node/edge/dependency IDs, graph digest and approval refs) through its existing graph owner before lock commit. A graph digest is checked from the actual canonical artifact bytes under that artifact owner recipe, not a new serializer here. Original canonical graph body commit and graph_commit_receipt_ref precede event append. The original event first receipt precedes new dispatch acceptance. Initial generation is 0 with null previous_generation and previous_lock_event_id. Applied structural replan increments once (u32 domain, no wrap) and joins prior lock/run/approved graph; stale attempts/safe points/blocked projections are queryable but never resumable. Invalid post-lock structure stops new dispatch as graph_integrity; no flattening or silent degraded execution. The event is evidence of an existing graph commit, never authority to reconstruct or change the canonical graph.

  3. Producer and publication. Only `ExecutorCanonicalGraph.commit_lock@1.0.0` may prepare this exact fact after the actual owner gate. Immutable original input and original owner operation identity are captured before calling helpers. The owner source/body commit (where this fact reports an independently committed source) precedes append. Explicitly adopt SP-286 and CV-339 `storage.first_append_receipt.resolve.v2`: actual original complete EventRecord/semantic input in the same Storage instance resolves the original eleven-field AppendReceipt, original four-field result and exact original wire/full-value commitments. Source commit -> body/pack durability -> family append -> original synced first receipt -> publication is the order. Mutation-authorizing, graph-lock and UI-waited receipts are barrier-class under SP-336/SP-347; no downstream mutation passes the receipt boundary. Missing acknowledgement stays fenced; neither tail absence nor caller flags prove never-issued. With no independent durable source, append is the canonical body commit, never an invented prior canonical value.

  4. Closed payload. `Plans/event_payloads/w3f/run_graph_canonical_locked.schema.json` is the family's complete, independently closed 1.0.0 resolved-body schema. Every required-present nullable field remains present. Exact type precedes value comparisons (boolean is not integer; string booleans/numbers/null/arrays/objects never coerce). Every identifier/digest full-matches including trailing-LF rejection. Format annotations are enforced by the reviewed shared timestamp profile, not a silently skipped JSON Schema format. An unresolved $ref in any branch refuses schema installation eagerly.

  5. Scope and identity. This family's candidate payload is `pm.event_payload.run.graph_canonical_locked.v1@1.0.0` at `Plans/event_payloads/w3f/run_graph_canonical_locked.schema.json`. The schema closes the resolved body, not a new envelope. Adopt `Plans/Contracts_V0.md#EventRecord`, CV-317 and CV-366 by name. Match context.scope_kind/project_id/thread_id to EventRecord and actual accepted owner context; the genuine owning Server/Host/root/worktree/remote joins must all agree. No focus fallback, empty Project, hidden root, cross-Server or cross-thread substitution.
  Project scope uses Storage's exact `project~{base64url_no_pad(UTF8(project_id))}` partition; application scope is `app`, project_id null and an actual owning Server/Host. Discovery additionally requires its real thread/admitted root under T-161; prompts require their actual target thread under CV-314. Other thread/root/worktree/remote refs are present only when the genuine operation has them; no working root is invented for a rootless inbox or non-file invocation. owner_operation_id equals genuine original lock_id, stable for that accepted graph commit; the same (run_id,replan_generation) cannot name two canonical graph digests. An initial lock has generation zero and no predecessor; an applied structural replan has the exact prior generation plus one, an original prior lock and its new approved graph. owner_operation_id is exactly the original lock_id. event_id is `evt_w3f_` plus lowercase SHA-256 of RFC 8785 JSON array of strings [actual storage_instance_id, Storage-owned recovery_epoch in its canonical decimal string form, actual scope_partition, exact event_type, owner_operation_id]. Application idempotency_key is exactly CV-366 `application@1:{hex(server_id)}:{hex(owner_operation_id)}` (lowercase hex of exact UTF-8); Project idempotency_key is `w3f:{event_type}:{hex(owner_operation_id)}`. All identity inputs, including the actual original Storage recovery_epoch, are frozen at first preparation and retained on every retry; a later restore/current epoch never remints the original. No timestamp/retry counter/focus or projection revision enters identity. Recompute expected identities from captured trusted original inputs, never a supplied digest.
  No numeric or timestamp code is owned here: producer-semantic digest and numeric/date-time qualification stay in EventRecord/CV-317/CV-339/SP-236 and the reviewed shared CV-1100/CV-1101/SP-1100/SP-1101 successors adopted in phase 2. Until those reviewed prerequisites and this family's admission exist the current writer is unavailable. No schema cap narrows Storage uint64.

  6. Replay and idempotency. Adopt the unchanged EventRecord producer_semantic_digest field set and SP-286 full-value comparison, never Storage-assigned sequence/timestamps as caller semantics. Current writer/retry uses dedupe_by_idempotency_key; normal append rejects projector_replay_only as replay_only_not_appendable even for an otherwise valid original. Same actual scoped key and original semantic body returns the actual original receipt/result and no second event/effect. Different body with that identity is idempotency_conflict; behind/unavailable dedupe is dedupe_unavailable. Rebuild/historical read uses the original authenticated recipe and cannot search, verify, execute, authorize, dispatch, charge Usage, notify or write canonical state. It never restarts a retention clock.

  7. Retention. `retention_policy_ref=RP-RUNTIME-365D@1.0.0`. Storage Case L-3 exact class applies: Runtime/run/node/attempt, anchored to the real run completion, 365 days, 1,000,000/run plus 5,000,000/project, roll successor; no imaginary run. Original first-receipt/dedupe/source custody keeps its own policy; every actual hold/reference/backup dependency applies. No body-dereference grant follows from event retention. G15/G23/G26 recommendations in the recount are leads only, not name-based assignments. No new lifetime or deletion rule is chosen here.

  8. Redaction and custody. Seglog is the only canonical event history; original full-value first-receipt custody belongs to SP-286/CV-339 and survives coherent mandatory backup with referenced payload packs, original identity/recipe and recovery controls. Redb/index/GUI/caches never reconstruct lost canonical authority. Keep original accepted input values stable in the live owner operation until its first append settles; there is no newly durable pending-operation journal. On process loss resolve only an actual known original identity; a missing/uncertain source or receipt is unavailable, never permission to mint a replacement. A separately accepted new operation has a genuinely new owner identity, never relabelled restored/retried work. On a verified older restore no omitted request is automatically resumed. Discovery source_receipt_ref may be null when there was no independent existing receipt; a self-reference is not independent custody. Trusted original append/admission custody, not retention of mutable request caches, authenticates valid historical bytes. Every read resolves current access/deletion/tombstone/hold authority for the exact source and checks it again immediately before disclosure; retention/hold never restores visibility. Raw prompts/queries/hidden paths/provider content/credentials/SSH secrets never enter this body; refs are opaque owner-issued objects, never substitute capability. Bodies above SP-337's 16 KiB inline limit use its BLAKE3/size/media payload reference, exact pack bytes durable before referencing acknowledgement. Validate the resolved complete body. Measure every stored part, including any redb value, against storage_profile.value_limit_bytes; externalizing the body never exempts another part from its limit. For a value without an admitted large-value shape, fail that write/advance closed rather than invent a pointer codec.

  9. Transitions and ordering. Use only this family's semantic predicates in paragraph 2. Source identity, state, policy, exact payload, full-value custody and current writer admission must all remain valid at the final append boundary after all helpers; otherwise zero new effect. Per-source actual causal order is preserved through EventRecord sequence and original causation. No timestamp-based dedupe or inferred cross-node order overrides the envelope owner. Historical readers verify the original lawful fact without demanding today's live state. A duplicate is an original-result read, never another transition.

  10. Consumers/checkpoints. This family explicitly adopts `SP-1460` and SP-278 `reader.storage.event_record_index@1.0.0`, including its nine-field durable token (DL-076), full ten-field live read transaction token and no persisted redb_snapshot_id. Operating read consumer is `reader.run.graph_canonical_locked@1.0.0`; its source/selector/currentness and custody rules are exact-family, not borrowed from another row. Family checkpoint disposition is none_required: this consumer owns no durable projection, cursor, receipt, acknowledgement, cache or advance. Only the generic independently published SP-278 checkpoint advances; read/interruption/retry leaves no family-owned effect. No family CAS is applicable because there is no durable advance. The output is one in-memory, bounded, original-family observation after final source/token/access revalidation.

  11. Compatibility and withdrawal. Current writes require this exact family/version/schema/source grant and normal replay policy; unknown future versions are unavailable. No deployed predecessor payload or family-specific converter was found; preserve any genuinely admitted historical envelope through its original verified registry revision and schema/number/time recipe, never relabel it 1.0.0 or rerun current live-state guards. A caller-controlled recipe/version cannot select history. At withdrawal the actual family registry cutoff fences this producer before append (including retry); existing SP-286 original receipt reads remain read-only. Stop new reads/materialization for a withdrawn schema/reader, invalidate its in-flight authority lease, and fence any affected derived generation. StorageMigrationCoordinator installs a separately reviewed successor codec/reader and rebuilds only derived state from the still admitted canonical source under SP-278; it publishes the new reader/generation atomically before reads resume. No source rewrite, schema URI rebind, original receipt reconstruction, native effect or silent upgrade. A malformed/withdrawn/foreign retained record is refused; valid retained history may be read after the current live object changes, with current disclosure controls. Phase 2 must test both directions.

  12. Oracle plan only. `Plans/w3f_event_oracle_plan.json` contains this family's predicate inventory with positive baselines and negatives of exactly one defect. No oracle code, runtime evidence or check-11 proof is claimed. Phase 2 adopts the reviewed shared number/time helper and `scripts/pm_guard_isolation.py`, inventories all enforcement sites per predicate, cuts a compound rule per predicate, and proves each negative becomes accepted only when every duplicate site for that same predicate is removed. Criterion 12 remains PARTIAL; native work is NOT_RUN.
gui_related: false
gui_classification_reason: Event storage, identity and custody contract; visual presentation belongs to existing
  owners.
depends_on:
- CV-1460
- EP-099
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
- Plans/Executor_Protocol.md
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
