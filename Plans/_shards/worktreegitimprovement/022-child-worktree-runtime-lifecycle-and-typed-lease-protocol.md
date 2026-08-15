# Shard 022: Child Worktree Runtime Lifecycle and Typed Lease Protocol

Source: `Plans/WorktreeGitImprovement.md`

Source lines: L852-L914

Source SHA256: `a91952094251ba92ee185e07d897f219d7f8a47942834c70e88d45e77fe6a5fb`

---

## Child Worktree Runtime Lifecycle and Typed Lease Protocol

This section is the canonical Source Control owner contract for child worktree custody. `Plans/Shared_Integration_Runtime.md` owns the shared runtime resource/owner/lease/reconciliation primitives consumed here; Orchestrator and child-runtime owners decide whether a child is eligible to run, while this document owns repository baseline capture, worktree materialization, Git isolation, result preservation, approved integration, and worktree release. A child worktree is an isolated execution workspace, not an informal directory and not a file-lease substitute.

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/UI_Command_Catalog.md

### Ordered ownership-before-materialization lifecycle

The required lifecycle is ordered and fail-closed:

1. **Capture baseline:** resolve `project_id` and `repo_id`, observe the source worktree without mutation, and durably record its full immutable `HEAD` OID, branch/detached state, index/dirty/conflict state, active Git operation, FileSafe state digest, and intended base/compare target. A moving ref, abbreviated OID, UI-selected path, or current process directory is not a baseline.
2. **Record ownership:** before creating a directory, branch, worktree, or Git administrative entry, durably issue the typed lease and bind the intended `worktree_id`, child/run/node/attempt/runtime identity, repository, branch identity, baseline receipt, mutation scope, and cleanup authority. Failure to persist this reservation leaves no materialized child workspace.
3. **Create isolated workspace:** only the current reservation generation may invoke `cmd.git.worktree.create`. Source Control creates a PM-managed branch/worktree from the exact baseline OID, validates canonical path containment and repository identity, and verifies that the new `HEAD`, index, and tracked tree match the requested baseline before handing the path to the child. Partial or ambiguous creation becomes reconciliation-required custody and is never recursively deleted as if creation had not happened.
4. **Run child:** dispatch starts only after the lease is active and the materialized identity has been attached to the child execution context. The child receives the isolated worktree path and its own branch/index scope; it receives no authority over the source worktree, a sibling worktree, or another child lease.
5. **Capture result:** on child completion, failure, cancellation, timeout, or interruption, capture the resulting full `HEAD` OID, branch, changed-file summary, FileSafe digest, commit/result refs, and a content-addressed patch or explicit verified-empty result. Result custody must be durable outside the disposable worktree before integration or cleanup eligibility is evaluated.
6. **Integrate only if approved:** the registered project-scope `cmd.git.worktree.merge` is the integration mutation for non-thread children. It requires the exact result and baseline identities, fresh target observation, applicable permission/approval evidence, and FileSafe pre-mutation protection. The `cmd.chat.worktree.merge` wrapper is used only when a real Assistant thread binding exists; no child/runtime flow sets `thread_id=null` or fabricates a thread to obtain project-scope behavior.
7. **Release and reconcile:** `cmd.git.worktree.release` records ownership release only after result custody and integration disposition are durable and no safe point, blocked episode, legal hold, editor/terminal session, or recovery lineage still requires the worktree. Physical cleanup is a later policy-controlled action. Restart reconciliation resumes from durable records rather than inferring success from path absence or process exit.

No step may be reordered so materialization precedes ownership, cleanup precedes result custody, or integration precedes approval. A denied or failed step preserves all earlier durable evidence and returns a typed blocked/reconciliation posture; it does not silently substitute the main worktree or another child's allocation.

### Sibling metadata isolation and Git administrative boundary

