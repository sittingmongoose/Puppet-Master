#!/usr/bin/env python3
"""Record one validated window assignment. Writes only audit control artifacts."""

import argparse
import json
from pathlib import Path


SCRIPT = Path(__file__).resolve()
AUDIT = SCRIPT.parent


def load(path):
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def write(path, rows):
    path.write_text("\n".join(json.dumps(row, sort_keys=True, separators=(",", ":")) for row in rows) + "\n", encoding="utf-8")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--assignment-id", required=True)
    parser.add_argument("--window-id", required=True)
    parser.add_argument("--role", required=True)
    parser.add_argument("--agent-id", required=True)
    parser.add_argument("--assigned-at", required=True)
    args = parser.parse_args()

    coverage = json.loads((AUDIT / "doc_window_coverage_report.json").read_text(encoding="utf-8"))
    assert coverage["manifest_validation_passed"] is True and coverage["assignment_gate_open"] is True

    manifest_path = AUDIT / "doc_window_manifest.jsonl"
    assignment_path = AUDIT / "doc_window_assignments.jsonl"
    master_path = AUDIT / "assignment_manifest.jsonl"
    manifest = load(manifest_path)
    assignments = load(assignment_path)
    master = load(master_path)
    windows = {row["window_id"]: row for row in manifest if row.get("record_type") == "document_window"}
    assert args.window_id in windows, args.window_id
    window = windows[args.window_id]
    allowed_roles = set(window["required_roles"]) | set(window["specialist_roles_recommended"])
    assert args.role in allowed_roles, (args.role, allowed_roles)
    assert not any(row.get("assignment_id") == args.assignment_id for row in assignments)
    existing = [row for row in assignments if row.get("record_type") == "window_assignment" and row["window_id"] == args.window_id]
    assert not any(row["role"] == args.role for row in existing), (args.window_id, args.role)
    if args.role in window["required_roles"]:
        assert not any(row["agent_id"] == args.agent_id and row["role"] in window["required_roles"] for row in existing), "Required roles must use different agents"

    row = {
        "record_type":"window_assignment",
        "assignment_id":args.assignment_id,
        "document_path":window["document_path"],
        "window_id":args.window_id,
        "role":args.role,
        "agent_id":args.agent_id,
        "context_capsule_ref":f"Plans/.audits/audit-20260709-002-plan-assurance-windowed-blind-exhaustive/window_context_capsules.jsonl#CAP-{args.window_id}",
        "assigned_at":args.assigned_at,
        "state":"assigned",
        "result_ref":None,
        "source_hash":window["source_hash"],
        "window_source_hash":window["window_source_hash"],
        "zero_prior_coverage_carried":True,
    }
    assignments.append(row)
    assignment_total = sum(item.get("record_type") == "window_assignment" for item in assignments)
    for item in assignments:
        if item.get("record_type") == "audit_header":
            item["assignment_count"] = assignment_total
            item["status"] = "assignments_in_progress"
    window["assigned_agent_ids"].append(args.agent_id)
    window["assigned_roles"].append(args.role)
    window["review_state"] = "partially_assigned"
    master.append({
        "record_type":"window_assignment_ref",
        "assignment_id":args.assignment_id,
        "window_id":args.window_id,
        "document_path":window["document_path"],
        "role":args.role,
        "agent_id":args.agent_id,
        "state":"assigned",
        "assigned_at":args.assigned_at,
    })
    write(manifest_path, manifest)
    write(assignment_path, assignments)
    write(master_path, master)
    print(json.dumps(row, sort_keys=True))


if __name__ == "__main__":
    main()
