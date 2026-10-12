# Independent critique — D-P04 comment anchoring and reconciliation

## Review result

The investigator draft is a strong, scope-faithful component proposal. It follows the released plan clause by clause, rejects nearest-geometry reattachment and implicit resurrection, preserves comments independently of visible layout objects, separates layout convergence from comment intent, and treats export, privacy, retention, and the unselected merge mechanism with appropriate caveats. I found no material wrong or unsupported claim among the consequential claims I checked in the primary evidence.

One material incompleteness remains: the original brief explicitly asks to discover repository callers and tests. The package identifies current Excalidraw reconciliation code and its collaboration caller, but neither the discovery nor draft nor source map identifies or characterizes a repository test. This is a gap in the delivered research, not evidence that an upstream implementation is unsuitable.

The revealed plan release is internally consistent: SHA-256 and byte counts recorded in plan-reveal.json match the read revealed-plan.md and discovery.md. The draft clearly separates proposed synthetic histories from work actually executed; no merge experiment, editor integration, permission check, export, or usability study is claimed as run.

## Findings

### C1 — Material incomplete: repository tests are not reviewed

- **Draft locators:** “Approaches and comparative evidence — Excalidraw”; “Supported findings”; “Executed in this stage”; “Brief coverage — Alternatives and maintained mechanisms.”
- **Final locator:** None; this stage reviews the draft and does not write a final proposal.
- **Evidence:** The original brief requires “repository callers/tests.” The investigator source map records R15 as reconciliation implementation and R16 as collaboration caller, but contains no test source. I independently inspected Excalidraw’s current packages/excalidraw/tests/data/reconcile.test.ts (C01). Its reconciliation suite exercises version-based local/remote selection, ordering and unique indices, concurrent convergence, and repeated reconciliation. Those tests inform the limits and invariants of the cited implementation, but they do not express review-thread identity or anchor intent. The draft’s proposed future synthetic tests are useful but are not repository-test discovery.
- **Assessment:** Materially incomplete against the explicit brief. Add a bounded account of at least the cited repository test surface and what it does and does not cover, while preserving the distinction between upstream tests and proposed component tests. This does not require selecting Excalidraw or reducing the planned research scope.

### C2 — Honestly unresolved external input: product policies remain undecided

- **Draft locators:** P1 anchor coordinate contract; P1 group thread behavior; P1 region semantics; connector endpoint disposition; P3 retention; P3 export/redaction.
- **Final locator:** None; these require product-owner input.
- **Evidence:** The draft identifies alternatives and explains their consequences, while the standards and engine documentation checked here specify data, ordering, or merge behavior rather than the intended floor-layout meaning. The released plan itself leaves membership, long-disconnected clients, exposure, and screenshot sufficiency open for investigation.
- **Assessment:** These are honestly unresolved product decisions, not critique defects: anchor scaling semantics; whether group comments remain on a tombstone, fan out, or require reassignment; fixed-area versus object-set versus explicit-region meaning; dangling connector behavior; retention/grace/membership rules; stale-client treatment; and export identity/authorship/redaction. The draft is right to expose them without deciding for the owner.

### C3 — Minor locator/reproducibility limit: mutable upstream references

- **Draft locators:** P1 identity and transformations; P2 merge behavior; source-map entries R15 and R16.
- **Final locator:** None.
- **Evidence:** The cited Excalidraw implementation and caller URLs point at mutable master and have no immutable commit identifier in the carried source record. The draft says this explicitly and treats the code as a comparison rather than a selected dependency. The inspected behavior agrees with the summarized version/nonce reconciliation and caller flow.
- **Assessment:** Minor point-in-time locator limit, not a substantive error. Preserve the mutable-branch caveat; a pinned revision is needed before implementation or a repeatable regression comparison.

### No material wrong or unsupported finding

The claims I checked are supported with the conditions the draft states:

- W3C Web Annotation models annotation bodies, targets, selectors, and states as an interchange structure and does not prescribe synchronization or transport in the data model (R01).
- Loro’s API/tutorial documents TreeIDs, create/move/delete events, subtree deletion without per-child delete events, concurrent-move cycle prevention, and fractional-index interleaving caveats; shallow snapshots trim history and constrain which peers can sync (R03–R05).
- Yjs documents the GC control; its internal notes distinguish app metadata from the library’s delete record and make content discard conditional on GC (R06–R07).
- Automerge documents concurrent alternatives and operation-ID ordering; its merge rules retain a concurrent set against a map delete, while Repo storage compaction and history compaction are separate concerns (R10–R13).
- Excalidraw’s code and caller match the draft’s account of record-version reconciliation and caller post-processing. The public reports R17 and R18 are represented as reports, not generalized guarantees; R18 was still open at this check.
- None of this evidence establishes the correct product-level comment reassignment or retention policy. The draft marks those as owner decisions.

## Coverage against the original brief and released plan

| Requirement | Draft coverage | Critic disposition |
|---|---|---|
| Shape, connector, and region comment anchors | P1 connector, point, and region clauses; disposition register | Covered; separates identity from geometric context |
| Move, group, replace, split, nested transforms, delete while disconnected | P1 identity and transformation clauses; P2 deletion, merge, and synthetic histories | Covered; mapping stops when lineage/transform evidence is ambiguous |
| Explain original target and current/unresolved location | Origin selector/context, frontier, explicit resolution states, visible unresolved list | Covered |
| Alternative identity and merge approaches; no assumed library/service | P2 CRDT, application event log, record-version reconciliation; no selection | Covered |
| Ordering, durable identity, deletion state, layout merge versus comment intent | Identity, separate resolver, ordering, tombstone dispositions | Covered |
| Retained-history storage and privacy | P3 bounded history, membership, compaction, archive, redaction | Covered; policy values remain owner input |
| Read-only export usable outside the group | Versioned geometry plus thread/reply/context bundle and image; screenshot alone rejected | Covered; export/redaction policy remains owner input |
| Avoid nearest-coordinate resolution, silent resurrection, lost invisible comments | Explicit prohibitions and unresolved states | Covered |
| Automatic behavior versus user decision | Safe identity-preserving transforms versus explicit candidates/reassignment | Covered |
| Proposed tests versus executed experiments, permissions, usability | Proposed histories and explicit no-execution record | Covered and clearly distinguished |
| Repository callers and tests | Caller and implementation discussed; test suite not identified | **Materially incomplete (C1)** |
| Public regression history | Excalidraw #3795/#11933 and Yjs #741 caveated by evidence type | Covered; no claim that the reports prove a general defect |

## Validation and limits

I read the full brief, discovery, draft, source map, released plan, plan-release record, and carried source index after native Goal activation. I independently checked the primary sources listed in critic source-map.json and the additional upstream test file C01. The plan-release helper’s recorded hashes were verified against the released files. I did not run any merge or synthetic-history experiment, downloaded code, editor, account, access-control test, or usability study. The test file was inspected as research evidence; no test command was run.

The critique is not a repaired final. The complete critique and independent source map are saved in this stage before native Goal completion.
