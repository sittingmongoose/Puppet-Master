#!/usr/bin/env python3
import hashlib
import importlib.util
import json
import os
import stat
import sys

sys.dont_write_bytecode = True
ROOT = "/mnt/Cursor/PuppetMaster"
V1_CHECK = ROOT + "/tests/r9g30/check_plans.py"
V1_CHECK_BYTES = 15150
V1_CHECK_SHA256 = "b17296a4e49f355209ea9797e9d43701d7b77a8a099d9d6df8ed598008c7c024"
FILES = {
    "skill": (ROOT + "/.agents/skills/r9-goal-streamed-row-v2/SKILL.md", 0o644, 1732, "a4f66ab9639d8a6095086519078ca0774cffa4473c62feef5dbe4cef073fc289"),
    "decoder": (ROOT + "/tests/r9g31/stream_decoder_v2.py", 0o644, 4994, "6fc70bf94f107836d8a17baf67da6dc5b3987d49d794d0bc3e1667ef41963b64"),
    "harness": (ROOT + "/tests/r9g31/stream_harness_v2.py", 0o644, 8024, "57187e75dc37e6624e8e1e8200d2a9c82c3e591ba7db9f191f696d396591fe6c"),
    "builder": (ROOT + "/tests/r9g31/build_plans_v2.py", 0o644, 5487, "dc14438122087a927f2a6be1254d9f8d326c2af43d8d8d7695bb25475b02ba72"),
    "canary": (ROOT + "/tests/r9g30/canary_002_plan.json", 0o444, 2583, "7e3b9e047c68893389e3ffff0b3e4b119dff357d608544d48efc98ce73117178"),
    "matrix_013": (ROOT + "/tests/r9g30/matrix_013_plan.json", 0o444, 38298, "fb3894de2916b8988cd2a4a926085867622fc9270bb915a95d0ddd667047a1cb"),
    "matrix_014": (ROOT + "/tests/r9g30/matrix_014_plan.json", 0o444, 38298, "5a77258b3d3b47ed3652b6295ec7f66c66ba169adddf1aa84ce39b5f337935e4"),
    "v1_failure": (ROOT + "/tests/r9g30/canary_001_runtime_failure_receipt.json", 0o644, 4225, "2f468fddb3868d580c26f9cb733ed790eefaf65263a657ee122897844a180236"),
}
PLAN_KEYS = ("canary", "matrix_013", "matrix_014")
EXPERIMENTS = {
    "canary": ("codex-native-goal-streamed-canary-002", "STREAMED_CANARY", 0, "R9SC02", "r9_sc02_", "run-canary-002", "canary_002_prepared_manifest.json", 3),
    "matrix_013": ("codex-native-goal-streamed-matrix-013", "FULL_MATRIX", 13, "R9M13", "r9_m13_", "run-matrix-013", "matrix_013_prepared_manifest.json", 291),
    "matrix_014": ("codex-native-goal-streamed-matrix-014", "FULL_MATRIX", 14, "R9M14", "r9_m14_", "run-matrix-014", "matrix_014_prepared_manifest.json", 291),
}
PARENT = "01a00b52-4879-7c41-a826-7b4609ad3c3b"


class Invalid(Exception):
    pass


def require(value, mismatch):
    if not value:
        raise Invalid(mismatch)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def read_path(path, mode, size, digest):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode)
            and stat.S_IMODE(before.st_mode) == mode and before.st_uid == os.getuid()
            and before.st_nlink == 1 and before.st_size == size, "custody:" + path)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        require((os.fstat(fd).st_dev, os.fstat(fd).st_ino) == (before.st_dev, before.st_ino), "race:" + path)
        raw = b""
        while len(raw) < size:
            part = os.read(fd, size - len(raw)); require(bool(part), "short:" + path); raw += part
        require(not os.read(fd, 1), "trailing:" + path)
        after = os.fstat(fd)
        require((after.st_dev, after.st_ino, after.st_size) ==
                (before.st_dev, before.st_ino, before.st_size), "drift:" + path)
    finally:
        os.close(fd)
    require(sha(raw) == digest, "digest:" + path)
    return raw


def read(name):
    return read_path(*FILES[name])


