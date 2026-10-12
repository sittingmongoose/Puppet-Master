# Independent critic review — B10-P01-treatment

**Stage:** critic  
**Review basis:** original brief; complete investigator discovery, draft, and source map; released plan; and carried sources index, as named by the frozen input map.  
**Scope:** review the research proposal and exact released-plan dispositions. This is a critique, not a revised proposal or implementation. Stable source IDs are carried forward unchanged in this stage's source map.

## Review judgment

The draft substantially covers the brief: it separates publisher/version identity from stored bytes and capture history; retains offline editions; supports deliberate older-version selection; keeps notes private and unchanged; links evidence to cached passages; distinguishes online observations from applicability; compares version pins, digests, HTTP validators, archives, and suggested anchor remapping; and proposes validation without claiming it ran.

I found no material wrong statement in the reviewed proposal. Three material-incomplete points need qualification before treating it as a complete design basis: it omits a strong-validator case when describing 304; it treats redirects too uniformly in proposed user action; and it compresses a narrowly reproduced FTS5 trigger issue into a broader warning. One minor wording item concerns which bytes a stored-artifact digest covers. Target handbook repository/caller/test review is honestly unresolved external input: the brief names no target repository, and the investigator says none was inspected.

## Findings

### C-01 — Material incomplete: a 304 can carry a useful strong-validator signal

**Draft locator:** released-plan Clauses 06–07; status wording in Clause 14 and the optional-check flow.  
**Evidence:** S01, RFC 9110 §§8.8.1–8.8.3, 13.1.2, and 15.4.5. Exact URL, access event, and conditions are in this stage's source map.

The draft correctly rejects “304 means every selector remains valid.” If-None-Match uses weak comparison and a 304 has no body; weak matching can accept a validator even when representation data changed. But the general “bytes not verified” wording omits a useful exception: a stored strong ETag still returned as the same strong ETag for the same selected representation is, under HTTP's strong-validator definition, evidence that the representation data did not change. A 304 response is required to include ETag when it would have appeared on the corresponding 200. This remains a server assertion, not a local digest comparison, and says nothing about a locally changed extraction pipeline.

The rejection of the original selector guarantee is right. Distinguish a weak/date validator accepted, the same strong validator for a reproducible selected representation, and an actual local byte re-hash. Only the last verifies stored bytes against the saved digest; neither HTTP result reruns selectors under a changed extractor.

### C-02 — Material incomplete: redirects need status-specific treatment

**Draft locator:** Clauses 08, 12, and 14, especially the generic “redirect destination needs review” action.  
**Evidence:** S01, RFC 9110 §§15.4.2–15.4.9.

The draft is right not to equate a new URL with the same edition or erase the old capture. The protocol distinguishes cases that the proposed generic action hides: 301/308 report permanent URI reassignment and suggest future references use the new URI; 302/307 are temporary; 303 points to a different resource and does not imply equivalence. These statuses help readers even though none establishes identical bytes, product-version scope, or note applicability.

Preserve requested URL, status, Location chain, final URL, and both editions. Show permanent versus temporary/descriptive status; do not merge editions or rewrite note links automatically. Reserve owner review for identity/applicability questions or uncertain destinations rather than requiring the same action for every redirect class.

### C-03 — Material incomplete: narrow the FTS5 risk to the reproduced trigger pattern

**Draft locator:** Clause 14's final SQLite paragraph and FTS5 alternative.  
**Evidence:** S08, S10, S12.

The initial SQLite forum reproduction was corrected after an insert-sync trigger was found missing. The refined report and maintainer reply describe external-content FTS5 synchronization combined with a second AFTER UPDATE trigger that performs a nested write to the content table. The posted failure also depended on the new text being a token superset; it reports reproducing with a bundled 3.53.2 build. The maintainer suggested creating the FTS trigger last may work. The current 3.54.0 release-history page is a high-level summary and does not map a fix to this report.

The draft appropriately calls this a risk to test rather than a universal FTS5 failure. Its shorthand “nested multiple-AFTER-UPDATE-trigger combination” and advice to prefer “no nested update trigger” are broader than the demonstrated condition and could be read as a global architecture restriction. State the trigger topology and reported version more exactly; do not exclude FTS5 or require append-only storage solely from this report before checking the actual schema and packaged SQLite release. No local reproduction or release-code trace was done here, so fix status remains unverified.

