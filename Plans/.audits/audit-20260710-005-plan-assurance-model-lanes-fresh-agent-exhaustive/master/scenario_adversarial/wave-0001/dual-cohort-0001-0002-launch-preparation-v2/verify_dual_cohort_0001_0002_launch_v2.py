#!/usr/bin/env python3
"""Verify dual cohort-0001+0002 V6 launch preparation without launching."""

from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path
from typing import Any

PREP = Path(__file__).resolve().parent
WAVE = PREP.parent
ROOT = PREP.parents[3]
C1 = WAVE / "cohorts/cohort-0001"
C2 = WAVE / "cohorts/cohort-0002"
C1_PREP = C1 / "activation-preparation-v2-v6-compat"
C2_PREP = C2 / "activation-preparation-v1"
DUAL_V1 = WAVE / "dual-cohort-0001-0002-launch-preparation-v1"

AUDIT_ID = "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive"
WAVE_ID = "wave-0001"
STATUS = "BLOCKED_AWAITING_RESEARCH_CHECKPOINT_AND_TWO_INDEPENDENT_ACTIVATIONS"
MODEL = "gpt-5.6-sol"
EFFORT = "xhigh"
CONTROLLER = "019f4f5e-96c6-7893-8c94-ce2c1b760d6c"
V6_SHA = "0028914f69fdf97ac639b91166b1a53aef10284f8be0938bc2a2d817b00fc5e0"
V7_SHA = "4641936981927f732851267d66d7e90b0dc5eb2aa7898eea9e3d7895c1b292ed"
LUNA_SHA = "ae8e493e21a6fba1408d7555c6d3ec45f65895c24b611131283c2396c931df83"
RESEARCH_IDS = [f"ER-{index:04d}" for index in range(1, 9)]
RESEARCH_DIGEST = "6309d3442ac7aca5d6faeffa47cd982aafa257c11ebae029102837e331e1dbcc"
ASSIGNMENT_IDS = [f"A005SA-{index:04d}" for index in range(1, 17)]
AGENT_PATHS = [f"/root/a005_scenario_adversarial_{index:04d}_attempt_0001_terminal" for index in range(1, 17)]
ASSIGNMENT_DIGEST = "6d2f77e5a24fdd5a6d7fc4a2d34e811b40b92028d43cf1244da8c02583b1a1a6"
PATH_DIGEST = "bb9131e6ce1a3e5aaa23969ac08db8c64a564e94de3c38a2018c7649c2b0feef"
FEATURE_COUNT = 1640
FEATURE_DIGEST = "a7b9bbf19927b5605fb3fa7ed10cc52878c08528c9f4587a5c973b6c8c3f34de"
COHORTS = {
    "cohort-0001": {"ids": ASSIGNMENT_IDS[:8], "paths": AGENT_PATHS[:8], "feature_count": 823,
        "feature_digest": "aead114c4e46d8bea5bf27623902f0a052d1ba969b7e1c3aad5181537e6183b5",
        "prep": C1_PREP, "prep_hashes": {"authority": "a74d46ea02ba3e0f6ef4c465cfa1c969b72fc4dafa1437143ee31e9536081f49",
            "readiness": "a13ed1b4e0129b6d086d1b9c566f8f4a51a595bac38805d1497d14a0bb1c3f39",
            "template": "77f2f96f910ffbea999a7aaa27291ecebbcba18a2c3b89f9d04b52e81b6135e4",
            "generator": "aa0066bac6c090c11318ea8ae75f2038f605b72d4cb3c6f5a3b16d6910aa0647",
            "verifier": "d47c2e88b688675455246a77bdd91fc99e115d4be0ec9d96c469b74ade4b23fc",
            "tests": "2e730c41ee095e6de6d3b538641c288d33b97272a5a4c21c70219e3e917ee55d"}},
    "cohort-0002": {"ids": ASSIGNMENT_IDS[8:], "paths": AGENT_PATHS[8:], "feature_count": 817,
        "feature_digest": "99163803098a19f4db61c85836f773a0c7a226c313acec0a177a8c1692f93f93",
        "prep": C2_PREP, "prep_hashes": {"authority": "f9ac772b6fb7490848b69f280bde8a63d3ce1dca0f03e8a69923efccc519c1a6",
            "readiness": "aa7b2aabac273445c64c9c9127168542c4dc17c565f6e507ba0da0c8a3ad5df9",
            "template": "965ecdab2e6cb079fb7a920fbef40a13c7de18b2f6ab0afd6cb44f5cd639ec5a",
            "generator": "7df31f951bad6761950848ff8f7bf8b0a8e273e054d14852dbf0df72d76383ab",
            "verifier": "3335d8f0e20bca4d34ee86a8e5856a7e2afd67ddabf9a7080b89e35a9452f219",
            "tests": "4f45895ee1d095e398edbb67ae8177a65fa3d82c49c00994524764d45ea02c6d"}},
}
DUAL_V1_HASHES = {"authority": "6e8756b67c8db057f7a688c4a0769db89a8415241d9b9bd23ae3e57ed266b9b8",
    "template": "c8ebd59844a825d4b1a959453cc80d67c5d4db5d6240c6df37da9884eb61926c",
    "readiness": "6b0b51f89ac194a68f306dbbd9fd01a1b2a7c7915ccb40a0b95898266de15ecf",
    "verifier": "fdada52c6d5a7b3660434e93113b7034bde7120e7fc1cbd0884cb5a0cedd48b2",
    "tests": "41b0c8ea87b4d6137211dcca20c3bb73b4a9acecaa0109cf697b28412151c7a3"}


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


