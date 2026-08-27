#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import re
import stat
import sys
from pathlib import Path


SCHEMA = "pw-r9-codex-native-goal-direct-typed-canary-verifier-v1"
MANIFEST_SCHEMA = "pw-r9-codex-native-goal-direct-typed-canary-verifier-manifest-v1"
ATOM_SCHEMA = "pw-r9-codex-native-goal-direct-typed-atom-v1"
CELL_SCHEMA = "pw-r9-codex-native-goal-atomic-cell-dag-v1"
NODE_SCHEMA = "pw-r9-codex-native-goal-atomic-node-v1"
RESULT_SCHEMA = "pw-r9-codex-native-goal-direct-typed-atom-result-v1"
ATOM_MAX = 4096
SPAWN_MAX = 512
FINAL_MAX = 169
UUID_RE = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")


class Invalid(Exception):
    pass


def fail(message):
    raise Invalid(message)


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def canonical_no_lf(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def canonical(value):
    return canonical_no_lf(value) + b"\n"


def unique_object(pairs):
    out = {}
    for key, value in pairs:
        if key in out:
            fail(f"duplicate-key:{key}")
        out[key] = value
    return out


def parse_json(data, where, require_lf=True):
    try:
        value = json.loads(
            data.decode("utf-8"),
            object_pairs_hook=unique_object,
            parse_constant=lambda item: fail(f"nonfinite:{where}:{item}"),
        )
    except Invalid:
        raise
    except Exception as exc:
        fail(f"json:{where}:{type(exc).__name__}")
    if require_lf is not None:
        expected = canonical(value) if require_lf else canonical_no_lf(value)
        if data != expected:
            fail(f"canonical:{where}")
    return value


def exact_keys(value, expected, where):
    if not isinstance(value, dict) or set(value) != set(expected):
        fail(f"fields:{where}")


def confined(root, relative, where):
    if not isinstance(relative, str) or not relative or os.path.isabs(relative):
        fail(f"path:{where}")
    root = root.resolve()
    path = (root / relative).resolve()
    try:
        path.relative_to(root)
    except ValueError:
        fail(f"escape:{where}")
    return path


def read_regular(path, mode, where):
    try:
        resolved = path.resolve(strict=True)
        info = path.lstat()
    except OSError as exc:
        fail(f"stat:{where}:{type(exc).__name__}")
    if resolved != path or not stat.S_ISREG(info.st_mode) or f"{stat.S_IMODE(info.st_mode):04o}" != mode:
        fail(f"type-or-mode:{where}")
    flags = os.O_RDONLY
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    fd = os.open(path, flags)
    try:
        opened = os.fstat(fd)
        if not stat.S_ISREG(opened.st_mode) or (opened.st_dev, opened.st_ino) != (info.st_dev, info.st_ino):
            fail(f"read-custody:{where}")
        chunks = []
        while True:
            chunk = os.read(fd, 1024 * 1024)
            if not chunk:
                break
            chunks.append(chunk)
    finally:
        os.close(fd)
    post = path.lstat()
    if (post.st_dev, post.st_ino, post.st_size, post.st_mtime_ns) != (info.st_dev, info.st_ino, info.st_size, info.st_mtime_ns):
        fail(f"read-drift:{where}")
    return b"".join(chunks)


def read_bound(path, binding, where):
    exact_keys(binding, ("bytes", "mode", "path", "sha256"), where)
    data = read_regular(path, binding["mode"], where)
    if len(data) != binding["bytes"] or sha256(data) != binding["sha256"]:
        fail(f"identity:{where}")
    return data


def read_trace(path, binding, where):
    exact_keys(binding, ("bytes", "mode", "relative_path", "sha256"), where)
    adapted = {"bytes": binding["bytes"], "mode": binding["mode"], "path": binding["relative_path"], "sha256": binding["sha256"]}
    return read_bound(path, adapted, where)


def text_blocks(blocks, where):
    if not isinstance(blocks, list):
        fail(f"blocks:{where}")
    output = []
    for block in blocks:
        if not isinstance(block, dict) or block.get("type") not in {"input_text", "output_text"} or not isinstance(block.get("text"), str):
            fail(f"block:{where}")
        output.append(block["text"])
    return "".join(output)


def strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, list):
        for item in value:
            yield from strings(item)
    elif isinstance(value, dict):
        for item in value.values():
            yield from strings(item)


