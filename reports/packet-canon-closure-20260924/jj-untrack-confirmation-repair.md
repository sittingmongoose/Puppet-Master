# Single-remote Jujutsu untrack confirmation repair

Base: `68ec474759640216227ce8779729cd387847059c`. Scope: existing `cmd.jujutsu.bookmark.untrack`, not a new command or all-remotes target.

SCS-005 (lines 232–241) and accepted DL-057 (lines 872–895) require single-remote untrack to confirm that remote. The existing request now requires the existing confirmation shape with `one_remote`; one scoped semantic rule binds its single disclosed identity to `target.remote_identity`. Writer, FileSafe, expected revision, currentness, permission, local mutation and null credential authority are preserved. Track and every other command keep their existing confirmation policy.

Only the existing untrack positive changes; four negative fixtures cover null, no-remote, all-remotes and wrong-remote confirmation. The previous four JJ relational rules remain unchanged; the exact authored census adds only the untrack identity join. TCP-JJ adds its existing dedicated fixture pack beside neutral SCM fixtures; two track/untrack residuals now require local tracking-state evidence instead of transport evidence. Partial status remains.

Verification:

- Baseline regression run: 19 tests, 8 expected failure/subtest results (missing confirmation/join and the three metadata corrections).
- Final JJ + Touch suites: 77 tests pass.
- `python3 scripts/pm-new-contracts-verify.py`: 32 pairs, 1,138 positive and 3,981 negative cases; no findings.
- `python3 scripts/pm-touch-closure-verify.py --json`: 643 rows, 134 profiles; no failures.
- Exact JSON comparison: one added schema conditional only; all 31 IDs preserved; all old negatives preserved; only one positive changes and four negatives are added; all Touch data outside the three named changes is identical.

External authority/probe: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/browser_scm_performance/jj-untrack-confirmation-probe.json`, SHA-256 `1196670cda0afd0bc32be2be1d66665ee0a9936e6967a6ba739d3e2830336455`. Authorized exact proposal: sibling `jj-untrack-and-touch-repair-proposal.json`, SHA-256 `2b25faf18af396dfa68e35fae8a2751ded5c0661ddb5b8e66c842ac9d04670f0`.

No owner prose, generated indexes/shards, bindings, governance or main changes. No native, GUI, security, remote effect, readiness or all-packet closure claim. Independent review remains required before root integration.
