#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

from build_s10_edge_atom_manifest_v1 import canon, require, write_exclusive
from build_terminal_atom_manifest_v2 import V1_FAILURE
from build_terminal_atom_manifest_v3 import V2_FAILURE, construct as construct_v3


S30_V2 = {"bytes": 123246, "mode": "0644", "path": "s30_decision_atom_manifest_v2.json", "sha256": "a3675b4273b9e638f79a33fc81f8fc49da5ef0f3294e316bcf7cbcbe2e680c48"}
S30_V2_RECEIPT = {"bytes": 3977, "mode": "0644", "path": "r9_goal_mode_omp_s30_decision_atom_manifest_v2_mechanical_receipt_v1.json", "sha256": "c613b8d2b7fe8a1073caab081c48e9a1bbcc335896528863584503b04279f400"}
V3_DEPENDENCY_FAILURE = {"bytes": 2245, "mode": "0644", "path": "r9_goal_mode_omp_terminal_v3_dependency_failure_receipt.json", "sha256": "9bb4a38bda1d4a1cec39c5763677a779c37b087840a72e39a233b63cd52baaa0"}


def construct(base: Path) -> dict:
    value = construct_v3(base)
    value["artifact_id"] = "PW-R9-GOAL-MODE-OMP-TERMINAL-ATOM-MANIFEST-V4"
    value["schema_id"] = "pw-r9-goal-mode-omp-terminal-atom-manifest-v4"
    value["status"] = "TERMINAL_SHARD_V4_PREDECLARED_ZERO_CREDIT_NO_LAUNCH_PENDING_INDEPENDENT_REVIEW"
    replacements = {
        "s30_decision_atom_manifest_v1.json": S30_V2,
        "r9_goal_mode_omp_s30_decision_atom_manifest_mechanical_receipt_v1.json": S30_V2_RECEIPT,
    }
    replaced: list[dict] = []
    for binding in value["contract_bindings"]:
        replaced.append(replacements.get(binding["path"], binding))
    require(sum(binding == S30_V2 for binding in replaced) == 1 and sum(binding == S30_V2_RECEIPT for binding in replaced) == 1, "S30 replacement count")
    value["contract_bindings"] = [*replaced, V3_DEPENDENCY_FAILURE]
    value["lineage"] = {
        "dependency_failure_receipt": V3_DEPENDENCY_FAILURE,
        "disposition": "TERMINAL_V1_V2_AND_V3_PRESERVED_AS_FAILED_DIAGNOSTIC_ONLY",
        "rejected_terminal_failure_receipts": [V1_FAILURE, V2_FAILURE, V3_DEPENDENCY_FAILURE],
        "replacement_scope": "ONLY_REBIND_S50_DEPENDENCIES_TO_ADMISSIBLE_S30_V2",
    }
    value["unresolved"] = [
        "Rejected terminal V1, V2, and V3 remain immutable diagnostic evidence and grant no authority.",
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
    require(output.is_absolute(), "output must be absolute")
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
