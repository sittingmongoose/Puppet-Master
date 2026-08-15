#!/usr/bin/env python3
from __future__ import annotations

import argparse
import ast
import hashlib
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
REPO = SUCCESSOR.parents[2]
V5 = SUCCESSOR / "model_retest_r6_decomposed_v5"
R5 = SUCCESSOR / "model_retest_r5_snapshot_v1"
ID = "PW-R6-DECOMPOSED-20260814.6"
FIXTURE_ID = "PW-R4-CAUSAL-20260813.3"
ROLE_SPECS = (
    ("S60P", "S60P", "provenance", "provenance"),
    ("S60C", "S60C", "constraint_authority", "constraint_authority"),
    ("S60K", "S60K", "counterfactual_dependency", "counterfactual_dependency"),
)


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


def contained(path: Path) -> Path:
    resolved = path.resolve()
    if resolved != SUCCESSOR and SUCCESSOR not in resolved.parents:
        raise Invalid(f"path outside successor test root: {resolved}")
    try:
        mode = os.lstat(resolved).st_mode
    except OSError as exc:
        raise Invalid(f"unreadable input: {resolved}: {exc}") from exc
    if stat.S_ISLNK(mode) or not stat.S_ISREG(mode):
        raise Invalid(f"input must be a regular nonlink file: {resolved}")
    return resolved


def read_storage(path: Path, label: str) -> bytes:
    return contained(path).read_bytes()


def read_payload(path: Path, label: str) -> tuple[bytes, dict[str, Any]]:
    storage = read_storage(path, label)
    if not storage.endswith(b"\n"):
        raise Invalid(f"{label}: storage must end in one controller LF")
    payload = storage[:-1]
    obj = strict_json(payload, label)
    if not isinstance(obj, dict) or dump(obj) != payload:
        raise Invalid(f"{label}: payload is not canonical minified JSON")
    return payload, obj


def parse_inputs(values: list[str]) -> dict[str, tuple[bytes, dict[str, Any]]]:
    out: dict[str, tuple[bytes, dict[str, Any]]] = {}
    for item in values:
        if "=" not in item:
            raise Invalid(f"input lacks NAME=PATH: {item!r}")
        name, raw = item.split("=", 1)
        if not re.fullmatch(r"S(?:50|55|60[PKC]|70)", name) or name in out:
            raise Invalid(f"invalid or duplicate input name: {name!r}")
        out[name] = read_payload(Path(raw), name)
    return out


def exact_keys(obj: dict[str, Any], required: tuple[str, ...], label: str) -> None:
    if tuple(obj) != required:
        raise Invalid(f"{label}: exact key order mismatch: {list(obj)}")


def reduce_s70(inputs: dict[str, tuple[bytes, dict[str, Any]]]) -> dict[str, Any]:
    if set(inputs) != {"S55", "S60P", "S60C", "S60K"}:
        raise Invalid("S70 requires exactly S55,S60P,S60C,S60K")
    s55_payload, s55 = inputs["S55"]
    edges = s55.get("cross_topic_edges")
    if not isinstance(edges, list) or not edges:
        raise Invalid("S55 cross_topic_edges must be a nonempty list")
    edge_ids: list[str] = []
    for pos, edge in enumerate(edges):
        if not isinstance(edge, dict) or not isinstance(edge.get("id"), str) or not edge["id"]:
            raise Invalid(f"S55 edge {pos} lacks a stable id")
        if edge["id"] in edge_ids:
            raise Invalid("S55 edge ids must be unique")
        edge_ids.append(edge["id"])
    candidate_sha = sha(s55_payload)
    hashes: dict[str, str] = {}
    dispositions: list[dict[str, Any]] = []
    seen_findings: set[str] = set()
    target_set: set[str] = set()
    for input_name, expected_stage, expected_role, hash_key in ROLE_SPECS:
        payload, obj = inputs[input_name]
        if obj.get("protocol_id") != FIXTURE_ID or obj.get("stage") != expected_stage or obj.get("role") != expected_role:
            raise Invalid(f"{input_name}: stage or role identity mismatch")
        if obj.get("integration_candidate_sha256") != candidate_sha:
            raise Invalid(f"{input_name}: candidate binding mismatch")
        if obj.get("checked_edge_ids") != edge_ids:
            raise Invalid(f"{input_name}: checked edge order mismatch")
        findings = obj.get("findings")
        if not isinstance(findings, list):
            raise Invalid(f"{input_name}: findings must be an array")
        hashes[hash_key] = sha(payload)
        for pos, finding in enumerate(findings):
            if not isinstance(finding, dict):
                raise Invalid(f"{input_name}: finding {pos} is not an object")
            fid, eid = finding.get("finding_id"), finding.get("edge_id")
            if not isinstance(fid, str) or not fid or fid in seen_findings:
                raise Invalid(f"{input_name}: finding identity missing or duplicated")
            if not isinstance(eid, str) or eid not in edge_ids:
                raise Invalid(f"{input_name}: finding target is not a candidate edge")
            if finding.get("verdict") != "unsupported":
                raise Invalid(f"{input_name}: only typed unsupported findings are repair inputs")
            seen_findings.add(fid)
            target_set.add(eid)
            dispositions.append({"finding_id": fid, "action": "merge_to_edge_repair", "target_edge_id": eid})
    targets = [edge_id for edge_id in edge_ids if edge_id in target_set]
    patch: list[dict[str, Any]] = []
    for index in sorted((edge_ids.index(edge_id) for edge_id in targets), reverse=True):
        edge_id = edge_ids[index]
        patch.append({"op": "test", "path": f"/cross_topic_edges/{index}/id", "value": edge_id})
        patch.append({"op": "remove", "path": f"/cross_topic_edges/{index}"})
    return {
        "protocol_id": FIXTURE_ID,
        "stage": "S70",
        "integration_candidate_sha256": candidate_sha,
        "specialist_artifact_hashes": hashes,
        "dispositions": dispositions,
        "repair_target_edge_ids": targets,
        "patch": patch,
        "claim_boundary": "bounded_reducer_repair_proposal_only",
        "external_audit_status": "excluded",
        "forbidden_action_violations": [],
    }


