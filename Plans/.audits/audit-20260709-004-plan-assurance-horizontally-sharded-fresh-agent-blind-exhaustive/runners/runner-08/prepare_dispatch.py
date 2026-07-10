#!/usr/bin/env python3
"""Print one immutable audit-004 runner-08 launch/dispatch bundle.

This root-only metadata helper performs no writes and never reads Plan prose.
The caller must add the returned launch packet and dispatch receipt atomically
with apply_patch before spawning the named native reviewer.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


RUNNER_DIR = Path(__file__).resolve().parent
AUDIT_ROOT = RUNNER_DIR.parents[1]
WORKSPACE = RUNNER_DIR.parents[4]
PACKET = AUDIT_ROOT / "assignments" / "runner-08.jsonl"
PROTOCOL = RUNNER_DIR / "reviewer_protocol_v4.json"
LOCATOR = RUNNER_DIR / "evidence_locator_v2.py"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load_assignment(assignment_id: str) -> dict[str, Any]:
    for line in PACKET.read_text(encoding="utf-8").splitlines():
        if line.strip():
            row = json.loads(line)
            if row.get("assignment_id") == assignment_id:
                return row
    raise SystemExit("assignment_not_found")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--assignment-id", required=True)
    parser.add_argument("--attempt-no", required=True, type=int)
    args = parser.parse_args()
    assignment = load_assignment(args.assignment_id)
    if assignment.get("runner_id") != "runner-08":
        raise SystemExit("wrong_runner")

    launch_ref = (
        RUNNER_DIR
        / "launch_packets"
        / f"{args.assignment_id}--attempt-{args.attempt_no:02d}.json"
    ).relative_to(WORKSPACE)
    receipt_ref = (
        RUNNER_DIR
        / "dispatch_receipts"
        / f"{args.assignment_id}--attempt-{args.attempt_no:02d}.json"
    ).relative_to(WORKSPACE)
    if (WORKSPACE / launch_ref).exists() or (WORKSPACE / receipt_ref).exists():
        raise SystemExit("attempt_artifact_already_exists")

    capsule = json.loads(
        (WORKSPACE / assignment["capsule_ref"]).read_text(encoding="utf-8")
    )
    instance_id = str(uuid.uuid4()).upper()
    suffix = instance_id.split("-")[0].lower()
    sequence = args.assignment_id.split("-")[1]
    agent_name = f"a004_r08_adversarial_{sequence}_{suffix}"
    agent_path = f"/root/{agent_name}"
    created_at = (
        datetime.now(timezone.utc)
        .isoformat(timespec="seconds")
        .replace("+00:00", "Z")
    )
    protocol_ref = str(PROTOCOL.relative_to(WORKSPACE))
    locator_ref = str(LOCATOR.relative_to(WORKSPACE))

    prompt = f"""You are a fresh, isolated, terminal document-window reviewer for exactly one audit-004 assignment. You must perform this assignment once, return one final JSON object, and then remain terminal. Never accept a follow-up assignment.

IDENTITY TO ECHO EXACTLY
assignment_id: {args.assignment_id}
runner_id: runner-08
agent_instance_id: {instance_id}
agent_path: {agent_path}
model: gpt-5.6-sol
reasoning_effort: ultra
role: {assignment['role']}
window_id: {assignment['window_id']}
doc_id: {assignment['doc_id']}
document_path: {assignment['document_path']}

READ-ONLY BLIND BOUNDARY
Read exactly these four files and nothing else:
1. {protocol_ref} (sha256 {sha256(PROTOCOL)}, bytes {PROTOCOL.stat().st_size})
2. {locator_ref} (sha256 {sha256(LOCATOR)}, bytes {LOCATOR.stat().st_size})
3. {assignment['capsule_ref']} (sha256 {assignment['capsule_sha256']}, bytes {assignment['capsule_bytes']})
4. {assignment['source_excerpt_ref']} (sha256 {assignment['source_excerpt_sha256']}, bytes {assignment['source_excerpt_bytes']})
Do not read AGENTS.md, canonical source directly, other capsules/windows, any audit result, any other runner file, git state, or web sources. Do not write any file.

