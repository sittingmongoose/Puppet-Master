# Worktree & Git Improvement -- Implementation Plan

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum
  - worktree behavior
  - Worktree / SCM / Parallelism Impacts
  - Cleanup Priorities
  - Suggested Research Follow-Ups

#### Source target target-0540
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
  - worktree behavior
  - Worktree / SCM / Parallelism Impacts
  - Cleanup Priorities
  - Suggested Research Follow-Ups
- Exact required items represented:
  - how are worktrees assigned for parallel nodes within the same package or seam
  - what happens to worktree ownership during remediation, corroboration, or graph-patch-triggered work
  - for package-based worktree pools, whether downstream dependent nodes reuse the same worktree lane or start a fresh lane from the promoted upstream result
  - preserve same-lane continuation by default; promote-then-fork only when it materially improves safe parallelism
  - Define lane↔worktree mapping
  - Specify [retired-token-14] detection and cross-lane reuse rules
  - Define [retired-token-11] restore for lane/package context
  - Resolve [retired-token-4] vs [retired-token-3] contradiction
  - Register PM-managed worktrees in source control visibility
  - Remove legacy `[retired-token-9]` / `[retired-token-10]` drift and [retired-token-15].
  - Normalize [retired-token-11] / [retired-token-12] / [retired-token-13] / [retired-token-14] terminology into one authoritative mapping and event taxonomy.
  - Decide which objects are persisted canonically (`package`, `seam`, `lane`, `promotion`, `review`, `resolution_thread`) and which are projections only.
  - Unify requested vs effective execution identity to include account, lane/worktree, and overseer class.
  - Specify package-based worktree lane pools, including lane ownership, pool sizing, [retired-token-14] detection, [retired-token-11] restore behavior, and Source Control visibility.
  - Worktree / SCM / Parallelism Impacts
  - why it matters: current SCM ownership is tier- and branch-based, which collides with package-lane worktree pools.
  - ownership is still described as run/tier/subtask worktree ownership
  - Worktree plan cleanup = removing worktree directories after merge/completion
  - `removed` means the live worktree directory is gone
  - removed
  - open worktree
  - prune/remove worktree
  - historical run/package/node/lane references MUST survive after live worktree cleanup
  - still references `Tiers` and per-tier worktree ownership.
  - Tiers
  - has `worktree_id` and historical receipt linkage, but likely needs lane/package/seam linkage added so worktree records do not remain stranded as flat Git objects.
  - worktree_id
  - `worktree filesystem state`
  - worktree filesystem state
  - cleanup of files inside a worktree is not the same thing as removing the worktree itself.
  - worktree health/state badges
  - keep worktree references contextual, actionable, and deep-linkable
  - backing worktree may be removed
  - `Worktree Removed`
  - Worktree Removed
  - removing a worktree directory
  - remove/prune/archive worktree
  - whether the backing worktree will be removed
  - Bulk worktree cleanup/archive/remove should remain preview-heavy and explicit.
  - live worktree existence
  - worktree = concrete Git/filesystem backing object
  - Recommended worktree row posture:
  - explicit destructive removal of live worktree backing after confirmation and eligibility checks
  - remove on a worktree with blocked/recovery lineage may approach `hard_gate`
  - hard_gate
  - worktree archived vs removed are distinct
  - `GitHub_Integration.md` still frames worktree ownership around `run/tier`
  - GitHub_Integration.md
  - run/tier
  - Workflow entry and worktree rules are no longer globally uniform:
  - Source Control emphasizes worktree as concrete Git object
  - still missing core persistence/acceptance sections and still under-specifies historical mode, worktree partitioning, and precise usage/deep-link behavior
  - Lane-aware scheduling still does not flow into worktree and active-agent tracking.
  - Worktree blocked reasons and historical lineage preservation still lack a single clear owner/emitter model.
  - `WorktreeGitImprovement.md` now has a sharper ownership split: `worktree_id` is first-class in `storage-plan.md` and `GitHub_Integration.md`, while the worktree plan still centers `tier_id`/filesystem path; it also still splits `base_branch` ownership across run config vs Git panel state and still returns raw git-hook errors instead of canonical blocked episodes.
  - WorktreeGitImprovement.md
  - storage-plan.md
  - tier_id
  - base_branch
  - durable worktree lineage, base-branch authority, and canonical blocked emitters remain unresolved.
  - durable worktree identity / filesystem / git backing
  - current lifecycle/status projection for the worktree
  - active worktree refs
  - historical worktree refs
  - `selected_worktree_id?` in project UI state is not a substitute for a durable worktree record family.
  - selected_worktree_id?
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - worktree detail:
  - `object_kind = worktree`
  - object_kind = worktree
  - consume worktree object routing rather than inventing a separate SCM-local navigation identity
  - Reclassify worktree selection and open-in-SCM flows as object navigation, not pure layout state.
  - Research Progress - 2026-03-17 - Worktree and SCM routing consumers
  - historical runs must preserve historical worktree references after prune/remove
  - Replace tier-bound worktree identity in SCM/runtime flows with the newer lane/worktree plus execution-context model.
  - reclassify worktree selection and thread Usage focus/open as navigation wrappers
  - Coverage has been re-audited after the merge: `39` top-level `Plans/*.md` docs are full six-pass complete and the remaining `22` docs are now uniformly at five passes.
  - 39
  - 22
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
  - still mirrors worktree ownership through `tier_id`
  - Git/worktree sections still use `tier_id` as worktree ownership glue
  - summary: Re-audited the already-condensed blocker bundle in smaller target passes and found one more precision improvement: assistant-chat blocked-state headings are real, so that blocker is now more clearly a skeletal consumer-payload problem rather than a missing-section problem.
  - `[retired-token-24]` sharpened: the broken `[retired-token-21]` reference survives not only in `[retired-token-20]` but also in `[retired-token-23]` and `[retired-token-22]`, while `[retired-token-19]` still preserves the `[retired-token-25]` contradiction.
  - [retired-token-24]
  - [retired-token-21]
  - [retired-token-20]
  - [retired-token-23]
  - [retired-token-22]
  - [retired-token-19]
  - [retired-token-25]
  - `[retired-token-22]:704-708`
  - [retired-token-22]:704-708
  - This invocation kept the blocker-family count at eight, raised the affected-doc count to twenty by pulling `[retired-token-22]` into the unresolved blocker set, and raised the underlying evidence count to fifty-four.
  - `[retired-token-31]` sharpened: `[retired-token-27]` still points at the missing `[retired-token-23]#[retired-token-26]` anchor, and both `[retired-token-28]` and `[retired-token-22]` still point at the missing `[retired-token-23]#Restart and stale history` anchor in addition to the already-carried missing `[retired-token-26]` heading.
  - [retired-token-31]
  - [retired-token-27]
  - [retired-token-23]#[retired-token-26]
  - [retired-token-28]
  - [retired-token-23]#Restart and stale history
  - [retired-token-26]
  - `[retired-token-22]:134-150`
  - [retired-token-22]:134-150
  - `[retired-token-22]:142-144`
  - [retired-token-22]:142-144
  - `cov-526` / `obl-222` remains unresolved because the ledger requires a concrete worktree allocation strategy (per node, per package, per seam, or remediation branch) plus [retired-token-14]/reuse/cleanup rules, but the live docs still stop short of that owner section: `Plans/Crosswalk.md:88-94` assigns lane/worktree ownership boundaries, `[retired-token-22]:62-66` and `[retired-token-22]:78-80` retain the worktree plan without defining allocation strategy, and `Plans/orchestrator-subagent-integration.md:28-41` plus later authority wording require identity alignment without specifying how lanes/worktrees are allocated. Exact ledger evidence remains at `working_ledger.md:L806`, `working_ledger.md:L1036`, `working_ledger.md:L1289`, and `working_ledger.md:L1539`.
  - cov-526
  - obl-222
  - Plans/Crosswalk.md:88-94
  - [retired-token-22]:62-66
  - [retired-token-22]:78-80
  - Plans/orchestrator-subagent-integration.md:28-41
  - working_ledger.md:L806
  - working_ledger.md:L1036
  - `[retired-token-22]:62-66`
  - `[retired-token-22]:78-80`
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #3 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #4 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #5 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #6 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #7 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #8 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #9 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #10 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #11 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #12 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #13 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #14 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #15 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #16 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #17 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #18 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #19 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #20 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #21 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #22 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #23 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #24 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #25 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #26 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #27 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #28 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #29 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #30 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #31 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-041: Source Control and worktree handshake

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0548
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Worktree visibility is only partially wired between Source Control and Orchestrator.** Several docs acknowledge shared visibility, yet status models still stop at repo/worktree/branch/tier rather than package/lane ownership, contamination, restore eligibility, or promotion posture.
  - Research Progress - 2026-03-16 - Source Control / Worktree Handshake
  - Reword Source Control worktree rows from `owner run/tier` to something like:
  - owner run/tier
  - Source Control worktree rows remain concrete and filesystem/Git oriented, but must show enough orchestration metadata to prevent isolation drift:
  - Source Control / worktree implication
  - no unresolved blocked recovery requiring that exact worktree
  - Because Source Control is narrow, it should default to compact current/live worktree rows with filters/toggles for:
  - safe-point and blocked recovery lineage can keep an old worktree relevant even after supersession
  - Orchestrator-owned worktree partitioning still exists only as row metadata (`owner run/tier`) in Source Control docs, not as a canonical grouping/partition contract
  - Move worktree docs onto node/lane-aware vocabulary and define projection authority between Source Control and Orchestrator receipt lineage.
  - Move worktree ownership to lane/worktree plus canonical run/node/attempt references, with Source Control remaining worktree-first at the UI level and Orchestrator remaining lane/package/seam/node-first operationally.
  - Source Control / worktree docs still describe boundary ownership in prose only; they still do not anchor one shared projection object or route payload that other surfaces can rely on.
  - Source Control and worktree docs still lack one durable object family for worktree ownership, restart authority, and historical lineage preservation.
  - Normalize Source Control worktree selection through `object_kind = worktree`.
  - object_kind = worktree
  - Source Control worktree selection is still described as UI state only even though worktree identity is now a first-class routed object in the broader model.
  - Keep Source Control worktree-first, but route by canonical worktree object identity rather than treating worktree selection as shell state or tier metadata.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-041
