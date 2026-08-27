#!/usr/bin/env python3
import hashlib
import json
import math
import os
import stat
import sys

sys.dont_write_bytecode = True
ROOT = "/mnt/Cursor/PuppetMaster"
SEMANTIC = ROOT + "/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/formal_candidate_v7/semantic_bundle.json"
FILES = {
    "semantic": (SEMANTIC, 0o644, 786546, "11139c2b52a2fe900f2976a34f7712d8f05d5b2991ce8cc26d5cfc4e1ef871c2"),
    "skill": (ROOT + "/.agents/skills/r9-goal-streamed-row/SKILL.md", 0o644, 1425, "93326a766bf70f98c4c859a7f2d183c68b91378f34583b313e39040760d4e046"),
    "decoder": (ROOT + "/tests/r9g30/stream_decoder.py", 0o644, 6802, "63d3d43284528e01adecaebcc9ff5acbd8a0d9e844340da38d2c66ca5fae7b26"),
    "harness": (ROOT + "/tests/r9g30/stream_harness.py", 0o644, 32971, "47307d4e78500b9b5fe8e147293c1055d54e80cc6ec9f81d98c822fa863bc3b1"),
    "builder": (ROOT + "/tests/r9g30/build_plans.py", 0o644, 5472, "7c582144468e0636e1578dd2f63d739507c29d646395c8a5df42fcd40a463f4a"),
    "canary": (ROOT + "/tests/r9g30/canary_plan.json", 0o444, 2573, "96156ecb0089950bfb8e0f77e087212af6ecebb83d05c8a75aa2f73bd337e6c4"),
    "matrix_011": (ROOT + "/tests/r9g30/matrix_011_plan.json", 0o444, 38292, "6b0d30fce83647da02838f82b63b2df9e4254ada49f284d09ad91da4ed1d3240"),
    "matrix_012": (ROOT + "/tests/r9g30/matrix_012_plan.json", 0o444, 38292, "f6d60a5289d7bb3d10170d1a8acd896d660b32e79793be4626812f9ad77a9bee"),
    "matrix_005_failure": (ROOT + "/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_bite_matrix_005_runtime_failure_receipt_v1.json", 0o644, 3571, "1bfea5d4070405efa5d3f17d75fa9f28da7bd83274f831efb2e4260c0a46d634"),
    "matrix_005_adjudication": (ROOT + "/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_bite_matrix_005_failure_adjudication_v1.json", 0o644, 3124, "31f4e66fc46e8191bd478c88b8c230d0b7fb149aa1a7c34080fb440fed9b0375"),
    "matrix_009_failure": (ROOT + "/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_tool_event_atomic_matrix_009_runtime_failure_receipt_v1.json", 0o644, 5960, "40a3738d63328b414600aeb2264c399535629ee045d8e3daf8bb6b04bdd639af"),
}
PLAN_KEYS = ("canary", "matrix_011", "matrix_012")
ROSTER = {
    "alpha": {"model": "gpt-5.4-mini", "reasoning_effort": "xhigh"},
    "bravo": {"model": "gpt-5.4-mini", "reasoning_effort": "medium"},
    "charlie": {"model": "gpt-5.6-luna", "reasoning_effort": "medium"},
}
AUTHORITY = {"canary_launch": False, "matrix_launch": False, "qualification": False,
             "qualification_credit": 0, "release": False}
FAILURE = {"best_of": 0, "continue_after_failure": False, "relaunch": 0,
           "replacement": 0, "resend": 0, "retry": 0, "reuse": 0}
QUALIFICATION = {"clean_full_matrix_streak": 0, "credit": "0/2",
                 "required_consecutive_clean_full_matrices": 2}
LIMITS = {"goal_objective_utf8_bytes_max": 128, "result_utf8_bytes_max": 2048,
          "slice_payload_utf8_bytes_max": 170, "spawn_prompt_utf8_bytes_max": 512,
          "subject_utf8_bytes_max": 20000}
