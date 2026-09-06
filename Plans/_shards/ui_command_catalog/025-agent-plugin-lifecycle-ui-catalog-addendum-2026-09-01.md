# Shard 025: Agent plugin lifecycle UI catalog addendum - 2026-09-01

Source: `Plans/UI_Command_Catalog.md`

Source lines: L10883-L10954

Source SHA256: `48f2f431bc886525e5510bb8e41fad60dbbf4147bb6d4ee78cee4261da7f608d`

---

## Agent plugin lifecycle UI catalog addendum - 2026-09-01

The catalog registers the twelve exact CS-071 identities once and projects the Plugins-owned typed
availability and disabled reason into Plugins, Settings, Doctor, and palette consumers. Every row is
currently disabled with `handler_unavailable`: the future handler target is specified for one-way routing
and uniqueness checks, but no native dispatcher or handler is evidenced. All effects are typed results and
receipts only; no `plugin.*` or `agent_plugin.*` EventRecord is admitted.

| Command ID | Label | Sole specified target | Visible reverse consumers |
|---|---|---|---|
| `cmd.agent_plugin.scan` | Scan Plugins | `handlers::plugins::scan` | Plugins inventory; Settings Plugins manager; Doctor owner recheck; palette |
| `cmd.agent_plugin.install` | Install Plugin | `handlers::plugins::install` | Plugins catalog/add-local; Settings Plugins manager; palette |
| `cmd.agent_plugin.update` | Update Plugin | `handlers::plugins::update` | Plugins update review; Settings Plugins manager; Doctor owner remediation |
| `cmd.agent_plugin.enable` | Enable Plugin | `handlers::plugins::enable` | Plugins row/details; Settings Plugins manager |
| `cmd.agent_plugin.disable` | Disable Plugin | `handlers::plugins::disable` | Plugins row/details; Settings Plugins manager; Doctor owner remediation |
| `cmd.agent_plugin.reload` | Reload Plugin | `handlers::plugins::reload` | Plugins details/update review; Settings Plugins manager |
| `cmd.agent_plugin.remove` | Remove Plugin | `handlers::plugins::remove` | Plugins details; Settings Plugins manager |
| `cmd.agent_plugin.validate` | Validate Plugin | `handlers::plugins::validate` | Plugins details; Settings Plugins manager; Doctor plugin checks |
| `cmd.agent_plugin.review_changes` | Review Plugin Changes | `handlers::plugins::review_changes` | Plugins update review; Settings Plugins manager; Doctor permission/update review |
| `cmd.agent_plugin.rollback` | Roll Back Plugin | `handlers::plugins::rollback` | Plugins recovery; Settings Plugins manager; Doctor rollback health |
| `cmd.agent_plugin.open_details` | Open Plugin Details | `handlers::plugins::open_details` | Plugins row/card; Settings Plugins manager; Doctor bounded Details |
| `cmd.agent_plugin.open_logs` | Open Plugin Logs | `handlers::plugins::open_logs` | Plugins details; Settings Plugins manager; Doctor bounded Logs |

Each consumer reads the same package/plugin identity, package/permission/topology generations, manifest
lane and separate hashes, component isolation, three conformance classes and freshness, containment and
supply-chain state, complete update diff, approval/reapproval, rollback, crash/log bounds, stale promoted
routine, and exact owner reason. Details, Logs, and Receipt are bounded and redacted. A disabled control
remains keyboard reachable and announces `handler_unavailable` plus the action consequence. Doctor only
routes to the owner; it never privately scans, validates, installs, updates, enables, disables, reloads,
removes, rolls back, grants permission, or accepts migration.

ContractRef: ContractName:Plans/Commands_System.md#CS-071, ContractName:Plans/Plugins_System.md#PLUG-069, ContractName:Plans/Plugins_System.md#PLUG-070, ContractName:Plans/Wiring_Matrix.md#WM-048

### UCC-149 - Agent plugin command rows and reverse consumers

```yaml
plan_unit_id: UCC-149
unit_type: command_catalog
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  The UI catalog registers exactly twelve agent-plugin rows with Plugins-owned contracts, one specified
  target, truthful handler_unavailable projection, accessible disabled behavior, exact return, and complete
  reverse coverage across Plugins, Settings, Doctor, and the palette. Settings and Doctor remain consumers,
  no browser concept simulates owner success, and receipt-only effects admit no EventRecord.
gui_related: true
gui_classification_reason: Registers visible plugin lifecycle, review, recovery, details, logs, disabled, and return behavior.
depends_on: [UCC-148, CS-071]
unblocks: [WM-048]
acceptance_criteria:
  - Exactly the twelve CS-071 identities each have one catalog row, one Plugins owner, one specified target, and every intended visible consumer.
  - Every row uses the shared PluginCommandRequest/Result availability, permission, disabled-reason, error, and return contracts without a copied Settings or Doctor schema.
  - All controls remain disabled with handler_unavailable until a source-hashed native dispatcher/handler and production runtime evidence exist.
  - Details, Logs, and Receipt are bounded/redacted; mutating controls preserve confirmation, currentness, update-diff, conformance, provenance, permission, rollback, and recovery gates.
  - Doctor routes to the exact owner command and never mutates privately; no alias, second handler, success simulation, or EventRecord family is admitted.
validation_surfaces: [Plans/Wiring_Matrix.production.json, Plans/touch_closure.json, Concepts/pm7-tools/systems_integration_source.py, python3 scripts/pm-plans-verify.py validate-wiring-matrix, python3 scripts/pm-touch-closure-verify.py]
risk_class: plugin_catalog_or_reverse_consumer_gap
reasoning_tier: high
context_scope: agent_plugin_ui_catalog
implementation_surfaces: [Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json, Concepts/pm7-tools/systems_integration_source.py]
node_compile_hint: {mode: agent_plugin_ui_catalog, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Commands_System.md#CS-071
  - scratchpad/pm-integration-20260831/authority-repairs/plugin-contract-closure/central-settings-doctor-delta-proposal.md
preserved_exact_tokens: [cmd.agent_plugin.scan, cmd.agent_plugin.install, cmd.agent_plugin.update, cmd.agent_plugin.enable, cmd.agent_plugin.disable, cmd.agent_plugin.reload, cmd.agent_plugin.remove, cmd.agent_plugin.validate, cmd.agent_plugin.review_changes, cmd.agent_plugin.rollback, cmd.agent_plugin.open_details, cmd.agent_plugin.open_logs, handler_unavailable]
negative_constraints:
  - Do not enable controls or simulate Plugins-owner success before native/runtime closure.
  - Do not create Settings-local, Doctor-local, palette-local, or concept-local lifecycle commands or handlers.
  - Do not expose raw secrets, private absolute paths, AuthBrowserSession data, internal sockets, or unbounded logs.
  - Do not infer or emit a plugin.* or agent_plugin.* EventRecord family.
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Commands_System.md, Plans/Plugins_System.md, Plans/Wiring_Matrix.md]
```
