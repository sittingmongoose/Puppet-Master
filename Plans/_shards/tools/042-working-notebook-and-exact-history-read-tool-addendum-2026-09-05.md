# Shard 042: Working Notebook And Exact History Read Tool Addendum (2026-09-05)

Source: `Plans/Tools.md`

Source lines: L12770-L12859

Source SHA256: `151ae97002f04f5abb1a940614750fb3417e0c7ddec0b530358a58b333a2cc6f`

---

## Working Notebook And Exact History Read Tool Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. Logical notebook semantics are owned by `Plans/Working_Notebook.md` (WN-020); this section registers the agent-facing tool contracts. Names below are registered tool-contract names at Plans level; no native handler exists yet and no invocation or emission is claimed. Until handlers are materialized and admitted through the normal capability stages, these tools are unavailable rather than silently stubbed.

### Registered tool contracts

**`chatread` — exact bounded history read.** Complements `chatsearch` (T-044): a search hit (`thread_id`, `message_id`, `ts`, `role`, `snippet`, `score`) can be followed by an exact read of the retained source. Input: `{ thread_id, message_id | item_id, revision?, range?, include_neighbors?, include_tool_pair? }`. The range convention is exactly one of `unicode_char_offsets` or `utf8_byte_offsets` per request, never mixed; ranges are UTF-8-safe and explicit truncation is reported. Optional bounded neighboring-message or tool-pair expansion names what was added and stays inside the same aggregate output budget (default 8 KiB, hard 32 KiB per response, plus the live token-budget limit). Direct reads apply the same project/thread/actor/phase permission, redaction, visibility, Context Lens, retention, and lineage checks as search at read time: knowledge of an opaque ID is not permission. Denied visibility, pruned sources, not-yet-indexed state, stale indexes, and incomplete pagination stay distinct internally; user/model-facing responses do not leak forbidden existence. Direct reads use durable authoritative source where authorized, so a search watermark lag never fabricates absence, and a bounded lag/retry or scan fallback never fabricates recollection.

**`notebook_search` — scoped notebook search.** Input: `{ query?, scope, filters?, cursor?, limit? }`. Default 5 hits, hard 10 per page; snippets at most 512 bytes each; total response at most 8 KiB including metadata; current token budget may narrow output. Hits carry `notebook_id`, `entry_id`, `revision`, `epistemic_kind`, `freshness`, `snippet`, `score`. Query success does not imply exhaustive corpus review. Lexical retrieval is the default; optional semantic retrieval is a distinguished mode, never silently blended.

**`notebook_read` — exact bounded entry read.** Input: `{ notebook_id, entry_id, revision?, range?, include_provenance? }`. Returns the immutable entry revision (or the clearly qualified current object), envelope metadata (author, lifecycle, epistemic kind, freshness), provenance/validity/restriction references, and explicit truncation. Same single range convention rule and bounds as `chatread`. Read-time checks match `notebook_search` exactly.

**`notebook_write` — create/update/append with CAS.** Input: `{ notebook_id?, scope (create), entry_id?, operation: create | update | append, expected_revision?, request_id, body, epistemic_kind, provenance_refs?, validity_refs? }`. Bounded input (hard 64 KiB UTF-8 body); oversize input is rejected with a split offer, never silently truncated. The host fills envelope metadata. Stale `expected_revision` yields a typed conflict naming the conflicting revision; a repeated `request_id` returns the original result without a second write. No whole-notebook wildcard write exists: each request targets exactly one entry identity.

**`notebook_supersede` — lifecycle transitions.** Input: `{ notebook_id, entry_id, expected_revision, operation: supersede | archive | tombstone, supersedes_entry_revision? }`. Runs through owner policy (WN-014); current checkpoint dependencies hold retention and cannot be silently purged.

**`fresh_context_request` — transition request (request-only).** Input: `{ reason, checkpoint_required? }`. Submits a fresh context-window request to the Prompt Pipeline admission lifecycle (PP-085). The request never performs admission, never discards context, and returns the recorded request identity and current typed state (`requested | deferred | denied` reasons) immediately.

Permission classes: `notebook_search`, `notebook_read`, `chatread` are read-only tools under the standard `allow/deny/ask` model SSOT `Plans/Permissions_System.md`; `notebook_write` and `notebook_supersede` are mutation-capable tools scoped to PM notebook storage only (`mutation_capable: true` for the notebook store, never for the target repository); `fresh_context_request` is a non-mutating control-plane request. Every result uses the normalized tool-result taxonomy and `ToolRecoveryEnvelope` (`complete | partial | timed_out | truncated | unavailable | blocked | failed`) with the typed notebook errors mapped per WN-020; missing, denied, and lag stay distinct internally without leaking forbidden existence externally. Original output retention (artifact spill) stays separate from model-visible truncation per the spill rule.

