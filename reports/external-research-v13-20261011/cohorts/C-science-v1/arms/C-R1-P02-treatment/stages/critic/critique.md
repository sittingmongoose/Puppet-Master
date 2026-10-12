# Independent critique — C-R1-P02-treatment / critic

## Scope and review method

I reviewed the released brief, the complete investigator discovery and draft, its source-map, the full revealed plan, plan-reveal metadata, and the carried source index named in input-map.json. I independently opened the governing primary references in the source index, including the versioned OTIO model/plugin docs, OTIO issue and merge history, FFmpeg docs/release listing, W3C WebVTT, EBU BWF, BagIt, RO-Crate, Kdenlive, MediaInfo, FATE, and the Matroska suite. I also checked versioned OTIO metadata documentation, the OTIO release list and issue 1980, and the stable RO-Crate 1.2.0 path. The full identity records and locators are in this stage's sources/00-index.md and source-map.json.

I did not inspect recordings, download/run media code, create fixtures, or execute a product check. The investigator's plan-reveal hashes match plan-reveal.json, and the plan was read in full. Source-page reports and proposed tests are not treated as executed behavior. Source C06 is an upstream issue report, not an independently reproduced failure.

Classification uses the assignment's categories. “Material incomplete” means the proposed direction is sound but a condition needed for the brief is not yet explicit. “Unsupported” means a conclusion is stronger than the cited evidence. No finding requires reducing the brief's scope.

## Overall assessment

The investigator package is unusually complete: it addresses every brief behavior, every released-plan clause, a practical alternatives set, manual correction and unsupported states, storage trade-offs, and a proposed synthetic/public test strategy. Its source records identify exact URLs, versions, locators, access batches, observed operations, conditions, and applicability.

I recommend retaining its direction with the corrections below. The largest technical refinement is to distinguish fitting a drift line from validating it. A two-anchor line has no residual at those same two points. OTIO should remain a live architecture option: its native format supports namespaced metadata, while specific adapters and timecode helpers still need versioned regression testing. A read-only in-place reference also needs a clear external-change caveat; it does not provide the same preservation guarantee as a managed copy.

## Findings

### CR-01 — Material incomplete: in-place reference and preservation guarantee

**Draft locator:** Recommendation and “Immutable asset layer”; exact first plan-clause disposition.

**Finding:** The draft says to preserve an original in a managed collection or reference it in place under a read-only policy. These are different guarantees. Application no-write behavior does not prevent an external program or person from changing or deleting an in-place file. Hash-at-import and verify-on-relink/export detect some changes, but the draft does not explicitly state what users can rely on between those points.

**Evidence and condition:** The file digest identifies bytes at the time checked; it cannot make an external path immutable or available. The plan requires original preservation and a path for files to move. This is a product semantics issue, not a finding that the lower-storage option must be removed.

**Final resolution:** Accept the criticism. Recommend a managed one-copy vault for preservation; allow in-place references as an explicitly externally managed mode with digest rechecks and unresolved changed/missing states. See final.md “Originals, assets, and streams.”

### CR-02 — Material incomplete: exact media boundary convention

**Draft locator:** “Separate source and session clocks,” “Timestamps would initially be converted,” and the excerpt coordinate rows.

**Finding:** The draft correctly asks for exact rational source ticks or audio samples, PTS/time base, stream identity, and presentation order. It still leaves the implementation's exact selection rule under-specified: how a requested time becomes a decoded video-frame boundary or audio-sample boundary; which origin applies; what happens with nonzero starts, gaps, duplicate/nonmonotonic timestamps, or discontinuities; and whether packet or decoded presentation observations are the canonical review coordinates.

