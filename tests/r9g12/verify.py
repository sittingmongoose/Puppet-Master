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
MATERIALIZER_PATH = HERE + "/materialize.py"
MATERIALIZER_BYTES = 66188
MATERIALIZER_SHA256 = "dc1a45a8957c019767b8651f3bbf5423cd9196900c8e592c2f9244bce565bbfd"
VERIFIER_PATH = HERE + "/verify.py"
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


def ordered(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, separators=(",", ":")).encode("utf-8")


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def _meta(info):
    return (info.st_dev, info.st_ino, info.st_mode, info.st_uid, info.st_nlink, info.st_size, info.st_mtime_ns)


def read_bound(path, mode, cap, expected_bytes=None, expected_sha=None):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and stat.S_IMODE(before.st_mode) == mode, "read-kind-mode:" + path)
    require(before.st_uid == os.getuid() and before.st_nlink == 1 and before.st_size <= cap, "read-custody:" + path)
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


def require_directory(path, mode=0o700):
    info = os.lstat(path)
    require(stat.S_ISDIR(info.st_mode) and not stat.S_ISLNK(info.st_mode), "directory-kind:" + path)
    require(stat.S_IMODE(info.st_mode) == mode and info.st_uid == os.getuid(), "directory-custody:" + path)


def identity(path, cap=250000):
    raw = read_bound(path, 0o644, cap)
    return {"bytes": len(raw), "path": path, "sha256": sha(raw)}


def load_sources():
    recipe_raw = read_bound(RECIPE_PATH, 0o644, RECIPE_BYTES, RECIPE_BYTES, RECIPE_SHA256)
    recipe = parse(recipe_raw)
    require(recipe_raw == canon(recipe) + b"\n", "recipe-canonical")
    require(recipe.get("schema_id") == "pw-r9-codex-native-goal-jit-post-goal-delivery-closed-recipe-v1", "recipe-schema")
    require(recipe.get("status") == "IMPLEMENTATION_RECIPE_ONLY_ZERO_CREDIT_NO_EMPIRICAL_AUTHORITY", "recipe-status")
    require(recipe.get("qualification") == {"canary_credit": 0, "clean_full_matrix_streak": 0, "credit": "0/2", "required_consecutive_clean_full_matrices": 2, "sequence": ["C01", "011", "012"]}, "recipe-qualification")
    require(recipe.get("failure_contract") == {"best_of": 0, "relaunch": 0, "replacement": 0, "resend": 0, "retry": 0, "reuse": 0, "terminal": "CONSUMED_ZERO_CREDIT_NO_RECOVERY"}, "recipe-failure")
    require(identity(MATERIALIZER_PATH) == {"bytes": MATERIALIZER_BYTES, "path": MATERIALIZER_PATH, "sha256": MATERIALIZER_SHA256}, "materializer-identity")
    for key in ("architecture", "implementation_admission", "public_plan", "v4_failure"):
        binding = recipe["bindings"][key]
        bound_raw = read_bound(binding["path"], int(binding["mode"], 8), binding["bytes"], binding["bytes"], binding["sha256"])
        value = parse(bound_raw)
        require(bound_raw == canon(value) + b"\n", "binding-canonical:" + key)
    public_binding = recipe["bindings"]["public_plan"]
    public_raw = read_bound(public_binding["path"], 0o644, public_binding["bytes"], public_binding["bytes"], public_binding["sha256"])
    public = parse(public_raw)
    require(public_raw == canon(public) + b"\n" and public.get("schema_id") == "pw-r9-codex-native-goal-atomic-public-manifest-v1", "public-manifest")
    require(len(public.get("cells", [])) == 291, "public-count")
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
    mapping = {"${LEFT_RESULT}": results[0] if len(results) == 2 else None, "${RIGHT_RESULT}": results[1] if len(results) == 2 else None, "${SUMMARY_RESULT}": results[0] if len(results) == 1 else None}
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
        require(validation["regex"] == "[A-Za-z0-9._:-]+" and 1 <= validation["utf8_bytes_min"] <= validation["utf8_bytes_max"] <= 48, "result-regex")
        if not node["dynamic"]:
            payload = static_payload(node)
            raw = payload["x"].encode("utf-8")
            if validation["utf8_bytes_min"] <= len(raw) <= validation["utf8_bytes_max"] and TOKEN_RE.fullmatch(payload["x"]) and "'" not in payload["x"]:
                return {"kind": "exact_set", "max_bytes": validation["utf8_bytes_max"], "token_mode": "DIRECT", "values": [payload["x"]]}
        return {"kind": "regex", "max_bytes": validation["utf8_bytes_max"], "min_bytes": validation["utf8_bytes_min"], "pattern": validation["regex"], "token_mode": "DIRECT"}
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
    require(1 <= len(values) <= 3 and len(values) == len(set(values)), "result-values")
    require(all(1 <= len(value.encode("utf-8")) <= node["result_max_bytes"] for value in values), "result-value-size")
    return {"kind": "exact_set", "max_bytes": node["result_max_bytes"], "token_mode": "ALIAS", "values": values}


def execution_fields(matrix_code, matrix_id, wave, route_code, cell_sha, atom_id, node_sha):
    preimage = "\0".join(["pw-r9-jit-post-goal-delivery-execution-v1", matrix_id, cell_sha, atom_id, node_sha, str(wave), route_code]).encode("utf-8")
    nonce = sha(preimage)
    attempt_id = sha(b"pw-r9-jit-post-goal-delivery-attempt-v1\0" + nonce.encode("ascii"))[:24]
    objective = "CG|m={}|w={:04d}|r={}|x={}|once".format(matrix_code, wave, route_code, nonce)
    return nonce, attempt_id, objective, "r9_cg5_" + nonce


