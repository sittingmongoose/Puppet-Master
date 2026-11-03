# Shard 014: INV-012 -- Wiring matrix coverage (Rule 2)

Source: `Plans/Architecture_Invariants.md`

Source lines: L147-L153

Source SHA256: `480fac0bed813d64ffbc35f54515ef098785f04fd1b0893cdf132bba61a93e2b`

---

## INV-012 -- Wiring matrix coverage (Rule 2)

**Rule:** UI command coverage MUST keep the command catalog, wiring matrix, examples, and templates mechanically consistent.

- `Plans/UI_Command_Catalog.md` command/catalog/template/example integrity is a gating invariant: if catalog examples, command templates, or wiring rows drift, surfaces can be miswired even when each individual `UICommandID` exists.

<a id="INV-013"></a>
