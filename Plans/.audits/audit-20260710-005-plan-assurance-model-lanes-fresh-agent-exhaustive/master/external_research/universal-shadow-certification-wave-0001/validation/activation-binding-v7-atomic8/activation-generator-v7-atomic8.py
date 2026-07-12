#!/usr/bin/env python3
"""Future-only fail-closed generator for one independently gated atomic8 cohort.

This file is prepared but MUST NOT be invoked until both a terminal Luna v6
PASS and a distinct fresh Luna atomic8 PASS exist.  It never emits atomic16.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import json
import os
import shutil
import sys
import tempfile
from pathlib import Path
from typing import Any

BASE = Path(__file__).resolve().parent
WAVE = BASE.parents[1]
AUDIT = BASE.parents[4]
AUTHORITY_PATH = BASE / "authority-v7-atomic8.json"
SCHEMA_PATH = BASE / "activation-transaction-v7-atomic8.schema.json"
TERMINAL_REPORT_PATH = BASE / "terminal-preparation-report-v7-atomic8.json"
MANIFEST_PATH = WAVE / "batch_manifest.jsonl"
TRANSACTIONS_ROOT = BASE / "activation-transactions"
POLICY_PATH = AUDIT / "master/coordination/CONCURRENCY_POLICY_V25.json"
V6_TERMINAL_PATH = WAVE / "validation/activation-binding-v6/terminal-preparation-report-v6.json"

POLICY_SHA = "f2e0cd20f5612b8d6fa1d1946ee03f15b3f26138a38189a410926f4f69f0f63b"
V6_TERMINAL_SHA = "fb1b1ccfb6ef11f1e99164cc8196d73043a9374cedd0e3f5c293a61bc5d97435"
STATUS = "ACTIVE_FOR_EXACTLY_8_FRESH_SOL_XHIGH_CERTIFICATION_LEAVES"
CONTROLLER = "019f4f5e-96c6-7893-8c94-ce2c1b760d6c"


def canonical(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode("utf-8")


def sha_bytes(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def sha(path: Path) -> str:
    return sha_bytes(path.read_bytes())


def load_json(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"not-object:{path}")
    return value


def manifest_rows() -> list[dict[str, Any]]:
    return [json.loads(line) for line in MANIFEST_PATH.read_text(encoding="utf-8").splitlines() if line.strip()]


def expected_ids(cohort_id: str) -> list[str]:
    if cohort_id == "cohort-0001":
        return [f"A005ERSC-{i:04d}" for i in range(1, 9)]
    if cohort_id == "cohort-0002":
        return [f"A005ERSC-{i:04d}" for i in range(9, 17)]
    raise ValueError("unknown-cohort")


def validate_v6_report(report: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    expected = {
        "status": "PASS",
        "errors": [],
        "assignment_count": 16,
        "feature_count": 3888,
        "model": "gpt-5.6-sol",
        "reasoning_effort": "xhigh",
        "binding_v6_terminal_report_sha256": V6_TERMINAL_SHA,
        "atomic16_generator_confirmed_incompatible_with_atomic8": True,
        "outputs_empty": 16,
        "results": 0,
        "receipts": 0,
        "activation_transactions": 0,
        "credit": 0,
    }
    for key, value in expected.items():
        if report.get(key) != value:
            errors.append(f"v6-report:{key}")
    if int(report.get("tests_passed", -1)) < 1064 or report.get("tests_passed") != report.get("tests_total"):
        errors.append("v6-report:tests")
    return errors


def validate_atomic8_report(report: dict[str, Any], authority: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    expected = {
        "status": "PASS",
        "errors": [],
        "authority_v7_atomic8_sha256": sha(AUTHORITY_PATH),
        "schema_v7_atomic8_sha256": sha(SCHEMA_PATH),
        "generator_v7_atomic8_sha256": sha(Path(__file__).resolve()),
        "terminal_preparation_report_v7_atomic8_sha256": sha(TERMINAL_REPORT_PATH),
        "policy_v25_sha256": POLICY_SHA,
        "binding_v6_terminal_report_sha256": V6_TERMINAL_SHA,
        "assignment_count": 16,
        "feature_count": 3888,
        "cohort_count": 2,
        "atomic_cap": 8,
        "model": "gpt-5.6-sol",
        "reasoning_effort": "xhigh",
        "outputs_empty": 16,
        "results": 0,
        "receipts": 0,
        "activation_transactions": 0,
        "credit": 0,
    }
    for key, value in expected.items():
        if report.get(key) != value:
            errors.append(f"atomic8-report:{key}")
    expected_cohorts = {
        cohort_id: authority["cohorts"][cohort_id]["assignment_ids"]
        for cohort_id in ("cohort-0001", "cohort-0002")
    }
    if report.get("cohorts") != expected_cohorts:
        errors.append("atomic8-report:cohorts")
    if report.get("cross_cohort_overlap") != 0:
        errors.append("atomic8-report:overlap")
    return errors


def validate_gate_payloads(v6_report: dict[str, Any], atomic8_report: dict[str, Any], authority: dict[str, Any]) -> list[str]:
    return validate_v6_report(v6_report) + validate_atomic8_report(atomic8_report, authority)


def targeted_zero_state(rows: list[dict[str, Any]]) -> list[str]:
    errors: list[str] = []
    for row in rows:
        output = Path(row["output_directory"])
        if not output.is_dir() or any(output.iterdir()):
            errors.append(f"output-not-empty:{row['assignment_id']}")
        intent = WAVE / row["intent_ref"]
        if not intent.is_file():
            errors.append(f"intent-missing:{row['assignment_id']}")
            continue
        value = load_json(intent)
        receipt = Path(value["receipt_ref"])
        if receipt.exists():
            errors.append(f"receipt-exists:{row['assignment_id']}")
        result = output / "result.json"
        if result.exists():
            errors.append(f"result-exists:{row['assignment_id']}")
    return errors


def build_documents(
    cohort_id: str,
    rows: list[dict[str, Any]],
    authority: dict[str, Any],
    v6_report_sha: str,
    atomic8_report_sha: str,
    final_root: Path,
) -> tuple[dict[str, Any], dict[str, dict[str, Any]], dict[str, Any]]:
    cohort = authority["cohorts"][cohort_id]
    ids = [row["assignment_id"] for row in rows]
    transaction_id = f"A005-ERSC-V7-ATOMIC8-{cohort_id}-{atomic8_report_sha[:20]}"
    core_ref = final_root / "activation-core-v7-atomic8.json"
    core = {
        "schema_version": "universal-shadow-certification-activation-core-v7-atomic8",
        "status": STATUS,
        "activation_granted": True,
        "activation_transaction_id": transaction_id,
        "cohort_id": cohort_id,
        "assignment_count": 8,
        "assignment_ids": ids,
        "feature_count": 1944,
        "feature_refs_digest": cohort["feature_refs_digest"],
        "controller_thread_id": CONTROLLER,
        "model": "gpt-5.6-sol",
        "reasoning_effort": "xhigh",
        "policy_v25_sha256": POLICY_SHA,
        "v6_terminal_report_sha256": V6_TERMINAL_SHA,
        "v6_luna_report_sha256": v6_report_sha,
        "atomic8_luna_report_sha256": atomic8_report_sha,
        "credit": 0,
    }
    core_sha = sha_bytes(canonical(core))
    authorizations: dict[str, dict[str, Any]] = {}
    for row in rows:
        intent = WAVE / row["intent_ref"]
        intent_value = load_json(intent)
        authorization = {
            "schema_version": "universal-shadow-certification-leaf-authorization-v7-atomic8",
            "activation_granted": True,
            "activation_transaction_id": transaction_id,
            "cohort_id": cohort_id,
            "assignment_id": row["assignment_id"],
            "activation_core_ref": str(core_ref),
            "activation_core_sha256": core_sha,
            "intent_ref": str(intent.resolve()),
            "intent_sha256": sha(intent),
            "packet_ref": str(Path(row["packet_ref"]).resolve() if Path(row["packet_ref"]).is_absolute() else (WAVE / row["packet_ref"]).resolve()),
            "packet_sha256": row["packet_sha256"],
            "output_directory": row["output_directory"],
            "prospective_agent_path": row["prospective_agent_path"],
            "model": "gpt-5.6-sol",
            "reasoning_effort": "xhigh",
            "credit": 0,
        }
        if intent_value.get("assignment_id") != row["assignment_id"]:
            raise ValueError(f"intent-assignment:{row['assignment_id']}")
        authorizations[row["assignment_id"]] = authorization
    envelope = {
        "schema_version": "universal-shadow-certification-activation-envelope-v7-atomic8",
        "status": STATUS,
        "activation_granted": True,
        "activation_transaction_id": transaction_id,
        "cohort_id": cohort_id,
        "assignment_count": 8,
        "assignment_ids": ids,
        "activation_core_ref": str(core_ref),
        "activation_core_sha256": core_sha,
        "authorization_count": 8,
        "authorization_sha256_by_assignment": {
            aid: sha_bytes(canonical(value)) for aid, value in authorizations.items()
        },
        "policy_v25_sha256": POLICY_SHA,
        "credit": 0,
    }
    return core, authorizations, envelope


def document_consistency_errors(
    core: dict[str, Any], authorizations: dict[str, dict[str, Any]], envelope: dict[str, Any], cohort_id: str
) -> list[str]:
    errors: list[str] = []
    ids = expected_ids(cohort_id)
    if core.get("cohort_id") != cohort_id or core.get("assignment_ids") != ids or core.get("assignment_count") != 8:
        errors.append("core-scope")
    if core.get("feature_count") != 1944 or core.get("model") != "gpt-5.6-sol" or core.get("reasoning_effort") != "xhigh":
        errors.append("core-binding")
    if set(authorizations) != set(ids):
        errors.append("authorization-membership")
    core_sha = sha_bytes(canonical(core))
    for aid, value in authorizations.items():
        if value.get("assignment_id") != aid or value.get("cohort_id") != cohort_id:
            errors.append(f"authorization-scope:{aid}")
        if value.get("activation_core_sha256") != core_sha:
            errors.append(f"authorization-core:{aid}")
    if envelope.get("cohort_id") != cohort_id or envelope.get("assignment_ids") != ids:
        errors.append("envelope-scope")
    if envelope.get("authorization_count") != 8 or envelope.get("activation_core_sha256") != core_sha:
        errors.append("envelope-core")
    expected_hashes = {aid: sha_bytes(canonical(value)) for aid, value in authorizations.items()}
    if envelope.get("authorization_sha256_by_assignment") != expected_hashes:
        errors.append("envelope-authorizations")
    transaction_ids = {core.get("activation_transaction_id"), envelope.get("activation_transaction_id")}
    transaction_ids.update(value.get("activation_transaction_id") for value in authorizations.values())
    if len(transaction_ids) != 1:
        errors.append("transaction-id")
    return errors


def schema_validate(documents: list[dict[str, Any]]) -> None:
    from jsonschema import Draft202012Validator
    if importlib.metadata.version("jsonschema") != "4.26.0":
        raise RuntimeError("jsonschema-version")
    schema = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
    Draft202012Validator.check_schema(schema)
    validator = Draft202012Validator(schema)
    for document in documents:
        errors = sorted(validator.iter_errors(document), key=lambda item: list(item.absolute_path))
        if errors:
            raise RuntimeError("schema:" + errors[0].message)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--cohort-id", required=True, choices=("cohort-0001", "cohort-0002"))
    parser.add_argument("--v6-luna-report", required=True, type=Path)
    parser.add_argument("--v6-luna-report-sha256", required=True)
    parser.add_argument("--atomic8-luna-report", required=True, type=Path)
    parser.add_argument("--atomic8-luna-report-sha256", required=True)
    args = parser.parse_args()

    if sha(POLICY_PATH) != POLICY_SHA or sha(V6_TERMINAL_PATH) != V6_TERMINAL_SHA:
        raise SystemExit("fixed-input-drift")
    if not TERMINAL_REPORT_PATH.is_file():
        raise SystemExit("terminal-preparation-report-missing")
    if sha(args.v6_luna_report) != args.v6_luna_report_sha256:
        raise SystemExit("v6-report-sha")
    if sha(args.atomic8_luna_report) != args.atomic8_luna_report_sha256:
        raise SystemExit("atomic8-report-sha")

    authority = load_json(AUTHORITY_PATH)
    v6_report = load_json(args.v6_luna_report)
    atomic8_report = load_json(args.atomic8_luna_report)
    errors = validate_gate_payloads(v6_report, atomic8_report, authority)
    if errors:
        raise SystemExit("gate:" + ",".join(errors))

    ids = expected_ids(args.cohort_id)
    rows_by_id = {row["assignment_id"]: row for row in manifest_rows()}
    rows = [rows_by_id[aid] for aid in ids]
    errors = targeted_zero_state(rows)
    if errors:
        raise SystemExit("zero-state:" + ",".join(errors))

    final_root = TRANSACTIONS_ROOT / args.cohort_id
    if final_root.exists():
        raise SystemExit("activation-transaction-exists")
    TRANSACTIONS_ROOT.mkdir(parents=True, exist_ok=True)
    temporary = Path(tempfile.mkdtemp(prefix=f".{args.cohort_id}-", dir=TRANSACTIONS_ROOT))
    try:
        core, authorizations, envelope = build_documents(
            args.cohort_id, rows, authority,
            args.v6_luna_report_sha256, args.atomic8_luna_report_sha256, final_root,
        )
        consistency = document_consistency_errors(core, authorizations, envelope, args.cohort_id)
        if consistency:
            raise RuntimeError("consistency:" + ",".join(consistency))
        schema_validate([core, *authorizations.values(), envelope])
        (temporary / "authorizations").mkdir()
        (temporary / "activation-core-v7-atomic8.json").write_bytes(canonical(core))
        for aid, value in authorizations.items():
            (temporary / "authorizations" / f"{aid}.json").write_bytes(canonical(value))
        (temporary / "activation-envelope-v7-atomic8.json").write_bytes(canonical(envelope))
        if targeted_zero_state(rows):
            raise RuntimeError("toctou-zero-state")
        os.replace(temporary, final_root)
    except BaseException:
        if temporary.exists():
            shutil.rmtree(temporary)
        raise
    print(json.dumps({
        "status": STATUS,
        "cohort_id": args.cohort_id,
        "assignment_count": 8,
        "activation_transaction_path": str(final_root),
        "activation_envelope_sha256": sha(final_root / "activation-envelope-v7-atomic8.json"),
        "credit": 0,
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
