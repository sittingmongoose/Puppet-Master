# Shard 057: Projects refresh exact primary registration roster

Source: `Plans/UI_Command_Catalog.md`

Source lines: L18066-L19565

Source SHA256: `7b467b43baf897393cd88e21c11194dd66ee829975f02701893e6910b94bc137`

---

## Projects refresh exact primary registration roster

All 28 identities below are planned canonical primaries; all native handlers remain `handler_unavailable`. Persona save_as_override was declared by its owner but is newly added to the central primary roster. The new binding companion contains full per-route permission/currentness/return, state selectors and error/refusal contracts. No sixth Settings primary, fake import, command-file primary, cmd.projects read family or thread facade primary is admitted.

| Command | Label / description | Preconditions | command_kind | Normalization | Owner | Sole planned handler | Request | Result | Confirmation / effect |
|---|---|---|---|---|---|---|---|---|---|
| `cmd.chat.place.set` | draft Where chooser | Draft-only selected authorized Computer; fixed after first message | domain_action | canonical; alias_of_command_id=null | Plans/assistant-chat-design.md#ACD-508 | `handlers::assistant_chat::place_set` | `Plans/assistant_chat_contracts.schema.json#/$defs/ChatPlaceSetRequest` | `Plans/assistant_chat_contracts.schema.json#/$defs/ChatPlaceSetResult` | Regular person; explicit task/destination YOLO only for admitted conversion; protected guards remain; draft place only, no thread creation, folder creation or EventRecord |
| `cmd.chat.move.preview` | both conversion choices and live preview | Exact source thread and explicit new/existing destination; neither conversion is preselected | domain_action | canonical; alias_of_command_id=null | Plans/assistant-chat-design.md#ACD-510 | `handlers::assistant_chat::move_preview` | `Plans/assistant_chat_contracts.schema.json#/$defs/ChatMovePreviewRequest` | `Plans/assistant_chat_contracts.schema.json#/$defs/ChatMovePreviewResult` | read_only; read-only plain statement/current manifest preview; no owner effect |
| `cmd.chat.move.apply` | named conversion commit and guarded agent route | Current unambiguous destination/preview; source approvals settled, active work/timers safely fenced | domain_action | canonical; alias_of_command_id=null | Plans/assistant-chat-design.md#ACD-510 | `handlers::assistant_chat::move_apply` | `Plans/assistant_chat_contracts.schema.json#/$defs/ChatMoveApplyRequest` | `Plans/assistant_chat_contracts.schema.json#/$defs/ChatMoveResult` | Regular person; explicit task/destination YOLO only for admitted conversion; protected guards remain; one owner-composed copy/check/Project listing/cutover/report; source history sealed, one live writer |
| `cmd.chat.move.resume` | paused conversion Resume | Existing paused operation, current source and destination Servers and cutover claim | domain_action | canonical; alias_of_command_id=null | Plans/assistant-chat-design.md#ACD-510 | `handlers::assistant_chat::move_resume` | `Plans/assistant_chat_contracts.schema.json#/$defs/ChatMoveResumeRequest` | `Plans/assistant_chat_contracts.schema.json#/$defs/ChatMoveResult` | Regular person; explicit task/destination YOLO only for admitted conversion; protected guards remain; resume only remaining owner effects under retained operation; no replay of settled steps |
| `cmd.chat.move.cancel` | paused or active conversion Cancel | Current retained operation, safe-boundary rollback and exact eligible file manifest | domain_action | canonical; alias_of_command_id=null | Plans/assistant-chat-design.md#ACD-510 | `handlers::assistant_chat::move_cancel` | `Plans/assistant_chat_contracts.schema.json#/$defs/ChatMoveCancelRequest` | `Plans/assistant_chat_contracts.schema.json#/$defs/ChatMoveResult` | Regular person; explicit task/destination YOLO only for admitted conversion; protected guards remain; owner safe cancellation/rollback; truthful partial recovery, never delete a remote repository |
| `cmd.chat.move.undo.preview` | report/divider/notification Undo preview | No new work and at most seven days; held files/Servers and revisions resolvable | domain_action | canonical; alias_of_command_id=null | Plans/assistant-chat-design.md#ACD-510 | `handlers::assistant_chat::move_undo_preview` | `Plans/assistant_chat_contracts.schema.json#/$defs/ChatMoveUndoPreviewRequest` | `Plans/assistant_chat_contracts.schema.json#/$defs/ChatMoveUndoPreviewResult` | read_only; read-only exact inverse and eligibility, no effect |
| `cmd.chat.move.undo.apply` | named Undo commit | Fresh inverse preview; both Servers for cross-Computer Undo; no Stop clearing or automatic resume | domain_action | canonical; alias_of_command_id=null | Plans/assistant-chat-design.md#ACD-510 | `handlers::assistant_chat::move_undo_apply` | `Plans/assistant_chat_contracts.schema.json#/$defs/ChatMoveUndoApplyRequest` | `Plans/assistant_chat_contracts.schema.json#/$defs/ChatMoveResult` | Regular person; explicit task/destination YOLO only for admitted conversion; protected guards remain; inverse only eligible unchanged writes; list-only remove for a new Project; preserve remote repos/branches/backups and independent canonical custody |
| `cmd.chat.continue_elsewhere` | Where/Chat details Continue elsewhere | Actual authorized chosen Computer available; original remains at its fixed Computer | domain_action | canonical; alias_of_command_id=null | Plans/assistant-chat-design.md#ACD-508 | `handlers::assistant_chat::continue_elsewhere` | `Plans/assistant_chat_contracts.schema.json#/$defs/ChatContinueElsewhereRequest` | `Plans/assistant_chat_contracts.schema.json#/$defs/ChatContinueElsewhereResult` | Regular person; explicit task/destination YOLO only for admitted conversion; protected guards remain; new linked chat on chosen Computer, never a live host retarget |
| `cmd.chat.incoming.accept` | From another chat Accept | Current incoming request and receiver actor/Off/mode/permission ceiling | domain_action | canonical; alias_of_command_id=null | Plans/assistant-chat-design.md#ACD-509 | `handlers::assistant_chat::incoming_accept` | `Plans/assistant_chat_contracts.schema.json#/$defs/ChatIncomingDecisionRequest` | `Plans/assistant_chat_contracts.schema.json#/$defs/ChatIncomingDecisionResult` | Regular person; explicit task/destination YOLO only for admitted conversion; protected guards remain; receiver-owned acceptance of exact request; normal turn only under receiver authority |
| `cmd.chat.incoming.decline` | From another chat Decline | Current receiver-owned request; return to its receiving chat | domain_action | canonical; alias_of_command_id=null | Plans/assistant-chat-design.md#ACD-509 | `handlers::assistant_chat::incoming_decline` | `Plans/assistant_chat_contracts.schema.json#/$defs/ChatIncomingDecisionRequest` | `Plans/assistant_chat_contracts.schema.json#/$defs/ChatIncomingDecisionResult` | Regular person; explicit task/destination YOLO only for admitted conversion; protected guards remain; receiver-owned decline, no requested work |
| `cmd.chat.chat_folder.open` | chat folder Open in Files | Real existing app folder and current read access; missing folder is a refusal | navigation_wrapper | canonical; alias_of_command_id=null | Plans/assistant-chat-design.md#ACD-508 | `handlers::assistant_chat::chat_folder_open` | `Plans/assistant_chat_contracts.schema.json#/$defs/ChatFolderRoute` | `Plans/assistant_chat_contracts.schema.json#/$defs/RouteResult` | read_only; exact folder navigation; no mkdir, mutation or EventRecord |
| `cmd.chat.chat_folder.delete` | explicit unchecked-by-default folder deletion choice | Explicit selected content/root; current deletion preview, authority and retention holds | domain_action | canonical; alias_of_command_id=null | Plans/assistant-chat-design.md#ACD-508 | `handlers::assistant_chat::chat_folder_delete` | `Plans/assistant_chat_contracts.schema.json#/$defs/ChatFolderDeleteRequest` | `Plans/assistant_chat_contracts.schema.json#/$defs/ChatFolderDeleteResult` | Regular person; explicit task/destination YOLO only for admitted conversion; protected guards remain; exact selected folder/content deletion under holds/FileSafe/destructive admission, distinct from chat tombstone |
| `cmd.persona.save_as_override` | Owner manager copy/Save Project version; Settings Transfer/New Project/onboarding/Saved setups whole-thing contribution | Actual chosen destination Project is required for a whole eligible Project override; exact source ID/revision/hash, target CAS and protected-ID policy. No Projectless override target, built-in shadow or duplicate alias. | domain_action | canonical; alias_of_command_id=null | Plans/Personas.md#P-060 | `handlers::persona::save_as_override` | `Plans/shared_integration_runtime.schema.json#/$defs/persona_save_as_override_request` | `Plans/shared_integration_runtime.schema.json#/$defs/persona_save_as_override_result` | owner_policy; Exact whole owner record/reach/switch copy with source hash and destination CAS; typed readback and compensation. No per-field merge, install, executable trust, credentials, private plugin data or live workflow content. |
| `cmd.mcp.server.copy` | Owner manager copy/Save Project version; Settings Transfer/New Project/onboarding/Saved setups whole-thing contribution | Exact owned source, declared destination home/reach/Project version; protected IDs and externally managed records refuse | domain_action | canonical; alias_of_command_id=null | Plans/MCP_Integration.md#MI-044 | `handlers::mcp::copy_server` | `Plans/shared_integration_runtime.schema.json#/$defs/mcp_server_copy_request` | `Plans/shared_integration_runtime.schema.json#/$defs/mcp_server_copy_result` | owner_policy; Exact whole owner record/reach/switch copy with source hash and destination CAS; typed readback and compensation. No per-field merge, install, executable trust, credentials, private plugin data or live workflow content. |
| `cmd.skill.copy` | Owner manager copy/Save Project version; Settings Transfer/New Project/onboarding/Saved setups whole-thing contribution | Exact owned source, declared destination home/reach/Project version; protected IDs and externally managed records refuse | domain_action | canonical; alias_of_command_id=null | Plans/Skills_System.md#SS-039 | `handlers::skills::copy` | `Plans/shared_integration_runtime.schema.json#/$defs/skill_copy_request` | `Plans/shared_integration_runtime.schema.json#/$defs/skill_copy_result` | owner_policy; Exact whole owner record/reach/switch copy with source hash and destination CAS; typed readback and compensation. No per-field merge, install, executable trust, credentials, private plugin data or live workflow content. |
| `cmd.plugin.copy_configuration` | Owner manager copy/Save Project version; Settings Transfer/New Project/onboarding/Saved setups whole-thing contribution | Exact owned source, declared destination home/reach/Project version; protected IDs and externally managed records refuse | domain_action | canonical; alias_of_command_id=null | Plans/Plugins_System.md#PLUG-071 | `handlers::plugins::copy_configuration` | `Plans/plugin_contracts.schema.json#/$defs/PluginCopyConfigurationRequest` | `Plans/plugin_contracts.schema.json#/$defs/PluginCopyConfigurationResult` | owner_policy; Exact whole owner record/reach/switch copy with source hash and destination CAS; typed readback and compensation. No per-field merge, install, executable trust, credentials, private plugin data or live workflow content. |
| `cmd.server.settings_home.move` | Servers Keeps your settings; Settings home recovery; Clients/Doctor | Same-owner explicit target, current local claim/session/trust/role/protocol; no automatic election or stale-copy promotion | domain_action | canonical; alias_of_command_id=null | Plans/Server_System.md#SRV-016 | `handlers::server::settings_home_move` | `Plans/server_system_contracts.schema.json#/$defs/settings_home_move_request` | `Plans/server_system_contracts.schema.json#/$defs/settings_home_move_result` | owner_policy; Move preview/apply uses one writer-role generation switch after verified copy and old-writer fencing; peer trust only start/approve/reject/cancel/revoke for settings.follow, never Project/content authority. Join data choices use Settings transactions. |
| `cmd.server.settings_peer_trust` | Servers Keeps your settings; Settings home recovery; Clients/Doctor | Same-owner explicit target, current local claim/session/trust/role/protocol; no automatic election or stale-copy promotion | domain_action | canonical; alias_of_command_id=null | Plans/Server_System.md#SRV-016 | `handlers::server::settings_peer_trust` | `Plans/server_system_contracts.schema.json#/$defs/settings_peer_trust_command_request` | `Plans/server_system_contracts.schema.json#/$defs/settings_peer_trust_command_result` | owner_policy; Move preview/apply uses one writer-role generation switch after verified copy and old-writer fencing; peer trust only start/approve/reject/cancel/revoke for settings.follow, never Project/content authority. Join data choices use Settings transactions. |
| `cmd.project.rename` | Projects/New Project/onboarding/conversion-to-new; source Details/Contribute/Doctor | Real target/current listing for rename/add; inspection permits explicit unregistered source_context with actual Computer/Host/Environment/transport/locator and no fake Project or writer lease | domain_action | canonical; alias_of_command_id=null | Plans/Project_System.md#PJCT-012 | `handlers::project::rename` | `Plans/project_system_contracts.schema.json#/$defs/project_action_request_v2` | `Plans/project_system_contracts.schema.json#/$defs/project_action_result_v2` | owner_policy; Metadata display_name/revision/timestamp only, preserving folder/repository/Vault/ID and interior spaces |
| `cmd.source_control.repository.inspect` | Projects/New Project/onboarding/conversion-to-new; source Details/Contribute/Doctor | Real target/current listing for rename/add; inspection permits explicit unregistered source_context with actual Computer/Host/Environment/transport/locator and no fake Project or writer lease | domain_action | canonical; alias_of_command_id=null | Plans/Source_Control_System.md#SCS-025 | `handlers::source_control::repository_inspect` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request_v2` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result_v2` | owner_policy; Read-only bounded source inspection, no snapshot/hooks/filters/helpers, linking, origin trust or network mutation; explicit partial/omitted evidence |
| `cmd.source_control.remote.add` | Projects/New Project/onboarding/conversion-to-new; source Details/Contribute/Doctor | Real target/current listing for rename/add; inspection permits explicit unregistered source_context with actual Computer/Host/Environment/transport/locator and no fake Project or writer lease | domain_action | canonical; alias_of_command_id=null | Plans/Source_Control_System.md#SCS-025 | `handlers::source_control::remote_add` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_request_v2` | `Plans/source_control_contracts.schema.json#/$defs/source_control_command_result_v2` | owner_policy; Actual backend local remote configuration add, no overwrite of taken names, network/auth/publish or Git fallback for JJ |
| `cmd.permissions.create_computer_rule` | Permissions manager; explicit Always scope; FileSafe approved list; copy preview | Actual owner Computer and human durable-choice authority; current rule/source acceptance refs | domain_action | canonical; alias_of_command_id=null | Plans/Permissions_System.md#PS-144 | `handlers::permissions::create_computer_rule` | `Plans/automation_authority_contracts.schema.json#/$defs/computer_rule_create_request` | `Plans/automation_authority_contracts.schema.json#/$defs/computer_rule_create_result` | owner_policy; Human durable rule at exact tagged Computer, normalized pattern/action/revision with owner readback; no preselected scope or Everywhere path rule |
| `cmd.build_grant.preview` | Exact Plan approval; Orchestrator grant Details/What the build did; Permissions revocation/History | Real Project/exact Plan/build/target/permission/Stop epoch; current preview for approve and current grant for revoke | domain_action | canonical; alias_of_command_id=null | Plans/Permissions_System.md#PS-147 | `handlers::permissions::build_grant_preview` | `Plans/automation_authority_contracts.schema.json#/$defs/build_grant_preview_request` | `Plans/automation_authority_contracts.schema.json#/$defs/build_grant_preview_result` | read_only; Read-only exact operations/resource/target manifest and blockers; no grant or run |
| `cmd.build_grant.approve` | Exact Plan approval; Orchestrator grant Details/What the build did; Permissions revocation/History | Real Project/exact Plan/build/target/permission/Stop epoch; current preview for approve and current grant for revoke | domain_action | canonical; alias_of_command_id=null | Plans/Permissions_System.md#PS-147 | `handlers::permissions::build_grant_approve` | `Plans/automation_authority_contracts.schema.json#/$defs/build_grant_approve_request` | `Plans/automation_authority_contracts.schema.json#/$defs/build_grant_approve_result` | authenticated human exact authority; One canonical human-approved Plan/revision/hash/build/resource grant, absent/revision CAS and issuer evidence |
| `cmd.build_grant.revoke` | Exact Plan approval; Orchestrator grant Details/What the build did; Permissions revocation/History | Real Project/exact Plan/build/target/permission/Stop epoch; current preview for approve and current grant for revoke | domain_action | canonical; alias_of_command_id=null | Plans/Permissions_System.md#PS-147 | `handlers::permissions::build_grant_revoke` | `Plans/automation_authority_contracts.schema.json#/$defs/build_grant_revoke_request` | `Plans/automation_authority_contracts.schema.json#/$defs/build_grant_revoke_result` | authenticated human exact authority; Canonical grant revision/revocation epoch fences future dispatch; no automatic rollback |
| `cmd.computer_use.stop` | Visible computer-use strip Stop; double-Esc; session action list | Exact current session and controller generation; supported admitted runtime. Never target another session or a global mouse owner. | domain_action | canonical; alias_of_command_id=null | Plans/Tools.md#T-186 | `handlers::computer_use::stop` | `Plans/computer_use_contracts.schema.json#/$defs/ComputerUseStopRequest` | `Plans/computer_use_contracts.schema.json#/$defs/ComputerUseStopResult` | owner_policy; Stop/fence only this actual chat/Computer/desktop/controller session and release only its controller; repeated Stop returns original/settled state |
| `cmd.server.ssh.trust` | Servers/SSH computer setup host fingerprint review; New Project/Onboarding/Settings/Doctor SSH consumers | Protected human preview/apply on the initiating active Client; exact captured Server/SSH target and current preview; handler_unavailable until native proof | domain_action | canonical; alias_of_command_id=null | Plans/Server_System.md#SRV-018 | `handlers::server::ssh_host_trust` | `Plans/server_system_contracts.schema.json#/$defs/SshHostTrustCommandRequestV1` | `Plans/server_system_contracts.schema.json#/$defs/SshHostTrustCommandResultV1` | owner_policy; Preview is bounded read-only and does not trust a host. Apply pins only the exact observed host/port/key in the existing Server SSH host-trust owner; a changed key blocks the old preview and requires a fresh explicit replacement preview/human decision showing both fingerprints; no silent replacement or unrelated trust widening. |
| `cmd.server.ssh.public_key.install` | Shared SSH key-list public-key installation; Servers/SSH computer setup; New Project/Onboarding/Settings/Doctor | Protected human preview/apply on the initiating active Client; exact captured Server/SSH target and current preview; handler_unavailable until native proof | domain_action | canonical; alias_of_command_id=null | Plans/Server_System.md#SRV-018 | `handlers::server::ssh_public_key_install` | `Plans/server_system_contracts.schema.json#/$defs/SshPublicKeyInstallCommandRequestV1` | `Plans/server_system_contracts.schema.json#/$defs/SshPublicKeyInstallCommandResultV1` | owner_policy; Preview reads only the admitted exact account/key/authorized_keys state. Apply installs only the selected shared-list public-key reference into that remote account under captured authorized_keys CAS, preserves all unrelated entries, rejects weak keys before reuse, and requires exact durable readback. Symlink/unsafe permissions or unsupported remote atomicity refuses before write; no shell fallback, permission loosening, private-key transfer, credential copy or speculative remote repair. |


