#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any

from build_s10_edge_atom_manifest_v1 import LIMITS, SOURCE, canon, ident, require, write_exclusive


CONTRACTS = [
    {"bytes": 11734, "mode": "0644", "path": "../r9_goal_mode_omp_atomic_work_unit_impact_assessment_v1.json", "sha256": "97ad72ec500cc674d0b2adbec21de878420fa49b28350542d04fe29be20d0a7c"},
    {"bytes": 7845, "mode": "0644", "path": "../goal_mode_omp_headless_bridge_v1/bridge_contract_v3.json", "sha256": "6d94cfd2b1d2ffba621b6249fe2c4b8a831b3a774e388a8132f0588c7dc401d6"},
    {"bytes": 64357, "mode": "0644", "path": "s10_edge_atom_manifest_v1.json", "sha256": "d2fe5744327976e80cfd61a1dc3ace1bca5409783e8361b17b9a601c8bd52907"},
    {"bytes": 4325, "mode": "0644", "path": "r9_goal_mode_omp_s10_edge_atom_manifest_mechanical_receipt_v1.json", "sha256": "bf8c259785e8543f3e2c69a5ce8cd28124da1a649bf71e0a3b2be018a865f894"},
]
FACTS = {
    "S10A_TENSION_A-T01": "Ledger dispatch is lineage only; canonical Prompt Pipeline owns deterministic gates and runtime admission.",
    "S10A_TENSION_A-T02": "Direct Chat persona routing and automated provider admission have distinct owners and authority and must remain separate.",
    "S10B_TENSION_B-T02": "Top-level 77/61 counts are authoritative; embedded 76/60 text is a stale projection, not a current boundary.",
    "S10B_TENSION_B-T01": "Planning readiness does not prove runtime buildability; separate compile, execution, and evidence gates remain required.",
}
CITED_IDS = {
    "S10A_TENSION_A-T01": ["A-S01", "A-S02"],
    "S10A_TENSION_A-T02": ["A-S02", "A-S05", "A-S11"],
    "S10B_TENSION_B-T02": ["B-S15", "B-S20"],
    "S10B_TENSION_B-T01": ["B-S04", "B-S09", "B-S14"],
}
OBJECTIVE = "Decide whether one boundary must be preserved using one compact fact."
CRITERION = "The Boolean preserve_boundary value must be exactly supported by the supplied fact."
OUTPUT_SCHEMA = '{"preserve_boundary":"boolean"}'


