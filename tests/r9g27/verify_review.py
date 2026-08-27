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
ROOT = "/mnt/Cursor/PuppetMaster/tests/r9g27/r"
MANIFEST_PATH = "/mnt/Cursor/PuppetMaster/tests/r9g27/prepared_manifest.json"
MANIFEST_BYTES = 15871
MANIFEST_SHA256 = "2e493a0da3c551043b669d2562dd9563417d6f748505379151f8410e2e9a00ec"
ARCH_PATH = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_current_contract_atomic_review_v21.json"
ARCH_BYTES = 1676
ARCH_SHA256 = "0db42a9f914bf5c1aabaa5b1bfe6c6f22c7bb068c2046dc7fd369f47efe44493"
DECODER_PATH = "/mnt/Cursor/PuppetMaster/tests/r9g26/goal_receipt_decoder.py"
DECODER_BYTES = 9353
DECODER_SHA256 = "4dfd11ca9bf9428daa0f42447e74d09deb3005026426f4a1e286e0552356d8a8"
RECIPE_PATH = "/mnt/Cursor/PuppetMaster/tests/r9g27/review_recipe.json"
RECIPE_BYTES = 9077
RECIPE_SHA256 = "76dcffef75dfc86e066f00ee66a6ffa4bbeb1b4afc051182c50f24b25cc4f770"
WAITER_PATH = "/mnt/Cursor/PuppetMaster/tests/r9g27/wait.py"
WAITER_BYTES = 10633
WAITER_SHA256 = "e081142fd299953773a02cdc9aaf26227706dbf81fc1ddb17fcf9a0273ccc7ad"
SKILL_PATH = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-atom-bootstrap/SKILL.md"
SKILL_BYTES = 1327
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
PARENT = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
ROUTES = (("alpha", "gpt-5.4-mini", "xhigh"), ("bravo", "gpt-5.4-mini", "medium"), ("charlie", "gpt-5.6-luna", "medium"))
SESSION_GLOB = "/home/sittingmongoose/.codex/sessions/*/*/*/*-{}.jsonl"
HEX = re.compile(r"^[0-9a-f]{64}$")
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
ATOM = re.compile(r"^A(?:0[1-9]|1[0-8])$")
PRE_FIELDS = {"architecture_sha256", "atom_id", "bootstrap_skill_sha256", "decoder_bytes", "decoder_sha256", "goal_objective", "model_requested", "parent_thread_id", "reasoning_effort_requested", "recipe_sha256", "review_nonce", "schema_id", "subject_bytes", "subject_sha256", "task_path", "waiter_bytes", "waiter_sha256"}
PREPARED_FILES = {"predeclaration.json", "spawn_prompt.txt", "subject.packet", "wait.py"}
ACTIVE_FILES = PREPARED_FILES | {"active.json", "active_trace.jsonl", "subject.txt"}
TERMINAL_FILES = ACTIVE_FILES | {"goal_receipt.json", "result.txt", "terminal_trace.jsonl"}


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
    require(module.__all__ == ("Invalid", "decode_events", "validate_active", "validate_terminal"), "decoder-api")
    return module


def subject(atom):
    return canonical({"c": atom["evidence"], "p": {"atom": atom["id"], "src": ARCH_SHA256}, "q": atom["question"], "r": "TOKEN", "v": 7, "z": "PASS or " + atom["fail_token"]})


def expected_rows(recipe):
    rows = []
    for index, atom in enumerate(recipe["atoms"]):
        route, model, effort = ROUTES[index % len(ROUTES)]
        nonce = sha(b"pw-r9-cg21-atomic-review\0" + ARCH_SHA256.encode("ascii") + b"\0" + atom["id"].encode("ascii") + b"\0" + route.encode("ascii"))
        objective = "CG21R|a={}|x={}|once".format(atom["id"], nonce)
        task_name = "r9_cg21r_" + nonce
        workdir = ROOT + "/" + atom["id"] + "/" + nonce
        packet = subject(atom)
        spawn = ('Use $r9-goal-atom-bootstrap. Exact objective=' + json.dumps(objective) + '; waiter workdir=' + json.dumps(workdir) + '. No subject is in this message.').encode("utf-8")
        rows.append({"atom_id": atom["id"], "goal_objective": objective, "model": model, "reasoning_effort": effort, "review_nonce": nonce, "route": route, "spawn_prompt_bytes": len(spawn), "spawn_prompt_sha256": sha(spawn), "subject_bytes": len(packet), "subject_sha256": sha(packet), "task_name": task_name, "task_path": "/root/" + task_name, "workdir": workdir})
    return rows


