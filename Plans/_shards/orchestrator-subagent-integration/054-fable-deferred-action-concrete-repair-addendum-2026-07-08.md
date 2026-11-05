# Shard 054: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L31685-L31997

Source SHA256: `167320640f25243ff4455ee1dc78947cc43665649f631ba254ae1e46da54ef20`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum is canonical orchestration spec text for the deferred non-runtime FABLE rows listed below. It does not certify runtime lifecycle behavior, does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, build tasks, final manifests, or PNC-019 receipts, and does not change `buildability_gate_passed`.

### Required-Subagent Criticality And Parallel Failure Policy

Repairs rows `sfk-87505ab95981f07d6604f714` and `sfk-eb80bcd7eb429ea562ef5551`.

- `critical_subagent` is true only when the subagent `agent_id` or `lane_id` appears in the active `required_subagents[]` set for the current tier, phase, or repair lane. Optional review, exploration, and advisory agents are non-critical unless explicitly listed in `required_subagents[]`.
- A critical tier is any tier whose `required_subagents[]` is non-empty and whose required set has not reached a terminal `completed` or approved `skipped` state. Failure of a non-critical subagent records degraded evidence but does not fail the tier by itself.
- For a parallel group, the first critical failure emits `subagent.parallel_group_failed` with fields `group_id`, `failed_agent_id`, `failure_class`, `required_agent_ids[]`, `completed_agent_ids[]`, `cancel_requested_agent_ids[]`, `retained_partial_agent_ids[]`, and `created_at_utc`.
- Cancellable siblings receive `subagent.cancel_requested`; non-cancellable siblings are drained until a terminal receipt or `parallel_group.drain_timeout_ms` expires. Default `parallel_group.drain_timeout_ms` is `30000`.
- Partial results may be retained only with `partial_result_state = retained_after_group_failure`, `source_agent_id`, `redaction_status`, and `usable_for_repair = false` unless a parent writer explicitly accepts the partial evidence.


### OSI-1604 — Sibling cancellation delivery only (DL-452)

Deck 2 item 9.c A / DL-452 (on `plans/ea-cards2-answers-20261105`) resolves `subagent.cancel_requested` as the live delivery signal in Required-Subagent Criticality And Parallel Failure Policy. The existing rule that cancellable siblings receive it remains required. It is not a separately persisted EventRecord family; no request-history payload, writer, retention policy or admission is introduced. The first critical failure still records `subagent.parallel_group_failed`; each sibling still obeys its existing terminal-result contract. Non-cancellable siblings still drain until a terminal receipt or the unchanged `parallel_group.drain_timeout_ms` limit. Re-delivery is not a second saved-history event.

```yaml
plan_unit_id: OSI-1604
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: 'DL-452 / E-CARDS-2 9.c A: subagent.cancel_requested is delivery only, with no separately persisted
  family. Preserve cancellable-sibling delivery, group failure and sibling terminal outcomes; preserve the existing
  drain limit.'
gui_related: false
gui_classification_reason: Audit lineage, storage, and test contracts; no new presentation behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- Cancellation delivery and existing group/terminal history remain required.
- No subagent.cancel_requested EventRecord or family contract is introduced.
validation_surfaces:
- reports/event-authority-20261105/W3I-application.json
risk_class: continuity_source_custody_drift
reasoning_tier: high
context_scope: event_authority_w3i_phase1
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
- Plans/continuity_event_contracts.schema.json
node_compile_hint:
  mode: prepared_without_admission
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-2 item 9.a A; answer i approve all of it; DL-450 on plans/ea-cards2-answers-20261105
- reports/event-authority-20261105/W3I.md#osi-1604
preserved_exact_tokens:
- subagent.cancel_requested
- subagent.parallel_group_failed
- parallel_group.drain_timeout_ms
negative_constraints:
- No event-family admission, native execution, registry append, or PNC-019 clearance.
- No runtime_continuity alias or receipt reconstructed from current state.
```

### Handoff Retry Ceiling

