# B11 — `repair_required` from the remedy owner; root-owned obligations as open questions

**STATUS: COMPLETE. All six brief items done: remedy-owner derivation, owner-driven `repair_required`, the validated `acceptance.root_owned_findings` setting, the disposition writer emitting `open_questions` in both modes, 41 new tests, and the docs. Full suite 1388 -> 1429 tests with the failing set byte-identical to the baseline (72 pre-existing). Last completed step: step 6 (docs) plus final verification.**

Written 2026-09-18 by the B11 owner agent against
`/home/sittingmongoose/PM-Experiments/harness-latency-20260916/B11_REMEDY_OWNER_BRIEF.md`.

## 0. What was read before anything was changed

| Artifact | Why |
|---|---|
| `B11_REMEDY_OWNER_BRIEF.md` | the task |
| `pwflow/repair_round.py` (844 lines) | `repair_rows()` lines 172-173 are the defect |
| `pwflow/transports/omp_direct.py` (1565 lines) | where transport settings are validated (`~line 438`) and recorded (`launch_settings`, `~line 875`) |
| `tools/b10_review_packet.py` | the affected-rows packet builder |
| `gitlab-r7a-scoped-review-20260917-v1/package-001/host/write_disposition.py` | carried for re-pointing |
| `gitlab-r7a-rereview-20260918-v1/attempt-002/adjudication-001/scripts/build_adjudication.py` | where the DL-059 rule text actually lives |
| `reports/F2_R7A_REREVIEW_REPORT.md` sections 3, 5, 6, 9 | the motivating case |
| `/mnt/Cursor/PuppetMaster/Plans/bootstrap/Bootstrap_Planning_Workflow.md` lines 130-175 (read only) | the canon's closure vocabulary |
| `gitlab-r7-known-defect-20260917-v1/.../review-packet-001/public/review/FINDINGS.json` | the real F2 and F4 rows, copied once into a test fixture |

## 1. Where the acceptance rule was found (and where it was not)

`write_disposition.py` does **not** encode "ACCEPTED only if no blocking finding remains in scope".
It derives the *method* disposition (was the review itself complete and usable) and explicitly
defers candidate acceptance: it emits
`'candidate_acceptance': 'UNACCEPTED_PENDING_SEPARATE_ROOT_CANDIDATE_ACCEPTANCE'` as a constant.

The acceptance rule exists in exactly two places, both of them prose:

- `gitlab-r7a-rereview-20260918-v1/attempt-002/adjudication-001/scripts/build_adjudication.py`,
  `doc['dl059_disposition_inputs']['rule']` — a string in the adjudication document, with
  `adjudicator_does_not_determine_the_disposition: True` beside it;
- `reports/F2_R7A_REREVIEW_REPORT.md` section 5, where a human applied it by hand.

So there was no code that computed the candidate disposition. B11 adds it.


## 2. Files changed

Successor-11 is not a git working tree, so the counts below are before -> after
line counts of each file, measured with `wc -l`.

| File | Before | After | Delta | What |
|---|---|---|---|---|
| `planning-workflow-successor-11-development/pwflow/repair_round.py` | 844 | 1214 | **+370** | remedy-owner derivation, owner-driven `repair_required`/`closure_status`, the acceptance setting, the disposition writer |
| `planning-workflow-successor-11-development/pwflow/transports/omp_direct.py` | 1565 | 1578 | **+13** | validates `acceptance` with the other launch settings; records it in `launch_settings` and in the run result |
| `planning-workflow-successor-11-development/tests/test_repair_round.py` | 788 | 801 | **+13** | one existing test updated (see section 7) |
| `planning-workflow-successor-11-development/tests/test_repair_round_remedy_owner.py` | - | 403 | **new** | 41 tests |
| `planning-workflow-successor-11-development/tests/repair_round_fixtures/r7a_findings_f2_f4.json` | - | 182 | **new** | the copied F2 and F4 rows, 10,546 bytes |
| `planning-workflow-successor-11-development/docs/direct-omp-mode.md` | 984 | 1057 | **+73** | new subsection in section 7 |
| `planning-workflow-successor-11-development/CHANGES.md` | 846 | 956 | **+110** | entry B11 |
| `harness-latency-20260916/tools/b10_review_packet.py` | 157 | 171 | **+14** | carries the run's acceptance block, the remedy owners and the disposition command into the packet manifest |
| `harness-latency-20260916/tools/b11_disposition.py` | - | 108 | **new** | the disposition writer as a coordinator tool |

Nothing else was touched. No run directory, no sealed package and no canon
document was modified; `/mnt/Cursor/PuppetMaster` was read once, for
`Plans/bootstrap/Bootstrap_Planning_Workflow.md`, and not written.

The sealed packet was read twice — once to copy the fixture, once to produce the
disposition JSONs in section 6 — and its digest is unchanged either side of both
reads: `3d600daf91a74d79ab72724c13b15549176c18eb7684153a073bab3d6a6a073f`.

## 3. The derivation table

`derive_remedy_owner(row) -> (owner, basis)` in `pwflow/repair_round.py`. The
rules fire in this order and the first one that fires wins; the basis is recorded
on the row as `remedy_owner_basis`.

