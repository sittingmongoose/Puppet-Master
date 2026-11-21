# Landing checks: the recorded baseline

`baseline.json` is the list of failures the three repository-wide checks already produce on `main`.
`scripts/pm-landing-check.py` runs those checks at landing and reports only what is not in this list
or what names a path the landing branch touched.

The three checks are `pm-plans-verify.py run-gates`, `pm-plans-verify.py audit-governance` and
`pm-plan-migration.py validate` against the run named in `Plans/.plan_migration/current_run.json`.
They take about ten minutes, and on this repository they fail on thousands of findings that name no
file any landing branch touched: stale governance hashes, and a plan-migration snapshot taken on
2026-09-06 that every canon edit since has left further behind.

## Commands

From a local topic worktree on the VM, start the lander under `long-job`:

    long-job start pm-land-my-topic -- python3 scripts/pm-land.py run fix/my-topic --agent my-name --wait-for-review
    long-job wait pm-land-my-topic --timeout 1500

Wait again on exit 124. The check runs as a separate long-job on Nas1 by default. If Nas1 is busy
or unavailable, use `--checks-on 1070ti` for the 1070ti, which is slower. After three consecutive
SSH transport failures, the runner reports the job name and evidence directory and stops.
Check the named job on reconnect. You can retry an
unpublished landing on the other host with `--checks-on 1070ti` or `--checks-on nas1`.
Recover a saved Plans follow-up under the landing lock before another landing. The lander prints
the check’s original exit code and a share directory with `landing-check.json`, `record.json`,
`verification.json` and the subcheck reports. If it
asks for a judgment, compare the rows in `review.json` with the baseline and read any timeout
rerun reports it names. Write `judgment.json` in that run directory with the same
`report_sha256`, a Boolean `proceed` and a short `judgment` explaining the comparison. Save the complete file with an atomic rename. The lander waits before touching the shared checkout.

The November 21, 2026 dry runs recorded these times. Each run checked the unchanged commit
listed in its row.

| Host | Checked commit | Landing check | Shard check |
| --- | --- | --- | --- |
| Nas1 | `2b83b7143f` | 3,053 s (51 min), exit 0 | 39 s |
| 1070ti | `b19f171724` | 8,240 s (2 h 17 min), exit 1 | 96 s |

Use `run <branch> --dry-run` to check and verify a published commit, or a local branch pointing
at fetched main, without acquiring the lock or pushing. If main moves during the dry run, the tool
keeps the verification for the original base, writes `base-moved.json` and exits 3. Run again at
the new main before relying on the result for a landing. While a remote worktree is still in place,
`python3 scripts/pm-land.py verify <record.json> --commit <full commit SHA> --base <full origin/main SHA>`
checks the current origin/main and asks the host to rehash the live checkout and shared inputs. It prints whether
the record matches and returns the landing check’s exit code when it does. A verification failure
exits 3. The tool removes the temporary remote worktree after its recorded jobs stop. It reports
the job and preserves the worktree when long-job reports `lost` and the worker may still be running.
Cleanup warnings are saved separately from the check or publication result.

Both hand the aggregate checks `--subcheck-timeout-seconds`, 1800 by default; see "Subchecks that
time out" below.

At landing, also pass `--keep-check-reports <dir>`, a directory under
`/mnt/Cursor/PuppetMaster-Evidence/`. It keeps each check's full report, every row it printed, as
`<dir>/<check>.json` beside the `--json` output, so the landing can later be replayed exactly. The
`--json` report keeps only the rows it reports, and a replay from it alone cannot see the rest of a
sampled subcheck's printed rows, which is what the readiness growth counter reads. It also keeps each
export the landing ran (see "Subchecks keyed from their export" below) as
`<dir>/exports/<command>.json`: the command line, how the run ended and the report it wrote. The
directory must be outside the repository: the check refuses one inside it with exit 3, before it runs
anything.