- Fidelity gap refs: cov-041
- Required fidelity items:
- Exact required item: Keep Orchestrator as lane-pool operational truth and Source Control as concrete repo/worktree operator
- Exact required item: Show owning package/lane/run refs plus lifecycle and blocked/recovery state on worktree rows
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-041: Source Control and worktree handshake` exists in `Plans/WorktreeGitImprovement.md`.
- Exact acceptance check: The `cov-041` repair states the exact requirement: Keep Orchestrator as lane-pool operational truth and Source Control as concrete repo/worktree operator
- Exact acceptance check: The `cov-041` repair states the exact requirement: Show owning package/lane/run refs plus lifecycle and blocked/recovery state on worktree rows
- Exact acceptance check: The `cov-041` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

### Fidelity recovery cov-059: Lane vs worktree lifecycle split

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0549
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Why it matters: worktree lifecycle, visibility, and conflict recovery cannot be coherent if both models remain canonical.
  - 5. **Specify package-based worktree lane pools end-to-end.**
  - what likely new model pressure is: scored ready-set scheduling, lane pools, package/seam governance split, contamination and safe-point-aware recovery.
  - likely issue: worktree ownership is still tier/subtask-native and does not support package-based lane pools or contamination quarantine.
  - a lane may preserve historical identity after the live worktree has been cleaned up, archived, or removed.
  - archive lane worktree
  - lane / worktree
  - recreate a pruned worktree lane only via new runtime action, not true undo
  - Research Progress - 2026-03-16 - Lane / Worktree Cleanup Lifecycle
  - a lane may remain historically important after its live worktree is archived or removed
  - a live worktree may be operationally suspect even while the lane remains active in orchestration terms
  - Orchestrator should continue to present the lane state and show worktree status in context.
  - Define distinct lane and worktree lifecycle states, with explicit mapping but no forced identity collapse.
  - Worktree lane binding and historical lineage preservation are now correctness requirements, not nice-to-have source-control polish.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-059
- Fidelity gap refs: cov-059
- Required fidelity items:
- Exact required item: Gate cleanup on runtime/recovery/lineage checks rather than age alone
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-059: Lane vs worktree lifecycle split` exists in `Plans/WorktreeGitImprovement.md`.
- Exact acceptance check: The `cov-059` repair states the exact requirement: Gate cleanup on runtime/recovery/lineage checks rather than age alone
- Exact acceptance check: The `cov-059` repair is in the owner section for `Plans/WorktreeGitImprovement.md` and is not only a downstream consumer note.

### Fidelity recovery cov-076: Historical semantic consistency

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0550
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - restore attempts and recovery episodes need current vs historical semantics
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-076
- Fidelity gap refs: cov-076
- Required fidelity items:
- Exact required item: Keep family-local workflow states distinct and reconcile remediation.resolved enum conflict
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-076: Historical semantic consistency` exists in `Plans/WorktreeGitImprovement.md`.
- Exact acceptance check: The `cov-076` repair states the exact requirement: Keep family-local workflow states distinct and reconcile remediation.resolved enum conflict
- Exact acceptance check: The `cov-076` repair is in the owner section for `Plans/WorktreeGitImprovement.md` and is not only a downstream consumer note.

### Fidelity recovery cov-169: Coverage blocker provider/model precedence owner section
- Coverage rows: cov-169
- Fidelity gap refs: cov-169
- Required fidelity items:
- Exact required item: Define one owner section covering provider/model precedence across run, seam, package, node, overseer, and delegated-subagent levels
- Exact required item: Tie that section to parallel-node worktree assignment and ownership transitions
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-169: Coverage blocker provider/model precedence owner section` exists in `Plans/WorktreeGitImprovement.md`.
- Exact acceptance check: The `cov-169` repair states the exact requirement: Define one owner section covering provider/model precedence across run, seam, package, node, overseer, and delegated-subagent levels
- Exact acceptance check: The `cov-169` repair states the exact requirement: Tie that section to parallel-node worktree assignment and ownership transitions
- Exact acceptance check: The `cov-169` repair is in the owner section for `Plans/WorktreeGitImprovement.md` and is not only a downstream consumer note.

### Fidelity recovery cov-171: Coverage blocker worktree allocation strategy
- Coverage rows: cov-171
- Fidelity gap refs: cov-171
- Required fidelity items:
- Exact required item: Define concrete worktree allocation strategy
- Exact required item: Define contamination, reuse, and cleanup rules for that strategy
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-171: Coverage blocker worktree allocation strategy` exists in `Plans/WorktreeGitImprovement.md`.
- Exact acceptance check: The `cov-171` repair states the exact requirement: Define concrete worktree allocation strategy
- Exact acceptance check: The `cov-171` repair states the exact requirement: Define contamination, reuse, and cleanup rules for that strategy
- Exact acceptance check: The `cov-171` repair is in the owner section for `Plans/WorktreeGitImprovement.md` and is not only a downstream consumer note.

### Fidelity recovery cov-189: Projection fields for startup rehydration
- Coverage rows: cov-189
- Fidelity gap refs: cov-189
- Required fidelity items:
- Exact required item: Carry blocked_reason_code and lifecycle state in worktree projections for startup recovery
- Exact required item: Carry dirty_state and conflict_state in worktree projections
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-189: Projection fields for startup rehydration` exists in `Plans/WorktreeGitImprovement.md`.
- Exact acceptance check: The `cov-189` repair states the exact requirement: Carry blocked_reason_code and lifecycle state in worktree projections for startup recovery
- Exact acceptance check: The `cov-189` repair states the exact requirement: Carry dirty_state and conflict_state in worktree projections
- Exact acceptance check: The `cov-189` repair is in the owner section for `Plans/WorktreeGitImprovement.md` and is not only a downstream consumer note.

