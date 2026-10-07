# Independent declared-source review — I-ANCHOR-LUNA control

**Result: FULL_REVIEW_WITH_MATERIAL_COMPLETENESS_DEFECT.** This is a completed source review, not a `FAILED_SCREEN` or a partial screen promoted to a full grade. Full positive: **no**. All original integrated research obligations were assessed; there is no unassessed remainder within the declared source-review scope. The frozen candidate was not changed.

| Dimension | Judgment |
|---|---|
| source_correctness | LARGELY_SUPPORTED_WITH_QUALIFICATIONS — Core factual mechanisms, pin identities and Pouch regression/fix path check out. Couch secondary finding lacks available source history (MD01); minor precision/provenance issues m01–m04 are retained. No unsupported exactly-once, automatic-safe-merge, private-row-read, browser-durability or immediate-erasure guarantee is credited. |
| completeness | INCOMPLETE_MATERIAL_SOURCE_HISTORY — All original obligations were reviewed and appear in the artifact, but #5422's available fix/test/release/pinned-code evidence is absent from its disposition. Topic presence is not full source completion. O04/O09/O16 are partial. |
| planning_usefulness | USEFUL_WITH_MATERIAL_CAVEAT — Conditional device gate, event/receipt/history architecture, privacy/erasure controls, alternative dispositions, eleven product questions and eight observable test groups are useful. #5422 requires a corrected source-history assessment to interpret transport/storage benchmarks; no rewritten candidate is supplied. |
| breadth | BROAD_FOR_BOUNDED_PLANNING_TASK — Revision replication, custom relational append/outbox, CRDT and field-form workflow are materially distinct. Coverage spans offline lifecycle, conflict semantics, delivery order/identity, attribution/review, photos, privacy, erasure/retention and restoration. Alternatives are shallower than pinned Pouch implementation, which is acceptable for this brief. Overlapping citations are not counted as discoveries. |

## Scope and method

I read the exact INPUTS.md, the named brief and frozen plan, the own-arm final, full supplied critique and dispositions, source registers/manifests and permitted source evidence. Applicable instruction files were actually read: `/home/sittingmongoose/.codex/AGENTS.md` and the current worktree’s `AGENTS.md`; ancestor instruction checks found no additional applicable file on the review path. File identity receipts are under `sources/`. The user’s explicit input/output whitelist overrides the repository’s general Plans-index reading recipe for this external experiment review. I did not open canon or run repository governance/landing work. T3’s rules supersede the old mailbox/extra-worker sections. No nested delegation or skill workflow was used.

Primary-source checking used direct read-only public GETs, numbered raw or extracted-text inspection, issue/PR/API records, immutable code/test inspection, tag dereferencing and commit comparison. Web primary-source opens supplemented direct retrieval for the official Pouch, Automerge, ODK and PostgreSQL guides. The source register records actual assessed ranges. Manifest/excerpt existence, matching hashes and citation counts establish neither substantive correctness nor completeness. All retained supplied F01–F14 excerpt hashes matched; their primary response hashes also matched independent retrievals. The important locator dispute was resolved by actual raw content.

The grade concerns planning research and source grounding. It does not certify implementation, production security, storage durability, physical erasure, deployment, actual affordability or target-device behavior. Candidate native execution receipts/counters were excluded by the input policy. Statements about no candidate execution are evaluated as artifact/evidence distinctions, not independently audited negative action guarantees. The original researcher draft was outside this review’s allowed file map; the supplied dispositions’ claim about its pre-existing coverage is preserved as an attributed predecessor assertion, not independently certified. Requested reviewer configuration was codex_gmail / gpt-6.1-sol / xhigh / priority. Injected runtime confirms Codex, gpt-6.1-sol and xhigh; I did not inspect account-alias or service-tier receipts and made no provider/account changes.

## Material defect MD01: missing CouchDB attachment fix history

Location: final.md lines 19, 43, 75 and 97; critique-dispositions.md lines 14 and 22; inherited source-map S15/C08 descriptions. The exact final line 75 claim is:

> CouchDB issue #5422 is closed and reports target growth from about 1 MB to 2 MB after a small revision with a 1 MB attachment on CouchDB 3.4.2. It does not establish whether 3.5.2 is affected or fixed. Benchmark the pinned server; do not infer either result.