- A child may modify files, index state, `HEAD`, and the dedicated branch of its own verified worktree only within its granted write mode. It MUST NOT update a sibling branch, sibling index, sibling worktree administrative entry, ownership record, lease, result record, safe point, or PM runtime metadata.
- Shared Git common-dir administration, including worktree add/remove/repair/prune, branch allocation or deletion, and integration into another branch, is performed only by the serialized Source Control owner. Child tools and provider shells do not receive a general capability to edit `.git`, linked-worktree gitdirs, shared refs, or `.puppet-master` ownership/lease storage directly.
- Branch names and filesystem paths are allocated collision-free from durable identities. A name/path collision is a reconciliation blocker, never evidence that the existing materialization belongs to the requesting child.
- File watchers, diagnostics, terminals, editors, providers, and MCP processes are rooted in the child's canonical worktree path. Events are tagged with `repo_id`, `worktree_id`, and lease generation; events from a different generation or sibling identity are stale and cannot mutate projections or trigger cleanup.
- Patch capture reads only the child's allowed worktree scope. It cannot sweep parent or sibling metadata into the patch, and secret/redaction and unsupported-path rules remain owned by FileSafe and Permissions.

### Typed lease generation, renewal, expiry, release, and reconciliation

The child-worktree lease is a typed durable Source Control resource coordinated by the shared `LeaseCoordinator`, not an in-memory lock or a second lease implementation. The shared lease record carries its canonical scope, resource identity, holder identity, mode, generation, epoch, `acquired_at`, `renewed_at`, `expires_at`, policy ref, cleanup strategy, reconciliation state, and terminal disposition. It binds the exact `ProjectHomeServerId`, `ExecutionHostId`, `ExecutionEnvironmentId`, `SourceLocationId`, `TopologyGeneration`, and capability snapshot required by the shared runtime. The Worktree-owned extension carries at minimum:

`lease_id`, `project_id`, `repo_id`, `worktree_id`, `branch_ref`, `baseline_receipt_id`, `owner_run_id`, `owner_node_id`, `owner_attempt_id`, `child_run_id`, `runtime_identity`, `write_mode`, `renew_by`, last reconciliation receipt, and release/result/integration refs when present. Worktree lifecycle remains `reserved | active | blocked_preserved | released | orphaned`; shared lease reconciliation state and terminal disposition remain separate and are not redefined by this owner.

- **Generation and epoch:** the shared lease generation is monotonic for the exact worktree resource identity and remains fenced by holder, epoch, topology generation, and Source Location. Create, attach, renew, result capture, integrate, release, and cleanup compare all applicable fences. A stale holder, generation, epoch, topology, or source identity is rejected without mutation and cannot renew, release, overwrite result custody, or reconcile a replacement lease.
- **Activation and renewal:** activation requires verified materialization identity plus current shared-runtime topology/resource admission. Renewal is a durable compare-and-swap by the same live holder/runtime identity before `renew_by`; it advances the shared generation and expiry atomically, records the prior generation/epoch, and cannot widen repository, worktree, branch, owner, mode, topology, resource policy, or permission scope. Scope change requires an explicit ownership transfer or new lease.
- **Expiry:** wall-clock expiry stops new child dispatch and mutations but does not prove owner death, release the branch, delete the worktree, or discard a patch. The worktree remains preserved while the owner record enters reconciliation. Expiry during an in-flight Source Control/FileSafe transaction defers to that owner's journal and fence.
- **Release:** release is idempotent and generation-checked. It requires a terminal child disposition, durable result/verified-empty custody, explicit integration disposition (`approved_integrated | approved_not_integrated | integration_failed_preserved | rejected_preserved`), and all required holds/refs. Release changes ownership eligibility; it is not physical remove/prune and cannot erase the branch or result artifact.
- **Reconciliation:** startup and periodic reconciliation compare the lease, exact topology/source identities, repository common-dir inventory, worktree path/gitdir, branch/OIDs, baseline/result hashes, active Git operation, FileSafe transaction/holds, runtime owner liveness, resource admission, and permission visibility. Worktree-domain findings may include `verified_active`, `renewal_required`, `expired_preserved`, `materialization_missing`, `identity_mismatch`, `partial_creation_preserved`, `result_capture_required`, and `release_ready`; they are inputs to, not replacements for, the shared startup recovery outcomes `resumed | replayed | rolled_back | cleaned | quarantined | manual_recovery_required | terminal_unknown_with_disclosure`. Reconciliation never guesses ownership from directory or branch names and never adopts an unowned worktree without explicit recovery authority. Absence of evidence never becomes success.

