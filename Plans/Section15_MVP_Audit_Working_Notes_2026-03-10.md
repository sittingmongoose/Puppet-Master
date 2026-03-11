# Section 15 MVP Audit Working Notes

Date: 2026-03-10
Scope: `Plans/newfeatures.md` Section 15 backlog-bucket features promoted toward MVP
Status: in progress

## Purpose

This is a temporary working ledger for the lead feature/spec audit. It exists to preserve:

- raw findings before deduplication
- cross-doc contradictions
- external research notes
- unresolved questions that still need owner-doc decisions
- candidate doc updates and insertion targets

This file is not the final reconciled spec. It is a staging ledger.

## Main docs under audit

- `Plans/newfeatures.md`
- `Plans/FinalGUISpec.md`
- `Plans/assistant-chat-design.md`
- `Plans/FileManager.md`
- `Plans/newtools.md`
- `Plans/Tools.md`
- `Plans/FileSafe.md`
- `Plans/storage-plan.md`
- `Plans/feature-list.md`
- `Plans/usage-feature.md`
- `Plans/agent-rules-context.md`
- `Plans/Commands_System.md`
- `Plans/Skills_System.md`
- `Plans/Plugins_System.md`

## Feature inventory

1. Dangerous-Command Blocking (FileSafe)
2. Branching Conversations (Restore Then Fork)
3. In-App Project Instructions Editor
4. @ Mention System for File References
5. Stream Timers and Segment Durations
6. Interleaved Thinking Toggle
7. MCP Support
8. Project and Session Browser
9. Mid-Stream Token and Context Updates
10. Multi-Tab and Multi-Window
11. Virtualized Conversation or Log List
12. Know Where Your Tokens Go
13. One-Click Install for Commands, Agents, Hooks, and Skills
14. Full IDE-Style Terminal and Panes
15. Hot Reload, Live Reload, and Fast Iteration
16. Sound Effects Settings
17. Instant Project Switch
18. Built-in Browser and Click-to-Context

## Working findings ledger

### Promotion / precedence drift

- `newfeatures.md` still frames Section 15 as "not yet folded into the main phasing" while `FinalGUISpec.md` says former future-consideration items are MVP.
- `newfeatures.md` contains stale section-number cross references in the later gap/addendum area.
- Several features have no declared owner document, so multiple docs restate overlapping contracts.

### Restore / branching

- Restore-point backing model conflicts across docs: snapshot/redb store vs Git restore point wording.
- Branching conversations lack canonical lineage fields and lifecycle rules.
- Restore UI and branch UI are not clearly split between thread history, project history, and file-level revert.

### Project identity / switching

- Project switcher placement conflicts: title bar in `FinalGUISpec.md` vs left sidebar in `newfeatures.md`.
- Project switching semantics conflict with multi-tab plans: active-tab-only vs global current project unresolved.
- Stable project identity strategy is still open enough to create worktree/path-move ambiguity.

### Browser / preview / agent boundary

- Browser capture UX conflicts: modifier click vs inspect toggle vs toolbar flow.
- Browser boundary conflicts: read-only-for-agents in `newfeatures.md` vs agent-driven browser actions in `FileManager.md`.
- Browser hosting model conflicts: multiple browser tabs vs multiple browser instances and detached windows.

### Terminal / panes / hot reload

- Terminal model conflicts: one terminal instance per project vs multiple terminal tabs/instances.
- Hot reload ownership split between dev-server launcher and generic file watcher.
- Output / Problems / Ports relationships not yet normalized into one runtime model.

### Chat usage / timers / thinking

- Context-circle click behavior conflicts: usage tab vs pop-out window.
- Mid-stream usage events are referenced but not owned by a single canonical event contract.
- Thinking visibility has overlapping global, per-session, and per-entry controls without precedence.

### Catalog / install

- Catalog install/update/remove flows need a transaction model across commands, hooks, skills, plugins, themes, and MCP configs.
- Existing owner docs define discovery/override semantics but catalog flow does not yet bind itself to them.

### Sound settings

- `newfeatures.md` and `FinalGUISpec.md` define different audio models: open-ended custom asset catalog vs built-in event map with filename overrides.

## Second-pass checklist

- [ ] Re-sweep each of the 18 features for missed local incompleteness
- [ ] Re-sweep cross-doc conflicts after stale numbering noted
- [ ] Research official references for browser/context, project switching, MCP/tool catalogs, hot reload workflows, and IDE interaction patterns
- [ ] Expand doc-update recommendations from "reconcile contradictions" to "fully flesh out implementation contracts"

## External research targets

- Cursor built-in browser / agent browser docs
- OpenCode desktop project switching and session UX
- Official MCP / Model Context Protocol references
- Official framework hot-reload docs (Vite, Next.js, Expo, Flutter, Slint/Iced if relevant)
- Official or primary-source references for virtualized lists / webview embedding constraints where they materially affect spec decisions

## Source log

- 2026-03-10: local planning-doc sweep started
- 2026-03-10: interrupted subaudits replaced by lead re-sweep

## External research notes

### Cursor browser / commands / context

Source:

- https://cursor.com/changelog/2-0
- https://docs.cursor.com/en/cli/using

Notes:

- Cursor publicly states its browser is GA and can be embedded in-editor, with tools to select elements and forward DOM information to the agent.
- Cursor CLI docs also expose `@`-based context selection in CLI flows.
- This strengthens the need for Puppet Master to choose one canonical browser capture UX and one canonical mention expansion path instead of leaving multiple incompatible variants in plan text.

Implications:

- Browser click-to-context should not stay as "one of several possible UX choices" if this is treated as MVP.
- `@` mention needs a deterministic token/expansion contract because the feature is already core to competitor workflows.

### MCP official architecture

Source:

- https://modelcontextprotocol.io/specification/2024-11-05/architecture/index
- https://modelcontextprotocol.io/specification/

Notes:

- MCP host is responsible for client lifecycle, permissions, security policy, and context aggregation.
- MCP is stateful and capability-negotiated over JSON-RPC.
- This means Puppet Master cannot fully describe itself as only a "config and passthrough" layer if it owns consent, server lifecycle, tool visibility, and provider adaptation.

Implications:

- `newfeatures.md` should stop describing MCP as merely passthrough.
- Owner docs need a requested-vs-effective MCP state model and explicit host responsibilities.

### OpenCode sessions, forks, MCP, tools

Source:

- https://opencode.ai/docs/server/
- https://opencode.ai/docs/agents/
- https://opencode.ai/docs/mcp-servers/
- https://opencode.ai/docs/config/

Notes:

- OpenCode exposes session fork and child-session navigation explicitly.
- OpenCode supports MCP server config with local and remote servers, per-agent enablement, and server-prefixed tool naming / wildcard disabling.
- OpenCode config also includes watcher ignore patterns and plugin package loading from config.

Implications:

- Branching conversations in Puppet Master need explicit parent/child lineage and navigation semantics, not just "new session id".
- MCP naming, wildcarding, per-agent enablement, and global-vs-agent override rules should be called out as first-class spec topics.
- Catalog install and hot-reload watcher behavior should reconcile with discovery roots and watcher ignore rules.

### Hot reload / fast refresh official behavior

Source:

- https://nextjs.org/docs/architecture/fast-refresh
- https://docs.flutter.dev/tools/hot-reload
- https://docs.expo.dev/get-started/start-developing/

Notes:

- Next.js Fast Refresh preserves temporary client state only in certain file-shape cases and falls back to full reload in others.
- Flutter hot reload preserves app state, but hot restart or full restart is required for several classes of change, including native-code changes and some type changes.
- Expo documentation treats Fast Refresh as a toggleable dev-mode behavior, not a guaranteed always-on invariant.

Implications:

- Puppet Master cannot promise generic "preserve app state across reloads" without a stack-specific behavior matrix.
- The hot-reload feature needs explicit per-stack capabilities: hot reload, hot restart, full restart, state preserved, and known fallback cases.
- "Watch mode" in `FinalGUISpec.md` is too generic to serve as the canonical contract for all supported stacks.

### Wry / Slint implementation constraints

Source:

- https://docs.rs/wry/latest/wry/struct.WebViewBuilder.html
- https://slint.dev/blog/slint-1.7-released

Notes:

- Wry supports async custom protocols and initialization scripts, which supports the browser capture design direction.
- Wry also has platform-specific origin behavior for custom protocols, which matters for CORS/security wording.
- Slint publicly supports multi-window applications, so "framework may not support multiple windows" is weaker than before and should be reframed as an application-state-model problem rather than a toolkit impossibility.

Implications:

- Browser spec should include origin/CORS caveats for custom-protocol capture.
- Multi-window spec should stop leaning on toolkit uncertainty and instead define the root window/tab/state model explicitly.

## Additional missed findings from second pass

- `FinalGUISpec.md` says Browser tab has multiple browser tabs with bookmarks/history state, while `FileManager.md` still describes multiple browser instances with no in-browser tabs.
- `newfeatures.md` says one terminal instance per project plus a global terminal option, while `FinalGUISpec.md` defines up to 12 terminal instances with split panes and pinning.
- `newfeatures.md` hot-reload section is project-detector-first and assistant-action-first; `FinalGUISpec.md` Ports tab is watcher/build-command-first. These are not the same architecture.
- `FinalGUISpec.md` sound-effects MVP defines a fixed event-to-sound table and filename override behavior, while `newfeatures.md` leaves event taxonomy and custom sound identity much more open.
- `assistant-chat-design.md` adds context-circle pop-out behavior that was not reconciled with the Usage-tab behavior already specified elsewhere.
- `newfeatures.md` still contains stale prose that says "No existing plan" for features already fully specified elsewhere.

## Third-pass findings by feature cluster

### FileSafe / dangerous-command blocking

- The "Approve once" card behavior still conflicts across docs:
  - one place says auto-dismiss after 60 seconds
  - another says FileSafe blocks are persistent blocked episodes until resolved
- FileSafe local affordances and global blocked-action IDs are not fully reconciled in the user-facing specs.
- The boundary between tool approval and FileSafe recovery is still easy to implement inconsistently in chat.

### Branching conversations

- Branching is only defined in `newfeatures.md`; no adjacent doc actually defines how branched threads appear in chat history, run history, or project history.
- No canonical branch metadata table exists in storage docs.
- No compare/merge/archive/delete behavior is defined for branches.

### Instructions editor

- The feature is now effectively owned by File Editor "Instructions mode", but `newfeatures.md` still reads like a separate modal/view.
- Validation rules remain shallow for a feature that can block runs via AGENTS budgets and strict mode.
- There is still no explicit save-conflict or external-edit-reload behavior for instruction files.

### @ mention

- Mention token format remains unresolved: raw path, `@path`, or a richer typed reference.
- Context compilation mentions "recently edited files" and "@ mentioned files", but no deterministic ordering/caps/dedup strategy is specified.
- Mention behavior when no project is selected is documented for symbols but not for folder navigation or raw-file mentions.

### Stream timers / thinking / mid-stream usage

- Context-circle behavior still conflicts: Usage tab vs pop-out detailed view.
- "Compact now" is bolted onto the context circle in one doc without being reconciled with the Usage-tab-first behavior elsewhere.
- No shared stream event contract explicitly owns timer segments, usage deltas, and thought-stream display together.

### MCP

- `newfeatures.md` still understates MCP as passthrough even though other docs already assign Puppet Master host/runtime responsibilities.
- No single doc shows requested config, effective config, discovered tools, and unavailable-tool states in one end-to-end flow.
- Per-agent/per-persona MCP enablement is not clearly addressed in Puppet Master docs even though tool and persona systems imply it will matter.

### Project/session browser + instant project switch

- Project browser and project switcher are specified separately even though they need the same identity/source-of-truth model.
- `FinalGUISpec.md` places the switcher in the title bar; `newfeatures.md` resolves it to a left sidebar.
- The session browser still lacks explicit session-type taxonomy: assistant thread vs interview thread vs orchestrator run vs builder thread.

### Multi-tab / multi-window / virtualization

- Top-level app tabs, floating panels, and detached editor windows are not part of one coherent windowing model.
- Virtualization is specified generically but no shared contract covers anchor preservation, variable row heights, or overscan defaults.
- Some views already have their own virtualization contracts, but Section 15 still presents virtualization like a generic reusable feature without that shared abstraction being defined.

### One-click install

- Catalog install still lacks a cross-asset transaction model.
- Owner docs define discovery roots and override rules, but catalog does not bind installation paths and conflict resolution to those rules tightly enough.
- There is no explicit compatibility contract for app version, platform support, or post-install validation by asset type.

### Terminal / panes / hot reload

- Terminal is simultaneously "one terminal per project", "multiple terminal tabs", and "up to 12 terminal instances".
- Output/build/test/watch channels are ambiguously modeled as either terminal tabs or separate pane channels.
- Hot reload needs a capability matrix by stack rather than a generic "watch mode" abstraction.

### Sound effects

- Feature size is understated in `newfeatures.md`; the current docs still do not reconcile:
  - fixed built-in event map
  - user-imported sounds
  - filename override vs catalog identity
  - mute/DND/audio-unavailable behavior

### Built-in browser and click-to-context

- Preview browser and automation browser are still conflated across docs.
- Capture UX conflicts remain: modifier-click vs inspect mode vs toolbar toggle.
- Browser state persistence is not reconciled across:
  - bookmarks/history/browser tabs in `FinalGUISpec.md`
  - multiple preview/browser instances in `FileManager.md`
  - detached-vs-embedded fallback in `newfeatures.md`

## Additional web-research implications

- Cursor changelog confirms browser-in-editor plus DOM forwarding is already a concrete competitive baseline, so Puppet Master should stop treating the browser capture UX as a loose implementation detail.
- OpenCode MCP docs confirm useful patterns Puppet Master has not yet specified clearly: global MCP disable with wildcard patterns, per-agent re-enable, and remote-server auth lifecycle.
- Next.js/Flutter/Expo official docs reinforce that "state preserved across reloads" must be stack-conditional, not a blanket promise.

## Competitor / primary-source research matrix

### Branching conversations, checkpoints, and session history

Primary sources:

- VS Code chat sessions: https://code.visualstudio.com/docs/copilot/chat/chat-sessions
- VS Code checkpoints: https://code.visualstudio.com/docs/copilot/chat/chat-checkpoints
- OpenCode server API: https://opencode.ai/docs/server/

Observed patterns:

- VS Code treats checkpoints and forks as first-class chat-session concepts, not hidden restore mechanics.
- VS Code distinguishes:
  - edit a previous request
  - restore a checkpoint
  - fork from a checkpoint
- VS Code auto-creates snapshots before each chat request when checkpoints are enabled.
- VS Code shows file-change summaries per checkpoint and supports redo after restore.
- OpenCode exposes session fork as a direct server/API action (`POST /session/:id/fork`) and also exposes session diff endpoints.

What competitors are doing well:

- They make rollback/fork discoverable in the session UI, not buried in generic history.
- They separate "change the previous prompt" from "restore workspace state" from "branch the conversation".
- They preserve the original conversation rather than silently mutating it in place.

What Puppet Master can do better:

- Tie branching to both chat/session history and restore-point metadata, not just session cloning.
- Add explicit branch labels, compare view, archive state, and lineage metadata.
- Show restore/fork/file-change summaries in one History surface instead of scattering them across chat and file editor.

### Project/session switching, parallel sessions, and windowing

Primary sources:

- VS Code chat sessions: https://code.visualstudio.com/docs/copilot/chat/chat-sessions
- VS Code agent overview: https://code.visualstudio.com/docs/copilot/agents/overview
- VS Code multi-root workspaces: https://code.visualstudio.com/docs/editing/workspaces/multi-root-workspaces
- GitHub Copilot coding agent: https://code.visualstudio.com/docs/copilot/copilot-coding-agent

Observed patterns:

- VS Code allows the same session to move between sidebar, editor tab, and separate window while preserving history and context.
- VS Code explicitly supports multiple sessions in parallel and makes session type visible (local/background/cloud/third-party).
- VS Code exposes a session list that can be compact or side-by-side and includes archive/delete actions.
- VS Code has a title-bar/command-center agent status indicator with unread and in-progress badges.
- Multi-root workspaces expose cross-repo source-control summaries and task autodetection across folders.
- Copilot coding agent shows active sessions and PRs together with status badges and detailed logs.

What competitors are doing well:

- They separate "workspace/project scope" from "session surface placement".
- They preserve a session while letting the user move it between UI surfaces.
- They expose session state (active, archived, unread, in progress) explicitly.

What Puppet Master can do better:

- Define one stable root model:
  - `project`
  - `session`
  - `surface` (sidebar/tab/window)
- Unify project browser and project switcher into one project/session navigation model.
- Show active runs and unread/background state in the project switcher itself.
- Support per-tab project context while preserving a single app-level recent-projects model.

### Browser, click-to-context, and agent browser actions

Primary sources:

- Cursor changelog 1.7: https://cursor.com/changelog/1-7
- Cursor changelog / 2.x summary: https://cursor.com/en/changelog
- VS Code AI context docs: https://code.visualstudio.com/docs/copilot/chat/copilot-chat-context
- Wry docs: https://docs.rs/wry/latest/wry/struct.WebViewBuilder.html

Observed patterns:

- Cursor markets browser controls as agent capabilities for screenshots, UI improvement, and debugging.
- Cursor later emphasizes browser embedded in-editor and DOM forwarding to the agent.
- VS Code has both:
  - add browser elements as prompt context
  - browser tools that let agents read and interact with pages
  - explicit "Share with Agent" semantics for an already-open page/session
- VS Code exposes settings for whether CSS or images are attached when sending browser elements to chat.
- VS Code treats browser tools as experimental and gates them behind explicit enablement.
- Wry supports async custom protocols and initialization scripts, which makes the planned capture pipeline technically viable.

What competitors are doing well:

- They distinguish user-selected browser context from full agent browser control.
- They gate more dangerous browser capabilities behind explicit enablement.
- They keep browser-as-context and browser-as-tool related but not identical.

What Puppet Master can do better:

- Split browser capabilities into:
  - `preview_capture`
  - `interactive_agent_browser`
- Let users attach element context with configurable detail levels:
  - metadata only
  - metadata + CSS
  - metadata + image
- Add a "Share current page with agent" model instead of forcing all browser interactions through one capture path.
- Keep preview browser safe-by-default while making agent browser a separately permissioned capability.

### MCP, tools, permissions, and per-agent enablement

Primary sources:

- MCP spec: https://modelcontextprotocol.io/specification/2024-11-05/architecture/index
- OpenCode tools: https://opencode.ai/docs/tools/
- OpenCode agents: https://opencode.ai/docs/agents/
- OpenCode MCP servers: https://opencode.ai/docs/mcp-servers/
- OpenCode config: https://opencode.ai/docs/config
- Cursor changelog 2.6 and 2.5: https://cursor.com/en/changelog

Observed patterns:

- MCP host responsibilities include client lifecycle, security, permissions, and capability negotiation.
- OpenCode makes MCP tools ordinary tools under the same permission system, with wildcarding by server prefix.
- OpenCode supports:
  - global disable of MCP server tools
  - per-agent re-enable
  - per-agent permission overrides
  - simple glob matching and server-name prefixes
- Cursor is moving toward marketplaces, MCP Apps, and team-governed plugin distribution.

What competitors are doing well:

- They make MCP tool naming and wildcard permissions explicit.
- They support per-agent tool/MCP enablement rather than only global on/off.
- They treat extension ecosystems as governance problems, not just install UX.

What Puppet Master can do better:

- Add requested vs effective MCP state:
  - configured
  - enabled
  - discovered
  - available this run
  - disabled by policy
  - unavailable due to health/auth/startup failure
- Add per-persona/per-agent MCP tool scoping on top of global server enablement.
- Make catalog-installed MCP assets pass through the same permission and health pipeline as manually configured servers.

### Catalog / one-click install / plugin governance

Primary sources:

- VS Code extensions: https://code.visualstudio.com/docs/getstarted/extensions
- VS Code enterprise extensions: https://code.visualstudio.com/docs/enterprise/extensions
- JetBrains plugin management: https://www.jetbrains.com/help/webstorm/managing-plugins.html
- Cursor marketplace/changelog: https://cursor.com/marketplace/ and https://cursor.com/en/changelog

Observed patterns:

- VS Code supports direct install from marketplace, automatic updates, uninstall/disable, preinstall bootstrap, allowlists, and private marketplaces.
- VS Code enterprise extension policy supports:
  - allow/block by publisher
  - allow/block by extension id
  - pin to specific versions/platforms
  - `"stable"` only
  - central policy precedence
- JetBrains supports marketplace install, command-line install by plugin id, auto-updates, disable vs uninstall, and custom repositories.
- Cursor is introducing team marketplaces/private plugin sharing with governance controls.

What competitors are doing well:

- They separate:
  - browse/install UX
  - governance policy
  - update lifecycle
  - source trust
- They make disable distinct from uninstall.
- They support private/curated marketplaces for organizational control.

What Puppet Master can do better:

- Model catalog items with:
  - source
  - trust level
  - version pin
  - compatibility range
  - discovery roots affected
  - disable vs uninstall
- Add private/team catalog sources and allowlist/denylist governance later without redesigning the model.
- Make install transactional and reversible with post-install validation per asset type.

### Hot reload, dev loops, terminal, and tasks

Primary sources:

- Next.js Fast Refresh: https://nextjs.org/docs/architecture/fast-refresh
- Flutter hot reload: https://docs.flutter.dev/tools/hot-reload
- Expo development flow: https://docs.expo.dev/get-started/start-developing/
- Vite features: https://vite.dev/guide/features.html and https://vite.dev/guide/comparisons/
- VS Code multi-root workspaces/tasks: https://code.visualstudio.com/docs/editing/workspaces/multi-root-workspaces and https://code.visualstudio.com/api/extension-guides/task-provider
- WebStorm File Watchers: https://www.jetbrains.com/help/webstorm/using-file-watchers.html

Observed patterns:

