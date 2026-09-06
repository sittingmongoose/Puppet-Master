# Shard 026: Runtime Integration Acceptance Matrices - 2026-08-13

Source: `Plans/Automated_Testing_System.md`

Source lines: L3089-L3374

Source SHA256: `f80d0273a215fb466f82cbcb35b83864cec554a22ff778e30c8c7d49d16822cb`

---

## Runtime Integration Acceptance Matrices - 2026-08-13

These matrices consume `RuntimeResourceGovernor`, `ObservableWork`, `LeaseCoordinator`, `OperationalAwarenessService`, `DebugSessionRecord`, `EvalSessionRecord`, and the exact `ExecutionHostId` / `ExecutionEnvironmentId` topology identities from `Plans/Shared_Integration_Runtime.md`. They define required future executable coverage. Their presence in Plans, a generated index, a schema, or a passing mechanical governance check is not runtime evidence and must not be reported as feature completion, certification, or a test pass.

### ATS-030 - DAP DebugSession Lifecycle And Event-Ordering Matrix

```yaml
plan_unit_id: ATS-030
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  The classical DAP debugger is verified as a typed durable DebugSession resource. Coverage spans launch and
  attach; breakpoints; continue, pause, and step; threads, stack, scopes, and variables; evaluate; modules,
  sources, disassembly, and memory; output; disconnect; terminate; restart and cleanup. Every case binds the
  session to its Project, ExecutionHostId, ExecutionEnvironmentId, SourceLocationId, owner, policy snapshot,
  DebugSessionRecord, LeaseId and generation, adapter
  capability generation, logs, artifacts, and cleanup disposition. Event waiters are installed before an
  operation that can immediately emit stopped, output, exited, or terminated, so a stop event arriving in the
  same transport read as continue or step is not missed. Classical lifecycle and mutation cases dispatch only
  through the existing cmd.run_debug.* family; cmd.debug.* remains the assistant-investigation family and is
  never accepted as a DAP alias.
gui_related: false
gui_classification_reason: This unit owns an executable debugger contract matrix rather than debugger surface layout or presentation.
depends_on: [ATS-010]
unblocks: []
acceptance_criteria:
  - Positive fixtures cover every typed operation family and preserve DebugSessionRecord, ExecutionHostId, ExecutionEnvironmentId, SourceLocationId, owner, LeaseId/generation/epoch, adapter generation, policy, log, artifact, and cleanup lineage.
  - Race fixtures emit stopped or terminated in the same transport read as continue, step, launch, attach, or terminate and prove waiter-before-operation ordering with no lost or double-consumed event.
  - Lease expiry, owner-epoch change, adapter crash, host disconnect, restart, cancellation, and cleanup fixtures reject late mutation and retain truthful terminal or recovery-required state.
  - Command-routing fixtures accept the existing cmd.run_debug.* classical family and reject every attempt to dispatch a DAP operation through cmd.debug.*.
  - Passing Plan/index validation proves only matrix structure; executable adapter, transport, failure, and restart fixtures are required before any runtime pass claim.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future DAP DebugSession protocol and event-ordering fixture matrix
  - future DebugSession lease-expiry, crash, restart, and cleanup integration matrix
risk_class: false_dap_lifecycle_proof
reasoning_tier: high
context_scope: dap_debugsession_acceptance
implementation_surfaces: [Plans/Automated_Testing_System.md, Plans/Commands_System.md, Plans/Shared_Integration_Runtime.md]
node_compile_hint: {mode: dap_debugsession_matrix_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/04_LSP_DAP_EVAL_MCP_BROWSER_AND_WORKTREES.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/09_TEST_MIGRATION_AND_ACCEPTANCE_MATRIX.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/T3_OMP_COMPLETE_SOURCE_REVIEW.md
preserved_exact_tokens: [DebugSessionRecord, DebugSessionBroker, cmd.run_debug.*, cmd.debug.*, waiter-before-operation, ExecutionHostId, ExecutionEnvironmentId, SourceLocationId]
negative_constraints:
  - Do not mint, alias, or re-own command ids in this testing owner.
  - Do not route classical DAP work through the assistant-investigation cmd.debug.* family.
  - Do not infer event-ordering, crash recovery, or cleanup proof from a schema or mock-only happy path.
owner_hints: [Plans/Automated_Testing_System.md, Plans/Commands_System.md, Plans/Shared_Integration_Runtime.md]
```

