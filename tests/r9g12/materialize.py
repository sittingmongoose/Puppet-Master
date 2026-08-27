#!/usr/bin/env python3
import fcntl
import hashlib
import json
import os
import re
import stat
import sys


HERE = "/mnt/Cursor/PuppetMaster/tests/r9g12"
RECIPE_PATH = HERE + "/closed_recipe.json"
RECIPE_BYTES = 7860
RECIPE_SHA256 = "85328ffd1c599aca2ee5c28eb222daf74ac99fd6540d63874e417020a8692498"
SELF_PATH = HERE + "/materialize.py"
VERIFIER_PATH = HERE + "/verify.py"
SESSION_PREFIX = "/home/sittingmongoose/.codex/sessions/"
ROUTE_ORDER = ("slot-alpha", "slot-bravo", "slot-charlie")
ROUTE_CODES = {"slot-alpha": "a", "slot-bravo": "b", "slot-charlie": "c"}
UUID_RE = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")
TOKEN_RE = re.compile(r"[A-Za-z0-9._:-]+")


class Invalid(Exception):
    pass


def require(condition, mismatch):
    if not condition:
        raise Invalid(mismatch)


def _constant(value):
    raise Invalid("nonfinite-json:" + value)


def _pairs(items):
    output = {}
    for key, value in items:
        if key in output:
            raise Invalid("duplicate-key:" + key)
        output[key] = value
    return output


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
    require(stat.S_ISREG(before.st_mode), "read-not-regular:" + path)
    require(stat.S_IMODE(before.st_mode) == mode, "read-mode:" + path)
    require(before.st_uid == os.getuid() and before.st_nlink == 1, "read-custody:" + path)
    require(before.st_size <= cap, "read-cap:" + path)
    if expected_bytes is not None:
        require(before.st_size == expected_bytes, "read-bytes:" + path)
    flags = os.O_RDONLY | os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    fd = os.open(path, flags)
    try:
        require(_meta(os.fstat(fd)) == _meta(before), "read-open-race:" + path)
        chunks = []
        remaining = before.st_size
        while remaining:
            chunk = os.read(fd, min(remaining, 1 << 20))
            require(bool(chunk), "read-short:" + path)
            chunks.append(chunk)
            remaining -= len(chunk)
        require(os.read(fd, 1) == b"", "read-trailing:" + path)
    finally:
        os.close(fd)
    raw = b"".join(chunks)
    require(_meta(os.lstat(path)) == _meta(before), "read-drift:" + path)
    if expected_sha is not None:
        require(sha(raw) == expected_sha, "read-sha256:" + path)
    return raw


def require_directory(path, mode):
    info = os.lstat(path)
    require(stat.S_ISDIR(info.st_mode) and not stat.S_ISLNK(info.st_mode), "directory-kind:" + path)
    require(stat.S_IMODE(info.st_mode) == mode and info.st_uid == os.getuid(), "directory-custody:" + path)
    return info


def fsync_directory(path):
    flags = os.O_RDONLY | os.O_DIRECTORY | os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    fd = os.open(path, flags)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def make_directory(path, parent):
    os.mkdir(path, 0o700)
    os.chmod(path, 0o700)
    require_directory(path, 0o700)
    fsync_directory(parent)


def publish(path, raw, mode=0o444):
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    fd = os.open(path, flags, mode)
    try:
        os.fchmod(fd, mode)
        offset = 0
        while offset < len(raw):
            written = os.write(fd, raw[offset:])
            require(written > 0, "publish-short:" + path)
            offset += written
        os.fsync(fd)
        info = os.fstat(fd)
        require(stat.S_ISREG(info.st_mode) and stat.S_IMODE(info.st_mode) == mode, "publish-mode:" + path)
        require(info.st_uid == os.getuid() and info.st_nlink == 1 and info.st_size == len(raw), "publish-custody:" + path)
    finally:
        os.close(fd)
    fsync_directory(os.path.dirname(path))
    require(read_bound(path, mode, len(raw), len(raw), sha(raw)) == raw, "publish-reopen:" + path)


def identity(path, cap=250000):
    raw = read_bound(path, 0o644, cap)
    return {"bytes": len(raw), "path": path, "sha256": sha(raw)}


def load_recipe():
    raw = read_bound(RECIPE_PATH, 0o644, RECIPE_BYTES, RECIPE_BYTES, RECIPE_SHA256)
    recipe = parse(raw)
    require(raw == canon(recipe) + b"\n", "recipe-canonical")
    require(recipe.get("schema_id") == "pw-r9-codex-native-goal-jit-post-goal-delivery-closed-recipe-v1", "recipe-schema")
    require(recipe.get("status") == "IMPLEMENTATION_RECIPE_ONLY_ZERO_CREDIT_NO_EMPIRICAL_AUTHORITY", "recipe-status")
    require(recipe.get("commands") == ["check", "begin", "prepare", "show", "record-active", "record-result", "record-terminal", "seal"], "recipe-commands")
    require(recipe.get("qualification") == {
        "canary_credit": 0,
        "clean_full_matrix_streak": 0,
        "credit": "0/2",
        "required_consecutive_clean_full_matrices": 2,
        "sequence": ["C01", "011", "012"],
    }, "recipe-qualification")
    for key in ("architecture", "implementation_admission", "public_plan", "v4_failure"):
        binding = recipe["bindings"][key]
        raw_bound = read_bound(binding["path"], int(binding["mode"], 8), binding["bytes"], binding["bytes"], binding["sha256"])
        if key != "public_plan":
            value = parse(raw_bound)
            require(raw_bound == canon(value) + b"\n", "binding-canonical:" + key)
    public_binding = recipe["bindings"]["public_plan"]
    public_raw = read_bound(public_binding["path"], 0o644, public_binding["bytes"], public_binding["bytes"], public_binding["sha256"])
    public = parse(public_raw)
    require(public_raw == canon(public) + b"\n", "public-canonical")
    require(public.get("schema_id") == "pw-r9-codex-native-goal-atomic-public-manifest-v1" and len(public.get("cells", [])) == 291, "public-shape")
    return recipe, public


def matrix_spec(recipe, matrix_code):
    require(matrix_code in recipe["matrices"], "matrix-code")
    return recipe["matrices"][matrix_code]


def static_payload(node):
    payload = parse(node["subject_payload"]["utf8"].encode("utf-8"))
    require(payload.get("op") == "label" and isinstance(payload.get("x"), str), "static-payload")
    if node["kind"] == "EVIDENCE_SLICE_LABEL":
        require(set(payload) == {"op", "t", "x"} and isinstance(payload["t"], str), "static-evidence")
    else:
        require(node["kind"] == "ENDPOINT_SLICE_LABEL", "static-kind")
        require(set(payload) in ({"d", "k", "op", "x"}, {"i", "k", "op", "x"}), "static-endpoint")
    return payload


def replace_template(value, results):
    mapping = {
        "${LEFT_RESULT}": results[0] if len(results) == 2 else None,
        "${RIGHT_RESULT}": results[1] if len(results) == 2 else None,
        "${SUMMARY_RESULT}": results[0] if len(results) == 1 else None,
    }
    if isinstance(value, str) and value in mapping:
        require(mapping[value] is not None, "template-placeholder")
        return mapping[value]
    if isinstance(value, list):
        return [replace_template(item, results) for item in value]
    if isinstance(value, dict):
        return {key: replace_template(item, results) for key, item in value.items()}
    return value


