# D-M08-A — independent declared-source judgment J1

**Verdict: FullSourcePASS.** The entire declared scientific scope was independently assessed: all six original-brief obligations, all eight material critique findings, every consequential recommendation in the frozen final, and the supplied rewrite-to-final preservation. No material source contradiction or unsafe combination instruction was established. This is a scientific judgment of a bounded recommendation, not a judgment of implementation, native lifecycle, budget, or exhaustive unknown-issue recall.

## Identity, provenance, and review limits

Read only INPUT_MAP.json and the exact files it authorized. The method-bearing path `control/coherent-rewrite-check-final-v3` was visible, so blinding was imperfect; no sibling answer, other arm, campaign history, parent/lineage thread, evaluator answer, expected result, or account/configuration data was consulted. Incidental run statements inside the supplied critique/final were treated as untrusted statements, not as evaluator evidence.

The governing sources are the local frozen public-primary bytes, captured 2026-10-07:

- **S:** [RFC 9110, HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.txt), June 2022; local `cases/D-M08-A/inputs/sources/httpsem.txt`; SHA-256 `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`.
- **C:** [RFC 9111, HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111.txt), June 2022; local `cases/D-M08-A/inputs/sources/httpcache.txt`; SHA-256 `aeb52adb3279d5f23dae34f68af11bd5cef0a0aff7ffcd014c9ca93c5302cf3e`.

Local paths above are relative to `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/`. Every line locator below refers to those frozen files, not a mutable HTML rendering. All eight scientific hashes in the map matched. The final and its sole authored intermediate, `rewrite.md`, are byte-identical: SHA-256 `6077e1bc7dc277e4215bcde77a7c55a6de33f38ffd54c4ce1e6e159dac8ead72`, 7,319 bytes, 1,058 whitespace-delimited words. Source issue dates were also checked in each RFC's header. No live fetch, errata investigation, server test, or library test was needed for the declared source claims.

## Axis 1 — required brief obligations

1. **Resolve all material critique findings explicitly — met.** Final lines 7–14 dispose of critique items 1–8; substantive conditions appear at lines 18–30. Independent source adjudication of each finding follows under axis 2; library exposure remains explicitly unresolved.
2. **Bind range/validator conditions and representation identity — met.** Same target, confirmed strong validator, selector uncertainty, byte form, weak-tag prohibition, conditional date eligibility, and no-validator full-GET fallback are retained. S §§8.8.1, 8.8.2.2, 13.1.5, 15.3.7.3 govern.
3. **Handle full, partial, and unsatisfiable responses — met.** Final lines 22–24 separate valid 206 append, staged 200 replacement, other-status preservation, and non-payload 416. Unknown totals and optional 416 range metadata are handled.
4. **Preserve supported encoding and length caveats — met.** Final line 26 preserves coded-byte offsets, actual response verification, optional identity/decompression advice, and message length versus complete length.
5. **Check consequences of amended upstream identity claims — met.** Final lines 18, 22, 24, and 28 propagate target/validator/coding identity into append eligibility, replacement-generation handling, and metadata reassessment. A matching tag across targets never authorizes a join.
6. **Retain uncertainty, optional advice, and proposed tests — met.** Final lines 14, 26, 30, and 34 preserve library uncertainty and optional advice, expand the test scenarios, and explicitly distinguish proposals from execution.

No obligation or material critique item is left UNASSESSED.

## Axis 2 — consequential claims and governing conditions

**Critique 1, identity/selectors — supported amendment, preserved.** S §3.2 (lines 744–752) makes the selected representation the basis for conditional GET/range responses. S §8.8.1 (3393–3479, particularly 3403–3422) ties strong validators to GET-visible data changes and scopes uniqueness to one resource, not different resources. S §12.5.5 (5668–5733) explains selection fields and `Vary: *`, including factors outside request syntax. Final line 18 correctly treats a selector snapshot as insufficient, while retaining same-target strong validation. Matching request fields alone would not establish identity; a validated same representation is the necessary downstream condition.

Coding identity has an additional governing constraint: S §8.8.1 (3463–3471) treats a validator shared by gzip and uncoded, differing data as weak; §8.8.3.3 (3718–3724) requires distinct strong entity tags for encoded versus unencoded representations. Thus a nominally identical tag cannot cure a contradictory coding/data change. The final's “confirmed strong validator,” same-byte-form gate, and fresh-GET fallback must be read together; its source claims do not license that unsafe join.

