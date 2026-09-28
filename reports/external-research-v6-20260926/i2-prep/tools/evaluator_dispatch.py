"""Host-only I2 dispatch glue; importing this module never launches a reviewer.

The trusted host supplies live approval, the frozen task/schedule/freeze pins,
the parent-owned pair metadata and the candidate phase's existing durable state.
There is no CLI, approval loader, new authorization service or retry path. The
host must keep one stable runs root and phase-state path for the authorized
freeze. Recreating a gate does not remove an existing slot's consumption.
"""
import hashlib
import json
import math
from pathlib import Path
import re
import sys
import time

LAB = Path(__file__).resolve().parents[2]
for directory in (LAB / "delivery-v2/tools", LAB / "tools/r1b"):
    sys.path.insert(0, str(directory))

from evaluator_launch import (EvaluatorLaunch, LaunchRefused, SECONDS, RESPONSES, OUTPUTS)  # noqa: E402
import run_reviewer_v2 as reviewer  # noqa: E402
from run_r1b import write_status, slot_state, utc  # noqa: E402

PHASE_SECONDS = 14400
POSTPROCESS_RESERVE = 300


def _phase_check(path, expected_freeze_sha256, clock):
    if not isinstance(expected_freeze_sha256, str) or not re.fullmatch(r"[0-9a-f]{64}", expected_freeze_sha256):
        raise LaunchRefused("host freeze SHA-256 pin is required")
    try:
        phase = json.loads(Path(path).read_text())
    except (OSError, ValueError) as exc:
        raise LaunchRefused("existing durable candidate phase state is required") from exc
    if not isinstance(phase, dict) or phase.get("freeze_sha256") != expected_freeze_sha256:
        raise LaunchRefused("phase state does not bind the approved frozen plan")
    if type(phase.get("phase_wall_seconds")) is not int or phase["phase_wall_seconds"] != PHASE_SECONDS:
        raise LaunchRefused("phase wall ceiling differs from the frozen 14400 seconds")
    started, now = phase.get("phase_started_epoch"), clock()
    if (type(started) not in (int, float) or not math.isfinite(started)
            or type(now) not in (int, float) or not math.isfinite(now) or started > now):
        raise LaunchRefused("phase start is invalid; a restart cannot reset its budget")
    if str(phase.get("state", "")).startswith(("closed", "terminal", "stopped")):
        raise LaunchRefused("candidate phase is already closed or stopped")
    if now - started + SECONDS + POSTPROCESS_RESERVE > PHASE_SECONDS:
        raise LaunchRefused("phase has insufficient wall time for the fixed reviewer and reserve")
    return phase


def _eligible(pair_metadata, assignment_id):
    # Parent-owned eligibility policy, never a caller-supplied approval boolean.
    from prep_plan import check_pair_eligibility
    return check_pair_eligibility(pair_metadata, assignment_id=assignment_id)


def _check_slots(runs, assignments, target, claimed=False):
    """A stopped or unfinished original slot stops the finite schedule."""
    for assignment in assignments:
        arm = runs / assignment.assignment_id
        if claimed and assignment.assignment_id == target:
            continue
        if not arm.exists() and not arm.is_symlink():
            continue
        if assignment.assignment_id == target:
            raise LaunchRefused("existing durable evaluator slot cannot be redispatched")
        try:
            status = json.loads((arm / "status.json").read_text())
            continuing = (not arm.is_symlink() and slot_state(arm) == "done"
                          and isinstance(status, dict) and not status.get("stop_schedule"))
        except (OSError, ValueError, TypeError, AttributeError):
            continuing = False
        if not continuing:
            raise LaunchRefused("prior durable evaluator slot stopped or is unfinished")


