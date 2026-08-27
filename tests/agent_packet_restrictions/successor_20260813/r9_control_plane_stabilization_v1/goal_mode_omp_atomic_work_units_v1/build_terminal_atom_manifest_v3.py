#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

from build_s10_edge_atom_manifest_v1 import canon, require, write_exclusive
from build_terminal_atom_manifest_v2 import V1_FAILURE, construct as construct_v2


V2_FAILURE = {"bytes": 3485, "mode": "0644", "path": "r9_goal_mode_omp_terminal_atom_manifest_v2_failure_receipt.json", "sha256": "ae9c605a56b315682efbcad7c270b0a2b93ca15c5e223cb296d4dbd8684847f2"}
S50_ROOT_ORDER = ["protocol_id", "stage", "topic_artifact_hashes", "checked_edge_ids", "edge_verdicts", "claim_boundary", "external_audit_status", "forbidden_action_violations"]
S50_TOPIC_ORDER = ["topic_a", "topic_b"]
S50_EDGE_ORDER = ["edge_id", "verdict", "source_decision_ids"]
S60_ROOT_ORDER = ["protocol_id", "stage", "role", "candidate_edge_id", "candidate_lineage_sha256", "integration_candidate_sha256", "verdict", "classification", "source_record_ids", "claim_boundary", "external_audit_status", "forbidden_action_violations"]


def construct(base: Path) -> dict:
    value = construct_v2(base)
    value["artifact_id"] = "PW-R9-GOAL-MODE-OMP-TERMINAL-ATOM-MANIFEST-V3"
    value["schema_id"] = "pw-r9-goal-mode-omp-terminal-atom-manifest-v3"
    value["status"] = "TERMINAL_SHARD_V3_PREDECLARED_ZERO_CREDIT_NO_LAUNCH_PENDING_INDEPENDENT_REVIEW"
    value["contract_bindings"] = [*value["contract_bindings"], V2_FAILURE]
    value["lineage"] = {
        "disposition": "V1_AND_V2_PRESERVED_AS_FAILED_DIAGNOSTIC_ONLY",
        "rejected_failure_receipts": [V1_FAILURE, V2_FAILURE],
        "replacement_scope": "ONLY_CLOSE_EXACT_REDUCER_SERIALIZATION_IDENTITY",
    }
    s50 = value["deterministic_reducers"][0]
    require(s50["reducer_id"] == "S50_SEMANTIC_REDUCER_V1", "S50 reducer identity")
    s50["rule"] = "Build checked_edge_ids and edge_verdicts from edge_rows and verified atom outputs; combine with static_fields; serialize UTF-8 minified finite JSON using exactly serialization.root_field_order and the declared nested field orders; append no LF to the cell output string."
    s50["serialization"] = {"edge_verdict_field_order": S50_EDGE_ORDER, "encoding": "UTF-8_MINIFIED_FINITE_JSON_NO_LF", "root_field_order": S50_ROOT_ORDER, "topic_artifact_hashes_field_order": S50_TOPIC_ORDER}
    for reducer in value["deterministic_reducers"][1:]:
        reducer["rule"] = "Combine the verified one-field classification atom output with static_fields; serialize UTF-8 minified finite JSON using exactly serialization.root_field_order; append no LF to the cell output string."
        reducer["serialization"] = {"encoding": "UTF-8_MINIFIED_FINITE_JSON_NO_LF", "root_field_order": S60_ROOT_ORDER}
    value["unresolved"] = [
        "Rejected terminal V1 and V2 remain immutable diagnostic evidence and grant no authority.",
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
