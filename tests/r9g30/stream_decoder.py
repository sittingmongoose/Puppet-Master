#!/usr/bin/env python3
import hashlib
import importlib.util
import os
import stat

sys_path = "/mnt/Cursor/PuppetMaster/tests/r9g26/goal_receipt_decoder.py"
sys_bytes = 9353
sys_sha256 = "4dfd11ca9bf9428daa0f42447e74d09deb3005026426f4a1e286e0552356d8a8"


def _load():
    before = os.lstat(sys_path)
    if not (stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode)
            and stat.S_IMODE(before.st_mode) == 0o644 and before.st_uid == os.getuid()
            and before.st_nlink == 1 and before.st_size == sys_bytes):
        raise ValueError("decoder-custody")
    fd = os.open(sys_path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        raw = b""
        while len(raw) < sys_bytes:
            part = os.read(fd, sys_bytes - len(raw))
            if not part:
                raise ValueError("decoder-short")
            raw += part
        if os.read(fd, 1):
            raise ValueError("decoder-trailing")
    finally:
        os.close(fd)
    if hashlib.sha256(raw).hexdigest() != sys_sha256:
        raise ValueError("decoder-digest")
    spec = importlib.util.spec_from_file_location("r9g30_frozen_goal_decoder", sys_path)
    if spec is None or spec.loader is None:
        raise ValueError("decoder-spec")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    if module.__all__ != ("Invalid", "decode_events", "validate_active", "validate_terminal"):
        raise ValueError("decoder-api")
    return module


_D = _load()
_B = _D._BASE
Invalid = _D.Invalid


def _require(value, mismatch):
    if not value:
        raise Invalid(mismatch)


def _timeline(records):
    order = []
    for record in records:
        order.append(record["call_index"])
        if record["output_index"] is not None:
            order.append(record["output_index"])
    _require(order == sorted(order) and len(order) == len(set(order)), "tool-order")


def _chunk_args(control, index):
    return {
        "cmd": "python3 -B chunk.py {} {:03d}".format(control["thread_id"], index),
        "max_output_tokens": 256,
        "workdir": control["workdir"],
        "yield_time_ms": 30000,
    }


def _assistant_messages(events):
    result = []
    for index, item in _B.typed(events, "response_item", "message"):
        if item.get("role") == "assistant":
            content = item.get("content")
            _require(isinstance(content, list) and len(content) == 1
                     and content[0].get("type") == "output_text"
                     and isinstance(content[0].get("text"), str), "assistant-shape")
            result.append((index, item.get("phase"), content[0]["text"]))
    return result


def _sequence(events, control, chunks, skill, pending_index=None, terminal=False):
    ctx, records, codec = _D._records(events, control)
    chunk_records = len(chunks) if terminal else pending_index + 1
    suffix = 1 + chunk_records + (1 if terminal else 0)
    _require(len(records) >= suffix + 1, "tool-count")
    skill_records = records[:-suffix]
    create = records[-suffix]
    streamed = records[-suffix + 1:-1] if terminal else records[-chunk_records:]
    update = records[-1] if terminal else None
    classifications = [_D._skill(record, codec, control, skill) for record in skill_records]
    _require(classifications.count("CORRECT") == 1
             and classifications.count("SAFE_MISS") <= 1
             and classifications[-1] == "CORRECT", "skill-sequence")
    _require(create["tool"] == "create_goal"
             and create["arguments"] == {"objective": control["objective"]}, "create-call")
    _, active_body = _D._body(create, codec)
    active_goal = _B.goal(active_body, ctx["thread_id"], control["objective"], "active")
    _require(len(streamed) == chunk_records, "chunk-count")
    for index, record in enumerate(streamed):
        _require(record["tool"] == "exec_command", "chunk-tool:{:03d}".format(index))
        _D._exec_fields(record["arguments"], _chunk_args(control, index))
        if not terminal and index == pending_index:
            _require(record["output"] is None, "pending-output")
        else:
            code, body = _D._body(record, codec)
            _require(code == 0 and body.encode("utf-8") == chunks[index],
                     "chunk-output:{:03d}".format(index))
    if terminal:
        _require(update["tool"] == "update_goal"
                 and update["arguments"] == {"status": "complete"}, "update-call")
        _, complete_body = _D._body(update, codec)
        complete_goal = _B.goal(complete_body, ctx["thread_id"], control["objective"], "complete")
    else:
        complete_goal = None
    _timeline(records)
    return ctx, active_goal, complete_goal, classifications, records


def validate_pending(raw, control, chunks, skill, index):
    _require(type(index) is int and 0 <= index < len(chunks), "pending-index")
    events = _D.decode_events(raw)
    _require(not _B.typed(events, "event_msg", "task_complete")
             and not _assistant_messages(events), "pending-terminal")
    ctx, active_goal, _, classifications, _ = _sequence(
        events, control, chunks, skill, pending_index=index, terminal=False)
    subject = b"".join(chunks).decode("utf-8")
    create_outputs = [record["output_index"] for record in _D._records(events, control)[1]
                      if record["tool"] == "create_goal"]
    _require(len(create_outputs) == 1 and create_outputs[0] is not None, "active-output")
    for event in events[:create_outputs[0] + 1]:
        _require(subject not in list(_D._strings(event)), "subject-before-active")
    return {"active_goal": active_goal, "control_reads": classifications,
            "profile": "GOAL_STREAMED_READER_V1", **ctx}


def validate_terminal(raw, control, chunks, skill, expected):
    events = _D.decode_events(raw)
    ctx, active_goal, complete_goal, classifications, records = _sequence(
        events, control, chunks, skill, terminal=True)
    messages = _assistant_messages(events)
    _require(len(messages) == 1 and messages[0][1] == "final_answer"
             and messages[0][2].encode("utf-8") == expected, "final-answer")
    completes = _B.typed(events, "event_msg", "task_complete")
    _require(len(completes) == 1 and completes[0][0] == len(events) - 1
             and completes[0][1].get("turn_id") == ctx["turn_id"]
             and completes[0][1].get("last_agent_message") == messages[0][2], "task-complete")
    _require(records[-1]["output_index"] < messages[0][0] < completes[0][0], "terminal-order")
    return {"active_goal": active_goal, "complete_goal": complete_goal,
            "control_reads": classifications, "profile": "GOAL_STREAMED_READER_V1",
            "result": messages[0][2], **ctx}


__all__ = ("Invalid", "validate_pending", "validate_terminal")
