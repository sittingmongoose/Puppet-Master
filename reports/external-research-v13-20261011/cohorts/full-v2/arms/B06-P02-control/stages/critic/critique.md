# Independent critic review — B06-P02-control

**Stage:** critic  
**Scope:** full volunteer shift-handover brief and exact released plan.  
**Inputs:** brief, investigator discovery, draft, source map, revealed plan, plan-reveal record and source index. I independently reopened governing primary sources indexed below.  
**Conclusion:** The proposal substantially preserves the brief and makes defensible, conditional corrections. One material safeguard is incomplete for contact data embedded in searchable free text; one exact upstream CI-count statement is unsupported by the source view I observed. I found no basis to select a sync product or close organizational policy questions.

## Findings

### F-01 — Material incomplete: contact details in searchable notes

**Locations:** plan search clause; draft §1 P05; “Search and access”; §4 “Search privacy”; §5 owner decisions. The plan searches titles and notes while excluding contact fields. The draft correctly excludes structured contact fields from indexes, responses, snippets, logs and offline datasets, recognizes that notes may contain contact information, and proposes synthetic email/phone tests. It does not define a dependable rule for whether contact-like note text is indexed, filtered/redacted, access-controlled or omitted from search. Excluding a separate contact column does not prevent a contact string in a searchable note from appearing in a result. CouchDB database members can read documents within the database, so UI hiding alone is not a record-level boundary (C02).

This is material because the brief expressly prohibits private contact details in search results. The risk and test are identified, but the safeguard and pass condition are not concrete. The center’s note-content policy is honestly unresolved; it does not settle search behavior if a note contains contact details.

### F-02 — Unsupported: “56 checks passed” for CouchDB PR 6129

**Locations:** discovery “Consequential implementation and release evidence”; source-map S14; draft §6. I inspected issue #6126, PR #6129’s source/test changes and the 3.5.x release notes (C06–C08). The report’s bounded condition is represented accurately: on 3.5.2, deleting and recreating a document with the same ID and attachment name before the deletion replicates can leave changed attachment content incorrectly replicated. PR #6129 merged on 2026-09-25 and adds source changes and an EUnit test module; the 3.5.3 notes identify the fix. The PR view I observed showed “Checks 0,” not 56 passed.

The fix and named regression tests are supported; the asserted check count is not supported by the current source view, and its historical state cannot be established from what I reviewed. Keep it only if a dated capture backs that number; otherwise remove it. No local EUnit suite or reproducer was run, consistent with the draft’s execution boundary.

## Released-plan disposition audit

| Plan clause | Critic assessment | Draft locator/evidence |
|---|---|---|
| **P01 — Stable IDs, event history, separate acknowledgment.** | Accepted with useful detail; acknowledgment cannot resolve an issue. | §1 P01; “Shift workflow.” |
| **P02 — Cache current-shift issues.** | Accepted with freshness boundaries. A browser cache is not an archive. | §1 P02; offline validation. Chromium documents eviction and persistence limits (C13). |
| **P03 — Queue comments and claims offline.** | Correctly corrected: comments append; competing claims remain provisional for explicit reconciliation. | §1 P03; competing-claims validation. |
| **P04 — Shared service accepts events and produces summary.** | Accepted as an architectural option, not product selection. Alternatives are compared. | §1 P04; “Synchronization alternatives.” CouchDB replication/conflicts remain application concerns (C01, C04). |
| **P05 — Search titles/notes excluding contact fields.** | Material incomplete: structured-field exclusion does not resolve contact data inside free text. See F-01. | §1 P05; “Search and access”; §4. |
| **P06 — No reading score/productivity ranking.** | Preserved fully; no leaderboard or read-rate metric. | §1 P06; “Shift workflow.” |
| **P07 — Explicit resolution with reason.** | Accepted with revision/state guards; correct distinction between technical revision conflict and domain resolution. | §1 P07; “Shift workflow”; CouchDB conflict behavior (C01). |
| **P08 — Later comments do not alter resolution; new claim prompts review.** | Correctly tightened: stale claims are not transitions; reopen is separate and authorized. | §1 P08; comment-after-resolution validation. Role remains an owner decision. |
| **P09 — Assume device IDs unique.** | Warranted correction to server idempotency and collision handling; restored-backup case is tested. | §1 P09; duplicate validation; PowerSync docs also require deduplication (C09). |
| **P10 — Queued writes retain original rights.** | Properly rejected as an implicit rule; replay authorization is a defensible proposal, while any grace policy remains unresolved. | §1 P10; “Search and access.” CouchDB identity integration is configuration-dependent (C03). |
| **P11 — Departure/restored-backup analysis.** | Accepted and expanded; creation time, receipt time, attribution and duplicate IDs are separated. | §1 P11; identity/revocation and idempotency validation. |
| **P12 — Explicit photo upload on suitable connection.** | Accepted with size estimate, Wi-Fi default and cellular override. Numeric cap and permitted content are honestly open owner inputs. | §1 P12; “Photo handling and retention”; C05 describes revision coupling, not app bandwidth rules. |
| **P13 — Attachment deletion/cache retention unresolved.** | Accepted with pending/propagated state and no universal erasure promise. | §1 P13; photo validation. CouchDB retains deletion revisions for replication (C14). |
| **P14 — Invitation codes and identity open.** | Accepted as an identity decision. A group code alone cannot ensure person-level attribution/revocation; named app identity need not mean a paid vendor seat per volunteer. | §1 P14; “Search and access”; C03 and C11. |
| **P15 — Validate specified failure cases.** | Accepted and expanded; explicitly proposed, not executed. | §1 P15; §4. |
| **P16 — No live data/accounts accessed.** | Preserved as a scope boundary. | §1 P16; §6. |
| **P17 — Start with synthetic examples before policy/photo decisions close.** | Accepted only as a no-account synthetic rehearsal. Real use remains gated on minimum identity, access, retention and recovery decisions. | §1 P17; adoption steps 1–2 and 5. |
| **P18 — Provisional, primary evidence, open user-data questions, no deployment.** | Accepted; the proposal distinguishes evidence, future validation and unknowns. F-02 is the one source-count discrepancy. | §1 P18; §§5–6. |

