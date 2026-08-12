# Cumulative Decisions from the Full Thread

These requirements were added after the original Assistant Chat redesign packet. They are binding behavioral and ownership constraints, not visual prescriptions.

## 1. Pinned history and workspace geometry

Pinned history must be real persistent geometry, not a changed icon.

Required states:

```text
Closed
Transient peek
Pinned compact
Pinned full, when room permits
```

Pinned history is a sibling workspace region. It never covers transcript, composer, actions, or scrollbars. It uses spare host space before shrinking Chat, maintains a declared readable Chat floor, and converts to a compact pinned form when full history cannot fit. It persists through thread switch, resize, dock/pop-out, and artifact use.

Pinned rows should consume lightweight thread-shell summaries rather than subscribing every pinned thread to full transcripts and tool streams.

## 2. Left artifact workspace

Artifacts load **to the left of Chat**, outside transcript and composer. Demonstrate code/file, multi-file diff, image/test screenshot, and report/document, with loading, ready, updated, error/retry, switch, close, and restoration.

History, artifact, Chat, and composer must coexist without overlap or severe Chat compression. Opening an artifact does not automatically admit it into model context.

## 3. Distinct questions and compact work

Every thread concept needs its own visible question composition and motion language. Shared state is allowed; one cloned renderer with cosmetic skins is not.

Each concept also explores a distinct compact relationship among Goal, Todo, subagents, tool activity, tests, diffs, verification, and artifacts. Completed work condenses into a calm durable summary whose individual groups can reopen.

## 4. Provider, account, model, effort, and speed

The picker supports:

```text
Favorites
Recents
Provider icon rail
Search
Provider/account groups
Explicit account/connection
Available/unavailable models and reason
Reasoning/effort when supported
Normal/Fast when supported
```

The same model under two accounts is two routes. Clicking a provider filters to its accounts and models. Model selection keeps the menu stack open while effort and Normal/Fast are chosen.

Requested and effective route may differ; display that truthfully when relevant.

Free Models remain attributable to their underlying provider/account/model and may show ready, setup needed, cooling down, no longer free, or unavailable.

## 5. Access and approvals

Use exactly:

```text
Ask for approval
Auto accept edits
Auto
Full Access
```

Conversation/workflow mode and access profile are separate. Plan and Review can use safe reads, repository search, web search/fetch, browser inspection, screenshots, logs, diagnostics, static analysis, and approved sandboxed tests. Consequential effects remain gated.

When a stricter mode/project/FileSafe policy narrows the selection, show the effective result, e.g. `Full Access · Limited by Review mode`.

Approval UI follows `Compact decision; expandable evidence`.

## 6. Back Seat Driver

The `BSD` control supports:

```text
Off
Auto — default
On
```

Auto runs only when risk/phase signals trigger it and glows only while actually evaluating. On may evaluate every turn and uses a separate theme-aware semantic treatment. Overrides can apply to this turn or current thread.

Represent idle, evaluating, silent result, advice, duplicate-suppressed, timeout, unavailable, and quota-limited states. BSD receives bounded deltas, remains read-only by default, cannot widen authority, and cannot block the primary turn if unavailable.

## 7. Material warnings

Do not interrupt for every route change. Confirm when PM predicts a material change in provider/account/privacy boundary, replay, cache reuse, context size, attachments, tool/MCP availability, cost/allowance, or paid continuation.

Offer context-appropriate actions such as Continue here, Branch with new model, Start new chat, Cancel, and Details. First view stays concise.

## 8. Context, memory, Persona, and minimal prompts

PM retains durable breadth but admits narrow turn context.

Context Lens shows included/omitted sources, reasons, provenance, cache state, and removable excerpts—not raw secrets or giant system prompts.

Compact Now preserves canonical history and branch ancestry and produces an operation receipt.

Memory is tiered. Assistant evidence-backed Gists use half-life to fade from active retrieval, not to change truth, evidence, persistence, or searchability, and remain Assistant-only. The Assistant Working Set is a hard maximum of roughly 350 tokens, not a quota PM tries to fill. Automated systems use explicit thread/ledger/Goal/artifact retrieval.

Persona is behavior, not authority. A bounded Persona capsule enters context; full Persona definitions, permissions, routing preferences, all skills, and all tool schemas do not. Only the applicable, deduplicated scoped `AGENTS.md` chain is admitted. Tool/Skill/MCP state distinguishes installed, enabled, available, selected for this request, and actually invoked.

The OMP-inspired Time-Traveling conditional-rule engine may keep rare model-facing instructions dormant and emit a concise human-readable safeguard/redirect receipt only when triggered. Deterministic Permissions/FileSafe/workflow gates remain external. Do not expose an internal rule dump.

## 9. Thread search, communication, and spawning

Authorized Assistant agents can:

```text
List/search/read project threads
Send a typed request
Await response
Resume an inactive target
Spawn child or sibling thread
Branch from a message/restore point
```

Requests retain source/target thread, sender, bounded task, selected references, scope, budget, status, timestamps, result refs, idempotency, cancellation/timeout, and cycle/fan-out protection.

No hidden shared context and no full-transcript copying.

Human result actions include Open conversation, Add passage to context, Branch from this point, and Copy link.

## 10. Branch, rewind, restore, and redirect

Support Branch from here, branch with model, branch with Persona, immutable restore point, rewind, and sibling re-answering of an earlier questionnaire. Source thread remains unchanged; workspace files are not silently rolled back.

User corrections can redirect an active turn while preserving original attempt, partial output, interruption state, and resumed/replacement attempt.

## 11. Thread-local state

Provider, account/connection, model, Persona, effort, Normal/Fast, mode, access, BSD, Crew, context overrides, and worktree binding default to the current thread.

