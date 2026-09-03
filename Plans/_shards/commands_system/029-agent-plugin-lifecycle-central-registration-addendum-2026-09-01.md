# Shard 029: Agent plugin lifecycle central registration addendum - 2026-09-01

Source: `Plans/Commands_System.md`

Source lines: L5062-L5136

Source SHA256: `f083fc0c7e53c324e4b735dc7df7db49667b8f504ac8c22329fa3aa4f6274487`

---

## Agent plugin lifecycle central registration addendum - 2026-09-01

The Plugins System remains the sole semantic lifecycle owner. This addendum registers the exact twelve
owner-backed command identities centrally so Plugins, Settings, Doctor, and the palette share one command
language. Registration changes their truthful unavailable state from `command_not_registered` to
`handler_unavailable`; it does not create Rust code, a dispatcher, package execution, persistence, or runtime
evidence. The sole specified targets below are future dispatch destinations and are not handler-existence claims.

All rows use `Plans/plugin_contracts.schema.json#/$defs/PluginCommandRequest` and
`#/$defs/PluginCommandResult`, including the owner availability, permission, disabled-reason, error,
idempotency/currentness, exact-return, receipt, and bounded-projection contracts. Package, manifest,
conformance, migration, containment, adapter, component-isolation, update-diff, rollback, and supply-chain
records remain owned by `Plans/plugin_package_contracts.schema.json`.

| Command ID | Sole specified target | Action boundary |
|---|---|---|
| `cmd.agent_plugin.scan` | `handlers::plugins::scan` | Bounded owner reconciliation; no silent install, activation, permission grant, or mutation. |
| `cmd.agent_plugin.install` | `handlers::plugins::install` | Confirmed admitted-package installation with conformance, provenance, containment, permission, and rollback gates. |
| `cmd.agent_plugin.update` | `handlers::plugins::update` | Confirmed generation-fenced replacement bound to the complete typed update diff and retained prior generation. |
| `cmd.agent_plugin.enable` | `handlers::plugins::enable` | Confirmed PM-native or dual-manifest activation only after all owner gates pass. |
| `cmd.agent_plugin.disable` | `handlers::plugins::disable` | Generation-fenced deactivation that preserves truthful component and owned-data state. |
| `cmd.agent_plugin.reload` | `handlers::plugins::reload` | Confirmed revalidation/reapproval path bound to the exact update diff and rollback proof. |
| `cmd.agent_plugin.remove` | `handlers::plugins::remove` | Confirmed removal with explicit retain/remove/migrate/recovery owned-data disposition. |
| `cmd.agent_plugin.validate` | `handlers::plugins::validate` | Read-only owner validation and bounded result projection. |
| `cmd.agent_plugin.review_changes` | `handlers::plugins::review_changes` | Read-only bounded review of the exact typed update diff and authority changes. |
| `cmd.agent_plugin.rollback` | `handlers::plugins::rollback` | Confirmed rollback to the retained verified generation with exact recovery truth. |
| `cmd.agent_plugin.open_details` | `handlers::plugins::open_details` | Bounded redacted read-only details projection. |
| `cmd.agent_plugin.open_logs` | `handlers::plugins::open_logs` | Bounded redacted read-only logs projection; no unbounded stream or private path. |

Every effect is `receipt_only_no_eventrecord_pending_event_authority`. The retained `agent_plugin.*` and
`plugin.*` names remain non-emitting candidates, not EventRecord registrations. No alias or second handler is
admitted. Missing native implementation, stale generations, unavailable conformance/provenance/containment/
rollback evidence, approval or permission, quarantine, policy, or recovery state remains a typed disabled result.

ContractRef: ContractName:Plans/Plugins_System.md#PLUG-069, ContractName:Plans/Plugins_System.md#PLUG-070, ContractName:Plans/plugin_contracts.schema.json, ContractName:Plans/plugin_package_contracts.schema.json

### CS-071 - Agent plugin lifecycle central registration

```yaml
plan_unit_id: CS-071
unit_type: command_contract
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Exactly twelve agent-plugin lifecycle, review, details, and logs commands are centrally registered
  against the Plugins-owned typed contracts and one specified Plugins target each. Registration advances
  their fail-closed state to handler_unavailable but proves no native handler, package operation, persistence,
  runtime result, security behavior, or EventRecord; effects remain receipt-only.
gui_related: true
gui_classification_reason: The commands back visible Plugins, Settings, Doctor, update-review, rollback, details, logs, and palette controls.
depends_on: [CS-070, PLUG-069, PLUG-070]
unblocks: [UCC-149, WM-048]
acceptance_criteria:
  - The registered set is exactly scan, install, update, enable, disable, reload, remove, validate, review_changes, rollback, open_details, and open_logs under cmd.agent_plugin.
  - Every command uses the one Plugins-owned request/result/availability/permission/error family and the package owner records without duplicating schemas or lifecycle ownership.
  - Every row has one specified future target, exact return settlement, and handler_unavailable until source-hashed native dispatcher and handler evidence exists.
  - Mutating commands retain confirmation, generation, conformance, provenance, containment, permission, update-diff, rollback, and recovery gates; details/logs remain bounded and redacted.
  - All effects remain receipt-only and no plugin.* or agent_plugin.* EventRecord family, compatibility alias, or second handler is admitted.
validation_surfaces: [Plans/plugin_contract_fixtures.json, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json, python3 scripts/pm-new-contracts-verify.py, python3 scripts/pm-plans-verify.py validate-wiring-matrix]
risk_class: plugin_command_registration_or_false_handler_claim
reasoning_tier: high
context_scope: agent_plugin_central_registration
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json]
node_compile_hint: {mode: agent_plugin_central_registration, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Plugins_System.md#PLUG-069
  - Plans/Plugins_System.md#PLUG-070
  - scratchpad/pm-integration-20260831/authority-repairs/plugin-contract-closure/central-settings-doctor-delta-proposal.md
preserved_exact_tokens: [cmd.agent_plugin.scan, cmd.agent_plugin.install, cmd.agent_plugin.update, cmd.agent_plugin.enable, cmd.agent_plugin.disable, cmd.agent_plugin.reload, cmd.agent_plugin.remove, cmd.agent_plugin.validate, cmd.agent_plugin.review_changes, cmd.agent_plugin.rollback, cmd.agent_plugin.open_details, cmd.agent_plugin.open_logs, handler_unavailable, receipt_only_no_eventrecord_pending_event_authority]
negative_constraints:
  - Do not interpret registration or a handler target string as native implementation, runtime success, security certification, or readiness.
  - Do not create a second plugin lifecycle owner, handler, schema family, command alias, or EventRecord family.
  - Do not enable a control or simulate success before native handler, production route, and fresh runtime receipt closure.
owner_hints: [Plans/Commands_System.md, Plans/Plugins_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md]
```
