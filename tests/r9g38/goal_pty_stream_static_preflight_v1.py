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
SELF = "/mnt/Cursor/PuppetMaster/tests/r9g38/goal_pty_stream_static_preflight_v1.py"
BUILDER = "/mnt/Cursor/PuppetMaster/tests/r9g38/goal_pty_stream_plan_builder_v1.py"
RUNTIME = "/mnt/Cursor/PuppetMaster/tests/r9g38/goal_pty_stream_runtime_v1.py"
VERIFIER = "/mnt/Cursor/PuppetMaster/tests/r9g38/goal_pty_stream_verifier_v1.py"
ATTESTOR = "/mnt/Cursor/PuppetMaster/tests/r9g36/goal_db_attestor.py"
SKILL = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-pty-stream-v1/SKILL.md"
CONTRACT = "/mnt/Cursor/PuppetMaster/tests/r9g38/goal_pty_stream_contract_v1.json"
CONTRACT_BYTES = 4717
CONTRACT_SHA256 = "a9d6ae62a90c81ea86b33a03097038ad2c6eecdac76135c9b6956c7b1ad9075f"
SOURCE_ROOT = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/codex_native_goal_bite_matrix_pair_005_006_inputs_v3"
SOURCE_MANIFEST = SOURCE_ROOT + "/manifest.json"
SOURCE_MANIFEST_BYTES = 243312
SOURCE_MANIFEST_SHA256 = "a0da41236655d4352f1aa5074673c2296ff2a4077dd26b8f315e60e80516cd87"
CANARY_SUCCESS = "/mnt/Cursor/PuppetMaster/tests/r9g36/canary_006_success_receipt.json"
V2_FAILURE = "/mnt/Cursor/PuppetMaster/tests/r9g37/stream_canary_002_runtime_failure_receipt.json"
V3_FAILURE = "/mnt/Cursor/PuppetMaster/tests/r9g37/stream_canary_003_runtime_failure_receipt.json"
V4_FAILURE = "/mnt/Cursor/PuppetMaster/tests/r9g37/stream_matrix_001_plan_v4_static_failure_receipt.json"
V5_FAILURE = "/mnt/Cursor/PuppetMaster/tests/r9g37/stream_canary_005_runtime_failure_receipt_v5.json"
ROOT = "/mnt/Cursor/PuppetMaster/tests/r9g38"
HEX = re.compile(r"^[0-9a-f]{64}$")
ROSTER = {
    "slot-alpha": ("alpha", "gpt-5.4-mini", "xhigh"),
    "slot-bravo": ("bravo", "gpt-5.4-mini", "medium"),
    "slot-charlie": ("charlie", "gpt-5.6-luna", "medium"),
}
EXPERIMENTS = {
    0: ("c001", "r9g38-pty-canary-001", ROOT + "/run-pty-canary-001", [0, 97, 194]),
    1: ("m001", "r9g38-pty-matrix-001", ROOT + "/run-pty-matrix-001", list(range(291))),
    2: ("m002", "r9g38-pty-matrix-002", ROOT + "/run-pty-matrix-002", list(range(291))),
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
    require(set(value) == {"bytes", "mode", "path", "sha256"} and type(value["bytes"]) is int and value["bytes"] > 0 and value["mode"] in {"0444", "0644"} and os.path.isabs(value["path"]) and os.path.realpath(value["path"]) == value["path"] and HEX.fullmatch(value["sha256"] or ""), "binding")
    read_exact(value["path"], int(value["mode"], 8), value["bytes"], value["sha256"])


def load_contract():
    raw = read_exact(CONTRACT, 0o444, CONTRACT_BYTES, CONTRACT_SHA256)
    value = parse(raw)
    require(raw == canonical(value) and value["schema_id"] == "pw-r9-codex-native-goal-pty-stream-source-derived-contract-v1" and value["status"] == "FROZEN_SOURCE_DERIVED_RESIDENT_PULL_STREAM_ZERO_CREDIT", "contract")
    require(value["source"]["manifest"] == binding(SOURCE_MANIFEST) and value["skill"] == binding(SKILL), "contract-bindings")
    require(value["limits"]["subject_chunk_count_rule"] == "EXACT_BOUND_SOURCE_ROW_NO_INDEPENDENT_NUMERIC_CEILING" and value["source"]["row_count"] == 291 and value["qualification"] == {"credit": "0/2", "required_consecutive_clean_full_matrices": 2}, "contract-authority")
    require(value["preservation"] == {"codex_native_lane": True, "omp_evidence": "FROZEN_DIAGNOSTIC_ONLY_NOT_CONSUMED", "prior_failures_remain_failures": True}, "preservation")
    return value


def source_rows(contract):
    raw = read_exact(SOURCE_MANIFEST, 0o644, SOURCE_MANIFEST_BYTES, SOURCE_MANIFEST_SHA256)
    manifest = parse(raw)
    require(raw == canonical(manifest) and manifest["schema_id"] == "pw-r9-codex-native-goal-bite-matrix-pair-inputs-v3", "manifest")
    matrices = [item for item in manifest["matrices"] if item["matrix_id"] == contract["source"]["matrix_id"]]
    require(len(matrices) == 1 and matrices[0]["row_count"] == 291 and len(matrices[0]["rows"]) == 291, "matrix")
    rows = {}
    for entry in matrices[0]["rows"]:
        path = SOURCE_ROOT + "/" + entry["row_file"]["path"]
        row_raw = read_exact(path, 0o644, entry["row_file"]["bytes"], entry["row_file"]["sha256"], cap=100000)
        row = parse(row_raw)
        require(row_raw == canonical(row) and row["schema_id"] == "pw-r9-codex-native-goal-bite-matrix-row-v3" and row["run_id"] == contract["source"]["matrix_id"], "source-row")
        index = entry["index"]
        require(index not in rows and index == row["index"] and entry["row_id"] == row["row_id"] and entry["cell"] == row["cell"] and row["route"] in ROSTER and (row["model_requested"], row["reasoning_effort_requested"]) == ROSTER[row["route"]][1:], "source-identity")
        payloads = []
        for chunk_index, item in enumerate(row["prompt_sequence"]["subject_chunks"]):
            encoded = item["text"].encode("utf-8")
            require(b"\n" in encoded, "chunk-envelope")
            _, payload = encoded.split(b"\n", 1)
            require(item["chunk_index"] == chunk_index and item["payload_bytes"] == len(payload) and item["payload_sha256"] == sha(payload) and 1 <= len(payload) <= contract["limits"]["subject_slice_max_bytes"], "chunk")
            payloads.append(payload)
        subject = b"".join(payloads)
        require(len(payloads) == row["subject"]["chunk_count"] and len(subject) == row["subject"]["bytes"] and sha(subject) == row["subject"]["sha256"], "subject")
        rows[index] = (entry, row, row_raw)
    require(set(rows) == set(range(291)), "source-complete")
    counts = [item[1]["subject"]["chunk_count"] for item in rows.values()]
    require({"min": min(counts), "max": max(counts)} == contract["source"]["observed_chunk_count"], "observed-counts")
    return rows


def expected_row(exp, item, contract):
    token, experiment_id, _, _ = exp
    entry, source, raw = item
    route, model, effort = ROSTER[source["route"]]
    objective = "R9G38P1|" + token + "|" + source["row_id"] + "|" + source["subject"]["sha256"]
    nonce = sha(("r9g38|" + experiment_id + "|" + source["row_id"] + "|" + source["subject"]["sha256"] + "|once").encode("utf-8"))
    require(len(objective.encode("utf-8")) <= contract["limits"]["goal_objective_max_bytes"], "objective")
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
        "task_name": "r9_gps1_" + nonce,
        "task_path": "/root/r9_gps1_" + nonce,
    }