def refs(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [{"authority": record["authority"], "path": record["path"], "source_record_id": record["source_record_id"], "source_sha256": record["source_sha256"], "span": f"{record['start_line']}-{record['end_line']}"} for record in records]


def coverage(atom_id: str) -> list[dict[str, Any]]:
    return [
        {"atom_ids": [], "classification": "SHARED_NON_SUBJECT_CONTROL", "element_id": "CONTROL", "note": "Isolation, Goal lifecycle, hidden-candidate, no-tool, formatting, authority, and no-reuse rules belong to the bridge and verifier."},
        {"atom_ids": [atom_id], "classification": "SUBJECT_MATERIAL", "element_id": "BOUNDARY_CANDIDATE"},
        {"atom_ids": [atom_id], "classification": "SUBJECT_MATERIAL", "element_id": "EVIDENCE"},
        {"atom_ids": [atom_id], "classification": "SUBJECT_MATERIAL", "element_id": "OUTPUT_CONTRACT"},
    ]


def extract_context(cell: dict[str, Any]) -> tuple[str, dict[str, Any]]:
    text = cell["render_utf8"]
    begin = "BEGIN_SINGLE_TENSION_CONTEXT\n"
    end = "\nEND_SINGLE_TENSION_CONTEXT"
    require(text.count(begin) == 1 and text.count(end) == 1, f"context markers:{cell['cell']}")
    raw = text.split(begin, 1)[1].split(end, 1)[0]
    value = json.loads(raw)
    require(isinstance(value, dict), f"context object:{cell['cell']}")
    return raw, value


def construct(base: Path) -> dict[str, Any]:
    source_path = (base / SOURCE["path"]).resolve()
    raw = source_path.read_bytes()
    require(len(raw) == SOURCE["bytes"] and hashlib.sha256(raw).hexdigest() == SOURCE["sha256"], "source identity")
    source = json.loads(raw)
    require(raw == canon(source) and len(source["cells"]) == SOURCE["cell_count"], "source canonical/count")
    source_cells = source["cells"][54:58]
    require([cell["cell"] for cell in source_cells] == list(FACTS), "fact order")
    atoms: list[dict[str, Any]] = []
    cells: list[dict[str, Any]] = []
    for atom_index, source_cell in enumerate(source_cells):
        cell_id = source_cell["cell"]
        atom_id = f"tension:{cell_id}:atom-000"
        context_raw, context = extract_context(source_cell)
        records_by_id = {record["source_record_id"]: record for record in context["source_bindings"]}
        records = [records_by_id[source_record_id] for source_record_id in CITED_IDS[cell_id]]
        authorities = {record["authority"] for record in records}
        evidence = json.dumps({"authority": next(iter(authorities)) if len(authorities) == 1 else "mixed", "fact": FACTS[cell_id], "source_record_ids": [record["source_record_id"] for record in records]}, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        prompt = f"E: {evidence}\nBoundary: {context['candidate']}\nReturn only {OUTPUT_SCHEMA} with a real Boolean. Then mark the active Goal complete."
        expected = source_cell["expected_output_utf8"]
        objective_ident = ident(OBJECTIVE)
        evidence_ident = ident(evidence)
        prompt_ident = ident(prompt)
        expected_ident = ident(expected)
        require(evidence_ident["bytes"] <= LIMITS["evidence_slice_max_utf8_bytes"], f"evidence limit:{cell_id}")
        require(prompt_ident["bytes"] <= LIMITS["scored_subject_max_utf8_bytes"], f"prompt limit:{cell_id}")
        atoms.append({
            "acceptance_criterion": CRITERION,
            "atom_count": 1,
            "atom_id": atom_id,
            "atom_index": atom_index,
            "cell_output_role": "FINAL",
            "cell_reconstruction_ref": f"FINAL_ATOM_OUTPUT:{atom_id}",
            "dependency_atom_ids": [],
            "evidence_slice_utf8": evidence,
            "evidence_slice_utf8_bytes": evidence_ident["bytes"],
            "evidence_slice_utf8_sha256": evidence_ident["sha256"],
            "expected_output_schema": OUTPUT_SCHEMA,
            "expected_output_utf8": expected,
            "expected_output_utf8_bytes": expected_ident["bytes"],
            "expected_output_utf8_sha256": expected_ident["sha256"],
            "goal_objective_utf8": OBJECTIVE,
            "goal_objective_utf8_bytes": objective_ident["bytes"],
            "goal_objective_utf8_sha256": objective_ident["sha256"],
            "input_kind": "SOURCE_SLICE",
            "non_goals": ["explain the decision", "inspect another boundary", "reconstruct the hidden candidate"],
            "objective": f"Judge only boundary {cell_id.rsplit('_', 1)[-1]} from one compact fact.",
            "operation_kind": "DECIDE_ONE_BOUNDARY_PRESERVATION",
            "prompt_utf8": prompt,
            "prompt_utf8_bytes": prompt_ident["bytes"],
            "prompt_utf8_sha256": prompt_ident["sha256"],
            "source_cell_id": cell_id,
            "source_record_refs": refs(records),
        })
        context_ident = ident(context_raw)
        cells.append({
            "atom_ids": [atom_id],
            "coverage": coverage(atom_id),
            "expected_output_utf8": expected,
            "expected_output_utf8_bytes": source_cell["expected_output_bytes"],
            "expected_output_utf8_sha256": source_cell["expected_output_sha256"],
            "final_atom_id": atom_id,
            "index": source_cell["index"],
            "render_utf8_bytes": source_cell["render_utf8_bytes"],
            "render_utf8_sha256": source_cell["render_utf8_sha256"],
            "source_cell_id": cell_id,
            "source_context_utf8_bytes": context_ident["bytes"],
            "source_context_utf8_sha256": context_ident["sha256"],
        })
    return {
        "artifact_id": "PW-R9-GOAL-MODE-OMP-S10-TENSION-ATOM-MANIFEST-V1",
        "atoms": atoms,
        "authority": {"bridge_install": False, "canary_launch": False, "full_manifest_complete": False, "matrix_launch": False, "omp_process_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0, "review_atom_launch": False, "subject_launch": False},
        "cells": cells,
        "contract_bindings": CONTRACTS,
        "limits": LIMITS,
        "reconstruction": {"cell_count": 4, "final_atom_count": 4, "rule": "Each tension cell result is the exact verified output of its own sole final atom; no predecessor-result reuse, synthesis, or hidden-candidate access is permitted."},
        "schema_id": "pw-r9-goal-mode-omp-s10-tension-atom-manifest-v1",
        "semantic_review": {"mechanical_checker_can_certify": False, "required_before_runtime": True, "review_unit_count": 4, "rule": "Each compact fact is reviewed against only its cited frozen source records in a separate fresh native Goal; no reviewer receives the full shard.", "status": "PENDING"},
        "shard": {"cell_index_first": 54, "cell_index_last": 57, "cell_type": "S10_SINGLE_TENSION", "full_legacy_cell_count": 97, "shard_id": "S10_TENSIONS_054_057", "shard_status": "COMPLETE_PENDING_INDEPENDENT_FACT_REVIEW", "source_cell_count": 4},
        "source_binding": SOURCE,
        "status": "S10_TENSION_SHARD_PREDECLARED_ZERO_CREDIT_NO_LAUNCH_PENDING_INDEPENDENT_FACT_REVIEW",
        "unresolved": ["The 4 integration and specialist source cells are not yet atomized.", "The 4 compact evidence facts require independent per-fact semantic review.", "No atom has executed in native Goal Mode.", "No bridge install, OMP handoff, canary, or matrix launch is authorized.", "Qualification remains 0/2."],
    }


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
    except (Exception,) as exc:
        print(json.dumps({"error": str(exc), "status": "FAIL", "subject_calls": 0}, sort_keys=True, separators=(",", ":")))
        raise SystemExit(1)
