#!/usr/bin/env python3
import importlib.util
import json
import os
import re
import shlex
import stat

BASE_PATH = "/mnt/Cursor/PuppetMaster/tests/r9g24/profile_decoder.py"
BASE_BYTES = 14662
BASE_SHA256 = "d0b112bd6b36061204aa79a505df40a48dfa8b63f69756251c2500ea7893e15c"
DIRECT_EXEC_OUTPUT = re.compile(r"Chunk ID: [0-9a-f]+\nWall time: (?:0|[1-9][0-9]*)(?:\.[0-9]+)? seconds\nProcess exited with code (-?[0-9]+)\nOriginal token count: [0-9]+\nOutput:\n([\s\S]*)")
TOKEN = re.compile(r"^[A-Za-z0-9._:-]{1,48}$")


def _load_base():
    import hashlib
    before = os.lstat(BASE_PATH)
    if not (stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode) and stat.S_IMODE(before.st_mode) == 0o644 and before.st_uid == os.getuid() and before.st_nlink == 1 and before.st_size == BASE_BYTES):
        raise ValueError("base-custody")
    fd = os.open(BASE_PATH, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        raw = b""
        while len(raw) < BASE_BYTES:
            part = os.read(fd, BASE_BYTES - len(raw))
            if not part:
                raise ValueError("base-short")
            raw += part
        if os.read(fd, 1):
            raise ValueError("base-trailing")
    finally:
        os.close(fd)
    if hashlib.sha256(raw).hexdigest() != BASE_SHA256:
        raise ValueError("base-hash")
    spec = importlib.util.spec_from_file_location("r9g26_frozen_profile_base", BASE_PATH)
    if spec is None or spec.loader is None:
        raise ValueError("base-spec")
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    if module.__all__ != ("Invalid", "decode_events", "profile", "validate_active", "validate_terminal"):
        raise ValueError("base-api")
    return module


_BASE = _load_base()
Invalid = _BASE.Invalid
decode_events = _BASE.decode_events


def _require(value, mismatch):
    if not value:
        raise Invalid(mismatch)


def _strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for key, item in value.items():
            yield from _strings(key); yield from _strings(item)
    elif isinstance(value, list):
        for item in value:
            yield from _strings(item)


def _records(events, control):
    ctx = _BASE.context(events, control)
    kind, calls, outputs = _BASE.profile(events, ctx["turn_id"])
    by_id = {}
    for index, item in outputs:
        _require(item["call_id"] not in by_id, "duplicate-output")
        by_id[item["call_id"]] = (index, item)
    codec = _BASE.load_codec()
    records = []
    for index, call in calls:
        tool, arguments = _BASE.arguments(kind, call, codec)
        paired = by_id.pop(call["call_id"], None)
        if paired is not None:
            _require(index < paired[0], "pair-order")
        records.append({"arguments": arguments, "call": call, "call_index": index, "kind": kind, "output": None if paired is None else paired[1], "output_index": None if paired is None else paired[0], "tool": tool})
    _require(not by_id, "orphan-output")
    return ctx, records, codec


def _body(record, codec):
    item = record["output"]
    _require(item is not None and item["call_id"] == record["call"]["call_id"], "missing-output")
    if record["kind"] == "NESTED_FUNCTIONS_EXEC_V1":
        return 0, codec.unwrap_output(item["output"])
    raw = item["output"]
    _require(isinstance(raw, str), "direct-output")
    if record["tool"] != "exec_command":
        return 0, raw
    match = DIRECT_EXEC_OUTPUT.fullmatch(raw)
    _require(match is not None, "direct-exec-envelope")
    return int(match.group(1)), match.group(2)


def _exec_fields(arguments, required):
    _require(isinstance(arguments, dict) and set(required) <= set(arguments) <= set(required) | {"login", "tty"}, "exec-fields")
    _require(all(arguments[key] == value for key, value in required.items()), "exec-required")
    _require("login" not in arguments or type(arguments["login"]) is bool, "exec-login")
    _require("tty" not in arguments or arguments["tty"] is False, "exec-tty")


def _skill(record, codec, control, skill):
    _require(record["tool"] == "exec_command" and isinstance(record["arguments"], dict), "skill-tool")
    arguments = record["arguments"]
    allowed = {"cmd", "login", "max_output_tokens", "tty", "workdir", "yield_time_ms"}
    _require({"cmd", "workdir"} <= set(arguments) <= allowed and arguments["workdir"] == "/mnt/Cursor/PuppetMaster", "skill-fields")
    _require("login" not in arguments or type(arguments["login"]) is bool, "skill-login")
    _require("tty" not in arguments or arguments["tty"] is False, "skill-tty")
    _require("yield_time_ms" not in arguments or isinstance(arguments["yield_time_ms"], int), "skill-yield")
    _require("max_output_tokens" not in arguments or isinstance(arguments["max_output_tokens"], int), "skill-budget")
    try:
        words = shlex.split(arguments["cmd"], posix=True)
    except ValueError as error:
        raise Invalid("skill-shell") from error
    _require(len(words) == 4 and words[:2] == ["sed", "-n"] and re.fullmatch(r"1,[1-9][0-9]{0,3}p", words[2]), "skill-program")
    path = words[3] if os.path.isabs(words[3]) else os.path.join(arguments["workdir"], words[3])
    code, body = _body(record, codec)
    if os.path.realpath(path) == control["skill_path"]:
        _require(code == 0 and body.encode("utf-8") == skill and int(words[2].split(",")[1][:-1]) >= skill.count(b"\n"), "skill-identity")
        return "CORRECT"
    _require(path == control["skill_alias_path"] and code != 0 and control["skill_path"] not in body, "skill-alias")
    return "SAFE_MISS"


def _sequence(events, control, subject, skill, terminal):
    ctx, records, codec = _records(events, control)
    suffix = 3 if terminal else 2
    _require(len(records) >= suffix + 1, "tool-count")
    skill_records = records[:-suffix]
    create = records[-suffix]
    broker = records[-suffix + 1]
    update = records[-1] if terminal else None
    classifications = [_skill(record, codec, control, skill) for record in skill_records]
    _require(classifications.count("CORRECT") == 1 and classifications.count("SAFE_MISS") <= 1 and classifications[-1] == "CORRECT", "skill-sequence")
    _require(create["tool"] == "create_goal" and create["arguments"] == {"objective": control["objective"]}, "create-call")
    _, active_body = _body(create, codec)
    active_goal = _BASE.goal(active_body, ctx["thread_id"], control["objective"], "active")
    _require(broker["tool"] == "exec_command", "broker-tool")
    _exec_fields(broker["arguments"], control["wait_arguments"])
    if terminal:
        code, broker_body = _body(broker, codec)
        _require(code == 0 and broker_body.encode("utf-8") == subject, "broker-output")
        _require(update["tool"] == "update_goal" and update["arguments"] == {"status": "complete"}, "update-call")
        _, complete_body = _body(update, codec)
        complete_goal = _BASE.goal(complete_body, ctx["thread_id"], control["objective"], "complete")
        _require(broker["output_index"] < update["call_index"], "subject-before-update")
    else:
        _require(broker["output"] is None, "broker-must-be-pending")
        complete_goal = None
    return ctx, active_goal, complete_goal, classifications


def validate_active(raw, control, subject, skill):
    events = decode_events(raw)
    _require(not _BASE.typed(events, "event_msg", "task_complete") and not any(item.get("phase") == "final_answer" for _, item in _BASE.typed(events, "response_item", "message")), "active-terminal")
    ctx, active_goal, _, classifications = _sequence(events, control, subject, skill, False)
    text = subject.decode("utf-8")
    _require(all(text not in item for event in events for item in _strings(event)), "subject-before-active")
    return {"active_goal": active_goal, "control_reads": classifications, "profile": "GOAL_RECEIPT_ONLY_BROKER_V1", **ctx}


def validate_terminal(raw, active_raw, control, subject, skill, allowed_tokens):
    _require(raw.startswith(active_raw) and len(raw) > len(active_raw), "active-prefix")
    validate_active(active_raw, control, subject, skill)
    events = decode_events(raw)
    ctx, active_goal, complete_goal, classifications = _sequence(events, control, subject, skill, True)
    finals = []
    for index, item in _BASE.typed(events, "response_item", "message"):
        if item.get("phase") == "final_answer":
            content = item.get("content")
            _require(isinstance(content, list) and len(content) == 1 and content[0].get("type") == "output_text" and isinstance(content[0].get("text"), str), "final-shape")
            finals.append((index, content[0]["text"]))
    _require(len(finals) == 1 and TOKEN.fullmatch(finals[0][1] or "") and finals[0][1] in allowed_tokens, "final-token")
    completes = _BASE.typed(events, "event_msg", "task_complete")
    _require(len(completes) == 1 and completes[0][0] == len(events) - 1 and completes[0][1].get("turn_id") == ctx["turn_id"] and completes[0][1].get("last_agent_message") == finals[0][1], "task-complete")
    return {"active_goal": active_goal, "complete_goal": complete_goal, "control_reads": classifications, "profile": "GOAL_RECEIPT_ONLY_BROKER_V1", "result": finals[0][1], **ctx}


__all__ = ("Invalid", "decode_events", "validate_active", "validate_terminal")
