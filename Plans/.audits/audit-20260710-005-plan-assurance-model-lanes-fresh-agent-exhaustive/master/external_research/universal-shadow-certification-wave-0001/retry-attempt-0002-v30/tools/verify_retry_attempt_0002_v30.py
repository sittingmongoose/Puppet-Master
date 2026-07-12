#!/usr/bin/env python3
"""Fail-closed verifier for the inactive V30 attempt-0002 retry preparation."""
from __future__ import annotations

import argparse
import copy
import hashlib
import importlib.metadata
import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker

AUDIT = Path("/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive")
WAVE = AUDIT / "master/external_research/universal-shadow-certification-wave-0001"
HERE = Path(__file__).resolve().parents[1]
TOOLS = HERE / "tools"
V8 = WAVE / "validation/activation-binding-v8-validator-runtime-supersession"
V29 = V8 / "activation-transactions-v29-ultra"
OUTPUT_ROOT = AUDIT / "external_research_universal_shadow_certification_v1"
PYTHON = Path("/Users/jaredsmacbookair/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3")
SITE = AUDIT / "master/dependencies/jsonschema-draft202012-v1/site-packages"
ATTEMPT = "attempt-0002"
MODEL = "gpt-5.6-sol"
EFFORT = "ultra"
DIGEST = "c4ce218e0aa044d850b1b026fe10b98766138748b585e2680916fb80964cc70f"
PRIMARY_SHAS = {
    "cohort-0001": "45bec51e3bedc80f9ca2af7bb10d0fdecf581021a803eae723bc0d699084f214",
    "cohort-0002": "c756c049c3ae93c518b155d69c64b595e05c2ae04b62f82226c4dd7d89c60454",
}
V8_PINS = {
    "authority_v8": (V8 / "AUTHORITY_V8.json", "f36db3670c6d33f4c3bac0832ac9f788ea6193d5dacf5b4f9f608bbb1d51258c"),
    "verify_binding_v8": (V8 / "verify_binding_v8.py", "50ce0b82787b9b5a6ae70820a2c4dfaba723bc626ef3fdf316ee554c0a4e1c9c"),
    "test_binding_v8": (V8 / "test_binding_v8.py", "7e92eac72fc39506234b7ba6a4fac22da0d0118ca9fe6683a4b2e65d87d7652a"),
    "validator_v2": (WAVE / "validation/postrun-validator-v2/validate_universal_shadow_certification_postrun_v2.py", "789bca95c1dbd8ef89a5db06c041c23c67ef330324552ebb1e3602fd24cfa254"),
    "tests_v2": (WAVE / "validation/postrun-validator-v2/test_universal_shadow_certification_postrun_v2.py", "f42b563c1c13010695f2ab3cab37eef4d763738928c48655f59a5a746ce79961"),
    "validator_authority_v2": (WAVE / "validation/postrun-validator-v2/VALIDATOR_AUTHORITY_V2.json", "9eec930af0efebee5734892d2d0d9e5836a2bb79928c817492cd73a1ea7d4b97"),
    "base_result_schema": (WAVE / "schemas/result.schema.json", "d0aad92e52ece20c3164535b2a9fa7a780e57f49343cd7a1ba9ad96d28eec0b1"),
    "dependency_binding": (WAVE / "validation/postrun-validator-v2/dependency-binding-v1/terminal-independent-binding-report.json", "f5cb2e7cc0bb51153c606a37f2808df33a4f815270712cd1f92b427707347b37"),
    "cache_authority": (AUDIT / "master/dependencies/jsonschema-draft202012-v1/cache-reconciliation-v3/authority.json", "f82c8796be8802ac3735c4e24c74b48b54efe2752e0a294c2844d7f98b2a03bc"),
    "cache_report": (AUDIT / "master/dependencies/jsonschema-draft202012-v1/cache-reconciliation-v3/terminal-cache-reconciliation-v3.json", "1b7b88edbcba737e81a02fc81e0b87600c58e3be300f91429c9d61dec653e88e"),
}

sys.path.insert(0, str(AUDIT))
from universal_shadow_certification_common import validate_result_document  # noqa: E402


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def ids_for(cohort_id: str) -> list[str]:
    start = 1 if cohort_id == "cohort-0001" else 9
    return [f"A005ERSC-{number:04d}" for number in range(start, start + 8)]


def agent_path(aid: str) -> str:
    return f"/root/sol_controller_v29/a005_ersc_{int(aid[-4:]):04d}_attempt_0002_ultra_v30"


def prior_result(aid: str) -> Path:
    return OUTPUT_ROOT / aid / "attempts/attempt-0001/result.json"


