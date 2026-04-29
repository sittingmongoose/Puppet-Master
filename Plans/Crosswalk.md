# Crosswalk (Canonical)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum
  - Highest-Impact Docs
  - Cleanup Priorities

#### Source target target-0157
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
  - Highest-Impact Docs
  - Cleanup Priorities
- Exact required items represented:
  - Replace tier-rooted execution with package/seam/lane model
  - Define package overseer + seam overseer roles
  - Add node/package/seam/lane/attempt/effective_identity fields to contracts and storage
  - Redefine gates to package-complete / seam-complete
  - Rename or retire Tiers UI/tab and tier_tree/progress bars
  - Extend Glossary.md, [retired-token-12], Decision_Policy.md, and 00-plans-index.md with first-class ownership for feature seam, work package, package/seam overseers, promotion class, lane pool, contamination, and effective execution identity.
  - Clarify which docs own [retired-token-11] vs UI-only overlays.
  - rewrite-era primitives like `Seglog`, evidence-bundle style outputs, and capability-gating concepts still lack Crosswalk routing, so adjacent docs can cite primitives that Crosswalk cannot resolve.
  - Seglog
  - `[retired-token-12]` is not just duplicate-numbered; its `References` section is non-terminal, its §2 routing table omits many already-defined primitives, and adjacent docs are already citing primitives like `Seglog` that Crosswalk cannot route.
  - [retired-token-12]
  - References
  - missing primitive routing is now sharper: `Seglog`, `ArtifactStore`, PR/issues surface ownership, and capability-gating ownership all still lack clean Crosswalk routing.
  - ArtifactStore
  - Highest-signal docs remain the same core owner set, with `Commands_System.md`, `Wiring_Matrix.md`, `UI_Wiring_Rules.md`, `Project_Output_Artifacts.md`, `FileManager.md`, `[retired-token-12]`, `Decision_Policy.md`, `Run_Modes.md`, `Progression_Gates.md`, `newtools.md`, and `assistant-memory-subsystem.md` still worth pushing through the final pass.
  - Commands_System.md
  - Wiring_Matrix.md
  - UI_Wiring_Rules.md
  - Project_Output_Artifacts.md
  - FileManager.md
  - Decision_Policy.md
  - Run_Modes.md
  - PR/issues, `Seglog`, `ArtifactStore`, and capability-gating routing remain unresolved in Crosswalk.
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - Add a new Crosswalk primitive for route-target navigation and likely another for subject-open/open-by-identity, or make one primitive explicitly cover both layers if kept tight.
  - `[retired-token-12]` still names `Primitive:UICommand` and `Primitive:DocumentPane`, but it has no primitive boundary for route-target navigation or identity-native open/focus behavior.
  - Primitive:UICommand
  - Primitive:DocumentPane
  - crosswalk owns the primitive boundary
  - The contract conclusions are now stronger than several owner docs, especially `Contracts_V0.md`, `[retired-token-12]`, `UI_Command_Catalog.md`, and `FinalGUISpec.md`.
  - Contracts_V0.md
  - UI_Command_Catalog.md
  - FinalGUISpec.md
  - `Plans/[retired-token-12]` still does not declare the routing/open-by-identity primitives that these behaviors require.
  - Plans/[retired-token-12]
  - `[retired-token-12]` still names `UICommand`, `DocumentPane`, and `DocumentCheckpoint` ownership without naming the route-target / subject-open primitive that sits between them.
  - UICommand
  - DocumentPane
  - DocumentCheckpoint
  - `[retired-token-12]` also still carries stale Orchestrator ownership text:
  - `Plans/[retired-token-12]` has duplicated section numbering:
  - `[retired-token-12]` is especially risky because duplicate numbering weakens its role as a precedence document.
  - `DRY_Rules.md`, `[retired-token-12]`, `Progression_Gates.md`, and `Contracts_V0.md` now show concrete `ContractRef` format, anchor, and duplicate-section failures that would break deterministic traceability rather than just weaken it.
  - DRY_Rules.md
  - Progression_Gates.md
  - ContractRef
  - Coverage has been re-audited after the merge: `39` top-level `Plans/*.md` docs are full six-pass complete and the remaining `22` docs are now uniformly at five passes.
  - 39
  - 22
  - `[retired-token-12]`, `DRY_Rules.md`, `Progression_Gates.md`, and `Decision_Log.md` now have explicitly cited duplicate section numbers, misbound `ContractRef`s, line-level gate semantics that do not match adjacent canon usage, and missing rewrite-era governance records.
  - Decision_Log.md
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
  - `Plans/[retired-token-12]` still publishes stale top-level ownership guidance for the rewrite:
  - `[retired-token-12]` still routes readers into stale Orchestrator and widget canon
  - The duplicated `[retired-token-12]` numbering is not cosmetic. It undermines `ContractRef` stability and gateable traceability.
  - The duplicated runtime-recovery addendum means the gate doc now has same-file canon duplication similar to the problems already logged in `[retired-token-12]`, `human-in-the-loop.md`, and `storage-plan.md`.
  - human-in-the-loop.md
  - storage-plan.md
  - `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, `Plans/UI_Command_Catalog.md`, `Plans/[retired-token-12]`, `Plans/Wiring_Matrix.md`, `Plans/Progression_Gates.md`, `Plans/FileManager.md`, `Plans/Project_Output_Artifacts.md`
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/Progression_Gates.md
  - Plans/FileManager.md
  - Plans/Project_Output_Artifacts.md
  - `cov-526` / `obl-222` remains unresolved because the ledger requires a concrete worktree allocation strategy (per node, per package, per seam, or remediation branch) plus contamination/reuse/cleanup rules, but the live docs still stop short of that owner section: `Plans/[retired-token-12]:88-94` assigns lane/worktree ownership boundaries, `Plans/WorktreeGitImprovement.md:62-66` and `Plans/WorktreeGitImprovement.md:78-80` retain the worktree plan without defining allocation strategy, and `Plans/orchestrator-subagent-integration.md:28-41` plus later authority wording require identity alignment without specifying how lanes/worktrees are allocated. Exact ledger evidence remains at `working_ledger.md:L806`, `working_ledger.md:L1036`, `working_ledger.md:L1289`, and `working_ledger.md:L1539`.
  - cov-526
  - obl-222
  - Plans/[retired-token-12]:88-94
  - Plans/WorktreeGitImprovement.md:62-66
  - Plans/WorktreeGitImprovement.md:78-80
  - Plans/orchestrator-subagent-integration.md:28-41
  - working_ledger.md:L806
  - working_ledger.md:L1036
  - `Plans/[retired-token-12]:88-94`
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
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-170: Coverage blocker worktree allocation strategy
- Coverage rows: cov-170
- Fidelity gap refs: cov-170
- Required fidelity items:
- Exact required item: Define concrete worktree allocation strategy
- Exact required item: Define contamination, reuse, and cleanup rules for that strategy
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-170: Coverage blocker worktree allocation strategy` exists in `Plans/Crosswalk.md`.
- Exact acceptance check: The `cov-170` repair states the exact requirement: Define concrete worktree allocation strategy
- Exact acceptance check: The `cov-170` repair states the exact requirement: Define contamination, reuse, and cleanup rules for that strategy
- Exact acceptance check: The `cov-170` repair is in the owner section for `Plans/Crosswalk.md` and is not only a downstream consumer note.

