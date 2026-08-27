#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

from build_s10_edge_atom_manifest_v1 import canon, ident, require, write_exclusive


V1 = {"bytes": 122167, "mode": "0644", "path": "s30_decision_atom_manifest_v1.json", "sha256": "9139a5ed0c444a5190280660774af595f6cda51935deddeea100a8c3f5294d1e"}
FAILURE = {"bytes": 2185, "mode": "0644", "path": "r9_goal_mode_omp_s30_v1_prompt_posture_failure_receipt.json", "sha256": "39f44aaeddeafa28a55996449c0e95e0c0162777f6b220f06a1ed80d6377c108"}
SOURCE = {"bytes": 786546, "mode": "0644", "path": "../formal_candidate_v7/semantic_bundle.json", "sha256": "11139c2b52a2fe900f2976a34f7712d8f05d5b2991ce8cc26d5cfc4e1ef871c2"}
OBJECTIVE = "Independently choose one listed option with the candidate withheld."


def context(cell: dict) -> dict:
    text = cell["render_utf8"]
    begin, end = "BEGIN_ANSWER_FIRST_DECISION_CONTEXT\n", "\nEND_ANSWER_FIRST_DECISION_CONTEXT"
    require(text.count(begin) == 1 and text.count(end) == 1, f"context markers:{cell['cell']}")
    return json.loads(text.split(begin, 1)[1].split(end, 1)[0])


def construct(base: Path) -> dict:
    v1_raw = (base / V1["path"]).read_bytes()
    require(len(v1_raw) == V1["bytes"] and hashlib.sha256(v1_raw).hexdigest() == V1["sha256"], "V1 identity")
    value = json.loads(v1_raw)
    source_raw = (base / SOURCE["path"]).resolve().read_bytes()
    require(len(source_raw) == SOURCE["bytes"] and hashlib.sha256(source_raw).hexdigest() == SOURCE["sha256"], "source identity")
    source = json.loads(source_raw)
    cells = source["cells"][58:93]
    require(len(cells) == len(value["atoms"]) == 35, "cell count")
    value["artifact_id"] = "PW-R9-GOAL-MODE-OMP-S30-DECISION-ATOM-MANIFEST-V2"
    value["schema_id"] = "pw-r9-goal-mode-omp-s30-decision-atom-manifest-v2"
    value["status"] = "S30_DECISION_SHARD_V2_PREDECLARED_ZERO_CREDIT_NO_LAUNCH_PENDING_INDEPENDENT_FACT_REVIEW"
    value["contract_bindings"] = [*value["contract_bindings"], FAILURE]
    value["lineage"] = {"disposition": "V1_PRESERVED_AS_FAILED_DIAGNOSTIC_ONLY", "failure_receipt": FAILURE, "replacement_scope": "ONLY_RESTORE_DISTINCT_ANSWER_FIRST_PROMPT_POSTURE"}
    objective_ident = ident(OBJECTIVE)
    for atom, source_cell in zip(value["atoms"], cells, strict=True):
        ctx = context(source_cell)
        options = json.dumps(ctx["options"], ensure_ascii=False, separators=(",", ":"))
        prompt = f"Q: {ctx['question']}\nOptions: {options}\nE: {atom['evidence_slice_utf8']}\nCandidate withheld. Return only {atom['expected_output_schema']}; then complete Goal."
        prompt_ident = ident(prompt)
        require(prompt_ident["bytes"] <= value["limits"]["scored_subject_max_utf8_bytes"], f"prompt limit:{source_cell['cell']}")
        atom["goal_objective_utf8"] = OBJECTIVE
        atom["goal_objective_utf8_bytes"] = objective_ident["bytes"]
        atom["goal_objective_utf8_sha256"] = objective_ident["sha256"]
        atom["prompt_utf8"] = prompt
        atom["prompt_utf8_bytes"] = prompt_ident["bytes"]
        atom["prompt_utf8_sha256"] = prompt_ident["sha256"]
    value["unresolved"] = ["Rejected S30 V1 remains immutable diagnostic evidence and grants no authority.", *value["unresolved"]]
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
    print(json.dumps({"atom_count": len(value["atoms"]), "bytes": len(raw), "max_evidence_slice_utf8_bytes": max(atom["evidence_slice_utf8_bytes"] for atom in value["atoms"]), "max_prompt_utf8_bytes": max(atom["prompt_utf8_bytes"] for atom in value["atoms"]), "sha256": hashlib.sha256(raw).hexdigest(), "status": "CREATED", "subject_calls": 0}, sort_keys=True, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(json.dumps({"error": str(exc), "status": "FAIL", "subject_calls": 0}, sort_keys=True, separators=(",", ":")))
        raise SystemExit(1)
