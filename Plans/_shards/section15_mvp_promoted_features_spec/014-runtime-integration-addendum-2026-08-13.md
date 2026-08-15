# Shard 014: Runtime Integration Addendum - 2026-08-13

Source: `Plans/Section15_MVP_Promoted_Features_Spec.md`

Source lines: L8545-L8834

Source SHA256: `595d843ab1ce0458bba7dbb3c441a189602733aa6ad229b7ce44a2b59079f8b5`

---

## Runtime Integration Addendum - 2026-08-13

This addendum consumes shared lifecycle and topology mechanics from `Plans/Shared_Integration_Runtime.md` while retaining Section 15 ownership of promoted browser and developer-session behavior. It creates PlanUnits only: no WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, generated governance artifacts, or certification claims.

### SMPFS-139 - Typed Classical DebugSession Boundary

```yaml
plan_unit_id: SMPFS-139
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  Classical DAP debugging uses the shared DebugSessionRecord and DebugSessionBroker lifecycle bound to exact
  ExecutionHostId, ExecutionEnvironmentId, SourceLocationId, adapter capability snapshot, owner, LeaseId,
  generation, permission grant, policy, logs, artifacts, and cleanup. Typed protocol behavior covers launch and
  attach, breakpoints, continue/pause/step, threads/stack/scopes/variables, evaluate,
  modules/sources/disassembly/memory, output, disconnect/terminate, restart, and cleanup. Immediate-event waiters
  are armed before triggering operations. Classical UI dispatch uses only concrete cmd.run_debug.* verbs;
  cmd.debug.* remains assistant-investigation scoped and is never a DAP alias.
gui_related: false
gui_classification_reason: This is the promoted debugger runtime and command-namespace boundary, not debugger surface presentation.
depends_on: [SIR-008, ATS-030]
unblocks: []
acceptance_criteria:
  - DebugSessionRecord preserves exact topology, source, adapter, owner, lease/generation/epoch, permission, policy, log, artifact, and cleanup identity.
  - Immediate stopped, output, exited, and terminated events cannot race ahead of their waiters, and late prior-generation events cannot mutate current state.
  - cmd.run_debug.* is the only classical DAP family and every cmd.debug.* substitution or generic action alias is rejected.
  - Restart and client-loss paths reconcile or terminate truthfully and never fabricate a live adapter.
validation_surfaces: [python3 scripts/pm-plan-index.py validate, Plans/Automated_Testing_System.md ATS-030 future executable matrix]
risk_class: classical_debug_namespace_or_lifecycle_drift
reasoning_tier: high
context_scope: promoted_typed_debugsession
implementation_surfaces: [Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Shared_Integration_Runtime.md, Plans/Automated_Testing_System.md, Plans/Commands_System.md]
node_compile_hint: {mode: promoted_debugsession_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/04_LSP_DAP_EVAL_MCP_BROWSER_AND_WORKTREES.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/T3_OMP_COMPLETE_SOURCE_REVIEW.md
preserved_exact_tokens: [DebugSessionRecord, DebugSessionBroker, cmd.run_debug.*, cmd.debug.*, ExecutionHostId, ExecutionEnvironmentId, SourceLocationId]
negative_constraints:
  - Do not mint or alias commands in this consumer PlanUnit.
  - Do not route classical DAP operations through cmd.debug.*.
  - Do not claim runtime proof from this PlanUnit or a schema alone.
owner_hints: [Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Shared_Integration_Runtime.md, Plans/Automated_Testing_System.md, Plans/Commands_System.md]
```

### SMPFS-140 - Persistent EvalSession Policy Boundary

