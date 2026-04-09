## 5. Commands (slash commands and custom commands)

The reserved slash-command surface is canonical and non-overridable.

### 5.1 Reserved built-ins

This section consumes the linked owner contract and stays aligned with it.

Labels and values:
- /new
- /model
- /effort
- /mode
- /export
- /compact
- /stop
- /resume
- /web
- /skill
- /cancel
- reserved built-ins

Rules:
- /cancel resolves internally to cmd.chat.stop
- /web remains discoverable in catalog
- deprecated aliases shown distinctly from active commands
- reserved commands shown as non-editable in catalog
### 5.2 `/web` and `/skill`

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- GUI/help canon must preserve row-level health/error disclosure, last-failure messaging, inline contextual help, and availability/support-tier visibility in Settings and /web help/autocomplete.
- The /web family is locked as one slash-command family with stable command IDs, bare /web help behavior, and no flattening into separate top-level families.
- Skill discovery and invocation are locked to three paths—GUI panel, /skill, and natural language—without an MVP subcommand family, all converging on the same invoke_skill contract.

Fields:
- slash prototype
- stable command ID
- subcommand-required parsing
- /skill <skill_name> [args]
- /skill with no args lists available skills
- invoke_skill
- No subcommand family for MVP
- Skills panel
- Natural language

Labels and values:
- /skill

Rules:
- row-level health/error disclosure
- last-failure messaging
- contextual help text
- availability plus support-tier visibility in Settings
- availability plus support-tier visibility in `/web` help/autocomplete
- /web search <query>
- /web extract <url>
- /web research <task>
- /web crawl <url>
- /web map <url>
- cmd.chat.web.search
- cmd.chat.web.extract
- cmd.chat.web.research
- /web fetch <url>
- cmd.chat.web.fetch
- cmd.chat.web.crawl
- cmd.chat.web.map
- bare /web shows help/autocomplete only
- do not flatten /web into separate slash families
- subcommand is required for execution
- URL normalization applies
- parse failure shows usage
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

This section defines the canonical contract for this surface.

Core rules:
- Natural-language web intents must hit the same dispatcher as slash commands, and site or page reading intents must resolve to webfetch rather than websearch or provider extract.

Fields:
- intent phrase
- resolved tool key

Rules:
- NL intents and slash commands hit the same dispatcher
- "search the web for X" → `websearch`
- "extract this page" → `webextract`
- "read this URL" → `webfetch`
- "research topic" → `webresearch`
- Reading intents MUST resolve to `webfetch`, not `websearch`
- site/page reading is not search
- dispatcher parity applies to slash and NL paths
- command tables and routing docs must mirror the same mappings
