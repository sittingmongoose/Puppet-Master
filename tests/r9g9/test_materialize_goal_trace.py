#!/usr/bin/env python3
import io
import json
import os
import copy
import shutil
import stat
import sys
import tempfile
import uuid

import capsule
import materialize
import verify


class _Sink:
    def __init__(self):
        self.buffer = io.BytesIO()


def _event(kind, payload):
    return {"payload": payload, "type": kind}


def _write_trace(path, events):
    raw = b"".join(materialize.canon(event) + b"\n" for event in events)
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_CLOEXEC, 0o664)
    try:
        os.fchmod(fd, 0o664)
        offset = 0
        while offset < len(raw):
            offset += os.write(fd, raw[offset:])
        os.fsync(fd)
    finally:
        os.close(fd)
    return raw


def _trace(admission, case_raw, result, model, effort, route_code, trace_root, serial):
    thread_id = str(uuid.uuid5(uuid.NAMESPACE_URL, "r9-goal-trace-{}".format(serial)))
    turn_id = str(uuid.uuid5(uuid.NAMESPACE_URL, "r9-goal-turn-{}".format(serial)))
    task_path = "/root/" + admission["task_name"]
    metadata = {"turn_id": turn_id}
    common = {
        "login": False,
        "max_output_tokens": 1000,
        "workdir": "/mnt/Cursor/PuppetMaster/tests/r9g9",
        "yield_time_ms": 10000,
    }
    show_args = dict(
        common,
        cmd="python3 -B capsule.py show {} {:04d} {}".format(
            admission["matrix_code"], admission["wave_index"], route_code
        ),
    )
    record_args = dict(
        common,
        cmd="python3 -B capsule.py record {} {:04d} {} '{}'".format(
            admission["matrix_code"], admission["wave_index"], route_code, result
        ),
    )
    if route_code == "b":
        show_args["tty"] = False
        record_args["tty"] = False
    calls = ["goal", "show", "record", "complete"]
    events = [
        _event(
            "session_meta",
            {
                "agent_path": task_path,
                "id": thread_id,
                "parent_thread_id": materialize.PARENT_THREAD_ID,
                "session_id": materialize.PARENT_THREAD_ID,
                "source": {
                    "subagent": {
                        "thread_spawn": {
                            "agent_path": task_path,
                            "depth": 1,
                            "parent_thread_id": materialize.PARENT_THREAD_ID,
                        }
                    }
                },
            },
        ),
        _event("event_msg", {"turn_id": turn_id, "type": "task_started"}),
        _event("turn_context", {"effort": effort, "model": model, "turn_id": turn_id}),
        _event(
            "response_item",
            {
                "arguments": json.dumps({"objective": admission["goal_objective"]}),
                "call_id": calls[0],
                "internal_chat_message_metadata_passthrough": metadata,
                "name": "create_goal",
                "type": "function_call",
            },
        ),
        _event(
            "response_item",
            {
                "call_id": calls[0],
                "internal_chat_message_metadata_passthrough": metadata,
                "output": json.dumps(
                    {
                        "goal": {
                            "objective": admission["goal_objective"],
                            "status": "active",
                            "threadId": thread_id,
                        }
                    }
                ),
                "type": "function_call_output",
            },
        ),
        _event(
            "response_item",
            {
                "arguments": json.dumps(show_args),
                "call_id": calls[1],
                "internal_chat_message_metadata_passthrough": metadata,
                "name": "exec_command",
                "type": "function_call",
            },
        ),
        _event(
            "response_item",
            {
                "call_id": calls[1],
                "internal_chat_message_metadata_passthrough": metadata,
                "output": "Chunk ID: test\nProcess exited with code 0\nOutput:\n" + case_raw.decode("utf-8"),
                "type": "function_call_output",
            },
        ),
        _event(
            "response_item",
            {
                "arguments": json.dumps(record_args),
                "call_id": calls[2],
                "internal_chat_message_metadata_passthrough": metadata,
                "name": "exec_command",
                "type": "function_call",
            },
        ),
        _event(
            "response_item",
            {
                "call_id": calls[2],
                "internal_chat_message_metadata_passthrough": metadata,
                "output": "Chunk ID: test\nProcess exited with code 0\nOutput:\nDONE",
                "type": "function_call_output",
            },
        ),
        _event(
            "response_item",
            {
                "arguments": json.dumps({"status": "complete"}),
                "call_id": calls[3],
                "internal_chat_message_metadata_passthrough": metadata,
                "name": "update_goal",
                "type": "function_call",
            },
        ),
        _event(
            "response_item",
            {
                "call_id": calls[3],
                "internal_chat_message_metadata_passthrough": metadata,
                "output": json.dumps(
                    {
                        "goal": {
                            "objective": admission["goal_objective"],
                            "status": "complete",
                            "threadId": thread_id,
                            "timeUsedSeconds": 1,
                            "tokensUsed": 100,
                        }
                    }
                ),
                "type": "function_call_output",
            },
        ),
        _event("event_msg", {"turn_id": turn_id, "type": "task_complete"}),
    ]
    for index, event in enumerate(events):
        payload = event.get("payload", {})
        if event.get("type") == "response_item" and payload.get("type") in {"function_call", "function_call_output"}:
            payload["id"] = "ri-{}-{}".format(serial, index)
    if route_code == "c":
        complete_value = {
            "goal": {
                "objective": admission["goal_objective"],
                "status": "complete",
                "threadId": thread_id,
                "timeUsedSeconds": 1,
                "tokensUsed": 100,
            }
        }
        active_value = {
            "goal": {
                "objective": admission["goal_objective"],
                "status": "active",
                "threadId": thread_id,
            }
        }
        inputs = [
            'const r = await tools.create_goal({objective:' + json.dumps(admission["goal_objective"]) + '}); text(r)\n',
            'const r = await tools.exec_command({cmd:' + json.dumps(show_args["cmd"]) + ',workdir:' + json.dumps(common["workdir"]) + ',login:false,yield_time_ms:10000,max_output_tokens:1000}); text(r.output)\n',
            'const r = await tools.exec_command({cmd:' + json.dumps(record_args["cmd"]) + ',workdir:' + json.dumps(common["workdir"]) + ',login:false,yield_time_ms:10000,max_output_tokens:1000}); text(r.output)\n',
            'const r = await tools.update_goal({status:"complete"}); text(r)\n',
        ]
        output_texts = [json.dumps(active_value), case_raw.decode("utf-8"), "DONE", json.dumps(complete_value)]
        wrapper_events = events[:3]
        for index, (call_id, input_text, output_text) in enumerate(zip(calls, inputs, output_texts)):
            wrapper_events.append(_event("response_item", {
                "call_id": call_id,
                "id": "ctc-{}-{}".format(serial, index),
                "input": input_text,
                "internal_chat_message_metadata_passthrough": metadata,
                "name": "exec",
                "status": "completed",
                "type": "custom_tool_call",
            }))
            wrapper_events.append(_event("response_item", {
                "call_id": call_id,
                "id": "ctco-{}-{}".format(serial, index),
                "internal_chat_message_metadata_passthrough": metadata,
                "output": [
                    {"text": "Script completed\nWall time 0.0 seconds\nOutput:\n", "type": "input_text"},
                    {"text": output_text, "type": "input_text"},
                ],
                "type": "custom_tool_call_output",
            }))
        wrapper_events.append(events[-1])
        events = wrapper_events
    path = os.path.join(trace_root, "rollout-test-{}.jsonl".format(thread_id))
    _write_trace(path, events)
    return path


