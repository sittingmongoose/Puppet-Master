# Working Ledger

## Work Item
- `w-20260323-192127`

## Mode
- `audit`

## Topic / Scope
- Subagents planning-doc audit scope.
- User intent: inspect how subagents are handled and whether the plan set will support them well.
- Audit executed against subagent-related planning docs only under `Plans/**`.
- Scope expanded to include direct research against the current OpenCode repo as a known-good external reference.
- Additional focus areas requested:
- cross-provider subagent management
- CLI-provider handling
- context handling and compaction
- parent-to-subagent and subagent-to-subagent communication
- Persona impact on agents and subagents

## Objective
- Audit the planning set for subagent buildability and spec completeness.
- Surface local underspecification, cross-doc drift, runtime/storage mismatches, and missing user-visible behavior contracts before implementation.
- Compare the current Puppet Master plans against the actual OpenCode implementation, especially where OpenCode may offer a proven cross-provider pattern.

## Constraints / Non-Goals
- Do not treat this ledger as canonical or mention it in planning docs.
- Do not edit planning docs during audit mode.
- Scope remained centered on subagents plus directly constraining runtime, storage, persona, tool, permission, provider, and UI docs.
- External repo research should happen outside the Puppet Master workspace to avoid polluting the project tree.

## Key Facts and Findings
- The known scope is subagents.
- Audit used multiple lenses: local synthesis plus subauditors for UX/flow, state/storage/command, and tools/permissions/integration.
- External reference research is now part of this work item.
- OpenCode is being treated as a comparative implementation source, not as canonical SSOT for Puppet Master.
- OpenCode runtime shape is now confirmed from the current upstream repo checkout at commit `9a006d87004835d1867207def09c9aa4cf7394db`.
- In OpenCode, subagents are runtime-native agent definitions (`mode: "subagent"`) rather than PM-style external Persona files.
- OpenCode delegated work is session-based:
- `task` launches or resumes a child `Session`
- child linkage is persisted with `parentID`
- resume uses `task_id`, which is the child session id
- parent receives child output as a tool result wrapped in `<task_result>`
- OpenCode user-facing invocation paths are parent-mediated:
- `@agent-name` is converted into an instruction to call the `task` tool
- command definitions with `subtask: true` also become `SubtaskPart` entries
- OpenCode TUI treats subagents as child sessions:
- root session aggregates child permissions/questions
- UI lets the user open the child session directly
- no evidence found of a separate shared agent inbox or cross-session message bus
- OpenCode plan mode currently does use subagents:
- experimental plan reminder explicitly instructs the plan agent to launch `explore` agents during discovery
- later planning phases can also launch a `general` agent
- this matters because PM docs currently contain conflicting plan-mode delegation assumptions
- OpenCode compaction is agent-driven:
- context overflow triggers a hidden `compaction` agent
- pruning of old tool output is distinct from summary generation
- the compaction summary is written as continuation context for a future agent, not as free-form chat text
- OpenCode instruction/context assembly is multi-source:
- provider prompt template
- environment block
- instruction files such as `AGENTS.md`, `CLAUDE.md`, `CONTEXT.md`
- optional skill context depending on agent permission
- OpenCode has no clear native peer-to-peer subagent system in the inspected runtime:
- no crew runtime or message-board implementation was found
- parent/child session linkage exists, but subagent-to-subagent communication appears absent or parent-mediated only
- OpenCode agent/persona impact is runtime-native and strong:
- agent definitions carry prompt, permissions, model, variant, steps, and options
- child sessions inherit task-specific permission narrowing plus agent-specific runtime defaults
- Core docs reviewed included:
- `Plans/orchestrator-subagent-integration.md`
- `Plans/interview-subagent-integration.md`
- `Plans/assistant-chat-design.md`
- `Plans/Personas.md`
- `Plans/Tools.md`
- `Plans/Permissions_System.md`
- `Plans/Prompt_Pipeline.md`
- `Plans/storage-plan.md`
- `Plans/Contracts_V0.md`
- `Plans/Models_System.md`
- `Plans/CLI_Bridged_Providers.md`
- `Plans/Provider_OpenCode.md`
- `Plans/WorktreeGitImprovement.md`
- `Plans/assistant-memory-subsystem.md`
- Main raw-finding clusters:
- delegated-run identity and persistence are not canonically wired end to end
- subagent versus Persona terminology and registry boundaries drift across docs
- plan-mode, ask-mode, and delegated execution rules conflict
- provider-native agent files and syntax are alternately canonical, optional, or seed-only
- blocked/retry/recovery payloads and permission-denial taxonomy drift across tools, permissions, providers, and UI docs
- UI visibility promises exceed the documented runtime/state contracts in several places
- interview restore/resume promises exceed the canonical storage schema
- deeper follow-up pass expanded the findings set across chat UX, context/compaction, commands, skills/plugins, and provider mappings
- raw finding density remains highest in:
- `Plans/assistant-chat-design.md`
- `Plans/orchestrator-subagent-integration.md`
- `Plans/interview-subagent-integration.md`
- `Plans/Tools.md`
- `Plans/Provider_OpenCode.md`
- `Plans/CLI_Bridged_Providers.md`
- recurring drift pattern:
- newer addenda generally move toward canonical child-run + Persona-storage contracts
- older sections still preserve provider-native agent, crew-board, or tier-local assumptions that would produce a different implementation

