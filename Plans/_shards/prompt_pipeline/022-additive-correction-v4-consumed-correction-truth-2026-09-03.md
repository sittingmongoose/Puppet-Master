# Shard 022: Additive Correction v4 — Consumed Correction Truth (2026-09-03)

Source: `Plans/Prompt_Pipeline.md`

Source lines: L5679-L5698

Source SHA256: `cbda2ffd980a861f82ffab67431b1190940e9227a2d3302a8337a726502f14b7`

---

## Additive Correction v4 — Consumed Correction Truth (2026-09-03)

This pipeline **consumes** the correction; it owns none of these records.

- **Question budgets** (`QMAX-005..014`, owner `Plans/Assistant_Plan_Runtime.md`): the pipeline
  emits a `QuestionItem` only after the owner admits it. A question resolvable from a prior
  answer in the thread or in imported planning context is deduplicated before admission, and a
  fact resolvable through admitted files, tools, repository inspection, or research is routed to
  research rather than to the user. At the ceiling the owner returns
  `question_budget_exhausted`; the pipeline continues to synthesis and persists no extra item.
- **Held BrainStorm requests** (`MODAL-012`): a natural-language BrainStorm invocation is held
  **before** provider dispatch while configuration opens. On cancel the exact request text and
  attachments return to `ComposerBuffer`; the pipeline never dispatches it with defaults.
- **Attachment and component materialization** (`FOLDER-004`, `FOLDER-008`, `BSTALE-006`): a
  folder contributes bounded content selected from its manifest, never a recursive dump, and the
  materialization receipt records what was included and omitted. A component chip carries
  structured identity into admission rather than a flattened text token, and the manifest and any
  extracted content keep separate identities.
- **Provider control truth** (`PART-024`, `SMSG-011`): requested versus effective identity is
  carried through, never smoothed over. The pipeline does not choose a substitute route.
