# Shard 018: Route Context and Attention Destination Rules

Source: `Plans/agent-rules-context.md`

Source lines: L295-L301

Source SHA256: `af088bfdefbd05fb66d86da2f524238b1f51e9006f900ca84a88fc982b910b97`

---

## Route Context and Attention Destination Rules

The existing `resume_url` pattern is the precedent for precise recovery routes: wizard and thread flows preserve a stored deep link, and the same internal payload model must generalize beyond wizards so project-level attention objects can route to Orchestrator, Chat, Source Control, GitHub, Usage, or Settings. Agent rules context records the instruction-bundle consequences of those routes; the route contract layer owns the controlled coarse destination enum/family.

Concern-specific future record/action docs are not instruction-rule sources yet. `Plans/Orchestrator_Page.md` and `/Orchestrator_Page.md` remain `/action` consumers for concern and attention workflows, while this doc only carries the context needed for scoped instructions, route-aware recovery, and project-level handoff.

Historical `/current` run switching must not change layout identity. Layout scope remains project-level rather than run-level, so route context may focus a historical or current run without rewriting the instruction/rules target identity.
