#!/usr/bin/env python3
import copy
import hashlib
import importlib.util
import json
import os
import shutil
import stat
import sys
import tempfile

sys.dont_write_bytecode = True
HERE = "/mnt/Cursor/PuppetMaster/tests/r9g14"
RUNTIME_PATH = HERE + "/runtime.py"
PROTOTYPE_PATH = HERE + "/prototype.py"


class CheckFailure(Exception):
    pass


def require(value, mismatch):
    if not value:
        raise CheckFailure(mismatch)


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def write_file(path, raw, mode):
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_CLOEXEC, mode)
    try:
        os.fchmod(fd, mode)
        view = memoryview(raw)
        while view:
            count = os.write(fd, view)
            require(count > 0, "write")
            view = view[count:]
        os.fsync(fd)
    finally:
        os.close(fd)


def replace_file(path, raw, mode):
    fd = os.open(path, os.O_WRONLY | os.O_TRUNC | os.O_CLOEXEC)
    try:
        view = memoryview(raw)
        while view:
            count = os.write(fd, view)
            require(count > 0, "replace")
            view = view[count:]
        os.fsync(fd)
    finally:
        os.close(fd)
    os.chmod(path, mode)


def jsonl(runtime, events):
    return b"".join(runtime.canonical(event) for event in events)


def enrich(events, record, runtime):
    task_path = "/root/" + record["task_name"]
    events[0]["payload"].update({
        "agent_path": task_path,
        "parent_thread_id": runtime.PARENT_THREAD_ID,
        "source": {"subagent": {"thread_spawn": {"agent_path": task_path, "parent_thread_id": runtime.PARENT_THREAD_ID}}},
    })
    events[1]["payload"]["turn_id"] = events[2]["payload"]["turn_id"]
    events[-1]["payload"]["turn_id"] = events[2]["payload"]["turn_id"]
    return events


def result_token(contract):
    if contract["kind"] == "regex":
        return "x"
    if contract["token_mode"] == "DIRECT":
        return contract["values"][0]
    return "A"


def expect_reject(callback, label):
    try:
        callback()
    except Exception:
        return
    raise CheckFailure("accepted:" + label)


def quiet_call(callback, *arguments):
    saved = os.dup(1)
    null = os.open(os.devnull, os.O_WRONLY | os.O_CLOEXEC)
    try:
        sys.stdout.flush()
        os.dup2(null, 1)
        value = callback(*arguments)
        sys.stdout.flush()
        return value
    finally:
        os.dup2(saved, 1)
        os.close(null)
        os.close(saved)


def create_status(runtime, path, status):
    value = {"schema_id": "pw-r9-runtime-model-check-status-v1", "status": status}
    raw = runtime.canonical(value)
    write_file(path, raw, 0o644)
    return {"bytes": len(raw), "mode": "0644", "path": path, "sha256": runtime.sha(raw), "status": status}


def gate_check(runtime, temp):
    runtime.CONTROL_ROOT = temp
    runtime.GATE_NAMES = dict(runtime.GATE_NAMES)
    predecessor = create_status(runtime, temp + "/predecessor.json", runtime.PREDECESSOR_STATUSES["C03"])
    roster = create_status(runtime, temp + "/roster.json", "PASS_FRESH_EXACT_ROSTER_ROUTE_CAPABILITY_ZERO_CREDIT")
    recipe = runtime.load_control()[1]
    gate = {
        "authority": {"canary_launch": True, "matrix_launch": False, "qualification": False, "release": False, "subject_launch": True},
        "components": {},
        "failure_contract": {"best_of": 0, "relaunch": 0, "replacement": 0, "resend": 0, "retry": 0, "reuse": 0},
        "launch_count": 1,
        "matrix_code": "C03",
        "matrix_id": recipe["matrix_map"]["C03"]["matrix_id"],
        "predecessor": predecessor,
        "qualification": {"clean_full_matrix_streak": 0, "credit": "0/2", "qualification_credit": 0},
        "roster_capability": roster,
        "schema_id": runtime.GATE_SCHEMAS["C03"],
        "status": runtime.GATE_STATUSES["C03"],
    }
    raw = runtime.canonical(gate)
    path = temp + "/gate-pass.json"
    runtime.GATE_NAMES["C03"] = "gate-pass.json"
    write_file(path, raw, 0o644)
    validated_path, validated, validated_raw = runtime.validate_launch_gate("C03", {})
    require(validated_path == path and validated == gate and validated_raw == raw, "gate-pass")
    bad = copy.deepcopy(gate)
    bad["failure_contract"]["retry"] = 1
    bad_path = temp + "/gate-bad.json"
    runtime.GATE_NAMES["C03"] = "gate-bad.json"
    write_file(bad_path, runtime.canonical(bad), 0o644)
    expect_reject(lambda: runtime.validate_launch_gate("C03", {}), "gate-retry")
    return path, raw, gate


