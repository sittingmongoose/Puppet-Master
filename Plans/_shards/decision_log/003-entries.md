# Shard 003: Entries

Source: `Plans/Decision_Log.md`

Source lines: L13-L119

Source SHA256: `903a5cc05c94247222af6abc77ff7561d27acc543d84f453eae84aaec332f594`

---

## Entries


### DL-001: OpenCode Deep Extraction — SSOT target mapping for new subsystems
The mapping captured in `OpenCode_Deep_Extraction.md` remains a reference aid, but local canonical contracts still control final ownership in Puppet Master.

### DL-002: Section numbering shift in OpenCode_Deep_Extraction.md
Section-number drift in the extraction source must not become canonical drift in local SSOT docs.

### DL-003: Orchestrator execution model
The canonical orchestration model is the node graph. `Feature Seam` and `Work Package` are first-class graph-owned objects, and `Node` remains the smallest executable unit.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md

### DL-004: Governance split
`Package Overseer` and `Seam Overseer` are distinct governance roles. Runtime remains the canonical owner of readiness, blockers, transitions, retries, and dispatch.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/orchestrator-subagent-integration.md

### DL-005: Completion and promotion model
`Locally Complete`, `Available to Seam`, and `Seam Complete` remain distinct. Package completion alone is insufficient.

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md

### DL-006: Weak integration
Weak integration remains first-class and includes runtime/GUI mismatch, contract mismatch, workflow gaps, and architecture drift.

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Glossary.md

### DL-007: Corroboration threshold
High-impact claims use deterministic `2-of-3` corroboration. Lesser unresolved concerns remain visible as non-blocking advisory concerns.

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Decision_Policy.md

### DL-008: Graph patch lineage


Graph patching creates a new graph generation and preserves superseded historical paths as visible lineage.

ContractRef: ContractName:Plans/Run_Graph_View.md, ContractName:Plans/storage-plan.md

### DL-009: Source Control boundary
Source Control is worktree-first and compact. Orchestrator carries lane/package/seam operational context.

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/GitHub_Integration.md

### DL-010: Shared runtime identity
Requested/effective runtime identity is shared across assistant, interviewer, builders, overseers, and node workers without collapsing those actors into one ontology.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Multi-Account.md

### DL-011: Blocked approval identity
Blocked episodes anchored by `run_id`, `node_id`, `blocked_sequence`, and `attempt_id?` supersede request-centric HITL identity as canonical runtime approval scope.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/human-in-the-loop.md

### DL-012: Navigation primitives


`route_target` is the canonical navigation contract. `OpenSubject` is the canonical identity-native source-open contract. `resume_url` is serialized transport only.

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/FileManager.md

### DL-013: Debug evidence capture hygiene
Debug instrumentation and investigation evidence follow a non-citation operational ledger rule: secrets in logs, PII, and diff fatigue must be planned for up front, and downstream captures should use allowlisted log shapes or structured fields rather than free-form dump capture.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Runtime_Artifacts_Panel.md

### DL-014: Shared provider-runtime actor envelope
The shared provider-runtime contract applies beyond Orchestrator: `Multi-Account.md` governs assistant, interviewer, requirements builder, PRD builder, overseers, node workers, and provider-backed chat/tool turns. Requested and effective `/model/effort/persona/auth/account`, `/effective` identity, provider-runtime selection reason, `/tool` context, and PRD/account lineage are shared runtime concepts. A first-class actor envelope is required for non-run auditability and replay: `Models_System.md` keeps provider/model/variant selection, `Prompt_Pipeline.md` carries `actor_kind` and `execution_role`, and `storage-plan.md` must not key provider account snapshots only by `run_id` when `/runtime` actors include assistant, interviewer, builders, overseers, and node workers.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Models_System.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md

### DL-015: Support decision drift and sharding settings
Supporting planning machinery is not exempt from decision traceability: `Plans/sharding_config.json` (`/sharding_config.json`) and `Plans/auto_decisions.jsonl` (`/auto_decisions.jsonl`) must not disagree on fallback `chunk-line` settings, because `/decision` state drift in support files can still corrupt owner/consumer reconciliation.

ContractRef: ContractName:Plans/DRY_Rules.md, ContractName:Plans/Decision_Policy.md

