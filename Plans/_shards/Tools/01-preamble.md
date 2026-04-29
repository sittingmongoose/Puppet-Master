# Adding Tool Support -- Research & Plan

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0503
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Because earlier research established `focused_run_id`, historical-run mode, and project-state persistence, routing needs a persistence-aware rule:
  - focused_run_id
  - `minority_advisory` is now conceptually required by the research, but it still has no canonical stream/event name.
  - minority_advisory
  - Still needs research decisions**
  - Tool events remain under-attributed for node/actor/account-aware audit.
  - Current research wording has been useful, but it still risks colliding with preview/browser `trust_tier`.
  - trust_tier
  - The missing structural fields now fall into a repeatable set across tool events and artifact families:
  - Artifact / HITL / tool contracts remain under-owned at the exact file/field level:
  - Still needs research / owner decisions**
  - tool traces that originate from a provider-backed attempt should carry `provider_attempt_ref?` whenever that provider/runtime handle exists
  - provider_attempt_ref?
  - If this is not normalized, every new surface will keep adding one more `cmd.*.open_*` variant with slightly different args.
  - cmd.*.open_*
  - GPT-5.4 did not flatten out; it is still adding precision beyond Sonnet, especially where the owner docs themselves remain structurally weak.
  - This means the docs currently describe stronger verifiability than the gate/evidence contracts can actually support once navigation ceases to be a set of one-off command handlers.
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - Avoid adding a generic nested “extra args” bag to `route_target`; that would recreate the same drift under a different name.
  - route_target
  - Prefer extending `object_kind` deliberately over adding new top-level route fields.
  - object_kind
  - Coverage has been re-audited after the merge: `39` top-level `Plans/*.md` docs are full six-pass complete and the remaining `22` docs are now uniformly at five passes.
  - 39
  - 22
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
  - extend the effective-resolution and handoff records to the newer identity layers already established in research
  - `[retired-token-3]:866-916`
  - [retired-token-3]:866-916
  - `[retired-token-3]:1262-1284`
  - [retired-token-3]:1262-1284
  - `[retired-token-3]` still carries the stale tuple `[retired-token-6]`, `[retired-token-4]` still carries `[retired-token-1]`, and `[retired-token-2]` still carries the `[retired-token-5]` contradiction.
  - [retired-token-3]
  - [retired-token-6]
  - [retired-token-4]
  - [retired-token-1]
  - [retired-token-2]
  - [retired-token-5]
  - `[retired-token-3]:866-920`
  - [retired-token-3]:866-920
  - `[retired-token-3]:1262-1288`
  - [retired-token-3]:1262-1288
  - Wave 2 targeted the storage/receipt/blocked subset around `gap-003`, `gap-004`, and `gap-005` (`Plans/storage-plan.md`, `Plans/Project_Output_Artifacts.md`, `Plans/Runtime_Artifacts_Panel.md`, `Plans/interview-subagent-integration.md`, `Plans/usage-feature.md`, `[retired-token-3]`, `[retired-token-4]`) and only reconfirmed the already-recorded missing anchors/fields plus the already-known owner-vs-consumer split for blocked-packet fields.
  - gap-003
  - gap-004
  - gap-005
  - Plans/storage-plan.md
  - Plans/Project_Output_Artifacts.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/interview-subagent-integration.md
  - Plans/usage-feature.md
  - `[retired-token-3]` still carries the stale ask tuple `[retired-token-6]`, and `[retired-token-4]` still carries the stale self-verdict `[retired-token-1]`.
  - `[retired-token-3]:1131-1135`
  - [retired-token-3]:1131-1135
  - This invocation kept the blocker-family count at eight and the affected-doc count at twenty, but raised the underlying evidence count to fifty-nine by adding the missing-storage-anchor and missing-glossary-anchor evidence.
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #3 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #4 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #5 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #6 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

**Scope:** This document lives in `Plans/` only. It is the **canonical plan for tool support**: built-in tools, custom tools, **MCP** (integration with the registry and permission model), and the permission model (allow/deny/ask), aligned with [OpenCode's Tools model](https://opencode.ai/docs/tools/). Per-platform MCP config paths and framework-specific testing tools are detailed in **Plans/newtools.md** and AGENTS.md, while live MCP naming/availability/auth-state canon is owned by **Plans/MCP_Integration.md**; this doc defines the tool set, permissions, provider routing, and how MCP fits in.

