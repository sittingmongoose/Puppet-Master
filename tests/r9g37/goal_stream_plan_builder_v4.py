#!/usr/bin/env python3
import hashlib
import json
import math
import os
import stat
import sys

sys.dont_write_bytecode = True
SELF = "/mnt/Cursor/PuppetMaster/tests/r9g37/goal_stream_plan_builder_v4.py"
RUNTIME = "/mnt/Cursor/PuppetMaster/tests/r9g37/goal_stream_runtime_v4.py"
VERIFIER = "/mnt/Cursor/PuppetMaster/tests/r9g37/goal_stream_verifier_v4.py"
PREFLIGHT = "/mnt/Cursor/PuppetMaster/tests/r9g37/goal_stream_static_preflight_v4.py"
ATTESTOR = "/mnt/Cursor/PuppetMaster/tests/r9g36/goal_db_attestor.py"
SKILL = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-streamed-row-v4/SKILL.md"
SKILL_BYTES = 2345
SKILL_SHA256 = "4ca3bd2f77262905597c68604754ba09146888f07235d3e12aa36d57af3e8c58"
SOURCE_ROOT = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/codex_native_goal_bite_matrix_pair_005_006_inputs_v3"
SOURCE_MANIFEST = SOURCE_ROOT + "/manifest.json"
SOURCE_MANIFEST_BYTES = 243312
SOURCE_MANIFEST_SHA256 = "a0da41236655d4352f1aa5074673c2296ff2a4077dd26b8f315e60e80516cd87"
CANARY_SUCCESS = "/mnt/Cursor/PuppetMaster/tests/r9g36/canary_006_success_receipt.json"
CANARY_SUCCESS_BYTES = 3911
CANARY_SUCCESS_SHA256 = "0973bbc5aeeb352c5d8f8aaf9461e3d9034326ba96a130edd0b4268306c56c8a"
V2_FAILURE = "/mnt/Cursor/PuppetMaster/tests/r9g37/stream_canary_002_runtime_failure_receipt.json"
V2_FAILURE_BYTES = 4611
V2_FAILURE_SHA256 = "d9afde841d23056704c16f8dbcbaca433f55a83aa6fe5e7117deaee817d3100a"
V3_FAILURE = "/mnt/Cursor/PuppetMaster/tests/r9g37/stream_canary_003_runtime_failure_receipt.json"
V3_FAILURE_BYTES = 5508
V3_FAILURE_SHA256 = "36461ccad95813df4a46432fc8b5eebe147766e3b0a0c10361ccc48e54b9b6b4"
PRIOR_MATRIX = "/mnt/Cursor/PuppetMaster/tests/r9g37/stream_matrix_001_success_receipt_v4.json"
PARENT_GOAL_THREAD_ID = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
ROOT = "/mnt/Cursor/PuppetMaster/tests/r9g37"
SOURCE_MATRIX_ID = "codex-native-goal-bite-matrix-006"
ROUTES = {"slot-alpha": "alpha", "slot-bravo": "bravo", "slot-charlie": "charlie"}
CONFIGS = {
    "--emit-canary": {"goal_run_token": "c004", "id": "r9g37-v4-canary-004", "kind": "canary", "matrix_ordinal": 0, "output": ROOT + "/stream_canary_004_plan.json", "root": ROOT + "/run-stream-canary-004", "source_indices": [0, 97, 194], "streak": 0},
    "--emit-matrix1": {"goal_run_token": "m001", "id": "r9g37-v4-matrix-001", "kind": "matrix", "matrix_ordinal": 1, "output": ROOT + "/stream_matrix_001_plan_v4.json", "root": ROOT + "/run-stream-v4-matrix-001", "source_indices": list(range(291)), "streak": 0},
    "--emit-matrix2": {"goal_run_token": "m002", "id": "r9g37-v4-matrix-002", "kind": "matrix", "matrix_ordinal": 2, "output": ROOT + "/stream_matrix_002_plan_v4.json", "root": ROOT + "/run-stream-v4-matrix-002", "source_indices": list(range(291)), "streak": 1},
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


def read_exact(path, mode, size=None, digest=None, cap=None):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode) and stat.S_IMODE(before.st_mode) == mode and before.st_uid == os.getuid() and before.st_nlink == 1, "custody:" + path)
    require(size is None or before.st_size == size, "size:" + path)
    require(cap is None or before.st_size <= cap, "cap:" + path)
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
    raw = read_exact(path, mode, cap=2000000)
    return {"bytes": len(raw), "mode": format(mode, "04o"), "path": path, "sha256": sha(raw)}


