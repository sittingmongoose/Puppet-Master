# Native Goal lifecycle record — A-M03-B / treatment / research

Recorded 2026-10-09 ~19:55 UTC from actually observed calls. This is a lifecycle record, **not a receipt**: no receipt-shaped JSON is handwritten anywhere, per the assignment. Fields this harness does not expose are marked UNKNOWN.

## Ordering proof (science before terminal completion)

All scientific artifacts were written before the native Goal's terminal completion:

| Artifact | Last written (UTC, mtime) |
|---|---|
| source-map.json | 19:38 |
| sources/ (12 evidence files + index.md) | 19:35–19:38 |
| discovery.md | 19:39 |
| revealed-plan.md / plan-reveal.json (reveal) | 19:40:52 |
| draft.md | 19:43 |
| final.md | 19:48 |
| criticism.md | 19:49 |
| **native Goal run terminal completion** | **19:52:32** |

The Goal itself independently confirmed discovery.md's sha256 (`6b24fc78…5197`) equals the value frozen in plan-reveal.json by the reveal script — i.e. discovery was not modified after reveal.

## Actual lifecycle (exposed calls only)

- **Creation.** Call: `t3_thread_launch` (the actual supported native primitive of this harness for a fresh Goal-like thread; no Goal-specific API is exposed, so "native Goal id" as a distinct field is UNKNOWN — the thread id below is the real identifier). Objective: 1,860 characters (< 4000), referring to the assignment by exact path.
  - threadId: `mcp:1a93aa3c-fc17-4c29-904c-7176e685d9ee`
  - runId: `run:thread:mcp%3A1a93aa3c-fc17-4c29-904c-7176e685d9ee:ordinal:1`
  - created (server): 2026-10-09T19:51:08.188Z; run requested 19:51:08.201Z
  - model: `builtin:zai-coding-plan\GLM-5.3-Flash` via provider instance `zcode` — matches `native_route: "glm"` from input-map.json; the thread ran on the same installed native integration loop as this top-level agent (no second model Goal demanded or used).
- **Activation.** Run started 2026-10-09T19:51:13.752Z (status progressed preparing → running → completed; observed via `t3_thread_read`).
- **Work.** The Goal read assignment.md and input-map.json, listed the stage directory, verified every artifact's existence and substance, checked P1–P6 verbatim presence, checked per-P dispositions in draft.md and final.md, and recomputed discovery.md's sha256 against plan-reveal.json. It respected the read limits (dispatch.json / dispatch-request.json / freeze.json present but unread; nothing outside the stage; no network).
- **Terminal completion.** Run status `completed` at 2026-10-09T19:52:32.570Z — i.e., AFTER every scientific artifact was saved (ordering table above). Final answer delivered as a complete substantive message (not a short status); exported verbatim to `native-answer.md` as the predeclared fallback export.
- **Post-terminal.** Only mechanical delivery followed: this lifecycle record, the verbatim export, and settling the thread. No further substantive work after terminal.

## Unavailable fields (marked UNKNOWN, honestly)

- Native Goal activation/receipt object: UNKNOWN — this harness exposes no receipt/activation API; per the assignment, actual supported calls are used and no receipt JSON is handwritten.
- Native billing/usage for the Goal run: UNKNOWN (usage/billing unobserved null per assignment; the harness surfaced only "64.8k cache-read tokens" in a turn-info line, which is not a billing record).
- Goal-specific fields (goalId distinct from threadId, native objective-versioning, Luna/Muse-specific handles): UNKNOWN / not exposed by this harness.
- T3-side vs native-side completion are recorded separately: the T3 thread state (`completed`, settle action below) and the run's terminal status are distinct facts, both actual observations.

## Thread disposition

The Goal thread is settled after its result was consumed (house rule: settle worker threads once their result is in). Settle action: `t3_thread_organize` action `settle` on `mcp:1a93aa3c-fc17-4c29-904c-7176e685d9ee`.