def _staged_pair_check(metadata, workspace, assignment_id):
    """The eligible bytes must be the exact two first-view reports actually read."""
    if _eligible(metadata, assignment_id) is not True:
        raise LaunchRefused("pair is ineligible for the frozen semantic reviewer")
    expected = {workspace / f"first_view/results/{label}/current.md" for label in ("X1", "X2")}
    found, hashes = set(), {}
    try:
        for arm in metadata["arms"]:
            path = Path(arm["current_path"])
            resolved = path.resolve()
            if path.is_symlink() or resolved not in expected or resolved in found or not path.is_file():
                raise LaunchRefused("eligible reports must be the distinct exact staged X1/X2 paths")
            raw = path.read_bytes()
            digest = hashlib.sha256(raw).hexdigest()
            if digest != arm["current_sha256"] or not raw.decode("utf-8").strip():
                raise LaunchRefused("staged current report differs from its eligible hash")
            found.add(resolved)
            hashes[str(resolved.relative_to(workspace))] = digest
    except (OSError, UnicodeError, ValueError, TypeError, KeyError) as exc:
        raise LaunchRefused("eligible staged current reports are missing or invalid") from exc
    if found != expected:
        raise LaunchRefused("eligible reports do not bind the exact staged X1/X2 pair")
    return hashes


def _output_validation(workspace):
    """Presence/UTF-8/JSON checks only, never a semantic or chronology proof."""
    validation = {}
    for rel in OUTPUTS:
        path = workspace / rel
        entry = {"valid": False}
        try:
            if path.is_symlink() or path.resolve() != path or not path.is_file():
                raise ValueError("missing, linked or non-file output")
            raw = path.read_bytes()
            text = raw.decode("utf-8")
            if not text.strip():
                raise ValueError("empty output")
            if path.suffix == ".json":
                json.loads(text)
            entry.update(valid=True, sha256=hashlib.sha256(raw).hexdigest())
        except (OSError, ValueError, UnicodeError) as exc:
            entry["error"] = f"{type(exc).__name__}: {exc}"
        validation[rel] = entry
    return validation


def _outcome(receipt):
    """Require a clean driver receipt for success; keep cap/incomplete distinct."""
    if not isinstance(receipt, dict) or not receipt:
        return "harness_failure", "missing reviewer receipt"
    if receipt.get("error"):
        return "harness_failure", "reviewer driver error"
    if receipt.get("stop") in ("cap_seconds", "cap_responses"):
        return "cap_stop", receipt["stop"]
    if receipt.get("stop"):
        return "harness_failure", "unrecognized reviewer stop"
    if receipt.get("returncode") != 0:
        return "harness_failure", "reviewer nonzero or missing process exit"
    result = receipt.get("result")
    if (not isinstance(result, dict) or result.get("subtype") != "success"
            or result.get("is_error") is not False or receipt.get("native_terminal_failure") is not False):
        return "harness_failure", "native terminal success is absent"
    validation = receipt.get("host_validation")
    grades = validation.get("grades.json") if isinstance(validation, dict) else None
    review = validation.get("review.md") if isinstance(validation, dict) else None
    valid = (isinstance(grades, dict) and isinstance(review, dict)
             and grades.get("exists") is True and grades.get("json_valid") is True
             and review.get("exists") is True)
    if receipt.get("review_status") == "COMPLETED" and valid:
        return "goal_complete", "existing reviewer driver completed with its required outputs"
    if receipt.get("review_status") == "FAILED_INCOMPLETE":
        return "incomplete_semantic", "existing reviewer driver reports incomplete output"
    return "harness_failure", "contradictory or unrecognized reviewer receipt"


