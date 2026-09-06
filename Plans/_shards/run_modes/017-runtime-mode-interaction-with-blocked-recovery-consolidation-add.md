# Shard 017: Runtime Mode Interaction with Blocked Recovery Consolidation Addendum (2026-03-09)

Source: `Plans/Run_Modes.md`

Source lines: L670-L689

Source SHA256: `a55e0f6be429d71cc0380293d4d2ddfeac8abf084f4f1667346376ce9380f178`

---

## Runtime Mode Interaction with Blocked Recovery Consolidation Addendum (2026-03-09)

This section defines deferred / Waiting Run Mode Semantics.

### Run-level state
- A run remains active if any node is runnable.
- If no node is runnable and blocked/backoff/prerequisite-waiting work exists, the run is deferred/waiting rather than terminal.
- Terminal completion requires no runnable, no blocked, no backoff, and no unresolved prerequisite work.

### Headless blocked discovery
When `headless_ask_denied` blocks work in a non-interactive mode:
- emit a blocked notice with `blocked_reason_code: headless_ask_denied`
- surface blocked node count in CLI/log status summaries
- surface a dashboard badge if a UI session is attached
- include the exact permission or approval that could not be presented interactively
- return `status: "unavailable"` with `reason: "headless"` to tool and operation-card consumers when no interactive presenter exists
- do not offer GUI-only recovery actions such as `Open in Terminal` from a headless context; provide resume guidance, permission-preset adjustment, interactive mode change, fallback strategy when policy allows it, or an orchestrator-facing blockage

### Safe-point applicability
Run modes do not redefine `mutation_capable`. They only determine whether mutation-capable attempts may occur and therefore whether safe points are relevant in that mode.
