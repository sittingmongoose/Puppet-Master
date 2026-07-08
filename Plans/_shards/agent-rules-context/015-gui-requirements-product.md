# Shard 015: GUI Requirements (Product)

Source: `Plans/agent-rules-context.md`

Source lines: L247-L258

Source SHA256: `2f36d282c3795dd66d65f8fa473693d2bce1447500c2fe32d789b3faba2ab603`

---

## GUI Requirements (Product)
Add “Context Injection” settings (per project; override per run optional):
1) Parent Summary — default ON
2) Scoped AGENTS.md (beyond top-level) — default ON
3) Attempt Journal — default ON
GUI must show an “Injected Context” breakdown per run:
- which AGENTS.md were included (paths + byte counts)
- whether parent summary and attempt journal were included (byte counts)
- whether truncation occurred (and why)

Each instruction/rules target has exactly one control mode: `PM Controlled` or `Manual Override`. A `PM Controlled` target is regenerated only from the saved canonical instruction source. A target can switch from `Manual Override` back to `PM Controlled` only after the canonical instruction source is saved and the target is refreshed from that source.
---
