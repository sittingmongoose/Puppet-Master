# Reviser sources index

This index is bounded to sources used for the B11-P02-treatment reviser proposal. The machine-readable identity and condition records are in [source-map.json](../source-map.json). Investigator S-series and critic C-series records are carried without rebinding from the maps supplied in the input map. Fresh reviser checks use R-series IDs. New page access times use the nearest directly observed UTC clock capture; exact browser fetch timestamps were unavailable.

## Fresh reviser primary-source checks

- **R01 — Automerge Rust 0.12.0 API/authorship/history:** [versioned API](https://docs.rs/automerge/0.12.0/automerge/struct.Automerge.html). Author metadata is optional and must be mapped to trusted crew identity by the app; duplicate change application is idempotent; document save is whole-document serialization.
- **R02 — Automerge Rust 0.12.0 ReadDoc:** [versioned API](https://docs.rs/automerge/0.12.0/automerge/trait.ReadDoc.html). `get_all` returns all conflicting values tagged with operation IDs; `get_all_at` reads at chosen heads.
- **R03 — Transaction implementation:** [versioned `manual_transaction.rs` source](https://docs.rs/automerge/0.12.0/src/automerge/transaction/manual_transaction.rs.html). A Transaction groups operations into one change and delegates general operations through a trait implementation; that local grouping is not a distributed semantic move.
- **R04 — Transaction API surface:** [versioned Transaction API](https://docs.rs/automerge/0.12.0/automerge/transaction/struct.Transaction.html). The exposed `Transactable` surface includes insert/delete/splice/text operations; it does not define a cue-move contract.
- **R05 — Stateful sync loss history:** [Automerge Rust issue #1284](https://github.com/automerge/automerge/issues/1284). A report demonstrates a nonterminating loop after losing a generated message; a maintainer states the protocol needs a reliable in-order stream and reset after possible message loss. Issue has no target crate version and does not prove every release fails.
- **R06 — Conflict behavior:** [official Automerge conflict guide](https://automerge.org/docs/reference/documents/conflicts/). Deterministic visible value plus retained alternatives; JavaScript guide names are cross-checked against Rust R02.
- **R07 — List merge behavior:** [official Automerge merge-rules guide](https://automerge.org/docs/reference/under-the-hood/merge-rules/). List operations refer to element IDs and predecessor references; concurrent ordering is deterministic, with documented insertion-order caveats.
- **R08 — Move-aware CRDT research:** [arXiv v2 record](https://arxiv.org/abs/2311.14007v2), revised 2024-03-19. The paper describes duplicate/cycle hazards and planned Automerge integration; it is a research result, not a released API.

## Carried source families

- **S01–S10:** Automerge Rust 0.12.0 APIs/sync, official conflict/text/list/merge guides, lost-message issue, and move-CRDT paper.
- **S11–S15:** Yrs/Yjs release, update, conflict, StickyIndex, and shared-type movement evidence. The reviser treats the Yrs 0.28.0 API details as source-map-backed but not independently reopened here.
- **S16–S17:** Automerge repository storage/network adapter guidance and historical JavaScript handshake documentation correction.
- **C01–C11:** Critic’s independently opened/reviewed Automerge, move-paper, issue, and Yrs release records, with crosswalks to investigator S-series IDs.

See [reviser final proposal](../final.md) for how each source applies and for the validation plan.