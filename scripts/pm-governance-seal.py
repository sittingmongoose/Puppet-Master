#!/usr/bin/env python3
"""Mechanical governance refresh helpers for sealed plan cycles."""

from __future__ import annotations

import argparse
import hashlib
import json
from datetime import datetime, timezone
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


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data: Any) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    if not path.exists():
        return rows
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.strip():
            rows.append(json.loads(line))
    return rows


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    with path.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True))
            handle.write("\n")


def append_unique_string(values: list[Any], value: str) -> bool:
    if value in values:
        return False
    values.append(value)
    return True


def append_unique_ref(values: list[dict[str, Any]], ref: str, *, kind: str = "file", note: str | None = None) -> bool:
    for row in values:
        if row.get("kind") == kind and row.get("ref") == ref:
            return False
    entry: dict[str, Any] = {"kind": kind, "ref": ref}
    if note:
        entry["note"] = note
    values.append(entry)
    return True


def register_sharding_sources(path: Path, docs: list[str]) -> dict[str, Any]:
    data = load_json(path)
    sources = data.setdefault("sources", [])
    added = [doc for doc in docs if append_unique_string(sources, doc)]
    if added:
        write_json(path, data)
    return {"path": str(path.relative_to(ROOT)), "changed": bool(added), "added_sources": added}


def register_spec_lock_files(path: Path, docs: list[str]) -> dict[str, Any]:
    data = load_json(path)
    files = data.setdefault("canonical_ssot_hashes", {}).setdefault("files", [])
    by_path = {entry.get("path"): entry for entry in files if entry.get("path")}
    added: list[str] = []
    updated: list[str] = []
    for doc in docs:
        target = repo_path(doc)
        digest = sha256_file(target)
        entry = by_path.get(doc)
        if entry is None:
            files.append({"path": doc, "sha256": digest})
            by_path[doc] = files[-1]
            added.append(doc)
        elif entry.get("sha256") != digest:
            entry["sha256"] = digest
            updated.append(doc)
    if added or updated:
        write_json(path, data)
    return {
        "path": str(path.relative_to(ROOT)),
        "changed": bool(added or updated),
        "added_files": added,
        "updated_hashes": updated,
    }


def register_plan_graph_refs(path: Path, docs: list[str], node_id: str, decision_id: str | None) -> dict[str, Any]:
    data = load_json(path)
    target_node: dict[str, Any] | None = None
    for node in data.get("nodes", []):
        if node.get("node_id") == node_id:
            target_node = node
            break
    if target_node is None:
        raise SystemExit(f"plan graph node not found: {node_id}")

    changed = False
    added_inputs: list[str] = []
    added_outputs: list[str] = []
    added_contract_refs: list[str] = []
    inputs = target_node.setdefault("inputs", [])
    outputs = target_node.setdefault("outputs", [])
    contract_refs = target_node.setdefault("contract_refs", [])
    for doc in docs:
        if append_unique_ref(inputs, doc, note="Registered canonical owner doc coverage."):
            added_inputs.append(doc)
            changed = True
        if append_unique_ref(outputs, doc, note="Registered canonical owner doc coverage."):
            added_outputs.append(doc)
            changed = True
        contract_ref = f"ContractName:{doc}"
        if append_unique_string(contract_refs, contract_ref):
            added_contract_refs.append(contract_ref)
            changed = True
    if decision_id:
        decision_refs = target_node.setdefault("decision_refs", [])
        changed = append_unique_string(decision_refs, decision_id) or changed
    if changed:
        write_json(path, data)
    return {
        "path": str(path.relative_to(ROOT)),
        "changed": changed,
        "node_id": node_id,
        "added_inputs": added_inputs,
        "added_outputs": added_outputs,
        "added_contract_refs": added_contract_refs,
        "decision_id": decision_id,
    }


