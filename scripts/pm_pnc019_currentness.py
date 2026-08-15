#!/usr/bin/env python3
"""Pure shared PNC-019 receipt and Event Authority currentness checks.

The governed checkpoint is deliberately fail-closed.  A changed registry does
not clear Event Authority by inference: approved denominator and family-depth
evidence must update this receipt-bound module before PNC-019 can be current.
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any


REQUIRED_PNC019_SOURCE_HASH_PATHS = (
    "Plans/event_record.schema.json",
    "Plans/event_family_registry.json",
    "Plans/execution_unit_context.schema.json",
    "Plans/storage_recovery_contracts.schema.json",
    "Plans/storage_value_registry.schema.json",
    "Plans/storage_value_registry.json",
    "Plans/Plan_To_Node_Compilation.md",
    "Plans/Planning_Wizard.md",
    "Plans/Executor_Protocol.md",
    "Plans/Goal_Runtime_System.md",
    "Plans/Orchestrator_Page.md",
    "Plans/Automated_Testing_System.md",
    "Plans/UI_Command_Catalog.md",
    "Plans/Wiring_Matrix.production.json",
    "Plans/UI_Wiring_Rules.md",
    "Plans/Progression_Gates.md",
    "scripts/pm-pnc019-certification-harness.py",
    "scripts/pm_pnc019_currentness.py",
    "Plans/.audits/event-authority-2026-08-13-currentness/VALIDATOR_RECEIPT.json",
)

EVENT_FAMILY_REGISTRY_REL_PATH = "Plans/event_family_registry.json"
EVENT_FAMILY_REGISTRY_SCHEMA_ID = "pm.event_family_registry.v1"
EVENT_FAMILY_REGISTRY_SCHEMA_VERSION = "2.0.0"
EVENT_FAMILY_REGISTRY_REVISION = "2026-08-04.1"
EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT = 39
EVENT_FAMILY_QUARANTINED_ROW_COUNT = 252
EVENT_FAMILY_DENOMINATOR_STATUS = "UNKNOWN_OPEN"
EVENT_FAMILY_BULK_REGISTRATION_ALLOWED = False
EVENT_FAMILY_EVIDENCE_CURRENTNESS = "live_rehashed_fail_closed_currentness_audit"
EVENT_AUTHORITY_AUDIT_ROOT = "Plans/.audits/event-authority-2026-08-13-currentness"
EVENT_AUTHORITY_STATUS_REL_PATH = f"{EVENT_AUTHORITY_AUDIT_ROOT}/EVENT_FAMILY_DENOMINATOR_STATUS.json"
EVENT_AUTHORITY_RECEIPT_REL_PATH = f"{EVENT_AUTHORITY_AUDIT_ROOT}/VALIDATOR_RECEIPT.json"
EVENT_AUTHORITY_GROUP_MANIFEST_REL_PATH = f"{EVENT_AUTHORITY_AUDIT_ROOT}/adjudication/GROUP_ARTIFACT_MANIFEST.json"
EVENT_AUTHORITY_QUARANTINE_LEDGER_REL_PATH = f"{EVENT_AUTHORITY_AUDIT_ROOT}/adjudication/QUARANTINED_EVENT_DISPOSITIONS.jsonl"
EVENT_AUTHORITY_SOURCE_INVENTORY_REL_PATH = f"{EVENT_AUTHORITY_AUDIT_ROOT}/CURRENT_EVENT_SOURCE_INVENTORY.json"
EVENT_FAMILY_EVIDENCE_REFS = [
    {
        "artifact_id": "EVENT_FAMILY_DENOMINATOR_STATUS.json",
        "custody_path": EVENT_AUTHORITY_STATUS_REL_PATH,
        "claim": "UNKNOWN_OPEN current status",
    },
    {
        "artifact_id": "GROUP_ARTIFACT_MANIFEST.json",
        "custody_path": EVENT_AUTHORITY_GROUP_MANIFEST_REL_PATH,
        "claim": "252 unique row-local findings quarantined without registry or checkpoint advance",
    },
]


@dataclass(frozen=True)
class EventAuthorityCheckpoint:
    registry_schema_id: str
    registry_schema_version: str
    registry_revision: str
    registered_kernel_rows: int
    complete_denominator_known: bool
    contract_depth_complete: bool


CURRENT_EVENT_AUTHORITY_CHECKPOINT = EventAuthorityCheckpoint(
    registry_schema_id=EVENT_FAMILY_REGISTRY_SCHEMA_ID,
    registry_schema_version=EVENT_FAMILY_REGISTRY_SCHEMA_VERSION,
    registry_revision=EVENT_FAMILY_REGISTRY_REVISION,
    registered_kernel_rows=EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT,
    complete_denominator_known=False,
    contract_depth_complete=False,
)


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def event_authority_audit_failures(root: Path) -> list[dict[str, Any]]:
    """Rehash and validate the current in-repo fail-closed audit binding."""
    failures: list[dict[str, Any]] = []
    try:
        receipt = json.loads((root / EVENT_AUTHORITY_RECEIPT_REL_PATH).read_text(encoding="utf-8"))
        status = json.loads((root / EVENT_AUTHORITY_STATUS_REL_PATH).read_text(encoding="utf-8"))
        manifest = json.loads((root / EVENT_AUTHORITY_GROUP_MANIFEST_REL_PATH).read_text(encoding="utf-8"))
        inventory = json.loads((root / EVENT_AUTHORITY_SOURCE_INVENTORY_REL_PATH).read_text(encoding="utf-8"))
    except Exception as exc:  # noqa: BLE001 - currentness must fail closed.
        return [{"error": "event_authority_currentness_audit_unavailable", "detail": str(exc)}]

    artifact_hashes = receipt.get("artifact_hashes")
    if not isinstance(artifact_hashes, dict):
        failures.append({"error": "event_authority_currentness_artifact_hashes_invalid"})
        artifact_hashes = {}
    for artifact_path, expected_sha in artifact_hashes.items():
        target = root / artifact_path
        if not target.is_file():
            failures.append({"error": "event_authority_currentness_artifact_missing", "artifact_path": artifact_path})
        elif not isinstance(expected_sha, str) or sha256_file(target) != expected_sha:
            failures.append({"error": "event_authority_currentness_artifact_drift", "artifact_path": artifact_path})

    inventory_sources = inventory.get("sources")
    if not isinstance(inventory_sources, list):
        failures.append({"error": "event_authority_currentness_source_inventory_invalid"})
        inventory_sources = []
    inventoried_paths: set[str] = set()
    for row in inventory_sources:
        if not isinstance(row, dict) or not isinstance(row.get("path"), str):
            failures.append({"error": "event_authority_currentness_source_inventory_row_invalid"})
            continue
        source_path = row["path"]
        inventoried_paths.add(source_path)
        target = root / source_path
        if not target.is_file():
            failures.append({"error": "event_authority_currentness_source_missing", "source_path": source_path})
        elif target.stat().st_size != row.get("bytes") or sha256_file(target) != row.get("sha256"):
            failures.append({"error": "event_authority_currentness_source_drift", "source_path": source_path})
    live_direct_plans = {
        path.relative_to(root).as_posix()
        for path in (root / "Plans").glob("*.md")
        if path.is_file()
    }
    inventoried_direct_plans = {
        row["path"]
        for row in inventory_sources
        if isinstance(row, dict) and row.get("authority_class") == "direct_canonical_plan_prose"
    }
    if live_direct_plans != inventoried_direct_plans:
        failures.append({"error": "event_authority_currentness_direct_plans_source_set_drift"})

    validator_path = receipt.get("validator_path")
    validator_sha = receipt.get("validator_sha256")
    if not isinstance(validator_path, str) or not (root / validator_path).is_file():
        failures.append({"error": "event_authority_currentness_validator_missing"})
    elif sha256_file(root / validator_path) != validator_sha:
        failures.append({"error": "event_authority_currentness_validator_drift", "validator_path": validator_path})

    if receipt.get("evidence_valid") is not True or receipt.get("event_authority_closed") is not False:
        failures.append({"error": "event_authority_currentness_receipt_not_fail_closed"})
    if not (
        status.get("status") == "UNKNOWN_OPEN"
        and status.get("closed") is False
        and status.get("complete_denominator_known") is False
        and status.get("contract_depth_complete") is False
        and status.get("build_or_pnc019_authority") is False
    ):
        failures.append({"error": "event_authority_currentness_status_not_unknown_open"})
    live_registry = root / EVENT_FAMILY_REGISTRY_REL_PATH
    registry_status = status.get("registry", {})
    if not live_registry.is_file() or not (
        registry_status.get("live_family_count") == EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT
        and registry_status.get("revision") == EVENT_FAMILY_REGISTRY_REVISION
        and registry_status.get("sha256") == sha256_file(live_registry)
    ):
        failures.append({"error": "event_authority_currentness_live_registry_drift"})
    quarantine = status.get("row_local_quarantine", {})
    union = manifest.get("union", {})
    if not (
        quarantine.get("row_count") == EVENT_FAMILY_QUARANTINED_ROW_COUNT
        and quarantine.get("unique_event_type_count") == EVENT_FAMILY_QUARANTINED_ROW_COUNT
        and quarantine.get("bulk_registration") is False
        and union.get("row_count") == EVENT_FAMILY_QUARANTINED_ROW_COUNT
        and union.get("unique_event_type_count") == EVENT_FAMILY_QUARANTINED_ROW_COUNT
        and union.get("quarantined_row_count") == EVENT_FAMILY_QUARANTINED_ROW_COUNT
        and union.get("exact_set_equality") is True
        and all(
            json.loads(line).get("audit_disposition")
            == "KEEP_QUARANTINED_NO_REGISTRY_OR_CHECKPOINT_ADVANCE"
            for line in (root / EVENT_AUTHORITY_QUARANTINE_LEDGER_REL_PATH)
            .read_text(encoding="utf-8")
            .splitlines()
            if line.strip()
        )
        and manifest.get("bulk_registration") is False
        and manifest.get("complete_denominator_known") is False
        and manifest.get("contract_depth_complete") is False
    ):
        failures.append({"error": "event_authority_quarantined_252_manifest_invalid"})
    return failures


def _with_path(failure: dict[str, Any], path_label: str | None) -> dict[str, Any]:
    if path_label is None:
        return failure
    return {"path": path_label, **failure}


def pnc019_source_hash_failures(
    root: Path,
    source_hashes: Any,
    *,
    path_label: str | None = None,
) -> list[dict[str, Any]]:
    """Check every governed receipt dependency against the live repository."""
    failures: list[dict[str, Any]] = []
    if not isinstance(source_hashes, dict):
        failures.append(
            _with_path({"error": "pnc019_source_hashes_missing_or_invalid"}, path_label)
        )
        source_hashes = {}

    for source_path in REQUIRED_PNC019_SOURCE_HASH_PATHS:
        target = root / source_path
        if not target.is_file():
            failures.append(
                _with_path(
                    {
                        "error": "pnc019_source_hash_path_missing",
                        "source_path": source_path,
                    },
                    path_label,
                )
            )
            continue
        expected = sha256_file(target)
        actual = source_hashes.get(source_path)
        if actual != expected:
            failures.append(
                _with_path(
                    {
                        "error": "pnc019_source_hash_stale",
                        "source_path": source_path,
                        "expected": expected,
                        "actual": actual,
                    },
                    path_label,
                )
            )
    return failures


def pnc019_event_authority_failures_for_registry(
    registry: Any,
    *,
    path_label: str | None = None,
    checkpoint: EventAuthorityCheckpoint = CURRENT_EVENT_AUTHORITY_CHECKPOINT,
) -> list[dict[str, Any]]:
    """Require both denominator and family-depth clearance at the live checkpoint."""
    if not isinstance(registry, dict):
        return [
            _with_path(
                {"error": "event_family_registry_unavailable", "detail": "registry is not an object"},
                path_label,
            )
        ]

    families = registry.get("families")
    actual_registered_rows = len(families) if isinstance(families, list) else -1
    actual_checkpoint = {
        "registry_schema_id": registry.get("schema_id"),
        "registry_schema_version": registry.get("schema_version"),
        "registry_revision": registry.get("registry_revision"),
        "registered_kernel_rows": actual_registered_rows,
    }
    expected_checkpoint = {
        "registry_schema_id": checkpoint.registry_schema_id,
        "registry_schema_version": checkpoint.registry_schema_version,
        "registry_revision": checkpoint.registry_revision,
        "registered_kernel_rows": checkpoint.registered_kernel_rows,
    }
    failures: list[dict[str, Any]] = []
    if actual_checkpoint != expected_checkpoint:
        failures.append(
            _with_path(
                {
                    "error": "event_authority_checkpoint_changed_requires_fresh_approval",
                    "expected_checkpoint": expected_checkpoint,
                    "actual_checkpoint": actual_checkpoint,
                    "denominator_status": EVENT_FAMILY_DENOMINATOR_STATUS,
                    "evidence_currentness": EVENT_FAMILY_EVIDENCE_CURRENTNESS,
                    "evidence_refs": EVENT_FAMILY_EVIDENCE_REFS,
                },
                path_label,
            )
        )

    if not checkpoint.complete_denominator_known:
        failures.append(
            _with_path(
                {
                    "error": "event_denominator_unresolved",
                    "registered_kernel_rows": actual_registered_rows,
                    "quarantined_row_count": EVENT_FAMILY_QUARANTINED_ROW_COUNT,
                    "denominator_status": EVENT_FAMILY_DENOMINATOR_STATUS,
                    "bulk_registration_allowed": EVENT_FAMILY_BULK_REGISTRATION_ALLOWED,
                    "evidence_currentness": EVENT_FAMILY_EVIDENCE_CURRENTNESS,
                    "evidence_refs": EVENT_FAMILY_EVIDENCE_REFS,
                    "complete_denominator_known": False,
                    "corpus_complete": False,
                    "disposition": "unknown_or_unregistered_event_types_quarantine_without_checkpoint_advance",
                },
                path_label,
            )
        )

    if not checkpoint.contract_depth_complete:
        failures.append(
            _with_path(
                {
                    "error": "event_family_contract_depth_unresolved",
                    "registered_kernel_rows": actual_registered_rows,
                    "quarantined_row_count": EVENT_FAMILY_QUARANTINED_ROW_COUNT,
                    "bulk_registration_allowed": EVENT_FAMILY_BULK_REGISTRATION_ALLOWED,
                    "evidence_refs": EVENT_FAMILY_EVIDENCE_REFS,
                    "contract_depth_complete": False,
                },
                path_label,
            )
        )
    return failures


def pnc019_event_authority_clearance_failures(
    root: Path,
    *,
    path_label: str | None = EVENT_FAMILY_REGISTRY_REL_PATH,
) -> list[dict[str, Any]]:
    """Read and evaluate the live Event Authority registry checkpoint."""
    registry_path = root / EVENT_FAMILY_REGISTRY_REL_PATH
    try:
        registry = json.loads(registry_path.read_text(encoding="utf-8"))
    except Exception as exc:  # noqa: BLE001 - fail closed with bounded detail.
        return [
            _with_path(
                {"error": "event_family_registry_unavailable", "detail": str(exc)},
                path_label,
            )
        ]
    audit_failures = event_authority_audit_failures(root)
    registry_failures = pnc019_event_authority_failures_for_registry(
        registry,
        path_label=path_label,
    )
    return audit_failures + registry_failures
