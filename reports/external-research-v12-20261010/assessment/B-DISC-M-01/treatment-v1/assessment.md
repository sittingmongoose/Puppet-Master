# Independent ER12 assessment: B-DISC-M-01 treatment-v1

**Source judgment: FAIL.** The completed brief-only discovery was delivered and contains useful Range, piece-hash and immutable-identity ideas. Two material source/applicability gaps remain: the fourth item does not establish a durable download-resume mechanism, and the baseline omits a governing date-validator restriction. Under RUBRIC-v1, these cannot be converted into PASS_WITH_LIMITATIONS merely because the candidate expresses caution. This is a role judgment, not full-pipeline qualification, a comparison with control or an early win claim.

## Exact scope and inspected artifacts

I read the complete frozen original assignment and fixture, the complete `discovery.md`, candidate `source-map.json`, all five files in `sources/`, and `terminal-science-freeze.json`, plus RUBRIC-v1. `assessment.json` and this review's `source-map.json` list their absolute paths, byte sizes and SHA-256 values. All seven candidate science files listed in the terminal freeze (discovery, source map and five summaries) match their frozen hashes. Hash agreement establishes which bytes were assessed, not correctness.

The original brief has no existing design to repair. It concerns one 50 MB–2 GB desktop artifact under unreliable connections, pause/restart, redirecting short-lived URLs and same-name replacement, with no partial artifact exposed as complete and an understandable integrity failure. Required delivery is 700–1000 words, four meaningfully different evidence-backed approaches/variants, a comparison, two inspectable implementation leads, one history/version lead, three discriminating questions/tests, at least three primary sources across two projects/organizations, unknowns and a bounded next investigation. Account authentication, storage pricing, UI design and a full transfer system are outside this role.

The candidate is 888 whitespace-separated words including Sources, 803 before that heading. The table, four labels, two lead entries, history entry, three probes and next step are present. Five source URLs span IETF, curl and tus. No automatic winner or finished product specification is claimed. Four labels and five citations do not, by themselves, fulfill four useful applicable mechanisms.

I independently retrieved 13 primary pages and read the governing sections. The five cited pages were fetched anew; extra project documentation corroborates the implementation claims, earlier RFCs check history, and platform references bound the finalization inference. Complete response bytes and normalized text are retained in `primary-evidence/`, with retrieval timestamps and hashes in the source map. The review did not open the arm's runtime transcript, other candidates, campaign results/history, repository canon or accounts; it performed no candidate repair, downloaded-code execution, installation, delegation or repository/GitHub change. This review's evidence retrieval count is distinct from the candidate's eight-page limit.

## Material findings

### F1 — D does not substantiate a fourth applicable download mechanism

Candidate `discovery.md` lines 16–17 and comparison line 26 present server-owned progress plus chunk checksums as a download alternative. The warning that tus is for uploads is accurate; the inference still lacks the invariant that makes resume safe after a desktop restart.