def build_schedule(recipe, public, matrix_code):
    spec = matrix_spec(recipe, matrix_code)
    public_dir = os.path.dirname(recipe["bindings"]["public_plan"]["path"])
    roster = {item["route"]: item for item in recipe["roster"]}
    entries = {route: [] for route in ROUTE_ORDER}
    for entry in public["cells"]:
        require(entry["route"] in entries, "schedule-route")
        entries[entry["route"]].append(entry)
    by_route = {route: [] for route in ROUTE_ORDER}
    cells = {}
    for route in ROUTE_ORDER:
        row = roster[route]
        wave = 0
        ordered_entries = sorted(entries[route], key=lambda value: value["cell_index"])
        require([value["cell_index"] for value in ordered_entries] == list(range(97)), "schedule-cell-order")
        for entry in ordered_entries:
            cell_file = entry["cell_file"]
            cell_raw = read_bound(public_dir + "/" + cell_file["path"], 0o644, 500000, cell_file["bytes"], cell_file["sha256"])
            cell = parse(cell_raw)
            require(cell_raw == canon(cell) + b"\n" and cell["route"] == route and cell["cell_index"] == entry["cell_index"], "schedule-cell")
            require(cell["model_requested"] == row["model"] and cell["reasoning_effort_requested"] == row["reasoning_effort"], "schedule-roster")
            require(len(cell["nodes"]) == entry["atom_count"], "schedule-node-count")
            cells[(route, cell["cell_index"])] = cell
            atom_waves = {}
            for node_index, node in enumerate(cell["nodes"]):
                require(node["atom_id"] == "n{:05d}".format(node_index), "schedule-node-order")
                dependencies = []
                for dependency in node["dependencies"]:
                    require(dependency in atom_waves, "schedule-dependency")
                    dependencies.append(atom_waves[dependency])
                if not node["dynamic"]:
                    static_payload(node)
                node_sha = sha(canon(node))
                nonce, attempt_id, objective, task_name = execution_fields(matrix_code, spec["matrix_id"], wave, row["route_code"], cell_file["sha256"], node["atom_id"], node_sha)
                by_route[route].append({"atom_id": node["atom_id"], "attempt": 0, "attempt_id": attempt_id, "cell": cell["cell"], "cell_index": cell["cell_index"], "dependency_waves": dependencies, "execution_nonce": nonce, "goal_objective": objective, "matrix_code": matrix_code, "matrix_id": spec["matrix_id"], "model_requested": row["model"], "node_index": node_index, "reasoning_effort_requested": row["reasoning_effort"], "route": route, "route_code": row["route_code"], "schema_id": "pw-r9-codex-native-goal-jit-post-goal-delivery-schedule-row-v1", "source_cell_file_bytes": cell_file["bytes"], "source_cell_file_sha256": cell_file["sha256"], "source_cell_path": cell_file["path"], "source_node_sha256": node_sha, "task_name": task_name, "wave_index": wave})
                atom_waves[node["atom_id"]] = wave
                wave += 1
        require(wave == 5204, "schedule-route-count")
    records = [by_route[route][wave] for wave in range(spec["wave_count"]) for route in ROUTE_ORDER]
    require(len(records) == spec["subject_task_count"], "schedule-count")
    require(len({record["execution_nonce"] for record in records}) == len(records), "schedule-nonce-unique")
    require(len({record["attempt_id"] for record in records}) == len(records), "schedule-attempt-unique")
    return records, cells


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
    offsets_raw = canon({"count": len(records), "entries": offsets, "schedule_bytes": len(raw), "schedule_sha256": sha(raw), "schema_id": "pw-r9-codex-native-goal-jit-post-goal-delivery-schedule-offsets-v1"}) + b"\n"
    return raw, offsets_raw


def activation_tool_input(objective):
    return "const r=await tools.create_goal({objective:" + json.dumps(objective, ensure_ascii=False) + "});text(r)\n"


def subject_tool_input(matrix_code, wave, route_code, goal_thread_id):
    command = "python3 -B materialize.py show {} {:04d} {} {}".format(matrix_code, wave, route_code, goal_thread_id)
    return "const r=await tools.exec_command({cmd:" + json.dumps(command) + ",workdir:" + json.dumps(HERE) + ",login:false,yield_time_ms:10000,max_output_tokens:1000});text(r.output)\n"


def completion_tool_input():
    return 'text(await tools.update_goal({status:"complete"}))\n'


def activation_message(recipe, objective, nonce):
    raw = recipe["messages"]["activation_template"].format(goal_objective_json=json.dumps(objective, ensure_ascii=False), execution_nonce=nonce).encode("utf-8")
    require(len(raw) <= recipe["limits"]["activation_message_utf8_bytes_max"], "activation-message-limit")
    return raw


def subject_trigger(recipe, nonce, tool_input):
    raw = recipe["messages"]["subject_trigger_template"].format(execution_nonce=nonce, subject_tool_input=tool_input.rstrip("\n")).encode("utf-8")
    require(len(raw) <= recipe["limits"]["subject_trigger_utf8_bytes_max"], "subject-trigger-limit")
    return raw


def completion_message(recipe, nonce, goal_thread_id):
    raw = recipe["messages"]["completion_template"].format(execution_nonce=nonce, goal_thread_id=goal_thread_id, completion_tool_input=completion_tool_input().rstrip("\n")).encode("utf-8")
    require(len(raw) <= recipe["limits"]["completion_message_utf8_bytes_max"], "completion-message-limit")
    return raw


def expected_admission(recipe, record, cell, node):
    contract = result_contract(node, cell)
    activation = activation_message(recipe, record["goal_objective"], record["execution_nonce"])
    value = {
        "activation": {"bytes": len(activation), "sha256": sha(activation)},
        "activation_tool_input": activation_tool_input(record["goal_objective"]),
        "attempt": 0,
        "attempt_id": record["attempt_id"],
        "cell": record["cell"],
        "cell_index": record["cell_index"],
        "dependency_waves": record["dependency_waves"],
        "execution_nonce": record["execution_nonce"],
        "goal_objective": record["goal_objective"],
        "matrix_code": record["matrix_code"],
        "matrix_id": record["matrix_id"],
        "model_requested": record["model_requested"],
        "node_index": record["node_index"],
        "qualification_credit": 0,
        "reasoning_effort_requested": record["reasoning_effort_requested"],
        "result_contract": contract,
        "route": record["route"],
        "route_code": record["route_code"],
        "schema_id": "pw-r9-codex-native-goal-jit-post-goal-delivery-admission-v1",
        "source": {"atom_id": record["atom_id"], "cell_bytes": record["source_cell_file_bytes"], "cell_path": record["source_cell_path"], "cell_sha256": record["source_cell_file_sha256"], "node_sha256": record["source_node_sha256"]},
        "task_name": record["task_name"],
        "wave_index": record["wave_index"],
    }
    require(set(value) == set(recipe["schemas"]["admission_fields"]), "expected-admission-fields")
    return value, activation