EXPERIMENTS = {
    "canary": ("codex-native-goal-streamed-canary-001", "STREAMED_CANARY", 0, "R9SC01", "r9_sc01_", "run-canary-001", "canary_prepared_manifest.json", 3),
    "matrix_011": ("codex-native-goal-streamed-matrix-011", "FULL_MATRIX", 11, "R9M11", "r9_m11_", "run-matrix-011", "matrix_011_prepared_manifest.json", 291),
    "matrix_012": ("codex-native-goal-streamed-matrix-012", "FULL_MATRIX", 12, "R9M12", "r9_m12_", "run-matrix-012", "matrix_012_prepared_manifest.json", 291),
}
PARENT = "01a00b52-4879-7c41-a826-7b4609ad3c3b"


class Invalid(Exception):
    pass


def require(condition, mismatch):
    if not condition:
        raise Invalid(mismatch)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def pairs(values):
    result = {}
    for key, value in values:
        require(key not in result, "duplicate-key:" + key)
        result[key] = value
    return result


def finite(value):
    if isinstance(value, float):
        return math.isfinite(value)
    if isinstance(value, list):
        return all(finite(item) for item in value)
    if isinstance(value, dict):
        return all(finite(item) for item in value.values())
    return True


def canonical(value):
    require(finite(value), "nonfinite")
    return (json.dumps(value, ensure_ascii=False, allow_nan=False, separators=(",", ":"),
                       sort_keys=True) + "\n").encode("utf-8")


def read_exact(name):
    path, mode, size, digest = FILES[name]
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode)
            and stat.S_IMODE(before.st_mode) == mode and before.st_uid == os.getuid()
            and before.st_nlink == 1 and before.st_size == size, "custody:" + name)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        current = os.fstat(fd)
        require((current.st_dev, current.st_ino) == (before.st_dev, before.st_ino), "race:" + name)
        raw = b""
        while len(raw) < size:
            part = os.read(fd, size - len(raw))
            require(bool(part), "short:" + name)
            raw += part
        require(not os.read(fd, 1), "trailing:" + name)
        after = os.fstat(fd)
        require((after.st_dev, after.st_ino, after.st_size) ==
                (before.st_dev, before.st_ino, before.st_size), "drift:" + name)
    finally:
        os.close(fd)
    require(sha(raw) == digest, "digest:" + name)
    return raw


def parse(name):
    raw = read_exact(name)
    try:
        value = json.loads(raw.decode("utf-8"), object_pairs_hook=pairs,
                           parse_constant=lambda token: (_ for _ in ()).throw(Invalid("constant:" + token)))
    except (json.JSONDecodeError, UnicodeError) as error:
        raise Invalid("json:" + name) from error
    require(raw == canonical(value), "canonical:" + name)
    return raw, value


def chunks(raw):
    output = []
    current = ""
    for char in raw.decode("utf-8"):
        candidate = (current + char).encode("utf-8")
        if current and len(candidate) > 170:
            output.append(current.encode("utf-8"))
            current = char
        else:
            current += char
    if current:
        output.append(current.encode("utf-8"))
    require(output and b"".join(output) == raw and max(map(len, output)) <= 170, "chunking")
    return output


def semantic():
    _, value = parse("semantic")
    require(value.get("schema_id") == "pw-r9-immutable-semantic-bundle-v1", "semantic-schema")
    require(value.get("routes") == [
        {"model": "gpt-5.4-mini", "reasoning_effort": "xhigh", "slot": "slot-alpha"},
        {"model": "gpt-5.4-mini", "reasoning_effort": "medium", "slot": "slot-bravo"},
        {"model": "gpt-5.6-luna", "reasoning_effort": "medium", "slot": "slot-charlie"}], "semantic-routes")
    cells = value.get("cells")
    require(isinstance(cells, list) and len(cells) == 97, "semantic-cells")
    for index, cell in enumerate(cells):
        subject = cell.get("render_utf8", "").encode("utf-8")
        expected = cell.get("expected_output_utf8", "").encode("utf-8")
        require(cell.get("index") == index and isinstance(cell.get("cell"), str), "semantic-index")
        require((len(subject), sha(subject)) ==
                (cell.get("render_utf8_bytes"), cell.get("render_utf8_sha256")), "semantic-subject")
        require((len(expected), sha(expected)) ==
                (cell.get("expected_output_bytes"), cell.get("expected_output_sha256")), "semantic-expected")
        require(1 <= len(subject) <= 20000 and 1 <= len(expected) <= 2048, "semantic-limits")
    return cells


