# Shard 026: Retained Packet Candidate Inventory (Non-Canonical And Non-Emitting)

Source: `Plans/Plugins_System.md`

Source lines: L4596-L4979

Source SHA256: `ddd8af20bd919318e67b7488a4391bb6a9655cc3233643dfbdad278d29cc8132`

---

## Retained Packet Candidate Inventory (Non-Canonical And Non-Emitting)

The following PKT-04 names are retained so packet extraction cannot silently disappear during typed closure. This is an inventory only: every row has `canonical=false`, `registered=false`, `emits_eventrecord=false`, and `disposition=deferred_non_emitting_event_candidate`. The common reason is `event_authority_and_native_producer_contract_absent`. These names are not added to the event registry or any schema enum:

`agent_plugin.discovered`, `agent_plugin.validated`, `agent_plugin.installed`, `agent_plugin.updated`, `agent_plugin.enabled`, `agent_plugin.disabled`, `agent_plugin.removed`, `agent_plugin.component_loaded`, `agent_plugin.component_skipped`, `agent_plugin.component_failed`, `agent_plugin.rollback_completed`.

The typed lifecycle contract is stricter than retention alone. Install, update, enable, reload, remove, and rollback require non-null admitted package proof, at least one applicable conformance ref, an exact permission diff, and rollback evidence; update, reload, review changes, and rollback additionally require the fully typed update-diff identity. Enable admits only a PM-native or dual manifest. Reload additionally requires human confirmation and a separately referenced authority-change/revalidation decision. Remove requires an explicit owned-data disposition. When centrally registered and natively available, Scan, Validate, Review Changes, Open Details, and Open Logs are machine-declared no-effect results; Review Changes and the two open projections require bounded projections. In the current unregistered phase every exact command result is rejected with no state change. Every result settles one non-secret caller return context. These predicates remain static admission shapes, not package, handler, activation, rollback, or native proof.

### PLUG-071 - Plugin Installation, Reach And Application Isolation

```yaml
plan_unit_id: PLUG-071
unit_type: requirement
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: Plugins installs verified packages per Computer, with explicit definition home/reach and
  resolver-driven enablement; project_switch_ids=[extensions.plugins.plugin-on-off] binds the switch to
  plugin_id. A whole Project version is a whole verified owner package/configuration, never a field merge
  or installation elsewhere. No-project discovery skips Project-local entries and requires allowed library/Computer
  reach. For chat/session execution, the versioned PluginContext and session.start payload bind actual
  application scope, project_root=None, user, Server/Host/Environment, thread and session. PLUGIN_ROOT
  remains the verified read-only package root. PLUGIN_DATA is partitioned by plugin/user/place/session
  ownership with the existing quota and retention; a null Project value cannot select another Project
  or a common private-data directory. Copy sends only exact non-secret owner configuration/reach/switch
  contributions through Settings preview/apply/rollback. It never installs executable code, grants first-load/version
  trust, copies private plugin data or credentials, or widens permitted hooks/capabilities. Conversion
  creates fresh destination context and revalidates installations, trust and policy; it never retargets
  an admitted running hook or imports private session data as configuration. The owner contribution is
  named in owner_thing_previews; scope_model and project_switch_ids describe its manager boundary. settings.follow
  never grants thing mutation or Project content authority. The selected whole-version/copy operation
  is cmd.plugin.copy_configuration through sole planned handler handlers::plugins::copy_configuration,
  with Plans/plugin_contracts.schema.json#/$defs/PluginCopyConfigurationRequest and Plans/plugin_contracts.schema.json#/$defs/PluginCopyConfigurationResult.
  The Settings batch invokes this owner contribution, including exact source hash/revision, destination
  CAS, declared reach/switch deltas, readback and eligible compensation; it never writes owner records
  directly. These registrations do not prove native availability; missing schema, handler, trust, installation
  or currentness remains typed unavailable.
gui_related: true
gui_classification_reason: Owns user-visible manager, activity or control behavior.
depends_on:
- PLUG-008
- PLUG-011
- PLUG-012
- PLUG-016
- PLUG-020
- SSYS-061
- SSYS-062
unblocks: []
acceptance_criteria:
- Two app threads and a Project cannot collide through a null-key plugin data path.
- A copied enabled plugin remains unavailable until the exact destination installation/trust/permission
  gates pass.
- Owner rollback restores previewed enablement/reach/configuration without undoing unrelated installation
  or source changes.
validation_surfaces:
- scripts/pm-projects-refresh-contracts.py
- future post-landing owner/command/wiring/touch reconciliation; native runtime and GUI evidence remain required.
risk_class: scope_authority_or_custody_drift
reasoning_tier: high
context_scope: project_and_application_scope
implementation_surfaces:
- Plans/Plugins_System.md
- Plans/settings_system_contracts.schema.json
- Plans/Shared_Integration_Runtime.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-b; S8–S11; N12/N25
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/SETTINGS-PROPOSAL.md#4.1;4.5;5
- 'Jared, 2026-11-03: "I approve the outstanding questions with their recommended settings."'
- 'Jared, 2026-11-03: "Those look good, except goals and crew should be allowed in no project."'
- 'Jared, 2026-11-03: "Plan mode and scheduled tasks are also available in no project. It''s only planning
  wizard/prd builder/orchestrator that isn''t."'
- projects-refresh-20261030/pass2/plans-edit-requests/A-requests.md#A-B01
- projects-refresh-20261030/pass2/plans-edit-requests/D-requests.md#D-B01
- projects-refresh-20261030/pass2/plans-edit-requests/Fb-requests.md#Fb-B02
preserved_exact_tokens:
- PluginContext
- session.start
- PLUGIN_ROOT
- PLUGIN_DATA
- project_switch_ids
- extensions.plugins.plugin-on-off
- owner_thing_previews
- scope_model
- settings.follow
- cmd.plugin.copy_configuration
- handlers::plugins::copy_configuration
negative_constraints:
- Do not copy tokens, private PLUGIN_DATA, user sign-ins or live hooks as settings.
- Do not reclassify protected auth, arg-touching hooks or Project-only reach through an app context.
- Do not infer an implemented handler, admitted event writer, native verification, WorkNode, NodeSeed
  or governance clearance from this accepted contract.
owner_hints:
- Plans/Plugins_System.md
- Plans/Settings_System.md
- Plans/Permissions_System.md
```

