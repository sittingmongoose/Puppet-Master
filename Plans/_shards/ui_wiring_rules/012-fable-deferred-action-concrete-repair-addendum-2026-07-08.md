# Shard 012: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/UI_Wiring_Rules.md`

Source lines: L619-L623

Source SHA256: `87cbd5886e12079c7d4fe44d0c86204989b28b13e5981a25a561c0adf684cf0d`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime UI wiring rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-58d6d13ed1139428d3f6a692`: `handler_location` grammar is `{crate_root}::{module_path}::{function_name}`. Pre-implementation rows use `handler_status = planned` with `owner_doc_ref`; implementation-ready rows require `handler_status = resolved` and a real module path. Missing handler fallback is `handler_status = missing` and blocks buildability rather than inventing a source path.
