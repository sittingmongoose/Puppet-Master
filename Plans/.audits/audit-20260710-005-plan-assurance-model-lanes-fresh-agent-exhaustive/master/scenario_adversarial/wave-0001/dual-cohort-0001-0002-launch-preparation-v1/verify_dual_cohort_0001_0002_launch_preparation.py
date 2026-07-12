#!/usr/bin/env python3
"""Verify the blocked V6 dual-cohort launch preparation and expose pure later-gate checks."""

from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path
from typing import Any

PREP = Path(__file__).resolve().parent
WAVE = PREP.parent
ROOT = PREP.parents[3]
AUDIT_ID = "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive"
WAVE_ID = "wave-0001"
STATUS = "BLOCKED_AWAITING_TWO_SEPARATELY_VALIDATED_COHORT_ACTIVATIONS"
V6_SHA = "0028914f69fdf97ac639b91166b1a53aef10284f8be0938bc2a2d817b00fc5e0"
LUNA_SHA = "ae8e493e21a6fba1408d7555c6d3ec45f65895c24b611131283c2396c931df83"
MODEL = "gpt-5.6-sol"
EFFORT = "xhigh"
CONTROLLER = "019f4f5e-96c6-7893-8c94-ce2c1b760d6c"
RESEARCH_IDS = [f"ER-{index:04d}" for index in range(1, 9)]
RESEARCH_DIGEST = "6309d3442ac7aca5d6faeffa47cd982aafa257c11ebae029102837e331e1dbcc"
COMBINED_ASSIGNMENT_IDS = [f"A005SA-{index:04d}" for index in range(1, 17)]
COMBINED_AGENT_PATHS = [f"/root/a005_scenario_adversarial_{index:04d}_attempt_0001_terminal" for index in range(1, 17)]
COMBINED_ASSIGNMENT_DIGEST = "6d2f77e5a24fdd5a6d7fc4a2d34e811b40b92028d43cf1244da8c02583b1a1a6"
COMBINED_PATH_DIGEST = "bb9131e6ce1a3e5aaa23969ac08db8c64a564e94de3c38a2018c7649c2b0feef"
COMBINED_FEATURE_COUNT = 1640
COMBINED_FEATURE_DIGEST = "a7b9bbf19927b5605fb3fa7ed10cc52878c08528c9f4587a5c973b6c8c3f34de"
COHORTS = {
    "cohort-0001": {
        "assignment_ids": COMBINED_ASSIGNMENT_IDS[:8], "agent_paths": COMBINED_AGENT_PATHS[:8],
        "feature_count": 823, "feature_digest": "aead114c4e46d8bea5bf27623902f0a052d1ba969b7e1c3aad5181537e6183b5",
        "prep_authority_sha": "cade2a9b9822b5f897c47bf188a9e4045ac3c8dbb796d0c514aef8a5287eb694",
        "prep_readiness_sha": "8d31bfce2bb1dc6b33e38926448a3155af77ab5706677710fe28e3770c2ab3f4",
        "prep_generator_sha": "5cd2f3651ff95687b8192ead44895fc2bde0b9fbc9bc8399c68cf45b02b24bbf",
        "generator_policy": "v5", "generator_v6_compatible_now": False,
    },
    "cohort-0002": {
        "assignment_ids": COMBINED_ASSIGNMENT_IDS[8:], "agent_paths": COMBINED_AGENT_PATHS[8:],
        "feature_count": 817, "feature_digest": "99163803098a19f4db61c85836f773a0c7a226c313acec0a177a8c1692f93f93",
        "prep_authority_sha": "f9ac772b6fb7490848b69f280bde8a63d3ce1dca0f03e8a69923efccc519c1a6",
        "prep_readiness_sha": "aa7b2aabac273445c64c9c9127168542c4dc17c565f6e507ba0da0c8a3ad5df9",
        "prep_generator_sha": "7df31f951bad6761950848ff8f7bf8b0a8e273e054d14852dbf0df72d76383ab",
        "generator_policy": "v6", "generator_v6_compatible_now": True,
    },
}


