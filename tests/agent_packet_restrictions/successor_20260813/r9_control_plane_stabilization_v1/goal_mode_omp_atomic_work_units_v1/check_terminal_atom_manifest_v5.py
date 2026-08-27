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

import check_terminal_atom_manifest_v3 as v3


SCHEMA = "pw-r9-goal-mode-omp-terminal-atom-manifest-v5"
STATUS = "TERMINAL_SHARD_V5_PREDECLARED_ZERO_CREDIT_NO_LAUNCH_PENDING_INDEPENDENT_REVIEW"
IMPACT = {"bytes": 11734, "mode": "0644", "path": "../r9_goal_mode_omp_atomic_work_unit_impact_assessment_v1.json", "sha256": "97ad72ec500cc674d0b2adbec21de878420fa49b28350542d04fe29be20d0a7c"}
BRIDGE = {"bytes": 7845, "mode": "0644", "path": "../goal_mode_omp_headless_bridge_v1/bridge_contract_v3.json", "sha256": "6d94cfd2b1d2ffba621b6249fe2c4b8a831b3a774e388a8132f0588c7dc401d6"}
S30_V2 = {"bytes": 123246, "mode": "0644", "path": "s30_decision_atom_manifest_v2.json", "sha256": "a3675b4273b9e638f79a33fc81f8fc49da5ef0f3294e316bcf7cbcbe2e680c48"}
S30_V2_RECEIPT = {"bytes": 3977, "mode": "0644", "path": "r9_goal_mode_omp_s30_decision_atom_manifest_v2_mechanical_receipt_v1.json", "sha256": "c613b8d2b7fe8a1073caab081c48e9a1bbcc335896528863584503b04279f400"}
EDGE_V2 = {"bytes": 64831, "mode": "0644", "path": "s10_edge_atom_manifest_v2.json", "sha256": "9d3f9bdfc5d5c64cad102ddc74af04d3d963c8bd6e142dff359750c72d2fc15a"}
TENSION_V2 = {"bytes": 18246, "mode": "0644", "path": "s10_tension_atom_manifest_v2.json", "sha256": "5c3c9c89250574b310e6e8d5daaff0a7fbd592a6935725c8895f2eb0402d0048"}
EDGE_TENSION_V2_RECEIPT = {"bytes": 6127, "mode": "0644", "path": "r9_goal_mode_omp_edge_tension_v2_mechanical_receipt_v1.json", "sha256": "4711ac1686d8d87b7b3d650f80e10dc88964cd79545c1dd287ce86ba395c7e6a"}
EDGE_TENSION_V1_FAILURE = {"bytes": 2603, "mode": "0644", "path": "r9_goal_mode_omp_edge_tension_v1_contract_failure_receipt.json", "sha256": "96f81b87cfae1494746be0f0f6001b65864a756c9975e28da05de22539bb4fda"}
TERMINAL_FAILURES = [
    {"bytes": 2635, "mode": "0644", "path": "r9_goal_mode_omp_terminal_atom_manifest_v1_failure_receipt.json", "sha256": "2e16da3636a28ec42319d9f84e9467ac1fccf35bb4794787a3bc3edac4e235d0"},
    {"bytes": 3485, "mode": "0644", "path": "r9_goal_mode_omp_terminal_atom_manifest_v2_failure_receipt.json", "sha256": "ae9c605a56b315682efbcad7c270b0a2b93ca15c5e223cb296d4dbd8684847f2"},
    {"bytes": 2245, "mode": "0644", "path": "r9_goal_mode_omp_terminal_v3_dependency_failure_receipt.json", "sha256": "9bb4a38bda1d4a1cec39c5763677a779c37b087840a72e39a233b63cd52baaa0"},
    {"bytes": 2341, "mode": "0644", "path": "r9_goal_mode_omp_terminal_v4_dependency_failure_receipt.json", "sha256": "2d16b3a91dc5a199aaae03b20b200155b14332473145710b749d3e9208b938d5"},
]
CONTRACTS = [IMPACT, BRIDGE, S30_V2, S30_V2_RECEIPT, EDGE_V2, TENSION_V2, EDGE_TENSION_V2_RECEIPT, EDGE_TENSION_V1_FAILURE, *TERMINAL_FAILURES]
LINEAGE = {
    "disposition": "TERMINAL_V1_V2_V3_V4_AND_EDGE_TENSION_V1_PRESERVED_AS_FAILED_DIAGNOSTIC_ONLY",
    "edge_tension_v1_failure_receipt": EDGE_TENSION_V1_FAILURE,
    "rejected_terminal_failure_receipts": TERMINAL_FAILURES,
    "replacement_scope": "ONLY_REBIND_INHERITED_CONTRACTS_TO_ADMISSIBLE_S30_V2_EDGE_V2_AND_TENSION_V2_SHARDS",
}
UNRESOLVED = [
    "All rejected predecessor manifests remain immutable diagnostic evidence and grant no authority.",
    "All 97 legacy cells now have structural atom coverage, but compact facts, dependency use, and deterministic reducers remain pending independent bounded review.",
    "No atom has executed in native Goal Mode.",
    "No bridge install, OMP handoff, canary, or matrix launch is authorized.",
    "Qualification remains 0/2.",
]


