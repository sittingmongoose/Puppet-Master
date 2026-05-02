    - 3-level reversibility taxonomy
    - action-family → confirmation mapping
    - orchestration-specific undo/compensating-action label policy

#### Export / settings / persona transfer gaps are broader than first summarized
- `Plans/Orchestrator_Page.md`, `Plans/storage-plan.md`, `Plans/FinalGUISpec.md`, `Plans/Models_System.md`, `Plans/Multi-Account.md`, `Plans/Personas.md`, `Plans/Prompt_Pipeline.md`
  - The rerun confirms additional concrete misses:
    - three-way export taxonomy (`record` / `bundle` / `view`)
    - shared Orchestrator export manifest contract
    - export-family distinctions (Evidence / Artifact / Ledger / Run / Record)
    - three-axis settings model (`source` / `request` / `execution`)
    - named display grammar (`Inherited from`, `Overridden by`, `Requested`, `Effective`, `Reason`, `Support`)
    - explicit source-layer enumeration
    - worker-policy display under the same requested/effective grammar
    - Orchestrator actor-type and operation-type resolver inputs
    - deterministic resolver matrix and actor→persona defaults
    - resolver emit shape (ranked candidates, winner, fallback reason)

#### Help / project status / escalation transfer gaps sharpened
- `Plans/FinalGUISpec.md`, `Plans/Glossary.md`, `Plans/Orchestrator_Page.md`, `Plans/storage-plan.md`, `Plans/usage-feature.md`
  - The rerun confirms that these were not just vague "help gaps", but concrete missing contracts:
    - three-part help-system architecture
    - dedicated help-entry template
    - related-concept linking clusters
    - project `activity_state` enum
    - project `attention_state` enum
    - blocked-owner 8-kind taxonomy
    - primary attention reason field
    - pressure-summary field
    - explicit 5-level escalation ladder
    - surface ladder mapping
    - resurfacing / aging rules
    - persistent-blocker semantics at the UI layer

