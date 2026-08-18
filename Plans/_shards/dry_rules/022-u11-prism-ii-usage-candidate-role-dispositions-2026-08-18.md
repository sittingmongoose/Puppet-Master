# Shard 022: u11 Prism II Usage candidate-role dispositions - 2026-08-18

Source: `Plans/DRY_Rules.md`

Source lines: L2199-L2315

Source SHA256: `91fc575972b2d5acdae089906cac29926df5ac7ee89aa70061e955e402038c1f`

---

## u11 Prism II Usage candidate-role dispositions - 2026-08-18

The u11 Prism II Usage concept proposed eighteen candidate roles. The shared-runtime service registry above
is a sixteen-row table whose closing paragraph already decides the general case: candidate roles absent from
the table remain with their existing domain owners, and a value type is not a service. None of the eighteen
appears in the table, so none is admitted; the registry is not extended and DR-037 remains the registry unit.

Dispositions are `value type` (a field or projection belonging to a domain owner), `already owned` (an
existing owner unit covers it), or `rejected` (the artifact itself must not exist).

| # | Candidate role | Disposition | Stays with |
|---|---|---|---|
| 1 | `UsageEventStore` | already owned | `Plans/usage-feature.md` accounting-record identity and dedupe, plus `Plans/storage-plan.md` persistence |
| 2 | `UsageNormalizer` | already owned | `Plans/usage-feature.md` provider parser and fixture contract, plus `Plans/Contracts_V0.md` adapter contracts |
| 3 | `SettlementResolver` | value type | `Plans/usage-feature.md` settlement field and `Plans/Contracts_V0.md` |
| 4 | `UsageDataQuality` | value type | `Plans/usage-feature.md` GUI projection fields and `Plans/Contracts_V0.md` |
| 5 | `UsageForecast` | value type | `Plans/usage-feature.md` UF-092 |
| 6 | `CapacityProjection` | already owned | `Plans/Goal_Runtime_System.md`; the shared peer for admission is `RuntimeResourceGovernor`, whose prohibited-peer column already names a per-feature admission governor |
| 7 | `RouteReceipt` | already owned | `Plans/Shared_Integration_Runtime.md` `ProviderDispatchAdmissionService`, whose prohibited-peer column already names a second provider-permit family |
| 8 | `CacheReceipt` | value type | `Plans/usage-feature.md` cache envelope and `Plans/Contracts_V0.md` bucket contracts |
| 9 | `TimeBreakdown` | already owned | `Plans/usage-feature.md` UF-091 partitions and `ObservableWork` |
| 10 | `ProviderFamilyUsage` | value type | `Plans/usage-feature.md` rollups and the `Plans/Contracts_V0.md` attribution tuple |
| 11 | `AccountConnectionUsage` | already owned | `Plans/Multi-Account.md` projection display rules |
| 12 | `HelperPurposeGroup` | value type | `Plans/usage-feature.md` UF-090 purpose taxonomy |
| 13 | `GoalCrewUsage` | already owned | `Plans/Goal_Runtime_System.md` and `Plans/orchestrator-subagent-integration.md`; Usage joins by lineage refs |
| 14 | `MaintenanceActivity` | already owned | `Plans/usage-feature.md` UF-091 and the already-registered operational attribution storage family; it is not new |
| 15 | `ContextUsageDetail` | already owned | `Plans/assistant-chat-design.md` context status module and `Plans/Contracts_V0.md` thread usage detail contracts |
| 16 | `UsageWidgetHost` | already owned | `Plans/Widget_System.md`; see below |
| 17 | `RunOutProjection` | rejected | no owner, and the artifact must not exist; see below |
| 18 | `SourceFreshness` | value type | `Plans/usage-feature.md` freshness and health fields, with freshness labelling by `OperationalAwarenessService` |

Net: zero admissions to the shared-runtime service registry.

### `UsageWidgetHost` collides with an existing owner

