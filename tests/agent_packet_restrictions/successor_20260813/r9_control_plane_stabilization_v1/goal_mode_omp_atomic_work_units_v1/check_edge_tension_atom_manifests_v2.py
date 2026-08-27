#!/usr/bin/env python3
from __future__ import annotations

import argparse
import copy
import sys
from pathlib import Path
from typing import Any, Callable

import check_s10_edge_atom_manifest_v1 as edge_v1
import check_s10_tension_atom_manifest_v1 as tension_v1


FAILURE = {"bytes": 2603, "mode": "0644", "path": "r9_goal_mode_omp_edge_tension_v1_contract_failure_receipt.json", "sha256": "96f81b87cfae1494746be0f0f6001b65864a756c9975e28da05de22539bb4fda"}
LINEAGE = {"disposition": "V1_PRESERVED_AS_FAILED_DIAGNOSTIC_ONLY", "failure_receipt": FAILURE, "replacement_scope": "ONLY_REPLACE_NONALLOWLIST_OPERATION_KIND"}
ALLOWED = {"CHOOSE_ONE_FROM_ONE_CLOSED_OPTION_SET", "CLASSIFY_ONE_ITEM_ON_ONE_AXIS", "EXTRACT_ONE_VALUE", "TRANSFORM_ONE_VALUE_TO_ONE_CLOSED_SCHEMA", "VERIFY_ONE_CLAIM"}


def config(kind: str) -> dict[str, Any]:
    if kind == "edge":
        return {"module": edge_v1, "artifact": "PW-R9-GOAL-MODE-OMP-S10-EDGE-ATOM-MANIFEST-V2", "schema": "pw-r9-goal-mode-omp-s10-edge-atom-manifest-v2", "status": "S10_EDGE_SHARD_V2_PREDECLARED_ZERO_CREDIT_NO_LAUNCH_PENDING_INDEPENDENT_FACT_REVIEW", "operation": "VERIFY_ONE_CLAIM", "v1_operation": "JUDGE_ONE_EDGE_SUPPORT", "v1_artifact": "PW-R9-GOAL-MODE-OMP-S10-EDGE-ATOM-MANIFEST-V1", "v1_schema": edge_v1.SCHEMA, "v1_status": edge_v1.STATUS}
    if kind == "tension":
        return {"module": tension_v1, "artifact": "PW-R9-GOAL-MODE-OMP-S10-TENSION-ATOM-MANIFEST-V2", "schema": "pw-r9-goal-mode-omp-s10-tension-atom-manifest-v2", "status": "S10_TENSION_SHARD_V2_PREDECLARED_ZERO_CREDIT_NO_LAUNCH_PENDING_INDEPENDENT_FACT_REVIEW", "operation": "CLASSIFY_ONE_ITEM_ON_ONE_AXIS", "v1_operation": "DECIDE_ONE_BOUNDARY_PRESERVATION", "v1_artifact": "PW-R9-GOAL-MODE-OMP-S10-TENSION-ATOM-MANIFEST-V1", "v1_schema": tension_v1.SCHEMA, "v1_status": tension_v1.STATUS}
    raise edge_v1.Invalid("kind")


def check_obj(value: dict[str, Any], path: Path, kind: str) -> dict[str, int]:
    cfg = config(kind)
    module = cfg["module"]
    edge_v1.exact_keys(value, set(module.ROOT_KEYS) | {"lineage"}, "root-v2")
    edge_v1.require(value["artifact_id"] == cfg["artifact"] and value["schema_id"] == cfg["schema"] and value["status"] == cfg["status"], "v2 identity")
    edge_v1.require(value["lineage"] == LINEAGE, "lineage")
    edge_v1.require(value["contract_bindings"] == [*module.CONTRACTS, FAILURE], "contracts-v2")
    edge_v1.require(value["unresolved"][0] == "Rejected V1 remains immutable diagnostic evidence and grants no authority.", "unresolved lineage")
    edge_v1.require(all(atom["operation_kind"] == cfg["operation"] and atom["operation_kind"] in ALLOWED for atom in value["atoms"]), "operation allowlist")
    projected = copy.deepcopy(value)
    projected.pop("lineage")
    projected["artifact_id"] = cfg["v1_artifact"]
    projected["schema_id"] = cfg["v1_schema"]
    projected["status"] = cfg["v1_status"]
    projected["contract_bindings"] = projected["contract_bindings"][:-1]
    projected["unresolved"] = projected["unresolved"][1:]
    for atom in projected["atoms"]:
        atom["operation_kind"] = cfg["v1_operation"]
    return module.check_obj(projected, path)


def check_path(path: Path, kind: str) -> tuple[dict[str, Any], dict[str, int]]:
    raw, value = edge_v1.load_json(path)
    edge_v1.require(raw == edge_v1.canon(value), "canonical manifest")
    edge_v1.require((path.stat().st_mode & 0o777) == 0o644, "manifest mode")
    return value, check_obj(value, path, kind)


def mutations(kind: str) -> list[tuple[str, Callable[[dict[str, Any]], None]]]:
    cfg = config(kind)
    return [
        ("lineage", lambda v: v["lineage"].__setitem__("disposition", "PASS")),
        ("operation", lambda v: v["atoms"][0].__setitem__("operation_kind", cfg["v1_operation"])),
        ("v1-binding", lambda v: v["contract_bindings"][-1].__setitem__("sha256", "0" * 64)),
        ("unresolved-lineage", lambda v: v["unresolved"].pop(0)),
        *cfg["module"].mutations(),
    ]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--kind", choices=("edge", "tension"), required=True)
    parser.add_argument("--manifest", required=True)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true")
    mode.add_argument("--mutation-self-test", action="store_true")
    args = parser.parse_args()
    path = Path(args.manifest)
    edge_v1.require(path.is_absolute(), "manifest must be absolute")
    manifest, stats = check_path(path, args.kind)
    count = 0
    if args.mutation_self_test:
        for name, mutate in mutations(args.kind):
            candidate = copy.deepcopy(manifest)
            mutate(candidate)
            try:
                check_obj(candidate, path, args.kind)
            except edge_v1.Invalid:
                count += 1
            else:
                raise edge_v1.Invalid(f"mutation accepted:{name}")
    sys.stdout.buffer.write(edge_v1.canon({"atom_count": stats["atom_count"], "cell_count": stats["cell_count"], "first_mismatch": None, "kind": args.kind, "max_evidence_slice_utf8_bytes": stats["max_evidence"], "max_prompt_utf8_bytes": stats["max_prompt"], "mode": "mutation-self-test" if args.mutation_self_test else "check", "mutation_count": count, "schema_id": "pw-r9-goal-mode-omp-edge-tension-atom-manifest-check-v2", "semantic_fact_review_status": "PENDING", "status": "PASS", "subject_calls": 0, "workspace_writes": 0}))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except edge_v1.Invalid as exc:
        sys.stdout.buffer.write(edge_v1.canon({"first_mismatch": str(exc), "schema_id": "pw-r9-goal-mode-omp-edge-tension-atom-manifest-check-v2", "semantic_fact_review_status": "PENDING", "status": "FAIL", "subject_calls": 0, "workspace_writes": 0}))
        raise SystemExit(1)
