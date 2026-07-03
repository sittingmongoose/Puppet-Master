# Shard 004: Provider/model precedence and settings resolution

Source: `Plans/Models_System.md`

Source lines: L32-L199

Source SHA256: `66d19758732f76d6a0917667f9ec80f09fdf8d5dfb3aa73042f7f03558b2e47b`

---

## Provider/model precedence and settings resolution


### Scope and owner boundaries

This section is the single owner section for provider/model precedence across run, seam, package, node, overseer, and delegated-subagent scope.

- Parallel-node worktree assignment may narrow the allowed provider/model surface for a node, but it does not replace the requested-versus-effective resolver record.
- Ownership transitions between overseer and delegated-subagent levels must stay in this owner section so later addenda elaborate the policy without replacing the canonical resolver contract.

### Three-axis settings model

Settings resolution is always described on three axes:
- `source`: where a candidate value came from (`manual_override`, `persona_preference`, `surface_default`, `scope_policy`, `config_default`, `provider_default`).
- `request`: the value explicitly requested for this run or child run.
- `execution`: the value actually handed to the selected provider/runtime after capability checks, worktree assignment, and policy gating.

The display grammar MUST preserve the distinction between requested and effective values for provider, model, variant, effort, auth mode, and account identity.

### Deterministic precedence by scope

The canonical precedence chain is:
1. explicit run-envelope override
2. scoped owner policy for the active execution unit (`run`, `seam`, `package`, `node`, `overseer`, or delegated subagent)
3. Persona preference
4. surface or stage default
5. project or global config default
6. last-used state where the surface explicitly permits it
7. provider default

Rules:
- the same inputs and availability set MUST produce the same effective result
- scope-specific policy MAY narrow or pin provider/model choices, but it MUST still emit requested versus effective values
- parallel-node worktree assignment participates in precedence when a worktree owner constrains the allowed provider/model surface for that node
- ownership transitions between overseer and delegated-subagent levels MUST emit a fresh resolver record instead of silently inheriting stale effective state

### Resolver inputs and emit shape

Resolver inputs MUST include:
- requested Persona and run-envelope overrides
- surface/stage defaults
- scope owner policy (`run`, `seam`, `package`, `node`, `overseer`, delegated-subagent)
- capability snapshot and model metadata
- account/profile availability
- worktree assignment and execution-role context
- permission ceiling and mutation policy

The resolver MUST emit one shared record containing at least:
- `requested_platform`, `effective_platform`
- `requested_model`, `effective_model`
- `requested_variant`, `effective_variant`
- `requested_auth_mode`, `effective_auth_mode`
- `requested_account_id?`, `effective_account_id?`
- `execution_role`
- `selection_reason`
- `resolver_matrix_entry`
- `worker_policy_display`
- `skipped_persona_controls[]`

That emit shape is consumed by runtime snapshots, inspectors, and owner transitions; later sections in this document elaborate, but do not replace, this owner section.

Provider/model concern surfaces share the concern lifecycle vocabulary used by runtime owners: `active`, `acknowledged`, `resolved`, and `dismissed` remain separate states; `resolution_kind` includes `accepted_risk`; and any concern-action confirmation matrix must disclose whether model/provider selection may proceed, block, retry, or require user confirmation. `Plans/GUI_Rebuild_Requirements_Checklist.md` consumes those first-class concern lifecycle and lineage requirements without becoming the provider/model owner.

Dispatch context and worktree precedence are part of this owner section. `DispatchContext.provider_id`, `model_id`, and provider/model precedence must cover run, seam, package, node, overseer, delegated-subagent, parallel-node worktree assignment, and ownership transitions. `Plans/Executor_Protocol.md`, `Plans/WorktreeGitImprovement.md`, `Plans/orchestrator-subagent-integration.md`, and `Plans/Crosswalk.md` consume this policy, including `/persona/surface/default` compatibility wording, but do not replace it.

Node execution settings use requested-vs-effective disclosure across `/model/effort/persona`, `/model/effort`, `/settings`, `/type`, runtime-model policy, node-worker policy, and per-node execution. `feature seam`, `work package`, node, work-package overseers, and overseer-spawned subagents may each carry provider/model/effort defaults and overrideability; auto-selected defaults may use `/easiest` policy only when it is explicit in the resolver record. package-based worktrees require `/ordering` and lane rules for dependent-node execution, and safe-point-like state handoff must remain tied to the canonical safe-point contract.

