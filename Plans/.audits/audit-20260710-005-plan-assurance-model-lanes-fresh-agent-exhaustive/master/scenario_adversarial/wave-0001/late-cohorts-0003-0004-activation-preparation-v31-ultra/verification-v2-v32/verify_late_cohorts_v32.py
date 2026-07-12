#!/usr/bin/env python3
"""Append-only V32 verifier supersession for the immutable V31 preparation."""
from __future__ import annotations

import hashlib
import importlib.metadata
import importlib.util
import json
import sys
from pathlib import Path
from typing import Any

AUDIT = Path("/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive")
WAVE = AUDIT / "master/scenario_adversarial/wave-0001"
BASE = Path(__file__).resolve().parents[1]
HERE = Path(__file__).resolve().parent
AUTHORITY = HERE / "AUTHORITY.json"
TARGET_IDS = [f"A005SA-{number:04d}" for number in range(17, 33)]
EXPECTED_TOOLS = {"prepare_late_cohorts_v31.py", "verify_late_cohorts_v31.py", "test_late_cohorts_v31.py", "finalize_late_cohorts_v31.py"}
EXPECTED_RUNTIME = {"python": "3.12.13", "jsonschema": "4.26.0"}

spec = importlib.util.spec_from_file_location("late_v31_immutable", BASE / "verify_late_cohorts_v31.py")
late = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(late)


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def path_binding_errors(intent: dict[str, Any], authorization: dict[str, Any], row: dict[str, Any]) -> list[str]:
    aid = row["assignment_id"]
    output = Path(row["output_directory"])
    result = str(output / "result.json")
    receipt = str(WAVE / f"dispatch/{aid}/attempt-0001/dispatch_receipt.json")
    expected = {
        "intent:future_result_path": (intent.get("future_result_path"), result),
        "intent:future_receipt_path": (intent.get("future_receipt_path"), receipt),
        "authorization:future_result_path": (authorization.get("future_result_path"), result),
        "authorization:future_receipt_path": (authorization.get("future_receipt_path"), receipt),
    }
    return [f"{aid}:{label}" for label, (actual, wanted) in expected.items() if actual != wanted]