```yaml
plan_unit_id: SMPFS-140
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  Persistent evaluation uses EvalSessionRecord and EvalSessionBroker for product-approved sandboxed Python,
  JavaScript, Ruby, and Julia kernels. Retained variables, bounded streaming output, redacted artifact spills,
  restart, and cleanup are scoped to exact Project, Goal/run, worktree, ExecutionHostId,
  ExecutionEnvironmentId, SourceLocationId, owner, LeaseId, runtime installation, policy, and artifact root; hidden
  global kernels are prohibited. Local compute and external wait are accounted separately. Nested PM tool or
  agent calls require explicit policy and independent single-use ProviderDispatchAdmissionReceipt consumption;
  idle-time pause never suspends other resource, security, recursion, provider, output, or artifact limits.
gui_related: false
gui_classification_reason: This unit defines evaluator sandbox, scope, accounting, and authority rather than a visible evaluator surface.
depends_on: [SIR-008, SIR-009, ATS-031]
unblocks: []
acceptance_criteria:
  - Kernel state cannot cross its explicit Project/run/worktree/topology/owner/session scope.
  - Nested provider/tool/agent work independently satisfies policy and consumes valid dispatch admission without widening parent or session authority.
  - CPU, memory, wall, idle, output, artifact, recursion, provider, FileSafe, permission, credential, and network limits remain independently enforceable.
  - Crash, restart, lease loss, and cleanup fence late results and retain explicit variable/artifact disposition.
validation_surfaces: [python3 scripts/pm-plan-index.py validate, Plans/Automated_Testing_System.md ATS-031 future executable matrix]
risk_class: persistent_eval_scope_or_authority_escape
reasoning_tier: high
context_scope: promoted_persistent_evalsession
implementation_surfaces: [Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Shared_Integration_Runtime.md, Plans/Automated_Testing_System.md, Plans/Tools.md, Plans/Permissions_System.md, Plans/FileSafe.md]
node_compile_hint: {mode: promoted_evalsession_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/04_LSP_DAP_EVAL_MCP_BROWSER_AND_WORKTREES.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/T3_OMP_COMPLETE_SOURCE_REVIEW.md
preserved_exact_tokens: [EvalSessionRecord, EvalSessionBroker, ProviderDispatchAdmissionReceipt, Python, JavaScript, Ruby, Julia, hidden global kernels are prohibited]
negative_constraints:
  - Do not collapse persistent EvalSession into DAP frame evaluation.
  - Do not inherit or reuse provider dispatch admission.
  - Do not pause non-idle safety/resource limits during external wait.
owner_hints: [Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Shared_Integration_Runtime.md, Plans/Automated_Testing_System.md, Plans/Tools.md]
```

### SMPFS-141 - Test Debug Lease And Awareness Consumption

```yaml
plan_unit_id: SMPFS-141
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  Testing, classical debug, Eval, device, and browser work consume RuntimeResourceGovernor admission,
  ObservableWork truth, LeaseCoordinator CAS lifecycles, and OperationalAwarenessService bounded projections.
  Every executable request binds exact Project/Home Server, ExecutionHostId, ExecutionEnvironmentId,
  SourceLocationId where applicable, topology generation, capability snapshot, holder, epoch, lease generation,
  policy, operation/attempt, and ObservableWorkId. Host-local enforcement may reject or reduce a coordinator
  proposal. Awareness is freshness-labeled and read-only; it never authorizes action or injects raw registries,
  secrets, transcripts, page bodies, stacks, variables, or captures into prompts.
gui_related: false
gui_classification_reason: This unit defines shared runtime admission and projection consumption rather than a visible surface.
depends_on: [SIR-006, SIR-007, ATS-032]
unblocks: []
acceptance_criteria:
  - Consumers do not create feature-local global governors, work state machines, lease authorities, or awareness registries.
  - Stale holder, epoch, generation, topology, capability, or source identity cannot renew, release, publish, or mutate through a replacement lease.
  - Awareness states current, partial, stale, unavailable, and conflicted carry source cursors/observed time and confer no authority.
  - Queued, admitted, reduced, lease-held, awareness-current, or visible never means test/debug success.
validation_surfaces: [python3 scripts/pm-plan-index.py validate, Plans/Automated_Testing_System.md ATS-032 future executable matrix]
risk_class: shared_runtime_consumer_authority_fork
reasoning_tier: high
context_scope: promoted_test_debug_shared_runtime_consumption
implementation_surfaces: [Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Shared_Integration_Runtime.md, Plans/Automated_Testing_System.md]
node_compile_hint: {mode: promoted_test_debug_runtime_consumption_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/05_BSD_TIME_TRAVEL_GOAL_AND_OPERATIONAL_AWARENESS.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/02_FULL_THREAD_CURRENT_DECISION_REGISTER.md
preserved_exact_tokens: [RuntimeResourceGovernor, ObservableWork, LeaseCoordinator, OperationalAwarenessService, ExecutionHostId, ExecutionEnvironmentId, SourceLocationId]
negative_constraints:
  - Do not create a second shared resource, lease, progress, or awareness owner.
  - Do not inject raw operational registries into prompts.
  - Do not convert admission or visibility into verification proof.
owner_hints: [Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Shared_Integration_Runtime.md, Plans/Automated_Testing_System.md]
```