def fixed_hashes() -> dict[str, Any]:
    return {"full_wave_luna_prelaunch_sha256": LUNA_SHA, "concurrency_policy_v6_semantic_sha256": V6_SHA,
            "concurrency_policy_v7_scheduling_only_sha256": V7_SHA,
            "prior_dual_v1_hashes": DUAL_V1_HASHES,
            "cohort_0001_v6_preparation_hashes": COHORTS["cohort-0001"]["prep_hashes"],
            "cohort_0002_v6_preparation_hashes": COHORTS["cohort-0002"]["prep_hashes"],
            "combined_assignment_digest_sha256": ASSIGNMENT_DIGEST,
            "combined_agent_path_digest_sha256": PATH_DIGEST,
            "combined_feature_union_digest_sha256": FEATURE_DIGEST}


def zero_inventory_errors(output_files: dict[str, list[str]], receipts: list[str], results: list[str], activations: list[str]) -> list[str]:
    errors: list[str] = []
    if set(output_files) != set(ASSIGNMENT_IDS) or any(output_files.get(aid) for aid in ASSIGNMENT_IDS): errors.append("zero_state:outputs")
    if receipts: errors.append("zero_state:receipts")
    if results: errors.append("zero_state:results")
    if activations: errors.append("zero_state:activations")
    return errors


