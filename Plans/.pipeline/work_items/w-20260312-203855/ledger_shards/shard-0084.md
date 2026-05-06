## Research Progress - 2026-03-17 - owner-contract seam: storage-plan mixed runtime eras

### Targeted docs read
- `Plans/storage-plan.md`

### Key findings
- `Plans/storage-plan.md` still mixes two runtime eras in the same canonical storage owner:
  - stronger runtime-native pieces:
    - `blocked_projection.{run_id}.{node_id}.{blocked_sequence}`
    - `attempt_record`
    - `scheduler_pass_record`
    - `preview_subject_id = doc:<document_id> | artifact:<artifact_id>`
  - stale tier-era and request-era pieces:
    - event tables keyed to `tier_id`
    - `run.tier_started`, `run.tier_completed`
    - `hitl.approval_requested`, `hitl.approved`, `hitl.rejected`, `hitl.cancelled` with `request_id`, `tier_id`, `tier_type`, `allowed_actions`
    - `tier_runtime_record`
    - `usage_record` keyed by `run_id`, `tier_id`, `attempt_id?`, `usage_sequence`
    - `evidence_record` keyed by `run_id`, `tier_id`, `evidence_id`
- The doc is already ahead on identity in some places:
  - `preview_subject_id` gives a strong subject-first restore identity
  - `orchestrator.receipt.{run_id}.{attempt_id}` is attempt-native
  - provider-account policy and requested/effective identity fields are closer to the rewrite direction than several consumer docs
- The doc is still behind on storage-family ownership in other places:
  - no named `route_target` / `OpenSubject` contract tie even though subject-first preview identity already exists
  - no first-class `worktree_record` / `lane_record` family even though Orchestrator and Source Control now depend on durable lane/worktree lifecycle
  - runtime artifacts and project attention/summary families still remain unevenly owned

### Impacted docs
- Primary doc:
  - `Plans/storage-plan.md`
- Adjacent owners implicated:
  - `Plans/Contracts_V0.md`
  - `Plans/usage-feature.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/Run_Graph_View.md`
  - `Plans/Runtime_Artifacts_Panel.md`
  - `Plans/FileManager.md`
  - `Plans/WorktreeGitImprovement.md`

### Contradictions / gaps surfaced
- Storage already has the stronger blocked and attempt identities, but still preserves tier-era keys as peer canonical records.
- Preview restore identity is subject-first, while the broader route/open owner docs still do not define the named route/open primitives that would explain it consistently.
- Usage and Evidence remain tied to `tier_id` in the canonical storage owner, which keeps recreating the same drift in Usage, Graph, and Orchestrator consumers.

### Candidate fixes to carry forward
- Reconciliation should normalize `storage-plan.md` around:
  - attempt-native runtime records
  - blocked projections keyed by blocked episode identity
  - subject-first restore identity
  - receipt records for cross-surface joins
- `tier_runtime_record`, tier-keyed `usage_record`, and tier-keyed `evidence_record` need owner-level demotion or replacement.
- Storage family ownership still needs explicit additions for:
  - lane/worktree lifecycle
  - artifact indexing
  - project summary / attention
  - account pressure / switch history

### Do-not-forget details
- `storage-plan.md` is not just a stale consumer. It is still publishing canonical key shapes. Any unresolved tier-era key there will keep propagating into other docs.
- The doc already proves that subject-first identity is viable through `preview_subject_id`; route/open ownership should align to that instead of inventing a second identity model.


## Research Progress - 2026-03-17 - owner-contract seam: Prompt Pipeline scope and runtime identity drift

### Targeted docs read
- `Plans/Prompt_Pipeline.md`

### Key findings
- `Plans/Prompt_Pipeline.md` already uses the stronger canonical runtime field names:
  - `requested_persona`
  - `effective_persona`
  - `requested_account_policy`
  - `effective_account_id`
- But the owner doc still frames those fields through stale scope vocabulary:
  - `Run envelope (tier, mode, selected Persona ID(s), selected model/variant)`
  - `Active mode and tier`
  - `plan_or_tier_default`
  - `Orchestrator tier override`
  - `stage/tier/task/repo context`
  - `persona_override_owner_id` still allows `tier_id`
- The effective-resolution record is close to the rewrite direction, but it still lacks the newer identity layers already established elsewhere:
  - `execution_role`
  - operational identity / side-effect target identity
  - requested concrete account binding fields
- The addenda already move toward attempt-native handoff identity:
  - immutable attempt handoff bundle
  - `run_id`, `node_id`, `attempt_id`
  - `scheduler_pass_id`
  - lineage metadata
- That means the main owner gap is no longer field names first. It is scope and owner identity.

### Impacted docs
- Primary doc:
  - `Plans/Prompt_Pipeline.md`
- Adjacent owners implicated:
  - `Plans/Contracts_V0.md`
  - `Plans/storage-plan.md`
  - `Plans/Multi-Account.md`
  - `Plans/Executor_Protocol.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/Run_Graph_View.md`

### Contradictions / gaps surfaced
- The owner doc says runtime identity is canonical, while still anchoring key override and selection concepts to `tier`.
- The handoff addenda already assume attempt-native execution identity, but the core narrative still teaches tier-centric scope resolution.
- The runtime identity model across the rewrite now needs more than Persona/model/account disclosure. It also needs execution-role and operational-identity disclosure, and this owner doc has not caught up yet.

