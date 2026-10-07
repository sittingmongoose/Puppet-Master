# Intake and timing admission — D-M15-A/treatment/fresh_transport_scout-v3

Recorded: 2026-10-07T20:51:39Z (host `date -u` at intake)

## Timing admission (rule: min of the three INPUT_MAP timestamps; no reset)

| Bound | Value |
|---|---|
| Common T0 | 2026-10-07T20:31:30.755788+00:00 |
| Prospective admission (admission-timing.json) | 2026-10-07T20:49:58.323108+00:00 |
| Admission + stage allowance (20 min) | 2026-10-07T21:09:58.323108+00:00 |
| Stage latest absolute deadline | 2026-10-07T21:51:30.755788+00:00 |
| Common pair hard deadline | 2026-10-07T22:11:30.755788+00:00 |
| **Actual effective deadline (min)** | **2026-10-07T21:09:58.323108+00:00** |

The admission-timing.json `deadline` field matches the computed minimum exactly.

## Inputs read (complete list)

1. `jobs/D-M15-A/treatment/fresh_transport_scout-v3/assignment.md`
2. `jobs/D-M15-A/treatment/fresh_transport_scout-v3/INPUT_MAP.json`
3. `jobs/D-M15-A/treatment/fresh_transport_scout-v3/admission-timing.json`
4. `cases/D-M15-A/inputs/brief.md` (original brief; six obligations confirmed verbatim)
5. `cases/D-M15-A/inputs/sources.json` (manifest: `sources: []`, `mode: OPEN_DISCOVERY_BRIEF_ONLY`)

## Mode confirmation

- `OPEN_DISCOVERY_BRIEF_ONLY` confirmed: `sources` and `predecessors` are empty in INPUT_MAP; manifest is intentionally empty per its `open_discovery_note`. No sibling answer, control/treatment counterpart, v1/v2 science or failures, evaluator facts, root failure analysis, other cases, reviews, helpers, campaign or history paths were opened.

## Scope note for later tickets

Source selection is open discovery: this scout picks its own public primary docs/code within the bounded module allowance; no supplied component names or answer list exist to follow.
