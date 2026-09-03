# Shard 022: Full-Thread Performance And Continuity Addendum - 2026-08-31

Source: `Plans/Shared_Integration_Runtime.md`

Source lines: L800-L1035

Source SHA256: `f88fb4ba43e4f4ebe35d05fbcca41c262ca95ad1aff4b2ab2c7f8dfac59c2058`

---

## Full-Thread Performance And Continuity Addendum - 2026-08-31

This addendum compiles the retained Full Thread Performance requirements into the existing shared-runtime owner. It does not create a `ResourceGovernor`, progress service, scheduler, connection manager, Event Authority, or plugin runtime beside the existing `RuntimeResourceGovernor`, `ObservableWork`, `EnvironmentConnectionSupervisor`, `ThreadCommandOutbox`, `ProjectionReplayCoordinator`, and `StreamCoalescer`. The closed value envelopes are `SchemaID:pm.full_thread_runtime.contracts.v1` in `Plans/full_thread_runtime_contracts.schema.json`; they specify durable values and receipts only and do not claim executable handlers or runtime proof.

### Separate decision, command, and work axes

Every admitted operation preserves three independently changing axes. Consumers must not flatten them into one overloaded status:

1. `GovernorDecisionRecord.decision` is exactly `admitted | queued | admitted_degraded | permission_blocked | resource_blocked | cancelled`. It records the requested and effective budgets, physical-parent budget identity, policy generation, host observation, reason, lease refs, and reevaluation trigger. Host-local enforcement of a Home-Server policy is not a second governor.
2. `CommandOutcomeRecord.outcome` is exactly `accepted | acknowledged | executing | succeeded | failed | cancelled | rejected | terminal_unknown`. Acceptance or same-frame acknowledgement proves only that the command entered its durable command lineage; neither value proves that the work started or completed.
3. `ObservableWorkRecord.work_state` is exactly `accepted | queued | starting | running | waiting | retrying | reconnecting | backgrounded | degraded | stalled | committing | verifying | testing-route | migrating-route | rolling-back | completed | failed | cancelled | recovery-required`. A waiting row carries one typed wait reason and next reevaluation condition. Completion remains owner-receipt-backed; command success alone cannot fabricate it.

The `testing-route` and `migrating-route` values describe active routed work, not successful testing or migration. `degraded` and `stalled` remain nonterminal until an owner receipt moves them to a terminal state. `backgrounded` changes presentation priority only; it does not cancel, pause, orphan, or weaken durable work.

This addendum supersedes only the closed admission/status spellings in §8.1-§8.2; it does not supersede or duplicate the services. Existing `pm.shared_runtime.contracts.v1` rows are compatibility/import values and normalize once at the owner boundary: `admitted_reduced -> admitted_degraded`; a legacy `blocked` row becomes `permission_blocked` or `resource_blocked` from its mandatory typed reason and otherwise fails migration; `rejected` requires the same reasoned blocked disposition or fails migration. Legacy work values normalize as `preflighting -> starting`, `awaiting_permission -> waiting(permission)`, `awaiting_user -> waiting(user)`, `awaiting_resource -> waiting(resource)`, `retry_backoff -> retrying`, transport `reconciling -> reconnecting`, non-transport `reconciling -> starting` with the preserved reconcile phase, `cancelling -> running` with the human phase `Cancelling` and no further cancel action, `succeeded -> completed`, and `recovery_required -> recovery-required`; unchanged spellings remain unchanged. New producers emit only `pm.full_thread_runtime.contracts.v1` values. Consumers do not expose both vocabularies, and ambiguous legacy rows fail closed rather than inventing a status.

### Logical concurrency, fairness, and physical budgets

Chats, threads, named Plans, Goals, WorkNodes, Browser tasks, provider attempts, and agents are durable logical state machines rather than dedicated operating-system threads or processes. The canonical execution lanes are the Slint UI thread, a protected interactive control/projection reserve, the async I/O runtime, a bounded CPU work-stealing pool, a bounded blocking/platform/install pool, ordered storage append/projector/index lanes, and governed external-process pools. Consumers may request a domain ceiling, but they may not instantiate a peer pool governor or multiply independent Tokio, Rayon, Tantivy, renderer, CEF, compiler, test, LSP, provider-helper, compression, or image-library budgets without a governor mapping.

