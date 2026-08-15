#!/usr/bin/env python3
from __future__ import annotations

import argparse
import ast
import hashlib
import importlib.util
import json
import os
import re
import stat
import sys
from copy import deepcopy
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent
SUCCESSOR = ROOT.parent
ID = "PW-R6-DECOMPOSED-20260814.7"
CHAIN = ("S10A", "S10B", "S20A", "S20B", "S30A", "S30B", "S40A", "S40B", "S45A", "S45B", "S50", "S55", "S60P", "S60C", "S60K", "S70", "S80")


class Invalid(Exception):
    pass


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def dump(obj: Any) -> bytes:
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def strict_json(data: bytes, label: str) -> Any:
    def pairs(items: list[tuple[str, Any]]) -> dict[str, Any]:
        out: dict[str, Any] = {}
        for key, value in items:
            if key in out:
                raise Invalid(f"{label}: duplicate key {key!r}")
            out[key] = value
        return out
    try:
        return json.loads(data.decode("utf-8"), object_pairs_hook=pairs)
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise Invalid(f"{label}: invalid JSON: {exc}") from exc


def regular(path: Path) -> Path:
    resolved = path.resolve()
    if resolved != SUCCESSOR and SUCCESSOR not in resolved.parents:
        raise Invalid(f"path outside successor test root: {resolved}")
    mode = os.lstat(resolved).st_mode
    if stat.S_ISLNK(mode) or not stat.S_ISREG(mode):
        raise Invalid(f"input is not a regular nonlink: {resolved}")
    return resolved


def read_storage(path: Path, label: str) -> bytes:
    try:
        return regular(path).read_bytes()
    except OSError as exc:
        raise Invalid(f"{label}: unreadable: {exc}") from exc


def read_payload(path: Path, label: str) -> tuple[bytes, dict[str, Any]]:
    storage = read_storage(path, label)
    if not storage.endswith(b"\n"):
        raise Invalid(f"{label}: storage lacks controller LF")
    payload = storage[:-1]
    obj = strict_json(payload, label)
    if not isinstance(obj, dict) or dump(obj) != payload:
        raise Invalid(f"{label}: payload is not canonical minified JSON")
    return payload, obj


def contract() -> dict[str, Any]:
    raw = read_storage(ROOT / "contract.json", "contract")
    obj = strict_json(raw, "contract")
    if not isinstance(obj, dict) or dump(obj) + b"\n" != raw or obj.get("protocol_id") != ID:
        raise Invalid("contract identity or canonical storage mismatch")
    return obj


def load_v6() -> Any:
    path = SUCCESSOR / "model_retest_r6_decomposed_v6/r6v6_harness.py"
    data = read_storage(path, "frozen v6 reducer")
    row = next(item for item in contract()["preserved_v6_bindings"] if item["path"].endswith("r6v6_harness.py"))
    if (sha(data), len(data)) != (row["sha256"], row["bytes"]):
        raise Invalid("frozen v6 reducer binding drift")
    spec = importlib.util.spec_from_file_location("r6v6_frozen_utility", path)
    if spec is None or spec.loader is None:
        raise Invalid("cannot load frozen v6 reducer")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def parse_inputs(values: list[str]) -> dict[str, tuple[bytes, dict[str, Any]]]:
    out: dict[str, tuple[bytes, dict[str, Any]]] = {}
    for item in values:
        if "=" not in item:
            raise Invalid(f"input lacks NAME=PATH: {item!r}")
        name, raw = item.split("=", 1)
        if name not in CHAIN or name in out:
            raise Invalid(f"unknown or duplicate input: {name!r}")
        out[name] = read_payload(Path(raw), name)
    if tuple(sorted(out, key=CHAIN.index)) != CHAIN or set(out) != set(CHAIN):
        raise Invalid("exact 17-stage chain required")
    return out


def binding(inputs: dict[str, tuple[bytes, dict[str, Any]]], stage: str, field: str, predecessor: str) -> None:
    if inputs[stage][1].get(field) != sha(inputs[predecessor][0]):
        raise Invalid(f"{stage}.{field} does not bind {predecessor}")