| # | Condition | Owner | `remedy_owner_basis` | `repair_required` | `closure_status` |
|---|---|---|---|---|---|
| 1 | the row carries an explicit `remedy_owner` (must be one of the four, else refused) | as named | `explicit_remedy_owner_field` | owner == candidate | per owner |
| 2 | `blocks_candidate_verdict` is true | `candidate` | `blocks_candidate_verdict` | **true** | none |
| 3 | `provenance` is `candidate-introduced` | `candidate` | `provenance_candidate_introduced` | **true** | none |
| 4 | `precludes_PASS` and `provenance` is `pre-existing-in-subject` | `root` | `precludes_PASS_and_pre_existing_in_subject` | false | `blocked_requires_user_decision` |
| 5 | `precludes_PASS` and the family or statement names a root remedy | `root` | `precludes_PASS_and_names_a_root_owned_remedy` | false | `blocked_requires_user_decision` |
| 6 | `provenance` is `undetermined` and the family or statement is a harness census defect | `harness` | `undetermined_provenance_harness_census_defect` | false | `open_question` |
| 7 | nothing above fired | `subject` | `no_earlier_rule_fired` | false | `open_question` |

Root-remedy terms (rule 5), matched case-insensitively against
`finding_family + ' ' + statement`: `event_authority`, `event-authority`,
`event authority`, `governance reseal`, `reseal governance`, `governance_reseal`,
`spec lock`, `spec_lock`, `registration`, `registered source set`.

Harness census families (rule 6): `failure_census`, `seal_failure_census`,
`census_merge`, `harness_census`, `measurement_census`; or the statement contains
`failure census`, `seal failure census`, `census merge`, `audit-closure
aggregate` or `merge keys on the producer`.

`finding_level` is **not** touched by any of this. A blocker is a blocker whoever
owns it; what changes is what this goal is asking anyone to do about it.

The owner, the basis and the closure status travel with the row everywhere it
goes: the repair task text (section 10), `repair_impact_matrix.jsonl`, and the
delivery receipt, which also counts `findings_repair_required` and
`findings_not_asked_to_close`. Those two are deliberately **not** called
`repair_required_count`: the seal's dispositions contract already uses that name
for the model's own inspection of its measurement, and one name for two things in
one evidence directory is how a wrong finding gets written later.

### The two real rows

| | F2 | F4 |
|---|---|---|
| `finding_family` | `orphan_validation_artifact` | `event_authority_currentness` |
| `provenance` | `candidate-introduced` | `pre-existing-in-subject` |
| `blocks_candidate_verdict` | true | false |
| `precludes_PASS` | false | true |
| rule that fired | 2 | 4 |
| **`remedy_owner`** | **`candidate`** | **`root`** |
| `remedy_owner_basis` | `blocks_candidate_verdict` | `precludes_PASS_and_pre_existing_in_subject` |
| `finding_level` | `blocker` (unchanged) | `blocker` (unchanged) |
| **`repair_required`** | **true** (was true) | **false** (was **true** — the defect) |
| `closure_status` | none; the repair closes it | `blocked_requires_user_decision` |

F4 also satisfies rule 5 independently — its family is `event_authority_currentness`
and its statement says "unproved across the registered source set" — so it
classifies as root even if an adjudicator had left its provenance undetermined.
A test asserts that.

## 4. What the setting is and where it is validated

`acceptance.root_owned_findings`, values `block` (default) and `open_question`.

- Validated by `repair_round.validate_acceptance_settings()`, called from
  `omp_direct._settings()` next to `repair_round.validate_settings(config.get('repair_round'))`,
  so an unknown value fails the launch rather than a disposition weeks later.
- Resolved **unconditionally**, including when a launch says nothing, and written
  into `launch_settings()['acceptance']` and `result['acceptance']`, so a sealed
  run states which rule it was dispositioned under instead of leaving a reader
  to assume the default was in force.
- Validation is idempotent: the resolved block is itself written into records
  that later tools read back, so re-validating it returns the same block rather
  than rejecting the fields the harness wrote.
- `tools/b10_review_packet.py` carries the run's resolved block into
  `PACKET_MANIFEST.json` as `acceptance`, along with `remedy_owners`,
  `repair_required`, `not_asked_to_close` and a ready-to-run
  `disposition_command`.

## 5. The disposition writer

There was no disposition writer to re-point. The brief asked me to find where
"ACCEPTED only if no blocking finding remains in scope" is encoded; the answer is
that it was not encoded in code anywhere (section 1). `repair_round.disposition()`
is new and is the first code in this harness that computes candidate acceptance.

It takes the selected rows and a closure map (`finding_key` or `finding_id` ->
`True` or `{closed, closure_status, reason}`), and:

- **re-derives** the remedy owner instead of trusting the row, so a packet built
  before B11 — every one carries `repair_required: true` on every row — gets the
  same answer a new one would. An explicit `remedy_owner` still wins;
- treats a finding no closure record mentions as open. Silence does not close a
  finding;