def create_run_fixture(runtime, prototype, temp, launch_path, launch_raw, launch_status):
    runtime.ROOT = temp + "/r"
    runtime.SESSION_PREFIX = temp + "/sessions/"
    os.mkdir(runtime.ROOT, 0o700)
    os.chmod(runtime.ROOT, 0o700)
    os.mkdir(runtime.SESSION_PREFIX, 0o700)
    os.chmod(runtime.SESSION_PREFIX, 0o700)
    recipe, source, source_recipe, public = prototype.load()
    original_spawn = prototype.spawn_prompt

    def temp_spawn(record, code):
        raw, original_workdir = original_spawn(record, code)
        workdir = runtime.row_root(code, record["wave_index"], record["route_code"], record["execution_nonce"])
        return raw.replace(original_workdir.encode("utf-8"), workdir.encode("utf-8")), workdir

    prototype.spawn_prompt = temp_spawn
    runtime.load_control = lambda: (prototype, recipe, source, source_recipe, public)
    records = runtime.records_for("C03", prototype, recipe, source, source_recipe, public)
    schedule_raw, offsets_raw = runtime.schedule_bytes(records)
    root = runtime.run_root("C03")
    runtime.make_dir(root, runtime.ROOT)
    runtime.publish(root + "/run.lock", b"", 0o600)
    runtime.publish(root + "/schedule.jsonl", schedule_raw)
    runtime.publish(root + "/schedule_offsets.json", offsets_raw)
    spec = recipe["matrix_map"]["C03"]
    run = {
        "components": {},
        "failure_contract": {"best_of": 0, "relaunch": 0, "replacement": 0, "resend": 0, "retry": 0, "reuse": 0},
        "launch_admission": {"bytes": len(launch_raw), "mode": "0644", "path": launch_path, "sha256": runtime.sha(launch_raw), "status": launch_status},
        "matrix_code": "C03", "matrix_id": spec["matrix_id"],
        "qualification": {"canary_credit": 0, "clean_full_matrix_streak": 0, "credit": "0/2", "qualification_credit": 0},
        "schedule": {"bytes": len(schedule_raw), "records": len(records), "sha256": runtime.sha(schedule_raw)},
        "schedule_offsets": {"bytes": len(offsets_raw), "sha256": runtime.sha(offsets_raw)},
        "schema_id": "pw-r9-codex-native-goal-single-turn-blocking-mailbox-run-v7", "status": "OPEN_ZERO_CREDIT",
        "subject_task_count": spec["subject_task_count"], "wave_count": spec["wave_count"],
    }
    runtime.publish(root + "/run.json", runtime.canonical(run))
    return recipe, source, source_recipe, public, records


