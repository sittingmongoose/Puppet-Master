# ER11 reusable recipe component qualification — result

Verdict: PASS (finite component check only). One minor defect (bootstrap text call shape). A successful component check does not prove external research quality or a production improvement.

- Date (UTC): 2026-10-09T21:53Z (deadline 2026-10-09T21:59:56Z)
- Assignment: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/helpers/recipe-qualification/assignment.md`
- Native Goal: `goal-01a122a6-7073-7672-8af9-30fd59ca9cf0` (active during checks; results saved before terminal)
- Case inputs: `cases/S04/brief.md` (1406 bytes, sha256 `3d8f2bf8…ff0e5`), `cases/S04/plan-root-only.md` (362 bytes, sha256 `ba17f0ff…a2315`)

## Sources (read-only, originals untouched)

Reusable originals (sha256 at check time):

- `reusable/prepare.py` `ae736bfb…11ae70a7`
- `reusable/reveal.py` `ec957920…908abe`
- `reusable/bootstrap.js` `f8b21ce3…623595`
- `reusable/config.example.json` `d60a3683…20747e44`

Read only: assignment, `reusable/README.md`, `prepare.py`, `reveal.py`, `bootstrap.js`, `config.example.json`, `reusable/REFERENCE_WORKFLOW.md`, `cases/S04/brief.md`, `cases/S04/plan-root-only.md`. No candidate/evaluator science read. No `delegate_task`, no real workers, no polling, no Git, no provider/config changes.

## Method

Owned scratch under own output dir (deleted after checks):

- Scratch: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/helpers/recipe-qualification/scratch-own-qual1/` (copies of `prepare.py`, `reveal.py`, `bootstrap.js`, `config.example.json`)
- Test config: `<scratch>/config.json` (`run_id=qual1-run1`, `runtime_root=/tmp/er11-qual-run1`, S04 brief/plan absolute paths, whole deadline now+2h, exact `codex_gmail/gpt-6-luna/max/priority` route, `runtime_mode=full-access`)
- All `prepare.py`/`reveal.py` runs used the scratch copies (`$S/prepare.py`, `$S/reveal.py`) with `$RT=/tmp/er11-qual-run1`, `$INV=$RT/stages/investigator`.

## Checks (exact commands, observed outcomes)

C1 — stage preparation (documented config):

- `python3 "$S/prepare.py" prepare --config "$S/config.json" --stage investigator`
- Observed: exit 0; created `control/run.json`, `inputs/brief.md`, `stages/investigator/{assignment.md,input-map.json,freeze.json,request.json}`; stable `clientRequestId=er11ref-qual1-run1-investigator-v1`; `native_goal_objective` length 195 (<4000) referring to `assignment.md`; stage deadline `now+1800s` capped by whole deadline; budget 1800. PASS.

C2 — no-plan initial input:

- `grep -r -F -e "shared calendar" -e "stock quantities" -e "reconcile by timestamp" -e "overwrites matching names" -e "free-text note" "$RT"` → no match (`NO_PLAN_BYTES_OK`).
- `sha256sum $RT/inputs/brief.md` equals S04 brief source; `run.json` records matching `brief_sha256`/bytes. Assignment instructs brief-only discovery. PASS.

C3 — configuration guards (each expected to fail, all failed correctly):

- Relative `runtime_root` → `runtime_root must be an absolute path` (`prepare.py:56-57`).
- `runtime_root=/tmp/concepts/x` → `must be a dedicated path outside canon and repository metadata` (`prepare.py:59-60`).
- Config inside `runtime_root` → `keep the config outside runtime_root` (`prepare.py:61-62`).
- `brief_path == plan_path` → `must be distinct` (`prepare.py:68-69`).
- Wrong provider → `provider must match the authorized current route exactly` (`prepare.py:77-78`).
- Changed budgets → `stage_budgets_s are frozen` (`prepare.py:80-81`).
- Bad `run_id` → charset error (`prepare.py:53-54`). PASS (7/7).

C4 — one-use reveal/hash behavior:

- No discovery → `save substantive discovery.md (>500 bytes)` exit 1 (`reveal.py:27-28`).
- 5-byte discovery → same failure. 600-byte discovery + empty `source-map.json` → `save source-map.json` exit 1 (`reveal.py:29-30`).
- Valid (600 B discovery + source map) → exit 0; receipt `single_use:true`, `discovery_sha256=5130b33e…f37c9` (600 B), `plan_sha256=ba17f0ff…a2315` (362 B); `revealed-plan.md` sha equals S04 plan source; post-write hash check passed (`reveal.py:56-57`).
- Second reveal → `exact plan may be revealed only once` exit 1 (`reveal.py:31-32`). PASS.

C5 — predecessor gates:

- `prepare --stage critic` with no investigator dispatch → `missing returned T3 dispatch for predecessor investigator` exit 1 (`prepare.py:146-147`).
- `deps --stage investigator` → `{"predecessors":[]}`. PASS.
- After faked `record` (taskId `task-fake-123`) + `record-status` (completed, no pending): critic with missing `draft.md` → `missing frozen predecessor output: …/investigator/draft.md` exit 1 (`prepare.py:180-181`).
- After writing `draft.md`: critic prepare exit 0 with `clientRequestId=er11ref-qual1-run1-critic-v1`. PASS.
- After appending `tamper` to `discovery.md` (+ faked critic dispatch/status/files): reviser prepare → `investigator discovery changed after exact plan reveal` exit 1 (`prepare.py:184-185`). Tamper detection PASS.

