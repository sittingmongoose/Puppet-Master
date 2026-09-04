# Shard 021: Central Touch Command/GUI Closure Rule Addendum - 2026-09-01

Source: `Plans/UI_Wiring_Rules.md`

Source lines: L1103-L1134

Source SHA256: `20320fc014b687080978e068cac4323fdc4f4aeba87f27f83bfff46e050ff0c0`

---

## Central Touch Command/GUI Closure Rule Addendum - 2026-09-01

For every non-blocked Touch primary command, the closure gate resolves the primary row through its Touch profile and production entries, requires at least one entry, and requires all entries for that command to name one identical handler. An alias must normalize before permission and dispatch and must have no peer production entry. A blocked false-inventory token must have neither a handler nor a production entry. GUI coverage means an exact intended route, typed availability/disabled reason, accessible action semantics, result/error settlement, and deterministic return; it does not require inventing a synthetic visible control where no user route is intended.

The September 1 closure preserves the same dispatch rule while changing the machine census to 425 primaries (424 actionable plus one blocked false inventory), 55 aliases, 101 typed local actions, seven presentation rows, 588 Touch rows, 87 profiles, and 1065 production entries. Forge adds nine event-silent primaries, Backup/Restore adds sixteen, and Remote Access replaces four component/Serve primaries with three built-in-connector primaries plus four compatibility-only aliases. Those aliases have no peer control, state selector, handler, production row, persistence, or EventRecord.

### UIW-017 - Exact Touch Command/GUI/Handler Closure

```yaml
plan_unit_id: UIW-017
unit_type: gui_wiring_rule
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: Every actionable Touch primary command must have production wiring and exactly one handler identity across all GUI consumers; aliases and blocked false inventory must have no peer wiring, and reverse coverage must not create synthetic controls.
gui_related: true
gui_classification_reason: The rule closes bidirectional command-to-GUI reachability, accessibility, disabled behavior, and focus return.
depends_on: [UIW-016, CS-074, UCC-152, WM-051]
unblocks: []
acceptance_criteria:
- The Touch verifier fails on missing production coverage, competing handler identities, alias peer rows, blocked-token wiring, missing GUI routes, or stale profile refs.
- Rebinding uses exact semantic equivalence and never relabels a nearby non-equivalent action.
- Static, concept-simulated, and native-runtime claims remain separate.
validation_surfaces: [python3 scripts/pm-touch-closure-verify.py --json]
risk_class: gui_command_reverse_coverage
reasoning_tier: high
context_scope: touch_command_gui_closure
implementation_surfaces: [Plans/UI_Wiring_Rules.md, Plans/touch_closure.json, scripts/pm-touch-closure-verify.py]
node_compile_hint: {mode: exact_touch_gui_closure, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Wiring_Matrix.md#WM-051]
negative_constraints: [Do not mint false domain commands for ephemeral presentation., Do not invent synthetic controls solely to satisfy a census.]
compile_disposition: extend_existing_owner
```
