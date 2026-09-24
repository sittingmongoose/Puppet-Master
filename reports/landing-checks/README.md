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

    python3 scripts/pm-landing-check.py --base origin/main   # at landing, in the shared checkout
    python3 scripts/pm-landing-check.py --record-baseline    # refresh, in a full checkout at main

Both hand the aggregate checks `--subcheck-timeout-seconds`, 600 by default; see "Subchecks that
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
landing, meaning governance staleness on files the branch edited, pre-existing failures whose count
has not risen against a current baseline (see "Only against a current baseline" below), failures
that are new but name none of the branch's files, or a subcheck that timed out, so that the run was
not fully verified; 2 something it reports does stop the landing, meaning a failure on the branch's
files that is neither staleness nor pre-existing, a bucket that grew whose error kind is not
staleness, or a rise in a subcheck whose failures are truncated, other than the readiness growth
counter; 3 the check could not run, or a subcheck timed out while recording a baseline. A subcheck
that timed out in a landing run lifts an exit 0 to 1 and changes no other exit code. A subcheck keyed
from its export is not truncated; one whose export falls back is, and the summary says why.

**It refuses a sparse worktree**, with exit 3, in both modes. The three checks read the whole
repository, so every file outside a sparse cone reads as missing: a dry run at `ecb77f4e6c` on a
worktree without `Concepts` and `tests` produced three blocking items and 76 new failures that were
all the absent cone, in two truncated subchecks, and none of them about the branch. The tool was
right to stop, but a lander would have read those as theirs. Run it in the shared checkout at
landing or after `git sparse-checkout disable`; `--allow-sparse` overrides it for a deliberate
partial run.

The recorded `commit` is the commit the baseline was taken at, and it has to be a commit of `main`:
rule 2 applies only while that commit is an ancestor of the landing's base (see "Only against a
current baseline" below). The nightly runbook records at `origin/main` before it commits the
snapshot, so the commit it names is `main`'s. The first baseline, of 2026-09-21, named its branch's
own first commit `b29eab7b99`, because the script that records a baseline had to exist in the tree
that recorded it; the rebase at landing left that commit off `main` (it landed as `2c527ce17f`), so
against that baseline rule 2 would be off. The baseline recorded at `main` `75bcda93bc` on
2026-09-23 replaced it.

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
that is refreshed on a schedule megabytes long. `fingerprints: null` in a bucket means count-only.

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

The inputs themselves cannot be hashed, since each validator reads its own set of files. The equal
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
- the export's total equals the printed total.

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
  Complete rows now against a sample then would read every pre-existing failure outside the sample as
  grown, so the export is not run;
- *total mismatch*: the export holds a different number of rows than the printed total, for example
  because the tree changed between the two runs: "its export (validate-plan-graph) holds 132 rows, but
  the printed total is 133";
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
as before. The baseline recorded at `792d2fb8b1` has no exports. Until the next nightly refresh, the
two subchecks it holds only a sample of, the PRD contracts (1,240) and audit-closure (201), keep the
truncated rule as a baseline sample. The refresh records the PRD contracts from their export.
Evidence and plan-graph are complete in that baseline (0 each), so a landing keys them already.

In `--json`, `exports` carries `complete_export_commands` and `no_complete_export`, and under
`subchecks` one row per sampled subcheck. Each row has its `case` (`keyed`, `no_export`,
`baseline_sample`, `total_mismatch`, `export_timeout` or `export_unreadable`), the `reason`, the
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
are seen by nothing. The export is a second run of the same validator. The equal total is the
evidence that it saw what the aggregate saw; the rows are not compared one by one.

## What counts as governance staleness

AGENTS.md names four things as governance staleness: Spec Lock `stale_hash`, stale owner or artifact
evidence hashes, a stale readiness report, and the stale plan-migration snapshot. Editing canon
produces them until the designated Plans agent reseals, so they never stop a landing: on a file the
branch edited they are reported with a reseal request and the check exits 1. The script recognises
them by error kind.

| What AGENTS.md names | Error kinds |
|---|---|
| Spec Lock `stale_hash` | `stale_hash`, and every kind ending `_spec_lock_hash_stale`: the readiness validator's Spec Lock check for each family it certifies, today `event_record_`, `execution_unit_context_`, `non_executable_closure_` and `storage_value_registry_spec_lock_hash_stale` |
| stale owner or artifact evidence hashes | `artifact_hash_stale`, `stale_audit_status_index`, `event_authority_currentness_source_drift` (the Event Authority currentness inventory's stored hash of an edited source), `event_authority_currentness_validator_drift` (the currentness receipt's stored hash of `scripts/pm-event-authority-currentness.py`: a canon edit cannot cause it, an edit of that script does, and its reseal is a currentness edition that refreshes the gitignored receipt), and an audit-closure failure whose detail says a stored hash "is stale" |
| a stale readiness report | `pnc019_source_hash_stale`, `buildability_gate_report_stale_or_not_canonical`, `buildability_passed_with_stale_source_hashes`, the `_spec_lock_hash_stale` kinds above, and the readiness growth counter below |
| the stale plan-migration snapshot | every `current_snapshot_*` kind, `stale_batch_report_sha256_after`, `complete_final_summary_live_plan_unit_count_stale`, `doc_count_mismatch`, `inventory_doc_set_mismatch`, `superseded_run_final_summary_missing` |

