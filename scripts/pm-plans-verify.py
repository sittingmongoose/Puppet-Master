#!/usr/bin/env python3
"""Repo-local verifier for Puppet Master build-governance artifacts."""

from __future__ import annotations

import argparse
import fnmatch
import hashlib
import json
import re
import subprocess
import sys
import tempfile
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
PLANS = ROOT / "Plans"


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def rel(path: Path) -> str:
    return path.resolve().relative_to(ROOT).as_posix()


def exact_path(ref: str) -> tuple[Path | None, dict[str, Any] | None]:
    """Resolve a repo-relative path only when every segment matches exact case."""
    if not ref or any(token in ref for token in "*?[]"):
        return ROOT / ref, None
    posix = PurePosixPath(ref)
    if posix.is_absolute():
        return None, {"path": ref, "error": "absolute_ref_not_allowed"}

    current = ROOT
    resolved_parts: list[str] = []
    for part in posix.parts:
        if part in {"", "."}:
            continue
        if part == "..":
            return None, {"path": ref, "error": "parent_ref_not_allowed"}
        if not current.exists():
            return None, {"path": ref, "error": "missing_parent", "parent": "/".join(resolved_parts)}
        try:
            children = {child.name: child for child in current.iterdir()}
        except NotADirectoryError:
            return None, {"path": ref, "error": "parent_not_directory", "parent": "/".join(resolved_parts)}
        if part not in children:
            case_matches = [child.name for child in children.values() if child.name.lower() == part.lower()]
            if case_matches:
                actual_parts = resolved_parts + [case_matches[0]]
                return None, {
                    "path": ref,
                    "error": "case_mismatched_ref",
                    "actual": "/".join(actual_parts),
                }
            return None, {"path": ref, "error": "missing_ref"}
        current = children[part]
        resolved_parts.append(part)
    return current, None


def ref_failure(path_error: dict[str, Any], ref_key: str = "ref") -> dict[str, Any]:
    failure = dict(path_error)
    failure[ref_key] = failure.pop("path")
    return failure


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_report(report: dict[str, Any], report_path: str | None) -> None:
    if not report_path:
        return
    path = ROOT / report_path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def report_status(name: str, failures: list[dict[str, Any]], **extra: Any) -> dict[str, Any]:
    return {
        "schema_id": "pm.plans_verify.report.v1",
        "check": name,
        "generated_at_utc": utc_now(),
        "status": "pass" if not failures else "fail",
        "failures": failures,
        **extra,
    }


def json_type_matches(instance: Any, expected: str) -> bool:
    if expected == "object":
        return isinstance(instance, dict)
    if expected == "array":
        return isinstance(instance, list)
    if expected == "string":
        return isinstance(instance, str)
    if expected == "integer":
        return isinstance(instance, int) and not isinstance(instance, bool)
    if expected == "number":
        return isinstance(instance, (int, float)) and not isinstance(instance, bool)
    if expected == "boolean":
        return isinstance(instance, bool)
    if expected == "null":
        return instance is None
    return True


def resolve_ref(ref: str, root_schema: dict[str, Any]) -> Any:
    if not ref.startswith("#/"):
        raise ValueError(f"unsupported ref {ref}")
    target: Any = root_schema
    for part in ref[2:].split("/"):
        part = part.replace("~1", "/").replace("~0", "~")
        target = target[part]
    return target