### SMPFS-142 - PM-Native Browser Program Architecture

```yaml
plan_unit_id: SMPFS-142
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  BrowserRuntimeService, BrowserWorkspace, BrowserPage, PageGeneration, BrowserAction, Browser Program, and
  Expert Browser Program are independently PM-native and versioned without an external-framework compatibility
  promise. Ordinary BrowserSessions support policy-permitted human or agent use, named actions, requested versus
  effective capability disclosure, visible/watchable or headless/background operation, bounded generic Test
  Capture, redaction, artifacts, crash recovery, and cleanup. Expert Browser Program is the advanced
  policy/capability-gated named-action surface and never an arbitrary page-code or raw external-protocol escape
  hatch.
gui_related: true
gui_classification_reason: This unit defines the visible/watchable Browser Program and its advanced user-facing testing/diagnostic behavior.
depends_on: [SIR-007, ATS-033]
unblocks: [SMPFS-143, SMPFS-144]
acceptance_criteria:
  - Browser Program and Expert Browser Program use PM-native named actions and preserve requested/effective capability and truthful degradation.
  - Visible, detached, headless, background, crash, reconnect, artifact, redaction, and cleanup paths retain exact session/topology/operation lineage.
  - Arbitrary page-code and raw external-protocol execution are absent from the product contract.
  - Ordinary BrowserSession automation never weakens protected AuthBrowserSession controls.
validation_surfaces: [python3 scripts/pm-plan-index.py validate, Plans/Automated_Testing_System.md ATS-033 future executable matrix]
risk_class: pm_native_browser_contract_drift
reasoning_tier: high
context_scope: promoted_pm_native_browser_program
implementation_surfaces: [Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Shared_Integration_Runtime.md, Plans/Automated_Testing_System.md, Plans/Tools.md]
node_compile_hint: {mode: promoted_browser_program_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/04_LSP_DAP_EVAL_MCP_BROWSER_AND_WORKTREES.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/BROWSER_TERMINOLOGY_FINAL_CORRECTION.md
preserved_exact_tokens: [BrowserRuntimeService, BrowserWorkspace, BrowserPage, PageGeneration, BrowserAction, Browser Program, Expert Browser Program, ordinary BrowserSession]
negative_constraints:
  - Do not describe PM browser architecture or APIs through external-framework similarity or compatibility.
  - Do not expose arbitrary page-code or a raw external control protocol as Browser Program.
  - Do not treat ordinary BrowserSession capture policy as applicable to protected AuthBrowserSession.
owner_hints: [Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Shared_Integration_Runtime.md, Plans/Automated_Testing_System.md, Plans/Tools.md]
```

### SMPFS-143 - Protected AuthBrowserSession Boundary