The shared physical-parent budget tree prevents native hosts, WSL environments, containers, and Kubernetes workloads from each claiming the full parent CPU, memory, process, network, GPU/media, or storage budget. Admission applies Project-first then named-Plan fairness, weighted aging, temporary interaction boost, anti-starvation, completion-aware capacity, and provider/account/model/reset/cost limits. Required specialists and tests run in admitted waves; resource pressure may queue a wave but never silently remove it.

Resource families include CPU, memory, process, watcher, descriptor, queue, log, artifact, network, port, storage, index, browser, capture, provider, LSP, DAP, Eval, MCP, test host, device, container, worktree, and package-manager-root pressure. These are mapping keys into the one governor, not new resource owners. One seglog writer, one worktree writer per fenced scope, one Browser page mutation controller per page generation, one package-manager-root mutator, one Goal owner epoch, and one activation switch are serialized even while independent owners proceed concurrently.

### Same-frame acknowledgement and truthful projection

A user command that can be durably accepted must publish a visible pending shell in the dispatch frame where feasible, recording the command frame, acknowledgement frame, command instance, operation, target generation, and acknowledgement receipt. If the durable accept cannot be obtained in that frame, the UI may show only a non-success provisional affordance and must reconcile it to the durable command outcome. Pause, stop, New Plan, connect, install, Browser, and test controls never wait for broad hydration before showing the accepted pending shell, and any later failure rolls that shell back truthfully.

Long lists are stable-ID, bounded, virtualized projections. Producers send narrow deltas and collection generations; consumers render only a bounded visible window plus a bounded overscan and preserve selection by identity. Streamed fragments are frame-batched under `StreamCoalescer`; terminal, approval, security, lease-loss, failure, cancellation, and completion frames bypass ordinary coalescing. Latest-request-wins may cancel obsolete projection work, but it cannot cancel the underlying durable operation unless the owning command explicitly requests cancellation.

Inactive, hidden, off-screen, collapsed, and undocked surfaces share owner subscriptions and suppress expensive hydration, paint, animation clocks, media decode, and per-token repaint. Paint suppression never stops Server-owned work, drops canonical events, releases a lease, changes an `ObservableWork` terminal outcome, or suppresses a receipt. Returning visibility rehydrates from the current generation instead of replaying every hidden paint frame.

### Generation fencing, deduplication, and continuity

Every command, projection delta, continuation, retry, subscription, route return, and result binds `OperationId`, command/attempt identity where applicable, owner generation, topology generation, projection generation, and an idempotency or deduplication key. A stale or superseded generation is rejected with an explicit receipt and cannot mutate the current projection. Same-payload retries retain the same logical identity; a genuinely new provider or local attempt receives a new `AttemptId` and links to the parent operation.

Reconnect, process restart, operating-system sleep/wake, and external-return navigation preserve the same logical operation, command instance, durable owner, target object, return route, and continuation generation. They may create a new transport epoch or attempt but do not mint a second logical effect. Startup and return first show the compact cached shell, then reconcile owner truth; absence of a response or a lost client is never converted to cancellation or success. Replay/live overlap, projector retry, reconnect, and duplicate external-return callbacks are deduplicated before projection and Usage attribution.

### Platform-specific host adapters

These are required adapter and measurement boundaries under the one `RuntimeResourceGovernor`; they are not separate schedulers, portable-proof substitutes, or evidence that an adapter exists. A producer may claim a native path only after capability detection and target-specific runtime evidence. An unavailable or weaker platform path remains explicit and cannot be reported as native success.

**macOS and Apple Silicon**

