#!/usr/bin/env python3
import hashlib
import json
import os
import re
import stat
import sys


BASE = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1"
MANIFEST_PATH = BASE + "/codex_native_goal_tool_event_atomic_matrix_pair_007_008_inputs_v1/manifest.json"
MANIFEST_BYTES = 7445
MANIFEST_SHA256 = "41dac10192008071d79ef22163609901deee18814d065a5a1ddda38f9b3a1a22"
RUNS = BASE + "/codex_native_goal_tool_event_atomic_matrix_runs_v1"
MATRICES = {
    "007": "codex-native-goal-tool-event-matrix-007",
    "008": "codex-native-goal-tool-event-matrix-008",
}
ROUTES = {
    "a": ("slot-alpha", "gpt-5.4-mini", "xhigh"),
    "b": ("slot-bravo", "gpt-5.4-mini", "medium"),
    "c": ("slot-charlie", "gpt-5.6-luna", "medium"),
}
ADMISSION_FIELDS = {
    "attempt", "attempt_id", "case", "execution_nonce", "goal_objective",
    "initial_routing", "manifest", "matrix_code", "matrix_id", "model_requested",
    "reasoning_effort_requested", "result_contract", "route", "route_code",
    "schema_id", "source", "task_name", "wave_index",
}
SOURCE_FIELDS = {
    "atom_id", "cell", "cell_index", "path", "source_cell_file_sha256",
    "source_node_sha256",
}
CASE_FIELDS = {
    "body_bytes", "body_sha256", "bytes", "header_bytes", "header_sha256",
    "header_utf8", "sha256",
}


class Invalid(Exception):
    pass


def require(condition, mismatch):
    if not condition:
        raise Invalid(mismatch)


def _constant(value):
    raise Invalid("nonfinite-json:" + value)


def _pairs(items):
    result = {}
    for key, value in items:
        if key in result:
            raise Invalid("duplicate-key:" + key)
        result[key] = value
    return result


def parse(raw):
    return json.loads(raw.decode("utf-8"), object_pairs_hook=_pairs, parse_constant=_constant)


def canon(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def _meta(info):
    return (info.st_dev, info.st_ino, info.st_mode, info.st_uid, info.st_nlink, info.st_size, info.st_mtime_ns)


def read_bound(path, mode, cap, expected_bytes=None, expected_sha=None):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and stat.S_IMODE(before.st_mode) == mode, "read-custody")
    require(before.st_uid == os.getuid() and before.st_nlink == 1 and before.st_size <= cap, "read-identity")
    if expected_bytes is not None:
        require(before.st_size == expected_bytes, "read-bytes")
    flags = os.O_RDONLY | os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    fd = os.open(path, flags)
    try:
        require(_meta(os.fstat(fd)) == _meta(before), "read-open-race")
        raw = b""
        while len(raw) < before.st_size:
            chunk = os.read(fd, before.st_size - len(raw))
            require(bool(chunk), "read-short")
            raw += chunk
        require(os.read(fd, 1) == b"", "read-trailing")
    finally:
        os.close(fd)
    require(_meta(os.lstat(path)) == _meta(before), "read-drift")
    if expected_sha is not None:
        require(sha(raw) == expected_sha, "read-sha256")
    return raw


def require_directory(path, mode):
    info = os.lstat(path)
    require(stat.S_ISDIR(info.st_mode) and stat.S_IMODE(info.st_mode) == mode, "directory-custody")
    require(info.st_uid == os.getuid() and info.st_nlink >= 2, "directory-identity")


def paths(matrix_code, wave_text, route_code):
    require(matrix_code in MATRICES and re.fullmatch(r"[0-9]{4}", wave_text) is not None and route_code in ROUTES, "address")
    wave = int(wave_text)
    require(0 <= wave < 5204 and wave_text == "{:04d}".format(wave), "wave")
    matrix_id = MATRICES[matrix_code]
    route = ROUTES[route_code][0]
    matrix_root = RUNS + "/" + matrix_id
    wave_root = matrix_root + "/rows/wave-" + wave_text
    row_root = wave_root + "/" + route
    require_directory(RUNS, 0o700)
    require_directory(matrix_root, 0o700)
    require_directory(matrix_root + "/rows", 0o700)
    require_directory(wave_root, 0o700)
    require_directory(row_root, 0o700)
    return matrix_id, route, wave, row_root