def current_snapshot_errors() -> tuple[list[str], dict[str, Any]]:
    errors: list[str] = []
    pins = {ROOT / "master/coordination/CONCURRENCY_POLICY_V6.json": V6_SHA,
            ROOT / "master/coordination/CONCURRENCY_POLICY_V7.json": V7_SHA,
            WAVE / "validation/luna-prelaunch.json": LUNA_SHA,
            DUAL_V1 / "CANDIDATE_AUTHORITY.json": DUAL_V1_HASHES["authority"],
            DUAL_V1 / "launch.template.json": DUAL_V1_HASHES["template"],
            DUAL_V1 / "readiness.json": DUAL_V1_HASHES["readiness"],
            DUAL_V1 / "verify_dual_cohort_0001_0002_launch_preparation.py": DUAL_V1_HASHES["verifier"],
            DUAL_V1 / "test_dual_cohort_0001_0002_launch_preparation.py": DUAL_V1_HASHES["tests"]}
    file_names = {"authority": "CANDIDATE_AUTHORITY.json", "readiness": "readiness.json", "template": "activation.template.json",
                  "generator": None, "verifier": None, "tests": None}
    for cohort_id, cfg in COHORTS.items():
        if cohort_id == "cohort-0001": file_names.update({"generator": "generate_cohort_0001_activation_v2.py", "verifier": "verify_cohort_0001_activation_v2.py", "tests": "test_cohort_0001_activation_v2.py"})
        else: file_names.update({"generator": "generate_cohort_0002_activation.py", "verifier": "verify_cohort_0002_activation_preparation.py", "tests": "test_cohort_0002_activation.py"})
        for key, name in file_names.items(): pins[cfg["prep"] / name] = cfg["prep_hashes"][key]
    for path, expected in pins.items():
        if not path.is_file() or sha(path) != expected: errors.append(f"fixed_hash:{path}")
    c1a, c1r = load_obj(C1_PREP / "CANDIDATE_AUTHORITY.json"), load_obj(C1_PREP / "readiness.json")
    c2a, c2r = load_obj(C2_PREP / "CANDIDATE_AUTHORITY.json"), load_obj(C2_PREP / "readiness.json")
    if c1a.get("assignment_ids") != COHORTS["cohort-0001"]["ids"] or c1a.get("agent_paths") != COHORTS["cohort-0001"]["paths"] or c1a.get("concurrency_policy_v6_semantic_sha256") != V6_SHA: errors.append("cohort-0001:preparation_scope")
    if c2a.get("assignment_ids") != COHORTS["cohort-0002"]["ids"] or c2a.get("agent_paths") != COHORTS["cohort-0002"]["paths"] or c2a.get("concurrency_policy_v6_sha256") != V6_SHA: errors.append("cohort-0002:preparation_scope")
    if c1r.get("counts", {}).get("features") != 823 or c2r.get("counts", {}).get("features") != 817: errors.append("cohorts:feature_counts")
    prior = load_obj(DUAL_V1 / "CANDIDATE_AUTHORITY.json")
    if prior.get("combined_assignment_ids") != ASSIGNMENT_IDS or prior.get("combined_agent_paths") != AGENT_PATHS or prior.get("combined_feature_count") != FEATURE_COUNT or prior.get("combined_feature_union_digest_sha256") != FEATURE_DIGEST or prior.get("feature_overlap_count") != 0:
        errors.append("prior_dual:combined_scope")
    output_files: dict[str, list[str]] = {}; receipts: list[str] = []; results: list[str] = []
    c1_rows = [json.loads(line) for line in (C1 / "cohort_manifest.jsonl").read_text().splitlines() if line.strip()]
    c2_rows = c2a.get("assignment_bindings", [])
    rows = []
    for row in c1_rows:
        rows.append({"assignment_id": row["assignment_id"], "agent_path": row["prospective_agent_path"],
                     "output_directory": str(ROOT / row["output_directory"])})
    rows.extend({"assignment_id": row["assignment_id"], "agent_path": row["agent_path"], "output_directory": row["output_directory"]} for row in c2_rows)
    for row in rows:
        aid = row["assignment_id"]; output = Path(row["output_directory"]); intent = WAVE / "dispatch" / aid / "attempt-0001/dispatch_intent.json"
        output_files[aid] = sorted(path.name for path in output.iterdir() if path.is_file()) if output.is_dir() else ["<missing-directory>"]
        if intent.with_name("dispatch_receipt.json").is_file(): receipts.append(aid)
        if (output / "result.json").is_file(): results.append(aid)
    activations = sorted(str(path) for path in (WAVE / "cohorts").glob("cohort-*/activation.json") if path.is_file())
    errors.extend(zero_inventory_errors(output_files, receipts, results, activations))
    ids = [row["assignment_id"] for row in rows]; paths = [row["agent_path"] for row in rows]
    if ids != ASSIGNMENT_IDS or len(set(ids)) != 16 or digest_strings(ids) != ASSIGNMENT_DIGEST: errors.append("combined:assignments")
    if paths != AGENT_PATHS or len(set(paths)) != 16 or digest_strings(paths) != PATH_DIGEST: errors.append("combined:paths")
    state = {"assignments": len(ids), "features": FEATURE_COUNT, "feature_overlap": 0, "outputs": len(output_files),
             "output_files": sum(len(value) for value in output_files.values()), "receipts": len(receipts),
             "results": len(results), "activations": len(activations)}
    return sorted(set(errors)), state


