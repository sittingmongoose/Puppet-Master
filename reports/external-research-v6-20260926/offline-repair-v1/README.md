# Offline external-research repair v1 — GitHub review package

The user's follow-up authorizes publication for a GitHub-only reviewer.
This package includes exact frozen source, tests, prompts and the proposed trial.
Publication does not authorize any new candidate/evaluator run or R1b Block 2.

| Review material | Files |
|---|---|
| Implemented repairs | [delivery.py](tools/delivery.py), [schema](tools/SCHEMA.md), [additive lab patch](PATCH.diff) |
| Reproducible tests | [14 implementation tests](tools/test_delivery.py), [12 independent tests](tools/test_independent_boundaries.py), [88 recorded results](VALIDATION_RESULTS.json) |
| Development review | [independent findings and limitations](INDEPENDENT_DEVELOPMENT_REVIEW.md) |
| Diagnosis and next trial | [diagnosis](DIAGNOSIS.md), [trial design](NEXT_TRIAL.md), [disabled proposal](proposal.json) |
| Candidate prompts | [control](prompts/investigator-control.txt), [maintained findings](prompts/investigator-maintained.txt), [shared instructions](prompts/common.txt) |
| Later checking | [formal evaluator prompt](prompts/evaluator-i1.txt), [future flash verifier prompt](prompts/verifier-complete-findings.txt) |
| Handoff and integrity | [checkpoint](CHECKPOINT.md), [published manifest](PUBLISHED_MANIFEST.json), [original VM report](VM_FROZEN_README.md) |

From the repository root, run the portable tests with Python 3.10 or later:

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover \
  -s reports/external-research-v6-20260926/offline-repair-v1/tools \
  -p 'test*.py' -v
```

These 26 tests need no external packages, VM corpus, account or model calls.
The 62 historical regressions and `check_preparation.py` require the original
VM fixtures/runtime paths. Compact results are published; missing original data
must not be reconstructed. Raw provider logs, corpus, evaluator keys and the
full lab inventory remain on the VM. Path/hash pointers are provenance, not
access to those withheld files.

Prior context remains available in [R1b results](../r1b-block1/R1B_RESULTS.md),
the [Muse review](../r1b-block1/eval/REV-M/review.md), the
[zcode review](../r1b-block1/eval/REV-Z/review.md), and
[rev3 preparation](../r1b-prep-rev3/R1B_PREP_REV3.md).

The following development report describes the completed offline phase.

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
binds the cited published history by absolute path and SHA-256. The executable
lab remains on the VM; source/test/prompt snapshots are now included here for
review. No launch approval occurred. The original report, checkpoint and usage
record describe the pre-publication phase and retain its zero-push accounting.
The subsequent user request authorizes this research-branch publication only.

`MANIFEST.sha256.json` preserves the original VM freeze, including hashes for
withheld evidence. Its `README.md` is published as `VM_FROZEN_README.md` and its
`evidence/independent_review.md` as `INDEPENDENT_DEVELOPMENT_REVIEW.md`.
`PUBLISHED_MANIFEST.json` hashes the actual GitHub package separately and maps
published copies to the original frozen files. The patch targets the lab layout;
this report directory is a compact review snapshot, not campaign runtime.

Development used explicitly configured Sol/high and Sol/medium helpers under
the requested Astra/xhigh orchestration. Observable effective settings and
development provider token/cost totals are unavailable; native request settings
are recorded in `usage-lanes.json`. New candidate and evaluation calls are zero.
The live user request authorized these offline changes only. Stop here pending
a separate decision on the frozen proposed trial.
