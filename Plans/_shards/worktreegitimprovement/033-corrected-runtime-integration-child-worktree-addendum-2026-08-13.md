# Shard 033: Corrected Runtime Integration Child-Worktree Addendum - 2026-08-13

Source: `Plans/WorktreeGitImprovement.md`

Source lines: L5490-L5709

Source SHA256: `a91952094251ba92ee185e07d897f219d7f8a47942834c70e88d45e77fe6a5fb`

---

## Corrected Runtime Integration Child-Worktree Addendum - 2026-08-13

The following units compile the corrected runtime packet's Child worktrees section into the Source Control owner. They define contracts only and create no WorkNodes, NodeSeeds, executable queues, runtime resources, implementation files, or governance-seal artifacts.

### W-080 - Child Worktree Ordered Custody And Isolation

```yaml
plan_unit_id: W-080
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: >-
  Child worktrees follow an ordered fail-closed lifecycle: capture an immutable source baseline; durably record typed
  ownership and the intended worktree identity before any materialization; create and verify an isolated branch and
  workspace at that baseline; attach only that verified workspace to the child; then run the child. A child may mutate
  only its own worktree/index/branch within its granted write mode. Shared Git administration stays serialized through
  Source Control, and the child cannot mutate parent or sibling worktrees, refs, indexes, ownership, leases, results,
  safe points, or PM runtime metadata.
gui_related: false
gui_classification_reason: This is backend Source Control custody, materialization ordering, and execution isolation.
depends_on: [SIR-002, SIR-007, W-013, W-015, W-017, W-072]
unblocks: []
acceptance_criteria:
  - Baseline capture records full immutable OID, branch/detached state, Git/index/dirty/conflict observations, FileSafe digest, and compare target without mutation.
  - Durable ownership and lease identity exist before branch, directory, worktree, or Git administrative materialization.
  - Materialization and dispatch bind the exact Home Server, Execution Host, Execution Environment, Source Location, topology generation, and capability snapshot required by Shared Integration Runtime.
  - Child dispatch is refused until the isolated worktree identity and baseline postconditions verify.
  - Parent and sibling worktree, Git metadata, lease, result, safe-point, and runtime-metadata mutations are denied.
  - No WorkNodes, NodeSeeds, executable queues, runtime resources, implementation files, or governance-seal artifacts are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future crash-at-every-boundary ownership-before-materialization and sibling-isolation fixtures.
risk_class: child_worktree_custody_or_sibling_contamination
reasoning_tier: high
context_scope: child_worktree_ordered_custody
implementation_surfaces: [Plans/WorktreeGitImprovement.md, future Source Control worktree manager]
node_compile_hint: {mode: child_worktree_ordered_custody, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/04_LSP_DAP_EVAL_MCP_BROWSER_AND_WORKTREES.md#Child-worktrees
preserved_exact_tokens: ["capture baseline", "record ownership before materialization", "create isolated workspace", "prevent sibling metadata mutation"]
negative_constraints:
  - Never materialize a child worktree before durable ownership is recorded.
  - Never substitute the main worktree or a sibling allocation after an isolation failure.
  - Never grant child shells general write authority over shared Git administration or PM ownership metadata.
owner_hints: [Plans/WorktreeGitImprovement.md, Plans/Shared_Integration_Runtime.md, Plans/orchestrator-subagent-integration.md, Plans/Executor_Protocol.md]
```

### W-081 - Child Result Custody And Approved Integration

```yaml
plan_unit_id: W-081
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: >-
  Every child terminal or interrupted disposition captures a durable content-addressed patch or verified-empty result,
  branch and full result OID, changed-file summary, and FileSafe digest outside the disposable worktree before cleanup
  eligibility. Non-thread child integration uses cmd.git.worktree.merge only after exact-result approval, fresh target
  observation, permission admission, and FileSafe protection. Failed integration remains
  integration_failed_preserved: patch/result custody survives independently, and referenced branch/worktree state stays
  blocked_preserved until verified successor custody or explicit recovery permits release.
gui_related: false
gui_classification_reason: This is backend result preservation, integration admission, and failure recovery behavior.
depends_on: [W-009, W-019, W-022, W-080]
unblocks: []
acceptance_criteria:
  - Completion, failure, cancellation, timeout, and interruption all produce a durable result or verified-empty receipt before cleanup eligibility.
  - Integration occurs only after approval bound to exact child result and target identities.
  - Failed integration preserves the patch/result outside the worktree and records exact reason/evidence without claiming success.
  - Retry uses a new idempotent integration attempt with fresh target, permission, approval, and FileSafe observations.
  - No WorkNodes, NodeSeeds, executable queues, runtime resources, implementation files, or governance-seal artifacts are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future integration conflict, stale-target, permission-drift, crash, and patch-survival fixtures.
risk_class: child_result_loss_or_unapproved_integration
reasoning_tier: high
context_scope: child_worktree_result_integration
implementation_surfaces: [Plans/WorktreeGitImprovement.md, future Source Control integration coordinator]
node_compile_hint: {mode: child_result_custody_and_integration, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/04_LSP_DAP_EVAL_MCP_BROWSER_AND_WORKTREES.md#Child-worktrees
preserved_exact_tokens: ["capture patch/branch/result", "integrate if approved", "preserve patch after failed integration", "cmd.git.worktree.merge", "integration_failed_preserved"]
negative_constraints:
  - Never treat approval as proof of successful integration.
  - Never clean up the sole surviving child result or reset away a failed integration.
  - Do not use cmd.chat.worktree.merge unless a real Assistant thread binding exists.
owner_hints: [Plans/WorktreeGitImprovement.md, Plans/FileSafe.md, Plans/Permissions_System.md, Plans/UI_Command_Catalog.md]
```