def authority_errors(value: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if set(value.get("tool_hashes", {})) != EXPECTED_TOOLS:
        errors.append("authority:tool-hash-key-set")
    for name in EXPECTED_TOOLS:
        path = BASE / name
        if not path.is_file() or value.get("tool_hashes", {}).get(name) != sha(path):
            errors.append(f"authority:tool-hash:{name}")
    if value.get("policy_v31_sha256") != "95de3fd798c857751cc6b031d62a4a7a40abe931f9fa1e49590cff0fec6257b5":
        errors.append("authority:policy-v31")
    return errors


def actual_runtime_census() -> tuple[dict[str, int], list[str]]:
    errors: list[str] = []
    counts = {"results": 0, "receipts": 0, "native_capture_rows": 0, "activation_transactions": 0, "live_v31_identity_rows": 0}
    allowed = "activation-transaction-v31-ultra-atomic8-preparation"
    for cohort_id in ("cohort-0003", "cohort-0004"):
        root = WAVE / f"cohorts/{cohort_id}"
        for child in root.iterdir():
            if child.is_dir() and child.name.startswith("activation-transaction") and child.name != allowed:
                counts["activation_transactions"] += 1
                errors.append(f"census:foreign-activation-transaction:{cohort_id}:{child.name}")
        if (root / "activation.json").exists():
            counts["activation_transactions"] += 1
            errors.append(f"census:activation-json:{cohort_id}")
        for row in late.jsonl(root / f"{allowed}/transaction_manifest.jsonl"):
            aid = row["assignment_id"]
            output = Path(row["output_directory"])
            result = output / "result.json"
            receipt = WAVE / f"dispatch/{aid}/attempt-0001/dispatch_receipt.json"
            counts["results"] += int(result.exists())
            counts["receipts"] += int(receipt.exists())
            if result.exists() or receipt.exists():
                errors.append(f"census:runtime-output:{aid}")
    needles = set(TARGET_IDS) | {late.expected_agent_path(aid) for aid in TARGET_IDS}
    for path in AUDIT.rglob("*capture*.json*"):
        if not path.is_file():
            continue
        text = path.read_text(encoding="utf-8", errors="replace")
        hits = [needle for needle in needles if needle in text]
        if hits:
            counts["native_capture_rows"] += len({hit for hit in hits if hit.startswith("A005SA-")})
            counts["live_v31_identity_rows"] += len({hit for hit in hits if hit.startswith("/root/")})
            errors.append(f"census:target-native-capture:{path.relative_to(AUDIT)}")
    return counts, errors


def verify_hardened() -> dict[str, Any]:
    errors: list[str] = []
    base = late.verify_preparation()
    if base.get("status") != "pass_blocked" or base.get("errors") != []:
        errors.append("base-v31-verifier")
    actual_runtime = {"python": sys.version.split()[0], "jsonschema": importlib.metadata.version("jsonschema")}
    if actual_runtime != EXPECTED_RUNTIME:
        errors.append("runtime:pinned-versions")
    root_authority = load(BASE / "IMMUTABLE_AUTHORITY.json")
    errors.extend(authority_errors(root_authority))
    if not AUTHORITY.is_file():
        errors.append("v32-authority:missing")
        v32 = {}
    else:
        v32 = load(AUTHORITY)
        expected_bindings = {
            "v31_authority_sha256": sha(BASE / "IMMUTABLE_AUTHORITY.json"),
            "v31_readiness_sha256": sha(BASE / "readiness.json"),
            "v31_terminal_sha256": sha(BASE / "terminal_preparation_report.json"),
            "v31_verifier_sha256": sha(BASE / "verify_late_cohorts_v31.py"),
            "v31_test_sha256": sha(BASE / "test_late_cohorts_v31.py"),
            "policy_v32_sha256": "4826ade4c38db47ee184b34e5d7b7bd5ba6cabeecc9baa686cb9d99eeff8a3ed",
        }
        for key, wanted in expected_bindings.items():
            if v32.get(key) != wanted:
                errors.append(f"v32-authority:{key}")
        if v32.get("verifier_sha256") != sha(Path(__file__)) or v32.get("test_sha256") != sha(HERE / "test_late_cohorts_v32.py"):
            errors.append("v32-authority:tool-hashes")
        if any(v32.get(key) not in (False, 0, "none") for key in ("activation", "activation_authorized", "launch_authorized", "credit")) or v32.get("spawn") != "none":
            errors.append("v32-authority:zero-state")
    path_checks = 0
    for cohort_id in ("cohort-0003", "cohort-0004"):
        root = late.tx_root(cohort_id)
        for row in late.jsonl(root / "transaction_manifest.jsonl"):
            intent = load(Path(row["intent_path"]))
            auth = load(Path(row["authorization_path"]))
            errors.extend(path_binding_errors(intent, auth, row))
            path_checks += 4
    census, census_errors = actual_runtime_census()
    errors.extend(census_errors)
    if any(census.values()):
        errors.append("census:nonzero")
    return {
        "schema_version": "scenario-late-cohorts-v32-verifier-supersession-v2",
        "status": "pass_blocked" if not errors else "fail_closed",
        "errors": sorted(set(errors)),
        "base_v31_status": base.get("status"),
        "runtime": actual_runtime,
        "path_binding_checks": path_checks,
        "actual_zero_state_census": census,
        "activation": False,
        "activation_authorized": False,
        "launch_authorized": False,
        "spawn": "none",
        "credit": 0,
        "future_activation_policy_v32_required": True,
    }


def main() -> None:
    report = verify_hardened()
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass_blocked" else 1)


if __name__ == "__main__":
    main()