Run Graph consumers must map worker and /verifier identity back to the requested/effective snapshot. `Plans/Run_Graph_View.md` / `/Run_Graph_View.md` may display `Provider / Model`, `worker_provider`, `worker_model`, `verifier_provider`, and `verifier_model`, but those are compatibility labels over the canonical `/effective` provider/model record.

GitHub and project account context are separate selection inputs: `GitHub_Integration`, `GitHub_Integration.md`, `storage-plan`, and `storage-plan.md` consume current-repo, current-account, selected_repo_id, and project-scoped account policy state without moving the provider/model precedence owner out of this document.

Adjacent owner references repeatedly implicated in provider/model cleanup include `Plans/FinalGUISpec.md`, `Plans/storage-plan.md`, `Plans/Multi-Account.md`, `Plans/Widget_System.md`, `Plans/Prompt_Pipeline.md`, `Plans/Executor_Protocol.md`, `Plans/Orchestrator_Page.md`, `Plans/Provider_OpenCode.md`, `Plans/UI_Command_Catalog.md`, `Plans/Permissions_System.md`, `Plans/CLI_Bridged_Providers.md`, `Plans/assistant-chat-design.md`, `Plans/Project_Output_Artifacts.md`, `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`, `Plans/Tools.md`, `Plans/Glossary.md`, and `Plans/Personas.md`; they are consumers or adjacent owners, not substitutes for this provider/model precedence section.

Runtime/storage identity fields must keep `Plans/Contracts_V0.md`, `Plans/Orchestrator_Page.md`, `/Contracts_V0.md`, and `/Orchestrator_Page.md` aligned: `requested_persona` and `effective_persona` are canonical, `_id` variants are compatibility labels, and `/runtime/storage` account fallback fields must not disappear from requested/effective disclosure.

Owner-of-owners cleanup is implementation-relevant: 00-plans-index.md, plans-index, Decision_Log, Decision_Log.md, rewrite-tie-in-memo, rewrite-tie-in-memo.md, feature-list, feature-list.md, newfeatures.md, addendum-to-plan-map, SSOT rows, highest-value owner-of-owners routing, promoted-feature phasing, `/packages/lanes/overseers`, `/tab`, tier-era execution, `/effective` identity, and rewrite-critical contracts must not amplify drift for provider/model selection.

Run Graph event-update vocabulary is historical input only. `Plans/Run_Graph_View.md` / `/Run_Graph_View.md` event-update rows such as `TierChanged`, `IterationStart`, `GateStart`, `GateComplete`, `UserInteractionRequired`, and `EvidenceStored` must be mapped to current execution-unit and requested/effective model events before they drive provider/model UI.

Provider account snapshots are runtime-wide. `storage-plan` and `storage-plan.md` must model durable provider account snapshots for runs and for other actor classes that use the same provider runtime, not only the run actor class.

Resolver selection reason text is concise but structured. Standard explanation snippets include `Package overseer default`, `Seam integration default`, `Node implementation match: Rust + backend`, `Review pass default`, `Recovery actor default`, and `Provider fallback from preferred persona model`.

Requested/effective runtime identity uses the `requested_*` and `effective_*` field families as canonical cross-system IDs. `Contracts_V0`, `Contracts_V0.md`, `_id` compatibility fields, and `/runtime` consumers may expose those IDs, but they must not collapse requested, effective, account, provider, model, execution role, or operational identity into one value.

Provider IDs and model IDs remain explicit in effective snapshots: `anthropic/` namespace prefixes, `provider_id: cursor`, `provider_id`, `model_id`, and `/effective` values are retained as data, not rewritten into display-only names.

Pre-run chain configuration keeps isolation explicit. `Plans/chain-wizard-flexibility.md` / `/chain-wizard-flexibility.md` consumers may expose `pre-run` setup, but `/isolation` remains part of the model/runtime selection record when it affects provider or execution behavior.

Storage-backed model selections are canonical-record entries. `Plans/storage-plan.md` / `/storage-plan.md` must preserve the durable selection record rather than treating model choice as transient UI text.

