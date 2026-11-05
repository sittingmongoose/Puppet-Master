# Shard 028: Fresh Context Versus Rotation Addendum (2026-09-05)

Source: `Plans/Run_Modes.md`

Source lines: L1832-L1983

Source SHA256: `e24e05db972c0d74f8a4b89be76874ccb166d60bce526da3da00793ba5aa8d2b`

---

## Fresh Context Versus Rotation Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. A fresh context-window transition (Plans/Prompt_Pipeline.md PP-084) is not run rotation: the run, its identity, its outcome taxonomy, and its mode ceilings are unchanged, and `done.rotated` is emitted only when a genuine run rotation occurs (a follow-up run was actually spawned per §3). Ask and plan remain rotation-ineligible, yet their read-only work may continue in a fresh window through the pipeline's read-only continuation policy without mode escalation or widened ceilings; a fresh context in any mode never widens tool, project, or external-write ceilings and never converts a read-only run into `regular`/`yolo`.

```yaml
plan_unit_id: RM-052
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Modes.md
canonical_text: A fresh context-window transition is not run rotation. done.rotated is emitted only for genuine run rotation (a follow-up run actually spawned); ask/plan remain rotation-ineligible while their read-only work may continue in a fresh window without mode escalation. A fresh context never widens tool, project, or external-write ceilings and never converts a read-only run into regular/yolo.
gui_related: false
gui_classification_reason: Mode semantics are runtime behavior, not GUI work.
depends_on: [RM-051, PP-084]
unblocks: []
acceptance_criteria:
  - Fresh-window flows never emit done.rotated unless genuine rotation occurred.
  - Read-only continuation grants no write authority or mode escalation.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: mode_escalation
reasoning_tier: high
context_scope: run_modes
implementation_surfaces: [Plans/Run_Modes.md, Plans/Prompt_Pipeline.md]
node_compile_hint: {mode: runtime_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C01
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C03
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A20
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A21
preserved_exact_tokens: ["done.rotated", "rotation-ineligible", "mode escalation"]
negative_constraints:
  - Do not repurpose done.rotated for fresh-window transitions.
  - Do not widen read-only ceilings for continuation.
owner_hints: [Plans/Run_Modes.md, Plans/Prompt_Pipeline.md]
```

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Working_Notebook.md

### RM-053 - YOLO, App Workflows And Scoped Build Automation

