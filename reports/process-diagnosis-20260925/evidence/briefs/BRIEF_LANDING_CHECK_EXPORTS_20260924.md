# Brief: key truncated subchecks from their validator exports (2026-09-24)

You are an Opus 5 agent dispatched by the "PM Low cost/complexity process" thread. The External Research thread owns scripts/pm-landing-check.py and reads only the report. Acceptance: the deterministic checks below plus one blind form-driven review by a fresh agent of the dispatching thread (form: ~/PM-Experiments/jev-pilot-20260917/wave3/trial/INSTRUCTIONS_REVIEWER.md), cycle cap two, leftovers as open questions in the report. Read /mnt/Cursor/PuppetMaster/AGENTS.md first; keep the standing rule, preflight and landing lock exactly as in BRIEF_LANDING_CHECK_RULES_20260924.md beside this file. Progress note at ~/PM-Experiments/landing-check-exports-20260924/PROGRESS.md after every step.

## Defect

On branch plans/ea-certified-anchors-20260924 rebased on b3169c48d9 (edits Goal_Runtime_System.md and storage-plan.md), validate_plan_graph rises from 1 to 133: 132 artifact_hash_stale rows against Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/evidence.json for the two edited documents, plus main's one pre-existing missing_ref (reviewer export: ~/PM-Experiments/review-ea-anchors-20260924/chk-validate-plan-graph-export-rebased.json). artifact_hash_stale is a staleness kind, but 133 exceeds the 100-row print cap, the subcheck counts as truncated, the only truncated-rise exemption is the readiness set, and the check exits 2. As written, no edit to a document whose rows in that bundle exceed the cap can land between reseals, which is the staleness the rule says never stops a landing.

## Repair, and nothing beyond it

1. For every subcheck whose validator can write a complete export of its rows, the landing check obtains that export in the same run (invoke the validator's export option itself, or read the export it writes), verifies the export's row total equals the printed total for that subcheck, and keys every row from the export. Such a subcheck is not truncated: the existing kind rules apply (staleness excused, pre-existing or improved counts never block, a rise in a non-staleness kind on a touched path blocks). Enumerate which subchecks have exports by reading pm-plans-verify.py, not by guessing; print the list in the run header.
2. When a subcheck has no export, or the export total disagrees with the printed total, or the export step times out, the truncated rule applies as today, and the printed report says which case and why.
3. The two readiness exemptions and everything landed at b3169c48d9 stay as they are.

## Evidence and tests

Replay the reviewer's export above through the classifier as a test fixture: 132 artifact_hash_stale rows on edited documents plus one pre-existing missing_ref must yield exit 1 with the rows listed as staleness and the missing_ref as pre-existing. Negative: the same 132 rows with a non-staleness kind on a touched path exit 2. Mismatch: export total differing from the printed total falls back to the truncated rule with the reason printed. The two 2026-09-21 replays and the b3169c48d9 record still give their recorded results. Existing tests pass; any new test file gets its own !/tests/test_pm_<name>.py line in .gitignore and git ls-files must name it. Update reports/landing-checks/README.md (which subchecks are export-keyed, and the mismatch fallback).

## Rule text (conditional)

Only if the dispatching thread's go states that Jared explicitly requested it: in AGENTS.md and .claude/CLAUDE.md, add one sentence to the truncation bullet, identical in both: "A subcheck whose validator writes a complete export is keyed from that export when the export's total matches the printed total, and is then not truncated; the check prints which subchecks were keyed this way." While there, replace the quoted first-baseline figure ("8,800 of the 9,807") with no figure, keeping the sentence that says the check prints what is truncated and how many rows that leaves unkeyed. Without that statement, skip this section.

## Land and report

Land under the lock per the rules brief, with the landing record as reports/landing-checks/LANDING_20260924_LANDING_CHECK_EXPORTS.md in the landing commit. Report: main hash, subchecks now export-keyed, the ea-certified-anchors replay's exit before and after, tests added, review findings fixed and open. State that you are an Opus 5 agent.