**Critique 2, failed If-Range/overwrite — supported qualification, preserved.** S §13.1.5 (6143–6147) prohibits weak ETags and permits an HTTP-date only when no entity tag exists and the date is strong. S §8.8.2.2 (3528–3569, especially 3543–3552) supports the final's precise client rule: an associated stored entry with Date at least one second after Last-Modified, plus reason to trust the same clock or enough separation to make skew unlikely. This is the June 2022 rule; a one-second gap alone is insufficient. S §13.1.5 (6153–6179) requires exact date equality and strong ETag comparison, not the earlier-than-or-equal date test.

A false evaluated If-Range ignores Range (6173–6175), rather than producing 412 for that condition. However, normal checks and redirects/failures take precedence under §13.2.1 (6186–6196); §14.2 (6513–6517) applies Range only where the otherwise-result is 200. Final lines 20 and 24 correctly avoid a universal successful-200 prediction. Staging a valid full GET 200 before replacement is a conservative client policy, not an RFC-imposed filesystem operation. An interrupted new 200 is a new partial generation, not bytes to append to the old prefix.

**Critique 3, 206 validation — supported acceptance/detail, preserved.** S §15.3.7 (7068–7102) requires inspecting Content-Type/Content-Range and permits less than all requested data. §15.3.7.1 (7110–7113) requires Content-Range and content consisting of that single range. §14.1.2 (6392–6400) makes positions inclusive and relative to coded octets; interval length is therefore last minus first plus one. §14.4 permits an unknown total (6617–6632), prohibits recombination for unknown units (6605–6608), and prohibits it for reversed endpoints or a reported complete length no greater than the last endpoint (6634–6638). Final line 22's valid-range requirement and octet-count check preserve these boundaries; it does not reject `*` solely because the total is unknown.

S §15.3.7.2 (7126–7139, 7170–7187) and §14.6 (6699–6707) establish multipart boundaries and per-part ranges. A conforming server must not send multipart for the final's single-range request; unexpected multipart is still a useful robustness test. The final safely requires per-part parsing/validation or rejection, never raw MIME-body append. Requiring same target, byte form, and strong validator accords with §15.3.7.3 (7191–7200).

**Critique 4, 416 — supported qualification, preserved.** S §15.5.17 (7757–7769) permits rejection for no satisfiable ranges or excessive small/overlapping sets and says Content-Range SHOULD be sent, not MUST. §14.4 (6640–6647) identifies `bytes */length` as current selected-representation length; it does not prove the saved prefix belongs to that representation. §15.5.17 (7777–7785) explicitly warns that clients cannot depend on receiving 416 because servers can ignore Range. Final line 24 preserves each condition and appends no error body.

A shortened representation does not force 416: if its strong validator changed and If-Range fails, Range is ignored instead. The final separates those branches and does not promise 416 after a changed ETag. A length-only “already complete” inference remains prohibited.

**Critique 5, encoding/length — supported acceptance, preserved.** S §8.4 (3059–3075) defines Content-Encoding as a representation property and metadata in terms of the coded form; §14.1.2 (6397–6400) directly specifies encoded-byte ranges. S §8.6 (3203–3209) and §15.3.7 (7091–7095) distinguish message content length from whole-representation length. Final line 26 preserves these facts. Consistently decoded storage of a gzip stream would not by itself make a decoded byte count a valid Range offset; the final instead ties resumption to the representation's octet form or verified identity encoding.

**Critique 6, combination metadata — supported amendment, preserved.** S §15.3.7.3 (7202–7228) governs three cases: newest response incomplete 200 → its fields; newest response 206 with a matching stored 200 → most recent matching 200's fields; only matching stored 206s → most recent stored fields, replacing corresponding fields supplied by the new response except Content-Range. When the union is complete, processing as complete 200 includes full-length Content-Length. Final line 28 accurately preserves these cases and separates per-message range metadata from representation metadata.

