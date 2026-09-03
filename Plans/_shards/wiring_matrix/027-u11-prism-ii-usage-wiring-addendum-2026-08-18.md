# Shard 027: u11 Prism II Usage Wiring Addendum - 2026-08-18

Source: `Plans/Wiring_Matrix.md`

Source lines: L3784-L3866

Source SHA256: `d108a46be70fbc2c9a91dc216f291f8238ed1201412f6582a4ad93a1ccad03f6`

---

## u11 Prism II Usage Wiring Addendum - 2026-08-18

This addendum records the wiring obligation for the one new Usage command registered by UCC-146. One row,
`catalog.usage_forecast_request`, is appended to `Plans/Wiring_Matrix.production.json` with all thirteen
required fields. The addendum generates no wiring JSON of its own and creates no WorkNodes, NodeSeeds,
executable queues, implementation files, runtime artifacts, production build tasks, final manifests, or
PNC-019 receipts.

The row carries `expected_event_types: []`. That is the ruling, not an omission: all four existing
usage-named production rows carry the same empty list, the Event Authority denominator is `UNKNOWN_OPEN`,
and wiring must record the missing-event-registration disposition rather than fabricate an expected event.
Admission of a usage event family is a separate, individually adjudicated change that requires a registry
row with its own payload schema file and retention policy reference, an existing owner anchor, and a fresh
reconciliation of the open Event Authority finding; bulk registration is forbidden. Until all of that
lands, populating this row's event list would be a governance violation rather than an improvement.

### WM-044 - Usage Forecast Wiring Obligation

```yaml
plan_unit_id: WM-044
unit_type: wiring_contract
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  Production wiring for cmd.usage.forecast.request is the single row catalog.usage_forecast_request carrying
  all thirteen required fields: ui_element_id matching its key, ui_location naming the Usage page host,
  ui_command_id, the sole handler location, an empty expected_event_types list, acceptance checks, the
  standing evidence-required sentence, a state selector and a disabled-reason projection under the
  state.commands namespace, a receipt effect contract with a dispatch receipt reference, a full
  accessibility contract, the four standard test-evidence items, and an event-test requirement asserting a
  no-persist disposition. The row declares no event family and no route contract, because the command
  requests a labelled projection rather than navigating; it is not a usage route/open row and must not
  borrow the usage route correlation-passthrough contract. The empty event list is the required state while
  the Event Authority denominator remains UNKNOWN_OPEN, and it changes only through individual Event
  Authority admission of a named usage family with its own payload schema, retention policy reference, and
  existing owner anchor. No second primary row is created for this command, and the rejected candidate
  cmd.provider.usage.open_management is recorded as an excluded token rather than wired.
gui_related: true
gui_classification_reason: Wiring determines whether the visible Usage forecast control dispatches a canonical command and how its unavailability is announced.
depends_on: [WM-034, WM-043, UCC-146, CS-067]
unblocks: []
acceptance_criteria:
  - catalog.usage_forecast_request validates against the production wiring schema with all thirteen required fields and a ui_element_id matching its entries key.
  - The row declares expected_event_types as an empty list and carries an event-test requirement asserting a no-persist dispatch disposition.
  - The row declares a receipt effect contract and no route contract, and is not asserted against the usage route/open correlation-passthrough requirement.
  - The row carries the four standard test-evidence kinds and the standing evidence-required sentence.
  - cmd.provider.usage.open_management has no production wiring row and is present in the production exclusions token list.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plan-index.py validate
  - future Usage forecast wiring fixture suite
risk_class: usage_wiring_false_event_certification
reasoning_tier: high
context_scope: usage_forecast_wiring
implementation_surfaces:
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
  - Plans/Wiring_Matrix.production.exclusions.json
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: usage_forecast_wiring_obligation
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/usage-concepts/QwenUsageConcept/u11-prism.html (u11 Prism II Usage concept; source-lineage-only)"
  - Concepts/usage-concepts/PM_Usage_Independent_Audit_2026-08-17/handoff/PORT_HANDOFF_PLANS_ROUTE.md
  - Concepts/usage-concepts/PM_Usage_Independent_Audit_2026-08-17/handoff/HANDOFF_CORRECTIONS.md
preserved_exact_tokens:
  - catalog.usage_forecast_request
  - cmd.usage.forecast.request
  - missing_event_registration
  - UNKNOWN_OPEN
  - "state.commands.usage_forecast_request.availability"
negative_constraints:
  - Do not populate expected_event_types for this row before individual Event Authority admission of a named usage family.
  - Do not add a usage event family to the event family registry in this change.
  - Do not create a second primary wiring row for the same command.
  - Do not wire the rejected candidate id.
owner_hints:
  - Plans/Wiring_Matrix.md
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
```