- emits `open_questions` in **both** modes, with `remedy_owner`,
  `remedy_owner_basis`, `closure_status`, `severity` and citations (path, role
  and a digest of the citation record). In `block` mode those findings are also
  in `blocking_findings_remaining`, so the two modes differ in the verdict and in
  nothing that is shown;
- names the setting value, whether it is the default, and quotes the rule text it
  applied;
- accepts `new_findings` — blocking findings the re-review raised that no
  selected row covers — because "no blocking finding remains **in scope**" is
  about the scope, not about the original list.

`tools/b11_disposition.py` is the coordinator's entry point:

```
python3 tools/b11_disposition.py --findings <packet>/public/review/FINDINGS.json \
        --closed F2 --open F4 [--root-owned-findings block|open_question]
```


## 6. The exact disposition JSON, both modes, on the R7-A fixture

Produced by running the new tool against the sealed packet's own findings file,
read only:

```
PACKET=/home/sittingmongoose/PM-Experiments/gitlab-r7-known-defect-20260917-v1/candidate/baseline/r7a-repair-003/review-packet-001

python3 tools/b11_disposition.py \
  --findings $PACKET/public/review/FINDINGS.json \
  --closed F2 --open F4 --root-owned-findings <mode>
```

`--closed F2 --open F4` is the R7-A outcome as the adjudicator determined it
(`attempt-002/adjudication-001/`): F2 PASS/closed by the removal branch, F4
FAIL/not closed, zero new findings.

### 6.1 `block` — the default, and today's answer, unchanged

**UNACCEPTED, listing F4.** This is finding-for-finding what section 5 of the F2
report says by hand.

