# Offline external-research repair v1 — I1-1 amendment

The bounded current-report/history and acquisition-inventory amendment is
complete and published for the GitHub-only reviewer. **I1 remains prepared and
unauthorized.** No candidate calls, formal evaluations, account probes or launch
approval were made. R1b Block 2 remains unauthorized.

Start with [I1-1 closure and checkpoint](I1_AMENDMENT.md), the
[independent development review](I1_INDEPENDENT_DEVELOPMENT_REVIEW.md), and the
[compact validation record](I1_AMENDMENT_VALIDATION.json). The
[review request](I1_REVIEW_REQUEST.md) is preserved exactly as provided; its
referenced reproduction bundle was not attached or rerun here.

| Review material | Files |
|---|---|
| Current report and separate audit | [delivery.py](tools/delivery.py), [schema and usage](tools/SCHEMA.md) |
| Evaluator staging | [copy helper](tools/stage_i1.py), [four amendment regressions](tools/test_i1_projection.py) |
| Unchanged portable regressions | [14 owner tests](tools/test_delivery.py), [12 independent tests](tools/test_independent_boundaries.py) |
| Prospective candidate prompts | [control](prompts/investigator-control.txt), [maintained](prompts/investigator-maintained.txt), [unchanged common instructions](prompts/common.txt) |
| Trial and evaluation | [trial design](NEXT_TRIAL.md), [disabled proposal](proposal.json), [evaluator prompt](prompts/evaluator-i1.txt) |
| Deferred verifier defect | [V-FOLLOWON-1 status](FOLLOW_ON_VERIFIER_STATUS.md) |
| Current identities | [amendment freeze](I1_AMENDMENT_MANIFEST.json), [incremental lab patch](I1_AMENDMENT.diff), [published file hashes](PUBLISHED_MANIFEST.json) |

The maintained arm's designated final now contains all current finding parts,
including uncertainty, UNEXECUTED validation proposals and source provenance.
Raw originals, revision history and snapshots remain separate audit artifacts.
The control prompt also saves history separately before inference. There is no
post-hoc semantic cleanup of an authored report.

The same two proposed Opus reviewers first assess current reports against the
fixed case/key, save and fix their judgments, then inspect acquisition/history
in the same assignment. This is **prompt-only chronology in one readable
workspace**, with no filesystem access barrier or host-enforced mid-run lock.
Contamination or unavailable chronology must be reported. Acquisition uses
each arm's actual chronological records; missing early records can make the
temporal denominator `not_recoverable`. Mechanical render fidelity and semantic
preservation across investigation are separate outcomes.

**V-FOLLOWON-1 is OPEN: NOT QUALIFIED FOR FOLLOW-ON VERIFIER USE.** The overbroad
absence trigger is unchanged. It does not run in I1 and is not an extra I1
prerequisite. The original future-verifier prompt remains historical development
material, not authorization or evidence of qualification.

## Reproduce the portable checks

From the repository root, with Python 3.10 or later:

```sh
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover \
  -s reports/external-research-v6-20260926/offline-repair-v1/tools \
  -p 'test*.py' -v
```

All **30 tests pass**: the original 26 are byte-identical, plus four amendment
tests. These need no external packages, VM corpus, account or model calls.
The sentinel regression checks that superseded-only history is absent from the
current report/package and present in deferred audit, while current uncertainty
and proposed validation remain visible. Synthetic passes establish record and
presentation behavior, not semantic research reliability or end-to-end results.

`check_preparation.py` requires the original VM corpus/runtime. Its compact
result verifies 129 corpus files, pinned runtime/driver identities, prompt
composition, finite caps and disabled launch. Missing original inputs must not
be reconstructed. Raw logs, corpus, evaluator keys, full lab inventory and run
workspaces stay on the VM; published path/hash pointers provide provenance.

## Historical evidence and next decision

The corrected [diagnosis](DIAGNOSIS.md) distinguishes acquisition, partial leads,
incomplete derivation, drafting loss and verification loss. Frozen scores and
usage remain unchanged. Fewer reads did not establish savings, and bundle-first
work remains retired from active optimization.

The original [VM report](VM_FROZEN_README.md), [checkpoint](CHECKPOINT.md),
[development review](INDEPENDENT_DEVELOPMENT_REVIEW.md),
[validation record](VALIDATION_RESULTS.json), [additive patch](PATCH.diff),
[VM manifest](MANIFEST.sha256.json) and [usage record](usage-lanes.json) remain
historical evidence from before this amendment. Their 62 historical runner tests
and 3,403-file preservation comparison were not repeated here. Their old source
hashes and zero-push accounting do not describe this amended publication.
The reviewed base is `cdedeb74792c651dcd0e8e275ae3b026b14ae4a7`;
`I1_AMENDMENT_MANIFEST.json` freezes affected lab files separately, and
`PUBLISHED_MANIFEST.json` binds the actual current GitHub package.

Earlier context: [R1b results](../r1b-block1/R1B_RESULTS.md),
[Muse review](../r1b-block1/eval/REV-M/review.md),
[zcode review](../r1b-block1/eval/REV-Z/review.md), and
[rev3 preparation](../r1b-prep-rev3/R1B_PREP_REV3.md).

The schedule remains four serial investigators (1,800 seconds/160 responses
each) and two independent Opus 5.5 xhigh reviews (2,700 seconds/160 responses
each), with no retry or replacement. Candidate app/model/Max, corpus and access
stay fixed. The 12,600-second model allowance and 14,400-second phase ceiling
are experimental maxima, not ordinary user latency targets. This publication
uses the user's existing GitHub visibility authorization. Stop here pending a
separate user go for the frozen proposed trial.
