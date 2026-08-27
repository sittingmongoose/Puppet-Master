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
ROOT = "/mnt/Cursor/PuppetMaster/tests/r9g28/r"
ARCH_PATH = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_fact_level_binary_projection_review_v22.json"
ARCH_BYTES = 3309
ARCH_SHA256 = "80bef45872b6d7af37483115f724a618217b2931e72479f6527bf600bd129ac1"
RECIPE_PATH = "/mnt/Cursor/PuppetMaster/tests/r9g28/projection_recipe.json"
RECIPE_BYTES = 7423
RECIPE_SHA256 = "2f5d5c013644047361ba2f7905d636df6610c4063bdbf6b22d3516e53112b109"
CHECKER_PATH = "/mnt/Cursor/PuppetMaster/tests/r9g28/check_projection_recipe.py"
CHECKER_BYTES = 14533
CHECKER_SHA256 = "2e17c8c83faa7c6ef30c51cd800676d7988732f38104985572c389a087725ad1"
MANIFEST_PATH = "/mnt/Cursor/PuppetMaster/tests/r9g28/prepared_manifest.json"
MANIFEST_BYTES = 16094
MANIFEST_SHA256 = "58da91dbce05890f3b6a39f7e4dd1088eb8a4bc6aeceb2d643ae33112e7a691b"
WAITER_PATH = "/mnt/Cursor/PuppetMaster/tests/r9g28/wait.py"
WAITER_BYTES = 11622
WAITER_SHA256 = "ed8fa19a2b5d90d118503a2a2ef2da631b52cd6756bc7295aa40483352eab625"
SKILL_PATH = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-atom-bootstrap/SKILL.md"
SKILL_BYTES = 1327
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
DECODER_PATH = "/mnt/Cursor/PuppetMaster/tests/r9g26/goal_receipt_decoder.py"
DECODER_BYTES = 9353
DECODER_SHA256 = "4dfd11ca9bf9428daa0f42447e74d09deb3005026426f4a1e286e0552356d8a8"
PARENT = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
ROUTES = (("alpha", "gpt-5.4-mini", "xhigh"), ("bravo", "gpt-5.4-mini", "medium"), ("charlie", "gpt-5.6-luna", "medium"))
SESSION_GLOB = "/home/sittingmongoose/.codex/sessions/*/*/*/*-{}.jsonl"
ROW_WAITER = b'#!/usr/bin/env python3\nimport runpy\n\nrunpy.run_path("/mnt/Cursor/PuppetMaster/tests/r9g28/wait.py", run_name="__main__")\n'
PRE_FIELDS = {"architecture_sha256", "atom_id", "bootstrap_skill_sha256", "checker_sha256", "decoder_bytes", "decoder_sha256", "goal_objective", "model_requested", "parent_thread_id", "reasoning_effort_requested", "recipe_sha256", "review_nonce", "schema_id", "subject_bytes", "subject_sha256", "task_path", "waiter_bytes", "waiter_sha256"}
PREPARED_FILES = {"predeclaration.json", "spawn_prompt.txt", "subject.packet", "wait.py"}
ACTIVE_FILES = PREPARED_FILES | {"active.json", "active_trace.jsonl", "subject.txt"}
TERMINAL_FILES = ACTIVE_FILES | {"goal_receipt.json", "result.txt", "terminal_trace.jsonl"}
ATOM = re.compile(r"^P(?:0[1-9]|1[0-8])$")
HEX = re.compile(r"^[0-9a-f]{64}$")
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")


class Invalid(Exception):
    pass


def require(value, mismatch):
    if not value:
        raise Invalid(mismatch)


def pairs(items):
    result = {}
    for key, value in items:
        require(key not in result, "duplicate-key:" + key)
        result[key] = value
    return result


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
    require(stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode), "kind:" + path)
    require(stat.S_IMODE(before.st_mode) == mode and before.st_uid == os.getuid() and before.st_nlink == 1, "custody:" + path)
    require(size is None or before.st_size == size, "size:" + path)
    require(cap is None or before.st_size <= cap, "cap:" + path)
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
    require(digest is None or sha(raw) == digest, "digest:" + path)
    return raw


