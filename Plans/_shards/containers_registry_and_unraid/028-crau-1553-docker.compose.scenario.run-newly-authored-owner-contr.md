# Shard 028: CRAU-1553 — `docker.compose.scenario.run`: newly authored owner contract, prepared without admission

Source: `Plans/Containers_Registry_and_Unraid.md`

Source lines: L7112-L7177

Source SHA256: `017d00a9d32fd7a56596c71e0270222672b27b3d13f034f227704a22049e358c`

---

## CRAU-1553 — `docker.compose.scenario.run`: newly authored owner contract, prepared without admission

```yaml
plan_unit_id: CRAU-1553
unit_type: interface_contract
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: 'For exactly docker.compose.scenario.run@1.0.0, the adjacent twelve-criterion contract binds the
  already specified fact: cmd.docker.compose.scenario.run records the original owner-confirmed launch/run activity
  receipt for the exact validated scenario and compose config-hash. Dispatch acceptance alone is insufficient; the
  run receipt proves the launch, never health, test pass or terminal success. Restart reads this receipt and never
  reruns Compose. Newly authored technical bindings follow deck-1 4b A (DL-411) and the documented exact-family
  search. Registry membership stays absent; criterion 12 remains PARTIAL until phase 2.'
gui_related: false
gui_classification_reason: Persisted semantic facts and source/recovery contracts only; existing presentation owners
  remain authoritative.
depends_on:
- CRAU-042
- CRAU-093
- CRAU-096
unblocks: []
acceptance_criteria:
- This exact family stays prepared without admission and retains each original owner boundary.
- Closed payload, authentic original source joins, receipt custody and read-only recovery satisfy the adjacent family-specific
  contract.
- Phase 2 must implement and prove every planned guard before criterion 12 can pass.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- reports/event-authority-20261105/W3H-oracle-plan.json
risk_class: event_source_identity_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3h_phase1
implementation_surfaces:
- Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-1 4b A (DL-411); exact original answer and deck SHA-256 in reports/event-authority-20261105/W3H.md
- reports/event-authority-20261105/W3H-search-evidence.json
preserved_exact_tokens:
- docker.compose.scenario.run
- prepared_without_admission
negative_constraints:
- No event admission, registry family append, Decision Log mutation, new feature or changed deletion rule.
- No local numeric/timestamp codec or proof machinery; adopt reviewed shared foundations in phase 2.
owner_hints:
- Plans/Containers_Registry_and_Unraid.md
```

