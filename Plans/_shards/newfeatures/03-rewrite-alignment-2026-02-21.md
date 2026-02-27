## Rewrite alignment (2026-02-21)

This plan remains a useful source of feature patterns, but implementation should be anchored to the rewrite described in `Plans/rewrite-tie-in-memo.md`:

- Providers + unified event model + deterministic agent loop (OpenCode-style)
- Event-sourced storage: seglog ledger → projections into redb (KV) and Tantivy (search)
- Central tool registry + policy engine + patch/apply/verify/rollback pipeline
- UI rewrite: Rust + Slint (winit; Skia default)

Where this document uses Iced-specific examples, treat them as illustrative legacy implementation notes; the behavioral requirements (recovery, hooks, bounded buffers, protocol normalization, etc.) are what must remain stable. We do not use SQLite; storage is seglog/redb/Tantivy per Plans/storage-plan.md.

**ELI5/Expert copy alignment:** Any authored tooltip/help copy introduced by features in this plan (for example event-strip tooltips or discoverability hints) must provide both Expert and ELI5 variants and be tracked by the single checklist in `Plans/FinalGUISpec.md` §7.4.0.

