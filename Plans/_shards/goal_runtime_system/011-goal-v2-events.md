# Shard 011: Goal V2 events

Source: `Plans/Goal_Runtime_System.md`

Source lines: L270-L408

Source SHA256: `5f7ecbac63fbe3dd3380c5e90687f9d28c9396b6fd2aa79081a6a38bb3ce538e`

---

## Goal V2 events

The required semantic event names are `goal.created`, `goal.updated`, `goal.paused`, `goal.resumed`, `goal.blocked`, `goal.completed`, `goal.cancelled`, and `goal.continuation_evaluated`. Each exact name requires its own central EventRecord registration and payload schema before emission. `goal.created` is admitted only through CV-341/SP-294 and `goal.updated` only through CV-342/SP-299; their current source/receipt/result obligations and native availability still apply. Other names retain their own individual admission state; no sibling registration grants emission.

Envelopes carry explicit app/Project scope, null or actual Project as appropriate, real thread/Computer and Goal identity, revision, `currentness_hash`, actor, correlation and causation, idempotency key, and redacted source refs. `goal.updated` carries `change_source` and, for the agent path, `approval_id`. `goal.continuation_evaluated` carries `result`, `user_stop_epoch`, and completion-evidence refs by reference rather than by value. Each app payload/source/append/read/backup version is admitted explicitly under GRS-086; no historical-only family is revived.

No event may carry `objective_text` in full where a hash and a revision reference suffice for audit, and no event may carry secrets, tokens, provider credentials, or raw file bodies.

There is deliberately no `goal.phase_*`, `goal.tranche_*`, `goal.child_*`, or `goal.budget_*` event. Registering one would reintroduce retired structure through the event catalog.

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/storage-plan.md

<!-- W3G phase 1 owner block: newly authored, prepared without admission. -->

### GRS-1512 - goal.paused: prepared event contract

