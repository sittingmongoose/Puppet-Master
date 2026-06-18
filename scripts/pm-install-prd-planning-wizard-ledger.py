#!/usr/bin/env python3
"""Idempotently register the PRD Builder / Planning Wizard bootstrap ledger."""
from __future__ import annotations

import argparse
import json
import os
import sys
import tempfile
from pathlib import Path

LEDGER_ID = "pldg-20260618-001-prd-planning-wizard"
BUCKETS = ("active_ledgers", "paused_ledgers", "compiled_ledgers", "sealed_ledgers")

def load(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", default=None, help="Puppet Master repository root; defaults to script parent")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    repo = Path(args.repo).resolve() if args.repo else Path(__file__).resolve().parents[1]
    ledger_dir = repo / "Plans" / "ledgers" / "v2" / LEDGER_ID
    registry_path = repo / "Plans" / "ledgers" / "v2" / "ledger_registry.json"
    entry_path = ledger_dir / "registry_entry.json"
    manifest_path = ledger_dir / "manifest.json"

    for path in (registry_path, entry_path, manifest_path):
        if not path.is_file():
            print(f"MISSING: {path}", file=sys.stderr)
            return 2

    registry = load(registry_path)
    entry = load(entry_path)
    manifest = load(manifest_path)

    if registry.get("schema_id") != "pm.bootstrap_ledger_registry.v1":
        print("Unsupported ledger_registry schema", file=sys.stderr)
        return 2
    if entry.get("ledger_id") != LEDGER_ID or manifest.get("ledger_id") != LEDGER_ID:
        print("Ledger identity mismatch", file=sys.stderr)
        return 2
    if entry.get("status") != "active" or entry.get("phase") != "ready_for_plan_compile":
        print("Registry entry is not the expected active precompile state", file=sys.stderr)
        return 2

    removed = 0
    for bucket in BUCKETS:
        rows = list(registry.get(bucket, []))
        filtered = [row for row in rows if row.get("ledger_id") != LEDGER_ID]
        removed += len(rows) - len(filtered)
        registry[bucket] = filtered
    registry["active_ledgers"].append(entry)

    if args.dry_run:
        print(json.dumps({
            "status": "dry_run",
            "repo": str(repo),
            "ledger_id": LEDGER_ID,
            "existing_entries_replaced": removed,
            "target_bucket": "active_ledgers"
        }, indent=2))
        return 0

    registry_path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp_name = tempfile.mkstemp(prefix="ledger_registry.", suffix=".tmp", dir=registry_path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as handle:
            json.dump(registry, handle, indent=2, sort_keys=True, ensure_ascii=False)
            handle.write("\n")
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(tmp_name, registry_path)
    finally:
        if os.path.exists(tmp_name):
            os.unlink(tmp_name)

    print(json.dumps({
        "status": "installed",
        "repo": str(repo),
        "ledger_id": LEDGER_ID,
        "existing_entries_replaced": removed,
        "target_bucket": "active_ledgers",
        "registry": str(registry_path)
    }, indent=2))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
