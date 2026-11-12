# Shard 015: GUI Requirements (Product)

Source: `Plans/agent-rules-context.md`

Source lines: L247-L259

Source SHA256: `212cf76ee5e4a1c283b0d769c6a03a740e09169e4f0b29c03edfbf8d7c095c02`

---

## GUI Requirements (Product)
Context Injection behavior defaults use the one Settings resolver at admitted Everywhere/Computer/optional-Project and per-run levels; journal/summary/rules bodies remain their owners' data, not copied settings:
1) Parent Summary — default ON
2) Scoped AGENTS.md (beyond top-level) — default ON
3) Attempt Journal — default ON
Keep the “Injected Context” record internally for enforcement and debugging:
- AGENTS.md identity, paths and byte counts
- parent summary and attempt journal inclusion and byte counts
- truncation occurrence, reason and order
The GUI keeps basic capacity/cost/model facts and useful compaction/truncation status, with no source-composition view, prompt preview or per-run inclusion receipt (DL-475). Existing admitted Settings controls remain owner-governed; retired presentation controls are not restored.

Each instruction/rules target has exactly one control mode: `PM Controlled` or `Manual Override`. A `PM Controlled` target is regenerated only from the saved canonical instruction source. A target can switch from `Manual Override` back to `PM Controlled` only after the canonical instruction source is saved and the target is refreshed from that source.
---