- Vite provides fast HMR over native ESM and keeps HMR scope narrowly invalidated.
- Flutter clearly separates hot reload, hot restart, and full restart, and documents what state is preserved.
- Expo treats fast refresh as part of the dev workflow, not a universal persistence guarantee.
- VS Code auto-detects tasks across workspace folders and lets extensions contribute detected tasks.
- WebStorm File Watchers provide templates, scopes, save-trigger control, error inspections, and project-vs-global watcher levels.

What competitors are doing well:

- They separate task discovery from task execution.
- They expose watcher scope, trigger behavior, and failure behavior explicitly.
- They present stack-specific hot-reload semantics rather than pretending all stacks behave the same.

What Puppet Master can do better:

- Build a `DevLoopProfile` registry with per-stack fields:
  - detection markers
  - launch command
  - optional test/watch command
  - port extraction strategy
  - supports hot reload / hot restart / full restart only
  - preserves app state? yes/no/conditional
  - known caveats
- Reuse the same profile for:
  - Start Dev Mode button
  - Assistant live-tool actions
  - Doctor/preflight
  - Ports/Problems routing

### Sound effects and accessibility signals

Primary sources:

- VS Code accessibility docs: https://code.visualstudio.com/docs/configure/accessibility/accessibility

Observed patterns:

- VS Code exposes per-signal sound/announcement controls rather than one undifferentiated sound toggle.
- The product treats these as accessibility/status signals, not decorative audio.

What Puppet Master can do better:

- Reframe sound effects as both notification feedback and accessibility signals.
- Separate:
  - master audio enable
  - event enablement
  - sound selection
  - accessibility-only cues
- Respect DND/audio-unavailable state as a first-class part of the contract, not a footnote.

## Research-backed spec expansion targets

The following notes translate competitor and primary-source research into concrete spec work for the largest Section 15 features.

### Branching conversations and restore history

Competitor baseline:

- VS Code treats checkpoints, restore, and fork as related but distinct operations.
- Checkpoints restore both workspace state and conversation history for that branch of the session.
- OpenCode exposes explicit session fork lineage and session-diff navigation.

What Puppet Master still needs to specify:

- A branch is not only a new `thread_id`; it is a lineage object with:
  - `branch_thread_id`
  - `parent_thread_id`
  - `parent_restore_point_id`
  - `branch_label`
  - `branch_reason` (`manual_restore_and_branch`, `edit_previous`, `experimental_fork`, `retry_from_checkpoint`)
  - `created_at`
  - `archived_at?`
- Restore and branch must be different actions in the UI:
  - `restore_here`
  - `restore_and_branch`
  - `inspect_diff`
- History surface must show:
  - restore points
  - branches/forks
  - branch labels
  - file-change summary
  - active vs archived branch state
- Required decisions still missing:
  - whether branch creation auto-selects the new branch
  - whether original branch remains writable during background activity
  - whether branch compare is file-diff only or includes message-span diff
  - retention/pruning rules for archived branches

Implementation direction:

- Use restore points as the canonical anchor and let branches reference restore points rather than duplicating loosely defined session snapshots.
- Store branch lineage in durable state and emit explicit fork/archive/select events so the history surface can be rebuilt deterministically.
- Add a branch compare view that can at minimum show:
  - ancestor restore point
  - message counts since fork
  - changed files since fork
  - current run/background state

Where Puppet Master can exceed competitors:

- Unify file restore history and conversation branching in one surface instead of treating them as separate subsystems.
- Make branch provenance visible enough that the user can tell whether they are resuming, retrying, or exploring a divergent path.

### MCP host model, permissions, and health

Competitor baseline:

- MCP host responsibilities include lifecycle management, capability negotiation, consent, and policy.
- OpenCode treats MCP tools as ordinary tools with server-prefixed names and wildcard permissions.
- Enterprise ecosystems treat install and enablement as policy/governance, not only a convenience UI.

What Puppet Master still needs to specify:

- Canonical MCP state machine:
  - `configured`
  - `starting`
  - `healthy`
  - `degraded`
  - `auth_required`
  - `disabled_by_user`
  - `disabled_by_policy`
  - `startup_failed`
  - `capability_mismatch`
- Requested vs effective state at three levels:
  - global app config
  - project override
  - agent/persona override
- Tool naming and permission grammar:
  - whether permissions match server ids, tool ids, prefixes, or globs
  - how renamed servers affect persisted permissions
  - how unknown tools are handled after server upgrades
- Test/diagnose outcomes:
  - process spawn failure
  - bad command/path
  - connection refused
  - handshake/version mismatch
  - auth missing
  - timeout
  - healthy but no tools
- Secret handling:
  - which env values may be stored
  - which must be delegated to OS credential storage
  - whether users can view effective env or only redacted summaries

Implementation direction:

- Treat MCP as part of the same runtime capability graph as built-in tools, not as a separate side channel.
- Persist both requested configuration and last observed effective capability snapshot.
- Make the tool picker and permission UI show why a configured MCP tool is unavailable in the current run.

Where Puppet Master can exceed competitors:

- Provide a first-class "why unavailable" explanation chain instead of a binary enabled/disabled view.
- Let users scope MCP capability to persona/run type without copy-pasting whole server configs.

### Project and session navigation model

Competitor baseline:

- VS Code separates session identity from UI placement; the same session can live in sidebar, tab, or window.
- Session lists commonly expose active/archived/background state and let users manage multiple conversations in parallel.
- Multi-root workspace products separate workspace membership from per-session activity.

What Puppet Master still needs to specify:

- Root entities:
  - `project`
  - `session`
  - `surface`
  - `window`
  - `tab`
- Whether `project_id` is per-tab, per-window, or global.
- Session taxonomy for browser/project history:
  - assistant thread
  - orchestrator run thread
  - interview session
  - background automation run
  - review/reconciliation thread
- Browser/switcher row states:
  - active
  - idle
  - unread
  - background_running
  - archived
  - broken_path
- Missing path recovery:
  - missing project directory
  - moved project
  - duplicate recent entries pointing to same repo/worktree

Implementation direction:

- Adopt per-tab project context with one app-level recent-projects registry.
- Make "project browser" and "instant project switch" one system with multiple entrypoints, not two separate features.
- Store last-open session per project and last-open surface per session separately.

Where Puppet Master can exceed competitors:

- Show project-level activity, unread state, and background run health in the same switcher instead of splitting them across status bars and side panels.
- Make cross-project switching fast without flattening every session into one undifferentiated list.

### Browser preview, click-to-context, and agent browser control

Competitor baseline:

- Competitors increasingly support both browser-as-context and browser-as-tool, but they gate the more powerful path.
- VS Code explicitly lets users share browser state/context with the agent and tune attachment detail.
- Browser tools remain experimental or separately enabled in several products.

What Puppet Master still needs to specify:

- Two-surface model:
  - `browser.preview_capture`
  - `browser.automation`
- Whether preview and automation can ever share cookies/session state.
- Primary capture UX:
  - inspect mode toggle
  - modifier-click fallback
  - keyboard capture/accessibility path
- Payload tiers:
  - metadata only
  - metadata + css summary
  - metadata + screenshot
  - metadata + bounded outer HTML
- Browser persistence:
  - workspace-scoped history/bookmarks/tabs
  - external browsing state
  - cookies/storage partitioning
- Security policy:
  - allowed schemes
  - local preview origins
  - JS enablement defaults
  - file upload/download policy

Implementation direction:

- Make preview/capture safe-by-default and user-owned.
- Treat automation browser as a separate permissioned runtime session, even if both eventually reuse the same embedded webview technology.
- Persist only bounded element-context payloads in chat and store heavy artifacts separately if screenshots or DOM dumps are needed.

Where Puppet Master can exceed competitors:

- Provide a richer attachment model that can send "just enough" context instead of always attaching the same heavy payload.
- Make the bridge between preview, inspect, and chat explicit enough that users understand when they are sharing page state versus granting browser control.

### Terminals, panes, problems, ports, and dev loops

Competitor baseline:

- IDEs separate terminal instances, tasks, file watchers, ports, and debug consoles even when they share one bottom panel.
- Hot-reload semantics are stack-specific and often come in multiple tiers.
- Task providers and watcher templates are data models, not hard-coded one-off buttons.

What Puppet Master still needs to specify:

- Distinct runtime channels:
  - interactive shell terminal
  - background task output
  - dev server output
  - debug console
  - problems
  - ports
- Whether a dev loop owns a terminal, references an existing terminal, or runs headless with attached logs.
- `DevLoopProfile` contract:
  - detection markers
  - preferred launch command
  - optional alternate commands
  - reload capability (`hot_reload`, `hot_restart`, `full_restart_only`)
  - expected port patterns
  - parseable ready-state signal
  - known fallback cases
- Failure behavior:
  - command missing
  - profile conflict
  - port collision
  - watcher crash
  - file-change storm
- UI ownership:
  - which surface starts/stops dev mode
  - which surface shows status
  - which surface exposes restart/hard-restart/open-in-browser actions

Implementation direction:

- Normalize everything around a single run/dev-loop model and let panes be views over that model.
- Keep terminal multiplicity separate from project multiplicity; one project may have many terminals and zero or more dev loops.
- Route problems and ports from parsed run state rather than making each pane discover them independently.

Where Puppet Master can exceed competitors:

- Let Assistant-triggered live tooling, Doctor checks, and GUI dev controls all resolve through the same `DevLoopProfile` registry.
- Expose hot reload confidence honestly by stack instead of promising generic "live reload" behavior that breaks on half the targets.

### One-click install, update, disable, and rollback

Competitor baseline:

- Mature ecosystems separate disable from uninstall and treat source trust, policy, and compatibility as first-class.
- Private/team marketplaces and allowlists are standard in enterprise tooling.

What Puppet Master still needs to specify:

- Asset model fields:
  - `asset_type`
  - `source_kind`
  - `publisher`
  - `version`
  - `compatibility_range`
  - `trust_level`
  - `install_target`
  - `enabled_state`
- Transaction stages:
  - fetch
  - validate
  - stage
  - commit
  - refresh registries
  - rollback on failure
- Per-asset validation:
  - manifest/schema validity
  - duplicate ids
  - path collisions
  - incompatible app version
  - missing runtime/tool dependency
- Lifecycle actions:
  - install
  - update
  - disable
  - enable
  - uninstall
  - repair

Implementation direction:

- Install into asset-owner discovery roots only after validation succeeds.
- Preserve previous version/artifacts until post-install validation passes.
- Show effective install target and override consequences before commit.

Where Puppet Master can exceed competitors:

- Unify commands, skills, hooks, plugins, and MCP assets under one transactional catalog model without flattening away their owner-specific validation rules.

### Sound settings as notification and accessibility signals

Competitor baseline:

- Mature tooling increasingly treats sounds as accessibility/status signals with granular event controls.

What Puppet Master still needs to specify:

- Event taxonomy:
  - permission prompt
  - approval needed
  - run completed
  - run failed
  - background run mentioned user
  - long-running task recovered
  - browser capture completed
- Output modes:
  - sound only
  - announcement only
  - both
  - silent
- Device/system-state handling:
  - DND
  - unavailable audio device
  - per-window mute
  - background-only notifications

Implementation direction:

- Define one canonical event map and let custom files override sound assets without redefining the event taxonomy.
- Keep accessibility announcements in the same settings family as sounds so users can tune signal noise coherently.

Where Puppet Master can exceed competitors:

- Make notification routing sensitive to foreground/background and run importance instead of treating every event sound equally.

## Drafting priorities from current evidence

The research and doc sweep now support drafting full replacement or insertion text for these features first:

1. Branching conversations and restore history
2. MCP host model and per-agent permissions
3. Project/session browser plus instant project switch
4. Browser preview/click-to-context versus automation browser
5. Terminal/panes plus hot reload/dev-loop registry
6. One-click install transaction/governance model

These now have enough source support and enough local contradiction evidence that another pure-audit pass is unlikely to produce more value than writing the replacement spec sections.

## Implementation pass completed

The research and audit findings above have now been converted into plan-doc updates.

Update 2026-03-11:

- The temporary plan-doc edits made during the implementation pass were reverted at user request.
- The authoritative working state for this audit/spec effort is the ledger in this file only.
- No Section 15 plan changes remain applied in `Plans/` from that pass.

Primary output:

- Added `Plans/Section15_MVP_Promoted_Features_Spec.md` as the canonical owner for the promoted Section 15 feature set.

Supporting reconciliations applied:

- `Plans/newfeatures.md`
  - replaced backlog-style Section 15 with promoted MVP inventory + owner references
  - added explicit precedence to the new Section 15 spec
  - updated cross-reference rows for terminal/hot reload, instant project switch, built-in browser, sound, and MCP
  - removed the "config and passthrough only" MCP framing from later summary text
- `Plans/assistant-chat-design.md`
  - reconciled context-circle click behavior to the thread Usage tab
  - removed the competing pop-out usage window contract from MVP
  - aligned thinking visibility to app setting + thread override + per-entry collapse precedence
- `Plans/FileManager.md`
  - reconciled browser model to in-shell browser tabs plus detached windows
  - aligned preview/capture versus automation browser boundary to the new Section 15 owner spec
- `Plans/FinalGUISpec.md`
  - reconciled FileSafe blocked-card lifecycle to persistent blocked episodes
  - aligned browser click-to-context wording to inspect mode + bounded `browser_element_context`
  - aligned sound asset model away from filename-replacement-only behavior
- `Plans/FileSafe.md`
  - reconciled blocked-card lifecycle to persistent blocked episodes

Main contradictions resolved by the implementation pass:

- FileSafe blocked card: no longer split between auto-dismiss and persistent blocked episode
- Context circle: no longer split between Usage tab and usage pop-out
- Browser model: no longer split between browser instances, browser tabs, and undifferentiated agent control
- MCP model: no longer described as config-only passthrough in `newfeatures.md`
- Section 15 status: no longer framed as an optional backlog bucket

Residual follow-up likely still useful later:

- deeper local reconciliation in `Plans/storage-plan.md`, `Plans/newtools.md`, and `Plans/Tools.md` so they adopt the exact vocabulary from the new Section 15 owner spec instead of relying on precedence
- any future implementation packet should add precise event names / schema snippets where codegen or storage migrations depend on exact field spelling

## Fourth-pass research: instructions, mentions, tabs, notifications, and watcher behavior

### Project instructions / rules / memory editing

Primary sources:

- VS Code custom instructions: https://code.visualstudio.com/docs/copilot/customization/custom-instructions
- Claude Code memory: https://docs.anthropic.com/en/docs/claude-code/memory
- Cursor rules: https://docs.cursor.com/en/context
- OpenCode config instructions: https://opencode.ai/docs/config/

Observed patterns:

- VS Code treats file-based instructions as the default path and supports:
  - always-on instruction files
  - file-pattern-based instruction files
  - AGENTS.md
  - CLAUDE.md
  - organization-level instructions
  - a built-in UI for discovering, creating, and configuring instruction files
- VS Code combines multiple instruction files and explicitly notes that order is not guaranteed when multiple files apply.
- VS Code surfaces diagnostics and origin discovery for instruction files.
- Claude Code loads project and user instruction files automatically and supports `@path` imports inside `CLAUDE.md`, including recursive imports with a max depth.
- Cursor rules are first-class files with:
  - always apply
  - auto-attach by glob
  - agent-requested
  - manual attachment
- OpenCode allows an explicit list of instruction paths and glob patterns in config.

What this means for Puppet Master feature 15.3:

- The in-app instructions editor must not be "edit one markdown file and hope the runtime notices."
- Puppet Master needs an explicit **instruction inventory model**:
  - project-wide instruction files
  - user/global instruction files
  - optional local-only files
  - imports/references where supported by the target platform
- The editor needs to show:
  - file origin (project, user, generated, imported)
  - whether the file is auto-applied, path-scoped, or manually attached
  - which providers/platforms actually consume that file type
- Required implementation details still missing and now recommended:
  - supported file classes table:
    - `AGENTS.md`
    - `CLAUDE.md`
    - project-rules file(s)
    - optional provider-specific instruction file(s)
  - precedence table:
    - app/global
    - project
    - path-scoped
    - manually attached
  - diagnostics view:
    - file missing
    - malformed frontmatter / metadata
    - invalid import
    - unsupported file type for active provider
  - "Loaded into current run?" status preview for the active project/session/provider

What Puppet Master can do better:

- Show one **effective instructions** preview that explains which files actually contributed to the next run and why.
- Detect and warn when two instruction sources clearly conflict instead of silently concatenating them.
- Support editing imported or referenced instruction files from the same surface without losing provenance.

### Mentions, file references, folder references, and context cost

Primary sources:

- VS Code chat context: https://code.visualstudio.com/docs/copilot/chat/copilot-chat-context
- Cursor @Files & Folders: https://docs.cursor.com/context/%40-symbols/%40-files-and-folders
- Cursor @Folders: https://docs.cursor.com/context/%40-symbols/%40-folders
- Cursor @ symbols overview: https://docs.cursor.com/en/context/%40-symbols/overview
- Cursor @Past Chats: https://docs.cursor.com/context/%40-symbols/%40-past-chats
- OpenCode IDE file reference shortcuts: https://opencode.ai/docs/ide/
- Claude Code memory imports: https://docs.anthropic.com/en/docs/claude-code/memory

Observed patterns:

- VS Code distinguishes:
  - implicit context
  - explicit file/folder/symbol mentions
  - codebase search
  - `@` participants
- VS Code degrades attached file context from full content to outline when the file is too large, and may drop it entirely if even the outline is too large.
- Cursor distinguishes:
  - file mentions
  - folder mentions
  - past-chat references
  - docs/web/rules/git/lint references
- Cursor folder references have two modes:
  - path + folder overview
  - full folder content
- Cursor explicitly warns that full folder content can raise request cost substantially and respects ignore files.
- OpenCode IDE exposes file-reference shortcuts with line ranges (`@File#L37-42`), which is a useful precision pattern.
- Claude uses `@path` as an import mechanism inside memory files, which means Puppet Master should avoid overloading one `@` syntax in ambiguous ways across chat and instruction files without a clear parser boundary.

What this means for Puppet Master feature 15.4:

- File mentions should not stay "insert path and let the prompt builder guess."
- Puppet Master needs a typed mention grammar for chat:
  - file
  - folder
  - symbol
  - past thread/session (if added later)
  - browser element context remains a separate attachment type, not an `@` token
- Strong recommended defaults:
  - file mention default = attach full file if small enough, else attach outline/summary
  - folder mention default = path + folder overview, not full folder content
  - full folder content = explicit user opt-in with visible cost warning
  - ignored files/directories are excluded by default
- Strong recommended syntax:
  - `@path/to/file`
  - `@path/to/file#L10-L40`
  - `@folder:path/to/folder`
  - `@symbol:Name`
- Required implementation details still missing and now recommended:
  - token/cost disclosure when a mention expands to very large context
  - visible fallback state when full content was downgraded to outline
  - drag-and-drop to create file mentions from File Manager or editor tabs
  - clear separation between:
    - mentions that become literal prompt context
    - mentions that become instructions/tools/participants

What Puppet Master can do better:

- Expose a small "resolved context preview" for mentions before send.
- Make folder mention mode selectable per mention:
  - overview only
  - include matching files
  - include full folder content if it fits
- Allow line-range file mentions as a first-class path rather than forcing full-file attachment.

### Multiple tabs, multiple sessions, and cross-session references

Primary sources:

- Cursor tabs: https://docs.cursor.com/en/agent/chat/tabs
- Cursor history: https://docs.cursor.com/agent/chat/history
- Cursor @Past Chats: https://docs.cursor.com/context/%40-symbols/%40-past-chats
- OpenCode IDE: https://opencode.ai/docs/ide/

Observed patterns:

- Cursor makes each tab an independent context/model/history container.
- Cursor explicitly blocks simultaneous same-file edits across tabs.
- Cursor allows referencing summarized past chats as explicit context.
- OpenCode IDE distinguishes "focus existing session" from "start new session" with separate shortcuts.

What this means for Puppet Master features 15.8, 15.10, and 15.17:

- The app should distinguish:
  - focus existing session
  - start new session in current project
  - open existing project in current top-level tab
  - open project in new top-level tab
- Same-project, multi-tab workflows need a declared conflict policy for overlapping edits.
- The project/session browser should likely support "reference another session" in future, even if that is not MVP for the first pass.

Recommended implementation details:

- top-level tab creation actions:
  - `new_blank_tab`
  - `clone_current_tab`
  - `open_project_in_new_tab`
- session actions:
  - `focus_existing_session`
  - `new_session`
  - `new_session_from_checkpoint`
- conflict policy:
  - warn on overlapping write scopes
  - block same-file simultaneous apply if the product cannot isolate by worktree/session

### Watchers, triggers, and terminal/dev-loop control surfaces

Primary sources:

- WebStorm file watchers: https://www.jetbrains.com/help/webstorm/using-file-watchers.html
- OpenCode IDE: https://opencode.ai/docs/ide/
- OpenCode config: https://opencode.ai/docs/config/
- VS Code custom instructions and context docs as supporting UX references

Observed patterns:

- WebStorm watchers can be:
  - project-level
  - IDE/global
  - file-type-scoped
  - custom-scope-limited
  - save-triggered
- WebStorm surfaces watcher-produced errors in the editor through a dedicated problems inspection flow.
- OpenCode exposes two separate actions in the IDE:
  - focus existing integrated-terminal session
  - create a new session
- OpenCode config explicitly supports watcher ignore patterns.

What this means for Puppet Master features 15.14 and 15.15:

- The dev-loop/watch model needs separate controls for:
  - launch a new dev-loop session
  - focus existing dev-loop session
  - open plain terminal
- Watchers need explicit scope and ignore behavior, not just a generic debounce and command.
- Problems routing should be tied to parseable watcher/build output, not a loosely coupled log pane.

Recommended implementation details:

- watcher settings:
  - ignore globs
  - scope roots
  - save-trigger only vs direct fs-event trigger
  - debounce
  - auto-disable after repeated failure