```yaml
plan_unit_id: RM-053
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Modes.md
canonical_text: 'YOLO is runtime yolo, distinct from the Full permission profile; ask|plan|regular|yolo and
  the existing workflow-overlay enum remain unchanged. Resolve Settings safety/profile and parent ceiling
  first. ordinary git push/publication and needed repository creation use PS-146 mode authority without another
  yes, Y1 is leased force-push only on the PM-created branch for this work, and PS-147 grants authorize exact
  hands-off Project Orchestrator build operations. Other retained risky asks remain unless the operation is
  inside the approved grant on verified build-created resources. PS-148 is the only admission pipeline, including
  retained human trust/secret/Always choices.


  DAE remains mandatory for yolo with jail isolation, deterministic pre-spawn injection, actual diff reconciliation
  and end-of-run scans; unsuitable providers refuse before spawn with yolo_requires_dae_provider and never
  fall back to HTE or direct canonical-host writes. A safe admitted application working-root context may be
  the equivalent isolated workspace without a fabricated Project/worktree. Missing DAE support for a screen
  or remote action yields typed unavailable; full automation is not a reason to skip the guard. Publication
  remote effects use their exact domain writer and reconciliation receipt under the same policy.


  App Goals, Crew, Plan/Deep Plan builds and scheduled messages/tasks use the same runtime and strategy rules
  with real scope/thread/run/Computer/roots, frozen admission snapshot and existing quotas. Crew is an overlay;
  a Plan posture remains read-only toward task files, while explicit later Build freezes and admits execution
  separately. Only Planning Wizard, PRD Builder and Orchestrator have no-project workflow gates. A schedule,
  delegated child, read grant, conversion or cross-chat request never widens parent/receiver mode or inherits
  another Project''s grant. Stop/pause and recovery holds survive conversion/reconnect; changed policy/target/account
  creates new evidence, never rewritten history.


  Mode authority is task-bound, visible and auditable, not a durable Always/source-trust grant or a human
  confirmation. Every retained unmet ask in headless execution blocks under the existing reason; ordinary
  YOLO publication is not made into such an ask again by a consumer wrapper. End-of-run verification, resource
  limits, exact targets and truthful partial/unknown outcomes remain.


  Delayed work freezes its requested mode/model/account/configuration and exact text/attachments or Plan version/hash;
  a schedule does not acquire the visible chat mode or standing permission. PS-145/148 revalidate actual source/target/root/permission/parent/receiver
  and task/scope user_stop_epoch at eligibility and immediately before effect. Saved Ask me first remains
  held in YOLO. SQR-019/020 and CV-368/SP-352 own the independent Server app pause, application_automation_paused
  and app_automation_pause_unavailable; missing pause is unavailable, never off. Only the authenticated user
  changes/clears pause. The exact direct-user Send now/Build/resume exception is one dispatch with every other
  guard and the stored pause unchanged; paused=false clears no task latch. Conversion retains both scope epochs
  and holds, explicitly re-admits the exact destination target/consent, and never substitutes another account,
  latest Plan version or source authority. Goal user_direct|agent_proposed_user_approved objective changes
  remain separate from mode authority.'
gui_related: false
gui_classification_reason: Defines permission, scope, admission and recovery policy consumed by UI owners.
depends_on:
- PS-145
- PS-146
- PS-147
- PS-148
- F2-213
unblocks: []
acceptance_criteria:
- Unsupported DAE refuses before spawn with exact existing reason; no HTE/direct-host fallback.
- App Goal/Crew/Plan/scheduled work uses actual roots and parent ceilings with no fake Project.
- Publication proceeds under admitted YOLO; retained human asks/Stop/capability restrictions still block.
- Mode change cannot rewrite old receipts or create Always/trust/build grants.
- A saved Ask me first or task/scope Stop/pause blocks delayed YOLO work; direct-user exceptions preserve
  the pause record and unrelated latches.
validation_surfaces:
- scripts/pm-projects-refresh-contracts.py
- scripts/pm-plan-index.py
risk_class: authority_scope_and_target_drift
reasoning_tier: high
context_scope: project_refresh_permissions_and_automation
implementation_surfaces:
- Plans/Run_Modes.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards Y1/O1–O3; Q11/N21/N22 reversals
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "YOLO mode needs
  to absolutely be able to git push and publish."'
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards approval envelope
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "I approve the outstanding
  questions with their recommended settings."'
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-D01
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-D03
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-D04
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-D05
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/Fb-requests.md#Fb-D01
- source_ref:projects-refresh-20261030/pass2/plans-edit-requests/Fc-requests.md#Fc-D01
preserved_exact_tokens:
- yolo
- Full
- ask|plan|regular|yolo
- force-push
- yolo_requires_dae_provider
- DAE
- HTE
- user_stop_epoch
- Ask me first
- application_automation_paused
- app_automation_pause_unavailable
- paused=false
- user_direct|agent_proposed_user_approved
negative_constraints:
- No new runtime-mode enum or workflow overlay.
- No implicit mode propagation into another Project or receiver chat.
- Acceptance of this specification creates no native handler, active EventRecord producer, WorkNode, NodeSeed,
  executable queue, production build task, readiness certification or governance seal.
owner_hints:
- Plans/Run_Modes.md
```

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md#PS-145, ContractName:Plans/Permissions_System.md#PS-148, ContractName:Plans/Scheduling_and_Quota_Resume.md#SQR-019, ContractName:Plans/Scheduling_and_Quota_Resume.md#SQR-020, ContractName:Plans/Contracts_V0.md#CV-368