def transform_s80(inputs: dict[str, tuple[bytes, dict[str, Any]]]) -> dict[str, Any]:
    if set(inputs) != {"S50", "S55", "S60P", "S60C", "S60K", "S70"}:
        raise Invalid("S80 requires exactly S50,S55,S60P,S60C,S60K,S70")
    expected_s70 = reduce_s70({name: inputs[name] for name in ("S55", "S60P", "S60C", "S60K")})
    s70_payload, s70 = inputs["S70"]
    if s70 != expected_s70 or s70_payload != dump(expected_s70):
        raise Invalid("S70 does not equal the generic deterministic reduction")
    s55_payload, s55 = inputs["S55"]
    out = deepcopy(s55)
    operations = s70["patch"]
    if len(operations) % 2:
        raise Invalid("S70 patch must contain test/remove pairs")
    for offset in range(0, len(operations), 2):
        test, remove = operations[offset], operations[offset + 1]
        match = re.fullmatch(r"/cross_topic_edges/(0|[1-9][0-9]*)/id", test.get("path", ""))
        if test.get("op") != "test" or remove.get("op") != "remove" or not match:
            raise Invalid("S70 patch contains an invalid test/remove pair")
        index = int(match.group(1))
        if remove.get("path") != f"/cross_topic_edges/{index}" or index >= len(out["cross_topic_edges"]):
            raise Invalid("S70 remove path is not causally paired")
        if out["cross_topic_edges"][index].get("id") != test.get("value"):
            raise Invalid("S70 test-before-remove failed")
        out["cross_topic_edges"].pop(index)
    out["stage"] = "S80"
    out.pop("source_integration_sha256", None)
    out["source_candidate_sha256"] = sha(s55_payload)
    out["reducer_artifact_sha256"] = sha(s70_payload)
    compare = deepcopy(out)
    compare["stage"] = "S50"
    compare.pop("source_candidate_sha256")
    compare.pop("reducer_artifact_sha256")
    if compare != inputs["S50"][1]:
        raise Invalid("S80 output does not restore the admitted S50 candidate")
    return out


def synthetic_case(case: dict[str, Any]) -> dict[str, Any]:
    edges = [{"id": edge_id, "from": "X", "to": "Y", "type": "holdout", "statement": "counterfactual"} for edge_id in case["edges"]]
    s55 = {"protocol_id": FIXTURE_ID, "stage": "S55", "cross_topic_edges": edges}
    s55_payload = dump(s55)
    inputs: dict[str, tuple[bytes, dict[str, Any]]] = {"S55": (s55_payload, s55)}
    spec_map = {name: (stage, role) for name, stage, role, _ in ROLE_SPECS}
    for name in reversed(tuple(spec_map)):
        stage, role = spec_map[name]
        pairs = case["specialists"].get(name, [])
        findings = [{"finding_id": fid, "edge_id": eid, "classification": "holdout", "verdict": "unsupported", "source_record_ids": ["CF"]} for fid, eid in pairs]
        obj = {"protocol_id": FIXTURE_ID, "stage": stage, "role": role, "integration_candidate_sha256": sha(s55_payload), "checked_edge_ids": case["edges"], "findings": findings}
        payload = dump(obj)
        inputs[name] = (payload, obj)
    return reduce_s70(inputs)


