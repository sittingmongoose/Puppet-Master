# Reviser source index — B10-P01-treatment

Stable source IDs are carried forward from the investigator and critic maps. Detailed URLs, editions/commits, locators, access UTCs, observed operations, conditions, and applicability are in [source-map.json](../source-map.json).

## Primary and reference sources
- **S01** [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html) — §8.8.1–8.8.3 (validators, Last-Modified, ETag); §13.1.2–13.1.3 (If-None-Match, If-Modified-Since); §15.4.5 (304); §12.5.5 Vary; §15.4.5 304 Not Modified
- **S02** [RFC 9111 — HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111.html) — §4.2.2 Calculating Heuristic Freshness; §4.3 Validation
- **S03** [RFC 6920 — Naming Things with Hashes](https://www.rfc-editor.org/rfc/rfc6920.html) — §2 Hashes Are What Count; §3 Named Information URI; §10 Security Considerations
- **S04** [RFC 7089 — HTTP Memento](https://www.rfc-editor.org/rfc/rfc7089.html) — §2.1.1 Accept-Datetime/Memento-Datetime; §3.1 Datetime Negotiation; §4.5.6 Sticky Memento-Datetime/original link
- **S05** [Web Annotation Data Model](https://www.w3.org/TR/2017/REC-annotation-model-20170223/) — §4.2.4 Text Quote Selector; §4.2.5 Text Position Selector; §4.3 States; §4.3.1 Time State; §4.3.2 Request Header State
- **S06** [PROV-O: The PROV Ontology](https://www.w3.org/TR/2013/REC-prov-o-20130430/) — prov:wasDerivedFrom; prov:wasRevisionOf; prov:wasQuotedFrom; prov:hadPrimarySource
- **S07** [Git data model documentation](https://git-scm.com/docs/gitdatamodel) — Objects and References sections
- **S08** [SQLite FTS5 Extension documentation](https://www.sqlite.org/fts5.html) — §2.1 build/enablement; §4.4.3 External Content Tables; §4.4.4 External Content Table Pitfalls; §6.3 Rebuild; §6.4 Integrity Check
- **S09** [SQLite Fossil source test ext/fts5/test/fts5content.test](https://sqlite.org/src/raw/ext/fts5/test/fts5content.test?ci=version-3.53.2) — lines 102–143 (external-content setup and insert/delete/update triggers, integrity-check); lines 197–221 (rebuild and delete tests)
- **S10** [SQLite bug forum: FTS5 external-content index and nested AFTER UPDATE triggers](https://sqlite.org/bugs/info/d3b14ada9b81056914d0e6f9a6d23b7a804008c82b3481fae225d8a514dbd180?t=c) — initial report/correction §§1–3; maintainer response #4, lines 164–203
- **S11** [SQLite Release 3.43.0](https://www.sqlite.org/releaselog/3_43_0.html) — Release item 1: FTS5 contentless-delete indexes
- **S12** [SQLite Release History](https://www.sqlite.org/changes.html) — 2026-10-09 (3.54.0) block; 2026-07-24 (3.53.4) block; page introduction

## Reviser rechecks
- **S01** RFC 9110: strong/weak validator distinctions, If-None-Match, 304 metadata/body, and redirect status meanings.
- **S08** SQLite FTS5: external-content consistency, build availability, rebuild and integrity-check.
- **S10** SQLite Fossil report: corrected/refined nested-trigger case, reported versions and token-superset detail; not locally reproduced.
- **S12** SQLite release history: 3.54.0 dated 2026-10-09; high-level release summary only.

All validation in [final.md](../final.md) is proposed unless explicitly labeled as source research. No handbook code, test, crawler, local reproduction, build or benchmark was run.