**Evidence and condition:** ffprobe exposes packet and decoded-frame reports separately and says that interval seeking is inaccurate, so a metadata seek cannot itself define an exact excerpt. The draft's proposed synthetic tests are helpful, but the final model should state the boundary convention before those tests are written. This is an engineering inference from the source behavior and the brief's VFR requirement, not a claim that FFmpeg cannot represent such media. [C01](sources/00-index.md#c01)

**Final resolution:** Accept. Specify decoded presentation-frame identity/time base for video, sample index/rate for audio, half-open ranges, explicit source origins, and separate requested and resolved boundaries. Preserve enough timestamp/discontinuity evidence to reproduce the resolution; mark unsupported or uncertain cases unresolved.

### CR-03 — Material incomplete: two anchors estimate drift but do not validate it

**Draft locator:** “Offset-only vs richer alignment,” especially the minimum of two well-separated anchors and residual threshold.

**Finding:** Two anchors are the mathematical minimum for an affine offset-plus-scale estimate. The line passes through those points exactly, so residuals calculated only from them cannot establish that one stable drift rate describes the recording. The draft does call for residuals and owner thresholds, but does not require independent data for those residuals.

**Evidence and condition:** This is a property of the proposed fit. A stable drift claim must be tested over the recording duration; two anchors can seed a candidate line but cannot validate it by themselves.

**Final resolution:** Accept. Retain two separated anchors as an estimation minimum, then use independent validation anchors across the duration or equally strong external metrology before displaying a synced state. An owner-approved tolerance remains unresolved product input.

### CR-04 — Unsupported as a necessity: app-owned model versus native OTIO metadata

**Draft locator:** Recommendation and “OTIO-centered timeline/interchange.”

**Finding:** The draft's app-owned, versioned model is a plausible leading design, but some wording risks implying that OTIO must be only an interchange format because it cannot retain the needed application semantics. The evidence cited for OTIO time frames and rate bugs does not prove that limitation. OTIO 0.18 docs describe namespaced metadata on schema objects and lossless native .otio serialization for OTIO objects and metadata. Its external format adapters may be lossy, and the cited ALE problem is version- and adapter-specific. [C03](sources/00-index.md#c03) [C06](sources/00-index.md#c06) [C15](sources/00-index.md#c15)

**Final resolution:** Amend. Keep an app-owned schema as the lead recommendation because the full provenance/mapping/revision behavior must be specified and tested. Keep native OTIO plus a versioned namespaced metadata schema as a credible alternative. Decide with a prototype and loss/round-trip tests. The issue history supports pinning and testing versions; it does not support excluding OTIO.

### CR-05 — Material incomplete: portable references need a separate resolver contract

**Draft locator:** Export and digest-only plan dispositions; “Two honest export modes.”

**Finding:** The draft correctly distinguishes link-only from self-contained packages, says the link-only mode cannot restore absent media, and requires digest verification in a receiver-selected directory. The package contract should explicitly identify path safety, collision behavior, and the difference between moving a package root and moving originals independently. A digest match checks candidate bytes; it cannot recreate an absent project manifest or missing media.

**Evidence and condition:** BagIt payload manifests must list included payload files and cannot reference outside the payload. Attached RO-Crate file paths are relative to the crate root and must resolve there; detached file entities are web-based absolute references. OTIOZ's documented bundle expects local references and unique basenames. These limits support two package modes, not an assertion that any one bundle format resolves all external references. [C04](sources/00-index.md#c04) [C09](sources/00-index.md#c09) [C10](sources/00-index.md#c10)

**Final resolution:** Accept. Final specifies a versioned link-only manifest and an attached-media mode, safe normalized relative hints, explicit collisions/ambiguity and missing states, user-selected local search, and separate move tests. It retains a digest as an exact-byte fixity key while limiting the meaning of a successful match.

### CR-06 — Minor wording with material interpretation risk: source playback authority

**Draft locator:** “Preview-centered vs source-based playback,” where source-based playback is called authoritative.

**Finding:** Source decoding is a useful reference for native stream content and boundary checks. It cannot make independent recorder clocks agree, prove that embedded timestamps are correct, or replace the approved source-to-session mapping. The draft makes the right distinction elsewhere, but “authoritative” can blur playback reference and time authority.

**Final resolution:** Accept. Final states that the accepted source-to-session map remains timing authority and source decoding is the content/boundary reference. Derived previews stay noncanonical.

### CR-07 — Minor version/locator refinement: OTIO issue and RO-Crate identity

**Draft locator:** Source-map C06 and C10.

**Finding:** The investigator honestly marks issue 1983 as an unverified report and C10's upstream main URL as having no exact commit. Independent review confirms the report is specific to ALE parsing in OTIO/plugins 0.18.1 and truncated decimal rates; exact fractional input reportedly works. Its duplicate target, issue 1980, is still open with a 0.19.0 milestone; the release page shows the v0.18.1 release and labels Beta 18.1 a pre-release. This context argues for a pinned adapter regression test. It does not establish that OTIO as a whole is unsuitable. The original C10 main URL remains preserved, with a supplementally checked stable 1.2.0 tag URL so the source ID is not silently rebound. [C06](sources/00-index.md#c06) [C16](sources/00-index.md#c16) [C17](sources/00-index.md#c17)

**Final resolution:** Accept. Final includes the version/adapter caveat and the source index preserves both the original C10 URL and the same-version pinned URL.

## Brief obligation coverage

| Brief obligation | Review result |
|---|---|
| Linked inspection, alignment, transcript, and export components | Covered by the model, tool, and package sections. |
| Different starts, VFR, multiple audio streams, uncertain clocks | Covered; CR-02 adds exact source boundary resolution details. |
| Preserve originals and named excerpts without rewriting | Covered; CR-01 distinguishes managed-copy preservation from external in-place reference. |
| Offset/transcript correction effects on excerpts and comments | Covered with mapping revisions, previews, explicit approval, transcript lineage, and orphan review. |
| Portable references after files move and modest storage | Covered with link-only and included-media modes, reusable originals/previews; CR-05 makes resolver/move semantics explicit. |
| Maintained tools, specifications, repository mechanism, fix history, alternatives | FFmpeg, OTIO, Kdenlive, WebVTT, BagIt, RO-Crate, MediaInfo, FATE/Matroska and upstream OTIO history are all considered. |
| Time representation, inspect/decode distinction, preview generation | Covered; CR-02 and CR-06 sharpen boundary and authority language. |
| Reproducibility and visible uncertainty | Covered by exact coordinate records, mapping revisions, anchor provenance, residuals, uncertainty and unresolved states; CR-03 adds independent drift validation. |
| No upload/overwrite/shared-clock assumption/transcript oracle; manual and unsupported paths | Explicitly covered. |
| Synthetic/public fixtures and honest execution status | Covered. No fixture or product checks were represented as run. |

## Released-plan disposition review

The full final proposal has a row for each clause/requirement in revealed-plan.md. The review supports these decisions:

- Refine, rather than reject, the shared content-addressed asset and interview-track direction.
- Reject metadata as common-clock authority and milliseconds as canonical source storage; preserve metadata as candidate input and milliseconds for display/export.
- Accept staged stream inventory before optional previews; distinguish probing from decoding.
- Revise offset/drift to retain anchors, uncertainty, fit revisions, and independent validation.
- Revise excerpt, transcript, and comment records to retain source/session basis and resolved/source ranges.
- Reject automatic mutation of approved records while accepting derived projections and impact previews.
- Keep transcript identifiers conditionally stable with revision lineage and orphan review.
- Accept both export modes, but define a versioned resolver/integrity contract and limit digest claims.
- Keep unsupported, missing, corrupt, and ambiguous states visible.
- Treat all synthetic/public fixture work as proposed; no such checks ran in this research.

## Source and execution caveats

C06 is an issue report and was not reproduced. Its version and adapter scope are preserved. C10 originally pointed to the 1.2 directory under upstream main, with no commit exposed; a tag-pinned 1.2.0 copy was checked and is identified as supplemental context. C11's field page states its descriptions are as known for MediaInfo 23.10. C13 describes FATE as using an external sample suite and notes that some assertions are disabled by default. C14 says its eight-file suite emphasizes Matroska container behavior, not codec coverage. Those conditions remain in the navigable source index.

Documentary research only was executed. No recordings, product software, generated media, public fixture files, or executable witness were accessed or run.
