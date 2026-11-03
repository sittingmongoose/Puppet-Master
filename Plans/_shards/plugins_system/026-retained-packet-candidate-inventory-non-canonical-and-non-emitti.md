# Shard 026: Retained Packet Candidate Inventory (Non-Canonical And Non-Emitting)

Source: `Plans/Plugins_System.md`

Source lines: L4596-L4696

Source SHA256: `d9a210e3a709ee17b5fd624480bcbe73969fee68d37c1c90113b20217cf23809`

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
- Phase 2 F companion/schema and semantic fixtures (not run in phase 1).
- Post-landing owner/command/wiring/touch reconciliation; native runtime and GUI evidence remain required.
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
