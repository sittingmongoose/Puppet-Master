# Shard 015: GUI Requirements (Product)

Source: `Plans/agent-rules-context.md`

Source lines: L247-L258

Source SHA256: `239ee9829dfe15dd51e8664b8363b46c63f10b843f88fe43aeedc72ad954280d`

---

## GUI Requirements (Product)
Context Injection behavior defaults use the one Settings resolver at admitted Everywhere/Computer/optional-Project and per-run levels; journal/summary/rules bodies remain their owners' data, not copied settings:
1) Parent Summary — default ON
2) Scoped AGENTS.md (beyond top-level) — default ON
3) Attempt Journal — default ON
GUI must show an “Injected Context” breakdown per run:
- which AGENTS.md were included (paths + byte counts)
- whether parent summary and attempt journal were included (byte counts)
- whether truncation occurred (and why)

Each instruction/rules target has exactly one control mode: `PM Controlled` or `Manual Override`. A `PM Controlled` target is regenerated only from the saved canonical instruction source. A target can switch from `Manual Override` back to `PM Controlled` only after the canonical instruction source is saved and the target is refreshed from that source.
---