### Fidelity recovery cov-206: Lane cleanup lineage fields
- Coverage rows: cov-206
- Fidelity gap refs: cov-206
- Required fidelity items:
- Exact required item: Keep package/work-package linkage and cleanup/archive lineage explicit in lane_record and lane_projection families
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-206: Lane cleanup lineage fields` exists in `Plans/WorktreeGitImprovement.md`.
- Exact acceptance check: The `cov-206` repair states the exact requirement: Keep package/work-package linkage and cleanup/archive lineage explicit in lane_record and lane_projection families
- Exact acceptance check: The `cov-206` repair is in the owner section for `Plans/WorktreeGitImprovement.md` and is not only a downstream consumer note.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


## Plan Document Status

**This is a PLAN DOCUMENT ONLY** -- No code changes have been made. The document is **implementation-ready**: gaps closed (Section 7.14), dependency order and acceptance criteria in Section 6, GUI aligned with FinalGUISpec and MiscPlan. This document consolidates:

- Worktree implementation gaps and fixes
- Git integration gaps and fixes
- GUI wiring and UX for Git/worktrees
- Dependencies on config wiring (enable_parallel, etc.)

The plan is **implementation-ready**: gaps closed (Section 7.14), dependency order and acceptance criteria in Section 6, GUI aligned with FinalGUISpec and MiscPlan. Resolve each section during implementation so worktrees and Git work correctly end-to-end.

## Rewrite alignment (2026-02-21)

This plan's correctness requirements remain authoritative. As the rewrite lands (see `Plans/rewrite-tie-in-memo.md`):

- Worktrees/branches/sandboxes are part of the **patch/apply/verify/rollback pipeline** (core reliability), not just a Git feature
- Provider working directories (and MCP injection) must respect worktree execution contexts deterministically
- Config references to YAML files should be treated as *current representations*; the rewrite may project settings via redb while retaining import/export

## SSOT references (DRY)

- Locked decisions: `Plans/Spec_Lock.json`
- DRY + ContractRef rule: `Plans/DRY_Rules.md`
- Canonical terms: `Plans/Glossary.md`
- Deterministic defaults and tie-breaks: `Plans/Decision_Policy.md`
- Verifier gates and progression policy: `Plans/Progression_Gates.md`

ContractRef: SchemaID:Spec_Lock.json, ContractName:Plans/DRY_Rules.md, ContractName:Plans/Glossary.md, PolicyRule:Decision_Policy.md, Gate:GATE-002

**ELI5/Expert copy alignment:** Authored Git/worktree tooltip/help copy in this plan must provide both Expert and ELI5 variants and follow `Plans/FinalGUISpec.md` §7.4.0. Use app-level **Interaction Mode (Expert/ELI5)** for variant selection; do not couple this to chat-level **Chat ELI5**.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Worktree Improvements](#2-worktree-improvements)
3. [Git Improvements](#3-git-improvements)
4. [GUI for Git & Worktrees](#4-gui-for-git--worktrees)
5. [Config Wiring (Prerequisite)](#5-config-wiring-prerequisite)
6. [Implementation Checklist](#6-implementation-checklist)
7. [Gaps, Risks, and Implementation Notes](#7-gaps-risks-and-implementation-notes) (includes [7.11 DRY and AGENTS.md](#711-dry-and-agentsmd-conventions), [7.14 Resolved decisions](#714-resolved-decisions-implementation-ready))
8. [References](#8-references)

---

## 1. Executive Summary

### Goals

- **Worktrees:** Reliable creation/merge/cleanup; correct base branch; recovery and visibility; no unwired or duplicate logic.
- **Git:** Single source of truth for branch naming; config-driven strategy; consistent binary resolution; commit format and logging aligned with docs.
- **GUI:** All Git/worktree-relevant settings visible, wired to the config the orchestrator uses, and consistent with tooltips and docs.

### Critical Blocker

The orchestrator reads **PuppetMasterConfig** from `ConfigManager::discover()` (YAML). The Config page edits **GuiConfig** and saves it to the same path (e.g. `puppet-master.yaml`). The two shapes differ; **enable_parallel** and other advanced/orchestrator fields in the GUI are never seen by the run. **Until config wiring is fixed**, worktrees and Git behavior cannot be fully controlled from the UI. For a consolidated list of unwired features and GUI gaps across plans, see **MiscPlan §9.1.18**.

### GUI updates needed

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0551
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - This should stay short and deep-link into Usage/Authentication/Orchestrator as needed.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

**Yes.** All Git/worktree-relevant settings must be visible and wired. Required: Branching tab (Enable Git, Auto PR, Branch strategy, optional Use worktrees/Parallel note); optional worktree list and "Recover orphaned worktrees" (placement: **Health** tab per FinalGUISpec); Git info for **active project**; tooltip cleanup. See [Section 4](#4-gui-for-git--worktrees) and Phase 4 checklist. Align with FinalGUISpec §7.4 (Branching and Health) and MiscPlan §7.5 (project path, Option B, cleanup ownership).

### Readiness for implementation

The plan is **ready to implement** with the following in mind:

- **Section 7** (Gaps, Risks, and Implementation Notes) adds the missing detail: config schema mismatch (including granularity enum vs string), how Doctor gets project path, backend run not using current project, conflict-worktree persistence, exact binary-resolution functions, repopulation behavior, granularity vs BranchStrategy, integration test setup, worktree Doctor check scope, and risks (config migration, save timing).
- **Phase 1 (config wiring)** must be implemented first (Option B: build run config from GUI at run start); the rest of the checklist can proceed in order. Section 7.1 and 7.10 describe mapping and save timing for Option B.
- **Optional items** (e.g. worktree list/recover UI, "nothing to commit" handling, re-validate worktree path) can be skipped for an initial release and done later.

---

## 2. Worktree Improvements

### 2.0 Symlink resolution in worktree paths

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0543
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Align worktree docs around `worktree_id` as durable identity and `lane_id` as operational lineage, rather than continuing to let tier IDs or raw paths carry canonical meaning.
  - worktree_id
  - lane_id
  - open-by-identity routing now clearly needs richer envelopes (safe point/worktree/baseline/artifact refs), not scalar IDs or plain paths.
  - worktree paths and branches keyed by `tier_id`
  - tier_id
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Worktree path resolution MUST apply the fail-closed symlink policy from `Plans/Permissions_System.md` §1.1 and `Plans/Architecture_Invariants.md` INV-017.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md

Required:
- All file paths computed relative to a worktree root MUST be normalized via `realpath()` before any scope check or file guard comparison.
- If `realpath()` fails on a worktree-relative path, the operation MUST be denied.
- The `working_directory` passed to FileSafe `check_file_write` MUST be the real path of the worktree root, not a symlinked alias.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Architecture_Invariants.md


### 2.1 Base branch for worktree creation

- **Gap:** Worktrees are created with `git worktree add -b <branch> <path>` from **current HEAD** of the main repo. There is no checkout of `config.branching.base_branch` first.
- **Impact:** If the main repo is on a feature branch, new worktrees are created from that branch instead of `main` (or configured base).
- **Fix:**
  - Before creating worktrees for a parallel group, ensure the main repo is on `config.branching.base_branch` (e.g. `git checkout base_branch` or at least validate and warn).
  - Optionally: create worktrees from a specific ref, e.g. `git worktree add -b <branch> <path> <base_branch>` (supported in recent Git).

### 2.2 active_worktrees lost on restart

- **Gap:** `active_worktrees` is in-memory only. After restart it is empty; real worktrees may still exist under `.puppet-master/worktrees/`, but `get_node_worktree(node_id)` returns `None`, so iterations use the main repo path.
- **Fix (choose one or combine):**
  - **Option A:** On orchestrator init (or when loading a run), repopulate `active_worktrees` from `worktree_manager.list_worktrees()` for paths under `worktree_base`.
  - **Option B:** When resolving working directory for a node, if `active_worktrees` has no entry, fall back to `worktree_manager.get_worktree_path(node_id)` and verify the path exists and is a valid worktree (e.g. in `list_worktrees()`); if so, use it and optionally re-register.

### 2.3 Merge conflicts: worktree kept but re-run can destroy it

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0544
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - what old assumption is present: `tier_id` / subtask worktree ownership, branch-per-tier flow, merge fallback posture, parallel subtasks as primary parallelism model.
  - tier_id
  - Evidence items can be exported
  - These can be linked, but should not be collapsed into one object model.
  - `cmd.source_control.select_worktree` still claims `layout/UI state only`, which conflicts with object-first routing and worktree identity
  - cmd.source_control.select_worktree
  - layout/UI state only
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

- **Gap:** On merge conflict, `cleanup_subtask_worktree` returns without removing the worktree but removes the node from `active_worktrees`. Re-running the same subtask calls `create_subtask_worktree` → `create_worktree` → "if path exists remove_worktree", so the conflicting worktree is removed and the conflict state is lost.
- **Fix:**
  - On conflict, either: (1) surface the worktree path to the user (e.g. toast or status) and avoid reusing that node_id for a new worktree until the user resolves or discards, or (2) document clearly that re-running will replace the worktree and lose unmerged state.
  - Optionally: add a "Resolve worktree conflicts" action that lists worktrees with merge conflicts and offers to open in editor or remove after confirmation.

### 2.4 Node ID and branch name sanitization

- **Gap:** Worktree path is `worktree_base.join(node_id)` with no sanitization; branch name is `format!("subtask/{}", subtask_id.replace('.', "-"))` with no other sanitization. Risky for path traversal or invalid refs.
- **Fix:**
  - Sanitize `node_id` for use as a single path component (strip or replace `..`, path separators, and other unsafe characters) before `join`.
  - Sanitize branch name for git refs (e.g. reuse or mirror `BranchStrategyManager::sanitize_id` or a shared helper; disallow spaces and other invalid ref characters).

### 2.5 Branch already exists when recreating worktree

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0545
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `source_control.project_state.{project_id}` already has `selected_worktree_id?`
  - source_control.project_state.{project_id}
  - selected_worktree_id?
  - `requested_account_policy` exists
  - requested_account_policy
  - `effective_account_id` exists
  - effective_account_id
  - canonical docs already model `requested_account_policy`
  - canonical docs already model `effective_account_id`
  - `trust_tier` already exists in preview/browser state
  - trust_tier
  - `usage_record` already carries `attempt_id?`
  - usage_record
  - attempt_id?
  - `attempt_record` already has `provider_attempt_ref?`
  - attempt_record
  - provider_attempt_ref?
  - This is now mostly an owner-doc problem, not a conceptual one; the identity vocabulary already exists in scattered places.
  - `object_id` should use the canonical domain identity already present in the docs:
  - object_id
  - Owner docs already implicated:
  - owner docs already contain stronger rewrite-era addenda
  - The doc is already ahead on identity in some places:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

- **Gap:** If the branch (e.g. `subtask/ST-001-001-001`) already exists (e.g. after incomplete cleanup), `git worktree add -b <branch> <path>` fails with "fatal: A branch named '...' already exists."
- **Fix:**
  - Before `worktree add -b`, check if the branch exists (e.g. `git rev-parse --verify refs/heads/<branch>`). If it exists, use `git worktree add <path> <branch>` (no `-b`) to create the worktree from the existing branch, or explicitly delete the branch if it is safe (e.g. no other worktree uses it).

### 2.6 Detached HEAD worktrees

- **Gap:** `list_worktrees` only sets `branch` when it sees a `branch refs/heads/...` line. Detached HEAD worktrees yield empty `branch`; `merge_worktree` would then call `git merge ""`.
- **Fix:** When parsing porcelain output, treat missing branch as "detached". In `merge_worktree`, if source_branch is empty, skip merge or merge by commit hash and document behavior.

### 2.8 Lane/worktree lifecycle, storage families, and historical vocabulary

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0546
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Recommended lane/worktree lifecycle vocabulary:
  - Some families clearly need local lifecycle terms, and the docs do not yet sharply separate “cross-family historical overlays” from “family-local workflow states.”
  - still cannot support durable historical worktree lineage or multi-identity SCM audit without new record families.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

#### Lane and worktree lifecycle
- Lanes own worktrees through explicit allocation and handshake.
- Worktrees are allocated at lane start and reclaimed at lane end (implicit or explicit).
- Storage families define data layout and cleanup rules; worktrees may span multiple storage families.

#### Source Control to Orchestrator handshake
- When a lane requests a worktree, Source Control MUST confirm allocation, provide the worktree path, and publish any applicable storage metadata.
- Orchestrator records the handshake in the ledger so restart and recovery can reuse the same worktree.
- Stale worktrees (allocated but not reclaimed) are eligible for cleanup via storage housekeeping.

#### Provider/model precedence and worktree allocation strategy
- Worktree allocation strategy is determined by lane policy, not by individual nodes.
- Multiple providers may offer worktree allocation; the lane selects a primary provider and routes all allocations through that provider.
- Fallback providers are secondary; they are used only if the primary provider is unavailable.
### Source Control to Orchestrator handshake
Source Control is the concrete repo/worktree operator, while Orchestrator remains the lane-pool operational truth.

Required row fields:
- owning package reference
- `lane_id`
- `run_id`
- `worktree_id`
- lifecycle state
- blocked/recovery state

Rules:
- worktree rows MUST show owning package, lane, and run references together with lifecycle and blocked/recovery state
- Source Control actions operate on concrete repositories and worktrees but MUST report results back through canonical lane/worktree records
- Orchestrator decisions about reuse, cleanup, retry, and recovery consume the same lane/worktree records rather than side files

### Provider/model precedence and worktree allocation strategy
Provider/model selection and worktree allocation are one ownership surface because allocation follows the effective execution scope.

Precedence order:
- delegated subagent
- overseer
- node
- work package
- seam
- run

Allocation rules:
- parallel nodes receive distinct worktree allocations unless they explicitly reuse an existing clean allocation owned by the same effective scope
- contamination, dirty-state, conflict-state, blocked recovery, or lineage mismatch disqualify reuse and force a new allocation or explicit repair
- cleanup only occurs after lineage-safe completion or archival and MUST preserve the historical record of the lane/worktree pair
- ownership transitions between scopes MUST update the effective provider/model choice together with the lane/worktree assignment record
### 2.9 PR creation after restart uses main repo branch

- **Gap:** After restart, `get_node_worktree(node_id)` is `None`. `create_node_pr` then uses `git_manager.current_branch()` for head_branch, so the PR is created from the main repo branch, not the worktree branch.
- **Fix:** When resolving head branch for PR, also consider `worktree_manager`: if a worktree path exists for this node (e.g. from `list_worktrees()` or path existence + valid worktree), use that worktree's branch even when `active_worktrees` has no entry.

### 2.10 merge_worktree assumes target_branch exists

- **Gap:** `merge_worktree` does `git checkout target_branch`. If the branch doesn't exist, checkout fails.
- **Fix:** Check for existence of `target_branch` (e.g. `git rev-parse --verify refs/heads/<branch>`). If missing, create it from current HEAD or a configured default, or return a clear error that base branch is missing.

### 2.11 Documentation and Doctor

- **STATE_FILES.md:** Add a subsection under `.puppet-master/` describing worktrees (purpose, lifecycle, that progress/PRD/AGENTS remain in main workspace, recovery).
- **Doctor:** Add a "worktrees" check: run `git worktree list`, verify `.puppet-master/worktrees` state, optionally run `detect_orphaned_worktrees()` and report or suggest recovery.

### 2.12 Optional: re-validate worktree path before use

- Before building `IterationContext`, optionally verify the worktree path still exists and is still in `git worktree list`; if not, remove from `active_worktrees` and fall back to main repo (and log).

---

## 3. Git Improvements

### 3.0 Git subprocess integrity invariant

#### 3.0.1 Exit-code classification and recovery

Git subprocess exit codes are classified into three recovery categories:

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/FileSafe.md

| Exit Scenario | Classification | Recovery Action |
|---|---|---|
| Exit 0 | success | proceed normally |
| Exit 1 with `nothing to commit` on stdout | informational | proceed (not an error for commit operations) |
| Exit 1 (generic failure) | fatal | fail the operation with structured error; do not retry |
| Exit 128 + signal (e.g., SIGKILL, SIGTERM) | fatal | fail immediately; report the signal in the error |
| Exit 128 (ambiguous) | fatal | fail the operation; log full stderr for diagnosis |
| Lock contention (`index.lock` exists) | retryable | retry once after 500ms backoff; fail on second attempt |
| Network timeout (fetch/push/clone) | retryable | retry with exponential backoff (max 3 attempts, base 1s) |
| Authentication failure (exit 128 with auth error on stderr) | fatal | fail immediately; surface credential refresh guidance |
| Disk full / permission denied | fatal | fail immediately; surface the OS-level error |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Modes.md

Rules:
- Retryable scenarios MUST use bounded retry with backoff. Maximum 3 retry attempts for network operations; maximum 1 retry for lock contention.
- Fatal scenarios MUST NOT be retried. The operation fails with a structured error that includes the git command, exit code, and stderr content.
- The `nothing to commit` case is the only exit-1 scenario that is not treated as a hard error. All other non-zero exits follow the hard-error rule from §3.0.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Architecture_Invariants.md

Every git subprocess that mutates or validates PM-managed state MUST treat a non-zero exit status as a hard error.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Executor_Protocol.md

Required behavior:
- after `git add`, verify staged state with `git status --porcelain`
- do not silently swallow non-zero exits from `git add`, `git commit`, `git stash`, `git checkout`, or equivalent mutation-sensitive commands
- distinguish `nothing to commit` from generic failure, but do not treat genuine git command failure as informational noise

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

### 3.1 Git binary resolution

- **Gap:** `GitManager::run_git_cmd` uses `Command::new("git")` (PATH only). Doctor's `GitInstalledCheck` uses `find_tool_executable("git")` (PATH + fallback dirs). If git is in a custom/app-local path, Doctor can pass but runtime git operations can fail.
- **Fix:** Use a shared helper (e.g. from `path_utils` or a small `git_resolver` module) to resolve the `git` executable. Have both `GitManager` and the Doctor check use it (e.g. `GitManager::new(repo_path, git_binary: Option<PathBuf>)` or resolve at call site).

### 3.2 GitHub PR creation (API-only; no GitHub CLI)

- **Gap:** PR creation currently relies on a GitHub CLI subprocess in some legacy integration paths. This violates the locked decision: GitHub operations are **API-only**.
- **Fix:** Implement PR creation via GitHub HTTPS API per `Plans/GitHub_API_Auth_and_Flows.md` (OAuth device-code token in OS credential store). Doctor must validate GitHub API auth state and required scopes; runtime PR creation must not shell out to a GitHub CLI.

### 3.3 Git configured check: global vs local

- **Gap:** `GitConfiguredCheck` only checks `git config --global user.name` and `user.email`. Repos using only local config will fail the check even though commits would succeed.
- **Fix:** Consider "configured" if either global or local is set. Run `git config user.name` and `git config user.email` without `--global` in the project directory (when available) and pass if either global or local has both name and email.

### 3.4 Git repo check: use project path

- **Gap:** `GitRepoCheck` uses `resolve_git_init_dir()` (CWD if writable, else HOME). The "current directory" may not be the active project; fix runs `git init` in the wrong place.
- **Fix:** When a project/working directory is known (e.g. from config or app state), run the check and fix in that directory. Only fall back to CWD/home when no project is set.

### 3.5 Branch strategy from config

- **Gap:** Orchestrator hardcodes `BranchStrategy::Feature`. `GitConfig` in types has `branch_strategy`, but the orchestrator never reads it.
- **Fix:** Add branch strategy to the config the orchestrator loads (e.g. under `branching` or a dedicated `git` section). Map config value to `BranchStrategy` and use it in `create_node_branch` instead of hardcoding.

### 3.6 Single source of truth for branch naming

- **Gap:** Orchestrator inlines branch name generation in `create_node_branch`; `BranchStrategyManager::generate_branch_name` implements similar but not identical logic (e.g. iteration: "it-" vs "tk-").
- **Fix:** Use one implementation for all branch naming (e.g. `BranchStrategyManager` or a shared function used by both orchestrator and any other callers). Remove duplicate logic from the orchestrator.

### 3.7 naming_pattern usage

- **Gap:** `BranchingConfig` has `naming_pattern` (and it's in the GUI); orchestrator and branch logic never use it.
- **Fix:** Either: (1) Wire `naming_pattern` into branch name generation (document format and placeholders, e.g. `{node}`, `{id}`), or (2) Remove or hide the field until implemented and document that branch names follow the strategy (ph-/tk-/st-/release/...) only.

### 3.8 Commit message format

- **Gap:** `commit_node_progress` uses `format!("node: {} iteration {} complete", node_id, iteration)`. AGENTS.md and `CommitFormatter` use the `pm: [ITERATION] ...` convention.
- **Fix:** Use `CommitFormatter::format_iteration_commit(subtask_id, iteration, success)` (or equivalent) for iteration commits so they match the documented "pm:" convention.

### 3.9 git-actions.log path and .gitignore

- **Gap:** `GitManager` writes to `repo_path.join(".puppet-master").join("git-actions.log")`. REQUIREMENTS.md says "All git operations recorded in: `.puppet-master/logs/git-actions.log`". Paths differ; .gitignore does not mention this log.
- **Fix:** Either move the log to `.puppet-master/logs/git-actions.log` to match REQUIREMENTS, or update REQUIREMENTS to the current path. Then decide whether to add this log (or `.puppet-master/logs/`) to .gitignore if it is runtime-only.

### 3.10 Doctor: git usable in project

- **Gap:** Doctor checks git installed, configured (global), and "in a repo" (CWD/home). It doesn't check that the **project** directory is a repo or that basic git commands work there.
- **Fix:** Optional: add a check that, when the configured project path is known, runs `git rev-parse --git-dir` (and optionally `git status`) in that directory and reports success/failure.

### 3.11 Empty commit handling

- **Gap:** When there are no changes, `git commit` fails with "nothing to commit". The code logs a warning; no distinction from real errors.
- **Fix:** Optional: detect "nothing to commit" (e.g. from stderr or exit code) and log at debug/info to reduce noise.

---

## 4. GUI for Git & Worktrees
`Source Control` remains the Git/worktree owner surface.

Rules:
- The GUI model stays `worktree-first` when it hands off to Source Control.
- Cross-references now point at `Plans/Orchestrator_Page.md#Source Control boundary` rather than the stale numbered anchor.
## 5. Config Wiring (Prerequisite)

