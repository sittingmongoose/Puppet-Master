# Replan v8 A1: author decisions for the canonical-draft package, 2026-09-25

A1 installs `pm.executor.workflow_source.all_writers.v8`, with its Stop route, into canon. It does this through a canonical-draft package in `sittingmongoose/PuppetMaster-Packages` at `replan-v8/goal-replan-v8-canonical-draft-20260925/v1`, which is reviewed before canon is edited. The package carries the full design as `design/A1-canonical-draft-design.md`, with its six evidence notes (U1 to U6), all read-only syntheses against `main` `a6480b0f7c`. The design lists 23 open design questions (O-01 to O-23), each with a default. This record states how each is settled.

**Ratified by Jared on 2026-09-25, in conversation with this thread.** He was shown each process question with its default ("I am good with your recommendations on all these questions"). He answered for the PM Low cost/complexity process thread, which holds authority on process questions (answers of 2026-09-25, `616f12bfd`).

| ID | Question | Settled as |
|---|---|---|
| O-01 | Descriptor codec | The CV-352 codec: SHA-256 of sorted-key compact UTF-8 JSON, no prefix, no trailing LF. The v8 `/static_profile_domain` is restated so that the transported bytes are that serialization |
| O-02 | The three decide-first choices (A0 P-09, P-10, P-11) | P-09: bind canon's certified descriptors `0055de6c…` (coordinator, all_writers.v7) and `599315856…` (producer native-v7); the external `48c8ae3b…`, `e9f563c6…` and `d36cefb6…` become lineage. P-10: the 47 frozen `13e7dbc0` pins and the exact passages stay external lineage, and a canonical `source-citations.json` is pinned at the base. P-11: rename exactly the draft-marked identifiers A1 owns, for example `draft.replan.*` → `owner.workflow.replan.*.v1` and `draft_replan_*` → `workflow_replan_*`; keep every other identifier byte-exact |
| O-03 | Form of external lineage | `external-source-evidence:sha256:` tokens only, the v7 pattern |
| O-06 | The replanned payload identity | Kept as a frozen literal, `…/drafts/goal_run_replanned_clock_split_20260921.v4`, allowlisted and marked "not a registry selection; A3 owns the payload successor" |
| O-08 | `combined.*` method names | Kept as authored |
| O-10 | Directory layout | `Plans/workflow_combined_source_contracts/` (with `coordinator/`, `producer/` and `replan/`), plus `Plans/workflow_standard_source_contracts/native-v8/` |
| O-15 | Projection and checkpoint | None registered in A1. Replan release stays unavailable until A2, and A2 and A3 agree one `goal_run_projection` successor chain |
| O-18 | Unit style | 13 units in the precedent's form: EP-125 to 127, GRS-086 to 089, CV-353, SP-320 and 321, ATS-058 and 059, BRS-030 |
| O-19 | Citation scope and pin form | Relied-on passages plus a census summary; `whole_sha256_at_base` pins |
| O-21 | The stale diagnostic `original-bank-checks.json` (A0 R-05) | Recorded as a known stale diagnostic, not regenerated |
| O-23 | Pre-correction v6 bodies `3b345f46`, `f3dfe92c` | External only |

**Review questions.** O-04, O-05, O-07, O-09, O-11, O-12, O-14, O-16, O-17 and O-22 take the design's defaults in the build. The package's independent review and the root review adjudicate them.
- O-04: producer v3 binds canon's transformed `whole-field-bindings` `17289d7f…`.
- O-05: the five helper definitions are inlined.
- O-07: the six unreferenced `Physical*` legacy wrappers are deleted, and the inverse records it.
- O-09: 9 route headers are kept and the 2 the package bumps are bumped, subject to a review proof of nested wrapper equality.
- O-11: key irregularities are kept as authored.
- O-12: candidate producer and consumer sets.
- O-14: compiled as the source states, activating nothing.
- O-16: v8 certified Storage admission is unavailable, and SP-316 is untouched.
- O-17: compiled as stated, with the rest recorded.
- O-22: the `record_stop`/`read_stop` pointer stays at EP-118.

**Product questions, carried open.** A1 needs neither answered.
- **O-13.** One proposed family keeps a full `WholeGraphPatch` under `RP-AUTHORITY-INDEFINITE`, while a sibling family's own lifetime rule speaks of content-free graph-patch metadata, and `ProducerIntent` uses `RP-RUNTIME-365D`. Retention is Jared's under DL-045. If the independent review finds that the authored retention cannot stand, the question goes to Jared as a DL-036 card.
- **O-20.** This is A0's Q-01: are "child goal runs" (`required_child_goal_run_ids`) a current Workflow-run concept under Goal V2? The field is carried as inherited, and the question stays open for the Goal Runtime owner.

**Base.** The design was scoped against `a6480b0f7c`. Since then `main` has moved to `1e5d9b097`. The only non-derived Plans file that move changed is `Section15_MVP_Promoted_Features_Spec.md`, from the Browser SP-286 landing, which A1 does not edit. Relied-on passages are re-verified at the base A1 rebases onto (design check C11).
