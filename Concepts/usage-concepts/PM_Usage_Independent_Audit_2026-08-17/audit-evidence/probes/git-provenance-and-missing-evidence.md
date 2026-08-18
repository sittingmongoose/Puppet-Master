# Git provenance — independent check, 2026-08-17

reports/impact-register.json scope_override.audit claims:
  "Git unusable on the NAS share (dubious ownership); audited via session write log."

That claim is testable. Result:
```
$ git rev-parse --is-inside-work-tree  ->  true
$ git config --get safe.directory      ->  /mnt/Cursor/Puppet Master
$ git status --porcelain | wc -l       ->  110
```
Git operates normally in this session on the same NFS4 share. The auditor was able to run
log, show, diff, and status without error.

## Actual commit provenance of the concept under audit
```
u11-prism.html / u11-data.js first added:
b2e5ae7ab8 chore: publish reconciled operational main

reports/ first added:
880bbd942a checkpoint: land outstanding plans, concepts, and audit work from prior sessions
b972435a60 feat(concepts): publish multi-model concept work

all commits touching the concept folder:
880bbd942a checkpoint: land outstanding plans, concepts, and audit work from prior sessions
aa122d7c85 U11 Prism usage concept: video-inspired widget redesign (restored from task-659 recovery)
b972435a60 feat(concepts): publish multi-model concept work
b2e5ae7ab8 chore: publish reconciled operational main
```

## The ~30 audit artifacts cited by research/INDEX.md:48-69
```
visual-review-ledger.json              on-disk=NONE                                     ever-committed=NEVER
audit-motion.md                        on-disk=NONE                                     ever-committed=NEVER
audit-motion-evidence.json             on-disk=NONE                                     ever-committed=NEVER
qa-fit-final.md                        on-disk=NONE                                     ever-committed=NEVER
qa-fit-final.json                      on-disk=NONE                                     ever-committed=NEVER
qa-final-widgets.md                    on-disk=NONE                                     ever-committed=NEVER
qa-final-static.md                     on-disk=NONE                                     ever-committed=NEVER
qa-u9.md                               on-disk=NONE                                     ever-committed=NEVER
audit-distinctiveness.md               on-disk=NONE                                     ever-committed=NEVER
audit-robustness.md                    on-disk=NONE                                     ever-committed=NEVER
robustness-results.json                on-disk=NONE                                     ever-committed=NEVER
audit-data-semantics.md                on-disk=NONE                                     ever-committed=NEVER
audit-accessibility.md                 on-disk=NONE                                     ever-committed=NEVER
audit-a11y-results.json                on-disk=NONE                                     ever-committed=NEVER
a11y-audit.mjs                         on-disk=NONE                                     ever-committed=NEVER
audit-a11y-motion-recheck.md           on-disk=NONE                                     ever-committed=NEVER
contrast-final-cleanup.md              on-disk=NONE                                     ever-committed=NEVER
contrast-final-probe-before.json       on-disk=NONE                                     ever-committed=NEVER
contrast-final-probe-after.json        on-disk=NONE                                     ever-committed=NEVER
results.json                           on-disk=NONE                                     ever-committed=243d5fd971 docs(concepts-motion): preserve historical text evidence
state-results.json                     on-disk=NONE                                     ever-committed=NEVER
data-unit.mjs                          on-disk=NONE                                     ever-committed=NEVER
audit-design-critique.md               on-disk=NONE                                     ever-committed=NEVER
qa-design-critique-final.md            on-disk=NONE                                     ever-committed=NEVER
audit-widget-fit.md                    on-disk=NONE                                     ever-committed=NEVER
```

## The three verification scripts cited by README.md:130-133
```
run-matrix.mjs       
run-states.mjs       
data-unit.mjs        
actual contents of Concepts/usage-concepts/QwenUsageConcept/verification/:
u11/redesign/01-overview.png
u11/redesign/02-plans.png
u11/redesign/03-costs.png
u11/redesign/04-context.png
u11/redesign/05-ledger.png
u11/redesign/06-signals.png
u11/redesign/31-overview-dark.png
u11/redesign/34-analytics.png
u11/redesign/36-cache.png
u11/redesign/38-authority.png
u11/redesign/40-light.png
u11/redesign/41-glass.png
u11/redesign/42-standard-overview.png
u11/redesign/cdp-shots.mjs
u11/redesign/std-shots.mjs
```

## Fairness note on the "git unusable" claim

`git config --get safe.directory` returns `/mnt/Cursor/Puppet Master` — a path with a space, which is
NOT the path this repository is checked out at (`/mnt/Cursor/PuppetMaster`). Git works here because the
repo is reached by the no-space path. So the concept author's "dubious ownership" experience was plausibly
real under a different mount path or user, and the claim should not be read as fabricated.

What the claim does NOT excuse: the absence of the ~30 cited evidence artifacts. Those files are absent
from the working tree entirely, independent of git. A tool being unavailable explains missing *attribution*;
it does not explain missing *files*, and it does not explain documentation citing specific quantitative
results (280/280, 1003 assertions, 77% to 7.8%, 1.00x fit) that no artifact substantiates.
