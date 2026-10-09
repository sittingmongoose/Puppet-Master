# Shard 036: Additive Correction v4 — Attempt-Level Attribution (2026-09-03)

Source: `Plans/usage-feature.md`

Source lines: L6941-L6956

Source SHA256: `41d0f17b8b5a1e6336db0baa4e7d043fae3ddc801868fbd92367120d6202f819`

---

## Additive Correction v4 — Attempt-Level Attribution (2026-09-03)

This owner **consumes** the correction (`PART-006`, `PART-023`, `PSCHED-013`, `GREPLAY-012`,
`MODAL-002`).

- Usage retains the requested slot, **every** effective attempt, failures, substitutions,
  waivers, and the final contribution status. Cost is never attributed to a slot that did not
  run, and a failed attempt is never hidden from totals or from details.
- Opening or cancelling a workflow modal produces **no** Usage record, because no provider
  attempt occurred. A model unavailable before Start likewise produces none.
- A scheduled build that is `Held` or `Failed` before run admission produces no Usage; only an
  admitted dispatch does.
- Goal-driven and crew Plan execution are attributed under the topology that actually ran, and
  BSD advisor Usage stays separately attributed as it already is.
- Provider-native accounting is a noncanonical observation. Puppet Master's own attempt records
  are the attribution authority.