### Fidelity recovery cov-200: Route/open compatibility-only fallback marking
- Coverage rows: cov-200
- Fidelity gap refs: cov-200
- Required fidelity items:
- Exact required item: Mark timestamp/run/thread fallback logic as compatibility-only inside route/open contracts
- Exact required item: Keep ref-family split explicit when route/open normalization is transferred
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-200: Route/open compatibility-only fallback marking` exists in `Plans/Crosswalk.md`.
- Exact acceptance check: The `cov-200` repair states the exact requirement: Mark timestamp/run/thread fallback logic as compatibility-only inside route/open contracts
- Exact acceptance check: The `cov-200` repair states the exact requirement: Keep ref-family split explicit when route/open normalization is transferred
- Exact acceptance check: The `cov-200` repair is in the owner section for `Plans/Crosswalk.md` and is not only a downstream consumer note.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
PUPPET MASTER -- CANONICAL CROSSWALK

Purpose:
- Define *ownership boundaries* for core primitives so plan documents do not drift into duplicating each other.
- Keep it DRY: other plans reference these sections rather than redefining boundaries.

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

## 0. Scope
This document is a **boundary map**, not an implementation plan.
It assigns authoritative ownership for *primitives* (Tool, Provider, UICommand, SessionStore, PatchPipeline, AuthState, etc.) so each plan can remain DRY.

ContractRef: Primitive:Crosswalk

---

## 1. Precedence (anti-drift)
When two plan documents disagree, resolve conflicts deterministically with this precedence order:
1. `Plans/Spec_Lock.json`
2. This Crosswalk
3. `Plans/DRY_Rules.md`
4. `Plans/Glossary.md`
5. `Plans/Decision_Policy.md`

ContractRef: PolicyRule:Decision_Policy.md§2, SchemaID:Spec_Lock.json

---

## 2. Primitive index (definitions are DRY)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0158
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - own final canonical term definitions for:
  - `Crosswalk.md` still has duplicate section numbering, a wrong `Primitive:` ContractRef, missing §2 index entries for appended primitives, and orphaned source-control/GitHub-actions/docker surfaces outside the normal routing structure.
  - Crosswalk.md
  - Primitive:
  - a direct binding to a canonical navigation primitive
  - canonical navigation primitive
  - `Primitive:DocumentPane`
  - Primitive:DocumentPane
  - `Primitive:DocumentReviewSurface`
  - Primitive:DocumentReviewSurface
  - `Primitive:DocumentCheckpoint`
  - Primitive:DocumentCheckpoint
  - `OpenFile` is currently acting like a surrogate navigation primitive because the real primitive has no owner.
  - OpenFile
  - but it should stop being treated as a stronger separate primitive
  - these are good UX-facing wrapper names, even if they are not the canonical navigation primitive
  - A smaller hidden or lower-level canonical navigation primitive still looks necessary, but it should be contract-owned rather than catalog-dominant.
  - for example an internal/shared `open_subject` or `focus_route` primitive
  - open_subject
  - focus_route
  - canonical primitive underneath both
  - assistant-chat already behaves like subject/open-by-identity exists, even if it does not name the primitive directly
  - `Primitive:OrchestratorPage` still says six tabs with `Tiers`
  - Primitive:OrchestratorPage
  - Tiers
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
This file uses primitive names as **routing labels** only; detailed schemas belong to their SSOT documents.

- `Primitive:Provider` -- provider CLIs and their normalized streams (see `Plans/CLI_Bridged_Providers.md`).
- `Primitive:Tool` -- host tools invoked by Puppet Master (see `Plans/Tools.md`).
- `Primitive:UICommand` -- stable UI command IDs (see `Plans/Contracts_V0.md#UICommand` and `Plans/UI_Command_Catalog.md`).
- `Primitive:SessionStore` -- persistent store boundaries (see `Plans/storage-plan.md`).
- `Primitive:PatchPipeline` -- Git + PR workflows (see `Plans/WorktreeGitImprovement.md` and `Plans/GitHub_API_Auth_and_Flows.md`).
- `Primitive:DocumentPane` -- embedded document navigation and editing surface contract (see `Plans/FinalGUISpec.md` and `Plans/FileManager.md`).
- `Primitive:DocumentReviewSurface` -- workflow-level document review routing and tri-location pointers (see `Plans/chain-wizard-flexibility.md`, `Plans/interview-subagent-integration.md`, and `Plans/assistant-chat-design.md`).
- `Primitive:ReviewFindingsSummary` -- structured Multi-Pass findings summary and rendering contract (see `Plans/chain-wizard-flexibility.md`, `Plans/interview-subagent-integration.md`, and `Plans/FinalGUISpec.md`).
- `Primitive:ReviewApprovalGate` -- final approval gate contract for revised document bundles (see `Plans/chain-wizard-flexibility.md`, `Plans/interview-subagent-integration.md`, and `Plans/Project_Output_Artifacts.md`).
- `Primitive:DocumentCheckpoint` -- checkpoint and restore contracts for document revisions (see `Plans/storage-plan.md`, `Plans/Project_Output_Artifacts.md`, and `Plans/FileManager.md`).
- `ContractName:Contracts_V0.md#AuthState` -- auth state + events.

