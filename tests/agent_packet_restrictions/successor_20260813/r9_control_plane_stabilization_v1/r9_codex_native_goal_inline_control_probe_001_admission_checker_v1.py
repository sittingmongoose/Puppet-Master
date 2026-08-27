#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import stat
import sys
from pathlib import Path

TASK_NAME = "sealed_inline_control_001"
TASK_PATH = "/root/sealed_inline_control_001"
EXPECTED_BINDINGS = {
    "architecture": (6440, "a9837a821787083eee7abe549845764e070b52393d6244cb49051544631a4e4d", "r9_codex_native_goal_inline_goal_owned_packet_execution_architecture_v1.json"),
    "churn_audit": (4639, "c93d43131d15bef012fc7abac9f8704d4a0e3d085e8419ce7194dc8147bdde9a", "r9_codex_native_goal_churn_audit_20260823t211416z_v1.json"),
    "implementation_success": (3473, "0a9b1ebbe575ad9a9befcbf21b4d99c419446cc9ac35d8b1ed7f91f2dc517a5c", "r9_codex_native_goal_inline_control_probe_001_implementation_success_receipt_v1.json"),
    "mechanical_validation": (3457, "026ebb48b2362c146efd32dc12117621bdc1ba74a506d6307f80a192e98e5a22", "r9_codex_native_goal_inline_goal_owned_packet_execution_mechanical_validation_v1.json"),
    "route_capability": (5467, "6603203c251ae12fd31564902ba5fb75cb6dca5f81e4afcdc7d250795295e4db", "r9_codex_native_goal_exact_roster_route_capability_mechanical_validation_v1.json"),
    "runtime_checker": (11536, "2257fa748589485e4850ff1c608a2fdd4d0d085787a69be797becd8a909b3857", "r9_codex_native_goal_inline_control_probe_001_runtime_checker_v1.py"),
    "script": (1255, "7a3615208f22407c6721a720c6ab9e4552a3408be5e01daeea2889f2c057ae0f", "tests/r9_goal_inline/p01/run.py"),
}


class Invalid(Exception):
    pass


class Counter:
    def __init__(self):
        self.value = 0

    def require(self, condition, mismatch):
        self.value += 1
        if not condition:
            raise Invalid(mismatch)


def _constant(value):
    raise Invalid("nonfinite-json:" + value)


def _pairs(items):
    result = {}
    for key, value in items:
        if key in result:
            raise Invalid("duplicate-key:" + key)
        result[key] = value
    return result


def parse(raw, name):
    try:
        return json.loads(raw.decode("utf-8"), object_pairs_hook=_pairs, parse_constant=_constant)
    except (UnicodeDecodeError, json.JSONDecodeError, Invalid) as exc:
        raise Invalid("json:" + name) from exc


def read_file(path, mode, size=None, digest=None, cap=20000):
    before = path.stat(follow_symlinks=False)
    if not stat.S_ISREG(before.st_mode) or stat.S_IMODE(before.st_mode) != mode or before.st_uid != os.getuid() or before.st_size > cap:
        raise Invalid("custody:" + path.name)
    raw = path.read_bytes()
    after = path.stat(follow_symlinks=False)
    if (before.st_dev, before.st_ino, before.st_mode, before.st_uid, before.st_size, before.st_mtime_ns) != (after.st_dev, after.st_ino, after.st_mode, after.st_uid, after.st_size, after.st_mtime_ns):
        raise Invalid("read-drift:" + path.name)
    if size is not None and (len(raw) != size or hashlib.sha256(raw).hexdigest() != digest):
        raise Invalid("identity:" + path.name)
    return raw


def admission(path):
    raw = read_file(path, 0o644)
    if not raw.endswith(b"\n") or raw[:-1].find(b"\n") != -1 or b"\r" in raw:
        raise Invalid("admission-framing")
    value = parse(raw, "admission")
    if json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False).encode() + b"\n" != raw:
        raise Invalid("admission-canonical")
    return value, raw


def parent_spawn_count(path):
    count = 0
    with path.open("rb") as stream:
        for number, raw in enumerate(stream, 1):
            try:
                event = parse(raw.rstrip(b"\n"), "parent:" + str(number))
            except Invalid:
                raise
            payload = event.get("payload")
            if event.get("type") != "response_item" or not isinstance(payload, dict) or payload.get("type") != "function_call" or payload.get("name") != "spawn_agent":
                continue
            try:
                arguments = json.loads(payload["arguments"])
            except (KeyError, TypeError, json.JSONDecodeError) as exc:
                raise Invalid("parent-spawn-arguments:" + str(number)) from exc
            if arguments.get("task_name") == TASK_NAME:
                count += 1
    return count


def child_session_count(root):
    count = 0
    for path in sorted(root.rglob("*.jsonl")):
        try:
            with path.open("rb") as stream:
                first = stream.readline()
            if not first:
                continue
            event = parse(first.rstrip(b"\n"), "session:" + path.name)
        except (OSError, Invalid):
            raise
        payload = event.get("payload")
        if event.get("type") == "session_meta" and isinstance(payload, dict) and payload.get("agent_path") == TASK_PATH:
            count += 1
    return count