def custom_kind(source):
    if not isinstance(source, str):
        fail("custom-input")
    needles = {"create_goal": "tools.create_goal(", "exec_command": "tools.exec_command(", "update_goal": "tools.update_goal("}
    found = [name for name, needle in needles.items() if needle in source]
    if len(found) != 1 or source.count("tools.") != 1:
        fail("custom-tool-totality")
    return found[0]


def response_events(records, encoding):
    items = [record["payload"] for record in records if record.get("type") == "response_item" and isinstance(record.get("payload"), dict)]
    events = []
    paired = set()
    for index, payload in enumerate(items):
        ptype = payload.get("type")
        if ptype == "web_search_call":
            fail("web-search")
        if ptype == "function_call":
            if encoding != "function_call_v1":
                fail("mixed-encoding")
            name = payload.get("name")
            call_id = payload.get("call_id")
            source = payload.get("arguments")
            output_type = "function_call_output"
        elif ptype == "custom_tool_call":
            if encoding != "custom_exec_v1" or payload.get("name") != "exec":
                fail("mixed-custom-encoding")
            name = custom_kind(payload.get("input"))
            call_id = payload.get("call_id")
            source = payload.get("input")
            output_type = "custom_tool_call_output"
        else:
            if isinstance(ptype, str) and ptype.endswith("_call"):
                fail(f"unknown-call:{ptype}")
            continue
        if not isinstance(name, str) or not isinstance(call_id, str) or index + 1 >= len(items):
            fail("call")
        output = items[index + 1]
        if output.get("type") != output_type or output.get("call_id") != call_id:
            fail(f"unpaired-output:{name}")
        paired.add(index + 1)
        events.append({"encoding": encoding, "index": index, "input": source, "name": name, "output": output.get("output"), "output_index": index + 1})
    for index, payload in enumerate(items):
        if payload.get("type") in {"function_call_output", "custom_tool_call_output"} and index not in paired:
            fail("orphan-output")
    finals = [(index, item) for index, item in enumerate(items) if item.get("type") == "message" and item.get("role") == "assistant" and item.get("phase") == "final_answer"]
    if len(finals) != 1 or finals[0][0] != len(items) - 1:
        fail("final-position")
    content = finals[0][1].get("content")
    if not isinstance(content, list) or len(content) != 1 or content[0].get("type") != "output_text" or not isinstance(content[0].get("text"), str):
        fail("final-content")
    return items, events, content[0]["text"]


def function_arguments(event, where):
    if event["encoding"] != "function_call_v1":
        return None
    if not isinstance(event["input"], str):
        fail(f"arguments:{where}")
    value = parse_json(event["input"].encode("utf-8"), where, None)
    if not isinstance(value, dict):
        fail(f"arguments-object:{where}")
    return value


def goal_receipt(event, where):
    if event["encoding"] == "function_call_v1":
        if not isinstance(event["output"], str):
            fail(f"goal-output:{where}")
        value = parse_json(event["output"].encode("utf-8"), where, None)
    else:
        joined = text_blocks(event["output"], where)
        candidates = []
        for line in joined.splitlines():
            line = line.strip()
            if not line.startswith("{"):
                continue
            try:
                candidate = parse_json(line.encode("utf-8"), where, None)
            except Invalid:
                continue
            if isinstance(candidate, dict) and isinstance(candidate.get("goal"), dict):
                candidates.append(candidate)
        if len(candidates) != 1:
            fail(f"goal-output-lines:{where}")
        value = candidates[0]
    if not isinstance(value, dict) or not isinstance(value.get("goal"), dict):
        fail(f"goal-receipt:{where}")
    return value["goal"]


def command_from_event(event):
    if event["encoding"] == "function_call_v1":
        command = function_arguments(event, "exec-command").get("cmd")
        if not isinstance(command, str):
            fail("exec-command")
        return command
    source = event["input"]
    match = re.search(r'tools\.exec_command\(\{cmd\s*:\s*("(?:\\.|[^"\\])*")', source)
    if not match:
        fail("custom-exec-command")
    command = parse_json(match.group(1).encode("utf-8"), "custom-command", None)
    if not isinstance(command, str):
        fail("custom-command-type")
    return command


def output_from_event(event, where):
    if event["encoding"] == "function_call_v1":
        if not isinstance(event["output"], str):
            fail(f"output:{where}")
        return event["output"]
    return text_blocks(event["output"], where)


