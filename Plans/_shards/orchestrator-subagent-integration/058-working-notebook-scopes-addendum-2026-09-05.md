# Shard 058: Working Notebook Scopes Addendum (2026-09-05)

Source: `Plans/orchestrator-subagent-integration.md`

Source lines: L32155-L32420

Source SHA256: `167320640f25243ff4455ee1dc78947cc43665649f631ba254ae1e46da54ef20`

---

## Working Notebook Scopes Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. Workers and coordinators gain bounded notebook scopes bound to existing runtime identities — no new agent/session/hierarchy is created. Scope `worker_lineage` binds a notebook to one node/attempt lineage (run_id/node_id/attempt_id): a worker and its authorized recovery paths record observations, hypotheses, and rejected approaches there, and a node retry reuses relevant lineage learning without inheriting unrelated histories. Scope `coordinator_run` binds a notebook to the coordinating run/package for bounded cross-task observations and references. Assignment, dependency, completion, blocking, and evidence truth always load from the existing runtime owners (coordination projections, `execution_unit_context`, Executor records); coordinator or worker note status prose never marks a node complete, changes assignment, or satisfies a dependency, and updating a note is never a completion event. Notebook content is never hidden orchestrator memory beyond the existing owner boundaries, mirrors stay compatibility/debug artifacts, and worker notebooks contain no Assistant-only memory payload (AMS-046).

```yaml
plan_unit_id: OSI-436
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: Worker and coordinator notebooks use worker_lineage and coordinator_run scopes bound to existing run/node/attempt and run/package identities. Node retry reuses relevant lineage notebook learning without inheriting unrelated histories. Assignment, dependency, completion, and evidence truth load only from existing runtime owners; coordinator or worker notes never complete a node, change assignment, or satisfy a dependency, and coordination projections stay the authority over notebook mirrors.
gui_related: false
gui_classification_reason: Orchestration scope semantics are runtime behavior, not GUI work.
depends_on: [OSI-435, WN-005]
unblocks: [OSI-437]
acceptance_criteria:
  - A node retry sees relevant lineage notes and no unrelated histories.
  - A coordinator note update never marks a node complete or changes dependencies.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: note_status_truth
reasoning_tier: high
context_scope: orchestration
implementation_surfaces: [Plans/orchestrator-subagent-integration.md, Plans/Working_Notebook.md, Plans/Orchestrator_Page.md]
node_compile_hint: {mode: runtime_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-I02
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A44
preserved_exact_tokens: ["worker_lineage", "coordinator_run", "never a completion event"]
negative_constraints:
  - Do not derive scheduling or completion truth from notebook prose.
  - Do not create a new agent/session hierarchy for notebooks.
owner_hints: [Plans/orchestrator-subagent-integration.md, Plans/Working_Notebook.md]
```

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Working_Notebook.md, ContractName:Plans/Executor_Protocol.md

```yaml
plan_unit_id: OSI-437
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: "Orchestrator notebook access is read/inspect plus owner-scoped write through the existing detail surfaces: the selected run/worker inspector exposes notebook entry, author, evidence, freshness, and included-context status via the same projection-trust freshness rules (OP-006), with stale/degraded/unavailable projections disabling mutation. Notebook state never bypasses canonical EventRecord/coordination families, and no notebook-specific shadow projection family is created."
gui_related: true
gui_classification_reason: This unit specifies user-visible Orchestrator detail-surface notebook behavior.
depends_on: [OSI-436]
unblocks: []
acceptance_criteria:
  - Selected run/worker detail reaches the notebook through existing inspector patterns.
  - Notebook mutation follows projection freshness rules like every mutating surface.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: shadow_projection
reasoning_tier: standard
context_scope: orchestration
implementation_surfaces: [Plans/orchestrator-subagent-integration.md, Plans/Orchestrator_Page.md]
node_compile_hint: {mode: runtime_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-X01
preserved_exact_tokens: ["projection_state", "existing detail surfaces"]
negative_constraints:
  - Do not create a notebook-specific shadow projection or event family.
owner_hints: [Plans/orchestrator-subagent-integration.md, Plans/Orchestrator_Page.md]
```

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Orchestrator_Page.md

### OSI-439 - Application Thread Requests And Receiver Authority

