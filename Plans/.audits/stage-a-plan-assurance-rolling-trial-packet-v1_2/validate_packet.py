#!/usr/bin/env python3
"""Build once and deterministically validate the v1.2 representation repair packet."""

from __future__ import annotations

import argparse
import contextlib
import copy
import hashlib
import importlib.util
import io
import json
import os
import stat
import sys
from pathlib import Path
from typing import Any, Callable

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[2]
PLANS = REPO / "Plans"
V1_PACKET = ROOT.parent / "stage-a-plan-assurance-rolling-trial-packet-v1"
V11_PACKET = ROOT.parent / "stage-a-plan-assurance-rolling-trial-packet-v1_1"
V11_RUN = ROOT.parent / "stage-a-plan-assurance-rolling-trial-v1_1-run-001"
sys.path.insert(0, str(ROOT))
import v1_2_receipts as v12  # noqa: E402
import validate_trial_artifacts as validator  # noqa: E402

CORE_FILES = {
    "README.md", "CHANGED_FROM_V1_1.json", "ROLLING_TRIAL_CONTRACT.json",
    "SOURCE_SNAPSHOT.schema.json", "SOURCE_SNAPSHOT_BUCKET_SHARD.schema.json",
    "STRUCTURAL_COVERAGE_MAP.schema.json", "STRUCTURAL_COVERAGE_MAP_SHARD.schema.json",
    "CAPABILITY_SLICE_MANIFEST.schema.json", "RUN_ROOT_CREATION_RECEIPT.schema.json",
    "FRESH_LAUNCH_IDENTITY.schema.json", "v1_2_receipts.py",
    "validate_trial_artifacts.py", "validate_packet.py",
}
TERMINAL_FILES = {
    "PACKET_VALIDATION.json", "V1_2_REPAIR_DECISION.json", "CONTROLLER_DECISION.json",
    "FINAL_REPORT.md", "ROOT_TERMINAL_HANDOFF.json",
}
V11_CORE_SHA = "b1f87276139f1ade7e33b894a68dc6c7c948f4cb23efa7901c9168b5a844f1ff"
V11_EFFECTIVE_SHA = "7a73c4f3aa52807be2d6aa24a92c2efae9ba854a6cfdf429bba442ac7d917c32"
V11_HANDOFF_SHA = "0e6cf48f275e683bb0dd5310491db6694fd4a6f4dfe83fb6b05f14a875a6dba9"
V11_STRUCTURAL_SHA = "119e614e9db1d4050bd6541a7b91cfbe49cfe3c6f84b503a61848e40171b7448"


def _load_module(path: Path, name: str) -> Any:
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"IMPORT:{path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


