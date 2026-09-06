# Shard 017: One Effective Context Controller Addendum (2026-09-05)

Source: `Plans/CLI_Bridged_Providers.md`

Source lines: L1983-L2057

Source SHA256: `fd152e499c916023ef442a6aee30f924f7bcdf0d00b063a7bc567f86b6b081ff`

---

## One Effective Context Controller Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. For every route, the requested and effective context-control strategy is resolved before use at the concrete route/model/account/version — never by provider name: `pm_managed`, `provider_native`, or `unavailable`/`degraded_fallback` (the fallback policy is owned by `Plans/Prompt_Pipeline.md` PP-088). Only one controller initiates a context transition at a boundary. When the effective strategy is provider-native, PM observes the native transition (per PROVIDER-002 ordering: disable, redirect, project, observe; never promote an observation to canon automatically), keeps its own Goal/Plan/To-Do/permissions/usage and PM notebook records authoritative, and does not independently reset the same window. When the effective strategy is PM-managed, no provider-native reset is invoked for the same boundary. Capability facts come from the route's capability snapshot with provenance and staleness states per `Plans/Models_System.md`; a missing or stale snapshot yields `unavailable`/`degraded_fallback`, never a guess. Native hidden notes are optional observations and can never be the sole continuity source required for provider switching; loss of a native backend does not erase committed PM working state.

Observability stays honest at the PM-visible boundary: where the adapter cannot observe provider-internal prompt reconstruction, private notes, or token accounting, those fields stay explicitly `opaque`/`unknown` (PROVIDER-011 vocabulary). PM receipts describe PM-visible bytes and actions; no complete byte-level prompt audit is claimed, no provider events are invented, and no synthetic token totals fill gaps. This addendum changes nothing about provider support, authentication, installation, billing, quota endpoints, or CLI policy (PROVIDER-001/P04 scope): no preview flag, plan-tier eligibility, private endpoint name, or release-specific assumption enters universal PM canon.

```yaml
plan_unit_id: CBP-030
unit_type: requirement
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: "One effective context controller owns each transition boundary. The requested and effective strategy (pm_managed, provider_native, unavailable/degraded_fallback) is resolved per concrete route/model/account/version from the capability snapshot with provenance and staleness, never from provider-name guesses. PM and a native provider never independently reset the same window: provider-native transitions are observed (PROVIDER-002 ordering) while PM Goal/Plan/To-Do/permissions/usage and PM notebook records stay authoritative; PM-managed transitions invoke no native reset for the same boundary. Native hidden notes are optional observations, never the sole continuity source, and loss of a native backend never erases committed PM working state."
gui_related: false
gui_classification_reason: Controller strategy is provider/runtime behavior, not GUI work.
depends_on: [CBP-011, PP-084]
unblocks: [CBP-031]
acceptance_criteria:
  - PM and native provider do not both reset the same window.
  - Capabilities are route/model/account/version-specific with recorded provenance.
  - PM-owned state survives loss of a native backend.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - Plans/working_notebook_contract_fixtures.json
risk_class: dual_controller_reset
reasoning_tier: high
context_scope: provider_bridges
implementation_surfaces: [Plans/CLI_Bridged_Providers.md, Plans/Models_System.md, Plans/Prompt_Pipeline.md]
node_compile_hint: {mode: provider_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-P01
  - source_packet:PM-WNC-2026-09-05-v1:WNC-P02
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A33
preserved_exact_tokens: ["pm_managed", "provider_native", "degraded_fallback", "one controller", "never the sole continuity source"]
negative_constraints:
  - Do not freeze a transient upstream preview flag or tier rule into PM canon.
  - Do not let both layers initiate the same transition.
owner_hints: [Plans/CLI_Bridged_Providers.md, Plans/Models_System.md]
```

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Models_System.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Working_Notebook.md

```yaml
plan_unit_id: CBP-031
unit_type: requirement
status: accepted
owner_doc: Plans/CLI_Bridged_Providers.md
canonical_text: Provider observability is claimed only at the PM-visible boundary. Where the adapter cannot observe provider-internal prompt reconstruction, private notes, or token accounting, the corresponding capability or signal is recorded as unsupported/opaque/inferred/stale per PROVIDER-011 vocabulary; unknown native fields stay unknown. PM receipts describe PM-visible bytes and actions; no complete byte-level prompt audit is claimed, no provider events are invented, and no synthetic token totals fill gaps. Usage joins reuse the usage-feature identity and counting semantics; fresh-window, resume, and fork flows preserve cumulative usage lineage, and occupancy changes are never reported as quota or billing resets. This addendum does not change provider support, authentication, installation, billing, quota endpoints, or CLI policy.
gui_related: false
gui_classification_reason: Observability contracts are provider behavior, not GUI work.
depends_on: [CBP-030]
unblocks: []
acceptance_criteria:
  - Unknown native state renders as unknown/opaque in Context Details and Usage.
  - No synthetic provider events or zero-filled token totals exist.
  - Replay of a persisted usage event does not double-count after a fresh window.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: false_observability
reasoning_tier: high
context_scope: provider_bridges
implementation_surfaces: [Plans/CLI_Bridged_Providers.md, Plans/usage-feature.md, Plans/Shared_Integration_Runtime.md]
node_compile_hint: {mode: provider_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-P03
  - source_packet:PM-WNC-2026-09-05-v1:WNC-P04
  - source_packet:PM-WNC-2026-09-05-v1:WNC-U03
  - source_packet:PM-WNC-2026-09-05-v1:WNC-U04
preserved_exact_tokens: ["PM-visible boundary", "opaque", "unknown native fields stay unknown", "no synthetic token totals"]
negative_constraints:
  - Do not claim a complete prompt audit where the adapter cannot observe one.
  - Do not change provider auth/install/billing policy under this packet.
owner_hints: [Plans/CLI_Bridged_Providers.md, Plans/usage-feature.md]
```

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Shared_Integration_Runtime.md