def upsert_auto_decision(
    path: Path,
    *,
    decision_id: str,
    scope: str,
    decision: str,
    rationale: str,
    applied_to: list[str],
    contract_refs: list[str],
) -> dict[str, Any]:
    rows = read_jsonl(path)
    hash_payload = {
        "decision_id": decision_id,
        "scope": scope,
        "decision": decision,
        "rationale": rationale,
        "applied_to": applied_to,
        "contract_refs": contract_refs,
        "artifact_hashes": {
            item: sha256_file(repo_path(item))
            for item in applied_to
            if "*" not in item and repo_path(item).exists() and repo_path(item).is_file()
        },
    }
    inputs_hash = hashlib.sha256(
        json.dumps(hash_payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    ).hexdigest()
    row = {
        "schema_id": "pm.auto_decisions.schema.v1",
        "decision_id": decision_id,
        "timestamp_utc": utc_now(),
        "scope": scope,
        "inputs_hash": inputs_hash,
        "decision": decision,
        "rationale": rationale,
        "applied_to": applied_to,
        "contract_refs": contract_refs,
    }
    changed = False
    matching_indexes = [index for index, existing in enumerate(rows) if existing.get("decision_id") == decision_id]
    if len(matching_indexes) > 1:
        raise SystemExit(
            "auto_decisions upsert is ambiguous for duplicate decision_id "
            f"{decision_id!r}; choose a new unique future decision_id instead of mutating grandfathered history"
        )
    if matching_indexes:
        index = matching_indexes[0]
        existing = rows[index]
        identity_fields = ("scope", "decision")
        mismatches = [field for field in identity_fields if existing.get(field) != row.get(field)]
        if mismatches:
            raise SystemExit(
                "auto_decisions upsert would change stable identity fields for "
                f"{decision_id!r}: {', '.join(mismatches)}; choose a new unique decision_id"
            )
        row["timestamp_utc"] = existing.get("timestamp_utc", row["timestamp_utc"])
        if existing != row:
            rows[index] = row
            changed = True
    else:
        rows.append(row)
        changed = True
    if changed:
        write_jsonl(path, rows)
    return {"path": str(path.relative_to(ROOT)), "changed": changed, "decision_id": decision_id}


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
    changed_node_fields: list[str] = []
    node = data.setdefault("node", {})
    for field, value in [
        ("node_id", args.evidence_node_id),
        ("graph_id", args.evidence_graph_id),
        ("graph_scope", args.evidence_graph_scope),
    ]:
        if value is not None and node.get(field) != value:
            node[field] = value
            changed_node_fields.append(field)

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

    changed = bool(changed_artifacts or changed_node_fields)
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
        "updated_node_fields": changed_node_fields,
        "updated_artifact_hashes": changed_artifacts,
    }


def sync_plan_sharding_evidence(evidence_path: Path, report_path: Path) -> dict[str, Any]:
    data = load_json(evidence_path)
    report = load_json(report_path)
    existing_by_path = {
        artifact.get("path"): artifact
        for artifact in data.get("artifacts", [])
        if artifact.get("path")
    }

    def artifact_for(path: str, *, note: str | None = None) -> dict[str, Any]:
        target = repo_path(path)
        artifact = {k: v for k, v in existing_by_path.get(path, {}).items() if k not in {"sha256", "path"}}
        artifact["path"] = path
        if note is not None:
            artifact["note"] = note
        if target.exists() and target.is_file():
            artifact["sha256"] = sha256_file(target)
        return artifact

    artifacts: list[dict[str, Any]] = [
        artifact_for(str(report.get("config_path", "Plans/sharding_config.json"))),
        artifact_for(str(report_path.relative_to(ROOT))),
    ]
    for doc in report.get("docs", []):
        source_path = doc.get("source", {}).get("path")
        if source_path:
            artifacts.append(artifact_for(str(source_path), note="Configured shard source."))
        index_path = doc.get("index_path")
        if index_path:
            artifacts.append(artifact_for(str(index_path)))
        manifest_path = doc.get("manifest_path")
        if manifest_path:
            artifacts.append(artifact_for(str(manifest_path)))
        for shard in doc.get("shards", []):
            shard_path = shard.get("path")
            if shard_path:
                artifacts.append(artifact_for(str(shard_path)))

    old_paths = [artifact.get("path") for artifact in data.get("artifacts", [])]
    new_paths = [artifact.get("path") for artifact in artifacts]
    changed = old_paths != new_paths or data.get("artifacts") != artifacts
    if changed:
        data["artifacts"] = artifacts
        write_json(evidence_path, data)
    return {
        "path": str(evidence_path.relative_to(ROOT)),
        "changed": changed,
        "artifact_count": len(artifacts),
        "removed_paths": sorted(set(old_paths) - set(new_paths)),
        "added_paths": sorted(set(new_paths) - set(old_paths)),
    }


def cmd_refresh(args: argparse.Namespace) -> int:
    report: dict[str, Any] = {"spec_lock": None, "evidence": []}
    if args.spec_lock:
        report["spec_lock"] = refresh_spec_lock(repo_path(args.spec_lock))
    for evidence_path in args.evidence:
        report["evidence"].append(refresh_evidence(repo_path(evidence_path), args))
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 0


def cmd_sync_plan_sharding_evidence(args: argparse.Namespace) -> int:
    report = sync_plan_sharding_evidence(repo_path(args.evidence), repo_path(args.report))
    print(json.dumps(report, indent=2, ensure_ascii=False))
    return 0