Project/global defaults affect future threads unless explicitly bulk-applied. Running turns and Goals retain frozen state until an explicit safe update.

## 12. Goal Runtime, subagents, capacity, and Crew

Chat projects shared durable Goal Runtime: objective, phase, progress, tasks, children, pause/resume/stop/update/replan, evidence, artifacts, blockers, and completion receipt. State survives compaction, thread death, server restart, client disconnect, and UI close.

Any agent may request another eligible agent from any available provider; Orchestrator admits it under route, budget, permissions, nesting, worktree, file, port, and resources.

Show sustainable capacity rather than only hard max. Example: six required specialists, two concurrent, three waves, preserving integration/testing/repair reserve. Required roles cannot silently disappear. When Assistant Chat launches or hosts PRD Builder or Planning Wizard discussion, architecture, research judgment, or final synthesis, use a high-quality qualified planner by default. Low usage may reduce waves, queue, wait for reset, or offer another qualified route; it must not silently downgrade the user-facing planner.

Crew is a multi-child execution strategy with roles, routes, board, independent results, waves, worktrees, Usage/resource reason, and parent synthesis. It is not a Persona, mode, provider, permission, or hidden memory.

## 13. Operational awareness

Agents can query task-relevant state for active work, worktrees, file/path leases, ports, processes, services, containers, VMs, WSL, browser/test/debug/device sessions, CPU/memory/disk/GPU, provider allowance/reset/cooldown, logs, backups, snapshots, restore points, testing systems, and debugging systems.

Chat shows compact actionable summaries and Details, not raw registries.

Cross-project access is off by default. Read/write grants are distinct and scoped to Once, Thread, Goal/PlanningRun, or explicitly configured persistent project pair. One-time grants never silently persist.

Agents may request worktrees; Worktree Manager performs and records them. Preserve patches after failed integration. Never silently remove another owner's worktree or kill another process/port.

## 14. Attachments and media routes

Resolve every attachment as:

```text
Native
PM transformed
Alternate model
Unsupported
```

ZIP, PDF, audio, video, spreadsheets, and large images may use bounded PM transformations. Derived artifacts retain lineage. Alternate provider/model use requires consent when privacy, account, cost, terms, or location changes. Model switching reevaluates retained attachments and selected tools.

## 15. Provider setup and maintenance states

Chat and the model picker may deep-link to exact Provider Settings/setup while preserving return context. It can show CLI not found, sign-in needed, API key needed, usage unavailable, account model unavailable, update/repair required, scheduled update, verification, rollback, or repair.

Chat is not the Provider Manager.

Provider CLI acquisition is explicit, user-triggered, and official-source-based. It is never silently installed by opening a Project, selecting a model, or starting an agent. After explicit setup, PM may manage updates according to policy.

Claude CLI and Antigravity CLI OAuth are CLI-owned; do not present PM-direct OAuth for them. When setup is invoked, combine T3-style exact installation/profile/auth/readiness detection with OMP-style opening of the exact official sign-in or API-key page. The active client may open the page while the resulting profile remains owned by the target Server/Execution Host. Free Models is a source-driven grouping over real underlying provider/account/model routes, never a fake account or quota pool.

## 16. Server, offline, and synchronization

Chat is server-owned durable state. A client disconnect or UI close does not stop approved host work.

Represent:

```text
Cached
Synchronizing
Live
Offline
Queued to send
Reconnect
Replay
Snapshot catch-up
Server work continuing
```

One environment connection may multiplex many threads. Transport health and each domain's sync state are separate. Live events are buffered before replay/snapshot catch-up; queued commands replay idempotently once.

Treat current slow T3 load/sync as a regression fixture, not proof that its implementation is already optimal.

Do not add giant Project/Server banners inside Chat. Show compact execution location only when relevant. Native Windows is complete without WSL; WSL is optional. Docker/TrueNAS/Unraid/Kubernetes can be full Servers/Execution Hosts. Use human environment names.

## 17. Tools, LSP, debug, eval, MCP, and recovery

Chat may represent compact progress and evidence for self-recovering reads/searches/patches/terminal operations, LSP diagnostics and writes, DAP debug sessions, persistent eval sessions, MCP calls, browser/test sessions, and retained tool-output artifacts.

Typed recovery may show truncation/spill, already applied, no match, ambiguity locations, formatter change, deferred diagnostics, retry/fallback, or retained patch—without dumping raw logs into the transcript.

## 18. Browser and authentication privacy

Use PM-native language such as BrowserWorkspace, Browser Action, Browser Program, and Expert Browser Program.

There is no PM-owned Playwright runtime, facade, compatibility promise, package, port, MCP route, command family, or capture engine. A user's Project may independently run Playwright as an external test command.

Protected authentication browser sessions are human-only. Chat may show redacted lifecycle states, never auth codes, secrets, profile paths, DOM, screenshots, video, console, or network contents.

## 19. Notifications

App-wide events use the canonical title-bar notification stack/inbox. Do not create a Chat notification side panel, permanent bottom-right stack, status-bar bell, or Activity Bar notification item.

Chat may render inline outcomes belonging to the current task. Important state always has a non-audio representation.

## 20. Spellcheck

Spellcheck is passive and local: subtle underline, context-menu/keyboard suggestions, Replace once, Ignore once/draft, personal dictionary, project dictionary. No autocorrect and no permanent Chat toolbar button.

Skip code, inline code, URLs, paths, shell commands, hashes, identifiers, structured data, known PM/provider/model/Persona/tool names, and literal text.

Production source choices are Automatic (OS then PM local), System only, or PM local only. Grammar/style is separate, opt-in, and provider/privacy/Usage aware.
