# R8 candidate v1 — pure bounded architecture harness

This create-only disposable candidate binds exclusively to the frozen 15-file throwaway Plans fixture whose descriptor is `28730f6ea44a5720cb8e473f8fb736353dfe5c412e21261eacc88d70ffe46392`. It never reads live `Plans/**`, calls a provider, writes evidence, retries a subject, or grants empirical credit. The external controller owns task creation and durable capture.

The candidate removes model ownership of copied identity/lineage/authority fields. Both S10 topics use one closed-option decision call per decision. Both use one edge candidate per call. Topic A uses one tension candidate per call; topic B recomputes the frozen generic fact router over fresh decision outputs and renders only `semantic_subject` candidates. S30 hides the candidate value and asks for an independent closed-option answer; a reducer then mechanically projects `clean/null` or `finding/typed-selected-choice`. S50 and S60 retain the passing R6-v7 semantic design.

Exact subject schedule per route (97 fresh tasks):

- `S10A_DECISION_A01` … `S10A_DECISION_A18` (18)
- `S10B_DECISION_B01` … `S10B_DECISION_B18` (18)
- `S10A_EDGE_A-E07`, `S10A_EDGE_A-E01`, `S10A_EDGE_A-E04`, `S10A_EDGE_A-E08`, `S10A_EDGE_A-E02`, `S10A_EDGE_A-E05`, `S10A_EDGE_A-E03`, `S10A_EDGE_A-E06` (8)
- `S10B_EDGE_B-E03`, `S10B_EDGE_B-E09`, `S10B_EDGE_B-E01`, `S10B_EDGE_B-E07`, `S10B_EDGE_B-E10`, `S10B_EDGE_B-E02`, `S10B_EDGE_B-E08`, `S10B_EDGE_B-E04`, `S10B_EDGE_B-E06`, `S10B_EDGE_B-E05` (10)
- `S10A_TENSION_A-T03`, `S10A_TENSION_A-T01`, `S10A_TENSION_A-T02`, `S10B_TENSION_B-T01` (4)
- `S30_A01` … `S30_A18`, `S30_B01` … `S30_B15`, `S30_B17`, `S30_B18` (35; B16 remains deterministic)
- `S50_SEMANTIC` (1)
- `S60_P_I-E99`, `S60_C_I-E99`, `S60_K_I-E99` (3)

Deterministic order is decisions, edges, routed tensions, S20, S30, S40/S45, S50, S55, S60, S70/S80/S90. A failed subject path stops before downstream subject calls. Every invocation must use a new task and fresh context.

The pure command surface is:

```text
PYTHONDONTWRITEBYTECODE=1 python3 r8_harness.py preflight
PYTHONDONTWRITEBYTECODE=1 python3 r8_harness.py list-cells
PYTHONDONTWRITEBYTECODE=1 python3 r8_harness.py render --cell CELL --slot SLOT --execution-root ABSOLUTE_RUN_EXECUTION_ROOT
PYTHONDONTWRITEBYTECODE=1 python3 r8_harness.py expected --cell CELL --slot SLOT --execution-root ABSOLUTE_RUN_EXECUTION_ROOT
PYTHONDONTWRITEBYTECODE=1 python3 r8_harness.py score --cell CELL --slot SLOT --execution-root ABSOLUTE_RUN_EXECUTION_ROOT --capture ABSOLUTE_CAPTURE_PATH
PYTHONDONTWRITEBYTECODE=1 python3 r8_harness.py measure --cell CELL --slot SLOT --execution-root ABSOLUTE_RUN_EXECUTION_ROOT
PYTHONDONTWRITEBYTECODE=1 python3 r8_harness.py reduce --stage STAGE --slot SLOT --execution-root ABSOLUTE_RUN_EXECUTION_ROOT
```

`render` emits render storage with exactly one terminal LF. The controller must remove that LF before dispatch and bind both the render-storage and provider-visible payload hashes. JSON commands emit canonical minified JSON plus one LF. The controller must store every capture as canonical payload plus exactly one LF. `execution-root` must stay beneath `successor_20260813/`; it is read-only to this harness.

Static/deterministic success is not empirical model success, current-Plans evidence, production enforcement, planning-wizard completeness, release readiness, safety certification, or permission to compile Plans.