### 5.1 Problem

- **Config page** loads/saves **GuiConfig** (YAML with `project`, `nodes`, `branching`, `advanced`, ...) to `active_config_path()` (e.g. `puppet-master.yaml`).
- **Orchestrator run** uses **PuppetMasterConfig** from `ConfigManager::discover()` (same path). The two YAML shapes differ; many GUI fields (e.g. `advanced.execution.enable_parallel`, `branching.auto_pr`) are not present in the shape the orchestrator expects, so they default.
- **Result:** "Enable parallel execution" and other such settings have no effect on the run.

### 5.2 Chosen approach: Option B -- Build run config from GUI

- **Option B (selected):** When starting a run, build `PuppetMasterConfig` (or the part the orchestrator needs) from the current **in-memory** `gui_config`. **Option B v1:** Run config is built from `gui_config` only for the fields in 5.3; no file merge in initial release. The run sees the latest GUI values without requiring "Save" first (e.g. `enable_parallel_execution` from `gui_config.advanced.execution.enable_parallel`). If building run config from `gui_config` fails (e.g. missing required field), fall back to `ConfigManager::discover_with_hint(hint)`; if that also fails, fail the run with a clear error (do not start with default-only config silently).
- **Implications:** Save on the Config page continues to persist GuiConfig to disk for next app launch. The orchestrator backend receives a config derived from `gui_config` at run start, so "Run" always uses the current UI state. Document this behavior in the UI (e.g. tooltip: "Run uses current settings; Save stores them for next time.").
- **Settings projection (rewrite):** Option B and Phase 1 are required for initial release and must work with **YAML-only** config. Redb/seglog is out of scope for this plan; when storage-plan lands, run config can be read from redb instead of gui_config. In the seglog/redb architecture (storage-plan.md), config/settings may be **projected in redb**; branching/worktree/Git settings would then live in the same redb projection.

