#!/usr/bin/env python3
import copy
import hashlib
import json
import math
import os
import re
import stat
import sys

sys.dont_write_bytecode = True
RECIPE = "/mnt/Cursor/PuppetMaster/tests/r9g16/review_recipe.json"
RECIPE_BYTES = 7936
RECIPE_SHA256 = "100386642d6680db468c1e9a0ddf7c2c774728f4444e540ca2d655fe8669f690"
HEX = re.compile(r"^[0-9a-f]{64}$")
TOKEN = re.compile(r"^[A-Z0-9_]{1,48}$")
OBLIGATIONS = {
    "skill_control_boundary", "active_gate_trace", "subject_publication", "terminal_goal_flow",
    "identity_binding", "pre_subject_privacy", "bite_size_limits", "global_freshness", "exact_roster",
    "no_retry_failure", "trace_evidence", "offline_verification", "omp_isolation", "qualification_bar",
    "authority_nonclaims", "atomic_review_coverage", "review_authority", "loop_breaker",
}
ROSTER = [
    {"model": "gpt-5.4-mini", "reasoning_effort": "xhigh", "route": "slot-alpha", "route_code": "a"},
    {"model": "gpt-5.4-mini", "reasoning_effort": "medium", "route": "slot-bravo", "route_code": "b"},
    {"model": "gpt-5.6-luna", "reasoning_effort": "medium", "route": "slot-charlie", "route_code": "c"},
]


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


def compact(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def meta(info):
    return (info.st_dev, info.st_ino, info.st_mode, info.st_uid, info.st_nlink, info.st_size, info.st_mtime_ns)


def read_bound(path, mode, size, digest):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode), "regular:" + path)
    require(stat.S_IMODE(before.st_mode) == mode and before.st_uid == os.getuid() and before.st_nlink == 1, "custody:" + path)
    require(before.st_size == size and HEX.fullmatch(digest or ""), "identity:" + path)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        require(meta(os.fstat(fd)) == meta(before), "open-race:" + path)
        raw = b""
        while len(raw) < size:
            part = os.read(fd, size - len(raw))
            require(bool(part), "short:" + path)
            raw += part
        require(os.read(fd, 1) == b"", "trailing:" + path)
    finally:
        os.close(fd)
    require(meta(os.lstat(path)) == meta(before), "read-drift:" + path)
    require(sha(raw) == digest, "sha:" + path)
    return raw


def binding_raw(binding):
    require(isinstance(binding, dict) and set(binding) == {"bytes", "mode", "path", "sha256"}, "binding-fields")
    require(isinstance(binding["bytes"], int) and not isinstance(binding["bytes"], bool) and binding["bytes"] > 0, "binding-bytes")
    require(binding["mode"] == "0644" and isinstance(binding["path"], str) and binding["path"].startswith("/mnt/Cursor/PuppetMaster/"), "binding-path")
    return read_bound(binding["path"], int(binding["mode"], 8), binding["bytes"], binding["sha256"])


def subject(recipe, atom):
    return compact({
        "c": atom["evidence"],
        "p": {"atom": atom["id"], "src": recipe["base_architecture"]["sha256"]},
        "q": atom["question"],
        "r": "TOKEN",
        "v": 2,
        "z": "PASS or " + atom["fail_token"],
    }) + b"\n"


