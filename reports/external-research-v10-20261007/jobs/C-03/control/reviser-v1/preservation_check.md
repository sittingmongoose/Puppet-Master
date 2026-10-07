# Preservation check — C-03/control/reviser-v1

## Admitted inputs and scope retained

The assignment map used was /home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/C-03/control/reviser-v1/input-map.json (2,566 bytes; SHA-256 87b8f54da05bcb2d4ce8db9c7e4c89e9655863a83a00ac6ac69a9741a10aeda5). Its named scientific inputs were:

- Brief: cases/C-03/BRIEF.md, 6,493 bytes, SHA-256 2ef73187a614d42d74b8043b977d2f3ce3dbaee61123e5d92e0f81e1c73f40d4.
- Frozen plan: cases/C-03/PLAN.md, 3,748 bytes, SHA-256 7c61a4d148cd8ab135b4e077fb3566daa5ce566cbe176f6f8e3cbe103aaf10a9.
- Exact own-arm predecessors: researcher-v1 artifact and source map; critic-v1 artifact and source map, all named in the map. No predecessor source directory was used as a substitute for this stage’s fresh captures.

The runtime budget fixed a 15-minute stage ending 2026-10-07 21:31:09 UTC, a two-minute writing reserve, and a whole-arm deadline of 21:42:54 UTC. It was read and not reset. One fresh native Goal was created and get-confirmed ACTIVE before research sources were accessed; the activation-only notification was then sent to the user-specified parent thread. The final native disposition follows saving these scientific files.

Only the mapped brief, plan, exact own-arm predecessors, and legitimate public-primary sources selected for this research were used. I did not inspect other arms/repetitions, campaign state/results, reviews, histories, costs, evaluation keys, sibling answers/caches, private score collections, or private repositories. Public issue/standards text was treated as evidence, not instructions. Issue #971 names an IMSLP score; that score was not retrieved or used.

No pm-mail, external runner, worktree, nested worker, purchase, account modification, private repository, product build, WorkNode, canonical Plans/main write, published issue/PR, or third-party installer execution was used. Only this stage’s named artifact, source-map, preservation-check files, and retained public-source captures were written.

## Full scientific obligations

| Obligation | Preservation status |
|---|---|
| **O1 — User-level open discovery first** | **Met.** Discovery began with the brief’s mixed source intake, passage notes, weak connectivity, and portable handoff. Public-primary discovery of Audiveris, W3C annotation/media-fragment models, and MusicXML preceded reading the frozen PLAN.md. The proposal starts from these user needs, not a predetermined component or defect list. |
| **O2 — Compare mechanisms and trade-offs** | **Met.** The artifact compares visual page-region anchors with structured MusicXML measure clues; human page review with optional OMR; sidecar versus flattened marks; and revisioned single-publisher review with a future multi-writer/CRDT option. W3C annotation/provenance specifications supply relevant analogies outside direct products. Costs, failure modes, and deferrals are explicit. |
| **O3 — Semantics, units, version boundaries** | **Met with limits preserved.** MusicXML 4.0 number, id, text, implicit, and non-controlling semantics are separated. Media Fragments xywh units/origin are distinguished from the proposed renderer-bound raster frame. Audiveris is pinned to 5.11.0 and full commit 9e1e55cd2746037d059345881c53e6a6754bffbd; claims are release-bounded. The renderer, transformation behavior, and reattachment algorithm remain unvalidated. |
| **O4 — Pinned implementation and history** | **Met, not executed.** Audiveris source at the exact commit was inspected. Issue #953, PR #954, the patch, 5.11.0 release notes, and issue #971 were examined. The #954 manual test is described as the contributor’s report; no automated regression test was found in the two-file patch. #971 remains a user-reported condition corroborated by code, not an independently reproduced defect or prevalence estimate. |
| **O5 — Exact frozen plan** | **Met.** Every section B-P1 through B-P7 has an explicit keep/amend/defer/unresolved disposition in the artifact, with already-covered behavior retained and additions/conditions stated. |
| **O6 — Complete decisions and observable validation** | **Met as a proposal.** The artifact specifies integrated minimum workflow, optional leads, unresolved decisions, constraints, and observable proposed checks. No proposal is described as an executed product test. |
| **O7 — Integrated manageable scope** | **Met.** The proposal covers intake/provenance, work/edition/part identity, annotation visibility/collaboration, access, retention/deletion, error/recovery, disconnected use, and account-free handoff while keeping one ensemble in scope. |