def validate_schema(instance: Any, schema: Any, root_schema: dict[str, Any] | None = None, path: str = "$") -> list[str]:
    if not isinstance(schema, dict):
        return []
    root_schema = root_schema or schema
    errors: list[str] = []

    if "$ref" in schema:
        return validate_schema(instance, resolve_ref(schema["$ref"], root_schema), root_schema, path)

    if "if" in schema:
        if not validate_schema(instance, schema["if"], root_schema, path):
            errors.extend(validate_schema(instance, schema.get("then", {}), root_schema, path))
        elif "else" in schema:
            errors.extend(validate_schema(instance, schema["else"], root_schema, path))

    for sub_schema in schema.get("allOf", []):
        errors.extend(validate_schema(instance, sub_schema, root_schema, path))

    if "anyOf" in schema:
        any_errors = [validate_schema(instance, sub, root_schema, path) for sub in schema["anyOf"]]
        if all(any_errors):
            errors.append(f"{path}: did not match anyOf")

    expected_type = schema.get("type")
    if expected_type is not None:
        expected_types = expected_type if isinstance(expected_type, list) else [expected_type]
        if not any(json_type_matches(instance, expected) for expected in expected_types):
            errors.append(f"{path}: expected type {expected_type}")
            return errors

    if "const" in schema and instance != schema["const"]:
        errors.append(f"{path}: expected const {schema['const']!r}")
    if "enum" in schema and instance not in schema["enum"]:
        errors.append(f"{path}: expected one of {schema['enum']!r}")

    if isinstance(instance, str):
        if "minLength" in schema and len(instance) < schema["minLength"]:
            errors.append(f"{path}: shorter than minLength {schema['minLength']}")
        if "pattern" in schema and not re.search(schema["pattern"], instance):
            errors.append(f"{path}: does not match pattern {schema['pattern']}")

    if isinstance(instance, (int, float)) and not isinstance(instance, bool):
        if "minimum" in schema and instance < schema["minimum"]:
            errors.append(f"{path}: below minimum {schema['minimum']}")

    if isinstance(instance, list):
        if "minItems" in schema and len(instance) < schema["minItems"]:
            errors.append(f"{path}: fewer than minItems {schema['minItems']}")
        if schema.get("uniqueItems"):
            seen = set()
            for item in instance:
                marker = json.dumps(item, sort_keys=True)
                if marker in seen:
                    errors.append(f"{path}: duplicate item {marker}")
                    break
                seen.add(marker)
        if "items" in schema:
            for i, item in enumerate(instance):
                errors.extend(validate_schema(item, schema["items"], root_schema, f"{path}[{i}]"))
        if "contains" in schema and not any(
            not validate_schema(item, schema["contains"], root_schema, f"{path}[*]") for item in instance
        ):
            errors.append(f"{path}: contains condition not satisfied")

    if isinstance(instance, dict):
        if "minProperties" in schema and len(instance) < schema["minProperties"]:
            errors.append(f"{path}: fewer than minProperties {schema['minProperties']}")
        for key in schema.get("required", []):
            if key not in instance:
                errors.append(f"{path}: missing required key {key}")
        properties = schema.get("properties", {})
        for key, value in instance.items():
            if key in properties:
                errors.extend(validate_schema(value, properties[key], root_schema, f"{path}.{key}"))
            elif schema.get("additionalProperties") is False:
                errors.append(f"{path}: additional property {key}")
            elif isinstance(schema.get("additionalProperties"), dict):
                errors.extend(validate_schema(value, schema["additionalProperties"], root_schema, f"{path}.{key}"))

    return errors


def validate_against_schema(instance_path: Path, schema_path: Path) -> list[str]:
    schema = load_json(schema_path)
    instance = load_json(instance_path)
    return validate_schema(instance, schema, schema)


def iter_repo_files() -> list[Path]:
    files: list[Path] = []
    proc = subprocess.run(
        ["git", "-C", str(ROOT), "ls-files", "--cached", "--others", "--exclude-standard", "-z"],
        check=False,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
    )
    if proc.returncode == 0:
        for raw in proc.stdout.split(b"\0"):
            if not raw:
                continue
            path = ROOT / raw.decode("utf-8")
            try:
                if path.is_file():
                    files.append(path)
            except OSError:
                continue
        return files

    for path in ROOT.rglob("*"):
        try:
            if not path.is_file():
                continue
        except OSError:
            continue
        parts = path.relative_to(ROOT).parts
        if ".git" in parts:
            continue
        files.append(path)
    return files