def run_holdouts() -> list[dict[str, Any]]:
    doc = strict_json(read_storage(ROOT / "counterfactual_holdouts.json", "holdouts"), "holdouts")
    if not isinstance(doc, dict) or not isinstance(doc.get("cases"), list):
        raise Invalid("holdouts shape invalid")
    reports = []
    for case in doc["cases"]:
        out = synthetic_case(case)
        got_dispositions = [[row["finding_id"], row["target_edge_id"]] for row in out["dispositions"]]
        got_patch = [[row["op"], row["path"], row.get("value")] for row in out["patch"]]
        if got_dispositions != case["expected_dispositions"] or out["repair_target_edge_ids"] != case["expected_targets"] or got_patch != case["expected_patch"]:
            raise Invalid(f"counterfactual failed: {case['case_id']}")
        reports.append({"case_id": case["case_id"], "status": "PASS", "edge_count": len(case["edges"]), "finding_count": len(out["dispositions"]), "target_count": len(out["repair_target_edge_ids"])})
    return reports


def contract() -> dict[str, Any]:
    raw = read_storage(ROOT / "contract.json", "contract")
    obj = strict_json(raw, "contract")
    if dump(obj) + b"\n" != raw:
        raise Invalid("contract must be canonical JSON plus LF")
    return obj


def preflight() -> dict[str, Any]:
    cfg = contract()
    preserved = []
    for row in cfg["preserved_v5_failure_bindings"]:
        data = read_storage(REPO / row["path"], row["path"])
        if (sha(data), len(data)) != (row["sha256"], row["bytes"]):
            raise Invalid(f"preserved R6-v5 failure drift: {row['path']}")
        preserved.append(row["path"])
    source = read_storage(ROOT / "r6v6_harness.py", "harness source")
    for literal in cfg["forbidden_reducer_source_literals"]:
        if literal.encode() in source:
            raise Invalid("answer-specific frozen literal appears in reducer source")
    tree = ast.parse(source.decode("utf-8"))
    forbidden_nodes = (ast.ImportFrom,)
    forbidden_modules = {"socket", "subprocess", "urllib", "requests", "http", "ftplib"}
    for node in ast.walk(tree):
        if isinstance(node, ast.Import) and any(alias.name.split(".")[0] in forbidden_modules for alias in node.names):
            raise Invalid("harness imports a network or subprocess module")
        if isinstance(node, forbidden_nodes) and node.module and node.module.split(".")[0] in forbidden_modules:
            raise Invalid("harness imports a network or subprocess module")
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr in {"write_text", "write_bytes", "unlink", "rename", "replace", "mkdir", "rmdir"}:
            raise Invalid("harness contains a filesystem mutation call")
    base = V5 / "execution/slot-alpha/artifacts"
    actual_inputs = {name: read_payload(base / f"{name}.json", name) for name in ("S55", "S60P", "S60C", "S60K")}
    actual = reduce_s70(actual_inputs)
    expected = cfg["dynamic_fixture_expectations"]
    actual_payload = dump(actual)
    if (sha(actual_payload), len(actual_payload)) != (expected["s70_payload_sha256"], expected["s70_payload_bytes"]):
        raise Invalid("generic S70 reducer does not match the independently derived revised-fixture binding")
    s80_inputs = dict(actual_inputs)
    s80_inputs["S50"] = read_payload(base / "S50.json", "S50")
    s80_inputs["S70"] = (dump(actual), actual)
    s80 = transform_s80(s80_inputs)
    s80_payload = dump(s80)
    if (sha(s80_payload), len(s80_payload)) != (expected["s80_payload_sha256"], expected["s80_payload_bytes"]):
        raise Invalid("generic S80 transform does not match the independently derived revised-fixture binding")
    holdouts = run_holdouts()
    return {"schema_id": "pw-r6v6-preflight-report-v1", "protocol_id": ID, "status": "PASS", "subject_calls": 0, "preserved_v5_failure_bindings_checked": len(preserved), "counterfactual_holdouts": holdouts, "generic_reducer_source_contains_no_frozen_answer_literals": True, "harness_ast_no_network_subprocess_or_write_calls": True, "actual_s70_payload_sha256": sha(dump(actual)), "actual_s70_payload_bytes": len(dump(actual)), "actual_s80_payload_sha256": sha(dump(s80)), "actual_s80_payload_bytes": len(dump(s80)), "s70_subject_packet_payload_bytes_before": 6179, "s70_subject_packet_payload_bytes_after": 0, "s70_semantic_objectives_before": 1, "s70_semantic_objectives_after": 0, "s70_model_owned_fields_after": [], "nonclaims": cfg["nonclaims"]}


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="command", required=True)
    sub.add_parser("preflight")
    for name in ("reduce-s70", "transform-s80"):
        q = sub.add_parser(name)
        q.add_argument("--input", action="append", default=[])
    return p


def main() -> int:
    args = parser().parse_args()
    try:
        if args.command == "preflight":
            out = preflight()
        else:
            inputs = parse_inputs(args.input)
            out = reduce_s70(inputs) if args.command == "reduce-s70" else transform_s80(inputs)
        sys.stdout.buffer.write(dump(out) + b"\n")
        return 0
    except (Invalid, OSError, KeyError, TypeError, ValueError, IndexError) as exc:
        sys.stdout.buffer.write(dump({"schema_id": "pw-r6v6-harness-error-v1", "protocol_id": ID, "status": "INVALID", "error": str(exc)}) + b"\n")
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
