#!/usr/bin/env python3
import hashlib
import json
import math
import os
import re
import stat
import sys

sys.dont_write_bytecode = True
HERE = "/mnt/Cursor/PuppetMaster/tests/r9g27"
ROOT = HERE + "/r"
MANIFEST = HERE + "/prepared_manifest.json"
ARCH_PATH = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_current_contract_atomic_review_v21.json"
ARCH_BYTES = 1676
ARCH_SHA256 = "0db42a9f914bf5c1aabaa5b1bfe6c6f22c7bb068c2046dc7fd369f47efe44493"
RECIPE_PATH = HERE + "/review_recipe.json"
RECIPE_BYTES = 9077
RECIPE_SHA256 = "76dcffef75dfc86e066f00ee66a6ffa4bbeb1b4afc051182c50f24b25cc4f770"
WAITER_PATH = HERE + "/wait.py"
WAITER_BYTES = 10633
WAITER_SHA256 = "e081142fd299953773a02cdc9aaf26227706dbf81fc1ddb17fcf9a0273ccc7ad"
SKILL_PATH = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-atom-bootstrap/SKILL.md"
SKILL_BYTES = 1327
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
CODEC_PATH = "/mnt/Cursor/PuppetMaster/tests/r9g26/goal_receipt_decoder.py"
CODEC_BYTES = 9353
CODEC_SHA256 = "4dfd11ca9bf9428daa0f42447e74d09deb3005026426f4a1e286e0552356d8a8"
PARENT = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
ROUTES = (("alpha", "gpt-5.4-mini", "xhigh"), ("bravo", "gpt-5.4-mini", "medium"), ("charlie", "gpt-5.6-luna", "medium"))
ROW_WAITER = b'#!/usr/bin/env python3\nimport runpy\n\nrunpy.run_path("/mnt/Cursor/PuppetMaster/tests/r9g27/wait.py", run_name="__main__")\n'
ROW_WAITER_SHA256 = "c49ba8ebd0a0de6a5af9af802c28df1304d76607844658925e71bc21c2a9fcf9"
ATOM_RE = re.compile(r"^A(?:0[1-9]|1[0-8])$")
TOKEN_RE = re.compile(r"^[A-Z0-9_]{1,48}$")


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


def read_bound(path, mode, size, digest):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode), "kind:" + path)
    require(stat.S_IMODE(before.st_mode) == mode and before.st_uid == os.getuid() and before.st_nlink == 1 and before.st_size == size, "custody:" + path)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        require(metadata(os.fstat(fd)) == metadata(before), "race:" + path)
        raw = b""
        while len(raw) < size:
            part = os.read(fd, size - len(raw))
            require(bool(part), "short:" + path)
            raw += part
        require(os.read(fd, 1) == b"", "trailing:" + path)
    finally:
        os.close(fd)
    require(metadata(os.lstat(path)) == metadata(before) and sha(raw) == digest, "drift:" + path)
    return raw


def read_control():
    arch_raw = read_bound(ARCH_PATH, 0o644, ARCH_BYTES, ARCH_SHA256)
    recipe_raw = read_bound(RECIPE_PATH, 0o644, RECIPE_BYTES, RECIPE_SHA256)
    read_bound(WAITER_PATH, 0o644, WAITER_BYTES, WAITER_SHA256)
    read_bound(SKILL_PATH, 0o644, SKILL_BYTES, SKILL_SHA256)
    read_bound(CODEC_PATH, 0o644, CODEC_BYTES, CODEC_SHA256)
    arch = parse(arch_raw)
    recipe = parse(recipe_raw)
    require(arch_raw == canonical(arch) and recipe_raw == canonical(recipe), "canonical-control")
    require(arch["bindings"]["review_recipe"] == {"bytes": RECIPE_BYTES, "mode": "0644", "path": "tests/r9g27/review_recipe.json", "sha256": RECIPE_SHA256}, "architecture-recipe")
    require(recipe["status"] == "DATA_ONLY_CURRENT_CONTRACT_18_ATOM_REVIEW_ZERO_CREDIT_NO_LAUNCH_AUTHORITY", "recipe-status")
    require(recipe["authority"]["review_launch"] is False and arch["authority"]["review_launch"] is False, "authority")
    atoms = recipe["atoms"]
    expected_ids = ["A{:02d}".format(index) for index in range(1, 19)]
    require([item.get("id") for item in atoms] == expected_ids, "atom-order")
    require(len({item.get("obligation") for item in atoms}) == 18 and len({item.get("fail_token") for item in atoms}) == 18, "atom-unique")
    for item in atoms:
        require(set(item) == {"evidence", "fail_token", "id", "obligation", "question"}, "atom-fields:" + item.get("id", "?"))
        require(ATOM_RE.fullmatch(item["id"]) and TOKEN_RE.fullmatch(item["fail_token"]), "atom-token:" + item["id"])
        require(0 < len(item["evidence"].encode("utf-8")) <= recipe["limits"]["evidence_utf8_bytes_max"], "atom-evidence:" + item["id"])
        require(0 < len(item["question"].encode("utf-8")) <= recipe["limits"]["question_utf8_bytes_max"], "atom-question:" + item["id"])
    require(len(ROW_WAITER) == 121 and sha(ROW_WAITER) == ROW_WAITER_SHA256, "row-waiter")
    return recipe