### UCC-214 - Projects Refresh Settings

```yaml
plan_unit_id: UCC-214
unit_type: integration_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: 'Exactly five Settings primaries consume offered level/key, the single resolver, per-setting
  CAS, exact owner readback and return. All chats/All editors/All terminals uses Everywhere. Human rows
  edit their origin; agent edits use SSYS-065. Library things retain their home/reach/whole Project versions
  and sole owner. Computer installations, credentials and protected source trust never travel in copy.
  Origin-word/Details/Changed/Varies menus are local. Commands & Shortcuts retains exactly eight commands.*
  local owner actions through handlers::commands::apply_local_action, not cmd.commands.custom.*. Exact
  command identities: cmd.persona.save_as_override, cmd.mcp.server.copy, cmd.skill.copy, cmd.plugin.copy_configuration,
  cmd.server.settings_home.move, cmd.server.settings_peer_trust, cmd.settings.open, cmd.persona.create,
  cmd.persona.delete, cmd.persona.duplicate, cmd.persona.export, cmd.persona.import, cmd.persona.select,
  cmd.persona.update, cmd.settings.export, cmd.settings.transaction.apply, cmd.settings.transaction.preview,
  cmd.settings.transaction.rollback, cmd.editor.appearance.set. Native availability remains handler_unavailable.
  Resolve the selected WorkflowScopeV2: application has an actual Server/Computer, scope_partition=app
  and project_id=null, with owner-required thread or pre-message draft and Host/root identity. Server-owned
  pause/trust/home operations use their actual Server scope without fabricating a thread; view-only and
  metadata reads require only their declared owner targets. Project operations use actual immutable Project
  identity. Never use focus, an empty ID, a sentinel Project, HOME or CWD as authority. Permissions PS-144–148
  alone composes actual human|mode|build_grant evidence with retained FileSafe, trust, secrets, capabilities,
  root and parent/receiver ceilings. An app chat or copied receipt conveys no Project mutation/build-grant
  authority. Validate the exact operation-declared source/target refs and revisions/hashes. Mutation/execution
  rechecks the sole writer/lease, permission and Stop/pause/revocation generations at entry and immediately
  before effect. Read/navigation/local paths validate their declared read target/source/view generation;
  they do not demand a write lease merely to inspect. Owner-admitted stale/as-of read-only presentation
  never claims fresh authority or enables effects. Same idempotency key/digest returns the original result;
  conflict or dedupe unavailable performs no effect. Preserve initiating Client, captured source scope/object,
  invocation/correlation token, route, focus, context revision and continuation generation/expiry; return
  the exact owner result, refusal or paused recovery there. Never retarget to a newly focused tab. A late
  capture, attachment or draft insertion preserves both the originating thread AND composer destination,
  or refuses before draft mutation. Every selected request/result/source and active writer/read/backup/retention
  graph is adopted together or remains unavailable. Plans/projects_refresh_command_bindings.json enumerates
  exact commands, local actions, schema pointers, handlers, selectors and producer contracts; expected_event_types=[]
  for each new primary grants no event admission. Native handlers, runtime receipts, visual/accessibility
  evidence and governance certification remain unproved. Protected SSH is owned by SRV-018/RAS-017: cmd.server.ssh.trust
  -> handlers::server::ssh_host_trust and cmd.server.ssh.public_key.install -> handlers::server::ssh_public_key_install
  use the selected Server SshHostTrustCommandRequestV1/ResultV1 and SshPublicKeyInstallCommandRequestV1/ResultV1.
  Both have preview|apply phases on the initiating active Client; preview is bounded read-only and apply
  requires a protected human decision even in YOLO. Host trust pins the exact host/port/key observation;
  a changed key blocks the old preview until a fresh explicit replacement preview and protected human
  decision show both old and new fingerprints. Installation uses only the shared-list public-key ref,
  exact remote account and observed authorized_keys CAS, preserves entries, rejects weak keys before reuse
  and authenticates readback; unknown effect reconciles before retry. No private key/password, Client
  pairing, PM claim, provisioning or remote-ingress authority travels. Native absence remains handler_unavailable;
  neither command admits an EventRecord. SSH executes in actual Server application scope; any initiating
  Project/draft is descriptive, and the unmanaged remote host has no fabricated PM Server identity. Actor
  is human_gui or human_palette. Missing caller after settlement is caller_unavailable with original result/work
  still discoverable, never an assertion that the completed effect vanished.'
gui_related: true
gui_classification_reason: Defines visible control dispatch, availability, disabled feedback, accessibility
  and exact caller return.
depends_on:
- SSYS-059
- SSYS-060
- SSYS-061
- SSYS-062
- SSYS-063
- SSYS-065
- SRV-016
- CS-109
- SRV-018
- RAS-017
unblocks: []
acceptance_criteria:
- Exactly five Settings primaries consume offered level/key, the single resolver, per-setting CAS, exact
  owner readback and return. All chats/All editors/All terminals uses Everywhere. Human rows edit their
  origin; agent edits use SSYS-065. Library things retain their home/reach/whole Project versions and
  sole owner. Computer installations, credentials and protected source trust never travel in copy. Origin-word/Details/Changed/Varies
  menus are local. Commands & Shortcuts retains exactly eight commands.* local owner actions through handlers::commands::apply_local_action,
  not cmd.commands.custom.*.
- Pointer/keyboard/agent origins resolve one canonical owner and sole handler with exact selected request/result,
  per-action state selector and closed disabled reason; new primary identity occurs exactly once in production
  intent.
- Stale scope/root/target/revision/source/preview/permission/Stop/return mismatch refuses with zero unadmitted
  effects; matching replay returns authentic original custody and no duplicate effect.
- Return preserves original Client/scope/object/route/focus/continuation; unavailable owner or missing
  adopted source graph is reported rather than replaced by focus/current/latest context.
- Local draft/disclosure/navigation has no fictitious domain handler or EventRecord; candidates, forbidden
  aliases and protected auth remain non-dispatchable.
- All relevant original exact Project schema/hash/replay resources remain valid; schema/catalog/concept
  evidence proves no native dispatch, storage, visual, event or readiness fact.
- Protected SSH preview applies no trust/key effect; wrong active Client, changed host key, weak key or
  stale authorized_keys refuses.
- Each protected SSH primary has one Server handler, selected request/result, production/PM7 producer
  and independently discovered Touch action; replay cannot repeat remote installation.
validation_surfaces:
- Plans/projects_refresh_command_bindings.json
- Plans/Wiring_Matrix.production.json
- Plans/pm7_control_bindings.json
- Plans/touch_closure.json
- Plans/touch_closure_action_sources.json
- scripts/pm-touch-closure-verify.py
- scripts/pm-plans-verify.py
risk_class: scope_target_authority_or_command_binding_drift
reasoning_tier: high
context_scope: projects_refresh_settings
implementation_surfaces:
- Plans/UI_Command_Catalog.md
- Plans/projects_refresh_command_bindings.json
- Plans/Wiring_Matrix.production.json
- Plans/pm7_control_bindings.json
- Plans/touch_closure.json
node_compile_hint:
  mode: static_command_wiring_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:chat:2026-11-03-projects-pass2-approved
- PLANS-EDIT-PLAN.md#3
- F-LANE-BRIEF.md
- A-F01
- A-F05
- A-F03
- A-F04
- A-F08
- A-F10
- B-F01
- B-F02
- B-F03
- E-F05
- E-F09
- C-F01
- projects-refresh-20261030/pass2/plans-edit-requests/PHASE2-BRIEF.md#known-corrections
- Plans/Server_System.md#SRV-018; Plans/Remote_Access_System.md#RAS-017; Fb-ACE01/Fc-ACE01
preserved_exact_tokens:
- handler_unavailable
- project_id=null
- cmd.persona.save_as_override
- cmd.mcp.server.copy
- cmd.skill.copy
- cmd.plugin.copy_configuration
- cmd.server.settings_home.move
- cmd.server.settings_peer_trust
- cmd.settings.open
- cmd.persona.create
- cmd.persona.delete
- cmd.persona.duplicate
- cmd.persona.export
- cmd.persona.import
- cmd.persona.select
- cmd.persona.update
- cmd.settings.export
- cmd.settings.transaction.apply
- cmd.settings.transaction.preview
- cmd.settings.transaction.rollback
- cmd.editor.appearance.set
- cmd.server.ssh.trust
- cmd.server.ssh.public_key.install
- handlers::server::ssh_host_trust
- handlers::server::ssh_public_key_install
negative_constraints:
- Do not create duplicate primaries, aliases or independent domain writers.
- Do not infer authority from scope nullability, a preview, a visible control, source reach or copied
  content.
- Do not reinterpret old exact Project contracts, codecs, hashes or authentic source/receipt bytes.
- Do not claim native availability, Event Authority, buildability, WorkNodes, runtime or governance certification.
owner_hints:
- Plans/UI_Command_Catalog.md
- Plans/Personas.md
- Plans/MCP_Integration.md
- Plans/Skills_System.md
- Plans/Plugins_System.md
- Plans/Server_System.md
- Plans/Server_System.md
- Plans/Settings_System.md
- Plans/Personas.md
- Plans/Personas.md
- Plans/Personas.md
- Plans/Personas.md
- Plans/Personas.md
- Plans/Personas.md
- Plans/Personas.md
- Plans/Settings_System.md
- Plans/Settings_System.md
- Plans/Settings_System.md
```


ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-214, ContractName:Plans/projects_refresh_command_bindings.json, ContractName:Plans/Commands_System.md#CS-109

