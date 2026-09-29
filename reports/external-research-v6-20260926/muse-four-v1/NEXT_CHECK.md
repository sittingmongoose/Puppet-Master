# Proposed FOUR-M — one four-submission Muse check

**Not authorized by this preparation.** A separate explicit Go must identify this published commit and SOURCE_PINS.json SHA-256. No approval file, account probe, smoke, candidate or evaluator call is created now. Only the host may send the frozen task's “authorized now” wording, after actual Go and pin/setup checks.

One fresh Muse Code / Muse 1.3 Contributor Max native `/goal`, requested `muse-spark-1.3-contributor` / `max`, unchanged driver and no-shell wrapper. Astra xhigh orchestrates; Sol medium/high may assist bounded development/mechanics. No other app, slot or semantic reviewer.

| Limit | Frozen value |
|---|---:|
| Native wall time / parent responses | 300 seconds / 48 |
| Whole check, actual host-observed new Go through confirmed publication | 390 seconds |
| Host reserve, **included** in 390 | 90 seconds |
| Setup refusal | dispatch must start within 10 seconds of that Go |
| Payload attempts / markers, invalid attempts included | 4 / 4 |
| Per payload | 4096 UTF-8 bytes |
| Fresh slots / manual retries / replacements / extra corrections | 1 / 0 / 0 / 0 |

The larger Store capacity grants no extra attempt. Keep native internal retry behavior unchanged; every wait consumes the original clocks. Never reset, backdate, pause, subtract or extend time. The Go epoch is captured when the host first observes the **new** authorization, not when convenient dispatch begins. All post-Go reading, staging, checks, execution, cleanup, audit, reporting and confirmed publication count. If setup fails, stop before inference and preserve refusal; no second setup/slot. Bounded cleanup is unchanged. Missing nonessential telemetry remains unknown; required structural evidence cannot be assumed.

## Exact work and evidence

Use all bytes of [the four templates](inputs/templates) and [task](inputs/task.txt). Batch the two initial payload Writes (`new--batch-01`, `new--independent`); after both results, batch both markers. Read both structural receipts. Use the target's returned identity for revision 1; payload result, marker result, valid receipt; then revision 2 in the same order. Read final status and finish the Goal truthfully. Independent current content must remain unchanged.

Required: four VALID_UNVERIFIED acknowledgements, eight exact matching snapshots, exact native correlation, payload-before-marker completion, snapshots/state-before-receipt publication, completed receipt reads before dependent revisions, target revision 3 current with both previous versions retained, independent revision 1 unchanged, and a completed native Goal. Errors, pending attempts, invalid latest content and caps remain fail/incomplete; no repair or replacement. Initial batching and marker overlap are observations; the former six-marker overlap gate is not imported. A pass covers only this declared structural task; never add it to A2 to claim a retrospective nine-submission pass or semantic qualification.

## Prepared invocation and publication path

These are future commands, **not current authorization**. The host supplies `PM_FOUR_GO_EPOCH` captured at first observation, the exact authorization reference, approved commit, and approved manifest hash from the later Go. Do not derive the epoch again. The direct-child run root and result directory below must not exist. No code adaptation, additional test campaign or investigation belongs inside the ten-second setup window.

```bash
set -e
PM_FOUR_LAB=/home/sittingmongoose/PM-Experiments/external-research-v6-20260926
PM_FOUR_REPO=/home/sittingmongoose/pm-worktrees/external-research-v6-20260927
PM_FOUR_RUN="$PM_FOUR_LAB/four-m-01"
PM_FOUR_OUT=reports/external-research-v6-20260926/four-m-01
python3 -B "$PM_FOUR_LAB/muse-four-v1/tools/run_check.py" \
  --run-root "$PM_FOUR_RUN" --label FOUR-M \
  --authorized-commit "${PM_FOUR_COMMIT:?approved commit required}" \
  --source-pins-sha256 "${PM_FOUR_FREEZE:?approved manifest SHA-256 required}" \
  --authorization-reference "${PM_FOUR_AUTH_REF:?actual Go reference required}" \
  --orchestration-started-epoch "${PM_FOUR_GO_EPOCH:?original observed Go epoch required}" \
  --result-dir "$PM_FOUR_REPO/$PM_FOUR_OUT"
```

The operator preserves launch input, templates, identities, dispatch arguments and one persistent phase clock before inference. Automatic audit and report creation follow quiescent native closure. `compact-result.json` and `structural-audit.json` include actual result/limitations; raw journals, snapshots, partial files, advisories and pending/failed attempts remain on the VM by path/hash. Missing/failed automatic reporting is explicit incompleteness, never permission to rerun the assignment. Do not publish unrelated staged edits.

The already authorized branch publication uses these prepared commands after the two compact result files exist. A failed execution is still published as failed. Command failures stop the sequence; no force push or clock reset. `confirm` records **current actual time only after the remote ref was observed** and does not push or grant approval.

```bash
set -e
cd "$PM_FOUR_REPO"
test -z "$(git diff --cached --name-only)" || exit 1
git add -- "$PM_FOUR_OUT/compact-result.json" "$PM_FOUR_OUT/structural-audit.json"
git commit -m "Report FOUR-M structural result"
git push origin HEAD:refs/heads/research/external-research-v6-20260927
PM_FOUR_RESULT_COMMIT=$(git rev-parse HEAD)
PM_FOUR_REMOTE=$(git ls-remote origin refs/heads/research/external-research-v6-20260927)
test "${PM_FOUR_REMOTE%%[[:space:]]*}" = "$PM_FOUR_RESULT_COMMIT" || exit 1
python3 -B "$PM_FOUR_LAB/muse-four-v1/tools/report_check.py" confirm \
  --run-root "$PM_FOUR_RUN" --result-dir "$PM_FOUR_REPO/$PM_FOUR_OUT" \
  --observed-ref "$PM_FOUR_RESULT_COMMIT" --stage result
# Publish the first confirmation record; preserve later confirmation separately.
git add -- "$PM_FOUR_OUT/publication-confirmation.json"
git commit -m "Record FOUR-M actual result publication time"
git push origin HEAD:refs/heads/research/external-research-v6-20260927
PM_FOUR_ACCOUNTING_COMMIT=$(git rev-parse HEAD)
PM_FOUR_REMOTE=$(git ls-remote origin refs/heads/research/external-research-v6-20260927)
test "${PM_FOUR_REMOTE%%[[:space:]]*}" = "$PM_FOUR_ACCOUNTING_COMMIT" || exit 1
python3 -B "$PM_FOUR_LAB/muse-four-v1/tools/report_check.py" confirm \
  --run-root "$PM_FOUR_RUN" --result-dir "$PM_FOUR_REPO/$PM_FOUR_OUT" \
  --observed-ref "$PM_FOUR_ACCOUNTING_COMMIT" --stage confirmation_record
```

Execute sequentially with failure-stop shell behavior (`set -e`); do not continue publication claims after a failed command. Later confirmation is VM-only `confirmation-record-publication.json`, with its own actual epoch and same ceiling, disclosed in the final answer. First result visibility and later accounting visibility stay distinct; a later overrun remains visible and prevents an unqualified whole-check pass. No recursively published timing records.

Stop after this one check if authorized, regardless of outcome. A1/A2 stay FAIL/INCOMPLETE; I2 closed/zcode originals unstarted; V-FOLLOWON-1 OPEN; R1b Block 2 unauthorized. No semantic evaluator, model sweep, follow-on verifier, canonical/governance work or WorkNodes.
