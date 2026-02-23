#!/usr/bin/env python3

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from dataclasses import dataclass
from pathlib import Path

import jsonschema


REPO_ROOT = Path(__file__).resolve().parents[1]
PLANS_DIR = REPO_ROOT / "Plans"


@dataclass(frozen=True)
class Finding:
    kind: str
    location: str
    message: str


def _read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _load_json(path: Path) -> object:
    return json.loads(_read_text(path))


def _sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def _validator(schema: object) -> jsonschema.Draft202012Validator:
    return jsonschema.Draft202012Validator(schema)  # type: ignore[arg-type]


def _canonical_paths_from_spec_lock() -> list[Path]:
    spec_lock_path = PLANS_DIR / "Spec_Lock.json"
    spec_lock = _load_json(spec_lock_path)

    files = (
        spec_lock.get("canonical_ssot_hashes", {})
        .get("files", [])
    )

    out: list[Path] = []
    for entry in files:
        if not isinstance(entry, dict):
            continue
        p = entry.get("path")
        if not isinstance(p, str) or not p:
            continue
        out.append(REPO_ROOT / p)

    # Always include the lockfile itself and the self-build plan graph.
    out.append(spec_lock_path)
    out.append(PLANS_DIR / "plan_graph.json")
    out.append(PLANS_DIR / "plan_graph.schema.json")
    out.append(PLANS_DIR / "evidence.schema.json")
    out.append(PLANS_DIR / "change_budget.schema.json")
    out.append(PLANS_DIR / "auto_decisions.schema.json")
    out.append(PLANS_DIR / "auto_decisions.jsonl")

    # De-dup while preserving order.
    seen: set[Path] = set()
    ordered: list[Path] = []
    for p in out:
        rp = p.resolve()
        if rp in seen:
            continue
        seen.add(rp)
        ordered.append(p)
    return ordered


def validate_plan_graph() -> list[Finding]:
    findings: list[Finding] = []

    schema_path = PLANS_DIR / "plan_graph.schema.json"
    graph_path = PLANS_DIR / "plan_graph.json"
    change_budget_schema_path = PLANS_DIR / "change_budget.schema.json"

    schema = _load_json(schema_path)
    graph = _load_json(graph_path)
    change_budget_schema = _load_json(change_budget_schema_path)

    v = _validator(schema)
    for err in v.iter_errors(graph):
        findings.append(
            Finding(
                kind="schema",
                location=f"{graph_path.relative_to(REPO_ROOT)}",
                message=f"plan_graph schema error at {list(err.absolute_path)}: {err.message}",
            )
        )

    # Validate each node's change_budget against its schema.
    try:
        nodes = graph.get("nodes", []) if isinstance(graph, dict) else []
    except Exception:
        nodes = []

    cbv = _validator(change_budget_schema)
    for idx, node in enumerate(nodes):
        if not isinstance(node, dict):
            continue
        node_id = node.get("node_id", f"nodes[{idx}]")
        cb = node.get("change_budget")
        if cb is None:
            findings.append(
                Finding(
                    kind="schema",
                    location=f"{graph_path.relative_to(REPO_ROOT)}:{node_id}",
                    message="missing change_budget",
                )
            )
            continue

        for err in cbv.iter_errors(cb):
            findings.append(
                Finding(
                    kind="schema",
                    location=f"{graph_path.relative_to(REPO_ROOT)}:{node_id}",
                    message=f"change_budget schema error at {list(err.absolute_path)}: {err.message}",
                )
            )

    return findings


def validate_auto_decisions() -> list[Finding]:
    findings: list[Finding] = []
    schema_path = PLANS_DIR / "auto_decisions.schema.json"
    jsonl_path = PLANS_DIR / "auto_decisions.jsonl"

    schema = _load_json(schema_path)
    v = _validator(schema)

    for i, raw in enumerate(_read_text(jsonl_path).splitlines(), start=1):
        line = raw.strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
        except Exception as e:
            findings.append(
                Finding(
                    kind="schema",
                    location=f"{jsonl_path.relative_to(REPO_ROOT)}:{i}",
                    message=f"invalid JSON: {e}",
                )
            )
            continue

        for err in v.iter_errors(obj):
            findings.append(
                Finding(
                    kind="schema",
                    location=f"{jsonl_path.relative_to(REPO_ROOT)}:{i}",
                    message=f"auto_decision schema error at {list(err.absolute_path)}: {err.message}",
                )
            )

    return findings