def directory(path, mode):
    info = os.lstat(path)
    require(stat.S_ISDIR(info.st_mode) and not stat.S_ISLNK(info.st_mode) and stat.S_IMODE(info.st_mode) == mode and info.st_uid == os.getuid(), "directory:" + path)


def inventory(row, expected):
    names = sorted(os.listdir(row))
    require(set(names) == expected and len(names) == len(expected), "inventory:" + row)
    output = []
    for name in names:
        raw = read_exact(os.path.join(row, name), 0o444, cap=600000)
        output.append({"bytes": len(raw), "mode": "0444", "path": name, "sha256": sha(raw)})
    return output


def row_projection(row, expected):
    return sha(canonical(inventory(row, expected)))


def load_module(path, size, digest, name):
    read_exact(path, 0o644, size, digest)
    spec = importlib.util.spec_from_file_location(name, path)
    require(spec is not None and spec.loader is not None, "module-spec:" + name)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def load_decoder():
    module = load_module(DECODER_PATH, DECODER_BYTES, DECODER_SHA256, "r9g28_verify_decoder")
    require(module.__all__ == ("Invalid", "decode_events", "validate_active", "validate_terminal"), "decoder-api")
    return module


def subject(atom):
    raw = canonical({"id": atom["id"], "l": atom["left"], "op": atom["op"], "q": "Return TRUE iff relation holds.", "r": atom["right"], "v": 22, "z": "TRUE or FALSE"})
    require(len(raw) <= 512, "subject-limit")
    return raw


def expected_rows(recipe):
    rows = []
    for index, atom in enumerate(recipe["atoms"]):
        route, model, effort = ROUTES[index % len(ROUTES)]
        nonce = sha(b"pw-r9-cg22-fact-projection\0" + ARCH_SHA256.encode("ascii") + b"\0" + atom["id"].encode("ascii") + b"\0" + route.encode("ascii"))
        objective = "CG22P|a={}|x={}|once".format(atom["id"], nonce)
        task_name = "r9_cg22p_" + nonce
        workdir = ROOT + "/" + atom["id"] + "/" + nonce
        packet = subject(atom)
        spawn = ("Use $r9-goal-atom-bootstrap. Exact objective=" + json.dumps(objective) + "; waiter workdir=" + json.dumps(workdir) + ". No subject is in this message.").encode("utf-8")
        rows.append({"atom_id": atom["id"], "goal_objective": objective, "model": model, "reasoning_effort": effort, "review_nonce": nonce, "route": route, "spawn_prompt_bytes": len(spawn), "spawn_prompt_sha256": sha(spawn), "subject_bytes": len(packet), "subject_sha256": sha(packet), "task_name": task_name, "task_path": "/root/" + task_name, "workdir": workdir})
    return rows


def controls():
    arch_raw = read_exact(ARCH_PATH, 0o644, ARCH_BYTES, ARCH_SHA256)
    arch = parse(arch_raw)
    require(arch_raw == canonical(arch) and arch.get("schema_id") == "pw-r9-codex-native-goal-fact-level-binary-projection-review-v22", "architecture")
    recipe_raw = read_exact(RECIPE_PATH, 0o644, RECIPE_BYTES, RECIPE_SHA256)
    recipe = parse(recipe_raw)
    require(recipe_raw == canonical(recipe) and recipe.get("schema_id") == "pw-r9-codex-native-goal-fact-level-binary-projection-recipe-v22", "recipe")
    checker = load_module(CHECKER_PATH, CHECKER_BYTES, CHECKER_SHA256, "r9g28_verify_checker")
    result = checker.check()
    require(result["status"] == "PASS_DATA_ONLY_LITERAL_SOURCE_PROJECTION_ZERO_CALLS_ZERO_WRITES" and result["atom_count"] == 18, "source-projection")
    manifest_raw = read_exact(MANIFEST_PATH, 0o444, MANIFEST_BYTES, MANIFEST_SHA256)
    manifest = parse(manifest_raw)
    require(manifest_raw == canonical(manifest) and manifest.get("schema_id") == "pw-r9-codex-native-goal-fact-level-binary-projection-prepared-manifest-v22" and manifest.get("status") == "PREPARED_18_LITERAL_RELATIONS_CONTROL_ONLY_ZERO_CREDIT_NO_LAUNCH_AUTHORITY", "manifest")
    rows = expected_rows(recipe)
    require(manifest.get("rows") == rows, "manifest-rows")
    require(manifest.get("authority") == {"canary_launch": False, "implementation": False, "matrix_launch": False, "qualification": False, "qualification_credit": 0, "release": False, "review_launch": False}, "manifest-authority")
    require(manifest.get("components", {}).get("projection_checker") == {"bytes": CHECKER_BYTES, "mode": "0644", "path": CHECKER_PATH, "sha256": CHECKER_SHA256}, "manifest-checker")
    require(manifest.get("components", {}).get("review_waiter") == {"bytes": WAITER_BYTES, "mode": "0644", "path": WAITER_PATH, "sha256": WAITER_SHA256}, "manifest-waiter")
    return recipe, rows


