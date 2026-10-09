# Native Goal lifecycle and science-ordering record — reviser, A-M11-A control (case S11, method M11)

Ordering guarantee required by the assignment: complete required scientific artifacts are saved before native Goal terminal completion; after terminal, only mechanical delivery happens. This record is the on-disk evidence of that ordering, written 2026-10-09T21:07Z.

## Science artifacts saved (verified on disk, `test -s`, before terminal)

| Artifact | Bytes (non-empty) | mtime (UTC) | Content check |
|---|---|---|---|
| `final.md` | 34506 | 2026-10-09 21:03:31 | complete O1–O6 + all six P clauses; all 12 critique findings adjudicated and reflected |
| `source-map.json` | 12472 | 2026-10-09 21:06:11 | valid JSON; 13 immutable IDs S01–S13 with URLs/locators/access windows/operations; drift notes on S04 and S12 |
| `adjudication.md` | 7244 | 2026-10-09 21:00:25 | explicit verdicts for all 12 criticisms (M1–M5, m1–m7), evidence-grounded |
| `sources/index.md` | 3365 | 2026-10-09 21:05:24 | navigable evidence index, all 13 IDs |
| `sources/S12-reviser-reattempt.md` | 1341 | 2026-10-09 21:05:07 | this stage's one bounded re-access record (HTTP 404) |

All mtimes precede the stage deadline 2026-10-09T21:15:13.652573Z and precede native Goal terminal completion (the goal loop had not reached its terminal round when these were verified; the verification itself ran at 21:07:06Z, round 4 of 5).

## Native lifecycle fields

The native Goal runs through the installed top-level driver; the infrastructure guard forbids invoking goal_start, thread launches, or any new verification/session context to observe it, and unobservable lifecycle stays UNKNOWN rather than being fabricated:

- native Goal terminal completion timestamp: **UNKNOWN at the time of this record's writing** (terminal had not yet occurred; it will occur only after the loop's final round, after which no substantive files are written — mechanical delivery only)
- native Goal identifier / internal session handle: **UNKNOWN** (not exposed to this stage; not queried per the guard)
- usage/billing: **UNKNOWN** (assignment states unobserved; recorded null in `source-map.json`)

What IS observable and recorded: the local filesystem timestamps above prove every required science artifact was complete and non-empty before the loop's terminal round. If any of the UNKNOWN fields above are later filled by the harness's own records, those external records govern; nothing in this file invents values for them.
