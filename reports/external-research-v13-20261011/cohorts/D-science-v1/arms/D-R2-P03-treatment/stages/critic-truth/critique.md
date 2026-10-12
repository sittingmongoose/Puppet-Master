# Complementary truth critique — D-R2-P03-treatment

**Stage:** critic-truth · **Reviewed:** 2026-10-12 UTC  
**Scope read:** the assigned brief, full investigator discovery and draft, released plan, plan-release metadata, investigator source map, and source index. The released plan SHA-256 in plan-reveal.json is ab4e366c681798f8e7de0480f19a8cce2bad747ed2be59608d3e0fee99174493. Primary pages independently opened are CT01–CT05 in this critic's source-map.json. This is a truth/applicability review, not a replacement final plan. No code, application test, or synthetic trace was run by this critic.

## Finding requiring revision

### Paragraph 1: post-merge rule-check timing — narrow the rejection

The draft rejects checking after merge on the ground that the resulting invalid state could already be read, exported, approved, or used. That risk is real **if “merge” commits the combined values as an accepted/current schedule**. The released plan does not say whether its merge result is authoritative, provisional, or blocked pending coordinator review. It proposes marking overlaps for review. So the current evidence does not support rejecting every post-merge check or requiring the rule engine to run before every draft write.

Revise the disposition to **conditional revise**: a checker may run after a merge into a staged/pending candidate, provided an unresolved result cannot become the accepted schedule, receive approval, advance the current-publication pointer, or feed downstream consumers as valid. Require authoritative validation atomically with server acceptance when the merge operation writes accepted state, and revalidate the exact candidate at the approval/publication boundary. Preserve invalid proposals and their bases for review/rebase. This distinction protects the brief's offline editing and human-resolution requirements without treating a fieldwise merge as proof of validity. It also avoids forcing a particular synchronous-write architecture.

The technical boundary is supported: PowerSync permits immediate local writes and sends queued operations to an app-owned backend that decides how they are applied; the backend may implement business-rule validation (CT01–CT02). PostgreSQL CHECK cannot guarantee cross-row rules; EXCLUDE applies only to selected expressions/operators, while serializable execution can abort and requires retry handling (CT03–CT04). The draft's conditional PostgreSQL examples and need for retry are accurate.

## Important implementation clarification

### Rejected upload versus retained proposal

The draft correctly says that an invalid/stale command must remain visible as a conflict proposal and that PowerSync delivery may repeat. It should additionally specify how the local upload queue reaches a terminal handled state after the backend records a durable rejection. In the PowerSync example, the client calls transaction.complete() after the backend HTTP response; the backend must be idempotent because an operation may be delivered more than once (CT01–CT02). If the app merely returns an error while leaving the rejected CRUD queued, the same invalid operation may be retried indefinitely; if it completes before durably recording the conflict, the proposal could be lost.

Recommend: persist the rejected command and its reason/base version idempotently, return a documented handled outcome, then complete/resolve the local queue item according to the selected SDK contract while retaining the user proposal in conflict storage/UI. Test this against the exact SDK/version. Treat the command UUID as the business-command identity; do not assume a per-client CRUD operation ID or transaction grouping alone represents one multi-row swap.

## Disposition audit

- **Stable IDs and request identity — keep, extend.** The proposed business command UUID, actor, base version, affected records, and explicit multi-row boundary preserve intent. PowerSync documents a per-client incrementing operation ID for deduplication; that is useful transport identity, not automatically a stable domain-command ID for a swap spanning several CRUD rows (CT01–CT02).
- **Per-field timestamps — reject as the roster-wide conflict policy, retain for eligible independent fields.** PowerSync documents per-field LWW as allowing different-field edits to coexist, while timestamps can drift; server sequence/version checks avoid clock drift but reject even disjoint edits on a changed row (CT02). The draft properly keeps safe descriptive-field merging as an option. Ensure it does not imply that every same-field write must be dropped: where preserving intent matters, store both values as a resolvable conflict.
- **Qualification, overlap and dependency rules — keep with the timing qualification above.** CHECK cross-row claims, exclusion-constraint limits, and serializable retry language are correctly qualified (CT03–CT04). Do not present an exclusion constraint as a complete qualification/dependency engine.
- **Approval — keep the version-scoped server-owned record; preserve the stated owner choice.** The exact revision/content hash is a conservative default. The draft correctly leaves the protected projection and metadata-only invalidation to the center, rather than claiming every field must invalidate approval. PostgreSQL RLS is disabled by default; when enabled, no policy means default deny, while owners normally bypass (CT05). The draft correctly separates sync filtering, endpoint authorization, and database roles.
- **Publication and consumers — keep.** Immutable publication IDs/snapshots, a version-pinned request/export/notification record, and an outbox plus honest external-delivery state address the brief. Keep idempotent retry/correction behavior conditional on provider capabilities; do not imply the database transaction makes external delivery atomic or recallable.
- **Stale/cancelled/superseded swap requests — keep explicit rebase and terminal state handling.** The draft preserves the worker's original publication reference and correctly makes acceptance after unrelated changes conditional on a center-owned boundary. A rebase should create a linked new command, not rewrite the worker's original intent.
- **Alternatives and validation status — no material truth correction found.** PowerSync is not presented as selected; platform, backend, hosting, identity, retention and budget remain open. PostgreSQL mechanisms are conditional. CouchDB/CRDT comments are bounded as alternatives. The proposed traces are clearly separated from executed tests, and the draft reports no synthetic/application/permission/multi-client/organizational test as executed. Keep the historical SDK repair claims version-scoped as already written.

## Required amendment for the reviser

1. Change the paragraph-1 rule-check disposition from categorical rejection of post-merge checking to the staged-candidate/accepted-state distinction above.
2. Add the PowerSync durable-rejection/queue-completion lifecycle and distinguish business command identity from queued CRUD identity.
3. Preserve the rest of the plan's offline intent, conflict visibility, manual rebase, approval scope, immutable publication and consumer-version obligations. Do not elevate illustrative technology options into owner decisions.

**Reviewer execution record:** primary documentation read directly; no executable witness or tests run. All checks in the investigator draft remain proposed unless that draft explicitly labels them as observed research/process actions.
