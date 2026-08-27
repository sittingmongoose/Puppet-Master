#!/usr/bin/env python3
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import math
import re
import stat
import sys
from pathlib import Path
from typing import Any, Callable


HERE = Path(__file__).resolve().parent
MANIFEST_PATH = HERE / "lifecycle_probe_review_atom_manifest_v1.json"
SCHEMA = "pw-r9-goal-mode-omp-native-lifecycle-probe-review-atom-manifest-v1"
SHA_RE = re.compile(r"^[0-9a-f]{64}$")
OUTPUT = '"PASS" or {"first_mismatch":"<brief>"}'
AUTHORITY = {
    "bridge_install": False,
    "canary_launch": False,
    "headless_handoff": False,
    "lifecycle_probe_launch": False,
    "matrix_launch": False,
    "qualification_credit": 0,
    "qualification_streak_clean_matrices": 0,
    "review_atom_launch": False,
    "subject_launch": False,
}
TOP_KEYS = {"artifact_id", "atoms", "authority", "bindings", "limits", "policy", "qualification", "reducer_policy", "schema_id", "status"}
ATOM_KEYS = {
    "acceptance_criterion_utf8",
    "acceptance_criterion_utf8_bytes",
    "acceptance_criterion_utf8_sha256",
    "atom_id",
    "atom_index",
    "dependency_atom_ids",
    "evidence_slice_utf8",
    "evidence_slice_utf8_bytes",
    "evidence_slice_utf8_sha256",
    "goal_objective_utf8",
    "goal_objective_utf8_bytes",
    "goal_objective_utf8_sha256",
    "operation",
    "operation_count",
    "output_contract_utf8",
    "output_contract_utf8_bytes",
    "output_contract_utf8_sha256",
    "prompt_utf8",
    "prompt_utf8_bytes",
    "prompt_utf8_sha256",
    "source_projection",
    "status",
}
OPERATIONS = {
    "VERIFY_NATIVE_RECORD_ORDER",
    "VERIFY_WINDOWS_OWNER_CUSTODY",
    "VERIFY_CLOSED_SESSION_CUSTODY",
    "VERIFY_ATOMIC_ZERO_CREDIT_SCOPE",
}


class Invalid(ValueError):
    pass


def reject_constant(value: str) -> None:
    raise Invalid(f"nonfinite number: {value}")


def pairs(items: list[tuple[str, Any]]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for key, value in items:
        if key in out:
            raise Invalid(f"duplicate key: {key}")
        out[key] = value
    return out


def finite(value: Any) -> None:
    if isinstance(value, float) and not math.isfinite(value):
        raise Invalid("nonfinite number")
    if isinstance(value, dict):
        for item in value.values():
            finite(item)
    elif isinstance(value, list):
        for item in value:
            finite(item)


def decode(data: bytes) -> Any:
    try:
        value = json.loads(data.decode("utf-8"), object_pairs_hook=pairs, parse_constant=reject_constant)
    except (UnicodeDecodeError, json.JSONDecodeError, Invalid) as exc:
        raise Invalid(f"invalid JSON: {exc}") from exc
    finite(value)
    return value


def canon(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False) + "\n").encode()


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def read_regular(path: Path) -> bytes:
    if path.is_symlink():
        raise Invalid(f"symlink forbidden: {path}")
    try:
        st = path.stat()
    except OSError as exc:
        raise Invalid(f"unreadable path: {path}") from exc
    if not stat.S_ISREG(st.st_mode):
        raise Invalid(f"regular file required: {path}")
    return path.read_bytes()


def load_manifest() -> tuple[dict[str, Any], bytes]:
    data = read_regular(MANIFEST_PATH)
    value = decode(data)
    if not isinstance(value, dict) or data != canon(value):
        raise Invalid("canonical sorted minified manifest with one LF required")
    return value, data