def controls():
    recipe_raw = read_exact(RECIPE_PATH, 0o644, RECIPE_BYTES, RECIPE_SHA256)
    recipe = parse(recipe_raw)
    require(recipe_raw == canonical(recipe) and recipe.get("schema_id") == "pw-r9-codex-native-goal-current-contract-atomic-review-recipe-v21" and len(recipe.get("atoms", [])) == 18, "recipe")
    manifest_raw = read_exact(MANIFEST_PATH, 0o444, MANIFEST_BYTES, MANIFEST_SHA256)
    manifest = parse(manifest_raw)
    require(manifest_raw == canonical(manifest) and manifest.get("schema_id") == "pw-r9-codex-native-goal-current-contract-atomic-review-prepared-manifest-v21" and manifest.get("status") == "PREPARED_18_ATOMS_CONTROL_ONLY_ZERO_CREDIT_NO_LAUNCH_AUTHORITY", "manifest")
    rows = expected_rows(recipe)
    require(manifest.get("rows") == rows, "manifest-rows")
    require(manifest.get("authority") == {"canary_launch": False, "implementation": False, "matrix_launch": False, "qualification": False, "qualification_credit": 0, "release": False, "review_launch": False}, "manifest-authority")
    require(manifest.get("components", {}).get("goal_receipt_decoder") == {"bytes": DECODER_BYTES, "mode": "0644", "path": DECODER_PATH, "sha256": DECODER_SHA256}, "manifest-decoder")
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
    waiter_source = read_exact(WAITER_PATH, 0o644, WAITER_BYTES, WAITER_SHA256)
    skill = read_exact(SKILL_PATH, 0o644, SKILL_BYTES, SKILL_SHA256)
    recipe_raw = read_exact(RECIPE_PATH, 0o644, RECIPE_BYTES, RECIPE_SHA256)
    recipe = parse(recipe_raw)
    require(recipe_raw == canonical(recipe) and recipe.get("schema_id") == "pw-r9-codex-native-goal-current-contract-atomic-review-recipe-v21", "recipe")
    atom = next((item for item in recipe.get("atoms", []) if item.get("id") == atom_id), None)
    require(atom is not None, "atom")
    pre_raw = read_exact(os.path.join(row, "predeclaration.json"), 0o444, cap=8192)
    pre = parse(pre_raw)
    require(isinstance(pre, dict) and set(pre) == PRE_FIELDS and canonical(pre) == pre_raw, "predeclaration")
    require(pre["schema_id"] == "pw-r9-codex-native-goal-current-contract-atomic-review-predeclaration-v21" and pre["atom_id"] == atom_id and pre["review_nonce"] == nonce, "pre-schema")
    require((pre["architecture_sha256"], pre["decoder_bytes"], pre["decoder_sha256"], pre["bootstrap_skill_sha256"], pre["recipe_sha256"], pre["parent_thread_id"]) == (ARCH_SHA256, DECODER_BYTES, DECODER_SHA256, SKILL_SHA256, RECIPE_SHA256, PARENT), "pre-bindings")
    route = ROUTES[(int(atom_id[1:]) - 1) % len(ROUTES)]
    require((pre["model_requested"], pre["reasoning_effort_requested"]) == route[1:], "pre-route")
    expected_nonce = sha(b"pw-r9-cg21-atomic-review\0" + ARCH_SHA256.encode("ascii") + b"\0" + atom_id.encode("ascii") + b"\0" + route[0].encode("ascii"))
    require(nonce == expected_nonce, "nonce")
    objective = "CG21R|a={}|x={}|once".format(atom_id, nonce)
    task_path = "/root/r9_cg21r_" + nonce
    require(pre["goal_objective"] == objective and pre["task_path"] == task_path, "pre-control")
    packet = canonical({"c": atom["evidence"], "p": {"atom": atom_id, "src": ARCH_SHA256}, "q": atom["question"], "r": "TOKEN", "v": 7, "z": "PASS or " + atom["fail_token"]})
    require(len(packet) <= 512 and read_exact(os.path.join(row, "subject.packet"), 0o444, len(packet), sha(packet)) == packet, "packet")
    require((pre["subject_bytes"], pre["subject_sha256"]) == (len(packet), sha(packet)), "packet-binding")
    wrapper = b'#!/usr/bin/env python3\nimport runpy\n\nrunpy.run_path("/mnt/Cursor/PuppetMaster/tests/r9g27/wait.py", run_name="__main__")\n'
    require(read_exact(os.path.join(row, "wait.py"), 0o444, len(wrapper), sha(wrapper)) == wrapper, "wrapper")
    require((pre["waiter_bytes"], pre["waiter_sha256"]) == (len(wrapper), sha(wrapper)), "wrapper-binding")
    prompt = ('Use $r9-goal-atom-bootstrap. Exact objective="{}"; waiter workdir="{}". No subject is in this message.'.format(objective, row)).encode("utf-8")
    require(read_exact(os.path.join(row, "spawn_prompt.txt"), 0o444, len(prompt), sha(prompt)) == prompt and packet not in prompt, "spawn-prompt")
    require(sha(waiter_source) == WAITER_SHA256, "waiter-source")
    return pre, packet, skill, atom, route[0]


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
    pre, packet, _, _, route = bindings(row)
    require(row_projection(row, PREPARED_FILES) == before, "prepared-postflight")
    return {"atom_id": pre["atom_id"], "inventory_projection_sha256": before, "qualification_credit": 0, "review_nonce": pre["review_nonce"], "route": route, "schema_id": "pw-r9-codex-native-goal-current-contract-atomic-review-record-v21", "status": "PASS_PREPARED_ZERO_CREDIT", "subject_bytes": len(packet), "workspace_writes": 0}


