# Shard 021: Worktree Lane Allocation and Source Control Reconciliation

Source: `Plans/WorktreeGitImprovement.md`

Source lines: L765-L795

Source SHA256: `6864b3fa068e380201d6b5b13e4010a6019048660aecc194d1704542c8373d5c`

---

## Worktree Lane Allocation and Source Control Reconciliation

`Plans/WorktreeGitImprovement.md`, `Plans/orchestrator-subagent-integration.md`, and `Plans/Crosswalk.md` converge on `/worktree` and `/worktrees` ownership, but the worktree owner must make the allocation strategy concrete. Worktree allocation is package/lane based: Orchestrator owns the active run's lane-pool truth, while Source Control owns repo/worktree execution and inspection operations. The old run/tier/subtask, branch-per-run, subtask-per-worktree, wizard-centric, /iteration-scoped, and /seam-aware SCM assumptions are compatibility context only until they map to package-based lane pools, shared Source Control visibility, and per hosted side-effect effective-account recording.

Source Control is the primary operational surface for worktree inventory and actions, and Orchestrator consumes worktree identity, blocked state, and lineage. `dirty_worktree` and `worktree_conflict` route back to Source Control with the correct worktree in scope; historical runs preserve historical worktree references after prune `/remove`. Orchestrator records which package owns which lane pool, which lane is baseline, active, suspect `/restoring`, historical, or `/retired`, why a lane is blocked, weakly integrated, or cleanup-eligible, and which action is allowed from runtime `/governance` state. Source Control owns open, compare, diff `/history/graph`, recover, archive, prune, and remove when policy permits.

`Lane` is the primary operational object in Orchestrator, and `Worktree` remains the concrete filesystem `/Git` backing for a lane instance. A lane may preserve historical identity after the live worktree has been cleaned up, archived, or removed. Source Control can list worktrees directly, but it must also expose `/package` lane ownership and lifecycle state when known. Worktree rows therefore show owning package, owning lane, run reference when relevant, lane lifecycle state, worktree lifecycle state, and blocked `/recovery` state, treating `lane lifecycle` and `worktree lifecycle` as related but non-identical.

The tier-era low-level ownership model is no longer canonical. Examples such as `get_tier_worktree(tier_id)`, worktree paths and branches keyed by `tier_id`, recovery or `/conflict` persistence phrased in `tier_id`, future crew `/message` examples, and `tier_type` / `worker_provider` / `worker_model` / `verifier_provider` / `verifier_model` / `hitl_request_id` in base `GraphNode` and `GraphNodeUI` contracts must reconcile to lane, node, attempt, runtime-lineage, and worktree identity. Worktree coordination examples must stop carrying `tier_id` as the operational identity anchor.

Parallel execution must not confuse snapshot-based single-context concurrency with multi-lane worktree isolation. `newfeatures.md` background agent queues and snapshot-based recovery are single-context mechanisms unless they allocate isolated lanes with dedicated worktrees. The Source Control view treats `Lane` as ownership `/context` metadata for a worktree, not a replacement for worktree as the primary Source Control object.

Terms that drift together must remain separately defined: `lane` vs `worktree`, safe point vs restore point, `historical` vs `superseded`, `acknowledged` vs `dismissed` vs `resolved`, and `history` vs `ledger`. These pairs are drift-prone unless package-level worktree state is visible and navigable. Orchestrator continues to present lane state and shows worktree status in context, while Source Control remains the concrete filesystem/Git owner.

Cross-surface openings must not pollute base route identity. `Orchestrator_Page.md` / `Orchestrator_Page.md` Evidence pivots into workflow `/Docker/Kubernetes` detail through an explicit receipt `/attempt` join path. `line` / `range` belong to path `/document-open` specialization rather than the canonical base route object, and `wizard_step` is sub-selection in serialized `deep-link` detail or a narrower subtarget contract.

Historical audit anchors stay visible only as owner references for the worktree allocation defect: `cov-526`, `obl-222`, `Plans/Crosswalk.md:88-94`, `Plans/WorktreeGitImprovement.md:62-66`, `Plans/WorktreeGitImprovement.md:78-80`, `Plans/orchestrator-subagent-integration.md:28-41`, `/Crosswalk.md:88-94`, `/WorktreeGitImprovement.md:62-66`, `/WorktreeGitImprovement.md:78-80`, and `/orchestrator-subagent-integration.md:28-41`. The rewrite-aligned fix replaces tier-based branch naming with package/lane allocation, contamination, /reuse/cleanup, and /subtask-native compatibility handled as explicit lifecycle policy. Formal state vocabulary distinguishes `lane lifecycle`, `worktree lifecycle`, `worktree filesystem state`, and `runtime blocked/recovery state`.

Cross-lane reuse is not a best-effort cleanup path. A `safe-point` restore may make a suspect worktree eligible for `cross-lane` reuse only after contamination checks pass; `contamination-triggered` shrink can reduce a package's lane-pool, and flat `provider-only` limits never replace `per-package` lane ceilings. `package-based` pools are the SCM-facing source of truth, so `tier-keyed` path or registry assumptions are compatibility inputs until migrated to `lane-named` worktrees.

Source Control row ownership is explicit even when the UI stays worktree-first. Legacy `owner run/tier` or `/tier` labels are compatibility, while current rows expose owner run, `/package/lane`, `/lane`, and `/package/node-first` execution-context metadata beside `worktree` identity. `Feature Seam`, `Work Package`, `Lane`, and `Worktree` stay user-visible as an object stack, but `tier_id` must not propagate through future crew `/message` examples or `/worktree` coordination as the canonical ownership key.

Historical retry lineage can preserve exact audit labels without turning them into ownership. `Decision_Log` records may keep `agent-314` as the failed attempt and `agent-331` as the canonical successful run, while worktree state still keys recovery by lane, node, attempt, safe point, and runtime lineage.

The lane-pool model is end-to-end across Orchestrator, Source Control, recovery policy, and SCM. `package-based` lane-pool allocation unifies former per-run branches, per-subtask worktrees, branch-per-run flows, `/tier`, and `/PR` assumptions without treating those compatibility patterns as current ownership.

Action ownership remains split: Orchestrator may inspect lane state, request restore, request graph patch, request reopen `/revocation`, and open a lane in Source Control; Source Control owns open worktree, compare against baseline `/target`, inspect changed files and `/history/graph`, recover orphaned worktree, archive, prune `/remove`, and cleanup current `/all` eligible worktrees.

Cleanup and route identity stay explicit. Bulk `/archive/remove` operations are preview-heavy, not one-button destructive `/worktree` actions; `Orchestrator_Page.md` / `Orchestrator_Page` retry posture remains richer than a fake `one-button` retry. `shell-tab` and `panel-subview` identities stay outside the base route contract.

Allocation strategy is `/owned` by package/lane policy for scale `/manageability`: it may allocate per-node only when the effective scope requires it, while `package-based` worktrees remain the default scale posture.
