# Shard 020: Server/Egolite Alias, Local-Action, And Handler-Truth Rules - 2026-09-01

Source: `Plans/UI_Wiring_Rules.md`

Source lines: L1066-L1101

Source SHA256: `b0c77ecbeb53ef195661544a2bf03d3adc352ca3524d3ccee5e53c5d101ce5d8`

---

## Server/Egolite Alias, Local-Action, And Handler-Truth Rules - 2026-09-01

The 171-row command-gap adjudication and six retained Egolite rows obey four closed UI rules:

1. A primary UI command resolves through one canonical owner, exact typed request/result/error/availability/permission contract, and one sole planned handler target. The control stays disabled with an accessible `handler_unavailable` reason until native evidence exists.
2. A compatibility spelling normalizes to its exact target before availability, permission, policy, or dispatch. The source has no registration, handler, state projection, production row, persistence, or EventRecord. Only compatibility/source receipt identity may preserve the invoked spelling.
3. A presentation-only packet spelling is replaced by an exact typed `ui.*` action. It preserves currentness, focus, keyboard/accessibility, viewport, and exact return state but receives no semantic-domain command or production UICommand row.
4. A rejected spelling is inert. Its reason and safe exact replacement guidance remain visible to maintainers and audits, but it cannot dispatch.

Every intended GUI consumer uses owner data and the same command/action identity. Settings, Product Onboarding, and Doctor remain consumers/routers; they cannot privately authenticate, install, update, move, back up, restore, browse, test, or operate source control. Static concept JavaScript remains simulation only.

### UIW-016 - Server And Egolite Exact Dispatch Boundary

```yaml
plan_unit_id: UIW-016
unit_type: ui_wiring_rule
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: Server/Egolite controls use one exact primary dispatch route or one typed local UI action; aliases normalize before permission and dispatch, rejected spellings remain inert, and every route preserves availability, disabled reason, accessibility, exact return, reverse consumers, and static-versus-native truth.
gui_related: true
depends_on: [CS-073, UCC-151, WM-050]
unblocks: []
acceptance_criteria:
  - No visible control dispatches an alias, local predecessor, rejected spelling, or unregistered family root.
  - Every primary control and intended consumer uses the same exact target availability and accessible disabled reason.
  - Every typed local action has owner-local currentness/focus/return behavior and no domain mutation or EventRecord.
  - Concept simulation, schema validation, catalog presence, and planned target strings never claim native runtime readiness.
validation_surfaces: [Plans/Wiring_Matrix.production.json, Plans/Wiring_Matrix.production.exclusions.json, Plans/touch_closure.json, Concepts/pm7-tools/systems_integration_source.py, Concepts/pm7-tools/onboarding_cinematic_source.py, scripts/pm-touch-closure-verify.py]
risk_class: ui_alias_bypass_or_phantom_runtime_claim
reasoning_tier: high
context_scope: server_egolite_ui_dispatch_boundary
implementation_surfaces: [Plans/UI_Wiring_Rules.md, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json, Concepts/pm7-tools/]
node_compile_hint: {mode: ui_wiring_rule_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:server-command-gap-adjudication:rows-1-171, source_report:scratchpad/pm-integration-20260831/authority-repairs/server-gap-adjudication/production-wiring-manifest/production-wiring-exact-map.json#92-command-denominator]
negative_constraints: [No alias dispatch., No local domain command., No Doctor/Settings private owner., No fake native proof.]
```
