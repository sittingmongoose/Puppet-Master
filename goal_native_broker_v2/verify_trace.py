#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import re
import stat
import sys
from pathlib import Path

MANIFEST_SCHEMA = "pw-codex-native-goal-broker-trace-verifier-manifest-v2"
CORPUS_SCHEMA = "pw-codex-native-goal-subject-broker-corpus-v2"
RELEASE_SCHEMA = "pw-codex-native-goal-subject-release-v2"
REPORT_SCHEMA = "pw-codex-native-goal-broker-trace-verification-v2"
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
CASE = re.compile(r"^[a-z0-9][a-z0-9_-]{0,63}$")
RESULT = re.compile(r"^[A-Za-z0-9._:-]{1,128}$")


class Invalid(Exception):
    pass


def fail(message):
    raise Invalid(message)


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def canonical_no_lf(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def canonical(value):
    return canonical_no_lf(value) + b"\n"


def unique_object(pairs):
    value = {}
    for key, item in pairs:
        if key in value:
            fail(f"duplicate-key:{key}")
        value[key] = item
    return value


def parse_json(data, where, framing=None):
    try:
        value = json.loads(data.decode("utf-8"), object_pairs_hook=unique_object, parse_constant=lambda item: fail(f"nonfinite:{where}:{item}"))
    except Invalid:
        raise
    except Exception as exc:
        fail(f"json:{where}:{type(exc).__name__}")
    if framing is True and data != canonical(value):
        fail(f"canonical-lf:{where}")
    if framing is False and data != canonical_no_lf(value):
        fail(f"canonical-no-lf:{where}")
    return value


def exact_keys(value, expected, where):
    if not isinstance(value, dict) or set(value) != set(expected):
        fail(f"fields:{where}")


def confined(root, relative, where):
    if not isinstance(relative, str) or not relative or os.path.isabs(relative):
        fail(f"relative-path:{where}")
    root = root.resolve(strict=True)
    path = (root / relative).resolve(strict=True)
    try:
        path.relative_to(root)
    except ValueError:
        fail(f"path-escape:{where}")
    return path


def read_regular(path, mode, where, maximum=200_000_000):
    path = Path(path)
    try:
        resolved = path.resolve(strict=True)
        before = path.lstat()
    except OSError as exc:
        fail(f"stat:{where}:{type(exc).__name__}")
    if resolved != path or not stat.S_ISREG(before.st_mode) or before.st_nlink != 1 or f"{stat.S_IMODE(before.st_mode):04o}" != mode or before.st_size > maximum:
        fail(f"custody:{where}")
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_CLOEXEC", 0) | getattr(os, "O_NOFOLLOW", 0))
    try:
        opened = os.fstat(fd)
        if (opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino) or not stat.S_ISREG(opened.st_mode):
            fail(f"open-custody:{where}")
        parts = []
        while True:
            block = os.read(fd, 1_048_576)
            if not block:
                break
            parts.append(block)
    finally:
        os.close(fd)
    after = path.lstat()
    if (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns) != (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns):
        fail(f"read-drift:{where}")
    return b"".join(parts)


def read_bound(path, binding, where, maximum):
    exact_keys(binding, ("bytes", "mode", "path", "sha256"), where)
    raw = read_regular(path, binding["mode"], where, maximum)
    if len(raw) != binding["bytes"] or sha256(raw) != binding["sha256"]:
        fail(f"identity:{where}")
    return raw


def text_blocks(blocks, where):
    if not isinstance(blocks, list):
        fail(f"blocks:{where}")
    texts = []
    for block in blocks:
        if not isinstance(block, dict) or block.get("type") not in {"input_text", "output_text"} or not isinstance(block.get("text"), str):
            fail(f"block:{where}")
        texts.append(block["text"])
    return "".join(texts)


def custom_kind(source):
    if not isinstance(source, str):
        fail("custom-input")
    needles = {"create_goal": "tools.create_goal(", "exec_command": "tools.exec_command(", "update_goal": "tools.update_goal("}
    found = [name for name, needle in needles.items() if needle in source]
    if len(found) != 1 or source.count("tools.") != 1:
        fail("custom-tool-totality")
    return found[0]


def events_from_records(records):
    items = [record["payload"] for record in records if record.get("type") == "response_item" and isinstance(record.get("payload"), dict)]
    encodings = {"function_call": "function_call_v1", "custom_tool_call": "custom_exec_v1"}
    events = []
    paired = set()
    used = None
    for index, payload in enumerate(items):
        ptype = payload.get("type")
        if ptype == "web_search_call":
            fail("web-search")
        if ptype not in encodings:
            if isinstance(ptype, str) and ptype.endswith("_call"):
                fail(f"unknown-call:{ptype}")
            continue
        encoding = encodings[ptype]
        if used is None:
            used = encoding
        elif used != encoding:
            fail("mixed-tool-encoding")
        if ptype == "function_call":
            name, source, output_type = payload.get("name"), payload.get("arguments"), "function_call_output"
        else:
            if payload.get("name") != "exec":
                fail("custom-wrapper")
            name, source, output_type = custom_kind(payload.get("input")), payload.get("input"), "custom_tool_call_output"
        call_id = payload.get("call_id")
        if not isinstance(call_id, str) or index + 1 >= len(items):
            fail("call-pair")
        output = items[index + 1]
        if output.get("type") != output_type or output.get("call_id") != call_id:
            fail(f"unpaired:{name}")
        paired.add(index + 1)
        events.append({"encoding": encoding, "input": source, "name": name, "output": output.get("output")})
    for index, payload in enumerate(items):
        if payload.get("type") in {"function_call_output", "custom_tool_call_output"} and index not in paired:
            fail("orphan-output")
    finals = [item for item in items if item.get("type") == "message" and item.get("role") == "assistant" and item.get("phase") == "final_answer"]
    if len(finals) != 1 or items[-1] is not finals[0]:
        fail("final-position")
    content = finals[0].get("content")
    if not isinstance(content, list) or len(content) != 1 or content[0].get("type") != "output_text" or not isinstance(content[0].get("text"), str):
        fail("final-content")
    return events, content[0]["text"], used


def function_args(event, where):
    if event["encoding"] != "function_call_v1" or not isinstance(event["input"], str):
        fail(f"arguments:{where}")
    value = parse_json(event["input"].encode("utf-8"), where)
    if not isinstance(value, dict):
        fail(f"argument-object:{where}")
    return value


def custom_string(source, function, field, where):
    match = re.search(rf'tools\.{function}\(\{{[^}}]*?{field}\s*:\s*("(?:\\.|[^"\\])*")', source, re.S)
    if not match:
        fail(f"custom-field:{where}")
    value = parse_json(match.group(1).encode("utf-8"), where)
    if not isinstance(value, str):
        fail(f"custom-string:{where}")
    return value


def goal_receipt(event, where):
    if event["encoding"] == "function_call_v1":
        if not isinstance(event["output"], str):
            fail(f"goal-output:{where}")
        value = parse_json(event["output"].encode("utf-8"), where)
    else:
        candidates = []
        for line in text_blocks(event["output"], where).splitlines():
            line = line.strip()
            if not line.startswith("{"):
                continue
            try:
                candidate = parse_json(line.encode("utf-8"), where)
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


def exec_command(event):
    if event["encoding"] == "function_call_v1":
        args = function_args(event, "exec")
        allowed = {"cmd", "login", "max_output_tokens", "tty", "workdir", "yield_time_ms"}
        if not {"cmd", "workdir"}.issubset(args) or not set(args).issubset(allowed):
            fail("exec-arguments")
        if not isinstance(args["cmd"], str) or args["workdir"] != "/mnt/Cursor/PuppetMaster":
            fail("exec-fixed")
        if "login" in args and args["login"] is not True:
            fail("exec-login")
        if "tty" in args and args["tty"] is not False:
            fail("exec-tty")
        if "yield_time_ms" in args and (type(args["yield_time_ms"]) is not int or not 250 <= args["yield_time_ms"] <= 30000):
            fail("exec-yield")
        if "max_output_tokens" in args and (type(args["max_output_tokens"]) is not int or not 1 <= args["max_output_tokens"] <= 20000):
            fail("exec-output-limit")
        return args["cmd"]
    source = event["input"]
    if not re.search(r'workdir\s*:\s*"/mnt/Cursor/PuppetMaster"', source):
        fail("custom-workdir")
    return custom_string(source, "exec_command", "cmd", "custom-exec")


def event_output(event, where):
    if event["encoding"] == "function_call_v1":
        if not isinstance(event["output"], str):
            fail(f"output:{where}")
        return event["output"]
    return text_blocks(event["output"], where)


def release_from_output(output):
    candidates = []
    for line in output.splitlines():
        line = line.strip()
        if not line.startswith("{"):
            continue
        try:
            candidate = parse_json(line.encode("utf-8"), "release", False)
        except Invalid:
            continue
        if isinstance(candidate, dict) and candidate.get("schema_id") == RELEASE_SCHEMA:
            candidates.append(candidate)
    if len(candidates) != 1:
        fail("release-lines")
    release = candidates[0]
    exact_keys(release, ("case_id", "goal_thread_id", "schema_id", "subject_sha256", "subject_utf8"), "release")
    return release


def load_corpus(raw):
    corpus = parse_json(raw, "corpus", True)
    exact_keys(corpus, ("cases", "schema_id"), "corpus")
    if corpus["schema_id"] != CORPUS_SCHEMA or not isinstance(corpus["cases"], list) or not corpus["cases"]:
        fail("corpus-schema")
    out = {}
    for item in corpus["cases"]:
        exact_keys(item, ("case_id", "subject_sha256", "subject_utf8"), "corpus-case")
        cid, subject = item["case_id"], item["subject_utf8"]
        if not isinstance(cid, str) or not CASE.fullmatch(cid) or cid in out or not isinstance(subject, str):
            fail("corpus-case-value")
        if not 1 <= len(subject.encode("utf-8")) <= 256 or "\n" in subject or "\r" in subject or sha256(subject.encode("utf-8")) != item["subject_sha256"]:
            fail("corpus-subject")
        out[cid] = item
    return out


def verify_case(case, corpus, broker_rel, corpus_rel, session_root):
    exact_keys(case, ("case_id", "final_envelope", "goal_thread_id", "objective", "requested_model", "requested_reasoning_effort", "result_utf8", "task_path", "trace"), "manifest-case")
    cid, thread = case["case_id"], case["goal_thread_id"]
    if cid not in corpus or not isinstance(thread, str) or not UUID.fullmatch(thread) or not isinstance(case["task_path"], str) or not case["task_path"].startswith("/root/"):
        fail("case-identity")
    binding = case["trace"]
    exact_keys(binding, ("bytes", "mode", "relative_path", "sha256"), "trace-binding")
    path = confined(session_root, binding["relative_path"], "trace")
    raw = read_regular(path, binding["mode"], "trace")
    if len(raw) != binding["bytes"] or sha256(raw) != binding["sha256"] or not raw.endswith(b"\n"):
        fail("trace-identity")
    records = [parse_json(line, f"trace-line-{index}") for index, line in enumerate(raw.splitlines(), 1)]
    metas = [record.get("payload") for record in records if record.get("type") == "session_meta"]
    if len(metas) != 1 or not isinstance(metas[0], dict):
        fail("session-meta")
    meta = metas[0]
    spawn = meta.get("source", {}).get("subagent", {}).get("thread_spawn", {})
    if meta.get("id") != thread or spawn.get("agent_path") != case["task_path"] or spawn.get("depth") != 1:
        fail("session-identity")
    turns = [record.get("payload") for record in records if record.get("type") == "turn_context"]
    if len(turns) != 1 or turns[0].get("model") != case["requested_model"] or turns[0].get("effort") != case["requested_reasoning_effort"]:
        fail("route")
    events, final, encoding = events_from_records(records)
    if [event["name"] for event in events] != ["create_goal", "exec_command", "update_goal"]:
        fail("tool-order")
    create, execute, update = events
    if create["encoding"] == "function_call_v1":
        if function_args(create, "create") != {"objective": case["objective"]}:
            fail("create-arguments")
    elif custom_string(create["input"], "create_goal", "objective", "custom-objective") != case["objective"] or "token_budget" in create["input"]:
        fail("custom-create")
    active = goal_receipt(create, "active")
    if active.get("threadId") != thread or active.get("objective") != case["objective"] or active.get("status") != "active":
        fail("active-goal")
    expected_command = f"python3 -B {broker_rel} --corpus {corpus_rel} --case {cid} --thread {thread} --release"
    if exec_command(execute) != expected_command:
        fail("broker-command")
    expected = corpus[cid]
    if release_from_output(event_output(execute, "broker")) != {"case_id": cid, "goal_thread_id": thread, "schema_id": RELEASE_SCHEMA, "subject_sha256": expected["subject_sha256"], "subject_utf8": expected["subject_utf8"]}:
        fail("release-value")
    if update["encoding"] == "function_call_v1":
        if function_args(update, "update") != {"status": "complete"}:
            fail("update-arguments")
    elif not re.search(r'tools\.update_goal\(\{status\s*:\s*"complete"\}\)', update["input"]):
        fail("custom-update")
    complete = goal_receipt(update, "complete")
    if complete.get("threadId") != thread or complete.get("objective") != case["objective"] or complete.get("status") != "complete":
        fail("complete-goal")
    result = case["result_utf8"]
    if not isinstance(result, str) or not RESULT.fullmatch(result) or final != case["final_envelope"] or final != f"T|{result}|{thread}":
        fail("final")
    return {"case_id": cid, "encoding": encoding, "goal_thread_id": thread, "result_utf8": result, "task_path": case["task_path"]}


def verify(manifest_path, workspace_root, session_root):
    raw = read_regular(manifest_path, "0644", "manifest", 2_000_000)
    manifest = parse_json(raw, "manifest", True)
    exact_keys(manifest, ("broker", "cases", "corpus", "qualification_credit", "schema_id"), "manifest")
    if manifest["schema_id"] != MANIFEST_SCHEMA or manifest["qualification_credit"] != 0:
        fail("manifest-fixed")
    broker, corpus_binding = manifest["broker"], manifest["corpus"]
    broker_rel, corpus_rel = broker.get("path"), corpus_binding.get("path")
    read_bound(confined(workspace_root, broker_rel, "broker"), broker, "broker", 100_000)
    corpus = load_corpus(read_bound(confined(workspace_root, corpus_rel, "corpus"), corpus_binding, "corpus", 2_000_000))
    cases = manifest["cases"]
    if not isinstance(cases, list) or not cases:
        fail("case-count")
    summaries = [verify_case(case, corpus, broker_rel, corpus_rel, session_root) for case in cases]
    for field in ("case_id", "goal_thread_id", "task_path"):
        values = [item[field] for item in summaries]
        if len(values) != len(set(values)):
            fail(f"reuse:{field}")
    return {"case_count": len(cases), "cases": summaries, "qualification_credit": 0, "schema_id": REPORT_SCHEMA, "status": "PASS"}


def main():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--workspace-root", required=True)
    parser.add_argument("--session-root", required=True)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    if not args.check or not os.path.isabs(args.manifest) or not os.path.isabs(args.workspace_root) or not os.path.isabs(args.session_root):
        fail("cli")
    report = verify(Path(args.manifest).resolve(strict=True), Path(args.workspace_root).resolve(strict=True), Path(args.session_root).resolve(strict=True))
    sys.stdout.buffer.write(canonical(report))


if __name__ == "__main__":
    try:
        main()
    except Invalid as exc:
        sys.stdout.buffer.write(canonical({"error": str(exc), "qualification_credit": 0, "schema_id": REPORT_SCHEMA, "status": "FAIL"}))
        raise SystemExit(1)
