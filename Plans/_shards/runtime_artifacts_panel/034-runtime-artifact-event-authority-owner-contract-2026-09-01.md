# Shard 034: Runtime Artifact Event Authority Owner Contract - 2026-09-01

Source: `Plans/Runtime_Artifacts_Panel.md`

Source lines: L2452-L2622

Source SHA256: `7b67c3b77b9b01ff15f7d0ef2e1561c9a3c00add9b610c9d4128d52a4c920b7b`

---

## Runtime Artifact Event Authority Owner Contract - 2026-09-01

This section is the Runtime Artifacts semantic-owner disposition for the exact Option 2 taxonomy in RAP-004. It closes owner intent and payload-schema material depth only. It does not edit or supersede the EventRecord envelope, register any family, assign persistence behavior, authorize append or dispatch, advance a projector checkpoint, certify executable depth, or authorize PNC-019. Registry admission, storage binding, dedupe execution, replay/recovery fixtures, projector fixtures, and producer/consumer runtime evidence remain a separate Event Authority wave.

Every row below has project scope `project_id required; cross-project payload or routing references rejected`, and recommends retention class `RP-AUTHORITY-INDEFINITE` for later storage-owner adjudication. The recommendation is not a current retention assignment. The exact dedupe identity recommendation is the length-framed tuple `[event_type, project_id, artifact_id, schema_id]`; storage must bind that tuple before admission and must not dedupe by timestamp, summary, preview content, or artifact subtype.

