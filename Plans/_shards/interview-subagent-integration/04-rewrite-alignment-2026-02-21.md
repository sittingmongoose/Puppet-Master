## Rewrite alignment (2026-02-21)

This plan's interview-phase semantics remain authoritative. Implementation should target the rewrite described in `Plans/rewrite-tie-in-memo.md`:

- Platform runners should converge on **Providers** that emit a normalized streaming event model
- Interview research/validation/doc generation outputs should be stored as **artifacts/events** (seglog → projections)
- Crew/hooks/lifecycle concepts referenced here should be implemented once in the shared core and reused

### Interview persistence and events (storage alignment)

- **Seglog:** Emit to seglog: interview start/end, phase start/end, research/validation/document-generation completion, handoffs, and any event needed for replay or search. Interview artifact events (e.g. doc generated) should be first-class in the event model so projectors can index them (e.g. Tantivy).
- **redb:** Persist in redb (per storage-plan.md): **interview session** (interview id, project, status, phase plan); **interview run** or phase-level progress for resume; **checkpoints** at phase boundaries. Replace or project file-based state (e.g. active-subagents.json, phase state) from redb where possible so resume and recovery use the same store as the rest of the app.
- Existing file-based persistence (.puppet-master/memory/, .puppet-master/interview/) should be migrated to or projected from seglog/redb so interview state is part of the canonical storage stack.

### Interview concurrency caps

Interview-mode spawning MUST respect the global execution limits defined in `Plans/orchestrator-subagent-integration.md`.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Run_Modes.md

Global limits that still apply to interview runs:
- `maxConcurrentCrewsPerPlatform = 4`
- `maxConcurrentAgentsPerCrew = 8`
- `maxTotalActiveAgents = 32`
- `maxNestingDepth = 4`

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Crosswalk.md

**Multi-Pass Review reviewer cap:** `max_subagents_spawn` (default 3, configurable within its own range) limits reviewer parallelism inside one Multi-Pass Review operation. It is an additional narrowing cap, not a replacement for the global orchestration limits.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/orchestrator-subagent-integration.md

