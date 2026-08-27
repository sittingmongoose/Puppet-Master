#!/usr/bin/env python3
import hashlib
import json
import math
import os
import re
import stat
import sys

sys.dont_write_bytecode = True
HERE = "/mnt/Cursor/PuppetMaster/tests/r9g23"
ROOT = HERE + "/r"
MANIFEST = HERE + "/prepared_manifest.json"
ARCH_PATH = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_current_contract_atomic_review_v17.json"
ARCH_BYTES = 2520
ARCH_SHA256 = "e2b0e0fe1863dc15025d1e10fee98e133646c96dda4f9c0dca43744931441f75"
RECIPE_PATH = HERE + "/review_recipe.json"
RECIPE_BYTES = 8282
RECIPE_SHA256 = "6fab5fa043ee7233f35842dcd7579fb853000e3677e57849ec5f20e61ef4f78d"
WAITER_PATH = HERE + "/wait.py"
WAITER_BYTES = 8710
WAITER_SHA256 = "797009bb08132cbcbaf85e3d3fbcfc0cbf6ad9e660ed532f74333d4b844fb98a"
SKILL_PATH = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-atom-bootstrap/SKILL.md"
SKILL_BYTES = 1327
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
CODEC_PATH = "/mnt/Cursor/PuppetMaster/tests/r9g17/native_envelope.py"
CODEC_BYTES = 4661
CODEC_SHA256 = "d2aef9d619f6c4ec779e6d2dce2d1b6fc89282fd91cc4b9f56bc82490df0f246"
PARENT = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
MODEL = "gpt-5.6-luna"
EFFORT = "medium"
ROW_WAITER = b'#!/usr/bin/env python3\nimport runpy\n\nrunpy.run_path("/mnt/Cursor/PuppetMaster/tests/r9g23/wait.py", run_name="__main__")\n'
ROW_WAITER_SHA256 = "90fe00d841d620f97e5c642862fa51df3912d01edff960890f2bdab205dedea2"
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
    require(arch["bindings"]["review_recipe"] == {"bytes": RECIPE_BYTES, "mode": "0644", "path": "tests/r9g23/review_recipe.json", "sha256": RECIPE_SHA256}, "architecture-recipe")
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


def record(atom):
    atom_id = atom["id"]
    nonce = sha(b"pw-r9-cg17-atomic-review\0" + ARCH_SHA256.encode("ascii") + b"\0" + atom_id.encode("ascii"))
    objective = "CG17R|a={}|x={}|once".format(atom_id, nonce)
    task_name = "r9_cg17r_" + nonce
    workdir = ROOT + "/" + atom_id + "/" + nonce
    require(len(objective.encode("utf-8")) <= 128, "objective-limit:" + atom_id)
    return {"atom_id": atom_id, "goal_objective": objective, "model": MODEL, "reasoning_effort": EFFORT, "review_nonce": nonce, "task_name": task_name, "task_path": "/root/" + task_name, "workdir": workdir}


def subject(atom):
    value = {"c": atom["evidence"], "p": {"atom": atom["id"], "src": ARCH_SHA256}, "q": atom["question"], "r": "TOKEN", "v": 4, "z": "PASS or " + atom["fail_token"]}
    raw = canonical(value)
    require(len(raw) <= 512 and raw.count(b"\n") == 1 and b"\r" not in raw, "subject-limit:" + atom["id"])
    return raw


def prompt(item):
    text = "Use $r9-goal-atom-bootstrap. Exact objective=" + json.dumps(item["goal_objective"]) + "; waiter workdir=" + json.dumps(item["workdir"]) + ". No subject is in this message."
    raw = text.encode("utf-8")
    require(len(raw) <= 512 and b"PASS" not in raw and b"FAIL_" not in raw and b'"c"' not in raw, "prompt-limit:" + item["atom_id"])
    return raw


def predeclaration(item, raw):
    return {"architecture_sha256": ARCH_SHA256, "atom_id": item["atom_id"], "bootstrap_skill_sha256": SKILL_SHA256, "goal_objective": item["goal_objective"], "model_requested": MODEL, "native_envelope_bytes": CODEC_BYTES, "native_envelope_sha256": CODEC_SHA256, "parent_thread_id": PARENT, "reasoning_effort_requested": EFFORT, "recipe_sha256": RECIPE_SHA256, "review_nonce": item["review_nonce"], "schema_id": "pw-r9-codex-native-goal-current-contract-atomic-review-predeclaration-v17", "subject_bytes": len(raw), "subject_sha256": sha(raw), "task_path": item["task_path"], "waiter_bytes": len(ROW_WAITER), "waiter_sha256": ROW_WAITER_SHA256}


def projection(recipe):
    rows = []
    for atom in recipe["atoms"]:
        item = record(atom)
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
    for atom in recipe["atoms"]:
        item = record(atom)
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
    manifest = {"architecture":{"bytes":ARCH_BYTES,"mode":"0644","path":ARCH_PATH,"sha256":ARCH_SHA256},"authority":{"canary_launch":False,"implementation":False,"matrix_launch":False,"qualification":False,"qualification_credit":0,"release":False,"review_launch":False},"components":{"bootstrap_skill":{"bytes":SKILL_BYTES,"mode":"0644","path":SKILL_PATH,"sha256":SKILL_SHA256},"native_envelope":{"bytes":CODEC_BYTES,"mode":"0644","path":CODEC_PATH,"sha256":CODEC_SHA256},"review_recipe":{"bytes":RECIPE_BYTES,"mode":"0644","path":RECIPE_PATH,"sha256":RECIPE_SHA256},"review_waiter":{"bytes":WAITER_BYTES,"mode":"0644","path":WAITER_PATH,"sha256":WAITER_SHA256},"row_waiter":{"bytes":len(ROW_WAITER),"mode":"0444","sha256":ROW_WAITER_SHA256}},"qualification":{"clean_full_matrix_streak":0,"credit":"0/2","required_consecutive_clean_full_matrices":2},"rows":rows,"schema_id":"pw-r9-codex-native-goal-current-contract-atomic-review-prepared-manifest-v17","status":"PREPARED_18_ATOMS_CONTROL_ONLY_ZERO_CREDIT_NO_LAUNCH_AUTHORITY"}
    publish(MANIFEST, canonical(manifest))
    sys.stdout.buffer.write(canonical({"first_mismatch":None,"manifest":{"bytes":len(canonical(manifest)),"sha256":sha(canonical(manifest))},"max_spawn_prompt_bytes":max(item["spawn_prompt_bytes"] for item in rows),"max_subject_bytes":max(item["subject_bytes"] for item in rows),"qualification_credit":0,"row_count":len(rows),"schema_id":"pw-r9-codex-native-goal-current-contract-atomic-review-compile-v17","status":"PASS_PREPARED_18_ATOMS_ZERO_CALLS_ZERO_CREDIT","subject_calls":0}))


def check(recipe):
    require(not os.path.lexists(ROOT) and not os.path.lexists(MANIFEST), "check-no-write-state")
    rows = projection(recipe)
    sys.stdout.buffer.write(canonical({"assertion_count":97,"first_mismatch":None,"max_spawn_prompt_bytes":max(item["spawn_prompt_bytes"] for item in rows),"max_subject_bytes":max(item["subject_bytes"] for item in rows),"qualification_credit":0,"row_count":len(rows),"schema_id":"pw-r9-codex-native-goal-current-contract-atomic-review-compiler-check-v17","status":"PASS_DATA_ONLY_COMPILER_ZERO_CALLS_ZERO_WRITES","subject_calls":0,"workspace_writes":0}))


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
