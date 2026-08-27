#!/usr/bin/env python3
import ast
import hashlib
import json
import math
import os
import re
import stat
import sys

sys.dont_write_bytecode = True
SELF = "/mnt/Cursor/PuppetMaster/tests/r9g37/goal_stream_static_preflight_v3.py"
BUILDER = "/mnt/Cursor/PuppetMaster/tests/r9g37/goal_stream_plan_builder_v3.py"
RUNTIME = "/mnt/Cursor/PuppetMaster/tests/r9g37/goal_stream_runtime_v3.py"
VERIFIER = "/mnt/Cursor/PuppetMaster/tests/r9g37/goal_stream_verifier_v3.py"
ATTESTOR = "/mnt/Cursor/PuppetMaster/tests/r9g36/goal_db_attestor.py"
SKILL = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-streamed-row-v3/SKILL.md"
SOURCE_ROOT = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/codex_native_goal_bite_matrix_pair_005_006_inputs_v3"
SOURCE_MANIFEST = SOURCE_ROOT + "/manifest.json"
SOURCE_MANIFEST_BYTES = 243312
SOURCE_MANIFEST_SHA256 = "a0da41236655d4352f1aa5074673c2296ff2a4077dd26b8f315e60e80516cd87"
CANARY_SUCCESS = "/mnt/Cursor/PuppetMaster/tests/r9g36/canary_006_success_receipt.json"
V2_FAILURE = "/mnt/Cursor/PuppetMaster/tests/r9g37/stream_canary_002_runtime_failure_receipt.json"
ROOT = "/mnt/Cursor/PuppetMaster/tests/r9g37"
HEX = re.compile(r"^[0-9a-f]{64}$")
ROSTER = {
    "slot-alpha": ("alpha", "gpt-5.4-mini", "xhigh"),
    "slot-bravo": ("bravo", "gpt-5.4-mini", "medium"),
    "slot-charlie": ("charlie", "gpt-5.6-luna", "medium"),
}
EXPERIMENTS = {
    0: ("c003", "r9g37-v3-canary-003", ROOT + "/run-stream-canary-003", [0, 97, 194]),
    1: ("m001", "r9g37-v3-matrix-001", ROOT + "/run-stream-v3-matrix-001", list(range(291))),
    2: ("m002", "r9g37-v3-matrix-002", ROOT + "/run-stream-v3-matrix-002", list(range(291))),
}


class Invalid(Exception):
    pass


def require(value, mismatch):
    if not value:
        raise Invalid(mismatch)


def pairs(items):
    value = {}
    for key, item in items:
        require(key not in value, "duplicate-key:" + key)
        value[key] = item
    return value


def finite(value):
    if isinstance(value, float):
        return math.isfinite(value)
    if isinstance(value, list):
        return all(finite(item) for item in value)
    if isinstance(value, dict):
        return all(isinstance(key, str) and finite(item) for key, item in value.items())
    return True


def parse(raw):
    value = json.loads(raw.decode("utf-8"), object_pairs_hook=pairs, parse_constant=lambda token: (_ for _ in ()).throw(Invalid("nonfinite:" + token)))
    require(finite(value), "finite")
    return value


def canonical(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, separators=(",", ":"), sort_keys=True).encode("utf-8") + b"\n"


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def read_exact(path, mode, size=None, digest=None, cap=2000000):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode) and stat.S_IMODE(before.st_mode) == mode and before.st_uid == os.getuid() and before.st_nlink == 1, "custody:" + path)
    require(size is None or before.st_size == size, "size:" + path)
    require(before.st_size <= cap, "cap:" + path)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        raw = b""
        while len(raw) < before.st_size:
            part = os.read(fd, before.st_size - len(raw))
            require(bool(part), "short:" + path)
            raw += part
        require(os.read(fd, 1) == b"", "trailing:" + path)
        after = os.fstat(fd)
    finally:
        os.close(fd)
    current = os.lstat(path)
    identity = (before.st_dev, before.st_ino, before.st_size)
    require(identity == (after.st_dev, after.st_ino, after.st_size) == (current.st_dev, current.st_ino, current.st_size), "race:" + path)
    require(digest is None or sha(raw) == digest, "digest:" + path)
    return raw