```json
{
 "acceptance_rule": "ACCEPTED only if no blocking finding remains in scope; otherwise UNACCEPTED with the blocking findings listed. Every finding the repair round selected counts as blocking while it is open, whoever owns its remedy.",
 "acceptance_setting": "acceptance.root_owned_findings",
 "acceptance_setting_is_default": true,
 "acceptance_setting_record": {
  "acceptance_rule": "ACCEPTED only if no blocking finding remains in scope; otherwise UNACCEPTED with the blocking findings listed. Every finding the repair round selected counts as blocking while it is open, whoever owns its remedy.",
  "decided_by": "host launch setting, not the model and not the reviewer",
  "default": "block",
  "is_default": true,
  "root_owned_findings": "block"
 },
 "acceptance_setting_value": "block",
 "accepted": false,
 "attempt_id": "R7A-REPAIR-REVIEW-001",
 "blocking_findings_remaining": [
  {
   "blocking_under_this_rule": true,
   "blocks_candidate_verdict": false,
   "citations": [
    {
     "path": "mechanical/governance-reports/0c611684aeeef78d/rseva-001/failures/failure-7bc10b7076cb1e927b9a0562.json",
     "role": "mechanical",
     "sha256": "10a234a5dded21c9909104a6c34a32107237f81903d7ae34db7a8a907706a60e"
    },
    {
     "path": "mechanical/governance-reports/0c611684aeeef78d/rseva-001/inspection_projection.json",
     "role": "mechanical",
     "sha256": "9ce727786eca8fa2d9be03071eb47816f93ef9137601b0b20e1844d78b45aea2"
    },
    {
     "path": "r2/Plans/GitLab_Integration.md",
     "role": "authority",
     "sha256": "4c1f2d00f5d22c57e0231375469619c53aa5aaaccdd10506b39866fa4946be23"
    },
    {
     "path": "mechanical/governance-reports/0c611684aeeef78d/rseva-001/inspection_projection.json",
     "role": "mechanical",
     "sha256": "2a2c2ee9eec34631fa76c3201f270708c934e9c21c991ea28175e129a22aeb0a"
    },
    {
     "path": "mechanical/governance-reports/0c611684aeeef78d/rseva-001/failures/failure-7bc10b7076cb1e927b9a0562.json",
     "role": "dependency",
     "sha256": "934b7697aa64ab1e31e3c097a276d84a5132669be751943a3b1e194d737d44d1"
    }
   ],
   "closed": false,
   "closure_determined_by_the_re_review": true,
   "closure_reason": "not closed by the re-review; see the adjudication",
   "closure_status": "blocked_requires_user_decision",
   "finding_family": "event_authority_currentness",
   "finding_id": "F4",
   "finding_key": "sfk-8f34bcf263e4a84c3ebfd1a9",
   "finding_level": "blocker",
   "precludes_PASS": true,
   "provenance": "pre-existing-in-subject",
   "remedy_owner": "root",
   "remedy_owner_basis": "precludes_PASS_and_pre_existing_in_subject",
   "repair_required": false,
   "severity": "blocker"
  }
 ],
 "candidate_acceptance": "UNACCEPTED",
 "closed_findings": [
  "F2"
 ],
 "counts": {
  "blocking_remaining": 1,
  "closed": 1,
  "new": 0,
  "open_questions": 1,
  "repair_required": 1,
  "selected": 2
 },
 "determined_by": "root. The reviewer and the adjudicator publish records; this applies the acceptance rule to them and neither grants acceptance.",
 "disposition_reason": "1 blocking finding remains in scope: F4",
 "findings": [
  {
   "blocking_under_this_rule": false,
   "blocks_candidate_verdict": true,
   "citations": [
    {
     "path": "r2/Plans/forge_integration_contracts.schema.json",
     "role": "output",
     "sha256": "bf95557a20af1347d9448b34c019379d0f58fd59fba012c0f8d715e7623fb0ea"
    },
    {
     "path": "r2/Plans/forge_integration_contracts.schema.json",
     "role": "output",
     "sha256": "9fa6133f6bc0d6053d11ad4e81f9d042fd203fbcd85a86d745cfdfb521cb5029"
    },
    {
     "path": "r2/Plans/forge_integration_contracts.schema.json",
     "role": "dependency",
     "sha256": "9d804bd10dc5dcb819d9d389377f8d33bbe355037e758eeb0fe78689283e470f"
    },
    {
     "path": "r2/Plans/gitlab_integration_fixtures.json",
     "role": "dependency",
     "sha256": "5884b03ba0acfa14afc4297de81905e91e1719d3247f1e0a9a5be28110d2163e"
    },
    {
     "path": "r2/Plans/GitLab_Integration.md",
     "role": "authority",
     "sha256": "b0fec81882fe20152d88595e9f16a97afccff1fbb1d6d128fda1c5a637a832f3"
    },
    {
     "path": "r2/Plans/GitLab_Integration.md",
     "role": "authority",
     "sha256": "2d261cea010da4536a7185d4f31a4943a70f79005e7c8d2e2a0e3384c3aa4368"
    }
   ],
   "closed": true,
   "closure_determined_by_the_re_review": true,
   "closure_reason": "closed by the re-review; see the adjudication",
   "closure_status": "repaired",
   "finding_family": "orphan_validation_artifact",
   "finding_id": "F2",
   "finding_key": "sfk-163c1b590a403531fd228557",
   "finding_level": "blocker",
   "precludes_PASS": false,
   "provenance": "candidate-introduced",
   "remedy_owner": "candidate",
   "remedy_owner_basis": "blocks_candidate_verdict",
   "repair_required": true,
   "severity": "blocker"
  },
  {
   "blocking_under_this_rule": true,
   "blocks_candidate_verdict": false,
   "citations": [
    {
     "path": "mechanical/governance-reports/0c611684aeeef78d/rseva-001/failures/failure-7bc10b7076cb1e927b9a0562.json",
     "role": "mechanical",
     "sha256": "10a234a5dded21c9909104a6c34a32107237f81903d7ae34db7a8a907706a60e"
    },
    {
     "path": "mechanical/governance-reports/0c611684aeeef78d/rseva-001/inspection_projection.json",
     "role": "mechanical",
     "sha256": "9ce727786eca8fa2d9be03071eb47816f93ef9137601b0b20e1844d78b45aea2"
    },
    {
     "path": "r2/Plans/GitLab_Integration.md",
     "role": "authority",
     "sha256": "4c1f2d00f5d22c57e0231375469619c53aa5aaaccdd10506b39866fa4946be23"
    },
    {
     "path": "mechanical/governance-reports/0c611684aeeef78d/rseva-001/inspection_projection.json",
     "role": "mechanical",
     "sha256": "2a2c2ee9eec34631fa76c3201f270708c934e9c21c991ea28175e129a22aeb0a"
    },
    {
     "path": "mechanical/governance-reports/0c611684aeeef78d/rseva-001/failures/failure-7bc10b7076cb1e927b9a0562.json",
     "role": "dependency",
     "sha256": "934b7697aa64ab1e31e3c097a276d84a5132669be751943a3b1e194d737d44d1"
    }
   ],
   "closed": false,
   "closure_determined_by_the_re_review": true,
   "closure_reason": "not closed by the re-review; see the adjudication",
   "closure_status": "blocked_requires_user_decision",
   "finding_family": "event_authority_currentness",
   "finding_id": "F4",
   "finding_key": "sfk-8f34bcf263e4a84c3ebfd1a9",
   "finding_level": "blocker",
   "precludes_PASS": true,
   "provenance": "pre-existing-in-subject",
   "remedy_owner": "root",
   "remedy_owner_basis": "precludes_PASS_and_pre_existing_in_subject",
   "repair_required": false,
   "severity": "blocker"
  }
 ],
 "findings_source": {
  "path": "/home/sittingmongoose/PM-Experiments/gitlab-r7-known-defect-20260917-v1/candidate/baseline/r7a-repair-003/review-packet-001/public/review/FINDINGS.json",
  "sha256": "3d600daf91a74d79ab72724c13b15549176c18eb7684153a073bab3d6a6a073f"
 },
 "new_findings": [],
 "open_questions": [
  {
   "blocking_under_this_rule": true,
   "blocks_candidate_verdict": false,
   "citations": [
    {
     "path": "mechanical/governance-reports/0c611684aeeef78d/rseva-001/failures/failure-7bc10b7076cb1e927b9a0562.json",
     "role": "mechanical",
     "sha256": "10a234a5dded21c9909104a6c34a32107237f81903d7ae34db7a8a907706a60e"
    },
    {
     "path": "mechanical/governance-reports/0c611684aeeef78d/rseva-001/inspection_projection.json",
     "role": "mechanical",
     "sha256": "9ce727786eca8fa2d9be03071eb47816f93ef9137601b0b20e1844d78b45aea2"
    },
    {
     "path": "r2/Plans/GitLab_Integration.md",
     "role": "authority",
     "sha256": "4c1f2d00f5d22c57e0231375469619c53aa5aaaccdd10506b39866fa4946be23"
    },
    {
     "path": "mechanical/governance-reports/0c611684aeeef78d/rseva-001/inspection_projection.json",
     "role": "mechanical",
     "sha256": "2a2c2ee9eec34631fa76c3201f270708c934e9c21c991ea28175e129a22aeb0a"
    },
    {
     "path": "mechanical/governance-reports/0c611684aeeef78d/rseva-001/failures/failure-7bc10b7076cb1e927b9a0562.json",
     "role": "dependency",
     "sha256": "934b7697aa64ab1e31e3c097a276d84a5132669be751943a3b1e194d737d44d1"
    }
   ],
   "closed": false,
   "closure_determined_by_the_re_review": true,
   "closure_reason": "not closed by the re-review; see the adjudication",
   "closure_status": "blocked_requires_user_decision",
   "finding_family": "event_authority_currentness",
   "finding_id": "F4",
   "finding_key": "sfk-8f34bcf263e4a84c3ebfd1a9",
   "finding_level": "blocker",
   "precludes_PASS": true,
   "provenance": "pre-existing-in-subject",
   "remedy_owner": "root",
   "remedy_owner_basis": "precludes_PASS_and_pre_existing_in_subject",
   "repair_required": false,
   "severity": "blocker"
  }
 ],
 "open_questions_rule": "every selected finding that is open and whose repair_required is false, with its remedy owner, its closure status, its severity and its citations; listed in both modes, and in block mode these same findings are also listed as blocking, so the two modes differ in the verdict and in nothing that is shown",
 "remedy_owners": {
  "candidate": 1,
  "harness": 0,
  "root": 1,
  "subject": 0
 },
 "repaired_revision": "revision-3",
 "reviewed_revision": "revision-2",
 "schema": "pwflow.repair-round-disposition.v1",
 "subject_id": "gitlab-small-v1"
}
```

