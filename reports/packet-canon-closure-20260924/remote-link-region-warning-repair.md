# Remote Link region failure and provider warnings

Status: bounded owner-specification repair; runtime evidence remains not_run.

Three historical findings reduce to two missing clauses: configured-region failure/failover (acceptance L000039 and contract L000208), and provider outage/cost/limit warnings (acceptance L000042). RAS-006 now explicitly preserves Server identity, route admission, pairing/authorization, E2E protection, idempotency and stream continuity across admitted regional failover, or reports unavailability. Warnings use provider-qualified current facts and disclose unknown/stale information without granting expenditure or changing identity/exposure. RAS-010 names the corresponding positive/negative proof obligations.

This does not choose a provider, region count/geography, prices, thresholds, paid infrastructure or telemetry store. Provider-neutral warning wording is an inference from the source's Cloudflare warning and current replaceable-provider contract, not a Cloudflare production selection. Static text is not a native failover, warning implementation or WAN certification result.

Root read the packet passages and current RAS-006/007/010. A different Sol independently accepted the scope and reviewed the exact diff, requesting removal of an unsupported reference to an existing Remote Link billing mechanism; that wording was removed. Existing route admission and the prohibition on granting expenditure remain explicit.

## Source evidence

Verification: shard generation/check PASS (99 sources, 2,766 shards); index generation PASS (6,747 units, 26,565 acceptance criteria). No PlanUnit IDs added or removed. Every changed unit/acceptance record belongs to Remote_Access_System.md; no unrelated owner changed. This owner has no registered shard directory, so generation produces no shard delta. Whitespace check passes. These are static checks, not a full landing check or runtime test.

Source directory: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/r5-server-baseline243-review-20260912-FvhUQQ9A/source-snapshots/`.

| File | SHA-256 |
| --- | --- |
| 14_ACCEPTANCE_AND_FAILURE_TEST_MATRIX.md (lines 39, 42) | `87499148d29f26831098b7065216fe8369aefdb485f909efd9610d45824d7733` |
| machine/remote_access_requirements.json (line 208) | `af565fa9b345d6e5ce32fb245eca8319e4b9f18f25769677db68e7f4c8c715aa` |
| 18_FINAL_WAN_REMOTE_ACCESS_AUTHORITY.md (Remote Link section) | `a981f90fe3b607a6edbe7e5e5518517d2eeb2269dd3fbe3ba18d41c5c2491d4d` |

External root scope review: `/home/sittingmongoose/PM-Experiments/packet-parallel-20260925-WF6UrR/case-reconciliation/REMOTE-LINK-RESIDUAL-REPAIR-SCOPE.md`. Current-main rebase and landing checks remain required; no governance binding or baseline was refreshed.