The original 3.4.2 reproducer alone indeed does not demonstrate target-runtime behavior. The problem is the full source investigation and disposition: the declared issue’s discussion explicitly identifies fixes and tests, and source-level inclusion in the selected version is available. The inherited “no linked PR/branch” sidebar observation misses those explicit discussion links.

- The [first maintainer response](https://github.com/apache/couchdb/issues/5422#issuecomment-2641805547) identifies attachment-size/compaction fix #5347. The [later diagnosis](https://github.com/apache/couchdb/issues/5422#issuecomment-2667491504) identifies missing `atts_since` propagation and PR #5437; the [closure comment](https://github.com/apache/couchdb/issues/5422#issuecomment-2675161303) says that PR merged. Independently inspected comment bodies are R26.
- [PR #5437](https://github.com/apache/couchdb/pull/5437) describes how `open_revs` GETs failed to propagate `atts_since` to the cluster layer, causing attachment bodies to be fetched again on unchanged-photo document updates. It merged 2025-02-21 as `f1799d6d0c8baeea612dd17e430038495476a143` (R34). R35 includes the actual changed code, EUnit `t_mp_atts_since` coverage and Elixir assertions that known attachments become stubs and only newly needed bytes appear.
- [The 3.4.3 release notes at the pinned Couch commit](https://github.com/apache/couchdb/blob/5b4d92103e5088d0e23794ddb9c09a6b683f985d/src/docs/src/whatsnew/3.4.rst#L23-L38) list #5347 and #5437 (R37 raw 23–38). [Pinned 3.5.2 code](https://github.com/apache/couchdb/blob/5b4d92103e5088d0e23794ddb9c09a6b683f985d/src/chttpd/src/chttpd_db.erl#L980-L1030) carries `atts_since` through `Options2` to `fabric:open_revs` and output (R40). [Pinned test code](https://github.com/apache/couchdb/blob/5b4d92103e5088d0e23794ddb9c09a6b683f985d/src/chttpd/test/eunit/chttpd_db_doc_get_tests.erl#L442-L464) checks one old attachment as a stub, the new attachment as `follows`, and only the new attachment bytes (R41).
- [Commit comparison](https://github.com/apache/couchdb/compare/f1799d6d0c8baeea612dd17e430038495476a143...5b4d92103e5088d0e23794ddb9c09a6b683f985d) establishes the selected commit is ahead, with no commits behind and a merge base equal to the fix’s merge commit (R43). This independently confirms ancestry rather than assuming it from version-number ordering.

Impact: the final leaves a consequential declared-source discovery as a generic unresolved storage risk. It misses the attachment-transfer mechanism, regression coverage and available release applicability, weakening interpretation of the proposed benchmark. O04, O09 and O16 are partial. This does not invalidate the conditional prototype, erase the correct Pouch history, or justify a claim that all 3.5.2 workloads are safe. The benchmark remains useful; fix/test inclusion is source evidence, not an executed benchmark. No test was run by this reviewer.

## Per-obligation evidence assessment

### O01 — Choose and inspect genuine primary public sources from the user brief

**SUPPORTED**. Final lines 7–20, 47–75. Checked primary evidence: R01, R02, R03, R04, R05, R06, R07, R08, R09, R10, R20, R21, R22, R23, R24, R25.

Official project documentation, immutable project source, issue/PR records and regression source are genuine primary material. Selection connects offline transport, field capture, concurrency, permissions, storage and replay to the stated crew/supervisor problem. Independently fetched and read substantive source content; file existence and citation volume were not used as proof.

Current guides are retrieval-pinned, not version-certified. Repeated S/C/F identities are overlapping evidence, not independent breadth.

### O02 — Compare at least two substantially different mechanisms and explain important alternatives

**SUPPORTED**. Final lines 7–11, 20, 47–54. Checked primary evidence: R01, R02, R20, R21, R22, R23, R24, R25, R31.

Revision-tree replication, a custom SQLite/PostgreSQL append API, and CRDT merging are substantially different mechanisms; ODK contributes a separate field workflow analogue. The final explains capability, limitation and disposition for each.

Only Pouch/Couch implementation behavior is deeply pinned. Alternatives are planning comparisons, not deployed or certified stacks.

### O03 — Investigate actual component/code behavior at a pinned version

**SUPPORTED_WITH_QUALIFICATION**. Final lines 7, 19, 69–73. Checked primary evidence: R07, R08, R12, R13, R16, R17, R18, R42.

Pouch 9.0.0 tag resolves to the asserted commit. The exact indexeddb plugin defines revHasAttachment at raw 3922–3928 and guards the digest/revision reference at 4116–4118. The inspected fix diff changes precisely that path. Couch 3.5.2 tag/commit identity is also correct.

The inspected distribution is an indexeddb adapter plugin requiring PouchDB; the general guide shows default adapter name idb. Gate the actual loaded adapter/build. This guard is not universal IndexedDB or whole-pair certification.

### O04 — Trace a pertinent issue, fix and regression test through release applicability or justify equivalent implementation history

**PARTIALLY_SUPPORTED**. Final lines 19, 67–75, 96–97. Checked primary evidence: R07, R08, R09, R10, R11, R12, R13, R14, R16, R19, R26, R34, R35, R37, R40, R41, R43.

The required Pouch #8456 → #8460 → separate test/fix commits → exact 9.0.0 guard trail is real and well bounded. The raw test locator 3899–3967 is correct; 8.0.0 body does not list #8460. However, the consequential second attachment finding, Couch #5422, omits linked fixes/tests and available pinned release applicability (MD01).

No regression was executed. Pouch test fixture is text, not a photo. Couch source inclusion does not prove target runtime/workload success.

### O05 — Cover conflict handling without inventing guarantees

**SUPPORTED**. Final lines 9, 15–17, 26–30, 37, 53, 94. Checked primary evidence: R02, R22.

Couch retains divergent leaves while ordinary reads/views select a winner; all-leaf retrieval and explicit application resolution are necessary. Automerge exposes same-property alternatives and deterministic convergence does not settle water-utility status. Proposed event IDs, causal links and attributed review distinguish domain conflicts from revision conflicts.

Same-node stale-revision writes can return 409; replicated branches can coexist. Appending a review event alone does not mechanically prune Couch leaves; the proposal does not claim otherwise.

### O06 — Cover duplicate and reordered delivery without inventing guarantees

**SUPPORTED_AS_PROPOSAL**. Final lines 26–29, 34–36, 95. Checked primary evidence: R01, R21, R24, R25.

Persisted operation identity, canonical hashes, same-ID mismatch quarantine, concurrent retry/worker-crash recovery, and child-before-parent pending state are explicit proposed rules. Transport checkpoint/retry is separated from application receipt and no exactly-once guarantee is claimed. PostgreSQL unique constraints/transactions can support a custom implementation.

Canonicalization, receipt uniqueness and reconciliation remain application contracts to implement and validate. Arrival sequence is not cross-device causality; UPSERT alone must not overwrite mismatched content.

### O07 — Cover retention and deletion without inventing guarantees

**SUPPORTED_AS_PROPOSAL**. Final lines 17, 41–45, 85, 97, 99. Checked primary evidence: R01, R02, R05, R06, R21.

Compaction is not archival history or secure erasure; backup/disconnected replicas and retained revisions are acknowledged. Separate photo records, authenticated deletion events, deny-reupload records, backup expiry/holds and stale-device tests address both physical copies and resurrection.

Tombstones do not prove byte erasure. Filtered deletion can retain fields/attachments; future implementation must prove its actual mechanism. No guarantee of immediate disconnected revocation or erasure is given.

### O08 — Cover access control without inventing guarantees

**SUPPORTED_AS_PROPOSAL**. Final lines 18, 35–36, 44, 83–84, 98. Checked primary evidence: R03, R04.

Database membership grants broad ordinary-document access; update validation can reject writes with user/security context but is not row-read filtering. Separate scope databases/private receipt storage, identity binding and replicated-write context tests match those limits.

Write validation and a gateway are proposed controls, not installed security. Source membership statement needs raw 525–530, not F02’s 589–592 excerpt. Origin, signing, encryption, staff handoff and disconnected revocation remain gates.

### O09 — Cover attachment behavior without inventing guarantees

**PARTIALLY_SUPPORTED**. Final lines 19, 26–28, 41–43, 71–75, 86, 95–97. Checked primary evidence: R05, R06, R07, R08, R19, R26, R34, R35, R37, R40, R41.

Stable photo IDs/manifests, server byte hashes, whole-file-versus-resumable-upload choice, revision-bound attachment operations and Range-read limitation are correctly treated. The Pouch bug path is bounded. The Couch amplification lead is incompletely investigated/dispositioned (MD01).

Range reads do not establish resumable uploads. Source-level fixes already present in 3.5.2 do not eliminate the need for photo workload, compaction or upgrade tests.

### O10 — Provide observable tests

**SUPPORTED_AS_PROPOSAL**. Final lines 91–100. Checked primary evidence: R02, R05, R06, R07, R08, R20, R21, R24, R25.

All eight test groups have concrete stimuli and observable assertions: storage/restart; concurrent status/history; duplicate/reorder/worker faults; exact-pair regression; amplification/deletion; identity/permissions; history/erasure; operations/restore. Assertions target meaningful outcomes rather than citation or artifact counts.

No executable tests or measured results are supplied or required by this planning assignment. Device/storage matrix, byte hashing, lifecycle and domain rules must be concretized before implementation validation.

### O11 — Compare all relevant discoveries against frozen plan choices

**SUPPORTED_WITH_QUALIFICATION**. Final lines 9–11, 15–20, 56–65. Checked primary evidence: R01, R02, R03, R04, R05, R06, R20, R21, R22, R23, R24.

The six-row crosswalk covers mutable records, timestamp arbitration, portable photo identity, retry transport, supervisor/CSV view and all unspecified controls. Discoveries map to changes or optional leads.

The frozen plan says each inspection is mutable; it does not specify one inspection per asset (m01). Couch #5422’s available fix history is not compared/dispositioned (MD01).

### O12 — Address several offline days and unreliable mobile links

**SUPPORTED_AS_PROPOSAL**. Final lines 7, 11, 26, 34, 43, 79–80, 93, 95. Checked primary evidence: R01, R20, R21, R23.

Conditional installable web app and native SQLite alternative, durable local draft/identity, foreground retry, storage workload formula and prolonged-offline/restart gate address the problem.

Browser eviction/background lifecycle and quota are not guaranteed. Supported devices and numerical workload are appropriately open product inputs.

### O13 — Investigate useful analogous systems beyond direct competitors

**SUPPORTED**. Final lines 20, 53–54. Checked primary evidence: R22, R23, R28.

ODK supplies draft/finalized/sent workflow states and supervisor capture patterns; Automerge supplies independent-edit convergence with exposed same-property alternatives. They are framed as optional opportunities with distinct limits.

The ODK form-state guide alone is not proof of shared-asset collaborative editing; Central can be self-hosted, with infrastructure/maintenance costs. No obligation to implement either optional lead.

### O14 — Provide supervisor web review and reliable attribution/conflict history

**SUPPORTED_AS_PROPOSAL**. Final lines 9, 15–18, 26, 30, 34–37, 44–45, 64, 89, 94, 98–100. Checked primary evidence: R02, R03, R04, R23.

Projection plus retained attributed events/resolutions, explicit pending conflicts, receipt states and a supervisor API address review/history. Client author/time is explicitly untrusted absent authenticated origin.

This is a proposed view/API, not a built UI. Permission-enforced history is distinct from tamper evidence against server administrators; the latter is an open choice.

### O15 — Use affordable public components and avoid permanent third-party SaaS dependency

**SUPPORTED_WITH_QUALIFICATION**. Final lines 7, 11, 45, 51–54, 87–88. Checked primary evidence: R01, R20, R24, R28, R32, R33.

Public components and utility-controlled server, worker, API and backups avoid a required permanent SaaS. Pouch/Couch license identities and official Central self-hosting documentation support availability. Operations and infrastructure costs are acknowledged.

Affordability is a bounded architecture choice, not a priced procurement claim. No workload, actual quote or operational staffing budget is provided or asserted.

### O16 — Preserve supported corrections, product choices, covered dispositions, optional leads and justified uncertainties

**PARTIALLY_SUPPORTED**. Final lines 7–20, 41–45, 47–89. Checked primary evidence: R01, R02, R03, R04, R05, R06, R20, R21, R22, R23, R24, R26, R34, R37, R40, R43.

No user stack choice is silently made. All eleven product questions and optional ODK/Automerge opportunities survive; main corrections and prior coverage survive. Pair/device/auth/erasure/retention/resume uncertainty is justified.

Couch #5422’s implementation/release uncertainty is overstated by omission of available primary history (MD01); residual runtime/workload uncertainty remains justified.

### O17 — Provide a complete proposed-change artifact after same-family criticism and preserve required critique

**SUPPORTED_WITH_QUALIFICATION**. Final lines 3–104. Checked primary evidence: R07, R08, R14, R20, R21.

Every one of the eight actionable critique items and six coverage dispositions is present in final/dispositions. The reviser correctly rejects the erroneous raw-test anchor and adopts the release-note correction; the criticism is a predecessor requirement, not an optional list.

The supplied criticism itself missed the Couch fix history; adopting it does not cure MD01. No separate hidden critic or new candidate revision was created.

### O18 — Distinguish proposed checks from executed checks

**SUPPORTED_FOR_ARTIFACT**. Final lines 3, 71, 73, 91–104. Checked primary evidence: R08, R13, R35, R41.

Final labels every validation as proposed, the upstream regression as inspected only, and source fetching/hashing as the sole declared execution. No runtime result is presented as evidence.

Candidate native receipts/action logs were not in the allowed input map. This assesses the artifact’s claims and evidence distinction, not an independent forensic proof of every negative action declaration.

### O19 — Remain a planning research proposal; no canon edits, purchases or unrelated services

**SUPPORTED_FOR_DECLARED_SCOPE**. Final lines 3, 77–104. Checked primary evidence: artifact/brief comparison; no external factual guarantee claimed.

The artifact is an integrated decision aid with a conditional recommendation, owner choices and validation gates. This review wrote only the authorized review directory and executed no downloaded component/source.

Actual hidden candidate action history was outside the permitted source review; no conclusion is inferred from excluded native counters or receipts.

## Frozen-plan comparison

All six crosswalk rows were checked against actual plan.md line 3, rather than an assumed fuller specification.

| Frozen choice | Assessment of final disposition |
|---|---|
| Mutable inspection record, timestamp winner | Append events and an explicit projection/review address lost concurrent edits and missing history. Calling it one inspection per asset overreads the thin plan; the timestamp/history correction remains useful. |
| Coordinates, text and photo paths | Stable photo IDs/manifests, accuracy/fix age and capture metadata provide portable identity and explicit evidence; these are proposed schema choices, not discovered upstream guarantees. |
| POST changed records and retry | Conditional revision replication or a specified native outbox is compared. Persisted event identity and durable receipt are separate from network retry. |
| Latest inspections and CSV | Projection plus event/conflict history supplies the requested supervisor context; CSV is a derived export. No web interface is claimed to be built. |
| Undefined auth, deletes and concurrency | Scope boundaries, validation/origin gates, tombstones, retained correction/redaction events and pending conflicts are proposed with explicit limitations. |
| Undefined photo retries and audit | Canonical operation/photo hashes, server recomputation, idempotent reconciliation and observable receipt/history checks are present. Couch amplification history remains incompletely dispositioned under MD01. |

## Required critique and source errata preservation

| Critique item | Status | Final lines |
|---|---|---|
| K01 Conditional stack/device-storage gate | PRESERVED | 7, 11, 79–80, 93 |
| K02 Operation-level idempotency/hash/server recomputation/worker crash | PRESERVED | 26–28, 35, 95 |
| K03 Arrival versus causality and reordered child | PRESERVED | 29–30, 94–95 |
| K04 Photo redaction model/tombstone/backups/stale retry | PRESERVED | 41–42, 85–86, 97, 99 |
| K05 Receipt privacy/member scope/authenticated validation context | PRESERVED | 18, 35–36, 44, 98 |
| K06 Issue/fix/test/release corrections | PRESERVED_WITH_JUSTIFIED_REJECTION_AND_REMAINING_DEFECT | 69–75, 96–97 |
| K07 Distinct mechanism scopes and optional leads | PRESERVED | 11, 20, 47–54 |
| K08 Proposed/executed boundary and eight validation groups | PRESERVED | 3, 71, 91–104 |

The K06 rejection is justified: the exact test commit’s raw file has SHA-256 `696848045d5622891179d4e04d8fd56f3263f4ebfa5141d59434e10834c164fe`; `#8456 bad attachment rev after replication` begins at raw 3899 and ends at 3967. Raw 3729 is inside the older #3932 test. R08 and R13 substantiate the correct location. The supplied critic’s browser-transformed line numbers do not establish a different GitHub raw-file anchor. The final also correctly withdraws the inherited assertion that visible 8.0.0 release notes list #8460: R14’s complete release body does not contain that number. Pouch 9.0.0’s exact plugin guard is stronger direct applicability evidence. These original source failures remain recorded as lineage findings; none was silently rewritten.

The six required coverage dispositions remain: frozen-plan corrections, integrated-brief topics, useful discoveries, attributed already-covered material, open choices, and product-choice/status boundaries. The supplied critic’s original positive conditional verdict is preserved as its own verdict, not substituted for this review’s grade. The final preserves all eleven open choices: client platform; offline workload; domain merge semantics; approval/correction; identity/enrollment/revocation; confidentiality scopes; retention/erasure; photo resumption/headroom; backup/recovery; operator stack; and administrator tamper-evidence requirements. Optional ODK capture workflow and narrow Automerge text experiments remain distinct from the proposed main stack. No owner decision was supplied or made.

## Non-material precision and evidence findings

- **m01** — The plan defines an inspection as a mutable record carrying asset ID; it does not state one inspection per asset. Timestamp overwrite/history concerns still follow. This is an overread of baseline cardinality, not a failure of the event/history correction. Location: final lines 9; also 60.
- **m02** — Fixture is attachment.txt with text/plain base64 text. Generic attachment-reference behavior is relevant to photos, but the upstream regression is not itself a binary-photo test. Final already requires project adapter/photo tests. Location: final lines 71.
- **m03** — Supplied F02 captures raw 589–592 (admin-role example/link), not membership rule. S05 and independent raw 525–530 substantiate the final claim. An excerpt hash is not substantive corroboration. Location: final lines 18.
- **m04** — Database technology description is true; default idb and indexeddb plugin identity should be explicit at the existing build gate. The reviewed fixed plugin must not be assumed to be every default adapter. This is an implementation-choice qualification, not a fabricated source guarantee. Location: final lines 7, 73, 93.

These do not erase supported core claims. They prevent overstating baseline cardinality, the photo fixture, excerpt corroboration or adapter applicability.

## Discovery yield, planning usefulness and validation boundary

Supported discovery yield is substantial within the bounded planning task: transport versus receipt/audit; hidden conflict leaves; history loss under compaction; database-wide confidentiality scope; browser/native lifecycle tradeoffs; stable event/photo identity and idempotent outcome proposals; the Pouch attachment regression; ODK workflow states; Automerge semantic limits; and relational uniqueness/transaction foundations for a custom outbox. These are distinct useful findings or source-informed design proposals, not a count of S/C/F citations. The Couch amplification discovery is useful but incomplete because of MD01. Alternatives are shallower than the primary pinned implementation; the brief does not require a fully certified code study of each alternative.

All eight validation groups were assessed: device/storage and prolonged-offline restart; concurrency/projection; duplicate/reorder and receipt-worker faults; exact regression/pair applicability; attachment workload and stale deletion replay; identity/permissions/receipt privacy; attributed history and erasure; operations/restore. Their asserted outcomes are observable and cover the original brief. None is credited as passed. Canonicalization bytes, loaded adapter, actual device/version matrix, numerical workload, retention rules and status-resolution semantics must become concrete when product owners select the proposal. This is the planning/usefulness distinction: a good test proposal is useful without being evidence of successful execution.

Reviewer execution consisted of permitted file reads, public-source HTTP text retrieval/decoding, hashing, GitHub metadata comparison and JSON/output consistency checks. No downloaded installer, component/host code, upstream test or application validation was executed. No accounts, provider settings, canon/main/WorkNodes or frozen candidate artifacts were changed. No hidden extra candidate critic or rewritten final was produced.

## Blinding limits and exact remainder

Visible authorized clues were the `I-ANCHOR-LUNA`/`control` path and titles, explicit same-family criticism, research/critic/reviser phase names, S/C/F lineage, browser/raw locator dispute and read-only capture method descriptions. Those make arm/method-label blinding imperfect. I did not infer provider, cost, speed or winner from them. No counterpart answer/sources, other review/partial/graders, costs/timings, native counters, expected winner, root/parent/historical analysis or excluded native receipts were read. Source retrieval dates are provenance only.

**Unassessed remainder within declared source-review scope: none.** Hidden native-action forensics, the original draft’s historical coverage assertion, runtime tests, procurement pricing and exhaustive security/whole-project/license audits are expressly outside this grade. Full positive is withheld because of the assessed material omission, not because this review silently assumes those excluded activities passed.

Exact machine-readable judgments, every obligation and preserved source failures are in [judgment.json](judgment.json). Precise primary URL/version/ranges/retrieval identities and bounded evidence are in [sources/SOURCES.md](sources/SOURCES.md) and [sources/retrieval-manifest.json](sources/retrieval-manifest.json). Independent review elapsed time and billing uncertainty are in [timings.json](timings.json).