def validate_evidence_bundle(evidence_path: Path) -> list[Finding]:
    findings: list[Finding] = []
    schema_path = PLANS_DIR / "evidence.schema.json"
    schema = _load_json(schema_path)
    v = _validator(schema)

    path = evidence_path
    if not path.is_absolute():
        path = REPO_ROOT / path
    if not path.exists():
        return [
            Finding(
                kind="schema",
                location=str(path.relative_to(REPO_ROOT)),
                message="evidence bundle not found",
            )
        ]

    try:
        evidence = _load_json(path)
    except Exception as e:
        return [
            Finding(
                kind="schema",
                location=str(path.relative_to(REPO_ROOT)),
                message=f"invalid JSON: {e}",
            )
        ]

    for err in v.iter_errors(evidence):
        findings.append(
            Finding(
                kind="schema",
                location=f"{path.relative_to(REPO_ROOT)}",
                message=f"evidence schema error at {list(err.absolute_path)}: {err.message}",
            )
        )
    return findings


def verify_spec_lock_hashes() -> list[Finding]:
    findings: list[Finding] = []
    spec_lock_path = PLANS_DIR / "Spec_Lock.json"
    spec_lock = _load_json(spec_lock_path)

    files = (
        spec_lock.get("canonical_ssot_hashes", {})
        .get("files", [])
    )
    if not isinstance(files, list):
        return [
            Finding(
                kind="spec_lock",
                location=str(spec_lock_path.relative_to(REPO_ROOT)),
                message="canonical_ssot_hashes.files must be an array",
            )
        ]

    for entry in files:
        if not isinstance(entry, dict):
            continue
        rel = entry.get("path")
        expected = entry.get("sha256")
        if not isinstance(rel, str) or not rel:
            continue
        if not isinstance(expected, str) or not expected:
            continue

        path = REPO_ROOT / rel
        if not path.exists():
            findings.append(
                Finding(
                    kind="spec_lock",
                    location=str(spec_lock_path.relative_to(REPO_ROOT)),
                    message=f"missing SSOT file: {rel}",
                )
            )
            continue

        actual = _sha256_file(path)
        if actual != expected:
            findings.append(
                Finding(
                    kind="spec_lock",
                    location=str(spec_lock_path.relative_to(REPO_ROOT)),
                    message=f"sha256 mismatch: {rel} expected={expected} actual={actual}",
                )
            )

    return findings


def lint_banned_phrases() -> list[Finding]:
    findings: list[Finding] = []

    for path in _canonical_paths_from_spec_lock():
        if path.suffix.lower() != ".md":
            continue
        if not path.exists():
            continue

        lines = _read_text(path).splitlines()
        in_fence = False
        for i, line in enumerate(lines, start=1):
            stripped = line.strip()
            if stripped.startswith("```") or stripped.startswith("~~~"):
                in_fence = not in_fence
                continue
            if in_fence:
                continue

            lower = line.lower()

            # Forbid headings like "## Open Questions".
            if stripped.startswith("#") and "open question" in lower:
                findings.append(
                    Finding(
                        kind="banned_phrase",
                        location=f"{path.relative_to(REPO_ROOT)}:{i}",
                        message="forbidden heading contains 'Open Questions'",
                    )
                )

            # Forbid placeholder TBD unless it's being referenced as a literal token (backticks).
            if "TBD" in line and "`TBD`" not in line:
                findings.append(
                    Finding(
                        kind="banned_phrase",
                        location=f"{path.relative_to(REPO_ROOT)}:{i}",
                        message="contains placeholder token TBD",
                    )
                )

            # Forbid "ask later" phrasing unless it's a literal token.
            if "ask later" in lower and "`ask later`" not in lower:
                findings.append(
                    Finding(
                        kind="banned_phrase",
                        location=f"{path.relative_to(REPO_ROOT)}:{i}",
                        message="contains drift phrase 'ask later'",
                    )
                )

    return findings