def text_field(value, where):
    if not isinstance(value, dict) or set(value) != {"bytes", "sha256", "utf8"}:
        fail(f"text-field:{where}")
    text = value["utf8"]
    if not isinstance(text, str):
        fail(f"text-type:{where}")
    data = text.encode("utf-8")
    if len(data) != value["bytes"] or sha256(data) != value["sha256"]:
        fail(f"text-identity:{where}")
    return text


def load_cell(data, where):
    cell = parse_json(data, where)
    if not isinstance(cell, dict) or cell.get("schema_id") != CELL_SCHEMA or not isinstance(cell.get("nodes"), list):
        fail(f"cell:{where}")
    by_id = {}
    previous = set()
    for node in cell["nodes"]:
        if not isinstance(node, dict) or node.get("schema_id") != NODE_SCHEMA:
            fail(f"node:{where}")
        atom_id = node.get("atom_id")
        dependencies = node.get("dependencies")
        if not isinstance(atom_id, str) or atom_id in by_id or not isinstance(dependencies, list) or any(item not in previous for item in dependencies):
            fail(f"node-order:{where}")
        by_id[atom_id] = node
        previous.add(atom_id)
    return cell, by_id


def substitute(value, replacements, seen):
    if isinstance(value, dict):
        return {key: substitute(child, replacements, seen) for key, child in value.items()}
    if isinstance(value, list):
        return [substitute(child, replacements, seen) for child in value]
    if isinstance(value, str) and value in replacements:
        seen.add(value)
        return replacements[value]
    return value


def build_atom(cell, node, dependency_results):
    if node.get("dynamic") is True:
        dependencies = node["dependencies"]
        if list(dependency_results) != dependencies:
            fail("dependency-order")
        if len(dependencies) == 1:
            replacements = {"${SUMMARY_RESULT}": dependency_results[dependencies[0]]}
        elif len(dependencies) == 2:
            replacements = {"${LEFT_RESULT}": dependency_results[dependencies[0]], "${RIGHT_RESULT}": dependency_results[dependencies[1]]}
        else:
            fail("dependency-fanin")
        template = node.get("subject_template")
        seen = set()
        materialized = substitute(template["canonical_json_template"], replacements, seen)
        if seen != set(replacements):
            fail("template-placeholders")
        payload = canonical_no_lf(materialized)
        if len(payload) > template["max_payload_bytes"]:
            fail("payload-max")
    else:
        if dependency_results or node.get("dependencies"):
            fail("static-dependency")
        payload = text_field(node["subject_payload"], "payload").encode("utf-8")
    dependencies = []
    for atom_id in node["dependencies"]:
        result = dependency_results[atom_id].encode("utf-8")
        dependencies.append({"atom_id": atom_id, "result_bytes": len(result), "result_sha256": sha256(result)})
    value = {
        "acceptance_criterion": text_field(node["acceptance_criterion"], "acceptance"),
        "atom_id": node["atom_id"],
        "attempt_id": node["attempt_id"],
        "dependencies": dependencies,
        "goal_objective": text_field(node["goal_objective"], "objective"),
        "kind": node["kind"],
        "output_contract": text_field(node["output_contract"], "output"),
        "payload": payload.decode("utf-8"),
        "payload_sha256": sha256(payload),
        "route": cell["route"],
        "schema_id": ATOM_SCHEMA,
    }
    return value, canonical(value)


def spawn_message(goal, relative, atom_data):
    return (
        f"G={goal}\nF={relative}\nB={len(atom_data)}\nH={sha256(atom_data)}\n"
        "First:create_goal(G);require ACTIVE. Then one exec: wc -c F && sha256sum F && "
        "sed -n '1,4096p' F. Require B/H;solve only JSON;update_goal complete;final "
        "R|RESULT|G|threadId. No other tool/read/retry."
    ).encode("utf-8")