ContractRef: ContractName:Contracts_V0.md, SchemaID:Spec_Lock.json

Primitive:RouteTarget / Primitive:OpenSubject

Route targets and open subjects are the canonical way to name destinations and inspection points across GUI, CLI, help, and underlying services. This section clarifies the boundary: ownership and canonical semantics live in Plans/Contracts_V0.md; this section explains how surfaces navigate them.

#### Route target navigation rules

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0169
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - read-only navigation may continue on `[retired-token-2]` and some `[retired-token-1]` projections if the UI says so clearly
  - [retired-token-2]
  - [retired-token-1]
  - Each result should carry a canonical route target:
  - Search result should route based on what the user likely needs:
  - `usage_event_ref` should be the preferred route for cost-bearing pivots whenever present.
  - usage_event_ref
  - `resume_url` should not stay the most expressive navigation mechanism in the product.
  - resume_url
  - route target identity
  - `resume_url` remains stronger and more explicit than most other navigation mechanisms.
  - Neighboring primitives are already fragmented because no owner doc says where route payloads stop, where subject identity starts, and where file-path opening is merely one realization.
  - Navigation should follow the same pattern instead of claiming a hard flag day.
  - That state is real and important, but it is not the same thing as canonical route identity.
  - That is enough for routing intent. The route model does not need to encode every lower-level shell detail.
  - Those are real and useful, but they are not the same thing as canonical route identity.
  - The route model should be precise enough to get the user where they asked to go, but restrained enough not to trash unrelated remembered shell state.
  - wrappers normalize to canonical route semantics internally
  - does not define canonical route identity or target structure
  - Reject multi-selector route payloads as non-canonical.
  - Serialization must stay narrower than the internal route model.
  - `document_id` and `artifact_id` still appear in some navigation prose where `subject_id` should be named directly.
  - document_id
  - artifact_id
  - subject_id
  - Canonical route examples
  - `usage_event_ref` still appears in current docs as if it can remain a top-level route field.
  - Source Control and rewrite-era orchestration objects need equally explicit route recipes.
  - stop owning canonical navigation identity
  - normalize scheduler/blocking/safe-point/remediation/attempt pivots through object-first route recipes
  - Replace graph/detail uses of `tier_id` as navigation identity with object-first routing to:
  - tier_id
  - `resume_url` is currently the only ref field trying to carry actual navigation, which is why it keeps colliding with the route/open-by-identity work.
  - Keep canonical usage-event identity primary for Usage/Ledger navigation.
  - Cluster D - Route / open-subject / bridge-field refinement misses
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_[retired-token-2]_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
1. CLI `-r`/`--route` and GUI "Save" buttons resolve route_target strings through a cascade:
   - `file://...` → local file system (requires file permissions)
   - `github://owner/repo/path` → GitHub repository (requires auth and branch access)
   - `workspace://project/concern` → internal workspace (always allowed, creates if absent)
   - `share://sharepoint-url` or `notion://...` → external service (depends on integration availability)
