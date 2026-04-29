# LSP Support -- Plan (Rewrite)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0347
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Storage/project-state support appears incomplete for this seam:
  - The help system should explicitly support related links.
  - projection cannot currently support that surface; UI must fall back or disable
  - The shared provider/runtime docs already support the newer requested/effective language well.
  - a degraded concern rollup should not emit a fresh “3 new concerns” system notification unless canonical records support it
  - Search should support:
  - no canonical role enum or `actor_kind` / `execution_role` field exists to support role-by-provider and role-by-account overrides consistently across docs
  - actor_kind
  - execution_role
  - `project_attention_item` rows should retain enough historical semantics to support active vs resolved/dismissed/quieted behavior without erasing audit lineage
  - project_attention_item
  - counts on `project_summary` should support compact badges, while `project_attention_item` supports precise lists and routing
  - project_summary
  - pressure episodes and switch events should support both provider-wide and account-specific views
  - Require runtime-artifact envelope support for `attempt_id` plus bridge refs where applicable.
  - attempt_id
  - Several owner docs are still broken in ways that directly defeat the machine-verification/gate story they claim to support.
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - Keep any surviving `request_id` text explicitly labeled as compatibility lineage or historical replay support only.
  - request_id
  - with `Plans/GUI_Rebuild_Requirements_Checklist.md`, `Plans/Plugins_System.md`, `Plans/Skills_System.md`, and `Plans/LSPSupport.md` still clearly active.
  - Plans/GUI_Rebuild_Requirements_Checklist.md
  - Plans/Plugins_System.md
  - Plans/Skills_System.md
  - Plans/LSPSupport.md
  - Coverage has been re-audited after the merge: `39` top-level `Plans/*.md` docs are full six-pass complete and the remaining `22` docs are now uniformly at five passes.
  - 39
  - 22
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

**Date:** 2026-02-22
**Status:** Plan -- **LSP is MVP**
**Scope:** LSP (Language Server Protocol) is **in scope for the desktop MVP**. Desktop client integration, server management, **full LSP integration in the Chat Window** (diagnostics in context, @ file/symbol with LSP, code blocks with hover/Go to definition), and **additional enhancements** (Find references, Rename symbol, Format document, optional LSP diagnostics gate, Chat "Fix all"/"Rename"/"Where is this used?", etc.) -- see §9.1.
**Cross-references:** Plans/FileManager.md (§6, §10), Plans/assistant-chat-design.md (§9), Plans/00-plans-index.md, Plans/FinalGUISpec.md (§7.20 Bottom Panel, §7.16 Chat, §8.1 StatusBar), Plans/feature-list.md (§4 Verification gates), OpenCode (anomalyco/opencode) LSP implementation. **LSP gate, evidence, subagent selection (implementation spec):** §17.
**SSOT references (DRY):** `Plans/Spec_Lock.json`, `Plans/DRY_Rules.md`, `Plans/Glossary.md`, `Plans/Decision_Policy.md`, `Plans/Progression_Gates.md`, `Plans/evidence.schema.json`, `Plans/Tools.md`.

**ELI5/Expert copy alignment:** Authored tooltip/help text in this plan (for example setting hints and UI explanatory copy) must follow the dual-variant contract in `Plans/FinalGUISpec.md` §7.4.0. LSP server-returned hover/diagnostic payloads are dynamic external content and are outside authored dual-copy enforcement.

**Implementation plan summary (top-level guide for agents):** (1) **Prerequisites:** Rust LSP client crate (lsp-types + stdio client), config schema (OpenCode-aligned). (2) **Phase 1 -- Core LSP:** Server registry (§3.2 + slint-lsp), document sync (didOpen/didChange/didClose/didSave, debounce), diagnostics → editor + Problems panel (FinalGUISpec §7.20), hover, completion, status bar (§8.1). (3) **Phase 2 -- Editor:** Go to definition, code actions, code lens, signature help, inlay hints, semantic highlighting; then Find references (References panel, Shift+F12), Rename symbol (F2), Format document/selection (Shift+Alt+F); breadcrumbs/Go to symbol (documentSymbol); timeouts, per-server enable/disable, Settings > LSP (§7.4.2). (4) **Phase 3 -- Chat LSP (§5.1):** Diagnostics in Assistant/Interview context; @ symbol with LSP workspace/symbol; code-block hover and click-to-definition; Problems link from Chat (§7.16). (5) **Phase 4 -- Optional (§9.1):** LSP diagnostics gate and LSP snapshot in evidence (optional; feature-list §4); subagent selection from LSP; Chat "Fix all"/Rename/"Where is this used?"/Format; promote lsp tool (Tools.md). **Single checklist:** Appendix: Implementation plan checklist (this document).

**For implementation guide:** The **Appendix: Implementation plan checklist** is the single ordered checklist for implementers (Prerequisites, Phase 1-4). §§13-16 and §12 provide GUI requirements, technical implementation detail, phased build order, and open decisions.

---

