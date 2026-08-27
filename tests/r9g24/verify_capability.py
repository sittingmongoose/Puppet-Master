#!/usr/bin/env python3
import glob
import hashlib
import importlib.util
import json
import math
import os
import re
import stat
import sys

sys.dont_write_bytecode = True
ROOT = "/mnt/Cursor/PuppetMaster/tests/r9g24/r/CAP03"
ARCH_PATH = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_dual_profile_capability_v18.json"
ARCH_BYTES = 1675
ARCH_SHA256 = "731721fb39baea167483fe0bc675fdeebf1b149550dbb807644ee967cb62e192"
DECODER_PATH = "/mnt/Cursor/PuppetMaster/tests/r9g24/profile_decoder.py"
DECODER_BYTES = 14662
DECODER_SHA256 = "d0b112bd6b36061204aa79a505df40a48dfa8b63f69756251c2500ea7893e15c"
WAITER_PATH = "/mnt/Cursor/PuppetMaster/tests/r9g24/wait.py"
WAITER_BYTES = 9604
WAITER_SHA256 = "c15fb182471fa64b07018474f0424d83ce2c1c7c3b57e0347434af4d57c0a4ca"
SKILL_PATH = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-atom-bootstrap/SKILL.md"
SKILL_BYTES = 1327
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
PARENT = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
MODEL = "gpt-5.4-mini"
EFFORT = "xhigh"
SESSION_GLOB = "/home/sittingmongoose/.codex/sessions/*/*/*/*-{}.jsonl"
HEX = re.compile(r"^[0-9a-f]{64}$")
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
PRE_FIELDS = {"architecture_sha256", "atom_id", "bootstrap_skill_sha256", "decoder_sha256", "goal_objective", "model_requested", "parent_thread_id", "reasoning_effort_requested", "review_nonce", "schema_id", "subject_bytes", "subject_sha256", "task_path", "waiter_bytes", "waiter_sha256"}
PREPARED_FILES = {"predeclaration.json", "spawn_prompt.txt", "subject.packet", "wait.py"}
TERMINAL_FILES = PREPARED_FILES | {"active.json", "active_trace.jsonl", "subject.txt"}


class Invalid(Exception):
    pass


def require(value, mismatch):
    if not value:
        raise Invalid(mismatch)


def pairs(items):
    value = {}
    for key, item in items:
        require(key not in value, "duplicate-key:" + key)
        value[key] = item
    return value


def finite(value):
    if isinstance(value, float):
        return math.isfinite(value)
    if isinstance(value, list):
        return all(finite(item) for item in value)
    if isinstance(value, dict):
        return all(isinstance(key, str) and finite(item) for key, item in value.items())
    return True


def parse(raw):
    value = json.loads(raw.decode("utf-8"), object_pairs_hook=pairs, parse_constant=lambda item: (_ for _ in ()).throw(Invalid("nonfinite:" + item)))
    require(finite(value), "finite")
    return value


def canonical(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8") + b"\n"


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def metadata(info):
    return (info.st_dev, info.st_ino, info.st_mode, info.st_uid, info.st_nlink, info.st_size, info.st_mtime_ns)


def read_exact(path, mode, size=None, digest=None, cap=None):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode), "regular:" + path)
    require(stat.S_IMODE(before.st_mode) == mode and before.st_uid == os.getuid() and before.st_nlink == 1, "custody:" + path)
    require((size is None or before.st_size == size) and (cap is None or before.st_size <= cap), "size:" + path)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        require(metadata(os.fstat(fd)) == metadata(before), "race:" + path)
        raw = b""
        while len(raw) < before.st_size:
            part = os.read(fd, before.st_size - len(raw))
            require(bool(part), "short:" + path)
            raw += part
        require(os.read(fd, 1) == b"", "trailing:" + path)
    finally:
        os.close(fd)
    require(metadata(os.lstat(path)) == metadata(before), "drift:" + path)
    require(digest is None or sha(raw) == digest, "hash:" + path)
    return raw


def directory(path, mode):
    info = os.lstat(path)
    require(stat.S_ISDIR(info.st_mode) and not stat.S_ISLNK(info.st_mode) and stat.S_IMODE(info.st_mode) == mode and info.st_uid == os.getuid(), "directory:" + path)


