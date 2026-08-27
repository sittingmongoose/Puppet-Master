#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

from build_s10_edge_atom_manifest_v1 import canon, require, write_exclusive
from build_terminal_atom_manifest_v1 import construct as construct_v1


V1_FAILURE = {"bytes": 2635, "mode": "0644", "path": "r9_goal_mode_omp_terminal_atom_manifest_v1_failure_receipt.json", "sha256": "2e16da3636a28ec42319d9f84e9467ac1fccf35bb4794787a3bc3edac4e235d0"}


def construct(base: Path) -> dict:
    value = construct_v1(base)
    value["artifact_id"] = "PW-R9-GOAL-MODE-OMP-TERMINAL-ATOM-MANIFEST-V2"
    value["schema_id"] = "pw-r9-goal-mode-omp-terminal-atom-manifest-v2"
    value["status"] = "TERMINAL_SHARD_V2_PREDECLARED_ZERO_CREDIT_NO_LAUNCH_PENDING_INDEPENDENT_REVIEW"
    value["contract_bindings"] = [*value["contract_bindings"], V1_FAILURE]
    value["lineage"] = {
        "disposition": "V1_PRESERVED_AS_FAILED_DIAGNOSTIC_ONLY",
        "failure_receipt": V1_FAILURE,
        "replacement_scope": "ONLY_CLOSE_REDUCER_TOTALITY_AND_COMPONENT_CARDINALITY_LABELS",
    }
    reconstruction = value["reconstruction"]
    reconstruction["component_atom_output_count"] = reconstruction.pop("final_atom_count")
    reconstruction["rule"] = "Eleven independently verified single-operation component outputs are assembled only by the four closed deterministic reducers; no model receives or emits a full legacy terminal artifact."
    s50 = value["deterministic_reducers"][0]
    require(s50["reducer_id"] == "S50_SEMANTIC_REDUCER_V1", "S50 reducer identity")
    s50["rule"] = "Build checked_edge_ids from edge_rows.edge_id in order; build edge_verdicts in the same order from each verified one-field atom verdict plus fixed edge_id and source_decision_ids; combine both with static_fields; recursively sort object keys and emit one LF."
    value["unresolved"] = [
        "Rejected terminal V1 remains immutable diagnostic evidence and grants no authority.",
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
