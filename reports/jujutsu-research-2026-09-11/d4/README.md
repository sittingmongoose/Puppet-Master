# Jujutsu correction and decision checkpoint bundle

One correction closes the gap between the Source Control promise that every terminal attempt emits a typed receipt and the Jujutsu result schema, which previously admitted null receipts. JJI-003 and its existing schema now require the existing non-secret receipt reference for all six terminal outcomes. Accepted work still requires ObservableWork; pre-attempt rejection and native operation identities retain their existing semantics.

The correction was compiled through ledger `pldg-20260911-001-jujutsu-receipt-correction` with independent review. One fixture identity collision caught by the full contract verifier was fixed and independently reviewed. The exact final canonical hashes are in `verification.json`.

Static verification passes: all 48 positive and 65 negative JJ cases, including six counterexamples accepted by the old schema and rejected by the new schema; the complete 24-pair contract suite (930 positive and 3116 negative cases); PlanUnit index validation; and the configured shard check (98 owners, 2159 shards). Existing cases are preserved.

Governance remains failed: the same 11 of 32 standard checks fail before and after the correction. Exact stale-hash details changed; supplying the unchanged historical audit inputs exposes more stale-source diagnostics. The new ledger truthfully reports three pre-existing Jujutsu coverage omissions in sharding configuration, Spec Lock and plan graph. The configured shard PASS therefore does not certify Jujutsu shard coverage. `governance-delta.json` preserves the distinction. Governance and runtime readiness are not certified.

The generator was rerun after supplying an unchanged external copy of its missing ignored historical audit input. The resulting index changes are limited to Jujutsu projections, their generated timestamps and the expected Jujutsu stale-source diagnostic. Spec Lock, evidence bundles, implementation-readiness artifacts, plan graph and governance locks were not changed.

The [44-card decision packet](../d3/decision-packet.md) and [technical companion](../d3/technical-companion.json) cover all 35 optional capabilities and six product choices (four history actions have separate cards). None is adopted. The [comparison and per-stage timing tables](../d3/README.md) retain both partial campaigns, the adjudicated-union denominators, shared/unique findings, costs and coverage limitations.

Arrival at the deliverable-4 checkpoint requires this correction and the published bundle on `origin/main`, successful landing checks and pushes, and removal of the worktree. The coordinator records the completed external checkpoint receipt after those actions and reports its path plus SHA-256. Deliverable 5 requires Jared's answers and a fresh worktree.
