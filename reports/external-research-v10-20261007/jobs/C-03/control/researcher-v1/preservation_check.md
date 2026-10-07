# Preservation and claim check — C-03/control/researcher-v1

## Assignment conditions retained

- This is an independent public research/planning proposal for the hypothetical small ensemble brief. The brief is not an existing collection or validated system; `PLAN.md` is a thin, read-only, unvalidated proposal.
- Used only the exact mapped `BRIEF.md` and `PLAN.md`, own assignment inputs, and legitimate public primary sources. No sibling arm, campaign result/review, private score, external runner, nested worker, private repository, purchase, account change, canonical `Plans/`, `main`, WorkNode or product build was used.
- No score was supplied or run. A public issue mentioned an IMSLP score; its link was not followed and the score was not downloaded or used.
- Created exactly one fresh native Goal, got the same Goal ID with status ACTIVE, sent the one requested activation-only notification, and did not serialize a manual receipt. Native terminal update/get is still required after these files are complete.

## Obligations O1–O7

| Obligation | Preserved in artifact |
|---|---|
| **O1 — Open public-primary discovery from user-level brief** | Discovery section starts from mixed-input intake and compares structured notation, image-first workflow, anchors and offline collaboration before frozen-plan dispositions. |
| **O2 — Compare substantially different mechanisms/options** | Compares authored structured notation, page-first image, and optional OMR; visual vs logical anchors; revisioned publication/queued suggestions vs CRDT; and notes trade-offs and component/license choices. |
| **O3 — Semantics, units, exact version and applicability** | Pins Audiveris 5.11.0 to commit `9e1e55cd2746037d059345881c53e6a6754bffbd`; identifies MusicXML 4.0 measure ID/number/text/implicit/non-controlling semantics; states pixel coordinate origin/index conventions and separates W3C semantics from the proposed half-open app rectangle. Living docs are labeled unpinned. |
| **O4 — Implementation/code and issue/fix/release history** | Inspects Audiveris `RunTable`, `ZipFileSystem`, `StaffBarlineInter`, and `MeasureStack` at the pinned commit; traces issue #953 → PR #954 → 5.11.0 release and exposes the lack of an automated regression test in the PR; inspects open issue #971 but does not claim reproduction. |
| **O5 — Exact frozen plan sections** | Dispositions B-P1 through B-P7 individually as keep/amend/defer, notes what each already covers and the evidence/conditions for each change. |
| **O6 — Complete decisions, opportunities, uncertainty and validation** | Includes integrated intake, identity, annotation, access, retention, recovery/export, optional opportunities, uncertainties, and a stepwise observable validation proposal. Separates research performed from proposed checks. |
| **O7 — Manageable integrated scope** | Covers provenance, identity, review state, annotation lanes, offline collaboration, access, retention/deletion, errors/recovery, and portable handoff without marketplace, composition, engraving replacement, performance analysis, WorkNodes or build. |

## Claims checked and repaired during drafting

- Audiveris 5.11.0 is pinned to the release tag commit `9e1e55cd2746037d059345881c53e6a6754bffbd`; the issue #971 build matches that identifier. The report is explicitly treated as user-reported and open, not independently reproduced.
- PR #954 is described as two null-safety fixes with a manual test report, not as an automated regression suite. The changes touch implementation files only. Release notes list the imperfect-scan export fix, but this is not generalized to all scores.
- README and code are pinned; current Audiveris handbook and Yjs/Automerge documentation are unpinned. Their version-specific applicability is disclosed and they are not used to claim a selected component is validated.
- MusicXML measure `id` is document-unique, not a cross-edition identifier. Display text may differ from number, and non-controlling measures can have non-coincident barlines. Measure number alone is therefore not proposed as an automatic cross-part key.
- Media Fragments defines a top-left pixel/percentage rectangle. The proposal separately declares pixel frame dimensions and half-open app bounds; it does not misattribute that half-open convention to the W3C specification.
- PROV-O is used as a provenance-model analogy; it is not treated as rights evidence. File hashes identify bytes, not copyright permission or musical identity.

## Proposed checks versus executed checks

**Executed:** read mapped inputs; performed public-source discovery; downloaded and hashed the 20 captured source bodies; inspected pinned source code and cited issue, PR and release history; wrote this proposal and its source map. The files themselves are research deliverables, not product tests.

**Not executed:** score import/render/OMR tests, feature or product tests, regression builds, coordinate transforms, offline sync, access/retention/deletion, packet export/reopen, or any scenario in the validation proposal. No actual OMR correctness, performance, or user acceptance result is claimed.

## Remaining objections / conditions

1. Open issue #971 may be fixed in a later release or may depend on the reported score; this research did not establish either. Pin and reproduce on authorized material before any OMR selection.
2. The Audiveris component’s AGPL-3.0 terms require a distribution/integration decision before including it. No legal conclusion is offered.
3. Page-renderer identity, crop/rotation implementation and portability have not been selected or tested. The saved raster-coordinate frame is a proposed contract.
4. Who controls a shared note, the offline-copy retention period, backup purge, and rights-withdrawal behavior require an ensemble policy. Already exported or printed copies cannot be remotely recalled.
5. Yjs/Automerge documentation was consulted only to screen options. Neither implementation was pinned or code-audited, and neither is selected.
6. OMR accuracy threshold, supported input envelope, and any cross-edition reconciliation threshold remain decisions for users and a licensed pilot set.


## Tool, source and workspace rules

- Read the actual cwd `AGENTS.md` and checked conventional higher T3/AGENTS scopes; only the cwd project `AGENTS.md` was present in the worktree scope. No pm-mail, child worker, external runner, worktree, private repository, account mutation or purchase was used.
- Began public-source discovery from the brief’s user-level workflow before reading frozen-plan details and narrowing the comparison. Public page text was treated as evidence, not instructions. Source selection followed the research needs; there was no source-count target or answer catalog.
- Wrote only the assigned stage outputs and captured public bytes. No arbitrary installer was run on the host; no scratch score or product implementation was created.