Repairs row `sfk-f0bb4b941956a19bb7f62357`.

- The canonical config key is `subagent.handoff.max_retries`.
- Default `subagent.handoff.max_retries = 1`; the initial handoff attempt is not counted as a retry.
- Effective range is `0..=3`. Values above 3 are invalid in product spec and must be rejected before dispatch.
- On exhaustion, the handoff records `handoff_retry_exhausted` with `attempt_count`, `max_retries`, `last_error_class`, and `next_allowed_actions[] = [retry, skip_with_operator_acceptance, view_raw_output]`.

### Execution-Unit Hook Naming

Repairs row `sfk-1a88c3d82dd8176a236abe6a`.

- Canonical hook names are `BeforeUnit`, `AfterUnit`, `VerifyUnitStart`, and `VerifyUnitEnd`.
- Legacy `BeforeTier`, `AfterTier`, and `verify_tier_start` strings are source-lineage aliases only. They may appear in imported records, but normalized orchestration records must store `hook_name_normalized` using the canonical execution-unit names.
- Import normalization table: `BeforeTier -> BeforeUnit`, `AfterTier -> AfterUnit`, `verify_tier_start -> VerifyUnitStart`, `verify_tier_end -> VerifyUnitEnd`.
- New owner prose and generated receipts must not introduce tier-era hook names as active hook identifiers.

### Cross-Platform Process Existence Check

Repairs row `sfk-79825aa01b5e2048e47435a8`.

- Unix process existence uses `kill(pid, 0)` and distinguishes `exists`, `not_found`, and `permission_denied`.
- Windows process existence uses `OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid)`. A valid handle followed by `GetExitCodeProcess == STILL_ACTIVE` returns `exists`; a valid handle with an exited code returns `not_found`; `ERROR_INVALID_PARAMETER` returns `not_found`; `ERROR_ACCESS_DENIED` returns `permission_denied`.
- `permission_denied` is not treated as proof of liveness for scheduling. It must trigger a fresh owner-visible verification step before any state transition that depends on process liveness.
- The placeholder behavior `true // Assume exists for now` is retired source-lineage only.

### Continuity Record Family

Repairs row `sfk-778d356662ba6f5cd8981897`.

- Required continuity event families are `continuity.actor_identified`, `continuity.provenance_recorded`, `continuity.redaction_applied`, and `continuity.replay_checkpointed`.
- The redb projection key is `continuity_record.v1:{project_id}:{continuity_id}`. The replay checkpoint key is `continuity_replay_checkpoint.v1:{project_id}:{stream_id}`.
- `continuity_record` fields are `continuity_id`, `project_id`, `actor_ref`, `actor_kind`, `source_event_id`, `provenance_ref`, `redaction_profile_id`, `redaction_decision`, `replay_checkpoint_ref?`, `created_at_utc`, and `schema_version`.
- These records preserve audit continuity only. They do not certify executable runtime lifecycle behavior and must not be used as PNC-019 evidence.


### OSI-1600 — `continuity.actor_identified` original fact

**NEWLY AUTHORED owner contract**, DL-450 / deck 2 item 9.a A. This family records identification of the actor responsible for the original source event. It preserves the audit-only boundary of Continuity Record Family and CV-282; it cannot certify lifecycle, schedule work, or satisfy PNC-019. This is a separate family: no equality with a `runtime_continuity.*` name has been proved.

orchestrator.continuity_actor_identified.v1@1.0.0 is the sole semantic producer. It observes an already durable original source event/output/handoff; actor_ref and actor_kind equal the independently resolved original source principal and principal kind. `fact_ref` resolves that immutable original owner observation, not a UI label or caller boolean. The original owner resolver must independently authenticate source identity, project, stream, version, actor/principal kind, provenance, redaction result, and time. Missing original evidence returns unavailable before any accepted append. No source observation is synthesized from the current projection. The observed `source_event_id` must already be durably issued and cannot equal this new event. All required snapshot fields in CV-1600 must agree with that original; equality of two substituted inputs is insufficient.