`Plans/Widget_System.md` already grants Usage widget hostability by name and already owns widget
hostability, layout, and projection inheritance for Dashboard, Usage, and Orchestrator Progress. The DRY
Home boundary above says the same thing for Dashboard: consumers cite that owner and do not re-declare the
layout field shape. A `UsageWidgetHost` service would therefore be a feature-local peer of an existing
owner. What the Usage concept actually needs is a Widget_System unit, and it has one: WS-016 binds the
disclosure mount filter, the empty-room contract, the Usage layout namespace under the WS-009 rule, and the
WS-015 value-state inheritance.

### `RunOutProjection` is rejected outright

There is no canonical run-out, depletion, or exhaustion-date concept anywhere in `Plans/**`, and the Usage
owner's negative constraints already forbid fabricating reset countdowns or remaining quota, requiring
missing reset signals to render unknown rather than a guessed countdown. A run-out date derived from a
month-end cost forecast is exactly such a guess. The role is rejected and the artifact is not created. If a
depletion signal is ever wanted, it must be a provider-evidenced value type under the Usage owner, keyed to
a real reset boundary with its own source class and confidence, rendering unknown in the absence of that
evidence, and never derived from a cost forecast.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Widget_System.md, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md

### DR-038 - Usage Candidate Role Dispositions

```yaml
plan_unit_id: DR-038
unit_type: owner_boundary
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  The eighteen u11 Prism II Usage candidate roles produce zero admissions to the sixteen-row shared-runtime
  service registry. Eleven are value types or projections that stay with an existing domain owner, six are
  already owned by a named owner unit, and one, RunOutProjection, is rejected outright because no canonical
  run-out concept exists and the Usage owner's negative constraints forbid the guessed countdown it would
  require. UsageWidgetHost in particular is not admitted because Widget_System already owns widget
  hostability, layout, and projection inheritance for Usage; the Usage need is met by a Widget_System unit,
  not a feature-local host service. This unit records dispositions only: it extends no registry row, creates
  no command, alias, event family, or schema peer, and leaves DR-037 as the registry unit.
gui_related: false
gui_classification_reason: This unit governs backend role ownership and delegation rather than visual presentation.
depends_on: [DR-037, UF-092, WS-016]
unblocks: []
acceptance_criteria:
  - Each of the eighteen candidate roles carries exactly one disposition and names the owner it stays with.
  - No candidate role is added to the shared-runtime service registry table and DR-037 remains the registry unit.
  - UsageWidgetHost is dispositioned to the existing widget owner rather than admitted as a service.
  - RunOutProjection is recorded as rejected, with the artifact itself forbidden rather than reassigned to a new owner.
  - The unit creates no command, alias, event family, schema peer, WorkNode, NodeSeed, or executable queue.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py lint-contractrefs
  - python3 scripts/pm-plans-verify.py lint-path-refs
risk_class: usage_role_parallel_owner_drift
reasoning_tier: high
context_scope: usage_candidate_role_dispositions
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/usage-feature.md
  - Plans/Widget_System.md
node_compile_hint:
  mode: usage_candidate_role_dispositions
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/usage-concepts/QwenUsageConcept/u11-prism.html (u11 Prism II Usage concept; source-lineage-only)"
  - Concepts/usage-concepts/PM_Usage_Independent_Audit_2026-08-17/handoff/PORT_HANDOFF_PLANS_ROUTE.md
preserved_exact_tokens:
  - UsageWidgetHost
  - RunOutProjection
  - RuntimeResourceGovernor
  - ProviderDispatchAdmissionService
  - OperationalAwarenessService
  - ObservableWork
negative_constraints:
  - Do not extend the sixteen-row shared-runtime service registry with a Usage candidate role.
  - Do not create a Usage-local widget host, capacity, freshness, or admission service beside an existing owner.
  - Do not create a run-out, depletion, or exhaustion-date projection.
  - Do not treat a value type as a shared service because a concept named it like one.
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/usage-feature.md
  - Plans/Widget_System.md
  - Plans/Shared_Integration_Runtime.md
```
