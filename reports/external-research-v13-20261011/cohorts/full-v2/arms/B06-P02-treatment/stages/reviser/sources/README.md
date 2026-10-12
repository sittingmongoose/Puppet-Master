# Reviser source index — B06-P02-treatment

This index navigates the self-contained [source-map.json](../source-map.json). That file carries predecessor evidence registers without changing their source IDs and adds this stage’s direct primary-source checks. Each record includes its URL, release/version or UNKNOWN, locator, UTC access record, observed operation, operative condition/default/exception, and applicability.

- Investigator register S00–S19: brief and case scope; PowerSync, PouchDB/CouchDB, Automerge, PostgreSQL, browser storage/background behavior; SDK repository/sample/caller and issue/release history. See the upstream_registers entry named investigator.
- Independent breadth checks C01–C04: PowerSync conflict handling, CouchDB replication and security, Automerge conflicts. Cross-references retain original upstream_source_id values. See the upstream_registers entry named critic-breadth.
- Independent truth checks T01–T07: PowerSync queue semantics, CouchDB conflict/security rules, Automerge conflict lifecycle, PostgreSQL index behavior, MDN storage limits, and the PouchDB proposed-fix record. See the upstream_registers entry named critic-truth.
- Reviser checks R01–R07: direct reopen of PowerSync conflict documentation, CouchDB conflict/security docs, Automerge conflict docs, PostgreSQL 18 INSERT/CREATE INDEX, and MDN storage quotas/eviction. The browser did not provide a per-open timestamp; each record gives the bounded UTC access window and says so.

Read [final.md](../final.md) for the proposal, clause-by-clause plan dispositions, explicit resolution of both critiques, and the proposed validation matrix. All validation scenarios are proposals; none were run in this stage.