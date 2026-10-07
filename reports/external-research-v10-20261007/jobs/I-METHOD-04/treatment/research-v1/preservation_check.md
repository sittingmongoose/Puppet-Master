# Candidate preservation check — I-METHOD-04 research-v1

Status: complete. The renderer exited 0 and retention assertions passed. This is the candidate's substantive completeness review, not the renderer's structural guarantee.

## Full scope and plan check

- O1: brief-led public-source discovery was completed before reading the frozen plan; findings and negative/optional leads are retained.
- O2: actual BWF MetaEdit code is pinned to v26.08 commit `318d800d92c4a3cc8a814f6fdceba0ed8b3416ec`; handler, parser, data-size and governing field definitions/caller are mapped.
- O3: PR #207 → issue #214 → fix PR/commit #218/8337405 → v26.08 current source is retained. Manual retest is distinguished from automated regression evidence; v21.07 release-tag lookup failure is stated.
- O4: P1 through P6 each have an exact `plan.md` section/line reference and a retain/refine/conditional disposition in `proposed_change_document` and `PLAN_CROSSWALK`.
- O5: fresh same-family criticism is explicitly pending; no criticism was invented.
- O6: `proposed_change_document` contains the complete replacement P1-P6 plan, rationale, source references, alternatives, conditions, already-covered items, rejected leads, validation proposals, open decisions and uncertainty.
- Frozen product constraints remain: one archivist, up to 100 files, WAV/BWF/FLAC/MP3 in the proposed initial scope, offline Windows/Linux, no upload, no source metadata write on display, no transcription/public publishing, and no automated rights decision.
- Proposed checks are separated from performed work. No app was built, installed, or validated; research source inspection and the requested renderer/preservation witness are the only executed checks.

## Semantic-to-view retention check

After rendering, the checks confirmed that the output contains every finding ID; each finding's summary, disposition, complete conditions, evidence, options, optional leads, validation, uncertainty and sources; and the exact raw UTF-8 `semantic.json` payload. Verify that the complete candidate-authored `proposed_change_document` remains in that exact-input payload and that all O1-O6/P1-P6 labels remain present. The M14 renderer only projects fields; this check is the candidate's review that the full meanings and governing conditions survive its views.

## Result

Executed: renderer exit 0; 8 unique finding IDs; every required field and each field string appears in the mechanical projection; exact raw semantic JSON is retained; P1-P6 and O1-O6 appear in the complete authored plan; all 20 source-map capture paths exist. No scientific application tests were performed.
