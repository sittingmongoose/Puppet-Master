## 7. Attachments, Web Search, and Extensibility

- **Files and photos:** User can add files to the chat, especially **photos**, so the agent has visual and file context. **Paste** (e.g. image from clipboard) and **drag-drop** into the composer are supported; same attachment pipeline as "add files." Attachments are included in the context sent to the platform CLI (per platform capabilities; all providers support image **attachments** per AGENTS.md). **Image generation vs. attachment:** All platforms can *accept* image attachments as input context, but image *generation* (creating new images from prompts) is available only via Cursor-native generation (no API key required) or Google Gemini API-backed generation (requires a configured Google API key). For the full generation contract, capability gating, and disabled-reason semantics, see `Plans/Media_Generation_and_Capabilities.md` §1–§2 (SSOT).

ContractRef: ContractName:Plans/Media_Generation_and_Capabilities.md#MEDIA-GENERATE, ToolID:media.generate

- **Web search (cited):** The agent must be able to **search the web with citations** when appropriate (e.g. via MCP or a dedicated web-search tool). Results must include **inline citations** and a **Sources:** list (URLs and titles) so the user can verify and follow references. The same capability applies to **Interview** and **Orchestrator** -- they use the same run config and MCP/tool wiring. Full specification (output format, architecture options, provider/auth, model selection, errors, security, per-platform, and **gaps/potential problems**) is in **Plans/newtools.md §8.2.1**. We adapt an approach like [opencode-websearch-cited](https://github.com/ghoulr/opencode-websearch-cited) (LLM-grounded search; Google, OpenAI, OpenRouter) as a single shared implementation (prefer MCP server so all three surfaces use the same tool).
- **Plugins, MCPs, and extensibility:** The chat must be able to use **plugins**, **MCPs** (Model Context Protocol servers), and other extensibility mechanisms available in the application. When the user runs the Assistant (or Interview) in chat, the same plugin/MCP configuration that applies to the rest of Puppet Master (e.g. Context7, Browser MCP, custom tools) should be available to the chat session so the agent can call tools, query docs, or use other registered capabilities. Wire chat execution to the same run config and MCP/plugin discovery used elsewhere (see Plans/newtools.md §8 for MCP config and platform coverage).

### 7.1 Capability introspection (`capabilities.get`)

When the user asks about available capabilities, features, or what Puppet Master can do, the Assistant MUST call `capabilities.get` and present the results as a structured list of **enabled** capabilities, **disabled** capabilities with their disabled reasons, and setup guidance (setup hints). This ensures the user gets an accurate, real-time answer rather than a stale or generic one.

ContractRef: ToolID:capabilities.get, ContractName:Plans/Media_Generation_and_Capabilities.md#CAPABILITY-SYSTEM

### 7.2 Natural-language model override (per-message only)

The user may specify a per-message model override inline in their prompt (e.g., *"generate an image using Nano Banana Pro"*). This override applies to the **current `media.generate` invocation only** and MUST NOT change the persistent model configured in Settings. Resolution order: alias → exact model ID → exact displayName → else `MODEL_UNAVAILABLE`. For the full slot-extraction grammar and resolution rules, see `Plans/Media_Generation_and_Capabilities.md` §3.4 (SSOT).

ContractRef: ToolID:media.generate, ContractName:Plans/Media_Generation_and_Capabilities.md#SLOT-EXTRACTION

### 7.3 Media generation invocation model

Media generation (Image, Video, TTS, Music) is invoked primarily by **natural language** — the user describes what they want in the chat, and the Assistant extracts structured parameters via the slot-extraction grammar (`Plans/Media_Generation_and_Capabilities.md` §3). The **capability picker dropdown** in the composer (see `Plans/FinalGUISpec.md` §7.16) is a convenience helper that inserts a guided prompt; it does not bypass the natural-language pipeline.

ContractRef: ToolID:media.generate, ContractName:Plans/Media_Generation_and_Capabilities.md#MEDIA-GENERATE

### 7.4 External link navigation and repo import (MVP — separate from project-workspace search)

This subsection defines **network-based navigation** (web pages, GitHub links, docs) and **external repo import** as an explicit, user-requested capability. It is **separate** from default **project workspace / project root** search (codesearch, chatsearch, logsearch), which is always scoped to the current project unless the user explicitly asks to go external.

#### 7.4.1 Link navigation: fetch + cite

- **Navigate / fetch:** When the user provides a link (HTTP/HTTPS) and asks the assistant to read it, the assistant MAY invoke `webfetch` to retrieve the content (subject to `webfetch` permissions and allow/deny rules in `Plans/Permissions_System.md` and FileSafe URL rules).
- **Citations:** When fetched content is used for claims, the assistant MUST include citations (URLs and titles) consistent with the cited web-search contract in `Plans/newtools.md §8.2.1`.
- **Audit trail:** Each `webfetch` MUST emit an audit entry in the thread (see §13): URL fetched, HTTP status (if known), bytes fetched or truncation note, and whether content was used as a source.

#### 7.4.2 External repo import: bring a repo into the project so it can be searched

- **User intent required:** Importing a repo is only performed when the user explicitly requests it (e.g., "Pull this repo in so you can inspect it" / "Clone this repo into the project").
- **Resulting scope:** After import, the repo becomes part of the **project workspace** (as a new project, an added workspace root, or a temporary mount) and can then be searched using the **project-scoped** code/log/chat retrieval features described in §10 and §17.
- **Allowed sources:** MVP supports GitHub repositories; additional hosts (GitLab, Bitbucket, arbitrary git remote) are permitted only if explicitly enabled via Settings/Permissions allowlists.
- **Two acquisition paths (both allowed):**
  1. **GitHub API assisted:** Use `GitHubApiTool` (Plans/Tools.md) to resolve repository metadata and determine clone/download URLs (auth per `Plans/GitHub_API_Auth_and_Flows.md`). Then perform an authenticated clone/download using the resolved URL (see below).
  2. **Direct git clone:** Use `bash` to execute `git clone` from an HTTPS remote when permitted (still subject to network/tool approval, FileSafe guards, and audit trail).
- **No `gh` rule:** GitHub CLI (`gh`) remains forbidden for GitHub operations (Plans/Tools.md: GitHubApiTool rules).
- **Private repos / auth:** Private repository import MUST require explicit user approval and an authenticated method (GitHub auth realm `github_api` per `Plans/Contracts_V0.md` + `Plans/GitHub_API_Auth_and_Flows.md`). If auth is missing/expired, the assistant must guide the user through the supported login flow rather than attempting unauthenticated access.
- **Destination and exposure:** Import destinations MUST be under configured workspace roots and must respect external-directory constraints (Permissions `external_directory`). The assistant must never import into a path that violates FileSafe path rules. Imported repos must not silently overwrite existing directories; require explicit confirmation when destination exists.
- **Indexing:** Imported repo contents are eligible for the code index (Tantivy + LSP + ripgrep per Plans/storage-plan.md + Plans/Tools.md) after import completes; indexing progress should be visible (optional spinner/indicator).
- **Audit trail:** Repo import MUST be recorded in the thread (see §13): source URL / repo identifier, chosen acquisition path (API-assisted vs direct clone), destination path, and a summary of what was imported (commit/branch if known).
- **Settings & permissions:** External repo import must be controllable via:
  - Tool permissions (`webfetch`, `websearch`, `bash`, `GitHubApiTool`, and `repo.import` if implemented as a dedicated tool).
  - Host allowlist / denylist for network destinations (Settings/Permissions; default action for unknown hosts remains `ask`).
  - **Secrets policy (mandatory):** All persisted chat/log/index content MUST comply with PolicyRule:no_secrets_in_storage / INV-002 (strict secrets scrubbing before seglog/redb/Tantivy/blob persistence). An optional additional “secret-ish” heuristic redaction setting exists for extra masking (default OFF; see Plans/storage-plan.md + FinalGUISpec.md).

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Tools.md

---
