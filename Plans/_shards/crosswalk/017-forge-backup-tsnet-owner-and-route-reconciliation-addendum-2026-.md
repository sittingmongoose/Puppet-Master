# Shard 017: Forge/Backup/tsnet Owner And Route Reconciliation Addendum - 2026-09-01

Source: `Plans/Crosswalk.md`

Source lines: L3426-L3509

Source SHA256: `9ec60383b4d1dbbf8296abf0656249a24639590f6a26edd22c6600871284974c`

---

## Forge/Backup/tsnet Owner And Route Reconciliation Addendum - 2026-09-01

The following AUTH preservation matrix is part of the accepted `C-052` boundary. It is a lossless owner/evidence route, not an umbrella implementation claim:

| Packet row | Preserved substance and semantic owners | Current evidence boundary |
|---|---|---|
| `AUTH-001` | Packet decisions govern affected scope; newer live canon governs untouched behavior; preserved tsnet detail and older sources remain lineage. `Contracts_V0` and Crosswalk select current owners and require an actual baseline revision, protected dirty-tree receipt, owner/action/route map, and hash/evidence for reused or reopened closure. | Owner selection and lineage are static; the actual baseline revision, dirty-tree receipt, accepted execution plan, and diff/release proof remain partial and must come from the later execution transaction. |
| `AUTH-002` | `Server_System`, `storage-plan`, `Project_System`, and Project Sync preserve seglog/redb/Tantivy/CAS, absolute no-SQLite, small Server Catalog plus physical Project Vaults, one Home Server/writer, distinct Home Server/Execution Host/Source Location/environment/Client/Move, and typed permissioned cross-Project operations. Backup is recovery, never writable replica, multi-master sync, public-plane storage, or canonical remote state. | Static owner/schema references only; no storage migration, writer-fence, backup barrier, or runtime restore evidence. |
| `AUTH-003` | Platform/deployment/release owners retain full native Windows/macOS/Linux and standalone Server execution; Docker Hub is wrapped by TrueNAS Apps and Unraid Community Applications; Kubernetes stays a deployment target; TrueNAS modular Compose and Unraid XML obligations remain; WSL2 is optional/non-degrading; Apple Linux and native/virtualized/compatibility/cross-target proof remain truthful. Origin CLI availability cannot make Windows WSL mandatory. | Package/platform requirements are preserved; supported-version, artifact, native execution, package-install, and release evidence remain partial. |
| `AUTH-004` | `Project_System`, Settings, Project Sync/Backbone, Shared Runtime, and Backup retain concrete independent Project settings, roughly ten selectable copy categories, same-Server profile references, optional preview, pre-copy recovery, atomic apply/rollback, distinct template/configuration/history duplication, device-local window realization, Client-independent Goals/chats, and checkpoint/fence/source-reconciled handoff/Move. | Static consumer and copy/move contracts only; no executable copy, rollback, handoff, continuity, or native GUI proof. |
| `AUTH-005` | Application update/release owners retain Automatic Updates On/Off, Check for Updates, bottom-status Update Available, internal cadence/asynchronous checks, signature/provenance, drain/checkpoint, pre-update recovery, install-source authority, migration/rollback, and separation among app, content/catalog, external tool/source-control, connector, and Backup updates. Backup daily/weekly/monthly retention never becomes an app-update schedule picker. | Separation is canonical; updater, connector artifact, rollback, and release evidence remain partial. |
| `AUTH-006` | Server/Remote Access/Final GUI owners retain LAN discovery and stable `server_id` deduplication; Tailscale/Headscale private access, hosted Funnel, NGINX/Traefik, existing VPN/manual routes, and approved Cloudflare-reference accountless Remote Link; no Tailcat without pricing approval, Tor, or Rust Tailscale backend. The source token `Built into PuppetMaster` is preserved while visible brand copy normalizes spacing to `Built into Puppet Master`; permanent web, future Swift/Kotlin, Slint/theme/motion/accessibility contracts remain, with no Backup Activity Bar occupant or redundant Assistant Chat host banner. | Route/UI obligations are static; WAN reachability, connector, native/web GUI, accessibility, theme/width/motion, and visual proof remain partial. |
| `AUTH-007` | Authentication Broker, scoped Credential Broker, Shared Integration Runtime, FileSafe, RuntimeResourceGovernor, ObservableWork, release tool lifecycle, and human-only protected sessions remain single shared owners. No PM Playwright backend/facade, agent/recording access to auth/key sessions, project-triggered provider installation, offline-tool product, or model-token classification for maintenance. | Owner references and secret-negative schemas are static; provider acquisition, protected-session isolation, resource behavior, and security proof remain partial. |
| `AUTH-008` | Forge owns the explicit GitHub-to-provider-neutral `repository_automation`/Actions & Pipelines migration while preserving GitHub compatibility. Backup owns explicit reviewed expansion of new-Project scope to PM data plus source and Git/JJ history; existing users are not silently opted into larger uploads. Restic/rclone is a reference design, not permission to displace an evidenced equivalent. New billing, exposure, destructive deletion, secret export, scope expansion, or account switch requires explicit consent and migration receipt. | Scope/migration/consent contracts are static; user migration, consent, provider billing/exposure, executable conversion, and release proof remain partial. |