ContractRef: ContractName:Plans/Plugins_System.md#PLUG-071, ContractName:Plans/Settings_System.md#SSYS-002, ContractName:Plans/Contracts_V0.md#CV-365


<a id="PLUG-131"></a>
### PLUG-131 - plugin.hook.blocked prepared event contract

```yaml
plan_unit_id: PLUG-131
unit_type: contract
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: >-
  plugin.hook.blocked prepared event contract. This is a newly authored owner contract under DL-045, prepared without admission.
gui_related: false
gui_classification_reason: Defines persisted contract behavior and no visual presentation.
depends_on: [DL-045, SP-671]
unblocks: []
acceptance_criteria:
- Exact-family schema and semantic checks pass; no event is emitted before separate admission.
validation_surfaces: [scripts/pm-dg6b-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: event_authority_dg6b
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DG6B.md
implementation_surfaces: [Plans/Plugins_System.md, Plans/dg6b_event_contracts.schema.json]
node_compile_hint: {mode: contract_only, create_worknodes: false}
```

**Newly authored owner contract for `plugin.hook.blocked` at payload version `1.0.0`.** Search: exact token in live top-level Plans Markdown/JSON/JSONL, then this owner, Contracts EventRecord/AuthEvent, Storage SP-278/SP-286/SP-291/SP-336 and storage_value_registry. Existing semantic condition is retained; no exact closed payload, producer receipt binding, identity recipe or named operating consumer was found. Reuse the generic index and first-receipt custody. Per-family search matches and source hashes are pinned in the DG6B report. This draft admits nothing; `plugin.hook.blocked` remains non-emitting until separate registration and retention resolution.

Producer: **hook Block result handler**. Only an execution-flow hook named `pre_tool_invoke`, `pre_attempt_start` or `pre_node_dispatch` may return an execution-blocking Block result, under this owner’s “Hooks that may block execution” restriction. Retain the redacted reason ref and existing plugin_hook_blocked routing. Observation-only hooks including `post_tool_invoke` and `post_attempt_complete` cannot create this event or stop execution; a Block-shaped observation is rejected at this boundary. Replay cannot block a new attempt. The payload is exactly `Plans/dg6b_event_contracts.schema.json#/$defs/plugin_hook_blocked` (closed root; no extension map). Storage `SP-671` below is this family's own persistence contract. `subject_ref` identifies the original pending auth flow/account binding or plugin operation subject, never a display login or mutable plugin label. The `revision` is the observed operation revision; it cannot be advanced by retry. Actor identity comes from authenticated command/runtime custody, not a payload assertion.

