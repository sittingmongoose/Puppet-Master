# Shard 023: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/LSPSupport.md`

Source lines: L7041-L7048

Source SHA256: `596bd6c5f0883c2daeed9e41fcebaed3e7cafde5db104954a2389ab885b9374b`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime LSP rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-5db5df835f867a5d96bf0b74`: `rust-analyzer` is self-managed by default. PM detects it on PATH and may suggest install guidance, but PM does not auto-install it unless a future owner doc adds an explicit installer contract.
- Repairs `sfk-c158d84b7bc8d4d4bcaf2d96`: every LSP server catalog row has `default_enabled` and `support_classification`. Defaults are `default_enabled=false` and `support_classification=manual_setup` unless a row explicitly says `first_class`, `bundled`, or `auto_detected`.
- Repairs `sfk-5e96353b2b86e879e26f845a`: gate `scope = project` means files under the project root, excluding generated, ignored, vendored, and policy-hidden paths. Open-document-only is `scope = open_documents` and is not an alias for project.
- Repairs `sfk-8290829cf3f3df11f6f5e87f`: Phase 1 uses `async-lsp` as the canonical Rust crate decision. `lsp-client` remains source-lineage research only unless a future currentness review replaces the crate choice.