def _assembly_test():
    _, public = verify.public_sources()
    scorer = verify.private_scorer()
    expected = {item["cell_index"]: item for item in scorer["cells"]}
    cases = 0
    for entry in public["cells"]:
        cell_file = entry["cell_file"]
        cell = verify.parse(
            verify.read_bound(
                verify.PUBLIC_DIR + "/" + cell_file["path"],
                0o644,
                500_000,
                cell_file["bytes"],
                cell_file["sha256"],
            )
        )
        recipe = cell["assembly_recipe"]
        expected_raw = expected[cell["cell_index"]]["expected_output_utf8"].encode("utf-8")
        if recipe["kind"] == "MODEL_FINAL_CANONICAL_ONE_FIELD_JSON":
            node_results = {recipe["dynamic_node"]: expected_raw}
        elif recipe["kind"] == "DETERMINISTIC_S50_ASSEMBLY_FROM_EIGHT_COMPACT_VERDICTS":
            value = verify.parse(expected_raw)
            verdicts = {item["edge_id"]: item["verdict"] for item in value["edge_verdicts"]}
            node_results = {
                item["verdict_from_compact_node"]: (b"S" if verdicts[item["edge_id"]] == "supported" else b"U")
                for item in recipe["ordered_edge_items"]
            }
        else:
            value = verify.parse(expected_raw)
            code = {"provenance_gap": "P", "authority_conflation": "C", "counterfactual_failure": "K"}[value["classification"]]
            node_results = {recipe["compact_node"]: (("S:" if value["verdict"] == "supported" else "U:") + code).encode("utf-8")}
        if verify.assemble(recipe, node_results) != expected_raw:
            raise AssertionError("assembly mismatch:" + cell["cell"])
        cases += 1
    if cases != 291:
        raise AssertionError("assembly count")
    return cases


