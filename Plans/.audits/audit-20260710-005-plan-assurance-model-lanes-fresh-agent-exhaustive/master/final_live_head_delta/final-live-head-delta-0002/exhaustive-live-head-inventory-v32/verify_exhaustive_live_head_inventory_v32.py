#!/usr/bin/env python3
"""Fail-closed verifier for the sealed exhaustive live-head inventory."""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import pathlib
import stat
import sys
from typing import Any

sys.dont_write_bytecode = True
import jsonschema
import prepare_exhaustive_live_head_inventory_v32 as prep


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def canon(value: Any) -> bytes:
    return prep.canon(value)


def rows_raw(rows: list[dict[str, Any]]) -> bytes:
    return b"".join(canon(row) for row in rows)


def aggregate(rows: list[dict[str, Any]]) -> dict[str, Any]:
    ordered = sorted(rows, key=lambda row: row.get("path", ""))
    def selected(class_name: str) -> list[dict[str, Any]]:
        return [row for row in ordered if row.get("classification", {}).get("class") == class_name]
    def path_digest(items: list[dict[str, Any]]) -> str:
        return sha(b"".join(str(row.get("path", "")).encode() + b"\n" for row in items))
    def content_digest(items: list[dict[str, Any]]) -> str:
        return sha(b"".join(str(row.get("xy", "")).encode() + b"\t" + str(row.get("path", "")).encode() + b"\t" + str(row.get("working_tree", {}).get("sha256", "")).encode() + b"\n" for row in items))
    semantic = selected("semantic_canonical")
    generated = selected("generated_governance")
    status_order = sorted(rows, key=lambda row: row.get("status_ordinal", 0))
    status_raw = b"".join(str(row.get("xy", "")).encode() + b" " + str(row.get("path", "")).encode() + b"\n" for row in status_order)
    status_z = b"".join(str(row.get("xy", "")).encode() + b" " + str(row.get("path", "")).encode() + b"\0" for row in status_order)
    return {
        "path_count": len(rows),
        "modified_tracked": sum(row.get("xy") == " M" for row in rows),
        "untracked": sum(row.get("xy") == "??" for row in rows),
        "total_bytes": sum(int(row.get("working_tree", {}).get("size_bytes", 0)) for row in rows),
        "status_sha256": sha(status_raw), "status_z_sha256": sha(status_z),
        "content_state_sha256": content_digest(ordered), "path_set_sha256": path_digest(ordered),
        "semantic_count": len(semantic), "semantic_bytes": sum(row["working_tree"]["size_bytes"] for row in semantic),
        "semantic_path_set_sha256": path_digest(semantic), "semantic_content_state_sha256": content_digest(semantic),
        "generated_count": len(generated), "generated_bytes": sum(row["working_tree"]["size_bytes"] for row in generated),
        "generated_path_set_sha256": path_digest(generated), "generated_content_state_sha256": content_digest(generated),
    }


def load_bundle(live_check: bool = True) -> dict[str, Any]:
    files = sorted(path.relative_to(prep.NS).as_posix() for path in prep.NS.rglob("*") if path.is_file())
    raw = {ref: (prep.NS / ref).read_bytes() for ref in files}
    objects = {}
    for ref in files:
        if ref.endswith(".json"):
            objects[ref] = json.loads(raw[ref])
    inventory_raw = raw.get("inventory.jsonl", b"")
    rows = [json.loads(line) for line in inventory_raw.splitlines() if line]
    predecessor_actual = {ref: prep.file_sha(ref) for ref in {**prep.PREDECESSORS, **prep.FAILED_0001}}
    policy_actual = {prep.V31_REF.as_posix(): prep.file_sha(prep.V31_REF), prep.V32_REF.as_posix(): prep.file_sha(prep.V32_REF)}
    symlink_flags = {ref: (prep.NS / ref).is_symlink() for ref in files}
    hardlink_flags = {ref: (prep.NS / ref).lstat().st_nlink != 1 for ref in files}
    return {
        "files": files, "raw": raw, "objects": objects, "inventory_raw": inventory_raw, "rows": rows,
        "predecessor_actual": predecessor_actual, "policy_actual": policy_actual,
        "future_luna_present": (prep.REPO / prep.FUTURE_LUNA_REF).exists(),
        "symlink_flags": symlink_flags, "hardlink_flags": hardlink_flags,
        "live": prep.snapshot() if live_check else None,
    }