```yaml
plan_unit_id: GRS-1512
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: Newly authored owner contract for goal.paused alone under deck-2 9.a A (DL-450); prepared without
  admission. An eligible nonterminal original Goal moves active or blocked to paused through the admitted lifecycle
  body mutation. The current Stop epoch is latched before another continuation can dispatch. Same-state pause has
  no second change event. Objective text and accepted objective-history head are preserved; workflow records are
  never cancelled by this event.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- CV-317
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- The complete original source satisfies the exact family transition and admission predicate.
- Retry returns the original result without a new effect; inspection never becomes action authority.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/Goal_Runtime_System.md
- Plans/event_authority_w3g
node_compile_hint:
  mode: event_contract_draft
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- W3G phase 1; deck-2 answer 9.a A (DL-450), 2026-11-05
- reports/event-authority-20261105/W3G.md
preserved_exact_tokens:
- goal.paused
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

**Producer and original source.** GoalRuntime cmd.chat.goal.pause through the existing owner.goal.body.mutation@1.0.0 authority and actual host Stop control. Reuse GRS-048/051/064/086, SP-287/SP-351 complete original body/control/Stop and original narrow body mutation receipt. Original custody means the genuine original owner-issued record/result and transaction, not an event-shaped caller object, digest alone, current cache or supplied success boolean. Resolve the full named native source using its selected exact schema/codec; independently compare all copied identities, state, version, revision, refs and hashes at entry and after returning helpers, immediately before append/release. Source bodies remain with their existing owners and lifetimes. A valid retained original is inspected against its authenticated original edition without reacquiring mutable current source state; current access/deletion/withdrawal checks still apply.

The original lifecycle mutation advances the ordinary Goal body revision from expected_revision to expected_revision+1 under GRS-064; accepted objective history/head and objective bytes remain unchanged. The complete actual source/control/Stop afterimages must match the original narrow body receipt.


**Exact control edition and fences.** Current Project writes/retries and their complete before/after control joins select Plans/goal_cancel_command_custody.schema.json#/$defs/StorageBodyControlV2 (wrapper pm.storage_value.goal_body_control.v2, schema_version 2.0.0, record pm.goal.body_control.v2). Validate the actual complete original V2 control, including independently owned cancellation_pending and cancellation_receipt_ref; never default either from missing fields. The selected source is independently authenticated by native owner/installation, not payload source_schema_id. Plans/goal_body_custody.schema.json#/$defs/storage_control is decoder-only for retained originals whose authenticated original installation and original family/selector admission selected V1. It cannot authorize a current write/retry, be relabelled V2 or receive a fabricated cancellation_pending=null upgrade. A retained V2 original keeps its original V2 admission/edition despite later cancellation or Stop. Current disclosure/deletion/withdrawal remains separate. Application sources retain their distinct original GRS-086/CV-366 selected graph; no Project control or hash is cast into an application value and unresolved original app custody leaves the route unavailable. The original current Project body mutation requires `record.cancellation_pending=null` and `record.cancellation_receipt_ref=null` as separate fences. It preserves the complete legal ordinary pending reservation/CAS and actual host Stop; neither field may be inferred from V1 or cleared by this event. Whole original body/control before/after and narrow receipt joins are rechecked at the final write/retry boundary. Already committed native results resolve through their original custody without repeating the mutation. This selection reuses main `73f2231a9ec1c93190adafcdde51030f028c8c2d`: GRS-064 selects BodyControlV2 for every current mutation/read/backup route; the existing `goal_body_control` registry row selects schema 2.0.0 and explicitly includes pause/resume. No DG/DG-OWN owner change or integration-only control copy is required.

**Payload and scope.** CV-1512 selects `Plans/event_authority_w3g/payloads/goal_paused.schema.json` at each named closed selector in `Plans/event_authority_w3g/contracts.json`. Project and application are distinct new selectors; app has real Server/Computer/thread and null Project. Payload identity must match the native source and Contracts_V0 EventRecord. Payloads carry refs/hashes and closed scalar facts, never Plan documents, notebook bodies, research propositions, Goal objective text, secrets or private content. An eligible nonterminal original Goal moves active or blocked to paused through the admitted lifecycle body mutation. The current Stop epoch is latched before another continuation can dispatch. Same-state pause has no second change event. Objective text and accepted objective-history head are preserved; workflow records are never cancelled by this event.

**Replay, consumer and checkpoints.** SP-1512 adopts SP-286/CV-339 strict stored-v2 first-receipt custody and `storage.first_append_receipt.resolve_full_value.v1`, preserving the original eleven receipt fields and whole original EventRecord commitment. `reader.goal.paused.history.v1@1.0.0` is the sole newly authored family history reader for Goal Activity history; current controls still reload native Goal/Stop state. It adopts SP-278's `projector.storage.event_record_index@1.0.0`, `reader.storage.event_record_index@1.0.0` and exact generic checkpoint `event_record_index_checkpoint.v1:{storage_instance_id}` / `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`. This family intentionally has no persisted filtered projection or private checkpoint. Its reader scans the entire captured generic global range, filters this exact event/scope/subject, returns authenticated observations, and holds only the current read's ten-field token. Any stored resume token has only SP-278/DL-076's nine durable fields, never redb_snapshot_id. Only the generic projector advances its existing checkpoint, atomically with rows under full CAS. Empty matching results still require complete examined coverage; missing source is unavailable. History cannot drive another command, notification, provider request, charge, note write, resume, completion or approval.

**Custody, retention and withdrawal.** Original custody means the genuine original owner-issued record/result and transaction, not an event-shaped caller object, digest alone, current cache or supplied success boolean. Resolve the full named native source using its selected exact schema/codec; independently compare all copied identities, state, version, revision, refs and hashes at entry and after returning helpers, immediately before append/release. Source bodies remain with their existing owners and lifetimes. A valid retained original is inspected against its authenticated original edition without reacquiring mutable current source state; current access/deletion/withdrawal checks still apply. SP-1512 binds retention as `RP-AUTHORITY-INDEFINITE@1.0.0` in its Project and application scopes, assigned by DL-453 (E-CARDS-3 item 1.a, option A) as Storage's third-sitting retention assignments record it on main f8b2098608 (Plans/storage-plan.md:17638 and :17648): no age or count expiry and no new count allowance; explicit Project or application data deletion and storage-pressure refusal apply exactly as DL-453 states, and the native record, receipt and source keep their own lifetimes. No reference extends the linked body's retention. Withdrawal first fences this exact producer/schema selector at append admission, drains or preserves original pending operations without undoing committed native effects, and records the cutoff through existing Storage migration/registry ownership. Current consumption of the withdrawn selector stops; held/staged/current generic index generations cannot bypass it. Rebuild the generic index only from surviving authentic originals under SP-278; never rewrite event bytes, relabel an old schema, rehash a retained original, revive purged content or infer an absent admission. Retained audit uses its original edition and current access/hold/deletion policy, explicitly disclosing a withdrawn/unsupported selector as unavailable rather than executing it. Future/unknown editions fail closed. No family is admitted by this phase.

**Criterion 12.** `ATS-1262` and the `goal.paused` entry in `Plans/event_authority_w3g/oracle_plan.json` name each planned positive and single-defect negative. Executable fixtures and shared guard-isolation proof are phase 2; criterion 12 remains PARTIAL.

ContractRef: ContractName:Plans/Contracts_V0.md#CV-1512, ContractName:Plans/storage-plan.md#SP-1512

### GRS-1513 - goal.resumed: prepared event contract

```yaml
plan_unit_id: GRS-1513
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: 'Newly authored owner contract for goal.resumed alone under deck-2 9.a A (DL-450); prepared without
  admission. An original paused or blocked Goal becomes active only on explicit user resume, exact body/currentness
  and permission checks, no effective manual-stop latch, and cleared blocked_reason_ref where present. This event
  does not clear a latch: the existing host owner must independently establish eligibility. Quota/window/dependency/approval/reconnect
  cannot supply user resume authority. Same-state active replay emits no second change.'
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- CV-317
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- The complete original source satisfies the exact family transition and admission predicate.
- Retry returns the original result without a new effect; inspection never becomes action authority.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/Goal_Runtime_System.md
- Plans/event_authority_w3g
node_compile_hint:
  mode: event_contract_draft
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- W3G phase 1; deck-2 answer 9.a A (DL-450), 2026-11-05
- reports/event-authority-20261105/W3G.md
preserved_exact_tokens:
- goal.resumed
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

