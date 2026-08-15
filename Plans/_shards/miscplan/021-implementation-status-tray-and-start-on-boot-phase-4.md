# Shard 021: Implementation status (Tray and Start-on-Boot, Phase 4)

Source: `Plans/MiscPlan.md`

Source lines: L1277-L1283

Source SHA256: `beb6fc1a5577ad84a061ff2803887816b569a9d4415ab37005d1ad0f9ef72ab0`

---

## Implementation status (Tray and Start-on-Boot, Phase 4)

- **Status:** PASS  
- **Date:** 2026-02-19  
- **Summary:** Tray minimize-to-tray fix and start-on-boot setting (Linux/macOS/Windows).  
- **Files changed:** app.rs, views/settings.rs, autostart.rs, lib.rs, Cargo.toml, nfpm.yaml, installer/linux/scripts/postinstall  
- **Commands run:** historical source-lineage referenced cargo check and cargo test in the removed Rust/Iced app.
