# Independent critique — ER12-D-R1-03-FRESH

**Run/stage:** D-R1-03-control / critic  
**Materials reviewed:** assigned brief; investigator discovery, draft, source-map, revealed plan and plan-release record; investigator source index and its linked primary sources.  
**Review standard:** original brief and the exact revealed plan remain controlling. This critique evaluates the proposal; it does not authorize a narrower scope or supply a repaired final.

## Overall assessment

The proposal is careful, bounded, and largely faithful to the brief. It keeps bit continuity, interview identity, completeness, and transcript linkage as separate claims. It explains the different reach of manifests, metadata/events, content comparison, and manual review; treats names and similarity as clues; preserves consent and no-change boundaries; and presents a reversible, independently reviewed pilot. Its scenario statements remain premises, not findings. I found no material false correction and no material error in the primary-source claims I checked.

Two plan-level gaps remain material: the investigator explicitly reports completing less than the requested 60-minute research session, and the implementation discussion does not compare rollback and unresolved-item handling across implementations as the plan asks. The shorter session is disclosed rather than concealed. A smaller, non-material gap is that the naming-restoration alternative is mentioned but not weighed. These are critique findings, not instructions to reduce scope.

## Brief and plan coverage

| Obligation or opportunity | Assessment | Draft locator and evidence |
|---|---|---|
| Conduct a 60-minute research session | **Material incomplete.** The proposal retains the requested scope but reports that the investigator stage allowed about 29 minutes 25 seconds. It therefore does not establish that the requested research session occurred. The report is candid and requests no assumed extra time. | Draft, “Scenario facts and boundaries” and the first row of “Exact clause disposition”; revealed plan, “Scope and release boundary.” The exact timing is the draft’s self-report; the assigned package has no independent timer trace. |
| Develop a bounded proposal, not a tool or full repair | Covered. The draft proposes read-only evidence gathering and no production migration or repair. | Draft, “Proposal in brief,” “Reversible pilot,” and step 10. |
| Separate continuity, interview identity, completeness, and transcript correctness | Covered with explicit definitions, distinct finding fields, and limits on each evidence type. | Discovery, “Four separate claims”; draft, “Proposal in brief,” clause table, and evidence model. |
| Compare fixity/manifests, metadata, content methods, and a useful manual alternative | Covered. The strategy table describes what each can and cannot establish; the manual-only route is also specified. | Discovery, “Strategy comparison”; draft, “Evidence model and comparison” and “Manual alternative.” |
| Address renamed files, transcodes, partials, and ambiguous duplicates | Covered. Each is treated as a distinct hypothesis; neither equal names nor hash inequality settles interview identity. | Draft, “Interpret the reported anomalies as competing hypotheses.” The controlled filename association example is expressly limited to Archivematica’s manual-normalization workflow [S16]. |
| Investigate preservation and implementation history; identify records that change interpretation | Mostly covered. BagIt, PREMIS, PBCore, Archivematica behavior, a validator issue, and Chromaprint release/issue history are used conditionally. Missing inventories, mappings, events, tool versions, extents, transcript history, and permissions are named. The rollback/unresolved-item comparison gap is detailed below. | Draft, “Implementation and preservation history” and “The most important missing evidence”; discovery, “Missing evidence that would change interpretation.” |
| Propose a reversible pilot, independent relationship checks, provenance, and an unresolved queue | Covered. The setup preserves an untouched reference; a second reviewer checks sampled links; event fields and unresolved statuses are specified. | Draft, “Read-only setup and inventory,” steps 1–4; “Relationship checks and independent sample,” steps 5–7; “Provenance, reversibility and exit,” steps 8–10. |
| Do not alter, publish, or upload archive material; do not infer consent, authenticity, or completeness from weak evidence | Covered. No archive material was supplied or accessed, and no proposed result exceeds its evidence. | Brief boundaries; draft, “Scenario facts and boundaries,” “Gate before any content access,” and “Executed versus proposed validation.” |
| Do not access interviews, contact interviewees, create accounts, or invent records | Covered and repeatedly stated. | Draft, “Scenario facts and boundaries,” “Gate before any content access,” and validation-status sections. |
| Keep the specified archive facts unresolved | Covered. The unresolved conditions and copy roles remain open questions; the draft distinguishes owner inputs from research findings. | Brief, “Still unresolved”; draft, “Scenario facts and boundaries,” “Decisions only the archive owner can supply,” and evidence limit. |
| Consider current paths with a documented mapping versus restoring older names | **Minor incomplete.** The draft elects to preserve current names and says restoring old names is not required, which is a cautious and reversible choice. It does not briefly weigh when restoration might help or why it might be harmful, as the plan invites. This does not breach the original brief. | Revealed plan, “Meaningful useful alternatives”; draft, final bullet in “Decisions only the archive owner can supply.” |
| Preserve a provisional design without declaring a winner | Covered. The hybrid is described as provisional and conditional; manual-only review remains an alternative. | Draft, “Proposal in brief” and “Optional improvements to the research method.” |
| Distinguish proposed validation from validation actually run | Covered in structure and wording. Case-facing tests are explicitly proposed, not reported as executed. The documentary/process checks are self-reported and have limited independent receipts in the package. | Draft, “Executed versus proposed validation”; details below. |