```yaml
plan_unit_id: SMPFS-143
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  Protected AuthBrowserSession is a human-only, ephemeral, domain-restricted, redacted Browser surface. Only the
  human may interact with the allowed authentication flow. Agents, tools, OperationalAwarenessService detail,
  Back Seat Driver (BSD), recorders, DOM or PageRepresentation readers, screenshots, console, network capture,
  and storage-state export have zero access. Its transient store is destroyed at teardown; content, profile
  state, credentials, captures, and automation authority cannot persist, restore, copy, promote, export, or
  enter prompts. Redirects, popups, downloads, uploads, external protocols, clipboard, certificate errors, and
  permission prompts remain within explicit domain and human-decision policy.
gui_related: true
gui_classification_reason: This unit defines a protected human-only visible authentication surface and its interaction boundary.
depends_on: [SMPFS-142, ATS-033]
unblocks: []
acceptance_criteria:
  - Creation and interaction require the human and an exact domain allowlist; subdomain, redirect, popup, and external-protocol changes cannot broaden scope silently.
  - Every agent/tool/awareness-detail/BSD/recording/DOM/PageRepresentation/screenshot/console/network/storage-state access path returns denial without protected content leakage.
  - Close, expiry, crash, restart, disconnect, and presumed-success paths never persist or restore protected content/state and never fabricate success.
  - Exterior audit may record only redacted lifecycle/denial facts permitted by policy, not protected page content or captures.
validation_surfaces: [python3 scripts/pm-plan-index.py validate, Plans/Automated_Testing_System.md ATS-033 future protected-boundary matrix]
risk_class: authbrowser_protected_boundary_escape
reasoning_tier: high
context_scope: promoted_protected_authbrowser
implementation_surfaces: [Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Shared_Integration_Runtime.md, Plans/Automated_Testing_System.md, Plans/Permissions_System.md]
node_compile_hint: {mode: protected_authbrowser_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/04_LSP_DAP_EVAL_MCP_BROWSER_AND_WORKTREES.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/09_TEST_MIGRATION_AND_ACCEPTANCE_MATRIX.md
preserved_exact_tokens: [AuthBrowserSession, human-only, ephemeral, domain-restricted, redacted, BSD, zero access]
negative_constraints:
  - Do not expose protected content or state to agents, tools, OperationalAwarenessService detail, BSD, recorders, DOM/PageRepresentation readers, screenshots, console, or network capture.
  - Do not persist, restore, copy, promote, export, or inject protected session content/state.
  - Do not treat a human authentication action as automated test evidence.
owner_hints: [Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Shared_Integration_Runtime.md, Plans/Automated_Testing_System.md, Plans/Permissions_System.md]
```

### SMPFS-144 - Multi-Agent BrowserWorkspace Controller Fencing

```yaml
plan_unit_id: SMPFS-144
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  Concurrent agents or browser-test tasks use isolated BrowserWorkspaces and dedicated BrowserPages unless an
  owner-authorized read-only observer contract applies. Each action carries exact Server, ExecutionHostId,
  ExecutionEnvironmentId, Project, Plan, Goal, run, attempt, agent, operation, BrowserSession, BrowserWorkspace,
  BrowserPage, LeaseId/generation/epoch/holder, expected PageGeneration, and sequence. Exactly one mutating
  LeaseCoordinator Browser page-controller lease is valid per BrowserPage PageGeneration. Navigation, redirect,
  reload, crash/restore, and explicit handoff advance or revalidate PageGeneration; stale actions are rejected.
  Read-only observation, focus, visibility, or tab selection never confers mutation authority.
gui_related: true
gui_classification_reason: This unit governs concurrent visible/watchable pages, controller handoff, and user-observable mutation ownership.
depends_on: [SMPFS-141, SMPFS-142, ATS-034]
unblocks: []
acceptance_criteria:
  - Agent/task workspaces isolate profile/storage, proxy, locale, device, extension, permission, downloads, artifacts, logs, and cleanup when policy requires.
  - Exactly one controller wins same-generation mutation races and every loser receives deterministic blocked/stale disposition without mutation.
  - Navigation and lifecycle changes fence late generation, epoch, holder, lease, and sequence values.
  - Read-only observers cannot mutate or acquire a lease implicitly, and agents cannot acquire PM web-client, ordinary user browsing, workspace preview, or AuthBrowserSession pages.
validation_surfaces: [python3 scripts/pm-plan-index.py validate, Plans/Automated_Testing_System.md ATS-034 future executable matrix]
risk_class: browser_controller_race_or_cross_agent_bleed
reasoning_tier: high
context_scope: promoted_multi_agent_browser_fencing
implementation_surfaces: [Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Shared_Integration_Runtime.md, Plans/Automated_Testing_System.md]
node_compile_hint: {mode: promoted_browser_controller_fencing_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/04_LSP_DAP_EVAL_MCP_BROWSER_AND_WORKTREES.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/02_FULL_THREAD_CURRENT_DECISION_REGISTER.md
preserved_exact_tokens: [BrowserWorkspace, BrowserPage, PageGeneration, LeaseCoordinator, one mutating controller lease per page generation]
negative_constraints:
  - Do not share mutable BrowserWorkspace or BrowserPage state across agents by default.
  - Do not infer authority from focus, visibility, tab selection, or observation.
  - Do not accept stale PageGeneration, generation, epoch, holder, LeaseId, or sequence.
owner_hints: [Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Shared_Integration_Runtime.md, Plans/Automated_Testing_System.md]
```

