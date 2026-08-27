#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

from build_s10_edge_atom_manifest_v1 import canon, write_exclusive
from build_terminal_atom_manifest_v4 import construct as construct_v4


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


def construct(base: Path) -> dict:
    value = construct_v4(base)
    value["artifact_id"] = "PW-R9-GOAL-MODE-OMP-TERMINAL-ATOM-MANIFEST-V5"
    value["schema_id"] = "pw-r9-goal-mode-omp-terminal-atom-manifest-v5"
    value["status"] = "TERMINAL_SHARD_V5_PREDECLARED_ZERO_CREDIT_NO_LAUNCH_PENDING_INDEPENDENT_REVIEW"
    value["contract_bindings"] = CONTRACTS
    value["lineage"] = {
        "disposition": "TERMINAL_V1_V2_V3_V4_AND_EDGE_TENSION_V1_PRESERVED_AS_FAILED_DIAGNOSTIC_ONLY",
        "edge_tension_v1_failure_receipt": EDGE_TENSION_V1_FAILURE,
        "rejected_terminal_failure_receipts": TERMINAL_FAILURES,
        "replacement_scope": "ONLY_REBIND_INHERITED_CONTRACTS_TO_ADMISSIBLE_S30_V2_EDGE_V2_AND_TENSION_V2_SHARDS",
    }
    value["unresolved"] = [
        "All rejected predecessor manifests remain immutable diagnostic evidence and grant no authority.",
        "All 97 legacy cells now have structural atom coverage, but compact facts, dependency use, and deterministic reducers remain pending independent bounded review.",
        "No atom has executed in native Goal Mode.",
        "No bridge install, OMP handoff, canary, or matrix launch is authorized.",
        "Qualification remains 0/2.",
    ]
    return value


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
    print(json.dumps({"atom_count": len(value["atoms"]), "bytes": len(raw), "cell_count": len(value["cells"]), "max_evidence_slice_utf8_bytes": max(atom["evidence_slice_utf8_bytes"] for atom in value["atoms"]), "max_prompt_utf8_bytes": max(atom["prompt_utf8_bytes"] for atom in value["atoms"]), "sha256": hashlib.sha256(raw).hexdigest(), "status": "CREATED", "subject_calls": 0}, sort_keys=True, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(json.dumps({"error": str(exc), "status": "FAIL", "subject_calls": 0}, sort_keys=True, separators=(",", ":")))
        raise SystemExit(1)