[Tus 1.0.0 Core Protocol](https://tus.io/protocols/resumable-upload#core-protocol) defines progress at the upload receiver. Its [Checksum extension](https://tus.io/protocols/resumable-upload#checksum) verifies incoming PATCH bodies there; the [official explanation](https://tus.io/faq#how-does-tus-work) gives the same direction. These are independently read evidence E05/E13, not conclusions drawn from a title.

For a download, the source server can have sent more bytes than the desktop has durably saved. An illustrative restart with 70 MB sent but 60 MB durable would skip missing local bytes if it trusted the server's sent cursor. This is an analytical counterexample, **not an executed experiment**. Neither the candidate mechanism nor its proposed questions examine receiver acknowledgment/persistence or establish what that purported server-known download offset means. The upload checksum extension also does not supply desktop download verification semantics.

This is material because one of the four required useful, meaningfully different approaches remains an uninvestigated direction reversal at the central pause/restart boundary. Calling it the weakest fit and requiring origin buy-in honestly marks uncertainty, but does not fill the mechanism gap. The review does not require an already-deployed custom server or assert that a suitable download-session design is impossible. It judges the missing necessary investigation within this bounded discovery.

### F2 — A omits a consequential HTTP-date If-Range prerequisite

At line 8, A persists ETag and Last-Modified and proposes using the stored validator in If-Range. It correctly identifies weak ETag as a boundary. It never carries the independently governing date condition into the mechanism, failure boundaries or probes.

[RFC 9110 §13.1.5](https://www.rfc-editor.org/rfc/rfc9110.html#section-13.1.5), read together with [§8.8.2.2](https://www.rfc-editor.org/rfc/rfc9110.html#section-8.8.2.2), restricts date-valued If-Range to the absence of an entity tag and a date that qualifies as strong. Stored Last-Modified availability/equality alone is insufficient. Evidence E01 contains the actual requirements.

The missing applicability exception matters for conditional continuation under replacement; it is more than a locator or wording issue. The proposed whole-file manifest gate can still prevent promotion of mixed bytes. That later integrity gate does not validate the stated conditional operation or erase the omitted resume boundary. No corrupt completed artifact was observed, and this finding does not demand a finished product specification.

## Mechanism diversity, tradeoffs and opportunity coverage

**A: useful prefix-resume baseline, with F2.** Durable partial state, conditional byte retrieval and pre-publication whole-file verification are useful primitives. The draft distinguishes transfer efficiency from integrity and recognizes ignored Range/full responses, changed validators and expiration. A matching 206 must mean interpreted range metadata, not status alone; advertised range support is advisory, and an offset already at the end needs separate interpretation. These are unresolved implementation conditions, not separately alleged observed failures.

**B: substantively useful different recovery granularity.** Metalink gives a concrete manifest mechanism for mirrors, whole-file and piece hashes. The candidate's selective re-fetch of bad pieces is meaningful relative to a single prefix and whole-file retry. Piece geometry, stale mirrors and journal-before-flush are useful boundaries. [RFC 5854 §4.1.3](https://www.rfc-editor.org/rfc/rfc5854.html#section-4.1.3) and [§4.2.4](https://www.rfc-editor.org/rfc/rfc5854.html#section-4.2.4) substantiate the ingredients. Piece hashes are optional metadata, so the proposal is conditional on a suitable manifest. Its extra whole-file gate is client policy rather than a guarantee supplied by the format.

**C: useful identity variant, conditional on a metadata contract.** Treating the human name as a pointer while retaining immutable artifact identity independently of an expiring URL addresses an important failure class. It can compose with A/B; the assignment allows variants, so this overlap is not a diversity failure. The manifest/digest sources support the ingredients; the name-to-tuple/fresh-URL handshake is honestly marked inference and its endpoint remains unknown. A version identifier is not itself a cryptographic digest. No real service's immutability or hash API has been demonstrated.

**D: analogy and state-ownership question, materially incomplete.** Expiration and optional checksum support are relevant to tus uploads, but the candidate has not turned those facts into the assigned download mechanism. F1 limits the fourth item's usefulness rather than cancelling the supported discoveries in A–C.

The table meaningfully compares recovery signal, integrity signal, URL renewal, replacement and cost. Costs are qualitative, not measured. “B pays off only” is more restrictive than the source evidence, and “C alone makes replacement explicit” conflicts with the table's A/B replacement responses. These are nonmaterial comparison limitations: no automatic selection is made, and the mechanisms remain distinguishable.

The brief's principal topics—ignored Range, changed identity, fresh transport URLs, piece repair and interrupted promotion—are covered. The substantive missed obligations are F1/F2. Integrity-failure handling is represented as a post-download mismatch boundary and an understandable-message question, not an executed result or finished UI. Exact wording and platform guarantees may honestly remain open in this role; the review does not invent a requirement for a deployed service or polished UI.

## Implementation and history leads

The **curl/libcurl lead is real and inspectable**: the candidate names an upstream option document and resume logic. [CURLOPT_RESUME_FROM](https://curl.se/libcurl/c/CURLOPT_RESUME_FROM.html), its [LARGE counterpart](https://curl.se/libcurl/c/CURLOPT_RESUME_FROM_LARGE.html) and the [curl CLI manual](https://curl.se/docs/manpage.html#--continue-at) independently corroborate the offset and CLI claims. The API type/unit/default distinctions are recorded in condition C07. The retrieved CLI page declares curl 8.23.0; this is a page version, not an installed/tested client. The candidate did not pin an upstream revision or report code inspection. The option documents establish byte continuation, not an automatic identity or publication gate.

The **aria2 lead is also substantive**. The [official aria2 1.37.0 manual](https://aria2.github.io/manual/en/html/aria2c.html#description) corroborates multi-source transfers, Metalink chunks and repair behavior. Its [integrity option](https://aria2.github.io/manual/en/html/aria2c.html#cmdoption-check-integrity) and [realtime chunk option](https://aria2.github.io/manual/en/html/aria2c.html#cmdoption-realtime-chunk-checksum) show why a lead must not be assumed to implement the proposed dual gate by default: realtime chunk checks default on, general check-integrity defaults off, and piece hashes take precedence when both hash forms exist. No code execution or source-tree inspection is credited. The parser/piece-picker pointer is useful, though less precise than the curl file locator.

The **history/version lead is present and useful**. RFC 9110 supersedes RFC 7233; RFC 9530 supersedes RFC 3230 and its old fields. Comparing [RFC 7233 §3.2 and Appendix B](https://www.rfc-editor.org/rfc/rfc7233.html#section-3.2) with [RFC 2616 §14.27](https://www.rfc-editor.org/rfc/rfc2616.html#section-14.27) supports revisiting legacy examples. “Hardened along the way” is imprecise: exact-match wording predates 9110, while 9110's [Appendix B.4](https://www.rfc-editor.org/rfc/rfc9110.html#appendix-B.4) describes a relaxation of a Last-Modified age rule. This precision issue does not erase the required history lead.

## Conditions, validation and oracle applicability

Conditions C01–C10 in the JSON outputs cover each consequential subject: validator legality and scope, range interpretation, URL re-resolution, digest subject and optional support, manifest geometry/trust, aria2 option behavior, curl type/unit/version/operation, tus transfer direction, finalization and historical rules. A cited standard does not show that the actual origin supports it. Digest preferences may be ignored; representation coding must match the bytes being verified. The candidate proposes a manifest whole-file gate, so this review does **not** reinterpret a partial-response Content-Digest as its final-artifact oracle. See [RFC 9530 §§2–4](https://www.rfc-editor.org/rfc/rfc9530.html#section-2).

The finalization composition is reasonably bounded as a proposal. [POSIX rename](https://pubs.opengroup.org/onlinepubs/9799919799/functions/rename.html) gives conditional namespace atomicity and cross-filesystem failure boundaries. [Linux fsync](https://man7.org/linux/man-pages/man2/fsync.2.html#DESCRIPTION) distinguishes file synchronization from directory-entry persistence. These do not demonstrate all desktop platforms or power-loss recovery. The candidate itself leaves atomic-rename guarantees unknown. Its kill-at-finalization probe can test application-visible state, but application termination is not automatically a power-loss oracle.

The three required prospective checks are present and have discriminating observables:

1. **Range fidelity:** metadata plus initial and stale-validator requests can separate ignored Range from valid conditional continuation. Advice headers alone cannot prove future behavior.
2. **Replacement:** a half-complete file and changed server bytes can expose append/restart behavior and the user explanation. Correct A may also restart; the proposed comparison explicitly says naive A.
3. **Finalization:** kills around receipt, verification and rename can expose premature completion and unstable recovery, subject to the storage/oracle limit above.

The proposed next matrix is bounded and sensible for follow-on discovery. It does not directly test piece repair versus whole-file retransmission, D's receiver-durable cursor, or deliberately injected corruption. These are coverage limitations; the D gap already appears as material F1. Nothing in the inspected science records an actual origin request matrix, successful resumed transfer, corruption check or crash run. The candidate reports document retrieval; its small source summaries are observed. Actual runtime retrieval count and code-tree inspection are unknown. Prospective checks receive credit as proposals, not as executed validation.

## Separate delivery, native, protocol and time judgments

| Dimension | Judgment | Evidence and limit |
|---|---|---|
| Source semantics | **FAIL** | Material F1/F2; useful A–C discoveries retained |
| Applicable discovery-axis coverage | **PARTIAL** | All required slots assessed; fourth mechanism and date boundary remain substantive gaps |
| Delivery | **DELIVERED** | Complete frozen artifacts present; word band met |
| Candidate native Goal | **UNKNOWN** | Activation/progress/completion/budget observations are null |
| Candidate method protocol | **UNKNOWN** | Scope of authored output observed; runtime negative constraints/page cap not independently audited |
| Candidate time/occupancy | **UNKNOWN** | Freeze, mtime and self-reported anchors are distinct; actual start/elapsed/investigation/writing values are null |
| Full pipeline / control comparison | **Not qualified / unassessed** | This is one brief-discovery arm only |

The freeze reports `T3_terminal=completed` and `hasPendingChildRuns=false` at 2026-10-10T04:00:05.730529+00:00. That is T3 terminal evidence, not a native Goal receipt. Candidate native telemetry remains null. This reviewer created a separate real native Goal referring to this exact assignment before reading the substantive input, and saves these complete judgments before completing it.

The candidate source map asserts compliance with negative constraints and five successful plus one failed public fetch. The failed everything.curl.dev fetch is self-reported as 404, not independently observed at candidate time. Without the runtime log, there is no basis to assert a complete protocol PASS or an unauthorized-assistance violation. The independent source diagnostic remains unchanged by those unknowns.

The candidate fixture permits 900 seconds total, at most 600 investigation and a 300-second writing reserve. Its source map reports a 03:55:44 investigation anchor, 03:57:27 first-draft word-count anchor and 04:09:50.548172 deadline. These are retained as reported anchors, not measured occupancy. No launch/completion duration, investigation compliance, inference savings or billing savings is inferred. No other arm was inspected, and no paired latency or comparative success is claimed.

## Preservation and deliverables

The complete original judgment is saved as `assessment.md`, `assessment.json` and `source-map.json` in `assessment/B-DISC-M-01/treatment-v1`. Exact independent primary evidence is retained because it is part of the review result. Any later dispute disposition must be a separate record. No frozen candidate science was modified, and no feedback or repair was delivered to the candidate.