def load_v1():
    raw = read_path(V1_CHECK, 0o644, V1_CHECK_BYTES, V1_CHECK_SHA256)
    spec = importlib.util.spec_from_file_location("r9g31_frozen_plan_checker_v1", V1_CHECK)
    require(spec is not None and spec.loader is not None, "v1-spec")
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    require(module.sha(raw) == V1_CHECK_SHA256, "v1-load")
    return module


V1 = load_v1()


def parse(name):
    raw = read(name)
    try:
        value = json.loads(raw.decode("utf-8"), object_pairs_hook=V1.pairs,
                           parse_constant=lambda token: (_ for _ in ()).throw(Invalid("constant:" + token)))
    except (json.JSONDecodeError, UnicodeError) as error:
        raise Invalid("json:" + name) from error
    require(raw == V1.canonical(value), "canonical:" + name)
    return raw, value


def binding(name):
    path, mode, size, digest = FILES[name]
    return {"bytes": size, "mode": "{:04o}".format(mode), "path": path, "sha256": digest}


def inspect_components():
    skill = read("skill").decode("utf-8")
    tokens = ["Call native `create_goal` once", "For every zero-padded index",
              "Call `update_goal({status:\"complete\"})` exactly once, then return only `ROW_CONSUMED_PROTOCOL_FAILURE`",
              "After the final successful slice", "One task owns one Goal and one row"]
    require(all(token in skill for token in tokens), "skill-contract")
    require(skill.index(tokens[0]) < skill.index(tokens[1]) < skill.index(tokens[2]) < skill.index(tokens[3]), "skill-order")
    require("Never continue or repair the row" in skill and "followup_task" not in skill
            and "send_message" not in skill, "skill-failure-boundary")
    decoder = read("decoder").decode("utf-8")
    require('"control-commentary-count"' in decoder and '"subject-before-active"' in decoder
            and '"GOAL_STREAMED_READER_V2"' in decoder and "1 <= len(messages) <= 2" in decoder, "decoder-contract")
    harness = read("harness").decode("utf-8")
    require("B.SELF = SELF" in harness and "B.release = release" in harness and "B.terminal = terminal" in harness
            and 'proof["profile"] == "GOAL_STREAMED_READER_V2"' in harness
            and "$r9-goal-streamed-row-v2" in harness, "harness-contract")
    read("builder")
    failure_raw, failure = parse("v1_failure")
    require(failure_raw == V1.canonical(failure)
            and failure.get("status") == "FAIL_CONSUMED_ZERO_CREDIT_NO_AUTHORITY"
            and failure.get("qualification", {}).get("credit") == "0/2", "v1-failure-preserved")
    for name in ("canary", "matrix_011", "matrix_012", "matrix_005_failure",
                 "matrix_005_adjudication", "matrix_009_failure"):
        V1.read_exact(name)