Do not add UI, auth providers, hooks, permissions or command behavior from this draft. Original bodies stay with the existing credential/plugin owner. Evidence refs are resolved only through current owner authorization. Event text contains metadata and refs, never raw prompts, hook output, token/device_code secrets or credential values. This contract does not assign retention or deletion policy.



<a id="PLUG-132"></a>
### PLUG-132 - plugin.hook.error prepared event contract

```yaml
plan_unit_id: PLUG-132
unit_type: contract
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: >-
  plugin.hook.error prepared event contract. This is a newly authored owner contract under DL-045, prepared without admission.
gui_related: false
gui_classification_reason: Defines persisted contract behavior and no visual presentation.
depends_on: [DL-045, SP-671]
unblocks: []
acceptance_criteria:
- Exact-family schema and semantic checks pass; no event is emitted before separate admission.
validation_surfaces: [scripts/pm-dg6b-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: event_authority_dg6b
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DG6B.md
implementation_surfaces: [Plans/Plugins_System.md, Plans/dg6b_event_contracts.schema.json]
node_compile_hint: {mode: contract_only, create_worknodes: false}
```

**Newly authored owner contract for `plugin.hook.error` at payload version `1.0.0`.** Search: exact token in live top-level Plans Markdown/JSON/JSONL, then this owner, Contracts EventRecord/AuthEvent, Storage SP-278/SP-286/SP-291/SP-336 and storage_value_registry. Existing semantic condition is retained; no exact closed payload, producer receipt binding, identity recipe or named operating consumer was found. Reuse the generic index and first-receipt custody. Per-family search matches and source hashes are pinned in the DG6B report. This draft admits nothing; `plugin.hook.error` remains non-emitting until separate registration and retention resolution.

Producer: **hook error/timeout result handler**. A dispatched hook throws or times out; error_class distinguishes those outcomes without raw exception text. The payload is exactly `Plans/dg6b_event_contracts.schema.json#/$defs/plugin_hook_error` (closed root; no extension map). Storage `SP-671` below is this family's own persistence contract. `subject_ref` identifies the original pending auth flow/account binding or plugin operation subject, never a display login or mutable plugin label. The `revision` is the observed operation revision; it cannot be advanced by retry. Actor identity comes from authenticated command/runtime custody, not a payload assertion.

Do not add UI, auth providers, hooks, permissions or command behavior from this draft. Original bodies stay with the existing credential/plugin owner. Evidence refs are resolved only through current owner authorization. Event text contains metadata and refs, never raw prompts, hook output, token/device_code secrets or credential values. This contract does not assign retention or deletion policy.



For this family, `hook_name` in the payload and stored operation is one of the section 4 canonical hook names or the five documented PLUG-064 lifecycle aliases. The aliases retain their exact recorded spelling; `tool.before` and unknown names are refused even when every frozen/physical copy agrees. This binds the dispatched hook catalog and does not admit a new hook. Valid retained records keep their original owner-defined spelling and bytes; current Settings never rename them.

<a id="PLUG-133"></a>
### PLUG-133 - plugin.hook.invoked prepared event contract

```yaml
plan_unit_id: PLUG-133
unit_type: contract
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: >-
  plugin.hook.invoked prepared event contract. This is a newly authored owner contract under DL-045, prepared without admission.
gui_related: false
gui_classification_reason: Defines persisted contract behavior and no visual presentation.
depends_on: [DL-045, SP-671]
unblocks: []
acceptance_criteria:
- Exact-family schema and semantic checks pass; no event is emitted before separate admission.
validation_surfaces: [scripts/pm-dg6b-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: event_authority_dg6b
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DG6B.md
implementation_surfaces: [Plans/Plugins_System.md, Plans/dg6b_event_contracts.schema.json]
node_compile_hint: {mode: contract_only, create_worknodes: false}
```

**Newly authored owner contract for `plugin.hook.invoked` at payload version `1.0.0`.** Search: exact token in live top-level Plans Markdown/JSON/JSONL, then this owner, Contracts EventRecord/AuthEvent, Storage SP-278/SP-286/SP-291/SP-336 and storage_value_registry. Existing semantic condition is retained; no exact closed payload, producer receipt binding, identity recipe or named operating consumer was found. Reuse the generic index and first-receipt custody. Per-family search matches and source hashes are pinned in the DG6B report. This draft admits nothing; `plugin.hook.invoked` remains non-emitting until separate registration and retention resolution.