def exact_keys(value: Any, expected: set[str], label: str) -> dict[str, Any]:
    if not isinstance(value, dict) or set(value) != expected:
        raise Invalid(f"{label}: exact keys")
    return value


def pointer(root: Any, value: str) -> Any:
    if not isinstance(value, str) or not value.startswith("/"):
        raise Invalid("JSON pointer")
    current = root
    for raw in value[1:].split("/"):
        token = raw.replace("~1", "/").replace("~0", "~")
        if isinstance(current, dict) and token in current:
            current = current[token]
        elif isinstance(current, list) and token.isdigit() and int(token) < len(current):
            current = current[int(token)]
        else:
            raise Invalid(f"unresolved JSON pointer: {value}")
    return current


def bound(text: Any, size: Any, digest: Any, maximum: int, label: str) -> None:
    if not isinstance(text, str) or not text:
        raise Invalid(f"{label}: nonempty string")
    data = text.encode("utf-8")
    if len(data) != size or sha(data) != digest or len(data) > maximum:
        raise Invalid(f"{label}: byte/hash/limit")


def check_bindings(manifest: dict[str, Any]) -> None:
    for binding in manifest["bindings"]:
        exact_keys(binding, {"bytes", "mode", "path", "sha256"}, "binding")
        path = HERE / binding["path"]
        data = read_regular(path)
        mode = f"{stat.S_IMODE(path.stat().st_mode):04o}"
        if len(data) != binding["bytes"] or sha(data) != binding["sha256"] or mode != binding["mode"]:
            raise Invalid(f"binding mismatch: {binding['path']}")


