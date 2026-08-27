#!/usr/bin/env python3
import hashlib
import importlib.util
import os
import stat

V1_PATH = "/mnt/Cursor/PuppetMaster/tests/r9g30/stream_decoder.py"
V1_BYTES = 6802
V1_SHA256 = "63d3d43284528e01adecaebcc9ff5acbd8a0d9e844340da38d2c66ca5fae7b26"


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
    spec = importlib.util.spec_from_file_location("r9g31_frozen_stream_decoder_v1", V1_PATH)
    if spec is None or spec.loader is None:
        raise ValueError("v1-spec")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    if module.__all__ != ("Invalid", "validate_pending", "validate_terminal"):
        raise ValueError("v1-api")
    return module


_V1 = _load_v1()
_D = _V1._D
_B = _D._BASE
Invalid = _V1.Invalid


def _require(value, mismatch):
    if not value:
        raise Invalid(mismatch)


def _messages(events):
    result = []
    for index, item in _B.typed(events, "response_item", "message"):
        if item.get("role") == "assistant":
            content = item.get("content")
            _require(isinstance(content, list) and len(content) == 1
                     and content[0].get("type") == "output_text"
                     and isinstance(content[0].get("text"), str), "assistant-shape")
            result.append((index, item.get("phase"), content[0]["text"]))
    return result


def _control_commentary(messages, create_index, chunks):
    _require(1 <= len(messages) <= 2, "control-commentary-count")
    for index, phase, text in messages:
        _require(index < create_index and phase == "commentary"
                 and 1 <= len(text.encode("utf-8")) <= 512, "control-commentary")
        for chunk in chunks:
            _require(chunk.decode("utf-8") not in text, "subject-in-commentary")


def _subject_before_active(events, records, chunks):
    create = next(record for record in records if record["tool"] == "create_goal")
    _require(create["output_index"] is not None, "active-output")
    for event in events[:create["output_index"] + 1]:
        for text in _D._strings(event):
            _require(all(chunk.decode("utf-8") not in text for chunk in chunks), "subject-before-active")
    return create


def validate_pending(raw, control, chunks, skill, index):
    _require(type(index) is int and 0 <= index < len(chunks), "pending-index")
    events = _D.decode_events(raw)
    _require(not _B.typed(events, "event_msg", "task_complete"), "pending-complete")
    ctx, active_goal, _, classifications, records = _V1._sequence(
        events, control, chunks, skill, pending_index=index, terminal=False)
    create = _subject_before_active(events, records, chunks)
    messages = _messages(events)
    _require(not any(phase == "final_answer" for _, phase, _ in messages), "pending-final")
    _control_commentary(messages, create["call_index"], chunks)
    return {"active_goal": active_goal, "control_reads": classifications,
            "profile": "GOAL_STREAMED_READER_V2", **ctx}


def validate_terminal(raw, control, chunks, skill, expected):
    events = _D.decode_events(raw)
    ctx, active_goal, complete_goal, classifications, records = _V1._sequence(
        events, control, chunks, skill, terminal=True)
    create = _subject_before_active(events, records, chunks)
    messages = _messages(events)
    finals = [item for item in messages if item[1] == "final_answer"]
    comments = [item for item in messages if item[1] != "final_answer"]
    _control_commentary(comments, create["call_index"], chunks)
    _require(len(finals) == 1 and finals[0][2].encode("utf-8") == expected, "final-answer")
    completes = _B.typed(events, "event_msg", "task_complete")
    _require(len(completes) == 1 and completes[0][0] == len(events) - 1
             and completes[0][1].get("turn_id") == ctx["turn_id"]
             and completes[0][1].get("last_agent_message") == finals[0][2], "task-complete")
    _require(records[-1]["output_index"] < finals[0][0] < completes[0][0], "terminal-order")
    return {"active_goal": active_goal, "complete_goal": complete_goal,
            "control_reads": classifications, "profile": "GOAL_STREAMED_READER_V2",
            "result": finals[0][2], **ctx}


__all__ = ("Invalid", "validate_pending", "validate_terminal")
