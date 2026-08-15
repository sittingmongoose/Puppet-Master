# Successor preflight V2 — NOT_READY

Terminal: `NOT_READY`

V2 failed `V2-IO-001`. During controller qualification, diagnostic shell redirection created `/tmp/v1_hist_extract.txt` and `/tmp/v1_surface_extract.txt` outside the exclusive successor write root. The exact defect is preserved in `control_plane_defect-0001-diagnostic-shell-redirection.md`. The files were not deleted, and deletion would not cure the breach.

No qualifying V2 checker run occurred. The other 18 checks remain blocked and no V2 PASS credit may transfer to a later attempt.

V1 separately remains permanently `NOT_READY` with `DP-020` failed. Subject/provider/model/route/auth/config/canary/pilot/fleet/reviewer/repair calls remain `0` in both attempts.

This failure is process evidence only. It is not empirical model evidence, production enforcement, runtime or implementation completeness, canonical Plan compile readiness or permission, release readiness, safety certification, provider/auth readiness, or permission to launch a subject.
