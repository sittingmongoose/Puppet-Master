# Ready Back and Named Plan integration verification

Two independently reviewed repairs are integrated on the repair branch:

- `fca05a27d6`: accepted Named Plan creation requires group/route references
  and original revision 1, including replay. Source `ef76850a4d`.
- `8dd4174857`: Ready Back admits the three owner-defined predecessor paths,
  requires a matching active-session witness, pops exact durable history, and
  preserves setup state without new owner dispatch. Source `f10b061e5c`.

Root read both complete code/test diffs and reports. Integrated implementation
files are byte-identical to their reviewed source commits. Named Plan review
confirmed one added conditional and unchanged old fixtures, then exercised six
fresh old-accepted/new-rejected cases and three revision-type negatives. Ready
Back review confirmed that only request/result schema definitions changed, all
other helper functions and the generated persisted-value bundle are unchanged,
and seven fresh schema/semantic-valid substitutions fail their exact joins.

Fresh combined verification at `8dd4174857`:

- 28 Onboarding causality tests, 7 Named Plan tests and 13 PM7 checker tests pass.
- Real PM7 GUI fixture check passes; no mock is used in that run.
- Shard check passes for 99 documents / 2,721 shards; whitespace check passes.
- Full registered contract gate passes: 32 pairs, 1,165 positive cases,
  4,028 negative cases, 12 self-tests and zero findings.

The aggregate validates individual contract values; focused paired tests prove
the Ready Back joins. Neither establishes native session authenticity,
persistence, GUI behavior, atomic creation or actual receipt/route resolution.
Named Plan request/result identity and failure-receipt composition remain open.
Connect-existing's standalone continuation still permits null draft references
that cannot match a valid queued durable session; the join rejects that incomplete
projection rather than inventing or normalizing draft identity. That separate
projection gap is recorded, not claimed repaired. The old phase-suite census
failure (`294 != 90`) is unchanged and was not suppressed.

Evidence root:
`/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/`

| Evidence | SHA-256 |
| --- | --- |
| `named-plan-create-root-independent-review.json` | `9a2ffdfadef1295e89edb0a34666a70b8baa482addffd7e5f53655554ffa1248` |
| `onboarding-ready-back-root-independent-review.json` | `68de1dbb2b904d58b6204892d313d6c5ea91f2f9893cdcef07e1b83ef08ff7fa` |
| `ready-named-integrated-focused-verification.json` | `3a0d90007c931f0794beee0f9783f8bad8f3208b3ca40c6de44aac49760fa616` |
| `ready-named-integrated-new-contracts-report.json` | `692223ec7ef94125c738f6864ed00d6fec0ac74b2826f7a0c219b3c0dbecbde7` |

No owner Markdown, generated index/shard, governance binding or main checkout
was changed. Source worktrees remain until a permitted main landing; branch
integration alone is not a main landing or all-packet closure.
