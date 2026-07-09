# Shard 024: Ledger Compile Addendum - pldg-20260624-001-provider-updates

Source: `Plans/usage-feature.md`

Source lines: L5027-L5115

Source SHA256: `ad9bf8f3329f9ada56d1e8bb2be054a7fc3f0e778ee641104e8913334070e9f1`

---

## Ledger Compile Addendum - pldg-20260624-001-provider-updates

This addendum compiles accepted provider-update ledger atoms into canonical usage and quota presentation requirements. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, generated governance artifacts, or production build tasks.

### UF-074 - Provider Usage Source Confidence And Missing-Vs-Zero Contract

```yaml
plan_unit_id: UF-074
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  Provider usage displays must carry source_confidence as high, medium, low, or unknown and separately distinguish missing, unavailable, unsupported, blocked, stale, estimated, provider-reported, and zero through value state, projection state, source_class, source_authority, settlement_status, or cost_status. Usage rows consume requested/effective provider, model, account, route, media, and artifact identity from Contracts/Models rather than inventing a feature-local provider schema. Media generation and coding-plan usage must disclose whether usage comes from provider status-line fields, direct provider API metadata, artifact receipts, local estimates, or unavailable source state. Antigravity public `agy` rows and Antigravity OAuth/internal `gemini-3.1-flash-image` generated-image routes keep separate usage/source-confidence rows where usage evidence differs; missing private/internal usage metadata is displayed as missing/unavailable, not zero.
gui_related: true
gui_classification_reason: Usage/quota/status rows are user-visible presentation and recovery behavior.
depends_on: [CV-292, CV-293, MA-063]
unblocks: [F3-400, F3-401, RAP-032]
acceptance_criteria:
  - Missing or unavailable provider usage is not displayed as zero.
  - Usage rows carry source confidence and route/account/model identity.
  - Media-generation artifacts can contribute usage/receipt metadata by reference.
  - Provider-specific source types are disclosed without exposing secrets.
  - Antigravity internal route usage and public `agy` catalog usage do not collapse into Gemini Direct or retired Gemini CLI usage buckets.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: usage_source_confidence_drift
reasoning_tier: high
context_scope: provider_usage_source_confidence
implementation_surfaces: [Plans/usage-feature.md, Plans/Contracts_V0.md, Plans/Multi-Account.md, Plans/Runtime_Artifacts_Panel.md]
node_compile_hint: {mode: provider_usage_source_confidence, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0122
  - pldg-20260624-001-provider-updates:atom-0129
  - pldg-20260624-001-provider-updates:atom-0130
  - pldg-20260624-001-provider-updates:atom-0142
  - pldg-20260624-001-provider-updates:atom-0143
source_atom_ids: [atom-0031, atom-0034, atom-0074, atom-0106, atom-0122, atom-0129, atom-0130, atom-0131, atom-0132, atom-0137, atom-0138, atom-0142, atom-0143]
preserved_exact_tokens: ["source_confidence", "missing-vs-zero", "rate_limits", "five_hour.used_percentage", "seven_day.used_percentage", "provider-reported", "estimated", "blocked", "unsupported", "unavailable", "zero", "agy", "gemini-3.1-flash-image"]
negative_constraints:
  - Do not display missing usage as zero.
  - Do not infer usage source confidence from provider family alone.
  - Do not expose secret material in usage diagnostics or receipts.
  - Do not collapse Antigravity public `agy`, Antigravity OAuth/internal image generation, Gemini Direct, or retired Gemini CLI lineage into one usage row.
owner_hints: [Plans/usage-feature.md, Plans/Contracts_V0.md, Plans/Runtime_Artifacts_Panel.md, Plans/FinalGUISpec.md]
```

### UF-075 - Provider Plan Gating And Quota Pressure Presentation

```yaml
plan_unit_id: UF-075
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  Provider usage and quota pressure must surface provider-specific plan, subscription, region, balance, resource-package, private/internal endpoint, and entitlement gates without converting them into purchase blockers. Kimi For Coding, MiniMax, Z.AI/Zhipu, GitHub Copilot, OpenAI/Codex subscription image generation, Antigravity public `agy` rows, Antigravity OAuth/internal `gemini-3.1-flash-image`, Alibaba/Qwen, Tencent, KUAE, and Umans rows may show disabled/capability-gated/unverified states until directly proven. Z.AI `glm-5.1`/`glm-5.2` overload, `glm-5v-turbo` plan-not-included, and image-generation balance/resource gating are accepted upstream/account states.
gui_related: true
gui_classification_reason: Quota, plan, entitlement, and recovery states are user-visible usage/settings behavior.
depends_on: [UF-074, MS-114, MA-063]
unblocks: [F3-400, F3-401]
acceptance_criteria:
  - Usage view distinguishes entitlement gaps, plan-not-included, balance/resource gating, regional profile mismatch, overload, and unsupported routes.
  - Rows that cannot be tested because no additional subscription is purchased are not compile blockers.
  - Provider media and coding-plan rows inherit the same support-state vocabulary as Models/Contracts.
  - Recovery copy points to concrete setup or account facts when available.
  - Antigravity internal/private endpoint states can appear as capability-gated/unverified without being presented as user purchase blockers.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: provider_plan_gate_ui_drift
reasoning_tier: high
context_scope: provider_plan_usage_presentation
implementation_surfaces: [Plans/usage-feature.md, Plans/FinalGUISpec.md, Plans/Multi-Account.md, Plans/Models_System.md]
node_compile_hint: {mode: provider_plan_gate_usage_presentation, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0124
  - pldg-20260624-001-provider-updates:atom-0128
  - pldg-20260624-001-provider-updates:atom-0138
  - pldg-20260624-001-provider-updates:atom-0142
  - pldg-20260624-001-provider-updates:atom-0143
source_atom_ids: [atom-0107, atom-0108, atom-0110, atom-0111, atom-0124, atom-0125, atom-0126, atom-0127, atom-0128, atom-0129, atom-0131, atom-0132, atom-0135, atom-0138, atom-0139, atom-0140, atom-0142, atom-0143]
preserved_exact_tokens: ["Kimi For Coding", "MiniMax", "Z.AI", "Zhipu", "GitHub Copilot", "OpenAI/Codex", "Antigravity", "agy", "gemini-3.1-flash-image", "private/internal endpoint", "Alibaba/Qwen", "Tencent", "KUAE", "Umans", "glm-5.1", "glm-5.2", "glm-5v-turbo", "plan-not-included", "balance/resource gating", "overload", "capability-gated", "unverified"]
negative_constraints:
  - Do not ask Jared to buy additional subscription plans to complete this planning lane.
  - Do not hide entitlement, region, balance, resource-package, or overload states behind generic provider failure.
  - Do not mark untested rows green from Models.dev or OpenCode config alone.
  - Do not hide Antigravity private/internal endpoint or artifact-proof caveats behind generic provider failure.
owner_hints: [Plans/usage-feature.md, Plans/FinalGUISpec.md, Plans/Models_System.md, Plans/Multi-Account.md]
```
