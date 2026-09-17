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

Exit codes: 0 nothing to report, 1 everything reported is governance staleness for what the branch
edited, 2 something else was reported, 3 the check could not run.

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

The two aggregate checks print at most 50 (run-gates) or 100 (audit-governance) failures per
subcheck but report the true total, so the baseline stores both. Growth that the sample hides is
caught by the count.

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

## Refreshing it

The refresh belongs with the nightly migration snapshot. Nothing on this machine schedules that run
today: there is no cron entry, no systemd timer, no scheduled task and no workflow with a schedule.
Until one exists the designated Plans agent runs `pm-plan-migration.py snapshot-current` and
`pm-landing-check.py --record-baseline` by hand against `main` and commits both.