A new observation has a stable `continuity_id` and original `fact_ref`; a retry preserves both and all original semantic values. A distinct actual fact requires a distinct original `fact_ref`. Re-observing an unchanged fact is a retry, not a new transition. This event does not alter the source principal, provenance, redaction, or source replay position; it records the completed fact. The producer adopts CV-1600 and SP-1600 individually, including the full SP-286/CV-339 v2 first-receipt ordering and unavailable/uncertain fences. Producer and Storage admission both remain disabled while this exact family is absent from the event registry.

```yaml
plan_unit_id: OSI-1600
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: NEWLY AUTHORED continuity.actor_identified records identification of the actor responsible for the
  original source event; actor_ref and actor_kind equal the independently resolved original source principal and
  principal kind. The exact original source is resolved and verified before append; unchanged observations retry
  the original identity. Adopt CV-1600, SP-1600 and SP-286/CV-339 v2; admission and native production remain unavailable.
gui_related: false
gui_classification_reason: Audit lineage, storage, and test contracts; no new presentation behavior.
depends_on:
- CV-282
- CV-1600
unblocks: []
acceptance_criteria:
- Original source and snapshot facts agree before append.
- Unchanged observation never creates another event.
- Current and retained reader boundaries preserve original facts.
validation_surfaces:
- Plans/Automated_Testing_System.md#ATS-1280
risk_class: continuity_source_custody_drift
reasoning_tier: high
context_scope: event_authority_w3i_phase1
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
- Plans/continuity_event_contracts.schema.json
node_compile_hint:
  mode: prepared_without_admission
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-2 item 9.a A; answer i approve all of it; DL-450 on plans/ea-cards2-answers-20261105
- reports/event-authority-20261105/W3I.md#osi-1600
preserved_exact_tokens:
- continuity.actor_identified
- fact_ref
- source_event_id
- prepared_without_admission
negative_constraints:
- No event-family admission, native execution, registry append, or PNC-019 clearance.
- No runtime_continuity alias or receipt reconstructed from current state.
```

### OSI-1601 — `continuity.provenance_recorded` original fact

**NEWLY AUTHORED owner contract**, DL-450 / deck 2 item 9.a A. This family records the original source and provenance of a continuity record. It preserves the audit-only boundary of Continuity Record Family and CV-282; it cannot certify lifecycle, schedule work, or satisfy PNC-019. This is a separate family: no equality with a `runtime_continuity.*` name has been proved.

orchestrator.continuity_provenance_recorded.v1@1.0.0 is the sole semantic producer. It observes an already durable original source event/output/handoff; provenance_ref resolves the exact retained output or handoff version that names source_event_id; a route target is not provenance evidence. `fact_ref` resolves that immutable original owner observation, not a UI label or caller boolean. The original owner resolver must independently authenticate source identity, project, stream, version, actor/principal kind, provenance, redaction result, and time. Missing original evidence returns unavailable before any accepted append. No source observation is synthesized from the current projection. The observed `source_event_id` must already be durably issued and cannot equal this new event. All required snapshot fields in CV-1601 must agree with that original; equality of two substituted inputs is insufficient.

A new observation has a stable `continuity_id` and original `fact_ref`; a retry preserves both and all original semantic values. A distinct actual fact requires a distinct original `fact_ref`. Re-observing an unchanged fact is a retry, not a new transition. This event does not alter the source principal, provenance, redaction, or source replay position; it records the completed fact. The producer adopts CV-1601 and SP-1601 individually, including the full SP-286/CV-339 v2 first-receipt ordering and unavailable/uncertain fences. Producer and Storage admission both remain disabled while this exact family is absent from the event registry.

