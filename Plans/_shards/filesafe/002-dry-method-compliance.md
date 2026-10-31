# Shard 002: DRY Method Compliance

Source: `Plans/FileSafe.md`

Source lines: L11-L21

Source SHA256: `3e2760d08279b7908ac72fa0c4ec7e33d70dfb92c0747804f769be5b50d66e20`

---

## DRY Method Compliance

**CRITICAL:** All code in this plan MUST follow DRY principles.

- ✅ **ALWAYS** tag reusable functions: `// DRY:FN:<name> -- Description`
- ✅ **ALWAYS** tag reusable data structures: `// DRY:DATA:<name> -- Description`
- ✅ **ALWAYS** tag reusable helpers: `// DRY:HELPER:<name> -- Description`
- ✅ **ALWAYS** use `platform_specs::` functions for platform data (never hardcode)
- ✅ **ALWAYS** check `docs/gui-widget-catalog.md` before creating new UI widgets

---