def validate_chain(inputs: dict[str, tuple[bytes, dict[str, Any]]]) -> dict[str, Any]:
    cfg = contract()
    if set(inputs) != set(CHAIN):
        raise Invalid("complete closed-world chain required")
    fixture_id = cfg["fixture_artifact_protocol_id"]
    for stage in CHAIN:
        payload, obj = inputs[stage]
        if dump(obj) != payload or obj.get("stage") != stage or obj.get("protocol_id") != fixture_id:
            raise Invalid(f"{stage}: canonical stage or fixture identity mismatch")
    for lane in ("A", "B"):
        binding(inputs, "S20" + lane, "base_artifact_sha256", "S10" + lane)
        binding(inputs, "S30" + lane, "candidate_artifact_sha256", "S20" + lane)
        binding(inputs, "S40" + lane, "candidate_artifact_sha256", "S20" + lane)
        binding(inputs, "S40" + lane, "audit_artifact_sha256", "S30" + lane)
        binding(inputs, "S45" + lane, "candidate_artifact_sha256", "S20" + lane)
        binding(inputs, "S45" + lane, "audit_artifact_sha256", "S30" + lane)
        binding(inputs, "S45" + lane, "patch_artifact_sha256", "S40" + lane)
        repaired = inputs["S45" + lane][1].get("repaired_payload")
        if not isinstance(repaired, dict):
            raise Invalid(f"S45{lane}: repaired payload absent")
        repaired_payload = dump(repaired)
        if inputs["S45" + lane][1].get("repaired_payload_sha256") != sha(repaired_payload) or inputs["S45" + lane][1].get("repaired_payload_bytes") != len(repaired_payload):
            raise Invalid(f"S45{lane}: repaired payload binding mismatch")
    s50 = inputs["S50"][1]
    if s50.get("topic_artifact_hashes") != {"topic_a": sha(inputs["S45A"][0]), "topic_b": sha(inputs["S45B"][0])}:
        raise Invalid("S50 topic artifact bindings mismatch")
    types = cfg["authority_value_types"]
    matrix = s50.get("authority_matrix")
    if not isinstance(matrix, list) or [row.get("id") for row in matrix] != list(types):
        raise Invalid("S50 authority matrix IDs or order mismatch")
    for row in matrix:
        value = row.get("value")
        if types[row["id"]] == "boolean" and type(value) is not bool:
            raise Invalid(f"S50 {row['id']}: boolean value required")
        if types[row["id"]] == "string" and type(value) is not str:
            raise Invalid(f"S50 {row['id']}: string value required")
    s55_payload, s55 = inputs["S55"]
    if s55.get("source_integration_sha256") != sha(inputs["S50"][0]):
        raise Invalid("S55 source integration binding mismatch")
    projected = deepcopy(s55)
    projected["stage"] = "S50"
    projected.pop("source_integration_sha256", None)
    projected_edges = projected.pop("cross_topic_edges", None)
    candidate = deepcopy(s50)
    candidate_edges = candidate.pop("cross_topic_edges", None)
    if projected != candidate or not isinstance(projected_edges, list) or not isinstance(candidate_edges, list):
        raise Invalid("S55 non-edge fields do not project exactly from S50")
    if len(projected_edges) <= len(candidate_edges) or projected_edges[:len(candidate_edges)] != candidate_edges:
        raise Invalid("S55 must append at least one uniquely identified integration candidate after the S50 edge prefix")
    ids = [edge.get("id") for edge in projected_edges if isinstance(edge, dict)]
    if len(ids) != len(projected_edges) or any(not isinstance(item, str) or not item for item in ids) or len(set(ids)) != len(ids):
        raise Invalid("S55 integration edge identities are missing or duplicated")
    v6 = load_v6()
    reducer_inputs = {name: inputs[name] for name in ("S55", "S60P", "S60C", "S60K")}
    expected_s70 = v6.reduce_s70(reducer_inputs)
    if inputs["S70"][1] != expected_s70 or inputs["S70"][0] != dump(expected_s70):
        raise Invalid("S70 does not equal the generic role/finding reducer")
    transform_inputs = dict(reducer_inputs)
    transform_inputs["S50"] = inputs["S50"]
    transform_inputs["S70"] = inputs["S70"]
    expected_s80 = v6.transform_s80(transform_inputs)
    if inputs["S80"][1] != expected_s80 or inputs["S80"][0] != dump(expected_s80):
        raise Invalid("S80 does not equal the generic test/remove transform")
    closed_topic = inputs["S80"][1].get("closed_topic_finding_ids")
    expected_closed_topic = inputs["S45A"][1].get("closed_finding_ids", []) + inputs["S45B"][1].get("closed_finding_ids", [])
    if closed_topic != expected_closed_topic:
        raise Invalid("topic finding closure mismatch")
    specialist_findings = [finding["finding_id"] for stage in ("S60P", "S60C", "S60K") for finding in inputs[stage][1].get("findings", [])]
    targets = inputs["S70"][1].get("repair_target_edge_ids")
    retained = [edge.get("id") for edge in inputs["S80"][1].get("cross_topic_edges", [])]
    if not isinstance(targets, list) or any(target in retained for target in targets):
        raise Invalid("unsupported repair target remains in S80")
    topic_count = sum(len(inputs[stage][1].get("decisions", [])) for stage in ("S10A", "S10B"))
    artifacts = [{"stage": stage, "payload_sha256": sha(inputs[stage][0]), "payload_bytes": len(inputs[stage][0])} for stage in CHAIN]
    lineage = {"protocol_id": ID, "snapshot_descriptor_sha256": cfg["frozen_snapshot_descriptor_sha256"], "artifacts": artifacts}
    return {"protocol_id": ID, "stage": "S90", "runtime_lineage_sha256": sha(dump(lineage)), "final_artifact_sha256": sha(inputs["S80"][0]), "hash_chain_valid": True, "topic_decision_count": topic_count, "closed_topic_finding_ids": closed_topic, "closed_specialist_finding_ids": specialist_findings, "unsupported_edge_absent": True, "retained_supported_edge_ids": retained, "terminal": "bounded_causal_simulation_pass", "external_audit_status": "excluded", "nonclaims": cfg["nonclaims"], "forbidden_action_violations": []}