**Producer and original source.** GoalRuntime cmd.chat.goal.resume after explicit user authority and existing host continuation revalidation. Reuse GRS-048/050/051/064/086, original body/control/Stop, current permission and any blocked-condition clearance source. Original custody means the genuine original owner-issued record/result and transaction, not an event-shaped caller object, digest alone, current cache or supplied success boolean. Resolve the full named native source using its selected exact schema/codec; independently compare all copied identities, state, version, revision, refs and hashes at entry and after returning helpers, immediately before append/release. Source bodies remain with their existing owners and lifetimes. A valid retained original is inspected against its authenticated original edition without reacquiring mutable current source state; current access/deletion/withdrawal checks still apply.

The original lifecycle mutation advances the ordinary Goal body revision from expected_revision to expected_revision+1 under GRS-064; accepted objective history/head and objective bytes remain unchanged. Resume preserves every unrelated workflow/Plan/To-Do record and never changes scope or creation identity.


**Exact control edition and fences.** Current Project writes/retries and their complete before/after control joins select Plans/goal_cancel_command_custody.schema.json#/$defs/StorageBodyControlV2 (wrapper pm.storage_value.goal_body_control.v2, schema_version 2.0.0, record pm.goal.body_control.v2). Validate the actual complete original V2 control, including independently owned cancellation_pending and cancellation_receipt_ref; never default either from missing fields. The selected source is independently authenticated by native owner/installation, not payload source_schema_id. Plans/goal_body_custody.schema.json#/$defs/storage_control is decoder-only for retained originals whose authenticated original installation and original family/selector admission selected V1. It cannot authorize a current write/retry, be relabelled V2 or receive a fabricated cancellation_pending=null upgrade. A retained V2 original keeps its original V2 admission/edition despite later cancellation or Stop. Current disclosure/deletion/withdrawal remains separate. Application sources retain their distinct original GRS-086/CV-366 selected graph; no Project control or hash is cast into an application value and unresolved original app custody leaves the route unavailable. The original current Project body mutation requires `record.cancellation_pending=null` and `record.cancellation_receipt_ref=null` as separate fences. It preserves the complete legal ordinary pending reservation/CAS and actual host Stop; neither field may be inferred from V1 or cleared by this event. Whole original body/control before/after and narrow receipt joins are rechecked at the final write/retry boundary. Already committed native results resolve through their original custody without repeating the mutation. This selection reuses main `73f2231a9ec1c93190adafcdde51030f028c8c2d`: GRS-064 selects BodyControlV2 for every current mutation/read/backup route; the existing `goal_body_control` registry row selects schema 2.0.0 and explicitly includes pause/resume. No DG/DG-OWN owner change or integration-only control copy is required.