## Gaps / Problems Identified
- Subagent execution model is not singular:
- some sections describe delegated child runs with canonical Personas and shared runtime snapshots
- other sections still describe provider-native `/subagent` syntax, Cursor-only assumptions, or provider-native agent files as runtime inputs
- PM OpenCode mapping currently assumes `thread_id -> OpenCode session id`, but upstream OpenCode already has separate parent/child session lineage and resumable `task_id` semantics; PM risks collapsing canonical PM identity into provider correlation.
- PM crew/message-board planning is materially beyond what OpenCode currently implements; OpenCode is a child-session model, not proof of native peer-to-peer subagent messaging.
- PM plans sometimes treat OpenCode as justification for provider-native agent files or provider-native subagent syntax, but upstream behavior is actually centered on runtime agent definitions plus task-tool child sessions.
- PM Persona plans are more portable than OpenCode's native agent definitions, but the docs must be explicit that OpenCode-style provider-native agents are an adapter concern, not a canonical PM runtime artifact.
- PM plan-mode expectations are split:
- OpenCode known-good behavior allows read-only/delegated planning subagents
- current PM plans alternately forbid all plan-mode delegation or assume planning crews/subagents exist
- Persistence is split-brain in multiple places:
- canonical seglog/redb ownership is repeatedly bypassed by `.puppet-master/memory/*.json`, `active-subagents.json`, `active-agents.json`, or other side files
- Requested/effective runtime fields drift:
- some docs use canonical `requested_persona` / `effective_persona`
- other docs still require `requested_persona_id` / `effective_persona_id`
- Permission-denial and blocked-state payloads drift:
- `recovery_options[]` versus `allowed_action_ids[]`
- `permission_denied` error result versus canonical `headless_ask_denied` blocked outcome
- FileSafe-denied paths alternately emit or do not emit canonical blocked payloads
- Interview config is internally split between older `phase_subagents` shapes and newer Persona-stage config shapes.
- Interview resume/recovery promises are richer than the canonical storage keys currently described.
- Plan-mode / read-only semantics conflict with planning-time subagent usage in assistant chat.
- Active-subagent UI visibility requires richer live data than the tracking state some docs persist.
- Worktree and coordination identity still falls back to `tier_id` or filesystem heuristics in places that should be `run/node/attempt/lane/worktree` keyed.

## Candidate Fixes / Design Directions
- Establish one canonical delegated-run contract:
- canonical Persona IDs
- canonical runtime identity bundle
- narrowed-or-equal permission snapshot inheritance
- canonical event/storage fields for child runs
- Model PM delegated runs more like OpenCode child sessions than like provider-native agent invocations:
- parent-owned delegation
- explicit child-run identity
- resumable child session/run handle
- parent-mediated result handoff
- UI navigation into child history as an optional visibility affordance
- Keep provider-native agent concepts strictly additive:
- OpenCode/Cursor/Claude native agent files can seed/import Persona content
- provider adapters may translate a PM delegated run into provider-native syntax when needed
- PM runtime canon remains child-run/session state plus Persona resolution from PM storage
- Decide explicitly whether PM wants OpenCode-style plan-mode delegation:
- if yes, lock it as read-only child-run delegation with bounded tools and no silent write path
- if no, remove planning-crews/planning-subagents language from assistant/orchestrator/interview docs
- Treat crew/message-board design as a PM-native extension, not as something already validated by OpenCode.
- If crews remain in scope, justify them independently and define how they degrade on providers that only support parent-child delegation.
- Preserve PM identity separately from provider correlation for OpenCode:
- PM `thread_id`, `run_id`, and child-run ids remain canonical
- OpenCode session ids and child session ids live in provider correlation fields only
- Replace provider-native runtime assumptions with seed/import/export-only rules everywhere outside provider adapters.
- Normalize Interview onto the Persona-stage config contract and demote older `phase_subagents` naming to migration aliases only.
- Add one canonical subagent visibility/event contract spanning assistant chat, interview activity panes, orchestrator views, and storage.
- Resolve one canonical blocked/denied payload contract across Tools, Permissions, Contracts, FileSafe, and provider docs.
- Lock a single persistence owner for active-agent tracking, cross-session continuity, approval checkpoints, and interview resume state.
- Clarify plan-mode legality for delegated research/subagents or explicitly forbid it across all surfaces.
- Tighten OpenCode adapter mapping so it preserves canonical PM identities rather than remapping them to provider session ids.

