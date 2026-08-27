#!/usr/bin/env python3
import copy
import hashlib
import json
import math
import os
import stat
import sys

sys.dont_write_bytecode = True

RECIPE_PATH = "/mnt/Cursor/PuppetMaster/tests/r9g28/projection_recipe.json"
RECIPE_BYTES = 7423
RECIPE_SHA256 = "2f5d5c013644047361ba2f7905d636df6610c4063bdbf6b22d3516e53112b109"
SCHEMA = "pw-r9-codex-native-goal-fact-level-binary-projection-recipe-v22"

BINDINGS = {
    "bootstrap_skill": ("/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-atom-bootstrap/SKILL.md", 1327, "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"),
    "goal_receipt_decoder": ("/mnt/Cursor/PuppetMaster/tests/r9g26/goal_receipt_decoder.py", 9353, "4dfd11ca9bf9428daa0f42447e74d09deb3005026426f4a1e286e0552356d8a8"),
    "v20_architecture": ("/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_receipt_only_broker_capability_v20.json", 2806, "99633e8f74e5514eaae578f7019a137242064a7d15aaaec2526ee64785fc4974"),
    "v20_success": ("/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_receipt_only_broker_capability_v20_success_receipt_v1.json", 3863, "55401f1dfd905fcc88d458a077660c46d633e5751c3cb2a9e3d806f2262e6271"),
    "v21_failure": ("/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_current_contract_atomic_review_v21_runtime_failure_receipt_v1.json", 3488, "80a504610e06f640daefcdf1ee8568b5ca3fdc8bec13ca26b9224b1c97b324ae"),
    "v21_implementation": ("/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_current_contract_atomic_review_v21_implementation_manifest_v1.json", 3012, "c30daec68615cbce49b31d215578febb5f6dc09dcebeb98acd42bc086bb70e48"),
    "v21_recipe": ("/mnt/Cursor/PuppetMaster/tests/r9g27/review_recipe.json", 9077, "76dcffef75dfc86e066f00ee66a6ffa4bbeb1b4afc051182c50f24b25cc4f770"),
}

SOURCES = {
    "P01": ({"file": "bootstrap_skill", "pointer": "@sha256"}, {"file": "v20_architecture", "pointer": "/bindings/bootstrap_skill/sha256"}, "DEEP_EQ"),
    "P02": ({"file": "goal_receipt_decoder", "pointer": "@sha256"}, {"file": "v20_architecture", "pointer": "/bindings/goal_receipt_decoder/sha256"}, "DEEP_EQ"),
    "P03": ({"file": "v20_architecture", "pointer": "@sha256"}, {"file": "v20_success", "pointer": "/bindings/architecture/sha256"}, "DEEP_EQ"),
    "P04": ({"file": "v20_success", "pointer": "/bindings/launch_admission/sha256"}, {"literal": True}, "DEEP_EQ"),
    "P05": ({"file": "v20_success", "pointer": "/execution/goal/active_receipt/thread_id"}, {"file": "v20_success", "pointer": "/execution/goal/terminal_receipt/thread_id"}, "DEEP_EQ"),
    "P06": ({"file": "v20_success", "pointer": "/execution/result"}, {"literal": True}, "DEEP_EQ"),
    "P07": ({"file": "v21_failure", "pointer": "/consumed_review/launched_atom_count"}, {"literal": True}, "DEEP_EQ"),
    "P08": ({"file": "v21_failure", "pointer": "/consumed_review/pass_count"}, {"literal": True}, "DEEP_EQ"),
    "P09": ({"file": "v21_failure", "pointer": "/consumed_review/failed_atom/atom_id"}, {"literal": True}, "DEEP_EQ"),
    "P10": ({"file": "v21_failure", "pointer": "/consumed_review/unlaunched_atoms"}, {"literal": True}, "DEEP_EQ"),
    "P11": ({"file": "v21_recipe", "pointer": "/roster/alpha"}, {"literal": True}, "DEEP_EQ"),
    "P12": ({"file": "v21_recipe", "pointer": "/roster/bravo"}, {"literal": True}, "DEEP_EQ"),
    "P13": ({"file": "v21_recipe", "pointer": "/roster/charlie"}, {"literal": True}, "DEEP_EQ"),
    "P14": ({"file": "v21_implementation", "pointer": "/contract/max_subject_bytes"}, {"literal": True}, "INT_LE"),
    "P15": ({"file": "v21_implementation", "pointer": "/contract/max_spawn_prompt_bytes"}, {"literal": True}, "INT_LE"),
    "P16": ({"file": "v21_failure", "pointer": "/failure_contract"}, {"literal": True}, "DEEP_EQ"),
    "P17": ({"file": "v21_failure", "pointer": "/qualification"}, {"literal": True}, "DEEP_EQ"),
    "P18": ({"file": "v21_failure", "pointer": "/row_custody/file_count"}, {"literal": True}, "DEEP_EQ"),
}