**Payload and scope.** CV-1513 selects `Plans/event_authority_w3g/payloads/goal_resumed.schema.json` at each named closed selector in `Plans/event_authority_w3g/contracts.json`. Project and application are distinct new selectors; app has real Server/Computer/thread and null Project. Payload identity must match the native source and Contracts_V0 EventRecord. Payloads carry refs/hashes and closed scalar facts, never Plan documents, notebook bodies, research propositions, Goal objective text, secrets or private content. An original paused or blocked Goal becomes active only on explicit user resume, exact body/currentness and permission checks, no effective manual-stop latch, and cleared blocked_reason_ref where present. This event does not clear a latch: the existing host owner must independently establish eligibility. Quota/window/dependency/approval/reconnect cannot supply user resume authority. Same-state active replay emits no second change.

**Replay, consumer and checkpoints.** SP-1513 adopts SP-286/CV-339 strict stored-v2 first-receipt custody and `storage.first_append_receipt.resolve_full_value.v1`, preserving the original eleven receipt fields and whole original EventRecord commitment. `reader.goal.resumed.history.v1@1.0.0` is the sole newly authored family history reader for Goal Activity history; current controls still reload native Goal/Stop state. It adopts SP-278's `projector.storage.event_record_index@1.0.0`, `reader.storage.event_record_index@1.0.0` and exact generic checkpoint `event_record_index_checkpoint.v1:{storage_instance_id}` / `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`. This family intentionally has no persisted filtered projection or private checkpoint. Its reader scans the entire captured generic global range, filters this exact event/scope/subject, returns authenticated observations, and holds only the current read's ten-field token. Any stored resume token has only SP-278/DL-076's nine durable fields, never redb_snapshot_id. Only the generic projector advances its existing checkpoint, atomically with rows under full CAS. Empty matching results still require complete examined coverage; missing source is unavailable. History cannot drive another command, notification, provider request, charge, note write, resume, completion or approval.

**Custody, retention and withdrawal.** Original custody means the genuine original owner-issued record/result and transaction, not an event-shaped caller object, digest alone, current cache or supplied success boolean. Resolve the full named native source using its selected exact schema/codec; independently compare all copied identities, state, version, revision, refs and hashes at entry and after returning helpers, immediately before append/release. Source bodies remain with their existing owners and lifetimes. A valid retained original is inspected against its authenticated original edition without reacquiring mutable current source state; current access/deletion/withdrawal checks still apply. SP-1513 binds retention as `RP-AUTHORITY-INDEFINITE@1.0.0` in its Project and application scopes, assigned by DL-453 (E-CARDS-3 item 1.a, option A) as Storage's third-sitting retention assignments record it on main f8b2098608 (Plans/storage-plan.md:17638 and :17648): no age or count expiry and no new count allowance; explicit Project or application data deletion and storage-pressure refusal apply exactly as DL-453 states, and the native record, receipt and source keep their own lifetimes. No reference extends the linked body's retention. Withdrawal first fences this exact producer/schema selector at append admission, drains or preserves original pending operations without undoing committed native effects, and records the cutoff through existing Storage migration/registry ownership. Current consumption of the withdrawn selector stops; held/staged/current generic index generations cannot bypass it. Rebuild the generic index only from surviving authentic originals under SP-278; never rewrite event bytes, relabel an old schema, rehash a retained original, revive purged content or infer an absent admission. Retained audit uses its original edition and current access/hold/deletion policy, explicitly disclosing a withdrawn/unsupported selector as unavailable rather than executing it. Future/unknown editions fail closed. No family is admitted by this phase.

**Criterion 12.** `ATS-1262` and the `goal.resumed` entry in `Plans/event_authority_w3g/oracle_plan.json` name each planned positive and single-defect negative. Executable fixtures and shared guard-isolation proof are phase 2; criterion 12 remains PARTIAL.

ContractRef: ContractName:Plans/Contracts_V0.md#CV-1513, ContractName:Plans/storage-plan.md#SP-1513