def spawn_prompt(row, root, contract):
    workdir = root + "/rows/" + row["row_id"]
    raw = ("Use $r9-goal-pty-stream-v1. Exact objective=" + json.dumps(row["goal_objective"]) + "; reader workdir=" + json.dumps(workdir) + "; slice count=" + format(row["chunk_count"], "03d") + ", indexes 000.." + format(row["chunk_count"] - 1, "03d") + ". No subject bytes, criteria, options, or answer are in this message.").encode("utf-8")
    require(len(raw) <= contract["limits"]["spawn_prompt_max_bytes"], "spawn-prompt")
    return raw


def component_checks(contract):
    sources = {}
    for path in (SELF, BUILDER, RUNTIME, VERIFIER, ATTESTOR):
        raw = read_exact(path, 0o644)
        ast.parse(raw.decode("utf-8"), filename=path)
        sources[path] = raw.decode("utf-8")
    skill = read_exact(SKILL, 0o644, cap=10000).decode("utf-8")
    require("name: r9-goal-pty-stream-v1" in skill and "create_goal` exactly once" in skill and "exec_command` exactly once" in skill and "write_stdin` exactly once" in skill and "Never retry, reuse, resend, relaunch" in skill, "skill-contract")
    require('"agent_type": row["agent_role"]' in sources[RUNTIME] and "def stream_reader(" in sources[RUNTIME] and "def validate_stream_start(" in sources[RUNTIME] and "def validate_stream_write(" in sources[RUNTIME] and "DIRECT_RUNNING" in sources[RUNTIME] and "def chunk_call(" not in sources[RUNTIME], "runtime-contract")
    require("def expected_reader(" in sources[VERIFIER] and "def stream_start(" in sources[VERIFIER] and "def stream_write(" in sources[VERIFIER] and "DIRECT_RUNNING" in sources[VERIFIER] and "def chunk_call(" not in sources[VERIFIER], "verifier-contract")
    require("--emit-canary" in sources[BUILDER] and '"agent_role": "default"' in sources[BUILDER] and "v5_failure" in sources[BUILDER], "builder-contract")
    require(contract["limits"]["subject_chunk_count_rule"] in sources[BUILDER] + sources[RUNTIME] + sources[VERIFIER] + sources[SELF], "source-count-authority")
    require("tools.notify" not in skill and "notify(" not in skill and "store(" not in skill and "Promise.all" not in skill, "skill-hidden-transport")


