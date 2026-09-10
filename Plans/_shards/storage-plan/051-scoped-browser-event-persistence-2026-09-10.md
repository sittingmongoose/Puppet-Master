# Shard 051: Scoped Browser Event Persistence — 2026-09-10

Source: `Plans/storage-plan.md`

Source lines: L19110-L19149

Source SHA256: `b3802ab52407af666fb6a9984d717190e94932bcd1b7426b3ae2ddeb0628e8cd`

---

## Scoped Browser Event Persistence — 2026-09-10

### SP-260 - Browser Event Retention And Recovery Consumer

```yaml
plan_unit_id: SP-260
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Storage consumes the fifty-three individually adjudicated browser event families through the existing EventRecord
  seglog, scope/dedupe/checkpoint and retention owners. The admission manifest assigns existing policies to bounded
  metadata events only: twenty-three Run-bound families use RP-RUNTIME-365D and thirty non-Run-capable families use
  creation-anchored RP-AUTHORITY-INDEFINITE. Referenced content and physical owner records retain separate admission,
  retention and redaction obligations.
gui_related: false
gui_classification_reason: Persistence, retention, recovery and dedupe are storage contracts.
depends_on: [CV-330, SMPFS-166]
unblocks: []
acceptance_criteria:
  - Resolve each exact manifest assignment against the sole storage_value_registry retention catalog without adding a policy or changing historical Known-37 rows.
  - Every runtime-policy event requires a real Run and its run_completion anchor, one-million-per-Run and five-million-per-Project cardinality, successor rollover, holds and compact expiry.
  - Non-Run-capable workspace, page, lease, representation, routing, routine and handoff metadata use the existing creation anchor; never fabricate a Run to obtain expiry.
  - Indefinite retention is metadata-only, not indefinite retention of pages, DOM, code, screenshots, cookies, credentials or artifacts; referenced objects enforce their own independently admitted policy and permission.
  - Event admission does not register BrowserProgram, ProgramWorkspace, representation, lease, handoff or other referenced physical record families and does not bypass physical-family-registration-pending blockers.
  - Unknown or unregistered families, schema/scope conflicts and malformed payloads remain quarantined without checkpoint advance; recovery replays retained facts and revalidates current scope, generations, leases and effects before new action.
  - The combined registry has ninety-three rows, including the separately approved compaction-completion family under SP-259, but the complete global denominator remains UNKNOWN_OPEN; July currentness evidence and PNC-019/kernel receipts remain historical and are not resealed by this change.
validation_surfaces: [python3 scripts/pm-browser-event-admission.py, Plans/browser_event_admission_fixtures.json, tests/test_pm_browser_event_admission.py, Plans/storage_value_registry.json]
risk_class: browser_event_retention_anchor_or_physical_admission_escape
reasoning_tier: high
context_scope: scoped_browser_event_storage
implementation_surfaces: [Plans/event_family_registry.json, Plans/browser_event_admission.json, Plans/browser_event_payloads.schema.json, Plans/storage_value_registry.json]
node_compile_hint: {mode: static_storage_consumer_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:packet:PKT-04/04_COMMAND_EVENT_WIRING_REGISTER.md, Plans/Contracts_V0.md#CV-317, USER-PACKET-GAP-CLOSURE-20260910]
negative_constraints:
  - No bulk global Event Authority admission, historical Known-37 rewrite, new retention policy, raw body persistence or protected-auth access.
  - No physical family, native producer, replay durability, Case L closure, readiness or governance seal claim.
```

ContractRef: ContractName:Plans/Contracts_V0.md#CV-330, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-166, ContractName:Plans/browser_event_admission.json, ContractName:Plans/storage_value_registry.json