def binding(name):
    path, mode, size, digest = FILES[name]
    return {"bytes": size, "mode": "{:04o}".format(mode), "path": path, "sha256": digest}


def inspect_skill():
    text = read_exact("skill").decode("utf-8")
    required = ["Call native `create_goal` once", "For each zero-padded slice index",
                "Do not answer, summarize, inspect, or call another tool between slices",
                "Call `update_goal({status:\"complete\"})` once",
                "Any mismatch consumes this row"]
    require(all(token in text for token in required), "skill-contract")
    require(text.index(required[0]) < text.index(required[1]) < text.index(required[3]), "skill-order")
    require("followup_task" not in text and "send_message" not in text
            and "No subject is in this message" not in text, "skill-hidden-path")
    decoder = read_exact("decoder").decode("utf-8")
    require('record["tool"] == "create_goal"' in decoder
            and 'record["tool"] == "exec_command"' in decoder
            and 'update["tool"] == "update_goal"' in decoder
            and 'subject-before-active' in decoder and 'final-answer' in decoder, "decoder-contract")
    harness = read_exact("harness").decode("utf-8")
    require('subject not in prompt' in harness and 'validate_pending' in harness
            and 'validate_terminal' in harness and 'global-unique:' in harness, "harness-contract")
    read_exact("builder")