```yaml
plan_unit_id: T-183
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: chatread is the registered exact bounded history read complementing chatsearch. A search hit resolves to the exact retained source by stable thread/message/item identity with an explicit single range convention (unicode_char_offsets or utf8_byte_offsets, never mixed), UTF-8-safe ranges, optional bounded neighbor/tool-pair expansion inside the same aggregate output budget, and explicit truncation. Search and direct read enforce identical project/thread/actor/phase permission, redaction, visibility, Context Lens, retention, and lineage checks at read time; an opaque ID is not permission. Direct reads use durable authoritative source where authorized; index lag is distinct from authoritative absence and never fabricates absence or recollection.
gui_related: false
gui_classification_reason: Tool contracts are runtime behavior, not GUI work.
depends_on: [T-044, WN-020]
unblocks: []
acceptance_criteria:
  - A chatsearch hit can be followed to the exact retained source.
  - Muted or forbidden items cannot be recovered by bypassing search; denied titles, snippets, and counts stay protected.
  - Multibyte ranges are Unicode-safe and neighbor expansion stays inside aggregate limits.
validation_surfaces:
  - python3 scripts/pm-working-notebook-contracts.py validate
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: permission_bypass_via_id
reasoning_tier: high
context_scope: tool_contracts
implementation_surfaces: [Plans/Tools.md, Plans/Working_Notebook.md]
node_compile_hint: {mode: tool_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-H01
  - source_packet:PM-WNC-2026-09-05-v1:WNC-H02
  - source_packet:PM-WNC-2026-09-05-v1:WNC-H03
  - source_packet:PM-WNC-2026-09-05-v1:WNC-H04
preserved_exact_tokens: ["chatread", "unicode_char_offsets", "utf8_byte_offsets", "knowledge of an opaque ID is not permission", "index lag is distinct from authoritative absence"]
negative_constraints:
  - Do not let a known ID bypass read-time permission checks.
  - Do not mix byte and character offsets in one request.
  - Do not treat a snippet as full evidence.
owner_hints: [Plans/Tools.md, Plans/Working_Notebook.md]
```

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Working_Notebook.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md

```yaml
plan_unit_id: T-184
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: The notebook tool family is registered as notebook_search (default 5 hits, hard 10 per page, 512-byte snippets, 8 KiB response), notebook_read (default 8 KiB, hard 32 KiB, immutable revision reads with envelope metadata), notebook_write (CAS and idempotency, 64 KiB body cap, split offer on oversize, no wildcard writes), notebook_supersede (owner-policy lifecycle transitions; checkpoint dependencies hold), and fresh_context_request (request-only transition submission; never performs admission). notebook_write/notebook_supersede are mutation-capable for PM notebook storage only; read tools carry read-only permission classes under the Permissions_System SSOT. All results use the normalized taxonomy and typed notebook error mapping from Plans/Working_Notebook.md WN-020, keeping missing, denied, and lag distinct internally without leaking forbidden existence.
gui_related: false
gui_classification_reason: Tool contracts are runtime behavior, not GUI work.
depends_on: [T-044, WN-017, WN-020]
unblocks: []
acceptance_criteria:
  - Every operation has concrete request/result/error shapes, scope checks, bounds, and budgets.
  - No unbounded read through empty query, wildcard, or omitted limit; no whole-notebook write.
  - Idempotent replay returns the original result; stale CAS yields a typed conflict.
validation_surfaces:
  - python3 scripts/pm-working-notebook-contracts.py validate
  - Plans/working_notebook_contract_fixtures.json
risk_class: unbounded_tool_output
reasoning_tier: high
context_scope: tool_contracts
implementation_surfaces: [Plans/Tools.md, Plans/Working_Notebook.md]
node_compile_hint: {mode: tool_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-N09
  - source_packet:PM-WNC-2026-09-05-v1:WNC-H04
preserved_exact_tokens: ["notebook_search", "notebook_read", "notebook_write", "notebook_supersede", "fresh_context_request", "split offer"]
negative_constraints:
  - Do not expose unregistered candidates as working tools.
  - Do not allow unrestricted cross-agent reads or wildcard notebook writes.
owner_hints: [Plans/Tools.md, Plans/Working_Notebook.md]
```

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Working_Notebook.md, ContractName:Plans/Permissions_System.md