- dev-loop commands:
  - `start_dev_loop`
  - `focus_dev_loop`
  - `restart_dev_loop`
  - `hard_restart_dev_loop`
  - `stop_dev_loop`
- terminal actions:
  - `new_terminal_tab`
  - `focus_existing_terminal`
  - `open_external_terminal`

### Notifications, sounds, and accessibility signals

Primary sources:

- VS Code accessibility docs: https://code.visualstudio.com/docs/configure/accessibility/accessibility
- OpenCode plugins / notifications: https://opencode.ai/docs/plugins/

Observed patterns:

- VS Code frames sounds and announcements as accessibility/status signals.
- OpenCode desktop can automatically send system notifications when a response is ready or a session errors.
- OpenCode plugin examples also show platform-specific notification integrations.

What this means for Puppet Master feature 15.16:

- Sound settings should be coupled to notification routing, not treated as isolated media selection.
- The product needs separate contracts for:
  - audible cue
  - system notification
  - accessibility announcement
  - foreground-only suppression or background-only routing

Recommended implementation details:

- per event, configure:
  - sound enabled
  - system notification enabled
  - accessibility announcement enabled
  - fire only when app unfocused/backgrounded
- events that should likely exist beyond the initial minimal list:
  - assistant reply in inactive thread
  - session error
  - approval needed
  - long-running task completed
  - browser capture completed
  - dev-loop failed
- if system notification permission is unavailable, degrade to sound/announcement without error spam

## Feature-fleshing pass: remaining implementation details by Section 15 feature

### 15.1 Dangerous-Command Blocking (FileSafe)

Still needs in the ledger:

- blocked card state machine:
  - `active_blocked`
  - `approved_once`
  - `approved_and_allowlisted`
  - `cancelled`
  - `superseded`
  - `run_ended_unresolved`
- explicit relationship between FileSafe block and generic tool approval
- restart/restore behavior for unresolved blocked cards

### 15.2 Branching Conversations

Still needs in the ledger:

- deletion semantics:
  - delete archived branch only
  - prevent delete when branch has descendant branches unless forced
- compare granularity:
  - file diff
  - message-count diff
  - explicit branch reason / ancestor summary
- branch list sort order and retention defaults

### 15.3 In-App Project Instructions Editor

Still needs in the ledger:

- exact save behavior for imported/referenced instruction files
- provider support matrix:
  - which file classes affect which providers
- effective-instructions preview and diagnostics pane

### 15.4 @ Mention System for File References

Still needs in the ledger:

- mention grammar decision and escape rules
- line-range and symbol-range syntax
- context preview UI before send
- folder full-content opt-in behavior and cost warning copy

### 15.5 Stream Timers and Segment Durations

Still needs in the ledger:

- exact transitions between:
  - thinking
  - tool execution
  - waiting for approval
  - compaction
  - model output
- how retries and resumed runs affect segment history

### 15.6 Interleaved Thinking Toggle

Still needs in the ledger:

- copy for hidden-thinking placeholder
- treatment of providers that send summaries but not raw thinking
- whether export/share includes hidden thinking by default

### 15.7 MCP Support

Still needs in the ledger:

- server rename migration for permissions
- requested-vs-effective view examples
- local-vs-remote auth flows and explicit test outcomes

### 15.8 Project and Session Browser

Still needs in the ledger:

- exact row schema for projects and sessions
- archive/delete filters
- missing-path repair flow

### 15.9 Mid-Stream Token and Context Updates

Still needs in the ledger:

- unsupported-provider UX
- unknown-context-limit UX
- compaction button behavior during an active stream

### 15.10 Multi-Tab and Multi-Window

Still needs in the ledger:

- whether window close preserves tab set by default
- whether top-level tabs may be pinned
- explicit conflict policy for same-project concurrent edits

### 15.11 Virtualized Conversation or Log List

Technical direction sources:

- TanStack Virtual scroll restoration guidance: https://tanstack.com/router/latest/docs/framework/react/guide/scroll-restoration
- TanStack Virtual API: https://tanstack.com/virtual/latest/docs/api/virtualizer

Research implication:

- Even though these are not direct competitors, the technical baseline is clear: variable-size virtualized lists need anchor preservation, prepend-safe scroll restoration, and explicit overscan/scroll-margin behavior.

Still needs in the ledger:

- shared virtual-list contract with:
  - variable row measurement
  - prepend-safe anchor preservation
  - bottom-follow toggle
  - overscan default
  - keyboard navigation / accessibility behavior

### 15.12 "Know Where Your Tokens Go"

Still needs in the ledger:

- exact default rankings to surface first:
  - top projects by tokens
  - top models by cost
  - time-window default
- relationship between thread Usage and app-wide analytics

### 15.13 One-Click Install

Still needs in the ledger:

- source precedence when the same asset id exists in multiple catalogs
- disable vs uninstall vs blocked-by-policy UX
- repair / rollback UX after failed update

### 15.14 Full IDE-Style Terminal and Panes

Still needs in the ledger:

- pane ownership of logs vs interactive PTYs
- persist-or-not behavior for terminal tabs on app restart
- split-pane semantics for terminals

### 15.15 Hot Reload, Live Reload, and Fast Iteration

Still needs in the ledger:

- starter `DevLoopProfile` examples for:
  - Vite
  - Next.js
  - Expo
  - Flutter
  - cargo-watch
- ready-state detection examples and port extraction strategies
- explicit fallback from hot reload to hot restart/full restart

### 15.16 Sound Effects Settings

Still needs in the ledger:

- final event taxonomy
- per-event routing rules
- imported-sound lifecycle:
  - add
  - validate
  - rename
  - remove
  - orphan cleanup

### 15.17 Instant Project Switch

Still needs in the ledger:

- open/recent project list cap and eviction policy
- exact "switch active tab only" vs "switch all tabs" command design
- moved-project rebind flow

### 15.18 Built-in Browser and Click-to-Context

Still needs in the ledger:

- shared-page-with-agent flow:
  - grant
  - visual indicator
  - revoke
  - cleanup
- attachment detail presets:
  - metadata only
  - metadata + css
  - metadata + screenshot
- cookies/storage policy for preview versus automation sessions

## Coverage checkpoint after fourth-pass research

What is now well-covered in the ledger:

- branching / checkpoints / restore lineage
- project identity and switching model
- browser preview versus automation split
- MCP host responsibilities and policy model
- catalog governance direction
- dev-loop profile concept
- instructions/rules ecosystem patterns
- mention/folder reference patterns and cost implications
- notifications as accessibility signals

What still needs one more fleshing pass before document work:

- exact default values and state machines for each feature
- a final per-feature "implementation contract" mini-spec in the ledger for all 18 items
- cross-feature failure/retry/recovery behavior written consistently in one place

## Fifth-pass ledger-only mini-specs for all 18 Section 15 features

The following are not plan-doc patches. They are ledger drafts of the implementation contracts that still need to be inserted through the proper document process later.

### 15.1 Dangerous-Command Blocking (FileSafe)

Purpose:

- block high-risk commands before execution and keep the resulting decision path auditable

Default behavior:

- dangerous command attempts create a persistent blocked episode in chat/runtime history
- block is resolved only by explicit user action, run termination, or superseding runtime state

Minimum state:

- `blocked_action_id`
- `run_id`
- `thread_id?`
- `command_text`
- `guard_source`
- `reason_code`
- `requires_safe_point_restore`
- `state`

State enum:

- `active_blocked`
- `approved_once`
- `approved_and_allowlisted`
- `cancelled`
- `superseded`
- `run_ended_unresolved`

Required UI actions:

- approve once
- approve and allowlist
- open FileSafe settings
- restore safe point then retry when required

Failure behavior:

- if approval becomes invalid due to policy change, show `approval_denied_by_policy`
- if the run ends before resolution, convert to `run_ended_unresolved`
- if the same command is retried after restore, link it to the original blocked episode for audit

### 15.2 Branching Conversations (Restore Then Fork)

Purpose:

- preserve the original history while allowing alternate continuations from an earlier anchor

Default behavior:

- `restore_here` is destructive to later history in the current branch only after confirmation
- `restore_and_branch` is the safer path and should be the default highlighted action

Minimum state:

- `branch_session_id`
- `parent_session_id`
- `parent_checkpoint_id`
- `branch_reason`
- `branch_label`
- `created_at`
- `archived_at?`

Default branch label:

- `"Branch from <checkpoint label or turn number>"`

Required compare fields:

- ancestor checkpoint
- turns/messages since fork
- changed files since fork
- current status of each branch

Failure behavior:

- if checkpoint blobs are missing, allow lineage browsing but disable file restore
- if parent session is deleted, preserve orphaned branch with `parent_missing`
- if background work is still mutating the source branch, disable destructive restore and offer branch-only continuation

### 15.3 In-App Project Instructions Editor

Purpose:

- edit effective project instruction files without leaving the app and without losing provider/rules provenance

Default behavior:

- open File Editor in `instructions` mode for the active project
- show a file selector with all supported instruction files discovered for the active project
- default target:
  - project rules file if present
  - else `AGENTS.md`
  - else provider-specific root instruction file if present

Required metadata per file:

- origin (`project`, `user`, `generated`, `imported`)
- provider applicability
- apply mode (`always`, `path_scoped`, `manual`, `unknown`)
- validation status

Validation classes:

- info
- warning
- blocking

Failure behavior:

- external file change while open triggers reload/keep/diff prompt
- invalid imports block save if the active provider depends on them
- unsupported file type for active provider warns but does not block editing

### 15.4 @ Mention System for File References

Purpose:

- add precise file/symbol/folder context intentionally and predictably

Default syntax draft:

- `@path/to/file`
- `@path/to/file#L10-L40`
- `@folder:path/to/folder`
- `@symbol:Name`

Default behavior:

- file mention attaches full file when below size cap
- large file mention degrades to outline/summary
- folder mention defaults to path + overview, not full contents
- full folder expansion requires explicit user opt-in

Default limits:

- max 12 file mentions
- max 8 symbol mentions
- max 3 folder mentions
- max 200 KB total resolved mention payload before truncation

Failure behavior:

- missing file shows unresolved mention chip before send
- oversized mention shows downgrade notice
- no active project disables file/folder mention resolution

### 15.5 Stream Timers and Segment Durations

Purpose:

- explain where time is going during streaming and long-running work

Canonical segments:

- thinking
- model_output
- tool_execution
- compaction
- waiting_for_approval
- idle_after_error

Default behavior:

- one active segment timer at a time
- keep last 5 completed segments
- tool sub-steps may appear in detailed activity but still roll up under `tool_execution`

Failure behavior:

- if segment-close event is missing because of crash/interruption, mark final segment `interrupted`
- if clocks skew or stream ordering is bad, keep order from received stream and clamp negative durations to 0

### 15.6 Interleaved Thinking Toggle

Purpose:

- control reasoning noise without losing runtime correctness

Precedence:

- app setting
- per-thread override
- per-entry collapse

Defaults:

- app default `show`
- thread default `inherit`
- entry default `collapsed`

Failure behavior:

- providers with no thinking stream hide the control or show disabled state
- if export/share omits hidden thinking, the export UI must state that omission explicitly

### 15.7 MCP Support

Purpose:

- host external tool/data providers with explicit lifecycle, health, auth, and policy handling

Server kinds:

- local process
- remote HTTP

Default behavior:

- configured servers are not assumed healthy until startup and capability listing succeed
- health is revalidated on app launch and before runs that depend on the server

Requested vs effective levels:

- app-global
- project override
- persona/agent override

Default permission grammar:

- exact tool id
- server prefix
- glob pattern

Failure behavior:

- bad binary/path -> `startup_failed`
- auth required -> `auth_required`
- version mismatch -> `capability_mismatch`
- server renamed -> old permissions kept in migration map until user reconciles

### 15.8 Project and Session Browser

Purpose:

- browse projects and historical work without conflating that flow with quick project switching

Default row types:

- project row
- session row

Session kinds:

- assistant thread
- interview session
- orchestrator run thread
- background automation session
- review/reconciliation thread

Default sort:

- projects by last activity descending
- sessions by last activity descending within project

Failure behavior:

- missing project path shows `missing_path` badge and repair/remove actions
- stale session references remain visible but disabled if backing artifacts are gone

### 15.9 Mid-Stream Token and Context Updates

Purpose:

- show live token/cost/context progression during streaming instead of only at completion

Default behavior:

- UI updates throttle to 500 ms
- context percentage shown only when provider reports limit
- otherwise show raw token count and cost only

Default fields to surface:

- total tokens
- input/output/reasoning/cache breakdown when available
- cost total
- context used vs limit when available

Failure behavior:

- unsupported providers remain on final-only updates without error
- invalid usage deltas are ignored and logged, not shown as negative counters

### 15.10 Multi-Tab and Multi-Window

Purpose:

- support parallel project/session work without collapsing everything into one workspace state

Default model:

- one process
- many windows
- many top-level tabs per window
- each top-level tab owns one active `project_id`

Default new-tab actions:

- new blank tab
- clone current tab
- open project in new tab

Failure behavior:

- if multi-window unsupported on a platform path, allow "detach to new process window" fallback or disable with explicit UI reason
- overlapping same-file edits trigger warning/choice, not silent merge

### 15.11 Virtualized Conversation or Log List

Purpose:

- keep long chat/log/history views responsive

Default shared contract:

- variable row measurement
- overscan 8
- bottom-follow only when user is near tail
- prepend-safe anchor preservation

Views that should use it first:

- chat thread
- run logs
- session browser
- restore/branch history

Failure behavior:

- if row measurement fails, fall back to estimated height with correction pass
- if the user jumps to a line/message anchor outside rendered range, virtualizer must materialize that range before focus moves

### 15.12 Know Where Your Tokens Go

Purpose:

- make usage actionable rather than purely archival

Default surfacing:

- app Usage defaults to:
  - top projects by tokens
  - top models by cost
  - last 7 days
- thread Usage links to app Usage filtered by project/thread when possible

Failure behavior:

- if cost missing but tokens present, still rank by token count
- if project ids were rebound after path moves, analytics should follow stable project identity where possible

### 15.13 One-Click Install

Purpose:

- install curated extensibility assets without manual file editing

Default lifecycle:

- fetch
- validate
- stage
- commit
- refresh
- rollback on failure

Default user actions:

- install
- update
- disable
- enable
- uninstall
- repair

Default source precedence draft:

- explicit local file install
- trusted team/private catalog
- first-party curated catalog
- public external catalog

Failure behavior:

- failed update leaves prior version active
- blocked-by-policy asset remains visible as installed-but-disabled
- duplicate asset ids across sources require explicit source choice or precedence resolution

### 15.14 Full IDE-Style Terminal and Panes

Purpose:

- provide integrated shell/process visibility without conflating every output source into one terminal

Default bottom-panel tabs:

- Terminal
- Problems
- Output
- Ports
- Browser
- Debug

Default terminal types:

- interactive shell
- dev loop
- test watch
- build output
- debug REPL

Default behavior:

- multiple terminal tabs per project
- optional global terminal tab type
- no automatic LRU close

Failure behavior:

- terminal startup failure surfaces in Output and inline toast
- PTY disconnect marks tab `disconnected` with reconnect/open-new options

### 15.15 Hot Reload, Live Reload, and Fast Iteration

Purpose:

- start and manage the right dev loop for the project stack with honest reload semantics

Default starter profiles to define first:

- Vite
- Next.js
- Expo
- Flutter
- cargo-watch

Profile fields:

- detection markers
- preferred launch command
- alternate commands
- reload capability
- state preservation class
- expected ports
- ready-state matcher
- known caveats

Failure behavior:

- missing command -> offer configure/install/help
- port collision -> show port conflict and allow retry with override
- crash loop -> auto-stop after threshold and require manual restart

### 15.16 Sound Effects Settings

Purpose:

- route audible and accessible status signals intentionally

Default event set:

- run success
- run failure
- approval needed
- rate limit hit
- critical error
- message in inactive thread
- timer milestone
- browser capture completed
- dev loop failed

Default routing controls per event:

- sound on/off
- system notification on/off
- announcement on/off
- only when app unfocused/backgrounded

Failure behavior:

- invalid custom sound fails validation and is not imported
- missing audio device disables sound playback while leaving settings visible
- system notification permission denial degrades gracefully to remaining enabled channels

### 15.17 Instant Project Switch

Purpose:

- swap the active top-level tab's project quickly while preserving project-scoped state

Default behavior:

- title-bar quick switcher acts on active top-level tab only
- separate command may later switch all tabs/windows, but that is not default

Default persistence:

- recent/open projects global
- last session/view per project
- draft input per project and tab

Failure behavior:

- moved project path offers rebind
- missing project config loads defaults plus warning
- active run on old project prompts before switch and continues in background if confirmed

### 15.18 Built-in Browser and Click-to-Context

Purpose:

- browse/preview inside the app and intentionally send bounded page element context to chat

Default behavior:

- inspect mode is primary capture UX
- modifier-click fallback exists when inspect mode unavailable
- preview/capture and automation sessions are separate by default

Default attachment presets:

- metadata only
- metadata + CSS summary
- metadata + screenshot artifact

Default persistence:

- browser tabs/history/bookmarks scoped per project for preview surface
- automation sessions ephemeral unless explicitly saved later

Failure behavior:

- blocked scheme or navigation policy shows inline browser error page
- page script spam cannot create captures when inspect mode is off
- shared-page-with-agent access can be revoked immediately and must clear active shared-session indicator

## Cross-feature defaults and failure-behavior notes still needed before document process

The biggest remaining ledger task after this pass is to consolidate cross-feature recovery and retry behavior for:

- interrupted stream with unresolved thinking/timer state
- restart with unresolved FileSafe block or pending approval
- project switch during active dev loop
- restore/branch when checkpoint blobs are partially missing
- catalog update failure after partial staging
- MCP server health changes during a run

These now look like a single "cross-feature lifecycle and recovery matrix" section should be added to the ledger before any document reconciliation starts.

## Cross-feature lifecycle and recovery matrix draft

This section is meant to prevent each Section 15 feature from inventing its own restart/switch/failure semantics.

### Application restart / crash restore

Feature groups affected:

- FileSafe blocks
- branching/restore history
- project/session browser
- multi-tab/multi-window
- terminal/dev loops
- browser preview/capture
- mid-stream usage/timers/thinking

Recommended behavior by artifact/state:

- unresolved FileSafe block:
  - restore as unresolved blocked episode if the originating run/thread still exists
  - mark `run_ended_unresolved` if the run cannot resume
- active stream with partial timers/thinking:
  - last open segment becomes `interrupted`
  - partial usage remains last-known value until final reconciliation
- active dev loop:
  - do not auto-restart blindly on app launch
  - restore status as `stopped_on_restart` with `Restart` action
- browser preview tabs:
  - restore project-scoped tabs/history/bookmarks
  - inspect mode restores off by default unless user explicitly pinned it
- automation browser sessions:
  - do not silently restore live shared-agent access
  - any shared-page grant expires on restart

### Project switch while work is active

Feature groups affected:

- active runs
- dev loops
- unsent drafts
- terminal tabs
- browser preview

Recommended default:

- switching project acts on the active top-level tab only
- unsent draft input persists automatically for the old project/tab
- active runs continue in background after confirmation
- dev loops continue attached to the original project unless explicitly stopped
- browser preview tabs remain scoped to the original project and do not migrate to the new project automatically

User-facing prompt triggers:

- active run on current project
- unresolved approval/FileSafe block on current project
- unsaved instruction-file edits

No-prompt cases:

- ordinary unsent chat drafts
- ordinary terminal tabs with no unsaved editor buffers
- passive browser tabs

### Missing or stale state on restore

Cases:

- missing project path
- missing checkpoint blob
- missing imported instruction file
- missing custom sound asset
- missing catalog source
- missing MCP server binary

Recommended handling:

- missing project path:
  - keep row in browser/switcher as `missing_path`
  - offer locate/remove
- missing checkpoint blob:
  - preserve metadata/history
  - disable destructive restore
  - allow branch lineage browsing
- missing imported instruction file:
  - warning in instructions editor
  - effective-instructions preview marks file omitted
- missing sound asset:
  - keep event enabled but fall back to built-in default or silent based on user choice
- missing catalog source:
  - installed assets remain visible with source `unavailable`
- missing MCP binary:
  - server state `startup_failed`
  - tool availability explains exact cause

### Unsupported or partial provider capability

Cases:

- provider does not stream usage
- provider does not stream thinking
- provider does not support MCP bridge
- provider does not support instruction-file type

Recommended handling:

- unsupported mid-stream usage:
  - final-only usage updates
  - no fake live counter
- unsupported thinking stream:
  - hide or disable thread thinking controls
- unsupported MCP bridge:
  - keep global MCP config
  - mark MCP-backed tools unavailable for that run/provider
- unsupported instruction file type:
  - keep file editable
  - effective-instructions preview shows `not used by active provider`

### Validation and partial-failure rules

Instructions editor:

- validation blocks save only for structurally invalid or runtime-breaking issues
- warnings never silently disappear; they remain visible until dismissed or fixed

Mentions:

- unresolved mentions show before send
- downgraded mentions disclose downgrade reason

Catalog installs:

- stage before commit
- failed validation or post-install check rolls back staged changes
- previous active version remains enabled on failed update

MCP:

- server can be configured but ineffective
- requested versus effective state must be visible at run time

### Concurrency and collision rules

Overlapping cases:

- same-file edits from multiple tabs/sessions
- project switch during restore
- branch creation during active background mutation
- browser capture while agent automation is attached to shared page

Recommended defaults:

- same-file overlap:
  - warn and require explicit user decision
  - no silent merge
- project switch during restore:
  - block switch until restore completes or user cancels restore
- branch creation during active background mutation:
  - allow branch from last stable checkpoint only
- browser capture with shared agent page:
  - preview capture still user-owned
  - shared-agent indicator stays visible

### Suggested common status vocabulary

Shared statuses worth reusing across features:

- `active`
- `idle`
- `interrupted`
- `unavailable`
- `disabled_by_user`
- `disabled_by_policy`
- `stopped_on_restart`
- `missing_dependency`
- `superseded`
- `archived`

Reusing a small common vocabulary across Section 15 features will make the eventual plan docs and implementation much easier to keep consistent.

## GUI-impact pass: feature-by-feature risks, collisions, and unanswered questions

This pass focuses on how the Section 15 features collide with the current GUI shell, panel system, breakpoints, and interaction model.

### Cross-cutting GUI risk themes

#### 1. Title-bar pressure

Current GUI plans already place several controls in the title/header area:

- app branding
- project bar / switcher
- theme toggle
- settings
- in some views, platform/model/context usage state also competes nearby

Risk:

- adding more Section 15 controls or status there will quickly exceed usable density, especially below desktop-wide breakpoints

Needed answer:

- which controls are truly title-bar-global versus view-local or panel-local

#### 2. Side-panel overload

The side panel or chat region currently absorbs:

- chat threads
- usage tab
- file manager
- plan panel
- imported context / artifacts / other panel content in adjacent specs

Risk:

- Section 15 features that assume "just add another side tab/panel" will create impossible stacking and weak discoverability

Needed answer:

- which Section 15 features deserve first-class pages, which belong in chat/file/browser surfaces, and which are settings-only

#### 3. Bottom-panel overcrowding

The bottom panel already includes:

- Terminal
- Problems
- Output
- Ports
- Browser
- Debug

Risk:

- terminal/dev-loop/browser/ports/debug features all compete for the same scarce vertical space

Needed answer:

- what must stay visible during active development work
- what is background data versus interactive surface

#### 4. Responsive breakpoints and detachable panels

Current GUI plans already depend on:

- detachable panels
- collapsed side panels
- overlay drawers on narrow widths
- native webview embedding

Risk:

- Section 15 features with panel-heavy UI can become inaccessible or contradictory at smaller widths or when detached

Needed answer:

- per feature, what is the minimum fallback interaction at compact breakpoints

### Feature-level GUI impact notes

### 15.1 Dangerous-Command Blocking (FileSafe)

Main GUI surfaces:

- chat thread inline card
- optional settings deep-link
- runtime history / event log

Major GUI risks:

- blocked card competes with normal assistant activity cards and command output blocks
- if the card auto-collapses or scrolls away during long output, the user may miss a required decision
- if the same run has multiple blocked episodes, stacking behavior is currently unspecified

Unanswered questions:

- can multiple blocked cards coexist in one thread visibly
- is there a summary chip/banner when older blocked episodes are offscreen
- what happens if the user is in a different project/thread when a block occurs in background work

### 15.2 Branching Conversations

Main GUI surfaces:

- History / Restore panel
- chat thread list or session browser
- compare view

Major GUI risks:

- branch, restore, and rewind are visually similar but semantically different
- the user can easily lose track of whether they are on the original branch or a fork
- compare UI can become unreadable if file diff, message history, and branch metadata are mixed in one pane

Unanswered questions:

- where branch lineage is shown persistently:
  - thread header
  - history panel
  - project/session browser
- whether compare is a dedicated page, modal, or side panel
- whether archive/delete actions are inline, contextual, or hidden behind a menu

### 15.3 In-App Project Instructions Editor

Main GUI surfaces:

- File Editor instructions mode
- file selector / mode badge
- effective-instructions preview

Major GUI risks:

- users may not understand whether they are editing AGENTS, provider memory, or project rules
- a plain markdown preview is not enough if provider applicability and precedence are not visible
- validation warnings can become too noisy if they are shown inline without grouping

Unanswered questions:

- does the editor show one "effective instructions" panel, one raw markdown preview, or both
- where provider applicability is displayed
- how imported files are navigated and edited without losing context

### 15.4 @ Mention System for File References

Main GUI surfaces:

- chat composer overlay
- File Manager / editor drag-into-chat
- resolved-context preview

Major GUI risks:

- file, folder, symbol, and other mention categories can make one overlay too dense
- large folder/full-content actions can be accidentally expensive without visible warning
- line-range precision is easy to hide or make undiscoverable

Unanswered questions:

- does the overlay default to files only with tabs/filters for folders/symbols
- where mention downgrade/cost warnings appear:
  - inline chip
  - send-time preview
  - composer footer
- how keyboard navigation works once the overlay supports file + folder + symbol + recent contexts

### 15.5 Stream Timers and Segment Durations

Main GUI surfaces:

- chat activity area
- run activity strip
- optional status/footer regions

Major GUI risks:

- timer text can compete with already-dense footer/header controls
- segment names may be too technical for normal users if exposed without explanation
- recent-segment history can turn into noise if shown inline during normal chat

Unanswered questions:

- whether timers belong near the context circle, in the activity transparency area, or in a separate run-status chip
- whether "recent segments" is always visible or only expandable

### 15.6 Interleaved Thinking Toggle

Main GUI surfaces:

- chat thread entries
- thread-level controls
- settings

Major GUI risks:

- there are three different concepts:
  - show/hide thinking entirely
  - collapse/expand visible entries
  - show global effort/reasoning controls
- users can confuse "thinking hidden" with "provider did not send thinking"

Unanswered questions:

- where the per-thread override lives:
  - thread menu
  - header toggle
  - settings drawer
- what placeholder/copy appears when thinking exists but is hidden

### 15.7 MCP Support

Main GUI surfaces:

- Settings → Advanced / MCP
- runtime tool picker / diagnostics
- provider or persona config UI

Major GUI risks:

- MCP UI can become a dumping ground for:
  - server config
  - auth
  - permissions
  - health
  - provider bridging
- users may not understand why a configured server is not usable in the current run without a strong effective-state view

Unanswered questions:

- whether MCP permissions live in the same surface as generic tool permissions or a linked companion view
- how to show per-agent overrides without making the settings UI explode
- whether "test connection" is a single button or a richer diagnostics panel

### 15.8 Project and Session Browser

Main GUI surfaces:

- dedicated Projects / Browser page
- optional session list pane

Major GUI risks:

- if project rows expand inline with many session types, the page can become visually noisy and hard to scan
- project/session browser can overlap heavily with title-bar switcher and chat thread selector

Unanswered questions:

- whether assistant threads, interview sessions, and background runs share one list or use separate filters/tabs
- whether the page defaults to projects first or recent sessions first
- where archive/delete actions live for sessions

### 15.9 Mid-Stream Token and Context Updates

Main GUI surfaces:

- context circle
- thread Usage tab
- tooltips / compact-now affordance

Major GUI risks:

- live token changes can create distracting UI churn if the footer/header repaints too often
- if the compact-now affordance is too close to passive context display, users may click it accidentally

Unanswered questions:

- whether the compact-now action belongs in tooltip only, Usage tab only, or both
- how live updates animate without making the context circle feel jittery

### 15.10 Multi-Tab and Multi-Window

Main GUI surfaces:

- top-level tab bar
- window management actions
- restore/session browser interactions

Major GUI risks:

- the app already has detachable panels and floating windows; adding top-level tabs and multi-window can create three different "containers" that users confuse:
  - top-level app tabs
  - detachable panels
  - standalone windows
- same-project multi-tab work can silently collide without strong visual cues

Unanswered questions:

- where the top-level tab bar lives in the current shell
- whether top-level tabs can be pinned/renamed
- how detached panels behave when a tab or window closes

### 15.11 Virtualized Conversation or Log List

Main GUI surfaces:

- chat message list
- project/session browser lists
- history/restore lists
- long logs

Major GUI risks:

- virtualization bugs show up as jumps, lost selection, bad keyboard focus, and flicker, not obvious crashes
- prepend-safe scroll behavior is especially critical for chat history and history/restore surfaces

Unanswered questions:

- whether one shared virtual-list component can handle both chat-style variable heights and dense log rows
- how selection/focus anchors are restored after new items stream in

### 15.12 "Know Where Your Tokens Go"

Main GUI surfaces:

- app Usage page
- thread Usage tab
- dashboard widgets

Major GUI risks:

- this can devolve into copy-only framing with no actual prioritization if the UI does not elevate specific rankings
- too many charts can bury the high-signal story

Unanswered questions:

- what appears first by default:
  - top projects
  - top models
  - recent spikes
- whether "know where your tokens go" is a page title, subtitle, or dashboard card framing

### 15.13 One-Click Install

Main GUI surfaces:

- Catalog page/tab
- installed-assets management view
- update/remove dialogs

Major GUI risks:

- catalog browsing, installed-state management, policy blocking, and version/update behavior are four different concerns that can become muddled in one screen
- disabled vs blocked vs not-installed states are easy to make visually ambiguous

Unanswered questions:

- whether installed items are shown in the same list as catalog search results or on a separate "Installed" subview
- how source trust and compatibility warnings are shown without overwhelming the card layout
- whether remove/disable/update actions are inline buttons or overflow actions

### 15.14 Full IDE-Style Terminal and Panes

Main GUI surfaces:

- bottom panel tabs
- terminal tab bar
- split panes

Major GUI risks:

- bottom panel already has many tabs; terminal tabs within a terminal tab creates nested tab UI
- dev-loop output, build output, and interactive shell can become visually indistinguishable if their tab labeling is weak

Unanswered questions:

- how terminal split panes are shown inside the current bottom-panel design
- whether terminal tabs show project badge / purpose icon
- how much of terminal history persists after close

### 15.15 Hot Reload, Live Reload, and Fast Iteration

Main GUI surfaces:

- Ports tab
- terminal/dev-loop tabs
- toolbar or project action buttons
- status indicators

Major GUI risks:

- "Watch mode" in the Ports tab is too generic for the number of supported stacks/workflows
- users need to understand whether they are starting:
  - a dev server
  - a watcher
  - a test watch
  - a hard restart
- if status is only in Ports, users working in chat/editor may not see critical dev-loop failures

Unanswered questions:

- where the primary "Start Dev Mode" button lives
- whether the active dev-loop state is visible in title/status bar or only in bottom panel
- how stack-specific caveats are shown without overwhelming the UI

### 15.16 Sound Effects Settings

Main GUI surfaces:

- Settings → General or Notifications/Accessibility subsection
- optional notification preview/test controls

Major GUI risks:

- a single long event list with toggles, dropdowns, sliders, and import actions can become a cluttered settings wall
- sound settings overlap strongly with system notifications and accessibility announcement preferences

Unanswered questions:

- whether sounds belong in General, Notifications, Accessibility, or a combined notifications-accessibility group
- whether each event row has:
  - sound toggle
  - notification toggle
  - announcement toggle
  - sound picker
  which may be too dense
- whether there is a "Test sound" action per event

### 15.17 Instant Project Switch

Main GUI surfaces:

- title-bar switcher
- command palette shortcut
- project/session browser as richer fallback

Major GUI risks:

- project switch and project browser overlap but are not the same interaction
- title-bar switchers become hard to use if they carry too much project status detail

Unanswered questions:

- how much row detail fits in the title-bar dropdown:
  - project name only
  - path
  - unread count
  - background activity
  - error state
- whether the title-bar switcher can open "open in new tab" directly or only switch current tab

### 15.18 Built-in Browser and Click-to-Context

Main GUI surfaces:

- bottom-panel Browser tab
- detached browser window
- chat composer attachment chips
- optional shared-with-agent indicator

Major GUI risks:

- embedded webview plus panel detaching is one of the highest-risk GUI implementation areas in the whole feature set
- inspect mode and agent-control mode must be visually impossible to confuse
- page-sharing with agent is risky if the indicator is subtle

Unanswered questions:

- where the shared-with-agent indicator lives:
  - browser toolbar
  - title/status bar
  - chat attachment strip
- how capture detail preset is selected:
  - global setting
  - toolbar dropdown
  - per-capture confirmation
- what happens to inspect mode when the browser tab detaches or the panel hides

## GUI-specific unanswered questions that still look blocker-leaning

- How are top-level workspace tabs represented without colliding with detachable panels and thread/session selectors?
- Which Section 15 surfaces are dedicated pages versus side-panel tabs versus bottom-panel tabs versus settings-only?
- Where does the user see active background work if they are not on the owning project/thread/tab?
- How does the product keep title-bar, side-panel, and bottom-panel density from collapsing at compact breakpoints once Section 15 UI is fully added?
- How does browser shared-with-agent state remain unmistakable when the browser is detached or hidden behind other panes?
- How does project switch behave visually when active background runs, dev loops, unresolved approvals, and unsent drafts all exist at the same time?

## GUI-specific risk ranking after this pass

Highest GUI risk:

- 15.18 Built-in Browser and Click-to-Context
- 15.10 Multi-Tab and Multi-Window
- 15.15 Hot Reload / Live Reload / Fast Iteration
- 15.17 Instant Project Switch

High GUI risk:

- 15.13 One-Click Install
- 15.8 Project and Session Browser
- 15.14 Full IDE-Style Terminal and Panes
- 15.7 MCP Support

Medium GUI risk:

- 15.3 Instructions Editor
- 15.4 @ Mention
- 15.9 Mid-Stream Usage
- 15.16 Sound Settings

Lower GUI risk but still needs crisp contracts:

- 15.1 FileSafe blocking
- 15.2 Branching Conversations
- 15.5 Stream Timers
- 15.6 Thinking Toggle
- 15.11 Virtualization
- 15.12 Token-framing analytics

## Subaudit merge: branch/session UX and continuity

Lens:

- UX / flow
- session continuity
- checkpoint / branch semantics
- project/session switching

Sources added from completed subaudit:

- VS Code manage chat sessions: https://code.visualstudio.com/docs/copilot/chat/chat-sessions
- VS Code chat checkpoints: https://code.visualstudio.com/docs/copilot/chat/chat-checkpoints
- GitHub changelog, VS Code 1.110 February release: https://github.blog/changelog/2026-03-06-github-copilot-in-visual-studio-code-v1-110-february-release
- Cursor tabs: https://docs.cursor.com/en/agent/chat/tabs
- Cursor duplicate chat: https://docs.cursor.com/en/agent/chat/duplicate
- Cursor checkpoints: https://docs.cursor.com/en/agent/chat/checkpoints
- Cursor chat history: https://docs.cursor.com/agent/chat/history
- Cursor background agents: https://docs.cursor.com/en/background-agents
- OpenCode CLI: https://opencode.ai/docs/cli/
- OpenCode server/session API: https://opencode.ai/docs/server/
- OpenCode agents: https://opencode.ai/docs/agents/
- OpenCode sharing: https://opencode.ai/docs/share/
- OpenCode changelog: https://opencode.ai/changelog
- JetBrains AI Chat: https://www.jetbrains.com/help/ai-assistant/ai-chat.html
- JetBrains Junie review/diffs: https://www.jetbrains.com/help/junie/diffs-and-review.html
- JetBrains open/move/close projects: https://www.jetbrains.com/help/idea/open-close-and-move-projects.html
- JetBrains Local History: https://www.jetbrains.com/help/idea/local-history.html
- Claude Code CLI usage: https://docs.anthropic.com/en/docs/claude-code/cli-usage
- Claude Code common workflows: https://docs.anthropic.com/en/docs/claude-code/tutorials
- Anthropic agent SDK session management: https://platform.claude.com/docs/en/agent-sdk/sessions
- Anthropic file checkpointing: https://platform.claude.com/docs/en/agent-sdk/file-checkpointing
- Claude Code IDE integrations: https://docs.anthropic.com/en/docs/claude-code/ide-integrations

Key additions from this subaudit:

- VS Code now offers both full-session fork and fork-from-checkpoint, which raises the bar for Puppet Master to define the difference between:
  - restoring within the same line of history
  - branching from a restore point
  - editing/retrying an earlier request
- Cursor clearly separates:
  - tabs/surfaces
  - duplicate-from-message branching
  - automatic checkpoints
  - remote background-agent history
  This is a useful warning that Puppet Master should not collapse every kind of continuity into one overloaded "session" concept.
- OpenCode is the strongest implementation precedent for explicit lineage because it exposes:
  - parent/child sessions
  - fork at message
  - revert / unrevert
  - diff between sessions
  - shared session state
- JetBrains shows the value of keeping AI history, project windows, and local file history related but distinct.
- Claude Code reinforces that session continuity and file-state continuity are different contracts and can diverge if not specified carefully.

New implementation-risk conclusions:

- Puppet Master still does not define whether a branch carries:
  - full message history copy
  - restore-point reference only
  - copied draft input
  - copied pending approvals / blocked states
  - copied live tool/browser/dev-loop attachments
- Puppet Master still does not define whether project switch restores:
  - last active session
  - last active tab set
  - last active preview/browser state
  - in-flight background run indicators
- Current plan text still risks conflating:
  - conversation session
  - project scope
  - UI placement
  - file restore history
  - runtime safe point

Spec consequences to carry into drafting:

- Define distinct but connected objects for:
  - `project`
  - `session`
  - `checkpoint`
  - `branch`
  - `surface`
- Define explicit copy/reference rules for every "branch from here" flow.
- Define project switch as a state-restore operation, not just a path swap.

## Concrete competitor behaviors worth borrowing or answering

### Checkpoint restore behavior

Sources:

- VS Code chat checkpoints: https://code.visualstudio.com/docs/copilot/chat/chat-checkpoints
- Cursor checkpoints: https://docs.cursor.com/en/agent/chat/checkpoints

Observed details:

- VS Code restore removes later requests from the conversation history and restores workspace files to the earlier checkpoint, with an explicit redo path after restore.
- VS Code can show per-request file-change summaries to help choose a checkpoint.
- Cursor checkpoints are:
  - automatic
  - local
  - separate from Git
  - limited to Agent changes only
  - automatically cleaned up

Why this matters for Puppet Master:

- The current plans still do not choose whether restore is:
  - destructive truncation of later history
  - non-destructive state rewind with redo stack
  - branch-only unless explicitly confirmed
- The product also has not chosen whether manual edits, terminal edits, tool edits, and browser-triggered edits all participate in the same restore model.

Minimum contract to add:

- restore semantics for message history
- restore semantics for file state
- redo availability after restore
- change-summary visibility before restore
- coverage matrix for edits by source (`agent`, `tool`, `terminal`, `manual`, `browser automation`)

### Chat tabs and same-file concurrency

Sources:

- Cursor tabs: https://docs.cursor.com/en/agent/chat/tabs
- Cursor history: https://docs.cursor.com/agent/chat/history

Observed details:

- Cursor tabs keep separate conversation history, context, and model selection.
- Cursor explicitly blocks multiple tabs from editing the same files at the same time and prompts for conflict resolution.

Why this matters for Puppet Master:

- Multi-tab and multi-window cannot stop at layout/state restoration. The product needs an editing-concurrency policy when multiple sessions target the same project and file set.

Minimum contract to add:

- whether concurrent tabs may target the same project
- whether same-file edits are blocked, warned, merged, or isolated by worktree
- how project switch interacts with tab-local dirty drafts and active runs

### Browser session isolation versus shared-session access

Source:

- VS Code browser agent testing guide: https://code.visualstudio.com/docs/copilot/guides/browser-agent-testing-guide

Observed details:

- VS Code browser agent tools are explicitly experimental and must be enabled in the tools picker.
- Agent-opened pages run in private in-memory sessions by default and do not share cookies/storage with normal browser tabs.
- A user can explicitly "Share with Agent" on an already-open page, which gives the agent access to the live page and its existing cookies/login state.

Why this matters for Puppet Master:

- This is the cleanest precedent for resolving the current contradiction between safe preview/capture and full agent browser control.

Minimum contract to add:

- default isolation for automation browser sessions
- explicit user-granted bridge from preview page to agent-accessible page
- visual indicator when a page is shared with an agent
- revoke flow and post-share cleanup behavior

### Extension/catalog policy precedence

Source:

- VS Code enterprise extensions: https://code.visualstudio.com/docs/enterprise/extensions

Observed details:

- VS Code supports allow/block by publisher, extension id, version, and platform.
- More specific selectors take precedence.
- Blocking an already-installed extension disables it rather than silently deleting it.
- Private marketplace and rehosted catalogs are first-class deployment models.

Why this matters for Puppet Master:

- One-click install needs a formal precedence model for trust, compatibility, disable/uninstall, and future team catalogs.

Minimum contract to add:

- policy selector precedence
- installed-but-now-blocked behavior
- disable vs uninstall behavior
- private/team catalog compatibility with the same asset model

### Watcher/task failure handling and scope

Sources:

- VS Code task provider: https://code.visualstudio.com/api/extension-guides/task-provider
- WebStorm File Watchers: https://www.jetbrains.com/help/webstorm/using-file-watchers.html
- WebStorm project security: https://www.jetbrains.com/help/webstorm/project-security.html

Observed details:

- VS Code task providers auto-detect tasks per workspace/folder and can resolve a single requested task without re-enumerating all tasks.
- WebStorm watchers can be project-level or global, scoped to selected file sets, save-triggered, and automatically disabled on runtime error.
- Safe mode/security trust can block watcher execution entirely.

Why this matters for Puppet Master:

- Hot reload/dev-loop design must distinguish:
  - detected dev tasks
  - saved watcher templates
  - trusted/untrusted project state
  - failure-disabled watchers

Minimum contract to add:

- project trust preconditions for running watchers/dev loops
- watcher scope and trigger policy
- auto-disable / retry behavior after repeated watcher failure
- detected-task caching and resolution model

### MCP auth, debugging, and permission precedence

Sources:

- MCP architecture: https://modelcontextprotocol.io/specification/2024-11-05/architecture/index
- OpenCode MCP servers: https://opencode.ai/docs/mcp-servers/
- OpenCode tools: https://opencode.ai/docs/tools/
- OpenCode agents: https://opencode.ai/docs/agents/
- OpenCode server: https://opencode.ai/docs/server/

Observed details:

- OpenCode supports both local and remote MCP servers.
- Remote MCP OAuth can be auto-detected, launched in the browser, and stored securely for later use.
- OpenCode exposes explicit auth/debug commands (`mcp auth`, `mcp debug`) and a server status endpoint.
- MCP server tools are registered with the server name as a prefix and can be enabled/disabled with glob patterns.
- Agent-specific tool configuration overrides global tool config.
- Permission systems with ordered matching rules use "last matching rule wins".

