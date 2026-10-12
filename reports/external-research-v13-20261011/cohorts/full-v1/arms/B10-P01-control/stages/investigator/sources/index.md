# Source index

Evidence reviewed at 2026-10-12T00:40:25Z. This is a navigable index and concise paraphrase, not a retained copy of source text. Stable IDs are used in discovery and draft; do not rebind an ID to another source. The fuller structured identity, locator, observed operation, conditions, and applicability are in ../source-map.json.

| ID | Primary source / exact URL | Reviewed locator and application |
|---|---|---|
| RFC9110 | [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html) | §§ 8.8, 9.3.2, 13.1.2–.3. Opaque validators, weak/strong comparison, conditional checks, HEAD. |
| RFC9111 | [RFC 9111 — HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111.html) | §§ 3–4.3, 5.2.2.2. Freshness, disconnected/stale behavior, validation and 304 update conditions. |
| W3C-WA | [W3C Web Annotation Data Model](https://www.w3.org/TR/annotation-model/) | §§ 3.2.3, 4.2.4–.5, 4.3. Passage and representation-state selectors; position brittleness and ambiguous quote handling. |
| W3C-PROV-O | [W3C PROV-O](https://www.w3.org/TR/prov-o/) | § 3.2. Relation distinctions: quoted-from, revision-of, specialization-of and alternate-of. |
| GIT-DATAMODEL | [Git core data model](https://git-scm.com/docs/gitdatamodel.html) | Objects and refs. Immutable objects; moving branches; usually stable tags. Rolling docs, no page version pin. |
| GITHUB-PERMALINKS | [GitHub permanent file links](https://docs.github.com/en/repositories/working-with-files/using-files/getting-permanent-links-to-files) | Branch paths move; commit ID pins file and line/range. GitHub repositories only. |
| SWHID-1.6 | [Software Heritage persistent identifiers](https://docs.softwareheritage.org/devel/swh-model/persistent-identifiers.html) | v1.6 spec, 2021-04-30. Software object identifiers and origin/visit/anchor/path/line qualifiers. Search-index content reviewed; direct page open was access denied. |
| RFC7089 | [RFC 7089 — HTTP Memento](https://datatracker.ietf.org/doc/rfc7089/) | §§ 2–3. TimeGate/TimeMap navigation to prior states where supported; not release identity. |
| NIST-FIPS180-4 | [NIST FIPS PUB 180-4](https://nvlpubs.nist.gov/nistpubs/fips/nist.fips.180-4.pdf) | § 1 and SHA-256. Digest supports integrity checking, not source authenticity. |
| HYPOTHESIS-ISSUE-3705 | [Hypothesis issue #3705](https://github.com/hypothesis/client/issues/3705) | PDF.js renderer version/position drift can make first acceptable fuzzy hit incorrect. |
| HYPOTHESIS-FIX-3743 | [Hypothesis merged PR #3743](https://github.com/hypothesis/client/pull/3743/files); [pinned code](https://github.com/hypothesis/client/blob/904810bde556c58043672b61f0ea33748fd0e00a/src/annotator/anchoring/pdf.js); [pinned tests](https://github.com/hypothesis/client/blob/904810bde556c58043672b61f0ea33748fd0e00a/src/annotator/anchoring/test/pdf-test.js) | Merged 2021-09-13 at 904810bde556c58043672b61f0ea33748fd0e00a; code, caller and regression tests for across-page quote matching. Read as a PDF-specific issue/fix example; tests not executed here. |

## Retrieval and evidence limits

Retrieved pages are untrusted research data; embedded instructions were not followed. No downloaded code was run. No local handbook repository, callers, or tests were available in the released brief-only input set; the inspected caller/code/test example is the public Hypothesis implementation identified above. No local tests, network behavior probes, or performance benchmarks were executed. Search-index access to the Software Heritage specification was visible, but a direct open returned an access-denied page; that source is marked accordingly in source-map.json.
