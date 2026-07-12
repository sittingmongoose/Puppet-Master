#!/usr/bin/env python3
"""Fail-closed V31 prelaunch gate for cohort-0002 semantic repair attempt-0002."""
from __future__ import annotations

import argparse
import copy
import hashlib
import importlib.util
import ipaddress
import json
import os
import re
import stat
from datetime import datetime
from pathlib import Path
from typing import Any, Callable
from urllib.parse import urlsplit, urlunsplit

from jsonschema import Draft202012Validator

HERE = Path(__file__).resolve().parent
WAVE = HERE.parents[2]
AUDIT = WAVE.parents[2]
V30 = HERE.parent / "semantic-repair-attempt-0002-preparation-v30"
PRIMARY = WAVE / "postrun-validator-v29-ultra/primary-execution/cohort-0002-primary-postrun.json"
LUNA = WAVE / "postrun-validator-v29-ultra/independent-execution/cohort-0002-luna-postrun.json"
POLICY_V32 = AUDIT / "master/coordination/CONCURRENCY_POLICY_V32.json"
SOURCE_MANIFEST = WAVE / "cohorts/cohort-0002/cohort_manifest.jsonl"
BASE_SCHEMA = WAVE / "schemas/scenario_adversarial_result.schema.json"
BASE_VALIDATOR = WAVE / "postrun-validator-v1/validate_scenario_postrun_v1.py"

AUTHORITY = HERE / "IMMUTABLE_AUTHORITY.json"
READINESS = HERE / "readiness.json"
MANIFEST = HERE / "gate_manifest.jsonl"
RESULT_SCHEMA = HERE / "schema/result.schema.json"
CAPTURE_SCHEMA = HERE / "schema/controller_parent_native_capture.schema.json"
LUNA_SCHEMA = HERE / "schema/luna_confirmation.schema.json"
PROMPT = HERE / "leaf_prompt.json"
DOMAIN_POLICY = HERE / "support/registrable_domain_policy.json"
TEST_MATRIX = HERE / "test_matrix.json"
TEST_REPORT = HERE / "validation/test-report.json"
CAPTURE = HERE / "validation/controller-parent-native-identity-capture.json"

AUDIT_ID = "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive"
GATE_ID = "SCENARIO-COHORT-0002-SEMANTIC-REPAIR-ATTEMPT-0002-GATE-V31"
PRIMARY_SHA = "a3d998309ba2b5be3127329dcbf7168c04fad8dd860246cbe5e11a2f064c87f8"
LUNA_SHA = "bd0a749e597fcb74c5347c85865c552c3f4a99a88543d754cf94ef7624fdd932"
POLICY_V32_SHA = "4826ade4c38db47ee184b34e5d7b7bd5ba6cabeecc9baa686cb9d99eeff8a3ed"
EXPECTED_REJECTED = ["A005SA-0009", "A005SA-0010", "A005SA-0012", "A005SA-0013", "A005SA-0014", "A005SA-0016"]
EXPECTED_ELIGIBLE = ["A005SA-0011", "A005SA-0015"]
EXPECTED_COHORT = [f"A005SA-{value:04d}" for value in range(9, 17)]
MODEL = "gpt-5.6-sol"
EFFORT = "ultra"
LUNA_MODEL = "gpt-5.6-luna"
LUNA_EFFORT = "max"
EMPTY_TREE_SHA = hashlib.sha256(b"[]").hexdigest()
HEX64 = re.compile(r"^[0-9a-f]{64}$")
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.I)
PLACEHOLDER = re.compile(r"^(?:tbd|todo|none|n/?a|unknown|unspecified|fix later|placeholder|example)(?:[.! ]*)$", re.I)
WEAK_STATES = {"weak", "misapplied", "insufficient", "not_applicable"}
ZERO_STATE = {"results": 0, "receipts": 0, "sol_native_capture_rows": 0, "credit": 0, "spawned_children": 0, "activation": False}


class DuplicateKey(ValueError):
    pass


