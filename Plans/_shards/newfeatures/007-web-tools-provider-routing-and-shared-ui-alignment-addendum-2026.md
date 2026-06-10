# Shard 007: Web tools, provider routing, and shared UI alignment addendum (2026-04-04)

Source: `Plans/newfeatures.md`

Source lines: L71-L86

Source SHA256: `360bfc1732e8b68dc5199eac373fe54df23eff7e6f1788d69b5f2ae21426a64c`

---

## Web tools, provider routing, and shared UI alignment addendum (2026-04-04)

The promoted rewrite feature set includes the repaired web/provider/question/planning canon rather than the earlier summarized placeholders.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md

Cross-reference consumers remain explicit: `Plans/feature-list.md` keeps new web-tool, question-system, TODO-schema, and Mermaid-rendering feature summaries accurate; `Plans/Prompt_Pipeline.md` keeps prompt context injection aligned to current web-tool names; `Plans/Progression_Gates.md` keeps tool availability and permission semantics gateable; `Plans/OpenCode_Coverage_Matrix.md` tracks slash-command, MCP, and tool-operation coverage; `Plans/newfeatures.md` keeps promoted-feature cross-references to web-tool enhancements current; `Plans/MiscPlan.md` keeps cross-cutting slash command references and stale lists aligned; `Plans/FileManager.md` keeps browser surface and Mermaid rendering language consistent with Part H inline visualizer behavior; and `Plans/OpenCode_Deep_Extraction.md` remains extraction/reference lineage rather than a competing owner.

Highlights:
- six canonical web operations plus native batch variants
- routing-aware provider disclosure and support-tier visibility
- reserved slash-command set, `/web` family behavior, and Agent Config naming stay aligned to their owner docs rather than older promoted-feature summaries
- shared question and TODO schemas across chat, widgets, storage, and delegated work
- distinct Mermaid and inline visualizer behavior
- four-step approval ladder and MCP owner-doc alignment
- Docker reference parity combines `docker/vscode-extension` / `/vscode-extension` authoring cues with Container Tools management and `/registry` behavior; Docker Hub management parity is not satisfied by the extension reference alone
