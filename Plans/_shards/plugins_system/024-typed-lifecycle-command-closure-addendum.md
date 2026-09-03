# Shard 024: Typed Lifecycle Command Closure Addendum

Source: `Plans/Plugins_System.md`

Source lines: L4426-L4502

Source SHA256: `0b754bd9e29239becb917810f8b63479913ea56b425d53e00386acc65174f6da`

---

## Typed Lifecycle Command Closure Addendum

This addendum materializes the owner-side machine contract anticipated by PLUG-067 and reconciles it to the separately admitted `CS-071`/`UCC-149`/`WM-048` registration phase without changing the Event Authority boundary. The exact primaries are `cmd.agent_plugin.scan`, `.install`, `.update`, `.enable`, `.disable`, `.reload`, `.remove`, `.validate`, `.review_changes`, `.rollback`, `.open_details`, and `.open_logs`.

All twelve use:

- request: `Plans/plugin_contracts.schema.json#/$defs/PluginCommandRequest`;
- result: `Plans/plugin_contracts.schema.json#/$defs/PluginCommandResult`;
- wiring request alias: `Plans/plugin_contracts.schema.json#/$defs/plugin_command_request`, which is only a `$ref` to `PluginCommandRequest`;
- wiring result alias: `Plans/plugin_contracts.schema.json#/$defs/plugin_command_result`, which is only a `$ref` to `PluginCommandResult`;
- availability: `Plans/plugin_contracts.schema.json#/$defs/PluginCommandAvailability`;
- permission: `Plans/plugin_contracts.schema.json#/$defs/PluginPermissionDecision`;
- error: `Plans/plugin_contracts.schema.json#/$defs/PluginCommandError`;
- disabled reason: `Plans/plugin_contracts.schema.json#/$defs/PluginCommandDisabledReasonCode`.

Requests bind exact package/plugin, Host/Environment, topology, package, and permission generations, command instance, idempotency, permission snapshot, confirmation, work, return context, manifest class/hashes, supply-chain proof, conformance, permission diff, typed update diff, rollback, data disposition, and bounded projection. Results preserve before/after status and generation, component/conformance/supply-chain/update-diff/rollback evidence, exact permission/availability/error refs, work, and receipt. Open Details and Open Logs are bounded read-only projections with no `ObservableWork` mutation. Install, update, enable, remove, and rollback require explicit confirmation.

### Manifest precedence and migration

PM's portable/internal-interchange `plugin.json` and PM-native `pm-plugin.json` remain different signed subjects. `plugin.json` supplies only the portable/interchange baseline and is not, by name alone, a directly loadable OpenAI/Codex, Claude Code, or other external-agent package. `pm-plugin.json` is authoritative only for PM-native components, lifecycle, permissions, hooks, commands, UI, sandbox, and runtime declarations; it cannot retroactively make an interchange-only package PM-native.

For a dual-manifest package, both hashes are mandatory, shared `id` and `version` must agree, and `pm-plugin.json` may extend only PM-native fields under the package and permission ceilings established by admission. Identity mismatch, missing hash, authority widening, or an unsigned post-admission change fails closed. The command schema records the two hashes separately and never collapses them into one precedence-free manifest.

A legacy imported manifest is `legacy_imported`, retains its own `legacy_manifest_sha256`, and remains inactive or quarantined until a deterministic migration emits reviewed `plugin.json` and, only when PM-native declarations exist, `pm-plugin.json`. Migration records source/output hashes, field decisions, dropped/blocked fields, warnings, conformance, permissions, package proof, and rollback. Legacy fields never silently override either current manifest. Update/review/rollback preserve the last verified generation until commit and retain exact migration/provenance evidence.

### Availability, security, and evidence boundary

The semantic owner route is the single plugin lifecycle owner defined in this document. `CS-071`, `UCC-149`, and twelve `WM-048` production-intent rows now provide the central identity/wiring layer, but no native module path is asserted. Every exact ID therefore remains unavailable with `handler_unavailable`; registration cannot be promoted into handler or effect proof.

Because `PluginCommandId` is closed to these twelve now-registered identities, the owner disabled-reason and error enums no longer admit `command_not_registered` for this family. `handler_unavailable` is the exact current-phase code; stale generation, permissions, containment, conformance, supply-chain, approval, quarantine, recovery, and policy codes remain available for their distinct gates.

Permission decisions are exact-scope and snapshot-bound and fix `authority_widening=false`, `credential_material_exposed=false`, `protected_auth_access_allowed=false`, and `private_absolute_path_exposed=false`. Plugins and adapters cannot reach `AuthBrowserSession`, raw secrets, private absolute paths, unbounded logs/process streams, unowned public/control/debug endpoints, mutable Tool Store payloads, or a broader Host/Environment/project capability than admitted. Package/manifest declarations do not self-authorize activation.

