#!/usr/bin/env python3
"""Repo-local verifier for Puppet Master build-governance artifacts."""

from __future__ import annotations

import argparse
import fnmatch
import hashlib
import json
import re
import signal
import subprocess
import sys
import tempfile
import time
from contextlib import contextmanager
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
PLANS = ROOT / "Plans"
PATH_REFERENCE_REGISTRY = PLANS / "path_reference_registry.json"
PATH_REFERENCE_REGISTRY_SCHEMA = PLANS / "path_reference_registry.schema.json"
PLAN_UNITS_INDEX = PLANS / ".plan_index/plan_units.jsonl"
DEFAULT_PLAN_MIGRATION_RUN = PLANS / ".plan_migration/pds-20260611-002-atomize-planunits"


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


def registry_ref_matches(ref: str, row: dict[str, Any]) -> bool:
    raw_ref = str(row.get("raw_ref", ""))
    match_kind = row.get("match_kind", "exact")
    if match_kind == "prefix":
        return ref.startswith(raw_ref)
    if match_kind == "glob":
        return fnmatch.fnmatchcase(ref, raw_ref)
    if match_kind == "doc_anchor":
        return ref == raw_ref
    return ref == raw_ref


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


class SubcheckTimeout(RuntimeError):
    pass


@contextmanager
def subcheck_alarm(seconds: int, name: str):
    if seconds <= 0:
        yield
        return
    old_handler = signal.getsignal(signal.SIGALRM)

    def _handler(signum: int, frame: Any) -> None:
        raise SubcheckTimeout(f"{name} exceeded {seconds}s")

    signal.signal(signal.SIGALRM, _handler)
    signal.setitimer(signal.ITIMER_REAL, seconds)
    try:
        yield
    finally:
        signal.setitimer(signal.ITIMER_REAL, 0)
        signal.signal(signal.SIGALRM, old_handler)


def progress_enabled(args: argparse.Namespace) -> bool:
    return not bool(getattr(args, "quiet_progress", False))


def subcheck_timeout_seconds(args: argparse.Namespace) -> int:
    return int(getattr(args, "subcheck_timeout_seconds", 180) or 0)


def run_named_check(
    name: str,
    func: Any,
    namespace: argparse.Namespace,
    *,
    progress: bool,
    timeout_seconds: int,
) -> tuple[str, dict[str, Any]]:
    if progress:
        print(f"[pm-plans-verify] start {name}", file=sys.stderr, flush=True)
    started = time.monotonic()
    try:
        with subcheck_alarm(timeout_seconds, name):
            setattr(namespace, "subcheck_timeout_seconds", timeout_seconds)
            report = func(namespace)
    except SubcheckTimeout as exc:
        report = report_status(name, [{"check": name, "error": "subcheck_timeout", "timeout_seconds": timeout_seconds, "message": str(exc)}])
    except Exception as exc:  # pragma: no cover - defensive gate wrapper
        report = report_status(name, [{"check": name, "error": "subcheck_exception", "message": str(exc)}])
    elapsed_ms = int((time.monotonic() - started) * 1000)
    report.setdefault("elapsed_ms", elapsed_ms)
    if progress:
        print(f"[pm-plans-verify] done {name} status={report.get('status')} elapsed_ms={elapsed_ms}", file=sys.stderr, flush=True)
    return name, report


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


def plan_graph_node_ids() -> tuple[set[str], list[dict[str, Any]]]:
    graph_path = PLANS / "plan_graph.json"
    try:
        graph = load_json(graph_path)
    except Exception as exc:  # noqa: BLE001
        return set(), [{"path": rel(graph_path), "error": str(exc)}]
    node_ids = {
        str(node.get("node_id"))
        for node in graph.get("nodes", [])
        if isinstance(node, dict) and isinstance(node.get("node_id"), str) and node.get("node_id")
    }
    return node_ids, []