def output_dir(aid: str) -> Path:
    return OUTPUT_ROOT / aid / "attempts/attempt-0002"


def isolated_env() -> dict[str, str]:
    return {
        "PATH": str(PYTHON.parent) + os.pathsep + os.environ.get("PATH", ""),
        "PYTHONPATH": str(SITE),
        "PYTHONNOUSERSITE": "1",
        "PYTHONDONTWRITEBYTECODE": "1",
        "PYTHONHASHSEED": "0",
    }


def corrected(row: dict[str, Any]) -> dict[str, Any]:
    value = copy.deepcopy(load(prior_result(row["assignment_id"])))
    value["attempt_id"] = ATTEMPT
    value["agent_path"] = agent_path(row["assignment_id"])
    value["input_binding"]["source_transaction_digest"] = DIGEST
    return value


def run_v2_suite() -> tuple[dict[str, Any], int, str]:
    path = WAVE / "validation/postrun-validator-v2/test_universal_shadow_certification_postrun_v2.py"
    proc = subprocess.run([str(PYTHON), "-S", "-B", str(path)], cwd=AUDIT, env=isolated_env(), capture_output=True, text=True, check=False)
    try:
        report = json.loads(proc.stdout)
    except Exception:
        report = {"status": "unparseable", "stdout": proc.stdout[-2000:]}
    return report, proc.returncode, proc.stderr[-2000:]


def schema_case_suite(rows: list[dict[str, Any]]) -> tuple[dict[str, bool], int, int]:
    checks: dict[str, bool] = {}
    positives = 0
    negatives = 0
    row_by_id = {row["assignment_id"]: row for row in rows}
    for cohort_id in ("cohort-0001", "cohort-0002"):
        schema = load(HERE / cohort_id / "schema/result.schema.json")
        Draft202012Validator.check_schema(schema)
        validator = Draft202012Validator(schema, format_checker=FormatChecker())
        ids = ids_for(cohort_id)
        for offset, aid in enumerate(ids):
            row = row_by_id[aid]
            document = corrected(row)
            checks[f"schema:{aid}:corrected-positive"] = not list(validator.iter_errors(document))
            positives += 1
            wrong_digest = copy.deepcopy(document)
            wrong_digest["input_binding"]["source_transaction_digest"] = "0" * 64
            checks[f"schema:{aid}:reject-wrong-digest"] = bool(list(validator.iter_errors(wrong_digest)))
            negatives += 1
            wrong_path = copy.deepcopy(document)
            wrong_path["agent_path"] = agent_path(ids[(offset + 1) % 8])
            checks[f"schema:{aid}:reject-cross-assignment-path"] = bool(list(validator.iter_errors(wrong_path)))
            negatives += 1
            old_attempt = copy.deepcopy(document)
            old_attempt["attempt_id"] = "attempt-0001"
            checks[f"schema:{aid}:reject-attempt-0001"] = bool(list(validator.iter_errors(old_attempt)))
            negatives += 1

            semantic_probe = copy.deepcopy(document)
            semantic_probe["attempt_id"] = "attempt-0001"
            semantic_probe["reasoning_effort"] = "xhigh"
            semantic_assignment = copy.deepcopy(row)
            semantic_assignment["prospective_agent_path"] = agent_path(aid)
            packet = load(WAVE / row["packet_ref"])
            checks[f"semantic:{aid}:unchanged-complete-validator"] = validate_result_document(semantic_probe, semantic_assignment, packet) == []

        representative = corrected(row_by_id[ids[0]])
        mutations: list[tuple[str, Any]] = []
        value = copy.deepcopy(representative); value["foreign"] = True; mutations.append(("extra-top-key", value))
        value = copy.deepcopy(representative); value["model"] = "gpt-5.6-luna"; mutations.append(("wrong-model", value))
        value = copy.deepcopy(representative); value["reasoning_effort"] = "xhigh"; mutations.append(("wrong-effort", value))
        value = copy.deepcopy(representative); value["status"] = "incomplete"; mutations.append(("wrong-status", value))
        value = copy.deepcopy(representative); del value["input_binding"]["packet_sha256"]; mutations.append(("missing-packet-sha", value))
        value = copy.deepcopy(representative); value["coverage"]["extra"] = 1; mutations.append(("extra-coverage-key", value))
        value = copy.deepcopy(representative); value["self_attestation"]["no_descendants_or_peer_outputs"] = False; mutations.append(("false-attestation", value))
        value = copy.deepcopy(representative); value["feature_certifications"] = value["feature_certifications"][:-1]; mutations.append(("242-certifications", value))
        value = copy.deepcopy(representative); value["coverage"]["feature_refs"][1] = value["coverage"]["feature_refs"][0]; mutations.append(("duplicate-feature-ref", value))
        value = copy.deepcopy(representative)
        citation = next((citation for feature in value["feature_certifications"] for citation in feature.get("citations", [])), None)
        if citation is not None:
            citation["accessed_date"] = "2026-99-99"
        mutations.append(("invalid-accessed-date", value))
        for label, value in mutations:
            checks[f"schema:{cohort_id}:reject-{label}"] = bool(list(validator.iter_errors(value)))
            negatives += 1
    return checks, positives, negatives