def _trace_mutation_test(row_root, sessions):
    admission = verify.parse(verify.read_bound(os.path.join(row_root, "admission.json"), 0o444, 12_000))
    case_raw = verify.read_bound(os.path.join(row_root, "case.txt"), 0o444, 768)
    result_file = verify.read_bound(os.path.join(row_root, "result.txt"), 0o444, 129)
    result, result_raw = verify.validate_result(result_file, admission["result_contract"])
    receipt = verify.parse(verify.read_bound(os.path.join(row_root, "goal_receipt.json"), 0o444, 4096))
    _, events = verify.read_trace(receipt["trace"]["path"], receipt["trace"])
    cases = []
    value = copy.deepcopy(events)
    value.insert(3, _event("response_item", {"call_id": "hidden", "name": "exec", "type": "custom_tool_call"}))
    cases.append(value)
    value = copy.deepcopy(events)
    next(event["payload"] for event in value if event.get("payload", {}).get("type") == "function_call")["name"] = "get_goal"
    cases.append(value)
    value = copy.deepcopy(events)
    next(event["payload"] for event in value if event.get("type") == "turn_context")["effort"] = "low"
    cases.append(value)
    value = copy.deepcopy(events)
    next(event["payload"] for event in value if event.get("payload", {}).get("type") == "task_complete")["turn_id"] = "wrong-turn"
    cases.append(value)
    value = copy.deepcopy(events)
    calls = [event["payload"] for event in value if event.get("payload", {}).get("type") == "function_call"]
    calls[1]["call_id"] = calls[0]["call_id"]
    cases.append(value)
    value = copy.deepcopy(events)
    complete = [event for event in value if event.get("payload", {}).get("type") == "function_call_output"][-1]
    complete["payload"]["output"] = complete["payload"]["output"].replace('"complete"', '"active"')
    cases.append(value)
    value = copy.deepcopy(events)
    show = [event["payload"] for event in value if event.get("payload", {}).get("type") == "function_call"][1]
    arguments = json.loads(show["arguments"])
    arguments["tty"] = True
    show["arguments"] = json.dumps(arguments)
    cases.append(value)
    value = copy.deepcopy(events)
    show = [event["payload"] for event in value if event.get("payload", {}).get("type") == "function_call"][1]
    arguments = json.loads(show["arguments"])
    arguments["shell"] = "/bin/bash"
    show["arguments"] = json.dumps(arguments)
    cases.append(value)
    rejected = 0
    for index, value in enumerate(cases):
        thread_id = receipt["goal_thread_id"]
        path = os.path.join(sessions, "mutation-{}-{}.jsonl".format(index, thread_id))
        raw = _write_trace(path, value)
        mutated = copy.deepcopy(receipt)
        mutated["trace"] = {"bytes": len(raw), "mode": "0664", "path": path, "sha256": materialize.sha(raw)}
        try:
            verify.verify_goal_trace(admission, case_raw, result, result_raw, mutated)
        except verify.Invalid:
            rejected += 1
    if rejected != len(cases):
        raise AssertionError((rejected, len(cases)))
    return rejected