def expected_case(recipe, admission, cell, node, route_results):
    dependencies = []
    for wave in admission["dependency_waves"]:
        require(wave in route_results, "case-dependency-missing")
        dependencies.append(route_results[wave])
    if node["dynamic"]:
        payload = replace_template(node["subject_template"]["canonical_json_template"], dependencies)
    else:
        require(not dependencies, "case-static-dependencies")
        payload = static_payload(node)
    require(len(canon(payload)) <= recipe["limits"]["subject_payload_utf8_bytes_max"], "case-payload-limit")
    contract = result_contract(node, cell)
    require(contract == admission["result_contract"], "case-result-contract")
    if contract["kind"] == "exact_set" and contract["token_mode"] == "ALIAS":
        if node["kind"] in {"FINAL_OPTION_SELECTOR", "FINAL_EDGE_VERDICT", "FINAL_TENSION_VERDICT"}:
            hint = "/".join(chr(65 + index) for index in range(len(contract["values"]))) + "=index(p.o)"
        else:
            hint = ",".join("{}={}".format(chr(65 + index), value) for index, value in enumerate(contract["values"]))
    else:
        hint = "direct"
    value = {"c": node["acceptance_criterion"]["utf8"], "p": payload, "q": node["output_contract"]["utf8"], "r": "R|{}|TOKEN".format(admission["execution_nonce"]), "v": 1, "z": hint}
    require(set(value) == set(recipe["messages"]["subject_case_fields"]), "case-fields")
    raw = canon(value) + b"\n"
    require(len(raw) <= recipe["limits"]["show_output_utf8_bytes_max"], "case-show-limit")
    return raw


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


def validate_trace(raw, recipe, admission, phase, prior_raw=None, case_raw=None, goal_thread_id=None):
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
    require(session.get("parent_thread_id") == recipe["evidence_contract"]["parent_thread_id"], "trace-parent")
    require(session.get("agent_path") == expected_task_path and spawn.get("agent_path") == expected_task_path, "trace-task-path")
    contexts = event_items(events, "turn_context")
    expected_turns = {"active": 1, "result": 2, "terminal": 3}[phase]
    require(len(contexts) == expected_turns, "trace-turn-count")
    turn_ids = [payload["turn_id"] for _, payload in contexts]
    require(len(set(turn_ids)) == expected_turns and all(UUID_RE.fullmatch(value) for value in turn_ids), "trace-turn-ids")
    require(all(payload.get("model") == admission["model_requested"] and payload.get("effort") == admission["reasoning_effort_requested"] for _, payload in contexts), "trace-route")
    starts = event_items(events, "event_msg", "task_started")
    completes = event_items(events, "event_msg", "task_complete")
    require([payload.get("turn_id") for _, payload in starts] == turn_ids and [payload.get("turn_id") for _, payload in completes] == turn_ids, "trace-terminals")
    require(not event_items(events, "response_item", "function_call") and not event_items(events, "response_item", "function_call_output"), "trace-direct-tool")
    calls = event_items(events, "response_item", "custom_tool_call")
    outputs = event_items(events, "response_item", "custom_tool_call_output")
    require(len(calls) == expected_turns and len(outputs) == expected_turns, "trace-tool-count")
    require(all(set(payload) == {"call_id", "id", "input", "internal_chat_message_metadata_passthrough", "name", "status", "type"} for _, payload in calls), "trace-tool-call-shape")
    require(all(set(payload) == {"call_id", "id", "internal_chat_message_metadata_passthrough", "output", "type"} for _, payload in outputs), "trace-tool-output-shape")
    require(all(payload.get("name") == "exec" and payload.get("status") == "completed" for _, payload in calls), "trace-tool-name")
    expected_inputs = [admission["activation_tool_input"]]
    if expected_turns >= 2:
        require(goal_thread_id is not None, "trace-goal-input")
        expected_inputs.append(subject_tool_input(admission["matrix_code"], admission["wave_index"], admission["route_code"], goal_thread_id))
    if expected_turns == 3:
        expected_inputs.append(completion_tool_input())
    require([payload.get("input") for _, payload in calls] == expected_inputs, "trace-tool-input")
    require([item_turn(payload) for _, payload in calls] == turn_ids, "trace-call-turn")
    by_call = {payload.get("call_id"): (index, payload) for index, payload in outputs}
    require(len(by_call) == expected_turns and set(by_call) == {payload.get("call_id") for _, payload in calls}, "trace-output-bind")
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
        output_index = by_call[calls[turn_index][1]["call_id"]][0]
        require(starts[turn_index][0] < contexts[turn_index][0] < calls[turn_index][0] < output_index < finals[turn_index][0] < completes[turn_index][0], "trace-causal-order")
    for turn_index in range(1, expected_turns):
        require(completes[turn_index - 1][0] < starts[turn_index][0], "trace-cross-turn-order")
    active_goal = parse(wrapper_text(by_call[calls[0][1]["call_id"]][1]).encode("utf-8")).get("goal")
    require(isinstance(active_goal, dict) and active_goal.get("threadId") == thread_id and active_goal.get("objective") == admission["goal_objective"] and active_goal.get("status") == "active", "trace-active-receipt")
    expected_a = "A|{}|{}|active".format(admission["execution_nonce"], thread_id)
    require(finals[0][2] == expected_a and completes[0][1].get("last_agent_message") == expected_a, "trace-active-final")
    result_token = None
    if expected_turns >= 2:
        require(case_raw is not None and wrapper_text(by_call[calls[1][1]["call_id"]][1]).encode("utf-8") == case_raw, "trace-show-output")
        prefix = "R|{}|".format(admission["execution_nonce"])
        require(isinstance(finals[1][2], str) and finals[1][2].startswith(prefix), "trace-result-prefix")
        result_token = finals[1][2][len(prefix):]
        require(1 <= len(result_token.encode("utf-8")) <= 48 and TOKEN_RE.fullmatch(result_token), "trace-result-token")
        require(completes[1][1].get("last_agent_message") == finals[1][2], "trace-result-final")
    terminal_goal = None
    if expected_turns == 3:
        terminal_goal = parse(wrapper_text(by_call[calls[2][1]["call_id"]][1]).encode("utf-8")).get("goal")
        require(isinstance(terminal_goal, dict) and terminal_goal.get("threadId") == thread_id and terminal_goal.get("objective") == admission["goal_objective"] and terminal_goal.get("status") == "complete", "trace-complete-receipt")
        require(isinstance(terminal_goal.get("tokensUsed"), int) and terminal_goal["tokensUsed"] > 0, "trace-terminal-tokens")
        require(isinstance(terminal_goal.get("timeUsedSeconds"), int) and terminal_goal["timeUsedSeconds"] >= 0, "trace-terminal-time")
        expected_t = "T|{}|{}|complete".format(admission["execution_nonce"], thread_id)
        require(finals[2][2] == expected_t and completes[2][1].get("last_agent_message") == expected_t, "trace-terminal-final")
    return {"goal_thread_id": thread_id, "result_token": result_token, "task_path": expected_task_path, "terminal_goal": terminal_goal, "turn_ids": turn_ids}


