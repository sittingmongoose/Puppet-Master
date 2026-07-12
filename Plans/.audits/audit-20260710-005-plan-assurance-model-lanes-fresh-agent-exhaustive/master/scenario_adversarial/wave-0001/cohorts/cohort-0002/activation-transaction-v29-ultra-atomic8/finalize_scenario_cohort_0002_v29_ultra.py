#!/usr/bin/env python3
"""Seal V29 ultra receipts/capture and emit the zero-credit cohort-0002 primary postrun."""
from __future__ import annotations

import copy
import hashlib
import importlib.util
import json
import os
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator

AUDIT = Path("/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive")
WAVE = AUDIT / "master/scenario_adversarial/wave-0001"
HERE = Path(__file__).resolve().parent
MANIFEST = WAVE / "cohorts/cohort-0002/cohort_manifest.jsonl"
SCHEMA = HERE / "result_schema_ultra_v29.json"
CORE = HERE / "activation_core.json"
CAPTURE = WAVE / "runtime/cohort-0002-v29-ultra/native_capture.json"
REPORT = WAVE / "postrun-validator-v29-ultra/primary-execution/cohort-0002-primary-postrun.json"
SESSIONS = Path("/Users/jaredsmacbookair/.codex/sessions/2026/07/12")
IDS = [f"A005SA-{number:04d}" for number in range(9, 17)]
CONTROLLER = "019f551e-5c00-7a73-afa3-7b57d8f0f442"
MODEL = "gpt-5.6-sol"
EFFORT = "ultra"
TRANSACTION = "SCENARIO-V29-COHORT-0002-ULTRA-ATOMIC8"