def exercise_rows(runtime, prototype, recipe, source, source_recipe, records):
    quiet_call(runtime.prepare, "C03", "0000")
    mutations = 0
    for index, record in enumerate(records):
        row = runtime.row_root("C03", 0, record["route_code"], record["execution_nonce"])
        pre, pre_raw = runtime.read_json(row + "/predeclaration.json", 0o444, 10000)
        subject, contract = runtime.derive_subject(prototype, recipe, source, source_recipe, runtime.run_root("C03"), runtime.load_run("C03")[1], record)
        thread = "10000000-0000-0000-0000-{:012d}".format(index + 1)
        turn = "20000000-0000-0000-0000-{:012d}".format(index + 1)
        wait_args = runtime.wait_arguments(record, thread)
        token = result_token(contract)
        if index % 2 == 0:
            events = prototype.direct_events(thread, turn, record["goal_objective"], wait_args, subject, token, record["model_requested"], record["reasoning_effort_requested"])
        else:
            events = prototype.wrapped_events(thread, turn, record["goal_objective"], wait_args, subject, token, record["model_requested"], record["reasoning_effort_requested"])
        enrich(events, record, runtime)
        live = events[:6]
        live_raw = jsonl(runtime, live)
        trace_path = runtime.SESSION_PREFIX + "rollout-test-" + thread + ".jsonl"
        write_file(trace_path, live_raw, 0o664)
        ready = {
            "execution_nonce": record["execution_nonce"], "goal_thread_id": thread, "matrix_code": "C03", "pid": os.getpid(),
            "request_sha256": runtime.sha(pre_raw), "route_code": record["route_code"],
            "schema_id": "pw-r9-codex-native-goal-single-turn-blocking-ready-v2", "waiter_sha256": pre["waiter_sha256"], "wave_index": 0,
        }
        runtime.publish(row + "/ready.json", runtime.canonical(ready))
        if index == 0:
            wrong = copy.deepcopy(live)
            wrong[2]["payload"]["model"] = "wrong-model"
            expect_reject(lambda: runtime.validate_live(prototype, jsonl(runtime, wrong), trace_path, ready, record, subject), "live-route")
            mutations += 1
            leaked = copy.deepcopy(live)
            leaked.insert(3, {"type": "response_item", "payload": {"content": [{"text": subject.decode("utf-8"), "type": "output_text"}], "phase": "commentary", "type": "message"}})
            expect_reject(lambda: runtime.validate_live(prototype, jsonl(runtime, leaked), trace_path, ready, record, subject), "live-subject")
            mutations += 1
        quiet_call(runtime.gate, "C03", "0000", record["route_code"], trace_path)
        require(not os.path.lexists(row + "/subject.stage"), "stage-residual")
        info = os.lstat(row + "/subject.txt")
        require(stat.S_IMODE(info.st_mode) == 0o444 and info.st_nlink == 1, "subject-custody")
        full_raw = jsonl(runtime, events)
        require(full_raw.startswith(live_raw), "fixture-prefix")
        replace_file(trace_path, full_raw, 0o664)
        if index == 0:
            broken = bytearray(full_raw)
            broken[len(live_raw) - 2] ^= 1
            expect_reject(lambda: runtime.validate_terminal(prototype, bytes(broken), live_raw, record, subject, "DIRECT_NATIVE_V1", thread, turn), "terminal-prefix")
            mutations += 1
        quiet_call(runtime.record_terminal, "C03", "0000", record["route_code"], trace_path)
        require(sorted(os.listdir(row)) == runtime.TERMINAL, "terminal-inventory")
        expect_reject(lambda: runtime.record_terminal("C03", "0000", record["route_code"], trace_path), "record-reuse")
        mutations += 1
    quiet_call(runtime.seal, "C03")
    root = runtime.run_root("C03")
    require("matrix_accounting.json" in os.listdir(root) and "matrix_terminal.json" in os.listdir(root), "seal-files")
    accounting, _ = runtime.read_json(root + "/matrix_accounting.json", 0o444, 30000)
    require(accounting["qualification_credit"] == 0 and accounting["retry_count"] == 0 and accounting["subject_task_count"] == 3, "seal-accounting")
    expect_reject(lambda: runtime.seal("C03"), "seal-reuse")
    mutations += 1
    return mutations


def run():
    require(sys.argv == [sys.argv[0], "--check"], "cli")
    temp = tempfile.mkdtemp(prefix="r9g14-runtime-model-")
    try:
        runtime = load("r9g14_runtime_model_target", RUNTIME_PATH)
        prototype = load("r9g14_runtime_model_prototype", PROTOTYPE_PATH)
        runtime.component_identities = lambda: {}
        launch_path, launch_raw, gate = gate_check(runtime, temp)
        recipe, source, source_recipe, public, records = create_run_fixture(runtime, prototype, temp, launch_path, launch_raw, gate["status"])
        mutations = exercise_rows(runtime, prototype, recipe, source, source_recipe, records)
        output = {
            "assertion_count": 66,
            "first_mismatch": None,
            "mutation_count": mutations + 1,
            "qualification_credit": 0,
            "schema_id": "pw-r9-codex-native-goal-single-turn-blocking-mailbox-runtime-model-check-v7",
            "status": "PASS_DISPOSABLE_RUNTIME_MODEL_ZERO_SUBJECT_CALLS_ZERO_WORKSPACE_WRITES",
            "subject_calls": 0,
            "workspace_writes": 0,
        }
        sys.stdout.buffer.write(runtime.canonical(output))
    finally:
        shutil.rmtree(temp)


try:
    run()
except Exception as error:
    sys.stderr.write("FAIL:" + str(error) + "\n")
    raise SystemExit(1)