- First-party helpers are native arm64. macOS QoS/work classification is used instead of hard-pinning presumed performance/efficiency core IDs: interactive controls are `user-interactive` or `user-initiated`; foreground Project work is `user-initiated`; index, download, and validation work is `utility`; cleanup, checks, and backups are `background`. The governor still owns admission and reserve while macOS supplies topology-aware placement.
- Thermal pressure and Low Power Mode reduce speculative work, background fan-out, recording quality, index-merge frequency, and decorative animation while preserving active UI/control, durable writes, the active provider stream, pause/stop/approval, recovery, and rollback.
- One unified-memory budget accounts for Rust state, CEF surfaces/helpers, decoded media, renderer textures, capture rings, simulators, local tools, and readback/encoding buffers.
- FSEvents serves large repository trees without one expensive watcher per file. APFS clones are opportunistic only for same-volume snapshots or disposable test workspaces and retain normal-copy fallback.
- Browser evidence uses CEF/page-native capture. ScreenCaptureKit supplies native Puppet Master, external-app, simulator, emulator, or window capture where appropriate. Dirty-region comparison/encoding may optimize capture only with periodic full keyframes and honest dropped/degraded evidence. Accelerate, vDSP, or BNNS may back image/vector kernels only after measured proof.
- macOS 27 container-machine and Foundation Models integrations remain optional, feature-detected adapters rather than launch assumptions; adoption still requires FileSafe, receipts, networking, lifecycle, and cross-platform provider contracts.

**Windows**

- Sockets, process pipes, PTYs, and high-concurrency file operations use completion-based asynchronous I/O and do not allocate one thread per handle. The admitted packet does not freeze `IOCP` or a particular wait API as a product contract.
- Normal filesystem watching uses `ReadDirectoryChangesW`; NTFS USN data is optional acceleration for overflow, recovery, or long disconnect and always retains a normal fallback.
- Latency-critical controls use high QoS; maintenance uses EcoQoS or equivalent efficiency policy.
- Startup, input-to-paint, provider receive-to-paint, storage, Git, process launch, Browser lifecycle, queues, and Goal phases emit ETW/WPR/WPA-compatible instrumentation. Resource evidence measures the total process tree rather than the primary process alone.
- Large processor-group systems are supported and third-party pool assumptions are tested without indiscriminate affinity.
- Native and standalone Windows are complete execution hosts with WSL off. WSL is an optional selectable execution backend and cannot be a hidden prerequisite or substitute for native Windows proof.

**Linux**

- Asynchronous I/O is epoll-backed. Local change observation uses inotify with bounded reconciliation after overflow or reconnect; remote, NFS, and SMB repositories use local metadata/index caches plus bounded reconciliation and never claim local-watcher guarantees.
- CPU, memory, and I/O pressure response consumes PSI; limits and weights are cgroup-aware when available. The supported minimum libc/runtime floor is explicit rather than inferred from the build host.
- `io_uring`, NUMA, and huge-page specialization are optional and may activate only after end-to-end evidence; the portable path remains available. The admitted packet does not freeze fanotify, timerfd, signalfd, or pidfd as product requirements.
- Full desktop operation remains supported on older Xeon/Ivy Bridge-class systems. A future headless/standalone package may omit GUI assets or renderers but cannot redefine or weaken the desktop-first performance model.

The mechanism names and constraints above are sourced from the Full Thread decision register and its correction/return extracts. Static Plans, schemas, fixtures, or platform-name coverage do not prove native execution, performance, capture, filesystem, power, thermal, or recovery behavior.

### Low-resource and legacy-platform behavior

The compatibility path remains a portable x86-64 baseline and may select measured runtime-dispatched hot kernels; no global AVX2 or `target-cpu=native` requirement is permitted. Native arm64 remains native. Low-memory, battery, thermal, PSI/cgroup, network, and old-hardware profiles first cancel obsolete speculation, pause maintenance, stop prefetch/prewarm, shrink bounded caches and media rings, close idle helpers/readers, reduce background concurrency, and safely defer low-priority waves. They preserve UI/control reserve, active streams, durable commits, rollback, pause/stop, authentication safety, and owner recovery. A reduced profile cannot remove a feature, silently skip a required specialist/test, fabricate completion, or weaken Permissions, FileSafe, authentication, provenance, or public-ingress gates.

### Public ingress authentication and rate gate

Endpoint ownership remains with the Server and security owners. Shared runtime owns only the ordered admission composition for an already-declared endpoint. LAN/private access and explicit public Funnel/reverse-proxy/custom-domain exposure remain distinct; public exposure is explicit, off by default, and never an authentication boundary by itself.

