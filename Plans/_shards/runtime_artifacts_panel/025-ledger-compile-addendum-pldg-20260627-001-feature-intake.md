# Shard 025: Ledger Compile Addendum - pldg-20260627-001-feature-intake

Source: `Plans/Runtime_Artifacts_Panel.md`

Source lines: L1425-L1616

Source SHA256: `66bf820da0ae10afb746ab56ec9aef68ec4b6ac29197f804a6c6daf14049c3d5`

---

## Ledger Compile Addendum - pldg-20260627-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260627-001-feature-intake` into Runtime Artifacts owner canon. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### RAP-037 - Inline Visualizer Artifact Projection And Export Routing

```yaml
plan_unit_id: RAP-037
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Inline visualizer v2 artifacts appear in runtime artifact projections with source fragment identity, title/type/version,
  render config, approved bridge metadata, current fallback or error state, replay/re-render status, export availability,
  and snapshot fallback provenance when re-render is impractical. The projection does not expose raw iframe heap,
  same-origin storage, secrets, unredacted diagnostics, or parent DOM/localStorage access.
gui_related: true
gui_classification_reason: Runtime artifact rows/projections and export availability are visible UI.
depends_on: [ACD-427, CV-300, SP-221, PS-123]
unblocks: [ATS-015]
acceptance_criteria:
  - Visualizer artifacts can be inspected and exported without exposing private iframe or parent state.
  - Replay status distinguishes re-rendered source/config from snapshot fallback.
  - Degraded or failed visualizers keep visible fallback/error provenance.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Inline visualizer artifact projection fixtures
risk_class: inline_visualizer_artifact_projection_gap
reasoning_tier: high
context_scope: inline_visualizer_v2_runtime_projection
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
  - future runtime artifact rows
node_compile_hint:
  mode: inline_visualizer_v2_artifact_projection
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/inline_visualizer_v2_readiness_matrix.json:iv2-persistence-reload-security
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0060
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0088
source_atom_ids: [atom-0060, atom-0088]
preserved_exact_tokens:
  - "source fragment"
  - "title/type/version"
  - "render config"
  - "approved bridge metadata"
  - "snapshot fallback"
  - "raw parent localStorage"
negative_constraints:
  - Do not expose raw iframe heap or parent DOM/localStorage state in artifact projections.
  - Do not hide degraded or failed visualizer provenance inside opaque logs only.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/storage-plan.md
  - Plans/assistant-chat-design.md
```

### RAP-038 - DRY Method Receipt And Disclosure Projection

```yaml
plan_unit_id: RAP-038
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Runtime artifacts and run detail projections expose DRY Method receipt state when it materially affects a turn,
  including `dry_method_effective_state`, `dry_method_reason`, `dry_method_source_refs`, `instruction_bundle_ref`,
  `rules_application_sha256`, and `rules_project_sha256`. Projection labels distinguish applied, not_material,
  degraded_rules_missing, degraded_rules_stale, disabled_by_user, blocked_owner_unresolved, and
  caveated_owner_unresolved without flooding routine turns.
gui_related: true
gui_classification_reason: Run detail projection labels and receipt inspection are user-visible UI.
depends_on: [ACD-429, CV-299, SP-223]
unblocks: [ATS-018]
acceptance_criteria:
  - DRY receipt fields are inspectable when DRY affects trust, mutation, or routing.
  - Routine not_material state can stay in detail/provenance rather than chat message text.
  - Missing/stale rules and unresolved owner/source route states are visibly distinct.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - DRY receipt projection fixtures
risk_class: dry_method_projection_gap
reasoning_tier: high
context_scope: dry_method_runtime_projection
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
  - future run detail projections
node_compile_hint:
  mode: dry_method_receipt_projection
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-rules-provenance
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-chat-what-why
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0074
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0075
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0089
source_atom_ids: [atom-0074, atom-0075, atom-0089]
preserved_exact_tokens:
  - "dry_method_effective_state"
  - "dry_method_reason"
  - "dry_method_source_refs"
  - "instruction_bundle_ref"
  - "rules_application_sha256"
  - "rules_project_sha256"
  - "degraded_rules_missing"
  - "degraded_rules_stale"
  - "disabled_by_user"
  - "blocked_owner_unresolved"
  - "caveated_owner_unresolved"
negative_constraints:
  - Do not hide trust-affecting missing/stale DRY state in logs only.
  - Do not flood routine turns when DRY has no material effect.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```

### RAP-039 - Notification Delivery Receipt Projection And Export Routing

```yaml
plan_unit_id: RAP-039
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: >-
  Runtime Artifacts projects NotificationDeliveryAttemptReceipt and notification/sound test-send/export evidence without
  becoming the delivery, storage, permission, or alert-state owner. Notification delivery receipt artifacts preserve
  delivery_attempt_id, source_event_ref, destination id, provider kind, event category, status class, HTTP status,
  provider request/message id when available, retry count, next retry time, redaction profile, request digest, response
  digest, idempotency key, and secret refs only. The projection exposes inspect, Show in Ledger, Show source event, and
  export routes through canonical receipt/source refs, marks mock versus live test-send evidence, and redacts raw
  secrets, webhook URLs, tokens, private paths, screenshots, raw diff bodies, full prompts, full logs, and unredacted
  identities from rows, previews, exports, and screenshots.
gui_related: true
gui_classification_reason: Runtime artifact rows, receipt inspection, export availability, and test-send evidence projection are user-visible UI.
depends_on: [CV-298, SP-222, PS-124]
unblocks: [ATS-016]
acceptance_criteria:
  - Notification delivery receipts are inspectable and exportable through Runtime Artifacts without replacing contract, storage, or permission authority.
  - Test-send evidence distinguishes mock delivery, live delivery, provider error, retry, and permanent failure states.
  - Exported receipt bundles preserve canonical receipt/source refs and disclose redactions or omitted evidence.
  - Secret material, webhook URLs, tokens, private paths, screenshots, raw diff bodies, full prompts, full logs, and unredacted identities never appear in rows, previews, exports, or screenshots.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Notification delivery receipt Runtime Artifacts projection fixtures
risk_class: notification_receipt_projection_gap
reasoning_tier: high
context_scope: notifications_sounds_receipt_projection
implementation_surfaces:
  - Plans/Runtime_Artifacts_Panel.md
  - future Runtime Artifacts notification receipt rows
node_compile_hint:
  mode: notification_delivery_receipt_projection
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:notify-destination-record-schema
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:notify-payload-redaction-trust-copy
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:notify-retry-rate-receipt-contract
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:preview-test-send-accessibility
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0061
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0062
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0063
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0069
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0091
source_atom_ids: [atom-0061, atom-0062, atom-0063, atom-0069, atom-0091]
preserved_exact_tokens:
  - "NotificationDeliveryAttemptReceipt"
  - "delivery_attempt_id"
  - "source_event_ref"
  - "HTTP status"
  - "provider request/message id"
  - "retry count"
  - "redaction profile"
  - "request digest"
  - "response digest"
  - "secret refs only"
  - "test-send"
  - "export"
negative_constraints:
  - Do not make Runtime Artifacts Panel the owner of notification delivery, storage, credential custody, or alert-state truth.
  - Do not expose raw secrets, webhook URLs, tokens, private paths, screenshots, raw diff bodies, full prompts, full logs, or unredacted identities.
  - Do not represent mock delivery as live provider success.
owner_hints:
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
```