def actual_inputs() -> dict[str, tuple[bytes, dict[str, Any]]]:
    return {stage: read_payload(SUCCESSOR / path, stage) for stage, path in contract()["actual_chain_paths"].items()}


def reserialize(inputs: dict[str, tuple[bytes, dict[str, Any]]], stage: str, obj: dict[str, Any]) -> None:
    payload = dump(obj)
    inputs[stage] = (payload, obj)


def consistent_variant(base: dict[str, tuple[bytes, dict[str, Any]]]) -> dict[str, tuple[bytes, dict[str, Any]]]:
    out = {stage: (payload, deepcopy(obj)) for stage, (payload, obj) in base.items()}
    s50 = out["S50"][1]
    original = list(reversed(s50["cross_topic_edges"]))
    renamed = []
    for pos, edge in enumerate(original):
        item = deepcopy(edge)
        item["id"] = f"CF-EDGE-{pos + 11}"
        renamed.append(item)
    s50["cross_topic_edges"] = renamed
    reserialize(out, "S50", s50)
    s55 = deepcopy(s50)
    s55["stage"] = "S55"
    s55["cross_topic_edges"].append({"id": "CF-EXTRA-91", "from": "CF-A", "to": "CF-B", "type": "counterfactual_candidate", "statement": "counterfactual unsupported candidate"})
    s55["source_integration_sha256"] = sha(out["S50"][0])
    reserialize(out, "S55", s55)
    edge_ids = [edge["id"] for edge in s55["cross_topic_edges"]]
    for pos, stage in enumerate(("S60P", "S60C", "S60K")):
        obj = out[stage][1]
        obj["integration_candidate_sha256"] = sha(out["S55"][0])
        obj["checked_edge_ids"] = edge_ids
        obj["findings"] = [{"finding_id": f"CF-FINDING-{pos + 21}", "edge_id": "CF-EXTRA-91", "classification": "counterfactual", "verdict": "unsupported", "source_record_ids": ["CF-SOURCE"]}]
        reserialize(out, stage, obj)
    v6 = load_v6()
    s70 = v6.reduce_s70({name: out[name] for name in ("S55", "S60P", "S60C", "S60K")})
    reserialize(out, "S70", s70)
    s80 = v6.transform_s80({name: out[name] for name in ("S50", "S55", "S60P", "S60C", "S60K", "S70")})
    reserialize(out, "S80", s80)
    return out


def expect_invalid(inputs: dict[str, tuple[bytes, dict[str, Any]]], label: str) -> dict[str, Any]:
    try:
        validate_chain(inputs)
    except Invalid as exc:
        return {"case_id": label, "status": "PASS", "observed_terminal": "INVALID", "error_class": str(exc).split(":", 1)[0]}
    raise Invalid(f"counterfactual unexpectedly passed: {label}")