def cmd_json_syntax(args: argparse.Namespace) -> dict[str, Any]:
    failures: list[dict[str, Any]] = []
    files_checked = 0
    jsonl_lines_checked = 0
    for path in iter_repo_files():
        if path.suffix not in {".json", ".jsonl"}:
            continue
        files_checked += 1
        try:
            if path.suffix == ".json":
                load_json(path)
            else:
                for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
                    if not line.strip():
                        continue
                    json.loads(line)
                    jsonl_lines_checked += 1
        except Exception as exc:  # noqa: BLE001 - verifier records the exact parse failure.
            failures.append({"path": rel(path), "error": str(exc)})
    return report_status(
        "json-syntax",
        failures,
        files_checked=files_checked,
        jsonl_lines_checked=jsonl_lines_checked,
    )


def cmd_verify_spec_lock(args: argparse.Namespace) -> dict[str, Any]:
    spec_path = PLANS / "Spec_Lock.json"
    failures: list[dict[str, Any]] = []
    try:
        spec = load_json(spec_path)
    except Exception as exc:  # noqa: BLE001
        return report_status("verify-spec-lock", [{"path": rel(spec_path), "error": str(exc)}])

    files = spec.get("canonical_ssot_hashes", {}).get("files", [])
    checked = []
    for entry in files:
        entry_ref = entry.get("path", "")
        entry_path, path_error = exact_path(entry_ref)
        expected = entry.get("sha256")
        if path_error:
            failures.append({**path_error, "error": path_error["error"].replace("_ref", "_locked_file")})
            continue
        assert entry_path is not None
        if not entry_path.exists():
            failures.append({"path": entry_ref, "error": "missing_locked_file"})
            continue
        actual = sha256_file(entry_path)
        checked.append({"path": entry_ref, "sha256": actual})
        if expected != actual:
            failures.append(
                {
                    "path": entry_ref,
                    "error": "stale_hash",
                    "expected": expected,
                    "actual": actual,
                }
            )

    return report_status(
        "verify-spec-lock",
        failures,
        locked_files_checked=len(checked),
        locked_files=checked,
    )


