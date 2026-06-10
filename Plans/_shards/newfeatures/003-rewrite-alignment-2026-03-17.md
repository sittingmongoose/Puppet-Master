# Shard 003: Rewrite alignment (2026-03-17)

Source: `Plans/newfeatures.md`

Source lines: L8-L24

Source SHA256: `360bfc1732e8b68dc5199eac373fe54df23eff7e6f1788d69b5f2ae21426a64c`

---

## Rewrite alignment (2026-03-17)
The rewrite is aligned to these canonical decisions:
- node graph is the execution model
- `Feature Seam` and `Work Package` replace tiers as first-class orchestration objects
- runtime blocked identity replaces request-centric approval identity as canonical action scope
- shared requested/effective runtime identity spans assistant, interview, builders, overseers, and node workers
- `route_target` and `OpenSubject` are canonical navigation and identity-open primitives
- Source Control remains worktree-first while Orchestrator carries lane/package/seam operational context
- Gemini auth plan-map status is `RECONCILE complete` for this high-level feature summary: Gemini Direct and Gemini CLI are separate provider entries, API-key access is a scoped exception rather than the default UI posture, and consumer docs inherit requested/effective auth/account identity from `Plans/Multi-Account.md`, `Plans/Contracts_V0.md`, `Plans/Prompt_Pipeline.md`, `Plans/CLI_Bridged_Providers.md`, `Plans/feature-list.md`, `Plans/assistant-chat-design.md`, `Plans/newtools.md`, `Plans/00-plans-index.md`, `Plans/Runtime_Artifacts_Panel.md`, and `Plans/Orchestrator_Page.md` instead of restating stale Gemini API-key-default language.
- Rewrite-root summaries are now owned here at feature-summary level: `Plans/Decision_Log.md` and `/Decision_Log.md` are not sufficient as a rewrite-era decision ledger when they only carry 2026-02-27 OpenCode extraction entries. This high-level GUI/spec summary must name the graph-owned `Feature Seam`, `Work Package`, `Package Overseer`, `Seam Overseer`, worktree-first Source Control with `/worktree` lane split, requested/effective runtime identity, blocked-episode identity over HITL request identity, `route_target`, `OpenSubject`, `projection_freshness`, and `projection_health`.
- `Plans/**` and `/spec` summaries must reflect feature seam and work package governance objects in GUI copy; absence from broad plan search is treated as stale summary drift, not as permission to omit them. `rewrite-tie-in-memo.md` and rewrite-tie-in-memo remain route/open references for `/open`, `/health`, `/runtime`, rewrite-root routing, `/seam/package`, and blocked/runtime approval identity.
- Run Graph summary language must preserve the under-modeled command and struct gaps: `/corroboration/promotion/graph-patch`, concern, corroboration, promotion, graph-patch, trust state, and command-catalog fields are required feature families rather than high-level placeholders.
- Runtime object summaries refresh `object_kind` around rewrite-era lineage objects. First-class target kinds include Concern, Graph Patch, Feature Seam, Work Package, History, Ledger, `/timeline`, usage-linked receipts, Crosswalk.md `/open` contracts, and the distinction between a chronological History story and a structured durable Ledger inspection surface.
- `feature-list`, `feature-list.md`, and `newfeatures.md` are broad drift amplifiers; their summaries must stay aligned to owner docs and cannot compress detailed rules, field schemas, examples, or operational policies into vague high-level copy.

ContractRef: ContractName:Plans/Decision_Log.md, ContractName:Plans/Crosswalk.md, ContractName:Plans/Orchestrator_Page.md