def validate_admission(matrix_code, wave_text, route_code):
    manifest_raw = read_bound(MANIFEST_PATH, 0o644, MANIFEST_BYTES, MANIFEST_BYTES, MANIFEST_SHA256)
    manifest = parse(manifest_raw)
    require(manifest_raw == canon(manifest) + b"\n" and manifest["schema_id"] == "pw-r9-codex-native-goal-tool-event-atomic-matrix-pair-inputs-v1", "manifest")
    matrix_id, route, wave, row_root = paths(matrix_code, wave_text, route_code)
    inventory = sorted(os.listdir(row_root))
    require(inventory in [["admission.json", "case.txt"], ["admission.json", "case.txt", "result.txt"]], "row-inventory")
    admission_raw = read_bound(row_root + "/admission.json", 0o444, 12_000)
    admission = parse(admission_raw)
    require(admission_raw == canon(admission) + b"\n" and set(admission) == ADMISSION_FIELDS, "admission-shape")
    require(admission["schema_id"] == "pw-r9-codex-native-goal-tool-event-atomic-row-admission-v1", "admission-schema")
    require(admission["matrix_code"] == matrix_code and admission["matrix_id"] == matrix_id and admission["wave_index"] == wave, "admission-matrix")
    require(admission["route_code"] == route_code and admission["route"] == route, "admission-route")
    require((admission["model_requested"], admission["reasoning_effort_requested"]) == ROUTES[route_code][1:], "admission-model")
    require(admission["manifest"] == {"bytes": MANIFEST_BYTES, "path": MANIFEST_PATH, "sha256": MANIFEST_SHA256}, "admission-manifest")
    require(admission["attempt"] == 0 and re.fullmatch(r"[0-9a-f]{24}", admission["attempt_id"]) is not None, "admission-attempt")
    source = admission["source"]
    require(isinstance(source, dict) and set(source) == SOURCE_FIELDS, "admission-source")
    require(isinstance(source["cell_index"], int) and 0 <= source["cell_index"] < 97, "admission-cell")
    require(re.fullmatch(r"cells/cell-[0-9]{3}/slot-(alpha|bravo|charlie)\.json#/nodes/[0-9]+", source["path"]) is not None, "admission-source-path")
    require(re.fullmatch(r"n[0-9]{5}", source["atom_id"]) is not None, "admission-atom")
    require(re.fullmatch(r"[0-9a-f]{64}", source["source_cell_file_sha256"]) is not None and re.fullmatch(r"[0-9a-f]{64}", source["source_node_sha256"]) is not None, "admission-source-hash")
    preimage = "\0".join([
        "pw-r9-tool-event-execution-v1",
        matrix_id,
        source["source_cell_file_sha256"],
        source["atom_id"],
        source["source_node_sha256"],
        str(wave),
    ]).encode("utf-8")
    execution_nonce = sha(preimage)
    attempt_id = sha(b"pw-r9-tool-event-attempt-v1\0" + execution_nonce.encode("ascii"))[:24]
    objective = "R9 atom;run={};w={:04d};r={};x={};no-retry.".format(matrix_id, wave, route_code, execution_nonce)
    require(admission["execution_nonce"] == execution_nonce and admission["attempt_id"] == attempt_id, "admission-execution")
    require(admission["task_name"] == "r9_cg_" + execution_nonce and admission["goal_objective"] == objective and len(objective.encode("utf-8")) <= 256, "admission-task")
    initial = admission["initial_routing"]
    require(isinstance(initial, dict) and set(initial) == {"bytes", "sha256", "utf8"}, "initial-shape")
    initial_raw = initial["utf8"].encode("utf-8")
    require(initial["bytes"] == len(initial_raw) <= 512 and initial["sha256"] == sha(initial_raw), "initial-identity")
    case_info = admission["case"]
    require(isinstance(case_info, dict) and set(case_info) == CASE_FIELDS, "case-info-shape")
    header_raw = case_info["header_utf8"].encode("utf-8")
    require(case_info["header_bytes"] == len(header_raw) <= 256 and case_info["header_sha256"] == sha(header_raw), "case-header")
    case_raw = read_bound(row_root + "/case.txt", 0o444, 768, case_info["bytes"], case_info["sha256"])
    require(b"\r" not in case_raw and case_raw.endswith(b"\n") and case_raw.count(b"\n") == 2, "case-framing")
    header, body, terminal = case_raw.split(b"\n")
    require(terminal == b"" and header == header_raw, "case-header-bind")
    require(case_info["body_bytes"] == len(body) <= 490 and case_info["body_sha256"] == sha(body), "case-body")
    contract = admission["result_contract"]
    require(isinstance(contract, dict) and contract.get("kind") in {"regex", "exact_set"}, "result-contract")
    if contract["kind"] == "regex":
        require(set(contract) == {"kind", "max_bytes", "min_bytes", "pattern"}, "result-regex-shape")
        require(contract["pattern"] == "[A-Za-z0-9._:-]+" and 1 <= contract["min_bytes"] <= contract["max_bytes"] <= 48, "result-regex")
    else:
        require(set(contract) == {"kind", "max_bytes", "values"} and isinstance(contract["values"], list), "result-set-shape")
        require(1 <= len(contract["values"]) <= 3 and len(contract["values"]) == len(set(contract["values"])), "result-set-cardinality")
        for value in contract["values"]:
            require(isinstance(value, str) and 1 <= len(value.encode("utf-8")) <= contract["max_bytes"] <= 128, "result-set-value")
            require("\n" not in value and "\r" not in value and "'" not in value, "result-set-safe-argv")
    return row_root, admission, case_raw