C §3.4 (440–451) additionally requires a combining cache to share a strong validator, meet S's client combination requirements, and update headers under C §3.2. That update has exceptions, including Content-Length, fields excluded from storage, and fields tied to processed stored data (C 375–410). The final's general cache-update statement is accurate; it is not an instruction to replace a representation's full length with the latest fragment length. Its non-cache sidecar policy remains a bounded design requirement rather than a completed field-by-field implementation: explicit retention/replacement, clearing or regenerating range metadata, and rechecking append eligibility. The brief does not require a complete cache implementation.

**Critique 7, uncertainty/tests — supported acceptance/additions, preserved.** Final line 30 retains unchanged resume, changed-tag 200, 416, partial/malformed 206, length mismatch, and decompression scenarios and adds weak-tag/date eligibility, absent 416 metadata, redirect/error, unexpected multipart/unknown unit, unknown total, target/selector/coding change, metadata refresh, and interrupted 200. The original shorter-resource 416 scenario is represented by the 416 tests and the explicit shortened-resource qualification at final line 10; its precondition caveat is stated above. The proposed scenarios are useful checks, not evidence of observed behavior.

**Critique 8, library-byte exposure — justified unresolved finding, preserved.** Neither RFC selects the desktop client's library or proves what its API returns. C §3.2 (397–410) even discusses decoding-induced data/metadata mismatch. Final lines 14 and 30 correctly retain this uncertainty and require checking the actual write path, rather than claiming a particular request header guarantees resumability.

## Axis 3 — bounded useful discovery and optional leads

The two frozen RFCs suffice for these claims. Within them, checking S §8.8.3.3, §13.2.1, §14.6 and C §§3.2–3.3, 4.1 independently exposed the coding/tag distinction, normal-check precedence, multipart format, cache-update exceptions, incomplete-response rules, and wildcard matching limits. C §4.1 (528–557) confirms a wildcard cannot simply match a later request without validation.

The final appropriately retains optional `Accept-Encoding: identity` and transparent-decompression advice. S §12.5.3 (5525–5585) gives identity its no-encoding meaning and describes negotiation; it does not establish the behavior of an unspecified client API. No library-specific lead was invented or investigated without a selected library. These boundaries are useful, bounded uncertainty rather than blanket abstention.

## Axis 4 — incorrect rejection or correction

No material incorrect rejection or invented source correction was established. The common draft already scoped ETags to a resource and made actual full 200 replacement safe. The final preserves those supported claims; its rejection targets the inference that failed If-Range universally yields a successful 200, not an allegation that the draft explicitly told clients to overwrite on redirects/errors. The strong-validator fallback, valid partial ranges, unknown totals, coding caveats, and optional advice remain usable.

The final's choice to replace on an actual new 200 is conservative even though S §15.3.7.3 permits combining matching incomplete 200s. It also preserves that RFC metadata case. Choosing replacement does not falsely assert that conforming same-validator combinations are forbidden by HTTP.

## Axis 5 — final preservation

There is no authored-intermediate-to-final loss: the sole rewrite and final are byte-identical. Against both common predecessors, the final preserves supported claims, explains all eight critique dispositions, retains both exact RFC identities/hashes, carries uncertainty about the library, and keeps optional content optional. Amended target/selector/coding claims propagate into writing and metadata decisions instead of being confined to an introductory warning.

The final does not constitute an implemented library choice or a complete sidecar schema. Those are explicitly future design/check obligations within this bounded proposal, not source-established runtime facts. The source assessment nevertheless covers the complete declared recommendation; this limitation is not an unassessed scientific obligation.

## Axis 6 — proposed versus executed checks

Actually performed by this reviewer: read the map and six declared non-source files; hash-check all eight scientific files; compare final/rewrite bytes and word count; inspect RFC identities and relevant primary sections with their governing dependencies; trace every critique finding and consequential final claim; write this judgment and checks.json. A grouped extraction exceeded the displayed-output allowance; relevant material was reread in visible smaller extracts, so unread truncated output was not treated as evidence.

The final reports source reads, hash verification, and section extraction, and explicitly says its server/library tests were not executed. This reviewer independently reproduced source/hash verification; the allowed scientific files do not independently attest the author's historical tool actions or its reported boundary read. No unsupported claim of executed behavioral tests appears. No live client/server behavior was tested here, and none is inferred.

Native lifecycle, execution receipts, billing, input/cache/generated usage, and budget compliance are outside the supplied scientific record and are not graded. Billing and usage are recorded as unknown/null. The compact check record contains actual operations and timestamps.

