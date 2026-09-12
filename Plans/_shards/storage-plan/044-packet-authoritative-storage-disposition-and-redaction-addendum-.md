# Shard 044: Packet-Authoritative Storage Disposition And Redaction Addendum - 2026-08-31

Source: `Plans/storage-plan.md`

Source lines: L18498-L18744

Source SHA256: `71a2cfe2d19dcd08d42d316b467fd788cf31b1fa9ac2267143b815f6bfa0e61e`

---

## Packet-Authoritative Storage Disposition And Redaction Addendum - 2026-08-31

This addendum owns the physical-persistence disposition for the Settings, Project, Named Plan, Product
Onboarding, Guided Tour, Doctor, Server, Remote Access, Backup/Restore, Source Control, Forge, Browser Program,
Test Capture, Full Thread, and Plugins contracts added by the 2026-08-31 packet-authoritative owner wave. The
semantic record shapes remain with their named domain owners. `Plans/storage_value_registry.json` now carries a
separate `contract_family_dispositions` layer because the physical `families` denominator is enforced by
the Tier 0C-2 readiness validator and cannot be silently widened or reinterpreted. The historical 84-family packet
baseline is now 88 under the separately admitted Working Notebook wave; this Guided Tour disposition adds none. A disposition row proves a
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
  advertised as materialized, or used to enable a dependent command. Guided Tour live session/action state, typed
  request/preview/route transport, Source Control credential leases, Browser compile/query transport, Test
  Capture playback comparison state, and protected AuthBrowserSession content/state are explicitly
  nonpersisted. PWIZ-023's bounded safe checkpoint is a separate durable disposition with physical-family registration
  pending, not a serialized live session or an onboarding_state extension. Its original layout/Chat snapshots remain
  owner-held references; a schema or disposition alone permits no checkpoint write or resume claim. The current physical
  family census and 24 retention policies remain unchanged in membership by this disposition layer.
gui_related: false
gui_classification_reason: This PlanUnit governs storage and contract custody rather than presentation.
depends_on: [SP-222, SSYS-001, PWIZ-021, PWIZ-023, N2-151]
unblocks: []
acceptance_criteria:
  - Every disposition ID is unique and schema-valid, and every row fixes runtime_evidence=false.
  - Durable rows that lack exact physical key/value registration remain physical_family_registration_pending or external_artifact_store_registration_pending rather than materialized.
  - Nonpersisted action, preview, lease, Guided Tour live-session/transport, playback, and protected-auth rows have no physical family and no retention authority.
  - The Guided Tour v3 bounded checkpoint has a separate physical_family_registration_pending disposition; exact key/value, retention/redaction, owner snapshot custody, migration, adapter, and recovery evidence are required before durable writes or resume can be claimed. No physical family is added and onboarding_state accepts only a non-secret handoff ref.
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
  - Do not add physical families by silently changing the readiness validator's enforced denominator; the current 88-row census includes the separately admitted Notebook wave, not a Guided Tour checkpoint store.
  - Do not persist request/preview transport, Guided Tour live session state, credential leases, playback UI state, or AuthBrowserSession content/state; do not treat the pending bounded checkpoint disposition as storage admission.
  - Do not register any packet candidate as an EventRecord from this storage lane.
owner_hints:
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
```

### SP-252 - Product Onboarding Draft-First Storage Migration

```yaml
plan_unit_id: SP-252
unit_type: migration_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The existing onboarding_state family uses onboarding_state.v3:{onboarding_session_id} for pm.product_onboarding.session.v2,
  with the exact closed owner schema deterministically bundled by scripts/pm-onboarding-contracts.py. The session
  stores the bounded typed setup_draft choices once, plus exact draft/queued/reviewed refs, revisions and canonical
  hash, current dependency-path state, actual Project commit binding, provider/free-model progress, owner refs and
  continuation. Return contexts/snapshots keep refs rather than duplicate draft bodies. Eleven-stage/deferred-Project/six-stage
  paths consume the Onboarding owner, and no Project or broad provider effect is inferred from draft persistence.
  v2 session-key/v1 values and older Project/global keys are coordinator-only migration inputs. Unresolved drafts
  are unconfirmed; already committed rows resume provider setup only after exact owner-result/receipt validation.
  Migration emits the sole durable Storage migration receipt, reports exact disposition/stage/path/committed-resume
  counts with a hashed per-row manifest, and never replays owner work. Domain reconciliation remains separately
  pending physical admission. No physical family, retention policy, native store, readiness or recovery certification
  is added.