def cmd_validate_auto_decisions(args: argparse.Namespace) -> dict[str, Any]:
    schema_path = PLANS / "auto_decisions.schema.json"
    schema = load_json(schema_path)
    targets = [PLANS / "auto_decisions.jsonl"]
    project_target = ROOT / ".puppet-master/project/auto_decisions.jsonl"
    if project_target.exists():
        targets.append(project_target)

    failures: list[dict[str, Any]] = []
    rows_checked = 0
    decision_counts: dict[str, int] = {}
    historical_duplicate_counts = {
        "dec-r-20260312-160857-01-spec-lock-refresh": 3,
        "dec-r-20260316-160450-01-spec-lock-refresh": 2,
        "dec-r-20260328-192850-02-spec-lock-refresh": 2,
        "dec-r-20260328-192850-04-spec-lock-refresh": 2,
        "dec-r-20260328-192850-05-spec-lock-refresh": 2,
        "dec-r-20260329-235630-04-spec-lock-refresh": 2,
        "dec-rewrite-20260307-230437-dockerhub-docker-management-and-unraid-template-publishing-audit-remediation-spec-lock-refresh": 2,
        "dec-rewrite-20260308-010858-persona-runtime-audit-gap-closure-spec-lock-refresh": 8,
        "dec-rewrite-20260308-044815-dockerhub-docker-management-and-unraid-template-publishing-audit-remediation-packet-spec-lock-refresh": 2,
        "dec-rewrite-20260308-194441-plan-and-deep-plan-pt-wizard-escalation-and-assistant-to-interview-handoff-spec-lock-refresh": 3,
        "dec-rewrite-20260308-203718-runtime-scheduler-scoring-wakeups-remediation-safe-points-and-decomposition-fallback-spec-lock-refresh": 2,
        "dec-rewrite-20260309-004657-runtime-scheduler-scoring-wakeups-remediation-lineage-safe-points-retry-taxonomy-and-draft-decomposition-degradation-boundaries-spec-lock-refresh": 2,
        "dec-rewrite-20260309-031700-runtime-scheduler-scoring-wakeups-remediation-safe-points-blocked-outcomes-and-decomposition-fallback-spec-lock-refresh": 2,
        "dec-rewrite-20260309-041936-runtime-scheduler-scoring-wakeups-remediation-safe-points-blocked-outcomes-and-decomposition-fallback-reconciliation-spec-lock-refresh": 2,
        "dec-rewrite-20260309-185017-runtime-scheduler-scoring-wakeups-remediation-safe-points-blocked-recovery-cross-doc-reconciliation-spec-lock-refresh": 7,
        "dec-rewrite-20260310-172932-gui-artifacts-usage-panels-spec-lock-refresh": 3,
        "dec-rewrite-20260310-210122-gui-artifacts-usage-panels-spec-lock-refresh": 3,
        "dec-rewrite-20260311-030008-gui-artifacts-usage-panels-spec-lock-refresh": 2,
        "dec-rewrite-20260311-152314-implementation-readiness-reconciliation-spec-lock-refresh": 5,
    }
    for target in targets:
        for line_no, line in enumerate(target.read_text(encoding="utf-8").splitlines(), start=1):
            if not line.strip():
                continue
            rows_checked += 1
            try:
                row = json.loads(line)
            except json.JSONDecodeError as exc:
                failures.append({"path": rel(target), "line": line_no, "error": str(exc)})
                continue
            for error in validate_schema(row, schema, schema):
                failures.append({"path": rel(target), "line": line_no, "error": error})
            decision_id = row.get("decision_id")
            if isinstance(decision_id, str):
                decision_counts[decision_id] = decision_counts.get(decision_id, 0) + 1

    duplicate_policy_notes = []
    for decision_id, count in sorted(decision_counts.items()):
        allowed_count = historical_duplicate_counts.get(decision_id, 1)
        if count > allowed_count:
            failures.append(
                {
                    "path": "Plans/auto_decisions.jsonl",
                    "decision_id": decision_id,
                    "error": "duplicate_decision_id",
                    "count": count,
                    "allowed_count": allowed_count,
                }
            )
        if allowed_count > 1 and count == allowed_count:
            duplicate_policy_notes.append({"decision_id": decision_id, "historical_count": allowed_count})

    return report_status(
        "validate-auto-decisions",
        failures,
        rows_checked=rows_checked,
        historical_duplicate_policy="listed pre-existing decision_id counts are grandfathered; any new duplicate or increased historical duplicate count fails validation",
        historical_duplicate_decision_ids=duplicate_policy_notes,
    )


def evidence_paths(explicit_paths: list[str]) -> list[Path]:
    if explicit_paths:
        return [ROOT / path for path in explicit_paths]
    return sorted((PLANS / ".evidence").glob("**/evidence.json"))


def validate_evidence_file(path: Path, schema: dict[str, Any]) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    try:
        data = load_json(path)
    except Exception as exc:  # noqa: BLE001
        return [{"path": rel(path), "error": str(exc)}]
    for error in validate_schema(data, schema, schema):
        failures.append({"path": rel(path), "error": error})
    for artifact in data.get("artifacts", []):
        artifact_ref = artifact.get("path")
        expected_hash = artifact.get("sha256")
        if not artifact_ref or not expected_hash:
            continue
        artifact_path, path_error = exact_path(artifact_ref)
        if path_error:
            failures.append({"path": rel(path), "artifact": artifact_ref, **ref_failure(path_error, "artifact_ref")})
            continue
        assert artifact_path is not None
        if not artifact_path.exists():
            failures.append({"path": rel(path), "artifact": artifact_ref, "error": "missing_artifact"})
            continue
        actual_hash = sha256_file(artifact_path)
        if actual_hash != expected_hash:
            failures.append(
                {
                    "path": rel(path),
                    "artifact": artifact_ref,
                    "error": "artifact_hash_stale",
                    "expected": expected_hash,
                    "actual": actual_hash,
                }
            )
    return failures


