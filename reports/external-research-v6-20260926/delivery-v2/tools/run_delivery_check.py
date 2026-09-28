#!/usr/bin/env python3
"""D1 only: host file receipts beside the existing pinned native Goal launcher.

No CLI dispatch, approval-file loading, retries, new Goal engine or model transport.
The trusted operator calls run_one with actual user authority and the reviewed pin.
"""
import hashlib
import json
import os
from pathlib import Path
import shutil
import signal
import subprocess
import sys
import time

from delivery_store import Store, write_json

ROOT = Path(__file__).resolve().parents[1]
LAB = ROOT.parent
SECONDS, RESPONSES, HOST_WALL, PHASE_WALL = 300, 48, 390, 900
ORDER = ("muse", "zcode")
DRIVER = LAB / "tools/r1b/run_goal_r1b.py"
DRIVER_SHA = "4cfd7aee946cd8db9ef70a0adf2cfe8279a5cdc13cb3c8b7cd299775dee97ae7"


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def verify_freeze(expected_sha):
    manifest = ROOT / "FREEZE.json"
    if digest(manifest) != expected_sha:
        raise ValueError("D1 freeze differs from trusted operator pin")
    frozen = json.loads(manifest.read_text())
    for rel, info in frozen["files"].items():
        if digest(ROOT / rel) != info["sha256"]:
            raise ValueError(f"changed frozen input: {rel}")
    for path, checksum in frozen["reused_pins"].items():
        if digest(LAB / path) != checksum:
            raise ValueError(f"changed reused dependency: {path}")
    if digest(DRIVER) != DRIVER_SHA:
        raise ValueError("native driver pin differs")


def structural_checks(store, ws):
    attempts = store.state["attempts"]
    summary = store.summary()
    checks = {
        "four_attempts": len(attempts) == 4,
        "statuses": [a["status"] for a in attempts] == ["VALID_UNVERIFIED", "VALID_UNVERIFIED", "INVALID", "VALID_UNVERIFIED"],
        "final_structurally_complete": summary["complete"],
        "two_current_findings": len(summary["findings"]) == 2,
        "all_eight_byte_snapshots": sum(1 for p in (store.archive / "snapshots").iterdir() if p.is_file()) == 8,
        "no_snapshot_gaps": not summary["missing_or_corrupt_snapshots"],
    }
    if len(attempts) == 4:
        first, independent, invalid, fixed = attempts
        checks["stable_revision_identity"] = first["finding_id"] == invalid["finding_id"] == fixed["finding_id"] != independent["finding_id"]
        receipt = json.loads((ws / "feedback" / (invalid["request"] + ".json")).read_text())
        checks["invalid_latest_did_not_fallback"] = receipt["current_states"][first["finding_id"]]["status"] == "INVALID" and not receipt["complete"]
        checks["independent_finding_survived"] = receipt["current_states"][independent["finding_id"]]["status"] == "VALID_UNVERIFIED"
        checks["unknown_field_reported"] = any("snapshots_note" in d for d in invalid["diagnostics"])
        current = (store.archive / "current.md").read_text()
        checks["current_history_separation"] = "ALPHA_V2" in current and "ALPHA_V1" not in current and "ALPHA_PENDING" not in current
        checks["proposal_unexecuted"] = "UNEXECUTED PROPOSAL" in current
        checks["nonfinding_preserved"] = any(p["type"] == "non_finding" for f in summary["findings"] for p in f["parts"])
        fixed_text = "\n".join(p["text"] for p in fixed["finding"]["parts"]) if fixed["finding"] else ""
        checks["quote_and_code_preserved"] = 'He said "blue", then typed C:\\demo\\alpha.' in fixed_text and '## condition\n  units = 3' in fixed_text
    return checks


