# Shard 013: FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

Source: `Plans/Formatters_System.md`

Source lines: L1150-L1154

Source SHA256: `c0054654c7d37d0b7562a5751fbb510f87c716c16162e48db9a0c9ec76bdb019`

---

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime formatter rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-52b912e858e3f723a8838777`: formatter registration order is deterministic: built-in formatters in documented order, then project formatters sorted by `formatter_id`, then user/global formatters sorted by `formatter_id`. Ties are invalid and must fail validation with `duplicate_formatter_id`.
