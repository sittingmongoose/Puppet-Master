# Shard 019: Post-Integration Bundled Dependency And Provider-Registration Addendum - 2026-09-01

Source: `Plans/Release_Supply_Chain.md`

Source lines: L1189-L1267

Source SHA256: `118be1d006503d8868bd2c1f8a80b1ca1c2c3f80417be9090296bb82770d777c`

---

## Post-Integration Bundled Dependency And Provider-Registration Addendum - 2026-09-01

The embedded `pm-tailnet-connector`, the version-pinned Backup engine, and any bounded Backup transport helper are PM release artifacts, not independently installed products. Release owns their acquisition and static admission references; Remote Access owns connector identity and lifecycle, while Backup owns capture, repository, transport-use, and restore semantics. The connector ships in the canonical PM release/image and has no vendor updater. Restic is the reference encrypted engine and rclone is permitted only as a bounded transport where the destination contract requires it; neither becomes a second product owner. Admission requires pinned source/dependency/license/SBOM/provenance/signing/hash/platform evidence plus compatibility with the exact PM protocol and state/schema migration boundaries. A missing build, platform, approval, or admission reference is `handler_unavailable`/blocked static truth, never proof that acquisition ran.

Google Drive and Microsoft OneDrive production OAuth registration, callback, provider approval, and confidential-client placement are release prerequisites. Distributed PM binaries and images may carry only public registration identifiers explicitly permitted for that client type; confidential app credentials remain on an approved broker or deployment secret owner. An unregistered, approval-pending, callback-missing, or evidence-missing profile cannot be advertised as a working sign-in handler. User-managed registered apps remain an Advanced configuration path under the authentication owner. These static contracts do not claim that artifacts were built, fetched, signed, scanned, installed, logged in, approved, or exercised at runtime.

### RSC-015 - Bundled Connector And Backup Artifact Admission

```yaml
plan_unit_id: RSC-015
unit_type: supply_chain_contract
status: accepted
owner_doc: Plans/Release_Supply_Chain.md
canonical_text: >-
  The PM release/image is the sole acquisition and update boundary for pm-tailnet-connector and version-pinned Backup engine/transport artifacts. Admission binds exact source, module/dependency graph, license, SBOM, provenance, signing, content hash, platform, PM protocol, and state/schema migration references; no artifact has an independent updater or acquires Remote Access or Backup semantic authority.
gui_related: true
gui_classification_reason: Settings, setup, Doctor, Updates, Backup, and Remote Access surface unavailable, incompatible, repair, and release-blocked states derived from this admission.
depends_on: [RSC-008, RSC-009, RSC-014, SIR-032]
unblocks: []
acceptance_criteria:
  - pm-tailnet-connector ships and rolls back only with the PM application/server/container generation, with pinned Go/tsnet/IPC versions and no full Tailscale package, independent installer, or updater.
  - BackupEngineAdapter/restic and bounded BackupTransportAdapter/rclone artifacts use the same governed PM tool/release lifecycle without acquiring coordinator, destination, retention, encryption-policy, or restore ownership.
  - Every admitted artifact binds source revision, dependency/module graph, license notices, SBOM, provenance, signature, SHA-256, build ID, target platform/architecture, compatible PM protocol, and applicable schema/state migration references.
  - Missing or incompatible admission input remains blocked or handler_unavailable; static admission never claims an artifact was built, downloaded, installed, started, verified, or exercised.
  - Connector identity/state is preserved or reauthenticated according to the Remote Access owner contract and is never packaged into a Project or treated as release-owned identity.
validation_surfaces: [Plans/release_update_contracts.schema.json, Plans/release_update_contract_fixtures.json, future signed-artifact and target-platform admission receipts]
risk_class: bundled_dependency_supply_chain_or_independent_updater_drift
reasoning_tier: high
context_scope: post_integration_bundled_connector_and_backup_artifacts
implementation_surfaces: [Plans/Release_Supply_Chain.md, Plans/release_update_contracts.schema.json, Plans/release_update_contract_fixtures.json]
node_compile_hint: {mode: static_release_admission_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/07_BACKUP_ARCHITECTURE_AND_CAPTURE.md:15-21
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/13_TSNET_INTEGRATION_AND_CROSS_DOMAIN_BOUNDARIES.md:7-45
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/tsnet/03_PLATFORM_PACKAGING_AND_LIFECYCLE.md:3-21
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/tsnet/07_SECURITY_BACKUP_UPDATE_BOUNDARIES.md:31-45
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_tsnet_reconciliation.md
preserved_exact_tokens: [pm-tailnet-connector, BackupEngineAdapter, restic, rclone, SBOM, provenance, handler_unavailable, Built into Puppet Master]
negative_constraints:
  - Do not add a full Tailscale package, vendor installer, sidecar/operator requirement, or independent connector updater.
  - Do not make restic or rclone a second Backup owner or synchronize live canonical Project storage.
  - Do not treat a manifest, pin, schema pass, or static fixture as runtime acquisition, verification, compatibility, identity preservation, or recovery evidence.
```