Why this matters for Puppet Master:

- The current plans say "test connection" and "config + passthrough", but the real host surface needs:
  - startup health visibility
  - auth-required states
  - debug affordances
  - naming stability
  - precedence rules that survive server rename and tool discovery changes

Minimum contract to add:

- remote vs local MCP server types
- OAuth/browser-login flow ownership
- secure token storage versus inline secret policy
- explicit debug/test outcomes
- ordered permission matching and effective-rule explanation
- server rename/migration behavior for persisted tool policies

### Marketplace and team-catalog direction

Sources:

- Cursor 2.6 changelog: https://cursor.com/changelog/2-6/
- VS Code enterprise extensions: https://code.visualstudio.com/docs/enterprise/extensions
- JetBrains plugin management: https://www.jetbrains.com/help/webstorm/managing-plugins.html

Observed details:

- Cursor is moving toward both MCP Apps and team marketplaces, not only public individual installs.
- VS Code and JetBrains both assume source governance, update policy, disable/uninstall distinction, and internal/private distribution.

Why this matters for Puppet Master:

- Catalog design should not hard-code a public single-source marketplace model.
- The asset model should survive:
  - curated first-party catalog
  - private/team catalog
  - direct file install
  - future remote gallery

Minimum contract to add:

- source identity and trust metadata
- catalog precedence when the same asset exists in multiple sources
- per-source policy controls
- update-channel and pinning rules

## Addendum: Antigravity browser signal and Slint/Wry platform constraints

### Antigravity browser signal

Official-source references:

- https://www.antigravityide.app/
- https://www.antigravityide.app/features

What the official Antigravity material supports at a high level:

- browser use is treated as a first-class agent surface, not an afterthought
- browser, terminal, and editor are presented as one connected agent workflow
- multi-surface operation is central to the product positioning

What the currently accessible official Antigravity material does **not** specify deeply enough to use as a contract source:

- exact browser window/tab model
- exact preview vs automation split
- cookie/session-sharing behavior
- element-capture payload shape
- detach/reattach behavior

Planning effect for Puppet Master:

- keep the browser first-class
- keep browser, terminal, editor, and artifacts tightly connected in the workflow
- do **not** overfit to Antigravity-specific implied UX details where the official sources remain marketing-level rather than contract-level

### Slint + Wry cross-platform constraints

Primary sources:

- Slint winit backend: https://docs.slint.dev/latest/docs/slint/guide/backends-and-renderers/backend_winit/
- Slint multi-window support context: https://slint.dev/blog/slint-1.7-released
- Wry WebViewBuilder docs: https://docs.rs/wry/latest/wry/struct.WebViewBuilder.html
- Wry crate platform notes: https://docs.rs/wry/latest/wry/

Constraints that materially affect the browser feature:

- Slint desktop deployment is realistically a `winit`-backed app across Linux, Windows, and macOS.
- Slint supports multi-window applications, so multiple windows are viable from a toolkit perspective.
- Wry is practical on:
  - Windows via WebView2
  - macOS via WKWebView-backed embedding
  - Linux/X11 via WebKitGTK child embedding
- Wry is not symmetric on Linux/Wayland:
  - child-webview embedding is not the simple default path
  - GTK integration requirements matter
  - assumptions about arbitrary in-pane child embedding are risky
- On Linux/X11, child webviews may need explicit resize/bounds management.

Resulting planning implications:

- embedded browser-in-panel cannot be the only supported model
- detached browser windows must stay a first-class supported path, especially for Linux/Wayland
- browser detach/reattach behavior is part of cross-platform correctness, not just UX polish
- the browser spec should avoid assuming that many simultaneous embedded webviews inside Slint panes are the normal happy path
- any future reconciled browser spec should explicitly call out platform-aware capability notes rather than pretending the browser surface is identical across Windows, macOS, Linux/X11, and Linux/Wayland

Updated direction after this addendum:

- keep the existing logical split:
  - `browser.preview_capture`
  - `browser.automation`
- keep `browser.preview_capture` first-class from a product perspective, which aligns with the Antigravity signal
- but for implementation planning, bias toward:
  - one primary preview/capture browser session per workspace tab
  - detached-window fallback as a normal supported path
  - avoiding browser designs that only work cleanly if child-webview embedding inside arbitrary Slint panes is universally reliable

Additional browser risk note:

- Linux/Wayland is the forcing function for the browser design
- if a proposed browser UX only feels correct when assuming seamless embedded child webviews everywhere, it is too optimistic for Puppet Master’s stack and should be rejected or downgraded

## Sixth-pass GUI research: shell topology, browser-first workflows, and cross-platform windowing

Date: 2026-03-11

This pass is specifically about the GUI changes that Section 15 features imply. The goal is no longer only "does the feature exist" but "what shell, panel, window, toolbar, drawer, badge, and responsive behavior must change for the feature to be buildable in the real Slint desktop app."

### Official / primary GUI references consulted in this pass

- VS Code user interface: https://code.visualstudio.com/docs/getstarted/userinterface
- VS Code custom layout: https://code.visualstudio.com/docs/configure/custom-layout
- VS Code browser agent testing guide: https://code.visualstudio.com/docs/copilot/guides/browser-agent-testing-guide
- VS Code accessibility docs: https://code.visualstudio.com/docs/configure/accessibility/accessibility
- VS Code recent releases for AI/accessibility/title-bar behavior:
  - https://code.visualstudio.com/updates/v1_102
  - https://code.visualstudio.com/updates/v1_98
- VS Code webview UX guidance: https://code.visualstudio.com/api/ux-guidelines/webviews
- JetBrains project windows: https://www.jetbrains.com/help/idea/open-close-and-move-projects.html
- OpenCode IDE docs: https://opencode.ai/docs/ide/
- OpenCode config docs: https://opencode.ai/docs/config/
- Antigravity official features page: https://www.antigravityide.app/features
- Slint winit backend docs: https://docs.slint.dev/latest/docs/slint/guide/backends-and-renderers/backend_winit/
- Wry crate docs: https://docs.rs/wry/latest/wry/

### Research-backed GUI findings that materially affect Section 15

#### 1. The shell must distinguish container types, not just "open this somewhere"

- VS Code explicitly separates editor area, primary sidebar, secondary sidebar, panel, status bar, and floating windows. It also allows views/panels to move between those regions and persists the layout.
- JetBrains distinguishes project window choice from later tab/window rearrangement.
- This means Puppet Master needs a canonical shell vocabulary before Section 15 keeps adding surfaces:
  - `page`
  - `side_panel_view`
  - `bottom_panel_tab`
  - `editor_group`
  - `top_level_workspace_tab`
  - `floating_window`
  - `overlay_drawer`
  - `title_bar_global_control`
- Several current Section 15 features are blocked less by product intent than by the lack of this shell vocabulary.

#### 2. Title-bar density must be treated as a hard budget

- VS Code uses the title bar for layout controls, command center, notifications, and some global indicators, but still keeps it constrained.
- The existing Puppet Master plans already want title-bar project switching, layout controls, and status affordances.
- Section 15 features cannot keep adding title-bar buttons for browser share state, dev-loop state, blocked-state alerts, token analytics, and multi-tab controls independently.
- The title bar needs a strict rule:
  - only app-global controls live there
  - per-project, per-session, and per-run controls belong elsewhere
- Practical implication:
  - project quick switcher may live in the title bar
  - dev-loop controls, browser inspect/share state, branch controls, and Usage actions should not all compete there

#### 3. Side-panel and bottom-panel roles need a clearer split

- VS Code uses sidebars for navigation/auxiliary views and the panel for runtime-heavy surfaces like terminal, problems, output, and debug.
- Current Puppet Master docs already trend that way, but Section 15 still keeps proposing side-panel tabs, bottom-panel tabs, and dedicated pages without a stable rule.
- Recommended shell rule from this pass:
  - side panel = navigation, thread/session/file/project browsing, review/context details
  - bottom panel = live runtime surfaces and operational diagnostics
  - pages = broad browse/manage flows that need more than one narrow column
- That implies:
  - project/session browser and catalog should be pages, not cramped side tabs
  - terminal, output, ports, browser runtime, and debug stay bottom-oriented
  - thread usage/context detail can stay side-oriented because it is scoped and inspectable rather than operationally primary

#### 4. Floating windows and detached surfaces are not optional polish anymore

- VS Code now supports floating windows for editors, terminals, and views, with restore, compact mode, and always-on-top affordances.
- JetBrains explicitly lets users choose same window versus new window for project opening, and on macOS merge windows into tabs later.
- Slint supports multi-window apps, so the blocker is not "toolkit cannot do windows"; it is defining the state model.
- For Puppet Master, detached/floating windows must become first-class in the shell model for:
  - editor groups
  - browser/preview
  - possibly dedicated review or compare surfaces later
- Cross-platform implication:
  - detached browser/preview windows are not degraded fallback wording
  - they are part of the primary supported behavior, especially on Linux/Wayland

#### 5. Browser-as-context and browser-as-tool must stay visibly distinct

- VS Code browser agent tools are experimental, explicitly enabled, and use private in-memory sessions by default.
- VS Code also supports an explicit "Share with Agent" action and shows a visible indicator when the page is shared.
- Antigravity product positioning reinforces that browser, terminal, and editor belong in one workflow, but its official material does not define the lower-level contracts Puppet Master still needs.
- Planning consequence:
  - preview/capture browser and automation browser cannot be one ambiguous surface
  - the UI must make the boundary unmistakable:
    - inspect mode for user-owned capture
    - separate permissioned automation/browser tools
    - explicit shared-page indicator
    - explicit revoke path
- This research strengthens the earlier ledger direction rather than replacing it.

#### 6. Linux/Wayland changes the browser and preview design materially

- Wry documents child webviews as supported on macOS, Windows, and Linux X11 only.
- Wry recommends GTK-specific construction on Linux when Wayland support matters.
- Slint's winit backend means the app can be multi-window, but embedded browser assumptions must account for GTK/WebKitGTK realities on Linux.
- This means GUI specs must stop implying that all browser/preview affordances are equivalently embeddable in every panel on every desktop platform.
- Result:
  - detached browser windows stay first-class
  - browser detach/reattach must be in the spec, not left as implementation improvisation
  - "hidden prewarmed embedded browser panes" is a risky assumption for startup and responsiveness
  - multiple simultaneous embedded browser instances inside arbitrary panes should be treated as high risk, not default-happy-path behavior

#### 7. Responsive behavior must be per feature, not only per shell

- The existing `FinalGUISpec.md` breakpoints are useful but too generic for the Section 15 additions.
- Several competitor patterns only feel coherent because they define how views collapse, move, or become drawers when space shrinks.
- Every Section 15 feature now needs an explicit compact-mode fallback:
  - stays visible
  - moves behind overflow
  - becomes a drawer/page
  - becomes command-palette only
  - disables a detail subview until expanded
- Without that, the current shell breakpoints are too shallow for implementation.

#### 8. Accessibility and notification cues are now part of runtime correctness

- VS Code accessibility docs and release notes treat sounds and announcements as configurable accessibility signals, not ornamental effects.
- VS Code has explicit signals for chat requiring user action and other state transitions.
- This changes the sound-settings scope:
  - notifications, sounds, accessibility announcements, and action-required states are one family of GUI behavior
  - FileSafe / approval-needed / background mention / dev-loop failure should participate in that family
- Section 15.16 therefore affects much more than one settings page.

#### 9. Toolbar density requires a shared overflow pattern

- VS Code explicitly allows hiding less-used toolbar actions behind overflow menus, rather than requiring every view to expose its entire action set inline.
- Puppet Master will need the same pattern because multiple Section 15 features add row-level or surface-level actions:
  - branch actions
  - restore actions
  - browser capture actions
  - instructions diagnostics actions
  - catalog lifecycle actions
  - dev-loop restart actions
- A shared overflow/action-density rule is now a shell requirement, not an implementation nicety.

#### 10. Top-level tabs need a stronger identity than "another container"

- Cursor and VS Code patterns suggest tabs can represent separate conversations, contexts, or workspaces, but the user still needs stable indicators for what each tab owns.
- JetBrains windowing reinforces that project-open choice and window placement are different decisions.
- If Puppet Master adds top-level tabs without stronger identity cues, users will lose track of:
  - active project
  - active session
  - unread/background state
  - dirty draft state
  - active run/dev-loop state
- A top-level tab chip likely needs at minimum:
  - project label
  - optional session label
  - status badge
  - dirty/unread/background indicator

### Shell-level GUI contract implications now recommended for Puppet Master

#### Surface placement rules

- `title_bar_global_control`
  - project quick switcher
  - global notifications/status entrypoint
  - layout controls
  - maybe app-global activity indicator
- `top_level_workspace_tab`
  - owns one active `project_id`
  - owns one active primary session/surface context
  - may show background/unread/dirty badges
- `page`
  - project/session browser
  - catalog/install management
  - usage analytics page
  - maybe future branch/compare browser if it outgrows side surfaces
- `side_panel_view`
  - chat thread/session selector
  - thread usage/context details
  - file tree / project navigation
  - branch/history inspector if narrow-scope
- `bottom_panel_tab`
  - terminal
  - output
  - problems
  - ports
  - browser runtime/preview host
  - debug
- `floating_window`
  - detached editor groups
  - detached browser/preview
  - maybe future compare/review surface
- `overlay_drawer`
  - narrow-width versions of side-panel content
  - temporary selectors or review panes below 720px

#### New shell primitives that now look necessary

- global "attention center" or equivalent notification target for:
  - approval needed
  - blocked run
  - background mention
  - dev-loop failed
  - MCP auth required
- shared row-badge vocabulary for:
  - active
  - unread
  - background_running
  - blocked
  - missing_path
  - archived
  - shared_with_agent
- shared toolbar overflow model so every view does not invent its own action-spill behavior
- shared detachable-surface affordance:
  - docked
  - detached
  - compact detached
  - always on top optional later
- shared "surface identity" header pattern for views that can move between side panel, page, and floating window
- shared empty/loading/error-state copy family for page, panel, and detached-window variants

#### Responsive rules that should become explicit

- `>= 1360px`
  - full shell can show side panel + primary content + bottom panel comfortably
  - project switcher may show richer row metadata
- `1080-1359px`
  - title bar should compress labels first
  - side panel content must favor status chips over verbose metadata
  - browser/runtime split views should avoid multi-column chrome
- `720-1079px`
  - side panel content should become drawer-first
  - project/session browser should prefer dedicated page over cramped inline panel
  - browser inspect/capture controls need icon-plus-tooltip fallback
- `< 720px`
  - only one major content surface at a time
  - bottom panel content becomes route/drawer based
  - title-bar controls must collapse aggressively
  - any flow that depends on always-visible parallel panels is not viable as written

### Research-backed GUI changes required by feature

### 15.1 Dangerous-Command Blocking (FileSafe)

- Needs a persistent, attention-grabbing inline card style that is visually distinct from ordinary assistant output, not just another message block.
- Needs a shell-level background alert path when the block happens in a non-focused project/tab/thread.
- Needs an off-thread discovery surface:
  - title-bar/global action-needed entrypoint
  - project/session row badge
  - thread badge
- Needs a stacking rule when several blocked episodes exist:
  - latest inline card
  - older blocked episodes summarized behind a counter or history link
- Compact GUI fallback:
  - inline action row may collapse to primary CTA + overflow menu
  - explanatory copy must stay visible even when buttons compress

### 15.2 Branching Conversations

- Needs a persistent branch identity indicator in the thread/session header so the user always knows whether they are on mainline or a fork.
- Needs a dedicated affordance split between:
  - restore here
  - restore and branch
  - compare
- Needs one visible branch lineage surface instead of hiding branch state in menus only.
- Compare likely outgrows a tiny side panel once message history + changed files + lineage metadata coexist; a dedicated page or detachable compare surface is increasingly likely.
- Compact GUI fallback:
  - branch label stays visible
  - compare becomes explicit navigation, not inline split view

### 15.3 In-App Project Instructions Editor

- Needs an instructions-specific header/state strip in the editor that shows:
  - file class
  - origin
  - provider applicability
  - validation status
- Needs a side-by-side or toggleable "effective instructions" preview; plain raw markdown is not enough.
- Needs imported-file navigation UI that preserves provenance rather than acting like generic file-open.
- Needs a diagnostics list or grouped warning area so validation does not become noisy inline markdown clutter.
- Compact GUI fallback:
  - diagnostics move to a drawer or bottom sheet
  - effective preview becomes toggleable rather than always split

### 15.4 @ Mention System for File References

- Needs a typed picker overlay with category handling for files, folders, symbols, and possibly past sessions later.
- Needs visible cost/downgrade disclosure in the composer before send, not only after resolution.
- Needs drag-from-file-tree and drag-from-editor-tab affordances that visually create mention chips.
- Needs keyboard-first navigation because mention overlays become dense quickly.
- Compact GUI fallback:
  - one search list with lightweight filters instead of multi-pane results
  - folder full-content mode must require explicit extra confirmation

### 15.5 Stream Timers and Segment Durations

- Needs one canonical placement for active segment status so time data does not fight with token usage and platform/model chips.
- Needs progressive disclosure:
  - small current segment indicator
  - expandable recent-segment list
- Needs interruption/error visual states that read as runtime transparency, not as a broken progress bar.
- Compact GUI fallback:
  - keep only current segment visible
  - move detailed history into thread Usage/Activity detail

### 15.6 Interleaved Thinking Toggle

- Needs a visible distinction between:
  - hidden because user chose collapse
  - unavailable because provider sends none
  - partially summarized because provider only exposes summaries
- Needs per-thread control placement that does not compete with core send/model controls.
- Needs a consistent placeholder block for hidden reasoning so transcript structure stays comprehensible.
- Compact GUI fallback:
  - thread-level toggle in overflow
  - per-entry expand/collapse remains local

### 15.7 MCP Support

- Needs a stronger settings IA split:
  - server inventory and health
  - auth/debug
  - permission/effective availability
  - per-agent overrides
- Needs effective-state explanations in the runtime tool picker, not just in settings.
- Needs auth-required and startup-failed states to route into the same action-needed/notification system as other blocked work.
- Needs debug/test affordances that can open browser-based auth where required without confusing them with ordinary preview/browser surfaces.
- Compact GUI fallback:
  - settings rows summarize health with badges
  - deep diagnostics open on a dedicated detail page/panel

### 15.8 Project and Session Browser

- Needs to become a dedicated management page, not only a quick switch dropdown.
- Needs row density rules because projects + sessions + states + kinds can become visually noisy fast.
- Needs clear filter controls for session kinds rather than one undifferentiated mixed list.
- Needs inline indicators for background runs, unread activity, missing paths, and archived state.
- Compact GUI fallback:
  - project-first list with drill-in
  - hide secondary metadata until row focus/selection

### 15.9 Mid-Stream Token and Context Updates

- Needs to be visually coordinated with the existing context circle and not produce jitter or accidental clicks.
- Needs separation between passive display and active actions like compact-now.
- Needs a final-only fallback state for unsupported providers that still looks intentional.
- Needs a tooltip/detail panel that can explain changing counters without overloading the header/footer.
- Compact GUI fallback:
  - numeric percentage only in header/footer
  - detail opens in thread Usage panel

### 15.10 Multi-Tab and Multi-Window

- Needs a tab identity design strong enough to show project/session ownership and run state at a glance.
- Needs a container vocabulary visible in the UI so users can distinguish:
  - top-level tab
  - detached panel/window
  - floating editor/browse window
- Needs explicit close/restore behavior for tab sets and detached surfaces.
- Needs same-file/concurrent-edit warnings to surface in tabs/windows before conflict becomes silent damage.
- Needs pinned-tab and possibly locked-tab/group semantics if top-level tabs are going to coexist with many background states.
- Compact GUI fallback:
  - tab labels prioritize project identity and badges over verbose path text

### 15.11 Virtualized Conversation or Log List

- Needs one shared virtual-list behavior contract across chat, logs, history, and browsers of long rows.
- Needs anchor/focus rules that are visible in UX testing because failures appear as jumps and lost selection, not crashes.
- Needs accessibility rules for keyboard focus, screen-reader labels, and preserved selection when rows materialize/de-materialize.
- Compact GUI fallback:
  - virtualization remains internal, but visible controls like "jump to newest" or "load older" may need simpler presentation

### 15.12 Know Where Your Tokens Go

- Needs a clear first-screen information hierarchy:
  - top projects
  - top models
  - recent spikes
- Needs stronger linkage from thread Usage to app-wide Usage so the user feels continuity rather than two separate analytics products.
- Needs careful chart/table density rules so the page stays actionable and not dashboard clutter.
- Compact GUI fallback:
  - summary cards first
  - deeper charts/tables behind tabs/sections

### 15.13 One-Click Install

- Needs separate but connected GUI states for:
  - discover
  - installed
  - disabled
  - blocked by policy
  - update available
  - repair needed
- Needs transaction progress UX with rollback/error explanation instead of a single optimistic install button.
- Needs trust/source/compatibility metadata to be visible without overwhelming result cards.
- Needs a future-safe source model that can support first-party, team, and direct-file sources.
- Compact GUI fallback:
  - result cards compress to status chip + primary action + detail drill-in

### 15.14 Full IDE-Style Terminal and Panes

- Needs a stronger bottom-panel information architecture so nested tabs do not become unreadable.
- Needs visible differentiation between terminal types:
  - interactive shell
  - dev loop
  - test watch
  - build output
  - debug REPL
- Needs project/purpose badges in terminal tabs if multiple projects and runs can coexist.
- Needs detach/focus-existing/new-session flows for terminals, not only create-another-tab behavior.
- Compact GUI fallback:
  - focus existing terminal/dev-loop command becomes more important than showing many simultaneous tabs

### 15.15 Hot Reload, Live Reload, and Fast Iteration

