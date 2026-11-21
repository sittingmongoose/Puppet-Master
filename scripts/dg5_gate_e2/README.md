# Pinned copy of the admission gate's static raise-site module (addendum 11, method 2)

KILLED_CODE's fallback (`pm_goal_dg5_boundaries.static_single_raise_site`) loads only these two files,
and only when both match the sha256 pinned in `GATE_E2_PIN` there. Any other bytes fail closed.

| File | sha256 | Copied from |
|---|---|---|
| `code_sites.py` | `4ffb2b834c95e5e229e66fc0012b8195238a9db4f57bfefee4d1c45f2a37ca2b` | `/home/sittingmongoose/pm-scratch/ea-c12-dg5/admission-gate/gate-e2/code_sites.py` (2026-11-21) |
| `proof_sources.py` | `335bbb989dafa21df7510bda9182693a9231cf559d39b646a7752c7b40fd837e` | the same folder (code_sites loads it from its own directory) |

Review rule (judge-fix review (c), pm-ea-lead 1121170432-94b6): the fallback must load a reviewed, pinned file.
A new edition of the gate module is a new pin: copy both files here, update `GATE_E2_PIN`, and have it reviewed.
