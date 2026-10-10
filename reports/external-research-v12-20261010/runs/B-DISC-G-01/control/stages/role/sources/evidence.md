# Bounded source evidence

Retrieval window: 2026-10-10 04:50:41–04:51:39 UTC. Operation: web search followed by opening official project documentation pages. The notes below paraphrase the specific source claims; locators are line numbers from the opened pages. Source version is marked UNKNOWN where the page did not expose one.

## S1 — Automerge text
URL: https://automerge.org/docs/reference/documents/text/
Version: UNKNOWN (unversioned docs page; copyright © 2026 Automerge contributors). Locator: “Text,” lines 58–61, 91–100, 146.
Evidence: The docs say collaborative strings should be modified with splice operations; their forked-document example combines a concurrent insertion with a replacement that deletes earlier text. `updateText` derives splice operations from a whole new string, but the docs warn that large changes between calls merge poorly and recommend frequent updates. This is documented library behavior, not a test of this product’s exact editing adapter.

## S2 — Automerge conflicts
URL: https://automerge.org/docs/reference/documents/conflicts/
Version: UNKNOWN (unversioned docs page; © 2026 contributors). Locator: “What is a Conflict?”, lines 60–65, 92–112.
Evidence: Concurrent list/text insertions and deletions are preserved, and same-position inserts receive a consistent ordering. For concurrent writes to the same property/index, one value is exposed deterministically while other values remain available through conflict inspection; the stated ordering uses operation IDs, not wall-clock time. Applicability is strongest for sequence text operations; scalar conflict behavior should not be mistaken for a whole-note resolution policy.

## S3 — Automerge concepts
URL: https://automerge.org/docs/reference/concepts/
Version: UNKNOWN (unversioned docs page; © 2026 contributors). Locator: “Documents,” “Repositories,” “Sync Protocol,” and “Storage Format,” lines 67–77, 91–97.
Evidence: A document retains a commit-like change history; repositories manage peers and local storage, and the sync protocol is transport-agnostic. The binary format is described as compact enough to retain every edit in a large text document; the repository layer compresses documents with concurrent reads/writes in mind. The page gives no byte ceiling or retention/pruning guarantee for this note size.

## S4 — Yjs document updates
URL: https://docs.yjs.dev/api/document-updates
Version: UNKNOWN (unversioned docs page). Locator: lines 1–15, 20–29, 70–83, 139–165.
Evidence: Updates are documented as commutative, associative, and idempotent; state vectors support exchanging missing differences. The update-only merge path removes duplicate information but explicitly does not garbage-collect deleted content; loading into a Y.Doc is required to reduce document size. This supports offline update exchange conceptually, but no local implementation or size measurement was made.

## S5 — ShareDB introduction
URL: https://share.github.io/sharedb/
Version: UNKNOWN (unversioned docs page). Locator: “Introduction” and “Features,” lines 35–52.
Evidence: ShareDB describes a coordinating/committing server and client, OT-based conflict management delegated to type plugins, offline change syncing upon reconnection, and access to historic document versions. These are feature claims; the page gives no offline queue limit or plain-text undo contract.

## S6 — ShareDB OT types
URL: https://share.github.io/sharedb/types/
Version: UNKNOWN (unversioned docs page). Locator: “OT Types,” lines 42–50, 52–75.
Evidence: ShareDB supplies operation machinery but not the transform implementation; an OT type supplies it. `json0` is the default, and other types must be registered on both client and server. A rich-text type is shown as an example. Selection and validation of a plain-text-compatible type remain open.

## S7 — Git merge-file
URL: https://git-scm.com/docs/git-merge-file
Version: Page history lists 2.54.0 dated 2026-04-20, older entries, and 2.55.0–2.56.0 with no manual changes (retrieved 2026-10-10). Locator: version history lines 175–189; “DESCRIPTION” lines 204–218; options lines 241–257.
Evidence: The tool compares current and other files against a base, combining separate changes. Overlap in a common line segment produces marked conflicts for editing; options can choose one side or union. The manual calls it a minimal clone of RCS merge. No local command was run, and line-granularity implications for this product are an inference.

## Retrieval exception and check status
An attempted open of https://docs.yjs.dev/api/undo-manager returned an empty page body, so no UndoManager claim is relied on here. The search response exposed a beta-page excerpt but it was not used as evidence. No code, implementation, or local behavior was executed. Proposed checks appear only in `discovery.md` and `source-map.json`; they are not results.