def dispatch(*, task_path, expected_task_sha256, permitted_assignments,
             assignment_id, authorization, runs, phase_state_path,
             expected_freeze_sha256, pair_metadata, native=None, clock=time.time):
    """Dispatch one eligible, authorized pair through the unchanged reviewer.

    native(ws, composed_prompt_file, deadline=2700, cap=160) is a test seam;
    production defaults to run_reviewer_v2.run. Offline tests MUST replace it
    or its process boundary. Neither this function nor its tests grant authority.
    The requested existing slot always refuses. A stopped/unfinished prior slot
    blocks later assignments; terminal CONTINUE outcomes may permit the other. The
    exclusive directory is claimed and the full composed input saved before the
    paid boundary; callback exceptions consume and terminalize it without retry.
    """
    if _eligible(pair_metadata, assignment_id) is not True:
        raise LaunchRefused("pair is ineligible for the frozen semantic reviewer")
    _phase_check(phase_state_path, expected_freeze_sha256, clock)
    if native is not None and not callable(native):
        raise LaunchRefused("native callback must be callable")
    gate = EvaluatorLaunch(task_path, expected_task_sha256, permitted_assignments)
    native = reviewer.run if native is None else native
    runs = Path(runs)
    _check_slots(runs, permitted_assignments, assignment_id)
    assignment = next((a for a in permitted_assignments if a.assignment_id == assignment_id), None)
    if assignment is None:
        raise LaunchRefused("assignment is outside the frozen schedule")
    _staged_pair_check(pair_metadata, Path(assignment.workspace), assignment_id)

    def admitted(composed, execution):
        # These checks run only after the unchanged gate admitted exact live auth.
        arm = runs / assignment_id
        try:
            arm.mkdir(parents=True, exist_ok=False)
        except FileExistsError as exc:
            try:
                state = slot_state(arm)
            except (OSError, ValueError, TypeError, AttributeError):
                state = "unknown"
            raise LaunchRefused(f"existing durable evaluator slot is {state}; no redispatch") from exc
        started = clock()
        prompt = arm / "composed-prompt.txt"
        digest = hashlib.sha256(composed.encode("utf-8")).hexdigest()
        outcome, detail = "harness_failure", "host exception before completion"
        receipt = {"slot": assignment_id, "freeze_sha256": expected_freeze_sha256,
                   "task_sha256": expected_task_sha256, "composed_input_sha256": digest,
                   "authorization_consumed": True, "provider_received_payload_proof": False,
                   "execution": execution, "start_utc": utc(started)}
        try:
            write_status(arm, state="dispatched", slot=assignment_id)
            prompt.write_bytes(composed.encode("utf-8"))
            prompt.chmod(0o444)
            (arm / "composed-input.json").write_text(json.dumps(receipt, indent=1) + "\n")
            _phase_check(phase_state_path, expected_freeze_sha256, clock)
            _check_slots(runs, permitted_assignments, assignment_id, claimed=True)
            if hashlib.sha256(prompt.read_bytes()).hexdigest() != digest:
                raise LaunchRefused("saved composed input differs from its approved identity")
            receipt["staged_input_hashes"] = _staged_pair_check(
                pair_metadata, Path(execution["workspace"]), assignment_id)
            native_receipt = native(Path(execution["workspace"]), prompt,
                                    deadline=execution["seconds"], cap=execution["responses"])
            # Store the existing driver's receipt unchanged; wrapping is bookkeeping.
            (arm / "native-receipt.json").write_text(json.dumps(native_receipt, indent=1) + "\n")
            receipt["native_receipt"] = native_receipt
            outcome, detail = _outcome(native_receipt)
            receipt["wrapper_output_validation"] = _output_validation(Path(execution["workspace"]))
            if outcome == "goal_complete" and not all(
                    entry["valid"] for entry in receipt["wrapper_output_validation"].values()):
                outcome, detail = "incomplete_semantic", "one or more required task outputs are missing or invalid"
        except BaseException as exc:
            detail = f"{type(exc).__name__}: {exc}"
            receipt["dispatcher_exception_type"] = type(exc).__name__
            raise
        finally:
            receipt.update(outcome=outcome, outcome_detail=detail, end_utc=utc(clock()))
            (arm / "arm-receipt.json").write_text(json.dumps(receipt, indent=1) + "\n")
            write_status(arm, state="terminal", slot=assignment_id, outcome=outcome,
                         detail=detail, stop_schedule=outcome == "harness_failure")
        return receipt

    return gate.dispatch(assignment_id, authorization, admitted)
