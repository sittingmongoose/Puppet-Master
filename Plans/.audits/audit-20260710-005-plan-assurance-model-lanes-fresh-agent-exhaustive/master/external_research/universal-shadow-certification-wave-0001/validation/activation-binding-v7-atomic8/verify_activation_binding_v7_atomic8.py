#!/usr/bin/env python3
"""Read-only verifier for the certification v7 atomic8 preparation."""
from __future__ import annotations

import hashlib
import json
import os
import subprocess
from pathlib import Path
from typing import Any

BASE = Path(__file__).resolve().parent
WAVE = BASE.parents[1]
AUDIT = BASE.parents[4]
AUTHORITY = BASE / "authority-v7-atomic8.json"
SCHEMA = BASE / "activation-transaction-v7-atomic8.schema.json"
GENERATOR = BASE / "activation-generator-v7-atomic8.py"
MANIFEST = WAVE / "batch_manifest.jsonl"
REGISTRY = WAVE / "packet_registry.jsonl"
V6_REPORT = WAVE / "validation/activation-binding-v6/terminal-preparation-report-v6.json"
POLICY = AUDIT / "master/coordination/CONCURRENCY_POLICY_V25.json"
PYTHON = Path("/Users/jaredsmacbookair/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3")
SITE = AUDIT / "master/dependencies/jsonschema-draft202012-v1/site-packages"

POLICY_SHA = "f2e0cd20f5612b8d6fa1d1946ee03f15b3f26138a38189a410926f4f69f0f63b"
V6_SHA = "fb1b1ccfb6ef11f1e99164cc8196d73043a9374cedd0e3f5c293a61bc5d97435"
MANIFEST_SHA = "f41c967a3d2650031c0b8c74a83c410ca168aa8704131b6986c1c70309e68295"
REGISTRY_SHA = "ec4df1ce8b250c76d0daba5e93a94c5318d8aea82942d55c7145eed43c200ba8"