def binding(path, mode=0o644):
    raw = read_exact(path, mode)
    return {"bytes": len(raw), "mode": format(mode, "04o"), "path": path, "sha256": sha(raw)}


def validate_binding(value):
    require(set(value) == {"bytes", "mode", "path", "sha256"} and type(value["bytes"]) is int and value["bytes"] > 0 and value["mode"] in {"0444", "0644"} and os.path.isabs(value["path"]) and os.path.realpath(value["path"]) == value["path"] and HEX.fullmatch(value["sha256"] or ""), "binding-shape")
    read_exact(value["path"], int(value["mode"], 8), value["bytes"], value["sha256"])


def source_rows():
    raw = read_exact(SOURCE_MANIFEST, 0o644, SOURCE_MANIFEST_BYTES, SOURCE_MANIFEST_SHA256)
    manifest = parse(raw)
    require(raw == canonical(manifest) and manifest["schema_id"] == "pw-r9-codex-native-goal-bite-matrix-pair-inputs-v3", "manifest")
    matrices = [item for item in manifest["matrices"] if item["matrix_id"] == "codex-native-goal-bite-matrix-006"]
    require(len(matrices) == 1 and matrices[0]["row_count"] == 291 and len(matrices[0]["rows"]) == 291, "matrix")
    rows = {}
    for entry in matrices[0]["rows"]:
        path = SOURCE_ROOT + "/" + entry["row_file"]["path"]
        row_raw = read_exact(path, 0o644, entry["row_file"]["bytes"], entry["row_file"]["sha256"], cap=100000)
        row = parse(row_raw)
        require(row_raw == canonical(row) and row["schema_id"] == "pw-r9-codex-native-goal-bite-matrix-row-v3" and row["run_id"] == "codex-native-goal-bite-matrix-006", "source-row")
        index = entry["index"]
        require(index not in rows and index == row["index"] and entry["row_id"] == row["row_id"] and entry["cell"] == row["cell"], "source-index")
        require(row["route"] in ROSTER and (row["model_requested"], row["reasoning_effort_requested"]) == ROSTER[row["route"]][1:], "source-roster")
        payloads = []
        for chunk_index, item in enumerate(row["prompt_sequence"]["subject_chunks"]):
            encoded = item["text"].encode("utf-8")
            require(b"\n" in encoded, "chunk-envelope")
            _, payload = encoded.split(b"\n", 1)
            require(item["chunk_index"] == chunk_index and item["payload_bytes"] == len(payload) and item["payload_sha256"] == sha(payload) and 1 <= len(payload) <= 170, "chunk")
            payloads.append(payload)
        subject = b"".join(payloads)
        require(len(payloads) == row["subject"]["chunk_count"] and len(subject) == row["subject"]["bytes"] and sha(subject) == row["subject"]["sha256"], "subject")
        rows[index] = (entry, row, row_raw, payloads, subject)
    require(set(rows) == set(range(291)), "source-complete")
    return rows