### C-052 - Forge/Backup/tsnet Owner Precedence And Exact Route Context

```yaml
plan_unit_id: C-052
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: >-
  The post-integration Forge, Backup, and PM-managed connector transaction routes
  every semantic field to its existing domain owner and every cross-surface open,
  continuation, and reverse-navigation flow through CV-327. Forge Integrations
  owns distinct Forgejo/Gitea profiles, RepositoryForgeBinding, independent
  AutomationBinding, and the sole repository_automation / Actions & Pipelines
  occupant. Backup Restore owns destinations, repositories, RecoverySet/Kit,
  immutable snapshots/capture sets, retention, browse/retrieve, and RestoreRun.
  Source Control/JJ supply native closure and reconciliation only. Server owns
  server_id/trust/pairing; Remote Access owns the PM connector and route provenance;
  shared auth/runtime/storage owners retain their existing primitives and custody.
  Crosswalk selects and orders these owners without copying their schemas, commands,
  handlers, state machines, events, or runtime claims.
gui_related: true
gui_classification_reason: This boundary controls the visible Actions & Pipelines migration, exact snapshot/filter/focus return, Bootstrap recovery scope, endpoint provenance, and all consumer handoffs.
split_recommended: false
depends_on: [C-007, C-024, C-039, C-042, C-043, C-051, CV-327, FGI-012, BRS-014, BRS-016, RAS-015, SCS-013, SCS-014, JJI-008, SRV-013, SIR-032, SP-254, F3-528]
unblocks: []
acceptance_criteria:
  - "Crosswalk precedence chooses the owner; the newest accepted owner PlanUnit supplies domain semantics and later scoped supersession makes contradictory older examples compatibility lineage."
  - "Forgejo and Gitea remain distinct provider identities, RepositoryForgeBinding and AutomationBinding remain independent, and repository_automation / Actions & Pipelines is the sole automation occupant."
  - "github_actions and Open in GitHub Actions are migration inputs that normalize to the canonical occupant with an explicit GitHub binding; neither has a peer handler, panel, command family, or provider-neutral authority."
  - "Backup reverse navigation binds immutable repository/snapshot/capture-set, Project/Server scope, filter, focus, currentness generation, and return route; refresh never substitutes latest or another object."
  - "Fresh Full Server recovery uses explicit Bootstrap scope before a Project exists; Files, Projects, SCM/JJ, Settings, Onboarding, Doctor, and Final GUI remain consumers of Backup-owned behavior."
  - "Server identity/trust/pairing remains distinct from Remote-Access connector identity and route provenance; connector-private, hosted Funnel, and external host-managed routes do not imply trust or equivalence."
  - "Auth/profile, protected browser, Permissions, governor, ObservableWork, lease, outbox, persistence, and redaction remain with their existing owners; no domain obtains a peer shared runtime or secret store."
  - "All new commands remain owner-routed, event-silent where expected_event_types=[], and handler_unavailable until independent native evidence exists; this Crosswalk adds no command, handler, EventRecord, or runtime proof."
  - "The AUTH-001..AUTH-008 matrix above preserves authority/baseline and dirty-tree receipt, no-SQLite/Home-writer architecture, platform/package obligations, Project settings/continuity, app-update separation, WAN/UI and spaced-brand normalization, shared safety/resource owners, and explicit scope/migration/consent through real semantic owners without re-owning them."
  - "CMDX-001/CMDX-002 keep one semantic owner command/handler and the common non-secret operation envelope; external-effect states are accepted, running, outcome_unknown, observed_complete, failed, partial, and cancelled, and protected material uses separate channels."
  - "Executable/native/provider/security/visual/accessibility/performance evidence, baseline and dirty-tree receipts, actual diff/release artifacts, and PROC-001/PROC-002 execution remain partial; C-052 does not mark them implemented."
validation_surfaces:
  - Plans/Contracts_V0.md#cv-327---cross-owner-route-scope-immutable-selection-and-provenance-binding
  - Plans/Forge_Integrations.md#fgi-012---distinct-self-hosted-providers-and-independent-automation-authority
  - Plans/Backup_Restore_System.md#brs-014---snapshot-browse-retrieve-compare-export-and-archive-delivery
  - Plans/Remote_Access_System.md#ras-015---pm-owned-go-tsnet-connector-durable-authorization-and-private-route-replacement
  - Plans/Shared_Integration_Runtime.md#sir-034---backup-shared-primitives-and-common-external-effect-envelope
  - Plans/Project_System.md#pjct-005---project-backup-preference-copy-move-and-recovery-consumption
  - Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/BackupSharedRuntimeConsumptionRecord
  - python3 scripts/pm-new-contracts-verify.py
  - python3 scripts/pm-plan-index.py validate
risk_class: cross_owner_duplication_or_exact_return_loss
reasoning_tier: high
context_scope: forge_backup_tsnet_owner_and_route_precedence
implementation_surfaces: [Plans/Crosswalk.md, Plans/Contracts_V0.md]
node_compile_hint: {mode: crosswalk_owner_routing_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:2026-09-01:AUTH-001-AUTH-008
  - source_ref:packet:2026-09-01:OWN-001-OWN-006
  - source_ref:packet:2026-09-01:CMDX-001-CMDX-004
  - source_ref:packet:2026-09-01:PROC-001-PROC-003
  - scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_forge_reconciliation.md
  - scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/backup_cross_owner_patch_map.md
  - scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_tsnet_reconciliation.md
preserved_exact_tokens: [Forgejo, Gitea, RepositoryForgeBinding, AutomationBinding, repository_automation, "Actions & Pipelines", github_actions, RecoverySet, Recovery Kit, snapshot_id, capture_set_id, server_id, server_endpoint_id, remote_route_id, connector_id, pm-tailnet-connector, route_provenance_ref, seglog, redb, Tantivy, CAS, no-SQLite, "Built into PuppetMaster", "Built into Puppet Master", RuntimeResourceGovernor, ObservableWork, outcome_unknown, observed_complete, handler_unavailable, "expected_event_types=[]"]
negative_constraints:
  - "Do not create an umbrella Forge/Backup/connector runtime, copied schema, peer command family, peer handler, peer auth broker, peer scheduler, or peer secret store in Crosswalk."
  - "Do not infer automation from repository hosting, Backup access from tailnet login, Server trust from reachability, or successful restore from browse/static schema evidence."
  - "Do not retarget stale routes, select latest, fabricate Project/Server identity, or place protected material in route context."
  - "Do not claim native handler, runtime, provider, connector, restore, security, visual, accessibility, readiness, or Slint proof from this owner map."
  - "Do not treat the AUTH matrix or preserved PROC references as an accepted execution plan, baseline/dirty-tree receipt, executable diff, release proof, runtime implementation, or completed PROC-001/PROC-002 evidence."
owner_hints: [Plans/Crosswalk.md, Plans/Contracts_V0.md, Plans/Forge_Integrations.md, Plans/Backup_Restore_System.md, Plans/Remote_Access_System.md]
```
