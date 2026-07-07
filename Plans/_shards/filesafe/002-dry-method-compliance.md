# Shard 002: DRY Method Compliance

Source: `Plans/FileSafe.md`

Source lines: L11-L21

Source SHA256: `6728655f6cc482b6496f80070da53656d6dcf482f2821191f75eeb81e3a1ae25`

---

## DRY Method Compliance

**CRITICAL:** All code in this plan MUST follow DRY principles.

- ✅ **ALWAYS** tag reusable functions: `// DRY:FN:<name> -- Description`
- ✅ **ALWAYS** tag reusable data structures: `// DRY:DATA:<name> -- Description`
- ✅ **ALWAYS** tag reusable helpers: `// DRY:HELPER:<name> -- Description`
- ✅ **ALWAYS** use `platform_specs::` functions for platform data (never hardcode)
- ✅ **ALWAYS** check `docs/gui-widget-catalog.md` before creating new UI widgets

---