def lint_contractrefs() -> list[Finding]:
    findings: list[Finding] = []

    operational_markers = ("MUST NOT", "MUST", "SHALL", "REQUIRED", "NEVER")
    required_ref_prefixes = ("EventType:", "ToolID:", "PolicyRule:", "ConfigKey:", "UICommand:", "ContractName:")

    for path in _canonical_paths_from_spec_lock():
        if path.suffix.lower() != ".md":
            continue
        if not path.exists():
            continue

        lines = _read_text(path).splitlines()
        in_fence = False
        i = 0
        while i < len(lines):
            line = lines[i]
            stripped = line.strip()

            if stripped.startswith("```") or stripped.startswith("~~~"):
                in_fence = not in_fence
                i += 1
                continue
            if in_fence:
                i += 1
                continue

            is_operational = any(marker in line for marker in operational_markers)
            if not is_operational or "ContractRef:" in line:
                i += 1
                continue

            # Scan forward within a bounded lookahead window.
            lookahead_max = 10
            j = i + 1
            contractref_lines: list[str] = []
            while j < len(lines) and j <= i + lookahead_max:
                nxt = lines[j]
                nxts = nxt.strip()
                if nxts.startswith("```") or nxts.startswith("~~~"):
                    break
                if nxts.startswith("#"):
                    break
                if nxts.startswith("ContractRef:"):
                    contractref_lines.append(nxts)
                j += 1

            if not contractref_lines:
                findings.append(
                    Finding(
                        kind="contractref",
                        location=f"{path.relative_to(REPO_ROOT)}:{i+1}",
                        message="operational requirement missing ContractRef block",
                    )
                )
                i += 1
                continue

            # Ensure at least one ContractRef contains an executable category.
            joined = " ".join(contractref_lines)
            if not any(prefix in joined for prefix in required_ref_prefixes):
                findings.append(
                    Finding(
                        kind="contractref",
                        location=f"{path.relative_to(REPO_ROOT)}:{i+1}",
                        message="ContractRef present but missing executable ref category (EventType/ToolID/PolicyRule/ConfigKey/UICommand/ContractName)",
                    )
                )

            i += 1

    return findings


def _print_findings(findings: list[Finding]) -> None:
    for f in findings:
        print(f"[{f.kind}] {f.location}: {f.message}")


def main() -> int:
    parser = argparse.ArgumentParser(prog="pm-plans-verify")
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("validate-plan-graph", help="Validate Plans/plan_graph.json against schema")
    sub.add_parser("validate-auto-decisions", help="Validate Plans/auto_decisions.jsonl against schema")
    p_evidence = sub.add_parser("validate-evidence", help="Validate an evidence bundle JSON against schema")
    p_evidence.add_argument("path", help="Path to evidence.json")
    sub.add_parser("verify-spec-lock", help="Verify Spec Lock canonical SSOT sha256 list")
    sub.add_parser("lint-banned-phrases", help="Fail on banned drift phrases in canonical SSOT docs")
    sub.add_parser("lint-contractrefs", help="Fail on operational requirements missing ContractRef blocks")
    sub.add_parser("run-gates", help="Run all gates that are currently script-enforceable")

    args = parser.parse_args()

    if args.cmd == "validate-plan-graph":
        findings = validate_plan_graph()
    elif args.cmd == "validate-auto-decisions":
        findings = validate_auto_decisions()
    elif args.cmd == "validate-evidence":
        findings = validate_evidence_bundle(Path(args.path))
    elif args.cmd == "verify-spec-lock":
        findings = verify_spec_lock_hashes()
    elif args.cmd == "lint-banned-phrases":
        findings = lint_banned_phrases()
    elif args.cmd == "lint-contractrefs":
        findings = lint_contractrefs()
    elif args.cmd == "run-gates":
        findings = []
        findings.extend(validate_plan_graph())
        findings.extend(validate_auto_decisions())
        findings.extend(verify_spec_lock_hashes())
        findings.extend(lint_banned_phrases())
        findings.extend(lint_contractrefs())
    else:
        parser.error("unknown command")
        return 2

    if findings:
        _print_findings(findings)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
