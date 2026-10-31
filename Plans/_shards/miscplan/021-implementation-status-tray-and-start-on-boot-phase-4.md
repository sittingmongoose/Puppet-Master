# Shard 021: Implementation status (Tray and Start-on-Boot, Phase 4)

Source: `Plans/MiscPlan.md`

Source lines: L1278-L1284

Source SHA256: `08dc9e9319f62047e1d3e6b602b0fd6701de2d56c9af0c73007465e7e3b03a98`

---

## Implementation status (Tray and Start-on-Boot, Phase 4)

- **Status:** PASS  
- **Date:** 2026-02-19  
- **Summary:** Tray minimize-to-tray fix and start-on-boot setting (Linux/macOS/Windows).  
- **Files changed:** app.rs, views/settings.rs, autostart.rs, lib.rs, Cargo.toml, nfpm.yaml, installer/linux/scripts/postinstall  
- **Commands run:** historical source-lineage referenced cargo check and cargo test in the removed Rust/Iced app.