### 6.2 `open_question`

**ACCEPTED, with F4 carried forward under `open_questions`** with owner `root`,
closure status `blocked_requires_user_decision`, severity `blocker` and all five
citations.

```json
{
 "acceptance_rule": "ACCEPTED only if no blocking finding remains in scope; otherwise UNACCEPTED with the blocking findings listed. A finding counts as blocking only while it is open and its repair_required is true; an open finding whose remedy is owned by root, the subject or the harness is carried forward as an open question with a named owner rather than blocking the seal or triggering another repair round.",
 "acceptance_setting": "acceptance.root_owned_findings",
 "acceptance_setting_is_default": false,
 "acceptance_setting_record": {
  "acceptance_rule": "ACCEPTED only if no blocking finding remains in scope; otherwise UNACCEPTED with the blocking findings listed. A finding counts as blocking only while it is open and its repair_required is true; an open finding whose remedy is owned by root, the subject or the harness is carried forward as an open question with a named owner rather than blocking the seal or triggering another repair round.",
  "decided_by": "host launch setting, not the model and not the reviewer",
  "default": "block",
  "is_default": false,
  "root_owned_findings": "open_question"
 },
 "acceptance_setting_value": "open_question",
 "accepted": true,
 "attempt_id": "R7A-REPAIR-REVIEW-001",
 "blocking_findings_remaining": [],
 "candidate_acceptance": "ACCEPTED",
 "closed_findings": [
  "F2"
 ],
 "counts": {
  "blocking_remaining": 0,
  "closed": 1,
  "new": 0,
  "open_questions": 1,
  "repair_required": 1,
  "selected": 2
 },
 "determined_by": "root. The reviewer and the adjudicator publish records; this applies the acceptance rule to them and neither grants acceptance.",
 "disposition_reason": "no blocking finding remains in scope under this rule",
 "findings": [
  {
   "blocking_under_this_rule": false,
   "blocks_candidate_verdict": true,
   "citations": [
    {
     "path": "r2/Plans/forge_integration_contracts.schema.json",
     "role": "output",
     "sha256": "bf95557a20af1347d9448b34c019379d0f58fd59fba012c0f8d715e7623fb0ea"
    },
    {
     "path": "r2/Plans/forge_integration_contracts.schema.json",
     "role": "output",
     "sha256": "9fa6133f6bc0d6053d11ad4e81f9d042fd203fbcd85a86d745cfdfb521cb5029"
    },
    {
     "path": "r2/Plans/forge_integration_contracts.schema.json",
     "role": "dependency",
     "sha256": "9d804bd10dc5dcb819d9d389377f8d33bbe355037e758eeb0fe78689283e470f"
    },
    {
     "path": "r2/Plans/gitlab_integration_fixtures.json",
     "role": "dependency",
     "sha256": "5884b03ba0acfa14afc4297de81905e91e1719d3247f1e0a9a5be28110d2163e"
    },
    {
     "path": "r2/Plans/GitLab_Integration.md",
     "role": "authority",
     "sha256": "b0fec81882fe20152d88595e9f16a97afccff1fbb1d6d128fda1c5a637a832f3"
    },
    {
     "path": "r2/Plans/GitLab_Integration.md",
     "role": "authority",
     "sha256": "2d261cea010da4536a7185d4f31a4943a70f79005e7c8d2e2a0e3384c3aa4368"
    }
   ],
   "closed": true,
   "closure_determined_by_the_re_review": true,
   "closure_reason": "closed by the re-review; see the adjudication",
   "closure_status": "repaired",
   "finding_family": "orphan_validation_artifact",
   "finding_id": "F2",
   "finding_key": "sfk-163c1b590a403531fd228557",
   "finding_level": "blocker",
   "precludes_PASS": false,
   "provenance": "candidate-introduced",
   "remedy_owner": "candidate",
   "remedy_owner_basis": "blocks_candidate_verdict",
   "repair_required": true,
   "severity": "blocker"
  },
  {
   "blocking_under_this_rule": false,
   "blocks_candidate_verdict": false,
   "citations": [
    {
     "path": "mechanical/governance-reports/0c611684aeeef78d/rseva-001/failures/failure-7bc10b7076cb1e927b9a0562.json",
     "role": "mechanical",
     "sha256": "10a234a5dded21c9909104a6c34a32107237f81903d7ae34db7a8a907706a60e"
    },
    {
     "path": "mechanical/governance-reports/0c611684aeeef78d/rseva-001/inspection_projection.json",
     "role": "mechanical",
     "sha256": "9ce727786eca8fa2d9be03071eb47816f93ef9137601b0b20e1844d78b45aea2"
    },
    {
     "path": "r2/Plans/GitLab_Integration.md",
     "role": "authority",
     "sha256": "4c1f2d00f5d22c57e0231375469619c53aa5aaaccdd10506b39866fa4946be23"
    },
    {
     "path": "mechanical/governance-reports/0c611684aeeef78d/rseva-001/inspection_projection.json",
     "role": "mechanical",
     "sha256": "2a2c2ee9eec34631fa76c3201f270708c934e9c21c991ea28175e129a22aeb0a"
    },
    {
     "path": "mechanical/governance-reports/0c611684aeeef78d/rseva-001/failures/failure-7bc10b7076cb1e927b9a0562.json",
     "role": "dependency",
     "sha256": "934b7697aa64ab1e31e3c097a276d84a5132669be751943a3b1e194d737d44d1"
    }
   ],
   "closed": false,
   "closure_determined_by_the_re_review": true,
   "closure_reason": "not closed by the re-review; see the adjudication",
   "closure_status": "blocked_requires_user_decision",
   "finding_family": "event_authority_currentness",
   "finding_id": "F4",
   "finding_key": "sfk-8f34bcf263e4a84c3ebfd1a9",
   "finding_level": "blocker",
   "precludes_PASS": true,
   "provenance": "pre-existing-in-subject",
   "remedy_owner": "root",
   "remedy_owner_basis": "precludes_PASS_and_pre_existing_in_subject",
   "repair_required": false,
   "severity": "blocker"
  }
 ],
 "findings_source": {
  "path": "/home/sittingmongoose/PM-Experiments/gitlab-r7-known-defect-20260917-v1/candidate/baseline/r7a-repair-003/review-packet-001/public/review/FINDINGS.json",
  "sha256": "3d600daf91a74d79ab72724c13b15549176c18eb7684153a073bab3d6a6a073f"
 },
 "new_findings": [],
 "open_questions": [
  {
   "blocking_under_this_rule": false,
   "blocks_candidate_verdict": false,
   "citations": [
    {
     "path": "mechanical/governance-reports/0c611684aeeef78d/rseva-001/failures/failure-7bc10b7076cb1e927b9a0562.json",
     "role": "mechanical",
     "sha256": "10a234a5dded21c9909104a6c34a32107237f81903d7ae34db7a8a907706a60e"
    },
    {
     "path": "mechanical/governance-reports/0c611684aeeef78d/rseva-001/inspection_projection.json",
     "role": "mechanical",
     "sha256": "9ce727786eca8fa2d9be03071eb47816f93ef9137601b0b20e1844d78b45aea2"
    },
    {
     "path": "r2/Plans/GitLab_Integration.md",
     "role": "authority",
     "sha256": "4c1f2d00f5d22c57e0231375469619c53aa5aaaccdd10506b39866fa4946be23"
    },
    {
     "path": "mechanical/governance-reports/0c611684aeeef78d/rseva-001/inspection_projection.json",
     "role": "mechanical",
     "sha256": "2a2c2ee9eec34631fa76c3201f270708c934e9c21c991ea28175e129a22aeb0a"
    },
    {
     "path": "mechanical/governance-reports/0c611684aeeef78d/rseva-001/failures/failure-7bc10b7076cb1e927b9a0562.json",
     "role": "dependency",
     "sha256": "934b7697aa64ab1e31e3c097a276d84a5132669be751943a3b1e194d737d44d1"
    }
   ],
   "closed": false,
   "closure_determined_by_the_re_review": true,
   "closure_reason": "not closed by the re-review; see the adjudication",
   "closure_status": "blocked_requires_user_decision",
   "finding_family": "event_authority_currentness",
   "finding_id": "F4",
   "finding_key": "sfk-8f34bcf263e4a84c3ebfd1a9",
   "finding_level": "blocker",
   "precludes_PASS": true,
   "provenance": "pre-existing-in-subject",
   "remedy_owner": "root",
   "remedy_owner_basis": "precludes_PASS_and_pre_existing_in_subject",
   "repair_required": false,
   "severity": "blocker"
  }
 ],
 "open_questions_rule": "every selected finding that is open and whose repair_required is false, with its remedy owner, its closure status, its severity and its citations; listed in both modes, and in block mode these same findings are also listed as blocking, so the two modes differ in the verdict and in nothing that is shown",
 "remedy_owners": {
  "candidate": 1,
  "harness": 0,
  "root": 1,
  "subject": 0
 },
 "repaired_revision": "revision-3",
 "reviewed_revision": "revision-2",
 "schema": "pwflow.repair-round-disposition.v1",
 "subject_id": "gitlab-small-v1"
}
```