def admit(plan_path):
    contract = load_contract()
    parent = os.lstat(ROOT)
    require(stat.S_ISDIR(parent.st_mode) and not stat.S_ISLNK(parent.st_mode) and stat.S_IMODE(parent.st_mode) == 0o755 and parent.st_uid == os.getuid(), "parent-mode")
    component_checks(contract)
    declared = {item["matrix_ordinal"]: (item["goal_run_token"], item["id"], item["root"], item.get("source_indices", list(range(291)))) for item in contract["experiments"].values()}
    require(EXPERIMENTS == declared, "contract-experiments")
    rows = source_rows(contract)
    all_tasks = set()
    for exp in EXPERIMENTS.values():
        for index in range(291):
            row = expected_row(exp, rows[index], contract)
            require(row["task_name"] not in all_tasks, "cross-run-task-collision")
            all_tasks.add(row["task_name"])
            spawn_prompt(row, exp[2], contract)
    require(os.path.isabs(plan_path) and os.path.realpath(plan_path) == plan_path and plan_path.startswith(ROOT + "/"), "plan-path")
    plan_raw = read_exact(plan_path, 0o444, cap=1000000)
    plan = parse(plan_raw)
    require(plan_raw == canonical(plan) and plan["schema_id"] == "pw-r9-codex-native-goal-pty-stream-plan-v1" and plan["status"] == "FROZEN_GOAL_FIRST_RESIDENT_PULL_STREAM_ZERO_CREDIT", "plan")
    require(plan["authority"] == {"empirical_launch": False, "matrix_launch": False, "qualification": False, "qualification_credit": 0} and plan["failure_contract"] == contract["failure_contract"], "plan-authority")
    bindings = plan["bindings"]
    require(set(bindings) == {"attestor", "builder", "canary_006_success", "contract", "offline_verifier", "preflight", "runtime", "skill", "source_manifest", "v2_failure", "v3_failure", "v4_failure", "v5_failure"}, "plan-bindings")
    for item in bindings.values():
        validate_binding(item)
    expected_bindings = {"attestor": binding(ATTESTOR), "builder": binding(BUILDER), "canary_006_success": binding(CANARY_SUCCESS), "contract": binding(CONTRACT, 0o444), "offline_verifier": binding(VERIFIER), "preflight": binding(SELF), "runtime": binding(RUNTIME), "skill": binding(SKILL), "source_manifest": binding(SOURCE_MANIFEST), "v2_failure": binding(V2_FAILURE), "v3_failure": binding(V3_FAILURE), "v4_failure": binding(V4_FAILURE), "v5_failure": binding(V5_FAILURE)}
    require(bindings == expected_bindings, "plan-binding-values")
    exp_value = plan["experiment"]
    ordinal = exp_value["matrix_ordinal"]
    require(ordinal in EXPERIMENTS, "ordinal")
    exp = EXPERIMENTS[ordinal]
    indices = exp[3]
    require((exp_value["id"], exp_value["root"], exp_value["kind"], exp_value["row_count"], exp_value["max_in_flight"], exp_value["stop_at_first_nonpass"]) == (exp[1], exp[2], "canary" if ordinal == 0 else "matrix", len(indices), contract["limits"]["max_in_flight"], True), "experiment")
    require(not os.path.lexists(exp_value["root"]), "run-root-exists")
    expected = [expected_row(exp, rows[index], contract) for index in indices]
    require(plan["rows"] == expected, "plan-rows")
    max_objective = max(len(row["goal_objective"].encode("utf-8")) for row in expected)
    max_prompt = max(len(spawn_prompt(row, exp_value["root"], contract)) for row in expected)
    require(max_objective <= contract["limits"]["goal_objective_max_bytes"] and max_prompt <= contract["limits"]["spawn_prompt_max_bytes"] and {row["agent_role"] for row in expected} == {"default"}, "closed-ceilings")
    return {
        "authority": {"canary_launch": ordinal == 0, "matrix_launch": ordinal in {1, 2}, "qualification": False, "qualification_credit": 0, "release": False},
        "bindings": {"canary_006_success": binding(CANARY_SUCCESS), "contract": binding(CONTRACT, 0o444), "plan": {"bytes": len(plan_raw), "mode": "0444", "path": plan_path, "sha256": sha(plan_raw)}, "preflight": binding(SELF), "runtime": binding(RUNTIME), "skill": binding(SKILL), "source_manifest": binding(SOURCE_MANIFEST), "v2_failure": binding(V2_FAILURE), "v3_failure": binding(V3_FAILURE), "v4_failure": binding(V4_FAILURE), "v5_failure": binding(V5_FAILURE)},
        "checks": {"agent_role_rows": len(expected), "frozen_trace_rows_checked": 0, "goal_objective_max_bytes": max_objective, "parent_mode": "0755", "plan_rows": len(expected), "source_chunk_count_max_observed": contract["source"]["observed_chunk_count"]["max"], "source_corpus_rows_checked": 291, "source_rows_reconstructed": len(expected), "spawn_prompt_max_bytes": max_prompt, "subject_slice_max_bytes": contract["limits"]["subject_slice_max_bytes"]},
        "constraints": {"explicit_agent_role": "default", "max_in_flight": contract["limits"]["max_in_flight"], "no_subject_before_active_goal": True, "pre_goal_control_bootstrap": "BOUNDED_NON_SUBJECT_ONLY", "stop_at_first_nonpass": True, "subject_chunk_count_rule": contract["limits"]["subject_chunk_count_rule"], "subject_slice_max_bytes": contract["limits"]["subject_slice_max_bytes"], "two_clean_full_matrices_required": True},
        "schema_id": "pw-r9-codex-native-goal-pty-stream-v1-launch-admission-v1",
        "status": "PASS_EXACT_ONE_FRESH_GOAL_FIRST_STREAMED_RUN_ZERO_CREDIT",
    }


def main(argv):
    require(len(argv) == 3 and argv[1] == "--admit", "argv")
    result = admit(argv[2])
    sys.stdout.buffer.write(canonical(result)); sys.stdout.buffer.flush()
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv))
    except (Invalid, OSError, UnicodeError, ValueError, KeyError, TypeError, json.JSONDecodeError, SyntaxError) as error:
        sys.stdout.buffer.write(canonical({"first_mismatch": str(error), "qualification_credit": 0, "status": "FAIL"})); sys.stdout.buffer.flush()
        raise SystemExit(1)
