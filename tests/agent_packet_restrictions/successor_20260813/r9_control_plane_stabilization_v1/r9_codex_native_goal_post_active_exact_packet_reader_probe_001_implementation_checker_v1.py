#!/usr/bin/env python3
import argparse
import ast
import hashlib
import json
import os
import stat
import subprocess
import sys
from pathlib import Path

SELECTION_BYTES = 3572
SELECTION_SHA256 = "a4c066fa712c76ee220c5c4332422f159fd99c32bd8022cfeace8bf6820a81db"
SOURCE_BYTES = 101931
SOURCE_SHA256 = "c34ec8b9e2eba93560f3f5c8087b7e2e91cc467884d12000fdb83c6d338dfc7a"
READER_BYTES = 4830
READER_SHA256 = "5dd91d04f5a1a3ff831697a958d4b027c88a665329e4477a1bf549edb2d17e4a"
PACKET_BYTES = 486
PACKET_SHA256 = "0c9041ea70a5c97a785682402e22149c56a663fefae915f1a14500cc70463ee2"
CASE_DIR = Path("/mnt/Cursor/PuppetMaster/tests/r9_goal_packet/q10")
EXPECTED = "invalidate_and_repeat_owner_checks"


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
    value = {}
    for key, item in items:
        if key in value:
            raise Invalid("duplicate-key:" + key)
        value[key] = item
    return value


def parse_json(raw, name):
    try:
        return json.loads(raw.decode("utf-8"), object_pairs_hook=_pairs, parse_constant=_constant)
    except (UnicodeDecodeError, json.JSONDecodeError, Invalid) as exc:
        raise Invalid("json:" + name) from exc


def regular(path, expected_bytes, expected_sha256, expected_mode):
    info = path.stat(follow_symlinks=False)
    if not stat.S_ISREG(info.st_mode):
        raise Invalid("regular:" + path.name)
    if stat.S_IMODE(info.st_mode) != expected_mode or info.st_uid != os.getuid() or info.st_nlink != 1:
        raise Invalid("custody:" + path.name)
    raw = path.read_bytes()
    if len(raw) != expected_bytes or hashlib.sha256(raw).hexdigest() != expected_sha256:
        raise Invalid("identity:" + path.name)
    return raw


def canonical(path, expected_bytes, expected_sha256):
    raw = regular(path, expected_bytes, expected_sha256, 0o644)
    if not raw.endswith(b"\n") or raw[:-1].find(b"\n") != -1 or b"\r" in raw:
        raise Invalid("framing:" + path.name)
    value = parse_json(raw, path.name)
    encoded = json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False).encode() + b"\n"
    if encoded != raw:
        raise Invalid("canonical:" + path.name)
    return value


def case_inventory():
    root = CASE_DIR.stat(follow_symlinks=False)
    entries = [(str(CASE_DIR), stat.S_IMODE(root.st_mode), root.st_uid, root.st_size, root.st_mtime_ns)]
    for name in sorted(os.listdir(CASE_DIR)):
        path = CASE_DIR / name
        info = path.stat(follow_symlinks=False)
        raw = path.read_bytes() if stat.S_ISREG(info.st_mode) else b""
        entries.append((name, stat.S_IMODE(info.st_mode), info.st_uid, len(raw), info.st_mtime_ns, hashlib.sha256(raw).hexdigest()))
    return hashlib.sha256(json.dumps(entries, separators=(",", ":"), ensure_ascii=True).encode()).hexdigest()


def check_reader_ast(raw, counter):
    tree = ast.parse(raw.decode("utf-8"), filename="read_packet.py")
    imports = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            imports.update(alias.name for alias in node.names)
        elif isinstance(node, ast.ImportFrom):
            imports.add(node.module or "")
        elif isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name):
                counter.require(node.func.id not in {"eval", "exec", "open", "compile", "__import__"}, "reader-forbidden-call:" + node.func.id)
            elif isinstance(node.func, ast.Attribute):
                counter.require(node.func.attr not in {"mkdir", "makedirs", "unlink", "remove", "rename", "replace", "rmdir", "chmod", "chown", "truncate"}, "reader-forbidden-attribute:" + node.func.attr)
    counter.require(imports == {"hashlib", "json", "os", "stat", "sys"}, "reader-imports")