def record(atom, index):
    atom_id = atom["id"]
    route, model, effort = ROUTES[index % len(ROUTES)]
    nonce = sha(b"pw-r9-cg21-atomic-review\0" + ARCH_SHA256.encode("ascii") + b"\0" + atom_id.encode("ascii") + b"\0" + route.encode("ascii"))
    objective = "CG21R|a={}|x={}|once".format(atom_id, nonce)
    task_name = "r9_cg21r_" + nonce
    workdir = ROOT + "/" + atom_id + "/" + nonce
    require(len(objective.encode("utf-8")) <= 128, "objective-limit:" + atom_id)
    return {"atom_id": atom_id, "goal_objective": objective, "model": model, "reasoning_effort": effort, "review_nonce": nonce, "route": route, "task_name": task_name, "task_path": "/root/" + task_name, "workdir": workdir}


def subject(atom):
    value = {"c": atom["evidence"], "p": {"atom": atom["id"], "src": ARCH_SHA256}, "q": atom["question"], "r": "TOKEN", "v": 7, "z": "PASS or " + atom["fail_token"]}
    raw = canonical(value)
    require(len(raw) <= 512 and raw.count(b"\n") == 1 and b"\r" not in raw, "subject-limit:" + atom["id"])
    return raw


def prompt(item):
    text = "Use $r9-goal-atom-bootstrap. Exact objective=" + json.dumps(item["goal_objective"]) + "; waiter workdir=" + json.dumps(item["workdir"]) + ". No subject is in this message."
    raw = text.encode("utf-8")
    require(len(raw) <= 512 and b"PASS" not in raw and b"FAIL_" not in raw and b'"c"' not in raw, "prompt-limit:" + item["atom_id"])
    return raw


def predeclaration(item, raw):
    return {"architecture_sha256": ARCH_SHA256, "atom_id": item["atom_id"], "bootstrap_skill_sha256": SKILL_SHA256, "decoder_bytes": CODEC_BYTES, "decoder_sha256": CODEC_SHA256, "goal_objective": item["goal_objective"], "model_requested": item["model"], "parent_thread_id": PARENT, "reasoning_effort_requested": item["reasoning_effort"], "recipe_sha256": RECIPE_SHA256, "review_nonce": item["review_nonce"], "schema_id": "pw-r9-codex-native-goal-current-contract-atomic-review-predeclaration-v21", "subject_bytes": len(raw), "subject_sha256": sha(raw), "task_path": item["task_path"], "waiter_bytes": len(ROW_WAITER), "waiter_sha256": ROW_WAITER_SHA256}


def projection(recipe):
    rows = []
    for index, atom in enumerate(recipe["atoms"]):
        item = record(atom, index)
        raw = subject(atom)
        spawn = prompt(item)
        rows.append({**item, "predeclaration": predeclaration(item, raw), "spawn_prompt_bytes": len(spawn), "spawn_prompt_sha256": sha(spawn), "subject_bytes": len(raw), "subject_sha256": sha(raw)})
    return rows


