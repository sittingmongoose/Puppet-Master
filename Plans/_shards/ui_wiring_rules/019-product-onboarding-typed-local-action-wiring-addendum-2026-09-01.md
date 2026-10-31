# Shard 019: Product Onboarding typed-local action wiring addendum - 2026-09-01

Source: `Plans/UI_Wiring_Rules.md`

Source lines: L1024-L1360

Source SHA256: `c6491b28e83b20a8a7f662eb8eedf1d1511a3d6a7186d6c941957f0b8bc70ebf`

---

## Product Onboarding typed-local action wiring addendum - 2026-09-01

Product Onboarding remains one bounded modal over the visible, input-blocked application. It does not become a routed page,
nested modal, substitute application frame, or browser-history surface. No browser/route Back or breadcrumb chrome is added;
the existing typed `ui.onboarding.back` control changes only the modal's bounded stage or owner-branch presentation.

The exact current typed-local action census is fourteen:
`ui.onboarding.start`, `ui.onboarding.next`, `ui.onboarding.back`, `ui.onboarding.close`, `ui.onboarding.skip`,
`ui.onboarding.defer`, `ui.onboarding.open_details`, `ui.onboarding.more_ways`,
`ui.onboarding.choose_simple_path`, `ui.onboarding.open_owner_flow`,
`ui.onboarding.run_automatic_preparation`, `ui.onboarding.choose_first_project`, `ui.onboarding.finish`, and
`ui.onboarding.choose_look` (DL-153).
Every actionable control emits exactly one of these IDs. They are not `UICommand`s, catalog aliases, handler names,
EventRecords, or production-wiring rows. The one control inside the modal that emits another typed local action is
the Play reboot moment of the Settings-owned NieR Mode editor panel, which keeps `ui.settings.nier_editor.replay` and
writes nothing (`Plans/Settings_System.md#SSYS-043`).

Each action emits one closed `pm.product_onboarding.action_request.v2` and consumes the exact PWIZ-021 owner definition
for session/stage/currentness, local context, phase-specific command/preflight/commit bindings and focus identity.
`local_context` remains normalized and secret-free; its required/null/gated fields are owned by that schema, not a
second UI wiring field list. It has `additionalProperties=false` semantics:
arbitrary keys, raw payload copies, free-form control payloads, and secret-bearing values are rejected and never logged or
persisted. It resolves to one `pm.product_onboarding.action_result.v2` carrying
`status=applied|disabled|rejected`, before/after stage, resulting session status, closed local effect, session-write flag,
optional continuation snapshot, ephemeral Details state, optional owner route/operation refs,
`production_receipt_ref=null` for local choreography, `owner_mutation_claimed=false`, exact error/disabled reason, focus
return, revision, and continuation generation. Disabled or rejected actions have `local_effect=none`, write no session or
continuation, dispatch no owner route, carry no production receipt, and remain keyboard/focus describable without
activating.

