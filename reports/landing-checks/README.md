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

Exit codes: 0 nothing to report; 1 nothing it reports stops the landing, meaning governance
staleness on files the branch edited or failures that are new but name none of the branch's files;
2 something it reports does stop the landing, meaning a failure on the branch's files that is not
staleness, a bucket that grew whose error kind is not staleness, or a rise in a subcheck whose
failures are truncated; 3 the check could not run.

The recorded `commit` is the branch's own first commit, not `main`. It has to be: the script that
records a baseline must exist in the tree that records it. That commit adds only a script, a test,
rule text and one `.gitignore` line, none of which any of the three checks reads, and the run taken
at `main` itself produced the same three failure totals.

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
but report the true total, so the baseline stores both. In the recorded baseline that means **only
1,007 of the 9,807 failures those two checks report are ever keyed**: 12 subchecks are truncated and
8,800 failures are never seen one by one. The worst are `validate_evidence` and `validate_plan_graph`,
which report 1,552 each against a 50-row sample, a 97 percent blind spot. `plan-migration-validate`
prints all 28,128 of its failures, so those are keyed in full.

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

The baseline records the list it was taken with, in `untracked_inputs`. Until those files are
tracked, a baseline cannot be reproduced from git alone; copy them from the shared checkout before
recording one.

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
  next day's landings will be checked against.
- Both files in one commit, so the baseline and the run it describes never disagree.

Takes about ten minutes. The run also ends at a new `current_run.json`, so the next landing check
validates the new snapshot rather than the one it replaced.

## Related branch

`plans/acceptance-and-landing-baseline-20260917` records the decisions behind this rule, DL-059 and
DL-060, and lands after this one.