### RSC-016 - Backup OAuth Registration Release Gates

```yaml
plan_unit_id: RSC-016
unit_type: supply_chain_contract
status: accepted
owner_doc: Plans/Release_Supply_Chain.md
canonical_text: >-
  Production Google Drive and Microsoft OneDrive OAuth registrations, exact callbacks, provider approval, scope review, and confidential-client placement are release gates. Missing registration, approval, callback, or evidence keeps the destination sign-in handler unavailable; confidential application material is never embedded in distributed PM artifacts, and static rows never represent a successful provider login.
gui_related: true
gui_classification_reason: Backup destination setup and release readiness visibly distinguish available, approval-required, advanced user-managed, and handler-unavailable sign-in paths.
depends_on: [RSC-015, GAAAF-015, SIR-032]
unblocks: []
acceptance_criteria:
  - Google Drive and Microsoft OneDrive production registrations bind the exact supported redirect/callback, client type, scope profile, approval/verification state, and release evidence refs.
  - Browser-only/headless deployment is admitted only through a provider-supported registered web callback, approved device flow where actually supported, or a narrowly scoped approved broker; no generic Google OOB/device-flow assumption is made.
  - Confidential app credentials remain on the approved broker or deployment-secret owner and are absent from distributed binaries, images, fixtures, logs, receipts, and ordinary settings.
  - Unregistered, approval_pending, callback_missing, or evidence_missing rows expose handler_unavailable/blocked static state and cannot start protected handoff.
  - Provider registration fixtures remain NOT_RUN for real login, refresh, approval, callback, broker, and secret-isolation evidence until implementation proves those surfaces.
validation_surfaces: [Plans/release_update_contracts.schema.json, Plans/release_update_contract_fixtures.json, Plans/protected_auth_browser_contracts.schema.json, future provider-registration and callback evidence]
risk_class: fabricated_oauth_readiness_or_distributed_confidential_client_secret
reasoning_tier: high
context_scope: post_integration_backup_oauth_release_gate
implementation_surfaces: [Plans/Release_Supply_Chain.md, Plans/release_update_contracts.schema.json, Plans/release_update_contract_fixtures.json]
node_compile_hint: {mode: static_oauth_registration_gate_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/08_CLOUD_DESTINATIONS_AND_SIGN_IN.md:31-61
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/17_INTEGRATION_SEQUENCE_AND_EVIDENCE.md:23-29
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_backup_reconciliation.md
preserved_exact_tokens: [Google Drive, Microsoft OneDrive, handler_unavailable, approval_pending, confidential app credentials, NOT_RUN]
negative_constraints:
  - Do not publish fake working client IDs, assume unsupported device/OOB flow, or treat user-managed registration as the ordinary path.
  - Do not embed confidential application credentials in distributed binaries or images.
  - Do not claim provider approval, callback operation, token exchange, refresh, or login from static release fixtures.
```
