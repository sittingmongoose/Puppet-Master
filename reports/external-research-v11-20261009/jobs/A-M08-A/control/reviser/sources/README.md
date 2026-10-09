# Reviser-stage sources — navigable index (A-M08-A control)

Stage: reviser (M08). Source IDs R1–R8 are immutable within this stage and disjoint from
research S1–S10 and critic C1–C17. Definitions live in `../source-map.json`.

## Internal inputs (read-only)

- **R1** — `assignment.md` + `input-map.json` (this stage's task contract).
- **R2** — `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/cases/S08/brief.md`
  (sha256 `cc962dde…e73cf`).
- **R3** — the 7 declared predecessors: `../../research/{draft.md, discovery.md,
  source-map.json, revealed-plan.md}`, `../../critic/{source-map.json, critique.md,
  verification.md}`.

## Retained evidence in declared source roots (re-verified this stage, not copied)

- **R4** — `../../research/sources/`: stable-2.3.0 provider (sha `c59fa688…26a4`) and
  v1.10.0 provider (sha `3c9fc645…6fcb`). Re-hashed; content greps; `wc -l` 124/122.
- **R5** — `../../critic/sources/`: v1.6.0 (`0ea6b005…a33e`, 111 lines, 0 balance),
  v2.0.0 and v2.2.0 (both `c59fa688…26a4`, byte-identical to stable), VolunteerHub
  snapshots (home `b6c0710e…`, scheduling `8977c47d…`) — phrase-verified.

## New live operations this stage (evidence retained here)

- **R6** — live fetch of the v2.0.0 restructured-path provider: HTTP 200, 124 lines,
  2 balance occurrences, sha `c59fa688…26a4` (byte-identical to three retained copies;
  fetched copy intentionally not re-retained). Operation record:
  `live-refetch-v200-20261009T2153Z.md`.
- **R7** — live probe of the old `use-cases/` path at v2.0.0: HTTP 404 (path absence →
  restructure confirmed). Same operation record.
- **R8** — deliberate non-refetch of Timefold API-semantics pages (critic C16's four
  404s stand; semantics remain unevidenced, adjudication M8).

## Stage outputs

`../predecessor-notes.md` (ticket 1) → `../adjudication.md` (ticket 2) →
`../final.md` (ticket 3, the deliverable) → `../source-map.json` + this index
(ticket 4).