### ATS-031 - Persistent EvalSession Acceptance And Policy Matrix

```yaml
plan_unit_id: ATS-031
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Persistent EvalSession acceptance covers product-approved sandboxed Python, JavaScript, Ruby, and Julia
  kernels with retained variables, streaming output, structured results, bounded artifact spills, restart, and
  cleanup. Each session is explicitly scoped to Project, Goal or run, worktree when present, ExecutionHostId,
  ExecutionEnvironmentId, SourceLocationId, owner, EvalSessionRecord, LeaseId, runtime installation, policy
  snapshot, and artifact root; there is no hidden global kernel.
  Policy fixtures separate local-compute time from external wait time, pause idle-time accounting only while a
  permitted PM-owned nested tool or agent call is outstanding, then resume accounting. Nested access requires
  explicit policy and an independently issued single-use ProviderDispatchAdmissionReceipt; it remains within
  FileSafe, permission, credential, network, recursion, provider-budget,
  package-install, CPU, memory, wall-time, idle-time, output-byte, and artifact-byte limits.
gui_related: false
gui_classification_reason: This unit validates sandboxed evaluator lifecycle, accounting, and policy rather than a visible evaluation UI.
depends_on: [ATS-010]
unblocks: []
acceptance_criteria:
  - Language fixtures prove session-scoped variable retention, ordered streaming output, bounded structured results and spills, and no state sharing across Project, worktree, owner, or kernel identity.
  - Timeout fixtures prove local compute consumes the applicable budget, permitted external wait pauses only the idle clock, and the clock resumes after the nested call returns, fails, times out, or is cancelled.
  - Denial fixtures cover absent, expired, changed-byte, changed-route, changed-account, or already-consumed ProviderDispatchAdmissionReceipt; recursive-call limit; provider-budget exhaustion; filesystem/credential/network denial; package-install denial; artifact/output overflow; CPU/memory limit; and policy revocation.
  - Crash, restart, cancellation, lease loss, and cleanup fixtures prove stale kernel work cannot publish results and that retained artifacts receive an explicit disposition.
  - Passing Plan/index validation proves only matrix structure; executable sandbox, resource-pressure, nested-call, and isolation fixtures are required before any runtime pass claim.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future EvalSession language, isolation, limit, nested-call, crash, and cleanup matrix
risk_class: eval_policy_escape_or_false_proof
reasoning_tier: high
context_scope: persistent_evalsession_acceptance
implementation_surfaces: [Plans/Automated_Testing_System.md, Plans/Shared_Integration_Runtime.md, Plans/FileSafe.md, Plans/Permissions_System.md]
node_compile_hint: {mode: evalsession_matrix_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/04_LSP_DAP_EVAL_MCP_BROWSER_AND_WORKTREES.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/09_TEST_MIGRATION_AND_ACCEPTANCE_MATRIX.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/T3_OMP_COMPLETE_SOURCE_REVIEW.md
preserved_exact_tokens: [EvalSessionRecord, EvalSessionBroker, ProviderDispatchAdmissionReceipt, Python, JavaScript, Ruby, Julia, no hidden global kernel, local compute, external wait]
negative_constraints:
  - Do not treat DAP frame evaluation and persistent EvalSession kernels as the same lifecycle.
  - Do not pause CPU, wall, recursion, provider, output, or artifact limits merely because idle-time accounting is paused during a permitted external wait.
  - Do not make nested tool or agent authority implicit or inheritable; each provider dispatch independently consumes a valid ProviderDispatchAdmissionReceipt.
owner_hints: [Plans/Automated_Testing_System.md, Plans/Shared_Integration_Runtime.md, Plans/FileSafe.md, Plans/Permissions_System.md]
```

### ATS-032 - Test And Debug Lease And Operational Awareness Consumption Matrix

