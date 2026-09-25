# Destination edits preserve configuration, not obsolete test proof

Base: `ca380188d2b108b70c9e7565afd4c708a938e1fa`.

BRS-004's earlier "unedited fields" wording was too broad: it could preserve a
formerly-ready state and old test/capability claims after changing locator or
authorization premises. The correction preserves unedited **configuration**;
actual owner-derived health, capabilities, test disposition and currentness must
describe the resulting effective configuration. An authentic old test may remain
applicable after a label-only edit. No automatic retest, fixed resulting state,
generation increment, credential grant or remote effect is introduced.

This follows existing BRS-004 evidenced-capability and BRS-018 exact
locator/account/profile/engine-qualified safe-test rules. Independent proposal
and applied reviews found no remaining issue in this bounded correction.

Verification:

- Two of six source-prose checks fail before the correction; all six pass after.
  All 23 Backup/Forge/input/prose regression tests pass.
- Full generated-index comparison changes semantics only in BRS-004 and adds
  one acceptance criterion: 6,721 units / 26,315 criteria. Other owner text and
  unit semantics are unchanged; BRS-021 through BRS-029 remain intact.
- Standard shard generation and index generation pass. Shard checking passes
  for 99 documents / 2,733 shards. No Backup schema or fixture changes here.
- Standard index validation still fails with 23 findings. Complete before/after
  failure arrays are identical: 20 legacy decision-record errors, plus DL-076,
  SMPFS-170 and SP-319 absent relative to the then-observed newer main. No failure
  is suppressed or excused; current-main reconciliation remains pending.

The PM skill's owner-first rule keeps this corrective prose step separate from
the forthcoming typed result/owner-resolution work. ACT-089 is not closed by a
prose test. No runtime, current dispatch, readiness, governance seal or main
landing is claimed; all four Backup action findings remain open.

Evidence directory:
`/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/packet-wide-rebaseline/server-backup/`.

| File | SHA-256 |
| --- | --- |
| `destination-proof-scope-017.json` | `8d3a654a8fd4b26c3c5126d4a783d35b8c04060b74762634189cb138c86fbda4` |
| `destination-proof-independent-018.md` | `78cc36eaa447a618b39d8fea1689625c2524432665421f93ccd1014829967149` |
| `destination-proof-index-before-014.json` | `a575326fc339abbd3f8f74ac596454f8f80ebe26c0d720b3824ba4ec5c9019ff` |
| `destination-proof-index-after-016.json` | `3c87395ef91ecd823f5cdafc03a8b5db86fec429b1c1e7aa0f607c6ebde66bb8` |
