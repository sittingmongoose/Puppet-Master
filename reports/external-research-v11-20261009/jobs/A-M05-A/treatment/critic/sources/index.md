# critic/sources/ — navigable index

Critic-stage evidence for ER11 case S05 (block A-M05-A, arm treatment, stage critic). Immutable source IDs: predecessor research sources keep their frozen IDs S01–S18 (never rebound; see `research/source-map.json`); critic-obtained sources continue the ID space as C01+. Access method: read-only HTTPS fetches of public primary sources, treated as data; no executables downloaded.

## Critic-obtained sources (this stage)

- [C01 — all-MiniLM-L6-v2 model card spot-check](C01-minilm-card-spotcheck.md) — live 2026-10-09T20:11:00Z; confirms the 256-word-piece truncation sentence, 384 dims, 22.7M params, apache-2.0. Verdict: CONFIRMED vs S09.
- [C02 — SQLite FTS5 documentation spot-check](C02-sqlite-fts5-spotcheck.md) — live 2026-10-09T20:11:00Z; confirms bm25 k1=1.2/b=0.75 hard-coded, unicode61 diacritics default, external-content trigger responsibility. Verdict: CONFIRMED vs S01, with one minor nuance recorded (remove_diacritics=1 multi-diacritic limitation).

## Inspected predecessor evidence (not re-fetched; verified by content inspection)

All 18 files under `../research/sources/` were read in full this stage and cross-checked against the draft's claims; SHA-256 and per-file verdicts are recorded in `../claim-verification.md` and the `inspected_predecessor_evidence` array of `../source-map.json`. Raw files were not copied here (bounded-evidence rule): the critic retains only verdicts, quotes needed for findings, and hashes pointing at the frozen predecessor files.

Key inspection outcomes feeding the critique (see claim-verification.md for the full table):

- 16 of 18 evidence files fully support the draft claims that cite them (verbatim quotes match).
- S18: the P3 "issues related to EXIF metadata parsing" quote is **not present** in the retained evidence — verification gap.
- S01: discovery's SQLite 3.44.x–3.51.x release-chain claims are **not retained** in the evidence file — verification gap.
- S15: the "change = new dated assertion" pattern is the evidence note's own design inference, not a fact of the RightsStatements data model — inference-presented-as-evidence.
- S16: the retained evidence's own tally note is arithmetically muddled ("6+9+5" labeled 19; 6+9+5=20) — label-count uncertainty is real but the note is sloppy.
