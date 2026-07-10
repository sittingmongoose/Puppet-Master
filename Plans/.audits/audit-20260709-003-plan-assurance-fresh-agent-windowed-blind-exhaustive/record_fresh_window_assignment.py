#!/usr/bin/env python3
"""Record one freshly spawned, single-window, single-role assignment."""

from __future__ import annotations

import argparse
import json
from pathlib import Path


AUDIT = Path(__file__).resolve().parent
AUDIT_ID = "audit-20260709-003-plan-assurance-fresh-agent-windowed-blind-exhaustive"


def load(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def write(path: Path, rows: list[dict]) -> None:
    path.write_text("\n".join(json.dumps(row, sort_keys=True, separators=(",", ":")) for row in rows) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--assignment-id", required=True)
    parser.add_argument("--window-id", required=True)
    parser.add_argument("--role", required=True)
    parser.add_argument("--agent-path", required=True)
    parser.add_argument("--created-at", required=True)
    args = parser.parse_args()

    assert args.agent_path.startswith("/root/"), args.agent_path
    assert args.role in {"contract_capability_exact_behavior", "adversarial_negative_space", "external_constraint_currentness_specialist", "gui_truthfulness_accessibility_specialist", "schema_state_concurrency_specialist", "security_privacy_authority_specialist", "test_oracle_evidence_specialist"}
    coverage = json.loads((AUDIT / "doc_window_coverage_report.json").read_text(encoding="utf-8"))
    assert coverage["manifest_validation_passed"] is True and coverage["assignment_gate_open"] is True
    isolation = json.loads((AUDIT / "fresh_agent_isolation_report.json").read_text(encoding="utf-8"))
    assert isolation["fresh_agent_isolation_passed"] is True

    manifest_path = AUDIT / "doc_window_manifest.jsonl"
    doc_assignment_path = AUDIT / "doc_window_assignments.jsonl"
    registry_path = AUDIT / "fresh_agent_assignment_registry.jsonl"
    master_path = AUDIT / "assignment_manifest.jsonl"
    manifest = load(manifest_path)
    docs = load(doc_assignment_path)
    registry = load(registry_path)
    master = load(master_path)
    capsules = {row["window_id"]: row for row in load(AUDIT / "window_context_capsules.jsonl") if row.get("record_type") == "window_context_capsule"}
    windows = {row["window_id"]: row for row in manifest if row.get("record_type") == "document_window"}
    assert args.window_id in windows and args.window_id in capsules
    window = windows[args.window_id]
    capsule = capsules[args.window_id]
    allowed = set(window["required_roles"]) | set(window["specialist_roles_recommended"])
    assert args.role in allowed
    assert not any(row.get("assignment_id") == args.assignment_id for row in registry)
    assert not any(row.get("agent_instance_id") == args.agent_path for row in registry), "Fresh agent identity already used"
    existing = [row for row in registry if row.get("scope_type") == "window" and row.get("window_id") == args.window_id]
    assert not any(row.get("role") == args.role for row in existing), (args.window_id, args.role)
    if args.role in window["required_roles"]:
        assert not any(row.get("agent_instance_id") == args.agent_path and row.get("role") in window["required_roles"] for row in existing)

    capsule_ref = f"Plans/.audits/{AUDIT_ID}/window_context_capsules.jsonl#{capsule['capsule_id']}"
    common = {
        "assignment_id": args.assignment_id,
        "agent_instance_id": args.agent_path,
        "agent_path": args.agent_path,
        "thread_id": args.agent_path,
        "role": args.role,
        "scope_type": "window",
        "scope_id": args.window_id,
        "document_path": window["document_path"],
        "window_id": args.window_id,
        "feature_id": None,
        "context_capsule_ref": capsule_ref,
        "context_capsule_hash": capsule["context_capsule_hash"],
        "context_capsule_serialized_bytes": capsule["serialized_bytes"],
        "created_at": args.created_at,
        "completed_at": None,
        "prior_substantive_assignment_count": 0,
        "terminal_after_result": True,
        "terminal_at": None,
        "result_ref": None,
        "state": "assigned",
        "dispatch_method": "spawn_agent",
        "recycled_followup_assignment": False,
        "single_scope_assertion": True,
        "source_hash": window["source_hash"],
        "window_source_hash": window["window_source_hash"],
    }
    registry.append({"record_type": "substantive_assignment", "audit_id": AUDIT_ID, **common})
    docs.append({"record_type": "window_assignment", "audit_id": AUDIT_ID, **common})
    master.append({"record_type": "assignment_ref", "audit_id": AUDIT_ID, "registry_ref": f"fresh_agent_assignment_registry.jsonl#{args.assignment_id}", **common})
    for rows in (registry, docs, master):
        for row in rows:
            if row.get("record_type") == "audit_header":
                row["status"] = "fresh_assignments_in_progress"
                row["row_count"] = sum(item.get("record_type") in {"substantive_assignment", "window_assignment", "assignment_ref"} for item in rows)
    window["assigned_agent_ids"].append(args.agent_path)
    window["assigned_roles"].append(args.role)
    window["review_state"] = "partially_assigned"
    write(registry_path, registry)
    write(doc_assignment_path, docs)
    write(master_path, master)
    write(manifest_path, manifest)
    print(json.dumps(common, sort_keys=True))


if __name__ == "__main__":
    main()
