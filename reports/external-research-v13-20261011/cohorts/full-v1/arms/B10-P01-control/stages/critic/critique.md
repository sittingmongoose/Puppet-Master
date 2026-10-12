# Independent critique — B10-P01-control

**Review status:** Complete independent review of the investigator package against the full brief and exact released plan. This is a critique for the fresh reviser, not a replacement proposal or a repair of the draft.

## Overall assessment

The draft is a strong, scope-faithful proposal. It keeps product/release identity, URL observations, retained bytes, extracted text, passage anchors, network checks, and note-to-claim links distinct. It preserves offline access and older targeted versions, refuses automatic note edits or silent anchor movement, distinguishes proposed checks from executed work, compares viable alternatives, and gives users states/actions for missing or changed evidence. The released plan’s most serious false inference (that a 304 validates every selector) is explicitly rejected in P06 and the 304 result row.

I found one material incompleteness in the checker’s HTTP model, one wording-level overclaim, and one honest external-input limit. No material-wrong or unsupported consequential claim was identified in the package reviewed. See the issue register and P01–P17 review below.

## Findings

### C1 — Material incomplete: revalidation is not bound to the selected representation variant

**Draft locators:** Proposed records (Snapshot and Check event); “Optional bounded network checks,” especially conditional requests and the 304 result row; P01, P05, P06, P08 and P13.

The proposal records URL, content type/encoding, ETag strength and status, but does not retain the response’s Vary field or a safe representation-selection key for the request headers that selected the cached representation. An ETag/304 is meaningful only against the selected representation; the user-agent must revalidate the same variant. RFC 9110 §12.5.5 says Vary names request fields that may select content (including Accept-Encoding and Accept-Language), and Vary: * means the representation cannot be matched from request fields alone. RFC 9111 §§4.1 and 4.3.1 tie reuse/conditional requests to those original selecting fields. A French/English or compressed/uncompressed response can therefore be mis-associated if the checker reuses a validator with a different request selection.

**Recommended revision:** Add the received Vary value and an explicit variant key to each snapshot/check record; retain only the minimal non-sensitive selection metadata needed to reproduce a public representation. Revalidate with the same method, target and selecting fields. If Vary: *, a selecting field is sensitive, or the original variant cannot safely be reproduced, report “comparison unavailable/not checked” rather than an unchanged result. Do not persist credentials or private request fields. Extend proposed fixtures to change Accept-Language/Accept-Encoding and cover Vary: * and unreproducible variants. This is a proposal; no behavior was implemented or tested.

### C2 — Minor wording/locator: “Origin matched” overstates what a 304 records

**Draft locator:** “Optional bounded network checks,” recommended states, the conditional 304 row.

The row says “Origin matched stored validator.” HTTP caches can forward validation and update stored metadata; a 304 observation does not prove the application reached the origin directly. Say “conditional request returned 304 for the recorded target/validator” (and show validator strength and selected variant). Keep selector validity separate. This wording refinement is secondary to C1.

### C3 — Honestly unresolved external input: existing repository integration cannot be assessed

**Draft locators:** “Search-result presentation and integration”; source index, “Retrieval and evidence limits”; P14; owner decisions 5–6.

The released input map contains the brief and investigator package, not the handbook repository, existing callers, cache schema, note schema, tests or release history. The draft correctly discloses that no local code/callers/tests were available and uses the pinned Hypothesis issue/fix/code/test as a bounded public implementation example. Its sidecar, lazy backfill, IDs and performance direction are plausible design options, not compatibility findings about this handbook. Preserve that limitation for the reviser; do not imply local code or tests were examined. The source map also honestly records that the Software Heritage page could not be opened directly and that this alternative rests on its indexed text.

## Released-plan clause review

