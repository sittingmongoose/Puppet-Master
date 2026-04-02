## 7. Attachments, Web Search, and Extensibility

Assistant chat accepts structured inputs beyond plain text and exposes external capability integrations without hiding provenance.

ContractRef: ContractName:Plans/Media_Generation_and_Capabilities.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md

### 7.1 Attachment model

Supported attachment families are:
- files
- images
- URLs
- inline code snippets

Attachment rules:
- files may include project files, logs, documents, archives, and generated artifacts addressable through the file-manager/editor contracts
- images render with preview, filename or source label, and size metadata when known
- URLs render as normalized link chips/cards and may later resolve into fetched/extracted web-activity cards
- code snippets pasted into the composer preserve formatting and language hinting when detection is possible
- attachments persist as structured message payloads rather than being flattened into plain text only

Minimum attachment fields:
- `attachment_id`
- `attachment_type`
- `display_name`
- `source_ref`
- `mime_type?`
- `size_bytes?`
- `preview_state`

### 7.2 Web search integration

Web search is a first-class chat capability, not a hidden side channel.

Required rules:
- when the assistant uses web search, the thread shows explicit web activity cards and later source/citation disclosure in the related assistant turn
- web-derived results appear inline in chat as operation cards, source blocks, or citations tied to the turn that used them
- fetched/extracted content preserves provenance so users can distinguish search snippets, extracted page text, and synthesized conclusions
- if the active provider or policy cannot use web search, the assistant discloses that limitation rather than implying that the web was consulted
- user-supplied URLs and assistant-triggered web results share the same attachment/provenance system while preserving distinct origin labels

### 7.3 Extensibility surface

Assistant chat can surface extensibility points that are callable or inspectable from the thread when policy allows.

Supported extensibility families:
- skills
- plugins
- MCP tools / servers

Required rules:
- skills, plugins, and MCP-backed tools surface through canonical tool-call, tool-result, and operation-card patterns rather than bespoke invisible integrations
- when an extensibility point is invoked, chat shows the capability identity, status, and resulting output or failure
- capability discovery may depend on installation/provider state, but unavailable integrations must not be presented as callable
- extensibility integrations follow the same permissions, provenance, and audit-trail rules as built-in tools
- chat should disclose whether an action came from a built-in tool, a skill, a plugin, or an MCP server-backed tool

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md