- Needs one primary entrypoint for starting dev mode; current doc drift between Ports, watchers, and assistant actions is not buildable.
- Needs always-visible enough status for active dev loops even when the bottom panel is hidden.
- Needs stack-specific disclosure in the GUI:
  - hot reload
  - hot restart
  - full restart only
  - state preserved conditional
- Needs strong failure surfaces for crash loops, missing commands, and port conflicts.
- Needs open-in-browser / restart / hard restart actions to live near the active dev-loop state, not be scattered.
- Compact GUI fallback:
  - one summarized dev-loop badge in title/status area
  - detailed controls remain in bottom panel or dedicated page

### 15.16 Sound Effects Settings

- Needs a settings IA that treats sounds, system notifications, and accessibility announcements as one group.
- Needs an event-routing grid or equivalent that stays readable; one endless list of toggles/dropdowns will not scale well.
- Needs preview/test affordances and clear degraded states when audio device or notification permission is unavailable.
- Needs event categories aligned with actual runtime/action-needed events across the app.
- Compact GUI fallback:
  - global presets first
  - per-event advanced controls in expandable detail

### 15.17 Instant Project Switch

- Needs to be defined as the fast entrypoint into the same model as project/session browser, not a separate competing system.
- Needs row content budgeting for title-bar dropdowns:
  - project name mandatory
  - status chips selective
  - path/details secondary
- Needs explicit behavior around active runs, dev loops, unresolved approvals, and unsaved instruction edits before switching.
- Needs actions beyond "switch now" only if they remain understandable:
  - open in new tab
  - rebind moved path
  - show in browser/page
- Compact GUI fallback:
  - quick switcher shows less metadata
  - full management shifts to project/session browser page

### 15.18 Built-in Browser and Click-to-Context

- Needs the strongest visual separation in the whole Section 15 set between:
  - preview browsing
  - inspect/capture
  - shared-with-agent
  - automation/browser tool session
- Needs a toolbar/status model that survives docking, detaching, and narrow widths without hiding dangerous state.
- Needs explicit platform-aware behavior for when browser opens detached rather than embedded.
- Needs capture-presets UI that does not require a heavy confirmation modal for every click but still keeps attachment scope understandable.
- Needs inspect mode state persistence rules, especially when the panel hides or the window detaches.
- Needs a visible shared-with-agent indicator that remains discoverable even when the owning browser window is not frontmost.
- Compact GUI fallback:
  - inspect remains explicit
  - modifier-click is only fallback behavior, not the main discoverability path

### Cross-feature GUI blocker questions sharpened by this pass

- Which Section 15 features are pages versus side-panel views versus bottom-panel tabs versus settings subsections?
- What is the canonical visual difference between a top-level workspace tab, a floating/detached window, and a docked panel?
- Where does app-global "action required" live when the triggering work is in another project, tab, window, or background session?
- How much metadata may the title-bar quick switcher show before it collapses under its own density?
- Which surfaces are allowed to own primary actions, and which surfaces are inspect-only or browse-only?
- How does the browser shared-with-agent state remain unmistakable when the browser is detached, backgrounded, or reopened on restore?
- What is the exact responsive fallback for each of:
  - project/session browser
  - browser inspect/capture
  - dev-loop controls
  - instructions diagnostics
  - branch compare
  - catalog detail

### Immediate GUI drafting implications for later reconciliation

- The next reconciled Section 15 doc work should include a "surface placement matrix" for all 18 features.
- The next reconciled GUI work should include a "detached/floating surface model" that applies consistently to editor, browser, and later compare/review surfaces.
- Browser planning should continue to treat Antigravity as a product-direction signal, but VS Code browser-tool behavior and Slint/Wry platform constraints should drive the actual contract text.
- Linux/Wayland should remain the browser/preview design stress case.
- Sound settings should be drafted together with the action-needed/notification model, not as an isolated settings add-on.
- Project switcher, project/session browser, top-level tabs, and multi-window work now need one combined shell/state diagram rather than four loosely related sections.

## Subaudit merge: competitor shell patterns and concrete browser host constraints

### Shell-pattern merge

Additional official sources folded in from shell-pattern subaudit:

- VS Code multi-root workspaces: https://code.visualstudio.com/docs/editing/workspaces/multi-root-workspaces
- VS Code worktrees: https://code.visualstudio.com/docs/sourcecontrol/branches-worktrees
- Cursor chat tabs: https://docs.cursor.com/en/agent/chat/tabs
- Cursor changelog 0.49: https://www.cursor.com/changelog
- Cursor changelog page 3: https://cursor.com/changelog/page/3
- Claude Code IDE integrations: https://code.claude.com/docs/en/ide-integrations
- VS Code 1.99 update notes: https://code.visualstudio.com/updates/v1_99
- Cursor `@Web` docs: https://docs.cursor.com/context/%40-symbols/%40-web
- JetBrains tool windows: https://www.jetbrains.com/help/idea/tool-windows.html
- JetBrains viewing modes: https://www.jetbrains.com/help/webstorm/ide-viewing-modes.html
- JetBrains notifications: https://www.jetbrains.com/help/clion/notifications.html

What this subaudit adds beyond the earlier GUI pass:

- project switching in competitor tools is increasingly modeled as a workspace/window action, not only an AI-session selector
- chat/agent tabs are treated as isolated work containers with status dots and edit-conflict controls, not just UI conveniences
- floating windows are now normal workflow primitives for editors, terminals, and AI/chat surfaces
- layout presets and chrome-density modes are now explicit product features, not just incidental responsive behavior
- per-session badges plus optional OS notifications/sounds are the dominant attention model for background AI work

Additional shell implications now worth carrying forward:

- "instant project switch" should be framed as:
  - focus recent project in current workspace tab
  - open recent project in new workspace tab
  - open recent project in new window
  rather than as a single ambiguous switch verb
- top-level workspace tabs need visible status semantics closer to:
  - unread
  - background running
  - permission needed
  - finished while hidden
  rather than only active/inactive styling
- the shell likely needs named layout presets or at least persistent layout modes such as:
  - agent-heavy
  - editor-heavy
  - browser-heavy
  - compact
- the app should not assume one universal "best" layout once browser, terminal, project browser, and multi-session work all become first-class

### Browser-host and platform-constraint merge

Additional official sources folded in from browser-host subaudit:

- Slint `Window` docs: https://docs.slint.dev/latest/docs/rust/slint/struct.Window
- Wry README: https://github.com/tauri-apps/wry
- WebView2 overview: https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/overview-features-apis
- WebView2 `CreateCoreWebView2ControllerAsync`: https://learn.microsoft.com/en-us/dotnet/api/microsoft.web.webview2.core.corewebview2environment.createcorewebview2controllerasync?view=webview2-dotnet-1.0.2045.28
- WebView2 windowed vs visual hosting: https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/windowed-vs-visual-hosting
- WebView2 new-window event: https://learn.microsoft.com/en-us/microsoft-edge/webview2/reference/winrt/microsoft_web_webview2_core/corewebview2newwindowrequestedeventargs?view=webview2-winrt-1.0.3537.50
- WebView2 browser-feature differences: https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/browser-features
- WebView2 user data folder: https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/user-data-folder
- WebView2 multi-profile support: https://learn.microsoft.com/en-us/microsoft-edge/webview2/concepts/multi-profile-support
- WebKitGTK `WebView` create/ready-to-show behavior: https://webkitgtk.org/reference/webkit2gtk/2.1.4/WebKitWebView.html
- WebKitGTK automation allowed: https://webkitgtk.org/reference/webkit2gtk/2.39.90/method.WebContext.set_automation_allowed.html
- WebKitGTK automation create-web-view: https://webkitgtk.org/reference/webkit2gtk/2.38.3/signal.AutomationSession.create-web-view.html
- WebKitGTK automation-controlled view: https://webkitgtk.org/reference/webkit2gtk/2.41.1/property.WebView.is-controlled-by-automation.html
- WebKitGTK related view: https://webkitgtk.org/reference/webkit2gtk/2.42.4/ctor.WebView.new_with_related_view.html
- Apple WKUIDelegate popup creation hook: https://developer.apple.com/documentation/webkit/wkuidelegate/webview%28_%3Acreatewebviewwith%3Afor%3Awindowfeatures%3A%29
- WebKit inspectable web content: https://webkit.org/blog/13936/enabling-the-inspection-of-web-content-in-apps/
- WebKit App-Bound Domains: https://webkit.org/blog/10882/app-bound-domains/

What this subaudit adds beyond the earlier browser notes:

- host-window lifecycle is lazy:
  - Slint window handles and Wry host surfaces should be treated as post-show resources
  - embedded preview/browser surfaces should not be modeled as eagerly created static children at bootstrap
- Linux embedded support is bifurcated:
  - X11 child embedding is one story
  - Wayland support pushes toward GTK-hosted integration or detached-window fallback
- detached browser windows must be real top-level app windows, not tooltip/menu/popover style surfaces
- Windows hosting is airspace-like:
  - native child-webview rectangles do not mix cleanly with arbitrary overlay chrome assumptions
  - browser-toolbar overlays, translucent decorations, and drag handles must be specified conservatively
- preview and automation are not only permission variants; they are genuinely different surface classes with different engine/session expectations
- embedded webviews are not safe substitutes for the system browser in OAuth, SSO, or general browsing flows
- session/storage sharing must be an explicit product decision, not an accidental engine default
- inspectability/devtools is also a per-surface policy choice

Concrete browser GUI/spec implications sharpened by this merge:

- add a per-surface ledger/spec row shape for browser-capable surfaces with fields like:
  - `surface_id`
  - `role`
  - `host_mode`
  - `platform_matrix`
  - `new_window_policy`
  - `session_isolation`
  - `inspectable`
  - `reparentable`
  - `wayland_fallback`
  - `overlay_limits`
- explicitly decide `window.open` / popup behavior for browser surfaces:
  - deny
  - open in system browser
  - reuse current preview
  - open detached app browser window
- treat OAuth/auth browsing as a separate `auth` surface class that can use system browser or platform auth session rather than piggybacking on preview/automation
- default preview/browser toolbar design should assume no reliable rich overlaying on top of the native webview content region
- detached browser windows need the same visible state affordances as docked ones:
  - inspect on/off
  - shared-with-agent
  - preview versus automation
  - page trust/scheme block status

### Combined takeaways after both subaudits

- the browser feature is not only "big UI"; it is a shell-and-host-architecture feature
- the multi-tab, project switch, and multi-window features cannot be reconciled separately anymore
- a later owner doc should probably include one combined "workspace shell model" section that defines:
  - window
  - workspace tab
  - project
  - session
  - panel/view
  - detached surface
  - browser surface type
- the browser feature should be specified with at least these distinct surface classes:
  - `preview`
  - `detached-preview`
  - `automation`
  - `auth`
- Linux/Wayland remains the most important negative test:
  - if the GUI concept only feels coherent with many embedded child webviews in arbitrary panes, it should be treated as non-portable and rewritten

## Seventh-pass closure: implementation-ready decisions for all remaining open items

Date: 2026-03-11
Status: all previously open Section 15 implementation questions are now resolved in this ledger. Any earlier "still needs", "minimum contract to add", "unanswered questions", or "later drafting implication" text should be read as superseded by the decisions below when there is any conflict.

### Closure rule

- Section 15 is now treated as implementation-ready at the ledger level.
- No feature below should be considered blocked by unspecified GUI/state/interaction behavior unless a later owner-doc reconciliation introduces a deliberate change.
- Where earlier notes offered multiple plausible options, this section chooses one canonical option.

## Canonical shell model

### Root entities

- `window`
  - top-level native app window
  - owns one or more `workspace_tab`
- `workspace_tab`
  - top-level tab within a window
  - owns exactly one active `project_id`
  - owns one active primary session focus
  - persists its own side-panel selection, bottom-panel selection, and draft input
- `project`
  - stable identity independent of current path string
  - keyed by durable `project_id`
  - path changes rebind to the same identity when confirmed
- `session`
  - conversation or run-scoped history container
  - belongs to one project
  - can be surfaced in side panel, page, or detached window without changing identity
- `checkpoint`
  - restore anchor for session/file/runtime state
- `branch`
  - lineage record referencing a parent session and checkpoint
- `surface`
  - dockable GUI presentation target
  - types: `page`, `side_panel_view`, `bottom_panel_tab`, `floating_window`, `overlay_drawer`
- `browser_surface`
  - specialized surface role: `preview`, `detached-preview`, `automation`, `auth`

### Canonical shell placement rules

- Title bar is app-global only.
- Top-level workspace tabs are project-scoped work containers.
- Side panel is for navigation and scoped inspection.
- Bottom panel is for runtime/operational surfaces.
- Dedicated pages are for broad browsing and management flows.
- Floating windows are first-class for editor and browser-capable surfaces.
- Overlay drawers are compact-width fallback presentations, not primary desktop surfaces.

### Surface placement matrix

| Feature | Primary surface | Secondary surface(s) | Compact fallback |
| --- | --- | --- | --- |
| 15.1 FileSafe blocking | chat thread inline card | global attention center, project/session badges | inline primary CTA + overflow |
| 15.2 Branching conversations | thread header + History/Restore side view | compare page or detached compare window | branch label + navigate-to-compare |
| 15.3 Instructions editor | file editor instructions mode | diagnostics drawer, effective preview pane | toggle between raw/effective/diagnostics |
| 15.4 `@` mention | composer picker overlay | resolved-context strip | single-list picker with filters |
| 15.5 Stream timers | thread activity strip | Usage/Activity detail | current-segment only |
| 15.6 Thinking toggle | thread header overflow + per-entry blocks | app settings | overflow-only thread toggle |
| 15.7 MCP | settings page | tool picker explanations, attention center for auth/errors | summary rows + drill-in |
| 15.8 Project/session browser | dedicated page | quick-switch title-bar entrypoint | project-first drill-in page |
| 15.9 Mid-stream usage | context circle + Usage detail | tooltip, Usage panel | numeric summary + Usage detail |
| 15.10 Multi-tab/window | top-level tab bar | detached windows | compressed tab chips |
| 15.11 Virtualized lists | internal shared behavior | jump/load controls per view | same, but simplified controls |
| 15.12 Token analytics | Usage page | thread Usage deep-link | cards-first layout |
| 15.13 Catalog install | Catalog page | Installed detail page/panel | compressed cards + drill-in |
| 15.14 Terminal/panes | bottom panel | detached terminal window later-optional | focus-existing over many tabs |
| 15.15 Dev loop / hot reload | bottom panel + status badge | title/status bar summarized state | summarized badge + detail page/panel |
| 15.16 Sound settings | Notifications/Accessibility settings group | per-event preview/test controls | presets first |
| 15.17 Instant project switch | title-bar quick switcher | project/session browser page | reduced-metadata quick switcher |
| 15.18 Built-in browser | bottom-panel browser host or detached preview window | composer attachments, shared-with-agent indicator | explicit inspect UI, detached supported |

### Global attention and status model

- The app has one global `attention center` entrypoint in the title bar.
- It aggregates:
  - approval needed
  - FileSafe blocked
  - MCP auth required
  - background mention
  - dev-loop failed
  - run finished while hidden
- Workspace tabs, project rows, and session rows reuse the same small badge vocabulary:
  - `active`
  - `unread`
  - `background_running`
  - `blocked`
  - `permission_needed`
  - `missing_path`
  - `archived`
  - `shared_with_agent`

### Layout modes

- The app persists one layout mode per window:
  - `agent`
  - `editor`
  - `browser`
  - `compact`
- This is not cosmetic theming; it is a layout preset affecting panel emphasis and remembered dock state.
- Default mode:
  - fresh windows open in `agent`
  - opening a detached browser or large preview may switch suggestion UI to `browser` but does not auto-force the change

## Resolved GUI blocker answers

- Top-level workspace tabs are a horizontal tab strip directly below the title bar. Each tab shows:
  - project label
  - optional short session label
  - status badge
  - dirty dot when unsent draft or unsaved editor state exists
- The canonical visual distinction is:
  - workspace tab = top-level project work container
  - docked panel = shell region inside current workspace tab
  - floating window = separate native window containing a movable surface
- Active background work that is not currently focused appears in three places:
  - global attention center
  - workspace-tab badge
  - project/session browser row badge
- Title-bar quick switcher rows show:
  - project name
  - one compact status chip if needed
  - optional path subtitle only in expanded dropdown rows
  - unread counts and multiple badges are suppressed in narrow mode
- Surface ownership rule:
  - pages and docked/floating primary surfaces may own primary actions
  - tooltips, compact chips, and passive status areas are inspect-only
- Browser shared-with-agent state is shown in:
  - browser toolbar badge
  - workspace-tab badge
  - attention center row while sharing is active
- Project switch with active work behaves as:
  - fast switch targets active workspace tab only
  - if active run/dev-loop/approval/unsaved instructions edit exists, show one consolidated prompt
  - confirmation options:
    - `Stay here`
    - `Switch and keep background work`
    - `Switch after stopping dev loop` when applicable

## Resolved implementation decisions by feature

### 15.1 Dangerous-Command Blocking (FileSafe)

- FileSafe block state machine is final:
  - `active_blocked`
  - `approved_once`
  - `approved_and_allowlisted`
  - `cancelled`
  - `superseded`
  - `run_ended_unresolved`
- FileSafe is stricter than generic tool approval:
  - generic tool approval grants permission to use a tool class
  - FileSafe block is command-instance-specific and may require safe-point restore before retry
- Restart behavior:
  - unresolved block restores as `active_blocked` only if the run can resume at that pause point
  - otherwise it restores as `run_ended_unresolved` with `Retry from safe point` and `Dismiss history item`
- Multiple blocks in one thread:
  - newest unresolved block stays fully expanded
  - older unresolved blocks collapse into a summary list above the composer

### 15.2 Branching Conversations

- Branch deletion rules:
  - only archived branches may be deleted
  - branch with descendants cannot be deleted unless `force_delete_descendants` is confirmed in a destructive dialog
- Branch compare always shows:
  - ancestor checkpoint
  - branch reason
  - messages since fork
  - changed files since fork
  - current run state
- Sort order:
  - active branch first
  - then non-archived by last activity descending
  - then archived by archived date descending
- Retention:
  - archived branches retained indefinitely until manual delete
  - automatic pruning does not occur in MVP
- Branch copy/reference rules:
  - copies full message history through ancestor checkpoint
  - copies unsent draft at branch time
  - does not copy pending approvals/FileSafe blocks
  - does not copy live browser/dev-loop attachments
  - references restore-point/file-state ancestry rather than duplicating large blobs eagerly

### 15.3 In-App Project Instructions Editor

- Imported/referenced file save behavior:
  - directly editable if the file exists under editable project/user paths
  - read-only with `Open source location externally` if provider-managed or generated
- Provider support matrix:
  - `AGENTS.md`: Codex-compatible, provider-neutral project instruction surface
  - `CLAUDE.md`: Claude/Anthropic-specific
  - project rules files: app-specific and provider-neutral unless explicitly marked otherwise
  - imported files: apply only through the parent file type that references them
- Effective-instructions preview is mandatory and shows ordered contributing sources:
  - global
  - project
  - path-scoped
  - manual attachment
- Diagnostics pane is mandatory and grouped by:
  - blocking
  - warning
  - info

### 15.4 @ Mention System for File References

- Mention grammar is final:
  - `@path/to/file`
  - `@path/to/file#L10-L40`
  - `@folder:path/to/folder`
  - `@symbol:Name`
- Escape rule:
  - literal `@` is typed as `@@`
- Symbol range syntax:
  - symbol references may include path scoping as `@symbol:path/to/file::Name`
- Context preview before send is mandatory and shows:
  - resolved type
  - effective payload mode
  - downgrade warning if any
  - token-cost warning for large expansions
- Folder full-content opt-in copy:
  - `Include full folder contents (high token cost)`
- Send-time fallback:
  - unresolved mention blocks send until removed or replaced

### 15.5 Stream Timers and Segment Durations

- Canonical transition rules:
  - run start -> `thinking` when provider emits reasoning/start processing
  - `thinking` -> `tool_execution` on tool dispatch
  - `tool_execution` -> `waiting_for_approval` on approval pause
  - any active segment -> `compaction` on context compaction
  - last compute segment -> `model_output` when user-visible tokens begin
  - any failure gap -> `idle_after_error`
- Retries/resumes:
  - retry creates a new segment chain under same run group but new attempt number
  - resumed runs preserve prior completed segments and append new ones

### 15.6 Interleaved Thinking Toggle

- Hidden-thinking placeholder copy:
  - `Reasoning hidden. Expand to view provider reasoning for this step.`
- Summary-only provider handling:
  - use label `Provider summary` instead of `Reasoning`
- Export/share behavior:
  - hidden thinking excluded by default from export/share
  - export dialog includes explicit toggle `Include hidden reasoning`

### 15.7 MCP Support

- Server rename migration:
  - persist `server_alias_history`
  - permissions continue matching old ids until user confirms migration
- Requested-vs-effective example rows must show:
  - requested enabled
  - effective disabled by policy
  - requested enabled
  - effective auth required
  - requested enabled for app
  - effective disabled for current persona
- Local auth flow:
  - env/path validation
  - spawn
  - handshake
  - tool discovery
- Remote auth flow:
  - endpoint validation
  - auth-required detection
  - browser/system-auth launch
  - token storage in OS credential store
  - handshake
  - tool discovery
- Explicit test outcomes are final:
  - `ok`
  - `startup_failed`
  - `connection_failed`
  - `timeout`
  - `auth_required`
  - `capability_mismatch`
  - `healthy_no_tools`

### 15.8 Project and Session Browser

- Project row schema:
  - `project_id`
  - display name
  - current path
  - last activity
  - badge set
  - last active session label
  - path health
- Session row schema:
  - `session_id`
  - kind
  - title
  - last activity
  - unread/background state
  - archived state
  - current branch label if any
- Filters:
  - sessions filter by kind, archived, active/background, unread
  - projects filter by healthy/missing-path/active
- Missing-path repair flow:
  - `Locate project`
  - `Rebind to existing path`
  - `Remove from recents`