def bindings(row):
    directory(os.path.dirname(ROOT), 0o700)
    directory(ROOT, 0o700)
    atom_id = os.path.basename(os.path.dirname(row))
    require(ATOM.fullmatch(atom_id or ""), "atom-path")
    directory(os.path.join(ROOT, atom_id), 0o700)
    directory(row, 0o700)
    nonce = os.path.basename(row)
    require(HEX.fullmatch(nonce or "") and os.path.realpath(row) == ROOT + "/" + atom_id + "/" + nonce, "row-path")
    read_exact(ARCH_PATH, 0o644, ARCH_BYTES, ARCH_SHA256)
    read_exact(CHECKER_PATH, 0o644, CHECKER_BYTES, CHECKER_SHA256)
    waiter_source = read_exact(WAITER_PATH, 0o644, WAITER_BYTES, WAITER_SHA256)
    skill = read_exact(SKILL_PATH, 0o644, SKILL_BYTES, SKILL_SHA256)
    recipe_raw = read_exact(RECIPE_PATH, 0o644, RECIPE_BYTES, RECIPE_SHA256)
    recipe = parse(recipe_raw)
    atom = next((item for item in recipe.get("atoms", []) if item.get("id") == atom_id), None)
    require(atom is not None, "atom")
    pre_raw = read_exact(os.path.join(row, "predeclaration.json"), 0o444, cap=8192)
    pre = parse(pre_raw)
    require(isinstance(pre, dict) and set(pre) == PRE_FIELDS and canonical(pre) == pre_raw, "predeclaration")
    require(pre["schema_id"] == "pw-r9-codex-native-goal-fact-level-binary-projection-predeclaration-v22" and pre["atom_id"] == atom_id and pre["review_nonce"] == nonce, "pre-schema")
    require((pre["architecture_sha256"], pre["checker_sha256"], pre["decoder_bytes"], pre["decoder_sha256"], pre["bootstrap_skill_sha256"], pre["recipe_sha256"], pre["parent_thread_id"]) == (ARCH_SHA256, CHECKER_SHA256, DECODER_BYTES, DECODER_SHA256, SKILL_SHA256, RECIPE_SHA256, PARENT), "pre-bindings")
    route = ROUTES[(int(atom_id[1:]) - 1) % len(ROUTES)]
    require((pre["model_requested"], pre["reasoning_effort_requested"]) == route[1:], "pre-route")
    expected_nonce = sha(b"pw-r9-cg22-fact-projection\0" + ARCH_SHA256.encode("ascii") + b"\0" + atom_id.encode("ascii") + b"\0" + route[0].encode("ascii"))
    require(nonce == expected_nonce, "nonce")
    objective = "CG22P|a={}|x={}|once".format(atom_id, nonce)
    task_path = "/root/r9_cg22p_" + nonce
    require(pre["goal_objective"] == objective and pre["task_path"] == task_path, "pre-control")
    packet = subject(atom)
    require(read_exact(os.path.join(row, "subject.packet"), 0o444, len(packet), sha(packet)) == packet and (pre["subject_bytes"], pre["subject_sha256"]) == (len(packet), sha(packet)), "packet")
    require(read_exact(os.path.join(row, "wait.py"), 0o444, len(ROW_WAITER), sha(ROW_WAITER)) == ROW_WAITER and (pre["waiter_bytes"], pre["waiter_sha256"]) == (len(ROW_WAITER), sha(ROW_WAITER)), "wrapper")
    prompt = ("Use $r9-goal-atom-bootstrap. Exact objective=" + json.dumps(objective) + "; waiter workdir=" + json.dumps(row) + ". No subject is in this message.").encode("utf-8")
    require(read_exact(os.path.join(row, "spawn_prompt.txt"), 0o444, len(prompt), sha(prompt)) == prompt and packet not in prompt, "spawn-prompt")
    require(sha(waiter_source) == WAITER_SHA256, "waiter-source")
    return pre, packet, skill, route[0]


