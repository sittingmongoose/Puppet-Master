# Shard 030: Ledger Compile Addendum - pldg-20260627-001-feature-intake

Source: `Plans/storage-plan.md`

Source lines: L15694-L15911

Source SHA256: `72d0e14753484f2b33e234a83e25ab7390c785bd9c146197b550409996450058`

---

## Ledger Compile Addendum - pldg-20260627-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260627-001-feature-intake` into Storage Plan owner canon. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### SP-221 - Inline Visualizer V2 State And Replay Storage

```yaml
plan_unit_id: SP-221
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Inline visualizer v2 persists source fragment, title/type/version, render config, approved bridge metadata,
  PM-managed state outputs, visible fallback or error state, and replay/re-render lineage scoped by project, thread,
  message, and visualizer artifact. Reload re-renders from source/config when practical; screenshot or snapshot
  fallback is stored only when re-render is impractical. PM-managed bridge state uses the namespace
  `visualizer_state.v1:{project_id}:{thread_id}:{message_id}:{visualizer_artifact_id}`, stores only
  JSON-serializable values under quota, records the bridge method and schema version that wrote the state, and exposes
  replay, export, and purge boundaries. Runtime heap, same-origin storage, raw parent localStorage, secrets, and
  diagnostic payload leaks are never persistence sources.
gui_related: false
gui_classification_reason: Defines durable visualizer record scope and replay storage behavior; visible rendering is owned by GUI and Assistant Chat.
depends_on: [ACD-427, CV-300]
unblocks: [RAP-037, ATS-015]
acceptance_criteria:
  - Visualizer records are scoped by project, thread, message, and visualizer artifact.
  - Reload can replay from persisted source/config/state or show the stored fallback/error state.
  - PM-managed visualizer state is namespaced, quota-bound, JSON-serializable, and reload/export/purge aware.
  - PM-managed state outputs are allowed; raw parent localStorage and runtime heap persistence are forbidden.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Inline visualizer reload and export storage fixtures
risk_class: inline_visualizer_replay_storage_gap
reasoning_tier: high
context_scope: inline_visualizer_v2_storage
implementation_surfaces:
  - Plans/storage-plan.md
  - future visualizer artifact records
node_compile_hint:
  mode: inline_visualizer_v2_storage_replay
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
  - "PM-managed state outputs"
  - "visualizer_state.v1:{project_id}:{thread_id}:{message_id}:{visualizer_artifact_id}"
  - "project/thread/message/visualizer artifact"
  - "screenshot/snapshot fallback"
  - "raw parent localStorage"
negative_constraints:
  - Do not persist runtime heap as visualizer state.
  - Do not read or write raw parent localStorage from the visualizer iframe.
  - Do not store secrets or unredacted diagnostic payloads in visualizer replay records.
owner_hints:
  - Plans/storage-plan.md
  - Plans/assistant-chat-design.md
  - Plans/Runtime_Artifacts_Panel.md
```

### SP-222 - Notification Settings Destinations Receipts And Sound Assets Storage

