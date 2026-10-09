# Native Goal lifecycle record — A-M06-B/treatment/critic

Recorded 2026-10-09T21:37:00+00:00. Native route per input-map.json: **glm**.

## Observed lifecycle (only what this worker can actually see)

- The native Goal is the **already-active top-level /goal loop** (per the assignment's
  infrastructure guard: top-level /goal activates the installed native driver). This
  worker received and answered in-loop dispatch/verification rounds — tickets 1–4 of 5
  observed active as of this record. No second model Goal was demanded or created.
- No goal_* API call is exposed to this worker. goal_start, t3_thread_launch,
  create_threads, delegate_task and any new verification/session context are forbidden by
  the same guard and were **not invoked**. No handwritten receipt JSON was fabricated.

## Unobservable fields (UNKNOWN, honestly null)

- Goal object ID / registration receipt: UNKNOWN
- Activation event internals, queue timestamps: UNKNOWN
- Terminal-completion event internals: UNKNOWN (terminal not yet reached at record time)
- Usage/billing observations: null (unobserved)

## Science-before-terminal ordering (verifiable, mtime UTC)

- evidence-first.md  — saved 2026-10-09 21:28:41 (9,382 bytes)
- critique.md        — saved 2026-10-09 21:32:45 (9,962 bytes)
- source-map.json    — saved 2026-10-09 21:35:28 (10,317 bytes; sources/ dossiers 21:34)
- Record time 21:37:00 — the native Goal is still active (loop at ticket 4/5), so any
  terminal completion necessarily postdates all science saves above. After terminal,
  only mechanical delivery remains.
