  - what external side-effect identity or target context was in play
  - GitHub org/repo/workflow/job
  - Docker context/image/publish target
  - Kubernetes context/namespace/workload
  - other environment-specific target identities
- Those should not be collapsed into provider account identity because the same provider account may drive multiple operational targets, and the same operational target may be accessed by different provider accounts over time.

### Recommended minimum contract additions
- add `execution_role` to:
  - immutable runtime handoff bundle
  - `attempt.started`
  - `attempt_record`
  - worker identity/detail inspectors
- add `operational_identity?` to:
  - `attempt_record`
  - operational receipt/bridge records
  - relevant `tool.invoked` / `tool.denied` / runtime artifact payloads when side effects occur
- keep `effective_provider_identity` and `provider_identity` exactly what they already are:
  - provider-native disclosure metadata only
  - never actor-role or external-target identity

### Impacted docs
- `Plans/Contracts_V0.md`
- `Plans/storage-plan.md`
- `Plans/Multi-Account.md`
- `Plans/Prompt_Pipeline.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/usage-feature.md`
- likely UI consumers:
  - `Plans/Orchestrator_Page.md`
  - `Plans/Run_Graph_View.md`

### Contradictions / gaps surfaced
- `Orchestrator_Page.md` still uses a weak worker identity row (`requested_persona_id`, `effective_persona_id`, provider, model, attempt_id, session_id?`) that does not expose `execution_role` or operational target context.
- `usage-feature.md` is correctly account-aware, but it still has no place for execution-role disclosure even though runs from assistant/interview/builder/orchestrator share one schema.
- `Runtime_Artifacts_Panel.md` already needs canonical linkage into Source Control / GitHub / Docker / Usage, but it still lacks a normalized operational-identity field family.
- The provider/account snapshot fields are at risk of becoming a dumping ground for non-provider identity unless this split is made explicit.

### Candidate fixes to carry forward
- Make `execution_role` part of the canonical attempt packet in `Contracts_V0.md` and `storage-plan.md`.
- Define `operational_identity` as a separate optional field family for receipts, artifacts, and side-effect-bearing attempt/tool records.
- Update worker/detail surface docs so “worker identity” shows:
  - execution role
  - requested/effective runtime identity
  - operational target context when relevant
- Keep usage attribution schema shared across all run kinds, but permit execution-role display/filtering without creating a second usage system.

### Do-not-forget details
- `execution_role` and `operational_identity` solve different problems and should not be merged.
- Provider/account identity stays shared-runtime truth; operational identity stays side-effect/target truth.
- The strongest existing anchor for `operational_identity` is the receipt/bridge family, not the persona snapshot family.

## Research Progress - 2026-03-16 - Sonnet owner-doc tranche synthesis

### Targeted docs read
- `Plans/Commands_System.md`
- `Plans/Wiring_Matrix.md`
- `Plans/UI_Wiring_Rules.md`
- `Plans/Project_Output_Artifacts.md`
- `Plans/Glossary.md`
- `Plans/FileManager.md`
- `Plans/Crosswalk.md`
- `Plans/Decision_Policy.md`
- `Plans/Run_Modes.md`
- `Plans/Progression_Gates.md`
- `Plans/newtools.md`
- `Plans/assistant-memory-subsystem.md`

### Key findings
- The owner-doc tranche deepened from generic drift into hard SSOT-integrity failures across command registration, wiring verification, and dispatcher/runtime gating.
- `Commands_System.md`, `Wiring_Matrix.md`, and `UI_Wiring_Rules.md` now show a consistent command-contract break cluster:
  - `/compact` is absent from the reserved-name lists even though `cmd.chat.compact_context` already exists.
  - `Commands_System.md` falsely claims `cmd.chat.run_user_command` is registered and references phantom event `chat.message.submitted`.
  - `override_builtin` remains internally contradictory across AC-CMD02 / AC-CMD07 / AC-CMD10.
  - the git/actions prefix prohibition is prose-only and unenforceable by the named validation rules.
  - `Wiring_Matrix.md` still contains normative ghost IDs (`cmd.chat.branch_from_restore`) plus wider matrix/catalog drift, and `UI_Wiring_Rules.md` still lacks reverse coverage, stale/superseded ID states, dispatcher precondition fields, and projection-freshness/mutation gating hooks.
- `Project_Output_Artifacts.md`, `FileManager.md`, `newtools.md`, and `assistant-memory-subsystem.md` now form a stronger artifact/event/runtime-observability gap cluster:
  - `validation_pass_report.pass_verdict` still conflicts with downstream `skipped` behavior.
  - project artifact events are under-keyed relative to the canonical EventRecord envelope and still lack project/run/thread/wizard/account lineage.
  - `glossary` and execution-evidence style artifact types remain unregistered in the canonical artifact-type table.
  - `FileManager.md`'s addendum requires open-by-identity and generated non-repo drafts, but `OpenFile { path: PathBuf }` plus root-path validation cannot satisfy it; no `OpenArtifact`-style contract, no `evidence_by_attempt` projection, and no artifact-index freshness/degraded fallback exist.
  - `newtools.md` introduces uncataloged preview/build command IDs, unregistered `live.*` and doctor/custom-headless event families, and a conditional `CustomHeadlessTool` lifecycle with no canonical Tools/permissions owner.
  - `assistant-memory-subsystem.md` still promises persisted `memory.gist.*` style behavior without storage-plan registration, leaves AutoRunBoundary/AutoMilestone without observable lifecycle events, and specifies chat/Assistant handoff actions with no canonical `cmd.*` coverage.
- `Glossary.md` and `Crosswalk.md` remain structurally unsafe as owner docs:
  - multiple adjacent docs cite `Plans/Glossary.md §2` for `Overseer`, but no such entry exists.
  - `attempt` / `attempt_id`, `safe point`, `lane`, `work package`, and related rewrite-era vocabulary still have no Glossary owner.
  - Glossary's broad `effective state` wording now shadows the narrower requested/effective execution-identity model used elsewhere.
  - `Crosswalk.md` still has duplicate section numbering, a wrong `Primitive:` ContractRef, missing §2 index entries for appended primitives, and orphaned source-control/GitHub-actions/docker surfaces outside the normal routing structure.
  - rewrite-era primitives like `Seglog`, evidence-bundle style outputs, and capability-gating concepts still lack Crosswalk routing, so adjacent docs can cite primitives that Crosswalk cannot resolve.
- `Decision_Policy.md`, `Run_Modes.md`, and `Progression_Gates.md` sharpened from vague policy drift into implementation-blocking runtime-governance gaps:
  - `Decision_Policy.md` still lacks startup-recovery defaults, misstates retry ceilings in terms that collide with policy-prohibited derived fields, and leaves backoff plus manual/prerequisite resume ceilings unowned.
  - `Run_Modes.md` still does not resolve the Contribute(PR) vs DAE isolation conflict, DAE-jail durability across pause/resume, the `yolo` step-1 vs step-7 guard ambiguity, `external_publish_side_effect` behavior inside DAE, or mid-run account-switch invalidation of committed strategy.
  - strategy selection remains blind to per-account DAE eligibility and child-run account re-resolution ordering.
  - `Progression_Gates.md` contains duplicate addenda, unnumbered runtime/governance gate families, missing GATE-007 / GATE-008 placeholders, and a material collision where GATE-012 BLOCKED semantics collapse wizard `attention_required` and true wizard `blocked` escalation into the same gate state.
  - GATE evidence still cannot verify `attention_required` persistence because the storage/event family for that state remains unowned.

### Impacted docs
- Primary owners:
  - `Plans/Commands_System.md`
  - `Plans/Wiring_Matrix.md`
  - `Plans/UI_Wiring_Rules.md`
  - `Plans/Project_Output_Artifacts.md`
  - `Plans/Glossary.md`
  - `Plans/FileManager.md`
  - `Plans/Crosswalk.md`
  - `Plans/Decision_Policy.md`
  - `Plans/Run_Modes.md`
  - `Plans/Progression_Gates.md`
  - `Plans/newtools.md`
  - `Plans/assistant-memory-subsystem.md`
- Cross-owner docs repeatedly implicated by this tranche:
  - `Plans/UI_Command_Catalog.md`
  - `Plans/Contracts_V0.md`
  - `Plans/storage-plan.md`
  - `Plans/assistant-chat-design.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/Executor_Protocol.md`
  - `Plans/WorktreeGitImprovement.md`
  - `Plans/Multi-Account.md`

### Contradictions / gaps surfaced
- Command-system docs still allow ghost or stale IDs to survive across catalog, wiring, and chat surfaces without a canonical tombstone/deprecation model.
- Runtime mutation/recovery surfaces now depend on preconditions (`allowed_action_ids[]`, freshness/trust state, account/runtime capability) that the wiring/schema/gate stack still cannot express or verify.
- Artifact lineage now clearly requires project/run/thread/wizard/attempt/account anchors, but the project-artifact and memory/handoff surfaces still underspecify those joins.
- The repo still lacks a coherent owner for several rewrite-era operational nouns and primitives, so adjacent docs can cite terms (`Overseer`, `attempt`, `Seglog`, promotion senses, handoff kinds) that no SSOT doc actually defines.
- Runtime/governance verification is increasingly split between numbered gates and addendum prose, producing mandatory checks that are real in meaning but invisible to the gate registry and script-enforcement tables.

### Candidate fixes to carry forward
- Register/fix the missing command families and remove false catalog/wiring claims:
  - add or explicitly retire `cmd.chat.run_user_command`, `cmd.chat.branch_from_restore`, preview/build/open-artifact commands, Assistant/HITL handoff commands, and any other normative ghost IDs.
  - reconcile `/compact`, `/mode`, override_builtin semantics, and stale/superseded command-state handling across command-system, chat, catalog, and wiring docs.
- Extend the wiring/gate contracts so runtime-era gating is machine-verifiable:
  - add reverse matrix-to-catalog coverage, precondition/freshness/mutation-risk fields, stale-blocking policy, and explicit dispatcher obligations around allowed-action membership and correlation passthrough.
- Promote artifact/memory/live/runtime-observability records to full owner status:
  - align project-artifact events to EventRecord-level identity,
  - add missing artifact types,
  - define an `OpenArtifact`-style FileManager contract plus required supporting projections,
  - register `memory.*`, `live.*`, doctor/custom-headless, and handoff lifecycle events where they truly belong.
- Repair structural owner docs before downstream reconciliation work depends on them:
  - add missing Glossary entries for rewrite-era terms,
  - repair Crosswalk numbering/index/primitive routing,
  - collapse duplicate runtime/gate addenda into one numbered canonical section per owner.
- Close the runtime-governance owner gaps:
  - give startup recovery, backoff, counter ceilings, DAE/jail lifecycle, account-switch strategy invalidation, and wizard blocked-escalation semantics explicit homes in the policy/run-mode/gate docs rather than leaving them implied across addenda.

### Do-not-forget details
- This tranche is no longer just “supporting docs need cleanup.” Several owner docs are currently making false or unverifiable claims that would mislead later reconciliation or gate implementation.
- The biggest repeated pattern is that runtime-era concepts already exist in adjacent docs, but the owner docs for registration/verification/routing still lag behind them.
- Highest-risk docs for immediate later-model continuation remain:
  - `Plans/Commands_System.md`
  - `Plans/Wiring_Matrix.md`
  - `Plans/UI_Wiring_Rules.md`
  - `Plans/Project_Output_Artifacts.md`
  - `Plans/FileManager.md`
  - `Plans/Decision_Policy.md`
  - `Plans/Run_Modes.md`
  - `Plans/Progression_Gates.md`
  - `Plans/newtools.md`
  - `Plans/assistant-memory-subsystem.md`
  - with `Plans/Glossary.md` and `Plans/Crosswalk.md` still high-risk due to SSOT routing/term ownership failures.

## Research Progress - 2026-03-16 - Unified runtime/tool/artifact attribution packet

### Targeted docs read
- `Plans/Tools.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/storage-plan.md`
- `Plans/Contracts_V0.md`
- `Plans/usage-feature.md`
- spot-checks against `Plans/Orchestrator_Page.md`

### Key findings
- Tool events, runtime artifacts, receipts, and usage now want one shared attribution packet, but the docs still describe them as separate identity worlds.
- `Tools.md` still treats `tool.invoked` primarily as analytics data:
  - `tool_name`
  - `run_id`
  - optional `thread_id`
  - latency / success / error
- `Runtime_Artifacts_Panel.md` is stronger about canonical runtime identity, but its canonical ID set is still artifact-centric:
  - `artifact_id`
  - `run_id`
  - `thread_id`
  - `task_id`
  - `linked_artifact_id`
  - `logical_artifact_id`
- `storage-plan.md` is the strongest current anchor:
  - `attempt_record` already has `provider_attempt_ref?`
  - `orchestrator.receipt.{run_id}.{attempt_id}` already bridges Source Control / GitHub Actions / Docker / Kubernetes / Usage
  - `usage_record` already carries `run_id`, `attempt_id?`, `thread_id?`, and effective account/model/auth fields
- `Contracts_V0.md` already tightens `tool.denied` when scheduler state is affected, but `tool.invoked` and runtime-artifact docs still lag behind that attribution level.

### Recommended unified attribution packet
- one shared attribution family should be available to:
  - `tool.invoked`
  - `tool.denied`
  - `runtime_artifact.*`
  - runtime receipts
  - `usage_record` / `cost_usage`
  - relevant evidence / trace views