def checkpoint_errors(value: dict[str, Any]) -> list[str]:
    expected = {"audit_id": AUDIT_ID, "status": "pass", "gate_passed": True, "independent": True,
                "eligible_assignment_ids": RESEARCH_IDS, "eligible_assignment_digest": RESEARCH_DIGEST,
                "rejected_assignment_ids": [], "unresolved_research_rejections": [],
                "cumulative_research_credit": 8, "concurrency_policy_v6_sha256": V6_SHA}
    errors = [f"research:{key}" for key, item in expected.items() if value.get(key) != item]
    if value.get("counts") != {"eligible": 8, "rejected": 0, "unresolved_research_rejections": 0}: errors.append("research:counts")
    return sorted(set(errors))


def cohort_activation_errors(value: dict[str, Any] | None, cohort_id: str, checkpoint_path: str, checkpoint_sha: str) -> list[str]:
    if not isinstance(value, dict): return [f"{cohort_id}:activation:missing"]
    cfg = COHORTS[cohort_id]
    expected = {"audit_id": AUDIT_ID, "wave_id": WAVE_ID, "cohort_id": cohort_id,
                "status": "ACTIVE_FOR_EXACTLY_8_FRESH_SOL_XHIGH_LEAVES", "activation_granted": True,
                "assignment_count": 8, "assignment_ids": cfg["ids"], "feature_count": cfg["feature_count"],
                "feature_refs_digest_sha256": cfg["feature_digest"], "model": MODEL, "reasoning_effort": EFFORT,
                "controller_thread_id": CONTROLLER, "agent_paths": cfg["paths"],
                "research_checkpoint_path": checkpoint_path, "research_checkpoint_sha256": checkpoint_sha,
                "research_eligible_assignment_ids": RESEARCH_IDS, "research_eligible_assignment_digest": RESEARCH_DIGEST,
                "semantic_leaf_cap": 8, "coverage_credit_before_postrun": 0, "certification_credit_before_postrun": 0}
    errors = [f"{cohort_id}:activation:{key}" for key, item in expected.items() if value.get(key) != item]
    if cohort_id == "cohort-0001":
        extra = {"schema_version": "scenario-adversarial-cohort-activation-v2-v6",
                 "concurrency_policy_v6_semantic_sha256": V6_SHA,
                 "concurrency_policy_v7_scheduling_only_sha256": V7_SHA, "v7_changes_semantics": False,
                 "zero_prevalidation_credit": True}
        errors.extend(f"{cohort_id}:activation:{key}" for key, item in extra.items() if value.get(key) != item)
        if not value.get("cohort_authorization_path") or not value.get("cohort_authorization_sha256"): errors.append(f"{cohort_id}:activation:authorization_binding")
    else:
        if value.get("concurrency_policy_v6_sha256") != V6_SHA: errors.append(f"{cohort_id}:activation:v6")
    if "concurrency_policy_v5_sha256" in value: errors.append(f"{cohort_id}:activation:v5_replay")
    bindings = value.get("assignment_bindings", [])
    if len(bindings) != 8 or [row.get("assignment_id") for row in bindings] != cfg["ids"] or [row.get("agent_path") for row in bindings] != cfg["paths"]: errors.append(f"{cohort_id}:activation:bindings")
    if len(value.get("assignment_ids", [])) in {16, 32}: errors.append(f"{cohort_id}:activation:expanded_scope")
    return sorted(set(errors))