Exit codes: 0 nothing to report, and every subcheck finished; 1 nothing it reports stops the
landing, meaning governance staleness on files the branch edited, pre-existing or
`unknown-pre-existing` failures whose count has not risen against a current baseline (see "Only
against a current baseline" and "Pre-existing and improved failures" below), failures
that are new but name none of the branch's files, or a subcheck that timed out, so that the run was
not fully verified; 2 something it reports does stop the landing, meaning a failure on the branch's
files that is neither staleness nor pre-existing, non-stale bucket growth, or a rise in a subcheck
whose failures are truncated, other than the readiness growth
counter; 3 the check could not run, readiness audit input identity could not be established or matched,
or a subcheck timed out while recording a baseline. A subcheck
that timed out in a landing run lifts an exit 0 to 1 and changes no other exit code. A subcheck keyed
from its export is not truncated; one whose export falls back is, and the summary says why.

**It refuses a sparse worktree**, with exit 3, in both modes. The three checks read the whole
repository, so every file outside a sparse cone reads as missing: a dry run at `ecb77f4e6c` on a
worktree without `Concepts` and `tests` produced three blocking items and 76 new failures that were
all the absent cone, in two truncated subchecks, and none of them about the branch. The tool was
right to stop, but a lander would have read those as theirs. Run it in a full checkout on the idle
machine. `--allow-sparse` is for a deliberate partial run outside the landing flow.

The recorded `commit` is the commit the baseline was taken at, and it has to be a commit of `main`:
rule 2 applies only while that commit is an ancestor of the landing's base (see "Only against a
current baseline" below). The runbook below records at the newly pushed `main` before it commits the
snapshot, so the commit it names is `main`'s. The first baseline, of 2026-09-21, named its branch's
own first commit `b29eab7b99`, because the script that records a baseline had to exist in the tree
that recorded it; the rebase at landing left that commit off `main` (it landed as `2c527ce17f`), so
against that baseline rule 2 would be off. The baseline recorded at `main` `75bcda93bc` on
2026-09-23 replaced it.

## Readiness audit input identity

The tracked checkout alone does not determine `implementation_readiness`. Its PNC-019 helper reads
`Plans/.audits/event-authority-2026-08-13-currentness/`, an ignored directory present in the shared
checkout. Without it the same commit reports an unavailable audit instead of the source, registry
and artifact failures that the evidence exposes. These different inputs must not be compared as
though their failure counts describe a regression or an improvement.

Both modes use one `--readiness-audit-root DIR` option, naming that currentness directory. By default
they select `/mnt/Cursor/PuppetMaster/Plans/.audits/event-authority-2026-08-13-currentness` when it is
present, otherwise the checked tree's directory. A clean worktree temporarily links its missing
ignored directory to the selected source for the aggregates and exports, then removes its own link
on success or failure. The source is read, never copied, regenerated or written. Canonical sources
are still read from the checked worktree. An existing local directory is never replaced: select it
explicitly with `--readiness-audit-root`, or use a clean worktree. An explicit nonexistent source is
an error; default local absence is recorded as absence and the validator still reports its failures.

The baseline's `readiness_audit_inputs` records relative file paths and each file's actual SHA-256,
or `null` when missing. It covers these five direct inputs plus every artifact named by the receipt's
`artifact_hashes`:

- `VALIDATOR_RECEIPT.json`
- `EVENT_FAMILY_DENOMINATOR_STATUS.json`
- `CURRENT_EVENT_SOURCE_INVENTORY.json`
- `adjudication/GROUP_ARTIFACT_MANIFEST.json`
- `adjudication/QUARANTINED_EVENT_DISPOSITIONS.jsonl`

Receipt hashes are expectations to validate, not trusted substitutes for hashing the artifact bytes.
Canonical sources listed in the inventory and the validator script are deliberately outside this
binding: edits to those remain readiness findings. Unreferenced audit outputs are outside it too.
The source's absolute location is printed in the run report, but is not part of the baseline identity,
so moving the same evidence does not change the comparison.

Comparison refuses with exit 3 before running the checks if the binding is absent or invalid, or
the path set, file presence or bytes differ. Inputs are rehashed after each aggregate and after
exports; changes stop the run before failures are classified or a baseline is written. Unreadable
inputs also stop it. Malformed audit JSON remains a validator finding while its bytes are bound.
There is no staleness exception or pre-existing classification for an input mismatch. Restore the
recorded input edition; never re-record a baseline to make a pending landing pass.

Older baselines without this field cannot establish input equivalence and the new checker refuses
them. Adopt the recorder during a scheduled refresh between landings, using a full worktree on the idle machine
at the pushed `main`; the old checker accepts the additive field. The adoption order is documented
in [the readiness drift notes](readiness-drift-20261011/NOTES.md). This fix does not refresh the
repository baseline or authorize a governance reseal.

## What a key is

Each failure becomes `check | subcheck | error kind | path | fingerprint`. The fingerprint is a
digest of the failure's remaining fields after the parts that move on their own are taken out:
timestamps, hash values, the absolute path of the checkout it ran in, and the measured
`actual`/`expected` values. What is left is what makes one failure distinct from another: which
document, which span, which field. So the stale hash of one document keeps one key however often
that document is edited, and a line that shifted is still the same finding.

Failures are grouped into buckets of `check | subcheck | error | path`. A bucket up to
`max_fingerprints_per_bucket` entries lists every fingerprint, so a genuinely new failure inside it
is named. A larger bucket lists none and is matched by its count instead, because the three largest
buckets hold 27,700 of the 28,128 plan-migration findings and writing them all out would make a file
that is refreshed after Plans landings megabytes long. `fingerprints: null` in a bucket means count-only.

## What the match can and cannot see

The two aggregate checks print at most 50 (run-gates) or 100 (audit-governance) failures per subcheck
but report the true total, so the baseline stores both. In the first recorded baseline, of
2026-09-21, that meant **only 1,007 of the 9,807 failures those two checks report were ever keyed**:
12 subchecks were truncated and 8,800 failures were never seen one by one. The worst were
`validate_evidence` and `validate_plan_graph`, which reported 1,552 each against a 50-row sample, a 97
percent blind spot. `plan-migration-validate` prints all of its failures, so those are keyed in full.
Most of that hole is now closed by keying a truncated subcheck from its export, below.

The match against the branch's paths therefore runs over the printed sample, not over every failure.
A failure that names a file the branch touched but lands above its subcheck's cap is not matched.
This is inherited, not introduced: the old rule, read the three checks and stop if a failure names
your file, had the same hole and did not record it. What is new is that the totals are written down
and compared, so a rise in a truncated subcheck is reported and stops the landing, because nothing
can say whether what was added belongs to the branch. The summary prints which subchecks are
truncated and how many failures that leaves unkeyed, and `--json` carries each check's
`failure_total`, the baseline's, and every subcheck's `reported` and `sampled`.

Excused items are counted by error kind, not just totalled, so a new failure kind arriving under a
prefix that already excuses thousands shows up by name rather than as a slightly larger number.

A truncated subcheck is compared **by its total only**. Which rows land inside a 50- or 100-row
sample can change with no failure added or removed, and a fingerprint first seen there would
otherwise read as a new failure at every landing. Its rows are still read for the branch match,
which does not depend on the baseline. Where a subcheck prints every failure, a row that was not
there before really is new, and is reported as such.

### A validator both aggregates run

`run-gates` and `audit-governance` run the same validators. `pm-plans-verify.py` re-invokes every
subcheck of either aggregate as `pm-plans-verify.py <command> --report <tmp> <arguments>`, and for
`validate_implementation_readiness` in one and `implementation_readiness` in the other it builds the
same command line. The two copies differ only in what they print: 50 rows and 100. Where the
run-gates copy prints only a sample, in this run or when the baseline was recorded, and the
audit-governance copy prints every failure, the audit-governance rows are the complete list, and the
run-gates copy is judged by them (review L-07, as the brief owner answered it). The run-gates copy's
rows are then not keyed, not matched against the branch's paths and not counted, its total is not
used for growth, and its baseline buckets are not reported gone. The audit-governance copy's rows are
judged by every rule in this file, and a rise in its total is not a truncated rise, because every row
it adds is printed and judged.

A run-gates copy is paired with its audit-governance copy only when all of these hold. Otherwise it
keeps the truncated rule, and the summary says which condition failed:

- both run the same command with the same arguments, as `scripts/pm-plans-verify.py` itself builds
  them from the subcheck's name with `_aggregate_subcheck_command_id` and
  `_aggregate_subcheck_cli_args`, read from the checked tree; `verify_spec_lock`, which run-gates
  runs in-process, calls the function its `verify-spec-lock` command runs;
- at the same version: `HEAD` and a digest of every file under `scripts/` are the same before the
  run-gates run and after the audit-governance run of the one landing check;
- neither copy timed out;
- their totals agree;
- the audit-governance copy printed every failure, in this run and when the baseline was recorded;
- every row the run-gates copy printed is among the audit-governance copy's rows.

Most validator inputs are not bound separately, since each validator reads its own set of files.
The ignored readiness audit inputs are bound as described above. For other inputs, the equal
totals and the rows found in both copies are the evidence that both saw the same inputs. The summary
prints one line for each run-gates subcheck whose failures are a sample, saying which copy was judged
and why, and `--json` carries the same as `validator_pairs`, so a replay shows which copy was judged.
The baseline still records both copies, for a landing where they do not pair.

Replayed over the retained reports of 2026-09-21 and 2026-09-24, this pairs only the readiness
validator, and only where its total was 100 or less: 33 at the storage registry repairs landing and
39 at the terminal.workgroup_moved and landing-check rules landings. The other truncated validators
do not pair, because their audit-governance copies print only 100 rows: evidence and plan-graph (876
at those landings, 1,552 on 2026-09-21), audit-closure (201), the PRD contracts (1,240), and on
2026-09-21 readiness itself (218 and 124) and plan-migration (181). A rise in them still stops the
landing, unless the subcheck is keyed from its export, below. A run-gates copy keyed from its export,
or compared with the rows the baseline recorded from one, is no sample and is not paired.

### Subchecks keyed from their export

A subcheck's printed rows are a sample, but its command writes all of them. Both aggregates re-invoke
every subcheck as `pm-plans-verify.py <command> --report <tmp> <arguments>` (`_run_subprocess_check`),
take its total as the number of rows in that report (`compact_gate_report`) and print the first 50
(`cmd_run_gates`) or 100 (`cmd_audit_governance`) of them. `run-gates` runs `verify_spec_lock`
in-process, but through `cmd_verify_spec_lock`, the function its `verify-spec-lock` command runs.
So when the landing check runs a subcheck's command line again, with the arguments
`pm-plans-verify.py` itself builds for it (`_aggregate_subcheck_command_id` and
`_aggregate_subcheck_cli_args`), the report that run writes is the complete list of what the subcheck
counted: its export (the exports brief of 2026-09-24).

**Which subchecks have one.** It was read in `scripts/pm-plans-verify.py` at `bc1d99c11e`, and in
every validator it calls. The two aggregates run 36 commands: 36 subchecks in `run-gates` and 33 in
`audit-governance`, with both copies of a validator running one command line. None of the commands
drops rows before it reports them, but one: `validate-audit-closure`, whose
`cmd_validate_audit_closure` keeps only the first 200 of `pm-audit-closure.py`'s errors, so its own
report is a sample whenever there are more. That pair, `validate_audit_closure` and `audit_closure`,
has no complete export and keeps the truncated rule. Two commands keep 50 entries of a list nested
inside one row (`gui_asset_policy_failed.failures` and `audit_closure_reopened_rows_present.rows`).
That changes what the row says, not how many rows there are. The list is `EXPORT_COMMANDS` in the
script, and the run header prints it. A command added to the aggregates later has no export until
someone reads it, and `test_the_real_map_reads_every_aggregate_command_as_a_complete_export_but_audit_closure`
fails until then.

| Command | `run-gates` subcheck | `audit-governance` subcheck |
|---|---|---|
| `check-project-artifacts` | `check_project_artifact_requirements` | `project_artifacts` |
| `check-shards` | `check_shards` | `shards` |
| `json-syntax` | `json_syntax` | (not run) |
| `lint-banned-phrases` | `lint_banned_phrases` | (not run) |
| `lint-contractrefs` | `lint_contractrefs` | `support_refs` |
| `lint-path-refs` | `lint_path_refs` | `path_refs` |
| `validate-audit-closure` (no complete export) | `validate_audit_closure` | `audit_closure` |
| `validate-audit-status-index` | `validate_audit_status_index` | `audit_status_index` |
| `validate-auto-decisions` | `validate_auto_decisions` | `auto_decisions` |
| `validate-browser-event-admission` | `validate_browser_event_admission` | `browser_event_admission` |
| `validate-case-l-non-event-materialization` | `validate_case_l_non_event_materialization` | `case_l_non_event_materialization` |
| `validate-evidence` | `validate_evidence` | `evidence` |
| `validate-filesafe-security-policy` | `validate_filesafe_security_policy` | `filesafe_security_policy` |
| `validate-forge-backup-acceptance` | `validate_forge_backup_acceptance` | `forge_backup_acceptance` |
| `validate-github-project-integration` | `validate_github_project_integration` | `github_project_integration` |
| `validate-goal-runtime-event-fixtures` | `validate_goal_runtime_event_fixtures` | `goal_runtime_event_fixtures` |
| `validate-gui-asset-policy` | `validate_gui_asset_policy` | `gui_asset_policy` |
| `validate-implementation-readiness` | `validate_implementation_readiness` | `implementation_readiness` |
| `validate-new-contracts` | `validate_new_contracts` | (not run) |
| `validate-plan-graph` | `validate_plan_graph` | `plan_graph` |
| `validate-plan-migration` | `validate_plan_migration` | `plan_migration` |
| `validate-plans-to-code-handoff-schema` | `validate_plans_to_code_handoff_schema` | `plans_to_code_handoff_schema` |
| `validate-pm7-gui-fixtures` | `validate_pm7_gui_fixtures` | `pm7_gui_fixtures` |
| `validate-prd-planning-runtime-contracts` | `validate_prd_planning_runtime_contracts` | `prd_planning_runtime_contracts` |
| `validate-project-output-fixtures` | `validate_project_output_fixtures` | `project_output_fixtures` |
| `validate-runtime-artifact-schemas` | `validate_runtime_artifact_schemas` | `runtime_artifact_schemas` |
| `validate-server-command-gap` | `validate_server_command_gap` | `server_command_gap` |
| `validate-testing-session-event-admission` | `validate_testing_session_event_admission` | `testing_session_event_admission` |
| `validate-touch-closure` | `validate_touch_closure` | `touch_closure` |
| `validate-ui-command-response` | `validate_ui_command_response` | `ui_command_response` |
| `validate-usage-contract-drift` | `validate_usage_contract_drift` | `usage_contract_drift` |
| `validate-usage-gui-fixtures` | `validate_usage_gui_fixtures` | `usage_gui_fixtures` |
| `validate-web-capability-contracts` | `validate_web_capability_contracts` | `web_capability_contracts` |
| `validate-wiring-matrix` | `validate_wiring_matrix` | `wiring_matrix` |
| `validate-working-notebook-contracts` | `validate_working_notebook_contracts` | `working_notebook_contracts` |
| `verify-spec-lock` | `verify_spec_lock` | `spec_lock` |

**When a subcheck is keyed.** A subcheck that prints only a sample in a landing run is keyed from its
export when all of these hold:

- its command writes a complete export, as above;
- the baseline holds its rows in full, because it printed all of them or recorded them from an
  export;
- the export finished within `--subcheck-timeout-seconds` and could be read;
- the export's total equals the printed total, and every row the aggregate printed is among its rows.

Then every row is keyed from the export and the subcheck is not truncated. The kind rules judge every
row, as for a subcheck that prints everything: staleness is excused, a pre-existing or improved count
never blocks, and a failure that is not staleness on a file the branch touched blocks, whether or not
it falls inside the printed sample. A rise in the total stops nothing by itself, because every row it
adds is keyed and judged. One export run serves both copies of a validator. The summary prints a line
for each keyed subcheck, with how its rows came out, for example
`[keyed    ] run-gates/validate_plan_graph (50 of 133 printed): its export (validate-plan-graph) holds
all 133 rows, the printed total: 132 staleness, 1 pre-existing`.

**When it falls back.** Otherwise the truncated rule applies as before, and the summary says which case
and why, ending "the truncated rule applies":

- *no complete export*: the audit-closure pair, a command the list does not name, or a
  `pm-plans-verify.py` whose map of subchecks to commands cannot be read;
- *baseline sample*: the baseline printed only part of the subcheck's rows and recorded no export.
  Complete rows now against a sample then cannot be judged by the kind rules: a pre-existing failure
  outside the baseline's sample, on a file the branch touched, would read as new and block, and a rise
  elsewhere would go unjudged, so the export is not run;
- *total mismatch*: the export holds a different number of rows than the printed total, for example
  because the tree changed between the two runs: "its export (validate-plan-graph) holds 132 rows, but
  the printed total is 133";
- *rows mismatch*: the export holds the printed total, but a row the aggregate printed is not among its
  rows, so the second run did not see what the aggregate saw, for example because the tree changed between
  the two runs;
- *export timeout* or *unreadable*: the export did not finish within the bound, or its report is not
  JSON or holds no list of failures. This is not an infrastructure result: the subcheck itself
  finished, so its total and its printed rows are known, and only the keying falls back.

**How the export runs.** `python3 scripts/pm-plans-verify.py <command> --report <file> <arguments>`
from the root, in a process group of its own and marked `PM_PLANS_VERIFY_AGGREGATE_CHILD=1` as the
aggregates mark their children, so that a validator it starts stays in that group. It is killed with
the whole group at `--subcheck-timeout-seconds`. The file is in a scratch directory outside the
repository and is deleted again. Only subchecks that print a sample are exported, so a landing without
one runs nothing more. On local disk `validate-plan-graph` took 13 seconds, `validate-evidence` 12
and `validate-prd-planning-runtime-contracts` under one.

**The baseline.** `--record-baseline` keys from exports too. For every subcheck it keys, the baseline
records `exported` beside `reported` and `sampled`, and the complete rows as `export_buckets`, next to
`buckets`, which still holds the printed rows of every subcheck. A landing that keys the subcheck from
its own export, or in which it prints every failure, compares with `export_buckets`. A landing whose
export falls back compares its printed sample with the printed `buckets`, sample with sample, exactly
as before. The baseline recorded at `792d2fb8b1` has no exports. Until the next refresh after a Plans landing, the
PRD contracts (1,240), which it holds only a sample of, keep the truncated rule as a baseline sample;
audit-closure (201) keeps it after the refresh too, because it has no complete export. The refresh
records the PRD contracts from their export.
Evidence and plan-graph are complete in that baseline (0 each), so a landing keys them already.

In `--json`, `exports` carries `complete_export_commands` and `no_complete_export`, and under
`subchecks` one row per sampled subcheck. Each row has its `case` (`keyed`, `no_export`,
`baseline_sample`, `total_mismatch`, `rows_mismatch`, `export_timeout` or `export_unreadable`), the `reason`, the
number of rows `exported`, and for a keyed subcheck its `classes`. `compared_with_baseline_exports`
names the subchecks compared with the baseline's export rows without being exported themselves. A
keyed subcheck's count carries `exported`, and its row in `grown_subchecks` carries
`keyed_from_export`.

The motivating case: `plans/ea-certified-anchors-20260924`, rebased on `b3169c48d9`, edits
`Goal_Runtime_System.md` and `storage-plan.md`. `validate_plan_graph` rises from 1 to 133, with 132
`artifact_hash_stale` rows for the two documents and their 130 shards in the live plan-sharding
evidence bundle, plus `main`'s one `missing_ref`. That was a truncated rise past both print caps,
so the check exited 2 on staleness the rule says never stops a landing. Keyed from its export, the
same run exits 1: the 132 rows are staleness and the `missing_ref` is pre-existing.

What this leaves open: audit-closure stays sampled, and its validator's errors past the first 200
are seen by nothing. The export is a second run of the same validator. The equal total and every printed row
being among its rows are the evidence that it saw what the aggregate saw.

## What counts as governance staleness

AGENTS.md names four things as governance staleness: Spec Lock `stale_hash`, stale owner or artifact
evidence hashes, a stale readiness report, and the stale plan-migration snapshot. Editing canon
produces them until the next reseal, which Jared assigns to an agent as its own task, so they never stop a landing: on a file the
branch edited they are reported with a reseal request and the check exits 1. The script recognises
them by error kind.

| What AGENTS.md names | Error kinds |
|---|---|
| Spec Lock `stale_hash` | `stale_hash`, and every kind ending `_spec_lock_hash_stale`: the readiness validator's Spec Lock check for each family it certifies, today `event_record_`, `execution_unit_context_`, `non_executable_closure_` and `storage_value_registry_spec_lock_hash_stale` |
| stale owner or artifact evidence hashes | `artifact_hash_stale`, `stale_audit_status_index`, `event_authority_currentness_source_drift` (the Event Authority currentness inventory's stored hash of an edited source), `event_authority_currentness_validator_drift` (the currentness receipt's stored hash of `scripts/pm-event-authority-currentness.py`: a canon edit cannot cause it, an edit of that script does, and its reseal is a currentness edition that refreshes the gitignored receipt), and an audit-closure failure whose detail says a stored hash "is stale" |
| a stale readiness report | `pnc019_source_hash_stale`, `buildability_gate_report_stale_or_not_canonical`, `buildability_passed_with_stale_source_hashes`, the `_spec_lock_hash_stale` kinds above, and the readiness growth counter below |
| the stale plan-migration snapshot | every `current_snapshot_*` kind, `stale_batch_report_sha256_after`, `complete_final_summary_live_plan_unit_count_stale`, `doc_count_mismatch`, `inventory_doc_set_mismatch`, `superseded_run_final_summary_missing` |

A bucket of one of these kinds that grew is staleness too, so it does not stop the landing either.

Audit closure reports stale hashes and other findings under `audit_closure_validator_error`.
When both sides of the subcheck are complete and the bucket's baseline fingerprints are available,
its growth is staleness if each current non-stale row matches a distinct recorded fingerprint.
Each recorded fingerprint proves one occurrence. A new non-stale fingerprint, an unaccounted repeat
of one, or a count-only baseline bucket leaves the growth blocking. The bucket key and fingerprints
stay as recorded. Sampled audit-closure subchecks still use total-only growth.

**A renamed line-range shard (T32).** A `missing_ref` is a stale artifact evidence hash in another form,
and counts as staleness, when all of these hold, read from the checkout: the reference comes from sealed
evidence (its `path` is under `Plans/.evidence/`); its target is a line-range shard directly under
`Plans/_shards/<document>/` (`NNN-lines-A-B.md`) that no longer exists; and that document's current
`manifest.json` still holds a shard with the same `shard_id` under another line-range name, and that shard
exists. Documents sharded by line count (JSON documents among them) rename a shard whenever an edit adds or
removes lines, so the sealed evidence names the old range until the reseal refreshes it (the Q5 landing,
2026-11-05: `002-lines-201-235.md` became `002-lines-201-237.md`). A `missing_ref` bucket that grew is
staleness only when its rows that are not renamed shards are no more than the baseline held. Every other
`missing_ref` keeps its class: a deleted unit (the manifest holds no shard with that id), a missing path that
is not a line-range shard, and a reference from a file that is not sealed evidence. Three more conditions
come from git (T53): both paths must be relative and in their normal form (`Plans/.evidence/../x` is not
evidence), the branch must not have changed the evidence file itself (it is not in
`git diff --name-only <base>..HEAD`: generated evidence changes only in a reseal, so a reference the branch
wrote into it is the branch's own; T63: that list is read with `-z` and `core.quotePath=false`, so a non-ASCII
path is compared as itself, the working tree must hold no change to the file either (`git status`: not
modified, staged, deleted or untracked), and neither the file nor a folder above it may be a symbolic link),
and the old target must have existed at the base
(`git cat-file -e <base>:<target>`: a range name that never existed is not a rename). With no base, as when
recording the baseline, the rule never applies. `renamed_shard_ref` and `RenameContext` in the script are
the rule; `tests/test_pm_landing_check.py` `RenamedShardStaleness` reproduces the Q5 case against a git base
and the negatives, P6 and P8 among them.

The working-tree check includes ignored files and rejects skip-worktree or assume-unchanged index
flags. It also compares the on-disk file's blob ID after Git applies the path's clean filters with the
blob ID at HEAD (T137). A clean CRLF checkout can keep the rename classification, and a content edit
that changes the filtered blob still loses it. The ignored-file regression (T195) checks that the
refusal names the `!!` status entry. With ignored-file reporting disabled, the HEAD-blob check
still refuses the same file because it has no blob at HEAD.

Deliberately not on the list: the shard and index kinds such as `shard_hash_stale` and
`stale_generated_index_artifact`, because a branch that edits canon regenerates those and a stale one
is the branch's to fix; `event_authority_currentness_audit_unavailable`, which says the ignored audit
inputs are absent from the tree, not that a hash is stale;
`event_authority_currentness_artifact_drift`, because the audit artifacts are gitignored and no
branch can change them, so drift there means the ignored inputs changed;
`pnc019_source_hash_path_missing` and `implementation_readiness_self_tests_failed`.

### The readiness growth counter

The readiness validator, `validate_implementation_readiness` in run-gates and
`implementation_readiness` in audit-governance, prints 50 or 100 rows of its total. Where the
gitignored Event Authority currentness audit inputs are present, as in the shared checkout, it
compares every inventoried source with its stored hash, and every edited source adds a source-drift
row; without them it reports one `event_authority_currentness_audit_unavailable` row instead. Both
shared-checkout landings of 2026-09-21 saw the total rise from 124 to 218 in each aggregate, while a
clean worktree at the same commit, without those inputs, stayed at 124; the retained reports cannot
say row by row what the other 94 were. A rise in a truncated subcheck otherwise stops the landing,
because nothing can match what was added against the branch's paths. For the readiness subcheck the
rise is instead the growth counter of the stale readiness rows, and counts as staleness, when the
rows it printed say so:

- at least one printed row is a staleness kind whose bucket is new or holds more rows than the
  baseline's, and that row names a file this branch touched, so the stale growth is visible and is
  the branch's; and
- no printed row that is not staleness is new or in a bucket that grew, so nothing else is visibly
  growing.

Otherwise it is judged like any other truncated rise and stops the landing. Stale growth that names
only files the branch did not touch, such as `main`'s own drift since the baseline, does not count.
The rows above the print cap stay unseen: a readiness failure that is not staleness and lands above
the cap during a rise the sample explains is not caught. Every truncated subcheck has that hole; here
it is accepted because the rule names the counter as staleness. The evidence and plan-graph subchecks
get no such exception, and a rise in them still stops the landing. In `--json`, each row of
`grown_subchecks` carries `stale`, true for the readiness growth counter.

## Pre-existing and improved failures

A failure that is not staleness, in a bucket the baseline holds, whose count on the branch has not
risen above the baseline's, is pre-existing, whether or not its content changed. It never stops a
landing. It is reported as `pre-existing` when the count is the same and `improved` when it fell,
with both counts, whenever it would have been reported at all: when it names a file the branch
touched, or when its content changed so that its fingerprint is not in the baseline. One with
unchanged content that names no branch file is not reported, as before.

The count is the bucket's, `check | subcheck | error | path`, because that is what the baseline
records; the fingerprint is not part of it. That is what makes a changed row pre-existing. The
storage registry repairs landing of 2026-09-24 stopped on an
`implementation_readiness_self_tests_failed` row, one in each aggregate, that listed seven failing
self-test checks on `main` and three on the branch: one row in one bucket both times, with only its
fingerprint moved. In a subcheck that prints only a sample, both counts are the rows inside the
sample, since the baseline was recorded from the printed rows too.

A bucket whose count rose is not pre-existing. Its non-stale rows on a touched file stop the landing,
and its growth is judged by the rules in "What counts as governance staleness" above. In `--json`,
`pre_existing` lists every reported pre-existing failure, and those rows and the matching `on_branch` rows carry `standing`,
`baseline_count` and `count`.

What this cannot prove: a failure that sat above its subcheck's print cap when the baseline was
recorded is not in `baseline.json`, so when it later falls inside the sample on a touched file, the
run cannot tell it from an old one. It is reported as `unknown-pre-existing`, in one line naming the
row and the baseline's reported total, and it never stops the landing, as long as the subcheck
reports no more failures than the baseline did. That is T272, the audit-closure row appended after
the validator's 200 capped errors: the baseline printed 100 of 201, main had the reopened-rows row,
and a branch that cut the total to 68 printed it for the first time and blocked on it. The tradeoff
is the other direction: a real new failure in such a subcheck, on a landing whose own cuts keep the
total at or below the baseline's, is indistinguishable from an old one, and is reported as unknown
rather than excused silently. A subcheck that reports more than the baseline did still keeps the
truncated rule and stops the landing. The run-gates copy of the storage registry repairs self-test
row, mentioned above, is now judged by its audit-governance copy (see "A validator both aggregates
run"), so the brief's motivating case replays as exit 1 with 0 blocking items instead of 2 with 1.
`--json` keeps these rows in `unknown_pre_existing`, with `baseline_total`, `baseline_sampled`,
`unprinted_rows` and `unmatched_rows`.

It cannot tell one failure from another of the same kind on the same path. A branch that fixes one
missing reference in a document it edits and adds another keeps the bucket's count, so the new one
reads as pre-existing. The summary counts such rows, meaning changed content on a file the branch
touched, so that the lander compares them with the baseline's. The count it compares against is the
baseline's, not `main`'s. A failure that `main` fixed after the baseline's commit, and that a branch
brings back on a file it edits, reads as pre-existing, so the older the baseline, the more such
regressions it excuses; that is why rule 2 applies only against a current baseline, below. A count
that fell because the subcheck stopped part-way reads as improved. The stop itself stops the landing
only if it names a file of the branch's; otherwise it is reported as new.

### Only against a current baseline

Rule 2 applies only while the baseline is current: the commit `baseline.json` names is an ancestor
of the base, the branch's rebase target (`--base`, `origin/main` at landing), and no more than seven
days older than it by committer time (`git show -s --format=%ct` of each commit). Refreshing after
each Plans landing keeps the baseline tied to canon changes; the seven-day limit still applies
between refreshes. When it is current, the summary's second line says so and gives the age; `--json`
carries the finding as `baseline_currency`: both commits, `ancestor`, `age_days`, `max_age_days`,
`rule_two_applies` and the reason.

When the baseline is not current, because its commit is more than seven days older than the base, is
not on the base's history, is unknown to the repository or is missing, rule 2 is off for that
landing. A failure in a baseline bucket whose count has not risen is then judged as it was before
rule 2: on a file the branch touched it stops the landing with exit 2, and one whose content changed
is new. The report says so in its first lines, before anything else (`--json` prints the same lines
to stderr): the baseline is stale and must be re-recorded before the next landing. Never re-record
it to make the landing at hand pass; that excuses exactly the failure it was meant to show. Rule 1,
staleness, and rule 3, timeouts, do not depend on it.

The base is what `--base` names, so the age is measured against the rebase target the lander passes;
at landing that is `origin/main` just fetched.

## Subchecks that time out

`pm-plans-verify.py` kills an aggregate subcheck that is still running at
`--subcheck-timeout-seconds` and reports one `subprocess_timeout` row in its place, or
`subcheck_timeout` for `verify_spec_lock`, the one subcheck it runs in-process. Such a subcheck has
no result. Its row is an infrastructure result: printed on its own line under "Infrastructure
results" with the subcheck, the command, how long it ran before it was killed and the limit, which
are the same number because the subcheck is killed when the limit runs out, and never counted as a
new failure, as growth of its subcheck's total, or as a blocker. The run it happened in was not
fully verified, so the timeout lifts an exit 0 to 1: exit 1 means reported, nothing stops the
landing, which is exactly that (review L-08, as the brief owner answered it). It changes no other
exit code: a 1 stays 1 and a 2 stays 2, and exit 0 is left for a complete run with nothing to
report. The timed-out subcheck is left out of every comparison, so what the baseline recorded for it
is not reported as gone either, and the summary ends by naming the subchecks that did not finish,
with how long each ran and the limit: rerun each on its own to see what it reports. A timeout hides
everything the subcheck would have reported, including failures on the branch's own files, and the
exit code shows only that the run was not fully verified. Before pushing `main`, the lander reruns
each timed-out subcheck on its own and judges what it reports by the rules above. The summary never
calls such a run clean. In `--json` the timed-out subchecks are listed under `infrastructure` with
`elapsed_seconds` and `limit_seconds`, beside the `subcheck_timeout_seconds` the run used.

The landing check passes a default limit of 1800 seconds to the aggregates. After the November
2026 stage 1 re-audit expanded the closure registry, the previous 600-second limit killed
`validate_audit_closure` and `validate_audit_status_index` in `run-gates`. Baseline recording
completed on retry with `--subcheck-timeout-seconds 1800` (T271).
Since 2026-11-04 `pm-plans-verify.py` uses 600 seconds when `run-gates` or
`audit-governance` runs without `--subcheck-timeout-seconds`, and for the standalone commands that run
their validator as a subprocess and accept that flag (such as `validate-plan-migration`). Commands
that run in-process have no such bound, and `validate-bootstrap-ledgers` keeps its own 180-second
`--timeout-seconds` per ledger. The measured case: `lint-contractrefs` takes about 199 seconds in the shared checkout on the
network mount, and finds nothing when run on its own (0 failures at `e44b9186fb`). At the
terminal.workgroup_moved landing of 2026-09-24 the 180-second bound killed it in both aggregates, and
the two timeout rows read as new failures and lifted two subcheck totals from 0 to 1.

A baseline is never recorded from a run in which a subcheck timed out: `--record-baseline` exits 3
and writes nothing, because a baseline that says a subcheck passed, or failed once, when it never
finished would mislead every landing after it. Rerun with a larger `--subcheck-timeout-seconds`. For
the refresh after a Plans landing, complete that retry before committing the follow-up and releasing
the landing lock. The older baseline remains in place; rule 2 applies only while it is no more than seven days older than the base.

## Which paths count as the branch's

`Plans/_shards/**` and `Plans/.plan_index/**` are regenerated whole whenever any owner document
changes, so every branch that edits canon rewrites the index row of every unit in the repository.
They are kept out of the touched set: matching on them made a failure about a unit the branch never
opened stop its landing, and the second trial here matched 14 such failures on `plan_units.jsonl`.

A failure recorded against a generated index is matched on **unit identity** instead: the check
reads `owner_doc` from `Plans/.plan_index/plan_units.jsonl`, collects the units owned by the
documents the branch actually changed, and matches the failure only when the `plan_unit_id` in its
record is one of those. Everything else is matched on paths exactly as before, and a derived-file
failure that names a touched path in its own text still matches on that path.

`baseline.json` is itself one of the files `run-gates` parses, because its `json_syntax` gate reads
every `.json` and `.jsonl` file git knows about. It only has to stay valid JSON, which it is by
construction, and it is not part of any hash census.

## What a full checkout has to contain

A baseline must be recorded in a tree that has everything the checks read. The readiness audit
directory is selected and exposed automatically as described above. The tracked tree is not
enough: these inputs are gitignored and exist only in the shared checkout
`/mnt/Cursor/PuppetMaster`, and without them `json_syntax` and `pm7_gui_fixtures` fail with
missing-file errors that a real landing never sees.

    tests/fixtures/governance/
    tests/fixtures/pm7_shared/
    tests/fixtures/usage_gui/cases/
    tests/fixtures/usage_gui/presentation/
    tests/test_pm_evidence_artifact_binding_modes.py
    tests/test_pm_plan_migration.py
    tests/agent_packet_restrictions          (symlink into /mnt/Cursor/PuppetMaster-Evidence)

Six of those seven are now tracked, each file named individually in `.gitignore` by the
tests-tracking convention, **including
`tests/fixtures/governance/raw_evidence_capture_modes.schema.json`** at line 103 alongside its
manifest: without that schema `json_syntax` reports `raw_capture_manifest_schema_unavailable`, so
`run-gates` could not be clean in any fresh clone until this branch tracked it. Each directory is
opened only far enough to name its files, 29 in all, so a fixture added later stays ignored until
someone names it. The seventh, the
`tests/agent_packet_restrictions` symlink, stays ignored on purpose and has to be recreated in any
tree that records a baseline; the runbook below does that. The baseline records what it was taken
with, in `untracked_inputs`.

Both aggregate checks walk files on disk. The contract-reference linter reads every eligible
Markdown and JSON file under `Plans/`, including ignored files in `Plans/.audits/`. The usage,
web and migration checks also select JSONL, YAML and schema inputs. Discover these inputs in
both checkouts with the same Git inventory:

```sh
git ls-files --others --ignored --exclude-standard -z -- \
    Plans reports scripts Concepts tests .puppet-master/project
```

Apply the checks' file selection to that list. Keep the Plan text and reference types
(`.md`, `.json`, `.jsonl`, `.yaml`, `.yml`, `.schema`, `.py`, `.txt`, `.tsv`, and files
whose name contains `.schema.`), the readiness audit directory, and the validator tree under
`scripts/` outside Python caches. Keep fixture text and source files under the other listed
roots and assets read by the PM7 concept. Under `tests/`, also use the checked GUI asset policy's
source extensions and exclusions. Include explicitly declared evidence and readiness
hash targets from the Spec Lock, evidence records, audit closure registry, legacy audit
inventory and readiness receipt even if their extensions differ. The raw-capture manifest supplies the exact
files to hash behind `tests/agent_packet_restrictions`.

Copy the selected files from the shared checkout and preserve their relative paths. Compare
the set of paths and each SHA-256 before checking. Repeat both comparisons before fast-forward
and before push. A file visible on only one side invalidates the receipt. A full audit-folder
copy can include tens of gigabytes of unrelated capture data.

Anyone who writes a checker input in the shared checkout, including readiness receipts, currentness editions and other ignored inputs the check reads, must hold the landing lock.

## Landing by hand

1. Take the landing lock as described in `AGENTS.md`. Save the lander name, branch and UTC time on
   the first line of `holder.txt`, then `token: <unique token>` on its own line. Use an exclusive
   `flock` on `pm-land-reap.guard` in the parent of `held` for lock takeover, holder updates and
   release. Re-read the token under the guard before updating or releasing the holder. Rewrite the
   holder with an atomic rename and keep its token and any recovery fields. Renew the UTC time
   before each remote wait and at least every 25 minutes, including during Plans follow-up and
   while reviewing reports. Stop on lost ownership. Fetch and record the full `origin/main` SHA.
   Rebase and push the topic branch. Record its full commit and tree SHAs.
2. Use `ssh nas1-agent` for Nas1. If it is busy or unavailable, use `ssh 1070ti` for the 1070ti,
   which is slower. Fetch the topic and create a temporary, detached worktree at the recorded
   commit in `~/src/PuppetMaster` using `git worktree add --detach <path> <commit>`.
   Confirm `git rev-parse HEAD HEAD^{tree}`, `git status --porcelain`, and
   `git config --bool --get core.sparseCheckout`. The SHAs must match and the status must be empty.
   The sparse setting must be false or unset. Check `git ls-files -v` for skip-worktree and
   assume-unchanged entries.
3. Discover and copy the ignored inputs above from the shared checkout. Recreate the raw evidence
   directory link using the resolved shared target. Hash the files behind the link at the exact
   paths in `tests/fixtures/governance/raw_evidence_capture_modes.json`. Save a manifest with both
   inventories’ relative paths and SHA-256 values. Compare by path and hash, including the resolved
   link target. Record UTC start and end times, host, full commit, tree, base and input inventory.
4. Run the shard check in the remote worktree and use the executable receipt steps below for the
   landing check. Wait on the remote job in 25-minute intervals and renew the holder before each
   wait. Use the original exit saved by the remote script. Apply the existing rules for changed
   baseline rows and timeouts.
5. Confirm ownership and fetch again. If the base moved, repeat from the rebase. Before the
   fast-forward and again before the push, verify remote HEAD, tree, full clean checkout, the set
   and hashes of the ignored inputs, and the hand receipt.
6. Run the guarded fast-forward block below. It checks shared inputs and writes the durable
   marker before merging. Verify the resulting HEAD and tree, run the shared shard check, repeat
   remote verification, then run the guarded push block against the exact fetched base. Both
   blocks repeat the shared-input preflight under the guard after verification and any fetch.
   If Git refuses the fast-forward, keep the lock and journal and use the manual recovery
   instructions. Use the rollback procedure for a completed fast-forward that remains unpublished.
7. For Plans changes, keep the lock and complete the follow-up below. Confirm ownership before
   worktree removal and before release. Release after publication or rollback is reconciled and
   any Plans follow-up is finished.

### Hand check receipt and publication

Set `PM_LAND_BASE` and `PM_LAND_COMMIT` to the full checked SHAs. Set `PM_LAND_RECEIPT_DIR` to a
unique absolute directory on the evidence share outside the checkout. Set `PM_LAND_SCRIPT` to the
absolute path of the current lander script in a trusted local worktree on each host. Export these
variables on the idle host, and run the following scripts from the checked worktree.

#### Save the checker receipt

Save this block as a run script and start it on the idle host with
`long-job start <name> --cwd <worktree> --log <share-log> -- bash <run-script>`. Wait using
`long-job wait <name> --timeout 1500` and repeat on 124 after renewing the lock. A wait result
of 1 can come from checker exit 2 or 3. Read `checker.exit` for the original number.

```sh
set -eu
mkdir -p -- "$PM_LAND_RECEIPT_DIR"
report="$PM_LAND_RECEIPT_DIR/landing-check.json"
python3 -B "$PM_LAND_SCRIPT" inventory >"$PM_LAND_RECEIPT_DIR/hand-inputs-before.json"
code=0
python3 scripts/pm-landing-check.py --base "$PM_LAND_BASE" --subcheck-timeout-seconds 1800 --json \
    --readiness-audit-root "$PWD/Plans/.audits/event-authority-2026-08-13-currentness" \
    --keep-check-reports "$PM_LAND_RECEIPT_DIR/subchecks" \
    >"$report" 2>"$PM_LAND_RECEIPT_DIR/landing-check.stderr" || code=$?
printf '%s\n' "$code" >"$PM_LAND_RECEIPT_DIR/checker.exit"
python3 -B "$PM_LAND_SCRIPT" inventory >"$PM_LAND_RECEIPT_DIR/hand-inputs-after.json"
python3 - "$report" "$code" "$PM_LAND_COMMIT" "$PM_LAND_BASE" "$(git rev-parse --absolute-git-dir)" <<'PY'
import hashlib
import json
from pathlib import Path
import sys

name, code, commit, base, git_dir = sys.argv[1:]
report = Path(name)
exit_file = report.with_name("checker.exit")
receipt = report.with_name("hand-receipt.json")
before = json.loads(report.with_name("hand-inputs-before.json").read_bytes())
after = json.loads(report.with_name("hand-inputs-after.json").read_bytes())
changed = sorted(name for name in before.keys() | after.keys() if before.get(name) != after.get(name))
if changed:
    print("Remote ignored inputs changed during the check: " + ", ".join(changed), file=sys.stderr)
    raise SystemExit(3)
record = {"exit_code": int(code), "report": str(report), "report_sha256": hashlib.sha256(report.read_bytes()).hexdigest(),
          "commit": commit, "base": base, "ignored_inputs": before}
payload = (json.dumps(record, sort_keys=True) + "\n").encode()
for path, data in ((exit_file, (code + "\n").encode()), (receipt, payload)):
    temporary = path.with_suffix(".tmp")
    temporary.write_bytes(data)
    temporary.replace(path)
(Path(git_dir) / "pm-land-hand-receipt.sha256").write_text(hashlib.sha256(payload).hexdigest() + "\n")
PY
exit "$code"
```

#### Verify the hand receipt

Run this block on the idle host from the same worktree before fast-forward and again before
push. It verifies the separate exit file, receipt digest and report hash. It stops for checker
exit 2 or 3. For exit 0 or 1 it also checks the report's full commit and base, then leaves any
landing judgment to the lander. Bring the printed verified digest back to the shared checkout
as `PM_LAND_RECEIPT_SHA256` for the corresponding publication step.

```sh
set -eu
test "$(git rev-parse HEAD)" = "$PM_LAND_COMMIT"
python3 -B "$PM_LAND_SCRIPT" inventory >"$PM_LAND_RECEIPT_DIR/hand-inputs-verify.json"
python3 - "$PM_LAND_RECEIPT_DIR" "$PM_LAND_COMMIT" "$PM_LAND_BASE" "$(git rev-parse --absolute-git-dir)" <<'PY'
import hashlib
import json
from pathlib import Path
import re
import sys

name, commit, base, git_dir = sys.argv[1:]
root = Path(name)

def refuse(message):
    print(message, file=sys.stderr)
    raise SystemExit(3)

try:
    payload = (root / "hand-receipt.json").read_bytes()
    witness = (Path(git_dir) / "pm-land-hand-receipt.sha256").read_text().strip()
    if hashlib.sha256(payload).hexdigest() != witness:
        refuse("hand receipt SHA-256 changed")
    receipt = json.loads(payload)
    code = int((root / "checker.exit").read_text())
    if type(receipt["exit_code"]) is not int or receipt["exit_code"] != code or code not in (0, 1, 2, 3):
        refuse("original exit and receipt disagree")
    if any(not re.fullmatch(r"[0-9a-f]{40}", item) for item in (commit, base)):
        refuse("expected full commit and base SHAs")
    if (receipt["commit"], receipt["base"]) != (commit, base):
        refuse("receipt commit or base does not match")
    report_path = root / "landing-check.json"
    raw = report_path.read_bytes()
    if receipt["report"] != str(report_path) or receipt["report_sha256"] != hashlib.sha256(raw).hexdigest():
        refuse("report SHA-256 or path does not match")
    print(f"Original checker exit {code}")
    if code in (2, 3):
        raise SystemExit(code)
    report = json.loads(raw)
    if (report["commit"], report["base"]) != (commit, base):
        refuse("report commit or base does not match")
    if report["schema_id"] != "pm.landing_check.report.v1" or report["subcheck_timeout_seconds"] != 1800:
        refuse("report format or timeout does not match")
    expected = receipt["ignored_inputs"]
    actual = json.loads((root / "hand-inputs-verify.json").read_bytes())
    changed = sorted(name for name in expected.keys() | actual.keys()
                     if expected.get(name) != actual.get(name))
    if changed:
        refuse("remote ignored inputs changed after checking: " + ", ".join(changed))
    print(f"Verified hand receipt SHA-256 {witness}")
except (OSError, ValueError, KeyError, TypeError) as error:
    refuse(str(error))
PY
```

#### Guard and fast-forward the checked commit

In the shared checkout, set `PM_LAND_LOCK` to the absolute `held` directory and
`PM_LAND_TOKEN` to its token. Set `PM_LAND_PLANS_FOLLOWUP` and `PM_LAND_COMPLETES_FOLLOWUP`
to `true` or `false` using the rules below. Set `PM_LAND_SCRIPT` to the absolute path of an
up-to-date `scripts/pm-land.py` in a trusted local worktree. Run both publication blocks from
the shared checkout in the same Bash session. For the initial topic, set
`PM_LAND_TOPIC_WORKTREE` to the original absolute topic worktree and `PM_LAND_TOPIC_BRANCH`
to the topic name. Set `PM_LAND_RESEAL` to `true` if the topic includes a reseal path.

Each block holds the guard across the token check, the shared-input preflight, the journal
write and Git. The preflight uses the automated lander's check and reports staged or unstaged
changes and skip-worktree or assume-unchanged flags on the paths being landed or read by the
checker, including all tracked paths in `Plans/` and `reports/landing-checks/`. It detects
ignored files at new tracked paths and compares the entire ignored path set and SHA-256 values
against the verified receipt. Stop when it names a difference. Use the same guard for shared
recovery commands. Keep remote checks and waits outside the guard.

```sh
held_git() (
    exec 9>>"$(dirname "$PM_LAND_LOCK")/pm-land-reap.guard"
    flock -x 9 || exit 3
    test -n "$PM_LAND_TOKEN" || exit 3
    current_token=$(sed -n 's/^token: //p' "$PM_LAND_LOCK/holder.txt") || exit 3
    test "$current_token" = "$PM_LAND_TOKEN" || exit 3
    "$@"
)

save_landing_phase() {
    python3 - "$PM_LAND_LOCK/holder.txt" "$@" <<'PY'
import json
import os
from pathlib import Path
import re
import sys
import tempfile

holder, phase, *fields = sys.argv[1:]
path = Path(holder)
prefix = "publication: "
lines = path.read_text().splitlines()
existing = [line[len(prefix):] for line in lines if line.startswith(prefix)]
if phase == "fast-forward-pending":
    base, candidate, pre_merge_head, plans, completes, reseal, worktree, branch, common = fields
    if (existing or base == candidate
            or any(not re.fullmatch(r"[0-9a-f]{40}", value) for value in (base, candidate, pre_merge_head))
            or any(value not in ("true", "false") for value in (plans, completes, reseal))
            or (reseal == "true" and plans != "true")
            or (completes != "true" and (not Path(worktree).is_absolute() or not branch
                                        or not Path(common).is_absolute()))
            or (plans == "true" and completes == "true")
            or (completes == "true") != any(line.startswith("follow-up-owed: ") for line in lines)):
        raise SystemExit("inconsistent publication or Plans follow-up")
    marker = dict(base=base, candidate=candidate, pre_merge_head=pre_merge_head,
                  plans_followup=plans == "true", completes_followup=completes == "true",
                  reseal=reseal == "true",
                  topic=dict(worktree=worktree, branch=branch, tip=candidate,
                             git_common_dir=str(Path(common).resolve())) if completes == "false" else None)
else:
    base, candidate = fields
    if len(existing) != 1:
        raise SystemExit("expected one existing publication marker")
    marker = json.loads(existing[0])
    if (marker["base"], marker["candidate"], marker["phase"]) != (base, candidate, "fast-forward-pending"):
        raise SystemExit("publication marker does not match the checked push")
marker["phase"] = phase
with tempfile.NamedTemporaryFile(mode="w", dir=path.parent, delete=False) as temporary:
    text = [line for line in lines if not line.startswith(prefix)]
    temporary.write("\n".join([*text, prefix + json.dumps(marker, sort_keys=True)]) + "\n")
    temporary.flush()
    os.fsync(temporary.fileno())
os.replace(temporary.name, path)
directory = os.open(path.parent, os.O_RDONLY | os.O_DIRECTORY)
try:
    os.fsync(directory)
finally:
    os.close(directory)
PY
}

shared_preflight() {
    python3 -B "$PM_LAND_SCRIPT" preflight --base "$PM_LAND_BASE" --commit "$PM_LAND_COMMIT" \
        --receipt "$PM_LAND_RECEIPT_DIR/hand-receipt.json" --receipt-sha256 "$PM_LAND_RECEIPT_SHA256"
}

fast_forward_checked() {
    python3 -B "$PM_LAND_SCRIPT" fetch-main --guard-fd 9
    test "$(git symbolic-ref HEAD)" = refs/heads/main
    test "$(git rev-parse --verify refs/remotes/origin/main)" = "$PM_LAND_BASE"
    pre_merge_head=$(git rev-parse --verify HEAD)
    git merge-base --is-ancestor "$pre_merge_head" "$PM_LAND_BASE"
    git merge-base --is-ancestor "$PM_LAND_BASE" "$PM_LAND_COMMIT"
    topic_git_dir=
    if [ "${PM_LAND_COMPLETES_FOLLOWUP:?}" = false ]; then
        topic_git_dir=$(git -C "${PM_LAND_TOPIC_WORKTREE:?}" rev-parse --path-format=absolute --git-common-dir)
    fi
    shared_preflight
    save_landing_phase fast-forward-pending "$PM_LAND_BASE" "$PM_LAND_COMMIT" "$pre_merge_head" \
        "${PM_LAND_PLANS_FOLLOWUP:?}" "${PM_LAND_COMPLETES_FOLLOWUP:?}" "${PM_LAND_RESEAL:-false}" \
        "${PM_LAND_TOPIC_WORKTREE:-}" "${PM_LAND_TOPIC_BRANCH:-}" "$topic_git_dir"
    if ! git merge --ff-only --no-overwrite-ignore "$PM_LAND_COMMIT"; then
        save_landing_phase fast-forward-failed "$PM_LAND_BASE" "$PM_LAND_COMMIT"
        python3 -B "$PM_LAND_SCRIPT" failed-ff-state --before "$pre_merge_head" --commit "$PM_LAND_COMMIT" \
            | tee "$PM_LAND_RECEIPT_DIR/failed-fast-forward.json"
        echo 'Keep the lock and holder. Follow the manual failed fast-forward reconciliation below.' >&2
        return 3
    fi
}

set -eu
held_git fast_forward_checked
```

#### Push the checked commit

After the shard check and the second verification of the remote worktree, inputs and
receipt, use the same helper to record `push-pending` and push with the checked lease.
The first configured push URL is primary. The helper pushes mirrors only after primary success
and writes each result to `publication-push.json`. The primary determines publication.

```sh
push_checked() {
    python3 -B "$PM_LAND_SCRIPT" fetch-main --guard-fd 9
    test "$(git rev-parse --verify refs/remotes/origin/main)" = "$PM_LAND_BASE"
    test "$(git symbolic-ref HEAD)" = refs/heads/main
    test "$(git rev-parse --verify HEAD)" = "$PM_LAND_COMMIT"
    git merge-base --is-ancestor "$PM_LAND_BASE" "$PM_LAND_COMMIT"
    shared_preflight
    save_landing_phase push-pending "$PM_LAND_BASE" "$PM_LAND_COMMIT"
    python3 -B "$PM_LAND_SCRIPT" push-main --guard-fd 9 --base "$PM_LAND_BASE" --commit "$PM_LAND_COMMIT" \
        --results "$PM_LAND_RECEIPT_DIR/publication-push.json"
}

set -eu
held_git push_checked
```

### Publication marker and recovery

Keep the owner token and write the following entry as a single line in `holder.txt` before the
fast-forward. Replace the placeholders with full SHAs. Flush the temporary holder file and its
directory when replacing the holder so the marker survives interruption.

```text
publication: {"base": "<fetched main>", "candidate": "<checked commit>", "pre_merge_head": "<shared HEAD before merging>", "plans_followup": true, "completes_followup": false, "phase": "fast-forward-pending", "reseal": false, "topic": {"worktree": "<original absolute path>", "branch": "<topic branch>", "tip": "<checked commit>", "git_common_dir": "<original absolute Git directory>"}}
```

Use `plans_followup: true` for a topic that changes Plans. For the snapshot follow-up, keep the
existing `follow-up-owed: <published Plans commit>` line, use `topic: null`, set `plans_followup`
to false and `completes_followup` to true. For a topic without Plans changes or a reseal, use
false for both flags. Set `plans_followup` to true when `reseal` is true.
Change the phase to `push-pending` just before pushing.

After a successful primary push, replace the pending marker and record `follow-up-owed` for a
published Plans topic and `follow-up-kind: reseal` when applicable. Carry the original topic
record forward as `cleanup-owed` until its worktree and verified branch tip are removed.
Remove the follow-up entry only after that follow-up is published. Keep a marker if the outcome
or rollback is uncertain. When taking over a holder older than 90 minutes, preserve these entries,
replace its token under the guard, and reconcile while holding the recovered lock:

- **Fetch** primary main and compare the candidate, the recorded base, shared HEAD and fetched main. Stop
  for manual recovery if history changed or shared HEAD is neither the recorded candidate nor an
  ancestor of fetched main.
- **Published candidate.** If fetched main contains the candidate, record any Plans follow-up
  owed. If the candidate completed the recorded follow-up, clear that obligation. If the shared
  fast-forward is incomplete, reconcile its local index and working tree first.
- **Unpublished completed fast-forward.** If shared HEAD is the recorded candidate and the
  fast-forward completed, confirm ownership and
  save `rollback-pending` in the marker. Under the guard, recheck ownership, the exact candidate
  HEAD and the fetched origin SHA. Apply `git read-tree -m -u <candidate> <fetched main>`, then
  `git update-ref refs/heads/main <fetched main> <candidate>`. The two-tree operation preserves
  unrelated staged and unstaged edits, including partial staging. Verify HEAD reached fetched
  main. If ownership or expected HEAD changed, leave the checkout alone and save a recovery
  notice outside the holder for its current owner. Preserve any earlier Plans obligation when
  the interrupted push was the follow-up.
- **Failed or incomplete fast-forward.** Leave every path untouched and keep the lock and marker.
  Save HEAD, porcelain status, index entries and per-path working hashes using `failed-ff-state`
  or the run's recovery notice. Under the recovered guard, fetch primary main and compare the
  recorded pre-merge HEAD and candidate with the live index and working files. Preserve other
  writers' changes. Reconcile only confirmed candidate changes by hand. If primary contains the
  candidate, record its follow-up and original checkout cleanup before clearing the journal.
- **Finish recovery.** Clear the pending marker after reconciliation. Complete any owed Plans
  follow-up at fetched main before another landing. Check the original worktree and branch
  against the saved tip and fresh primary ancestry before removal. If Git already removed the
  original worktree, confirm it is unregistered in the recorded Git directory and the branch
  still points at the recorded tip in freshly fetched primary main. Delete the ref only at that
  exact tip and clear the cleanup marker. If proof is missing, keep the marker for inspection.

## Refreshing it after a Plans landing

After a landing that changes any `Plans/` path passes its landing check and pushes `main`, the
landing agent keeps the same landing lock and refreshes the migration snapshot and baseline as one
separate follow-up commit. An ordinary landing with no `Plans/` paths refreshes neither artifact. Never
refresh the baseline to make a landing pass: that excuses exactly the failure it was meant to show.

Changes to `Plans/Spec_Lock.json`, `Plans/.evidence/**`, `Plans/auto_decisions.jsonl` or a
currentness edition require the assigned reseal agent. The lander stops after the primary
publication with `reseal: follow the reseal-record hand procedure` and keeps the follow-up
and cleanup entries under the lock. The assigned agent follows the latest
`reports/governance-reseal-*/reseal-record.md`, including approved currentness installation,
validation and recording after the installation.

Working directory: a fresh full worktree on the idle machine at the newly pushed `main`. Use
the current copied edition for this ordinary follow-up. Save the complete inventory used to
record the baseline and compare it with the follow-up check's receipt. Run the two generation
commands together under `long-job` on that host. If a snapshot for this UTC day already exists, use the next
three-digit sequence in its run ID. The snapshot writes a new tracked run
directory and removes snapshot runs older than the one it replaces, which is why it cannot run where
branches land. The replaced run stays because the new run declares it and validation reads its
summary. `git add Plans/.plan_migration` below stages both changes. Git history keeps the removed bytes.

    cd ~/pm-worktrees/snapshot-$(date -u +%Y%m%d)
    git fetch origin
    python3 -B "$PM_LAND_SCRIPT" inventory >"$PM_LAND_SNAPSHOT_INPUTS"
    python3 scripts/pm-plan-migration.py snapshot-current \
        --run-id pds-$(date -u +%Y%m%d)-001-current-planunit-snapshot \
        --expected-doc-count "$(ls Plans/*.md | wc -l)" \
        --supersedes-run-id "$(python3 -c "import json;print(json.load(open('Plans/.plan_migration/current_run.json'))['run_id'])")"
    python3 scripts/pm-landing-check.py --record-baseline \
        --readiness-audit-root "$PWD/Plans/.audits/event-authority-2026-08-13-currentness"
    python3 -B "$PM_LAND_SCRIPT" inventory | cmp - "$PM_LAND_SNAPSHOT_INPUTS"
    git add Plans/.plan_migration reports/landing-checks/baseline.json
    git commit -m "plans: refresh the plan-migration snapshot and the landing-check baseline"
    git push origin HEAD:refs/heads/fix/my-landing-snapshot

From the shared checkout, land that separate commit through the same remote check, fast-forward,
shard check, verification and main push while holding the same landing lock. By hand, set
`PM_LAND_BASE` and `PM_LAND_COMMIT` to the follow-up's checked base and commit and run both
guarded publication blocks again. Set `PM_LAND_SNAPSHOT_INPUTS` to an absolute file outside the
worktree before generation. Compare it with the follow-up receipt's `hand-inputs-before.json`
using `cmp` before the fast-forward. Each block runs the shared-input preflight for the follow-up.
If generation or validation fails after a Plans landing, keep the lock for recovery and use
the saved report to finish the follow-up. Remove the temporary worktrees and release the lock
when it is published.

Six things that make the difference between a good baseline and a misleading one:

- `git sparse-checkout disable`, because a sparse tree is missing inputs the checks read and records
  failures no landing ever sees.
- The symlink, because `json_syntax` reads 16 raw captures underneath it. It is the one check input
  under `tests/` that stays untracked: it points at raw evidence, which is never committed here.
- The readiness audit source: both modes select it mechanically and the baseline binds its actual
  ignored inputs. Use `--readiness-audit-root DIR` for another evidence location; no manual audit copy
  is needed. A later comparison must use the same input bytes.
- `--record-baseline` after the snapshot, not before, so the baseline describes the snapshot the
  later landings will be checked against; and before the commit, so the commit it names is
  `origin/main` itself, which rule 2 needs on the history of every later base.
- Both files in one commit, so the baseline and the run it describes never disagree.
- Run 002 in the new run's `supersedes_run_ids`. `snapshot-current` adds
  `pds-20260611-002-atomize-planunits` by itself whenever that run is present and complete, so the
  recipe passes only the previous current run. The aggregate checks validate run 002
  (`DEFAULT_PLAN_MIGRATION_RUN`), whose frozen inventory holds the 72 documents of 2026-07-03. Its
  validator turns `doc_count_mismatch` and `inventory_doc_set_mismatch` into historical-scope warnings
  only while a complete in-repo run declares that it supersedes run 002 and the snapshot
  `current_run.json` names passes full live validation. Run 003 made that declaration on 2026-08-28
  and left the repository with runs 004-016 on 2026-09-10, which stranded run 002. Every snapshot
  inventories every live document, so it can truthfully repeat the declaration. When older snapshots
  move out, move them oldest first, and never move out a run that a remaining snapshot names in its
  own `supersedes_run_ids`: the snapshot `current_run.json` names must keep its direct predecessor's
  summary (`superseded_run_final_summary_missing` otherwise), and a gap leaves an older snapshot that
  declares run 002 as a dead end, which fails as `historical_successor_lineage_divergent`. The
  declaration makes run 002's validation fully validate the current snapshot as well, about 150 to
  180 seconds on local disk instead of about 32.

Takes about ten minutes, plus the exports of the subchecks that print only a sample (see "Subchecks
keyed from their export"), which the baseline records so that later landings can key those
subchecks. The run also ends at a new `current_run.json`, so the next landing check validates the new
snapshot rather than the one it replaced.

If `--record-baseline` refuses with exit 3 because a subcheck timed out, rerun it with a larger
`--subcheck-timeout-seconds` before committing the
follow-up and releasing the landing lock.

## Related branch

`plans/acceptance-and-landing-baseline-20260917` records the decisions behind this rule, DL-059 and
DL-060, and lands after this one.

## Tool batch 4: findings and responses

REVIEW-etools-tb3-opus findings 7 and 8 (TOOLBATCH4 T63) are fixed; nothing is disputed. Base:
`9647530869`. Fix: `c07818c2f0` on `fix/landing-check-renamed-shard-20261106`, which stays unlanded.
Both findings are HYPOTHETICAL: the repository has no non-ASCII path, and no symbolic link under
`Plans/.evidence/` or `Plans/_shards/` on `main`.

| Finding | Location, cause and fix | Test (fails on the base, passes now) |
|---|---|---|
| 7: a non-ASCII evidence path the branch edited kept the rename excuse | `branch_paths`. `git diff --name-only` ran with git's default `core.quotePath`, so `touched` held `"Plans/.evidence/\303\251.json"` and the raw path of the evidence file was not found in it. The list is now read with `git -c core.quotePath=false diff --name-only -z` and split on NUL, so every path the branch names, and the on-branch match in general, is compared raw. | `test_a_non_ascii_evidence_path_the_branch_edited_keeps_its_class` |
| 8: "the branch left the evidence file alone" was judged on commits only | `RenameContext.left_alone`. It now also requires that `git status --porcelain -z --untracked-files=all -- <file>` is empty (no uncommitted, staged, deleted or untracked change) and that neither the file nor a folder above it in the repository is a symbolic link. | `test_an_uncommitted_edit_of_the_evidence_keeps_its_class`, `test_an_untracked_evidence_file_keeps_its_class`, `test_an_evidence_symlink_keeps_its_class` |

Soundness: nothing widens. Both changes can only take the rename excuse away (the failure is then
classed by the other rules, as before T53).

| Check | `9647530869` | Now |
|---|---|---|
| `python3 -B -m unittest tests.test_pm_landing_check` | 171/171 (4 failures with the 4 new tests) | **175/175** |

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/TOOLS-BATCH4/landing/`:
`tests-on-base-9647530869.txt` (the fix's test file run against the base script) and `tests-on-fix.txt`.

## Tool batch 5: findings and responses

**TOOLBATCH4 pre-check findings 5 to 7 (TOOLBATCH5 T88) are fixed; nothing is disputed. This branch stays unlanded** (a landing-policy change for pm7-build). Base: `e7b77247a7`. Fix: `35f92ff241` on `fix/landing-check-renamed-shard-20261106`. `grown_buckets` is unchanged, so T63's rebase note for `write_row_report` still applies as written when this branch is rebased onto `fix/landing-check-report-ids-20261106`.

| Finding | Location, cause and fix | Evidence |
|---|---|---|
| **5: a committed rename's old path was not one of the branch's paths — fixed (pre-existing on main)** | `branch_paths`: `git diff --name-only` uses git's default rename detection, which names only a renamed file's new path. Now `--no-renames --no-ext-diff`, with `--no-optional-locks`. On main's `9ddfa95b51` the old command lists 66,989 paths and the new one 66,990, the renamed file's old path the one added. | Test `test_a_committed_rename_names_its_old_path_among_the_branch_paths`. |
| **6: files `git status` does not report kept the renamed-shard excuse — fixed** | `RenameContext._alone`. Status now runs with `--ignored=matching` (an untracked evidence file under a `.gitignore`d or `info/exclude`d folder), the index's own flags are read (`git ls-files -v`: `S` skip-worktree, a lowercase tag assume-unchanged), and the file's bytes are compared with HEAD's blob (`git cat-file blob HEAD:<path>`), which catches every hidden edit whatever git reports. | Tests `test_an_ignored_untracked_evidence_file_keeps_its_class`, `test_an_excluded_untracked_evidence_file_keeps_its_class`, `test_a_skip_worktree_edit_of_the_evidence_keeps_its_class`, `test_an_assume_unchanged_edit_of_the_evidence_keeps_its_class`. |
| **7: `git status` rewrote the shared checkout's index, and a lost excuse named no cause — fixed** | Every git call of the rule passes `--no-optional-locks` (no index refresh, no `index.lock`), and the report names each evidence file that lost the excuse and why (`rename_excuse_lost` in the JSON; a list under the branch paths in the text, for example `evidence has working-tree changes: <status line>`), so the landing agent can tell whose work stopped the landing. | Test `test_the_untouched_evidence_still_keeps_the_excuse_and_the_index_is_not_written` (stale stat data, which a plain status refreshes: the index is byte- and mtime-identical after the rule runs). |

**Tests:** 181/181 (`tests-fix.txt`). The fix's tests against `e7b77247a7`'s script: 6 failures, exactly the six new tests (`tests-on-base-e7b77247a7.txt`). **Soundness:** nothing widens: the branch's path list can only grow, and the excuse can only be lost in more cases.

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/TOOLS-BATCH5/landing/` (`SHA256SUMS`).

## Fix round 1 after the gates (Jared, 2026-11-09)

Jared chose **"Small fix, recheck + Sol max (Recommended)"** after the Sol max and Astra max gates at
`a960ec98df105054cd45c1bfd478998382e7852f`. This round implements the small fix; the one Sol 6.1 high
recheck and one Sol max gate remain the lead's next steps. No Astra recheck is requested.

| Where | Cause and fix |
|---|---|
| `scripts/pm-landing-check.py:1595`, `:1680`, `:1929` | Complete-export normalization dropped `RenameContext`, then replaced the correctly classified aggregate rows. `key_from_exports` now accepts the same context, passes it to every exported row's `normalize`, and receives it from `check_main`. Baseline recording retains `context=None`. |
| `scripts/pm-landing-check.py:548`, `:575` | A cached clean result survived a later evidence edit. `left_alone` now checks evidence afresh on every application, including the current committed diff with `--no-renames --no-ext-diff`, status, index flags and bytes against HEAD. It also clears an obsolete refusal diagnostic when the file is clean again. Only old-target existence at the base remains cached. |
| `tests/test_pm_landing_check.py:486`, `:2392` | Eleven new tests compare the printed and complete-export paths for both aggregates, independently witness the explicit file/ancestor symlink diagnostic, and exercise `main`'s export replacement with both renamed rows beyond both print caps. |

| Test | Result |
|---|---|
| **Real Q5 export, before → after**, Sol input `4db776c0896c0b17196c3f1a3fe501571501aa42` / base `dd6580cd11debab88d65f7b65e2abf0cf27b3b72` (1,904 rows), and Astra input `90ef72139473f316428cbc2a651e49a47de6ddee` / base `ae06ffd113334ce64d76a75af0c19abec6463869` (1,822 rows) | **PASS**, both aggregates. The real missing-ref bucket remains **1 → 3**. Before: exported stale flags `[false, false, false]`, one blocker, focused exit **2**. After: `[true, true, false]`, zero blockers, focused exit **1**, matching direct/printed normalization. The unrelated storage-registry reference remains non-stale. |
| **Fresh production exports** on both full real Q5 trees | **PASS**. Unmodified `run_export` reruns the real `validate-evidence`; totals match the reviewers' captures, every printed row matches, both aggregates key the complete exports, and the missing-ref decision remains exit **1** with zero blockers. |
| **Old target absent at the base**, with unchanged real evidence and existing replacements | **PASS**, printed and export paths, both aggregates and both Q5 trees: renamed references remain non-stale and bucket growth blocks. |
| **Evidence changed in commits**, including a new commit after the first clean check | **PASS**, printed and export paths. Both real Q5 probes and the regression refuse the excuse with `the branch's commits changed it`. |
| **Rename detection must not hide an old evidence path** | **PASS**, scratch regression with `diff.renames=true` and a committed evidence rename. `branch_paths` still names the old path; the fresh evidence diff explicitly uses `--no-renames --no-ext-diff`; both printed and export paths block. The existing committed-rename regression also passes. |
| **Cached-result reproduction**, working-tree and staged edits after the first clean check | **PASS**, both real Q5 trees and both paths. Reusing the same context refuses the excuse after an edit, including a staged change with original bytes restored on disk. |
| **Evidence symlink and symlinked ancestor**, after the first clean check | **PASS**, both real Q5 trees and both paths. Separate regression tests require the exact explicit-symlink refusal diagnostic, witnessing the predicate identified by Astra P3 even though Git also refuses those inputs. |
| **No context during baseline recording; current commit lookup fails** | **PASS**, regression coverage on both paths. No rename excuse is granted. |
| **Complete landing-check suite** | **192/192 PASS**, exit **0**: the original 181 plus 11 new tests. The runner redirects only the default readiness audit source to an absent local path so the suite never selects the shared checkout. |
| **Diff whitespace check** | **PASS**, `git diff --check`. |

**Policy remains exactly bounded.** A missing reference must still come from unchanged, plain sealed
evidence, name a line-range shard that existed at the base and is now absent, and have an existing
replacement with the same document and ordinal in the current manifest. Committed paths are read with
rename detection off; evidence changes, hidden index flags, symlinks, Git failures, absent replacements
and missing context still refuse the excuse. Bucket growth beyond the recognized renames still blocks.

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/LANDING-T32/fix1/`, bound by
`SHA256SUMS`. `real-results.json` SHA-256
`a3e5cc6041c3691043a942f1578965d08dc24cf476e2f7bb53ff93403dc0002b`;
`suite-result.json` SHA-256 `cd19de77990347c4b431e85116e86edf8939ace75c8910569bec4a62906edafe`.
These are production export/normalization/bucket replays, not a complete top-level repository-wide landing
run. No baseline or audit input was refreshed. Heavy runs were sequential, started above 13.5 GiB
available, and stayed above 10 GiB (minimum observed 13.78 GiB). No shared-checkout access, landing lock,
main push, landing, pm-mail, subagent or browser was used.