### C-04 — Minor locator/wording: name the digest byte boundary

**Draft locator:** Clauses 01 and 14, “exact stored-artifact digest” and “SHA-256 over the exact bytes persisted.”  
**Evidence:** S01 §8.1 and §§8.3–8.4 define representation data through media type and content encoding; S03 notes that the application must define digest input.

The draft correctly separates stored-artifact bytes from extracted-text digest. Clarify that the first hash covers exactly the artifact bytes persisted, and whether the downloader persists content-decoded bytes or the encoded representation. HTTP validators are not expected to equal either application hash. This is a specification detail, not a flaw in the identity split.

### C-05 — Honestly unresolved external input: no target handbook repository was supplied

**Draft locator:** Clause 13 and open questions under Clause 16.  
**Evidence:** The original brief and frozen input map name no handbook repository, code path, callers, or test commands.

The brief asks for relevant repository code, callers/tests, and issue-to-fix or release history where consequential. The investigator inspected candidate SQLite documentation, a pinned SQLite source test, a public issue/maintainer discussion, and release history, but not product callers or tests. Since no target handbook repository is named, this cannot be resolved from released inputs. Keep it as a prerequisite if product-specific integration is expected; it does not invalidate the generic proposal or justify inventing a target.

## Full brief and released-plan coverage

| Clause | Critic disposition |
|---|---|
| 01 Cache identity | Retain the identity split; add digest byte-boundary detail (C-04). |
| 02 Note-to-passage link | Retain edition-pinned quote/context and locator; no material gap found. |
| 03 Revision/later-copy display | Retain orthogonal version, capture, integrity, and check status. |
| 04 Older-version/offline behavior | Retain exact target and offline artifact; product taxonomy remains an owner question. |
| 05 Optional checker | Retain opt-in/bounds/privacy and visible variant uncertainty. |
| 06 304/changed hash | Reject selector guarantee; add strong-validator distinction (C-01). |
| 07 Validator/extractor questions | Mostly resolved; qualify strong-validator evidence and local re-extraction (C-01). |
| 08 Moved URL/history | Retain history; distinguish permanent, temporary, and descriptive redirects (C-02). |
| 09 Private, unchanged notes | Retain as a hard constraint and validate outbound fields. |
| 10 Affected links/diff | Retain per-link comparison; candidate remapping remains human-reviewed. |
| 11 Manual imports | Retain imported artifact and explicit user-supplied/unknown provenance. |
| 12 Validation coverage | Good proposed suite; add validator, redirect-status, and exact FTS-trigger cases. None is reported as executed. |
| 13 No handbook/crawler run | Correctly preserved; product-repository gap is C-05. |
| 14 Integration/action | Retain local-first integration; refine validator, redirect, and FTS5 language (C-01–C-03). |
| 15 Provisional status | Preserve; no endorsement or deployment is claimed. |
| 16 Primary evidence/open questions | Claims are substantially supported; target-repository and product-data questions remain open. |
| 17 Deployment boundary | Honored; this review made no product change. |

Against the original brief, the proposal covers offline use, deliberate old-version queries, passage navigation and partial invalidation, moved/manual sources, optional bounded network checks, several-thousand-document indexing, privacy, and non-destructive note handling. It compares provenance/change-detection approaches and separates proposed validation from executed research. No actual handbook codebase means product-specific caller/test discovery is unavailable; the draft discloses this and does not present SQLite evidence as handbook evidence.

## Work performed and limits

I read the complete frozen investigator package and brief. I independently checked the cited primary HTTP standard, W3C Web Annotation Recommendation, SQLite FTS5 documentation, SQLite Fossil report and maintainer reply, and SQLite release-history page. Those checks are recorded as appended access events for original stable IDs S01, S05, S08, S10, and S12 in the source map, with exact URLs and governing conditions retained.

No code, downloaded test, crawler, HTTP freshness request, handbook, build, or validation suite was run. All investigator test cases remain proposals; this critique's source checks are research, not product validation.