`PublicIngressGateDecision` binds endpoint identity/generation, transport/request identity, exposure class, authentication decision ref, rate-policy decision ref, permission/security refs, and a decision of `admitted | authentication_required | authentication_rejected | rate_limited | blocked_policy | stale_generation`. For public traffic, authentication and rate decisions are mandatory and occur before Project/Vault/provider/plugin hydration, large body handling, Browser/CEF creation, model dispatch, expensive routing, or durable mutation. Rejected unauthenticated or rate-limited traffic receives a bounded redacted response and operational attribution only; it never becomes model Usage or an `ObservableWork` success.

### Commands, events, wiring, and GUI/reverse coverage

No new performance-only command family is introduced. Existing owner commands dispatch through their existing central IDs and return `CommandOutcomeRecord` plus an optional `ObservableWorkRecord` ref. `cmd.environment.connect`, `cmd.environment.reconnect`, and `cmd.environment.disconnect` retain connection ownership; installation, authentication, Browser, test, Goal, and Plan controls retain their named owners. A GUI control has exactly one canonical command dispatch, one stable command instance, one same-frame acknowledgement path, one current generation selector, and one owner receipt path.

These new records are receipt/projection values. They emit no new EventRecord while Event Authority is open. `event_effect_policy` remains `receipt_only_no_eventrecord_pending_event_authority`; existing admitted producer events remain governed by their existing owner registrations.

| Owner fact | Forward consumers | Reverse proof required |
|---|---|---|
| Governor decision and effective physical budget | Executor, Goal, Orchestrator, Browser, Testing, Plugins, Usage | request identity, policy/host generations, requested/effective budget, decision, reason, reevaluation, lease refs |
| Command outcome and same-frame acknowledgement | every command-driven GUI surface | control role/name, exact command ID, one dispatch, frame IDs, command instance, durable acknowledgement/result refs, rollback fixture |
| Observable work lifecycle and waits | Chat, Orchestrator, Usage, Settings, Doctor, Plugins | all closed work states, typed wait/queue reason, freshness, valid controls, owner result/receipt refs |
| Bounded virtualized projection | long lists, thread shells, Usage ledgers, Plugins inventory | stable IDs, collection/projection generations, bounded window/overscan, narrow-delta and stale-generation fixtures |
| Continuity and deduplication | reconnect/restart/sleep/external return consumers | unchanged logical operation, transport/attempt change evidence, dedupe key, stale-result rejection, no duplicate effect/Usage |
| Hidden-surface suppression | all inactive or off-screen GUI surfaces | paint/hydration/animation suppression plus proof that durable work, events, leases, receipts, and terminal outcomes continue |
| Public ingress gate | Server transport and authenticated native/web clients | public-off default, auth-before-hydration, rate-before-hydration, bounded redacted rejection, no model Usage |

ContractRef: SchemaID:pm.full_thread_runtime.contracts.v1, Invariant:HostLocalRuntimeResourceGovernor, Invariant:ObservableWorkTruth, ContractName:Plans/usage-feature.md, ContractName:Plans/Release_Supply_Chain.md

### SIR-015 - Full-Thread Admission, Command, And Work Axes

