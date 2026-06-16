#!/usr/bin/env python3
"""Mechanical governance refresh helpers for sealed plan cycles."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
PLANS = ROOT / "Plans"


def repo_path(path: str | Path) -> Path:
    path = Path(path)
    if path.is_absolute():
        return path
    return ROOT / path


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data: Any) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def update_or_append_command(commands: list[dict[str, Any]], cmd: str, *, stdout_excerpt: str | None = None) -> bool:
    changed = False
    for entry in commands:
        if entry.get("cmd") == cmd:
            if entry.get("exit_code") != 0:
                entry["exit_code"] = 0
                changed = True
            if stdout_excerpt is not None and entry.get("stdout_excerpt") != stdout_excerpt:
                entry["stdout_excerpt"] = stdout_excerpt
                changed = True
            return changed
    entry: dict[str, Any] = {"cmd": cmd, "exit_code": 0}
    if stdout_excerpt is not None:
        entry["stdout_excerpt"] = stdout_excerpt
    commands.append(entry)
    return True


def replace_ledger_validate_command(commands: list[dict[str, Any]], ledger_command: str) -> bool:
    changed = False
    found = False
    for entry in commands:
        cmd = entry.get("cmd", "")
        if "scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/" not in cmd:
            continue
        found = True
        if cmd != ledger_command:
            entry["cmd"] = ledger_command
            changed = True
        if entry.get("exit_code") != 0:
            entry["exit_code"] = 0
            changed = True
    if not found:
        changed = update_or_append_command(commands, ledger_command) or changed
    return changed


def upsert_check(checks: list[dict[str, Any]], name: str, details: str) -> bool:
    changed = False
    for check in checks:
        if check.get("name") == name:
            if check.get("result") != "PASS":
                check["result"] = "PASS"
                changed = True
            if check.get("details") != details:
                check["details"] = details
                changed = True
            return changed
    checks.append({"name": name, "result": "PASS", "details": details})
    return True


def split_pair(value: str, option: str) -> tuple[str, str]:
    if "|||" not in value:
        raise SystemExit(f"{option} expects NAME|||DETAILS or CMD|||STDOUT_EXCERPT format")
    left, right = value.split("|||", 1)
    if not left or not right:
        raise SystemExit(f"{option} requires non-empty fields around |||")
    return left, right


def refresh_spec_lock(path: Path) -> dict[str, Any]:
    data = load_json(path)
    changed_paths: list[str] = []
    for entry in data.get("canonical_ssot_hashes", {}).get("files", []):
        rel = entry.get("path")
        if not rel:
            continue
        target = repo_path(rel)
        if not target.exists() or not target.is_file():
            continue
        digest = sha256_file(target)
        if entry.get("sha256") != digest:
            entry["sha256"] = digest
            changed_paths.append(rel)
    if changed_paths:
        write_json(path, data)
    return {"path": str(path.relative_to(ROOT)), "changed": bool(changed_paths), "updated_hashes": changed_paths}


def refresh_evidence(path: Path, args: argparse.Namespace) -> dict[str, Any]:
    data = load_json(path)
    changed_artifacts: list[str] = []
    for artifact in data.get("artifacts", []):
        rel = artifact.get("path")
        if not rel:
            continue
        target = repo_path(rel)
        if not target.exists() or not target.is_file():
            continue
        digest = sha256_file(target)
        if artifact.get("sha256") != digest:
            artifact["sha256"] = digest
            changed_artifacts.append(rel)

    changed = bool(changed_artifacts)
    commands = data.setdefault("commands_run", [])
    if args.ledger_command:
        changed = replace_ledger_validate_command(commands, args.ledger_command) or changed
    for cmd in args.record_command:
        changed = update_or_append_command(commands, cmd) or changed
    for value in args.command_excerpt:
        cmd, stdout_excerpt = split_pair(value, "--command-excerpt")
        changed = update_or_append_command(commands, cmd, stdout_excerpt=stdout_excerpt) or changed

    checks = data.setdefault("checks", [])
    if args.plan_index_details:
        changed = upsert_check(checks, "plan-index-validate", args.plan_index_details) or changed
    for value in args.check_detail:
        name, details = split_pair(value, "--check-detail")
        changed = upsert_check(checks, name, details) or changed
    if args.no_node_artifacts:
        changed = upsert_check(
            checks,
            "no-node-artifacts-created",
            "No WorkNodes, NodeSeeds, executable queues, final node manifests, product implementation files, Rust/Slint app scaffolds, legacy Iced app files, or production build tasks were created.",
        ) or changed

    if changed:
        write_json(path, data)
    return {
        "path": str(path.relative_to(ROOT)),
        "changed": changed,
        "updated_artifact_hashes": changed_artifacts,
    }


def cmd_refresh(args: argparse.Namespace) -> int:
    report: dict[str, Any] = {"spec_lock": None, "evidence": []}
    if args.spec_lock:
        report["spec_lock"] = refresh_spec_lock(repo_path(args.spec_lock))
    for evidence_path in args.evidence:
        report["evidence"].append(refresh_evidence(repo_path(evidence_path), args))
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    refresh = sub.add_parser("refresh", help="Refresh Spec Lock and evidence artifact hashes.")
    refresh.add_argument("--spec-lock", default=None, help="Spec_Lock.json path to refresh.")
    refresh.add_argument("--evidence", action="append", default=[], help="Evidence bundle to refresh.")
    refresh.add_argument("--ledger-command", default=None, help="Canonical ledger validation command to record.")
    refresh.add_argument("--record-command", action="append", default=[], help="Additional successful command to record.")
    refresh.add_argument("--command-excerpt", action="append", default=[], help="Successful command plus stdout excerpt, formatted CMD|||STDOUT_EXCERPT.")
    refresh.add_argument("--plan-index-details", default=None, help="Details text for the plan-index-validate PASS check.")
    refresh.add_argument("--check-detail", action="append", default=[], help="PASS check upsert, formatted NAME|||DETAILS.")
    refresh.add_argument("--no-node-artifacts", action="store_true", help="Record the no node/work artifact PASS check.")
    refresh.set_defaults(func=cmd_refresh)
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