def sha_bytes(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def _pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise DuplicateKey(key)
        result[key] = value
    return result


def parse_json(raw: bytes) -> Any:
    return json.loads(raw.decode("utf-8"), object_pairs_hook=_pairs)


def canonical_bytes(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def canonical_sha(value: Any) -> str:
    return sha_bytes(canonical_bytes(value))


def stable_read(path: Path) -> bytes:
    before_path = path.lstat()
    if stat.S_ISLNK(before_path.st_mode) or not stat.S_ISREG(before_path.st_mode):
        raise ValueError("not-regular")
    flags = os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0)
    descriptor = os.open(path, flags)
    try:
        before = os.fstat(descriptor)
        chunks: list[bytes] = []
        while True:
            chunk = os.read(descriptor, 1024 * 1024)
            if not chunk:
                break
            chunks.append(chunk)
        after = os.fstat(descriptor)
    finally:
        os.close(descriptor)
    identity = lambda value: (value.st_dev, value.st_ino, value.st_size, value.st_mtime_ns, value.st_ctime_ns)
    if identity(before) != identity(after) or identity(after) != identity(path.lstat()):
        raise ValueError("toctou")
    raw = b"".join(chunks)
    if len(raw) != after.st_size:
        raise ValueError("short-read")
    return raw


def load(path: Path) -> Any:
    return parse_json(stable_read(path))


def rows(path: Path) -> list[dict[str, Any]]:
    raw = stable_read(path).decode("utf-8")
    return [json.loads(line, object_pairs_hook=_pairs) for line in raw.splitlines() if line.strip()]


def file_binding(path: Path) -> dict[str, Any]:
    raw = stable_read(path)
    value = parse_json(raw) if path.suffix == ".json" else None
    result = {"path": str(path), "byte_count": len(raw), "raw_sha256": sha_bytes(raw)}
    if value is not None:
        result["canonical_sha256"] = canonical_sha(value)
    return result


def binding_errors(binding: Any, label: str) -> list[str]:
    if not isinstance(binding, dict):
        return [f"{label}:shape"]
    path_value = binding.get("path")
    if not isinstance(path_value, str):
        return [f"{label}:path"]
    path = Path(path_value)
    try:
        actual = file_binding(path)
    except (OSError, ValueError, UnicodeError, json.JSONDecodeError, DuplicateKey) as exc:
        return [f"{label}:{type(exc).__name__}:{exc}"]
    errors: list[str] = []
    for key in ("byte_count", "raw_sha256"):
        if binding.get(key) != actual.get(key):
            errors.append(f"{label}:{key}")
    if "canonical_sha256" in binding and binding.get("canonical_sha256") != actual.get("canonical_sha256"):
        errors.append(f"{label}:canonical_sha256")
    return errors


def output_tree_inventory(directory: Path) -> list[dict[str, Any]]:
    info = directory.lstat()
    if stat.S_ISLNK(info.st_mode) or not stat.S_ISDIR(info.st_mode):
        raise ValueError("output-not-directory")
    first_identity = (info.st_dev, info.st_ino, info.st_mtime_ns, info.st_ctime_ns)
    inventory: list[dict[str, Any]] = []
    for path in sorted(directory.rglob("*"), key=lambda item: item.relative_to(directory).as_posix()):
        rel = path.relative_to(directory).as_posix()
        current = path.lstat()
        if stat.S_ISLNK(current.st_mode):
            raise ValueError("output-symlink:" + rel)
        if stat.S_ISDIR(current.st_mode):
            inventory.append({"relative_path": rel + "/", "kind": "directory"})
            continue
        if not stat.S_ISREG(current.st_mode) or current.st_nlink != 1:
            raise ValueError("output-nonregular:" + rel)
        raw = stable_read(path)
        inventory.append({"relative_path": rel, "kind": "file", "byte_count": len(raw), "raw_sha256": sha_bytes(raw)})
    final = directory.lstat()
    final_identity = (final.st_dev, final.st_ino, final.st_mtime_ns, final.st_ctime_ns)
    if first_identity != final_identity:
        raise ValueError("output-tree-toctou")
    return inventory


def output_tree_sha(directory: Path) -> str:
    return canonical_sha(output_tree_inventory(directory))


def concrete_text(value: Any, minimum: int = 12) -> bool:
    return isinstance(value, str) and len(value.strip()) >= minimum and not PLACEHOLDER.match(value.strip())


def concrete_list(value: Any) -> bool:
    return isinstance(value, list) and bool(value) and all(concrete_text(item) for item in value)


def domain_policy() -> dict[str, Any]:
    return load(DOMAIN_POLICY)


def normalized_host(host: str) -> str:
    value = host.rstrip(".").lower()
    return value.encode("idna").decode("ascii")


def canonical_url(value: str) -> str:
    parsed = urlsplit(value)
    host = normalized_host(parsed.hostname or "")
    port = parsed.port
    netloc = host if port in (None, 443) else f"{host}:{port}"
    path = parsed.path or "/"
    return urlunsplit((parsed.scheme.lower(), netloc, path, parsed.query, ""))


def registrable_domain(host: str, policy: dict[str, Any] | None = None) -> str:
    policy = policy or domain_policy()
    labels = normalized_host(host).split(".")
    if len(labels) < 2:
        return ""
    suffix2 = ".".join(labels[-2:])
    if suffix2 in set(policy["multi_label_public_suffixes"]):
        return ".".join(labels[-3:]) if len(labels) >= 3 else ""
    if len(labels[-1]) == 2 and labels[-2] in set(policy["common_cc_second_level_labels"]):
        return ".".join(labels[-3:]) if len(labels) >= 3 else ""
    return suffix2


def source_url_errors(value: Any, label: str) -> list[str]:
    if not isinstance(value, str) or not value or any(character.isspace() or ord(character) < 32 for character in value):
        return [f"{label}:invalid"]
    try:
        parsed = urlsplit(value)
        host = normalized_host(parsed.hostname or "")
        port = parsed.port
    except (ValueError, UnicodeError):
        return [f"{label}:parse"]
    errors: list[str] = []
    policy = domain_policy()
    if parsed.scheme != "https":
        errors.append(f"{label}:non-https")
    if not host or "." not in host:
        errors.append(f"{label}:non-registrable-host")
    if parsed.username is not None or parsed.password is not None:
        errors.append(f"{label}:userinfo")
    if port not in (None, 443):
        errors.append(f"{label}:non-default-port")
    if value.endswith(".") or (parsed.hostname or "").endswith("."):
        errors.append(f"{label}:trailing-dot")
    labels = set(host.split("."))
    if host in set(policy["exact_forbidden_hosts"]) or labels.intersection(policy["forbidden_host_labels"]):
        errors.append(f"{label}:placeholder-or-private-domain")
    if any(host == suffix or host.endswith("." + suffix) for suffix in policy["forbidden_suffixes"]):
        errors.append(f"{label}:reserved-suffix")
    try:
        ipaddress.ip_address(host)
        errors.append(f"{label}:ip-literal")
    except ValueError:
        pass
    if not registrable_domain(host, policy):
        errors.append(f"{label}:registrable-domain")
    return sorted(set(errors))


def public_ip_errors(values: Any, label: str) -> list[str]:
    if not isinstance(values, list) or not values:
        return [f"{label}:empty"]
    errors: list[str] = []
    for index, value in enumerate(values):
        try:
            address = ipaddress.ip_address(value)
        except ValueError:
            errors.append(f"{label}[{index}]:invalid")
            continue
        if not address.is_global:
            errors.append(f"{label}[{index}]:non-public")
    return errors


def blocked_delta_errors(certification: dict[str, Any], label: str) -> list[str]:
    errors: list[str] = []
    if not concrete_list(certification.get("overall_spec_deltas")):
        errors.append(f"{label}:missing-concrete-overall-delta")
    valid_dimension = False
    dimensions = certification.get("dimensions", {})
    if isinstance(dimensions, dict):
        for name, dimension in dimensions.items():
            if not isinstance(dimension, dict) or dimension.get("disposition") != "blocked_insufficient_evidence":
                continue
            if not concrete_list(dimension.get("spec_deltas")) or not concrete_list(dimension.get("scenarios")):
                continue
            criteria = dimension.get("acceptance_criteria")
            if not isinstance(criteria, list) or not criteria:
                continue
            criterion_ok = True
            for criterion in criteria:
                oracle = criterion.get("oracle", {}) if isinstance(criterion, dict) else {}
                criterion_ok = criterion_ok and isinstance(criterion, dict)
                criterion_ok = criterion_ok and concrete_text(criterion.get("criterion"))
                criterion_ok = criterion_ok and concrete_list(criterion.get("observables"))
                criterion_ok = criterion_ok and concrete_list(criterion.get("evidence_artifacts"))
                criterion_ok = criterion_ok and concrete_text(oracle.get("pass")) and concrete_text(oracle.get("fail"))
                criterion_ok = criterion_ok and oracle.get("pass") != oracle.get("fail")
            if criterion_ok:
                valid_dimension = True
                break
    if not valid_dimension:
        errors.append(f"{label}:missing-concrete-blocked-dimension")
    return errors


def research_errors(certification: dict[str, Any]) -> list[str]:
    ref = certification.get("provisional_feature_ref", "<missing>")
    label = f"feature:{ref}"
    errors: list[str] = []
    live = certification.get("live_research", {})
    research = certification.get("research_applicability", {})
    registry = certification.get("source_registry", [])
    mappings = certification.get("claim_support", [])
    disposition = certification.get("certification_disposition")
    if not isinstance(live, dict) or live.get("performed") is not True:
        errors.append(f"{label}:live-research-required")
        live = {}
    attempts = live.get("attempts", []) if isinstance(live, dict) else []
    if not isinstance(attempts, list) or not attempts:
        errors.append(f"{label}:research-attempt-required")
        attempts = []
    for index, attempt in enumerate(attempts):
        if not isinstance(attempt, dict) or not concrete_text(attempt.get("query")) or not concrete_text(attempt.get("outcome")):
            errors.append(f"{label}:attempt:{index}:not-concrete")
    evidence_state = live.get("evidence_state")
    if not isinstance(registry, list) or not isinstance(mappings, list):
        return sorted(set(errors + [f"{label}:registry-or-mapping-shape"]))
    source_by_id: dict[str, dict[str, Any]] = {}
    canonical_urls: list[str] = []
    domains: list[str] = []
    authorities: list[str] = []
    qualified: list[bool] = []
    policy = domain_policy()
    for index, source in enumerate(registry):
        prefix = f"{label}:source:{index}"
        if not isinstance(source, dict):
            errors.append(prefix + ":shape")
            continue
        source_id = source.get("source_id")
        if not isinstance(source_id, str) or not source_id:
            errors.append(prefix + ":id")
        elif source_id in source_by_id:
            errors.append(prefix + ":duplicate-id")
        else:
            source_by_id[source_id] = source
        errors.extend(source_url_errors(source.get("url"), prefix + ":url"))
        if isinstance(source.get("url"), str):
            try:
                computed_url = canonical_url(source["url"])
                canonical_urls.append(computed_url)
                if source.get("canonical_url") != computed_url:
                    errors.append(prefix + ":canonical-url")
                domain = registrable_domain(urlsplit(computed_url).hostname or "", policy)
                domains.append(domain)
                if source.get("registrable_domain") != domain:
                    errors.append(prefix + ":registrable-domain")
            except (ValueError, UnicodeError):
                pass
        authority = source.get("authority_id")
        if not isinstance(authority, str) or not authority:
            errors.append(prefix + ":authority-id")
        else:
            authorities.append(authority)
        qualified.append(source.get("authority_class") in set(policy["qualifying_authority_classes"]))
        retrieval = source.get("retrieval", {})
        if not isinstance(retrieval, dict) or retrieval.get("status") != "read":
            errors.append(prefix + ":retrieval-status")
        else:
            errors.extend(source_url_errors(retrieval.get("final_url"), prefix + ":final-url"))
            status_code = retrieval.get("http_status")
            if not isinstance(status_code, int) or not 200 <= status_code < 300:
                errors.append(prefix + ":http-status")
            for key in ("content_sha256", "receipt_sha256"):
                if not isinstance(retrieval.get(key), str) or not HEX64.match(retrieval[key]):
                    errors.append(prefix + ":" + key)
            errors.extend(public_ip_errors(retrieval.get("resolved_ips"), prefix + ":resolved-ips"))
            redirects = retrieval.get("redirect_chain", [])
            if not isinstance(redirects, list):
                errors.append(prefix + ":redirect-chain")
            else:
                for offset, redirect in enumerate(redirects):
                    errors.extend(source_url_errors(redirect, f"{prefix}:redirect:{offset}"))
    if len(canonical_urls) != len(set(canonical_urls)):
        errors.append(f"{label}:duplicate-canonical-url")
    if len(domains) != len(set(domains)):
        errors.append(f"{label}:duplicate-registrable-domain")
    if len(authorities) != len(set(authorities)):
        errors.append(f"{label}:duplicate-authority-id")
    used_ids: set[str] = set()
    projected_claims: list[dict[str, Any]] = []
    claim_ids: set[str] = set()
    for index, mapping in enumerate(mappings):
        prefix = f"{label}:claim:{index}"
        if not isinstance(mapping, dict):
            errors.append(prefix + ":shape")
            continue
        claim_id = mapping.get("claim_id")
        if not isinstance(claim_id, str) or not claim_id or claim_id in claim_ids:
            errors.append(prefix + ":id")
        else:
            claim_ids.add(claim_id)
        if not concrete_text(mapping.get("claim")) or not concrete_text(mapping.get("evidence_label"), 3):
            errors.append(prefix + ":text-or-label")
        ids = mapping.get("source_ids", [])
        if not isinstance(ids, list) or not ids or len(ids) != len(set(ids)):
            errors.append(prefix + ":source-ids")
            ids = []
        urls: list[str] = []
        for source_id in ids:
            if source_id not in source_by_id:
                errors.append(prefix + ":unregistered-source:" + str(source_id))
            else:
                used_ids.add(source_id)
                urls.append(source_by_id[source_id]["url"])
        if mapping.get("evidence_class") not in {"supported_claim", "inference"}:
            errors.append(prefix + ":evidence-class")
        projected_claims.append({"claim_id": claim_id, "claim": mapping.get("claim"), "source_urls": urls, "evidence_label": mapping.get("evidence_label")})
    if set(source_by_id) != used_ids:
        errors.append(f"{label}:orphan-registered-source")
    claims_used = research.get("claims_used", []) if isinstance(research, dict) else []
    if claims_used != projected_claims:
        errors.append(f"{label}:base-claim-projection")
    strong = (
        evidence_state == "applicable"
        and isinstance(research, dict)
        and research.get("state") == "applicable"
        and research.get("browsing_performed") is True
        and len(registry) >= 2
        and len(domains) == len(registry)
        and len(set(domains)) >= 2
        and len(set(authorities)) >= 2
        and all(qualified)
        and bool(mappings)
        and all(item.get("evidence_class") == "supported_claim" for item in mappings if isinstance(item, dict))
    )
    if evidence_state == "no_evidence":
        queries = [attempt.get("query") for attempt in attempts if isinstance(attempt, dict)]
        if len(attempts) < 2 or len(queries) != len(set(queries)):
            errors.append(f"{label}:no-evidence-needs-two-distinct-attempts")
        if registry or mappings or claims_used:
            errors.append(f"{label}:no-evidence-with-references")
        if not isinstance(research, dict) or research.get("state") != "insufficient" or research.get("browsing_performed") is not True:
            errors.append(f"{label}:no-evidence-base-state")
    if disposition == "certified" and not strong:
        errors.append(f"{label}:certified-below-live-independent-authority-threshold")
    if not strong:
        if disposition != "blocked_insufficient_evidence":
            errors.append(f"{label}:insufficient-evidence-must-block")
        errors.extend(blocked_delta_errors(certification, label))
    if isinstance(research, dict) and research.get("state") in WEAK_STATES and disposition == "certified":
        errors.append(f"{label}:weak-state-certified")
    return sorted(set(errors))


def source_rows() -> dict[str, dict[str, Any]]:
    return {row["assignment_id"]: row for row in rows(SOURCE_MANIFEST)}


def adapted_source_row(assignment_id: str) -> dict[str, Any]:
    row = copy.deepcopy(source_rows()[assignment_id])
    row["prospective_agent_path"] = f"/root/sol_controller_v29/a005_scenario_adversarial_{assignment_id[-4:]}_semantic_repair_attempt_0002_ultra_v31"
    row["output_directory"] = str(HERE / f"outputs/{assignment_id}/attempt-0002")
    row["research_binding_by_feature"] = {
        ref: {"result_file_sha256": binding[0], "research_record_sha256": binding[1]}
        for ref, binding in row["research_binding_by_feature"].items()
    }
    return row


def _base_module() -> Any:
    spec = importlib.util.spec_from_file_location("scenario_base_v1_for_gate_v31", BASE_VALIDATOR)
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(module)
    return module


def result_errors(result: dict[str, Any], assignment_id: str) -> list[str]:
    errors = ["overlay:" + "/".join(str(part) for part in error.absolute_path) + ":" + error.message for error in Draft202012Validator(load(RESULT_SCHEMA)).iter_errors(result)]
    projected = copy.deepcopy(result)
    projected["schema_version"] = "scenario-adversarial-result-v1"
    projected["attempt_id"] = "attempt-0001"
    projected["reasoning_effort"] = "xhigh"
    for certification in projected.get("feature_certifications", []):
        if isinstance(certification, dict):
            certification.pop("live_research", None)
            certification.pop("source_registry", None)
            certification.pop("claim_support", None)
    base = _base_module()
    errors.extend("base:" + error for error in base.result_errors(projected, adapted_source_row(assignment_id), load(BASE_SCHEMA)))
    for certification in result.get("feature_certifications", []):
        if isinstance(certification, dict):
            errors.extend(research_errors(certification))
    return sorted(set(errors))


def luna_report_errors(report: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    expected = {
        "schema_version": "audit005-scenario-adversarial-luna-independent-postrun-v29-ultra-v1",
        "audit_id": AUDIT_ID,
        "wave_id": "wave-0001",
        "cohort_id": "cohort-0002",
        "status": "fail_closed",
        "cohort_status": "fail_closed",
        "derived_postrun_status": "fail_closed",
        "model": LUNA_MODEL,
        "reasoning_effort": LUNA_EFFORT,
        "fork_turns": "none",
        "descendant_count": 0,
        "followup_count": 0,
        "retry_count": 0,
        "read_only_verification": True,
        "fresh_direct_reviewer": True,
        "independently_reconstructed": True,
        "primary_report_used_as_comparison_only": True,
        "primary_report_sha256": PRIMARY_SHA,
    }
    for key, value in expected.items():
        if report.get(key) != value:
            errors.append("luna:" + key)
    sets = report.get("assignment_sets", {})
    if sets.get("rejected") != EXPECTED_REJECTED or sets.get("eligible") != EXPECTED_ELIGIBLE or sets.get("unresolved") != []:
        errors.append("luna:exact-assignment-sets")
    statuses = report.get("assignment_statuses", {})
    for assignment_id in EXPECTED_REJECTED:
        if statuses.get(assignment_id, {}).get("status") != "rejected":
            errors.append("luna:status:" + assignment_id)
    for assignment_id in EXPECTED_ELIGIBLE:
        if statuses.get(assignment_id, {}).get("status") != "eligible":
            errors.append("luna:status:" + assignment_id)
    if set(statuses) != set(EXPECTED_COHORT):
        errors.append("luna:cohort-membership")
    if report.get("eligible_ids") != EXPECTED_ELIGIBLE or report.get("eligible_count") != 2:
        errors.append("luna:eligible-set")
    counts = report.get("counts", {})
    if counts.get("assignments") != 8 or counts.get("features") not in (None, 817) or counts.get("rejected") != 6 or counts.get("eligible") != 2:
        errors.append("luna:counts")
    comparison = report.get("primary_comparison", {})
    for key in ("sha256_verified", "rejected_ids_match", "rejected_count_match", "eligible_ids_match", "eligible_count_match", "exact_state_match", "status_match"):
        if comparison.get(key) is not True:
            errors.append("luna:primary-comparison:" + key)
    if comparison.get("required_sha256") != PRIMARY_SHA or comparison.get("observed_sha256") != PRIMARY_SHA or comparison.get("primary_status") != "fail_closed":
        errors.append("luna:primary-comparison-binding")
    if report.get("candidate_credit") != 0:
        errors.append("luna:credit")
    side_effects = report.get("side_effects", {})
    if not isinstance(side_effects, dict) or any(value != 0 for value in side_effects.values()):
        errors.append("luna:side-effects")
    # controller_thread_id and reviewer_identity are deliberately ignored here.
    return sorted(set(errors))


def capture_errors(capture: dict[str, Any], authority: dict[str, Any]) -> list[str]:
    errors = ["capture-schema:" + "/".join(str(part) for part in error.absolute_path) + ":" + error.message for error in Draft202012Validator(load(CAPTURE_SCHEMA)).iter_errors(capture)]
    if errors:
        return sorted(set(errors))
    terminal = capture["terminal_report"]
    if terminal["path"] != str(LUNA) or terminal["raw_sha256"] != LUNA_SHA or terminal["observed_status"] != "fail_closed":
        errors.append("capture:terminal-report")
    if capture.get("gate_authority_sha256") != file_binding(AUTHORITY)["raw_sha256"]:
        errors.append("capture:gate-authority")
    if capture.get("parent_controller_thread_id") != load(POLICY_V32)["model_routing"]["luna_independent_reviewers"]["controller_thread_id"]:
        errors.append("capture:parent-controller")
    reviewer = capture["reviewer"]
    prior_ids = {row["identity"]["native_child_thread_id"] for row in load(V30 / "attempt1_preservation_snapshot.json")["assignments"]}
    if reviewer["native_reviewer_thread_id"] in prior_ids or reviewer["native_reviewer_thread_id"] == capture["parent_controller_thread_id"]:
        errors.append("capture:reviewer-not-fresh")
    if capture.get("embedded_report_identity_authority") != "non_authoritative":
        errors.append("capture:embedded-identity-authority")
    return sorted(set(errors))


def expected_files(include_terminal: bool = True) -> set[Path]:
    files = {
        AUTHORITY, MANIFEST, RESULT_SCHEMA, CAPTURE_SCHEMA, LUNA_SCHEMA, PROMPT, DOMAIN_POLICY, TEST_MATRIX,
        HERE / "verify_gate_v31.py", HERE / "test_gate_v31.py", HERE / "prepare_gate_v31.py",
    }
    files.update(HERE / f"intents/{assignment_id}.json" for assignment_id in EXPECTED_REJECTED)
    if include_terminal:
        files.update({READINESS, TEST_REPORT})
    if CAPTURE.exists():
        files.add(CAPTURE)
    return files


def verify_gate(require_terminal: bool = True) -> dict[str, Any]:
    errors: list[str] = []
    required = expected_files(require_terminal)
    for path in required:
        if not path.is_file():
            errors.append("namespace:missing:" + str(path.relative_to(HERE)))
    actual = {path for path in HERE.rglob("*") if path.is_file()}
    foreign = sorted(str(path.relative_to(HERE)) for path in actual - required)
    if foreign:
        errors.append("namespace:foreign:" + ",".join(foreign))
    if errors:
        return {"status": "fail_closed", "activation": False, "errors": sorted(set(errors))}
    try:
        authority = load(AUTHORITY)
        manifest = rows(MANIFEST)
    except Exception as exc:
        return {"status": "fail_closed", "activation": False, "errors": ["load:" + type(exc).__name__ + ":" + str(exc)]}
    if authority.get("activation") is not False or authority.get("activation_authorized") is not False or authority.get("zero_state") != ZERO_STATE:
        errors.append("authority:zero-state-or-activation")
    if authority.get("rejected_ids") != EXPECTED_REJECTED or authority.get("eligible_ids") != EXPECTED_ELIGIBLE:
        errors.append("authority:assignment-sets")
    for label, binding in authority.get("artifact_bindings", {}).items():
        errors.extend(binding_errors(binding, "authority:" + label))
    for label, binding in authority.get("v30_file_bindings", {}).items():
        errors.extend(binding_errors(binding, "v30:" + label))
    errors.extend(binding_errors(authority.get("primary_report"), "primary-report"))
    errors.extend(binding_errors(authority.get("luna_report"), "luna-report"))
    errors.extend(binding_errors(authority.get("future_activation_policy"), "policy-v32"))
    if authority.get("primary_report", {}).get("raw_sha256") != PRIMARY_SHA:
        errors.append("primary-report:pinned-sha")
    if authority.get("luna_report", {}).get("raw_sha256") != LUNA_SHA:
        errors.append("luna-report:pinned-sha")
    if authority.get("future_activation_policy", {}).get("raw_sha256") != POLICY_V32_SHA:
        errors.append("policy-v32:pinned-sha")
    try:
        errors.extend(luna_report_errors(load(LUNA)))
    except Exception as exc:
        errors.append("luna-report:" + type(exc).__name__ + ":" + str(exc))
    if [row.get("assignment_id") for row in manifest] != EXPECTED_REJECTED:
        errors.append("manifest:exact-assignment-order")
    feature_count = 0
    empty_outputs = 0
    for row in manifest:
        assignment_id = row.get("assignment_id", "<missing>")
        feature_count += int(row.get("feature_count", 0))
        errors.extend(binding_errors(row.get("packet"), f"manifest:{assignment_id}:packet"))
        errors.extend(binding_errors(row.get("v30_intent"), f"manifest:{assignment_id}:v30-intent"))
        errors.extend(binding_errors(row.get("v31_intent"), f"manifest:{assignment_id}:v31-intent"))
        output = Path(row.get("output_tree", {}).get("path", ""))
        if output != HERE / f"outputs/{assignment_id}/attempt-0002":
            errors.append(f"manifest:{assignment_id}:output-path")
            continue
        try:
            inventory = output_tree_inventory(output)
            digest = canonical_sha(inventory)
            if inventory or digest != row.get("output_tree", {}).get("inventory_sha256") or digest != EMPTY_TREE_SHA:
                errors.append(f"manifest:{assignment_id}:output-tree")
            else:
                empty_outputs += 1
        except (OSError, ValueError) as exc:
            errors.append(f"manifest:{assignment_id}:output:{type(exc).__name__}:{exc}")
        try:
            intent = load(Path(row["v31_intent"]["path"]))
            if intent.get("activation") != {"enabled": False, "authorized": False, "future_policy_required": "CONCURRENCY_POLICY_V32.json", "parent_native_capture_required": True}:
                errors.append(f"intent:{assignment_id}:activation")
            if intent.get("assignment_id") != assignment_id or intent.get("runtime", {}).get("fresh_identity_state") != "reserved_unallocated" or intent.get("runtime", {}).get("native_child_thread_id") is not None:
                errors.append(f"intent:{assignment_id}:identity")
        except Exception as exc:
            errors.append(f"intent:{assignment_id}:{type(exc).__name__}:{exc}")
    if feature_count != 687:
        errors.append("manifest:feature-count")
    Draft202012Validator.check_schema(load(RESULT_SCHEMA))
    Draft202012Validator.check_schema(load(CAPTURE_SCHEMA))
    Draft202012Validator.check_schema(load(LUNA_SCHEMA))
    test_count = 0
    if require_terminal:
        readiness = load(READINESS)
        report = load(TEST_REPORT)
        test_count = int(report.get("total", 0))
        if readiness.get("authority_sha256") != file_binding(AUTHORITY)["raw_sha256"] or readiness.get("test_report_sha256") != file_binding(TEST_REPORT)["raw_sha256"]:
            errors.append("readiness:bindings")
        if report.get("status") != "pass" or report.get("passed") != report.get("total") or report.get("failed") != 0 or test_count < 300:
            errors.append("tests:not-at-least-300-passing")
        if report.get("test_source_sha256") != file_binding(HERE / "test_gate_v31.py")["raw_sha256"]:
            errors.append("tests:source-sha")
        if readiness.get("activation") is not False or readiness.get("zero_state") != ZERO_STATE:
            errors.append("readiness:zero-state")
        if stat.S_IMODE(AUTHORITY.stat().st_mode) != 0o444 or stat.S_IMODE(READINESS.stat().st_mode) != 0o444:
            errors.append("immutability:authority-readiness")
    capture_state = "required_absent"
    if CAPTURE.exists():
        capture_state = "present_invalid"
        try:
            capture_problem = capture_errors(load(CAPTURE), authority)
            errors.extend(capture_problem)
            if not capture_problem:
                capture_state = "present_valid"
        except Exception as exc:
            errors.append("capture:" + type(exc).__name__ + ":" + str(exc))
    blocking = ["activation_false", "separate_future_activation_transaction_required"]
    if capture_state != "present_valid":
        blocking.insert(0, "controller_parent_native_identity_capture_absent_or_invalid")
    status = "pass_blocked" if not errors else "fail_closed"
    return {
        "schema_version": "scenario-adversarial-semantic-repair-gate-v31-report-v1",
        "gate_id": GATE_ID,
        "status": status,
        "activation": False,
        "activation_authorized": False,
        "errors": sorted(set(errors)),
        "blocking_reasons": blocking,
        "luna_confirmation": {"state": "accepted_exact_rejected_set_confirmation_prelaunch", "identity_authority": "non_authoritative", "raw_sha256": LUNA_SHA},
        "parent_native_capture": capture_state,
        "future_activation_policy_sha256": POLICY_V32_SHA,
        "counts": {
            "repair_assignments": len(manifest), "features": feature_count, "empty_output_directories": empty_outputs,
            "results": 0, "receipts": 0, "sol_native_capture_rows": 0, "credit": 0, "spawned_children": 0,
            "tests": test_count,
        },
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--preterminal", action="store_true", help="Verify contract before readiness/test-report are sealed.")
    args = parser.parse_args()
    report = verify_gate(require_terminal=not args.preterminal)
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass_blocked" else 1)


if __name__ == "__main__":
    main()
