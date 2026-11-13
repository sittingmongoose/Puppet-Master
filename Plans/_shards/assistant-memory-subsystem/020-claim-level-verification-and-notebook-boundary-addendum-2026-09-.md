# Shard 020: Claim-Level Verification And Notebook Boundary Addendum (2026-09-05)

Source: `Plans/assistant-memory-subsystem.md`

Source lines: L2821-L2956

Source SHA256: `83fe9d2ea751a44e58850e17ea49d08f998e8f44ce46e2cbfac9ffae6e201d6b`

---

## Claim-Level Verification And Notebook Boundary Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. This addendum amends §5.3 (amended in place on 2026-09-05; the retired existence-only sufficient conditions there are historical lineage only). A resolvable evidence reference is structural evidence, not universal semantic proof of the attached claim text. Verification therefore records per-claim support: each `claim` gains `evidence_support` — the subset of `evidence_refs[]` evaluated as supporting that claim — plus a `support_scope` (what the references actually cover) and a `currentness` value (`current | needs_revalidation | source_unavailable`). A `Commit { hash, repo_id }` EvidenceRef supports only claims about that commit's existence/content; a successful `TestRun`/`BuildRun` supports only claims within the tested scope; a valid `Artifact` hash supports only claims about that artifact. A commit existing, an unrelated green test, or a valid artifact hash alone cannot verify a broader attached claim; unsupported semantic text stays `Unverified`, and claims without adequate support surface as unverified with their support state rather than being silently treated as proven. Deterministic validators prove structural and scope relationships only; no deterministic proof of arbitrary natural-language entailment is claimed or attempted.

Correction and invalidation: when a claim, its evidence, or its relevant validity context changes (source mutated, revoked, pruned, or staleness re-detected), derived summary/index eligibility is recomputed and stale auto-injection stops; the original history is preserved and the revalidation status is explainable. Migrated or legacy gists marked Verified under the weaker rules are reassessed against the per-claim semantics on their next verification evaluation: unsupported ones stop auto-injecting, keep their original evidence/history, and move to a truthful state — an old Verified label is not blindly grandfathered. Notebook interaction boundaries are unchanged and reinforced: promotion from Working Notebook content runs only through the existing AutoRunBoundary/AutoMilestone trigger contracts and evidence gates (Working Notebook capture never bypasses them, and details never become default memory injection because they were once notes); notebook retrieval and memory injection are deduplicated and separately attributed in prompt assembly; and source restrictions hold across notebook sharing, summaries, tool outputs, checkpoints and handoffs. DL-475/AMS-026 permits read-only Project and personal note access for helpers, while private app-thread and denied material stay unavailable through all derivative paths.

```yaml
plan_unit_id: AMS-044
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Internal verification_state remains Unverified, Verified or Discarded. Automatic world-fact
  use requires current per-claim evidence_support and support_scope under AMS-044/045; unrelated tests,
  commits and artifacts do not prove arbitrary text. Explicit user-added or edited preferences and personal
  statements take a user-statement support path tied to the actual input and version: they establish what
  the user said or prefers, not independent world truth. No user Verify chore or manual/pinned bypass
  exists. Edits invalidate summaries, hashes, embeddings and eligibility before the next use; recheck
  automatically, preserving prior versions and evidence. Reference structural checks do not claim deterministic
  natural-language entailment. Support state stays internal, without a user verification view.'
gui_related: false
gui_classification_reason: Memory verification semantics are runtime behavior, not GUI work.
depends_on: [AMS-001]
unblocks: [AMS-045, AMS-046]
acceptance_criteria:
- Only current scoped support permits automatic use; user statements establish user statements, never
  independent world facts.
- Edits invalidate derived content and preserve audit history; no manual/pinned verification bypass remains.
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
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens: ["evidence_support", "support_scope", "currentness", "Unverified", "not universal semantic proof"]
negative_constraints:
- Do not treat an unrelated test, commit or artifact as proof of an arbitrary claim.
owner_hints: [Plans/assistant-memory-subsystem.md]
```

ContractRef: ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/Working_Notebook.md

DL-475: claim currentness is internal; the Out of date display group is retired.

```yaml
plan_unit_id: AMS-045
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Internal verification_state remains Unverified, Verified or Discarded. Automatic world-fact
  use requires current per-claim evidence_support and support_scope under AMS-044/045; unrelated tests,
  commits and artifacts do not prove arbitrary text. Explicit user-added or edited preferences and personal
  statements take a user-statement support path tied to the actual input and version: they establish what
  the user said or prefers, not independent world truth. No user Verify chore or manual/pinned bypass
  exists. Edits invalidate summaries, hashes, embeddings and eligibility before the next use; recheck
  automatically, preserving prior versions and evidence. Legacy Verified labels are not blindly grandfathered.
  Original evidence, audit history and internal revalidation status remain; needs_revalidation/source_unavailable
  blocks automatic use without Out of date display groups or reply notices.'
gui_related: false
gui_classification_reason: Invalidation semantics are runtime behavior, not GUI work.
depends_on: [AMS-044]
unblocks: [AMS-046]
acceptance_criteria:
- Only current scoped support permits automatic use; user statements establish user statements, never
  independent world facts.
- Edits invalidate derived content and preserve audit history; no manual/pinned verification bypass remains.
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
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens: ["not blindly grandfathered", "revalidation status", "audit history"]
negative_constraints:
- Do not treat an unrelated test, commit or artifact as proof of an arbitrary claim.
owner_hints: [Plans/assistant-memory-subsystem.md]
```

ContractRef: ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/storage-plan.md

DL-475: stale support blocks automatic use internally, without an Out of date user group.

```yaml
plan_unit_id: AMS-046
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: The Assistant remains the writer and manager. Crews, reviews and the chat assistant's
  other helpers may read the current Project's notes and the user's personal notes at Every project, read-only,
  subject to current source, actor, phase and permission restrictions. This grants no other Project access,
  helper-owned memory or access to private app-thread memory. NullMemoryProvider remains the denied/disabled
  path; read-only access cannot call upsert, delete or verification mutations. Summaries, notebooks, handoffs,
  tool outputs and caches inherit all restrictions; paraphrase cannot launder private or denied content.
  Promotion from Working Notebook still uses useful-content/evidence gates and deduplicated, separately
  attributed bounded assembly. Notebook absence grants nothing.
gui_related: false
gui_classification_reason: Memory boundaries are runtime behavior, not GUI work.
depends_on: [AMS-044]
unblocks: []
acceptance_criteria:
- Authorized helpers can read current Project notes and the same user's personal notes without mutation
  authority.
- Other Project notes and private app-thread memory stay unavailable, including via summaries/handoffs.
- Original storage, source/currentness, retention and native admission prerequisites remain.
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
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-b; N16/N25/N26
- 'Jared, 2026-11-03: "I approve the outstanding questions with their recommended settings."'
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens: ["NullMemoryProvider", "Assistant-only", "evidence gates", "separately attributed"]
negative_constraints:
- Do not create helper-owned memory or widen source/phase permissions.
- Do not expose private app-thread or other Project notes by null scope, known ID or paraphrase.
owner_hints: [Plans/assistant-memory-subsystem.md, Plans/Working_Notebook.md]
```

ContractRef: ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/Working_Notebook.md, ContractName:Plans/orchestrator-subagent-integration.md
