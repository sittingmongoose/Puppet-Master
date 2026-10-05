# Direct native Goal-status projection

Use export.py --jobs-json ABS_REGISTRY --out-dir FRESH_EXPORT_DIR. Optional --include-route-canaries ABS_ENGINE_ROOT adds only the explicitly named saved probe-001, canary-001 and canary-002 exercises. It starts no native process, model request or test canary and edits no runtime, accounting, registry or old export.

The registry selects terminal family-Z stage locators only. Operational labels never determine Goal status. project(job, native_receipt_path) and goal_objects(snapshot, expected_goal_id, expected_session_id) are the reusable structural APIs. Only recognized native target.status values with a direct targetId are admitted. Goal/session identity mismatches are excluded; conflicting native objects remain UNKNOWN.

Each row exports the last directly observed native status, Goal ID, native target-record update time, source SHA-256 and exact JSON pointer. A saved final native UI object is preferred. If missing, only exact saved native session/read or non-activation session/goal RPC replies can supply a status. Activation alone is earlier evidence and is excluded from final status fallback. Saved RPC observations may precede shutdown; they do not imply a later status.

Native target.updatedAt describes the target record's last update; it is not assumed to be the exact transition time. RPC host observation time is separately labeled. Missing time remains unknown. Missing direct status stays UNKNOWN even if artifacts exist, responses occurred, the job is marked complete or the router reports completed/cap/error.

The exported status does not establish semantic quality, complete pipeline execution, current process occupancy or monetary cost. Counts separate candidate stages from route exercises. Original accounting cohorts remain unchanged. This additive export supplies direct status evidence after the cohorts001..003 router-status erratum.

NATIVE_GOAL_STATUS.json and MANIFEST.json contain positive structural fields only. Referenced native snapshots/protocol bodies, candidate strings, private HOME/storage and auth are excluded from publication. Three local selector regression tests use synthetic metadata and no candidate interpretation or inference.