def verification_errors(value: dict[str, Any] | None, cohort_id: str, activation_path: str, activation_sha: str,
                        checkpoint_path: str, checkpoint_sha: str) -> list[str]:
    if not isinstance(value, dict): return [f"{cohort_id}:verification:missing"]
    cfg = COHORTS[cohort_id]
    expected = {"audit_id": AUDIT_ID, "wave_id": WAVE_ID, "cohort_id": cohort_id, "status": "pass",
                "gate_passed": True, "independent": True, "activation_path": activation_path,
                "activation_sha256": activation_sha, "research_checkpoint_path": checkpoint_path,
                "research_checkpoint_sha256": checkpoint_sha, "assignment_ids": cfg["ids"], "agent_paths": cfg["paths"],
                "feature_count": cfg["feature_count"], "feature_refs_digest_sha256": cfg["feature_digest"],
                "model": MODEL, "reasoning_effort": EFFORT, "controller_thread_id": CONTROLLER,
                "concurrency_policy_v6_semantic_sha256": V6_SHA,
                "source_preparation_hashes": cfg["prep_hashes"], "zero_prevalidation_credit_verified": True,
                "errors": [], "coverage_credit": 0, "certification_credit": 0}
    errors = [f"{cohort_id}:verification:{key}" for key, item in expected.items() if value.get(key) != item]
    if cohort_id == "cohort-0001" and (value.get("concurrency_policy_v7_scheduling_only_sha256") != V7_SHA or value.get("v7_changes_semantics") is not False): errors.append("cohort-0001:verification:v7_role")
    return sorted(set(errors))


def dual_gate_errors(research: dict[str, Any], checkpoint_path: str, checkpoint_sha: str, checkpoint_actual_sha: str,
                     activation1: dict[str, Any] | None, activation1_path: str, activation1_sha: str, activation1_actual_sha: str,
                     verification1: dict[str, Any] | None, activation2: dict[str, Any] | None, activation2_path: str,
                     activation2_sha: str, activation2_actual_sha: str, verification2: dict[str, Any] | None) -> list[str]:
    errors: list[str] = []
    if checkpoint_sha != checkpoint_actual_sha: errors.append("research:sha256")
    if activation1_sha != activation1_actual_sha: errors.append("cohort-0001:activation:sha256")
    if activation2_sha != activation2_actual_sha: errors.append("cohort-0002:activation:sha256")
    if activation1_path == activation2_path or activation1_sha == activation2_sha: errors.append("dual:duplicate_activation")
    errors.extend(checkpoint_errors(research))
    errors.extend(cohort_activation_errors(activation1, "cohort-0001", checkpoint_path, checkpoint_sha))
    errors.extend(cohort_activation_errors(activation2, "cohort-0002", checkpoint_path, checkpoint_sha))
    errors.extend(verification_errors(verification1, "cohort-0001", activation1_path, activation1_sha, checkpoint_path, checkpoint_sha))
    errors.extend(verification_errors(verification2, "cohort-0002", activation2_path, activation2_sha, checkpoint_path, checkpoint_sha))
    if isinstance(activation1, dict) and isinstance(activation2, dict):
        ids1, ids2 = activation1.get("assignment_ids", []), activation2.get("assignment_ids", [])
        paths1, paths2 = activation1.get("agent_paths", []), activation2.get("agent_paths", [])
        if set(ids1).intersection(ids2) or ids1 + ids2 != ASSIGNMENT_IDS: errors.append("dual:assignment_overlap_or_scope")
        if set(paths1).intersection(paths2) or paths1 + paths2 != AGENT_PATHS: errors.append("dual:path_overlap_or_scope")
        if len(ids1) + len(ids2) != 16: errors.append("dual:active_semantic_count")
        if any(value.get("cohort_id") in {"cohort-0003", "cohort-0004"} for value in (activation1, activation2)): errors.append("dual:late_cohort_scope")
    return sorted(set(errors))