def validate(manifest: dict[str, Any], check_files: bool = True) -> dict[str, int]:
    exact_keys(manifest, TOP_KEYS, "manifest")
    if manifest["schema_id"] != SCHEMA or manifest["authority"] != AUTHORITY:
        raise Invalid("schema or authority")
    if manifest["status"] != "PREDECLARED_FOUR_BITE_SIZE_GOAL_REVIEW_ATOMS_NOT_EXECUTED_ZERO_CREDIT_NO_LAUNCH":
        raise Invalid("status")
    if check_files:
        check_bindings(manifest)
    limits = manifest["limits"]
    expected_limits = {
        "acceptance_criterion_max_utf8_bytes": 256,
        "evidence_slice_max_utf8_bytes": 256,
        "goal_objective_max_utf8_bytes": 256,
        "output_contract_max_utf8_bytes": 128,
        "prompt_max_utf8_bytes": 512,
    }
    if limits != expected_limits:
        raise Invalid("limits")
    policy = manifest["policy"]
    if set(policy) != {
        "every_atom_has_one_acceptance_criterion",
        "every_atom_has_one_evidence_slice",
        "every_atom_has_one_fresh_native_goal",
        "every_atom_has_one_operation",
        "every_atom_has_one_output_contract",
        "every_atom_has_one_subject_prompt",
        "no_atom_receives_full_contract_or_campaign_context",
        "no_subject_prompt_before_native_goal_activation",
        "short_but_compound_rejected",
    } or not all(value is True for value in policy.values()):
        raise Invalid("policy")
    if manifest["qualification"] != {"current_streak": 0, "current_value": "0/2", "review_credit": 0, "required_clean_full_matrices": 2}:
        raise Invalid("qualification")
    reducer = manifest["reducer_policy"]
    if reducer != {
        "create_only_after_all_four_terminal_receipts": True,
        "fail_cannot_be_reinterpreted": True,
        "fresh_native_goal_required": True,
        "input_only_compact_verified_atom_outputs": True,
        "reducer_predeclared_now": False,
    }:
        raise Invalid("reducer policy")
    atoms = manifest["atoms"]
    if not isinstance(atoms, list) or len(atoms) != 4:
        raise Invalid("atom count")
    ids: set[str] = set()
    prompts: set[str] = set()
    operations: set[str] = set()
    maxima = {"prompt": 0, "evidence": 0, "goal": 0, "criterion": 0, "output": 0}
    source_cache: dict[str, Any] = {}
    for expected_index, atom in enumerate(atoms):
        exact_keys(atom, ATOM_KEYS, f"atom {expected_index}")
        if atom["atom_index"] != expected_index or atom["status"] != "PREDECLARED_NOT_EXECUTED":
            raise Invalid("atom index or status")
        if atom["atom_id"] in ids or atom["prompt_utf8_sha256"] in prompts:
            raise Invalid("atom identity collision")
        ids.add(atom["atom_id"])
        prompts.add(atom["prompt_utf8_sha256"])
        if atom["operation_count"] != 1 or atom["operation"] not in OPERATIONS:
            raise Invalid("atom operation")
        operations.add(atom["operation"])
        if atom["dependency_atom_ids"] != []:
            raise Invalid("review atoms must be independent roots")
        bound(atom["evidence_slice_utf8"], atom["evidence_slice_utf8_bytes"], atom["evidence_slice_utf8_sha256"], 256, "evidence")
        evidence = decode(atom["evidence_slice_utf8"].encode())
        if not isinstance(evidence, dict) or atom["evidence_slice_utf8"].encode() != canon(evidence)[:-1]:
            raise Invalid("evidence must be canonical compact object")
        bound(atom["goal_objective_utf8"], atom["goal_objective_utf8_bytes"], atom["goal_objective_utf8_sha256"], 256, "goal")
        bound(atom["acceptance_criterion_utf8"], atom["acceptance_criterion_utf8_bytes"], atom["acceptance_criterion_utf8_sha256"], 256, "criterion")
        bound(atom["output_contract_utf8"], atom["output_contract_utf8_bytes"], atom["output_contract_utf8_sha256"], 128, "output")
        bound(atom["prompt_utf8"], atom["prompt_utf8_bytes"], atom["prompt_utf8_sha256"], 512, "prompt")
        if atom["output_contract_utf8"] != OUTPUT:
            raise Invalid("output contract")
        prompt = atom["prompt_utf8"]
        if prompt.count(atom["evidence_slice_utf8"]) != 1 or prompt.count(OUTPUT) != 1:
            raise Invalid("prompt fusion")
        if not prompt.startswith(f"Evidence: {atom['evidence_slice_utf8']}\nDecide only "):
            raise Invalid("prompt scope prefix")
        if not prompt.endswith(f"Return only {OUTPUT}. Then mark the active Goal complete."):
            raise Invalid("prompt terminal contract")
        source = exact_keys(atom["source_projection"], {"json_pointers", "path"}, "source projection")
        if source["path"] not in source_cache:
            source_obj = decode(read_regular(HERE / source["path"]))
            if not isinstance(source_obj, dict):
                raise Invalid("source object")
            source_cache[source["path"]] = source_obj
        for json_pointer in source["json_pointers"]:
            pointer(source_cache[source["path"]], json_pointer)
        maxima["prompt"] = max(maxima["prompt"], atom["prompt_utf8_bytes"])
        maxima["evidence"] = max(maxima["evidence"], atom["evidence_slice_utf8_bytes"])
        maxima["goal"] = max(maxima["goal"], atom["goal_objective_utf8_bytes"])
        maxima["criterion"] = max(maxima["criterion"], atom["acceptance_criterion_utf8_bytes"])
        maxima["output"] = max(maxima["output"], atom["output_contract_utf8_bytes"])
    if operations != OPERATIONS:
        raise Invalid("operation coverage")
    return maxima