| Exact event type | Semantic transition | Payload schema ID / ref / version | Producer -> consumers | Material-depth status |
| --- | --- | --- | --- | --- |
| `runtime_artifact.api_web_call` | A validated redacted web-operation artifact record becomes durable and addressable; success/failure remains payload evidence rather than event-name variation. | `pm.runtime_artifact.api_web_call.schema.v1` / `Plans/runtime_artifact_api_web_call.schema.json` / `v1` | WebOperation artifact writer -> Runtime Artifacts projector, web evidence viewer, audit consumers | `preserved_existing_field_deep; owner_schema_ready_not_authorized` |
| `runtime_artifact.artifact_version` | A distinct immutable version record for one source artifact becomes durable. | `pm.runtime_artifact.artifact_version.schema.v1` / `Plans/runtime_artifact_artifact_version.schema.json` / `v1` | Artifact versioning writer -> Runtime Artifacts projector and artifact history viewer | `closed_field_deep_2026-09-01; owner_schema_ready_not_authorized` |
| `runtime_artifact.before_after_snapshot` | A bounded before/after comparison record becomes durable with exact referenced sides and optional typed comparison results. | `pm.runtime_artifact.before_after_snapshot.schema.v1` / `Plans/runtime_artifact_before_after_snapshot.schema.json` / `v1` | Comparison/capture writer -> Runtime Artifacts projector and compare viewer | `closed_field_deep_2026-09-01; owner_schema_ready_not_authorized` |
| `runtime_artifact.browser_recording` | A browser recording record is sealed with session identity, security class, recording ref, actions, and redaction profile. | `pm.runtime_artifact.browser_recording.schema.v1` / `Plans/runtime_artifact_browser_recording.schema.json` / `v1` | Browser runtime recorder -> Runtime Artifacts projector, recording viewer, security audit | `preserved_existing_field_deep; owner_schema_ready_not_authorized` |
| `runtime_artifact.code_diff` | A code-difference record becomes durable with an exact changed-path census and optional typed diff/base/result detail. | `pm.runtime_artifact.code_diff.schema.v1` / `Plans/runtime_artifact_code_diff.schema.json` / `v1` | Mutation/diff recorder -> Runtime Artifacts projector, File Editor, compare viewer | `closed_field_deep_2026-09-01; owner_schema_ready_not_authorized` |
| `runtime_artifact.context_snapshot` | A redacted context snapshot becomes durable at one exact snapshot ref with optional typed scope, revision, and inclusion metadata. | `pm.runtime_artifact.context_snapshot.schema.v1` / `Plans/runtime_artifact_context_snapshot.schema.json` / `v1` | Context snapshot writer -> Runtime Artifacts projector and handoff/context viewers | `closed_field_deep_2026-09-01; owner_schema_ready_not_authorized` |
| `runtime_artifact.cost_usage` | A usage/cost artifact record becomes durable as a reference-bound projection of Usage authority, not a replacement usage event. | `pm.runtime_artifact.cost_usage.schema.v1` / `Plans/runtime_artifact_cost_usage.schema.json` / `v1` | Usage settlement artifact writer -> Runtime Artifacts projector, Usage, Ledger | `preserved_existing_field_deep; owner_schema_ready_not_authorized` |
| `runtime_artifact.document` | A document artifact record becomes durable at one exact document ref with optional typed MIME, kind, format, digest, and source metadata. | `pm.runtime_artifact.document.schema.v1` / `Plans/runtime_artifact_document.schema.json` / `v1` | Document artifact writer -> Runtime Artifacts projector and document viewer | `closed_field_deep_2026-09-01; owner_schema_ready_not_authorized` |
| `runtime_artifact.evidence` | An evidence artifact record of one exact evidence kind becomes durable with optional reference-bound claim, source, digest, and verification metadata. | `pm.runtime_artifact.evidence.schema.v1` / `Plans/runtime_artifact_evidence.schema.json` / `v1` | Verifier/evidence writer -> Runtime Artifacts projector, evidence viewer, certifier | `closed_field_deep_2026-09-01; owner_schema_ready_not_authorized` |
| `runtime_artifact.failed_attempts` | A bounded failed-attempt aggregation becomes durable without overwriting any attempt record. | `pm.runtime_artifact.failed_attempts.schema.v1` / `Plans/runtime_artifact_failed_attempts.schema.json` / `v1` | Attempt evidence aggregator -> Runtime Artifacts projector and run diagnostics | `closed_field_deep_2026-09-01; owner_schema_ready_not_authorized` |
| `runtime_artifact.hitl_approval` | An already-decided HITL approval receipt projection becomes durable; this event is never the approval command or unblock signal. | `pm.runtime_artifact.hitl_approval.schema.v1` / `Plans/runtime_artifact_hitl_approval.schema.json` / `v1` | Approval-owner receipt bridge -> Runtime Artifacts projector and approval audit viewer | `closed_field_deep_2026-09-01; owner_schema_ready_not_authorized` |
| `runtime_artifact.implementation_plan` | A non-canonical implementation-plan artifact becomes durable at one exact plan ref with optional typed revision, step, dependency, and validation metadata. | `pm.runtime_artifact.implementation_plan.schema.v1` / `Plans/runtime_artifact_implementation_plan.schema.json` / `v1` | Planning artifact writer -> Runtime Artifacts projector and plan artifact viewer | `closed_field_deep_2026-09-01; owner_schema_ready_not_authorized` |
| `runtime_artifact.reasoning_summary` | A summary-only reasoning artifact becomes durable; private chain-of-thought or raw hidden reasoning is not captured. | `pm.runtime_artifact.reasoning_summary.schema.v1` / `Plans/runtime_artifact_reasoning_summary.schema.json` / `v1` | Agent summary writer -> Runtime Artifacts projector and detail viewer | `closed_field_deep_2026-09-01; owner_schema_ready_not_authorized` |
| `runtime_artifact.restore_point` | A restore-point record becomes durable or changes its recorded availability/lifecycle state under the existing field-deep contract. | `pm.runtime_artifact.restore_point.schema.v1` / `Plans/runtime_artifact_restore_point.schema.json` / `v1` | Restore-point owner -> Runtime Artifacts projector, recovery and history viewers | `preserved_existing_field_deep; owner_schema_ready_not_authorized` |
| `runtime_artifact.screenshot` | A referenced screenshot artifact becomes durable at one exact media ref with optional typed digest, dimensions, surface, and redaction metadata. | `pm.runtime_artifact.screenshot.schema.v1` / `Plans/runtime_artifact_screenshot.schema.json` / `v1` | Screenshot/capture writer -> Runtime Artifacts projector and image viewer | `closed_field_deep_2026-09-01; owner_schema_ready_not_authorized` |
| `runtime_artifact.subagent_lineage` | A parent-child delegation lineage artifact becomes durable with exact parent/child attempt refs and optional typed agent, objective, lifecycle, and result metadata. | `pm.runtime_artifact.subagent_lineage.schema.v1` / `Plans/runtime_artifact_subagent_lineage.schema.json` / `v1` | Orchestrator lineage writer -> Runtime Artifacts projector and run/lineage viewers | `closed_field_deep_2026-09-01; owner_schema_ready_not_authorized` |
| `runtime_artifact.suggested_next_steps` | A bounded non-executing next-step list becomes durable with optional typed rationale, priority, dependency, and approval metadata. | `pm.runtime_artifact.suggested_next_steps.schema.v1` / `Plans/runtime_artifact_suggested_next_steps.schema.json` / `v1` | Agent suggestion writer -> Runtime Artifacts projector and suggestion viewer | `closed_field_deep_2026-09-01; owner_schema_ready_not_authorized` |
| `runtime_artifact.tool_llm_trace` | A redacted reference-based tool/LLM trace artifact becomes durable with lifecycle, settlement, retry, refs, and flags. | `pm.runtime_artifact.tool_llm_trace.schema.v1` / `Plans/runtime_artifact_tool_llm_trace.schema.json` / `v1` | Tool/provider trace writer -> Runtime Artifacts projector, trace viewer, Usage joins | `preserved_existing_field_deep; owner_schema_ready_not_authorized` |
| `runtime_artifact.validation_test` | A validation artifact becomes durable with an exact test-id census and optional typed command, suite, lifecycle, per-test result, duration, and evidence metadata. | `pm.runtime_artifact.validation_test.schema.v1` / `Plans/runtime_artifact_validation_test.schema.json` / `v1` | Test/validation writer -> Runtime Artifacts projector, test and evidence viewers | `closed_field_deep_2026-09-01; owner_schema_ready_not_authorized` |

