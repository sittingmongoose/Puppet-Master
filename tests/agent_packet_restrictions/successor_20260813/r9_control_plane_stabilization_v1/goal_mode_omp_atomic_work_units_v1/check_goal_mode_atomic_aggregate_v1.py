#!/usr/bin/env python3
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import stat
import sys
from collections import Counter
from pathlib import Path
from typing import Any, Callable

from check_s10_edge_atom_manifest_v1 import Invalid, canon, exact_keys, file_binding, load_json, require


SOURCE = {"bytes": 786546, "cell_count": 97, "mode": "0644", "path": "../formal_candidate_v7/semantic_bundle.json", "sha256": "11139c2b52a2fe900f2976a34f7712d8f05d5b2991ce8cc26d5cfc4e1ef871c2"}
SHARDS = [
    {"bytes": 127745, "mode": "0644", "path": "s10_decision_atom_manifest_v1.json", "sha256": "607cb329be483ee824baf918fcd2d35395dda4f7460ab2b7c394c84248436c2b"},
    {"bytes": 64831, "mode": "0644", "path": "s10_edge_atom_manifest_v2.json", "sha256": "9d3f9bdfc5d5c64cad102ddc74af04d3d963c8bd6e142dff359750c72d2fc15a"},
    {"bytes": 18246, "mode": "0644", "path": "s10_tension_atom_manifest_v2.json", "sha256": "5c3c9c89250574b310e6e8d5daaff0a7fbd592a6935725c8895f2eb0402d0048"},
    {"bytes": 123246, "mode": "0644", "path": "s30_decision_atom_manifest_v2.json", "sha256": "a3675b4273b9e638f79a33fc81f8fc49da5ef0f3294e316bcf7cbcbe2e680c48"},
    {"bytes": 41173, "mode": "0644", "path": "terminal_atom_manifest_v5.json", "sha256": "ba679f86b128c5079b6868695a8a809e56750cdc234281e348fe9c5daa6ae055"},
]
RECEIPTS = [
    {"bytes": 2776, "mode": "0644", "path": "r9_goal_mode_omp_s10_decision_atom_manifest_mechanical_receipt_v1.json", "sha256": "d5f19a048d4143a1624a9faa4eb16ec2afe851eec8199c7ddfa4ce414e4a1764"},
    {"bytes": 6127, "mode": "0644", "path": "r9_goal_mode_omp_edge_tension_v2_mechanical_receipt_v1.json", "sha256": "4711ac1686d8d87b7b3d650f80e10dc88964cd79545c1dd287ce86ba395c7e6a"},
    {"bytes": 3977, "mode": "0644", "path": "r9_goal_mode_omp_s30_decision_atom_manifest_v2_mechanical_receipt_v1.json", "sha256": "c613b8d2b7fe8a1073caab081c48e9a1bbcc335896528863584503b04279f400"},
    {"bytes": 2648, "mode": "0644", "path": "r9_goal_mode_omp_terminal_atom_manifest_v5_mechanical_receipt_v1.json", "sha256": "bca1d8cfd06ed96e1fdad2d243e90bece460af7b421a72713e972b0a2b246131"},
]
LIMITS = {"evidence_slice_max_utf8_bytes": 256, "goal_objective_max_utf8_bytes": 256, "output_contract_max_utf8_bytes": 128, "scored_subject_max_utf8_bytes": 512}
AUTHORITY = {"bridge_install": False, "canary_launch": False, "full_manifest_complete": False, "matrix_launch": False, "omp_process_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0, "review_atom_launch": False, "subject_launch": False}
OPERATIONS = ["CHOOSE_ONE_FROM_ONE_CLOSED_OPTION_SET", "CLASSIFY_ONE_ITEM_ON_ONE_AXIS", "EXTRACT_ONE_VALUE", "TRANSFORM_ONE_VALUE_TO_ONE_CLOSED_SCHEMA", "VERIFY_ONE_CLAIM"]
EXECUTION = {"fresh_goal_per_test_taker": True, "fresh_task_identity_required": True, "goal_activation_before_subject_prompt": True, "goal_objective_criteria_control_binding_required": True, "headless_allowed_only_on_existing_windows_omp_owner_lane": True, "no_goal_or_task_reuse": True, "omp_launch_boundary": "WINDOWS_HOST_OMP_CWD_P_DRIVE", "subject_turns_inside_active_goal_only": True, "terminal_goal_receipt_required": True}
UNRESOLVED = ["Mechanical aggregation does not certify any compact fact, prompt, expected output, dependency judgment, or reducer semantics.", "The existing Windows OMP lane must complete a no-subject Goal-Mode handshake before any review atom may run.", "No atom has executed in native Goal Mode.", "No bridge install, OMP handoff, canary, or matrix launch is authorized.", "Qualification remains 0/2."]
ROOT_KEYS = {"artifact_id", "atom_index", "authority", "cell_index", "coverage_summary", "dependency_summary", "execution_contract", "limits", "mechanical_receipt_bindings", "observed_maxima", "operation_contract", "prompt_posture", "review_decomposition", "schema_id", "shard_bindings", "shard_summary", "source_binding", "status", "unresolved"}
CELL_KEYS = {"atom_ids", "finalization_ref", "index", "shard_id", "source_cell_id"}
ATOM_KEYS = {"atom_id", "cell_index", "dependency_atom_ids", "evidence_slice_utf8_bytes", "evidence_slice_utf8_sha256", "expected_output_utf8_bytes", "expected_output_utf8_sha256", "goal_objective_utf8_bytes", "goal_objective_utf8_sha256", "operation_kind", "prompt_utf8_bytes", "prompt_utf8_sha256", "shard_id", "source_cell_id"}


def ident(text: str, size: int, digest: str, limit: int, label: str) -> None:
    raw = text.encode()
    require(len(raw) == size and hashlib.sha256(raw).hexdigest() == digest and size <= limit, f"identity/limit:{label}")


def load_bound(base: Path, binding: dict[str, Any], label: str) -> dict[str, Any]:
    path = file_binding(base, binding, label)
    raw, value = load_json(path)
    require(raw == canon(value), f"canonical:{label}")
    return value


def derive(base: Path) -> dict[str, Any]:
    source_path = file_binding(base, {key: SOURCE[key] for key in ("bytes", "mode", "path", "sha256")}, "source")
    source_raw, source = load_json(source_path)
    require(source_raw == canon(source) and len(source.get("cells", [])) == SOURCE["cell_count"], "source canonical/count")
    manifests = [load_bound(base, binding, f"shard:{index}") for index, binding in enumerate(SHARDS)]
    for index, binding in enumerate(RECEIPTS):
        load_bound(base, binding, f"receipt:{index}")
    cells: list[dict[str, Any]] = []
    atoms: list[dict[str, Any]] = []
    shard_summary: list[dict[str, Any]] = []
    for binding, manifest in zip(SHARDS, manifests, strict=True):
        require(manifest["limits"] == LIMITS and manifest["authority"] == AUTHORITY, f"shard limit/authority:{binding['path']}")
        shard = manifest["shard"]
        require(len(manifest["cells"]) == shard["source_cell_count"] and [cell["index"] for cell in manifest["cells"]] == list(range(shard["cell_index_first"], shard["cell_index_last"] + 1)), f"shard range:{binding['path']}")
        shard_summary.append({"atom_count": len(manifest["atoms"]), "cell_count": len(manifest["cells"]), "cell_index_first": shard["cell_index_first"], "cell_index_last": shard["cell_index_last"], "manifest_path": binding["path"], "reducer_count": len(manifest.get("deterministic_reducers", [])), "shard_id": shard["shard_id"]})
        cell_map = {cell["source_cell_id"]: cell for cell in manifest["cells"]}
        require(len(cell_map) == len(manifest["cells"]), f"duplicate shard cell:{binding['path']}")
        for cell in manifest["cells"]:
            cells.append({"atom_ids": cell["atom_ids"], "finalization_ref": cell.get("final_atom_id", cell.get("reducer_id")), "index": cell["index"], "shard_id": shard["shard_id"], "source_cell_id": cell["source_cell_id"]})
        for atom in manifest["atoms"]:
            require(atom["source_cell_id"] in cell_map and atom["atom_id"] in cell_map[atom["source_cell_id"]]["atom_ids"], f"atom cell membership:{atom['atom_id']}")
            ident(atom["prompt_utf8"], atom["prompt_utf8_bytes"], atom["prompt_utf8_sha256"], LIMITS["scored_subject_max_utf8_bytes"], f"prompt:{atom['atom_id']}")
            ident(atom["evidence_slice_utf8"], atom["evidence_slice_utf8_bytes"], atom["evidence_slice_utf8_sha256"], LIMITS["evidence_slice_max_utf8_bytes"], f"evidence:{atom['atom_id']}")
            ident(atom["goal_objective_utf8"], atom["goal_objective_utf8_bytes"], atom["goal_objective_utf8_sha256"], LIMITS["goal_objective_max_utf8_bytes"], f"goal:{atom['atom_id']}")
            ident(atom["expected_output_utf8"], atom["expected_output_utf8_bytes"], atom["expected_output_utf8_sha256"], LIMITS["output_contract_max_utf8_bytes"], f"output:{atom['atom_id']}")
            require(atom["operation_kind"] in OPERATIONS, f"operation:{atom['atom_id']}")
            atoms.append({"atom_id": atom["atom_id"], "cell_index": cell_map[atom["source_cell_id"]]["index"], "dependency_atom_ids": atom["dependency_atom_ids"], "evidence_slice_utf8_bytes": atom["evidence_slice_utf8_bytes"], "evidence_slice_utf8_sha256": atom["evidence_slice_utf8_sha256"], "expected_output_utf8_bytes": atom["expected_output_utf8_bytes"], "expected_output_utf8_sha256": atom["expected_output_utf8_sha256"], "goal_objective_utf8_bytes": atom["goal_objective_utf8_bytes"], "goal_objective_utf8_sha256": atom["goal_objective_utf8_sha256"], "operation_kind": atom["operation_kind"], "prompt_utf8_bytes": atom["prompt_utf8_bytes"], "prompt_utf8_sha256": atom["prompt_utf8_sha256"], "shard_id": shard["shard_id"], "source_cell_id": atom["source_cell_id"]})
    require([cell["index"] for cell in cells] == list(range(97)), "aggregate cell indices")
    require([cell["source_cell_id"] for cell in cells] == [cell["cell"] for cell in source["cells"]], "source cell order")
    atom_ids = {atom["atom_id"] for atom in atoms}
    require(len(atom_ids) == len(atoms), "duplicate atom id")
    require(all(len(cell["atom_ids"]) == len(set(cell["atom_ids"])) and all(atom_id in atom_ids for atom_id in cell["atom_ids"]) for cell in cells), "cell atom ids")
    dependency_edges = [(atom["atom_id"], dependency) for atom in atoms for dependency in atom["dependency_atom_ids"]]
    require(all(dependency in atom_ids for _, dependency in dependency_edges), "unresolved dependency")
    graph = {atom["atom_id"]: atom["dependency_atom_ids"] for atom in atoms}
    visiting: set[str] = set()
    visited: set[str] = set()

    def visit(node: str) -> None:
        require(node not in visiting, "dependency cycle")
        if node in visited:
            return
        visiting.add(node)
        for dependency in graph[node]:
            visit(dependency)
        visiting.remove(node)
        visited.add(node)

    for atom_id in graph:
        visit(atom_id)
    prompt_hashes = [atom["prompt_utf8_sha256"] for atom in atoms]
    s10_hashes = {atom["prompt_utf8_sha256"] for atom in atoms if atom["shard_id"] == "S10_DECISIONS_000_035"}
    s30_hashes = {atom["prompt_utf8_sha256"] for atom in atoms if atom["shard_id"] == "S30_DECISIONS_058_092"}
    counts = dict(sorted(Counter(atom["operation_kind"] for atom in atoms).items()))
    return {
        "atom_index": atoms,
        "cell_index": cells,
        "coverage_summary": {"atom_count": len(atoms), "cell_count": len(cells), "cell_index_first": 0, "cell_index_last": 96, "finalized_by_atom_count": sum(cell["finalization_ref"] in atom_ids for cell in cells), "finalized_by_reducer_count": sum(cell["finalization_ref"] not in atom_ids for cell in cells), "source_cell_count": 97},
        "dependency_summary": {"cycle_detected": False, "dependency_edge_count": len(dependency_edges), "dependent_atom_count": sum(bool(atom["dependency_atom_ids"]) for atom in atoms), "resolved_edge_count": len(dependency_edges), "root_atom_count": sum(not atom["dependency_atom_ids"] for atom in atoms), "unresolved_edges": []},
        "observed_maxima": {"evidence_slice_utf8_bytes": max(atom["evidence_slice_utf8_bytes"] for atom in atoms), "expected_output_utf8_bytes": max(atom["expected_output_utf8_bytes"] for atom in atoms), "goal_objective_utf8_bytes": max(atom["goal_objective_utf8_bytes"] for atom in atoms), "prompt_utf8_bytes": max(atom["prompt_utf8_bytes"] for atom in atoms)},
        "operation_contract": {"allowed_operation_kinds": OPERATIONS, "operation_counts": counts, "unused_allowed_operation_kinds": [operation for operation in OPERATIONS if operation not in counts]},
        "prompt_posture": {"all_prompt_hash_count": len(prompt_hashes), "all_prompt_hash_unique_count": len(set(prompt_hashes)), "s10_decision_prompt_hash_count": len(s10_hashes), "s10_s30_prompt_hash_overlap_count": len(s10_hashes & s30_hashes), "s30_decision_prompt_hash_count": len(s30_hashes)},
        "review_decomposition": {"atom_semantic_review_count": len(atoms), "deterministic_reducer_review_count": sum(summary["reducer_count"] for summary in shard_summary), "max_atoms_per_review_work_unit": 1, "max_reducers_per_review_work_unit": 1, "rule": "One fresh Goal-Mode reviewer receives one atom or one reducer only; no reviewer receives the full suite."},
        "shard_summary": shard_summary,
    }


def check_obj(value: dict[str, Any], path: Path) -> dict[str, int]:
    exact_keys(value, ROOT_KEYS, "root")
    require(value["artifact_id"] == "PW-R9-GOAL-MODE-OMP-ATOMIC-AGGREGATE-MANIFEST-V1", "artifact id")
    require(value["schema_id"] == "pw-r9-goal-mode-omp-atomic-aggregate-manifest-v1", "schema id")
    require(value["status"] == "STRUCTURALLY_COMPLETE_97_CELLS_104_ATOMS_ZERO_CREDIT_NO_LAUNCH_PENDING_BOUNDED_SEMANTIC_REVIEWS", "status")
    require(value["authority"] == AUTHORITY and value["limits"] == LIMITS, "authority/limits")
    require(value["source_binding"] == SOURCE and value["shard_bindings"] == SHARDS and value["mechanical_receipt_bindings"] == RECEIPTS, "bindings")
    require(value["execution_contract"] == EXECUTION, "execution contract")
    require(value["unresolved"] == UNRESOLVED, "unresolved")
    expected = derive(path.parent)
    for key, expected_value in expected.items():
        require(value[key] == expected_value, f"derived:{key}")
    for index, cell in enumerate(value["cell_index"]):
        exact_keys(cell, CELL_KEYS, f"cell:{index}")
    for index, atom in enumerate(value["atom_index"]):
        exact_keys(atom, ATOM_KEYS, f"atom:{index}")
    require(value["coverage_summary"] == {"atom_count": 104, "cell_count": 97, "cell_index_first": 0, "cell_index_last": 96, "finalized_by_atom_count": 93, "finalized_by_reducer_count": 4, "source_cell_count": 97}, "fixed coverage")
    require(value["dependency_summary"] == {"cycle_detected": False, "dependency_edge_count": 16, "dependent_atom_count": 8, "resolved_edge_count": 16, "root_atom_count": 96, "unresolved_edges": []}, "fixed dependency summary")
    require(value["observed_maxima"] == {"evidence_slice_utf8_bytes": 212, "expected_output_utf8_bytes": 92, "goal_objective_utf8_bytes": 69, "prompt_utf8_bytes": 509}, "fixed maxima")
    require(value["operation_contract"]["operation_counts"] == {"CHOOSE_ONE_FROM_ONE_CLOSED_OPTION_SET": 71, "CLASSIFY_ONE_ITEM_ON_ONE_AXIS": 7, "VERIFY_ONE_CLAIM": 26}, "fixed operation counts")
    require(value["prompt_posture"] == {"all_prompt_hash_count": 104, "all_prompt_hash_unique_count": 104, "s10_decision_prompt_hash_count": 36, "s10_s30_prompt_hash_overlap_count": 0, "s30_decision_prompt_hash_count": 35}, "fixed prompt posture")
    require(value["review_decomposition"]["atom_semantic_review_count"] == 104 and value["review_decomposition"]["deterministic_reducer_review_count"] == 4, "fixed review count")
    return {"atom_count": 104, "cell_count": 97, "dependency_edge_count": 16, "review_unit_count": 108}


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
        ("source", lambda value: value["source_binding"].__setitem__("sha256", "0" * 64)),
        ("shard", lambda value: value["shard_bindings"][0].__setitem__("bytes", 1)),
        ("rejected-shard", lambda value: value["shard_bindings"].__setitem__(1, {"bytes": 64357, "mode": "0644", "path": "s10_edge_atom_manifest_v1.json", "sha256": "d2fe5744327976e80cfd61a1dc3ace1bca5409783e8361b17b9a601c8bd52907"})),
        ("receipt", lambda value: value["mechanical_receipt_bindings"][0].__setitem__("bytes", 1)),
        ("drop-cell", lambda value: value["cell_index"].pop()),
        ("cell-index", lambda value: value["cell_index"][0].__setitem__("index", 1)),
        ("cell-id", lambda value: value["cell_index"][0].__setitem__("source_cell_id", "wrong")),
        ("cell-finalizer", lambda value: value["cell_index"][0].__setitem__("finalization_ref", "wrong")),
        ("drop-atom", lambda value: value["atom_index"].pop()),
        ("atom-id", lambda value: value["atom_index"][0].__setitem__("atom_id", "wrong")),
        ("operation", lambda value: value["atom_index"][0].__setitem__("operation_kind", "JUDGE_ALL")),
        ("prompt-hash", lambda value: value["atom_index"][0].__setitem__("prompt_utf8_sha256", "0" * 64)),
        ("prompt-bytes", lambda value: value["atom_index"][0].__setitem__("prompt_utf8_bytes", 513)),
        ("evidence-bytes", lambda value: value["atom_index"][0].__setitem__("evidence_slice_utf8_bytes", 257)),
        ("goal-bytes", lambda value: value["atom_index"][0].__setitem__("goal_objective_utf8_bytes", 257)),
        ("output-bytes", lambda value: value["atom_index"][0].__setitem__("expected_output_utf8_bytes", 129)),
        ("dependency", lambda value: value["atom_index"][-4]["dependency_atom_ids"].__setitem__(0, "missing")),
        ("coverage", lambda value: value["coverage_summary"].__setitem__("atom_count", 103)),
        ("dependency-count", lambda value: value["dependency_summary"].__setitem__("dependency_edge_count", 15)),
        ("cycle", lambda value: value["dependency_summary"].__setitem__("cycle_detected", True)),
        ("maxima", lambda value: value["observed_maxima"].__setitem__("prompt_utf8_bytes", 512)),
        ("operation-count", lambda value: value["operation_contract"]["operation_counts"].__setitem__("VERIFY_ONE_CLAIM", 25)),
        ("posture", lambda value: value["prompt_posture"].__setitem__("s10_s30_prompt_hash_overlap_count", 1)),
        ("review-width", lambda value: value["review_decomposition"].__setitem__("max_atoms_per_review_work_unit", 2)),
        ("review-count", lambda value: value["review_decomposition"].__setitem__("atom_semantic_review_count", 103)),
        ("goal-activation", lambda value: value["execution_contract"].__setitem__("goal_activation_before_subject_prompt", False)),
        ("goal-reuse", lambda value: value["execution_contract"].__setitem__("no_goal_or_task_reuse", False)),
        ("omp-owner", lambda value: value["execution_contract"].__setitem__("headless_allowed_only_on_existing_windows_omp_owner_lane", False)),
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
    sys.stdout.buffer.write(canon({"atom_count": stats["atom_count"], "cell_count": stats["cell_count"], "dependency_edge_count": stats["dependency_edge_count"], "first_mismatch": None, "mode": "mutation-self-test" if args.mutation_self_test else "check", "mutation_count": count, "review_unit_count": stats["review_unit_count"], "schema_id": "pw-r9-goal-mode-omp-atomic-aggregate-check-v1", "semantic_review_status": "PENDING", "status": "PASS", "subject_calls": 0, "workspace_writes": 0}))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Invalid as exc:
        sys.stdout.buffer.write(canon({"first_mismatch": str(exc), "schema_id": "pw-r9-goal-mode-omp-atomic-aggregate-check-v1", "semantic_review_status": "PENDING", "status": "FAIL", "subject_calls": 0, "workspace_writes": 0}))
        raise SystemExit(1)