## Impacted Docs
- `Plans/orchestrator-subagent-integration.md`
- `Plans/interview-subagent-integration.md`
- `Plans/assistant-chat-design.md`
- `Plans/Personas.md`
- `Plans/Tools.md`
- `Plans/Permissions_System.md`
- `Plans/Prompt_Pipeline.md`
- `Plans/storage-plan.md`
- `Plans/Contracts_V0.md`
- `Plans/Models_System.md`
- `Plans/CLI_Bridged_Providers.md`
- `Plans/Provider_OpenCode.md`
- `Plans/WorktreeGitImprovement.md`
- `Plans/FileSafe.md`
- `Plans/assistant-memory-subsystem.md`

## Decisions Already Resolved
- Work item mode is `audit`.
- This ledger remains non-canonical execution memory only.
- Audit was broad enough across adjacent subagent-constraining docs to support reconciliation.
- External OpenCode repo research has been completed enough to answer the current comparison questions without further broad codebase scanning.
- OpenCode should be treated as validation for:
- child-session/task-based delegation
- resumable delegated handles
- compaction as a distinct runtime operation
- parent-mediated result handoff
- OpenCode should not be treated as validation for:
- peer-to-peer subagent message boards
- crew semantics
- provider-native agent files as PM runtime canon
- Work item is ready to hand off for reconciliation after the research brief is delivered.

## Open Questions / Uncertainties
- Whether the intended long-term design keeps any non-Assistant continuity system distinct from Assistant memory, or whether current “memory manager” language is residual drift.
- Whether plan-mode should permit any delegated read-only child research at all, given current Run Modes and Permissions language.
- Whether some duplicate/addendum text is transitional and expected to be deleted, or currently intended as active normative content.
- How far PM wants to follow the OpenCode child-session model for direct providers that do not expose comparable session trees.
- Whether PM wants child runs to be user-openable/navigable the way OpenCode child sessions are, or only summarized inline in parent surfaces.
- Whether PM wants child runs to be allowed to raise user questions directly, or whether all user-question boundaries stay parent-owned.
- How much crew/message-board functionality is still desired once the simpler child-session delegation model is treated as the baseline.

## Packetization Notes
- Raw findings volume was high enough to support a large reconciliation packet.
- Most valuable reconciliation targets are cross-doc normalization changes, not isolated local edits.
- Expect the eventual fix set to touch orchestrator/interview/persona/tool/permission/runtime/storage docs together.
- current consolidated audit shape is likely to land around 30+ grouped gaps after dedupe
- high/blocker findings appear close to exhausted; more medium/low issues likely remain only in legacy examples and implementation sketches

## Do-Not-Forget Details
- Keep findings grouped by lens during reconciliation:
- UX/flow/state vocabulary
- state/storage/identity/recovery
- tools/permissions/provider integration
- terminology/precedence/registry drift
- High-risk contradictions to preserve in reconciliation:
- `task`/delegation legality in `plan`
- PM Persona storage versus provider-native agent files
- canonical blocked payload versus legacy denial payloads
- Interview runtime state promises versus actual storage schema
- `thread_id` / provider-session identity drift in OpenCode mapping
- OpenCode-specific facts worth preserving:
- `task_id` is resumable child-session identity
- child sessions are linked by `parentID`
- `@agent-name` is translated into a task-tool call, not a special runtime bus
- compaction is handled by a hidden compaction agent plus separate pruning
- no concrete upstream evidence found for native peer-to-peer subagent messaging