def validate_evidence_file(
    path: Path,
    schema: dict[str, Any],
    *,
    known_node_ids: set[str] | None = None,
    expected_node_id: str | None = None,
) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    try:
        data = load_json(path)
    except Exception as exc:  # noqa: BLE001
        return [{"path": rel(path), "error": str(exc)}]
    for error in validate_schema(data, schema, schema):
        failures.append({"path": rel(path), "error": error})
    actual_node_id = data.get("node", {}).get("node_id")
    if expected_node_id is not None and actual_node_id != expected_node_id:
        failures.append(
            {
                "path": rel(path),
                "error": "evidence_node_id_mismatch",
                "expected_node_id": expected_node_id,
                "actual_node_id": actual_node_id,
            }
        )
    if known_node_ids is not None and actual_node_id not in known_node_ids:
        failures.append(
            {
                "path": rel(path),
                "node_id": actual_node_id,
                "error": "evidence_node_id_not_in_plan_graph",
                "plan_graph": "Plans/plan_graph.json",
            }
        )
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
    known_node_ids, graph_failures = plan_graph_node_ids()
    failures.extend(graph_failures)
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
        failures.extend(validate_evidence_file(path, schema, known_node_ids=known_node_ids))
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
    known_node_ids = {str(node_id) for node_id in node_ids if isinstance(node_id, str)}
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
                failures.extend(
                    validate_evidence_file(
                        evidence_path,
                        evidence_schema,
                        known_node_ids=known_node_ids,
                        expected_node_id=str(node_id) if isinstance(node_id, str) else None,
                    )
                )
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
    timeout_seconds = int(getattr(args, "subcheck_timeout_seconds", 0) or 0)
    try:
        proc = subprocess.run(
            [sys.executable, "scripts/pm-shard-plans.py", "--check", "--report", report_path],
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=timeout_seconds if timeout_seconds > 0 else None,
        )
    except subprocess.TimeoutExpired as exc:
        if temp_path is not None:
            temp_path.unlink(missing_ok=True)
        return report_status(
            "check-shards",
            [
                {
                    "error": "subprocess_timeout",
                    "timeout_seconds": timeout_seconds,
                    "stdout_excerpt": (exc.stdout or "")[-4000:] if isinstance(exc.stdout, str) else "",
                    "stderr_excerpt": (exc.stderr or "")[-4000:] if isinstance(exc.stderr, str) else "",
                }
            ],
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


def cmd_lint_path_refs(args: argparse.Namespace) -> dict[str, Any]:
    failures: list[dict[str, Any]] = []
    if not PATH_REFERENCE_REGISTRY.exists():
        failures.append({"path": rel(PATH_REFERENCE_REGISTRY), "error": "missing_path_reference_registry"})
        return report_status("lint-path-refs", failures)
    if not PATH_REFERENCE_REGISTRY_SCHEMA.exists():
        failures.append({"path": rel(PATH_REFERENCE_REGISTRY_SCHEMA), "error": "missing_path_reference_registry_schema"})
        return report_status("lint-path-refs", failures)

    for error in validate_against_schema(PATH_REFERENCE_REGISTRY, PATH_REFERENCE_REGISTRY_SCHEMA):
        failures.append({"path": rel(PATH_REFERENCE_REGISTRY), "error": error})
    if failures:
        return report_status("lint-path-refs", failures)

    registry = load_json(PATH_REFERENCE_REGISTRY)
    registry_rows = registry.get("classifications", [])
    seen: set[str] = set()
    for index, row in enumerate(registry_rows, 1):
        raw_ref = row.get("raw_ref")
        classification = row.get("classification")
        surface_type = row.get("surface_type")
        match_kind = row.get("match_kind")
        if raw_ref in seen:
            failures.append({"path": rel(PATH_REFERENCE_REGISTRY), "row": index, "raw_ref": raw_ref, "error": "duplicate_raw_ref"})
        seen.add(str(raw_ref))

        canonical_route = row.get("canonical_route")
        if isinstance(canonical_route, str) and canonical_route.startswith("Plans/"):
            route_path, route_error = exact_path(canonical_route)
            if route_error:
                failures.append({
                    "path": rel(PATH_REFERENCE_REGISTRY),
                    "row": index,
                    "canonical_route": canonical_route,
                    **ref_failure(route_error, "canonical_route"),
                })
            elif route_path is not None and not route_path.exists():
                failures.append({"path": rel(PATH_REFERENCE_REGISTRY), "row": index, "canonical_route": canonical_route, "error": "missing_canonical_route"})

        for evidence_ref in row.get("evidence_refs", []):
            if not isinstance(evidence_ref, str) or not evidence_ref.startswith(("Plans/", "AGENTS.md", "Concepts/")):
                continue
            evidence_path, evidence_error = exact_path(evidence_ref)
            if evidence_error:
                failures.append({
                    "path": rel(PATH_REFERENCE_REGISTRY),
                    "row": index,
                    "evidence_ref": evidence_ref,
                    **ref_failure(evidence_error, "evidence_ref"),
                })
            elif evidence_path is not None and not evidence_path.exists():
                failures.append({"path": rel(PATH_REFERENCE_REGISTRY), "row": index, "evidence_ref": evidence_ref, "error": "missing_evidence_ref"})

        if classification == "live_target":
            target_path, target_error = exact_path(str(raw_ref))
            if target_error:
                failures.append({"path": rel(PATH_REFERENCE_REGISTRY), "row": index, "raw_ref": raw_ref, **ref_failure(target_error, "raw_ref")})
            elif target_path is not None and not target_path.exists():
                failures.append({"path": rel(PATH_REFERENCE_REGISTRY), "row": index, "raw_ref": raw_ref, "error": "missing_live_target"})
        if classification == "typo" and not row.get("replacement_ref"):
            failures.append({"path": rel(PATH_REFERENCE_REGISTRY), "row": index, "raw_ref": raw_ref, "error": "typo_missing_replacement_ref"})
        if classification == "schema_to_materialize" and not row.get("materialization_pattern"):
            failures.append({"path": rel(PATH_REFERENCE_REGISTRY), "row": index, "raw_ref": raw_ref, "error": "schema_to_materialize_missing_pattern"})
        if surface_type == "schema_to_materialize" and not row.get("materialization_pattern"):
            failures.append({"path": rel(PATH_REFERENCE_REGISTRY), "row": index, "raw_ref": raw_ref, "error": "surface_schema_to_materialize_missing_pattern"})
        if match_kind == "doc_anchor" and not row.get("replacement_ref"):
            failures.append({"path": rel(PATH_REFERENCE_REGISTRY), "row": index, "raw_ref": raw_ref, "error": "doc_anchor_missing_replacement_ref"})

    implementation_surface_count = 0
    registry_typed_surface_count = 0
    concrete_surface_count = 0
    if PLAN_UNITS_INDEX.exists():
        with PLAN_UNITS_INDEX.open("r", encoding="utf-8") as handle:
            for line_number, line in enumerate(handle, 1):
                if not line.strip():
                    continue
                unit = json.loads(line)
                for surface in unit.get("implementation_surfaces", []) or []:
                    if not isinstance(surface, str) or not surface:
                        failures.append({
                            "path": rel(PLAN_UNITS_INDEX),
                            "line": line_number,
                            "plan_unit_id": unit.get("plan_unit_id"),
                            "error": "implementation_surface_not_string",
                        })
                        continue
                    implementation_surface_count += 1
                    matching_row = next((row for row in registry_rows if registry_ref_matches(surface, row)), None)
                    if matching_row:
                        registry_typed_surface_count += 1
                        continue
                    target_path, target_error = exact_path(surface)
                    if target_error:
                        failures.append({
                            "path": rel(PLAN_UNITS_INDEX),
                            "line": line_number,
                            "plan_unit_id": unit.get("plan_unit_id"),
                            "implementation_surface": surface,
                            "error": "implementation_surface_missing_or_untyped",
                            "surface_error": target_error.get("error"),
                        })
                    elif target_path is not None and not target_path.exists():
                        failures.append({
                            "path": rel(PLAN_UNITS_INDEX),
                            "line": line_number,
                            "plan_unit_id": unit.get("plan_unit_id"),
                            "implementation_surface": surface,
                            "error": "implementation_surface_missing_path",
                        })
                    else:
                        concrete_surface_count += 1

    return report_status(
        "lint-path-refs",
        failures,
        classifications_checked=len(registry_rows),
        implementation_surfaces_checked=implementation_surface_count,
        implementation_surfaces_registry_typed=registry_typed_surface_count,
        implementation_surfaces_concrete=concrete_surface_count,
    )


def iter_schema_dicts(value: Any, path: str = "$") -> list[tuple[str, dict[str, Any]]]:
    found: list[tuple[str, dict[str, Any]]] = []
    if isinstance(value, dict):
        found.append((path, value))
        for key, child in value.items():
            child_path = f"{path}.{key}"
            found.extend(iter_schema_dicts(child, child_path))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            found.extend(iter_schema_dicts(child, f"{path}[{index}]"))
    return found


def cmd_validate_plans_to_code_handoff_schema(args: argparse.Namespace) -> dict[str, Any]:
    schema_path = PLANS / "plans_to_code_handoff.schema.json"
    failures: list[dict[str, Any]] = []
    try:
        schema = load_json(schema_path)
    except Exception as exc:  # noqa: BLE001
        return report_status("validate-plans-to-code-handoff-schema", [{"path": rel(schema_path), "error": str(exc)}])

    if schema.get("$schema") != "https://json-schema.org/draft/2020-12/schema":
        failures.append({"path": rel(schema_path), "error": "schema_not_draft_2020_12"})
    if schema.get("additionalProperties") is not False:
        failures.append({"path": rel(schema_path), "error": "top_level_not_strict"})
    for key in ["schema_id", "artifact_kind", "payload"]:
        if key not in schema.get("required", []):
            failures.append({"path": rel(schema_path), "error": "missing_top_level_required_key", "key": key})

    defs = schema.get("$defs", {})
    kinds = defs.get("artifact_kind", {}).get("enum", [])
    if not isinstance(kinds, list) or not kinds:
        failures.append({"path": rel(schema_path), "error": "missing_artifact_kind_enum"})
        kinds = []
    if len(kinds) != len(set(kinds)):
        failures.append({"path": rel(schema_path), "error": "duplicate_artifact_kind"})

    expected_kinds = {
        "handoff_matrix",
        "handoff_row",
        "plan_compile_run",
        "stage_card",
        "compile_worklist",
        "node_seed_candidate",
        "node_seed_review",
        "workgraph_draft",
        "worknode_request",
        "compiler_model_routing",
        "codex_work_package",
        "codex_external_gui_agent_request",
        "plan_compile_receipt",
        "test_capability_report",
        "test_harness_probe_report",
        "test_strategy",
        "test_case",
        "test_run_receipt",
        "visual_evidence",
        "source_control_receipt",
        "source_control_preflight_receipt",
        "safe_point_receipt",
        "worknode_dispatch_receipt",
        "worknode_change_receipt",
        "worknode_completion_receipt",
        "auditor_cycle_report",
        "auditor_verification_receipt",
        "repair_attempt_receipt",
        "validation_pass_report",
        "merge_or_promotion_receipt",
        "source_control_finalization_receipt",
        "model_resolution_receipt",
        "executor_intake_report",
        "goal_completion_receipt",
    }
    for kind in sorted(expected_kinds - set(kinds)):
        failures.append({"path": rel(schema_path), "error": "missing_expected_artifact_kind", "artifact_kind": kind})

    branch_map: dict[str, str | None] = {}
    duplicate_branches: set[str] = set()
    for item in schema.get("allOf", []):
        if not isinstance(item, dict):
            continue
        const = item.get("if", {}).get("properties", {}).get("artifact_kind", {}).get("const")
        ref = item.get("then", {}).get("properties", {}).get("payload", {}).get("$ref")
        if not isinstance(const, str):
            continue
        if const in branch_map:
            duplicate_branches.add(const)
        branch_map[const] = ref

    for kind in kinds:
        if kind not in defs:
            failures.append({"path": rel(schema_path), "error": "missing_payload_def", "artifact_kind": kind})
            continue
        payload_def = defs[kind]
        if not isinstance(payload_def, dict) or payload_def.get("type") != "object":
            failures.append({"path": rel(schema_path), "error": "payload_def_not_object", "artifact_kind": kind})
            continue
        if payload_def.get("additionalProperties") is not False:
            failures.append({"path": rel(schema_path), "error": "payload_def_not_strict", "artifact_kind": kind})
        required = payload_def.get("required", [])
        properties = payload_def.get("properties", {})
        if not isinstance(required, list) or not required:
            failures.append({"path": rel(schema_path), "error": "payload_def_missing_required", "artifact_kind": kind})
        if not isinstance(properties, dict) or not properties:
            failures.append({"path": rel(schema_path), "error": "payload_def_missing_properties", "artifact_kind": kind})
        for required_key in required if isinstance(required, list) else []:
            if required_key not in properties:
                failures.append(
                    {
                        "path": rel(schema_path),
                        "error": "required_key_missing_property",
                        "artifact_kind": kind,
                        "key": required_key,
                    }
                )
        expected_ref = f"#/$defs/{kind}"
        if branch_map.get(kind) != expected_ref:
            failures.append(
                {
                    "path": rel(schema_path),
                    "error": "missing_or_bad_discriminator_branch",
                    "artifact_kind": kind,
                    "expected_ref": expected_ref,
                    "actual_ref": branch_map.get(kind),
                }
            )

    for kind in sorted(set(branch_map) - set(kinds)):
        failures.append({"path": rel(schema_path), "error": "discriminator_branch_without_enum", "artifact_kind": kind})
    for kind in sorted(duplicate_branches):
        failures.append({"path": rel(schema_path), "error": "duplicate_discriminator_branch", "artifact_kind": kind})

    handoff_required = {
        "row_id",
        "transition",
        "source_artifact",
        "destination_artifact",
        "producer",
        "consumer",
        "owner",
        "validator",
        "receipt",
        "schema_payload",
        "retry_route",
        "rollback_route",
        "user_escalation_condition",
        "evidence_refs",
        "plan_unit_refs",
    }
    handoff_def = defs.get("handoff_row", {})
    for key in sorted(handoff_required - set(handoff_def.get("required", []))):
        failures.append({"path": rel(schema_path), "error": "handoff_row_missing_required_key", "key": key})
    matrix_def = defs.get("handoff_matrix", {})
    for key in ["matrix_id", "source_ledger_id", "source_plan_unit_ids", "rows", "schema_contract_validation", "status"]:
        if key not in matrix_def.get("required", []):
            failures.append({"path": rel(schema_path), "error": "handoff_matrix_missing_required_key", "key": key})

    for kind in [
        "plan_compile_receipt",
        "test_run_receipt",
        "source_control_receipt",
        "source_control_preflight_receipt",
        "safe_point_receipt",
        "worknode_dispatch_receipt",
        "worknode_change_receipt",
        "worknode_completion_receipt",
        "auditor_cycle_report",
        "auditor_verification_receipt",
        "repair_attempt_receipt",
        "validation_pass_report",
        "merge_or_promotion_receipt",
        "source_control_finalization_receipt",
        "model_resolution_receipt",
        "executor_intake_report",
        "goal_completion_receipt",
    ]:
        if "handoff" not in defs.get(kind, {}).get("required", []):
            failures.append({"path": rel(schema_path), "error": "receipt_payload_missing_handoff_key", "artifact_kind": kind})

    validation_alias = defs.get("validation_pass_report", {})
    if validation_alias.get("properties", {}).get("legacy_alias_for", {}).get("const") != "auditor_cycle_report":
        failures.append({"path": rel(schema_path), "error": "validation_pass_report_not_aliasing_auditor_cycle_report"})
    if validation_alias.get("properties", {}).get("compatibility_only", {}).get("const") is not True:
        failures.append({"path": rel(schema_path), "error": "validation_pass_report_not_compatibility_only"})

    def def_props(def_name: str) -> dict[str, Any]:
        payload_def = defs.get(def_name, {})
        properties = payload_def.get("properties", {})
        return properties if isinstance(properties, dict) else {}

    def require_schema_keys(def_name: str, keys: list[str], error: str) -> None:
        required = defs.get(def_name, {}).get("required", [])
        properties = def_props(def_name)
        for key in keys:
            if key not in required:
                failures.append({"path": rel(schema_path), "error": error, "def": def_name, "key": key})
            if key not in properties:
                failures.append({"path": rel(schema_path), "error": "required_strict_field_missing_property", "def": def_name, "key": key})

    def expect_prop_ref(def_name: str, key: str, expected_ref: str, error: str) -> None:
        actual = def_props(def_name).get(key, {}).get("$ref")
        if actual != expected_ref:
            failures.append(
                {
                    "path": rel(schema_path),
                    "error": error,
                    "def": def_name,
                    "key": key,
                    "expected_ref": expected_ref,
                    "actual_ref": actual,
                }
            )

    def expect_array_items_ref(def_name: str, key: str, expected_ref: str, error: str) -> None:
        actual = def_props(def_name).get(key, {}).get("items", {}).get("$ref")
        if actual != expected_ref:
            failures.append(
                {
                    "path": rel(schema_path),
                    "error": error,
                    "def": def_name,
                    "key": key,
                    "expected_ref": expected_ref,
                    "actual_ref": actual,
                }
            )

    def expect_nullable_prop_ref(def_name: str, key: str, expected_ref: str, error: str) -> None:
        prop = def_props(def_name).get(key, {})
        any_of = prop.get("anyOf")
        refs = {item.get("$ref") for item in any_of if isinstance(item, dict)} if isinstance(any_of, list) else set()
        has_null = any(isinstance(item, dict) and item.get("type") == "null" for item in any_of) if isinstance(any_of, list) else False
        if expected_ref not in refs or not has_null:
            failures.append(
                {
                    "path": rel(schema_path),
                    "error": error,
                    "def": def_name,
                    "key": key,
                    "expected_ref": expected_ref,
                    "actual": prop,
                }
            )

    def expect_enum_def(def_name: str, values: set[str], error: str) -> None:
        payload_def = defs.get(def_name, {})
        actual = payload_def.get("enum", [])
        if payload_def.get("type") != "string" or set(actual) != values:
            failures.append(
                {
                    "path": rel(schema_path),
                    "error": error,
                    "def": def_name,
                    "expected": sorted(values),
                    "actual": actual,
                }
            )

    def expect_enum_accepts(def_name: str, value: str, error: str) -> None:
        payload_def = defs.get(def_name, {})
        actual = payload_def.get("enum", [])
        if value not in actual:
            failures.append(
                {
                    "path": rel(schema_path),
                    "error": error,
                    "def": def_name,
                    "value": value,
                    "actual": actual,
                }
            )

    def expect_enum_rejects(def_name: str, value: str, error: str) -> None:
        payload_def = defs.get(def_name, {})
        actual = payload_def.get("enum", [])
        if value in actual:
            failures.append(
                {
                    "path": rel(schema_path),
                    "error": error,
                    "def": def_name,
                    "value": value,
                    "actual": actual,
                }
            )

    def expect_route_object_def(def_name: str, route_kinds: set[str], terminal_kinds: set[str], error: str) -> None:
        payload_def = defs.get(def_name, {})
        properties = payload_def.get("properties", {})
        required = set(payload_def.get("required", []))
        if payload_def.get("type") != "object" or payload_def.get("additionalProperties") is not False:
            failures.append({"path": rel(schema_path), "error": error, "def": def_name, "detail": "route_def_not_strict_object"})
            return
        for key in {"route_kind", "target_stage", "reason"} - required:
            failures.append({"path": rel(schema_path), "error": error, "def": def_name, "detail": "route_def_missing_required_key", "key": key})
        actual_kinds = set(properties.get("route_kind", {}).get("enum", []))
        if actual_kinds != route_kinds:
            failures.append(
                {
                    "path": rel(schema_path),
                    "error": error,
                    "def": def_name,
                    "detail": "route_kind_enum_drift",
                    "expected": sorted(route_kinds),
                    "actual": sorted(actual_kinds),
                }
            )
        target_any_of = properties.get("target_stage", {}).get("anyOf", [])
        target_refs = {item.get("$ref") for item in target_any_of if isinstance(item, dict)}
        target_has_null = any(isinstance(item, dict) and item.get("type") == "null" for item in target_any_of)
        if "#/$defs/stage_name" not in target_refs or not target_has_null:
            failures.append({"path": rel(schema_path), "error": error, "def": def_name, "detail": "target_stage_not_stage_name_or_null"})
        if properties.get("reason", {}).get("type") != "string" or properties.get("reason", {}).get("minLength") != 1:
            failures.append({"path": rel(schema_path), "error": error, "def": def_name, "detail": "reason_not_required_non_empty_string"})
        if not isinstance(payload_def.get("allOf"), list) or len(payload_def.get("allOf", [])) < 2:
            failures.append({"path": rel(schema_path), "error": error, "def": def_name, "detail": "route_def_missing_target_stage_conditionals"})
        nonterminal_kinds = route_kinds - terminal_kinds
        for conditional in payload_def.get("allOf", []):
            if not isinstance(conditional, dict):
                continue
            kind_values = set(conditional.get("if", {}).get("properties", {}).get("route_kind", {}).get("enum", []))
            target_schema = conditional.get("then", {}).get("properties", {}).get("target_stage", {})
            if kind_values and kind_values <= terminal_kinds and target_schema.get("type") != "null":
                failures.append({"path": rel(schema_path), "error": error, "def": def_name, "detail": "terminal_route_does_not_force_null", "route_kinds": sorted(kind_values)})
            if kind_values and kind_values <= nonterminal_kinds and target_schema.get("$ref") != "#/$defs/stage_name":
                failures.append({"path": rel(schema_path), "error": error, "def": def_name, "detail": "nonterminal_route_does_not_force_stage_name", "route_kinds": sorted(kind_values)})

    stage_values = set(defs.get("stage_name", {}).get("enum", []))
    expected_stage_values = {
        "preflight_currentness",
        "scope_selection",
        "planunit_normalization",
        "test_repository_discovery",
        "typed_dependency_analysis",
        "implementation_surface_mapping",
        "work_risk_classification",
        "nodeseed_candidate_drafting",
        "split_merge_sizing",
        "candidate_review",
        "workgraph_construction",
        "worknode_request_construction",
        "final_compile_audit_repair",
        "executor_handoff_certification",
        "activation_transaction",
        "orchestrator_projection",
    }
    if stage_values != expected_stage_values:
        failures.append(
            {
                "path": rel(schema_path),
                "error": "plan_compile_stage_registry_drift",
                "expected": sorted(expected_stage_values),
                "actual": sorted(stage_values),
            }
        )

    route_policies = {
        "stage_success_route": {
            "kinds": {"next_stage", "certify_stage", "handoff_ready", "parent_writeback"},
            "terminal": {"handoff_ready", "parent_writeback"},
        },
        "stage_blocked_route": {
            "kinds": {"record_blocker", "request_parent_adjudication", "escalate_authority_boundary", "pause_for_repair", "critical_block"},
            "terminal": {"request_parent_adjudication", "escalate_authority_boundary", "critical_block"},
        },
        "compile_wave_retry_route": {
            "kinds": {"retry_same_assignment", "split_assignment", "resume_from_checkpoint", "return_to_parent", "critical_block"},
            "terminal": {"return_to_parent", "critical_block"},
        },
        "compile_worklist_blocked_route": {
            "kinds": {"record_blocker", "regenerate_worklist", "request_parent_adjudication", "pause_for_repair", "critical_block"},
            "terminal": {"request_parent_adjudication", "critical_block"},
        },
    }

    def route_fixture_accepts(def_name: str, value: Any) -> bool:
        policy = route_policies[def_name]
        if not isinstance(value, dict):
            return False
        if not {"route_kind", "target_stage", "reason"}.issubset(value):
            return False
        if set(value) - {"route_kind", "target_stage", "reason", "resume_ref"}:
            return False
        if not isinstance(value.get("reason"), str) or not value["reason"].strip():
            return False
        route_kind = value.get("route_kind")
        if route_kind not in policy["kinds"]:
            return False
        target_stage = value.get("target_stage")
        if route_kind in policy["terminal"]:
            return target_stage is None
        return isinstance(target_stage, str) and target_stage in stage_values

    def expect_route_fixture(def_name: str, value: Any, should_accept: bool, error: str) -> None:
        accepted = route_fixture_accepts(def_name, value)
        if accepted != should_accept:
            failures.append(
                {
                    "path": rel(schema_path),
                    "error": error,
                    "def": def_name,
                    "fixture": value,
                    "expected_acceptance": should_accept,
                    "actual_acceptance": accepted,
                }
            )

    def expect_required_def(def_name: str) -> None:
        payload_def = defs.get(def_name)
        if not isinstance(payload_def, dict):
            failures.append({"path": rel(schema_path), "error": "missing_strict_helper_def", "def": def_name})
            return
        if payload_def.get("type") != "object" or payload_def.get("additionalProperties") is not False:
            failures.append({"path": rel(schema_path), "error": "strict_helper_def_not_strict_object", "def": def_name})
        if not payload_def.get("required"):
            failures.append({"path": rel(schema_path), "error": "strict_helper_def_missing_required", "def": def_name})

    strict_helper_defs = [
        "cursor",
        "hash_snapshot",
        "blocker",
        "capability_requirement",
        "capability_check",
        "authority",
        "sizing",
        "item_boundaries",
        "compile_parallelism_policy",
        "compile_wave_contract",
        "compile_wave_assignment_receipt",
        "compile_wave_completion_receipt",
        "compile_worklist_item",
        "test_oracle",
        "source_control_context",
        "auditor_finding",
        "repair_record",
        "repair_strategy",
        "validator_outcome",
        "risk_record",
    ]
    for helper_def in strict_helper_defs:
        expect_required_def(helper_def)

    require_schema_keys("plan_compile_run", ["current_state", "receipts", "compile_wave_contracts"], "plan_compile_run_missing_wave_or_receipt_field")
    expect_prop_ref("plan_compile_run", "cursor", "#/$defs/cursor", "plan_compile_run_cursor_not_strict")
    expect_nullable_prop_ref("plan_compile_run", "last_green_stage", "#/$defs/stage_name", "plan_compile_run_last_green_stage_not_stage_name_or_null")
    expect_nullable_prop_ref("plan_compile_run", "next_required_stage", "#/$defs/stage_name", "plan_compile_run_next_required_stage_not_stage_name_or_null")
    expect_prop_ref("plan_compile_run", "last_green_hashes", "#/$defs/hash_snapshot", "plan_compile_run_hashes_not_strict")
    expect_array_items_ref("plan_compile_run", "blockers", "#/$defs/blocker", "plan_compile_run_blockers_not_strict")
    expect_array_items_ref("plan_compile_run", "compile_wave_contracts", "#/$defs/compile_wave_contract", "plan_compile_run_waves_not_strict")
    plan_compile_def = defs.get("plan_compile_run", {})
    plan_compile_props = plan_compile_def.get("properties", {}) if isinstance(plan_compile_def, dict) else {}
    if plan_compile_props.get("automatic_launch_enabled", {}).get("type") != "boolean":
        failures.append({"path": rel(schema_path), "error": "plan_compile_run_automatic_launch_not_mode_split_boolean"})
    if "native_plan_wizard_launch_enabled" in plan_compile_props:
        failures.append({"path": rel(schema_path), "error": "plan_compile_run_retired_plan_wizard_field_active"})
    if plan_compile_props.get("planning_wizard_launch_enabled", {}).get("type") != "boolean":
        failures.append({"path": rel(schema_path), "error": "plan_compile_run_planning_wizard_launch_not_mode_split_boolean"})
    if plan_compile_props.get("codex_bootstrap_launch_enabled", {}).get("const") is not False:
        failures.append({"path": rel(schema_path), "error": "plan_compile_run_codex_bootstrap_launch_not_const_false"})

    def plan_compile_mode_properties(mode: str) -> dict[str, Any]:
        for conditional in plan_compile_def.get("allOf", []) if isinstance(plan_compile_def, dict) else []:
            if not isinstance(conditional, dict):
                continue
            const = conditional.get("if", {}).get("properties", {}).get("contract_mode", {}).get("const")
            if const == mode:
                props = conditional.get("then", {}).get("properties", {})
                return props if isinstance(props, dict) else {}
        return {}

    design_only_props = plan_compile_mode_properties("design_only")
    if not design_only_props:
        failures.append({"path": rel(schema_path), "error": "plan_compile_run_missing_design_only_mode_branch"})
    else:
        expected_design_only = {
            "launch_policy": "disabled",
            "launch_source": "codex_bootstrap",
            "runtime_adapter": "codex_bootstrap_adapter",
            "status": "design_only_disabled",
            "automatic_launch_enabled": False,
            "planning_wizard_launch_enabled": False,
            "codex_bootstrap_launch_enabled": False,
        }
        for key, expected in expected_design_only.items():
            if design_only_props.get(key, {}).get("const") != expected:
                failures.append({"path": rel(schema_path), "error": "plan_compile_run_design_only_branch_drift", "key": key})
        if design_only_props.get("runtime_enablement_ref", {}).get("type") != "null":
            failures.append({"path": rel(schema_path), "error": "plan_compile_run_design_only_enablement_ref_not_null"})
        if design_only_props.get("runtime_policy_snapshot_ref", {}).get("type") != "null":
            failures.append({"path": rel(schema_path), "error": "plan_compile_run_design_only_policy_ref_not_null"})

    native_runtime_props = plan_compile_mode_properties("native_runtime")
    if not native_runtime_props:
        failures.append({"path": rel(schema_path), "error": "plan_compile_run_missing_native_runtime_mode_branch"})
    else:
        expected_native_runtime = {
            "launch_policy": "automatic_after_approval",
            "launch_source": "native_planning_wizard",
            "runtime_adapter": "native_puppet_master_adapter",
            "automatic_launch_enabled": True,
            "planning_wizard_launch_enabled": True,
            "codex_bootstrap_launch_enabled": False,
        }
        for key, expected in expected_native_runtime.items():
            if native_runtime_props.get(key, {}).get("const") != expected:
                failures.append({"path": rel(schema_path), "error": "plan_compile_run_native_runtime_branch_drift", "key": key})
        if native_runtime_props.get("runtime_enablement_ref", {}).get("$ref") != "#/$defs/ref":
            failures.append({"path": rel(schema_path), "error": "plan_compile_run_native_enablement_ref_not_required"})
        if native_runtime_props.get("runtime_policy_snapshot_ref", {}).get("$ref") != "#/$defs/ref":
            failures.append({"path": rel(schema_path), "error": "plan_compile_run_native_policy_ref_not_required"})
        native_statuses = set(native_runtime_props.get("status", {}).get("enum", []))
        expected_statuses = {"preflight", "running", "blocked", "ready_for_executor_intake", "cancelled", "complete"}
        if native_statuses != expected_statuses:
            failures.append(
                {
                    "path": rel(schema_path),
                    "error": "plan_compile_run_native_status_enum_drift",
                    "expected": sorted(expected_statuses),
                    "actual": sorted(native_statuses),
                }
            )

    require_schema_keys("stage_card", ["stage_id", "assignment_contract", "parent_writeback_policy"], "stage_card_missing_assignment_contract")
    expect_prop_ref("stage_card", "stage_id", "#/$defs/stage_name", "stage_card_stage_id_not_strict")
    expect_prop_ref("stage_card", "item_boundaries", "#/$defs/item_boundaries", "stage_card_item_boundaries_not_strict")
    expect_prop_ref("stage_card", "assignment_contract", "#/$defs/compile_wave_contract", "stage_card_assignment_contract_not_strict")
    expect_prop_ref("stage_card", "success_route", "#/$defs/stage_success_route", "stage_card_success_route_not_strict")
    expect_prop_ref("stage_card", "blocked_route", "#/$defs/stage_blocked_route", "stage_card_blocked_route_not_strict")
    require_schema_keys("compile_worklist", ["parallelism_policy", "wave_assignments", "blocked_route"], "compile_worklist_missing_route_or_wave_assignments")
    expect_array_items_ref("compile_worklist", "items", "#/$defs/compile_worklist_item", "compile_worklist_items_not_strict")
    expect_prop_ref("compile_worklist", "parallelism_policy", "#/$defs/compile_parallelism_policy", "compile_worklist_parallelism_policy_not_strict")
    expect_prop_ref("compile_worklist", "blocked_route", "#/$defs/compile_worklist_blocked_route", "compile_worklist_blocked_route_not_strict")
    expect_prop_ref("compile_wave_contract", "retry_route", "#/$defs/compile_wave_retry_route", "compile_wave_retry_route_not_strict")
    expect_prop_ref("compile_wave_contract", "assignment_receipt", "#/$defs/compile_wave_assignment_receipt", "compile_wave_assignment_receipt_not_strict")
    require_schema_keys("node_seed_review", ["reviewer_role"], "node_seed_review_missing_reviewer_role")
    expect_prop_ref("node_seed_review", "decision", "#/$defs/node_seed_review_decision", "node_seed_review_decision_not_enum")
    expect_prop_ref("node_seed_review", "reviewer_role", "#/$defs/node_seed_reviewer_role", "node_seed_reviewer_role_not_enum")
    for def_name, policy in route_policies.items():
        expect_route_object_def(def_name, policy["kinds"], policy["terminal"], "strict_route_object_def_invalid")
    expect_enum_def(
        "node_seed_review_decision",
        {"approve_candidate", "changes_required", "reject_candidate", "split_candidate", "merge_candidate", "block_on_authority"},
        "node_seed_review_decision_enum_drift",
    )
    expect_enum_def(
        "node_seed_reviewer_role",
        {"parent_compiler", "auditor", "owner_adjudicator", "capability_reviewer"},
        "node_seed_reviewer_role_enum_drift",
    )
    for def_name, accepted, rejected in [
        ("node_seed_review_decision", "changes_required", "maybe"),
        ("node_seed_reviewer_role", "owner_adjudicator", "reviewer"),
    ]:
        expect_enum_accepts(def_name, accepted, "strict_route_fixture_positive_failed")
        expect_enum_rejects(def_name, rejected, "strict_route_fixture_negative_failed")
    for def_name, accepted, rejected in [
        (
            "stage_success_route",
            {"route_kind": "next_stage", "target_stage": "scope_selection", "reason": "advance to scoped selection"},
            "freeform_next_step",
        ),
        (
            "stage_success_route",
            {"route_kind": "handoff_ready", "target_stage": None, "reason": "terminal handoff"},
            {"route_kind": "handoff_ready", "target_stage": "complete", "reason": "terminal routes cannot name a stage"},
        ),
        (
            "stage_blocked_route",
            {"route_kind": "pause_for_repair", "target_stage": "preflight_currentness", "reason": "repair before retry"},
            {"route_kind": "pause_for_repair", "target_stage": None, "reason": "nonterminal route needs a stage"},
        ),
        (
            "stage_blocked_route",
            {"route_kind": "critical_block", "target_stage": None, "reason": "terminal block"},
            {"route_kind": "critical_block", "target_stage": "blocked", "reason": "terminal routes cannot name a stage"},
        ),
        (
            "compile_wave_retry_route",
            {"route_kind": "resume_from_checkpoint", "target_stage": "planunit_normalization", "reason": "resume the wave at the exact stage"},
            {"route_kind": "retry_same_assignment", "target_stage": "not_a_stage", "reason": "invalid stage id"},
        ),
        (
            "compile_worklist_blocked_route",
            {"route_kind": "regenerate_worklist", "target_stage": "scope_selection", "reason": "regenerate from selected scope"},
            {"route_kind": "request_parent_adjudication", "target_stage": "blocked", "reason": "terminal parent route must be null"},
        ),
    ]:
        expect_route_fixture(def_name, accepted, True, "strict_route_fixture_positive_failed")
        expect_route_fixture(def_name, rejected, False, "strict_route_fixture_negative_failed")

    classification_refs = {
        "work_type": "#/$defs/work_type",
        "effort_class": "#/$defs/effort_class",
        "reasoning_tier": "#/$defs/reasoning_tier",
        "risk_class": "#/$defs/risk_class",
        "capability_lane": "#/$defs/capability_lane",
        "authority": "#/$defs/authority",
    }
    for def_name in ["node_seed_candidate", "worknode_request"]:
        require_schema_keys(def_name, ["capability_requirements"], "candidate_or_request_missing_capability_requirements")
        expect_array_items_ref(def_name, "capability_requirements", "#/$defs/capability_requirement", "capability_requirements_not_strict")
        for key, expected_ref in classification_refs.items():
            expect_prop_ref(def_name, key, expected_ref, "classification_field_not_enum_or_strict_shape")
    expect_prop_ref("node_seed_candidate", "sizing", "#/$defs/sizing", "node_seed_sizing_not_strict")
    expect_array_items_ref("node_seed_candidate", "blockers", "#/$defs/blocker", "node_seed_blockers_not_strict")
    for key, expected_ref in {
        "context_size": "#/$defs/context_size",
        "validation_cost": "#/$defs/validation_cost",
        "authority_risk": "#/$defs/authority_risk",
        "user_visible_risk": "#/$defs/user_visible_risk",
    }.items():
        expect_prop_ref("worknode_request", key, expected_ref, "worknode_request_routing_field_not_enum")

    require_schema_keys(
        "ordering",
        ["manual_priority", "required_before_start", "required_after_start", "required_before_completion", "required_after_completion"],
        "ordering_missing_manual_priority_or_relationships",
    )
    for key, expected_ref in {
        "build_phase": "#/$defs/build_phase",
        "dependency_type": "#/$defs/dependency_type",
        "scheduler_lane": "#/$defs/scheduler_lane",
    }.items():
        expect_prop_ref("ordering", key, expected_ref, "ordering_field_not_enum")

    for def_name in ["compiler_model_routing", "model_resolution_receipt"]:
        expect_array_items_ref(def_name, "capability_checks", "#/$defs/capability_check", "capability_checks_not_strict")
        expect_prop_ref(def_name, "requested_lane", "#/$defs/capability_lane", "model_requested_lane_not_enum")
        expect_prop_ref(def_name, "requested_model_profile", "#/$defs/model_profile", "requested_model_profile_not_enum")
        expect_prop_ref(def_name, "effective_model_profile", "#/$defs/model_profile", "effective_model_profile_not_enum")

    require_schema_keys("codex_external_gui_agent_request", ["provider_kind", "provider_id"], "external_gui_agent_missing_provider_fields")

    require_schema_keys("test_binding", ["reused_test_ids"], "test_binding_missing_reused_test_ids")
    expect_prop_ref("test_binding", "flake_policy", "#/$defs/flake_policy", "test_binding_flake_policy_not_enum")
    expect_prop_ref("test_binding", "test_gap_policy", "#/$defs/test_gap_policy", "test_binding_gap_policy_not_enum")
    require_schema_keys(
        "test_capability_report",
        [
            "automation_surface",
            "requires_browser",
            "requires_emulator",
            "requires_display",
            "requires_screenshot",
            "verification_command",
            "expected_artifacts",
            "flake_policy",
        ],
        "test_capability_report_missing_capability_boolean",
    )
    expect_array_items_ref("test_capability_report", "local_capabilities", "#/$defs/capability_requirement", "test_capability_local_capabilities_not_strict")
    expect_prop_ref("test_capability_report", "online_research", "#/$defs/online_research", "test_capability_online_research_not_strict")
    expect_array_items_ref("test_capability_report", "probes", "#/$defs/test_probe", "test_capability_probes_not_strict")
    require_schema_keys("test_strategy", ["reused_test_ids"], "test_strategy_missing_reused_test_ids")
    expect_array_items_ref("test_strategy", "required_capabilities", "#/$defs/capability_requirement", "test_strategy_required_capabilities_not_strict")
    expect_array_items_ref("test_strategy", "gap_blockers", "#/$defs/blocker", "test_strategy_gap_blockers_not_strict")
    expect_prop_ref("test_strategy", "test_level", "#/$defs/test_level", "test_strategy_level_not_enum")
    expect_array_items_ref("test_strategy", "oracles", "#/$defs/test_oracle", "test_strategy_oracles_not_strict")
    expect_prop_ref("test_case", "oracle", "#/$defs/test_oracle", "test_case_oracle_not_strict")
    require_schema_keys(
        "test_run_receipt",
        ["receipt_id", "test_strategy_ref", "test_case_refs", "generated_test_ids", "reused_test_ids"],
        "test_run_receipt_missing_test_provenance",
    )
    expect_prop_ref("test_run_receipt", "test_level", "#/$defs/test_level", "test_run_level_not_enum")
    expect_prop_ref("test_run_receipt", "automation_surface", "#/$defs/automation_surface", "test_run_surface_not_enum")

    source_control_chain_defs = [
        "source_control_receipt",
        "source_control_preflight_receipt",
        "safe_point_receipt",
        "worknode_dispatch_receipt",
        "worknode_change_receipt",
        "worknode_completion_receipt",
        "merge_or_promotion_receipt",
        "source_control_finalization_receipt",
    ]
    for def_name in source_control_chain_defs:
        require_schema_keys(def_name, ["source_control_context"], "source_control_chain_missing_context")
        expect_prop_ref(def_name, "source_control_context", "#/$defs/source_control_context", "source_control_context_not_strict")
    require_schema_keys(
        "source_control_receipt",
        ["branch_head_state", "owner_lane", "lease_state", "head_commit_oid", "changed_files", "conflict_refs", "rollback_ref"],
        "source_control_receipt_missing_lineage_field",
    )
    require_schema_keys(
        "source_control_preflight_receipt",
        ["branch_head_state", "owner_lane", "lease_state", "head_commit_oid", "changed_files", "conflict_refs", "rollback_ref"],
        "source_control_preflight_missing_lineage_field",
    )
    require_schema_keys("safe_point_receipt", ["rollback_available", "restore_command_or_action"], "safe_point_receipt_missing_rollback_fields")

    for def_name, key in [
        ("node_seed_review", "findings"),
        ("auditor_cycle_report", "findings"),
        ("auditor_cycle_report", "unresolved_findings"),
        ("worknode_completion_receipt", "unresolved_findings"),
    ]:
        expect_array_items_ref(def_name, key, "#/$defs/auditor_finding", "auditor_finding_array_not_strict")
    expect_array_items_ref("auditor_cycle_report", "repairs_applied", "#/$defs/repair_record", "auditor_repairs_not_strict")
    expect_prop_ref("repair_attempt_receipt", "repair_strategy", "#/$defs/repair_strategy", "repair_strategy_not_strict")
    expect_array_items_ref("executor_intake_report", "blockers", "#/$defs/blocker", "executor_intake_blockers_not_strict")
    expect_array_items_ref("goal_completion_receipt", "validator_outcomes", "#/$defs/validator_outcome", "goal_validator_outcomes_not_strict")
    expect_array_items_ref("goal_completion_receipt", "unresolved_risks", "#/$defs/risk_record", "goal_unresolved_risks_not_strict")
    require_schema_keys("goal_completion_receipt", ["final_source_control_context"], "goal_completion_missing_final_source_control_context")
    expect_prop_ref("goal_completion_receipt", "final_source_control_context", "#/$defs/source_control_context", "goal_final_source_control_context_not_strict")
    if "unknown" in def_props("goal_completion_receipt").get("final_source_state", {}).get("enum", []):
        failures.append({"path": rel(schema_path), "error": "goal_completion_final_source_state_allows_unknown"})

    handoff_row_props = def_props("handoff_row")
    if handoff_row_props.get("row_id", {}).get("$ref") != "#/$defs/handoff_row_id":
        failures.append({"path": rel(schema_path), "error": "handoff_row_id_not_strict_h_enum"})
    if handoff_row_props.get("schema_payload", {}).get("items", {}).get("$ref") != "#/$defs/schema_payload_ref":
        failures.append({"path": rel(schema_path), "error": "handoff_schema_payload_not_strict_ref_array"})
    rows_prop = def_props("handoff_matrix").get("rows", {})
    if rows_prop.get("minItems") != 18 or rows_prop.get("maxItems") != 18:
        failures.append({"path": rel(schema_path), "error": "handoff_matrix_rows_not_exactly_h001_h018"})

    matrix_path = PLANS / "Plan_To_Node_Compilation.md"
    expected_rows = [f"H-{index:03d}" for index in range(1, 19)]
    matrix_rows: list[dict[str, Any]] = []
    try:
        matrix_text = matrix_path.read_text(encoding="utf-8")
        in_matrix = False
        for line in matrix_text.splitlines():
            if line.strip() == "#### Plans-To-Code Handoff Matrix Rows":
                in_matrix = True
                continue
            if not in_matrix:
                continue
            if line.startswith("ContractRef:"):
                break
            if not line.startswith("| H-"):
                continue
            cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
            if len(cells) < 15:
                failures.append({"path": rel(matrix_path), "error": "handoff_matrix_row_malformed", "line": line})
                continue
            matrix_rows.append({"row_id": cells[0], "schema_payload": cells[9]})
    except OSError as exc:
        failures.append({"path": rel(matrix_path), "error": "handoff_matrix_unreadable", "detail": str(exc)})
    row_ids = [row["row_id"] for row in matrix_rows]
    if row_ids != expected_rows:
        failures.append({"path": rel(matrix_path), "error": "handoff_matrix_rows_not_h001_to_h018_in_order", "actual": row_ids})
    schema_payload_defs = set(defs) | set(kinds)
    for row in matrix_rows:
        payload_tokens = [token.strip() for token in str(row["schema_payload"]).split(",") if token.strip()]
        if not payload_tokens:
            failures.append({"path": rel(matrix_path), "error": "handoff_matrix_row_missing_schema_payload", "row_id": row["row_id"]})
        for token in payload_tokens:
            if token not in schema_payload_defs:
                failures.append(
                    {
                        "path": rel(matrix_path),
                        "error": "handoff_matrix_schema_payload_ref_missing_def",
                        "row_id": row["row_id"],
                        "schema_payload": token,
                    }
                )

    for pointer, item in iter_schema_dicts(schema):
        if item.get("additionalProperties") is True:
            failures.append({"path": rel(schema_path), "error": "additional_properties_true", "pointer": pointer})
        if item.get("allOf") == []:
            failures.append({"path": rel(schema_path), "error": "empty_allOf", "pointer": pointer})

    return report_status(
        "validate-plans-to-code-handoff-schema",
        failures,
        artifact_kinds_checked=len(kinds),
        discriminator_branches_checked=len(branch_map),
    )


RUNTIME_ARTIFACT_TYPES = [
    "code_diff",
    "implementation_plan",
    "reasoning_summary",
    "validation_test",
    "screenshot",
    "evidence",
    "document",
    "restore_point",
    "browser_recording",
    "tool_llm_trace",
    "context_snapshot",
    "cost_usage",
    "hitl_approval",
    "failed_attempts",
    "subagent_lineage",
    "before_after_snapshot",
    "suggested_next_steps",
    "api_web_call",
    "artifact_version",
]

RUNTIME_ARTIFACT_REQUIRED_PAYLOAD_FIELDS = {
    "code_diff": ["changed_paths"],
    "implementation_plan": ["plan_ref"],
    "reasoning_summary": ["summary"],
    "validation_test": ["test_ids"],
    "screenshot": ["media_ref"],
    "evidence": ["evidence_kind"],
    "document": ["document_ref"],
    "restore_point": ["safe_point_id"],
    "browser_recording": ["browser_session_id"],
    "tool_llm_trace": ["trace_ref"],
    "context_snapshot": ["snapshot_ref"],
    "cost_usage": ["usage_event_ref", "reasoning_tokens"],
    "hitl_approval": ["approval_scope_key", "decision"],
    "failed_attempts": ["attempt_refs"],
    "subagent_lineage": ["parent_attempt_ref", "child_attempt_refs"],
    "before_after_snapshot": ["before_ref", "after_ref"],
    "suggested_next_steps": ["next_steps"],
    "api_web_call": ["source_system", "redacted_request_ref", "redacted_response_ref"],
    "artifact_version": ["logical_artifact_id", "artifact_version"],
}


def cmd_validate_runtime_artifact_schemas(args: argparse.Namespace) -> dict[str, Any]:
    failures: list[dict[str, Any]] = []
    envelope_path = PLANS / "runtime_artifact_envelope.schema.json"
    fixture_path = ROOT / "tests/fixtures/runtime_artifacts/golden/runtime_artifact_fixtures.json"
    if not envelope_path.exists():
        failures.append({"path": rel(envelope_path), "error": "missing_runtime_artifact_envelope_schema"})
    if not fixture_path.exists():
        failures.append({"path": rel(fixture_path), "error": "missing_runtime_artifact_fixture_matrix"})
    if failures:
        return report_status("validate-runtime-artifact-schemas", failures)

    envelope = load_json(envelope_path)
    fixtures = load_json(fixture_path)
    valid_payloads = fixtures.get("valid_payloads", [])
    payloads_by_type = {payload.get("artifact_type"): payload for payload in valid_payloads if isinstance(payload, dict)}

    for artifact_type in RUNTIME_ARTIFACT_TYPES:
        schema_path = PLANS / f"runtime_artifact_{artifact_type}.schema.json"
        if not schema_path.exists():
            failures.append({"path": rel(schema_path), "artifact_type": artifact_type, "error": "missing_runtime_artifact_type_schema"})
            continue
        schema = load_json(schema_path)
        expected_id = f"pm.runtime_artifact.{artifact_type}.schema.v1"
        if schema.get("$id") != expected_id:
            failures.append({"path": rel(schema_path), "artifact_type": artifact_type, "error": "wrong_schema_id", "expected": expected_id})
        payload = payloads_by_type.get(artifact_type)
        if payload is None:
            failures.append({"path": rel(fixture_path), "artifact_type": artifact_type, "error": "missing_valid_payload_fixture"})
            continue
        for error in validate_schema(payload, envelope, envelope):
            failures.append({"path": rel(fixture_path), "artifact_type": artifact_type, "schema": rel(envelope_path), "error": error})
        for error in validate_schema(payload, schema, schema):
            failures.append({"path": rel(fixture_path), "artifact_type": artifact_type, "schema": rel(schema_path), "error": error})
        type_payload = payload.get("type_payload", {})
        for field in RUNTIME_ARTIFACT_REQUIRED_PAYLOAD_FIELDS[artifact_type]:
            if field not in type_payload and field not in payload:
                failures.append({"path": rel(fixture_path), "artifact_type": artifact_type, "error": "missing_type_payload_field", "field": field})
        if artifact_type == "cost_usage" and type_payload.get("reasoning_tokens", -1) < 0:
            failures.append({"path": rel(fixture_path), "artifact_type": artifact_type, "error": "reasoning_tokens_negative"})
        if artifact_type in {"hitl_approval", "failed_attempts"} and not payload.get("receipt_refs"):
            failures.append({"path": rel(fixture_path), "artifact_type": artifact_type, "error": "receipt_like_artifact_missing_receipt_refs"})

    event_records = fixtures.get("event_records", [])
    event_types = {record.get("artifact_type") for record in event_records if isinstance(record, dict)}
    for artifact_type in RUNTIME_ARTIFACT_TYPES:
        if artifact_type not in event_types:
            failures.append({"path": rel(fixture_path), "artifact_type": artifact_type, "error": "missing_event_record_fixture"})

    for invalid in fixtures.get("invalid_payloads", []):
        artifact_type = invalid.get("artifact_type")
        payload = invalid.get("payload", {})
        schema_path = PLANS / f"runtime_artifact_{artifact_type}.schema.json"
        schema = load_json(schema_path) if schema_path.exists() else {}
        schema_errors = validate_schema(payload, envelope, envelope) + validate_schema(payload, schema, schema)
        custom_errors = []
        if artifact_type in RUNTIME_ARTIFACT_REQUIRED_PAYLOAD_FIELDS:
            type_payload = payload.get("type_payload", {})
            custom_errors = [
                field
                for field in RUNTIME_ARTIFACT_REQUIRED_PAYLOAD_FIELDS[artifact_type]
                if field not in type_payload and field not in payload
            ]
        if not schema_errors and not custom_errors:
            failures.append({"path": rel(fixture_path), "invalid_fixture": invalid.get("case_id"), "error": "invalid_fixture_unexpectedly_valid"})

    return report_status(
        "validate-runtime-artifact-schemas",
        failures,
        artifact_types_checked=len(RUNTIME_ARTIFACT_TYPES),
        valid_payload_fixture_count=len(valid_payloads),
        event_record_fixture_count=len(event_records),
    )


GOAL_EVENT_NAMES = [
    "goal.created",
    "goal.scheduled",
    "goal.progressed",
    "goal.tool_check_recorded",
    "goal.updated",
    "goal.replanned",
    "goal.child_status_changed",
    "goal.evidence_captured",
    "goal.verification_decided",
    "goal.receipt_recorded",
    "goal.completed",
    "goal.degraded",
    "goal.stopped",
    "goal.blocked",
    "goal.cancelled",
    "goal_run.started",
    "goal_run.replanned",
    "goal_run.blocked",
    "goal_run.certified",
    "goal_run.cancelled",
    "goal_run.stopped",
]


def cmd_validate_goal_runtime_event_fixtures(args: argparse.Namespace) -> dict[str, Any]:
    failures: list[dict[str, Any]] = []
    schema_path = PLANS / "goal_runtime_events.schema.json"
    fixture_path = ROOT / "tests/fixtures/goal_runtime_events/golden/minimal_goal_events.json"
    if not schema_path.exists():
        failures.append({"path": rel(schema_path), "error": "missing_goal_runtime_event_schema"})
    if not fixture_path.exists():
        failures.append({"path": rel(fixture_path), "error": "missing_goal_runtime_event_fixture"})
    if failures:
        return report_status("validate-goal-runtime-event-fixtures", failures)

    schema = load_json(schema_path)
    fixtures = load_json(fixture_path)
    events = fixtures.get("events", [])
    seen: set[str] = set()
    for index, event in enumerate(events):
        event_name = event.get("event_name") if isinstance(event, dict) else None
        if event_name in seen:
            failures.append({"path": rel(fixture_path), "event_name": event_name, "error": "duplicate_goal_event_fixture"})
        seen.add(str(event_name))
        for error in validate_schema(event, schema, schema):
            failures.append({"path": rel(fixture_path), "event_index": index, "event_name": event_name, "error": error})
        payload = event.get("payload", {}) if isinstance(event, dict) else {}
        if event_name == "goal.created" and not all(key in payload for key in ["objective", "acceptance_criteria", "allowed_scope", "budget"]):
            failures.append({"path": rel(fixture_path), "event_name": event_name, "error": "goal_created_missing_payload_minimum"})
        if event_name == "goal.replanned" and not all(key in payload for key in ["interruption_class", "impact", "next_action"]):
            failures.append({"path": rel(fixture_path), "event_name": event_name, "error": "goal_replanned_missing_payload_minimum"})
        if event_name == "goal.blocked" and not all(key in payload for key in ["blocker_class", "cause", "allowed_action_ids"]):
            failures.append({"path": rel(fixture_path), "event_name": event_name, "error": "goal_blocked_missing_payload_minimum"})

    for event_name in GOAL_EVENT_NAMES:
        if event_name not in seen:
            failures.append({"path": rel(fixture_path), "event_name": event_name, "error": "missing_goal_event_fixture"})

    return report_status(
        "validate-goal-runtime-event-fixtures",
        failures,
        event_names_checked=len(GOAL_EVENT_NAMES),
        fixture_event_count=len(events),
    )


def cmd_validate_project_output_fixtures(args: argparse.Namespace) -> dict[str, Any]:
    failures: list[dict[str, Any]] = []
    fixture_root = ROOT / "tests/fixtures/project_output_artifacts/s2_011/golden/minimal_project"
    required = [
        ".puppet-master/project/requirements.md",
        ".puppet-master/project/contracts/index.json",
        ".puppet-master/project/plan.md",
        ".puppet-master/project/plan_graph/index.json",
        ".puppet-master/project/plan_graph/nodes/node-fr-001.json",
        ".puppet-master/project/acceptance_manifest.json",
        ".puppet-master/project/auto_decisions.jsonl",
        ".puppet-master/project/traceability/requirements_quality_report.json",
        ".puppet-master/project/traceability/requirements_coverage.json",
        ".puppet-master/project/traceability/requirements_coverage.md",
        "schema_payloads/test_strategy.json",
        "schema_payloads/gui_automation_manifest.json",
    ]
    for rel_path in required:
        if not (fixture_root / rel_path).exists():
            failures.append({"path": str((fixture_root / rel_path).relative_to(ROOT)), "error": "missing_project_output_fixture"})
    if failures:
        return report_status("validate-project-output-fixtures", failures)

    schema_targets = [
        ("Plans/acceptance_manifest.schema.json", ".puppet-master/project/acceptance_manifest.json"),
        ("Plans/requirements_coverage.schema.json", ".puppet-master/project/traceability/requirements_coverage.json"),
        ("Plans/requirements_quality_report.schema.json", ".puppet-master/project/traceability/requirements_quality_report.json"),
        ("Plans/test_strategy.schema.json", "schema_payloads/test_strategy.json"),
        ("Plans/gui_automation_manifest.schema.json", "schema_payloads/gui_automation_manifest.json"),
    ]
    for schema_rel, instance_rel in schema_targets:
        schema_path = ROOT / schema_rel
        instance_path = fixture_root / instance_rel
        for error in validate_against_schema(instance_path, schema_path):
            failures.append({"path": str(instance_path.relative_to(ROOT)), "schema": schema_rel, "error": error})

    coverage = load_json(fixture_root / ".puppet-master/project/traceability/requirements_coverage.json")
    md_path = fixture_root / ".puppet-master/project/traceability/requirements_coverage.md"
    json_req_ids = {row.get("req_id") for row in coverage.get("requirements", [])}
    md_req_ids = set(re.findall(r"\b(?:FR|NFR|REQ)-[0-9]{3,}\b", md_path.read_text(encoding="utf-8")))
    if json_req_ids != md_req_ids:
        failures.append({
            "path": str(md_path.relative_to(ROOT)),
            "error": "requirements_coverage_md_json_id_mismatch",
            "json_req_ids": sorted(json_req_ids),
            "md_req_ids": sorted(md_req_ids),
        })

    return report_status("validate-project-output-fixtures", failures, fixture_root=str(fixture_root.relative_to(ROOT)))


COMMAND_TOKEN_RE = re.compile(r"(?<![A-Za-z0-9_])cmd\.[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)*(?![A-Za-z0-9_])")
HANDLER_LOCATION_RE = re.compile(r"^(crate::)?[A-Za-z_][A-Za-z0-9_]*(::[A-Za-z_][A-Za-z0-9_]*)+$")


def wiring_command_excluded(command_id: str, excluded_tokens: list[str]) -> bool:
    for token in excluded_tokens:
        if "*" in token and fnmatch.fnmatchcase(command_id, token):
            return True
        if token.endswith("_") and command_id.startswith(token):
            return True
        if command_id == token:
            return True
    return False


def cmd_validate_wiring_matrix(args: argparse.Namespace) -> dict[str, Any]:
    failures: list[dict[str, Any]] = []
    matrix_path = PLANS / "Wiring_Matrix.production.json"
    schema_path = PLANS / "Wiring_Matrix.schema.json"
    catalog_path = PLANS / "UI_Command_Catalog.md"
    exclusions_path = PLANS / "Wiring_Matrix.production.exclusions.json"

    for path in [matrix_path, schema_path, catalog_path, exclusions_path]:
        if not path.exists():
            failures.append({"path": rel(path), "error": "missing_wiring_matrix_input"})
    if failures:
        return report_status("validate-wiring-matrix", failures)

    for error in validate_against_schema(matrix_path, schema_path):
        failures.append({"path": rel(matrix_path), "schema": rel(schema_path), "error": error})

    matrix = load_json(matrix_path)
    entries = matrix.get("entries") if isinstance(matrix, dict) else None
    if not isinstance(entries, dict):
        failures.append({"path": rel(matrix_path), "error": "wiring_entries_not_object"})
        return report_status("validate-wiring-matrix", failures)

    exclusions = load_json(exclusions_path)
    excluded_tokens = exclusions.get("excluded_tokens", []) if isinstance(exclusions, dict) else []
    if not isinstance(excluded_tokens, list) or not all(isinstance(token, str) for token in excluded_tokens):
        failures.append({"path": rel(exclusions_path), "error": "invalid_wiring_excluded_tokens"})
        excluded_tokens = []

    catalog_text = catalog_path.read_text(encoding="utf-8")
    catalog_commands = set(COMMAND_TOKEN_RE.findall(catalog_text))
    production_commands: set[str] = set()
    event_rows = 0
    typed_contract_rows = 0

    for key, row in entries.items():
        row_path = f"{rel(matrix_path)}#/entries/{key}"
        if not isinstance(row, dict):
            failures.append({"path": row_path, "error": "wiring_entry_not_object"})
            continue
        command_id = str(row.get("ui_command_id", ""))
        production_commands.add(command_id)
        if row.get("ui_element_id") != key:
            failures.append({"path": row_path, "error": "ui_element_id_key_mismatch", "ui_element_id": row.get("ui_element_id")})
        if row.get("example") is True:
            failures.append({"path": row_path, "error": "example_row_in_production_wiring"})
        handler_location = row.get("handler_location")
        if not isinstance(handler_location, str) or not HANDLER_LOCATION_RE.search(handler_location):
            failures.append({"path": row_path, "command_id": command_id, "error": "invalid_handler_location_shape"})

        state_selector = row.get("state_selector")
        disabled_projection = row.get("disabled_reason_projection")
        if not isinstance(state_selector, str) or not state_selector.startswith("state."):
            failures.append({"path": row_path, "command_id": command_id, "error": "missing_state_selector"})
        if not isinstance(disabled_projection, str) or not disabled_projection.endswith(".disabled_reason"):
            failures.append({"path": row_path, "command_id": command_id, "error": "missing_disabled_reason_projection"})

        effect_contract = row.get("effect_contract")
        if isinstance(effect_contract, dict):
            typed_contract_rows += 1
            effect_refs = effect_contract.get("receipt_or_event_refs", [])
        else:
            effect_refs = []
            failures.append({"path": row_path, "command_id": command_id, "error": "missing_effect_contract"})

        test_evidence = row.get("test_evidence", [])
        evidence_kinds = {
            item.get("evidence_kind")
            for item in test_evidence
            if isinstance(item, dict)
        }
        for required_kind in ["dispatcher_fixture", "state_projection", "receipt_or_event_assertion", "accessibility_regression"]:
            if required_kind not in evidence_kinds:
                failures.append(
                    {
                        "path": row_path,
                        "command_id": command_id,
                        "error": "missing_wiring_test_evidence_kind",
                        "evidence_kind": required_kind,
                    }
                )

        expected_events = row.get("expected_event_types", [])
        event_requirements = row.get("event_test_requirements", [])
        if expected_events:
            event_rows += 1
            if "event_test" not in evidence_kinds:
                failures.append({"path": row_path, "command_id": command_id, "error": "event_row_missing_event_test_evidence"})
            if not isinstance(event_requirements, list) or not event_requirements:
                failures.append({"path": row_path, "command_id": command_id, "error": "event_row_missing_event_test_requirements"})
            for event_type in expected_events:
                if event_type not in effect_refs:
                    failures.append(
                        {
                            "path": row_path,
                            "command_id": command_id,
                            "event_type": event_type,
                            "error": "event_row_effect_contract_missing_event_ref",
                        }
                    )
        elif not isinstance(event_requirements, list) or not event_requirements:
            failures.append({"path": row_path, "command_id": command_id, "error": "no_event_row_missing_no_persist_test_requirement"})

    missing_commands = sorted(
        command_id
        for command_id in catalog_commands
        if command_id not in production_commands and not wiring_command_excluded(command_id, excluded_tokens)
    )
    for command_id in missing_commands:
        failures.append({"path": rel(matrix_path), "command_id": command_id, "error": "catalog_command_missing_production_wiring"})

    uncataloged_production_commands = sorted(
        command_id
        for command_id in production_commands
        if command_id not in catalog_commands and not wiring_command_excluded(command_id, excluded_tokens)
    )
    for command_id in uncataloged_production_commands:
        failures.append({"path": rel(matrix_path), "command_id": command_id, "error": "production_wiring_command_missing_catalog_row"})

    return report_status(
        "validate-wiring-matrix",
        failures,
        production_entry_count=len(entries),
        production_command_count=len(production_commands),
        catalog_command_count=len(catalog_commands),
        excluded_token_count=len(excluded_tokens),
        event_row_count=event_rows,
        typed_contract_row_count=typed_contract_rows,
        missing_catalog_command_count=len(missing_commands),
        uncataloged_production_command_count=len(uncataloged_production_commands),
    )


def cmd_validate_bootstrap_ledgers(args: argparse.Namespace) -> dict[str, Any]:
    ledger_root = PLANS / "ledgers/v2"
    requested_ids = getattr(args, "ledger_id", []) or []
    timeout_seconds = getattr(args, "timeout_seconds", 180)
    if requested_ids:
        ledger_dirs = [ledger_root / ledger_id for ledger_id in requested_ids]
    else:
        ledger_dirs = sorted(path for path in ledger_root.glob("pldg-*") if path.is_dir())

    failures: list[dict[str, Any]] = []
    ledgers: list[dict[str, Any]] = []
    validator = ROOT / "scripts/pm-bootstrap-ledger-validate.py"

    for ledger_dir in ledger_dirs:
        ledger_id = ledger_dir.name
        if not ledger_dir.exists():
            failures.append({"ledger_id": ledger_id, "path": rel(ledger_dir), "error": "missing_bootstrap_ledger"})
            ledgers.append({"ledger_id": ledger_id, "status": "fail"})
            continue
        try:
            proc = subprocess.run(
                [sys.executable, str(validator), str(ledger_dir)],
                cwd=ROOT,
                text=True,
                capture_output=True,
                timeout=timeout_seconds,
                check=False,
            )
        except subprocess.TimeoutExpired:
            failures.append({"ledger_id": ledger_id, "path": rel(ledger_dir), "error": "bootstrap_ledger_validate_timeout"})
            ledgers.append({"ledger_id": ledger_id, "status": "fail"})
            continue

        try:
            report = json.loads(proc.stdout)
        except json.JSONDecodeError:
            report = {"status": "fail", "errors": ["validator_output_not_json"], "stdout": proc.stdout[-4000:], "stderr": proc.stderr[-4000:]}
        status = report.get("status")
        ledgers.append(
            {
                "ledger_id": ledger_id,
                "status": status,
                "errors": len(report.get("errors", [])),
                "warnings": len(report.get("warnings", [])),
            }
        )
        if proc.returncode != 0 or status != "pass":
            failures.append(
                {
                    "ledger_id": ledger_id,
                    "path": rel(ledger_dir),
                    "status": status,
                    "returncode": proc.returncode,
                    "errors": report.get("errors", [])[:50],
                    "warnings": report.get("warnings", [])[:50],
                }
            )

    return report_status(
        "validate-bootstrap-ledgers",
        failures,
        validation_policy=(
            "run-gates intentionally excludes the full bootstrap-ledger matrix; "
            "this smoke validates every selected Plans/ledgers/v2/pldg-* ledger, including historical sealed ledgers."
        ),
        ledger_count=len(ledger_dirs),
        ledgers=ledgers,
    )


def compact_gate_report(report: dict[str, Any], sample_limit: int = 10) -> dict[str, Any]:
    return {
        "status": report.get("status"),
        "failures": len(report.get("failures", [])),
        "failure_samples": report.get("failures", [])[:sample_limit],
    }


def cmd_validate_prd_planning_runtime_contracts(args: argparse.Namespace) -> dict[str, Any]:
    validator = ROOT / "scripts" / "pm-prd-planning-runtime-validate.py"
    timeout_seconds = int(getattr(args, "subcheck_timeout_seconds", 0) or 0)
    try:
        proc = subprocess.run(
            [sys.executable, str(validator)],
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
            timeout=timeout_seconds if timeout_seconds > 0 else None,
        )
    except subprocess.TimeoutExpired as exc:
        return report_status(
            "validate-prd-planning-runtime-contracts",
            [
                {
                    "path": rel(validator),
                    "error": "subprocess_timeout",
                    "timeout_seconds": timeout_seconds,
                    "stdout_excerpt": (exc.stdout or "")[-4000:] if isinstance(exc.stdout, str) else "",
                    "stderr_excerpt": (exc.stderr or "")[-4000:] if isinstance(exc.stderr, str) else "",
                }
            ],
        )
    try:
        report = json.loads(proc.stdout)
    except Exception as exc:  # noqa: BLE001 - verifier records malformed validator output.
        return report_status(
            "validate-prd-planning-runtime-contracts",
            [
                {
                    "path": rel(validator),
                    "error": "validator_output_not_json",
                    "detail": str(exc),
                    "stdout": proc.stdout,
                    "stderr": proc.stderr,
                    "returncode": proc.returncode,
                }
            ],
        )
    if proc.returncode != 0 and report.get("status") == "pass":
        report["status"] = "fail"
        report.setdefault("failures", []).append(
            {"path": rel(validator), "error": "validator_failed_without_reported_failures", "returncode": proc.returncode}
        )
    if proc.stderr:
        report["stderr"] = proc.stderr
    return report


def cmd_validate_implementation_readiness(args: argparse.Namespace) -> dict[str, Any]:
    validator = ROOT / "scripts" / "pm-implementation-readiness.py"
    timeout_seconds = int(getattr(args, "subcheck_timeout_seconds", 0) or 0)
    try:
        proc = subprocess.run(
            [sys.executable, str(validator), "validate"],
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
            timeout=timeout_seconds if timeout_seconds > 0 else None,
        )
    except subprocess.TimeoutExpired as exc:
        return report_status(
            "validate-implementation-readiness",
            [
                {
                    "path": rel(validator),
                    "error": "subprocess_timeout",
                    "timeout_seconds": timeout_seconds,
                    "stdout_excerpt": (exc.stdout or "")[-4000:] if isinstance(exc.stdout, str) else "",
                    "stderr_excerpt": (exc.stderr or "")[-4000:] if isinstance(exc.stderr, str) else "",
                }
            ],
        )
    try:
        report = json.loads(proc.stdout)
    except Exception as exc:  # noqa: BLE001 - verifier records malformed validator output.
        return report_status(
            "validate-implementation-readiness",
            [
                {
                    "path": rel(validator),
                    "error": "validator_output_not_json",
                    "detail": str(exc),
                    "stdout": proc.stdout,
                    "stderr": proc.stderr,
                    "returncode": proc.returncode,
                }
            ],
        )
    if proc.returncode != 0 and report.get("status") == "pass":
        report["status"] = "fail"
        report.setdefault("failures", []).append(
            {"path": rel(validator), "error": "validator_failed_without_reported_failures", "returncode": proc.returncode}
        )
    if proc.stderr:
        report["stderr"] = proc.stderr
    return report


def cmd_validate_plan_migration(args: argparse.Namespace) -> dict[str, Any]:
    validator = ROOT / "scripts" / "pm-plan-migration.py"
    run_dir = Path(getattr(args, "run_dir", None) or DEFAULT_PLAN_MIGRATION_RUN)
    if not run_dir.is_absolute():
        run_dir = ROOT / run_dir
    timeout_seconds = int(getattr(args, "subcheck_timeout_seconds", 0) or 0)
    try:
        proc = subprocess.run(
            [sys.executable, str(validator), "validate", "--run-dir", rel(run_dir)],
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
            timeout=timeout_seconds if timeout_seconds > 0 else None,
        )
    except subprocess.TimeoutExpired as exc:
        return report_status(
            "validate-plan-migration",
            [
                {
                    "path": rel(validator),
                    "run_dir": rel(run_dir),
                    "error": "subprocess_timeout",
                    "timeout_seconds": timeout_seconds,
                    "stdout_excerpt": (exc.stdout or "")[-4000:] if isinstance(exc.stdout, str) else "",
                    "stderr_excerpt": (exc.stderr or "")[-4000:] if isinstance(exc.stderr, str) else "",
                }
            ],
        )
    try:
        report = json.loads(proc.stdout)
    except Exception as exc:  # noqa: BLE001 - verifier records malformed validator output.
        return report_status(
            "validate-plan-migration",
            [
                {
                    "path": rel(validator),
                    "run_dir": rel(run_dir),
                    "error": "validator_output_not_json",
                    "detail": str(exc),
                    "stdout": proc.stdout,
                    "stderr": proc.stderr,
                    "returncode": proc.returncode,
                }
            ],
        )
    if proc.returncode != 0 and report.get("status") == "pass":
        report["status"] = "fail"
        report.setdefault("failures", []).append(
            {"path": rel(validator), "run_dir": rel(run_dir), "error": "validator_failed_without_reported_failures", "returncode": proc.returncode}
        )
    if proc.stderr:
        report["stderr"] = proc.stderr
    return report


def cmd_validate_audit_status_index(args: argparse.Namespace) -> dict[str, Any]:
    validator = ROOT / "scripts" / "pm-audit-status-index.py"
    timeout_seconds = int(getattr(args, "subcheck_timeout_seconds", 0) or 0)
    try:
        proc = subprocess.run(
            [sys.executable, str(validator), "validate"],
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
            timeout=timeout_seconds if timeout_seconds > 0 else None,
        )
    except subprocess.TimeoutExpired as exc:
        return report_status(
            "validate-audit-status-index",
            [
                {
                    "path": rel(validator),
                    "error": "subprocess_timeout",
                    "timeout_seconds": timeout_seconds,
                    "stdout_excerpt": (exc.stdout or "")[-4000:] if isinstance(exc.stdout, str) else "",
                    "stderr_excerpt": (exc.stderr or "")[-4000:] if isinstance(exc.stderr, str) else "",
                }
            ],
        )
    try:
        report = json.loads(proc.stdout)
    except Exception as exc:  # noqa: BLE001 - verifier records malformed validator output.
        return report_status(
            "validate-audit-status-index",
            [
                {
                    "path": rel(validator),
                    "error": "validator_output_not_json",
                    "detail": str(exc),
                    "stdout": proc.stdout,
                    "stderr": proc.stderr,
                    "returncode": proc.returncode,
                }
            ],
        )
    if proc.returncode != 0 and report.get("status") == "pass":
        report["status"] = "fail"
        report.setdefault("failures", []).append(
            {"path": rel(validator), "error": "validator_failed_without_reported_failures", "returncode": proc.returncode}
        )
    if proc.stderr:
        report["stderr"] = proc.stderr
    return report


def cmd_validate_audit_closure(args: argparse.Namespace) -> dict[str, Any]:
    validator = ROOT / "scripts" / "pm-audit-closure.py"
    registry = Path(getattr(args, "registry", None) or "Plans/.audits/_semantic_closure_registry.jsonl")
    if not registry.is_absolute():
        registry = ROOT / registry
    timeout_seconds = int(getattr(args, "subcheck_timeout_seconds", 0) or 0)
    try:
        proc = subprocess.run(
            [sys.executable, str(validator), "validate", "--registry", rel(registry)],
            cwd=ROOT,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
            timeout=timeout_seconds if timeout_seconds > 0 else None,
        )
    except subprocess.TimeoutExpired as exc:
        return report_status(
            "validate-audit-closure",
            [
                {
                    "path": rel(validator),
                    "registry": rel(registry),
                    "error": "subprocess_timeout",
                    "timeout_seconds": timeout_seconds,
                    "stdout_excerpt": (exc.stdout or "")[-4000:] if isinstance(exc.stdout, str) else "",
                    "stderr_excerpt": (exc.stderr or "")[-4000:] if isinstance(exc.stderr, str) else "",
                }
            ],
        )
    try:
        raw_report = json.loads(proc.stdout)
    except Exception as exc:  # noqa: BLE001 - verifier records malformed validator output.
        return report_status(
            "validate-audit-closure",
            [
                {
                    "path": rel(validator),
                    "registry": rel(registry),
                    "error": "validator_output_not_json",
                    "detail": str(exc),
                    "stdout": proc.stdout[-8000:],
                    "stderr": proc.stderr[-8000:],
                    "returncode": proc.returncode,
                }
            ],
        )

    failures: list[dict[str, Any]] = []
    for detail in raw_report.get("errors", [])[:200]:
        failures.append(
            {
                "path": rel(registry),
                "error": "audit_closure_validator_error",
                "detail": detail,
            }
        )
    if proc.returncode != 0 and raw_report.get("status") == "pass":
        failures.append(
            {"path": rel(validator), "registry": rel(registry), "error": "validator_failed_without_reported_failures", "returncode": proc.returncode}
        )

    reopened_rows: list[dict[str, Any]] = []
    if registry.exists():
        for line_no, line in enumerate(registry.read_text(encoding="utf-8").splitlines(), start=1):
            if not line.strip():
                continue
            try:
                row = json.loads(line)
            except Exception as exc:  # noqa: BLE001
                failures.append({"path": f"{rel(registry)}:{line_no}", "error": "json_parse_failed", "detail": str(exc)})
                continue
            if row.get("closure_status") == "reopened":
                reopened_rows.append(
                    {
                        "line": line_no,
                        "closure_id": row.get("closure_id"),
                        "finding_key": row.get("finding_key"),
                    }
                )
    else:
        failures.append({"path": rel(registry), "error": "missing_audit_closure_registry"})
    if reopened_rows:
        failures.append(
            {
                "path": rel(registry),
                "error": "audit_closure_reopened_rows_present",
                "rows": reopened_rows[:50],
                "row_count": len(reopened_rows),
            }
        )

    report = report_status(
        "validate-audit-closure",
        failures,
        registry=rel(registry),
        row_count=raw_report.get("registry", {}).get("row_count"),
        status_counts=raw_report.get("registry", {}).get("status_counts"),
        raw_status=raw_report.get("status"),
    )
    if proc.stderr:
        report["stderr"] = proc.stderr
    return report


def cmd_run_gates(args: argparse.Namespace) -> dict[str, Any]:
    progress = progress_enabled(args)
    timeout_seconds = subcheck_timeout_seconds(args)
    check_specs = [
        ("json_syntax", cmd_json_syntax, argparse.Namespace()),
        ("verify_spec_lock", cmd_verify_spec_lock, argparse.Namespace()),
        ("validate_plan_graph", cmd_validate_plan_graph, argparse.Namespace(paths=[])),
        ("validate_auto_decisions", cmd_validate_auto_decisions, argparse.Namespace()),
        ("validate_evidence", cmd_validate_evidence, argparse.Namespace(paths=[])),
        ("lint_contractrefs", cmd_lint_contractrefs, argparse.Namespace()),
        ("lint_banned_phrases", cmd_lint_banned_phrases, argparse.Namespace()),
        ("lint_path_refs", cmd_lint_path_refs, argparse.Namespace()),
        ("check_project_artifact_requirements", cmd_check_project_artifact_requirements, argparse.Namespace()),
        ("validate_plans_to_code_handoff_schema", cmd_validate_plans_to_code_handoff_schema, argparse.Namespace()),
        ("validate_prd_planning_runtime_contracts", cmd_validate_prd_planning_runtime_contracts, argparse.Namespace()),
        ("validate_implementation_readiness", cmd_validate_implementation_readiness, argparse.Namespace()),
        ("validate_plan_migration", cmd_validate_plan_migration, argparse.Namespace(subcheck_timeout_seconds=timeout_seconds)),
        ("validate_runtime_artifact_schemas", cmd_validate_runtime_artifact_schemas, argparse.Namespace()),
        ("validate_goal_runtime_event_fixtures", cmd_validate_goal_runtime_event_fixtures, argparse.Namespace()),
        ("validate_project_output_fixtures", cmd_validate_project_output_fixtures, argparse.Namespace()),
        ("validate_wiring_matrix", cmd_validate_wiring_matrix, argparse.Namespace()),
        ("validate_audit_closure", cmd_validate_audit_closure, argparse.Namespace()),
        ("validate_audit_status_index", cmd_validate_audit_status_index, argparse.Namespace(subcheck_timeout_seconds=timeout_seconds)),
        ("check_shards", cmd_check_shards, argparse.Namespace(report=None)),
    ]
    checks = [
        run_named_check(name, func, namespace, progress=progress, timeout_seconds=timeout_seconds)
        for name, func, namespace in check_specs
    ]

    failures: list[dict[str, Any]] = []
    for name, report in checks:
        if report.get("status") != "pass":
            failures.append({"check": name, "status": report.get("status"), "failures": report.get("failures", [])[:50]})
    return report_status(
        "run-gates",
        failures,
        checks={name: compact_gate_report(report) for name, report in checks},
        subcheck_timeout_seconds=timeout_seconds,
    )


def cmd_audit_governance(args: argparse.Namespace) -> dict[str, Any]:
    progress = progress_enabled(args)
    timeout_seconds = subcheck_timeout_seconds(args)
    check_specs = [
        ("spec_lock", cmd_verify_spec_lock, argparse.Namespace()),
        ("plan_graph", cmd_validate_plan_graph, argparse.Namespace(paths=[])),
        ("auto_decisions", cmd_validate_auto_decisions, argparse.Namespace()),
        ("evidence", cmd_validate_evidence, argparse.Namespace(paths=[])),
        ("support_refs", cmd_lint_contractrefs, argparse.Namespace()),
        ("path_refs", cmd_lint_path_refs, argparse.Namespace()),
        ("shards", cmd_check_shards, argparse.Namespace(report=None)),
        ("project_artifacts", cmd_check_project_artifact_requirements, argparse.Namespace()),
        ("plans_to_code_handoff_schema", cmd_validate_plans_to_code_handoff_schema, argparse.Namespace()),
        ("prd_planning_runtime_contracts", cmd_validate_prd_planning_runtime_contracts, argparse.Namespace()),
        ("implementation_readiness", cmd_validate_implementation_readiness, argparse.Namespace()),
        ("plan_migration", cmd_validate_plan_migration, argparse.Namespace(subcheck_timeout_seconds=timeout_seconds)),
        ("runtime_artifact_schemas", cmd_validate_runtime_artifact_schemas, argparse.Namespace()),
        ("goal_runtime_event_fixtures", cmd_validate_goal_runtime_event_fixtures, argparse.Namespace()),
        ("project_output_fixtures", cmd_validate_project_output_fixtures, argparse.Namespace()),
        ("wiring_matrix", cmd_validate_wiring_matrix, argparse.Namespace()),
        ("audit_closure", cmd_validate_audit_closure, argparse.Namespace()),
        ("audit_status_index", cmd_validate_audit_status_index, argparse.Namespace(subcheck_timeout_seconds=timeout_seconds)),
    ]
    checks = [
        run_named_check(name, func, namespace, progress=progress, timeout_seconds=timeout_seconds)
        for name, func, namespace in check_specs
    ]
    check_map = {name: report for name, report in checks}
    failures: list[dict[str, Any]] = []
    for name, report in checks:
        if report.get("status") != "pass":
            failures.append({"check": name, "failures": report.get("failures", [])[:100]})
    return report_status(
        "audit-governance",
        failures,
        spec_lock=compact_gate_report(check_map["spec_lock"]),
        plan_graph=compact_gate_report(check_map["plan_graph"]),
        auto_decisions=compact_gate_report(check_map["auto_decisions"]),
        evidence=compact_gate_report(check_map["evidence"]),
        support_refs=compact_gate_report(check_map["support_refs"]),
        path_refs=compact_gate_report(check_map["path_refs"]),
        shards=compact_gate_report(check_map["shards"]),
        project_artifacts=compact_gate_report(check_map["project_artifacts"]),
        plans_to_code_handoff_schema=compact_gate_report(check_map["plans_to_code_handoff_schema"]),
        prd_planning_runtime_contracts=compact_gate_report(check_map["prd_planning_runtime_contracts"]),
        implementation_readiness=compact_gate_report(check_map["implementation_readiness"]),
        runtime_artifact_schemas=compact_gate_report(check_map["runtime_artifact_schemas"]),
        goal_runtime_event_fixtures=compact_gate_report(check_map["goal_runtime_event_fixtures"]),
        project_output_fixtures=compact_gate_report(check_map["project_output_fixtures"]),
        wiring_matrix=compact_gate_report(check_map["wiring_matrix"]),
        audit_closure=compact_gate_report(check_map["audit_closure"]),
        audit_status_index=compact_gate_report(check_map["audit_status_index"]),
        subcheck_timeout_seconds=timeout_seconds,
    )


COMMANDS = {
    "json-syntax": cmd_json_syntax,
    "verify-spec-lock": cmd_verify_spec_lock,
    "validate-auto-decisions": cmd_validate_auto_decisions,
    "validate-evidence": cmd_validate_evidence,
    "validate-plan-graph": cmd_validate_plan_graph,
    "lint-contractrefs": cmd_lint_contractrefs,
    "lint-banned-phrases": cmd_lint_banned_phrases,
    "lint-path-refs": cmd_lint_path_refs,
    "check-shards": cmd_check_shards,
    "check-project-artifacts": cmd_check_project_artifact_requirements,
    "validate-plans-to-code-handoff-schema": cmd_validate_plans_to_code_handoff_schema,
    "validate-prd-planning-runtime-contracts": cmd_validate_prd_planning_runtime_contracts,
    "validate-implementation-readiness": cmd_validate_implementation_readiness,
    "validate-plan-migration": cmd_validate_plan_migration,
    "validate-runtime-artifact-schemas": cmd_validate_runtime_artifact_schemas,
    "validate-goal-runtime-event-fixtures": cmd_validate_goal_runtime_event_fixtures,
    "validate-project-output-fixtures": cmd_validate_project_output_fixtures,
    "validate-wiring-matrix": cmd_validate_wiring_matrix,
    "validate-bootstrap-ledgers": cmd_validate_bootstrap_ledgers,
    "validate-audit-closure": cmd_validate_audit_closure,
    "validate-audit-status-index": cmd_validate_audit_status_index,
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
        if name == "validate-bootstrap-ledgers":
            sub.add_argument("--ledger-id", action="append", default=[], help="Validate one ledger id; repeat for multiple.")
            sub.add_argument("--timeout-seconds", type=int, default=180, help="Maximum seconds per ledger validation.")
        if name == "validate-plan-migration":
            sub.add_argument("--run-dir", default=str(DEFAULT_PLAN_MIGRATION_RUN.relative_to(ROOT)))
            sub.add_argument("--subcheck-timeout-seconds", type=int, default=180)
        if name == "validate-audit-closure":
            sub.add_argument("--registry", default="Plans/.audits/_semantic_closure_registry.jsonl")
            sub.add_argument("--subcheck-timeout-seconds", type=int, default=180)
        if name in {"run-gates", "audit-governance"}:
            sub.add_argument(
                "--subcheck-timeout-seconds",
                type=int,
                default=180,
                help="Maximum seconds for each aggregate subcheck before reporting the stuck check.",
            )
            sub.add_argument("--quiet-progress", action="store_true", help="Suppress aggregate subcheck progress on stderr.")
    args = parser.parse_args()
    if not hasattr(args, "paths"):
        args.paths = []
    report = COMMANDS[args.command](args)
    write_report(report, args.report)
    print(json.dumps({k: report[k] for k in report if k in {"check", "status", "failures", "generated_at_utc"}}, indent=2, sort_keys=True))
    return 0 if report.get("status") == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(main())
