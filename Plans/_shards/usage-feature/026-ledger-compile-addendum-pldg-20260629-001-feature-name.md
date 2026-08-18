# Shard 026: Ledger Compile Addendum - pldg-20260629-001-feature-name

Source: `Plans/usage-feature.md`

Source lines: L5214-L5330

Source SHA256: `8d8c2355529ad6e6cc8e01415a8f5e4861f9c8df6b6ff295268f45b5ecbf1164`

---

## Ledger Compile Addendum - pldg-20260629-001-feature-name

This addendum compiles Free Models usage, cost, and provenance behavior into Usage ownership. It does not create WorkNodes, NodeSeeds, executable queues, generated governance artifacts, or implementation files.

### UF-077 - Free Models Paid Costed Fallback Gates And Budget Evidence

```yaml
plan_unit_id: UF-077
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  Paid-overage, metered, credit-consuming, API-billed, entitlement-bound, org-policy-bound, and other non-free entries in the PM-wide top-10 may route only after PM resolves budget ceilings/thresholds, billing entity, entitlement class, org policy, account identity, and Usage attribution before dispatch. Optional budget controls and notifications coexist with always-on Usage visibility. The default budget preset levels are exactly `50, 80, 90, 95, 100`.
gui_related: true
gui_classification_reason: Includes user-visible budget settings, threshold visibility, and receipt disclosure for paid/costed fallback.
depends_on: []
unblocks: []
acceptance_criteria:
  - Costed or paid fallback cannot dispatch until budget, billing, entitlement, org policy, account identity, and Usage attribution are resolved.
  - Default budget presets remain exactly `50, 80, 90, 95, 100`.
  - Costed skipped/attempted entries remain visible in Usage/fallback receipts.
  - Budget controls do not flatten or erase provider/account pressure or charged-attempt attribution.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Paid fallback budget gate fixtures
  - Usage attribution and budget receipt fixtures
risk_class: surprise_spend
reasoning_tier: high
context_scope: free_models_costed_fallback_usage
implementation_surfaces:
  - Plans/usage-feature.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: free_models_costed_fallback_usage_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
source_atom_ids: [atom-0042, atom-0043, atom-0044, atom-0045, atom-0046, atom-0047, atom-0048, atom-0049, atom-0050, atom-0283, atom-0284]
preserved_exact_tokens:
  - "paid providers should be preferred"
  - "costed"
  - "50, 80, 90, 95, 100"
  - "May cost money"
  - "budget"
negative_constraints:
  - Do not allow surprise spend through automatic Free Models fallback.
  - Do not hide attempted charged or failed calls from Usage/fallback receipt evidence.
  - Do not let budget controls erase usage/cost attribution.
owner_hints:
  - Plans/usage-feature.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/Contracts_V0.md
```

### UF-078 - Free Models Fallback Receipts And Immutable Request Provenance

```yaml
plan_unit_id: UF-078
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  Usage and fallback receipts for Free Models include every actually attempted model with outcome, skipped entries with reasons, and the final selected/stopped result, collapsed by default and expandable for detail. Partial streaming failures show partial/failure state and retry/switch action instead of silently retrying or splicing a different model. In-flight requests record the exact model/provider/account/source snapshot they started with; Auto Apply and model refresh changes affect only new routing decisions and never rewrite prior attribution.
gui_related: true
gui_classification_reason: Usage receipts are user-visible and include collapsed/expanded receipt presentation behavior.
depends_on: []
unblocks: []
acceptance_criteria:
  - Receipts distinguish attempted models, skipped entries, final selected/stopped result, and skipped reasons.
  - Partial streaming failures are visible and never silently spliced into a different model output.
  - In-flight request attribution is immutable across Auto Apply/model refresh updates.
  - Normal Usage receipts show friendly model/provider names; exact snapshot IDs, source hashes, upstream refs, and alias/rename/provider-move chains live in expanded details or Advanced/Support.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Fallback receipt completeness fixtures
  - In-flight provenance immutability fixtures
risk_class: usage_attribution_drift
reasoning_tier: high
context_scope: free_models_usage_receipts
implementation_surfaces:
  - Plans/usage-feature.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Executor_Protocol.md
  - Plans/Models_System.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: free_models_usage_receipt_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
source_atom_ids: [atom-0107, atom-0111, atom-0212, atom-0216, atom-0220, atom-0224, atom-0226, atom-0230, atom-0234, atom-0238, atom-0242, atom-0246, atom-0250, atom-0254, atom-0258, atom-0262, atom-0276, atom-0284, atom-0286]
preserved_exact_tokens:
  - "normal Usage receipts"
  - "friendly model/provider names"
  - "exact snapshot IDs"
  - "source hashes"
  - "upstream refs"
  - "attempted model"
  - "skipped entries"
  - "partial streaming"
negative_constraints:
  - Do not silently retry/splice a different model after partial streaming output.
  - Do not let later Auto Apply/model refresh changes rewrite in-flight request Usage/provenance attribution.
  - Do not show snapshot IDs, source hashes, or upstream refs as primary normal Usage receipt content.
  - Do not rewrite normal Usage receipt names after upstream rename/provider move.
owner_hints:
  - Plans/usage-feature.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Executor_Protocol.md
  - Plans/Models_System.md
```