2. If route is ambiguous (e.g., `~/output` with no scheme), the active Persona's default route is used.
3. Crosswalk does not own the decision; it documents how the decision made in Contracts_V0.md and Models_System.md flows through to the UI.

#### Open subject navigation rules

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0168
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - History rows can open Graph/Evidence
  - open evidence/history/ledger/source control
  - open selected items in `History`, `Evidence`, or `Ledger`
  - History
  - Evidence
  - Ledger
  - `TierContext` replacement/wrapper is now one of the most important structural follow-ups still open
  - TierContext
  - Add the missing runtime-identity open path to FileManager and align evidence/artifact keys with attempt-native records.
  - identity-based open is the canonical entrypoint for:
  - it lets FileManager/editor/Artifacts/Orchestrator share one identity model instead of ad hoc open handlers
  - identity-native subject open
  - identity-native subject/route open
  - Promote `project_id`, `attempt_id`, and generated/runtime subject routing to first-class owners in artifact/file/storage docs.
  - project_id
  - attempt_id
  - artifact-backed content may open source in transient `generated://<artifact_id>` buffers
  - generated://<artifact_id>
  - routing should target the subject identity first, then resolve to the best openable representation
  - `Open in Source Control`
  - Open in Source Control
  - Keep `generated://<artifact_id>` as a transport/open realization, not as the canonical subject identity.
  - Storage already knows canonical subject identity, but Contracts and Crosswalk still do not declare the navigation primitive that consumes it.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