LITERALS = {
    "P04": "55dbb8ad372051f82c3d279c25299a32c64b9148f027db575944733b13ab65a1",
    "P06": "OK",
    "P07": 6,
    "P08": 5,
    "P09": "A06",
    "P10": ["A07", "A08", "A09", "A10", "A11", "A12", "A13", "A14", "A15", "A16", "A17", "A18"],
    "P11": {"model": "gpt-5.4-mini", "reasoning_effort": "xhigh"},
    "P12": {"model": "gpt-5.4-mini", "reasoning_effort": "medium"},
    "P13": {"model": "gpt-5.6-luna", "reasoning_effort": "medium"},
    "P14": 512,
    "P15": 512,
    "P16": {"best_of": 0, "continue_after_failure": False, "relaunch": 0, "replacement": 0, "resend": 0, "retry": 0, "reuse": 0},
    "P17": {"clean_full_matrix_streak": 0, "credit": "0/2", "required_consecutive_clean_full_matrices": 2},
    "P18": 108,
}


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


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def metadata(info):
    return (info.st_dev, info.st_ino, info.st_mode, info.st_uid, info.st_nlink, info.st_size, info.st_mtime_ns)


def read_exact(path, size, sha256):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode), "kind:" + path)
    require(stat.S_IMODE(before.st_mode) == 0o644 and before.st_uid == os.getuid() and before.st_nlink == 1 and before.st_size == size, "custody:" + path)
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
    require(metadata(os.lstat(path)) == metadata(before) and digest(raw) == sha256, "drift:" + path)
    return raw


def pointer(value, path):
    require(path.startswith("/") and path != "/", "pointer-syntax:" + path)
    current = value
    for token in path[1:].split("/"):
        token = token.replace("~1", "/").replace("~0", "~")
        if isinstance(current, dict):
            require(token in current, "pointer-key:" + path)
            current = current[token]
        elif isinstance(current, list):
            require(token.isdigit() and str(int(token)) == token and int(token) < len(current), "pointer-index:" + path)
            current = current[int(token)]
        else:
            raise Invalid("pointer-scalar:" + path)
    return current


def expected_bindings():
    return {name: {"bytes": size, "mode": "0644", "path": path, "sha256": sha256} for name, (path, size, sha256) in BINDINGS.items()}


def load_sources():
    values = {}
    for name, (path, size, sha256) in BINDINGS.items():
        raw = read_exact(path, size, sha256)
        if path.endswith(".json"):
            value = parse(raw)
            require(raw == canonical(value), "source-canonical:" + name)
            values[name] = value
    return values


def source_value(spec, operand, values):
    require(isinstance(spec, dict), "source-type")
    if spec == {"literal": True}:
        return operand
    require(set(spec) == {"file", "pointer"} and spec["file"] in BINDINGS, "source-shape")
    if spec["pointer"] == "@sha256":
        return BINDINGS[spec["file"]][2]
    require(spec["file"] in values, "source-not-json:" + spec["file"])
    return pointer(values[spec["file"]], spec["pointer"])


def evaluate(op, left, right):
    if op == "DEEP_EQ":
        return type(left) is type(right) and left == right
    if op == "INT_LE":
        return type(left) is int and type(right) is int and left <= right
    raise Invalid("operation:" + str(op))