def result_contract(node, cell):
    validation = node["result_validation"]
    if "regex" in validation:
        require(validation["regex"] == "[A-Za-z0-9._:-]+", "result-regex")
        require(1 <= validation["utf8_bytes_min"] <= validation["utf8_bytes_max"] <= 48, "result-regex-range")
        if not node["dynamic"]:
            payload = static_payload(node)
            raw = payload["x"].encode("utf-8")
            if validation["utf8_bytes_min"] <= len(raw) <= validation["utf8_bytes_max"] and TOKEN_RE.fullmatch(payload["x"]) and "'" not in payload["x"]:
                return {"kind": "exact_set", "max_bytes": validation["utf8_bytes_max"], "token_mode": "DIRECT", "values": [payload["x"]]}
        return {
            "kind": "regex",
            "max_bytes": validation["utf8_bytes_max"],
            "min_bytes": validation["utf8_bytes_min"],
            "pattern": validation["regex"],
            "token_mode": "DIRECT",
        }
    require(validation == {"closed_output_contract": True, "utf8_bytes_max": node["result_max_bytes"]}, "result-closed")
    assembly = cell["assembly_recipe"]
    if node["kind"] in {"FINAL_OPTION_SELECTOR", "FINAL_EDGE_VERDICT", "FINAL_TENSION_VERDICT"}:
        require(assembly["dynamic_node"] == node["atom_id"] and assembly["kind"] == "MODEL_FINAL_CANONICAL_ONE_FIELD_JSON", "result-assembly")
        values = [canon({assembly["output_key"]: value}).decode("utf-8") for value in assembly["allowed_values"]]
    elif node["kind"] == "FINAL_EDGE_VERDICT_PER_EDGE":
        values = ["S", "U"]
    else:
        require(node["kind"] == "FINAL_SPECIALIST_CODE", "result-kind")
        code = node["subject_template"]["canonical_json_template"]["c"]
        require(re.fullmatch(r"[PCK]", code) is not None, "result-specialist")
        values = ["S:" + code, "U:" + code]
    require(1 <= len(values) <= 3 and len(values) == len(set(values)), "result-value-count")
    require(all(1 <= len(value.encode("utf-8")) <= node["result_max_bytes"] for value in values), "result-value-size")
    return {"kind": "exact_set", "max_bytes": node["result_max_bytes"], "token_mode": "ALIAS", "values": values}


def execution_fields(matrix_code, matrix_id, wave, route_code, cell_sha, atom_id, node_sha):
    preimage = "\0".join([
        "pw-r9-jit-post-goal-delivery-execution-v1", matrix_id, cell_sha, atom_id, node_sha, str(wave), route_code,
    ]).encode("utf-8")
    nonce = sha(preimage)
    attempt_id = sha(b"pw-r9-jit-post-goal-delivery-attempt-v1\0" + nonce.encode("ascii"))[:24]
    objective = "CG|m={}|w={:04d}|r={}|x={}|once".format(matrix_code, wave, route_code, nonce)
    task_name = "r9_cg5_" + nonce
    return nonce, attempt_id, objective, task_name


def build_schedule(recipe, public, matrix_code):
    spec = matrix_spec(recipe, matrix_code)
    public_dir = os.path.dirname(recipe["bindings"]["public_plan"]["path"])
    roster = {item["route"]: item for item in recipe["roster"]}
    entries = {route: [] for route in ROUTE_ORDER}
    for entry in public["cells"]:
        require(entry["route"] in entries, "schedule-route")
        entries[entry["route"]].append(entry)
    by_route = {route: [] for route in ROUTE_ORDER}
    for route in ROUTE_ORDER:
        row = roster[route]
        wave = 0
        ordered = sorted(entries[route], key=lambda value: value["cell_index"])
        require([value["cell_index"] for value in ordered] == list(range(97)), "schedule-cell-order")
        for entry in ordered:
            cell_file = entry["cell_file"]
            cell_raw = read_bound(public_dir + "/" + cell_file["path"], 0o644, 500000, cell_file["bytes"], cell_file["sha256"])
            cell = parse(cell_raw)
            require(cell_raw == canon(cell) + b"\n", "schedule-cell-canonical")
            require(cell["route"] == route and cell["cell_index"] == entry["cell_index"], "schedule-cell-bind")
            require(cell["model_requested"] == row["model"] and cell["reasoning_effort_requested"] == row["reasoning_effort"], "schedule-roster-bind")
            atom_waves = {}
            for node_index, node in enumerate(cell["nodes"]):
                require(node["atom_id"] == "n{:05d}".format(node_index), "schedule-node-order")
                dependencies = []
                for dependency in node["dependencies"]:
                    require(dependency in atom_waves, "schedule-dependency-order")
                    dependencies.append(atom_waves[dependency])
                if not node["dynamic"]:
                    static_payload(node)
                node_sha = sha(canon(node))
                nonce, attempt_id, objective, task_name = execution_fields(
                    matrix_code, spec["matrix_id"], wave, row["route_code"], cell_file["sha256"], node["atom_id"], node_sha,
                )
                by_route[route].append({
                    "atom_id": node["atom_id"],
                    "attempt": 0,
                    "attempt_id": attempt_id,
                    "cell": cell["cell"],
                    "cell_index": cell["cell_index"],
                    "dependency_waves": dependencies,
                    "execution_nonce": nonce,
                    "goal_objective": objective,
                    "matrix_code": matrix_code,
                    "matrix_id": spec["matrix_id"],
                    "model_requested": row["model"],
                    "node_index": node_index,
                    "reasoning_effort_requested": row["reasoning_effort"],
                    "route": route,
                    "route_code": row["route_code"],
                    "schema_id": "pw-r9-codex-native-goal-jit-post-goal-delivery-schedule-row-v1",
                    "source_cell_file_bytes": cell_file["bytes"],
                    "source_cell_file_sha256": cell_file["sha256"],
                    "source_cell_path": cell_file["path"],
                    "source_node_sha256": node_sha,
                    "task_name": task_name,
                    "wave_index": wave,
                })
                atom_waves[node["atom_id"]] = wave
                wave += 1
        require(wave == 5204, "schedule-route-count")
    records = []
    for wave in range(spec["wave_count"]):
        for route in ROUTE_ORDER:
            records.append(by_route[route][wave])
    require(len(records) == spec["subject_task_count"], "schedule-count")
    require(len({record["execution_nonce"] for record in records}) == len(records), "schedule-nonce-unique")
    require(len({record["attempt_id"] for record in records}) == len(records), "schedule-attempt-unique")
    return records


def schedule_bytes(records):
    lines = []
    offsets = []
    offset = 0
    for record in records:
        line = canon(record) + b"\n"
        lines.append(line)
        offsets.append([offset, len(line)])
        offset += len(line)
    raw = b"".join(lines)
    offsets_raw = canon({
        "count": len(records),
        "entries": offsets,
        "schedule_bytes": len(raw),
        "schedule_sha256": sha(raw),
        "schema_id": "pw-r9-codex-native-goal-jit-post-goal-delivery-schedule-offsets-v1",
    }) + b"\n"
    return raw, offsets_raw


def expected_schedule_record(recipe, public, matrix_code, wave, route):
    spec = matrix_spec(recipe, matrix_code)
    require(0 <= wave < spec["wave_count"] and route in ROUTE_ORDER, "expected-record-address")
    roster = {item["route"]: item for item in recipe["roster"]}
    row = roster[route]
    entries = sorted((entry for entry in public["cells"] if entry["route"] == route), key=lambda entry: entry["cell_index"])
    require([entry["cell_index"] for entry in entries] == list(range(97)), "expected-record-cell-order")
    relative = wave
    base_wave = 0
    selected = None
    for entry in entries:
        require(isinstance(entry["atom_count"], int) and entry["atom_count"] > 0, "expected-record-atom-count")
        if relative < entry["atom_count"]:
            selected = entry
            break
        relative -= entry["atom_count"]
        base_wave += entry["atom_count"]
    require(selected is not None, "expected-record-wave")
    cell_file = selected["cell_file"]
    public_dir = os.path.dirname(recipe["bindings"]["public_plan"]["path"])
    cell_raw = read_bound(public_dir + "/" + cell_file["path"], 0o644, 500000, cell_file["bytes"], cell_file["sha256"])
    cell = parse(cell_raw)
    require(cell_raw == canon(cell) + b"\n", "expected-record-cell-canonical")
    require(cell["route"] == route and cell["cell_index"] == selected["cell_index"] and len(cell["nodes"]) == selected["atom_count"], "expected-record-cell-bind")
    require(cell["model_requested"] == row["model"] and cell["reasoning_effort_requested"] == row["reasoning_effort"], "expected-record-roster")
    node = cell["nodes"][relative]
    require(node["atom_id"] == "n{:05d}".format(relative), "expected-record-node-order")
    atom_waves = {prior["atom_id"]: base_wave + index for index, prior in enumerate(cell["nodes"][:relative])}
    dependencies = []
    for dependency in node["dependencies"]:
        require(dependency in atom_waves, "expected-record-dependency")
        dependencies.append(atom_waves[dependency])
    node_sha = sha(canon(node))
    nonce, attempt_id, objective, task_name = execution_fields(
        matrix_code, spec["matrix_id"], wave, row["route_code"], cell_file["sha256"], node["atom_id"], node_sha,
    )
    record = {
        "atom_id": node["atom_id"], "attempt": 0, "attempt_id": attempt_id,
        "cell": cell["cell"], "cell_index": cell["cell_index"], "dependency_waves": dependencies,
        "execution_nonce": nonce, "goal_objective": objective, "matrix_code": matrix_code,
        "matrix_id": spec["matrix_id"], "model_requested": row["model"], "node_index": relative,
        "reasoning_effort_requested": row["reasoning_effort"], "route": route,
        "route_code": row["route_code"],
        "schema_id": "pw-r9-codex-native-goal-jit-post-goal-delivery-schedule-row-v1",
        "source_cell_file_bytes": cell_file["bytes"], "source_cell_file_sha256": cell_file["sha256"],
        "source_cell_path": cell_file["path"], "source_node_sha256": node_sha,
        "task_name": task_name, "wave_index": wave,
    }
    return record, cell, node


