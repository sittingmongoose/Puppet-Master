# Investigator draft — D-P04 comment anchoring and reconciliation

**Status:** source-backed component proposal for review; no editor implementation and no merge experiment executed. The exact plan was revealed at 2026-10-12T04:25:54.802Z after `discovery.md` was hashed. This draft uses only that released copy and the original brief. It does not update discovery.

## Decision summary

Keep layout convergence and review intent as two related, separately inspectable records. Give every shape, connector, group, thread, and region a persistent application identity that is created once and never inferred from geometry. Store each thread’s original target, local selector, creation frontier, minimal context, and resolution history. Derive a current display position only from explicit identity-preserving operations. Represent deletion with a visible tombstone and preserve the thread independently. A stale edit may create a conflict candidate, but it must not make a deliberately deleted object visible again without an explicit, announced restore decision. A region rectangle and screenshot are useful context; neither proves target identity.

The plan’s persistent IDs, connector endpoint references, child-ID retention across grouping, and operation-log direction are sound starting points. Its offset, region fallback, implicit resurrection, acknowledgement-based retention, and export assumptions need added conditions or an owner decision, as detailed below. No CRDT, hosted service, or merge library is selected.

## Clause-by-clause disposition of the released plan

### P1 — Persistent shape identifiers

**Disposition — accept, with identity lifecycle rules.** The plan correctly gives each shape a persistent identifier. Make it an opaque, document-scoped ID assigned at creation, immutable across move, resize, style change, group membership, and import of the same object. Never recycle it after deletion. A pasted duplicate or replacement gets a new ID; a restore operation that is intended to recover the original object must explicitly name its prior ID and provenance. Do not derive identity from bounds, labels, visual hash, array index, z-order, or a CRDT operation ID. Loro’s `TreeID` and Automerge’s internal object/operation identities are useful engine-level references, but product identity should remain explicit in the application schema ([R03](https://loro.dev/docs/api/js), [R10](https://automerge.org/docs/reference/documents/conflicts/)).

Excalidraw’s closed import regression is directly relevant: its issue report describes importing an old file after deleting an element, reusing the same ID and lower version, and then having save/sync treat the import as a no-op. The issue is closed with linked PR #3797, but this research did not retrieve the patch or confirm the exact fix ([R17](https://github.com/excalidraw/excalidraw/issues/3795)). Treat imports as explicit `restore`, `copy`, or `replace` operations; do not silently choose one based on matching geometry.

### P1 — Connector endpoints stored by identifiers

**Disposition — accept.** Store a connector’s own persistent ID plus source/target object IDs and, when relevant, endpoint selectors in each endpoint’s local coordinate frame. A connector’s geometric route may change while its endpoints retain meaning. If a referenced endpoint is deleted, retain the connector record as dangling/unresolved or show a specific repair choice; do not bind it to the nearest visible shape. If an endpoint object is replaced, expose the replacement as a candidate only when an explicit `replaces` relation exists. Whether a connector should be deleted automatically when either endpoint is deleted is an **owner decision**; no source establishes the desired floor-layout behavior.

### P1 — Anchor as object identifier plus offset within bounds

**Disposition — accept the stable target, revise the offset contract.** For point comments, persist the original object ID, anchor type, local selector, and creation frontier. A normalized local point `(u,v)` or a shape-specific selector can be transformed through known move/resize/rotation/group operations. Retain the original selector and a small origin context so an author can compare “where I placed this” with “where it appears now.” Current display geometry is derived state, not the anchor’s identity.

A single scalar/pixel offset is not enough for nested transforms, rotation, nonuniform resize, connector bending, flip, or clipping. Define a transform chain and its order; include a version/frontier for every computed mapping. If a remote operation set has competing transforms or the chain is incomplete, preserve the original target and show an unresolved/conflict state. Do not synthesize a replacement anchor from proximity. Excalidraw illustrates how a record-version/nonce policy can select one copy deterministically, and its current code retains local records absent from the remote array; neither behavior defines comment intent ([R15](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/data/reconcile.ts), [R16](https://github.com/excalidraw/excalidraw/blob/master/excalidraw-app/collab/Collab.tsx)).

**Owner decision:** for an anchor inside a resized object, should the selected point scale with the object, retain a fixed physical/board distance, or remain attached to a semantic subfeature? The system can preserve the original choice and explain transformations, but research cannot decide what reviewers intend.

### P1 — Grouping retains child identifiers; move/resize transforms the offset

**Disposition — accept with typed group identity and composition rules.** Grouping should create a new persistent group ID and a membership event while keeping each child’s original ID. A thread targeting a child remains a child-targeted thread; the renderer composes child-local and ancestor transforms to place its marker. A thread explicitly created on the group targets the group ID. Ungrouping removes or tombstones the group container but does not rewrite child identities or silently retarget group comments to one child.

For nested groups, store parent/membership and transform events with causal references; compose outer-to-inner (and inverse when mapping back) using the transform order defined by the data schema. If a parent is replaced or deleted, a group-level anchor may become unresolved even when a child survives. A region/comment spanning several children may map to multiple candidates after split/ungroup; preserve the thread and ask the reviewer which scope they meant. Loro’s tree API emits create/move/delete events with old/new parent and index; a subtree delete is reported as one event, so an application needing per-child explanation must enumerate the affected stable IDs or maintain its own anchor map ([R03](https://loro.dev/docs/api/js), [R04](https://loro.dev/docs/tutorial/tree)).

**Owner decision:** should a group-level review thread remain on the group tombstone after ungrouping, fan out to children, or require explicit reassignment? Fan-out can duplicate review intent and must not happen implicitly.

### P1 — Region comment rectangle as fallback

**Disposition — retain as captured context, reject as identity fallback.** A rectangle can preserve what was selected at creation and aid a reviewer when the referenced target is missing. It should carry a coordinate frame and layout frontier, plus the actual selector geometry (rectangle/polygon as supported) and, if available, the IDs of objects intersected at creation. Zoom-independent board coordinates are preferable to screen coordinates. A region is either a durable region object with its own ID or a versioned spatial selection; the schema must say which.

When a region’s geometry changes, move it only by an explicit region move or defined transform. When its old area later contains different objects, do not infer that the region comment now refers to them. If the region was intended to track a set of objects, use explicit membership/lineage. If it meant a spot on the floor, preserve the old board-space selection and mark it stale or unresolved after layout change. W3C Web Annotation supports a target plus a SpecificResource/selector and captured state for portable description, but does not define how that selector follows a mutable collaborative layout ([R01](https://www.w3.org/TR/annotation-model/)).

**Owner decision:** choose whether a region means fixed board area, a live object-set query, or an explicit region object. This choice determines what “move” means and cannot be settled by merge research.

### P1 — Replacement, split, nested transforms, and deletion

**Disposition — require explicit lineage; never equate appearance with identity.** Replacing a shape creates a new ID and an optional `replaces` edge to the old ID. Preserve the old target and show the replacement as a user-selectable candidate. A split creates multiple new IDs and an explicit `splitFrom` relation; a merger creates a new ID with multiple `derivedFrom` parents. These relations explain history but do not automatically move comments. The user may reassign a thread to one or more successors after seeing the original context.

For unchanged IDs, deterministic transform mapping can update display location automatically. For a replacement, split, merge, missing operation, or competing transform, automatic mapping ends and the thread becomes `replacement-candidate` or `ambiguous`. Excalidraw’s import regression demonstrates why matching by old ID plus stale revision can suppress an intended replacement; an open Excalidraw issue reports a different remote-normalization/version interaction, but is not maintainer-confirmed and was not executed here ([R17](https://github.com/excalidraw/excalidraw/issues/3795), [R18](https://github.com/excalidraw/excalidraw/issues/11933)).

### P2 — Disconnected operation log and merge behavior

**Disposition — keep the operation log as an option, distinguish its guarantees.** An operation log can preserve who changed which ID, at what causal frontier, and how it was interpreted. It still needs rules for concurrent edits, replay, ordering, duplicate delivery, stale imports, and history truncation. Compare:

1. **Operation-based CRDT.** Loro provides movable lists/trees and tree IDs, with cycle prevention on concurrent moves; its tree documentation warns that fractional indexing can interleave. Yjs offers shared types and incremental updates, with deletion-content retention controlled by GC. Automerge preserves merge history and exposes conflicts, while its Repo layer handles storage and safe concurrent compaction ([R02–R08], [R10–R14]). These support disconnected convergence, but their deterministic winner/delete rules do not decide whether an old review thread should move, disappear, or be reassigned.
2. **Application event log with explicit conditional resolution.** Keep durable domain events such as `ShapeCreated`, `Moved`, `Grouped`, `Replaced`, `Deleted`, `ThreadCreated`, and `AnchorReassigned`. On reconnect, merge independent changes automatically and turn incompatible same-target operations into explicit conflict records. This gives the application control of intent/provenance but requires implementing and testing conflict detection, ordering, idempotence, and storage. It can be backed by a local-first CRDT or a service; neither is assumed.
3. **Record-version reconciliation.** A caller can select a versioned record per ID and deterministically break ties. This is simpler, but edits to one object can conflict, absent records need deletion semantics, repair operations must not masquerade as user edits, and a winner is not proof of intent. Excalidraw’s `reconcileElements` is a concrete example with ID, version, and nonce comparison; the upstream caller also passes deleted records through its merge path ([R15–R16]).

For all options, represent order (z-order and sibling order) independently from identity. Give inserted objects stable IDs and a deterministic order key or move operation. A missing object in one snapshot is not deletion unless the protocol says so. Test ordering under concurrent insert/move and verify that order-repair steps do not alter user-edit recency. Loro’s fractional-index caveat and Excalidraw’s reported remote index-healing issue make this a concrete integration risk, not an abstract concern ([R03], [R18]).

### P2 — Deletion marks object unavailable and preserves last geometry

**Disposition — accept the tombstone and context; revise implicit restoration.** A delete event should make the object unavailable in the current layout, while retaining the smallest authorized tombstone needed to explain comments: object ID, deletion frontier, reason/status, and optionally author/time. Preserve last-known geometry or a redacted anchor summary while retention allows. Keep the comment thread and replies in their own records, even when the object cannot render.

A later stale or concurrent edit that references the deleted ID must **not** make the object visible automatically. Save its payload as a conflict candidate attached to the tombstone; show “this object was deleted; a later edit refers to it” with both the deletion and edit context. A deliberate restore/undo is a separate explicit event that names the restored ID, the actor, and the operation it reverses, with user-visible notice. The system may automate this only when causality and a user-authored undo action are unambiguous. A technical merge winner or update timestamp does not establish such intent. This corrects the released plan’s proposed “later edit restores it as a conflicted object” because it violates the brief’s no-silent-resurrection constraint.

Concurrent thread creation and delete should converge to: deleted layout object, retained review thread, unresolved anchor with last-known context. If the author intended to point to a replacement, require an explicit reassignment. Yjs’ internal notes state that built-in deletion metadata does not identify who or when deleted content and that GC can discard the content; Automerge documents a map delete/concurrent set rule under which the set value can remain. Both demonstrate why app-level deletion state and thread preservation cannot be delegated to an engine default ([R07], [R11]).

### P2 — Alternative: explicit unresolved state and user-directed reassignment

**Disposition — adopt.** Use a small state machine, persisted with each thread/anchor, for example:

- `attached`: target ID exists and mapping is valid.
- `transformed`: same target ID remains and a known operation chain moved the display anchor.
- `grouped`: target remains a child and current position is shown through known group transforms.
- `deleted-unresolved`: target has a tombstone; thread remains visible in a review list and is not attached to another object.
- `replacement-candidate` / `ambiguous`: one or more explicit lineage candidates exist; no candidate wins automatically.
- `reassigned`: a user selected a new target; record old/new IDs, actor, time, and causal frontier.

The state must be understandable to the comment author, and the UI should show both the original target and why the current marker is displaced or unresolved. When multiple edits are concurrent, preserve the alternatives needed to explain the conflict; do not silently collapse them to a coordinate winner. A close/resolve action on the review thread is distinct from anchor resolution.

### P3 — Retain old geometry until all participants acknowledge deletion

**Disposition — reject as an unbounded retention rule; keep acknowledgement as one input.** “All participants” needs a defined roster, membership epoch, client revocation rule, and policy for users who stay offline indefinitely or devices no longer controlled by the team. Waiting forever creates unbounded geometry retention; deleting immediately can leave a returning client with stale references. Acknowledgements should help choose a safe compaction frontier, but do not by themselves define a privacy deadline.

Propose a policy with owner-selected values: active membership epoch; maximum offline grace period; minimum retention period for unresolved review context; post-grace rebase behavior for stale clients; explicit archive/export rules; and deletion/redaction workflow for replicas and server backups. A stale client beyond the accepted frontier should download the current snapshot and submit local edits as conflict candidates against tombstones; it must not replay them as silent object resurrection. Keep raw history only as long as review/undo/support needs justify it. After compaction, retain a minimal anchor summary (stable ID, original selector/frame, last-known context if permitted, deletion/replacement state, and thread reference) rather than complete object history.

The data/performance tradeoff is real: Loro shallow snapshots trim history and may reduce exported size, but peers before the cutoff can no longer sync; its documentation requires distributing the sanitized version. Automerge history compaction can purge sensitive edits, but a replica without a common ancestor may no longer sync. Yjs GC removes deleted content, while an open upstream report describes substantial memory growth for a deletion-heavy v13.6.27 document; that report is not a universal benchmark ([R05], [R07–R09], [R13]).

**Owner decisions:** retention/grace durations; which users/devices count in the roster; whether closed threads preserve a summary; what geometry/author data can be archived; and what to do with an offline device after revocation. These are privacy and product policy choices.

### P3 — Read-only export includes current geometry, comment text, screenshot, unresolved targets

**Disposition — accept the read-only package; expand the unresolved context; screenshot is supplemental.** Generate a versioned snapshot bundle that contains:

- immutable exported layout geometry and ordering at a named frontier/version;
- every included thread and reply, authorship/timestamps where export policy allows, and a stable thread ID;
- target kind and stable object/connector/region ID, original selector/frame, current status, last-known target context, and any explicit replacement/reassignment lineage;
- an explanation for every unresolved anchor and a visible unresolved-thread list that includes threads with no current target object;
- a rendered screenshot or vector image for quick reading, clearly tied to the same snapshot version; and
- schema version and export/redaction metadata, so a recipient can interpret the package offline without an editing account.

A screenshot alone is not sufficient: it cannot encode thread replies, stable IDs, a precise selector, the original target, why the anchor is unresolved, or whether two visually identical shapes are distinct. Pair it with machine-readable context and a human-readable list/legend. W3C Web Annotation’s body/target/selector/state model is a useful base for portability, but it does not provide layout merge or selector-following semantics ([R01]). Because the recipient is outside the editing group, export should minimize personal and floor-plan data, disclose redactions, and never silently omit unresolved threads. **Owner decision:** which author identities, replies, deleted geometry, and floor-plan details may be exported, and whether the snapshot defaults to redaction.

## Explicit disposition register

| Concern | Disposition | Conditions / owner input |
|---|---|---|
| Identity | Immutable application ID per object incarnation; keep through geometry and grouping changes; create new ID for replacement/copy. | Owner chooses restore/import semantics; no identity by visual similarity. |
| Connector endpoints | Store endpoint object IDs and endpoint selectors; preserve connector’s own ID. | Owner decides if dangling connector remains visible or is deleted. |
| Point coordinates | Use a selector in a declared local frame plus origin frontier and transform chain; preserve original anchor. | Owner decides semantic feature vs proportional point vs fixed board offset. |
| Region fallback | Keep original rectangle/polygon and frame as context; do not use nearest geometry to attach. | Owner chooses fixed region, live object-set, or explicit region object. |
| Group/replacement/split | Keep child IDs; group has its own ID; explicit lineage and transform composition. | Group-target and split/merge thread reassignment needs user decision unless an unambiguous user action names the new target. |
| Deletion | Tombstone + visible unresolved thread; stale edits become candidates. | Explicit announced restore is allowed; automatic resurrection is rejected. |
| Merge | Engine converges layout operations; a separate resolver records comment intent and conflicts. | Library/service not selected. Preserve conflict alternatives and operation provenance. |
| Ordering | Store z-order/sibling order separately from identity; make merge and repair deterministic. | Test concurrent moves and import/repair; absence alone is not deletion. |
| History | Bound full history; retain minimal context under a documented retention and compaction policy. | Membership, grace periods, archives, redaction, and stale-client rebase require owner policy. |
| Export | Read-only, self-contained snapshot with geometry, threads, original/current anchors, unresolved reasons, version/frontier, and image. | Screenshot alone rejected as insufficient; owner decides redaction/identity fields. |

## Supported findings, assumptions, and uncertainties

**Supported by primary source/code evidence:**

- W3C Web Annotation is an interoperable body/target/selector/state model, not a transport or sync protocol ([R01]).
- Loro’s maintained docs expose tree IDs, move/delete state, and explicit tree diffs; they note cycle prevention and fractional-index ordering caveats ([R02–R05]).
- Yjs offers a GC switch; its internal documentation says deletion metadata lacks author/time and content is discarded when GC applies ([R06–R08]).
- Automerge exposes concurrent conflict values and specifies distinct map/list merge rules; Repo storage compaction and core history compaction have separate behaviors and tradeoffs ([R10–R14]).
- The inspected Excalidraw code matches by ID/version/nonce, and its collaboration caller feeds deleted elements through reconciliation ([R15–R16]).

**Public reports, not generalized or independently verified here:**

- Excalidraw #3795 documents a closed import/version regression and links PR #3797. The issue text is evidence of the failure mode, not a reviewed description of the final patch ([R17]).
- Excalidraw #11933 is an open reporter issue claiming remote index healing inflates version metadata and can discard a genuine peer edit; it reports a reproducible sandbox and package version 0.18.1. I did not run that sandbox or verify the alleged production occurrence ([R18]).
- Yjs #741 is an open reporter issue describing memory use with many deleted structs on v13.6.27. Treat the figures as that report’s environment, not a general result ([R09]).

**Inferences and unresolved product questions:**

- From these sources, I infer that durable review intent should be application data independent from whichever CRDT maintains layout convergence. The libraries do not prescribe how to resolve comments after semantic replacement.
- Region semantics, nested-transform behavior, group-target behavior on ungroup, automatic endpoint repair, authorship visibility, retention duration, and stale-client eligibility cannot be decided from these sources. They are explicit owner decisions above.
- No library’s release docs prove performance, correctness, privacy compliance, or suitability for the target product. Pin a candidate version and run the proposed histories before choosing it.

## Validation plan and execution record

### Proposed synthetic histories — not executed

1. Create a base board with shape A, connector A→B, a point thread on A, and a region thread. Clone the base on two offline clients.
2. Move/resize A on one client while the other replies to the point thread. Deliver operations in both orders and with duplicates. Verify same object/thread IDs, correct declared transform, no reply loss, and identical converged result.
3. Group A/B, move nested groups, then ungroup on another replica. Verify child IDs and child-thread scopes survive; group-thread and region-thread mappings either follow explicit transforms or become unresolved rather than fan out silently.
4. Delete A on one client while the other moves A or posts a reply. Verify A remains unavailable, thread/reply remains visible as `deleted-unresolved`, and stale edit is shown as a candidate. Then exercise a separate explicit restore and verify it produces a notice and provenance.
5. Replace A with a visually identical shape under a new ID; test copy/import/restore separately. Verify old threads remain on A’s lineage and no nearest-coordinate or same-geometry rebind occurs.
6. Split/merge shapes with explicit lineage; verify a thread spanning more than one successor asks for reassignment and never clones comments automatically.
7. Reconnect a delayed client after membership epoch/compaction. Verify the client rebases to the new snapshot, old operations remain conflict candidates, and no acknowledged deletion is silently undone.
8. Compact and export a history with resolved and unresolved threads. Verify all intended threads and unresolved context are present; screenshot/vector and JSON context describe the same frontier; redaction removes selected content from the delivered package. Profile storage and memory over synthetic operation/tombstone counts.
9. Permute same-target edit/delete/move ordering and run property-level convergence assertions for each candidate merge mechanism. Separately test z-order, fractional-index repairs, repeated remote applies, and import/version handling.

### Executed in this stage

- Read the original brief and input map after Goal activation.
- Read primary source documentation, current repository code/callers, release history, and public issues listed in `source-map.json`.
- Saved independent discovery and `source-map.json`; ran the exact plan-release helper once, which recorded the discovery SHA-256 and revealed `revealed-plan.md`; read that released plan.
- **No executable merge experiment or synthetic history was run.** No live editor, account, permission check, export implementation, usability study, or access-control validation was run. Proposed tests above are future work, not results.

## Brief coverage

| Original brief obligation | Draft coverage |
|---|---|
| Comments on shapes, connectors, selected regions | P1 connector, point, region clauses; disposition register |
| Move/group/replace/delete while disconnected | P1 transformation/lineage; P2 deletion and merge clauses; test cases 2–6 |
| Understand original target and reason for new/unresolved location | Identity lifecycle; explicit state machine; origin context and explanation |
| Alternatives and maintained mechanisms; do not assume a library/service | P2 compares CRDT, application event log, version reconciliation; no selection |
| Ordering, durable identities, tombstones, merge vs comment intent | P1 identity; P2 ordering, tombstone, separate intent resolver |
| Storage growth/privacy | P3 retention, compaction, redaction, stale-client policy |
| Export context including unresolved anchors | P3 full package contents and screenshot limitation |
| No nearest-coordinate resolution, silent resurrection, or lost invisible comments | P1 region; P2 deletion; visible unresolved state |
| Automatic behavior vs user decision | Each clause defines automation boundary and owner decisions |
| Synthetic tests vs executed merge experiments, permission and usability | Validation plan and execution record explicitly separates them |
