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
    {"bytes": 122167, "mode": "0644", "path": "s30_decision_atom_manifest_v1.json", "sha256": "9139a5ed0c444a5190280660774af595f6cda51935deddeea100a8c3f5294d1e"},
    {"bytes": 3710, "mode": "0644", "path": "r9_goal_mode_omp_s30_decision_atom_manifest_mechanical_receipt_v1.json", "sha256": "6f47885bfa240ff7596ce79f668127985d47d37d67ccfd0da6aeadb0272d0b46"},
    {"bytes": 64357, "mode": "0644", "path": "s10_edge_atom_manifest_v1.json", "sha256": "d2fe5744327976e80cfd61a1dc3ace1bca5409783e8361b17b9a601c8bd52907"},
    {"bytes": 4325, "mode": "0644", "path": "r9_goal_mode_omp_s10_edge_atom_manifest_mechanical_receipt_v1.json", "sha256": "bf8c259785e8543f3e2c69a5ce8cd28124da1a649bf71e0a3b2be018a865f894"},
    {"bytes": 17676, "mode": "0644", "path": "s10_tension_atom_manifest_v1.json", "sha256": "0bce5c662488e2f83c9a81266106300f682f51f18061346b680204ea4e1c7851"},
    {"bytes": 5218, "mode": "0644", "path": "r9_goal_mode_omp_s10_tension_atom_manifest_mechanical_receipt_v1.json", "sha256": "25ef931468f74592ae62d3d4ff79608f38bd2c72c6a24250d60154768476b6a4"},
]
S60_OPTIONS = {
    "provenance": ["provenance_complete", "provenance_gap"],
    "constraint_authority": ["authority_conflation", "authority_separated"],
    "counterfactual_dependency": ["counterfactual_failure", "counterfactual_supported"],
}
S50_OBJECTIVE = "Judge one integration edge from two verified decision outputs."
S50_CRITERION = "The verdict must exactly state whether the two verified decisions support the one edge."
S50_SCHEMA = '{"verdict":"supported or unsupported"}'
S60_OBJECTIVE = "Classify one candidate edge on one named specialist axis."
S60_CRITERION = "The classification must be exactly the listed option supported by the admission facts."
S60_SCHEMA = '{"classification":"one listed option"}'


def extract(cell: dict[str, Any], begin_label: str, end_label: str) -> tuple[str, dict[str, Any]]:
    text = cell["render_utf8"]
    begin = f"{begin_label}\n"
    end = f"\n{end_label}"
    require(text.count(begin) == 1 and text.count(end) == 1, f"context markers:{cell['cell']}")
    raw = text.split(begin, 1)[1].split(end, 1)[0]
    value = json.loads(raw)
    require(isinstance(value, dict), f"context object:{cell['cell']}")
    return raw, value