def acquire_lock(path):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and stat.S_IMODE(before.st_mode) == 0o600, "lock-kind-mode")
    require(before.st_uid == os.getuid() and before.st_nlink == 1, "lock-custody")
    flags = os.O_RDONLY | os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    fd = os.open(path, flags)
    try:
        require(_meta(os.fstat(fd)) == _meta(before), "lock-open-race")
        fcntl.flock(fd, fcntl.LOCK_SH | fcntl.LOCK_NB)
    except Exception:
        os.close(fd)
        raise
    return fd


def run_codes(matrix_code):
    order = ["C01", "011", "012"]
    require(matrix_code in order, "run-code")
    return order[:order.index(matrix_code) + 1]


def acquire_run_set(recipe, matrix_code):
    codes = run_codes(matrix_code)
    base = recipe["evidence_contract"]["run_root"]
    require_directory(base)
    expected_names = [matrix_spec(recipe, code)["matrix_id"] for code in codes]
    require(sorted(os.listdir(base)) == sorted(expected_names), "run-set-inventory")
    locks = []
    roots = {}
    try:
        for code in codes:
            root = base + "/" + matrix_spec(recipe, code)["matrix_id"]
            require_directory(root)
            locks.append(acquire_lock(root + "/run.lock"))
            roots[code] = root
        return roots, locks
    except Exception:
        for fd in reversed(locks):
            fcntl.flock(fd, fcntl.LOCK_UN)
            os.close(fd)
        raise


def release_locks(locks):
    for fd in reversed(locks):
        fcntl.flock(fd, fcntl.LOCK_UN)
        os.close(fd)


def launch_gate_path(matrix_code):
    base = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1"
    names = {"C01": "r9_codex_native_goal_jit_mailbox_canary_001_launch_admission_v1.json", "011": "r9_codex_native_goal_jit_mailbox_matrix_011_launch_admission_v1.json", "012": "r9_codex_native_goal_jit_mailbox_matrix_012_launch_admission_v1.json"}
    return base + "/" + names[matrix_code]


def validate_launch_gate(recipe, matrix_code, expected_identity):
    path = launch_gate_path(matrix_code)
    require(expected_identity["path"] == path, "launch-gate-path")
    raw = read_bound(path, 0o644, 20000, expected_identity["bytes"], expected_identity["sha256"])
    gate = parse(raw)
    require(raw == canon(gate) + b"\n", "launch-gate-canonical")
    contract = recipe["launch_gate_contract"]
    require(set(gate) == set(contract["fields"]), "launch-gate-fields")
    spec = matrix_spec(recipe, matrix_code)
    require(gate["matrix_code"] == matrix_code and gate["matrix_id"] == spec["matrix_id"] and gate["launch_authority"] is True, "launch-gate-bind")
    require(gate["schema_id"] == contract["schema_ids"][matrix_code] and gate["status"] == contract["status"] and gate["qualification_credit"] == 0, "launch-gate-status")
    require(gate["components"] == {"materializer": identity(MATERIALIZER_PATH), "recipe": identity(RECIPE_PATH), "verifier": identity(VERIFIER_PATH)}, "launch-gate-components")
    predecessor = gate["predecessor"]
    require(isinstance(predecessor, dict) and set(predecessor) == set(contract["predecessor_fields"]), "launch-gate-predecessor-fields")
    require(predecessor["status"] == contract["predecessor_statuses"][matrix_code], "launch-gate-predecessor-status")
    require(os.path.dirname(predecessor["path"]) == os.path.dirname(path) and os.path.realpath(predecessor["path"]) == predecessor["path"], "launch-gate-predecessor-path")
    predecessor_raw = read_bound(predecessor["path"], 0o644, 50000, predecessor["bytes"], predecessor["sha256"])
    predecessor_value = parse(predecessor_raw)
    require(predecessor_raw == canon(predecessor_value) + b"\n" and predecessor_value.get("status") == predecessor["status"], "launch-gate-predecessor")


def read_run(recipe, matrix_code, root):
    raw = read_bound(root + "/run.json", 0o444, 20000)
    value = parse(raw)
    require(raw == canon(value) + b"\n" and set(value) == set(recipe["schemas"]["run_fields"]), "run-canonical")
    spec = matrix_spec(recipe, matrix_code)
    require(value["schema_id"] == "pw-r9-codex-native-goal-jit-post-goal-delivery-run-v1" and value["status"] == "OPEN_ZERO_CREDIT", "run-status")
    require(value["matrix_code"] == matrix_code and value["matrix_id"] == spec["matrix_id"], "run-address")
    require(value["wave_count"] == spec["wave_count"] and value["subject_task_count"] == spec["subject_task_count"] and value["qualification_credit"] == 0, "run-count")
    require(value["recipe"] == identity(RECIPE_PATH), "run-recipe")
    validate_launch_gate(recipe, matrix_code, value["launch_gate"])
    return value


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
    return {"directories": sum(record["kind"] == "directory" for record in records), "entries": len(records), "files": sum(record["kind"] == "file" for record in records), "projection_bytes": len(raw), "projection_sha256": sha(raw), "total_file_bytes": total}


