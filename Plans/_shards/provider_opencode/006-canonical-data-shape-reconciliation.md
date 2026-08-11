# Shard 006: Canonical data-shape reconciliation

Source: `Plans/Provider_OpenCode.md`

Source lines: L64-L96

Source SHA256: `da910664ca195b0eb4ff2ca5c5e370531f7bf020d0f191d563619afce1bfe50e`

---

## Canonical data-shape reconciliation
### Required data shape

#### Acceptance carry-through
- Move OpenCode session IDs to provider-native correlation fields instead of canonical thread_id
- Define Approval Scope Key across actor/lane/run/account context and reuse it across permissions, HITL, doom-loop, and session approval caching
- In `## Canonical data-shape reconciliation` -> `### Required data shape`, require OpenCode session IDs to live in provider-native correlation fields and never replace canonical `thread_id`.
- Describe approval reuse through one `approval_scope_key` shared with permissions, HITL, doom-loop protection, and session approval caching.
- Define `approval_scope_key` over actor, lane/package/run, and account/server-profile context rather than provider session identity.

#### P5 OpenCode provider identity recovery requirements

- `Plans/assistant-chat-design.md` is healthier than the other three: - thread blocked-state addenda already align to blocked/runtime actions - per-thread usage is already one canonical detail surface - search/log APIs already key to `thread_id`, `run_id`, `message_id`, and `event_id` - remaining drift is concentrated around compatibility-era fields like `resume_url?` in blocked-notice persistence rather than broad ontology problems
- Codex confirmed the sharpest provider-side contract bug is still the **OpenCode `thread_id` collision**: - canonical `thread_id` remains PM correlation - OpenCode session ID is still being treated as if it were that canonical field - this must move into provider-native correlation before shared-runtime event joins become trustworthy
- The cross-cutting canonical runtime fields already exist elsewhere: - `Contracts_V0.md` and `Prompt_Pipeline.md` already own the requested/effective persona/platform/model/auth/account snapshot contract - `storage-plan.md` already owns canonical runnable identity through `run_id`, `node_id`, `attempt_id`, blocked projections, and attempt/runtime records - newer scheduler addenda already expect runnable-unit fields like `replan_generation`, `scheduler_lane`, and queue-analysis refs
- `Plans/Permissions_System.md` + `Plans/Provider_OpenCode.md` - still encode single-session/single-actor assumptions that break under shared provider runtime, multi-lane orchestration, and server-bridged transport
- Provider/runtime identity findings are still active: - `BinaryLocator_Spec.md` now has a sharper ownership gap around OpenCode launcher discovery and an explicitly dangling `Spec_Lock` naming-rule claim. - `Media_Generation_and_Capabilities.md`, `agent-rules-context.md`, and `Skills_System.md` all still under-specify caller scope, execution-role capture, identity disclosure, or currently-usable-vs-instance-enabled capability semantics. - `OpenCode_Coverage_Matrix.md` and `OpenCode_Deep_Extraction.md` now pin more exact OpenCode limits: session identity must stay provider-native, SSE correlation fields remain under-specified, and requested/effective identity parity is still weaker for server-bridged providers than for direct providers.
- Later addenda already require the stronger model: - `attempt_id` - `blocked_reason_code` - `allowed_action_ids[]` - `safe_point_id` - remediation lineage identifiers - `replan_generation` - queue-analysis and blocked-state rendering rules keyed to canonical runtime records
- `Provider_OpenCode.md` contains a direct identity-mapping bug at the contract level: - it maps canonical `thread_id` to an OpenCode session ID - while `CLI_Bridged_Providers.md` treats `thread_id` as the stable PM correlation id and separately allows provider-native identifiers - GPT-5.2 sharpened that OpenCode session IDs belong in provider-native correlation, not in canonical `thread_id`
- OpenCode limitations are now source-verified enough that they should be treated as hard architectural constraints unless the bridge changes: - `OpenCode_Deep_Extraction.md` sharpens the server-global SSE / fixed working-directory / session-scoped compaction and approvals / ephemeral session identity issues into direct PM obligations. - `Media_Generation_and_Capabilities.md` and `OpenCode_Coverage_Matrix.md` both show that caller-scoped identity and transient runtime capability state still lack proper request/event surfaces.
- `Plans/storage-plan.md` - `Plans/Glossary.md` - `Plans/Contracts_V0.md` - `Plans/FinalGUISpec.md`
- `Plans/GUI_Rebuild_Requirements_Checklist.md` - `Plans/LSPSupport.md` - `Plans/Media_Generation_and_Capabilities.md`
- `Plans/GUI_Rebuild_Requirements_Checklist.md` - `Plans/LSPSupport.md` - `Plans/Media_Generation_and_Capabilities.md`
- `Plans/GUI_Rebuild_Requirements_Checklist.md` - `Plans/LSPSupport.md` - `Plans/Media_Generation_and_Capabilities.md`
- `Plans/GUI_Rebuild_Requirements_Checklist.md` - `Plans/LSPSupport.md` - `Plans/Media_Generation_and_Capabilities.md`
- `Plans/Orchestrator_Page.md` + `Plans/Run_Graph_View.md` - still cannot faithfully render the runtime identity bundle or pivot by the newer attempt/receipt/usage anchors
- `Runtime_Artifacts_Panel.md` calls `artifact_id`, `run_id`, `thread_id`, `task_id`, `linked_artifact_id`, and `logical_artifact_id` the canonical ID set, but that set is still missing the attempt-native/runtime attribution fields the rest of the rewrite now depends on.
- The docs imply multiple identity families that must stay distinct: - conversation identity: - `thread_id` - wizard/builder identity: - `wizard_id` - builder stage/run ids - bundle/review ids - orchestration identity: - `run_id` - package/seam/node ids - attempt ids
- `thread_id`, `wizard_id`, bundle/review ids, and orchestration `run_id`/attempt ids must remain linkable but distinct
- Add `actor_kind` / `execution_role` and actor-scoped refs to the shared runtime identity bundle, snapshots, and handoff objects.
- `Runtime_Artifacts_Panel.md` is stronger about canonical runtime identity, but its canonical ID set is still artifact-centric: - `artifact_id` - `run_id` - `thread_id` - `task_id` - `linked_artifact_id` - `logical_artifact_id`
- `chain-wizard-flexibility.md` already carries `project_id` in the assistant-to-wizard payload, but `interview-subagent-integration.md` still shows `thread_id: None` in concrete orchestration/crew paths that should likely preserve thread correlation.
- OpenCode still exposes transport platform/model without clear ownership of upstream provider/account identity.