```yaml
plan_unit_id: OSI-1601
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: NEWLY AUTHORED continuity.provenance_recorded records the original source and provenance of a continuity
  record; provenance_ref resolves the exact retained output or handoff version that names source_event_id; a route
  target is not provenance evidence. The exact original source is resolved and verified before append; unchanged
  observations retry the original identity. Adopt CV-1601, SP-1601 and SP-286/CV-339 v2; admission and native production
  remain unavailable.
gui_related: false
gui_classification_reason: Audit lineage, storage, and test contracts; no new presentation behavior.
depends_on:
- CV-282
- CV-1601
unblocks: []
acceptance_criteria:
- Original source and snapshot facts agree before append.
- Unchanged observation never creates another event.
- Current and retained reader boundaries preserve original facts.
validation_surfaces:
- Plans/Automated_Testing_System.md#ATS-1281
risk_class: continuity_source_custody_drift
reasoning_tier: high
context_scope: event_authority_w3i_phase1
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
- Plans/continuity_event_contracts.schema.json
node_compile_hint:
  mode: prepared_without_admission
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-2 item 9.a A; answer i approve all of it; DL-450 on plans/ea-cards2-answers-20261105
- reports/event-authority-20261105/W3I.md#osi-1601
preserved_exact_tokens:
- continuity.provenance_recorded
- fact_ref
- source_event_id
- prepared_without_admission
negative_constraints:
- No event-family admission, native execution, registry append, or PNC-019 clearance.
- No runtime_continuity alias or receipt reconstructed from current state.
```

### OSI-1602 — `continuity.redaction_applied` original fact

**NEWLY AUTHORED owner contract**, DL-450 / deck 2 item 9.a A. This family records the actual redaction disposition attached to the original continuity source. It preserves the audit-only boundary of Continuity Record Family and CV-282; it cannot certify lifecycle, schedule work, or satisfy PNC-019. This is a separate family: no equality with a `runtime_continuity.*` name has been proved.

orchestrator.continuity_redaction_applied.v1@1.0.0 is the sole semantic producer. It observes an already durable original source event/output/handoff; redaction_profile_id and redaction_decision equal the actual original redaction owner result for provenance_ref, including its transform/version; a requested transform is not an applied result. `fact_ref` resolves that immutable original owner observation, not a UI label or caller boolean. The original owner resolver must independently authenticate source identity, project, stream, version, actor/principal kind, provenance, redaction result, and time. Missing original evidence returns unavailable before any accepted append. No source observation is synthesized from the current projection. The observed `source_event_id` must already be durably issued and cannot equal this new event. All required snapshot fields in CV-1602 must agree with that original; equality of two substituted inputs is insufficient.

A new observation has a stable `continuity_id` and original `fact_ref`; a retry preserves both and all original semantic values. A distinct actual fact requires a distinct original `fact_ref`. Re-observing an unchanged fact is a retry, not a new transition. This event does not alter the source principal, provenance, redaction, or source replay position; it records the completed fact. The producer adopts CV-1602 and SP-1602 individually, including the full SP-286/CV-339 v2 first-receipt ordering and unavailable/uncertain fences. Producer and Storage admission both remain disabled while this exact family is absent from the event registry.

```yaml
plan_unit_id: OSI-1602
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: NEWLY AUTHORED continuity.redaction_applied records the actual redaction disposition attached to
  the original continuity source; redaction_profile_id and redaction_decision equal the actual original redaction
  owner result for provenance_ref, including its transform/version; a requested transform is not an applied result.
  The exact original source is resolved and verified before append; unchanged observations retry the original identity.
  Adopt CV-1602, SP-1602 and SP-286/CV-339 v2; admission and native production remain unavailable.
gui_related: false
gui_classification_reason: Audit lineage, storage, and test contracts; no new presentation behavior.
depends_on:
- CV-282
- CV-1602
unblocks: []
acceptance_criteria:
- Original source and snapshot facts agree before append.
- Unchanged observation never creates another event.
- Current and retained reader boundaries preserve original facts.
validation_surfaces:
- Plans/Automated_Testing_System.md#ATS-1282
risk_class: continuity_source_custody_drift
reasoning_tier: high
context_scope: event_authority_w3i_phase1
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
- Plans/continuity_event_contracts.schema.json
node_compile_hint:
  mode: prepared_without_admission
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-2 item 9.a A; answer i approve all of it; DL-450 on plans/ea-cards2-answers-20261105
- reports/event-authority-20261105/W3I.md#osi-1602
preserved_exact_tokens:
- continuity.redaction_applied
- fact_ref
- source_event_id
- prepared_without_admission
negative_constraints:
- No event-family admission, native execution, registry append, or PNC-019 clearance.
- No runtime_continuity alias or receipt reconstructed from current state.
```

