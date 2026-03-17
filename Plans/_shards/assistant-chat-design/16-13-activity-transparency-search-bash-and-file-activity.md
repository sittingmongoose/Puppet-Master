## 13. Activity transparency: search, bash, and file activity

Activity transparency uses a shared inline operation-card family rather than isolated one-off widgets.

### 13.1 Operation-card family
Canonical card types are:
- command / bash activity
- web activity
- files explored
- files changed
- code diffs
- subagent activity

Rules:
- Cards are inline with the assistant narrative.
- Each card has a compact summary, expandable details, status badge, and a primary open/focus action appropriate to the card type.
- Command cards use `Open in Terminal` / `Show Terminal` as the primary action.
- Search/web cards open sources/results/detail views.
- Diff/edit cards open the relevant file or diff view in the editor.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/FileManager.md, ContractName:Plans/Tools.md

### 13.2 Web activity and provenance
Assistant Chat uses distinct web activity labels:
- `Searching Web`
- `Extracting Site`
- `Researching Web`
- `Crawling Site`
- `Mapping Site`
- `Reading Site`

Rules:
- `Reading Site` is reserved for PM-native Site Reader work.
- Search/result provenance MUST distinguish search snippets, extracts, site-reader output, research synthesis, crawl results, and map results.
- The final Sources block MUST deduplicate repeated URLs while preserving the strongest provenance badge per source.
- Provider fallback or support-tier changes MUST be visible in the related activity card.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md

### 13.3 Bash and terminal ownership
Assistant Chat may preview shell-backed work inline, but the canonical interactive session remains the Terminal surface.

Rules:
- one inline command card per command invocation
- collapsed preview defaults to 5 lines; expanded preview defaults to 15 lines
- `Open in Terminal` focuses the same live session rather than spawning a fresh shell
- chat owns a compact audit/preview view; Terminal owns the canonical interactive PTY session

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Modes.md

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