### W-082 - Child Worktree Typed Lease Lifecycle

```yaml
plan_unit_id: W-082
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: >-
  A child-worktree lease is a typed durable resource with exact owner/runtime, repository, worktree, branch, baseline,
  topology/source, write-mode, time, policy, cleanup, result, integration, and reconciliation identity coordinated by
  the shared LeaseCoordinator. Holder, generation, epoch, topology generation, and Source Location fence every create,
  attach, renew, capture, merge, release, and cleanup. Renewal is an atomic same-holder compare-and-swap that cannot
  widen scope. Expiry blocks new dispatch/mutation and starts reconciliation; it never proves owner death or authorizes
  cleanup. Release is idempotent, fence-checked, requires terminal child and durable result/integration disposition,
  and is distinct from physical prune/remove.
gui_related: false
gui_classification_reason: This is a backend typed lease and concurrency-control contract.
depends_on: [SIR-007, W-015, W-016, W-017, W-080, W-081]
unblocks: []
acceptance_criteria:
  - Lease records include Shared Integration Runtime scope/resource/holder/mode/generation/epoch/time/policy/cleanup/terminal fields plus the Worktree-owned identity and result extension.
  - Stale holder, generation, epoch, topology generation, or Source Location cannot renew, release, overwrite results, reconcile a replacement lease, or mutate a worktree.
  - Expiry preserves work and result custody while reconciliation determines current truth.
  - Release changes ownership eligibility without deleting the branch, worktree, or result artifact.
  - No WorkNodes, NodeSeeds, executable queues, runtime resources, implementation files, or governance-seal artifacts are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future generation-CAS, renewal race, expiry-during-transaction, replayed-release, and cleanup-race fixtures.
risk_class: child_worktree_lease_aba_or_expiry_cleanup
reasoning_tier: high
context_scope: child_worktree_typed_lease
implementation_surfaces: [Plans/WorktreeGitImprovement.md, Plans/Shared_Integration_Runtime.md, future Source Control lease store]
node_compile_hint: {mode: child_worktree_typed_lease, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/04_LSP_DAP_EVAL_MCP_BROWSER_AND_WORKTREES.md#Child-worktrees
preserved_exact_tokens: ["LeaseCoordinator", "lease_id", "holder", "generation", "epoch", "TopologyGeneration", "SourceLocationId", "expires_at", "renew_by", "cmd.git.worktree.release"]
negative_constraints:
  - Never infer lease release from process exit, timestamp expiry, branch name, or path absence.
  - Never let renewal widen holder, owner, repository, worktree, branch, topology, source, resource policy, write mode, or permission scope.
  - Never equate ownership release with physical cleanup.
owner_hints: [Plans/WorktreeGitImprovement.md, Plans/Shared_Integration_Runtime.md, Plans/storage-plan.md]
```

### W-083 - Restart Reconciliation And Safe Child Cold Revival

