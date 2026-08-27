#!/usr/bin/env python3
import argparse
import ast
import hashlib
import json
import os
import stat
import sys
from pathlib import Path

SELECTION_BYTES = 3572
SELECTION_SHA256 = "a4c066fa712c76ee220c5c4332422f159fd99c32bd8022cfeace8bf6820a81db"
IMPLEMENTATION_BYTES = 4349
IMPLEMENTATION_SHA256 = "3f77464e28eb2b72e03856c5f6ccbc190df466626d89d735872f915da7918b20"
RUNTIME_CHECKER_BYTES = 14477
RUNTIME_CHECKER_SHA256 = "da445caa4976a5e21fc0c02e19cf5bb04d43ab02402f38ff8620df0b7cd50158"
SOURCE_BYTES = 101931
SOURCE_SHA256 = "c34ec8b9e2eba93560f3f5c8087b7e2e91cc467884d12000fdb83c6d338dfc7a"
READER_BYTES = 4830
READER_SHA256 = "5dd91d04f5a1a3ff831697a958d4b027c88a665329e4477a1bf549edb2d17e4a"
PACKET_BYTES = 486
PACKET_SHA256 = "0c9041ea70a5c97a785682402e22149c56a663fefae915f1a14500cc70463ee2"
INITIAL = "Start one native Goal with objective `sealed:v3:c005b00002;no-retry` as your first tool call. Before ACTIVE, do not read files or use skills. After ACTIVE, reply exactly `ACTIVE` and wait for one follow-up."
FOLLOW = "RUN|v1|cmd=PYTHONDONTWRITEBYTECODE=1 python3 -B read_packet.py|cwd=/mnt/Cursor/PuppetMaster/tests/r9_goal_packet/q10|yield_ms=10000|login=false|max_output_tokens=4000|stdout_bytes=486|stdout_sha256=0c9041ea70a5c97a785682402e22149c56a663fefae915f1a14500cc70463ee2|then=solve_update_current_goal_complete_return_OUTCOME"
OBJECTIVE = "sealed:v3:c005b00002;no-retry"
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
    if not stat.S_ISREG(info.st_mode) or stat.S_IMODE(info.st_mode) != expected_mode or info.st_uid != os.getuid() or info.st_nlink != 1:
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