def canonical(value: Any) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def digest(value: Any) -> str:
    return hashlib.sha256(canonical(value)).hexdigest()


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def rows(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def schema_required_arrays_unique(value: Any, at: str = "$") -> list[str]:
    errors: list[str] = []
    if isinstance(value, dict):
        required = value.get("required")
        if isinstance(required, list) and len(required) != len(set(required)):
            errors.append(f"duplicate-required:{at}")
        for key, child in value.items():
            errors.extend(schema_required_arrays_unique(child, f"{at}.{key}"))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            errors.extend(schema_required_arrays_unique(child, f"{at}[{index}]"))
    return errors


def verify_schema_engine() -> list[str]:
    if not PYTHON.is_file() or not SITE.is_dir():
        return ["pinned-jsonschema-runtime-missing"]
    code = (
        "import importlib.metadata,json,sys;"
        "from pathlib import Path;"
        "from jsonschema import Draft202012Validator;"
        f"s=json.loads(Path({str(SCHEMA)!r}).read_text());"
        "Draft202012Validator.check_schema(s);"
        "print(importlib.metadata.version('jsonschema'),sys.version_info[:3],Draft202012Validator.__name__)"
    )
    env = {
        "PYTHONPATH": str(SITE),
        "PYTHONNOUSERSITE": "1",
        "PYTHONDONTWRITEBYTECODE": "1",
        "PYTHONHASHSEED": "0",
        "PATH": os.environ.get("PATH", ""),
    }
    before = sorted(str(path.relative_to(SITE)) for path in SITE.rglob("*") if path.is_file())
    run = subprocess.run([str(PYTHON), "-S", "-B", "-c", code], env=env, text=True, capture_output=True)
    after = sorted(str(path.relative_to(SITE)) for path in SITE.rglob("*") if path.is_file())
    errors: list[str] = []
    if run.returncode != 0:
        errors.append("schema-engine:" + run.stderr.strip()[:240])
    if "4.26.0 (3, 12, 13) Draft202012Validator" not in run.stdout:
        errors.append("schema-engine-version")
    if before != after:
        errors.append("schema-engine-tree-drift")
    return errors


def verify() -> dict[str, Any]:
    errors: list[str] = []
    for path in (AUTHORITY, SCHEMA, GENERATOR, MANIFEST, REGISTRY, V6_REPORT, POLICY):
        if not path.is_file():
            errors.append(f"missing:{path}")
    if errors:
        return {"status": "fail", "errors": errors}

    authority = load(AUTHORITY)
    schema = load(SCHEMA)
    manifest = rows(MANIFEST)
    registry = rows(REGISTRY)
    if sha(POLICY) != POLICY_SHA:
        errors.append("policy-v25-sha")
    if sha(V6_REPORT) != V6_SHA:
        errors.append("v6-terminal-sha")
    if sha(MANIFEST) != MANIFEST_SHA:
        errors.append("manifest-sha")
    if sha(REGISTRY) != REGISTRY_SHA:
        errors.append("registry-sha")
    if authority.get("status") != "BLOCKED_AWAITING_V6_PASS_AND_FRESH_LUNA_ATOMIC8_GATE":
        errors.append("authority-status")
    if authority.get("activation_authorized") is not False or any(authority.get("credit", {}).values()):
        errors.append("authority-zero-credit")
    if authority.get("policy", {}).get("sha256") != POLICY_SHA or authority.get("policy", {}).get("atomic_cap") != 8:
        errors.append("authority-policy")
    if authority.get("v6_terminal_preparation", {}).get("sha256") != V6_SHA:
        errors.append("authority-v6")

    expected_ids = [f"A005ERSC-{index:04d}" for index in range(1, 17)]
    actual_ids = [row.get("assignment_id") for row in manifest]
    if actual_ids != expected_ids or len(registry) != 16:
        errors.append("manifest-membership")
    feature_refs = [feature for row in manifest for feature in row.get("feature_refs", [])]
    if len(feature_refs) != 3888 or len(set(feature_refs)) != 3888:
        errors.append("feature-union")
    if any(row.get("feature_count") != 243 for row in manifest):
        errors.append("features-per-assignment")
    if any(len(row.get("owner_domain_counts", {})) != 16 for row in manifest):
        errors.append("owner-domain-coverage")
    if any(len(row.get("source_assignment_ids", [])) != 24 for row in manifest):
        errors.append("source-assignment-coverage")

    for cohort_id, subset in (("cohort-0001", manifest[:8]), ("cohort-0002", manifest[8:])):
        cohort = authority.get("cohorts", {}).get(cohort_id, {})
        ids = [row["assignment_id"] for row in subset]
        refs = sorted(feature for row in subset for feature in row["feature_refs"])
        packet_root = digest([{"assignment_id": row["assignment_id"], "packet_sha256": row["packet_sha256"]} for row in subset])
        intent_root = digest([{"assignment_id": row["assignment_id"], "intent_ref": row["intent_ref"]} for row in subset])
        if cohort.get("assignment_ids") != ids or cohort.get("assignment_ids_digest") != digest(ids):
            errors.append(f"cohort-membership:{cohort_id}")
        if len(refs) != 1944 or len(set(refs)) != 1944 or cohort.get("feature_refs_digest") != digest(refs):
            errors.append(f"cohort-features:{cohort_id}")
        if cohort.get("packet_subset_root_sha256") != packet_root:
            errors.append(f"cohort-packet-root:{cohort_id}")
        if cohort.get("intent_subset_root_sha256") != intent_root:
            errors.append(f"cohort-intent-root:{cohort_id}")

    for row in manifest:
        assignment = row["assignment_id"]
        packet = Path(row["packet_ref"])
        if not packet.is_absolute():
            packet = WAVE / packet
        intent = Path(row["intent_ref"])
        if not intent.is_absolute():
            intent = WAVE / intent
        output = Path(row["output_directory"])
        if not packet.is_file() or sha(packet) != row["packet_sha256"]:
            errors.append(f"packet:{assignment}")
        if not intent.is_file():
            errors.append(f"intent:{assignment}")
            continue
        intent_value = load(intent)
        if intent_value.get("assignment_id") != assignment or intent_value.get("model") != "gpt-5.6-sol" or intent_value.get("reasoning_effort") != "xhigh":
            errors.append(f"intent-binding:{assignment}")
        if not output.is_dir() or any(output.iterdir()):
            errors.append(f"output-zero-state:{assignment}")
        if Path(intent_value["receipt_ref"]).exists():
            errors.append(f"receipt-zero-state:{assignment}")
    transactions = BASE / "activation-transactions"
    if transactions.exists() and any(transactions.iterdir()):
        errors.append("activation-transaction-present")

    errors.extend(schema_required_arrays_unique(schema))
    errors.extend(verify_schema_engine())
    generator_text = GENERATOR.read_text(encoding="utf-8")
    if "ACTIVE_FOR_EXACTLY_8_FRESH_SOL_XHIGH_CERTIFICATION_LEAVES" not in generator_text:
        errors.append("generator-atomic8-status")
    if "choices=(\"cohort-0001\", \"cohort-0002\")" not in generator_text:
        errors.append("generator-cohort-choices")
    if "ACTIVE_FOR_EXACTLY_16" in generator_text:
        errors.append("generator-atomic16-leak")

    return {
        "status": "pass" if not errors else "fail",
        "errors": errors,
        "assignment_count": 16,
        "feature_count": 3888,
        "features_per_assignment": 243,
        "cohort_count": 2,
        "assignments_per_cohort": 8,
        "features_per_cohort": 1944,
        "owner_domains_per_assignment": 16,
        "source_assignments_per_assignment": 24,
        "outputs_empty": 16 if not any(error.startswith("output-zero-state") for error in errors) else None,
        "activation_transactions": 0,
        "results": 0,
        "receipts": 0,
        "credit": 0,
        "activation_authorized": False,
        "schema_engine": "jsonschema 4.26.0 Draft202012Validator CPython 3.12.13 -S -B",
    }


if __name__ == "__main__":
    print(json.dumps(verify(), indent=2, sort_keys=True))
