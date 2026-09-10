# Puppet Master — recovered Batch 11 audit repair

Use this bounded, guarded update for a checkout where the original Batch 11
files are already installed, including when those files are staged but not yet
committed. This package does not contain Batch 12.

## Apply safely

Extract this ZIP OUTSIDE the repository. Coordinate with other agents so none
is writing the paths listed in REPAIR_DELTA.json during installation. The
installer rejects changed overlapping files; it is not a multi-process merge
engine and does not make simultaneous writes to the same path safe.

Run from the extracted package directory, replacing the repository path:

```bash
python3 APPLY_REPAIR.py --repo "/path/to/Puppet-Master" --check
python3 APPLY_REPAIR.py --repo "/path/to/Puppet-Master" --apply
```

The first command performs no writes. The second applies only declared files
whose complete hashes match the original uploaded Batch 11 baseline. Already
repaired files are skipped. Any conflict found in preflight prevents ALL
repository writes. Do not bypass a conflict with a blanket copy of payload/.
Inspect the changed file and merge consciously instead.

The installer does not invoke Git, unstage files, modify the Git index, commit,
push, change branches, or delete unrelated paths. Original bytes and a receipt
are saved outside the repository. It rechecks each file before replacement.
On failure it attempts rollback without overwriting a detected intervening edit;
the backup receipt records rollback conflicts. Multi-file replacement is not
an atomic filesystem transaction. A concurrently writing process can still
race the last check; coordinating overlapping files is necessary.

IMPORTANT: if the original Batch 11 bytes were staged, they remain staged.
The repaired bytes become working-tree changes. Deliberately review and stage
the repaired paths before eventually committing; otherwise the commit can still
contain the old staged versions. Do not use `git add -A` to sweep another
agent's unrelated work into this repair.

## Baseline and recovered build identity

Original uploaded Batch 11 standalone raw SHA-256:
`f6aaee8c6bba07e93c392e15e30636c11845b72604c4f2363e766fb01956f0ef`

Repaired generated HTML (both outputs, 3,145,110 bytes) raw SHA-256:
`342b6b0f7becc5a2379dda36dea5a1c855c7d2ebc54982fbe179272561ff23a3`

Repaired Git blob:
`1c8bfa59ba5eb32b42669e4cdc772b533eb411da`

The product source changes were recovered from the earlier repair operation
record and rebuild to that recorded repaired HTML identity. The previous
promised ZIP files were absent, so these are newly assembled delivery archives,
not byte-identical copies of those ZIPs. Delivery metadata and evidence have
been regenerated. Historical Batch checkpoint files remain historical and are
not rewritten as fresh certifications.

## Scope

Preserves project identity through both branch routes; binds Teach documents,
actions and exports to their own thread/project; fixes floating Activity Detail
placement; keeps recorded Review/BrainStorm/Crew operable after guide dismissal
without automatically starting work; fixes the message-menu restore-point
payload and stale-anchor boundary; registers the ELI5 artifact in the shared
array and renders its exact source; makes text tooltips non-interactive and
clears stale hover labels; makes the memory gutter check wait for settlement.

Protected motion, variants-a/b/c and orbit JS/CSS files are unchanged. No
Settings/onboarding or canonical Plans/governance edits. No WorkNodes, native
implementation, providers, persistence or Batch 12. General rendering stalls,
intermediate-scroll Activity-pill overlap, APR-016 and APR-018 remain open.

## Verification commands

From `Concepts/chat-assistant-concepts/5.6 Pro`:

```bash
python3 build.py --check
python3 tests/b11-repair/run.py --outdir /tmp/pm-b11-repair-checks
python3 tests/b11/run.py verify --outdir /tmp/pm-b11-verify
python3 tests/b11/run.py regressions --outdir /tmp/pm-b11-regressions
```

The supplied Linux harness needs Python Playwright, Chromium, and Pillow.
Recording additionally needs Xvfb, FFmpeg and ffprobe. The installer itself
requires Python 3.10+ and the standard library only and installs no dependency.

The fresh evidence ZIP states which checks were rerun during recovery; no
missing historical video is represented as recovered. A passing functional run
is not smooth-60-fps or native/runtime acceptance.
