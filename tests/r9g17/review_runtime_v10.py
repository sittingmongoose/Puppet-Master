#!/usr/bin/env python3
import hashlib
import json
import os
import stat
import sys
import types

sys.dont_write_bytecode = True
HERE = "/mnt/Cursor/PuppetMaster/tests/r9g17"
ROOT = HERE + "/r"
BASE_PATH = "/mnt/Cursor/PuppetMaster/tests/r9g16/review_runtime.py"
BASE_BYTES = 32654
BASE_SHA256 = "d5dac0c62287a4d86ef1f23b12aac62eb3859f157a679dc57b143a7316decfcb"
CODEC_PATH = HERE + "/native_envelope.py"
CODEC_BYTES = 4661
CODEC_SHA256 = "d2aef9d619f6c4ec779e6d2dce2d1b6fc89282fd91cc4b9f56bc82490df0f246"
CODEC_CHECK_PATH = HERE + "/native_envelope_check.py"
CODEC_CHECK_BYTES = 9771
CODEC_CHECK_SHA256 = "9a1ba80c2c97344cbd5655f9313d3a404f3e2d8e45301e2b10fbdf06b6151487"
ARCHITECTURE_PATH = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_observed_envelope_atomic_review_v10.json"
ARCHITECTURE_BYTES = 3783
ARCHITECTURE_SHA256 = "c7851a467a2328707e8ebfd2b31db5865543d82193ec5ded195903a5929aab71"
WAITER_PATH = HERE + "/wait.py"
WAITER_BYTES = 7317
WAITER_SHA256 = "58dad14f0ef52f37d3599e84ffd522b4150930537c380d658d15657e1830ab53"
VERIFIER_PATH = HERE + "/review_offline_verify_v10.py"
VALIDATION_PATH = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_observed_envelope_atomic_review_v10_data_only_validation_v2.json"
FAILURE_PATH = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_atomic_architecture_review_v9_a01_runtime_failure_receipt_v1.json"
FAILURE_BYTES = 3712
FAILURE_SHA256 = "66b274e690eaada233dfc7465fc0c406397ce01cf7ff55211ab625465bcefc58"
ADMISSION_PATH = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_observed_envelope_atomic_review_v10_launch_admission_v1.json"


def module(name, path, size, digest):
    before = os.lstat(path)
    if not stat.S_ISREG(before.st_mode) or stat.S_IMODE(before.st_mode) != 0o644 or before.st_uid != os.getuid() or before.st_nlink != 1 or before.st_size != size:
        raise RuntimeError("module-identity:" + path)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        opened = os.fstat(fd)
        if (opened.st_dev, opened.st_ino, opened.st_size) != (before.st_dev, before.st_ino, before.st_size):
            raise RuntimeError("module-race:" + path)
        raw = b""
        while len(raw) < size:
            part = os.read(fd, size - len(raw))
            if not part:
                raise RuntimeError("module-short:" + path)
            raw += part
        if os.read(fd, 1) != b"":
            raise RuntimeError("module-trailing:" + path)
    finally:
        os.close(fd)
    after = os.lstat(path)
    if (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns) != (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) or hashlib.sha256(raw).hexdigest() != digest:
        raise RuntimeError("module-drift:" + path)
    value = types.ModuleType(name)
    value.__file__ = path
    exec(compile(raw, path, "exec"), value.__dict__)
    return value


base = module("r9g17_frozen_v9_runtime_source", BASE_PATH, BASE_BYTES, BASE_SHA256)
codec = module("r9g17_native_envelope", CODEC_PATH, CODEC_BYTES, CODEC_SHA256)
base.ROOT = ROOT
base.ARCHITECTURE_PATH = ARCHITECTURE_PATH
base.ARCHITECTURE_BYTES = ARCHITECTURE_BYTES
base.ARCHITECTURE_SHA256 = ARCHITECTURE_SHA256
base.WAITER_PATH = WAITER_PATH
base.WAITER_BYTES = WAITER_BYTES
base.WAITER_SHA256 = WAITER_SHA256
base.ADMISSION_PATH = ADMISSION_PATH