### 15.9 Mid-Stream Token and Context Updates

- Unsupported-provider UX:
  - show final-only badge `Live usage unavailable for this provider`
- Unknown-context-limit UX:
  - show raw tokens and `limit unknown`
- Compaction during active stream:
  - compact-now button is disabled while compaction is already running
  - if provider/run does not support live compaction, tooltip explains `Available after current response`

### 15.10 Multi-Tab and Multi-Window

- Closing a window preserves its workspace-tab set by default for restore on next launch.
- Top-level tabs may be pinned.
- Pinned tabs stay left-aligned and are excluded from LRU auto-focus logic.
- Same-project concurrent edit policy:
  - multiple tabs may target the same project
  - same-file concurrent writes across active sessions are blocked at apply-time
  - user may keep both sessions open for read/compare, but only one session may hold the write lock for a file at a time
- Detached windows restore their last owned workspace tabs unless the close was explicitly `Close without restore`

### 15.11 Virtualized Conversation or Log List

- Shared virtual-list contract is final:
  - variable row measurement enabled
  - overscan default `8`
  - prepend-safe anchor preservation required
  - bottom-follow only when within 2 viewport-heights of tail
  - `Jump to latest` chip appears when bottom-follow disengages
- Accessibility behavior:
  - focus target survives virtualization rematerialization
  - keyboard navigation operates on logical row order, not rendered node order

### 15.12 Know Where Your Tokens Go

- App Usage defaults:
  - last 7 days
  - top projects by tokens
  - top models by cost
- If cost absent broadly, switch secondary ranking to tokens.
- Thread Usage links to app Usage with project/thread filters pre-applied.
- App-wide Usage always includes a `From this thread` deep-link when entered from thread context.

### 15.13 One-Click Install

- Source precedence is final:
  - direct local file install
  - trusted team/private catalog
  - first-party catalog
  - public external catalog
- If same asset id exists in multiple sources at same precedence level, user must choose explicitly.
- UX state semantics:
  - `disabled` = user-disabled but installed
  - `blocked_by_policy` = installed or known asset cannot be enabled
  - `uninstalled` = artifact removed from install target
- Failed update behavior:
  - previous version remains active
  - failed candidate is quarantined in staging
  - `Repair` retries validation/commit from source

### 15.14 Full IDE-Style Terminal and Panes

- Pane ownership:
  - interactive PTYs live under Terminal
  - non-interactive process logs live under Output
  - parsed diagnostics live under Problems
  - parsed listening endpoints live under Ports
  - debug transport/logs live under Debug
- Terminal persistence on restart:
  - PTYs do not auto-resume
  - tabs restore as `disconnected` shells with relaunch affordance
- Split-pane semantics:
  - splits only within Terminal tab
  - max 4 visible terminal panes per workspace tab
  - each pane owns one PTY

### 15.15 Hot Reload, Live Reload, and Fast Iteration

- DevLoopProfile starter profiles are final for MVP:
  - `vite`
  - `nextjs`
  - `expo`
  - `flutter`
  - `cargo-watch`
- Ready-state detection:
  - Vite: stdout contains local URL
  - Next.js: stdout contains `ready`/local URL
  - Expo: stdout contains Metro/Expo ready markers
  - Flutter: tool reports device/app ready and hot-reload commands available
  - cargo-watch: readiness delegated to wrapped command matcher
- Port extraction:
  - parse explicit URLs first
  - then explicit `localhost:<port>` patterns
  - otherwise use configured expected ports
- Fallback semantics:
  - if hot reload fails but hot restart supported -> offer `Hot restart`
  - if neither hot reload nor hot restart succeeds -> offer `Full restart`

### 15.16 Sound Effects Settings

- Final event taxonomy:
  - run success
  - run failure
  - approval needed
  - FileSafe blocked
  - background mention
  - rate limit hit
  - critical error
  - browser capture completed
  - dev loop failed
  - long-running task completed
- Per-event routing rules:
  - sound on/off
  - system notification on/off
  - accessibility announcement on/off
  - background-only toggle
- Imported sound lifecycle:
  - add -> validate format/length -> store asset -> assign id
  - rename updates display label only
  - remove unassigns from events and offers fallback/default selection
  - orphan cleanup removes unreferenced imported assets on explicit cleanup command only

### 15.17 Instant Project Switch

- Recent/open project cap:
  - open projects unbounded within practical UI limits
  - recent-projects history capped at `50`
  - eviction is LRU on project close/history age
- Fast-switch command design is final:
  - default switch = active workspace tab only
  - alternate command = open target in new workspace tab
  - alternate command = open target in new window
  - no global "switch all tabs" in MVP
- Moved-project rebind flow:
  - locate new root path
  - verify project identity markers
  - confirm rebind
  - preserve same `project_id`

### 15.18 Built-in Browser and Click-to-Context

- Shared-page-with-agent flow is final:
  - user invokes `Share with agent`
  - preview surface shows persistent `Shared with agent` badge
  - workspace tab gets `shared_with_agent` badge
  - revoke available from browser toolbar and attention center
  - revoke clears active shared bridge immediately but does not destroy normal preview state
- Attachment presets are final:
  - `metadata_only`
  - `metadata_css`
  - `metadata_screenshot`
- Cookies/storage policy:
  - preview surfaces use project-scoped preview profile
  - automation uses isolated ephemeral session by default
  - shared-with-agent temporarily bridges current preview page/session to automation for that page only
- `window.open` policy:
  - preview -> detached app browser window
  - automation -> denied unless automation flow explicitly handles popup
  - auth -> system browser or platform auth session

## Finalized cross-feature contracts that were previously only recommendations

### Restore coverage matrix

- `agent` edits: covered by checkpoints/restore
- `tool` file edits: covered if the tool reports file mutations through normal run pipeline
- `terminal` edits: not automatically reversible unless captured as managed edit artifacts
- `manual` editor edits: covered only when saved into managed checkpoint range after checkpoint creation
- `browser automation` edits: covered only for resulting project file changes or managed app state artifacts, not arbitrary remote-site state

### Project switch restore policy

- Switching project restores:
  - last active session in target project
  - last workspace-tab side/bottom-panel state for that tab
  - last preview tabs for that project
- Switching project does not migrate:
  - active dev loop ownership
  - active preview/browser tabs from old project
  - active approvals/FileSafe cards from old project
- Background indicators from old project remain visible via badges/attention center

### Browser surface classes

| Surface class | Role | Host default | Session policy | Notes |
| --- | --- | --- | --- | --- |
| `preview` | user browsing and inspect/capture | embedded when supported, detached fallback | project-scoped preview profile | primary browser experience |
| `detached-preview` | preview in its own native window | top-level window | same preview profile as owning project/tab | first-class, not degraded |
| `automation` | agent-controlled browsing/tools | hidden or detached runtime surface | isolated ephemeral profile by default | no shared cookies unless user bridges |
| `auth` | OAuth/login/system-browser handoff | system browser or platform auth session | provider-specific secure flow | not ordinary preview |

### Browser per-surface policy fields

- every browser-capable surface should be spec’d with:
  - `surface_id`
  - `role`
  - `host_mode`
  - `platform_matrix`
  - `new_window_policy`
  - `session_isolation`
  - `inspectable`
  - `reparentable`
  - `wayland_fallback`
  - `overlay_limits`

### Watcher and dev-loop trust policy

- dev loops and watchers require project trust state `trusted`
- untrusted projects may inspect suggested commands but cannot auto-start them
- repeated watcher failure policy:
  - auto-disable after 3 consecutive startup/runtime failures within 10 minutes
  - show `Watcher disabled after repeated failure`
  - manual restart required

### Catalog policy precedence

- policy selector precedence is final:
  - exact asset id + version + platform
  - exact asset id
  - publisher/source rule
  - catalog-wide rule
  - default policy
- on conflict, more specific selector wins
- blocked installed assets remain installed but disabled and visibly marked `blocked_by_policy`

## Final ready-for-reconciliation note

- The ledger no longer relies on a future pass to resolve Section 15 unknowns.
- Remaining work is reconciliation into owner docs, not invention of missing behavior.
- If a later reconciliation draft conflicts with this section, this section is the current decision source until superseded deliberately.

## Eighth-pass closure sweep: residual ambiguity removal and wiring matrix

Date: 2026-03-11

This pass exists to eliminate the remaining soft language and to ensure that every Section 15 feature is wired to the GUI shell, runtime/state model, and owner-doc set. The main residual issue after the seventh pass was not feature absence; it was historical text earlier in the ledger still reading like open brainstorming.

### Normative precedence inside this ledger

- Sections before `## Seventh-pass closure: implementation-ready decisions for all remaining open items` are historical audit/research material unless a later section explicitly reuses them.
- For implementation, the normative order is:
  - seventh-pass closure decisions
  - finalized cross-feature contracts
  - this eighth-pass ambiguity-removal section
- Earlier text that says:
  - `still needs`
  - `recommended`
  - `later`
  - `future`
  - `minimum contract to add`
  - `unanswered questions`
  is non-authoritative when a later section answers it.

### Residual scope trims and explicit MVP exclusions

- Local-only instruction files are out of MVP. MVP supports:
  - project-scoped instruction files
  - user/global instruction files
  - imported files reachable from those sources
- Past-thread/session mentions are out of MVP. Mention grammar in MVP supports:
  - file
  - folder
  - symbol
- Cross-session reference/attach behavior is out of MVP.
- Global `switch all tabs/windows` is out of MVP.
- Detached terminal windows are out of MVP. Terminal remains docked within the bottom panel for MVP.
- Detached compare/review window for branches is out of MVP. Branch compare is a dedicated page/surface inside the main shell.
- Saving automation-browser sessions for later reuse is out of MVP. Automation sessions are always ephemeral in MVP.
- Always-on-top floating windows are out of MVP.
- Rich browser toolbar overlay chrome on top of embedded native webview content is out of MVP because of airspace/platform constraints.

### Residual explicit decisions that were still implicit

- Branch creation auto-selects the new branch immediately after creation.
- Original branch remains readable after branch creation and remains writable unless it has active background mutation; destructive restore actions are blocked while mutation is active.
- Branch compare includes:
  - file diff summary
  - message-span summary
  - branch reason
  - ancestor checkpoint
- MCP secret handling is final:
  - secrets/tokens never stored inline in project docs or plain config files
  - command/path/url and non-secret env names may be stored
  - secret values must use OS credential storage or equivalent secure store
  - effective-env UI always shows redacted summaries, never raw secret values
- Catalog missing runtime/tool dependency behavior is final:
  - install/update fails validation before commit
  - UI shows missing dependency reason and `Repair` / `Open docs` affordance
- Output / Problems / Ports relationship is final:
  - Output shows raw non-interactive logs
  - Problems shows parsed diagnostics only
  - Ports shows parsed listening endpoints only
  - no pane re-parses another pane's display model
- `optional global terminal tab type` is resolved as in-scope for MVP:
  - one app-global terminal group is supported in addition to project-scoped terminals
  - global terminals are clearly labeled `Global`
- Quick-switch row metadata rule is final:
  - project name always
  - one status chip max
  - path subtitle only when row height allows
  - no multi-badge clusters in the title-bar dropdown

### GUI completeness check by feature

Each feature below is now considered GUI-accounted-for only if the listed shell concerns are implemented exactly as noted.

| Feature | GUI completeness conditions |
| --- | --- |
| 15.1 FileSafe blocking | inline blocked card, background badge path, stacked blocked-summary rule, consolidated restart behavior |
| 15.2 Branching conversations | branch identity in header, dedicated compare surface, restore-vs-branch split, archive/delete visibility |
| 15.3 Instructions editor | instructions mode header, diagnostics pane, effective preview, provenance-aware file navigation |
| 15.4 `@` mention | typed picker, resolved-context preview, downgrade/cost disclosure, keyboard-first overlay |
| 15.5 Stream timers | fixed placement, current-segment summary, expandable detail, interrupted-state rendering |
| 15.6 Thinking toggle | thread-level location, per-entry placeholder, provider-summary labeling, export disclosure |
| 15.7 MCP | settings IA split, runtime effective-state explanation, auth/debug entrypoints, action-needed routing |
| 15.8 Project/session browser | dedicated page, row schema, kind filters, missing-path repair, background/unread badges |
| 15.9 Mid-stream usage | context-circle coordination, compact-now separation, unsupported-provider state, Usage drill-in |
| 15.10 Multi-tab/window | tab identity chip, pinned tabs, restore policy, same-file write-lock UI, container distinction |
| 15.11 Virtualized lists | shared contract, anchor preservation, keyboard accessibility, jump/load affordances |
| 15.12 Token analytics | first-screen ranking, thread-to-app linkage, chart density rules, compact cards-first view |
| 15.13 Catalog install | discover/install/update/disable/block/repair states, transaction progress, trust visibility, rollback UI |
| 15.14 Terminal/panes | bottom-panel IA, terminal type badges, split-pane rules, disconnected-on-restart behavior |
| 15.15 Dev loop | single entrypoint, always-visible summarized state, stack-specific reload labels, failure surfaces |
| 15.16 Sound settings | notification/accessibility grouping, event-routing controls, preview/test, degraded-device behavior |
| 15.17 Project switch | active-tab-only default, consolidated pre-switch prompt, reduced-metadata quick switcher, browser/page fallback |
| 15.18 Browser | preview/inspect/share/automation separation, detached-window parity, platform-aware hosting, preset capture UI |

### Owner-doc wiring matrix

This matrix is the closure answer to "what still feels unwired?" It identifies which planning docs must eventually absorb each feature's final contract, even though this ledger is currently the decision source.

| Feature | Primary owner-doc target | Required supporting docs |
| --- | --- | --- |
| 15.1 FileSafe blocking | `Plans/FileSafe.md` | `Plans/FinalGUISpec.md`, `Plans/assistant-chat-design.md`, `Plans/storage-plan.md` |
| 15.2 Branching conversations | promoted Section 15 owner spec / session-history owner | `Plans/assistant-chat-design.md`, `Plans/storage-plan.md`, `Plans/FinalGUISpec.md` |
| 15.3 Instructions editor | promoted Section 15 owner spec / editor owner | `Plans/FileManager.md`, `Plans/agent-rules-context.md`, `Plans/FinalGUISpec.md` |
| 15.4 `@` mention | `Plans/FileManager.md` + promoted Section 15 owner spec | `Plans/assistant-chat-design.md`, `Plans/storage-plan.md` |
| 15.5 Stream timers | promoted Section 15 owner spec | `Plans/assistant-chat-design.md`, `Plans/usage-feature.md`, `Plans/storage-plan.md` |
| 15.6 Thinking toggle | `Plans/assistant-chat-design.md` | `Plans/FinalGUISpec.md`, promoted Section 15 owner spec |
| 15.7 MCP | promoted Section 15 owner spec | `Plans/newtools.md`, `Plans/Tools.md`, `Plans/Plugins_System.md`, `Plans/storage-plan.md` |
| 15.8 Project/session browser | promoted Section 15 owner spec | `Plans/FinalGUISpec.md`, `Plans/storage-plan.md`, `Plans/assistant-chat-design.md` |
| 15.9 Mid-stream usage | `Plans/usage-feature.md` + chat owner | `Plans/assistant-chat-design.md`, `Plans/storage-plan.md`, promoted Section 15 owner spec |
| 15.10 Multi-tab/window | promoted Section 15 owner spec / shell owner | `Plans/FinalGUISpec.md`, `Plans/FileManager.md`, `Plans/storage-plan.md` |
| 15.11 Virtualized lists | `Plans/FinalGUISpec.md` shared list contract | `Plans/FileManager.md`, `Plans/assistant-chat-design.md`, promoted Section 15 owner spec |
| 15.12 Token analytics | `Plans/usage-feature.md` | `Plans/Widget_System.md`, `Plans/FinalGUISpec.md`, promoted Section 15 owner spec |
| 15.13 Catalog install | promoted Section 15 owner spec | `Plans/Commands_System.md`, `Plans/Skills_System.md`, `Plans/Plugins_System.md`, `Plans/newtools.md` |
| 15.14 Terminal/panes | promoted Section 15 owner spec | `Plans/FinalGUISpec.md`, `Plans/FileManager.md`, `Plans/storage-plan.md` |
| 15.15 Dev loop | promoted Section 15 owner spec | `Plans/FileManager.md`, `Plans/FinalGUISpec.md`, `Plans/storage-plan.md` |
| 15.16 Sound settings | promoted Section 15 owner spec | `Plans/FinalGUISpec.md`, notification/action-needed owner docs |
| 15.17 Project switch | promoted Section 15 owner spec / shell owner | `Plans/FinalGUISpec.md`, `Plans/storage-plan.md`, project/session browser owner |
| 15.18 Browser | promoted Section 15 owner spec | `Plans/FileManager.md`, `Plans/FinalGUISpec.md`, `Plans/storage-plan.md` |

### Cross-feature wiring checks now considered closed

- Every feature that affects background work is wired to:
  - attention center
  - workspace-tab badge path
  - project/session browser badge path where relevant
- Every feature that introduces a long-running or failure-prone runtime state is wired to:
  - a visible summarized status
  - a detailed view
  - an interruption/restart/failure path
- Every feature that can appear in compact layouts has an explicit compact fallback.
- Every feature that creates or restores project/session state is wired to the canonical:
  - `window`
  - `workspace_tab`
  - `project`
  - `session`
  - `surface`
  model
- Every browser-related feature is wired to the browser-surface class split:
  - `preview`
  - `detached-preview`
  - `automation`
  - `auth`
- Every settings-heavy feature is wired to a specific page/section rather than "some future settings UI."

### Residual risk statement after this sweep

- No remaining Section 15 item appears underspecified at the ledger level in a way that should block implementation planning.
- The remaining risk is reconciliation drift when these decisions are copied into owner docs, not missing product/technical meaning inside the ledger itself.

## Ninth-pass verification sweep: current plan-doc drift still visible outside the ledger

Date: 2026-03-11

Purpose of this pass:

- answer the practical question "are these features fully thought through?"
- distinguish **ledger-level completeness** from **current plan-doc-set readiness**
- record the remaining places where the current plans still read as unwired, contradictory, or GUI-incomplete even though the ledger decisions themselves are mostly closed

### Top-level verdict

- **At the ledger level:** the feature meanings are now mostly thought through.
- **At the current plan-doc-set level:** no, not all of them are fully reconciled yet.
- The biggest remaining problem is no longer missing product thinking in the ledger; it is that several adjacent plan docs still describe older GUI/state/command behavior.
- So the implementation risk is now:
  - stale canonical text outside the ledger
  - missing command IDs / wiring coverage
  - missing persistent shell identities
  - old GUI placements that conflict with the resolved shell model

### Findings from cross-checking the live planning docs

#### Finding A: project-switch shell model still drifts in the current GUI docs

Observed in current planning docs:

- `FinalGUISpec.md` still defines a **title-bar project bar** as the primary project switcher.
- the same doc still describes the project switcher as a dropdown in the title bar instead of the leaner quick-switch / shell model resolved later in this ledger
- the same wording propagates into index/reference sections that still call it `project bar`

Why this matters:

- it keeps 15.17 Instant Project Switch, 15.8 Project and Session Browser, and 15.10 Multi-Tab and Multi-Window tied to an older shell assumption
- it obscures where the GUI work actually lands:
  - quick switch entrypoint
  - project/session browser page
  - active-tab-only switch semantics
  - compact metadata rules

Ledger conclusion:

- **GUI accounted for in the ledger**
- **still drifting in current owner docs**

Affected features:

- 15.8
- 15.10
- 15.17

#### Finding B: chat/session navigation still drifts between sidebar and floating-overlay models

Observed in current planning docs:

- `FinalGUISpec.md` still describes a floating thread-list overlay
- `assistant-chat-design.md` still contains the detailed Usage pop-out model in section 25
- `UI_Command_Catalog.md` still defines:
  - `cmd.chat.open_usage_popout`
  - `cmd.chat.close_usage_popout`

Why this matters:

- the ledger resolved thread/session navigation around:
  - persistent thread/session navigation patterns
  - thread Usage as a canonical detail surface
  - no dependence on a separate usage pop-out as the primary model
- the current command catalog and chat docs still suggest a different GUI contract, so 15.8, 15.9, and 15.10 remain partially unwired outside the ledger

Ledger conclusion:

- **feature behavior thought through**
- **current chat/UI command docs still describe the older route**

Affected features:

- 15.8
- 15.9
- 15.10
- 15.12

#### Finding C: browser/dev-loop/terminal shell contracts are still only partially reconciled outside the ledger

Observed in current planning docs:

- `FinalGUISpec.md` still uses the older:
  - embedded-browser-first wording
  - generic `Watch mode` framing in Ports
  - terminal tab/split language that predates the tighter shell/restore decisions in this ledger
- the current browser section still reads like one broad bottom-panel browser feature rather than a split between preview / detached preview / automation / auth surfaces

Why this matters:

- 15.14, 15.15, and 15.18 depend on:
  - explicit surface separation
  - platform fallback behavior
  - summarized vs detailed dev-loop state
  - project-scoped restore and interruption policy
- without that reconciliation, the GUI work still invites multiple incompatible implementations

Ledger conclusion:

- **the ledger has accounted for the GUI/state distinctions**
- **the current GUI docs still read like an older merged model**

Affected features:

- 15.14
- 15.15
- 15.18

#### Finding D: command catalog and wiring matrix are still missing the promoted shell/runtime command families

Observed in current planning docs:

- `UI_Command_Catalog.md` still lacks canonical command families for:
  - explicit project switching
  - workspace tab lifecycle
  - tab/window shell operations
  - thread Usage-tab activation
  - dev-session lifecycle
  - one-click catalog lifecycle
- `Wiring_Matrix.md` is still example/template-heavy and does not yet reflect those Section 15 command families

Why this matters:

- this is the clearest remaining "still unwired" problem
- even where the ledger now defines the behavior, the command layer does not yet prove that the GUI can dispatch it consistently

Most affected features:

