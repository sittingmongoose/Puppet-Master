# Shard 033: Server/Egolite Production-Intent Wiring Addendum - 2026-09-01

Source: `Plans/Wiring_Matrix.md`

Source lines: L4262-L4300

Source SHA256: `723beb16e784bc6c6b24a01d60ea27a6dbdcd1f96d851ed8a76b35f21f6e16f4`

---

## Server/Egolite Production-Intent Wiring Addendum - 2026-09-01


The current machine partition is 171 packet rows: 87 new canonical commands, 43 pre-policy aliases, 38 typed local UI actions, and three rejected spellings. Six retained Egolite commands also lacked central rows. Eleven existing alias targets require the same central repair, with `cmd.source_control.workspace.create` the sole overlap with the retained six. Therefore 104 obligation references collapse to **103 unique primary command/catalog/production-intent rows**; the packet primary denominator is 93 (`87 + 6`). USER-PROJECT-UNARCHIVE-REGISTRY-20260911 reclassifies only source row 128 from local-only presentation to the Project-owner registry mutation. The earlier 86/39, 102-central and 92-packet counts remain historical source-report lineage, not current denominators; every source row identity is preserved.

Every primary row below is static central intent. A named `handler_location` is the sole future dispatch target, not evidence that Rust code, registration, provider execution, persistence, native Slint wiring, security behavior, or runtime success exists. Initial availability remains `handler_unavailable`; the exact disabled reason is projected accessibly. All rows use receipt/projection-only effects and `expected_event_types=[]` until Event Authority separately admits an exact family. `ObservableWork` applies only where the owner contract declares asynchronous work. Exact owner permissions, generations, currentness, idempotency, cancellation, reconciliation, and exact-return rules remain intact.


`Plans/Wiring_Matrix.production.json` carries the 103 unique primary rows keyed `catalog.<command_snake>`. Every row names the exact primary command, sole planned target, exact request/result schema pointers, all intended GUI consumers, `state.commands.<command_snake>.availability`, `state.commands.<command_snake>.disabled_reason`, an empty EventRecord list, receipt/projection-only effect, accessibility semantics, and four required future evidence classes: dispatcher fixture, state projection, receipt-or-event assertion, and accessibility regression. `Plans/Wiring_Matrix.production.exclusions.json` covers exactly the 43 aliases, 38 command-shaped typed-local predecessors, and three rejections from this adjudication; it never excludes one of the 103 primaries.

The row-128 successor `catalog.project_unarchive` consumes PJCT-002's existing Project action request/result and the sole `handlers::project::unarchive` target. `ui.project.restore_archived` is only a pre-gate entry adapter with no peer production row or local writer. Its receipt effect represents persisted registry metadata/readback, not no-persist navigation; no new EventRecord or native implementation is claimed.

Aliases are represented in `Plans/touch_closure.json#/alias_bindings`, not as production rows. Their exact target supplies availability, permission, handler, result, and effect. Typed local targets appear only as `ui_action` Touch rows and owner-local GUI wiring. Rejected spellings have neither a Touch action row nor a production route.

### WM-050 - Server And Egolite Production-Intent Closure

```yaml
plan_unit_id: WM-050
unit_type: wiring_contract
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: Production intent binds 103 unique server/Egolite primary commands to exact owner contracts, one sole planned target, complete GUI consumers, truthful handler-unavailable state, receipt/projection-only effects, and future evidence requirements while aliases, local predecessors, and rejections receive no peer production rows; the September 11 unarchive correction consumes Project-owned registry persistence rather than a local-only action.
gui_related: true
depends_on: [CS-073, UCC-151]
unblocks: [UIW-016]
acceptance_criteria:
  - The production matrix validates and contains all 103 unique rows with exact command, handler, schema, state, disabled-reason, effect, accessibility, and evidence fields.
  - The exclusion list contains the complete 84 source-token partition and excludes none of the 103 primaries; cmd.project.unarchive is admitted atomically with its one production-intent row under USER-PROJECT-UNARCHIVE-REGISTRY-20260911.
  - Touch alias bindings have exact targets with no independent handler/wiring and every intended GUI consumer appears in reverse coverage.
  - All rows remain static production intent and handler_unavailable until native dispatcher and runtime evidence exists.
validation_surfaces: [Plans/Wiring_Matrix.production.json, Plans/Wiring_Matrix.schema.json, Plans/Wiring_Matrix.production.exclusions.json, Plans/touch_closure.json, scripts/pm-plans-verify.py, scripts/pm-touch-closure-verify.py]
risk_class: wiring_or_reverse_coverage_false_completion
reasoning_tier: high
context_scope: server_egolite_production_intent
implementation_surfaces: [Plans/Wiring_Matrix.md, Plans/Wiring_Matrix.production.json, Plans/Wiring_Matrix.production.exclusions.json, Plans/touch_closure.json]
node_compile_hint: {mode: production_intent_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:server-command-gap-adjudication:rows-1-171, source_report:scratchpad/pm-integration-20260831/authority-repairs/server-gap-adjudication/production-wiring-manifest/production-wiring-exact-map.json#92-command-denominator]
negative_constraints: [No peer alias handler., No domain handler for local presentation., No unadmitted event., No native proof from static wiring.]
```