### Integration failure and result survival

Approval authorizes one exact integration attempt; it does not guarantee success and does not authorize destructive conflict cleanup. Before integration, Source Control ensures the child patch/result is content-addressed and durable outside the child worktree, records the source and target full OIDs plus target FileSafe digest, and acquires applicable mutation fencing. On conflict, stale target, permission drift, FileSafe denial, hook/check failure, process interruption, or unverifiable postcondition:

- the integration result is `integration_failed_preserved` with reason/evidence and the exact attempted source/target identities;
- the independently stored patch/result remains available even if the worktree later becomes unavailable;
- the child branch and worktree remain `blocked_preserved` while referenced, unless a separately approved recovery creates a verified successor preserving equivalent custody;
- no automatic reset, stash, clean, branch deletion, forced merge, source-worktree mutation, or patch overwrite is allowed; and
- retry requires a fresh target observation, current approval/permission posture, exact preserved result identity, and a new idempotent integration attempt identity.

Successful integration requires verified target postconditions and a durable integration receipt before release eligibility. A successful process exit alone is insufficient; a failed integration remains a failure even when the patch survived.

### Restart reconciliation and safe cold revival

On process restart, reconciliation runs before child dispatch, lease renewal, integration, or cleanup and remains bounded and independently observable through shared `ObservableWork`. Nonterminal creation, FileSafe, result-capture, and integration transactions are resumed or classified from their owner journals against receipts, underlying resource/process truth, lease generation/epoch, topology generation, and owner truth; path existence, PID absence, an expired timestamp, or a branch name never settles them. Missing or mismatched worktrees remain preserved records with explicit recovery posture, and cleanup cannot race reconciliation.

A persisted child may be cold-revived only when policy permits the child type and all of the following are freshly verified: durable child input/context identity, baseline and result hashes, exact repository/worktree/branch identity, no conflicting live owner, recoverable worktree state or a newly allocated isolated successor, current permissions/write mode, current provider/tool capability, and remaining budget/deadline. Revival issues a new lease generation and a new runtime/process/session identity. It does not revive expired credentials, PIDs, terminals, language servers, MCP sessions, model streams, in-memory locks, or hidden provider state. If exact continuation cannot be proven safe, PM preserves the patch/branch/result and starts a fresh child attempt or requests recovery; it never silently resumes in the main worktree.

### FileSafe and Permissions boundary

`Permissions_System.md` decides whether the actor/runtime may perform the exact action class against the exact project/repository/worktree/branch and whether its `read_only | proposal_only | patch_only | isolated_worktree | leased_writer | parent_writer` mode permits the requested mutation. Approval and permission evidence is generation- and target-bound, rechecked on renewal/integration/recovery, and cannot be copied from a parent, sibling, prior generation, or chat wrapper merely because the repository matches.

`FileSafe.md` owns canonical path resolution and containment, mutation-scope checks, filesystem write admission, safe-point/rollback protection, transaction fencing/journaling, exact restore/equality, and restart reconciliation for filesystem effects. Source Control owns Git repository/worktree/branch identity, lease-to-materialization binding, Git administrative serialization, patch/branch/result capture, merge execution, and Git postcondition verification. Neither owner treats the other's successful check as a substitute. `cmd.git.worktree.create`, `cmd.git.worktree.merge`, and `cmd.git.worktree.release` orchestrate those owner calls without minting a peer `cmd.worktree.*` namespace.