### UCC-215 - Projects Refresh Projects

```yaml
plan_unit_id: UCC-215
unit_type: integration_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: 'One reviewed Project setup binding serves onboarding/New Project/conversion-to-new; no generic
  create or clone wrapper. Preserve all nine historical registration kinds, add owner-verified mounted_existing,
  and native clone plus acquisition provenance for online_import/fork_contribute. Rename changes display name
  only; refresh remains nullable-Project registry read; remove remains list-only and delete_data remains strong
  Storage purge. Inspection is read-only evidence, not a linked origin. Source-location repoint and physical
  move remain distinct. Starters/My starters are file sets; Saved setups are detached own values/things/account
  choices. Preserve FO-22 and live DL-273 service admission, Git/JJ capabilities, exact remote-create/fork
  recovery and all receipt joins. Backups use first-policy absent-key CAS, Standard plus Advanced, archive
  pause and last-good protection. Exact command identities: cmd.project.rename, cmd.source_control.repository.inspect,
  cmd.source_control.remote.add, cmd.source_control.remote.sync, cmd.backup.archive.retrieve, cmd.backup.browse,
  cmd.backup.cancel, cmd.backup.delete, cmd.backup.destination.add, cmd.backup.destination.discover, cmd.backup.destination.remove,
  cmd.backup.destination.test, cmd.backup.destination.update, cmd.backup.export, cmd.backup.extract, cmd.backup.file.compare,
  cmd.backup.file.download, cmd.backup.open_details, cmd.backup.open_history, cmd.backup.policy.update, cmd.backup.project.create,
  cmd.backup.protect, cmd.backup.prune, cmd.backup.recovery_key.acknowledge_saved, cmd.backup.recovery_key.copy,
  cmd.backup.recovery_key.export, cmd.backup.recovery_key.print, cmd.backup.recovery_key.reencrypt, cmd.backup.recovery_key.rotate,
  cmd.backup.recovery_key.test, cmd.backup.retention.preview, cmd.backup.retry, cmd.backup.server.create, cmd.backup.test_restore,
  cmd.backup.unlock, cmd.backup.verify, cmd.forge.connection.reauthorize, cmd.forge.mirror.connect, cmd.forge.mirror.detach,
  cmd.forge.mirror.inspect, cmd.forge.mirror.sync, cmd.forge.pipeline.approve, cmd.forge.pipeline.cancel, cmd.forge.pipeline.list,
  cmd.forge.pipeline.open_in_browser, cmd.forge.pipeline.artifact.download, cmd.forge.pipeline.secret.set,
  cmd.forge.pipeline.secret.remove, cmd.forge.pipeline.variable.set, cmd.forge.pipeline.variable.remove, cmd.forge.pipeline.open_job,
  cmd.forge.pipeline.open_logs, cmd.forge.pipeline.refresh, cmd.forge.pipeline.retry, cmd.forge.pipeline.run,
  cmd.forge.release.asset.download, cmd.forge.release.list, cmd.forge.repository.create, cmd.forge.repository.fork,
  cmd.forge.repository.list, cmd.forge.repository.open_in_browser, cmd.forge.repository.delete, cmd.forge.repository.policy.apply,
  cmd.forge.repository.policy.preview, cmd.forge.repository.refresh, cmd.forge.review.approve, cmd.forge.review.checkout,
  cmd.forge.review.checks, cmd.forge.review.close, cmd.forge.review.comment, cmd.forge.review.create, cmd.forge.review.mark_ready,
  cmd.forge.review.merge, cmd.forge.review.open, cmd.forge.review.open_in_browser, cmd.forge.review.refresh,
  cmd.forge.review.reopen, cmd.forge.review.request_changes, cmd.forge.review.thread.list, cmd.forge.review.thread.reopen,
  cmd.forge.review.thread.reply, cmd.forge.review.thread.resolve, cmd.forge.review.version.compare, cmd.forge.review.version.open,
  cmd.forge.runner.registration.apply, cmd.forge.runner.remove, cmd.forge.webhook.delivery.list, cmd.forge.webhook.redeliver,
  cmd.git.push, cmd.jujutsu.git.clone, cmd.jujutsu.git.push, cmd.project.add_existing, cmd.project.archive,
  cmd.project.chain_wizard_open_deferred, cmd.project.unarchive, cmd.project.duplicate_configuration, cmd.project.duplicate_with_history,
  cmd.project.execution_host.select, cmd.project.execution_policy.set, cmd.project.home_server.set, cmd.project.move.cancel,
  cmd.project.move.pause, cmd.project.move.preflight, cmd.project.move.resume, cmd.project.move.retry, cmd.project.move.rollback,
  cmd.project.move.start, cmd.project.new_github_repo, cmd.project.new_local, cmd.project.open, cmd.project.resume_creation,
  cmd.project.open_settings, cmd.project.refresh, cmd.project.remove, cmd.project.source_location.add, cmd.project.source_location.remove,
  cmd.project.source_location.set_primary, cmd.project.source_location.test, cmd.project.source_location.update,
  cmd.project_template.create_project, cmd.project_template.delete, cmd.project_template.rename, cmd.project_template.save,
  cmd.restore.cancel, cmd.restore.open_details, cmd.restore.preview, cmd.restore.project_as_new, cmd.restore.project_in_place,
  cmd.restore.retry, cmd.restore.rollback, cmd.restore.selective, cmd.restore.server_full, cmd.source_control.accept_commit_group,
  cmd.source_control.backend.detect, cmd.source_control.backend.select, cmd.source_control.branch.create, cmd.source_control.branch.switch,
  cmd.source_control.checkpoint.create, cmd.source_control.checkpoint.inspect, cmd.source_control.checkpoint.restore,
  cmd.source_control.diff.open, cmd.source_control.generate_commit_message, cmd.source_control.graph_filter,
  cmd.source_control.graph.filter, cmd.source_control.graph_focus, cmd.source_control.graph.focus, cmd.source_control.graph.layout,
  cmd.source_control.history.open, cmd.source_control.history_open_commit, cmd.source_control.mark_conflict_resolved,
  cmd.source_control.open_conflict, cmd.source_control.open_merge_editor, cmd.source_control.open_review, cmd.source_control.remote.fetch,
  cmd.source_control.remote.publish, cmd.source_control.repository.bind, cmd.source_control.repository.clone,
  cmd.source_control.repository.unbind, cmd.source_control.resolve_conflict_side, cmd.source_control.review.filter,
  cmd.source_control.review.open, cmd.source_control.review.swap, cmd.source_control.select_tab, cmd.source_control.set_compare_target,
  cmd.source_control.stash, cmd.source_control.stash.apply, cmd.source_control.stash.create, cmd.source_control.stash.drop,
  cmd.source_control.stash.list, cmd.source_control.stash.pop, cmd.source_control.status.refresh, cmd.source_control.suggest_commit_batches,
  cmd.source_control.suggest_commit_groups, cmd.source_control.toggle_generated_filter, cmd.source_control.workspace.create,
  cmd.source_control.workspace.list, cmd.source_control.workspace.open, cmd.source_control.workspace.remove,
  cmd.source_control.workspace.switch, cmd.project.delete_data, cmd.source_control.remote.update, cmd.source_control.branch.delete,
  cmd.forge.review.edit, cmd.project.switch_active_tab, cmd.project.open_in_new_workspace_tab. Native availability
  remains handler_unavailable. Resolve the selected WorkflowScopeV2: application has an actual Server/Computer,
  scope_partition=app and project_id=null, with owner-required thread or pre-message draft and Host/root identity.
  Server-owned pause/trust/home operations use their actual Server scope without fabricating a thread; view-only
  and metadata reads require only their declared owner targets. Project operations use actual immutable Project
  identity. Never use focus, an empty ID, a sentinel Project, HOME or CWD as authority. Permissions PS-144–148
  alone composes actual human|mode|build_grant evidence with retained FileSafe, trust, secrets, capabilities,
  root and parent/receiver ceilings. An app chat or copied receipt conveys no Project mutation/build-grant
  authority. Validate the exact operation-declared source/target refs and revisions/hashes. Mutation/execution
  rechecks the sole writer/lease, permission and Stop/pause/revocation generations at entry and immediately
  before effect. Read/navigation/local paths validate their declared read target/source/view generation; they
  do not demand a write lease merely to inspect. Owner-admitted stale/as-of read-only presentation never claims
  fresh authority or enables effects. Same idempotency key/digest returns the original result; conflict or
  dedupe unavailable performs no effect. Preserve initiating Client, captured source scope/object, invocation/correlation
  token, route, focus, context revision and continuation generation/expiry; return the exact owner result,
  refusal or paused recovery there. Never retarget to a newly focused tab. A late capture, attachment or draft
  insertion preserves both the originating thread AND composer destination, or refuses before draft mutation.
  Every selected request/result/source and active writer/read/backup/retention graph is adopted together or
  remains unavailable. Plans/projects_refresh_command_bindings.json enumerates exact commands, local actions,
  schema pointers, handlers, selectors and producer contracts; expected_event_types=[] for each new primary
  grants no event admission. Native handlers, runtime receipts, visual/accessibility evidence and governance
  certification remain unproved.'
gui_related: true
gui_classification_reason: Defines visible control dispatch, availability, disabled feedback, accessibility
  and exact caller return.
depends_on:
- PJCT-009
- PJCT-010
- PJCT-011
- PJCT-012
- SCS-025
- FGI-023
- FGI-024
- BRS-032
- BRS-033
- CS-110
unblocks: []
acceptance_criteria:
- One reviewed Project setup binding serves onboarding/New Project/conversion-to-new; no generic create or
  clone wrapper. Preserve all nine historical registration kinds, add owner-verified mounted_existing, and
  native clone plus acquisition provenance for online_import/fork_contribute. Rename changes display name only;
  refresh remains nullable-Project registry read; remove remains list-only and delete_data remains strong Storage
  purge. Inspection is read-only evidence, not a linked origin. Source-location repoint and physical move remain
  distinct. Starters/My starters are file sets; Saved setups are detached own values/things/account choices.
  Preserve FO-22 and live DL-273 service admission, Git/JJ capabilities, exact remote-create/fork recovery
  and all receipt joins. Backups use first-policy absent-key CAS, Standard plus Advanced, archive pause and
  last-good protection.
- Pointer/keyboard/agent origins resolve one canonical owner and sole handler with exact selected request/result,
  per-action state selector and closed disabled reason; new primary identity occurs exactly once in production
  intent.
- Stale scope/root/target/revision/source/preview/permission/Stop/return mismatch refuses with zero unadmitted
  effects; matching replay returns authentic original custody and no duplicate effect.
- Return preserves original Client/scope/object/route/focus/continuation; unavailable owner or missing adopted
  source graph is reported rather than replaced by focus/current/latest context.
- Local draft/disclosure/navigation has no fictitious domain handler or EventRecord; candidates, forbidden
  aliases and protected auth remain non-dispatchable.
- All relevant original exact Project schema/hash/replay resources remain valid; schema/catalog/concept evidence
  proves no native dispatch, storage, visual, event or readiness fact.
validation_surfaces:
- Plans/projects_refresh_command_bindings.json
- Plans/Wiring_Matrix.production.json
- Plans/pm7_control_bindings.json
- Plans/touch_closure.json
- Plans/touch_closure_action_sources.json
- scripts/pm-touch-closure-verify.py
- scripts/pm-plans-verify.py
risk_class: scope_target_authority_or_command_binding_drift
reasoning_tier: high
context_scope: projects_refresh_projects
implementation_surfaces:
- Plans/UI_Command_Catalog.md
- Plans/projects_refresh_command_bindings.json
- Plans/Wiring_Matrix.production.json
- Plans/pm7_control_bindings.json
- Plans/touch_closure.json
node_compile_hint:
  mode: static_command_wiring_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:chat:2026-11-03-projects-pass2-approved
- PLANS-EDIT-PLAN.md#3
- F-LANE-BRIEF.md
- E-F01
- E-F02
- E-F03
- E-F04
- E-F05
- E-F06
- E-F07
- E-F08
- E-F09
- B-F15
- D-F04
- C-F01
preserved_exact_tokens:
- handler_unavailable
- project_id=null
- cmd.project.rename
- cmd.source_control.repository.inspect
- cmd.source_control.remote.add
- cmd.source_control.remote.sync
- cmd.backup.archive.retrieve
- cmd.backup.browse
- cmd.backup.cancel
- cmd.backup.delete
- cmd.backup.destination.add
- cmd.backup.destination.discover
- cmd.backup.destination.remove
- cmd.backup.destination.test
- cmd.backup.destination.update
- cmd.backup.export
- cmd.backup.extract
- cmd.backup.file.compare
- cmd.backup.file.download
- cmd.backup.open_details
- cmd.backup.open_history
- cmd.backup.policy.update
- cmd.backup.project.create
- cmd.backup.protect
- cmd.backup.prune
- cmd.backup.recovery_key.acknowledge_saved
- cmd.backup.recovery_key.copy
- cmd.backup.recovery_key.export
- cmd.backup.recovery_key.print
- cmd.backup.recovery_key.reencrypt
- cmd.backup.recovery_key.rotate
- cmd.backup.recovery_key.test
- cmd.backup.retention.preview
- cmd.backup.retry
- cmd.backup.server.create
- cmd.backup.test_restore
- cmd.backup.unlock
- cmd.backup.verify
- cmd.forge.connection.reauthorize
- cmd.forge.mirror.connect
- cmd.forge.mirror.detach
- cmd.forge.mirror.inspect
- cmd.forge.mirror.sync
- cmd.forge.pipeline.approve
- cmd.forge.pipeline.cancel
- cmd.forge.pipeline.list
- cmd.forge.pipeline.open_in_browser
- cmd.forge.pipeline.artifact.download
- cmd.forge.pipeline.secret.set
- cmd.forge.pipeline.secret.remove
- cmd.forge.pipeline.variable.set
- cmd.forge.pipeline.variable.remove
- cmd.forge.pipeline.open_job
- cmd.forge.pipeline.open_logs
- cmd.forge.pipeline.refresh
- cmd.forge.pipeline.retry
- cmd.forge.pipeline.run
- cmd.forge.release.asset.download
- cmd.forge.release.list
- cmd.forge.repository.create
- cmd.forge.repository.fork
- cmd.forge.repository.list
- cmd.forge.repository.open_in_browser
- cmd.forge.repository.delete
- cmd.forge.repository.policy.apply
- cmd.forge.repository.policy.preview
- cmd.forge.repository.refresh
- cmd.forge.review.approve
- cmd.forge.review.checkout
- cmd.forge.review.checks
- cmd.forge.review.close
- cmd.forge.review.comment
- cmd.forge.review.create
- cmd.forge.review.mark_ready
- cmd.forge.review.merge
- cmd.forge.review.open
- cmd.forge.review.open_in_browser
- cmd.forge.review.refresh
- cmd.forge.review.reopen
- cmd.forge.review.request_changes
- cmd.forge.review.thread.list
- cmd.forge.review.thread.reopen
- cmd.forge.review.thread.reply
- cmd.forge.review.thread.resolve
- cmd.forge.review.version.compare
- cmd.forge.review.version.open
- cmd.forge.runner.registration.apply
- cmd.forge.runner.remove
- cmd.forge.webhook.delivery.list
- cmd.forge.webhook.redeliver
- cmd.git.push
- cmd.jujutsu.git.clone
- cmd.jujutsu.git.push
- cmd.project.add_existing
- cmd.project.archive
- cmd.project.chain_wizard_open_deferred
- cmd.project.unarchive
- cmd.project.duplicate_configuration
- cmd.project.duplicate_with_history
- cmd.project.execution_host.select
- cmd.project.execution_policy.set
- cmd.project.home_server.set
- cmd.project.move.cancel
- cmd.project.move.pause
- cmd.project.move.preflight
- cmd.project.move.resume
- cmd.project.move.retry
- cmd.project.move.rollback
- cmd.project.move.start
- cmd.project.new_github_repo
- cmd.project.new_local
- cmd.project.open
- cmd.project.resume_creation
- cmd.project.open_settings
- cmd.project.refresh
- cmd.project.remove
- cmd.project.source_location.add
- cmd.project.source_location.remove
- cmd.project.source_location.set_primary
- cmd.project.source_location.test
- cmd.project.source_location.update
- cmd.project_template.create_project
- cmd.project_template.delete
- cmd.project_template.rename
- cmd.project_template.save
- cmd.restore.cancel
- cmd.restore.open_details
- cmd.restore.preview
- cmd.restore.project_as_new
- cmd.restore.project_in_place
- cmd.restore.retry
- cmd.restore.rollback
- cmd.restore.selective
- cmd.restore.server_full
- cmd.source_control.accept_commit_group
- cmd.source_control.backend.detect
- cmd.source_control.backend.select
- cmd.source_control.branch.create
- cmd.source_control.branch.switch
- cmd.source_control.checkpoint.create
- cmd.source_control.checkpoint.inspect
- cmd.source_control.checkpoint.restore
- cmd.source_control.diff.open
- cmd.source_control.generate_commit_message
- cmd.source_control.graph_filter
- cmd.source_control.graph.filter
- cmd.source_control.graph_focus
- cmd.source_control.graph.focus
- cmd.source_control.graph.layout
- cmd.source_control.history.open
- cmd.source_control.history_open_commit
- cmd.source_control.mark_conflict_resolved
- cmd.source_control.open_conflict
- cmd.source_control.open_merge_editor
- cmd.source_control.open_review
- cmd.source_control.remote.fetch
- cmd.source_control.remote.publish
- cmd.source_control.repository.bind
- cmd.source_control.repository.clone
- cmd.source_control.repository.unbind
- cmd.source_control.resolve_conflict_side
- cmd.source_control.review.filter
- cmd.source_control.review.open
- cmd.source_control.review.swap
- cmd.source_control.select_tab
- cmd.source_control.set_compare_target
- cmd.source_control.stash
- cmd.source_control.stash.apply
- cmd.source_control.stash.create
- cmd.source_control.stash.drop
- cmd.source_control.stash.list
- cmd.source_control.stash.pop
- cmd.source_control.status.refresh
- cmd.source_control.suggest_commit_batches
- cmd.source_control.suggest_commit_groups
- cmd.source_control.toggle_generated_filter
- cmd.source_control.workspace.create
- cmd.source_control.workspace.list
- cmd.source_control.workspace.open
- cmd.source_control.workspace.remove
- cmd.source_control.workspace.switch
- cmd.project.delete_data
- cmd.source_control.remote.update
- cmd.source_control.branch.delete
- cmd.forge.review.edit
- cmd.project.switch_active_tab
- cmd.project.open_in_new_workspace_tab
negative_constraints:
- Do not create duplicate primaries, aliases or independent domain writers.
- Do not infer authority from scope nullability, a preview, a visible control, source reach or copied content.
- Do not reinterpret old exact Project contracts, codecs, hashes or authentic source/receipt bytes.
- Do not claim native availability, Event Authority, buildability, WorkNodes, runtime or governance certification.
owner_hints:
- Plans/UI_Command_Catalog.md
- Plans/Project_System.md
- Plans/Source_Control_System.md
- Plans/Source_Control_System.md
- Plans/Source_Control_System.md
- Plans/Backup_Restore_System.md
- Plans/Backup_Restore_System.md
- Plans/Backup_Restore_System.md
- Plans/Backup_Restore_System.md
- Plans/Backup_Restore_System.md
- Plans/Backup_Restore_System.md
- Plans/Backup_Restore_System.md
- Plans/Backup_Restore_System.md
- Plans/Backup_Restore_System.md
- Plans/Backup_Restore_System.md
- Plans/Backup_Restore_System.md
- Plans/Backup_Restore_System.md
- Plans/Backup_Restore_System.md
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-215, ContractName:Plans/projects_refresh_command_bindings.json, ContractName:Plans/Commands_System.md#CS-110

### UCC-216 - Projects Refresh No Project

```yaml
plan_unit_id: UCC-216
unit_type: integration_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: 'No project is genuine application scope, with a named fixed Computer after first message,
  lazy visible chat folder and no invented Project/Vault. Admit ordinary files/browser/editor/terminal/tools/notebook/history/recovery
  under exact app roots and owner versions, retaining private notebook/memory isolation and counterpart
  limits. Six projects.* read tools return explicit requested/looked_in/not_looked_in/partial coverage;
  source read grants do not authorize writes. Existing cmd.thread.request/spawn Send uses current local
  previews and receiver authority; maximum three automatic round trips. Two equal conversion choices share
  one manifest/copy-check/cutover/report/Undo engine; stop/fence Goal/Crew/Plan/timers and use linked
  destination records by default. No new work plus seven days bounds chat Undo, not independent canonical
  custody. Screen use is off until exact chat/app/controller/disclosure admission, with one targeted Stop.
  Exact command identities: cmd.chat.place.set, cmd.chat.move.preview, cmd.chat.move.apply, cmd.chat.move.resume,
  cmd.chat.move.cancel, cmd.chat.move.undo.preview, cmd.chat.move.undo.apply, cmd.chat.continue_elsewhere,
  cmd.chat.incoming.accept, cmd.chat.incoming.decline, cmd.chat.chat_folder.open, cmd.chat.chat_folder.delete,
  cmd.computer_use.stop, cmd.thread.request, cmd.thread.spawn, cmd.chat.load_older, cmd.chat.create_restore_point,
  cmd.chat.delete_restore_point, cmd.browser.component.insert_at_cursor, cmd.browser.component.mode.set_default,
  cmd.browser.open_devtools, cmd.chat.attachment.details, cmd.chat.attachment.freeze_reference, cmd.chat.attachment.open,
  cmd.chat.attachment.remove, cmd.chat.attachment.retry, cmd.chat.attachment.save_to_project, cmd.chat.composer.destination.clear,
  cmd.chat.teach.cancel, cmd.chat.teach.confirm, cmd.chat.teach.open_memory, cmd.chat.todos.open, cmd.chat.todos.open_work,
  cmd.chat.todos.toggle_parent, cmd.chat.attachment.add, cmd.chat.attachment.download, cmd.chat.composer.destination.set,
  cmd.browser.capture.full_to_chat, cmd.browser.capture.region_to_chat, cmd.browser.component.pick, cmd.browser.component.send_now,
  cmd.browser.component.add_to_composer, cmd.chat.teach.capture, cmd.chat.eli5.set, cmd.chat.revert, cmd.chat.thread.regenerate_title,
  cmd.auth_profile.cancel, cmd.auth_profile.open_official_page, cmd.auth_profile.rename, cmd.auth_profile.retry,
  cmd.auth_profile.revoke, cmd.auth_profile.select, cmd.auth_profile.sign_in, cmd.auth_profile.sign_out,
  cmd.auth_profile.submit_code, cmd.auth_profile.transfer.apply, cmd.auth_profile.transfer.preview, cmd.auth_profile.verify,
  cmd.browser.add_full_screenshot_to_chat, cmd.browser.add_screenshot_to_chat, cmd.browser.add_selection_full_screenshot_to_chat,
  cmd.browser.add_selection_screenshot_to_chat, cmd.browser.add_selection_to_chat, cmd.browser.detach_browser_tab,
  cmd.browser.focus_browser_tab, cmd.browser.keep_closed, cmd.browser.let_agent_continue, cmd.browser.navigate,
  cmd.browser.open_detached_preview, cmd.browser.open_workspace_preview, cmd.browser.page.activate, cmd.browser.page.close,
  cmd.browser.page.create, cmd.browser.page.evaluate, cmd.browser.page.representation.capture, cmd.browser.page.representation.delta,
  cmd.browser.page.representation.query, cmd.browser.pause_agent, cmd.browser.pick_element_for_chat, cmd.browser.program.cancel,
  cmd.browser.program.inspect, cmd.browser.program.pause, cmd.browser.program.resume, cmd.browser.program.run,
  cmd.browser.promote_to_normal_browsing, cmd.browser.reload, cmd.browser.reopen, cmd.browser.retry, cmd.browser.revoke_share_with_agent,
  cmd.browser.share_with_agent, cmd.browser.stop_agent_keep_browser, cmd.browser.take_over, cmd.browser.toggle_devtools_dock,
  cmd.browser.workspace.close, cmd.browser.workspace.create, cmd.browser.workspace.reset, cmd.chat.apply_code_block,
  cmd.chat.archive, cmd.chat.branch_from_restore, cmd.chat.close_thread_context_details, cmd.chat.compact_context,
  cmd.chat.context_lens.apply_subcompact, cmd.chat.context_lens.clear_selection, cmd.chat.context_lens.revert_subcompact,
  cmd.chat.context_lens.set_mode, cmd.chat.context_lens.toggle, cmd.chat.context_lens.toggle_message_selection,
  cmd.chat.context_lens.turn_off, cmd.chat.copy_code_block, cmd.chat.copy_message, cmd.chat.debug_investigation.dismiss,
  cmd.chat.debug_investigation.promote, cmd.chat.delete, cmd.chat.edit_last_user_message, cmd.chat.effort,
  cmd.chat.export, cmd.chat.export_investigation_bundle, cmd.chat.focus_thread_context_details, cmd.chat.insert_code_block,
  cmd.chat.memory.dedup_sweep, cmd.chat.memory.discard, cmd.chat.memory.edit, cmd.chat.memory.pin, cmd.chat.memory.preview_capsule,
  cmd.chat.memory.prune_archive, cmd.chat.memory.rebuild_lexical_index, cmd.chat.memory.rebuild_semantic_index,
  cmd.chat.memory.summarize_monthly, cmd.chat.memory.toggle_auto_save_unverified, cmd.chat.memory.verification_sweep,
  cmd.chat.memory.verify, cmd.chat.mode, cmd.chat.model, cmd.chat.new, cmd.chat.open_debug_target_picker,
  cmd.chat.open_thread, cmd.chat.open_thread_context_details, cmd.chat.pin, cmd.chat.plan_thoroughness,
  cmd.chat.platform, cmd.chat.queue.remove, cmd.chat.rename, cmd.chat.resend_last_user_message, cmd.chat.retry_message,
  cmd.chat.revoke_investigation_item, cmd.chat.rewind, cmd.chat.run_user_command, cmd.chat.search, cmd.chat.send,
  cmd.chat.settings, cmd.chat.stop, cmd.chat.switch_thread, cmd.chat.toggle_message_details, cmd.chat.web.cancel,
  cmd.chat.web.crawl, cmd.chat.web.extract, cmd.chat.web.fetch, cmd.chat.web.help, cmd.chat.web.map, cmd.chat.web.request_again,
  cmd.chat.web.research, cmd.chat.web.search, cmd.chat.worktree, cmd.chat.worktree.bind_existing, cmd.chat.worktree.create,
  cmd.chat.worktree.info, cmd.chat.worktree.merge, cmd.chat.worktree.pr, cmd.chat.worktree.remove, cmd.chat.worktree.unbind,
  cmd.file.copy_full_path, cmd.file.copy_nodes, cmd.file.copy_path, cmd.file.copy_relative_path, cmd.file.cut_nodes,
  cmd.file.delete, cmd.file.expand_capped, cmd.file.new_file, cmd.file.new_folder, cmd.file.open, cmd.file.open_in_system_default,
  cmd.file.open_with, cmd.file.paste_nodes, cmd.file.refresh, cmd.file.rename, cmd.file.reveal, cmd.file.save_local_copy,
  cmd.integration.connection.activate, cmd.integration.connection.add, cmd.integration.connection.open_details,
  cmd.integration.connection.remove, cmd.integration.connection.test, cmd.integration.connection.update,
  cmd.terminal.clear_scrollback, cmd.terminal.focus, cmd.terminal.kill_session, cmd.terminal.open, cmd.terminal.rerun,
  cmd.terminal.restart_replace, cmd.terminal.reveal, cmd.terminal.show, cmd.terminal.terminate_session,
  cmd.terminal.allow_agent_input, cmd.terminal.deny_agent_input, cmd.terminal.hand_back, cmd.terminal.interrupt,
  cmd.terminal.stop_agent, cmd.terminal.take_over, cmd.terminal.appearance.set, cmd.terminal.appearance.import_scheme,
  cmd.terminal.clear, cmd.terminal.revoke_agent_input, cmd.terminal.send_signal, cmd.chat.queue.send_now,
  cmd.chat.processes.open. Native availability remains handler_unavailable. Resolve the selected WorkflowScopeV2:
  application has an actual Server/Computer, scope_partition=app and project_id=null, with owner-required
  thread or pre-message draft and Host/root identity. Server-owned pause/trust/home operations use their
  actual Server scope without fabricating a thread; view-only and metadata reads require only their declared
  owner targets. Project operations use actual immutable Project identity. Never use focus, an empty ID,
  a sentinel Project, HOME or CWD as authority. Permissions PS-144–148 alone composes actual human|mode|build_grant
  evidence with retained FileSafe, trust, secrets, capabilities, root and parent/receiver ceilings. An
  app chat or copied receipt conveys no Project mutation/build-grant authority. Validate the exact operation-declared
  source/target refs and revisions/hashes. Mutation/execution rechecks the sole writer/lease, permission
  and Stop/pause/revocation generations at entry and immediately before effect. Read/navigation/local
  paths validate their declared read target/source/view generation; they do not demand a write lease merely
  to inspect. Owner-admitted stale/as-of read-only presentation never claims fresh authority or enables
  effects. Same idempotency key/digest returns the original result; conflict or dedupe unavailable performs
  no effect. Preserve initiating Client, captured source scope/object, invocation/correlation token, route,
  focus, context revision and continuation generation/expiry; return the exact owner result, refusal or
  paused recovery there. Never retarget to a newly focused tab. A late capture, attachment or draft insertion
  preserves both the originating thread AND composer destination, or refuses before draft mutation. Every
  selected request/result/source and active writer/read/backup/retention graph is adopted together or
  remains unavailable. Plans/projects_refresh_command_bindings.json enumerates exact commands, local actions,
  schema pointers, handlers, selectors and producer contracts; expected_event_types=[] for each new primary
  grants no event admission. Native handlers, runtime receipts, visual/accessibility evidence and governance
  certification remain unproved. The T-186 executable screen census is exactly computer.screen -> tools::computer::screen,
  computer.pointer -> tools::computer::pointer and computer.keys -> tools::computer::keys. Plans/computer_use_contracts.schema.json
  selects ComputerScreenRequestV1/ResultV1, ComputerPointerRequestV1/ResultV1 and ComputerKeysRequestV1/ResultV1.
  These three plus the six projects.* read tools make nine Tools dispatch identities; computer.* is a
  family selector, and cmd.computer_use.stop remains the sole separate Stop control, never a fourth tool.
  Per-action schema/native mapping/ActiveToolNamespaceReceipt and session/controller/app/observation/geometry/permission/disclosure/Stop
  joins precede capture/input. Protected surfaces cannot be captured or controlled; images remain scrubbed
  transient provider inputs, and exact effect policy gates sends/purchases/installs/deletion/publication.
  Matching replay never repeats input, unknown effect reconciles, and late results retain the initiating
  target/return. Missing schema/source/native capability remains unavailable and admits no event.'
