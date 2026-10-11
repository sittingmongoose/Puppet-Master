# Shard 002: DRY Method Compliance

Source: `Plans/FileSafe.md`

Source lines: L11-L21

Source SHA256: `ece47700f08bfab6ed483e3649d3c6201fc47ae8736dbe5bdc70c828a1dc13b6`

---

## DRY Method Compliance

**CRITICAL:** All code in this plan MUST follow DRY principles.

- ✅ **ALWAYS** tag reusable functions: `// DRY:FN:<name> -- Description`
- ✅ **ALWAYS** tag reusable data structures: `// DRY:DATA:<name> -- Description`
- ✅ **ALWAYS** tag reusable helpers: `// DRY:HELPER:<name> -- Description`
- ✅ **ALWAYS** use `platform_specs::` functions for platform data (never hardcode)
- ✅ **ALWAYS** check `docs/gui-widget-catalog.md` before creating new UI widgets

---