### Candidate fixes to carry forward
- Reconciliation should keep the field names that are already correct and replace the stale scope model under them:
  - demote `tier` wording to compatibility or derived decomposition context
  - align override ownership with run/node/attempt and actor-role semantics
  - extend the effective-resolution and handoff records to the newer identity layers already established in research
- `persona_override_owner_id` needs owner-level cleanup so it no longer teaches `tier_id` as a canonical scope anchor.

### Do-not-forget details
- `Prompt_Pipeline.md` is upstream of requested/effective identity disclosure across chat, builders, Orchestrator, and storage. Scope drift here will keep leaking everywhere else.
- This seam is about ownership and scope, not renaming `requested_persona` back into older field families. The field names are already mostly right.


## Research Progress - 2026-03-17 - rewrite-root and GUI-drift seam: rewrite tie-in memo, UI command catalog, Final GUI spec

### Targeted docs read
- `Plans/rewrite-tie-in-memo.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/FinalGUISpec.md`

### Key findings
- `Plans/rewrite-tie-in-memo.md` is comparatively ahead on provider/runtime identity:
  - Gemini requested/effective auth/account identity is already framed correctly
  - Slint rewrite, seglog/redb/Tantivy, and Provider terminology are already locked
  - subject-first preview identity is already present through `doc:<document_id>` and `artifact:<artifact_id>`
- But the rewrite-root memo still does not route several major rewrite decisions that now exist in research:
  - graph-owned `Feature Seam` / `Work Package`
  - `Package Overseer` / `Seam Overseer`
  - `route_target` / `OpenSubject`
  - `projection_freshness` / `projection_health`
  - blocked-episode identity over request-centric HITL identity
- `Plans/UI_Command_Catalog.md` is still publishing hard stale command canon:
  - `cmd.graph.approve_hitl` and `cmd.graph.deny_hitl` still exist with `request_id`
  - the same file later defines canonical `cmd.runtime.*` recovery commands keyed by `run_id`, `node_id`, and `blocked_sequence`
  - many routed cross-surface commands still say `layout/UI state only` even when they clearly target canonical object navigation:
    - `cmd.chat.open_thread_usage`
    - `cmd.chat.focus_thread_usage`
    - `cmd.source_control.select_worktree`
    - `cmd.artifacts.show_in_ledger`
    - `cmd.artifacts.show_in_usage`
    - `cmd.orchestrator.open_in_source_control`
  - widget commands still say `Orchestrator widget tabs`, which conflicts with the rewrite direction that only `Progress` remains widget-composed in Orchestrator
- `Plans/FinalGUISpec.md` is still one of the strongest GUI drift amplifiers:
  - view inventory still lists `Tiers` as a primary view
  - dashboard/current-task language still uses current tier / phase-task-subtask progress bars as if that were the canonical Orchestrator model
  - `wizard_attention_required` still treats `resume_url` as the primary navigation object
  - section `7.7 Tiers` still exists as a primary content surface
  - Appendix C still expands widgetization around Dashboard and references `Orchestrator tabs` through the widget system
  - the Settings tab inventory still includes `Tiers` and tier-oriented settings language

### Impacted docs
- Primary docs:
  - `Plans/rewrite-tie-in-memo.md`
  - `Plans/UI_Command_Catalog.md`
  - `Plans/FinalGUISpec.md`
- Adjacent owners implicated:
  - `Plans/Contracts_V0.md`
  - `Plans/Crosswalk.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/Widget_System.md`
  - `Plans/Run_Graph_View.md`
  - `Plans/storage-plan.md`

### Contradictions / gaps surfaced
- The rewrite-root memo already locks provider/runtime architecture, but it does not yet record the newer Orchestrator/routing/projection decisions that downstream GUI docs now need.
- `UI_Command_Catalog.md` contains both the stale graph-HITL command family and the newer canonical `cmd.runtime.*` family in the same file.
- `FinalGUISpec.md` still turns stale Orchestrator ontology into visible product structure, which then re-amplifies drift into widgets, settings, dashboard copy, and route handling.

### Candidate fixes to carry forward
- Reconciliation order for this seam should be:
  - `rewrite-tie-in-memo.md` first as rewrite-root routing
  - `UI_Command_Catalog.md` second for command-family cleanup
  - `FinalGUISpec.md` third for visible shell/view cleanup
- `rewrite-tie-in-memo.md` needs explicit rewrite-root routing for:
  - Orchestrator graph/seam/package governance model
  - route/open primitives
  - projection freshness/health vocabulary
  - blocked/runtime approval identity
- `UI_Command_Catalog.md` needs:
  - removal or demotion of graph-local HITL approval commands
  - normalization of routed object pivots away from `layout/UI state only`
  - widget command hosting language aligned to `Progress` only inside Orchestrator
- `FinalGUISpec.md` needs:
  - `Tiers` retired as a primary view
  - `resume_url` reduced to transport, not first-class navigation identity
  - dashboard and settings language brought in line with the graph/seam/package model

### Do-not-forget details
- `FinalGUISpec.md` is one of the most dangerous drift multipliers because it turns stale ontology into user-visible structure.
- `UI_Command_Catalog.md` now has a direct same-file contradiction between graph-HITL commands and canonical runtime recovery commands.
- `rewrite-tie-in-memo.md` is mostly ahead, which makes it a strong place to record the missing rewrite-root decisions rather than inventing another owner doc.


