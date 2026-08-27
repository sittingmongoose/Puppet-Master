#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

from build_s10_edge_atom_manifest_v1 import canon, construct as construct_edge_v1, require, write_exclusive
from build_s10_tension_atom_manifest_v1 import construct as construct_tension_v1


FAILURE = {"bytes": 2603, "mode": "0644", "path": "r9_goal_mode_omp_edge_tension_v1_contract_failure_receipt.json", "sha256": "96f81b87cfae1494746be0f0f6001b65864a756c9975e28da05de22539bb4fda"}


def construct(base: Path, kind: str) -> dict:
    if kind == "edge":
        value = construct_edge_v1(base)
        value["artifact_id"] = "PW-R9-GOAL-MODE-OMP-S10-EDGE-ATOM-MANIFEST-V2"
        value["schema_id"] = "pw-r9-goal-mode-omp-s10-edge-atom-manifest-v2"
        value["status"] = "S10_EDGE_SHARD_V2_PREDECLARED_ZERO_CREDIT_NO_LAUNCH_PENDING_INDEPENDENT_FACT_REVIEW"
        operation = "VERIFY_ONE_CLAIM"
    elif kind == "tension":
        value = construct_tension_v1(base)
        value["artifact_id"] = "PW-R9-GOAL-MODE-OMP-S10-TENSION-ATOM-MANIFEST-V2"
        value["schema_id"] = "pw-r9-goal-mode-omp-s10-tension-atom-manifest-v2"
        value["status"] = "S10_TENSION_SHARD_V2_PREDECLARED_ZERO_CREDIT_NO_LAUNCH_PENDING_INDEPENDENT_FACT_REVIEW"
        operation = "CLASSIFY_ONE_ITEM_ON_ONE_AXIS"
    else:
        raise ValueError("kind")
    value["contract_bindings"] = [*value["contract_bindings"], FAILURE]
    value["lineage"] = {"disposition": "V1_PRESERVED_AS_FAILED_DIAGNOSTIC_ONLY", "failure_receipt": FAILURE, "replacement_scope": "ONLY_REPLACE_NONALLOWLIST_OPERATION_KIND"}
    for atom in value["atoms"]:
        atom["operation_kind"] = operation
    value["unresolved"] = [
        "Rejected V1 remains immutable diagnostic evidence and grants no authority.",
        *value["unresolved"],
    ]
    return value


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--kind", choices=("edge", "tension"), required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    output = Path(args.output)
    require(output.is_absolute(), "output must be absolute")
    value = construct(Path(__file__).resolve().parent, args.kind)
    raw = canon(value)
    write_exclusive(output, raw)
    print(json.dumps({"atom_count": len(value["atoms"]), "bytes": len(raw), "kind": args.kind, "max_evidence_slice_utf8_bytes": max(atom["evidence_slice_utf8_bytes"] for atom in value["atoms"]), "max_prompt_utf8_bytes": max(atom["prompt_utf8_bytes"] for atom in value["atoms"]), "sha256": hashlib.sha256(raw).hexdigest(), "status": "CREATED", "subject_calls": 0}, sort_keys=True, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(json.dumps({"error": str(exc), "status": "FAIL", "subject_calls": 0}, sort_keys=True, separators=(",", ":")))
        raise SystemExit(1)
