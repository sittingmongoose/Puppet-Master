**TERMINAL — GLOBAL ELAPSED ENVELOPE EXPIRED.** Fixed deadline: 2026-10-01 02:06:46 UTC. The October 1 17:24:38 UTC continuation arrived 15h 17m 52s after that deadline; restart pauses do not reset it. No candidate, experiment, evaluation or integration work is admitted. Further research requires a new explicit budget envelope.

[Terminal readout and limits](TERMINAL.md).

# Reproduce and inspect

Start at [results](RESULTS.md), [methods](methods.json), [attempts](attempts.jsonl), and [source freeze](cohort-evidence/source-freeze.json). Candidate directories contain the actual frozen deliverables, exact Goal and TASK text, prospective configuration and input hashes, output integrity, separated metrics, and selected exact native receipt fields. Missing artifacts are enumerated rather than regenerated. T01 aggregate is mechanical concatenation of the two actual control bodies.

The original isolated lab is `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930`; raw evidence is available there by path plus SHA-256 only. Large source captures, sealed keys and full native conversations are deliberately excluded from Git. Development cases exposed by publication cannot become a fresh sealed holdout. Candidate search excludes this campaign’s results.

`machinery/publish_resume_cohort.py` records the cohort import logic and verifies consumed stager manifest bindings and output hashes. It is a publication helper, not a scored candidate or a live admission tool. Rerunning it against a changed lab creates a new snapshot and must not be used to overwrite historical evidence silently.

Relevant accepted methods machinery and its pinned implementation manifest are in `machinery/methods-v1/`. Offline code/tests validate mechanical boundaries, not candidate research quality. Native receipts demonstrate fresh Goal entry, effective model/effort, completion or failure, usage exposure and quiescence. Full offline verification is recorded in `cohort-evidence/publication-checks.json`.

Final grading cohort: [source freeze](cohort-grading/source-freeze.json) binds all independently frozen assessment JSON/Markdown files, opaque current report wrappers, preservation readouts, T14 outputs and preparation exports. `machinery/publish_grading_cohort.py` records import logic. Reviewer wrappers may expose task/condition cues; the exact reviewed bytes are published beside the exact native candidate artifact rather than silently rewriting either.

[Preparation inventory](cohort-grading/prepared-method-inventory.json) links accepted prospective cards/code/compact source metadata and excluded corpus pins. It contains no native candidate execution. Some laboratory scripts require their original pinned lab layout; do not execute preparation scripts in the publication export to infer trial results. Final publication checks are in `cohort-grading/publication-checks.json`; preparation-only offline receipts remain independent review evidence.

Latest [source freeze](cohort-preservation/source-freeze.json) binds six preservation assessments, two partial current assessments and exact summaries. `machinery/publish_preservation_cohort.py` verifies prior current grades against before/after pins. Private holdout audit is exported only as a minimal status projection; no omission aid, facet details, source selection or preexecution key is included. Checks are in `cohort-preservation/publication-checks.json`.