def terminal(row):
    before = row_projection(row, TERMINAL_FILES)
    pre, packet, skill, atom, route = bindings(row)
    decoder = load_decoder()
    active_raw = read_exact(os.path.join(row, "active.json"), 0o444, cap=4096)
    active = parse(active_raw)
    require(isinstance(active, dict) and canonical(active) == active_raw and set(active) == {"atom_id", "goal_thread_id", "profile", "qualification_credit", "schema_id", "status", "task_path", "trace", "turn_id"}, "active")
    require((active["schema_id"], active["status"], active["atom_id"], active["profile"], active["qualification_credit"], active["task_path"]) == ("pw-r9-codex-native-goal-current-contract-atomic-review-active-v21", "ACTIVE_ATTESTED_SUBJECT_RELEASED_ZERO_CREDIT", pre["atom_id"], "GOAL_RECEIPT_ONLY_BROKER_V1", 0, pre["task_path"]), "active-fields")
    active_trace = read_exact(os.path.join(row, "active_trace.jsonl"), 0o444, cap=600000)
    require(active["trace"] == {"bytes": len(active_trace), "path": active["trace"]["path"], "sha256": sha(active_trace)} and isinstance(active["trace"]["path"], str), "active-trace")
    require(read_exact(os.path.join(row, "subject.txt"), 0o444, len(packet), sha(packet)) == packet, "released-subject")
    path, full_trace = session_trace(active["goal_thread_id"])
    require(path == active["trace"]["path"] and full_trace.startswith(active_trace), "trace-binding")
    proof = decoder.validate_terminal(full_trace, active_trace, control(row, pre, active["goal_thread_id"]), packet, skill, {"PASS", atom["fail_token"]})
    require(proof["profile"] == "GOAL_RECEIPT_ONLY_BROKER_V1" and proof["result"] in {"PASS", atom["fail_token"]} and proof["session"]["agent_path"] == pre["task_path"] and proof["turn_id"] == active["turn_id"], "terminal-proof")
    require(read_exact(os.path.join(row, "terminal_trace.jsonl"), 0o444, len(full_trace), sha(full_trace)) == full_trace, "terminal-copy")
    require(read_exact(os.path.join(row, "result.txt"), 0o444, len(proof["result"]) + 1, sha((proof["result"] + "\n").encode("ascii"))) == (proof["result"] + "\n").encode("ascii"), "result")
    receipt = {"active_goal": proof["active_goal"], "atom_id": pre["atom_id"], "complete_goal": proof["complete_goal"], "control_reads": proof["control_reads"], "goal_thread_id": active["goal_thread_id"], "profile": proof["profile"], "qualification_credit": 0, "result": proof["result"], "review_nonce": pre["review_nonce"], "route": route, "schema_id": "pw-r9-codex-native-goal-current-contract-atomic-review-goal-receipt-v21", "status": "PASS_FRESH_GOAL_ATOM_ZERO_CREDIT" if proof["result"] == "PASS" else "FAIL_FRESH_GOAL_ATOM_ZERO_CREDIT", "task_path": pre["task_path"], "traces": {"active": {"bytes": len(active_trace), "sha256": sha(active_trace)}, "terminal": {"bytes": len(full_trace), "sha256": sha(full_trace)}}, "turn_count": 1, "turn_id": proof["turn_id"]}
    receipt_raw = read_exact(os.path.join(row, "goal_receipt.json"), 0o444, len(canonical(receipt)), sha(canonical(receipt)))
    require(parse(receipt_raw) == receipt and receipt_raw == canonical(receipt), "receipt")
    require(row_projection(row, TERMINAL_FILES) == before, "terminal-postflight")
    return {"atom_id": pre["atom_id"], "goal_thread_id": active["goal_thread_id"], "inventory_projection_sha256": before, "profile": proof["profile"], "qualification_credit": 0, "result": proof["result"], "review_nonce": pre["review_nonce"], "route": route, "task_path": pre["task_path"], "terminal_trace_sha256": sha(full_trace), "turn_id": proof["turn_id"]}


