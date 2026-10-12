# Sources index — B10-P01-treatment

This directory catalogs brief-only discovery. Stable IDs live in [../source-map.json](../source-map.json); do not reassign an ID. No raw page dumps or downloaded code are stored here.

## Standards and provenance

- **S01** [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html): Last-Modified, ETag and conditional GET.
- **S02** [RFC 9111](https://www.rfc-editor.org/rfc/rfc9111.html): cache freshness and validation.
- **S03** [RFC 6920](https://www.rfc-editor.org/rfc/rfc6920.html): hash-based names and integrity limits.
- **S04** [RFC 7089](https://www.rfc-editor.org/rfc/rfc7089.html): web archives and Memento caveats.
- **S05** [W3C Web Annotation Recommendation (2017-02-23)](https://www.w3.org/TR/2017/REC-annotation-model-20170223/): quote/position selectors and state.
- **S06** [W3C PROV-O Recommendation (2013-04-30)](https://www.w3.org/TR/2013/REC-prov-o-20130430/): derivation/revision relations.
- **S07** [Git data model documentation](https://git-scm.com/docs/gitdatamodel): immutable objects and object IDs.

## Search, implementation and history

- **S08** [SQLite FTS5 documentation](https://www.sqlite.org/fts5.html): local indexing, external-content sync, rebuild and integrity-check.
- **S09** [Pinned SQLite FTS5 source test, version-3.53.2](https://sqlite.org/src/raw/ext/fts5/test/fts5content.test?ci=version-3.53.2): file SHA-256 d748292f425e6fbbc69a4291b3d7e5ecfcc067ac1e4600a4cefe0b6f36f626df; read lines 102–143 and 197–221; not executed.
- **S10** [SQLite nested-trigger report and maintainer discussion](https://sqlite.org/bugs/info/d3b14ada9b81056914d0e6f9a6d23b7a804008c82b3481fae225d8a514dbd180?t=c): corrected report of a particular edge case, not a general FTS failure.
- **S11** [SQLite 3.43.0 release notes](https://www.sqlite.org/releaselog/3_43_0.html): contentless-delete availability from 3.43.0.
- **S12** [SQLite release history](https://www.sqlite.org/changes.html): version context as of 2026-10-12; no trigger-specific fix mapping identified.

Each source’s exact locator, version/commit, access time, observed operation, conditions/defaults/exceptions, and applicability are in the JSON source map.