def refs(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [{"authority": record["authority"], "path": record["path"], "source_record_id": record["source_record_id"], "source_sha256": record["source_sha256"], "span": f"{record['start_line']}-{record['end_line']}"} for record in records]


def atom_base(atom_id: str, atom_index: int, atom_count: int, cell_id: str, evidence: str, expected: str, objective: str, criterion: str, schema: str, operation: str, input_kind: str, dependencies: list[str], prompt: str, source_refs: list[dict[str, Any]], reconstruction_ref: str, objective_text: str, non_goals: list[str]) -> dict[str, Any]:
    objective_ident = ident(objective)
    evidence_ident = ident(evidence)
    prompt_ident = ident(prompt)
    expected_ident = ident(expected)
    require(evidence_ident["bytes"] <= LIMITS["evidence_slice_max_utf8_bytes"], f"evidence limit:{atom_id}")
    require(prompt_ident["bytes"] <= LIMITS["scored_subject_max_utf8_bytes"], f"prompt limit:{atom_id}")
    require(expected_ident["bytes"] <= LIMITS["output_contract_max_utf8_bytes"], f"output limit:{atom_id}")
    return {
        "acceptance_criterion": criterion,
        "atom_count": atom_count,
        "atom_id": atom_id,
        "atom_index": atom_index,
        "cell_output_role": "COMPONENT",
        "cell_reconstruction_ref": reconstruction_ref,
        "dependency_atom_ids": dependencies,
        "evidence_slice_utf8": evidence,
        "evidence_slice_utf8_bytes": evidence_ident["bytes"],
        "evidence_slice_utf8_sha256": evidence_ident["sha256"],
        "expected_output_schema": schema,
        "expected_output_utf8": expected,
        "expected_output_utf8_bytes": expected_ident["bytes"],
        "expected_output_utf8_sha256": expected_ident["sha256"],
        "goal_objective_utf8": objective,
        "goal_objective_utf8_bytes": objective_ident["bytes"],
        "goal_objective_utf8_sha256": objective_ident["sha256"],
        "input_kind": input_kind,
        "non_goals": non_goals,
        "objective": objective_text,
        "operation_kind": operation,
        "prompt_utf8": prompt,
        "prompt_utf8_bytes": prompt_ident["bytes"],
        "prompt_utf8_sha256": prompt_ident["sha256"],
        "source_cell_id": cell_id,
        "source_record_refs": source_refs,
    }


def cell_record(source_cell: dict[str, Any], context_raw: str, atom_ids: list[str], reducer_id: str, coverage: list[dict[str, Any]]) -> dict[str, Any]:
    context_ident = ident(context_raw)
    return {
        "atom_ids": atom_ids,
        "coverage": coverage,
        "expected_output_utf8": source_cell["expected_output_utf8"],
        "expected_output_utf8_bytes": source_cell["expected_output_bytes"],
        "expected_output_utf8_sha256": source_cell["expected_output_sha256"],
        "index": source_cell["index"],
        "reducer_id": reducer_id,
        "render_utf8_bytes": source_cell["render_utf8_bytes"],
        "render_utf8_sha256": source_cell["render_utf8_sha256"],
        "source_cell_id": source_cell["cell"],
        "source_context_utf8_bytes": context_ident["bytes"],
        "source_context_utf8_sha256": context_ident["sha256"],
    }


def construct(base: Path) -> dict[str, Any]:
    source_path = (base / SOURCE["path"]).resolve()
    raw = source_path.read_bytes()
    require(len(raw) == SOURCE["bytes"] and hashlib.sha256(raw).hexdigest() == SOURCE["sha256"], "source identity")
    source = json.loads(raw)
    require(raw == canon(source) and len(source["cells"]) == SOURCE["cell_count"], "source canonical/count")
    s30_raw = (base / "s30_decision_atom_manifest_v1.json").read_bytes()
    s30 = json.loads(s30_raw)
    require(len(s30_raw) == 122167 and hashlib.sha256(s30_raw).hexdigest() == "9139a5ed0c444a5190280660774af595f6cda51935deddeea100a8c3f5294d1e", "S30 identity")
    s30_by_cell = {cell["source_cell_id"]: atom for cell, atom in zip(s30["cells"], s30["atoms"], strict=True)}
    source_cells = source["cells"][93:97]
    require([cell["cell"] for cell in source_cells] == ["S50_SEMANTIC", "S60_P_I-E99", "S60_C_I-E99", "S60_K_I-E99"], "terminal order")
    atoms: list[dict[str, Any]] = []
    cells: list[dict[str, Any]] = []
    reducers: list[dict[str, Any]] = []

    s50_cell = source_cells[0]
    s50_raw_context, s50_context = extract(s50_cell, "BEGIN_COMPACT_INTEGRATION_CONTEXT", "END_COMPACT_INTEGRATION_CONTEXT")
    s50_expected = json.loads(s50_cell["expected_output_utf8"])
    expected_by_edge = {row["edge_id"]: row for row in s50_expected["edge_verdicts"]}
    atom_ids: list[str] = []
    edge_rows: list[dict[str, Any]] = []
    for atom_index, edge in enumerate(s50_context["edge_candidates"]):
        endpoint_ids = [edge["from"], edge["to"]]
        dependencies = [f"s30:S30_{endpoint_id}:atom-000" for endpoint_id in endpoint_ids]
        dependency_outputs = [json.loads(s30_by_cell[f"S30_{endpoint_id}"]["expected_output_utf8"]) for endpoint_id in endpoint_ids]
        evidence = json.dumps(dependency_outputs, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        expected = json.dumps({"verdict": expected_by_edge[edge["id"]]["verdict"]}, sort_keys=True, separators=(",", ":"))
        atom_id = f"terminal:S50_SEMANTIC:{edge['id']}:atom-{atom_index:03d}"
        prompt = f"Verified: {evidence}\nEdge: {edge['statement']}\nReturn only {S50_SCHEMA}. Then mark the active Goal complete."
        atoms.append(atom_base(atom_id, atom_index, 8, s50_cell["cell"], evidence, expected, S50_OBJECTIVE, S50_CRITERION, S50_SCHEMA, "VERIFY_ONE_CLAIM", "VERIFIED_ATOM_OUTPUTS", dependencies, prompt, [], "DETERMINISTIC_REDUCER:S50_SEMANTIC_REDUCER_V1", f"Judge only integration edge {edge['id']} from two verified decision outputs.", ["judge another edge", "reopen source evidence", "assemble the full integration artifact"]))
        atom_ids.append(atom_id)
        edge_rows.append({"atom_id": atom_id, "edge_id": edge["id"], "source_decision_ids": endpoint_ids})
    reducers.append({
        "cell_id": s50_cell["cell"],
        "edge_rows": edge_rows,
        "reducer_id": "S50_SEMANTIC_REDUCER_V1",
        "rule": "Build edge_verdicts in edge_rows order from each verified one-field atom verdict plus fixed edge_id and source_decision_ids; combine with static_fields; recursively sort object keys and emit one LF.",
        "static_fields": {key: s50_expected[key] for key in ("claim_boundary", "external_audit_status", "forbidden_action_violations", "protocol_id", "stage", "topic_artifact_hashes")},
    })
    s50_coverage = [{"atom_ids": [], "classification": "SHARED_NON_SUBJECT_CONTROL", "element_id": "CONTROL"}]
    s50_coverage.extend({"atom_ids": [atom_id], "classification": "SUBJECT_MATERIAL", "element_id": f"EDGE:{edge['id']}"} for atom_id, edge in zip(atom_ids, s50_context["edge_candidates"], strict=True))
    s50_coverage.extend([
        {"atom_ids": [], "classification": "DETERMINISTIC_STATIC", "element_id": "STATIC_ENVELOPE"},
        {"atom_ids": atom_ids, "classification": "DETERMINISTIC_RECONSTRUCTION", "element_id": "OUTPUT_CONTRACT"},
    ])
    cells.append(cell_record(s50_cell, s50_raw_context, atom_ids, "S50_SEMANTIC_REDUCER_V1", s50_coverage))

    for source_cell in source_cells[1:]:
        context_raw, context = extract(source_cell, "BEGIN_SINGLE_NEW_EDGE_CONTEXT", "END_SINGLE_NEW_EDGE_CONTEXT")
        full_expected = json.loads(source_cell["expected_output_utf8"])
        role = full_expected["role"]
        options = S60_OPTIONS[role]
        evidence = json.dumps(context["admission_facts"], ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        expected = json.dumps({"classification": full_expected["classification"]}, sort_keys=True, separators=(",", ":"))
        atom_id = f"terminal:{source_cell['cell']}:classification:atom-000"
        prompt = f"Admission: {evidence}\nRole: {role}\nEdge: {context['candidate_edge']['statement']}\nChoose one: {json.dumps(options, separators=(',', ':'))}. Return only {S60_SCHEMA}. Then mark the active Goal complete."
        records = context["source_records"]
        atoms.append(atom_base(atom_id, 0, 1, source_cell["cell"], evidence, expected, S60_OBJECTIVE, S60_CRITERION, S60_SCHEMA, "CLASSIFY_ONE_ITEM_ON_ONE_AXIS", "SOURCE_SLICE", [], prompt, refs(records), f"DETERMINISTIC_REDUCER:{source_cell['cell']}_REDUCER_V1", f"Classify only candidate edge I-E99 on the {role} axis.", ["judge another specialist axis", "explain the classification", "assemble the full specialist artifact"]))
        static_fields = {key: value for key, value in full_expected.items() if key != "classification"}
        reducers.append({"atom_id": atom_id, "cell_id": source_cell["cell"], "classification_field": "classification", "reducer_id": f"{source_cell['cell']}_REDUCER_V1", "rule": "Combine the verified one-field classification atom output with static_fields; recursively sort object keys and emit one LF.", "static_fields": static_fields})
        cell_coverage = [
            {"atom_ids": [], "classification": "SHARED_NON_SUBJECT_CONTROL", "element_id": "CONTROL"},
            {"atom_ids": [atom_id], "classification": "SUBJECT_MATERIAL", "element_id": "CLASSIFICATION"},
            {"atom_ids": [], "classification": "DETERMINISTIC_STATIC", "element_id": "STATIC_ENVELOPE"},
            {"atom_ids": [atom_id], "classification": "DETERMINISTIC_RECONSTRUCTION", "element_id": "OUTPUT_CONTRACT"},
        ]
        cells.append(cell_record(source_cell, context_raw, [atom_id], f"{source_cell['cell']}_REDUCER_V1", cell_coverage))

    return {
        "artifact_id": "PW-R9-GOAL-MODE-OMP-TERMINAL-ATOM-MANIFEST-V1",
        "atoms": atoms,
        "authority": {"bridge_install": False, "canary_launch": False, "full_manifest_complete": False, "matrix_launch": False, "omp_process_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0, "review_atom_launch": False, "subject_launch": False},
        "cells": cells,
        "contract_bindings": CONTRACTS,
        "deterministic_reducers": reducers,
        "limits": LIMITS,
        "reconstruction": {"cell_count": 4, "deterministic_reducer_count": 4, "final_atom_count": 11, "rule": "Eleven independently verified single-operation atom outputs are assembled only by the four closed deterministic reducers; no model receives or emits a full legacy terminal artifact."},
        "schema_id": "pw-r9-goal-mode-omp-terminal-atom-manifest-v1",
        "semantic_review": {"mechanical_checker_can_certify": False, "required_before_runtime": True, "review_unit_count": 11, "rule": "Each atom and each deterministic reducer is independently reviewed in bounded units before runtime; no reviewer receives the full 97-cell suite.", "status": "PENDING"},
        "shard": {"cell_index_first": 93, "cell_index_last": 96, "cell_type": "S50_INTEGRATION_AND_S60_SPECIALIST", "full_legacy_cell_count": 97, "shard_id": "TERMINAL_093_096", "shard_status": "COMPLETE_PENDING_INDEPENDENT_ATOM_AND_REDUCER_REVIEW", "source_cell_count": 4},
        "source_binding": SOURCE,
        "status": "TERMINAL_SHARD_PREDECLARED_ZERO_CREDIT_NO_LAUNCH_PENDING_INDEPENDENT_REVIEW",
        "unresolved": ["All 97 legacy cells now have structural atom coverage, but compact facts, dependency use, and deterministic reducers remain pending independent bounded review.", "No atom has executed in native Goal Mode.", "No bridge install, OMP handoff, canary, or matrix launch is authorized.", "Qualification remains 0/2."],
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
    print(json.dumps({"atom_count": len(value["atoms"]), "bytes": len(raw), "cell_count": len(value["cells"]), "max_evidence_slice_utf8_bytes": max(atom["evidence_slice_utf8_bytes"] for atom in value["atoms"]), "max_prompt_utf8_bytes": max(atom["prompt_utf8_bytes"] for atom in value["atoms"]), "sha256": hashlib.sha256(raw).hexdigest(), "status": "CREATED", "subject_calls": 0}, sort_keys=True, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(json.dumps({"error": str(exc), "status": "FAIL", "subject_calls": 0}, sort_keys=True, separators=(",", ":")))
        raise SystemExit(1)