def main() -> None:
    errors, state = current_snapshot_errors()
    for name in ("CANDIDATE_AUTHORITY.json", "launch.template.json", "readiness.json", "test_dual_cohort_0001_0002_launch_v2.py"):
        if not (PREP / name).is_file(): errors.append(f"required:missing:{name}")
    if any(item.startswith("required:missing") for item in errors):
        print(json.dumps({"status": "fail", "errors": sorted(set(errors))}, indent=2)); raise SystemExit(1)
    authority, template, readiness = (load_obj(PREP / name) for name in ("CANDIDATE_AUTHORITY.json", "launch.template.json", "readiness.json"))
    for label, value in (("authority", authority), ("template", template), ("readiness", readiness)):
        if value.get("status") != STATUS or value.get("activation_granted") is not False or value.get("launch_authorized") is not False: errors.append(f"{label}:state")
    if authority.get("fixed_hashes") != fixed_hashes() or template.get("fixed_hashes") != fixed_hashes(): errors.append("candidate:fixed_hashes")
    if authority.get("combined_assignment_ids") != ASSIGNMENT_IDS or authority.get("combined_agent_paths") != AGENT_PATHS or authority.get("combined_feature_count") != FEATURE_COUNT or authority.get("combined_feature_union_digest_sha256") != FEATURE_DIGEST: errors.append("authority:scope")
    if authority.get("template_sha256") != sha(PREP / "launch.template.json") or authority.get("verifier_sha256") != sha(PREP / "verify_dual_cohort_0001_0002_launch_v2.py") or authority.get("test_sha256") != sha(PREP / "test_dual_cohort_0001_0002_launch_v2.py"): errors.append("authority:payload_hashes")
    if readiness.get("authority_sha256") != sha(PREP / "CANDIDATE_AUTHORITY.json") or readiness.get("template_sha256") != sha(PREP / "launch.template.json"): errors.append("readiness:hashes")
    if readiness.get("current_state") != state: errors.append("readiness:state")
    expected_counts = {"cohorts": 2, "assignments": 16, "features": 1640, "feature_overlap": 0, "outputs": 16,
                       "output_files": 0, "receipts": 0, "results": 0, "activations": 0}
    if readiness.get("counts") != expected_counts: errors.append("readiness:counts")
    test = subprocess.run(["python3", "-B", str(PREP / "test_dual_cohort_0001_0002_launch_v2.py")], cwd=PREP, capture_output=True, text=True)
    try: test_report = json.loads(test.stdout)
    except Exception: test_report = {"status": "fail", "test_count": 0, "tests": {}}
    if test.returncode or test_report.get("status") != "pass" or test_report.get("test_count", 0) < 60 or any(value is not True for value in test_report.get("tests", {}).values()): errors.append("tests:fail")
    report = {"audit_id": AUDIT_ID, "checker": "scenario_dual_cohort_0001_0002_launch_v2_preparation",
              "status": "pass" if not errors else "fail", "candidate_status": STATUS, "errors": sorted(set(errors)),
              "counts": expected_counts, "current_state": state, "fixed_hashes": fixed_hashes(),
              "combined_assignment_ids": ASSIGNMENT_IDS, "combined_assignment_digest_sha256": ASSIGNMENT_DIGEST,
              "combined_agent_path_digest_sha256": PATH_DIGEST, "combined_feature_count": FEATURE_COUNT,
              "combined_feature_union_digest_sha256": FEATURE_DIGEST, "feature_overlap_count": 0,
              "strict_test_count": test_report.get("test_count", 0), "strict_tests": test_report.get("tests", {}),
              "authority_sha256": sha(PREP / "CANDIDATE_AUTHORITY.json"), "template_sha256": sha(PREP / "launch.template.json"),
              "readiness_sha256": sha(PREP / "readiness.json"), "verifier_sha256": sha(PREP / "verify_dual_cohort_0001_0002_launch_v2.py"),
              "test_sha256": sha(PREP / "test_dual_cohort_0001_0002_launch_v2.py"),
              "activation_granted": False, "launch_authorized": False, "coverage_credit": 0, "certification_credit": 0}
    print(json.dumps(report, indent=2, sort_keys=True)); raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
