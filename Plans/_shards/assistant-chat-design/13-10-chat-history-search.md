## 10. Chat History Search

- **Human search:** Chat must support **search across chats / history** so **users** can find prior conversations and reuse context (e.g. search within current chat and, if applicable, across past chats or sessions). This is a first-class UI feature (search box, filters, results list). Implementation: Tantivy chat index fed by seglog projector (Plans/storage-plan.md).
- **Agent search:** **Agents** must also be able to **search through chat history** when answering or planning. Provide a way for the running agent (Assistant, Interview, or subagent) to query past messages or sessions -- e.g. via a tool/MCP, or by including a searchable index of chat history in the context pipeline -- so the agent can retrieve relevant prior decisions, explanations, or outcomes. Enables continuity (e.g. "last time we decided X") and avoids asking the user to re-paste old context. Implementation can share the same storage/index as human search (Tantivy) but must expose an agent-callable interface (tool, API, or injected context).

### 10.1 Smart auto-retrieval (RAG) across project sources (NOT “always search everything”)

In addition to explicit human/agent search, the Assistant Chat context pipeline supports **smart auto-retrieval** that can pull **relevant slices** from **project chat history**, **project workspace code**, and **project logs** to keep long threads usable without overloading the context window.

**Hard rules:**
- **Project-only by default:** Auto-retrieval searches **only within the current project** (project-scoped indices; see §10.3). It MUST NOT search other projects or external sources unless the user explicitly requests external navigation/import (§7.4).
- **Not always-on for everything:** Auto-retrieval MUST be **triggered and budgeted**, not “search everything every turn.”
- **Deterministic budget caps:** Auto-retrieval has strict per-source limits (queries/hits/bytes) so it cannot crowd out user/assistant messages.

**Retrieval sources (project-only):**
- **Chat history retrieval:** Tantivy chat index; enables “what did we decide earlier / in another thread.”
- **Code retrieval:** Tantivy code index (MVP) + LSP symbol search + ripgrep fallback (Plans/Tools.md + Plans/storage-plan.md).
- **Logs retrieval:** Tantivy logs index (MVP) over log summaries + pointers to full payload (Plans/storage-plan.md).

**Trigger heuristics (examples; implementation may add more, but must remain deterministic):**
- **Chat-history triggers:** user references earlier decisions (“last time”, “earlier thread”, “we decided”), asks to continue previous work, or asks “why did we do X.”
- **Code triggers:** user mentions file paths/symbol names, asks “where is X implemented,” references diagnostics (file:line), or requests edits that require locating code.
- **Logs triggers:** user references failures (“it crashed,” “why did this fail”), mentions run IDs/tool errors, or asks for the last output.

**Modes and defaults (Settings-controlled; see FinalGUISpec.md):**
- For each retrieval source (chat/code/logs): `off` | `auto` | `always`.
- Default: **`auto`** for chat/code/logs.
- A thread-local override exists (Auto Retrieval chip; §12 addendum): **On/Off** for the current thread (does not change project defaults).

**Context injection behavior:**
- Retrieval results are injected into the **Work bundle** as a dedicated **“Retrieved Context”** block with:
  - source type (chat/code/logs),
  - provenance (thread_id/message_id or path/line or run_id/event_id),
  - byte/token sizes per snippet,
  - truncation notes if caps were hit.
- Retrieved Context is **not** “memory” and must not be written into the Assistant memory store unless separately captured as a verified gist (Plans/assistant-memory-subsystem.md).
- Auto-retrieval MUST respect **Context Lens** overlays (§17): muted messages are excluded; focused messages are prioritized; subcompacted messages use the subcompact summary instead of raw messages.

### 10.2 Agent-callable search tools (project-only)

To support both explicit agent reasoning and smart retrieval, provide agent-callable tools (or MCP equivalents) that query the project indices:

- `chatsearch(query, filters={thread_id?, time_range?}, k)` → hits with `thread_id`, `message_id`, `ts`, snippet, score.
- `codesearch(query, path?, mode={text|symbol}, k)` → hits with `path`, line/range, snippet (symbol-aware when LSP available).
- `logsearch(query, filters={time_range?, run_id?, thread_id?, tool_name?, level?}, k)` → hits with `event_id`/`blob_ref`, `ts`, short summary/snippet.
- `logread(ref)` → full payload (bounded by size caps; subject to stricter permission defaults).

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Permissions_System.md

### 10.3 Scoping and performance: per-project indices (required)

To guarantee **project-only search** and keep performance stable as threads grow:

- Tantivy indices for chat/code/logs MUST be stored **per project**:
  - `storage/tantivy/projects/{project_id}/chat`
  - `storage/tantivy/projects/{project_id}/code`
  - `storage/tantivy/projects/{project_id}/logs`
- This enables fast queries in long-lived projects, supports clean retention/cleanup per project, and does not block future cross-project search (future enhancement: query multiple project indices and merge top-K).

ContractRef: ContractName:Plans/storage-plan.md

---