### SMPFS-145 - PM Browser Dependency Prohibition And External Project Exception

```yaml
plan_unit_id: SMPFS-145
unit_type: constraint
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  Puppet Master exposes no PM-owned Playwright runtime, browser backend, facade, compatibility vocabulary or
  namespace, package dependency, server or port, MCP route, command or alias, support bundle, Settings/Doctor
  capability, or capture engine. A user Project may independently declare and run a Playwright suite under
  Project tooling policy as a generic external Project command/process. PM may ingest generic Test Capture and artifact refs
  with explicit external Project attribution, but the process does not define Browser Program, become a PM
  dependency, gain BrowserWorkspace or page-controller authority, access AuthBrowserSession, or create a PM API,
  facade, compatibility promise, MCP surface, command, port, package, or capture dependency.
gui_related: false
gui_classification_reason: This is a product dependency, process attribution, and authority boundary rather than visible presentation.
depends_on: [SMPFS-142, SMPFS-143, ATS-035]
unblocks: []
acceptance_criteria:
  - PM dependency, process, package, port, command, MCP, Settings, Doctor, support, schema, receipt, and capture inventories contain no prohibited PM-owned surface.
  - An independently declared user-Project suite runs only through the generic external Project command/process path and produces generic externally attributed Test Capture/artifact refs.
  - Artifact ingestion confers no BrowserRuntimeService, BrowserWorkspace, page-controller, AuthBrowserSession, credential, profile, internal transport, or PM conformance authority.
  - The external Project exception cannot serve as a BrowserRuntimeService fallback or satisfy PM-native Browser Program conformance.
validation_surfaces: [python3 scripts/pm-plan-index.py validate, Plans/Automated_Testing_System.md ATS-035 future negative and external-process matrix]
risk_class: forbidden_pm_browser_dependency_or_authority_bridge
reasoning_tier: high
context_scope: promoted_pm_browser_dependency_prohibition
implementation_surfaces: [Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Automated_Testing_System.md, Plans/Shared_Integration_Runtime.md]
node_compile_hint: {mode: promoted_browser_dependency_boundary_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/SOURCE_AND_PRECEDENCE_MAP.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/BROWSER_TERMINOLOGY_FINAL_CORRECTION.md
preserved_exact_tokens: [PM-native Browser Program API, generic Test Capture, external Project test activity]
negative_constraints:
  - Do not create, expose, label, or imply a PM Playwright runtime, facade, compatibility layer, package, port, MCP route, command, Settings/Doctor/support capability, or capture engine.
  - Do not promote a user Project dependency into PM browser ownership, installation, onboarding, support, or authority.
  - Do not claim runtime closure from prose, index, schema, or text scan alone.
owner_hints: [Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Automated_Testing_System.md, Plans/Shared_Integration_Runtime.md]
```