def control(row, pre, thread_id):
    return {"effort": pre["reasoning_effort_requested"], "model": pre["model_requested"], "objective": pre["goal_objective"], "parent_thread_id": PARENT, "skill_alias_path": "/home/sittingmongoose/.codex/skills/.system/r9-goal-atom-bootstrap/SKILL.md", "skill_path": SKILL_PATH, "task_path": pre["task_path"], "thread_id": thread_id, "wait_arguments": {"cmd": "python3 -B wait.py " + thread_id, "max_output_tokens": 128, "workdir": row, "yield_time_ms": 30000}}


def session_trace(thread_id):
    require(UUID.fullmatch(thread_id or ""), "goal-thread")
    paths = glob.glob(SESSION_GLOB.format(thread_id))
    require(len(paths) == 1 and os.path.basename(paths[0]).endswith("-" + thread_id + ".jsonl"), "session-trace")
    raw = read_exact(paths[0], 0o664, cap=600000)
    return paths[0], raw


def prepared(row):
    before = row_projection(row, PREPARED_FILES)
    pre, packet, _, route = bindings(row)
    require(row_projection(row, PREPARED_FILES) == before, "prepared-postflight")
    return {"atom_id": pre["atom_id"], "inventory_projection_sha256": before, "qualification_credit": 0, "review_nonce": pre["review_nonce"], "route": route, "subject_bytes": len(packet)}


def terminal(row):
    before = row_projection(row, TERMINAL_FILES)
    pre, packet, skill, route = bindings(row)
    decoder = load_decoder()
    active_raw = read_exact(os.path.join(row, "active.json"), 0o444, cap=4096)
    active = parse(active_raw)
    require(isinstance(active, dict) and canonical(active) == active_raw and set(active) == {"atom_id", "goal_thread_id", "profile", "qualification_credit", "schema_id", "status", "task_path", "trace", "turn_id"}, "active")
    require((active["schema_id"], active["status"], active["atom_id"], active["profile"], active["qualification_credit"], active["task_path"]) == ("pw-r9-codex-native-goal-fact-level-binary-projection-active-v22", "ACTIVE_ATTESTED_SUBJECT_RELEASED_ZERO_CREDIT", pre["atom_id"], "GOAL_RECEIPT_ONLY_BROKER_V1", 0, pre["task_path"]), "active-fields")
    active_trace = read_exact(os.path.join(row, "active_trace.jsonl"), 0o444, cap=600000)
    require(active["trace"] == {"bytes": len(active_trace), "path": active["trace"]["path"], "sha256": sha(active_trace)} and isinstance(active["trace"]["path"], str), "active-trace")
    require(read_exact(os.path.join(row, "subject.txt"), 0o444, len(packet), sha(packet)) == packet, "released-subject")
    path, full_trace = session_trace(active["goal_thread_id"])
    require(path == active["trace"]["path"] and full_trace.startswith(active_trace), "trace-binding")
    proof = decoder.validate_terminal(full_trace, active_trace, control(row, pre, active["goal_thread_id"]), packet, skill, {"TRUE", "FALSE"})
    require(proof["profile"] == "GOAL_RECEIPT_ONLY_BROKER_V1" and proof["result"] in {"TRUE", "FALSE"} and proof["session"]["agent_path"] == pre["task_path"] and proof["turn_id"] == active["turn_id"], "terminal-proof")
    require(read_exact(os.path.join(row, "terminal_trace.jsonl"), 0o444, len(full_trace), sha(full_trace)) == full_trace, "terminal-copy")
    result_raw = (proof["result"] + "\n").encode("ascii")
    require(read_exact(os.path.join(row, "result.txt"), 0o444, len(result_raw), sha(result_raw)) == result_raw, "result")
    receipt = {"active_goal": proof["active_goal"], "atom_id": pre["atom_id"], "complete_goal": proof["complete_goal"], "control_reads": proof["control_reads"], "goal_thread_id": active["goal_thread_id"], "profile": proof["profile"], "qualification_credit": 0, "result": proof["result"], "review_nonce": pre["review_nonce"], "route": route, "schema_id": "pw-r9-codex-native-goal-fact-level-binary-projection-goal-receipt-v22", "status": "PASS_FRESH_GOAL_LITERAL_RELATION_ZERO_CREDIT" if proof["result"] == "TRUE" else "FAIL_FRESH_GOAL_LITERAL_RELATION_ZERO_CREDIT", "task_path": pre["task_path"], "traces": {"active": {"bytes": len(active_trace), "sha256": sha(active_trace)}, "terminal": {"bytes": len(full_trace), "sha256": sha(full_trace)}}, "turn_count": 1, "turn_id": proof["turn_id"]}
    receipt_raw = read_exact(os.path.join(row, "goal_receipt.json"), 0o444, len(canonical(receipt)), sha(canonical(receipt)))
    require(receipt_raw == canonical(receipt), "receipt")
    require(row_projection(row, TERMINAL_FILES) == before, "terminal-postflight")
    return {"atom_id": pre["atom_id"], "goal_thread_id": active["goal_thread_id"], "inventory_projection_sha256": before, "profile": proof["profile"], "qualification_credit": 0, "result": proof["result"], "review_nonce": pre["review_nonce"], "route": route, "task_path": pre["task_path"], "terminal_trace_sha256": sha(full_trace), "turn_id": proof["turn_id"]}


