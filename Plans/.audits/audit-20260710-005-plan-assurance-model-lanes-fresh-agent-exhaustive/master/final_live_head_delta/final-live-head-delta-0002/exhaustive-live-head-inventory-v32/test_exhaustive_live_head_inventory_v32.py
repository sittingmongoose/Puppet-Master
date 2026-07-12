#!/usr/bin/env python3
"""In-memory mutation suite; never writes to the sealed namespace."""
from __future__ import annotations

import copy
import hashlib
import json
import sys

sys.dont_write_bytecode = True
import prepare_exhaustive_live_head_inventory_v32 as prep
import verify_exhaustive_live_head_inventory_v32 as verifier


def main() -> None:
    base = verifier.load_bundle(live_check=False)
    outcomes: dict[str, bool] = {}
    categories: dict[str, int] = {}

    def record(category: str, name: str, passed: bool) -> None:
        outcomes[f"{category}:{name}"] = bool(passed)
        categories[category] = categories.get(category, 0) + 1

    def errors(bundle):
        return verifier.validation_errors(bundle, live_check=False)

    def has(bundle, prefix: str) -> bool:
        return any(error == prefix or error.startswith(prefix) for error in errors(bundle))

    def clone():
        return copy.deepcopy(base)

    def sync_rows(bundle) -> None:
        bundle["inventory_raw"] = verifier.rows_raw(bundle["rows"])

    record("positive", "sealed-base", errors(base) == [])
    record("positive", "exact-299", len(base["rows"]) == 299)
    record("positive", "content-digest", verifier.aggregate(base["rows"])["content_state_sha256"] == prep.EXPECTED["content_state_sha256"])
    record("positive", "fresh-luna-absent", not base["future_luna_present"])

    for index in range(32):
        bundle = clone(); row = bundle["rows"][index * len(bundle["rows"]) // 32]
        row["working_tree"]["sha256"] = ("0" if row["working_tree"]["sha256"][0] != "0" else "1") + row["working_tree"]["sha256"][1:]
        sync_rows(bundle); record("content-hash-drift", f"{index:02d}", has(bundle, "inventory-metric:content_state_sha256"))
    for index in range(32):
        bundle = clone(); bundle["rows"][index]["working_tree"]["size_bytes"] += 1; sync_rows(bundle)
        record("size-drift", f"{index:02d}", has(bundle, "inventory-metric:total_bytes"))
    for index in range(24):
        bundle = clone(); bundle["rows"][index]["path"] += f".mutated-{index}"; sync_rows(bundle)
        record("path-drift", f"{index:02d}", has(bundle, "inventory-metric:path_set_sha256") and has(bundle, "inventory-path-order-or-duplicate"))
    for index in range(16):
        bundle = clone(); row = bundle["rows"][index]; row["xy"] = "??" if row["xy"] == " M" else " M"; row["tracked"] = row["xy"] != "??"; sync_rows(bundle)
        record("status-drift", f"{index:02d}", has(bundle, "inventory-metric:status_sha256") and has(bundle, "inventory-metric:content_state_sha256"))
    for index in range(16):
        bundle = clone(); row = bundle["rows"][index]; row["classification"]["class"] = "semantic_canonical" if row["classification"]["class"] == "generated_governance" else "generated_governance"; sync_rows(bundle)
        record("classification-drift", f"{index:02d}", has(bundle, "inventory-classification"))
    for index in range(16):
        bundle = clone(); bundle["rows"][index]["classification"]["rule_id"] += "-tamper"; sync_rows(bundle)
        record("classification-rule-drift", f"{index:02d}", has(bundle, "inventory-classification"))
    semantic_indices = [i for i, row in enumerate(base["rows"]) if row["classification"]["class"] == "semantic_canonical"]
    for index, row_index in enumerate(semantic_indices):
        bundle = clone(); bundle["rows"][row_index]["classification"]["frozen_source_scope_member"] = False; sync_rows(bundle)
        record("frozen-membership-drift", f"{index:02d}", has(bundle, "inventory-classification"))
    tracked_indices = [i for i, row in enumerate(base["rows"]) if row["tracked"]][:16]
    for index, row_index in enumerate(tracked_indices):
        bundle = clone(); oid = bundle["rows"][row_index]["head"]["blob_oid"]; bundle["rows"][row_index]["head"]["blob_oid"] = ("0" if oid[0] != "0" else "1") + oid[1:]; sync_rows(bundle)
        record("head-blob-drift", f"{index:02d}", has(bundle, "seal-artifact:inventory.jsonl") or has(bundle, "inventory-canonical-jsonl"))
    for field, value in (("mode", "100755"), ("link_count", 2), ("file_type", "symlink")):
        for index in range(8):
            bundle = clone(); bundle["rows"][index]["working_tree"][field] = value; sync_rows(bundle)
            record("file-metadata-drift", f"{field}-{index:02d}", has(bundle, "inventory-schema"))
    for index in range(16):
        bundle = clone(); del bundle["rows"][index]; sync_rows(bundle)
        record("row-drop", f"{index:02d}", has(bundle, "inventory-metric:path_count"))
        bundle = clone(); bundle["rows"].insert(index, copy.deepcopy(bundle["rows"][index])); sync_rows(bundle)
        record("row-duplicate", f"{index:02d}", has(bundle, "inventory-path-order-or-duplicate") or has(bundle, "inventory-metric:path_count"))
    for index in range(16):
        bundle = clone(); bundle["rows"][index], bundle["rows"][index + 1] = bundle["rows"][index + 1], bundle["rows"][index]; sync_rows(bundle)
        record("row-order", f"{index:02d}", has(bundle, "inventory-path-order-or-duplicate") or has(bundle, "inventory-ordinals"))
    for index in range(1, 4):
        ref = f"observations/observation-{index:04d}.json"
        for field in ("state_digest", "stable_equal_expected", "stable_equal_previous", "previous_observation_sha256"):
            bundle = clone(); obj = bundle["objects"][ref]
            obj[field] = False if field.startswith("stable_") else "0" * 64
            record("observation-drift", f"{index}-{field}", has(bundle, "observation-"))
    for key in prep.AUTHZ:
        for ref in ("AUTHORITY_V32.json", "readiness.json", "terminal-preparation-report.json", "ARTIFACT_SEAL.json"):
            bundle = clone(); bundle["objects"][ref]["authorizations"][key] = True
            record("authorization-leak", f"{ref}-{key}", has(bundle, "authorization-leak"))
    for key in prep.ZERO:
        for ref in ("AUTHORITY_V32.json", "readiness.json", "terminal-preparation-report.json", "ARTIFACT_SEAL.json"):
            bundle = clone(); bundle["objects"][ref]["zero_state"][key] = 1
            record("zero-state-leak", f"{ref}-{key}", has(bundle, "zero-state-leak"))
    for index, ref in enumerate(prep.PREDECESSORS):
        bundle = clone(); bundle["predecessor_actual"][ref] = "0" * 64
        record("predecessor-drift", f"{index:02d}", has(bundle, "protected-predecessor-drift"))
    for index, ref in enumerate(prep.FAILED_0001):
        bundle = clone(); bundle["predecessor_actual"][ref] = "0" * 64
        record("failed-predecessor-drift", f"{index:02d}", has(bundle, "protected-predecessor-drift"))
    for index, ref in enumerate((prep.V31_REF.as_posix(), prep.V32_REF.as_posix())):
        bundle = clone(); bundle["policy_actual"][ref] = "0" * 64
        record("policy-drift", f"{index:02d}", has(bundle, "policy-file-drift"))
    for index, ref in enumerate(base["objects"]["ARTIFACT_SEAL.json"]["files"]):
        bundle = clone(); bundle["objects"]["ARTIFACT_SEAL.json"]["files"][ref]["sha256"] = "0" * 64
        record("seal-drift", f"{index:02d}", has(bundle, "seal-artifact"))
    bundle = clone(); bundle["future_luna_present"] = True
    record("future-gate", "premature-presence", has(bundle, "future-luna-present-during-preparation"))
    bundle = clone(); bundle["files"].append("foreign.json")
    record("namespace", "foreign-file", has(bundle, "namespace-file-set"))
    bundle = clone(); bundle["files"].pop()
    record("namespace", "missing-file", has(bundle, "namespace-file-set"))
    bundle = clone(); bundle["symlink_flags"]["inventory.jsonl"] = True
    record("namespace", "symlink", has(bundle, "namespace-symlink"))
    bundle = clone(); bundle["hardlink_flags"]["inventory.jsonl"] = True
    record("namespace", "hardlink", has(bundle, "namespace-hardlink"))
    for field in ("path_count", "total_bytes", "status_sha256", "content_state_sha256", "semantic_count", "generated_count"):
        bundle = clone(); bundle["objects"]["AUTHORITY_V32.json"]["live_scope"]["expected"][field] = -1 if isinstance(prep.EXPECTED[field], int) else "0" * 64
        record("authority-pin", field, has(bundle, "authority-expected"))
    for field in ("branch", "head", "pathspec", "digest_framing"):
        bundle = clone(); bundle["objects"]["AUTHORITY_V32.json"]["live_scope"][field] = "tampered"
        record("authority-pin", field, has(bundle, "authority-"))
    failed = sorted(name for name, passed in outcomes.items() if not passed)
    report = {
        "status": "pass" if not failed else "fail_closed", "control_status": prep.STATUS,
        "total": len(outcomes), "passed": sum(outcomes.values()), "failed": failed, "categories": categories,
        "test_digest": hashlib.sha256(json.dumps(outcomes, sort_keys=True, separators=(",", ":")).encode()).hexdigest(),
        "live_namespace_writes": 0, "fresh_luna_dispatched": False, "activation_authorized": False, "zero_state": prep.ZERO,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not failed else 1)


if __name__ == "__main__":
    main()