def expected_row(exp, item):
    token, experiment_id, _, _ = exp
    entry, source, raw, _, _ = item
    route, model, effort = ROSTER[source["route"]]
    objective = "R9G37V3|" + token + "|" + source["row_id"] + "|" + source["subject"]["sha256"]
    require(len(objective.encode("utf-8")) <= 128, "objective-ceiling")
    nonce = sha(("r9g37|" + experiment_id + "|" + source["row_id"] + "|" + source["subject"]["sha256"] + "|once").encode("utf-8"))
    return {
        "agent_role": "default",
        "cell": source["cell"],
        "cell_index": source["cell_index"],
        "chunk_count": source["subject"]["chunk_count"],
        "expected_result": {"bytes": source["expected_output_bytes"], "sha256": source["expected_output_sha256"]},
        "goal_objective": objective,
        "index": source["index"],
        "model": model,
        "reasoning_effort": effort,
        "route": route,
        "row_id": source["row_id"],
        "source_row": {"bytes": len(raw), "mode": "0644", "path": SOURCE_ROOT + "/" + entry["row_file"]["path"], "sha256": sha(raw)},
        "subject": {"bytes": source["subject"]["bytes"], "sha256": source["subject"]["sha256"]},
        "task_name": "r9_gds3_" + nonce,
        "task_path": "/root/r9_gds3_" + nonce,
    }


def spawn_prompt(row, root):
    workdir = root + "/rows/" + row["row_id"]
    raw = ("Use $r9-goal-streamed-row-v3. Exact objective=" + json.dumps(row["goal_objective"]) + "; reader workdir=" + json.dumps(workdir) + "; slice count=" + format(row["chunk_count"], "03d") + ", indexes 000.." + format(row["chunk_count"] - 1, "03d") + ". No subject bytes, criteria, options, or answer are in this message.").encode("utf-8")
    require(len(raw) <= 512, "spawn-prompt")
    return raw


def component_checks():
    sources = {}
    for path in (SELF, BUILDER, RUNTIME, VERIFIER, ATTESTOR):
        raw = read_exact(path, 0o644)
        ast.parse(raw.decode("utf-8"), filename=path)
        sources[path] = raw.decode("utf-8")
    skill = read_exact(SKILL, 0o644, cap=10000).decode("utf-8")
    require("name: r9-goal-streamed-row-v3" in skill and "create_goal` exactly once" in skill and "never batch, loop" in skill and "host-mandated memory/context lookup" in skill, "skill-contract")
    require("<= 128" in sources[ATTESTOR] and 'agent_role"] == "default"' in sources[ATTESTOR], "attestor-contract")
    require('"agent_type": row["agent_role"]' in sources[RUNTIME] and "validate_pregoal_call" in sources[RUNTIME] and "chunk-wrapper-batch" in sources[RUNTIME] and "subject-before-goal" in sources[RUNTIME], "runtime-contract")
    require("def pregoal(" in sources[VERIFIER] and "chunk-batch" in sources[VERIFIER] and "subject-before-goal" in sources[VERIFIER], "verifier-contract")
    require("--emit-canary" in sources[BUILDER] and "<= 128" in sources[BUILDER] and '"agent_role": "default"' in sources[BUILDER], "builder-contract")


