#!/usr/bin/env python3
"""Generate and validate the current audit-status presentation index."""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
AUDITS = ROOT / "Plans/.audits"
REGISTRY = AUDITS / "_semantic_closure_registry.jsonl"
INDEX = AUDITS / "_audit_status_index.json"
MARKDOWN = AUDITS / "CURRENT_AUDIT_STATUS.md"


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def rel(path: Path) -> str:
    return path.resolve().relative_to(ROOT).as_posix()


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    if not path.exists():
        return rows
    for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        row = json.loads(line)
        row["_line"] = line_number
        rows.append(row)
    return rows


def first_match(pattern: str, text: str) -> str | None:
    match = re.search(pattern, text, flags=re.MULTILINE)
    return match.group(1).strip() if match else None


def reported_status(text: str) -> str | None:
    status = first_match(r"^Status:\s*(.+?)\s*$", text)
    if status:
        return status.strip("` ")
    return None


def is_blocking_status(status: str | None) -> bool:
    if not status:
        return False
    upper = status.upper()
    return "BLOCKED" in upper or upper.startswith("FAIL")


def status_family(status: str | None) -> str:
    if not status:
        return "unknown"
    upper = status.upper()
    if upper.startswith("PASS"):
        return "pass"
    if is_blocking_status(status):
        return "blocked_or_fail"
    return "other"


def build_index() -> dict[str, Any]:
    closure_rows = load_jsonl(REGISTRY)
    latest_closure_by_finding: dict[str, dict[str, Any]] = {}
    for row in closure_rows:
        finding_key = str(row.get("finding_key", "")).strip()
        if finding_key:
            latest_closure_by_finding[finding_key] = row
    active_reopened_findings = [
        {
            "closure_id": row.get("closure_id"),
            "finding_key": row.get("finding_key"),
            "line": row.get("_line"),
            "audit_ids": row.get("audit_ids", []),
            "closure_reason": row.get("closure_reason"),
        }
        for row in latest_closure_by_finding.values()
        if row.get("closure_status") == "reopened"
    ]
    active_reopened_findings.sort(key=lambda row: (str(row.get("finding_key")), str(row.get("closure_id"))))
    closure_by_audit: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in closure_rows:
        for audit_id in row.get("audit_ids", []) or []:
            closure_by_audit[str(audit_id)].append(row)
        closed_by = row.get("closed_by_audit_id")
        if closed_by:
            closure_by_audit[str(closed_by)].append(row)

    reports: list[dict[str, Any]] = []
    for report_path in sorted(AUDITS.glob("audit-*/FINAL_REPORT.md")):
        audit_id = report_path.parent.name
        text = report_path.read_text(encoding="utf-8")
        status = reported_status(text)
        blocking = is_blocking_status(status)
        closure_rows_for_audit = closure_by_audit.get(audit_id, [])
        closure_status_counts = Counter(str(row.get("closure_status", "unknown")) for row in closure_rows_for_audit)
        if blocking:
            effective_status = "historical_blocked_or_fail_report_indexed"
        elif status_family(status) == "pass":
            effective_status = "reported_pass_or_pass_with_warnings"
        else:
            effective_status = "historical_report_status_unstated_or_nonstandard"
        reports.append(
            {
                "audit_id": audit_id,
                "path": rel(report_path),
                "ledger_id": first_match(r"^Ledger:\s*`?([^`\n]+)`?\s*$", text),
                "scope_key": audit_id,
                "reported_status": status,
                "reported_status_family": status_family(status),
                "effective_status": effective_status,
                "current_blocker": False,
                "superseded_by": "Plans/.audits/CURRENT_AUDIT_STATUS.md" if blocking else None,
                "closure_registry_basis": {
                    "registry_path": rel(REGISTRY),
                    "matching_rows": len(closure_rows_for_audit),
                    "closure_status_counts": dict(sorted(closure_status_counts.items())),
                    "basis_note": "finding_level_closure_authority_not_report_body_rewrite",
                },
            }
        )

    status_counts = Counter(row["reported_status_family"] for row in reports)
    current_report_blocker_count = sum(1 for row in reports if row["current_blocker"])
    return {
        "schema_id": "pm.audit_status_index.v1",
        "generated_at_utc": utc_now(),
        "source": {
            "reports_glob": "Plans/.audits/audit-*/FINAL_REPORT.md",
            "closure_registry": rel(REGISTRY),
        },
        "summary": {
            "report_count": len(reports),
            "reported_status_family_counts": dict(sorted(status_counts.items())),
            "current_blocker_count": current_report_blocker_count + len(active_reopened_findings),
            "current_report_blocker_count": current_report_blocker_count,
            "current_reopened_finding_count": len(active_reopened_findings),
            "historical_blocked_or_fail_report_count": sum(
                1 for row in reports if row["reported_status_family"] == "blocked_or_fail"
            ),
            "closure_registry_row_count": len(closure_rows),
        },
        "active_reopened_findings": active_reopened_findings,
        "reports": reports,
    }