def run_one(app, run_root, *, user_authorized, frozen_sha):
    if user_authorized is not True:
        raise PermissionError("actual trusted user authorization required before dispatch")
    verify_freeze(frozen_sha)
    run_root = Path(run_root)
    run_root.mkdir(exist_ok=True)
    state_path = run_root / "dispatch-state.json"
    state = json.loads(state_path.read_text()) if state_path.exists() else {
        "phase_started_epoch": time.time(), "dispatched": [], "terminal": [], "stopped": False}
    if state["stopped"] or len(state["dispatched"]) >= 2 or app != ORDER[len(state["dispatched"])]:
        raise PermissionError("D1 schedule closed, consumed, or out of order")
    if len(state["terminal"]) != len(state["dispatched"]):
        raise PermissionError("previous dispatch has no terminal result; no retry or overlap")
    if time.time() - state["phase_started_epoch"] + HOST_WALL > PHASE_WALL:
        raise PermissionError("insufficient remaining D1 wall ceiling")
    arm = run_root / app
    arm.mkdir()  # Existing slot is never reused, even after an interruption.
    ws = arm / "ws"
    (ws / "case").mkdir(parents=True)
    shutil.copyfile(ROOT / "fixtures/SYNTHETIC.txt", ws / "case/SYNTHETIC.txt")
    shutil.copyfile(ROOT / "prompts/delivery-check.txt", ws / "task.txt")
    for path in (ws / "case/SYNTHETIC.txt", ws / "task.txt"):
        path.chmod(0o444)
    store = Store(ws, arm / "store")
    input_hashes = {str(p.relative_to(ws)): digest(p) for p in (ws / "case/SYNTHETIC.txt", ws / "task.txt")}
    write_json(arm / "input-manifest.json", input_hashes)
    argv = [sys.executable, str(DRIVER), "--app", app, "--workspace", str(ws),
            "--prompt-file", str(ws / "task.txt"), "--out", str(arm / "native"),
            "--label", "D1-" + app, "--max-seconds", str(SECONDS), "--max-responses", str(RESPONSES)]
    if app == "zcode":
        argv += ["--zcode-tools", "Read", "Write", "Edit"]
    state["dispatched"].append(app)
    write_json(state_path, state)
    write_json(arm / "dispatch.json", {"argv": argv, "freeze_sha256": frozen_sha, "task_sha256": input_hashes["task.txt"],
               "authorization_source": "user chat: I approve the small native assignment too", "no_retries": True})
    started = time.monotonic()
    error = None
    proc = None
    rc = None
    try:
        with (arm / "driver-output.log").open("w") as log:
            proc = subprocess.Popen(argv, cwd=LAB, stdout=log, stderr=subprocess.STDOUT, start_new_session=True)
            while proc.poll() is None:
                store.poll()
                if time.monotonic() - started > HOST_WALL:
                    raise TimeoutError("outer D1 host wall ceiling")
                time.sleep(0.05)
            rc = proc.wait()
    except Exception as exc:
        error = f"{type(exc).__name__}: {exc}"
    finally:
        if proc is not None and proc.poll() is None:
            try:
                for sig in (signal.SIGTERM, signal.SIGKILL):
                    try:
                        os.killpg(proc.pid, sig)
                    except OSError as exc:
                        error = (error or "") + f" cleanup:{type(exc).__name__}:{exc}"
                    try:
                        proc.wait(timeout=10)
                        break
                    except subprocess.TimeoutExpired:
                        if sig == signal.SIGKILL:
                            error = (error or "") + " cleanup:process not reaped within ceiling"
            except Exception as exc:
                error = (error or "") + f" cleanup:{type(exc).__name__}:{exc}"
            rc = proc.returncode
        try:
            store.close()
        except Exception as exc:
            error = (error or "") + f" close:{type(exc).__name__}:{exc}"
    try:
        native_path = arm / "native/receipt.json"
        native = json.loads(native_path.read_text()) if native_path.exists() else {}
        if not isinstance(native, dict):
            raise ValueError("native receipt is not an object")
        sys.path.insert(0, str(LAB / "tools/r1b"))
        import run_r1b
        outcome, detail = run_r1b.classify(rc, native)
        if error:
            outcome, detail = "harness_failure", error
        # Preserve the existing native-log copy behavior; raw logs remain VM-only.
        if native:
            run_r1b.copy_native_logs(app, native, arm / "native")
        checks = structural_checks(store, ws)
        checks["inputs_unchanged"] = all(digest(ws / p) == h for p, h in input_hashes.items())
    except Exception as exc:
        error = (error or "") + f" terminal:{type(exc).__name__}:{exc}"
        outcome, detail = "harness_failure", error
        checks = {"postprocessing_completed": False}
    result = {"app": app, "outcome": outcome, "detail": detail, "process_exit": rc, "host_error": error,
              "elapsed_host_seconds": time.monotonic() - started, "checks": checks,
              "structural_checks_passed": outcome == "goal_complete" and all(checks.values()),
              "native_tool_trace_audit": "pending; host checks alone are not native protocol proof",
              "semantic_grade": "not_performed", "formal_evaluator_calls": 0}
    write_json(arm / "result.json", result)
    state["terminal"].append(app)
    state["stopped"] = outcome in ("harness_failure", "quota_stop") or len(state["terminal"]) == 2
    write_json(state_path, state)
    return result
