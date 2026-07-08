# Shard 014: INV-012 -- Wiring matrix coverage (Rule 2)

Source: `Plans/Architecture_Invariants.md`

Source lines: L180-L186

Source SHA256: `fab349fb07405fa12bb0ee2bf0c49308e8b0bb9581290de3ba5db02abe5c0b1e`

---

## INV-012 -- Wiring matrix coverage (Rule 2)

**Rule:** UI command coverage MUST keep the command catalog, wiring matrix, examples, and templates mechanically consistent.

- `Plans/UI_Command_Catalog.md` command/catalog/template/example integrity is a gating invariant: if catalog examples, command templates, or wiring rows drift, surfaces can be miswired even when each individual `UICommandID` exists.

<a id="INV-013"></a>
