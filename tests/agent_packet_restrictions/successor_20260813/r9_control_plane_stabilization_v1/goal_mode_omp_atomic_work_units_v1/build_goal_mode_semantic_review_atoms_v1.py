#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import stat
from pathlib import Path
from typing import Any

from build_s10_edge_atom_manifest_v1 import canon, write_exclusive


AGGREGATE = {"bytes": 95207, "mode": "0644", "path": "goal_mode_atomic_aggregate_manifest_v1.json", "sha256": "c4f14429cd4562c786fb076825d4c963a9350b4ea5800bfb1994314a24e5ed5d"}
AGGREGATE_RECEIPT = {"bytes": 2442, "mode": "0644", "path": "r9_goal_mode_omp_atomic_aggregate_mechanical_receipt_v1.json", "sha256": "e1db6e5db9d5b4c26d930d1e31a821b5ecc0f9ceb59c93988827822434b0dbb0"}
SHARDS = [
    {"bytes": 127745, "mode": "0644", "path": "s10_decision_atom_manifest_v1.json", "sha256": "607cb329be483ee824baf918fcd2d35395dda4f7460ab2b7c394c84248436c2b"},
    {"bytes": 64831, "mode": "0644", "path": "s10_edge_atom_manifest_v2.json", "sha256": "9d3f9bdfc5d5c64cad102ddc74af04d3d963c8bd6e142dff359750c72d2fc15a"},
    {"bytes": 18246, "mode": "0644", "path": "s10_tension_atom_manifest_v2.json", "sha256": "5c3c9c89250574b310e6e8d5daaff0a7fbd592a6935725c8895f2eb0402d0048"},
    {"bytes": 123246, "mode": "0644", "path": "s30_decision_atom_manifest_v2.json", "sha256": "a3675b4273b9e638f79a33fc81f8fc49da5ef0f3294e316bcf7cbcbe2e680c48"},
    {"bytes": 41173, "mode": "0644", "path": "terminal_atom_manifest_v5.json", "sha256": "ba679f86b128c5079b6868695a8a809e56750cdc234281e348fe9c5daa6ae055"},
]
LIMITS = {"acceptance_criterion_max_utf8_bytes": 256, "evidence_slice_max_utf8_bytes": 256, "goal_objective_max_utf8_bytes": 256, "output_contract_max_utf8_bytes": 128, "prompt_max_utf8_bytes": 512}
AUTHORITY = {"bridge_install": False, "canary_launch": False, "headless_handoff": False, "independent_review_complete": False, "matrix_launch": False, "omp_process_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0, "subject_launch": False}
OUTPUT = '"PASS" or {"first_mismatch":"<brief>"}'
ATOM_GOAL = "Verify one atom output is exactly supported by its one compact fact slice."
ATOM_CRITERION = "PASS only if Out exactly follows Facts for the one named operation."
REDUCER_GOAL = "Verify one reducer uses all declared components deterministically with no model step."
REDUCER_CRITERION = "PASS only if the reducer is closed, deterministic, complete, and model-free."


def ident(text: str) -> tuple[int, str]:
    raw = text.encode()
    return len(raw), hashlib.sha256(raw).hexdigest()


def load_bound(base: Path, binding: dict[str, Any]) -> dict[str, Any]:
    path = (base / binding["path"]).resolve()
    raw = path.read_bytes()
    if len(raw) != binding["bytes"] or hashlib.sha256(raw).hexdigest() != binding["sha256"] or stat.S_IMODE(path.stat().st_mode) != int(binding["mode"], 8):
        raise ValueError(f"binding:{binding['path']}")
    value = json.loads(raw)
    if raw != canon(value):
        raise ValueError(f"canonical:{binding['path']}")
    return value


def atom_review(source: dict[str, Any], manifest_path: str, index: int) -> dict[str, Any]:
    evidence = source["evidence_slice_utf8"]
    prompt = f"Op:{source['operation_kind']}\nAim:{source['objective']}\nFacts:{evidence}\nOut:{source['expected_output_utf8']}\nIs Out exactly supported? Return {OUTPUT}. Complete Goal."
    criterion_bytes, criterion_sha = ident(ATOM_CRITERION)
    evidence_bytes, evidence_sha = ident(evidence)
    goal_bytes, goal_sha = ident(ATOM_GOAL)
    output_bytes, output_sha = ident(OUTPUT)
    prompt_bytes, prompt_sha = ident(prompt)
    return {"acceptance_criterion_utf8": ATOM_CRITERION, "acceptance_criterion_utf8_bytes": criterion_bytes, "acceptance_criterion_utf8_sha256": criterion_sha, "atom_id": f"semantic-review:{source['atom_id']}", "atom_index": index, "dependency_atom_ids": [], "evidence_slice_utf8": evidence, "evidence_slice_utf8_bytes": evidence_bytes, "evidence_slice_utf8_sha256": evidence_sha, "goal_objective_utf8": ATOM_GOAL, "goal_objective_utf8_bytes": goal_bytes, "goal_objective_utf8_sha256": goal_sha, "operation": "VERIFY_ONE_CLAIM", "operation_count": 1, "output_contract_utf8": OUTPUT, "output_contract_utf8_bytes": output_bytes, "output_contract_utf8_sha256": output_sha, "prompt_utf8": prompt, "prompt_utf8_bytes": prompt_bytes, "prompt_utf8_sha256": prompt_sha, "review_kind": "ATOM_FACT_OUTPUT", "source_projection": {"manifest_path": manifest_path, "source_atom_id": source["atom_id"], "source_expected_output_utf8_bytes": source["expected_output_utf8_bytes"], "source_expected_output_utf8_sha256": source["expected_output_utf8_sha256"], "source_prompt_utf8_bytes": source["prompt_utf8_bytes"], "source_prompt_utf8_sha256": source["prompt_utf8_sha256"]}, "status": "PREDECLARED_NOT_EXECUTED"}


def reducer_review(reducer: dict[str, Any], cell: dict[str, Any], manifest_path: str, index: int) -> dict[str, Any]:
    reducer_raw = json.dumps(reducer, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
    component_count = len(reducer.get("edge_rows", [])) or 1
    evidence = json.dumps({"components": component_count, "expected_sha256": cell["expected_output_utf8_sha256"], "model_steps": 0, "recipe_sha256": hashlib.sha256(reducer_raw).hexdigest(), "serialize": "field_order_minified_no_lf"}, sort_keys=True, separators=(",", ":"))
    prompt = f"Reducer:{evidence}\nDoes it use all components deterministically with no model step? Return {OUTPUT}. Complete Goal."
    criterion_bytes, criterion_sha = ident(REDUCER_CRITERION)
    evidence_bytes, evidence_sha = ident(evidence)
    goal_bytes, goal_sha = ident(REDUCER_GOAL)
    output_bytes, output_sha = ident(OUTPUT)
    prompt_bytes, prompt_sha = ident(prompt)
    return {"acceptance_criterion_utf8": REDUCER_CRITERION, "acceptance_criterion_utf8_bytes": criterion_bytes, "acceptance_criterion_utf8_sha256": criterion_sha, "atom_id": f"semantic-review:reducer:{reducer['reducer_id']}", "atom_index": index, "dependency_atom_ids": [], "evidence_slice_utf8": evidence, "evidence_slice_utf8_bytes": evidence_bytes, "evidence_slice_utf8_sha256": evidence_sha, "goal_objective_utf8": REDUCER_GOAL, "goal_objective_utf8_bytes": goal_bytes, "goal_objective_utf8_sha256": goal_sha, "operation": "VERIFY_ONE_CLAIM", "operation_count": 1, "output_contract_utf8": OUTPUT, "output_contract_utf8_bytes": output_bytes, "output_contract_utf8_sha256": output_sha, "prompt_utf8": prompt, "prompt_utf8_bytes": prompt_bytes, "prompt_utf8_sha256": prompt_sha, "review_kind": "DETERMINISTIC_REDUCER_POLICY", "source_projection": {"cell_id": cell["source_cell_id"], "component_atom_ids": cell["atom_ids"], "manifest_path": manifest_path, "reducer_id": reducer["reducer_id"], "reducer_utf8_bytes": len(reducer_raw), "reducer_utf8_sha256": hashlib.sha256(reducer_raw).hexdigest()}, "status": "PREDECLARED_NOT_EXECUTED"}


def construct(base: Path) -> dict[str, Any]:
    aggregate = load_bound(base, AGGREGATE)
    load_bound(base, AGGREGATE_RECEIPT)
    manifests = [load_bound(base, binding) for binding in SHARDS]
    if aggregate["shard_bindings"] != SHARDS:
        raise ValueError("aggregate shard set")
    by_path = {binding["path"]: manifest for binding, manifest in zip(SHARDS, manifests, strict=True)}
    source_atoms = {atom["atom_id"]: (binding["path"], atom) for binding, manifest in zip(SHARDS, manifests, strict=True) for atom in manifest["atoms"]}
    reviews: list[dict[str, Any]] = []
    for source_index in aggregate["atom_index"]:
        manifest_path, source = source_atoms[source_index["atom_id"]]
        reviews.append(atom_review(source, manifest_path, len(reviews)))
    terminal = by_path["terminal_atom_manifest_v5.json"]
    cells = {cell["source_cell_id"]: cell for cell in terminal["cells"]}
    for reducer in terminal["deterministic_reducers"]:
        reviews.append(reducer_review(reducer, cells[reducer["cell_id"]], "terminal_atom_manifest_v5.json", len(reviews)))
    maxima = {"acceptance_criterion_utf8_bytes": max(review["acceptance_criterion_utf8_bytes"] for review in reviews), "evidence_slice_utf8_bytes": max(review["evidence_slice_utf8_bytes"] for review in reviews), "goal_objective_utf8_bytes": max(review["goal_objective_utf8_bytes"] for review in reviews), "output_contract_utf8_bytes": max(review["output_contract_utf8_bytes"] for review in reviews), "prompt_utf8_bytes": max(review["prompt_utf8_bytes"] for review in reviews)}
    if maxima["acceptance_criterion_utf8_bytes"] > 256 or maxima["evidence_slice_utf8_bytes"] > 256 or maxima["goal_objective_utf8_bytes"] > 256 or maxima["output_contract_utf8_bytes"] > 128 or maxima["prompt_utf8_bytes"] > 512:
        raise ValueError("review limit")
    return {
        "artifact_id": "PW-R9-GOAL-MODE-OMP-ATOMIC-SEMANTIC-REVIEW-MANIFEST-V1",
        "atoms": reviews,
        "authority": AUTHORITY,
        "bindings": [AGGREGATE, AGGREGATE_RECEIPT, *SHARDS],
        "limits": LIMITS,
        "observed_maxima": maxima,
        "policy": {"every_review_has_one_acceptance_criterion": True, "every_review_has_one_evidence_slice": True, "every_review_has_one_fresh_native_goal": True, "every_review_has_one_operation": True, "every_review_has_one_output_contract": True, "every_review_has_one_subject_prompt": True, "no_review_prompt_before_native_goal_activation": True, "no_reviewer_receives_full_suite": True, "reviewer_task_and_goal_reuse_forbidden": True},
        "reducer_policy": {"create_only_after_all_108_terminal_receipts": True, "fail_cannot_be_reinterpreted": True, "input_only_compact_review_outputs": True, "reducer_predeclared_now": False},
        "schema_id": "pw-r9-goal-mode-omp-atomic-semantic-review-manifest-v1",
        "status": "PREDECLARED_108_BITE_SIZE_GOAL_REVIEW_ATOMS_NOT_EXECUTED_ZERO_CREDIT_NO_LAUNCH",
        "summary": {"atom_fact_output_review_count": 104, "deterministic_reducer_policy_review_count": 4, "prompt_hash_count": len({review["prompt_utf8_sha256"] for review in reviews}), "review_count": len(reviews)},
        "unresolved": ["No semantic review atom has executed.", "The existing Windows OMP no-subject Goal-Mode handshake response is absent.", "No bridge install or same-owner headless handoff is authorized.", "No canary or matrix launch is authorized.", "Qualification remains 0/2."],
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    args = parser.parse_args()
    output = Path(args.output)
    if not output.is_absolute():
        raise ValueError("output must be absolute")
    value = construct(Path(__file__).resolve().parent)
    raw = canon(value)
    write_exclusive(output, raw)
    print(json.dumps({"bytes": len(raw), "max_prompt_utf8_bytes": value["observed_maxima"]["prompt_utf8_bytes"], "review_count": len(value["atoms"]), "sha256": hashlib.sha256(raw).hexdigest(), "status": "CREATED", "subject_calls": 0}, sort_keys=True, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(json.dumps({"error": str(exc), "status": "FAIL", "subject_calls": 0}, sort_keys=True, separators=(",", ":")))
        raise SystemExit(1)