def run_holdouts(base: dict[str, tuple[bytes, dict[str, Any]]]) -> list[dict[str, Any]]:
    reports = []
    variant = consistent_variant(base)
    validate_chain(variant)
    reports.append({"case_id": "CF-CONSISTENT-RENAMED-REORDERED", "status": "PASS", "observed_terminal": "PASS"})
    mutated = {stage: (payload, deepcopy(obj)) for stage, (payload, obj) in base.items()}
    mutated["S30A"][1]["candidate_artifact_sha256"] = "0" * 64
    reserialize(mutated, "S30A", mutated["S30A"][1])
    reports.append(expect_invalid(mutated, "CF-PREDECESSOR-HASH-MUTATION"))
    mutated = {stage: (payload, deepcopy(obj)) for stage, (payload, obj) in base.items()}
    bool_row = next(row for row in mutated["S50"][1]["authority_matrix"] if contract()["authority_value_types"][row["id"]] == "boolean")
    bool_row["value"] = "false"
    reserialize(mutated, "S50", mutated["S50"][1])
    reports.append(expect_invalid(mutated, "CF-BOOLEAN-AS-STRING"))
    mutated = {stage: (payload, deepcopy(obj)) for stage, (payload, obj) in base.items()}
    target = mutated["S70"][1]["repair_target_edge_ids"][0]
    mutated["S80"][1]["cross_topic_edges"].append({"id": target, "from": "CF", "to": "CF", "type": "retained", "statement": "must fail"})
    reserialize(mutated, "S80", mutated["S80"][1])
    reports.append(expect_invalid(mutated, "CF-RETAINED-UNSUPPORTED-TARGET"))
    mutated = {stage: (payload, deepcopy(obj)) for stage, (payload, obj) in base.items()}
    mutated["S60K"][1]["findings"] = []
    reserialize(mutated, "S60K", mutated["S60K"][1])
    reports.append(expect_invalid(mutated, "CF-STALE-SPECIALIST-CLOSURE"))
    return reports


def preflight() -> dict[str, Any]:
    cfg = contract()
    for row in cfg["preserved_v6_bindings"]:
        data = read_storage(SUCCESSOR / row["path"], row["path"])
        if (sha(data), len(data)) != (row["sha256"], row["bytes"]):
            raise Invalid(f"preserved R6-v6 binding drift: {row['path']}")
    source = read_storage(ROOT / "r6v7_harness.py", "finalizer source")
    for literal in cfg["forbidden_finalizer_source_literals"]:
        if literal.encode() in source:
            raise Invalid("answer-specific frozen literal appears in finalizer source")
    tree = ast.parse(source.decode("utf-8"))
    forbidden_modules = {"socket", "subprocess", "urllib", "requests", "http", "ftplib"}
    for node in ast.walk(tree):
        if isinstance(node, ast.Import) and any(alias.name.split(".")[0] in forbidden_modules for alias in node.names):
            raise Invalid("finalizer imports network or subprocess machinery")
        if isinstance(node, ast.ImportFrom) and node.module and node.module.split(".")[0] in forbidden_modules:
            raise Invalid("finalizer imports network or subprocess machinery")
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr in {"write_text", "write_bytes", "unlink", "rename", "replace", "mkdir", "rmdir"}:
            raise Invalid("finalizer contains filesystem mutation")
    inputs = actual_inputs()
    result = validate_chain(inputs)
    holdouts = run_holdouts(inputs)
    return {"schema_id": "pw-r6v7-preflight-report-v1", "protocol_id": ID, "status": "PASS", "subject_calls": 0, "preserved_v6_bindings_checked": len(cfg["preserved_v6_bindings"]), "counterfactual_holdouts": holdouts, "actual_chain_artifacts_validated": len(CHAIN), "generic_finalizer_source_contains_no_frozen_answer_literals": True, "finalizer_ast_no_network_subprocess_or_write_calls": True, "s90_subject_packet_payload_bytes_before": 36618, "s90_subject_packet_payload_bytes_after": 0, "s90_admitted_source_bytes_before": 34868, "s90_admitted_source_bytes_after": 0, "s90_semantic_objectives_before": 1, "s90_semantic_objectives_after": 0, "s90_model_owned_fields_after": [], "deterministic_terminal_payload_sha256": sha(dump(result)), "deterministic_terminal_payload_bytes": len(dump(result)), "nonclaims": cfg["nonclaims"]}


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="command", required=True)
    sub.add_parser("preflight")
    q = sub.add_parser("finalize")
    q.add_argument("--input", action="append", default=[])
    return p


def main() -> int:
    args = parser().parse_args()
    try:
        out = preflight() if args.command == "preflight" else validate_chain(parse_inputs(args.input))
        sys.stdout.buffer.write(dump(out) + b"\n")
        return 0
    except (Invalid, OSError, KeyError, TypeError, ValueError, IndexError, StopIteration) as exc:
        sys.stdout.buffer.write(dump({"schema_id": "pw-r6v7-harness-error-v1", "protocol_id": ID, "status": "INVALID", "error": str(exc)}) + b"\n")
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
