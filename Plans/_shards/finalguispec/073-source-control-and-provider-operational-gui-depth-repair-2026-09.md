# Shard 073: Source Control And Provider-Operational GUI Depth Repair - 2026-09-02

Source: `Plans/FinalGUISpec.md`

Source lines: L35680-L35838

Source SHA256: `342462919f6e41f5f85d7c9e4eaf265d109a277d8ac29b0b7343a69abd20694c`

---

## Source Control And Provider-Operational GUI Depth Repair - 2026-09-02

### F3-529 - Source Control, Reviews, Actions And Pipelines, And Related-Surface Semantics

```yaml
plan_unit_id: F3-529
unit_type: integration_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Source Control header identifies repository/workspace plus compact local-engine and hosting-service labels;
  its detail disclosure shows Home Server, Execution Environment, Source Location path, distinct remote fetch
  and push targets, authentication, and observed revision without overloading the header with infrastructure.
  Its minimum section census is changes/diff; Git staging/commit or Jujutsu Current Change; branch/bookmark
  tracking; remotes/publication; history/graph; conflicts; Git-only stashes; worktrees/workspaces; review requests;
  changed files/comments/checks; recovery/Jujutsu operation history; and source-protection/Backup route. Every
  additional live section is retained or explicitly migrated. Git renders Staged/Unstaged, index-aware diff,
  Commit, stash, branches/upstream, and Worktrees. Jujutsu renders Current Change @, description and parent/change
  context, New Change/Edit/Split/Squash/Abandon, bookmarks/tracking, stable change ID plus current commit ID,
  rewritten/abandoned/conflicted state, local/remote bookmarks, Workspaces, and Operation History; staging and
  stash are hidden, operation restore is previewed and distinct from Backup, and no UI-only action hides a Git
  mutation. Reviews use one common list shell while detail preserves Pull request or Merge request vocabulary,
  native status, source/target refs, author, draft, permissions, threads, checks, and currentness. Publish preview
  shows the actual destination/refspec, Origin mirror write-through, protection, and CI/cost effects. Publish and
  review creation are separate unless one explicit combined preview lists both effects; expected-head fencing,
  remote limitation reasons, per-target fan-out outcome, outcome_unknown, and API-unavailable/push-ready states
  remain visible, with no blanket Origin read-only badge. `ui.source_control.profile.preview` is a typed owner-local
  view action that lets the concept or future comparison surface switch between Git and Jujutsu presentation without
  changing the Project's configured backend, repository binding, workspace, history, or persistent state. Actions &
  Pipelines selects AutomationBinding only when more than one service applies and shows current revision checks, pinned and available definitions, active/recent
  runs, queued/scheduled/manual gates, run detail, native stage/job/step hierarchy or the provider's available
  trace, streamed logs, artifacts/retention, environments/deployments/approvals, runner/secrets/variables links,
  and external/unsupported explanation. `ui.repository_automation.binding.select` is a typed owner-local action
  that changes only which already-authorized AutomationBinding presentation is selected; it registers no domain
  command or semantic handler, emits no domain EventRecord, grants no provider authority, and mutates neither the
  repository binding nor the AutomationBinding. `ui.source_control.backup_history.open` is a typed owner-local,
  read-only navigation action that carries exact project, repository, immutable revision, Backup-owner route, deep
  link, currentness, accessibility, and return-context identity into the Backup owner; it never requests restore,
  starts restore, or mutates Source Control or Backup state. Provider-native headings and names remain GitHub Actions, GitLab
  Pipelines, Azure Pipelines, Bitbucket Pipelines, Forgejo Actions, or Gitea Actions as proven; Generic Git has no
  invented definitions and Origin checks never imply Origin Actions. Files uses engine-correct decoration/ignore,
  useful repository/source badges, read-only Backup preview, and Restore this file. Artifacts distinguishes
  provider CI artifacts, Puppet Master runtime outputs, and Backup exports while preserving expiry, checksum,
  provenance, explicit import/download, and never auto-executing a download. Testing/Run & Debug may link checks
  and reproduction receipts but does not treat remote CI as local proof. Assistant Chat receives compact
  capability/receipt data without another forge/host banner. Bottom/status shows truthful publication, Backup,
  and connector work without routine Synced, secrets, or Backup-as-token-usage. Cross-panel routes preserve exact
  repository, revision, provider artifact, Backup, and initiating Client/Server destination identity.
gui_related: true
gui_classification_reason: This unit is the canonical detailed user-visible Source Control and Actions & Pipelines interaction contract.
depends_on: [F3-528, SCS-015, SCS-016, FGI-014, FGI-015, GAAAF-016, GAAAF-017]
unblocks: []
acceptance_criteria:
  - Live pre/post inventory maps every Source Control and hosted-admin section, control, state, command, and disposition; the packet minimum is never used to delete an unlisted live section.
  - Git, Jujutsu, and no-forge profiles render at narrow/default/wide widths with stable selection/focus and only engine-valid actions.
  - Protected branch, rejected push, Origin mirror mapping, stale review head, one-to-many partial push, and review-API-unavailable/push-ready fixtures show exact target and outcome truth.
  - Every provider profile consumes the automation section matrix; missing step APIs show a job trace rather than invented steps, and existing pinned GitHub workflows/rerun controls survive.
  - "`ui.source_control.profile.preview` request/result fixtures require an exact current repository projection, selected `git|jj` presentation profile, accessibility and return context, deterministic focus settlement, `presentation_only=true`, `persistent_state_mutation=false`, and false backend/repository/workspace/history mutation facts; it never dispatches `cmd.source_control.backend.select`."
  - "`ui.repository_automation.binding.select` request/result fixtures require at least two explicit candidate AutomationBinding refs, exact selected binding and capability/currentness refs, deterministic return settlement, `presentation_only=true`, `persistent_state_mutation=false`, and false repository/automation mutation facts; the profile has `domain_command_registered=false`, `semantic_domain_handler=null`, and `domain_event_emitted=false`."
  - "`ui.source_control.backup_history.open` request/result fixtures require the Backup owner, `backup_history_repository_revision` route kind, exact repository revision, Backup route and deep-link refs, deterministic target-open settlement, and false restore/source/Backup mutation facts; navigation never implies `cmd.backup.restore.preview`, `cmd.backup.restore.execute`, or any other Backup mutation."
  - Capability transitions ready/auth expired/restored/service disabled/no runner/unsupported/unknown/stale retain saved layout, do not reorder rail icons or jump focus, and expose exact remediation or Open in service behavior.
  - Files, Artifacts, Testing, Chat, and bottom/status deep links preserve exact identities; downloaded provider artifacts never auto-execute and remote CI is never local test proof.
  - Hosted administration renders read/write independently for repository/branch policy, environments/deployment approvals, secrets/variables, runners, and release assets from versioned provider schemas; secret readback and implicit runner registration remain impossible.
validation_surfaces: [Plans/final_gui_interaction_contracts.schema.json, Plans/final_gui_interaction_contract_fixtures.json, Plans/source_control_contracts.schema.json, Plans/source_control_contract_fixtures.json, Plans/forge_integration_contracts.schema.json, Plans/forge_integration_contract_fixtures.json, future native Slint width/theme/keyboard/touch/accessibility/provider fixtures]
risk_class: gui_backend_provider_effect_or_evidence_misrepresentation
reasoning_tier: high
context_scope: source_control_review_automation_and_related_surface_presentation
implementation_surfaces: [Plans/FinalGUISpec.md, Plans/final_gui_interaction_contracts.schema.json, Plans/final_gui_interaction_contract_fixtures.json, future Source Control and repository_automation Slint components]
node_compile_hint: {mode: static_gui_owner_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/04_LEFT_RAIL_AND_CAPABILITY_DRIVEN_GUI.md:15-21
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/04_LEFT_RAIL_AND_CAPABILITY_DRIVEN_GUI.md:23-29
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/04_LEFT_RAIL_AND_CAPABILITY_DRIVEN_GUI.md:31-37
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/04_LEFT_RAIL_AND_CAPABILITY_DRIVEN_GUI.md:39-45
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/04_LEFT_RAIL_AND_CAPABILITY_DRIVEN_GUI.md:55-61
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/05_FORGE_CAPABILITY_AND_AUTH_MATRIX.md:39-45
  - source_ref:corrected-slice:machine__requirements.json__part-004__lines-000601-000820.txt:170-220
  - source_ref:corrected-slice:machine__requirements.json__part-005__lines-000801-001020.txt:4-72
  - source_ref:corrected-slice:machine__requirements.json__part-011__lines-002001-002196.txt:142-158
  - source_ref:corrected-slice:machine__panel_sections.json__part-001__lines-000001-000220.txt:1-220
  - source_ref:corrected-slice:machine__panel_sections.json__part-002__lines-000201-000263.txt:201-263
preserved_exact_tokens: [Staged, Unstaged, Commit, Current Change, New Change, Edit, Split, Squash, Abandon, Operation History, Pull request, Merge request, outcome_unknown, Actions & Pipelines, GitHub Actions, GitLab Pipelines, Azure Pipelines, Bitbucket Pipelines, Forgejo Actions, Gitea Actions, Restore this file, Synced, ui.source_control.profile.preview, ui.repository_automation.binding.select, ui.source_control.backup_history.open, owner_local_typed_ui_controller, backup_history_repository_revision]
negative_constraints:
  - Do not show Git staging/stash in Jujutsu, label Jujutsu edits as unstaged Git, or map a Jujutsu action to hidden Git mutation.
  - Do not infer provider, automation, auth, target, or outcome from remote name, display label, focus, or cached selection.
  - Do not combine publish and review effects without listing both, flatten outcome_unknown to failure, or paint Origin blanket read-only.
  - Do not invent provider steps, workflows, pipelines, definitions, CI engines, admin success, secret readback, or runner registration.
  - Do not register any of these `ui.*` local actions as a domain command, route one through a semantic-domain handler, emit a domain EventRecord, persist a preview or provider/binding selection, dispatch backend selection from the profile preview, change backend/repository/workspace/history/RepositoryForgeBinding/AutomationBinding state, start restore, or mutate Source Control/Backup state.
  - Do not equate provider CI with local proof, auto-execute downloaded artifacts, show routine Synced, expose secret content, or count Backup statistics as model usage.
  - Do not claim native Slint, visual, motion, accessibility, performance, handler, provider, runtime, security, or readiness proof from static Plans/schema/fixtures.
owner_boundary_notes:
  - Final GUI owns shared presentation, shell identity, components, themes, motion, accessibility, focus, routes, and the two typed owner-local request/result profiles only; Forge owns AutomationBinding truth, Backup owns history/restore truth, and all semantic effects remain with their named domain owners.
```