def cmd_validate_evidence(args: argparse.Namespace) -> dict[str, Any]:
    schema = load_json(PLANS / "evidence.schema.json")
    paths = evidence_paths(args.paths)
    failures: list[dict[str, Any]] = []
    checked = []
    for path in paths:
        path_ref = path.relative_to(ROOT).as_posix() if path.is_absolute() and path.is_relative_to(ROOT) else str(path)
        exact_evidence_path, path_error = exact_path(path_ref)
        if path_error:
            failures.append({"path": path_ref, **path_error, "error": path_error["error"].replace("_ref", "_evidence")})
            continue
        path = exact_evidence_path or path
        if not path.exists():
            failures.append({"path": rel(path) if path.is_absolute() else str(path), "error": "missing_evidence"})
            continue
        checked.append(rel(path))
        failures.extend(validate_evidence_file(path, schema))
    return report_status("validate-evidence", failures, evidence_files_checked=len(checked), evidence_files=checked)


def cmd_validate_plan_graph(args: argparse.Namespace) -> dict[str, Any]:
    graph_path = PLANS / "plan_graph.json"
    schema_path = PLANS / "plan_graph.schema.json"
    evidence_schema = load_json(PLANS / "evidence.schema.json")
    failures: list[dict[str, Any]] = []
    try:
        graph = load_json(graph_path)
        schema = load_json(schema_path)
    except Exception as exc:  # noqa: BLE001
        return report_status("validate-plan-graph", [{"path": rel(graph_path), "error": str(exc)}])

    for error in validate_schema(graph, schema, schema):
        failures.append({"path": rel(graph_path), "error": error})
    if str(graph.get("graph_id", "")).startswith("EXAMPLE."):
        failures.append({"path": rel(graph_path), "error": "canonical_graph_id_is_example"})
    for entry in graph.get("entrypoints", []):
        if str(entry).startswith("EXAMPLE."):
            failures.append({"path": rel(graph_path), "error": "entrypoint_is_example", "entrypoint": entry})

    node_ids = {node.get("node_id") for node in graph.get("nodes", [])}
    for node in graph.get("nodes", []):
        node_id = node.get("node_id")
        if not node_id or str(node_id).startswith("EXAMPLE."):
            failures.append({"path": rel(graph_path), "node_id": node_id, "error": "node_id_is_example"})
        if node.get("example") is True:
            failures.append({"path": rel(graph_path), "node_id": node_id, "error": "node_marked_example"})
        for dep in node.get("blockers", []):
            if dep not in node_ids:
                failures.append({"path": rel(graph_path), "node_id": node_id, "error": "unknown_blocker", "blocker": dep})
        for ref in node.get("unblocks", []):
            if ref not in node_ids:
                failures.append({"path": rel(graph_path), "node_id": node_id, "error": "unknown_unblock", "unblocks": ref})
        change_budget = node.get("change_budget", {})
        for key in [
            "schema_id",
            "allowed_paths",
            "forbidden_paths",
            "forbidden_files",
            "max_files_changed",
            "max_lines_added",
            "max_lines_deleted",
        ]:
            if key not in change_budget:
                failures.append({"path": rel(graph_path), "node_id": node_id, "error": f"missing_change_budget_key:{key}"})
        evidence_ref = node.get("evidence_required", {}).get("path")
        if evidence_ref:
            evidence_path, path_error = exact_path(evidence_ref)
            if path_error:
                failures.append({"path": rel(graph_path), "node_id": node_id, "evidence": evidence_ref, **ref_failure(path_error, "evidence_ref")})
            elif evidence_path is None or not evidence_path.exists():
                failures.append({"path": rel(graph_path), "node_id": node_id, "error": "missing_required_evidence", "evidence": evidence_ref})
            else:
                failures.extend(validate_evidence_file(evidence_path, evidence_schema))
        for output in node.get("outputs", []):
            output_ref = output.get("ref")
            if not output_ref or any(token in output_ref for token in "*?[]"):
                continue
            output_path, path_error = exact_path(output_ref)
            if path_error:
                failures.append({"path": rel(graph_path), "node_id": node_id, "output": output_ref, **ref_failure(path_error, "output_ref")})
                continue
            if output.get("kind") == "file" and (output_path is None or not output_path.is_file()):
                failures.append({"path": rel(graph_path), "node_id": node_id, "error": "missing_output_file", "output": output_ref})
            if output.get("kind") == "directory" and (output_path is None or not output_path.is_dir()):
                failures.append({"path": rel(graph_path), "node_id": node_id, "error": "missing_output_directory", "output": output_ref})

    return report_status(
        "validate-plan-graph",
        failures,
        graph_id=graph.get("graph_id"),
        node_count=len(graph.get("nodes", [])),
    )