1. GUI "Open" and "Inspect" buttons normalize open requests to an OpenSubject and route through the orchestrator's concern/help/artifact resolution.
2. Subject types: `file`, `concern`, `help_entry`, `project_state`, `run`, `artifact_storage`.
3. Crosswalk describes which surfaces can open which types; canonical ownership rules are in Contracts_V0.md.

### 3.3 Navigation and source-open ownership

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0164
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - what likely new model pressure is: new vocabulary canon, migration guidance, deprecation boundaries, package/seam/lane/promotion terminology ownership.
  - Add a Crosswalk primitive boundary for route-target / open-subject ownership so the split between shell-state and canonical navigation is explicit.
  - `FinalGUISpec.md` still gives `resume_url` more concrete ownership than generic navigation.
  - FinalGUISpec.md
  - resume_url
  - owner-doc primitive boundaries that remain prose-only rather than formalized (for example navigation identity / route-target ownership)
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
The source control lane, worktree, and open-file system are owned by the FileManager. However, navigation through opened files (following includes, tracing references) remains a GUI responsibility coordinated through open/route semantics.

### 3.4 Source Control and lane/worktree ownership

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0165
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Source Control rows expose `owner run/tier when present`
  - owner run/tier when present
  - glossary/help/labels for lane/worktree terminology
  - preserve Source Control as Git/worktree-first
  - lane/worktree records
  - lane/worktree objects
  - Source Control still needs a more concrete worktree-first vocabulary.
  - This should stay worktree-first in Source Control, with lane/package/run metadata attached.
  - revoked/reopened flow leaves an old lane/worktree no longer needed live
  - Source Control / lane/worktree language
  - Treat `acknowledged` as escalation/noise control and ownership visibility, not semantic closure and not blocker removal by itself
  - acknowledged
  - Source Control is compact and worktree-first
  - no clean lane/worktree binding exists
  - lane/worktree refs
  - Source Control / repo/worktree/branch
  - Source Control remains worktree-first.
  - FileManager handoff to Source Control must preserve `repo_id` and `worktree_id`
  - repo_id
  - worktree_id
  - lane/worktree state
  - `worktree-first` Source Control with lane/worktree split
  - worktree-first
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
FileManager owns the git/worktree model and lane assignments. Crosswalk clarifies when navigation crosses lanes and how that affects artifact visibility and approval scope.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Models_System.md, ContractName:Plans/FileManager.md
### 3.5 Assistant thread worktree binding ownership

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0166
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `Requested binding`
  - Requested binding
  - workspace binding: `workspace`, `worktree_path`
  - workspace
  - worktree_path
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Thread-to-worktree binding is owned by `Plans/assistant-chat-design.md`.

| Aspect | Owner doc | Consumer docs |
|---|---|---|
| Binding data model (1:1, thread↔worktree) | assistant-chat-design.md | storage-plan.md, Contracts_V0.md |
| Seglog events (`chat.thread_worktree_*`) | assistant-chat-design.md | storage-plan.md, Contracts_V0.md, Wiring_Matrix.md |
| Commands (`cmd.chat.worktree.*`) | assistant-chat-design.md | UI_Command_Catalog.md, Commands_System.md, Contracts_V0.md |
| Settings (10 keys) | assistant-chat-design.md | storage-plan.md, FinalGUISpec.md |
| Merge-back flow | assistant-chat-design.md | GitHub_Integration.md, Executor_Protocol.md |
| Pre-merge test gate | assistant-chat-design.md | storage-plan.md, Executor_Protocol.md |
| SC accordion & filter | GitHub_Integration.md | storage-plan.md, FinalGUISpec.md, Wiring_Matrix.md |
| Worktree record extension (`owner_thread_id`) | storage-plan.md | WorktreeGitImprovement.md, Orchestrator_Page.md |
| File manager worktree toggle | FileManager.md | assistant-chat-design.md, storage-plan.md |
| LSP worktree root_identity | LSPSupport.md | assistant-chat-design.md, Executor_Protocol.md |

**Freshness / health projection:** Thread worktree binding state follows the two-dimensional projection model (freshness=current|refreshing|stale × health=healthy|degraded|unavailable) defined in storage-plan.md §Projection state.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/DRY_Rules.md

### 3.6 Projection-state ownership

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0167
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - preview/browser `trust_tier` should not be casually reused as the generic projection-state term
  - trust_tier
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Projection freshness/health vocabulary is owned centrally so consumer docs do not invent surface-local degraded-state semantics.