MECHANICAL REQUIREMENTS
- Verify all four hashes and byte counts before substantive review. If any mismatch exists, return a schema-valid infrastructure_failure result.
- Follow reviewer_protocol_v4.json exactly, including its assigned role card and required arrays.
- The excerpt/capsule header is NOT a canonical line map. Never derive, offset, guess, or adjust canonical line numbers from excerpt/header lines.
- For every distinct evidence quote used anywhere in the JSON, execute evidence_locator_v2.py with this assignment_id and that exact quote. Use only a unique canonical match returned by the locator. If ambiguous, choose a more specific exact quote and query again.
- Every nested evidence ref and every exact_evidence_refs item must carry canonical document_path, integer canonical line_start/line_end, and a contiguous exact quote found by the locator within the allowed core/context ranges.
- Obtain your actual native thread UUID from CODEX_THREAD_ID and emit it as agent_thread_id.
- Return exactly one JSON object with no Markdown or surrounding prose. Top-level observations, candidate_findings, explicit_non_gaps, unknowns, and exact_evidence_refs must all be arrays (empty is permitted). infrastructure_failure must be null on success. terminal_after_result must be true.
"""

    launch = {
        "schema_version": "a004.launch_packet.v2",
        "audit_id": assignment["audit_id"],
        "runner_id": "runner-08",
        "assignment_id": args.assignment_id,
        "attempt_no": args.attempt_no,
        "agent_instance_id": instance_id,
        "agent_name": agent_name,
        "agent_path": agent_path,
        "model": "gpt-5.6-sol",
        "reasoning_effort": "ultra",
        "fork_turns": "none",
        "created_at": created_at,
        "prompt": prompt,
    }
    receipt = {
        "schema_version": "a004.dispatch_receipt.v2",
        "audit_id": assignment["audit_id"],
        "runner_id": "runner-08",
        "assignment_id": args.assignment_id,
        "attempt_no": args.attempt_no,
        "dispatch_id": str(uuid.uuid4()).upper(),
        "agent_instance_id": instance_id,
        "agent_name": agent_name,
        "agent_path": agent_path,
        "agent_thread_id": None,
        "model": "gpt-5.6-sol",
        "reasoning_effort": "ultra",
        "fork_turns": "none",
        "role": assignment["role"],
        "role_key": assignment["role_key"],
        "window_id": assignment["window_id"],
        "doc_id": assignment["doc_id"],
        "document_path": assignment["document_path"],
        "core_range": assignment["core_range"],
        "context_ranges": capsule.get("context_ranges", []),
        "core_sha256": assignment["core_sha256"],
        "source_sha256": assignment["source_sha256"],
        "capsule_ref": assignment["capsule_ref"],
        "capsule_sha256": assignment["capsule_sha256"],
        "capsule_bytes": assignment["capsule_bytes"],
        "capsule_package_bytes": assignment["capsule_package_bytes"],
        "source_excerpt_ref": assignment["source_excerpt_ref"],
        "source_excerpt_sha256": assignment["source_excerpt_sha256"],
        "source_excerpt_bytes": assignment["source_excerpt_bytes"],
        "protocol_ref": protocol_ref,
        "protocol_sha256": sha256(PROTOCOL),
        "protocol_bytes": PROTOCOL.stat().st_size,
        "evidence_locator_ref": locator_ref,
        "evidence_locator_sha256": sha256(LOCATOR),
        "evidence_locator_bytes": LOCATOR.stat().st_size,
        "launch_packet_ref": str(launch_ref),
        "created_at": created_at,
        "state": "immutable_prelaunch_dispatch",
        "prior_substantive_assignment_count": 0,
        "terminal_after_result": True,
        "no_followup_reuse": True,
        "coverage_credit": 0,
    }
    print(
        json.dumps(
            {
                "assignment": assignment,
                "attempt_no": args.attempt_no,
                "agent_instance_id": instance_id,
                "agent_name": agent_name,
                "agent_path": agent_path,
                "created_at": created_at,
                "prompt": prompt,
                "launch_ref": str(launch_ref),
                "receipt_ref": str(receipt_ref),
                "launch": launch,
                "receipt": receipt,
            },
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