def validation_errors(bundle: dict[str, Any], live_check: bool = True) -> list[str]:
    errors: list[str] = []
    objects = bundle.get("objects", {})
    raw = bundle.get("raw", {})
    rows = bundle.get("rows", [])
    authority = objects.get("AUTHORITY_V32.json", {})
    rules = objects.get("classification_rules.json", {})
    schema = objects.get("inventory_entry.schema.json", {})
    readiness = objects.get("readiness.json", {})
    terminal = objects.get("terminal-preparation-report.json", {})
    seal = objects.get("ARTIFACT_SEAL.json", {})
    required_root = {"AUTHORITY_V32.json", "classification_rules.json", "inventory_entry.schema.json", "inventory.jsonl", "readiness.json", "terminal-preparation-report.json", "ARTIFACT_SEAL.json", *prep.LOGIC_FILES}
    required_files = required_root | {f"observations/observation-{index:04d}.json" for index in range(1, 4)}
    if set(bundle.get("files", [])) != required_files:
        errors.append("namespace-file-set")
    if any(bundle.get("symlink_flags", {}).values()): errors.append("namespace-symlink")
    if any(bundle.get("hardlink_flags", {}).values()): errors.append("namespace-hardlink")
    if authority.get("schema_version") != "audit005-exhaustive-live-head-inventory-authority-v32": errors.append("authority-schema")
    if authority.get("status") != prep.STATUS or authority.get("namespace") != prep.NS_REL.as_posix(): errors.append("authority-status")
    if authority.get("live_scope", {}).get("expected") != prep.EXPECTED: errors.append("authority-expected")
    if authority.get("live_scope", {}).get("branch") != "codex/pm-audit-004-master" or authority.get("live_scope", {}).get("head") != "7f57ffda79c88878816fee922d85fbed29567f97": errors.append("authority-git-pin")
    if authority.get("live_scope", {}).get("pathspec") != prep.PATHSPEC: errors.append("authority-pathspec")
    if authority.get("live_scope", {}).get("digest_framing") != "path-sort; XY + HT + path + HT + sha256(file_bytes).hexdigest() + LF": errors.append("authority-framing")
    if authority.get("authorizations") != prep.AUTHZ or readiness.get("authorizations") != prep.AUTHZ or terminal.get("authorizations") != prep.AUTHZ or seal.get("authorizations") != prep.AUTHZ: errors.append("authorization-leak")
    if authority.get("zero_state") != prep.ZERO or readiness.get("zero_state") != prep.ZERO or terminal.get("zero_state") != prep.ZERO or seal.get("zero_state") != prep.ZERO: errors.append("zero-state-leak")
    predecessor = authority.get("predecessor", {})
    if predecessor.get("role") != "frozen_source_scope_binding_only_not_live_head_completeness" or predecessor.get("protected_files") != prep.PREDECESSORS: errors.append("predecessor-binding")
    limitations = predecessor.get("limitations", {})
    if limitations != {"frozen_rows": 135, "frozen_bytes": 81724, "non_authoritative_live_pins": 15, "exhaustive_live_paths": 299, "missing_from_old_15_pin_table": 284}: errors.append("predecessor-limitations")
    if authority.get("failed_predecessor_0001", {}).get("protected_files") != prep.FAILED_0001 or authority.get("failed_predecessor_0001", {}).get("preserved") is not True: errors.append("failed-0001-binding")
    policy = authority.get("policy_lineage", {})
    if policy.get("v31_sha256") != prep.V31_SHA or policy.get("v32_sha256") != prep.V32_SHA or policy.get("v32_role") != "current_future_activation_no_packet_authority": errors.append("policy-binding")
    luna = authority.get("frozen_scope_luna_prerequisite", {})
    if luna != {"ref": prep.LUNA_SCOPE_REF.as_posix(), "sha256": prep.LUNA_SCOPE_SHA, "status": "PASS_FROZEN_SOURCE_SCOPE_BINDING_ONLY", "live_head_completeness": False, "packet_authority_alone": False}: errors.append("limited-luna-binding")
    future = authority.get("fresh_luna_exhaustive_inventory_gate", {})
    if future.get("required") is not True or future.get("present") is not False or future.get("future_ref") != prep.FUTURE_LUNA_REF.as_posix() or future.get("must_recompute_exact_299") is not True: errors.append("future-luna-contract")
    if bundle.get("future_luna_present"): errors.append("future-luna-present-during-preparation")
    if authority.get("read_policy") != {"canonical_prose_semantic_reads": 0, "hash_only_live_file_reads_per_observation": 299, "classification_basis": "path_metadata_and_frozen_scope_membership_only"}: errors.append("read-policy")
    if rules.get("schema_version") != "audit005-live-head-classification-rules-v32" or rules.get("status") != "FAIL_CLOSED_ORDERED_RULES": errors.append("rules-schema")
    rule_rows = rules.get("rules", [])
    if [row.get("priority") for row in rule_rows] != list(range(1, 13)) or len({row.get("rule_id") for row in rule_rows}) != 12: errors.append("rules-order")
    if rules.get("current_exact_counts") != {"semantic_canonical": 3, "generated_governance": 296, "source_lineage": 0, "semantic_new_candidate": 0, "unknown_fail_closed": 0}: errors.append("rules-counts")
    if rules.get("current_class_digests") != {key: value for key, value in prep.EXPECTED.items() if key.startswith("semantic_") or key.startswith("generated_")}: errors.append("rules-digests")
    if not bundle.get("inventory_raw", b"").endswith(b"\n") or b"\r" in bundle.get("inventory_raw", b""): errors.append("inventory-line-endings")
    if bundle.get("inventory_raw") != rows_raw(rows): errors.append("inventory-canonical-jsonl")
    try:
        validator = jsonschema.Draft202012Validator(schema)
        for index, row in enumerate(rows):
            if list(validator.iter_errors(row)):
                errors.append(f"inventory-schema:{index:03d}")
    except Exception as exc:
        errors.append("inventory-schema-runtime:" + type(exc).__name__)
    if [row.get("ordinal") for row in rows] != list(range(1, len(rows) + 1)): errors.append("inventory-ordinals")
    if sorted(row.get("status_ordinal") for row in rows) != list(range(1, len(rows) + 1)): errors.append("inventory-status-ordinals")
    paths = [row.get("path") for row in rows]
    if paths != sorted(paths) or len(set(paths)) != len(paths): errors.append("inventory-path-order-or-duplicate")
    observed = aggregate(rows)
    for key, value in prep.EXPECTED.items():
        if observed.get(key) != value: errors.append("inventory-metric:" + key)
    try:
        scope = prep.frozen_paths()
        for index, row in enumerate(rows):
            expected_class, expected_rule = prep.classify(row["path"], scope)
            classification = row.get("classification", {})
            if classification.get("class") != expected_class or classification.get("rule_id") != expected_rule or classification.get("frozen_source_scope_member") != (row["path"] in scope): errors.append(f"inventory-classification:{index:03d}")
            head = row.get("head", {})
            if row.get("tracked") != (row.get("xy") != "??") or head.get("present") != row.get("tracked"): errors.append(f"inventory-track-state:{index:03d}")
    except Exception as exc:
        errors.append("classification-runtime:" + type(exc).__name__)
    observations = []
    previous_ref = previous_sha = None
    stable_digest = None
    for index in range(1, 4):
        ref = f"observations/observation-{index:04d}.json"
        observation = objects.get(ref, {})
        observations.append(observation)
        if observation.get("ordinal") != index or observation.get("observation_id") != f"observation-{index:04d}": errors.append("observation-identity")
        if observation.get("previous_observation_ref") != previous_ref or observation.get("previous_observation_sha256") != previous_sha: errors.append("observation-chain")
        if observation.get("stable_equal_expected") is not True or observation.get("stable_equal_previous") is not True: errors.append("observation-stability-claim")
        state = observation.get("state", {})
        if observation.get("state_digest") != sha(canon(state)): errors.append("observation-state-digest")
        if stable_digest is None: stable_digest = observation.get("state_digest")
        elif observation.get("state_digest") != stable_digest: errors.append("observation-state-drift")
        for key, value in prep.EXPECTED.items():
            if state.get(key) != value: errors.append("observation-metric:" + key)
        if state.get("inventory_jsonl_sha256") != sha(bundle.get("inventory_raw", b"")) or state.get("semantic_prose_reads") != 0 or state.get("hash_only_file_reads") != 299: errors.append("observation-inventory-binding")
        previous_ref = (prep.OBS_REL / f"observation-{index:04d}.json").as_posix()
        previous_sha = sha(raw.get(ref, b""))
    readiness_obs = readiness.get("observations", [])
    if readiness.get("status") != prep.STATUS or readiness.get("observation_count") != 3 or readiness.get("stable_state_digest") != stable_digest: errors.append("readiness-state")
    if [row.get("sha256") for row in readiness_obs] != [sha(raw.get(f"observations/observation-{i:04d}.json", b"")) for i in range(1, 4)]: errors.append("readiness-observation-binding")
    if readiness.get("authority_sha256") != sha(raw.get("AUTHORITY_V32.json", b"")) or readiness.get("inventory_sha256") != sha(bundle.get("inventory_raw", b"")): errors.append("readiness-artifact-binding")
    if readiness.get("preparation_complete") is not True or readiness.get("activation_ready") is not False or readiness.get("fresh_luna_exhaustive_inventory_gate_present") is not False: errors.append("readiness-gate")
    if terminal.get("status") != prep.STATUS or terminal.get("preparation_complete") is not True or terminal.get("fresh_luna_exhaustive_inventory_gate_required") is not True or terminal.get("fresh_luna_exhaustive_inventory_gate_present") is not False: errors.append("terminal-status")
    terminal_hashes = terminal.get("artifact_hashes_before_terminal_and_seal", {})
    for ref, expected_hash in terminal_hashes.items():
        if sha(raw.get(ref, b"")) != expected_hash: errors.append("terminal-artifact-hash:" + ref)
    if terminal.get("canonical_plan_writes") != 0 or terminal.get("semantic_prose_reads") != 0 or terminal.get("protected_predecessors_unchanged") is not True: errors.append("terminal-safety")
    seal_files = seal.get("files", {})
    expected_sealed = required_files - {"ARTIFACT_SEAL.json"}
    if set(seal_files) != expected_sealed or seal.get("sealed_file_count_excluding_seal") != len(expected_sealed): errors.append("seal-file-set")
    for ref, metrics in seal_files.items():
        if sha(raw.get(ref, b"")) != metrics.get("sha256") or len(raw.get(ref, b"")) != metrics.get("bytes"): errors.append("seal-artifact:" + ref)
    if seal.get("status") != prep.STATUS or seal.get("future_luna_gate_present") is not False: errors.append("seal-status")
    for ref, expected_hash in {**prep.PREDECESSORS, **prep.FAILED_0001}.items():
        if bundle.get("predecessor_actual", {}).get(ref) != expected_hash: errors.append("protected-predecessor-drift:" + ref)
    if bundle.get("policy_actual", {}).get(prep.V31_REF.as_posix()) != prep.V31_SHA or bundle.get("policy_actual", {}).get(prep.V32_REF.as_posix()) != prep.V32_SHA: errors.append("policy-file-drift")
    if live_check:
        live = bundle.get("live") or {}
        try:
            prep.check_snapshot(live)
            if live.get("inventory_raw") != bundle.get("inventory_raw") or live.get("state_digest") != stable_digest: errors.append("live-head-not-sealed-state")
        except BaseException as exc:
            errors.append("live-head-runtime:" + type(exc).__name__)
    return sorted(set(errors))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--no-live-check", action="store_true")
    args = parser.parse_args()
    try:
        bundle = load_bundle(live_check=not args.no_live_check)
        errors = validation_errors(bundle, live_check=not args.no_live_check)
    except Exception as exc:
        errors = ["load-runtime:" + type(exc).__name__ + ":" + str(exc)]
        bundle = {"rows": []}
    report = {
        "status": "pass_blocked" if not errors else "fail_closed", "control_status": prep.STATUS,
        "errors": errors, "inventory_paths": len(bundle.get("rows", [])), "expected_paths": 299,
        "content_state_sha256": aggregate(bundle.get("rows", [])).get("content_state_sha256") if bundle.get("rows") else None,
        "fresh_luna_exhaustive_inventory_gate_present": False, "activation_authorized": False,
        "zero_state": prep.ZERO,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
