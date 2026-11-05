# Shard 022: Named Plan consumer scope (2026-09-27)

Source: `Plans/Planning_Wizard.md`

Source lines: L1775-L1779

Source SHA256: `6799b1bf957303b9664591fc5e9ca5e894560914cfa42805c2a1f360c60c8faf`

---

## Named Plan consumer scope (2026-09-27)

Planning Wizard consumes the `NamedPlan` owner in `Plans/Named_Plan_System.md`. Its Project-aware Plan switcher and New Plan use the existing `cmd.named_plan.open` and `cmd.named_plan.create` routes. One selected Plan scopes the current primary PRD, PlanningRun, approved pack, compile and Goal lineage; it does not turn their owner state machines into a new Wizard state machine. Selecting another Plan restores its last route, tab, filters, inspector, scroll and focus without cancelling or pausing other Plans' work. A missing Plan is an explicit no-Plan state, never the currently focused run inferred as authority.

Before opening, approving, compiling or handing off a Plan-scoped child, the Named Plan owner's authoritative child resolver validates the explicit Project/Named Plan pair and exact child kind, ID, revision and content/currentness hash against the actual child-owner record and aggregate current/historical membership. A same-Project child belonging to another Plan, an orphan, stale revision/hash or wrong kind is rejected. Existing approval CAS and child-owner permissions remain required; navigation and a matching opaque reference do not satisfy these checks. Historical child inspection cannot authorize mutation of the current child. The same resolver governs PRD Builder, Plan Compile and Orchestrator; `Plans/prd_planning_runtime_contracts.json` carries their shared consumer binding.
