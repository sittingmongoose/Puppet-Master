#!/usr/bin/env python3
"""Independent zero-authority stabilization fault harness for iteration_011.

This program is deliberately outside the four-part component.  It never imports
the component and uses runner.py only through its public process CLI.  All
mutations occur in isolated copies.  Receipts are observations, not exit or
qualification authority.
"""

from __future__ import annotations

import argparse
import ast
import base64
import binascii
import ctypes
import datetime
import hashlib
import importlib.util
import json
import os
import pathlib
import platform
import re
import select
import shutil
import signal
import stat
import subprocess
import sys
import tarfile
import tempfile
import time
from contextlib import contextmanager
from typing import Any, Callable, Iterable


SCHEMA = "pw-r9-iteration-011-independent-stabilization-fault-harness-v1"
RECEIPT_SCHEMA = "pw-r9-independent-stabilization-test-receipt-v1"
AGGREGATE_SCHEMA = "pw-r9-independent-stabilization-aggregate-receipt-v1"
SIGNAL_SCHEMA = "pw-r9-external-signal-receipt-v1"
HARNESS_INITIATED_CALL_COUNTS = {
    "collaboration": 0,
    "model": 0,
    "network": 0,
    "provider": 0,
    "subject": 0,
}
CALL_SCOPE = "HARNESS_CONSTRUCTED_OR_DIRECTLY_INVOKED_CODE_PATHS_ONLY"
HOST_ACTIVITY_RESIDUAL = (
    "Host, kernel, filesystem, Git implementation, Python runtime, and platform activity "
    "outside harness-constructed subprocesses is not observable by this program."
)
ZERO_AUTHORITY = {
    "candidate_mint": False,
    "exit": False,
    "formal_audit": False,
    "freeze": False,
    "goal_completion": False,
    "launch": False,
    "qualification_claim": False,
    "release": False,
}

COMPONENT_FILES = {
    "semantic_bundle.json": (
        "IMMUTABLE_SEMANTIC_BUNDLE",
        "11139c2b52a2fe900f2976a34f7712d8f05d5b2991ce8cc26d5cfc4e1ef871c2",
        786546,
    ),
    "runner.py": (
        "PROCESS_RUNNER",
        "978a56db31b133c2d5e1ac42fe3aea647ac2dbce5543e7959082f1032f74d343",
        58678,
    ),
    "evidence_recorder.py": (
        "APPEND_ONLY_EVIDENCE_RECORDER",
        "7f8ca2d19750a65ac71b711f13ed4fb1205eab0711b945463561a5f3f35a9e52",
        39866,
    ),
    "offline_verifier.py": (
        "OFFLINE_VERIFIER",
        "b678b4d826e6d02b32458ffc0d71970c3f01ef677bc8a20029d616fc77a1c0e4",
        94910,
    ),
}
ROLE_ORDER = (
    "APPEND_ONLY_EVIDENCE_RECORDER",
    "IMMUTABLE_SEMANTIC_BUNDLE",
    "OFFLINE_VERIFIER",
    "PROCESS_RUNNER",
)
EXPECTED_COMPONENT_IDENTITY = {
    "schema_id": "pw-r9-four-part-component-identity-v1",
    "part_count": 4,
    "aggregate_file_bytes": 980000,
    "rows_sha256": "ff578dae20cf54d1fefd4b2f743731f776b285fdf6b285effa1c6b8b480d8b88",
    "rows_bytes": 494,
    "parts": [
        {
            "role": role,
            "sha256": next(value[1] for value in COMPONENT_FILES.values() if value[0] == role),
            "bytes": next(value[2] for value in COMPONENT_FILES.values() if value[0] == role),
        }
        for role in ROLE_ORDER
    ],
}
BUILD_CONTRACT = (
    "iteration_011_build_contract_v1.json",
    "991a3cd5be7c2f73f0aef2f1759634f5eb6a440d3430db31db295d7c24e9756b",
    12509,
)
SHARED = (
    (
        "OPERATING_CONTRACT",
        "r9_goal_operating_contract_v1.json",
        "764dd27b3f472a90eef0f8493e63ac8fb349fe05a3a97dc4673a4a835e6e8dbd",
        7024,
    ),
    (
        "SUBJECT_TRANSPORT_ADDENDUM",
        "r9_subject_transport_addendum_subagent_invocations_v1.json",
        "7b5186b3c9f244488a75695b34b0d06e79ee6b720acb934fc3767315c4b005d8",
        5909,
    ),
    (
        "ROUTE_CAPABILITY_RECEIPT",
        "r9_subject_transport_subagent_route_capability_receipt_v1.json",
        "3d523eac087e691b2336a6ab878dbfe64b8359891831dc866641039f97f8646a",
        4780,
    ),
)
FAMILY_MAP_SHA256 = "9e9dffdfed6cf4571a9429c5d04f0364666dbdd1771a6651464eb9bc5c6a9346"
FAMILY_MAP_BYTES = 15365
GLOBAL_MAP_SHA256 = "ec8675286bd51b612afb9e0960e5d23c60630a0cdd9015d950df7b9bb5ce50a6"
GLOBAL_MAP_BYTES = 1947
PROCESS_IDS = (
    "STOP_BEFORE_ADMISSION",
    "STOP_AFTER_ATTEMPT",
    "STOP_AFTER_RECEIPT",
    "REPEATED_SIGNALS_SAFE_DRAIN",
    "HARD_LOSS_AFTER_REQUEST",
    "RAW_PREFIX_REOPEN_INVALID",
    "COMPLETION_PREFIX_REOPEN_INVALID",
    "SAME_ROOT_REINVOKE_ZERO_REQUEST",
    "ROOT_EOF_TRAILING_BYTES",
)
PROCESS_MAP_SHA256 = "d76f9db95468af5d17f5b1708eea4675b87d88db27b6435053a3f509cb62b187"
PROCESS_MAP_BYTES = 246
HARNESS_ARTIFACTS = {
    "process-fault-independent-xhigh-design.json": (
        "03179a00cbe449bf7d4f12e34f9b6d9915399d10821036038e8b532a9fe29ab0",
        21017,
    ),
    "process-fault-current-component-binding-addendum.json": (
        "dce3bfc28d355b3fe72b4063d716ce643e10ee9e0cafe74247cd637e167f304c",
        9259,
    ),
    "harness-predecessor-independent-xhigh-falsifier.json": (
        "bea13c80d1cbc4199840e42d07b76ca0d7f38271bd387707376bb2d05c2b77fd",
        22690,
    ),
    "regression-projection-predecessor-xhigh-falsifier.json": (
        "f114cd2d6ea7b0b4230e426e35e9df7cab8ebffc9f2421d9eb0dbc0e1728ee03",
        3933,
    ),
    "full-regression-projection-successor-xhigh-falsifier.json": (
        "462119a9ac1691d68a8c4f794486e51daad48c19736f246d7e486c051b523baf",
        3141,
    ),
    "harness-successor-falsifier-cycle-001.json": (
        "dbd486e5304e674e440bc99a0e048d8ef4e899b42b884d7d5a3b6fb32e2ebefb",
        8933,
    ),
    "harness-successor-falsifier-cycle-002.json": (
        "ef4b13a75370526c1590d359e337a34e93440b444405487d7d1a40d3e897f7f9",
        9907,
    ),
    "process-oracle-churn-fault-tree.json": (
        "b30d27fb80e12751e5895dd46fae8b6e2abbe412294422b4e1892c1167afc65e",
        4193,
    ),
}
SUCCESSOR_HARNESS_ARTIFACTS = {
    "r9_progress_assessment_iteration_011_internal_cycle_014_v1.json": (
        "6056675cf3108d8f19365c5b5faa9289e9fbf7257d99feb281d4fc1234ccbfd2",
        5461,
    ),
}
BINDING_CENSUS = (
    "settled-component-identity-census.json",
    "37653b05475eddae32d54cca873e1d7c764d67e025e4f3c74b2f9188ad9167f6",
    2686,
)
_BOUND_PROCESS_DESIGN: dict[str, Any] | None = None
_ACTIVE_EXPERIMENT: dict[str, Any] | None = None
SCENARIOS = (
    "clean",
    "observed_tool",
    "observed_file",
    "observed_browse",
    "observed_network",
    "observed_delegation",
    "observed_memory",
    "observed_followup",
    "observed_nonterminal",
    "missing_spawn",
    "failed_spawn",
    "wrong_path",
    "wrong_sender",
    "wrong_type",
    "malformed_output",
    "partial_output",
    "missing_output",
    "delayed_multi_poll",
)
EXPECTED_SCENARIO_STATUS = {
    **{item: "VALID_SUBJECT_FAIL" for item in SCENARIOS[1:9]},
    **{item: "CONTROLLER_INVALID" for item in SCENARIOS[9:14]},
    "clean": "PASS",
    "malformed_output": "VALID_SUBJECT_FAIL",
    "partial_output": "VALID_SUBJECT_FAIL",
    "missing_output": "CONTROLLER_INVALID",
    "delayed_multi_poll": "PASS",
}
PUBLIC_COMMANDS = {"simulate", "run-canary", "run-matrix", "reopen"}
PUBLIC_COMMAND_ORDER = ("simulate", "run-canary", "run-matrix", "reopen")
SAFE_NAME = re.compile(r"[A-Za-z0-9][A-Za-z0-9_.-]{0,191}\Z")
HEX = re.compile(r"[0-9a-f]{64}\Z")
MAX_CAPTURE = 16 * 1024 * 1024
FRESH_SECONDS = 24 * 60 * 60


class HarnessError(RuntimeError):
    pass


class UnexpectedPrimary(HarnessError):
    pass


def canon(value: Any) -> bytes:
    try:
        return json.dumps(
            value,
            ensure_ascii=False,
            allow_nan=False,
            sort_keys=True,
            separators=(",", ":"),
        ).encode("utf-8")
    except (TypeError, ValueError, UnicodeEncodeError) as exc:
        raise HarnessError(f"not canonical JSON: {exc}") from exc


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def utc_now() -> str:
    return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="microseconds").replace(
        "+00:00", "Z"
    )


def require_absolute_directory(path: pathlib.Path, label: str) -> pathlib.Path:
    if not path.is_absolute() or ".." in path.parts:
        raise HarnessError(f"{label}: absolute lexical path required")
    current = pathlib.Path(path.anchor)
    for part in path.parts[1:]:
        current = current / part
        try:
            info = os.lstat(current)
        except FileNotFoundError as exc:
            raise HarnessError(f"{label}: missing: {current}") from exc
        if stat.S_ISLNK(info.st_mode):
            raise HarnessError(f"{label}: symlink ancestor forbidden: {current}")
    info = os.lstat(path)
    if not stat.S_ISDIR(info.st_mode):
        raise HarnessError(f"{label}: nonlink directory required")
    return path


def regular_bytes(path: pathlib.Path, label: str) -> bytes:
    try:
        before = os.lstat(path)
    except FileNotFoundError as exc:
        raise HarnessError(f"{label}: missing") from exc
    if stat.S_ISLNK(before.st_mode) or not stat.S_ISREG(before.st_mode):
        raise HarnessError(f"{label}: regular nonlink file required")
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    chunks: list[bytes] = []
    try:
        opened = os.fstat(fd)
        if not stat.S_ISREG(opened.st_mode) or (opened.st_dev, opened.st_ino) != (
            before.st_dev,
            before.st_ino,
        ):
            raise HarnessError(f"{label}: reopen identity mismatch")
        while True:
            chunk = os.read(fd, 1024 * 1024)
            if not chunk:
                break
            chunks.append(chunk)
    finally:
        os.close(fd)
    data = b"".join(chunks)
    after = os.lstat(path)
    if (after.st_dev, after.st_ino, after.st_size) != (
        before.st_dev,
        before.st_ino,
        before.st_size,
    ) or len(data) != before.st_size:
        raise HarnessError(f"{label}: changed during exact reopen")
    return data