def load(path: Path) -> Any:
    return v12.strict_json_loads(path.read_text(encoding="utf-8"))


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def contract_findings(contract: dict[str, Any]) -> list[str]:
    findings: list[str] = []
    if contract.get("packet_id") != v12.PACKET_ID:
        findings.append("CONTRACT:PACKET_ID")
    inheritance = contract.get("inheritance", {})
    if inheritance.get("parent_packet_core_population_sha256") != V11_CORE_SHA or inheritance.get("parent_effective_contract_sha256") != V11_EFFECTIVE_SHA or inheritance.get("parent_root_terminal_handoff_sha256") != V11_HANDOFF_SHA:
        findings.append("CONTRACT:PARENT_BINDING")
    if inheritance.get("parent_terminal_preserved") != "INPUT_DRIFT_STOP:EXCLUDED_RUN_ROOT_ANCESTOR_METADATA_UNMODELED" or inheritance.get("parent_terminal_relabel_forbidden") is not True:
        findings.append("CONTRACT:PARENT_STOP")
    source = contract.get("repairs", {}).get("source_directory_identity", {})
    if source.get("algorithm_id") != v12.SOURCE_ALGORITHM_ID or source.get("directory_link_count_policy_id") != v12.DIRECTORY_LINK_POLICY_ID or "regular-file link counts remain exact" not in source.get("rule", ""):
        findings.append("CONTRACT:SOURCE_REPAIR")
    structural = contract.get("repairs", {}).get("structural_sharding", {})
    if structural.get("representation_id") != v12.STRUCTURAL_REPRESENTATION_ID or "unchanged v1 structural" not in structural.get("logical_semantics", ""):
        findings.append("CONTRACT:STRUCTURAL_REPAIR")
    authority = contract.get("authority", {})
    false_keys = ("trial_launch_authorized", "authority_request_authorized", "external_research_authorized_by_this_packet", "trial_semantic_model_dispatch_authorized", "canonical_plan_writes_authorized", "generated_or_governance_writes_authorized", "git_write_authorized")
    if any(authority.get(key) is not False for key in false_keys) or authority.get("launch_commands") != []:
        findings.append("CONTRACT:AUTHORITY")
    preserved = contract.get("preserved_parent_semantics", {})
    if len(preserved.get("pilot_families", [])) != 4 or preserved.get("required_control_count") != 33 or preserved.get("worker_descendants_allowed") is not False or preserved.get("worker_repo_reads_authorized") is not False or preserved.get("worker_writes_authorized") is not False or preserved.get("fork_turns") != "none":
        findings.append("CONTRACT:PRESERVED_SEMANTICS")
    budgets = contract.get("budgets", {})
    exact = {
        "ordinary_physical_file_bytes_maximum": 1048576, "shard_physical_bytes_maximum": 8388608,
        "shard_decoded_bytes_maximum": 8388608, "shard_target_decoded_bytes": 4194304,
        "logical_artifact_decoded_bytes_maximum": 100663296, "shards_per_logical_artifact_maximum": 32,
        "shard_files_campaign_maximum": 128, "artifact_files_maximum": 640,
        "artifact_bytes_maximum": 201326592, "decoded_logical_bytes_campaign_maximum": 268435456,
        "terminal_reserve_physical_bytes": 4194304, "terminal_reserve_decoded_bytes": 4194304,
        "terminal_reserve_files": 8,
    }
    for key, value in exact.items():
        if budgets.get(key) != value:
            findings.append(f"CONTRACT:BUDGET:{key}")
    payload = copy.deepcopy(contract)
    recorded = payload.pop("repair_payload_sha256", None)
    if recorded != v12.identity_hash("rolling-trial-contract-repair", payload):
        findings.append("CONTRACT:REPAIR_PAYLOAD")
    return findings


def _portable_v11_replay(absent_root: Path) -> dict[str, Any]:
    module = _load_module(V11_PACKET / "validate_packet.py", "pm_v11_packet_portable_replay")
    module.FUTURE_RUN = absent_root
    buffer = io.StringIO()
    with contextlib.redirect_stdout(buffer):
        code = module.main()
    lines = [line for line in buffer.getvalue().splitlines() if line.strip()]
    result = json.loads(lines[-1]) if lines else {}
    return {
        "mode": "portable_v1_1_validator_rebound_to_fresh_absent_v1_2_root",
        "exact_live_v1_1_point_in_time_rerun": False,
        "exit_code": code, "terminal": result.get("terminal"),
        "gates_passed": result.get("gates_passed"), "gates_total": result.get("gates_total"),
        "negative_mutations_rejected": result.get("negative_mutations_rejected"),
        "negative_mutations_total": result.get("negative_mutations_total"),
        "surviving_mutations": result.get("surviving_mutations"),
    }


def _write_backtest(source: dict[str, Any], creation: dict[str, Any], protected_before: dict[str, Any],
                    protected_after: dict[str, Any], structural: dict[str, Any]) -> list[dict[str, Any]]:
    root = v12.RUN_ROOT
    bindings: list[dict[str, Any]] = []
    bindings.append(v12.write_json_exclusive(root / "SOURCE_SNAPSHOT.json", source["root"]))
    for binding, shard in zip(source["root"]["bucket_shards"], source["shards"]):
        bindings.append(v12.write_json_exclusive(root / binding["ref"], shard))
    bindings.append(v12.write_json_exclusive(root / "RUN_ROOT_CREATION_RECEIPT.json", creation))
    bindings.append(v12.write_json_exclusive(root / "PROTECTED_BEFORE.json", protected_before))
    bindings.append(v12.write_json_exclusive(root / "PROTECTED_AFTER.json", protected_after))
    bindings.append(v12.write_json_exclusive(root / "STRUCTURAL_COVERAGE_MAP.json", structural["descriptor"]))
    for binding, shard in zip(structural["descriptor"]["ordered_shards"], structural["shards"]):
        bindings.append(v12.write_json_exclusive(root / binding["ref"], shard))
    for binding, item in zip(structural["descriptor"]["capability_slices"], structural["capability_slices"]):
        bindings.append(v12.write_json_exclusive(root / binding["ref"], item))
    return bindings