def read_run(run_root):
    raw = read_bound(run_root + "/run.json", 0o444, 20000)
    value = parse(raw)
    require(raw == canon(value) + b"\n", "run-canonical")
    require(set(value) == set(load_recipe()[0]["schemas"]["run_fields"]), "run-fields")
    require(value["schema_id"] == "pw-r9-codex-native-goal-jit-post-goal-delivery-run-v1", "run-schema")
    return value


def run_path(recipe, matrix_code):
    spec = matrix_spec(recipe, matrix_code)
    return recipe["evidence_contract"]["run_root"] + "/" + spec["matrix_id"]


def lock_run(recipe, matrix_code, exclusive=True):
    root = run_path(recipe, matrix_code)
    require_directory(root, 0o700)
    flags = os.O_RDWR | os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    fd = os.open(root + "/run.lock", flags)
    info = os.fstat(fd)
    require(stat.S_ISREG(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o600 and info.st_uid == os.getuid() and info.st_nlink == 1, "run-lock-custody")
    try:
        fcntl.flock(fd, (fcntl.LOCK_EX if exclusive else fcntl.LOCK_SH) | fcntl.LOCK_NB)
    except BlockingIOError:
        os.close(fd)
        raise Invalid("run-busy")
    run = read_run(root)
    require(run["matrix_code"] == matrix_code and run["matrix_id"] == matrix_spec(recipe, matrix_code)["matrix_id"], "run-bind")
    return root, run, fd


def read_schedule_record(run_root, run, wave, route_index):
    offsets_raw = read_bound(run_root + "/schedule_offsets.json", 0o444, run["schedule_offsets"]["bytes"], run["schedule_offsets"]["bytes"], run["schedule_offsets"]["sha256"])
    offsets = parse(offsets_raw)
    require(offsets_raw == canon(offsets) + b"\n" and offsets["count"] == run["subject_task_count"], "schedule-offsets")
    require(offsets.get("schema_id") == "pw-r9-codex-native-goal-jit-post-goal-delivery-schedule-offsets-v1", "schedule-offsets-schema")
    require(offsets.get("schedule_bytes") == run["schedule"]["bytes"] and offsets.get("schedule_sha256") == run["schedule"]["sha256"], "schedule-offsets-bind")
    require(isinstance(offsets.get("entries"), list) and len(offsets["entries"]) == run["subject_task_count"], "schedule-offsets-count")
    index = wave * 3 + route_index
    offset, length = offsets["entries"][index]
    require(isinstance(offset, int) and isinstance(length, int) and 0 <= offset < run["schedule"]["bytes"] and 0 < length <= 4096 and offset + length <= run["schedule"]["bytes"], "schedule-record-range")
    schedule_path = run_root + "/schedule.jsonl"
    before = os.lstat(schedule_path)
    require(stat.S_ISREG(before.st_mode) and stat.S_IMODE(before.st_mode) == 0o444, "schedule-file-mode")
    require(before.st_uid == os.getuid() and before.st_nlink == 1 and before.st_size == run["schedule"]["bytes"], "schedule-file-custody")
    flags = os.O_RDONLY | os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    fd = os.open(schedule_path, flags)
    try:
        require(_meta(os.fstat(fd)) == _meta(before), "schedule-file-open-race")
        raw = os.pread(fd, length, offset)
    finally:
        os.close(fd)
    require(_meta(os.lstat(schedule_path)) == _meta(before), "schedule-file-drift")
    require(len(raw) == length and raw.endswith(b"\n"), "schedule-record-read")
    record = parse(raw[:-1])
    require(raw == canon(record) + b"\n" and record["wave_index"] == wave, "schedule-record")
    return record


def row_path(run_root, wave, route):
    return run_root + "/rows/wave-{:04d}/{}".format(wave, route)


def read_admission(row_root, recipe):
    raw = read_bound(row_root + "/admission.json", 0o444, 20000)
    value = parse(raw)
    require(raw == canon(value) + b"\n", "admission-canonical")
    require(set(value) == set(recipe["schemas"]["admission_fields"]), "admission-fields")
    require(value["schema_id"] == "pw-r9-codex-native-goal-jit-post-goal-delivery-admission-v1", "admission-schema")
    return value


def read_active(row_root, recipe, admission):
    raw = read_bound(row_root + "/active.json", 0o444, 10000)
    value = parse(raw)
    require(raw == canon(value) + b"\n" and set(value) == set(recipe["schemas"]["active_fields"]), "active-canonical")
    require(value["schema_id"] == "pw-r9-codex-native-goal-jit-post-goal-delivery-active-v1" and value["status"] == "ACTIVE_ATTESTED_ZERO_CREDIT", "active-status")
    require(value["qualification_credit"] == 0 and value["goal_objective"] == admission["goal_objective"], "active-objective")
    require(value["matrix_id"] == admission["matrix_id"] and value["wave_index"] == admission["wave_index"], "active-address")
    require(all(isinstance(value[key], str) and UUID_RE.fullmatch(value[key]) for key in ("goal_thread_id", "turn_id")), "active-identities")
    require(value["task_path"] == "/root/" + admission["task_name"], "active-task-path")
    trace_raw = read_bound(row_root + "/activation_trace.jsonl", 0o444, 2000000)
    require(value["activation_trace"] == {"bytes": len(trace_raw), "sha256": sha(trace_raw)}, "active-trace-bind")
    return value


def source_node(recipe, record):
    public_dir = os.path.dirname(recipe["bindings"]["public_plan"]["path"])
    raw = read_bound(public_dir + "/" + record["source_cell_path"], 0o644, 500000, record["source_cell_file_bytes"], record["source_cell_file_sha256"])
    cell = parse(raw)
    require(raw == canon(cell) + b"\n", "source-cell-canonical")
    require(cell["cell_index"] == record["cell_index"] and cell["route"] == record["route"], "source-cell-bind")
    node = cell["nodes"][record["node_index"]]
    require(node["atom_id"] == record["atom_id"] and sha(canon(node)) == record["source_node_sha256"], "source-node-bind")
    return cell, node


def validate_canonical_result(raw, contract):
    require(raw.endswith(b"\n") and raw.count(b"\n") == 1 and b"\r" not in raw, "result-framing")
    body = raw[:-1]
    require(1 <= len(body) <= contract["max_bytes"], "result-size")
    text = body.decode("utf-8")
    if contract["kind"] == "regex":
        require(contract["min_bytes"] <= len(body) and re.fullmatch(contract["pattern"], text) is not None, "result-regex")
    else:
        require(text in contract["values"], "result-exact-set")
    return text


def load_result(recipe, run_root, matrix_id, wave, route):
    root = row_path(run_root, wave, route)
    require(sorted(os.listdir(root)) == recipe["evidence_contract"]["row_inventories"]["terminal"], "dependency-row-state")
    admission = read_admission(root, recipe)
    require(admission["matrix_id"] == matrix_id and admission["wave_index"] == wave and admission["route"] == route, "dependency-admission")
    return validate_canonical_result(read_bound(root + "/result.txt", 0o444, 256), admission["result_contract"])


def derive_case(recipe, run_root, admission):
    record = {
        "atom_id": admission["source"]["atom_id"],
        "cell_index": admission["cell_index"],
        "node_index": admission["node_index"],
        "route": admission["route"],
        "source_cell_file_bytes": admission["source"]["cell_bytes"],
        "source_cell_file_sha256": admission["source"]["cell_sha256"],
        "source_cell_path": admission["source"]["cell_path"],
        "source_node_sha256": admission["source"]["node_sha256"],
    }
    cell, node = source_node(recipe, record)
    results = [load_result(recipe, run_root, admission["matrix_id"], wave, admission["route"]) for wave in admission["dependency_waves"]]
    if node["dynamic"]:
        payload = replace_template(node["subject_template"]["canonical_json_template"], results)
    else:
        require(not results, "static-dependencies")
        payload = static_payload(node)
    payload_raw = canon(payload)
    require(len(payload_raw) <= recipe["limits"]["subject_payload_utf8_bytes_max"], "subject-payload-limit")
    contract = result_contract(node, cell)
    require(contract == admission["result_contract"], "result-contract-drift")
    if contract["kind"] == "exact_set" and contract["token_mode"] == "ALIAS":
        if node["kind"] in {"FINAL_OPTION_SELECTOR", "FINAL_EDGE_VERDICT", "FINAL_TENSION_VERDICT"}:
            hint = "/".join(chr(65 + index) for index in range(len(contract["values"]))) + "=index(p.o)"
        else:
            hint = ",".join("{}={}".format(chr(65 + index), value) for index, value in enumerate(contract["values"]))
    else:
        hint = "direct"
    case = {
        "c": node["acceptance_criterion"]["utf8"],
        "p": payload,
        "q": node["output_contract"]["utf8"],
        "r": "R|{}|TOKEN".format(admission["execution_nonce"]),
        "v": 1,
        "z": hint,
    }
    require(set(case) == set(recipe["messages"]["subject_case_fields"]), "case-fields")
    raw = canon(case) + b"\n"
    require(len(raw) <= recipe["limits"]["show_output_utf8_bytes_max"], "show-output-limit")
    return raw


def activation_tool_input(objective):
    return "const r=await tools.create_goal({objective:" + json.dumps(objective, ensure_ascii=False) + "});text(r)\n"


def subject_tool_input(matrix_code, wave, route_code, goal_thread_id):
    command = "python3 -B materialize.py show {} {:04d} {} {}".format(matrix_code, wave, route_code, goal_thread_id)
    return "const r=await tools.exec_command({cmd:" + json.dumps(command) + ",workdir:" + json.dumps(HERE) + ",login:false,yield_time_ms:10000,max_output_tokens:1000});text(r.output)\n"


def completion_tool_input():
    return 'text(await tools.update_goal({status:"complete"}))\n'


def activation_message(recipe, objective, nonce):
    text = recipe["messages"]["activation_template"].format(goal_objective_json=json.dumps(objective, ensure_ascii=False), execution_nonce=nonce)
    raw = text.encode("utf-8")
    require(len(raw) <= recipe["limits"]["activation_message_utf8_bytes_max"], "activation-message-limit")
    return raw


def subject_trigger(recipe, nonce, tool_input):
    text = recipe["messages"]["subject_trigger_template"].format(execution_nonce=nonce, subject_tool_input=tool_input.rstrip("\n"))
    raw = text.encode("utf-8")
    require(len(raw) <= recipe["limits"]["subject_trigger_utf8_bytes_max"], "subject-trigger-limit")
    return raw


def completion_message(recipe, nonce, goal_thread_id):
    text = recipe["messages"]["completion_template"].format(
        execution_nonce=nonce, goal_thread_id=goal_thread_id, completion_tool_input=completion_tool_input().rstrip("\n")
    )
    raw = text.encode("utf-8")
    require(len(raw) <= recipe["limits"]["completion_message_utf8_bytes_max"], "completion-message-limit")
    return raw


def event_items(events, outer_type, payload_type=None):
    output = []
    for index, event in enumerate(events):
        payload = event.get("payload")
        if event.get("type") == outer_type and isinstance(payload, dict) and (payload_type is None or payload.get("type") == payload_type):
            output.append((index, payload))
    return output


def item_turn(payload):
    return payload.get("internal_chat_message_metadata_passthrough", {}).get("turn_id") or payload.get("turn_id")


def decode_trace(raw):
    require(raw.endswith(b"\n") and b"\r" not in raw, "trace-framing")
    events = []
    for index, line in enumerate(raw.splitlines(keepends=True)):
        require(line.endswith(b"\n") and line != b"\n", "trace-line:" + str(index))
        events.append(parse(line[:-1]))
    require(bool(events), "trace-empty")
    return events


def wrapper_text(payload):
    output = payload.get("output")
    require(isinstance(output, list) and len(output) == 2, "wrapper-output-count")
    require(all(isinstance(item, dict) and set(item) == {"type", "text"} and item["type"] == "input_text" for item in output), "wrapper-output-shape")
    require(re.fullmatch(r"Script completed\nWall time [0-9]+(?:\.[0-9]+)? seconds\nOutput:\n", output[0]["text"]) is not None, "wrapper-output-prefix")
    return output[1]["text"]


def validate_trace(raw, admission, phase, prior_raw=None, case_raw=None, active_value=None):
    require(phase in {"active", "result", "terminal"}, "trace-phase")
    if phase == "active":
        require(prior_raw is None, "trace-active-prior")
    else:
        require(prior_raw is not None, "trace-prior-required")
        require(len(raw) > len(prior_raw) and raw.startswith(prior_raw), "trace-prefix")
    events = decode_trace(raw)
    require(events[-1].get("type") == "event_msg" and events[-1].get("payload", {}).get("type") == "task_complete", "trace-not-closed")
    sessions = event_items(events, "session_meta")
    require(len(sessions) == 1 and sessions[0][0] == 0, "trace-session")
    session = sessions[0][1]
    thread_id = session.get("id")
    require(isinstance(thread_id, str) and UUID_RE.fullmatch(thread_id), "trace-thread-id")
    expected_task_path = "/root/" + admission["task_name"]
    spawn = session.get("source", {}).get("subagent", {}).get("thread_spawn", {})
    recipe, _ = load_recipe()
    require(session.get("parent_thread_id") == recipe["evidence_contract"]["parent_thread_id"], "trace-parent")
    require(session.get("agent_path") == expected_task_path and spawn.get("agent_path") == expected_task_path, "trace-task-path")
    contexts = event_items(events, "turn_context")
    expected_turns = {"active": 1, "result": 2, "terminal": 3}[phase]
    require(len(contexts) == expected_turns, "trace-turn-count")
    turn_ids = [payload["turn_id"] for _, payload in contexts]
    require(len(set(turn_ids)) == expected_turns, "trace-turn-unique")
    require(all(payload.get("model") == admission["model_requested"] and payload.get("effort") == admission["reasoning_effort_requested"] for _, payload in contexts), "trace-route")
    starts = event_items(events, "event_msg", "task_started")
    completes = event_items(events, "event_msg", "task_complete")
    require([payload.get("turn_id") for _, payload in starts] == turn_ids, "trace-starts")
    require([payload.get("turn_id") for _, payload in completes] == turn_ids, "trace-completes")
    direct_calls = event_items(events, "response_item", "function_call")
    direct_outputs = event_items(events, "response_item", "function_call_output")
    require(not direct_calls and not direct_outputs, "trace-direct-tool")
    calls = event_items(events, "response_item", "custom_tool_call")
    outputs = event_items(events, "response_item", "custom_tool_call_output")
    require(len(calls) == expected_turns and len(outputs) == expected_turns, "trace-tool-count")
    require(all(set(payload) == {"call_id", "id", "input", "internal_chat_message_metadata_passthrough", "name", "status", "type"} for _, payload in calls), "trace-tool-call-shape")
    require(all(set(payload) == {"call_id", "id", "internal_chat_message_metadata_passthrough", "output", "type"} for _, payload in outputs), "trace-tool-output-shape")
    require(all(payload.get("name") == "exec" and payload.get("status", "completed") == "completed" for _, payload in calls), "trace-tool-name")
    expected_inputs = [admission["activation_tool_input"]]
    if expected_turns >= 2:
        require(active_value is not None, "trace-active-input")
        expected_inputs.append(subject_tool_input(admission["matrix_code"], admission["wave_index"], admission["route_code"], active_value["goal_thread_id"]))
    if expected_turns == 3:
        expected_inputs.append(completion_tool_input())
    require([payload.get("input") for _, payload in calls] == expected_inputs, "trace-tool-input")
    require([item_turn(payload) for _, payload in calls] == turn_ids, "trace-call-turn")
    by_call = {payload.get("call_id"): (index, payload) for index, payload in outputs}
    require(len(by_call) == expected_turns and set(by_call) == {payload.get("call_id") for _, payload in calls}, "trace-tool-output-bind")
    require([item_turn(by_call[payload["call_id"]][1]) for _, payload in calls] == turn_ids, "trace-output-turn")
    finals = []
    for index, payload in event_items(events, "response_item", "message"):
        if payload.get("role") == "assistant" and payload.get("phase") == "final_answer":
            content = payload.get("content")
            require(isinstance(content, list) and len(content) == 1 and content[0].get("type") == "output_text", "trace-final-shape")
            finals.append((index, item_turn(payload), content[0].get("text")))
    require(len(finals) == expected_turns and [item[1] for item in finals] == turn_ids, "trace-finals")
    assistant_messages = [(index, payload) for index, payload in event_items(events, "response_item", "message") if payload.get("role") == "assistant"]
    visible_messages = event_items(events, "event_msg", "agent_message")
    require(len(assistant_messages) == expected_turns and all(payload.get("phase") == "final_answer" for _, payload in assistant_messages), "trace-no-assistant-prose")
    require(len(visible_messages) == expected_turns and all(payload.get("phase") == "final_answer" for _, payload in visible_messages), "trace-no-visible-prose")
    for turn_index in range(expected_turns):
        call = calls[turn_index][1]
        output_index = by_call[call["call_id"]][0]
        require(starts[turn_index][0] < contexts[turn_index][0] < calls[turn_index][0] < output_index < finals[turn_index][0] < completes[turn_index][0], "trace-causal-order")
    for turn_index in range(1, expected_turns):
        require(completes[turn_index - 1][0] < starts[turn_index][0], "trace-cross-turn-order")
    create_text = wrapper_text(by_call[calls[0][1]["call_id"]][1])
    active_goal = parse(create_text.encode("utf-8")).get("goal")
    require(isinstance(active_goal, dict), "trace-active-goal")
    require(active_goal.get("threadId") == thread_id and active_goal.get("objective") == admission["goal_objective"] and active_goal.get("status") == "active", "trace-active-receipt")
    expected_a = "A|{}|{}|active".format(admission["execution_nonce"], thread_id)
    require(finals[0][2] == expected_a and completes[0][1].get("last_agent_message") == expected_a, "trace-active-final")
    result_token = None
    if expected_turns >= 2:
        require(case_raw is not None, "trace-case-input")
        show_text = wrapper_text(by_call[calls[1][1]["call_id"]][1])
        require(show_text.encode("utf-8") == case_raw, "trace-show-output")
        prefix = "R|{}|".format(admission["execution_nonce"])
        require(isinstance(finals[1][2], str) and finals[1][2].startswith(prefix), "trace-result-final-prefix")
        result_token = finals[1][2][len(prefix):]
        require(1 <= len(result_token.encode("utf-8")) <= 48 and TOKEN_RE.fullmatch(result_token), "trace-result-token")
        require(completes[1][1].get("last_agent_message") == finals[1][2], "trace-result-task-final")
    terminal_goal = None
    if expected_turns == 3:
        terminal_text = wrapper_text(by_call[calls[2][1]["call_id"]][1])
        terminal_goal = parse(terminal_text.encode("utf-8")).get("goal")
        require(isinstance(terminal_goal, dict), "trace-terminal-goal")
        require(terminal_goal.get("threadId") == thread_id and terminal_goal.get("objective") == admission["goal_objective"] and terminal_goal.get("status") == "complete", "trace-terminal-receipt")
        require(isinstance(terminal_goal.get("tokensUsed"), int) and terminal_goal["tokensUsed"] > 0, "trace-terminal-tokens")
        require(isinstance(terminal_goal.get("timeUsedSeconds"), int) and terminal_goal["timeUsedSeconds"] >= 0, "trace-terminal-time")
        expected_t = "T|{}|{}|complete".format(admission["execution_nonce"], thread_id)
        require(finals[2][2] == expected_t and completes[2][1].get("last_agent_message") == expected_t, "trace-terminal-final")
    return {
        "goal_thread_id": thread_id,
        "result_token": result_token,
        "task_path": expected_task_path,
        "terminal_goal": terminal_goal,
        "turn_ids": turn_ids,
    }


def read_source_trace(path):
    require(isinstance(path, str) and path.startswith(SESSION_PREFIX) and os.path.realpath(path) == path, "source-trace-path")
    return read_bound(path, 0o664, 2000000)


def launch_gate_path(matrix_code):
    base = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1"
    names = {
        "C01": "r9_codex_native_goal_jit_mailbox_canary_001_launch_admission_v1.json",
        "011": "r9_codex_native_goal_jit_mailbox_matrix_011_launch_admission_v1.json",
        "012": "r9_codex_native_goal_jit_mailbox_matrix_012_launch_admission_v1.json",
    }
    return base + "/" + names[matrix_code]


def require_launch_gate(recipe, matrix_code):
    path = launch_gate_path(matrix_code)
    raw = read_bound(path, 0o644, 20000)
    gate = parse(raw)
    require(raw == canon(gate) + b"\n", "launch-gate-canonical")
    contract = recipe["launch_gate_contract"]
    require(set(gate) == set(contract["fields"]), "launch-gate-fields")
    spec = matrix_spec(recipe, matrix_code)
    require(gate["matrix_code"] == matrix_code and gate["matrix_id"] == spec["matrix_id"] and gate["launch_authority"] is True, "launch-gate-bind")
    require(gate["schema_id"] == contract["schema_ids"][matrix_code], "launch-gate-schema")
    require(gate["qualification_credit"] == 0 and gate["status"] == contract["status"], "launch-gate-status")
    expected_components = {"materializer": identity(SELF_PATH), "recipe": identity(RECIPE_PATH), "verifier": identity(VERIFIER_PATH)}
    require(gate["components"] == expected_components, "launch-gate-components")
    predecessor = gate["predecessor"]
    require(isinstance(predecessor, dict) and set(predecessor) == set(contract["predecessor_fields"]), "launch-gate-predecessor-fields")
    require(predecessor["status"] == contract["predecessor_statuses"][matrix_code], "launch-gate-predecessor-status")
    base = os.path.dirname(path)
    require(os.path.dirname(predecessor["path"]) == base and os.path.realpath(predecessor["path"]) == predecessor["path"], "launch-gate-predecessor-path")
    predecessor_raw = read_bound(predecessor["path"], 0o644, 50000, predecessor["bytes"], predecessor["sha256"])
    predecessor_value = parse(predecessor_raw)
    require(predecessor_raw == canon(predecessor_value) + b"\n" and predecessor_value.get("status") == predecessor["status"], "launch-gate-predecessor-bind")
    return {"bytes": len(raw), "path": path, "sha256": sha(raw)}


def begin(matrix_code):
    recipe, public = load_recipe()
    spec = matrix_spec(recipe, matrix_code)
    launch_gate = require_launch_gate(recipe, matrix_code)
    records = build_schedule(recipe, public, matrix_code)
    schedule_raw, offsets_raw = schedule_bytes(records)
    base = recipe["evidence_contract"]["run_root"]
    if not os.path.lexists(base):
        parent = os.path.dirname(base)
        os.mkdir(base, 0o700)
        os.chmod(base, 0o700)
        require_directory(base, 0o700)
        fsync_directory(parent)
    else:
        require_directory(base, 0o700)
    root = base + "/" + spec["matrix_id"]
    require(not os.path.lexists(root), "begin-existing-root")
    make_directory(root, base)
    make_directory(root + "/rows", root)
    publish(root + "/run.lock", b"", 0o600)
    publish(root + "/schedule.jsonl", schedule_raw)
    publish(root + "/schedule_offsets.json", offsets_raw)
    run = {
        "matrix_code": matrix_code,
        "matrix_id": spec["matrix_id"],
        "launch_gate": launch_gate,
        "qualification_credit": 0,
        "recipe": identity(RECIPE_PATH),
        "schedule": {"bytes": len(schedule_raw), "records": len(records), "sha256": sha(schedule_raw)},
        "schedule_offsets": {"bytes": len(offsets_raw), "sha256": sha(offsets_raw)},
        "schema_id": "pw-r9-codex-native-goal-jit-post-goal-delivery-run-v1",
        "status": "OPEN_ZERO_CREDIT",
        "subject_task_count": spec["subject_task_count"],
        "wave_count": spec["wave_count"],
    }
    require(set(run) == set(recipe["schemas"]["run_fields"]), "begin-run-fields")
    publish(root + "/run.json", canon(run) + b"\n")
    sys.stdout.buffer.write(canon({"matrix_code": matrix_code, "matrix_id": spec["matrix_id"], "qualification_credit": 0, "status": "BEGUN"}) + b"\n")


def prepare(matrix_code, wave_text):
    recipe, public = load_recipe()
    spec = matrix_spec(recipe, matrix_code)
    require(re.fullmatch(r"[0-9]{4}", wave_text) and int(wave_text) < spec["wave_count"], "prepare-wave")
    wave = int(wave_text)
    root, run, fd = lock_run(recipe, matrix_code, True)
    try:
        rows_root = root + "/rows"
        existing = sorted(os.listdir(rows_root))
        require(existing == ["wave-{:04d}".format(index) for index in range(wave)], "prepare-sequence")
        if wave:
            for route in ROUTE_ORDER:
                require(sorted(os.listdir(row_path(root, wave - 1, route))) == recipe["evidence_contract"]["row_inventories"]["terminal"], "prepare-prior-terminal")
        wave_root = rows_root + "/wave-" + wave_text
        make_directory(wave_root, rows_root)
        prepared = []
        for route_index, route in enumerate(ROUTE_ORDER):
            record = read_schedule_record(root, run, wave, route_index)
            require(record["route"] == route and record["matrix_code"] == matrix_code, "prepare-record-bind")
            expected_record, cell, node = expected_schedule_record(recipe, public, matrix_code, wave, route)
            require(record == expected_record, "prepare-record-exact")
            contract = result_contract(node, cell)
            objective = record["goal_objective"]
            require(len(objective.encode("utf-8")) <= recipe["limits"]["goal_objective_utf8_bytes_max"], "prepare-objective-limit")
            activation = activation_message(recipe, objective, record["execution_nonce"])
            admission = {
                "activation": {"bytes": len(activation), "sha256": sha(activation)},
                "activation_tool_input": activation_tool_input(objective),
                "attempt": 0,
                "attempt_id": record["attempt_id"],
                "cell": record["cell"],
                "cell_index": record["cell_index"],
                "dependency_waves": record["dependency_waves"],
                "execution_nonce": record["execution_nonce"],
                "goal_objective": objective,
                "matrix_code": matrix_code,
                "matrix_id": spec["matrix_id"],
                "model_requested": record["model_requested"],
                "node_index": record["node_index"],
                "qualification_credit": 0,
                "reasoning_effort_requested": record["reasoning_effort_requested"],
                "result_contract": contract,
                "route": route,
                "route_code": record["route_code"],
                "schema_id": "pw-r9-codex-native-goal-jit-post-goal-delivery-admission-v1",
                "source": {
                    "atom_id": record["atom_id"],
                    "cell_bytes": record["source_cell_file_bytes"],
                    "cell_path": record["source_cell_path"],
                    "cell_sha256": record["source_cell_file_sha256"],
                    "node_sha256": record["source_node_sha256"],
                },
                "task_name": record["task_name"],
                "wave_index": wave,
            }
            require(set(admission) == set(recipe["schemas"]["admission_fields"]), "prepare-admission-fields")
            row_root = wave_root + "/" + route
            make_directory(row_root, wave_root)
            publish(row_root + "/admission.json", canon(admission) + b"\n")
            publish(row_root + "/activation.txt", activation)
            require(sorted(os.listdir(row_root)) == recipe["evidence_contract"]["row_inventories"]["prepared"], "prepare-row-state")
            prepared.append({
                "activation": admission["activation"],
                "model": record["model_requested"],
                "reasoning_effort": record["reasoning_effort_requested"],
                "route": route,
                "task_name": record["task_name"],
            })
        sys.stdout.buffer.write(canon({"matrix_id": spec["matrix_id"], "prepared": prepared, "qualification_credit": 0, "wave_index": wave}) + b"\n")
    finally:
        fcntl.flock(fd, fcntl.LOCK_UN)
        os.close(fd)


def record_active(matrix_code, wave_text, route_code, trace_path):
    recipe, _ = load_recipe()
    spec = matrix_spec(recipe, matrix_code)
    require(re.fullmatch(r"[0-9]{4}", wave_text) and int(wave_text) < spec["wave_count"], "active-wave")
    require(route_code in set(ROUTE_CODES.values()), "active-route")
    wave = int(wave_text)
    route = next(route for route, code in ROUTE_CODES.items() if code == route_code)
    root, run, fd = lock_run(recipe, matrix_code, True)
    try:
        row_root = row_path(root, wave, route)
        require(sorted(os.listdir(row_root)) == recipe["evidence_contract"]["row_inventories"]["prepared"], "active-row-state")
        admission = read_admission(row_root, recipe)
        source_raw = read_source_trace(trace_path)
        proof = validate_trace(source_raw, admission, "active")
        require(os.path.basename(trace_path).endswith("-" + proof["goal_thread_id"] + ".jsonl"), "active-trace-name")
        publish(row_root + "/activation_trace.jsonl", source_raw)
        active = {
            "activation_trace": {"bytes": len(source_raw), "sha256": sha(source_raw)},
            "goal_objective": admission["goal_objective"],
            "goal_thread_id": proof["goal_thread_id"],
            "matrix_id": run["matrix_id"],
            "qualification_credit": 0,
            "schema_id": "pw-r9-codex-native-goal-jit-post-goal-delivery-active-v1",
            "status": "ACTIVE_ATTESTED_ZERO_CREDIT",
            "task_path": proof["task_path"],
            "turn_id": proof["turn_ids"][0],
            "wave_index": wave,
        }
        require(set(active) == set(recipe["schemas"]["active_fields"]), "active-fields")
        publish(row_root + "/active.json", canon(active) + b"\n")
        case_raw = derive_case(recipe, root, admission)
        tool_input = subject_tool_input(matrix_code, wave, route_code, proof["goal_thread_id"])
        trigger = subject_trigger(recipe, admission["execution_nonce"], tool_input)
        publish(row_root + "/case.txt", case_raw)
        publish(row_root + "/subject_tool_input.txt", tool_input.encode("utf-8"))
        publish(row_root + "/subject_trigger.txt", trigger)
        require(sorted(os.listdir(row_root)) == recipe["evidence_contract"]["row_inventories"]["active"], "active-final-state")
        sys.stdout.buffer.write(canon({
            "goal_thread_id": proof["goal_thread_id"],
            "matrix_id": run["matrix_id"],
            "qualification_credit": 0,
            "route": route,
            "status": "ACTIVE_ATTESTED_SUBJECT_JIT_PUBLISHED",
            "subject_trigger": {"bytes": len(trigger), "sha256": sha(trigger)},
            "wave_index": wave,
        }) + b"\n")
    finally:
        fcntl.flock(fd, fcntl.LOCK_UN)
        os.close(fd)


def show(matrix_code, wave_text, route_code, goal_thread_id):
    recipe, _ = load_recipe()
    spec = matrix_spec(recipe, matrix_code)
    require(re.fullmatch(r"[0-9]{4}", wave_text) and int(wave_text) < spec["wave_count"], "show-wave")
    require(route_code in set(ROUTE_CODES.values()) and UUID_RE.fullmatch(goal_thread_id), "show-address")
    wave = int(wave_text)
    route = next(route for route, code in ROUTE_CODES.items() if code == route_code)
    root, _, fd = lock_run(recipe, matrix_code, False)
    try:
        row_root = row_path(root, wave, route)
        require(sorted(os.listdir(row_root)) == recipe["evidence_contract"]["row_inventories"]["active"], "show-row-state")
        admission = read_admission(row_root, recipe)
        active = read_active(row_root, recipe, admission)
        require(active["goal_thread_id"] == goal_thread_id, "show-active")
        case_raw = read_bound(row_root + "/case.txt", 0o444, recipe["limits"]["show_output_utf8_bytes_max"])
        sys.stdout.buffer.write(case_raw)
    finally:
        fcntl.flock(fd, fcntl.LOCK_UN)
        os.close(fd)


def canonicalize_token(token, contract):
    require(isinstance(token, str) and 1 <= len(token.encode("utf-8")) <= 48 and TOKEN_RE.fullmatch(token), "token-shape")
    if contract["kind"] == "regex":
        require(contract["min_bytes"] <= len(token.encode("utf-8")) <= contract["max_bytes"] and re.fullmatch(contract["pattern"], token), "token-regex")
        return token
    if contract["token_mode"] == "DIRECT":
        require(token in contract["values"], "token-direct")
        return token
    aliases = {chr(65 + index): value for index, value in enumerate(contract["values"])}
    require(token in aliases, "token-alias")
    return aliases[token]


def record_result(matrix_code, wave_text, route_code, trace_path):
    recipe, _ = load_recipe()
    spec = matrix_spec(recipe, matrix_code)
    require(re.fullmatch(r"[0-9]{4}", wave_text) and int(wave_text) < spec["wave_count"], "result-wave")
    require(route_code in set(ROUTE_CODES.values()), "result-route")
    wave = int(wave_text)
    route = next(route for route, code in ROUTE_CODES.items() if code == route_code)
    root, run, fd = lock_run(recipe, matrix_code, True)
    try:
        row_root = row_path(root, wave, route)
        require(sorted(os.listdir(row_root)) == recipe["evidence_contract"]["row_inventories"]["active"], "result-row-state")
        admission = read_admission(row_root, recipe)
        active = read_active(row_root, recipe, admission)
        prior_raw = read_bound(row_root + "/activation_trace.jsonl", 0o444, 2000000)
        case_raw = read_bound(row_root + "/case.txt", 0o444, recipe["limits"]["show_output_utf8_bytes_max"])
        source_raw = read_source_trace(trace_path)
        proof = validate_trace(source_raw, admission, "result", prior_raw, case_raw, active)
        require(proof["goal_thread_id"] == active["goal_thread_id"] and proof["task_path"] == active["task_path"], "result-active-bind")
        canonical = canonicalize_token(proof["result_token"], admission["result_contract"])
        token_raw = proof["result_token"].encode("utf-8") + b"\n"
        result_raw = canonical.encode("utf-8") + b"\n"
        publish(row_root + "/subject_trace.jsonl", source_raw)
        publish(row_root + "/subject_token.txt", token_raw)
        publish(row_root + "/result.txt", result_raw)
        result = {
            "canonical_result": {"bytes": len(result_raw) - 1, "sha256": sha(result_raw[:-1])},
            "execution_nonce": admission["execution_nonce"],
            "matrix_id": run["matrix_id"],
            "qualification_credit": 0,
            "schema_id": "pw-r9-codex-native-goal-jit-post-goal-delivery-result-v1",
            "status": "RESULT_ATTESTED_ZERO_CREDIT",
            "subject_token": {"bytes": len(token_raw) - 1, "sha256": sha(token_raw[:-1])},
            "subject_trace": {"bytes": len(source_raw), "sha256": sha(source_raw)},
            "wave_index": wave,
        }
        require(set(result) == set(recipe["schemas"]["result_fields"]), "result-fields")
        publish(row_root + "/result.json", canon(result) + b"\n")
        completion = completion_message(recipe, admission["execution_nonce"], active["goal_thread_id"])
        publish(row_root + "/completion.txt", completion)
        require(sorted(os.listdir(row_root)) == recipe["evidence_contract"]["row_inventories"]["result"], "result-final-state")
        sys.stdout.buffer.write(canon({
            "canonical_result": result["canonical_result"],
            "completion": {"bytes": len(completion), "sha256": sha(completion)},
            "matrix_id": run["matrix_id"],
            "qualification_credit": 0,
            "route": route,
            "status": "RESULT_ATTESTED_COMPLETION_PUBLISHED",
            "wave_index": wave,
        }) + b"\n")
    finally:
        fcntl.flock(fd, fcntl.LOCK_UN)
        os.close(fd)


def record_terminal(matrix_code, wave_text, route_code, trace_path):
    recipe, _ = load_recipe()
    spec = matrix_spec(recipe, matrix_code)
    require(re.fullmatch(r"[0-9]{4}", wave_text) and int(wave_text) < spec["wave_count"], "terminal-wave")
    require(route_code in set(ROUTE_CODES.values()), "terminal-route")
    wave = int(wave_text)
    route = next(route for route, code in ROUTE_CODES.items() if code == route_code)
    root, run, fd = lock_run(recipe, matrix_code, True)
    try:
        row_root = row_path(root, wave, route)
        require(sorted(os.listdir(row_root)) == recipe["evidence_contract"]["row_inventories"]["result"], "terminal-row-state")
        admission = read_admission(row_root, recipe)
        active = read_active(row_root, recipe, admission)
        prior_raw = read_bound(row_root + "/subject_trace.jsonl", 0o444, 2000000)
        case_raw = read_bound(row_root + "/case.txt", 0o444, recipe["limits"]["show_output_utf8_bytes_max"])
        source_raw = read_source_trace(trace_path)
        proof = validate_trace(source_raw, admission, "terminal", prior_raw, case_raw, active)
        require(proof["goal_thread_id"] == active["goal_thread_id"] and proof["task_path"] == active["task_path"], "terminal-active-bind")
        result_raw = read_bound(row_root + "/result.txt", 0o444, 256)
        canonical = validate_canonical_result(result_raw, admission["result_contract"])
        token_raw = read_bound(row_root + "/subject_token.txt", 0o444, 64)
        token = token_raw[:-1].decode("utf-8")
        require(canonicalize_token(token, admission["result_contract"]) == canonical, "terminal-token-bind")
        publish(row_root + "/terminal_trace.jsonl", source_raw)
        terminal_goal = proof["terminal_goal"]
        activation_trace_raw = read_bound(row_root + "/activation_trace.jsonl", 0o444, 2000000)
        receipt = {
            "goal": {
                "objective": admission["goal_objective"],
                "status": "complete",
                "time_used_seconds": terminal_goal["timeUsedSeconds"],
                "tokens_used": terminal_goal["tokensUsed"],
            },
            "goal_thread_id": proof["goal_thread_id"],
            "matrix_id": run["matrix_id"],
            "model": admission["model_requested"],
            "qualification_credit": 0,
            "reasoning_effort": admission["reasoning_effort_requested"],
            "result": {"bytes": len(result_raw) - 1, "sha256": sha(result_raw[:-1])},
            "route": route,
            "schema_id": "pw-r9-codex-native-goal-jit-post-goal-delivery-goal-receipt-v1",
            "status": "PASS_FRESH_NATIVE_GOAL_POST_GOAL_SINGLE_ATOM_ZERO_CREDIT",
            "task_path": proof["task_path"],
            "traces": {
                "activation": {"bytes": len(activation_trace_raw), "sha256": sha(activation_trace_raw)},
                "subject": {"bytes": len(prior_raw), "sha256": sha(prior_raw)},
                "terminal": {"bytes": len(source_raw), "sha256": sha(source_raw)},
            },
            "turn_count": 3,
            "wave_index": wave,
        }
        require(set(receipt) == set(recipe["schemas"]["goal_receipt_fields"]), "receipt-fields")
        publish(row_root + "/goal_receipt.json", canon(receipt) + b"\n")
        require(sorted(os.listdir(row_root)) == recipe["evidence_contract"]["row_inventories"]["terminal"], "terminal-final-state")
        sys.stdout.buffer.write(canon(receipt) + b"\n")
    finally:
        fcntl.flock(fd, fcntl.LOCK_UN)
        os.close(fd)


def inventory_projection(root, excluded):
    records = []
    total = 0

    def visit(path, relative):
        nonlocal total
        info = os.lstat(path)
        require(not stat.S_ISLNK(info.st_mode) and info.st_uid == os.getuid(), "inventory-custody")
        if stat.S_ISDIR(info.st_mode):
            require(stat.S_IMODE(info.st_mode) == 0o700, "inventory-directory-mode")
            records.append({"kind": "directory", "mode": "0700", "path": relative})
            for name in sorted(os.listdir(path)):
                child_relative = name if relative == "." else relative + "/" + name
                if child_relative not in excluded:
                    visit(path + "/" + name, child_relative)
        else:
            require(stat.S_ISREG(info.st_mode), "inventory-kind")
            expected_mode = 0o600 if relative == "run.lock" else 0o444
            raw = read_bound(path, expected_mode, 30000000)
            records.append({"bytes": len(raw), "kind": "file", "mode": "{:04o}".format(expected_mode), "path": relative, "sha256": sha(raw)})
            total += len(raw)

    visit(root, ".")
    raw = b"".join(canon(record) + b"\n" for record in records)
    return {
        "directories": sum(record["kind"] == "directory" for record in records),
        "entries": len(records),
        "files": sum(record["kind"] == "file" for record in records),
        "projection_bytes": len(raw),
        "projection_sha256": sha(raw),
        "total_file_bytes": total,
    }


def seal(matrix_code):
    recipe, _ = load_recipe()
    spec = matrix_spec(recipe, matrix_code)
    root, run, fd = lock_run(recipe, matrix_code, True)
    try:
        require(sorted(os.listdir(root)) == ["rows", "run.json", "run.lock", "schedule.jsonl", "schedule_offsets.json"], "seal-root-state")
        require(sorted(os.listdir(root + "/rows")) == ["wave-{:04d}".format(index) for index in range(spec["wave_count"])], "seal-wave-state")
        goal_threads = set()
        task_paths = set()
        trace_hashes = set()
        nonces = set()
        count = 0
        for wave in range(spec["wave_count"]):
            wave_root = root + "/rows/wave-{:04d}".format(wave)
            require(sorted(os.listdir(wave_root)) == list(ROUTE_ORDER), "seal-route-state")
            for route in ROUTE_ORDER:
                row_root = wave_root + "/" + route
                require(sorted(os.listdir(row_root)) == recipe["evidence_contract"]["row_inventories"]["terminal"], "seal-row-state")
                admission = read_admission(row_root, recipe)
                receipt_raw = read_bound(row_root + "/goal_receipt.json", 0o444, 20000)
                receipt = parse(receipt_raw)
                require(receipt_raw == canon(receipt) + b"\n" and receipt["status"] == "PASS_FRESH_NATIVE_GOAL_POST_GOAL_SINGLE_ATOM_ZERO_CREDIT", "seal-receipt")
                validate_canonical_result(read_bound(row_root + "/result.txt", 0o444, 256), admission["result_contract"])
                goal_threads.add(receipt["goal_thread_id"])
                task_paths.add(receipt["task_path"])
                trace_hashes.add(receipt["traces"]["terminal"]["sha256"])
                nonces.add(admission["execution_nonce"])
                count += 1
        require(count == spec["subject_task_count"], "seal-count")
        require(all(len(values) == count for values in (goal_threads, task_paths, trace_hashes, nonces)), "seal-global-freshness")
        preterminal = inventory_projection(root, {"matrix_terminal.json", "matrix_accounting.json"})
        terminal = {
            "fresh_goal_threads": len(goal_threads),
            "fresh_task_paths": len(task_paths),
            "fresh_terminal_trace_hashes": len(trace_hashes),
            "matrix_code": matrix_code,
            "matrix_id": spec["matrix_id"],
            "preterminal_inventory": preterminal,
            "qualification_credit": 0,
            "row_count": count,
            "schema_id": "pw-r9-codex-native-goal-jit-post-goal-delivery-matrix-terminal-v1",
            "status": "SEALED_EVIDENCE_ZERO_CREDIT_PENDING_INDEPENDENT_VERIFICATION",
            "wave_count": spec["wave_count"],
        }
        terminal_raw = canon(terminal) + b"\n"
        publish(root + "/matrix_terminal.json", terminal_raw)
        require(inventory_projection(root, {"matrix_terminal.json", "matrix_accounting.json"}) == preterminal, "seal-preterminal-drift")
        before_accounting = inventory_projection(root, {"matrix_accounting.json"})
        accounting = {
            "inventory_before_accounting": before_accounting,
            "matrix_code": matrix_code,
            "matrix_id": spec["matrix_id"],
            "matrix_terminal": {"bytes": len(terminal_raw), "sha256": sha(terminal_raw)},
            "qualification_credit": 0,
            "retry_count": 0,
            "schema_id": "pw-r9-codex-native-goal-jit-post-goal-delivery-matrix-accounting-v1",
            "status": "SEALED_ZERO_CREDIT_PENDING_INDEPENDENT_VERIFICATION",
            "subject_task_count": count,
        }
        accounting_raw = canon(accounting) + b"\n"
        publish(root + "/matrix_accounting.json", accounting_raw)
        require(inventory_projection(root, {"matrix_accounting.json"}) == before_accounting, "seal-accounting-drift")
        sys.stdout.buffer.write(accounting_raw)
    finally:
        fcntl.flock(fd, fcntl.LOCK_UN)
        os.close(fd)


def check():
    recipe, public = load_recipe()
    require(not os.path.lexists(run_path(recipe, "C01")), "check-canary-root-present")
    require(not os.path.lexists(run_path(recipe, "011")), "check-matrix-011-root-present")
    require(not os.path.lexists(run_path(recipe, "012")), "check-matrix-012-root-present")
    outputs = {}
    max_activation = 0
    max_trigger = 0
    max_completion = 0
    fixed_goal = "00000000-0000-0000-0000-000000000000"
    for matrix_code in ("C01", "011", "012"):
        records = build_schedule(recipe, public, matrix_code)
        raw, offsets = schedule_bytes(records)
        outputs[matrix_code] = {"bytes": len(raw), "records": len(records), "sha256": sha(raw), "offsets_bytes": len(offsets), "offsets_sha256": sha(offsets)}
        for record in records:
            max_activation = max(max_activation, len(activation_message(recipe, record["goal_objective"], record["execution_nonce"])))
            tool_input = subject_tool_input(matrix_code, record["wave_index"], record["route_code"], fixed_goal)
            max_trigger = max(max_trigger, len(subject_trigger(recipe, record["execution_nonce"], tool_input)))
            max_completion = max(max_completion, len(completion_message(recipe, record["execution_nonce"], fixed_goal)))
    output = {
        "evidence_writes": 0,
        "max_activation_bytes": max_activation,
        "max_completion_bytes": max_completion,
        "max_subject_trigger_bytes": max_trigger,
        "matrices": outputs,
        "private_scorer_reads": 0,
        "qualification_credit": 0,
        "schema_id": "pw-r9-codex-native-goal-jit-post-goal-delivery-materializer-check-v1",
        "status": "PASS_ZERO_CALLS_ZERO_WRITES",
        "subject_calls": 0,
    }
    sys.stdout.buffer.write(canon(output) + b"\n")


def main():
    try:
        require(len(sys.argv) >= 2, "cli")
        command = sys.argv[1]
        if command == "check":
            require(len(sys.argv) == 2, "cli-check")
            check()
        elif command == "begin":
            require(len(sys.argv) == 3, "cli-begin")
            begin(sys.argv[2])
        elif command == "prepare":
            require(len(sys.argv) == 4, "cli-prepare")
            prepare(sys.argv[2], sys.argv[3])
        elif command == "show":
            require(len(sys.argv) == 6, "cli-show")
            show(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
        elif command == "record-active":
            require(len(sys.argv) == 6, "cli-record-active")
            record_active(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
        elif command == "record-result":
            require(len(sys.argv) == 6, "cli-record-result")
            record_result(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
        elif command == "record-terminal":
            require(len(sys.argv) == 6, "cli-record-terminal")
            record_terminal(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
        elif command == "seal":
            require(len(sys.argv) == 3, "cli-seal")
            seal(sys.argv[2])
        else:
            raise Invalid("cli-command")
    except (Invalid, OSError, ValueError, KeyError, IndexError, TypeError, UnicodeError, json.JSONDecodeError) as error:
        sys.stderr.write("FAIL:" + str(error) + "\n")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