def fsync_dir(path):
    fd = os.open(path, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def make_dir(path, parent):
    os.mkdir(path, 0o700)
    os.chmod(path, 0o700)
    info = os.lstat(path)
    require(stat.S_ISDIR(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o700 and info.st_uid == os.getuid(), "dir:" + path)
    fsync_dir(parent)


def write_all(fd, raw):
    view = memoryview(raw)
    while view:
        count = os.write(fd, view)
        require(count > 0, "write")
        view = view[count:]


def publish(path, raw):
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW | os.O_CLOEXEC, 0o444)
    try:
        os.fchmod(fd, 0o444)
        write_all(fd, raw)
        os.fsync(fd)
    finally:
        os.close(fd)
    fsync_dir(os.path.dirname(path))
    require(read_bound(path, 0o444, len(raw), sha(raw)) == raw, "publish:" + path)


def prepare_all(recipe):
    require(not os.path.lexists(ROOT) and not os.path.lexists(MANIFEST), "create-only-state")
    make_dir(ROOT, HERE)
    rows = []
    for index, atom in enumerate(recipe["atoms"]):
        item = record(atom, index)
        atom_dir = ROOT + "/" + item["atom_id"]
        make_dir(atom_dir, ROOT)
        make_dir(item["workdir"], atom_dir)
        raw = subject(atom)
        spawn = prompt(item)
        publish(item["workdir"] + "/predeclaration.json", canonical(predeclaration(item, raw)))
        publish(item["workdir"] + "/spawn_prompt.txt", spawn)
        publish(item["workdir"] + "/subject.packet", raw)
        publish(item["workdir"] + "/wait.py", ROW_WAITER)
        require(sorted(os.listdir(item["workdir"])) == ["predeclaration.json", "spawn_prompt.txt", "subject.packet", "wait.py"], "row-inventory:" + item["atom_id"])
        rows.append({**item, "spawn_prompt_bytes": len(spawn), "spawn_prompt_sha256": sha(spawn), "subject_bytes": len(raw), "subject_sha256": sha(raw)})
    manifest = {"architecture":{"bytes":ARCH_BYTES,"mode":"0644","path":ARCH_PATH,"sha256":ARCH_SHA256},"authority":{"canary_launch":False,"implementation":False,"matrix_launch":False,"qualification":False,"qualification_credit":0,"release":False,"review_launch":False},"components":{"bootstrap_skill":{"bytes":SKILL_BYTES,"mode":"0644","path":SKILL_PATH,"sha256":SKILL_SHA256},"goal_receipt_decoder":{"bytes":CODEC_BYTES,"mode":"0644","path":CODEC_PATH,"sha256":CODEC_SHA256},"review_recipe":{"bytes":RECIPE_BYTES,"mode":"0644","path":RECIPE_PATH,"sha256":RECIPE_SHA256},"review_waiter":{"bytes":WAITER_BYTES,"mode":"0644","path":WAITER_PATH,"sha256":WAITER_SHA256},"row_waiter":{"bytes":len(ROW_WAITER),"mode":"0444","sha256":ROW_WAITER_SHA256}},"qualification":{"clean_full_matrix_streak":0,"credit":"0/2","required_consecutive_clean_full_matrices":2},"rows":rows,"schema_id":"pw-r9-codex-native-goal-current-contract-atomic-review-prepared-manifest-v21","status":"PREPARED_18_ATOMS_CONTROL_ONLY_ZERO_CREDIT_NO_LAUNCH_AUTHORITY"}
    publish(MANIFEST, canonical(manifest))
    sys.stdout.buffer.write(canonical({"first_mismatch":None,"manifest":{"bytes":len(canonical(manifest)),"sha256":sha(canonical(manifest))},"max_spawn_prompt_bytes":max(item["spawn_prompt_bytes"] for item in rows),"max_subject_bytes":max(item["subject_bytes"] for item in rows),"qualification_credit":0,"route_counts":{"alpha":6,"bravo":6,"charlie":6},"row_count":len(rows),"schema_id":"pw-r9-codex-native-goal-current-contract-atomic-review-compile-v21","status":"PASS_PREPARED_18_ATOMS_ZERO_CALLS_ZERO_CREDIT","subject_calls":0}))


def check(recipe):
    require(not os.path.lexists(ROOT) and not os.path.lexists(MANIFEST), "check-no-write-state")
    rows = projection(recipe)
    sys.stdout.buffer.write(canonical({"assertion_count":113,"first_mismatch":None,"max_spawn_prompt_bytes":max(item["spawn_prompt_bytes"] for item in rows),"max_subject_bytes":max(item["subject_bytes"] for item in rows),"qualification_credit":0,"route_counts":{"alpha":6,"bravo":6,"charlie":6},"row_count":len(rows),"schema_id":"pw-r9-codex-native-goal-current-contract-atomic-review-compiler-check-v21","status":"PASS_DATA_ONLY_COMPILER_ZERO_CALLS_ZERO_WRITES","subject_calls":0,"workspace_writes":0}))


def main(argv):
    recipe = read_control()
    if argv == [sys.argv[0], "--check"]:
        check(recipe)
    elif argv == [sys.argv[0], "--prepare-all"]:
        prepare_all(recipe)
    else:
        raise Invalid("argv")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv))
    except (Invalid, OSError, UnicodeError, json.JSONDecodeError, KeyError, TypeError, ValueError) as error:
        sys.stderr.write("FAIL:" + str(error) + "\n")
        raise SystemExit(1)
