#!/usr/bin/env python3
"""Fail-closed verifier for the zero-launch scenario semantic-repair preparation."""
from __future__ import annotations

import argparse
import copy
import hashlib
import importlib.metadata
import importlib.util
import json
import re
import stat
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit

from jsonschema import Draft202012Validator

HERE = Path(__file__).resolve().parent
WAVE = HERE.parents[2]
AUDIT = WAVE.parents[2]
AUTHORITY = HERE / "IMMUTABLE_AUTHORITY.json"
READINESS = HERE / "readiness.json"
SNAPSHOT = HERE / "attempt1_preservation_snapshot.json"
MANIFEST = HERE / "repair_manifest.jsonl"
SCHEMA = HERE / "schema/result.schema.json"
PROMPT = HERE / "leaf_prompt.json"
BASE_SCHEMA = WAVE / "schemas/scenario_adversarial_result.schema.json"
BASE_VALIDATOR = WAVE / "postrun-validator-v1/validate_scenario_postrun_v1.py"
SOURCE_MANIFEST = WAVE / "cohorts/cohort-0002/cohort_manifest.jsonl"
EXPECTED_REJECTED = ["A005SA-0009", "A005SA-0010", "A005SA-0012", "A005SA-0013", "A005SA-0014", "A005SA-0016"]
EXPECTED_COHORT = [f"A005SA-{number:04d}" for number in range(9, 17)]
PRIMARY_SHA = "a3d998309ba2b5be3127329dcbf7168c04fad8dd860246cbe5e11a2f064c87f8"
MODEL = "gpt-5.6-sol"
EFFORT = "ultra"
WEAK_STATES = {"weak", "misapplied", "insufficient"}
PLACEHOLDER = re.compile(r"^(?:tbd|todo|none|n/?a|unknown|unspecified|fix later)[.! ]*$", re.I)

