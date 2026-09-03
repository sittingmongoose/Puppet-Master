# Shard 017: Typed Command Supply-Chain Handoff Addendum

Source: `Plans/Release_Supply_Chain.md`

Source lines: L1082-L1145

Source SHA256: `118be1d006503d8868bd2c1f8a80b1ca1c2c3f80417be9090296bb82770d777c`

---

## Typed Command Supply-Chain Handoff Addendum

Release consumes, but does not own, plugin lifecycle and installation-selection commands. `Plans/plugin_contracts.schema.json#/$defs/PluginCommandRequest` and `#/$defs/PluginCommandResult` carry the exact package, manifest-hash, package-proof, conformance, permission-diff, rollback, generation, and receipt references needed to apply RSC-011 without moving lifecycle behavior into Release. `Plans/shared_integration_runtime.schema.json#/$defs/InstallationSelectCommandRequest` carries the exact already-verified installation, official provenance, compatibility, Host/Environment, inventory/installation/topology generations, permission snapshot, and continuation needed to select an admitted installation without acquiring or authenticating.

For plugin install and update, `package_proof_ref` and the applicable interchange/native conformance refs are mandatory admission inputs. Validate and Review Changes preserve the exact manifest hashes, final-tree/package proof, conformance, permission diff, known-bad/signature/trust/license/SBOM/provenance state, and current generations without activating. Rollback requires a verified rollback ref bound to the target package generation and prior proof. A successful scan, catalog row, cached archive, filename, path, version string, exit zero, or manifest self-claim is never supply-chain admission.

`plugin.json` and `pm-plugin.json` remain separately hashed subjects. A dual package requires exact shared identity and both signed hashes; PM-native fields cannot override interchange identity or remove an admission obligation. Legacy import requires an explicit source/output-hash migration receipt and review before either current manifest is admitted. A target adapter's generated external metadata remains a third separately inventoried/hash-bound output, not evidence that PM's internal `plugin.json` is directly portable to that external agent.

`cmd.installation.select` is an official-installation handoff only after discovery, verification, provenance, compatibility, and topology evidence is current. Its typed request fixes `acquisition_allowed=false` and `authentication_allowed=false`. Missing official provenance, compatibility, exact Host/Environment binding, current generations, or permission blocks selection. First provider-CLI acquisition remains an explicit user setup action through the installation lifecycle and cannot be smuggled into selection.

Release adds no command registration, handler, EventRecord producer, acquisition path, plugin lifecycle engine, or native-runtime proof. Static schema and fixture validation verifies only contract shape; artifact signing, trust, containment, known-bad, migration, update, rollback, installation activation, platform, and recovery claims require future raw receipts from the actual implementation and target runners.

ContractRef: SchemaID:pm.plugin.command_contracts.v1, SchemaID:pm.shared_integration_runtime.command_contracts.v1, SchemaID:pm.plugins.package_contracts.v1

### RSC-013 - Lifecycle Command Proof Consumption And Official Selection Handoff

```yaml
plan_unit_id: RSC-013
unit_type: integration_contract
status: accepted
owner_doc: Plans/Release_Supply_Chain.md
canonical_text: >-
  Release consumes exact plugin lifecycle package, manifest-hash, conformance, permission-diff, provenance,
  rollback, generation, and receipt refs and exact verified-installation selection proofs without owning command
  dispatch; installation selection forbids acquisition and authentication, and static contract evidence cannot
  substitute for artifact or native runtime receipts.
gui_related: true
gui_classification_reason: Blocked plugin install/update/rollback and installation-selection proof failures are visible setup and Plugins management states.
depends_on: [RSC-011, PLUG-069, SIR-020]
unblocks: []
acceptance_criteria:
  - Plugin install/update require package proof and applicable conformance; validate/review preserve hashes, diffs, generations, and all admission state without activation.
  - Rollback is bound to a verified target generation and rollback proof.
  - Dual and legacy manifest paths preserve separate hashes, exact identity, explicit migration, and no silent authority change.
  - Installation selection requires current provenance/compatibility/topology proof and cannot acquire or authenticate.
validation_surfaces: [Plans/plugin_contract_fixtures.json, Plans/plugin_package_contract_fixtures.json, Plans/shared_integration_runtime_fixtures.json, future signed artifact, migration, update, rollback, installation activation, and target-platform receipts]
risk_class: lifecycle_command_supply_chain_proof_bypass
reasoning_tier: high
context_scope: command_supply_chain_handoff
implementation_surfaces: [Plans/Release_Supply_Chain.md, Plans/plugin_contracts.schema.json, Plans/shared_integration_runtime.schema.json]
node_compile_hint: {mode: command_supply_chain_handoff, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:PLG-001, source_ref:egolite-requirement:PLG-004, source_ref:egolite-requirement:PLG-005, source_ref:egolite-requirement:PLG-006, source_ref:egolite-requirement:PLG-007, source_ref:egolite-requirement:IRT-003, source_ref:egolite-requirement:IRT-005, source_ref:egolite-requirement:IRT-007, source_ref:egolite-requirement:IRT-008, source_ref:egolite-requirement:IRT-009, source_ref:packet:PKT-04/04_COMMAND_EVENT_WIRING_REGISTER.md:361-438]
negative_constraints:
  - Do not treat a catalog row, manifest, version, path, cache hit, scan, exit zero, or schema pass as supply-chain admission.
  - Do not move lifecycle dispatch into Release or infer command, handler, event, acquisition, activation, platform, or runtime success.
```

The lifecycle handoff is fail-closed at command granularity. Plugin install/update/enable/reload/remove/rollback cannot proceed with null package proof, an empty applicable-conformance set, a missing permission diff, or missing rollback evidence; reload also requires explicit authority-change revalidation and confirmation. Enable cannot load an interchange-only `plugin.json`. A successful installation selection result requires an activation-proof ref and exact continuation/return settlement. These are required references to independently produced evidence, never evidence production by Release and never proof that a native operation ran.

The newer Server command-gap adjudication supersedes the earlier deferred-candidate
disposition for these three spellings. `cmd.tool_package.approve_license` is the
canonical command owned by Shared Integration Runtime's
`InstallationLifecycleManager` under `SIR-027` and
`Plans/shared_integration_runtime_expansion_contracts.schema.json`; its sole
specified target is `handlers::installation::package_approve_license`, and it
remains `handler_unavailable` until central and native integration are evidenced.
The packet spellings `cmd.tool_package.open_provenance` and
`cmd.tool_package.review_license` are not commands or aliases: their retained
behaviors are the typed local actions `ui.tool_package.open_provenance` and
`ui.tool_package.review_license`, with no semantic-domain handler or EventRecord.
Release Supply Chain supplies the exact package/version/provenance/license/terms
generation and admission evidence consumed by those actions and the canonical
approval command; it does not own their dispatch, local presentation controller,
or lifecycle state.
