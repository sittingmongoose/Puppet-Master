# Shard 072: Forge/Backup/tsnet shared GUI consumer addendum - 2026-09-01

Source: `Plans/FinalGUISpec.md`

Source lines: L35580-L35663

Source SHA256: `d5dd0b8f0f130cf3a4834576d4ac87136d579819ec48bf6b3f165ac4874adc2b`

---

## Forge/Backup/tsnet shared GUI consumer addendum - 2026-09-01

F3-528 supersedes only generic GitHub-Actions-shell identity and the older Backup/Remote Access presentation details
named below. GitHub-specific behavior remains intact inside the selected GitHub automation binding. The selected K3
Settings layout, PMConcept7 chrome, left-rail placement, exact ten-panel census, eight-theme authority, title-bar
notification stack, sprout inbox, and bottom/status mechanisms remain unchanged.

### F3-528 - Provider-neutral automation and recovery/connector presentation

```yaml
plan_unit_id: F3-528
unit_type: integration_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Final GUI presents one canonical repository_automation side-panel occupant labeled Actions & Pipelines, owner-routed
  Backup and Recovery components inside the K3 Settings/Files/Project contexts, and Remote Access connector state in
  existing Settings/Onboarding/Doctor/status surfaces. It paints exact owner projections, routes, currentness,
  availability, protected handoffs, ObservableWork phases, alerts, focus, and return context without owning provider,
  source-control, backup, scheduler, encryption/key, connector, auth, Doctor, notification-store, or status truth.
  Every packet action remains visibly truthful and unavailable until its owner and central runtime integration exist.
gui_related: true
gui_classification_reason: This unit defines canonical shell identity, shared visual components, routes, copy, protected states, progress, alerts, themes, accessibility, and responsive behavior.
split_recommended: false
depends_on: [F3-019, F3-042, F3-043, F3-049, F3-050, F3-229, F3-448, F3-453, F3-460, F3-461, F3-476, F3-481, F3-519, F3-520, F3-522, SSYS-026, PWIZ-025, N2-156, SRV-013, FGI-012, BRS-012, BRS-013, BRS-014, BRS-015, BRS-016, RAS-015]
unblocks: []
acceptance_criteria:
  - The left Activity Bar retains exactly ten canonical occupants and replaces `github_actions` one-for-one with `repository_automation`; label, tooltip, palette, help, route, planned Slint host, order, hidden/More state, keyboard slot, width, dock/undock state, and window identity say `Actions & Pipelines` without adding a forge-specific or second rail icon.
  - Legacy `github_actions` routes and panel-state keys are migration-read aliases only. They normalize to the same `repository_automation` occupant with a GitHub automation binding, preserve GitHub pins and subview/focus/log position, and never create duplicate panels or discard GitHub Current Branch, Workflows, Settings, rerun, or log-recovery behavior.
  - The automation header selects an `AutomationBinding` only when multiple services apply. Repository hosting and automation may target different providers/instances; exact project/repository/binding/currentness identity travels in routes and actions rather than being inferred from the Git remote.
  - Provider-neutral regions cover repository/automation context, current checks, pinned definitions, definitions/workflows/pipelines, runs, gates/approvals, stage/job/step detail when supported, logs/trace, artifacts, manual dispatch, runners/secrets/variables, and external/unsupported explanation. Capability refresh never reorders icons or jumps focus.
  - Provider headings remain native: GitHub Actions, GitLab Pipelines, Forgejo Actions, and Gitea Actions only when the selected binding proves them. Forgejo and Gitea use distinct instance/capability profiles; API-disabled/Git-ready remains truthful; Bitbucket Data Center without configured CI says `Connect automation service`; Origin never fabricates `Origin Actions`.
  - Backup presentation reuses exact owner-routed `DestinationCard`, `ScopeCoverageSummary`, `SnapshotBrowser`, `RestorePreview`, `RecoveryKitHandoff`, `VerificationBadge`, `RetentionPreview`, and `ObservableWorkProgress` components. It creates no Backup Activity Bar occupant, page owner, command family, engine, scheduler, or notification center.
  - Data Backup and Retention shows explicit Server or Project scope, protected coverage, destinations, encryption, Last complete remote backup receipt time, verification/drill state, Recovery Kit status, `[Back Up Now] [Restore…] [Add Destination]`, and truthful disabled reasons. Storage sign-in and decryption readiness remain separate.
  - Snapshot Browse is read-only and binds immutable repository/snapshot/capture-set identity. Download returns only to the initiating Client, extract requires an explicit authorized Host/path, compare binds immutable and current identities, export is disclosed as a non-restore artifact, and none activates or executes a Project.
  - Archive retrieval presents capability, wait, possible fee/cost without a hard-coded price, explicit human consent, external-effect/indeterminate outcome, phase-based ObservableWork, cancellation/recovery truth, and exact reverse focus. No billable action starts from visibility or stale projection.
  - RecoveryKitHandoff is human-only, step-up protected, no-store, initiating-Client bound, non-recordable, and absent from agent/NL/API automation, Doctor, screenshots, recordings, ordinary clipboard history, logs, Chat, Usage, and concept fixtures. It shows masked/non-secret state and never Recovery Key/Kit bytes.
  - Backup failures and reminders reuse the F3-453 alert store, F3-460 title-bar stack, and F3-461 sprout inbox. Bottom/status may say `Backing up`, `Waiting for source`, `Restore in progress`, or `Backup needs attention`; it does not add a bell, toast center, rail panel, routine `Synced`, or model-token usage statistic.
  - Remote Access disconnected presentation is exactly `Tailscale` / `Built into Puppet Master` / `Not connected` / `[Set Up]`. Hosted ready, self-hosted Headscale, reauth, connector starting/restarting/crashed/corrupt/protocol-mismatch, route failure, private ready, and hosted Funnel preflight/ready states remain distinct; Headscale never shows Funnel and private access has no normal Serve toggle.
  - Setup projects the Server-owned connector phases Starting Puppet Master connection, Opening Tailscale sign-in, Waiting for authorization, Waiting for device approval, Creating private address, Testing web UI, API, and live connection, and Ready. The operation survives refresh/Client loss while protected browser content remains authorized-Client bound; exact origin/focus return is preserved.
  - Advanced `Connection engine` may show bounded redacted connector/tsnet build/protocol, control kind, Headscale origin, node/DNS and endpoint IDs, process/IPC/state/listener/binding health, last auth/test, logs, and owner repair/reset routes. It never shows private/auth/pre-auth keys, raw state, reusable authorization URLs, browser content/cookies, IPC secrets, or a backend selector.
  - Browser copy states that PM-native connector egress does not enroll an ordinary browser; private browser access still needs user-managed reachability or an approved public/other route. Funnel remains hosted-only, public, off by default, consent/preflight gated, and separable from private/LAN/proxy/Remote Link operation.
  - F3-520 keeps the exact nine/six Product Onboarding stage graphs and Review hard fence. Bootstrap Full Server recovery renders before Product Onboarding after safe local claim; the Product `Restore a backup` route stays Project-scoped, and post-first-Project destination/Recovery Kit setup uses owner projections only.
  - F3-522 consumes N2-156's independent Backup and connector findings. Optional-off or inapplicable targets do not paint global degradation; Doctor never installs, authenticates, decrypts, unlocks, exports, prunes, restores, or resets identity without an explicit owner-routed destructive flow.
  - All eight PMConcept7 themes, selected K3 geometry, representative narrow/default/wide widths, variable-height virtualization, keyboard/touch, stable focus, non-color status, screen readers, localization, Reduced Motion, and phase-based non-fake progress apply to every new state. Browser-concept or static fixture results remain `concept_fixture_only`, never native Slint/runtime/visual/security/performance/accessibility evidence.
  - No command or EventRecord is admitted by this GUI unit. All new Forge, Backup, and connector command families remain handler_unavailable and event-silent with expected_event_types=[] until owner schema, central command, sole handler, permission, receipt/ObservableWork, persistence, production/reverse wiring, and executable evidence close independently.
validation_surfaces:
  - Plans/final_gui_interaction_contracts.schema.json
  - Plans/final_gui_interaction_contract_fixtures.json
  - Plans/forge_integration_contracts.schema.json
  - Plans/backup_restore_system_contracts.schema.json
  - Plans/remote_access_system_contracts.schema.json
  - future legacy-panel migration/no-duplicate-occupant and provider-capability transition fixtures
  - future protected-handoff/no-capture and immutable-snapshot exact-return fixtures
  - future native Slint eight-theme/width/keyboard/touch/Reduced-Motion/virtualization tests
risk_class: generic_shell_migration_or_protected_recovery_presentation_leak
reasoning_tier: high
context_scope: final_gui_forge_backup_tsnet_consumers
implementation_surfaces: [Plans/FinalGUISpec.md, future repository automation Slint components, future K3 Backup Slint components, future Onboarding Slint components, future Doctor Slint components, future Remote Access Slint components]
node_compile_hint: {mode: final_gui_cross_owner_consumer_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_forge_reconciliation.md#finalgui-strings-routes-and-planned-ui-file-inventory
  - scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/backup_cross_owner_patch_map.md#4.2
  - scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_tsnet_reconciliation.md#4
  - packet:04_LEFT_RAIL_AND_CAPABILITY_DRIVEN_GUI.md#GUI-001
  - packet:04_LEFT_RAIL_AND_CAPABILITY_DRIVEN_GUI.md#GUI-005
  - packet:04_LEFT_RAIL_AND_CAPABILITY_DRIVEN_GUI.md#GUI-008
  - packet:12_BACKUP_SETTINGS_ONBOARDING_DOCTOR.md
  - packet:tsnet/04_GUI_ONBOARDING_DOCTOR_DELTAS.md
preserved_exact_tokens: [repository_automation, Actions & Pipelines, github_actions, DestinationCard, ScopeCoverageSummary, SnapshotBrowser, RestorePreview, RecoveryKitHandoff, VerificationBadge, RetentionPreview, ObservableWorkProgress, Tailscale, Built into Puppet Master, Connection engine, K3 Tome Tabs, PMConcept7, handler_unavailable, "expected_event_types=[]"]
negative_constraints:
  - Do not add a Backup, Tailscale, forge-specific, Server, Sync, or second Activity Bar item or notification center.
  - Do not merge Source Control with Actions & Pipelines, or erase GitHub-specific semantics while migrating the generic host shell.
  - Do not conflate Forgejo with Gitea, Git transport with API readiness, repository hosting with automation binding, or Origin checks with an Origin-hosted CI engine.
  - Do not display or capture Recovery Key/Kit bytes, connector secrets/state, provider credentials, protected browser content, reusable auth URLs, cookies, IPC secrets, raw paths, or unbounded logs.
  - Do not let browse/download/extract/compare/export/archive retrieval imply restore activation or Project execution.
  - Do not add a Product Onboarding stage, bypass Review, or move Bootstrap/Backup/Remote Access/Forge/Doctor/notification/status ownership into Final GUI.
  - Do not restore Serve/full-package/sidecar/daemon/TUN/backend-selector UI or imply an ordinary browser is enrolled by tsnet.
  - Do not alter K3 layout or PM7 theme authority, revive a GUI bakeoff, or hand-edit generated PMConcept7 HTML as source truth.
  - Do not claim handler, EventRecord, provider, crypto, restore, connector, native Slint, runtime, visual, security, performance, accessibility, readiness, or certification proof from Plans/static/concept material.
owner_boundary_notes:
  - Final GUI owns shared presentation, shell identity, components, themes, motion, accessibility, focus, and routes only; Forge, Backup/Restore, Remote Access, Planning Wizard, Doctor, notification, and status owners retain semantic truth and effects.
owner_hints: [Plans/FinalGUISpec.md, Plans/Forge_Integrations.md, Plans/Backup_Restore_System.md, Plans/Remote_Access_System.md, Plans/Planning_Wizard.md, Plans/newtools.md, Plans/Settings_System.md]
```
