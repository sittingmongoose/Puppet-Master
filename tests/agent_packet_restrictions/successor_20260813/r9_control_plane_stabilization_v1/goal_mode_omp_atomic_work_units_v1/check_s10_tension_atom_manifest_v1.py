#!/usr/bin/env python3
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import re
import stat
import sys
from pathlib import Path
from typing import Any, Callable

from check_s10_edge_atom_manifest_v1 import Invalid, canon, exact_keys, file_binding, ident, load_json, parse_json, require


SCHEMA = "pw-r9-goal-mode-omp-s10-tension-atom-manifest-v1"
STATUS = "S10_TENSION_SHARD_PREDECLARED_ZERO_CREDIT_NO_LAUNCH_PENDING_INDEPENDENT_FACT_REVIEW"
ATOM_ID = re.compile(r"^tension:S10[AB]_TENSION_[AB]-T[0-9]{2}:atom-000$")
LIMITS = {"evidence_slice_max_utf8_bytes": 256, "goal_objective_max_utf8_bytes": 256, "output_contract_max_utf8_bytes": 128, "scored_subject_max_utf8_bytes": 512}
AUTHORITY = {"bridge_install": False, "canary_launch": False, "full_manifest_complete": False, "matrix_launch": False, "omp_process_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0, "review_atom_launch": False, "subject_launch": False}
SOURCE = {"bytes": 786546, "cell_count": 97, "mode": "0644", "path": "../formal_candidate_v7/semantic_bundle.json", "sha256": "11139c2b52a2fe900f2976a34f7712d8f05d5b2991ce8cc26d5cfc4e1ef871c2"}
CONTRACTS = [
    {"bytes": 11734, "mode": "0644", "path": "../r9_goal_mode_omp_atomic_work_unit_impact_assessment_v1.json", "sha256": "97ad72ec500cc674d0b2adbec21de878420fa49b28350542d04fe29be20d0a7c"},
    {"bytes": 7845, "mode": "0644", "path": "../goal_mode_omp_headless_bridge_v1/bridge_contract_v3.json", "sha256": "6d94cfd2b1d2ffba621b6249fe2c4b8a831b3a774e388a8132f0588c7dc401d6"},
    {"bytes": 64357, "mode": "0644", "path": "s10_edge_atom_manifest_v1.json", "sha256": "d2fe5744327976e80cfd61a1dc3ace1bca5409783e8361b17b9a601c8bd52907"},
    {"bytes": 4325, "mode": "0644", "path": "r9_goal_mode_omp_s10_edge_atom_manifest_mechanical_receipt_v1.json", "sha256": "bf8c259785e8543f3e2c69a5ce8cd28124da1a649bf71e0a3b2be018a865f894"},
]
ROOT_KEYS = {"artifact_id", "atoms", "authority", "cells", "contract_bindings", "limits", "reconstruction", "schema_id", "semantic_review", "shard", "source_binding", "status", "unresolved"}
ATOM_KEYS = {"acceptance_criterion", "atom_count", "atom_id", "atom_index", "cell_output_role", "cell_reconstruction_ref", "dependency_atom_ids", "evidence_slice_utf8", "evidence_slice_utf8_bytes", "evidence_slice_utf8_sha256", "expected_output_schema", "expected_output_utf8", "expected_output_utf8_bytes", "expected_output_utf8_sha256", "goal_objective_utf8", "goal_objective_utf8_bytes", "goal_objective_utf8_sha256", "input_kind", "non_goals", "objective", "operation_kind", "prompt_utf8", "prompt_utf8_bytes", "prompt_utf8_sha256", "source_cell_id", "source_record_refs"}
CELL_KEYS = {"atom_ids", "coverage", "expected_output_utf8", "expected_output_utf8_bytes", "expected_output_utf8_sha256", "final_atom_id", "index", "render_utf8_bytes", "render_utf8_sha256", "source_cell_id", "source_context_utf8_bytes", "source_context_utf8_sha256"}
OUTPUT_SCHEMA = '{"preserve_boundary":"boolean"}'
OBJECTIVE = "Decide whether one boundary must be preserved using one compact fact."
CRITERION = "The Boolean preserve_boundary value must be exactly supported by the supplied fact."


def context(cell: dict[str, Any]) -> tuple[str, dict[str, Any]]:
    text = cell["render_utf8"]
    begin = "BEGIN_SINGLE_TENSION_CONTEXT\n"
    end = "\nEND_SINGLE_TENSION_CONTEXT"
    require(text.count(begin) == 1 and text.count(end) == 1, f"context markers:{cell['cell']}")
    raw = text.split(begin, 1)[1].split(end, 1)[0]
    value = parse_json(raw.encode("utf-8"), f"context:{cell['cell']}")
    exact_keys(value, {"candidate", "predecessor_outputs", "preserve_boundary_question", "source_bindings", "supported_claims"}, f"context:{cell['cell']}")
    return raw, value


def refs(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [{"authority": record["authority"], "path": record["path"], "source_record_id": record["source_record_id"], "source_sha256": record["source_sha256"], "span": f"{record['start_line']}-{record['end_line']}"} for record in records]


def coverage(atom_id: str) -> list[dict[str, Any]]:
    return [
        {"atom_ids": [], "classification": "SHARED_NON_SUBJECT_CONTROL", "element_id": "CONTROL", "note": "Isolation, Goal lifecycle, hidden-candidate, no-tool, formatting, authority, and no-reuse rules belong to the bridge and verifier."},
        {"atom_ids": [atom_id], "classification": "SUBJECT_MATERIAL", "element_id": "BOUNDARY_CANDIDATE"},
        {"atom_ids": [atom_id], "classification": "SUBJECT_MATERIAL", "element_id": "EVIDENCE"},
        {"atom_ids": [atom_id], "classification": "SUBJECT_MATERIAL", "element_id": "OUTPUT_CONTRACT"},
    ]


def check_obj(manifest: dict[str, Any], path: Path) -> dict[str, int]:
    exact_keys(manifest, ROOT_KEYS, "root")
    require(manifest["artifact_id"] == "PW-R9-GOAL-MODE-OMP-S10-TENSION-ATOM-MANIFEST-V1", "artifact id")
    require(manifest["schema_id"] == SCHEMA and manifest["status"] == STATUS, "schema/status")
    require(manifest["authority"] == AUTHORITY and manifest["limits"] == LIMITS, "authority/limits")
    require(manifest["source_binding"] == SOURCE and manifest["contract_bindings"] == CONTRACTS, "source/contracts")
    require(manifest["reconstruction"] == {"cell_count": 4, "final_atom_count": 4, "rule": "Each tension cell result is the exact verified output of its own sole final atom; no predecessor-result reuse, synthesis, or hidden-candidate access is permitted."}, "reconstruction")
    require(manifest["semantic_review"] == {"mechanical_checker_can_certify": False, "required_before_runtime": True, "review_unit_count": 4, "rule": "Each compact fact is reviewed against only its cited frozen source records in a separate fresh native Goal; no reviewer receives the full shard.", "status": "PENDING"}, "semantic review")
    require(manifest["shard"] == {"cell_index_first": 54, "cell_index_last": 57, "cell_type": "S10_SINGLE_TENSION", "full_legacy_cell_count": 97, "shard_id": "S10_TENSIONS_054_057", "shard_status": "COMPLETE_PENDING_INDEPENDENT_FACT_REVIEW", "source_cell_count": 4}, "shard")
    base = path.parent
    source_path = file_binding(base, {key: SOURCE[key] for key in ("bytes", "mode", "path", "sha256")}, "source")
    for index, binding in enumerate(CONTRACTS):
        file_binding(base, binding, f"contract:{index}")
    source_raw, source = load_json(source_path)
    require(source_raw == canon(source) and len(source.get("cells", [])) == 97, "source canonical/count")
    atoms, cells, source_cells = manifest["atoms"], manifest["cells"], source["cells"][54:58]
    require(isinstance(atoms, list) and isinstance(cells, list) and len(atoms) == len(cells) == 4, "counts")
    max_prompt = 0
    max_evidence = 0
    for index, (atom, cell, source_cell) in enumerate(zip(atoms, cells, source_cells, strict=True)):
        exact_keys(atom, ATOM_KEYS, f"atom:{index}")
        exact_keys(cell, CELL_KEYS, f"cell:{index}")
        cell_id = source_cell["cell"]
        atom_id = f"tension:{cell_id}:atom-000"
        require(ATOM_ID.fullmatch(atom_id) is not None and atom["atom_id"] == atom_id and atom["atom_index"] == index and atom["source_cell_id"] == cell_id, f"atom identity:{index}")
        require(atom["atom_count"] == 1 and atom["operation_kind"] == "DECIDE_ONE_BOUNDARY_PRESERVATION" and atom["input_kind"] == "SOURCE_SLICE", f"atom operation:{index}")
        require(atom["dependency_atom_ids"] == [] and atom["cell_output_role"] == "FINAL" and atom["cell_reconstruction_ref"] == f"FINAL_ATOM_OUTPUT:{atom_id}", f"atom independence:{index}")
        require(atom["goal_objective_utf8"] == OBJECTIVE and atom["acceptance_criterion"] == CRITERION and atom["expected_output_schema"] == OUTPUT_SCHEMA, f"control strings:{index}")
        require(atom["objective"] == f"Judge only boundary {cell_id.rsplit('_', 1)[-1]} from one compact fact.", f"objective:{index}")
        require(atom["non_goals"] == ["explain the decision", "inspect another boundary", "reconstruct the hidden candidate"], f"non-goals:{index}")
        ident(atom["goal_objective_utf8"], atom["goal_objective_utf8_bytes"], atom["goal_objective_utf8_sha256"], LIMITS["goal_objective_max_utf8_bytes"], f"goal:{index}")
        ident(atom["evidence_slice_utf8"], atom["evidence_slice_utf8_bytes"], atom["evidence_slice_utf8_sha256"], LIMITS["evidence_slice_max_utf8_bytes"], f"evidence:{index}")
        ident(atom["prompt_utf8"], atom["prompt_utf8_bytes"], atom["prompt_utf8_sha256"], LIMITS["scored_subject_max_utf8_bytes"], f"prompt:{index}")
        ident(atom["expected_output_utf8"], atom["expected_output_utf8_bytes"], atom["expected_output_utf8_sha256"], LIMITS["output_contract_max_utf8_bytes"], f"expected:{index}")
        raw_context, ctx = context(source_cell)
        evidence = parse_json(atom["evidence_slice_utf8"].encode(), f"evidence:{index}")
        exact_keys(evidence, {"authority", "fact", "source_record_ids"}, f"evidence keys:{index}")
        require(isinstance(evidence["fact"], str) and 1 <= len(evidence["fact"].encode()) <= 160, f"fact size:{index}")
        require(isinstance(evidence["source_record_ids"], list) and 1 <= len(evidence["source_record_ids"]) <= 3 and len(set(evidence["source_record_ids"])) == len(evidence["source_record_ids"]), f"source id count:{index}")
        by_id = {record["source_record_id"]: record for record in ctx["source_bindings"]}
        require(all(source_id in by_id for source_id in evidence["source_record_ids"]), f"source ids:{index}")
        records = [by_id[source_id] for source_id in evidence["source_record_ids"]]
        authorities = {record["authority"] for record in records}
        require(evidence["authority"] == (next(iter(authorities)) if len(authorities) == 1 else "mixed"), f"authority:{index}")
        require(json.dumps(evidence, ensure_ascii=False, sort_keys=True, separators=(",", ":")) == atom["evidence_slice_utf8"], f"canonical evidence:{index}")
        prompt = f"E: {atom['evidence_slice_utf8']}\nBoundary: {ctx['candidate']}\nReturn only {OUTPUT_SCHEMA} with a real Boolean. Then mark the active Goal complete."
        require(atom["prompt_utf8"] == prompt, f"prompt reconstruction:{index}")
        require(atom["expected_output_utf8"] == source_cell["expected_output_utf8"] and atom["expected_output_utf8_bytes"] == source_cell["expected_output_bytes"] and atom["expected_output_utf8_sha256"] == source_cell["expected_output_sha256"], f"expected source:{index}")
        require(atom["source_record_refs"] == refs(records), f"source refs:{index}")
        require(cell["atom_ids"] == [atom_id] and cell["final_atom_id"] == atom_id and cell["index"] == source_cell["index"] == index + 54 and cell["source_cell_id"] == cell_id, f"cell identity:{index}")
        require(cell["coverage"] == coverage(atom_id), f"coverage:{index}")
        require(cell["expected_output_utf8"] == source_cell["expected_output_utf8"] and cell["expected_output_utf8_bytes"] == source_cell["expected_output_bytes"] and cell["expected_output_utf8_sha256"] == source_cell["expected_output_sha256"], f"cell expected:{index}")
        require(cell["render_utf8_bytes"] == source_cell["render_utf8_bytes"] and cell["render_utf8_sha256"] == source_cell["render_utf8_sha256"], f"render identity:{index}")
        raw_context_bytes = raw_context.encode()
        require(cell["source_context_utf8_bytes"] == len(raw_context_bytes) and cell["source_context_utf8_sha256"] == hashlib.sha256(raw_context_bytes).hexdigest(), f"context identity:{index}")
        require(atom["prompt_utf8"] != source_cell["render_utf8"] and atom["prompt_utf8_bytes"] < source_cell["render_utf8_bytes"], f"no legacy render:{index}")
        max_prompt = max(max_prompt, atom["prompt_utf8_bytes"])
        max_evidence = max(max_evidence, atom["evidence_slice_utf8_bytes"])
    require(max_prompt == 509 and max_evidence == 212, "maxima")
    require(manifest["unresolved"][-1] == "Qualification remains 0/2.", "qualification unresolved")
    return {"atom_count": 4, "cell_count": 4, "max_evidence": max_evidence, "max_prompt": max_prompt}


def check_path(path: Path) -> tuple[dict[str, Any], dict[str, int]]:
    raw, manifest = load_json(path)
    require(raw == canon(manifest), "canonical manifest")
    require(stat.S_IMODE(path.stat().st_mode) == 0o644, "manifest mode")
    return manifest, check_obj(manifest, path)


def mutations() -> list[tuple[str, Callable[[dict[str, Any]], None]]]:
    return [
        ("status", lambda v: v.__setitem__("status", "PASS")), ("authority", lambda v: v["authority"].__setitem__("subject_launch", True)), ("credit", lambda v: v["authority"].__setitem__("qualification_credit", 1)), ("limit", lambda v: v["limits"].__setitem__("scored_subject_max_utf8_bytes", 4096)), ("source", lambda v: v["source_binding"].__setitem__("sha256", "0" * 64)), ("contract", lambda v: v["contract_bindings"][0].__setitem__("bytes", 1)), ("review", lambda v: v["semantic_review"].__setitem__("status", "PASS")), ("review-count", lambda v: v["semantic_review"].__setitem__("review_unit_count", 1)), ("drop-atom", lambda v: v["atoms"].pop()), ("drop-cell", lambda v: v["cells"].pop()), ("atom-id", lambda v: v["atoms"][0].__setitem__("atom_id", "wrong")), ("atom-index", lambda v: v["atoms"][1].__setitem__("atom_index", 0)), ("atom-count", lambda v: v["atoms"][0].__setitem__("atom_count", 2)), ("dependency", lambda v: v["atoms"][0]["dependency_atom_ids"].append("other")), ("objective", lambda v: v["atoms"][0].__setitem__("goal_objective_utf8", "compound")), ("evidence", lambda v: v["atoms"][0].__setitem__("evidence_slice_utf8", "{}")), ("evidence-sha", lambda v: v["atoms"][0].__setitem__("evidence_slice_utf8_sha256", "0" * 64)), ("prompt", lambda v: v["atoms"][0].__setitem__("prompt_utf8", v["atoms"][0]["prompt_utf8"] + " Explain.")), ("prompt-bytes", lambda v: v["atoms"][0].__setitem__("prompt_utf8_bytes", 513)), ("prompt-sha", lambda v: v["atoms"][0].__setitem__("prompt_utf8_sha256", "f" * 64)), ("expected", lambda v: v["atoms"][0].__setitem__("expected_output_utf8", '{"preserve_boundary":null}')), ("source-ref", lambda v: v["atoms"][0]["source_record_refs"][0].__setitem__("source_sha256", "0" * 64)), ("coverage", lambda v: v["cells"][0]["coverage"].pop()), ("context-sha", lambda v: v["cells"][0].__setitem__("source_context_utf8_sha256", "0" * 64)), ("root-extra", lambda v: v.__setitem__("extra", True)),
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
    sys.stdout.buffer.write(canon({"atom_count": stats["atom_count"], "cell_count": stats["cell_count"], "first_mismatch": None, "max_evidence_slice_utf8_bytes": stats["max_evidence"], "max_prompt_utf8_bytes": stats["max_prompt"], "mode": "mutation-self-test" if args.mutation_self_test else "check", "mutation_count": count, "schema_id": "pw-r9-goal-mode-omp-s10-tension-atom-manifest-check-v1", "semantic_fact_review_status": "PENDING", "status": "PASS", "subject_calls": 0, "workspace_writes": 0}))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Invalid as exc:
        sys.stdout.buffer.write(canon({"first_mismatch": str(exc), "schema_id": "pw-r9-goal-mode-omp-s10-tension-atom-manifest-check-v1", "semantic_fact_review_status": "PENDING", "status": "FAIL", "subject_calls": 0, "workspace_writes": 0}))
        raise SystemExit(1)