def validate_terminal_surface(recipe, matrix_code, root, run):
    spec = matrix_spec(recipe, matrix_code)
    require(sorted(os.listdir(root)) == ["matrix_accounting.json", "matrix_terminal.json", "rows", "run.json", "run.lock", "schedule.jsonl", "schedule_offsets.json"], "sealed-root-inventory")
    terminal_raw = read_bound(root + "/matrix_terminal.json", 0o444, 20000)
    terminal = parse(terminal_raw)
    require(terminal_raw == canon(terminal) + b"\n" and set(terminal) == {"fresh_goal_threads", "fresh_task_paths", "fresh_terminal_trace_hashes", "matrix_code", "matrix_id", "preterminal_inventory", "qualification_credit", "row_count", "schema_id", "status", "wave_count"}, "terminal-shape")
    require(terminal["schema_id"] == "pw-r9-codex-native-goal-jit-post-goal-delivery-matrix-terminal-v1" and terminal["status"] == "SEALED_EVIDENCE_ZERO_CREDIT_PENDING_INDEPENDENT_VERIFICATION", "terminal-status")
    require(terminal["matrix_code"] == matrix_code and terminal["matrix_id"] == run["matrix_id"] and terminal["qualification_credit"] == 0, "terminal-bind")
    require(terminal["wave_count"] == spec["wave_count"] and terminal["row_count"] == spec["subject_task_count"], "terminal-count")
    require(all(terminal[key] == spec["subject_task_count"] for key in ("fresh_goal_threads", "fresh_task_paths", "fresh_terminal_trace_hashes")), "terminal-freshness")
    require(terminal["preterminal_inventory"] == inventory_projection(root, {"matrix_terminal.json", "matrix_accounting.json"}), "terminal-inventory")
    accounting_raw = read_bound(root + "/matrix_accounting.json", 0o444, 20000)
    accounting = parse(accounting_raw)
    require(accounting_raw == canon(accounting) + b"\n" and set(accounting) == {"inventory_before_accounting", "matrix_code", "matrix_id", "matrix_terminal", "qualification_credit", "retry_count", "schema_id", "status", "subject_task_count"}, "accounting-shape")
    require(accounting["schema_id"] == "pw-r9-codex-native-goal-jit-post-goal-delivery-matrix-accounting-v1" and accounting["status"] == "SEALED_ZERO_CREDIT_PENDING_INDEPENDENT_VERIFICATION", "accounting-status")
    require(accounting["matrix_code"] == matrix_code and accounting["matrix_id"] == run["matrix_id"] and accounting["qualification_credit"] == 0 and accounting["retry_count"] == 0 and accounting["subject_task_count"] == spec["subject_task_count"], "accounting-bind")
    require(accounting["matrix_terminal"] == {"bytes": len(terminal_raw), "sha256": sha(terminal_raw)}, "accounting-terminal")
    require(accounting["inventory_before_accounting"] == inventory_projection(root, {"matrix_accounting.json"}), "accounting-inventory")
    return terminal_raw, accounting_raw


def read_json_exact(path, mode, cap):
    raw = read_bound(path, mode, cap)
    value = parse(raw)
    require(raw == canon(value) + b"\n", "json-canonical:" + path)
    return raw, value


