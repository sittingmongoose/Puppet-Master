#!/usr/bin/env python3
"""Static checker for Plans/goal_run_stop_block_oracle_fixtures.json (ATS-212; DL-080 under DL-045, 2026-11-04).

goal_run.stopped and goal_run.blocked v3: payload cases against the prepared v3 schemas, SP-426/SP-427
identity recipes, D-R21/D-R16 source-status tables, EP-200 wiring expectations and the GRS-202
projection rule table. Static consistency only; the writers are not installable on any existing
birth and every native obligation stays NOT_RUN. Exit 0 on full agreement.
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path

try:
    import jsonschema
except ImportError as exc:  # pragma: no cover
    print(json.dumps({"status": "error", "reason": f"missing dependency: {exc}"}))
    sys.exit(2)

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "Plans/goal_run_stop_block_oracle_fixtures.json"
DOMAINS = {"goal_run.stopped": "pm.goal_run.stopped.v1", "goal_run.blocked": "pm.goal_run.blocked.v1"}
LEGAL = {
    # D-R21 and D-R16 source statuses over the native Workflow status set.
    "goal_run.stopped": {"ready", "running", "provisional_success", "verifying", "failed_verification", "repairing", "blocked", "stopped"},
    "goal_run.blocked": {"ready", "running", "provisional_success", "verifying", "failed_verification", "repairing", "blocked"},
}
SELF = {"goal_run.stopped": "stopped", "goal_run.blocked": "blocked"}
WRITERS = {
    ("cmd.orchestrator.pause", "goal_run.stopped"): "owner.executor.workflow_run.stop.v1",
    ("cmd.runtime.abort_run", "goal_run.stopped"): "owner.executor.workflow_run.stop.v1",
    (None, "goal_run.blocked"): "owner.executor.workflow_run.block.v1",
}
FORMAT_CHECKER = jsonschema.FormatChecker(formats=())


@FORMAT_CHECKER.checks("date-time")
def _utc(instance) -> bool:
    if not isinstance(instance, str):
        return True
    return re.match(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$", instance) is not None


def recipe(family: str, inputs: dict) -> tuple[str, str]:
    order = ["storage_instance_id", "project_id", "goal_id", "goal_run_id", "expected_goal_run_revision", "operation_id"]
    vals = [str(inputs[k]) if k == "expected_goal_run_revision" else inputs[k] for k in order]
    blob = json.dumps([DOMAINS[family], "project"] + vals, separators=(",", ":"), ensure_ascii=False).encode()
    digest = hashlib.sha256(blob).hexdigest()
    return f"{family}.v1:{digest}", f"{family}.writer.v1:{digest}"


EDGES = {
    ("started", "goal_run.blocked"), ("started", "goal_run.stopped"), ("started", "goal_run.cancelled"), ("started", "goal_run.certified"),
    ("blocked", "goal_run.blocked"), ("blocked", "goal_run.stopped"), ("blocked", "goal_run.cancelled"),
    ("stopped", "goal_run.stopped"), ("stopped", "goal_run.cancelled"),
}


def project(rows: list[dict], qualifying: bool) -> dict:
    status, rev = None, None
    for i, r in enumerate(rows):
        ev = r["event_type"]
        if status is None:
            if ev != "goal_run.started":
                return {"outcome": "halt_before", "index": i, "status": status, "revision": rev}
            status, rev = "started", r["goal_run_revision"]
            continue
        stop_block = ev in ("goal_run.blocked", "goal_run.stopped")
        if stop_block and (not qualifying or r.get("payload_major") != 3):
            return {"outcome": "halt_before", "index": i, "status": status, "revision": rev}
        if (status, ev) not in EDGES or r["goal_run_revision"] != rev + 1:
            return {"outcome": "halt_before", "index": i, "status": status, "revision": rev}
        status = ev.split(".", 1)[1]
        rev = r["goal_run_revision"]
    return {"outcome": "advanced", "status": status, "revision": rev}


def main() -> int:
    doc = json.loads(FIXTURES.read_text(encoding="utf-8"))
    failures: list[str] = []
    counts: dict[str, int] = {}

    def check(ok: bool, label: str) -> None:
        key = label.split(":")[0]
        counts[key] = counts.get(key, 0) + 1
        if not ok:
            failures.append(label)

    for family, f in doc["families"].items():
        v = jsonschema.Draft202012Validator(json.loads((ROOT / f["payload_schema"]).read_text(encoding="utf-8")), format_checker=FORMAT_CHECKER)
        for case in f["payload_cases"]:
            valid = not list(v.iter_errors(case["value"]))
            if valid:
                ev, key = recipe(family, {"storage_instance_id": "00000000-0000-4000-8000-000000000001", "project_id": case["value"]["project_id"],
                                          "goal_id": case["value"]["goal_id"], "goal_run_id": case["value"]["payload"]["goal_run_id"],
                                          "expected_goal_run_revision": case["value"]["expected_goal_run_revision"],
                                          "operation_id": "op:pause:1" if family == "goal_run.stopped" else "op:block:1"})
                valid = case["value"]["idempotency_key"] == key and case["value"]["goal_run_revision"] == case["value"]["expected_goal_run_revision"] + 1
            check(valid == case["valid"], f"{family} payload:{case['id']}")
        for case in f["identity_cases"]:
            ev, key = recipe(family, case["inputs"])
            check((case["event_id"] == ev and case["idempotency_key"] == key) == case["valid"], f"{family} identity:{case['id']}")
        for case in f["source_status_cases"]:
            s = case["source_status"]
            legal = s in LEGAL[family] and (s != SELF[family] or case["new_evidence"])
            check(legal == case["legal"], f"{family} source:{case['id']}")
    for case in doc["wiring_cases"]:
        got = WRITERS.get((case["command_id"], case["family"]))
        check(got == case["writer"], f"wiring:{case['id']}")
    for case in doc["projection_cases"]:
        got = project(case["rows"], case["qualifying_birth"])
        exp = case["expected"]
        same = all(got.get(k) == exp.get(k) for k in ("outcome", "index", "status", "revision"))
        check(same, f"projection:{case['id']} got {got}")
    result = {"status": "pass" if not failures else "fail", "case_counts": counts, "failures": failures, "native_execution": "NOT_RUN"}
    print(json.dumps(result, indent=2))
    return 0 if not failures else 1


if __name__ == "__main__":
    sys.exit(main())
