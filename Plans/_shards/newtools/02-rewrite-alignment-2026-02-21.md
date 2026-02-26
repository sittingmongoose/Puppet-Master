## Rewrite alignment (2026-02-21)

This plan remains authoritative for *what* tool discovery/testing support must exist, but implementation should align with `Plans/rewrite-tie-in-memo.md`:

- Tool discovery, permissions, and validation should live in the **central tool registry + policy engine** (not per-provider special cases)
- Tool execution results should be normalized into the **unified event model** and stored in seglog → projections (redb/Tantivy)
- **Tool latency and errors** from the unified event model are consumed by **analytics scan jobs** (scan seglog for tool latency distributions and error rates); rollups are stored in redb and exposed on the dashboard (e.g. tool performance and error-rate summaries).
- UI wiring details should be re-expressed in Slint (not Iced) without changing feature semantics
- Auth policy reminder: subscription-first; **Gemini API key is the explicit allowed exception** (subscription-backed)
- For this task, deliverables are **Plans-folder documentation updates for the Slint rebuild**; no legacy Iced runtime wiring is required.

