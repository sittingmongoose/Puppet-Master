#!/usr/bin/env python3
import hashlib
import importlib.util
import json
import math
import os
import re
import stat
import sys

sys.dont_write_bytecode = True
HERE = "/mnt/Cursor/PuppetMaster/tests/r9g28"
ROOT = HERE + "/r"
MANIFEST = HERE + "/prepared_manifest.json"
ARCH_PATH = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_fact_level_binary_projection_review_v22.json"
ARCH_BYTES = 3309
ARCH_SHA256 = "80bef45872b6d7af37483115f724a618217b2931e72479f6527bf600bd129ac1"
RECIPE_PATH = HERE + "/projection_recipe.json"
RECIPE_BYTES = 7423
RECIPE_SHA256 = "2f5d5c013644047361ba2f7905d636df6610c4063bdbf6b22d3516e53112b109"
CHECKER_PATH = HERE + "/check_projection_recipe.py"
CHECKER_BYTES = 14533
CHECKER_SHA256 = "2e17c8c83faa7c6ef30c51cd800676d7988732f38104985572c389a087725ad1"
WAITER_PATH = HERE + "/wait.py"
WAITER_BYTES = 11622
WAITER_SHA256 = "ed8fa19a2b5d90d118503a2a2ef2da631b52cd6756bc7295aa40483352eab625"
SKILL_PATH = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-atom-bootstrap/SKILL.md"
SKILL_BYTES = 1327
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
CODEC_PATH = "/mnt/Cursor/PuppetMaster/tests/r9g26/goal_receipt_decoder.py"
CODEC_BYTES = 9353
CODEC_SHA256 = "4dfd11ca9bf9428daa0f42447e74d09deb3005026426f4a1e286e0552356d8a8"
PARENT = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
ROUTES = (("alpha", "gpt-5.4-mini", "xhigh"), ("bravo", "gpt-5.4-mini", "medium"), ("charlie", "gpt-5.6-luna", "medium"))
ROW_WAITER = b'#!/usr/bin/env python3\nimport runpy\n\nrunpy.run_path("/mnt/Cursor/PuppetMaster/tests/r9g28/wait.py", run_name="__main__")\n'
ATOM_RE = re.compile(r"^P(?:0[1-9]|1[0-8])$")


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


def load_checker():
    read_bound(CHECKER_PATH, 0o644, CHECKER_BYTES, CHECKER_SHA256)
    spec = importlib.util.spec_from_file_location("r9g28_projection_checker", CHECKER_PATH)
    require(spec is not None and spec.loader is not None, "checker-spec")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    result = module.check()
    require(result["status"] == "PASS_DATA_ONLY_LITERAL_SOURCE_PROJECTION_ZERO_CALLS_ZERO_WRITES" and result["atom_count"] == 18, "checker-result")
    return module


def read_control():
    arch_raw = read_bound(ARCH_PATH, 0o644, ARCH_BYTES, ARCH_SHA256)
    recipe_raw = read_bound(RECIPE_PATH, 0o644, RECIPE_BYTES, RECIPE_SHA256)
    read_bound(WAITER_PATH, 0o644, WAITER_BYTES, WAITER_SHA256)
    read_bound(SKILL_PATH, 0o644, SKILL_BYTES, SKILL_SHA256)
    read_bound(CODEC_PATH, 0o644, CODEC_BYTES, CODEC_SHA256)
    load_checker()
    arch = parse(arch_raw)
    recipe = parse(recipe_raw)
    require(arch_raw == canonical(arch) and recipe_raw == canonical(recipe), "canonical-control")
    require(arch["schema_id"] == "pw-r9-codex-native-goal-fact-level-binary-projection-review-v22", "architecture-schema")
    require(arch["bindings"]["projection_recipe"] == {"bytes": RECIPE_BYTES, "mode": "0644", "path": "tests/r9g28/projection_recipe.json", "sha256": RECIPE_SHA256}, "architecture-recipe")
    require(arch["bindings"]["projection_checker"] == {"bytes": CHECKER_BYTES, "mode": "0644", "path": "tests/r9g28/check_projection_recipe.py", "sha256": CHECKER_SHA256}, "architecture-checker")
    require(arch["authority"]["review_launch"] is False and recipe["authority"]["review_launch"] is False, "authority")
    require(recipe["schema_id"] == "pw-r9-codex-native-goal-fact-level-binary-projection-recipe-v22", "recipe-schema")
    require([item.get("id") for item in recipe["atoms"]] == ["P%02d" % index for index in range(1, 19)], "atom-order")
    for atom in recipe["atoms"]:
        require(set(atom) == {"id", "left", "left_source", "op", "right", "right_source"} and ATOM_RE.fullmatch(atom["id"]), "atom-shape")
    return recipe


def row_record(atom, index):
    atom_id = atom["id"]
    route, model, effort = ROUTES[index % len(ROUTES)]
    nonce = sha(b"pw-r9-cg22-fact-projection\0" + ARCH_SHA256.encode("ascii") + b"\0" + atom_id.encode("ascii") + b"\0" + route.encode("ascii"))
    objective = "CG22P|a={}|x={}|once".format(atom_id, nonce)
    task_name = "r9_cg22p_" + nonce
    workdir = ROOT + "/" + atom_id + "/" + nonce
    require(len(objective.encode("utf-8")) <= 128, "objective-limit:" + atom_id)
    return {"atom_id": atom_id, "goal_objective": objective, "model": model, "reasoning_effort": effort, "review_nonce": nonce, "route": route, "task_name": task_name, "task_path": "/root/" + task_name, "workdir": workdir}