gui_related: true
gui_classification_reason: Defines visible control dispatch, availability, disabled feedback, accessibility
  and exact caller return.
depends_on:
- ACD-508
- ACD-509
- ACD-510
- ACD-511
- OSI-439
- CS-111
- T-186
unblocks: []
acceptance_criteria:
- No project is genuine application scope, with a named fixed Computer after first message, lazy visible
  chat folder and no invented Project/Vault. Admit ordinary files/browser/editor/terminal/tools/notebook/history/recovery
  under exact app roots and owner versions, retaining private notebook/memory isolation and counterpart
  limits. Six projects.* read tools return explicit requested/looked_in/not_looked_in/partial coverage;
  source read grants do not authorize writes. Existing cmd.thread.request/spawn Send uses current local
  previews and receiver authority; maximum three automatic round trips. Two equal conversion choices share
  one manifest/copy-check/cutover/report/Undo engine; stop/fence Goal/Crew/Plan/timers and use linked
  destination records by default. No new work plus seven days bounds chat Undo, not independent canonical
  custody. Screen use is off until exact chat/app/controller/disclosure admission, with one targeted Stop.
- Pointer/keyboard/agent origins resolve one canonical owner and sole handler with exact selected request/result,
  per-action state selector and closed disabled reason; new primary identity occurs exactly once in production
  intent.