def check(selection_path, source_path, reader_path, packet_path):
    c = Counter()
    selection = canonical(selection_path, SELECTION_BYTES, SELECTION_SHA256)
    c.require(selection["schema_id"] == "pw-r9-codex-native-goal-post-active-exact-packet-reader-probe-selection-v1", "selection-schema")
    c.require(selection["authority"] == {"canary_launch": False, "matrix_launch": False, "qualification": False, "qualification_credit": 0, "reader_and_packet_implementation": True, "release": False, "single_transport_probe": False, "subject_call_limit": 0}, "selection-authority")
    c.require(selection["case"] == {"atom_id": "n00002", "atom_nonce": "5663dc0529cc3b97650f700a2bb61a47ec70bd8f603d87a874c209ebb1333e4b", "attempt": 0, "attempt_id": "41f1a4f799282ff5f1e4fb28", "case_id": "c005b00002", "cell": "S10A_DECISION_A06", "cell_index": 5, "dependencies": [], "dynamic": False, "kind": "EVIDENCE_SLICE_LABEL", "route": "slot-bravo"}, "selection-case")
    c.require(selection["route"] == {"fork_turns": "none", "model_requested": "gpt-5.4-mini", "reasoning_effort_requested": "medium", "slot": "slot-bravo"}, "selection-route")
    c.require(selection["packet"]["bytes"] == PACKET_BYTES and selection["packet"]["sha256"] == PACKET_SHA256 and selection["packet"]["mode"] == "0444", "selection-packet")
    c.require(selection["goal"]["subject_visible_before_active"] is False and selection["next_gate"]["automatic_live_probe"] is False, "selection-order")
    source = canonical(source_path, SOURCE_BYTES, SOURCE_SHA256)
    c.require(source["schema_id"] == "pw-r9-codex-native-goal-atomic-cell-dag-v1" and source["cell_index"] == 5 and source["route"] == "slot-bravo", "source-cell")
    node = source["nodes"][2]
    c.require(node["atom_id"] == "n00002" and node["dependencies"] == [] and node["dynamic"] is False, "source-node")
    c.require(node["subject_atom"]["bytes"] == 296 and node["subject_atom"]["sha256"] == "5ed267610e39358f0ea77c249c3290d99fe47ad1bb7206485d0e83d3e4a82ea5", "source-subject")
    payload = parse_json(node["subject_payload"]["utf8"].encode(), "source-payload")
    c.require(payload == {"op": "label", "t": "options", "x": EXPECTED}, "source-expected")
    control = "WORK|v1|case=c005b00002|subject=" + node["subject_atom"]["sha256"] + "|criterion=extract_x_from_p|terminal=OUTCOME:<TOKEN>|token=^[A-Za-z0-9._:-]{1,48}$|ACK=BOUND"
    expected_packet = control.encode() + b"\n" + node["subject_atom"]["utf8"].encode() + b"\n"
    c.require(len(control.encode()) == 188 and hashlib.sha256(control.encode()).hexdigest() == "dc2989da2b4c45e5d0dbc042191ce73d8d96194534c9a7ba3dcf9d50b8afbb08", "control")
    c.require(len(expected_packet) == PACKET_BYTES and hashlib.sha256(expected_packet).hexdigest() == PACKET_SHA256, "packet-recipe")
    packet = regular(packet_path, PACKET_BYTES, PACKET_SHA256, 0o444)
    c.require(packet == expected_packet and packet_path == CASE_DIR / "packet.txt", "packet-bytes")
    reader = regular(reader_path, READER_BYTES, READER_SHA256, 0o644)
    c.require(reader_path == CASE_DIR / "read_packet.py", "reader-path")
    check_reader_ast(reader, c)
    root = CASE_DIR.stat(follow_symlinks=False)
    c.require(stat.S_ISDIR(root.st_mode) and stat.S_IMODE(root.st_mode) == 0o700 and root.st_uid == os.getuid(), "case-directory")
    c.require(sorted(os.listdir(CASE_DIR)) == ["packet.txt", "read_packet.py"], "case-inventory")
    before = case_inventory()
    env = dict(os.environ)
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    result = subprocess.run(["python3", "-B", "read_packet.py"], cwd=str(CASE_DIR), env=env, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=10, check=False)
    after = case_inventory()
    c.require(result.returncode == 0, "reader-return-code")
    c.require(result.stdout == expected_packet and result.stderr == b"", "reader-output")
    c.require(before == after, "reader-no-write")
    c.require(hashlib.sha256(EXPECTED.encode()).hexdigest() == "51dac067730f2f6f6d9d4c60c90ed523cfbee2b9320d390351f2d81e32c67c38" and len(EXPECTED.encode()) == 34, "expected")
    return c.value, before


def emit(status, mismatch, assertions=0, inventory=None):
    value = {"assertion_count": assertions, "case_inventory_sha256": inventory, "first_mismatch": mismatch, "reader_executions": 1 if status.startswith("PASS") else 0, "schema_id": "pw-r9-codex-native-goal-post-active-exact-packet-reader-implementation-check-v1", "status": status, "workspace_writes": 0}
    sys.stdout.write(json.dumps(value, sort_keys=True, separators=(",", ":")) + "\n")


def main():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--selection")
    parser.add_argument("--source")
    parser.add_argument("--reader")
    parser.add_argument("--packet")
    parser.add_argument("--check", action="store_true")
    args, extras = parser.parse_known_args()
    paths = [args.selection, args.source, args.reader, args.packet]
    if extras or not args.check or not all(paths) or not all(os.path.isabs(item) for item in paths):
        emit("FAIL", "CLI must be --selection ABS --source ABS --reader ABS --packet ABS --check")
        return 1
    try:
        assertions, inventory = check(*(Path(item) for item in paths))
    except (Invalid, OSError, KeyError, IndexError, TypeError, ValueError, subprocess.SubprocessError) as exc:
        emit("FAIL", str(exc))
        return 1
    emit("PASS_MECHANICAL_IMPLEMENTATION_ZERO_CREDIT", None, assertions, inventory)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
