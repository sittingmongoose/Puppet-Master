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

from check_s10_edge_atom_manifest_v1 import Invalid, canon, exact_keys, file_binding, ident, load_json, parse_json, require


SCHEMA = "pw-r9-goal-mode-omp-terminal-atom-manifest-v2"
STATUS = "TERMINAL_SHARD_V2_PREDECLARED_ZERO_CREDIT_NO_LAUNCH_PENDING_INDEPENDENT_REVIEW"
LIMITS = {"evidence_slice_max_utf8_bytes": 256, "goal_objective_max_utf8_bytes": 256, "output_contract_max_utf8_bytes": 128, "scored_subject_max_utf8_bytes": 512}
AUTHORITY = {"bridge_install": False, "canary_launch": False, "full_manifest_complete": False, "matrix_launch": False, "omp_process_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0, "review_atom_launch": False, "subject_launch": False}
SOURCE = {"bytes": 786546, "cell_count": 97, "mode": "0644", "path": "../formal_candidate_v7/semantic_bundle.json", "sha256": "11139c2b52a2fe900f2976a34f7712d8f05d5b2991ce8cc26d5cfc4e1ef871c2"}
V1_FAILURE = {"bytes": 2635, "mode": "0644", "path": "r9_goal_mode_omp_terminal_atom_manifest_v1_failure_receipt.json", "sha256": "2e16da3636a28ec42319d9f84e9467ac1fccf35bb4794787a3bc3edac4e235d0"}
CONTRACTS = [
    {"bytes": 11734, "mode": "0644", "path": "../r9_goal_mode_omp_atomic_work_unit_impact_assessment_v1.json", "sha256": "97ad72ec500cc674d0b2adbec21de878420fa49b28350542d04fe29be20d0a7c"},
    {"bytes": 7845, "mode": "0644", "path": "../goal_mode_omp_headless_bridge_v1/bridge_contract_v3.json", "sha256": "6d94cfd2b1d2ffba621b6249fe2c4b8a831b3a774e388a8132f0588c7dc401d6"},
    {"bytes": 122167, "mode": "0644", "path": "s30_decision_atom_manifest_v1.json", "sha256": "9139a5ed0c444a5190280660774af595f6cda51935deddeea100a8c3f5294d1e"},
    {"bytes": 3710, "mode": "0644", "path": "r9_goal_mode_omp_s30_decision_atom_manifest_mechanical_receipt_v1.json", "sha256": "6f47885bfa240ff7596ce79f668127985d47d37d67ccfd0da6aeadb0272d0b46"},
    {"bytes": 64357, "mode": "0644", "path": "s10_edge_atom_manifest_v1.json", "sha256": "d2fe5744327976e80cfd61a1dc3ace1bca5409783e8361b17b9a601c8bd52907"},
    {"bytes": 4325, "mode": "0644", "path": "r9_goal_mode_omp_s10_edge_atom_manifest_mechanical_receipt_v1.json", "sha256": "bf8c259785e8543f3e2c69a5ce8cd28124da1a649bf71e0a3b2be018a865f894"},
    {"bytes": 17676, "mode": "0644", "path": "s10_tension_atom_manifest_v1.json", "sha256": "0bce5c662488e2f83c9a81266106300f682f51f18061346b680204ea4e1c7851"},
    {"bytes": 5218, "mode": "0644", "path": "r9_goal_mode_omp_s10_tension_atom_manifest_mechanical_receipt_v1.json", "sha256": "25ef931468f74592ae62d3d4ff79608f38bd2c72c6a24250d60154768476b6a4"},
    V1_FAILURE,
]
ROOT_KEYS = {"artifact_id", "atoms", "authority", "cells", "contract_bindings", "deterministic_reducers", "limits", "lineage", "reconstruction", "schema_id", "semantic_review", "shard", "source_binding", "status", "unresolved"}
ATOM_KEYS = {"acceptance_criterion", "atom_count", "atom_id", "atom_index", "cell_output_role", "cell_reconstruction_ref", "dependency_atom_ids", "evidence_slice_utf8", "evidence_slice_utf8_bytes", "evidence_slice_utf8_sha256", "expected_output_schema", "expected_output_utf8", "expected_output_utf8_bytes", "expected_output_utf8_sha256", "goal_objective_utf8", "goal_objective_utf8_bytes", "goal_objective_utf8_sha256", "input_kind", "non_goals", "objective", "operation_kind", "prompt_utf8", "prompt_utf8_bytes", "prompt_utf8_sha256", "source_cell_id", "source_record_refs"}
CELL_KEYS = {"atom_ids", "coverage", "expected_output_utf8", "expected_output_utf8_bytes", "expected_output_utf8_sha256", "index", "reducer_id", "render_utf8_bytes", "render_utf8_sha256", "source_cell_id", "source_context_utf8_bytes", "source_context_utf8_sha256"}
S50_OBJECTIVE = "Judge one integration edge from two verified decision outputs."
S50_CRITERION = "The verdict must exactly state whether the two verified decisions support the one edge."
S50_SCHEMA = '{"verdict":"supported or unsupported"}'
S60_OBJECTIVE = "Classify one candidate edge on one named specialist axis."
S60_CRITERION = "The classification must be exactly the listed option supported by the admission facts."
S60_SCHEMA = '{"classification":"one listed option"}'
S60_OPTIONS = {"provenance": ["provenance_complete", "provenance_gap"], "constraint_authority": ["authority_conflation", "authority_separated"], "counterfactual_dependency": ["counterfactual_failure", "counterfactual_supported"]}


def context(cell: dict[str, Any], begin_label: str, end_label: str) -> tuple[str, dict[str, Any]]:
    text = cell["render_utf8"]
    begin, end = f"{begin_label}\n", f"\n{end_label}"
    require(text.count(begin) == 1 and text.count(end) == 1, f"context markers:{cell['cell']}")
    raw = text.split(begin, 1)[1].split(end, 1)[0]
    value = parse_json(raw.encode(), f"context:{cell['cell']}")
    require(isinstance(value, dict), f"context object:{cell['cell']}")
    return raw, value


def source_refs(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [{"authority": record["authority"], "path": record["path"], "source_record_id": record["source_record_id"], "source_sha256": record["source_sha256"], "span": f"{record['start_line']}-{record['end_line']}"} for record in records]


def s50_coverage(atom_ids: list[str], edges: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rows = [{"atom_ids": [], "classification": "SHARED_NON_SUBJECT_CONTROL", "element_id": "CONTROL"}]
    rows.extend({"atom_ids": [atom_id], "classification": "SUBJECT_MATERIAL", "element_id": f"EDGE:{edge['id']}"} for atom_id, edge in zip(atom_ids, edges, strict=True))
    rows.extend([{"atom_ids": [], "classification": "DETERMINISTIC_STATIC", "element_id": "STATIC_ENVELOPE"}, {"atom_ids": atom_ids, "classification": "DETERMINISTIC_RECONSTRUCTION", "element_id": "OUTPUT_CONTRACT"}])
    return rows


def s60_coverage(atom_id: str) -> list[dict[str, Any]]:
    return [
        {"atom_ids": [], "classification": "SHARED_NON_SUBJECT_CONTROL", "element_id": "CONTROL"},
        {"atom_ids": [atom_id], "classification": "SUBJECT_MATERIAL", "element_id": "CLASSIFICATION"},
        {"atom_ids": [], "classification": "DETERMINISTIC_STATIC", "element_id": "STATIC_ENVELOPE"},
        {"atom_ids": [atom_id], "classification": "DETERMINISTIC_RECONSTRUCTION", "element_id": "OUTPUT_CONTRACT"},
    ]


def validate_cell(cell: dict[str, Any], source_cell: dict[str, Any], raw_context: str, atom_ids: list[str], reducer_id: str, coverage: list[dict[str, Any]], label: str) -> None:
    exact_keys(cell, CELL_KEYS, label)
    require(cell["atom_ids"] == atom_ids and cell["reducer_id"] == reducer_id, f"cell atom/reducer:{label}")
    require(cell["coverage"] == coverage, f"cell coverage:{label}")
    require(cell["index"] == source_cell["index"] and cell["source_cell_id"] == source_cell["cell"], f"cell identity:{label}")
    require(cell["expected_output_utf8"] == source_cell["expected_output_utf8"] and cell["expected_output_utf8_bytes"] == source_cell["expected_output_bytes"] and cell["expected_output_utf8_sha256"] == source_cell["expected_output_sha256"], f"cell expected:{label}")
    require(cell["render_utf8_bytes"] == source_cell["render_utf8_bytes"] and cell["render_utf8_sha256"] == source_cell["render_utf8_sha256"], f"render identity:{label}")
    raw = raw_context.encode()
    require(cell["source_context_utf8_bytes"] == len(raw) and cell["source_context_utf8_sha256"] == hashlib.sha256(raw).hexdigest(), f"context identity:{label}")


def validate_atom_common(atom: dict[str, Any], atom_id: str, atom_index: int, atom_count: int, cell_id: str, objective: str, criterion: str, schema: str, operation: str, input_kind: str, reconstruction: str, non_goals: list[str], label: str) -> None:
    exact_keys(atom, ATOM_KEYS, label)
    require(atom["atom_id"] == atom_id and atom["atom_index"] == atom_index and atom["atom_count"] == atom_count and atom["source_cell_id"] == cell_id, f"atom identity:{label}")
    require(atom["cell_output_role"] == "COMPONENT" and atom["cell_reconstruction_ref"] == reconstruction, f"component role:{label}")
    require(atom["goal_objective_utf8"] == objective and atom["acceptance_criterion"] == criterion and atom["expected_output_schema"] == schema, f"control strings:{label}")
    require(atom["operation_kind"] == operation and atom["input_kind"] == input_kind and atom["non_goals"] == non_goals, f"operation/non-goals:{label}")
    ident(atom["goal_objective_utf8"], atom["goal_objective_utf8_bytes"], atom["goal_objective_utf8_sha256"], LIMITS["goal_objective_max_utf8_bytes"], f"goal:{label}")
    ident(atom["evidence_slice_utf8"], atom["evidence_slice_utf8_bytes"], atom["evidence_slice_utf8_sha256"], LIMITS["evidence_slice_max_utf8_bytes"], f"evidence:{label}")
    ident(atom["prompt_utf8"], atom["prompt_utf8_bytes"], atom["prompt_utf8_sha256"], LIMITS["scored_subject_max_utf8_bytes"], f"prompt:{label}")
    ident(atom["expected_output_utf8"], atom["expected_output_utf8_bytes"], atom["expected_output_utf8_sha256"], LIMITS["output_contract_max_utf8_bytes"], f"expected:{label}")


def check_obj(manifest: dict[str, Any], path: Path) -> dict[str, int]:
    exact_keys(manifest, ROOT_KEYS, "root")
    require(manifest["artifact_id"] == "PW-R9-GOAL-MODE-OMP-TERMINAL-ATOM-MANIFEST-V2", "artifact id")
    require(manifest["schema_id"] == SCHEMA and manifest["status"] == STATUS, "schema/status")
    require(manifest["authority"] == AUTHORITY and manifest["limits"] == LIMITS, "authority/limits")
    require(manifest["source_binding"] == SOURCE and manifest["contract_bindings"] == CONTRACTS, "source/contracts")
    require(manifest["lineage"] == {"disposition": "V1_PRESERVED_AS_FAILED_DIAGNOSTIC_ONLY", "failure_receipt": V1_FAILURE, "replacement_scope": "ONLY_CLOSE_REDUCER_TOTALITY_AND_COMPONENT_CARDINALITY_LABELS"}, "lineage")
    require(manifest["reconstruction"] == {"cell_count": 4, "component_atom_output_count": 11, "deterministic_reducer_count": 4, "rule": "Eleven independently verified single-operation component outputs are assembled only by the four closed deterministic reducers; no model receives or emits a full legacy terminal artifact."}, "reconstruction")
    require(manifest["semantic_review"] == {"mechanical_checker_can_certify": False, "required_before_runtime": True, "review_unit_count": 11, "rule": "Each atom and each deterministic reducer is independently reviewed in bounded units before runtime; no reviewer receives the full 97-cell suite.", "status": "PENDING"}, "semantic review")
    require(manifest["shard"] == {"cell_index_first": 93, "cell_index_last": 96, "cell_type": "S50_INTEGRATION_AND_S60_SPECIALIST", "full_legacy_cell_count": 97, "shard_id": "TERMINAL_093_096", "shard_status": "COMPLETE_PENDING_INDEPENDENT_ATOM_AND_REDUCER_REVIEW", "source_cell_count": 4}, "shard")
    base = path.parent
    source_path = file_binding(base, {key: SOURCE[key] for key in ("bytes", "mode", "path", "sha256")}, "source")
    for index, binding in enumerate(CONTRACTS):
        file_binding(base, binding, f"contract:{index}")
    source_raw, source = load_json(source_path)
    require(source_raw == canon(source) and len(source.get("cells", [])) == 97, "source canonical/count")
    s30_raw, s30 = load_json(base / "s30_decision_atom_manifest_v1.json")
    require(len(s30_raw) == 122167 and hashlib.sha256(s30_raw).hexdigest() == "9139a5ed0c444a5190280660774af595f6cda51935deddeea100a8c3f5294d1e", "S30 identity")
    s30_by_cell = {cell["source_cell_id"]: atom for cell, atom in zip(s30["cells"], s30["atoms"], strict=True)}
    source_cells = source["cells"][93:97]
    require([cell["cell"] for cell in source_cells] == ["S50_SEMANTIC", "S60_P_I-E99", "S60_C_I-E99", "S60_K_I-E99"], "terminal source order")
    atoms, cells, reducers = manifest["atoms"], manifest["cells"], manifest["deterministic_reducers"]
    require(isinstance(atoms, list) and len(atoms) == 11 and isinstance(cells, list) and len(cells) == 4 and isinstance(reducers, list) and len(reducers) == 4, "manifest counts")
    cursor = 0
    max_prompt = 0
    max_evidence = 0

    s50_cell = source_cells[0]
    s50_raw, s50_context = context(s50_cell, "BEGIN_COMPACT_INTEGRATION_CONTEXT", "END_COMPACT_INTEGRATION_CONTEXT")
    exact_keys(s50_context, {"edge_candidates", "endpoint_decisions", "topic_artifact_hashes"}, "S50 context")
    full_expected = parse_json(s50_cell["expected_output_utf8"].encode(), "S50 expected")
    expected_by_edge = {row["edge_id"]: row for row in full_expected["edge_verdicts"]}
    s50_atom_ids: list[str] = []
    edge_rows: list[dict[str, Any]] = []
    for atom_index, edge in enumerate(s50_context["edge_candidates"]):
        atom = atoms[cursor]
        cursor += 1
        atom_id = f"terminal:S50_SEMANTIC:{edge['id']}:atom-{atom_index:03d}"
        s50_atom_ids.append(atom_id)
        endpoint_ids = [edge["from"], edge["to"]]
        dependencies = [f"s30:S30_{endpoint_id}:atom-000" for endpoint_id in endpoint_ids]
        dependency_outputs = [parse_json(s30_by_cell[f"S30_{endpoint_id}"]["expected_output_utf8"].encode(), f"dependency:{endpoint_id}") for endpoint_id in endpoint_ids]
        evidence = json.dumps(dependency_outputs, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        expected = json.dumps({"verdict": expected_by_edge[edge["id"]]["verdict"]}, sort_keys=True, separators=(",", ":"))
        validate_atom_common(atom, atom_id, atom_index, 8, s50_cell["cell"], S50_OBJECTIVE, S50_CRITERION, S50_SCHEMA, "VERIFY_ONE_CLAIM", "VERIFIED_ATOM_OUTPUTS", "DETERMINISTIC_REDUCER:S50_SEMANTIC_REDUCER_V1", ["judge another edge", "reopen source evidence", "assemble the full integration artifact"], f"S50:{atom_index}")
        require(atom["dependency_atom_ids"] == dependencies and atom["source_record_refs"] == [], f"S50 dependencies:{atom_index}")
        require(atom["objective"] == f"Judge only integration edge {edge['id']} from two verified decision outputs.", f"S50 objective:{atom_index}")
        prompt = f"Verified: {evidence}\nEdge: {edge['statement']}\nReturn only {S50_SCHEMA}. Then mark the active Goal complete."
        require(atom["evidence_slice_utf8"] == evidence and atom["prompt_utf8"] == prompt and atom["expected_output_utf8"] == expected, f"S50 payload:{atom_index}")
        require(atom["prompt_utf8"] != s50_cell["render_utf8"] and atom["expected_output_utf8"] != s50_cell["expected_output_utf8"], f"S50 no legacy:{atom_index}")
        max_prompt = max(max_prompt, atom["prompt_utf8_bytes"])
        max_evidence = max(max_evidence, atom["evidence_slice_utf8_bytes"])
        edge_rows.append({"atom_id": atom_id, "edge_id": edge["id"], "source_decision_ids": endpoint_ids})
    expected_s50_reducer = {"cell_id": "S50_SEMANTIC", "edge_rows": edge_rows, "reducer_id": "S50_SEMANTIC_REDUCER_V1", "rule": "Build checked_edge_ids from edge_rows.edge_id in order; build edge_verdicts in the same order from each verified one-field atom verdict plus fixed edge_id and source_decision_ids; combine both with static_fields; recursively sort object keys and emit one LF.", "static_fields": {key: full_expected[key] for key in ("claim_boundary", "external_audit_status", "forbidden_action_violations", "protocol_id", "stage", "topic_artifact_hashes")}}
    require(reducers[0] == expected_s50_reducer, "S50 reducer declaration")
    reconstructed_s50 = copy.deepcopy(expected_s50_reducer["static_fields"])
    reconstructed_s50["checked_edge_ids"] = [row["edge_id"] for row in edge_rows]
    reconstructed_s50["edge_verdicts"] = [{"edge_id": row["edge_id"], "source_decision_ids": row["source_decision_ids"], "verdict": parse_json(atoms[index]["expected_output_utf8"].encode(), f"S50 atom output:{index}")["verdict"]} for index, row in enumerate(edge_rows)]
    require(json.dumps(reconstructed_s50, ensure_ascii=False, sort_keys=True, separators=(",", ":")) == s50_cell["expected_output_utf8"], "S50 exact reconstruction")
    validate_cell(cells[0], s50_cell, s50_raw, s50_atom_ids, "S50_SEMANTIC_REDUCER_V1", s50_coverage(s50_atom_ids, s50_context["edge_candidates"]), "S50")

    for cell_offset, source_cell in enumerate(source_cells[1:], start=1):
        atom = atoms[cursor]
        cursor += 1
        raw_context, ctx = context(source_cell, "BEGIN_SINGLE_NEW_EDGE_CONTEXT", "END_SINGLE_NEW_EDGE_CONTEXT")
        exact_keys(ctx, {"admission_facts", "candidate_edge", "endpoint_decisions", "source_records"}, f"S60 context:{cell_offset}")
        expected_full = parse_json(source_cell["expected_output_utf8"].encode(), f"S60 expected:{cell_offset}")
        role = expected_full["role"]
        atom_id = f"terminal:{source_cell['cell']}:classification:atom-000"
        reducer_id = f"{source_cell['cell']}_REDUCER_V1"
        validate_atom_common(atom, atom_id, 0, 1, source_cell["cell"], S60_OBJECTIVE, S60_CRITERION, S60_SCHEMA, "CLASSIFY_ONE_ITEM_ON_ONE_AXIS", "SOURCE_SLICE", f"DETERMINISTIC_REDUCER:{reducer_id}", ["judge another specialist axis", "explain the classification", "assemble the full specialist artifact"], f"S60:{cell_offset}")
        evidence = json.dumps(ctx["admission_facts"], ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        expected = json.dumps({"classification": expected_full["classification"]}, sort_keys=True, separators=(",", ":"))
        prompt = f"Admission: {evidence}\nRole: {role}\nEdge: {ctx['candidate_edge']['statement']}\nChoose one: {json.dumps(S60_OPTIONS[role], separators=(',', ':'))}. Return only {S60_SCHEMA}. Then mark the active Goal complete."
        require(atom["dependency_atom_ids"] == [] and atom["source_record_refs"] == source_refs(ctx["source_records"]), f"S60 refs:{cell_offset}")
        require(atom["objective"] == f"Classify only candidate edge I-E99 on the {role} axis.", f"S60 objective:{cell_offset}")
        require(atom["evidence_slice_utf8"] == evidence and atom["prompt_utf8"] == prompt and atom["expected_output_utf8"] == expected, f"S60 payload:{cell_offset}")
        require(atom["prompt_utf8"] != source_cell["render_utf8"] and atom["expected_output_utf8"] != source_cell["expected_output_utf8"], f"S60 no legacy:{cell_offset}")
        static_fields = {key: value for key, value in expected_full.items() if key != "classification"}
        expected_reducer = {"atom_id": atom_id, "cell_id": source_cell["cell"], "classification_field": "classification", "reducer_id": reducer_id, "rule": "Combine the verified one-field classification atom output with static_fields; recursively sort object keys and emit one LF.", "static_fields": static_fields}
        require(reducers[cell_offset] == expected_reducer, f"S60 reducer:{cell_offset}")
        reconstructed = copy.deepcopy(static_fields)
        reconstructed["classification"] = parse_json(atom["expected_output_utf8"].encode(), f"S60 atom output:{cell_offset}")["classification"]
        require(json.dumps(reconstructed, ensure_ascii=False, sort_keys=True, separators=(",", ":")) == source_cell["expected_output_utf8"], f"S60 exact reconstruction:{cell_offset}")
        validate_cell(cells[cell_offset], source_cell, raw_context, [atom_id], reducer_id, s60_coverage(atom_id), f"S60:{cell_offset}")
        max_prompt = max(max_prompt, atom["prompt_utf8_bytes"])
        max_evidence = max(max_evidence, atom["evidence_slice_utf8_bytes"])
    require(cursor == 11, "atom consumption")
    require(max_prompt == 374 and max_evidence == 134, "maxima")
    require(manifest["unresolved"][-1] == "Qualification remains 0/2.", "qualification unresolved")
    return {"atom_count": 11, "cell_count": 4, "max_evidence": max_evidence, "max_prompt": max_prompt, "reducer_count": 4}


def check_path(path: Path) -> tuple[dict[str, Any], dict[str, int]]:
    raw, value = load_json(path)
    require(raw == canon(value), "canonical manifest")
    require(stat.S_IMODE(path.stat().st_mode) == 0o644, "manifest mode")
    return value, check_obj(value, path)


def mutations() -> list[tuple[str, Callable[[dict[str, Any]], None]]]:
    return [
        ("status", lambda v: v.__setitem__("status", "PASS")), ("authority", lambda v: v["authority"].__setitem__("subject_launch", True)), ("credit", lambda v: v["authority"].__setitem__("qualification_credit", 1)), ("lineage", lambda v: v["lineage"].__setitem__("disposition", "PASS")), ("reconstruction-label", lambda v: v["reconstruction"].__setitem__("component_atom_output_count", 10)), ("source", lambda v: v["source_binding"].__setitem__("sha256", "0" * 64)), ("contract", lambda v: v["contract_bindings"][-1].__setitem__("bytes", 1)), ("review", lambda v: v["semantic_review"].__setitem__("status", "PASS")), ("drop-atom", lambda v: v["atoms"].pop()), ("drop-cell", lambda v: v["cells"].pop()), ("drop-reducer", lambda v: v["deterministic_reducers"].pop()), ("atom-id", lambda v: v["atoms"][0].__setitem__("atom_id", "wrong")), ("atom-role", lambda v: v["atoms"][0].__setitem__("cell_output_role", "FINAL")), ("atom-count", lambda v: v["atoms"][0].__setitem__("atom_count", 1)), ("dependency", lambda v: v["atoms"][0]["dependency_atom_ids"].pop()), ("evidence", lambda v: v["atoms"][0].__setitem__("evidence_slice_utf8", "{}")), ("prompt", lambda v: v["atoms"][0].__setitem__("prompt_utf8", v["atoms"][0]["prompt_utf8"] + " Explain.")), ("prompt-bytes", lambda v: v["atoms"][0].__setitem__("prompt_utf8_bytes", 513)), ("expected-full", lambda v: v["atoms"][0].__setitem__("expected_output_utf8", v["cells"][0]["expected_output_utf8"])), ("cell-reducer", lambda v: v["cells"][0].__setitem__("reducer_id", "wrong")), ("coverage", lambda v: v["cells"][0]["coverage"].pop()), ("checked-ids-rule", lambda v: v["deterministic_reducers"][0].__setitem__("rule", "Build edge_verdicts only.")), ("edge-row", lambda v: v["deterministic_reducers"][0]["edge_rows"].pop()), ("static", lambda v: v["deterministic_reducers"][0]["static_fields"].__setitem__("stage", "wrong")), ("classification", lambda v: v["atoms"][-1].__setitem__("expected_output_utf8", '{"classification":"wrong"}')), ("source-ref", lambda v: v["atoms"][-1]["source_record_refs"][0].__setitem__("source_sha256", "0" * 64)), ("root-extra", lambda v: v.__setitem__("extra", True)),
    ]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true")
    mode.add_argument("--mutation-self-test", action="store_true")
    args = parser.parse_args()
    path = Path(args.manifest)
    require(path.is_absolute(), "manifest must be absolute")
    manifest, stats = check_path(path)
    count = 0
    if args.mutation_self_test:
        for name, mutate in mutations():
            candidate = copy.deepcopy(manifest)
            mutate(candidate)
            try:
                check_obj(candidate, path)
            except Invalid:
                count += 1
            else:
                raise Invalid(f"mutation accepted:{name}")
    sys.stdout.buffer.write(canon({"atom_count": stats["atom_count"], "cell_count": stats["cell_count"], "first_mismatch": None, "max_evidence_slice_utf8_bytes": stats["max_evidence"], "max_prompt_utf8_bytes": stats["max_prompt"], "mode": "mutation-self-test" if args.mutation_self_test else "check", "mutation_count": count, "reducer_count": stats["reducer_count"], "schema_id": "pw-r9-goal-mode-omp-terminal-atom-manifest-check-v2", "semantic_review_status": "PENDING", "status": "PASS", "subject_calls": 0, "workspace_writes": 0}))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Invalid as exc:
        sys.stdout.buffer.write(canon({"first_mismatch": str(exc), "schema_id": "pw-r9-goal-mode-omp-terminal-atom-manifest-check-v2", "semantic_review_status": "PENDING", "status": "FAIL", "subject_calls": 0, "workspace_writes": 0}))
        raise SystemExit(1)
