# Shard 012: Ledger Compile Addendum - pldg-20260622-001-fff

Source: `Plans/Automated_Testing_System.md`

Source lines: L717-L788

Source SHA256: `d90751704683a723941159fa3a2b5ab0adffd47836b562629587d9aa9070f8e0`

---

## Ledger Compile Addendum - pldg-20260622-001-fff

### ATS-011 - Discovery Testing And Consumer Conformance

```yaml
plan_unit_id: ATS-011
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Automated_Testing_System owns validation for native DiscoveryService conformance, not service semantics. Tests cover ordinary no-exact-path bug-fix agent discovery, Builder orientation, Verifier exact-evidence follow-up, GUI/agent parity, every consumer conformance row, Assistant Chat discovery visibility on/off, SSH-backed discovery with no local checkout, remote/cache freshness, no local fallback, denied/hidden-by-policy no-leak behavior, root/home refusal, ignore and symlink policy, deterministic ranking, disabled/unsupported/backpressure/over-budget fallback receipts, frecency reset versus durable receipt retention, path identity versus display_path, cache migration/rebuild/discard behavior, scheduler dedupe/cancellation/fairness, and PlanUnit index discovery conformance without WorkNode creation.
gui_related: true
gui_classification_reason: This validates GUI parity, Assistant Chat visibility, visible degraded states, screenshots/receipts, and user-facing discovery surfaces.
depends_on: [T-160, T-161, T-162, T-163, CV-291, SP-217, SP-218, F2-191, PS-118, ACD-422, F3-399, OSI-429, EP-106, PNC-020, RAP-031]
unblocks: []
acceptance_criteria:
  - Each discovery consumer row has a validation scenario proving shared-substrate access and policy/freshness/fallback handling.
  - Performance budgets cover local warm query, GUI query, agent discover_paths, cold indexing, remote/SSH manifest query and refresh, watcher/reindex, cancellation, memory, disk, timeout, and over-budget fallback.
  - Tests prove denied/hidden candidates cannot leak through counts, selected ids, rank gaps, summaries, diagnostics, or receipts.
  - Tests prove no WorkNodes, NodeSeeds, executable queues, final node manifests, runtime launches, implementation files, or production build tasks are created by this compile/index lane.
validation_surfaces:
  - Future DiscoveryService conformance suite.
  - Future Assistant Chat visibility and toggle tests.
  - Future SSH/no-local-fallback tests.
  - Future PlanUnit index no-worknodes-created check.
risk_class: discovery_validation_gap
reasoning_tier: high
context_scope: discovery_conformance_testing
implementation_surfaces: [Plans/Automated_Testing_System.md, future discovery conformance tests, future GUI tests, future SSH tests]
node_compile_hint: {mode: validation_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260622-001-fff:atom-0025
  - pldg-20260622-001-fff:atom-0028
  - pldg-20260622-001-fff:atom-0043
  - pldg-20260622-001-fff:atom-0044
  - pldg-20260622-001-fff:atom-0045
  - pldg-20260622-001-fff:atom-0055
  - pldg-20260622-001-fff:atom-0052
  - pldg-20260622-001-fff:atom-0059
  - pldg-20260622-001-fff:atom-0065
  - pldg-20260622-001-fff:atom-0068
  - pldg-20260622-001-fff:atom-0070
  - pldg-20260622-001-fff:atom-0071
  - pldg-20260622-001-fff:atom-0072
  - pldg-20260622-001-fff:atom-0074
  - pldg-20260622-001-fff:atom-0075
  - pldg-20260622-001-fff:atom-0077
  - pldg-20260622-001-fff:atom-0078
  - pldg-20260622-001-fff:atom-0079
  - pldg-20260622-001-fff:atom-0080
  - pldg-20260622-001-fff:atom-0081
  - pldg-20260622-001-fff:atom-0082
  - pldg-20260622-001-fff:atom-0083
  - pldg-20260622-001-fff:atom-0084
  - pldg-20260622-001-fff:atom-0085
  - pldg-20260622-001-fff:atom-0086
  - pldg-20260622-001-fff:atom-0087
  - pldg-20260622-001-fff:atom-0089
  - pldg-20260622-001-fff:atom-0090
  - pldg-20260622-001-fff:atom-0091
  - pldg-20260622-001-fff:atom-0092
  - pldg-20260622-001-fff:atom-0093
  - pldg-20260622-001-fff:atom-0094
  - pldg-20260622-001-fff:atom-0095
  - pldg-20260622-001-fff:state/precision_contract.json#validation_acceptance_cases
source_atom_ids: [atom-0025, atom-0028, atom-0043, atom-0044, atom-0045, atom-0052, atom-0055, atom-0059, atom-0065, atom-0068, atom-0070, atom-0071, atom-0072, atom-0074, atom-0075, atom-0077, atom-0078, atom-0079, atom-0080, atom-0081, atom-0082, atom-0083, atom-0084, atom-0085, atom-0086, atom-0087, atom-0089, atom-0090, atom-0091, atom-0092, atom-0093, atom-0094, atom-0095]
preserved_exact_tokens: ["no-exact-path bug fix", "Builder orientation", "Verifier exact-evidence follow-up", "SSH project with no local checkout", "denied/hidden-by-policy no-leak", "disabled/unsupported/backpressure/over-budget fallback receipts", "deterministic ranking", "GUI parity without silent re-sort", "Assistant Chat visibility on/off", "frecency reset versus durable receipt retention", "PlanUnit index describing discovery conformance without WorkNodes"]
negative_constraints:
  - Do not claim implementation-ready pass without denied, stale, fallback, SSH, GUI, and exact-verification cases.
  - Do not let tests treat DiscoveryService ranking as exact content verification.
owner_hints: [Plans/Automated_Testing_System.md, Plans/Tools.md, Plans/FinalGUISpec.md, Plans/assistant-chat-design.md, Plans/storage-plan.md]
```
