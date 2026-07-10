#!/usr/bin/env python3
"""Mechanically validate one-agent/one-assignment isolation and capsule integrity."""

from __future__ import annotations

import hashlib
import json
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path


AUDIT = Path(__file__).resolve().parent
AUDIT_ID = "audit-20260709-003-plan-assurance-fresh-agent-windowed-blind-exhaustive"
MAX_CAPSULE_BYTES = 64_000
REQUIRED_WINDOW_ROLES = {"contract_capability_exact_behavior", "adversarial_negative_space"}


def load_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def parse_time(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def main() -> None:
    capsules_all = load_jsonl(AUDIT / "window_context_capsules.jsonl")
    capsules = {row["capsule_id"]: row for row in capsules_all if row.get("record_type") == "window_context_capsule"}
    registry_all = load_jsonl(AUDIT / "fresh_agent_assignment_registry.jsonl")
    registry = [row for row in registry_all if row.get("record_type") == "substantive_assignment"]
    window_assignments = [row for row in load_jsonl(AUDIT / "doc_window_assignments.jsonl") if row.get("record_type") == "window_assignment"]
    results = [row for row in load_jsonl(AUDIT / "doc_window_results.jsonl") if row.get("record_type") == "window_result"]

    violations: list[dict] = []
    capsule_map: dict[str, tuple[str, int]] = {}
    for capsule_id, row in capsules.items():
        immutable = {key: value for key, value in row.items() if key not in {"context_capsule_hash", "serialized_bytes"}}
        encoded = json.dumps(immutable, sort_keys=True, separators=(",", ":")).encode("utf-8")
        digest = hashlib.sha256(encoded).hexdigest()
        size = len(encoded)
        capsule_map[capsule_id] = (digest, size)
        if digest != row.get("context_capsule_hash") or size != row.get("serialized_bytes") or size > MAX_CAPSULE_BYTES:
            violations.append({"type": "capsule_integrity_or_size", "capsule_id": capsule_id, "size": size})

    assignment_counts = Counter(row.get("assignment_id") for row in registry)
    agent_counts = Counter(row.get("agent_instance_id") for row in registry)
    duplicate_assignments = sorted(key for key, count in assignment_counts.items() if not key or count != 1)
    duplicate_agents = sorted(key for key, count in agent_counts.items() if not key or count != 1)
    for assignment_id in duplicate_assignments:
        violations.append({"type": "assignment_id_count_not_one", "assignment_id": assignment_id, "count": assignment_counts[assignment_id]})
    for agent_id in duplicate_agents:
        violations.append({"type": "agent_assignment_count_not_one", "agent_instance_id": agent_id, "count": agent_counts[agent_id]})

    scope_sets: dict[str, set[tuple[str, str]]] = defaultdict(set)
    agents_by_window_role: dict[tuple[str, str], set[str]] = defaultdict(set)
    recycled_agents: set[str] = set()
    capsule_violations = 0
    post_terminal_results = 0
    result_by_id = {row.get("result_id"): row for row in results}
    for row in registry:
        agent = row.get("agent_instance_id")
        scope_sets[agent].add((row.get("scope_type"), row.get("scope_id")))
        if row.get("agent_path") != agent or row.get("thread_id") != agent:
            violations.append({"type": "agent_identity_field_mismatch", "assignment_id": row.get("assignment_id")})
        if row.get("prior_substantive_assignment_count") != 0:
            violations.append({"type": "nonzero_prior_assignment_count", "assignment_id": row.get("assignment_id")})
        if row.get("terminal_after_result") is not True:
            violations.append({"type": "terminal_after_result_not_true", "assignment_id": row.get("assignment_id")})
        if row.get("dispatch_method") != "spawn_agent" or row.get("recycled_followup_assignment") is not False:
            recycled_agents.add(agent)
            violations.append({"type": "recycled_or_nonspawn_assignment", "assignment_id": row.get("assignment_id")})
        if row.get("scope_type") == "window":
            agents_by_window_role[(row.get("window_id"), row.get("role"))].add(agent)

        ref = row.get("context_capsule_ref", "")
        capsule_id = ref.rsplit("#", 1)[-1] if "#" in ref else ""
        expected = capsule_map.get(capsule_id)
        if not expected or expected[0] != row.get("context_capsule_hash") or expected[1] != row.get("context_capsule_serialized_bytes") or expected[1] > MAX_CAPSULE_BYTES:
            capsule_violations += 1
            violations.append({"type": "assignment_capsule_missing_hash_or_oversized", "assignment_id": row.get("assignment_id")})

        completed_at = row.get("completed_at")
        terminal_at = row.get("terminal_at")
        result_ref = row.get("result_ref")
        if completed_at or terminal_at or result_ref:
            if not (completed_at and terminal_at and result_ref and row.get("state") == "terminal"):
                violations.append({"type": "partial_terminal_state", "assignment_id": row.get("assignment_id")})
            elif result_ref not in result_by_id:
                violations.append({"type": "missing_result_ref", "assignment_id": row.get("assignment_id"), "result_ref": result_ref})
            else:
                result_time = parse_time(result_by_id[result_ref]["completed_at"])
                terminal_time = parse_time(terminal_at)
                if result_time > terminal_time:
                    post_terminal_results += 1
                    violations.append({"type": "result_after_terminal", "assignment_id": row.get("assignment_id")})
        elif row.get("state") != "assigned":
            violations.append({"type": "invalid_pending_state", "assignment_id": row.get("assignment_id")})

    multi_scope_agents = sorted(agent for agent, scopes in scope_sets.items() if len(scopes) != 1)
    for agent in multi_scope_agents:
        violations.append({"type": "agent_spans_multiple_scopes", "agent_instance_id": agent, "scopes": sorted(scope_sets[agent])})

    same_window_role_identity: list[dict] = []
    windows = {row.get("window_id") for row in registry if row.get("scope_type") == "window"}
    for window_id in windows:
        exact = agents_by_window_role.get((window_id, "contract_capability_exact_behavior"), set())
        adversarial = agents_by_window_role.get((window_id, "adversarial_negative_space"), set())
        overlap = exact & adversarial
        if overlap:
            same_window_role_identity.append({"window_id": window_id, "agents": sorted(overlap)})
            violations.append({"type": "same_agent_for_both_window_roles", "window_id": window_id, "agents": sorted(overlap)})

    registry_by_assignment = {row["assignment_id"]: row for row in registry}
    doc_by_assignment = {row["assignment_id"]: row for row in window_assignments}
    if set(doc_by_assignment) != {row["assignment_id"] for row in registry if row.get("scope_type") == "window"}:
        violations.append({"type": "window_registry_assignment_set_mismatch"})
    for assignment_id, doc_row in doc_by_assignment.items():
        reg = registry_by_assignment.get(assignment_id)
        if not reg or any(doc_row.get(field) != reg.get(field) for field in ("agent_instance_id", "agent_path", "thread_id", "window_id", "role", "context_capsule_ref", "context_capsule_hash")):
            violations.append({"type": "window_assignment_registry_field_mismatch", "assignment_id": assignment_id})

    report = {
        "audit_id": AUDIT_ID,
        "status": "passed" if not violations else "failed",
        "fresh_agent_isolation_passed": not violations,
        "unique_agents_spawned": len(agent_counts),
        "substantive_assignment_count": len(registry),
        "assignment_count_per_agent_all_one": not duplicate_agents,
        "duplicate_agent_identity_count": len(duplicate_agents),
        "duplicate_agent_ids": duplicate_agents,
        "recycled_agent_count": len(recycled_agents),
        "recycled_agent_ids": sorted(recycled_agents),
        "multi_scope_agent_count": len(multi_scope_agents),
        "multi_scope_agent_ids": multi_scope_agents,
        "same_window_dual_role_identity_count": len(same_window_role_identity),
        "capsule_violation_count": capsule_violations,
        "post_terminal_result_count": post_terminal_results,
        "terminal_agent_count": sum(row.get("state") == "terminal" for row in registry),
        "pending_agent_count": sum(row.get("state") == "assigned" for row in registry),
        "context_capsule_count": len(capsules),
        "max_capsule_bytes": max((size for _, size in capsule_map.values()), default=0),
        "capsule_byte_limit": MAX_CAPSULE_BYTES,
        "violation_count": len(violations),
        "violations": violations,
    }
    (AUDIT / "fresh_agent_isolation_report.json").write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    coverage_path = AUDIT / "coverage_report.json"
    coverage = json.loads(coverage_path.read_text(encoding="utf-8"))
    coverage["fresh_agent_isolation"] = {key: value for key, value in report.items() if key not in {"audit_id", "status", "violations"}}
    coverage_path.write_text(json.dumps(coverage, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2, sort_keys=True))
    if violations:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