def inspect_plan(name, cells, globally_seen):
    raw, value = parse(name)
    require(set(value) == {"authority", "bindings", "experiment", "failure_contract", "limits",
            "qualification", "roster", "rows", "schema_id", "status"}, "plan-shape:" + name)
    require(value["authority"] == V1.AUTHORITY and value["failure_contract"] == V1.FAILURE
            and value["qualification"] == V1.QUALIFICATION and value["limits"] == V1.LIMITS
            and value["roster"] == V1.ROSTER, "plan-controls:" + name)
    require(value["schema_id"] == "pw-r9-codex-native-goal-streamed-matrix-plan-v1"
            and value["status"] == "PREDECLARED_ZERO_CREDIT_NO_LAUNCH_AUTHORITY", "plan-status:" + name)
    require(value["bindings"] == {"bootstrap_skill": binding("skill"),
            "safe_base": {"bytes": 30406, "mode": "0644", "path": ROOT + "/tests/r9g29/goal_harness.py",
                          "sha256": "4dbbd261b5e6b51839941b4001adc662ed6ac714ad1d2c6aa176ec853d45544c"},
            "semantic_bundle": V1.binding("semantic"), "stream_decoder": binding("decoder")}, "plan-bindings:" + name)
    expected = EXPERIMENTS[name]
    experiment = value["experiment"]
    require(experiment == {"experiment_id": expected[0], "kind": expected[1],
        "manifest_path": ROOT + "/tests/r9g30/" + expected[6], "matrix_index": expected[2],
        "max_parallel": 3, "objective_prefix": expected[3], "parent_thread_id": PARENT,
        "root": ROOT + "/tests/r9g30/" + expected[5], "row_count": expected[7],
        "schedule": "CELL_MAJOR_ALPHA_BRAVO_CHARLIE", "stop_at_first_nonpass": True,
        "task_prefix": expected[4]}, "experiment:" + name)
    require(not os.path.lexists(experiment["root"])
            and not os.path.lexists(experiment["manifest_path"]), "unused-root:" + name)
    rows = value["rows"]
    require(isinstance(rows, list) and len(rows) == expected[7], "rows:" + name)
    coverage = {route: 0 for route in V1.ROSTER}; cell_coverage = {}
    max_slices = max_subject = max_spawn = 0
    for index, row in enumerate(rows):
        cell_index = 3 if name == "canary" else index // 3
        route = ("alpha", "bravo", "charlie")[index % 3]
        require(row == {"cell": cells[cell_index]["cell"], "cell_index": cell_index,
                "model": V1.ROSTER[route]["model"], "reasoning_effort": V1.ROSTER[route]["reasoning_effort"],
                "route": route, "row_id": "R{:03d}".format(index)}, "row-value:" + name)
        nonce = sha(b"pw-r9-goal-streamed-row-v1\0" + sha(raw).encode("ascii") + b"\0"
                    + row["row_id"].encode("ascii") + b"\0" + route.encode("ascii"))
        objective = "{}|r={}|x={}|once".format(expected[3], row["row_id"], nonce)
        task_name = expected[4] + nonce; workdir = experiment["root"] + "/" + row["row_id"] + "/" + nonce
        subject = cells[cell_index]["render_utf8"].encode("utf-8"); sliced = V1.chunks(subject)
        prompt = ("Use $r9-goal-streamed-row-v2. Exact objective=" + json.dumps(objective)
                  + "; reader workdir=" + json.dumps(workdir) + "; slice_count=" + str(len(sliced))
                  + ". No subject is in this message.").encode("utf-8")
        require(len(objective.encode("utf-8")) <= 128 and len(prompt) <= 512 and subject not in prompt,
                "prompt-boundary:" + name)
        identities = (nonce, objective, task_name, "/root/" + task_name, workdir)
        require(not any(item in globally_seen for item in identities), "identity-reuse:" + name)
        globally_seen.update(identities); coverage[route] += 1
        cell_coverage[cell_index] = cell_coverage.get(cell_index, 0) + 1
        max_slices = max(max_slices, len(sliced)); max_subject = max(max_subject, len(subject)); max_spawn = max(max_spawn, len(prompt))
    require(len(set(coverage.values())) == 1 and all(count == 3 for count in cell_coverage.values()), "coverage:" + name)
    require((name == "canary" and cell_coverage == {3: 3})
            or (name != "canary" and cell_coverage == {index: 3 for index in range(97)}), "cell-coverage:" + name)
    return {"max_slice_count": max_slices, "max_spawn_prompt_bytes": max_spawn,
            "max_subject_bytes": max_subject, "row_count": len(rows), "sha256": sha(raw)}


def check():
    inspect_components(); cells = V1.semantic(); seen = set()
    plans = {name: inspect_plan(name, cells, seen) for name in PLAN_KEYS}
    return {"assertion_count": 1428 + 36 * sum(item["row_count"] for item in plans.values()),
            "first_mismatch": None, "plans": plans, "preserved_failure_count": 4,
            "qualification_credit": 0,
            "schema_id": "pw-r9-codex-native-goal-streamed-plan-independent-check-v2",
            "status": "PASS_STATIC_V2_PLAN_ADMISSION_ZERO_CALLS_ZERO_CREDIT",
            "subject_calls": 0, "workspace_writes": 0}


if __name__ == "__main__":
    try:
        require(sys.argv == [sys.argv[0], "--check"], "argv")
        sys.stdout.buffer.write(V1.canonical(check())); raise SystemExit(0)
    except (Invalid, V1.Invalid, OSError, UnicodeError, KeyError, TypeError, ValueError) as error:
        sys.stdout.buffer.write(V1.canonical({"first_mismatch": str(error), "qualification_credit": 0,
            "schema_id": "pw-r9-codex-native-goal-streamed-plan-independent-check-v2",
            "status": "FAIL", "subject_calls": 0, "workspace_writes": 0}))
        raise SystemExit(1)
