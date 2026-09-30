# Reproduce and inspect

Start at [results](RESULTS.md), [methods](methods.json), [attempts](attempts.jsonl), and [source freeze](cohort-evidence/source-freeze.json). Candidate directories contain the actual frozen deliverables, exact Goal and TASK text, prospective configuration and input hashes, output integrity, separated metrics, and selected exact native receipt fields. Missing artifacts are enumerated rather than regenerated. T01 aggregate is mechanical concatenation of the two actual control bodies.

The original isolated lab is `/home/sittingmongoose/PM-Experiments/external-research-v7-20260930`; raw evidence is available there by path plus SHA-256 only. Large source captures, sealed keys and full native conversations are deliberately excluded from Git. Development cases exposed by publication cannot become a fresh sealed holdout. Candidate search excludes this campaign’s results.

`machinery/publish_resume_cohort.py` records the cohort import logic and verifies consumed stager manifest bindings and output hashes. It is a publication helper, not a scored candidate or a live admission tool. Rerunning it against a changed lab creates a new snapshot and must not be used to overwrite historical evidence silently.

Relevant accepted methods machinery and its pinned implementation manifest are in `machinery/methods-v1/`. Offline code/tests validate mechanical boundaries, not candidate research quality. Native receipts demonstrate fresh Goal entry, effective model/effort, completion or failure, usage exposure and quiescence. Full offline verification is recorded in `cohort-evidence/publication-checks.json`.