```yaml
plan_unit_id: W-083
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: >-
  Startup reconciliation precedes child dispatch, lease renewal, integration, and cleanup, comparing durable lease and
  owner records with exact topology/source identity, Git common-dir inventory, worktree/gitdir/branch/OIDs,
  baseline/result hashes, active Git operation, FileSafe journals and holds, runtime liveness, resource admission, and
  permission visibility. Domain findings feed the shared bounded recovery outcomes rather than inventing peer terminal
  states. Persisted child cold revival is allowed only after exact durable context and workspace identity,
  non-conflicting ownership, current permissions/capabilities, and remaining budget/deadline verify. Revival advances
  the lease generation and creates a new runtime identity; expired credentials, PIDs, terminals, language servers, MCP
  sessions, streams, in-memory locks, and hidden provider state are never revived.
gui_related: false
gui_classification_reason: This is backend restart recovery and safe runtime reconstruction behavior.
depends_on: [SIR-007, SIR-011, W-008, W-052, W-064, W-082]
unblocks: []
acceptance_criteria:
  - Startup reconciliation completes or explicitly blocks before dispatch, renew, integration, or cleanup.
  - Nonterminal Source Control and FileSafe transactions resume or classify from owner journals rather than heuristics.
  - Worktree findings resolve through resumed, replayed, rolled_back, cleaned, quarantined, manual_recovery_required, or terminal_unknown_with_disclosure; absence of evidence never becomes success.
  - Cold revival creates a new generation and runtime/session identity after all safety predicates verify.
  - Unsafe or unverifiable continuation preserves patch/branch/result and starts a fresh attempt or recovery path without using the main worktree.
  - No WorkNodes, NodeSeeds, executable queues, runtime resources, implementation files, or governance-seal artifacts are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future restart fault matrix and safe/unsafe cold-revival fixtures.
risk_class: restart_reconciliation_or_stale_child_revival
reasoning_tier: high
context_scope: child_worktree_restart_revival
implementation_surfaces: [Plans/WorktreeGitImprovement.md, Plans/Shared_Integration_Runtime.md, future Source Control reconciler]
node_compile_hint: {mode: child_worktree_restart_and_cold_revival, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/04_LSP_DAP_EVAL_MCP_BROWSER_AND_WORKTREES.md#Child-worktrees
preserved_exact_tokens: ["cleanup/reconcile after restart", "persisted child cold revival", "ObservableWork", "manual_recovery_required", "terminal_unknown_with_disclosure", "new runtime identity"]
negative_constraints:
  - Never settle an interrupted transaction from path existence, PID absence, branch name, or expiry alone.
  - Never revive expired credentials, process/session identities, in-memory locks, or hidden provider state.
  - Never cold-revive into the main worktree.
owner_hints: [Plans/WorktreeGitImprovement.md, Plans/Shared_Integration_Runtime.md, Plans/orchestrator-subagent-integration.md, Plans/FileSafe.md, Plans/Permissions_System.md]
```

### W-084 - Child Worktree Command FileSafe And Permissions Boundary

```yaml
plan_unit_id: W-084
unit_type: constraint
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: >-
  Project-scope child worktree operations reuse cmd.git.worktree.create, cmd.git.worktree.merge, and
  cmd.git.worktree.release; no cmd.worktree.* peer namespace is minted. cmd.chat.worktree.* remains a thread-scoped
  wrapper only for a real Assistant thread binding. Permissions admits the exact actor/runtime, action class,
  repository/worktree/branch target, generation, and write mode. FileSafe independently owns canonical path/scope and
  filesystem mutation admission, fencing, safe points, rollback, equality, and recovery. Source Control owns Git
  identity, lease/materialization binding, administrative serialization, result capture, integration, and Git
  postconditions; neither owner's success substitutes for the other.
gui_related: false
gui_classification_reason: This defines backend command namespace and cross-owner security boundaries, not a visual surface.
depends_on: [SIR-007, W-005, W-022, W-080, W-081, W-082]
unblocks: []
acceptance_criteria:
  - Child runtime flows use registered project-scope commands and never mint cmd.worktree.* peers.
  - Chat wrappers are accepted only for operations with a real thread binding and do not bypass project-scope admission.
  - Permission evidence is exact-target and generation-bound and cannot be copied from a parent, sibling, prior generation, or wrapper.
  - A shared runtime lease, resource admission, or user-visible approval never substitutes for independent Permissions and FileSafe decisions.
  - FileSafe and Source Control each verify their owned preconditions/postconditions without substituting one check for the other.
  - No WorkNodes, NodeSeeds, executable queues, runtime resources, implementation files, or governance-seal artifacts are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future command-registry no-peer, wrapper-scope, permission-drift, and FileSafe/SCM boundary fixtures.
risk_class: child_worktree_command_or_security_boundary_drift
reasoning_tier: high
context_scope: child_worktree_command_filesafe_permissions
implementation_surfaces: [Plans/WorktreeGitImprovement.md, Plans/UI_Command_Catalog.md, Plans/FileSafe.md, Plans/Permissions_System.md]
node_compile_hint: {mode: child_worktree_command_security_boundary, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/04_LSP_DAP_EVAL_MCP_BROWSER_AND_WORKTREES.md#Child-worktrees
preserved_exact_tokens: ["cmd.git.worktree.create", "cmd.git.worktree.merge", "cmd.git.worktree.release", "cmd.chat.worktree.*", "FileSafe", "Permissions"]
negative_constraints:
  - Do not mint cmd.worktree.* commands.
  - Do not use thread wrappers for project, run, lane, package, node, attempt, or child scope without a real thread binding.
  - Do not treat Source Control verification as FileSafe approval or FileSafe approval as Git postcondition proof.
owner_hints: [Plans/WorktreeGitImprovement.md, Plans/UI_Command_Catalog.md, Plans/FileSafe.md, Plans/Permissions_System.md, Plans/Shared_Integration_Runtime.md]
```