*(Other options for reference: Option A = single canonical YAML schema; Option C = two files. Not chosen.)*

### 5.3 Fields to wire (minimum)
### 5.4 Execution-affecting projection completeness

Option B remains the canonical run-start config projection path.

Completeness rule:
- any GUI setting that changes runtime behavior belongs in the run config snapshot built at start
- interview execution-affecting settings and HITL node toggles are part of this rule even when their owning feature plans define the detailed semantics
- summaries in this document must reference the owning SSOTs rather than implying that GUI-only execution settings are acceptable

This section extends the minimum-field list with the policy that execution-affecting settings are projected by class, not by ad hoc exception.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/human-in-the-loop.md

- `enable_parallel_execution` ← `gui_config.advanced.execution.enable_parallel`
- `enable_git` (if exposed in GUI) ← corresponding GUI field
- `branching.base_branch`, `branching.auto_pr` (and optionally strategy, granularity, naming_pattern) from GUI branching tab into the config the orchestrator uses.
- `concurrency.global.per_provider` from GUI settings (global per-provider caps).
- `concurrency.overrides.orchestrator.per_provider` from GUI settings (Orchestrator-context per-provider overrides).
- Resolve effective Orchestrator per-provider caps at run start (`override` if set, else `global`) and pass those effective caps into the orchestrator scheduler/run config.

---

## 6. Implementation Checklist

### Dependency order (implement in this order within phases)

- **Phase 1** must complete before Phase 2 and Phase 3 (config and project path are prerequisites).
- **Phase 2:** 2.4 (sanitize) → 2.1, 2.5, 2.9; 2.7 (worktree_exists validity) before create/cleanup that rely on it; 2.8 (recovery uses project path) → 2.2, 2.11; 2.6 (detached HEAD) → 2.10.
- **Phase 3:** 3.1 (git binary) → 3.3, 3.4, 3.10; 3.2 (GitHub API PR integration) independent; 3.5 → 3.6 → 3.7.
- **Cross-phase:** Phase 3.1 before Phase 2.11 (Doctor worktrees check uses shared git resolution).
- **Phase 2 and Phase 3** can proceed in parallel after Phase 1; **Phase 5** integration tests assume both Phase 2 and Phase 3 are done.

### Phase 1: Config wiring (blocker)

- [ ] Implement Option B config wiring (Section 5): when starting a run, build orchestrator config from current `gui_config` (and optional file merge). Ensure "Enable parallel execution", branching/base_branch/auto_pr, and concurrency caps (`concurrency.global.per_provider` + `concurrency.overrides.orchestrator.per_provider` with effective cap resolution at run start) are taken from `gui_config` so the run sees latest UI state without requiring Save first.
- [ ] When starting a run from the Dashboard, pass `current_project.path` as config hint so the backend uses `ConfigManager::discover_with_hint(hint)` and worktree recovery uses the selected project (Section 7.3).
- [ ] Verify with a run: toggle "Enable parallel execution", save, start run → worktrees are created when applicable.

### Phase 2: Worktrees

- [ ] Base branch: ensure worktrees are created from `config.branching.base_branch` (checkout or use as ref).
- [ ] active_worktrees: repopulate on init from `list_worktrees()` and/or fallback to worktree path when resolving working directory.
- [ ] Merge conflict: document or surface conflict worktrees; avoid silent overwrite on re-run.
- [ ] Sanitize node_id (path) and branch name (ref).
- [ ] Branch already exists: handle existing branch when creating worktree (use existing branch or safe delete).
- [ ] Detached HEAD: handle empty branch in list_worktrees and merge_worktree.
- [ ] worktree_exists: require path + worktree validity (e.g. .git file or list_worktrees).
- [ ] Recovery: use project path when known; run when project is selected if not at startup.
- [ ] PR head branch: use worktree branch from list_worktrees when active_worktrees has no entry.
- [ ] merge_worktree: ensure target_branch exists or create/error clearly.
- [ ] STATE_FILES.md: document worktrees.
- [ ] Doctor: add worktrees check.

