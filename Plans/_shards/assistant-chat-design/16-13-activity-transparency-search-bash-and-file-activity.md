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
- compact cards may show only the most important requested/effective delta
- expanded views may link to usage/history/details
- historical thread/activity views MUST show frozen requested/effective runtime state captured for that execution
- assistant/chat MUST NOT introduce local replacements such as `active_model`, `actual_model`, or `assistant_runtime_state`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Multi-Account.md