def admit(plan_path):
    parent = os.lstat(ROOT)
    require(stat.S_ISDIR(parent.st_mode) and not stat.S_ISLNK(parent.st_mode) and stat.S_IMODE(parent.st_mode) == 0o755 and parent.st_uid == os.getuid(), "parent-mode")
    component_checks()
    all_rows = source_rows()
    all_tasks = set()
    for ordinal, exp in EXPERIMENTS.items():
        for index in range(291):
            row = expected_row(exp, all_rows[index])
            require(row["task_name"] not in all_tasks, "cross-run-task-collision")
            all_tasks.add(row["task_name"])
            spawn_prompt(row, exp[2])
    plan_raw = read_exact(plan_path, 0o444, cap=1000000)
    plan = parse(plan_raw)
    require(plan_raw == canonical(plan) and plan["schema_id"] == "pw-r9-codex-native-goal-db-stream-v3-plan-v1" and plan["status"] == "FROZEN_GOAL_FIRST_STREAMED_SUBJECT_ZERO_CREDIT", "plan")
    require(plan["authority"] == {"empirical_launch": False, "matrix_launch": False, "qualification": False, "qualification_credit": 0} and plan["failure_contract"] == {"best_of": 0, "relaunch": 0, "replacement": 0, "resend": 0, "retry": 0, "reuse": 0}, "plan-authority")
    bindings = plan["bindings"]
    require(set(bindings) == {"attestor", "builder", "canary_006_success", "offline_verifier", "preflight", "runtime", "skill", "source_manifest", "v2_failure"}, "plan-bindings")
    for item in bindings.values():
        validate_binding(item)
    expected_bindings = {"attestor": binding(ATTESTOR), "builder": binding(BUILDER), "canary_006_success": binding(CANARY_SUCCESS), "offline_verifier": binding(VERIFIER), "preflight": binding(SELF), "runtime": binding(RUNTIME), "skill": binding(SKILL), "source_manifest": binding(SOURCE_MANIFEST), "v2_failure": binding(V2_FAILURE)}
    require(bindings == expected_bindings, "plan-binding-values")
    exp_value = plan["experiment"]
    ordinal = exp_value["matrix_ordinal"]
    require(ordinal in EXPERIMENTS, "ordinal")
    exp = EXPERIMENTS[ordinal]
    expected_indices = exp[3]
    require((exp_value["id"], exp_value["root"], exp_value["kind"], exp_value["row_count"]) == (exp[1], exp[2], "canary" if ordinal == 0 else "matrix", len(expected_indices)), "experiment")
    require(not os.path.lexists(exp_value["root"]), "run-root-exists")
    expected = [expected_row(exp, all_rows[index]) for index in expected_indices]
    require(plan["rows"] == expected, "plan-rows")
    max_objective = max(len(row["goal_objective"].encode("utf-8")) for row in expected)
    max_prompt = max(len(spawn_prompt(row, exp_value["root"])) for row in expected)
    require(max_objective <= 128 and max_prompt <= 512 and {row["agent_role"] for row in expected} == {"default"}, "closed-ceilings")
    return {
        "authority": {"canary_launch": ordinal == 0, "matrix_launch": ordinal in {1, 2}, "qualification": False, "qualification_credit": 0, "release": False},
        "bindings": {"canary_006_success": binding(CANARY_SUCCESS), "plan": {"bytes": len(plan_raw), "mode": "0444", "path": plan_path, "sha256": sha(plan_raw)}, "preflight": binding(SELF), "runtime": binding(RUNTIME), "skill": binding(SKILL), "source_manifest": binding(SOURCE_MANIFEST), "v2_failure": binding(V2_FAILURE)},
        "checks": {"agent_role_rows": len(expected), "goal_objective_max_bytes": max_objective, "parent_mode": "0755", "plan_rows": len(expected), "source_rows_reconstructed": len(expected), "spawn_prompt_max_bytes": max_prompt, "subject_slice_max_bytes": 170},
        "constraints": {"explicit_agent_role": "default", "max_in_flight": 3, "no_subject_before_active_goal": True, "pre_goal_control_bootstrap": "BOUNDED_NON_SUBJECT_ONLY", "stop_at_first_nonpass": True, "subject_slice_max_bytes": 170, "two_clean_full_matrices_required": True},
        "schema_id": "pw-r9-codex-native-goal-db-stream-v3-launch-admission-v1",
        "status": "PASS_EXACT_ONE_FRESH_GOAL_FIRST_STREAMED_RUN_ZERO_CREDIT",
    }


def main(argv):
    require(len(argv) == 3 and argv[1] == "--admit" and os.path.isabs(argv[2]) and os.path.realpath(argv[2]) == argv[2] and argv[2].startswith(ROOT + "/"), "argv")
    result = admit(argv[2])
    sys.stdout.buffer.write(canonical(result)); sys.stdout.buffer.flush()
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv))
    except (Invalid, OSError, UnicodeError, ValueError, KeyError, TypeError, json.JSONDecodeError, SyntaxError) as error:
        sys.stdout.buffer.write(canonical({"first_mismatch": str(error), "qualification_credit": 0, "status": "FAIL"})); sys.stdout.buffer.flush()
        raise SystemExit(1)