def verify_rows(recipe, matrix_code, root, records, cells):
    spec = matrix_spec(recipe, matrix_code)
    require(sorted(os.listdir(root + "/rows")) == ["wave-{:04d}".format(index) for index in range(spec["wave_count"])], "rows-wave-inventory")
    route_results = {route: {} for route in ROUTE_ORDER}
    node_results = {route: {} for route in ROUTE_ORDER}
    goal_threads = set()
    task_paths = set()
    trace_hashes = set()
    nonces = set()
    attempts = set()
    turn_ids = set()
    for wave in range(spec["wave_count"]):
        wave_root = root + "/rows/wave-{:04d}".format(wave)
        require(sorted(os.listdir(wave_root)) == list(ROUTE_ORDER), "rows-route-inventory")
        for route_index, route in enumerate(ROUTE_ORDER):
            record = records[wave * 3 + route_index]
            cell = cells[(route, record["cell_index"])]
            node = cell["nodes"][record["node_index"]]
            admission, activation = expected_admission(recipe, record, cell, node)
            row_root = wave_root + "/" + route
            require(sorted(os.listdir(row_root)) == recipe["evidence_contract"]["row_inventories"]["terminal"], "row-terminal-inventory")
            admission_raw = read_bound(row_root + "/admission.json", 0o444, 20000)
            require(admission_raw == canon(admission) + b"\n", "row-admission")
            require(read_bound(row_root + "/activation.txt", 0o444, recipe["limits"]["activation_message_utf8_bytes_max"]) == activation, "row-activation")
            activation_trace = read_bound(row_root + "/activation_trace.jsonl", 0o444, 2000000)
            active_proof = validate_trace(activation_trace, recipe, admission, "active")
            active_raw, active = read_json_exact(row_root + "/active.json", 0o444, 10000)
            expected_active = {"activation_trace": {"bytes": len(activation_trace), "sha256": sha(activation_trace)}, "goal_objective": admission["goal_objective"], "goal_thread_id": active_proof["goal_thread_id"], "matrix_id": spec["matrix_id"], "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-jit-post-goal-delivery-active-v1", "status": "ACTIVE_ATTESTED_ZERO_CREDIT", "task_path": active_proof["task_path"], "turn_id": active_proof["turn_ids"][0], "wave_index": wave}
            require(set(expected_active) == set(recipe["schemas"]["active_fields"]) and active == expected_active, "row-active")
            case_raw = expected_case(recipe, admission, cell, node, route_results[route])
            require(read_bound(row_root + "/case.txt", 0o444, recipe["limits"]["show_output_utf8_bytes_max"]) == case_raw, "row-case")
            expected_tool = subject_tool_input(matrix_code, wave, record["route_code"], active["goal_thread_id"])
            require(read_bound(row_root + "/subject_tool_input.txt", 0o444, 1000) == expected_tool.encode("utf-8"), "row-subject-tool")
            require(read_bound(row_root + "/subject_trigger.txt", 0o444, recipe["limits"]["subject_trigger_utf8_bytes_max"]) == subject_trigger(recipe, admission["execution_nonce"], expected_tool), "row-subject-trigger")
            subject_trace = read_bound(row_root + "/subject_trace.jsonl", 0o444, 2000000)
            result_proof = validate_trace(subject_trace, recipe, admission, "result", activation_trace, case_raw, active["goal_thread_id"])
            require(result_proof["goal_thread_id"] == active["goal_thread_id"] and result_proof["task_path"] == active["task_path"], "row-result-proof")
            token_raw = read_bound(row_root + "/subject_token.txt", 0o444, 64)
            require(token_raw.endswith(b"\n") and token_raw.count(b"\n") == 1, "row-token-framing")
            token = token_raw[:-1].decode("utf-8")
            require(token == result_proof["result_token"], "row-token-proof")
            canonical_result = canonicalize_token(token, admission["result_contract"])
            result_raw = read_bound(row_root + "/result.txt", 0o444, 256)
            require(validate_canonical_result(result_raw, admission["result_contract"]) == canonical_result, "row-result")
            result_json_raw, result_json = read_json_exact(row_root + "/result.json", 0o444, 10000)
            expected_result_json = {"canonical_result": {"bytes": len(result_raw) - 1, "sha256": sha(result_raw[:-1])}, "execution_nonce": admission["execution_nonce"], "matrix_id": spec["matrix_id"], "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-jit-post-goal-delivery-result-v1", "status": "RESULT_ATTESTED_ZERO_CREDIT", "subject_token": {"bytes": len(token_raw) - 1, "sha256": sha(token_raw[:-1])}, "subject_trace": {"bytes": len(subject_trace), "sha256": sha(subject_trace)}, "wave_index": wave}
            require(set(expected_result_json) == set(recipe["schemas"]["result_fields"]) and result_json == expected_result_json, "row-result-json")
            require(read_bound(row_root + "/completion.txt", 0o444, recipe["limits"]["completion_message_utf8_bytes_max"]) == completion_message(recipe, admission["execution_nonce"], active["goal_thread_id"]), "row-completion")
            terminal_trace = read_bound(row_root + "/terminal_trace.jsonl", 0o444, 2000000)
            terminal_proof = validate_trace(terminal_trace, recipe, admission, "terminal", subject_trace, case_raw, active["goal_thread_id"])
            require(terminal_proof["goal_thread_id"] == active["goal_thread_id"] and terminal_proof["result_token"] == token, "row-terminal-proof")
            receipt_raw, receipt = read_json_exact(row_root + "/goal_receipt.json", 0o444, 20000)
            terminal_goal = terminal_proof["terminal_goal"]
            expected_receipt = {"goal": {"objective": admission["goal_objective"], "status": "complete", "time_used_seconds": terminal_goal["timeUsedSeconds"], "tokens_used": terminal_goal["tokensUsed"]}, "goal_thread_id": active["goal_thread_id"], "matrix_id": spec["matrix_id"], "model": admission["model_requested"], "qualification_credit": 0, "reasoning_effort": admission["reasoning_effort_requested"], "result": {"bytes": len(result_raw) - 1, "sha256": sha(result_raw[:-1])}, "route": route, "schema_id": "pw-r9-codex-native-goal-jit-post-goal-delivery-goal-receipt-v1", "status": "PASS_FRESH_NATIVE_GOAL_POST_GOAL_SINGLE_ATOM_ZERO_CREDIT", "task_path": active["task_path"], "traces": {"activation": {"bytes": len(activation_trace), "sha256": sha(activation_trace)}, "subject": {"bytes": len(subject_trace), "sha256": sha(subject_trace)}, "terminal": {"bytes": len(terminal_trace), "sha256": sha(terminal_trace)}}, "turn_count": 3, "wave_index": wave}
            require(set(expected_receipt) == set(recipe["schemas"]["goal_receipt_fields"]) and receipt == expected_receipt, "row-receipt")
            route_results[route][wave] = canonical_result
            node_results[route].setdefault(record["cell_index"], {})[record["atom_id"]] = result_raw[:-1]
            goal_threads.add(active["goal_thread_id"])
            task_paths.add(active["task_path"])
            trace_hashes.add(sha(terminal_trace))
            nonces.add(admission["execution_nonce"])
            attempts.add(admission["attempt_id"])
            turn_ids.update(terminal_proof["turn_ids"])
    count = spec["subject_task_count"]
    require(all(len(values) == count for values in (goal_threads, task_paths, trace_hashes, nonces, attempts)), "row-global-freshness")
    require(len(turn_ids) == count * 3, "row-turn-freshness")
    return {"attempt_ids": attempts, "goal_threads": goal_threads, "nonces": nonces, "task_paths": task_paths, "terminal_trace_hashes": trace_hashes, "turn_ids": turn_ids}, node_results