```yaml
plan_unit_id: ATS-032
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Automated testing and classical debugging consume, and do not re-own, Shared Integration Runtime resource
  leases and OperationalAwarenessService projections. Admission fixtures bind test runs, DebugSessions, browser
  pages, devices, adapters, processes, ports, and Host capacity to the authoritative Project, Plan or Goal, run,
  attempt, agent, ExecutionHostId, ExecutionEnvironmentId, holder, epoch, lease generation, policy, and
  ObservableWorkId. OperationalAwarenessService receives compact typed state, wait reason, freshness, expiry,
  pressure, disabled reason,
  cleanup state, and artifact/log refs; raw registries, secrets, transcripts, page bodies, stacks, variables, or
  captures are not injected into prompts. Host-local enforcement rejects stale or infeasible allocations even
  when a coordinator previously proposed them.
gui_related: false
gui_classification_reason: This unit validates backend admission, fencing, and compact awareness projection contracts.
depends_on: [ATS-010, ATS-030, ATS-031]
unblocks: []
acceptance_criteria:
  - Admission fixtures prove test and debug work cannot start without the applicable live lease and Host/Environment capacity decision.
  - Expiry, renewal race, owner-epoch change, generation change, host disconnect, pressure downgrade, and restart fixtures reject stale work and keep cleanup/recovery observable.
  - Awareness fixtures cover current, partial, stale, unavailable, and conflicted with source cursors and observed time; they expose compact typed identity, phase, wait, pressure, disabled reason, and refs while proving no raw registry, secret, transcript, page body, stack, variable, or capture enters prompt context.
  - Windows plus WSL and host plus container or Kubernetes child fixtures share the physical parent budget rather than double-counting capacity.
  - Passing Plan/index validation proves only matrix structure; executable distributed-enforcement and stale-lease fixtures are required before any runtime pass claim.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future test/debug resource-lease and host-enforcement matrix
  - future Operational Awareness compact-projection and no-raw-prompt-injection matrix
risk_class: stale_test_debug_lease_or_awareness_leak
reasoning_tier: high
context_scope: test_debug_shared_runtime_consumption
implementation_surfaces: [Plans/Automated_Testing_System.md, Plans/Shared_Integration_Runtime.md]
node_compile_hint: {mode: test_debug_lease_awareness_matrix_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/05_BSD_TIME_TRAVEL_GOAL_AND_OPERATIONAL_AWARENESS.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/09_TEST_MIGRATION_AND_ACCEPTANCE_MATRIX.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/02_FULL_THREAD_CURRENT_DECISION_REGISTER.md
preserved_exact_tokens: [OperationalAwarenessService, RuntimeResourceGovernor, ObservableWorkId, LeaseCoordinator, LeaseId, ExecutionHostId, ExecutionEnvironmentId]
negative_constraints:
  - Do not define a testing-local or debugging-local global resource governor, lease authority, or awareness registry.
  - Do not interpret queued, waiting, admitted, degraded, or lease-held as test success.
  - Do not inject raw operational registries into prompts.
owner_hints: [Plans/Automated_Testing_System.md, Plans/Shared_Integration_Runtime.md]
```

### ATS-033 - PM-Native Browser Program And Protected AuthBrowserSession Matrix