def cmd_register_canonical_docs(args: argparse.Namespace) -> int:
    docs = [str(Path(doc).as_posix()) for doc in args.doc]
    for doc in docs:
        target = repo_path(doc)
        if not target.exists() or not target.is_file():
            raise SystemExit(f"canonical doc does not exist: {doc}")

    decision_id = args.decision_id
    report: dict[str, Any] = {
        "schema_id": "pm.governance_seal.register_canonical_docs.v1",
        "docs": docs,
        "sharding_config": register_sharding_sources(repo_path(args.sharding_config), docs),
        "spec_lock": register_spec_lock_files(repo_path(args.spec_lock), docs),
        "plan_graph": register_plan_graph_refs(repo_path(args.plan_graph), docs, args.plan_graph_node_id, decision_id),
        "auto_decision": None,
    }
    if args.auto_decisions and decision_id:
        applied_to = docs + [
            args.sharding_config,
            args.spec_lock,
            args.plan_graph,
            "Plans/_shards/**",
            "Plans/.evidence/plan-sharding-2026-06-09/evidence.json",
            "Plans/.evidence/plan-sharding-2026-06-09/reports/shard_report.json",
        ]
        contract_refs = [
            "PolicyRule:Decision_Policy.md#spec-lock-update-protocol",
            "SchemaID:Spec_Lock.json#canonical_ssot_hashes",
            "SchemaID:pm.auto_decisions.schema.v1",
            "SchemaID:pm.evidence.schema.v1",
            "ContractName:Plans/PRD_Builder.md",
            "ContractName:Plans/Planning_Wizard.md",
            "ContractName:Plans/Planning_Ledger_System.md",
            "ContractName:Plans/Plan_Document_System.md",
            "Gate:GATE-001",
            "Gate:GATE-002",
            "Gate:GATE-005",
            "Gate:GATE-006",
            "Gate:GATE-009",
        ]
        report["auto_decision"] = upsert_auto_decision(
            repo_path(args.auto_decisions),
            decision_id=decision_id,
            scope=args.scope,
            decision=args.decision,
            rationale=args.rationale,
            applied_to=applied_to,
            contract_refs=contract_refs,
        )
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
    refresh.add_argument("--evidence-node-id", default=None, help="Route evidence to an existing Plans/plan_graph.json node_id.")
    refresh.add_argument("--evidence-graph-id", default=None, help="Set evidence node.graph_id.")
    refresh.add_argument("--evidence-graph-scope", default=None, help="Set evidence node.graph_scope.")
    refresh.set_defaults(func=cmd_refresh)
    sync = sub.add_parser(
        "sync-plan-sharding-evidence",
        help="Rebuild plan-sharding evidence artifact rows from a generated shard report.",
    )
    sync.add_argument("--evidence", required=True, help="Plan sharding evidence.json path to update.")
    sync.add_argument("--report", required=True, help="Generated shard_report.json path to read.")
    sync.set_defaults(func=cmd_sync_plan_sharding_evidence)
    register = sub.add_parser(
        "register-canonical-docs",
        help="Register explicit canonical docs in sharding config, Spec Lock, plan graph, and optional auto decisions.",
    )
    register.add_argument("--doc", action="append", required=True, help="Canonical doc path to register.")
    register.add_argument("--sharding-config", default="Plans/sharding_config.json")
    register.add_argument("--spec-lock", default="Plans/Spec_Lock.json")
    register.add_argument("--plan-graph", default="Plans/plan_graph.json")
    register.add_argument("--plan-graph-node-id", default="pm.build-governance.spec-lock-support-refresh")
    register.add_argument("--auto-decisions", default=None)
    register.add_argument("--decision-id", default=None)
    register.add_argument(
        "--scope",
        default="plans.prd_planning_wizard_governance_coverage_repair",
        help="Auto-decision scope when --auto-decisions and --decision-id are provided.",
    )
    register.add_argument(
        "--decision",
        default="register_prd_builder_and_planning_wizard_owner_docs_in_governance_coverage",
        help="Auto-decision decision value.",
    )
    register.add_argument(
        "--rationale",
        default=(
            "Bounded audit repair registers the PRD Builder and Planning Wizard canonical owner docs in "
            "script-managed governance coverage after the owner docs stabilized; this does not create "
            "WorkNodes, NodeSeeds, executable queues, runtime dispatch, implementation files, or production build tasks."
        ),
        help="Auto-decision rationale.",
    )
    register.set_defaults(func=cmd_register_canonical_docs)
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
