# Offline external-research repair v1

Both authorized repairs are implemented and tested in new experiment-owned
files. This is development evidence, not a new candidate result or a quality
pass. The next matched investigator comparison is prepared and unauthorized.

## Changes

`tools/delivery.py` adds a complete-finding JSON carrier, draft-only renderer and
explicit verifier-decision assembler. Stable finding and part IDs keep source
fit, conditions, implications, Plan fit, proposed validation and uncertainty
together. Draft-only output stays UNVERIFIED. Every reviewed part needs an
explicit decision; omission, conflict, unknown records and malformed input are
visible. Removed/replaced material remains in history. Validation proposals
remain UNEXECUTED and cannot be disposed of through `not_a_claim` or retagged as
execution proof. This new boundary leaves frozen Markdown parsing and runners
intact; it does not convert old outputs into new scored inputs.

Absence checks cover decision reasons, retained/replacement text, new findings,
non-findings and negative titles. A bounded packet records scope, actual context,
search variants/results and direct source evidence. Search-only and inconclusive
arguments cannot support removal or asserted replacements. Unsupported rejection
leaves the original and challenge visible as unresolved. Known title/search/
secondary-summary-only evidence cannot substantiate a specification override.
Unexpected free-text additions are retained as diagnostics instead of silently
discarded. These gates are structural; lint and filled fields never establish
semantic truth.

## Verification

| Check | Result | VM evidence |
|---|---|---|
| Existing R1b offline regressions | 62 passed; no skips/failures | `evidence/baseline-unittest.log` |
| New changed-boundary regressions | 26 passed: 14 owner + 12 independent | `evidence/repair-unittest.log` |
| Independent Sol development check | boundary defects fixed and retested; limits recorded | `evidence/independent_review.md` |
| Preparation identities, prompt composition, caps and disabled launch | pass; 129 corpus files | `evidence/preparation-check.json` |
| Current R1b policy and report copies | 26/26 pins; 14/14 compared report files match | `evidence/baseline-summary.json`, `evidence/baseline-report-compare.json` |
| Preservation | 3403 pre-existing files unchanged; none missing or newly added outside development | `evidence/frozen-preservation.json` |

Commands run from the lab:

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest tools/r1b/test_r1b.py -v
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s offline-repair-v1/tools -p 'test*.py' -v
python3 offline-repair-v1/check_preparation.py
```

Original fixture tests ran against available VM inputs, not reconstructed
fixtures. Existing evaluator key/scoring bytes match their established hashes;
their content was not copied into candidate material. The older R1 policy has
two pre-existing stale pins (recorded in baseline evidence); current R1b pins
match and no historical pin was changed. Live candidate/evaluator runs, formal
quality grading and end-to-end verification are NOT RUN. No plan-governance
checks are needed for this experiment-only change.

## Diagnosis and next trial

`DIAGNOSIS.md` separates acquisition, incomplete derivation, draft narrowing and
verification loss. M source-image linkage and Z general endianness were already
captured; M zero-fill was captured but conflated, and Z transpose/sharding was
only a title-level lead. The frozen whole-reference grades and measured usage
remain unchanged. Fewer reads did not establish savings; bundle-first work is
retired from active optimization.

`NEXT_TRIAL.md` and `proposal.json` predeclare one matched investigator pair per
app: observations-then-draft versus maintained complete findings plus rendered
report. Corpus/Plan/app/model/Max/access and finite caps are held fixed. Four
candidate slots plus two independent Opus slots are proposed, no retries.
Acquisition and preservation are measured separately; the corrected flash
verifier is a later, separately authorized test. Prompt length, rendered format,
possible partial unblinding and the familiar single case are disclosed limits.

## Files and authority

The lab path is
`/home/sittingmongoose/PM-Experiments/external-research-v6-20260926/offline-repair-v1/`.
`CHECKPOINT.md` is the compact continuation handoff. `PATCH.diff` contains new
source/docs/prompts as an additive lab patch; `MANIFEST.sha256.json` binds the
new development files and logs by relative path plus SHA-256. `historical-evidence.json`
binds the cited published history by absolute path and SHA-256. Only compact
reporting is copied into the research worktree; raw evidence and experiment code
stay on the VM. No launch approval, commit or push occurred.

Development used explicitly configured Sol/high and Sol/medium helpers under
the requested Astra/xhigh orchestration. Observable effective settings and
development provider token/cost totals are unavailable; native request settings
are recorded in `usage-lanes.json`. New candidate and evaluation calls are zero.
The live user request authorized these offline changes only. Stop here pending
a separate decision on the frozen proposed trial.