spec = importlib.util.spec_from_file_location("scenario_base_v1_for_repair_v30", BASE_VALIDATOR)
base = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(base)


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def rows(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def direct_https(value: Any) -> bool:
    if not isinstance(value, str) or any(character.isspace() for character in value):
        return False
    parsed = urlsplit(value)
    return parsed.scheme == "https" and bool(parsed.netloc) and parsed.path not in ("", "/search") and "search" not in parsed.netloc.lower()


def concrete(values: Any) -> bool:
    return isinstance(values, list) and bool(values) and all(isinstance(value, str) and len(value.strip()) >= 12 and not PLACEHOLDER.match(value.strip()) for value in values)


def evidence_strength(certification: dict[str, Any]) -> tuple[bool, dict[str, Any]]:
    research = certification.get("research_applicability", {})
    claims = research.get("claims_used", []) if isinstance(research, dict) else []
    urls = {
        url
        for claim in claims if isinstance(claim, dict)
        for url in claim.get("source_urls", []) if direct_https(url)
    }
    labels_ok = bool(claims) and all(isinstance(claim, dict) and isinstance(claim.get("evidence_label"), str) and claim["evidence_label"].strip() for claim in claims)
    strong = (
        research.get("state") == "applicable"
        and research.get("browsing_performed") is True
        and len(claims) >= 1
        and len(urls) >= 2
        and labels_ok
    )
    return strong, {"state": research.get("state"), "claims": len(claims), "unique_direct_sources": len(urls), "labels_ok": labels_ok}


def hardened_feature_errors(certification: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    ref = certification.get("provisional_feature_ref", "<missing>")
    research = certification.get("research_applicability", {})
    state = research.get("state") if isinstance(research, dict) else None
    disposition = certification.get("certification_disposition")
    strong, _ = evidence_strength(certification)
    if state in WEAK_STATES and disposition == "certified":
        errors.append(f"feature:{ref}:certified-forbidden-for-{state}-research")
    if disposition == "certified" and not strong:
        errors.append(f"feature:{ref}:certified-below-evidence-strength-threshold")
    if not strong:
        if disposition != "blocked_insufficient_evidence":
            errors.append(f"feature:{ref}:weak-or-no-evidence-must-fail-closed")
        if not concrete(certification.get("overall_spec_deltas")):
            errors.append(f"feature:{ref}:weak-or-no-evidence-missing-concrete-overall-delta")
        blocked_dimensions = []
        dimensions = certification.get("dimensions", {})
        if isinstance(dimensions, dict):
            for name, dimension in dimensions.items():
                if isinstance(dimension, dict) and dimension.get("disposition") == "blocked_insufficient_evidence" and concrete(dimension.get("spec_deltas")) and dimension.get("scenarios") and dimension.get("acceptance_criteria"):
                    blocked_dimensions.append(name)
        if not blocked_dimensions:
            errors.append(f"feature:{ref}:weak-or-no-evidence-missing-concrete-blocked-dimension")
    return errors


def overlay_schema_errors(result: dict[str, Any]) -> list[str]:
    validator = Draft202012Validator(load(SCHEMA))
    return ["overlay-schema:" + "/".join(str(part) for part in error.absolute_path) + ":" + error.message for error in validator.iter_errors(result)]


def source_rows() -> dict[str, dict[str, Any]]:
    return {row["assignment_id"]: row for row in rows(SOURCE_MANIFEST)}


def adapted_source_row(assignment_id: str) -> dict[str, Any]:
    row = copy.deepcopy(source_rows()[assignment_id])
    row["prospective_agent_path"] = f"/root/sol_controller_v29/a005_scenario_adversarial_{assignment_id[-4:]}_semantic_repair_attempt_0002_ultra_v30"
    row["output_directory"] = str(HERE / f"outputs/{assignment_id}/attempt-0002")
    row["research_binding_by_feature"] = {
        ref: {"result_file_sha256": binding[0], "research_record_sha256": binding[1]}
        for ref, binding in row["research_binding_by_feature"].items()
    }
    return row


def result_errors(result: dict[str, Any], assignment_id: str) -> list[str]:
    errors = overlay_schema_errors(result)
    projected = copy.deepcopy(result)
    projected["schema_version"] = "scenario-adversarial-result-v1"
    projected["attempt_id"] = "attempt-0001"
    projected["reasoning_effort"] = "xhigh"
    errors.extend("base:" + error for error in base.result_errors(projected, adapted_source_row(assignment_id), load(BASE_SCHEMA)))
    for certification in result.get("feature_certifications", []):
        if isinstance(certification, dict):
            errors.extend(hardened_feature_errors(certification))
    return sorted(set(errors))


def binding_errors(binding: Any, label: str) -> list[str]:
    if not isinstance(binding, dict) or set(binding) != {"path", "sha256"}:
        return [f"{label}:shape"]
    path = Path(binding["path"])
    if not path.is_file():
        return [f"{label}:missing"]
    return [] if sha(path) == binding["sha256"] else [f"{label}:sha256"]


def snapshot_errors(snapshot: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    primary = snapshot.get("primary_attempt1_report", {})
    errors.extend(binding_errors({key: primary.get(key) for key in ("path", "sha256")}, "attempt1-primary-report"))
    if primary.get("sha256") != PRIMARY_SHA:
        errors.append("attempt1-primary-report:immutable-sha")
    if not errors:
        report = load(Path(primary["path"]))
        if report.get("status") != "fail_closed" or report.get("rejected_ids") != EXPECTED_REJECTED or report.get("rejected_count") != 6:
            errors.append("attempt1-primary-report:exact-rejected-set")
    if snapshot.get("rejected_ids") != EXPECTED_REJECTED:
        errors.append("snapshot:rejected-set")
    assignments = snapshot.get("assignments", [])
    if [row.get("assignment_id") for row in assignments] != EXPECTED_COHORT:
        errors.append("snapshot:cohort-set-or-order")
    agent_paths: list[str] = []
    native_ids: list[str] = []
    for row in assignments:
        assignment_id = row.get("assignment_id", "<missing>")
        artifacts = row.get("artifacts", {})
        for name in ("result", "dispatch_intent", "dispatch_receipt", "authorization", "intent_overlay"):
            errors.extend(binding_errors(artifacts.get(name), f"attempt1:{assignment_id}:{name}"))
        receipt_binding = artifacts.get("dispatch_receipt", {})
        if isinstance(receipt_binding, dict) and Path(receipt_binding.get("path", "")).is_file():
            receipt = load(Path(receipt_binding["path"]))
            identity = row.get("identity", {})
            for key in ("agent_path", "task_thread_id", "native_child_thread_id", "native_turn_id", "model", "reasoning_effort"):
                if receipt.get(key) != identity.get(key):
                    errors.append(f"attempt1:{assignment_id}:identity:{key}")
            if receipt.get("attempt_id") != "attempt-0001" or receipt.get("result_sha256") != artifacts.get("result", {}).get("sha256"):
                errors.append(f"attempt1:{assignment_id}:receipt-binding")
            agent_paths.append(identity.get("agent_path"))
            native_ids.append(identity.get("native_child_thread_id"))
    if len(agent_paths) != 8 or len(set(agent_paths)) != 8 or len(set(native_ids)) != 8:
        errors.append("attempt1:identity-uniqueness")
    for name, binding in snapshot.get("shared_artifacts", {}).items():
        errors.extend(binding_errors(binding, f"attempt1-shared:{name}"))
    return errors


def expected_files() -> set[Path]:
    files = {AUTHORITY, READINESS, SNAPSHOT, MANIFEST, SCHEMA, PROMPT, HERE / "verify_semantic_repair_attempt_0002.py", HERE / "test_semantic_repair_attempt_0002.py"}
    files.update(HERE / f"intents/{assignment_id}.json" for assignment_id in EXPECTED_REJECTED)
    return files


def verify_preparation() -> dict[str, Any]:
    errors: list[str] = []
    for path in expected_files():
        if not path.is_file():
            errors.append(f"namespace:missing:{path.relative_to(HERE)}")
    actual_files = {path for path in HERE.rglob("*") if path.is_file()}
    foreign = sorted(str(path.relative_to(HERE)) for path in actual_files - expected_files())
    if foreign:
        errors.append("namespace:foreign-files:" + ",".join(foreign))
    if errors:
        return {"status": "fail_closed", "activation": False, "errors": errors}
    authority, readiness, snapshot = load(AUTHORITY), load(READINESS), load(SNAPSHOT)
    errors.extend(snapshot_errors(snapshot))
    if authority.get("activation") is not False or authority.get("activation_authorized") is not False or authority.get("rejected_ids") != EXPECTED_REJECTED:
        errors.append("authority:activation-or-rejected-set")
    if readiness.get("status") != "prepared_blocked" or readiness.get("activation") is not False or readiness.get("activation_authorized") is not False:
        errors.append("readiness:must-remain-blocked")
    if readiness.get("fresh_luna_confirmation", {}).get("state") != "required_absent" or Path(readiness.get("fresh_luna_confirmation", {}).get("future_path", "")).exists():
        errors.append("readiness:fresh-luna-gate")
    if readiness.get("future_prelaunch_gate", {}).get("state") != "required_not_run":
        errors.append("readiness:prelaunch-gate")
    if stat.S_IMODE(AUTHORITY.stat().st_mode) != 0o444 or stat.S_IMODE(READINESS.stat().st_mode) != 0o444 or stat.S_IMODE(SNAPSHOT.stat().st_mode) != 0o444:
        errors.append("immutability:authority-readiness-snapshot-must-be-0444")
    for label, binding in authority.get("artifact_bindings", {}).items():
        errors.extend(binding_errors(binding, f"authority-artifact:{label}"))
    if readiness.get("authority_sha256") != sha(AUTHORITY):
        errors.append("readiness:authority-sha")
    manifest = rows(MANIFEST)
    if [row.get("assignment_id") for row in manifest] != EXPECTED_REJECTED:
        errors.append("manifest:exact-rejected-set")
    original = source_rows()
    new_paths: list[str] = []
    outputs: list[str] = []
    feature_count = 0
    old_paths = {row["identity"]["agent_path"] for row in snapshot["assignments"]}
    for row in manifest:
        assignment_id = row["assignment_id"]
        source = original.get(assignment_id, {})
        for key in ("packet_id", "packet_sha256", "feature_count", "feature_refs_digest", "candidate_evidence_label"):
            if row.get(key) != source.get(key):
                errors.append(f"manifest:{assignment_id}:source:{key}")
        intent_path = Path(row.get("intent_path", ""))
        if not intent_path.is_file() or sha(intent_path) != row.get("intent_sha256"):
            errors.append(f"manifest:{assignment_id}:intent")
            continue
        intent = load(intent_path)
        if intent.get("activation", {}).get("enabled") is not False or intent.get("activation", {}).get("authorized") is not False:
            errors.append(f"intent:{assignment_id}:activation")
        if intent.get("assignment_id") != assignment_id or intent.get("attempt_id") != "attempt-0002" or intent.get("runtime", {}).get("model") != MODEL or intent.get("runtime", {}).get("reasoning_effort") != EFFORT:
            errors.append(f"intent:{assignment_id}:binding")
        if intent.get("runtime", {}).get("fresh_identity_state") != "reserved_unallocated" or intent.get("runtime", {}).get("native_child_thread_id") is not None:
            errors.append(f"intent:{assignment_id}:identity-not-unallocated")
        if intent.get("source_primary_report", {}).get("sha256") != PRIMARY_SHA:
            errors.append(f"intent:{assignment_id}:primary-report")
        new_paths.append(row.get("fresh_identity_path"))
        output = Path(row.get("output_directory", ""))
        outputs.append(str(output))
        if output != HERE / f"outputs/{assignment_id}/attempt-0002" or not output.is_dir() or any(output.iterdir()):
            errors.append(f"output:{assignment_id}:not-separate-empty")
        feature_count += int(row.get("feature_count", 0))
    if len(set(new_paths)) != 6 or old_paths.intersection(new_paths):
        errors.append("attempt2:fresh-identity-uniqueness")
    if len(set(outputs)) != 6:
        errors.append("attempt2:output-uniqueness")
    if feature_count != 687:
        errors.append("manifest:feature-count")
    if authority.get("zero_state") != {"results": 0, "receipts": 0, "native_capture_rows": 0, "credit": 0, "spawned_children": 0}:
        errors.append("authority:zero-state")
    Draft202012Validator.check_schema(load(SCHEMA))
    status = "pass_blocked" if not errors else "fail_closed"
    return {
        "status": status,
        "activation": False,
        "activation_authorized": False,
        "errors": sorted(set(errors)),
        "counts": {"repair_assignments": len(manifest), "features": feature_count, "fresh_identities_reserved": len(set(new_paths)), "empty_output_directories": sum(1 for value in outputs if Path(value).is_dir() and not any(Path(value).iterdir())), "results": 0, "receipts": 0, "native_capture_rows": 0, "credit": 0, "spawned_children": 0},
        "primary_attempt1_report_sha256": sha(Path(snapshot["primary_attempt1_report"]["path"])),
        "rejected_ids": EXPECTED_REJECTED,
        "fresh_luna_confirmation": "required_absent",
        "future_prelaunch_gate": "required_not_run"
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()
    if importlib.metadata.version("jsonschema") != "4.25.1":
        raise SystemExit("jsonschema-version")
    report = verify_preparation()
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass_blocked" else 1)


if __name__ == "__main__":
    main()