- 15.7 MCP support
- 15.8 Project/session browser
- 15.9 Mid-stream usage
- 15.10 Multi-tab/window
- 15.13 One-click install
- 15.14 Terminal/panes
- 15.15 Dev loop
- 15.17 Instant project switch
- 15.18 Browser/click-to-context

Ledger conclusion:

- **major residual packetization blocker**
- this is not a thinking gap in the feature behavior anymore; it is a command/wiring reconciliation gap

#### Finding E: storage-plan still lacks some of the shell identities implied by the ledger decisions

Observed in current planning docs:

- `storage-plan.md` already carries `project_id`, browser preview keys, and some project shell state
- but the current text still does **not** cleanly establish all of the later shell identities the ledger now assumes, especially:
  - `workspace_tab`
  - top-level window identity for detached surfaces
  - browser-tab identity distinct from preview session
  - terminal-session identity
  - dev-session identity

Why this matters:

- 15.10, 15.14, 15.15, 15.17, and 15.18 all imply restart/restore behavior that becomes ambiguous without those identities
- the GUI can look complete while persistence stays under-modeled

Ledger conclusion:

- **state thinking is present in the ledger**
- **persistent owner-doc modeling still trails behind it**

Affected features:

- 15.10
- 15.14
- 15.15
- 15.17
- 15.18

#### Finding F: per-project requested-vs-effective state is still not fully normalized in live docs

Observed in current planning docs:

- `Tools.md` still says app-level-only tool-permission scope can be enough for MVP
- `Permissions_System.md` has strong permission logic, but the cross-doc requested-vs-effective explanation is still not fully normalized with:
  - MCP
  - Personas
  - browser capability tiers
  - project switching

Why this matters:

- 15.7 MCP Support and 15.17 Instant Project Switch both depend on per-project effective state making sense in the UI
- without that, switching projects or applying per-project settings can still look underspecified in the current plan set

Ledger conclusion:

- **the ledger resolves the conceptual model**
- **the current docs still leave a reconciliation burden**

Affected features:

- 15.7
- 15.13
- 15.17
- 15.18

### Per-feature status after this verification pass

| Feature | Ledger thought-through? | Current plan-doc drift still visible? | Main remaining problem type |
| --- | --- | --- | --- |
| 15.1 Dangerous-Command Blocking (FileSafe) | yes | low | mostly owner-doc reconciliation |
| 15.2 Branching Conversations | yes | medium | restore/history owner-doc reconciliation |
| 15.3 In-App Project Instructions Editor | yes | low-medium | owner-doc placement and diagnostics wording |
| 15.4 `@` Mention System | yes | low-medium | picker/attachment owner-doc wording |
| 15.5 Stream Timers and Segment Durations | yes | low | owner-doc insertion not yet done |
| 15.6 Interleaved Thinking Toggle | yes | low | owner-doc insertion not yet done |
| 15.7 MCP Support | yes | high | requested/effective state + command/wiring reconciliation |
| 15.8 Project and Session Browser | yes | high | shell model + session navigation drift |
| 15.9 Mid-Stream Token and Context Updates | yes | high | usage-tab vs pop-out drift + command wiring |
| 15.10 Multi-Tab and Multi-Window | yes | high | shell identities + restore/wiring drift |
| 15.11 Virtualized Conversation or Log List | yes | low | mostly shared-list-contract reconciliation |
| 15.12 "Know Where Your Tokens Go" | yes | medium | Usage-page owner-doc reconciliation |
| 15.13 One-Click Install | yes | high | catalog lifecycle commands/wiring not yet reflected |
| 15.14 Full IDE-Style Terminal and Panes | yes | high | shell/state/wiring reconciliation still needed |
| 15.15 Hot Reload, Live Reload, and Fast Iteration | yes | high | dev-session model still not fully reflected outside ledger |
| 15.16 Sound Effects Settings | yes | low-medium | final settings grouping/recovery wording |
| 15.17 Instant Project Switch | yes | high | project-switch shell model still drifts in current GUI docs |
| 15.18 Built-in Browser and Click-to-Context | yes | high | browser surface split + platform fallback still not reconciled outside ledger |

### What this pass changes about the working conclusion

- Earlier eighth-pass language said the remaining risk was mostly reconciliation drift.
- That remains true, but this verification pass sharpens it:
  - the **largest remaining unwired areas are real and concrete**
  - they are concentrated in:
    - shell/project-switch docs
    - chat usage/view-state docs
    - command catalog / wiring matrix
    - storage identities
    - requested/effective-state reconciliation

### Updated implementation-readiness statement

- **Feature semantics in the ledger:** mostly implementation-ready.
- **Current planning-doc set as a whole:** **not yet fully implementation-ready** for the full Section 15 set until the above drift clusters are reconciled into the owner docs.
- The Section 15 items are therefore best described as:
  - **thought through in the ledger**
  - **not yet fully reconciled in the planning set**

### Immediate reconciliation priorities now implied by this pass

1. Replace the old chat usage pop-out / floating-thread-overlay assumptions with the resolved session-navigation model.
2. Replace the old title-bar project-bar assumption with the resolved project-switch shell model.
3. Add the missing command families and wiring coverage for:
   - project switch
   - workspace tab/window shell
   - thread Usage activation
   - dev session lifecycle
   - catalog install/update/remove
4. Add the missing shell identities to storage and restore modeling.
5. Normalize requested-vs-effective state across MCP, tools, permissions, Personas, and browser/runtime surfaces.

### Final answer for this pass

- The listed features have now been thought through substantially enough in the ledger that the remaining problems are mostly reconciliation and wiring problems, not "we still do not know what the feature should do" problems.
- However, there **are** still real gaps if the question is about the **current planning-doc set outside this ledger**:
  - some GUI changes are accounted for only in the ledger and not yet in the owner docs
  - some command/wiring work is still missing from the live command catalog and wiring matrix
  - some persistence identities are still missing from the live storage plan

## Tenth-pass strict reconciliation checklist: replace vs additive vs retire-stale

Date: 2026-03-11

Purpose:

- convert the remaining reconciliation risk into a strict execution checklist
- answer exactly what must be:
  - **replaced**
  - **added additively**
  - **retired as stale canonical text**
- make it explicit what would need to happen for the Section 15 work to be considered actually reconciled across the planning set

### Pass conclusion

If the checklist below is completed faithfully, then the Section 15 feature set should be considered reconciled across the required docs.

The hard rule is:

- this cannot be done by only appending more addenda
- some current text must be **replaced or explicitly demoted from canonical status**
- if the old text is left in place next to the new text, drift will remain

---

### Bucket 1: MUST REPLACE / RETIRE AND REWRITE

These are the places where additive text alone is not enough because the current canon still points implementers at the wrong behavior.

#### 1. `FinalGUISpec.md` shell/project-switch canon

Why replace:

- current text still centers the shell around the old title-bar project bar
- current text still carries older thread/session navigation assumptions
- current browser/dev-loop text still reads like a merged older model

What must be replaced:

- the project-switch shell definition
- any text that presents the title-bar project bar as the canonical primary project-switch surface
- any text that treats the floating thread selector overlay as the chat-session navigation model
- old browser wording that implies one undifferentiated browser host rather than preview / detached-preview / automation / auth surface separation
- old generic watch-mode wording that predates the single dev-session model

Why this is replace-only:

- if the old shell text survives, 15.8, 15.10, 15.14, 15.15, 15.17, and 15.18 will still read as contradictory even after new text is added

#### 2. `assistant-chat-design.md` usage/surface canon

Why replace:

- current section 25 still defines a detailed usage pop-out window as the active canon
- the old command examples still normalize that pop-out

What must be replaced:

- pop-out detailed usage view as the primary thread-usage model
- any remaining wording that implies thread usage is primarily a detached usage pop-out rather than the resolved canonical detail surface
- any remaining text that depends on floating overlay navigation instead of the reconciled session-navigation model

Why this is replace-only:

- 15.8, 15.9, 15.10, and 15.12 cannot be considered reconciled while chat still teaches a different usage/view-state pattern

#### 3. `UI_Command_Catalog.md` stale usage and missing shell commands

Why replace:

- it still canonizes:
  - `cmd.chat.open_usage_popout`
  - `cmd.chat.close_usage_popout`
- it still lacks the promoted shell/runtime command families

What must be replaced:

- stale usage-popout commands

What must be added at the same time:

- canonical commands for:
  - project switching
  - workspace-tab lifecycle
  - detached-window lifecycle where applicable
  - thread Usage activation
  - dev-session lifecycle
  - catalog install / update / remove

Why this is replace-plus-add:

- old command IDs left in normative position will continue to mis-wire the GUI even if newer commands are added later

#### 4. `newfeatures.md` Section 15 canon

Why replace/retire:

- Section 15 still exists as idea/origin text and can easily be misread as normative if not explicitly demoted

What must happen:

- the old Section 15 backlog/idea framing must be explicitly retired as canonical behavior
- the promoted/implementation-ready owner path must become the clear authority

Why this is replace/retire:

- leaving Section 15 as soft ideation while trying to reconcile the rest of the packet guarantees future drift

---

### Bucket 2: MUST BE ADDITIVE, BUT WITH STRONG OWNER-DOC INSERTIONS

These docs mostly need substantive new content inserted rather than large old sections rewritten. The gap is absence or under-modeling, not primarily contradictory canon.

#### 5. `storage-plan.md`

Additive requirements:

- add first-class shell identities and restore records for:
  - workspace tabs
  - detached windows
  - browser tabs distinct from preview sessions
  - terminal sessions
  - dev sessions
- add requested/effective-state fields where runtime/browser/dev-loop state needs them

Why additive:

- the current storage plan is missing identities and restore contracts rather than asserting a strong conflicting opposite model

#### 6. `Permissions_System.md`

Additive requirements:

- explicit cross-doc requested-vs-effective explanation
- make clear how project-scoped effective state interacts with:
  - mode overrides
  - session cache
  - MCP/tool availability
  - project switching
  - non-bypassable guards

Why additive:

- permission logic is already strong; the gap is cross-surface normalization, not core algorithm absence

#### 7. `Tools.md`

Additive requirements:

- normalize tool/MCP/project scope around per-project effective resolution
- retire the implication that app-level-only permission scope is sufficient for the promoted shell/project-switch feature set
- align built-in/MCP/provider/custom tool availability under one requested/effective explanation

Why additive:

- tool semantics already exist; the missing part is the reconciliation layer

#### 8. `Glossary.md`

Additive requirements:

- pin canonical terms for:
  - workspace tab
  - detached window
  - browser surface classes
  - requested vs effective state
  - shared-with-agent
  - attention center

Why additive:

- glossary does not need major replacement; it needs the missing anti-drift terms

#### 9. `WorktreeGitImprovement.md`

Additive requirements:

- explicitly state stable project identity vs worktree path
- bind worktree state to project/session/shell restore rules

Why additive:

- the worktree doc is mostly correct on git behavior; the missing piece is project-identity reconciliation with the shell model

#### 10. `Personas.md`

Additive requirements:

- explicitly state the UI distinction between requested Persona and effective Persona
- require visible selection reason when they differ

Why additive:

- Persona runtime logic already exists; this is a reconciliation insertion

#### 11. `usage-feature.md`

Additive requirements:

- finalize one canonical GUI placement model for:
  - app-wide Usage
  - compact usage visibility
  - thread Usage detail
- tie artifact deep-links and chat thread usage to the same canonical surfaces

Why additive:

- current Usage behavior is close, but still too option-shaped in places

---

### Bucket 3: MUST EXPLICITLY RETIRE STALE CANON EVEN IF NEW TEXT IS ADDED

This is the anti-drift bucket. These are the specific old concepts that must not remain silently authoritative after reconciliation.

#### Retire these concepts explicitly

- **title-bar project bar** as the primary project-switch shell
- **floating thread-selector overlay** as the canonical chat session-navigation model
- **usage pop-out** as the canonical per-thread usage detail surface
- **one broad browser tab** without split surface classes
- **generic watch mode** as the primary dev-loop model
- **MCP as config-and-passthrough only**
- **app-level-only tool-permission scope is enough for MVP**

Why this matters:

- these are the exact phrases/models most likely to survive into later edits and reintroduce ambiguity

---

### Strict reconciliation matrix by doc

| Doc | Reconciliation mode | Why |
| --- | --- | --- |
| `FinalGUISpec.md` | replace + retire stale canon | current shell/view canon still points at older GUI behavior |
| `assistant-chat-design.md` | replace + retire stale canon | old usage pop-out and session-navigation model still survive |
| `UI_Command_Catalog.md` | replace stale rows + additive new families | stale command IDs plus missing shell/runtime actions |
| `newfeatures.md` | retire stale canon | old Section 15 ideation must stop reading as normative |
| `storage-plan.md` | additive | missing shell/runtime identities and restore records |
| `Permissions_System.md` | additive | requested/effective reconciliation still under-specified cross-doc |
| `Tools.md` | additive with one stale implication retired | tool/MCP/project scope still needs normalized effective-state model |
| `Glossary.md` | additive | missing canonical anti-drift terms |
| `WorktreeGitImprovement.md` | additive | stable project identity vs worktree path still needs explicit binding |
| `Personas.md` | additive | requested vs effective Persona display rule still needs explicit UI wording |
| `usage-feature.md` | additive with old option language demoted | Usage placement is close but still too option-shaped |

---

### What “fully reconciled” means after this pass

The Section 15 work should only be called fully reconciled when all of the following are true:

1. No remaining owner doc still teaches the old title-bar project-bar shell as the primary model.
2. No remaining owner doc still teaches usage pop-out as the primary thread-usage model.
3. The command catalog includes the promoted shell/runtime/catalog command families.
4. The wiring matrix is updated from generic template/example posture to actual required coverage for those commands.
5. The storage plan carries the missing shell/runtime identities.
6. Requested-vs-effective state is explicitly aligned across:
   - MCP
   - tools
   - permissions
   - Personas
   - browser/runtime capability
7. `newfeatures.md` Section 15 can no longer be misread as the live authority.

---

### Final strict answer

- Yes, once the ledger decisions are applied correctly to the required docs **and** the stale canon is actually retired, the Section 15 set should reconcile.
- No, the job is **not** just "copy the ledger into a few places."
- The exact remaining non-closed issue is:
  - some current docs still canonize older models, so replacement/retirement is required in addition to additive reconciliation

## Eleventh-pass thoroughness sweep: missed-thinking check after broader cross-doc read

Date: 2026-03-11

Purpose:

- do one more sweep specifically to test the claim that nothing important was left unthought, unwired, or GUI-unaccounted-for
- use broad cross-doc reading to look for any remaining gaps that were **not yet captured clearly enough** in the earlier passes
- separate:
  - true remaining design/spec gaps
  - stale canonical conflicts in live docs
  - already-closed feature semantics that only still need reconciliation

### Bottom-line result of this pass

- This pass did **not** surface major new feature-behavior unknowns inside the Section 15 set itself.
- It **did** surface a few additional places where the live plan set still carries overlapping or conflicting ownership.
- So the answer after this sweep is:
  - the Section 15 features themselves remain thought through at the ledger level
  - the remaining risk is still cross-doc stale canon, command/storage underwiring, and duplicate ownership of shell/runtime behavior

### New or sharpened findings from this pass

#### Finding G: shell ownership is still duplicated across multiple live docs, not just stale in one place

Observed across current planning docs:

- `FinalGUISpec.md` still owns the shell with a title-bar project bar
- `newfeatures.md` still contains sidebar/project-shell language for overlapping project-navigation behavior
- `00-plans-index.md` still points adjacent shell concerns into `FileManager.md`
- `FileManager.md` still carries browser/container semantics that overlap with shell ownership

Why this matters:

- the drift is not just "one stale section"
- multiple docs still appear to co-own the same shell/navigation territory
- that increases the chance that later reconciliation will patch one document while leaving another document quietly authoritative

What this changes:

- the retirement/replacement work needs to be treated as **multi-owner cleanup**, not just point fixes inside one GUI doc

Affected features:

- 15.8
- 15.10
- 15.17
- 15.18

#### Finding H: thread Usage still has an unresolved three-way owner conflict

Observed across current planning docs:

- `assistant-chat-design.md` still defines a Usage pop-out model
- `UI_Command_Catalog.md` still canonizes pop-out commands
- `usage-feature.md` still frames placement as a set of options
- `assistant-chat-design.md` elsewhere still says "Usage tab (or panel)"

Why this matters:

- this is not just old wording left behind in one section
- the same interaction is still owned simultaneously by:
  - chat
  - usage
  - command catalog
- until one canonical surface model wins, 15.9 and 15.12 remain easy to implement differently

What this changes:

- the reconciliation pass must explicitly collapse these three owners into one authoritative surface model and demote the others to dependent references

Affected features:

- 15.9
- 15.10
- 15.12

#### Finding I: browser GUI changes are accounted for in the ledger, but live docs still disagree about the container model

Observed across current planning docs:

- `FileManager.md` still talks about capped browser instances and LRU reuse
- the same doc also tries to normalize browser behavior elsewhere
- `FinalGUISpec.md` still describes browser tabs with pin behavior
- persistence wording still leaves ambiguity about whether browser state is:
  - app-global
  - project-scoped
  - tab-scoped
  - detached-window-scoped

Why this matters:

- this is the clearest answer to "are GUI changes accounted for?"
- **yes, they are accounted for in the ledger**
- **no, the live docs do not yet agree on the browser container and restore model**
- that leaves 15.18 especially vulnerable to incompatible implementation choices on Linux/macOS/Windows shell behavior

What this changes:

- browser reconciliation must explicitly choose:
  - canonical in-shell browser tab/container model
  - detached preview model
  - automation/auth non-shell session model
  - persistence boundaries for each

Affected features:

- 15.8
- 15.10
- 15.17
- 15.18

#### Finding J: dev-loop actions are still named in prose without stable canonical command IDs

Observed across current planning docs:

- `assistant-chat-design.md` still refers to canonical actions such as `StartDevMode` and `RunTestsWatch`
- `UI_Command_Catalog.md` still does not carry an equivalent stable `cmd.*` command family for those promoted actions
- `Wiring_Matrix.md` still reads as example/template-heavy rather than proving those bindings exist

Why this matters:

- this is a real unwired gap, not just stale prose
- 15.14 and 15.15 still rely on important shell/runtime actions that do not yet have a clear canonical command identity in the live doc set

What this changes:

- the command catalog needs not only new families in general
- it also needs to absorb already-referenced named dev-loop actions so prose and runtime command identity stop drifting

Affected features:

- 15.14
- 15.15

#### Finding K: browser/session persistence still has one more unstated boundary problem

Observed across current planning docs:

- project switching is described as restoring per-project state
- but `browser_state:v1` still appears app-global in the current GUI spec
- this conflicts with the later shell assumption that project switching should not accidentally smear browser/session state across projects

Why this matters:

- the earlier storage findings already covered missing identities
- this pass adds a sharper point:
  - even where state keys exist, their **scope boundary** is still not normalized
- without this, project switching and browser restore behavior can both be "implemented correctly" in incompatible ways

What this changes:

- reconciliation must define whether browser history/tab stacks are:
  - per project
  - per workspace tab
  - per detached browser window
  - never restored for certain ephemeral sessions

Affected features:

- 15.8
- 15.10
- 15.17
- 15.18

#### Finding L: stale defer/backlog language still threatens reintroduction of ambiguity even after reconciliation

Observed across current planning docs:

- `newfeatures.md` still contains "additional ideas", defer language, and nice-to-have framing for some promoted Section 15 items
- `newtools.md` and adjacent docs still preserve older MCP framing in places

Why this matters:

- even if the owner docs are updated, stale backlog language left nearby will continue to look like alternative canon
- that is especially dangerous for:
  - MCP support
  - browser behavior
  - project/session shell behavior

What this changes:

- anti-drift cleanup must include **explicit demotion of old backlog/defer framing**, not just inserting newer behavior elsewhere

Affected features:

- 15.7
- 15.8
- 15.17
- 15.18

### What this pass did not find

This pass did **not** find major remaining "we still have not decided the feature behavior" gaps for:

- 15.1 Dangerous-Command Blocking
- 15.2 Branching Conversations
- 15.3 In-App Project Instructions Editor
- 15.4 `@` Mention System
- 15.5 Stream Timers and Segment Durations
- 15.6 Interleaved Thinking Toggle
- 15.11 Virtualized Conversation or Log List
- 15.16 Sound Effects Settings

For those items, the remaining work continues to look like owner-doc reconciliation and integration wording, not missing conceptual closure in the feature itself.

### Revised severity map after this sweep

Highest remaining reconciliation risk:

- 15.7 MCP Support
- 15.8 Project and Session Browser
- 15.9 Mid-Stream Token and Context Updates
- 15.10 Multi-Tab and Multi-Window
- 15.13 One-Click Install
- 15.14 Full IDE-Style Terminal and Panes
- 15.15 Hot Reload, Live Reload, and Fast Iteration
- 15.17 Instant Project Switch
- 15.18 Built-in Browser and Click-to-Context

Reason these remain highest:

- they depend on command identity, persistence boundaries, requested-vs-effective state, or shared shell ownership

Lower remaining reconciliation risk:

- 15.1
- 15.2
- 15.3
- 15.4
- 15.5
- 15.6
- 15.11
- 15.12
- 15.16

Reason these are lower:

- the product behavior is substantially closed
- the remaining work is mostly insertion, clarification, or dependency wiring rather than unresolved design

### Final answer after the thoroughness sweep

- The Section 15 feature set does **not** appear to have major unthought-through behavior holes left in this ledger.
- The remaining misses are:
  - duplicate ownership of shell/runtime/browser behavior
  - unresolved command identity for some promoted actions
  - unresolved persistence scope boundaries
  - stale backlog/defer language that would reintroduce drift
- GUI changes **are** accounted for in the ledger.
- The remaining problem is that several live docs still teach older or overlapping GUI models, especially around:
  - project switch shell ownership
  - thread Usage surface ownership
  - browser container model
  - dev-loop command identity