- Stale scope/root/target/revision/source/preview/permission/Stop/return mismatch refuses with zero unadmitted
  effects; matching replay returns authentic original custody and no duplicate effect.
- Return preserves original Client/scope/object/route/focus/continuation; unavailable owner or missing
  adopted source graph is reported rather than replaced by focus/current/latest context.
- Local draft/disclosure/navigation has no fictitious domain handler or EventRecord; candidates, forbidden
  aliases and protected auth remain non-dispatchable.
- All relevant original exact Project schema/hash/replay resources remain valid; schema/catalog/concept
  evidence proves no native dispatch, storage, visual, event or readiness fact.
- 'Exactly nine agent tool identities are bound: six projects.* reads and three computer.* screen tools;
  no extra command, local action or Stop tool.'
- Stale controller/window/geometry or missing disclosure/native mapping refuses before capture/input;
  protected surfaces never reach provider, unknown effects reconcile and exact replay never repeats input.
validation_surfaces:
- Plans/projects_refresh_command_bindings.json
- Plans/Wiring_Matrix.production.json
- Plans/pm7_control_bindings.json
- Plans/touch_closure.json
- Plans/touch_closure_action_sources.json
- scripts/pm-touch-closure-verify.py
- scripts/pm-plans-verify.py
risk_class: scope_target_authority_or_command_binding_drift
reasoning_tier: high
context_scope: projects_refresh_no_project
implementation_surfaces:
- Plans/UI_Command_Catalog.md
- Plans/projects_refresh_command_bindings.json
- Plans/Wiring_Matrix.production.json
- Plans/pm7_control_bindings.json
- Plans/touch_closure.json
node_compile_hint:
  mode: static_command_wiring_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:chat:2026-11-03-projects-pass2-approved