def validate_gate(cohort_id: str, kind: str, path: Path, authority: dict[str, Any], manifest: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if not path.is_file():
        return [f"gate-missing:{cohort_id}:{kind}"]
    try:
        gate = load(path)
    except Exception as exc:
        return [f"gate-parse:{cohort_id}:{kind}:{type(exc).__name__}"]
    required = {
        "schema_version", "status", "cohort_id", "attempt_id", "reviewer_model", "reasoning_effort",
        "reviewer_agent_path", "reviewer_thread_id", "fresh_identity", "independent_of_controller",
        "authority_sha256", "manifest_sha256", "primary_attempt_0001_sha256", "errors",
    }
    if set(gate) != required:
        errors.append(f"gate-key-set:{cohort_id}:{kind}")
    expected_schema = f"universal-shadow-certification-luna-{kind}-v30-attempt-0002"
    expected = {
        "schema_version": expected_schema,
        "status": "PASS",
        "cohort_id": cohort_id,
        "attempt_id": ATTEMPT,
        "reviewer_model": "gpt-5.6-luna",
        "reasoning_effort": "max",
        "fresh_identity": True,
        "independent_of_controller": True,
        "authority_sha256": sha(HERE / cohort_id / "AUTHORITY.json"),
        "manifest_sha256": sha(HERE / cohort_id / "manifest.json"),
        "primary_attempt_0001_sha256": PRIMARY_SHAS[cohort_id],
        "errors": [],
    }
    for key, value in expected.items():
        if gate.get(key) != value:
            errors.append(f"gate-field:{cohort_id}:{kind}:{key}")
    if not str(gate.get("reviewer_agent_path", "")).startswith("/root/luna"):
        errors.append(f"gate-reviewer-path:{cohort_id}:{kind}")
    if gate.get("reviewer_thread_id") in {None, "", "019f551e-5c00-7a73-afa3-7b57d8f0f442"}:
        errors.append(f"gate-reviewer-thread:{cohort_id}:{kind}")
    return errors


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=("preparation", "prelaunch"), default="preparation")
    args = parser.parse_args()
    checks: dict[str, bool] = {}
    errors: list[str] = []
    initial_v8 = {name: sha(path) for name, (path, _) in V8_PINS.items()}
    for name, (_, expected) in V8_PINS.items():
        checks[f"v8-pin:{name}"] = initial_v8[name] == expected

    root_path = HERE / "AUTHORITY_V30_ATTEMPT_0002.json"
    terminal_path = HERE / "terminal-preparation-report.json"
    root = load(root_path)
    terminal = load(terminal_path)
    checks["root:terminal-authority-hash"] = terminal.get("authority_sha256") == sha(root_path)
    checks["root:digest"] = root.get("source_transaction_digest") == DIGEST
    checks["root:atomic8x2"] = root.get("cohort_count") == 2 and root.get("atomic_size") == 8 and root.get("assignment_count") == 16 and root.get("atomic16_forbidden") is True
    checks["root:inactive"] = root.get("activation_authorized") is False and root.get("launch_authorized") is False and root.get("spawn") == "none" and root.get("spawn_count") == 0
    checks["root:zero-credit"] = all(value == 0 for value in root.get("credits", {}).values())
    for name, expected in root.get("tool_hashes", {}).items():
        path = TOOLS / name
        checks[f"tool-hash:{name}"] = path.is_file() and sha(path) == expected

    inventory_path = AUDIT / root["inventory_ref"]
    inventory = jsonl(inventory_path)
    checks["lineage:inventory-hash"] = sha(inventory_path) == root.get("inventory_sha256")
    checks["lineage:inventory-count-78"] = len(inventory) == 78
    for item in inventory:
        path = AUDIT / item["relative_path"]
        checks[f"lineage:{item['relative_path']}"] = path.is_file() and path.stat().st_size == item["byte_count"] and sha(path) == item["sha256"]

    rows = jsonl(WAVE / "batch_manifest.jsonl")
    row_by_id = {row["assignment_id"]: row for row in rows}
    all_refs: list[str] = []
    empty_outputs = 0
    receipt_count = 0
    result_count = 0
    gate_identities: list[str] = []
    for cohort_id in ("cohort-0001", "cohort-0002"):
        cohort_root = HERE / cohort_id
        authority_path = cohort_root / "AUTHORITY.json"
        readiness_path = cohort_root / "readiness.json"
        manifest_path = cohort_root / "manifest.json"
        schema_path = cohort_root / "schema/result.schema.json"
        prompt_path = cohort_root / "prompt/leaf_prompt.json"
        authority = load(authority_path)
        readiness = load(readiness_path)
        manifest = load(manifest_path)
        schema = load(schema_path)
        checks[f"{cohort_id}:primary-sha"] = sha(V29 / cohort_id / "postrun/primary_postrun.json") == PRIMARY_SHAS[cohort_id]
        primary = load(V29 / cohort_id / "postrun/primary_postrun.json")
        checks[f"{cohort_id}:rejected8-eligible0"] = primary.get("rejected_count") == 8 and primary.get("eligible_count") == 0 and primary.get("rejected_ids") == ids_for(cohort_id) and primary.get("eligible_ids") == []
        checks[f"{cohort_id}:authority-inactive"] = authority.get("activation_authorized") is False and authority.get("launch_authorized") is False and authority.get("spawn") == "none" and authority.get("atomic16_forbidden") is True
        checks[f"{cohort_id}:readiness-blocked"] = readiness.get("ready_for_activation") is False and readiness.get("activation_authorized") is False and readiness.get("launch_authorized") is False and readiness.get("spawn") == "none"
        checks[f"{cohort_id}:manifest-atomic8"] = manifest.get("assignment_count") == 8 and manifest.get("atomic_size") == 8 and manifest.get("atomic16_forbidden") is True and manifest.get("activation_authorized") is False and manifest.get("spawn") == "none"
        checks[f"{cohort_id}:manifest-hash"] = authority.get("manifest_sha256") == sha(manifest_path) and readiness.get("manifest_sha256") == sha(manifest_path)
        checks[f"{cohort_id}:schema-hash"] = authority.get("schema_sha256") == sha(schema_path) and manifest.get("schema_sha256") == sha(schema_path)
        checks[f"{cohort_id}:prompt-hash"] = authority.get("prompt_sha256") == sha(prompt_path) and manifest.get("prompt_sha256") == sha(prompt_path)
        checks[f"{cohort_id}:digest-const"] = schema["properties"]["input_binding"]["properties"]["source_transaction_digest"] == {"const": DIGEST, "type": "string"}
        checks[f"{cohort_id}:eight-exact-paths"] = set(schema["properties"]["agent_path"].get("enum", [])) == {agent_path(aid) for aid in ids_for(cohort_id)}
        checks[f"{cohort_id}:oneof-eight-pairs"] = len(schema.get("allOf", [{}])[0].get("oneOf", [])) == 8
        Draft202012Validator.check_schema(schema)
        for item in manifest.get("assignments", []):
            aid = item["assignment_id"]
            intent_path = Path(item["intent_ref"])
            auth_path = Path(item["authorization_ref"])
            intent = load(intent_path)
            auth = load(auth_path)
            checks[f"{aid}:intent-hash"] = sha(intent_path) == item["intent_sha256"]
            checks[f"{aid}:auth-hash"] = sha(auth_path) == item["authorization_sha256"]
            checks[f"{aid}:exact-agent-path"] = intent.get("prospective_agent_path") == auth.get("agent_path") == item.get("agent_path") == agent_path(aid)
            checks[f"{aid}:inactive-spawn-none"] = all(value.get("activation_authorized") is False and value.get("launch_authorized") is False and value.get("spawn") == "none" for value in (intent, auth, item))
            checks[f"{aid}:digest"] = intent.get("source_transaction_digest") == auth.get("expected_source_transaction_digest") == DIGEST
            out = Path(item["output_directory"])
            is_empty = out.is_dir() and not any(out.iterdir())
            empty_outputs += int(is_empty)
            checks[f"{aid}:empty-attempt-0002-output"] = is_empty
            result_count += int(Path(item["result_ref"]).exists())
            receipt_count += int(Path(item["receipt_ref"]).exists())
            all_refs.extend(row_by_id[aid]["feature_refs"])

        gate_specs = {
            "primary-rejected-set": cohort_root / "independent-validation/luna-primary-rejected-set.json",
            "atomic8-prelaunch": cohort_root / "independent-validation/luna-atomic8-prelaunch.json",
        }
        for kind, path in gate_specs.items():
            if args.mode == "preparation":
                checks[f"gate:{cohort_id}:{kind}:absent-before-validation"] = not path.exists()
            else:
                gate_errors = validate_gate(cohort_id, kind, path, authority, manifest)
                errors.extend(gate_errors)
                if path.is_file():
                    gate_identities.append(load(path).get("reviewer_thread_id", ""))

    checks["coverage:3888"] = len(all_refs) == 3888
    checks["coverage:3888-unique"] = len(set(all_refs)) == 3888
    checks["zero-state:16-empty-outputs"] = empty_outputs == 16
    checks["zero-state:no-results"] = result_count == 0
    checks["zero-state:no-receipts"] = receipt_count == 0
    checks["zero-state:no-native-capture"] = not any(HERE.glob("cohort-*/runtime/native_capture.json"))
    checks["zero-state:no-activation-files"] = not any(path.name in {"activation_core.json", "activation_envelope.json"} for path in HERE.rglob("*"))
    if args.mode == "prelaunch":
        checks["gates:four-fresh-identities"] = len(gate_identities) == 4 and len(set(gate_identities)) == 4

    schema_checks, positive_count, negative_count = schema_case_suite(rows)
    checks.update(schema_checks)
    v2, v2_rc, v2_stderr = run_v2_suite()
    counts = v2.get("counts", {})
    checks["v8-suite:exit-zero"] = v2_rc == 0
    checks["v8-suite:status"] = v2.get("status") == "pass_fail_closed"
    checks["v8-suite:437"] = counts.get("passed") == counts.get("total") == 437 and counts.get("failed") == 0
    checks["v8-suite:12-bypasses"] = v2.get("bypass_reproductions", {}).get("rejected") == v2.get("bypass_reproductions", {}).get("total") == 12
    checks["v8-suite:100-fuzz"] = v2.get("generic_schema_fuzz", {}).get("rejected") == v2.get("generic_schema_fuzz", {}).get("total") == 100
    checks["engine:draft202012"] = Draft202012Validator.META_SCHEMA.get("$id") == "https://json-schema.org/draft/2020-12/schema"
    checks["engine:jsonschema-4.26.0"] = importlib.metadata.version("jsonschema") == "4.26.0"
    checks["engine:python-3.12.13"] = sys.version.split()[0] == "3.12.13"
    cache = load(V8_PINS["cache_report"][0])
    checks["engine:semantic-tree-152"] = cache.get("semantic_file_count") == 152 and cache.get("semantic_tree_sha256") == "f117d8770a942f1760a6555f7544e697d5fdfc2a06a8af608f300e94ac75ee95" and cache.get("runtime_caches_authoritative") is False
    checks["toctou:v8-pins-stable"] = {name: sha(path) for name, (path, _) in V8_PINS.items()} == initial_v8

    errors.extend(sorted(name for name, passed in checks.items() if not passed))
    local_count = len(checks)
    total = 437 + local_count
    passed = 437 + sum(checks.values()) if checks.get("v8-suite:437") else sum(checks.values())
    report = {
        "schema_version": "universal-shadow-certification-retry-verifier-v30-attempt-0002",
        "mode": args.mode,
        "status": "pass_preparation_only" if not errors and args.mode == "preparation" else ("pass_prelaunch_gates" if not errors else "fail_closed"),
        "errors": sorted(set(errors)),
        "tests": {"passed": passed, "failed": total - passed, "total": total, "v8_substantive_cases": 437, "corrected_positive_documents": positive_count, "new_negative_schema_cases": negative_count, "v8_bypass_reproductions_rejected": 12, "v8_schema_fuzz_rejected": 100, "local_live_checks": local_count},
        "counts": {"cohorts": 2, "assignments": 16, "features": 3888, "empty_attempt_0002_outputs": empty_outputs, "results": result_count, "receipts": receipt_count, "native_capture_rows": 0, "activation_transactions": 0, "credit": 0},
        "primary_attempt_0001_shas": PRIMARY_SHAS,
        "source_transaction_digest": DIGEST,
        "schema_engine": {"library": "jsonschema", "version": importlib.metadata.version("jsonschema"), "validator": "Draft202012Validator", "python": sys.version.split()[0]},
        "v8_suite": {"status": v2.get("status"), "counts": counts, "bypass_reproductions": v2.get("bypass_reproductions"), "generic_schema_fuzz": v2.get("generic_schema_fuzz"), "stderr": v2_stderr},
        "activation_authorized": False,
        "launch_authorized": False,
        "spawn": "none",
        "fresh_luna_validation_required": True,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