A field-by-field walk of the two records finds exactly thirteen differences, and
no others:

| Field | `block` | `open_question` |
|---|---|---|
| `acceptance_setting_value` | `block` | `open_question` |
| `acceptance_setting_is_default` | true | false |
| `acceptance_rule` | the block rule | the open-question rule |
| `acceptance_setting_record.root_owned_findings` | `block` | `open_question` |
| `acceptance_setting_record.is_default` | true | false |
| `acceptance_setting_record.acceptance_rule` | the block rule | the open-question rule |
| `candidate_acceptance` | `UNACCEPTED` | `ACCEPTED` |
| `accepted` | false | true |
| `disposition_reason` | `1 blocking finding remains in scope: F4` | `no blocking finding remains in scope under this rule` |
| `counts.blocking_remaining` | 1 | 0 |
| `blocking_findings_remaining` | one entry, F4 | empty |
| `findings[1].blocking_under_this_rule` | true | false |
| `open_questions[0].blocking_under_this_rule` | true | false |

So: **the same finding list, the same closures, the same remedy owners, the same
`open_questions` entry with the same owner, closure status, severity and five
citations.** What moves is the verdict, the count that produces it, and the flag
that says whether the open question also blocks under the rule in force. Nothing
is hidden by either rule — that is what "emit `open_questions` in both modes"
buys.

