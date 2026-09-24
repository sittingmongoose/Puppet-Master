# Artifacts blocked-disposition owner correction

Base: `92de1890a2d48508512ae333322df335cd562a5f`.

SSYS-023 incorrectly said every replacement target was already admitted.
UCC-120 explicitly retains `cmd.artifacts.open_panel` as
`command_not_registered`. The one-criterion correction aligns Settings with that
existing catalog rule. It preserves all 80 dispositions (41 reuse, seven local,
one retired, 31 rejected), the pending feature, and the existing Artifacts panel
route through `cmd.panel.switch`. It admits no command, alias, handler, arguments
or successful navigation. The fixture's misleading reason is a separate next
step; no schema/fixture companion changes are included in this owner-prose step.

Currentness review compared exact SSYS-023/UCC-120/RAP-048 units and the Artifacts
fixture row on repair base, main `22e516b4565bdf22eea03d5066a362f51c70b4d7`,
and the subsequently observed local main `51c71b9ca44d663045c8c19f40f4c8af3c28be48`.
All agree on the contradiction. A bounded 26-worktree inspection found no newer
conflicting unit or fixture row. That is scoped evidence, not knowledge of every
uncommitted task or unpublished design.

Verification:

- New regression on old prose: one expected failure, two partition/projection
  tests pass. After the correction all three pass; all 32 Settings tests pass.
- The real Touch registry projector still classifies the target as blocked and
  the packet spelling as nonactionable. The test permits only the already
  reported fixture-binding hash drift, not other validation errors.
- Derived generation passes. Full comparison changes only the 37 Settings
  source hashes and SSYS-023's fourth acceptance criterion; other index changes
  are timestamps. All 6,721 PlanUnits and 26,306 acceptance units remain.
- Shard check passes: 99 documents / 2,733 shards. Settings is not a sharded
  Markdown source in the current config, so generation changes no shard file.
- The standard index validator does **not** pass: it reports 20 legacy decision
  record errors and DL-076 absent relative to the newly advanced `origin/main`.
  Those files are outside this edit; no ledger, decision, checker or binding was
  changed to hide them. Current-main reconciliation remains required before
  landing. This report does not claim full landing-gate success.

Evidence root:
`/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/packet-wide-rebaseline/settings/artifacts-normalization/`.

| Evidence | SHA-256 |
| --- | --- |
| `receipt.json` | `20679902dbcc79136dcfc69756dab17a3a48fb2349cd997d5aca6a40841ffbb3` |
| `currentness-main-siblings.json` | `df98e2f94be8930d4b348179318998bffa06fcd572de33329d64c6137e79adaf` |

The PM planning-ledger skill kept owner prose and companion work separate and
preserved the governance boundary. No native proof, governance reseal, main
landing, or completion of packet-wide closure is claimed.

## Separate fixture follow-up

After owner commit `b4af2b05b3`, the single Artifacts disposition reason now says
the replacement is explicitly blocked, not admitted, and grants no dispatch or
panel/object arguments. The disposition enum, target, all other records and all
payload/schema values remain unchanged. A fourth regression checks that wording;
all 33 Settings tests pass. The binding remains stale and unchanged: no governance
hash was refreshed. This companion closes the wording inconsistency only, not
the eventual owner route/admission question.