def validate_result(raw, contract):
    require(b"\n" not in raw and b"\r" not in raw and 1 <= len(raw) <= contract["max_bytes"], "result-framing")
    text = raw.decode("utf-8")
    if contract["kind"] == "regex":
        require(len(raw) >= contract["min_bytes"] and re.fullmatch(contract["pattern"], text) is not None, "result-regex")
    else:
        require(text in contract["values"], "result-exact-set")


def publish(path, raw):
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    fd = os.open(path, flags, 0o444)
    try:
        os.fchmod(fd, 0o444)
        offset = 0
        while offset < len(raw):
            offset += os.write(fd, raw[offset:])
        os.fsync(fd)
        info = os.fstat(fd)
        require(stat.S_IMODE(info.st_mode) == 0o444 and info.st_uid == os.getuid() and info.st_nlink == 1 and info.st_size == len(raw), "publish")
    finally:
        os.close(fd)
    parent = os.open(os.path.dirname(path), os.O_RDONLY | os.O_DIRECTORY | os.O_CLOEXEC)
    try:
        os.fsync(parent)
    finally:
        os.close(parent)
    require(read_bound(path, 0o444, 129) == raw, "publish-reopen")


def main():
    try:
        require(os.getcwd() == "/mnt/Cursor/PuppetMaster/tests/r9g7", "cwd")
        require(len(sys.argv) >= 5 and sys.argv[1] in {"show", "record"}, "cli")
        row_root, admission, case_raw = validate_admission(sys.argv[2], sys.argv[3], sys.argv[4])
        if sys.argv[1] == "show":
            require(len(sys.argv) == 5 and "result.txt" not in os.listdir(row_root), "show-state")
            return 0 if os.write(1, case_raw) == len(case_raw) else 1
        require(len(sys.argv) == 6 and "result.txt" not in os.listdir(row_root), "record-state")
        result = sys.argv[5].encode("utf-8")
        validate_result(result, admission["result_contract"])
        publish(row_root + "/result.txt", result + b"\n")
        return 0 if os.write(1, b"DONE") == 4 else 1
    except (Invalid, OSError, KeyError, TypeError, ValueError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        sys.stderr.write("FAIL:" + str(exc) + "\n")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
