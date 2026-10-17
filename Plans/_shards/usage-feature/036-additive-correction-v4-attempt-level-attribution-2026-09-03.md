# Shard 036: Additive Correction v4 — Attempt-Level Attribution (2026-09-03)

Source: `Plans/usage-feature.md`

Source lines: L6959-L6974

Source SHA256: `325b80093ce7379a3218fa19592809eea166f4d84d83715004b26f184430a418`

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
