## 7. Attachments, Web Search, and Extensibility

- **Files and photos:** User can add files to the chat, especially **photos**, so the agent has visual and file context. **Paste** (e.g. image from clipboard) and **drag-drop** into the composer are supported; same attachment pipeline as "add files." Attachments are included in the context sent to the platform CLI (per platform capabilities; all five platforms support image **attachments** per AGENTS.md). **Image generation vs. attachment:** All platforms can *accept* image attachments as input context, but image *generation* (creating new images from prompts) is available only via Cursor-native generation (no API key required) or Google Gemini API-backed generation (requires a configured Google API key). For the full generation contract, capability gating, and disabled-reason semantics, see `Plans/Media_Generation_and_Capabilities.md` §1–§2 (SSOT).

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

---