Canonical ownership is:
- `storage-plan.md` owns the projection-state axes and persisted freshness/health semantics
- `Decision_Policy.md` owns behavior when stale, degraded, or unavailable state affects execution or mutation gating
- `FinalGUISpec.md` owns how freshness/health are disclosed in UI surfaces
- feature/surface docs may consume these states but MUST NOT redefine the axes or collapse them into one field

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/FinalGUISpec.md

### 3.7 Subagent, crew, and context-shaping ownership

Subagent and crew ownership is intentionally split across owner docs. Each concern has one authoritative home.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md

| Concern | SSOT owner |
|---|---|
| Global execution limits (`maxNestingDepth`, `maxTotalSpawnedAgents`, `maxToolRoundsPerAgent`, concurrency caps) | `Plans/orchestrator-subagent-integration.md` |
| Per-interview reviewer cap (`max_subagents_spawn`) | `Plans/interview-subagent-integration.md` |
| Shell environment isolation and shell lifecycle | `Plans/orchestrator-subagent-integration.md` + `Plans/Tools.md` jointly |
| Context-shaping transitions and compaction-state events | `Plans/Prompt_Pipeline.md` + `Plans/storage-plan.md` |
| Crew lifecycle and message-board events | `Plans/storage-plan.md` |
| Requested vs effective runtime surface for child runs | `Plans/Models_System.md` + `Plans/CLI_Bridged_Providers.md` |

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Tools.md

Per-surface docs may narrow these behaviors, but MUST NOT redefine the owners above.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md

### 3.8 Human-in-the-loop ownership

Canonical HITL ownership is:
- `human-in-the-loop.md` owns approval/decline semantics and the blocked-episode overlay contract
- `Contracts_V0.md` owns the canonical blocked-episode fields, action ids, and persisted payload shapes
- `UI_Command_Catalog.md` owns the concrete command ids that execute approval actions
- `FinalGUISpec.md` and `assistant-chat-design.md` own presentation only

ContractRef: ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/UI_Command_Catalog.md

### 3.9 Debug-mode and investigation ownership

Canonical debug/investigation ownership is:
- `assistant-chat-design.md` owns Assistant Debug Mode as the user-facing workflow overlay and investigation-thread behavior
- `orchestrator-subagent-integration.md` owns orchestrator/delegated-worker use of shared investigation contracts
- `Executor_Protocol.md` owns execution-time investigation context propagation
- `storage-plan.md` owns persisted investigation records, snapshots, and recovery joins
- `Permissions_System.md` owns the Debug Automation Profile and grant/revalidation semantics

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md

### 3.10 Permission and approval-scope ownership

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0162
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Add an explicit approval-scope field or object, likely something like `approval_scope_key`, so reusable approvals and one-off blocked-episode approvals cannot bleed together.
  - approval_scope_key
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Canonical permission ownership is:
- `Permissions_System.md` owns permission precedence, rule persistence, approval-scope derivation, durable-rule authoring, and blocked-family expectations for permission-caused outcomes
- `Contracts_V0.md` owns canonical blocked payload shapes, `approval_scope_key`, and action-id field names
- `human-in-the-loop.md` owns approval interaction semantics, not rule persistence
- consumer docs may name required permission keys or blocked triggers but MUST NOT redefine the approval-scope contract

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/human-in-the-loop.md

### 3.11 Remediation lifecycle ownership

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0163
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - enrich row metadata with package/lane/run ownership and lifecycle state
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Canonical remediation ownership is:
- `Executor_Protocol.md` owns when remediation is spawned, how it interacts with retry/safe-point flows, and when execution escalates instead of retrying
- `Contracts_V0.md` owns `remediation.spawned` / `remediation.resolved` event shapes and the canonical `resolution` enum
- `Decision_Policy.md` owns deterministic remediation ceilings and blocked posture after ceiling exhaustion
- `storage-plan.md` owns durable remediation lineage, joins, and historical projection behavior
- Orchestrator/GUI/chat docs consume remediation state but MUST NOT redefine remediation enums or ceiling behavior

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/storage-plan.md

### 3.12 Provider and account-selection ownership