Producer: **hook dispatch completion observer**. A hook dispatch has completed with measured duration. This observation is independent from its Block or error outcome and is never replayed as another invocation. The payload is exactly `Plans/dg6b_event_contracts.schema.json#/$defs/plugin_hook_invoked` (closed root; no extension map). Storage `SP-671` below is this family's own persistence contract. `subject_ref` identifies the original pending auth flow/account binding or plugin operation subject, never a display login or mutable plugin label. The `revision` is the observed operation revision; it cannot be advanced by retry. Actor identity comes from authenticated command/runtime custody, not a payload assertion.

Do not add UI, auth providers, hooks, permissions or command behavior from this draft. Original bodies stay with the existing credential/plugin owner. Evidence refs are resolved only through current owner authorization. Event text contains metadata and refs, never raw prompts, hook output, token/device_code secrets or credential values. This contract does not assign retention or deletion policy.



For this family, `hook_name` in the payload and stored operation is one of the section 4 canonical hook names or the five documented PLUG-064 lifecycle aliases. The aliases retain their exact recorded spelling; `tool.before` and unknown names are refused even when every frozen/physical copy agrees. This binds the dispatched hook catalog and does not admit a new hook. Valid retained records keep their original owner-defined spelling and bytes; current Settings never rename them.

<a id="PLUG-134"></a>
### PLUG-134 - plugin.load_failed prepared event contract

```yaml
plan_unit_id: PLUG-134
unit_type: contract
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: >-
  plugin.load_failed prepared event contract. This is a newly authored owner contract under DL-045, prepared without admission.
gui_related: false
gui_classification_reason: Defines persisted contract behavior and no visual presentation.
depends_on: [DL-045, SP-671]
unblocks: []
acceptance_criteria:
- Exact-family schema and semantic checks pass; no event is emitted before separate admission.
validation_surfaces: [scripts/pm-dg6b-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: event_authority_dg6b
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DG6B.md
implementation_surfaces: [Plans/Plugins_System.md, Plans/dg6b_event_contracts.schema.json]
node_compile_hint: {mode: contract_only, create_worknodes: false}
```

**Newly authored owner contract for `plugin.load_failed` at payload version `1.0.0`.** Search: exact token in live top-level Plans Markdown/JSON/JSONL, then this owner, Contracts EventRecord/AuthEvent, Storage SP-278/SP-286/SP-291/SP-336 and storage_value_registry. Existing semantic condition is retained; no exact closed payload, producer receipt binding, identity recipe or named operating consumer was found. Reuse the generic index and first-receipt custody. Per-family search matches and source hashes are pinned in the DG6B report. This draft admits nothing; `plugin.load_failed` remains non-emitting until separate registration and retention resolution.

Producer: **plugin loader failure handler**. A load attempt fails manifest validation or entry initialization. No successful loaded fact is permitted for that same terminal attempt. The payload is exactly `Plans/dg6b_event_contracts.schema.json#/$defs/plugin_load_failed` (closed root; no extension map). Storage `SP-671` below is this family's own persistence contract. `subject_ref` identifies the original pending auth flow/account binding or plugin operation subject, never a display login or mutable plugin label. The `revision` is the observed operation revision; it cannot be advanced by retry. Actor identity comes from authenticated command/runtime custody, not a payload assertion.

Do not add UI, auth providers, hooks, permissions or command behavior from this draft. Original bodies stay with the existing credential/plugin owner. Evidence refs are resolved only through current owner authorization. Event text contains metadata and refs, never raw prompts, hook output, token/device_code secrets or credential values. This contract does not assign retention or deletion policy.



<a id="PLUG-135"></a>
### PLUG-135 - plugin.loaded prepared event contract

```yaml
plan_unit_id: PLUG-135
unit_type: contract
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: >-
  plugin.loaded prepared event contract. This is a newly authored owner contract under DL-045, prepared without admission.
gui_related: false
gui_classification_reason: Defines persisted contract behavior and no visual presentation.
depends_on: [DL-045, SP-671]
unblocks: []
acceptance_criteria:
- Exact-family schema and semantic checks pass; no event is emitted before separate admission.
validation_surfaces: [scripts/pm-dg6b-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: event_authority_dg6b
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DG6B.md
implementation_surfaces: [Plans/Plugins_System.md, Plans/dg6b_event_contracts.schema.json]
node_compile_hint: {mode: contract_only, create_worknodes: false}
```

