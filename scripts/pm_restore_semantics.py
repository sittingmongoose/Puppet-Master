"""Static RestoreRun/consent relations, subordinate to Backup_Restore_System.

No filesystem, recovery, approval, or credential operation is performed here.
The supplied references still require authoritative resolution at runtime.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


def _timestamp(value: Any) -> datetime | None:
    if not isinstance(value, str):
        return None
    try:
        parsed = datetime.fromisoformat(value[:-1] + "+00:00" if value.endswith("Z") else value)
    except ValueError:
        return None
    if parsed.tzinfo is None or parsed.utcoffset() is None:
        return None
    return parsed.astimezone(timezone.utc)


def restore_semantic_failures(definition_name: str, value: Any) -> list[str]:
    if not isinstance(value, dict):
        return []
    failures: list[str] = []
    consent = value if definition_name == "emergency_recovery_consent" else value.get("emergency_recovery_consent")
    if isinstance(consent, dict):
        issued = _timestamp(consent.get("issued_at_utc"))
        validated = _timestamp(consent.get("validated_at_utc"))
        expires = _timestamp(consent.get("expires_at_utc"))
        if issued is None or validated is None or expires is None or not issued <= validated < expires:
            failures.append("emergency_consent_not_current_at_validation")
        if consent is not value:
            if "actor_ref" in value and consent.get("actor_ref") != value.get("actor_ref"):
                failures.append("emergency_consent_actor_mismatch")
            for field in ("restore_run_id", "target_server_id", "idempotency_key", "preview_receipt_ref", "approval_receipt_ref"):
                if consent.get(field) != value.get(field):
                    failures.append(f"emergency_consent_{field}_mismatch")
            if consent.get("mode") != value.get("restore_mode", value.get("mode")):
                failures.append("emergency_consent_mode_mismatch")
            consent_projects, target_projects = consent.get("target_project_ids"), value.get("target_project_ids", [])
            if isinstance(consent_projects, list) and isinstance(target_projects, list):
                if set(consent_projects) != set(target_projects):
                    failures.append("emergency_consent_target_projects_mismatch")
    if definition_name == "restore_run":
        started, updated = _timestamp(value.get("started_at_utc")), _timestamp(value.get("updated_at_utc"))
        terminal_value = value.get("terminal_at_utc")
        terminal = _timestamp(terminal_value)
        if started is None or updated is None or (terminal_value is not None and terminal is None):
            failures.append("restore_run_timestamp_invalid")
        elif updated < started or (terminal is not None and not started <= terminal <= updated):
            failures.append("restore_run_timestamp_order")
    return sorted(set(failures))