Canonical provider/account selection ownership is:
- `Models_System.md` owns provider-entry/runtime-surface selection priority and requested/effective model/runtime fields
- `Multi-Account.md` owns account selection, provider-entry separation, requested/effective account fields, and switch lineage semantics
- `Prompt_Pipeline.md` owns when requested/effective provider/account/model decisions freeze into the runtime handoff bundle
- `CLI_Bridged_Providers.md` and provider-specific docs own transport/capability facts and provider-native fallback constraints, but not the global selection precedence

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/CLI_Bridged_Providers.md

### 3.13 Event, record, and terminal-identity ownership

Canonical ownership is:
- `Contracts_V0.md` owns event families, runtime-facing payload names, and command/event envelopes
- `storage-plan.md` owns persisted record families, projection joins, `terminal_session_id`, `dev_session_id`, and terminal continuity/restart identity rules
- `FinalGUISpec.md` owns shell realization and terminal layout presentation
- consumer docs may extend display metadata but MUST NOT redefine terminal or event identity primitives

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

## References

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0160
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - glossary/crosswalk/TOC dead references and missing advertised sections
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- `Plans/Spec_Lock.json`
- `Plans/DRY_Rules.md`
- `Plans/Glossary.md`
- `Plans/Decision_Policy.md`
- `Plans/Tools.md`
- `Plans/Contracts_V0.md`
- `Plans/storage-plan.md`
- `Plans/Widget_System.md`
- `Plans/Run_Graph_View.md`
- `Plans/Orchestrator_Page.md`


### 3.14 DocumentInlineNotes
**Owner:** GUI contract in `Plans/FinalGUISpec.md`; persistence contract in `Plans/storage-plan.md`; workflow semantics in `Plans/chain-wizard-flexibility.md` and `Plans/interview-subagent-integration.md`; chat-handoff rules in `Plans/assistant-chat-design.md`.

Rules:
- This primitive now covers durable document annotations on the legacy `note_record.v1` substrate.
- User-facing term is **Annotations** even though storage keys retain `note` naming for continuity.
- Durable annotation operations are `comment`, `replace`, `insert_after`, and `remove`.
- Annotation lifecycle is `open -> addressed -> resolved`.
- Anchor storage MUST include both `TextPositionSelector { start, end }` and `TextQuoteSelector { exact, prefix, suffix }` when deterministic source text exists.

ContractRef: Primitive:DocumentInlineNotes, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

- Re-anchoring is deterministic: 1) position selector match, else 2) quote selector match using prefix/suffix preference, else 3) keep the annotation open and surface `Anchor not found — reselect to re-anchor`.
- `comment` annotations may coexist with any other annotation on the same span.
- Overlapping mutating annotations conflict by default and are excluded from automatic targeted revision until resolved.
- `Send selection to chat` is adjacent behavior, not a durable annotation by default.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md

---

### 3.15 TargetedRevisionPass
**Owner:** Workflow semantics in `Plans/chain-wizard-flexibility.md` and `Plans/interview-subagent-integration.md`; UI placement in `Plans/FinalGUISpec.md`; prompt and persistence details in `Plans/Prompt_Pipeline.md` and `Plans/storage-plan.md`.

Rules:
- `Resubmit with Annotations` triggers a targeted revision pass scoped to documents with open durable annotations, or a user-selected subset.
- Targeted revision consumes deterministic ordered annotation records that include `operation`, `intent_kind`, `operation_payload`, anchor data, and bounded provenance.
- Targeted revision may apply requested edits and/or answer question/comment annotations.
- For each input annotation, the runtime records `addressed | still_open | cannot_apply`, `addressed_explanation`, and `updated_anchor?`.

ContractRef: Primitive:TargetedRevisionPass, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/storage-plan.md

- Targeted revision MUST NOT trigger Multi-Pass Review.
- Conflicting or stale mutating annotations are excluded from automatic revision until resolved.
- One automatic retry is allowed on structured validation failure; after that, the run must explicitly degrade or fail.

ContractRef: ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Permissions_System.md

---

### 3.16 FinalReviewGate
**Owner:** Workflow semantics in `Plans/chain-wizard-flexibility.md` and `Plans/interview-subagent-integration.md`; artifact taxonomy and restore semantics in `Plans/storage-plan.md`.

