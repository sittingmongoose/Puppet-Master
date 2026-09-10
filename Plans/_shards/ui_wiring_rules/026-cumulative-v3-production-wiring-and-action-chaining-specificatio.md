# Shard 026: Cumulative v3 Production Wiring and Action Chaining Specification (2026-09-07)

Source: `Plans/UI_Wiring_Rules.md`

Source lines: L1458-L1526

Source SHA256: `9e140e41e7e3015f940c62cdee072627e7ef1d329aea6d9238d561f3db2472f7`

---

## Cumulative v3 Production Wiring and Action Chaining Specification (2026-09-07)

This section incorporates the cumulative production wiring rules, action chaining order, and
handler dispatch invariants in accordance with APR-023 and APR-050.

### 16. Wiring DRY Invariants and Action Chaining Teardown (APR-023, APR-050)

- **Single Semantic Handler Path:** Every product operation enforces exactly one semantic owner and
  one canonical command/handler route. Multiple UI entry points (e.g., Assistant wand menu,
  context menus, keyboard shortcuts, Settings panels) must wire to the identical canonical command ID
  rather than introducing duplicate dispatchers or competing handlers.
- **Declared Action Chaining and Teardown Order (APR-050):** Application reset hooks, workspace
  reloads, and component unmount sequences enforce deterministic, declared action chaining where each
  subsystem owner is invoked exactly once:
  1. *Animation and Timer Teardown:* Working activity indicators (`Orbit`, `Step Rail Simple`)
     cancel active RAF loops, clear tick timers, and unsubscribe DOM listeners cleanly.
  2. *Draft and Buffer Preservation:* Uncommitted user inputs in the composer or configuration
     modals remain in durable thread drafts or are gracefully cleared per modal cancellation policy.
  3. *Subscription Teardown:* Event bus listeners and reactive state projections unbind in reverse
     registration order without orphan callback leakage or duplicate disposal runs.
- **Local View State Isolation:** Visual layout adjustments, panel unpinning, and accordion disclosures
  rely exclusively on UI view-state controllers; no production wiring entries are created for pure
  presentation actions.

```yaml
plan_unit_id: UIW-020
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: >-
  Production wiring enforces a single semantic handler route per product operation across all UI triggers.
  Reset and unmount sequences use declared action chaining invoking each subsystem owner exactly once,
  guaranteeing clean timer/listener teardown for Orbit and Step Rail Simple without duplicate disposal
  or orphan callbacks.
gui_related: true
gui_classification_reason: Governs UI production wiring routes, dispatch idempotency, and component teardown chaining.
depends_on: [UIW-019]
unblocks: []
acceptance_criteria:
  - Every UI trigger routes to the single canonical command handler without parallel routes.
  - Reset and teardown sequences invoke owners once in declared chain order.
  - Working activity timers and subscriptions are completely torn down on unmount.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: wiring_duplication_or_teardown_leak
reasoning_tier: high
context_scope: ui_wiring_rules
implementation_surfaces:
  - Plans/UI_Wiring_Rules.md
  - Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: wiring_rules_specification
  create_worknodes: false
source_lineage:
  - APR-023
  - APR-050
preserved_exact_tokens:
  - "action chaining"
  - "single semantic handler"
  - "teardown"
negative_constraints:
  - Do not create parallel command routes for identical product operations.
  - Do not allow duplicate teardown invocations across subsystem resets.
owner_hints:
  - Plans/UI_Wiring_Rules.md
```

ContractRef: ContractName:Plans/UI_Wiring_Rules.md, ContractName:Plans/Wiring_Matrix.production.json
