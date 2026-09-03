# Shard 033: Forge/Backup/tsnet Doctor consumer addendum - 2026-09-01

Source: `Plans/newtools.md`

Source lines: L8925-L8994

Source SHA256: `ab70dbc2e26cad60cd86bb6344f3244b1b7a901e6a04e3b937ede665d1c3e7ec`

---

## Forge/Backup/tsnet Doctor consumer addendum - 2026-09-01

N2-156 extends the one N2-151 registry/router. It creates no Backup or connector check engine, no Doctor-only repair
command, and no parallel health reducer. Older Serve/full-package/Tailscale-install checks are superseded only for the
PM-owned connector route; verified external host-Tailscale routes remain separately attributable observations.

### N2-156 - Backup and PM connector descriptor families

```yaml
plan_unit_id: N2-156
unit_type: integration_contract
status: accepted
owner_doc: Plans/newtools.md
canonical_text: >-
  Doctor registers bounded read-only descriptor families for Backup destination, repository, immutable snapshot,
  RecoverySet public status, policy/source coverage, restore health, and the PM Remote Access connector. Backup findings
  keep access/auth/TLS/path/quota/throttle, lock/writer/last-complete, capture/integrity/drill/archive, protected
  attachment/kit confirmation, schedule/retention/hold/prune-preview, source/JJ closure, and restore-target/currentness
  axes independent. Connector findings replace package/Serve checks with binary/build/protocol/process/state/binding,
  control/auth, private endpoint, hosted-Funnel, PM product-protocol, server_id dedupe, and backup-classification axes.
  Every remediation is an exact owner route; Doctor never decrypts, unlocks, exports, prunes, restores, installs,
  authenticates, clears identity, or promotes a route/navigation result to owner success.
gui_related: true
gui_classification_reason: These descriptor families produce visible Doctor findings, freshness, evidence, disabled reasons, remediation routes, and exact return/focus behavior.
depends_on: [N2-151, N2-152, N2-153, BRS-012, BRS-013, BRS-014, BRS-015, BRS-016, RAS-015, SRV-013]
unblocks: []
acceptance_criteria:
  - Stable target kinds cover `backup_destination`, `backup_repository`, `backup_snapshot`, `backup_recovery_set`, `backup_policy`, `backup_source_coverage`, `backup_restore_target`, and `remote_access_connector` without copying Backup/Remote Access owner record enums or secret-bearing payloads.
  - Destination findings report access, auth, TLS/trust, path, quota, throttle, and observed capability independently. Repository findings report unlock-required without key access, writer/lock health, and the last committed scope-complete snapshot rather than the latest attempt.
  - Snapshot/source findings separate capture completeness, Git/JJ dependency closure, structural verification, full/sampled read verification, restore-drill freshness, and archive availability/cost state. One level never upgrades another.
  - RecoverySet findings expose only public identity/generation, protected attachment availability, and Recovery Kit confirmation; Recovery Key/Kit bytes, protected-submission contents, browser data, tokens/codes, clipboard/print content, and ordinary capture are forbidden.
  - Policy findings separate automatic-on/off, next/last occurrence, timezone/DST/catch-up, retention/holds, current preview/hash/lease, pending cleanup, and one-writer currentness. Doctor may route to read-only retention preview but never dispatch prune.
  - Restore findings report immutable selected target, mode, preview/currentness, recovery-safe state, source/JJ coverage, identity collision, and terminal owner receipt. Browse, retrieve, download, compare, export, and archive retrieval are not reported as restore execution.
  - Connector findings separately cover signed PM connector binary/build and Go/tsnet/IPC protocol compatibility; process/backoff; secure state readability and server_id binding; hosted Tailscale or Headscale control/auth; private endpoint/FQDN/certificate; PM web/API/WebSocket/stream test; hosted Funnel only when configured; product-protocol health; endpoint dedupe; and Backup exclusion classification.
  - Doctor proves the negative absence of a PM-required full Tailscale app/daemon/CLI, official sidecar/operator, TUN/NET_ADMIN/privileged networking, WSL/Project/runner node, or duplicate automatic node. The normal finding does not ask the user to install those components.
  - Headscale Funnel is inapplicable rather than unhealthy. A missing optional backup destination, disabled optional route, intentionally disabled WSL, or unconfigured Funnel does not degrade unrelated product health.
  - Remediation routes only to exact Backup or Remote Access owner actions. Protected unlock/key operations are never Doctor actions; connector identity reset is destructive, previewed, confirmed, generation-fenced, and unavailable without its owner command.
  - Cached, stale, migrated, static, or concept state is never called a fresh check. Close/detach leaves owner ObservableWork alive and re-entry rejoins it; fresh owner results alone replace findings.
  - Doctor admits no semantic-domain EventRecord and no packet command family. Owner commands consumed from remediation stay handler_unavailable and event-silent with expected_event_types=[] until separately integrated and admitted.
validation_surfaces:
  - Plans/doctor_contracts.schema.json
  - Plans/doctor_contract_fixtures.json
  - Plans/backup_restore_system_contracts.schema.json
  - Plans/remote_access_system_contracts.schema.json
  - future optional-off/non-degradation and cached-as-fresh negatives
  - future Recovery Key/connector-secret leakage and mutation-attempt negatives
  - future connector hosted/Headscale/Funnel/dedupe/backup-classification fixtures
risk_class: doctor_secret_access_or_parallel_repair_authority
reasoning_tier: high
context_scope: doctor_backup_and_connector_descriptors
implementation_surfaces: [Plans/newtools.md, future Doctor descriptor registry and bounded projections]
node_compile_hint: {mode: doctor_cross_owner_descriptor_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/backup_cross_owner_patch_map.md#4.2
  - scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_backup_reconciliation.md#doctor
  - scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_tsnet_reconciliation.md#doctor
  - packet:12_BACKUP_SETTINGS_ONBOARDING_DOCTOR.md#BGUI-004
  - packet:tsnet/04_GUI_ONBOARDING_DOCTOR_DELTAS.md#doctor
preserved_exact_tokens: [backup_destination, backup_repository, backup_snapshot, backup_recovery_set, backup_policy, backup_source_coverage, backup_restore_target, remote_access_connector, server_id, optional_off, handler_unavailable, "expected_event_types=[]"]
negative_constraints:
  - Do not decrypt, unlock, export, copy, print, rotate, reencrypt, prune, restore, install, authenticate, or clear owner state in Doctor.
  - Do not expose Recovery Key/Kit bytes, protected auth content, connector state/keys, credentials, reusable authorization URLs, private paths, or unbounded logs.
  - Do not treat missing optional capability as global degradation or Headscale's lack of Funnel as a failure.
  - Do not restore full-package, Serve-toggle, daemon, sidecar, TUN, WSL-node, or host-session-adoption checks for the PM connector.
  - Do not infer owner success from route completion, cached paint, focus, static fixtures, or concept state.
  - Do not claim runtime, native Slint, provider, security, backup, restore, connector, or readiness proof from this Plans-only descriptor contract.
owner_boundary_notes:
  - Doctor owns descriptor identity, bounded scheduling, normalized findings, and remediation return; Backup_Restore_System and Remote_Access_System own probes, state, mutations, commands, and receipts.
owner_hints: [Plans/newtools.md, Plans/Backup_Restore_System.md, Plans/Remote_Access_System.md, Plans/Server_System.md, Plans/Settings_System.md]
```
