# LSP Support -- Plan (Rewrite)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


**Date:** 2026-02-22  
**Status:** Plan -- **LSP is MVP**  
**Scope:** LSP (Language Server Protocol) is **in scope for the desktop MVP**. Desktop client integration, server management, **full LSP integration in the Chat Window** (diagnostics in context, @ file/symbol with LSP, code blocks with hover/Go to definition), and **additional enhancements** (Find references, Rename symbol, Format document, optional LSP diagnostics gate, Chat "Fix all"/"Rename"/"Where is this used?", etc.) -- see §9.1.  
**Cross-references:** Plans/FileManager.md (§6, §10, §12.1.4), Plans/assistant-chat-design.md (§9, §9.1 LSP in Chat), Plans/00-plans-index.md, Plans/FinalGUISpec.md (§7.20 Bottom Panel, §7.16 Chat, §8.1 StatusBar), Plans/feature-list.md (§4 Verification gates), OpenCode (anomalyco/opencode) LSP implementation. **LSP gate, evidence, subagent selection (implementation spec):** §17.
**SSOT references (DRY):** `Plans/Spec_Lock.json`, `Plans/DRY_Rules.md`, `Plans/Glossary.md`, `Plans/Decision_Policy.md`, `Plans/Progression_Gates.md`, `Plans/evidence.schema.json`, `Plans/Tools.md`.

**ELI5/Expert copy alignment:** Authored tooltip/help text in this plan (for example setting hints and UI explanatory copy) must follow the dual-variant contract in `Plans/FinalGUISpec.md` §7.4.0. LSP server-returned hover/diagnostic payloads are dynamic external content and are outside authored dual-copy enforcement.

**Implementation plan summary (top-level guide for agents):** (1) **Prerequisites:** Rust LSP client crate (lsp-types + stdio client), config schema (OpenCode-aligned). (2) **Phase 1 -- Core LSP:** Server registry (§3.2 + slint-lsp), document sync (didOpen/didChange/didClose/didSave, debounce), diagnostics → editor + Problems panel (FinalGUISpec §7.20), hover, completion, status bar (§8.1). (3) **Phase 2 -- Editor:** Go to definition, code actions, code lens, signature help, inlay hints, semantic highlighting; then Find references (References panel, Shift+F12), Rename symbol (F2), Format document/selection (Shift+Alt+F); breadcrumbs/Go to symbol (documentSymbol); timeouts, per-server enable/disable, Settings > LSP (§7.4.2). (4) **Phase 3 -- Chat LSP (§5.1):** Diagnostics in Assistant/Interview context; @ symbol with LSP workspace/symbol; code-block hover and click-to-definition; Problems link from Chat (§7.16). (5) **Phase 4 -- Optional (§9.1):** LSP diagnostics gate and LSP snapshot in evidence (optional; feature-list §4); subagent selection from LSP; Chat "Fix all"/Rename/"Where is this used?"/Format; promote lsp tool (Tools.md). **Single checklist:** Appendix: Implementation plan checklist (this document).

**For implementation guide:** The **Appendix: Implementation plan checklist** is the single ordered checklist for implementers (Prerequisites, Phase 1-4). §§13-16 and §12 provide GUI requirements, technical implementation detail, phased build order, and open decisions.

---

