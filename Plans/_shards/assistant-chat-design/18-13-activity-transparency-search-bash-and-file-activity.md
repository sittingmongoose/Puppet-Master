## 13. Activity transparency: search, bash, and file activity

Activity transparency uses a shared inline operation-card family rather than isolated one-off widgets.

### 13.1 Operation-card family
Operation cards provide a shared anatomy for terminal, web, diff, search, and other lifecycle-bearing runtime activities.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md

Shared state model:
- one card exists per command or operation invocation
- retry creates a new card rather than mutating the prior card in place
- the card-level state machine is `pending`, `running`, `completed`, `failed`, `cancelled`, or `blocked`
- underlying process/session taxonomies may still emit `starting` and `exited`; card consumers normalize those into the card-level state machine
- `blocked` is a card-level state entered from `running` and returned to `running` on unblock
- `disconnected` and `restoring` are agent-session states and surface as card-level `blocked` with `blocked_reason_code`
- simple read/grep/glob results remain inline text, not cards
- badge is always visible
- running output may promote out of inline comfort based on heuristic thresholds

Preview and copy rules:
- preview caps stay aligned at `5` collapsed, `15` expanded, and `50` hard cap where applicable
- search, web, and diff cards keep no-copy behavior for the rendered result block
- fenced code blocks and explicit command fields keep their own always-visible copy affordances
- family-specific secondary actions may appear, but they do not erase the shared card skeleton

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Tools.md

Rules:
- status_badge_state
- card-level blocked is entered from running and returned to running on unblock
- Keep terminal/web/diff card consumers pointed at this shared card-family owner section
### 13.2 Web activity and provenance
#### Answer construction and citation locality

When the assistant answers from web-derived material, it follows search-then-read behavior rather than answering from raw search snippets alone.

ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context

Rules:
- search may shortlist candidate sources, but the assistant reads the chosen result before using it as final-answer evidence
- final citations come from the actual read path rather than raw search snippets alone
- raw search snippets alone are not enough provenance for the final answer
- Site Reader v1 requires real browser-interaction capability, not static HTTP fetch only
- `Reading Site` is reserved for the PM-native Site Reader path
- provider-routed fetch must not reuse the reserved native Site Reader identity
- provider-routed fetch or read still keeps requested/effective adapter disclosure so provenance, routing, and answer quality remain separately inspectable
- if no candidate provider can execute the requested operation, chat surfaces the capability-unavailable branch explicitly instead of implying silent fallback
- cost-aware selection remains visible when routing prefers a lower-cost viable path
- PM MUST NOT silently switch between self-hosted Firecrawl and hosted/cloud Firecrawl
- hosted/provider-native research paths surface explicit credit/billing disclosure, including `>100 credits` research warnings and `500 credits` deep-research warnings where those paths apply
- self-hosted Firecrawl remains visibly disclosed as non-hosted billing
- `changeTracking` must not silently disappear from surfaced web results; if PM retires it from MVP, the owner docs must say so explicitly

In-thread web transparency is lightweight and complements, but does not replace, the dedicated audit/log surface.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

Activity labeling rules:
- `Searching Web` is the generic search family label
- `Reading Site` is reserved for the PM-native Site Reader path
- provider-routed or provider-fallback activity includes requested/effective adapter disclosure plus `provider_fallback_summary` when fallback occurred

Thread-visible fields:
- `tool_use_id`
- `adapter_id`
- `web_operation`
- `requested_adapter_id`
- `effective_adapter_id`
- `adapter_selection_reason`
- `warnings_count`
- `duration_ms`
- `error_code?`
- `error_message?`
- `warnings?`
- `timestamp`
- `cached`
- `provenance_badge?`
- `projection_freshness`
- `projection_health`
- `sources_ref`, `content_ref`, `map_ref`, `answer_summary_ref`

Blocked and denied web attempts still bind to the shared event families and display `blocked_reason_code`, `allowed_action_ids[]`, `denial_reason_code`, `denial_source`, and `suggested_recovery_action` where present. Headless/HITL-unavailable uses `status: "unavailable"` rather than GUI-only recovery text.
- exact blocked_reason_code values: `permission_denied`, `network_error`, `provider_unavailable`, `headless_unavailable`, `timeout`

Additional canonical rules:
- chat may shortlist with search but must read chosen pages before citing them as final evidence
- blocked and denied web episodes bind to the shared event family instead of a chat-local recovery shape
- changeTracking must not silently disappear from surfaced web results
- headless/HITL-unavailable uses status unavailable instead of GUI-only recovery prose
- Point ContractRef set at ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, and ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context
### 13.3 Bash and terminal ownership
Chat embeds a lightweight terminal preview but does not become a second interactive terminal surface.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