def validate(candidate, source_check=True):
    top = {"atoms", "authority", "base_architecture", "bootstrap_skill", "failure_lineage", "limits", "qualification", "review_policy", "schema_id", "status"}
    require(isinstance(candidate, dict) and set(candidate) == top, "recipe-fields")
    require(candidate["schema_id"] == "pw-r9-codex-native-goal-atomic-architecture-review-recipe-v9", "recipe-schema")
    require(candidate["status"] == "DATA_ONLY_REVIEW_CORPUS_ZERO_CREDIT_NO_LAUNCH_AUTHORITY", "recipe-status")
    require(candidate["authority"] == {"canary_launch": False, "implementation": False, "matrix_launch": False, "qualification": False, "release": False, "review_launch": False, "subject_launch": False}, "authority")
    require(candidate["qualification"] == {"canary_credit": 0, "clean_full_matrix_streak": 0, "credit": "0/2", "required_consecutive_clean_full_matrices": 2}, "qualification")
    limits = candidate["limits"]
    require(limits == {"atom_count": 18, "evidence_utf8_bytes_max": 240, "goal_objective_utf8_bytes_max": 256, "nested_payload_utf8_bytes_max": 170, "question_utf8_bytes_max": 96, "spawn_prompt_utf8_bytes_max": 512, "subject_line_utf8_bytes_max": 512}, "limits")
    require(candidate["review_policy"] == {"all_atoms_required": True, "expected_answer_material": False, "one_fresh_goal_per_atom": True, "reducer_model_call": False, "result_token_regex": "^[A-Z0-9_]{1,48}$", "retry": 0, "source_mechanics": "read-only checker binds exact sources and exact-set obligation coverage", "subject_delivery": "blocking post-ACTIVE waiter", "task_reuse": 0}, "review-policy")
    atoms = candidate["atoms"]
    require(isinstance(atoms, list) and len(atoms) == limits["atom_count"], "atom-count")
    require([atom.get("id") for atom in atoms] == ["A{:02d}".format(index) for index in range(1, 19)], "atom-order")
    require({atom.get("obligation") for atom in atoms} == OBLIGATIONS, "obligation-coverage")
    require(len({atom.get("id") for atom in atoms}) == len(atoms), "atom-unique")
    maximum = {"evidence": 0, "nested": 0, "question": 0, "subject": 0}
    for atom in atoms:
        require(set(atom) == {"evidence", "fail_token", "id", "obligation", "question"}, "atom-fields")
        require(isinstance(atom["evidence"], str) and isinstance(atom["question"], str), "atom-text")
        require(0 < len(atom["evidence"].encode("utf-8")) <= limits["evidence_utf8_bytes_max"], "atom-evidence:" + atom["id"])
        require(0 < len(atom["question"].encode("utf-8")) <= limits["question_utf8_bytes_max"], "atom-question:" + atom["id"])
        require(TOKEN.fullmatch(atom["fail_token"] or "") and atom["fail_token"].startswith("FAIL_"), "atom-token:" + atom["id"])
        raw = subject(candidate, atom)
        value = parse(raw)
        require(raw == compact(value) + b"\n" and set(value) == {"c", "p", "q", "r", "v", "z"}, "subject-shape:" + atom["id"])
        nested = compact(value["p"])
        require(len(raw) <= limits["subject_line_utf8_bytes_max"] and len(nested) <= limits["nested_payload_utf8_bytes_max"], "subject-size:" + atom["id"])
        require(set(value["p"]) == {"atom", "src"} and not any("answer" in key or "scorer" in key or "expected" in key for key in value["p"]), "answer-material:" + atom["id"])
        maximum["evidence"] = max(maximum["evidence"], len(atom["evidence"].encode("utf-8")))
        maximum["question"] = max(maximum["question"], len(atom["question"].encode("utf-8")))
        maximum["nested"] = max(maximum["nested"], len(nested))
        maximum["subject"] = max(maximum["subject"], len(raw))
    if source_check:
        architecture_raw = binding_raw(candidate["base_architecture"])
        architecture = parse(architecture_raw)
        require(architecture_raw == compact(architecture) + b"\n", "architecture-canonical")
        require(architecture["status"] == "FROZEN_PROPOSED_IMPLEMENTATION_ZERO_CREDIT_NO_EMPIRICAL_AUTHORITY", "architecture-status")
        require(architecture["qualification"] == {"canary_credit": 0, "clean_full_matrix_streak": 0, "credit": "0/2", "matrix_credit_per_clean_run": 1, "required_consecutive_clean_full_matrices": 2, "sequence": ["C04", "015", "016"]}, "architecture-qualification")
        require(architecture["roster"] == ROSTER, "architecture-roster")
        require(all(architecture["failure_contract"][key] == 0 for key in ("best_of", "relaunch", "replacement", "resend", "retry", "reuse")), "architecture-no-retry")
        require(architecture["review_contract"]["reviewer"].startswith("one fresh"), "architecture-rejected-review")
        skill = binding_raw(candidate["bootstrap_skill"]).decode("utf-8")
        require("Call native `create_goal` once" in skill and "successful waiter stdout as the only subject" in skill and "Do not call `get_goal`" in skill, "skill-semantics")
        failure_raw = binding_raw(candidate["failure_lineage"])
        failure = parse(failure_raw)
        require(failure_raw == compact(failure) + b"\n", "failure-canonical")
        require(failure["status"] == "FAIL_REJECTED_V8_MONOLITHIC_REVIEW_INFORMATION_BOUND_ZERO_CREDIT_NO_AUTHORITY", "failure-status")
        require(failure["failure"]["normalized_family"] == "MONOLITHIC_REVIEW_EXCEEDS_GOAL_ATOM_INFORMATION_BOUND", "failure-family")
    return maximum


