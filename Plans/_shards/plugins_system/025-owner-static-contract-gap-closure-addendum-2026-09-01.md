# Shard 025: Owner Static Contract Gap Closure Addendum - 2026-09-01

Source: `Plans/Plugins_System.md`

Source lines: L4504-L4562

Source SHA256: `0b754bd9e29239becb917810f8b63479913ea56b425d53e00386acc65174f6da`

---

## Owner Static Contract Gap Closure Addendum - 2026-09-01

This addendum closes only the owner-level machine shapes identified by `plugin-current-recheck-20260901`. Central catalog/UI catalog and production-intent wiring are now separately present through `CS-071`, `UCC-149`, and `WM-048`; this addendum still does not close Settings, Doctor, Touch Closure, native implementation, filesystem/process/network execution, signature verification, adapter generation, migration execution, or cross-platform evidence.

`Plans/plugin_package_contracts.schema.json` now owns these closed relation records in addition to the manifest/package/conformance/receipt records above:

- `PluginManifestResolutionRecord`: separately hashed `plugin.json`, `pm-plugin.json`, and legacy identities, exact manifest-set classification, explicit identity-alignment result, `field_merge_performed=false`, `precedence_policy=independent_validation_no_field_merge`, and no PM-native authority from target output;
- `PluginLegacyMigrationRecord`: exact source legacy hash, output hashes, per-field mapped/dropped/blocked decisions, warnings, conformance, update diff, package proof, rollback, review/approval, no silent rewrite, no legacy precedence, and no activation authority from the migration record;
- `PluginAdapterRoundTripReport`: OpenAI/Codex or Claude Code target path, source and reconstructed manifest/MCP/inventory hashes, generated-inventory relation, target conformance, no authority widening, and no PM-native activation;
- `PluginContainmentReport`: raw hostile entry, normalized path when safe, entry/link kind, forbidden-path/resolved-root/external-hardlink decisions, final-tree rewalk/hash status, and admitted/rejected result;
- `PluginRuntimeBoundsReport`: stdout/stderr/log limits and truncation, timeout/process-tree cancellation, crash count/budget, fail-closed lifecycle disposition, and rollback ref;
- `PluginPromotedRoutineDisposition`: source/current package generations, current/stale state, invocation authorization, exact disabled/rollback state, and reason;
- `PluginUpdateDiff`: every old/new axis named in the update contract plus authority/reapproval, signature freshness, prior-generation retention, rollback proof, and review disposition.

The static fixture denominator is explicit: the package pack contains 27 positive and 31 rejected-negative cases; the lifecycle pack contains 12 requests, 16 supporting/result positives, and 24 rejected negatives. Together the focused validator admits 55/55 positives and rejects 55/55 negatives. Positive cases include all three conformance-report kinds, both target adapters and round trips, dual/portable/legacy precedence, explicit migration preview, both portable component-isolation directions, optional PM-native component isolation, traversal and symlink rejection reports, crash-loop/bounded-log quarantine, stale promoted-routine disable/rollback, and the full update diff. Negative cases deny traversal admission, symlink escape admission, literal secret values, non-HTTPS off-loopback endpoints, unsigned or changed candidates, required incompatible component conformance, lost isolation, silent migration, field merge, adapter authority widening/hash mismatch, crash-loop enablement, stale routine invocation, and incomplete update axes.

The fixture pack binds related IDs and hashes to the same authored values. JSON Schema validates each closed record but does not itself prove that a referenced artifact exists, that two runtime records were generated together, that bytes hash to the asserted value, or that an operating loader enforced the decision. Those remain referential/native/runtime obligations and must retain `not_run` or missing evidence until executed.

All twelve current command-result fixtures remain fail-closed after central registration: `outcome=rejected`, `state_changed=false`, unchanged package generation/status, `state=unavailable`, and `disabled_reason=handler_unavailable`. The separate central identities and production-intent rows do not supply a native owner route. No fixture may simulate install/update/reload/rollback success.

The event boundary is unchanged. Every lifecycle result/receipt remains `event_effect_policy=receipt_only_no_eventrecord_pending_event_authority`; none of these new record kinds admits or emits `plugin.*` or `agent_plugin.*` EventRecord families.

### PLUG-070 - Plugin Relation, Hostile-Negative, And Update-Diff Static Closure

```yaml
plan_unit_id: PLUG-070
unit_type: schema_contract
status: accepted
owner_doc: Plans/Plugins_System.md
canonical_text: >-
  Plugin owner contracts type manifest resolution, legacy migration, both external-adapter round trips,
  package containment decisions, runtime bounds, stale promoted-routine disposition, component isolation,
  and one complete update diff spanning manifest, component, authority, runtime, transport, and supply-chain axes;
  every current lifecycle result remains unavailable with handler_unavailable pending a native owner route.
gui_related: true
gui_classification_reason: Migration preview, update review, component health, disabled reasons, bounded logs, and rollback state are user-visible Plugins facts even though this unit supplies only static owner contracts.
depends_on: [PLUG-065, PLUG-066, PLUG-067, PLUG-069, RSC-011]
unblocks: [PLUG-068]
acceptance_criteria:
  - PortableConformanceReport, TargetAdapterConformanceReport for both named adapters, and AgentPluginConformanceReport each have positive generation/hash/component/authority fixtures.
  - OpenAI/Codex and Claude Code each have a source/output/reconstructed hash-and-inventory round-trip fixture with authority_widening=false and pm_native_activation_authorized=false.
  - Dual, portable-only, and legacy resolution plus explicit hash-bound migration prove independent manifest validation, exact precedence, no field merge, and no silent rewrite.
  - Traversal, symlink escape, literal secret, non-HTTPS off-loopback transport, unsigned/changed update, incompatible required component, lost component isolation, crash-loop enablement, and stale routine invocation are rejected by static negative fixtures.
  - PluginUpdateDiff requires manifest, components, permissions, capabilities, sandbox, executable, transport, license, SBOM, publisher, signature, provenance, known-bad, and runtime-compatibility axes plus approval, signature freshness, retained prior generation, and rollback proof.
  - Update, reload, review_changes, and rollback request/result/receipt paths bind update_diff_ref; all twelve centrally registered command results remain rejected/unavailable with handler_unavailable and no state, generation, or status change.
  - All effects remain receipt-only and no plugin or agent_plugin EventRecord family is inferred.
validation_surfaces: [Plans/plugin_package_contracts.schema.json, Plans/plugin_package_contract_fixtures.json, Plans/plugin_contracts.schema.json, Plans/plugin_contract_fixtures.json, scripts/pm-new-contracts-verify.py]
risk_class: plugin_static_relation_or_security_fixture_drift
reasoning_tier: high
context_scope: plugin_owner_static_gap_closure
implementation_surfaces: [Plans/Plugins_System.md, Plans/plugin_package_contracts.schema.json, Plans/plugin_contracts.schema.json]
node_compile_hint: {mode: plugin_owner_static_gap_closure, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - scratchpad/pm-integration-20260831/audits/plugin-current-recheck/plugin-current-recheck.md#PLUG-RECHECK-004..006
negative_constraints:
  - Do not promote schema/fixture acceptance into artifact existence, referential integrity, filesystem/process/network enforcement, signature verification, adapter/migration execution, native behavior, cross-platform proof, readiness, or certification.
  - Do not enable any cmd.agent_plugin action before its admitted central/catalog/production-intent records are joined to one native handler, reverse-route proof, and runtime receipt closure.
  - Do not emit EventRecord under a plugin.* or agent_plugin.* candidate identity.
```