Ownership rules:
- Shell owns interactive state; chat owns preview+audit.
- Commands requiring stdin/TTY start Terminal immediately.
- Background/watch/server actions create terminal-owned session identity.
- One-shot commands remain chat-inline by default, but non-interactive work may still promote if it becomes long-running.
- Every promoted command card binds to stable terminal session identity.
- Large payloads store full data behind refs/blobs.

Command-card model:
- the mini terminal preview is read-only and non-interactive inside chat
- `Open in Terminal`, `Show Terminal`, `Rerun in Terminal`, and `Detach/Pop-Out` remain the canonical terminal actions
- `Open in Terminal` and `Show Terminal` must focus the same live session
- `Rerun in Terminal` launches a fresh terminal execution and therefore binds to a new `terminal_session_id`
- after promotion, chat stops owning the full transcript
- inline cards persist across thread reload and re-render from persisted metadata
- search and diff do not stream progressively

Reveal and focus behavior:
- if the referenced terminal session is already visible, `Open in Terminal` and `Show Terminal` simply focus it
- if the session is hidden inside another pane, tab, or section, the shell reveals the existing pane or tab before creating anything new
- if only historical state remains, the card opens that historical shell receipt and presents explicit recovery actions instead of silently creating a replacement session
- attach failure recovery differs for live process, ended process, and inline-only completed command

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md

Rules:
- Keep terminal command consumers anchored to Plans/UI_Command_Catalog.md#Terminal session and layout commands and Plans/FinalGUISpec.md#15.1 Terminal operation card widget
### Command-card model
Command cards are transcript-adjacent summaries rather than a second shell implementation.

Rules:
- cards surface summary, status, and a primary reveal action without pretending to own the full shell lifecycle
- when shell integration is `rich` or `basic`, command cards may expose cwd, duration, exit code, and command labels according to confidence tier
- when shell integration is `opaque`, the card MUST degrade to lower-confidence activity disclosure and MUST NOT fabricate exact command text or exact command boundaries
- transcript continuity remains canonical even when command-card metadata is degraded

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Tools.md

### Reveal and focus behavior
- if the referenced terminal session is already visible, `Open in Terminal` and `Show Terminal` simply focus it
- if the session is hidden inside another pane, tab, or section, the shell reveals the existing pane or tab before creating anything new
- if only historical state remains, the card opens that historical shell receipt and presents explicit recovery actions instead of silently creating a replacement session
- explicit `New Terminal` and explicit restart remain separate user-visible actions

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/storage-plan.md

### Status, degradation, and linked-surface behavior
Command-card status badges may reflect `starting`, `running`, `exited`, `failed`, `terminated`, `disconnected`, `restoring`, and `attention_required`.

Rules:
- chat preview stays compact even when the terminal transcript is large
- Output, Problems, Debug Console, and Ports continue to route through the owning terminal or dev-session identity rather than through chat-local state
- command cards may link to Output, Problems, or Ports when the command or dev session produced those linked surfaces

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md
### 13.4 Shared runtime identity display
Assistant Chat may display requested/effective runtime identity, but it must consume the owner-doc shared runtime model rather than invent assistant-local fields.

Rules:
- compact chat surfaces may show only the material display summary needed for that moment
- the message-under-row summary uses the resolved user-facing mode label, model, and time or duration
- the mode display label is derived from canonical shared fields rather than from assistant-local string assembly
- compact chat surfaces do not show version and do not show `current` or `frozen` wording
- historical thread/activity views show frozen requested/effective runtime state captured for that execution
- assistant/chat MUST NOT introduce local replacement fields such as `active_model`, `actual_model`, or `assistant_runtime_state`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Multi-Account.md

Message runtime popover fields are closed to:
- `Mode`
- `Provider`
- `Model`
- `Effort`
- `Persona`
- `Worker`
- `Tokens`
- `Context`

Label rules:
- `Mode` uses the normalized user-facing labels `Ask`, `Agent`, `Plan`, and `Deep Plan`
- `Worker` is `Agent` or `Subagent`
- `Tokens` shows compact total and may disclose breakdown on expansion or in the detailed pane
- `Context` shows used, limit, and percentage when known
- assistant rows show thinking time or duration; user rows show timestamp

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md

Display mapping rules:
- `Deep Plan` is shown when the effective overlay is `deep_plan`
- `Plan` is shown when the effective overlay is `plan` and the runtime posture is planning
- `Ask` is shown when the effective runtime posture is `ask` and no higher planning overlay is active
- `Agent` is shown for normal execution posture when no higher planning overlay is active

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md