def valid_result(node, result):
    if not isinstance(result, str) or not 1 <= len(result.encode("utf-8")) <= 128 or any(char in result for char in "|\r\n"):
        fail("result-bytes")
    kind = node["kind"]
    if kind in {"EVIDENCE_SLICE_LABEL", "ENDPOINT_SLICE_LABEL", "PAIR_SIGNAL_REDUCER"}:
        if len(result.encode("utf-8")) > node["result_max_bytes"] or not re.fullmatch(r"[A-Za-z0-9._:-]+", result):
            fail("result-signal")
    elif kind == "FINAL_OPTION_SELECTOR":
        value = parse_json(result.encode("utf-8"), "result-option", False)
        options = node["subject_template"]["canonical_json_template"].get("o")
        if not isinstance(value, dict) or set(value) != {"selected_choice"} or value["selected_choice"] not in options:
            fail("result-option")
    elif kind == "FINAL_EDGE_VERDICT":
        if parse_json(result.encode("utf-8"), "result-edge", False) not in ({"verdict": "supported"}, {"verdict": "unsupported"}):
            fail("result-edge")
    elif kind == "FINAL_TENSION_VERDICT":
        value = parse_json(result.encode("utf-8"), "result-tension", False)
        if not isinstance(value, dict) or set(value) != {"preserve_boundary"} or not isinstance(value["preserve_boundary"], bool):
            fail("result-tension")
    elif kind == "FINAL_EDGE_VERDICT_PER_EDGE":
        if result not in {"S", "U"}:
            fail("result-per-edge")
    elif kind == "FINAL_SPECIALIST_CODE":
        if not re.fullmatch(r"[SU]:[A-Z0-9]", result):
            fail("result-specialist")
    else:
        fail("result-kind")


def verify_trace(case, atom_data, atom_path, session_root):
    trace_path = confined(session_root, case["trace"]["relative_path"], "trace")
    trace_data = read_trace(trace_path, case["trace"], "trace")
    if not trace_data.endswith(b"\n"):
        fail("trace-terminal-lf")
    records = []
    for number, raw in enumerate(trace_data.splitlines(), 1):
        if not raw:
            fail(f"trace-empty:{number}")
        records.append(parse_json(raw, f"trace-{number}", None))
    metas = [item.get("payload") for item in records if item.get("type") == "session_meta"]
    if len(metas) != 1 or not isinstance(metas[0], dict):
        fail("session-meta")
    meta = metas[0]
    source = meta.get("source", {}).get("subagent", {}).get("thread_spawn", {})
    if meta.get("id") != case["goal_thread_id"] or source.get("agent_path") != case["task_path"] or source.get("depth") != 1:
        fail("session-identity")
    items, events, final_text = response_events(records, case["physical_encoding"])
    if [item["name"] for item in events] != ["create_goal", "exec_command", "update_goal"]:
        fail("semantic-tool-order")
    create, execute, update = events
    if create["encoding"] == "function_call_v1":
        if function_arguments(create, "create-goal") != {"objective": case["goal_objective"]}:
            fail("create-goal-arguments")
    elif create["input"].count(case["goal_objective"]) != 1 or "token_budget" in create["input"]:
        fail("custom-create-goal")
    active = goal_receipt(create, "active")
    if active.get("threadId") != case["goal_thread_id"] or active.get("objective") != case["goal_objective"] or active.get("status") != "active":
        fail("active-goal")
    relative = case["atom"]["path"]
    absolute = str(atom_path)
    command = command_from_event(execute)
    allowed = {
        f"wc -c {relative} && sha256sum {relative} && sed -n '1,4096p' {relative}",
        f"wc -c {absolute} && sha256sum {absolute} && sed -n '1,4096p' {absolute}",
    }
    if command not in allowed:
        fail("atom-command-grammar")
    output = output_from_event(execute, "atom-read")
    atom_line = atom_data.decode("utf-8")[:-1]
    if output.count(atom_line) != 1 or str(len(atom_data)) not in output or sha256(atom_data) not in output:
        fail("atom-output")
    occurrences = [index for index, payload in enumerate(items) if any(atom_line in text for text in strings(payload))]
    if not occurrences or min(occurrences) != execute["output_index"]:
        fail("atom-before-active-or-read")
    if update["encoding"] == "function_call_v1":
        if function_arguments(update, "update-goal") != {"status": "complete"}:
            fail("update-goal-arguments")
    elif not re.search(r'tools\.update_goal\(\{status\s*:\s*"complete"\}\)', update["input"]):
        fail("custom-update-goal")
    complete = goal_receipt(update, "complete")
    if complete.get("threadId") != case["goal_thread_id"] or complete.get("objective") != case["goal_objective"] or complete.get("status") != "complete":
        fail("complete-goal")
    if final_text != case["final_envelope"] or len(final_text.encode("utf-8")) > FINAL_MAX:
        fail("final-envelope")
    return final_text


