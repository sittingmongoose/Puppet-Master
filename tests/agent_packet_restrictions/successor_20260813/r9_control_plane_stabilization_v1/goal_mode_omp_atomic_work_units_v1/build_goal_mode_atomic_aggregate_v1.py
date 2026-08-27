#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import stat
from collections import Counter
from pathlib import Path
from typing import Any

from build_s10_edge_atom_manifest_v1 import canon, write_exclusive


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


def read_bound(base: Path, binding: dict[str, Any]) -> dict[str, Any]:
    path = (base / binding["path"]).resolve()
    raw = path.read_bytes()
    if len(raw) != binding["bytes"] or hashlib.sha256(raw).hexdigest() != binding["sha256"]:
        raise ValueError(f"binding identity:{binding['path']}")
    if stat.S_IMODE(path.stat().st_mode) != int(binding["mode"], 8):
        raise ValueError(f"binding mode:{binding['path']}")
    value = json.loads(raw)
    if raw != canon(value):
        raise ValueError(f"binding canonical:{binding['path']}")
    return value


def construct(base: Path) -> dict[str, Any]:
    source = read_bound(base, {key: SOURCE[key] for key in ("bytes", "mode", "path", "sha256")})
    if len(source.get("cells", [])) != SOURCE["cell_count"]:
        raise ValueError("source cell count")
    manifests = [read_bound(base, binding) for binding in SHARDS]
    for binding in RECEIPTS:
        read_bound(base, binding)
    cells: list[dict[str, Any]] = []
    atoms: list[dict[str, Any]] = []
    shard_summary: list[dict[str, Any]] = []
    for binding, manifest in zip(SHARDS, manifests, strict=True):
        if manifest["limits"] != LIMITS or manifest["authority"] != AUTHORITY:
            raise ValueError(f"shard limits/authority:{binding['path']}")
        shard = manifest["shard"]
        shard_summary.append({"atom_count": len(manifest["atoms"]), "cell_count": len(manifest["cells"]), "cell_index_first": shard["cell_index_first"], "cell_index_last": shard["cell_index_last"], "manifest_path": binding["path"], "reducer_count": len(manifest.get("deterministic_reducers", [])), "shard_id": shard["shard_id"]})
        for cell in manifest["cells"]:
            cells.append({"atom_ids": cell["atom_ids"], "finalization_ref": cell.get("final_atom_id", cell.get("reducer_id")), "index": cell["index"], "shard_id": shard["shard_id"], "source_cell_id": cell["source_cell_id"]})
        cell_indices = {cell["source_cell_id"]: cell["index"] for cell in manifest["cells"]}
        for atom in manifest["atoms"]:
            atoms.append({"atom_id": atom["atom_id"], "cell_index": cell_indices[atom["source_cell_id"]], "dependency_atom_ids": atom["dependency_atom_ids"], "evidence_slice_utf8_bytes": atom["evidence_slice_utf8_bytes"], "evidence_slice_utf8_sha256": atom["evidence_slice_utf8_sha256"], "expected_output_utf8_bytes": atom["expected_output_utf8_bytes"], "expected_output_utf8_sha256": atom["expected_output_utf8_sha256"], "goal_objective_utf8_bytes": atom["goal_objective_utf8_bytes"], "goal_objective_utf8_sha256": atom["goal_objective_utf8_sha256"], "operation_kind": atom["operation_kind"], "prompt_utf8_bytes": atom["prompt_utf8_bytes"], "prompt_utf8_sha256": atom["prompt_utf8_sha256"], "shard_id": shard["shard_id"], "source_cell_id": atom["source_cell_id"]})
    atom_ids = {atom["atom_id"] for atom in atoms}
    dependencies = [(atom["atom_id"], dep) for atom in atoms for dep in atom["dependency_atom_ids"]]
    unresolved = [(atom_id, dep) for atom_id, dep in dependencies if dep not in atom_ids]
    if len(atom_ids) != len(atoms):
        raise ValueError("duplicate atom id")
    if [cell["index"] for cell in cells] != list(range(SOURCE["cell_count"])) or len({cell["source_cell_id"] for cell in cells}) != len(cells):
        raise ValueError("cell coverage")
    if unresolved:
        raise ValueError("unresolved dependency")
    graph = {atom["atom_id"]: atom["dependency_atom_ids"] for atom in atoms}
    visiting: set[str] = set()
    visited: set[str] = set()

    def visit(node: str) -> None:
        if node in visiting:
            raise ValueError("dependency cycle")
        if node in visited:
            return
        visiting.add(node)
        for dependency in graph[node]:
            visit(dependency)
        visiting.remove(node)
        visited.add(node)

    for atom_id in graph:
        visit(atom_id)
    if any(atom["operation_kind"] not in OPERATIONS for atom in atoms):
        raise ValueError("operation allowlist")
    if any(atom["prompt_utf8_bytes"] > LIMITS["scored_subject_max_utf8_bytes"] or atom["evidence_slice_utf8_bytes"] > LIMITS["evidence_slice_max_utf8_bytes"] or atom["goal_objective_utf8_bytes"] > LIMITS["goal_objective_max_utf8_bytes"] or atom["expected_output_utf8_bytes"] > LIMITS["output_contract_max_utf8_bytes"] for atom in atoms):
        raise ValueError("atom byte limit")
    prompt_hashes = [atom["prompt_utf8_sha256"] for atom in atoms]
    s10_hashes = {atom["prompt_utf8_sha256"] for atom in atoms if atom["shard_id"] == "S10_DECISIONS_000_035"}
    s30_hashes = {atom["prompt_utf8_sha256"] for atom in atoms if atom["shard_id"] == "S30_DECISIONS_058_092"}
    operation_counts = dict(sorted(Counter(atom["operation_kind"] for atom in atoms).items()))
    return {
        "artifact_id": "PW-R9-GOAL-MODE-OMP-ATOMIC-AGGREGATE-MANIFEST-V1",
        "atom_index": atoms,
        "authority": AUTHORITY,
        "cell_index": cells,
        "coverage_summary": {"atom_count": len(atoms), "cell_count": len(cells), "cell_index_first": min(cell["index"] for cell in cells), "cell_index_last": max(cell["index"] for cell in cells), "finalized_by_atom_count": sum(1 for cell in cells if cell["finalization_ref"] in atom_ids), "finalized_by_reducer_count": sum(1 for cell in cells if cell["finalization_ref"] not in atom_ids), "source_cell_count": SOURCE["cell_count"]},
        "dependency_summary": {"cycle_detected": False, "dependency_edge_count": len(dependencies), "dependent_atom_count": sum(bool(atom["dependency_atom_ids"]) for atom in atoms), "resolved_edge_count": len(dependencies), "root_atom_count": sum(not atom["dependency_atom_ids"] for atom in atoms), "unresolved_edges": []},
        "execution_contract": {"fresh_goal_per_test_taker": True, "fresh_task_identity_required": True, "goal_activation_before_subject_prompt": True, "goal_objective_criteria_control_binding_required": True, "headless_allowed_only_on_existing_windows_omp_owner_lane": True, "no_goal_or_task_reuse": True, "omp_launch_boundary": "WINDOWS_HOST_OMP_CWD_P_DRIVE", "subject_turns_inside_active_goal_only": True, "terminal_goal_receipt_required": True},
        "limits": LIMITS,
        "mechanical_receipt_bindings": RECEIPTS,
        "observed_maxima": {"evidence_slice_utf8_bytes": max(atom["evidence_slice_utf8_bytes"] for atom in atoms), "expected_output_utf8_bytes": max(atom["expected_output_utf8_bytes"] for atom in atoms), "goal_objective_utf8_bytes": max(atom["goal_objective_utf8_bytes"] for atom in atoms), "prompt_utf8_bytes": max(atom["prompt_utf8_bytes"] for atom in atoms)},
        "operation_contract": {"allowed_operation_kinds": OPERATIONS, "operation_counts": operation_counts, "unused_allowed_operation_kinds": [operation for operation in OPERATIONS if operation not in operation_counts]},
        "prompt_posture": {"all_prompt_hash_count": len(prompt_hashes), "all_prompt_hash_unique_count": len(set(prompt_hashes)), "s10_decision_prompt_hash_count": len(s10_hashes), "s10_s30_prompt_hash_overlap_count": len(s10_hashes & s30_hashes), "s30_decision_prompt_hash_count": len(s30_hashes)},
        "review_decomposition": {"atom_semantic_review_count": len(atoms), "deterministic_reducer_review_count": sum(summary["reducer_count"] for summary in shard_summary), "max_atoms_per_review_work_unit": 1, "max_reducers_per_review_work_unit": 1, "rule": "One fresh Goal-Mode reviewer receives one atom or one reducer only; no reviewer receives the full suite."},
        "schema_id": "pw-r9-goal-mode-omp-atomic-aggregate-manifest-v1",
        "shard_bindings": SHARDS,
        "shard_summary": shard_summary,
        "source_binding": SOURCE,
        "status": "STRUCTURALLY_COMPLETE_97_CELLS_104_ATOMS_ZERO_CREDIT_NO_LAUNCH_PENDING_BOUNDED_SEMANTIC_REVIEWS",
        "unresolved": ["Mechanical aggregation does not certify any compact fact, prompt, expected output, dependency judgment, or reducer semantics.", "The existing Windows OMP lane must complete a no-subject Goal-Mode handshake before any review atom may run.", "No atom has executed in native Goal Mode.", "No bridge install, OMP handoff, canary, or matrix launch is authorized.", "Qualification remains 0/2."],
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    output = Path(args.output)
    if not output.is_absolute():
        raise ValueError("output must be absolute")
    value = construct(Path(__file__).resolve().parent)
    raw = canon(value)
    write_exclusive(output, raw)
    print(json.dumps({"atom_count": value["coverage_summary"]["atom_count"], "bytes": len(raw), "cell_count": value["coverage_summary"]["cell_count"], "dependency_edge_count": value["dependency_summary"]["dependency_edge_count"], "sha256": hashlib.sha256(raw).hexdigest(), "status": "CREATED", "subject_calls": 0}, sort_keys=True, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(json.dumps({"error": str(exc), "status": "FAIL", "subject_calls": 0}, sort_keys=True, separators=(",", ":")))
        raise SystemExit(1)
