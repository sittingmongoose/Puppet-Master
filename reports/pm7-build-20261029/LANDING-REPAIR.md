# PM7 landing repair — 2026-11-01

**Dry landing: exit 1, zero blocking items, no infrastructure timeouts.** Exact checked/source commit: `4dc5f29ff6f1f1031b1e37126ca47c09c8db8ba4`, on integration `7f3eecce64`, against main `34b9ab2843`. All 18 items in the lead’s first report are cleared. This is a companion repair under DL-259/DL-257 and SP-310, with no new product decision.

| Finding | Cause | Fix / proof |
|---|---|---|
| **12 duplicate-ID groups** | Native-Client/Caddy examples and four onboarding variants reused existing positive record IDs. | Separate native/Caddy identities, four unique onboarding action/projection IDs; existing return, owner and permission relationships preserved. No fixture removed. |
| **Request-fixture census** | The validator expected only 44 primary examples and omitted the 3 accepted native/Caddy variants. | Keep all 44 primary cases mandatory; explicitly name the 3 additional cases and their exact command IDs. Census 47. Undeclared cases, a missing primary and a mismatched additional command remain rejected. |
| **Wrong-Client negative** | A semantic equality test lacked its existing semantic_rule tag and was treated as a JSON-shape test. | Attach native_connector_client_owner_mismatch; the existing owner check rejects the mutation. No runtime rule or schema widened. |
| **Two readiness references, twice in aggregates** | The current Goal cancellation resource maps still pinned the shared-runtime file before its D7 annotation. | Update only 7 hash fields in 3 current resource maps. NonSecretRef, stored wrappers, retrieval URIs and all authority/realm boundaries remain unchanged. Readiness 90→88; storage self-tests now pass. |
| **Four generated pointers, 16 aggregate rows** | Protected evidence names old shard filenames after renumbering or new line ranges. | Remain nonblocking, as the lead confirmed. Old blobs match the unchanged evidence; current manifests/sources/shards verify. Neither evidence nor classifier changed. |

The complete contract validator passes **41 pairs, 1599 positives, 4201 negatives and 13 internal self-tests**. Shards, PlanUnit index and onboarding-rulings checks pass. Existing coverage stays at **212 rows / 1060 cells**; no command, binding, setting, product rule or owner prose changes. No configured shard source changed, so regeneration was unnecessary.

The full landing run retains all three aggregate reports and five complete subcheck exports. Raw aggregate statuses remain fail from governance staleness and existing findings; the landing classifier reports **blocking 0**, with a current unchanged baseline and no timeout. Its only 16 new non-staleness records are the old generated pointers above; none names a branch-owned source. No failure is hidden or excused by a new rule.

Report: `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-build-20261029/plans/landing-repair-20261101/dry.json`
SHA-256: `850ee2efeff4caddb059b72bc27e86e118f374530f312fa18ee1536b03736c1f`

`LANDING-REPAIR.json` records the exact counts and 15 input hashes. Additional proof under the same raw directory: `new-contracts-before.json`, `new-contracts-after.json`, `readiness-before.json`, `readiness-after.json`, `focused-fixture-identity-guard.json`, `repair-preservation.json`, `generated-shard-staleness-proof.json` and `ignored-inputs.json`. All 3560 required ignored files/links match the lead’s worktree, including the same currentness audit target.

Spec_Lock, auto_decisions, `.evidence`, `.implementation_readiness`, the current migration snapshot and the landing baseline remain exactly main’s. No baseline/snapshot refresh, reseal, browser, landing or landing lock. The lead owns the final landing and eventual governance refresh. Codeberg and Forgejo restricted-token decisions remain Jared’s; this repair answers neither.
