# Shard 024: Forge/Backup/tsnet Product Onboarding consumer addendum - 2026-09-01

Source: `Plans/Planning_Wizard.md`

Source lines: L2015-L2088

Source SHA256: `de4da73fc489b3041304f58d5cf5d6563aa152b5ba4bd3256b81f4c1bc43351e`

---

## Forge/Backup/tsnet Product Onboarding consumer addendum - 2026-09-01

PWIZ-025 preserves PWIZ-021/PWIZ-024's exact nine-stage guided path, exact six-stage connect-existing path, and
Review/Apply fence. Fresh Full Server recovery is a Bootstrap preflow outside both Product Onboarding stage enums; it
does not turn `Restore a backup` into a hidden pre-Review mutation or add a tenth Product stage.

### PWIZ-025 - Bootstrap recovery, connector phases, and forge parity

```yaml
plan_unit_id: PWIZ-025
unit_type: integration_contract
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: >-
  After safe local Server claim, Bootstrap may offer one `restore_existing_pm_data` branch that invokes the
  Backup/Restore owner's protected fresh-recovery flow before Product Onboarding begins. Product Onboarding keeps its
  exact nine/six stage graphs and its `Restore a backup` First Project route as Project restore; after a confirmed plan
  creates or opens the first Project, it may project optional backup-destination setup and Recovery Kit confirmation.
  Remote Access setup consumes one Server-owned PM connector operation with typed connector, IPC, identity, control,
  authorization, private-endpoint, and route-test phases instead of package/component install state. Online-copy choices
  consume distinct Forgejo and Gitea provider/instance profiles and independent repository-hosting versus automation
  bindings without probing or mutating them before Review confirmation.
gui_related: true
gui_classification_reason: This unit defines visible Bootstrap recovery choice, onboarding owner phases, provider choices, protected handoffs, progress, exact return, and disabled/error states.
depends_on: [PWIZ-021, PWIZ-024, SRV-013, BRS-012, BRS-013, BRS-014, BRS-016, RAS-015, FGI-012, SCS-013]
unblocks: []
acceptance_criteria:
  - The canonical Product Onboarding graphs remain exactly nine guided stages and six connect-existing stages. `restore_existing_pm_data` is represented outside those enums as a Bootstrap handoff after safe local claim and before Product Onboarding.
  - Bootstrap fresh recovery does not require an old Server Catalog, a prior Project, model/provider authentication, or a new onboarding command family; it uses Backup-owned destination, protected sign-in, Recovery Kit/unlock, immutable snapshot inspection, preview, apply, and recovery receipts.
  - Full Server recovery begins recovery-safe, never auto-runs hooks, push, Goals, schedules, public ingress, or duplicate Server/connector identity, and reaches Product Onboarding only after truthful completion or explicit decline/defer.
  - "`Restore a backup` in `first_project` remains a Project restore intent. It writes only the local draft before Review, dispatches only after confirmation, and never aliases the Bootstrap full-recovery branch."
  - Optional destination setup and Recovery Kit confirmation appear only after the confirmed owner work has established the first Project. They route Backup-owned protected operations and never expose key bytes, claim PM escrow, or mark acknowledgement as recovery proof.
  - The visible Tailscale card uses exact copy `Tailscale` / `Built into Puppet Master`, with normal `Not connected` and `Set Up`; no install, package, daemon, sidecar, Serve-toggle, WSL, or already-authenticated-host-profile prerequisite appears.
  - Hosted connector work projects the durable Server-owned phases Starting Puppet Master connection, Opening Tailscale sign-in, Waiting for authorization, Waiting for device approval, Creating private address, Testing web UI, API, and live connection, and Ready; cancel, denial, expiry, device approval, reauth, crash, corruption, mismatch, and route failure remain distinct.
  - Self-hosted Headscale collects the owner-approved control URL and protected enrollment method, never offers Funnel, and reports certificate/version/reachability/registration capability truth independently.
  - The Server-owned connector authorization/setup operation survives refresh, Client loss, and Client change. Protected browser contents, cookies, codes, and credentials remain bound to an authorized current Client handoff and are never inherited by another Client merely because the durable operation continues.
  - Connect-existing remains route-first and pre-Review activity remains cached or explicitly bounded read-only discovery. Connector authorization, endpoint mutation/test, Server identity verification, and pairing happen only after Review confirmation and return to the exact originating row/focus/generation.
  - "`Bring one from online` and optional online copy expose Forgejo and Gitea as separate forge provider/instance choices with exact custom endpoint/trust/account identity. Repository hosting and automation binding may differ; Git-ready/API-unavailable stays a valid truthful plan and never fabricates Actions."
  - No command or EventRecord family is created here. Consumed packet commands remain handler_unavailable and event-silent with expected_event_types=[] until owner and central integration exist; concept/static state never proves owner work, native Slint execution, provider readiness, recovery, or security.
validation_surfaces:
  - Plans/product_onboarding_contracts.schema.json
  - Plans/product_onboarding_contract_fixtures.json
  - Plans/backup_restore_system_contracts.schema.json
  - Plans/remote_access_system_contracts.schema.json
  - Plans/forge_integration_contracts.schema.json
  - future pre-Bootstrap recovery/no-old-Catalog/no-provider-auth fixtures
  - future exact nine/six census and pre-Review no-effect fixtures
  - future connector refresh/Client-loss/protected-handoff and Forgejo/Gitea parity fixtures
risk_class: onboarding_stage_drift_or_pre_review_owner_effect
reasoning_tier: high
context_scope: product_onboarding_cross_owner_handoffs
implementation_surfaces: [Plans/Planning_Wizard.md, future Product Onboarding and Bootstrap projection controllers]
node_compile_hint: {mode: onboarding_cross_owner_consumer_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/backup_cross_owner_patch_map.md#4.2
  - scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_forge_reconciliation.md#onboarding-schema-and-fixtures
  - scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_tsnet_reconciliation.md#product-onboarding
  - packet:03_ORIGIN_FORGEJO_GITEA_AND_PROVIDER_PROFILES.md#FORGE-004
  - packet:10_RESTORE_BROWSE_RETRIEVE_GUI_AND_SAFETY.md
  - packet:12_BACKUP_SETTINGS_ONBOARDING_DOCTOR.md#BGUI-004
  - packet:tsnet/04_GUI_ONBOARDING_DOCTOR_DELTAS.md
preserved_exact_tokens: [restore_existing_pm_data, Restore a backup, Tailscale, Built into Puppet Master, review_setup_plan, automatic_preparation, Forgejo, Gitea, handler_unavailable, "expected_event_types=[]"]
negative_constraints:
  - Do not add, remove, or reorder a Product Onboarding stage.
  - Do not run recovery, connector, forge, account, repository, filesystem, Server, pairing, trust, or route mutation before confirmed Review.
  - Do not model the PM connector as a full Tailscale install, host daemon, sidecar, WSL node, Project node, or reusable host session.
  - Do not merge Bootstrap Full Server recovery with the Product Project-restore route.
  - Do not conflate Forgejo with Gitea or repository hosting with automation binding.
  - Do not expose protected authentication or Recovery Key content in durable Onboarding state, recordings, logs, Chat, Usage, or agent context.
  - Do not claim native/runtime/provider/recovery/security completion from Plans, schemas, fixtures, or PMConcept7.
owner_boundary_notes:
  - Planning Wizard owns Product Onboarding orchestration, local draft/session/continuation, and owner projection; Server Claim/Bootstrap, Backup/Restore, Remote Access, Source Control/Forge, and auth owners retain effects and truth.
owner_hints: [Plans/Planning_Wizard.md, Plans/Server_System.md, Plans/Backup_Restore_System.md, Plans/Remote_Access_System.md, Plans/Forge_Integrations.md, Plans/Source_Control_System.md]
```
