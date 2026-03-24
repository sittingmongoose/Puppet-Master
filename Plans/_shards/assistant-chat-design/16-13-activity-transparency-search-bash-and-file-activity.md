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
Assistant Chat may preview shell-backed work inline, but the canonical interactive runtime remains the terminal workspace.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Modes.md

Rules:
- one inline command card still corresponds to one observed command invocation or session reference.
- `Open in Terminal` and `Show Terminal` resolve to the exact referenced terminal session, workgroup, and leaf pane when that linkage exists.
- chat owns compact audit and preview receipts; the bottom runtime terminal workspace owns the canonical PTY layout and interaction state.
- the bottom runtime workspace uses workgroups and subtabs rather than one flat strip of unrelated tabs.
- editor-embedded terminal panels are secondary presentations of existing terminal leaf panes and do not become independent chat-owned runtimes.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md
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
