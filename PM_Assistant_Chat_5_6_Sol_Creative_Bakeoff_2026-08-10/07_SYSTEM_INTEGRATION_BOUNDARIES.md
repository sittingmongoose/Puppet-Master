# System Integration and Ownership Boundaries

The concepts demonstrate product behavior and track impact. They do not create duplicate runtime owners.

## Shell

The Activity Bar is the narrow left navigation rail and controls one adjacent left side-panel slot. Chat, pinned history, and left artifact workspace must respect current shell geometry without creating a second Activity Bar.

Use current PMConcept7 for the latest surrounding shell. A representative fresh shell is Basic Dark with Chat open and current Editor Panel 1 content, but the Chat bakeoff does not redesign Home, editor panels, source control, or the Activity Bar.

Do not place a giant Project/Server banner inside Chat.

## Provider and model ownership

Canonical hierarchy:

```text
Provider family
  Account/profile
    Connection
      Product/plan/entitlement
        Models/capabilities
```

Provider installation is a separate Host/Environment resource.

Chat owns selection, compact route state, warnings, and setup deep links. Provider Settings/Integration Runtime own installation, authentication, account/profile management, updates, repair, model refresh, and diagnostics. Multi-Account/routing owns requested/effective route and fallback.

Usage owns measured/provider-reported allowance, history, forecast, settlement, and data quality. Chat consumes a projection.

## Context, memory, Persona, and instructions

Prompt Pipeline/Context Admission owns what enters a request. Context Lens displays the receipt and lets the user shape selected content. It may list the applicable deduplicated scoped `AGENTS.md` sources and selected tool/Skill/MCP schemas, but does not dump whole rule files or catalogs.

Assistant memory owns verified degrading Gists. Half-life affects retrieval activation only; the roughly 350-token Working Set is a maximum, not a target. It is not copied into child agents or automated systems.

Persona registry owns Persona definitions and bounded capsules. Persona does not own permissions or routes.

FileSafe and Permissions enforce deterministically outside model prose.

## Threads and server

The Project Home Server owns canonical thread state, Goal state, outbox, branch tree, and durable operations. Clients observe and interact through authenticated APIs.

Thread list uses lightweight shells; focused thread uses detailed subscription. Pinned history does not imply all details are live.

Environment connection supervision owns reconnect/replay/snapshot. Chat displays domain-specific state rather than declaring the whole app disconnected when one subscription fails.

## Goal, agents, Crew, resources

Goal Runtime owns objective, phase, cursor, tasks, checkpoints, children, evidence, replan, and certification.

Orchestrator owns child admission, capacity, route resolution, nesting, provider permits, worktrees, and execution waves.

Crew is an Orchestrator execution composition.

RuntimeResourceGovernor owns admission/fairness with Host/Environment-local enforcement. ObservableWork owns truthful progress/wait projections.

Chat renders these systems and dispatches canonical commands. User-facing PRD Builder and Planning Wizard discussion/architecture/final synthesis use a high-quality qualified planning route by default; resource pressure changes scheduling, not the quality tier silently.

## Worktrees, ports, tests, and debug

Worktree Manager, source-control systems, test runtime, BrowserSessionBroker, DAP, LSP, eval, device/emulator/simulator managers, and resource leases remain their own owners.

Chat shows compact progress, conflicts, Open/Watch/Details, evidence, and recovery actions.

## Artifacts

Artifact service owns identity, path, versions, retention, lineage, redaction, and opening/reveal. Chat owns the inline shortcut and surrounding workspace handoff.

Large compacted tool results can remain recoverable immutable artifact references.

## Browser

PM owns a native Browser Program API over its Browser Runtime. Use PM-native names. Protected authentication browser sessions are human-only and opaque to agents and Chat capture.

No PM-owned Playwright runtime/facade/compatibility layer.

## Notifications

The canonical title-bar stack/count/inbox owns app-wide notifications. Chat may show inline task outcomes but does not create another notification center.

## Settings and scope

Thread-local controls change the current thread. Project/global defaults affect future threads. A user or agent must explicitly request and confirm broader scope.

Chat can deep-link to Settings for persistent policy, cross-project permission, provider setup, spellcheck dictionaries, BSD default, Crew templates, or installation repair.

## Server/WSL/container truth

Home Server, Execution Host, Execution Environment, and Source Location are distinct.

- Native Windows is complete without WSL.
- WSL is optional and environment-specific.
- Native macOS/Linux remain first-class.
- Docker/TrueNAS/Unraid/Kubernetes deployments can be full Servers and Execution Hosts.
- Installation/profile/auth state belongs to the Host/Environment that uses it.

Chat uses human labels and only shows placement when useful.

## Security and privacy

Never display secrets, tokens, OAuth codes, raw helper responses, protected AuthBrowser content, or unredacted credential/profile paths.

Cross-project, alternate-provider attachment routing, paid continuation, Full Access, protected writes, external effects, and persistent approvals retain explicit policy and receipt boundaries.
