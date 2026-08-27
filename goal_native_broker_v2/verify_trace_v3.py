#!/usr/bin/env python3
import argparse
import hashlib
import importlib.util
import os
import stat
import sys
from pathlib import Path

BASE_BYTES = 17205
BASE_SHA256 = "8a61851dd8ded6220533ca973b9b7126448de9a7b89018b2bbe4042a6486df95"
MANIFEST_SCHEMA = "pw-codex-native-goal-broker-trace-verifier-manifest-v3"
REPORT_SCHEMA = "pw-codex-native-goal-broker-trace-verification-v3"


def load_base():
    path = Path(__file__).resolve(strict=True).with_name("verify_trace.py")
    before = path.lstat()
    if not stat.S_ISREG(before.st_mode) or before.st_nlink != 1 or stat.S_IMODE(before.st_mode) != 0o644 or before.st_size != BASE_BYTES:
        raise RuntimeError("base-custody")
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_CLOEXEC", 0) | getattr(os, "O_NOFOLLOW", 0))
    try:
        raw = b""
        while True:
            block = os.read(fd, 65536)
            if not block:
                break
            raw += block
    finally:
        os.close(fd)
    after = path.lstat()
    if hashlib.sha256(raw).hexdigest() != BASE_SHA256 or (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) != (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns):
        raise RuntimeError("base-identity")
    spec = importlib.util.spec_from_file_location("_goal_native_broker_verifier_v2", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("base-loader")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


v2 = load_base()


def verify_case(case, corpus, broker_rel, corpus_rel, session_root):
    v2.exact_keys(case, ("case_id", "goal_thread_id", "objective", "requested_model", "requested_reasoning_effort", "result_utf8", "task_path", "trace"), "manifest-case")
    cid, thread = case["case_id"], case["goal_thread_id"]
    if cid not in corpus or not isinstance(thread, str) or not v2.UUID.fullmatch(thread) or not isinstance(case["task_path"], str) or not case["task_path"].startswith("/root/"):
        v2.fail("case-identity")
    binding = case["trace"]
    v2.exact_keys(binding, ("bytes", "mode", "relative_path", "sha256"), "trace-binding")
    path = v2.confined(session_root, binding["relative_path"], "trace")
    raw = v2.read_regular(path, binding["mode"], "trace")
    if len(raw) != binding["bytes"] or v2.sha256(raw) != binding["sha256"] or not raw.endswith(b"\n"):
        v2.fail("trace-identity")
    records = [v2.parse_json(line, f"trace-line-{index}") for index, line in enumerate(raw.splitlines(), 1)]
    metas = [record.get("payload") for record in records if record.get("type") == "session_meta"]
    if len(metas) != 1 or not isinstance(metas[0], dict):
        v2.fail("session-meta")
    meta = metas[0]
    spawn = meta.get("source", {}).get("subagent", {}).get("thread_spawn", {})
    if meta.get("id") != thread or spawn.get("agent_path") != case["task_path"] or spawn.get("depth") != 1:
        v2.fail("session-identity")
    turns = [record.get("payload") for record in records if record.get("type") == "turn_context"]
    if len(turns) != 1 or turns[0].get("model") != case["requested_model"] or turns[0].get("effort") != case["requested_reasoning_effort"]:
        v2.fail("route")
    events, final, encoding = v2.events_from_records(records)
    if [event["name"] for event in events] != ["create_goal", "exec_command", "update_goal"]:
        v2.fail("tool-order")
    create, execute, update = events
    if create["encoding"] == "function_call_v1":
        if v2.function_args(create, "create") != {"objective": case["objective"]}:
            v2.fail("create-arguments")
    elif v2.custom_string(create["input"], "create_goal", "objective", "custom-objective") != case["objective"] or "token_budget" in create["input"]:
        v2.fail("custom-create")
    active = v2.goal_receipt(create, "active")
    if active.get("threadId") != thread or active.get("objective") != case["objective"] or active.get("status") != "active":
        v2.fail("active-goal")
    command = f"python3 -B {broker_rel} --corpus {corpus_rel} --case {cid} --thread {thread} --release"
    if v2.exec_command(execute) != command:
        v2.fail("broker-command")
    expected = corpus[cid]
    release = v2.release_from_output(v2.event_output(execute, "broker"))
    if release != {"case_id": cid, "goal_thread_id": thread, "schema_id": v2.RELEASE_SCHEMA, "subject_sha256": expected["subject_sha256"], "subject_utf8": expected["subject_utf8"]}:
        v2.fail("release-value")
    if update["encoding"] == "function_call_v1":
        if v2.function_args(update, "update") != {"status": "complete"}:
            v2.fail("update-arguments")
    elif not v2.re.search(r'tools\.update_goal\(\{status\s*:\s*"complete"\}\)', update["input"]):
        v2.fail("custom-update")
    complete = v2.goal_receipt(update, "complete")
    if complete.get("threadId") != thread or complete.get("objective") != case["objective"] or complete.get("status") != "complete":
        v2.fail("complete-goal")
    result = case["result_utf8"]
    if not isinstance(result, str) or not v2.RESULT.fullmatch(result) or final != result:
        v2.fail("final-result")
    return {"case_id": cid, "encoding": encoding, "goal_thread_id": thread, "result_utf8": result, "task_path": case["task_path"]}


def verify(manifest_path, workspace_root, session_root):
    raw = v2.read_regular(manifest_path, "0644", "manifest", 2_000_000)
    manifest = v2.parse_json(raw, "manifest", True)
    v2.exact_keys(manifest, ("broker", "cases", "corpus", "qualification_credit", "schema_id"), "manifest")
    if manifest["schema_id"] != MANIFEST_SCHEMA or manifest["qualification_credit"] != 0:
        v2.fail("manifest-fixed")
    broker, corpus_binding = manifest["broker"], manifest["corpus"]
    broker_rel, corpus_rel = broker.get("path"), corpus_binding.get("path")
    v2.read_bound(v2.confined(workspace_root, broker_rel, "broker"), broker, "broker", 100_000)
    corpus = v2.load_corpus(v2.read_bound(v2.confined(workspace_root, corpus_rel, "corpus"), corpus_binding, "corpus", 2_000_000))
    cases = manifest["cases"]
    if not isinstance(cases, list) or not cases:
        v2.fail("case-count")
    summaries = [verify_case(case, corpus, broker_rel, corpus_rel, session_root) for case in cases]
    for field in ("case_id", "goal_thread_id", "task_path"):
        values = [item[field] for item in summaries]
        if len(values) != len(set(values)):
            v2.fail(f"reuse:{field}")
    return {"case_count": len(cases), "cases": summaries, "qualification_credit": 0, "schema_id": REPORT_SCHEMA, "status": "PASS"}


def main():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--workspace-root", required=True)
    parser.add_argument("--session-root", required=True)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    if not args.check or not os.path.isabs(args.manifest) or not os.path.isabs(args.workspace_root) or not os.path.isabs(args.session_root):
        v2.fail("cli")
    report = verify(Path(args.manifest).resolve(strict=True), Path(args.workspace_root).resolve(strict=True), Path(args.session_root).resolve(strict=True))
    sys.stdout.buffer.write(v2.canonical(report))


if __name__ == "__main__":
    try:
        main()
    except (v2.Invalid, RuntimeError) as exc:
        sys.stdout.buffer.write(v2.canonical({"error": str(exc), "qualification_credit": 0, "schema_id": REPORT_SCHEMA, "status": "FAIL"}))
        raise SystemExit(1)