def verify_case(case, workspace, session_root, prior_results):
    expected = {
        "atom", "atom_id", "case_id", "cell", "dependency_case_ids", "final_envelope", "goal_objective",
        "goal_thread_id", "ordinal", "physical_encoding", "requested_model", "requested_reasoning_effort",
        "result_record", "route", "spawn_message", "task_path", "trace",
    }
    exact_keys(case, expected, "case")
    cell_path = confined(workspace, case["cell"]["path"], "cell")
    cell_data = read_bound(cell_path, case["cell"], "cell")
    cell, by_id = load_cell(cell_data, "cell")
    node = by_id.get(case["atom_id"])
    if node is None or cell.get("route") != case["route"] or node["goal_objective"]["utf8"] != case["goal_objective"]:
        fail("case-owner")
    dependency_results = {}
    expected_dependency_cases = []
    for dependency_atom in node["dependencies"]:
        key = (case["route"], dependency_atom)
        if key not in prior_results:
            fail("dependency-not-prior")
        expected_dependency_cases.append(prior_results[key]["case_id"])
        dependency_results[dependency_atom] = prior_results[key]["result"]
    if case["dependency_case_ids"] != expected_dependency_cases:
        fail("dependency-case-ids")
    expected_atom, expected_atom_data = build_atom(cell, node, dependency_results)
    atom_path = confined(workspace, case["atom"]["path"], "atom")
    atom_data = read_bound(atom_path, case["atom"], "atom")
    if len(atom_data) > ATOM_MAX or atom_data != expected_atom_data or parse_json(atom_data, "atom") != expected_atom:
        fail("atom-rederivation")
    spawn_path = confined(workspace, case["spawn_message"]["path"], "spawn")
    spawn_data = read_bound(spawn_path, case["spawn_message"], "spawn")
    expected_spawn = spawn_message(case["goal_objective"], case["atom"]["path"], atom_data)
    if len(spawn_data) > SPAWN_MAX or spawn_data != expected_spawn:
        fail("spawn-rederivation")
    final = verify_trace(case, atom_data, atom_path, session_root)
    result_path = confined(workspace, case["result_record"]["path"], "result-record")
    result_data = read_bound(result_path, case["result_record"], "result-record")
    result = parse_json(result_data, "result-record")
    exact_keys(result, ("atom_id", "final_envelope", "goal_thread_id", "matrix_id", "result_bytes", "result_sha256", "result_utf8", "route", "schema_id", "task_path", "trace"), "result-record")
    if result.get("schema_id") != RESULT_SCHEMA or result.get("atom_id") != case["atom_id"] or result.get("matrix_id") != cell["matrix_id"] or result.get("route") != case["route"]:
        fail("result-owner")
    if result.get("goal_thread_id") != case["goal_thread_id"] or result.get("task_path") != case["task_path"] or result.get("trace") != case["trace"]:
        fail("result-provenance")
    if result.get("final_envelope") != final or final != f"R|{result.get('result_utf8')}|G|{case['goal_thread_id']}":
        fail("result-envelope")
    encoded_result = result["result_utf8"].encode("utf-8")
    if len(encoded_result) != result.get("result_bytes") or sha256(encoded_result) != result.get("result_sha256"):
        fail("result-identity")
    valid_result(node, result["result_utf8"])
    return {"case_id": case["case_id"], "result": result["result_utf8"], "route": case["route"], "atom_id": case["atom_id"]}


def closed_run_inventory(run_root, cases, workspace):
    try:
        root_info = run_root.lstat()
    except OSError as exc:
        fail(f"run-root:{type(exc).__name__}")
    if not stat.S_ISDIR(root_info.st_mode) or stat.S_ISLNK(root_info.st_mode):
        fail("run-root-type")
    expected = set()
    for case in cases:
        for field in ("atom", "spawn_message", "result_record"):
            path = confined(workspace, case[field]["path"], field)
            try:
                relative = path.relative_to(run_root).as_posix()
            except ValueError:
                fail("run-root-member")
            expected.add(relative)
    observed = set()
    for parent, directories, files in os.walk(run_root, followlinks=False):
        parent_path = Path(parent)
        for name in directories:
            child = parent_path / name
            if child.is_symlink() or not child.is_dir():
                fail("run-directory")
        for name in files:
            child = parent_path / name
            if child.is_symlink() or not child.is_file():
                fail("run-file")
            observed.add(child.relative_to(run_root).as_posix())
    if observed != expected:
        fail("run-inventory")


