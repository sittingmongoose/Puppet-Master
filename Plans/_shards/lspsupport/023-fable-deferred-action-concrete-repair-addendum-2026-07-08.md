# Shard 023: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/LSPSupport.md`

Source lines: L7044-L7052

Source SHA256: `9ee1af4caafe478d9b04c50772acb552eba5701399dea4b8ca14e6700a350cad`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime LSP rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-5db5df835f867a5d96bf0b74`: `rust-analyzer` is self-managed by default. PM detects it on PATH and may suggest install guidance, but PM does not auto-install it unless a future owner doc adds an explicit installer contract.
- Repairs `sfk-c158d84b7bc8d4d4bcaf2d96`: every LSP server catalog row has `default_enabled` and `support_classification`, and the §3.2 table states both per row. Values use only the §14.9 registry vocabulary (`supported-by-registry`, `default-managed`, `toolchain-bound/manual`, `experimental/degraded`, `deprecated/replaced`). The earlier spellings are retired: `first_class` and `bundled` read as `default-managed`, `auto_detected` as `toolchain-bound/manual`, and `manual_setup` as `supported-by-registry`. A catalog row added without explicit values defaults to `default_enabled=false` and `support_classification=supported-by-registry`.
- Repairs `sfk-5e96353b2b86e879e26f845a`: gate `scope = project` means files under the project root, excluding generated, ignored, vendored, and policy-hidden paths (§17.1 Contract). Open-document-only is the `open` scope value of `verification.lsp_gate.scope` (§17.1 Config table, LSPS-091) and is not an alias for project. The spelling `open_documents` used here earlier is retired and is not a config value.
- Repairs `sfk-8290829cf3f3df11f6f5e87f`: Phase 1 uses `async-lsp` as the canonical Rust crate decision. `lsp-client` remains source-lineage research only unless a future currentness review replaces the crate choice.
  - Corrected 2026-11-24 (Decision_Log DL-2602, C-FIX79): the sentence above overstated the choice and is withdrawn. Phase 1 builds Puppet Master's own client on the §3.6.1 baseline stack (`lsp-types`, `tokio`, `tokio-util`, `serde_json`, `tracing`); `async-lsp` is permitted only as an internal `/wire` helper, never as the client foundation. `lsp-client` and `async_lsp_client` stay research inputs and rejected alternatives.