def plan_text_files() -> list[Path]:
    files: list[Path] = []
    for path in PLANS.rglob("*"):
        if not path.is_file():
            continue
        parts = path.relative_to(PLANS).parts
        if parts and parts[0] in {".pipeline", "_shards", ".evidence", "ledgers"}:
            continue
        if path.suffix.lower() in {".md", ".json"}:
            files.append(path)
    return files


def cmd_lint_contractrefs(args: argparse.Namespace) -> dict[str, Any]:
    failures: list[dict[str, Any]] = []
    file_ref_pattern = re.compile(r"Plans/[A-Za-z0-9_.-]+(?:/[A-Za-z0-9_.-]+)*(?:\.jsonl|\.json|\.md|\.py)")
    contract_ref_pattern = re.compile(r"ContractName:(Plans/[A-Za-z0-9_.-]+(?:/[A-Za-z0-9_.-]+)*(?:\.jsonl|\.json|\.md|\.py)(?:#[^\s,`]*)?)")
    governance_ref_files = {
        "00-plans-index.md",
        "Decision_Policy.md",
        "Progression_Gates.md",
        "Project_Output_Artifacts.md",
        "Spec_Lock.json",
        "plan_graph.json",
        "sharding_config.json",
    }
    for path in plan_text_files():
        text = path.read_text(encoding="utf-8")
        for line_no, line in enumerate(text.splitlines(), start=1):
            for match in contract_ref_pattern.finditer(line):
                ref = match.group(1).split("#", 1)[0].rstrip(".,);:]`")
                if "*" in ref:
                    continue
                if ref.startswith("Plans/.pipeline/") or ref.startswith("Plans/_shards/") or ref.startswith("Plans/.evidence/"):
                    continue
                _, path_error = exact_path(ref)
                if path_error:
                    failures.append({"path": rel(path), "line": line_no, "ref": ref, **ref_failure(path_error, "bad_ref")})
            if path.name in governance_ref_files:
                for match in file_ref_pattern.finditer(line):
                    ref = match.group(0).split("#", 1)[0].rstrip(".,);:]`")
                    if "*" in ref:
                        continue
                    if ref.startswith("Plans/.pipeline/"):
                        continue
                    _, path_error = exact_path(ref)
                    if path_error:
                        failures.append({"path": rel(path), "line": line_no, "ref": ref, **ref_failure(path_error, "bad_ref")})
            if "decision_policy.md" in line:
                failures.append({"path": rel(path), "line": line_no, "ref": "decision_policy.md", "error": "case_mismatched_ref"})
            for account_match in re.finditer(r"(?<!Multi-)Account\.md\b", line):
                failures.append({"path": rel(path), "line": line_no, "ref": "Account.md", "error": "missing_account_owner_ref"})

    return report_status("lint-contractrefs", failures, files_checked=len(plan_text_files()))