def run(args):
    manifest_path = Path(args.manifest)
    workspace = Path(args.workspace_root)
    session_root = Path(args.session_root)
    for path, where in ((manifest_path, "manifest"), (workspace, "workspace"), (session_root, "session-root")):
        if not path.is_absolute():
            fail(f"absolute:{where}")
    manifest = parse_json(read_regular(manifest_path, "0644", "manifest"), "manifest")
    exact_keys(manifest, ("bindings", "cases", "qualification", "run_id", "run_root", "schema_id"), "manifest")
    if manifest["schema_id"] != MANIFEST_SCHEMA or manifest["run_id"] != "codex-native-goal-direct-canary-002":
        fail("manifest-schema-or-run")
    if manifest["qualification"] != {"credit": 0, "current_streak": 0, "current_value": "0/2"}:
        fail("qualification")
    exact_keys(manifest["bindings"], ("derivation_validation", "materializer", "plan_inventory"), "bindings")
    base = manifest_path.parent.resolve()
    for name, binding in manifest["bindings"].items():
        data = read_bound(confined(base, binding["path"], f"binding-{name}"), binding, f"binding-{name}")
        if name != "materializer":
            value = parse_json(data, f"binding-{name}")
            if name == "derivation_validation" and value.get("status") != "PASS_MECHANICAL_EXECUTABLE_DERIVATION_ZERO_CREDIT_NO_IMPLEMENTATION_OR_LAUNCH_AUTHORITY":
                fail("derivation-validation-status")
            if name == "plan_inventory" and value.get("status") != "PASS_PATH_NEUTRAL_CANARY_PLAN_INVENTORY_ZERO_CREDIT_NO_LAUNCH_AUTHORITY":
                fail("plan-inventory-status")
    cases = manifest["cases"]
    if not isinstance(cases, list) or len(cases) != 9:
        fail("case-count")
    roster = [(case.get("route"), case.get("requested_model"), case.get("requested_reasoning_effort"), case.get("atom_id")) for case in cases]
    expected_roster = []
    for route, model, effort in (
        ("slot-alpha", "gpt-5.4-mini", "xhigh"),
        ("slot-bravo", "gpt-5.4-mini", "medium"),
        ("slot-charlie", "gpt-5.6-luna", "medium"),
    ):
        expected_roster.extend((route, model, effort, atom_id) for atom_id in ("n00000", "n00001", "n00011"))
    if roster != expected_roster or [case.get("ordinal") for case in cases] != list(range(1, 10)):
        fail("route-roster")
    for field in ("case_id", "goal_thread_id", "task_path"):
        values = [case.get(field) for case in cases]
        if len(set(values)) != 9:
            fail(f"reuse:{field}")
    for field in ("atom", "spawn_message", "result_record", "trace"):
        key = "relative_path" if field == "trace" else "path"
        values = [case.get(field, {}).get(key) for case in cases]
        if len(set(values)) != 9:
            fail(f"path-reuse:{field}")
    run_root = confined(workspace, manifest["run_root"], "run-root")
    closed_run_inventory(run_root, cases, workspace)
    prior = {}
    results = []
    for case in cases:
        verified = verify_case(case, workspace.resolve(), session_root.resolve(), prior)
        key = (verified["route"], verified["atom_id"])
        if key in prior:
            fail("atom-reuse")
        prior[key] = verified
        results.append({"atom_id": verified["atom_id"], "case_id": verified["case_id"], "route": verified["route"], "status": "PASS"})
    closed_run_inventory(run_root, cases, workspace)
    return {
        "case_count": 9,
        "cases": results,
        "first_mismatch": None,
        "qualification_credit": 0,
        "schema_id": SCHEMA,
        "spawn_plaintext_trace_attested": False,
        "status": "PASS_ZERO_CREDIT_CANARY_MECHANICS_ONLY",
        "workspace_writes": 0,
    }


def main():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--workspace-root", required=True)
    parser.add_argument("--session-root", required=True)
    parser.add_argument("--check", action="store_true")
    args, extra = parser.parse_known_args()
    try:
        if extra or not args.check:
            fail("CLI")
        output = run(args)
        code = 0
    except (Invalid, OSError, ValueError, TypeError, KeyError) as exc:
        output = {
            "case_count": 0,
            "first_mismatch": str(exc),
            "qualification_credit": 0,
            "schema_id": SCHEMA,
            "status": "FAIL_ZERO_CREDIT_NO_LAUNCH_AUTHORITY",
            "workspace_writes": 0,
        }
        code = 1
    sys.stdout.buffer.write(canonical(output))
    return code


if __name__ == "__main__":
    raise SystemExit(main())
