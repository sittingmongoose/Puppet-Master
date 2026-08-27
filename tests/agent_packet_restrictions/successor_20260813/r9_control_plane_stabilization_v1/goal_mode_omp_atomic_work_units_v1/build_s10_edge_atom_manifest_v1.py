#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
from typing import Any


SOURCE = {
    "bytes": 786546,
    "cell_count": 97,
    "mode": "0644",
    "path": "../formal_candidate_v7/semantic_bundle.json",
    "sha256": "11139c2b52a2fe900f2976a34f7712d8f05d5b2991ce8cc26d5cfc4e1ef871c2",
}
CONTRACTS = [
    {"bytes": 11734, "mode": "0644", "path": "../r9_goal_mode_omp_atomic_work_unit_impact_assessment_v1.json", "sha256": "97ad72ec500cc674d0b2adbec21de878420fa49b28350542d04fe29be20d0a7c"},
    {"bytes": 14725, "mode": "0644", "path": "atom_manifest_sample_v1.json", "sha256": "612949e463dea937637f4d0c0e3f60e3ee351f74504f66743fa2b4a3e3676b5e"},
    {"bytes": 7845, "mode": "0644", "path": "../goal_mode_omp_headless_bridge_v1/bridge_contract_v3.json", "sha256": "6d94cfd2b1d2ffba621b6249fe2c4b8a831b3a774e388a8132f0588c7dc401d6"},
    {"bytes": 127745, "mode": "0644", "path": "s10_decision_atom_manifest_v1.json", "sha256": "607cb329be483ee824baf918fcd2d35395dda4f7460ab2b7c394c84248436c2b"},
    {"bytes": 2776, "mode": "0644", "path": "r9_goal_mode_omp_s10_decision_atom_manifest_mechanical_receipt_v1.json", "sha256": "d5f19a048d4143a1624a9faa4eb16ec2afe851eec8199c7ddfa4ce414e4a1764"},
    {"bytes": 122167, "mode": "0644", "path": "s30_decision_atom_manifest_v1.json", "sha256": "9139a5ed0c444a5190280660774af595f6cda51935deddeea100a8c3f5294d1e"},
    {"bytes": 3710, "mode": "0644", "path": "r9_goal_mode_omp_s30_decision_atom_manifest_mechanical_receipt_v1.json", "sha256": "6f47885bfa240ff7596ce79f668127985d47d37d67ccfd0da6aeadb0272d0b46"},
]
FACTS = {
    "S10A_EDGE_A-E07": "BSD is always read-only and Off is an explicit user choice; Explorer is subagent-only, not a required direct persona.",
    "S10A_EDGE_A-E01": "Ledger records are source lineage, not canonical product prose; pending ledger decisions have no greater authority.",
    "S10A_EDGE_A-E04": "Explorer and Bash are subagent personas; eligible work routes to a child run without switching the direct persona.",
    "S10A_EDGE_A-E08": "Pending ledger state is lineage only and cannot override the canonical ledger authority boundary.",
    "S10A_EDGE_A-E02": "Context admission selects permitted sources before retention; ContextReceipt is emitted later as explanatory evidence.",
    "S10A_EDGE_A-E05": "Weak-worker outputs are proposal-only and cannot certify completion; pending ledger design remains uncompiled lineage.",
    "S10A_EDGE_A-E03": "ContextReceipt explains assembly and is not dispatch admission; dispatch binds exact provider bytes and controls.",
    "S10A_EDGE_A-E06": "BSD is a read-only frequency policy and cannot grant tools or provider-dispatch authority.",
    "S10B_EDGE_B-E03": "After required topics are Ready, fresh integration builds the Final Plan Pack; a separate final specialist audit follows.",
    "S10B_EDGE_B-E09": "Ledger counts describe lineage state; Plan Compile requires an immutable approved Plan Pack plus frozen indexes.",
    "S10B_EDGE_B-E01": "A topic becomes Ready only after conversion, audit, repair, and fresh re-audit pass.",
    "S10B_EDGE_B-E07": "Planning creates no runtime WorkNodes, and indexing stops at indexes and readiness without runtime nodes.",
    "S10B_EDGE_B-E10": "Static materialization proves structural contract presence only; buildability needs executed evidence.",
    "S10B_EDGE_B-E02": "Fresh global integration begins only after every required topic is Ready.",
    "S10B_EDGE_B-E08": "Clean-room fixtures are static targets, and materialized contracts are not executed test evidence.",
    "S10B_EDGE_B-E04": "Stable finding identity, evidence, closure, and reopen state determine whether audit ends closed, warned, or blocked.",
    "S10B_EDGE_B-E06": "Approval and Plan Compile stay disabled while buildability is unproven; compile requires an approved Plan Pack.",
    "S10B_EDGE_B-E05": "Read-only specialists inspect and propose; only the controller or assigned owner performs canonical writes.",
}
LIMITS = {
    "evidence_slice_max_utf8_bytes": 256,
    "goal_objective_max_utf8_bytes": 256,
    "output_contract_max_utf8_bytes": 128,
    "scored_subject_max_utf8_bytes": 512,
}
OBJECTIVE = "Judge one edge using one compact evidence fact."
CRITERION = "The verdict must exactly state whether the supplied fact supports the edge."
OUTPUT_SCHEMA = '{"verdict":"supported or unsupported"}'


