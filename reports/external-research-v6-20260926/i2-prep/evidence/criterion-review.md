# Prospective current/history criterion: offline development review

Date: 2026-09-28. Development helper review only; not a formal semantic grade or
an independent reproduction of D1. The fixture is wholly artificial. No actual
D1 archive was assessed, rewritten, rescored, or interpreted as a new pass. No
native application, provider, model, account, or evaluator call occurred.

The criterion reads `state.json`, every declared raw/marker snapshot, `current.json`,
`current.md`, and `history.json`. It never constructs a Store or calls publish.
It refuses nonclosed archives: `state.closed` must be the strict Boolean `true`.
The test builder constructs Stores only in disposable temporary directories.
Every assessment regression compares all archive file bytes before and after the
check, establishing read-only behavior for the exercised cases.

Request order and names independently determine identity assignment, revision
number, latest attempt, and stable finding order. Raw snapshots are SHA-256 checked
and parsed by the pinned parser; recorded status, finding, change reason, identity,
and revision must match that derivation. Invalid latest attempts withhold their
identity. A missing/corrupt latest snapshot withholds it as incomplete; missing old
snapshots also make temporal evidence incomplete. Current JSON must equal the
derived full projection, with no unknown fields, altered titles/IDs/text, reordered
findings/parts, duplicate JSON keys, or JSON type substitutions. Markdown must match
the frozen renderer and derived status trailer byte for byte. Published history
must preserve every recorded attempt exactly. `change_reason` is checked in its
audit record, rather than promoted into the current finding.

`passed` means the mechanical lineage/history/current check passed.
`structurally_complete` is separate: faithful withholding of an invalid latest
attempt can pass the mechanical check while remaining incomplete. Delivery
eligibility must require both, plus independent native chronology/accounting.
`synthetic_task_assertions.passed` is separate again. It compares the artificial
fixture's exact full records and the designated assertion/required condition;
it is explicitly not a general semantic validator. No global marker scan is used.
All fields, including `source_fit` and `condition`, participate in exact fixture
expectations; neither provides a blanket exemption for stale assertions.

Executed:

```text
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover -s tools -p test_current_criterion.py -v
Ran 23 tests: OK.
```

Coverage includes legitimate ALPHA_V1/ALPHA_V2 source provenance retained exactly;
true stale fallback; wrong latest value without an old marker; required condition
loss; stale current rules embedded in source_fit or condition; invalid latest plus
an exact unaffected independent record; exact source quotes and all field values;
missing historical/latest snapshots; corrupt raw/marker snapshots; unknown current
fields at root/finding/part levels; changed field order or Markdown; tampered state
identity/parsed finding/status; dropped history; duplicate keys and JSON type
fidelity. Wrong-value, condition-loss, and embedded-stale-rule candidates correctly
pass faithful structural projection but fail the synthetic task expectations.
Additional bounded integration cases refuse false/missing/truthy-nonboolean closed
state without writes, preserve incompleteness for closed unsubmitted/cap-error
archives, and confirm criterion compatibility at exactly 32 KiB and 64 acknowledged
attempts. The 65th offered attempt remains recorded as a protocol/cap problem,
rather than promoted into the current finding.

The CLI help was loaded from `/tmp` using an absolute script path, confirming
dependency loading does not depend on the caller's working directory. The I2
`research_store.frozen_module()` helper verifies the frozen delivery-v2 source hash
and privately applies I2's declared 32-KiB parser capacity. Frozen source bytes are
unchanged. The parent `research_store.py` and capacity tests in `test_prep_plan.py`
were independently read. Its three capacity regressions were also run unchanged:
isolated frozen/configured module limits, 32-KiB boundary with oversized raw
preserved, and cap accounting including invalid revisions and surviving overflow;
all three passed. No material cross-file compatibility gap was found in this
bounded review. Criterion-specific compatibility cases above remain distinct from
the parent's full preparation suite, which this helper did not rerun.

Limits: this is an archive-only criterion, assuming the state and snapshots were
immutably captured and frozen externally. Their self-consistent hashes do not
authenticate an adversarially replaced entire archive. Recorded invalidation and
protocol-error flags are conservative audit signals; snapshots cannot independently
reconstruct original native writes, deleted/unsubmitted inputs, pending workspace
inputs, receipt-read timing, or the absence of such events. General research truth,
source/version applicability, missing discoveries, and semantic completeness remain
reviewer work. The exact renderer check verifies fidelity to its prescribed format;
it does not claim a new parser or renderer qualification.

File identities at this review (paths relative to i2-prep unless stated):

| Path | SHA-256 |
| --- | --- |
| tools/current_criterion.py | a6c225dfb882cbc9ebd78194e1159d53336c042c6bad4567af1fe7616f4487a3 |
| tools/test_current_criterion.py | abb3b827914a8773633e3db6e3df1925bc9529df586eb96440485915468580e9 |
| fixtures/criterion-task.json | 6b86863d4c29ab5b01254fcaf3bf6a87a1af8ef66b2c5eba6b3415f496d83d71 |
| tools/research_store.py | 5c8d95cd5197c38bff0dd4e9d9116682149a8210a0ffa0a243d0db56b2adf4ce |
| D1_INDEPENDENT_REVIEW.md | b7168d19345a2814e02588ccd01884b3113ea717ec60c04c52fc177f42141643 |
| ../delivery-v2/tools/delivery_store.py | 81364fd1a4040ba457dd04779d096709c3524bee8704a2c8f453fb18264c85c7 |

The written prospective criterion follows the supplied independent review; these
tests support its bounded mechanical behavior, not any new candidate outcome.
