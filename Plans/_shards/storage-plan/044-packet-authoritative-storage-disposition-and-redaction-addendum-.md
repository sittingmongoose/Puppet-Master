# Shard 044: Packet-Authoritative Storage Disposition And Redaction Addendum - 2026-08-31

Source: `Plans/storage-plan.md`

Source lines: L18374-L18598

Source SHA256: `c0d0f887c5dec45535091dc8cb54ac655874a783a962dc42a9e16326923a9738`

---

## Packet-Authoritative Storage Disposition And Redaction Addendum - 2026-08-31

This addendum owns the physical-persistence disposition for the Settings, Project, Named Plan, Product
Onboarding, Guided Tour, Doctor, Server, Remote Access, Backup/Restore, Source Control, Forge, Browser Program,
Test Capture, Full Thread, and Plugins contracts added by the 2026-08-31 packet-authoritative owner wave. The
semantic record shapes remain with their named domain owners. `Plans/storage_value_registry.json` now carries a
separate `contract_family_dispositions` layer because the existing 84-row `families` denominator is enforced by
the Tier 0C-2 readiness validator and cannot be silently widened or reinterpreted. A disposition row proves a
machine-readable decision about durable versus nonpersisted state; it does not prove a physical redb/seglog or
artifact implementation. `physical_family_registration_pending` and
`external_artifact_store_registration_pending` are blockers, not aliases for materialized storage.

No row in this addendum registers an EventRecord family. Every new effect remains
`receipt_only_no_eventrecord_pending_event_authority` until Event Authority admits an exact producer/payload row.
The current EventRecord denominator remains `UNKNOWN_OPEN`; bulk event registration is forbidden. No static
schema, receipt shape, registry row, migration prose, or validator pass is runtime, recovery, WAN, native Slint,
performance, certification, PNC-019, or readiness evidence.

### SP-251 - Contract-Family Persistence Disposition Layer

```yaml
plan_unit_id: SP-251
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  `Plans/storage_value_registry.json#/contract_family_dispositions` is the machine authority that classifies
  each packet-authoritative contract group as durable, durable metadata with externally held bytes, durable
  with an existing-family migration requirement, ephemeral nonpersisted, request/preview nonpersisted, or
  compatibility-input-only nonpersisted. Every row names the semantic owner/schema, exact record kinds,
  physical-family state, existing family refs, retention mode/refs/holds/expiry, registered redaction
  transforms, migration rule, Event Authority boundary, AuthBrowserSession disposition, source refs, and
  `runtime_evidence=false`. A durable disposition whose physical state is pending cannot be written, restored,
  advertised as materialized, or used to enable a dependent command. Guided Tour session/action state, typed
  request/preview/route transport, Source Control credential leases, Browser compile/query transport, Test
  Capture playback comparison state, and protected AuthBrowserSession content/state are explicitly
  nonpersisted. The existing 84 physical rows and 24 retention policies remain unchanged in membership.
gui_related: false
gui_classification_reason: This PlanUnit governs storage and contract custody rather than presentation.
depends_on: [SP-222, SSYS-001, PWIZ-021, PWIZ-023, N2-151]
unblocks: []
acceptance_criteria:
  - Every disposition ID is unique and schema-valid, and every row fixes runtime_evidence=false.
  - Durable rows that lack exact physical key/value registration remain physical_family_registration_pending or external_artifact_store_registration_pending rather than materialized.
  - Nonpersisted action, preview, lease, Guided Tour, playback, and protected-auth rows have no physical family and no retention authority.
  - Full Thread rows reference existing shared-runtime families only as explicit migration inputs and never reinterpret their schema IDs in place.
  - Browser and Test Capture legacy aggregate IDs are compatibility inputs only; one exact schema_id plus record_kind must be established before any durable admission.
  - No disposition adds an EventRecord family or treats a receipt/projection as event admission.
validation_surfaces:
  - Draft 2020-12 validation of Plans/storage_value_registry.json against Plans/storage_value_registry.schema.json
  - python3 scripts/pm-implementation-readiness.py validate-case-l
  - python3 scripts/pm-shared-runtime-storage-materialize.py check