## Full-brief coverage

- **Recent handovers and unresolved issues:** A dated change summary carries unresolved work forward and distinguishes server-confirmed, pending and review-blocked changes.
- **Offline drafting and concurrent claims:** Claims are provisional until reconciled; the draft explains why two disconnected devices cannot guarantee exclusive ownership and offers disabling offline confirmation where hard exclusivity is required.
- **Older-issue search:** An allowlisted projection is useful, but F-01 remains.
- **Acknowledgment versus resolution and no score:** Separate actions/data; no reading performance measures.
- **Optional sensitive photos/mobile data:** Explicit staged upload, byte estimate, Wi-Fi default, cellular override and size cap address data use. A numeric cap remains a policy input. Deletion is not represented as universal erasure.
- **About 30 rotating volunteers:** Adoption/scale rehearsal covers roughly 30 synthetic identities, without real invitations.
- **No per-volunteer commercial account:** No vendor account is imposed on each volunteer. Named identity is distinct from commercial vendor billing. Center IdP and licensing/cost fit remain unknown.
- **Retention and roles:** Left explicit for issues, receipts, media, logs, backups, exports, cache and permissions.
- **Alternatives/adoption:** Four viable approaches are compared without a winner; synthetic rehearsal precedes any live-data step.
- **Failure-oriented validation:** Observable desired outcomes are proposed and not claimed as executed.
- **Research depth:** The investigator inspected primary product docs and one consequential CouchDB issue-to-fix/release path, including changed code and regression-test names. This is relevant repository/test history for the attachment risk. No application repository or caller implementation was supplied; no local suite was run. Alternatives are architectural comparisons, not benchmarks or operational fit studies.

## Evidence conditions and limits

CouchDB conflict behavior supports only CouchDB’s revision model; it does not prove the proposed app state machine. The attachment API couples attachment writes/deletes to the parent revision; it does not define the app’s size, cellular, resumability or cache policy. Issue #6126 is a user report; PR #6129 is implementation/test history; the 3.5.3 release note is release evidence. None is a local reproduction. PowerSync streams and backend validation require configured authorization and application code; synced data persists locally. Automerge is a merge primitive, not task workflow policy. Chrome storage behavior is Chromium-specific and cannot be generalized to all volunteer devices.

## Proposed versus executed

**Executed by investigator and independently reviewed here:** source/documentation inspection, issue inspection, merged code/test-name inspection and release-note inspection.  
**Not executed:** EUnit suite, replication reproducer, application build, mobile checks, search/privacy tests, volunteer rehearsal, accounts/invitations/deployment, or use of center records. Every adoption/failure item remains a proposal. This critic ran no software tests and wrote no final product proposal.
