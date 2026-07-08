# Shard 021: Implementation status (Tray and Start-on-Boot, Phase 4)

Source: `Plans/MiscPlan.md`

Source lines: L1277-L1283

Source SHA256: `71467a40702dea2f70a6695eaf30b42736c5f5b65f7468516d21dd2f71cdef88`

---

## Implementation status (Tray and Start-on-Boot, Phase 4)

- **Status:** PASS  
- **Date:** 2026-02-19  
- **Summary:** Tray minimize-to-tray fix and start-on-boot setting (Linux/macOS/Windows).  
- **Files changed:** app.rs, views/settings.rs, autostart.rs, lib.rs, Cargo.toml, nfpm.yaml, installer/linux/scripts/postinstall  
- **Commands run:** historical source-lineage referenced cargo check and cargo test in the removed Rust/Iced app.