def check_obj(manifest: dict[str, Any], path: Path) -> dict[str, int]:
    v3.exact_keys(manifest, v3.ROOT_KEYS, "root")
    v3.require(manifest["artifact_id"] == "PW-R9-GOAL-MODE-OMP-TERMINAL-ATOM-MANIFEST-V5", "artifact id")
    v3.require(manifest["schema_id"] == SCHEMA and manifest["status"] == STATUS, "schema/status")
    v3.require(manifest["authority"] == v3.AUTHORITY and manifest["limits"] == v3.LIMITS, "authority/limits")
    v3.require(manifest["source_binding"] == v3.SOURCE, "source binding")
    v3.require(manifest["contract_bindings"] == CONTRACTS, "active contracts")
    v3.require(manifest["lineage"] == LINEAGE and manifest["unresolved"] == UNRESOLVED, "lineage/unresolved")
    active_manifest_paths = {binding["path"] for binding in manifest["contract_bindings"] if "manifest" in binding["path"] and "receipt" not in binding["path"]}
    v3.require(active_manifest_paths == {"s30_decision_atom_manifest_v2.json", "s10_edge_atom_manifest_v2.json", "s10_tension_atom_manifest_v2.json"}, "active manifest set")
    base = path.parent
    v3.file_binding(base, {key: v3.SOURCE[key] for key in ("bytes", "mode", "path", "sha256")}, "source")
    for index, binding in enumerate(CONTRACTS):
        v3.file_binding(base, binding, f"contract:{index}")
    s30_raw, s30 = v3.load_json(base / S30_V2["path"])
    v3.require(len(s30_raw) == S30_V2["bytes"] and hashlib.sha256(s30_raw).hexdigest() == S30_V2["sha256"], "S30 V2 identity")
    s30_atoms = {atom["atom_id"]: atom for atom in s30["atoms"]}
    v3.require(len(s30_atoms) == 35, "S30 V2 atom count")
    for index, atom in enumerate(manifest["atoms"][:8]):
        dependencies = atom["dependency_atom_ids"]
        v3.require(len(dependencies) == 2 and all(dep in s30_atoms for dep in dependencies), f"active S30 dependencies:{index}")
        outputs = [v3.parse_json(s30_atoms[dep]["expected_output_utf8"].encode(), f"active dependency:{dep}") for dep in dependencies]
        expected_evidence = json.dumps(outputs, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        v3.require(atom["evidence_slice_utf8"] == expected_evidence, f"active S30 evidence:{index}")
    projected = copy.deepcopy(manifest)
    projected["artifact_id"] = "PW-R9-GOAL-MODE-OMP-TERMINAL-ATOM-MANIFEST-V3"
    projected["schema_id"] = v3.SCHEMA
    projected["status"] = v3.STATUS
    projected["contract_bindings"] = v3.CONTRACTS
    projected["lineage"] = {"disposition": "V1_AND_V2_PRESERVED_AS_FAILED_DIAGNOSTIC_ONLY", "rejected_failure_receipts": [v3.V1_FAILURE, v3.V2_FAILURE], "replacement_scope": "ONLY_CLOSE_EXACT_REDUCER_SERIALIZATION_IDENTITY"}
    return v3.check_obj(projected, path)


def check_path(path: Path) -> tuple[dict[str, Any], dict[str, int]]:
    raw, value = v3.load_json(path)
    v3.require(raw == v3.canon(value), "canonical manifest")
    v3.require(stat.S_IMODE(path.stat().st_mode) == 0o644, "manifest mode")
    return value, check_obj(value, path)


def mutations() -> list[tuple[str, Callable[[dict[str, Any]], None]]]:
    return [
        ("artifact", lambda value: value.__setitem__("artifact_id", "wrong")),
        ("active-contract", lambda value: value["contract_bindings"].__setitem__(4, {"bytes": 64357, "mode": "0644", "path": "s10_edge_atom_manifest_v1.json", "sha256": "d2fe5744327976e80cfd61a1dc3ace1bca5409783e8361b17b9a601c8bd52907"})),
        ("lineage", lambda value: value["lineage"].__setitem__("disposition", "PASS")),
        ("active-dependency", lambda value: value["atoms"][0]["dependency_atom_ids"].__setitem__(0, "s30:S30_UNKNOWN:atom-000")),
        *v3.mutations(),
    ]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true")
    mode.add_argument("--mutation-self-test", action="store_true")
    args = parser.parse_args()
    path = Path(args.manifest)
    v3.require(path.is_absolute(), "manifest must be absolute")
    manifest, stats = check_path(path)
    count = 0
    if args.mutation_self_test:
        for name, mutate in mutations():
            candidate = copy.deepcopy(manifest)
            mutate(candidate)
            try:
                check_obj(candidate, path)
            except v3.Invalid:
                count += 1
            else:
                raise v3.Invalid(f"mutation accepted:{name}")
    sys.stdout.buffer.write(v3.canon({"atom_count": stats["atom_count"], "cell_count": stats["cell_count"], "first_mismatch": None, "max_evidence_slice_utf8_bytes": stats["max_evidence"], "max_prompt_utf8_bytes": stats["max_prompt"], "mode": "mutation-self-test" if args.mutation_self_test else "check", "mutation_count": count, "reducer_count": stats["reducer_count"], "schema_id": "pw-r9-goal-mode-omp-terminal-atom-manifest-check-v5", "semantic_review_status": "PENDING", "status": "PASS", "subject_calls": 0, "workspace_writes": 0}))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except v3.Invalid as exc:
        sys.stdout.buffer.write(v3.canon({"first_mismatch": str(exc), "schema_id": "pw-r9-goal-mode-omp-terminal-atom-manifest-check-v5", "semantic_review_status": "PENDING", "status": "FAIL", "subject_calls": 0, "workspace_writes": 0}))
        raise SystemExit(1)
