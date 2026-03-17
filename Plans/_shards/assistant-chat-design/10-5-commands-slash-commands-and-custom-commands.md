## 5. Commands (slash commands and custom commands)

The reserved slash-command surface is canonical and non-overridable.

### 5.1 Reserved built-ins
Reserved built-ins for Assistant Chat are:
- `/new`
- `/model`
- `/effort`
- `/mode`
- `/export`
- `/compact`
- `/stop`
- `/resume`
- `/rewind`
- `/revert`
- `/share`
- `/settings`
- `/doctor`
- `/help`
- `/web`
- `/skill`

Rules:
- Reserved built-ins MUST be visible in the slash-command catalog and settings surfaces.
- Reserved built-ins MUST NOT be overridden by User Commands.
- `/cancel` is a deprecated alias of `/stop` and MUST NOT carry separate semantics.
- `/clear` is not part of the canonical reserved Assistant Chat set and MUST NOT remain a default built-in unless a later packet explicitly reintroduces it.

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Permissions_System.md

### 5.2 `/web` and `/skill`
`/web` is one canonical command family with these subcommands:
- `/web search <query>`
- `/web extract <url>`
- `/web research <task>`
- `/web crawl <url>`
- `/web map <url>`

Natural-language requests for searching, extracting, researching, crawling, or mapping the web MUST route through the same internal dispatcher as `/web`, not a parallel feature-local path.

`/skill` is a lightweight invocation helper for loading or invoking an installed skill. Skill management remains in `Agent Config > Skills` and MUST NOT move into a `/skills` management family.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Skills_System.md, ContractName:Plans/FinalGUISpec.md

### 5.3 Git & GitHub command boundary
Git and GitHub prefixes remain reserved and route to the canonical source-control / GitHub command surfaces rather than to user-defined command overrides.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Commands_System.md

### 5.4 Custom command boundary
User Commands may complement built-ins, but they do not replace or suppress the canonical Assistant Chat command set. PM-native Ask and Plan behavior remains authoritative even when an upstream reference product handles modes or permissions differently.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Commands_System.md, ContractName:Plans/OpenCode_Deep_Extraction.md

