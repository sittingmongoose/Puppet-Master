# Shard 023: PM-Internal Interchange, Target Adapter, And PM-Native Package Contract Addendum - 2026-08-31

Source: `Plans/Plugins_System.md`

Source lines: L4221-L4424

Source SHA256: `0b754bd9e29239becb917810f8b63479913ea56b425d53e00386acc65174f6da`

---

## PM-Internal Interchange, Target Adapter, And PM-Native Package Contract Addendum - 2026-08-31

This addendum resolves the manifest conflict identified by the Egolite canon re-audit. The Plugins System remains the only plugin package, discovery, validation, activation, hook, tool, component, and lifecycle owner. Shared Integration Runtime supplies only the existing `RuntimeResourceGovernor`, `ObservableWork`, exact Host/Environment identity, leases, and generic durable command mechanics; Release Supply Chain owns package provenance admission. No `Integration_Runtime.md`, `Agent_Plugins_Compatibility.md`, or second plugin/runtime owner is created.

The closed package contract is `SchemaID:pm.plugins.package_contracts.v1` in `Plans/plugin_package_contracts.schema.json`. It is a pre-build package/receipt schema, not executable plugin runtime or Event Authority evidence. Central command and production-intent wiring registration is now separately admitted through `CS-071`, `UCC-149`, and `WM-048`; those records do not establish a native Plugins handler or runtime effect.

### Manifest split, target adaptation, and deterministic precedence

There are two distinct Puppet Master manifests plus separately generated external target packages:

1. PM-internal interchange `plugin.json` declares only the Puppet Master interchange floor: skills under `skills/` plus MCP configuration in `mcp.json`. It is not a directly loadable OpenAI/Codex or Claude Code package and cannot declare PM hooks, PM tools, PM commands, PM UI, PM rules, PM LSP adapters, PM Browser adapters, native entry modules, privileged permissions, or a PM sandbox. The schema's `portable_*`, `PortableConformanceReport`, `portable_conformant`, and `portable_partial` names are compatibility vocabulary for this internal lane only; they do not assert external portability.
2. PM-native `pm-plugin.json` declares Puppet Master agents, hooks, tools, commands, UI extensions, rules, LSP adapters, Browser adapters, runtime entry, permissions, capabilities, sandbox, signature, and supply-chain refs. It is the sole manifest that can request PM-native activation.

When both files exist, each validates independently against its own closed schema. `id` and `version` must match exactly; mismatch rejects the package before approval. Fields are never merged across files, and neither file can override the other's namespace. `pm-plugin.json` is authoritative only for PM-native components; `plugin.json` remains authoritative only for internal-interchange components. An interchange-only package may be imported and used only through its internal skill/MCP owners; it does not become a PM-native executable plugin.

Direct ecosystem output requires an explicit target adapter. The `openai_codex` adapter emits `.codex-plugin/plugin.json` plus `.mcp.json`; the `claude_code` adapter emits `.claude-plugin/plugin.json` plus `.mcp.json`. Each adapter output binds the source interchange-manifest hash, source `mcp.json` hash, source inventory hash, target manifest hash and schema ID, target `.mcp.json` hash and schema ID, generated-file inventory and inventory hash, target-specific conformance report, and an explicit authority mapping with `authority_widening=false`. Target output cannot activate PM-native components, and neither a matching ID/version nor successful syntax validation grants hooks, tools, commands, UI, Browser, filesystem, network, sandbox, or runtime authority.

This addendum supersedes the manifest-filename and unqualified external-portability portions of §2.2, §3.2, §9.1, §10.2, `PLUG-009`, `PLUG-014`, `PLUG-045`, `PLUG-051`, and `PLUG-064`. Their plugin ID, deterministic discovery, explicit approval, runtime-format, hook, permission, sandbox, signature, and UI semantics remain adopted under `pm-plugin.json`; internal `plugin.json` plus `mcp.json` remains only an interchange subject. OpenCode JavaScript/TypeScript/Bun remains compatibility evidence only.

### Legacy migration

An existing `plugin.json` containing the legacy PM-native `hooks/tools/entry` shape is classified `legacy_imported`; it is never reinterpreted as internal interchange or external target metadata. Discovery records its exact bytes/hash and previous approval identity and produces a migration preview to `pm-plugin.json`. Puppet Master does not silently rewrite or merge the file. A previously approved exact hash may remain active only under its existing bounded approval until the first update, manifest change, reload requiring revalidation, permission/capability change, or explicit migration. Any of those boundaries requires a valid `pm-plugin.json`, new conformance reports, permission diff, provenance recheck, and explicit approval before replacement activation. Fresh install of a legacy-shaped manifest fails closed with migration-required guidance.