## Findings requiring attention

### 1. Material incomplete — the 60-minute research session

The original request specifies a 60-minute research session, and the revealed plan reiterates that the topic is sized for a full 60-minute research-and-proposal session. The draft says the investigator stage had a hard deadline of 2026-10-10T06:54:08.010Z after activation at 06:24:43Z, yielding about 29 minutes 25 seconds. On the candidate’s own account, the session-duration obligation was not met, even though the final proposal retains its substantive scope and discloses the constraint. No independent timing record is in this critic’s inputs, so the exact timing remains self-reported. Whether the stage clock substitutes for the requested research session is an owner-level route decision; the critique does not silently waive the 60-minute clause.

### 2. Material incomplete — comparative implementation history

The plan’s “Implementation and history opportunity” asks for comparison of failure handling, rollback, and unresolved-item reporting in relevant implementations. The draft gives useful, conditional detail for Archivematica 1.17.1: checksum failures can halt a transfer, normalization failures can permit review/continue/redo, and rejecting a transfer stops processing [S13–S15]. It also correctly says that the cited docs establish no rollback guarantee. However, it does not compare rollback behavior or unresolved-item reporting across implementations; its unresolved queue is the proposal’s own design, not an observed implementation feature. The historic issue and versioned docs improve the evidence base but do not fill that comparison. This is a depth gap against the exact plan, not a false product claim.

### 3. Honestly unresolved external input — investigator execution receipts

The draft reports that a native Goal guard passed, static artifact checks ran, and a plan-release helper ran once. The supplied plan-release JSON records a reveal time, byte counts, and hashes, but the assigned investigator package does not contain the native Goal response or raw helper/check output. I therefore treat those operations as the investigator’s self-report; the available release record is evidence of recorded metadata, not independent proof of every claimed execution step. The draft itself separates these process checks from the unexecuted archive checks, which is appropriate.

### 4. No material false correction found

The “Corrections to any premature conclusion” section corrects hypothetical overclaims without changing the brief. The source checks support the main bounded claims: BagIt’s complete/valid status is scoped to its manifests and checksums [S01]; PREMIS makes event time mandatory while detail/outcome can be optional [S02]; the old Archivematica duplicate-checksum report records error 110 despite per-file passes and a 1.10.0 milestone, but does not identify the fix [S08]; and the Chromaprint short-input report is specifically about Algorithm/Test3 [S11]. The draft preserves these applicability limits. The 1.17.1 manual-normalization filename rule is confined to a prescribed workflow with a one-to-one original/derivative relation [S16], as the draft states.

## Source and condition review

The reviewer’s navigable source index and source-map retain S01–S16 without rebinding their URLs. Primary checks included BagIt sections 1.1, 2.1.2–2.1.3, 2.4 and 3; PREMIS event units; the PBCore relation element; LOC’s BWF description; ffprobe interval behavior; versioned Archivematica transfer, preservation-planning, error-handling, PREMIS, and manual-normalization pages; the Archivematica issue; and the pinned Chromaprint README, release and issue. Full source identities, released versions, locators, conditions, applicability, and review operations are in source-map.json and sources/index.md.

The most consequential conditions are handled correctly:

- A current-only manifest is a new baseline; historical continuity requires an attributable earlier reference and a defined object scope [S01].
- PREMIS optional detail/outcome and product-specific events do not make absence proof that no operation occurred [S02, S15].
- Archivematica’s documented source retention, normalization rules, transfer checks, and error paths are version- and configuration-dependent; they are comparative leads, not evidence that this synthetic archive used the product [S06–S07, S12–S15].
- Fingerprint behavior depends on the pinned implementation/configuration and input window. The Test3 issue is not generalized to all Chromaprint algorithms [S09–S11].
- Metadata and duration are useful characterization clues, not proof of interview completeness or transcript correctness [S04–S05].

## Validation record

**Investigator-reported executed work:** public-source review; plan-release and artifact checks; no archive files, personal interviews, transcripts, migration logs, checksums, fingerprints, or relationship sample were examined. The draft labels future inventory, characterization, listening, fingerprinting, completeness review, and adjudication as proposed only.

**Critic work:** rechecked the listed primary sources; parsed the investigator source-map as JSON and confirmed 16 unique, ordered source IDs; checked the discovery byte count and digest against the supplied release record. No case-facing validation was run.

**Reviewer scope exception:** while checking the release record, I also ran a digest command on the frozen plan source path named inside plan-reveal.json, although that file was not directly listed as an input path in input-map.json. I did not open or render its text or use its contents in this critique. This is a critic-side scope deviation and is recorded here; it does not establish a validation claim for the investigator.

**Case-evidence limit:** no conclusion about the actual archive’s continuity, interview identity, completeness, transcript links, consent, or authenticity is supported by this package.