```yaml
plan_unit_id: SIR-015
unit_type: schema_contract
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  The one RuntimeResourceGovernor and one ObservableWork vocabulary preserve separate governor-decision,
  command-outcome, and work-lifecycle axes; every logical operation is generation-fenced, deduplicated,
  restart/reconnect/sleep/external-return stable, and projected through bounded virtualized state.
gui_related: true
gui_classification_reason: Same-frame acknowledgement, wait/progress state, bounded lists, hidden-surface behavior, and continuity are user-visible.
depends_on: [SIR-004, SIR-005, SIR-006, SIR-007, SIR-011]
unblocks: [SIR-016, SIR-017, UF-097]
acceptance_criteria:
  - Governor decision, command outcome, and work lifecycle remain three independent closed axes.
  - Legacy shared-runtime admission/work spellings normalize once through the explicit compatibility map; new producers and consumers expose only the full-thread vocabulary and ambiguous rows fail closed.
  - ObservableWork accepts every retained state from accepted through recovery-required, including testing-route and migrating-route, without treating a route as successful proof.
  - The PMConcept7 browser fixture exposes exactly seven deterministic ObservableWork evidence rows, six GovernorDecision outcome rows, and five bounded-list families (findings, history, logs, provider, receipts), each with stable identity, truthful reason/reevaluation metadata, bounded row/byte metadata, and an explicit browser-fixture-only boundary; these rows do not prove native or production execution.
  - Same-frame acknowledgement is durable-command acknowledgement only and rolls back truthfully on later failure.
  - Stable-ID virtualized projections reject stale generations and hidden-surface paint suppression never cancels durable work.
  - Reconnect, restart, sleep, and external return preserve logical identity and deduplicate replay/projector overlap.
validation_surfaces: [Plans/full_thread_runtime_contract_fixtures.json, Concepts/pm7-tools/verify/full_thread_performance.mjs, future command acknowledgement, stale-generation, virtualization, continuity, and low-resource tests]
risk_class: full_thread_axis_or_identity_conflation
reasoning_tier: high
context_scope: full_thread_runtime_axes_and_continuity
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/full_thread_runtime_contracts.schema.json, Concepts/pm7-tools/full_thread_performance_source.py, Concepts/pm7-tools/verify/full_thread_performance.mjs]
node_compile_hint: {mode: full_thread_runtime_axes_and_continuity, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08/02_FINAL_DECISION_REGISTER.md
  - PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08/04_DATA_CONTRACTS_AND_STATE_MACHINES.md
  - PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08/08_ACCEPTANCE_TEST_AND_FAILURE_MATRIX.md
preserved_exact_tokens: [RuntimeResourceGovernor, ObservableWork, same-frame, testing-route, migrating-route, external-return]
negative_constraints:
  - Do not create a peer governor, scheduler, progress service, connection manager, Event Authority, or OS thread per logical activity.
  - Do not flatten admission, acknowledgement, and lifecycle into one status.
  - Do not let projection cancellation or paint suppression cancel durable owner work.
```

### SIR-016 - Public Authentication And Rate Admission Gate

```yaml
plan_unit_id: SIR-016
unit_type: security_contract
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  Explicit public ingress composes endpoint-owner authentication and rate-policy decisions before expensive
  hydration or mutation, fails closed on stale generations, and records only bounded redacted operational
  attribution for rejected traffic without becoming an endpoint, authentication, rate-policy, or Usage owner.
gui_related: false
depends_on: [SIR-002, SIR-015]
unblocks: []
acceptance_criteria:
  - Public exposure remains explicit and off by default and is never treated as an authentication boundary.
  - Authentication and rate decisions precede Project, provider, plugin, Browser, model, and durable-mutation hydration.
  - Rejection is bounded, redacted, generation-fenced, and never counted as model Usage or successful work.
validation_surfaces: [Plans/full_thread_runtime_contract_fixtures.json, future public unauthenticated, rate-limit, stale-endpoint, and hydration-short-circuit tests]
risk_class: public_ingress_pre_auth_hydration
reasoning_tier: high
context_scope: public_ingress_auth_rate_composition
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/full_thread_runtime_contracts.schema.json]
node_compile_hint: {mode: public_ingress_auth_rate_composition, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08/02_FINAL_DECISION_REGISTER.md
negative_constraints:
  - Do not treat Funnel, reverse proxy, TLS, endpoint reachability, or public exposure as authentication.
  - Do not hydrate expensive domain state before both required gates admit public traffic.
```

### SIR-017 - Performance And Recovery Evidence Gate

