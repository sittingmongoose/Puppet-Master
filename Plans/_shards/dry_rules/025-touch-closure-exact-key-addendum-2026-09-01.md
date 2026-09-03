# Shard 025: Touch Closure Exact-Key Addendum - 2026-09-01

Source: `Plans/DRY_Rules.md`

Source lines: L2457-L2514

Source SHA256: `595e587a48b45dbe60cfa50b0191bdfd70d86f1f7943227f32d39c85dd8ed3ec`

---

## Touch Closure Exact-Key Addendum - 2026-09-01

### DR-041 - Touch Closure Exact-Key And No-Peer DRY Rule

```yaml
plan_unit_id: DR-041
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  Touch Closure extends DR-040 through exact command_id, profile_id, sole_handler,
  schema_ref, and reverse-consumer keys. Each actionable primary command has one
  canonical identity, one typed owner contract, and exactly one sole future-handler
  identity. A compatibility alias normalizes before dispatch to its exact primary
  target and must not receive a peer production row, peer handler, peer schema, or
  peer state machine. Typed local UI actions remain local, blocked tokens remain
  excluded from production wiring, and reverse coverage must use real GUI consumers
  rather than synthetic controls. Both dedicated validators fail closed on drift.
gui_related: true
gui_classification_reason: The invariant prevents duplicate GUI actions, fabricated controls, and divergent command behavior across PMConcept7 consumers.
split_recommended: false
depends_on: [DR-040, C-051, CS-074, UCC-152, WM-051, UIW-017]
unblocks: [CV-326, 0PI-068]
acceptance_criteria:
  - "Every actionable primary command has exactly one canonical command_id, one schema_ref pair, one sole future-handler identity, and at least one intended reverse consumer where GUI-required."
  - "Every alias normalizes to its exact primary target before permission, availability, dispatch, receipt, event, or persistence handling and has no peer production row."
  - "Typed local UI actions use typed owner-local controllers and cannot contain a handlers:: domain identity."
  - "Blocked or rejected tokens have explicit dispositions and no production wiring; synthetic GUI controls cannot satisfy missing reverse coverage."
  - "The server-gap and Touch Closure validators run independently and reject duplicate keys, peer handlers, unresolved schema refs, missing reverse routes, and denominator drift."
validation_surfaces:
  - python3 scripts/pm-server-command-gap-verify.py --json
  - python3 scripts/pm-touch-closure-verify.py --json
  - python3 scripts/pm-plans-verify.py validate-server-command-gap
  - python3 scripts/pm-plans-verify.py validate-touch-closure
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_command_handler_schema_or_gui_authority
reasoning_tier: high
context_scope: touch_closure_exact_key_no_peer_rule
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/server_command_gap_adjudication.json
  - Plans/server_command_gap_adjudication.schema.json
  - Plans/touch_closure.json
  - Plans/touch_closure.schema.json
  - Plans/Wiring_Matrix.production.json
  - scripts/pm-server-command-gap-verify.py
  - scripts/pm-touch-closure-verify.py
node_compile_hint: {mode: exact_key_static_dry_gate_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/DRY_Rules.md#dr-040---universal-touch-closure-and-sole-owner-projection-law
  - Plans/Crosswalk.md#c-051---touch-closure-authority-and-consumer-routing
preserved_exact_tokens: [command_id, profile_id, sole_handler, schema_ref, reverse_consumers, no-peer, typed local UI action]
negative_constraints:
  - "Do not register an alias as a second primary command or give it a peer handler or production row."
  - "Do not turn a typed local presentation action into a false domain command."
  - "Do not fabricate controls, handlers, schemas, events, receipts, persistence, or runtime evidence to close a row."
owner_hints: [Plans/DRY_Rules.md, Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.md]
```