def check(selection_path, implementation_path, runtime_checker_path, source_path, reader_path, packet_path):
    c = Counter()
    selection = canonical(selection_path, SELECTION_BYTES, SELECTION_SHA256)
    implementation = canonical(implementation_path, IMPLEMENTATION_BYTES, IMPLEMENTATION_SHA256)
    c.require(selection["authority"]["reader_and_packet_implementation"] is True and selection["authority"]["single_transport_probe"] is False, "selection-authority")
    c.require(implementation["status"] == "PASS_MECHANICAL_IMPLEMENTATION_ONLY_ZERO_CREDIT_NO_LIVE_PROBE_CANARY_MATRIX_OR_QUALIFICATION_AUTHORITY", "implementation-status")
    c.require(implementation["authority"] == {"canary_launch": False, "matrix_launch": False, "qualification": False, "qualification_credit": 0, "release": False, "single_transport_probe": False}, "implementation-authority")
    source = canonical(source_path, SOURCE_BYTES, SOURCE_SHA256)
    node = source["nodes"][2]
    c.require(source["schema_id"] == "pw-r9-codex-native-goal-atomic-cell-dag-v1" and source["cell_index"] == 5 and source["route"] == "slot-bravo", "source-cell")
    c.require(node["atom_id"] == "n00002" and node["atom_nonce"] == "5663dc0529cc3b97650f700a2bb61a47ec70bd8f603d87a874c209ebb1333e4b" and node["attempt_id"] == "41f1a4f799282ff5f1e4fb28", "source-node")
    c.require(node["dependencies"] == [] and node["dynamic"] is False and node["result_validation"] == {"regex": "[A-Za-z0-9._:-]+", "utf8_bytes_max": 48, "utf8_bytes_min": 1}, "source-static")
    payload = parse_json(node["subject_payload"]["utf8"].encode(), "payload")
    c.require(payload == {"op": "label", "t": "options", "x": EXPECTED}, "expected-derivation")
    packet = regular(packet_path, PACKET_BYTES, PACKET_SHA256, 0o444)
    control = "WORK|v1|case=c005b00002|subject=" + node["subject_atom"]["sha256"] + "|criterion=extract_x_from_p|terminal=OUTCOME:<TOKEN>|token=^[A-Za-z0-9._:-]{1,48}$|ACK=BOUND"
    expected_packet = control.encode() + b"\n" + node["subject_atom"]["utf8"].encode() + b"\n"
    c.require(packet == expected_packet and len(packet) <= 512, "packet-recipe")
    c.require(packet_path == Path("/mnt/Cursor/PuppetMaster/tests/r9_goal_packet/q10/packet.txt"), "packet-path")
    reader = regular(reader_path, READER_BYTES, READER_SHA256, 0o644)
    c.require(reader_path == Path("/mnt/Cursor/PuppetMaster/tests/r9_goal_packet/q10/read_packet.py"), "reader-path")
    tree = ast.parse(reader.decode("utf-8"), filename="read_packet.py")
    imports = {alias.name for item in ast.walk(tree) if isinstance(item, ast.Import) for alias in item.names}
    c.require(imports == {"hashlib", "json", "os", "stat", "sys"}, "reader-imports")
    c.require(b"os.write(1, raw)" in reader and b"PACKET_SHA256 = \"" + PACKET_SHA256.encode() + b"\"" in reader, "reader-output-binding")
    runtime = regular(runtime_checker_path, RUNTIME_CHECKER_BYTES, RUNTIME_CHECKER_SHA256, 0o644)
    c.require(runtime_checker_path.name == "r9_codex_native_goal_post_active_exact_packet_reader_probe_001_runtime_checker_v1.py", "runtime-checker-path")
    ast.parse(runtime.decode("utf-8"), filename=runtime_checker_path.name)
    c.require(b"packet-tool-visible-exact" in runtime and b"no-scored-bytes-before-reader-output" in runtime and b"message_plaintext_rederived" in runtime, "runtime-checker-coverage")
    c.require(len(INITIAL.encode()) == 206 and hashlib.sha256(INITIAL.encode()).hexdigest() == "c86b05a4ed03a44ce8c2e3b76d679b64401ebc8d2872313fcd516abb993085f5", "initial-identity")
    c.require(len(FOLLOW.encode()) == 317 and hashlib.sha256(FOLLOW.encode()).hexdigest() == "bdafbb60b51588c01ca54747e0a582e3ee55d6c7e143d799686651e0c3e82081", "follow-identity")
    c.require(len(OBJECTIVE.encode()) == 29 and hashlib.sha256(OBJECTIVE.encode()).hexdigest() == "613a9c162e33a67fe1b3d522d39ecfd29c028df78e1e8a17ec2c23aff11bc4cc", "objective-identity")
    c.require(len(EXPECTED.encode()) == 34 and hashlib.sha256(EXPECTED.encode()).hexdigest() == "51dac067730f2f6f6d9d4c60c90ed523cfbee2b9320d390351f2d81e32c67c38", "expected-identity")
    c.require(EXPECTED not in INITIAL and EXPECTED not in FOLLOW and node["subject_atom"]["utf8"] not in INITIAL and node["subject_atom"]["utf8"] not in FOLLOW, "messages-no-scored-bytes")
    c.require("first tool call" in INITIAL and "Before ACTIVE" in INITIAL and "do not read files or use skills" in INITIAL, "goal-first")
    c.require("PYTHONDONTWRITEBYTECODE=1 python3 -B read_packet.py" in FOLLOW and "stdout_bytes=486" in FOLLOW and ("stdout_sha256=" + PACKET_SHA256) in FOLLOW, "follow-reader-binding")
    case = reader_path.parent.stat(follow_symlinks=False)
    c.require(stat.S_ISDIR(case.st_mode) and stat.S_IMODE(case.st_mode) == 0o700 and case.st_uid == os.getuid(), "case-directory")
    c.require(sorted(os.listdir(reader_path.parent)) == ["packet.txt", "read_packet.py"], "case-inventory")
    c.require(selection["freshness"]["runtime_task_name"] == "sealed_packet_reader_001" and selection["freshness"]["runtime_task_name_occurrences_before_selection"] == 0, "task-freshness")
    c.require(selection["route"] == {"fork_turns": "none", "model_requested": "gpt-5.4-mini", "reasoning_effort_requested": "medium", "slot": "slot-bravo"}, "route")
    c.require(selection["preservation"]["qualification_state"] == "0/2" and implementation["preservation"]["qualification_state"] == "0/2", "qualification")
    c.require(selection["preservation"]["omp_lane"] == "FROZEN_SEPARATE_OWNER" and implementation["preservation"]["omp_lane"] == "FROZEN_SEPARATE_OWNER", "omp-frozen")
    return c.value


def emit(status, mismatch, assertions=0):
    value = {"assertion_count": assertions, "first_mismatch": mismatch, "schema_id": "pw-r9-codex-native-goal-post-active-exact-packet-reader-probe-admission-check-v1", "status": status, "workspace_writes": 0}
    sys.stdout.write(json.dumps(value, sort_keys=True, separators=(",", ":")) + "\n")


def main():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--selection")
    parser.add_argument("--implementation")
    parser.add_argument("--runtime-checker")
    parser.add_argument("--source")
    parser.add_argument("--reader")
    parser.add_argument("--packet")
    parser.add_argument("--check", action="store_true")
    args, extras = parser.parse_known_args()
    names = [args.selection, args.implementation, args.runtime_checker, args.source, args.reader, args.packet]
    if extras or not args.check or not all(names) or not all(os.path.isabs(item) for item in names):
        emit("FAIL", "CLI must bind six absolute input paths and --check")
        return 1
    try:
        assertions = check(*(Path(item) for item in names))
    except (Invalid, OSError, KeyError, IndexError, TypeError, ValueError) as exc:
        emit("FAIL", str(exc))
        return 1
    emit("PASS_MECHANICAL_ADMISSION_PREFLIGHT_ZERO_CREDIT", None, assertions)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