| Typed local action | Required local result boundary |
|---|---|
| `ui.onboarding.start` | `source_surface=first_run` (the window opened by itself because no Project exists yet) paints a Basic Dark preview from the first frame, with Basic Dark preselected, whatever look was shown before; `source_surface=settings_rerun` (Run Onboarding Again) starts in the look on screen, NieR Mode included, preselected. Neither dispatches `cmd.theme.*` nor writes a setting (`Plans/FinalGUISpec.md#F3-520`, DL-153). |
| `ui.onboarding.choose_look` | Q22: `intent=choose_look` carries the closed `local_context.look_choice` for any of five families (including nier), mode or retained NieR parts/background; only changed fields are non-null. It previews and stores the session choice with `look_previewed`, with no Settings dispatch before the existing exact Project commit/finish boundary. `preview_nier` and independent `nier_mode` are retired. `toggle_look_menu` and `toggle_look_editor` carry look_choice null, toggle disclosure only and keep exact focus return. |
| `ui.onboarding.defer` | Before modal dismissal, durably write one resumable continuation snapshot preserving exact stage, selected path, active branch, bounded history, revision, continuation generation, initiating Client, and return-focus identity. It does not complete or skip the session and claims no owner mutation. |
| `ui.onboarding.close` | Dismiss the modal and restore initiating focus without marking the session completed, skipped, deferred, or any owner Ready. It does not silently cancel owner work. |
| `ui.onboarding.skip` | Record the explicit `skipped` session outcome without implying Onboarding-path completion or owner readiness. |
| `ui.onboarding.open_details` | Toggle one bounded same-stage Details disclosure ephemerally; write no `OnboardingSession`, launch no owner route/command, and return focus to the Details toggle. |
| `ui.onboarding.more_ways` | A stage disclosure uses `intent=toggle_setup_options`, `choice=other_setup_options|other_project_options`, matching `scope=setup_options|project_options`, and `branch_kind=null`. A branch-local disclosure/step/selection/consent update uses `intent=update_branch_state`, `choice=null`, a canonical non-null `branch_kind`, and only relevant normalized branch/selection/disclosure fields; its result is `disclosure_opened|disclosure_closed|branch_state_updated`. |
| `ui.onboarding.skip` | Whole-session Skip uses `intent=skip_product_onboarding`, `scope=product_onboarding`, `choice=null`, and returns `session_skipped` with skipped session status. Optional Project or Remote Access Skip uses `intent=skip_optional_scope`, `choice=skip_project|skip_remote_access`, matching `scope=first_project|remote_access` and `branch_kind=project|remote-access`, and returns `optional_scope_skipped` while the session stays active. |

When `ui.onboarding.open_owner_flow` or another owner-launch action is available, its typed route/intent dispatches only
the target owner's existing canonical command and sole handler and returns through the revisioned continuation. Product
Onboarding receives no generic mutation handler. The packet candidate tokens `cmd.onboarding.back`,
`cmd.onboarding.cancel`, `cmd.onboarding.continue`, `cmd.onboarding.defer`, `cmd.onboarding.finish`,
`cmd.onboarding.open_details`, `cmd.onboarding.resume`, and `cmd.onboarding.skip` are source-lineage candidate tokens only
and are rejected as commands, aliases, handlers, and production rows because the typed local `ui.onboarding.*` actions
own those semantics. This is separate from UCC-106's eleven retained provider-first command-era tokens, whose count and
lineage remain unchanged.

Schema/fixture validation and concept reference checks cover vocabulary, markup, request/result, required closed
secret-free `local_context`, ambiguous/missing/additional/raw/secret-bearing-context rejection, both `more_ways`
variants, both global/optional `skip` variants, disabled/rejected, modal/focus, durable defer, explicit Skip,
non-completing Close, and ephemeral Details behavior at their declared
evidence layers. They do not prove a native Slint controller, native Storage binding, dispatcher/handler execution,
production persistence, runtime behavior, accessibility certification, motion quality, or visual acceptance.

ContractRef: ContractName:Plans/Planning_Wizard.md#PWIZ-021, ContractName:Plans/Planning_Wizard.md#PWIZ-022, ContractName:Plans/UI_Command_Catalog.md#UCC-106, ContractName:Plans/Wiring_Matrix.md#WM-041, ContractName:Plans/Decision_Log.md#DL-153, ContractName:Plans/FinalGUISpec.md#F3-520, SchemaID:pm.product_onboarding.action_request.v2, SchemaID:pm.product_onboarding.action_result.v2

### UIW-015 - Product Onboarding typed-local request/result closure

