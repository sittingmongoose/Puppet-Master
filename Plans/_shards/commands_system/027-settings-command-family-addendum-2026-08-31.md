# Shard 027: Settings Command Family Addendum - 2026-08-31

Source: `Plans/Commands_System.md`

Source lines: L4989-L5173

Source SHA256: `8e1a4820a3cc3fe5fe05c367b7c08923f14f4a93063454d197c652502552f34f`

---

## Settings Command Family Addendum - 2026-08-31

The Settings family contains exactly five canonical command IDs. `Plans/Settings_System.md` owns their semantics and `Plans/settings_system_contracts.schema.json` owns their machine request/result shapes; this document owns central family registration. A registered contract is not evidence that a native handler, dispatcher, persistence path, production GUI, or runtime result exists. Until the sole handler and dispatcher are observed, availability resolves through the Settings projection and may remain disabled with `handler_unavailable` or another exact Settings-owned reason.

| command_id | request_schema_ref | result_schema_ref | effect and owner boundary | executable status |
|---|---|---|---|---|
| `cmd.settings.open` | `Plans/settings_system_contracts.schema.json#/$defs/settings_route_request` (`pm.settings_route_request.v1`) | `Plans/settings_system_contracts.schema.json#/$defs/settings_route_return` (`pm.settings_route_return.v1`) | Opens exactly one stable setting or manager/detail target and preserves the Settings-owned exact return; writes no setting value. | Canonical command contract registered; `handlers::settings::open_route` is the sole declared destination, not a handler-existence claim. |
| `cmd.settings.transaction.preview` | `Plans/settings_system_contracts.schema.json#/$defs/settings_transaction_preview_request` (`pm.settings_transaction_preview_request.v1`) | `Plans/settings_system_contracts.schema.json#/$defs/settings_transaction_preview` (`pm.settings_transaction_preview.v1`) | Resolves one immutable exact-ID proposal under owner/currentness/permission checks and writes nothing. | Canonical command contract registered; `handlers::settings::transaction_preview` remains unproven until executable evidence exists. |
| `cmd.settings.transaction.apply` | `Plans/settings_system_contracts.schema.json#/$defs/settings_transaction_apply_request` (`pm.settings_transaction_apply_request.v1`) | `Plans/settings_system_contracts.schema.json#/$defs/settings_transaction_result` (`pm.settings_transaction_result.v1`) | Applies only the matching current preview under CAS/idempotency, owner readback, and rollback/recovery rules. | Canonical command contract registered; `handlers::settings::transaction_apply` remains unproven until executable evidence exists. |
| `cmd.settings.transaction.rollback` | `Plans/settings_system_contracts.schema.json#/$defs/settings_transaction_rollback_request` (`pm.settings_transaction_rollback_request.v1`) | `Plans/settings_system_contracts.schema.json#/$defs/settings_transaction_result` (`pm.settings_transaction_result.v1`) | Targets one eligible transaction/rollback token and reports recovery truth without fabricating restoration. | Canonical command contract registered; `handlers::settings::transaction_rollback` remains unproven until executable evidence exists. |
| `cmd.settings.export` | `Plans/settings_system_contracts.schema.json#/$defs/settings_export_request` (`pm.settings_export_request.v1`) | `Plans/settings_system_contracts.schema.json#/$defs/settings_export_manifest` (`pm.settings_export_manifest.v1`) | Produces a detached exact-ID non-secret export manifest; changes no Settings value and includes no credential material. | Canonical command contract registered; `handlers::settings::export` remains unproven until executable evidence exists. |

All five commands use the shared command identity, actor/permission, exact Project/topology context, expected revision or generation, idempotency, availability, disabled-reason, acknowledgement, and result boundaries required by their Settings schemas. `accepted` or `acknowledged` is not transaction completion. Settings registers no EventRecord family here; current wiring uses a bounded receipt/route/result disposition and must reject unexpected persisted events until Event Authority independently admits an owner family.

The route-only UI actions `settings.onboarding.open`, `settings.onboarding.run_again`, `settings.guided_tour.resume`, `settings.guided_tour.replay`, `settings.doctor.open`, and `settings.doctor.remediation.open` are not additional commands or aliases. They dispatch `cmd.settings.open` with the exact target frozen by Settings and cannot start Onboarding, resume or replay a tour, run a Doctor probe, or perform remediation.

