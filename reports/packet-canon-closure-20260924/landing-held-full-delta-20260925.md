# Landing held: complete main/repair delta

The landing is stopped under the user's exact-exception rule. No main
fast-forward or push occurred, no governance binding or baseline was refreshed,
and the landing lock was released. This is not packet closure or runtime proof.

Compared pinned main `1e5d9b097b46aa58e7af488a9c38a87efb780d5f` with the verified
repair tree committed as `bad5718eede2686cc573cbc200c771f232a45815`. That repair
is pushed to both remotes as `fix/packet-canon-repairs-rebased-20260925`; its old
pre-rebase remote branch remains intact. All 46 changed test files pass (517
test cases), as do 132 newer-main regressions. Shard and PlanUnit checks pass;
native certification remains blocked.

## Exact added findings outside the prior exception

Two causes produce six added occurrences classified **non-staleness**:

1. `TCR-SETTINGS-PACKET-COMMANDS: disposition registry hash drift` appears once
   in each aggregate's Touch Closure lane. Its binding to
   `Plans/settings_command_dispositions.json` expects
   `10e1ffd1062a9a3aebd5c418acc7289fb5bb3d0261ef08edc65a461a47685632`, but the
   blocked-Artifacts correction produces
   `43e215863fc05d2d2bc1bd863cbaca64042e167af6331e99eac3122a6b68e866`.
2. `missing_ref` appears in the evidence and plan-graph lanes of both aggregates
   (four occurrences). Source:
   `Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/evidence.json`.
   Missing artifact:
   `Plans/_shards/storage_value_registry/551-lines-110001-110108.md`.
   Main's manifest owns that old tail; deterministic regeneration after registry
   growth produces `551-lines-110001-110200.md` instead. The old sealed reference
   explains the finding but does not authorize changing generated evidence or
   restoring a stale shard to make the checker pass.

The six exact normalized keys are retained in the full delta. Neither these
additional findings nor the broader changed-document staleness is silently
covered by the older exception for Commands_System.md, UI_Command_Catalog.md
and touch_closure.json. Governance-owner coordination or explicit direction on
the exact additional findings is required before a landing attempt.

## Full comparison, not the printed samples

Complete normalized multisets contain 38,771 main and 45,093 repair failure
occurrences: 6,381 added and 59 removed. Of the additions, 6,375 are classified
staleness and six are the findings above. There are no incomplete lanes,
unmatched exports or infrastructure timeouts. Main's two rerun leaf checks after
authentic ignored-input restoration are documented explicitly; original outputs
are retained, not rewritten.

Readiness is **28 -> 57** in each aggregate. The exact increase is 28 Event
Authority source drifts plus one storage-registry Spec Lock hash drift. Native
uncapped audit-closure errors are **2,029 -> 2,043**, all fourteen additions being
stale owner/closure hashes. Its capped wrapper remains at 201, demonstrating why
the full export comparison was required.

The landing checker itself exits 1 with zero blocking items. That does not
override the user's narrower exception. Aggregate totals are 4,319 each versus
main's reconciled 1,835; current migration is 34,412 versus 33,072. Complete
added/removed keys, per-lane exports and staleness count groups—not those totals
alone—support this decision.

## Evidence custody

External root:
`/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/`.

- `rebased-full-delta-001/stdout`: SHA-256
  `51951df7173e28e740ce28b06edf59df03b463652f2168f66eba920f07b0ab2e`.
- `rebased-full-delta-001/REVIEW.md`: SHA-256
  `2ed549f51128e4ec11fa54c866fb5e2616e6ca5f7d0ad5ca1b395916b73b39fa`.
- `rebased-full-delta-001/receipt.json` records exact command, output hashes
  and comparison exit status. Original complete reports and supplemental exports
  remain in `rebased-full-landing-001/`.

Any eventual landing must reacquire the lock, fetch/reconcile the then-current
main, rerun required checks, and request the designated governance owner's
reseal. This report grants no exception and performs no reseal.
