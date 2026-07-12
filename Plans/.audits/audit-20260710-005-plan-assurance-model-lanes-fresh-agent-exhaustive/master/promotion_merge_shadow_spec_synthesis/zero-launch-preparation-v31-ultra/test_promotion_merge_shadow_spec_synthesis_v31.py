#!/usr/bin/env python3
"""Strong positive and fail-closed tests for the zero-launch synthesis preparation."""
from __future__ import annotations

import copy
import importlib.util
import json
import pathlib
import sys
from typing import Any, Callable

sys.dont_write_bytecode = True
HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[5]
VERIFY_PATH = HERE / "verify_promotion_merge_shadow_spec_synthesis_v31.py"
SPEC = importlib.util.spec_from_file_location("a005_pmsss_verify", VERIFY_PATH)
assert SPEC and SPEC.loader
VERIFY = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(VERIFY)


class Harness:
    def __init__(self) -> None:
        self.passed = 0
        self.failed = 0
        self.failures: list[str] = []
        self.case_ids: list[str] = []

    def check(self, case_id: str, condition: bool) -> None:
        self.case_ids.append(case_id)
        if condition:
            self.passed += 1
        else:
            self.failed += 1
            self.failures.append(case_id)


def errors_from(call: Callable[[list[str]], None]) -> list[str]:
    errors: list[str] = []
    call(errors)
    return errors


def minimal_candidate() -> dict[str, Any]:
    feature_refs = [f"OPF::A005OM-{((index - 1) // 200) + 1:04d}::PF-{((index - 1) % 200) + 1:04d}" for index in range(1, 3889)]
    features = [
        {
            "feature_ref": ref,
            "research_evidence_refs": ["research"],
            "scenario_evidence_refs": ["scenario"],
            "seam_evidence_refs": [],
            "reverse_shadow_evidence_refs": [],
            "delta_evidence_refs": [],
            "disposition": "hold",
            "merge_target_ref": None,
            "uncertainty": "material",
            "rationale": "candidate only"
        }
        for ref in feature_refs
    ]
    seams = [
        {
            "edge_ref": f"EDGE-{index:05d}",
            "endpoint_refs": [feature_refs[0], feature_refs[1]],
            "disposition": "uncertain_requires_targeted_research",
            "evidence_refs": ["seam"],
            "rationale": "candidate only"
        }
        for index in range(1, 9366)
    ]
    reverse = [
        {
            "edge_key": f"REVERSE-{index:04d}",
            "endpoint_refs": [feature_refs[0], feature_refs[1]],
            "quarantined_at_observation": index <= 5,
            "final_disposition": "quarantine",
            "luna_evidence_refs": ["luna"],
            "rationale": "candidate only"
        }
        for index in range(1, 47)
    ]
    shadow = [
        {
            "feature_ref": ref,
            "shadow_text": "candidate only",
            "source_lineage_refs": ["lineage"],
            "canonical_target_candidates": [],
            "canonical_write_authorized": False
        }
        for ref in feature_refs
    ]
    return {
        "schema_version": "audit005-promotion-merge-shadow-spec-synthesis-candidate-v1",
        "audit_id": VERIFY.AUDIT_ID,
        "synthesis_id": "A005PMSSS-TEST",
        "status": "candidate_only_blocked_pending_independent_luna_postrun",
        "feature_count": 3888,
        "seam_count": 9365,
        "reverse_shadow_candidate_count": 46,
        "source_feature_inventory_sha256": "a53e72afb5f52e7e95797f2179c7fd8da14ebf6e148efd544781614784113267",
        "dependency_checkpoint_hashes": {f"checkpoint-{index:02d}": "0" * 64 for index in range(10)},
        "feature_decisions": features,
        "seam_adjudications": seams,
        "reverse_shadow_adjudications": reverse,
        "shadow_spec_entries": shadow,
        "effects": {
            "launch_performed": False,
            "activation_performed": False,
            "canonical_write_performed": False,
            "promotion_committed": False,
            "merge_committed": False,
            "shadow_spec_published": False
        },
        "credit": {
            "coverage": 0,
            "research": 0,
            "scenario": 0,
            "promotion": 0,
            "merge": 0,
            "spec": 0,
            "certification": 0
        }
    }


