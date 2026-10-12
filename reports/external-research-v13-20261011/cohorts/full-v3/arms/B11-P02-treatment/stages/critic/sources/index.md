# Critic source index

Critic-stage source identity records are in [source-map.json](../source-map.json). C-series IDs are new critic checks; investigator S-series IDs retain their original meanings.

## Versioned Rust API and source

- **C01 — Automerge Rust 0.12.0 API:** [Automerge](https://docs.rs/automerge/0.12.0/automerge/struct.Automerge.html). Author IDs are optional; changes have no author unless set. Also documents apply_changes idempotence and document heads.
- **C02 — Automerge Rust 0.12.0 ReadDoc source:** [read.rs](https://docs.rs/automerge/0.12.0/src/automerge/read.rs.html). get_all returns alternatives with operation IDs; *_at reads at supplied heads; cursors identify sequence positions.
- **C03 — Automerge Rust 0.12.0 transaction API:** [Transaction](https://docs.rs/automerge/0.12.0/automerge/transaction/struct.Transaction.html) and [manual transaction source](https://docs.rs/automerge/0.12.0/src/automerge/transaction/manual_transaction.rs.html). The inspected API lists insert/delete/splice operations, not a high-level cue-move contract.

## Automerge behavior and design guidance

- **C04 — Lists:** [official list guide](https://automerge.org/docs/reference/documents/lists/), entity-map and ID-list pattern; JavaScript examples.
- **C05 — Merge rules:** [official merge rules](https://automerge.org/docs/reference/under-the-hood/merge-rules/), list element IDs, predecessor references, and insertion-order caveat.
- **C07 — Conflicts:** [official conflict guide](https://automerge.org/docs/reference/documents/conflicts/), deterministic visible winner plus retained concurrent alternatives.
- **C09 — Text:** [official text guide](https://automerge.org/docs/reference/documents/text/), JavaScript updateText frequency caveat.

## Implementation history and alternatives

- **C06 — Move CRDT:** [arXiv v2 record](https://arxiv.org/abs/2311.14007v2), revised 2024-03-19; planned Automerge integration is not a release claim.
- **C08 — Lost-message history:** [Automerge issue #1284](https://github.com/automerge/automerge/issues/1284), report and maintainer recovery requirement.
- **C10 — Yrs release:** [release history](https://github.com/y-crdt/y-crdt/releases), v0.28.0 at 23b7f56.
- **C11 — Storage/network plumbing:** [Automerge repositories guide](https://automerge.org/docs/reference/repositories/), JS adapter example only.

See each source-map record for exact locator, access UTC, condition, observed operation, and applicability. The browser tool did not expose exact per-page fetch timestamps; the nearest directly observed UTC clock capture is recorded. Yrs API verification limits are explicit in the source map.
