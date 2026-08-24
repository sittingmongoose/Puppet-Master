# Packet and Assistant-Plan Disposition

Authority order: conversation requirements → newest PMConcept7 Usage → correction packet → original packet → current live Plans.

| Requirement | Authority | Disposition | Notes |
|---|---|---|---|
| PMConcept7-derived visual grammar and eight themes | Conversation override | Implemented | All eight themes and the established selector/context interaction language are present. |
| Eight independently swappable concepts per requested family | Conversation override | Implemented | Seven families × eight options plus eight curated recipes. |
| Genuinely distinct Working Animation takes | Conversation override + video | Implemented | Reference Morph, Orbit, Step Stack, Tool Ribbon, Progressive Receipt, Workbench, Agent Stage, Calm Stage. |
| Inline live work progression and completion receipt | Packet + conversation | Implemented | Autoplay, pause, step, complete, reset, organized history, evidence, and elapsed metrics. |
| Thinking, thought stream, files, web search/fetch, browser, Bash, application control, testing, edits, subagents, validation, artifacts | Packet + conversation | Implemented | Every phase has a deterministic trigger and fixture. |
| Live child agents readable without hover | Conversation override | Implemented | Visible lanes and read-only editor transcripts. |
| Thread history pinned by default, popout/pin, independent width | Packet + conversation | Implemented | Pinned/floating/closed states and resize handle. |
| Pinned, Recent, Archived groups; archived search and restore | Conversation override | Implemented | Archived threads remain exact-message searchable and restorable. |
| Creative thread status treatments | Conversation override | Implemented | Eight status systems linked to history options. |
| Thread pin, rename, fork, archive, restore | Packet | Implemented | More menu; row content never depends on hover. |
| Current/all-thread search and exact-message jump | Packet/Plans | Implemented | Compact search menu includes archived content. |
| Per-thread drafts and draft history | Packet/Plans | Implemented as concept fixture | Draft preservation and deterministic draft-history state. |
| Edit-and-branch, re-answer, restore/rewind semantics | Packet/Plans | Implemented as concept fixture | No ambiguous generic Resend. |
| Long-message expand/collapse without scroll loss | Packet | Implemented | Wide transcript and persistent More Details. |
| Message provenance, timing, tokens, cache, cost, terminal reason | Packet/Plans | Implemented | Message More Details surface. |
| Persona, Model, Mode, Permissions, Worktree selectors | Correction packet | Implemented | Text-only controls; Worktree restored. |
| Configured providers only | Conversation override + provider adjudication | Implemented | Model fixtures include only configured provider accounts. |
| Favorites-first, provider-grouped All, search, account identity | Packet + T3 reference | Implemented | Dynamic-height picker and provider rail. |
| Effort/Fast sidecar and stable submenu direction | Packet + conversation | Implemented | Hover sidecars, compact replacement at phone width, Fast indicator. |
| Ask, Plan, Deep Plan, Agent, Debug via control, slash, natural language | Plans + conversation | Implemented | Composer parser and mode menu. |
| Four-state permissions replacing YOLO | Packet + conversation | Implemented | Ask for approval, Auto accept edits, Auto, Full Access. |
| Wand combines Goal, Crew, BSD, Context Lens, ELI5, Thought Stream | Packet + conversation | Implemented | Independent capability state and active indicators. |
| Goal lifecycle: view/edit/pause/resume/stop/clear/tasks/evidence/replanning/blocker | Correction packet/Plans | Implemented | Activity Detail and durable editor artifact. |
| Context Ring compact menu before More Details | Conversation override | Implemented | Compact Now and More Details. |
| Context window used %, tokens loaded, cached tokens, cache hit, source composition, growth, route, cost, raw/export | Usage concept + conversation | Implemented | Expanded Context More Details drawer. |
| Context Lens Focus/Mute/Subcompact with staged Apply/Cancel and receipts | Packet/Plans | Implemented | Transcript fixtures and capability submenu. |
| BSD evaluate/intervene/silent/suppressed/timeout/unavailable/quota states | Packet/Plans | Implemented as concept fixtures | Intervention evidence and graceful degradation. |
| Crew formation, roles, waiting, blocking, timeout, recovery, completion | Packet/Plans | Implemented as concept fixtures | Crew thread and triggers. |
| Activity Bar Goal/Todo/Subagents/Changes/Artifacts | Conversation override | Implemented | Hover summary and click opening. |
| Activity Detail shows all five categories, collapsible/filterable/pinnable/resizable | Conversation override | Implemented | Eight distinct panel concepts retain all five sections. |
| Plan summary in Activity Detail but no Plan Activity-Bar domain | Conversation override | Implemented | Plan opens in editor. |
| Exact file-change editor navigation | Plans + conversation | Implemented | Path and line fixture. |
| Plan/Deep Plan durable artifact card: View, Revise, Build | Conversation override | Implemented | Card remains after closing decision. |
| Plan auto-opens editor and in-flow Approve/Revise/Cancel | Conversation override | Implemented | Decision host pushes transcript above Activity Bar. |
| Questions/approvals/decisions in flow; never passive expiry | Packet + conversation | Implemented | Queue, required validation, skip, close/return, cancel, submit. |
| Mermaid source/render, editor popout, artifact identity | Plans + conversation | Implemented | Native concept renderer and durable source. |
| Interactive dashboard/chart/data explorer/quiz/map/periodic table/flowchart | Plans + conversation | Implemented | Interactive editor fixtures and inline cards. |
| Generated image compact preview and large editor view | Conversation override | Implemented | Registered artifact. |
| Artifact stale version, render failure, source fallback, retry | Packet/Plans | Implemented | Dedicated fixtures and trigger. |
| Attachment upload progress and unsupported routing | Packet/Plans | Implemented as concept fixtures | Attachment thread and composer action. |
| Offline outbox, reconnect, deduplicated replay | Packet/Plans | Implemented as concept fixture | Offline thread. |
| Tool interruption, permission denial, checkpoint recovery, retry | Packet/Plans | Implemented | Tool-recovery thread and in-flow permission decision. |
| Provider route change, auth/quota/no-model states | Packet/Plans | Implemented as concept fixtures | No chat-local provider installation. |
| New-message indicator and stable scroll anchor away from bottom | Packet/Plans | Implemented as concept fixture | Dedicated thread and trigger. |
| Ordinary long text-only conversation | Conversation override | Implemented | Eight back-and-forth messages without system cards. |
| Whole-concept Reset | Conversation override | Implemented | Resets recipe, variants, theme, threads, panels, answers, artifacts, drafts, and work. |
| Independent editor/history/activity/chat sizing and responsive pressure rules | Packet + conversation | Implemented | Desktop resizers and compact transient behavior. |
| Inter/Poppins concept typography | Conversation override | Implemented | Inter/Poppins stacks with offline system fallbacks. |
| Provider CLI installation policy | Correction packet final adjudication | Implemented by exclusion | No unconfigured providers or chat-local installation flow. |
| Accessibility acceptance/testing | Conversation override | Out of scope | No accessibility gate is used to select or reject concepts. |
| Canonical Plan updates | Agreed sequencing | Deferred intentionally | Stable gaps are recorded after concept selection; canonical Plans are not modified in this concept pass. |

## Additional packet/Plan features that were absent or too shallow in the earlier concepts

- Worktree selection and its relationship to each thread and editor destination.
- Complete Goal lifecycle, material replanning, exact blockers, tasks, and evidence.
- Per-thread draft persistence, draft history, exact-message search, edit-and-branch, and restore/rewind semantics.
- Offline outbox/reconnect behavior, attachment routing, and unsupported attachment states.
- Tool interruption, policy denial, checkpoint recovery, retry, browser-console evidence, and program-control testing.
- Provider account identity, route changes, quota/auth/no-model states, and the explicit prohibition on installing unconfigured providers from chat.
- BSD silent/degraded/duplicate-suppressed states and Context Lens staged Subcompact behavior.
- Crew formation and child-agent wait/block/timeout/recovery behavior.
- Artifact version staleness, native renderer failure, source fallback, retry, export, and state restoration.
- New-message anchoring while the reader is away from the bottom, archived-thread restoration, and fork lineage.
- Thought-stream visibility preference and explicit Worktree selector from the correction packet.

All of these are now represented either as working concept interactions or deterministic concept fixtures. Canonical production wiring remains a later Plan-normalization task.