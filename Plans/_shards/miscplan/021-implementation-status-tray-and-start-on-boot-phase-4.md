# Shard 021: Implementation status (Tray and Start-on-Boot, Phase 4)

Source: `Plans/MiscPlan.md`

Source lines: L1278-L1284

Source SHA256: `5a1f16c378542a770e66a87875b19486d78da6ded77f1e798b0f4c0b9078ba87`

---

## Implementation status (Tray and Start-on-Boot, Phase 4)

- **Status:** PASS  
- **Date:** 2026-02-19  
- **Summary:** Tray minimize-to-tray fix and start-on-boot setting (Linux/macOS/Windows).  
- **Files changed:** app.rs, views/settings.rs, autostart.rs, lib.rs, Cargo.toml, nfpm.yaml, installer/linux/scripts/postinstall  
- **Commands run:** historical source-lineage referenced cargo check and cargo test in the removed Rust/Iced app.