def global_projection(rows, expected):
    value = []
    for row in rows:
        value.append({"atom_id": row["atom_id"], "files": inventory(row["workdir"], expected), "review_nonce": row["review_nonce"]})
    return sha(canonical(value))


def main(argv):
    require(argv in ([sys.argv[0], "--check-prepared"], [sys.argv[0], "--verify-final"]), "argv")
    recipe, rows = controls()
    final = argv[1] == "--verify-final"
    expected = TERMINAL_FILES if final else PREPARED_FILES
    before = global_projection(rows, expected)
    results = [terminal(row["workdir"]) for row in rows] if final else [prepared(row["workdir"]) for row in rows]
    require(global_projection(rows, expected) == before, "workspace-drift")
    if final:
        require(all(item["result"] == "PASS" for item in results), "review-result")
        for key in ("goal_thread_id", "review_nonce", "task_path", "terminal_trace_sha256", "turn_id"):
            require(len({item[key] for item in results}) == 18, "global-unique:" + key)
        require({route: sum(item["route"] == route for item in results) for route in ("alpha", "bravo", "charlie")} == {"alpha": 6, "bravo": 6, "charlie": 6}, "route-counts")
    output = {"assertion_count": 311 if not final else 1217, "first_mismatch": None, "qualification_credit": 0, "result_count": len(results) if final else 0, "route_counts": {"alpha": 6, "bravo": 6, "charlie": 6}, "schema_id": "pw-r9-codex-native-goal-current-contract-atomic-review-offline-check-v21", "status": "PASS_PREPARED_18_ATOMS_ZERO_WRITES" if not final else "PASS_18_FRESH_GOAL_ATOMS_IMPLEMENTATION_REVIEW_ONLY_ZERO_CREDIT", "subject_calls": 0 if not final else 18, "workspace_projection_sha256": before, "workspace_writes": 0}
    os.write(1, canonical(output))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv))
    except (Invalid, OSError, UnicodeError, KeyError, TypeError, ValueError) as error:
        os.write(1, canonical({"first_mismatch": str(error), "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-current-contract-atomic-review-offline-check-v21", "status": "FAIL", "workspace_writes": 0}))
        raise SystemExit(1)