### OSI-1603 — `continuity.replay_checkpointed` original fact

**NEWLY AUTHORED owner contract**, DL-450 / deck 2 item 9.a A. This family records a verified saved position reached while replaying the original audit source stream. It preserves the audit-only boundary of Continuity Record Family and CV-282; it cannot certify lifecycle, schedule work, or satisfy PNC-019. This is a separate family: no equality with a `runtime_continuity.*` name has been proved.

orchestrator.continuity_replay_checkpointed.v1@1.0.0 is the sole semantic producer. It observes an already durable original source event/output/handoff; replay_checkpoint_ref resolves the original source stream checkpoint, whose complete SP-278 durable token and examined prefix include source_event_id; it is an upstream checkpoint, never this event or its downstream continuity checkpoint. `fact_ref` resolves that immutable original owner observation, not a UI label or caller boolean. The original owner resolver must independently authenticate source identity, project, stream, version, actor/principal kind, provenance, redaction result, and time. Missing original evidence returns unavailable before any accepted append. No source observation is synthesized from the current projection. The observed `source_event_id` must already be durably issued and cannot equal this new event. All required snapshot fields in CV-1603 must agree with that original; equality of two substituted inputs is insufficient.

A new observation has a stable `continuity_id` and original `fact_ref`; a retry preserves both and all original semantic values. A distinct actual fact requires a distinct original `fact_ref`. Re-observing an unchanged fact is a retry, not a new transition. This event does not alter the source principal, provenance, redaction, or source replay position; it records the completed fact. The producer adopts CV-1603 and SP-1603 individually, including the full SP-286/CV-339 v2 first-receipt ordering and unavailable/uncertain fences. Producer and Storage admission both remain disabled while this exact family is absent from the event registry.

```yaml
plan_unit_id: OSI-1603
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: NEWLY AUTHORED continuity.replay_checkpointed records a verified saved position reached while replaying
  the original audit source stream; replay_checkpoint_ref resolves the original source stream checkpoint, whose
  complete SP-278 durable token and examined prefix include source_event_id; it is an upstream checkpoint, never
  this event or its downstream continuity checkpoint. The exact original source is resolved and verified before
  append; unchanged observations retry the original identity. Adopt CV-1603, SP-1603 and SP-286/CV-339 v2; admission
  and native production remain unavailable.
gui_related: false
gui_classification_reason: Audit lineage, storage, and test contracts; no new presentation behavior.
depends_on:
- CV-282
- CV-1603
unblocks: []
acceptance_criteria:
- Original source and snapshot facts agree before append.
- Unchanged observation never creates another event.
- Current and retained reader boundaries preserve original facts.
validation_surfaces:
- Plans/Automated_Testing_System.md#ATS-1283
risk_class: continuity_source_custody_drift
reasoning_tier: high
context_scope: event_authority_w3i_phase1
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
- Plans/continuity_event_contracts.schema.json
node_compile_hint:
  mode: prepared_without_admission
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-2 item 9.a A; answer i approve all of it; DL-450 on plans/ea-cards2-answers-20261105
- reports/event-authority-20261105/W3I.md#osi-1603
preserved_exact_tokens:
- continuity.replay_checkpointed
- fact_ref
- source_event_id
- prepared_without_admission
negative_constraints:
- No event-family admission, native execution, registry append, or PNC-019 clearance.
- No runtime_continuity alias or receipt reconstructed from current state.
```

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