def publish(path, raw):
    require(not os.path.lexists(path), "output-exists")
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW | os.O_CLOEXEC, 0o444)
    try:
        os.fchmod(fd, 0o444)
        view = memoryview(raw)
        while view:
            count = os.write(fd, view)
            require(count > 0, "write")
            view = view[count:]
        os.fsync(fd)
    finally:
        os.close(fd)
    parent = os.open(os.path.dirname(path), os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        os.fsync(parent)
    finally:
        os.close(parent)
    require(read_exact(path, 0o444, len(raw), sha(raw)) == raw, "publish")


def load_source():
    raw = read_exact(SOURCE_MANIFEST, 0o644, SOURCE_MANIFEST_BYTES, SOURCE_MANIFEST_SHA256)
    manifest = parse(raw)
    require(raw == canonical(manifest) and manifest["schema_id"] == "pw-r9-codex-native-goal-bite-matrix-pair-inputs-v3", "manifest")
    matrices = [item for item in manifest["matrices"] if item["matrix_id"] == SOURCE_MATRIX_ID]
    require(len(matrices) == 1 and matrices[0]["row_count"] == 291 and len(matrices[0]["rows"]) == 291, "matrix")
    return matrices[0]


def row_from_entry(config, entry):
    path = SOURCE_ROOT + "/" + entry["row_file"]["path"]
    raw = read_exact(path, 0o644, entry["row_file"]["bytes"], entry["row_file"]["sha256"], cap=100000)
    source = parse(raw)
    require(raw == canonical(source) and source["schema_id"] == "pw-r9-codex-native-goal-bite-matrix-row-v3" and source["run_id"] == SOURCE_MATRIX_ID, "source")
    index = entry["index"]
    require(source["index"] == index and source["row_id"] == entry["row_id"] and source["cell"] == entry["cell"] and source["model_requested"] == entry["model_requested"] and source["reasoning_effort_requested"] == entry["reasoning_effort_requested"] and source["route"] == entry["route"], "entry")
    route = ROUTES[source["route"]]
    nonce = sha(("r9g37|" + config["id"] + "|" + source["row_id"] + "|" + source["subject"]["sha256"] + "|once").encode("utf-8"))
    task_name = "r9_gds4_" + nonce
    objective = "R9G37V4|" + config["goal_run_token"] + "|" + source["row_id"] + "|" + source["subject"]["sha256"]
    require(1 <= len(objective.encode("utf-8")) <= 128, "objective")
    return {
        "agent_role": "default",
        "cell": source["cell"],
        "cell_index": source["cell_index"],
        "chunk_count": source["subject"]["chunk_count"],
        "expected_result": {"bytes": source["expected_output_bytes"], "sha256": source["expected_output_sha256"]},
        "goal_objective": objective,
        "index": index,
        "model": source["model_requested"],
        "reasoning_effort": source["reasoning_effort_requested"],
        "route": route,
        "row_id": source["row_id"],
        "source_row": {"bytes": len(raw), "mode": "0644", "path": path, "sha256": sha(raw)},
        "subject": {"bytes": source["subject"]["bytes"], "sha256": source["subject"]["sha256"]},
        "task_name": task_name,
        "task_path": "/root/" + task_name,
    }


def build(config):
    require(not os.path.lexists(config["output"]) and not os.path.lexists(config["root"]), "target-exists")
    matrix = load_source()
    entries = {item["index"]: item for item in matrix["rows"]}
    require(set(entries) == set(range(291)), "source-indices")
    rows = [row_from_entry(config, entries[index]) for index in config["source_indices"]]
    prior = None if config["matrix_ordinal"] < 2 else binding(PRIOR_MATRIX)
    plan = {
        "authority": {"empirical_launch": False, "matrix_launch": False, "qualification": False, "qualification_credit": 0},
        "bindings": {
            "attestor": binding(ATTESTOR),
            "builder": binding(SELF),
            "canary_006_success": binding(CANARY_SUCCESS),
            "offline_verifier": binding(VERIFIER),
            "preflight": binding(PREFLIGHT),
            "runtime": binding(RUNTIME),
            "skill": binding(SKILL),
            "source_manifest": binding(SOURCE_MANIFEST),
            "v2_failure": binding(V2_FAILURE),
            "v3_failure": binding(V3_FAILURE),
        },
        "experiment": {"id": config["id"], "kind": config["kind"], "matrix_ordinal": config["matrix_ordinal"], "max_in_flight": 3, "parent_goal_thread_id": PARENT_GOAL_THREAD_ID, "root": config["root"], "row_count": len(rows), "socket_name": "goal_chunks.sock", "source_matrix_id": SOURCE_MATRIX_ID, "stop_at_first_nonpass": True},
        "failure_contract": {"best_of": 0, "relaunch": 0, "replacement": 0, "resend": 0, "retry": 0, "reuse": 0},
        "prior_clean_matrix": prior,
        "qualification": {"clean_full_matrix_streak_before": config["streak"], "credit": "0/2", "required_consecutive_clean_full_matrices": 2},
        "rows": rows,
        "schema_id": "pw-r9-codex-native-goal-db-stream-v4-plan-v1",
        "status": "FROZEN_GOAL_FIRST_STREAMED_SUBJECT_ZERO_CREDIT",
    }
    raw = canonical(plan)
    require(len(raw) <= 1000000, "plan-size")
    return raw


def main(argv):
    require(len(argv) == 2 and argv[1] in set(CONFIGS) | {"--check"}, "argv")
    load_source()
    for path, size, digest in ((SOURCE_MANIFEST, SOURCE_MANIFEST_BYTES, SOURCE_MANIFEST_SHA256), (CANARY_SUCCESS, CANARY_SUCCESS_BYTES, CANARY_SUCCESS_SHA256), (V2_FAILURE, V2_FAILURE_BYTES, V2_FAILURE_SHA256), (V3_FAILURE, V3_FAILURE_BYTES, V3_FAILURE_SHA256)):
        read_exact(path, 0o644, size, digest)
    for path in (SELF, RUNTIME, VERIFIER, PREFLIGHT, ATTESTOR):
        binding(path)
    read_exact(SKILL, 0o644, SKILL_BYTES, SKILL_SHA256)
    if argv[1] == "--check":
        matrix = load_source()
        entries = {item["index"]: item for item in matrix["rows"]}
        probe = dict(CONFIGS["--emit-matrix1"])
        rows = [row_from_entry(probe, entries[index]) for index in range(291)]
        require(len(rows) == 291 and max(len(row["goal_objective"].encode("utf-8")) for row in rows) <= 128 and {row["agent_role"] for row in rows} == {"default"}, "exhaustive-rows")
        raw = canonical({"first_mismatch": None, "qualification_credit": 0, "row_count": len(rows), "status": "PASS_DATA_ONLY_ZERO_WRITES"})
    else:
        raw = build(CONFIGS[argv[1]])
    sys.stdout.buffer.write(raw); sys.stdout.buffer.flush()
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv))
    except (Invalid, OSError, UnicodeError, ValueError, KeyError, TypeError, json.JSONDecodeError) as error:
        sys.stdout.buffer.write(canonical({"first_mismatch": str(error), "qualification_credit": 0, "status": "FAIL"})); sys.stdout.buffer.flush()
        raise SystemExit(1)