Model selection surfaces expose `Workers`, `Providers & Models`, `Execution Identity`, and `HITL` as first-class labels. `/model`, multi-account context, orchestrator-only recovery, `Recovery`, and `Governance` states may drive those surfaces, but the labels must stay tied to the shared model owner contract.

Node and package settings must preserve `node-effective` and `overseer-effective` snapshots when graph-patch-triggered work changes provider behavior. `/package/node`, provider-model, overseer-controlled, `/model`, `/config`, `/review`, and delegated-subagent records all resolve through the same requested/effective model contract.

Execution object copies are execution-object-level records, not loose GUI hints. The GUI must not-forget node-worker and `/model` ownership when it renders or copies provider/model state for execution objects.

Legacy tier-scoped references from `Plans/feature-list.md`, `Plans/00-plans-index.md`, `/feature-list.md`, `/00-plans-index.md`, and feature-list material are compatibility inputs only and cannot override the current provider/model owner contract.

Resolution receipts may preserve exact explanatory labels such as `Requested model: claude/sonnet`, `Effective model: claude/sonnet`, `Reasoning effort: requested high -> skipped`, `/sonnet`, `Inherited from Project policy`, `Overridden by Package override`, and `Reason: provider does not support effort on this model`; those labels describe the /source of a requested/effective decision rather than becoming a separate resolver schema.

Provider integration references across `Plans/Provider_OpenCode.md`, `Plans/Permissions_System.md`, `Plans/CLI_Bridged_Providers.md`, `/Provider_OpenCode.md`, `/Permissions_System.md`, and `/CLI_Bridged_Providers.md` remain adjacent implementation surfaces for model/provider execution.

Cross-system account rows marked already-canonical must keep `Models_System`, `Models_System.md`, `/account`, and cross-system provider/account behavior aligned with this owner contract.

Adjacent UI and persona compatibility references preserve both full paths and legacy aliases for `Plans/FinalGUISpec.md`, `Plans/storage-plan.md`, `Plans/Orchestrator_Page.md`, `Plans/Personas.md`, `/FinalGUISpec.md`, `/storage-plan.md`, `/Orchestrator_Page.md`, and `/Personas.md`.

Blocked model/runtime state records preserve `blocked_reason_code = waiting_approval` without losing `tier_id`, `tier_type`, `request_id`, `blocked_sequence`, `waiting_approval`, `human-in-the-loop`, `blocked_reason_code`, `human-in-the-loop.md`, or blocked-episode context.

Selection and execution receipts keep three trace axes distinct: execution/result axis, source axis, and request axis. For example, `/result`, `/attempt`, `/runtime`, and `/skipped/clamped` values describe the receipt location and skip/clamp outcome rather than redefining model identity.

Multi-account and persona compatibility references preserve `Plans/Multi-Account.md`, `Plans/Orchestrator_Page.md`, `Plans/Personas.md`, `/Multi-Account.md`, `/Orchestrator_Page.md`, and `/Personas.md` when provider/account context is displayed beside model selection.

Runtime artifact panels may expose `Runtime_Artifacts_Panel`, `Runtime_Artifacts_Panel.md`, `Show in Usage`, and `Show in Ledger`, but those labels are views over the provider/model snapshot and receipt state.

Help and explanation copy must preserve copy-depth and concept-governance metadata. `Personas.md`, `Models_System`, `Models_System.md`, `FinalGUISpec.md`, `/help`, authored-copy, `Expert`, and `ELI5` outputs may simplify presentation, but they must not simplify the underlying provider/model contract.

Executor integration requires execution-scoped provider/model context. `Plans/Executor_Protocol.md`, `/Executor_Protocol.md`, `/runtime`, `/executor`, and execution-unit identity are the minimum anchors for dispatch, retry, blocked handling, and receipts.

Cost and receipt views must remain canonical. `/Ledger`, deep-link targets, `cost_usage`, and artifact-local UI state must resolve to shared Usage/Ledger identity instead of creating artifact-local cost or receipt models.

Repository-wide catalog references may cite `Plans/*.md`, top-level plan coverage, and the current `61` plan-file inventory, but those references do not move provider/model ownership out of this document.

Execution settings preserve distinct execution-settings defaults and overrides for run/global context, feature seams, work packages, nodes, work-package overseers, feature-seam overseers, and overseer-delegated node workers. `/model`, `/global`, and `/override` values all remain visible as requested/effective provider/model state.