```yaml
plan_unit_id: SP-222
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Notification storage separates non-secret settings, destination definitions, sound mappings, sound asset manifests,
  uploaded/imported sound blobs, and delivery attempt receipts. Record keys include `notification_settings.v1:global`,
  project-scoped settings, `notification_destination.v1:{scope}:{destination_id}`,
  `notification_sound_mapping.v1:{scope}:{event_category}`, and `sound_asset_manifest.v1:{scope}:{sound_id}`.
  Destination records include provider_kind, scope, enabled state, display_name, event_category allowlist, quiet/focus
  policy, rate_limit_profile, idempotency profile, last_test_receipt_ref, and provider-specific profile payloads for
  Slack, Discord, generic webhook, ntfy, Pushover, and Telegram as defined by CV-298. Webhook and push tokens are stored
  only as OS credential references; receipts store redacted request and response digests, provider kind, destination id,
  event id, event category, status class, HTTP status, provider request/message id when available, retry count, next
  retry time, redaction profile, idempotency key, and secret refs only. Built-in sound manifests include sound_id,
  built_in/user_uploaded/imported source_kind, display_name, source_url_or_package_ref, license_ref, attribution,
  version, format, duration_ms, loudness_normalization, sha256, disabled/hidden state, and default event_category
  mappings.
gui_related: false
gui_classification_reason: Defines durable settings, credential references, sound assets, and delivery receipt records; GUI renders them elsewhere.
depends_on: [CV-298, PS-124]
unblocks: [F3-405, RAP-039, ATS-016]
acceptance_criteria:
  - Non-secret notification settings and sound manifests are durable and scope-aware.
  - Provider-specific destination profile payloads are persisted as credential refs and non-secret settings, not as raw tokens or URLs.
  - Built-in normal notification sounds carry source, license, attribution, version, duration, hash, and default event-category mapping metadata.
  - Webhook URLs, tokens, and push credentials are represented only by credential refs outside redb/plain settings.
  - Uploaded sound assets validate MIME/header/decode/path, cap at 5 MiB and 10 seconds decoded, warn above 3 seconds, normalize to PM-managed copies, trim silence, hash duplicates, soft-delete user assets, and never export secrets.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Notification settings and sound asset storage fixtures
risk_class: notification_storage_secret_leak
reasoning_tier: high
context_scope: notifications_sounds_storage
implementation_surfaces:
  - Plans/storage-plan.md
  - future notification settings records
  - future sound asset records
node_compile_hint:
  mode: notifications_sounds_storage
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:notify-destination-record-schema
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:notify-retry-rate-receipt-contract
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:notify-global-project-overrides
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:sound-catalog-default-mappings
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/notifications_sounds_readiness_matrix.json:sound-upload-asset-lifecycle
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0061
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0063
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0064
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0065
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0066
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0067
source_atom_ids: [atom-0061, atom-0063, atom-0064, atom-0065, atom-0066, atom-0067]
preserved_exact_tokens:
  - "notification_settings.v1:global"
  - "notification_destination.v1:{scope}:{destination_id}"
  - "notification_sound_mapping.v1:{scope}:{event_category}"
  - "sound_asset_manifest.v1:{scope}:{sound_id}"
  - "provider_kind"
  - "event_category"
  - "rate_limit_profile"
  - "idempotency"
  - "source_kind"
  - "license_ref"
  - "source_url_or_package_ref"
  - "WAV"
  - "MP3"
  - "OGG"
  - "5MiB"
  - "10s"
  - "warn >3s"
  - "soft-delete"
negative_constraints:
  - Do not store webhook URLs or provider tokens in non-secret settings.
  - Do not export secrets with sound packs or notification settings.
  - Do not hard-delete built-in sounds; built-ins may be hidden or disabled.
owner_hints:
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/Permissions_System.md
  - Plans/FinalGUISpec.md
```

### SP-223 - DRY Setting Receipt And Rules Provenance Storage

```yaml
plan_unit_id: SP-223
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  DRY Method storage preserves the application setting `app.agent_rules.dry_method_default_guard` as enabled or
  disabled_by_user with default enabled, plus run/turn receipts carrying `instruction_bundle_ref`,
  `rules_application_sha256`, `rules_project_sha256`, `dry_method_effective_state`, `dry_method_reason`, and
  `dry_method_source_refs`. Turning DRY off disables only the default DRY guard and DRY-specific caveat/block behavior;
  it does not delete receipt provenance or disable explicit instructions, safety, secrets, source authority,
  governance phase boundaries, permissions, or source-control hygiene.
gui_related: false
gui_classification_reason: Defines durable setting and provenance/receipt fields rather than visible presentation.
depends_on: [ARC-036, CV-299]
unblocks: [F3-406, ATS-018]
acceptance_criteria:
  - The stored enum is exactly enabled or disabled_by_user, with enabled as the default.
  - Run-start minimum fields include instruction_bundle_ref, rules_application_sha256, rules_project_sha256, dry_method_effective_state, and dry_method_reason.
  - DRY-off state remains auditable through receipts and does not weaken non-DRY authority boundaries.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - DRY setting and receipt persistence fixtures
risk_class: dry_method_provenance_storage_gap
reasoning_tier: high
context_scope: dry_method_storage
implementation_surfaces:
  - Plans/storage-plan.md
  - future run receipts
node_compile_hint:
  mode: dry_method_setting_receipt_storage
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_compile_readiness_matrix.json:dry-rules-provenance
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-default-001
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-default-002
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/dry_method_defaults_matrix.json:dry-val-002
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0073
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0075
  - Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0083
source_atom_ids: [atom-0073, atom-0075, atom-0083]
decision_refs: [dec-0016]
preserved_exact_tokens:
  - "app.agent_rules.dry_method_default_guard"
  - "enabled"
  - "disabled_by_user"
  - "instruction_bundle_ref"
  - "rules_application_sha256"
  - "rules_project_sha256"
  - "dry_method_effective_state"
  - "dry_method_reason"
  - "dry_method_source_refs"
negative_constraints:
  - Do not make disabling DRY delete receipts or provenance.
  - Do not treat disabled DRY as permission to bypass safety, secrets, source authority, governance, permissions, or source-control hygiene.
owner_hints:
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/agent-rules-context.md
```