```yaml
plan_unit_id: ATS-033
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Browser acceptance uses only the PM-native BrowserRuntimeService, BrowserWorkspace, BrowserPage,
  BrowserAction, Browser Program, and Expert Browser Program contracts. Ordinary BrowserSessions may be used by
  humans or agents under explicit policy and may produce policy-allowed generic Test Capture evidence. A
  protected AuthBrowserSession is human-only, ephemeral, domain-restricted, and redacted. It exposes zero
  access to agents, tools, Back Seat Driver (BSD), recorders, DOM or PageRepresentation extraction, screenshots,
  console, network capture, or storage-state export. Tests may observe only permitted lifecycle and denial
  metadata outside the protected boundary; they may not inspect protected page content or convert a human auth
  interaction into automated evidence.
gui_related: true
gui_classification_reason: The matrix validates visible Browser Program behavior and the human-only protected authentication surface.
depends_on: [ATS-009, ATS-010]
unblocks: []
acceptance_criteria:
  - Ordinary-session fixtures cover named Browser Program actions, Expert Browser Program policy gates, requested/effective runtime disclosure, redaction, visibility, background continuation, artifacts, and cleanup.
  - Protected-session fixtures prove human-only creation and interaction, explicit domain allowlist enforcement, ephemeral teardown, redacted exterior metadata, and zero agent/tool/BSD/recorder/DOM/PageRepresentation/screenshot/console/network/storage-state access.
  - Cross-domain navigation, redirect, popup, download, file upload, deep link, clipboard, external protocol, certificate error, and permission prompt fixtures block or require the exact human decision allowed by policy without broadening the domain grant.
  - Restart, crash, disconnect, expiry, and presumed-success fixtures prove AuthBrowserSession never silently resumes, persists content, exports state, or auto-closes as successful without explicit allowed flow evidence.
  - Passing Plan/index validation or ordinary-browser tests is not proof of the protected boundary; executable negative probes at every agent/tool/BSD/capture interface are required.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future PM-native Browser Program and Expert Browser Program action matrix
  - future protected AuthBrowserSession human-only and zero-capture negative matrix
risk_class: protected_auth_browser_exposure
reasoning_tier: high
context_scope: pm_native_browser_auth_acceptance
implementation_surfaces: [Plans/Automated_Testing_System.md, Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Shared_Integration_Runtime.md, Plans/Permissions_System.md]
node_compile_hint: {mode: browser_auth_boundary_matrix_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/04_LSP_DAP_EVAL_MCP_BROWSER_AND_WORKTREES.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/09_TEST_MIGRATION_AND_ACCEPTANCE_MATRIX.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/BROWSER_TERMINOLOGY_FINAL_CORRECTION.md
preserved_exact_tokens: [BrowserRuntimeService, Browser Program, Expert Browser Program, AuthBrowserSession, human-only, ephemeral, domain-restricted, BSD]
negative_constraints:
  - Do not expose protected AuthBrowserSession content, state, or controls to an agent, tool, BSD, recorder, DOM/PageRepresentation reader, screenshotter, console reader, or network observer.
  - Do not use a protected authentication interaction as an automated content oracle or capture source.
  - Do not weaken the protected boundary because an ordinary BrowserSession supports automation or evidence capture.
owner_hints: [Plans/Automated_Testing_System.md, Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Shared_Integration_Runtime.md, Plans/Permissions_System.md]
```

### ATS-034 - Multi-Agent BrowserWorkspace Fencing Matrix

```yaml
plan_unit_id: ATS-034
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Concurrent browser testing isolates each agent or task in a policy-compatible BrowserWorkspace and dedicated
  BrowserPage unless an explicit read-only observation contract applies. Each action carries Server, Host,
  Environment, Project, Plan, Goal, run, attempt, agent, operation, BrowserSession, BrowserWorkspace,
  BrowserPage, BrowserControllerLease generation, expected PageGeneration, and sequence. Exactly one mutating
  controller lease may be valid for a BrowserPage PageGeneration; navigation advances PageGeneration and fences
  every late action. Read-only observers never gain mutation authority, and users' PM web-client tabs, ordinary
  browsing, workspace previews, and protected AuthBrowserSessions are not agent test workspaces.
gui_related: true
gui_classification_reason: This unit validates concurrently visible/watchable browser pages and their interaction ownership.
depends_on: [ATS-032, ATS-033]
unblocks: []
acceptance_criteria:
  - Concurrent-agent fixtures prove separate storage/profile, proxy, locale, device, extension, permission, download, artifact, log, and cleanup scope where policy requires isolation.
  - Same-page mutation races prove exactly one live BrowserControllerLease per PageGeneration, deterministic loser behavior, and no duplicate or reordered mutation.
  - Navigation, redirect, reload, crash, restore, controller handoff, lease renewal, and owner-epoch fixtures advance or validate PageGeneration and reject late actions.
  - Observer fixtures prove read-only viewing cannot click, type, navigate, grant permissions, alter storage, or acquire controller authority implicitly.
  - Passing a single-agent happy path or producing screenshots does not prove concurrency isolation; executable races and stale-generation probes are required.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future BrowserWorkspace isolation and BrowserControllerLease race matrix
risk_class: cross_agent_browser_mutation_or_state_bleed
reasoning_tier: high
context_scope: multi_agent_browser_fencing
implementation_surfaces: [Plans/Automated_Testing_System.md, Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Shared_Integration_Runtime.md]
node_compile_hint: {mode: multi_agent_browser_fencing_matrix_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/04_LSP_DAP_EVAL_MCP_BROWSER_AND_WORKTREES.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/09_TEST_MIGRATION_AND_ACCEPTANCE_MATRIX.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/02_FULL_THREAD_CURRENT_DECISION_REGISTER.md
preserved_exact_tokens: [BrowserWorkspace, BrowserPage, BrowserControllerLease, PageGeneration, one mutating controller lease per page generation]
negative_constraints:
  - Do not share a mutable BrowserWorkspace or BrowserPage across agents by default.
  - Do not infer mutation authority from focus, visibility, tab selection, or read-only observation.
  - Do not accept a stale lease generation, owner epoch, PageGeneration, or action sequence.
owner_hints: [Plans/Automated_Testing_System.md, Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Shared_Integration_Runtime.md]
```