def main() -> int:
    h = Harness()
    report = VERIFY.verify(ROOT)
    h.check("integration-verifier-pass-blocked", report["status"] == "pass_blocked")
    h.check("integration-verifier-no-errors", report["errors"] == [])
    h.check("integration-zero-launch", report["counts"]["launches"] == 0)
    h.check("integration-zero-activation", report["counts"]["activations"] == 0)
    h.check("integration-zero-results", report["counts"]["results"] == 0)
    h.check("integration-zero-receipts", report["counts"]["receipts"] == 0)
    h.check("integration-zero-credit", report["credit"] == 0)
    h.check("integration-feature-count", report["counts"]["feature_rows"] == 3888)
    h.check("integration-checkpoint-counts", report["counts"]["closed_checkpoints"] == 4 and report["counts"]["open_checkpoints"] == 6)

    authority = VERIFY.load_json(HERE / "AUTHORITY.json")
    readiness = VERIFY.load_json(HERE / "readiness.json")
    zero = VERIFY.load_json(HERE / "zero_state_inventory.json")
    schema = VERIFY.load_json(HERE / "schema/promotion_merge_shadow_spec_synthesis.schema.json")

    h.check("authority-positive", errors_from(lambda e: VERIFY.validate_authority_shape(authority, e)) == [])
    h.check("readiness-positive", errors_from(lambda e: VERIFY.validate_readiness_shape(readiness, e)) == [])
    h.check("zero-state-positive", errors_from(lambda e: VERIFY.validate_zero_state(zero, HERE, e)) == [])
    h.check("schema-contract-positive", errors_from(lambda e: VERIFY.validate_schema_contract(schema, e)) == [])

    authority_mutations: list[tuple[str, Callable[[dict[str, Any]], None]]] = [
        ("status", lambda v: v.__setitem__("status", "READY")),
        ("preparation-only", lambda v: v.__setitem__("preparation_only", False)),
        ("feature-count", lambda v: v["scope"].__setitem__("feature_count", 3887)),
        ("seam-count", lambda v: v["scope"].__setitem__("seam_count", 9364)),
        ("reverse-shadow-count", lambda v: v["scope"].__setitem__("reverse_shadow_candidate_count", 45)),
        ("feature-digest", lambda v: v["scope"].__setitem__("feature_ref_digest", "0" * 64)),
        ("model", lambda v: v["model_identity_metadata"].__setitem__("requested_model", "wrong")),
        ("effort", lambda v: v["model_identity_metadata"].__setitem__("requested_reasoning_effort", "max")),
        ("controller", lambda v: v["model_identity_metadata"].__setitem__("controller", "/root/wrong")),
        ("identity-role", lambda v: v["model_identity_metadata"].__setitem__("role", "runtime_attestation")),
        ("identity-launch", lambda v: v["model_identity_metadata"].__setitem__("authorizes_launch", True)),
        ("identity-credit", lambda v: v["model_identity_metadata"].__setitem__("authorizes_credit", True)),
        ("blocker-delete", lambda v: v.__setitem__("blockers", v["blockers"][:-1])),
        ("blocker-reorder", lambda v: v.__setitem__("blockers", list(reversed(v["blockers"])))),
    ]
    for key in authority["permissions"]:
        authority_mutations.append((f"permission-{key}", lambda v, k=key: v["permissions"].__setitem__(k, True)))
    for case_id, mutate in authority_mutations:
        candidate = copy.deepcopy(authority)
        mutate(candidate)
        h.check(f"authority-negative-{case_id}", bool(errors_from(lambda e, c=candidate: VERIFY.validate_authority_shape(c, e))))

    readiness_mutations: list[tuple[str, Callable[[dict[str, Any]], None]]] = [
        ("status", lambda v: v.__setitem__("status", "READY")),
        ("ready", lambda v: v.__setitem__("ready", True)),
        ("all-closed", lambda v: v.__setitem__("all_required_checkpoints_closed", True)),
        ("closed-count", lambda v: v.__setitem__("closed_checkpoint_count", 10)),
        ("open-count", lambda v: v.__setitem__("open_checkpoint_count", 0)),
        ("matrix-delete", lambda v: v.__setitem__("checkpoint_matrix", v["checkpoint_matrix"][:-1])),
        ("blocker-delete", lambda v: v.__setitem__("blockers", v["blockers"][:-1])),
        ("blocker-reorder", lambda v: v.__setitem__("blockers", list(reversed(v["blockers"])))),
    ]
    for index in range(len(readiness["checkpoint_matrix"])):
        readiness_mutations.append((f"checkpoint-flip-{index:02d}", lambda v, i=index: v["checkpoint_matrix"][i].__setitem__("closed", not v["checkpoint_matrix"][i]["closed"])))
        readiness_mutations.append((f"checkpoint-credit-{index:02d}", lambda v, i=index: v["checkpoint_matrix"][i].__setitem__("promotion_credit", 1)))
        readiness_mutations.append((f"checkpoint-activation-{index:02d}", lambda v, i=index: v["checkpoint_matrix"][i].__setitem__("activation_proof", True)))
    for case_id, mutate in readiness_mutations:
        candidate = copy.deepcopy(readiness)
        mutate(candidate)
        h.check(f"readiness-negative-{case_id}", bool(errors_from(lambda e, c=candidate: VERIFY.validate_readiness_shape(c, e))))

    for key in sorted(VERIFY.ZERO_COUNT_KEYS):
        candidate = copy.deepcopy(zero)
        candidate["counts"][key] = 1
        h.check(f"zero-negative-count-{key}", bool(errors_from(lambda e, c=candidate: VERIFY.validate_zero_state(c, HERE, e))))
    for key in zero["permissions"]:
        candidate = copy.deepcopy(zero)
        candidate["permissions"][key] = True
        h.check(f"zero-negative-permission-{key}", bool(errors_from(lambda e, c=candidate: VERIFY.validate_zero_state(c, HERE, e))))
    zero_mutations: list[tuple[str, Callable[[dict[str, Any]], None]]] = [
        ("count-key-delete", lambda v: v["counts"].pop("launches")),
        ("count-key-extra", lambda v: v["counts"].__setitem__("unknown", 0)),
        ("permission-name", lambda v: v["permissions"].__setitem__("launch", v["permissions"].pop("launch_authorized"))),
        ("forbidden-duplicate", lambda v: v["forbidden_namespace_paths"].append(v["forbidden_namespace_paths"][0])),
        ("forbidden-traversal", lambda v: v["forbidden_namespace_paths"].append("../outside")),
        ("canonical-write-list", lambda v: v["canonical_plan_files_written"].append("Plans/FinalGUISpec.md")),
        ("output-list", lambda v: v["synthesis_output_files_written"].append("candidate.json")),
        ("status", lambda v: v.__setitem__("status", "READY")),
    ]
    for case_id, mutate in zero_mutations:
        candidate = copy.deepcopy(zero)
        mutate(candidate)
        h.check(f"zero-negative-{case_id}", bool(errors_from(lambda e, c=candidate: VERIFY.validate_zero_state(c, HERE, e))))

    valid_paths = [
        "Plans/FinalGUISpec.md",
        "Plans/.audits/audit/master/file.json",
        "a/b/c",
        "single",
    ]
    invalid_paths: list[Any] = [
        None,
        1,
        "",
        "/absolute",
        "../outside",
        "a/../../outside",
        "./../outside",
    ]
    invalid_paths.extend(f"segment/{'../' * count}outside" for count in range(1, 33))
    for index, value in enumerate(valid_paths):
        h.check(f"path-positive-{index:03d}", VERIFY.safe_repo_path(ROOT, value) is not None)
    for index, value in enumerate(invalid_paths):
        h.check(f"path-negative-{index:03d}", VERIFY.safe_repo_path(ROOT, value) is None)

    valid_shas = ["0" * 64, "a" * 64, "0123456789abcdef" * 4]
    invalid_shas: list[Any] = [None, 0, "", "0" * 63, "0" * 65, "g" * 64, "A" * 64]
    invalid_shas.extend(("0" * length) for length in range(0, 64, 4))
    for index, value in enumerate(valid_shas):
        h.check(f"sha-positive-{index:03d}", VERIFY.is_sha256(value))
    for index, value in enumerate(invalid_shas):
        h.check(f"sha-negative-{index:03d}", not VERIFY.is_sha256(value))

    from jsonschema import Draft202012Validator

    validator = Draft202012Validator(schema)
    candidate = minimal_candidate()
    h.check("candidate-schema-positive", validator.is_valid(candidate))
    shallow_mutations: list[tuple[str, tuple[str, ...], Any]] = [
        ("schema-version", ("schema_version",), "wrong"),
        ("audit-id", ("audit_id",), "wrong"),
        ("synthesis-id", ("synthesis_id",), "wrong"),
        ("status", ("status",), "ready"),
        ("feature-count", ("feature_count",), 3887),
        ("seam-count", ("seam_count",), 9364),
        ("reverse-shadow-count", ("reverse_shadow_candidate_count",), 45),
        ("source-hash", ("source_feature_inventory_sha256",), "0" * 64),
        ("effect-launch", ("effects", "launch_performed"), True),
        ("effect-activation", ("effects", "activation_performed"), True),
        ("effect-canonical", ("effects", "canonical_write_performed"), True),
        ("effect-promotion", ("effects", "promotion_committed"), True),
        ("effect-merge", ("effects", "merge_committed"), True),
        ("effect-shadow", ("effects", "shadow_spec_published"), True),
        ("credit-coverage", ("credit", "coverage"), 1),
        ("credit-research", ("credit", "research"), 1),
        ("credit-scenario", ("credit", "scenario"), 1),
        ("credit-promotion", ("credit", "promotion"), 1),
        ("credit-merge", ("credit", "merge"), 1),
        ("credit-spec", ("credit", "spec"), 1),
        ("credit-certification", ("credit", "certification"), 1),
    ]
    for case_id, path, replacement in shallow_mutations:
        original: Any = candidate
        for part in path[:-1]:
            original = original[part]
        key = path[-1]
        prior = original[key]
        original[key] = replacement
        h.check(f"candidate-schema-negative-{case_id}", not validator.is_valid(candidate))
        original[key] = prior
    candidate["feature_decisions"].pop()
    h.check("candidate-schema-negative-feature-cardinality", not validator.is_valid(candidate))
    candidate["feature_decisions"].append(copy.deepcopy(candidate["feature_decisions"][0]))
    candidate["seam_adjudications"].pop()
    h.check("candidate-schema-negative-seam-cardinality", not validator.is_valid(candidate))
    candidate["seam_adjudications"].append(copy.deepcopy(candidate["seam_adjudications"][0]))
    candidate["reverse_shadow_adjudications"].pop()
    h.check("candidate-schema-negative-reverse-cardinality", not validator.is_valid(candidate))
    candidate["reverse_shadow_adjudications"].append(copy.deepcopy(candidate["reverse_shadow_adjudications"][0]))
    candidate["shadow_spec_entries"].pop()
    h.check("candidate-schema-negative-shadow-cardinality", not validator.is_valid(candidate))

    report_out = {
        "schema_version": "audit005-promotion-merge-shadow-spec-synthesis-tests-v1",
        "status": "pass" if h.failed == 0 else "fail",
        "passed": h.passed,
        "failed": h.failed,
        "total": h.passed + h.failed,
        "failures": h.failures,
        "case_id_digest": VERIFY.sha256_bytes(("\n".join(h.case_ids) + "\n").encode("utf-8")),
        "strong_dimensions": [
            "live integration and lineage hashes",
            "exact zero-state permissions and forbidden paths",
            "authority and checkpoint fail-closed mutations",
            "repository path confinement",
            "SHA-256 shape rejection",
            "Draft 2020-12 exact 3888/9365/46 candidate cardinalities",
            "zero effects and zero credit"
        ],
        "launch_authorized": False,
        "activation_authorized": False,
        "credit": 0,
    }
    print(json.dumps(report_out, indent=2, sort_keys=True))
    return 0 if h.failed == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
