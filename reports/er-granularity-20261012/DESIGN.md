# ER granularity pilot — frozen design (2026-10-12)

Mastermind: Muse (this thread). Purpose: test whether task granularity, not stage
scheduling, is the lever that lets flash-class models do source-grounded external
research without quality loss. This is a process experiment on frozen sandbox inputs.
No canonical Plans are edited and no findings land.

## Routes (locked; `codex_lexx`/lexxmariah is forbidden)

- Orchestration help: Codex `gpt-6.1-sol` on `codex_gmail` — `max` for hard work
  (gold/rubric), `high` for easy work (inventory/mechanical). Standard tier.
- Candidate Luna: `gpt-6-luna`, `reasoningEffort=max`, Standard, on `codex_gmail`
  (overflow `codex_party` only if recorded).
- Candidate GLM: zcode provider only, `GLM-5.3-Flash`, `thought=max`. Max 2 concurrent.
- Candidate DeepSeek: OMP provider only, `opencode-go/deepseek-v4.1-flash`,
  `thinking=high` (highest offered; no max). Max 2 concurrent.
- Candidate science is flash-only. Sol is orchestration/grading only and its cost is
  reported separately, never as candidate cost.

## Goal rule (pragmatic, no broker archaeology)

Every candidate assignment is one delegated task whose prompt IS the goal: one bounded
question, self-contained, with one named output file under the sandbox. Workers are
told to create their harness's native Goal if one exists and to state plainly if it
does not. Lack of a native Goal tool is recorded as a route fact, not repaired in
this pilot. Completion = output file present and readable. Format variants are
normalized by a tolerant host/grader read, never by rejecting an arm.

## Phase 0 — route and micro-atom smokes (per candidate model, 3 atoms)

1. Extract: from one host-supplied source slice, list claims with exact quotes + conditions.
2. Verify: label given claims entailed/contradicted/undetermined against a passage (traps included).
3. Write: produce the output file in the loose line format requested.
Scored mechanically plus a Sol High check. A model that cannot do atoms is not
promoted to Phase 1 on hope.

## Phase 1 — same frozen case, two shapes, three models (6 arms)

- Shape M (monolith control, R0-lite): ONE Goal — brief + plan + sources to a
  complete findings report. This is the incumbent shape, scaled to one context.
- Shape P (bounded packets): host decomposes the same obligations into 6–8 Goals —
  extraction per source/packet, verification per claim cluster, comparison per
  finding×clause group, one integration Goal that may use only verified records.
  Host does fetching, storage, quote-string checks, and assembly.

Same case, same sources, same output obligations, same wall-clock envelope target
(45 min/arm), no scope reduction. Quality bar is unchanged: non-inferior complete
delivery, graded blind.

## Case and gold

One frozen case first, selected from ER11/ER12 case material with documented
condition traps and complete brief/plan, so the gold checklist (key propositions,
governing conditions, known overgeneralization traps) already partly exists and is
re-verified against primary sources by a Sol Max worker before any arm runs.
A second case runs only if Phase 1 produces a readable signal.

## Metrics (per arm, failures included)

Material errors; unsupported consequential claims; conditions found vs dropped;
gold-proposition coverage (regression only, not unknown-discovery proof);
plan-disposition correctness; format/delivery failures; wall time T0→final;
contexts used; provider counters where exposed; subscription route used.
No dollar figure is invented from context-seconds.

## Grading

Blind Sol Max graders, one per arm, model/shape labels hidden where practical,
grading against brief, plan, sources, and gold checklist. Grader cost is experiment
overhead and is reported as such. A sample of unanimous "verified" packet claims is
spot-audited, not only disagreements.

## Kill / stop rules

- Phase 0 atom failure on a model → that model does not enter Phase 1; record why.
- Any arm exceeding the envelope is stopped and scored as delivered.
- If Shape P is not at least as correct as Shape M on the same model, no packet
  tuning rounds in this pilot; report and stop.
- No additional architectures, no ER14 sweep, no Plans edits.