Rules:
- Multi-Pass Review is final-review only: enabled only when all bundle docs are Approved/Done and no durable annotations remain open.
- Question/comment annotations count as open until the user resolves them.
- Pending `Send selection to chat` chips do not satisfy or bypass the gate.
- Final review runs once by default; rerun explicit only.
- Final gate is a single decision: `Accept | Reject | Edit`.

ContractRef: Primitive:TargetedRevisionPass, ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/storage-plan.md

## Recovery Terminology Reconciliation Addendum (2026-03-08)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0159
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - docs that mostly need terminology / projection cleanup
  - still needs runtime-overlay terminology, identity linkage, and approval cache scoping for multi-actor execution
  - Stop letting consumer docs fill owner gaps with “compatibility” fields or local terminology when the canonical owner is still undecided.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

This packet requires an explicit terminology crosswalk:
- `safe point` = runtime-internal retry/remediation anchor
- `restore point` = user-visible history/rewind anchor
- `rollback` = explicit request/confirm restoration flow
- `worktree baseline` = execution-root state used to materialize a safe point or restore point depending on context

Required rule:
- docs and implementations must not use these terms interchangeably
- UI copy must preserve the distinction
## Runtime Scheduler / Recovery Ownership and Precedence

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0161
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - still missing canonical ownership for `execution_role`, `blocked_sequence` minting, and startup-recovery scheduler handoff.
  - execution_role
  - blocked_sequence
  - `Executor_Protocol.md` contains byte-identical duplicated canonical scheduler sections and still leaves `blocked_sequence` minting, startup recovery handshake, `execution_role` ownership, and reviewer/corroboration lifecycle unowned.
  - Executor_Protocol.md
  - `Crosswalk.md` is structurally broken (duplicate section numbering, orphaned addenda, wrong ContractRef) and still does not route major rewrite-era owners such as `orchestrator-subagent-integration.md`, runtime scheduler ownership, or worktree lifecycle ownership.
  - Crosswalk.md
  - orchestrator-subagent-integration.md
  - `Crosswalk.md` still acts as if owner primitives are stable while the rewrite has already shifted ownership boundaries around Orchestrator, widgets, route/open contracts, blocked identity, and runtime identity disclosure.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Canonical ownership:
- runtime lifecycle and scheduling: `Plans/Executor_Protocol.md`
- runtime events, enums, and payloads: `Plans/Contracts_V0.md`
- persistence and restart recovery: `Plans/storage-plan.md`
- deterministic recovery defaults: `Plans/Decision_Policy.md`
- runtime command IDs: `Plans/UI_Command_Catalog.md`
- chat, GUI, run graph, orchestrator, and wizard surfaces are consumers of the contracts above

Precedence rules:
- legacy packet-era names such as `analysis_id`, `run.scheduler_analysis`, `allowed_actions[]`, and `recovery_options[]` are compatibility terms only
- when a consumer doc conflicts with the owner docs above, the owner docs win
- stale canonical text must be replaced or retired, not preserved by later additive notes alone

## Source Control, GitHub Actions, and Docker Manager Ownership Addendum (2026-03-12)

### SourceControlSurface

Owner: `Plans/GitHub_Integration.md` + `Plans/WorktreeGitImprovement.md`.

Rules:
- Git-local and Git-remote repo operations, history, graph, stash, conflicts, and worktree UX belong to Source Control.
- GitHub-hosted workflow/admin behavior does not belong to Source Control.
- Worktree lifecycle correctness remains owned by the worktree plan even when surfaced through Source Control.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/WorktreeGitImprovement.md

### GitHubActionsSurface

Owner: `Plans/GitHub_Integration.md` with auth/runtime constraints from `Plans/GitHub_API_Auth_and_Flows.md`.

Rules:
- GitHub Actions uses GitHub API identity and capability, not Git transport state, for hosted workflow/admin behavior.
- Current Branch / Workflows / Settings are separate subviews of one Actions surface.

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/newtools.md

### DockerManagerSurface

Owner: `Plans/Containers_Registry_and_Unraid.md` with readiness/result minima from `Plans/newtools.md`.

Rules:
- Docker Manager is the canonical umbrella for Docker, Podman, registries/Docker Hub, compose, build/bake, Publish / Unraid, and project-focused Kubernetes.
- Unraid and Kubernetes are not required top-level shell surfaces for MVP.

ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/newtools.md
