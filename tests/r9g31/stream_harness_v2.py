#!/usr/bin/env python3
import hashlib
import importlib.util
import json
import os
import stat
import sys

sys.dont_write_bytecode = True
V1_PATH = "/mnt/Cursor/PuppetMaster/tests/r9g30/stream_harness.py"
V1_BYTES = 32971
V1_SHA256 = "47307d4e78500b9b5fe8e147293c1055d54e80cc6ec9f81d98c822fa863bc3b1"
SELF = "/mnt/Cursor/PuppetMaster/tests/r9g31/stream_harness_v2.py"
SKILL = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-streamed-row-v2/SKILL.md"
SKILL_BYTES = 1732
SKILL_SHA256 = "a4f66ab9639d8a6095086519078ca0774cffa4473c62feef5dbe4cef073fc289"
DECODER = "/mnt/Cursor/PuppetMaster/tests/r9g31/stream_decoder_v2.py"
DECODER_BYTES = 4994
DECODER_SHA256 = "6fc70bf94f107836d8a17baf67da6dc5b3987d49d794d0bc3e1667ef41963b64"


def _load_v1():
    before = os.lstat(V1_PATH)
    if not (stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode)
            and stat.S_IMODE(before.st_mode) == 0o644 and before.st_uid == os.getuid()
            and before.st_nlink == 1 and before.st_size == V1_BYTES):
        raise ValueError("v1-custody")
    fd = os.open(V1_PATH, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        raw = b""
        while len(raw) < V1_BYTES:
            part = os.read(fd, V1_BYTES - len(raw))
            if not part:
                raise ValueError("v1-short")
            raw += part
        if os.read(fd, 1):
            raise ValueError("v1-trailing")
    finally:
        os.close(fd)
    if hashlib.sha256(raw).hexdigest() != V1_SHA256:
        raise ValueError("v1-digest")
    spec = importlib.util.spec_from_file_location("r9g31_frozen_stream_harness_v1", V1_PATH)
    if spec is None or spec.loader is None:
        raise ValueError("v1-spec")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


B = _load_v1()
B.SELF = SELF
B.SKILL = SKILL
B.SKILL_BYTES = SKILL_BYTES
B.SKILL_SHA256 = SKILL_SHA256
B.DECODER = DECODER
B.DECODER_BYTES = DECODER_BYTES
B.DECODER_SHA256 = DECODER_SHA256


def spawn_prompt(item, count):
    raw = ("Use $r9-goal-streamed-row-v2. Exact objective=" + json.dumps(item["goal_objective"])
           + "; reader workdir=" + json.dumps(item["workdir"])
           + "; slice_count=" + str(count) + ". No subject is in this message.").encode("utf-8")
    B.require(len(raw) <= B.LIMITS["spawn_prompt_utf8_bytes_max"], "spawn-prompt")
    return raw


def control(pre, item, thread_id):
    return {"effort": pre["reasoning_effort_requested"], "model": pre["model_requested"],
            "objective": pre["goal_objective"], "parent_thread_id": pre["parent_thread_id"],
            "skill_alias_path": "/home/sittingmongoose/.codex/skills/.system/r9-goal-streamed-row-v2/SKILL.md",
            "skill_path": SKILL, "task_path": pre["task_path"], "thread_id": thread_id,
            "workdir": item["workdir"]}


def release(plan_path, thread_id, index_text):
    B.require(B.re.fullmatch(r"[0-9]{3}", index_text or ""), "index-text")
    index = int(index_text); row_path = os.getcwd()
    pre, _, _, _, item, subject, _ = B.locate(row_path); sliced = B.chunks(subject)
    B.require(pre["plan_path"] == plan_path and 0 <= index < len(sliced), "release-control")
    expected_before = B.PREPARED_FILES | {B.release_name(value) for value in range(index)}
    B.require(set(os.listdir(row_path)) == expected_before, "release-inventory")
    decoder = B.load_decoder(); skill = B.H.read_exact(SKILL, 0o644, SKILL_BYTES, SKILL_SHA256)
    path, trace = B.active_trace(thread_id)
    proof = decoder.validate_pending(trace, control(pre, item, thread_id), sliced, skill, index)
    B.require(proof["profile"] == "GOAL_STREAMED_READER_V2"
              and proof["session"]["agent_path"] == item["task_path"], "release-proof")
    B.H.publish(os.path.join(row_path, B.release_name(index)), B.H.canonical(
        B.release_expected(pre, item, thread_id, path, trace, sliced, index)))
    sys.stdout.buffer.write(sliced[index])


def terminal(row_path, write):
    pre, _, _, row, item, subject, expected = B.locate(row_path); sliced = B.chunks(subject)
    expected_before = B.expected_files(len(sliced), terminal=not write)
    B.require(set(os.listdir(row_path)) == expected_before, "terminal-inventory")
    first = B.read_release(row_path, pre, item, sliced, 0)
    path, trace = B.stable_trace(first["goal_thread_id"])
    B.require(path == first["trace_path"], "terminal-trace-path")
    releases = [B.read_release(row_path, pre, item, sliced, index, trace) for index in range(len(sliced))]
    B.require(all(value["goal_thread_id"] == first["goal_thread_id"]
                  and value["trace_path"] == path for value in releases), "release-global")
    decoder = B.load_decoder(); skill = B.H.read_exact(SKILL, 0o644, SKILL_BYTES, SKILL_SHA256)
    proof = decoder.validate_terminal(trace, control(pre, item, first["goal_thread_id"]), sliced, skill, expected)
    B.require(proof["profile"] == "GOAL_STREAMED_READER_V2"
              and proof["session"]["agent_path"] == item["task_path"]
              and proof["result"].encode("utf-8") == expected, "terminal-proof")
    receipt = {"active_goal": proof["active_goal"], "cell": row["cell"], "complete_goal": proof["complete_goal"],
            "control_reads": proof["control_reads"], "goal_thread_id": first["goal_thread_id"],
            "profile": proof["profile"], "qualification_credit": 0, "result_bytes": len(expected),
            "result_sha256": B.H.sha(expected), "review_nonce": pre["review_nonce"], "route": row["route"],
            "row_id": row["row_id"], "schema_id": "pw-r9-codex-native-goal-streamed-goal-receipt-v2",
            "slice_count": len(sliced), "status": "PASS_FRESH_GOAL_STREAMED_ROW_V2_ZERO_CREDIT",
            "task_path": item["task_path"], "trace": {"bytes": len(trace), "path": path, "sha256": B.H.sha(trace)},
            "turn_count": 1, "turn_id": proof["turn_id"]}
    if write:
        B.H.publish(os.path.join(row_path, "terminal_trace.jsonl"), trace)
        B.H.publish(os.path.join(row_path, "result.txt"), expected)
        B.H.publish(os.path.join(row_path, "goal_receipt.json"), B.H.canonical(receipt))
    else:
        B.require(B.H.read_exact(os.path.join(row_path, "terminal_trace.jsonl"), 0o444,
                                len(trace), B.H.sha(trace)) == trace, "terminal-copy")
        B.require(B.H.read_exact(os.path.join(row_path, "result.txt"), 0o444,
                                len(expected), B.H.sha(expected)) == expected, "result-copy")
        receipt_raw = B.H.canonical(receipt)
        B.require(B.H.read_exact(os.path.join(row_path, "goal_receipt.json"), 0o444,
                                len(receipt_raw), B.H.sha(receipt_raw)) == receipt_raw, "receipt-copy")
    B.require(set(os.listdir(row_path)) == B.expected_files(len(sliced), terminal=True), "terminal-final-inventory")
    projection = B.H.inventory_sha(row_path, B.expected_files(len(sliced), terminal=True))
    return {"goal_thread_id": first["goal_thread_id"], "inventory_projection_sha256": projection,
            "qualification_credit": 0, "result_sha256": B.H.sha(expected), "review_nonce": pre["review_nonce"],
            "route": row["route"], "row_id": row["row_id"],
            "schema_id": "pw-r9-codex-native-goal-streamed-record-v2",
            "status": "PASS_FRESH_GOAL_STREAMED_ROW_V2_ZERO_CREDIT", "task_path": item["task_path"],
            "terminal_trace_sha256": B.H.sha(trace), "turn_id": proof["turn_id"],
            "workspace_writes": 3 if write else 0}


B.spawn_prompt = spawn_prompt
B.control = control
B.release = release
B.terminal = terminal


if __name__ == "__main__":
    try:
        raise SystemExit(B.main(sys.argv))
    except (B.Invalid, OSError, UnicodeError, KeyError, TypeError, ValueError) as error:
        sys.stdout.buffer.write(B.H.canonical({"first_mismatch": str(error), "qualification_credit": 0,
            "schema_id": "pw-r9-codex-native-goal-streamed-harness-v2", "status": "FAIL", "workspace_writes": 0}))
        raise SystemExit(1)