The producer boundary is fail closed: only the named domain owner may ask its runtime-artifact writer to materialize a record, and only after the content/reference is durable, the exact per-type schema validates, `project_id` matches the producer scope, and the storage-owned dedupe key is available. GUI surfaces, projectors, viewers, importers, and compatibility normalizers are consumers only and may not originate these events. A payload must be rejected if it contains an unhandled secret, inline preview bytes, raw screenshot/recording/document content, private chain-of-thought, a generic `subtype`/`artifact_subtype`, an unknown field, or a cross-project ref. Redacted/request/response/raw-payload fields in the five preserved field-deep schemas remain reference- and redaction-status-bound; they do not authorize embedded secret material.

The exact 19 per-type schemas are closed Draft 2020-12 objects. Their required fields are material; optional fields are only those named under each schema's closed `properties`. `summary`, `detail_ref`, `content_ref`, media refs, trace refs, and evidence refs are metadata/reference surfaces, never authority to inline a preview or raw secret. The generic candidate `runtime_artifact.created` is not part of RAP-004 Option 2, has no per-type schema in this set, and remains unadmitted and unauthorized.

### RAP-054 - Runtime Artifact Event Authority Owner And Payload Depth

```yaml
plan_unit_id: RAP-054
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Runtime Artifacts owns exactly 19 Option 2 runtime_artifact.* semantic transitions and their
  closed per-type payload schemas. Every transition is project-scoped, recommends
  RP-AUTHORITY-INDEFINITE for later storage adjudication, uses the exact dedupe tuple
  [event_type, project_id, artifact_id, schema_id], rejects unhandled secrets, inline previews,
  private chain-of-thought, unknown fields, and generic subtype routing, and can be produced only
  by the named domain owner after durable artifact materialization. This owner/schema closure does
  not register a family or authorize EventRecord append, dispatch, projection, checkpoint advance,
  replay, retention execution, runtime implementation, buildability, or PNC-019.
gui_related: false
gui_classification_reason: This unit closes semantic ownership and machine payload depth without changing the visible Runtime Artifacts surface.
depends_on: [RAP-004, RAP-043]
unblocks: []
acceptance_criteria:
  - Exactly the 19 RAP-004 event types appear once in the owner table and map one-to-one to the 19 existing per-type schema files.
  - Every per-type schema is Draft 2020-12, version `v1`, closed against unknown fields, and has an exact non-generic `type_payload` contract.
  - The five already field-deep contracts remain preserved while the fourteen generic-nonempty payloads become field-deep.
  - Positive fixtures validate and missing-required-field, unknown-field, and unhandled-secret fixtures fail for all 19 schemas.
  - Project scope, RP-AUTHORITY-INDEFINITE recommendation, producer/consumer boundary, exact dedupe tuple, no-preview/no-secret/no-generic-subtype constraints, and material-depth status remain explicit.
  - "`runtime_artifact.created` remains outside the exact Option 2 taxonomy and is not admitted by this section."
  - Registry, storage, executable producer/append/dedupe/replay/recovery/projector fixtures, and event append/dispatch authorization remain open and fail closed.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, registry rows, or governance artifacts are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plan-index.py validate
  - scratchpad/pm-integration-20260831/event-authority-successor-20260901/runtime-artifact-depth-repair/manifest.json
risk_class: event_authority_payload_depth_drift
reasoning_tier: high
context_scope: runtime_artifact_event_authority
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/runtime_artifact_api_web_call.schema.json
  - Plans/runtime_artifact_artifact_version.schema.json
  - Plans/runtime_artifact_before_after_snapshot.schema.json
  - Plans/runtime_artifact_browser_recording.schema.json
  - Plans/runtime_artifact_code_diff.schema.json
  - Plans/runtime_artifact_context_snapshot.schema.json
  - Plans/runtime_artifact_cost_usage.schema.json
  - Plans/runtime_artifact_document.schema.json
  - Plans/runtime_artifact_evidence.schema.json
  - Plans/runtime_artifact_failed_attempts.schema.json
  - Plans/runtime_artifact_hitl_approval.schema.json
  - Plans/runtime_artifact_implementation_plan.schema.json
  - Plans/runtime_artifact_reasoning_summary.schema.json
  - Plans/runtime_artifact_restore_point.schema.json
  - Plans/runtime_artifact_screenshot.schema.json
  - Plans/runtime_artifact_subagent_lineage.schema.json
  - Plans/runtime_artifact_suggested_next_steps.schema.json
  - Plans/runtime_artifact_tool_llm_trace.schema.json
  - Plans/runtime_artifact_validation_test.schema.json
node_compile_hint:
  mode: runtime_artifact_event_authority_owner_schema_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Runtime_Artifacts_Panel.md:514-538
  - scratchpad/pm-integration-20260831/event-authority-successor-20260901/aggregate-adjudication/owner-adjudication/CANONICAL_REPAIR_PROPOSAL.jsonl:158-177
  - scripts/pm-plans-verify.py:2627-2647
  - tests/fixtures/runtime_artifacts/golden/runtime_artifact_fixtures.json
preserved_exact_tokens:
  - Option 2 only
  - RP-AUTHORITY-INDEFINITE
  - owner_schema_ready_not_authorized
  - quarantine_without_checkpoint_advance
negative_constraints:
  - Do not append, dispatch, register, persist, replay, project, or advance a checkpoint for these event types from this owner/schema closure.
  - Do not use `runtime_artifact.created`, a generic subtype, preview bytes, raw content, raw secrets, private chain-of-thought, timestamp heuristics, or cross-project refs.
  - Do not treat a GUI action, projector row, artifact status, approval command, receipt, or usage record as the semantic transition itself.
  - Do not claim executable depth, buildability, governance seal, denominator closure, or PNC-019 authorization.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```