### ATS-035 - PM Browser Dependency Prohibition And External Project Test Exception

```yaml
plan_unit_id: ATS-035
unit_type: constraint
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Puppet Master has no PM-owned Playwright runtime, browser backend, facade, compatibility vocabulary or
  namespace, package dependency, server or exposed port, MCP route, command or alias, support bundle, Doctor or
  Settings capability, or capture engine. PM-native capture remains BrowserRuntimeService, compositor,
  frame-stream, platform, device, or remote-adapter based. A user Project may independently declare and run a
  Playwright suite under Project tooling policy as a generic external Project command/process; Puppet Master may ingest only
  generic Test Capture and artifact references attributed to that Project process. The external suite does not
  define Browser Program, gain browser ownership, inherit a protected AuthBrowserSession, or create any PM API,
  facade, compatibility promise, MCP surface, command family, port, package, or capture dependency.
gui_related: false
gui_classification_reason: This unit is a runtime/dependency and external-process boundary, not visible browser presentation.
depends_on: [ATS-033]
unblocks: []
acceptance_criteria:
  - PM-owned dependency, package, command, MCP, port, Settings, Doctor, support-bundle, capability-label, schema, receipt, and capture-engine scans find no prohibited implementation or compatibility surface.
  - A fixture user Project with its own suite can run that suite through the generic external Project command/process path and attach generic Test Capture/artifact refs with explicit external Project attribution.
  - Negative fixtures prove the external process cannot acquire PM BrowserWorkspace, BrowserControllerLease, AuthBrowserSession, credential, profile, or internal browser transport authority merely because its artifacts are ingested.
  - The external Project exception is not a fallback for BrowserRuntimeService and cannot satisfy a PM-native Browser Program conformance test.
  - Text search alone is not runtime proof; dependency graph, process/port inventory, command/catalog/MCP registration, Settings/Doctor, artifact lineage, and authority-boundary fixtures are all required.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future PM browser dependency and registration negative scan
  - future generic external Project command/process and artifact-lineage fixture
risk_class: forbidden_browser_compatibility_dependency
reasoning_tier: high
context_scope: pm_browser_dependency_prohibition
implementation_surfaces: [Plans/Automated_Testing_System.md, Plans/Section15_MVP_Promoted_Features_Spec.md]
node_compile_hint: {mode: browser_dependency_prohibition_matrix_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/SOURCE_AND_PRECEDENCE_MAP.md
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/BROWSER_TERMINOLOGY_FINAL_CORRECTION.md
preserved_exact_tokens: [PM-native Browser Program API, generic Test Capture, external Project test activity]
negative_constraints:
  - Do not implement, expose, label, or imply a PM Playwright runtime, facade, compatibility layer, package, port, MCP route, command, or capture engine.
  - Do not promote an external Project dependency into Puppet Master installation, capability, onboarding, Settings, Doctor, support, or browser ownership.
  - Do not claim the absence scan or external-process fixture proves all Browser Program behavior.
owner_hints: [Plans/Automated_Testing_System.md, Plans/Section15_MVP_Promoted_Features_Spec.md]
```