def cmd_lint_banned_phrases(args: argparse.Namespace) -> dict[str, Any]:
    governance_files = [
        PLANS / "Decision_Policy.md",
        PLANS / "DRY_Rules.md",
        PLANS / "Progression_Gates.md",
        PLANS / "Project_Output_Artifacts.md",
        PLANS / "Spec_Lock.json",
        PLANS / "plan_graph.json",
        PLANS / "sharding_config.json",
    ]
    pattern = re.compile(r"\b(TBD|Open Questions|ask later)\b")
    definition_markers = [
        "add `TBD`",
        "`TBD`, `Open Questions`, `ask later`",
        "`TBD`, `Open question`, `ask later`",
        "drift phrase lint",
        "drift phrases exist",
        "forbidden patterns",
    ]
    failures: list[dict[str, Any]] = []
    for path in governance_files:
        if not path.exists():
            continue
        in_yaml_fence = False
        current_yaml_key: str | None = None
        for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
            stripped = line.strip()
            if stripped.startswith("```"):
                in_yaml_fence = stripped == "```yaml" and not in_yaml_fence
                current_yaml_key = None
                continue
            if in_yaml_fence:
                key_match = re.match(r"^([A-Za-z0-9_]+):", stripped)
                if key_match:
                    current_yaml_key = key_match.group(1)
            if not pattern.search(line):
                continue
            if any(marker in line for marker in definition_markers):
                continue
            if in_yaml_fence and current_yaml_key == "preserved_exact_tokens":
                continue
            if in_yaml_fence and current_yaml_key == "canonical_text" and re.search(r"\b(forbid|forbids|must not add)\b", line):
                continue
            if in_yaml_fence and current_yaml_key == "negative_constraints" and "Do not add" in line:
                continue
            failures.append({"path": rel(path), "line": line_no, "error": "banned_drift_phrase", "text": line.strip()})
    return report_status("lint-banned-phrases", failures, files_checked=len([p for p in governance_files if p.exists()]))


