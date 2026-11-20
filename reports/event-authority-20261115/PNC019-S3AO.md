# PNC019 s3ao — shared Goal oracle sweep

**PASS. Criterion 12 closes for all thirteen requested families, each now 12/12. Native execution remains NOT_RUN.**

Branch `plans/ea-pnc-s3ao-20261114`; base `2f44dc23cdc12ca49c82b43b16bd0310f8e11777`; verified implementation `34e1e0eb80a6100846fd5a430b37d6cf02b3d397`. This branch extends s3a without changing Plans, frozen sources, governance, the gated guard tool, number/date-time foundations or `.gitignore`. No SP/CV/ATS IDs were minted. Both remotes are verified at delivery.

## Guard-table result

| Check | Result |
|---|---:|
| Complete checker calls | 62,778 |
| Inventoried tables / maximum rows per table | 1,395 / 1 |
| Gated Method B passes | 1,378 |
| Source-bound earlier-clause implications | 17 |
| Unresolved rows | 0 |
| Authored expectation failures / source drift | 0 / 0 |
| Complete input receipt snapshots | 193 |

The gated proof covers Boolean observation dispatch after the complete checker computes each real predicate from full input. A table receives a positive observation and one negative observation, backed by separately sealed complete-input control and first-refusal witnesses. This follows W3F. It is not a JSON-schema keyword occurrence proof. Whole schemas retain their original keywords. The 17 implication rows have explicit source/schema-bound arguments, and every required earlier guard passes the gated tool; they earn no fabricated negative or mutation kill. Full arguments and owner hashes appear in `PNC019-S3AO-core.json` and the table summary.

## Mutation table

| Outcome | Count | Kill credit |
|---|---:|---|
| Exact expected refusal, source label and input SHA-256 | 1,378 | Yes |
| Rows discharged by earlier-clause implication | 17 | None |
| Deliberate whole-checker cuts that accept | 1,223 | Diagnostic only |
| Deliberate whole-checker cuts that refuse later | 135 | Diagnostic only |
| Deliberate whole-checker cut exceptions | 20 | None |
| Judge controls: expected / different refusal / exception / acceptance | 4 passed | Only expected refusal kills |

The data mutation judge reruns the complete witness and requires exactly the expected singleton refusal. Arbitrary exceptions and other refusals never kill. Whole-checker cut behavior is recorded separately and never changes that credit.

## Grades

| Family | Before | After |
|---|---:|---:|
| `goal.created` | 11/12 | 12/12 |
| `restore_point.deleted` | 11/12 | 12/12 |
| `run.started` | 11/12 | 12/12 |
| `goal.child_status_changed` | 11/12 | 12/12 |
| `goal.degraded` | 11/12 | 12/12 |
| `goal.progressed` | 11/12 | 12/12 |
| `goal.replanned` | 11/12 | 12/12 |
| `goal.scheduled` | 11/12 | 12/12 |
| `goal.stopped` | 11/12 | 12/12 |
| `goal.verification_decided` | 11/12 | 12/12 |
| `goal.evidence_captured` | 11/12 | 12/12 |
| `goal.receipt_recorded` | 11/12 | 12/12 |
| `goal.tool_check_recorded` | 11/12 | 12/12 |
| `goal.blocked` | 9/12 | 9/12 |
| `goal.completed` | 9/12 | 9/12 |
| `goal_run.blocked` | 7/12 | 7/12 |
| `goal_run.stopped` | 7/12 | 7/12 |
| `goal_run.replanned` | 3/12 | 3/12 |

Only the thirteen requested oracle cells change. The five successor-family grades remain s3a's. The sweep supports additional `--source MODULE` adapters for `goal.blocked`, `goal.completed`, `goal_run.blocked` and `goal_run.stopped`; those contracts require their own complete-input adapter and witnesses. Lane s3d's source fixes are not represented as completed here.

## Implementation and verification

| Item | Path and verification |
|---|---|
| Collector, exact refusal judge, source binding, extension entry points | `scripts/pm_goal_guard_sweep.py:264` (`collect`), `:368` (`prove`), `:491` (`mutations`), `:525` (`main`); final command below |
| Shared current/frozen number grammar and timestamp roles | `scripts/pm_goal_oracle_common.py:241` (`current_type`), `:54` (`timestamp_roles`), `:84` (`owned_properties`); `scripts/pm_goal_time.py:39` (`instant`); shared boundaries in `scripts/pm_goal_shared_oracles.py:133` |
| Receipt-selected original recipe and snapshot-preserving reads | `scripts/pm_goal_retained.py:82` (`resolve`); `scripts/pm_goal_deleted_components.py:39`; `scripts/pm_goal_deleted_retained_oracles.py:77` |
| Pinned original, retained and adoption joins; distinct-copy witnesses | `scripts/pm_goal_deleted_external_oracles.py:359`; `scripts/pm_goal_deleted_retained_witnesses.py:18`; `scripts/pm_goal_run_adoption_oracles.py:96`; three fixture banks below |
| Source-bound earlier-clause proofs | `scripts/pm_goal_deleted_implications.py:21`; `scripts/pm_goal_guard_sweep.py:415` (`dominance_proof`); gated dependencies in final table summary |
| Exact grade citations and vector check | `python3 scripts/pm-pnc019-s3a-grade-check.py reports/event-authority-20261115/PNC019-S3AO-grades-core.json` |