```yaml
plan_unit_id: SIR-017
unit_type: acceptance
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  Full-thread runtime acceptance requires measured user-visible latency, process-tree memory, wakeups,
  power/thermal behavior, queue delay, recovery, old-hardware, platform, stale-generation, low-resource,
  and 24-hour-soak evidence; static schema or wiring checks remain pre-build evidence only.
gui_related: false
depends_on: [SIR-012, SIR-015, SIR-016, SIR-018]
unblocks: []
acceptance_criteria:
  - Input acknowledgement, pause/stop acknowledgement, provider-fragment paint, idle, queue, and startup gates use P50/P95/P99, worst-case, and degraded/failure evidence.
  - Workloads cover 1, 10, 50, and 200 logical threads, many named Plans, browser/provider/tool saturation, old x86, Apple Silicon, native Windows without WSL, optional WSL, Linux/container/Kubernetes, low resources, restart, and a 24-hour soak.
  - Portable and optimized hot paths have equivalence, fuzz, boundary, and end-to-end evidence, and no unsupported runner is reported as pass.
validation_surfaces: [future full-thread benchmark matrix, process-tree resource captures, platform receipts, independent runtime audit]
risk_class: static_evidence_promoted_to_performance_proof
reasoning_tier: high
context_scope: full_thread_performance_acceptance
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, tests]
node_compile_hint: {mode: full_thread_performance_acceptance, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08/07_PERFORMANCE_PLATFORM_STORAGE_BENCHMARKS.md
  - PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08/08_ACCEPTANCE_TEST_AND_FAILURE_MATRIX.md
negative_constraints:
  - Do not report schema, static wiring, concept UI, or an unavailable platform lane as runtime or performance success.
```

### SIR-018 - Platform-Specific Host Adapter Boundaries

```yaml
plan_unit_id: SIR-018
unit_type: platform_requirement
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  Native macOS, Windows, and Linux hosts implement the exact capability-probed I/O, watcher, pressure,
  filesystem, capture, tracing, topology, and compatibility boundaries in the platform-specific host-adapter
  section while retaining the one RuntimeResourceGovernor, portable fallbacks, explicit degraded/unavailable
  outcomes, and target-specific evidence. Unsourced mechanism names are not promoted into product contracts.
gui_related: false
depends_on: [SIR-004, SIR-015]
unblocks: [SIR-017]
acceptance_criteria:
  - macOS preserves native arm64 and QoS classification, thermal and Low Power reduction ordering, unified-memory accounting, FSEvents, same-volume APFS clone fallback, and source-appropriate capture with periodic full-keyframe and degraded-evidence truth.
  - Windows preserves completion-based asynchronous I/O without one thread per handle, ReadDirectoryChangesW plus optional USN recovery acceleration, control QoS plus maintenance EcoQoS, ETW/WPR/WPA-compatible tracing, total process-tree accounting, large-topology testing, and complete native operation with WSL off.
  - Linux preserves epoll and inotify with bounded overflow/reconnect reconciliation, PSI/cgroup pressure response, an explicit runtime/libc floor, bounded remote/NFS/SMB reconciliation, and evidence-gated optional io_uring, NUMA, and huge-page specialization.
  - IOCP, a particular Windows wait API, fanotify, timerfd, signalfd, and pidfd are not claimed as frozen packet requirements; a later adoption requires separate owner evidence and canonical amendment.
  - Static text or schema coverage earns no native runtime, performance, capture, filesystem, power, thermal, or recovery credit.
validation_surfaces: [future macOS Apple-Silicon and Low-Power tests, future native-Windows-without-WSL tests, future Linux minimum-runtime and remote-filesystem tests, future target-specific capture and tracing receipts]
risk_class: platform_adapter_mechanism_or_evidence_overclaim
reasoning_tier: high
context_scope: full_thread_platform_host_adapters
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, future native platform adapters and tests]
node_compile_hint: {mode: full_thread_platform_host_adapter_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:PKT-05/02_FINAL_DECISION_REGISTER.md:42-64
  - source_ref:packet:performance_final/02_FULL_THREAD_CURRENT_DECISION_REGISTER.md:210-280
  - source_ref:packet:performance_final/03_RETURN_TO_PROJECT_SYNCING_AND_UPDATES_FULL_THREAD.md:193-219
preserved_exact_tokens: [native arm64, QoS, Low Power Mode, unified memory, FSEvents, APFS clones, ScreenCaptureKit, Accelerate, completion-based asynchronous I/O, ReadDirectoryChangesW, USN, EcoQoS, ETW, WPR, WPA, epoll, inotify, PSI, cgroup, io_uring, NUMA, huge-page]
negative_constraints:
  - Do not create a platform-local governor or a thread per Windows handle.
  - Do not report optional acceleration, a weaker platform substitute, or an unavailable lane as native proof.
  - Do not invent a frozen mechanism name that the admitted packet does not contain.
```
