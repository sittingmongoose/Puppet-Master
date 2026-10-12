# Reviser source index

Stable source IDs are carried unchanged from the investigator/critic maps. The structured records in [source-map.json](../source-map.json) contain exact URL, version/commit, locator, UTC access record, observed operation, conditions/exceptions, and applicability. The carried records identify predecessor operations; separate RFC recheck records identify this reviser’s independent source work.

| ID | Primary source | Version | Locator and use |
|---|---|---|---|
| RFC9110 | [HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html) | RFC 9110, Standards Track, June 2022 | §§ 8.8.1–8.8.3.2, 9.3.2, 12.5.5, 13.1.2–13.1.3, 15.4.5 |
| RFC9111 | [HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111.html) | RFC 9111, Standards Track, June 2022 | §§ 3–4.3.4, especially 4.1, 4.3.1–4.3.4; § 5.2.2.2 |
| W3C-WA | [Web Annotation Data Model](https://www.w3.org/TR/annotation-model/) | W3C Recommendation, 23 February 2017 | §§ 4.2.4 Text Quote Selector, 4.2.5 Text Position Selector, 4.3 State |
| W3C-PROV-O | [PROV-O: The PROV Ontology](https://www.w3.org/TR/prov-o/) | W3C Recommendation, 30 April 2013 | §§ 3.1–3.2; wasQuotedFrom, wasRevisionOf, specializationOf, alternateOf |
| GIT-DATAMODEL | [Git core data model](https://git-scm.com/docs/gitdatamodel.html) | Rolling official documentation; page identifies latest Git manual as 2.56.0, updated 28 September 2026 | OBJECTS and REFERENCES sections, especially immutable objects, branches and tags |
| GITHUB-PERMALINKS | [Getting permanent links to files](https://docs.github.com/en/repositories/working-with-files/using-files/getting-permanent-links-to-files) | Rolling official GitHub documentation, accessed 12 October 2026 | “Getting permanent links to files”; commit-pinned file links |
| RFC7089 | [HTTP Framework for Time-Based Access to Resource States (Memento)](https://datatracker.ietf.org/doc/rfc7089/) | RFC 7089, Informational, December 2013 | §§ 2–3, temporal negotiation and Memento relations |
| NIST-FIPS180-4 | [Secure Hash Standard](https://nvlpubs.nist.gov/nistpubs/fips/nist.fips.180-4.pdf) | FIPS PUB 180-4, August 2015 | § 1 and SHA-256 algorithm |
| SWHID-1.6 | [Software Heritage persistent identifiers](https://docs.softwareheritage.org/devel/swh-model/persistent-identifiers.html) | Documentation version 1.6, last modified 30 April 2021 per carried source map; rolling docs URL | Overview, syntax, object types and context/path qualifiers |
| HYPOTHESIS-ISSUE-3705 | [Select best match for quote selectors in PDFs when position-based anchoring fails](https://github.com/hypothesis/client/issues/3705) | hypothesis/client issue #3705, opened 24 August 2021 | Issue description on position-hint page ordering, fuzzy match threshold and early return |
| HYPOTHESIS-FIX-3743 | [Find best match for quote selectors in PDFs across all pages (v2)](https://github.com/hypothesis/client/pull/3743/files) | Merged 13 September 2021 at 904810bde556c58043672b61f0ea33748fd0e00a; pinned implementation and test files at that commit | PR merge record/commit list; https://github.com/hypothesis/client/blob/904810bde556c58043672b61f0ea33748fd0e00a/src/annotator/anchoring/pdf.js; https://github.com/hypothesis/client/blob/904810bde556c58043672b61f0ea33748fd0e00a/src/annotator/anchoring/test/pdf-test.js |

## Independent primary-source rechecks

- **RFC9110** — [official RFC Editor page](https://www.rfc-editor.org/rfc/rfc9110.html), RFC 9110, Standards Track, June 2022; reviewed §12.5.5 Vary; §§8.8.1–8.8.3.2 validators; §§13.1.2–13.1.3 conditional requests; §15.4.5 304 Not Modified. Confirms Vary-selected fields and wildcard limits, weak If-None-Match comparison, and 304 conditional GET/HEAD semantics. Applied to C1 and C2.
- **RFC9111** — [official RFC Editor page](https://www.rfc-editor.org/rfc/rfc9111.html), RFC 9111, Standards Track, June 2022; reviewed §4.1 Vary cache-key matching; §§4.3.1–4.3.4 validation request construction, cache handling, and 304 update. Confirms variant-matching and request synthesis, and that a cache can evaluate received conditional requests. Applied to C1 and C2.

## Limits

The reviser did not re-fetch the other carried sources; their operations and limitations remain attributed to the predecessor source maps. In particular, the Software Heritage v1.6 direct page was access-denied in the carried research, so it is not treated as fully opened here. No local handbook code, caller, or test source was supplied in this stage input map.