ContractRef: ContractName:Plans/Settings_System.md#SSYS-018, ContractName:Plans/Settings_System.md#SSYS-019, ContractName:Plans/settings_system_contracts.schema.json, ContractName:Plans/settings_system_contract_fixtures.json, ContractName:Plans/UI_Wiring_Rules.md

### CS-069 - Settings Command Family Registration

```yaml
plan_unit_id: CS-069
unit_type: command_contract
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: 'Exactly five canonical cmd.settings commands are centrally registered with the Settings-owned request/result,
  availability, disabled-reason, idempotency/currentness, receipt, and no-unregistered-event boundaries. The six Onboarding,
  Guided Tour, and Doctor UI actions remain route-only cmd.settings.open consumers. Declared handler destinations are
  contract targets and do not prove that a dispatcher or runtime handler exists. QA round 2, Jared 2026-10-30; DL-258;
  GUI 7d586bad18: Q6/Q7/H1/H5: backup location/Kit/unlock presentation and joined choices reuse the existing fourteen
  onboarding local actions and selected owner routes. No new restore wrapper or onboarding command. DL-259, Jared 2026-10-31:
  ELI5: the wizard bar and Guided Tour bar expose the same global general.interaction.mode through the Settings owner,
  with values ELI5 and Expert, labels Plain English and Expert, and default ELI5. Both bars reflect the same effective
  state. Every opened onboarding question tip and prose help section has useful Plain English and technical versions,
  including FileSafe, service differences, storage, remote access and AI/auth choices, assuming no coding experience.
  Screen copy, control labels, exact fingerprints, paths and receipt data stay single; dual copy is limited to tips/help
  (DL-126). A mode change updates an open tip without rewriting a chat reply. Existing cmd.settings.transaction.preview/apply
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
  a family. D7 B supersedes the former no-per-Client-node restriction. Native Puppet Master apps on Windows, macOS and
  Linux have their own built-in Tailscale connection and sign in once through the shared protected auth owner, with no
  separate Tailscale app install. The same signed PM-owned Go tsnet helper is supervised by its owning PM process. A
  Server keeps one active node per stable server_id; a native Client installation keeps one active node per stable client_id,
  independent of Projects, windows, tabs, sessions and Server endpoint selection. Owner-qualified configuration, process,
  IPC, authorization, egress and secure-state references prevent identity/key sharing or duplicate active nodes. Native
  Client nodes provide bounded Dial/stream access only to verified PM endpoints, not arbitrary proxying or a Server public
  listener. Server nodes retain the automatic private listener; Funnel remains Server-only, explicit, off by default
  and unavailable on Headscale. Human approval and reusable connection identity do not grant PM pairing/trust or work
  permission. A plain browser tab has no embedded Tailscale connection: it needs Remote Link or a private endpoint reachable
  through the device’s own Tailscale connection. It cannot be enrolled by a browser sign-in. Existing user-managed host
  Tailscale stays external and unmanaged. DL-259 srv final, 2026-10-31: Creating observes only the reviewed Project creation/open/restore
  result and its actual prerequisites. It does not run optional remote-access configuration. After that owner settlement,
  a separate postcommit remote-setup view inside automatic_preparation runs any requested Remote Access continuation,
  before the normal provider/Free Models continuation; the eleven-stage graph is unchanged. Tailscale/Headscale authorization,
  new Remote Link output, and configuration-file/export or existing-proxy checks (CERT-1 / srv C1) use their existing
  domain owners, approvals and truthful results. Later always finishes onboarding and leaves the committed Project intact:
  it does not wait for optional setup, certify it, undo owner effects or invent readiness. Unstarted setup is deferred;
  any already-started work obeys the owner’s existing cancel/background rules, and the app shows its actual result or
  pending state. Existing whole-session ui.onboarding.skip/close semantics supply this exit without a new mutation command.
  DL-259 late integration, 2026-10-31: consume PWIZ-024’s one current resolved service/variant/address and validation
  result for the online-copy/import view, its Continue availability/reason and activation. Recheck Protect Connect and
  restore Continue prerequisites through the same existing owners at activation. Invalid or stale input advances nothing
  and dispatches no owner action. Existing local onboarding IDs, reviewed commit, protected auth, permission and return
  fences remain unchanged. DL-259 FO-6/FO-7/FO-8/FO-9, 2026-10-31: protected-field redraw, Copy acknowledgment and answered
  pairing create no new command, receipt or event. Existing local actions retain their owner handoffs and exact operation/generation/return
  fences. Submit reads live protected input (PWIZ-022); refresh does not repeat a completed pairing request (SRV-004);
  Creating checks/blocks consume the current owner’s verified effects (PWIZ-021), including partial GitHub recovery.
  DL-259 FO-9 final, 2026-10-31: Creating’s recovery feedback consumes PWIZ-021/PJCT-007’s current accepted owner result.
  Continue Setup retains the existing cmd.project.resume_creation owner route and its fresh-attempt/retained-recovery
  fence, never the original creation key. Check again consumes the applicable current owner observation/recovery result;
  neither action nor refresh may mark unexecuted phases complete or manufacture Project publication. Checklist, block
  count and stage progress agree on verified settled effects. Existing fourteen local actions, exact return, permission
  and owner-result adoption rules remain; no new phase, recheck or recovery command is admitted.'
gui_related: true
gui_classification_reason: The family governs Settings route, preview, apply, rollback, and export activation, disabled state, outcome, and exact return.
depends_on: [CS-066, SSYS-018, SSYS-019]
unblocks: [UIW-014]
acceptance_criteria:
- The registered set is exactly cmd.settings.open, cmd.settings.transaction.preview, cmd.settings.transaction.apply,
  cmd.settings.transaction.rollback, and cmd.settings.export.
- Every command preserves the exact request_schema_ref and result_schema_ref owned by Plans/settings_system_contracts.schema.json;
  cmd.settings.open returns pm.settings_route_return.v1.
- Preview and open write no setting value; apply and rollback settle only through pm.settings_transaction_result.v1 with
  owner readback; export returns a non-secret pm.settings_export_manifest.v1.
- The six route-only UI actions dispatch cmd.settings.open and authorize no Onboarding, Guided Tour, Doctor probe, or
  remediation operation.
- Registration, a declared handler location, static wiring, schema validation, or a concept simulation is not runtime-handler
  evidence; handler_unavailable remains truthful until executable proof exists.
- No unregistered EventRecord is emitted or inferred.
- 'QA round 2, Jared 2026-10-30; DL-258; GUI 7d586bad18: Q6/Q7/H1/H5: backup location/Kit/unlock presentation and joined
  choices reuse the existing fourteen onboarding local actions and selected owner routes. No new restore wrapper or onboarding
  command.'
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
  a family. D7 B supersedes the former no-per-Client-node restriction. Native Puppet Master apps on Windows, macOS and
  Linux have their own built-in Tailscale connection and sign in once through the shared protected auth owner, with no
  separate Tailscale app install. The same signed PM-owned Go tsnet helper is supervised by its owning PM process. A
  Server keeps one active node per stable server_id; a native Client installation keeps one active node per stable client_id,
  independent of Projects, windows, tabs, sessions and Server endpoint selection. Owner-qualified configuration, process,
  IPC, authorization, egress and secure-state references prevent identity/key sharing or duplicate active nodes. Native
  Client nodes provide bounded Dial/stream access only to verified PM endpoints, not arbitrary proxying or a Server public
  listener. Server nodes retain the automatic private listener; Funnel remains Server-only, explicit, off by default
  and unavailable on Headscale. Human approval and reusable connection identity do not grant PM pairing/trust or work
  permission. A plain browser tab has no embedded Tailscale connection: it needs Remote Link or a private endpoint reachable
  through the device’s own Tailscale connection. It cannot be enrolled by a browser sign-in. Existing user-managed host
  Tailscale stays external and unmanaged.'
- 'DL-259 srv final, 2026-10-31: Creating observes only the reviewed Project creation/open/restore result and its actual
  prerequisites. It does not run optional remote-access configuration. After that owner settlement, a separate postcommit
  remote-setup view inside automatic_preparation runs any requested Remote Access continuation, before the normal provider/Free
  Models continuation; the eleven-stage graph is unchanged. Tailscale/Headscale authorization, new Remote Link output,
  and configuration-file/export or existing-proxy checks (CERT-1 / srv C1) use their existing domain owners, approvals
  and truthful results. Later always finishes onboarding and leaves the committed Project intact: it does not wait for
  optional setup, certify it, undo owner effects or invent readiness. Unstarted setup is deferred; any already-started
  work obeys the owner’s existing cancel/background rules, and the app shows its actual result or pending state. Existing
  whole-session ui.onboarding.skip/close semantics supply this exit without a new mutation command.'
- 'DL-259 late integration, 2026-10-31: consume PWIZ-024’s one current resolved service/variant/address and validation
  result for the online-copy/import view, its Continue availability/reason and activation. Recheck Protect Connect and
  restore Continue prerequisites through the same existing owners at activation. Invalid or stale input advances nothing
  and dispatches no owner action. Existing local onboarding IDs, reviewed commit, protected auth, permission and return
  fences remain unchanged.'
- 'DL-259 FO-6/FO-7/FO-8/FO-9, 2026-10-31: protected-field redraw, Copy acknowledgment and answered pairing create no
  new command, receipt or event. Existing local actions retain their owner handoffs and exact operation/generation/return
  fences. Submit reads live protected input (PWIZ-022); refresh does not repeat a completed pairing request (SRV-004);
  Creating checks/blocks consume the current owner’s verified effects (PWIZ-021), including partial GitHub recovery.'
- 'DL-259 FO-9 final, 2026-10-31: Creating’s recovery feedback consumes PWIZ-021/PJCT-007’s current accepted owner result.
  Continue Setup retains the existing cmd.project.resume_creation owner route and its fresh-attempt/retained-recovery
  fence, never the original creation key. Check again consumes the applicable current owner observation/recovery result;
  neither action nor refresh may mark unexecuted phases complete or manufacture Project publication. Checklist, block
  count and stage progress agree on verified settled effects. Existing fourteen local actions, exact return, permission
  and owner-result adoption rules remain; no new phase, recheck or recovery command is admitted.'
validation_surfaces: [Plans/settings_system_contract_fixtures.json, Plans/Wiring_Matrix.production.json, future Settings dispatcher, handler-absence, CAS, idempotency, restart, redaction, accessibility, and no-unregistered-event fixtures]
risk_class: settings_command_family_or_handler_claim_drift
reasoning_tier: high
context_scope: settings_command_family
implementation_surfaces: [Plans/Commands_System.md, Plans/Settings_System.md, Plans/settings_system_contracts.schema.json, Plans/settings_system_contract_fixtures.json, Plans/UI_Wiring_Rules.md, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: settings_command_family_registration, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- Plans/Settings_System.md#SSYS-018
- Plans/Settings_System.md#SSYS-019
- source_ref:chat:settings-reference-review-canon-closure-2026-08-31
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/lanes/srv/REPORT.md — Owner answers C1–C4, Jared 2026-10-31; product-only
  rules, no hints.
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/lanes/onb/REPORT.md — GLM Name/Kept in amendment at 7aafb35322;
  product behavior only.
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/lanes/fields/REPORT.md — GLM online-service validation and same-kind
  sweep; source implementation serviceChoice and address map are lineage only.
- Concepts/onboarding/opus-5.5/src/js/73-screens-ai.js at cf0ae92b9a; 638b68f169 makes phase-skip feedback immediately
  visible. Source DOM keys, callback helpers and demonstration controls are not product APIs.
- 'PM7 FO-9 final 503368802df57c9d35660d0a89dea15df01afc53 (completes b75da99bef), merged GUI d5a370fc98: 72-screens-review.js
  shownPhases and 55-scenes.js creating props/vars are source lineage, not native API names. Lead 1031175210-c5f1; fields
  report FO-9 final.'
preserved_exact_tokens: [cmd.settings.open, cmd.settings.transaction.preview, cmd.settings.transaction.apply, cmd.settings.transaction.rollback, cmd.settings.export, pm.settings_route_return.v1, handler_unavailable]
negative_constraints:
  - Do not resurrect cmd.settings.bloom.open or mint route-only UI action commands.
  - Do not treat registration, a handler-location string, static wiring, or concept behavior as an executable handler claim.
  - Do not infer transaction completion from acceptance or acknowledgement.
  - Do not invent an EventRecord family.
owner_hints: [Plans/Commands_System.md, Plans/Settings_System.md, Plans/UI_Wiring_Rules.md, Plans/Wiring_Matrix.production.json]
```