```yaml
plan_unit_id: UIW-015
unit_type: wiring_contract
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: 'Product Onboarding exposes exactly fourteen typed local ui.onboarding.* actions through the closed action-request
  and action-result envelopes. Every control has one action, accessible availability/disabled behavior, deterministic
  local result and focus return, and an owner route only where the action explicitly launches the existing owner command.
  Every request includes closed normalized secret-free local_context, and more_ways/skip variants are disambiguated by
  exact intent, scope, choice, branch, and result-effect combinations rather than arbitrary control payload. Defer durably
  preserves exact continuation, Close is a non-completion dismissal, Skip records a skipped session, and Details is ephemeral/same-stage/non-persistent/owner-command-free.
  ui.onboarding.choose_look (DL-153) previews the five-family look choice, header Look menu and NieR Adjust editor panel
  through a closed look_choice, with no owner route, cmd.theme.* or Settings transaction, the look being written with
  the Project at commit; ui.onboarding.start opens a first_run window in a Basic Dark preview and a settings_rerun window
  in the look on screen. No cmd.onboarding.* command, alias, handler, EventRecord, production row, full-page route, or
  breadcrumb chrome is created. Amended Q22, Jared 2026-10-30 (DL-257): the fifth NieR family supersedes independent-override
  wording; SSYS-043 owns migration and retained Adjust controls. QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18:
  Q6/Q7: point to the actual backup before asking to unlock it. A Recovery Kit is an untrusted locator plus protected
  recovery credential, not a storage place, backup payload, NAS password or cloud sign-in. Offer the Kit first, then
  the explicit no-Kit path to a folder, another device/NAS, or a cloud service. Continue waits for the selected file/folder/device/account
  and required fields. Validate the locator/trust and reach/authenticate the selected place through its existing owner.
  An accepted Kit may unlock that backup, but cannot bypass storage authentication. Show Unlock the backup only for a
  still-locked backup without an accepted unlock; name its selected place. Select a copy, coverage and preview only afterwards.
  Repointing invalidates the former unlock and snapshot selection. Owner recovery prerequisites, approval, protected
  secret handling and actual restore/Project commit boundaries remain mandatory; only a verified Backup owner result
  proves unlock or restore. Q7/H2/H8: a selected choice’s follow-up belongs immediately in a tray joined to that card,
  before sibling alternatives. One shared joined-choice component owns the join, indentation and line from the parent
  mark across all twelve affected screens (DL-258; source mechanics stay lineage under DL-260). The parent opens into
  the tray in every look, with matching edges, no gap or overlapping lower corner/ring; narrow layouts put the parent
  question note first inside the tray. Arrow keys stay in their own choice list, and the option, its radio and question
  control never overlap. Apply to backup places/Kit, existing-work origins, work computer checks, sign-up links, Settings
  copy, remote route and proxy-configuration choices (certificate choices removed by CERT-1 / srv C1), online service
  kind/address, device notes and connection routes. Naming and Review display the same selected mounted/network source,
  rather than an empty local-location field. H5: the onboarding owner holds one original inert-state basis for the entire
  open lifetime. Replacing an already-open screen acquires only newly encountered background nodes; it never re-snapshots
  nodes already held by that modal as originally inert. Every close/finish/skip path removes only the modal’s own holds,
  preserves pre-existing inert nodes and restores focus/input. QA2 follow-up N1, integration 6609384fd0; DL-258: A reached
  backup place is bound to the selected service or device, not a reusable signed-in/ready boolean. Choosing another source,
  service, device, Kit or folder invalidates its old reach proof, protected access fields, unlock, copy selection and
  completed bucket check. A late sign-in/check result stays bound to the service/device it authenticated and cannot advance
  a different current choice. A protected SSH key passphrase unlock belongs to that exact selected key; changing keys
  requires that key’s own owner-proven access and never inherits another key’s unlock. The Remote Link endpoint belongs
  only to the Remote Link route; choosing Only at home/local-or-VPN, Tailscale or another route clears it from the reviewed
  draft. No stale endpoint enters an unrelated route. DL-259, Jared 2026-10-31: ELI5: the wizard bar and Guided Tour
  bar expose the same global general.interaction.mode through the Settings owner, with values ELI5 and Expert, labels
  Plain English and Expert, and default ELI5. Both bars reflect the same effective state. Every opened onboarding question
  tip and prose help section has useful Plain English and technical versions, including FileSafe, service differences,
  storage, remote access and AI/auth choices, assuming no coding experience. Screen copy, control labels, exact fingerprints,
  paths and receipt data stay single; dual copy is limited to tips/help (DL-126). A mode change updates an open tip without
  rewriting a chat reply. Existing cmd.settings.transaction.preview/apply owns the preference; ui.guided_tour.toggle_eli5
  is a compatibility local adapter to that shared preference, not a tour-only setting or chat ELI5 command. The predecessor
  tour_narration_only tag is retired. D3 A: generated proxy settings support Caddy, NGINX and Traefik, with Caddy the
  default. Nginx Proxy Manager is existing-only: it can be selected as an existing proxy but never sent to a generation/install/export
  operation. DL-259 CERT-1 / srv C1, Jared 2026-10-31: onboarding offers Make the settings file or I have one already.
  The first generates/exports Caddy, NGINX or Traefik configuration for the person to add on their own system before
  the owner’s DNS, reachability and live-connection checks; Caddy is the default. The second only checks the existing
  proxy route and live connection, with nothing generated. Set it up for me is removed: Puppet Master does not install
  or host the proxy. The onboarding draft carries proxy_hosting=generate_only or existing_proxy for this new-Server proxy
  branch and keeps proxy_tls null; it collects no certificate choice. Generating a file proves neither installation nor
  consent, identity, secure reachability or a live route. For generation, onboarding proxy_kind is exactly caddy, nginx
  or traefik and maps to reverse_proxy_configuration.proxy_family. The existing-proxy branch may record nginx_proxy_manager
  but never emits a generated-configuration record; neither branch silently substitutes a family. D6 A: the human signs
  in on the initiating active device while the AI/tool runs on the selected execution host. Official tool sign-ins and
  private account roots stay with that tool on that host; direct API keys are held by Puppet Master’s secure credential
  store on that host. Onboarding, Settings, model selection and Usage share stable account/profile/host/environment references,
  never provider-name booleans or copied secrets. Protected returns are bound to the exact operation, initiating Client/session/generation
  and execution host. Changing account, host or route invalidates stale validation; another account of the same provider
  has a distinct identity. D7 B supersedes the former no-per-Client-node restriction. Native Puppet Master apps on Windows,
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
  Tailscale stays external and unmanaged. D8 A: onboarding has one FileSafe switch, default on, covering command blocklist,
  write scope, security filter and pre-write safe points together. Individual controls remain in Settings. The switch
  expresses a requested owner configuration, never approval to bypass a required guard, an absent allowlist/baseline,
  failed canonical-path resolution, failed initialization or failed safe-point persistence. Mandatory policy and effective
  guard state win; a refused change stays refused with a clear reason. No failure silently turns a guard off. DL-259
  srv final, 2026-10-31: Creating observes only the reviewed Project creation/open/restore result and its actual prerequisites.
  It does not run optional remote-access configuration. After that owner settlement, a separate postcommit remote-setup
  view inside automatic_preparation runs any requested Remote Access continuation, before the normal provider/Free Models
  continuation; the eleven-stage graph is unchanged. Tailscale/Headscale authorization, new Remote Link output, and configuration-file/export
  or existing-proxy checks (CERT-1 / srv C1) use their existing domain owners, approvals and truthful results. Later
  always finishes onboarding and leaves the committed Project intact: it does not wait for optional setup, certify it,
  undo owner effects or invent readiness. Unstarted setup is deferred; any already-started work obeys the owner’s existing
  cancel/background rules, and the app shows its actual result or pending state. Existing whole-session ui.onboarding.skip/close
  semantics supply this exit without a new mutation command. DL-259 srv final, 2026-10-31: what the person actually set
  up is what the app shows. Enter/finish binds the shell, Settings and status views to the stable Client, Server, Execution
  Host, route and Project identities supplied by current owner results and registries, with their actual readiness/deferred
  state. Display names never become IDs, and the reviewed setup plan is intent rather than effective state. Onboarding
  creates no second account/server/Project registry or durable handoff writer; its initial context is a non-authoritative
  join of existing owner receipts/projections, followed by their normal updates. No concept-global object, event or store
  key is a product contract. DL-259 owner answers, Jared 2026-10-31: CERT-1 removes PM certificate administration and
  every certificate-selection/validation gate; configuration generation and actual PM route checks report only their
  own result, never certificate validity. CLOUD-1 uses the protected console one-time-code handoff; DESKTOP-RESTORE-1
  uses protected native local handoff with no code to type. Both consume Server-owned initial claim authorization through
  the existing exact claim tuple before separate bootstrap/full restore. REMOTE-CODE-1 is an accepted pre-build protocol
  check alongside D4; no code grammar, new resolver command or wizard caveat is invented. Existing public-exposure consent
  and truthful reachability/identity/pairing checks remain. DL-259 late integration, 2026-10-31: consume PWIZ-024’s one
  current resolved service/variant/address and validation result for the online-copy/import view, its Continue availability/reason
  and activation. Recheck Protect Connect and restore Continue prerequisites through the same existing owners at activation.
  Invalid or stale input advances nothing and dispatches no owner action. Existing local onboarding IDs, reviewed commit,
  protected auth, permission and return fences remain unchanged. DL-259 FO-6/FO-7/FO-8/FO-9, 2026-10-31: redraw/Copy
  feedback and answered pairing are local view state, not extra onboarding commands or owner transitions. Follow PWIZ-022’s
  protected-field lifetime, SRV-004’s terminal pairing-result handling, F3-182’s acknowledgment interval and PWIZ-021’s
  verified Creating phases. Existing typed local actions and domain approval/recovery/export routes remain; refresh never
  resubmits a consumed result or marks an unexecuted phase complete.'
gui_related: true
gui_classification_reason: Defines the visible modal controls, activation/result behavior, disabled presentation, focus return, and Details disclosure.
split_recommended: false
depends_on: [PWIZ-021, PWIZ-022, UCC-106, WM-041, UIW-013]
unblocks: []
acceptance_criteria:
- The exact action census is the fourteen named ui.onboarding.* IDs, and every authored control carries exactly one typed
  local action.
- ui.onboarding.choose_look's choose_look intent (Q22 retires preview_nier) carry a closed look_choice with only the
  changed fields non-null and write the session with look_previewed; its two toggles carry look_choice null and write
  nothing; none has an owner route, owner command, cmd.theme.* or Settings transaction (DL-153).
- ui.onboarding.start with source_surface first_run paints a Basic Dark preview with Basic Dark preselected; with settings_rerun
  it keeps the look on screen preselected; neither writes a setting (F3-520, DL-153).
- Every request/result validates against pm.product_onboarding.action_request.v2 and pm.product_onboarding.action_result.v2
  with closed applied, disabled, and rejected outcomes.
- local_context consumes PWIZ-021's exact closed v2 owner definition, including required nullable phase/command/preflight/Project-commit
  bindings and their gated proofs; the wiring rule does not re-own a field list. Missing/additional/arbitrary/raw/secret-bearing
  context is rejected.
- UI controls preserve the bounded uncreated draft and Settings-owned copy preview until exact Review commit. Precommit
  routes require current owner-issued read-only or selected-source-auth admission and actual owner request validation;
  a route/ref string alone grants nothing. Paid-provider then Free Models setup uses the real committed Project; Close/resume/Back
  neither undo nor repeat its creation. Consume PWIZ-021, PJCT-007, SSYS-036, MACS-005, and MS-122.
- more_ways stage disclosure and branch-local state updates cannot normalize into each other, and whole-session Skip
  cannot normalize into optional Project/Remote-Access Skip; exact request fields and result effects/statuses prove the
  selected variant.
- Disabled/rejected results have no local effect, write, continuation, owner route, owner operation, or production receipt
  and expose exact accessible reasons.
- Defer persists exact stage/path/branch/history/revision/continuation/initiating-Client/focus return before dismissal;
  Close does not complete; Skip is explicitly skipped; Details remains same-stage and ephemeral.
- The eight named packet candidate cmd.onboarding.* tokens are source-lineage only and receive no command, alias, handler,
  or production row; UCC-106's eleven retired command-era tokens retain their separate lineage count.
- The flow stays a bounded modal with no route-history or breadcrumb chrome, and no static/browser evidence is treated
  as native or runtime proof.
- 'QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q6/Q7: point to the actual backup before asking to unlock it.
  A Recovery Kit is an untrusted locator plus protected recovery credential, not a storage place, backup payload, NAS
  password or cloud sign-in. Offer the Kit first, then the explicit no-Kit path to a folder, another device/NAS, or a
  cloud service. Continue waits for the selected file/folder/device/account and required fields. Validate the locator/trust
  and reach/authenticate the selected place through its existing owner. An accepted Kit may unlock that backup, but cannot
  bypass storage authentication. Show Unlock the backup only for a still-locked backup without an accepted unlock; name
  its selected place. Select a copy, coverage and preview only afterwards. Repointing invalidates the former unlock and
  snapshot selection. Owner recovery prerequisites, approval, protected secret handling and actual restore/Project commit
  boundaries remain mandatory; only a verified Backup owner result proves unlock or restore. Q7/H2/H8: a selected choice’s
  follow-up belongs immediately in a tray joined to that card, before sibling alternatives. One shared joined-choice
  component owns the join, indentation and line from the parent mark across all twelve affected screens (DL-258; source
  mechanics stay lineage under DL-260). The parent opens into the tray in every look, with matching edges, no gap or
  overlapping lower corner/ring; narrow layouts put the parent question note first inside the tray. Arrow keys stay in
  their own choice list, and the option, its radio and question control never overlap. Apply to backup places/Kit, existing-work
  origins, work computer checks, sign-up links, Settings copy, remote route and proxy-configuration choices (certificate
  choices removed by CERT-1 / srv C1), online service kind/address, device notes and connection routes. Naming and Review
  display the same selected mounted/network source, rather than an empty local-location field. H5: the onboarding owner
  holds one original inert-state basis for the entire open lifetime. Replacing an already-open screen acquires only newly
  encountered background nodes; it never re-snapshots nodes already held by that modal as originally inert. Every close/finish/skip
  path removes only the modal’s own holds, preserves pre-existing inert nodes and restores focus/input.'
- 'QA2 follow-up N1, integration 6609384fd0; DL-258: A reached backup place is bound to the selected service or device,
  not a reusable signed-in/ready boolean. Choosing another source, service, device, Kit or folder invalidates its old
  reach proof, protected access fields, unlock, copy selection and completed bucket check. A late sign-in/check result
  stays bound to the service/device it authenticated and cannot advance a different current choice. A protected SSH key
  passphrase unlock belongs to that exact selected key; changing keys requires that key’s own owner-proven access and
  never inherits another key’s unlock. The Remote Link endpoint belongs only to the Remote Link route; choosing Only
  at home/local-or-VPN, Tailscale or another route clears it from the reviewed draft. No stale endpoint enters an unrelated
  route.'
- 'DL-259, Jared 2026-10-31: ELI5: the wizard bar and Guided Tour bar expose the same global general.interaction.mode
  through the Settings owner, with values ELI5 and Expert, labels Plain English and Expert, and default ELI5. Both bars
  reflect the same effective state. Every opened onboarding question tip and prose help section has useful Plain English
  and technical versions, including FileSafe, service differences, storage, remote access and AI/auth choices, assuming
  no coding experience. Screen copy, control labels, exact fingerprints, paths and receipt data stay single; dual copy
  is limited to tips/help (DL-126). A mode change updates an open tip without rewriting a chat reply. Existing cmd.settings.transaction.preview/apply
  owns the preference; ui.guided_tour.toggle_eli5 is a compatibility local adapter to that shared preference, not a tour-only
  setting or chat ELI5 command. The predecessor tour_narration_only tag is retired. D3 A: generated proxy settings support
  Caddy, NGINX and Traefik, with Caddy the default. Nginx Proxy Manager is existing-only: it can be selected as an existing
  proxy but never sent to a generation/install/export operation. DL-259 CERT-1 / srv C1, Jared 2026-10-31: onboarding
  offers Make the settings file or I have one already. The first generates/exports Caddy, NGINX or Traefik configuration
  for the person to add on their own system before the owner’s DNS, reachability and live-connection checks; Caddy is
  the default. The second only checks the existing proxy route and live connection, with nothing generated. Set it up
  for me is removed: Puppet Master does not install or host the proxy. The onboarding draft carries proxy_hosting=generate_only
  or existing_proxy for this new-Server proxy branch and keeps proxy_tls null; it collects no certificate choice. Generating
  a file proves neither installation nor consent, identity, secure reachability or a live route. For generation, onboarding
  proxy_kind is exactly caddy, nginx or traefik and maps to reverse_proxy_configuration.proxy_family. The existing-proxy
  branch may record nginx_proxy_manager but never emits a generated-configuration record; neither branch silently substitutes
  a family. D6 A: the human signs in on the initiating active device while the AI/tool runs on the selected execution
  host. Official tool sign-ins and private account roots stay with that tool on that host; direct API keys are held by
  Puppet Master’s secure credential store on that host. Onboarding, Settings, model selection and Usage share stable
  account/profile/host/environment references, never provider-name booleans or copied secrets. Protected returns are
  bound to the exact operation, initiating Client/session/generation and execution host. Changing account, host or route
  invalidates stale validation; another account of the same provider has a distinct identity. D7 B supersedes the former
  no-per-Client-node restriction. Native Puppet Master apps on Windows, macOS and Linux have their own built-in Tailscale
  connection and sign in once through the shared protected auth owner, with no separate Tailscale app install. The same
  signed PM-owned Go tsnet helper is supervised by its owning PM process. A Server keeps one active node per stable server_id;
  a native Client installation keeps one active node per stable client_id, independent of Projects, windows, tabs, sessions
  and Server endpoint selection. Owner-qualified configuration, process, IPC, authorization, egress and secure-state
  references prevent identity/key sharing or duplicate active nodes. Native Client nodes provide bounded Dial/stream
  access only to verified PM endpoints, not arbitrary proxying or a Server public listener. Server nodes retain the automatic
  private listener; Funnel remains Server-only, explicit, off by default and unavailable on Headscale. Human approval
  and reusable connection identity do not grant PM pairing/trust or work permission. A plain browser tab has no embedded
  Tailscale connection: it needs Remote Link or a private endpoint reachable through the device’s own Tailscale connection.
  It cannot be enrolled by a browser sign-in. Existing user-managed host Tailscale stays external and unmanaged. D8 A:
  onboarding has one FileSafe switch, default on, covering command blocklist, write scope, security filter and pre-write
  safe points together. Individual controls remain in Settings. The switch expresses a requested owner configuration,
  never approval to bypass a required guard, an absent allowlist/baseline, failed canonical-path resolution, failed initialization
  or failed safe-point persistence. Mandatory policy and effective guard state win; a refused change stays refused with
  a clear reason. No failure silently turns a guard off.'
- 'DL-259 srv final, 2026-10-31: Creating observes only the reviewed Project creation/open/restore result and its actual
  prerequisites. It does not run optional remote-access configuration. After that owner settlement, a separate postcommit
  remote-setup view inside automatic_preparation runs any requested Remote Access continuation, before the normal provider/Free
  Models continuation; the eleven-stage graph is unchanged. Tailscale/Headscale authorization, new Remote Link output,
  and configuration-file/export or existing-proxy checks (CERT-1 / srv C1) use their existing domain owners, approvals
  and truthful results. Later always finishes onboarding and leaves the committed Project intact: it does not wait for
  optional setup, certify it, undo owner effects or invent readiness. Unstarted setup is deferred; any already-started
  work obeys the owner’s existing cancel/background rules, and the app shows its actual result or pending state. Existing
  whole-session ui.onboarding.skip/close semantics supply this exit without a new mutation command.'
- 'DL-259 srv final, 2026-10-31: what the person actually set up is what the app shows. Enter/finish binds the shell,
  Settings and status views to the stable Client, Server, Execution Host, route and Project identities supplied by current
  owner results and registries, with their actual readiness/deferred state. Display names never become IDs, and the reviewed
  setup plan is intent rather than effective state. Onboarding creates no second account/server/Project registry or durable
  handoff writer; its initial context is a non-authoritative join of existing owner receipts/projections, followed by
  their normal updates. No concept-global object, event or store key is a product contract.'
- 'DL-259 owner answers, Jared 2026-10-31: CERT-1 removes PM certificate administration and every certificate-selection/validation
  gate; configuration generation and actual PM route checks report only their own result, never certificate validity.
  CLOUD-1 uses the protected console one-time-code handoff; DESKTOP-RESTORE-1 uses protected native local handoff with
  no code to type. Both consume Server-owned initial claim authorization through the existing exact claim tuple before
  separate bootstrap/full restore. REMOTE-CODE-1 is an accepted pre-build protocol check alongside D4; no code grammar,
  new resolver command or wizard caveat is invented. Existing public-exposure consent and truthful reachability/identity/pairing
  checks remain.'
- 'DL-259 late integration, 2026-10-31: consume PWIZ-024’s one current resolved service/variant/address and validation
  result for the online-copy/import view, its Continue availability/reason and activation. Recheck Protect Connect and
  restore Continue prerequisites through the same existing owners at activation. Invalid or stale input advances nothing
  and dispatches no owner action. Existing local onboarding IDs, reviewed commit, protected auth, permission and return
  fences remain unchanged.'
- 'DL-259 FO-6/FO-7/FO-8/FO-9, 2026-10-31: redraw/Copy feedback and answered pairing are local view state, not extra
  onboarding commands or owner transitions. Follow PWIZ-022’s protected-field lifetime, SRV-004’s terminal pairing-result
  handling, F3-182’s acknowledgment interval and PWIZ-021’s verified Creating phases. Existing typed local actions and
  domain approval/recovery/export routes remain; refresh never resubmits a consumed result or marks an unexecuted phase
  complete.'
validation_surfaces: [Plans/product_onboarding_contracts.schema.json, Plans/product_onboarding_contract_fixtures.json, future native Product Onboarding request/result and accessibility fixtures]
risk_class: onboarding_local_action_or_result_wiring_drift
reasoning_tier: high
context_scope: product_onboarding_typed_local_request_result
implementation_surfaces: [Plans/UI_Wiring_Rules.md, Plans/Planning_Wizard.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md, Plans/product_onboarding_contracts.schema.json]
node_compile_hint: {mode: product_onboarding_local_action_wiring, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- approved current Product Onboarding source/schema reconciliation
- Plans/Planning_Wizard.md#PWIZ-021
- Plans/product_onboarding_contracts.schema.json
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/DECISIONS-ONBOARDING.md (Owner questions, Jared 2026-10-31; DL-259)
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/lanes/srv/REPORT.md — Owner answers C1–C4, Jared 2026-10-31; product-only
  rules, no hints.
- 'DL-260 source lineage only: C.cards with its under slot and o55-under/o55-card-parent classes implement the shared
  joined-choice tray; these source APIs/classes are not native product contracts.'
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/lanes/onb/REPORT.md — GLM Name/Kept in amendment at 7aafb35322;
  product behavior only.
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/lanes/fields/REPORT.md — GLM online-service validation and same-kind
  sweep; source implementation serviceChoice and address map are lineage only.
- Concepts/onboarding/opus-5.5/src/js/73-screens-ai.js at cf0ae92b9a; 638b68f169 makes phase-skip feedback immediately
  visible. Source DOM keys, callback helpers and demonstration controls are not product APIs.
preserved_exact_tokens: [ui.onboarding.start, ui.onboarding.next, ui.onboarding.back, ui.onboarding.close, ui.onboarding.skip, ui.onboarding.defer, ui.onboarding.open_details, ui.onboarding.more_ways, ui.onboarding.choose_simple_path, ui.onboarding.open_owner_flow, ui.onboarding.run_automatic_preparation, ui.onboarding.choose_first_project, ui.onboarding.finish, ui.onboarding.choose_look, look_choice, look_previewed, preview_nier, toggle_look_menu, toggle_look_editor, pm.product_onboarding.action_request.v2, pm.product_onboarding.action_result.v2, local_context, skip_product_onboarding, skip_optional_scope, toggle_setup_options, update_branch_state, session_skipped, optional_scope_skipped, cmd.onboarding.back, cmd.onboarding.cancel, cmd.onboarding.continue, cmd.onboarding.defer, cmd.onboarding.finish, cmd.onboarding.open_details, cmd.onboarding.resume, cmd.onboarding.skip]
negative_constraints:
  - Do not register, alias, normalize, wire, or assign handlers to packet candidate cmd.onboarding.* tokens.
  - Do not fabricate an owner mutation, production receipt, EventRecord, or durable write from local Details or a disabled/rejected result.
  - Do not conflate Close, Skip, Defer, Finish, or Ready state.
  - Do not accept open-ended local_context, arbitrary/raw payload copies, secret-bearing values, or ambiguous more_ways/skip combinations.
  - Do not turn Product Onboarding into a page, nested modal, route-history surface, or breadcrumb flow.
  - Do not claim native Slint, Storage, dispatcher, handler, runtime, accessibility, motion, or visual proof from schemas, fixtures, static assertions, or browser checks.
owner_hints: [Plans/UI_Wiring_Rules.md, Plans/Planning_Wizard.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md]
```
