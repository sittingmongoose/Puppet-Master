## Shared actor-boundary, route payload, and blocked_notice packet

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

#### Source target target-0565
- Reconciliation action: stale_retirement
- Replace scope: exact_section
- Exact required items represented:
  - Wave 1 rechecked `[retired-token-5]`, `[retired-token-6]`, and `[retired-token-7]` against live Contracts, UI command, chat, usage, HITL, and tool docs and only reconfirmed the already-recorded missing `[retired-token-1]` owner anchor, incomplete `[retired-token-4]` required-field list, live `[retired-token-3]` / `[retired-token-8]` survivors, skeletal `[retired-token-2]` payload, and stale closure verdict.
  - [retired-token-5]
  - [retired-token-6]
  - [retired-token-7]
  - [retired-token-1]
  - [retired-token-4]
  - [retired-token-3]
  - [retired-token-8]
  - [retired-token-2]
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #3 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #4 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #5 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #6 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #7 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #8 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

### Actor boundary and runtime identity
- Assistant chat actors share runtime identity semantics with Orchestrator and Interview agents.
- Chat actors remain chat/session actors; they do not become nodes or lanes merely because they delegate to subagents.
- Requested/effective runtime identity, `execution_role`, and `operational_identity` are visible on chat-facing surfaces and in delegated child-run handoffs.

### Canonical route payload
- Chat context includes route args from the parent run or session.
- Route args govern which tools and subagents are accessible within the chat session.
- Route args are immutable for the duration of the chat session; dynamic route changes are prohibited.

### blocked_notice packet
- When a chat query cannot be resolved within the current route/context, a structured blocked_notice packet is emitted.
- The blocked_notice includes the blocked query, the blocker reason, and a fallback resolution path (escalate to human, delegate to full Orchestrator, etc.).
- Blocked notices are distinct from errors; they indicate that the chat agent is functioning correctly but the requested work is out of scope.