def check(admission_path, parent_trace, sessions_root):
    c = Counter()
    value, raw = admission(admission_path)
    c.require(value["schema_id"] == "pw-r9-codex-native-goal-inline-control-probe-001-admission-v1", "schema")
    c.require(value["authority"] == {"canary_launch": False, "control_probe_exactly_once": True, "empirical_subject_launch": False, "matrix_launch": False, "qualification": False, "qualification_credit": 0, "release": False, "subject_call_limit": 0}, "authority")
    c.require(value["launch"]["task_name"] == TASK_NAME and value["launch"]["fork_turns"] == "none", "task")
    c.require(value["launch"]["model"] == "gpt-5.4-mini" and value["launch"]["reasoning_effort"] == "medium", "route")
    c.require(value["launch"]["objective"] == {"bytes": 154, "sha256": "1add5db74379387f26b594eedabe650a84e51d43f09d67018afd90785efb2778", "utf8": "RUN|v1|cwd=/mnt/Cursor/PuppetMaster/tests/r9_goal_inline/p01|cmd=PYTHONDONTWRITEBYTECODE=1 python3 -B run.py|then=update_goal_complete_return_INLINE_READY"}, "objective")
    c.require(value["launch"]["initial_message"]["bytes"] == 441 and value["launch"]["initial_message"]["sha256"] == "b51b57793698af3a4b1cd09c0d031ae9ce16f6206ce3696286cc766cdea3eb9b", "initial")
    c.require(value["expected_stdout"] == {"bytes": 12, "sha256": "4bb014c8a11d13b08a9cf07035885ae4250af0bb80f6546cc2b6533d20b7a1a9", "utf8": "INLINE_READY"}, "stdout")
    c.require(value["qualification"] == {"clean_full_matrix_streak": 0, "score": "0/2", "this_probe_cannot_increment_streak": True}, "qualification")
    c.require(value["runtime_fail_closed"] == {"any_mismatch": "CONSUME THIS CONTROL TASK WITH ZERO CREDIT AND FREEZE THIS RUNTIME FAMILY", "parent_message_count": 1, "retry_relaunch_replacement_best_of_resend_substitution_or_reuse": False, "same_probe_retry": False, "subject_bytes": 0}, "failure")
    base = admission_path.parent
    self_raw = Path(__file__).read_bytes()
    expected = dict(EXPECTED_BINDINGS)
    expected["admission_checker"] = (len(self_raw), hashlib.sha256(self_raw).hexdigest(), Path(__file__).name)
    c.require(set(value["bindings"]) == set(expected), "binding-keys")
    for name, (size, digest, filename) in expected.items():
        path = Path("/mnt/Cursor/PuppetMaster") / filename if filename.startswith("tests/") else base / filename
        c.require(value["bindings"][name] == {"bytes": size, "mode": "0644", "path": filename, "sha256": digest}, "binding-record:" + name)
        read_file(path, 0o644, size, digest, max(20000, size))
        c.require(True, "binding-reopen:" + name)
    case = Path("/mnt/Cursor/PuppetMaster/tests/r9_goal_inline/p01")
    info = case.stat(follow_symlinks=False)
    c.require(stat.S_ISDIR(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o700 and info.st_uid == os.getuid(), "case")
    c.require(os.listdir(case) == ["run.py"], "case-inventory")
    spawns = parent_spawn_count(parent_trace)
    sessions = child_session_count(sessions_root)
    c.require(spawns == 0, "existing-parent-spawn")
    c.require(sessions == 0, "existing-child-session")
    return c.value, raw, spawns, sessions


def emit(status, mismatch, assertions=0, facts=None):
    value = {"assertion_count": assertions, "facts": facts, "first_mismatch": mismatch, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-inline-control-probe-001-admission-check-v1", "status": status, "workspace_writes": 0}
    sys.stdout.write(json.dumps(value, sort_keys=True, separators=(",", ":")) + "\n")


def main():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--admission")
    parser.add_argument("--parent-trace")
    parser.add_argument("--sessions-root")
    parser.add_argument("--check", action="store_true")
    args, extras = parser.parse_known_args()
    paths = [args.admission, args.parent_trace, args.sessions_root]
    if extras or not args.check or not all(paths) or not all(os.path.isabs(item) for item in paths):
        emit("FAIL", "CLI must be --admission ABS --parent-trace ABS --sessions-root ABS --check")
        return 1
    try:
        assertions, raw, spawns, sessions = check(Path(args.admission), Path(args.parent_trace), Path(args.sessions_root))
    except (Invalid, OSError, KeyError, IndexError, TypeError, ValueError, json.JSONDecodeError) as exc:
        emit("FAIL", str(exc))
        return 1
    facts = {"admission_bytes": len(raw), "admission_sha256": hashlib.sha256(raw).hexdigest(), "existing_child_sessions": sessions, "existing_parent_spawn_calls": spawns, "task_path": TASK_PATH}
    emit("PASS_MECHANICAL_FRESH_CONTROL_PROBE_ADMISSION_ZERO_CREDIT", None, assertions, facts)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
