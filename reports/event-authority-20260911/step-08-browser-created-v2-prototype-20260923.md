# Step 08 — Browser-created SP-278 checkpoint successor prototype

**Superseded at the branch tip.** This report describes commit `153ae37c20` only; `step-08-browser-created-v2-companion-20260924.md` describes the repaired branch tip.

Root prepared a bounded, noncanonical v2 checkpoint candidate for `browser.workspace.created`. It keeps the registered v1 schema intact, preserves the existing family and logical key, adds the complete SP-278 read token and exact current frontier checks, and models one explicit v1 history arm under the unchanged three-generation policy. A v1 value cannot be treated as a current v2 checkpoint or silently defaulted into the new shape; a future original StorageMigrationCoordinator handoff must authenticate the old value and its holds, rebuild from verified CURRENT-selected source, reserve lawful capacity and atomically publish the v2 current value with actual retirement custody. The candidate supplies neither that native handoff nor a registered reader, owner prose, registry revision, PNC-019 approval or event-depth completion. It identifies the concrete canonical surfaces for the next compile: SP-266, SMPFS-167, the exact value and Browser admission registrations, versioned fixtures, oracles and migration tests. Step 08 remains open; Step 09 remains 0 registered, 6 excluded, 20 carded, 226 remaining; Step 10 has not run. Main stays unpushed.

Cost: root authenticated nine complete source resources from `origin/main` `d247d57ebd0d53ce4c66f4795e24a14d8782e9b8`, froze 16 prototype members and reran its checker: PASS, 47 static assertions. The checks include closed-shape rejection of missing token fields, v1-as-v2 and wrong family/version, plus a synthetic same-generation frontier change. Native source, redb, migration, permission and crash execution is NOT_RUN; monetary attribution is unavailable.

| Evidence | Manifest path | SHA-256 |
|---|---|---|
| External v2 candidate and test packet | `/mnt/Cursor/PM-Experiments/browser-created-sp278-v2-prototype-20260923/v1/manifest.json` | `8616d27b9c4cfa7b11e4467e7b3d7be037e93e34b1be118309dda0b11562ae83` |

The candidate schema and contract are review inputs only. Its synthetic fixture does not authenticate an original Browser command result, exact EventRecord bytes, a current Storage read transaction or the effect of overwriting a v1 checkpoint. A complete owner change must preserve actual v1 custody and current source/ref/hold rules before any v2 publication.
