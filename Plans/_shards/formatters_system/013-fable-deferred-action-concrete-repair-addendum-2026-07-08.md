# Shard 013: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Formatters_System.md`

Source lines: L1102-L1106

Source SHA256: `1f94b8a1d7a00702bb320c1f2c49f4933b6b5d113354c335476dece8d8fd4aa0`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime formatter rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-52b912e858e3f723a8838777`: formatter registration order is deterministic: built-in formatters in documented order, then project formatters sorted by `formatter_id`, then user/global formatters sorted by `formatter_id`. Ties are invalid and must fail validation with `duplicate_formatter_id`.