def subject(atom):
    raw = canonical({"id": atom["id"], "l": atom["left"], "op": atom["op"], "q": "Return TRUE iff relation holds.", "r": atom["right"], "v": 22, "z": "TRUE or FALSE"})
    require(len(raw) <= 512 and raw.count(b"\n") == 1 and b"\r" not in raw, "subject-limit:" + atom["id"])
    return raw


def prompt(item):
    raw = ("Use $r9-goal-atom-bootstrap. Exact objective=" + json.dumps(item["goal_objective"]) + "; waiter workdir=" + json.dumps(item["workdir"]) + ". No subject is in this message.").encode("utf-8")
    require(len(raw) <= 512 and b"TRUE" not in raw and b"FALSE" not in raw and b'\"l\"' not in raw, "prompt-limit:" + item["atom_id"])
    return raw


def predeclaration(item, raw):
    return {"architecture_sha256": ARCH_SHA256, "atom_id": item["atom_id"], "bootstrap_skill_sha256": SKILL_SHA256, "checker_sha256": CHECKER_SHA256, "decoder_bytes": CODEC_BYTES, "decoder_sha256": CODEC_SHA256, "goal_objective": item["goal_objective"], "model_requested": item["model"], "parent_thread_id": PARENT, "reasoning_effort_requested": item["reasoning_effort"], "recipe_sha256": RECIPE_SHA256, "review_nonce": item["review_nonce"], "schema_id": "pw-r9-codex-native-goal-fact-level-binary-projection-predeclaration-v22", "subject_bytes": len(raw), "subject_sha256": sha(raw), "task_path": item["task_path"], "waiter_bytes": len(ROW_WAITER), "waiter_sha256": sha(ROW_WAITER)}


def projection(recipe):
    rows = []
    for index, atom in enumerate(recipe["atoms"]):
        item = row_record(atom, index)
        raw = subject(atom)
        spawn = prompt(item)
        rows.append({**item, "spawn_prompt_bytes": len(spawn), "spawn_prompt_sha256": sha(spawn), "subject_bytes": len(raw), "subject_sha256": sha(raw)})
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
        item = row_record(atom, index)
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
    manifest = {"architecture": {"bytes": ARCH_BYTES, "mode": "0644", "path": ARCH_PATH, "sha256": ARCH_SHA256}, "authority": {"canary_launch": False, "implementation": False, "matrix_launch": False, "qualification": False, "qualification_credit": 0, "release": False, "review_launch": False}, "components": {"bootstrap_skill": {"bytes": SKILL_BYTES, "mode": "0644", "path": SKILL_PATH, "sha256": SKILL_SHA256}, "goal_receipt_decoder": {"bytes": CODEC_BYTES, "mode": "0644", "path": CODEC_PATH, "sha256": CODEC_SHA256}, "projection_checker": {"bytes": CHECKER_BYTES, "mode": "0644", "path": CHECKER_PATH, "sha256": CHECKER_SHA256}, "projection_recipe": {"bytes": RECIPE_BYTES, "mode": "0644", "path": RECIPE_PATH, "sha256": RECIPE_SHA256}, "review_waiter": {"bytes": WAITER_BYTES, "mode": "0644", "path": WAITER_PATH, "sha256": WAITER_SHA256}, "row_waiter": {"bytes": len(ROW_WAITER), "mode": "0444", "sha256": sha(ROW_WAITER)}}, "qualification": {"clean_full_matrix_streak": 0, "credit": "0/2", "required_consecutive_clean_full_matrices": 2}, "rows": rows, "schema_id": "pw-r9-codex-native-goal-fact-level-binary-projection-prepared-manifest-v22", "status": "PREPARED_18_LITERAL_RELATIONS_CONTROL_ONLY_ZERO_CREDIT_NO_LAUNCH_AUTHORITY"}
    manifest_raw = canonical(manifest)
    publish(MANIFEST, manifest_raw)
    sys.stdout.buffer.write(canonical({"first_mismatch": None, "manifest": {"bytes": len(manifest_raw), "sha256": sha(manifest_raw)}, "max_spawn_prompt_bytes": max(item["spawn_prompt_bytes"] for item in rows), "max_subject_bytes": max(item["subject_bytes"] for item in rows), "qualification_credit": 0, "route_counts": {"alpha": 6, "bravo": 6, "charlie": 6}, "row_count": len(rows), "schema_id": "pw-r9-codex-native-goal-fact-level-binary-projection-compile-v22", "status": "PASS_PREPARED_18_LITERAL_RELATIONS_ZERO_CALLS_ZERO_CREDIT", "subject_calls": 0}))


def check(recipe):
    require(not os.path.lexists(ROOT) and not os.path.lexists(MANIFEST), "check-no-write-state")
    rows = projection(recipe)
    sys.stdout.buffer.write(canonical({"assertion_count": 127, "first_mismatch": None, "max_spawn_prompt_bytes": max(item["spawn_prompt_bytes"] for item in rows), "max_subject_bytes": max(item["subject_bytes"] for item in rows), "qualification_credit": 0, "route_counts": {"alpha": 6, "bravo": 6, "charlie": 6}, "row_count": len(rows), "schema_id": "pw-r9-codex-native-goal-fact-level-binary-projection-compiler-check-v22", "status": "PASS_DATA_ONLY_COMPILER_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0, "workspace_writes": 0}))


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
    except (Invalid, OSError, UnicodeError, KeyError, TypeError, ValueError) as error:
        sys.stdout.buffer.write(canonical({"first_mismatch": str(error), "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-fact-level-binary-projection-compile-v22", "status": "FAIL", "subject_calls": 0, "workspace_writes": 0}))
        raise SystemExit(1)
