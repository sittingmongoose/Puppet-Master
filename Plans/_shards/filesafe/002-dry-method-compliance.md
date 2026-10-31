# Shard 002: DRY Method Compliance

Source: `Plans/FileSafe.md`

Source lines: L11-L21

Source SHA256: `bd49ec5c4460ad0ff88f9178ed62b8b1d657e1ba7924cd1164bf2a3139577174`

---

## DRY Method Compliance

**CRITICAL:** All code in this plan MUST follow DRY principles.

- ✅ **ALWAYS** tag reusable functions: `// DRY:FN:<name> -- Description`
- ✅ **ALWAYS** tag reusable data structures: `// DRY:DATA:<name> -- Description`
- ✅ **ALWAYS** tag reusable helpers: `// DRY:HELPER:<name> -- Description`
- ✅ **ALWAYS** use `platform_specs::` functions for platform data (never hardcode)
- ✅ **ALWAYS** check `docs/gui-widget-catalog.md` before creating new UI widgets

---