### F3-530 - Reference-Only Security Controls And Post-Integration DRY Reconciliation

```yaml
plan_unit_id: F3-530
unit_type: integration_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Final GUI provides two reusable pure-presentation consumers without becoming a secret, permission, approval,
  authentication, command, or persistence owner. SecretReferenceControl consumes only an owner reference,
  redacted/masked status, typed availability and disabled reason, and a protected owner route. Its choose,
  replace, remove, and open-owner interactions are typed local UI actions: no raw secret enters component state,
  events, logs, receipts, screenshots, Chat, Usage, adapters, or agents, and owner revalidation owns every effect.
  HumanStepUpDialog consumes an owner-authored HumanStepProjection plus exact target, permission, step-up policy,
  protected channel, confirmation, expected generation, currentness, consequence, and return references. It emits
  only a reference-only local response or cancellation settlement; visibility and clicks grant no authority, stale
  targets block owner dispatch, and the semantic owner revalidates immediately before any effect. The dialog is
  used only where an effect-specific security contract requires step-up, never as universal optional-HITL friction.
  The same contract family records the September packet's corrected 27-component DRY reconciliation: 16 exact
  names were already present; eight of eleven absent names map to existing canonical equivalents; SourceGraph,
  SecretReferenceControl, and HumanStepUpDialog receive bounded typed closure. NativeAutomationTree is a
  migration-read/source-lineage alias superseded by NativeJobTree and never becomes a second component.
gui_related: true
gui_classification_reason: These are reusable visible controls/dialogs and a machine-checkable map from packet presentation vocabulary to existing owner projections.
depends_on: [F3-522, F3-528, F3-529, SCS-017, SIR-019, SIR-023, SIR-035, PS-138, PS-139, SMPFS-154, GAAAF-016, N2-153]
unblocks: []
acceptance_criteria:
  - SecretReferenceControl validates only reference/redacted state and the exact choose/replace/remove/open-owner local-action vocabulary; it has no raw-secret readback, store, auth policy, domain command, EventRecord, persistence, capture, adapter, or agent authority.
  - HumanStepUpDialog binds an exact owner projection/target/generation/permission/policy/protected-channel/confirmation/consequence/return set, supports keyboard-complete response and safe cancellation, preserves focus return, and blocks stale-target dispatch.
  - Dialog visibility or button activation never establishes permission or effect authority; only the semantic owner may revalidate and dispatch, and optional HITL is not made universal.
  - The 11-row reconciliation preserves the corrected 27 = 16 + 11 denominator, records eight semantic equivalents and three bounded closures exactly once, and creates no duplicate owner, command, component, or state machine.
  - "`NativeAutomationTree` is accepted only as a migration-read/source-lineage alias to canonical `NativeJobTree`; no second automation hierarchy is registered or rendered."
  - Static schema/fixture evidence retains `runtime_evidence_claimed=false` and `packet_scenarios_claimed_run=false`; it proves no native Slint rendering, protected-channel behavior, handler, security property, scenario, or readiness state.
validation_surfaces:
  - Plans/final_gui_interaction_contracts.schema.json#/$defs/secret_reference_control
  - Plans/final_gui_interaction_contracts.schema.json#/$defs/human_step_up_dialog
  - Plans/final_gui_interaction_contracts.schema.json#/$defs/post_integration_dry_component_reconciliation
  - Plans/final_gui_interaction_contract_fixtures.json
  - Plans/source_control_contracts.schema.json#/$defs/source_graph_projection
  - Plans/source_control_contract_fixtures.json
  - python3 scripts/pm-new-contracts-verify.py
  - future native protected-entry, permission/currentness race, cancellation/focus, accessibility, capture-exclusion, and owner-dispatch tests
risk_class: secret_exposure_dialog_local_authority_or_duplicate_dry_owner
reasoning_tier: high
context_scope: reference_only_security_presentation_and_dry_reconciliation
implementation_surfaces: [Plans/FinalGUISpec.md, Plans/final_gui_interaction_contracts.schema.json, Plans/final_gui_interaction_contract_fixtures.json, future Slint SecretReferenceControl and HumanStepUpDialog]
node_compile_hint: {mode: static_presentation_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/machine/dry_components.json:6-61
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/semantic_gap_plan_rerun/semantic_gap_plan.json
  - Plans/Source_Control_System.md#SCS-017
  - Plans/Shared_Integration_Runtime.md#SIR-019
  - Plans/Shared_Integration_Runtime.md#SIR-023
  - Plans/Shared_Integration_Runtime.md#SIR-035
  - Plans/Permissions_System.md#PS-138
  - Plans/Permissions_System.md#PS-139
  - Plans/newtools.md#N2-153
preserved_exact_tokens: [CapabilityReason, EngineSpecificChanges, SourceGraph, WorkspaceSelector, RemotePublicationPreview, NativeAutomationTree, NativeJobTree, PipelineRunSummary, SecretReferenceControl, AuthSessionProgress, HumanStepUpDialog, DoctorHealthProjection]
negative_constraints:
  - Do not model raw credentials, tokens, passwords, keys, cookies, authorization codes, verifiers, private material, or credential-bearing paths in Final GUI state or evidence.
  - Do not let presentation visibility, a button click, readable metadata, cached permission, or stale projection grant authority or prove an effect.
  - Do not turn local UI actions into domain commands, register a new event family, duplicate semantic owners, or let dialogs dispatch directly.
  - Do not add NativeAutomationTree beside NativeJobTree or create duplicate capability, workspace, publication, pipeline, auth, or Doctor projections.
  - Do not claim native/runtime/security/accessibility/performance evidence or any executed packet scenario from static contracts and fixtures.
```
