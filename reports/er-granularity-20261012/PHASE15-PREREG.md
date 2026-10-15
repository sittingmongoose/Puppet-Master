# Phase 15 pre-registration — scale-optimized stack (2026-10-14)

Changes vs Phase 13 (each traced to evidence): dossier-first extraction
(records reused from `dossiers/` JSONL store — no SQLite anywhere, per
Jared and Plans/storage-plan.md's seglog/redb + JSONL pattern);
picker-preselected slice inputs as default; slice-level entailment
audit BEFORE integration; mutation expected-result adversary; full
repair budget (≤3 rounds, used until critics dry or budget exhausted);
per-stage measurement (contexts, input/output bytes, wall time).
Unchanged: held-out caseC frozen before work; gold-free skeleton;
host-rendered quotes; one-file critic contexts; Sol arm on same bundle
as bar; gold by Sol post-freeze; double blind grades by Astra Max.
Success criteria as Phase 13 (zero confirmed MEs; diagnostic ≥ Sol−5),
plus efficiency reporting vs the Phase 13 baseline (contexts, bytes,
wall time). Discovery shortlist pre-declares forced inclusions:
Syncthing (transport in plan clause 1), Automerge (local-first donor
already in dossiers from Phase 12 discovery), restic (backup donor).
Dossier reuse is measured: every slice question is first run through
`er_records.py gapcheck`; questions with ≥3 record hits are answered
from records by the comparisons stage and get NO new slice unless the
records lack a deciding condition.