A bucket of one of these kinds that grew is staleness too, so it does not stop the landing either.

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

A bucket whose count rose is not pre-existing: its rows on a touched file stop the landing, and a
grown bucket whose kind is not staleness stops it, as before. In `--json`, `pre_existing` lists every
reported pre-existing failure, and those rows and the matching `on_branch` rows carry `standing`,
`baseline_count` and `count`.

What this cannot see: a failure that sat above its subcheck's print cap when the baseline was
recorded is not in `baseline.json`, so when it later falls inside the sample on a touched file it is
judged as before and stops the landing. The run-gates copy of that self-test row was one: run-gates
printed 50 of the baseline's 79 readiness rows and the self-test row was not among them, while the
audit-governance copy, printed in full, was. That run-gates copy is now judged by its
audit-governance copy instead (see "A validator both aggregates run" above), so the brief's
motivating case, the storage registry repairs landing, replays as exit 1 with 0 blocking items
instead of 2 with 1. The edge remains for a validator that only run-gates runs, or whose
audit-governance copy prints only a sample too.

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
days older than it by committer time (`git show -s --format=%ct` of each commit). The nightly
refresh keeps it within a day, and seven days cover a run of failed nights without turning every
landing red. When it is current, the summary's second line says so and gives the age; `--json`
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

The landing check hands the aggregates a bound of 600 seconds by default, where it used to hand them
180. The measured case: `lint-contractrefs` takes about 199 seconds in the shared checkout on the
network mount, and finds nothing when run on its own (0 failures at `e44b9186fb`). At the
terminal.workgroup_moved landing of 2026-09-24 the 180-second bound killed it in both aggregates, and
the two timeout rows read as new failures and lifted two subcheck totals from 0 to 1.

A baseline is never recorded from a run in which a subcheck timed out: `--record-baseline` exits 3
and writes nothing, because a baseline that says a subcheck passed, or failed once, when it never
finished would mislead every landing after it. Rerun with a larger `--subcheck-timeout-seconds`. The
nightly refresh reruns with a larger bound the same night rather than skipping. A skipped refresh
leaves an older baseline, which rule 2 compares against until it is more than seven days older than
the base; from then on rule 2 is off for every landing until the baseline is re-recorded.

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

A baseline must be recorded in a tree that has everything the checks read. The tracked tree is not
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

## Refreshing it: the nightly runbook

The refresh belongs with the nightly migration snapshot. There is no cron entry, no systemd timer and
no workflow with a schedule on this machine, so it runs as a Claude scheduled task against `main`,
nightly, whether or not anything landed. Never per landing: a baseline refreshed to make a landing
pass excuses exactly the failure it was meant to show.

Working directory: `~/pm-worktrees/nightly-plans`, a worktree on the VM's local disk, never the
shared checkout. The snapshot writes a new tracked run directory, which is why it cannot run where
branches land.

    cd ~/pm-worktrees/nightly-plans
    git fetch origin
    git checkout -B plans/nightly-$(date -u +%Y%m%d) origin/main
    git sparse-checkout disable
    ln -sfn /mnt/Cursor/PuppetMaster-Evidence/tests/agent_packet_restrictions \
            tests/agent_packet_restrictions
    python3 scripts/pm-plan-migration.py snapshot-current \
        --run-id pds-$(date -u +%Y%m%d)-001-current-planunit-snapshot \
        --expected-doc-count "$(ls Plans/*.md | wc -l)" \
        --supersedes-run-id "$(python3 -c "import json;print(json.load(open('Plans/.plan_migration/current_run.json'))['run_id'])")"
    python3 scripts/pm-landing-check.py --record-baseline
    git add Plans/.plan_migration reports/landing-checks/baseline.json
    git commit -m "nightly: refresh the plan-migration snapshot and the landing-check baseline"
    git push -u origin HEAD

Four things that make the difference between a good baseline and a misleading one:

- `git sparse-checkout disable`, because a sparse tree is missing inputs the checks read and records
  failures no landing ever sees.
- The symlink, because `json_syntax` reads 16 raw captures underneath it. It is the one check input
  that stays untracked: it points at raw evidence, which is never committed here.
- `--record-baseline` after the snapshot, not before, so the baseline describes the snapshot the
  next day's landings will be checked against; and before the commit, so the commit it names is
  `origin/main` itself, which rule 2 needs on the history of every later base.
- Both files in one commit, so the baseline and the run it describes never disagree.

Takes about ten minutes, plus the exports of the subchecks that print only a sample (see "Subchecks
keyed from their export"), which the baseline records so that the next day's landings can key those
subchecks. The run also ends at a new `current_run.json`, so the next landing check validates the new
snapshot rather than the one it replaced.

If `--record-baseline` refuses with exit 3 because a subcheck timed out, rerun it the same night with
a larger `--subcheck-timeout-seconds`, for example `--subcheck-timeout-seconds 1200`; never skip the
night, because a skipped refresh leaves an older baseline and rule 2 compares against it, and after
seven days without a refresh rule 2 is off for every landing.

## Related branch

`plans/acceptance-and-landing-baseline-20260917` records the decisions behind this rule, DL-059 and
DL-060, and lands after this one.