Package classification remains exactly `portable_conformant | portable_partial | pm_extended | legacy_imported | nonconformant | rejected` for compatibility, where `portable_*` means internal-interchange conformance only. Component state is exactly `not_present | discovered | validated | approval_required | enabled | disabled | degraded | failed | quarantined`. A `portable_and_pm_native` package may be `pm_extended` while one optional component is disabled or degraded, but a failed required component, ID/version mismatch, containment failure, invalid signature, unknown privileged hook, or capability/permission mismatch rejects or quarantines the affected activation. External target-adapter conformance is a separate record and never changes PM-native activation authority. One human primary status summarizes the package without hiding component results.

### Package containment, execution, and authority

Archive extraction and local-directory admission validate every entry before writing. Absolute paths, drive/UNC roots, parent traversal, alternate data streams, device names, hard links outside the package, and symlinks that resolve outside the normalized package root are rejected. The final extracted tree is re-walked without following untrusted links, hashed, and compared with the signed package manifest before activation.

`PLUGIN_ROOT` is a read-only content root for the verified package generation. `PLUGIN_DATA` is a separate writable per-plugin data root with owner/scope/quota/retention identity; it cannot shadow executable content or escape to Project, config, credential, socket, or another plugin's data. GUI projections show safe source class, package identity, and redacted relative component labels; they do not expose private absolute entry/data paths, credential-store keys, internal sockets, or raw environment values.

A subprocess entry is represented as one exact executable token plus a bounded argv array; it is never reconstructed through a shell string. Environment variables are allowlisted and secret references remain broker-owned. Every external process uses a private runtime directory, bounded stdout/stderr/log capture, process-tree cancellation, timeout, crash budget, and `RuntimeResourceGovernor` admission. Off-loopback outbound transport is HTTPS-only and requires a declared allowlist plus Permissions/FileSafe/security approval. Plugins cannot open public ingress, debug/CDP, control, or callback sockets unless a named existing endpoint owner provides an authenticated, rate-gated, generation-fenced capability; possession of a plugin permission is not endpoint authority.

Hooks and registered commands remain least-authority components. Unknown hooks, unsigned privileged packages, tool/command collisions without explicit policy, and permission/capability mismatch fail before activation. Child runs receive only the effective compatible subset and cannot widen tool, Browser, MCP, filesystem, network, or command authority. Protected `AuthBrowserSession` remains inaccessible to plugins and plugin adapters.

### Conformance, supply chain, update, and rollback

`PortableConformanceReport` is a compatibility-named internal-interchange report; it records the internal `plugin.json` hash, skills-root containment, internal `mcp.json` validation, unsupported components, `interchange_scope=pm_internal_only`, `direct_external_loadability=false`, and result. `TargetAdapterOutput` and `TargetAdapterConformanceReport` separately record one named ecosystem, current target paths, source/output hashes, source/generated inventories, target manifest and MCP schema IDs/validation refs, authority mapping, and `authority_widening=false`. `AgentPluginConformanceReport` records PM manifest and package hashes, component results, permissions/capabilities, sandbox, signature/provenance, entry/argv/environment/transport bounds, root/data separation, and result. All reports are immutable and generation-bound; none is runtime proof.

Install/update admission requires package hash, publisher/signature/trust-root proof, license and SBOM refs, archive containment evidence, exact manifest hashes, target platform/architecture compatibility, known-bad check, and conformance refs. `PluginUpdateDiff` is the closed update-review record: it binds exact old/new package versions, generations, and hashes plus typed manifest, component, permission, capability, sandbox, executable/argv/environment/runtime-limit, transport/endpoint, license, SBOM, publisher, signature, provenance, known-bad, and runtime-compatibility axes. It also records authority change, reapproval state and ref, candidate signature status, retained prior generation, rollback package proof, and review disposition. `cmd.agent_plugin.update`, `.reload`, `.review_changes`, and `.rollback` request/result/receipt records require the exact `update_diff_ref`; an opaque permission/component ref is not a substitute. The prior verified generation remains available until replacement commit. Failure before commit leaves it active; failure after switch follows the recorded rollback plan and produces a typed rollback result. Missing rollback evidence cannot become success.

### Command, event, receipt, and wiring disposition

The plugin owner owns the following exact semantic commands, now centrally registered by `CS-071` and `UCC-149` with twelve `WM-048` production-intent rows:

`cmd.agent_plugin.scan`, `cmd.agent_plugin.install`, `cmd.agent_plugin.update`, `cmd.agent_plugin.enable`, `cmd.agent_plugin.disable`, `cmd.agent_plugin.reload`, `cmd.agent_plugin.remove`, `cmd.agent_plugin.validate`, `cmd.agent_plugin.review_changes`, `cmd.agent_plugin.rollback`, `cmd.agent_plugin.open_details`, and `cmd.agent_plugin.open_logs`.

Central identity and production-intent wiring do not make a command executable. No native Plugins lifecycle handler is admitted, so every exact command remains unavailable with `handler_unavailable` and no GUI control may claim an effect. The Plugins owner defines command request/result semantics in `pm.plugin.command_contracts.v1` and package/conformance/migration/update-diff/receipt relations in `pm.plugins.package_contracts.v1`: exact package/plugin identity, Project and Host/Environment where applicable, expected package/manifest/permission/topology generations, idempotency, confirmation/approval refs, `ObservableWork` ref, result/receipt/error, and stale-generation behavior.

No new `agent_plugin.*` EventRecord family is admitted here. New lifecycle effects use `event_effect_policy = receipt_only_no_eventrecord_pending_event_authority`. The eight historical `plugin.*` hook/log identifiers (`plugin.loaded`, `plugin.load_failed`, `plugin.hook.invoked`, `plugin.hook.error`, `plugin.hook.blocked`, `plugin.permission.override`, `plugin.tool.registered`, and `plugin.tool.collision`) are individual Event Authority candidates only: the live registry contains no `plugin.*` row, so they are non-emitting until separately admitted with closed payload schemas, producers, scope, redaction, retention, and consumers. This current addendum supersedes every earlier unqualified statement that those names are already ledger events or registrations. A prose token, schema enum, or GUI copy is not Event Authority.

Each registered production-intent control must still prove its native route, visible role/name, one exact command dispatch, typed request/result/error, state selector and disabled reason, Permissions/FileSafe/provenance checks, receipt persistence, idempotency/CAS/generation fencing, `ObservableWork`, route/focus/return context, keyboard/focus/accessibility, restart/reconnect/rollback, and redacted Details/Logs before enablement. Schema aliases preserve the same contract identity and do not receive a second handler or wiring row.

### GUI and reverse coverage

The existing Plugins list/card/details layout remains the consumer surface. It renders one human primary status/action, internal-interchange/native/target-adapter classification, source/trust badge, permission-change badge, component health count, missing/denied reason, freshness, and optional typed conformance/update/rollback details. It must not label internal interchange as directly OpenAI/Codex- or Claude Code-loadable. Lists are stable-ID, bounded, virtualized, generation-fenced projections. Hidden/off-screen Plugins surfaces suppress paint, animation, eager log/path hydration, and polling without cancelling install/update/rollback, dropping receipts, or unloading an enabled plugin. Low-resource mode reduces background scans/log hydration and plugin concurrency through the one governor; it never skips signature, containment, permission, adapter-conformance, or rollback gates.

| Owner fact | Forward consumer | Reverse proof required |
|---|---|---|
| PM-internal interchange `plugin.json` + `mcp.json` | internal Skills/MCP import and Plugins summary | internal schema, skills containment, separate manifest/MCP hashes, `direct_external_loadability=false`, no PM-native fields |
| target-adapter output | named OpenAI/Codex or Claude Code export | exact `.codex-plugin/plugin.json` or `.claude-plugin/plugin.json` plus `.mcp.json`, separate source/output hashes and inventories, target schema/conformance, no authority widening |
| PM-native `pm-plugin.json` | Plugins runtime and Settings | native schema, component map, permissions/capabilities, sandbox, signature, supply-chain refs |
| legacy manifest migration | Plugins scan/update UI | exact legacy hash/approval, non-silent preview, reapproval boundary, no field merge |
| package/component classification | list/card/details | closed package and component states, required/optional distinction, freshness/generation |
| install/update/rollback | command-driven controls | exact registered ID and production-intent row, missing native handler remains `handler_unavailable`, request/result/receipt, stale-generation and rollback tests |
| external process/network | plugin runtime adapter | exact executable+argv, allowlisted env/HTTPS, private runtime dir, bounded streams, process-tree cancellation, governor/work refs |
| hidden/low-resource UI | Plugins projection | virtualized stable IDs, paint suppression, durable lifecycle continuity, no skipped security gate |

ContractRef: SchemaID:pm.plugins.package_contracts.v1, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/Release_Supply_Chain.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md

### PLUG-065 - Internal Interchange, Target Adapter, And PM-Native Manifest Precedence