def mutation_self_test(original: dict[str, Any]) -> int:
    mutations: list[tuple[str, Callable[[dict[str, Any]], None]]] = []
    def add(name: str, fn: Callable[[dict[str, Any]], None]) -> None:
        mutations.append((name, fn))
    add("schema", lambda x: x.__setitem__("schema_id", "wrong"))
    add("authority", lambda x: x["authority"].__setitem__("review_atom_launch", True))
    add("qualification", lambda x: x["qualification"].__setitem__("current_streak", 1))
    add("atom-count", lambda x: x["atoms"].pop())
    add("index", lambda x: x["atoms"][0].__setitem__("atom_index", 1))
    add("status", lambda x: x["atoms"][0].__setitem__("status", "PASS"))
    add("duplicate-id", lambda x: x["atoms"][1].__setitem__("atom_id", x["atoms"][0]["atom_id"]))
    add("duplicate-prompt", lambda x: x["atoms"][1].__setitem__("prompt_utf8_sha256", x["atoms"][0]["prompt_utf8_sha256"]))
    add("operation-count", lambda x: x["atoms"][0].__setitem__("operation_count", 2))
    add("operation", lambda x: x["atoms"][0].__setitem__("operation", "VERIFY_ALL"))
    add("dependency", lambda x: x["atoms"][0]["dependency_atom_ids"].append("other"))
    add("evidence-bytes", lambda x: x["atoms"][0].__setitem__("evidence_slice_utf8_bytes", 0))
    add("evidence-hash", lambda x: x["atoms"][0].__setitem__("evidence_slice_utf8_sha256", "0" * 64))
    add("evidence-shape", lambda x: x["atoms"][0].__setitem__("evidence_slice_utf8", "[]"))
    add("goal-bytes", lambda x: x["atoms"][0].__setitem__("goal_objective_utf8_bytes", 0))
    add("criterion-hash", lambda x: x["atoms"][0].__setitem__("acceptance_criterion_utf8_sha256", "0" * 64))
    add("output", lambda x: x["atoms"][0].__setitem__("output_contract_utf8", "PASS"))
    add("prompt-bytes", lambda x: x["atoms"][0].__setitem__("prompt_utf8_bytes", 513))
    add("prompt-hash", lambda x: x["atoms"][0].__setitem__("prompt_utf8_sha256", "0" * 64))
    add("prompt-fusion", lambda x: x["atoms"][0].__setitem__("prompt_utf8", "wrong"))
    add("source-path", lambda x: x["atoms"][0]["source_projection"].__setitem__("path", "missing.json"))
    add("source-pointer", lambda x: x["atoms"][0]["source_projection"]["json_pointers"].__setitem__(0, "/missing"))
    add("policy", lambda x: x["policy"].__setitem__("short_but_compound_rejected", False))
    add("reducer", lambda x: x["reducer_policy"].__setitem__("reducer_predeclared_now", True))
    for name, mutate in mutations:
        candidate = copy.deepcopy(original)
        mutate(candidate)
        try:
            validate(candidate, check_files=False)
        except (Invalid, OSError):
            continue
        raise Invalid(f"mutation accepted: {name}")
    return len(mutations)


def emit(value: dict[str, Any]) -> None:
    sys.stdout.buffer.write(canon(value))


def main() -> int:
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--check", action="store_true")
    group.add_argument("--mutation-self-test", action="store_true")
    args = parser.parse_args()
    try:
        manifest, data = load_manifest()
        maxima = validate(manifest)
        if args.check:
            emit({"atom_count": 4, "bytes": len(data), "first_mismatch": None, "maxima": maxima, "schema_id": "pw-r9-goal-mode-omp-native-lifecycle-probe-review-atom-check-v1", "sha256": sha(data), "status": "PASS", "workspace_writes": 0})
        else:
            count = mutation_self_test(manifest)
            emit({"first_mismatch": None, "mutation_count": count, "schema_id": "pw-r9-goal-mode-omp-native-lifecycle-probe-review-atom-mutation-check-v1", "status": "PASS", "workspace_writes": 0})
        return 0
    except Exception as exc:
        emit({"first_mismatch": str(exc), "schema_id": "pw-r9-goal-mode-omp-native-lifecycle-probe-review-atom-check-failure-v1", "status": "FAIL_CLOSED", "workspace_writes": 0})
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