def index_prior(recipe, matrix_code, root):
    spec = matrix_spec(recipe, matrix_code)
    require(sorted(os.listdir(root + "/rows")) == ["wave-{:04d}".format(index) for index in range(spec["wave_count"])], "prior-wave-inventory")
    output = {key: set() for key in ("attempt_ids", "goal_threads", "nonces", "task_paths", "terminal_trace_hashes", "turn_ids")}
    for wave in range(spec["wave_count"]):
        wave_root = root + "/rows/wave-{:04d}".format(wave)
        require(sorted(os.listdir(wave_root)) == list(ROUTE_ORDER), "prior-route-inventory")
        for route in ROUTE_ORDER:
            row_root = wave_root + "/" + route
            require(sorted(os.listdir(row_root)) == recipe["evidence_contract"]["row_inventories"]["terminal"], "prior-row-inventory")
            admission_raw, admission = read_json_exact(row_root + "/admission.json", 0o444, 20000)
            require(set(admission) == set(recipe["schemas"]["admission_fields"]) and admission["matrix_code"] == matrix_code and admission["matrix_id"] == spec["matrix_id"], "prior-admission")
            receipt_raw, receipt = read_json_exact(row_root + "/goal_receipt.json", 0o444, 20000)
            require(set(receipt) == set(recipe["schemas"]["goal_receipt_fields"]) and receipt["status"] == "PASS_FRESH_NATIVE_GOAL_POST_GOAL_SINGLE_ATOM_ZERO_CREDIT", "prior-receipt")
            require(receipt["matrix_id"] == spec["matrix_id"] and receipt["route"] == route and receipt["wave_index"] == wave and receipt["qualification_credit"] == 0, "prior-receipt-bind")
            terminal_trace = read_bound(row_root + "/terminal_trace.jsonl", 0o444, 2000000, receipt["traces"]["terminal"]["bytes"], receipt["traces"]["terminal"]["sha256"])
            contexts = event_items(decode_trace(terminal_trace), "turn_context")
            require(len(contexts) == 3, "prior-turn-count")
            prior_turns = [payload.get("turn_id") for _, payload in contexts]
            require(len(set(prior_turns)) == 3 and all(isinstance(value, str) and UUID_RE.fullmatch(value) for value in prior_turns), "prior-turns")
            output["attempt_ids"].add(admission["attempt_id"])
            output["goal_threads"].add(receipt["goal_thread_id"])
            output["nonces"].add(admission["execution_nonce"])
            output["task_paths"].add(receipt["task_path"])
            output["terminal_trace_hashes"].add(sha(terminal_trace))
            output["turn_ids"].update(prior_turns)
    count = spec["subject_task_count"]
    require(all(len(output[key]) == count for key in ("attempt_ids", "goal_threads", "nonces", "task_paths", "terminal_trace_hashes")), "prior-freshness")
    require(len(output["turn_ids"]) == count * 3, "prior-turn-freshness")
    return output


def merge_freshness(target, addition):
    for key in target:
        require(target[key].isdisjoint(addition[key]), "cross-run-reuse:" + key)
        target[key].update(addition[key])


def assemble(assembly, node_results):
    if assembly["kind"] == "MODEL_FINAL_CANONICAL_ONE_FIELD_JSON":
        raw = node_results[assembly["dynamic_node"]]
        value = parse(raw)
        require(list(value) == [assembly["output_key"]] and value[assembly["output_key"]] in assembly["allowed_values"], "assembly-model-final")
        return raw
    if assembly["kind"] == "DETERMINISTIC_S50_ASSEMBLY_FROM_EIGHT_COMPACT_VERDICTS":
        fixed = assembly["fixed"]
        verdicts = []
        for item in assembly["ordered_edge_items"]:
            code = node_results[item["verdict_from_compact_node"]].decode("utf-8")
            require(code in {"S", "U"}, "assembly-s50-code")
            verdicts.append({"edge_id": item["edge_id"], "verdict": "supported" if code == "S" else "unsupported", "source_decision_ids": item["source_decision_ids"]})
        return ordered({"protocol_id": fixed["protocol_id"], "stage": fixed["stage"], "topic_artifact_hashes": fixed["topic_artifact_hashes"], "checked_edge_ids": fixed["checked_edge_ids"], "edge_verdicts": verdicts, "claim_boundary": fixed["claim_boundary"], "external_audit_status": fixed["external_audit_status"], "forbidden_action_violations": fixed["forbidden_action_violations"]})
    require(assembly["kind"] == "DETERMINISTIC_S60_ASSEMBLY_FROM_COMPACT_SPECIALIST_CODE", "assembly-kind")
    fixed = assembly["fixed"]
    code = node_results[assembly["compact_node"]].decode("utf-8")
    expected_code = {"provenance_gap": "P", "authority_conflation": "C", "counterfactual_failure": "K"}[fixed["classification"]]
    require(code in {"S:" + expected_code, "U:" + expected_code}, "assembly-s60-code")
    return ordered({"protocol_id": fixed["protocol_id"], "stage": fixed["stage"], "role": fixed["role"], "candidate_edge_id": fixed["candidate_edge_id"], "candidate_lineage_sha256": fixed["candidate_lineage_sha256"], "integration_candidate_sha256": fixed["integration_candidate_sha256"], "verdict": "supported" if code.startswith("S:") else "unsupported", "classification": fixed["classification"], "source_record_ids": fixed["source_record_ids"], "claim_boundary": fixed["claim_boundary"], "external_audit_status": fixed["external_audit_status"], "forbidden_action_violations": fixed["forbidden_action_violations"]})


def load_private_scorer(recipe):
    binding = recipe["bindings"]["private_scorer"]
    raw = read_bound(binding["path"], int(binding["mode"], 8), binding["bytes"], binding["bytes"], binding["sha256"])
    value = parse(raw)
    require(raw == canon(value) + b"\n" and value.get("schema_id") == "pw-r9-codex-native-goal-atomic-scorer-v1", "scorer-canonical")
    require(value.get("cell_count") == 97 and value.get("route_outcome_count") == 291 and value.get("qualification_credit") == 0, "scorer-count")
    require(isinstance(value.get("cells"), list) and len(value["cells"]) == 97, "scorer-cells")
    return value


def score_full_matrix(recipe, cells, node_results):
    scorer = load_private_scorer(recipe)
    expected = {entry["cell_index"]: entry for entry in scorer["cells"]}
    require(set(expected) == set(range(97)), "scorer-cell-index")
    outcomes = 0
    for route in ROUTE_ORDER:
        require(set(node_results[route]) == set(range(97)), "score-route-cells")
        for cell_index in range(97):
            cell = cells[(route, cell_index)]
            actual_nodes = node_results[route][cell_index]
            require(set(actual_nodes) == {node["atom_id"] for node in cell["nodes"]}, "score-node-set")
            actual = assemble(cell["assembly_recipe"], actual_nodes)
            item = expected[cell_index]
            require(item["cell"] == cell["cell"], "score-cell")
            require(len(actual) == item["expected_output_bytes"] and sha(actual) == item["expected_output_sha256"] and actual.decode("utf-8") == item["expected_output_utf8"], "score-mismatch:{}:{}".format(route, cell["cell"]))
            outcomes += 1
    require(outcomes == 291, "score-outcome-count")
    return outcomes