def _wrapper_mutation_test(row_root, sessions):
    admission = verify.parse(verify.read_bound(os.path.join(row_root, "admission.json"), 0o444, 12_000))
    case_raw = verify.read_bound(os.path.join(row_root, "case.txt"), 0o444, 768)
    result_file = verify.read_bound(os.path.join(row_root, "result.txt"), 0o444, 129)
    result, result_raw = verify.validate_result(result_file, admission["result_contract"])
    receipt = verify.parse(verify.read_bound(os.path.join(row_root, "goal_receipt.json"), 0o444, 4096))
    _, events = verify.read_trace(receipt["trace"]["path"], receipt["trace"])
    cases = []
    value = copy.deepcopy(events)
    next(event["payload"] for event in value if event.get("payload", {}).get("type") == "custom_tool_call")["input"] += " "
    cases.append(value)
    value = copy.deepcopy(events)
    next(event["payload"] for event in value if event.get("payload", {}).get("type") == "custom_tool_call")["status"] = "pending"
    cases.append(value)
    value = copy.deepcopy(events)
    next(event["payload"] for event in value if event.get("payload", {}).get("type") == "custom_tool_call")["extra"] = False
    cases.append(value)
    value = copy.deepcopy(events)
    next(event["payload"] for event in value if event.get("payload", {}).get("type") == "custom_tool_call")["input"] = next(event["payload"] for event in value if event.get("payload", {}).get("type") == "custom_tool_call")["input"].replace("tools.create_goal", "tools.get_goal")
    cases.append(value)
    value = copy.deepcopy(events)
    next(event["payload"] for event in value if event.get("payload", {}).get("type") == "custom_tool_call_output")["output"][0]["text"] = "Script completed\nOutput:\n"
    cases.append(value)
    value = copy.deepcopy(events)
    value.insert(3, _event("response_item", {"arguments": "{}", "call_id": "mixed", "id": "mixed", "internal_chat_message_metadata_passthrough": {"turn_id": "mixed"}, "name": "get_goal", "type": "function_call"}))
    cases.append(value)
    rejected = 0
    for index, value in enumerate(cases):
        thread_id = receipt["goal_thread_id"]
        path = os.path.join(sessions, "wrapper-mutation-{}-{}.jsonl".format(index, thread_id))
        raw = _write_trace(path, value)
        mutated = copy.deepcopy(receipt)
        mutated["trace"] = {"bytes": len(raw), "mode": "0664", "path": path, "sha256": materialize.sha(raw)}
        try:
            verify.verify_goal_trace(admission, case_raw, result, result_raw, mutated)
        except verify.Invalid:
            rejected += 1
    if rejected != len(cases):
        raise AssertionError((rejected, len(cases)))
    return rejected