GUI consumers are the canonical Plugins inventory/card/details flows and command palette. A bounded owner reconciler may scan/validate current admitted packages under explicit policy; it cannot silently install, update, enable, remove, rollback, grant permission, or accept a migration. Reverse coverage remains exact GUI action -> exact ID -> typed contracts -> one central catalog row -> one production wiring row -> one native lifecycle owner -> receipt projection.

Effects are receipt-only with `event_effect_policy=receipt_only_no_eventrecord_pending_event_authority`. The historical unregistered `plugin.*` producer names remain non-emitting candidates. Static schema/fixture validation does not prove package containment, signature/trust, activation, migration, rollback, native Slint behavior, runtime events, or cross-platform execution.

`Plans/plugin_contract_fixtures.json` provides one positive request and one current-phase fail-closed result for every exact command. All twelve results are `rejected`, preserve generation/status, set `state_changed=false`, expose `state=unavailable` with `handler_unavailable`, settle the exact return context, and retain the receipt-only policy. The pack rejects manifest-lane mixing, missing lifecycle proof/conformance/permission/update-diff/rollback inputs, invalid reload reapproval, missing destructive confirmation/data disposition, command/action mismatch, state change while unavailable, inconsistent availability/return settlement, authority widening, and protected-auth exposure.

ContractRef: SchemaID:pm.plugin.command_contracts.v1, SchemaID:pm.plugins.package_contracts.v1, ContractName:Plans/Release_Supply_Chain.md#RSC-011

### PLUG-069 - Exact Plugin Lifecycle Command Machine Contracts

```yaml
plan_unit_id: PLUG-069
unit_type: schema_contract
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: >-
  Twelve exact cmd.agent_plugin primaries share one closed request, result, availability, permission,
  disabled-reason, and error contract; plugin.json remains the separately hash-bound portable/internal-interchange
  subject, pm-plugin.json remains the PM-native subject, and legacy import uses explicit reviewed migration with no
  silent precedence or authority widening.
gui_related: true
gui_classification_reason: The twelve exact lifecycle, review, details, and logs actions are Plugins management controls.
depends_on: [PLUG-065, PLUG-066, PLUG-067, RSC-011]
unblocks: [PLUG-068]
acceptance_criteria:
  - Every exact command has one positive typed request and result fixture plus closed result/availability/permission/error definitions.
  - Current-phase results for all twelve centrally registered commands remain rejected and unavailable with handler_unavailable and no state, generation, or status change; central identity and production-intent wiring cannot become available without one native handler.
  - Dual manifests bind both hashes and exact identity; legacy import cannot activate before reviewed migration and conformance.
  - Update, reload, review_changes, and rollback bind the same fully typed PluginUpdateDiff identity through request and result/receipt contracts.
  - Permission decisions forbid protected-auth access, credential disclosure, private-path disclosure, and authority widening.
  - Missing native handler remains a typed unavailable state and no EventRecord family is inferred from central registration or production-intent wiring.
  - Lowercase plugin_command_request and plugin_command_result are reference-only aliases to the canonical definitions and contain no duplicate schema substance.
validation_surfaces: [Plans/plugin_contract_fixtures.json, Plans/plugin_package_contract_fixtures.json, CS-071, UCC-149, WM-048, current handler-unavailable results, typed update-diff relation fixtures, and future native lifecycle receipts]
risk_class: plugin_lifecycle_contract_or_manifest_precedence_drift
reasoning_tier: high
context_scope: plugin_lifecycle_typed_closure
implementation_surfaces: [Plans/Plugins_System.md, Plans/plugin_contracts.schema.json, Plans/plugin_package_contracts.schema.json]
node_compile_hint: {mode: plugin_lifecycle_typed_closure, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:PLG-001, source_ref:egolite-requirement:PLG-002, source_ref:egolite-requirement:PLG-003, source_ref:egolite-requirement:PLG-004, source_ref:egolite-requirement:PLG-005, source_ref:egolite-requirement:PLG-006, source_ref:egolite-requirement:PLG-007, source_ref:packet:PKT-04/04_COMMAND_EVENT_WIRING_REGISTER.md:414-438]
negative_constraints:
  - Do not infer the separately admitted central registration or production wiring from owner schema closure, and do not promote either static central fact into a native handler, event producer, runtime success, or security certification.
  - Do not call plugin.json directly loadable by an external agent, let pm-plugin.json override portable identity, or silently promote a legacy manifest.
  - Do not expose AuthBrowserSession, secrets, private absolute paths, unbounded streams, or unadmitted authority to plugins or adapters.
```
