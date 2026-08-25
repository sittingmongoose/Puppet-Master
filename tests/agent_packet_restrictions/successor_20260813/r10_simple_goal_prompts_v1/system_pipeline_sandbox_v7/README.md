# R10 storage-plan system pipeline matrix v7

This sandbox processes the full already-standardized `Plans/storage-plan.md` through canonical PlanUnit extraction, acceptance-unit generation, document cards, dependency resolution against the frozen existing registry, migration-coverage validation, canonical-subset comparison, and the pre-WorkNode readiness gate.

The full plan is processed deterministically by the host. Each subject receives only the 2,318-byte phase-receipt capsule compiled into a 3,050-byte Codex prompt or 3,036-byte OMP prompt. OMP uses one external interactive `/goal` submission with both advisor controls off. Codex uses one fresh app task prompt beginning `Create a goal that`. No subject receives the plan body or a controller follow-up. OMP persists one hidden active-Goal context before the external user message and may later schedule one native hidden automatic continuation. V7 admits those records only when their bytes exactly match OMP 18.0.4's frozen templates rendered from the same objective and monotonic Goal state.

This is the simplified evidence successor to the preserved V6 failure. V1 hid canonical output-token renamings; V2 used a lossy rendered-TUI scorer; V3 did not submit its coalesced multiline input; V4 confused OMP's required `goal-mode-context` with a continuation; and V5 overfit Ox's thinking and assistant segmentation to Cursor. V6 recognized both observed lifecycle shapes, but its fresh Ox row completed native Goal and produced the exact typed result before being permanently false-negatived because its tool-use assistant also contained explanatory text. V7 changes no subject, scorer, transport, route, timeout, or provider bytes. For the standard two-assistant cycle it permits at most 4,096 UTF-8 bytes of preserved text before the final Goal-call block, never treats that text as result evidence, and scores only the distinct final assistant after the joined successful Goal result. Cursor's aggregate branch retains its separate post-call result rule. Earlier diagnostic rows remain failed and receive no retro-credit.

The correct result is structural pass plus blocked readiness. The global baseline already has one stale generated node-readiness artifact and PNC-019 executable runtime certification remains incomplete. Every row must preserve those blockers and report zero WorkNodes created.

The matrix contains the user-prescribed six OMP and six native Codex route/effort pairs. It runs twice on unchanged bytes/configuration, with fresh identities. Every OMP row binds a just-in-time raw advisor/config preflight receipt into its launch receipt and the ordinal launch journal. Ox Alpha/free is first, Cursor is second, and Qwen is last. Model-specific failures remain failures; elapsed time alone is not a correctness failure.

Useful zero-subject commands:

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -B pipeline.py preflight
PYTHONDONTWRITEBYTECODE=1 python3 -B pipeline.py verify
PYTHONDONTWRITEBYTECODE=1 python3 -B selftest.py
```

`omp_row_runner.py` launches one frozen OMP row in one interactive PTY, performs the frozen prompt-then-acknowledgement-then-Enter transport for one `/goal` submission, waits without treating slowness alone as failure, and preserves both writes, the causal composer snapshots, the accepted persistent-session prefix, the final session, TUI capture, and terminal receipt. `verify_matrix.py pass_01 pass_02` grants qualification credit only if all 24 independently requested rows have native Goal completion, exact typed output, unchanged prompt/configuration, fresh unique identities, and retained raw evidence. This package never creates NodeSeeds or WorkNodes and does not claim production readiness or canonical Plan completion.