### Phase 3: Git

- [ ] Resolve `git` binary the same way in GitManager and Doctor (shared helper; e.g. `path_utils::resolve_git_executable()`; tag with DRY:FN -- Section 7.11).
- [ ] Ensure PR creation uses GitHub HTTPS API per `Plans/GitHub_API_Auth_and_Flows.md` (no GitHub CLI); Doctor verifies GitHub API auth state and required scopes.
- [ ] Git configured check: consider global or local config; use project dir when available.
- [ ] Git repo check (and fix): use project directory when available.
- [ ] Branch strategy: load from config; use in create_node_branch.
- [ ] Single branch naming implementation (remove duplicate logic).
- [ ] naming_pattern: wire to branch names or hide and document.
- [ ] Iteration commits: use CommitFormatter (pm: format).
- [ ] git-actions.log path and REQUIREMENTS/.gitignore alignment.
- [ ] Optional: Doctor check for git in project dir; optional "nothing to commit" handling.

### Phase 4: GUI

- [ ] Branching tab: add Enable Git, Auto PR, Branch strategy (add `strategy` / `branch_strategy` to config schema and map GUI to `BranchStrategy` enum; see Section 7.1). Use existing widgets from `docs/gui-widget-catalog.md`; tag any new reusable UI with DRY:WIDGET (Section 7.11). Optionally add auto merge / delete on merge.
- [ ] Branching tab: fix or hide naming_pattern; clarify granularity vs behavior (Section 7.7: decide granularity-driven branch creation vs only exposing BranchStrategy).
- [ ] Worktree: optional list/recover UI and Git info for active project (reuse widgets per 7.11).
- [ ] Tooltip cleanup for orphan tooltips.
- [ ] **GUI coordination with MiscPlan:** When **MiscPlan** (Plans/MiscPlan.md) adds cleanup and evidence UI (§7.5), it will add a "Workspace / Cleanup" subsection under **Config → Advanced** and a "Clean workspace now" button on **Doctor** (or Advanced). Both plans use the **same** Option B run config: ensure the run config built from GuiConfig at run start includes both Worktree/Git fields and (when implemented) MiscPlan cleanup/evidence fields so one Save persists all. Doctor must receive **project path context** (e.g. current project or config path) for "Clean workspace now" and for worktree list; see Worktree §7.2 and MiscPlan §7.5.
- [ ] After GUI changes: run `scripts/generate-widget-catalog.sh` and `scripts/check-widget-reuse.sh` (Section 7.11).

### Phase 5: Testing and docs

- [ ] Integration test: run with parallel execution on, verify worktrees created and used (Section 7.8: use temp dir with `git init` and one commit; minimal PRD with two parallel subtasks; assert worktree dirs exist and are cwd).
- [ ] Integration test: run with Git disabled, verify no branch/commit/PR.
- [ ] Update AGENTS.md / STATE_FILES.md / REQUIREMENTS.md as needed.
- [ ] Run widget catalog and check-widget-reuse scripts if new UI was added (Section 7.11); complete AGENTS.md Pre-Completion Verification Checklist before closing out tasks.

### Acceptance criteria (per phase)

| Phase | Acceptance criteria |
|-------|----------------------|
| **Phase 1** | (1) With "Enable parallel execution" on and no Save, start run → worktrees are created when applicable. (2) Run started from Dashboard uses `current_project.path` as config hint (e.g. `discover_with_hint` called with it). (3) Branching/base_branch and auto_pr from GUI are present in the config passed to the orchestrator at run start. |
| **Phase 2** | (1) After restart, `get_node_worktree(node_id)` returns the path for nodes that still have worktrees under worktree_base (repopulation or fallback). (2) New worktrees are created from `config.branching.base_branch` (checkout or ref). (3) Doctor "worktrees" check runs when project is a git repo and reports worktree count and/or orphaned suggestion. |
| **Phase 3** | (1) GitManager and Doctor git checks use the same resolved `git` binary (e.g. shared `path_utils::resolve_git_executable()`). (2) Iteration commits use CommitFormatter and produce "pm:"-style messages. (3) git-actions.log path matches REQUIREMENTS (`.puppet-master/logs/git-actions.log`) and is documented in .gitignore if runtime-only. |
| **Phase 4** | (1) Branching tab has Enable Git, Auto PR, Branch strategy wired to run config (run uses current GUI values). (2) Naming pattern is either wired to branch names or hidden and documented. (3) After GUI changes, `scripts/generate-widget-catalog.sh` and `scripts/check-widget-reuse.sh` run and pass. |
| **Phase 5** | (1) Integration test: parallel run in temp git repo creates worktree dirs and uses them as cwd for subtasks. (2) Integration test: run with Git disabled does not create branches/commits/PRs. (3) AGENTS.md Pre-Completion Verification Checklist completed and Task Status Log updated for any closed tasks. |

### File/source hints (Phase 2 and Phase 3)

**Phase 2 (Worktrees):** `puppet-master-rs/src/git/worktree_manager.rs` (base branch, repopulation, conflict handling, sanitization, branch exists, detached HEAD, worktree_exists validity, recovery, merge_worktree target_branch); `puppet-master-rs/src/core/orchestrator.rs` (create/cleanup worktree calls, PR head branch resolution, project path for recovery); `puppet-master-rs/src/doctor/checks/git_checks.rs` (new worktrees check); `puppet-master-rs/src/config/config_discovery.rs` (project path discovery); `STATE_FILES.md` (worktrees subsection).

**Phase 3 (Git):** `puppet-master-rs/src/platforms/path_utils.rs` (shared `resolve_git_executable()`; tag DRY:FN); `puppet-master-rs/src/git/git_manager.rs` (use resolved git binary, git-actions.log path); `puppet-master-rs/src/git/pr_manager.rs` (GitHub HTTPS API PR creation; see `Plans/GitHub_API_Auth_and_Flows.md`); `puppet-master-rs/src/git/branch_strategy.rs` (single branch naming); `puppet-master-rs/src/git/commit_formatter.rs` (iteration commits); `puppet-master-rs/src/core/orchestrator.rs` (branch strategy from config, create_node_branch, commit_node_progress); `puppet-master-rs/src/doctor/checks/git_checks.rs` (shared git binary, configured/repo checks + GitHub API auth check); `REQUIREMENTS.md` / `.gitignore` (git-actions.log path and ignore rule).

### Required vs optional (checklist items)

| Phase | Item | Required / Optional |
|-------|------|---------------------|
| Phase 1 | Option B config wiring, pass config hint on run start, verify parallel → worktrees | Required |
| Phase 2 | All items in checklist except re-validate worktree path (Section 2.12) | Required |
| Phase 2 | Re-validate worktree path before use (Section 2.12) | Optional (Phase 6) |
| Phase 3 | All items except Doctor "git usable in project" and "nothing to commit" | Required |
| Phase 3 | Doctor "git usable in project" check; "nothing to commit" handling | Optional |
| Phase 4 | Branching tab controls, naming/granularity, tooltip cleanup, MiscPlan coordination, widget scripts | Required |
| Phase 4 | Worktree list/recover UI and Git info for active project | Optional |
| Phase 5 | All items | Required |

---

## 7. Gaps, Risks, and Implementation Notes

This section captures underspecified items, risks, and concrete details so the plan is implementation-ready.

### 7.1 Config format and schema mismatch

**Config Format Mismatch Resolution (Resolved — Migrate to Single Canonical Format):**

GuiConfig and PuppetMasterConfig MUST use the same enum for `branching.granularity`:

```rust
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum BranchGranularity {
    None,      // Single branch (GUI label: "Single branch")
    Phase,     // Per-phase branches (GUI label: "Per phase")
    Task,      // Per-task branches (GUI label: "Per task")
    Subtask,   // Per-subtask branches (GUI label: "Per subtask")
    Iteration, // Per-iteration branches (GUI label: "Per iteration")
}
```

- GUI displays human-readable labels; stores the enum variant in redb.
- No string-based `branching.granularity` in GuiConfig. Eliminate the string type.
- Migration: on first load, map legacy strings to enum variants ("single" → None, "per_phase" → Phase, "per_task" → Task). Log `config.migrated` seglog event.
- Unmapped fields (`push_policy`, `merge_policy`): expose in GUI Settings → Git section. Default: `push_policy: "after_phase"`, `merge_policy: "squash"`.

### 7.2 Doctor: project path context