def verify_matrix(matrix_code):
    recipe, public = load_sources()
    roots, locks = acquire_run_set(recipe, matrix_code)
    try:
        before = {code: inventory_projection(root, set()) for code, root in roots.items()}
        cumulative = {key: set() for key in ("attempt_ids", "goal_threads", "nonces", "task_paths", "terminal_trace_hashes", "turn_ids")}
        for prior_code in run_codes(matrix_code)[:-1]:
            prior_root = roots[prior_code]
            prior_run = read_run(recipe, prior_code, prior_root)
            validate_terminal_surface(recipe, prior_code, prior_root, prior_run)
            merge_freshness(cumulative, index_prior(recipe, prior_code, prior_root))
        root = roots[matrix_code]
        run = read_run(recipe, matrix_code, root)
        records, cells = build_schedule(recipe, public, matrix_code)
        schedule_raw, offsets_raw = schedule_bytes(records)
        require(read_bound(root + "/schedule.jsonl", 0o444, 30000000, len(schedule_raw), sha(schedule_raw)) == schedule_raw, "schedule-exact")
        require(read_bound(root + "/schedule_offsets.json", 0o444, 500000, len(offsets_raw), sha(offsets_raw)) == offsets_raw, "schedule-offsets-exact")
        require(run["schedule"] == {"bytes": len(schedule_raw), "records": len(records), "sha256": sha(schedule_raw)}, "run-schedule")
        require(run["schedule_offsets"] == {"bytes": len(offsets_raw), "sha256": sha(offsets_raw)}, "run-schedule-offsets")
        validate_terminal_surface(recipe, matrix_code, root, run)
        freshness, node_results = verify_rows(recipe, matrix_code, root, records, cells)
        merge_freshness(cumulative, freshness)
        spec = matrix_spec(recipe, matrix_code)
        if matrix_code == "C01":
            route_outcomes = 0
            status = "PASS_THREE_ROUTE_CANARY_ZERO_CREDIT_PENDING_INDEPENDENT_ADJUDICATION"
            clean_full = False
            clean_canary = True
            scorer_reads = 0
        else:
            route_outcomes = score_full_matrix(recipe, cells, node_results)
            status = "PASS_CLEAN_FULL_MATRIX_ZERO_CREDIT_PENDING_INDEPENDENT_ADJUDICATION"
            clean_full = True
            clean_canary = False
            scorer_reads = 1
        after = {code: inventory_projection(root_value, set()) for code, root_value in roots.items()}
        require(after == before, "verification-inventory-drift")
        report = {
            "clean_full_matrix": clean_full,
            "clean_three_route_canary": clean_canary,
            "external_adjudication_required": True,
            "fresh_goal_threads": len(freshness["goal_threads"]),
            "fresh_task_paths": len(freshness["task_paths"]),
            "fresh_terminal_trace_hashes": len(freshness["terminal_trace_hashes"]),
            "matrix_code": matrix_code,
            "matrix_id": spec["matrix_id"],
            "nonclaims": ["VERIFIER WRITES NOTHING", "CANARY EARNS ZERO CREDIT", "FULL MATRIX PASS REQUIRES FRESH INDEPENDENT GOAL REVIEW", "QUALIFICATION REMAINS ZERO OF TWO UNTIL TWO CONSECUTIVE CLEAN FULL MATRICES"],
            "private_scorer_reads": scorer_reads,
            "qualification_credit": 0,
            "route_outcomes_exact_pass": route_outcomes,
            "schema_id": "pw-r9-codex-native-goal-jit-post-goal-delivery-offline-verification-v1",
            "status": status,
            "subject_task_count": spec["subject_task_count"],
            "wave_count": spec["wave_count"],
        }
        sys.stdout.buffer.write(canon(report) + b"\n")
    finally:
        release_locks(locks)


def check():
    recipe, public = load_sources()
    for matrix_code in ("C01", "011", "012"):
        require(not os.path.lexists(recipe["evidence_contract"]["run_root"] + "/" + matrix_spec(recipe, matrix_code)["matrix_id"]), "check-run-present:" + matrix_code)
    matrices = {}
    max_activation = 0
    max_subject = 0
    max_completion = 0
    fixed_goal = "00000000-0000-0000-0000-000000000000"
    for matrix_code in ("C01", "011", "012"):
        records, _ = build_schedule(recipe, public, matrix_code)
        raw, offsets = schedule_bytes(records)
        matrices[matrix_code] = {"bytes": len(raw), "offsets_bytes": len(offsets), "offsets_sha256": sha(offsets), "records": len(records), "sha256": sha(raw)}
        for record in records:
            max_activation = max(max_activation, len(activation_message(recipe, record["goal_objective"], record["execution_nonce"])))
            tool_input = subject_tool_input(matrix_code, record["wave_index"], record["route_code"], fixed_goal)
            max_subject = max(max_subject, len(subject_trigger(recipe, record["execution_nonce"], tool_input)))
            max_completion = max(max_completion, len(completion_message(recipe, record["execution_nonce"], fixed_goal)))
    output = {"evidence_writes": 0, "matrices": matrices, "max_activation_bytes": max_activation, "max_completion_bytes": max_completion, "max_subject_trigger_bytes": max_subject, "private_scorer_reads": 0, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-jit-post-goal-delivery-verifier-check-v1", "status": "PASS_READ_ONLY_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0}
    sys.stdout.buffer.write(canon(output) + b"\n")


def main():
    try:
        require(len(sys.argv) >= 2, "cli")
        if sys.argv[1] == "check":
            require(len(sys.argv) == 2, "cli-check")
            check()
        elif sys.argv[1] == "verify":
            require(len(sys.argv) == 3, "cli-verify")
            verify_matrix(sys.argv[2])
        else:
            raise Invalid("cli-command")
    except (Invalid, OSError, ValueError, KeyError, IndexError, TypeError, UnicodeError, json.JSONDecodeError) as error:
        sys.stderr.write("FAIL:" + str(error) + "\n")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
