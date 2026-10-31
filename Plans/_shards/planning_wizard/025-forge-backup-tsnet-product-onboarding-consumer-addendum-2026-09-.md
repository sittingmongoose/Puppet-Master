# Shard 025: Forge/Backup/tsnet Product Onboarding consumer addendum - 2026-09-01

Source: `Plans/Planning_Wizard.md`

Source lines: L2521-L2742

Source SHA256: `b28a3459e18dbf9c27eb0f80083009e575abcf210c03058510575afd642d861a`

---

## Forge/Backup/tsnet Product Onboarding consumer addendum - 2026-09-01

PWIZ-025 consumes PWIZ-021/PWIZ-024's current dependency graph and exact six-stage connect-existing shortcut. Fresh Full Server recovery remains a Bootstrap preflow outside Product Onboarding; it does not turn Restore a backup into a hidden precommit mutation or a Product stage.

### PWIZ-025 - Bootstrap recovery, connector phases, and forge parity

```yaml
plan_unit_id: PWIZ-025
unit_type: integration_contract
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: 'After safe local Server claim, Bootstrap may offer one `restore_existing_pm_data` branch that invokes
  the Backup/Restore owner''s protected fresh-recovery flow before Product Onboarding begins. Product Onboarding keeps
  its current eleven-stage dependency graph and six-stage connect-existing shortcut and its `Restore a backup` First
  Project route as Project restore; after a confirmed plan creates or opens the first Project, it may project optional
  backup-destination setup and Recovery Kit confirmation. Remote Access setup consumes an owner-qualified PM connector
  operation for the Server or native Client installation with typed connector, IPC, identity, control, authorization,
  private-endpoint, and route-test phases instead of package/component install state. Online-copy choices consume distinct
  Forgejo and Gitea provider/instance profiles and independent repository-hosting versus automation bindings with only
  the selected-source read-only/auth exception before commit; repository mutation and binding remain commit-fenced. QA
  round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q6/Q7: point to the actual backup before asking to unlock it. A
  Recovery Kit is an untrusted locator plus protected recovery credential, not a storage place, backup payload, NAS password
  or cloud sign-in. Offer the Kit first, then the explicit no-Kit path to a folder, another device/NAS, or a cloud service.
  Continue waits for the selected file/folder/device/account and required fields. Validate the locator/trust and reach/authenticate
  the selected place through its existing owner. An accepted Kit may unlock that backup, but cannot bypass storage authentication.
  Show Unlock the backup only for a still-locked backup without an accepted unlock; name its selected place. Select a
  copy, coverage and preview only afterwards. Repointing invalidates the former unlock and snapshot selection. Owner
  recovery prerequisites, approval, protected secret handling and actual restore/Project commit boundaries remain mandatory;
  only a verified Backup owner result proves unlock or restore. QA2 follow-up N1, integration 6609384fd0; DL-258: A reached
  backup place is bound to the selected service or device, not a reusable signed-in/ready boolean. Choosing another source,
  service, device, Kit or folder invalidates its old reach proof, protected access fields, unlock, copy selection and
  completed bucket check. A late sign-in/check result stays bound to the service/device it authenticated and cannot advance
  a different current choice. The Remote Link endpoint belongs only to the Remote Link route; choosing Only at home/local-or-VPN,
  Tailscale or another route clears it from the reviewed draft. No stale endpoint enters an unrelated route. DL-259,
  Jared 2026-10-31: D7 B supersedes the former no-per-Client-node restriction. Native Puppet Master apps on Windows,
  macOS and Linux have their own built-in Tailscale connection and sign in once through the shared protected auth owner,
  with no separate Tailscale app install. The same signed PM-owned Go tsnet helper is supervised by its owning PM process.
  A Server keeps one active node per stable server_id; a native Client installation keeps one active node per stable
  client_id, independent of Projects, windows, tabs, sessions and Server endpoint selection. Owner-qualified configuration,
  process, IPC, authorization, egress and secure-state references prevent identity/key sharing or duplicate active nodes.
  Native Client nodes provide bounded Dial/stream access only to verified PM endpoints, not arbitrary proxying or a Server
  public listener. Server nodes retain the automatic private listener; Funnel remains Server-only, explicit, off by default
  and unavailable on Headscale. Human approval and reusable connection identity do not grant PM pairing/trust or work
  permission. A plain browser tab has no embedded Tailscale connection: it needs Remote Link or a private endpoint reachable
  through the device’s own Tailscale connection. It cannot be enrolled by a browser sign-in. Existing user-managed host
  Tailscale stays external and unmanaged. Audit FF-13..18: backup and restore bind exact service, account/profile, endpoint/region
  when applicable, repository and path/bucket/prefix/drive/folder before listing snapshots or claiming readiness. AWS,
  B2 and S3-compatible services remain distinct; temporary credentials include the protected session token when required.
  Drive and OneDrive select an owner-resolved destination or explicit app folder and retain tenant/drive context when
  applicable. WebDAV and SFTP remain separate protocol families. An empty catalog stays empty rather than falling back
  to another destination. The Backup owner exposes its registered destination/profile choices. Changing transport or
  locator invalidates old subchoices and checks. Recovery Kit is private key/locator material, not backup bytes or a
  six-word format; only verified owner results prove restore/unlock. Audit SCR: selected Server, initiating Client, execution
  host, source/storage profile and route are separate stable identities across the wizard, shell, Settings and status
  projections. Pairing adoption requires exact Server/Client/session/generation and explicit owner approval; Back/change
  cancels stale work. Raw pairing codes/QR payloads stay ephemeral, never ordinary durable draft fields. Unpaired discovery
  exposes only minimal Server identity/capability data, not Project/user metadata. Copy links come from verified endpoint/invitation
  results, not a display-name slug. Existing-client and selected-source failures expose bounded retry/new-request/defer/return
  without accepting stale authority. Unclaimed cloud bootstrap stays private; NAS/container setup requires a release-owned
  compatible recipe, durable roots/mount/permission proof and an install-guide pointer. Full recovery follows safe Bootstrap
  and Backup preview, identity/collision/recovery-safe checks; it never auto-activates public routes or work. DL-259
  H3/D6: SMB credential copy follows the authorized secure keychain policy for that share and host. It never calls SMB
  sign-in SSH key installation or promises never saved when a secure-store credential is retained. One-time SSH installation
  secrets and protected unlock inputs retain their own no-store boundaries.'
gui_related: true
gui_classification_reason: This unit defines visible Bootstrap recovery choice, onboarding owner phases, provider
  choices, protected handoffs, progress, exact return, and disabled/error states.
depends_on:
- PWIZ-021
- PWIZ-024
- SRV-013
- BRS-012
- BRS-013
- BRS-014
- BRS-016
- RAS-015
- FGI-012
- SCS-013
unblocks: []
acceptance_criteria:
- The canonical Product Onboarding graphs remain the current eleven-stage dependency graph and exact six-stage connect-existing
  shortcut. `restore_existing_pm_data` is represented outside those enums as a Bootstrap handoff after safe local claim
  and before Product Onboarding.
- Bootstrap fresh recovery does not require an old Server Catalog, a prior Project, model/provider authentication, or
  a new onboarding command family; it uses Backup-owned destination, protected sign-in, Recovery Kit/unlock, immutable
  snapshot inspection, preview, apply, and recovery receipts.
- Full Server recovery begins recovery-safe, never auto-runs hooks, push, Goals, schedules, public ingress, or duplicate
  Server/connector identity, and reaches Product Onboarding only after truthful completion or explicit decline/defer.
- '`Restore a backup` in `first_project` remains a Project restore intent. It writes only the local draft before Review,
  dispatches only after confirmation, and never aliases the Bootstrap full-recovery branch.'
- Optional destination setup and Recovery Kit confirmation appear only after the confirmed owner work has established
  the first Project. They route Backup-owned protected operations and never expose key bytes, claim PM escrow, or mark
  acknowledgement as recovery proof.
- The visible Tailscale card uses exact copy `Tailscale` / `Built into Puppet Master`, with normal `Not connected` and
  `Set Up`; no install, package, daemon, sidecar, Serve-toggle, WSL, or already-authenticated-host-profile prerequisite
  appears.
- Hosted connector work projects the durable Server-owned phases Starting Puppet Master connection, Opening Tailscale
  sign-in, Waiting for authorization, Waiting for device approval, Creating private address, Testing web UI, API, and
  live connection, and Ready; cancel, denial, expiry, device approval, reauth, crash, corruption, mismatch, and route
  failure remain distinct.
- Self-hosted Headscale collects the owner-approved control URL and protected enrollment method, never offers Funnel,
  and reports certificate/version/reachability/registration capability truth independently.
- The Server-owned connector authorization/setup operation survives refresh, Client loss, and Client change. Protected
  browser contents, cookies, codes, and credentials remain bound to an authorized current Client handoff and are never
  inherited by another Client merely because the durable operation continues.
- Connect-existing remains route-first and pre-Review activity remains cached or explicitly bounded read-only discovery.
  Connector authorization, endpoint mutation/test, Server identity verification, and pairing happen only after Review
  confirmation and return to the exact originating row/focus/generation.
- '`Bring one from online` and optional online copy expose Forgejo and Gitea as separate forge provider/instance choices
  with exact custom endpoint/trust/account identity. Repository hosting and automation binding may differ; Git-ready/API-unavailable
  stays a valid truthful plan and never fabricates Actions.'
- No command or EventRecord family is created here. Consumed packet commands remain handler_unavailable and event-silent
  with expected_event_types=[] until owner and central integration exist; concept/static state never proves owner work,
  native Slint execution, provider readiness, recovery, or security.
- 'QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q6/Q7: point to the actual backup before asking to unlock it.
  A Recovery Kit is an untrusted locator plus protected recovery credential, not a storage place, backup payload, NAS
  password or cloud sign-in. Offer the Kit first, then the explicit no-Kit path to a folder, another device/NAS, or a
  cloud service. Continue waits for the selected file/folder/device/account and required fields. Validate the locator/trust
  and reach/authenticate the selected place through its existing owner. An accepted Kit may unlock that backup, but cannot
  bypass storage authentication. Show Unlock the backup only for a still-locked backup without an accepted unlock; name
  its selected place. Select a copy, coverage and preview only afterwards. Repointing invalidates the former unlock and
  snapshot selection. Owner recovery prerequisites, approval, protected secret handling and actual restore/Project commit
  boundaries remain mandatory; only a verified Backup owner result proves unlock or restore.'
- 'QA2 follow-up N1, integration 6609384fd0; DL-258: A reached backup place is bound to the selected service or device,
  not a reusable signed-in/ready boolean. Choosing another source, service, device, Kit or folder invalidates its old
  reach proof, protected access fields, unlock, copy selection and completed bucket check. A late sign-in/check result
  stays bound to the service/device it authenticated and cannot advance a different current choice. The Remote Link endpoint
  belongs only to the Remote Link route; choosing Only at home/local-or-VPN, Tailscale or another route clears it from
  the reviewed draft. No stale endpoint enters an unrelated route.'
- 'DL-259, Jared 2026-10-31: D7 B supersedes the former no-per-Client-node restriction. Native Puppet Master apps on
  Windows, macOS and Linux have their own built-in Tailscale connection and sign in once through the shared protected
  auth owner, with no separate Tailscale app install. The same signed PM-owned Go tsnet helper is supervised by its owning
  PM process. A Server keeps one active node per stable server_id; a native Client installation keeps one active node
  per stable client_id, independent of Projects, windows, tabs, sessions and Server endpoint selection. Owner-qualified
  configuration, process, IPC, authorization, egress and secure-state references prevent identity/key sharing or duplicate
  active nodes. Native Client nodes provide bounded Dial/stream access only to verified PM endpoints, not arbitrary proxying
  or a Server public listener. Server nodes retain the automatic private listener; Funnel remains Server-only, explicit,
  off by default and unavailable on Headscale. Human approval and reusable connection identity do not grant PM pairing/trust
  or work permission. A plain browser tab has no embedded Tailscale connection: it needs Remote Link or a private endpoint
  reachable through the device’s own Tailscale connection. It cannot be enrolled by a browser sign-in. Existing user-managed
  host Tailscale stays external and unmanaged. Audit FF-13..18: backup and restore bind exact service, account/profile,
  endpoint/region when applicable, repository and path/bucket/prefix/drive/folder before listing snapshots or claiming
  readiness. AWS, B2 and S3-compatible services remain distinct; temporary credentials include the protected session
  token when required. Drive and OneDrive select an owner-resolved destination or explicit app folder and retain tenant/drive
  context when applicable. WebDAV and SFTP remain separate protocol families. An empty catalog stays empty rather than
  falling back to another destination. The Backup owner exposes its registered destination/profile choices. Changing
  transport or locator invalidates old subchoices and checks. Recovery Kit is private key/locator material, not backup
  bytes or a six-word format; only verified owner results prove restore/unlock. Audit SCR: selected Server, initiating
  Client, execution host, source/storage profile and route are separate stable identities across the wizard, shell, Settings
  and status projections. Pairing adoption requires exact Server/Client/session/generation and explicit owner approval;
  Back/change cancels stale work. Raw pairing codes/QR payloads stay ephemeral, never ordinary durable draft fields.
  Unpaired discovery exposes only minimal Server identity/capability data, not Project/user metadata. Copy links come
  from verified endpoint/invitation results, not a display-name slug. Existing-client and selected-source failures expose
  bounded retry/new-request/defer/return without accepting stale authority. Unclaimed cloud bootstrap stays private;
  NAS/container setup requires a release-owned compatible recipe, durable roots/mount/permission proof and an install-guide
  pointer. Full recovery follows safe Bootstrap and Backup preview, identity/collision/recovery-safe checks; it never
  auto-activates public routes or work.'
- 'DL-259 H3/D6: SMB credential copy follows the authorized secure keychain policy for that share and host. It never
  calls SMB sign-in SSH key installation or promises never saved when a secure-store credential is retained. One-time
  SSH installation secrets and protected unlock inputs retain their own no-store boundaries.'
validation_surfaces:
- Plans/product_onboarding_contracts.schema.json
- Plans/product_onboarding_contract_fixtures.json
- Plans/backup_restore_system_contracts.schema.json
- Plans/remote_access_system_contracts.schema.json
- Plans/forge_integration_contracts.schema.json
- future pre-Bootstrap recovery/no-old-Catalog/no-provider-auth fixtures
- current phase-census and bounded selected-source precommit negative fixtures; native execution not_run
- future connector refresh/Client-loss/protected-handoff and Forgejo/Gitea parity fixtures
risk_class: onboarding_stage_drift_or_pre_review_owner_effect
reasoning_tier: high
context_scope: product_onboarding_cross_owner_handoffs
implementation_surfaces:
- Plans/Planning_Wizard.md
- future Product Onboarding and Bootstrap projection controllers
node_compile_hint:
  mode: onboarding_cross_owner_consumer_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/backup_cross_owner_patch_map.md#4.2
- scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_forge_reconciliation.md#onboarding-schema-and-fixtures
- scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_tsnet_reconciliation.md#product-onboarding
- packet:03_ORIGIN_FORGEJO_GITEA_AND_PROVIDER_PROFILES.md#FORGE-004
- packet:10_RESTORE_BROWSE_RETRIEVE_GUI_AND_SAFETY.md
- packet:12_BACKUP_SETTINGS_ONBOARDING_DOCTOR.md#BGUI-004
- packet:tsnet/04_GUI_ONBOARDING_DOCTOR_DELTAS.md
preserved_exact_tokens:
- restore_existing_pm_data
- Restore a backup
- Tailscale
- Built into Puppet Master
- review_setup_plan
- automatic_preparation
- Forgejo
- Gitea
- handler_unavailable
- expected_event_types=[]
negative_constraints:
- This recovery/connector consumer does not add, remove or reorder PWIZ-021's current stage graph.
- Do not run recovery, connector, repository, filesystem, Server, pairing, trust or route mutation before confirmed
  Review. PWIZ-021 alone admits necessary selected-source authentication and read-only preflight; this consumer
  neither forbids that narrow admission nor broadens it into other account/forge mutations.
- Do not model the PM connector as a full Tailscale install, host daemon, sidecar, WSL node, Project node, or reusable
  host session.
- Do not merge Bootstrap Full Server recovery with the Product Project-restore route.
- Do not conflate Forgejo with Gitea or repository hosting with automation binding.
- Do not expose protected authentication or Recovery Key content in durable Onboarding state, recordings, logs,
  Chat, Usage, or agent context.
- Do not claim native/runtime/provider/recovery/security completion from Plans, schemas, fixtures, or PMConcept7.
owner_boundary_notes:
- Planning Wizard owns Product Onboarding orchestration, local draft/session/continuation, and owner projection;
  Server Claim/Bootstrap, Backup/Restore, Remote Access, Source Control/Forge, and auth owners retain effects and
  truth.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/Server_System.md
- Plans/Backup_Restore_System.md
- Plans/Remote_Access_System.md
- Plans/Forge_Integrations.md
- Plans/Source_Control_System.md
```