**Newly authored owner contract for `plugin.loaded` at payload version `1.0.0`.** Search: exact token in live top-level Plans Markdown/JSON/JSONL, then this owner, Contracts EventRecord/AuthEvent, Storage SP-278/SP-286/SP-291/SP-336 and storage_value_registry. Existing semantic condition is retained; no exact closed payload, producer receipt binding, identity recipe or named operating consumer was found. Reuse the generic index and first-receipt custody. Per-family search matches and source hashes are pinned in the DG6B report. This draft admits nothing; `plugin.loaded` remains non-emitting until separate registration and retention resolution.

Producer: **plugin loader activation observer**. Initialization completes under the existing approval, conformance and manifest-hash gates. This event cannot authorize activation or bypass pm-plugin.json validation. The payload is exactly `Plans/dg6b_event_contracts.schema.json#/$defs/plugin_loaded` (closed root; no extension map). Storage `SP-671` below is this family's own persistence contract. `subject_ref` identifies the original pending auth flow/account binding or plugin operation subject, never a display login or mutable plugin label. The `revision` is the observed operation revision; it cannot be advanced by retry. Actor identity comes from authenticated command/runtime custody, not a payload assertion.

Do not add UI, auth providers, hooks, permissions or command behavior from this draft. Original bodies stay with the existing credential/plugin owner. Evidence refs are resolved only through current owner authorization. Event text contains metadata and refs, never raw prompts, hook output, token/device_code secrets or credential values. This contract does not assign retention or deletion policy.



<a id="PLUG-136"></a>
### PLUG-136 - plugin.permission.override prepared event contract

```yaml
plan_unit_id: PLUG-136
unit_type: contract
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: >-
  plugin.permission.override prepared event contract. This is a newly authored owner contract under DL-045, prepared without admission.
gui_related: false
gui_classification_reason: Defines persisted contract behavior and no visual presentation.
depends_on: [DL-045, SP-671]
unblocks: []
acceptance_criteria:
- Exact-family schema and semantic checks pass; no event is emitted before separate admission.
validation_surfaces: [scripts/pm-dg6b-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: event_authority_dg6b
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DG6B.md
implementation_surfaces: [Plans/Plugins_System.md, Plans/dg6b_event_contracts.schema.json]
node_compile_hint: {mode: contract_only, create_worknodes: false}
```

**Newly authored owner contract for `plugin.permission.override` at payload version `1.0.0`.** Search: exact token in live top-level Plans Markdown/JSON/JSONL, then this owner, Contracts EventRecord/AuthEvent, Storage SP-278/SP-286/SP-291/SP-336 and storage_value_registry. Existing semantic condition is retained; no exact closed payload, producer receipt binding, identity recipe or named operating consumer was found. Reuse the generic index and first-receipt custody. Per-family search matches and source hashes are pinned in the DG6B report. This draft admits nothing; `plugin.permission.override` remains non-emitting until separate registration and retention resolution.

Producer: **permission.ask override result handler**. The existing permission engine records a plugin Allow or Deny override before presenting the resulting decision. Continue is not an override; permission snapshots and command authority remain with Permissions. The payload is exactly `Plans/dg6b_event_contracts.schema.json#/$defs/plugin_permission_override` (closed root; no extension map). Storage `SP-671` below is this family's own persistence contract. `subject_ref` identifies the original pending auth flow/account binding or plugin operation subject, never a display login or mutable plugin label. The `revision` is the observed operation revision; it cannot be advanced by retry. Actor identity comes from authenticated command/runtime custody, not a payload assertion.

Do not add UI, auth providers, hooks, permissions or command behavior from this draft. Original bodies stay with the existing credential/plugin owner. Evidence refs are resolved only through current owner authorization. Event text contains metadata and refs, never raw prompts, hook output, token/device_code secrets or credential values. This contract does not assign retention or deletion policy.



<a id="PLUG-137"></a>
### PLUG-137 - plugin.tool.collision prepared event contract