### DL-016: Governance labels, completion states, and copy boundaries
Canonical copy favors precise runtime and user-facing labels. Object/action labels include `Seams`, `Feature Seam`, `Work Package`, `Package Overseer`, `Seam Overseer`, `Locally Complete`, `Seam Complete`, `Completion Blocked`, `Weak Integration`, `Promotion Blocked`, `Promotion Revoked`, `Corroboration Requested`, `Challenge Accepted`, `Challenge Not Accepted`, `Advisory Concern Recorded`, `Graph Patch Requested`, `Graph Patch Applied`, and `Generation Updated`; `/labels`, `/action`, `/runtime`, and `/object` consumers must not invent alternate peer terms.

Governance semantics stay graph-owned: a `run` is the full canonical graph under deterministic runtime control, a `work package` is a coherent precomputed subgraph with a local overseer, a `feature seam` is a cross-package oversight scope, and a `node` is the smallest executable work unit. Overseers may critique or challenge package outcomes, but newly discovered work becomes explicit remediation nodes or graph-patch requests; `/corroboration` agents may be used before accepting high-impact, cross-package challenge gaps, and seam completion requires integration quality rather than package-local pass states alone.

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Decision_Policy.md

### DL-017: Seam visibility, weak integration, and reopen policy
Weak integration is not just a badge. Seams UI must summarize weak integration visibly and group concerns under readable headings such as Wiring, Workflow, State, GUI, and Design. Package issues roll up to seam concerns only when they cross package-to-seam, `/seam/user-visible`, or user-visible boundaries or affect seam completion truth. `Locally Complete`, `Available to Seam`, and `Seam Complete` remain distinct from `Lane to Package`, `Package to Seam`, and `Seam Completion` promotion boundaries.

Revocation and reopen semantics are explicit named states: `Promotion Revoked`, `Seam Completion Revoked`, `Reopened`, `Reopened by Patch`, and `Reopened by New Evidence`. Blocked states expose blocked reason, blocked owner, and recovery context. Weak-integration buckets include missing GUI representation of runtime/governance state, state-model mismatch across package boundaries, user-flow dead ends or partial affordances, contract drift, duplicated interpretation across packages, technically passing local checks while seam-level UX or architecture remains poor, GUI/runtime mismatch, incomplete end-to-end flow, cross-package state mismatch, local-pass/global-fail composition, missing degraded `/recovery` behavior, inconsistent UX semantics, cross-seam architecture drift, and invisible governance or missing operator affordances. `Decision_Policy` needs first-class policy objects and transitions for concerns, corroboration, promotions, and superseded `/revoked/reopened` states.

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Glossary.md

### DL-018: Approval anchoring and evidence-schema governance
Approval anchoring moves to canonical runtime identity: `run_id`, `node_id`, `blocked_sequence`, optional `attempt_id`, and execution-unit context refs supersede request-centric button copy, request-centric persistence language, and tier-boundary approval `CTA` framing in `Plans/human-in-the-loop.md` (`/human-in-the-loop.md`). Gate/evidence schema mismatch is a first-class governance defect, not just a tooling gap, and `/evidence` contracts must expose the defect as such.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Progression_Gates.md

### DL-019: Identity migration, help clusters, and retained cleanup
Worktree and graph approval identity must stop hanging on `tier_id`, request-centric `HITL`, or `request_id` payloads once blocked-episode runtime identity is available. Replace graph HITL command payload identity with blocked-episode anchored identity while preserving `Contracts_V0.md` / `Contracts_V0` compatibility notes for the request-centric-to-blocked-episode migration.

Corroboration disagreement handling uses the `2-of-3` rule: `2-of-3` accepts a high-impact claim as `/canonical`, no `2-of-3` means a high-impact claim is not accepted as blocking or canonical truth, and credible lesser concerns still emit a non-blocking `/minor` advisory visible on the Orchestrator page.

The help system must support related-link clusters for `Feature Seam` <-> `Work Package` <-> `Weak Integration` <-> `Seam Complete`, `Promotion` <-> `Revoked` <-> `Reopened`, `Corroboration` <-> `Concern` <-> `Review`, `Graph Patch` <-> `Generation Updated` <-> `Historical Path`, `Lane` <-> `Worktree` <-> `Cleanup Eligible` <-> `Archived/Removed`, and `Requested` <-> `Effective` <-> `Skipped/Clamped`; `/Clamped` and `/Removed` remain aliases only where explicitly documented.

Lane cleanup may transition into `retained` instead of immediate cleanup when recent completion is pending review or `/promotion`, weak integration remains under investigation, unresolved concern or corroboration is tied to lane outputs, or manual operator retention is active.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md
