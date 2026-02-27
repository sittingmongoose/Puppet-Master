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


def _load_plan_graph_nodes() -> tuple[Path, list[object]]:
    graph_path = PLANS_DIR / "plan_graph.json"
    graph = _load_json(graph_path)
    if not isinstance(graph, dict):
        return graph_path, []
    nodes = graph.get("nodes", [])
    if not isinstance(nodes, list):
        return graph_path, []
    return graph_path, nodes


def validate_non_example_node_artifacts() -> list[Finding]:
    findings: list[Finding] = []
    graph_path, nodes = _load_plan_graph_nodes()
    change_budget_schema_path = PLANS_DIR / "change_budget.schema.json"
    change_budget_schema = _load_json(change_budget_schema_path)
    cbv = _validator(change_budget_schema)

    for idx, node in enumerate(nodes):
        if not isinstance(node, dict):
            continue
        node_id = str(node.get("node_id", f"nodes[{idx}]"))
        is_example = bool(node.get("example", False)) or node_id.startswith("EXAMPLE.")
        if is_example:
            continue

        # GATE-006: enforce non-example change-budget declaration quality.
        change_budget = node.get("change_budget")
        if not isinstance(change_budget, dict):
            findings.append(
                Finding(
                    kind="change_budget",
                    location=f"{graph_path.relative_to(REPO_ROOT)}:{node_id}",
                    message="non-example node missing change_budget object",
                )
            )
        else:
            for err in cbv.iter_errors(change_budget):
                findings.append(
                    Finding(
                        kind="change_budget",
                        location=f"{graph_path.relative_to(REPO_ROOT)}:{node_id}",
                        message=f"change_budget schema error at {list(err.absolute_path)}: {err.message}",
                    )
                )

            allowed_paths = change_budget.get("allowed_paths")
            if not isinstance(allowed_paths, list) or len(allowed_paths) == 0:
                findings.append(
                    Finding(
                        kind="change_budget",
                        location=f"{graph_path.relative_to(REPO_ROOT)}:{node_id}",
                        message="change_budget.allowed_paths must contain at least one path",
                    )
                )

            if "max_total_loc_delta" not in change_budget:
                findings.append(
                    Finding(
                        kind="change_budget",
                        location=f"{graph_path.relative_to(REPO_ROOT)}:{node_id}",
                        message="change_budget.max_total_loc_delta is required for non-example nodes",
                    )
                )

        # GATE-005: enforce non-example evidence bundle existence + schema validity.
        evidence_required = node.get("evidence_required")
        if not isinstance(evidence_required, dict):
            findings.append(
                Finding(
                    kind="evidence",
                    location=f"{graph_path.relative_to(REPO_ROOT)}:{node_id}",
                    message="non-example node missing evidence_required object",
                )
            )
            continue

        evidence_path = evidence_required.get("path")
        if not isinstance(evidence_path, str) or not evidence_path.strip():
            findings.append(
                Finding(
                    kind="evidence",
                    location=f"{graph_path.relative_to(REPO_ROOT)}:{node_id}",
                    message="non-example node evidence_required.path is missing",
                )
            )
            continue

        evidence_findings = validate_evidence_bundle(Path(evidence_path))
        if evidence_findings:
            for ef in evidence_findings:
                findings.append(
                    Finding(
                        kind="evidence",
                        location=f"{graph_path.relative_to(REPO_ROOT)}:{node_id}",
                        message=f"evidence validation failed: {ef.location} {ef.message}",
                    )
                )
            continue

        resolved_evidence_path = Path(evidence_path)
        if not resolved_evidence_path.is_absolute():
            resolved_evidence_path = REPO_ROOT / resolved_evidence_path

        try:
            evidence_obj = _load_json(resolved_evidence_path)
        except Exception as e:
            findings.append(
                Finding(
                    kind="evidence",
                    location=f"{graph_path.relative_to(REPO_ROOT)}:{node_id}",
                    message=f"failed to load evidence after schema pass: {e}",
                )
            )
            continue

        if not isinstance(evidence_obj, dict):
            findings.append(
                Finding(
                    kind="evidence",
                    location=f"{graph_path.relative_to(REPO_ROOT)}:{node_id}",
                    message="evidence bundle is not a JSON object",
                )
            )
            continue

        node_obj = evidence_obj.get("node")
        if not isinstance(node_obj, dict):
            findings.append(
                Finding(
                    kind="evidence",
                    location=f"{graph_path.relative_to(REPO_ROOT)}:{node_id}",
                    message="evidence.node object is missing",
                )
            )
        else:
            evidence_node_id = node_obj.get("node_id")
            if evidence_node_id != node_id:
                findings.append(
                    Finding(
                        kind="evidence",
                        location=f"{graph_path.relative_to(REPO_ROOT)}:{node_id}",
                        message=f"evidence.node.node_id mismatch (expected {node_id}, got {evidence_node_id})",
                    )
                )

        checks = evidence_obj.get("checks")
        if not isinstance(checks, list) or len(checks) == 0:
            findings.append(
                Finding(
                    kind="evidence",
                    location=f"{graph_path.relative_to(REPO_ROOT)}:{node_id}",
                    message="evidence.checks must contain at least one check entry",
                )
            )
        else:
            has_pass = any(isinstance(check, dict) and check.get("result") == "PASS" for check in checks)
            if not has_pass:
                findings.append(
                    Finding(
                        kind="evidence",
                        location=f"{graph_path.relative_to(REPO_ROOT)}:{node_id}",
                        message="evidence.checks must include at least one PASS result",
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


def validate_plan_shards_freshness() -> list[Finding]:
    findings: list[Finding] = []
    config_path = PLANS_DIR / "sharding_config.json"
    if not config_path.exists():
        return findings

    try:
        config = _load_json(config_path)
    except Exception as e:
        return [
            Finding(
                kind="plan_shards",
                location=str(config_path.relative_to(REPO_ROOT)),
                message=f"failed to load sharding config: {e}",
            )
        ]

    if not isinstance(config, dict):
        return [
            Finding(
                kind="plan_shards",
                location=str(config_path.relative_to(REPO_ROOT)),
                message="sharding config must be a JSON object",
            )
        ]

    output_root_raw = config.get("output_root")
    sources = config.get("sources")
    if not isinstance(output_root_raw, str) or not output_root_raw.strip():
        return [
            Finding(
                kind="plan_shards",
                location=str(config_path.relative_to(REPO_ROOT)),
                message="sharding config missing output_root",
            )
        ]
    if not isinstance(sources, list):
        return [
            Finding(
                kind="plan_shards",
                location=str(config_path.relative_to(REPO_ROOT)),
                message="sharding config missing sources array",
            )
        ]

    output_root = Path(output_root_raw)
    if not output_root.is_absolute():
        output_root = REPO_ROOT / output_root

    shards_exist = False
    for source_rel in sources:
        if not isinstance(source_rel, str) or not source_rel.strip():
            continue

        source_path = REPO_ROOT / source_rel
        stem = Path(source_rel).stem
        shard_dir = output_root / stem
        canonical_index_path = shard_dir / "00-index.md"
        legacy_index_path = shard_dir / "_index.md"
        manifest_path = shard_dir / "manifest.json"

        if shard_dir.exists():
            shards_exist = True
        else:
            continue

        if not manifest_path.exists():
            findings.append(
                Finding(
                    kind="plan_shards",
                    location=str(manifest_path.relative_to(REPO_ROOT)),
                    message="missing manifest for existing shard directory",
                )
            )
            continue

        try:
            manifest = _load_json(manifest_path)
        except Exception as e:
            findings.append(
                Finding(
                    kind="plan_shards",
                    location=str(manifest_path.relative_to(REPO_ROOT)),
                    message=f"failed to parse manifest: {e}",
                )
            )
            continue

        if not isinstance(manifest, dict):
            findings.append(
                Finding(
                    kind="plan_shards",
                    location=str(manifest_path.relative_to(REPO_ROOT)),
                    message="manifest is not a JSON object",
                )
            )
            continue

        if not source_path.exists():
            findings.append(
                Finding(
                    kind="plan_shards",
                    location=str(source_path.relative_to(REPO_ROOT)),
                    message="source file missing for shard set",
                )
            )
            continue

        if not canonical_index_path.exists():
            findings.append(
                Finding(
                    kind="plan_shards",
                    location=str(canonical_index_path.relative_to(REPO_ROOT)),
                    message="missing canonical shard index file 00-index.md",
                )
            )

        if legacy_index_path.exists():
            findings.append(
                Finding(
                    kind="plan_shards",
                    location=str(legacy_index_path.relative_to(REPO_ROOT)),
                    message="legacy shard index file _index.md detected; expected 00-index.md only",
                )
            )

        legacy_zero_shards = sorted(
            p.name
            for p in shard_dir.iterdir()
            if p.is_file() and p.name.startswith("00-") and p.name.endswith(".md") and p.name != "00-index.md"
        )
        if legacy_zero_shards:
            findings.append(
                Finding(
                    kind="plan_shards",
                    location=str(shard_dir.relative_to(REPO_ROOT)),
                    message=f"legacy 00-* shard filenames detected (expected 01-* and above): {legacy_zero_shards}",
                )
            )

        expected_source_path = manifest.get("source_path")
        if expected_source_path != source_rel:
            findings.append(
                Finding(
                    kind="plan_shards",
                    location=str(manifest_path.relative_to(REPO_ROOT)),
                    message=(
                        f"manifest source_path mismatch: expected {source_rel}, "
                        f"got {expected_source_path}"
                    ),
                )
            )

        source_sha = _sha256_file(source_path)
        manifest_sha = manifest.get("source_sha256")
        if not isinstance(manifest_sha, str) or manifest_sha != source_sha:
            findings.append(
                Finding(
                    kind="plan_shards",
                    location=str(manifest_path.relative_to(REPO_ROOT)),
                    message=(
                        "stale shards detected: "
                        f"manifest source_sha256={manifest_sha} current source_sha256={source_sha}"
                    ),
                )
            )
            continue

        shards = manifest.get("shards")
        if not isinstance(shards, list):
            findings.append(
                Finding(
                    kind="plan_shards",
                    location=str(manifest_path.relative_to(REPO_ROOT)),
                    message="manifest.shards must be an array",
                )
            )
            continue

        reconstructed = b""
        reconstruction_failed = False
        for idx, entry in enumerate(shards):
            if not isinstance(entry, dict):
                findings.append(
                    Finding(
                        kind="plan_shards",
                        location=str(manifest_path.relative_to(REPO_ROOT)),
                        message=f"manifest.shards[{idx}] is not an object",
                    )
                )
                reconstruction_failed = True
                continue

            dest_rel = entry.get("dest_path")
            if not isinstance(dest_rel, str) or not dest_rel.strip():
                findings.append(
                    Finding(
                        kind="plan_shards",
                        location=str(manifest_path.relative_to(REPO_ROOT)),
                        message=f"manifest.shards[{idx}] missing dest_path",
                    )
                )
                reconstruction_failed = True
                continue

            shard_path = REPO_ROOT / dest_rel
            if not shard_path.exists():
                findings.append(
                    Finding(
                        kind="plan_shards",
                        location=str(shard_path.relative_to(REPO_ROOT)),
                        message="manifest shard missing on disk",
                    )
                )
                reconstruction_failed = True
                continue

            reconstructed += shard_path.read_bytes()

        if reconstruction_failed:
            continue

        reconstructed_sha = hashlib.sha256(reconstructed).hexdigest()
        if reconstructed_sha != source_sha:
            findings.append(
                Finding(
                    kind="plan_shards",
                    location=str(manifest_path.relative_to(REPO_ROOT)),
                    message=(
                        "stale shards detected by reconstruction hash: "
                        f"source_sha256={source_sha} reconstructed_sha256={reconstructed_sha}"
                    ),
                )
            )

    if not shards_exist:
        return []
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
    sub.add_parser("validate-plan-shards", help="Fail when existing plan shards are stale")
    sub.add_parser("lint-banned-phrases", help="Fail on banned drift phrases in canonical SSOT docs")
    sub.add_parser("lint-contractrefs", help="Fail on operational requirements missing ContractRef blocks")
    sub.add_parser("validate-node-artifacts", help="Validate non-example node evidence and change-budget declarations")
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
    elif args.cmd == "validate-plan-shards":
        findings = validate_plan_shards_freshness()
    elif args.cmd == "lint-banned-phrases":
        findings = lint_banned_phrases()
    elif args.cmd == "lint-contractrefs":
        findings = lint_contractrefs()
    elif args.cmd == "validate-node-artifacts":
        findings = validate_non_example_node_artifacts()
    elif args.cmd == "run-gates":
        findings = []
        findings.extend(validate_plan_graph())
        findings.extend(validate_auto_decisions())
        findings.extend(verify_spec_lock_hashes())
        findings.extend(validate_plan_shards_freshness())
        findings.extend(lint_banned_phrases())
        findings.extend(lint_contractrefs())
        findings.extend(validate_non_example_node_artifacts())
    else:
        parser.error("unknown command")
        return 2

    if findings:
        _print_findings(findings)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