- PLANS-EDIT-PLAN.md#3
- F-LANE-BRIEF.md
- A-F06
- A-F07
- C-F01
- B-F04
- B-F05
- B-F06
- B-F07
- B-F08
- B-F09
- B-F10
- B-F11
- B-F12
- C-F02
- C-F03
- C-F04
- C-F05
- C-F10
- C-F11
- D-F05
- projects-refresh-20261030/pass2/plans-edit-requests/B-requests.md#phase-2-owner-corrections
- Plans/Tools.md#T-186 executable tool census, version 1.0.0
preserved_exact_tokens:
- handler_unavailable
- project_id=null
- cmd.chat.place.set
- cmd.chat.move.preview
- cmd.chat.move.apply
- cmd.chat.move.resume
- cmd.chat.move.cancel
- cmd.chat.move.undo.preview
- cmd.chat.move.undo.apply
- cmd.chat.continue_elsewhere
- cmd.chat.incoming.accept
- cmd.chat.incoming.decline
- cmd.chat.chat_folder.open
- cmd.chat.chat_folder.delete
- cmd.computer_use.stop
- cmd.thread.request
- cmd.thread.spawn
- cmd.chat.load_older
- cmd.chat.create_restore_point
- cmd.chat.delete_restore_point
- cmd.browser.component.insert_at_cursor
- cmd.browser.component.mode.set_default
- cmd.browser.open_devtools
- cmd.chat.attachment.details
- cmd.chat.attachment.freeze_reference
- cmd.chat.attachment.open
- cmd.chat.attachment.remove
- cmd.chat.attachment.retry
- cmd.chat.attachment.save_to_project
- cmd.chat.composer.destination.clear
- cmd.chat.teach.cancel
- cmd.chat.teach.confirm
- cmd.chat.teach.open_memory
- cmd.chat.todos.open
- cmd.chat.todos.open_work
- cmd.chat.todos.toggle_parent
- cmd.chat.attachment.add
- cmd.chat.attachment.download
- cmd.chat.composer.destination.set
- cmd.browser.capture.full_to_chat
- cmd.browser.capture.region_to_chat
- cmd.browser.component.pick
- cmd.browser.component.send_now
- cmd.browser.component.add_to_composer
- cmd.chat.teach.capture
- cmd.chat.eli5.set
- cmd.chat.revert
- cmd.chat.thread.regenerate_title
- cmd.auth_profile.cancel
- cmd.auth_profile.open_official_page
- cmd.auth_profile.rename
- cmd.auth_profile.retry
- cmd.auth_profile.revoke
- cmd.auth_profile.select
- cmd.auth_profile.sign_in
- cmd.auth_profile.sign_out
- cmd.auth_profile.submit_code
- cmd.auth_profile.transfer.apply
- cmd.auth_profile.transfer.preview
- cmd.auth_profile.verify
- cmd.browser.add_full_screenshot_to_chat
- cmd.browser.add_screenshot_to_chat
- cmd.browser.add_selection_full_screenshot_to_chat
- cmd.browser.add_selection_screenshot_to_chat
- cmd.browser.add_selection_to_chat
- cmd.browser.detach_browser_tab
- cmd.browser.focus_browser_tab
- cmd.browser.keep_closed
- cmd.browser.let_agent_continue
- cmd.browser.navigate
- cmd.browser.open_detached_preview
- cmd.browser.open_workspace_preview
- cmd.browser.page.activate
- cmd.browser.page.close
- cmd.browser.page.create
- cmd.browser.page.evaluate
- cmd.browser.page.representation.capture
- cmd.browser.page.representation.delta
- cmd.browser.page.representation.query
- cmd.browser.pause_agent
- cmd.browser.pick_element_for_chat
- cmd.browser.program.cancel
- cmd.browser.program.inspect
- cmd.browser.program.pause
- cmd.browser.program.resume
- cmd.browser.program.run
- cmd.browser.promote_to_normal_browsing
- cmd.browser.reload
- cmd.browser.reopen
- cmd.browser.retry
- cmd.browser.revoke_share_with_agent
- cmd.browser.share_with_agent
- cmd.browser.stop_agent_keep_browser
- cmd.browser.take_over
- cmd.browser.toggle_devtools_dock
- cmd.browser.workspace.close
- cmd.browser.workspace.create
- cmd.browser.workspace.reset
- cmd.chat.apply_code_block
- cmd.chat.archive
- cmd.chat.branch_from_restore
- cmd.chat.close_thread_context_details
- cmd.chat.compact_context
- cmd.chat.context_lens.apply_subcompact
- cmd.chat.context_lens.clear_selection
- cmd.chat.context_lens.revert_subcompact
- cmd.chat.context_lens.set_mode
- cmd.chat.context_lens.toggle
- cmd.chat.context_lens.toggle_message_selection
- cmd.chat.context_lens.turn_off
- cmd.chat.copy_code_block
- cmd.chat.copy_message
- cmd.chat.debug_investigation.dismiss
- cmd.chat.debug_investigation.promote
- cmd.chat.delete
- cmd.chat.edit_last_user_message
- cmd.chat.effort
- cmd.chat.export
- cmd.chat.export_investigation_bundle
- cmd.chat.focus_thread_context_details
- cmd.chat.insert_code_block
- cmd.chat.memory.dedup_sweep
- cmd.chat.memory.discard
- cmd.chat.memory.edit
- cmd.chat.memory.pin
- cmd.chat.memory.preview_capsule
- cmd.chat.memory.prune_archive
- cmd.chat.memory.rebuild_lexical_index
- cmd.chat.memory.rebuild_semantic_index
- cmd.chat.memory.summarize_monthly
- cmd.chat.memory.toggle_auto_save_unverified
- cmd.chat.memory.verification_sweep
- cmd.chat.memory.verify
- cmd.chat.mode
- cmd.chat.model
- cmd.chat.new
- cmd.chat.open_debug_target_picker
- cmd.chat.open_thread
- cmd.chat.open_thread_context_details
- cmd.chat.pin
- cmd.chat.plan_thoroughness
- cmd.chat.platform
- cmd.chat.queue.remove
- cmd.chat.rename
- cmd.chat.resend_last_user_message
- cmd.chat.retry_message
- cmd.chat.revoke_investigation_item
- cmd.chat.rewind
- cmd.chat.run_user_command
- cmd.chat.search
- cmd.chat.send
- cmd.chat.settings
- cmd.chat.stop
- cmd.chat.switch_thread
- cmd.chat.toggle_message_details
- cmd.chat.web.cancel
- cmd.chat.web.crawl
- cmd.chat.web.extract
- cmd.chat.web.fetch
- cmd.chat.web.help
- cmd.chat.web.map
- cmd.chat.web.request_again
- cmd.chat.web.research
- cmd.chat.web.search
- cmd.chat.worktree
- cmd.chat.worktree.bind_existing
- cmd.chat.worktree.create
- cmd.chat.worktree.info
- cmd.chat.worktree.merge
- cmd.chat.worktree.pr
- cmd.chat.worktree.remove
- cmd.chat.worktree.unbind
- cmd.file.copy_full_path
- cmd.file.copy_nodes
- cmd.file.copy_path
- cmd.file.copy_relative_path
- cmd.file.cut_nodes
- cmd.file.delete
- cmd.file.expand_capped
- cmd.file.new_file
- cmd.file.new_folder
- cmd.file.open
- cmd.file.open_in_system_default
- cmd.file.open_with
- cmd.file.paste_nodes
- cmd.file.refresh
- cmd.file.rename
- cmd.file.reveal
- cmd.file.save_local_copy
- cmd.integration.connection.activate
- cmd.integration.connection.add
- cmd.integration.connection.open_details
- cmd.integration.connection.remove
- cmd.integration.connection.test
- cmd.integration.connection.update
- cmd.terminal.clear_scrollback
- cmd.terminal.focus
- cmd.terminal.kill_session
- cmd.terminal.open
- cmd.terminal.rerun
- cmd.terminal.restart_replace
- cmd.terminal.reveal
- cmd.terminal.show
- cmd.terminal.terminate_session
- cmd.terminal.allow_agent_input
- cmd.terminal.deny_agent_input
- cmd.terminal.hand_back
- cmd.terminal.interrupt
- cmd.terminal.stop_agent
- cmd.terminal.take_over
- cmd.terminal.appearance.set
- cmd.terminal.appearance.import_scheme
- cmd.terminal.clear
- cmd.terminal.revoke_agent_input
- cmd.terminal.send_signal
- cmd.chat.queue.send_now
- cmd.chat.processes.open
- computer.screen
- computer.pointer
- computer.keys
- tools::computer::screen
- tools::computer::pointer
- tools::computer::keys
negative_constraints:
- Do not create duplicate primaries, aliases or independent domain writers.
- Do not infer authority from scope nullability, a preview, a visible control, source reach or copied
  content.
- Do not reinterpret old exact Project contracts, codecs, hashes or authentic source/receipt bytes.
- Do not claim native availability, Event Authority, buildability, WorkNodes, runtime or governance certification.
owner_hints:
- Plans/UI_Command_Catalog.md
- Plans/assistant-chat-design.md
- Plans/assistant-chat-design.md
- Plans/assistant-chat-design.md
- Plans/assistant-chat-design.md
- Plans/assistant-chat-design.md
- Plans/assistant-chat-design.md
- Plans/assistant-chat-design.md
- Plans/assistant-chat-design.md
- Plans/assistant-chat-design.md
- Plans/assistant-chat-design.md
- Plans/assistant-chat-design.md
- Plans/assistant-chat-design.md
- Plans/Tools.md
- Plans/orchestrator-subagent-integration.md
- Plans/orchestrator-subagent-integration.md
- Plans/assistant-chat-design.md
- Plans/assistant-chat-design.md
```
ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-216, ContractName:Plans/projects_refresh_command_bindings.json, ContractName:Plans/Commands_System.md#CS-111

### UCC-217 - Projects Refresh Automation

```yaml
plan_unit_id: UCC-217
unit_type: integration_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: 'One Permissions admission distinguishes actual human, task mode and human-approved build_grant.
  YOLO permits ordinary push/publish and needed create without another ordinary yes; force-with-lease only
  on a PM-created-for-this-work branch, never main/default/protected. Retain risky asks outside an exact grant-created-resource
  exception and retain FileSafe/trust/secrets/DAE/capabilities/explicit Always. Approve/expand/renew a Project
  build grant remains human-only and binds exact Plan/hash/build/resources/permission/Stop; cleanup requires
  verified created UID/generation. What the build did is the existing ObservableWork/History projection; Start/Stop
  stay with the run owner, no new build event/log engine. Preview, target/receipt links and truthful Undo/No
  safe Undo remain visible. Exact command identities: cmd.permissions.create_computer_rule, cmd.build_grant.preview,
  cmd.build_grant.approve, cmd.build_grant.revoke, cmd.docker.create_repository, cmd.docker.create_repository.cancel,
  cmd.docker.create_repository.confirm, cmd.docker.image.push, cmd.docker.registry.tag_push, cmd.docker.template.push,
  cmd.orchestrator.build_run, cmd.orchestrator.push_image, cmd.permissions.create_global_rule, cmd.permissions.create_project_rule,
  cmd.permissions.delete_rule, cmd.permissions.open, cmd.permissions.pick_external_directory, cmd.permissions.reorder_rule,
  cmd.permissions.review_request, cmd.permissions.revoke, cmd.permissions.update_rule, cmd.permissions.validate_rule,
  cmd.runtime.approve, cmd.runtime.decline. Native availability remains handler_unavailable. Resolve the selected
  WorkflowScopeV2: application has an actual Server/Computer, scope_partition=app and project_id=null, with
  owner-required thread or pre-message draft and Host/root identity. Server-owned pause/trust/home operations
  use their actual Server scope without fabricating a thread; view-only and metadata reads require only their
  declared owner targets. Project operations use actual immutable Project identity. Never use focus, an empty
  ID, a sentinel Project, HOME or CWD as authority. Permissions PS-144–148 alone composes actual human|mode|build_grant
  evidence with retained FileSafe, trust, secrets, capabilities, root and parent/receiver ceilings. An app
  chat or copied receipt conveys no Project mutation/build-grant authority. Validate the exact operation-declared
  source/target refs and revisions/hashes. Mutation/execution rechecks the sole writer/lease, permission and
  Stop/pause/revocation generations at entry and immediately before effect. Read/navigation/local paths validate
  their declared read target/source/view generation; they do not demand a write lease merely to inspect. Owner-admitted
  stale/as-of read-only presentation never claims fresh authority or enables effects. Same idempotency key/digest
  returns the original result; conflict or dedupe unavailable performs no effect. Preserve initiating Client,
  captured source scope/object, invocation/correlation token, route, focus, context revision and continuation
  generation/expiry; return the exact owner result, refusal or paused recovery there. Never retarget to a newly
  focused tab. A late capture, attachment or draft insertion preserves both the originating thread AND composer
  destination, or refuses before draft mutation. Every selected request/result/source and active writer/read/backup/retention
  graph is adopted together or remains unavailable. Plans/projects_refresh_command_bindings.json enumerates
  exact commands, local actions, schema pointers, handlers, selectors and producer contracts; expected_event_types=[]
  for each new primary grants no event admission. Native handlers, runtime receipts, visual/accessibility evidence
  and governance certification remain unproved.'