Current writes use shared `current_integer` / `storage_uint64`, producer semantic bytes/digests, qualified JCS and stored bytes. Frozen original schemas keep their original integer grammar; current writes never choose it. Corpus cases cover a valid 4,400-digit integer without conversion crashes, JCS loss inside uint64 and physical overflow after JCS qualification. No invented general maximum is added to producer sequence metadata.

Event occurrence and append acknowledgement use the shared EventRecord profile (E5-2). EventRecord observed/persisted fields and index timestamps use Storage UTC-Z, including copied schema nodes without a format annotation. All other owner constraints remain. Exact chronology supports year 0000, valid leap seconds, equivalent offsets and arbitrary fractions. The timestamp-role audit passes 81 nodes. The global date-time inventory remains NOT_PASS due to pre-existing stale exclusions and missing sparse citation containers; no global gate PASS is claimed.

Retained reads select only an installed original recipe from the independently sealed receipt and bind its exact original bytes and recipe resources. TEST_ONLY issuance is separate from reading. Missing, ambiguous, altered, foreign-Storage, unknown-recipe, caller-override and denied-disclosure reads preserve the full store. The deleted-family adapter runs the original native fixture authentication fence and repeats it before disclosure, with real issued leases and explicit late-race witnesses. Captured backing state includes canonical rows, source, permissions, installed bindings and native codec resources; ephemeral lease bookkeeping is excluded. Modeled owner-race changes are compared to their exact declared delta. The supplementary `retained-snapshots-final-v78/full-backing-snapshots.json` preserves full before/after backing bytes for all complete deleted-reader cases, including the later seam witnesses; it earns no additional guard or kill credit. No read issues a receipt or silently selects the current recipe.

The 93-file frozen original manifest is verified read-only. Six frozen regression programs pass: 199 unchanged original checks, 99 phase cases, 58 final boundaries, and pending suites of 30/38/44/42. Their original catches remain intact, so they earn regression credit only, zero guard or mutation credit. All 144 pinned files still match. Their fixture results establish no native authentication, storage durability, atomicity or runtime claim.

Three real-input tool defects were corrected during this lane: the grade checker accepted an inconsistent vector; a date-time-only FormatChecker omitted the owner's UUID check; a copied EventRecord lacking format annotations admitted an offset in observed time. Exact failing inputs and repaired outcomes are retained by path and SHA-256 in the result bundle. These are tool correctness repairs, without a product decision.

```sh
python3 scripts/pm_goal_guard_sweep.py --generate --replace-generated --prove-generated --no-fuzz \
  --source pm_goal_history_reader_fixtures --source pm_goal_own_d_oracles \
  --source pm_goal_own_d_supplement --source pm_goal_complete_oracles \
  --source pm_goal_shared_oracles --source pm_goal_deleted_external_oracles \
  --source pm_goal_deleted_retained_witnesses --source pm_goal_run_adoption_oracles \
  --out /absolute/evidence/joint
```

Use `long-job start` with the 12 GiB memory preflight and 2 GiB/no-swap scope, then foreground `long-job wait NAME --timeout 1500`, re-armed on 124. At most four guard-tool processes may run. Default generation preserves existing extension tables; `--replace-generated` deliberately regenerates the full eight-source inventory. Additional sources expose `main()` or `run()` and register complete calls with the collector. Optional fuzz search earns no credit by itself.

Raw evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/s3ao/joint-final-v76`. `PNC019-S3AO-core.json` lists exact paths and SHA-256 hashes for the summaries, source bindings, complete snapshots, judge, regressions and diagnostic inputs. `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/s3ao/joint-final-v76/SHA256SUMS` binds every individual gated-tool receipt. Compact artifacts: `reports/event-authority-20261115/PNC019-S3AO-core.json` and `PNC019-S3AO-grades-core.json`. Native execution is NOT_RUN throughout. No landing or governance reseal ran.

Final metadata verification: all 18 vectors and 601 exact quotes across 29 files pass. Altering one vector fails specifically at `goal.created: vector`. Current source hashes match the sealed run, every generated table has one guard, and every implication dependency is gated PASS. Result: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/s3ao/final-checks.json`; SHA-256 `1823d876ffdee47a8ae640c670f7f883b097bde6482e20cf046cbf0f144db04f`.

## New test files

Exact paths and bytes for DL-413. The first two are already on Jared's pending card E10-2; the retained-helper bank is also explicitly disclosed here.

| Path | Bytes |
|---|---:|
| `tests/fixtures/pnc019_goal_adoption_helper_witnesses.json` | 10047 |
| `tests/fixtures/pnc019_goal_frozen_helper_witnesses.json` | 126386 |
| `tests/fixtures/pnc019_goal_retained_helper_witnesses.json` | 28298 |
