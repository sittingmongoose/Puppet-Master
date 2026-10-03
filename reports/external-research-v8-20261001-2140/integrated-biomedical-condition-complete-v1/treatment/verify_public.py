#!/usr/bin/env python3
"""Read-only offline public hashes/declarations checker. No native replay or quality claim.
INPUT_MAP schema: {"schema": ..., "cases": {caseID: assignment}}.
Portable manifests must use LAB_ROOT/<cohort-relative-path>; no path rebinding.
"""
import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

ROLES = ("research-proposal", "independent-candidate-critic", "final-correction")
SECS = (1200, 1200, 900)
CAPS = {"research_proposal_seconds": 1200, "candidate_critic_seconds": 1200,
        "final_correction_seconds": 900, "summed_stage_hard_seconds": 3300,
        "host_overhead_hard_seconds": 300, "case_occupied_hard_seconds": 5400}
MAP_PATH = "dev/prospective-timing-v3/INPUT_MAP.json"

class CheckError(ValueError):
    pass

def require(condition, message):
    if not condition:
        raise CheckError(message)

def checked_cohort(cohort):
    cohort = Path(cohort).absolute()
    for part in (cohort, *cohort.parents):
        require(not part.is_symlink(), "cohort or ancestor symlink")
    require(cohort.is_dir(), "cohort dir missing")
    return cohort

def safe_join(cohort, rel):
    require(isinstance(rel, str) and bool(rel), "empty/non-string relative path")
    p = Path(rel)
    require(not p.is_absolute() and ".." not in p.parts and p.parts,
            "absolute, parent traversal or empty relative path")
    cur = cohort
    for part in p.parts:
        cur = cur / part
        require(not cur.is_symlink(), "symlink path component")
    resolved = cur.resolve()
    require(cohort in resolved.parents, "path must be a file inside cohort")
    return cur

def unique_object(pairs):
    result = {}
    for key, value in pairs:
        require(key not in result, "duplicate JSON object key")
        result[key] = value
    return result

def read_json(path):
    try:
        with path.open(encoding="utf-8") as handle:
            value = json.load(handle, object_pairs_hook=unique_object)
    except (OSError, ValueError) as exc:
        raise CheckError("metadata unreadable or invalid JSON: " + path.name) from exc
    require(isinstance(value, dict), "metadata root must be object")
    return value

def verify_artifacts(cohort):
    doc = read_json(safe_join(cohort, "PUBLIC_EXPORT.json"))
    artifacts = doc.get("artifacts")
    require(isinstance(artifacts, list) and bool(artifacts), "no artifacts list")
    seen = set()
    for artifact in artifacts:
        require(isinstance(artifact, dict), "malformed artifact")
        rel, want = artifact.get("public_path"), artifact.get("public_sha256")
        require(isinstance(want, str) and re.fullmatch(r"[0-9a-fA-F]{64}", want), "invalid SHA-256")
        path = safe_join(cohort, rel)
        require(path not in seen, "duplicate artifact path")
        seen.add(path)
        require(path.is_file(), "artifact file missing")
        require(hashlib.sha256(path.read_bytes()).hexdigest() == want.lower(), "artifact hash mismatch")
    return len(artifacts)

def identifier(value):
    return isinstance(value, str) and re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_-]*", value)

def check_manifest(cohort, macro, case_id, pair_id, arm):
    require(isinstance(macro, str) and macro.startswith("LAB_ROOT/"), "manifest must use LAB_ROOT/")
    manifest = read_json(safe_join(cohort, macro[len("LAB_ROOT/"):]))
    require(manifest.get("case_id") == case_id, "manifest case_id mismatch")
    require(manifest.get("pair_id") == pair_id, "manifest pair_id mismatch")
    require(manifest.get("pair_arm") == arm, "manifest pair_arm mismatch")
    stages = manifest.get("stages")
    require(isinstance(stages, list) and len(stages) == 3, "need exactly three ordered stages")
    for stage, role, seconds in zip(stages, ROLES, SECS):
        require(isinstance(stage, dict), "malformed stage")
        require(stage.get("reservation_id") == case_id + "-" + role, "reservation_id mismatch")
        require(type(stage.get("seconds")) is int and stage["seconds"] == seconds, "stage seconds mismatch")
    caps = manifest.get("caps")
    require(isinstance(caps, dict), "caps missing")
    for key, value in CAPS.items():
        require(type(caps.get(key)) is int and caps[key] == value, "cap mismatch: " + key)
    wall_keys = [key for key in ("case_wall_hard_seconds", "case_elapsed_hard_seconds") if key in caps]
    require(bool(wall_keys), "wall/elapsed cap missing")
    for key in wall_keys:
        require(type(caps[key]) is int and caps[key] == 3600, "wall/elapsed cap mismatch")
    for key in ("research_response_cap", "critic_response_cap", "correction_response_cap"):
        require(type(caps.get(key)) is int and caps[key] == 160, "response cap mismatch: " + key)
    return caps

def check_timing(cohort):
    path = safe_join(cohort, MAP_PATH)
    if not path.exists():
        return False
    data = read_json(path)
    cases = data.get("cases")
    require(isinstance(cases, dict) and len(cases) == 12, "need cases dict with 12 assignments")
    pairs, manifests = {}, set()
    for case_id, assignment in cases.items():
        require(identifier(case_id) and isinstance(assignment, dict), "invalid case assignment")
        if "case_id" in assignment:
            require(assignment["case_id"] == case_id, "assignment case_id mismatch")
        pair_id, arm, macro = assignment.get("pair_id"), assignment.get("arm"), assignment.get("manifest")
        require(identifier(pair_id) and arm in ("control", "treatment"), "invalid pair_id/arm")
        require(isinstance(macro, str), "manifest path missing")
        require(macro not in manifests, "duplicate manifest path")
        manifests.add(macro)
        arms = pairs.setdefault(pair_id, {})
        require(arm not in arms, "duplicate arm within pair")
        arms[arm] = check_manifest(cohort, macro, case_id, pair_id, arm)
    require(len(pairs) == 6 and all(set(arms) == {"control", "treatment"} for arms in pairs.values()),
            "need six complete control/treatment pairs")
    for arms in pairs.values():
        require(arms["control"] == arms["treatment"], "paired manifest caps differ")
    return True

def verify(cohort):
    cohort = checked_cohort(cohort)
    return {"verified_artifacts": verify_artifacts(cohort),
            "timing_declarations_present_and_valid": check_timing(cohort),
            "scope": "offline artifact hashes and optional declarations only",
            "native_replay_verified": False, "model_quality_assessed": False}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("cohort", type=Path)
    try:
        print(json.dumps(verify(parser.parse_args().cohort), sort_keys=True))
    except (CheckError, OSError) as exc:
        print("FAIL: " + str(exc), file=sys.stderr)
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())