def load_control():
    recipe_raw = base.read_bound(base.RECIPE_PATH, 0o644, base.RECIPE_BYTES, base.RECIPE_BYTES, base.RECIPE_SHA256)
    recipe = base.parse(recipe_raw)
    base.require(recipe_raw == base.canonical(recipe), "recipe-canonical")
    base.read_bound(base.CHECKER_PATH, 0o644, base.CHECKER_BYTES, base.CHECKER_BYTES, base.CHECKER_SHA256)
    architecture_raw = base.read_bound(ARCHITECTURE_PATH, 0o644, ARCHITECTURE_BYTES, ARCHITECTURE_BYTES, ARCHITECTURE_SHA256)
    architecture = base.parse(architecture_raw)
    base.require(architecture_raw == base.canonical(architecture), "architecture-canonical")
    base.require(architecture["status"] == "FROZEN_PROPOSED_OBSERVED_NATIVE_ENVELOPE_REVIEW_ZERO_CREDIT_NO_LAUNCH_AUTHORITY" and architecture["authority"]["review_launch"] is False, "architecture-status")
    skill_raw = base.read_bound(base.SKILL_PATH, 0o644, base.SKILL_BYTES, base.SKILL_BYTES, base.SKILL_SHA256)
    waiter_raw = base.read_bound(WAITER_PATH, 0o644, WAITER_BYTES, WAITER_BYTES, WAITER_SHA256)
    base.read_bound(CODEC_PATH, 0o644, CODEC_BYTES, CODEC_BYTES, CODEC_SHA256)
    base.read_bound(CODEC_CHECK_PATH, 0o644, CODEC_CHECK_BYTES, CODEC_CHECK_BYTES, CODEC_CHECK_SHA256)
    failure_raw = base.read_bound(FAILURE_PATH, 0o644, FAILURE_BYTES, FAILURE_BYTES, FAILURE_SHA256)
    failure = base.parse(failure_raw)
    base.require(failure_raw == base.canonical(failure) and failure["status"] == "FAIL_PERMANENT_V9_A01_ZERO_SUBJECT_ZERO_CREDIT_REMAINING_REVIEW_FROZEN", "failure-lineage")
    prototype = base.load_module("r9g17_v8_trace_projection_source", base.PROTOTYPE_PATH, base.PROTOTYPE_BYTES, base.PROTOTYPE_SHA256)
    return recipe, architecture, skill_raw, waiter_raw, prototype


def atom_record(recipe, atom_id):
    base.require(base.ATOM_RE.fullmatch(atom_id or ""), "atom-id")
    atom = next((item for item in recipe["atoms"] if item["id"] == atom_id), None)
    base.require(atom is not None, "atom-missing")
    nonce = base.sha(b"pw-r9-cg10-observed-envelope-review\0" + ARCHITECTURE_SHA256.encode("ascii") + b"\0" + atom_id.encode("ascii"))
    return atom, {"atom_id": atom_id, "goal_objective": "CG10R|a={}|x={}|once".format(atom_id, nonce), "model_requested": base.MODEL, "reasoning_effort_requested": base.EFFORT, "review_nonce": nonce, "task_name": "r9_cg10r_" + nonce}


def predeclaration(record, subject):
    return {"architecture_sha256": ARCHITECTURE_SHA256, "atom_id": record["atom_id"], "bootstrap_skill_sha256": base.SKILL_SHA256, "goal_objective": record["goal_objective"], "model_requested": base.MODEL, "reasoning_effort_requested": base.EFFORT, "recipe_sha256": base.RECIPE_SHA256, "review_nonce": record["review_nonce"], "schema_id": "pw-r9-codex-native-goal-observed-envelope-review-predeclaration-v10", "subject_bytes": len(subject), "subject_sha256": base.sha(subject), "task_path": "/root/" + record["task_name"], "waiter_bytes": WAITER_BYTES, "waiter_sha256": WAITER_SHA256}


def validate_admission():
    gate, raw = base.read_json(ADMISSION_PATH, 0o644, 40000)
    base.require(set(gate) == {"atom_sequence", "authority", "components", "failure_contract", "qualification", "review_route", "schema_id", "status"}, "admission-fields")
    base.require(gate["schema_id"] == "pw-r9-codex-native-goal-observed-envelope-atomic-review-v10-launch-admission-v1" and gate["status"] == "AUTHORIZE_EXACT_18_ATOM_V10_GOAL_REVIEW_ONCE_ZERO_CREDIT", "admission-status")
    base.require(gate["authority"] == {"canary_launch": False, "implementation": False, "matrix_launch": False, "qualification": False, "release": False, "review_launch": True, "subject_launch": False}, "admission-authority")
    base.require(gate["atom_sequence"] == ["A{:02d}".format(index) for index in range(1, 19)], "admission-atoms")
    base.require(gate["review_route"] == {"fresh_goal_per_atom": True, "model": base.MODEL, "reasoning_effort": base.EFFORT, "task_reuse": 0}, "admission-route")
    base.require(gate["failure_contract"] == {"best_of": 0, "relaunch": 0, "replacement": 0, "resend": 0, "retry": 0, "reuse": 0}, "admission-failure")
    base.require(gate["qualification"] == {"clean_full_matrix_streak": 0, "credit": "0/2", "qualification_credit": 0}, "admission-qualification")
    expected = {"architecture": base.identity(ARCHITECTURE_PATH, 0o644, ARCHITECTURE_BYTES), "bootstrap_skill": base.identity(base.SKILL_PATH, 0o644, base.SKILL_BYTES), "data_only_validation": base.identity(VALIDATION_PATH, 0o644, 20000), "native_envelope": base.identity(CODEC_PATH, 0o644, CODEC_BYTES), "native_envelope_check": base.identity(CODEC_CHECK_PATH, 0o644, CODEC_CHECK_BYTES), "offline_verifier": base.identity(VERIFIER_PATH, 0o644, 100000), "review_checker": base.identity(base.CHECKER_PATH, 0o644, base.CHECKER_BYTES), "review_recipe": base.identity(base.RECIPE_PATH, 0o644, base.RECIPE_BYTES), "review_runtime": base.identity(os.path.realpath(__file__), 0o644, 100000), "review_waiter": base.identity(WAITER_PATH, 0o644, WAITER_BYTES), "v9_failure": base.identity(FAILURE_PATH, 0o644, FAILURE_BYTES)}
    base.require(gate["components"] == expected, "admission-components")
    return raw