```yaml
plan_unit_id: OSI-439
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: thread.request, thread.spawn and thread.await remain the only admitted continuity operations for
  app/Project chat requests. Bind explicit source and target scope/Server/thread, optional Goal/Crew/Assistant Plan
  lineage, bounded task, reply contract, parent ceiling, stable idempotency and per-thread order. App requests do
  not require a NamedPlan/WorkNode. Sender-mode authority covers only the send; the receiver's own mode, access,
  Off/Ask me policy and current permissions decide its turn. A human-reviewed send is recorded distinctly from a
  YOLO send. Unseen Regular requests remain read/answer-only until accepted; an already-YOLO receiver may act within
  its admitted task without ordinary accept, but cannot answer retained human approvals or widen the request. Busy
  delivery waits outside the person's two-slot queue, replies follow stable thread identity with revalidation after
  a move, and awaiting never blocks unrelated work. Waiting remote delivery expires after one day; results retain
  accepted|rejected|cancelled|expired|failed|reconciled truth. Three automatic round trips require a person to extend;
  no mode restarts that budget. Coverage and provenance accompany cross-Project reads/replies, and requests carry
  no settings, trust, Stop or build-grant authority. thread.branch remains deferred; conversion and restore-point
  branching are different owner operations. CV-365 supplies ui.thread.request.preview/ui.thread.spawn.preview as
  local redacted draft projections and the existing cmd.thread.request -> handlers::thread::request and cmd.thread.spawn
  -> handlers::thread::spawn Send routes. cmd.thread.await keeps its sole existing owner. The v2 facade and local-preview
  request/result definitions live only in Plans/application_workflow_contracts.schema.json. Local Preview commits
  no outbox or event and grants no permission; Send rechecks exact source/receiver/body/permission/Stop/currentness/return
  immediately before the one durable outbox commit. No .preview/.send command duplicates, aliases or operation=preview
  branch are introduced, and original request/result interpretations remain exact.
gui_related: true
gui_classification_reason: Defines user-visible availability, controls, preview, scope or outcome.
depends_on:
- ACD-508
- PS-145
unblocks: []
acceptance_criteria:
- Source/target app/Project combinations preserve order, idempotency and exact receiving authority.
- Off/Regular Ask me/YOLO matrices and three-round-trip exhaustion behave consistently after restart.
- Moved target, late reply, unreachable Server and expiry never fabricate delivery or mutate a stopped thread.
validation_surfaces:
- scripts/pm-projects-refresh-contracts.py
- scripts/pm-assistant-contract-check.py
- scripts/pm-plan-index.py
risk_class: scope_authority_and_custody
reasoning_tier: high
context_scope: application_and_project_workflows
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: contract_specification
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#N4-N18; Q4-Q9
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c
- 'Jared, 2026-11-03: I approve the outstanding questions with their recommended settings.'
- projects-refresh-20261030/pass2/plans-edit-requests/Fc-requests.md#fc-c01
preserved_exact_tokens:
- thread.request
- thread.spawn
- thread.await
- accepted|rejected|cancelled|expired|failed|reconciled
- thread.branch
negative_constraints:
- No second chat message engine, hidden state bus, sender-driven receiver YOLO, self-approval or unbounded fan-out.
- Do not revive thread.branch or treat a read grant as scheduling/control authority.
owner_hints:
- Plans/orchestrator-subagent-integration.md
```

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#OSI-439, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#CV-365

### OSI-440 - Application Crew Coordination And Root Identity