def plan(name, cells, globally_seen):
    raw, value = parse(name)
    require(set(value) == {"authority", "bindings", "experiment", "failure_contract", "limits",
            "qualification", "roster", "rows", "schema_id", "status"}, "plan-shape:" + name)
    require(value["authority"] == AUTHORITY and value["failure_contract"] == FAILURE
            and value["qualification"] == QUALIFICATION and value["limits"] == LIMITS
            and value["roster"] == ROSTER, "plan-controls:" + name)
    require(value["schema_id"] == "pw-r9-codex-native-goal-streamed-matrix-plan-v1"
            and value["status"] == "PREDECLARED_ZERO_CREDIT_NO_LAUNCH_AUTHORITY", "plan-status:" + name)
    require(value["bindings"] == {"bootstrap_skill": binding("skill"),
            "safe_base": {"bytes": 30406, "mode": "0644", "path": ROOT + "/tests/r9g29/goal_harness.py",
                          "sha256": "4dbbd261b5e6b51839941b4001adc662ed6ac714ad1d2c6aa176ec853d45544c"},
            "semantic_bundle": binding("semantic"), "stream_decoder": binding("decoder")}, "plan-bindings:" + name)
    expected = EXPERIMENTS[name]
    experiment = value["experiment"]
    expected_experiment = {"experiment_id": expected[0], "kind": expected[1],
        "manifest_path": ROOT + "/tests/r9g30/" + expected[6], "matrix_index": expected[2],
        "max_parallel": 3, "objective_prefix": expected[3], "parent_thread_id": PARENT,
        "root": ROOT + "/tests/r9g30/" + expected[5], "row_count": expected[7],
        "schedule": "CELL_MAJOR_ALPHA_BRAVO_CHARLIE", "stop_at_first_nonpass": True,
        "task_prefix": expected[4]}
    require(experiment == expected_experiment, "experiment:" + name)
    require(not os.path.lexists(experiment["root"])
            and not os.path.lexists(experiment["manifest_path"]), "unused-root:" + name)
    rows = value["rows"]
    require(isinstance(rows, list) and len(rows) == expected[7], "rows:" + name)
    coverage = {route: 0 for route in ROSTER}
    cell_coverage = {}
    max_slices = max_subject = max_spawn = 0
    for index, row in enumerate(rows):
        require(set(row) == {"cell", "cell_index", "model", "reasoning_effort", "route", "row_id"}, "row-shape")
        cell_index = 3 if name == "canary" else index // 3
        route = ("alpha", "bravo", "charlie")[index % 3]
        require(row == {"cell": cells[cell_index]["cell"], "cell_index": cell_index,
                "model": ROSTER[route]["model"], "reasoning_effort": ROSTER[route]["reasoning_effort"],
                "route": route, "row_id": "R{:03d}".format(index)}, "row-value:" + name)
        nonce = sha(b"pw-r9-goal-streamed-row-v1\0" + sha(raw).encode("ascii") + b"\0"
                    + row["row_id"].encode("ascii") + b"\0" + route.encode("ascii"))
        objective = "{}|r={}|x={}|once".format(expected[3], row["row_id"], nonce)
        task_name = expected[4] + nonce
        workdir = experiment["root"] + "/" + row["row_id"] + "/" + nonce
        subject = cells[cell_index]["render_utf8"].encode("utf-8")
        sliced = chunks(subject)
        prompt = ("Use $r9-goal-streamed-row. Exact objective=" + json.dumps(objective)
                  + "; reader workdir=" + json.dumps(workdir)
                  + "; slice_count=" + str(len(sliced)) + ". No subject is in this message.").encode("utf-8")
        require(len(objective.encode("utf-8")) <= 128 and len(prompt) <= 512
                and subject not in prompt, "prompt-boundary:" + name)
        identities = (nonce, objective, task_name, "/root/" + task_name, workdir)
        require(not any(item in globally_seen for item in identities), "identity-reuse:" + name)
        globally_seen.update(identities)
        coverage[route] += 1
        cell_coverage[cell_index] = cell_coverage.get(cell_index, 0) + 1
        max_slices = max(max_slices, len(sliced)); max_subject = max(max_subject, len(subject)); max_spawn = max(max_spawn, len(prompt))
    require(len(set(coverage.values())) == 1 and all(value == 3 for value in cell_coverage.values()), "coverage:" + name)
    require((name == "canary" and cell_coverage == {3: 3})
            or (name != "canary" and cell_coverage == {index: 3 for index in range(97)}), "cell-coverage:" + name)
    return {"max_slice_count": max_slices, "max_spawn_prompt_bytes": max_spawn,
            "max_subject_bytes": max_subject, "row_count": len(rows), "sha256": sha(raw)}


def check():
    inspect_skill()
    cells = semantic()
    for name in ("matrix_005_failure", "matrix_005_adjudication", "matrix_009_failure"):
        raw = read_exact(name)
        require(b'"qualification_credit":0' in raw or b'"qualification"' in raw, "failure-credit:" + name)
    seen = set(); projections = {name: plan(name, cells, seen) for name in PLAN_KEYS}
    require(projections["matrix_011"]["row_count"] == projections["matrix_012"]["row_count"] == 291,
            "matrix-pair")
    return {"assertion_count": 1204 + 34 * sum(item["row_count"] for item in projections.values()),
            "first_mismatch": None, "mutation_count": 0, "plans": projections,
            "protected_failure_count": 3, "qualification_credit": 0,
            "schema_id": "pw-r9-codex-native-goal-streamed-plan-independent-check-v1",
            "status": "PASS_STATIC_PLAN_ADMISSION_ZERO_CALLS_ZERO_CREDIT",
            "subject_calls": 0, "workspace_writes": 0}


def main(argv):
    require(argv == [sys.argv[0], "--check"], "argv")
    sys.stdout.buffer.write(canonical(check()))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv))
    except (Invalid, OSError, UnicodeError, KeyError, TypeError, ValueError) as error:
        sys.stdout.buffer.write(canonical({"first_mismatch": str(error), "qualification_credit": 0,
            "schema_id": "pw-r9-codex-native-goal-streamed-plan-independent-check-v1",
            "status": "FAIL", "subject_calls": 0, "workspace_writes": 0}))
        raise SystemExit(1)
