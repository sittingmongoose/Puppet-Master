## 6. Scope and Phasing

- **In scope for LSP MVP (this plan):** All features in §1, §5, and **§5.1 (LSP in the Chat Window)**, including: diagnostics, hover, completion, navigation (definition, references, symbol outline), inlay hints, semantic highlighting, code actions, code lens, signature help, request timeout/cancellation, LSP status in UI, per-server enable/disable, fallback when LSP unavailable (heuristic + optional install hint), **diagnostics in Assistant/Interview context**, **@ symbol with LSP workspace/symbol**, **code blocks in chat with hover and go-to-definition**, **Problems link from Chat**, and optional **inline diagnostics hint for @'d files**. Design and research for client-only integration: protocol usage, OpenCode-style server registry and lifecycle, Rust crates, and how it plugs into the File Manager and Chat.
- **Out of scope here:** Full editor implementation details (tabs, buffers, presets) -- those stay in FileManager.md; this doc only covers LSP-specific bits.
- **Phasing:** **LSP is MVP** -- implement with the desktop editor and Chat from the start. Use LSP when available; fallback to text-based/heuristic navigation and optional project index (FileManager §12.1.4) when LSP is disabled or unavailable.

---