gui_related: true
gui_classification_reason: Defines visible control dispatch, availability, disabled feedback, accessibility
  and exact caller return.
depends_on:
- PS-144
- PS-145
- PS-146
- PS-147
- PS-148
- CS-112
unblocks: []
acceptance_criteria:
- One Permissions admission distinguishes actual human, task mode and human-approved build_grant. YOLO permits
  ordinary push/publish and needed create without another ordinary yes; force-with-lease only on a PM-created-for-this-work
  branch, never main/default/protected. Retain risky asks outside an exact grant-created-resource exception
  and retain FileSafe/trust/secrets/DAE/capabilities/explicit Always. Approve/expand/renew a Project build
  grant remains human-only and binds exact Plan/hash/build/resources/permission/Stop; cleanup requires verified
  created UID/generation. What the build did is the existing ObservableWork/History projection; Start/Stop
  stay with the run owner, no new build event/log engine. Preview, target/receipt links and truthful Undo/No
  safe Undo remain visible.
- Pointer/keyboard/agent origins resolve one canonical owner and sole handler with exact selected request/result,
  per-action state selector and closed disabled reason; new primary identity occurs exactly once in production
  intent.
- Stale scope/root/target/revision/source/preview/permission/Stop/return mismatch refuses with zero unadmitted
  effects; matching replay returns authentic original custody and no duplicate effect.
- Return preserves original Client/scope/object/route/focus/continuation; unavailable owner or missing adopted
  source graph is reported rather than replaced by focus/current/latest context.
- Local draft/disclosure/navigation has no fictitious domain handler or EventRecord; candidates, forbidden
  aliases and protected auth remain non-dispatchable.
- All relevant original exact Project schema/hash/replay resources remain valid; schema/catalog/concept evidence
  proves no native dispatch, storage, visual, event or readiness fact.
validation_surfaces:
- Plans/projects_refresh_command_bindings.json
- Plans/Wiring_Matrix.production.json
- Plans/pm7_control_bindings.json
- Plans/touch_closure.json
- Plans/touch_closure_action_sources.json
- scripts/pm-touch-closure-verify.py
- scripts/pm-plans-verify.py
risk_class: scope_target_authority_or_command_binding_drift
reasoning_tier: high
context_scope: projects_refresh_automation
implementation_surfaces:
- Plans/UI_Command_Catalog.md
- Plans/projects_refresh_command_bindings.json
- Plans/Wiring_Matrix.production.json
- Plans/pm7_control_bindings.json
- Plans/touch_closure.json
node_compile_hint:
  mode: static_command_wiring_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:chat:2026-11-03-projects-pass2-approved
- PLANS-EDIT-PLAN.md#3
- F-LANE-BRIEF.md
- D-F01
- D-F06
- D-F02
- D-F03
- D-F04
- D-F05
- D-F07
- C-F01
preserved_exact_tokens:
- handler_unavailable
- project_id=null
- cmd.permissions.create_computer_rule
- cmd.build_grant.preview
- cmd.build_grant.approve
- cmd.build_grant.revoke
- cmd.docker.create_repository
- cmd.docker.create_repository.cancel
- cmd.docker.create_repository.confirm
- cmd.docker.image.push
- cmd.docker.registry.tag_push
- cmd.docker.template.push
- cmd.orchestrator.build_run
- cmd.orchestrator.push_image
- cmd.permissions.create_global_rule
- cmd.permissions.create_project_rule
- cmd.permissions.delete_rule
- cmd.permissions.open
- cmd.permissions.pick_external_directory
- cmd.permissions.reorder_rule
- cmd.permissions.review_request
- cmd.permissions.revoke
- cmd.permissions.update_rule
- cmd.permissions.validate_rule
- cmd.runtime.approve
- cmd.runtime.decline
negative_constraints:
- Do not create duplicate primaries, aliases or independent domain writers.
- Do not infer authority from scope nullability, a preview, a visible control, source reach or copied content.
- Do not reinterpret old exact Project contracts, codecs, hashes or authentic source/receipt bytes.
- Do not claim native availability, Event Authority, buildability, WorkNodes, runtime or governance certification.
owner_hints:
- Plans/UI_Command_Catalog.md
- Plans/Permissions_System.md
- Plans/Permissions_System.md
- Plans/Permissions_System.md
- Plans/Permissions_System.md
- Plans/Containers_Registry_and_Unraid.md
- Plans/Containers_Registry_and_Unraid.md
- Plans/Containers_Registry_and_Unraid.md
- Plans/Containers_Registry_and_Unraid.md
- Plans/Containers_Registry_and_Unraid.md
- Plans/Containers_Registry_and_Unraid.md
- Plans/Orchestrator_Page.md
- Plans/Orchestrator_Page.md
- Plans/Permissions_System.md
- Plans/Permissions_System.md
- Plans/Permissions_System.md
- Plans/Permissions_System.md
- Plans/Permissions_System.md
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-217, ContractName:Plans/projects_refresh_command_bindings.json, ContractName:Plans/Commands_System.md#CS-112

### UCC-218 - Projects Refresh Goal Crew

