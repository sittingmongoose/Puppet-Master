# Shard 024: Ledger Compile Addendum - pldg-20260629-001-feature-name

Source: `Plans/Executor_Protocol.md`

Source lines: L6388-L6504

Source SHA256: `d166a4de287145e9f90b6a4ec20aaab8792a88fb70873ba27824e883bfc63909`

---

## Ledger Compile Addendum - pldg-20260629-001-feature-name

This addendum compiles Free Models executor dispatch and adapter activation behavior. It does not create WorkNodes, NodeSeeds, executable queues, generated governance artifacts, or implementation files.

### EP-107 - Free Models Dispatch Fallback Attempt Bounds And In-Flight Isolation

```yaml
plan_unit_id: EP-107
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Executor consumes Models_System precedence, Multi-Account pressure, Usage budget gates, and Prompt Pipeline requested/effective route snapshots when dispatching Free Models routes. Automatic fallback is bounded by configurable global/section limits and defaults to the initial selected/requested attempt plus `2` automatic fallback attempts. Auto Apply/model refresh changes never alter in-flight requests and apply only to new routing decisions after completion.
gui_related: false
gui_classification_reason: Defines runtime dispatch and in-flight request semantics, not GUI presentation.
depends_on: []
unblocks: []
acceptance_criteria:
  - Attempt limit counts the initial selected/requested model plus every automatic switch attempt.
  - Partial streaming failures are surfaced as partial/failure state with retry/switch action and are never silently retried/spliced.
  - Auto Apply/model refresh completion does not change in-flight model/provider/account/source snapshots.
  - Executor emits receipt inputs for attempted models, skipped entries, reasons, and final selected/stopped result.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Free Models fallback attempt limit fixtures
  - In-flight update isolation fixtures
  - Partial-stream failure routing fixtures
risk_class: fallback_dispatch_drift
reasoning_tier: high
context_scope: free_models_executor_dispatch
implementation_surfaces:
  - Plans/Executor_Protocol.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/usage-feature.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: free_models_executor_dispatch_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
source_atom_ids: [atom-0023, atom-0029, atom-0039, atom-0043, atom-0074, atom-0078, atom-0211, atom-0212, atom-0215, atom-0216, atom-0217, atom-0218, atom-0221, atom-0222, atom-0226, atom-0230, atom-0234, atom-0238, atom-0283, atom-0284, atom-0285, atom-0286]
preserved_exact_tokens:
  - "initial attempt plus 2 automatic fallbacks"
  - "attempt limit"
  - "partial streaming failures"
  - "Auto Apply/model refresh changes never alter in-flight requests"
  - "new routing decisions"
negative_constraints:
  - Do not make fallback unbounded by default.
  - Do not let automatic fallback retries bypass the configured attempt limit.
  - Do not silently retry/splice a different model after partial streaming output.
  - Do not break, cancel, or rewrite in-flight requests because Auto Apply or model refresh completes.
owner_hints:
  - Plans/Executor_Protocol.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/usage-feature.md
```

### EP-108 - Free Models PM-Owned Runtime Adapter Activation Boundary

```yaml
plan_unit_id: EP-108
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Executor may consume Free Models runtime behavior changes only after PM-owned adapter validation has produced safe declarative router/probe/normalizer/fallback configuration, test evidence, source hashes, activation receipts, quarantine state, and rollback refs. Executor must not run upstream daemons, Docker workflows, command scripts, local proxies, telemetry hooks, credential writers, endpoint installers, self-update logic, or arbitrary config writers as part of Free Models routing.
gui_related: false
gui_classification_reason: Defines executor/runtime activation boundary, not GUI presentation.
depends_on: []
unblocks: []
acceptance_criteria:
  - Runtime behavior changes are limited to Free Models and apply only after PM-owned adapter validation.
  - Unsafe upstream runtime behavior produces blocked/quarantined evidence rather than execution.
  - Activation receipts and rollback refs are available to diagnostics and storage.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Free Models adapter activation fixtures
  - Unsafe runtime behavior quarantine fixtures
risk_class: unsafe_runtime_activation
reasoning_tier: high
context_scope: free_models_runtime_adapter_activation
implementation_surfaces:
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/FileSafe.md
  - Plans/Permissions_System.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: free_models_runtime_adapter_activation_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/source_shards/free_coding_models_temp_checkout_inspection_20260629.json
source_atom_ids: [atom-0012, atom-0026, atom-0028, atom-0033, atom-0060, atom-0061, atom-0063, atom-0064, atom-0066, atom-0070, atom-0076, atom-0080, atom-0106, atom-0110, atom-0196, atom-0200, atom-0277, atom-0278]
preserved_exact_tokens:
  - "no Docker"
  - "native"
  - "Runtime behavior changes should be automatic too, but only for the free model provider."
  - "PM-owned declarative router/probe/normalizer/fallback configuration"
  - "activation receipts"
  - "quarantine"
  - "rollback"
negative_constraints:
  - Do not inherit the upstream local daemon as PM's execution model without PM-native adaptation.
  - Do not execute arbitrary upstream commands/scripts, local proxies, telemetry hooks, credential writers, endpoint installers, self-update logic, or arbitrary config writers.
  - Do not auto-apply runtime behavior for non-Free-Models providers during manual all-provider refresh.
owner_hints:
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/FileSafe.md
  - Plans/Permissions_System.md
```
