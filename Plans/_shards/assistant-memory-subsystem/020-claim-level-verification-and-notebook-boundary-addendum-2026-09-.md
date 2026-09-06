# Shard 020: Claim-Level Verification And Notebook Boundary Addendum (2026-09-05)

Source: `Plans/assistant-memory-subsystem.md`

Source lines: L2515-L2618

Source SHA256: `8d3a9b8eeb8228d19e1926c9c6d3a53d3780f7f90c0f394bbdd18055e4d3e995`

---

## Claim-Level Verification And Notebook Boundary Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. This addendum strengthens the Verified semantics of §5.3; it does not replace them. A resolvable evidence reference is structural evidence, not universal semantic proof of the attached claim text. Verification therefore records per-claim support: each `claim` gains `evidence_support` — the subset of `evidence_refs[]` evaluated as supporting that claim — plus a `support_scope` (what the references actually cover) and a `currentness` value (`current | needs_revalidation | source_unavailable`). A `Commit { hash, repo_id }` EvidenceRef supports only claims about that commit's existence/content; a successful `TestRun`/`BuildRun` supports only claims within the tested scope; a valid `Artifact` hash supports only claims about that artifact. A commit existing, an unrelated green test, or a valid artifact hash alone cannot verify a broader attached claim; unsupported semantic text stays `Unverified`, and claims without adequate support surface as unverified with their support state rather than being silently treated as proven. Deterministic validators prove structural and scope relationships only; no deterministic proof of arbitrary natural-language entailment is claimed or attempted.

Correction and invalidation: when a claim, its evidence, or its relevant validity context changes (source mutated, revoked, pruned, or staleness re-detected), derived summary/index eligibility is recomputed and stale auto-injection stops; the original history is preserved and the revalidation status is explainable. Migrated or legacy gists marked Verified under the weaker rules are reassessed against the per-claim semantics on their next verification evaluation: unsupported ones stop auto-injecting, keep their original evidence/history, and move to a truthful state — an old Verified label is not blindly grandfathered. Notebook interaction boundaries are unchanged and reinforced: promotion from Working Notebook content runs only through the existing AutoRunBoundary/AutoMilestone trigger contracts and evidence gates (Working Notebook capture never bypasses them, and details never become default memory injection because they were once notes); notebook retrieval and memory injection are deduplicated and separately attributed in prompt assembly; and the Assistant-only boundary holds — notebook sharing, summaries, tool outputs, checkpoints, and handoffs never forward Assistant-only memory payloads into workers or shared surfaces (`NullMemoryProvider` wiring unchanged), and worker notebooks gain no memory access through paraphrase or hidden metadata.

```yaml
plan_unit_id: AMS-044
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Verification is per claim. Each claim records evidence_support (the evidence_refs evaluated as supporting it), support_scope (what those references actually cover), and currentness (current | needs_revalidation | source_unavailable). A commit existing, a successful unrelated test, or a valid artifact hash cannot verify a broader attached claim; unsupported semantic text stays Unverified with visible support state. Deterministic validators prove structural/scope relationships only; no deterministic natural-language entailment proof exists or is attempted.
gui_related: false
gui_classification_reason: Memory verification semantics are runtime behavior, not GUI work.
depends_on: [AMS-001]
unblocks: [AMS-045, AMS-046]
acceptance_criteria:
  - Per-claim support and currentness are available to consumers.
  - A claim about more than its evidence covers remains unverified.
  - No fake deterministic entailment proof is claimed.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - Plans/working_notebook_contract_fixtures.json
risk_class: false_verification
reasoning_tier: high
context_scope: assistant_memory
implementation_surfaces: [Plans/assistant-memory-subsystem.md, Plans/Working_Notebook.md]
node_compile_hint: {mode: memory_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-M02
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A50
preserved_exact_tokens: ["evidence_support", "support_scope", "currentness", "Unverified", "not universal semantic proof"]
negative_constraints:
  - Do not verify a claim solely because a referenced commit, test, or artifact exists.
  - Do not present deterministic structural checks as semantic proof.
owner_hints: [Plans/assistant-memory-subsystem.md]
```

ContractRef: ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/Working_Notebook.md

```yaml
plan_unit_id: AMS-045
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: "When claims, evidence, or relevant validity context change, derived summary and index eligibility are invalidated as required and stale auto-injection stops. Superseded claims and migrated or weakly-Verified gists do not auto-inject as current: on their next verification evaluation they are reassessed against per-claim semantics, unsupported ones stop injecting while original evidence and audit history are preserved and the revalidation status is explainable. An old Verified label is not blindly grandfathered, and a correction never destroys audit history."
gui_related: false
gui_classification_reason: Invalidation semantics are runtime behavior, not GUI work.
depends_on: [AMS-044]
unblocks: [AMS-046]
acceptance_criteria:
  - Correction removes stale auto-injection without destroying audit history.
  - Migrated unsupported Verified gists stop auto-injecting and state why.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: stale_injection
reasoning_tier: high
context_scope: assistant_memory
implementation_surfaces: [Plans/assistant-memory-subsystem.md, Plans/storage-plan.md]
node_compile_hint: {mode: memory_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-M03
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A51
preserved_exact_tokens: ["not blindly grandfathered", "revalidation status", "audit history"]
negative_constraints:
  - Do not grandfather old Verified labels without reassessment.
  - Do not delete original history when correcting.
owner_hints: [Plans/assistant-memory-subsystem.md]
```

ContractRef: ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/storage-plan.md

```yaml
plan_unit_id: AMS-046
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: "The Assistant-only memory boundary holds against every notebook path: notebook sharing, summaries, tool outputs, checkpoints, and handoffs never forward Assistant-only memory into disallowed agents, directly or through derived notes or paraphrase, and notebook absence is never a reason to wire workers to Assistant memory. Promotion from Working Notebook content runs only through the existing trigger contracts and evidence gates; notebook retrieval and memory injection are deduplicated and separately attributed in prompt assembly, and note-derived detail never becomes default memory injection because it was once a note. The verified-only, summary-first model and configured budgets are retained."
gui_related: false
gui_classification_reason: Memory boundaries are runtime behavior, not GUI work.
depends_on: [AMS-044]
unblocks: []
acceptance_criteria:
  - A worker path never receives restricted memory payload directly or via derivative notes.
  - Promotion never bypasses evidence gates; note-derived detail stays out of default injection.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: memory_laundering
reasoning_tier: high
context_scope: assistant_memory
implementation_surfaces: [Plans/assistant-memory-subsystem.md, Plans/Working_Notebook.md, Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: memory_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-M01
  - source_packet:PM-WNC-2026-09-05-v1:WNC-M04
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A08
preserved_exact_tokens: ["NullMemoryProvider", "Assistant-only", "evidence gates", "separately attributed"]
negative_constraints:
  - Do not wire workers to Assistant memory because a notebook is absent.
  - Do not launder memory through note text, handoffs, or hidden metadata.
owner_hints: [Plans/assistant-memory-subsystem.md, Plans/Working_Notebook.md]
```

ContractRef: ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/Working_Notebook.md, ContractName:Plans/orchestrator-subagent-integration.md