```yaml
plan_unit_id: OSI-440
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: App Crew/subagents reuse AgentCoordinator and its versioned storage.coordination_append.application@1.0.0
  interface, one seglog/redb coordination family, one run-internal board and existing complete source/checkpoint/token
  readers. Registration/status/operation/file/snapshot/checkpoint keys include the admitted scope partition and
  actual Server/thread/crew/run identity; Project keys remain valid in their original editions. Claims normalize
  canonical absolute root/path plus execution Host identity when no repository exists; equal relative paths on different
  Computers never collide or grant access. Child contexts inherit the exact working roots, permission snapshot,
  effective runtime and parent ceiling; no fabricated repo/worktree/node/plan graph is required. AgentMessage carries
  application/project scope, source thread/crew/run lineage and checked optional node/lane targets in both schema
  copies; inline board content is at most 16 KiB and longer content uses the BLAKE3 payload-store reference. The
  board is not cross-thread transport. Native pause/checkpoint authority comes from the actual run owner and scope-bound
  durable state; any retained provider pause file uses that run's owned area, never an invented Project tree. One
  no-project bucket per Server mirrors counterpart coordination caps, retention and holds. N25 settles/fences source
  registrations, operations and claims; destination registrations/claims and checkpoint coverage are newly admitted,
  never copied epoch numbers. No active-agents.json or agent-messages.json mirror or export becomes scheduling truth.
  CV-366 selects app.coordination_append.v1 with OriginalCoordinationAppendSource and AgentMessageApplicationV1/CoordinationProjectionApplicationV1;
  SP-351 owns its explicit app physical keys and counterpart policy joins. Both canonical AgentMessage description
  sites consume that same selected app definition. Original storage.coordination_append.v1 Project source and read/checkpoint
  resources remain exact; no nullable reinterpretation or copied checkpoint admits an app append.
gui_related: true
gui_classification_reason: Defines user-visible availability, controls, preview, scope or outcome.
depends_on:
- CWR-045
- SIR-055
unblocks: []
acceptance_criteria:
- Two app crews/threads/Hosts cannot read each other through null keys or same path text.
- Registration/claim/board/restart/snapshot/cutover races preserve one current owner and bounded payload custody.
- Unknown app source/checkpoint edition refuses; Project codecs/retention and source permissions remain exact.
validation_surfaces:
- scripts/pm-projects-refresh-contracts.py
- scripts/pm-assistant-contract-check.py
- scripts/pm-plan-index.py
risk_class: scope_authority_and_custody
reasoning_tier: high
context_scope: application_and_project_workflows
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: contract_specification
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#Q11-Goals-Crew; N24-N25
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c
- 'Jared, 2026-11-03: Those look good, except goals and crew should be allowed in no project.'
- projects-refresh-20261030/pass2/plans-edit-requests/Fc-requests.md#fc-c01
preserved_exact_tokens:
- AgentCoordinator
- storage.coordination_append.v1
- AgentMessage
- 16 KiB
- BLAKE3
- N25
- active-agents.json
- agent-messages.json
negative_constraints:
- Do not create a second board, coordinator, JSON mirror or portable checkpoint authority.
- No app Orchestrator graph, invented project configuration path, credential or hidden notebook access.
owner_hints:
- Plans/orchestrator-subagent-integration.md
```

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#OSI-440, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#CV-366, ContractName:Plans/storage-plan.md#SP-351

### OSI-441 - Project Build Grant Consumption And Child Ceiling

```yaml
plan_unit_id: OSI-441
unit_type: requirement
status: accepted
owner_doc: Plans/orchestrator-subagent-integration.md
canonical_text: A real Planning Wizard/Orchestrator Project build consumes the Permissions-owned human-approved
  BuildGrant at parent/child admission and immediately before each grant-authorized local or remote effect dispatch.
  CreatedResourceManifest supplies verified stable resource identity. Receipts keep authority_kind=human|mode|build_grant;
  ordinary YOLO publication is policy auto-allow, never a forged human yes. What the build did reads the shared
  owner receipts and exact targets. Bind exact Project, approved Plan revision/hash, build/run/task, enumerated
  action/resource/target, permission generation and Stop/revocation epochs; a child may narrow but never mint, expand
  or transfer the grant. Verified created-resource manifest identity is required before grant-covered cleanup; a
  same name or named pre-existing resource gives no deletion authority. Shared History/ObservableWork shows each
  remote action/target/result and Stop, with Undo only where supported. Ordinary YOLO push/publish follows Plans/Permissions_System.md's mode-aware
  admission without a second generic yes. A no-project Goal, Crew, Assistant Plan or scheduled task has ordinary
  app authority and cannot issue or inherit another Project build grant through a message, conversion, receipt or
  parent label. Protected trust/auth/secrets, paid signup, currentness, capabilities, FileSafe and retained Y1 boundaries
  remain under Permissions. No grant creates an Orchestrator run outside a real Project.
gui_related: true
gui_classification_reason: Defines user-visible availability, controls, preview, scope or outcome.
depends_on:
- PS-147
- PS-148
unblocks: []
acceptance_criteria:
- Child dispatch rejects widened action/resource, changed permission/Plan/target, revoked grant or stale Stop epoch.
- Created-resource cleanup proves stable grant-created ownership, including namespace child operations.
- App requests cannot adopt Project grants; one remote effect has one truthful authority source/result.
validation_surfaces:
- scripts/pm-projects-refresh-contracts.py
- scripts/pm-assistant-contract-check.py
- scripts/pm-plan-index.py
risk_class: scope_authority_and_custody
reasoning_tier: high
context_scope: application_and_project_workflows
implementation_surfaces:
- Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: contract_specification
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#O1-O3; Y1
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c
- 'Jared, 2026-11-03: I approve the outstanding questions with their recommended settings.'
preserved_exact_tokens:
- build grant
- Stop/revocation
- History/ObservableWork
- YOLO
negative_constraints:
- No agent-issued or widened grant, forged human confirmation or generic permission bypass.
- Do not start app Orchestrator, force-push main/protected branches, or delete unowned resources.
owner_hints:
- Plans/orchestrator-subagent-integration.md
```

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#OSI-441, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md