def canonical(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode()


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def digest_strings(values: list[str]) -> str:
    return hashlib.sha256(json.dumps(sorted(values), separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()


def load_obj(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict): raise ValueError(f"not_object:{path}")
    return value


def fixed_hashes() -> dict[str, str]:
    return {
        "concurrency_policy_v6_sha256": V6_SHA,
        "full_wave_luna_prelaunch_sha256": LUNA_SHA,
        "cohort_0001_activation_preparation_authority_sha256": COHORTS["cohort-0001"]["prep_authority_sha"],
        "cohort_0001_activation_preparation_readiness_sha256": COHORTS["cohort-0001"]["prep_readiness_sha"],
        "cohort_0001_activation_generator_sha256": COHORTS["cohort-0001"]["prep_generator_sha"],
        "cohort_0002_activation_preparation_authority_sha256": COHORTS["cohort-0002"]["prep_authority_sha"],
        "cohort_0002_activation_preparation_readiness_sha256": COHORTS["cohort-0002"]["prep_readiness_sha"],
        "cohort_0002_activation_generator_sha256": COHORTS["cohort-0002"]["prep_generator_sha"],
        "combined_assignment_digest_sha256": COMBINED_ASSIGNMENT_DIGEST,
        "combined_agent_path_digest_sha256": COMBINED_PATH_DIGEST,
        "combined_feature_union_digest_sha256": COMBINED_FEATURE_DIGEST,
    }


def zero_state_errors(output_files: dict[str, list[str]], receipt_ids: list[str], result_ids: list[str], activation_ids: list[str]) -> list[str]:
    errors: list[str] = []
    if set(output_files) != set(COMBINED_ASSIGNMENT_IDS): errors.append("zero_state:assignment_set")
    if any(output_files.get(aid, []) for aid in COMBINED_ASSIGNMENT_IDS): errors.append("zero_state:nonempty_outputs")
    if receipt_ids: errors.append("zero_state:receipts_present")
    if result_ids: errors.append("zero_state:results_present")
    if activation_ids: errors.append("zero_state:activations_present")
    return errors


def current_snapshot_errors() -> tuple[list[str], dict[str, Any]]:
    errors: list[str] = []
    paths = {
        ROOT / "master/coordination/CONCURRENCY_POLICY_V6.json": V6_SHA,
        WAVE / "validation/luna-prelaunch.json": LUNA_SHA,
    }
    for cohort_id, cfg in COHORTS.items():
        prep = WAVE / "cohorts" / cohort_id / "activation-preparation-v1"
        number = cohort_id[-4:]
        paths[prep / "CANDIDATE_AUTHORITY.json"] = cfg["prep_authority_sha"]
        paths[prep / "readiness.json"] = cfg["prep_readiness_sha"]
        paths[prep / f"generate_cohort_{number}_activation.py"] = cfg["prep_generator_sha"]
    for path, expected in paths.items():
        if not path.is_file() or sha(path) != expected: errors.append(f"fixed_hash:{path}")
    all_rows: list[dict[str, Any]] = []; features_by_cohort: dict[str, list[str]] = {}
    output_files: dict[str, list[str]] = {}; receipts: list[str] = []; results: list[str] = []; activations: list[str] = []
    actual_paths: list[str] = []
    for cohort_id, cfg in COHORTS.items():
        cohort_dir = WAVE / "cohorts" / cohort_id
        rows = [json.loads(line) for line in (cohort_dir / "cohort_manifest.jsonl").read_text().splitlines() if line.strip()]
        all_rows.extend(rows); refs = [ref for row in rows for ref in row.get("feature_refs", [])]; features_by_cohort[cohort_id] = refs
        if [row.get("assignment_id") for row in rows] != cfg["assignment_ids"] or len(refs) != cfg["feature_count"] or digest_strings(refs) != cfg["feature_digest"]:
            errors.append(f"{cohort_id}:scope")
        authority = load_obj(cohort_dir / "activation-preparation-v1/CANDIDATE_AUTHORITY.json")
        readiness = load_obj(cohort_dir / "activation-preparation-v1/readiness.json")
        if authority.get("assignment_ids") != cfg["assignment_ids"] or readiness.get("assignment_ids") != cfg["assignment_ids"]:
            errors.append(f"{cohort_id}:preparation_assignment_binding")
        if cohort_id == "cohort-0001":
            authority_hashes = authority.get("fixed_hashes", {})
            if authority_hashes.get("concurrency_policy_v5_sha256") is None or authority_hashes.get("concurrency_policy_v6_sha256") is not None:
                errors.append("cohort-0001:expected_v5_lineage_not_observed")
        else:
            if authority.get("concurrency_policy_v6_sha256") != V6_SHA or readiness.get("concurrency_policy_v6_sha256") != V6_SHA:
                errors.append("cohort-0002:v6_binding")
        for row in rows:
            aid = row["assignment_id"]
            intent_path = WAVE / "dispatch" / aid / "attempt-0001/dispatch_intent.json"; intent = load_obj(intent_path)
            actual_paths.append(intent.get("prospective_agent_path")); output = Path(intent.get("output_directory", ""))
            output_files[aid] = sorted(path.name for path in output.iterdir() if path.is_file()) if output.is_dir() else ["<missing-directory>"]
            receipt = Path(intent.get("receipt_ref", ""))
            if receipt.is_file(): receipts.append(aid)
            if (output / "result.json").is_file(): results.append(aid)
        if (cohort_dir / "activation.json").is_file(): activations.append(cohort_id)
    ids = [row["assignment_id"] for row in all_rows]
    refs1, refs2 = features_by_cohort["cohort-0001"], features_by_cohort["cohort-0002"]
    if ids != COMBINED_ASSIGNMENT_IDS or len(set(ids)) != 16 or digest_strings(ids) != COMBINED_ASSIGNMENT_DIGEST: errors.append("combined:assignments")
    if actual_paths != COMBINED_AGENT_PATHS or len(set(actual_paths)) != 16 or digest_strings(actual_paths) != COMBINED_PATH_DIGEST: errors.append("combined:paths")
    if set(refs1).intersection(refs2) or len(set(refs1 + refs2)) != COMBINED_FEATURE_COUNT or digest_strings(refs1 + refs2) != COMBINED_FEATURE_DIGEST:
        errors.append("combined:feature_union")
    errors.extend(zero_state_errors(output_files, receipts, results, activations))
    snapshot = {"assignment_ids": ids, "agent_paths": actual_paths, "feature_count": len(set(refs1 + refs2)),
                "feature_union_digest_sha256": digest_strings(refs1 + refs2), "feature_overlap_count": len(set(refs1).intersection(refs2)),
                "output_files": sum(len(files) for files in output_files.values()), "receipts": len(receipts),
                "results": len(results), "activations": len(activations),
                "cohort_0001_generator_v6_compatible_now": False, "cohort_0002_generator_v6_compatible_now": True}
    return sorted(set(errors)), snapshot


def research_checkpoint_errors(value: dict[str, Any]) -> list[str]:
    expected = {"audit_id": AUDIT_ID, "status": "pass", "gate_passed": True, "independent": True,
                "eligible_assignment_ids": RESEARCH_IDS, "eligible_assignment_digest": RESEARCH_DIGEST,
                "rejected_assignment_ids": [], "unresolved_research_rejections": [], "cumulative_research_credit": 8,
                "concurrency_policy_v6_sha256": V6_SHA}
    errors = [f"research:{key}" for key, item in expected.items() if value.get(key) != item]
    if value.get("counts") != {"eligible": 8, "rejected": 0, "unresolved_research_rejections": 0}: errors.append("research:counts")
    return sorted(set(errors))


def cohort_activation_errors(value: dict[str, Any] | None, cohort_id: str, research_sha: str) -> list[str]:
    if not isinstance(value, dict): return [f"{cohort_id}:activation:missing"]
    cfg = COHORTS[cohort_id]
    expected = {"audit_id": AUDIT_ID, "wave_id": WAVE_ID, "cohort_id": cohort_id,
        "status": "ACTIVE_FOR_EXACTLY_8_FRESH_SOL_XHIGH_LEAVES", "activation_granted": True,
        "assignment_count": 8, "assignment_ids": cfg["assignment_ids"], "feature_count": cfg["feature_count"],
        "feature_refs_digest_sha256": cfg["feature_digest"], "model": MODEL, "reasoning_effort": EFFORT,
        "controller_thread_id": CONTROLLER, "agent_paths": cfg["agent_paths"],
        "research_checkpoint_sha256": research_sha, "research_eligible_assignment_ids": RESEARCH_IDS,
        "research_eligible_assignment_digest": RESEARCH_DIGEST, "concurrency_policy_v6_sha256": V6_SHA,
        "semantic_leaf_cap": 8, "coverage_credit_before_postrun": 0, "certification_credit_before_postrun": 0}
    errors = [f"{cohort_id}:activation:{key}" for key, item in expected.items() if value.get(key) != item]
    if "concurrency_policy_v5_sha256" in value: errors.append(f"{cohort_id}:activation:legacy_v5_key")
    bindings = value.get("assignment_bindings", [])
    if len(bindings) != 8 or [row.get("assignment_id") for row in bindings] != cfg["assignment_ids"] or [row.get("agent_path") for row in bindings] != cfg["agent_paths"]:
        errors.append(f"{cohort_id}:activation:bindings")
    return sorted(set(errors))


def independent_verification_errors(value: dict[str, Any] | None, cohort_id: str, activation_path: str, activation_sha: str) -> list[str]:
    if not isinstance(value, dict): return [f"{cohort_id}:verification:missing"]
    cfg = COHORTS[cohort_id]
    expected = {"audit_id": AUDIT_ID, "status": "pass", "gate_passed": True, "independently_verified": True,
        "cohort_id": cohort_id, "activation_path": activation_path, "activation_sha256": activation_sha,
        "assignment_ids": cfg["assignment_ids"], "agent_paths": cfg["agent_paths"], "model": MODEL,
        "reasoning_effort": EFFORT, "controller_thread_id": CONTROLLER, "concurrency_policy_v6_sha256": V6_SHA,
        "source_activation_preparation_authority_sha256": cfg["prep_authority_sha"],
        "source_activation_preparation_readiness_sha256": cfg["prep_readiness_sha"],
        "source_activation_generator_sha256": cfg["prep_generator_sha"],
        "generator_v6_compatibility_verified": True, "zero_prevalidation_credit_verified": True,
        "errors": []}
    return sorted(f"{cohort_id}:verification:{key}" for key, item in expected.items() if value.get(key) != item)


def dual_gate_errors(research: dict[str, Any], research_sha: str, research_actual_sha: str,
                     activation1: dict[str, Any] | None, activation1_path: str, activation1_sha: str, activation1_actual_sha: str,
                     verification1: dict[str, Any] | None,
                     activation2: dict[str, Any] | None, activation2_path: str, activation2_sha: str, activation2_actual_sha: str,
                     verification2: dict[str, Any] | None) -> list[str]:
    errors: list[str] = []
    if research_sha != research_actual_sha: errors.append("research:sha256")
    if activation1_sha != activation1_actual_sha: errors.append("cohort-0001:activation:sha256")
    if activation2_sha != activation2_actual_sha: errors.append("cohort-0002:activation:sha256")
    if activation1_sha == activation2_sha or activation1_path == activation2_path: errors.append("dual:duplicate_activation")
    errors.extend(research_checkpoint_errors(research))
    errors.extend(cohort_activation_errors(activation1, "cohort-0001", research_sha))
    errors.extend(cohort_activation_errors(activation2, "cohort-0002", research_sha))
    errors.extend(independent_verification_errors(verification1, "cohort-0001", activation1_path, activation1_sha))
    errors.extend(independent_verification_errors(verification2, "cohort-0002", activation2_path, activation2_sha))
    if isinstance(activation1, dict) and isinstance(activation2, dict):
        ids1, ids2 = activation1.get("assignment_ids", []), activation2.get("assignment_ids", [])
        paths1, paths2 = activation1.get("agent_paths", []), activation2.get("agent_paths", [])
        if set(ids1).intersection(ids2) or ids1 + ids2 != COMBINED_ASSIGNMENT_IDS: errors.append("dual:assignment_overlap_or_scope")
        if set(paths1).intersection(paths2) or paths1 + paths2 != COMBINED_AGENT_PATHS: errors.append("dual:path_overlap_or_scope")
        if len(ids1) + len(ids2) != 16: errors.append("dual:active_semantic_count")
        if any(value.get("cohort_id") in {"cohort-0003", "cohort-0004"} for value in (activation1, activation2)):
            errors.append("dual:late_cohort_scope")
    return sorted(set(errors))


def main() -> None:
    errors, snapshot = current_snapshot_errors()
    required = ["CANDIDATE_AUTHORITY.json", "launch.template.json", "readiness.json"]
    for name in required:
        if not (PREP / name).is_file(): errors.append(f"required:missing:{name}")
    if any(item.startswith("required:missing") for item in errors):
        print(json.dumps({"status": "fail", "errors": sorted(set(errors))}, indent=2)); raise SystemExit(1)
    authority = load_obj(PREP / "CANDIDATE_AUTHORITY.json"); template = load_obj(PREP / "launch.template.json"); readiness = load_obj(PREP / "readiness.json")
    if authority.get("status") != STATUS or template.get("status") != STATUS or readiness.get("status") != STATUS: errors.append("candidate:status")
    if any(obj.get("launch_authorized") is not False for obj in (authority, template, readiness)): errors.append("candidate:launch_state")
    if authority.get("fixed_hashes") != fixed_hashes() or authority.get("combined_assignment_ids") != COMBINED_ASSIGNMENT_IDS or authority.get("combined_agent_paths") != COMBINED_AGENT_PATHS: errors.append("authority:scope")
    if authority.get("combined_feature_count") != COMBINED_FEATURE_COUNT or authority.get("combined_feature_union_digest_sha256") != COMBINED_FEATURE_DIGEST: errors.append("authority:features")
    if authority.get("current_snapshot") != snapshot: errors.append("authority:snapshot")
    if authority.get("launch_template_sha256") != sha(PREP / "launch.template.json"): errors.append("authority:template_hash")
    scripts = {"verifier_sha256": PREP / "verify_dual_cohort_0001_0002_launch_preparation.py", "test_sha256": PREP / "test_dual_cohort_0001_0002_launch_preparation.py"}
    for key, path in scripts.items():
        if authority.get(key) != sha(path): errors.append(f"authority:{key}")
    if readiness.get("authority_sha256") != sha(PREP / "CANDIDATE_AUTHORITY.json") or readiness.get("template_sha256") != sha(PREP / "launch.template.json"): errors.append("readiness:hashes")
    expected_counts = {"cohorts": 2, "assignments": 16, "features": 1640, "outputs": 16, "output_files": 0, "receipts": 0, "results": 0, "activations": 0}
    if readiness.get("counts") != expected_counts: errors.append("readiness:counts")
    test = subprocess.run(["python3", "-B", str(PREP / "test_dual_cohort_0001_0002_launch_preparation.py")], cwd=PREP, capture_output=True, text=True)
    try: test_report = json.loads(test.stdout)
    except Exception: test_report = {"status": "fail", "test_count": 0, "tests": {}}
    if test.returncode or test_report.get("status") != "pass" or test_report.get("test_count", 0) < 40 or any(value is not True for value in test_report.get("tests", {}).values()): errors.append("tests:fail")
    report = {"audit_id": AUDIT_ID, "checker": "scenario_dual_cohort_0001_0002_launch_preparation_v1",
        "status": "pass" if not errors else "fail", "candidate_status": STATUS, "errors": sorted(set(errors)),
        "counts": expected_counts, "combined_assignment_ids": COMBINED_ASSIGNMENT_IDS,
        "combined_assignment_digest_sha256": COMBINED_ASSIGNMENT_DIGEST, "combined_agent_path_digest_sha256": COMBINED_PATH_DIGEST,
        "combined_feature_count": COMBINED_FEATURE_COUNT, "combined_feature_union_digest_sha256": COMBINED_FEATURE_DIGEST,
        "feature_overlap_count": 0, "fixed_hashes": fixed_hashes(), "current_snapshot": snapshot,
        "cohort_0001_generator_v6_compatible_now": False, "cohort_0002_generator_v6_compatible_now": True,
        "strict_test_count": test_report.get("test_count", 0), "strict_tests": test_report.get("tests", {}),
        "authority_sha256": sha(PREP / "CANDIDATE_AUTHORITY.json"), "template_sha256": sha(PREP / "launch.template.json"),
        "readiness_sha256": sha(PREP / "readiness.json"), "verifier_sha256": sha(scripts["verifier_sha256"]),
        "test_sha256": sha(scripts["test_sha256"]), "launch_authorized": False,
        "launch_credit": 0, "coverage_credit": 0, "certification_credit": 0}
    print(json.dumps(report, indent=2, sort_keys=True)); raise SystemExit(0 if not errors else 1)


if __name__ == "__main__": main()
