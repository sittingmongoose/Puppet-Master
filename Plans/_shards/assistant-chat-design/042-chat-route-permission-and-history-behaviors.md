# Shard 042: Chat Route, Permission, and History Behaviors

Source: `Plans/assistant-chat-design.md`

Source lines: L3542-L3556

Source SHA256: `ab006cda7b94ec971f4175168bf411568e158efcf12d5201e1fb066daaff77e7`

---

## Chat Route, Permission, and History Behaviors

Permission approval state must not leak across lanes, accounts, or shared-runtime actors just because they share a UI session. `always`, reject-cascade, and doom-loop behavior require a canonical actor/account/lane scope key; `Permissions_System.md` / `Permissions_System` default-deny hints for `todoread` and `todowrite` must narrow by execution-entity, actor-scoped context, and `/member/lane/account-bounded` permissions.

Worker-facing handoff and `/retry` memory are explicit Project or application thread/Computer-scoped structured runtime records, not vague "JSON-like" logs. The design must say whether the backing records/projections are `/JSONL/redb-backed` (answered 2026-10-31, DL-270, SP-339: handoff and /retry records are typed redb or MessagePack records with no JSONL backing; JSONL appears only as on-demand pm export output), which concrete `/path/delivery` or storage domain owns them, and how a worker receives the bounded packet, while keeping `/projections` and worker-facing handoff separate from full raw history. ACD-408 and the conversion manifest preserve historical source and admit fresh destination refs.

`History` remains chronological but windowed: initial load shows a recent slice, `load-older` or jump controls bring in older items, dense event bursts collapse low-level records, and initial viewports do not force every low-level record into the thread. Amended 2026-10-31 (DL-270): load-older paging is mandatory, not one option among jump controls. History opens from the thread's render-page store (thread_head, hot tail, newest sealed 50-item page) and loads older pages on demand (SP-338, ACD-242); jump controls are additional. `Settings` is source-axis heavy and must show inheritance plus override origin so the user can answer what will be requested from the current surface. `origin` is audit-only even when actor identity is first-class elsewhere; it must never become behavior-driving actor identity.

Graph and history consumers use viewport culling with overscan, table virtualization, per-generation layout caching, incremental row `/item` updates, and frame-cadence burst throttling; when rectangle-based rendering falls below target performance, the fallback is canvas-style rendering.

A CtA card, blocked notice, search result, artifact pivot, thread usage jump, and legacy thread-usage command aliases all restore destination and scope using the same internal payload model. Command palette entries, search results, artifact deep-links, blocked notices, and FileManager / `/Editor` opens all resolve through this internal target model rather than chat-local navigation. Legacy `cmd.chat.focus_thread_usage` citations normalize to route/open Usage or the editor-tab Context Detail Pane; the old command ID is compatibility-only and must not remain a canonical dispatch target. Blocked notices are rendered from `allowed_action_ids[]`, `allowed_action_ids`, and blocked metadata; `assistant-chat-design.md` / `assistant-chat-design` must not invent thread-local recovery semantics.

Route catalog policy is deterministic. Do not make a large public `cmd.nav.*` or `cmd.nav` family the main catalog-facing answer. Do not use hedge words such as `optional` or `maybe` when stating canonical direction. State allowed serialized data classes directly: wizard-step detail is a narrow serialized anchor, not a top-level base route field. `OpenFile` stays path `/editor` scoped; `OpenSubject` is the identity-open contract consumed by FileManager and assistant chat.

owner-consumer reconciliation treats these gaps as spec-integrity failures, not fresh design space. The remaining work is reconciliation-order implementation, not open-ended research or model invention.