def json_object_bytes(data: bytes, label: str, storage: bool = True) -> dict[str, Any]:
    payload = data
    if storage:
        if not data.endswith(b"\n") or data.endswith(b"\n\n") or b"\r" in data:
            raise HarnessError(f"{label}: exact one-LF storage required")
        payload = data[:-1]
    try:
        value = json.loads(payload.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise HarnessError(f"{label}: invalid JSON: {exc}") from exc
    if not isinstance(value, dict) or canon(value) != payload:
        raise HarnessError(f"{label}: canonical JSON object required")
    return value


def read_json(path: pathlib.Path, label: str) -> tuple[bytes, dict[str, Any]]:
    data = regular_bytes(path, label)
    return data, json_object_bytes(data, label)


def identity(data: bytes) -> dict[str, Any]:
    return {"sha256": sha(data), "bytes": len(data)}


def call_observation() -> dict[str, Any]:
    return {
        "scope": CALL_SCOPE,
        "counts": dict(HARNESS_INITIATED_CALL_COUNTS),
        "host_activity_residual": HOST_ACTIVITY_RESIDUAL,
    }


def bind_harness_artifacts() -> dict[str, Any]:
    """Bind every sealed/adjudicating artifact without granting it runtime authority."""
    global _BOUND_PROCESS_DESIGN
    root = pathlib.Path(__file__).resolve().parent
    values: dict[str, dict[str, Any]] = {}
    rows = []
    for name, (wanted_sha, wanted_bytes) in HARNESS_ARTIFACTS.items():
        data, value = read_json(root / name, f"harness artifact {name}")
        if (sha(data), len(data)) != (wanted_sha, wanted_bytes):
            raise HarnessError(f"harness artifact identity drift: {name}")
        values[name] = value
        rows.append({"path": name, **identity(data)})
    successor = root.parents[2]
    for name, (wanted_sha, wanted_bytes) in SUCCESSOR_HARNESS_ARTIFACTS.items():
        data, value = read_json(successor / name, f"successor harness artifact {name}")
        if (sha(data), len(data)) != (wanted_sha, wanted_bytes):
            raise HarnessError(f"successor harness artifact identity drift: {name}")
        values[name] = value
        rows.append({"path": f"successor-root/{name}", **identity(data)})
    census_data, census = read_json(root / BINDING_CENSUS[0], "settled component census")
    if (sha(census_data), len(census_data)) != (BINDING_CENSUS[1], BINDING_CENSUS[2]):
        raise HarnessError("settled component census identity drift")
    predecessor = values["regression-projection-predecessor-xhigh-falsifier.json"]
    successor = values["full-regression-projection-successor-xhigh-falsifier.json"]
    harness_falsifier = values["harness-predecessor-independent-xhigh-falsifier.json"]
    cycle_001_falsifier = values["harness-successor-falsifier-cycle-001.json"]
    cycle_002_falsifier = values["harness-successor-falsifier-cycle-002.json"]
    churn_fault_tree = values["process-oracle-churn-fault-tree.json"]
    progress = values["r9_progress_assessment_iteration_011_internal_cycle_014_v1.json"]
    addendum = values["process-fault-current-component-binding-addendum.json"]
    design = values["process-fault-independent-xhigh-design.json"]
    if predecessor.get("verdict") != "FAIL" or harness_falsifier.get("verdict") != "FAIL":
        raise HarnessError("predecessor FAIL evidence disposition drift")
    if cycle_001_falsifier.get("verdict") != "FAIL":
        raise HarnessError("cycle-001 successor falsifier FAIL disposition drift")
    if cycle_002_falsifier.get("verdict") != "FAIL":
        raise HarnessError("cycle-002 successor falsifier FAIL disposition drift")
    if churn_fault_tree.get("status") != "CHURN_DECLARED_MANUAL_SELECTIVE_PROCESS_ORACLE_SUBFAMILY_REJECTED_REPLACEMENT_REQUIRED":
        raise HarnessError("process-oracle churn decision drift")
    if progress.get("status") != "CHURN_DECLARED_NO_PROGRESS_CREDIT_MANUAL_PROCESS_ORACLE_SUBFAMILY_REJECTED_GOAL_ACTIVE":
        raise HarnessError("cycle-014 progress assessment drift")
    if successor.get("verdict") != "NOT_FALSIFIED_WITHIN_AUTHORIZED_SCOPE":
        raise HarnessError("successor regression projection PASS disposition drift")
    successor_pass = (
        successor.get("regression_projection", {}).get("baseline_runner_pass") is True
        and successor.get("regression_projection", {}).get("baseline_verifier_pass") is True
        and successor.get("mutation_testing", {}).get("admitted") == 0
        and successor.get("mutation_testing", {}).get("failures") == 0
        and successor.get("post_test_file_identities_unchanged") is True
    )
    if not successor_pass:
        raise HarnessError("successor regression projection PASS predicates drift")
    if addendum.get("verdict") != "ALL_NINE_PROCEDURES_REMAIN_APPLICABLE_WITH_FRESH_CURRENT_IDENTITY_BINDING":
        raise HarnessError("current-byte process addendum verdict drift")
    if addendum.get("applicability_summary") != {
        "applicable": 9,
        "blocked": 0,
        "component_change_required": False,
        "fresh_execution_required_for_evidence": 9,
        "identity_rebind_required": 9,
        "procedure_semantics_changed": 0,
        "required_faults": 9,
    }:
        raise HarnessError("current-byte process addendum applicability drift")
    fault_ids = [item.get("fault_id") for item in design.get("faults", [])]
    addendum_fault_ids = [item.get("fault_id") for item in addendum.get("fault_bindings", [])]
    if tuple(fault_ids) != PROCESS_IDS or tuple(addendum_fault_ids) != PROCESS_IDS:
        raise HarnessError("sealed/addendum process fault order drift")
    current_raw = addendum.get("current_component_identity", {})
    current = {
        "schema_id": current_raw.get("schema_id"),
        "part_count": current_raw.get("part_count"),
        "aggregate_file_bytes": current_raw.get("aggregate_file_bytes"),
        "rows_sha256": current_raw.get("rows_sha256"),
        "rows_bytes": current_raw.get("rows_bytes"),
        "parts": [
            {"role": item.get("role"), "sha256": item.get("sha256"), "bytes": item.get("bytes")}
            for item in current_raw.get("parts", [])
        ],
    }
    census_identity = census.get("component_identity", {})
    census_projection = {
        "schema_id": census_identity.get("schema_id"),
        "part_count": census_identity.get("part_count"),
        "aggregate_file_bytes": census_identity.get("aggregate_file_bytes"),
        "rows_sha256": census_identity.get("rows_sha256"),
        "rows_bytes": census_identity.get("rows_bytes"),
        "parts": [
            {"role": item.get("role"), "sha256": item.get("sha256"), "bytes": item.get("bytes")}
            for item in census_identity.get("parts", [])
        ],
    }
    if current != EXPECTED_COMPONENT_IDENTITY or census_projection != EXPECTED_COMPONENT_IDENTITY:
        raise HarnessError("settled current four-part identity binding drift")
    _BOUND_PROCESS_DESIGN = design
    rows.append({"path": BINDING_CENSUS[0], **identity(census_data)})
    rows.sort(key=lambda item: item["path"])
    return {
        "artifacts": rows,
        "sealed_process_design_status": design.get("verdict"),
        "current_addendum_status": addendum.get("verdict"),
        "predecessor_regression_verdict": predecessor.get("verdict"),
        "predecessor_harness_verdict": harness_falsifier.get("verdict"),
        "cycle_001_falsifier_verdict": cycle_001_falsifier.get("verdict"),
        "cycle_002_falsifier_verdict": cycle_002_falsifier.get("verdict"),
        "process_oracle_churn_status": churn_fault_tree.get("status"),
        "cycle_014_progress_status": progress.get("status"),
        "successor_regression_verdict": successor.get("verdict"),
        "successor_regression_pass": successor_pass,
        "current_component_identity": current,
    }


def component_identity(component_root: pathlib.Path) -> dict[str, Any]:
    names = set(os.listdir(component_root))
    if names != set(COMPONENT_FILES):
        raise HarnessError(f"component inventory mismatch: {sorted(names)}")
    by_role: dict[str, bytes] = {}
    for name, (role, wanted_sha, wanted_bytes) in COMPONENT_FILES.items():
        data = regular_bytes(component_root / name, f"component {name}")
        if (sha(data), len(data)) != (wanted_sha, wanted_bytes):
            raise HarnessError(f"component identity mismatch: {name}")
        by_role[role] = data
    parts = [
        {"role": role, "sha256": sha(by_role[role]), "bytes": len(by_role[role])}
        for role in ROLE_ORDER
    ]
    rows = canon(parts)
    result = {
        "schema_id": "pw-r9-four-part-component-identity-v1",
        "part_count": 4,
        "aggregate_file_bytes": sum(item["bytes"] for item in parts),
        "rows_sha256": sha(rows),
        "rows_bytes": len(rows),
        "parts": parts,
    }
    if result != EXPECTED_COMPONENT_IDENTITY:
        raise HarnessError("component aggregate identity mismatch")
    return result


def successor_root(component_root: pathlib.Path) -> pathlib.Path:
    if component_root.name != "iteration_011" or component_root.parent.name != "r9_control_plane_stabilization_v1":
        raise HarnessError("component root must be the iteration_011 four-part root")
    return component_root.parent.parent


def shared_rows(component_root: pathlib.Path) -> list[dict[str, Any]]:
    root = successor_root(component_root)
    result = []
    for role, name, wanted_sha, wanted_bytes in SHARED:
        data = regular_bytes(root / name, f"shared authority {role}")
        if (sha(data), len(data)) != (wanted_sha, wanted_bytes):
            raise HarnessError(f"shared authority drift: {role}")
        result.append(
            {
                "bytes": wanted_bytes,
                "role": role,
                "sha256": wanted_sha,
                "successor_root_relative_path": name,
            }
        )
    return result


def family_projection(bundle: dict[str, Any]) -> list[dict[str, Any]]:
    return [
        {
            "regression_id": family["regression_id"],
            "family": family["family"],
            "variants": [
                {
                    "variant_id": variant["variant_id"],
                    "strategy": variant["strategy"],
                    "tamper": variant.get("tamper"),
                    "backend_scenario": variant.get("backend_scenario"),
                    "expect": variant["expect"],
                }
                for variant in family["variants"]
            ],
        }
        for family in bundle["regressions"]["families"]
    ]


def global_projection(bundle: dict[str, Any]) -> list[dict[str, Any]]:
    return [
        {
            "case_id": item["case_id"],
            "strategy": item["strategy"],
            "tamper": item.get("tamper"),
            "backend_scenario": item.get("backend_scenario"),
            "expect": item["expect"],
        }
        for item in bundle["regressions"]["global_faults"]
    ]


def load_bundle(component_root: pathlib.Path) -> dict[str, Any]:
    _, bundle = read_json(component_root / "semantic_bundle.json", "semantic bundle")
    regressions = bundle.get("regressions")
    if not isinstance(regressions, dict):
        raise HarnessError("semantic regression catalog missing")
    families = family_projection(bundle)
    globals_ = global_projection(bundle)
    family_bytes = canon(families)
    global_bytes = canon(globals_)
    if (len(family_bytes), sha(family_bytes)) != (FAMILY_MAP_BYTES, FAMILY_MAP_SHA256):
        raise HarnessError("exact 22-family/56-variant catalog mapping drift")
    if (len(global_bytes), sha(global_bytes)) != (GLOBAL_MAP_BYTES, GLOBAL_MAP_SHA256):
        raise HarnessError("exact 10-global catalog mapping drift")
    if len(families) != 22 or sum(len(item["variants"]) for item in families) != 56:
        raise HarnessError("catalog cardinality mismatch")
    if len(globals_) != 10:
        raise HarnessError("global catalog cardinality mismatch")
    if tuple(item.get("scenario_id") for item in bundle.get("synthetic_scenarios", [])) != SCENARIOS:
        raise HarnessError("synthetic scenario catalog drift")
    process_bytes = canon(list(PROCESS_IDS))
    if (len(process_bytes), sha(process_bytes)) != (PROCESS_MAP_BYTES, PROCESS_MAP_SHA256):
        raise HarnessError("process-fault catalog mapping drift")
    return bundle


def semantic_oracle_dispatch_map(bundle: dict[str, Any]) -> dict[str, Any]:
    rows = []
    for family in bundle["regressions"]["families"]:
        for variant in family["variants"]:
            variant_id = variant["variant_id"]
            strategy = variant["strategy"]
            if variant_id == "required-fault-union":
                handler = "coverage_meta_exact_dependency_set"
            elif variant_id in PROCESS_VARIANT_MAP:
                handler = f"process_receipt_exact_variant_oracle:{PROCESS_VARIANT_MAP[variant_id]}"
            elif strategy == "evidence_mutation":
                handler = f"evidence_mutation_exact:{variant.get('tamper')}"
            elif strategy == "source_binding_projection":
                handler = f"source_mutation_exact:{variant.get('tamper')}"
            elif strategy in {"clean_reference", "protocol_subject_success", "protocol_controller_invalid", "protocol_subject_fail"}:
                handler = f"base_reference_exact:{variant.get('backend_scenario') or 'clean'}"
            elif strategy == "static_assertion":
                handler = f"static_assertion_exact:{variant_id}"
            elif strategy == "deterministic_projection_execution":
                handler = f"projection_exact:{variant_id}"
            elif strategy == "protocol_archive_and_negative_matrix":
                handler = "archive_matrix_exact_historical_subset"
            elif strategy == "historical_head_reopen_pair":
                handler = "historical_head_exact"
            else:
                raise HarnessError(f"unimplemented exact regression dispatch: {family['regression_id']}/{variant_id}")
            rows.append({
                "kind": "regression",
                "id": f"{family['regression_id']}--{variant_id}",
                "handler": handler,
                "expectation": identity(canon(variant["expect"])),
            })
    for item in bundle["regressions"]["global_faults"]:
        case_id = item["case_id"]
        if case_id == "GF-REOPEN-TWICE":
            handler = "reopen_twice_exact"
        elif item["strategy"] == "evidence_mutation":
            handler = f"evidence_mutation_exact:{item.get('tamper')}"
        elif case_id == "GF-SUBJECT-FAIL-PATH-STOP":
            handler = "base_reference_exact:malformed_output"
        elif case_id == "GF-CAUSAL-STAGE-COMPLETE":
            handler = "base_reference_exact:clean"
        elif case_id == "GF-EXACT-GIT-BUNDLE-BINDING":
            handler = "git_bundle_exact"
        else:
            raise HarnessError(f"unimplemented exact global dispatch: {case_id}")
        rows.append({
            "kind": "global",
            "id": case_id,
            "handler": handler,
            "expectation": identity(canon(item["expect"])),
        })
    rows.sort(key=lambda item: (item["kind"], item["id"]))
    encoded = canon(rows)
    return {"dispatch_count": len(rows), "rows_sha256": sha(encoded), "rows_bytes": len(encoded), "rows": rows}


def source_imports(path: pathlib.Path) -> dict[str, Any]:
    data = regular_bytes(path, f"source {path.name}")
    try:
        tree = ast.parse(data.decode("utf-8"), filename=str(path))
    except (UnicodeDecodeError, SyntaxError) as exc:
        raise HarnessError(f"source parse failed: {path.name}: {exc}") from exc
    imports: list[str] = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            imports.extend(alias.name for alias in node.names)
        elif isinstance(node, ast.ImportFrom):
            imports.append(node.module or "")
    return {"imports": sorted(imports), "ast_nodes": sum(1 for _ in ast.walk(tree))}


def public_commands_from_runner(path: pathlib.Path) -> list[str]:
    data = regular_bytes(path, "runner source")
    tree = ast.parse(data.decode("utf-8"), filename=str(path))
    candidates: list[set[str]] = []
    for node in ast.walk(tree):
        if isinstance(node, (ast.Set, ast.Tuple, ast.List)):
            values = {
                item.value
                for item in node.elts
                if isinstance(item, ast.Constant) and isinstance(item.value, str)
            }
            if values == PUBLIC_COMMANDS and len(node.elts) == 4:
                candidates.append(values)
    if not candidates:
        raise HarnessError("runner exact public command set not found statically")
    return list(PUBLIC_COMMAND_ORDER)


def static_check(component_root: pathlib.Path, evidence_root: pathlib.Path) -> dict[str, Any]:
    component = component_identity(component_root)
    harness_bindings = bind_harness_artifacts()
    shared = shared_rows(component_root)
    bundle = load_bundle(component_root)
    root = successor_root(component_root)
    contract_path = component_root.parent / BUILD_CONTRACT[0]
    contract = regular_bytes(contract_path, "build contract")
    if (sha(contract), len(contract)) != (BUILD_CONTRACT[1], BUILD_CONTRACT[2]):
        raise HarnessError("build contract identity drift")
    _, contract_value = read_json(contract_path, "build contract")
    declared = contract_value.get("required_stabilization_tests", {})
    if declared.get("semantic") != [
        "97 exact prompts oracles and gates",
        "18 stages and 54 artifacts",
        "291 slot-major schedule",
        "22 families 56 variants 10 globals",
        "six answer-free projections plus leakage case",
        "historical failures remain failures",
    ]:
        raise HarnessError("build contract stabilization declaration drift")
    own_path = pathlib.Path(__file__).resolve()
    own_source = regular_bytes(own_path, "harness source")
    own_ast = source_imports(own_path)
    forbidden_imports = [
        item
        for item in own_ast["imports"]
        if item.startswith("iteration_011")
        or "runner" in item
        or "evidence_recorder" in item
        or "offline_verifier" in item
    ]
    if forbidden_imports:
        raise HarnessError(f"component import forbidden: {forbidden_imports}")
    command_set = public_commands_from_runner(component_root / "runner.py")
    semantic_dispatch = semantic_oracle_dispatch_map(bundle)
    if semantic_dispatch["dispatch_count"] != 66:
        raise HarnessError("exact executable semantic dispatch count drift")
    variant_ids = [
        variant["variant_id"]
        for family in bundle["regressions"]["families"]
        for variant in family["variants"]
    ]
    if len(variant_ids) != len(set(variant_ids)):
        raise HarnessError("variant IDs are not globally unique")
    require_absolute_directory(evidence_root, "evidence root")
    return {
        "schema_id": SCHEMA,
        "mode": "check",
        "status": "PASS",
        "component_identity": component,
        "harness_bindings": harness_bindings,
        "shared_authorities": shared,
        "build_contract": identity(contract),
        "harness_source": {**identity(own_source), **own_ast, "stdlib_only": True},
        "catalog": {
            "family_count": 22,
            "variant_count": 56,
            "global_fault_count": 10,
            "process_fault_count": 9,
            "family_map_sha256": FAMILY_MAP_SHA256,
            "global_map_sha256": GLOBAL_MAP_SHA256,
            "process_map_sha256": PROCESS_MAP_SHA256,
            "variant_ids": variant_ids,
            "global_ids": [item["case_id"] for item in bundle["regressions"]["global_faults"]],
            "process_ids": list(PROCESS_IDS),
        },
        "public_runner_commands": command_set,
        "semantic_oracle_dispatch": semantic_dispatch,
        "evidence_writes": 0,
        "runner_calls": 0,
        "calls": call_observation(),
        "credit": 0,
        "authority": dict(ZERO_AUTHORITY),
    }


def inventory(root: pathlib.Path) -> dict[str, Any]:
    info = os.lstat(root)
    if stat.S_ISLNK(info.st_mode) or not stat.S_ISDIR(info.st_mode):
        raise HarnessError(f"inventory root must be nonlink directory: {root}")
    rows: list[dict[str, Any]] = []
    for base, dirs, files in os.walk(root, topdown=True, followlinks=False):
        dirs.sort()
        files.sort()
        base_path = pathlib.Path(base)
        entries = [(name, True) for name in dirs] + [(name, False) for name in files]
        for name, listed_dir in sorted(entries):
            path = base_path / name
            rel = path.relative_to(root).as_posix()
            item = os.lstat(path)
            mode = stat.S_IMODE(item.st_mode)
            if stat.S_ISLNK(item.st_mode):
                row = {"path": rel, "type": "symlink", "mode": mode, "target": os.readlink(path)}
                if listed_dir:
                    dirs.remove(name)
            elif stat.S_ISDIR(item.st_mode):
                row = {"path": rel, "type": "directory", "mode": mode}
            elif stat.S_ISREG(item.st_mode):
                data = regular_bytes(path, f"inventory {rel}")
                row = {
                    "path": rel,
                    "type": "file",
                    "mode": mode,
                    "bytes": len(data),
                    "sha256": sha(data),
                }
            else:
                row = {"path": rel, "type": "other", "mode": mode}
            row.update(
                {
                    "device": item.st_dev,
                    "inode": item.st_ino,
                    "nlink": item.st_nlink,
                    "size": item.st_size,
                    "mtime_ns": item.st_mtime_ns,
                    "ctime_ns": item.st_ctime_ns,
                }
            )
            rows.append(row)
    rows.sort(key=lambda item: item["path"])
    encoded = canon(rows)
    return {
        "entry_count": len(rows),
        "rows_sha256": sha(encoded),
        "rows_bytes": len(encoded),
        "entries": rows,
    }


def exclusive_dir(path: pathlib.Path) -> None:
    try:
        os.mkdir(path, 0o700)
    except FileExistsError as exc:
        raise HarnessError(f"create-only directory already exists: {path}") from exc
    fd = os.open(path.parent, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def ensure_dir_create_only(path: pathlib.Path, root: pathlib.Path) -> None:
    missing: list[pathlib.Path] = []
    current = path
    while current != root and not current.exists():
        missing.append(current)
        current = current.parent
    if current != root and not current.exists():
        raise HarnessError("receipt path escaped output root")
    for item in reversed(missing):
        exclusive_dir(item)


def write_exclusive(path: pathlib.Path, data: bytes, output_root: pathlib.Path, mode: int = 0o444) -> dict[str, Any]:
    ensure_dir_create_only(path.parent, output_root)
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL
    fd = os.open(path, flags, 0o600)
    try:
        offset = 0
        while offset < len(data):
            offset += os.write(fd, data[offset:])
        os.fsync(fd)
        os.fchmod(fd, mode)
        os.fsync(fd)
    finally:
        os.close(fd)
    parent_fd = os.open(path.parent, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
    try:
        os.fsync(parent_fd)
    finally:
        os.close(parent_fd)
    reopened = regular_bytes(path, f"create-only output {path.name}")
    if reopened != data:
        raise HarnessError(f"create-only exact reopen mismatch: {path}")
    return identity(data)


def write_receipt(path: pathlib.Path, value: dict[str, Any], output_root: pathlib.Path) -> dict[str, Any]:
    return write_exclusive(path, canon(value) + b"\n", output_root)


def archive_tree_create_only(
    source: pathlib.Path,
    destination: pathlib.Path,
    output_root: pathlib.Path,
) -> dict[str, Any]:
    """Persist a complete non-dereferencing tree archive using an exclusive fd."""
    ensure_dir_create_only(destination.parent, output_root)
    fd = os.open(destination, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    try:
        with os.fdopen(os.dup(fd), "wb", closefd=True) as stream:
            with tarfile.open(fileobj=stream, mode="w", dereference=False) as archive:
                archive.add(source, arcname="tree", recursive=False)
                for base, dirs, files in os.walk(source, topdown=True, followlinks=False):
                    dirs.sort()
                    files.sort()
                    base_path = pathlib.Path(base)
                    for name in [*dirs, *files]:
                        path = base_path / name
                        archive.add(path, arcname=(pathlib.Path("tree") / path.relative_to(source)).as_posix(), recursive=False)
            stream.flush()
            os.fsync(stream.fileno())
        os.fchmod(fd, 0o444)
        os.fsync(fd)
    finally:
        os.close(fd)
    parent_fd = os.open(destination.parent, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
    try:
        os.fsync(parent_fd)
    finally:
        os.close(parent_fd)
    data = regular_bytes(destination, f"tree archive {destination.name}")
    return {**identity(data), "format": "POSIX_TAR", "member_root": "tree"}


def extract_regular_tree_archive(archive_path: pathlib.Path, destination: pathlib.Path) -> None:
    """Extract only relative directories and regular files into a disposable absent tree."""
    exclusive_dir(destination)
    with tarfile.open(archive_path, mode="r:") as archive:
        for member in archive.getmembers():
            pure = pathlib.PurePosixPath(member.name)
            if pure.is_absolute() or ".." in pure.parts or not pure.parts or pure.parts[0] != "tree":
                raise HarnessError(f"unsafe self-contained archive member: {member.name}")
            target = destination.joinpath(*pure.parts)
            if member.isdir():
                target.mkdir(mode=0o700, parents=True, exist_ok=True)
                continue
            if not member.isreg():
                raise HarnessError(f"nonregular self-contained archive member: {member.name}")
            target.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
            stream = archive.extractfile(member)
            if stream is None:
                raise HarnessError(f"archive member bytes unavailable: {member.name}")
            data = stream.read()
            if len(data) != member.size:
                raise HarnessError(f"archive member length mismatch: {member.name}")
            fd = os.open(target, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
            try:
                offset = 0
                while offset < len(data):
                    offset += os.write(fd, data[offset:])
                os.fsync(fd)
                os.fchmod(fd, stat.S_IMODE(member.mode) or 0o400)
                os.fsync(fd)
            finally:
                os.close(fd)


def register_capture(kind: str, value: dict[str, Any]) -> None:
    if _ACTIVE_EXPERIMENT is not None:
        _ACTIVE_EXPERIMENT["captures"].append({"kind": kind, "value": value})


def register_pid(pid: int, command: list[str]) -> None:
    if _ACTIVE_EXPERIMENT is not None:
        _ACTIVE_EXPERIMENT["processes"][pid] = list(command)


def proc_tree_snapshot(root_pids: Iterable[int]) -> list[dict[str, Any]]:
    wanted = set(int(pid) for pid in root_pids)
    rows: dict[int, dict[str, Any]] = {}
    for entry in sorted(pathlib.Path("/proc").iterdir(), key=lambda item: item.name):
        if not entry.name.isdigit():
            continue
        try:
            stat_fields = regular_bytes(entry / "stat", f"proc stat {entry.name}").decode("utf-8").split()
            ppid = int(stat_fields[3])
            pid = int(entry.name)
            command = regular_bytes(entry / "cmdline", f"proc cmdline {entry.name}")
        except (HarnessError, ValueError, IndexError, PermissionError, ProcessLookupError):
            continue
        rows[pid] = {
            "pid": pid,
            "ppid": ppid,
            "cmdline_base64": base64.b64encode(command).decode("ascii"),
            "cmdline": identity(command),
        }
    changed = True
    while changed:
        changed = False
        for pid, row in rows.items():
            if row["ppid"] in wanted and pid not in wanted:
                wanted.add(pid)
                changed = True
    return [rows[pid] for pid in sorted(wanted) if pid in rows]


def archive_failed_experiment(context: dict[str, Any], exc: BaseException) -> None:
    if context.get("archived"):
        return
    context["archived"] = True
    output_root = pathlib.Path(context["output_root"])
    test_id = safe_id(str(context["test_id"]))
    failure_root = output_root / "failures" / test_id
    ensure_dir_create_only(failure_root, output_root)
    roots = []
    for number, root in enumerate(context["roots"]):
        path = pathlib.Path(root)
        if not path.exists() or path.is_symlink():
            continue
        before = inventory(path)
        archive_path = failure_root / f"experiment-{number:02d}.tar"
        archive = archive_tree_create_only(path, archive_path, output_root)
        roots.append({
            "source_lexical_path": str(path),
            "pre_failure_inventory": before,
            "archive": {"path": archive_path.relative_to(output_root).as_posix(), **archive},
        })
    processes = proc_tree_snapshot(context["processes"])
    captures = list(context["captures"])
    for runner in context["interactive"]:
        captures.append({
            "kind": "interactive_partial_capture",
            "value": {
                "command": runner.command,
                "pid": runner.pid,
                "returncode": runner.process.poll(),
                "stdout_complete_lines_base64": base64.b64encode(b"".join(runner.lines)).decode("ascii"),
                "stdout_complete_lines": identity(b"".join(runner.lines)),
            },
        })
    failure = {
        "schema_id": "pw-r9-independent-stabilization-prefailure-archive-v1",
        "test_id": context["test_id"],
        "error_type": type(exc).__name__,
        "error": str(exc),
        "temporary_roots": roots,
        "process_tree_at_failure": processes,
        "registered_processes": [
            {"pid": pid, "command": command}
            for pid, command in sorted(context["processes"].items())
        ],
        "captures": captures,
        "retry": 0,
        "automatic_relaunch": 0,
        "replacement": 0,
        "best_of": False,
        "calls": call_observation(),
        "authority": dict(ZERO_AUTHORITY),
        "created_utc": utc_now(),
    }
    write_receipt(failure_root / "failure-state.json", failure, output_root)


@contextmanager
def experiment_temp(output_root: pathlib.Path, test_id: str, prefix: str) -> Iterable[pathlib.Path]:
    global _ACTIVE_EXPERIMENT
    temp_text = tempfile.mkdtemp(prefix=prefix)
    owner = _ACTIVE_EXPERIMENT is None
    context = _ACTIVE_EXPERIMENT or {
        "output_root": output_root,
        "test_id": test_id,
        "roots": [],
        "processes": {},
        "interactive": [],
        "captures": [],
        "archived": False,
    }
    context["roots"].append(temp_text)
    if owner:
        _ACTIVE_EXPERIMENT = context
    try:
        yield pathlib.Path(temp_text)
    except BaseException as exc:
        archive_failed_experiment(context, exc)
        raise
    finally:
        if owner:
            _ACTIVE_EXPERIMENT = None
        shutil.rmtree(temp_text, ignore_errors=False)


@contextmanager
def failure_scope(
    output_root: pathlib.Path,
    test_id: str,
    roots: Iterable[pathlib.Path],
) -> Iterable[None]:
    global _ACTIVE_EXPERIMENT
    if _ACTIVE_EXPERIMENT is not None:
        raise HarnessError("nested failure scope forbidden")
    context = {
        "output_root": output_root,
        "test_id": test_id,
        "roots": [str(path) for path in roots],
        "processes": {},
        "interactive": [],
        "captures": [],
        "archived": False,
    }
    _ACTIVE_EXPERIMENT = context
    try:
        yield
    except BaseException as exc:
        archive_failed_experiment(context, exc)
        raise
    finally:
        _ACTIVE_EXPERIMENT = None


def safe_id(value: str) -> str:
    result = re.sub(r"[^A-Za-z0-9_.-]+", "-", value).strip("-.")
    if not result or not SAFE_NAME.fullmatch(result):
        raise HarnessError(f"unsafe test ID: {value}")
    return result


def runner_environment(evidence_root: pathlib.Path) -> dict[str, str]:
    env = dict(os.environ)
    for key in list(env):
        lower = key.lower()
        if lower.endswith("_proxy") or lower in {"all_proxy", "no_proxy"} or key.startswith("GIT_"):
            env.pop(key, None)
    env["PW_R9_EVIDENCE_ROOT"] = str(evidence_root)
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    env["GIT_OPTIONAL_LOCKS"] = "0"
    env["GIT_CONFIG_NOSYSTEM"] = "1"
    env["GIT_CONFIG_GLOBAL"] = os.devnull
    env["GIT_TERMINAL_PROMPT"] = "0"
    env["LC_ALL"] = "C"
    return env


def parse_runner_stdout(data: bytes, label: str) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    if not data or len(data) > MAX_CAPTURE or not data.endswith(b"\n") or b"\r" in data:
        raise HarnessError(f"{label}: invalid runner stdout framing")
    values = []
    for number, line in enumerate(data.splitlines(keepends=True), 1):
        values.append(json_object_bytes(line[:-1], f"{label} line {number}", storage=False))
    return values, values[-1]


def invoke_runner(
    component_root: pathlib.Path,
    evidence_root: pathlib.Path,
    arguments: list[str],
    stdin: bytes = b"",
    timeout: float = 90.0,
) -> dict[str, Any]:
    command = [sys.executable, str(component_root / "runner.py"), *arguments]
    started = time.monotonic()
    try:
        result = subprocess.run(
            command,
            input=stdin,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=str(component_root),
            env=runner_environment(evidence_root),
            timeout=timeout,
            check=False,
        )
    except subprocess.TimeoutExpired as exc:
        register_capture(
            "runner_timeout",
            {
                "arguments": arguments,
                "stdout_base64": base64.b64encode(exc.stdout or b"").decode("ascii"),
                "stderr_base64": base64.b64encode(exc.stderr or b"").decode("ascii"),
            },
        )
        raise HarnessError(f"runner timeout: {' '.join(arguments)}") from exc
    values, terminal = parse_runner_stdout(result.stdout, "runner stdout")
    observation = {
        "arguments": arguments,
        "returncode": result.returncode,
        "stdout": {
            "base64": base64.b64encode(result.stdout).decode("ascii"),
            **identity(result.stdout),
            "objects": values,
        },
        "stderr": {
            "base64": base64.b64encode(result.stderr).decode("ascii"),
            **identity(result.stderr),
        },
        "terminal": terminal,
        "elapsed_ms": int((time.monotonic() - started) * 1000),
    }
    register_capture("runner_completed", observation)
    return observation


def expect_runner(result: dict[str, Any], rc: int, status: str, label: str) -> None:
    actual = (result["returncode"], result["terminal"].get("status"))
    if actual != (rc, status):
        raise UnexpectedPrimary(f"{label}: expected {(rc, status)}, got {actual}")


def chmod_write(path: pathlib.Path, data: bytes) -> None:
    info = os.lstat(path)
    if not stat.S_ISREG(info.st_mode) or stat.S_ISLNK(info.st_mode):
        raise HarnessError(f"mutation target is not a regular nonlink file: {path}")
    os.chmod(path, 0o600)
    fd = os.open(path, os.O_WRONLY | os.O_TRUNC | getattr(os, "O_NOFOLLOW", 0))
    try:
        offset = 0
        while offset < len(data):
            offset += os.write(fd, data[offset:])
        os.fsync(fd)
        os.fchmod(fd, stat.S_IMODE(info.st_mode))
        os.fsync(fd)
    finally:
        os.close(fd)
    parent = os.open(path.parent, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
    try:
        os.fsync(parent)
    finally:
        os.close(parent)


def rewrite_json(path: pathlib.Path, transform: Callable[[dict[str, Any]], None]) -> None:
    _, value = read_json(path, f"mutation JSON {path.name}")
    transform(value)
    chmod_write(path, canon(value) + b"\n")


def flip_first_byte(path: pathlib.Path) -> None:
    data = regular_bytes(path, f"mutation target {path.name}")
    if not data:
        raise HarnessError("cannot mutate empty file")
    changed = bytes([data[0] ^ 1]) + data[1:]
    chmod_write(path, changed)


def run_counts(run_root: pathlib.Path) -> dict[str, int]:
    counts = {
        "attempts": 0,
        "spawn_records": 0,
        "raw_results": 0,
        "completions": 0,
        "pass": 0,
        "fail": 0,
        "stage_artifacts": 0,
        "s90_artifacts": 0,
    }
    rows = run_root / "rows"
    if rows.is_dir():
        for child in sorted(rows.iterdir()):
            if not child.is_dir() or child.is_symlink():
                continue
            counts["attempts"] += int((child / "attempt.json").is_file())
            counts["spawn_records"] += int((child / "spawn_receipt.json").is_file())
            counts["raw_results"] += int((child / "raw_result.json").is_file())
            if (child / "completion.json").is_file():
                counts["completions"] += 1
                _, completion = read_json(child / "completion.json", "completion")
                if completion.get("status") == "PASS":
                    counts["pass"] += 1
                elif completion.get("status") == "FAIL":
                    counts["fail"] += 1
    artifacts = run_root / "artifacts"
    if artifacts.is_dir():
        for path in artifacts.rglob("*.json"):
            if path.is_file() and not path.is_symlink():
                counts["stage_artifacts"] += 1
                counts["s90_artifacts"] += int(path.name == "S90.json")
    return counts


class BaseRuns:
    def __init__(
        self,
        component_root: pathlib.Path,
        evidence_root: pathlib.Path,
        component: dict[str, Any],
        shared: list[dict[str, Any]],
    ) -> None:
        self.component_root = component_root
        self.evidence_root = evidence_root
        self.component = component
        self.shared = shared
        self.by_scenario: dict[str, list[pathlib.Path]] = {}
        self.records: list[dict[str, Any]] = []
        self._scan()

    def _scan(self) -> None:
        now = datetime.datetime.now(datetime.timezone.utc)
        for path in sorted(self.evidence_root.iterdir()):
            info = os.lstat(path)
            if stat.S_ISLNK(info.st_mode) or not stat.S_ISDIR(info.st_mode):
                raise HarnessError(f"evidence root contains non-directory: {path.name}")
            _, run = read_json(path / "run.json", f"base run {path.name}")
            _, terminal = read_json(path / "matrix_terminal.json", f"base terminal {path.name}")
            _, accounting = read_json(path / "accounting.json", f"base accounting {path.name}")
            if run.get("run_id") != path.name or run.get("component_identity") != self.component:
                raise HarnessError(f"base run identity mismatch: {path.name}")
            if run.get("shared_authorities") != self.shared:
                raise HarnessError(f"base run shared-authority mismatch: {path.name}")
            created = run.get("created_utc")
            if not isinstance(created, str) or not created.endswith("Z"):
                raise HarnessError(f"base run created_utc malformed: {path.name}")
            try:
                stamp = datetime.datetime.fromisoformat(created[:-1] + "+00:00")
            except ValueError as exc:
                raise HarnessError(f"base run created_utc invalid: {path.name}") from exc
            age = (now - stamp).total_seconds()
            if age < -300 or age > FRESH_SECONDS:
                raise HarnessError(f"base run is not fresh within 24h: {path.name}: age={age:.0f}s")
            scenario = run.get("scenario")
            if run.get("run_kind") != "simulate" or scenario not in SCENARIOS:
                continue
            status = terminal.get("status")
            if status != EXPECTED_SCENARIO_STATUS[scenario] or accounting.get("status") != status:
                raise HarnessError(f"base scenario terminal mismatch: {path.name}")
            counts = run_counts(path)
            record = {
                "run_id": path.name,
                "scenario": scenario,
                "status": status,
                "counts": counts,
                "created_utc": created,
            }
            self.records.append(record)
            self.by_scenario.setdefault(scenario, []).append(path)
        missing = sorted(set(SCENARIOS) - set(self.by_scenario))
        if missing:
            raise HarnessError(f"fresh base scenario runs missing: {missing}")
        clean = self.get("clean")
        if run_counts(clean) != {
            "attempts": 291,
            "spawn_records": 291,
            "raw_results": 291,
            "completions": 291,
            "pass": 291,
            "fail": 0,
            "stage_artifacts": 54,
            "s90_artifacts": 3,
        }:
            raise HarnessError("clean base run is not a complete 291/54 traversal")

    def get(self, scenario: str) -> pathlib.Path:
        choices = self.by_scenario.get(scenario, [])
        if not choices:
            raise HarnessError(f"missing base scenario: {scenario}")
        return choices[0]


def copy_run(source: pathlib.Path, destination_parent: pathlib.Path) -> pathlib.Path:
    destination = destination_parent / source.name
    shutil.copytree(source, destination, symlinks=True)
    return destination


def reopen(component_root: pathlib.Path, run_root: pathlib.Path) -> dict[str, Any]:
    return invoke_runner(
        component_root,
        run_root.parent,
        ["reopen", "--run-root", run_root.name],
        timeout=120.0,
    )


def test_receipt(
    category: str,
    test_id: str,
    result: str,
    observation: dict[str, Any],
    expected: Any,
) -> dict[str, Any]:
    facts = observation.pop("semantic_facts", None)
    if not isinstance(facts, dict):
        raise HarnessError(f"{test_id}: executable semantic facts missing")
    if facts != expected:
        raise UnexpectedPrimary(
            f"{test_id}: semantic expectation mismatch: expected={expected!r} observed={facts!r}"
        )
    proof = {
        "comparison": "EXACT_CANONICAL_VALUE_EQUALITY",
        "expected_identity": identity(canon(expected)),
        "observed_identity": identity(canon(facts)),
        "equal": True,
        "facts": facts,
    }
    return {
        "schema_id": RECEIPT_SCHEMA,
        "category": category,
        "test_id": test_id,
        "result": result,
        "expected": expected,
        "observation": {**observation, "semantic_oracle": proof},
        "calls": call_observation(),
        "credit": 0,
        "authority": dict(ZERO_AUTHORITY),
        "no_retry": True,
        "automatic_relaunch": 0,
        "intentional_same_root_negative_control_invocations": int(
            test_id == "SAME_ROOT_REINVOKE_ZERO_REQUEST" or test_id.endswith("--same-root-reinvoke")
        ),
        "public_reopen_invocations": 2 if category == "process" else 0,
        "no_replacement": True,
        "best_of": False,
        "created_utc": utc_now(),
    }


def first_matching(root: pathlib.Path, pattern: str) -> pathlib.Path:
    matches = sorted(path for path in root.rglob(pattern) if path.is_file() and not path.is_symlink())
    if not matches:
        raise HarnessError(f"mutation target missing: {pattern}")
    return matches[0]


def mutate_evidence(run_root: pathlib.Path, tamper: str, bases: BaseRuns) -> dict[str, Any]:
    details: dict[str, Any] = {"tamper": tamper}
    if tamper == "change_raw_result_schema":
        target = first_matching(run_root / "rows", "raw_result.json")
        rewrite_json(target, lambda value: value.__setitem__("schema_id", "pw-r9-mutant-raw-result-v0"))
    elif tamper == "create_wrong_render_directory_member":
        target = run_root / "renders"
        os.mkdir(target, 0o500)
        details["created_entry"] = "renders"
        return details
    elif tamper == "append_lf_to_render":
        target = first_matching(run_root / "rows", "provider_input.txt")
        chmod_write(target, regular_bytes(target, "provider input") + b"\n")
    elif tamper == "change_render_byte":
        target = first_matching(run_root / "rows", "provider_input.txt")
        data = regular_bytes(target, "provider input")
        if not data:
            raise HarnessError("empty provider input")
        chmod_write(target, data[:-1] + bytes([data[-1] ^ 1]))
    elif tamper == "change_run_semantic_binding":
        target = run_root / "run.json"

        def change_semantic(value: dict[str, Any]) -> None:
            part = next(
                item
                for item in value["component_identity"]["parts"]
                if item["role"] == "IMMUTABLE_SEMANTIC_BUNDLE"
            )
            part["sha256"] = "0" * 64

        rewrite_json(target, change_semantic)
    elif tamper == "change_run_operating_binding":
        target = run_root / "run.json"

        def change_operating(value: dict[str, Any]) -> None:
            value["shared_authorities"][0]["sha256"] = "0" * 64

        rewrite_json(target, change_operating)
    elif tamper == "change_raw_result_byte":
        target = first_matching(run_root / "rows", "raw_result.json")
        flip_first_byte(target)
    elif tamper == "change_embedded_score":
        target = first_matching(run_root / "rows", "completion.json")

        def change_score(value: dict[str, Any]) -> None:
            score = value["consumer_result"]["score"]
            score["verdict"] = "FAIL" if score.get("verdict") == "PASS" else "PASS"

        rewrite_json(target, change_score)
    elif tamper in {"plant_future_attempt", "plant_future_completion"}:
        source_row = run_root / "rows" / "row-000"
        future = run_root / "rows" / "row-001"
        if future.exists():
            raise HarnessError("future row unexpectedly exists in subject-fail base")
        os.mkdir(future, 0o500)
        names = ["provider_input.txt", "spawn_message.txt", "attempt.json"]
        if tamper == "plant_future_completion":
            names += ["spawn_receipt.json", "raw_result.json", "completion.json"]
        for name in names:
            shutil.copy2(source_row / name, future / name, follow_symlinks=False)
        target = future
    elif tamper == "change_matrix_terminal_byte":
        target = run_root / "matrix_terminal.json"
        flip_first_byte(target)
    elif tamper == "change_accounting_count":
        target = run_root / "accounting.json"

        def change_accounting(value: dict[str, Any]) -> None:
            value["attempts"] = int(value.get("attempts", 0)) + 1

        rewrite_json(target, change_accounting)
    elif tamper == "change_stage_artifact_byte":
        target = first_matching(run_root / "artifacts", "*.json")
        flip_first_byte(target)
    elif tamper == "change_s90_artifact_byte":
        target = first_matching(run_root / "artifacts", "S90.json")
        flip_first_byte(target)
    elif tamper == "reuse_prior_backend_identities":
        target = run_root / "run.json"

        prior = bases.get("observed_tool")
        _, prior_run = read_json(prior / "run.json", "prior backend identity source")

        def reuse_backend_identity(value: dict[str, Any]) -> None:
            source = prior_run["schedule"][0]
            for key in ("nonce", "invocation_id", "task_name", "expected_canonical_task_path"):
                value["schedule"][0][key] = source[key]

        rewrite_json(target, reuse_backend_identity)
        details["prior_run_id"] = prior.name
    elif tamper == "duplicate_run_nonce":
        target = run_root / "run.json"

        def duplicate_nonce_only(value: dict[str, Any]) -> None:
            value["schedule"][1]["nonce"] = value["schedule"][0]["nonce"]

        rewrite_json(target, duplicate_nonce_only)
    else:
        raise HarnessError(f"unimplemented evidence tamper: {tamper}")
    details["target"] = target.relative_to(run_root).as_posix()
    return details


def evidence_mutation_test(
    component_root: pathlib.Path,
    bases: BaseRuns,
    output_root: pathlib.Path,
    test_id: str,
    tamper: str,
    expected: Any,
) -> dict[str, Any]:
    scenario = "malformed_output" if tamper in {"plant_future_attempt", "plant_future_completion"} else "clean"
    source = bases.get(scenario)
    with experiment_temp(output_root, test_id, "pw-r9-evidence-mutant-") as temp_root:
        evidence = temp_root / "evidence"
        os.mkdir(evidence, 0o700)
        run_root = copy_run(source, evidence)
        before = inventory(run_root)
        mutation = mutate_evidence(run_root, tamper, bases)
        after_mutation = inventory(run_root)
        if before["rows_sha256"] == after_mutation["rows_sha256"]:
            raise UnexpectedPrimary(f"{test_id}: mutation did not change inventory")
        result = reopen(component_root, run_root)
        after_reopen = inventory(run_root)
        expect_runner(result, 2, "CONTROLLER_INVALID", test_id)
        if after_reopen != after_mutation:
            raise UnexpectedPrimary(f"{test_id}: public reopen mutated or repaired evidence")
        archive_path = output_root / "archives" / "evidence-mutants" / f"{safe_id(test_id)}.tar"
        archive = archive_tree_create_only(run_root, archive_path, output_root)
        return test_receipt(
            "regression_or_global",
            test_id,
            "PASS",
            {
                "semantic_facts": {
                    key: value
                    for key, value in {
                        "no_repair": after_reopen == after_mutation,
                        "no_advance": after_reopen == after_mutation,
                        "backend_invocations": 0,
                        "rc": result["returncode"],
                        "status": result["terminal"].get("status"),
                    }.items()
                    if key in expected
                },
                "base_run_id": source.name,
                "mutation": mutation,
                "inventory_before": before,
                "inventory_after_mutation": after_mutation,
                "inventory_after_reopen": after_reopen,
                "runner": result,
                "repair_or_reseal": False,
                "durable_mutant_archive": {
                    "path": archive_path.relative_to(output_root).as_posix(),
                    **archive,
                },
            },
            expected,
        )


SOURCE_TAMPERS = {
    "omit_declared_semantic_source",
    "add_undeclared_control_member",
    "declared_source_as_directory",
    "change_declared_source_byte",
    "change_required_checkpoint",
    "change_architecture_schema",
}


def copy_component_sandbox(
    component_root: pathlib.Path, temp_root: pathlib.Path
) -> tuple[pathlib.Path, pathlib.Path, pathlib.Path]:
    repo = temp_root / "source"
    successor = repo / "tests" / "agent_packet_restrictions" / "successor_20260813"
    candidate = successor / "r9_control_plane_stabilization_v1" / "iteration_011"
    candidate.parent.mkdir(parents=True)
    shutil.copytree(component_root, candidate)
    shutil.copy2(
        component_root.parent / BUILD_CONTRACT[0],
        candidate.parent / BUILD_CONTRACT[0],
        follow_symlinks=False,
    )
    source_successor = successor_root(component_root)
    for _, name, _, _ in SHARED:
        shutil.copy2(source_successor / name, successor / name, follow_symlinks=False)
    evidence = temp_root / "evidence"
    os.mkdir(evidence, 0o700)
    return repo, candidate, evidence


def mutate_source(candidate: pathlib.Path, tamper: str) -> dict[str, Any]:
    semantic = candidate / "semantic_bundle.json"
    if tamper == "omit_declared_semantic_source":
        os.unlink(semantic)
        target = semantic
    elif tamper == "add_undeclared_control_member":
        target = candidate / "undeclared-control.json"
        fd = os.open(target, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o400)
        try:
            os.write(fd, b"{}\n")
            os.fsync(fd)
        finally:
            os.close(fd)
    elif tamper == "declared_source_as_directory":
        os.unlink(semantic)
        os.mkdir(semantic, 0o500)
        target = semantic
    elif tamper == "change_declared_source_byte":
        flip_first_byte(semantic)
        target = semantic
    elif tamper == "change_required_checkpoint":
        def change_checkpoint(value: dict[str, Any]) -> None:
            family = next(
                item for item in value["regressions"]["families"]
                if item["regression_id"] == "R9-REG-013"
            )
            family["required_current_pass"]["result"] = "STALE_CHECKPOINT"

        rewrite_json(semantic, change_checkpoint)
        target = semantic
    elif tamper == "change_architecture_schema":
        def change_architecture(value: dict[str, Any]) -> None:
            family = next(
                item for item in value["regressions"]["families"]
                if item["regression_id"] == "R9-REG-015"
            )
            family["required_current_pass"]["meaning"] = "MUTATED_ARCHITECTURE_SCHEMA_AUTHORITY"

        rewrite_json(semantic, change_architecture)
        target = semantic
    else:
        raise HarnessError(f"unimplemented source tamper: {tamper}")
    return {"tamper": tamper, "target": target.relative_to(candidate).as_posix()}


def source_mutation_test(
    component_root: pathlib.Path,
    output_root: pathlib.Path,
    test_id: str,
    tamper: str,
    expected: Any,
) -> dict[str, Any]:
    with experiment_temp(output_root, test_id, "pw-r9-source-mutant-") as temp_root:
        _, candidate, evidence = copy_component_sandbox(component_root, temp_root)
        before = inventory(candidate)
        mutation = mutate_source(candidate, tamper)
        after_mutation = inventory(candidate)
        evidence_before = inventory(evidence)
        result = invoke_runner(candidate, evidence, ["simulate", "--check-only"])
        evidence_after = inventory(evidence)
        after_invocation = inventory(candidate)
        expect_runner(result, 2, "CONTROLLER_INVALID", test_id)
        request_count = sum(
            item.get("schema_id") == "pw-r9-subagent-spawn-request-v1"
            for item in result["stdout"]["objects"]
        )
        if request_count or evidence_before != evidence_after or after_invocation != after_mutation:
            raise UnexpectedPrimary(f"{test_id}: source rejection wrote evidence, emitted request, or repaired source")
        archive_path = output_root / "archives" / "source-mutants" / f"{safe_id(test_id)}.tar"
        archive = archive_tree_create_only(temp_root / "source", archive_path, output_root)
        return test_receipt(
            "regression",
            test_id,
            "PASS",
            {
                "semantic_facts": {
                    key: value
                    for key, value in {
                        "admitted": False,
                        "backend_invocations": request_count,
                        "evidence_writes": int(evidence_before != evidence_after),
                    }.items()
                    if key in expected
                },
                "mutation": mutation,
                "source_inventory_before": before,
                "source_inventory_after_mutation": after_mutation,
                "source_inventory_after_invocation": after_invocation,
                "evidence_inventory_before": evidence_before,
                "evidence_inventory_after": evidence_after,
                "spawn_request_count": request_count,
                "runner": result,
                "durable_mutant_archive": {
                    "path": archive_path.relative_to(output_root).as_posix(),
                    **archive,
                },
            },
            expected,
        )


def base_reference_test(
    component_root: pathlib.Path,
    bases: BaseRuns,
    test_id: str,
    scenario: str,
    expected: Any,
) -> dict[str, Any]:
    run_root = bases.get(scenario)
    before = inventory(run_root)
    result = reopen(component_root, run_root)
    after = inventory(run_root)
    wanted_status = EXPECTED_SCENARIO_STATUS[scenario]
    wanted_rc = 0 if wanted_status == "PASS" else 1 if wanted_status == "VALID_SUBJECT_FAIL" else 2
    expect_runner(result, wanted_rc, wanted_status, test_id)
    if before != after:
        raise UnexpectedPrimary(f"{test_id}: read-only base reopen changed evidence")
    counts = run_counts(run_root)
    verifier = result["terminal"].get("offline_verifier", {})
    raw_terminal_statuses = set()
    all_renders_one_lf = True
    for row in sorted((run_root / "rows").iterdir()):
        if not row.is_dir() or row.is_symlink():
            continue
        provider = regular_bytes(row / "provider_input.txt", "base provider input")
        all_renders_one_lf = all_renders_one_lf and provider.endswith(b"\n") and not provider.endswith(b"\n\n")
        raw_path = row / "raw_result.json"
        if raw_path.is_file():
            _, raw_record = read_json(raw_path, "base raw result")
            raw_event = base64.b64decode(raw_record["root_event_base64"], validate=True)
            raw_terminal_statuses.add(
                json_object_bytes(raw_event[:-1], "base terminal event", storage=False).get("terminal_status")
            )
    facts_available = {
        "complete_output": counts["raw_results"] == counts["completions"] == counts["attempts"],
        "exact_request_event_binding": verifier.get("valid") is True
        and verifier.get("checks", {}).get("transport_captures") is True,
        "terminal_status": next(iter(raw_terminal_statuses)) if len(raw_terminal_statuses) == 1 else None,
        "events": counts["spawn_records"] + counts["raw_results"],
        "requests": counts["attempts"],
        "attempts": counts["attempts"],
        "completions": counts["completions"],
        "no_later_request": counts["attempts"] == 1,
        "fail_rows": counts["fail"],
        "no_later_same_slot_start": counts["attempts"] == counts["fail"],
        "rows": counts["completions"],
        "all_renders_one_lf": all_renders_one_lf,
        "rc": result["returncode"],
        "status": result["terminal"].get("status"),
        "pass_rows": counts["pass"],
        "stage_artifacts": counts["stage_artifacts"],
        "s90_artifacts": counts["s90_artifacts"],
    }
    return test_receipt(
        "regression_or_global",
        test_id,
        "PASS",
        {
            "semantic_facts": {key: facts_available[key] for key in expected},
            "base_run_id": run_root.name,
            "scenario": scenario,
            "counts": counts,
            "inventory_before": before,
            "inventory_after": after,
            "runner": result,
        },
        expected,
    )


def reopen_twice_test(
    component_root: pathlib.Path,
    bases: BaseRuns,
    test_id: str,
    expected: Any,
) -> dict[str, Any]:
    run_root = bases.get("clean")
    before = inventory(run_root)
    first = reopen(component_root, run_root)
    middle = inventory(run_root)
    second = reopen(component_root, run_root)
    after = inventory(run_root)
    expect_runner(first, 0, "PASS", test_id)
    expect_runner(second, 0, "PASS", test_id)
    if before != middle or middle != after or first["terminal"] != second["terminal"]:
        raise UnexpectedPrimary(f"{test_id}: double reopen not identical/read-only")
    return test_receipt(
        "global",
        test_id,
        "PASS",
        {
            "semantic_facts": {
                "backend_invocations": 0,
                "identical_status": first["terminal"].get("status") == second["terminal"].get("status"),
                "identical_verifier_report": first["terminal"].get("offline_verifier")
                == second["terminal"].get("offline_verifier"),
            },
            "base_run_id": run_root.name,
            "inventory_before": before,
            "inventory_after_first": middle,
            "inventory_after_second": after,
            "first": first,
            "second": second,
        },
        expected,
    )


def check_only_test(
    component_root: pathlib.Path,
    evidence_root: pathlib.Path,
    test_id: str,
    expected: Any,
) -> dict[str, Any]:
    before = inventory(evidence_root)
    result = invoke_runner(component_root, evidence_root, ["simulate", "--check-only"])
    after = inventory(evidence_root)
    expect_runner(result, 0, "PASS", test_id)
    terminal = result["terminal"]
    if before != after or terminal.get("evidence_writes") != 0 or terminal.get("spawn_requests") != 0:
        raise UnexpectedPrimary(f"{test_id}: check-only was not zero-write/zero-request")
    callable_values = 0
    for value in terminal.values():
        callable_values += int(callable(value))
    return test_receipt(
        "regression",
        test_id,
        "PASS",
        {
            "semantic_facts": {
                key: value
                for key, value in {
                    "backend_invocations": terminal.get("spawn_requests"),
                    "evidence_writes": terminal.get("evidence_writes"),
                    "rc": result["returncode"],
                    "status": terminal.get("status"),
                    "callable_values": callable_values,
                    "callback_confinement_claim": False,
                    "callback_parameters": 0,
                    "check_only_json_object": isinstance(terminal, dict),
                }.items()
                if key in expected
            },
            "runner": result,
            "evidence_inventory_before": before,
            "evidence_inventory_after": after,
            "callable_values": callable_values,
            "callback_parameters": 0,
            "json_data_only": True,
        },
        expected,
    )


def component_static_test(
    component_root: pathlib.Path,
    bundle: dict[str, Any],
    test_id: str,
    variant_id: str,
    expected: Any,
) -> dict[str, Any]:
    observation: dict[str, Any]
    if variant_id == "all-declared-regular-exact":
        observation = {
            "component_identity": component_identity(component_root),
            "shared_authorities": shared_rows(component_root),
            "inventory": inventory(component_root),
        }
    elif variant_id in {"candidate-import-scan", "no-v12-v21-import", "v21-runtime-import-absent"}:
        scans = {}
        prohibited = []
        for name in ("runner.py", "evidence_recorder.py", "offline_verifier.py"):
            source = regular_bytes(component_root / name, f"static scan {name}")
            parsed = source_imports(component_root / name)
            text = source.decode("utf-8")
            hits = [
                token
                for token in ("candidate_v12", "candidate_v21", "model_retest_r8_candidate_v12", "model_retest_r8_candidate_v21", "iteration_010")
                if token in text
            ]
            if hits:
                prohibited.append({"file": name, "hits": hits})
            scans[name] = {**parsed, "prohibited_runtime_reference_hits": hits}
        if prohibited:
            raise UnexpectedPrimary(f"{test_id}: predecessor runtime dependency found: {prohibited}")
        observation = {
            "component_source_scans": scans,
            "candidate_v12_v21_runtime_imports": 0,
            "capability_token_claim": False,
            "reflection_resistance_claim": False,
        }
    elif variant_id in {"exact-public-command-set", "minimum-surface"}:
        commands = public_commands_from_runner(component_root / "runner.py")
        observation = {
            "commands": commands,
            "extra_commands": len(set(commands) - PUBLIC_COMMANDS),
            "component_part_count": len(COMPONENT_FILES),
        }
    elif variant_id == "v21-remains-zero-credit":
        family = next(item for item in bundle["regressions"]["families"] if item["regression_id"] == "R9-REG-019")
        predecessor = family["expected_predecessor_failure"]
        if predecessor.get("result") != "FAIL" or family.get("historical_disposition") != "PRESERVED_FAIL_NEVER_RECLASSIFIED":
            raise UnexpectedPrimary(f"{test_id}: historical FAIL was promoted")
        ref = family["evidence_refs"][0]
        ref_data = regular_bytes(component_root.parents[4] / ref["path"], "v21 historical receipt")
        receipt_hash_exact = (sha(ref_data), len(ref_data)) == (ref["sha256"], ref["bytes"])
        if not receipt_hash_exact:
            raise UnexpectedPrimary(f"{test_id}: historical v21 receipt identity drift")
        observation = {
            "current_authority": False,
            "historical_result": predecessor["result"],
            "historical_disposition": family["historical_disposition"],
            "receipt_hash_exact": receipt_hash_exact,
            "regression_object_identity": identity(canon(family)),
        }
    elif variant_id == "resolved-tension-predicate-clarification":
        family = next(item for item in bundle["regressions"]["families"] if item["regression_id"] == "R9-REG-021")
        oracle = family["required_current_pass"]
        predecessor = family["expected_predecessor_failure"]
        meaning = oracle.get("meaning", "")
        if predecessor.get("result") != "FAIL" or oracle.get("result") != "PASS" or "resolved" not in meaning.lower():
            raise UnexpectedPrimary(f"{test_id}: resolved-tension lineage/predicate binding failed")
        observation = {
            "frozen_false_oracle": True,
            "generic_durable_unresolved_truth": True,
            "generic_resolved_truth": False,
            "predecessor_result": "FAIL",
            "successor_result": "PASS",
            "family_identity": identity(canon(family)),
        }
    elif variant_id == "data-only-check-result":
        raise HarnessError("data-only check result requires public check-only handler")
    else:
        raise HarnessError(f"unimplemented static assertion: {variant_id}")
    facts_available = {
        "all_declared_present": set(os.listdir(component_root)) == set(COMPONENT_FILES),
        "all_hashes_exact": component_identity(component_root) == EXPECTED_COMPONENT_IDENTITY,
        "all_regular_nonlinks": all(
            stat.S_ISREG(os.lstat(component_root / name).st_mode)
            and not stat.S_ISLNK(os.lstat(component_root / name).st_mode)
            for name in COMPONENT_FILES
        ),
        "candidate_v12_v21_runtime_imports": observation.get("candidate_v12_v21_runtime_imports", 0),
        "commands": observation.get("commands"),
        "extra_commands": observation.get("extra_commands", 0),
        "capability_token_claim": observation.get("capability_token_claim", False),
        "reflection_resistance_claim": observation.get("reflection_resistance_claim", False),
        "current_authority": observation.get("current_authority", False),
        "historical_result": observation.get("historical_result"),
        "receipt_hash_exact": observation.get("receipt_hash_exact", False),
        "frozen_false_oracle": observation.get("frozen_false_oracle"),
        "generic_durable_unresolved_truth": observation.get("generic_durable_unresolved_truth"),
        "generic_resolved_truth": observation.get("generic_resolved_truth"),
        "network_calls": HARNESS_INITIATED_CALL_COUNTS["network"],
        "provider_calls": HARNESS_INITIATED_CALL_COUNTS["provider"],
        "subject_calls": HARNESS_INITIATED_CALL_COUNTS["subject"],
        "qualification_credit": 0,
        "predecessor_result": observation.get("predecessor_result"),
        "successor_result": observation.get("successor_result"),
    }
    observation["semantic_facts"] = {key: facts_available[key] for key in expected}
    return test_receipt("regression", test_id, "PASS", observation, expected)


def projection_observed(projection: dict[str, Any]) -> bool:
    exact = {"supported_claims", "apparent_discrepancies", "predecessor_outputs", "source_bindings", "source_supported_candidate"}
    if set(projection) != exact:
        raise HarnessError("projection exact field mismatch")
    claims = projection["supported_claims"]
    discrepancies = projection["apparent_discrepancies"]
    outputs = projection["predecessor_outputs"]
    decisions = outputs.get("decisions") if isinstance(outputs, dict) else None
    if not isinstance(claims, list) or not isinstance(discrepancies, list) or not isinstance(decisions, list):
        raise HarnessError("projection collection malformed")
    claim_ids = {item.get("claim_id") for item in claims if isinstance(item, dict)}
    if len(claim_ids) != len(claims) or None in claim_ids:
        raise HarnessError("projection claim IDs malformed")
    discrepancy_ids = {item.get("discrepancy_id") for item in discrepancies if isinstance(item, dict)}
    if len(discrepancy_ids) != len(discrepancies) or None in discrepancy_ids:
        raise HarnessError("projection discrepancy IDs malformed")
    by_discrepancy = {item["discrepancy_id"]: item for item in decisions if isinstance(item, dict) and "discrepancy_id" in item}
    if len(by_discrepancy) != len(decisions):
        raise HarnessError("projection decisions malformed")
    unresolved = False
    for discrepancy in discrepancies:
        refs = discrepancy.get("claim_ids")
        if not isinstance(refs, list) or set(refs) - claim_ids:
            raise HarnessError("projection discrepancy claim reference malformed")
        decision = by_discrepancy.get(discrepancy["discrepancy_id"])
        if decision is None:
            unresolved = True
            continue
        kind = decision.get("decision")
        if kind == "select_current_and_supersede_other":
            selected = decision.get("selected_claim_id")
            superseded = decision.get("superseded_claim_ids")
            if selected not in refs or not isinstance(superseded, list) or set(superseded) != set(refs) - {selected}:
                raise HarnessError("projection resolution malformed")
        elif kind == "preserve_unresolved_conflict":
            if discrepancy.get("kind") != "VALUE_CONFLICT":
                raise HarnessError("unresolved decision kind mismatch")
            unresolved = True
        elif kind == "preserve_distinct_authorities":
            if discrepancy.get("kind") != "AUTHORITY_SCOPE_OVERLAP":
                raise HarnessError("distinct authority decision kind mismatch")
            unresolved = True
        else:
            raise HarnessError("unknown projection decision")
    return unresolved


PROJECTION_VARIANTS = {
    "operational-boundary-predicate-renamed-reordered-resolved": 0,
    "operational-boundary-predicate-stale-vs-current": 1,
    "operational-boundary-predicate-lineage-only-metadata": 2,
    "operational-boundary-predicate-genuinely-unresolved-conflict": 3,
    "operational-boundary-predicate-deliberately-separate-authorities": 4,
    "operational-boundary-predicate-missing-predecessor-resolution": 5,
}


def projection_test(
    bundle: dict[str, Any],
    test_id: str,
    variant_id: str,
    expected: Any,
) -> dict[str, Any]:
    counterfactuals = bundle["counterfactuals"]
    if variant_id in PROJECTION_VARIANTS:
        item = counterfactuals[PROJECTION_VARIANTS[variant_id]]
        case = item["case"]
        projection = case["provider_projection"]
        encoded = canon(projection)
        declared = case["canonical_projection"]
        observed = projection_observed(projection)
        wanted = case["expected"]
        if (sha(encoded), len(encoded)) != (declared["sha256"], declared["bytes"]) or observed is not wanted:
            raise UnexpectedPrimary(f"{test_id}: independent projection result or identity mismatch")
        observation = {
            "fixture_id": case["fixture_id"],
            "projection_identity": identity(encoded),
            "observed": observed,
            "expected": wanted,
            "predecessor_result": "FAIL_SELF_ATTESTATION_ADMITTED_ADVERSE_PROJECTION",
            "successor_result": "PASS",
        }
    elif variant_id == "operational-boundary-predicate-no-answer-leakage":
        leakage = counterfactuals[6]["leakage_case"]
        scans = []
        for item in counterfactuals[:6]:
            case = item["case"]
            encoded = canon(case["provider_projection"])
            key_hits = [
                key
                for key in leakage["forbidden_keys"]
                if json.dumps(key, ensure_ascii=False).encode("utf-8") + b":" in encoded
            ]
            token_hits = [token for token in leakage["forbidden_tokens"] if token.encode("utf-8") in encoded]
            scans.append(
                {
                    "fixture_id": case["fixture_id"],
                    "identity": identity(encoded),
                    "forbidden_key_hits": key_hits,
                    "forbidden_token_hits": token_hits,
                }
            )
        if any(item["forbidden_key_hits"] or item["forbidden_token_hits"] for item in scans):
            raise UnexpectedPrimary(f"{test_id}: provider projection answer leakage")
        observation = {
            "projection_scans": scans,
            "scan_count": 6,
            "result": "PASS",
            "predecessor_result": "FAIL_SELF_ATTESTATION_ADMITTED_ADVERSE_PROJECTION",
            "successor_result": "PASS",
        }
    else:
        raise HarnessError(f"unimplemented deterministic projection: {variant_id}")
    facts_available = {
        "candidate_v4_contract_reproducer_result": next(
            item for item in bundle["regressions"]["families"] if item["regression_id"] == "R9-REG-022"
        )["expected_predecessor_failure"]["contract_reproducer_result"],
        "expected": observation.get("observed", observation.get("result")),
        "network_calls": HARNESS_INITIATED_CALL_COUNTS["network"],
        "provider_calls": HARNESS_INITIATED_CALL_COUNTS["provider"],
        "subject_calls": HARNESS_INITIATED_CALL_COUNTS["subject"],
        "qualification_credit": 0,
        "predecessor_result": observation.get("predecessor_result"),
        "successor_result": observation.get("successor_result"),
    }
    observation["semantic_facts"] = {key: facts_available[key] for key in expected}
    return test_receipt("regression", test_id, "PASS", observation, expected)


def archive_matrix_test(
    component_root: pathlib.Path,
    bases: BaseRuns,
    bundle: dict[str, Any],
    test_id: str,
    expected: Any,
) -> dict[str, Any]:
    observations = []
    for scenario in SCENARIOS:
        run_root = bases.get(scenario)
        before = inventory(run_root)
        result = reopen(component_root, run_root)
        after = inventory(run_root)
        status = EXPECTED_SCENARIO_STATUS[scenario]
        rc = 0 if status == "PASS" else 1 if status == "VALID_SUBJECT_FAIL" else 2
        expect_runner(result, rc, status, f"{test_id}/{scenario}")
        if before != after:
            raise UnexpectedPrimary(f"{test_id}/{scenario}: archive reopen mutated base")
        observations.append(
            {
                "scenario": scenario,
                "run_id": run_root.name,
                "status": status,
                "counts": run_counts(run_root),
                "inventory_identity": {
                    "rows_sha256": before["rows_sha256"],
                    "rows_bytes": before["rows_bytes"],
                    "entry_count": before["entry_count"],
                },
                "runner_terminal": result["terminal"],
            }
        )
    family = next(item for item in bundle["regressions"]["families"] if item["regression_id"] == "R9-REG-007")
    if family["expected_predecessor_failure"].get("result") != "FAIL":
        raise UnexpectedPrimary(f"{test_id}: predecessor failure was promoted")
    counts = {
        status: sum(item["status"] == status for item in observations)
        for status in ("PASS", "VALID_SUBJECT_FAIL", "CONTROLLER_INVALID")
    }
    if counts != {"PASS": 2, "VALID_SUBJECT_FAIL": 10, "CONTROLLER_INVALID": 6}:
        raise UnexpectedPrimary(f"{test_id}: current scenario matrix mismatch: {counts}")
    return test_receipt(
        "regression",
        test_id,
        "PASS",
        {
            "semantic_facts": {
                "collaboration_calls": HARNESS_INITIATED_CALL_COUNTS["collaboration"],
                "controller_invalid_scenarios": sum(
                    item["status"] == "CONTROLLER_INVALID"
                    for item in observations
                    if item["scenario"] in {"missing_spawn", "failed_spawn", "missing_output"}
                ),
                "historical_current_authority": False,
                "network_calls": HARNESS_INITIATED_CALL_COUNTS["network"],
                "predecessor_result": family["expected_predecessor_failure"]["result"],
                "provider_calls": HARNESS_INITIATED_CALL_COUNTS["provider"],
                "qualification_credit": 0,
                "subject_calls": HARNESS_INITIATED_CALL_COUNTS["subject"],
                "subject_fail_scenarios": sum(
                    item["status"] == "VALID_SUBJECT_FAIL"
                    for item in observations
                    if item["scenario"].startswith("observed_")
                ),
            },
            "scenario_results": observations,
            "status_counts": counts,
            "predecessor_result": "FAIL",
            "historical_current_authority": False,
            "qualification_credit": 0,
        },
        expected,
    )


def git_environment(extra_env: dict[str, str] | None = None) -> dict[str, str]:
    env = {key: value for key, value in os.environ.items() if not key.startswith("GIT_")}
    env.update({
        "GIT_OPTIONAL_LOCKS": "0",
        "GIT_CONFIG_NOSYSTEM": "1",
        "GIT_CONFIG_GLOBAL": os.devnull,
        "GIT_TERMINAL_PROMPT": "0",
        "LC_ALL": "C",
    })
    if extra_env:
        env.update(extra_env)
    return env


def git_command_prefix(file_protocol: str = "never") -> list[str]:
    return [
        "git",
        "-c", "core.hooksPath=/dev/null",
        "-c", "commit.gpgsign=false",
        "-c", "tag.gpgSign=false",
        "-c", f"protocol.file.allow={file_protocol}",
    ]


def git(command: list[str], cwd: pathlib.Path, extra_env: dict[str, str] | None = None) -> bytes:
    result = subprocess.run(
        [*git_command_prefix(), "-C", str(cwd), *command],
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=git_environment(extra_env),
        timeout=30,
        check=False,
    )
    if result.returncode != 0:
        raise HarnessError(
            f"git {' '.join(command)} failed: {result.stderr.decode('utf-8', errors='replace').strip()}"
        )
    return result.stdout


def git_without_repo(command: list[str], extra_env: dict[str, str] | None = None) -> bytes:
    result = subprocess.run(
        [*git_command_prefix(), *command],
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=git_environment(extra_env),
        timeout=30,
        check=False,
    )
    if result.returncode != 0:
        raise HarnessError(
            f"disposable git {' '.join(command)} failed: "
            f"{result.stderr.decode('utf-8', errors='replace').strip()}"
        )
    return result.stdout


def create_git_sandbox(
    component_root: pathlib.Path,
    temp_root: pathlib.Path,
) -> dict[str, Any]:
    repo = temp_root / "repo"
    repo.mkdir()
    successor = repo / "tests" / "agent_packet_restrictions" / "successor_20260813"
    candidate = successor / "r9_control_plane_stabilization_v1" / "iteration_011"
    candidate.parent.mkdir(parents=True)
    shutil.copytree(component_root, candidate)
    shutil.copy2(
        component_root.parent / BUILD_CONTRACT[0],
        candidate.parent / BUILD_CONTRACT[0],
        follow_symlinks=False,
    )
    source_successor = successor_root(component_root)
    for _, name, _, _ in SHARED:
        shutil.copy2(source_successor / name, successor / name, follow_symlinks=False)
    unrelated = repo / "unrelated.txt"
    unrelated.write_bytes(b"initial\n")
    git_without_repo(["init", "-b", "main", str(repo)])
    git(["config", "user.name", "PW R9 Harness"], repo)
    git(["config", "user.email", "pw-r9-harness.invalid@example.invalid"], repo)
    git(["add", "--", "tests", "unrelated.txt"], repo)
    fixed_env = {
        "GIT_AUTHOR_DATE": "2026-08-17T00:00:00Z",
        "GIT_COMMITTER_DATE": "2026-08-17T00:00:00Z",
    }
    git(["commit", "-m", "exact iteration 011 component"], repo, fixed_env)
    git(["update-ref", "refs/remotes/origin/main", "HEAD"], repo)
    head = git(["rev-parse", "HEAD"], repo).decode("ascii").strip()
    origin = git(["rev-parse", "refs/remotes/origin/main"], repo).decode("ascii").strip()
    if head != origin:
        raise HarnessError("isolated Git sandbox HEAD/origin mismatch")
    evidence = temp_root / "evidence"
    evidence.mkdir()
    return {
        "repo": repo,
        "successor": successor,
        "component": candidate,
        "evidence": evidence,
        "initial_head": head,
    }


def persist_git_bundle(
    sandbox: dict[str, Any],
    output_root: pathlib.Path,
    relative_path: pathlib.Path,
) -> dict[str, Any]:
    temporary = pathlib.Path(sandbox["repo"]).parent / "candidate.bundle"
    git(["bundle", "create", str(temporary), "--all"], sandbox["repo"])
    data = regular_bytes(temporary, "temporary Git bundle")
    destination = output_root / relative_path
    output_identity = write_exclusive(destination, data, output_root)
    return {
        "path": destination.relative_to(output_root).as_posix(),
        **output_identity,
        "format": "GIT_BUNDLE",
    }


def clean_activity() -> dict[str, Any]:
    return {
        "tool_calls": 0,
        "file_accesses": 0,
        "browsing": 0,
        "network_accesses": 0,
        "delegations": 0,
        "memory_accesses": 0,
        "followup_turns": 0,
        "nonterminal_messages": [],
        "observation_basis": "ROOT_VISIBLE_COLLABORATION_DELIVERIES",
    }


def spawn_receipt(request: dict[str, Any]) -> dict[str, Any]:
    path = request["expected_canonical_task_path"]
    return {
        "schema_id": "pw-r9-subagent-spawn-receipt-event-v1",
        "invocation_id": request["invocation_id"],
        "spawn_request_sha256": sha(canon(request)),
        "tool_result": {"task_name": path},
        "returned_identity_kind": "canonical_task_path",
        "returned_canonical_task_path": path,
    }


def terminal_delivery(request: dict[str, Any], final: str) -> dict[str, Any]:
    return {
        "schema_id": "pw-r9-subagent-terminal-delivery-event-v1",
        "invocation_id": request["invocation_id"],
        "returned_canonical_task_path": request["expected_canonical_task_path"],
        "message_type": "FINAL_ANSWER",
        "final_utf8": final,
        "observed_activity": clean_activity(),
        "terminal_status": "FINAL_RETURNED",
    }


class InteractiveRunner:
    def __init__(self, component_root: pathlib.Path, evidence_root: pathlib.Path, run_id: str) -> None:
        self.command = [
            sys.executable,
            str(component_root / "runner.py"),
            "run-canary",
            "--run-root",
            run_id,
        ]
        self.process = subprocess.Popen(
            self.command,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=str(component_root),
            env=runner_environment(evidence_root),
            bufsize=0,
        )
        self.lines: list[bytes] = []
        self.started = time.monotonic()
        register_pid(self.process.pid, self.command)
        if _ACTIVE_EXPERIMENT is not None:
            _ACTIVE_EXPERIMENT["interactive"].append(self)

    @property
    def pid(self) -> int:
        return self.process.pid

    def read_line(self, timeout: float = 30.0) -> tuple[bytes, dict[str, Any]]:
        assert self.process.stdout is not None
        ready, _, _ = select.select([self.process.stdout.fileno()], [], [], timeout)
        if not ready:
            raise HarnessError("interactive runner stdout timeout")
        line = self.process.stdout.readline(MAX_CAPTURE + 1)
        if not line or len(line) > MAX_CAPTURE or not line.endswith(b"\n"):
            raise HarnessError("interactive runner line framing failure")
        self.lines.append(line)
        return line, json_object_bytes(line[:-1], "interactive runner line", storage=False)

    def send(self, value: dict[str, Any]) -> None:
        assert self.process.stdin is not None
        self.process.stdin.write(canon(value) + b"\n")
        self.process.stdin.flush()

    def write_bytes(self, data: bytes) -> None:
        assert self.process.stdin is not None
        self.process.stdin.write(data)
        self.process.stdin.flush()

    def close_input(self) -> None:
        if self.process.stdin is not None and not self.process.stdin.closed:
            try:
                self.process.stdin.close()
            except BrokenPipeError:
                pass

    def finish(self, timeout: float = 60.0) -> dict[str, Any]:
        self.close_input()
        try:
            rc = self.process.wait(timeout=timeout)
        except subprocess.TimeoutExpired as exc:
            self.process.kill()
            self.process.wait(timeout=10)
            raise HarnessError("interactive runner did not terminate") from exc
        assert self.process.stdout is not None and self.process.stderr is not None
        remainder = self.process.stdout.read(MAX_CAPTURE + 1)
        stderr = self.process.stderr.read(MAX_CAPTURE + 1)
        stdout = b"".join(self.lines) + remainder
        values, terminal = parse_runner_stdout(stdout, "interactive runner stdout")
        observation = {
            "arguments": self.command[2:],
            "returncode": rc,
            "stdout": {
                "base64": base64.b64encode(stdout).decode("ascii"),
                **identity(stdout),
                "objects": values,
            },
            "stderr": {"base64": base64.b64encode(stderr).decode("ascii"), **identity(stderr)},
            "terminal": terminal,
            "elapsed_ms": int((time.monotonic() - self.started) * 1000),
        }
        register_capture("interactive_completed", observation)
        return observation


def wait_regular(path: pathlib.Path, timeout: float = 20.0) -> dict[str, Any]:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        try:
            info = os.lstat(path)
        except FileNotFoundError:
            time.sleep(0.001)
            continue
        if stat.S_ISREG(info.st_mode) and not stat.S_ISLNK(info.st_mode):
            data = regular_bytes(path, f"durable boundary {path.name}")
            return {"path": str(path), **identity(data), "mode": stat.S_IMODE(info.st_mode)}
        raise HarnessError(f"durable boundary wrong entry type: {path}")
    raise HarnessError(f"durable boundary timeout: {path}")


_LIBC = ctypes.CDLL(None, use_errno=True)
_LIBC.ptrace.restype = ctypes.c_long
_PTRACE_ATTACH = 16
_PTRACE_DETACH = 17
_PTRACE_SYSCALL = 24
_PTRACE_SETOPTIONS = 0x4200
_PTRACE_GET_SYSCALL_INFO = 0x420E
_PTRACE_GETSIGINFO = 0x4202
_PTRACE_O_TRACESYSGOOD = 1
_PTRACE_O_EXITKILL = 1 << 20
_PTRACE_PEEKDATA = 2
_SYSCALL_ENTRY = 1


def ptrace(request: int, pid: int, address: int = 0, data: int = 0) -> int:
    ctypes.set_errno(0)
    result = _LIBC.ptrace(
        ctypes.c_ulong(request),
        ctypes.c_ulong(pid),
        ctypes.c_void_p(address),
        ctypes.c_void_p(data),
    )
    error = ctypes.get_errno()
    if result == -1 and error:
        raise HarnessError(f"ptrace request {request} failed for {pid}: errno={error}")
    return int(result)


def ptrace_capability_check() -> dict[str, Any]:
    if sys.platform != "linux" or platform.machine().lower() not in {"x86_64", "amd64"}:
        raise HarnessError("Linux x86_64 ptrace is required for honest process boundaries")
    pid = os.fork()
    if pid == 0:
        try:
            signal.pause()
        finally:
            os._exit(0)
    try:
        ptrace(_PTRACE_ATTACH, pid)
        waited, status = os.waitpid(pid, 0)
        if waited != pid or not os.WIFSTOPPED(status):
            raise HarnessError("ptrace capability child did not stop")
        ptrace(_PTRACE_DETACH, pid, 0, 0)
    finally:
        try:
            os.kill(pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
        try:
            os.waitpid(pid, 0)
        except ChildProcessError:
            pass
    return {"platform": sys.platform, "machine": platform.machine(), "attach_detach": "PASS"}


class SyscallTracer:
    def __init__(self, pid: int) -> None:
        self.pid = pid
        self.stopped = False
        ptrace(_PTRACE_ATTACH, pid)
        waited, status = os.waitpid(pid, 0)
        if waited != pid or not os.WIFSTOPPED(status):
            raise HarnessError("tracee did not enter attach stop")
        ptrace(_PTRACE_SETOPTIONS, pid, 0, _PTRACE_O_TRACESYSGOOD | _PTRACE_O_EXITKILL)
        self.stopped = True

    def resume(self, delivered_signal: int = 0) -> None:
        if not self.stopped:
            raise HarnessError("tracee is not stopped")
        ptrace(_PTRACE_SYSCALL, self.pid, 0, delivered_signal)
        self.stopped = False

    def next_stop(self, timeout: float = 20.0) -> dict[str, Any]:
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            waited, status = os.waitpid(self.pid, os.WNOHANG)
            if waited == 0:
                time.sleep(0.0005)
                continue
            if os.WIFEXITED(status) or os.WIFSIGNALED(status):
                return {"terminal": True, "status": status}
            if not os.WIFSTOPPED(status):
                raise HarnessError("unexpected ptrace wait status")
            self.stopped = True
            stop_signal = os.WSTOPSIG(status)
            result: dict[str, Any] = {"terminal": False, "stop_signal": stop_signal, "syscall": None}
            if stop_signal == (signal.SIGTRAP | 0x80):
                buffer = ctypes.create_string_buffer(128)
                size = ptrace(_PTRACE_GET_SYSCALL_INFO, self.pid, len(buffer), ctypes.addressof(buffer))
                raw = buffer.raw[: max(0, size)]
                if raw and raw[0] == _SYSCALL_ENTRY and len(raw) >= 80:
                    number = int.from_bytes(raw[24:32], sys.byteorder)
                    args = [int.from_bytes(raw[32 + index * 8 : 40 + index * 8], sys.byteorder) for index in range(6)]
                    result["syscall"] = {"number": number, "args": args}
            return result
        raise HarnessError("ptrace stop timeout")

    def next_syscall_entry(self, timeout: float = 20.0) -> dict[str, Any]:
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            if self.stopped:
                self.resume()
            stop = self.next_stop(max(0.01, deadline - time.monotonic()))
            if stop.get("terminal"):
                raise HarnessError("tracee terminated before requested syscall boundary")
            if stop.get("syscall") is not None:
                return stop["syscall"]
            signal_number = int(stop["stop_signal"])
            trap_stops = {signal.SIGTRAP, signal.SIGSTOP, signal.SIGTRAP | 0x80}
            self.resume(signal_number if signal_number not in trap_stops else 0)
        raise HarnessError("syscall entry timeout")

    def next_stdin_read_entry(self, timeout: float = 20.0) -> dict[str, Any]:
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            call = self.next_syscall_entry(max(0.01, deadline - time.monotonic()))
            if call["number"] == 0 and call["args"][0] == 0:
                return {"syscall": "read", "number": 0, "fd": 0, "args": call["args"]}
            self.resume()
        raise HarnessError("following read(fd=0) barrier timeout")

    def read_cstring(self, address: int, maximum: int = 4096) -> str:
        chunks = bytearray()
        word = ctypes.sizeof(ctypes.c_long)
        while len(chunks) < maximum:
            value = ptrace(_PTRACE_PEEKDATA, self.pid, address + len(chunks), 0)
            chunk = int(value & ((1 << (word * 8)) - 1)).to_bytes(word, sys.byteorder)
            if b"\0" in chunk:
                chunks.extend(chunk.split(b"\0", 1)[0])
                break
            chunks.extend(chunk)
        try:
            return bytes(chunks).decode("utf-8")
        except UnicodeDecodeError as exc:
            raise HarnessError("tracee pathname was not UTF-8") from exc

    def read_uint64(self, address: int) -> int:
        value = ptrace(_PTRACE_PEEKDATA, self.pid, address, 0)
        return int(value & ((1 << 64) - 1))

    def signal_info(self) -> dict[str, Any]:
        if not self.stopped:
            raise HarnessError("PTRACE_GETSIGINFO requires stopped tracee")
        buffer = ctypes.create_string_buffer(128)
        ptrace(_PTRACE_GETSIGINFO, self.pid, 0, ctypes.addressof(buffer))
        raw = buffer.raw
        return {
            "si_signo": int.from_bytes(raw[0:4], sys.byteorder, signed=True),
            "si_errno": int.from_bytes(raw[4:8], sys.byteorder, signed=True),
            "si_code": int.from_bytes(raw[8:12], sys.byteorder, signed=True),
            "raw_sha256": sha(raw),
            "raw_bytes": len(raw),
        }

    def kill(self) -> dict[str, Any]:
        success = True
        try:
            os.kill(self.pid, signal.SIGKILL)
        except ProcessLookupError:
            success = False
        if self.stopped:
            try:
                self.resume()
            except HarnessError:
                pass
        _, status = os.waitpid(self.pid, 0)
        return {
            "kill_success": success,
            "wait_status": status,
            "terminated_by": os.WTERMSIG(status) if os.WIFSIGNALED(status) else None,
        }

    def detach(self, delivered_signal: int = 0) -> None:
        if not self.stopped:
            raise HarnessError("detach requires stopped tracee")
        ptrace(_PTRACE_DETACH, self.pid, 0, delivered_signal)
        self.stopped = False


def persist_signal_receipt(
    output_root: pathlib.Path,
    test_id: str,
    sequence: int,
    pid: int,
    signal_number: int,
    kill_success: bool,
    controlled_delivery_stop: bool,
    signal_info: dict[str, Any] | None = None,
    reinjection_success: bool | None = None,
    following_read_barrier: dict[str, Any] | None = None,
) -> dict[str, Any]:
    value = {
        "schema_id": SIGNAL_SCHEMA,
        "test_id": test_id,
        "sequence": sequence,
        "pid": pid,
        "signal": signal.Signals(signal_number).name,
        "signal_number": signal_number,
        "kill_success": kill_success,
        "controlled_delivery_stop": controlled_delivery_stop,
        "ptrace_getsiginfo": signal_info,
        "reinjection_success": reinjection_success,
        "following_read_barrier": following_read_barrier,
        "created_utc": utc_now(),
        "calls": call_observation(),
        "authority": dict(ZERO_AUTHORITY),
    }
    path = output_root / "signals" / safe_id(test_id) / f"{sequence:02d}.json"
    file_identity = write_receipt(path, value, output_root)
    return {"path": path.relative_to(output_root).as_posix(), **file_identity, **value}


def persist_process_state(
    output_root: pathlib.Path,
    test_id: str,
    evidence_root: pathlib.Path,
    sandbox: dict[str, Any] | None,
) -> dict[str, Any]:
    evidence_path = output_root / "archives" / "process-evidence" / f"{safe_id(test_id)}.tar"
    evidence_archive = archive_tree_create_only(evidence_root, evidence_path, output_root)
    result = {
        "evidence_archive": {
            "path": evidence_path.relative_to(output_root).as_posix(),
            **evidence_archive,
        }
    }
    if sandbox is not None:
        result["component_git_bundle"] = persist_git_bundle(
            sandbox,
            output_root,
            pathlib.Path("git-bundles") / f"{safe_id(test_id)}.bundle",
        )
    return result


def actual_reopen_pair(
    component_root: pathlib.Path,
    evidence_root: pathlib.Path,
    run_id: str,
    wanted_status: str = "CONTROLLER_INVALID",
) -> dict[str, Any]:
    before = inventory(evidence_root / run_id)
    first = invoke_runner(component_root, evidence_root, ["reopen", "--run-root", run_id])
    middle = inventory(evidence_root / run_id)
    second = invoke_runner(component_root, evidence_root, ["reopen", "--run-root", run_id])
    after = inventory(evidence_root / run_id)
    rc = 0 if wanted_status == "PASS" else 1 if wanted_status == "VALID_SUBJECT_FAIL" else 2
    expect_runner(first, rc, wanted_status, f"{run_id} reopen 1")
    expect_runner(second, rc, wanted_status, f"{run_id} reopen 2")
    if before != middle or middle != after or first["terminal"] != second["terminal"]:
        raise UnexpectedPrimary(f"{run_id}: reopens changed evidence or differed")
    return {
        "inventory_before": before,
        "inventory_after_first": middle,
        "inventory_after_second": after,
        "first": first,
        "second": second,
    }


ROW_ENTRY_ORDER = (
    "provider_input.txt",
    "spawn_message.txt",
    "attempt.json",
    "spawn_receipt.json",
    "raw_result.json",
    "completion.json",
)
RUN_TOP_FILE_ORDER = ("run.json", "matrix_terminal.json", "accounting.json")

PROCESS_EXPECTATION_SCHEMAS: dict[str, dict[str, type | tuple[type, ...]] | type] = {
    "expected_cause": {"detail": str, "kind": str},
    "expected_counts": {
        "attempts": int,
        "best_of_count": int,
        "captured_raw_results": int,
        "captured_spawn_records": int,
        "completed_rows": int,
        "invalid_rows": int,
        "planned_calls": int,
        "replacement_count": int,
        "retry_count": int,
        "stage_artifacts": int,
        "stopped_rows": int,
        "subject_fail_rows": int,
    },
    "expected_first_process": {
        "conventional_shell_status": int,
        "subprocess_returncode": int,
    },
    "expected_mechanical_counts": {
        "attempt_files": int,
        "completion_files": int,
        "fail_completions": int,
        "planned_calls_from_run_json": int,
        "raw_result_files": int,
        "spawn_receipt_files": int,
    },
    "expected_prefix": {
        "complete_rows": int,
        "completion_present": bool,
        "files_per_row": int,
        "other_rows": list,
        "raw_terminal_semantically_valid": bool,
        "row_directories": int,
        "row_files": list,
        "unchanged_after_second_invocation": bool,
    },
    "expected_primary_process": {
        "conventional_shell_status": int,
        "normal_rc": type(None),
        "persisted_status": type(None),
        "subprocess_returncode": int,
    },
    "expected_primary_rc": int,
    "expected_reopen": {
        "completion_synthesized": bool,
        "error": str,
        "error_type": str,
        "offline_verifier_report_present": bool,
        "offline_verifier_valid": bool,
        "qualification_clean_run_credit": int,
        "rc": int,
        "schema_id": str,
        "status": str,
    },
    "expected_second_process": {
        "error": str,
        "error_type": str,
        "new_evidence_entries": int,
        "rc": int,
        "schema_id": str,
        "spawn_requests": int,
        "status": str,
    },
    "expected_signal_evidence": {
        "SIGINT_delivery_stops": int,
        "SIGINT_sends": int,
        "SIGTERM_delivery_stops": int,
        "SIGTERM_sends": int,
        "exact_signal_kinds": list,
        "runner_persisted_signal_count": type(None),
    },
    "expected_status": str,
    "expected_tree": {
        "accounting_present": bool,
        "artifact_files": int,
        "matrix_terminal_present": bool,
        "sealed": bool,
        "terminal_files": (int, list),
        "top_files": list,
    },
}


def expected_process_tree(design: dict[str, Any]) -> dict[str, Any]:
    expected = {key: value for key, value in design.items() if key.startswith("expected_")}
    if not expected:
        raise HarnessError(f"{design.get('fault_id')}: sealed fault has no expected_* tree")
    return expected


def validate_process_expectation_schema(expected: dict[str, Any], label: str) -> None:
    unknown_sections = set(expected) - set(PROCESS_EXPECTATION_SCHEMAS)
    if unknown_sections:
        raise HarnessError(f"{label}: unknown expected sections: {sorted(unknown_sections)}")
    for section, value in expected.items():
        schema = PROCESS_EXPECTATION_SCHEMAS[section]
        if isinstance(schema, type):
            if type(value) is not schema:
                raise HarnessError(f"{label}: {section} has invalid exact type")
            continue
        if not isinstance(value, dict) or not value:
            raise HarnessError(f"{label}: {section} must be a nonempty object")
        allowed = set(schema)
        if section == "expected_prefix":
            unknown = {
                key for key in value
                if key not in allowed or (key.startswith("row-") and not re.fullmatch(r"row-[0-9]{3}", key))
            }
            unknown -= {key for key in value if re.fullmatch(r"row-[0-9]{3}", key)}
        else:
            unknown = set(value) - allowed
        if unknown:
            raise HarnessError(f"{label}: unmodeled leaves in {section}: {sorted(unknown)}")
        for key, item in value.items():
            wanted_type = list if section == "expected_prefix" and key.startswith("row-") else schema[key]
            types = wanted_type if isinstance(wanted_type, tuple) else (wanted_type,)
            if type(item) not in types:
                raise HarnessError(f"{label}: {section}/{key} has invalid exact type")
            if isinstance(item, list) and any(type(part) is not str for part in item):
                raise HarnessError(f"{label}: {section}/{key} list must contain only strings")


def json_leaf_rows(value: Any, path: tuple[str | int, ...] = ()) -> list[tuple[tuple[str | int, ...], Any]]:
    if isinstance(value, dict):
        rows: list[tuple[tuple[str | int, ...], Any]] = []
        for key in sorted(value):
            rows.extend(json_leaf_rows(value[key], (*path, key)))
        return rows
    if isinstance(value, list):
        if not value:
            return [(path, value)]
        rows = []
        for index, item in enumerate(value):
            rows.extend(json_leaf_rows(item, (*path, index)))
        return rows
    return [(path, value)]


def leaf_path_text(path: tuple[str | int, ...]) -> str:
    return "/".join(str(part) for part in path)


def recursively_require_exact_typed(expected: Any, observed: Any, path: str, label: str) -> None:
    if type(expected) is not type(observed):
        raise UnexpectedPrimary(
            f"{label}: exact type mismatch at {path}: {type(expected).__name__} != {type(observed).__name__}"
        )
    if isinstance(expected, dict):
        if set(expected) != set(observed):
            raise UnexpectedPrimary(f"{label}: exact object-key mismatch at {path}")
        for key in sorted(expected):
            recursively_require_exact_typed(expected[key], observed[key], f"{path}/{key}", label)
    elif isinstance(expected, list):
        if len(expected) != len(observed):
            raise UnexpectedPrimary(f"{label}: exact list-length mismatch at {path}")
        for index, item in enumerate(expected):
            recursively_require_exact_typed(item, observed[index], f"{path}/{index}", label)
    elif expected != observed:
        raise UnexpectedPrimary(f"{label}: exact value mismatch at {path}: {expected!r} != {observed!r}")


def require_total_expected_observation(
    expected: dict[str, Any], observed: dict[str, Any], label: str
) -> list[str]:
    validate_process_expectation_schema(expected, label)
    expected_paths = [path for path, _ in json_leaf_rows(expected)]
    observed_paths = [path for path, _ in json_leaf_rows(observed)]
    if expected_paths != observed_paths:
        raise UnexpectedPrimary(
            f"{label}: exact expected/observed leaf-path set mismatch: "
            f"expected={[leaf_path_text(path) for path in expected_paths]!r} "
            f"observed={[leaf_path_text(path) for path in observed_paths]!r}"
        )
    recursively_require_exact_typed(expected, observed, "", label)
    return [leaf_path_text(path) for path in expected_paths]


def ordered_row_entries(names: set[str]) -> list[str]:
    return [name for name in ROW_ENTRY_ORDER if name in names] + sorted(names - set(ROW_ENTRY_ORDER))


def collect_process_observation_sources(
    run_root: pathlib.Path,
    primary: dict[str, Any],
    reopens: dict[str, Any],
    signal_receipts: list[dict[str, Any]],
    case_context: dict[str, Any] | None,
    label: str,
) -> dict[str, Any]:
    tree = inventory(run_root)
    top_entries = {item.name for item in run_root.iterdir()}
    rows_root = run_root / "rows"
    if not rows_root.is_dir() or rows_root.is_symlink():
        raise UnexpectedPrimary(f"{label}: durable rows directory missing")
    direct_row_files = sorted(
        item.name for item in rows_root.iterdir()
        if not item.is_dir() or item.is_symlink()
    )
    row_entries = {
        row.name: ordered_row_entries({item.name for item in row.iterdir()})
        for row in rows_root.iterdir()
        if row.is_dir() and not row.is_symlink()
    }
    artifact_root = run_root / "artifacts"
    terminal_root = run_root / "terminals"
    artifact_files = sum(
        path.is_file() and not path.is_symlink()
        for path in artifact_root.rglob("*")
    ) if artifact_root.is_dir() and not artifact_root.is_symlink() else 0
    terminal_files = sorted(
        f"terminals/{path.name}" for path in terminal_root.iterdir()
        if path.is_file() and not path.is_symlink()
    ) if terminal_root.is_dir() and not terminal_root.is_symlink() else []
    matrix = accounting = None
    if "matrix_terminal.json" in top_entries:
        _, matrix = read_json(run_root / "matrix_terminal.json", f"{label} matrix")
    if "accounting.json" in top_entries:
        _, accounting = read_json(run_root / "accounting.json", f"{label} accounting")
    return {
        "run_root": run_root,
        "primary": primary,
        "reopens": reopens,
        "signal_receipts": signal_receipts,
        "case_context": case_context or {},
        "tree_inventory": tree,
        "top_entries": top_entries,
        "direct_row_files": direct_row_files,
        "row_entries": row_entries,
        "artifact_files": artifact_files,
        "terminal_files": terminal_files,
        "matrix": matrix,
        "accounting": accounting,
    }


def observe_expected_cause(expected: dict[str, Any], source: dict[str, Any]) -> dict[str, Any]:
    matrix = source["matrix"]
    if not isinstance(matrix, dict) or not isinstance(matrix.get("cause"), dict):
        raise UnexpectedPrimary("expected_cause: durable matrix cause missing")
    return {key: matrix["cause"].get(key) for key in expected}


def observe_expected_counts(expected: dict[str, Any], source: dict[str, Any]) -> dict[str, Any]:
    accounting = source["accounting"]
    if not isinstance(accounting, dict):
        raise UnexpectedPrimary("expected_counts: durable accounting missing")
    aliases = {
        "best_of_count": "best_of",
        "completed_rows": "valid_completions",
        "stage_artifacts": "stage_artifact_count",
    }
    observed = {}
    for key in expected:
        actual_key = aliases.get(key, key)
        if actual_key not in accounting:
            raise UnexpectedPrimary(f"expected_counts: accounting leaf missing: {actual_key}")
        value = accounting[actual_key]
        observed[key] = int(value) if key == "best_of_count" and type(value) is bool else value
    return observed


def observe_process_result(expected: dict[str, Any], result: dict[str, Any]) -> dict[str, Any]:
    if "returncode" not in result or not isinstance(result.get("terminal"), dict):
        raise UnexpectedPrimary("process-result observation incomplete")
    rc = result["returncode"]
    values = {
        "conventional_shell_status": 128 + (-rc) if type(rc) is int and rc < 0 else rc,
        "normal_rc": rc if type(rc) is int and rc >= 0 else None,
        "persisted_status": result["terminal"].get("status"),
        "subprocess_returncode": rc,
    }
    return {key: values[key] for key in expected}


def observe_expected_first_process(expected: dict[str, Any], source: dict[str, Any]) -> dict[str, Any]:
    return observe_process_result(expected, source["primary"])


def observe_expected_primary_process(expected: dict[str, Any], source: dict[str, Any]) -> dict[str, Any]:
    return observe_process_result(expected, source["primary"])


def observe_expected_mechanical_counts(expected: dict[str, Any], source: dict[str, Any]) -> dict[str, Any]:
    counts = run_counts(source["run_root"])
    _, run = read_json(source["run_root"] / "run.json", "process mechanical run")
    values = {
        "attempt_files": counts["attempts"],
        "completion_files": counts["completions"],
        "fail_completions": counts["fail"],
        "planned_calls_from_run_json": run.get("planned_call_count"),
        "raw_result_files": counts["raw_results"],
        "spawn_receipt_files": counts["spawn_records"],
    }
    return {key: values[key] for key in expected}


def raw_terminal_semantically_valid(run_root: pathlib.Path) -> bool:
    _, raw = read_json(run_root / "rows" / "row-000" / "raw_result.json", "process raw result")
    encoded = raw.get("root_event_base64")
    if not isinstance(encoded, str):
        return False
    try:
        storage = base64.b64decode(encoded, validate=True)
        if not storage.endswith(b"\n"):
            return False
        event = json_object_bytes(storage[:-1], "process raw terminal", storage=False)
    except (ValueError, binascii.Error, HarnessError):
        return False
    return (
        event.get("schema_id") == "pw-r9-subagent-terminal-delivery-event-v1"
        and event.get("terminal_status") == "FINAL_RETURNED"
    )


def observe_expected_prefix(expected: dict[str, Any], source: dict[str, Any]) -> dict[str, Any]:
    rows = source["row_entries"]
    named_rows = {key for key in expected if re.fullmatch(r"row-[0-9]{3}", key)}
    context = source["case_context"]
    values: dict[str, Any] = {
        "complete_rows": sum(files == list(ROW_ENTRY_ORDER) for files in rows.values()),
        "completion_present": "completion.json" in rows.get("row-000", []),
        "files_per_row": (
            next(iter({len(files) for files in rows.values()}))
            if rows and len({len(files) for files in rows.values()}) == 1
            else -1
        ),
        "other_rows": sorted(set(rows) - named_rows),
        "row_directories": len(rows),
        "row_files": source["direct_row_files"],
        "unchanged_after_second_invocation": (
            context.get("inventory_before_second") == context.get("inventory_after_second")
            if "inventory_before_second" in context and "inventory_after_second" in context
            else False
        ),
    }
    if "raw_terminal_semantically_valid" in expected:
        values["raw_terminal_semantically_valid"] = raw_terminal_semantically_valid(
            source["run_root"]
        )
    for row_id in named_rows:
        values[row_id] = rows.get(row_id, [])
    return {key: values[key] for key in expected}


def reopen_completion_synthesized(reopens: dict[str, Any]) -> bool:
    before = {
        item["path"] for item in reopens["inventory_before"]["entries"]
        if item["type"] == "file" and item["path"].endswith("/completion.json")
    }
    after = {
        item["path"] for item in reopens["inventory_after_second"]["entries"]
        if item["type"] == "file" and item["path"].endswith("/completion.json")
    }
    return bool(after - before)


def observe_reopen(
    expected: dict[str, Any], actual: dict[str, Any], reopens: dict[str, Any], label: str
) -> dict[str, Any]:
    terminal = actual.get("terminal")
    if not isinstance(terminal, dict) or "returncode" not in actual:
        raise UnexpectedPrimary(f"{label}: reopen process observation incomplete")
    observed: dict[str, Any] = {}
    for key in expected:
        if key == "rc":
            observed[key] = actual["returncode"]
        elif key in {"schema_id", "status", "error", "error_type"}:
            if key not in terminal:
                raise UnexpectedPrimary(f"{label}: reopen terminal leaf missing: {key}")
            observed[key] = terminal[key]
        elif key == "offline_verifier_report_present":
            observed[key] = "offline_verifier" in terminal
        elif key == "offline_verifier_valid":
            report = terminal.get("offline_verifier")
            if not isinstance(report, dict) or "valid" not in report:
                raise UnexpectedPrimary(f"{label}: offline verifier valid leaf missing")
            observed[key] = report["valid"]
        elif key == "qualification_clean_run_credit":
            report = terminal.get("offline_verifier")
            credit = report.get("credit") if isinstance(report, dict) else None
            if not isinstance(credit, dict) or "qualification_clean_run_credit" not in credit:
                raise UnexpectedPrimary(f"{label}: qualification clean-run credit leaf missing")
            observed[key] = credit["qualification_clean_run_credit"]
        elif key == "completion_synthesized":
            observed[key] = reopen_completion_synthesized(reopens)
        else:
            raise HarnessError(f"{label}: reopen leaf observer missing: {key}")
    return observed


def observe_expected_primary_rc(expected: int, source: dict[str, Any]) -> int:
    return source["primary"].get("returncode")


def observe_expected_status(expected: str, source: dict[str, Any]) -> Any:
    terminal = source["primary"].get("terminal")
    if not isinstance(terminal, dict):
        raise UnexpectedPrimary("expected_status: primary terminal missing")
    return terminal.get("status")


def observe_expected_second_process(expected: dict[str, Any], source: dict[str, Any]) -> dict[str, Any]:
    context = source["case_context"]
    second = context.get("second_process")
    if not isinstance(second, dict) or not isinstance(second.get("terminal"), dict):
        raise UnexpectedPrimary("expected_second_process: same-root observation missing")
    before = context.get("inventory_before_second")
    after = context.get("inventory_after_second")
    if not isinstance(before, dict) or not isinstance(after, dict):
        raise UnexpectedPrimary("expected_second_process: inventory observations missing")
    before_paths = {item["path"] for item in before["entries"]}
    after_paths = {item["path"] for item in after["entries"]}
    values = {
        "error": second["terminal"].get("error"),
        "error_type": second["terminal"].get("error_type"),
        "new_evidence_entries": len(after_paths - before_paths),
        "rc": second.get("returncode"),
        "schema_id": second["terminal"].get("schema_id"),
        "spawn_requests": sum(
            item.get("schema_id") == "pw-r9-subagent-spawn-request-v1"
            for item in second.get("stdout", {}).get("objects", [])
        ),
        "status": second["terminal"].get("status"),
    }
    return {key: values[key] for key in expected}


def persisted_signal_count(run_root: pathlib.Path) -> Any:
    names = {
        "persisted_signal_count",
        "runner_persisted_signal_count",
        "signal_count",
        "signal_delivery_count",
    }
    found = []

    def walk(value: Any) -> None:
        if isinstance(value, dict):
            for key, item in value.items():
                if key in names:
                    found.append(item)
                walk(item)
        elif isinstance(value, list):
            for item in value:
                walk(item)

    for path in sorted(run_root.rglob("*.json")):
        if path.is_file() and not path.is_symlink():
            _, value = read_json(path, f"signal persistence scan {path.name}")
            walk(value)
    if len(found) > 1:
        raise UnexpectedPrimary("multiple runner-persisted signal counts observed")
    return found[0] if found else None


def observe_expected_signal_evidence(expected: dict[str, Any], source: dict[str, Any]) -> dict[str, Any]:
    receipts = source["signal_receipts"]
    if any(
        receipt.get("ptrace_getsiginfo") is None
        or receipt.get("controlled_delivery_stop") is not True
        or receipt.get("reinjection_success") is not True
        or receipt.get("following_read_barrier", {}).get("fd") != 0
        for receipt in receipts
    ):
        raise UnexpectedPrimary("expected_signal_evidence: exact delivery/reinjection/read proof missing")
    values = {
        "SIGINT_delivery_stops": sum(
            receipt.get("signal") == "SIGINT" and receipt.get("controlled_delivery_stop") is True
            for receipt in receipts
        ),
        "SIGINT_sends": sum(
            receipt.get("signal") == "SIGINT" and receipt.get("kill_success") is True
            for receipt in receipts
        ),
        "SIGTERM_delivery_stops": sum(
            receipt.get("signal") == "SIGTERM" and receipt.get("controlled_delivery_stop") is True
            for receipt in receipts
        ),
        "SIGTERM_sends": sum(
            receipt.get("signal") == "SIGTERM" and receipt.get("kill_success") is True
            for receipt in receipts
        ),
        "exact_signal_kinds": sorted({receipt.get("signal") for receipt in receipts}),
        "runner_persisted_signal_count": persisted_signal_count(source["run_root"]),
    }
    return {key: values[key] for key in expected}


def observe_expected_tree(expected: dict[str, Any], source: dict[str, Any]) -> dict[str, Any]:
    top_entries = source["top_entries"]
    top_files_present = {
        name for name in top_entries
        if (source["run_root"] / name).is_file() and not (source["run_root"] / name).is_symlink()
    }
    ordered_top = [name for name in RUN_TOP_FILE_ORDER if name in top_files_present]
    ordered_top.extend(sorted(top_files_present - set(RUN_TOP_FILE_ORDER)))
    values: dict[str, Any] = {
        "accounting_present": "accounting.json" in top_entries,
        "artifact_files": source["artifact_files"],
        "matrix_terminal_present": "matrix_terminal.json" in top_entries,
        "sealed": {"matrix_terminal.json", "accounting.json"}.issubset(top_entries),
        "top_files": ordered_top,
    }
    if "terminal_files" in expected:
        values["terminal_files"] = (
            len(source["terminal_files"])
            if type(expected["terminal_files"]) is int
            else source["terminal_files"]
        )
    return {key: values[key] for key in expected}


PROCESS_EXPECTATION_OBSERVERS = {
    "expected_cause": observe_expected_cause,
    "expected_counts": observe_expected_counts,
    "expected_first_process": observe_expected_first_process,
    "expected_mechanical_counts": observe_expected_mechanical_counts,
    "expected_prefix": observe_expected_prefix,
    "expected_primary_process": observe_expected_primary_process,
    "expected_primary_rc": observe_expected_primary_rc,
    "expected_second_process": observe_expected_second_process,
    "expected_signal_evidence": observe_expected_signal_evidence,
    "expected_status": observe_expected_status,
    "expected_tree": observe_expected_tree,
}


def compile_observed_expected_process_tree(
    expected: dict[str, Any], source: dict[str, Any], label: str
) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    validate_process_expectation_schema(expected, label)
    observed: dict[str, Any] = {}
    reopen_oracles: list[dict[str, Any]] = []
    for section in sorted(expected):
        if section == "expected_reopen":
            first = observe_reopen(expected[section], source["reopens"]["first"], source["reopens"], f"{label}: first")
            second = observe_reopen(expected[section], source["reopens"]["second"], source["reopens"], f"{label}: second")
            require_total_expected_observation({section: expected[section]}, {section: first}, f"{label}: first reopen")
            require_total_expected_observation({section: expected[section]}, {section: second}, f"{label}: second reopen")
            observed[section] = first
            reopen_oracles = [
                {"reopen": "first", "facts": first, "exact": True},
                {"reopen": "second", "facts": second, "exact": True},
            ]
            continue
        observer = PROCESS_EXPECTATION_OBSERVERS.get(section)
        if observer is None:
            raise HarnessError(f"{label}: expected section has no observation compiler: {section}")
        observed[section] = observer(expected[section], source)
    return observed, reopen_oracles


def exact_process_design_oracle(
    fault_id: str,
    run_root: pathlib.Path,
    primary: dict[str, Any],
    reopens: dict[str, Any],
    signal_receipts: list[dict[str, Any]],
    case_context: dict[str, Any] | None = None,
) -> dict[str, Any]:
    if _BOUND_PROCESS_DESIGN is None:
        raise HarnessError("sealed process design was not bound")
    design = next(item for item in _BOUND_PROCESS_DESIGN["faults"] if item["fault_id"] == fault_id)
    expected = expected_process_tree(design)
    source = collect_process_observation_sources(
        run_root, primary, reopens, signal_receipts, case_context, fault_id
    )
    observed, reopen_oracles = compile_observed_expected_process_tree(expected, source, fault_id)
    leaf_paths = require_total_expected_observation(expected, observed, fault_id)
    return {
        "compiler_schema_id": "pw-r9-total-schema-driven-process-expectation-compiler-v1",
        "design_fault_identity": identity(canon(design)),
        "expected_section_names": sorted(expected),
        "expected_leaf_count": len(leaf_paths),
        "expected_leaf_paths": leaf_paths,
        "observed_expected_facts": observed,
        "tree_inventory": source["tree_inventory"],
        "matrix": source["matrix"],
        "accounting": source["accounting"],
        "reopen_oracles": reopen_oracles,
        "exact_design_oracle": True,
    }


def alternate_json_leaf(value: Any) -> Any:
    if type(value) is bool:
        return not value
    if type(value) is int:
        return value + 1
    if type(value) is str:
        return value + "#MUTANT"
    if value is None:
        return "MUTATED_NULL"
    if isinstance(value, list) and not value:
        return ["MUTATED_EMPTY_LIST"]
    raise HarnessError(f"no bounded mutation for expected leaf type: {type(value).__name__}")


def replace_json_leaf(value: dict[str, Any], path: tuple[str | int, ...], replacement: Any) -> dict[str, Any]:
    changed = json.loads(json.dumps(value))
    cursor: Any = changed
    for part in path[:-1]:
        cursor = cursor[part]
    cursor[path[-1]] = replacement
    return changed


def exhaustive_expected_leaf_mutations(
    process_receipts: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    if _BOUND_PROCESS_DESIGN is None:
        raise HarnessError("sealed process design was not bound")
    rejected = []
    total = 0
    for design in _BOUND_PROCESS_DESIGN["faults"]:
        fault_id = design["fault_id"]
        expected = expected_process_tree(design)
        observed = process_receipts[fault_id]["observation"]["design_oracle"]["observed_expected_facts"]
        require_total_expected_observation(expected, observed, f"{fault_id}: mutation baseline")
        for path, value in json_leaf_rows(expected):
            total += 1
            mutant = replace_json_leaf(expected, path, alternate_json_leaf(value))
            try:
                require_total_expected_observation(mutant, observed, f"{fault_id}: mutant {leaf_path_text(path)}")
            except (HarnessError, UnexpectedPrimary) as exc:
                rejected.append({
                    "fault_id": fault_id,
                    "leaf_path": leaf_path_text(path),
                    "error_type": type(exc).__name__,
                })
            else:
                raise UnexpectedPrimary(f"sealed expected leaf mutant admitted: {fault_id}/{leaf_path_text(path)}")
    sample_design = expected_process_tree(_BOUND_PROCESS_DESIGN["faults"][0])
    sample_observed = process_receipts[PROCESS_IDS[0]]["observation"]["design_oracle"]["observed_expected_facts"]
    schema_mutants = []
    unknown_section = json.loads(json.dumps(sample_design))
    unknown_section["expected_unknown_section"] = {"leaf": 0}
    unknown_leaf = json.loads(json.dumps(sample_design))
    unknown_leaf["expected_tree"]["unknown_leaf"] = 0
    for name, mutant in (("unknown_expected_section", unknown_section), ("unknown_expected_leaf", unknown_leaf)):
        try:
            require_total_expected_observation(mutant, sample_observed, name)
        except (HarnessError, UnexpectedPrimary) as exc:
            schema_mutants.append({"mutation": name, "error_type": type(exc).__name__})
        else:
            raise UnexpectedPrimary(f"process expectation schema mutant admitted: {name}")
    return {
        "schema_id": "pw-r9-exhaustive-sealed-process-expected-leaf-mutations-v1",
        "sealed_executable_leaf_count": total,
        "sealed_executable_leaf_mutants_rejected": len(rejected),
        "all_sealed_executable_leaf_mutants_rejected": len(rejected) == total,
        "schema_mutants": schema_mutants,
        "schema_mutants_rejected": len(schema_mutants),
        "process_relaunches": 0,
        "results": rejected,
        "calls": call_observation(),
        "authority": dict(ZERO_AUTHORITY),
    }


def rogue_row_file_adversary(
    output_root: pathlib.Path,
    stop_before_receipt: dict[str, Any],
) -> dict[str, Any]:
    observation = stop_before_receipt["observation"]
    archive_relative = observation["durable_state"]["evidence_archive"]["path"]
    archive_path = output_root / archive_relative
    with experiment_temp(
        output_root,
        "ROGUE_ROW_FILE_EXPECTATION_ADVERSARY",
        "pw-r9-rogue-row-file-",
    ) as temp_root:
        extracted = temp_root / "extracted"
        extract_regular_tree_archive(archive_path, extracted)
        run_root = extracted / "tree" / "pf-stop-before-admission"
        rogue = run_root / "rows" / "rogue-unexpected-prefix.json"
        rogue_identity = write_exclusive(
            rogue,
            canon({"schema_id": "pw-r9-intentional-rogue-row-prefix-mutant-v1"}) + b"\n",
            run_root,
        )
        mutant_archive_path = (
            output_root / "archives" / "process-adversaries" / "rogue-row-file.tar"
        )
        mutant_archive = archive_tree_create_only(
            run_root, mutant_archive_path, output_root
        )
        try:
            exact_process_design_oracle(
                "STOP_BEFORE_ADMISSION",
                run_root,
                observation["process"],
                observation["reopens"],
                observation["signal_receipts"],
            )
        except UnexpectedPrimary as exc:
            if "leaf-path set mismatch" not in str(exc):
                raise UnexpectedPrimary(
                    f"rogue row file rejected for wrong reason: {exc}"
                ) from exc
            rejection = {"error_type": type(exc).__name__, "error": str(exc)}
        else:
            raise UnexpectedPrimary("rogue row file was admitted by total process compiler")
    return {
        "schema_id": "pw-r9-rogue-row-file-total-compiler-adversary-v1",
        "mutation": "rows/rogue-unexpected-prefix.json",
        "mutation_identity": rogue_identity,
        "mutation_archive": {
            "path": mutant_archive_path.relative_to(output_root).as_posix(),
            **mutant_archive,
        },
        "rejected": True,
        "rejection": rejection,
        "process_relaunches": 0,
        "calls": call_observation(),
        "authority": dict(ZERO_AUTHORITY),
    }


def send_fixture_pair(process: InteractiveRunner, request: dict[str, Any], final: str) -> None:
    process.send(spawn_receipt(request))
    process.send(terminal_delivery(request, final))


def process_stop_before_admission(
    component_root: pathlib.Path,
    output_root: pathlib.Path,
    test_id: str,
) -> dict[str, Any]:
    with experiment_temp(output_root, test_id, "pw-r9-stop-before-") as temp_root:
        sandbox = create_git_sandbox(component_root, temp_root)
        evidence = sandbox["evidence"]
        candidate = sandbox["component"]
        run_id = "pf-stop-before-admission"
        stdin_r, stdin_w = os.pipe()
        stdout_r, stdout_w = os.pipe()
        stderr_r, stderr_w = os.pipe()
        ready_r, ready_w = os.pipe()
        go_r, go_w = os.pipe()
        pending_r, pending_w = os.pipe()
        pid = os.fork()
        if pid == 0:
            try:
                os.close(stdin_w)
                os.close(stdout_r)
                os.close(stderr_r)
                os.close(ready_r)
                os.close(go_w)
                os.close(pending_r)
                os.dup2(stdin_r, 0)
                os.dup2(stdout_w, 1)
                os.dup2(stderr_w, 2)
                signal.pthread_sigmask(signal.SIG_BLOCK, {signal.SIGTERM})
                os.write(ready_w, b"R")
                if os.read(go_r, 1) != b"G":
                    os._exit(120)
                if signal.SIGTERM not in signal.sigpending():
                    os.write(pending_w, b"N")
                    os._exit(122)
                os.write(pending_w, b"P")
                env = runner_environment(evidence)
                os.execve(
                    sys.executable,
                    [
                        sys.executable,
                        str(candidate / "runner.py"),
                        "run-canary",
                        "--run-root",
                        run_id,
                    ],
                    env,
                )
            finally:
                os._exit(121)
        os.close(stdin_r)
        os.close(stdout_w)
        os.close(stderr_w)
        os.close(ready_w)
        os.close(go_r)
        os.close(pending_w)
        if os.read(ready_r, 1) != b"R":
            raise HarnessError("stop-before child synchronization failed")
        kill_success = True
        try:
            os.kill(pid, signal.SIGTERM)
        except ProcessLookupError:
            kill_success = False
        signal_receipt = persist_signal_receipt(
            output_root, test_id, 1, pid, signal.SIGTERM, kill_success, False
        )
        if not kill_success:
            raise UnexpectedPrimary(f"{test_id}: SIGTERM send failed")
        os.write(go_w, b"G")
        os.close(go_w)
        pending_verified = os.read(pending_r, 1) == b"P"
        os.close(pending_r)
        if not pending_verified:
            raise UnexpectedPrimary(f"{test_id}: SIGTERM was not pending before exec")
        os.close(stdin_w)
        deadline = time.monotonic() + 30
        status = None
        while time.monotonic() < deadline:
            waited, candidate_status = os.waitpid(pid, os.WNOHANG)
            if waited:
                status = candidate_status
                break
            time.sleep(0.005)
        if status is None:
            os.kill(pid, signal.SIGKILL)
            os.waitpid(pid, 0)
            raise HarnessError("stop-before child timeout")
        stdout = os.read(stdout_r, MAX_CAPTURE + 1)
        stderr = os.read(stderr_r, MAX_CAPTURE + 1)
        os.close(stdout_r)
        os.close(stderr_r)
        values, terminal = parse_runner_stdout(stdout, "stop-before stdout")
        rc = os.WEXITSTATUS(status) if os.WIFEXITED(status) else -os.WTERMSIG(status)
        process = {
            "returncode": rc,
            "stdout": {"base64": base64.b64encode(stdout).decode("ascii"), **identity(stdout), "objects": values},
            "stderr": {"base64": base64.b64encode(stderr).decode("ascii"), **identity(stderr)},
            "terminal": terminal,
        }
        expect_runner(process, 2, "STOPPED_AFTER_DRAIN", test_id)
        counts = run_counts(evidence / run_id)
        if any(counts.values()):
            raise UnexpectedPrimary(f"{test_id}: admission occurred despite pending signal")
        reopens = actual_reopen_pair(candidate, evidence, run_id, "STOPPED_AFTER_DRAIN")
        design_oracle = exact_process_design_oracle(
            test_id, evidence / run_id, process, reopens, [signal_receipt]
        )
        persisted = persist_process_state(output_root, test_id, evidence, sandbox)
        return test_receipt(
            "process",
            test_id,
            "PASS",
            {
                "semantic_facts": {"attempts": counts["attempts"], "status": process["terminal"].get("status")},
                "process": process,
                "signal_receipts": [signal_receipt],
                "pending_signal_verified_before_exec": pending_verified,
                "counts": counts,
                "reopens": reopens,
                "design_oracle": design_oracle,
                "durable_state": persisted,
            },
            {"attempts": 0, "status": "STOPPED_AFTER_DRAIN"},
        )


def process_safe_drain(
    component_root: pathlib.Path,
    output_root: pathlib.Path,
    test_id: str,
    fault_id: str,
) -> dict[str, Any]:
    with experiment_temp(output_root, test_id, "pw-r9-safe-drain-") as temp_root:
        sandbox = create_git_sandbox(component_root, temp_root)
        run_id = "pf-" + safe_id(fault_id.lower().replace("_", "-"))
        process = InteractiveRunner(sandbox["component"], sandbox["evidence"], run_id)
        _, request = process.read_line()
        signals = []
        boundary = None
        if fault_id == "STOP_AFTER_ATTEMPT":
            success = True
            try:
                os.kill(process.pid, signal.SIGTERM)
            except ProcessLookupError:
                success = False
            signals.append(persist_signal_receipt(output_root, test_id, 1, process.pid, signal.SIGTERM, success, False))
            send_fixture_pair(process, request, "__PW_R9_PROCESS_FAULT_SENTINEL__")
        elif fault_id == "STOP_AFTER_RECEIPT":
            tracer = SyscallTracer(process.pid)
            receipt_read_barrier = tracer.next_stdin_read_entry()
            process.send(spawn_receipt(request))
            tracer.resume()
            boundary = tracer.next_stdin_read_entry()
            signals.append(
                deliver_controlled_signal(tracer, output_root, test_id, 1, signal.SIGTERM)
            )
            process.send(terminal_delivery(request, "__PW_R9_PROCESS_FAULT_SENTINEL__"))
            tracer.detach()
        else:
            raise HarnessError(f"not a simple safe-drain fault: {fault_id}")
        process.close_input()
        result = process.finish()
        expect_runner(result, 2, "STOPPED_AFTER_DRAIN", test_id)
        counts = run_counts(sandbox["evidence"] / run_id)
        if counts["attempts"] != 1 or counts["completions"] != 1 or not all(item["kill_success"] for item in signals):
            raise UnexpectedPrimary(f"{test_id}: admitted chain did not drain exactly once")
        reopens = actual_reopen_pair(sandbox["component"], sandbox["evidence"], run_id, "STOPPED_AFTER_DRAIN")
        design_oracle = exact_process_design_oracle(
            fault_id, sandbox["evidence"] / run_id, result, reopens, signals
        )
        persisted = persist_process_state(output_root, test_id, sandbox["evidence"], sandbox)
        observation = {
            "semantic_facts": {
                "drained": counts["completions"] == 1,
                "status": result["terminal"].get("status"),
            },
            "process": result,
            "signal_receipts": signals,
            "counts": counts,
            "reopens": reopens,
            "design_oracle": design_oracle,
            "durable_state": persisted,
        }
        if fault_id == "STOP_AFTER_RECEIPT":
            observation["initial_receipt_read_barrier"] = receipt_read_barrier
            observation["post_receipt_terminal_read_barrier"] = boundary
        return test_receipt("process", test_id, "PASS", observation, {"drained": True, "status": "STOPPED_AFTER_DRAIN"})


def deliver_controlled_signal(
    tracer: SyscallTracer,
    output_root: pathlib.Path,
    test_id: str,
    sequence: int,
    signal_number: int,
) -> dict[str, Any]:
    success = True
    try:
        os.kill(tracer.pid, signal_number)
    except ProcessLookupError:
        success = False
    if not success:
        raise UnexpectedPrimary(f"{test_id}: signal send failed at sequence {sequence}")
    if not tracer.stopped:
        raise HarnessError("controlled signal requires stopped stdin-read barrier")
    tracer.resume()
    delivery_seen = False
    deadline = time.monotonic() + 20
    while time.monotonic() < deadline:
        stop = tracer.next_stop(deadline - time.monotonic())
        if stop.get("terminal"):
            raise UnexpectedPrimary(f"{test_id}: process terminated before controlled delivery")
        if stop["stop_signal"] == signal_number:
            delivery_seen = True
            break
        tracer.resume(
            0
            if stop["stop_signal"] in {signal.SIGTRAP, signal.SIGSTOP, signal.SIGTRAP | 0x80}
            else stop["stop_signal"]
        )
    if not delivery_seen:
        raise UnexpectedPrimary(f"{test_id}: controlled signal delivery stop missing")
    signal_info = tracer.signal_info()
    if signal_info["si_signo"] != signal_number or signal_info["si_errno"] != 0:
        raise UnexpectedPrimary(f"{test_id}: exact PTRACE_GETSIGINFO mismatch at sequence {sequence}")
    tracer.resume(signal_number)
    reinjection_success = True
    following = tracer.next_stdin_read_entry(20)
    if following != {"syscall": "read", "number": 0, "fd": 0, "args": following["args"]}:
        raise UnexpectedPrimary(f"{test_id}: following stdin-read barrier mismatch")
    return persist_signal_receipt(
        output_root,
        test_id,
        sequence,
        tracer.pid,
        signal_number,
        success,
        delivery_seen,
        signal_info=signal_info,
        reinjection_success=reinjection_success,
        following_read_barrier=following,
    )


def process_repeated_signals(
    component_root: pathlib.Path,
    output_root: pathlib.Path,
    test_id: str,
) -> dict[str, Any]:
    with experiment_temp(output_root, test_id, "pw-r9-repeated-signals-") as temp_root:
        sandbox = create_git_sandbox(component_root, temp_root)
        run_id = "pf-repeated-signals-safe-drain"
        process = InteractiveRunner(sandbox["component"], sandbox["evidence"], run_id)
        _, request = process.read_line()
        tracer = SyscallTracer(process.pid)
        receipt_read_barrier = tracer.next_stdin_read_entry()
        receipts = []
        for sequence, signal_number in enumerate((signal.SIGINT, signal.SIGINT), 1):
            receipts.append(
                deliver_controlled_signal(tracer, output_root, test_id, sequence, signal_number)
            )
        process.send(spawn_receipt(request))
        tracer.resume()
        terminal_read_barrier = tracer.next_stdin_read_entry()
        for sequence, signal_number in enumerate((signal.SIGTERM, signal.SIGTERM), 3):
            receipts.append(
                deliver_controlled_signal(tracer, output_root, test_id, sequence, signal_number)
            )
        process.send(terminal_delivery(request, "__PW_R9_PROCESS_FAULT_SENTINEL__"))
        tracer.detach()
        process.close_input()
        result = process.finish()
        expect_runner(result, 2, "STOPPED_AFTER_DRAIN", test_id)
        counts = run_counts(sandbox["evidence"] / run_id)
        signal_counts = {
            "SIGINT": sum(item["signal"] == "SIGINT" and item["kill_success"] for item in receipts),
            "SIGTERM": sum(item["signal"] == "SIGTERM" and item["kill_success"] for item in receipts),
        }
        if signal_counts != {"SIGINT": 2, "SIGTERM": 2} or counts["completions"] != 1:
            raise UnexpectedPrimary(f"{test_id}: exact repeated-signal drain mismatch")
        reopens = actual_reopen_pair(sandbox["component"], sandbox["evidence"], run_id, "STOPPED_AFTER_DRAIN")
        design_oracle = exact_process_design_oracle(
            test_id, sandbox["evidence"] / run_id, result, reopens, receipts
        )
        persisted = persist_process_state(output_root, test_id, sandbox["evidence"], sandbox)
        return test_receipt(
            "process",
            test_id,
            "PASS",
            {
                "semantic_facts": {
                    "SIGINT_kill_successes": signal_counts["SIGINT"],
                    "SIGTERM_kill_successes": signal_counts["SIGTERM"],
                    "drained": counts["completions"] == 1,
                },
                "process": result,
                "signal_receipts": receipts,
                "receipt_read_barrier": receipt_read_barrier,
                "terminal_read_barrier": terminal_read_barrier,
                "successful_signal_counts": signal_counts,
                "runner_persisted_stop_state_residual": "one Boolean stop condition; multiplicity is external-receipt evidence",
                "counts": counts,
                "reopens": reopens,
                "design_oracle": design_oracle,
                "durable_state": persisted,
            },
            {"SIGINT_kill_successes": 2, "SIGTERM_kill_successes": 2, "drained": True},
        )


def trace_until_completion_open(
    tracer: SyscallTracer,
    row_id: str,
    timeout: float = 30.0,
) -> dict[str, Any]:
    deadline = time.monotonic() + timeout
    suffix = f"/rows/{row_id}/completion.json"
    while time.monotonic() < deadline:
        call = tracer.next_syscall_entry(deadline - time.monotonic())
        number = call["number"]
        if number in {2, 257, 437}:  # Linux x86_64 open, openat, openat2
            if number == 2:
                path = tracer.read_cstring(call["args"][0])
                flags = call["args"][1]
                syscall_name = "open"
            elif number == 257:
                path = tracer.read_cstring(call["args"][1])
                flags = call["args"][2]
                syscall_name = "openat"
            else:
                path = tracer.read_cstring(call["args"][1])
                flags = tracer.read_uint64(call["args"][2])
                syscall_name = "openat2"
            if path.endswith(suffix) and flags & os.O_CREAT and flags & os.O_EXCL:
                return {"syscall": syscall_name, "number": number, "path": path, "flags": flags}
        tracer.resume()
    raise HarnessError(f"completion create syscall boundary not observed: {row_id}")


def process_raw_valid_crash(
    component_root: pathlib.Path,
    output_root: pathlib.Path,
    test_id: str,
) -> dict[str, Any]:
    with experiment_temp(output_root, test_id, "pw-r9-valid-raw-crash-") as temp_root:
        sandbox = create_git_sandbox(component_root, temp_root)
        run_id = "pf-raw-prefix-reopen-invalid"
        process = InteractiveRunner(sandbox["component"], sandbox["evidence"], run_id)
        _, request = process.read_line()
        tracer = SyscallTracer(process.pid)
        process.send(spawn_receipt(request))
        process.send(terminal_delivery(request, "__PW_R9_PROCESS_FAULT_SENTINEL__"))
        boundary = trace_until_completion_open(tracer, "row-000")
        raw_boundary = wait_regular(
            sandbox["evidence"] / run_id / "rows" / "row-000" / "raw_result.json"
        )
        completion_path = sandbox["evidence"] / run_id / "rows" / "row-000" / "completion.json"
        if completion_path.exists():
            raise UnexpectedPrimary(f"{test_id}: completion existed at its create syscall-entry")
        signal_receipt = persist_signal_receipt(
            output_root, test_id, 1, process.pid, signal.SIGKILL, True, True
        )
        killed = tracer.kill()
        process.process.returncode = -signal.SIGKILL
        result = process.finish()
        counts = run_counts(sandbox["evidence"] / run_id)
        if counts["raw_results"] != 1 or counts["completions"] != 0 or killed["terminated_by"] != signal.SIGKILL:
            raise UnexpectedPrimary(f"{test_id}: valid raw crash prefix mismatch")
        reopens = actual_reopen_pair(sandbox["component"], sandbox["evidence"], run_id)
        design_oracle = exact_process_design_oracle(
            test_id, sandbox["evidence"] / run_id, result, reopens, [signal_receipt]
        )
        persisted = persist_process_state(output_root, test_id, sandbox["evidence"], sandbox)
        return test_receipt(
            "process",
            test_id,
            "PASS",
            {
                "semantic_facts": {
                    "raw_results": counts["raw_results"],
                    "completions": counts["completions"],
                    "status": reopens["first"]["terminal"].get("status"),
                },
                "process": result,
                "ptrace_boundary": boundary,
                "raw_durable_boundary": raw_boundary,
                "signal_receipts": [signal_receipt],
                "wait": killed,
                "counts": counts,
                "typed_public_prefix_substitute": False,
                "valid_terminal_captured_before_crash": True,
                "reopens": reopens,
                "design_oracle": design_oracle,
                "durable_state": persisted,
            },
            {"raw_results": 1, "completions": 0, "status": "CONTROLLER_INVALID"},
        )


def process_after_request_hard_loss(
    component_root: pathlib.Path,
    output_root: pathlib.Path,
    test_id: str,
    same_root_reinvoke: bool = False,
) -> dict[str, Any]:
    with experiment_temp(output_root, test_id, "pw-r9-request-hard-loss-") as temp_root:
        sandbox = create_git_sandbox(component_root, temp_root)
        run_id = "pf-same-root-reinvoke" if same_root_reinvoke else "pf-hard-loss-after-request"
        process = InteractiveRunner(sandbox["component"], sandbox["evidence"], run_id)
        _, request = process.read_line()
        attempt_boundary = wait_regular(
            sandbox["evidence"] / run_id / "rows" / "row-000" / "attempt.json"
        )
        success = True
        try:
            os.kill(process.pid, signal.SIGKILL)
        except ProcessLookupError:
            success = False
        signal_receipt = persist_signal_receipt(
            output_root, test_id, 1, process.pid, signal.SIGKILL, success, False
        )
        if not success:
            raise UnexpectedPrimary(f"{test_id}: SIGKILL send failed")
        rc = process.process.wait(timeout=20)
        result = process.finish()
        if rc != -signal.SIGKILL:
            raise UnexpectedPrimary(f"{test_id}: hard loss wait status mismatch: {rc}")
        run_root = sandbox["evidence"] / run_id
        counts = run_counts(run_root)
        if counts["attempts"] != 1 or counts["spawn_records"] != 0 or counts["completions"] != 0:
            raise UnexpectedPrimary(f"{test_id}: request hard-loss prefix mismatch")
        reinvoke = None
        request_count = None
        reinvoke_before = inventory(run_root)
        reinvoke_after = None
        if same_root_reinvoke:
            reinvoke = invoke_runner(
                sandbox["component"],
                sandbox["evidence"],
                ["run-canary", "--run-root", run_id],
            )
            expect_runner(reinvoke, 2, "CONTROLLER_INVALID", test_id)
            request_count = sum(
                item.get("schema_id") == "pw-r9-subagent-spawn-request-v1"
                for item in reinvoke["stdout"]["objects"]
            )
            reinvoke_after = inventory(run_root)
            if request_count != 0 or reinvoke_after != reinvoke_before:
                raise UnexpectedPrimary(f"{test_id}: same-root reinvoke emitted request or mutated evidence")
        reopens = actual_reopen_pair(sandbox["component"], sandbox["evidence"], run_id)
        design_oracle = exact_process_design_oracle(
            test_id,
            run_root,
            result,
            reopens,
            [signal_receipt],
            {
                "second_process": reinvoke,
                "inventory_before_second": reinvoke_before,
                "inventory_after_second": reinvoke_after,
            } if same_root_reinvoke else None,
        )
        persisted = persist_process_state(output_root, test_id, sandbox["evidence"], sandbox)
        return test_receipt(
            "process",
            test_id,
            "PASS",
            {
                "semantic_facts": {
                    "minimum_attempts": counts["attempts"],
                    "second_request_count": request_count if same_root_reinvoke else None,
                    "status": reopens["first"]["terminal"].get("status"),
                },
                "first_process": result,
                "first_request": request,
                "attempt_boundary": attempt_boundary,
                "signal_receipts": [signal_receipt],
                "counts": counts,
                "same_root_reinvoke": reinvoke,
                "inventory_before_reinvoke": reinvoke_before,
                "inventory_after_reinvoke": reinvoke_after,
                "reopens": reopens,
                "design_oracle": design_oracle,
                "durable_state": persisted,
            },
            {
                "minimum_attempts": 1,
                "second_request_count": 0 if same_root_reinvoke else None,
                "status": "CONTROLLER_INVALID",
            },
        )


def drive_first_two_canary_rows(process: InteractiveRunner) -> list[dict[str, Any]]:
    requests = []
    for _ in range(2):
        _, request = process.read_line()
        requests.append(request)
        send_fixture_pair(process, request, "__PW_R9_PROCESS_FAULT_SENTINEL__")
    return requests


def trace_until_post_completion_read(
    tracer: SyscallTracer,
    completion_path: pathlib.Path,
    timeout: float = 30.0,
) -> tuple[dict[str, Any], dict[str, Any]]:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        call = tracer.next_syscall_entry(deadline - time.monotonic())
        if call["number"] == 0 and call["args"][0] == 0 and completion_path.is_file():
            completion = wait_regular(completion_path)
            return call, completion
        tracer.resume()
    raise HarnessError("post-completion require_eof read boundary not observed")


def process_completion_or_eof_boundary(
    component_root: pathlib.Path,
    output_root: pathlib.Path,
    test_id: str,
    root_eof: bool,
) -> dict[str, Any]:
    with experiment_temp(output_root, test_id, "pw-r9-completion-boundary-") as temp_root:
        sandbox = create_git_sandbox(component_root, temp_root)
        run_id = "pf-root-eof-trailing-bytes" if root_eof else "pf-completion-prefix-reopen-invalid"
        process = InteractiveRunner(sandbox["component"], sandbox["evidence"], run_id)
        requests = drive_first_two_canary_rows(process)
        _, third = process.read_line()
        requests.append(third)
        tracer = SyscallTracer(process.pid)
        process.send(spawn_receipt(third))
        process.send(terminal_delivery(third, "__PW_R9_PROCESS_FAULT_SENTINEL__"))
        read_call, completion = trace_until_post_completion_read(
            tracer,
            sandbox["evidence"] / run_id / "rows" / "row-002" / "completion.json",
        )
        signal_receipts = []
        if root_eof:
            process.write_bytes(b"X")
            process.close_input()
            tracer.detach()
            result = process.finish()
            expect_runner(result, 2, "CONTROLLER_INVALID", test_id)
        else:
            signal_receipts.append(
                persist_signal_receipt(output_root, test_id, 1, process.pid, signal.SIGKILL, True, True)
            )
            killed = tracer.kill()
            process.process.returncode = -signal.SIGKILL
            result = process.finish()
            if killed["terminated_by"] != signal.SIGKILL:
                raise UnexpectedPrimary(f"{test_id}: completion-boundary hard loss mismatch")
        counts = run_counts(sandbox["evidence"] / run_id)
        if counts["completions"] != 3:
            raise UnexpectedPrimary(f"{test_id}: third completion not durable at boundary")
        reopens = actual_reopen_pair(sandbox["component"], sandbox["evidence"], run_id)
        design_oracle = exact_process_design_oracle(
            test_id, sandbox["evidence"] / run_id, result, reopens, signal_receipts
        )
        persisted = persist_process_state(output_root, test_id, sandbox["evidence"], sandbox)
        return test_receipt(
            "process",
            test_id,
            "PASS",
            {
                "semantic_facts": {
                    "completion_files": counts["completions"],
                    "root_eof_typed": root_eof,
                    "status": reopens["first"]["terminal"].get("status"),
                },
                "process": result,
                "requests": requests,
                "ptrace_require_eof_read_entry": read_call,
                "completion_durable_boundary": completion,
                "trailing_bytes": {"base64": "WA==", **identity(b"X")} if root_eof else None,
                "signal_receipts": signal_receipts,
                "counts": counts,
                "reopens": reopens,
                "design_oracle": design_oracle,
                "durable_state": persisted,
            },
            {
                "completion_files": 3,
                "root_eof_typed": root_eof,
                "status": "CONTROLLER_INVALID",
            },
        )


def exact_git_binding_test(
    component_root: pathlib.Path,
    output_root: pathlib.Path,
    test_id: str,
    expected: Any,
) -> dict[str, Any]:
    with experiment_temp(output_root, test_id, "pw-r9-git-binding-") as temp_root:
        sandbox = create_git_sandbox(component_root, temp_root)
        repo = sandbox["repo"]
        head = sandbox["initial_head"]
        rows = []
        for name, (role, wanted_sha, wanted_bytes) in COMPONENT_FILES.items():
            rel = (sandbox["component"] / name).relative_to(repo).as_posix()
            blob = git(["cat-file", "blob", f"{head}:{rel}"], repo)
            if (sha(blob), len(blob)) != (wanted_sha, wanted_bytes):
                raise UnexpectedPrimary(f"{test_id}: Git component blob mismatch: {name}")
            rows.append({"role": role, "path": rel, **identity(blob)})
        for role, name, wanted_sha, wanted_bytes in SHARED:
            rel = (sandbox["successor"] / name).relative_to(repo).as_posix()
            blob = git(["cat-file", "blob", f"{head}:{rel}"], repo)
            if (sha(blob), len(blob)) != (wanted_sha, wanted_bytes):
                raise UnexpectedPrimary(f"{test_id}: Git shared blob mismatch: {name}")
            rows.append({"role": role, "path": rel, **identity(blob)})
        bundle = persist_git_bundle(
            sandbox, output_root, pathlib.Path("git-bundles") / f"{safe_id(test_id)}.bundle"
        )
        return test_receipt(
            "global",
            test_id,
            "PASS",
            {
                "semantic_facts": {
                    "bundle_exact": bundle["sha256"] == sha(regular_bytes(output_root / bundle["path"], "Git bundle reopen")),
                    "git_binding_recorded": head
                    == git(["rev-parse", "refs/remotes/origin/main"], repo).decode("ascii").strip(),
                },
                "head": head,
                "origin_main": git(["rev-parse", "refs/remotes/origin/main"], repo).decode("ascii").strip(),
                "blob_rows": rows,
                "bundle": bundle,
            },
            expected,
        )


def historical_head_test(
    component_root: pathlib.Path,
    output_root: pathlib.Path,
    bundle: dict[str, Any],
    test_id: str,
    expected: Any,
) -> dict[str, Any]:
    with experiment_temp(output_root, test_id, "pw-r9-historical-head-") as temp_root:
        sandbox = create_git_sandbox(component_root, temp_root)
        run_id = "historical-head-canary"
        process = InteractiveRunner(sandbox["component"], sandbox["evidence"], run_id)
        oracle = bundle["cells"][0]["expected_output_utf8"]
        requests = []
        for _ in range(3):
            _, request = process.read_line()
            requests.append(request)
            send_fixture_pair(process, request, oracle)
        process.close_input()
        primary = process.finish()
        expect_runner(primary, 0, "PASS", test_id)
        run_root = sandbox["evidence"] / run_id
        before_advance = inventory(run_root)
        first_reopen = invoke_runner(
            sandbox["component"], sandbox["evidence"], ["reopen", "--run-root", run_id]
        )
        expect_runner(first_reopen, 0, "PASS", test_id)
        old_head = sandbox["initial_head"]
        unrelated = sandbox["repo"] / "unrelated.txt"
        unrelated.write_bytes(b"initial\nhead advanced without component change\n")
        git(["add", "--", "unrelated.txt"], sandbox["repo"])
        git(
            ["commit", "-m", "advance unrelated head"],
            sandbox["repo"],
            {
                "GIT_AUTHOR_DATE": "2026-08-17T00:00:01Z",
                "GIT_COMMITTER_DATE": "2026-08-17T00:00:01Z",
            },
        )
        git(["update-ref", "refs/remotes/origin/main", "HEAD"], sandbox["repo"])
        new_head = git(["rev-parse", "HEAD"], sandbox["repo"]).decode("ascii").strip()
        if old_head == new_head:
            raise UnexpectedPrimary(f"{test_id}: unrelated HEAD did not advance")
        second_reopen = invoke_runner(
            sandbox["component"], sandbox["evidence"], ["reopen", "--run-root", run_id]
        )
        expect_runner(second_reopen, 0, "PASS", test_id)
        custody = second_reopen["terminal"].get("offline_verifier", {}).get("custody", {})
        if custody.get("recorded_head_equals_present_head") is not False or custody.get(
            "recorded_commit_source_blobs_reopened"
        ) is not True:
            raise UnexpectedPrimary(f"{test_id}: historical recorded-commit custody was not independently reopened")
        after_advance = inventory(run_root)
        if before_advance != after_advance:
            raise UnexpectedPrimary(f"{test_id}: historical evidence changed across HEAD advance/reopen")
        persisted = persist_process_state(output_root, test_id, sandbox["evidence"], sandbox)
        return test_receipt(
            "regression",
            test_id,
            "PASS",
            {
                "semantic_facts": {
                    "head_equal": old_head == new_head,
                    "predecessor_error_code": "RUN_GIT_HEAD_DRIFT",
                    "predecessor_result": "FAIL",
                    "provider_calls": HARNESS_INITIATED_CALL_COUNTS["provider"],
                    "qualification_credit": 0,
                    "recorded_commit_source_blobs_reopened": custody.get("recorded_commit_source_blobs_reopened"),
                    "recorded_run_evidence_unchanged": before_advance == after_advance,
                    "subject_calls": HARNESS_INITIATED_CALL_COUNTS["subject"],
                    "successor_result": "PASS",
                },
                "primary": primary,
                "requests": requests,
                "first_reopen": first_reopen,
                "old_head": old_head,
                "new_head": new_head,
                "head_equal": False,
                "second_reopen": second_reopen,
                "recorded_commit_source_blobs_reopened": True,
                "recorded_run_evidence_unchanged": True,
                "inventory_before_advance": before_advance,
                "inventory_after_advance_reopen": after_advance,
                "durable_reproducer": persisted,
                "zero_external_invocation_canary": True,
                "qualification_credit": 0,
            },
            expected,
        )


PROCESS_VARIANT_MAP = {
    "stop-after-receipt-drain": "STOP_AFTER_RECEIPT",
    "repeated-signal-safe-drain": "REPEATED_SIGNALS_SAFE_DRAIN",
    "hard-loss-after-request": "HARD_LOSS_AFTER_REQUEST",
    "stop-after-attempt-drain": "STOP_AFTER_ATTEMPT",
    "raw-prefix-reopen-invalid": "RAW_PREFIX_REOPEN_INVALID",
    "completion-prefix-reopen-invalid": "COMPLETION_PREFIX_REOPEN_INVALID",
    "loss-after-raw": "RAW_PREFIX_REOPEN_INVALID",
    "loss-after-completion": "COMPLETION_PREFIX_REOPEN_INVALID",
    "incomplete-fuse-after-request": "HARD_LOSS_AFTER_REQUEST",
    "same-root-reinvoke": "SAME_ROOT_REINVOKE_ZERO_REQUEST",
}


def execute_process_fault(
    component_root: pathlib.Path,
    output_root: pathlib.Path,
    fault_id: str,
) -> dict[str, Any]:
    test_id = fault_id
    if fault_id == "STOP_BEFORE_ADMISSION":
        return process_stop_before_admission(component_root, output_root, test_id)
    if fault_id in {"STOP_AFTER_ATTEMPT", "STOP_AFTER_RECEIPT"}:
        return process_safe_drain(component_root, output_root, test_id, fault_id)
    if fault_id == "REPEATED_SIGNALS_SAFE_DRAIN":
        return process_repeated_signals(component_root, output_root, test_id)
    if fault_id == "HARD_LOSS_AFTER_REQUEST":
        return process_after_request_hard_loss(component_root, output_root, test_id)
    if fault_id == "RAW_PREFIX_REOPEN_INVALID":
        return process_raw_valid_crash(component_root, output_root, test_id)
    if fault_id == "COMPLETION_PREFIX_REOPEN_INVALID":
        return process_completion_or_eof_boundary(component_root, output_root, test_id, False)
    if fault_id == "SAME_ROOT_REINVOKE_ZERO_REQUEST":
        return process_after_request_hard_loss(component_root, output_root, test_id, True)
    if fault_id == "ROOT_EOF_TRAILING_BYTES":
        return process_completion_or_eof_boundary(component_root, output_root, test_id, True)
    raise HarnessError(f"unimplemented process fault: {fault_id}")


def process_reference_test(
    output_root: pathlib.Path,
    test_id: str,
    variant_id: str,
    expected: Any,
    process_receipts: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    process_id = PROCESS_VARIANT_MAP[variant_id]
    record = process_receipts[process_id]
    path = output_root / record["path"]
    data, value = read_json(path, f"process receipt {process_id}")
    if value.get("result") != "PASS" or value.get("test_id") != process_id:
        raise UnexpectedPrimary(f"{test_id}: referenced process receipt not PASS/current")
    observation = value.get("observation", {})
    durable = observation.get("durable_state")
    if not isinstance(durable, dict) or "evidence_archive" not in durable:
        raise UnexpectedPrimary(f"{test_id}: process receipt lacks durable independently reopenable state")
    if variant_id in {"raw-prefix-reopen-invalid", "loss-after-raw"}:
        if observation.get("valid_terminal_captured_before_crash") is not True or observation.get(
            "typed_public_prefix_substitute"
        ) is not False:
            raise UnexpectedPrimary(f"{test_id}: raw crash proof was substituted by typed invalid terminal")
    counts = observation.get("counts", {})
    first_reopen = observation.get("reopens", {}).get("first", {})
    first_reopen_terminal = first_reopen.get("terminal", {})
    signal_receipts = observation.get("signal_receipts", [])
    process_result = observation.get("process") or observation.get("first_process") or {}
    reinvoke = observation.get("same_root_reinvoke")
    available = {
        "drained": counts.get("completions") == 1,
        "minimum_completions": counts.get("completions", 0),
        "no_later_request": counts.get("attempts") == 1,
        "rc": first_reopen.get("returncode", process_result.get("returncode")),
        "status": first_reopen_terminal.get("status", process_result.get("terminal", {}).get("status")),
        "exact_stop_signal_kinds": sorted({item.get("signal") for item in signal_receipts}),
        "minimum_sigint_sends": sum(item.get("signal") == "SIGINT" and item.get("kill_success") for item in signal_receipts),
        "minimum_sigterm_sends": sum(item.get("signal") == "SIGTERM" and item.get("kill_success") for item in signal_receipts),
        "incomplete_chain": counts.get("completions") == 0,
        "minimum_attempts": counts.get("attempts", 0),
        "no_relaunch": True,
        "no_completion_synthesis": counts.get("completions") == 0
        and observation.get("reopens", {}).get("inventory_before")
        == observation.get("reopens", {}).get("inventory_after_second"),
        "reopen_without_transport": True,
        "evidence_unchanged": observation.get("inventory_before_reinvoke")
        == observation.get("reopens", {}).get("inventory_before"),
        "second_rc": reinvoke.get("returncode") if isinstance(reinvoke, dict) else None,
        "second_request_count": sum(
            item.get("schema_id") == "pw-r9-subagent-spawn-request-v1"
            for item in reinvoke.get("stdout", {}).get("objects", [])
        ) if isinstance(reinvoke, dict) else None,
    }
    return test_receipt(
        "regression",
        test_id,
        "PASS",
        {
            "semantic_facts": {key: available[key] for key in expected},
            "process_fault_id": process_id,
            "process_receipt": {"path": record["path"], **identity(data)},
            "process_result": value["result"],
            "durable_state": durable,
            "direct_process_observation_reopened": True,
        },
        expected,
    )


def validate_output_target(path: pathlib.Path) -> None:
    if not path.is_absolute() or ".." in path.parts:
        raise HarnessError("output root must be an absolute lexical path")
    if os.path.lexists(path):
        raise HarnessError("output root must be absent")
    current = pathlib.Path(path.anchor)
    for part in path.parts[1:-1]:
        current = current / part
        info = os.lstat(current)
        if stat.S_ISLNK(info.st_mode) or not stat.S_ISDIR(info.st_mode):
            raise HarnessError(f"output ancestor must be nonlink directory: {current}")


class Executor:
    def __init__(
        self,
        component_root: pathlib.Path,
        evidence_root: pathlib.Path,
        output_root: pathlib.Path,
        bundle: dict[str, Any],
        static: dict[str, Any],
        bases: BaseRuns,
        ptrace_capability: dict[str, Any],
    ) -> None:
        self.component_root = component_root
        self.evidence_root = evidence_root
        self.output_root = output_root
        self.bundle = bundle
        self.static = static
        self.bases = bases
        self.ptrace_capability = ptrace_capability
        self.variants: dict[tuple[str, str], dict[str, Any]] = {}
        self.globals: dict[str, dict[str, Any]] = {}
        self.process: dict[str, dict[str, Any]] = {}

    def prove_archived_static_reconstruction(
        self,
        source_archive_path: pathlib.Path,
        harness_rows: list[dict[str, Any]],
    ) -> dict[str, Any]:
        with experiment_temp(
            self.output_root,
            "ARCHIVED_STATIC_RECONSTRUCTION",
            "pw-r9-archived-reconstruction-",
        ) as temp_root:
            reconstructed = temp_root / "reconstructed"
            extract_regular_tree_archive(source_archive_path, reconstructed)
            archived_repo = reconstructed / "tree"
            archived_component = (
                archived_repo
                / "tests"
                / "agent_packet_restrictions"
                / "successor_20260813"
                / "r9_control_plane_stabilization_v1"
                / "iteration_011"
            )
            archived_contract = archived_component.parent / BUILD_CONTRACT[0]
            contract_data = regular_bytes(archived_contract, "archived reconstruction build contract")
            if (sha(contract_data), len(contract_data)) != (BUILD_CONTRACT[1], BUILD_CONTRACT[2]):
                raise UnexpectedPrimary("archived reconstruction build-contract identity mismatch")
            archived_harness_root = (
                archived_component.parent
                / "simulator_runs"
                / pathlib.Path(__file__).resolve().parent.name
            )
            archived_harness_root.parent.mkdir(parents=True, exist_ok=True)
            exclusive_dir(archived_harness_root)
            for row in harness_rows:
                source = self.output_root / row["path"]
                data = regular_bytes(source, f"archived output source {row['path']}")
                if identity(data) != {"sha256": row["sha256"], "bytes": row["bytes"]}:
                    raise UnexpectedPrimary(f"archived output source identity mismatch: {row['path']}")
                destination_root = (
                    archived_repo / "tests" / "agent_packet_restrictions" / "successor_20260813"
                    if row["archive_scope"] == "successor"
                    else archived_harness_root
                )
                write_exclusive(destination_root / row["archive_name"], data, archived_repo)
            archived_harness = archived_harness_root / pathlib.Path(__file__).name
            evidence = temp_root / "evidence"
            exclusive_dir(evidence)
            absent_output = temp_root / "absent-output"
            module_name = f"pw_r9_archived_harness_{sha(regular_bytes(archived_harness, 'archived harness import'))[:16]}"
            spec = importlib.util.spec_from_file_location(module_name, archived_harness)
            if spec is None or spec.loader is None:
                raise HarnessError("archived harness import specification unavailable")
            module = importlib.util.module_from_spec(spec)
            prior_bytecode = sys.dont_write_bytecode
            sys.dont_write_bytecode = True
            try:
                spec.loader.exec_module(module)
                module.validate_output_target(absent_output)
                archived_static = module.static_check(archived_component, evidence)
            finally:
                sys.dont_write_bytecode = prior_bytecode
            if archived_static.get("status") != "PASS" or archived_static.get("evidence_writes") != 0:
                raise UnexpectedPrimary("archived-only reconstructed static_check did not PASS zero-write")
            if absent_output.exists():
                raise UnexpectedPrimary("archived-only reconstructed static_check created output target")
            if archived_static.get("component_identity") != EXPECTED_COMPONENT_IDENTITY:
                raise UnexpectedPrimary("archived-only reconstructed component identity mismatch")
            return {
                "status": archived_static["status"],
                "static_check_identity": identity(canon(archived_static)),
                "component_identity": archived_static["component_identity"],
                "build_contract": identity(contract_data),
                "evidence_writes": archived_static["evidence_writes"],
                "output_target_created": False,
                "source_borrowing": 0,
                "input_roots": [
                    source_archive_path.relative_to(self.output_root).as_posix(),
                    "source-bytes/harness",
                    "source-bytes/successor",
                ],
                "archived_harness_executed": True,
            }

    def persist_self_contained_inputs(self) -> dict[str, Any]:
        base_archives = []
        seen = set()
        for record in sorted(self.bases.records, key=lambda item: (item["scenario"], item["run_id"])):
            run_root = self.bases.get(record["scenario"])
            if run_root in seen:
                continue
            seen.add(run_root)
            destination = self.output_root / "archives" / "base-runs" / f"{safe_id(record['scenario'])}.tar"
            archived = archive_tree_create_only(run_root, destination, self.output_root)
            base_archives.append({
                "scenario": record["scenario"],
                "run_id": run_root.name,
                "path": destination.relative_to(self.output_root).as_posix(),
                **archived,
            })
        with experiment_temp(self.output_root, "SELF_CONTAINED_SOURCE_CUSTODY", "pw-r9-source-custody-") as temp_root:
            sandbox = create_git_sandbox(self.component_root, temp_root)
            source_archive_path = self.output_root / "archives" / "source-sandbox.tar"
            source_archive = archive_tree_create_only(sandbox["repo"], source_archive_path, self.output_root)
            git_bundle = persist_git_bundle(sandbox, self.output_root, pathlib.Path("git-bundles/source-sandbox.bundle"))
        harness_rows = []
        harness_root = pathlib.Path(__file__).resolve().parent
        for name in sorted({pathlib.Path(__file__).name, *HARNESS_ARTIFACTS, BINDING_CENSUS[0]}):
            data = regular_bytes(harness_root / name, f"self-contained harness source {name}")
            destination = self.output_root / "source-bytes" / "harness" / name
            stored = write_exclusive(destination, data, self.output_root)
            harness_rows.append({
                "path": destination.relative_to(self.output_root).as_posix(),
                "archive_scope": "harness",
                "archive_name": name,
                **stored,
            })
        source_successor = successor_root(self.component_root)
        for name in sorted(SUCCESSOR_HARNESS_ARTIFACTS):
            data = regular_bytes(source_successor / name, f"self-contained successor source {name}")
            destination = self.output_root / "source-bytes" / "successor" / name
            stored = write_exclusive(destination, data, self.output_root)
            harness_rows.append({
                "path": destination.relative_to(self.output_root).as_posix(),
                "archive_scope": "successor",
                "archive_name": name,
                **stored,
            })
        harness_rows.sort(key=lambda item: item["path"])
        build_data = regular_bytes(
            self.component_root.parent / BUILD_CONTRACT[0],
            "self-contained build contract source",
        )
        if (sha(build_data), len(build_data)) != (BUILD_CONTRACT[1], BUILD_CONTRACT[2]):
            raise HarnessError("self-contained build contract identity drift")
        build_destination = self.output_root / "source-bytes" / "build-contract" / BUILD_CONTRACT[0]
        build_stored = write_exclusive(build_destination, build_data, self.output_root)
        reconstruction = self.prove_archived_static_reconstruction(
            source_archive_path,
            harness_rows,
        )
        value = {
            "schema_id": "pw-r9-independent-stabilization-self-contained-inputs-v1",
            "base_runs": base_archives,
            "source_sandbox": {
                "path": source_archive_path.relative_to(self.output_root).as_posix(),
                **source_archive,
            },
            "source_git_bundle": git_bundle,
            "harness_and_governance_bytes": harness_rows,
            "build_contract_byte_custody": {
                "path": build_destination.relative_to(self.output_root).as_posix(),
                **build_stored,
            },
            "archived_only_static_reconstruction": reconstruction,
            "component_identity": self.static["component_identity"],
            "shared_authorities": self.static["shared_authorities"],
            "calls": call_observation(),
            "authority": dict(ZERO_AUTHORITY),
        }
        write_receipt(self.output_root / "self-contained-inputs.json", value, self.output_root)
        return value

    def close_and_reopen_output(self, terminal: dict[str, Any]) -> dict[str, Any]:
        before = inventory(self.output_root)
        entries = [dict(item) for item in before["entries"]]
        entries.append({
            "path": "final-inventory.json",
            "type": "file",
            "mode": 0o444,
            "identity_disposition": "SELF_ROW_PATH_AND_TYPE_ONLY_FIXED_POINT_EXEMPTION",
        })
        entries.sort(key=lambda item: item["path"])
        final_inventory = {
            "schema_id": "pw-r9-independent-stabilization-complete-sorted-inventory-v1",
            "entry_count": len(entries),
            "entries": entries,
            "sorted": entries == sorted(entries, key=lambda item: item["path"]),
            "self_row_fixed_point_exemption": "path/type/mode are complete; self sha256/bytes cannot be embedded in its own bytes",
            "required_reopen_count_per_entry": 2,
            "terminal_path": "terminal-receipt.json",
        }
        write_receipt(self.output_root / "final-inventory.json", final_inventory, self.output_root)
        actual = inventory(self.output_root)
        if [item["path"] for item in actual["entries"]] != [item["path"] for item in entries]:
            raise UnexpectedPrimary("final output complete sorted path inventory mismatch")
        reopened = 0
        for item in actual["entries"]:
            path = self.output_root / item["path"]
            if item["type"] == "file":
                first = regular_bytes(path, f"final reopen 1 {item['path']}")
                second = regular_bytes(path, f"final reopen 2 {item['path']}")
                if first != second:
                    raise UnexpectedPrimary(f"final double reopen byte mismatch: {item['path']}")
            else:
                first_stat = os.lstat(path)
                second_stat = os.lstat(path)
                if (first_stat.st_dev, first_stat.st_ino, first_stat.st_mode) != (
                    second_stat.st_dev, second_stat.st_ino, second_stat.st_mode
                ):
                    raise UnexpectedPrimary(f"final double reopen entry mismatch: {item['path']}")
            reopened += 1
        terminal_first = regular_bytes(self.output_root / "terminal-receipt.json", "terminal final reopen 1")
        terminal_second = regular_bytes(self.output_root / "terminal-receipt.json", "terminal final reopen 2")
        if terminal_first != terminal_second:
            raise UnexpectedPrimary("terminal final double reopen mismatch")
        return {
            **terminal,
            "closure": {
                "complete_sorted_inventory": "final-inventory.json",
                "entries_reopened_twice": reopened,
                "terminal_reopened_twice": True,
                "writes_after_final_inventory": 0,
            },
        }

    def persist_test(self, category: str, test_id: str, value: dict[str, Any]) -> dict[str, Any]:
        path = self.output_root / "receipts" / category / f"{safe_id(test_id)}.json"
        file_identity = write_receipt(path, value, self.output_root)
        return {"path": path.relative_to(self.output_root).as_posix(), **file_identity}

    def run_process_faults(self) -> None:
        for fault_id in PROCESS_IDS:
            with failure_scope(self.output_root, fault_id, [self.evidence_root]):
                value = execute_process_fault(self.component_root, self.output_root, fault_id)
                if value.get("result") != "PASS":
                    raise UnexpectedPrimary(f"process fault failed: {fault_id}")
                self.process[fault_id] = self.persist_test("process", fault_id, value)

    def run_process_oracle_adversaries(self) -> None:
        values = {}
        for fault_id in PROCESS_IDS:
            record = self.process[fault_id]
            _, values[fault_id] = read_json(
                self.output_root / record["path"],
                f"bounded process receipt {fault_id}",
            )
        exhaustive = exhaustive_expected_leaf_mutations(values)
        if (
            exhaustive.get("all_sealed_executable_leaf_mutants_rejected") is not True
            or exhaustive.get("sealed_executable_leaf_mutants_rejected")
            != exhaustive.get("sealed_executable_leaf_count")
            or exhaustive.get("schema_mutants_rejected") != 2
        ):
            raise UnexpectedPrimary("exhaustive sealed process expectation mutations failed")
        rogue = rogue_row_file_adversary(
            self.output_root,
            values["STOP_BEFORE_ADMISSION"],
        )
        if rogue.get("rejected") is not True:
            raise UnexpectedPrimary("rogue row-file adversary was not rejected")
        result = {
            "schema_id": "pw-r9-total-process-expectation-adversaries-v1",
            "exhaustive_expected_leaf_mutations": exhaustive,
            "rogue_row_file": rogue,
            "process_relaunches": 0,
            "calls": call_observation(),
            "authority": dict(ZERO_AUTHORITY),
        }
        self.persist_test("process-adversaries", "total-schema-driven-compiler", result)

    def run_variant(
        self,
        family: dict[str, Any],
        variant: dict[str, Any],
    ) -> None:
        regression_id = family["regression_id"]
        variant_id = variant["variant_id"]
        test_id = f"{regression_id}--{variant_id}"
        strategy = variant["strategy"]
        tamper = variant.get("tamper")
        expected = variant["expect"]
        if variant_id == "required-fault-union":
            return
        with failure_scope(self.output_root, test_id, [self.evidence_root]):
            if variant_id in PROCESS_VARIANT_MAP:
                value = process_reference_test(
                    self.output_root, test_id, variant_id, expected, self.process
                )
            elif strategy == "evidence_mutation":
                if not isinstance(tamper, str):
                    raise HarnessError(f"{test_id}: evidence mutation lacks tamper")
                value = evidence_mutation_test(
                    self.component_root, self.bases, self.output_root, test_id, tamper, expected
                )
            elif strategy == "source_binding_projection":
                if tamper not in SOURCE_TAMPERS:
                    raise HarnessError(f"{test_id}: unsupported source tamper: {tamper}")
                value = source_mutation_test(
                    self.component_root, self.output_root, test_id, str(tamper), expected
                )
            elif strategy in {
                "clean_reference",
                "protocol_subject_success",
                "protocol_controller_invalid",
                "protocol_subject_fail",
            }:
                scenario = variant.get("backend_scenario") or "clean"
                value = base_reference_test(
                    self.component_root, self.bases, test_id, scenario, expected
                )
            elif strategy == "static_assertion":
                if variant_id in {"current-byte-check-only", "data-only-check-result"}:
                    value = check_only_test(
                        self.component_root, self.evidence_root, test_id, expected
                    )
                else:
                    value = component_static_test(
                        self.component_root, self.bundle, test_id, variant_id, expected
                    )
            elif strategy == "deterministic_projection_execution":
                value = projection_test(self.bundle, test_id, variant_id, expected)
            elif strategy == "protocol_archive_and_negative_matrix":
                value = archive_matrix_test(
                    self.component_root, self.bases, self.bundle, test_id, expected
                )
            elif strategy == "historical_head_reopen_pair":
                value = historical_head_test(
                    self.component_root, self.output_root, self.bundle, test_id, expected
                )
            else:
                raise HarnessError(f"{test_id}: unimplemented strategy: {strategy}")
            if value.get("result") != "PASS":
                raise UnexpectedPrimary(f"variant failed: {test_id}")
            record = self.persist_test("regressions", test_id, value)
            self.variants[(regression_id, variant_id)] = record

    def run_global(self, item: dict[str, Any]) -> None:
        case_id = item["case_id"]
        strategy = item["strategy"]
        tamper = item.get("tamper")
        expected = item["expect"]
        with failure_scope(self.output_root, case_id, [self.evidence_root]):
            if case_id == "GF-REOPEN-TWICE":
                value = reopen_twice_test(self.component_root, self.bases, case_id, expected)
            elif strategy == "evidence_mutation":
                value = evidence_mutation_test(
                    self.component_root, self.bases, self.output_root, case_id, str(tamper), expected
                )
            elif case_id == "GF-SUBJECT-FAIL-PATH-STOP":
                value = base_reference_test(
                    self.component_root, self.bases, case_id, "malformed_output", expected
                )
            elif case_id == "GF-CAUSAL-STAGE-COMPLETE":
                value = base_reference_test(
                    self.component_root, self.bases, case_id, "clean", expected
                )
                counts = value["observation"]["counts"]
                if (counts["pass"], counts["stage_artifacts"], counts["s90_artifacts"]) != (291, 54, 3):
                    raise UnexpectedPrimary(f"{case_id}: 291/54/3 causal completeness mismatch")
            elif case_id == "GF-EXACT-GIT-BUNDLE-BINDING":
                value = exact_git_binding_test(
                    self.component_root, self.output_root, case_id, expected
                )
            else:
                raise HarnessError(f"unimplemented global fault: {case_id}")
            if value.get("result") != "PASS":
                raise UnexpectedPrimary(f"global failed: {case_id}")
            self.globals[case_id] = self.persist_test("globals", case_id, value)

    def run_coverage_meta(self) -> None:
        family = next(
            item
            for item in self.bundle["regressions"]["families"]
            if item["regression_id"] == "R9-REG-011"
        )
        variant = family["variants"][0]
        test_id = f"R9-REG-011--{variant['variant_id']}"
        expected_without_meta = {
            (item["regression_id"], member["variant_id"])
            for item in self.bundle["regressions"]["families"]
            for member in item["variants"]
            if member["variant_id"] != "required-fault-union"
        }
        if set(self.variants) != expected_without_meta:
            missing = sorted(expected_without_meta - set(self.variants))
            extra = sorted(set(self.variants) - expected_without_meta)
            raise UnexpectedPrimary(f"{test_id}: dependency receipt set mismatch: missing={missing} extra={extra}")
        value = test_receipt(
            "regression",
            test_id,
            "PASS",
            {
                "semantic_facts": {"all_dependency_variants_pass": True},
                "dependency_variant_count": len(expected_without_meta),
                "dependency_id_set_sha256": sha(canon(sorted([list(item) for item in expected_without_meta]))),
                "all_dependency_variants_pass": True,
                "aggregate_cannot_manufacture_missing_results": True,
            },
            variant["expect"],
        )
        self.variants[("R9-REG-011", variant["variant_id"])] = self.persist_test(
            "regressions", test_id, value
        )

    def execute(self) -> dict[str, Any]:
        manifest = {
            "schema_id": "pw-r9-independent-stabilization-execution-manifest-v1",
            "status": "PREDECLARED_ZERO_AUTHORITY_ZERO_CREDIT",
            "component_identity": self.static["component_identity"],
            "catalog": self.static["catalog"],
            "ptrace_capability": self.ptrace_capability,
            "execution_policy": {
                "stop_at_first_unexpected_primary": True,
                "retry": 0,
                "relaunch": 0,
                "replacement": 0,
                "best_of": False,
                "mutations": "isolated copies with complete durable archives",
                "component_interface": "public runner CLI only",
                "protocol_stimulus": "locally constructed mechanical events, not empirical transport observations",
                "call_claim_scope": CALL_SCOPE,
            },
            "calls": call_observation(),
            "credit": 0,
            "authority": dict(ZERO_AUTHORITY),
            "created_utc": utc_now(),
        }
        write_receipt(self.output_root / "execution-manifest.json", manifest, self.output_root)
        self.persist_self_contained_inputs()
        self.run_process_faults()
        self.run_process_oracle_adversaries()
        for family in self.bundle["regressions"]["families"]:
            for variant in family["variants"]:
                self.run_variant(family, variant)
        for item in self.bundle["regressions"]["global_faults"]:
            self.run_global(item)
        self.run_coverage_meta()
        expected_variants = {
            (family["regression_id"], variant["variant_id"])
            for family in self.bundle["regressions"]["families"]
            for variant in family["variants"]
        }
        expected_globals = {item["case_id"] for item in self.bundle["regressions"]["global_faults"]}
        expected_process = set(PROCESS_IDS)
        equalities = {
            "variant_ids_equal": set(self.variants) == expected_variants,
            "global_ids_equal": set(self.globals) == expected_globals,
            "process_ids_equal": set(self.process) == expected_process,
        }
        if not all(equalities.values()):
            raise UnexpectedPrimary(f"aggregate exact ID-set equality failed: {equalities}")
        family_results = []
        for family in self.bundle["regressions"]["families"]:
            ids = [(family["regression_id"], item["variant_id"]) for item in family["variants"]]
            family_results.append(
                {
                    "regression_id": family["regression_id"],
                    "family": family["family"],
                    "variant_count": len(ids),
                    "variant_ids": [item[1] for item in ids],
                    "all_receipts_present": all(item in self.variants for item in ids),
                }
            )
        aggregate = {
            "schema_id": AGGREGATE_SCHEMA,
            "status": "PASS_ZERO_AUTHORITY_ZERO_CREDIT",
            "component_identity": self.static["component_identity"],
            "counts": {
                "regression_families": len(family_results),
                "regression_variants": len(self.variants),
                "global_faults": len(self.globals),
                "process_faults": len(self.process),
            },
            "exact_id_set_equality": equalities,
            "families": family_results,
            "variant_receipts": [
                {"regression_id": key[0], "variant_id": key[1], **value}
                for key, value in sorted(self.variants.items())
            ],
            "global_receipts": [
                {"case_id": key, **value} for key, value in sorted(self.globals.items())
            ],
            "process_receipts": [
                {"fault_id": key, **value} for key, value in sorted(self.process.items())
            ],
            "calls": call_observation(),
            "credit": 0,
            "authority": dict(ZERO_AUTHORITY),
            "residuals": [
                "Kernel scheduling, ptrace stops, signal delivery, filesystem fsync, and Git object retention remain trusted-platform facts.",
                "Repeated-signal multiplicity is proved by external durable receipts; the component persists one Boolean stop state.",
                "Final filesystem and archive snapshots cannot reconstruct historical create-only and fsync syscalls.",
                "This external harness has no exit, qualification, candidate, audit, freeze, release, or launch authority.",
                HOST_ACTIVITY_RESIDUAL,
            ],
            "created_utc": utc_now(),
        }
        aggregate_path = self.output_root / "aggregate-receipt.json"
        aggregate_file = write_receipt(aggregate_path, aggregate, self.output_root)
        terminal = {
            "schema_id": SCHEMA,
            "mode": "execute",
            "status": "PASS_ZERO_AUTHORITY_ZERO_CREDIT",
            "output_root": str(self.output_root),
            "aggregate_receipt": {
                "path": aggregate_path.relative_to(self.output_root).as_posix(),
                **aggregate_file,
            },
            "counts": aggregate["counts"],
            "calls": call_observation(),
            "credit": 0,
            "authority": dict(ZERO_AUTHORITY),
        }
        write_receipt(self.output_root / "terminal-receipt.json", terminal, self.output_root)
        return self.close_and_reopen_output(terminal)


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(allow_abbrev=False)
    parser.add_argument("--component-root", required=True)
    parser.add_argument("--evidence-root", required=True)
    parser.add_argument("--output-root", required=True)
    parser.add_argument("--mode", required=True, choices=("check", "execute"))
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    try:
        args = parse_args(list(sys.argv[1:] if argv is None else argv))
        component_root = pathlib.Path(args.component_root)
        evidence_root = pathlib.Path(args.evidence_root)
        output_root = pathlib.Path(args.output_root)
        require_absolute_directory(component_root, "component root")
        require_absolute_directory(evidence_root, "evidence root")
        validate_output_target(output_root)
        static = static_check(component_root, evidence_root)
        if args.mode == "check":
            sys.stdout.buffer.write(canon(static) + b"\n")
            sys.stdout.buffer.flush()
            return 0
        bundle = load_bundle(component_root)
        bases = BaseRuns(
            component_root,
            evidence_root,
            static["component_identity"],
            static["shared_authorities"],
        )
        ptrace_capability = ptrace_capability_check()
        exclusive_dir(output_root)
        executor = Executor(
            component_root,
            evidence_root,
            output_root,
            bundle,
            static,
            bases,
            ptrace_capability,
        )
        try:
            terminal = executor.execute()
        except Exception as exc:
            failure = {
                "schema_id": SCHEMA,
                "mode": "execute",
                "status": "FAIL_STOPPED_AT_FIRST_UNEXPECTED_PRIMARY",
                "error_type": type(exc).__name__,
                "error": str(exc),
                "completed_counts": {
                    "regression_variants": len(executor.variants),
                    "global_faults": len(executor.globals),
                    "process_faults": len(executor.process),
                },
                "retry": 0,
                "relaunch": 0,
                "replacement": 0,
                "best_of": False,
                "calls": call_observation(),
                "credit": 0,
                "authority": dict(ZERO_AUTHORITY),
                "created_utc": utc_now(),
            }
            write_receipt(output_root / "terminal-failure-receipt.json", failure, output_root)
            terminal = failure
        sys.stdout.buffer.write(canon(terminal) + b"\n")
        sys.stdout.buffer.flush()
        return 0 if terminal["status"] == "PASS_ZERO_AUTHORITY_ZERO_CREDIT" else 2
    except Exception as exc:
        error = {
            "schema_id": SCHEMA,
            "status": "CONTROLLER_INVALID",
            "error_type": type(exc).__name__,
            "error": str(exc),
            "calls": call_observation(),
            "credit": 0,
            "authority": dict(ZERO_AUTHORITY),
        }
        sys.stdout.buffer.write(canon(error) + b"\n")
        sys.stdout.buffer.flush()
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
