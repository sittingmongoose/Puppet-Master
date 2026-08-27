#!/usr/bin/env python3
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import stat
import sys
from pathlib import Path
from typing import Any, Callable

from check_s10_edge_atom_manifest_v1 import Invalid, canon, exact_keys, file_binding, load_json, require


AGGREGATE = {"bytes": 95207, "mode": "0644", "path": "goal_mode_atomic_aggregate_manifest_v1.json", "sha256": "c4f14429cd4562c786fb076825d4c963a9350b4ea5800bfb1994314a24e5ed5d"}
AGGREGATE_RECEIPT = {"bytes": 2442, "mode": "0644", "path": "r9_goal_mode_omp_atomic_aggregate_mechanical_receipt_v1.json", "sha256": "e1db6e5db9d5b4c26d930d1e31a821b5ecc0f9ceb59c93988827822434b0dbb0"}
SHARDS = [
    {"bytes": 127745, "mode": "0644", "path": "s10_decision_atom_manifest_v1.json", "sha256": "607cb329be483ee824baf918fcd2d35395dda4f7460ab2b7c394c84248436c2b"},
    {"bytes": 64831, "mode": "0644", "path": "s10_edge_atom_manifest_v2.json", "sha256": "9d3f9bdfc5d5c64cad102ddc74af04d3d963c8bd6e142dff359750c72d2fc15a"},
    {"bytes": 18246, "mode": "0644", "path": "s10_tension_atom_manifest_v2.json", "sha256": "5c3c9c89250574b310e6e8d5daaff0a7fbd592a6935725c8895f2eb0402d0048"},
    {"bytes": 123246, "mode": "0644", "path": "s30_decision_atom_manifest_v2.json", "sha256": "a3675b4273b9e638f79a33fc81f8fc49da5ef0f3294e316bcf7cbcbe2e680c48"},
    {"bytes": 41173, "mode": "0644", "path": "terminal_atom_manifest_v5.json", "sha256": "ba679f86b128c5079b6868695a8a809e56750cdc234281e348fe9c5daa6ae055"},
]
BINDINGS = [AGGREGATE, AGGREGATE_RECEIPT, *SHARDS]
LIMITS = {"acceptance_criterion_max_utf8_bytes": 256, "evidence_slice_max_utf8_bytes": 256, "goal_objective_max_utf8_bytes": 256, "output_contract_max_utf8_bytes": 128, "prompt_max_utf8_bytes": 512}
AUTHORITY = {"bridge_install": False, "canary_launch": False, "headless_handoff": False, "independent_review_complete": False, "matrix_launch": False, "omp_process_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0, "subject_launch": False}
POLICY = {"every_review_has_one_acceptance_criterion": True, "every_review_has_one_evidence_slice": True, "every_review_has_one_fresh_native_goal": True, "every_review_has_one_operation": True, "every_review_has_one_output_contract": True, "every_review_has_one_subject_prompt": True, "no_review_prompt_before_native_goal_activation": True, "no_reviewer_receives_full_suite": True, "reviewer_task_and_goal_reuse_forbidden": True}
REDUCER_POLICY = {"create_only_after_all_108_terminal_receipts": True, "fail_cannot_be_reinterpreted": True, "input_only_compact_review_outputs": True, "reducer_predeclared_now": False}
UNRESOLVED = ["No semantic review atom has executed.", "The existing Windows OMP no-subject Goal-Mode handshake response is absent.", "No bridge install or same-owner headless handoff is authorized.", "No canary or matrix launch is authorized.", "Qualification remains 0/2."]
OUTPUT = '"PASS" or {"first_mismatch":"<brief>"}'
ATOM_GOAL = "Verify one atom output is exactly supported by its one compact fact slice."
ATOM_CRITERION = "PASS only if Out exactly follows Facts for the one named operation."
REDUCER_GOAL = "Verify one reducer uses all declared components deterministically with no model step."
REDUCER_CRITERION = "PASS only if the reducer is closed, deterministic, complete, and model-free."
ROOT_KEYS = {"artifact_id", "atoms", "authority", "bindings", "limits", "observed_maxima", "policy", "reducer_policy", "schema_id", "status", "summary", "unresolved"}
ATOM_KEYS = {"acceptance_criterion_utf8", "acceptance_criterion_utf8_bytes", "acceptance_criterion_utf8_sha256", "atom_id", "atom_index", "dependency_atom_ids", "evidence_slice_utf8", "evidence_slice_utf8_bytes", "evidence_slice_utf8_sha256", "goal_objective_utf8", "goal_objective_utf8_bytes", "goal_objective_utf8_sha256", "operation", "operation_count", "output_contract_utf8", "output_contract_utf8_bytes", "output_contract_utf8_sha256", "prompt_utf8", "prompt_utf8_bytes", "prompt_utf8_sha256", "review_kind", "source_projection", "status"}


def identity(text: str, expected_bytes: int, expected_sha: str, limit: int, label: str) -> None:
    raw = text.encode()
    require(text != "" and len(raw) == expected_bytes and hashlib.sha256(raw).hexdigest() == expected_sha and len(raw) <= limit, f"identity/limit:{label}")


def id_fields(text: str) -> tuple[int, str]:
    raw = text.encode()
    return len(raw), hashlib.sha256(raw).hexdigest()


def load_bound(base: Path, binding: dict[str, Any], label: str) -> dict[str, Any]:
    path = file_binding(base, binding, label)
    raw, value = load_json(path)
    require(raw == canon(value), f"canonical:{label}")
    return value


def atom_review(source: dict[str, Any], manifest_path: str, index: int) -> dict[str, Any]:
    evidence = source["evidence_slice_utf8"]
    prompt = f"Op:{source['operation_kind']}\nAim:{source['objective']}\nFacts:{evidence}\nOut:{source['expected_output_utf8']}\nIs Out exactly supported? Return {OUTPUT}. Complete Goal."
    criterion_bytes, criterion_sha = id_fields(ATOM_CRITERION)
    evidence_bytes, evidence_sha = id_fields(evidence)
    goal_bytes, goal_sha = id_fields(ATOM_GOAL)
    output_bytes, output_sha = id_fields(OUTPUT)
    prompt_bytes, prompt_sha = id_fields(prompt)
    return {"acceptance_criterion_utf8": ATOM_CRITERION, "acceptance_criterion_utf8_bytes": criterion_bytes, "acceptance_criterion_utf8_sha256": criterion_sha, "atom_id": f"semantic-review:{source['atom_id']}", "atom_index": index, "dependency_atom_ids": [], "evidence_slice_utf8": evidence, "evidence_slice_utf8_bytes": evidence_bytes, "evidence_slice_utf8_sha256": evidence_sha, "goal_objective_utf8": ATOM_GOAL, "goal_objective_utf8_bytes": goal_bytes, "goal_objective_utf8_sha256": goal_sha, "operation": "VERIFY_ONE_CLAIM", "operation_count": 1, "output_contract_utf8": OUTPUT, "output_contract_utf8_bytes": output_bytes, "output_contract_utf8_sha256": output_sha, "prompt_utf8": prompt, "prompt_utf8_bytes": prompt_bytes, "prompt_utf8_sha256": prompt_sha, "review_kind": "ATOM_FACT_OUTPUT", "source_projection": {"manifest_path": manifest_path, "source_atom_id": source["atom_id"], "source_expected_output_utf8_bytes": source["expected_output_utf8_bytes"], "source_expected_output_utf8_sha256": source["expected_output_utf8_sha256"], "source_prompt_utf8_bytes": source["prompt_utf8_bytes"], "source_prompt_utf8_sha256": source["prompt_utf8_sha256"]}, "status": "PREDECLARED_NOT_EXECUTED"}


def reducer_review(reducer: dict[str, Any], cell: dict[str, Any], index: int) -> dict[str, Any]:
    reducer_raw = json.dumps(reducer, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    component_count = len(reducer.get("edge_rows", [])) or 1
    evidence = json.dumps({"components": component_count, "expected_sha256": cell["expected_output_utf8_sha256"], "model_steps": 0, "recipe_sha256": hashlib.sha256(reducer_raw).hexdigest(), "serialize": "field_order_minified_no_lf"}, sort_keys=True, separators=(",", ":"))
    prompt = f"Reducer:{evidence}\nDoes it use all components deterministically with no model step? Return {OUTPUT}. Complete Goal."
    criterion_bytes, criterion_sha = id_fields(REDUCER_CRITERION)
    evidence_bytes, evidence_sha = id_fields(evidence)
    goal_bytes, goal_sha = id_fields(REDUCER_GOAL)
    output_bytes, output_sha = id_fields(OUTPUT)
    prompt_bytes, prompt_sha = id_fields(prompt)
    return {"acceptance_criterion_utf8": REDUCER_CRITERION, "acceptance_criterion_utf8_bytes": criterion_bytes, "acceptance_criterion_utf8_sha256": criterion_sha, "atom_id": f"semantic-review:reducer:{reducer['reducer_id']}", "atom_index": index, "dependency_atom_ids": [], "evidence_slice_utf8": evidence, "evidence_slice_utf8_bytes": evidence_bytes, "evidence_slice_utf8_sha256": evidence_sha, "goal_objective_utf8": REDUCER_GOAL, "goal_objective_utf8_bytes": goal_bytes, "goal_objective_utf8_sha256": goal_sha, "operation": "VERIFY_ONE_CLAIM", "operation_count": 1, "output_contract_utf8": OUTPUT, "output_contract_utf8_bytes": output_bytes, "output_contract_utf8_sha256": output_sha, "prompt_utf8": prompt, "prompt_utf8_bytes": prompt_bytes, "prompt_utf8_sha256": prompt_sha, "review_kind": "DETERMINISTIC_REDUCER_POLICY", "source_projection": {"cell_id": cell["source_cell_id"], "component_atom_ids": cell["atom_ids"], "manifest_path": "terminal_atom_manifest_v5.json", "reducer_id": reducer["reducer_id"], "reducer_utf8_bytes": len(reducer_raw), "reducer_utf8_sha256": hashlib.sha256(reducer_raw).hexdigest()}, "status": "PREDECLARED_NOT_EXECUTED"}


def expected_atoms(base: Path) -> list[dict[str, Any]]:
    aggregate = load_bound(base, AGGREGATE, "aggregate")
    load_bound(base, AGGREGATE_RECEIPT, "aggregate receipt")
    manifests = [load_bound(base, binding, f"shard:{index}") for index, binding in enumerate(SHARDS)]
    require(aggregate["shard_bindings"] == SHARDS and len(aggregate["atom_index"]) == 104, "aggregate projection")
    source_atoms = {atom["atom_id"]: (binding["path"], atom) for binding, manifest in zip(SHARDS, manifests, strict=True) for atom in manifest["atoms"]}
    require(len(source_atoms) == 104, "source atom count")
    reviews: list[dict[str, Any]] = []
    for source_index in aggregate["atom_index"]:
        require(source_index["atom_id"] in source_atoms, f"aggregate source:{source_index['atom_id']}")
        path, source = source_atoms[source_index["atom_id"]]
        require(source_index["prompt_utf8_sha256"] == source["prompt_utf8_sha256"] and source_index["expected_output_utf8_sha256"] == source["expected_output_utf8_sha256"], f"aggregate atom identity:{source['atom_id']}")
        reviews.append(atom_review(source, path, len(reviews)))
    terminal = manifests[-1]
    cells = {cell["source_cell_id"]: cell for cell in terminal["cells"]}
    for reducer in terminal["deterministic_reducers"]:
        require(reducer["cell_id"] in cells, f"reducer cell:{reducer['reducer_id']}")
        reviews.append(reducer_review(reducer, cells[reducer["cell_id"]], len(reviews)))
    return reviews


def check_obj(value: dict[str, Any], path: Path) -> dict[str, int]:
    exact_keys(value, ROOT_KEYS, "root")
    require(value["artifact_id"] == "PW-R9-GOAL-MODE-OMP-ATOMIC-SEMANTIC-REVIEW-MANIFEST-V1", "artifact id")
    require(value["schema_id"] == "pw-r9-goal-mode-omp-atomic-semantic-review-manifest-v1", "schema id")
    require(value["status"] == "PREDECLARED_108_BITE_SIZE_GOAL_REVIEW_ATOMS_NOT_EXECUTED_ZERO_CREDIT_NO_LAUNCH", "status")
    require(value["authority"] == AUTHORITY and value["bindings"] == BINDINGS and value["limits"] == LIMITS, "authority/bindings/limits")
    require(value["policy"] == POLICY and value["reducer_policy"] == REDUCER_POLICY and value["unresolved"] == UNRESOLVED, "policy/unresolved")
    expected = expected_atoms(path.parent)
    require(value["atoms"] == expected and len(expected) == 108, "review atom catalog")
    atom_ids: set[str] = set()
    prompt_hashes: set[str] = set()
    maxima = {"acceptance_criterion_utf8_bytes": 0, "evidence_slice_utf8_bytes": 0, "goal_objective_utf8_bytes": 0, "output_contract_utf8_bytes": 0, "prompt_utf8_bytes": 0}
    for index, atom in enumerate(value["atoms"]):
        exact_keys(atom, ATOM_KEYS, f"atom:{index}")
        require(atom["atom_index"] == index and atom["atom_id"] not in atom_ids and atom["prompt_utf8_sha256"] not in prompt_hashes, f"unique/index:{index}")
        require(atom["operation"] == "VERIFY_ONE_CLAIM" and atom["operation_count"] == 1 and atom["dependency_atom_ids"] == [] and atom["status"] == "PREDECLARED_NOT_EXECUTED", f"operation/state:{index}")
        identity(atom["acceptance_criterion_utf8"], atom["acceptance_criterion_utf8_bytes"], atom["acceptance_criterion_utf8_sha256"], LIMITS["acceptance_criterion_max_utf8_bytes"], f"criterion:{index}")
        identity(atom["evidence_slice_utf8"], atom["evidence_slice_utf8_bytes"], atom["evidence_slice_utf8_sha256"], LIMITS["evidence_slice_max_utf8_bytes"], f"evidence:{index}")
        identity(atom["goal_objective_utf8"], atom["goal_objective_utf8_bytes"], atom["goal_objective_utf8_sha256"], LIMITS["goal_objective_max_utf8_bytes"], f"goal:{index}")
        identity(atom["output_contract_utf8"], atom["output_contract_utf8_bytes"], atom["output_contract_utf8_sha256"], LIMITS["output_contract_max_utf8_bytes"], f"output:{index}")
        identity(atom["prompt_utf8"], atom["prompt_utf8_bytes"], atom["prompt_utf8_sha256"], LIMITS["prompt_max_utf8_bytes"], f"prompt:{index}")
        atom_ids.add(atom["atom_id"])
        prompt_hashes.add(atom["prompt_utf8_sha256"])
        for key in maxima:
            maxima[key] = max(maxima[key], atom[key])
    require(value["observed_maxima"] == maxima == {"acceptance_criterion_utf8_bytes": 76, "evidence_slice_utf8_bytes": 241, "goal_objective_utf8_bytes": 85, "output_contract_utf8_bytes": 38, "prompt_utf8_bytes": 499}, "maxima")
    require(value["summary"] == {"atom_fact_output_review_count": 104, "deterministic_reducer_policy_review_count": 4, "prompt_hash_count": 108, "review_count": 108}, "summary")
    return {"max_evidence": 241, "max_prompt": 499, "review_count": 108}


def check_path(path: Path) -> tuple[dict[str, Any], dict[str, int]]:
    raw, value = load_json(path)
    require(raw == canon(value), "canonical manifest")
    require(stat.S_IMODE(path.stat().st_mode) == 0o644, "manifest mode")
    return value, check_obj(value, path)


def mutations() -> list[tuple[str, Callable[[dict[str, Any]], None]]]:
    return [
        ("status", lambda value: value.__setitem__("status", "PASS")),
        ("authority", lambda value: value["authority"].__setitem__("subject_launch", True)),
        ("credit", lambda value: value["authority"].__setitem__("qualification_credit", 1)),
        ("binding", lambda value: value["bindings"][0].__setitem__("bytes", 1)),
        ("limit", lambda value: value["limits"].__setitem__("prompt_max_utf8_bytes", 4096)),
        ("policy-goal", lambda value: value["policy"].__setitem__("every_review_has_one_fresh_native_goal", False)),
        ("policy-suite", lambda value: value["policy"].__setitem__("no_reviewer_receives_full_suite", False)),
        ("policy-reuse", lambda value: value["policy"].__setitem__("reviewer_task_and_goal_reuse_forbidden", False)),
        ("reducer", lambda value: value["reducer_policy"].__setitem__("reducer_predeclared_now", True)),
        ("drop-atom", lambda value: value["atoms"].pop()),
        ("atom-id", lambda value: value["atoms"][0].__setitem__("atom_id", "wrong")),
        ("atom-index", lambda value: value["atoms"][1].__setitem__("atom_index", 0)),
        ("dependency", lambda value: value["atoms"][0]["dependency_atom_ids"].append("other")),
        ("operation", lambda value: value["atoms"][0].__setitem__("operation", "REVIEW_ALL")),
        ("operation-count", lambda value: value["atoms"][0].__setitem__("operation_count", 2)),
        ("criterion", lambda value: value["atoms"][0].__setitem__("acceptance_criterion_utf8", "Pass everything.")),
        ("evidence", lambda value: value["atoms"][0].__setitem__("evidence_slice_utf8", "{}")),
        ("goal", lambda value: value["atoms"][0].__setitem__("goal_objective_utf8", "Review all atoms.")),
        ("output", lambda value: value["atoms"][0].__setitem__("output_contract_utf8", "PASS")),
        ("prompt", lambda value: value["atoms"][0].__setitem__("prompt_utf8", value["atoms"][0]["prompt_utf8"] + " Explain.")),
        ("prompt-bytes", lambda value: value["atoms"][0].__setitem__("prompt_utf8_bytes", 513)),
        ("review-kind", lambda value: value["atoms"][0].__setitem__("review_kind", "FULL_SUITE")),
        ("projection-atom", lambda value: value["atoms"][0]["source_projection"].__setitem__("source_atom_id", "wrong")),
        ("projection-prompt", lambda value: value["atoms"][0]["source_projection"].__setitem__("source_prompt_utf8_sha256", "0" * 64)),
        ("projection-reducer", lambda value: value["atoms"][-1]["source_projection"].__setitem__("reducer_utf8_bytes", 1)),
        ("maxima", lambda value: value["observed_maxima"].__setitem__("prompt_utf8_bytes", 512)),
        ("summary", lambda value: value["summary"].__setitem__("review_count", 107)),
        ("unresolved", lambda value: value["unresolved"].pop()),
        ("root-extra", lambda value: value.__setitem__("extra", True)),
    ]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true")
    mode.add_argument("--mutation-self-test", action="store_true")
    args = parser.parse_args()
    path = Path(args.manifest)
    require(path.is_absolute(), "manifest must be absolute")
    value, stats = check_path(path)
    count = 0
    if args.mutation_self_test:
        for name, mutate in mutations():
            candidate = copy.deepcopy(value)
            mutate(candidate)
            try:
                check_obj(candidate, path)
            except Invalid:
                count += 1
            else:
                raise Invalid(f"mutation accepted:{name}")
    sys.stdout.buffer.write(canon({"first_mismatch": None, "max_evidence_slice_utf8_bytes": stats["max_evidence"], "max_prompt_utf8_bytes": stats["max_prompt"], "mode": "mutation-self-test" if args.mutation_self_test else "check", "mutation_count": count, "review_count": stats["review_count"], "schema_id": "pw-r9-goal-mode-omp-atomic-semantic-review-manifest-check-v1", "status": "PASS", "subject_calls": 0, "workspace_writes": 0}))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Invalid as exc:
        sys.stdout.buffer.write(canon({"first_mismatch": str(exc), "schema_id": "pw-r9-goal-mode-omp-atomic-semantic-review-manifest-check-v1", "status": "FAIL", "subject_calls": 0, "workspace_writes": 0}))
        raise SystemExit(1)