C6 — retry/idempotency and record guards:

- Re-prepare investigator with dispatch → `alreadyDispatched:true`, same taskId (`prepare.py:227-228`). PASS.
- Tampered frozen brief + re-prepare → `frozen brief copy differs; start a new run_id/runtime_root` exit 1 (`prepare.py:97-98`; blocked at `init_run` before redispatch). PASS.
- `record` with conflicting taskId → `idempotency retry returned a conflicting taskId` exit 1 (`prepare.py:301-302`). PASS.
- `record-status` with wrong taskId → `did not match exact dispatched taskId` exit 1 (`prepare.py:326-327`). PASS.
- `record-capabilities` then a changed snapshot → `capability snapshot differs` exit 1 (`prepare.py:315-316`). PASS.

C7 — bootstrap invocation compatibility (static + dry-run, no T3 calls):

- `bootstrap.js` invokes `prepare.py` with `record-capabilities` (L34), `deps` (L37), `record-status` (L45), `prepare` (L49), `record` (L67), each as `--config CONFIG --stage <stage> [--json …]`; all match `prepare.py` argparse actions/stages (`prepare.py:334-337`). PASS.
- `spec.args` keys: `clientRequestId, mode, role, title, target, runtimeMode, interactionMode, task`, passed verbatim to `delegate_task` (L64); shape matches the recorded dispatch pattern (`target={providerInstanceId,model,options}`). PASS.
- `record-status` accepts bootstrap's unpacked status via `raw.get("structuredContent", raw)` (`prepare.py:325`); `record` accepts raw response with `structuredContent` or text-JSON (`prepare.py:286-294`); `record-capabilities` snapshot keys match (`prepare.py:314`, `bootstrap.js:29-33`). PASS.
- Memory gate parses `free -g` last `Mem:` column as available GiB and blocks when `<6` or unparseable (L57-63, fail-closed). PASS.
- Defect D1 (minor): `bootstrap.js:61` calls `text({...})` with an object while L42/L52/L68 call `text(JSON.stringify(...))`. See Defects.

C8 — no downloaded software/installers:

- Broad grep for `curl|wget|pip install|npm install|apt-get|download|\.dmg|\.exe|\.pkg|installer` over scratch `prepare.py`/`reveal.py`/`bootstrap.js` matched only: (a) `prepare.py:197` prompt text `Do not run downloaded code` (a prohibition, not a download), (b) `bootstrap.js:8,20,57` via `.exe` substring matching `exec_command`/`functions.exec`. No `curl`/`wget`/package-install/download/installer behavior exists in the helpers. No files were downloaded during checks (only `$RT` runtime files + scratch copies, all deleted). PASS with false-positive explanation.

C9 — config template:

- `config.example.json` carries `replace-with-a-unique-run-id`, `/absolute/caller/path/…`, `REPLACE_WITH_ABSOLUTE_UTC_DEADLINE` placeholders, matching README's "replace every REPLACE/example path" instruction. PASS.

## Defects

- D1 (minor, cosmetic/robustness): `reusable/bootstrap.js:61` — `text({blocked: …})` passes an object; every other `text()` call in the file (lines 42, 52, 68) passes `JSON.stringify(...)`. If the T3 `text()` helper expects a string, the memory-gate block message may render as `[object Object]` or throw instead of showing `availableGiB`. Proposed patch (`patch-bootstrap-text.diff`, optional): wrap in `JSON.stringify(...)` like the others. No behavioral effect on dispatch correctness was observed (static finding; T3 runtime not invoked).
- N1 (note, not a defect): `prepare.py:162` / `bootstrap.js:41` treat a missing `hasPendingChildRuns` field as terminal (`is True` / truthiness checks). README documents the gate as `hasPendingChildRuns: false`. All recorded statuses in checks carried the explicit boolean; behavior matches between the two files. Consider requiring explicit `False` if strictness is desired.
- N2 (note): `reveal.py` enforces discovery/source-map/one-use/hash gates but not the stage/whole deadline; deadline observance at reveal time rests on the child's assignment wording ("stop substantive work at expiry"). Matches documented division of labor; no change proposed.

## Scope limitations

- Finite component check on S04 inputs only; no other cases, no live `delegate_task`/`task_status`/`orchestrator_capabilities` calls, no real scientific workers, no end-to-end three-stage run.
- Bootstrap findings are static + `prepare.py` dry-runs; `text()`/`exit()`/tool-object runtime semantics unobserved.
- `OBSERVED_REFERENCE.json`, job/evaluation science, and scored outputs were not read or modified (out of scope per assignment).
- Scratch runtime deleted: `$RT=/tmp/er11-qual-run1`, `/tmp/brief-backup.md`, and the scratch dir itself; reusable originals verified untouched (hashes above re-checked after run where applicable).

## Files saved here

- `result.md` (this file), `result.json` (structured outcomes), `patch-bootstrap-text.diff` (optional one-line D1 fix).