def inventory(row, expected):
    names = sorted(os.listdir(row))
    require(set(names) == expected and len(names) == len(expected), "inventory")
    output = []
    for name in names:
        raw = read_exact(os.path.join(row, name), 0o444, cap=600000)
        output.append({"bytes": len(raw), "mode": "0444", "path": name, "sha256": sha(raw)})
    return output


def row_projection(row, expected):
    return sha(canonical(inventory(row, expected)))


def load_decoder():
    read_exact(DECODER_PATH, 0o644, DECODER_BYTES, DECODER_SHA256)
    spec = importlib.util.spec_from_file_location("r9g24_verify_decoder", DECODER_PATH)
    require(spec is not None and spec.loader is not None, "decoder-spec")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    require(module.__all__ == ("Invalid", "decode_events", "profile", "validate_active", "validate_terminal"), "decoder-api")
    return module


def bindings(row):
    directory(os.path.dirname(ROOT), 0o700)
    directory(ROOT, 0o700)
    directory(row, 0o700)
    nonce = os.path.basename(row)
    require(HEX.fullmatch(nonce or "") and os.path.realpath(row) == ROOT + "/" + nonce, "row-path")
    read_exact(ARCH_PATH, 0o644, ARCH_BYTES, ARCH_SHA256)
    waiter_source = read_exact(WAITER_PATH, 0o644, WAITER_BYTES, WAITER_SHA256)
    skill = read_exact(SKILL_PATH, 0o644, SKILL_BYTES, SKILL_SHA256)
    pre_raw = read_exact(os.path.join(row, "predeclaration.json"), 0o444, cap=8192)
    pre = parse(pre_raw)
    require(isinstance(pre, dict) and set(pre) == PRE_FIELDS and canonical(pre) == pre_raw, "predeclaration")
    require(pre["schema_id"] == "pw-r9-codex-native-goal-dual-profile-capability-predeclaration-v18" and pre["atom_id"] == "CAP03" and pre["review_nonce"] == nonce, "pre-schema")
    require((pre["architecture_sha256"], pre["decoder_sha256"], pre["bootstrap_skill_sha256"], pre["parent_thread_id"]) == (ARCH_SHA256, DECODER_SHA256, SKILL_SHA256, PARENT), "pre-bindings")
    require((pre["model_requested"], pre["reasoning_effort_requested"]) == (MODEL, EFFORT), "pre-route")
    objective = "CG18CAP|x={}|once".format(nonce)
    task_path = "/root/r9_cg18cap_" + nonce
    require(pre["goal_objective"] == objective and pre["task_path"] == task_path, "pre-control")
    packet = canonical({"c": "one direct profile token", "p": {"atom": "CAP03", "src": ARCH_SHA256}, "q": "Return OK", "r": "TOKEN", "v": 5, "z": "OK or FAIL_DIRECT_PROFILE"})
    require(len(packet) <= 256 and read_exact(os.path.join(row, "subject.packet"), 0o444, len(packet), sha(packet)) == packet, "packet")
    require((pre["subject_bytes"], pre["subject_sha256"]) == (len(packet), sha(packet)), "packet-binding")
    wrapper = b'#!/usr/bin/env python3\nimport runpy\n\nrunpy.run_path("/mnt/Cursor/PuppetMaster/tests/r9g24/wait.py", run_name="__main__")\n'
    require(read_exact(os.path.join(row, "wait.py"), 0o444, len(wrapper), sha(wrapper)) == wrapper, "wrapper")
    require((pre["waiter_bytes"], pre["waiter_sha256"]) == (len(wrapper), sha(wrapper)), "wrapper-binding")
    prompt = ('Use $r9-goal-atom-bootstrap. Exact objective="{}"; waiter workdir="{}". No subject is in this message.\n'.format(objective, row)).encode("utf-8")
    require(read_exact(os.path.join(row, "spawn_prompt.txt"), 0o444, len(prompt), sha(prompt)) == prompt and packet not in prompt, "spawn-prompt")
    require(sha(waiter_source) == WAITER_SHA256, "waiter-source")
    return pre, packet, skill


def control(row, pre, thread_id):
    return {"effort": EFFORT, "model": MODEL, "objective": pre["goal_objective"], "parent_thread_id": PARENT, "skill_path": SKILL_PATH, "task_path": pre["task_path"], "thread_id": thread_id, "wait_arguments": {"cmd": "python3 -B wait.py " + thread_id, "max_output_tokens": 128, "workdir": row, "yield_time_ms": 30000}}


