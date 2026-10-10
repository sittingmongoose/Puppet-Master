# Reviser evidence index — A3-01-treatment

This index belongs to the assigned reviser stage. Full source identity fields are in [source-map.json](../source-map.json). The inherited IDs keep their original meanings: S01–S19 are from the investigator map and C01–C11 from the critic map. New independent reviser observations use R01–R09; no earlier ID is rebound.

## Inherited source maps

- [Investigator source map](../../investigator/source-map.json) and [investigator evidence index](../../investigator/sources/index.md): S01–S19. Includes the SQLite/Tantivy reference release snapshots and the earlier malformed-query and Windows issue evidence.
- [Critic source map](../../critic/source-map.json) and [critic evidence index](../../critic/sources/index.md): C01–C11. Includes the critic's SQLite REPLACE/trigger and Tantivy writer/reload checks.

## Independent reviser checks

- [R01 — SQLite ON CONFLICT REPLACE](https://www.sqlite.org/lang_conflict.html): the conflicting canonical row is deleted before insertion; REPLACE-caused delete triggers fire only when recursive triggers are enabled. Live documentation, last updated 2025-11-22.
- [R02 — SQLite recursive_triggers pragma](https://www.sqlite.org/pragma.html#pragma_recursive_triggers): per-connection query/set behavior; initially OFF for compatibility, but future defaults may change. No deployed connection was queried.
- [R03 — SQLite 3.6.18 release record](https://www.sqlite.org/releaselog/3_6_18.html): enables recursive triggers through the pragma and limits REPLACE delete-trigger firing to that setting.
- [R04 — SQLite 3.7.0 release record](https://www.sqlite.org/releaselog/3_7_0.html): inspected against the earlier forecast that recursive triggers would become default; the listed release changes do not identify such a default change.
- [R05 — SQLite older news/history](https://www.sqlite.org/oldnews.html): preserves the earlier forecast about a 3.7.0 default change. It is a forecast, not proof that the change shipped; the discrepancy is recorded in source-map.json.
- [R06 — Tantivy 0.26.2 IndexWriter](https://docs.rs/tantivy/0.26.2/tantivy/indexer/struct.IndexWriter.html): pinned add/delete/commit contract and operation visibility. The inference that relation-table changes need explicit document events follows from this API boundary; no SQLite relation is automatically observed.
- [R07 — Tantivy 0.26.2 QueryParser](https://docs.rs/tantivy/0.26.2/tantivy/query/struct.QueryParser.html): version-pinned grammar, operators, field/query forms, match-all syntax, and parse error API. This does not establish absence of panics for every malformed input.
- [R08 — SQLite 3.43.0 release record](https://sqlite.org/releaselog/3_43_0.html): release gate for contentless-delete FTS5 indexes.
- [R09 — SQLite upstream Fossil source artifact](https://www.sqlite.org/src/artifact/a54f839859): guarded SQLITE_DEFAULT_RECURSIVE_TRIGGERS compile-time default. Its exact release association is UNKNOWN, so use it only as corroborating build-configuration evidence.

## Source conflicts and limits

The recursive-trigger source conflict is resolved conservatively: the REPLACE trigger condition is supported, but no universal default is asserted. Query the actual runtime connection or rule out REPLACE on indexed rows. Current FTS5 documentation's contentless-delete recommendation is limited to comparison with ordinary contentless and does not supersede the external-content fit. The Tantivy #3031 issue remains bounded to the reported older release and linked contributor-fork change. docs.rs/latest is mutable; reviser parser references use the versioned 0.26.2 URL. These sources do not establish deployed app versions or behavior.

No raw page captures were saved. Read-only documentation/release-history inspection only; no code, app database, or dependencies were run or modified.