def cmd_check_shards(args: argparse.Namespace) -> dict[str, Any]:
    temp_path: Path | None = None
    if args.report:
        report_path = args.report
        report_file = ROOT / report_path
    else:
        tmp = tempfile.NamedTemporaryFile(prefix="pm-shard-check-", suffix=".json", delete=False)
        tmp.close()
        temp_path = Path(tmp.name)
        report_path = str(temp_path)
        report_file = temp_path
    proc = subprocess.run(
        [sys.executable, "scripts/pm-shard-plans.py", "--check", "--report", report_path],
        cwd=ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    report = load_json(report_file)
    if temp_path is not None:
        temp_path.unlink(missing_ok=True)
    report["check"] = "check-shards"
    report["command_exit_code"] = proc.returncode
    report["stdout_excerpt"] = proc.stdout[-4000:]
    report["stderr_excerpt"] = proc.stderr[-4000:]
    return report


def cmd_check_project_artifact_requirements(args: argparse.Namespace) -> dict[str, Any]:
    project_root = ROOT / ".puppet-master/project"
    required_now = project_root.exists()
    failures: list[dict[str, Any]] = []
    notes = []
    if required_now:
        required = [
            ".puppet-master/project/requirements.md",
            ".puppet-master/project/contracts/index.json",
            ".puppet-master/project/plan.md",
            ".puppet-master/project/plan_graph/index.json",
            ".puppet-master/project/acceptance_manifest.json",
            ".puppet-master/project/auto_decisions.jsonl",
            ".puppet-master/project/traceability/requirements_quality_report.json",
            ".puppet-master/project/traceability/requirements_coverage.json",
            ".puppet-master/project/traceability/requirements_coverage.md",
        ]
        for ref in required:
            if not (ROOT / ref).exists():
                failures.append({"path": ref, "error": "missing_required_project_artifact"})
    else:
        notes.append(
            "Project contract index, acceptance manifest, and requirements coverage artifacts are required for generated user-project packages under .puppet-master/project/**; no generated project package exists in this repo checkout, so they are future/generated-only for this build-governance seal."
        )
    return report_status(
        "check-project-artifact-requirements",
        failures,
        project_package_present=required_now,
        notes=notes,
    )


def compact_gate_report(report: dict[str, Any], sample_limit: int = 10) -> dict[str, Any]:
    return {
        "status": report.get("status"),
        "failures": len(report.get("failures", [])),
        "failure_samples": report.get("failures", [])[:sample_limit],
    }


def cmd_run_gates(args: argparse.Namespace) -> dict[str, Any]:
    checks = [
        ("json_syntax", cmd_json_syntax(argparse.Namespace())),
        ("verify_spec_lock", cmd_verify_spec_lock(argparse.Namespace())),
        ("validate_plan_graph", cmd_validate_plan_graph(argparse.Namespace(paths=[]))),
        ("validate_auto_decisions", cmd_validate_auto_decisions(argparse.Namespace())),
        ("validate_evidence", cmd_validate_evidence(argparse.Namespace(paths=[]))),
        ("lint_contractrefs", cmd_lint_contractrefs(argparse.Namespace())),
        ("lint_banned_phrases", cmd_lint_banned_phrases(argparse.Namespace())),
        ("check_project_artifact_requirements", cmd_check_project_artifact_requirements(argparse.Namespace())),
    ]
    shard_report = cmd_check_shards(argparse.Namespace(report=None))
    checks.append(("check_shards", shard_report))

    failures: list[dict[str, Any]] = []
    for name, report in checks:
        if report.get("status") != "pass":
            failures.append({"check": name, "status": report.get("status"), "failures": report.get("failures", [])[:50]})
    return report_status(
        "run-gates",
        failures,
        checks={name: compact_gate_report(report) for name, report in checks},
    )


def cmd_audit_governance(args: argparse.Namespace) -> dict[str, Any]:
    spec = cmd_verify_spec_lock(argparse.Namespace())
    graph = cmd_validate_plan_graph(argparse.Namespace(paths=[]))
    auto = cmd_validate_auto_decisions(argparse.Namespace())
    evidence = cmd_validate_evidence(argparse.Namespace(paths=[]))
    refs = cmd_lint_contractrefs(argparse.Namespace())
    shards = cmd_check_shards(argparse.Namespace(report=None))
    project_artifacts = cmd_check_project_artifact_requirements(argparse.Namespace())
    failures: list[dict[str, Any]] = []
    for name, report in [
        ("spec_lock", spec),
        ("plan_graph", graph),
        ("auto_decisions", auto),
        ("evidence", evidence),
        ("support_refs", refs),
        ("shards", shards),
        ("project_artifacts", project_artifacts),
    ]:
        if report.get("status") != "pass":
            failures.append({"check": name, "failures": report.get("failures", [])[:100]})
    return report_status(
        "audit-governance",
        failures,
        spec_lock=compact_gate_report(spec),
        plan_graph=compact_gate_report(graph),
        auto_decisions=compact_gate_report(auto),
        evidence=compact_gate_report(evidence),
        support_refs=compact_gate_report(refs),
        shards=compact_gate_report(shards),
        project_artifacts=compact_gate_report(project_artifacts),
    )


COMMANDS = {
    "json-syntax": cmd_json_syntax,
    "verify-spec-lock": cmd_verify_spec_lock,
    "validate-auto-decisions": cmd_validate_auto_decisions,
    "validate-evidence": cmd_validate_evidence,
    "validate-plan-graph": cmd_validate_plan_graph,
    "lint-contractrefs": cmd_lint_contractrefs,
    "lint-banned-phrases": cmd_lint_banned_phrases,
    "check-shards": cmd_check_shards,
    "check-project-artifacts": cmd_check_project_artifact_requirements,
    "run-gates": cmd_run_gates,
    "audit-governance": cmd_audit_governance,
}


def main() -> int:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)
    for name in COMMANDS:
        sub = subparsers.add_parser(name)
        sub.add_argument("--report")
        if name == "validate-evidence":
            sub.add_argument("paths", nargs="*")
    args = parser.parse_args()
    if not hasattr(args, "paths"):
        args.paths = []
    report = COMMANDS[args.command](args)
    write_report(report, args.report)
    print(json.dumps({k: report[k] for k in report if k in {"check", "status", "failures", "generated_at_utc"}}, indent=2, sort_keys=True))
    return 0 if report.get("status") == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(main())
