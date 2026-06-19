# Shard 002: DRY Method Compliance

Source: `Plans/FileSafe.md`

Source lines: L11-L21

Source SHA256: `a1ef3a9cbb332706dc5b6576c5211914693efc0ea1cdd00fe066a56bb4b861e3`

---

## DRY Method Compliance

**CRITICAL:** All code in this plan MUST follow DRY principles.

- ✅ **ALWAYS** tag reusable functions: `// DRY:FN:<name> -- Description`
- ✅ **ALWAYS** tag reusable data structures: `// DRY:DATA:<name> -- Description`
- ✅ **ALWAYS** tag reusable helpers: `// DRY:HELPER:<name> -- Description`
- ✅ **ALWAYS** use `platform_specs::` functions for platform data (never hardcode)
- ✅ **ALWAYS** check `docs/gui-widget-catalog.md` before creating new UI widgets

---