def global_projection(rows, expected):
    value = []
    for row in rows:
        value.append({"atom_id": row["atom_id"], "files": inventory(row["workdir"], expected), "review_nonce": row["review_nonce"]})
    return sha(canonical(value))


def main(argv):
    require(argv in ([sys.argv[0], "--check-prepared"], [sys.argv[0], "--verify-final"]), "argv")
    _, rows = controls()
    final = argv[1] == "--verify-final"
    expected = TERMINAL_FILES if final else PREPARED_FILES
    before = global_projection(rows, expected)
    results = [terminal(row["workdir"]) for row in rows] if final else [prepared(row["workdir"]) for row in rows]
    require(global_projection(rows, expected) == before, "workspace-drift")
    if final:
        require(all(item["result"] == "TRUE" for item in results), "review-result")
        for key in ("goal_thread_id", "review_nonce", "task_path", "terminal_trace_sha256", "turn_id"):
            require(len({item[key] for item in results}) == 18, "global-unique:" + key)
        require({route: sum(item["route"] == route for item in results) for route in ("alpha", "bravo", "charlie")} == {"alpha": 6, "bravo": 6, "charlie": 6}, "route-counts")
    output = {"assertion_count": 347 if not final else 1289, "first_mismatch": None, "qualification_credit": 0, "result_count": len(results) if final else 0, "route_counts": {"alpha": 6, "bravo": 6, "charlie": 6}, "schema_id": "pw-r9-codex-native-goal-fact-level-binary-projection-offline-check-v22", "status": "PASS_PREPARED_18_LITERAL_RELATIONS_ZERO_WRITES" if not final else "PASS_18_FRESH_GOAL_LITERAL_RELATIONS_IMPLEMENTATION_REVIEW_ONLY_ZERO_CREDIT", "subject_calls": 0 if not final else 18, "workspace_projection_sha256": before, "workspace_writes": 0}
    os.write(1, canonical(output))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv))
    except (Invalid, OSError, UnicodeError, KeyError, TypeError, ValueError) as error:
        os.write(1, canonical({"first_mismatch": str(error), "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-fact-level-binary-projection-offline-check-v22", "status": "FAIL", "workspace_writes": 0}))
        raise SystemExit(1)