| Clause | Critic disposition |
|---|---|
| P01 | **Retain, expanded.** Immutable snapshots, captured bytes/hash, release evidence, redirect history and extraction identity are useful. Add the missing HTTP variant key (C1). |
| P02 | **Retain, clarified.** Link a note revision or claim/excerpt to a passage in a particular snapshot/extraction; do not imply whole-note support. |
| P03 | **Retain, clarified.** Separate selected release evidence from later observed copy/check status; a newer copy is only a candidate. |
| P04 | **Retain.** Explicit older-version targeting and offline retained copies directly meet the brief. |
| P05 | **Retain with limits.** Optional user/opt-in checks are bounded and separate from search. Safe-URL policy and owner approval remain decisions, not established facts. |
| P06 | **Reject the plan’s initial inference.** The draft correctly says 304 does not validate selectors or prove byte identity under weak comparison. Replace “Origin matched” phrasing as in C2 and bind the validator to the selected variant (C1). |
| P07 | **Retain, scoped.** A changed body creates a candidate snapshot and passage-level diff; review only affected links, not every note. |
| P08 | **Resolve, with one omission.** ETag/date validators, raw hashes and extraction anchors are distinguished; add Vary/variant identity per C1. |
| P09 | **Retain, expanded.** Preserve redirect observations and old locators; do not silently assert alias/successor identity. |
| P10 | **Retain as invariant.** No note rewrite or note/query/excerpt egress; the draft also discloses URL/timing/network metadata. |
| P11 | **Resolve at locator level.** Local section/passage comparison can identify candidates and ambiguity without deciding claim truth or auto-reattaching. |
| P12 | **Retain, clarified.** Manual import remains an immutable snapshot with staff-supplied, unverified fields and a distinct “not checked” state. |
| P13 | **Retain and extend.** The proposed matrix covers protocol, redirect, unavailable-source, version, extraction, passage, privacy and performance cases. Add C1’s variant fixtures. These remain proposed, not run. |
| P14 | **Retain as evidence limit.** No handbook, crawler or implementation was run. |
| P15 | **Retain and operationalize.** The separate identity/check/passage states and actionable failures match the clause; distinguish a returned 304 from proven direct-origin contact (C2). |
| P16 | **Retain.** The listed trust, version, retention, schedule, review and migration questions are genuine owner/data decisions. |
| P17 | **Confirmed.** The draft remains a proposal; it does not request deployment. |

## Full-brief coverage and evidence quality

- **Revision/provenance model:** Strong separation of upstream work/edition, observed locator, captured bytes, extraction, claim-specific passage and check event. Hash is not presented as publisher identity; validator is not release identity.
- **Applicability and alternatives:** The comparison covers release URLs/commits, local digest, HTTP validators/freshness, Memento, Software Heritage and passage selectors with appropriate fit limits. Version targeting is explicit; newest is not treated as most applicable. The Hypothesis issue/fix is appropriately framed as PDF-specific, not universal.
- **Reader route and presentation:** The draft provides a route from claim/excerpt to an exact retained passage, with distinct missing, ambiguous, moved/changed and unavailable states, cached-copy access, version filters and review actions.
- **Offline, privacy and preservation:** Search/open/diff remain local; network checks are optional and bounded. Note text, excerpts and search data are excluded from requests; old snapshots and authored notes are preserved. Manual import provenance remains explicitly unverified.
- **Integration and scale:** A sidecar and local index are reasonable proposals for several thousand documents, with no claim of measured performance. Exact fit to the actual repository remains unresolved external input (C3).
- **Validation:** The draft consistently labels fixtures, privacy checks and performance checks as proposed. The Hypothesis code/test review was source inspection only; those tests were not executed. No handbook, crawler, implementation, network behavior probe or benchmark was run. This separates executed research from proposed validation accurately.
- **Source traceability:** Source IDs remain stable. I independently opened the governing HTTP, W3C, Git/GitHub and Hypothesis pages listed in my source map, including the pinned Hypothesis implementation/test and merge record. I confirmed the discovery and revealed-plan hashes against the carried files. The direct Software Heritage page remained inaccessible and is not treated as a fully fetched source.

## Research and scope limits

The input map’s listed predecessor package was the only case material reviewed. No parent conversation, other candidate, evaluation, campaign history or unlisted local repository path was read. Public pages were treated as untrusted research data. No downloaded code was run. The released plan’s SHA-256 and frozen discovery SHA-256 match plan-reveal.json; no hidden original-plan source was opened.