Node worker policy is dynamic-by-default from node scope and `/type`. node-worker, `/package/node`, per-node, and `/model/effort` settings are configuration inputs, not ad hoc per-node manual model names.

Delegation policy remains explicit. delegation-policy settings decide whether overseers may use subagents for node work and, if allowed, which provider/model policy governs delegated node workers.

Lifecycle transitions require an event model: the event that causes each state transition must be represented with the execution-unit, provider/model snapshot, blocked-state, and receipt identity that made the transition valid.

The legacy four-tier hierarchy from newfeatures.md and the canonical chain-wizard-flexibility / chain-wizard-flexibility.md node-graph model are incompatible execution models; compatibility text must name four-tier and node-graph explicitly instead of blending them.

Simple help must simplify explanation, not rename the model: canonical names stay stable, ELI5 mode explains them more plainly, and friendly labels cannot create parallel object names that drift away from contracts.

Interview routing keys must reject duplicated phase words: interview-phase-phase and interview-phase-phase-* are routing-key bugs, not alternate model identifiers.

Route-target records must make resume_url concrete. A route-target may point back to a resume_url, but the resolver still records the target owner and route reason.

Tab identity is scoped. `tab_id` must not be reused for side-panel subviews, browser tab IDs, workspace tab IDs, widget slots, or compare-target variants.

Runtime-control support receipts use explicit support chips or rows: `Temperature: 0.2 -> Honored`, `Top-p: 1.0 -> Clamped to 0.9`, and `Reasoning effort: High -> Skipped` are display labels over the requested/effective model capability check.

Artifact-opening surfaces consume the same subject-open resolver. Runtime_Artifacts_Panel, Runtime_Artifacts_Panel.md, subject-open, artifact-bearing, and artifact-opening state do not create bespoke provider/model opening rules.

Model selection can be lane-aware when lane policy requires it. lane-level, security-focused, lane-aware, package-level, and `/graph` constraints must be represented in the model binding if a lane enforces a provider/model.

Worktree visibility records may expose `/worktree/branch/tier` and `/lane`, but package/lane ownership, contamination, restore eligibility, and promotion posture must not stop at legacy tier status.

Scope labels must distinguish app, project, surface, role, seam, package, node, manual, turn, session, run, task, and subagent sources. `/session/run/task/subagent` and `/package/node` are explicit override scopes.

Provider/model settings are never single-project by assumption: runtime-affecting overrides may be app, project, `/per-package`, seam, `/package/seam/node`, overseer, or delegated-subagent scoped, and the resolver must preserve the scope that selected or constrained the value.

The owner-doc cleanup rule is strict: if anchor tables, `/body` prose, addenda, or compatibility examples leave old and new provider/model models both canonical in the same surface, this document must collapse the split-brain rule into one requested/effective resolver statement instead of treating audit value-add wording as product canon.

Concern and `/corroboration` state for provider/model selection is operational, not surface-level decoration. Execution-core owners must record whether concern evidence changes selection, blocks execution, permits accepted risk, or only annotates the requested/effective receipt.

Routing, `/registry/governance`, and provider/model ownership contradictions stay with this owner-doc until resolved; adjacent docs may consume registry or routing outcomes, but they cannot define a second provider/model authority.

Planning and `/output` surfaces consume the same subject-open model as artifact-opening flows. file-opening documentation may realize a chosen subject, but it must not replace the shared subject-open resolver or create provider/model-specific open rules.

Transport-vs-upstream identity remains visible: vs-upstream provider/runtime examples must disclose whether `/runtime` identity belongs to the transport wrapper or the upstream provider.

Executor compatibility keeps `Executor_Protocol`, `Executor_Protocol.md`, `/seam`, `/execution`, execution-unit, and TierContext references mapped to the current execution-unit context and package/seam overseer governance model.

GUI/help labels keep expert and canonical terms stable. GUI, `/Expert`, `/help`, `/loaded`, and `/canonical` views may simplify loaded terms, but canonical names remain the source of truth.

Tier-native ingestion and active-agent tracking are legacy compatibility inputs. tier-native, active-agent, lane-aware scheduling, and worktree tracking must resolve through package/lane ownership rather than reviving tier-native execution semantics.