#### Route / bridge / normalization misses remain refinement-heavy but are more specific now
- `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, `Plans/UI_Command_Catalog.md`, `Plans/Crosswalk.md`, `Plans/Wiring_Matrix.md`, `Plans/Progression_Gates.md`, `Plans/FileManager.md`, `Plans/Project_Output_Artifacts.md`
  - The rerun reinforces earlier route findings and sharpens them:
    - bridge-field precedence still missing from `Contracts_V0.md`
    - timestamp/run/thread fallback still not marked compatibility-only
    - storage-plan still lacks the practical join model from attempt → provider → usage → receipt
    - `Crosswalk.md` still lacks `Primitive:RouteTarget` / `Primitive:OpenSubject` in the primitive index
    - `Wiring_Matrix.md` still cannot structurally express wrapper/canonical normalization or route-aware fields
    - GATE-010 text improved, but the supporting evidence schema/matrix model still lags
    - `Contracts_V0.md` still lacks the late refinement layer: selector precedence order, reject rules, closed `tab_id` vocabulary, scoped resolver rules, route examples, ref-family split
    - `resume_url` demotion rule exists, but stale consumer docs still treat it as a primary behavioral field

#### Identity / attribution / blocked-policy misses were reconfirmed with stronger specificity
- `Plans/Prompt_Pipeline.md`, `Plans/Contracts_V0.md`, `Plans/Tools.md`, `Plans/GitHub_API_Auth_and_Flows.md`, `Plans/orchestrator-subagent-integration.md`, `Plans/Architecture_Invariants.md`, `Plans/Run_Modes.md`, `Plans/Executor_Protocol.md`, `Plans/human-in-the-loop.md`, `Plans/usage-feature.md`
  - The rerun confirms additional concrete misses:
    - `execution_role` absent in many key owner/consumer docs
    - `requested_account_id` absent where the ledger expects it
    - `operational_identity` only partially transferred
    - account-switch / pressure families named but still under-owned at the contract level
    - `blocked_sequence` minting ownership still missing
    - startup recovery handshake still incomplete
    - DAE jail / approval policy gaps remain untransferred
    - usage still lacks real switch-history / execution-role follow-through

### Important corrections and exclusions preserved by the rerun
- The chunked recheck **did not** re-open the already-correct false-positive exclusions:
  - `route_target`, `OpenSubject`, `command_kind`, `normalizes_to_contract`, `target_kind`, `object_kind`, and `inspector_target` remain confirmed as already landed.
  - `projection_freshness` / `projection_health` still exist; the missing transfer is the operational trust UI/gating/fallback layer.
  - account-pressure and account-switch key families remain present; the missing transfer is schema and contract ownership, not simple existence.
- One subtle refinement from the Opus rerun:
  - some earlier baseline framing implied a fully new trust-state model was missing; the stronger reading is that the **operationalization** of trust states is missing, not the base freshness/health model itself.

### Net result of the rerun
- The rerun found **more concrete transfer misses**, especially in:
  - widget/event/alert detail
  - historical/search state handling
  - concern/governance record schemas
  - settings/help/project-status structures
  - route primitive indexing / bridge precedence / gate schema follow-through
  - blocked-sequence / startup-recovery / DAE policy ownership
- It still did **not** change the central conclusion:
  - this work item's ledger was transferred only **partially**
  - major missing material is still concentrated in:
    - schemas
    - enums
    - operational policy layers
    - routing/bridge refinement rules
    - same-file canon collapse

### Reconciliation posture after rerun
- This rerun adds confidence that reconciliation should proceed as a **canon-collapse and owner-schema completion pass**, not as a generic polish pass.
- Owner-doc-first order still holds:
  1. `Plans/Contracts_V0.md`
  2. `Plans/storage-plan.md`
  3. `Plans/Prompt_Pipeline.md`
  4. `Plans/Orchestrator_Page.md`
  5. `Plans/FinalGUISpec.md`
  6. `Plans/UI_Command_Catalog.md`
  7. `Plans/Glossary.md`
  8. `Plans/WorktreeGitImprovement.md`
- Then consumer cleanup and same-file supersession collapse.

## Audit Pass 2026-04-16T01:28:16Z
- Scope of this pass:
  - confirm the highest-pressure owner/consumer docs still match the current blocker inventory
  - capture any newly visible stale survivors or false-cognate cross-references that the current gap wording was not explicit enough about
- Exact findings confirmed from live docs:
  - `Plans/assistant-chat-design.md:1775-1784` still contains a stale self-verdict:
    - `**Verdict:** The plan is **fully fleshed out** for MVP for all adopted items (§23.4). No remaining gaps; **accessibility** is explicitly not MVP.`
    - this directly conflicts with still-open chat consumer gaps already tracked under `FIDELITY-049` through `FIDELITY-053`
    - result: keep the assistant-chat blocked-state/runtime-identity cluster open and record this verdict text as an additional stale contradictory survivor rather than treating the surrounding section as trustworthy closure text
  - `Plans/FinalGUISpec.md:2092` still references `restore points` through `Plans/newfeatures.md`
    - `Plans/FinalGUISpec.md:2737-2739` separately and correctly says safe points are runtime recovery anchors and MUST NOT be presented as user-facing restore points
    - result: preserve this as an unresolved false-cognate / cross-reference survivor; the problem is not absence of safe-point canon, it is coexistence of a misleading alternate restore-point reference
  - `Plans/storage-plan.md:879-910` confirms partial transfer for bridge/activity payload canon:
    - fields present now include `provider_attempt_ref`, `usage_event_ref`, `detail_ref`, and `report_ref`
    - result: storage receipt/activity gaps should continue to be treated as under-transfer / anchor failures, not as total missing-content claims
- Audit-stage handoff decision:
  - blocker inventory remains materially open
  - the gap record is now detailed enough that the next stage should be condensation rather than another broad evidence sweep

## Entry
- timestamp_utc: 2026-04-16T02:02:50.628Z
- stage: Ready Check
- finding_type: decision
- summary: Rewrote the work item bundle to the v2 artifact shapes and re-confirmed that mutation planning is still blocked because eight material blocker families remain.
- exact_items:
  - `meta.json` now uses `pm.work_item_meta.v2`.
  - `current_state.md`, `canon_inventory.json`, and `open_gaps.json` now use the v2 shapes.
  - `next_required_stage` remains `Audit Mode`.
  - Exact stale survivors still to retire include `TierContext`, `tier_id`, `detached_window`, `result_id`, `artifact_kind`, `task_id`, `{ tool_name, invocation_summary, options }`, `No remaining gaps`, and `restore points`.
- impacted_docs:
  - `Plans/.pipeline/work_items/w-20260312-203855/meta.json`
  - `Plans/.pipeline/work_items/w-20260312-203855/current_state.md`
  - `Plans/.pipeline/work_items/w-20260312-203855/canon_inventory.json`
  - `Plans/.pipeline/work_items/w-20260312-203855/open_gaps.json`
- evidence_refs:
  - `Plans/.pipeline/work_items/w-20260312-203855/current_state.md`
  - `Plans/.pipeline/work_items/w-20260312-203855/canon_inventory.json`
  - `Plans/.pipeline/work_items/w-20260312-203855/open_gaps.json`
  - `Plans/.pipeline/work_items/w-20260312-203855/meta.json`
- supersedes_prior: yes
- notes:
  - The v2 `canon_inventory.json` keeps only the eight surviving canon clusters needed for the remaining blockers.
  - The v2 `open_gaps.json` keeps only unresolved blocker families and their exact missing items.

## Entry
- timestamp_utc: 2026-04-16T02:09:06.971Z
- stage: Audit Mode
- finding_type: contract
- summary: Re-audited live owner and consumer docs in chunks and confirmed that several blockers remain real but are overstated as total absence; the live failures are now more precisely partial-transfer, structural-heading, and stale-survivor defects.
- exact_items:
  - `Plans/UI_Command_Catalog.md` already has a real command-normalization owner block, but `cmd.search.open_result` and `cmd.search.replace_selected` still preserve `result_id`.
  - `Plans/orchestrator-subagent-integration.md` already carries an `execution_unit_context` field block, but stale `TierContext` / `tier_id` residue still survives nearby.
  - `Plans/Executor_Protocol.md` already carries a strong `execution_unit_context` owner field block, but `Plans/Contracts_V0.md` still lacks the exact `### 5.1B Persona/Runtime Snapshot Payload Contract` heading.
  - `Plans/Contracts_V0.md` still preserves forbidden `detached_window` in the closed `target_kind` enum.
  - `Plans/storage-plan.md` already carries `artifacts_index.v1:{project_id}:{artifact_id}`, `provider_attempt_ref`, `usage_event_ref`, `workflow_run_id`, and a `validation lineage` block.
  - `Plans/human-in-the-loop.md` already carries `blocked_sequence` and `approval_scope_key`.
  - `Plans/Glossary.md` and `Plans/Orchestrator_Page.md` already carry real token/label/behavior blocks, but still lack the required discoverable owner headings in the audited canon clusters.
  - Exact stale contradictory survivors still confirmed: `No remaining gaps`, `restore points`, `TierContext`, `tier_id`, `result_id`, `artifact_kind`, `task_id`, `{ tool_name, invocation_summary, options }`.
