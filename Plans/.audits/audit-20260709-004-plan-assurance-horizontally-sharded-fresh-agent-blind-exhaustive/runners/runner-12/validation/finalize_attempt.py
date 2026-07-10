#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path


def read_jsonl(path: Path) -> list[dict]:
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def write_jsonl(path: Path, rows: list[dict]) -> None:
    path.write_text("".join(json.dumps(row, separators=(",", ":"), ensure_ascii=False) + "\n" for row in rows), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--runner-root", required=True)
    parser.add_argument("--attempt-id", required=True)
    parser.add_argument("--agent-thread-id", required=True)
    parser.add_argument("--agent-nickname", required=True)
    parser.add_argument("--created-at", required=True)
    parser.add_argument("--completed-at", required=True)
    parser.add_argument("--result-hash", required=True)
    parser.add_argument("--result-bytes", required=True, type=int)
    parser.add_argument("--validation-status", choices=("valid", "invalid"), required=True)
    parser.add_argument("--validation-errors-json", default="[]")
    args = parser.parse_args()

    runner_root = Path(args.runner_root)
    registry_path = runner_root / "fresh_agent_assignment_registry.jsonl"
    manifest_path = runner_root / "result_manifest.jsonl"
    registry = read_jsonl(registry_path)
    matches = [row for row in registry if row.get("attempt_id") == args.attempt_id]
    if len(matches) != 1:
        raise SystemExit(f"expected one registry row for {args.attempt_id}, got {len(matches)}")
    row = matches[0]
    if row.get("attempt_state") not in ("running", args.validation_status):
        raise SystemExit(f"attempt is not finalizable from state {row.get('attempt_state')}")
    validation_errors = json.loads(args.validation_errors_json)
    if not isinstance(validation_errors, list):
        raise SystemExit("validation errors must be a JSON array")

    row["agent_thread_id"] = args.agent_thread_id
    row["agent_thread_id_source"] = "native_subagent_session_meta_id"
    row["agent_nickname"] = args.agent_nickname
    row["created_at"] = args.created_at
    row["completed_at"] = args.completed_at
    row["result_hash"] = args.result_hash
    row["result_bytes"] = args.result_bytes
    row["attempt_state"] = args.validation_status
    row["coverage_credit"] = 1 if args.validation_status == "valid" else 0
    row["validation_errors"] = validation_errors
    write_jsonl(registry_path, registry)

    manifest = read_jsonl(manifest_path)
    if any(item.get("attempt_id") == args.attempt_id for item in manifest):
        raise SystemExit(f"manifest already contains {args.attempt_id}")
    manifest_row = dict(row)
    manifest_row["validation_status"] = args.validation_status
    manifest.append(manifest_row)
    write_jsonl(manifest_path, manifest)
    print(json.dumps(manifest_row, separators=(",", ":"), ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
