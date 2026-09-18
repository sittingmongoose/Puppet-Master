# Jev pilot (read-only shadow mode), created 2026-09-17

Purpose, rules, families, bars and sequence: `PLAN/JEV_PILOT_PLAN_v2_20260917.md` as amended by `PLAN/JEV_PILOT_PLAN_v2.1_AMENDMENTS_20260917.md`; reviews in `PLAN/PLAN_REVIEW.md` and `PLAN/PLAN_REVIEW_v2.md`; background in `PLAN/JEV_ASSESSMENT_20260917.md`.

Layout:
- `snapshot/` read-only `git archive` exports: `main-a6162b559b` (Plans, scripts, reports) and `bc7569b3f5-plans` (the frozen Jujutsu baseline); `SNAPSHOT.json` hashes every file.
- `inputs/` copied evidence with `MANIFEST.sha256.json`: the frozen Jujutsu case (`jujutsu-d1-case`, freeze receipt inside), continuation-3 premium and hybrid arm notes, continuation-4 six-arm notes, Jared's recorded answers.
- `labels/` evaluator labels and disputes; never indexed by retrieval, never in a payload.
- `jevlab/` the adapter: `client.py` (egress check, size check, cache, reservation meter, receipts), `meter.py`, `cache.py`, `egress.py`, `stats.py`, `stub_server.py`, `selfcheck.py`, `probe.py`.
- `runs/` `ledger.json` (spend, reservations, unresolved liabilities) and `receipts.jsonl` (one line per call, never payload content).
- `cache/` response cache keyed by (requested model, epoch, canonical request) plus the pip cache; `tmp/` TMPDIR.
- `reports/` PROBE.md, CALIBRATION.md, REPLAY.md, FINAL.md.

Rules in force: nothing outside this directory is written; the shared checkout is read-only; no Plans edits, no landing, no Codex; Jev cap $50 enforced by the meter on estimates (not an invoice guarantee); the API key lives only at `~/.config/typesafe/api.key` and is never printed or logged; results are shadow-mode triage evidence only.

Run: `source env.sh` then `.venv/bin/python jevlab/selfcheck.py`; the live probe is `.venv/bin/python jevlab/probe.py`.