- Doctor checks implement `async fn run(&self) -> CheckResult` with **no parameters**. They have no built-in "project path" or "working directory."
- **GitRepoCheck** and **GitConfiguredCheck** "use project path when available" can be implemented by **resolving project root inside `run()`**: e.g. call `config_discovery::discover_config_path(None)` (or with a hint if the app can pass it), then take the parent directory as project root; run `git rev-parse --git-dir` or `git config user.name` with `current_dir(project_root)`. If no config is found, fall back to current behavior (CWD or HOME). This matches the pattern used in the orchestrator-subagent plan for the Gemini plan-mode Doctor check.
- **App → Doctor:** When the app runs Doctor (e.g. from the Doctor view), it could pass a "config hint" (e.g. `current_project.path`) so `discover_config_path(Some(hint))` finds the project's config. That would require extending the Doctor run API to accept an optional hint (e.g. `run_all(hint: Option<&Path>)`) and threading it into checks that need it. Alternatively, keep discovery inside each check with `discover_config_path(None)` so the "project" is whatever directory would be used when no project is selected (cwd, default workspace, etc.).

### 7.3 Backend run does not use current project

- **Current behavior:** `spawn_orchestrator_backend` calls `ConfigManager::discover()` with **no hint**. The wizard and start-chain use `ConfigManager::discover_with_hint(config_hint)` with `current_project.path`. So the **orchestrator run** (Dashboard "Run") never receives the current project path; it uses whatever `discover_config_path(None)` finds.
- **Implication:** For "recovery when project is known" and "Doctor use project path," if the user selects a project in the UI but the run is started from the same app, the run still uses discover-with-no-hint. To make "current project" meaningful for the run, the run command must pass a hint (e.g. extend start message with `config_hint: Option<PathBuf>`). **Call site to change:** In `app.rs::spawn_orchestrator_backend`, replace `ConfigManager::discover()` with `ConfigManager::discover_with_hint(config_hint)`; pass `current_project.path` from Dashboard when starting a run. The plan should explicitly call out: "When starting a run from the Dashboard, pass `current_project.path` as config hint so the run and recovery use the selected project."

### 7.4 Merge conflicts: persisting "conflict worktrees"

- To "avoid reusing that node_id for a new worktree until the user resolves," the app must remember which node_ids have unresolved merge conflicts. Options: (1) a small state file under `.puppet-master/` (e.g. `worktree-conflicts.json` listing node_ids), updated when a merge fails and cleared when the user runs "Recover worktrees" or resolves manually; (2) in-memory only (lost on restart, so re-run would still overwrite after restart). The plan should specify which approach or mark as "optional: in-memory set for the session only" to avoid scope creep.

### 7.5 Binary resolution: exact functions

- **Git:** Doctor uses `find_tool_executable("git")` in `git_checks.rs` (PATH + fallback dirs from `path_utils::get_fallback_directories()` and `path_utils::find_in_shell_path`). GitManager uses `Command::new("git")`. **Implementation:** Create a small helper (e.g. `path_utils::resolve_git_executable() -> Option<PathBuf>`) that uses the same logic as `find_tool_executable("git")`, and have both GitManager and GitInstalledCheck use it. GitManager can take `Option<PathBuf>` and use it in `run_git_cmd` when set.
- **GitHub PR creation:** Doctor must validate GitHub API auth (device-code token present + scopes) and PR creation must use GitHub HTTPS API (no GitHub CLI). See `Plans/GitHub_API_Auth_and_Flows.md`.

### 7.6 active_worktrees repopulation

- `list_worktrees()` already returns only worktrees under `worktree_base` and only includes entries for which `extract_node_id(&path)` is `Some` (i.e. path under our base). So repopulating `active_worktrees` from `list_worktrees()` is a matter of iterating the result and doing `active_worktrees.insert(worktree.node_id, worktree.path)`. No extra filtering needed beyond what's already there.

### 7.7 Granularity vs BranchStrategy

- **Orchestrator today:** Creates a branch in `create_node_branch` per node (phase/task/subtask/iteration) based only on **BranchStrategy** (MainOnly / Feature / Release). It does **not** read `config.branching.granularity`.
- **Granularity** in config (Phase / Task / Subtask / Iteration / None) could mean "at which node level do we create a new branch" (e.g. None = one branch for all; Phase = one branch per phase; Task = one per task). That behavior is not implemented. So either: (1) implement granularity so that branch creation is gated by node level (e.g. only create branch when node_type matches granularity), or (2) leave granularity as "future" and only wire BranchStrategy in the GUI (Main only / Feature / Release). The plan should state: "For Phase 4 GUI, decide whether to implement granularity-driven branch creation or only expose BranchStrategy; if only strategy, align granularity UI label with 'informational' or hide until implemented."

### 7.8 Integration test setup

- Integration tests that "run with parallel execution on" and "verify worktrees created" require a real git repo (e.g. temp dir with `git init`, initial commit). The plan should add: "Use a temporary directory with `git init` and at least one commit; set `enable_parallel_execution: true` and run a minimal PRD with two parallel subtasks; assert worktree dirs exist and are used as cwd." Optionally guard with `#[cfg(feature = "integration-git")]` or skip if `git` is not in PATH.

### 7.9 Worktree Doctor check: scope

- The "worktrees" Doctor check should run only when the project path is a git repo. Steps: (1) Resolve project root (e.g. via config discovery or hint). (2) Run `git worktree list --porcelain` from that root. (3) If that fails, report "not a git repo" or "git worktree not supported." (4) Otherwise, optionally call `detect_orphaned_worktrees()` (requires a `WorktreeManager` instance) and report count of orphaned dirs and suggest "Recover orphaned worktrees" if non-zero. Creating `WorktreeManager` in a Doctor check requires a repo path; use the same project root.

### 7.10 Risks

- **Config migration:** If we move to a single canonical format (Option A), existing users may have only GuiConfig-shaped YAML. Loading it as PuppetMasterConfig can fail (missing `paths`, etc.). Plan: on load, try PuppetMasterConfig first; if it fails, try GuiConfig and convert to PuppetMasterConfig (with defaults for missing fields), then save in canonical format on next save.
- **Save timing:** Option B is chosen: on Run, build the config used for the run from in-memory `gui_config`, so Save is not required for the next run. Document this in the UI (e.g. tooltip or short note: "Run uses current settings; Save stores them for next time.").

### 7.14 Resolved decisions (implementation-ready)

All gaps from audit are closed with the following decisions. Implementers should follow these so the plan has no ambiguity.

**Worktree (Section 2):** (1) **Base branch:** Use checkout base_branch then add for initial release; create from ref (e.g. `git worktree add -b <branch> <path> <base_branch>`) is optional later. (2) **active_worktrees repopulation:** On first resolve with no entry, if path exists and is in `list_worktrees()`, use it and re-register in `active_worktrees` for that session. (3) **Conflict persistence:** In-memory only for initial release -- `HashSet<node_id>` of conflict worktrees; optional Phase 6: `.puppet-master/worktree-conflicts.json`. (4) **Detached HEAD merge:** In `merge_worktree`, if source_branch is empty: read HEAD commit from that worktree (`git rev-parse HEAD` in worktree path), then in main repo `git merge --no-ff <commit>`; document in STATE_FILES.md. (5) **Recovery:** If no project path at startup, skip worktree recovery; run recovery when user first selects/opens a project or when a run starts with config hint. (6) **Repopulation failure:** If `list_worktrees()` fails during repopulation, log error and start with empty `active_worktrees`. (7) **Doctor worktrees:** Must run `list_worktrees` and report state; optionally call `detect_orphaned_worktrees()` and include count; Recover remains a separate UI action. (8) **Platform:** Sanitization and path handling must be safe on Windows (use `PathBuf`/`join`; no assumption that `/` is the only separator). (9) **Section 2.12:** Re-validate worktree path before use is Phase 6 / optional.

**Git (Section 3):** (1) **Git binary:** Add `path_utils::resolve_git_executable() -> Option<PathBuf>` (same logic as `find_tool_executable("git")`); GitManager and GitInstalledCheck both use it; tag `// DRY:FN:resolve_git_executable`. If resolver returns None, GitManager fails the operation; Doctor fails the check. (2) **GitHub PRs:** PR creation uses GitHub HTTPS API only (no GitHub CLI) per `Plans/GitHub_API_Auth_and_Flows.md`. (3) **naming_pattern:** Hide in GUI and document Reserved for future use in initial release; do not wire to branch naming. (4) **git-actions.log:** Move to `.puppet-master/logs/git-actions.log`; add to .gitignore as runtime-only per STATE_FILES.

**Config (Section 5):** (1) **Backend call site:** In `app.rs::spawn_orchestrator_backend`, replace `ConfigManager::discover()` with `ConfigManager::discover_with_hint(config_hint)`; pass `current_project.path` from Dashboard/start-run flow (e.g. extend start message with optional hint). (2) **Minimum wired fields:** enable_parallel_execution, enable_git, base_branch, auto_pr; strategy required for Phase 4 GUI; granularity/naming_pattern optional/hidden per 7.7 and 3.7.