## 7. Test counts, before and after

### The command in the brief does not run, before or after

`python3 -m unittest discover -s tests -t .` fails on this tree with

```
ImportError: Start directory is not importable:
'/home/sittingmongoose/PM-Experiments/planning-workflow-successor-11-development/tests'
```

because `tests/` has no `__init__.py` and Python 3.11+ requires one when the
start directory differs from the top-level directory. This is **pre-existing**: I
ran the command before touching anything and it failed the same way. I did not
add `tests/__init__.py`, because making `tests` a package changes every module's
import name and breaks the sibling imports the suite already uses
(`import replay_support`). The form the tree's own `README.md` documents is
`python3 -B -m unittest discover -s tests`, and that is what the counts below
come from.

### Counts

| | Before B11 | After B11 |
|---|---|---|
| Ran | **1388** | **1429** (+41) |
| failures | 5 | 5 |
| errors | 67 | 67 |
| skipped | 24 | 24 |
| passed | 1292 | 1333 (+41) |
| wall clock | 224.6 s | 231.7 s |

The 72 failing tests are **pre-existing and unchanged**: I captured the full
`ERROR:`/`FAIL:` name list before the change and after it and the two sorted
lists are byte-identical (`diff` reports no differences). None of them is in
`test_repair_round.py`, `test_repair_round_remedy_owner.py`,
`test_omp_direct.py` or `test_known_defect_findings.py`.

The "after" figures are from a run started once the tree was final and nothing
was edited while it ran. An intermediate run overlapped a source edit and failed
one extra test,
`test_evaluate.EvaluationTests.test_raw_mechanical_private_markers_never_enter_stage_sources`,
with the issue `evaluation_boundary:ValueError:evaluator implementation changed
after preparation` — the suite's own guard against exactly that, working
correctly. It is recorded here rather than quietly dropped; the clean run does
not show it.

The +41 is exactly `tests/test_repair_round_remedy_owner.py`. Targeted run of the
two repair-round modules together: **109 tests, OK**.

Tests by brief item:

| Brief item | Where |
|---|---|
| (a) classification of the real F2 and F4 rows | `Classification` (6 tests) + `TheFixtureIsTheRealThing` (2) |
| (b) disposition under both values, F2 closed and F4 open | `Disposition.test_block_is_unaccepted_and_lists_f4`, `test_open_question_is_accepted_with_f4_carried_forward`, plus 6 more on both modes |
| (c) a run config without the setting behaves as `block` | `AcceptanceSettings.test_absent_is_block`, `test_the_launch_settings_record_the_rule_even_by_default`, `Disposition.test_the_default_argument_is_block` |
| (d) explicit `remedy_owner` overrides the derivation | `Derivation.test_an_explicit_remedy_owner_overrides_the_derivation` + 2 more |
| (e) an unknown setting value is rejected | `AcceptanceSettings.test_an_unknown_value_is_rejected`, `test_an_unknown_setting_name_is_rejected`, `Disposition.test_an_unknown_mode_is_refused_at_the_disposition_too` |

`tools/b11_disposition.py` has no unit test of its own — the harness tools
directory has no test harness. It is exercised end to end instead, in both modes,
against the sealed packet's own `FINDINGS.json`; that is section 6, and the
packet's digest is unchanged either side of the runs.

## 8. What "default behaviour unchanged" does and does not mean here

Stated precisely, because the brief's changes 1 and 2 are not themselves behind
the setting and cannot be:

**Unchanged.** The acceptance outcome under the default. On the R7-A rows with F2
closed and F4 open, `block` yields `UNACCEPTED` listing F4 — the same verdict, the
same single finding, the same reason as the sealed disposition and as section 5
of the F2 report. A launch that says nothing about acceptance behaves as `block`,
and `block` is what the constant `DEFAULT_ROOT_OWNED_FINDINGS` says. Every one of
the 1388 pre-existing tests behaves as it did, with the single exception below.

**Changed, because the brief requires it.** Changes 1 and 2 are unconditional, so
the *rows* differ whatever the setting: every selected row now carries
`remedy_owner`, `remedy_owner_basis` and `closure_status`, and a non-candidate row
carries `repair_required: false`. That necessarily changes the bytes of the repair
task text, the impact matrix, the delivery receipt and a future packet's
`FINDINGS.json`. It has to: change 2 explicitly asks the task text to say that the
repairer is not asked to close a finding whose `repair_required` is false, which
cannot be said without changing it. Byte-for-byte identity of those artifacts was
not achievable alongside the brief's own changes 1 and 2, and I did not pretend
otherwise. What is preserved byte-for-byte is the **verdict** the default rule
produces, which is what the setting exists to gate.

**One existing test changed with the code.**
`tests/test_repair_round.py::Selection::test_rows_carry_the_canon_fields`
asserted `assertTrue(row['repair_required'])` for every row. It passed only
because the builder hardcoded the flag — it was an assertion about the defect. It
now asserts `finding_level == 'blocker'` for both rows (unchanged), the flag
against the owner, and the two rows by name: F2 candidate/true, F4
root/false/`blocked_requires_user_decision`. No other existing test needed a
change, and none was weakened or deleted.

## 9. Not done, and why

- **No re-run of any review or repair**, and the sealed R7-A disposition is
  untouched. Section 6 computes what the two rules *would* produce from the
  sealed findings; it does not amend the sealed record.
- **No canon edit.** `/mnt/Cursor/PuppetMaster` was read once
  (`Plans/bootstrap/Bootstrap_Planning_Workflow.md`) and not written. The
  addendum to PWIZ-028 and the DL entry the F2 report proposes are Jared's to
  decide and are not part of B11, exactly as the report's section 9 says.
- **`host.py`'s judgment-target tuple** is untouched: separate open question.
- **`write_disposition.py` was not re-pointed**, because it does not encode the
  acceptance rule (section 1). It remains in `CARRIED_FOR_REPOINTING` for the
  attempt-id constants it does carry.
- **Nothing in `worknode`.**

## 10. What the repairer now sees

Rendered from the same two rows, as `repair_task_text()` writes it into
`.pwflow/REPAIR_TASK.md`. This is the part of change 2 that cannot be put behind
a setting: a task that marks a finding `repair required: no` has to say what that
means.

The rule list gained one bullet:

> **You are asked to close only the findings whose `repair required` is `yes`.** A finding marked `no` has a remedy owned by someone this goal cannot reach — the owner is named beside it — and it is in this task so that you record it truthfully, not so that you close it. Say in your `--dispositions` what is true of it, name its closure status, and leave it open. Claiming closure on one of those is worse than leaving it.

The findings table gained a column:

```
| key | finding | provenance | level | remedy owner | repair required |
|---|---|---|---|---|---|
| `sfk-163c1b590a403531fd228557` | F2 | candidate-introduced | blocker | candidate | yes |
| `sfk-8f34bcf263e4a84c3ebfd1a9` | F4 | pre-existing-in-subject | blocker | root | no |
```

And each finding gained a **Remedy owner** paragraph:

> **Remedy owner.** `candidate` (blocks_candidate_verdict). You are asked to close this one.

> **Remedy owner.** `root` (precludes_PASS_and_pre_existing_in_subject). You are **not** asked to close this one: its closure status is `blocked_requires_user_decision`. Record what is true of it in your `--dispositions` and leave it open.
