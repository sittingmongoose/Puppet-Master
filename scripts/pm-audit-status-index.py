#!/usr/bin/env python3
"""Generate and validate the current audit-status presentation index."""

from __future__ import annotations

import argparse
import importlib.util
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
CLOSURE_VALIDATOR = ROOT / "scripts/pm-audit-closure.py"
OPEN_SET_BASIS = (
    "scripts/pm-audit-closure.py validate_registry open_rows: a finding is open until an authenticated "
    "supersession chain ends in a closed row whose hashes are current (PLS-025)"
)


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def rel(path: Path) -> str:
    # Logical in-worktree path: do not resolve symlinks, which may point at an
    # external evidence target outside ROOT; relative_to still enforces the boundary.
    return path.absolute().relative_to(ROOT).as_posix()


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


def closure_validator() -> Any:
    """The closure validator module. Its validate_registry owns the open set."""
    spec = importlib.util.spec_from_file_location("pm_audit_closure_for_status_index", CLOSURE_VALIDATOR)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def closure_open_findings() -> list[dict[str, Any]]:
    """The open findings exactly as the closure validator reports them in validate_registry's
    open_rows (T235). PLS-025 forbids the latest-row-per-finding shortcut: a reopened row stays
    open until a re-audit row validly supersedes it, and a closing successor whose own hashes went
    stale leaves it open. Rows are read with the validator's own reader, so line numbers agree."""
    closure = closure_validator()
    with closure.validation_cache():  # read-only: HEAD lookups are kept for this one validation
        report = closure.validate_registry(REGISTRY)
    rows_by_line = {row["_line_no"]: row for row in closure.read_jsonl(REGISTRY, [], required=False)}
    findings = []
    for open_row in report["open_rows"]:
        row = rows_by_line.get(open_row.get("line"), {})
        findings.append(
            {
                "closure_id": open_row.get("closure_id"),
                "finding_key": open_row.get("finding_key"),
                "line": open_row.get("line"),
                "closure_status": open_row.get("closure_status"),
                "audit_ids": row.get("audit_ids", []),
                "closure_reason": row.get("closure_reason"),
            }
        )
    return findings


def build_index() -> dict[str, Any]:
    closure_rows = load_jsonl(REGISTRY)
    active_open_findings = closure_open_findings()
    active_open_findings.sort(key=lambda row: (str(row.get("finding_key")), str(row.get("closure_id"))))
    reopened_count = sum(1 for row in active_open_findings if row.get("closure_status") == "reopened")
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
            "open_findings": OPEN_SET_BASIS,
        },
        "summary": {
            "report_count": len(reports),
            "reported_status_family_counts": dict(sorted(status_counts.items())),
            "current_blocker_count": current_report_blocker_count + len(active_open_findings),
            "current_report_blocker_count": current_report_blocker_count,
            "current_open_finding_count": len(active_open_findings),
            "current_reopened_finding_count": reopened_count,
            "historical_blocked_or_fail_report_count": sum(
                1 for row in reports if row["reported_status_family"] == "blocked_or_fail"
            ),
            "closure_registry_row_count": len(closure_rows),
        },
        "active_open_findings": active_open_findings,
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
        f"- Open finding blockers: {summary['current_open_finding_count']}",
        f"- Reopened finding blockers: {summary['current_reopened_finding_count']}",
        f"- Historical BLOCKED/FAIL reports indexed: {summary['historical_blocked_or_fail_report_count']}",
        f"- Closure registry rows: {summary['closure_registry_row_count']}",
    ]
    if index["active_open_findings"]:
        rows.extend(
            [
                "",
                "## Active open findings",
                "",
                "Open as `scripts/pm-audit-closure.py validate` reports them: a finding stays open until an authenticated re-audit chain ends in a closed row whose hashes are current.",
                "",
                "| Finding key | Closure row | Status | Registry line |",
                "|---|---|---|---:|",
            ]
        )
        for finding in index["active_open_findings"]:
            rows.append(
                f"| `{finding['finding_key']}` | `{finding['closure_id']}` | `{finding['closure_status']}` | {finding['line']} |"
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
    # T239: generate writes render_markdown of the index. The file must be that render.
    # Only the generation-time line may differ; the counts and finding rows are part of the compare.
    markdown_text = MARKDOWN.read_text(encoding="utf-8")
    generated_line = re.compile(r"(?m)^- Generated: `[^`\n]*`$")
    placeholder = "- Generated: `<generation-time>`"
    rendered = render_markdown(expected)
    if generated_line.sub(placeholder, markdown_text) != generated_line.sub(placeholder, rendered):
        failures.append({"path": rel(MARKDOWN), "error": "stale_current_audit_status_markdown"})

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
        # What the closure validator reports open now; a current index lists exactly these (T235).
        "closure_validator_open_finding_count": expected["summary"]["current_open_finding_count"],
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
    if any(f.get("error") in ("stale_audit_status_index", "stale_current_audit_status_markdown")
           for f in report["failures"]):
        # T241: message only. The committed index counts gitignored Plans/.audits reports
        # that only full checkouts carry, so a clean clone reports staleness by design; in a full
        # tree the same staleness is real and needs `generate` (T244: the note names both causes).
        print("note: the committed index counts gitignored reports that only full checkouts carry. "
              "In a clean clone this staleness is expected: validate must run in a full tree. "
              "In a full tree it is real: regenerate with `generate`.", file=sys.stderr)
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    sys.exit(main())