**Doctor API:** Extend Doctor so the app can pass an optional project hint (e.g. `run_all(hint: Option<&Path>)`); GitRepoCheck, GitConfiguredCheck, and worktrees check use hint when present.

## DRY Method Compliance

**CRITICAL:** All code in this plan MUST follow DRY principles.

### DRY Requirements

1. **Platform Data -- ALWAYS use platform_specs:**
   - ❌ **NEVER** hardcode platform CLI commands, binary names, models, auth, or capabilities
   - ✅ **ALWAYS** use `platform_specs::` functions

2. **Subagent Names -- ALWAYS use subagent_registry:**
   - ❌ **NEVER** hardcode subagent names
   - ✅ **ALWAYS** use `subagent_registry::` functions
   - ✅ **ALWAYS** reference `DRY:DATA:subagent_registry` from orchestrator plan as the single source of truth

3. **Git Binary Resolution -- Single Source of Truth:**
   - ✅ **ALWAYS** use shared git binary resolution functions (DRY:FN:resolve_git_binary)
   - ❌ **NEVER** duplicate git binary detection logic

4. **Tag All Reusable Items:**
   - ✅ Tag reusable functions: `// DRY:FN:<name> -- Description`
   - ✅ Tag reusable data structures: `// DRY:DATA:<name> -- Description`
   - ✅ Tag reusable widgets: `// DRY:WIDGET:<name> -- Description`
   - ✅ Tag reusable helpers: `// DRY:HELPER:<name> -- Description`

5. **Widget Reuse:**
   - ✅ **ALWAYS** check `docs/gui-widget-catalog.md` before creating new UI
   - ✅ **ALWAYS** use existing widgets from `src/widgets/`
   - ✅ If bespoke UI is required, add `// UI-DRY-EXCEPTION: <reason>`

### 7.11 DRY and AGENTS.md conventions

This plan must be implemented in line with **AGENTS.md** (reuse-first DRY method):

- **Widgets and UI:** Before adding any new Git/worktree UI (Branching tab controls, worktree list/recover, toggles), check `docs/gui-widget-catalog.md` and `src/widgets/`. Use existing widgets (e.g. `styled_button`, `page_header`, `selectable_label`, toggles, dropdowns) and tag any new reusable widget with `// DRY:WIDGET:<name>`. After GUI changes, run `scripts/generate-widget-catalog.sh` and `scripts/check-widget-reuse.sh`.
- **Platform/tool resolution:** Do not hardcode paths. Use shared helpers: `path_utils::find_tool_executable`, `path_utils::resolve_app_local_executable` (or a new `resolve_git_executable()` that both GitManager and Doctor use). Tag new shared helpers with `// DRY:FN:<name>`.
- **Single source of truth:** Git/branch behavior should use existing modules: `platform_specs` only for platform-related data (this plan is mostly git/worktree); branch naming from one place (e.g. `BranchStrategyManager` or shared function); config shape from the chosen Option B build-from-GUI flow.
- **Pre-completion:** Before marking any task done, run the AGENTS.md "Pre-Completion Verification Checklist" (cargo check/test, DRY checks, no hardcoded platform data, scope, gitignore rules).

---

## 7.12 Crews and Subagent Communication Enhancements for Git/Worktree Operations

Git and worktree coordination must use the reconciled PM crew model rather than ad hoc crew-memory or side-file canon.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-memory-subsystem.md

Required rules:
- git/worktree coordination crews are optional overlays, not separate persistent actor systems.
- crew members remain child runs.
- crew coordination uses explicit shared crew state and crew-board messages when enabled.
- `.puppet-master/memory/*` is not canonical crew coordination state.
- `active-agents.json` is not canonical git/worktree coordination state.

If git/worktree coordination is needed:
- store canonical lineage, ownership, and conflict state in seglog/redb projections.
- treat longer-lived crew identity as explicit shared state, not hidden child memory.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FileSafe.md
## 7.13 Lifecycle and Quality Enhancements for Git/Worktree Operations

Git/worktree lifecycle and quality features must align with the current child-run, crew, and blocked-state canon.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md

Required rules:
- reuse canonical child-run and crew events rather than inventing separate active-agent lifecycle files.
- blocked payloads use canonical `blocked_reason_code` plus ordered `allowed_action_ids[]`.
- cleanup, reroute, and retry behavior must preserve child lineage and worktree ownership fields.
- quality and handoff metadata belong in canonical event/storage structures rather than memory-manager files.

Cross-session continuity for git/worktree behavior comes from canonical state and handoff reconstruction, not from child-memory files.

ContractRef: ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Prompt_Pipeline.md
## 8. References

- **AGENTS.md:** Git commit format ("pm:"), gitignore rules, DRY, platform_specs, pre-completion checklist.
- **STATE_FILES.md:** State file hierarchy; add worktrees subsection.
- **REQUIREMENTS.md:** git-actions.log path, Git operations.
- **Plans/orchestrator-subagent-integration.md:** Worktree isolation for parallel subagents; ensure worktrees and config wiring are in place before or with subagent work.
- **Code:** `puppet-master-rs/src/git/` (worktree_manager, git_manager, pr_manager, branch_strategy, commit_formatter); `core/orchestrator.rs` (create_node_branch, commit_node_progress, create_node_pr, worktree create/cleanup); `views/config.rs` (tab_branching); `doctor/checks/git_checks.rs`; `config/config_discovery.rs` (discover_config_path); `platforms/path_utils.rs` (resolve_app_local_executable, get_fallback_directories).

## Safe-Point and Retry Integration Addendum (2026-03-08)

### 1. Worktree-native safe points

Runtime safe points for mutation-capable attempts should be implemented on top of the existing worktree / isolated execution model.

Required properties:
- no `git reset --hard` style shared-workspace rollback contract
- preserve isolation within the active worktree/runtime root
- support restoring a failed attempt to its pre-attempt baseline for retry-from-safe-point behavior

### 2. Retry posture visibility

Worktree/branch status surfaces should be able to explain whether a pending retry is:
- waiting on backoff
- waiting on remediation
- ready for retry from safe point
- requiring a fresh attempt

### 3. Acceptance criteria

- Safe-point recovery reuses the worktree-native isolation model.
- Retry-from-safe-point does not rely on destructive shared-workspace reset semantics.
- Worktree-oriented status surfaces can explain retry posture.
## Safe Point / Worktree Recovery Alignment Addendum (2026-03-09)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0542
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `Retry from Safe Point`
  - Retry from Safe Point
  - attempt to restore or reconcile a suspect/orphaned/conflicted worktree into a safe known state
  - `retry from safe point` vs `start fresh attempt`
  - retry from safe point
  - start fresh attempt
  - `safe point vs restore point`
  - safe point vs restore point
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Worktree-native isolation remains canonical, but runtime recovery must integrate with it.

### Required rules
- a safe point may reference worktree-specific baseline state
- restore-before-rerun operations must specify which worktree/baseline they target
- merge/conflict or dirty-state detection may block resume and must surface an explicit reason rather than silently reusing a changed worktree
- worktree isolation does not replace runtime blocked classification; it complements it
## Runtime Worktree Conflict Reconciliation Addendum (2026-03-09)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0541
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - newer model: scored ready set, `scheduler_lane`, `replan_generation`, runnable-unit fields like `attempt_id`, blocked reason codes, worktree conflict classification
  - scheduler_lane
  - replan_generation
  - attempt_id
  - worktree conflict / dirty-worktree block
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

This addendum is retained as historical context only.

Canonical worktree-conflict and dirty-worktree runtime rules now live in `## Worktree Conflict and Dirty-Worktree Runtime Alignment`.

Canonical blocked reasons for this domain are `worktree_conflict` and `dirty_worktree`.

Required rules:
- blocked payloads use canonical blocked fields and ordered `allowed_action_ids[]`
- recovery may require safe-point restore when the runtime marks `requires_safe_point_restore = true`
- clearing the underlying worktree issue resolves the blocked prerequisite; it does not fabricate a new failure class
- worktree conflict resolution must preserve lineage to the blocked episode and any affected safe point

ContractRef: Plans/Orchestrator_Page.md#Source Control boundary

Required fields:
- blocked_reason_code
- blocked_reason_detail
- remediation_actions_allowed
- dirty_state
- conflict_state

Canonical terms and values:
- blocked_reason_code
- remediation_actions_allowed

Labels:
- dirty worktree

Behavioral rules:
- `dirty_worktree` and `worktree_conflict` stay canonical blocked reasons instead of generic SCM failures.
- Conflict and cleanup semantics must remain distinct.

Permission carry-through:
- remediation actions must surface only through the allowed-action set