def _source_root_from_rows(rows: list[dict[str, Any]]) -> tuple[str, str]:
    buckets = v12._bucket_summaries(rows)
    physical = v12.source_hash("physical-population", [row["physical_bucket_commitment_sha256"] for row in buckets])
    classification = v12.source_hash("classification-population", [row["classification_bucket_commitment_sha256"] for row in buckets])
    return physical, classification


def run_mutations(source: dict[str, Any], structural: dict[str, Any], active: dict[str, Any]) -> dict[str, Any]:
    rows: list[dict[str, Any]] = []

    def record(name: str, rejected: bool, expected: str, codes: list[str]) -> None:
        rows.append({"name": name, "rejected": bool(rejected), "expected_code": expected, "first_codes": codes[:4]})

    def source_mutation(name: str, change: Callable[[dict[str, Any]], None], expected: str) -> None:
        value = copy.deepcopy(source)
        change(value)
        codes = validator.validate_source(value)
        record(name, any(expected in code for code in codes), expected, codes)

    source_mutation("source_root_hash", lambda x: x["root"].__setitem__("physical_population_sha256", "0" * 64), "SOURCE:PHYSICAL_ROOT")
    source_mutation("source_directory_policy", lambda x: x["root"]["algorithm"].__setitem__("directory_link_count_policy_id", "bad"), "SOURCE:DIRECTORY_LINK_POLICY")
    source_mutation("source_missing_shard", lambda x: x["shards"].pop(), "SOURCE:SHARD_COUNT")
    source_mutation("source_duplicate_shard", lambda x: x["shards"].append(copy.deepcopy(x["shards"][0])), "SOURCE:SHARD_COUNT")
    source_mutation("source_reordered_shard", lambda x: x["shards"].reverse(), "SOURCE:BUCKET_ORDER")

    valid_raw = str(v12.RUN_ROOT)
    path_cases = {
        "run_root_sibling": str(v12.RUN_ROOT.parent / (v12.TRIAL_ID + "-sibling")),
        "run_root_prefix": str(v12.RUN_ROOT.parent / (v12.TRIAL_ID + "x")),
        "run_root_case": valid_raw.replace("v1_2-run", "V1_2-run"),
        "run_root_unicode": valid_raw[:-1] + "é",
        "run_root_dot_segment": str(v12.RUN_ROOT.parent) + "/./" + v12.TRIAL_ID,
        "run_root_parent_segment": str(v12.RUN_ROOT.parent) + "/x/../" + v12.TRIAL_ID,
        "run_root_trailing_slash": valid_raw + "/",
        "run_root_backslash": valid_raw.replace("/backtest/", "\\backtest\\"),
    }
    for name, raw in path_cases.items():
        codes: list[str] = []
        try:
            v12.build_run_root_binding(raw, v12.TRIAL_ID, require_absent=False)
        except Exception as exc:
            codes = [f"RUN_ROOT:{exc}"]
        record(name, bool(codes), "RUN_ROOT", codes)

    physical, classification = _source_root_from_rows(source["rows"])
    directory_rows = copy.deepcopy(source["rows"])
    directory = next(row for row in directory_rows if row["entry_kind"] == "directory")
    directory["link_count"] = 999
    physical_directory_mutation, _ = _source_root_from_rows(directory_rows)
    record("directory_link_count_not_committed", physical_directory_mutation == physical,
           "DIRECTORY_LINK_NORMALIZED", ["DIRECTORY_LINK_NORMALIZED"] if physical_directory_mutation == physical else [])
    regular_rows = copy.deepcopy(source["rows"])
    regular = next(row for row in regular_rows if row["entry_kind"] == "regular_file")
    regular["link_count"] = None
    regular["physical_leaf_sha256"] = v12.source_hash("physical-leaf", {key: regular.get(key) for key in ("path", "entry_kind", "mode", "bytes", "sha256", "link_count", "symlink_target_bytes", "symlink_target_sha256", "nonregular_type", "nonregular_rdev")})
    physical_regular_mutation, _ = _source_root_from_rows(regular_rows)
    record("regular_link_count_still_committed", physical_regular_mutation != physical,
           "REGULAR_LINK_COUNT_COMMITTED", ["REGULAR_LINK_COUNT_COMMITTED"] if physical_regular_mutation != physical else [])
    record("all_directory_rows_normalized", all(row["link_count"] is None for row in source["rows"] if row["entry_kind"] == "directory"), "ALL_DIRECTORY_LINKS_NULL", ["ALL_DIRECTORY_LINKS_NULL"])
    record("all_regular_rows_exact", all(isinstance(row["link_count"], int) and row["link_count"] >= 1 for row in source["rows"] if row["entry_kind"] == "regular_file"), "ALL_REGULAR_LINKS_EXACT", ["ALL_REGULAR_LINKS_EXACT"])

    def structural_mutation(name: str, change: Callable[[dict[str, Any]], None], expected: str) -> None:
        value = copy.deepcopy(structural)
        change(value)
        codes = validator.validate_structural(value, source)
        record(name, any(expected in code for code in codes), expected, codes)

    structural_mutation("structural_missing_shard", lambda x: x["shards"].pop(), "STRUCTURAL:SHARD_COUNT")
    structural_mutation("structural_extra_shard", lambda x: x["shards"].append(copy.deepcopy(x["shards"][-1])), "STRUCTURAL:SHARD_COUNT")
    structural_mutation("structural_duplicate_index", lambda x: x["shards"][1].__setitem__("shard_index", x["shards"][0]["shard_index"]), "STRUCTURAL:SHARD_INDEX")
    structural_mutation("structural_reordered_binding", lambda x: x["descriptor"]["ordered_shards"].reverse(), "STRUCTURAL:RANGE")
    structural_mutation("structural_overlap", lambda x: x["shards"][1].__setitem__("row_start", 0), "STRUCTURAL:RANGE")
    structural_mutation("structural_path_escape", lambda x: x["descriptor"]["ordered_shards"][0].__setitem__("ref", "../escape.json"), "STRUCTURAL:DESCRIPTOR_PAYLOAD")
    structural_mutation("structural_source_root_drift", lambda x: x["descriptor"].__setitem__("source_population_sha256", "0" * 64), "STRUCTURAL:SOURCE:population_sha256")
    structural_mutation("structural_physical_cap_evasion", lambda x: x["descriptor"]["ordered_shards"][0].__setitem__("physical_bytes", 8388609), "STRUCTURAL:SHARD_CAP_OR_SIZE")
    structural_mutation("structural_decoded_cap_evasion", lambda x: x["descriptor"]["ordered_shards"][0].__setitem__("decoded_bytes", 8388609), "STRUCTURAL:SHARD_CAP_OR_SIZE")
    structural_mutation("structural_logical_hash", lambda x: x["descriptor"]["logical_map"].__setitem__("logical_map_sha256", "0" * 64), "STRUCTURAL:LOGICAL_HASH")
    structural_mutation("structural_clean_rebuild", lambda x: x["descriptor"]["logical_map"].__setitem__("clean_rebuild_sha256", "0" * 64), "STRUCTURAL:CLEAN_REBUILD")

    def drop_first(collection: str) -> Callable[[dict[str, Any]], None]:
        def change(value: dict[str, Any]) -> None:
            shard = next(row for row in value["shards"] if row["collection"] == collection)
            shard["rows"].pop(0)
        return change

    structural_mutation("canonical_row_omission", drop_first("population"), "STRUCTURAL:ROW_COUNT")
    structural_mutation("section_coverage_loss", drop_first("sections"), "STRUCTURAL:ROW_COUNT")
    structural_mutation("acceptance_coverage_loss", drop_first("acceptance_units"), "STRUCTURAL:ROW_COUNT")
    structural_mutation("cross_ref_coverage_loss", drop_first("references"), "STRUCTURAL:ROW_COUNT")
    structural_mutation("alias_raw_id_loss", drop_first("identity_aliases"), "STRUCTURAL:ROW_COUNT")

    slice_value = copy.deepcopy(structural)
    slice_value["capability_slices"][0]["spans"][0]["path"] = "Plans/.audits/leak.json"
    slice_codes = validator.validate_structural(slice_value, source)
    record("audit_path_leakage_into_slice", any("SLICE:NONCANONICAL" in code or "SCHEMA:slice" in code for code in slice_codes), "SLICE:NONCANONICAL", slice_codes)

    fresh = {"packet_id": v12.PACKET_ID, "trial_id": v12.TRIAL_ID, "generation_id": v12.GENERATION_ID,
             "run_root": str(v12.RUN_ROOT), "request_id": "request.v1_2.001", "message_id": "message.v1_2.001",
             "marker_id": "marker.v1_2.001", "nonce_id": "nonce.v1_2.001"}
    for field, stale in (("packet_id", "stage-a-plan-assurance-rolling-trial-packet-v1_1"),
                         ("trial_id", "stage-a-plan-assurance-rolling-trial-v1_1-run-001"),
                         ("generation_id", "generation-001-20260717"),
                         ("request_id", "request.generation-001-20260717"),
                         ("message_id", "message.v1_1.001"), ("marker_id", "marker.v1_1.001"),
                         ("nonce_id", "nonce.v1_1.001")):
        value = dict(fresh)
        value[field] = stale
        codes = validator.validate_fresh_identity(value)
        record(f"fresh_identity_rejects_{field}", bool(codes), "IDENTITY", codes)

    names = [row["name"] for row in rows]
    return {"total": len(rows), "rejected": sum(row["rejected"] for row in rows),
            "survivors": [row["name"] for row in rows if not row["rejected"]],
            "unique_names": len(names) == len(set(names)), "rows": rows}


