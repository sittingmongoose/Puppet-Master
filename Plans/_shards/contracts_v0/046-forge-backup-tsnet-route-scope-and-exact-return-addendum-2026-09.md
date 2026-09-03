# Shard 046: Forge/Backup/tsnet Route Scope And Exact-Return Addendum - 2026-09-01

Source: `Plans/Contracts_V0.md`

Source lines: L21169-L21239

Source SHA256: `a3be47f5e955848bc80a0e5e520138bac0c9a225986aba2f30e79c0b74641810`

---

## Forge/Backup/tsnet Route Scope And Exact-Return Addendum - 2026-09-01

### CV-327 - Cross-Owner Route Scope, Immutable Selection, And Provenance Binding

```yaml
plan_unit_id: CV-327
unit_type: integration_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  route_target retains exactly one subject or object primary selector while adding
  explicit project/server/application/bootstrap/global resolver scope and bounded owner-issued
  context refs for repository hosting, independent automation binding, immutable
  Backup selection, Server endpoint and Remote Access provenance, exact filters,
  semantic focus, currentness generation, and return-route restoration. Context
  refs constrain the selected object and never become peer selectors, copied owner
  records, secret transport, arbitrary argument bags, or evidence that a handler,
  provider, connector, restore engine, route, trust decision, or native surface is
  operational.
gui_related: true
gui_classification_reason: Exact object, filter, focus, return, provider-binding, snapshot, and endpoint identity controls every affected visible deep link and reverse-navigation flow.
split_recommended: false
depends_on: [CV-054, CV-163, CV-164, CV-166, CV-168, CV-169, CV-170, CV-172, FGI-012, BRS-014, BRS-016, RAS-015, SCS-013, SRV-013]
unblocks: [C-052]
acceptance_criteria:
  - "New route producers emit resolver_scope; legacy omission normalizes only to project with a non-null project_id. project_id is required-present and null only for server, application, bootstrap, or global resolution."
  - "Full Server recovery before Project creation uses bootstrap scope plus a backup_recovery_bootstrap primary object and never invents Project or Server identity."
  - "Exactly one primary subject_id or object_kind/object_id selector remains mandatory; all repository, binding, destination, snapshot, capture-set, recovery-set, policy, retention, restore-preview/run, endpoint, provenance, filter, focus, currentness, and return fields are validated context constraints only."
  - "Forge routing keeps RepositoryForgeBinding and AutomationBinding independent; github_actions normalizes to repository_automation with an explicit GitHub automation binding and never dispatches from a remote name or selected shell alone."
  - "Legacy repo_id and GitHub workflow/run/job/step panel fields normalize to repository_id plus typed automation object identity and an explicit automation_binding_id before route validation."
  - "Backup browse and reverse routes retain immutable repository_id, snapshot_id, capture_set_id, scope, filter_ref, and focus_ref; refresh, discovery, retention, or latest-state changes never retarget the user."
  - "Server and Remote Access routes retain exact server_id, endpoint or route identity, server_endpoint_id, remote_route_id, optional connector_id, and route_provenance_ref; connector-private, Funnel, and external host-managed routes never imply identity, pairing, trust, or equivalence."
  - "filter_ref and focus_ref are owner-issued typed refs, not raw query bags or DOM selectors; return_route_ref is an immutable normalized route snapshot, not recursive route data or a second route ontology."
  - "Protected continuations contain no credential, Recovery Key/Kit, authorization URL/code, browser content, connector state, secret bytes, or foreign absolute paths."
  - "CMDX-001/CMDX-002 bind each semantic action to one owner command/handler and one common non-secret envelope carrying operation/request, actor/Client, Home Server, Project, repository/source-location/checkout/Host/Environment, provider instance/connection/profile, expected revision/capability revision, idempotency, and optional Goal/Plan/thread refs only when applicable."
  - "Host-owned mutation revalidates context and leases; external effects distinguish accepted, running, outcome_unknown, observed_complete, failed, partial, and cancelled, while read-only observations return revision/freshness and never claim current state from stale cache."
  - "AUTH-001..AUTH-008 preservation routes authority/baseline, Server/storage, platform/package, Project settings/continuity, application update, WAN/UI, safety/resource, and migration/consent to their existing semantic owners; route context copies none of their state machines or evidence."
  - "Static contract, schema, fixture, route, and owner-map evidence is partial only: dirty-tree/baseline receipts, executable diffs, release artifacts, handlers, provider behavior, restore drills, native GUI, and PROC-001/PROC-002 execution proof remain absent until separately produced."
validation_surfaces:
  - Plans/Contracts_V0.md#73-route_target
  - Plans/Crosswalk.md#c-052---forge-backuptsnet-owner-precedence-and-exact-route-context
  - future route-scope/selector/currentness/reverse-focus fixtures
  - Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/BackupSharedRuntimeConsumptionRecord
  - Plans/shared_integration_runtime_expansion_fixtures.json
  - python3 scripts/pm-plan-index.py validate
risk_class: cross_owner_route_retarget_or_authority_conflation
reasoning_tier: high
context_scope: forge_backup_tsnet_route_scope_and_exact_return
implementation_surfaces: [Plans/Contracts_V0.md, Plans/Crosswalk.md, future canonical route schema and resolver]
node_compile_hint: {mode: shared_route_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:2026-09-01:GUI-005-GUI-007
  - source_ref:packet:2026-09-01:REST-003-REST-009
  - source_ref:packet:2026-09-01:TSX-001-TSX-004
  - source_ref:packet:2026-09-01:CMDX-001-CMDX-004
  - source_ref:packet:2026-09-01:AUTH-001-AUTH-008
  - source_ref:packet:2026-09-01:PROC-001-PROC-002
  - Plans/Forge_Integrations.md#FGI-012
  - Plans/Backup_Restore_System.md#BRS-014
  - Plans/Backup_Restore_System.md#BRS-016
  - Plans/Remote_Access_System.md#RAS-015
  - Plans/Server_System.md#SRV-013
preserved_exact_tokens: [resolver_scope, project_id, server_id, repository_id, snapshot_id, capture_set_id, automation_binding_id, binding_generation, currentness_ref, automation_gate, automation_artifact, automation_runner, backup_policy_id, retention_preview_id, restore_preview_id, restore_run_id, server_endpoint_id, remote_route_id, connector_id, route_provenance_ref, filter_ref, focus_ref, return_route_ref, repository_automation, github_actions, outcome_unknown, observed_complete, handler_unavailable, "expected_event_types=[]"]
negative_constraints:
  - "Do not add a generic extra-args bag, competing selector, copied domain record, or consumer-owned routing primitive."
  - "Do not select latest or substitute a new repository, snapshot, capture set, binding, Server, endpoint, route, filter, or focus after refresh."
  - "Do not infer automation authority from repository hosting, Server trust from reachability, or Backup access from tailnet authentication."
  - "Do not claim handler, runtime, provider, connector, restore, visual, security, readiness, or Slint evidence from route contracts or static fixtures."
  - "Do not claim the AUTH preservation matrix, PROC-001, PROC-002, a baseline hash, dirty-tree protection, executable diff, or release proof is complete from this static contract."
owner_hints: [Plans/Contracts_V0.md, Plans/Crosswalk.md, Plans/Forge_Integrations.md, Plans/Backup_Restore_System.md, Plans/Remote_Access_System.md]
```
