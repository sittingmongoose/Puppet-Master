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

When spawning interview subagents (phase subagents, research, validation, document generation, Multi-Pass reviewers), the interview phase manager must respect the **effective per-provider cap** for the Interview context: the Interview-context override if set, else the global default (see `Plans/FinalGUISpec.md` §7.4.7). This prevents both provider rate-limit errors and dev-machine overload. Note: the existing "max review subagents" setting (1-10, default 3) limits how many reviewer subagents participate in a single Multi-Pass Review run — it is a separate, complementary concern to per-platform concurrency caps.

