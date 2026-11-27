# Pinned copy of the admission gate's static raise-site module (addendum 11, method 2)

KILLED_CODE's fallback (`pm_goal_dg5_boundaries.static_single_raise_site`) loads only these two files,
and only when both match the sha256 pinned in `GATE_E2_PIN` there. Any other bytes fail closed.

| File | sha256 | Copied from |
|---|---|---|
| `code_sites.py` | `917c77b7e884d0e33f6d12f9d37385880f3e7ebb8be6ad36e6a59286225cc609` | `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/c12-dg5/qwen-lane-b-declare-v22-triage-20261122/code_sites-e3.py` (edition e3, 2026-11-22; boundaries-n2, T323 N1) |
| `proof_sources.py` | `335bbb989dafa21df7510bda9182693a9231cf559d39b646a7752c7b40fd837e` | the same folder (code_sites loads it from its own directory) |

Review rule (judge-fix review (c), pm-ea-lead 1121170432-94b6): the fallback must load a reviewed, pinned file.
A new edition of the gate module is a new pin: copy both files here, update `GATE_E2_PIN`, and have it reviewed.
