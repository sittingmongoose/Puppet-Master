# Shard 004: Suggested "single source of truth" rule for the rewrite

Source: `Plans/rewrite-tie-in-memo.md`

Source lines: L141-L151

Source SHA256: `8086676ed9f42bcf0af1756544bcf56a0444046613af1bf0b372647f30ef45a0`

---

## Suggested "single source of truth" rule for the rewrite

- Provider contracts, unified event model, tool registry, and patch pipeline should be specified in one canonical plan (or one canonical spec section), and other plans should reference it instead of re-describing it
- Grep/Search acceleration does not mint rewrite-local analytics events: the grep `tool.invoked` seglog event may include optional `index_used: boolean` for analytics, with no other event-shape change; detailed tool-event ownership remains in `Plans/Tools.md`, storage rollups in `Plans/storage-plan.md`, and Usage interpretation in `Plans/usage-feature.md`.
- Web-tool rewrite notes keep `websearch` discovery distinct from `webfetch` / `Reading Site` read-and-parse behavior. The memo may cite OpenCode and Exa implementation research, but source-file paths, upstream API URLs, helper names, and adapter internals remain reference provenance in transfer metadata rather than PM product vocabulary.
- The product-facing web split preserves `http://` / `https://` URL validation, permission prompting, bounded response behavior, and format-aware output where read/fetch results are rendered; provider free-plan and rate-limit behavior remains owned by `Plans/Tools.md`.
- Chat surfaces distinguish chat-native tool result cards from shell-owned terminal/output surfaces and from true interactive terminal sessions. Chat may summarize or link to execution, but terminal/output ownership stays with the canonical shell/runtime surfaces.
- The chat-widgets cluster includes code-block and `/diff` cards that can open in-app editor views with range-aware positioning, question chips/freeform paths, and Mermaid / `.mmd` native diagram rendering; owner details remain in `Plans/assistant-chat-design.md` and `Plans/FinalGUISpec.md`.
- Thread context/detail surfaces do not use `chat-shell` popouts or `/side-panel` detail panels as their canonical target; rewrite navigation opens or focuses the thread-scoped Context Detail Pane as an `editor-tab` surface, with product behavior owned by `Plans/assistant-chat-design.md` and `Plans/usage-feature.md`.
- Runtime identity carry-through treats legacy account-doc shorthand as retired: `Multi-Account.md` and the shared runtime contracts own `execution_role`, operational identity, handoff, and UI disclosure fields before feature-specific docs depend on them.

