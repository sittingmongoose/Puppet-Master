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
)

EVENT_FAMILY_REGISTRY_REL_PATH = "Plans/event_family_registry.json"
EVENT_FAMILY_REGISTRY_SCHEMA_ID = "pm.event_family_registry.v1"
EVENT_FAMILY_REGISTRY_SCHEMA_VERSION = "2.0.0"
EVENT_FAMILY_REGISTRY_REVISION = "2026-08-04.1"
EVENT_FAMILY_REGISTRY_KERNEL_ROW_COUNT = 39
EVENT_FAMILY_EVIDENCE_REGISTERED_ROWS = 37
EVENT_FAMILY_PROVEN_PERSISTED_FLOOR = 285
EVENT_FAMILY_PROVEN_UNREGISTERED_FLOOR = 248
EVENT_FAMILY_UNRESOLVED_FLOOR = 40
EVENT_FAMILY_EXCLUDED_COUNT = 68
EVENT_FAMILY_DENOMINATOR_STATUS = "UNKNOWN_OPEN"
EVENT_FAMILY_BULK_REGISTRATION_ALLOWED = False
EVENT_FAMILY_EVIDENCE_CURRENTNESS = "source_dated_lower_bound_pending_fresh_reconciliation"
EVENT_FAMILY_EVIDENCE_REFS = [
    {
        "artifact_id": "EA-27_PRODUCER_UNION_AND_DENOMINATOR.json",
        "custody_root": "PuppetMaster-AssuranceLab",
        "custody_path": (
            "orchestration-2026-07-17/phase3/event-authority/"
            "EA-27_PRODUCER_UNION_AND_DENOMINATOR.json"
        ),
        "sha256": "644c6d0bc913eaed62f41e231fdb7e04f55d270549fcdede73a0869994111e47",
        "union_rows_sha256": "aa9c365904788eba74df73bb1b5eecaae903a6aa167e0514b7937198aa0dbf4d",
    },
    {
        "artifact_id": "EA-29_TERMINAL_FINDINGS_RESIDUALS_CONTRACT_DEPTH_REPAIR_AND_WAVE1_CHECKPOINT.md",
        "custody_root": "PuppetMaster-AssuranceLab",
        "custody_path": (
            "orchestration-2026-07-17/phase3/event-authority/"
            "EA-29_TERMINAL_FINDINGS_RESIDUALS_CONTRACT_DEPTH_REPAIR_AND_WAVE1_CHECKPOINT.md"
        ),
        "sha256": "17820aef1b498acf2e5165bee106171ff1ef35a1b23fa67d0cc23e291a8ed7bf",
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
                    "evidence_registered_rows": EVENT_FAMILY_EVIDENCE_REGISTERED_ROWS,
                    "proven_persisted_floor": EVENT_FAMILY_PROVEN_PERSISTED_FLOOR,
                    "proven_unregistered_floor": EVENT_FAMILY_PROVEN_UNREGISTERED_FLOOR,
                    "unresolved_floor": EVENT_FAMILY_UNRESOLVED_FLOOR,
                    "excluded_count": EVENT_FAMILY_EXCLUDED_COUNT,
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
                    "evidence_registered_rows": EVENT_FAMILY_EVIDENCE_REGISTERED_ROWS,
                    "proven_unregistered_floor": EVENT_FAMILY_PROVEN_UNREGISTERED_FLOOR,
                    "unresolved_floor": EVENT_FAMILY_UNRESOLVED_FLOOR,
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
    return pnc019_event_authority_failures_for_registry(
        registry,
        path_label=path_label,
    )
