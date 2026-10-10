# ER12 B-DISC-M-01/control-v1 independent assessment

**Source judgment: FAIL.** Delivery passes, and the bounded discovery is substantially useful. One material source-applicability omission remains: F1. This grades the brief-only discovery role. It does not grade a complete product, qualify a full pipeline, or draw a paired conclusion.

The complete 839-word frozen discovery, candidate source map and evidence note, exact input-map/common assignment/fixture, role wrapper, terminal freeze, and supplied native/dispatch/status artifacts were read. All ten files named by the terminal freeze still match its recorded hashes. That establishes which bytes were reviewed; the semantic judgment comes from independently retrieved primary evidence, not the hashes, citations, or agreement with the candidate.

## F1 — Material missing resource-scope boundary

The candidate’s [sequential variant](ER12_RUNTIME/runs/B-DISC-M-01/control/stages/role/discovery.md:16) obtains a fresh locator before applying its continuation gates. Its [parallel variant](ER12_RUNTIME/runs/B-DISC-M-01/control/stages/role/discovery.md:22) offers a strong ETag or authenticated immutable manifest as the binding for all responses, then discusses mirrors and redirects. The candidate source map does not supply the missing qualifier either.

RFC 9110 §8.8.1 permits equal strong validators for different resources whose representations differ. §15.3.7.3’s combination permission concerns responses on a target resource. Thus equal ETags plus matching length/ranges cannot establish identity across distinct replacement locators or mirrors. This is a known governing condition, not merely unknown service support. [RFC 9110 §§8.8.1 and 15.3.7.3](https://www.rfc-editor.org/rfc/rfc9110.html#section-8.8.1)

An analytical witness illustrates the consequence: resource A contains `AAAAXXXX`; B contains `YYYYBBBB`. Both may legitimately use strong `"v1"` within their own resource and length 8. After saving A’s first four bytes, a request to B with `Range: bytes=4-7` and `If-Range: "v1"` can return valid `206`, `Content-Range: bytes 4-7/8`, and `BBBB`. The listed gates do not distinguish the mixed `AAAABBBB`. This is a source-supported thought experiment, **not an executed server test**.

The omissions affect an identity-change boundary expressly named in the assignment. They do not invalidate same-resource continuation or the authenticated-manifest alternatives. The candidate receives credit for distinguishing locator from identity, denying cryptographic identity to an ETag, acknowledging unknown refreshed-URL support, and proposing a reused-ETag/digest discriminator. Those statements show awareness of risk. They do not state or condition the validator-only alternative on the standard’s known resource scope; a proposed future check does not settle that source condition. No candidate fixes or feedback were sent.

## Exact obligation and coverage assessment

| Obligation | Assessment |
|---|---|
| Brief-only discovery of one artifact’s resume/integrity mechanism | Met. It stays within the declared topic and does not repair an existing design. |
| Four meaningfully different approaches or variants | Met. Sequential continuation, trusted whole-file identity, piece-granular verification, and concurrent scheduling differ in retained state, verification timing or transfer structure. They may be composed; the assignment permits variants. |
| Evidence-backed mechanisms and failure boundaries | Substantial, with material F1 on the ETag-only boundary. |
| Compact mechanism/tradeoff comparison | Met by the four-row table and explanatory paragraphs. |
| Two concrete inspectable implementation leads | Met by the named libcurl API and Go updater symbol/file. These are investigation leads, not production-ready recipes. |
| One historical/version lead | Met by the RFC replacement comparison; libcurl addition versions supply supplementary context. |
| Three discriminating questions/prospective tests | Met: locator/identity change, a response/range/coding matrix, and interrupted finalization. |
| At least three primary sources across two organizations/projects | Met. The frozen map lists six sources across IETF/RFC Editor, TUF, and curl. Their substantive evidence was independently checked. |
| `discovery.md`, 700–1000 words | Met: 839 whitespace-delimited words over the complete file, including headings/table. |
| Source/version/section citations; source versus inference | Met with minor Go locator limitation L1 and honest mutable-version limitation L2. Proposed client policies are distinguishable from protocol statements. |
| Unknowns and bounded next investigation | Met. Service support, crash durability and exact mutable commits remain open; the proposed local fixture comparison is bounded. |
| Pause/restart; 50 MB–2 GB context | Met at discovery scope through persisted continuation state and the large-offset/memory leads. No throughput or large-object run is claimed. |
| Signed URLs, replacement under the same name, range support | Covered, with material F1 affecting the locator transition. The original test suggestions deserve credit but are prospective. |
| Partial bytes never exposed as complete; understandable integrity failure | Preserved as private staging, a verification gate, late failure/retry discussion and a publication oracle. UI design is excluded; no additional error-copy specification is demanded. No implementation guarantee is awarded. |
| Interrupted finalization | Covered as an explicit unknown and a meaningful crash-point/durability test. A finished filesystem design was not assigned. |
| Fewer bytes do not prove integrity | Met. The candidate distinguishes offset/range efficiency from verification and metadata trust. |
| No full specification, automatic winner or pipeline success | Met. The next investigation compares alternatives without selecting a winner or claiming deployed success. |
| Failures, page cap and action isolation | Six pages/no failures are reported; exact retrieval/action audit remains UNKNOWN. See protocol below. |

The applicable rubric axes are original obligations, consequential source applicability, useful unfamiliar discovery, and proposed versus executed validation. Source applicability fails on F1. Formal scope/output coverage and useful discovery otherwise pass at this bounded role. Wrong plan corrections, critique dispositions, draft-to-final preservation and numbered verification claims are **not applicable**: no such input or role was assigned. `assessment.json` records every obligation and groups all substantive submitted claims as C01–C17, including the supplementary source-map-only curl lead.

## Independent primary-evidence inspection

HTTP inspection confirms the submitted single-resource Range/If-Range mechanism, response/coding cautions and history lead, subject to F1. A client’s conservative discard/restart policy is an inference rather than an RFC requirement. [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html#section-13.1.5)

TUF v1.0.36 supports target length/hashes, verification before application access, and consistent-snapshot target naming. The candidate correctly treats it as trusted identity/verification rather than a resumable-transfer or crash-promotion specification. Its late-corruption discussion is a whole-file-only error-localization tradeoff, not proof that every conceivable recovery method must retransmit everything. [TUF §§2, 4.5, 5.7, 6.2](https://theupdateframework.github.io/specification/v1.0.36/)

Metalink supports the piece-map mechanism, remainder handling and multiple-location precedent; its signature and hash conditions make the candidate’s separate manifest-trust caveat useful. Actual target-service adoption is not claimed. [RFC 5854 §§4.1.3, 4.2.4, 4.2.16, 7.1, 7.4](https://www.rfc-editor.org/rfc/rfc5854.html#section-4.1.3)

The libcurl API/type and addition-version lead checks out; the reviewer also inspected the HTTP resume/range-handling code. That code inspection is additional reviewer evidence, not discovery credited to the candidate or an executed validation. The legacy option’s source-map-only version context also matches the retrieved documentation. [Large-offset API](https://curl.se/libcurl/c/CURLOPT_RESUME_FROM_LARGE.html), [HTTP implementation](https://github.com/curl/curl/blob/master/lib/http.c#L2745), [legacy option documentation](https://github.com/curl/curl/blob/master/docs/libcurl/opts/CURLOPT_RESUME_FROM.md)

The retrieved Go updater orders download, verification and conditional cache persistence as described. The reviewer inspected the verification body, not just its name: it rejects missing target hashes and performs hash/length checks. The byte-slice/write-path caveat is useful for this artifact-size range; no streaming or durability claim is credited. [Updater.DownloadTarget](https://github.com/theupdateframework/go-tuf/blob/master/metadata/updater/updater.go#L214), [TargetFiles.VerifyLengthHashes](https://github.com/theupdateframework/go-tuf/blob/master/metadata/metadata.go#L486)

Eight independently retrieved primary resources are retained under `sources/`. `source-map.json` contains navigable URLs/sections, exact capture paths plus SHA-256, versions, retrieval UTC/operation, applicability, and claim/finding joins. No downloaded implementation was executed. Mutable branch captures do not retroactively establish what commit the candidate saw.

## Nonmaterial limitations and unknowns

L1: The Go positions “2045–2138” are browser text positions, not repository code lines. The independently retrieved source has 740 lines and `DownloadTarget` begins at line 214. The named symbol/path remains inspectable; this is a locator issue, not a fabricated implementation. L2: The candidate openly leaves exact mutable implementation commits UNKNOWN. The review retains that uncertainty. L3: Integrity failure is addressed at mechanism level rather than by user-facing text; additional UI design is outside this role.

Origin-specific range behavior, signed-URL mapping, mirror identity, staging-state durability, filesystem crash behavior, streaming memory use and performance remain unvalidated. The candidate does not claim otherwise. Per-page candidate retrieval timestamps, comprehensive action telemetry, backend native provenance beyond the supplied receipt, and exact investigation/writing occupancy are UNKNOWN. None is silently converted into a semantic pass, protocol failure, executed test, cost or speed result.

## Proposed versus executed validation

The three candidate discriminators are concrete and relevant: the first probes identity substitution, the second probes append/restart boundaries, and the third probes publication/crash points with separate file/directory durability. Their oracles are useful requirements for a later fixture. The bounded next investigation is sensible as research. **No candidate behavioral check was executed**, explicitly acknowledged at line 37. The reviewer executed source retrieval/inspection, file/count/hash checks and report validation only. F1’s witness remains analytical.

## Delivery, native Goal, protocol and time — separate records

**Delivery: PASS.** Complete science and source records are present, unchanged against the terminal freeze; T3 is recorded completed with no pending child runs. This is delivery evidence, not source correctness.

**Native:** The supplied receipt records active then complete for candidate thread `01a123f3-1a90-7ee3-a3e8-85fe4a669122`, with the required objective, 550 reported native seconds and 101,462 reported tokens. Its activation is 03:55:24 UTC and completion 04:04:34 UTC. Frozen mtimes put the discovery at 04:03:41.687845 and source map/evidence at about 04:04:12.85, before completion. These observations support the saved-before-completion sequence. Backend attestation, exhaustive absence of additional Goals and other provenance are UNKNOWN. Native token fields are not billing evidence. The reviewer created a separate actual native Goal and saves this full review while it remains active.

**Protocol:** Permitted artifacts are consistent with the stated role policy. No unauthorized assistance is observed; the complete action audit is UNKNOWN. Six source pages are self-reported within the eight-page cap, and each original substantive primary resource was independently checked. There was no reviewer delegation, candidate repair/feedback, cross-arm/history/evaluation read, or account/Git/GitHub/canon/main/WorkNodes change. The supplied AGENTS first-read rule caused an incidental repository-index read; its truncated unrelated content was not assessment evidence. All review writes are confined to this assessment directory.

**Time:** The original fixed deadline was 04:09:50.548172 UTC, starting from request at 03:54:50.548172. Request-to-native-completion is 583.451828 seconds. T3 was terminal by freeze at 04:06:19.993393, an upper bound of 689.445221 seconds from request, within 900 seconds. The reported retrieval window is 03:55:15–03:59:58, consistent with the investigation allowance and early writing. Exact phase allocation and actual T3 terminal instant remain UNKNOWN. Reviewer Goal activation was 04:07:28 UTC; the review is saved within its 25-minute allowance and finishes early. No paired latency, savings, replication or whole-product conclusion is made.

This original assessment is retained as v1; later dispute disposition must be separate. No candidate output or frozen input was edited.