gui_related: true
gui_classification_reason: The migrated stage/session determines the simple Product Onboarding screen and safe resume
  point shown to the user.
depends_on:
- SP-251
- PWIZ-021
- PWIZ-022
unblocks: []
acceptance_criteria:
- The exact owner v2 session schema and required/nullable fields are deterministically bundled into the existing
  onboarding_state family; the registry contains the same 88 families and 24 retention policies.
- New writes use only onboarding_state.v3:{onboarding_session_id}; onboarding_state.v2:{onboarding_session_id},
  onboarding_state.v1:{project_id} and onboarding:v1 are read-once coordinator copy-forward inputs, never dual-read
  or current writes.
- Missing state begins at welcome. A current queued draft has the closed bounded setup_draft choices with matching
  draft identity/revision; the confirmed plan hash matches its canonical bytes.
- A typed setup_draft is not an arbitrary plan/transcript body or a new physical family. Return contexts and continuation
  snapshots preserve only the exact references and phases.
- Bounded selected-source preflight/auth has its own current permission/consent/Client/revision fence and does not
  authorize Project/destination/history/repository/Settings/sync or broad provider mutation.
- Actual committed Project identity, listed/persisted owner result and receipt refs survive Close/resume and provider
  failure; navigation never uncreates or recommits the Project.
- The eleven-stage semantic graph, explicit Project-deferred path and six-stage connect-existing shortcut remain
  owner-defined; backend/forge/Server/Storage/Client axes are not conflated.
- Migration covers four/five/seven/nine-stage inputs, forces unresolved draft review unconfirmed, and separately
  validates every committed resume in the disposition manifest without synthesizing review or owner work.
- The domain reconciliation value references the sole terminal Storage migration receipt and remains physical-family-registration-pending,
  never peer commit authority.
- Redaction admits only bounded typed selections and non-secret owner refs; raw credentials/auth URLs/codes/profile
  roots, unbounded path discovery, protected browser content, raw plan/transcript and Guided Tour live/checkpoint
  content are excluded.
- Standalone precommit authorizations, draft previews/rebinds and Project commit bindings are transport/read models;
  actual underlying owner result/receipt authority remains separate and no new physical family is admitted.
validation_surfaces:
- python3 scripts/pm-onboarding-contracts.py --check
- tests/test_pm_onboarding_phases.py
- python3 scripts/pm-implementation-readiness.py validate-case-l
- future native durable save/reload/migration/quarantine/rollback receipts; not_run
risk_class: stale_onboarding_path_or_unconfirmed_owner_work_replayed
reasoning_tier: high
context_scope: onboarding_draft_first_storage_migration
implementation_surfaces:
- Plans/storage-plan.md
- Plans/storage_value_registry.json
- Plans/product_onboarding_contracts.schema.json
node_compile_hint:
  mode: onboarding_draft_first_storage_migration
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
- onboarding_state.v3:{onboarding_session_id}
- pm.product_onboarding.session.v2
- pm.product_onboarding.legacy_migration_receipt.v2
- setup_draft
- project_commit_binding
- committed_resume_count
source_lineage:
- source_ref:Plans/Planning_Wizard.md#PWIZ-021
- source_ref:Plans/Planning_Wizard.md#PWIZ-022
- source_ref:Plans/product_onboarding_contracts.schema.json
- source_report:register-settings-onboarding.md#1E
- source_report:register-fullthread.md#R-063
- source_report:wave3-lane2.md#S0098
- source_packet:PM_Onboarding_Tour_Newbie_First_Addendum_2026-09-03/02_PROJECT_DRAFT_COPY_AND_COMMIT.md
negative_constraints:
- Do not silently reinterpret v1 or four/five/seven/nine-stage predecessor values as current v2 writes.
- Do not infer review, committed Project, provider readiness or effect replay from persisted UI state.
- Do not fabricate owner receipts or treat the bundle as native persistence/migration proof.
- Do not create a new physical family/retention policy or hide Tour checkpoints, protected contents or arbitrary
  raw plans inside onboarding_state.
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
