## 5. Commands (slash commands and custom commands)

The reserved slash-command surface is canonical and non-overridable.

### 5.1 Reserved built-ins
Reserved built-in slash commands are owned by `Plans/Commands_System.md` and consumed here without local drift.

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md

Reserved set:
`/new`, `/model`, `/effort`, `/mode`, `/export`, `/compact`, `/stop`, `/resume`, `/rewind`, `/revert`, `/share`, `/settings`, `/doctor`, `/help`, `/worktree`, `/web`

Catalog rules:
- reserved commands shown as non-editable in catalog
- deprecated aliases shown distinctly from active commands
- /web remains discoverable in catalog

Chat rules:
- `/cancel` is accepted only as a deprecation alias to `/stop`
- `/clear` is removed from the reserved built-in set
- `/web` is a family entry-point rather than a default-to-search helper
- `/skill` remains a discovery/invocation helper, not a reserved built-in

Rules:
- reserved slash command
- alias/deprecation state
- /cancel is accepted only as a deprecation alias to /stop
- /clear is removed from the reserved built-in set
- /web is a family entry-point rather than a default-to-search helper
- /skill remains a discovery/invocation helper, not a reserved built-in
- Keep this chat consumer pointed at Plans/Commands_System.md#7. Reserved built-in slash commands
### 5.2 `/web` and `/skill`
Slash and natural-language web dispatch share the same underlying dispatcher and provider-routing rules.

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/Tools.md

`/web` family identities:
- `/web search` → `websearch`
- `/web fetch` → `webfetch`
- `/web extract` → `webextract`
- `/web research` → `webresearch`
- `/web crawl` → `webcrawl`
- `/web map` → `webmap`

Family rules:
- bare `/web` opens help/autocomplete and has no default operation
- slash routing and NL routing land on the same tool contracts, permission gates, and audit payloads
- bare `/skill` opens discovery or direct invocation using the `skill_id / arguments? / context?` contract rather than acting as a panel alias

Rules:
- /skill <skill_name> [args]
- No subcommand family for MVP
- invoke_skill
- bare /web opens help/autocomplete and has no default operation
- bare /skill opens discovery or direct invocation help rather than a panel alias
- Keep this surface consuming Plans/UI_Command_Catalog.md#2.7 Chat slash commands (reserved) and Plans/Commands_System.md#7. Reserved built-in slash commands
### 5.3 Git & GitHub command boundary
Git and GitHub prefixes remain reserved and route into the canonical source-control and GitHub command surfaces rather than to user-defined command overrides.

Boundary rules:
- `/git ...` and natural-language requests for local repository work route to the Git/Source Control command family: status, diff, branch/worktree, commit, merge, revert, stash, and other local repository operations.
- `/github ...` and natural-language requests for PR, issue, Actions, workflow, review, comment, release, or hosted-repo administration route to the GitHub command family.
- The assistant MUST NOT silently reinterpret a Git request as a GitHub request, or vice versa, just because one path appears easier.
- When a user request spans both domains, the assistant must expose the boundary explicitly (for example: local compare first, then hosted PR creation) and preserve the handoff identity between the two stages.
- Requests that pivot into compare/review/open flows MUST preserve the canonical repo/worktree/compare identity fields rather than reconstructing targets from whatever branch happens to be active later.

GitHub-local detail ownership remains in `Plans/GitHub_Integration.md`; chat owns only the dispatch boundary, routing expectations, and inline disclosure that a request is crossing from local Git to hosted GitHub behavior.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Commands_System.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Contracts_V0.md

### 5.4 Custom command boundary
User Commands may complement built-ins, but they do not replace or suppress the canonical Assistant Chat command set. PM-native Ask and Plan behavior remains authoritative even when an upstream reference product handles modes or permissions differently.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Commands_System.md, ContractName:Plans/OpenCode_Deep_Extraction.md
### 5.5 Dispatcher parity
- NL intents and slash commands hit the same dispatcher.
- "search the web for X" → `websearch`.
- "extract this page" → `webextract`.
- "read this URL" → `webfetch`.
- "research topic" → `webresearch`.
- Reading intents MUST resolve to `webfetch`, not `websearch`.
- `/skill <skill_name> [args]`, the Skills panel, and Natural language all converge on the same `invoke_skill` runtime contract.

LSP note:
- `workspaceSymbol` requires `query`.
- Position-based operations use `path` + `position`.
- `rename` requires `path` + `position` + `newName`.
- `read_only` keeps web exploration ask-gated rather than silently denying it, and question default `allow` only when HITL is available.
- approval ladder tokens include `deny`, `once`, `for session`, and `always`.

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Skills_System.md
- subcommand is required for execution
- URL normalization applies
- parse failure shows usage

Rules:
- /web
- intent phrase
- resolved tool key
- query
- site/page reading is not search
- dispatcher parity applies to slash and NL paths
- read_only keeps web exploration ask-gated rather than silently denying it
- approval ladder tokens include deny/once/for session/always
- question default allow only when HITL is available
- Keep this dispatcher note aligned with Plans/Tools.md#12. Web tool routing algorithm, Plans/UI_Command_Catalog.md#2.7 Chat slash commands (reserved), and Plans/LSPSupport.md#9. MVP LSP features (summary)