- impacted_docs:
  - `Plans/UI_Command_Catalog.md`
  - `Plans/orchestrator-subagent-integration.md`
  - `Plans/storage-plan.md`
  - `Plans/human-in-the-loop.md`
  - `Plans/Glossary.md`
  - `Plans/Orchestrator_Page.md`
  - `Plans/assistant-chat-design.md`
  - `Plans/FinalGUISpec.md`
- evidence_refs:
  - `Plans/UI_Command_Catalog.md:67-91`
  - `Plans/UI_Command_Catalog.md:224-246`
  - `Plans/UI_Command_Catalog.md:617-622`
  - `Plans/Contracts_V0.md:778-806`
  - `Plans/Executor_Protocol.md:110-130`
  - `Plans/orchestrator-subagent-integration.md:209-235`
  - `Plans/orchestrator-subagent-integration.md:380-402`
  - `Plans/storage-plan.md:325`
  - `Plans/storage-plan.md:894-897`
  - `Plans/storage-plan.md:1335-1383`
  - `Plans/human-in-the-loop.md:29-33`
  - `Plans/human-in-the-loop.md:96`
  - `Plans/Glossary.md:34-67`
  - `Plans/Glossary.md:102-126`
  - `Plans/Orchestrator_Page.md:16-43`
  - `Plans/Orchestrator_Page.md:451-474`
  - `Plans/assistant-chat-design.md:1784`
  - `Plans/FinalGUISpec.md:2092`
  - `Plans/FinalGUISpec.md:2737-2739`
- supersedes_prior: yes
- notes:
  - This pass did not clear material blockers; it refined them into more exact unresolved items.
  - The next best stage is condensation so the compact blocker bundle matches the sharper live-doc evidence.

## Entry
- timestamp_utc: 2026-04-16T02:29:10.186Z
- stage: Audit Mode
- finding_type: contract
- summary: Re-audited the live owner and consumer docs in bounded chunks and further narrowed the unresolved set: several blockers remain real, but some exact-missing lists were overstated because the live docs already carry more receipt, glossary-label, and account-history canon than the compact gap bundle claimed.
- exact_items:
  - `Plans/storage-plan.md` already carries `workflow_refs`, `docker_refs`, `kubernetes_refs`, `provider_attempt_ref`, `usage_event_ref`, `workflow_run_id`, `validation lineage`, `account_pressure_episode`, `account_switch_event`, `projection_freshness`, `projection_health`, `requested_account_id`, `effective_account_id`, `execution_role`, and `account_switch_reason`.
  - `Plans/FinalGUISpec.md` already carries `account_pressure_episode`, `account_switch_event`, `projection_freshness`, and `projection_health`.
  - `Plans/interview-subagent-integration.md` already carries requested/effective runtime visibility and `operational_identity`.
  - `gap-004` therefore narrows to the missing `### Cross-surface receipt record` anchor, the unresolved fields `run_id`, `pass_verdict`, `phase_plan_ref`, and `requirements_quality_report_ref`, and the still-missing consumer anchors.
  - `Plans/Glossary.md` already carries the labels `why it matters`, `what it is not`, and `related concepts`; `gap-006` therefore narrows to missing owner headings and instantiated help-entry rows rather than missing labels.
  - `gap-005` remains real, but the exact-missing set narrows to blocked-packet consumer carry-through, escalation semantics, the composite ask tuple `{ tool_name, invocation_summary, options }`, and the stale assistant-chat verdict `No remaining gaps`.