def session_trace(thread_id):
    require(UUID.fullmatch(thread_id or ""), "goal-thread")
    paths = glob.glob(SESSION_GLOB.format(thread_id))
    require(len(paths) == 1 and os.path.basename(paths[0]).endswith("-" + thread_id + ".jsonl"), "session-trace")
    raw = read_exact(paths[0], 0o664, cap=600000)
    return paths[0], raw


def prepared(row):
    before = row_projection(row, PREPARED_FILES)
    pre, packet, _ = bindings(row)
    require(row_projection(row, PREPARED_FILES) == before, "prepared-postflight")
    return {"atom_id": "CAP03", "inventory_projection_sha256": before, "qualification_credit": 0, "review_nonce": pre["review_nonce"], "schema_id": "pw-r9-codex-native-goal-dual-profile-capability-verification-v18", "status": "PASS_PREPARED_ZERO_CREDIT", "subject_bytes": len(packet), "workspace_writes": 0}


def terminal(row):
    before = row_projection(row, TERMINAL_FILES)
    pre, packet, skill = bindings(row)
    decoder = load_decoder()
    active_raw = read_exact(os.path.join(row, "active.json"), 0o444, cap=4096)
    active = parse(active_raw)
    require(isinstance(active, dict) and canonical(active) == active_raw and set(active) == {"atom_id", "goal_thread_id", "profile", "qualification_credit", "schema_id", "status", "task_path", "trace", "turn_id"}, "active")
    require((active["schema_id"], active["status"], active["atom_id"], active["profile"], active["qualification_credit"], active["task_path"]) == ("pw-r9-codex-native-goal-dual-profile-capability-active-v18", "ACTIVE_ATTESTED_SUBJECT_RELEASED_ZERO_CREDIT", "CAP03", "DIRECT_FUNCTION_CALL_V1", 0, pre["task_path"]), "active-fields")
    active_trace = read_exact(os.path.join(row, "active_trace.jsonl"), 0o444, cap=600000)
    require(active["trace"] == {"bytes": len(active_trace), "path": active["trace"]["path"], "sha256": sha(active_trace)} and isinstance(active["trace"]["path"], str), "active-trace")
    require(read_exact(os.path.join(row, "subject.txt"), 0o444, len(packet), sha(packet)) == packet, "released-subject")
    path, full_trace = session_trace(active["goal_thread_id"])
    require(path == active["trace"]["path"] and full_trace.startswith(active_trace), "trace-binding")
    proof = decoder.validate_terminal(full_trace, active_trace, control(row, pre, active["goal_thread_id"]), packet, skill, {"OK"})
    require(proof["profile"] == "DIRECT_FUNCTION_CALL_V1" and proof["result"] == "OK" and proof["session"]["agent_path"] == pre["task_path"] and proof["turn_id"] == active["turn_id"], "terminal-proof")
    require(row_projection(row, TERMINAL_FILES) == before, "terminal-postflight")
    return {"atom_id": "CAP03", "goal_thread_id": active["goal_thread_id"], "inventory_projection_sha256": before, "profile": proof["profile"], "qualification_credit": 0, "result": proof["result"], "review_nonce": pre["review_nonce"], "schema_id": "pw-r9-codex-native-goal-dual-profile-capability-verification-v18", "status": "PASS_DIRECT_MINI_GOAL_CAPABILITY_ZERO_CREDIT", "task_path": pre["task_path"], "terminal_trace": {"bytes": len(full_trace), "path": path, "sha256": sha(full_trace)}, "workspace_writes": 0}


def main(argv):
    require(len(argv) == 3 and argv[1] in {"--prepared", "--terminal"} and os.path.isabs(argv[2]), "argv")
    result = prepared(argv[2]) if argv[1] == "--prepared" else terminal(argv[2])
    os.write(1, canonical(result))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv))
    except (Invalid, OSError, UnicodeError, KeyError, TypeError, ValueError) as error:
        os.write(1, canonical({"first_mismatch": str(error), "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-dual-profile-capability-verification-v18", "status": "FAIL", "workspace_writes": 0}))
        raise SystemExit(1)