```yaml
plan_unit_id: PLUG-137
unit_type: contract
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: >-
  plugin.tool.collision prepared event contract. This is a newly authored owner contract under DL-045, prepared without admission.
gui_related: false
gui_classification_reason: Defines persisted contract behavior and no visual presentation.
depends_on: [DL-045, SP-671]
unblocks: []
acceptance_criteria:
- Exact-family schema and semantic checks pass; no event is emitted before separate admission.
validation_surfaces: [scripts/pm-dg6b-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: event_authority_dg6b
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DG6B.md
implementation_surfaces: [Plans/Plugins_System.md, Plans/dg6b_event_contracts.schema.json]
node_compile_hint: {mode: contract_only, create_worknodes: false}
```

**Newly authored owner contract for `plugin.tool.collision` at payload version `1.0.0`.** Search: exact token in live top-level Plans Markdown/JSON/JSONL, then this owner, Contracts EventRecord/AuthEvent, Storage SP-278/SP-286/SP-291/SP-336 and storage_value_registry. Existing semantic condition is retained; no exact closed payload, producer receipt binding, identity recipe or named operating consumer was found. Reuse the generic index and first-receipt custody. Per-family search matches and source hashes are pinned in the DG6B report. This draft admits nothing; `plugin.tool.collision` remains non-emitting until separate registration and retention resolution.

Producer: **plugin tool-registry collision handler**. A proposed registration collides; record its existing resolution result without changing the tool naming or permission policy. The payload is exactly `Plans/dg6b_event_contracts.schema.json#/$defs/plugin_tool_collision` (closed root; no extension map). Storage `SP-671` below is this family's own persistence contract. `subject_ref` identifies the original pending auth flow/account binding or plugin operation subject, never a display login or mutable plugin label. The `revision` is the observed operation revision; it cannot be advanced by retry. Actor identity comes from authenticated command/runtime custody, not a payload assertion.

Do not add UI, auth providers, hooks, permissions or command behavior from this draft. Original bodies stay with the existing credential/plugin owner. Evidence refs are resolved only through current owner authorization. Event text contains metadata and refs, never raw prompts, hook output, token/device_code secrets or credential values. This contract does not assign retention or deletion policy.



<a id="PLUG-138"></a>
### PLUG-138 - plugin.tool.registered prepared event contract

```yaml
plan_unit_id: PLUG-138
unit_type: contract
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: >-
  plugin.tool.registered prepared event contract. This is a newly authored owner contract under DL-045, prepared without admission.
gui_related: false
gui_classification_reason: Defines persisted contract behavior and no visual presentation.
depends_on: [DL-045, SP-671]
unblocks: []
acceptance_criteria:
- Exact-family schema and semantic checks pass; no event is emitted before separate admission.
validation_surfaces: [scripts/pm-dg6b-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: event_authority_dg6b
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DG6B.md
implementation_surfaces: [Plans/Plugins_System.md, Plans/dg6b_event_contracts.schema.json]
node_compile_hint: {mode: contract_only, create_worknodes: false}
```

**Newly authored owner contract for `plugin.tool.registered` at payload version `1.0.0`.** Search: exact token in live top-level Plans Markdown/JSON/JSONL, then this owner, Contracts EventRecord/AuthEvent, Storage SP-278/SP-286/SP-291/SP-336 and storage_value_registry. Existing semantic condition is retained; no exact closed payload, producer receipt binding, identity recipe or named operating consumer was found. Reuse the generic index and first-receipt custody. Per-family search matches and source hashes are pinned in the DG6B report. This draft admits nothing; `plugin.tool.registered` remains non-emitting until separate registration and retention resolution.

Producer: **plugin tool-registry commit observer**. A non-colliding or owner-resolved custom tool registration is committed. The event cannot grant execution permission or re-register the tool on replay. The payload is exactly `Plans/dg6b_event_contracts.schema.json#/$defs/plugin_tool_registered` (closed root; no extension map). Storage `SP-671` below is this family's own persistence contract. `subject_ref` identifies the original pending auth flow/account binding or plugin operation subject, never a display login or mutable plugin label. The `revision` is the observed operation revision; it cannot be advanced by retry. Actor identity comes from authenticated command/runtime custody, not a payload assertion.

Do not add UI, auth providers, hooks, permissions or command behavior from this draft. Original bodies stay with the existing credential/plugin owner. Evidence refs are resolved only through current owner authorization. Event text contains metadata and refs, never raw prompts, hook output, token/device_code secrets or credential values. This contract does not assign retention or deletion policy.