def render_markdown(index: dict[str, Any]) -> str:
    summary = index["summary"]
    rows = [
        "# Current Audit Status",
        "",
        "This generated index separates immutable historical report headers from current presentation status. Old `FINAL_REPORT.md` files are not rewritten; finding-level closure authority remains `Plans/.audits/_semantic_closure_registry.jsonl`.",
        "",
        f"- Generated: `{index['generated_at_utc']}`",
        f"- Reports indexed: {summary['report_count']}",
        f"- Current blockers: {summary['current_blocker_count']}",
        f"- Current report blockers: {summary['current_report_blocker_count']}",
        f"- Reopened finding blockers: {summary['current_reopened_finding_count']}",
        f"- Historical BLOCKED/FAIL reports indexed: {summary['historical_blocked_or_fail_report_count']}",
        f"- Closure registry rows: {summary['closure_registry_row_count']}",
    ]
    if index["active_reopened_findings"]:
        rows.extend(
            [
                "",
                "## Active reopened findings",
                "",
                "| Finding key | Closure row | Registry line |",
                "|---|---|---:|",
            ]
        )
        for finding in index["active_reopened_findings"]:
            rows.append(
                f"| `{finding['finding_key']}` | `{finding['closure_id']}` | {finding['line']} |"
            )
    rows.extend(
        [
        "",
        "## Historical audit reports",
        "",
        "| Audit | Reported status | Effective status | Current blocker | Closure rows |",
        "|---|---|---|---:|---:|",
        ]
    )
    for report in index["reports"]:
        status = report["reported_status"] or "STATUS_UNSTATED"
        closure_rows = report["closure_registry_basis"]["matching_rows"]
        rows.append(
            f"| `{report['audit_id']}` | `{status}` | `{report['effective_status']}` | "
            f"{str(report['current_blocker']).lower()} | {closure_rows} |"
        )
    rows.append("")
    return "\n".join(rows)


def strip_generated(value: Any) -> Any:
    if isinstance(value, dict):
        return {key: strip_generated(child) for key, child in value.items() if key != "generated_at_utc"}
    if isinstance(value, list):
        return [strip_generated(child) for child in value]
    return value


def validate() -> dict[str, Any]:
    failures: list[dict[str, Any]] = []
    if not INDEX.exists():
        failures.append({"path": rel(INDEX), "error": "missing_audit_status_index"})
    if not MARKDOWN.exists():
        failures.append({"path": rel(MARKDOWN), "error": "missing_current_audit_status_markdown"})
    if failures:
        return {"schema_id": "pm.audit_status_index.validation_report.v1", "status": "fail", "failures": failures}

    actual = json.loads(INDEX.read_text(encoding="utf-8"))
    expected = build_index()
    if strip_generated(actual) != strip_generated(expected):
        failures.append({"path": rel(INDEX), "error": "stale_audit_status_index"})
    markdown_text = MARKDOWN.read_text(encoding="utf-8")
    required_phrases = [
        "separates immutable historical report headers from current presentation status",
        "Current blockers:",
        "Reopened finding blockers:",
        "Historical BLOCKED/FAIL reports indexed:",
    ]
    for phrase in required_phrases:
        if phrase not in markdown_text:
            failures.append({"path": rel(MARKDOWN), "error": "current_status_markdown_missing_phrase", "phrase": phrase})

    for row in actual.get("reports", []):
        if row.get("reported_status_family") == "blocked_or_fail":
            if "effective_status" not in row:
                failures.append({"path": rel(INDEX), "audit_id": row.get("audit_id"), "error": "blocked_report_missing_effective_status"})
            if "current_blocker" not in row:
                failures.append({"path": rel(INDEX), "audit_id": row.get("audit_id"), "error": "blocked_report_missing_current_blocker"})
            if not row.get("current_blocker") and not row.get("superseded_by"):
                failures.append({"path": rel(INDEX), "audit_id": row.get("audit_id"), "error": "blocked_report_missing_superseded_marker"})

    return {
        "schema_id": "pm.audit_status_index.validation_report.v1",
        "generated_at_utc": utc_now(),
        "status": "pass" if not failures else "fail",
        "failures": failures,
        "summary": actual.get("summary", {}),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=["generate", "validate"])
    args = parser.parse_args()
    if args.command == "generate":
        index = build_index()
        INDEX.write_text(json.dumps(index, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        MARKDOWN.write_text(render_markdown(index), encoding="utf-8")
        print(json.dumps({"status": "pass", "index": rel(INDEX), "markdown": rel(MARKDOWN)}, indent=2))
        return 0
    report = validate()
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    sys.exit(main())