1. **Membership/version.** `docker.compose.scenario.run@1.0.0` is a candidate only, with no registry append, admission record or native writer. All current paths return `missing_event_registration` until this exact family/source edition is admitted; siblings grant nothing.
2. **Owner.** This unit owns the semantic fact: cmd.docker.compose.scenario.run records the original owner-confirmed launch/run activity receipt for the exact validated scenario and compose config-hash. Dispatch acceptance alone is insufficient; the run receipt proves the launch, never health, test pass or terminal success. Restart reads this receipt and never reruns Compose. Reuse CRAU-042, CRAU-093, CRAU-096; payload binding is CV-1553, persistence is SP-1553.
3. **Producer.** Sole producer `ComposeScenarioController::run` calls `storage.w3h.docker_compose_scenario_run.append.v1@1.0.0`. Source is CRAU-096 original project-state scenario, resolved compose configuration, validation result and cmd.docker.compose.scenario.run original result receipt. The source adapter methods `prepare_docker_compose_scenario_run`, `commit_docker_compose_scenario_run`, `resolve_docker_compose_scenario_run_original` are newly authored interfaces of that owner, not installed handlers. Verify actual before/after source identity, genuine original receipt/result and permissions before committing the existing owner effect plus its publication journal atomically; save the exact semantic envelope and payload once. Drain the pending event via ordinary Storage append, explicitly adopting SP-286/CV-339 first-AppendReceipt **full-value v2** custody and SP-336/347 durability classes; then CAS prepared→appended→settled using the exact prior whole journal value. Domain success acknowledgement waits for the original body result and first event receipt; dependent dispatch/terminal publication waits for required receipts. A crash after body commit preserves the body and pending publication, never rolls it back or repeats the domain effect. The missing-registration gate acts before new event preparation and confers no native authority on existing result-only paths. The atomic event-source body is the canonical recording of the already owner-confirmed original run result, not execution of an external Compose process. Existing run-owner intent/effect/recovery custody remains separate; publication never launches or retries Compose.
4. **Payload.** `Plans/event_payloads/w3h/docker_compose_scenario_run.schema.json#/$defs/payload` is this family’s closed 1.0.0 schema. Every source field is compared to the genuine original owner result, not a caller-supplied matching snapshot. Required source refs resolve to exact original typed records/results at one consistent snapshot; a ref, hash or all-true assertion alone proves no acceptance. Current numeric/format rules come from EventRecord/CV-317, original source owners and the reviewed shared number/time foundation at phase 2; no new numeric limit or timestamp grammar is authored here. No objective/message/To-Do/compose/env-file body or secret is copied.
5. **Scope/identity.** Scope is `project_only`. `project_id`, actual Server and thread match the original source and EventRecord; absent Project means explicit application only where an app source is selected, never dangling Project or current focus. For the app pause source thread remains null and no fake thread/Computer/roots request is required. The original owner allocates one lifetime-unique immutable effect ID from its genuine accepted operation, with the declared component `docker.compose.scenario.run` and exact `scenario_id` included before issuance. That frozen ID is `owner_operation_id`; batch/list operations allocate a separate component for each item. It survives retry and is never reminted from a timer or callback. Project key is `w3h@1:{hex(UTF8(owner_operation_id))}`. Application input is refused for this Project-only family. Event ID is `w3h@1:{hex(UTF8(storage_instance_id))}:{hex(UTF8(owner_operation_id))}:{hex(UTF8(event_type))}`. Hex is lowercase byte-preserving encoding, not hashing or normalization. Storage’s partition is `app` or `project~{base64url_no_pad(UTF8(project_id))}`; the scoped dedupe tuple remains (scope_partition,event_type,idempotency_key). Fields already present in the envelope are adopted by reference to Contracts_V0.md#EventRecord, never replaced by a local envelope.
6. **Replay/idempotency.** Freeze `replay_policy=dedupe_by_idempotency_key` and Contracts’ exact producer-semantic digest over only its named caller fields. Current write/retry refuses `projector_replay_only` as `replay_only_not_appendable` before success. Same identity/same digest resolves the original complete event and first receipt via `storage.first_append_receipt.resolve.v2`, even after current source state advances; changed digest conflicts, unavailable authoritative dedupe returns `dedupe_unavailable` with no new effect. Do not compare Storage sequence/timestamps as caller semantics. Missing delivered work after confirmed older restore stays unavailable; a new event ID never reconstructs a missing original operation. Event replay cannot rerun commands, timers, Compose, turns, effects, Usage charges or notifications.
7. **Retention.** Bind this exact event to `RP-AUTHORITY-INDEFINITE@1.0.0`, approved deck-1 Card 1 `G21` (DL-401). No TTL or count cap. For Project entries only explicit Delete Puppet Master project data removes this audit history under existing holds; Remove project from list, deleting a described object or deleting its chat does not. Application records retain the existing app-root custody/deletion rules, never a fabricated Project. Disk pressure refuses new records. Referenced bodies retain their own policies and access; this content-free event grants no longer retention or access to them. The canonical publication journal adopts this same `RP-AUTHORITY-INDEFINITE@1.0.0` assignment and all original pending/result/backup/hold dependencies under `SP-1553`; it is never a disposable index or independently expiring copy. SP-286 receipt custody keeps its own policy.
8. **Redaction/custody.** Use `secret_refs_only` for current events; verify all refs with the original owner’s access and no-secret rules. The sole native adapter must prove actual original issuance, full scope/key/source joins and complete before/after facts, not a copied source view. Storage owns canonical seglog, publication journal, first receipt/full-value proof and a coherent backup/restore closure with pending owner effect/result; restore fences unresolved origin or tombstone state. Reads recheck current permission/deletion while authenticating original admission/recipe/receipt. They may show a valid retained fact after its live object changes or is gone, with unavailable linked body disclosed; they never reconstruct the body or require current state to equal a historical state. Unavailable or invalid source custody returns typed refusal, never fabricated empty success.
9. **Transitions.** cmd.docker.compose.scenario.run records the original owner-confirmed launch/run activity receipt for the exact validated scenario and compose config-hash. Dispatch acceptance alone is insufficient; the run receipt proves the launch, never health, test pass or terminal success. Restart reads this receipt and never reruns Compose. Extra family-specific predicates: scenario_project: scenario and original result belong to the exact Project; config_fingerprint: fingerprint equals the owner-computed resolved config hash, never env-file contents; validation: existing scenario validation succeeds before enabled action; scenario_effect: original result proves the run fact, not UI acceptance. False/no-op/rejected results emit no successful mutation fact. Compound owner changes preserve all required facts and canonical visibility atomically; no partly admitted subset claims to be complete. Cross-owner original records remain owned by their respective source owners.
10. **Consumers/checkpoints.** The exact read-only operating consumer is `storage.w3h.docker_compose_scenario_run.recovery_read.v1@1.0.0`, called by `ComposeScenarioController` for existing original-result/restart inspection; it never reconstructs or changes canonical domain state from events. It explicitly adopts SP-278 and `reader.storage.event_record_index@1.0.0`: resolve CURRENT, authentic root/generation/anchor/frontier/dataset and complete source selection in one live transaction, authenticate the complete captured range and every matching source/payload, then filter exact partition+`docker.compose.scenario.run`. Unsupported/corrupt/missing source is unavailable, never skipped as empty. SP-278 alone owns the generic checkpoint’s whole-value CAS, monotonic frontier and rebuild. This read-only family owns **no projector, projection or independent durable checkpoint** (`checkpoint_disposition=none_required`): zero durable reader effects. Any persisted SP-278 token remains its nine durable fields (DL-076); join the transaction’s live redb_snapshot_id only in memory and revalidate the complete live token after every helper immediately before disclosure. Empty verified range, zero matching events and missing coverage are distinct. Reader withdrawal fences interpretation. No current continuation/dispatch authority comes from this history read.
11. **Compatibility/withdrawal.** No alias, automatic legacy converter or historical emission is asserted for this newly prepared family. Preserve actual old admitted shapes and original recipes only when authenticated original issuance selects them; schema/version/recipe/source substitution or unknown selection refuses. Unsupported future versions never mutate. Writer withdrawal first cuts off this exact family/source edition under append lock, fences new prepares and append drains, and preserves pending accepted effects as unresolved custody. Exact retained-result lookup is read-only and needs authorized retained admission. Reader withdrawal stops interpretation and generic-index filtered reads for this family; it never deletes source or dedupe/receipt custody. Generic-index rebuilding excludes withdrawn interpretation and carries truthful coverage; re-enablement needs explicit reviewed version/source adoption, not a replay alias. Current live guards do not retroactively invalidate otherwise valid retained originals.
12. **Oracles.** `docker.compose.scenario.run` has its own positive, schema, source, identity, retry, receipt, retention/access, transition, token and withdrawal plan in `reports/event-authority-20261105/W3H-oracle-plan.json`. Every planned negative starts from a valid case and changes one input invariant, with all unrelated derived values recomputed. No oracle implementation or guard-removal proof is claimed in phase 1: criterion 12 **PARTIAL**, native **NOT_RUN**. Phase 2 adopts the reviewed shared numeric/time helper and shared guard-isolation tool before Sol/Astra review.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Contracts_V0.md#CV-1553, ContractName:Plans/storage-plan.md#SP-1553, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286