class Invalid(Exception):
    pass


def require(condition: bool, message: str) -> None:
    if not condition:
        raise Invalid(message)


def canon(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8") + b"\n"


def ident(value: str) -> dict[str, Any]:
    raw = value.encode("utf-8")
    return {"bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest()}


def refs(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "authority": record["authority"],
            "path": record["path"],
            "source_record_id": record["source_record_id"],
            "source_sha256": record["source_sha256"],
            "span": f"{record['start_line']}-{record['end_line']}",
        }
        for record in records
    ]


def coverage(atom_id: str) -> list[dict[str, Any]]:
    return [
        {"atom_ids": [], "classification": "SHARED_NON_SUBJECT_CONTROL", "element_id": "CONTROL", "note": "Isolation, Goal lifecycle, hidden-candidate, no-tool, formatting, authority, and no-reuse rules belong to the bridge and verifier."},
        {"atom_ids": [atom_id], "classification": "SUBJECT_MATERIAL", "element_id": "EDGE_CANDIDATE"},
        {"atom_ids": [atom_id], "classification": "SUBJECT_MATERIAL", "element_id": "EVIDENCE"},
        {"atom_ids": [atom_id], "classification": "SUBJECT_MATERIAL", "element_id": "OUTPUT_CONTRACT"},
    ]


def extract_context(cell: dict[str, Any]) -> tuple[str, dict[str, Any]]:
    text = cell["render_utf8"]
    begin = "BEGIN_SINGLE_EDGE_CONTEXT\n"
    end = "\nEND_SINGLE_EDGE_CONTEXT"
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
    source_cells = source["cells"][36:54]
    require([cell["cell"] for cell in source_cells] == list(FACTS), "fact order")
    atoms: list[dict[str, Any]] = []
    cells: list[dict[str, Any]] = []
    for atom_index, source_cell in enumerate(source_cells):
        cell_id = source_cell["cell"]
        atom_id = f"edge:{cell_id}:atom-000"
        context_raw, context = extract_context(source_cell)
        records = context["source_records"]
        authorities = {record["authority"] for record in records}
        evidence = json.dumps(
            {
                "authority": next(iter(authorities)) if len(authorities) == 1 else "mixed",
                "fact": FACTS[cell_id],
                "source_record_ids": [record["source_record_id"] for record in records],
            },
            ensure_ascii=False,
            sort_keys=True,
            separators=(",", ":"),
        )
        candidate = context["edge_candidate"]["candidate"]
        prompt = f"E: {evidence}\nEdge: {candidate}\nReturn only {OUTPUT_SCHEMA}. Then mark the active Goal complete."
        expected = source_cell["expected_output_utf8"]
        objective_ident = ident(OBJECTIVE)
        evidence_ident = ident(evidence)
        prompt_ident = ident(prompt)
        expected_ident = ident(expected)
        require(evidence_ident["bytes"] <= LIMITS["evidence_slice_max_utf8_bytes"], f"evidence limit:{cell_id}")
        require(prompt_ident["bytes"] <= LIMITS["scored_subject_max_utf8_bytes"], f"prompt limit:{cell_id}")
        require(expected_ident["bytes"] <= LIMITS["output_contract_max_utf8_bytes"], f"output limit:{cell_id}")
        atoms.append(
            {
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
                "non_goals": ["explain the verdict", "inspect another edge", "reconstruct the hidden candidate"],
                "objective": f"Judge only edge {context['edge_candidate']['id']} from one compact fact.",
                "operation_kind": "JUDGE_ONE_EDGE_SUPPORT",
                "prompt_utf8": prompt,
                "prompt_utf8_bytes": prompt_ident["bytes"],
                "prompt_utf8_sha256": prompt_ident["sha256"],
                "source_cell_id": cell_id,
                "source_record_refs": refs(records),
            }
        )
        context_ident = ident(context_raw)
        cells.append(
            {
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
            }
        )
    return {
        "artifact_id": "PW-R9-GOAL-MODE-OMP-S10-EDGE-ATOM-MANIFEST-V1",
        "atoms": atoms,
        "authority": {"bridge_install": False, "canary_launch": False, "full_manifest_complete": False, "matrix_launch": False, "omp_process_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0, "review_atom_launch": False, "subject_launch": False},
        "cells": cells,
        "contract_bindings": CONTRACTS,
        "limits": LIMITS,
        "reconstruction": {"cell_count": 18, "final_atom_count": 18, "rule": "Each edge cell result is the exact verified output of its own sole final atom; no decision-result reuse, synthesis, or hidden-candidate access is permitted."},
        "schema_id": "pw-r9-goal-mode-omp-s10-edge-atom-manifest-v1",
        "semantic_review": {"mechanical_checker_can_certify": False, "required_before_runtime": True, "review_unit_count": 18, "rule": "Each compact fact is reviewed against only its cited frozen source record in a separate fresh native Goal; no reviewer receives the full shard.", "status": "PENDING"},
        "shard": {"cell_index_first": 36, "cell_index_last": 53, "cell_type": "S10_SINGLE_EDGE", "full_legacy_cell_count": 97, "shard_id": "S10_EDGES_036_053", "shard_status": "COMPLETE_PENDING_INDEPENDENT_FACT_REVIEW", "source_cell_count": 18},
        "source_binding": SOURCE,
        "status": "S10_EDGE_SHARD_PREDECLARED_ZERO_CREDIT_NO_LAUNCH_PENDING_INDEPENDENT_FACT_REVIEW",
        "unresolved": ["The 8 tension/integration/specialist source cells are not yet atomized.", "The 18 compact evidence facts require independent per-fact semantic review.", "No atom has executed in native Goal Mode.", "No bridge install, OMP handoff, canary, or matrix launch is authorized.", "Qualification remains 0/2."],
    }


def write_exclusive(path: Path, raw: bytes) -> None:
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0), 0o644)
    try:
        offset = 0
        while offset < len(raw):
            offset += os.write(fd, raw[offset:])
        os.fsync(fd)
    finally:
        os.close(fd)
    require(path.read_bytes() == raw, "output reopen")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    output = Path(args.output)
    require(output.is_absolute(), "output must be absolute")
    value = construct(Path(__file__).resolve().parent)
    raw = canon(value)
    write_exclusive(output, raw)
    summary = {
        "atom_count": len(value["atoms"]),
        "bytes": len(raw),
        "max_evidence_slice_utf8_bytes": max(atom["evidence_slice_utf8_bytes"] for atom in value["atoms"]),
        "max_prompt_utf8_bytes": max(atom["prompt_utf8_bytes"] for atom in value["atoms"]),
        "sha256": hashlib.sha256(raw).hexdigest(),
        "status": "CREATED",
        "subject_calls": 0,
    }
    print(json.dumps(summary, sort_keys=True, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (Invalid, OSError, ValueError, KeyError, TypeError) as exc:
        print(json.dumps({"error": str(exc), "status": "FAIL", "subject_calls": 0}, sort_keys=True, separators=(",", ":")))
        raise SystemExit(1)
