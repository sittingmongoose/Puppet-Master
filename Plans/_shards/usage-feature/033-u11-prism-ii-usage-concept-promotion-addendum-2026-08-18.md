# Shard 033: u11 Prism II Usage Concept Promotion Addendum - 2026-08-18

Source: `Plans/usage-feature.md`

Source lines: L6329-L6418

Source SHA256: `b992d366f78133b51691900eac1e8a6e32e7b48648348bd6984c1acc2ab781d1`

---

## u11 Prism II Usage Concept Promotion Addendum - 2026-08-18

This addendum promotes the independently audited u11 Prism II Usage concept's page contract into one
canonical PlanUnit. `Concepts/usage-concepts/QwenUsageConcept/u11-prism.html` and the audit packet under
`Concepts/usage-concepts/PM_Usage_Independent_Audit_2026-08-17/` remain illustrative source-lineage only.
This addendum creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts,
generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

The concept's Settings destinations now consume the canonical typed route owned by
`Plans/Settings_System.md` SSYS-018: `cmd.settings.open` carries
`pm.settings_route_request.v1`, a setting or manager/detail target, and an exact-return contract. The
provider-setup route uses `target_type=setting` with the real inventory id
`ai.accounts.provider-connections`. The former `open(category, focusSettingId)` and four-field
manager/section/focus-reason envelopes are superseded inputs that require pre-dispatch migration and have
no primary catalog standing.

### UF-092 - Usage Page Counting Honesty, Settlement Axis, And Policy Boundary

```yaml
plan_unit_id: UF-092
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  The Usage page reports measured provider accounting and never manufactures it. A cache-read or reasoning
  bucket is folded into a displayed total only on a route whose provider publishes that bucket as separately
  billed; on a route with no published billing treatment the bucket renders as not exposed and the total is
  left unchanged rather than assuming an inclusive or an exclusive rule. Missing facts render unknown and
  never zero, and a provider-reported zero renders zero and never unknown; the two remain distinct display
  states with distinct reasons. Settlement is a separate axis from the billing route: settlement_status
  describes how far one attempt has progressed toward final accounting, while entitlement_class and
  provider_route_kind describe who pays for it, and the page never collapses the two into one badge. Usage
  reports and routes but owns no policy: a Usage affordance that would change a Settings-owned value
  deep-links to its owner through cmd.settings.open with a typed Settings-owned setting or manager/detail
  target, and the page stores, mutates, and re-declares nothing on the policy side. Provider-native quota units
  keep their own units, windows, and reset semantics and are never flattened onto a single cross-provider
  percentage scale.
gui_related: true
gui_classification_reason: The unit governs what the Usage page shows for unknown, zero, not-exposed, settlement, entitlement, and quota-unit values, and where a policy change is routed.
depends_on: [UF-085, UF-087, UF-089, UF-090, UF-091]
unblocks: []
acceptance_criteria:
  - A route with no published separate billing treatment for its cache-read or reasoning bucket renders that bucket as not exposed and leaves displayed totals unchanged; no fixture infers an inclusive or exclusive rule from an unpublished route.
  - Unknown and provider-reported zero render as distinct states with distinct reasons on every Usage surface, and no projection path converts one into the other.
  - Settlement state and billing route render as independent axes; a combined badge that hides one behind the other fails the fixture.
  - Every Usage affordance that would change a Settings-owned value dispatches cmd.settings.open with a typed target whose setting id exists in Plans/settings_inventory.json, preserves the exact-return contract, and writes no local policy value.
  - Provider-native quota units keep their own unit, window, and reset semantics; a single cross-provider percentage rollup fails the fixture.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-usage-contract-drift
  - python3 scripts/pm-plans-verify.py validate-usage-gui-fixtures
  - future Usage page projection and policy-boundary fixtures
risk_class: usage_page_fabricated_or_flattened_accounting
reasoning_tier: high
context_scope: usage_page_projection_contract
implementation_surfaces:
  - Plans/usage-feature.md
  - Plans/Widget_System.md
  - Plans/storage-plan.md
  - Plans/UI_Command_Catalog.md
  - Plans/settings_inventory.json
node_compile_hint:
  mode: usage_page_projection_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/usage-concepts/QwenUsageConcept/u11-prism.html (u11 Prism II Usage concept; source-lineage-only)"
  - Concepts/usage-concepts/PM_Usage_Independent_Audit_2026-08-17/AUDIT_REPORT.md
  - Concepts/usage-concepts/PM_Usage_Independent_Audit_2026-08-17/handoff/HANDOFF_CORRECTIONS.md
preserved_exact_tokens:
  - "not exposed"
  - unknown
  - settlement_status
  - entitlement_class
  - provider_route_kind
  - cmd.settings.open
  - "ai.usage.usage-windows"
  - "scope:all"
negative_constraints:
  - Do not fold a cache-read or reasoning bucket into a displayed total on a route whose provider publishes no separate billing treatment for it.
  - Do not render a missing value as zero, and do not render a provider-reported zero as unknown.
  - Do not let the Usage page own, persist, or mutate a Settings-owned policy value.
  - Do not flatten provider-native quota units onto one shared percentage scale.
  - Do not hardcode the concept fixture identities as canonical copy.
owner_hints:
  - Plans/usage-feature.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
  - Plans/Widget_System.md
```