def trace_tools(events):
    direct = sorted(base.event_items(events, "response_item", "function_call") + base.event_items(events, "response_item", "function_call_output"))
    wrapped = sorted(base.event_items(events, "response_item", "custom_tool_call") + base.event_items(events, "response_item", "custom_tool_call_output"))
    base.require(not direct and bool(wrapped), "native-wrapper-profile")
    return "OBSERVED_NATIVE_ENVELOPE_V1", wrapped


def validate_pair(prototype, profile, call, output, tool, arguments):
    base.require(profile == "OBSERVED_NATIVE_ENVELOPE_V1" and call.get("call_id") == output.get("call_id"), "call-bind:" + tool)
    base.require(call.get("type") == "custom_tool_call" and call.get("name") == "exec" and output.get("type") == "custom_tool_call_output", "call-shape:" + tool)
    decoded = codec.parse_call(call.get("input"))
    base.require(decoded["tool"] == tool and decoded["arguments"] == arguments, "call-semantics:" + tool)
    return codec.unwrap_output(output.get("output"))


def validate_pending(prototype, profile, pending, arguments):
    base.require(profile == "OBSERVED_NATIVE_ENVELOPE_V1" and pending.get("type") == "custom_tool_call" and pending.get("name") == "exec", "pending-shape")
    decoded = codec.parse_call(pending.get("input"))
    base.require(decoded == {"arguments": arguments, "output_mode": "output", "session_tail": decoded["session_tail"], "tool": "exec_command"}, "pending-semantics")


def validate_live(raw, trace_path, ready, record, subject, skill_raw, prototype):
    events = base.decode_trace(raw)
    context = base.session_context(events, record)
    base.require(os.path.basename(trace_path).endswith("-" + context["thread_id"] + ".jsonl"), "trace-name")
    expected_ready = {"architecture_sha256": ARCHITECTURE_SHA256, "atom_id": record["atom_id"], "bootstrap_skill_sha256": base.SKILL_SHA256, "goal_thread_id": context["thread_id"], "pid": ready.get("pid"), "recipe_sha256": base.RECIPE_SHA256, "request_sha256": ready.get("request_sha256"), "review_nonce": record["review_nonce"], "schema_id": "pw-r9-codex-native-goal-observed-envelope-review-ready-v10", "waiter_sha256": WAITER_SHA256}
    base.require(ready == expected_ready and isinstance(ready["pid"], int) and ready["pid"] > 1 and base.HEX_RE.fullmatch(ready["request_sha256"]), "ready")
    base.require(not base.event_items(events, "event_msg", "task_complete") and not any(item.get("phase") == "final_answer" for _, item in base.event_items(events, "response_item", "message")), "live-terminal")
    profile, tools = trace_tools(events)
    base.require(len(tools) == 5, "live-tool-count")
    values = [item for _, item in tools]
    base.require(validate_pair(prototype, profile, values[0], values[1], "exec_command", base.SKILL_ARGS).encode("utf-8") == skill_raw, "skill-output")
    active_text = validate_pair(prototype, profile, values[2], values[3], "create_goal", {"objective": record["goal_objective"]})
    prototype.parse_goal(active_text, context["thread_id"], record["goal_objective"], "active")
    validate_pending(prototype, profile, values[4], base.wait_arguments(record, context["thread_id"]))
    base.require(context["start_index"] < context["turn_index"] < tools[0][0] < tools[1][0] < tools[2][0] < tools[3][0] < tools[4][0], "live-order")
    text = subject.decode("utf-8")
    base.require(all(text not in item for event in events for item in base.all_strings(event)), "subject-before-active")
    return {"profile": profile, **context}


