# R10 storage-plan system pipeline matrix

This sandbox processes the full already-standardized `Plans/storage-plan.md` through canonical PlanUnit extraction, acceptance-unit generation, document cards, dependency resolution against the frozen existing registry, migration-coverage validation, canonical-subset comparison, and the pre-WorkNode readiness gate.

The full plan is processed deterministically by the host. Each subject receives only the 2,047-byte phase-receipt capsule compiled into a 2,961-byte Codex prompt or 2,947-byte OMP prompt. OMP uses one interactive `/goal` prompt with both advisor controls off. Codex uses one fresh app task prompt beginning `Create a goal that`. No subject receives the plan body or a follow-up prompt.

The correct result is structural pass plus blocked readiness. The global baseline already has one stale generated node-readiness artifact and PNC-019 executable runtime certification remains incomplete. Every row must preserve those blockers and report zero WorkNodes created.

The matrix contains the user-prescribed six OMP and six native Codex route/effort pairs. It runs twice on unchanged bytes/configuration, with fresh identities. Every OMP row binds a just-in-time raw advisor/config preflight receipt into its launch receipt and the ordinal launch journal. Ox Alpha/free is first, Cursor is second, and Qwen is last. Model-specific failures remain failures; elapsed time alone is not a correctness failure.

Useful zero-subject commands:

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -B pipeline.py preflight
PYTHONDONTWRITEBYTECODE=1 python3 -B pipeline.py verify
PYTHONDONTWRITEBYTECODE=1 python3 -B selftest.py
```

`verify_matrix.py pass_01 pass_02` grants qualification credit only if all 24 independently requested rows have native Goal completion, exact typed output, unchanged prompt/configuration, and retained raw evidence. This package never creates NodeSeeds or WorkNodes and does not claim production readiness or canonical Plan completion.
