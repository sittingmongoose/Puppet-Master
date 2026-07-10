#!/usr/bin/env python3
"""Capture a read-only, complete-line audit-004 runner-lineage checkpoint.

The script never writes runner namespaces.  It snapshots exact byte prefixes of
every runner JSONL and the root quarantine registry into a caller-selected
root-owned coordination artifact.  A checkpoint is a candidate only; it grants
no coverage until frozen primary and independent crosscheck evidence promote it.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import stat
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath
from typing import Any


AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
MASTER_THREAD_ID = "019f4a04-5fe1-71f3-b992-e599aad3da5b"
INITIAL_ANCHOR_REF = "validators/failure_lineage_v3.initial.json"
INITIAL_ANCHOR_SHA256 = "bf558c0aa8034e8bb1c82ae49462fe3603ae07651506d0942f2867fa7a0005f4"
HERE = Path(__file__).resolve()
ROOT = HERE.parents[1]
CANONICAL_NAMES = {
    "fresh_agent_assignment_registry.jsonl": "registry",
    "result_manifest.jsonl": "result_manifest",
    "failed_attempts.jsonl": "failure",
    "ingest_errors.jsonl": "ingest_failure",
}


def digest_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def canonical_bytes(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode("utf-8")


def safe_relative(path: Path) -> str:
    resolved = path.resolve(strict=False)
    try:
        relative = resolved.relative_to(ROOT.resolve())
    except ValueError as exc:
        raise ValueError(f"path escapes audit root: {path}") from exc
    token = relative.as_posix()
    if token != str(PurePosixPath(token)) or ".." in PurePosixPath(token).parts:
        raise ValueError(f"noncanonical audit-relative path: {token}")
    return token


def stable_read(
    path: Path, *, require_line_boundary: bool = True, require_utf8: bool = True
) -> tuple[bytes, os.stat_result]:
    flags = os.O_RDONLY
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    fd = os.open(path, flags)
    try:
        before = os.fstat(fd)
        if not stat.S_ISREG(before.st_mode):
            raise ValueError(f"not a regular file: {path}")
        chunks: list[bytes] = []
        remaining = before.st_size
        while remaining:
            chunk = os.read(fd, min(1024 * 1024, remaining))
            if not chunk:
                raise ValueError(f"short read: {path}")
            chunks.append(chunk)
            remaining -= len(chunk)
        data = b"".join(chunks)
        after = os.fstat(fd)
        stable_fields = (
            "st_dev", "st_ino", "st_mode", "st_size", "st_mtime_ns", "st_ctime_ns"
        )
        if any(getattr(before, name) != getattr(after, name) for name in stable_fields):
            raise ValueError(f"file changed during capture: {path}")
        if require_line_boundary and data and not data.endswith(b"\n"):
            raise ValueError(f"JSONL is not at a complete-line boundary: {path}")
        if require_utf8:
            data.decode("utf-8")
        return data, after
    finally:
        os.close(fd)


def semantic_class(ref: str) -> str:
    path = PurePosixPath(ref)
    if ref == "coordination/QUARANTINE_REGISTRY.jsonl":
        return "root_quarantine"
    if len(path.parts) == 3 and path.parts[0] == "runners" and path.name in CANONICAL_NAMES:
        return CANONICAL_NAMES[path.name]
    lowered = ref.lower()
    if "infrastructure" in lowered:
        return "infrastructure"
    if "receipt_correction" in lowered:
        return "correction"
    if "failed_attempt" in lowered:
        return "auxiliary_failure"
    if "attempt_validation" in lowered:
        return "auxiliary_validation"
    if "assignment_registry" in lowered:
        return "auxiliary_registry"
    if "pending_result_manifest" in lowered:
        return "pending_manifest"
    if "native_identity" in lowered or "spawn_receipt" in lowered:
        return "identity"
    if "dispatch_receipt" in lowered:
        return "dispatch"
    if "attempt_receipt" in lowered:
        return "attempt"
    if "checkpoint_manifest" in lowered:
        return "checkpoint_metadata"
    raise ValueError(f"unclassified runner JSONL; explicit code review required: {ref}")


def artifact_class(ref: str) -> str:
    parts = PurePosixPath(ref).parts
    lowered = ref.lower()
    if PurePosixPath(ref).name == "RUNNER_COMPLETE.json":
        return "runner_completion"
    if "raw_results" in parts:
        return "raw_result"
    if "failed_attempts" in parts:
        return "failed_artifact"
    if "validation" in parts:
        return "validation_artifact"
    if "receipts" in parts:
        return "auxiliary_receipt"
    if "checkpoint" in lowered:
        return "checkpoint_metadata"
    return "runner_support"


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--sequence", type=int, default=0)
    parser.add_argument("--parent-checkpoint", type=Path)
    parser.add_argument("--captured-at")
    args = parser.parse_args()
    if args.sequence < 0 or isinstance(args.sequence, bool):
        raise SystemExit("sequence must be a nonnegative integer")
    if args.sequence == 0 and args.parent_checkpoint is not None:
        raise SystemExit("checkpoint zero must use the sealed initial anchor parent")
    if args.sequence > 0 and args.parent_checkpoint is None:
        raise SystemExit("later checkpoints require --parent-checkpoint")

    initial_path = ROOT / INITIAL_ANCHOR_REF
    if digest_bytes(initial_path.read_bytes()) != INITIAL_ANCHOR_SHA256:
        raise SystemExit("sealed initial lineage anchor hash mismatch")
    initial = load_json(initial_path)
    anchored = {
        row["ref"]: row
        for row in initial.get("files", [])
        if isinstance(row, dict) and isinstance(row.get("ref"), str)
    }

    prior_streams: dict[str, dict[str, Any]] = {}
    prior_sessions: dict[str, dict[str, Any]] = {}
    prior_artifacts: dict[str, dict[str, Any]] = {}
    if args.parent_checkpoint is None:
        parent = {
            "kind": "sealed_initial_anchor",
            "ref": INITIAL_ANCHOR_REF,
            "sha256": INITIAL_ANCHOR_SHA256,
        }
    else:
        parent_path = args.parent_checkpoint.resolve()
        parent_doc = load_json(parent_path)
        if parent_doc.get("schema") != "audit004.lineage_checkpoint.v1":
            raise SystemExit("parent checkpoint schema mismatch")
        if parent_doc.get("audit_id") != AUDIT_ID:
            raise SystemExit("parent checkpoint audit mismatch")
        if parent_doc.get("sequence") != args.sequence - 1:
            raise SystemExit("parent checkpoint sequence mismatch")
        prior_streams = {
            row["ref"]: row
            for row in parent_doc.get("streams", [])
            if isinstance(row, dict) and isinstance(row.get("ref"), str)
        }
        prior_sessions = {
            row["session_id"]: row
            for row in parent_doc.get("native_sessions", [])
            if isinstance(row, dict) and isinstance(row.get("session_id"), str)
        }
        prior_artifacts = {
            row["ref"]: row
            for row in parent_doc.get("runner_artifacts", [])
            if isinstance(row, dict) and isinstance(row.get("ref"), str)
        }
        parent = {
            "kind": "checkpoint",
            "sequence": parent_doc["sequence"],
            "ref": safe_relative(parent_path),
            "sha256": digest_bytes(parent_path.read_bytes()),
        }

    expected_runner_ids = [f"runner-{number:02d}" for number in range(1, 13)]
    present_paths = {
        path.resolve()
        for runner_id in expected_runner_ids
        for path in (ROOT / "runners" / runner_id).rglob("*.jsonl")
        if path.is_file()
    }
    quarantine = ROOT / "coordination/QUARANTINE_REGISTRY.jsonl"
    if not quarantine.is_file():
        raise SystemExit("root quarantine registry is missing")
    present_paths.add(quarantine.resolve())

    expected_refs = {
        f"runners/{runner_id}/{name}"
        for runner_id in expected_runner_ids
        for name in CANONICAL_NAMES
    }
    present_refs = {safe_relative(path) for path in present_paths}
    all_refs = sorted(present_refs | expected_refs | set(prior_streams))
    rows: list[dict[str, Any]] = []
    for ref in all_refs:
        path = ROOT / ref
        previous = prior_streams.get(ref)
        if path.is_file():
            data, metadata = stable_read(path)
            row = {
                "ref": ref,
                "state": "present",
                "prefix_bytes": len(data),
                "prefix_sha256": digest_bytes(data),
                "ends_with_lf": not data or data.endswith(b"\n"),
                "introduced_at_sequence": (
                    previous.get("introduced_at_sequence", args.sequence)
                    if isinstance(previous, dict)
                    else args.sequence
                ),
                "semantic_class": semantic_class(ref),
                "device": metadata.st_dev,
                "inode": metadata.st_ino,
            }
            if ref in anchored:
                base = anchored[ref]
                count = base.get("prefix_bytes")
                wanted = base.get("prefix_sha256")
                if not isinstance(count, int) or isinstance(count, bool) or count < 0:
                    raise SystemExit(f"initial anchor row malformed: {ref}")
                if len(data) < count or digest_bytes(data[:count]) != wanted:
                    raise SystemExit(f"live stream does not extend sealed initial prefix: {ref}")
            if isinstance(previous, dict) and previous.get("state") == "present":
                old_count = previous.get("prefix_bytes")
                old_hash = previous.get("prefix_sha256")
                if not isinstance(old_count, int) or len(data) < old_count:
                    raise SystemExit(f"stream shrank from parent checkpoint: {ref}")
                if digest_bytes(data[:old_count]) != old_hash:
                    raise SystemExit(f"stream rewrote parent checkpoint prefix: {ref}")
        else:
            if isinstance(previous, dict) and previous.get("state") == "present":
                raise SystemExit(f"previously present stream disappeared: {ref}")
            row = {
                "ref": ref,
                "state": "missing",
                "prefix_bytes": 0,
                "prefix_sha256": digest_bytes(b""),
                "ends_with_lf": True,
                "introduced_at_sequence": None,
                "semantic_class": semantic_class(ref),
                "device": None,
                "inode": None,
            }
        rows.append(row)

    inventory_digest = digest_bytes(
        b"".join(canonical_bytes(row) for row in sorted(rows, key=lambda item: item["ref"]))
    )
    runner_threads_doc = load_json(ROOT / "coordination/runner_thread_registry.json")
    if not isinstance(runner_threads_doc, dict):
        raise SystemExit("runner thread registry is not an object")
    runner_by_thread = {
        value: key
        for key, value in runner_threads_doc.items()
        if isinstance(key, str) and isinstance(value, str)
    }
    sessions_root = Path.home() / ".codex" / "sessions"
    session_paths: dict[str, Path] = {}
    session_rows: list[dict[str, Any]] = []
    for path in sorted(sessions_root.rglob("*.jsonl")):
        if not path.is_file():
            continue
        try:
            with path.open("rb") as handle:
                first_line = handle.readline()
            first_row = json.loads(first_line.decode("utf-8"))
        except Exception:
            continue
        if not isinstance(first_row, dict) or first_row.get("type") != "session_meta":
            continue
        payload = first_row.get("payload")
        if not isinstance(payload, dict):
            continue
        parent_thread = payload.get("parent_thread_id")
        if parent_thread not in runner_by_thread:
            continue
        session_id = payload.get("id")
        agent_path = payload.get("agent_path")
        if (
            not isinstance(session_id, str)
            or not session_id
            or not isinstance(agent_path, str)
            or not agent_path.startswith("/root/")
            or session_id in session_paths
        ):
            raise SystemExit(f"ambiguous or malformed native runner session: {path}")
        session_paths[session_id] = path
        data, metadata = stable_read(path)
        previous = prior_sessions.get(session_id)
        if isinstance(previous, dict):
            old_count = previous.get("prefix_bytes")
            old_hash = previous.get("prefix_sha256")
            if not isinstance(old_count, int) or isinstance(old_count, bool) or len(data) < old_count:
                raise SystemExit(f"native session shrank from parent checkpoint: {session_id}")
            if digest_bytes(data[:old_count]) != old_hash:
                raise SystemExit(f"native session rewrote parent prefix: {session_id}")
        session_rows.append(
            {
                "session_id": session_id,
                "runner_id": runner_by_thread[parent_thread],
                "parent_thread_id": parent_thread,
                "agent_path": agent_path,
                "prefix_bytes": len(data),
                "prefix_sha256": digest_bytes(data),
                "ends_with_lf": not data or data.endswith(b"\n"),
                "introduced_at_sequence": (
                    previous.get("introduced_at_sequence", args.sequence)
                    if isinstance(previous, dict)
                    else args.sequence
                ),
                "device": metadata.st_dev,
                "inode": metadata.st_ino,
            }
        )
    missing_prior_sessions = sorted(set(prior_sessions) - set(session_paths))
    if missing_prior_sessions:
        raise SystemExit(f"previously captured native sessions disappeared: {missing_prior_sessions}")
    session_inventory_digest = digest_bytes(
        b"".join(
            canonical_bytes(row)
            for row in sorted(session_rows, key=lambda item: item["session_id"])
        )
    )
    present_artifact_paths = {
        path.resolve()
        for runner_id in expected_runner_ids
        for path in (ROOT / "runners" / runner_id).rglob("*")
        if path.is_file() and path.suffix != ".jsonl"
    }
    completion_refs = {
        f"runners/{runner_id}/RUNNER_COMPLETE.json" for runner_id in expected_runner_ids
    }
    artifact_refs = sorted(
        {safe_relative(path) for path in present_artifact_paths}
        | completion_refs
        | set(prior_artifacts)
    )
    artifact_rows: list[dict[str, Any]] = []
    for ref in artifact_refs:
        path = ROOT / ref
        previous = prior_artifacts.get(ref)
        if path.is_file():
            data, metadata = stable_read(
                path, require_line_boundary=False, require_utf8=False
            )
            row = {
                "ref": ref,
                "state": "present",
                "bytes": len(data),
                "sha256": digest_bytes(data),
                "introduced_at_sequence": (
                    previous.get("introduced_at_sequence", args.sequence)
                    if isinstance(previous, dict)
                    else args.sequence
                ),
                "semantic_class": artifact_class(ref),
                "device": metadata.st_dev,
                "inode": metadata.st_ino,
            }
            if isinstance(previous, dict) and previous.get("state") == "present":
                if previous.get("bytes") != len(data) or previous.get("sha256") != row["sha256"]:
                    raise SystemExit(f"runner artifact changed after parent checkpoint: {ref}")
        else:
            if isinstance(previous, dict) and previous.get("state") == "present":
                raise SystemExit(f"checkpointed runner artifact disappeared: {ref}")
            row = {
                "ref": ref,
                "state": "missing",
                "bytes": 0,
                "sha256": digest_bytes(b""),
                "introduced_at_sequence": None,
                "semantic_class": artifact_class(ref),
                "device": None,
                "inode": None,
            }
        artifact_rows.append(row)
    artifact_inventory_digest = digest_bytes(
        b"".join(
            canonical_bytes(row)
            for row in sorted(artifact_rows, key=lambda item: item["ref"])
        )
    )
    captured_at = args.captured_at or datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    checkpoint = {
        "schema": "audit004.lineage_checkpoint.v1",
        "audit_id": AUDIT_ID,
        "checkpoint_id": f"A004-LV3-{captured_at.replace(':', '').replace('-', '')}-{uuid.uuid4().hex[:12]}",
        "sequence": args.sequence,
        "captured_at": captured_at,
        "captured_by_thread_id": MASTER_THREAD_ID,
        "parent": parent,
        "streams": rows,
        "stream_inventory_sha256": inventory_digest,
        "native_sessions": session_rows,
        "native_session_inventory_sha256": session_inventory_digest,
        "runner_artifacts": artifact_rows,
        "runner_artifact_inventory_sha256": artifact_inventory_digest,
        "pre_anchor_auxiliary_provenance_limitation": (
            "Runner auxiliary JSONLs omitted from the sealed initial anchor gain only prospective "
            "immutability at checkpoint zero; no retroactive provenance is claimed."
        ),
        "authority_status": "candidate_unpromoted_zero_credit",
    }
    output = args.output if args.output.is_absolute() else ROOT / args.output
    if not output.resolve().is_relative_to((ROOT / "coordination").resolve()):
        raise SystemExit("output must be inside audit root coordination/")
    output.parent.mkdir(parents=True, exist_ok=True)
    if output.exists():
        raise SystemExit("checkpoint output already exists; immutable artifacts are never overwritten")
    output.write_bytes(json.dumps(checkpoint, indent=2, sort_keys=True).encode("utf-8") + b"\n")
    print(json.dumps({
        "checkpoint_ref": safe_relative(output),
        "checkpoint_sha256": digest_bytes(output.read_bytes()),
        "sequence": args.sequence,
        "present_streams": sum(row["state"] == "present" for row in rows),
        "missing_streams": sum(row["state"] == "missing" for row in rows),
        "native_sessions": len(session_rows),
        "present_runner_artifacts": sum(row["state"] == "present" for row in artifact_rows),
        "missing_runner_artifacts": sum(row["state"] == "missing" for row in artifact_rows),
        "status": "candidate_unpromoted_zero_credit",
    }, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    sys.exit(main())
