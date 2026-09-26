# Search/index carry-forward review

Status: root evidence review complete; independent review pending. No closure
matrix credit is granted by this report.

Snapshot: `79ca4729f`, compared with historical
`b688606877a9b67b0a2f44e9093f087037a94ab1`. Membership is exactly the 12
`topic_route=search_index` identities in the complete impact export pinned by
`whole-corpus-currentness-gate.md`: for each of `TOUCH-SEARCHIDX-001` and
`TOUCH-SEARCHIDX-002`, the six facets below. No other Search assessment is
included or implicitly cleared.

| Facet (both Touch IDs) | Current evidence and bounded conclusion |
| --- | --- |
| `canonical_owner_and_plan_unit` | Settings SSYS-023 retains projection-only ownership; FinalGUISpec Search side-panel owns indexing control; storage-plan sections 2.1/2.1.1 own physical snapshots and eviction. Owner separation remains specified. |
| `command_or_typed_ui_action` | UI_Command_Catalog section 2.9 retains `cmd.search.rebuild_index` with Project identity and `cmd.search.evict_remote_cache` with Project plus optional cache identity. Rebuild preserves replacement routing; eviction opens confirmation. This proves admitted command identity and behavior, not the missing typed operation/result contract. |
| `persistence_and_migration` | storage-plan lines 275–281 retain generation-aware dirty clearing, reader-held snapshots, atomic publication and flush-before-publish. Section 2.1.1 retains 30-day idle, bounded-size/manual eviction, deletion of Git cache plus index, and next-open reconstruction. Physical execution and migration proof remain absent. |
| `requirement_and_packet_refs` | Both exact Touch rows and TCP-SEARCH-INDEX retain their canonical command IDs, UCC-087/SSYS-023 requirement refs and partial status. This is the historical Touch-source lineage claim, not a new packet feature approval. |
| `reverse_consumer_coverage` | SSYS-023 and its manager fixture expose both actions without a Settings runtime; FinalGUISpec lines 1679 and 2329 retain indexing/cancellation and confirmed eviction controls; both production-intent wiring rows remain present. Textual adoption only; native/GUI proof and operation contracts are separate. |
| `single_handler_owner` | Wiring names `handlers::search::rebuild_index` and `handlers::search::evict_remote_cache`; the Settings manager expressly forbids building, cancelling, evicting or repairing locally. This is sole planned-handler routing, not an implemented handler. |

Root read the current owner passages and exact JSON records. Parsed comparison
against the historical base found both complete wiring rows equal, both
`project-search-index` fixture objects equal, the complete TCP-SEARCH-INDEX
profile equal, and both Touch rows equal. Each target had one match at both
revisions except the fixture key, which had two at both revisions; both were
compared. Thus broad changes to those files do not themselves invalidate these
particular records. Current prose still explicitly preserves cancellation and
partial-generation cleanup, fresh rebuild on re-enable, remote-only control
hiding, confirmation, and no eviction on ordinary project close.

Important qualification: the old `command_or_typed_ui_action` covered label
must not be read as typed-contract closure. TCP-SEARCH-INDEX still uses prose
placeholders for payload/result/error refs. The wiring rows permit a typed
contract **or** route/open no-persist disposition. These do not define the
confirmed actual eviction's result boundary or rebuild operation settlement.
The separate flagged Search adjudications remain open; these 12 historical
facets cannot erase them. No new permission class, generation placement,
confirmation policy, result schema or native proof is inferred here.

Next: independent review may preserve only the bounded owner/identity/prose
claims above, retaining native and GUI obligations and the existing typed
specification gaps. Changes after this snapshot and current-main reconciliation
require a delta review.