```yaml
plan_unit_id: UCC-218
unit_type: integration_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: 'The six existing cmd.chat.goal.* mutations, Goal editor, four collaboration kinds, participant/message
  actions and Crew Auto admit explicit app siblings and original exact Project contracts. Scope, original accepted
  source/hash, body/control/Stop, parent/receiver authority, roots, roster/config revisions and canonical backup
  join at final dispatch. Ordinary updates never retarget immutable Goal/Plan/Crew bindings. No retired goal.scheduled/degraded/child-state
  producer or Project Workflow/WorkNode certification is revived. App Crew Auto uses an app-thread configuration
  revision, distinct from a thread override and Project configuration; the same evaluator/coordination board
  remains sole owner. Conversion defaults to linked new destination records after safe stop/fence. Exact command
  identities: cmd.brainstorm.next_round, cmd.chat.crew_auto.open_config, cmd.chat.goal.open_editor, cmd.chat_room.next_round,
  cmd.chat_room.summarize, cmd.collaboration.cancel, cmd.collaboration.configure, cmd.collaboration.export,
  cmd.collaboration.open, cmd.collaboration.participant.open, cmd.collaboration.pause, cmd.collaboration.reconfigure,
  cmd.collaboration.resume, cmd.review.create_todos, cmd.review.run_again, cmd.review.send_findings_to_agent,
  cmd.collaboration.message, cmd.chat.goal.start, cmd.chat.goal.pause, cmd.chat.goal.resume, cmd.chat.goal.cancel,
  cmd.chat.goal.update, cmd.chat.goal.propose_update, cmd.collaboration.start, cmd.chat.crew_auto.set, cmd.brainstorm.synthesize_plan,
  cmd.chat_room.promote_to_goal, cmd.chat_room.promote_to_plan, cmd.chat_room.promote_to_todo. Native availability
  remains handler_unavailable. Resolve the selected WorkflowScopeV2: application has an actual Server/Computer,
  scope_partition=app and project_id=null, with owner-required thread or pre-message draft and Host/root identity.
  Server-owned pause/trust/home operations use their actual Server scope without fabricating a thread; view-only
  and metadata reads require only their declared owner targets. Project operations use actual immutable Project
  identity. Never use focus, an empty ID, a sentinel Project, HOME or CWD as authority. Permissions PS-144–148
  alone composes actual human|mode|build_grant evidence with retained FileSafe, trust, secrets, capabilities,
  root and parent/receiver ceilings. An app chat or copied receipt conveys no Project mutation/build-grant
  authority. Validate the exact operation-declared source/target refs and revisions/hashes. Mutation/execution
  rechecks the sole writer/lease, permission and Stop/pause/revocation generations at entry and immediately
  before effect. Read/navigation/local paths validate their declared read target/source/view generation; they
  do not demand a write lease merely to inspect. Owner-admitted stale/as-of read-only presentation never claims
  fresh authority or enables effects. Same idempotency key/digest returns the original result; conflict or
  dedupe unavailable performs no effect. Preserve initiating Client, captured source scope/object, invocation/correlation
  token, route, focus, context revision and continuation generation/expiry; return the exact owner result,
  refusal or paused recovery there. Never retarget to a newly focused tab. A late capture, attachment or draft
  insertion preserves both the originating thread AND composer destination, or refuses before draft mutation.
  Every selected request/result/source and active writer/read/backup/retention graph is adopted together or
  remains unavailable. Plans/projects_refresh_command_bindings.json enumerates exact commands, local actions,
  schema pointers, handlers, selectors and producer contracts; expected_event_types=[] for each new primary
  grants no event admission. Native handlers, runtime receipts, visual/accessibility evidence and governance
  certification remain unproved.'
gui_related: true
gui_classification_reason: Defines visible control dispatch, availability, disabled feedback, accessibility
  and exact caller return.
depends_on:
- GRS-086
- GRS-087
- CWR-045
- OSI-440
- CS-113
unblocks: []
acceptance_criteria:
- The six existing cmd.chat.goal.* mutations, Goal editor, four collaboration kinds, participant/message actions
  and Crew Auto admit explicit app siblings and original exact Project contracts. Scope, original accepted
  source/hash, body/control/Stop, parent/receiver authority, roots, roster/config revisions and canonical backup
  join at final dispatch. Ordinary updates never retarget immutable Goal/Plan/Crew bindings. No retired goal.scheduled/degraded/child-state
  producer or Project Workflow/WorkNode certification is revived. App Crew Auto uses an app-thread configuration
  revision, distinct from a thread override and Project configuration; the same evaluator/coordination board
  remains sole owner. Conversion defaults to linked new destination records after safe stop/fence.
- Pointer/keyboard/agent origins resolve one canonical owner and sole handler with exact selected request/result,
  per-action state selector and closed disabled reason; new primary identity occurs exactly once in production
  intent.
- Stale scope/root/target/revision/source/preview/permission/Stop/return mismatch refuses with zero unadmitted
  effects; matching replay returns authentic original custody and no duplicate effect.
- Return preserves original Client/scope/object/route/focus/continuation; unavailable owner or missing adopted
  source graph is reported rather than replaced by focus/current/latest context.
- Local draft/disclosure/navigation has no fictitious domain handler or EventRecord; candidates, forbidden
  aliases and protected auth remain non-dispatchable.
- All relevant original exact Project schema/hash/replay resources remain valid; schema/catalog/concept evidence
  proves no native dispatch, storage, visual, event or readiness fact.
validation_surfaces:
- Plans/projects_refresh_command_bindings.json
- Plans/Wiring_Matrix.production.json
- Plans/pm7_control_bindings.json
- Plans/touch_closure.json
- Plans/touch_closure_action_sources.json
- scripts/pm-touch-closure-verify.py
- scripts/pm-plans-verify.py
risk_class: scope_target_authority_or_command_binding_drift
reasoning_tier: high
context_scope: projects_refresh_goal_crew
implementation_surfaces:
- Plans/UI_Command_Catalog.md
- Plans/projects_refresh_command_bindings.json
- Plans/Wiring_Matrix.production.json
- Plans/pm7_control_bindings.json
- Plans/touch_closure.json
node_compile_hint:
  mode: static_command_wiring_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:chat:2026-11-03-projects-pass2-approved
- PLANS-EDIT-PLAN.md#3
- F-LANE-BRIEF.md
- C-F06
- C-F07
- C-F11
- D-F05
- C-F01
preserved_exact_tokens:
- handler_unavailable
- project_id=null
- cmd.brainstorm.next_round
- cmd.chat.crew_auto.open_config
- cmd.chat.goal.open_editor
- cmd.chat_room.next_round
- cmd.chat_room.summarize
- cmd.collaboration.cancel
- cmd.collaboration.configure
- cmd.collaboration.export
- cmd.collaboration.open
- cmd.collaboration.participant.open
- cmd.collaboration.pause
- cmd.collaboration.reconfigure
- cmd.collaboration.resume
- cmd.review.create_todos
- cmd.review.run_again
- cmd.review.send_findings_to_agent
- cmd.collaboration.message
- cmd.chat.goal.start
- cmd.chat.goal.pause
- cmd.chat.goal.resume
- cmd.chat.goal.cancel
- cmd.chat.goal.update
- cmd.chat.goal.propose_update
- cmd.collaboration.start
- cmd.chat.crew_auto.set
- cmd.brainstorm.synthesize_plan
- cmd.chat_room.promote_to_goal
- cmd.chat_room.promote_to_plan
- cmd.chat_room.promote_to_todo
negative_constraints:
- Do not create duplicate primaries, aliases or independent domain writers.
- Do not infer authority from scope nullability, a preview, a visible control, source reach or copied content.
- Do not reinterpret old exact Project contracts, codecs, hashes or authentic source/receipt bytes.
- Do not claim native availability, Event Authority, buildability, WorkNodes, runtime or governance certification.
owner_hints:
- Plans/UI_Command_Catalog.md
- Plans/Collaborative_Workflows.md
- Plans/Collaborative_Workflows.md
- Plans/assistant-chat-design.md
- Plans/Collaborative_Workflows.md
- Plans/Collaborative_Workflows.md
- Plans/Collaborative_Workflows.md
- Plans/Collaborative_Workflows.md
- Plans/Collaborative_Workflows.md
- Plans/Collaborative_Workflows.md
- Plans/Collaborative_Workflows.md
- Plans/Collaborative_Workflows.md
- Plans/Collaborative_Workflows.md
- Plans/Collaborative_Workflows.md
- Plans/Collaborative_Workflows.md
- Plans/Collaborative_Workflows.md
- Plans/Collaborative_Workflows.md
- Plans/Collaborative_Workflows.md
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-218, ContractName:Plans/projects_refresh_command_bindings.json, ContractName:Plans/Commands_System.md#CS-113

### UCC-219 - Projects Refresh Plan Schedule

```yaml
plan_unit_id: UCC-219
unit_type: integration_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: 'All six Plan/Deep Plan strategies, exact approved versions, agent/goal_driven/Crew Build,
  Build At and scheduled messages/tasks work in app scope through existing owners. Only Planning Wizard, PRD
  Builder and Orchestrator retain no-project workflow gates; Project-native actions still require actual targets.
  Build At atomically commits one frozen schedule/window, creates no run, and never dispatches execution_window.create
  a second time. Server-owned timers preserve DST/grace/missed-policy/idempotency, frozen text/attachments/target
  version and fresh authority/Stop checks. App operational pause has independent real Server custody and user-only
  clear, never a Settings value or missing-as-off. N25 stops/fences source work and explicitly re-admits mapped
  frozen targets with fresh consent/epochs; no automatic resume, latest-version substitution or duplicate occurrence.
  Exact command identities: cmd.chat.plan.cancel, cmd.chat.plan.open_details, cmd.chat.plan.open_version, cmd.chat.plan.view.set,
  cmd.chat.schedule_message.cancel, cmd.chat.schedule_message.update, cmd.execution_window.cancel, cmd.execution_window.create,
  cmd.execution_window.update, cmd.chat.plan.strategy.set, cmd.chat.plan.create, cmd.chat.plan.request_revision,
  cmd.chat.plan.build, cmd.chat.plan.build_with_crew, cmd.chat.plan.schedule_build, cmd.chat.plan.send_to_planning_wizard,
  cmd.chat.plan.export, cmd.chat.schedule_message, cmd.runtime.quota_resume.set, cmd.runtime.automation_pause.set.
  Native availability remains handler_unavailable. Resolve the selected WorkflowScopeV2: application has an
  actual Server/Computer, scope_partition=app and project_id=null, with owner-required thread or pre-message
  draft and Host/root identity. Server-owned pause/trust/home operations use their actual Server scope without
  fabricating a thread; view-only and metadata reads require only their declared owner targets. Project operations
  use actual immutable Project identity. Never use focus, an empty ID, a sentinel Project, HOME or CWD as authority.
  Permissions PS-144–148 alone composes actual human|mode|build_grant evidence with retained FileSafe, trust,
  secrets, capabilities, root and parent/receiver ceilings. An app chat or copied receipt conveys no Project
  mutation/build-grant authority. Validate the exact operation-declared source/target refs and revisions/hashes.
  Mutation/execution rechecks the sole writer/lease, permission and Stop/pause/revocation generations at entry
  and immediately before effect. Read/navigation/local paths validate their declared read target/source/view
  generation; they do not demand a write lease merely to inspect. Owner-admitted stale/as-of read-only presentation
  never claims fresh authority or enables effects. Same idempotency key/digest returns the original result;
  conflict or dedupe unavailable performs no effect. Preserve initiating Client, captured source scope/object,
  invocation/correlation token, route, focus, context revision and continuation generation/expiry; return the
  exact owner result, refusal or paused recovery there. Never retarget to a newly focused tab. A late capture,
  attachment or draft insertion preserves both the originating thread AND composer destination, or refuses
  before draft mutation. Every selected request/result/source and active writer/read/backup/retention graph
  is adopted together or remains unavailable. Plans/projects_refresh_command_bindings.json enumerates exact
  commands, local actions, schema pointers, handlers, selectors and producer contracts; expected_event_types=[]
  for each new primary grants no event admission. Native handlers, runtime receipts, visual/accessibility evidence
  and governance certification remain unproved.

  cmd.permissions.open, cmd.permissions.review_request and cmd.permissions.pick_external_directory select PermissionsOpenV3, PermissionsReviewV3 and PermissionsDirectoryPickerV3 request/result definitions in Plans/projects_refresh_fix_contracts.schema.json. Open and Review return exact route/focus with no rule mutation; Review binds approval_scope_key and the original request digest/revision for inspection only, never a decision. The native directory picker binds the actual Client, offered Settings target and owner revision; only verified selected-directory readback can add it through the existing Permissions owner. Cancel/refusal changes no rule; duplicate paths and invalid globs retain their typed owner errors. Rule mutation contracts and approve/decline handlers remain separate.'
gui_related: true
gui_classification_reason: Defines visible control dispatch, availability, disabled feedback, accessibility
  and exact caller return.
depends_on:
- APR-073
- APR-074
- SQR-019
- SQR-020
- CV-368
- CS-114
unblocks: []
acceptance_criteria:
- All six Plan/Deep Plan strategies, exact approved versions, agent/goal_driven/Crew Build, Build At and scheduled
  messages/tasks work in app scope through existing owners. Only Planning Wizard, PRD Builder and Orchestrator
  retain no-project workflow gates; Project-native actions still require actual targets. Build At atomically
  commits one frozen schedule/window, creates no run, and never dispatches execution_window.create a second
  time. Server-owned timers preserve DST/grace/missed-policy/idempotency, frozen text/attachments/target version
  and fresh authority/Stop checks. App operational pause has independent real Server custody and user-only
  clear, never a Settings value or missing-as-off. N25 stops/fences source work and explicitly re-admits mapped
  frozen targets with fresh consent/epochs; no automatic resume, latest-version substitution or duplicate occurrence.
- Pointer/keyboard/agent origins resolve one canonical owner and sole handler with exact selected request/result,
  per-action state selector and closed disabled reason; new primary identity occurs exactly once in production
  intent.
- Stale scope/root/target/revision/source/preview/permission/Stop/return mismatch refuses with zero unadmitted
  effects; matching replay returns authentic original custody and no duplicate effect.
- Return preserves original Client/scope/object/route/focus/continuation; unavailable owner or missing adopted
  source graph is reported rather than replaced by focus/current/latest context.
- Local draft/disclosure/navigation has no fictitious domain handler or EventRecord; candidates, forbidden
  aliases and protected auth remain non-dispatchable.
- All relevant original exact Project schema/hash/replay resources remain valid; schema/catalog/concept evidence
  proves no native dispatch, storage, visual, event or readiness fact.
validation_surfaces:
- Plans/projects_refresh_command_bindings.json
- Plans/Wiring_Matrix.production.json
- Plans/pm7_control_bindings.json
- Plans/touch_closure.json
- Plans/touch_closure_action_sources.json
- scripts/pm-touch-closure-verify.py
- scripts/pm-plans-verify.py
risk_class: scope_target_authority_or_command_binding_drift
reasoning_tier: high
context_scope: projects_refresh_plan_schedule
implementation_surfaces:
- Plans/UI_Command_Catalog.md
- Plans/projects_refresh_command_bindings.json
- Plans/Wiring_Matrix.production.json
- Plans/pm7_control_bindings.json
- Plans/touch_closure.json
node_compile_hint:
  mode: static_command_wiring_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:chat:2026-11-03-projects-pass2-approved
- PLANS-EDIT-PLAN.md#3
- F-LANE-BRIEF.md
- C-F08
- C-F09
- C-F10
- C-F11
- D-F05
- C-F01
preserved_exact_tokens:
- handler_unavailable
- project_id=null
- cmd.chat.plan.cancel
- cmd.chat.plan.open_details
- cmd.chat.plan.open_version
- cmd.chat.plan.view.set
- cmd.chat.schedule_message.cancel
- cmd.chat.schedule_message.update
- cmd.execution_window.cancel
- cmd.execution_window.create
- cmd.execution_window.update
- cmd.chat.plan.strategy.set
- cmd.chat.plan.create
- cmd.chat.plan.request_revision
- cmd.chat.plan.build
- cmd.chat.plan.build_with_crew
- cmd.chat.plan.schedule_build
- cmd.chat.plan.send_to_planning_wizard
- cmd.chat.plan.export
- cmd.chat.schedule_message
- cmd.runtime.quota_resume.set
- cmd.runtime.automation_pause.set
negative_constraints:
- Do not create duplicate primaries, aliases or independent domain writers.
- Do not infer authority from scope nullability, a preview, a visible control, source reach or copied content.
- Do not reinterpret old exact Project contracts, codecs, hashes or authentic source/receipt bytes.
- Do not claim native availability, Event Authority, buildability, WorkNodes, runtime or governance certification.
owner_hints:
- Plans/UI_Command_Catalog.md
- Plans/Assistant_Plan_Runtime.md
- Plans/Assistant_Plan_Runtime.md
- Plans/Assistant_Plan_Runtime.md
- Plans/Assistant_Plan_Runtime.md
- Plans/Scheduling_and_Quota_Resume.md
- Plans/Scheduling_and_Quota_Resume.md
- Plans/Scheduling_and_Quota_Resume.md
- Plans/Scheduling_and_Quota_Resume.md
- Plans/Scheduling_and_Quota_Resume.md
- Plans/Assistant_Plan_Runtime.md
- Plans/Assistant_Plan_Runtime.md
- Plans/Assistant_Plan_Runtime.md
- Plans/Assistant_Plan_Runtime.md
- Plans/Assistant_Plan_Runtime.md
- Plans/Scheduling_and_Quota_Resume.md
- Plans/Planning_Wizard.md
- Plans/Assistant_Plan_Runtime.md
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-219, ContractName:Plans/projects_refresh_command_bindings.json, ContractName:Plans/Commands_System.md#CS-114