def validate(recipe, values):
    require(isinstance(recipe, dict) and set(recipe) == {"atoms", "authority", "bindings", "limits", "qualification", "review_policy", "roster", "schema_id", "status"}, "top-shape")
    require(recipe["schema_id"] == SCHEMA and recipe["status"] == "DATA_ONLY_FACT_LEVEL_18_ATOM_REVIEW_ZERO_CREDIT_NO_LAUNCH_AUTHORITY", "identity")
    require(recipe["bindings"] == expected_bindings(), "bindings")
    require(recipe["authority"] == {"canary_launch": False, "implementation": False, "matrix_launch": False, "qualification": False, "qualification_credit": 0, "release": False, "review_launch": False}, "authority")
    require(recipe["limits"] == {"atom_count": 18, "goal_objective_utf8_bytes_max": 128, "spawn_prompt_utf8_bytes_max": 512, "subject_line_utf8_bytes_max": 512}, "limits")
    require(recipe["qualification"] == {"clean_full_matrix_streak": 0, "credit": "0/2", "required_consecutive_clean_full_matrices": 2}, "qualification")
    require(recipe["review_policy"] == {"all_atoms_required": True, "allowed_operations": ["DEEP_EQ", "INT_LE"], "expected_answer_material": False, "one_concrete_relation_per_atom": True, "one_fresh_goal_per_atom": True, "result_set": ["TRUE", "FALSE"], "retry": 0, "route_schedule": "ROUND_ROBIN_ALPHA_BRAVO_CHARLIE_SIX_EACH", "subject_delivery": "GOAL_RECEIPT_ONLY_BROKER_V1", "task_reuse": 0}, "policy")
    require(recipe["roster"] == {"alpha": {"model": "gpt-5.4-mini", "reasoning_effort": "xhigh"}, "bravo": {"model": "gpt-5.4-mini", "reasoning_effort": "medium"}, "charlie": {"model": "gpt-5.6-luna", "reasoning_effort": "medium"}}, "roster")
    require(isinstance(recipe["atoms"], list) and [item.get("id") for item in recipe["atoms"]] == ["P%02d" % index for index in range(1, 19)], "atom-order")
    for atom in recipe["atoms"]:
        atom_id = atom["id"]
        require(set(atom) == {"id", "left", "left_source", "op", "right", "right_source"}, "atom-shape:" + atom_id)
        require((atom["left_source"], atom["right_source"], atom["op"]) == SOURCES[atom_id], "atom-source:" + atom_id)
        require(source_value(atom["left_source"], atom["left"], values) == atom["left"], "left-value:" + atom_id)
        require(source_value(atom["right_source"], atom["right"], values) == atom["right"], "right-value:" + atom_id)
        if atom_id in LITERALS:
            require(atom["right"] == LITERALS[atom_id], "literal:" + atom_id)
        require(evaluate(atom["op"], atom["left"], atom["right"]), "false-relation:" + atom_id)
    return len(recipe["atoms"])


def pristine():
    raw = read_exact(RECIPE_PATH, RECIPE_BYTES, RECIPE_SHA256)
    value = parse(raw)
    require(raw == canonical(value), "recipe-canonical")
    return raw, value


def check():
    raw, recipe = pristine()
    count = validate(recipe, load_sources())
    return {"assertion_count": 128, "atom_count": count, "first_mismatch": None, "recipe_bytes": len(raw), "recipe_sha256": digest(raw), "schema_id": "pw-r9-codex-native-goal-fact-level-binary-projection-recipe-check-v22", "status": "PASS_DATA_ONLY_LITERAL_SOURCE_PROJECTION_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0, "workspace_writes": 0}


def mutation_self_test():
    _, recipe = pristine()
    values = load_sources()
    mutations = []
    def add(name, fn):
        item = copy.deepcopy(recipe)
        fn(item)
        mutations.append((name, item))
    add("left", lambda item: item["atoms"][0].__setitem__("left", "0" * 64))
    add("right", lambda item: item["atoms"][3].__setitem__("right", "0" * 64))
    add("pointer", lambda item: item["atoms"][0]["left_source"].__setitem__("pointer", "/status"))
    add("operation", lambda item: item["atoms"][13].__setitem__("op", "DEEP_EQ"))
    add("order", lambda item: item["atoms"].__setitem__(slice(0, 2), list(reversed(item["atoms"][:2]))))
    add("binding", lambda item: item["bindings"]["bootstrap_skill"].__setitem__("sha256", "0" * 64))
    add("authority", lambda item: item["authority"].__setitem__("review_launch", True))
    add("policy", lambda item: item["review_policy"].__setitem__("expected_answer_material", True))
    add("roster", lambda item: item["roster"]["charlie"].__setitem__("model", "gpt-5.4-mini"))
    add("qualification", lambda item: item["qualification"].__setitem__("credit", "1/2"))
    rejected = 0
    for name, item in mutations:
        try:
            validate(item, values)
        except (Invalid, KeyError, TypeError, ValueError):
            rejected += 1
        else:
            raise Invalid("mutation-accepted:" + name)
    try:
        parse(b'{"x":1,"x":2}\n')
    except Invalid:
        rejected += 1
    else:
        raise Invalid("duplicate-key-accepted")
    require(rejected == 11, "mutation-count")
    return {"first_mismatch": None, "mutation_count": rejected, "schema_id": "pw-r9-codex-native-goal-fact-level-binary-projection-recipe-mutation-self-test-v22", "status": "PASS_ALL_MUTATIONS_REJECTED_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0, "workspace_writes": 0}


def main(argv):
    if argv == [sys.argv[0], "--check"]:
        result = check()
    elif argv == [sys.argv[0], "--mutation-self-test"]:
        result = mutation_self_test()
    else:
        raise Invalid("argv")
    sys.stdout.buffer.write(canonical(result))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv))
    except (Invalid, OSError, UnicodeError, KeyError, TypeError, ValueError) as error:
        sys.stdout.buffer.write(canonical({"first_mismatch": str(error), "schema_id": "pw-r9-codex-native-goal-fact-level-binary-projection-recipe-check-v22", "status": "FAIL", "subject_calls": 0, "workspace_writes": 0}))
        raise SystemExit(1)