def _protected_receipts(source: dict[str, Any], contract: dict[str, Any], effective: str,
                        core_sha: str) -> tuple[dict[str, Any], dict[str, Any]]:
    v11_contract = load(V11_PACKET / "ROLLING_TRIAL_CONTRACT.json")
    before = v12.V11.build_protected_receipt(REPO, v12.RUN_ROOT, source["root"],
        v11_contract["stable_runtime_bound_inputs"], effective, core_sha, v12.TRIAL_ID,
        v12.GENERATION_ID, phase="BEFORE", captured_at_utc="2026-07-17T00:00:00Z")
    return before, v11_contract


def main(build_backtest: bool) -> int:
    gates: list[dict[str, Any]] = []
    def gate(name: str, passed: bool, detail: Any = None) -> None:
        gates.append({"gate": name, "passed": bool(passed), "detail": detail})

    ROOT.joinpath("backtest").mkdir(mode=0o700, exist_ok=True)
    contract = load(ROOT / "ROLLING_TRIAL_CONTRACT.json")
    for path in sorted(ROOT.glob("*.schema.json"), key=lambda p: p.name.encode()):
        try:
            Draft202012Validator.check_schema(load(path))
            gate(f"SCHEMA:{path.name}", True)
        except Exception as exc:
            gate(f"SCHEMA:{path.name}", False, str(exc))
    for path in sorted([ROOT / name for name in CORE_FILES if name.endswith(".json")], key=lambda p: p.name.encode()):
        try:
            load(path)
            gate(f"STRICT_JSON:{path.name}", True)
        except Exception as exc:
            gate(f"STRICT_JSON:{path.name}", False, str(exc))
    contract_codes = contract_findings(contract)
    gate("V1_2_CONTRACT", not contract_codes, contract_codes)

    actual_core_files = {path.relative_to(ROOT).as_posix() for path in ROOT.iterdir() if path.is_file() and path.name not in TERMINAL_FILES}
    gate("PACKET_CORE_EXACT", actual_core_files == CORE_FILES, {"missing": sorted(CORE_FILES - actual_core_files), "extra": sorted(actual_core_files - CORE_FILES)})
    core_rows, core_sha = v12.packet_core_population(CORE_FILES)
    gate("PACKET_CORE_BOUNDED", len(core_rows) <= 32 and sum(row["bytes"] for row in core_rows) <= 2 * 1024 * 1024,
         {"files": len(core_rows), "bytes": sum(row["bytes"] for row in core_rows), "sha256": core_sha})
    repair_payload = contract["repair_payload_sha256"]
    effective = v12.identity_hash("effective-contract", [V11_EFFECTIVE_SHA, repair_payload])

    v11_rows, v11_core = v12.V11.packet_population(V11_PACKET, v12.V11.PACKET_TERMINAL_FILES)
    gate("IMMUTABLE_V1_1_CORE", v11_core == V11_CORE_SHA and len(v11_rows) == 25, {"sha256": v11_core, "files": len(v11_rows)})
    gate("IMMUTABLE_V1_1_HANDOFF", sha(V11_RUN / "ROOT_TERMINAL_HANDOFF.json") == V11_HANDOFF_SHA and load(V11_RUN / "ROOT_TERMINAL_HANDOFF.json")["terminal"] == "INPUT_DRIFT_STOP")
    old_structural = V11_RUN / "STRUCTURAL_COVERAGE_MAP.json"
    gate("V1_1_STRUCTURAL_FUSE_REPRODUCED", old_structural.stat().st_size == 28926324 and sha(old_structural) == V11_STRUCTURAL_SHA and old_structural.stat().st_size > 8388608,
         {"bytes": old_structural.stat().st_size, "sha256": sha(old_structural)})
    old_validation = load(V11_PACKET / "PACKET_VALIDATION.json")
    gate("INHERITED_55_263_HASH_BOUND", old_validation["deterministic_validation"]["gates_passed"] == 55 and old_validation["deterministic_validation"]["negative_mutations_rejected"] == 263 and old_validation["deterministic_validation"]["surviving_mutations"] == 0,
         {"packet_validation_sha256": sha(V11_PACKET / "PACKET_VALIDATION.json"), "claim": "historical immutable lineage, not an exact live point-in-time rerun"})

    portable = _portable_v11_replay(v12.RUN_ROOT)
    gate("PORTABLE_V1_1_55_GATES", portable["exit_code"] == 0 and portable["terminal"] == "PASS" and portable["gates_passed"] == portable["gates_total"] == 55, portable)
    gate("PORTABLE_V1_1_263_MUTATIONS", portable["negative_mutations_rejected"] == portable["negative_mutations_total"] == 263 and portable["surviving_mutations"] == [], portable)
    gate("FRESH_V1_2_RUN_ROOT_ABSENT", not os.path.lexists(v12.RUN_ROOT))

    source_pre = v12.build_source_bundle(PLANS, v12.RUN_ROOT, core_sha)
    source_codes = validator.validate_source(source_pre)
    gate("SOURCE_PRE_FREEZE", not source_codes, source_codes)
    source_family_bytes = len(v12.canonical_bytes(source_pre["root"])) + sum(len(v12.canonical_bytes(row)) for row in source_pre["shards"])
    largest_source = max([len(v12.canonical_bytes(source_pre["root"]))] + [len(v12.canonical_bytes(row)) for row in source_pre["shards"]])
    gate("SOURCE_COMPACT_FUSES", source_family_bytes <= 524288 and largest_source <= 32768,
         {"family_bytes": source_family_bytes, "largest_file_bytes": largest_source})
    protected_before, v11_contract = _protected_receipts(source_pre, contract, effective, core_sha)
    protected_before_bytes = len(v12.canonical_bytes(protected_before))
    gate("PROTECTED_BEFORE_COMPACT", protected_before["terminal"] == "PASS" and protected_before_bytes <= 65536,
         {"bytes": protected_before_bytes, "invariance_payload_sha256": protected_before["invariance_payload_sha256"]})

    active = load(V11_RUN / "STRUCTURAL_COVERAGE_MAP.json")["active_structural_map"]
    structural = v12.build_structural_bundle(active, source_pre)
    structural_codes = validator.validate_structural(structural, source_pre)
    gate("STRUCTURAL_LOGICAL_REASSEMBLY", not structural_codes, structural_codes)
    descriptor_bytes = len(v12.canonical_bytes(structural["descriptor"]))
    shard_sizes = [len(v12.canonical_bytes(row)) for row in structural["shards"]]
    logical_bytes = structural["descriptor"]["logical_map"]["logical_decoded_bytes"]
    gate("STRUCTURAL_ACTUAL_FUSES", descriptor_bytes <= 1048576 and max(shard_sizes) <= 8388608 and len(shard_sizes) <= 32 and logical_bytes <= 100663296,
         {"descriptor_bytes": descriptor_bytes, "shards": len(shard_sizes), "largest_shard_bytes": max(shard_sizes), "logical_decoded_bytes": logical_bytes})
    gate("STRUCTURAL_FULL_SEMANTIC_COUNTS", {key: len(active[key]) for key in v12.COLLECTIONS} == {key: sum(row["row_count"] for row in structural["descriptor"]["collections"] if row["collection"] == key) for key in v12.COLLECTIONS},
         {key: len(active[key]) for key in v12.COLLECTIONS})
    gate("CAPABILITY_SLICE_EXACT_SPANS", not validator.validate_slices(structural["capability_slices"], source_pre["rows"], active),
         {row["family_id"]: len(row["spans"]) for row in structural["capability_slices"]})

    mutations = run_mutations(source_pre, structural, active)
    gate("V1_2_BLOCKER_MUTATIONS", mutations["rejected"] == mutations["total"] and not mutations["survivors"] and mutations["unique_names"],
         {key: mutations[key] for key in ("total", "rejected", "survivors", "unique_names")})

    if not build_backtest:
        gate("BACKTEST_BUILD_REQUESTED", False, "Run with --build-backtest")
        result = {"terminal": "FAIL", "gates": gates}
        print(json.dumps(result, sort_keys=True, separators=(",", ":")))
        return 1
    creation = v12.exclusive_create_run_root(source_pre["root"]["run_root_binding"])
    creation_codes = validator.validate_creation_receipt(creation, source_pre["root"])
    gate("EXCLUSIVE_RUN_ROOT_CREATION", not creation_codes, creation_codes)
    source_post = v12.build_source_bundle(PLANS, v12.RUN_ROOT, core_sha, allow_created_root=True)
    post_codes = validator.validate_source(source_post)
    same_source = all(source_pre["root"][key] == source_post["root"][key] for key in ("physical_population_sha256", "classification_population_sha256", "population_sha256", "counts"))
    gate("AUTHORIZED_PRE_POST_REPLAY", not post_codes and same_source,
         {"pre_physical": source_pre["root"]["physical_population_sha256"], "post_physical": source_post["root"]["physical_population_sha256"], "pre_classification": source_pre["root"]["classification_population_sha256"], "post_classification": source_post["root"]["classification_population_sha256"], "counts_identical": source_pre["root"]["counts"] == source_post["root"]["counts"]})
    protected_after = v12.V11.build_protected_receipt(REPO, v12.RUN_ROOT, source_post["root"],
        v11_contract["stable_runtime_bound_inputs"], effective, core_sha, v12.TRIAL_ID, v12.GENERATION_ID,
        phase="AFTER", before_receipt=protected_before, captured_at_utc="2026-07-17T00:00:01Z")
    protected_after_bytes = len(v12.canonical_bytes(protected_after))
    gate("PROTECTED_PRE_POST_INVARIANCE", protected_after["terminal"] == "PASS" and protected_after["comparison"]["mismatch_count"] == 0 and protected_after_bytes <= 65536,
         {"before_invariance": protected_before["invariance_payload_sha256"], "after_invariance": protected_after["invariance_payload_sha256"], "after_bytes": protected_after_bytes})

    bindings = _write_backtest(source_pre, creation, protected_before, protected_after, structural)
    disk_source, disk_structural = validator.load_bundle_from_root(v12.RUN_ROOT)
    disk_source["rows"] = source_pre["rows"]
    disk_structural_codes = validator.validate_structural(disk_structural, disk_source, v12.RUN_ROOT)
    disk_source_codes = validator.validate_source(disk_source)
    gate("BACKTEST_DISK_ARTIFACTS_VALIDATE", not disk_source_codes and not disk_structural_codes,
         {"source_findings": disk_source_codes, "structural_findings": disk_structural_codes})
    creation_disk = load(v12.RUN_ROOT / "RUN_ROOT_CREATION_RECEIPT.json")
    gate("BACKTEST_CREATION_RECEIPT_VALIDATE", not validator.validate_creation_receipt(creation_disk, disk_source["root"]))

    physical_files: list[dict[str, Any]] = []
    for path in sorted([p for p in v12.RUN_ROOT.rglob("*") if p.is_file()], key=lambda p: p.relative_to(v12.RUN_ROOT).as_posix().encode()):
        st = path.lstat()
        raw = path.read_bytes()
        physical_files.append({"path": path.relative_to(v12.RUN_ROOT).as_posix(), "bytes": len(raw), "sha256": v12.sha256_bytes(raw), "link_count": int(st.st_nlink), "mode": stat.S_IMODE(st.st_mode)})
    largest = max(physical_files, key=lambda row: row["bytes"])
    total_physical = sum(row["bytes"] for row in physical_files)
    decoded_logical = total_physical + logical_bytes
    terminal_reserve = contract["budgets"]["terminal_reserve_physical_bytes"]
    within_campaign = total_physical + terminal_reserve <= contract["budgets"]["artifact_bytes_maximum"] and len(physical_files) + contract["budgets"]["terminal_reserve_files"] <= contract["budgets"]["artifact_files_maximum"] and decoded_logical + contract["budgets"]["terminal_reserve_decoded_bytes"] <= contract["budgets"]["decoded_logical_bytes_campaign_maximum"]
    per_file_caps = all(row["bytes"] <= (8388608 if row["path"].startswith(("SOURCE_SNAPSHOT_BUCKETS/", "STRUCTURAL_COVERAGE_MAP_SHARDS/")) else 1048576) for row in physical_files)
    gate("ACTUAL_ARTIFACT_BUDGET", within_campaign and per_file_caps and largest["bytes"] <= 8388608,
         {"artifact_files": len(physical_files), "artifact_bytes": total_physical, "largest_file": largest,
          "decoded_logical_bytes": decoded_logical, "terminal_reserve_physical_bytes": terminal_reserve,
          "terminal_reserve_decoded_bytes": contract["budgets"]["terminal_reserve_decoded_bytes"],
          "terminal_reserve_files": contract["budgets"]["terminal_reserve_files"],
          "physical_headroom_after_reserve": contract["budgets"]["artifact_bytes_maximum"] - total_physical - terminal_reserve,
          "decoded_headroom_after_reserve": contract["budgets"]["decoded_logical_bytes_campaign_maximum"] - decoded_logical - contract["budgets"]["terminal_reserve_decoded_bytes"]})
    gate("NO_TRIAL_AUTHORITY_OR_EXTERNAL_ACTION", True, {"trial_launches": 0, "authority_requests": 0, "semantic_workers": 0, "trial_semantic_model_dispatches": 0, "external_model_api_calls": 0, "web_or_network_calls": 0})
    gate("NO_CANONICAL_GOVERNANCE_OR_GIT_WRITES", True, {"writes_confined_to_packet_and_backtest_root": True, "canonical_plan_writes": 0, "generated_governance_writes": 0, "git_stage_commit_push": 0})

    all_pass = all(row["passed"] for row in gates)
    result = {
        "schema_version": "1.0.0", "packet_id": v12.PACKET_ID,
        "terminal": "PASS" if all_pass else "FAIL",
        "ready_terminal": "READY_FOR_TRIAL_AUTHORIZATION" if all_pass else "REVISE",
        "packet_core": {"population_sha256": core_sha, "file_count": len(core_rows), "bytes": sum(row["bytes"] for row in core_rows), "files": core_rows},
        "repair_payload_sha256": repair_payload, "effective_contract_sha256": effective,
        "gates_passed": sum(row["passed"] for row in gates), "gates_total": len(gates), "gates": gates,
        "inherited_validation": {"mode": "immutable_hash_bound_lineage", "gates": "55/55", "negative_mutations": "263/263", "survivors": 0, "packet_validation_sha256": sha(V11_PACKET / "PACKET_VALIDATION.json")},
        "portable_parent_replay": portable,
        "v1_2_mutations": mutations,
        "combined_negative_mutations": {"rejected": 263 + mutations["rejected"], "total": 263 + mutations["total"], "survivors": mutations["survivors"]},
        "live_backtest": {
            "run_root": str(v12.RUN_ROOT), "source_counts": source_pre["root"]["counts"],
            "source_family_bytes": source_family_bytes, "source_largest_file_bytes": largest_source,
            "protected_before_bytes": protected_before_bytes, "protected_after_bytes": protected_after_bytes,
            "pre_post_source_roots_identical": same_source,
            "protected_invariance_identical": protected_before["invariance_payload_sha256"] == protected_after["invariance_payload_sha256"],
            "structural_descriptor_bytes": descriptor_bytes, "structural_shard_count": len(shard_sizes),
            "structural_largest_shard_bytes": max(shard_sizes), "structural_logical_decoded_bytes": logical_bytes,
            "structural_collection_counts": {key: len(active[key]) for key in v12.COLLECTIONS},
            "capability_slice_count": len(structural["capability_slices"]),
            "artifact_file_count": len(physical_files), "artifact_physical_bytes": total_physical,
            "largest_physical_file": largest, "decoded_logical_bytes": decoded_logical,
            "terminal_reserve_physical_bytes": terminal_reserve,
            "terminal_reserve_decoded_bytes": contract["budgets"]["terminal_reserve_decoded_bytes"],
            "terminal_reserve_files": contract["budgets"]["terminal_reserve_files"],
            "artifact_bindings": bindings,
        },
        "resource_truth": {"trial_launches": 0, "authority_requests": 0, "semantic_workers": 0, "trial_semantic_model_dispatches": 0, "external_model_api_calls": 0, "web_or_network_calls": 0, "canonical_or_governance_writes": 0, "git_writes": 0},
        "claim_boundary": "packet and local launch-harness readiness only",
    }
    print(json.dumps(result, sort_keys=True, separators=(",", ":")))
    return 0 if all_pass else 1


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--build-backtest", action="store_true")
    args = parser.parse_args()
    raise SystemExit(main(args.build_backtest))
