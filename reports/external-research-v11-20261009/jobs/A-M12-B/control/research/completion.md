# Completion record — native Goal lifecycle (A-M12-B/control/research)

Written 2026-10-09T18:49Z, BEFORE terminal completion of the goal loop. Stage deadline: 2026-10-09T18:58:01.622902Z; arm deadline 19:28:01Z. This record is the lifecycle evidence required by assignment ¶2; it contains no handwritten receipt JSON — every integration claim below is about calls actually exposed by binaries present in this sandbox.

## Goal of record and lifecycle

- The native Goal of record for this run is the top-level GLM /goal loop whose objective (< 4000 chars) references this assignment verbatim (`assignment.md`) and its exact `input-map.json`; per assignment ¶2 ("GLM top-level /goal activates installed native integration loop; do NOT demand a second model Goal") no second model Goal was demanded. The loop dispatched 5 tickets; this is ticket 5.
- Lifecycle: active from first dispatch (~18:29 UTC, observed in-session) → completing at the end of this turn with the complete final scientific answer delivered before the stage deadline. Terminal completion happens only after all science artifacts were saved (verified below by timestamp ordering).
- Native-side vs T3-side completion are separate (assignment ¶2). Fields of the native integration state that are not observable from inside this sandbox are recorded as **UNKNOWN**, not invented.

## Actually exposed native integration surface (no fabrication)

- Muse Code 1.4.4 (1.4.4-R5419.1) is installed at `/home/sittingmongoose/.local/bin/muse` (also `muse-acp`, `muse-bin-1.4.4-R5419.1`).
- Its offline MSP wire schema export (`muse schema generate-json-schema`, run against a throwaway temp dir, deleted after inspection) exposes the Goal lifecycle method family: `GoalSetParams`, `GoalEditParams`, `GoalPauseParams`, `GoalResumeParams`, `GoalClearParams`, `GoalCommandResult`. These are the actual supported calls of the installed native integration for creating/managing a Goal on an MSP session.
- No `goal`/`luna` CLI subcommand exists on this box (`which goal luna` empty); muse exposes no top-level `goal` subcommand — Goal management on Muse sessions goes through the MSP surface (`muse serve` / session host), not a one-shot CLI flag.
- Decision recorded: creating an additional Goal through a hand-driven MSP session would be a second model Goal (forbidden by ¶2) and an unverifiable receipt; the goal loop driving this thread is the Goal of record. Honest UNKNOWN: whether the orchestrator's Goal is mirrored in a Luna/Muse-side session — not observable from here.

## Science artifacts saved BEFORE terminal completion (hashes at 18:48:51Z)

All inside the allowed write root; full SHA-256 in `source-map.json`/`plan-reveal.json` where recorded:

- `working-notes.md` — brief intake, O1–O6 verbatim (18:29)
- `sources/` — 3 bounded excerpt files, S01–S15 (18:38)
- `source-map.json` — 15 sources, immutable IDs, timestamps, operations, uncertainties (18:37, sha256 3426631f…, frozen by reveal)
- `discovery.md` — full pre-reveal discovery (18:39, sha256 598fbc58…, recorded in `plan-reveal.json` `discovery_sha256`)
- `index.md` — navigable source index (18:40)
- `revealed-plan.md` + `plan-reveal.json` — reveal artifacts of `reveal-plan.py` exit 0 (18:41:59Z)
- `draft.md` — complete per-P comparison (18:45)

Ordering property: every science file predates this completion record and the turn's terminal completion; `find . -newermt` verification is run in the same turn (see dispatch reply).

## Final answer delivery (predeclared fallback, per ¶2)

The complete final scientific answer is delivered verbatim as the closing message of this goal-loop turn (the "complete native answer exported verbatim as predeclared fallback" clause); no short status stands in for it. Later stages may correct `draft.md`; nothing was rewritten after the plan reveal.