def main():
    parent = os.environ.get("R9_TEST_TEMP_PARENT")
    if parent is not None:
        parent = os.path.realpath(parent)
        info = os.lstat(parent)
        if not stat.S_ISDIR(info.st_mode) or info.st_uid != os.getuid():
            raise AssertionError("bad temp parent")
    root = tempfile.mkdtemp(prefix="r9-goal-trace-", dir=parent)
    old_runs = materialize.RUNS
    old_capsule_runs = capsule.RUNS
    old_session_root = materialize.SESSION_ROOT
    old_verify_session_root = verify.SESSION_ROOT
    old_gate = materialize.MATRIX_009_GATE
    old_stdout = sys.stdout
    try:
        assembly_cases = _assembly_test()
        runs = os.path.join(root, "runs")
        sessions = os.path.join(root, "sessions")
        os.mkdir(runs, 0o700)
        os.mkdir(sessions, 0o700)
        os.chmod(runs, 0o700)
        os.chmod(sessions, 0o700)
        materialize.RUNS = runs
        capsule.RUNS = runs
        materialize.SESSION_ROOT = sessions
        verify.SESSION_ROOT = sessions
        materialize.MATRIX_009_GATE = os.path.join(root, "absent-matrix-009-gate.json")
        try:
            materialize.begin("010")
        except OSError as exc:
            if not isinstance(exc, FileNotFoundError):
                raise
        else:
            raise AssertionError("matrix 010 began without gate")
        sys.stdout = _Sink()
        materialize.begin("009")
        kinds = set()
        representations = set()
        receipts = 0
        for wave in range(22):
            materialize.prepare("009", "{:04d}".format(wave))
            for route_code, (route, model, effort) in capsule.ROUTES.items():
                row_root, admission, case_raw = capsule.validate_admission("009", "{:04d}".format(wave), route_code)
                contract = admission["result_contract"]
                kinds.add(contract["kind"])
                if contract["kind"] == "exact_set":
                    result = contract["values"][0]
                else:
                    result = "x" * contract["min_bytes"]
                capsule.publish(os.path.join(row_root, "result.txt"), result.encode("utf-8") + b"\n")
                trace_path = _trace(
                    admission,
                    case_raw,
                    result,
                    model,
                    effort,
                    route_code,
                    sessions,
                    "{}-{}".format(wave, route_code),
                )
                materialize.attest("009", "{:04d}".format(wave), route_code, trace_path)
                receipt = materialize.parse(materialize.read_bound(os.path.join(row_root, "goal_receipt.json"), 0o444, 4096))
                representations.add(receipt["transport_representation"])
                receipts += 1
        if kinds != {"exact_set", "regex"} or receipts != 66 or representations != {"DIRECT_FUNCTION_CALL_V1", "NESTED_FUNCTIONS_EXEC_V1"}:
            raise AssertionError((kinds, receipts, representations))
        run_root = os.path.join(runs, materialize.MATRICES["009"])
        run = materialize.parse(materialize.read_bound(os.path.join(run_root, "run.json"), 0o444, 4096))
        materialize.seal_locked(run_root, run, 22, 66)
        if sorted(os.listdir(run_root))[-2:] != ["schedule.jsonl", "schedule_offsets.json"]:
            raise AssertionError("unexpected root ordering")
        if not os.path.exists(os.path.join(run_root, "matrix_accounting.json")):
            raise AssertionError("missing accounting")
        _, public = verify.public_sources()
        records, cells = verify.build_schedule("009", public)
        verify.validate_terminal_surface(run_root, run, 22, 66)
        verified = verify.verify_rows(run_root, "009", records, cells, 22, (set(), set(), set()))
        if [len(item) for item in verified[:3]] != [66, 66, 66]:
            raise AssertionError("independent freshness mismatch")
        try:
            verify.verify_rows(run_root, "009", records, cells, 22, ({next(iter(verified[0]))}, set(), set()))
        except verify.Invalid as exc:
            if str(exc) != "global-thread-reuse":
                raise
        else:
            raise AssertionError("prior thread reuse accepted")
        direct_mutation_count = _trace_mutation_test(
            os.path.join(run_root, "rows", "wave-0000", "slot-alpha"), sessions
        )
        wrapper_mutation_count = _wrapper_mutation_test(
            os.path.join(run_root, "rows", "wave-0000", "slot-charlie"), sessions
        )
        try:
            materialize.seal_locked(run_root, run, 22, 66)
        except materialize.Invalid as exc:
            if str(exc) != "seal-root-state":
                raise
        else:
            raise AssertionError("seal replay accepted")
        old_stdout.buffer.write(
            materialize.canon(
                {
                    "goal_receipts": receipts,
                    "assembly_cases": assembly_cases,
                    "disposable_location": "workspace" if parent is not None else "system_tmp",
                    "persistent_workspace_writes": 0,
                    "sealed_prefix_waves": 22,
                    "result_contract_kinds": sorted(kinds),
                    "status": "PASS_DISPOSABLE_DUAL_TRANSPORT_GOAL_TRACE_PREFIX",
                    "direct_trace_mutations_rejected": direct_mutation_count,
                    "trace_mutations_rejected": direct_mutation_count + wrapper_mutation_count,
                    "transport_representations": sorted(representations),
                    "wrapper_trace_mutations_rejected": wrapper_mutation_count,
                }
            )
            + b"\n"
        )
        return 0
    finally:
        sys.stdout = old_stdout
        materialize.RUNS = old_runs
        capsule.RUNS = old_capsule_runs
        materialize.SESSION_ROOT = old_session_root
        verify.SESSION_ROOT = old_verify_session_root
        materialize.MATRIX_009_GATE = old_gate
        shutil.rmtree(root)


if __name__ == "__main__":
    raise SystemExit(main())
