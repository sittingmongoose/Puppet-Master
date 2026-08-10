#!/usr/bin/env python3
"""Local-only packet and live-corpus backtest for rolling-trial v1.1."""

from __future__ import annotations

import copy
import importlib.util
import inspect
import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Any, Callable

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[2]
PLANS = REPO / "Plans"
BASE = ROOT.parent / "stage-a-plan-assurance-rolling-trial-packet-v1"
V1_RUN = ROOT.parent / "stage-a-plan-assurance-rolling-trial-v1-run-001"
FUTURE_RUN = ROOT.parent / "stage-a-plan-assurance-rolling-trial-v1_1-run-001"

sys.path.insert(0, str(ROOT))
import compact_receipts as compact  # noqa: E402
import validate_trial_artifacts as v11  # noqa: E402

TERMINAL_FILES = compact.PACKET_TERMINAL_FILES
CORE_FILES = compact.PACKET_CORE_FILES


def _load_module(path: Path, name: str) -> Any:
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None: raise RuntimeError(f"IMPORT:{path}")
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module); return module


BASE_VALIDATOR = _load_module(BASE / "validate_trial_artifacts.py", "base_artifact_validator_packet")


def sha(path: Path) -> str:
    return compact.sha256_bytes(path.read_bytes())


def load(path: Path) -> Any:
    return compact.strict_json_loads(path.read_text(encoding="utf-8"))


def contract_findings(contract: dict[str, Any]) -> list[str]:
    findings: list[str] = []
    if contract.get("packet_id") != compact.PACKET_ID: findings.append("CONTRACT:PACKET_ID")
    if contract.get("base_packet", {}).get("contract_sha256") != "e034bbd8531f793490a6098261e94845cadf4ec632df63f7d3377f762c728c9a": findings.append("CONTRACT:BASE")
    if contract.get("v1_stop_lineage", {}).get("terminal") != "BUDGET_STOP" or contract.get("v1_stop_lineage", {}).get("reason_code") != "PREFLIGHT_ARTIFACT_FUSE" or contract.get("v1_stop_lineage", {}).get("relabel_forbidden") is not True: findings.append("CONTRACT:V1_STOP")
    auth = contract.get("authority", {})
    if any(auth.get(key) is not False for key in ("trial_launch_authorized", "external_research_authorized_by_this_packet", "model_or_api_calls_authorized_by_this_packet", "canonical_plan_writes_authorized", "generated_or_governance_writes_authorized", "git_write_authorized")): findings.append("CONTRACT:AUTHORITY")
    if auth.get("launch_commands") != []: findings.append("CONTRACT:LAUNCH_COMMAND")
    source = contract.get("representation_contract", {}).get("source_snapshot", {})
    if source.get("rows_persisted") is not False or source.get("stable_double_scan_required") is not True or source.get("bucket_count") != 256 or source.get("receipt_shards") != 16: findings.append("CONTRACT:SOURCE_REPRESENTATION")
    protected = contract.get("representation_contract", {}).get("protected_state", {})
    if protected.get("raw_or_base64_git_bytes_forbidden") is not True or protected.get("source_rows_duplicated") is not False: findings.append("CONTRACT:PROTECTED_REPRESENTATION")
    identity = contract.get("representation_contract", {}).get("identity", {})
    if identity.get("artifact_kind_domain_separation_required") is not True or identity.get("duplicate_keys_after_nfc_rejected") is not True or identity.get("nfc_path_collisions_rejected") is not True: findings.append("CONTRACT:IDENTITY")
    if contract.get("semantic_isolation_contract", {}).get("fork_turns") != "none" or contract.get("semantic_isolation_contract", {}).get("worker_repo_reads_authorized") is not False or contract.get("semantic_isolation_contract", {}).get("worker_writes_authorized") is not False: findings.append("CONTRACT:ISOLATION")
    semantics = contract.get("preserved_method_semantics", {})
    if semantics.get("inherited_worker_role_ids") != ["LOCAL_EXPECTATION_MODELER", "OPEN_DISCOVERY_RESEARCHER", "FAILURE_EVIDENCE_RESEARCHER", "CROSS_FAMILY_CHALLENGER"] or "EXPECTATION_PACKET" not in semantics.get("base_dispatch_initial_view", "") or "withheld" not in semantics.get("base_dispatch_initial_view", ""):
        findings.append("CONTRACT:INITIAL_VIEW")
    if len(contract.get("prelaunch_sequence", [])) != 10: findings.append("CONTRACT:SEQUENCE")
    authority_contract = contract.get("authority_contract", {})
    if authority_contract.get("trusted_capability_location") != "AUTHORITY/TRUSTED_LAUNCH_CAPABILITY.json beneath the sole run root": findings.append("CONTRACT:CAPABILITY_LOCATION")
    if authority_contract.get("platform_observed_current_time_required") is not True or "O_CREAT|O_EXCL" not in authority_contract.get("single_use_marker_creation", ""):
        findings.append("CONTRACT:LIVE_AUTHORITY_PROOF")
    required_live_entrypoint = "validate_live_launch_chain followed by validate_immediate_predispatch_freshness; omission or mismatch of expected context, live sender metadata, initial platform-observed time, exact packet/repository/run roots, live packet core, live-rebuilt canonical source index, live-rebuilt current protected receipt, budget contract, predispatch inventory, exact root control files, post-validation platform time, or immediate dispatch-boundary time fails closed"
    if authority_contract.get("required_live_validation_entrypoint") != required_live_entrypoint:
        findings.append("CONTRACT:LIVE_ENTRYPOINT")
    if (authority_contract.get("launch_authority_location") != "AUTHORITY/LAUNCH_AUTHORITY.json beneath the sole run root" or
            authority_contract.get("packet_core_live_replay_required") is not True or
            authority_contract.get("current_protected_live_rebuild_required") is not True or
            authority_contract.get("predispatch_freshness_receipt_location") != "PREDISPATCH_FRESHNESS_RECEIPT.json beneath the sole run root and charged to the predeclared reserve" or
            authority_contract.get("predispatch_freshness_maximum_seconds") != 2 or
            authority_contract.get("predispatch_freshness_claim") != "platform-observed immediate dispatch boundary only; it does not claim that the external action occurred" or
            len(authority_contract.get("root_control_file_identity_required", [])) != 10 or
            not authority_contract.get("predispatch_fuse_enforcement", "").startswith("root-backed typed ARTIFACT_BUDGET_MANIFEST") or
            not authority_contract.get("incremental_and_terminal_fuse_enforcement", "").startswith("controller revalidates budgets")):
        findings.append("CONTRACT:LIVE_PREDISPATCH_BOUNDARY")
    schema_map = contract.get("schemas", {})
    for key, value in {"canary_registry": "CANARY_REGISTRY.schema.json", "expectation_packet": "EXPECTATION_PACKET.schema.json", "capability_slice_manifest": "CAPABILITY_SLICE_MANIFEST.schema.json", "launch_authority_used": "LAUNCH_AUTHORITY_USED.schema.json", "predispatch_freshness_receipt": "PREDISPATCH_FRESHNESS_RECEIPT.schema.json"}.items():
        if schema_map.get(key) != value: findings.append(f"CONTRACT:SCHEMA:{key}")
    budgets = contract.get("budgets", {}).get("campaign", {})
    exact = {"ordinary_physical_file_bytes_maximum": 1048576, "shard_physical_bytes_maximum": 8388608, "shard_decoded_bytes_maximum": 8388608, "logical_artifact_decoded_bytes_maximum": 100663296, "shards_per_logical_artifact_maximum": 32, "shard_files_campaign_maximum": 128, "artifact_files_maximum": 640, "artifact_bytes_maximum": 201326592, "decoded_logical_bytes_campaign_maximum": 268435456, "terminal_reserve_physical_bytes": 4194304, "terminal_reserve_decoded_bytes": 4194304, "terminal_reserve_files": 8}
    for key, value in exact.items():
        if budgets.get(key) != value: findings.append(f"CONTRACT:BUDGET:{key}")
    payload = copy.deepcopy(contract); recorded = payload.pop("repair_payload_sha256", None)
    if recorded != compact.identity_hash("rolling-trial-contract-repair", payload): findings.append("CONTRACT:REPAIR_PAYLOAD")
    return findings


def packet_core() -> tuple[list[dict[str, Any]], str]:
    return compact.packet_population(ROOT, TERMINAL_FILES)


def terminal_receipt_findings(core_rows: list[dict[str, Any]], core_sha: str, contract: dict[str, Any],
                              effective_contract: str, expected_gates: int, expected_mutations: int,
                              current_backtest: dict[str, Any]) -> list[str]:
    findings: list[str] = []
    validation_path = ROOT / "PACKET_VALIDATION.json"; decision_path = ROOT / "V1_1_REPAIR_DECISION.json"
    try: validation = load(validation_path)
    except Exception as exc: return [f"TERMINAL:PACKET_VALIDATION:{type(exc).__name__}"]
    core = validation.get("packet_core", {}); contracts = validation.get("contracts", {}); deterministic = validation.get("deterministic_validation", {})
    if validation.get("packet_id") != compact.PACKET_ID or core != {"population_sha256": core_sha, "file_count": len(core_rows), "bytes": sum(row["bytes"] for row in core_rows)}:
        findings.append("TERMINAL:PACKET_CORE")
    if contracts != {"base_v1_contract_sha256": contract["base_packet"]["contract_sha256"], "repair_payload_sha256": contract["repair_payload_sha256"], "effective_contract_sha256": effective_contract}:
        findings.append("TERMINAL:CONTRACTS")
    if deterministic.get("terminal") != "PASS" or deterministic.get("gates_passed") != expected_gates or deterministic.get("gates_total") != expected_gates or deterministic.get("negative_mutations_rejected") != expected_mutations or deterministic.get("negative_mutations_total") != expected_mutations or deterministic.get("surviving_mutations") != 0:
        findings.append("TERMINAL:VALIDATION_COUNTS")
    if validation.get("terminal") != "PASS" or validation.get("ready_terminal") != "READY_FOR_TRIAL_AUTHORIZATION" or any(validation.get("resource_use", {}).get(key) != 0 for key in ("trial_launches", "semantic_workers", "model_calls", "network_calls")):
        findings.append("TERMINAL:READINESS_OR_RESOURCE")
    stop = validation.get("v1_stop", {})
    if stop.get("terminal") != "BUDGET_STOP" or stop.get("reason_code") != "PREFLIGHT_ARTIFACT_FUSE" or stop.get("relabelled") is not False:
        findings.append("TERMINAL:V1_STOP")
    # current_live_backtest is explicitly observational: terminal receipt
    # writes live beneath Plans/.audits and therefore change the next physical
    # snapshot. The validator reruns the live backtest every time, but does not
    # create an impossible self-hash by freezing that observation here.
    if validation.get("current_live_backtest", {}).get("terminal") != "PASS": findings.append("TERMINAL:BACKTEST_TERMINAL")
    try: decision = load(decision_path)
    except Exception as exc: findings.append(f"TERMINAL:REPAIR_DECISION:{type(exc).__name__}"); decision = {}
    if decision.get("packet_id") != compact.PACKET_ID or decision.get("packet_core_population_sha256") != core_sha or decision.get("effective_contract_sha256") != effective_contract or decision.get("v1_stop_preserved") is not True or decision.get("trial_authorized") is not False or decision.get("packet_validation_terminal") != "PASS" or decision.get("terminal") != "READY_FOR_TRIAL_AUTHORIZATION":
        findings.append("TERMINAL:REPAIR_DECISION_BINDING")
    controller_path = ROOT / "CONTROLLER_DECISION.json"
    if controller_path.exists():
        try: controller = load(controller_path)
        except Exception as exc: findings.append(f"TERMINAL:CONTROLLER_DECISION:{type(exc).__name__}"); controller = {}
        if controller.get("packet_core_population_sha256") != core_sha or controller.get("effective_contract_sha256") != effective_contract or controller.get("packet_validation_sha256") != sha(validation_path) or controller.get("terminal") != "READY_FOR_TRIAL_AUTHORIZATION":
            findings.append("TERMINAL:CONTROLLER_DECISION_BINDING")
    handoff_path = ROOT / "ROOT_TERMINAL_HANDOFF.json"
    if handoff_path.exists():
        try: handoff = load(handoff_path)
        except Exception as exc: findings.append(f"TERMINAL:ROOT_HANDOFF:{type(exc).__name__}"); handoff = {}
        if handoff.get("packet_core_population_sha256") != core_sha or handoff.get("effective_contract_sha256") != effective_contract or handoff.get("packet_validation_sha256") != sha(validation_path) or handoff.get("terminal") != "READY_FOR_TRIAL_AUTHORIZATION":
            findings.append("TERMINAL:ROOT_HANDOFF_BINDING")
        report_path = ROOT / "FINAL_REPORT.md"
        if not report_path.is_file() or handoff.get("final_report_sha256") != sha(report_path): findings.append("TERMINAL:FINAL_REPORT_BINDING")
    return findings