base.load_control = load_control
base.atom_record = atom_record
base.predeclaration = predeclaration
base.validate_admission = validate_admission
base.trace_tools = trace_tools
base.validate_pair = validate_pair
base.validate_pending = validate_pending
base.validate_live = validate_live


def reject(callback, label):
    try:
        callback()
    except (base.Invalid, codec.Invalid, OSError, UnicodeError, json.JSONDecodeError, KeyError, TypeError, ValueError):
        return 1
    raise base.Invalid("mutation-accepted:" + label)


def check_only():
    recipe, _, skill_raw, _, prototype = load_control()
    base.require(not os.path.lexists(ROOT), "workspace-review-root-present")
    assertions = 0
    mutations = 0
    for atom_id in ("A01", "A09", "A18"):
        atom, record = atom_record(recipe, atom_id)
        subject = base.subject_bytes(recipe, atom)
        base.require(len(base.spawn_prompt(record)) <= 512 and predeclaration(record, subject)["subject_sha256"] == base.sha(subject), "projection")
        events = base.synthetic_events(prototype, record, subject, "PASS", "EXEC_WRAPPED_V1")
        terminal = base.trace_raw(events)
        live = base.trace_raw(events[:8])
        ready = {"architecture_sha256": ARCHITECTURE_SHA256, "atom_id": atom_id, "bootstrap_skill_sha256": base.SKILL_SHA256, "goal_thread_id": "11111111-1111-4111-8111-111111111111", "pid": 1234, "recipe_sha256": base.RECIPE_SHA256, "request_sha256": "3" * 64, "review_nonce": record["review_nonce"], "schema_id": "pw-r9-codex-native-goal-observed-envelope-review-ready-v10", "waiter_sha256": WAITER_SHA256}
        proof = validate_live(live, base.SESSION_PREFIX + "x-11111111-1111-4111-8111-111111111111.jsonl", ready, record, subject, skill_raw, prototype)
        active = {"goal_thread_id": proof["thread_id"], "profile": proof["profile"], "turn_id": proof["turn_id"]}
        base.require(base.validate_terminal(terminal, live, base.SESSION_PREFIX + "x-11111111-1111-4111-8111-111111111111.jsonl", active, record, atom, subject, skill_raw, prototype)["result"] == "PASS", "terminal")
        bad = json.loads(json.dumps(events)); bad[3]["payload"]["input"] += "x"
        mutations += reject(lambda bad=bad: validate_live(base.trace_raw(bad[:8]), base.SESSION_PREFIX + "x-11111111-1111-4111-8111-111111111111.jsonl", ready, record, subject, skill_raw, prototype), "trailing")
        bad = json.loads(json.dumps(events)); bad[2]["payload"]["model"] = "wrong"
        mutations += reject(lambda bad=bad: validate_live(base.trace_raw(bad[:8]), base.SESSION_PREFIX + "x-11111111-1111-4111-8111-111111111111.jsonl", ready, record, subject, skill_raw, prototype), "route")
        assertions += 24
    output = {"assertion_count": assertions + 39, "first_mismatch": None, "max_spawn_prompt_bytes": max(len(base.spawn_prompt(atom_record(recipe, atom_id)[1])) for atom_id in ["A{:02d}".format(index) for index in range(1, 19)]), "max_subject_bytes": max(len(base.subject_bytes(recipe, atom)) for atom in recipe["atoms"]), "mutation_count": mutations, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-observed-envelope-review-runtime-check-v10", "status": "PASS_DATA_ONLY_OBSERVED_ENVELOPE_REVIEW_RUNTIME_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0, "workspace_writes": 0}
    sys.stdout.buffer.write(base.canonical(output))


def main():
    try:
        if sys.argv == [sys.argv[0], "--check"]:
            check_only()
        elif len(sys.argv) == 3 and sys.argv[1] == "prepare":
            base.prepare(sys.argv[2])
        elif len(sys.argv) == 4 and sys.argv[1] == "gate":
            base.gate(sys.argv[2], sys.argv[3])
        elif len(sys.argv) == 4 and sys.argv[1] == "record":
            base.record_terminal(sys.argv[2], sys.argv[3])
        else:
            raise base.Invalid("cli")
        return 0
    except (base.Invalid, codec.Invalid, OSError, UnicodeError, json.JSONDecodeError, KeyError, TypeError, ValueError) as error:
        sys.stdout.buffer.write(base.canonical({"first_mismatch": str(error), "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-observed-envelope-review-runtime-v10", "status": "FAIL", "subject_calls": 0}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