```yaml
plan_unit_id: PLUG-065
unit_type: schema_contract
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: >-
  PM-internal interchange plugin.json owns only the skills/ plus mcp.json internal interchange and is not directly
  loadable OpenAI/Codex or Claude Code packaging. PM-native pm-plugin.json owns Puppet Master components and authority
  requests; simultaneous files validate independently with exact id/version agreement and no field merge. Named target
  adapters emit current ecosystem metadata plus .mcp.json with separate hashes, inventories, schemas, conformance, and
  no authority widening, while legacy PM-shaped plugin.json follows an explicit hash-bound migration.
gui_related: true
gui_classification_reason: Package classification, migration review, approval, and mismatch errors are visible Plugins management states.
depends_on: [PLUG-009, PLUG-014, PLUG-045, PLUG-051, PLUG-064]
unblocks: [PLUG-066, PLUG-067, PLUG-068, RSC-011]
acceptance_criteria:
  - PM-internal interchange plugin.json cannot request PM-native execution or authority, claim direct external loadability, or be reinterpreted as current ecosystem metadata; pm-plugin.json cannot redefine interchange skills/MCP content.
  - Simultaneous files require exact id/version agreement and never merge fields.
  - OpenAI/Codex output is exactly `.codex-plugin/plugin.json` plus `.mcp.json`; Claude Code output is exactly `.claude-plugin/plugin.json` plus `.mcp.json`; each has distinct source/output hashes, inventories, schema IDs, conformance refs, and `authority_widening=false`.
  - Legacy PM-shaped plugin.json is classified legacy_imported, never portable, never silently rewritten, and requires migration/reapproval at the first named boundary.
  - Package and component classifications use only their closed vocabularies.
validation_surfaces: [Plans/plugin_package_contract_fixtures.json, dual-manifest resolution, mismatch, no-field-merge, legacy-migration preview, OpenAI/Codex and Claude Code target conformance, and adapter round-trip fixtures]
risk_class: plugin_manifest_precedence_or_migration_drift
reasoning_tier: high
context_scope: plugin_dual_manifest_precedence
implementation_surfaces: [Plans/Plugins_System.md, Plans/plugin_package_contracts.schema.json]
node_compile_hint: {mode: plugin_dual_manifest_precedence, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - register-egolite.md#PLG-01..PLG-02 (audited 2026-08-31)
preserved_exact_tokens: [plugin.json, pm-plugin.json, skills/, mcp.json, .codex-plugin/plugin.json, .claude-plugin/plugin.json, .mcp.json, portable_conformant, portable_partial, pm_extended, legacy_imported, nonconformant, rejected]
negative_constraints:
  - Do not keep PM-native hooks, tools, entry, permissions, sandbox, or signature fields canonical in PM-internal interchange plugin.json or introduce them through a target adapter.
  - Do not call the PM-internal interchange directly loadable by OpenAI/Codex or Claude Code.
  - Do not silently rewrite, merge, or activate a mismatched dual-manifest package.
```

### PLUG-066 - Package Containment, Process, And Conformance

```yaml
plan_unit_id: PLUG-066
unit_type: security_contract
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: >-
  Plugin packages fail closed on archive/path/symlink escape, use read-only PLUGIN_ROOT and separate writable
  PLUGIN_DATA, launch an exact executable plus bounded argv without shell reconstruction, and require allowlisted
  environment/HTTPS, private runtime directory, bounded streams, process-tree cancellation, conformance, and provenance.
gui_related: false
depends_on: [PLUG-064, PLUG-065, SIR-015]
unblocks: [PLUG-067, RSC-011]
acceptance_criteria:
  - Archive and final-tree validation reject traversal, absolute/device paths, escaping links, and hash mismatch before activation.
  - PLUGIN_ROOT is read-only and PLUGIN_DATA cannot shadow content or escape its per-plugin authority.
  - External processes and transport are bounded, allowlisted, governed, cancellable as a process tree, and unable to open unowned public/control/debug endpoints.
  - Internal-interchange, target-adapter, and PM-native conformance reports preserve exact generation, source/output hashes, inventories, schemas, component, authority, and provenance evidence without widening authority.
validation_surfaces: [Plans/plugin_package_contract_fixtures.json, path-traversal and symlink-escape rejection, broker-secret and HTTPS enforcement, component-isolation, crash-budget/bounded-log, stale-routine, signature-change, and containment fixtures]
risk_class: plugin_package_escape_or_authority_widening
reasoning_tier: high
context_scope: plugin_package_containment_conformance
implementation_surfaces: [Plans/Plugins_System.md, Plans/plugin_package_contracts.schema.json]
node_compile_hint: {mode: plugin_package_containment_conformance, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - register-egolite.md#PLG-02 (audited 2026-08-31)
negative_constraints:
  - Do not expose AuthBrowserSession, raw secrets, private absolute paths, internal sockets, or an unbounded process/log stream to a plugin.
  - Do not let a plugin manifest, permission, or adapter become public endpoint authority.
```

