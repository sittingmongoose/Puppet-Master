#!/usr/bin/env python3
import hashlib
import importlib.util
import os
import stat
import sys

sys.dont_write_bytecode = True
HARNESS = "/mnt/Cursor/PuppetMaster/tests/r9g30/stream_harness.py"
HARNESS_BYTES = 32971
HARNESS_SHA256 = "47307d4e78500b9b5fe8e147293c1055d54e80cc6ec9f81d98c822fa863bc3b1"
PARENT = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
BASE = "/mnt/Cursor/PuppetMaster/tests/r9g30"
OUTPUTS = {
    "canary": BASE + "/canary_plan.json",
    "matrix_011": BASE + "/matrix_011_plan.json",
    "matrix_012": BASE + "/matrix_012_plan.json",
}


def load_harness():
    before = os.lstat(HARNESS)
    if not (stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode)
            and stat.S_IMODE(before.st_mode) == 0o644 and before.st_uid == os.getuid()
            and before.st_nlink == 1 and before.st_size == HARNESS_BYTES):
        raise ValueError("harness-custody")
    fd = os.open(HARNESS, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        raw = b""
        while len(raw) < HARNESS_BYTES:
            part = os.read(fd, HARNESS_BYTES - len(raw))
            if not part:
                raise ValueError("harness-short")
            raw += part
        if os.read(fd, 1):
            raise ValueError("harness-trailing")
    finally:
        os.close(fd)
    if hashlib.sha256(raw).hexdigest() != HARNESS_SHA256:
        raise ValueError("harness-digest")
    spec = importlib.util.spec_from_file_location("r9g30_plan_harness", HARNESS)
    if spec is None or spec.loader is None:
        raise ValueError("harness-spec")
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    return module


H = load_harness()


def rows(cell_indexes):
    cells = H.load_semantic()[1]
    result = []
    for cell_index in cell_indexes:
        for route in ("alpha", "bravo", "charlie"):
            roster = H.ROSTER[route]
            result.append({"cell": cells[cell_index]["cell"], "cell_index": cell_index,
                           "model": roster["model"], "reasoning_effort": roster["reasoning_effort"],
                           "route": route, "row_id": "R{:03d}".format(len(result))})
    return result


def plan(name, kind, matrix_index, objective_prefix, task_prefix, root_name, manifest_name, cell_indexes):
    value_rows = rows(cell_indexes)
    return {"authority": H.AUTHORITY, "bindings": H.expected_bindings(),
            "experiment": {"experiment_id": name, "kind": kind,
                "manifest_path": BASE + "/" + manifest_name, "matrix_index": matrix_index,
                "max_parallel": 3, "objective_prefix": objective_prefix, "parent_thread_id": PARENT,
                "root": BASE + "/" + root_name, "row_count": len(value_rows),
                "schedule": "CELL_MAJOR_ALPHA_BRAVO_CHARLIE", "stop_at_first_nonpass": True,
                "task_prefix": task_prefix},
            "failure_contract": H.FAILURE, "limits": H.LIMITS, "qualification": H.QUALIFICATION,
            "roster": H.ROSTER, "rows": value_rows,
            "schema_id": "pw-r9-codex-native-goal-streamed-matrix-plan-v1",
            "status": "PREDECLARED_ZERO_CREDIT_NO_LAUNCH_AUTHORITY"}


def plans():
    return {
        "canary": plan("codex-native-goal-streamed-canary-001", "STREAMED_CANARY", 0,
                       "R9SC01", "r9_sc01_", "run-canary-001", "canary_prepared_manifest.json", [3]),
        "matrix_011": plan("codex-native-goal-streamed-matrix-011", "FULL_MATRIX", 11,
                           "R9M11", "r9_m11_", "run-matrix-011", "matrix_011_prepared_manifest.json", range(97)),
        "matrix_012": plan("codex-native-goal-streamed-matrix-012", "FULL_MATRIX", 12,
                           "R9M12", "r9_m12_", "run-matrix-012", "matrix_012_prepared_manifest.json", range(97)),
    }


def main(argv):
    if argv not in ([sys.argv[0], "--check"], [sys.argv[0], "--output"]):
        raise ValueError("argv")
    values = plans(); receipt = {}
    for name, value in values.items():
        H.validate_plan(value)
        raw = H.H.canonical(value)
        receipt[name] = {"bytes": len(raw), "path": OUTPUTS[name], "sha256": H.H.sha(raw),
                         "row_count": len(value["rows"]),
                         "route_counts": {route: sum(row["route"] == route for row in value["rows"])
                                          for route in H.ROSTER}}
        if argv[1] == "--output":
            if os.path.lexists(OUTPUTS[name]):
                raise ValueError("create-only:" + name)
            H.H.publish(OUTPUTS[name], raw)
        elif os.path.lexists(OUTPUTS[name]):
            raise ValueError("check-output-present:" + name)
    output = {"first_mismatch": None, "plans": receipt, "qualification_credit": 0,
              "schema_id": "pw-r9-codex-native-goal-streamed-plan-build-v1",
              "status": "PASS_OUTPUT_CREATED_ZERO_CREDIT" if argv[1] == "--output" else "PASS_DATA_ONLY_ZERO_WRITES",
              "workspace_writes": 3 if argv[1] == "--output" else 0}
    sys.stdout.buffer.write(H.H.canonical(output)); return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv))
    except (H.Invalid, OSError, UnicodeError, KeyError, TypeError, ValueError) as error:
        sys.stdout.buffer.write(H.H.canonical({"first_mismatch": str(error), "qualification_credit": 0,
            "schema_id": "pw-r9-codex-native-goal-streamed-plan-build-v1", "status": "FAIL", "workspace_writes": 0}))
        raise SystemExit(1)