def reject(candidate, label):
    try:
        validate(candidate, label == "source-binding")
    except (Invalid, KeyError, TypeError, ValueError):
        return 1
    raise Invalid("mutation-accepted:" + label)


def run():
    raw = read_bound(RECIPE, 0o644, RECIPE_BYTES, RECIPE_SHA256)
    recipe = parse(raw)
    require(raw == compact(recipe) + b"\n", "recipe-canonical")
    maximum = validate(recipe, True)
    mutations = []
    value = copy.deepcopy(recipe); value["atoms"] = value["atoms"][:-1]; mutations.append((value, "missing-atom"))
    value = copy.deepcopy(recipe); value["atoms"][1]["id"] = "A01"; mutations.append((value, "duplicate-id"))
    value = copy.deepcopy(recipe); value["atoms"][0]["obligation"] = "unknown"; mutations.append((value, "unknown-obligation"))
    value = copy.deepcopy(recipe); value["atoms"][0]["evidence"] = "x" * 241; mutations.append((value, "evidence-limit"))
    value = copy.deepcopy(recipe); value["atoms"][0]["question"] = "x" * 97; mutations.append((value, "question-limit"))
    value = copy.deepcopy(recipe); value["atoms"][0]["fail_token"] = "pass"; mutations.append((value, "token"))
    value = copy.deepcopy(recipe); value["qualification"]["credit"] = "1/2"; mutations.append((value, "credit"))
    value = copy.deepcopy(recipe); value["authority"]["review_launch"] = True; mutations.append((value, "authority"))
    value = copy.deepcopy(recipe); value["review_policy"]["retry"] = 1; mutations.append((value, "retry"))
    value = copy.deepcopy(recipe); value["review_policy"]["reducer_model_call"] = True; mutations.append((value, "reducer"))
    value = copy.deepcopy(recipe); value["limits"]["subject_line_utf8_bytes_max"] = 1024; mutations.append((value, "subject-ceiling"))
    value = copy.deepcopy(recipe); value["base_architecture"]["sha256"] = "0" * 64; mutations.append((value, "source-binding"))
    rejected = sum(reject(value, label) for value, label in mutations)
    return {
        "assertion_count": 18 * 13 + 35,
        "atom_count": len(recipe["atoms"]),
        "first_mismatch": None,
        "max_evidence_bytes": maximum["evidence"],
        "max_nested_payload_bytes": maximum["nested"],
        "max_question_bytes": maximum["question"],
        "max_subject_line_bytes": maximum["subject"],
        "mutation_count": rejected,
        "obligation_count": len(OBLIGATIONS),
        "qualification_credit": 0,
        "schema_id": "pw-r9-codex-native-goal-atomic-architecture-review-corpus-check-v9",
        "status": "PASS_DATA_ONLY_CLOSED_ATOMIC_REVIEW_CORPUS_ZERO_CALLS_ZERO_WRITES",
        "subject_calls": 0,
        "workspace_writes": 0,
    }


def main():
    try:
        require(sys.argv == [sys.argv[0], "--check"], "cli")
        output = run()
        sys.stdout.buffer.write(compact(output) + b"\n")
        return 0
    except (Invalid, OSError, UnicodeError, json.JSONDecodeError, KeyError, TypeError, ValueError) as error:
        sys.stdout.buffer.write(compact({"first_mismatch": str(error), "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-atomic-architecture-review-corpus-check-v9", "status": "FAIL", "subject_calls": 0, "workspace_writes": 0}) + b"\n")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