def run_base_packet() -> dict[str, Any]:
    result = subprocess.run([sys.executable, "-B", str(BASE / "validate_packet.py")], cwd=REPO,
                            stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
    parsed = json.loads(result.stdout.decode("utf-8")) if result.stdout else {}
    frozen = load(BASE / "PACKET_VALIDATION.json")
    deterministic = frozen.get("deterministic_validation", {})
    live_core_population_sha256 = compact.sha256_bytes(BASE_VALIDATOR.canonical_bytes(parsed.get("core_artifacts", [])))
    return {"exit_code": result.returncode, "stdout_sha256": compact.sha256_bytes(result.stdout),
            "stderr_bytes": len(result.stderr), "terminal": parsed.get("terminal"),
            "checks": f"{parsed.get('checks_passed')}/{parsed.get('check_count')}",
            "packet_gates": f"{deterministic.get('packet_gates_passed')}/{deterministic.get('packet_gates_total')}",
            "positive_fixtures": f"{deterministic.get('positive_fixtures_passed')}/{deterministic.get('positive_fixtures_total')}",
            "negative_mutations": f"{deterministic.get('negative_mutations_rejected')}/{deterministic.get('negative_mutations_total')}",
            "surviving_mutations": deterministic.get("surviving_mutations"),
            "live_core_population_sha256": live_core_population_sha256,
            "frozen_validation_sha256": sha(BASE / "PACKET_VALIDATION.json")}


def historical_v1_replay() -> dict[str, Any]:
    rows = BASE_VALIDATOR.inventory_source_root(PLANS, V1_RUN)
    prefix = "Plans/.audits/stage-a-plan-assurance-rolling-trial-packet-v1_1"
    rows = [row for row in rows if not (row["path"] == prefix or row["path"].startswith(prefix + "/"))]
    return {"entry_count": len(rows), "regular_file_count": sum(row["entry_kind"] == "regular_file" for row in rows),
            "directory_entry_count": sum(row["entry_kind"] == "directory" for row in rows),
            "population_sha256": BASE_VALIDATOR.snapshot_population_hash(rows)}


def mutate_source(root: dict[str, Any], shards: list[dict[str, Any]], expected_core_sha256: str) -> dict[str, Any]:
    results: list[dict[str, Any]] = []
    def run(name: str, change: Callable[[dict[str, Any], list[dict[str, Any]]], None]) -> None:
        a = copy.deepcopy(root); b = copy.deepcopy(shards); change(a, b)
        codes = v11.validate_source_bundle(a, b, expected_packet_core_sha256=expected_core_sha256)
        results.append({"name": name, "rejected": bool(codes), "first_code": codes[0] if codes else None})
    for index in range(16):
        run(f"SHARD_PAYLOAD_{index:02d}", lambda a, b, i=index: b[i].__setitem__("payload_sha256", "0" * 64))
        run(f"SHARD_FILE_BINDING_{index:02d}", lambda a, b, i=index: a["bucket_shards"][i].__setitem__("file_sha256", "0" * 64))
        run(f"PHYSICAL_MERKLE_{index:02d}", lambda a, b, i=index: b[i]["buckets"][0].__setitem__("physical_merkle_root_sha256", "0" * 64))
        run(f"CLASSIFICATION_MERKLE_{index:02d}", lambda a, b, i=index: b[i]["buckets"][0].__setitem__("classification_merkle_root_sha256", "0" * 64))
    root_changes: list[tuple[str, Callable[[dict[str, Any], list[dict[str, Any]]], None]]] = [
        ("PACKET_ID", lambda a,b: a.__setitem__("packet_id", "stage-a-plan-assurance-rolling-trial-packet-v1")),
        ("ALGORITHM", lambda a,b: a["algorithm"].__setitem__("algorithm_id", "drift")),
        ("SNAPSHOT_ID", lambda a,b: a.__setitem__("snapshot_id", "0"*64)),
        ("PHYSICAL_POPULATION", lambda a,b: a.__setitem__("physical_population_sha256", "0"*64)),
        ("CLASSIFICATION_POPULATION", lambda a,b: a.__setitem__("classification_population_sha256", "0"*64)),
        ("POPULATION", lambda a,b: a.__setitem__("population_sha256", "0"*64)),
        ("CLASSIFIER_POLICY", lambda a,b: a["classifier_binding"].__setitem__("rule_bundle_sha256", "0"*64)),
        ("CLASSIFIER_BINDING", lambda a,b: a["classifier_binding"].__setitem__("classifier_binding_sha256", "0"*64)),
        ("COUNT_ADD", lambda a,b: a["counts"].__setitem__("entry_count", a["counts"]["entry_count"]+1)),
        ("COUNT_REMOVE", lambda a,b: a["counts"].__setitem__("regular_file_count", a["counts"]["regular_file_count"]-1)),
        ("UNKNOWN_COUNT", lambda a,b: a["counts"].__setitem__("unknown_classification_count", 1)),
        ("DOUBLE_SCAN", lambda a,b: a["stable_double_scan"].__setitem__("identical", False)),
        ("SHARD_REMOVE", lambda a,b: b.pop()),
        ("SHARD_ADD", lambda a,b: b.append(copy.deepcopy(b[-1]))),
        ("SHARD_RENAME", lambda a,b: a["bucket_shards"][0].__setitem__("ref", "SOURCE_SNAPSHOT_BUCKETS/renamed.json")),
        ("BUCKET_REORDER", lambda a,b: b[0]["buckets"].reverse()),
        ("BUCKET_ENTRY_COUNT", lambda a,b: b[0]["buckets"][0].__setitem__("entry_count", b[0]["buckets"][0]["entry_count"]+1)),
        ("ROOT_PAYLOAD", lambda a,b: a.__setitem__("snapshot_payload_sha256", "0"*64)),
        ("SYMLINK_TERMINAL", lambda a,b: a.__setitem__("terminal", "BLOCKED")),
        ("CORE_BINDING", lambda a,b: a.__setitem__("packet_core_population_sha256", "0"*64)),
        ("INVALID_DATE", lambda a,b: a.__setitem__("created_at_utc", "not-a-date")),
    ]
    for name, change in root_changes: run(name, change)
    return {"total": len(results), "rejected": sum(row["rejected"] for row in results),
            "survivors": [row["name"] for row in results if not row["rejected"]], "rows": results}


def contract_mutations(contract: dict[str, Any]) -> dict[str, Any]:
    changes: list[tuple[str, Callable[[dict[str, Any]], None]]] = [
        ("TRIAL_AUTHORITY", lambda x: x["authority"].__setitem__("trial_launch_authorized", True)),
        ("MODEL_AUTHORITY", lambda x: x["authority"].__setitem__("model_or_api_calls_authorized_by_this_packet", True)),
        ("CANONICAL_WRITE", lambda x: x["authority"].__setitem__("canonical_plan_writes_authorized", True)),
        ("GIT_WRITE", lambda x: x["authority"].__setitem__("git_write_authorized", True)),
        ("LAUNCH_COMMAND", lambda x: x["authority"].__setitem__("launch_commands", ["forbidden"])),
        ("V1_RELABEL", lambda x: x["v1_stop_lineage"].__setitem__("relabel_forbidden", False)),
        ("RAW_PROTECTED", lambda x: x["representation_contract"]["protected_state"].__setitem__("raw_or_base64_git_bytes_forbidden", False)),
        ("SOURCE_ROWS", lambda x: x["representation_contract"]["source_snapshot"].__setitem__("rows_persisted", True)),
        ("NO_DOUBLE_SCAN", lambda x: x["representation_contract"]["source_snapshot"].__setitem__("stable_double_scan_required", False)),
        ("NO_KIND_DOMAIN", lambda x: x["representation_contract"]["identity"].__setitem__("artifact_kind_domain_separation_required", False)),
        ("NFC_COLLAPSE", lambda x: x["representation_contract"]["identity"].__setitem__("duplicate_keys_after_nfc_rejected", False)),
        ("FORK_HISTORY", lambda x: x["semantic_isolation_contract"].__setitem__("fork_turns", "all")),
        ("REPO_READ", lambda x: x["semantic_isolation_contract"].__setitem__("worker_repo_reads_authorized", True)),
        ("WORKER_WRITE", lambda x: x["semantic_isolation_contract"].__setitem__("worker_writes_authorized", True)),
        ("AUTHORITY_OUTSIDE_ROOT", lambda x: x["authority_contract"].__setitem__("trusted_capability_location", "outside")),
        ("INITIAL_VIEW_LEAKAGE", lambda x: x["preserved_method_semantics"].__setitem__("base_dispatch_initial_view", "capability slices visible")),
        ("NO_PLATFORM_TIME", lambda x: x["authority_contract"].__setitem__("platform_observed_current_time_required", False)),
        ("NO_EXCLUSIVE_MARKER", lambda x: x["authority_contract"].__setitem__("single_use_marker_creation", "ordinary write")),
        ("LIVE_ENTRYPOINT_OMITTED", lambda x: x["authority_contract"].pop("required_live_validation_entrypoint")),
        ("NO_POST_VALIDATION_FRESHNESS", lambda x: x["authority_contract"].pop("predispatch_freshness_receipt_location")),
        ("SLOW_POST_VALIDATION_FRESHNESS", lambda x: x["authority_contract"].__setitem__("predispatch_freshness_maximum_seconds", 60)),
        ("FALSE_ACTION_OCCURRENCE_CLAIM", lambda x: x["authority_contract"].__setitem__("predispatch_freshness_claim", "external action occurred")),
        ("NO_LIVE_PACKET_CORE", lambda x: x["authority_contract"].__setitem__("packet_core_live_replay_required", False)),
        ("NO_LIVE_PROTECTED_CURRENT", lambda x: x["authority_contract"].__setitem__("current_protected_live_rebuild_required", False)),
        ("NO_ROOT_CONTROL_IDENTITY", lambda x: x["authority_contract"].__setitem__("root_control_file_identity_required", [])),
        ("NO_PREDISPATCH_FUSE", lambda x: x["authority_contract"].__setitem__("predispatch_fuse_enforcement", "none")),
        ("NO_INCREMENTAL_FUSE", lambda x: x["authority_contract"].__setitem__("incremental_and_terminal_fuse_enforcement", "none")),
        ("EXPECTATION_SCHEMA_DRIFT", lambda x: x["schemas"].__setitem__("expectation_packet", "wrong.json")),
        ("FILE_CAP_PLUS_ONE", lambda x: x["budgets"]["campaign"].__setitem__("artifact_files_maximum", 641)),
        ("PHYSICAL_CAP_PLUS_ONE", lambda x: x["budgets"]["campaign"].__setitem__("artifact_bytes_maximum", 201326593)),
        ("DECODED_CAP_PLUS_ONE", lambda x: x["budgets"]["campaign"].__setitem__("decoded_logical_bytes_campaign_maximum", 268435457)),
        ("REPAIR_HASH", lambda x: x.__setitem__("repair_payload_sha256", "0"*64)),
        ("PACKET_ID", lambda x: x.__setitem__("packet_id", "v1")),
    ]
    rows = []
    for name, change in changes:
        value = copy.deepcopy(contract); change(value); codes = contract_findings(value); rows.append({"name": name, "rejected": bool(codes), "first_code": codes[0] if codes else None})
    return {"total": len(rows), "rejected": sum(row["rejected"] for row in rows), "survivors": [row["name"] for row in rows if not row["rejected"]], "rows": rows}


def protected_mutations(protected: dict[str, Any], source: dict[str, Any], effective_contract: str) -> dict[str, Any]:
    rows: list[dict[str, Any]] = []
    def run(name: str, change: Callable[[dict[str, Any]], None], refresh_outer: bool = True) -> None:
        value = copy.deepcopy(protected); change(value)
        if refresh_outer:
            value["receipt_payload_sha256"] = v11.payload_hash("protected-state-receipt", value, "receipt_payload_sha256")
        codes = v11.validate_protected_state(value, source, effective_contract)
        rows.append({"name": name, "rejected": bool(codes), "first_code": codes[0] if codes else None})
    run("PACKET_ID", lambda x: x.__setitem__("packet_id", "v1"))
    run("EFFECTIVE_CONTRACT", lambda x: x.__setitem__("effective_contract_sha256", "0"*64))
    run("SOURCE_RECEIPT", lambda x: x.__setitem__("source_snapshot_sha256", "0"*64))
    run("SOURCE_POPULATION", lambda x: x.__setitem__("source_snapshot_population_sha256", "0"*64))
    run("PLANS_POPULATION", lambda x: x["protected_populations"]["plans_excluding_run_root"].__setitem__("population_sha256", "0"*64))
    run("GIT_COMMAND_CONTRACT", lambda x: x["collector"].__setitem__("command_contract_sha256", "0"*64))
    def outside_root(x: dict[str, Any]) -> None:
        ex = x["exclusion_contract"]; ex["repo_relative_run_root"] = "outside"; ex["authorized_run_root"] = str(REPO / "outside"); ex.pop("exclusion_contract_sha256", None); ex["exclusion_contract_sha256"] = compact.identity_hash("run-root-exclusion", ex)
    run("RUN_ROOT_OUTSIDE_AUDIT", outside_root)
    run("RUN_ROOT_EXISTS_BEFORE", lambda x: x["run_root_observation"].__setitem__("exists", True))
    run("BEFORE_COMPARISON", lambda x: x.__setitem__("comparison", {"terminal": "PASS"}))
    run("INVARIANCE_HASH", lambda x: x.__setitem__("invariance_payload_sha256", "0"*64))
    run("BOUND_INPUT_HASH", lambda x: x["protected_populations"]["bound_inputs"]["entries"][0].__setitem__("sha256", "0"*64))
    run("BOUND_INPUT_COUNT", lambda x: x["protected_populations"]["bound_inputs"].__setitem__("entry_count", 999))
    run("GIT_STATUS_LENGTH", lambda x: x["git_state"]["status"]["raw_porcelain_v2_z"].__setitem__("bytes", x["git_state"]["status"]["raw_porcelain_v2_z"]["bytes"]+1), False)
    run("GIT_STATUS_HASH", lambda x: x["git_state"]["status"]["raw_porcelain_v2_z"].__setitem__("sha256", "0"*64), False)
    run("DIRTY_NORMALIZATION_HASH", lambda x: x["git_state"]["status"]["normalized"].__setitem__("sha256", "0"*64))
    run("DIRTY_CLASS_LENGTH", lambda x: x["git_state"]["status"]["classifications"]["tracked_worktree"].__setitem__("encoded_bytes", x["git_state"]["status"]["classifications"]["tracked_worktree"]["encoded_bytes"]+1))
    run("INDEX_HASH", lambda x: x["git_state"]["index"]["logical_stage_entries_z"].__setitem__("sha256", "0"*64))
    run("TRACKED_DIFF_LENGTH", lambda x: x["git_state"]["diffs"]["worktree_vs_index"].__setitem__("bytes", x["git_state"]["diffs"]["worktree_vs_index"]["bytes"]+1))
    run("RAW_BASE64_FIELD", lambda x: x.__setitem__("data", "AA=="), False)
    run("INVALID_DATE", lambda x: x.__setitem__("captured_at_utc", "not-a-date"))
    return {"total": len(rows), "rejected": sum(row["rejected"] for row in rows), "survivors": [row["name"] for row in rows if not row["rejected"]], "rows": rows}


def _minimal_budget_manifest() -> dict[str, Any]:
    digest = "0" * 64
    baseline = {"schema_version": "1.1.0", "packet_id": compact.PACKET_ID,
                "inventory_scope": "all existing run-root regular files except this manifest plus exact later terminal-reserve paths", "manifest_path": "ARTIFACT_BUDGET_MANIFEST.json", "reserved_terminal_paths": ["PROTECTED_AFTER.json", "TRIAL_SUMMARY.json"], "inventory_population_sha256": digest,
                "physical_files": [{"path": "ARTIFACTS/a.json", "kind": "regular_file", "mode": 420, "link_count": 1, "physical_bytes": 10, "physical_sha256": digest, "owner_scope": "shared", "logical_artifact_id": "artifact.a"}],
                "logical_artifacts": [{"logical_artifact_id": "artifact.a", "artifact_kind": "ordinary", "members": [{"ordinal": 0, "path": "ARTIFACTS/a.json", "encoding": "identity", "physical_bytes": 10, "physical_sha256": digest, "decoded_bytes": 10, "decoded_sha256": digest}], "decoded_bytes": 10, "logical_sha256": digest, "compression_expansion_ratio_maximum": 64}],
                "totals": {"physical_files": 2, "physical_bytes": 110, "manifest_physical_bytes": 100, "decoded_logical_bytes": 110, "shard_files": 0},
                "terminal_reserve": {"physical_bytes": 4194304, "decoded_bytes": 4194304, "files": 8, "preserved": True}, "terminal": "WITHIN_FUSE"}
    baseline["inventory_population_sha256"] = compact.identity_hash("budget-physical-population", [
        [row.get(key) for key in ("path", "kind", "mode", "link_count", "physical_bytes", "physical_sha256")]
        for row in sorted(baseline["physical_files"], key=lambda item: item["path"].encode("utf-8"))
    ])
    baseline["manifest_payload_sha256"] = v11.payload_hash("artifact-budget-manifest", baseline, "manifest_payload_sha256")
    return baseline


def budget_mutations(budgets: dict[str, Any]) -> dict[str, Any]:
    digest = "0" * 64
    baseline = _minimal_budget_manifest()
    rows = []
    def run(name: str, change: Callable[[dict[str, Any]], None]) -> None:
        value = copy.deepcopy(baseline); change(value); value["manifest_payload_sha256"] = v11.payload_hash("artifact-budget-manifest", value, "manifest_payload_sha256")
        codes = v11.validate_budget_manifest(value, budgets=budgets); rows.append({"name": name, "rejected": bool(codes), "first_code": codes[0] if codes else None})
    run("FILE_CAP_PLUS_ONE", lambda x: x["totals"].__setitem__("physical_files", 641))
    run("PHYSICAL_CAP_PLUS_ONE", lambda x: x["totals"].__setitem__("physical_bytes", 201326593))
    run("DECODED_CAP_PLUS_ONE", lambda x: x["totals"].__setitem__("decoded_logical_bytes", 268435457))
    run("SHARD_CAP_PLUS_ONE", lambda x: x["totals"].__setitem__("shard_files", 129))
    run("PHYSICAL_TOTAL_EVASION", lambda x: x["physical_files"][0].__setitem__("physical_bytes", 11))
    run("DECODED_TOTAL_EVASION", lambda x: x["logical_artifacts"][0].__setitem__("decoded_bytes", 11))
    run("MEMBER_BINDING", lambda x: x["logical_artifacts"][0]["members"][0].__setitem__("physical_sha256", "1"*64))
    run("ORDINAL_DRIFT", lambda x: x["logical_artifacts"][0]["members"][0].__setitem__("ordinal", 1))
    run("RESERVE_CONSUMED", lambda x: x["terminal_reserve"].__setitem__("preserved", False))
    run("PACKET_ID", lambda x: x.__setitem__("packet_id", "v1"))
    run("PATH_TRAVERSAL", lambda x: x["physical_files"][0].__setitem__("path", "../escape"))
    run("RESERVE_BOUNDARY_PLUS_ONE", lambda x: x["totals"].__setitem__("physical_bytes", 201326592 - 4194304 + 1))
    def ordinary_over(x: dict[str, Any]) -> None:
        x["physical_files"][0]["physical_bytes"] = 1048577; x["logical_artifacts"][0]["members"][0]["physical_bytes"] = 1048577; x["totals"]["physical_bytes"] = 1048577
    run("ORDINARY_CAP_PLUS_ONE", ordinary_over)
    def ratio_over(x: dict[str, Any]) -> None:
        x["logical_artifacts"][0]["members"][0]["decoded_bytes"] = 641; x["logical_artifacts"][0]["decoded_bytes"] = 641; x["totals"]["decoded_logical_bytes"] = 641
    run("EXPANSION_RATIO_PLUS_ONE", ratio_over)
    run("DUPLICATE_MEMBER", lambda x: x["logical_artifacts"][0]["members"].append(copy.deepcopy(x["logical_artifacts"][0]["members"][0])))
    def mixed_ratio_mask(x: dict[str, Any]) -> None:
        x["physical_files"] = [
            {"path": "ARTIFACTS/a.gz", "kind": "regular_file", "mode": 420, "link_count": 1, "physical_bytes": 1, "physical_sha256": digest, "owner_scope": "shared", "logical_artifact_id": "artifact.a"},
            {"path": "ARTIFACTS/b.json", "kind": "regular_file", "mode": 420, "link_count": 1, "physical_bytes": 1000, "physical_sha256": digest, "owner_scope": "shared", "logical_artifact_id": "artifact.a"},
        ]
        x["logical_artifacts"][0].update({"artifact_kind": "source_snapshot_buckets", "members": [
            {"ordinal": 0, "path": "ARTIFACTS/a.gz", "encoding": "gzip-single-member", "physical_bytes": 1, "physical_sha256": digest, "decoded_bytes": 65, "decoded_sha256": digest},
            {"ordinal": 1, "path": "ARTIFACTS/b.json", "encoding": "identity", "physical_bytes": 1000, "physical_sha256": digest, "decoded_bytes": 1000, "decoded_sha256": digest},
        ], "decoded_bytes": 1065})
        x["totals"] = {"physical_files": 3, "physical_bytes": 1101, "manifest_physical_bytes": 100, "decoded_logical_bytes": 1165, "shard_files": 2}
    run("MIXED_MEMBER_EXPANSION_MASK", mixed_ratio_mask)
    return {"total": len(rows), "rejected": sum(row["rejected"] for row in rows), "survivors": [row["name"] for row in rows if not row["rejected"]], "rows": rows}


def authority_fixtures(core_sha: str, contract: dict[str, Any], effective: str,
                       source: dict[str, Any], protected: dict[str, Any]) -> dict[str, Any]:
    zero = "0" * 64; trial = source["trial_id"]; generation = source["generation_id"]; run_root = str(FUTURE_RUN)
    families = ["USAGE_ACCOUNTING_TRUTH", "WEB_RESEARCH_BEHAVIOR", "ACCESSIBILITY_CONTROL_CONTRACTS", "MIGRATIONS_DURABLE_STATE"]
    source_raw = b"fixture canonical source\n"
    source_binding = {"ref": "Plans/fixture-canonical-source.md", "bytes": len(source_raw), "sha256": compact.sha256_bytes(source_raw)}
    canonical_source_index = {source_binding["ref"]: {**source_binding, "path_class": "canonical"}}
    canary_registry = {"schema_version": "1.1.0", "packet_id": compact.PACKET_ID, "trial_id": trial, "generation_id": generation, "run_root": run_root, "registry_id": "canary.fixture",
                       "canaries": [
                           {"canary_id": "audit.fixture", "canary_class": "AUDIT_HISTORY", "utf8_token": "AUDIT_HISTORY_CANARY_FIXTURE_7d947e", "utf8_bytes": len(b"AUDIT_HISTORY_CANARY_FIXTURE_7d947e"), "token_sha256": compact.sha256_bytes(b"AUDIT_HISTORY_CANARY_FIXTURE_7d947e"), "forbidden_payload_classes": ["static_payload", "derived_payload", "model_output"]},
                           {"canary_id": "calibration.fixture", "canary_class": "CROSS_FAMILY_CALIBRATION", "utf8_token": "CROSS_FAMILY_CALIBRATION_CANARY_198ce7", "utf8_bytes": len(b"CROSS_FAMILY_CALIBRATION_CANARY_198ce7"), "token_sha256": compact.sha256_bytes(b"CROSS_FAMILY_CALIBRATION_CANARY_198ce7"), "forbidden_payload_classes": ["static_payload", "derived_payload", "model_output"]}
                       ], "terminal": "FROZEN_PREAUTH_CONTROLLER_ONLY"}
    canary_registry["registry_payload_sha256"] = v11.payload_hash("canary-registry", canary_registry, "registry_payload_sha256")
    canary_raw = compact.canonical_bytes(canary_registry)
    payloads = []; controller_payloads = []; payload_records: dict[str, bytes] = {}; capability_sha_by_family: dict[str, str] = {}
    binding_population = compact.identity_hash("canonical-source-bindings", [source_binding])
    for family in families:
        ref = f"CONTROL/CAPABILITY_SLICES/{family}.json"
        content = {"schema_version": "1.1.0", "schema_id": "pm.plan_assurance.capability_slice_manifest.v1.1", "family_id": family, "slice_id": f"slice.{family}",
                   "named_surface_commitments": [compact.identity_hash("fixture-named-surface", [family, index]) for index in range(2)], "detailed_plan_assertion_commitment_sha256": compact.identity_hash("fixture-detailed-assertions", family),
                   "source_binding_population_sha256": binding_population, "model_visible_before_lock": False, "external_transmission_before_lock": False}
        content["manifest_payload_sha256"] = v11.payload_hash("capability-slice-manifest", content, "manifest_payload_sha256")
        envelope = {"schema_version": "1.1.0", "packet_id": compact.PACKET_ID, "trial_id": trial, "generation_id": generation, "artifact_id": f"{family}.CAPABILITY_SLICE_MANIFEST", "artifact_kind": "CAPABILITY_SLICE_MANIFEST", "family_id": family,
                    "stage_id": "S3_CAPABILITY_SLICE", "payload_schema_id": "pm.plan_assurance.capability_slice_manifest.v1.1", "payload": content, "source_bindings": [source_binding], "provenance_mode": "CANONICAL_SOURCE_BINDINGS_ONLY", "created_before_external_authority": True, "terminal": "FROZEN"}
        envelope["payload_sha256"] = v11.payload_hash("semantic-artifact-envelope", envelope, "payload_sha256")
        raw = compact.canonical_bytes(envelope); payload_records[ref] = raw; digest = compact.sha256_bytes(raw); capability_sha_by_family[family] = digest
        controller_payloads.append({"payload_id": envelope["artifact_id"], "family_id": family, "ref": ref, "bytes": len(raw), "sha256": digest, "schema_id": "pm.plan_assurance.semantic_artifact_envelope.v1.1", "artifact_kind": "CAPABILITY_SLICE_MANIFEST",
                                    "payload_schema_id": "pm.plan_assurance.capability_slice_manifest.v1.1", "source_binding_population_sha256": binding_population, "model_visible_before_lock": False, "external_transmission_before_lock": False, "source_class_allowlist": ["canonical"]})
    for family in families:
        for role in ("LOCAL_EXPECTATION_MODELER", "OPEN_DISCOVERY_RESEARCHER"):
            ref = f"STAGING/{family}/{role}.json"; artifact_kind = "EXPECTATION_PACKET"
            payload_schema_id = "pm.plan_assurance.expectation_packet.v1.1"
            stage_id = "S3_EXPECTATION_PACKET"
            external = role == "OPEN_DISCOVERY_RESEARCHER"
            content = {"schema_version": "1.1.0", "schema_id": "pm.plan_assurance.expectation_packet.v1.1", "family_id": family, "role_id": role,
                       "intent": {"user_outcomes": [f"fixture outcome {family}"], "non_goals": [], "risk_signals": [f"fixture risk {family}"]},
                       "discovery_directive": {"independent_from_finished_plan": True, "external_research_required": external, "creative_inspiration_required": external, "comparators_and_adjacent_approaches_required": external, "failure_evidence_required": external},
                       "detailed_plan_assertions_withheld_until_lock": True, "capability_slice_manifest_sha256": capability_sha_by_family[family], "source_binding_population_sha256": binding_population}
            content["expectation_payload_sha256"] = v11.payload_hash("expectation-packet", content, "expectation_payload_sha256")
            envelope = {"schema_version": "1.1.0", "packet_id": compact.PACKET_ID, "trial_id": trial, "generation_id": generation, "artifact_id": f"{family}.{role}", "artifact_kind": artifact_kind, "family_id": family,
                        "stage_id": stage_id, "payload_schema_id": payload_schema_id, "payload": content, "source_bindings": [source_binding], "provenance_mode": "CANONICAL_SOURCE_BINDINGS_ONLY",
                        "created_before_external_authority": True, "terminal": "FROZEN"}
            envelope["payload_sha256"] = v11.payload_hash("semantic-artifact-envelope", envelope, "payload_sha256")
            raw = compact.canonical_bytes(envelope); payload_records[ref] = raw
            payloads.append({"payload_id": f"{family}.{role}", "family_id": family, "role_id": role, "ref": ref, "bytes": len(raw), "sha256": compact.sha256_bytes(raw), "schema_id": "pm.plan_assurance.semantic_artifact_envelope.v1.1", "artifact_kind": artifact_kind, "payload_schema_id": payload_schema_id,
                             "source_binding_population_sha256": binding_population, "model_visible": True, "private_repo_data": True, "source_class_allowlist": ["canonical"]})
    transmission = {"schema_version": "1.1.0", "packet_id": compact.PACKET_ID, "trial_id": trial, "generation_id": generation, "run_root": run_root,
                    "static_payloads": payloads, "controller_only_payloads": controller_payloads, "derived_payload_rules": [{"rule_id": "bound.followup", "input_schema_ids": ["pm.plan_assurance.expectation_packet.v1.1"], "output_schema_id": "pm.fixture.output.v1", "maximum_bytes": 1048576, "hash_binding_required": True, "unlisted_bytes_forbidden": True}],
                    "authorized_output_classes": [{"schema_id": "pm.fixture.output.v1", "maximum_bytes": 1048576, "may_be_retransmitted_only_by_bound_rule": True}],
                    "forbidden_populations": ["Plans/.audits/**", "F3 hidden oracle", "F3 hidden source portfolio", "F3 benchmark controls outside accessibility calibration", "parent conversation history", "unlisted repository bytes", "canary registry and canary token values"],
                    "canary_assertions": {"canary_registry_ref": "CONTROL/CANARY_REGISTRY.json", "canary_registry_file_sha256": compact.sha256_bytes(canary_raw), "canary_registry_payload_sha256": canary_registry["registry_payload_sha256"], "tokens_checked": 2, "static_payloads_checked": 8, "controller_payloads_checked": 4, "occurrences": 0, "terminal": "PASS"}, "private_repo_data_disclosed": True, "terminal": "FROZEN_BEFORE_EXTERNAL_AUTHORITY"}
    transmission["manifest_payload_sha256"] = v11.payload_hash("external-transmission-manifest", transmission, "manifest_payload_sha256")
    dispatches = [{"dispatch_id": row["payload_id"], "family_id": row["family_id"], "role_id": row["role_id"], "model": "gpt-5.6-sol", "reasoning_effort": "xhigh", "payload_ref": row["ref"], "payload_sha256": row["sha256"], "response_schema_id": "pm.fixture.output.v1", "maximum_input_bytes": 1048576, "maximum_output_bytes": 1048576, "semantic_retry_maximum": 0} for row in payloads]
    budget_sha = compact.identity_hash("budget-contract", contract["budgets"])
    execution = {"schema_version": "1.1.0", "packet_id": compact.PACKET_ID, "trial_id": trial, "generation_id": generation, "dispatches": dispatches,
                 "conditional_failure_templates": [{"family_id": family, "role_id": "FAILURE_EVIDENCE_RESEARCHER", "trigger_source": "controller-derived RESEARCH_ADEQUACY_RECEIPT", "payload_rule_id": "bound.followup", "maximum_invocations": 1, "fork_turns": "none", "descendants_allowed": False} for family in families],
                 "cross_family_challenge_templates": [{"target_family_id": family, "challenger_family_id": {"USAGE_ACCOUNTING_TRUTH": "MIGRATIONS_DURABLE_STATE", "WEB_RESEARCH_BEHAVIOR": "ACCESSIBILITY_CONTROL_CONTRACTS", "ACCESSIBILITY_CONTROL_CONTRACTS": "WEB_RESEARCH_BEHAVIOR", "MIGRATIONS_DURABLE_STATE": "USAGE_ACCOUNTING_TRUTH"}[family], "role_id": "CROSS_FAMILY_CHALLENGER", "reuses_existing_family_context": True, "payload_rule_id": "bound.followup", "fresh_context_forbidden": True, "descendants_allowed": False} for family in families],
                 "global_topology": {"controller_count": 1, "active_units_maximum": 12, "direct_workers_maximum": 11, "descendants_allowed": False, "sole_writer": "TRIAL_CONTROLLER"},
                 "worker_context_policy": {"fork_turns": "none", "history_inherited": False, "repo_read_authorized": False, "audit_read_authorized": False, "only_hash_bound_payloads": True},
                 "tool_policy": {"OPEN_DISCOVERY_RESEARCHER": ["web_search", "web_open"], "FAILURE_EVIDENCE_RESEARCHER": ["web_search", "web_open"], "other_semantic_roles": [], "filesystem_tools": [], "shell_tools": []},
                 "write_policy": {"worker_writes": False, "controller_write_root_only": True},
                 "canary_policy": {"required": True, "audit_canary_occurrences_maximum": 0, "cross_family_calibration_leakage_maximum": 0, "failure_terminal": "TRIAL_INVALID"},
                 "budget_contract_sha256": budget_sha, "terminal": "FROZEN_BEFORE_EXTERNAL_AUTHORITY"}
    execution["envelope_payload_sha256"] = v11.payload_hash("semantic-execution-envelope", execution, "envelope_payload_sha256")
    transmission_sha = compact.sha256_bytes(compact.canonical_bytes(transmission)); execution_sha = compact.sha256_bytes(compact.canonical_bytes(execution))
    request = {"schema_version": "1.1.0", "request_id": "request.fixture", "trial_id": trial, "generation_id": generation, "packet_id": compact.PACKET_ID,
               "packet_core_population_sha256": core_sha, "base_contract_sha256": contract["base_packet"]["contract_sha256"], "repair_contract_sha256": contract["repair_payload_sha256"], "effective_contract_sha256": effective,
               "requesting_task_path": "/root/trial-controller", "expected_authority_task_path": "/root", "authority_delivery_mode": "codex_system_collaboration_envelope", "request_status": "AWAITING_FRESH_AUTHORITY",
               "base_artifact_validator_sha256": "115f2610dc422f730a54d33d029261f8a5aa64e05ddbffde14c540990f7e07d8", "v1_1_artifact_validator_sha256": sha(ROOT / "validate_trial_artifacts.py"),
               "source_snapshot_ref": "SOURCE_SNAPSHOT.json", "source_snapshot_sha256": compact.sha256_bytes(compact.canonical_bytes(source)), "source_snapshot_population_sha256": source["population_sha256"],
               "protected_before_ref": "PROTECTED_BEFORE.json", "protected_before_receipt_sha256": compact.sha256_bytes(compact.canonical_bytes(protected)), "protected_before_invariance_sha256": protected["invariance_payload_sha256"],
               "run_root": run_root, "budget_contract_sha256": budget_sha, "topology_contract_sha256": compact.identity_hash("topology-contract", execution["global_topology"]),
               "external_transmission_manifest_ref": "EXTERNAL_TRANSMISSION_MANIFEST.json", "external_transmission_manifest_sha256": transmission_sha,
               "execution_envelope_ref": "SEMANTIC_EXECUTION_ENVELOPE.json", "execution_envelope_sha256": execution_sha, "prelaunch_staging_manifest_sha256": compact.identity_hash("prelaunch-staging", [transmission_sha, execution_sha]),
               "created_at_utc": "2026-07-17T00:00:00Z", "expires_at_utc": "2026-07-17T00:30:00Z", "max_uses": 1}
    request["launch_binding_sha256"] = v11.payload_hash("launch-request-binding", request, "launch_binding_sha256")
    request_sha = compact.sha256_bytes(compact.canonical_bytes(request)); nonce = compact.identity_hash("one-use-nonce", [request_sha, "fixture"])
    message = {"schema_version": "1.1.0", "packet_id": compact.PACKET_ID, "packet_core_population_sha256": core_sha, "decision": "AUTHORIZE_ONE_LIVE_TURN", "request_sha256": request_sha,
               "approved_launch_binding_sha256": request["launch_binding_sha256"], "approved_external_transmission_manifest_sha256": transmission_sha, "approved_execution_envelope_sha256": execution_sha,
               "one_use_nonce_sha256": nonce, "target_task_path": request["requesting_task_path"], "expires_at_utc": "2026-07-17T00:02:45Z", "external_research_authorized": True, "model_calls_authorized": True,
               "canonical_plan_writes_authorized": False, "generated_or_governance_writes_authorized": False, "git_write_authorized": False}
    capability = {"schema_version": "1.1.0", "packet_id": compact.PACKET_ID, "packet_core_population_sha256": core_sha, "capability_id": "capability.fixture", "authority_mode": "codex_live_orchestrator_sender",
                  "target_task_path": request["requesting_task_path"], "observed_sender_task_path": request["expected_authority_task_path"], "observed_message_type": "MESSAGE", "observed_message_id": "message.fixture", "observed_turn_id": "turn.fixture",
                  "observed_message_created_at_utc": "2026-07-17T00:02:00Z", "consumed_at_utc": "2026-07-17T00:02:02Z", "authorization_message": message, "authorization_message_sha256": compact.identity_hash("authorization-message", message),
                  "launch_request_sha256": request_sha, "approved_launch_binding_sha256": request["launch_binding_sha256"], "approved_external_transmission_manifest_sha256": transmission_sha, "approved_execution_envelope_sha256": execution_sha,
                  "one_use_nonce_sha256": nonce, "issued_at_utc": "2026-07-17T00:02:01Z", "expires_at_utc": "2026-07-17T00:02:45Z", "max_uses": 1, "live_system_sender_attestation_observed": True, "offline_cryptographic_verification": False, "terminal": "LIVE_ATTESTATION_CONSUMED"}
    capability["capability_payload_sha256"] = v11.payload_hash("trusted-launch-capability", capability, "capability_payload_sha256")
    capability_sha = compact.sha256_bytes(compact.canonical_bytes(capability))
    authority = {"schema_version": "1.1.0", "packet_id": compact.PACKET_ID, "packet_core_population_sha256": core_sha, "trial_id": trial, "generation_id": generation,
                 "base_contract_sha256": request["base_contract_sha256"], "repair_contract_sha256": request["repair_contract_sha256"], "effective_contract_sha256": effective,
                 "base_artifact_validator_sha256": request["base_artifact_validator_sha256"], "v1_1_artifact_validator_sha256": request["v1_1_artifact_validator_sha256"],
                 "launch_request_ref": "LAUNCH_REQUEST.json", "launch_request_sha256": request_sha, "launch_binding_sha256": request["launch_binding_sha256"], "authority_mode": "codex_live_orchestrator_sender",
                 "trusted_capability_ref": "AUTHORITY/TRUSTED_LAUNCH_CAPABILITY.json", "trusted_capability_sha256": capability_sha, "trusted_capability_id": capability["capability_id"],
                 "authorization_message_sha256": capability["authorization_message_sha256"], "observed_sender_task_path": capability["observed_sender_task_path"], "observed_message_id": capability["observed_message_id"], "observed_turn_id": capability["observed_turn_id"],
                 "one_use_nonce_sha256": nonce, "offline_cryptographic_verification": False, "single_use_marker_ref": "AUTHORITY/LAUNCH_AUTHORITY_USED.json", "max_uses": 1, "trial_launch_authorized": True, "run_root": run_root,
                 "external_research_authorized": True, "model_calls_authorized": True, "external_transmission_disclosed_and_accepted": True, "canonical_plan_writes_authorized": False, "generated_or_governance_writes_authorized": False, "git_write_authorized": False,
                 "budget_contract_sha256": budget_sha, "source_snapshot_must_be_fresh": True, "source_snapshot_sha256": request["source_snapshot_sha256"], "source_snapshot_population_sha256": source["population_sha256"],
                 "protected_before_receipt_sha256": request["protected_before_receipt_sha256"], "protected_before_invariance_sha256": request["protected_before_invariance_sha256"],
                 "external_transmission_manifest_sha256": transmission_sha, "execution_envelope_sha256": execution_sha, "issued_at_utc": "2026-07-17T00:02:03Z", "expires_at_utc": "2026-07-17T00:02:40Z"}
    authority["authority_payload_sha256"] = v11.payload_hash("launch-authority", authority, "authority_payload_sha256"); authority_sha = compact.sha256_bytes(compact.canonical_bytes(authority))
    marker = {"schema_version": "1.1.0", "packet_id": compact.PACKET_ID, "packet_core_population_sha256": core_sha, "trial_id": trial, "generation_id": generation, "marker_id": "marker.fixture",
              "request_sha256": request_sha, "launch_binding_sha256": request["launch_binding_sha256"], "capability_sha256": capability_sha, "capability_id": capability["capability_id"], "authority_sha256": authority_sha,
              "one_use_nonce_sha256": nonce, "use_ordinal": 1, "prior_marker_absent": True, "consumed_at_utc": "2026-07-17T00:02:04Z", "first_external_action_not_started": True, "terminal": "AUTHORITY_CONSUMED_PREACTION"}
    marker["marker_payload_sha256"] = v11.payload_hash("launch-authority-used", marker, "marker_payload_sha256")
    live = {"observed_sender_task_path": "/root", "observed_message_type": "MESSAGE", "observed_message_id": "message.fixture", "observed_turn_id": "turn.fixture", "message_created_at_utc": "2026-07-17T00:02:00Z", "target_task_path": "/root/trial-controller", "message_payload": message}
    expected_context = {key: request[key] for key in ("packet_id", "packet_core_population_sha256", "base_contract_sha256", "repair_contract_sha256", "effective_contract_sha256", "base_artifact_validator_sha256", "v1_1_artifact_validator_sha256", "budget_contract_sha256", "topology_contract_sha256", "trial_id", "generation_id", "run_root")}
    expected_context["repository_root"] = str(REPO.resolve())
    expected_context["packet_root"] = str(ROOT.resolve())
    return {"source": source, "protected": protected, "transmission": transmission, "payload_records": payload_records, "canary_registry": canary_registry, "canonical_source_index": canonical_source_index,
            "execution": execution, "request": request, "capability": capability, "authority": authority, "marker": marker, "live": live, "expected_context": expected_context,
            "observed_now_utc": "2026-07-17T00:02:05Z", "first_external_action_observed_at_utc": "2026-07-17T00:02:05Z"}


def authority_mutations(fixtures: dict[str, Any]) -> dict[str, Any]:
    def findings(value: dict[str, Any]) -> list[str]:
        return v11.validate_bound_launch_chain(
            value["source"], value["protected"], value["transmission"], value["execution"],
            value["request"], value["capability"], value["authority"], value["marker"],
            value["expected_context"], value["live"], value["observed_now_utc"],
            value["first_external_action_observed_at_utc"], payload_records=value["payload_records"],
            canary_registry=value["canary_registry"], canonical_source_index=value["canonical_source_index"])
    baseline_findings = findings(fixtures)
    rows = []
    def run(name: str, change: Callable[[dict[str, Any]], None]) -> None:
        value = copy.deepcopy(fixtures); change(value); codes = findings(value); rows.append({"name": name, "rejected": bool(codes), "first_code": codes[0] if codes else None})
    def full_chain_core_rebind(x: dict[str, Any]) -> None:
        replacement = "f" * 64
        request = x["request"]; request["packet_core_population_sha256"] = replacement; request["launch_binding_sha256"] = v11.payload_hash("launch-request-binding", request, "launch_binding_sha256")
        request_sha = compact.sha256_bytes(compact.canonical_bytes(request))
        capability = x["capability"]; capability["packet_core_population_sha256"] = replacement; capability["launch_request_sha256"] = request_sha; capability["approved_launch_binding_sha256"] = request["launch_binding_sha256"]
        message = capability["authorization_message"]; message["packet_core_population_sha256"] = replacement; message["request_sha256"] = request_sha; message["approved_launch_binding_sha256"] = request["launch_binding_sha256"]
        capability["authorization_message_sha256"] = compact.identity_hash("authorization-message", message); capability["capability_payload_sha256"] = v11.payload_hash("trusted-launch-capability", capability, "capability_payload_sha256"); x["live"]["message_payload"] = copy.deepcopy(message)
        capability_sha = compact.sha256_bytes(compact.canonical_bytes(capability))
        authority = x["authority"]; authority["packet_core_population_sha256"] = replacement; authority["launch_request_sha256"] = request_sha; authority["launch_binding_sha256"] = request["launch_binding_sha256"]; authority["trusted_capability_sha256"] = capability_sha; authority["authorization_message_sha256"] = capability["authorization_message_sha256"]
        authority["authority_payload_sha256"] = v11.payload_hash("launch-authority", authority, "authority_payload_sha256"); authority_sha = compact.sha256_bytes(compact.canonical_bytes(authority))
        marker = x["marker"]; marker["packet_core_population_sha256"] = replacement; marker["request_sha256"] = request_sha; marker["launch_binding_sha256"] = request["launch_binding_sha256"]; marker["capability_sha256"] = capability_sha; marker["authority_sha256"] = authority_sha; marker["marker_payload_sha256"] = v11.payload_hash("launch-authority-used", marker, "marker_payload_sha256")
    def refresh_record(x: dict[str, Any], row: dict[str, Any], envelope: dict[str, Any]) -> None:
        content = envelope.get("payload", {})
        if envelope.get("artifact_kind") == "EXPECTATION_PACKET": content["expectation_payload_sha256"] = v11.payload_hash("expectation-packet", content, "expectation_payload_sha256")
        else: content["manifest_payload_sha256"] = v11.payload_hash("capability-slice-manifest", content, "manifest_payload_sha256")
        envelope["payload_sha256"] = v11.payload_hash("semantic-artifact-envelope", envelope, "payload_sha256")
        raw = compact.canonical_bytes(envelope); x["payload_records"][row["ref"]] = raw; row["bytes"] = len(raw); row["sha256"] = compact.sha256_bytes(raw)
        x["transmission"]["manifest_payload_sha256"] = v11.payload_hash("external-transmission-manifest", x["transmission"], "manifest_payload_sha256")
    def mutate_static_content(x: dict[str, Any], mutate: Callable[[dict[str, Any]], None]) -> None:
        row = x["transmission"]["static_payloads"][0]; envelope = compact.strict_json_loads(x["payload_records"][row["ref"]].decode("utf-8")); mutate(envelope); refresh_record(x, row, envelope)
    def mutate_controller_content(x: dict[str, Any], mutate: Callable[[dict[str, Any]], None]) -> None:
        row = x["transmission"]["controller_only_payloads"][0]; envelope = compact.strict_json_loads(x["payload_records"][row["ref"]].decode("utf-8")); mutate(envelope); refresh_record(x, row, envelope)
    mutations = [
        ("TRANSMISSION_ROLE", lambda x: x["transmission"]["static_payloads"][0].__setitem__("role_id", "CREATIVE_EXTERNAL_DISCOVERER")),
        ("TRANSMISSION_FORBIDDEN", lambda x: x["transmission"]["forbidden_populations"].pop()),
        ("TRANSMISSION_HASH", lambda x: x["transmission"].__setitem__("manifest_payload_sha256", "0"*64)),
        ("TRANSMISSION_STATIC_FILE_MISSING", lambda x: x["payload_records"].pop(x["transmission"]["static_payloads"][0]["ref"])),
        ("TRANSMISSION_STATIC_FILE_TAMPER", lambda x: x["payload_records"].__setitem__(x["transmission"]["static_payloads"][0]["ref"], x["payload_records"][x["transmission"]["static_payloads"][0]["ref"]] + b"x")),
        ("TRANSMISSION_CANARY_OCCURRENCE", lambda x: mutate_static_content(x, lambda e: e["payload"]["intent"]["user_outcomes"].append(x["canary_registry"]["canaries"][0]["utf8_token"]))),
        ("TRANSMISSION_EXPECTATION_SCHEMA", lambda x: mutate_static_content(x, lambda e: e["payload"].pop("intent"))),
        ("TRANSMISSION_ASSERTION_WITHHOLDING", lambda x: mutate_static_content(x, lambda e: e["payload"].__setitem__("detailed_plan_assertions_withheld_until_lock", False))),
        ("TRANSMISSION_SOURCE_CLASS", lambda x: x["canonical_source_index"][next(iter(x["canonical_source_index"]))].__setitem__("path_class", "audit")),
        ("TRANSMISSION_CONTROLLER_FILE_MISSING", lambda x: x["payload_records"].pop(x["transmission"]["controller_only_payloads"][0]["ref"])),
        ("TRANSMISSION_CAPABILITY_VISIBLE", lambda x: mutate_controller_content(x, lambda e: e["payload"].__setitem__("model_visible_before_lock", True))),
        ("TRANSMISSION_CAPABILITY_LINK", lambda x: mutate_static_content(x, lambda e: e["payload"].__setitem__("capability_slice_manifest_sha256", "a"*64))),
        ("TRANSMISSION_CANARY_REGISTRY", lambda x: x["canary_registry"]["canaries"][0].__setitem__("utf8_token", "AUDIT_HISTORY_CANARY_MUTATED_7d947e")),
        ("EXECUTION_FORK", lambda x: x["execution"]["worker_context_policy"].__setitem__("fork_turns", "all")),
        ("EXECUTION_PAYLOAD", lambda x: x["execution"]["dispatches"][0].__setitem__("payload_sha256", "0"*64)),
        ("EXECUTION_ROLE", lambda x: x["execution"]["dispatches"][0].__setitem__("role_id", "FAILURE_EVIDENCE_RECOVERY")),
        ("EXECUTION_DISPATCH_MISSING", lambda x: x["execution"]["dispatches"].pop()),
        ("EXECUTION_FAILURE_FAMILY_DUPLICATE", lambda x: x["execution"]["conditional_failure_templates"][0].__setitem__("family_id", x["execution"]["conditional_failure_templates"][1]["family_id"])),
        ("EXECUTION_CHALLENGE_ROTATION", lambda x: x["execution"]["cross_family_challenge_templates"][0].__setitem__("challenger_family_id", "WEB_RESEARCH_BEHAVIOR")),
        ("EXECUTION_FAILURE_WEB_TOOLS", lambda x: x["execution"]["tool_policy"].__setitem__("FAILURE_EVIDENCE_RESEARCHER", [])),
        ("EXECUTION_ACTIVE_UNITS", lambda x: x["execution"]["global_topology"].__setitem__("active_units_maximum", 13)),
        ("REQUEST_STATUS", lambda x: x["request"].__setitem__("request_status", "AWAITING_EXTERNAL_ATTESTATION")),
        ("REQUEST_BINDING", lambda x: x["request"].__setitem__("launch_binding_sha256", "0"*64)),
        ("REQUEST_TTL", lambda x: x["request"].__setitem__("expires_at_utc", "2026-07-17T02:00:00Z")),
        ("REQUEST_SOURCE_BINDING", lambda x: x["request"].__setitem__("source_snapshot_sha256", "0"*64)),
        ("SOURCE_GENERATION_DRIFT", lambda x: x["source"].__setitem__("generation_id", "generation-wrong")),
        ("REQUEST_PROTECTED_BINDING", lambda x: x["request"].__setitem__("protected_before_receipt_sha256", "0"*64)),
        ("PROTECTED_GENERATION_DRIFT", lambda x: x["protected"].__setitem__("generation_id", "generation-wrong")),
        ("REQUEST_TRANSMISSION_BINDING", lambda x: x["request"].__setitem__("external_transmission_manifest_sha256", "0"*64)),
        ("REQUEST_EXECUTION_BINDING", lambda x: x["request"].__setitem__("execution_envelope_sha256", "0"*64)),
        ("REQUEST_BUDGET_BINDING", lambda x: x["request"].__setitem__("budget_contract_sha256", "0"*64)),
        ("REQUEST_TOPOLOGY_BINDING", lambda x: x["request"].__setitem__("topology_contract_sha256", "0"*64)),
        ("CAPABILITY_TARGET", lambda x: x["capability"].__setitem__("target_task_path", "/root/wrong")),
        ("CAPABILITY_SENDER", lambda x: x["capability"].__setitem__("observed_sender_task_path", "/root/wrong")),
        ("CAPABILITY_MESSAGE", lambda x: x["capability"]["authorization_message"].__setitem__("one_use_nonce_sha256", "0"*64)),
        ("CAPABILITY_MESSAGE_HASH", lambda x: x["capability"].__setitem__("authorization_message_sha256", "0"*64)),
        ("CAPABILITY_LIVE_PAYLOAD", lambda x: x["live"].__setitem__("message_payload", {"fabricated": True})),
        ("CAPABILITY_LIVE_TARGET", lambda x: x["live"].__setitem__("target_task_path", "/root/wrong")),
        ("CAPABILITY_LIVE_TIME", lambda x: x["live"].__setitem__("message_created_at_utc", "2026-07-17T00:02:01Z")),
        ("CAPABILITY_FRESHNESS", lambda x: x["capability"].__setitem__("consumed_at_utc", "2026-07-17T00:03:00Z")),
        ("AUTHORITY_PAYLOAD", lambda x: x["authority"].__setitem__("authority_payload_sha256", "0"*64)),
        ("AUTHORITY_NONCE", lambda x: x["authority"].__setitem__("one_use_nonce_sha256", "0"*64)),
        ("AUTHORITY_RUN_ROOT", lambda x: x["authority"].__setitem__("run_root", "/tmp/wrong")),
        ("AUTHORITY_WRITES", lambda x: x["authority"].__setitem__("git_write_authorized", True)),
        ("AUTHORITY_TIME", lambda x: x["authority"].__setitem__("issued_at_utc", "2026-07-17T00:01:00Z")),
        ("MARKER_NONCE", lambda x: x["marker"].__setitem__("one_use_nonce_sha256", "0"*64)),
        ("MARKER_USE", lambda x: x["marker"].__setitem__("use_ordinal", 2)),
        ("MARKER_PRIOR", lambda x: x["marker"].__setitem__("prior_marker_absent", False)),
        ("MARKER_AUTHORITY", lambda x: x["marker"].__setitem__("authority_sha256", "0"*64)),
        ("MARKER_TIME", lambda x: x["marker"].__setitem__("consumed_at_utc", "2026-07-17T00:03:00Z")),
        ("OBSERVED_NOW_DELAYED_REPLAY", lambda x: x.__setitem__("observed_now_utc", "2026-07-17T00:04:00Z")),
        ("EXPECTED_CONTEXT_OMITTED", lambda x: x.__setitem__("expected_context", None)),
        ("LIVE_SENDER_OMITTED", lambda x: x.__setitem__("live", None)),
        ("OBSERVED_NOW_OMITTED", lambda x: x.__setitem__("observed_now_utc", None)),
        ("FIRST_ACTION_TIME_OMITTED", lambda x: x.__setitem__("first_external_action_observed_at_utc", None)),
        ("FULL_CHAIN_CORE_REBIND", full_chain_core_rebind),
    ]
    for name, change in mutations: run(name, change)
    return {"baseline_findings": baseline_findings, "total": len(rows), "rejected": sum(row["rejected"] for row in rows), "survivors": [row["name"] for row in rows if not row["rejected"]], "rows": rows}


def live_root_binding_mutations() -> dict[str, Any]:
    source = {"plans_root": str(PLANS.resolve()), "excluded_future_run_root": str(ROOT.resolve())}
    protected = {"repository_root": str(REPO.resolve()), "exclusion_contract": {"authorized_run_root": str(ROOT.resolve())}}
    context = {"repository_root": str(REPO.resolve()), "run_root": str(ROOT.resolve())}

    def findings(value: dict[str, Any]) -> list[str]:
        return v11.validate_live_root_bindings(value["source"], value["protected"], value["context"], value["run_root"], value["repository_root"])

    fixture = {"source": source, "protected": protected, "context": context, "run_root": ROOT.resolve(), "repository_root": REPO.resolve()}
    baseline = findings(fixture)
    rows: list[dict[str, Any]] = []

    def run(name: str, mutate: Callable[[dict[str, Any]], None]) -> None:
        value = copy.deepcopy(fixture); mutate(value); codes = findings(value)
        rows.append({"name": name, "rejected": bool(codes), "first_code": codes[0] if codes else None})

    run("REPOSITORY_ROOT_OMITTED", lambda x: x.__setitem__("repository_root", None))
    run("REPOSITORY_ROOT_WRONG", lambda x: x.__setitem__("repository_root", REPO.parent.resolve()))
    run("EXPECTED_REPOSITORY_ROOT_OMITTED", lambda x: x["context"].pop("repository_root"))
    run("EXPECTED_REPOSITORY_ROOT_WRONG", lambda x: x["context"].__setitem__("repository_root", str(REPO.parent.resolve())))
    run("RUN_ROOT_OMITTED", lambda x: x.__setitem__("run_root", None))
    run("RUN_ROOT_WRONG", lambda x: x.__setitem__("run_root", ROOT.parent.resolve()))
    run("CANONICAL_PLANS_ROOT_WRONG", lambda x: x["source"].__setitem__("plans_root", str(REPO.resolve())))
    run("PROTECTED_REPOSITORY_ROOT_WRONG", lambda x: x["protected"].__setitem__("repository_root", str(REPO.parent.resolve())))
    return {"baseline_findings": baseline, "total": len(rows), "rejected": sum(row["rejected"] for row in rows),
            "survivors": [row["name"] for row in rows if not row["rejected"]], "rows": rows}


def _current_protected_fixture(before: dict[str, Any], observed_now_utc: str) -> dict[str, Any]:
    current = copy.deepcopy(before)
    current["receipt_id"] = f"protected.after.{before['trial_id']}.{before['generation_id']}"
    current["phase"] = "AFTER"; current["captured_at_utc"] = observed_now_utc
    current["run_root_observation"] = {
        "exists": True, "filesystem_population_sha256": "0" * 64, "entry_count": 1,
        "regular_file_count": 1, "directory_count": 0, "regular_file_bytes": 1,
        "symlink_count": 0, "nonregular_count": 0, "multi_link_regular_file_count": 0,
        "filesystem_regular_path_set_sha256": "1" * 64, "excluded_status_path_set_sha256": "1" * 64,
        "path_sets_equal": True,
    }
    current["comparison"] = {
        "before_receipt_file_sha256": compact.sha256_bytes(compact.canonical_bytes(before)),
        "before_invariance_payload_sha256": before["invariance_payload_sha256"],
        "after_invariance_payload_sha256": before["invariance_payload_sha256"],
        "comparison_contract_sha256": compact.identity_hash("protected-comparison-contract", ["all invariant fields", "raw status and run root excluded"]),
        "mismatch_count": 0, "mismatch_codes": [], "terminal": "PASS",
    }
    current["terminal"] = "PASS"
    current["receipt_payload_sha256"] = v11.payload_hash("protected-state-receipt", current, "receipt_payload_sha256")
    return current


def _predispatch_freshness_fixture(fixtures: dict[str, Any]) -> dict[str, Any]:
    request = fixtures["request"]; capability = fixtures["capability"]
    authority = fixtures["authority"]; marker = fixtures["marker"]
    receipt = {
        "schema_version": "1.1.0", "packet_id": compact.PACKET_ID,
        "trial_id": request["trial_id"], "generation_id": request["generation_id"],
        "request_sha256": compact.sha256_bytes(compact.canonical_bytes(request)),
        "capability_sha256": compact.sha256_bytes(compact.canonical_bytes(capability)),
        "authority_sha256": compact.sha256_bytes(compact.canonical_bytes(authority)),
        "marker_sha256": compact.sha256_bytes(compact.canonical_bytes(marker)),
        "full_validation_completed_at_utc": "2026-07-17T00:02:05Z",
        "post_validation_platform_time_utc": "2026-07-17T00:02:05Z",
        "dispatch_boundary_platform_time_utc": "2026-07-17T00:02:05Z",
        "maximum_completion_to_recheck_seconds": 2,
        "maximum_recheck_to_dispatch_seconds": 2,
        "action_occurrence_claim": False,
        "terminal": "READY_FOR_IMMEDIATE_FIRST_EXTERNAL_ACTION",
    }
    receipt["receipt_payload_sha256"] = v11.payload_hash("predispatch-freshness-receipt", receipt, "receipt_payload_sha256")
    return receipt


def predispatch_boundary_mutations(core_sha: str, fixtures: dict[str, Any], contract: dict[str, Any]) -> dict[str, Any]:
    observed_now = fixtures["observed_now_utc"]
    current = _current_protected_fixture(fixtures["protected"], observed_now)
    expected = copy.deepcopy(fixtures["expected_context"])
    expected["packet_core_population_sha256"] = core_sha
    bound_inputs = copy.deepcopy(contract["stable_runtime_bound_inputs"])
    budgets = copy.deepcopy(contract["budgets"])
    budget_manifest = _minimal_budget_manifest()
    freshness = _predispatch_freshness_fixture(fixtures)
    control_records = [
        {"ref": "ROLLING_TRIAL_CONTRACT.json", "expected_bytes": (ROOT / "ROLLING_TRIAL_CONTRACT.json").read_bytes()},
        {"ref": "V1_1_REPAIR_DECISION.json", "expected_bytes": (ROOT / "V1_1_REPAIR_DECISION.json").read_bytes()},
    ]

    baseline = (v11.validate_live_packet_core(ROOT.resolve(), expected) +
                v11.validate_live_protected_receipt_bindings(fixtures["source"], fixtures["protected"], current, expected, bound_inputs, observed_now) +
                v11.validate_live_budget_bindings(budgets, budget_manifest, expected) +
                v11.validate_control_file_identities(ROOT.resolve(), control_records) +
                v11.validate_immediate_predispatch_freshness(freshness, fixtures["request"], fixtures["capability"], fixtures["authority"], fixtures["marker"]))
    live_source = inspect.getsource(v11.validate_live_launch_chain)
    required_live_fragments = ("validate_budget_manifest(budget_manifest, root=run_root", "protected_after=protected_current", "require_reserved_absent=True",
                               "validate_control_file_identities", "build_protected_receipt", "validate_live_packet_core")
    baseline.extend(f"LIVE_CHAIN:STATIC_FRAGMENT:{fragment}" for fragment in required_live_fragments if fragment not in live_source)
    rows: list[dict[str, Any]] = []

    def record(name: str, codes: list[str]) -> None:
        rows.append({"name": name, "rejected": bool(codes), "first_code": codes[0] if codes else None})

    record("PACKET_ROOT_OMITTED", v11.validate_live_packet_core(None, expected))
    wrong_expected = copy.deepcopy(expected); wrong_expected["packet_core_population_sha256"] = "0" * 64
    record("PACKET_CORE_DRIFT", v11.validate_live_packet_core(ROOT.resolve(), wrong_expected))
    wrong_expected = copy.deepcopy(expected); wrong_expected.pop("packet_root")
    record("EXPECTED_PACKET_ROOT_OMITTED", v11.validate_live_packet_core(ROOT.resolve(), wrong_expected))
    record("CURRENT_PROTECTED_OMITTED", v11.validate_live_protected_receipt_bindings(fixtures["source"], fixtures["protected"], None, expected, bound_inputs, observed_now))
    mutated = copy.deepcopy(current); mutated["invariance_payload_sha256"] = "0" * 64; mutated["receipt_payload_sha256"] = v11.payload_hash("protected-state-receipt", mutated, "receipt_payload_sha256")
    record("CURRENT_PROTECTED_INVARIANCE", v11.validate_live_protected_receipt_bindings(fixtures["source"], fixtures["protected"], mutated, expected, bound_inputs, observed_now))
    mutated = copy.deepcopy(current); mutated["run_root_observation"]["exists"] = False; mutated["receipt_payload_sha256"] = v11.payload_hash("protected-state-receipt", mutated, "receipt_payload_sha256")
    record("CURRENT_PROTECTED_ROOT_MISSING", v11.validate_live_protected_receipt_bindings(fixtures["source"], fixtures["protected"], mutated, expected, bound_inputs, observed_now))
    mutated = copy.deepcopy(current); mutated["run_root_observation"]["path_sets_equal"] = False; mutated["receipt_payload_sha256"] = v11.payload_hash("protected-state-receipt", mutated, "receipt_payload_sha256")
    record("CURRENT_PROTECTED_PATH_SET", v11.validate_live_protected_receipt_bindings(fixtures["source"], fixtures["protected"], mutated, expected, bound_inputs, observed_now))
    record("BOUND_INPUT_CONTRACT_OMITTED", v11.validate_live_protected_receipt_bindings(fixtures["source"], fixtures["protected"], current, expected, None, observed_now))
    mutated_inputs = copy.deepcopy(bound_inputs); mutated_inputs[0]["path"] += ".wrong"
    record("BOUND_INPUT_CONTRACT_DRIFT", v11.validate_live_protected_receipt_bindings(fixtures["source"], fixtures["protected"], current, expected, mutated_inputs, observed_now))
    record("CURRENT_PROTECTED_PLATFORM_TIME", v11.validate_live_protected_receipt_bindings(fixtures["source"], fixtures["protected"], current, expected, bound_inputs, "2026-07-17T00:02:06Z"))
    record("PREDISPATCH_BUDGET_CONTRACT_OMITTED", v11.validate_live_budget_bindings(None, budget_manifest, expected))
    record("PREDISPATCH_BUDGET_MANIFEST_OMITTED", v11.validate_live_budget_bindings(budgets, None, expected))
    wrong_expected = copy.deepcopy(expected); wrong_expected["budget_contract_sha256"] = "0" * 64
    record("PREDISPATCH_BUDGET_CONTRACT_DRIFT", v11.validate_live_budget_bindings(budgets, budget_manifest, wrong_expected))
    mutated_manifest = copy.deepcopy(budget_manifest); mutated_manifest["inventory_population_sha256"] = "0" * 64; mutated_manifest["manifest_payload_sha256"] = v11.payload_hash("artifact-budget-manifest", mutated_manifest, "manifest_payload_sha256")
    record("PREDISPATCH_BUDGET_POPULATION", v11.validate_live_budget_bindings(budgets, mutated_manifest, expected))
    mutated_manifest = copy.deepcopy(budget_manifest); mutated_manifest["totals"]["decoded_logical_bytes"] = 268435457; mutated_manifest["manifest_payload_sha256"] = v11.payload_hash("artifact-budget-manifest", mutated_manifest, "manifest_payload_sha256")
    record("PREDISPATCH_BUDGET_DECODED_CAP", v11.validate_live_budget_bindings(budgets, mutated_manifest, expected))
    tampered_records = copy.deepcopy(control_records); tampered_records[0]["expected_bytes"] += b"x"
    record("CONTROL_FILE_TAMPER", v11.validate_control_file_identities(ROOT.resolve(), tampered_records))
    missing_records = copy.deepcopy(control_records); missing_records[0]["ref"] = "missing.json"
    record("CONTROL_FILE_MISSING", v11.validate_control_file_identities(ROOT.resolve(), missing_records))
    duplicate_records = copy.deepcopy(control_records); duplicate_records[1]["ref"] = duplicate_records[0]["ref"]
    record("CONTROL_FILE_DUPLICATE", v11.validate_control_file_identities(ROOT.resolve(), duplicate_records))
    record("PREDISPATCH_FRESHNESS_OMITTED", v11.validate_immediate_predispatch_freshness(None, fixtures["request"], fixtures["capability"], fixtures["authority"], fixtures["marker"]))
    mutated_freshness = copy.deepcopy(freshness); mutated_freshness["request_sha256"] = "0" * 64; mutated_freshness["receipt_payload_sha256"] = v11.payload_hash("predispatch-freshness-receipt", mutated_freshness, "receipt_payload_sha256")
    record("PREDISPATCH_FRESHNESS_LINEAGE", v11.validate_immediate_predispatch_freshness(mutated_freshness, fixtures["request"], fixtures["capability"], fixtures["authority"], fixtures["marker"]))
    mutated_freshness = copy.deepcopy(freshness); mutated_freshness["full_validation_completed_at_utc"] = "2026-07-17T00:02:00Z"; mutated_freshness["receipt_payload_sha256"] = v11.payload_hash("predispatch-freshness-receipt", mutated_freshness, "receipt_payload_sha256")
    record("PREDISPATCH_FRESHNESS_STALE_VALIDATION", v11.validate_immediate_predispatch_freshness(mutated_freshness, fixtures["request"], fixtures["capability"], fixtures["authority"], fixtures["marker"]))
    mutated_freshness = copy.deepcopy(freshness); mutated_freshness["dispatch_boundary_platform_time_utc"] = "2026-07-17T00:02:08Z"; mutated_freshness["receipt_payload_sha256"] = v11.payload_hash("predispatch-freshness-receipt", mutated_freshness, "receipt_payload_sha256")
    record("PREDISPATCH_FRESHNESS_DISPATCH_DELAY", v11.validate_immediate_predispatch_freshness(mutated_freshness, fixtures["request"], fixtures["capability"], fixtures["authority"], fixtures["marker"]))
    mutated_freshness = copy.deepcopy(freshness); mutated_freshness["full_validation_completed_at_utc"] = "2026-07-17T00:02:41Z"; mutated_freshness["post_validation_platform_time_utc"] = "2026-07-17T00:02:41Z"; mutated_freshness["dispatch_boundary_platform_time_utc"] = "2026-07-17T00:02:41Z"; mutated_freshness["receipt_payload_sha256"] = v11.payload_hash("predispatch-freshness-receipt", mutated_freshness, "receipt_payload_sha256")
    record("PREDISPATCH_FRESHNESS_EXPIRED", v11.validate_immediate_predispatch_freshness(mutated_freshness, fixtures["request"], fixtures["capability"], fixtures["authority"], fixtures["marker"]))
    mutated_freshness = copy.deepcopy(freshness); mutated_freshness["action_occurrence_claim"] = True; mutated_freshness["receipt_payload_sha256"] = v11.payload_hash("predispatch-freshness-receipt", mutated_freshness, "receipt_payload_sha256")
    record("PREDISPATCH_FRESHNESS_FALSE_ACTION_CLAIM", v11.validate_immediate_predispatch_freshness(mutated_freshness, fixtures["request"], fixtures["capability"], fixtures["authority"], fixtures["marker"]))
    mutated_freshness = copy.deepcopy(freshness); mutated_freshness["receipt_payload_sha256"] = "0" * 64
    record("PREDISPATCH_FRESHNESS_PAYLOAD", v11.validate_immediate_predispatch_freshness(mutated_freshness, fixtures["request"], fixtures["capability"], fixtures["authority"], fixtures["marker"]))
    return {"baseline_findings": baseline, "total": len(rows), "rejected": sum(row["rejected"] for row in rows),
            "survivors": [row["name"] for row in rows if not row["rejected"]], "rows": rows}


def root_backed_budget_fixture_test(contract: dict[str, Any]) -> dict[str, Any]:
    fixture_root = ROOT / "fixtures" / "budget-root"
    manifest = load(fixture_root / "ARTIFACT_BUDGET_MANIFEST.json")
    protected_current = {"phase": "AFTER", "terminal": "PASS", "run_root_observation": {
        "regular_file_count": 2, "regular_file_bytes": 1555, "symlink_count": 0,
        "nonregular_count": 0, "multi_link_regular_file_count": 0, "path_sets_equal": True,
    }}
    baseline = v11.validate_budget_manifest(manifest, root=fixture_root, budgets=contract["budgets"]["campaign"],
                                            protected_after=protected_current, require_reserved_absent=True)
    rows: list[dict[str, Any]] = []
    for name, field, value in (("PROTECTED_CURRENT_FILE_COUNT", "regular_file_count", 1),
                               ("PROTECTED_CURRENT_BYTE_COUNT", "regular_file_bytes", 1554)):
        mutated = copy.deepcopy(protected_current); mutated["run_root_observation"][field] = value
        codes = v11.validate_budget_manifest(manifest, root=fixture_root, budgets=contract["budgets"]["campaign"],
                                             protected_after=mutated, require_reserved_absent=True)
        rows.append({"name": name, "rejected": bool(codes), "first_code": codes[0] if codes else None})
    return {"baseline_findings": baseline, "total": len(rows), "rejected": sum(row["rejected"] for row in rows),
            "survivors": [row["name"] for row in rows if not row["rejected"]], "rows": rows}


def summary_authority_mutations(fixtures: dict[str, Any]) -> dict[str, Any]:
    request = fixtures["request"]; capability = fixtures["capability"]; authority = fixtures["authority"]; marker = fixtures["marker"]
    summary = {"packet_id": request["packet_id"], "packet_core_population_sha256": request["packet_core_population_sha256"], "trial_id": request["trial_id"], "generation_id": request["generation_id"],
               "authority_lineage": {"request_sha256": compact.sha256_bytes(compact.canonical_bytes(request)), "capability_sha256": compact.sha256_bytes(compact.canonical_bytes(capability)),
                                     "authority_sha256": compact.sha256_bytes(compact.canonical_bytes(authority)), "marker_sha256": compact.sha256_bytes(compact.canonical_bytes(marker)),
                                     "fresh_v1_1_only": True, "live_sender_attestation_observed": True, "one_use_marker_observed": True}}
    baseline = v11.validate_summary_authority_lineage(summary, request, capability, authority, marker)
    rows: list[dict[str, Any]] = []
    def run(name: str, mutate: Callable[[dict[str, Any], dict[str, Any], dict[str, Any], dict[str, Any], dict[str, Any]], None]) -> None:
        s, r, c, a, m = (copy.deepcopy(value) for value in (summary, request, capability, authority, marker)); mutate(s, r, c, a, m); codes = v11.validate_summary_authority_lineage(s, r, c, a, m); rows.append({"name": name, "rejected": bool(codes), "first_code": codes[0] if codes else None})
    run("SUMMARY_REQUEST_HASH", lambda s,r,c,a,m: s["authority_lineage"].__setitem__("request_sha256", "0"*64))
    run("SUMMARY_CAPABILITY_HASH", lambda s,r,c,a,m: s["authority_lineage"].__setitem__("capability_sha256", "0"*64))
    run("SUMMARY_AUTHORITY_HASH", lambda s,r,c,a,m: s["authority_lineage"].__setitem__("authority_sha256", "0"*64))
    run("SUMMARY_MARKER_HASH", lambda s,r,c,a,m: s["authority_lineage"].__setitem__("marker_sha256", "0"*64))
    run("SUMMARY_PACKET_CORE", lambda s,r,c,a,m: s.__setitem__("packet_core_population_sha256", "f"*64))
    run("SUMMARY_MARKER_CHAIN", lambda s,r,c,a,m: m.__setitem__("authority_sha256", "0"*64))
    return {"baseline_findings": baseline, "total": len(rows), "rejected": sum(row["rejected"] for row in rows), "survivors": [row["name"] for row in rows if not row["rejected"]], "rows": rows}


def atomic_marker_static_test(fixtures: dict[str, Any]) -> dict[str, Any]:
    """Read-only proof that the production helper is fail-closed and exclusive."""
    source = inspect.getsource(v11.create_launch_marker_exclusive)
    marker_findings = v11.validate_launch_marker(fixtures["marker"], fixtures["request"], fixtures["capability"], fixtures["authority"], fixtures["observed_now_utc"])
    required_fragments = ("os.O_CREAT", "os.O_EXCL", "os.O_NOFOLLOW", "os.open", "FileExistsError", "MARKER_CREATE:PREEXISTING", "never cleaned up")
    missing = [fragment for fragment in required_fragments if fragment not in source]
    return {"pass": not marker_findings and not missing, "marker_findings": marker_findings, "missing_source_fragments": missing,
            "helper_source_sha256": compact.sha256_bytes(source.encode("utf-8")), "filesystem_writes": 0}


def structural_fixture() -> tuple[dict[str, Any], dict[str, Any], list[dict[str, Any]], dict[str, bytes]]:
    source_bytes = {"Plans/A.md": b"A" * 10, "Plans/B.json": b"{}"}
    specs = [("Plans", "directory", 493, None, None, "canonical", None, False, None, "canonical_default"),
             ("Plans/A.md", "regular_file", 420, 10, compact.sha256_bytes(source_bytes["Plans/A.md"]), "canonical", "active_normative_prose", True, "markdown", "canonical_default"),
             ("Plans/B.json", "regular_file", 420, 2, compact.sha256_bytes(source_bytes["Plans/B.json"]), "canonical", "active_machine_contract", True, "json", "canonical_default"),
             ("Plans/.audits/evidence.json", "regular_file", 420, 2, compact.sha256_bytes(b"{}"), "audit", "ledger_audit_pipeline_or_concept_source", False, "json", "audit")]
    rows = []
    for path, kind, mode, size, digest, path_class, role, semantic, parser, rule in specs:
        physical = {"path": path, "entry_kind": kind, "mode": mode, "bytes": size, "sha256": digest, "link_count": 1, "symlink_target_bytes": None, "symlink_target_sha256": None, "nonregular_type": None, "nonregular_rdev": None}
        physical_hash = compact.source_hash("physical-leaf", physical)
        classification = {"physical_leaf_sha256": physical_hash, "path_class": path_class, "artifact_role": role, "semantic_authority": semantic, "parser": parser, "classification_rule_id": rule}
        rows.append({**physical, **classification, "classification_leaf_sha256": compact.source_hash("classification-leaf", classification)})
    rows.sort(key=lambda row: row["path"].encode("utf-8"))
    absent = ROOT.parent / "structural-fixture-absent"
    bundle = compact.build_source_bundle(PLANS, absent, "trial.fixture", "generation.fixture", "0"*64, created_at_utc="2026-07-17T00:00:00Z", scan_a_rows=rows, scan_b_rows=copy.deepcopy(rows))
    active = BASE_VALIDATOR.minimal_fixtures()[0]
    classes = []
    for path_class in ("generated", "governance_support", "source_lineage", "audit", "retired", "unknown"):
        members = [row for row in rows if row["path_class"] == path_class]
        classes.append({"path_class": path_class, "entry_count": len(members), "population_sha256": compact.source_hash("path-class-population", [path_class, [row["classification_leaf_sha256"] for row in members]]), "semantic_reread": False})
    wrapper = {"schema_version": "1.1.0", "packet_id": compact.PACKET_ID, "trial_id": "trial.fixture", "generation_id": "generation.fixture",
               "source_snapshot_sha256": compact.sha256_bytes(compact.canonical_bytes(bundle["root"])), "source_population_sha256": bundle["root"]["population_sha256"], "source_physical_population_sha256": bundle["root"]["physical_population_sha256"], "source_classification_population_sha256": bundle["root"]["classification_population_sha256"],
               "source_counts": bundle["root"]["counts"], "canonical_population_count": 2, "noncanonical_class_commitments": classes, "active_structural_map": active,
               "active_structural_map_sha256": compact.identity_hash("v1-active-structural-map", active), "clean_rebuild_sha256": compact.identity_hash("v1.1-structural-clean-rebuild", active), "terminal": "PASS"}
    return wrapper, bundle["root"], rows, source_bytes


def structural_mutations() -> dict[str, Any]:
    wrapper, source, rows_source, source_bytes = structural_fixture()
    baseline = v11.validate_structural_wrapper(wrapper, source, rows_source, source_bytes)
    rows = []
    def run(name: str, change: Callable[[dict[str, Any]], None]) -> None:
        value = copy.deepcopy(wrapper); change(value); codes = v11.validate_structural_wrapper(value, source, rows_source, source_bytes); rows.append({"name": name, "rejected": bool(codes), "first_code": codes[0] if codes else None})
    mutations = [
        ("SOURCE_RECEIPT", lambda x: x.__setitem__("source_snapshot_sha256", "0"*64)),
        ("SOURCE_POPULATION", lambda x: x.__setitem__("source_population_sha256", "0"*64)),
        ("PHYSICAL_POPULATION", lambda x: x.__setitem__("source_physical_population_sha256", "0"*64)),
        ("CLASSIFICATION_POPULATION", lambda x: x.__setitem__("source_classification_population_sha256", "0"*64)),
        ("SOURCE_COUNTS", lambda x: x["source_counts"].__setitem__("entry_count", 999)),
        ("CANONICAL_COUNT", lambda x: x.__setitem__("canonical_population_count", 3)),
        ("NONCANONICAL_COUNT", lambda x: x["noncanonical_class_commitments"][3].__setitem__("entry_count", 0)),
        ("NONCANONICAL_ROOT", lambda x: x["noncanonical_class_commitments"][3].__setitem__("population_sha256", "0"*64)),
        ("NONCANONICAL_REREAD", lambda x: x["noncanonical_class_commitments"][3].__setitem__("semantic_reread", True)),
        ("ACTIVE_HASH", lambda x: x.__setitem__("active_structural_map_sha256", "0"*64)),
        ("CLEAN_REBUILD", lambda x: x.__setitem__("clean_rebuild_sha256", "0"*64)),
        ("ACTIVE_POPULATION_MODE", lambda x: x["active_structural_map"]["population"][0].__setitem__("mode", 384)),
    ]
    for name, change in mutations: run(name, change)
    return {"baseline_findings": baseline, "total": len(rows), "rejected": sum(row["rejected"] for row in rows), "survivors": [row["name"] for row in rows if not row["rejected"]], "rows": rows}


def main() -> int:
    gate_rows: list[dict[str, Any]] = []
    def gate(name: str, passed: bool, detail: Any = None) -> None: gate_rows.append({"gate": name, "passed": bool(passed), "detail": detail})

    contract = load(ROOT / "ROLLING_TRIAL_CONTRACT.json")
    for schema_path in sorted(ROOT.glob("*.schema.json")):
        try: Draft202012Validator.check_schema(load(schema_path)); gate(f"SCHEMA:{schema_path.name}", True)
        except Exception as exc: gate(f"SCHEMA:{schema_path.name}", False, str(exc))
    contract_codes = contract_findings(contract); gate("V1_1_CONTRACT", not contract_codes, contract_codes)
    core_rows, core_sha = packet_core(); observed_core_dirs = compact.packet_directories(ROOT)
    gate("PACKET_CORE_EXACT", {row["path"] for row in core_rows} == CORE_FILES and len(core_rows) == len(CORE_FILES) and observed_core_dirs == compact.PACKET_CORE_DIRECTORIES,
         {"expected": len(CORE_FILES), "actual": len(core_rows), "extra": sorted({row["path"] for row in core_rows} - CORE_FILES), "missing": sorted(CORE_FILES - {row["path"] for row in core_rows}),
          "directory_extra": sorted(observed_core_dirs - compact.PACKET_CORE_DIRECTORIES), "directory_missing": sorted(compact.PACKET_CORE_DIRECTORIES - observed_core_dirs)})
    gate("PACKET_CORE_BOUNDED", len(core_rows) <= 32 and sum(row["bytes"] for row in core_rows) <= 2 * 1024 * 1024, {"files": len(core_rows), "bytes": sum(row["bytes"] for row in core_rows), "sha256": core_sha})
    base_result = run_base_packet(); gate("IMMUTABLE_V1_PACKET", base_result["exit_code"] == 0 and base_result["terminal"] == "PASS" and base_result["surviving_mutations"] == 0, base_result)
    gate("IMMUTABLE_V1_CONTRACT", sha(BASE / "ROLLING_TRIAL_CONTRACT.json") == contract["base_packet"]["contract_sha256"])
    gate("IMMUTABLE_V1_CORE", base_result["live_core_population_sha256"] == contract["base_packet"]["core_population_sha256"] == "7c9769b154e7166f0b23f7ce17dc0754b0a92493ae984f80930e1e662e9ee592", base_result["live_core_population_sha256"])
    handoff_sha = sha(V1_RUN / "ROOT_TERMINAL_HANDOFF.json"); fuse_sha = sha(V1_RUN / "PREFLIGHT_FUSE_PROJECTION.json")
    handoff = load(V1_RUN / "ROOT_TERMINAL_HANDOFF.json"); fuse = load(V1_RUN / "PREFLIGHT_FUSE_PROJECTION.json")
    gate("V1_STOP_IMMUTABLE", handoff_sha == contract["v1_stop_lineage"]["root_terminal_handoff_sha256"] and fuse_sha == contract["v1_stop_lineage"]["preflight_fuse_projection_sha256"] and handoff["terminal"] == "BUDGET_STOP" and handoff["reason_code"] == "PREFLIGHT_ARTIFACT_FUSE")
    historical = historical_v1_replay(); expected_historical = contract["backtest_requirements"]["historical_v1_population"]
    gate("HISTORICAL_V1_SOURCE_REPLAY", historical == {"entry_count": expected_historical["entry_count"], "regular_file_count": expected_historical["regular_file_count"], "directory_entry_count": expected_historical["directory_entry_count"], "population_sha256": expected_historical["legacy_population_sha256"]}, historical)
    gate("HISTORICAL_V1_PROTECTED_IDENTITY", fuse["protected_before_projection"]["state_payload_sha256"] == contract["backtest_requirements"]["historical_v1_protected_state_sha256"])
    gate("FUTURE_RUN_ABSENT", not FUTURE_RUN.exists())
    source_bundle = compact.build_source_bundle(PLANS, FUTURE_RUN, "packet-backtest", "generation-001", core_sha, created_at_utc="2026-07-17T00:00:00Z")
    source_codes = v11.validate_source_bundle(source_bundle["root"], source_bundle["shards"], expected_packet_core_sha256=core_sha)
    gate("CURRENT_COMPACT_SOURCE", not source_codes, {"findings": source_codes, "counts": source_bundle["root"]["counts"], "canonical_bytes": source_bundle["canonical_bytes"], "largest_artifact_bytes": source_bundle["largest_artifact_bytes"]})
    source_budget = contract["representation_contract"]["source_snapshot"]
    root_bytes = len(compact.canonical_bytes(source_bundle["root"])); shard_sizes = [len(compact.canonical_bytes(row)) for row in source_bundle["shards"]]
    gate("SOURCE_FUSES", root_bytes <= source_budget["root_receipt_bytes_maximum"] and max(shard_sizes) <= source_budget["bucket_shard_bytes_maximum_each"] and source_bundle["canonical_bytes"] <= source_budget["snapshot_family_bytes_maximum"], {"root_bytes": root_bytes, "largest_shard_bytes": max(shard_sizes), "family_bytes": source_bundle["canonical_bytes"]})
    repair_payload = contract["repair_payload_sha256"]
    effective_contract = compact.identity_hash("effective-contract", [contract["base_packet"]["contract_sha256"], repair_payload])
    protected = compact.build_protected_receipt(REPO, FUTURE_RUN, source_bundle["root"], contract["stable_runtime_bound_inputs"], effective_contract, core_sha, "packet-backtest", "generation-001", captured_at_utc="2026-07-17T00:00:00Z")
    protected_codes = v11.validate_protected_state(protected, source_bundle["root"], effective_contract)
    protected_bytes = len(compact.canonical_bytes(protected))
    gate("CURRENT_COMPACT_PROTECTED", not protected_codes and protected_bytes <= contract["representation_contract"]["protected_state"]["receipt_bytes_maximum_each"], {"findings": protected_codes, "canonical_bytes": protected_bytes, "invariance_payload_sha256": protected["invariance_payload_sha256"]})
    authority_fixture = authority_fixtures(core_sha, contract, effective_contract, source_bundle["root"], protected)
    authority_baseline = authority_mutations(authority_fixture)
    gate("LAUNCH_CHAIN_POSITIVE_FIXTURE", not authority_baseline["baseline_findings"], authority_baseline["baseline_findings"])
    live_root_test = live_root_binding_mutations()
    gate("LIVE_ROOT_BINDING_POSITIVE_FIXTURE", not live_root_test["baseline_findings"], live_root_test["baseline_findings"])
    predispatch_test = predispatch_boundary_mutations(core_sha, authority_fixture, contract)
    gate("LIVE_PREDISPATCH_BOUNDARY_POSITIVE_FIXTURE", not predispatch_test["baseline_findings"], predispatch_test["baseline_findings"])
    root_budget_test = root_backed_budget_fixture_test(contract)
    gate("ROOT_BACKED_BUDGET_POSITIVE_FIXTURE", not root_budget_test["baseline_findings"], root_budget_test["baseline_findings"])
    atomic_marker = atomic_marker_static_test(authority_fixture); gate("ATOMIC_ONE_USE_MARKER_STATIC_PROOF", atomic_marker["pass"], atomic_marker)
    summary_test = summary_authority_mutations(authority_fixture); gate("SUMMARY_AUTHORITY_POSITIVE_FIXTURE", not summary_test["baseline_findings"], summary_test["baseline_findings"])
    structural_test = structural_mutations(); gate("STRUCTURAL_WRAPPER_POSITIVE_FIXTURE", not structural_test["baseline_findings"], structural_test["baseline_findings"])
    canonical_rows = [row for row in source_bundle["rows"] if row["path_class"] == "canonical" and row["entry_kind"] == "regular_file"]
    canonical_projection = compact.canonical_bytes([{key: row[key] for key in ("path", "mode", "bytes", "sha256", "artifact_role", "semantic_authority", "parser")} for row in canonical_rows])
    all_regular_projection = compact.canonical_bytes([{key: row[key] for key in ("path", "mode", "bytes", "sha256", "path_class")} for row in source_bundle["rows"] if row["entry_kind"] == "regular_file"])
    gate("STRUCTURAL_DEDUP_PROJECTION", len(canonical_projection) <= 1048576 and len(canonical_projection) < len(all_regular_projection), {"canonical_regular_files": len(canonical_rows), "canonical_population_bytes": len(canonical_projection), "all_regular_population_bytes": len(all_regular_projection)})
    self_test = v11.run_self_tests(); gate("V1_1_SELF_TEST", self_test["terminal"] == "PASS", self_test)
    source_mutations = mutate_source(source_bundle["root"], source_bundle["shards"], core_sha); gate("SOURCE_MUTATIONS", source_mutations["rejected"] == source_mutations["total"], {key: source_mutations[key] for key in ("total", "rejected", "survivors")})
    contract_mutation = contract_mutations(contract); gate("CONTRACT_MUTATIONS", contract_mutation["rejected"] == contract_mutation["total"], {key: contract_mutation[key] for key in ("total", "rejected", "survivors")})
    protected_mutation = protected_mutations(protected, source_bundle["root"], effective_contract); gate("PROTECTED_MUTATIONS", protected_mutation["rejected"] == protected_mutation["total"], {key: protected_mutation[key] for key in ("total", "rejected", "survivors")})
    budget_mutation = budget_mutations(contract["budgets"]["campaign"]); gate("BUDGET_MUTATIONS", budget_mutation["rejected"] == budget_mutation["total"], {key: budget_mutation[key] for key in ("total", "rejected", "survivors")})
    gate("LAUNCH_CHAIN_MUTATIONS", authority_baseline["rejected"] == authority_baseline["total"], {key: authority_baseline[key] for key in ("total", "rejected", "survivors")})
    gate("LIVE_ROOT_BINDING_MUTATIONS", live_root_test["rejected"] == live_root_test["total"], {key: live_root_test[key] for key in ("total", "rejected", "survivors")})
    gate("LIVE_PREDISPATCH_BOUNDARY_MUTATIONS", predispatch_test["rejected"] == predispatch_test["total"], {key: predispatch_test[key] for key in ("total", "rejected", "survivors")})
    gate("ROOT_BACKED_BUDGET_MUTATIONS", root_budget_test["rejected"] == root_budget_test["total"], {key: root_budget_test[key] for key in ("total", "rejected", "survivors")})
    gate("SUMMARY_AUTHORITY_MUTATIONS", summary_test["rejected"] == summary_test["total"], {key: summary_test[key] for key in ("total", "rejected", "survivors")})
    gate("STRUCTURAL_WRAPPER_MUTATIONS", structural_test["rejected"] == structural_test["total"], {key: structural_test[key] for key in ("total", "rejected", "survivors")})
    raw_old = {"schema_version": "1.0.0", "entries": [{"path": "Plans/A.md"}]}; base64_old = {"encoding": "base64", "data": "AA=="}
    gate("OLD_RAW_BASE64_REJECTED", bool(v11.schema_findings("source", raw_old)) and compact.receipt_contains_forbidden_raw(base64_old))
    stale_v1_request_schema = load(BASE / "LAUNCH_REQUEST.schema.json")
    gate("STALE_V1_AUTHORITY_SCHEMA_SEPARATION", stale_v1_request_schema.get("properties", {}).get("schema_version", {}).get("const") == "1.0.0" and v11.SCHEMA_OBJECTS["launch_request"]["properties"]["schema_version"]["const"] == "1.1.0")
    gate("BOUND_INPUTS_STABLE", all(Path(row["path"]).is_file() and Path(row["path"]).stat().st_size == row["bytes"] and sha(Path(row["path"])) == row["sha256"] for row in contract["stable_runtime_bound_inputs"]))
    historical_only = contract["historical_lineage_only_bindings"]
    gate("EPHEMERAL_F3_LINEAGE_ONLY", len(historical_only) == 4 and all(row["runtime_presence_required"] is False and row["semantic_worker_visibility"] is False for row in historical_only))
    gate("NO_TRIAL_OR_NETWORK", not FUTURE_RUN.exists(), {"trial_launches": 0, "semantic_workers": 0, "model_calls": 0, "network_calls": 0})
    mutation_rejected = source_mutations["rejected"] + contract_mutation["rejected"] + protected_mutation["rejected"] + budget_mutation["rejected"] + authority_baseline["rejected"] + live_root_test["rejected"] + predispatch_test["rejected"] + root_budget_test["rejected"] + summary_test["rejected"] + structural_test["rejected"]
    mutation_total = source_mutations["total"] + contract_mutation["total"] + protected_mutation["total"] + budget_mutation["total"] + authority_baseline["total"] + live_root_test["total"] + predispatch_test["total"] + root_budget_test["total"] + summary_test["total"] + structural_test["total"]
    mutation_survivors = source_mutations["survivors"] + contract_mutation["survivors"] + protected_mutation["survivors"] + budget_mutation["survivors"] + authority_baseline["survivors"] + live_root_test["survivors"] + predispatch_test["survivors"] + root_budget_test["survivors"] + summary_test["survivors"] + structural_test["survivors"]
    current_receipt_backtest = {"entry_count": source_bundle["root"]["counts"]["entry_count"], "regular_file_count": source_bundle["root"]["counts"]["regular_file_count"], "directory_entry_count": source_bundle["root"]["counts"]["directory_entry_count"],
                                "symlink_count": source_bundle["root"]["counts"]["symlink_count"], "nonregular_count": source_bundle["root"]["counts"]["nonregular_count"], "unknown_classification_count": source_bundle["root"]["counts"]["unknown_classification_count"],
                                "compact_source_family_canonical_bytes": source_bundle["canonical_bytes"], "compact_source_largest_artifact_bytes": source_bundle["largest_artifact_bytes"], "compact_source_root_bytes": root_bytes,
                                "compact_protected_receipt_bytes": protected_bytes, "protected_invariance_payload_sha256": protected["invariance_payload_sha256"], "canonical_structural_regular_files": len(canonical_rows),
                                "canonical_structural_population_bytes": len(canonical_projection), "all_regular_population_bytes": len(all_regular_projection), "terminal": "PASS",
                                "note": "Live counts and state commitments are backtest observations, not frozen inputs for a future trial. A trial must capture fresh receipts."}
    terminal_codes = terminal_receipt_findings(core_rows, core_sha, contract, effective_contract, len(gate_rows) + 1, mutation_total, current_receipt_backtest)
    gate("TERMINAL_RECEIPT_BINDINGS", not terminal_codes, terminal_codes)
    all_pass = all(row["passed"] for row in gate_rows)
    result = {
        "schema_version": "1.0.0", "packet_id": compact.PACKET_ID,
        "terminal": "PASS" if all_pass else "FAIL", "ready_terminal": "READY_FOR_TRIAL_AUTHORIZATION" if all_pass else "REVISE",
        "packet_core_population_sha256": core_sha, "packet_core_file_count": len(core_rows), "packet_core_bytes": sum(row["bytes"] for row in core_rows), "packet_core": core_rows,
        "effective_contract_sha256": effective_contract, "repair_payload_sha256": repair_payload,
        "gates_passed": sum(row["passed"] for row in gate_rows), "gates_total": len(gate_rows), "gates": gate_rows,
        "negative_mutations_rejected": mutation_rejected,
        "negative_mutations_total": mutation_total,
        "surviving_mutations": mutation_survivors,
        "historical_v1_replay": historical,
        "current_backtest": {"source_counts": source_bundle["root"]["counts"], "source_snapshot_canonical_bytes": source_bundle["canonical_bytes"], "source_largest_artifact_bytes": source_bundle["largest_artifact_bytes"], "protected_canonical_bytes": protected_bytes, "protected_invariance_payload_sha256": protected["invariance_payload_sha256"], "canonical_structural_regular_files": len(canonical_rows), "canonical_structural_population_bytes": len(canonical_projection), "all_regular_population_bytes": len(all_regular_projection)},
        "resource_use": {"trial_launches": 0, "semantic_workers": 0, "model_calls": 0, "network_calls": 0},
        "claim_boundary": "packet and local representation/launch-harness readiness only; no trial, Plan, product, buildability, implementation, runtime, or governance claim",
    }
    print(json.dumps(result, sort_keys=True, separators=(",", ":")))
    return 0 if all_pass else 1


if __name__ == "__main__":
    raise SystemExit(main())
