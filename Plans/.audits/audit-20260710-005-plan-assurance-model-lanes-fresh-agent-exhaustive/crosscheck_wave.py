#!/usr/bin/env python3
"""Structurally distinct schema-driven cross-check for Audit 005 waves."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[2]
AUDIT_ID = ROOT.name
EPOCH_ID = os.environ.get("AUDIT005_EPOCH")
if not EPOCH_ID:
    raise SystemExit("AUDIT005_EPOCH is required; refusing to guess a frozen epoch")
EPOCH = ROOT / "master" / "frozen" / EPOCH_ID
LANE_SUBAGENT_MODE = int(EPOCH_ID.rsplit("-", 1)[1]) >= 3


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def obj(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"{path}: object required")
    return value


def schema_errors(value: Any, schema: dict[str, Any], path: str = "$") -> list[str]:
    errors: list[str] = []
    if "const" in schema and value != schema["const"]:
        errors.append(f"{path}:const")
    if "enum" in schema and value not in schema["enum"]:
        errors.append(f"{path}:enum")
    kind = schema.get("type")
    if kind == "object":
        if not isinstance(value, dict):
            return errors + [f"{path}:type_object"]
        required = set(schema.get("required", []))
        missing = required - set(value)
        if missing:
            errors.append(f"{path}:missing:{','.join(sorted(missing))}")
        properties = schema.get("properties", {})
        if schema.get("additionalProperties") is False:
            extra = set(value) - set(properties)
            if extra:
                errors.append(f"{path}:extra:{','.join(sorted(extra))}")
        for key in set(value) & set(properties):
            errors.extend(schema_errors(value[key], properties[key], f"{path}.{key}"))
    elif kind == "array":
        if not isinstance(value, list):
            return errors + [f"{path}:type_array"]
        if len(value) < schema.get("minItems", 0):
            errors.append(f"{path}:minItems")
        if "maxItems" in schema and len(value) > schema["maxItems"]:
            errors.append(f"{path}:maxItems")
        if schema.get("uniqueItems"):
            frozen = [json.dumps(item, sort_keys=True, separators=(",", ":")) for item in value]
            if len(frozen) != len(set(frozen)):
                errors.append(f"{path}:uniqueItems")
        prefix = schema.get("prefixItems", [])
        for index, child_schema in enumerate(prefix):
            if index < len(value):
                errors.extend(schema_errors(value[index], child_schema, f"{path}[{index}]"))
        if isinstance(schema.get("items"), dict):
            for index, item in enumerate(value):
                errors.extend(schema_errors(item, schema["items"], f"{path}[{index}]"))
    elif kind == "string":
        if not isinstance(value, str):
            return errors + [f"{path}:type_string"]
        if len(value) < schema.get("minLength", 0):
            errors.append(f"{path}:minLength")
        if "pattern" in schema and re.fullmatch(schema["pattern"], value) is None:
            errors.append(f"{path}:pattern")
    elif kind == "integer":
        if isinstance(value, bool) or not isinstance(value, int):
            return errors + [f"{path}:type_integer"]
        if value < schema.get("minimum", value):
            errors.append(f"{path}:minimum")
    elif kind == "boolean" and not isinstance(value, bool):
        errors.append(f"{path}:type_boolean")
    return errors


def manifest_rows(wave_id: str) -> list[tuple[dict[str, Any], str]]:
    wave_path = ROOT / "master" / "waves" / wave_id / "wave_assignment_manifest.jsonl"
    path = wave_path if wave_path.is_file() else EPOCH / "manifests" / "pilot_assignment_manifest.jsonl"
    rows = []
    for raw in path.read_bytes().splitlines():
        if raw.strip():
            rows.append((json.loads(raw), digest(raw)))
    return rows


def examine(row: dict[str, Any], row_hash: str, wave_id: str, schemas: dict[str, dict[str, Any]], protocol_root: str) -> dict[str, Any]:
    assignment_id = row["assignment_id"]
    attempt_id = row["attempt_id"]
    out = ROOT / row["output_directory"]
    receipt_path = ROOT / "master" / "dispatch" / wave_id / assignment_id / attempt_id / "dispatch_receipt.json"
    result_path = out / "result.json"
    terminal_path = out / "terminal_seal.json"
    errors: list[str] = []
    missing = [path.name for path in (receipt_path, result_path, terminal_path) if not path.is_file()]
    if missing:
        return {"assignment_id": assignment_id, "state": "pending", "errors": [f"missing:{name}" for name in missing]}
    try:
        receipt_bytes = receipt_path.read_bytes()
        result_bytes = result_path.read_bytes()
        terminal_bytes = terminal_path.read_bytes()
        receipt = json.loads(receipt_bytes)
        result = json.loads(result_bytes)
        terminal = json.loads(terminal_bytes)
    except Exception as exc:
        return {"assignment_id": assignment_id, "state": "rejected", "errors": [f"parse:{type(exc).__name__}"]}

    errors += ["receipt" + error for error in schema_errors(receipt, schemas["dispatch"])]
    errors += ["result" + error for error in schema_errors(result, schemas["result"])]
    errors += ["terminal" + error for error in schema_errors(terminal, schemas["terminal"])]
    expected_receipt = {
        "assignment_id": assignment_id,
        "attempt_id": attempt_id,
        "assignment_sha256": row_hash,
        "capsule_ref": str(EPOCH / row["capsule_ref"]),
        "capsule_sha256": row["capsule_sha256"],
        "result_schema_ref": str(EPOCH / "schemas" / "assignment_result.schema.json"),
        "terminal_schema_ref": str(EPOCH / "schemas" / "terminal_seal.schema.json"),
        "protocol_root_sha256": protocol_root,
        "output_directory": str(out),
        "model": "gpt-5.6-sol",
        "reasoning_effort": "xhigh",
    }
    if LANE_SUBAGENT_MODE:
        expected_receipt.update(
            {
                "lane_thread_id": receipt.get("lane_thread_id"),
                "agent_path": receipt.get("agent_path"),
                "fresh_lane_subagent": True,
            }
        )
        if not isinstance(receipt.get("lane_thread_id"), str) or not receipt["lane_thread_id"]:
            errors.append("receipt_binding:lane_thread_id")
        if not isinstance(receipt.get("agent_path"), str) or not receipt["agent_path"]:
            errors.append("receipt_binding:agent_path")
    else:
        expected_receipt["fresh_top_level_thread"] = True
    for key, expected in expected_receipt.items():
        if receipt.get(key) != expected:
            errors.append(f"receipt_binding:{key}")
    thread_id = receipt.get("task_thread_id")
    expected_result = {
        "assignment_id": assignment_id,
        "attempt_id": attempt_id,
        "task_thread_id": thread_id,
        "role": row["role"],
        "status": "completed",
        "model": "gpt-5.6-sol",
        "reasoning_effort": "xhigh",
    }
    for key, expected in expected_result.items():
        if result.get(key) != expected:
            errors.append(f"result_binding:{key}")
    binding = result.get("source_binding", {})
    for key in ("document_path", "source_sha256", "core_sha256", "core_range"):
        if binding.get(key) != row[key]:
            errors.append(f"source_binding:{key}")
    terminal_expected = {
        "assignment_id": assignment_id,
        "attempt_id": attempt_id,
        "task_thread_id": thread_id,
        "dispatch_receipt_sha256": digest(receipt_bytes),
        "result_sha256": digest(result_bytes),
        "result_bytes": len(result_bytes),
        "status": "completed",
    }
    for key, expected in terminal_expected.items():
        if terminal.get(key) != expected:
            errors.append(f"terminal_binding:{key}")

    required_dimensions = row["required_dimensions"]
    if set(result.get("coverage", {}).get("dimensions_checked", [])) != set(required_dimensions):
        errors.append("coverage_dimensions")
    assessments = result.get("dimension_assessments", [])
    if Counter(item.get("dimension") for item in assessments if isinstance(item, dict)) != Counter(required_dimensions):
        errors.append("assessment_dimensions")
    item_ids = {
        item.get("item_id")
        for item in result.get("items", [])
        if isinstance(item, dict) and isinstance(item.get("item_id"), str)
    }
    if not item_ids:
        errors.append("no_items")
    for assessment in assessments:
        if not isinstance(assessment, dict):
            continue
        evidence_ids = assessment.get("evidence_item_ids", [])
        if any(item_id not in item_ids for item_id in evidence_ids):
            errors.append("assessment_unknown_item")
        if assessment.get("status") in {"addressed", "gap_found"} and not evidence_ids:
            errors.append("assessment_positive_without_item")

    source_lines = (REPO / row["document_path"]).read_text(encoding="utf-8").splitlines(keepends=True)
    core_start, core_end = row["core_range"]
    for item in result.get("items", []):
        if not isinstance(item, dict):
            continue
        for evidence in item.get("evidence", []):
            if not isinstance(evidence, dict):
                continue
            start, end = evidence.get("line_start"), evidence.get("line_end")
            if (
                evidence.get("path") != row["document_path"]
                or evidence.get("source_sha256") != row["source_sha256"]
                or not isinstance(start, int)
                or not isinstance(end, int)
                or not (core_start <= start <= end <= core_end)
            ):
                errors.append("evidence_binding")
                continue
            exact_quote = evidence.get("exact_quote")
            selected = "".join(source_lines[start - 1:end])
            if not isinstance(exact_quote, str) or not exact_quote.strip() or exact_quote not in selected:
                errors.append("evidence_quote")

    forbidden = result_bytes.lower()
    if any(token in forbidden for token in (b"audit-20260709", b"runner-", b"plans/.audits/")):
        errors.append("forbidden_lineage_reference")
    return {
        "assignment_id": assignment_id,
        "attempt_id": attempt_id,
        "task_thread_id": thread_id,
        "state": "eligible" if not errors else "rejected",
        "errors": sorted(set(errors)),
        "result_sha256": digest(result_bytes),
        "terminal_seal_sha256": digest(terminal_bytes),
    }


def crosscheck(wave_id: str) -> dict[str, Any]:
    schemas = {
        "result": obj(EPOCH / "schemas" / "assignment_result.schema.json"),
        "terminal": obj(EPOCH / "schemas" / "terminal_seal.schema.json"),
        "dispatch": obj(EPOCH / "schemas" / "dispatch_receipt.schema.json"),
    }
    seal = obj(EPOCH / "launch_seal.json")
    findings = [
        examine(row, row_hash, wave_id, schemas, seal["protocol_root_sha256"])
        for row, row_hash in manifest_rows(wave_id)
    ]
    thread_ids = [row.get("task_thread_id") for row in findings if row.get("task_thread_id")]
    duplicates = {thread_id for thread_id, count in Counter(thread_ids).items() if count > 1}
    if duplicates:
        for row in findings:
            if row.get("task_thread_id") in duplicates:
                row["state"] = "rejected"
                row["errors"] = sorted(set(row["errors"] + ["duplicate_task_identity"]))
    counts = Counter(row["state"] for row in findings)
    return {
        "audit_id": AUDIT_ID,
        "checker": "wave_schema_crosscheck_v1",
        "wave_id": wave_id,
        "status": "pass" if counts["eligible"] == len(findings) else ("in_progress" if counts["pending"] else "fail"),
        "counts": {
            "assignments": len(findings),
            "eligible": counts["eligible"],
            "pending": counts["pending"],
            "rejected": counts["rejected"],
        },
        "eligible_assignment_ids": sorted(row["assignment_id"] for row in findings if row["state"] == "eligible"),
        "results": findings,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--wave-id", default="pilot-wave-0001")
    args = parser.parse_args()
    report = crosscheck(args.wave_id)
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] in {"pass", "in_progress"} else 1)


if __name__ == "__main__":
    main()
