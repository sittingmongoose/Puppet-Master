# Shard 015: Route-aware wiring reconciliation

Source: `Plans/Wiring_Matrix.md`

Source lines: L547-L573

Source SHA256: `250de630c47a555a13afc1944c5379ee1ca1c76f2624e71bc783073e6456a7a7`

---

## Route-aware wiring reconciliation

### Route-aware navigation and open-contract rows

#### Acceptance carry-through
- Carry selector precedence, reject rules, closed tab_id vocabulary, scoped resolver rules, route examples, ref-family split, and resume_url demotion into live route/open docs
- Carry Primitive:RouteTarget/OpenSubject and wrapper/canonical normalization into crosswalk and wiring docs

### Verification evidence hooks

#### Acceptance carry-through
- Expand Wiring Matrix and GATE-010 to verify route args, wrapper normalization, stale revalidation, admissibility, and correlation passthrough
- Add structured gate-specific evidence details for route-aware verification

### Compatibility-only fallback marking

#### Acceptance carry-through
- Mark timestamp/run/thread fallback logic as compatibility-only inside route/open contracts
- Keep ref-family split explicit when route/open normalization is transferred

### Catalog-owned normalization metadata

`Plans/UI_Command_Catalog.md` and `/UI_Command_Catalog.md` own command identity and alias metadata; Wiring Matrix rows consume that catalog ownership rather than duplicating route semantics. The matrix command-binding contract still exposes `ui_element_id`, `ui_command_id`, `handler_location`, and `expected_event_types`, but route-aware completeness requires each wrapper command to declare when it normalizes over canonical route/open semantics. This keeps `/open` meaning in the route contract while letting wiring/gates verify that the command row points at the catalog-owned normalization metadata.

`GATE-010` completeness includes `GATE` coverage for route/subject-aware navigation, stale-projection revalidation, wrapper-to-canonical normalization, admissibility, and correlation passthrough. The clean rule for `/gates` is catalog-owned normalization metadata consumed by wiring/gates, not a second routing schema inside the matrix.

Owner-level runtime records remain a demotion hazard for wiring. `tier_runtime_record`, tier-keyed `usage_record`, and tier-keyed `evidence_record` need owner-level demotion or replacement before generated wiring rows treat them as canonical producers or consumers.
