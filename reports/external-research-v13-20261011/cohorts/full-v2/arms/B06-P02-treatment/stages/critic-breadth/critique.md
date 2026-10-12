# Independent breadth critique — B06-P02-treatment

**Stage:** critic-breadth  
**Role:** complementary breadth review  
**Inputs:** assigned brief S00; investigator discovery, draft, source-map and source index; helper-released plan and plan-reveal record. The release record binds this review to discovery SHA-256 `80adb1ee7e89410453bd9d432b2e640cef8c6c2d7b6043c782ce5a775c60f3cf` and plan SHA-256 `4d4a3d4670c5811c0d5b1d3be02cc22c7326402e0f2d118c6715c1f287cc9881`. The discovery was frozen at release.

## Overall assessment

The investigator package has unusually broad coverage for the released plan. The disposition table touches every material plan clause, separates accept/correct/reject/owner-decision outcomes, and carries those choices into a concrete user flow, architecture comparison, photo lifecycle, staged adoption sequence, and proposed failure matrix. It preserves the brief's hard constraints: a read receipt is distinct from resolution; stale offline writes cannot silently reopen an issue; contact data is excluded from search and result metadata; no per-volunteer commercial account is assumed; retention and role policy remain open; and no real invitations, accounts, deployment, or records are proposed. No validation result is claimed as executed.

I found no missing whole brief obligation that requires a new architecture direction. The following are material opportunities for the fresh reviser to tighten breadth without changing the proposal into an implementation or prematurely deciding owner policies.

## Findings

### 1. Make shared-access alternatives a visible comparison — medium priority

The brief explicitly asks to compare “synchronization and shared-access alternatives.” The package gives a clear comparison of four synchronization/data approaches (relational + local SQLite/queued writes; PouchDB/CouchDB; Automerge; custom API/outbox). It discusses center-managed identity, individually attributable codes, aliases and workshop invitation codes, but those access choices are distributed through prose and remain less directly compared than the sync choices.

The reviser should add a short options matrix, with no selected winner, for at least: (a) center-managed per-volunteer app identities without personal vendor subscriptions, (b) shift-scoped pseudonymous aliases, and (c) shared station/session access. Compare attribution of edits and read receipts, revocation/offboarding, what an offline device can retain after removal, operational burden for roughly 30 rotating volunteers, and any seat/usage fee exposure. Mark each option’s access and retention policy as requiring owner approval. This addresses the explicit comparison request and helps avoid treating “no commercial account per volunteer” as if it alone answered the identity lifecycle.

Grounding: the CouchDB database security API illustrates why the access boundary is implementation-specific: a member can read all database documents and write ordinary documents, while an empty membership configuration has broad default behavior in the documented case (C03). This supports retaining a per-record/search authorization question; it does not decide which identity model this center should use.

### 2. Keep the handover/shift model as visible as the issue model — medium priority

The brief is about a shared handover system spanning shifts and requests reading recent handovers, task/location updates, equipment problems, and a leader’s “what changed / what still needs attention” summary. Discovery explicitly proposes separate handover, task, location-note, issue, transition, claim-attempt, receipt, and attachment concepts. The final proposal names those entities and sketches a shift-start summary, but most detailed disposition and validation language centers on issue state and claims.

For a more complete end-to-end scope, define the handover/shift boundary at proposal level: which accepted events appear in “changed since last handover,” how unresolved items carry forward, how a task differs from an equipment issue, and how a location note relates to either. Keep this conceptual rather than specifying a schema. Add one acceptance scenario that spans two consecutive shifts and verifies a new location note, task status/claim, resolved issue, and still-open issue appear in the right summary sections. The existing distinction between summary and unresolved list is a strong base; the gap is continuity across the handover boundary.

### 3. Separate evidence-backed attachment behavior from proposed privacy policy — low priority

The photo section is operationally useful: text-first save, explicit attach action, size/progress states, retry/cancel, local and remote deletion, and an honest warning about other offline copies and backups. The cited SDK attachment sources (S03–S04, S18) concern integration status and storage callbacks, and the browser storage source (S14) supports durability caveats. They do not establish that a particular resize/metadata-removal choice is safe, sufficient, or available on every target platform.

Keep resize, EXIF/location stripping, Wi-Fi default, consent and deletion propagation explicitly labeled as proposed product policy to validate on supported devices and storage services. Add a source specifically covering image metadata/privacy or a narrowly scoped validation question if the final proposal presents those details as evidence-derived. Do not imply that an attachment helper guarantees global erasure or unlimited-data protection.

## Clause and mechanism coverage

- **Recent handovers and leader summary:** present in discovery and the proposed shift-start screen; strengthen cross-shift carry-forward as above.
- **Offline drafts and unreliable reception:** local drafts, pending/synced/rejected/review states, foreground retry, and background scheduling caveats are represented. Browser eviction and native/device behavior are correctly framed as validation risks.
- **Concurrent task claims:** provisional offline requests, retained attempts, canonical server arbitration, visible review for the other claimant, and reconnect-order/retry tests are present. Preserve the distinction between a task and an equipment issue when revising.
- **Read acknowledgment vs issue resolution:** separate receipt state and an explicit independence check are present; the no-score constraint is preserved.
- **Stale resolution/reopening:** current-generation preconditions and explicit reopen are present, with stale replay and intentional reopen in the matrix.
- **Older-issue search and contact privacy:** a bounded history cache and server/offline filtering are covered. The matrix appropriately includes snippets, suggestions, counts, pagination, and offline results, rather than checking only a title field.
- **Optional sensitive photos and constrained data:** text-first use, explicit action, mobile-data confirmation, cancellation, retries, cache/remote deletion, and unresolved retention are covered; preserve caveats from finding 3.
- **Thirty rotating volunteers and account constraint:** synthetic scale exercise, center-owned workspace, and identity alternatives are mentioned. The access comparison would make operational burden, attribution, revocation, and potential seat costs easier to judge.
- **Alternatives, adoption, and validation:** four sync approaches and a staged synthetic-to-policy-to-pilot sequence are compared. The plan corrects the draft’s potentially premature “one shift” adoption wording by placing real pilot use after owner decisions. Proposed checks remain distinct from executed work.

## Source and method notes

I independently opened the primary pages recorded as C01–C04 for the conflict, replication, access-scope, and CRDT comparison claims. The full indexed investigator source set remains S00–S19 in the investigator source-map; this critic map adds separately labeled C IDs and links each to its upstream ID, so the original IDs are preserved without reassignment. Claims about identity choices, attachment privacy defaults, and the local handover workflow are recommendations or open policy questions, not conclusions established by these four technical pages.

This is a breadth review, not a second validation run. I did not run an implementation, device test, repository build, account flow, or live-data workflow. The validation matrix remains proposed work.