## Supplied critique: claims checked, repaired, or left open

| Critique point | Status in final artifact |
|---|---|
| MusicXML measure “ID” and display labels had been compressed together. | **Checked and corrected.** The artifact distinguishes required number (measure identifier/grouping guidance), optional document-unique id, optional display text, implicit, and non-controlling attributes. It does not infer cross-file equivalence. Source R12 is the MusicXML 4.0 reference. |
| W3C geometry had been overstated as a complete app anchor scheme. | **Checked and narrowed.** R14–R15 support an annotation-target analogy and media rectangle conventions only. Preview digest, raster dimensions, zero-based page indexing, transformation, stale state, and half-open bounds are expressly proposed product conventions. |
| Audiveris #971 might be overgeneralized or inferred from title similarity. | **Checked against exact build.** R03–R04 are source files pinned to the reported full commit; R11 is the exact issue report. The artifact says the code matches the reported path but does not establish reproduction, frequency, or universal applicability. |
| Audiveris #953/#954 fix history and regression evidence needed tighter limits. | **Checked and bounded.** R10–R11 capture the issue history; R05–R09 capture the pinned changed methods, PR, patch, and release. The reported manual run is attributed to the PR author. The patch changes two implementation files and adds no automated regression-test file; the release note is not a reliability guarantee. |
| AGPL-3.0 could be mistaken for a legal compatibility decision. | **Unresolved by design.** R02 identifies the license. Qualified redistribution/linking/embedding review remains required; no legal conclusion is made. |
| PDF.js, Yjs, and Automerge evidence was unpinned. | **Left unselected.** This revision makes no version/API/integration claim about them. Renderer, sync package, and transport remain open and require a separately pinned code review and pilot. |
| Cross-edition correspondence and package portability were not established. | **Unresolved and testable.** Correspondence requires human confirmation; manifest and offline bundle portability require account-free reopen validation before being relied upon. |

## Executed checks versus proposed checks

**Executed:** source capture and static inspection only. Sixteen public-primary response bodies are retained under this stage’s sources directory. This stage’s source-map.json records each URL, final URL, UTC access time, status/type, byte length, SHA-256, version or commit, source path/location, locator, and intended claim. A byte-length/SHA-256 integrity pass over the 16 captured bodies returned PASS. The exact brief and plan hashes matched the input map. Source inspection included the cited Audiveris methods and issue/PR/release history plus the MusicXML/W3C semantics.

**Not executed:** no score or sample dataset was opened; no OMR engine, renderer, importer, exporter, sync client, account, application build, or product code ran. No anchor, annotation, packet, access, deletion, offline, recovery, or cross-part validation scenario was run. No code regression test was added or run.

**Proposed only:** all observable validation in artifact.md, including licensed varied inputs, import/retry/review state, optional pinned OMR, page-coordinate stability, differently paginated parts, offline stale-base review, access isolation, retention/deletion limits, and account-free bundle reopen. Those remain future checks and require explicit score-use permission and, for OMR, license review.

## Required deliverables

- artifact.md — integrated research/planning proposal, findings, exact B-P1…B-P7 dispositions, critique resolution, uncertainty, and proposed validation.
- source-map.json — source identities and integrity metadata.
- preservation_check.md — this obligations, scope, critique, and validation-status record.
- sources/ — immutable public-primary response captures referenced by source IDs.