risk_class: durable_contract_claim_without_physical_family_or_nonpersisted_boundary
reasoning_tier: high
context_scope: packet_authoritative_storage_dispositions
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - Plans/storage_value_registry.schema.json
node_compile_hint:
  mode: packet_authoritative_storage_dispositions
  create_worknodes: false
  create_nodeseeds: false
source_lineage: [source_manifest:Plans/storage_value_registry.json#/contract_family_dispositions/*/source_refs, source_ref:packet:PKT-04/03_REQUIREMENTS_COVERAGE_MATRIX.md:5-184, source_ref:packet:PKT-04/04_COMMAND_EVENT_WIRING_REGISTER.md:1-457]
negative_constraints:
  - Do not treat a disposition row as a running storage handler, migration, replay, restore, backup, or recovery implementation.
  - Do not add physical families by silently changing the enforced 84-row denominator.
  - Do not persist request/preview transport, Guided Tour session state, credential leases, playback UI state, or AuthBrowserSession content/state.
  - Do not register any packet candidate as an EventRecord from this storage lane.
owner_hints:
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
```

### SP-252 - Product Onboarding Nine-Stage Storage Migration

```yaml
plan_unit_id: SP-252
unit_type: migration_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Registry family `onboarding_state` now binds canonical key
  `onboarding_state.v2:{onboarding_session_id}` to `pm.product_onboarding.session.v1` and the owner schema
  `Plans/product_onboarding_contracts.schema.json#/$defs/onboarding_session`. The former
  `onboarding_state.v1:{project_id}` and `onboarding:v1` keys are read-once compatibility inputs only.
  Current values persist the exact nine-stage guided-setup path `welcome | simple_path | first_project |
  source_control_setup | server_storage_client | remote_access_setup | review_setup_plan |
  automatic_preparation | ready` or the exact six-stage connect-existing shortcut `welcome | simple_path |
  remote_access_setup | review_setup_plan | automatic_preparation | ready`. `path_kind` is the path discriminator;
  `simple_path_selection` is the current visible setup-mode choice and MUST agree with it. The session persists
  `queued_setup_plan_ref`, `queued_setup_plan_revision`, `reviewed_setup_plan_revision`, `review_confirmation`,
  `approved_setup_plan_sha256`, and `automatic_preparation_currentness_ref` so no owner work can begin before a
  person confirms the current Review revision and Automatic Preparation can resume only against the same current
  plan. StorageMigrationCoordinator maps admissible provider-first/four-screen, predecessor-five-stage, and
  superseded seven-stage records once to the first applicable unresolved current stage, forces an unconfirmed
  `review_setup_plan`, preserves compatible decisions, valid receipt refs, and bounded warnings, never replays owner
  work, and rejects or quarantines ambiguous, corrupt, stale, or secret-bearing rows. It emits the sole terminal
  durable `pm.storage_value.migration_receipt.v1`; the typed
  `pm.product_onboarding.legacy_migration_receipt.v1` is a domain reconciliation record that references that
  Storage receipt, proves exact source/accepted/stale/dropped/quarantined counts, `mapped_stage_counts`, and
  `mapped_path_counts` plus a hashed disposition manifest, and is not peer commit authority. New writes use only
  v2 session identity. Guided
  Tour session, scene, action, Teacher, focus, motion, and checkpoint state remains ephemeral and is never stored in
  this family; only a stable non-secret handoff ref may be retained.
gui_related: true
gui_classification_reason: The migrated stage/session determines the simple Product Onboarding screen and safe resume point shown to the user.
depends_on: [SP-251, PWIZ-021, PWIZ-022]
unblocks: []
acceptance_criteria:
  - The materialized onboarding_state family schema ID, key, required fields, owner, producer, and consumers match the nine-stage Product Onboarding owner contract and exact six-stage connect-existing shortcut.
  - Both legacy key shapes are read-only coordinator copy-forward inputs and never continuing dual-read or write authorities.
  - Missing current state starts at welcome; a completed session requires stage=ready.
  - "`simple_path` and `ui.onboarding.choose_simple_path` are current behavior; `path_kind = guided_setup | connect_existing | null` is the persisted path discriminator and `simple_path_selection = start_on_this_computer | connect_existing_server | setup_server | restore_backup | null` is the distinct current setup-mode choice. Null is admitted only before a choice at `welcome` or `simple_path`; `connect_existing` requires `connect_existing_server`, and every other non-null setup-mode choice requires `guided_setup`."
  - "`scm_backend_selection = git | jujutsu | null` records the independent local Safe History backend, while `forge_provider_selection = github | gitlab | azure_devops | bitbucket_cloud | bitbucket_data_center | forgejo | gitea | cursor_origin | none | null` independently records the optional online-copy provider; migration never derives either axis from the other or invents a Jujutsu service account."
  - "Before person confirmation, reviewed_setup_plan_revision, approved_setup_plan_sha256, and automatic_preparation_currentness_ref are null and review_confirmation=unconfirmed; confirmation binds queued_setup_plan_revision to reviewed_setup_plan_revision and its approved SHA-256, and automatic_preparation/ready additionally require the currentness ref."
  - Persisted setup-plan and continuation data is limited to stable identities, revisions, enums, SHA-256 values, and non-secret refs/handles; it contains no plan body, transcript, credential, authentication content, or broad local path.
  - Migration covers provider-first/four-screen, predecessor-five-stage, and superseded seven-stage `server_setup` records, maps each admissible row to the first unresolved current stage, forces unconfirmed Review, reports exact per-stage and per-path counts, quarantines secrets, and never runs or replays installation, authentication, repository creation/publication, restore, Project, provider, Server, remote-access, or source-control work.
  - The domain migration receipt references the sole Storage migration receipt and never substitutes for it.
  - Raw transcripts, API keys, tokens, auth URLs/codes, credentials, profile roots, broad paths, and AuthBrowserSession content/state fail storage admission.
  - Guided Tour session, scene, action, Teacher, focus, motion, and checkpoint state is ephemeral and absent from onboarding_state; only a stable non-secret handoff ref is admissible.
validation_surfaces:
  - Draft 2020-12 validation of Plans/product_onboarding_contracts.schema.json
  - Draft 2020-12 validation of the onboarding_state inline registry value schema
  - python3 scripts/pm-implementation-readiness.py validate-case-l
  - future migration positive/quarantine/restart/rollback fixtures and raw receipts
risk_class: stale_onboarding_path_or_unconfirmed_owner_work_replayed
reasoning_tier: high
context_scope: onboarding_nine_stage_storage_migration
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
  - Plans/product_onboarding_contracts.schema.json
node_compile_hint:
  mode: onboarding_nine_stage_storage_migration
  create_worknodes: false
  create_nodeseeds: false
preserved_exact_tokens:
  - onboarding_state.v2:{onboarding_session_id}
  - onboarding_state.v1:{project_id}
  - onboarding:v1
  - pm.product_onboarding.session.v1
  - pm.product_onboarding.legacy_migration_receipt.v1
  - pm.storage_value.migration_receipt.v1
  - path_kind
  - queued_setup_plan_ref
  - queued_setup_plan_revision
  - reviewed_setup_plan_revision
  - review_confirmation
  - approved_setup_plan_sha256
  - automatic_preparation_currentness_ref
  - mapped_stage_counts
  - mapped_path_counts
source_lineage: [source_ref:Plans/Planning_Wizard.md#PWIZ-021, source_ref:Plans/Planning_Wizard.md#PWIZ-022, source_ref:Plans/product_onboarding_contracts.schema.json, source_report:register-settings-onboarding.md#1E, source_report:register-fullthread.md#R-063, source_report:wave3-lane2.md#S0098]
negative_constraints:
  - Do not silently reinterpret a provider-first, predecessor-five-stage, or superseded seven-stage row as a current nine-stage record.
  - Do not treat current `simple_path` or `simple_path_selection` as compatibility-only, permit `path_kind` disagreement, or collapse local Safe History and optional online-copy selections into one provider field.
  - Do not dispatch or resume external owner work from an unconfirmed, stale, hash-mismatched, revision-mismatched, or currentness-mismatched setup plan.
  - Do not rerun owner mutations during migration.
  - Do not persist Guided Tour session, scene, action, Teacher, focus, motion, or checkpoint state as part of Product Onboarding.
  - Do not treat static schema validation as executed migration or restart proof.
owner_hints:
  - Plans/storage-plan.md
  - Plans/Planning_Wizard.md
```

### SP-253 - Registered Redaction Contracts And Protected-Auth Exclusion

```yaml
plan_unit_id: SP-253
unit_type: security_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  `Plans/redaction_transform_registry.json` and its schema are the single machine registry for versioned
  redaction/admission transforms used by the packet-authoritative storage dispositions. Transform contracts
  define scope, input class, bounded output, prohibited inputs, quarantine behavior, retention effect,
  AuthBrowserSession posture, source refs, and `implementation_status=contract_only_no_runtime_evidence`.
  They do not claim executable transform code. `rt.capture_retained_media.v1` distinguishes source/encoder
  masking from display-only masking; display-only masking never qualifies retained bytes as redacted.
  `rt.auth_browser_session_exclusion.v1` is a hard exclusion, not a sanitizing path: AuthBrowserSession is
  human-only, ephemeral, non-recordable, non-inspectable, unavailable to agents/adapters/plugins/MCP/Doctor/
  capture/backup, and produces no ordinary stored value, artifact, screenshot, representation, automation
  result, profile, reusable session identity, or backup content. Only the separately owned bounded redacted
  denial/lifecycle projection may exist.
gui_related: false
gui_classification_reason: This PlanUnit governs storage admission and protected-session security rather than GUI paint or layout.
depends_on: [SP-251, SMPFS-143]
unblocks: []
acceptance_criteria:
  - Every redaction transform ID and version is unique and schema-valid.
  - Every packet-authoritative storage disposition references one or more registered transforms.
  - Every transform declares contract_only_no_runtime_evidence until an executable implementation and tests exist.
  - Backup rejects ordinary secret bytes, recovery credentials, raw callback/session content, absolute source paths, live browser/process/PTY state, and reconstructable cache payloads.
  - Doctor stores bounded normalized/redacted evidence and refs only; migrated cache never becomes fresh execution evidence.
  - Source Control and Forge never persist private keys, raw tokens/passwords/cookies, agent sockets, webhook signatures/bodies, credential-bearing environment values, or unredacted CLI output.
  - Capture retained bytes require source or encoder masking; display-only masking is insufficient.
  - AuthBrowserSession matches the hard exclusion and yields no ordinary persistence, capture, restore, export, or backup path.
validation_surfaces:
  - Draft 2020-12 validation of Plans/redaction_transform_registry.json against Plans/redaction_transform_registry.schema.json
  - cross-reference check from every contract_family_dispositions row to one registered transform ID
  - future executable transform, negative secret-corpus, quarantine, retained-media, and protected-auth tests
risk_class: unregistered_redaction_transform_or_protected_auth_persistence
reasoning_tier: high
context_scope: packet_authoritative_redaction_and_auth_browser_exclusion
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/redaction_transform_registry.json
  - Plans/redaction_transform_registry.schema.json
  - Plans/storage_value_registry.json
node_compile_hint:
  mode: packet_authoritative_redaction_and_auth_browser_exclusion
  create_worknodes: false
  create_nodeseeds: false
source_lineage: [source_report:scratchpad/pm-integration-20260831/audits/schema-registry-integration.md:40, source_ref:egolite-requirement:BRW-013, source_ref:egolite-requirement:CAP-008, source_ref:egolite-requirement:CAP-013, source_ref:egolite-requirement:SEC-002, source_ref:egolite-requirement:SEC-003, source_ref:egolite-requirement:SEC-005, source_ref:packet:PKT-04/08_AUTHORITY_AND_SUPERSESSION.md:24-48, source_ref:packet:PKT-04/08_AUTHORITY_AND_SUPERSESSION.md:97]
negative_constraints:
  - Do not claim the registry is executable redaction proof.
  - Do not use display-only masking as retained-media redaction.
  - Do not sanitize AuthBrowserSession into ordinary storage; reject the entire protected subject.
  - Do not register EventRecord types from redaction or receipt metadata.
owner_hints:
  - Plans/storage-plan.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/Test_Capture_and_Motion_Evidence.md
```
