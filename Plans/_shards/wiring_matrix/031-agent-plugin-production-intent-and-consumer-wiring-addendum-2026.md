# Shard 031: Agent plugin production-intent and consumer wiring addendum - 2026-09-01

Source: `Plans/Wiring_Matrix.md`

Source lines: L4096-L4170

Source SHA256: `d108a46be70fbc2c9a91dc216f291f8238ed1201412f6582a4ad93a1ccad03f6`

---

## Agent plugin production-intent and consumer wiring addendum - 2026-09-01

The production-intent matrix carries one row for each CS-071/UCC-149 identity. Each row names the one future
Plugins target and every Plugins/Settings/Doctor/palette consumer, but remains default-disabled with
`handler_unavailable` until a native dispatcher, handler, package operation, persistence path, and fresh
runtime receipt exist. These are planned routing contracts, not fake Rust handlers or production proof.

| Wiring row | Command | Specified target | Primary reverse consumers |
|---|---|---|---|
| `catalog.agent_plugin_scan` | `cmd.agent_plugin.scan` | `handlers::plugins::scan` | Plugins inventory; Settings manager; Doctor recheck; palette |
| `catalog.agent_plugin_install` | `cmd.agent_plugin.install` | `handlers::plugins::install` | Plugins catalog/local import; Settings manager; palette |
| `catalog.agent_plugin_update` | `cmd.agent_plugin.update` | `handlers::plugins::update` | Plugins update review; Settings manager; Doctor remediation |
| `catalog.agent_plugin_enable` | `cmd.agent_plugin.enable` | `handlers::plugins::enable` | Plugins row/details; Settings manager |
| `catalog.agent_plugin_disable` | `cmd.agent_plugin.disable` | `handlers::plugins::disable` | Plugins row/details; Settings manager; Doctor remediation |
| `catalog.agent_plugin_reload` | `cmd.agent_plugin.reload` | `handlers::plugins::reload` | Plugins details/review; Settings manager |
| `catalog.agent_plugin_remove` | `cmd.agent_plugin.remove` | `handlers::plugins::remove` | Plugins details; Settings manager |
| `catalog.agent_plugin_validate` | `cmd.agent_plugin.validate` | `handlers::plugins::validate` | Plugins details; Settings manager; Doctor checks |
| `catalog.agent_plugin_review_changes` | `cmd.agent_plugin.review_changes` | `handlers::plugins::review_changes` | Plugins review; Settings manager; Doctor permission/update review |
| `catalog.agent_plugin_rollback` | `cmd.agent_plugin.rollback` | `handlers::plugins::rollback` | Plugins recovery; Settings manager; Doctor rollback health |
| `catalog.agent_plugin_open_details` | `cmd.agent_plugin.open_details` | `handlers::plugins::open_details` | Plugins/Settings/Doctor bounded Details |
| `catalog.agent_plugin_open_logs` | `cmd.agent_plugin.open_logs` | `handlers::plugins::open_logs` | Plugins/Settings/Doctor bounded Logs |

Every request/result binds the exact package/plugin, Host/Environment, package/permission/topology generations,
manifest lane and separate hashes, admitted package/supply-chain/conformance/permission/update-diff/rollback refs,
idempotency, confirmation where required, bounded projection, and exact caller return. Mutating and long work retains
`ObservableWork`; read-only Details and Logs do not claim mutation. Effects are typed results and immutable receipts
under `receipt_only_no_eventrecord_pending_event_authority`. Caller close never silently cancels owner work; only the
exact owner cancellation semantics may do so. Error or stale state changes no package generation/status.

Settings and Doctor consume the same Plugins owner facts. Settings does not parse packages, run adapters, migrate
manifests, validate signatures, scan containment, or mutate lifecycle state. Doctor reads cached/fresh projections,
routes recheck/remediation, and never privately performs a Plugins action. All browser-concept controls stay disabled
and return the exact reason; their action logs prove neither dispatch nor owner work.

ContractRef: ContractName:Plans/Commands_System.md#CS-071, ContractName:Plans/UI_Command_Catalog.md#UCC-149, ContractName:Plans/Plugins_System.md#PLUG-070, ContractName:Plans/touch_closure.json

### WM-048 - Agent plugin production-intent and reverse-route closure

```yaml
plan_unit_id: WM-048
unit_type: wiring_contract
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  Twelve planned production-intent rows bind every exact agent-plugin identity to its Plugins-owned
  request/result contracts, one specified future target, truthful handler_unavailable projection, receipt-only
  effect, exact return, accessibility, tests, and all Plugins/Settings/Doctor/palette reverse consumers. The rows
  do not prove a native handler or runtime effect, and Settings, Doctor, and PMConcept7 never simulate owner success.
gui_related: true
gui_classification_reason: Connects every visible plugin lifecycle, review, recovery, details, and logs control to one owner route and return path.
depends_on: [WM-047, CS-071, UCC-149, PLUG-070]
unblocks: []
acceptance_criteria:
  - Exactly twelve unique production-intent rows cover the twelve CS-071 identities, each with one Plugins target, typed request/result, availability selector, disabled reason, receipt effect, accessibility, tests, and reverse consumers.
  - Every row is disabled with handler_unavailable until executable dispatcher/handler and fresh runtime proof exist; a target string, schema, fixture, concept log, or browser pass is not handler evidence.
  - Mutating work preserves confirmation, currentness, conformance, provenance, containment, permission, update-diff, rollback, ObservableWork, cancellation, recovery, and exact-return requirements.
  - Settings and Doctor consume Plugins owner facts and commands without private parsing, validation, adapter, migration, repair, or lifecycle mutation.
  - All effects remain receipt-only and no plugin.* or agent_plugin.* EventRecord, alias, second handler, or success simulation is admitted.
validation_surfaces: [Plans/Wiring_Matrix.production.json, Plans/touch_closure.json, Plans/plugin_contract_fixtures.json, Concepts/pm7-tools/systems_integration_source.py, python3 scripts/pm-plans-verify.py validate-wiring-matrix, python3 scripts/pm-touch-closure-verify.py]
risk_class: plugin_wiring_or_false_runtime_closure
reasoning_tier: high
context_scope: agent_plugin_production_intent
implementation_surfaces: [Plans/Wiring_Matrix.md, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json, Concepts/pm7-tools/systems_integration_source.py]
node_compile_hint: {mode: agent_plugin_production_intent, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Commands_System.md#CS-071
  - Plans/UI_Command_Catalog.md#UCC-149
  - scratchpad/pm-integration-20260831/authority-repairs/plugin-contract-closure/central-settings-doctor-delta-proposal.md
preserved_exact_tokens: [catalog.agent_plugin_scan, catalog.agent_plugin_install, catalog.agent_plugin_update, catalog.agent_plugin_enable, catalog.agent_plugin_disable, catalog.agent_plugin_reload, catalog.agent_plugin_remove, catalog.agent_plugin_validate, catalog.agent_plugin_review_changes, catalog.agent_plugin_rollback, catalog.agent_plugin_open_details, catalog.agent_plugin_open_logs, handler_unavailable, receipt_only_no_eventrecord_pending_event_authority]
negative_constraints:
  - Do not treat planned wiring, a handler-location string, PMConcept7 behavior, or browser evidence as native/runtime proof.
  - Do not let Settings or Doctor become a plugin lifecycle, adapter, migration, validation, or repair owner.
  - Do not enable a control, simulate a successful owner result, expose unbounded/private data, or invent an EventRecord family.
owner_hints: [Plans/Wiring_Matrix.md, Plans/UI_Command_Catalog.md, Plans/Commands_System.md, Plans/Plugins_System.md]
```
