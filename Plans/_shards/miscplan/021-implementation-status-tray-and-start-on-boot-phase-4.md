# Shard 021: Implementation status (Tray and Start-on-Boot, Phase 4)

Source: `Plans/MiscPlan.md`

Source lines: L1277-L1283

Source SHA256: `e000b23c3e58fd317135ea6ee6b09b748cdffcb3ead602e933ae42367e00047e`

---

## Implementation status (Tray and Start-on-Boot, Phase 4)

- **Status:** PASS  
- **Date:** 2026-02-19  
- **Summary:** Tray minimize-to-tray fix and start-on-boot setting (Linux/macOS/Windows).  
- **Files changed:** app.rs, views/settings.rs, autostart.rs, lib.rs, Cargo.toml, nfpm.yaml, installer/linux/scripts/postinstall  
- **Commands run:** historical source-lineage referenced cargo check and cargo test in the removed Rust/Iced app.