BASE_VALIDATOR = WAVE / "postrun-validator-v1/validate_scenario_postrun_v1.py"
spec = importlib.util.spec_from_file_location("scenario_v1_preserved_for_v29", BASE_VALIDATOR)
base = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(base)


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def rows(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def canonical(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode("utf-8")


def write_once(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o444)
    try:
        os.write(descriptor, canonical(value))
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def expected_agent_path(assignment_id: str) -> str:
    return f"/root/sol_controller_v29/a005_scenario_adversarial_{int(assignment_id[-4:]):04d}_attempt_0001_ultra_v29"


def session_index(expected_paths: set[str]) -> tuple[dict[str, Path], list[dict[str, Any]]]:
    by_agent: dict[str, Path] = {}
    all_meta: list[dict[str, Any]] = []
    for path in sorted(SESSIONS.glob("rollout-*.jsonl")):
        try:
            with path.open(encoding="utf-8") as stream:
                first = json.loads(next(stream))
        except Exception:
            continue
        if first.get("type") != "session_meta":
            continue
        payload = first.get("payload", {})
        source_value = payload.get("source", {})
        source = source_value.get("subagent", {}).get("thread_spawn", {}) if isinstance(source_value, dict) else {}
        all_meta.append({"thread_id": payload.get("id"), "parent_thread_id": source.get("parent_thread_id"), "agent_path": source.get("agent_path")})
        if source.get("agent_path") in expected_paths:
            if source["agent_path"] in by_agent:
                raise RuntimeError(f"duplicate-session:{source['agent_path']}")
            by_agent[source["agent_path"]] = path
    return by_agent, all_meta


def terminal_session(path: Path, expected_agent: str) -> dict[str, Any]:
    session_meta: dict[str, Any] | None = None
    turn_context: dict[str, Any] | None = None
    complete: dict[str, Any] | None = None
    with path.open(encoding="utf-8") as stream:
        for line in stream:
            event = json.loads(line)
            if event.get("type") == "session_meta":
                session_meta = event["payload"]
            elif event.get("type") == "turn_context" and turn_context is None:
                turn_context = event["payload"]
            elif event.get("type") == "event_msg" and event.get("payload", {}).get("type") == "task_complete":
                complete = event["payload"]
    if not session_meta or not turn_context or not complete:
        raise RuntimeError(f"session-not-terminal:{expected_agent}")
    source = session_meta.get("source", {}).get("subagent", {}).get("thread_spawn", {})
    if source.get("agent_path") != expected_agent or source.get("parent_thread_id") != CONTROLLER:
        raise RuntimeError(f"session-lineage:{expected_agent}")
    if turn_context.get("model") != MODEL or turn_context.get("effort") != EFFORT:
        raise RuntimeError(f"session-runtime:{expected_agent}")
    if complete.get("last_agent_message") != "PMR1":
        raise RuntimeError(f"session-terminal-response:{expected_agent}")
    return {
        "native_child_thread_id": session_meta["id"],
        "native_turn_id": turn_context["turn_id"],
        "native_session_record_path": str(path),
        "native_session_record_sha256": sha(path),
        "terminal_status": "completed",
        "terminal_response": "PMR1",
    }


def adapted_row(row: dict[str, Any]) -> dict[str, Any]:
    value = copy.deepcopy(row)
    value["prospective_agent_path"] = expected_agent_path(row["assignment_id"])
    value["output_directory"] = str(AUDIT / row["output_directory"]) if not Path(row["output_directory"]).is_absolute() else row["output_directory"]
    value["research_binding_by_feature"] = {
        ref: {"result_file_sha256": binding[0], "research_record_sha256": binding[1]}
        for ref, binding in row["research_binding_by_feature"].items()
    }
    return value


def main() -> None:
    manifest = rows(MANIFEST)
    if [row["assignment_id"] for row in manifest] != IDS:
        raise SystemExit("manifest-identity-set")
    if CAPTURE.exists() or REPORT.exists():
        raise SystemExit("finalization-already-exists")
    schema = load(SCHEMA)
    Draft202012Validator.check_schema(schema)
    schema_validator = Draft202012Validator(schema)
    base_schema = load(WAVE / "schemas/scenario_adversarial_result.schema.json")
    expected_paths = {expected_agent_path(assignment_id) for assignment_id in IDS}
    sessions, all_meta = session_index(expected_paths)
    if set(sessions) != expected_paths:
        raise SystemExit("native-session-set")

    prepared: list[dict[str, Any]] = []
    child_thread_ids: set[str] = set()
    for row in manifest:
        assignment_id = row["assignment_id"]
        agent_path = expected_agent_path(assignment_id)
        auth_path = HERE / f"authorizations/{assignment_id}.json"
        overlay_path = HERE / f"intent_overlays/{assignment_id}.json"
        auth = load(auth_path)
        output = Path(auth["output_directory"])
        result_path = output / "result.json"
        receipt_path = Path(auth["receipt_path"])
        if not result_path.is_file() or sorted(path.name for path in output.iterdir()) != ["result.json"]:
            raise SystemExit(f"output-not-terminal:{assignment_id}")
        if receipt_path.exists():
            raise SystemExit(f"receipt-exists:{assignment_id}")
        native = terminal_session(sessions[agent_path], agent_path)
        child_thread_ids.add(native["native_child_thread_id"])
        prepared.append({
            "row": row, "auth": auth, "auth_path": auth_path, "overlay_path": overlay_path,
            "agent_path": agent_path, "result_path": result_path, "receipt_path": receipt_path, "native": native,
        })
    descendant_rows = [meta for meta in all_meta if meta.get("parent_thread_id") in child_thread_ids]
    if descendant_rows:
        raise SystemExit("descendants-detected")

    capture_rows: list[dict[str, Any]] = []
    for item in prepared:
        row = item["row"]
        auth = item["auth"]
        assignment_id = row["assignment_id"]
        result_path = item["result_path"]
        receipt = {
            "audit_id": AUDIT.name,
            "schema_version": "scenario-adversarial-dispatch-receipt-v29-ultra-v1",
            "wave_id": "wave-0001",
            "cohort_id": "cohort-0002",
            "assignment_id": assignment_id,
            "attempt_id": "attempt-0001",
            "transaction_id": TRANSACTION,
            "controller_thread_id": CONTROLLER,
            "agent_path": item["agent_path"],
            "task_thread_id": item["agent_path"],
            "model": MODEL,
            "reasoning_effort": EFFORT,
            "fresh_child": True,
            "fork_turns": "none",
            "original_dispatch_intent_sha256": auth["original_intent_sha256"],
            "intent_overlay_sha256": sha(item["overlay_path"]),
            "packet_sha256": auth["packet_sha256"],
            "output_directory": str(result_path.parent),
            "result_path": str(result_path),
            "result_sha256": sha(result_path),
            "terminal_status": "completed",
            "terminal_response": "PMR1",
            "native_child_thread_id": item["native"]["native_child_thread_id"],
            "native_turn_id": item["native"]["native_turn_id"],
            "activation_path": str(CORE),
            "activation_sha256": sha(CORE),
        }
        write_once(item["receipt_path"], receipt)
        capture_rows.append({
            "assignment_id": assignment_id,
            "agent_path": item["agent_path"],
            "model": MODEL,
            "reasoning_effort": EFFORT,
            **item["native"],
            "result_path": str(result_path),
            "result_sha256": sha(result_path),
            "receipt_path": str(item["receipt_path"]),
            "receipt_sha256": sha(item["receipt_path"]),
        })

    capture = {
        "schema_version": "scenario-adversarial-native-capture-v29-ultra-v1",
        "audit_id": AUDIT.name,
        "wave_id": "wave-0001",
        "cohort_id": "cohort-0002",
        "transaction_id": TRANSACTION,
        "controller_thread_id": CONTROLLER,
        "model": MODEL,
        "reasoning_effort": EFFORT,
        "row_count": 8,
        "rows": capture_rows,
        "unique_identity_closure": len({row["native_child_thread_id"] for row in capture_rows}) == 8 and len({row["native_turn_id"] for row in capture_rows}) == 8,
        "descendant_count": 0,
        "candidate_credit": 0,
    }
    write_once(CAPTURE, capture)

    statuses: dict[str, Any] = {}
    for item in prepared:
        row = adapted_row(item["row"])
        result = load(item["result_path"])
        errors = ["schema:" + "/".join(str(part) for part in error.absolute_path) + ":" + error.message for error in schema_validator.iter_errors(result)]
        transformed = copy.deepcopy(result)
        transformed["reasoning_effort"] = "xhigh"
        errors.extend(base.result_errors(transformed, row, base_schema))
        receipt = load(item["receipt_path"])
        if receipt.get("result_sha256") != sha(item["result_path"]) or receipt.get("native_child_thread_id") != item["native"]["native_child_thread_id"]:
            errors.append("receipt-binding")
        statuses[row["assignment_id"]] = {"status": "eligible" if not errors else "rejected", "errors": sorted(set(errors))}
    eligible = [assignment_id for assignment_id in IDS if statuses[assignment_id]["status"] == "eligible"]
    rejected = [assignment_id for assignment_id in IDS if statuses[assignment_id]["status"] != "eligible"]
    report = {
        "schema_version": "scenario-adversarial-primary-postrun-v29-ultra-v1",
        "audit_id": AUDIT.name,
        "wave_id": "wave-0001",
        "cohort_id": "cohort-0002",
        "transaction_id": TRANSACTION,
        "status": "candidate_pass" if len(eligible) == 8 else "fail_closed",
        "eligible_count": len(eligible),
        "rejected_count": len(rejected),
        "eligible_ids": eligible,
        "rejected_ids": rejected,
        "assignment_statuses": statuses,
        "model": MODEL,
        "reasoning_effort": EFFORT,
        "effort_change": {"prior_completed_cohort_0001": "xhigh", "current_cohort_0002": EFFORT, "mixed_inside_transaction": False},
        "activation_core_sha256": sha(CORE),
        "activation_envelope_sha256": sha(HERE / "activation_envelope.json"),
        "native_capture_sha256": sha(CAPTURE),
        "result_schema_sha256": sha(SCHEMA),
        "receipt_count": 8,
        "result_count": 8,
        "feature_count": sum(row["feature_count"] for row in manifest),
        "semantic_checks_removed": 0,
        "schema_checks_removed": 0,
        "fresh_luna_independent_postrun_required": True,
        "credit": 0,
        "policy_v29_sha256": "ebf5b20bc85a2bf41aee25b6d1c5a04934c7e936168fd04c8645f8a7c7c3bba8",
        "policy_v30_sha256": "f56d5680c33e81f0c4ac6232d3edbce8a1a1d2617518b0901f62674e7782af79",
    }
    write_once(REPORT, report)
    print(json.dumps({"status": report["status"], "eligible": len(eligible), "rejected": len(rejected), "capture_sha256": sha(CAPTURE), "primary_postrun_sha256": sha(REPORT)}, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "candidate_pass" else 1)


if __name__ == "__main__":
    main()
