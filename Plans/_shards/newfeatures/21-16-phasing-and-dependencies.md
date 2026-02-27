## 16. Phasing and Dependencies

Suggested order for implementation, assuming we want incremental delivery:

| Phase | Focus | Depends on |
|-------|--------|------------|
| **1** | Bounded buffers and process isolation audit (§13), protocol normalization design (§5) | None. **Audit checklist:** List all places we read subprocess output (runners, headless, any future stream consumer); introduce shared bounded buffer type and constants; document in AGENTS.md. |
| **2** | Persistent rate limit in GUI (§3), analytics dashboard (§7), "know where your tokens go" framing (§15.12) | Existing usage/plan detection; **align with Plans/usage-feature.md** (5h/7d, ledger schema, state-file-first). |
| **3** | Session/crash recovery (§4), restore points and rollback (§8), optional branching (§15.3) | State serialization, redb/projections (§14) |
| **4** | Orchestration prompt and optional role hints (§1) | Platform specs, execution engine |
| **5** | Hook system (§9), FileSafe dangerous-command blocking (§15.1), then plugin/skills (§6) | Config, event pipeline |
| **6** | Background agents with queue and git isolation (§2) | Git module, queue manager, GUI panel |
| **7** | Auto-compaction and context thresholds (§10) | Token estimation, state layer |
| **8** | Keyboard shortcuts and command palette (§11), stream event viz, thinking, timers (§12, §15.5, §15.6), mid-stream usage (§15.9) | Normalized stream (§5), UI components |
| **9** | Additional ideas as needed: project browser (§15.8), @ mentions (§15.4), in-app instructions editor (§15.3), MCP (§15.7), one-click install catalog (§15.13), IDE-style terminal and panes (§15.14), hot reload and fast iteration (§15.15), sound effects (§15.16), **instant project switch** (§15.17), **built-in browser and click-to-context** (§15.18), cross-device sync (§22), virtualization (§15.11), multi-tab/window (§15.10) | Core views and config |

**Notes:** Phase 9 can be subdivided; items are independent where dependencies allow. redb (§14) is part of the rewrite design and can be introduced in Phase 2 or 3 and then reused by analytics, restore points, and interview.

---