### RAP-052 - Retention, Pin, And Tombstone Surface

```yaml
plan_unit_id: RAP-052
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Every artifact row surfaces its retention truth. Rows whose RAP-010 retention class bounds their
  lifetime show an expires-in line derived from the owner retention policy; a pin-to-keep action routes
  through the owning retention/hold surface and is disabled with storage_read_only in viewer mode, where
  permission approval cannot widen the gate. Expiry produces a tombstone row that preserves provenance
  metadata - canonical artifact id, family, run/thread/attempt refs, receipt refs, retention class, and
  redaction summary - after the content itself is gone. Tombstones and cleanup expire only regenerable
  projections; they never delete canonical records or clear descendant/application/legal-hold refs, and
  a tombstone renders visually distinct from failed, blocked, and empty states.
gui_related: true
gui_classification_reason: Expiry lines, pin actions, and tombstone rows are user-visible retention affordances.
depends_on: [RAP-010, RAP-046, RAP-047]
unblocks: []
acceptance_criteria:
  - Bounded-retention rows show an expires-in line sourced from owner retention policy, never a panel-local estimate.
  - Pin-to-keep routes to the owning retention/hold surface and classifies as storage_read_only in viewer mode.
  - Expired rows become tombstones preserving canonical id, family, lineage refs, receipt refs, retention class, and redaction summary.
  - Tombstone fixtures prove canonical records and legal-hold refs survive projection expiry.
  - Tombstone rendering is distinguishable from failed, blocked, and empty states.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Runtime Artifacts retention and tombstone fixtures
risk_class: retention_visibility_loss
reasoning_tier: standard
context_scope: artifact_retention_pin_tombstone
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: artifact_retention_pin_tombstone_surface
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (source-lineage-only)"
  - "user decision 2026-07-27"
  - "Plans/Runtime_Artifacts_Panel.md:166-190"
  - "Plans/Runtime_Artifacts_Panel.md:2048"
preserved_exact_tokens:
  - durable
  - session_bounded
  - ephemeral_view
  - storage_read_only
negative_constraints:
  - Do not let panel cleanup or expiry delete canonical records or clear legal-hold refs.
  - Do not render a tombstone as failed, blocked, or empty.
  - Do not enable pin-to-keep in viewer or blocked storage modes.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/storage-plan.md
```