### PLUG-067 - Lifecycle Commands, Receipts, And Event Boundary

```yaml
plan_unit_id: PLUG-067
unit_type: integration_contract
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: >-
  Centrally registered plugin lifecycle commands share one typed request/result/receipt family, preserve exact identity,
  permission and generation fencing, expose ObservableWork, retain rollback evidence, and remain unavailable with
  handler_unavailable until one native Plugins handler exists; no new agent_plugin EventRecord family is inferred.
gui_related: true
gui_classification_reason: Scan, install, update, enable, disable, reload, remove, validate, review, rollback, details, and logs are visible controls.
depends_on: [PLUG-065, PLUG-066]
unblocks: [PLUG-068]
acceptance_criteria:
  - All twelve exact cmd.agent_plugin IDs map to one schema family, CS-071/UCC-149 central identities, and twelve WM-048 production-intent rows without acquiring a native handler from those static records.
  - A registered ID without a native owner route is unavailable and cannot produce an effect through GUI, palette, natural language, or automation.
  - The current fixture phase returns all twelve exact IDs with `outcome=rejected`, `effect_state=none`, `state_changed=false`, `state=unavailable`, and `disabled_reason=handler_unavailable` until a native route exists.
  - Effects remain receipt-only pending Event Authority; all eight historical plugin.* producer names are non-emitting candidates because no plugin.* family is currently registered.
  - Update, reload, review, and rollback records bind the fully typed PluginUpdateDiff plus component, permission/provenance, generation, approval, prior-generation-retention, and rollback proof.
validation_surfaces: [Plans/plugin_contract_fixtures.json, Plans/plugin_package_contract_fixtures.json, CS-071, UCC-149, WM-048, current handler-unavailable results, update-diff binding negatives, and future native receipts]
risk_class: plugin_command_or_event_phantom_closure
reasoning_tier: high
context_scope: plugin_lifecycle_command_receipts
implementation_surfaces: [Plans/Plugins_System.md, Plans/plugin_package_contracts.schema.json]
node_compile_hint: {mode: plugin_lifecycle_command_receipts, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - register-egolite.md#TS-05 (audited 2026-08-31)
negative_constraints:
  - Do not claim a native handler, EventRecord producer, runtime implementation, or executable effect from owner prose, schema, central identity, or production-intent wiring alone.
  - Do not create a second lifecycle engine in Settings, Release, or Shared Integration Runtime.
```

### PLUG-068 - Plugins GUI, Virtualization, And Reverse Coverage

```yaml
plan_unit_id: PLUG-068
unit_type: gui_contract
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: >-
  The existing Plugins list/card/details surface projects internal-interchange, target-adapter, PM-native, and legacy classification, one human status/action,
  trust and permission change, component health, conformance and rollback evidence through bounded stable-ID
  virtualization and redaction; hidden or low-resource presentation never cancels lifecycle work or skips security gates.
gui_related: true
gui_classification_reason: This unit defines the user-visible Plugins inventory, status, action, detail, redaction, and performance behavior.
depends_on: [PLUG-043, PLUG-044, PLUG-045, PLUG-048, PLUG-067]
unblocks: []
acceptance_criteria:
  - Internal-interchange/target-adapter/native/legacy classification, one human primary status/action, component health, and exact disabled reason are visible without raw enum/path/secret disclosure or a false direct-portability label.
  - Long inventories are bounded, virtualized, stable-ID and generation-fenced; hidden paint suppression preserves durable work and receipts.
  - Every action reverse-maps to one registered command/handler/wiring row before becoming enabled.
validation_surfaces: [Plans/plugin_package_contract_fixtures.json, future Plugins list virtualization, redaction, accessibility, low-resource, and reverse-wiring fixtures]
risk_class: plugin_gui_projection_or_path_disclosure
reasoning_tier: high
context_scope: plugin_gui_virtualized_reverse_coverage
implementation_surfaces: [Plans/Plugins_System.md]
node_compile_hint: {mode: plugin_gui_virtualized_reverse_coverage, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - canon-integration-plugins.md#7 (read-only audit 2026-08-31)
negative_constraints:
  - Do not add a duplicate Settings tab, manager, lifecycle engine, raw enum display, or absolute private path disclosure.
```
