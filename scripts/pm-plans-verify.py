#!/usr/bin/env python3
"""Repo-local verifier for Puppet Master build-governance artifacts."""

from __future__ import annotations

import argparse
import fnmatch
import hashlib
import ipaddress
import json
import os
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
from urllib.parse import urlparse


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


_AGGREGATE_CHILD_ENV = "PM_PLANS_VERIFY_AGGREGATE_CHILD"


def _terminate_process_group(proc: subprocess.Popen) -> tuple[bool, str]:
    """Best-effort terminate a validator subprocess and any children holding its pipes.

    Returns (group_killed, mechanism). On POSIX we kill the whole process group the child
    started (start_new_session=True), so grandchildren inheriting stdout/stderr are reaped
    too instead of keeping the pipe open and forcing communicate() to hang. We then fall back
    to proc.kill() for non-POSIX / no-process-group cases.
    """
    group_killed = False
    mechanism = "none"
    try:
        pgid = os.getpgid(proc.pid)
        os.killpg(pgid, signal.SIGKILL)
        group_killed = True
        mechanism = f"os.killpg({pgid}, SIGKILL)"
    except (ProcessLookupError, PermissionError, OSError):
        pass
    if not group_killed:
        try:
            proc.kill()
            mechanism = "proc.kill()"
        except Exception:  # pragma: no cover - defensive reap fallback
            mechanism = "kill_failed"
    return group_killed, mechanism


def run_validator_subprocess(
    check_name: str,
    argv: list[str],
    *,
    timeout_seconds: int,
    extra_failure_fields: dict[str, Any] | None = None,
    aggregate_child: bool = False,
) -> tuple[subprocess.CompletedProcess | None, dict[str, Any] | None]:
    """Run a validator subprocess for a run-gates/audit-governance gate.

    Standalone validators and aggregate wrappers use start_new_session=True so the child is
    its own process group. Aggregate wrappers mark their environment so nested validators
    inherit the wrapper's process group instead of starting an escape session. On timeout we
    therefore kill the whole aggregate tree, including nested validators and grandchildren
    holding stdout/stderr pipes. Always returns instead of hanging.

    Returns ``(completed_proc, None)`` on normal completion, or ``(None, report_status)``
    with a structured ``subprocess_timeout`` report on timeout. Never raises.
    """
    nested_in_aggregate = os.environ.get(_AGGREGATE_CHILD_ENV) == "1"
    extra_failure_fields = extra_failure_fields or {}
    # The aggregate wrapper owns the deadline for the whole process group. A nested helper
    # must not race that deadline and kill the group containing itself; it blocks until the
    # wrapper completes normally or the aggregate parent kills the complete group.
    effective_timeout = None if nested_in_aggregate else (
        timeout_seconds if timeout_seconds and timeout_seconds > 0 else None
    )
    child_env: dict[str, str] | None = None
    if aggregate_child:
        child_env = os.environ.copy()
        child_env[_AGGREGATE_CHILD_ENV] = "1"
    proc = subprocess.Popen(
        argv,
        cwd=ROOT,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        start_new_session=not nested_in_aggregate,
        env=child_env,
    )
    try:
        out, err = proc.communicate(timeout=effective_timeout)
        return subprocess.CompletedProcess(
            args=argv, returncode=proc.returncode, stdout=out, stderr=err
        ), None
    except subprocess.TimeoutExpired:
        group_killed, mechanism = _terminate_process_group(proc)
        try:
            out, err = proc.communicate(timeout=1)
        except Exception as cleanup_exc:  # pragma: no cover - defensive reap fallback after group kill
            # Never call read() here: an escaped descendant may still hold a copied pipe
            # descriptor open, so waiting for EOF could block forever. Keep only output
            # already buffered by communicate(), close our pipe handles, and bound the
            # direct-child reap as well.
            out = getattr(cleanup_exc, "output", "") or ""
            err = getattr(cleanup_exc, "stderr", "") or ""
            if isinstance(out, bytes):
                out = out.decode("utf-8", errors="replace")
            if isinstance(err, bytes):
                err = err.decode("utf-8", errors="replace")
            for pipe in (proc.stdout, proc.stderr):
                if pipe is not None:
                    try:
                        pipe.close()
                    except Exception:
                        pass
            try:
                proc.wait(timeout=1)
            except Exception:
                try:
                    proc.kill()
                except Exception:
                    pass
                try:
                    proc.wait(timeout=1)
                except Exception:
                    pass
        timeout_report = report_status(
            check_name,
            [
                {
                    "error": "subprocess_timeout",
                    "timeout_seconds": timeout_seconds,
                    "process_group_killed": group_killed,
                    "kill_mechanism": mechanism,
                    "stdout_excerpt": (out or "")[-4000:],
                    "stderr_excerpt": (err or "")[-4000:],
                    **extra_failure_fields,
                }
            ],
        )
        return None, timeout_report


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


# How many characters of validator stdout/stderr we keep in aggregate reports.
_EXCERPT_LIMIT = 8000


def _signal_name(signum: int) -> str:
    try:
        return signal.Signals(signum).name
    except ValueError:
        return f"SIG{signum}"


def classify_validator_result(
    check_name: str,
    proc: subprocess.CompletedProcess,
    *,
    extra_failure_fields: dict[str, Any] | None = None,
) -> dict[str, Any] | None:
    """Classify a finished validator subprocess result before attempting JSON parsing.

    Returns a structured ``report_status`` failure when the result cannot be a clean
    JSON report (process killed by a signal such as -9 / OOM, or empty output), and
    ``None`` when the result looks like parseable JSON output (the caller should then
    attempt ``json.loads``). This keeps a killed/OOMed validator from being mislabeled
    as a generic ``validator_output_not_json`` JSON-parse defect.

    On POSIX a negative returncode means the child was terminated by signal
    ``-returncode`` (e.g. ``-9`` == SIGKILL, the signature of an external OOM-kill or
    watchdog kill). Such a process can emit nothing, so we surface it explicitly.
    """
    extra_failure_fields = extra_failure_fields or {}
    rc = proc.returncode
    stdout = proc.stdout or ""
    stderr = proc.stderr or ""
    if rc is not None and rc < 0:
        signum = -rc
        return report_status(
            check_name,
            [
                {
                    "error": "validator_killed_by_signal",
                    "signal": signum,
                    "signal_name": _signal_name(signum),
                    "returncode": rc,
                    "likely_cause": "external_oom_or_signal_kill",
                    "stdout_excerpt": stdout[-_EXCERPT_LIMIT:],
                    "stderr_excerpt": stderr[-_EXCERPT_LIMIT:],
                    **extra_failure_fields,
                }
            ],
        )
    if not stdout.strip():
        return report_status(
            check_name,
            [
                {
                    "error": "validator_no_output",
                    "returncode": rc,
                    "stdout_excerpt": stdout[-_EXCERPT_LIMIT:],
                    "stderr_excerpt": stderr[-_EXCERPT_LIMIT:],
                    **extra_failure_fields,
                }
            ],
        )
    return None


def parse_validator_json(
    check_name: str,
    proc: subprocess.CompletedProcess,
    *,
    extra_failure_fields: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Parse a validator subprocess JSON report with bounded, explicit error taxonomy.

    Pre-classifies signal death and empty output (see ``classify_validator_result``)
    so a killed/OOMed validator is never reported as a misleading JSON-parse defect.
    On a genuine malformed-JSON case, emits ``validator_output_not_json`` with a
    bounded stdout excerpt and the parse detail.
    """
    early_failure = classify_validator_result(
        check_name, proc, extra_failure_fields=extra_failure_fields
    )
    if early_failure is not None:
        return early_failure
    extra_failure_fields = extra_failure_fields or {}
    try:
        report = json.loads(proc.stdout)
    except Exception as exc:  # noqa: BLE001 - verifier records malformed validator output.
        return report_status(
            check_name,
            [
                {
                    "error": "validator_output_not_json",
                    "detail": str(exc),
                    "returncode": proc.returncode,
                    "stdout_excerpt": (proc.stdout or "")[-_EXCERPT_LIMIT:],
                    "stderr_excerpt": (proc.stderr or "")[-_EXCERPT_LIMIT:],
                    **extra_failure_fields,
                }
            ],
        )
    if proc.returncode != 0 and report.get("status") == "pass":
        report["status"] = "fail"
        report.setdefault("failures", []).append(
            {"error": "validator_failed_without_reported_failures", "returncode": proc.returncode, **extra_failure_fields}
        )
    if proc.stderr:
        report.setdefault("stderr", proc.stderr[-_EXCERPT_LIMIT:])
    return report


def progress_enabled(args: argparse.Namespace) -> bool:
    return not bool(getattr(args, "quiet_progress", False))


def subcheck_timeout_seconds(args: argparse.Namespace) -> int:
    return int(getattr(args, "subcheck_timeout_seconds", 180) or 0)


# Aggregate-gate subchecks that are intentionally run in-process (never re-forked).
# These are cheap, do not scan the repo, and re-forking them would only add overhead
# without improving reliability. Everything else is forced into its own subprocess.
_INPROCESS_AGGREGATE_CHECKS = {"verify_spec_lock"}


def run_named_check(
    name: str,
    func: Any,
    namespace: argparse.Namespace,
    *,
    progress: bool,
    timeout_seconds: int,
) -> tuple[str, dict[str, Any]]:
    """Run one aggregate subcheck and return ``(name, report)``.

    Every aggregate subcheck (in run-gates / audit-governance) runs in its own
    subprocess so that a stuck in-process scan (e.g. lint_contractrefs,
    validate_evidence) is a stuck *child* process that the process-group timeout
    helper can SIGKILL cleanly instead of hanging the whole aggregate. The subcheck
    is re-invoked as ``python3 scripts/pm-plans-verify.py <command> --report <tmp>``
    in an isolated process group.

    ``timeout_seconds <= 0`` disables the per-subcheck bound. A small allowlist of
    cheap checks (``_INPROCESS_AGGREGATE_CHECKS``) stays in-process. A SIGALRM
    backstop still wraps the in-process path for defense in depth.
    """
    if progress:
        print(f"[pm-plans-verify] start {name}", file=sys.stderr, flush=True)
    started = time.monotonic()
    if name in _INPROCESS_AGGREGATE_CHECKS:
        report = _run_inprocess_check(name, func, namespace, timeout_seconds=timeout_seconds)
    else:
        report = _run_subprocess_check(name, namespace, timeout_seconds=timeout_seconds)
    elapsed_ms = int((time.monotonic() - started) * 1000)
    report.setdefault("elapsed_ms", elapsed_ms)
    if progress:
        print(f"[pm-plans-verify] done {name} status={report.get('status')} elapsed_ms={elapsed_ms}", file=sys.stderr, flush=True)
    return name, report


def _run_inprocess_check(
    name: str,
    func: Any,
    namespace: argparse.Namespace,
    *,
    timeout_seconds: int,
) -> dict[str, Any]:
    """Run a cheap allowlisted subcheck in-process with a SIGALRM backstop."""
    try:
        with subcheck_alarm(timeout_seconds, name):
            setattr(namespace, "subcheck_timeout_seconds", timeout_seconds)
            report = func(namespace)
    except SubcheckTimeout as exc:
        report = report_status(
            name,
            [{"check": name, "error": "subcheck_timeout", "timeout_seconds": timeout_seconds, "message": str(exc)}],
        )
    except Exception as exc:  # pragma: no cover - defensive gate wrapper
        report = report_status(
            name,
            [{"check": name, "error": "subcheck_exception", "message": str(exc)}],
        )
    return report


def _run_subprocess_check(
    name: str,
    namespace: argparse.Namespace,
    *,
    timeout_seconds: int,
) -> dict[str, Any]:
    """Run an aggregate subcheck in an isolated subprocess with a process-group bound.

    Re-invokes the verifier as ``python3 scripts/pm-plans-verify.py <command>`` (the
    command id matching ``name``), writes its JSON report to a temp file, and parses
    it back. On timeout the whole child process group is SIGKILLed so orphaned
    children and pipe-holding grandchildren cannot strand the parent. Always returns a
    structured report instead of hanging.
    """
    command_id = _aggregate_subcheck_command_id(name)
    extra_cli_args = _aggregate_subcheck_cli_args(name, namespace, timeout_seconds=timeout_seconds)
    temp_path: Path | None = None
    try:
        tmp = tempfile.NamedTemporaryFile(prefix=f"pm-subcheck-{name}-", suffix=".json", delete=False)
        tmp.close()
        temp_path = Path(tmp.name)
        argv = [
            sys.executable,
            "scripts/pm-plans-verify.py",
            command_id,
            "--report",
            str(temp_path),
        ]
        argv.extend(extra_cli_args)
        proc, timeout_report = run_validator_subprocess(
            name,
            argv,
            timeout_seconds=timeout_seconds,
            extra_failure_fields={"command_id": command_id},
            aggregate_child=True,
        )
        if timeout_report is not None:
            # Rewrite the check name to the aggregate subcheck name the caller expects.
            timeout_report["check"] = _aggregate_check_name(name)
            return timeout_report
        # The child wrote its report to the temp file; prefer that (it can be large),
        # but fall back to stdout for validators that only print.
        report: dict[str, Any] | None = None
        if temp_path.exists() and temp_path.stat().st_size > 0:
            try:
                report = load_json(temp_path)
            except Exception:  # noqa: BLE001 - fall through to stdout classification
                report = None
        if report is None:
            report = parse_validator_json(
                _aggregate_check_name(name),
                proc,
                extra_failure_fields={"command_id": command_id},
            )
        # Normalize the check name to the aggregate subcheck name the caller expects.
        report["check"] = _aggregate_check_name(name)
        return report
    finally:
        if temp_path is not None:
            temp_path.unlink(missing_ok=True)


def _aggregate_check_name(name: str) -> str:
    """Aggregate subchecks are reported with hyphenated check names (e.g. json-syntax)."""
    return name.replace("_", "-")


# Map aggregate subcheck names (as used in run-gates/audit-governance check_specs)
# to the standalone CLI command id, where they differ by more than the _ -> - swap.
_AGGREGATE_NAME_TO_COMMAND = {
    "json_syntax": "json-syntax",
    "verify_spec_lock": "verify-spec-lock",
    "validate_plan_graph": "validate-plan-graph",
    "validate_auto_decisions": "validate-auto-decisions",
    "validate_evidence": "validate-evidence",
    "lint_contractrefs": "lint-contractrefs",
    "lint_banned_phrases": "lint-banned-phrases",
    "lint_path_refs": "lint-path-refs",
    "check_project_artifact_requirements": "check-project-artifacts",
    "validate_plans_to_code_handoff_schema": "validate-plans-to-code-handoff-schema",
    "validate_prd_planning_runtime_contracts": "validate-prd-planning-runtime-contracts",
    "validate_case_l_non_event_materialization": "validate-case-l-non-event-materialization",
    "validate_implementation_readiness": "validate-implementation-readiness",
    "validate_plan_migration": "validate-plan-migration",
    "validate_runtime_artifact_schemas": "validate-runtime-artifact-schemas",
    "validate_goal_runtime_event_fixtures": "validate-goal-runtime-event-fixtures",
    "validate_project_output_fixtures": "validate-project-output-fixtures",
    "validate_usage_gui_fixtures": "validate-usage-gui-fixtures",
    "validate_usage_contract_drift": "validate-usage-contract-drift",
    "validate_gui_asset_policy": "validate-gui-asset-policy",
    "validate_web_capability_contracts": "validate-web-capability-contracts",
    "validate_filesafe_security_policy": "validate-filesafe-security-policy",
    "validate_wiring_matrix": "validate-wiring-matrix",
    "validate_audit_closure": "validate-audit-closure",
    "validate_audit_status_index": "validate-audit-status-index",
    "check_shards": "check-shards",
    "spec_lock": "verify-spec-lock",
    "plan_graph": "validate-plan-graph",
    "auto_decisions": "validate-auto-decisions",
    "evidence": "validate-evidence",
    "support_refs": "lint-contractrefs",
    "path_refs": "lint-path-refs",
    "shards": "check-shards",
    "project_artifacts": "check-project-artifacts",
    "plans_to_code_handoff_schema": "validate-plans-to-code-handoff-schema",
    "prd_planning_runtime_contracts": "validate-prd-planning-runtime-contracts",
    "case_l_non_event_materialization": "validate-case-l-non-event-materialization",
    "implementation_readiness": "validate-implementation-readiness",
    "plan_migration": "validate-plan-migration",
    "runtime_artifact_schemas": "validate-runtime-artifact-schemas",
    "goal_runtime_event_fixtures": "validate-goal-runtime-event-fixtures",
    "project_output_fixtures": "validate-project-output-fixtures",
    "usage_gui_fixtures": "validate-usage-gui-fixtures",
    "usage_contract_drift": "validate-usage-contract-drift",
    "gui_asset_policy": "validate-gui-asset-policy",
    "web_capability_contracts": "validate-web-capability-contracts",
    "filesafe_security_policy": "validate-filesafe-security-policy",
    "wiring_matrix": "validate-wiring-matrix",
    "audit_closure": "validate-audit-closure",
    "audit_status_index": "validate-audit-status-index",
}


def _aggregate_subcheck_command_id(name: str) -> str:
    """Return the standalone CLI command id for an aggregate subcheck name."""
    return _AGGREGATE_NAME_TO_COMMAND.get(name, name.replace("_", "-"))


_AGGREGATE_NAMES_WITH_TIMEOUT_ARG = {
    "check_shards",
    "shards",
    "validate_prd_planning_runtime_contracts",
    "prd_planning_runtime_contracts",
    "validate_case_l_non_event_materialization",
    "case_l_non_event_materialization",
    "validate_implementation_readiness",
    "implementation_readiness",
    "validate_gui_asset_policy",
    "gui_asset_policy",
}


def _aggregate_subcheck_cli_args(
    name: str,
    namespace: argparse.Namespace,
    *,
    timeout_seconds: int | None = None,
) -> list[str]:
    """Extra CLI args to pass when re-invoking an aggregate subcheck as a subprocess."""
    effective_timeout_seconds = int(
        timeout_seconds if timeout_seconds is not None else getattr(namespace, "subcheck_timeout_seconds", 0) or 0
    )
    if name in {"validate_evidence", "evidence"}:
        # validate-evidence takes positional paths; aggregates pass an empty list.
        return []
    if name in {"validate_plan_migration", "plan_migration"}:
        run_dir = getattr(namespace, "run_dir", None) or str(DEFAULT_PLAN_MIGRATION_RUN.relative_to(ROOT))
        return ["--run-dir", str(run_dir), "--subcheck-timeout-seconds", str(effective_timeout_seconds)]
    if name in {"validate_audit_closure", "audit_closure"}:
        registry = getattr(namespace, "registry", None) or "Plans/.audits/_semantic_closure_registry.jsonl"
        return ["--registry", str(registry), "--subcheck-timeout-seconds", str(effective_timeout_seconds)]
    if name in {"validate_audit_status_index", "audit_status_index"}:
        return ["--subcheck-timeout-seconds", str(effective_timeout_seconds)]
    if name in _AGGREGATE_NAMES_WITH_TIMEOUT_ARG:
        return ["--subcheck-timeout-seconds", str(effective_timeout_seconds)]
    return []


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

    if "oneOf" in schema:
        matching_branches = sum(
            not validate_schema(instance, sub, root_schema, path)
            for sub in schema["oneOf"]
        )
        if matching_branches != 1:
            errors.append(f"{path}: matched {matching_branches} oneOf branches instead of exactly one")

    if "not" in schema and not validate_schema(instance, schema["not"], root_schema, path):
        errors.append(f"{path}: matched forbidden not schema")

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
        if schema.get("format") == "date-time" and not re.match(
            r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$",
            instance,
        ):
            errors.append(f"{path}: is not a UTC RFC 3339 date-time")

    if isinstance(instance, (int, float)) and not isinstance(instance, bool):
        if "minimum" in schema and instance < schema["minimum"]:
            errors.append(f"{path}: below minimum {schema['minimum']}")
        if "maximum" in schema and instance > schema["maximum"]:
            errors.append(f"{path}: above maximum {schema['maximum']}")

    if isinstance(instance, list):
        if "minItems" in schema and len(instance) < schema["minItems"]:
            errors.append(f"{path}: fewer than minItems {schema['minItems']}")
        if "maxItems" in schema and len(instance) > schema["maxItems"]:
            errors.append(f"{path}: more than maxItems {schema['maxItems']}")
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
        for trigger, dependents in schema.get("dependentRequired", {}).items():
            if trigger not in instance:
                continue
            for dependent in dependents:
                if dependent not in instance:
                    errors.append(
                        f"{path}: key {trigger} requires dependent key {dependent}"
                    )
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
    decision_rows: dict[str, list[dict[str, Any]]] = {}
    historical_duplicate_identities = {
        "dec-r-20260312-160857-01-spec-lock-refresh": {
            "44df2e108c6ffe43bf58701084fe5e0e52b122f0603df39798ce82278eea8b35",
            "973a76d2df4393bd83e597420d5db33a0b3cb967dc99975792f61afa14d1bc92",
            "b353a1ab66ba54b461b185f716605e3fd58c8df962653362fc5048f9a5ac8cdf",
        },
        "dec-r-20260316-160450-01-spec-lock-refresh": {
            "619c1248a60bc3273494b482ba49221e5782edcd1420bcfb531598a01fffdbb0",
            "ebf091c2aebf7a0702c5f0e131c4c9e5dca473dacea6b1fd9c12f6f3646c1255",
        },
        "dec-r-20260328-192850-02-spec-lock-refresh": {
            "47ebc8ab44a213b9c03d2963649e031c586e874a61501c7e03102f84bc3735ad",
            "7a23f68cf924f2c26b488be9c056cb6c0cb1b84130da3a46ad2dc9377aaf823d",
        },
        "dec-r-20260328-192850-04-spec-lock-refresh": {
            "8604c0e121eed97b1092618a6b28a34c1c7e29f6693eda922abd3a6aaebde0df",
            "8b554daddb092cb72f3a9b1d2819aa323bd7dc6f1db770d3da70bfd9697bc3a3",
        },
        "dec-r-20260328-192850-05-spec-lock-refresh": {
            "26a0d43a6b49797d3a888640d223974b305eb629599dc77cbcebe99dae580eac",
            "b454497eff451d6fc4a52a86a5e612a45828cf59edce938ade36f3d559faac5e",
        },
        "dec-r-20260329-235630-04-spec-lock-refresh": {
            "2e61d9bdf53a6f53de4ebb197d438075934777f235a812ab4ccdad4d7d8fa85e",
            "faa39c4bd5c56c4192caaaa5f32d8ef939106fccbcbb29e96ad14b677034ae3c",
        },
        "dec-rewrite-20260307-230437-dockerhub-docker-management-and-unraid-template-publishing-audit-remediation-spec-lock-refresh": {
            "a987f31168a3d319384880f5d463d9dc20c8878f55a13bca0f10f3f6a7b18392",
            "cad4a7f4f62e14290f8f65d777b42e11b3cc55f45f639c09fb0e6c2978fbebc8",
        },
        "dec-rewrite-20260308-010858-persona-runtime-audit-gap-closure-spec-lock-refresh": {
            "04f689c3bb3914905669880cc7b65dae49d95eca067b9f1b6343fa0409428ffe",
            "0ba5e493e14a8920945fb6f707de6fd807772bd4939cfe7b8ae039395cc0ec7a",
            "280164c8f879052436780757f7ccca49f7d62f0c467c103a2c71024f9448aa12",
            "40449a7aa7f500ae134fb879aac532232646f7a06b03687af858d67a56f02adc",
            "95bcf9b0006e6518fc17a9fc9b0f057a7219c9ad6bf3914d7708faa53ddc68b2",
            "9ad1de7d3f979df4feac78caf5272708f341fb51411f8acec7e669cb80e156a9",
            "bf281c32ab7fa92c9daf98071cd8429570ee67bbc6f28d81800c42b46691d147",
            "d3b3e012e6f6c264a78e862e0232baa2f602f75a249e232e954535804c8a62fb",
        },
        "dec-rewrite-20260308-044815-dockerhub-docker-management-and-unraid-template-publishing-audit-remediation-packet-spec-lock-refresh": {
            "014cd57d56cf3033f6f4577c9ed2ada5ef486f520eb4d3f60342a6c0e1ad2cec",
            "f7bd44528b01fec3911d5ebd45afd2fb70a018b315365395fe365fc56b9bf711",
        },
        "dec-rewrite-20260308-194441-plan-and-deep-plan-pt-wizard-escalation-and-assistant-to-interview-handoff-spec-lock-refresh": {
            "401fcf18059fb39dcc74ce7792a15f3c2f4c5e83b54f67e60f47586d7deb3067",
            "a7e82a7d876c1762071baa57a5376d00ff97bf46d2c537cb392df0c846c656c4",
            "f8fa53e1c4dcd574b6d4be5e6f3a4de4659ee9bc5ea89f3c30d7307671213222",
        },
        "dec-rewrite-20260308-203718-runtime-scheduler-scoring-wakeups-remediation-safe-points-and-decomposition-fallback-spec-lock-refresh": {
            "15517e1f4c4e3c9cc736a10bfef3696a43609ed541bdaaaa6cebd0be6a53c542",
            "f8eef42561abe3d00c1e65c0b03e95d6670b8883be2dec2653570d2ed2441996",
        },
        "dec-rewrite-20260309-004657-runtime-scheduler-scoring-wakeups-remediation-lineage-safe-points-retry-taxonomy-and-draft-decomposition-degradation-boundaries-spec-lock-refresh": {
            "64fba9a7cc49ef2620851745516c7c03880a1b691cceffa2d1add439dd7b7d6c",
            "7055563458f14709df2c1881ba7102fc521861d8dc3b8c915695ca7983f5af55",
        },
        "dec-rewrite-20260309-031700-runtime-scheduler-scoring-wakeups-remediation-safe-points-blocked-outcomes-and-decomposition-fallback-spec-lock-refresh": {
            "6e5d5251ae534c2011fcaf68cd0dfb6217ee2d34d0263929d851605fba31d4cc",
            "768d6a6a74b8b4eb23902cd5a78f28599f30451d3d3d68b16730421e60c52cd9",
        },
        "dec-rewrite-20260309-041936-runtime-scheduler-scoring-wakeups-remediation-safe-points-blocked-outcomes-and-decomposition-fallback-reconciliation-spec-lock-refresh": {
            "225acc272f6b034ac57b9ccf23d1ae60cab0313b45dc4fdf434b61aca4bacc55",
            "40a2a3759d401c13ee21a32fcc2fb2c052c983805346e3aa1450ff13f374ba7c",
        },
        "dec-rewrite-20260309-185017-runtime-scheduler-scoring-wakeups-remediation-safe-points-blocked-recovery-cross-doc-reconciliation-spec-lock-refresh": {
            "07cb77d93d2ddba09933d903ee93b759d8badc3d38091bf2328404a4696fe0a8",
            "0808474b9a64dd962abdbe244ee247af8ff2d3e54459097095d03488ef957700",
            "52bc05c0b6a13f529a00172fce2c61702193a1ef0358777ee8b091ca75b72b33",
            "81df0b6e9da5ecd527e0b0fa787ed82f84dfecdbfce13b72a97f86686bf4d697",
            "90349169f5e006640348cb254a3509f60ccf658248aeb4aa37114c42e3eefd78",
            "9876c629d47eacce552e7ff30f16c536c38bf55d4a07a92b9cdbb0b3c59e1bb5",
            "d884d1146b87b0b7ac4ae46bce395092901aa0c9b9396b6fb3c03533d3346607",
        },
        "dec-rewrite-20260310-172932-gui-artifacts-usage-panels-spec-lock-refresh": {
            "4bf8b70bbc83d612885862158364796e8d0b72856bf48d3627e3e019b051e69c",
            "d73cb2038593ec9c6608908e8b6810818d4a26ae6a04025501b26046c4f4749d",
            "feef3a7b04367df9fd30c6f01737b244a0b289e5407e3c1dc76f975fe72d2cc9",
        },
        "dec-rewrite-20260310-210122-gui-artifacts-usage-panels-spec-lock-refresh": {
            "3712172002ea50bdfbb6ccfd8e03fd9adca8d5a856fc755ba6cfe6ab7a3abc4c",
            "b175a279d43eff7d8d7ee369ea98d63d3260374ea5c7afc4febfedb08f3420f6",
            "ff9c09ac2085871bf2c2d0ba24ca4a75eb4d7a97377c0615b9d381a14709f7df",
        },
        "dec-rewrite-20260311-030008-gui-artifacts-usage-panels-spec-lock-refresh": {
            "8073fe511e7ab44a2117508b7f24229e2ef1448aaef7c640a3c1fa2fb323e697",
            "d6b5f5881b77c64e452f45e2fadba3eb33219b88b0173f54f499876295fec43c",
        },
        "dec-rewrite-20260311-152314-implementation-readiness-reconciliation-spec-lock-refresh": {
            "0c80ce8713732ba8743ff76f120ef18ae2d3780de8585e727cde961eb9a77240",
            "0cca67425d1ff312059dffa3b39cdfbd653ed07ffe667b1d2b1f5ce828ca7620",
            "5e432471930a8afd4c66fa2d7575ea91e147c1f210dec57c2ab349046d702b7c",
            "a3ef94696513ca07fd834a83cc591ef6445255702015ab84458e3b36edf314f3",
            "c0ecc5d5d7fa3e347a51f77aa7cd1cc5acc6d8bb2481fbec115ea25d07a1770a",
        },
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
                decision_rows.setdefault(decision_id, []).append(
                    {
                        "path": rel(target),
                        "line": line_no,
                        "inputs_hash": row.get("inputs_hash"),
                    }
                )

    duplicate_policy_notes = []
    for decision_id, entries in sorted(decision_rows.items()):
        if len(entries) <= 1:
            continue
        allowed_hashes = historical_duplicate_identities.get(decision_id, set())
        if not allowed_hashes:
            failures.append(
                {
                    "path": "Plans/auto_decisions.jsonl",
                    "decision_id": decision_id,
                    "error": "duplicate_decision_id",
                    "count": len(entries),
                    "allowed_historical_identities": 0,
                }
            )
            continue
        seen_hashes: dict[str, int] = {}
        for entry in entries:
            inputs_hash = entry.get("inputs_hash")
            if not isinstance(inputs_hash, str) or inputs_hash not in allowed_hashes:
                failures.append(
                    {
                        "path": entry["path"],
                        "line": entry["line"],
                        "decision_id": decision_id,
                        "inputs_hash": inputs_hash,
                        "error": "non_grandfathered_duplicate_decision_identity",
                    }
                )
                continue
            seen_hashes[inputs_hash] = seen_hashes.get(inputs_hash, 0) + 1
        for inputs_hash, count in sorted(seen_hashes.items()):
            if count > 1:
                failures.append(
                    {
                        "path": "Plans/auto_decisions.jsonl",
                        "decision_id": decision_id,
                        "inputs_hash": inputs_hash,
                        "error": "duplicate_grandfathered_decision_identity",
                        "count": count,
                    }
                )
        if not any(failure.get("decision_id") == decision_id for failure in failures):
            duplicate_policy_notes.append(
                {
                    "decision_id": decision_id,
                    "historical_identity_count": len(allowed_hashes),
                    "present_identity_count": len(seen_hashes),
                }
            )

    return report_status(
        "validate-auto-decisions",
        failures,
        rows_checked=rows_checked,
        historical_duplicate_policy="listed pre-existing (decision_id, inputs_hash) identities are grandfathered; any new duplicate decision_id or changed duplicate identity fails validation",
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
    proc, timeout_report = run_validator_subprocess(
        "check-shards",
        [sys.executable, "scripts/pm-shard-plans.py", "--check", "--report", report_path],
        timeout_seconds=timeout_seconds,
    )
    if timeout_report is not None:
        if temp_path is not None:
            temp_path.unlink(missing_ok=True)
        return timeout_report
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
    "restore_point": ["restore_point_id"],
    "browser_recording": ["browser_session_id", "runtime_state", "open_watch_state", "artifact_refs", "redaction_profile_id", "show_when_possible"],
    "tool_llm_trace": ["trace_ref", "usage_record_id"],
    "context_snapshot": ["snapshot_ref"],
    "cost_usage": ["usage_event_ref", "usage_record_id", "reasoning_tokens"],
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
    envelope_properties = envelope.get("properties", {})
    expected_freshness = ["current", "refreshing", "stale"]
    expected_health = ["healthy", "degraded", "unavailable"]
    if envelope_properties.get("projection_freshness", {}).get("enum") != expected_freshness:
        failures.append(
            {
                "path": rel(envelope_path),
                "error": "runtime_artifact_projection_freshness_axis_mismatch",
                "expected": expected_freshness,
                "actual": envelope_properties.get("projection_freshness", {}).get("enum"),
            }
        )
    if envelope_properties.get("projection_health", {}).get("enum") != expected_health:
        failures.append(
            {
                "path": rel(envelope_path),
                "error": "runtime_artifact_projection_health_axis_mismatch",
                "expected": expected_health,
                "actual": envelope_properties.get("projection_health", {}).get("enum"),
            }
        )
    valid_payloads = fixtures.get("valid_payloads", [])
    payloads_by_type: dict[str, list[dict[str, Any]]] = {}
    for payload in valid_payloads:
        if isinstance(payload, dict) and isinstance(payload.get("artifact_type"), str):
            payloads_by_type.setdefault(payload["artifact_type"], []).append(payload)

    for artifact_type in RUNTIME_ARTIFACT_TYPES:
        schema_path = PLANS / f"runtime_artifact_{artifact_type}.schema.json"
        if not schema_path.exists():
            failures.append({"path": rel(schema_path), "artifact_type": artifact_type, "error": "missing_runtime_artifact_type_schema"})
            continue
        schema = load_json(schema_path)
        expected_id = f"pm.runtime_artifact.{artifact_type}.schema.v1"
        if schema.get("$id") != expected_id:
            failures.append({"path": rel(schema_path), "artifact_type": artifact_type, "error": "wrong_schema_id", "expected": expected_id})
        schema_required = schema.get("required", [])
        schema_properties = schema.get("properties", {})
        if artifact_type == "restore_point" and set(schema_properties) != set(envelope_properties):
            failures.append(
                {
                    "path": rel(schema_path),
                    "artifact_type": artifact_type,
                    "error": "runtime_artifact_outer_property_parity_mismatch",
                    "expected": sorted(envelope_properties),
                    "actual": sorted(schema_properties),
                }
            )
        if artifact_type == "restore_point":
            unexpected_runtime_requirements = sorted(
                {"run_id", "attempt_id"}.intersection(schema_required)
            )
            if unexpected_runtime_requirements:
                failures.append(
                    {
                        "path": rel(schema_path),
                        "artifact_type": artifact_type,
                        "error": "restore_point_runtime_ids_must_be_optional",
                        "actual": unexpected_runtime_requirements,
                    }
                )
        else:
            missing_runtime_requirements = sorted(
                {"run_id", "attempt_id"}.difference(schema_required)
            )
            if missing_runtime_requirements:
                failures.append(
                    {
                        "path": rel(schema_path),
                        "artifact_type": artifact_type,
                        "error": "non_restore_runtime_ids_not_required",
                        "missing": missing_runtime_requirements,
                    }
                )
        payloads = payloads_by_type.get(artifact_type, [])
        if not payloads:
            failures.append({"path": rel(fixture_path), "artifact_type": artifact_type, "error": "missing_valid_payload_fixture"})
            continue
        for payload_index, payload in enumerate(payloads):
            fixture_ref = f"{artifact_type}[{payload_index}]"
            for error in validate_schema(payload, envelope, envelope):
                failures.append({"path": rel(fixture_path), "artifact_type": artifact_type, "fixture": fixture_ref, "schema": rel(envelope_path), "error": error})
            for error in validate_schema(payload, schema, schema):
                failures.append({"path": rel(fixture_path), "artifact_type": artifact_type, "fixture": fixture_ref, "schema": rel(schema_path), "error": error})
            type_payload = payload.get("type_payload", {})
            for field in RUNTIME_ARTIFACT_REQUIRED_PAYLOAD_FIELDS[artifact_type]:
                if field not in type_payload and field not in payload:
                    failures.append({"path": rel(fixture_path), "artifact_type": artifact_type, "fixture": fixture_ref, "error": "missing_type_payload_field", "field": field})
            if artifact_type == "cost_usage":
                if type_payload.get("reasoning_tokens", -1) < 0:
                    failures.append({"path": rel(fixture_path), "artifact_type": artifact_type, "fixture": fixture_ref, "error": "reasoning_tokens_negative"})
                usage = type_payload.get("usage", {})
                if not isinstance(usage, dict):
                    failures.append({"path": rel(fixture_path), "artifact_type": artifact_type, "fixture": fixture_ref, "error": "cost_usage_missing_usage_bucket_object"})
                else:
                    if usage.get("reasoning_tokens") != type_payload.get("reasoning_tokens"):
                        failures.append({"path": rel(fixture_path), "artifact_type": artifact_type, "fixture": fixture_ref, "error": "reasoning_tokens_not_mirrored_from_usage_bucket"})
                    counting = usage.get("counting_semantics", {})
                    if not isinstance(counting, dict):
                        failures.append({"path": rel(fixture_path), "artifact_type": artifact_type, "fixture": fixture_ref, "error": "cost_usage_missing_counting_semantics"})
                    else:
                        for field in ["input_total_includes_cache", "output_total_includes_reasoning", "provider_total_semantics"]:
                            if field not in counting:
                                failures.append({"path": rel(fixture_path), "artifact_type": artifact_type, "fixture": fixture_ref, "field": field, "error": "cost_usage_missing_counting_semantics_field"})
                        if counting.get("output_total_includes_reasoning") == "yes" and usage.get("output_total") is not None and usage.get("reasoning_tokens") is not None:
                            if usage["output_total"] < usage["reasoning_tokens"]:
                                failures.append({"path": rel(fixture_path), "artifact_type": artifact_type, "fixture": fixture_ref, "error": "reasoning_tokens_exceed_inclusive_output_total"})
            if artifact_type in {"hitl_approval", "failed_attempts"} and not payload.get("receipt_refs"):
                failures.append({"path": rel(fixture_path), "artifact_type": artifact_type, "fixture": fixture_ref, "error": "receipt_like_artifact_missing_receipt_refs"})

    event_records = fixtures.get("event_records", [])
    event_types = {record.get("artifact_type") for record in event_records if isinstance(record, dict)}
    for artifact_type in RUNTIME_ARTIFACT_TYPES:
        if artifact_type not in event_types:
            failures.append({"path": rel(fixture_path), "artifact_type": artifact_type, "error": "missing_event_record_fixture"})
    restore_event_records = [
        record
        for record in event_records
        if isinstance(record, dict) and record.get("artifact_type") == "restore_point"
    ]
    if not any(
        isinstance(record.get("project_id"), str)
        and bool(record.get("project_id"))
        and isinstance(record.get("artifact_id"), str)
        and bool(record.get("artifact_id"))
        and isinstance(record.get("restore_point_id"), str)
        and bool(record.get("restore_point_id"))
        for record in restore_event_records
    ):
        failures.append(
            {
                "path": rel(fixture_path),
                "artifact_type": "restore_point",
                "error": "restore_point_event_primary_identity_missing",
            }
        )

    browser_fixture_actions: set[str] = set()
    browser_page_representations: list[dict[str, Any]] = []
    extract_fixture_actions: set[str] = set()
    for payload in valid_payloads:
        if not isinstance(payload, dict):
            continue
        type_payload = payload.get("type_payload", {})
        if not isinstance(type_payload, dict):
            continue
        if payload.get("artifact_type") == "browser_recording":
            for action_result in type_payload.get("actions", []):
                if isinstance(action_result, dict):
                    action = action_result.get("action", {})
                    if isinstance(action, dict) and isinstance(action.get("action_type"), str):
                        browser_fixture_actions.add(action["action_type"])
                    page_representation = action_result.get("page_representation")
                    if isinstance(page_representation, dict):
                        browser_page_representations.append(page_representation)
        if payload.get("artifact_type") == "api_web_call":
            operation_input = type_payload.get("operation_input", {})
            if isinstance(operation_input, dict) and operation_input.get("web_operation") == "extract":
                for action in operation_input.get("actions", []):
                    if isinstance(action, dict) and isinstance(action.get("action_type"), str):
                        extract_fixture_actions.add(action["action_type"])
    for action_type in ["fill_form", "select_option", "upload_file", "handle_dialog", "verify_text"]:
        if action_type not in browser_fixture_actions:
            failures.append({"path": rel(fixture_path), "artifact_type": "browser_recording", "action_type": action_type, "error": "missing_positive_browser_action_fixture"})
    for action_type in ["fill_form", "select_option", "upload_file", "handle_dialog"]:
        if action_type not in extract_fixture_actions:
            failures.append({"path": rel(fixture_path), "artifact_type": "api_web_call", "web_operation": "extract", "action_type": action_type, "error": "missing_positive_extract_browser_action_fixture"})
    page_representation_required_fields = {
        "observe_ref",
        "find_results_ref",
        "detail_ref",
        "accessibility_tree_ref",
        "layout_bounds_ref",
        "form_refs",
        "iframe_refs",
        "console_ref",
        "network_ref",
        "screenshot_artifact_ref",
        "pdf_artifact_ref",
        "prompt_injection_chips",
        "visible_card_ref",
        "redaction_profile_id",
    }
    if not any(page_representation_required_fields <= set(page) for page in browser_page_representations):
        failures.append({"path": rel(fixture_path), "artifact_type": "browser_recording", "error": "missing_positive_page_representation_evidence_fixture"})

    invalid_payloads = fixtures.get("invalid_payloads", [])
    invalid_case_ids = {
        invalid.get("case_id")
        for invalid in invalid_payloads
        if isinstance(invalid, dict)
    }
    required_invalid_case_ids = {
        "api_web_call_agentic_invocation_missing_reason",
        "api_web_call_extract_actions_over_limit",
        "api_web_call_extract_actions_timeout_over_limit",
        "api_web_call_research_missing_read_backed_citation",
        "api_web_call_prd_missing_source_evidence",
        "api_web_call_planning_missing_source_evidence",
        "browser_recording_agentic_invocation_missing_reason",
        "browser_recording_fallback_open_missing_route",
        "browser_recording_runtime_unavailable_missing_remediation",
        "browser_recording_runtime_unavailable_missing_runtime_state",
        "missing_attempt_id",
        "non_restore_missing_run_id",
        "projection_freshness_degraded_is_health_only",
        "projection_freshness_unavailable_is_health_only",
        "projection_health_stale_is_freshness_only",
        "restore_point_missing_primary_restore_point_id",
        "restore_point_incomplete_safe_point_lineage",
    }
    for case_id in sorted(required_invalid_case_ids - invalid_case_ids):
        failures.append({"path": rel(fixture_path), "invalid_fixture": case_id, "error": "missing_required_runtime_invalid_fixture"})

    for invalid in invalid_payloads:
        artifact_type = invalid.get("artifact_type")
        payload = invalid.get("payload", {})
        schema_path = PLANS / f"runtime_artifact_{artifact_type}.schema.json"
        schema = load_json(schema_path) if schema_path.exists() else {}
        schema_errors = validate_schema(payload, envelope, envelope) + validate_schema(payload, schema, schema)
        case_id = invalid.get("case_id")
        envelope_owned_negative_ids = {
            "missing_attempt_id",
            "non_restore_missing_run_id",
            "projection_freshness_degraded_is_health_only",
            "projection_freshness_unavailable_is_health_only",
            "projection_health_stale_is_freshness_only",
        }
        if case_id in envelope_owned_negative_ids and not validate_schema(
            payload,
            envelope,
            envelope,
        ):
            failures.append(
                {
                    "path": rel(fixture_path),
                    "invalid_fixture": case_id,
                    "error": "runtime_artifact_envelope_owned_negative_unexpectedly_valid",
                }
            )
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

    restore_positive_ids = {
        payload.get("artifact_id")
        for payload in valid_payloads
        if isinstance(payload, dict) and payload.get("artifact_type") == "restore_point"
    }
    required_restore_positive_ids = {
        "restore_point_without_runtime_or_safe_point_lineage",
        "restore_point_with_runtime_and_safe_point_lineage",
    }
    for fixture_id in sorted(required_restore_positive_ids - restore_positive_ids):
        failures.append(
            {
                "path": rel(fixture_path),
                "artifact_type": "restore_point",
                "fixture": fixture_id,
                "error": "missing_required_restore_point_positive_fixture",
            }
        )

    non_restore_types = set(RUNTIME_ARTIFACT_TYPES) - {"restore_point"}
    schemas_requiring_runtime_ids = 0
    for artifact_type in sorted(non_restore_types):
        schema_path = PLANS / f"runtime_artifact_{artifact_type}.schema.json"
        if schema_path.exists() and {"run_id", "attempt_id"}.issubset(
            set(load_json(schema_path).get("required", []))
        ):
            schemas_requiring_runtime_ids += 1
    if schemas_requiring_runtime_ids != 18:
        failures.append(
            {
                "path": rel(envelope_path),
                "error": "runtime_artifact_non_restore_runtime_id_sibling_count_mismatch",
                "expected": 18,
                "actual": schemas_requiring_runtime_ids,
            }
        )

    return report_status(
        "validate-runtime-artifact-schemas",
        failures,
        artifact_types_checked=len(RUNTIME_ARTIFACT_TYPES),
        non_restore_runtime_id_siblings_checked=schemas_requiring_runtime_ids,
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

    gui_manifest = load_json(fixture_root / "schema_payloads/gui_automation_manifest.json")
    browser_sessions = gui_manifest.get("browser_sessions", []) if isinstance(gui_manifest, dict) else []
    if not isinstance(browser_sessions, list) or not browser_sessions:
        failures.append({"path": str((fixture_root / "schema_payloads/gui_automation_manifest.json").relative_to(ROOT)), "error": "missing_positive_browser_session_fixture"})
    else:
        browser_session_ids = {
            session.get("browser_session_id")
            for session in browser_sessions
            if isinstance(session, dict)
        }
        artifact_rows = gui_manifest.get("artifacts", []) if isinstance(gui_manifest, dict) else []
        browser_artifacts = [
            artifact for artifact in artifact_rows
            if isinstance(artifact, dict) and artifact.get("kind") in {"browser_screenshot", "browser_pdf", "console", "network"}
        ]
        artifact_session_ids = {
            artifact.get("browser_session_id")
            for artifact in browser_artifacts
            if isinstance(artifact, dict)
        }
        for required_kind in ["browser_screenshot", "browser_pdf", "console", "network"]:
            if required_kind not in {artifact.get("kind") for artifact in browser_artifacts}:
                failures.append({"path": str((fixture_root / "schema_payloads/gui_automation_manifest.json").relative_to(ROOT)), "kind": required_kind, "error": "missing_positive_browser_artifact_fixture"})
        for artifact in browser_artifacts:
            redaction_status = artifact.get("redaction_status")
            if redaction_status not in {"not_needed", "applied", "blocked"}:
                failures.append({
                    "path": str((fixture_root / "schema_payloads/gui_automation_manifest.json").relative_to(ROOT)),
                    "artifact_id": artifact.get("artifact_id"),
                    "redaction_status": redaction_status,
                    "error": "browser_artifact_missing_or_failed_redaction_status",
                })
        if not browser_session_ids.intersection(artifact_session_ids):
            failures.append({"path": str((fixture_root / "schema_payloads/gui_automation_manifest.json").relative_to(ROOT)), "error": "browser_artifacts_not_linked_to_browser_session"})
        runtime_unavailable_sessions = [
            session for session in browser_sessions
            if isinstance(session, dict) and session.get("visibility_state") == "runtime_unavailable"
        ]
        if not runtime_unavailable_sessions:
            failures.append({"path": str((fixture_root / "schema_payloads/gui_automation_manifest.json").relative_to(ROOT)), "error": "missing_runtime_unavailable_browser_session_fixture"})
        for session in runtime_unavailable_sessions:
            if not session.get("disabled_reason_code") or not session.get("remediation_action_ids"):
                failures.append({"path": str((fixture_root / "schema_payloads/gui_automation_manifest.json").relative_to(ROOT)), "browser_session_id": session.get("browser_session_id"), "error": "runtime_unavailable_browser_session_missing_remediation"})

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


USAGE_GUI_REQUIRED_FIXTURE_IDS = [
    "GUI-USG-001",
    "GUI-USG-002",
    "GUI-USG-003",
    "GUI-USG-004",
    "GUI-USG-005",
    "GUI-USG-006",
    "GUI-USG-007",
    "GUI-USG-008",
    "GUI-CBP-001",
    "GUI-CBP-002",
    "GUI-ROUTE-001",
    "GUI-RAW-001",
    "GUI-RAP-001",
]

USAGE_GUI_REQUIRED_FIXTURE_TOKENS = {
    "GUI-USG-001": ["source_class:unknown", "source_confidence:unknown", "source_authority:unknown", "usage_reporting_state:unknown_or_unavailable", "zero_tokens", "zero_cost"],
    "GUI-USG-002": ["source_class:provider_reported", "source_confidence", "source_authority", "settlement_status:settled_or_adjusted", "zero_buckets", "provider_payload_hash"],
    "GUI-USG-003": ["cost_status:unknown", "source_confidence", "source_authority", "cost_microdollars:null", "cost_minor_units:null", "$0.00"],
    "GUI-USG-004": ["usage_event_ref", "usage_record_id", "source_confidence", "source_authority", "hidden_byok", "hidden_subscription", "fake_per_token_price"],
    "GUI-USG-005": ["quota_status:disabled", "disabled_reason", "zero_remaining", "reset_countdown"],
    "GUI-USG-006": ["cache_read:0", "cache_reporting_state:reported", "cache_reporting_state:not_exposed", "unsupported_cache_as_zero"],
    "GUI-USG-007": ["counting_semantics", "input_total_includes_cache", "output_total_includes_reasoning", "double_counted_total"],
    "GUI-USG-008": ["settlement_status:streaming_partial_or_failed", "stream_state:partial_or_aborted", "dedupe_key", "duplicate_partial_rollup"],
    "GUI-CBP-001": ["/stats", "/usage", "/quota", "/credits", "usage:unknown", "quota:not_exposed"],
    "GUI-CBP-002": ["provider_id:antigravity_cli", "route:agy", "G1 credits", "UseG1Credits", "provider_total_from_credits"],
    "GUI-ROUTE-001": ["route_target.object_kind:usage_event", "object_id:usage_event_ref", "usage_record_id", "source_class", "source_confidence", "source_authority", "settlement_status", "projection_freshness", "projection_health", "timestamp_primary_route"],
    "GUI-RAW-001": ["Curated normalized fields", "source_class", "source_confidence", "source_authority", "Raw redacted refs", "provider_payload_hash", "raw_provider_secrets"],
    "GUI-RAP-001": ["cost_usage", "tool_llm_trace", "envelope_plus_per_type", "envelope_only_valid", "arbitrary_non_empty_type_payload_valid"],
}


LEGACY_USAGE_TERMS = [
    "input_tokens",
    "output_tokens",
    "cache_read_tokens",
    "cache_write_tokens",
    "cache_read_input_tokens",
    "cache_creation_input_tokens",
    "cached_input_tokens",
    "estimated_cost_microdollars",
    "final_cost_microdollars",
    "cost_is_estimate",
    "usage_source",
    "usage_source_kind",
    "provider_usage_source_kind",
    "provider_signal_confidence",
    "UnifiedUsageRecord",
    "reasoning_tokens",
]
LEGACY_USAGE_TERM_RE = re.compile(
    r"(?<![A-Za-z0-9_])("
    + "|".join(re.escape(term) for term in sorted(LEGACY_USAGE_TERMS, key=len, reverse=True))
    + r")(?![A-Za-z0-9_])"
)
USAGE_DRIFT_ALLOWED_CONTEXT_RE = re.compile(
    r"\b("
    r"compatibility|compatibility-only|legacy|alias|aliases|normalize|normalizes|normalized|"
    r"maps?|mapping|mapper|migration|import|export|source-lineage|retired|stale|"
    r"provider-native raw|raw mapper input|raw alias|raw aliases|redacted provider payload|"
    r"schema|json schema|uf-085|must not|do not|not active|external-reference|external reference|"
    r"preserved_exact_tokens|stale_retired_dispositions|negative_constraints|compatible with"
    r")\b",
    re.IGNORECASE,
)
USAGE_DRIFT_SOURCE_LINEAGE_DOCS = {
    "Plans/Provider_Stream_Mapping_External_Reference_A2A.md",
}
USAGE_SOURCE_CONFIDENCE_VALUES = {"high", "medium", "low", "unknown"}
USAGE_SOURCE_CONFIDENCE_ASSIGNMENT_RE = re.compile(
    r"(?P<key_quote>[\"']?)source_confidence(?P=key_quote)\s*[:=]\s*"
    r"(?P<value_quote>[\"']?)(?P<value>[A-Za-z0-9_-]+)(?P=value_quote)"
)
USAGE_SOURCE_CONFIDENCE_ALLOWED_CONTEXT_RE = re.compile(
    r"\b("
    r"compatibility|compatibility-only|legacy|retired|source-lineage|source lineage|"
    r"external-reference|external reference|preserved_exact_tokens|source_lineage|"
    r"compatibility_only_notes|stale_retired_dispositions"
    r")\b",
    re.IGNORECASE,
)
USAGE_SOURCE_CONFIDENCE_CONTEXT_KEYS = {
    "source_lineage",
    "preserved_exact_tokens",
    "compatibility_only_notes",
    "stale_retired_dispositions",
    "external_reference",
    "external_references",
}
USAGE_SOURCE_CONFIDENCE_EXCLUDED_PLAN_DIRS = {
    "_shards",
    "ledgers",
    ".audits",
    ".evidence",
    ".implementation_readiness",
    ".plan_index",
    ".plan_migration",
}


def usage_drift_in_yaml_list(lines: list[str], index: int, keys: set[str]) -> bool:
    """Return true when a line belongs to a source-lineage/preserved-token YAML list."""
    for cursor in range(index, max(-1, index - 25), -1):
        stripped = lines[cursor].strip()
        if not stripped:
            continue
        if stripped in {"```", "```yaml"}:
            return False
        for key in keys:
            if stripped.startswith(f"{key}:"):
                return True
        if re.match(r"^[A-Za-z_][A-Za-z0-9_ -]*:\s*(\[.*\])?$", stripped) and not stripped.startswith("- "):
            return False
    return False


def source_confidence_failure(
    *,
    path: str,
    line: int | None,
    value: str,
    text: str,
    location: str | None = None,
) -> dict[str, Any]:
    failure: dict[str, Any] = {
        "path": path,
        "field": "source_confidence",
        "value": value,
        "allowed_values": sorted(USAGE_SOURCE_CONFIDENCE_VALUES),
        "error": "active_source_confidence_value_outside_canonical_enum",
        "text": text.strip()[:240],
    }
    if line is not None:
        failure["line"] = line
    if location:
        failure["location"] = location
    return failure


def source_confidence_scan_text_assignments(
    *,
    text: str,
    path_key: str,
    start_line: int,
    allowed_context: bool,
) -> tuple[list[dict[str, Any]], int, int]:
    failures: list[dict[str, Any]] = []
    scanned = 0
    allowed = 0
    for offset, line in enumerate(text.splitlines()):
        for match in USAGE_SOURCE_CONFIDENCE_ASSIGNMENT_RE.finditer(line):
            scanned += 1
            value = match.group("value")
            if value in USAGE_SOURCE_CONFIDENCE_VALUES:
                continue
            if allowed_context:
                allowed += 1
                continue
            failures.append(
                source_confidence_failure(
                    path=path_key,
                    line=start_line + offset,
                    value=value,
                    text=line,
                )
            )
    return failures, scanned, allowed


def source_confidence_scan_json_value(
    *,
    value: Any,
    path_key: str,
    location: str,
    context_allowed: bool = False,
) -> tuple[list[dict[str, Any]], int, int]:
    failures: list[dict[str, Any]] = []
    scanned = 0
    allowed = 0
    if isinstance(value, dict):
        for key, child in value.items():
            child_location = f"{location}/{key}"
            if key == "source_confidence" and isinstance(child, str):
                scanned += 1
                if child not in USAGE_SOURCE_CONFIDENCE_VALUES:
                    if context_allowed:
                        allowed += 1
                    else:
                        failures.append(
                            source_confidence_failure(
                                path=path_key,
                                line=None,
                                value=child,
                                text=f"{key}: {child}",
                                location=child_location,
                            )
                        )
                continue
            child_failures, child_scanned, child_allowed = source_confidence_scan_json_value(
                value=child,
                path_key=path_key,
                location=child_location,
                context_allowed=context_allowed or key in USAGE_SOURCE_CONFIDENCE_CONTEXT_KEYS,
            )
            failures.extend(child_failures)
            scanned += child_scanned
            allowed += child_allowed
    elif isinstance(value, list):
        for index, child in enumerate(value):
            child_failures, child_scanned, child_allowed = source_confidence_scan_json_value(
                value=child,
                path_key=path_key,
                location=f"{location}/{index}",
                context_allowed=context_allowed,
            )
            failures.extend(child_failures)
            scanned += child_scanned
            allowed += child_allowed
    return failures, scanned, allowed


def source_confidence_scan_markdown(
    path: Path,
) -> tuple[list[dict[str, Any]], int, int]:
    path_key = rel(path)
    lines = path.read_text(encoding="utf-8").splitlines()
    failures: list[dict[str, Any]] = []
    scanned = 0
    allowed = 0
    in_fence = False
    fence_lang = ""
    fence_start = 0
    fence_lines: list[str] = []
    for index, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith("```"):
            if in_fence:
                if fence_lang in {"json", "yaml", "yml"}:
                    context = "\n".join(lines[max(0, fence_start - 4) : min(len(lines), index + 4)])
                    block = "\n".join(fence_lines)
                    block_failures, block_scanned, block_allowed = source_confidence_scan_text_assignments(
                        text=block,
                        path_key=path_key,
                        start_line=fence_start + 2,
                        allowed_context=bool(USAGE_SOURCE_CONFIDENCE_ALLOWED_CONTEXT_RE.search(context)),
                    )
                    failures.extend(block_failures)
                    scanned += block_scanned
                    allowed += block_allowed
                in_fence = False
                fence_lang = ""
                fence_lines = []
                continue
            fence_lang = stripped.removeprefix("```").strip().lower()
            in_fence = True
            fence_start = index
            fence_lines = []
            continue
        if in_fence:
            fence_lines.append(line)
    return failures, scanned, allowed


def active_usage_source_confidence_paths() -> list[Path]:
    paths: list[Path] = []
    for path in PLANS.rglob("*"):
        if not path.is_file():
            continue
        if path.suffix.lower() not in {".md", ".json", ".jsonl", ".yaml", ".yml"}:
            continue
        relative_parts = path.relative_to(PLANS).parts
        if relative_parts and relative_parts[0] in USAGE_SOURCE_CONFIDENCE_EXCLUDED_PLAN_DIRS:
            continue
        paths.append(path)
    return sorted(paths)


def source_confidence_scan_active_examples() -> tuple[list[dict[str, Any]], int, int]:
    failures: list[dict[str, Any]] = []
    scanned = 0
    allowed = 0
    for path in active_usage_source_confidence_paths():
        path_key = rel(path)
        suffix = path.suffix.lower()
        if suffix == ".md":
            path_failures, path_scanned, path_allowed = source_confidence_scan_markdown(path)
        elif suffix == ".json":
            path_failures, path_scanned, path_allowed = source_confidence_scan_json_value(
                value=load_json(path),
                path_key=path_key,
                location="$",
            )
        elif suffix == ".jsonl":
            path_failures = []
            path_scanned = 0
            path_allowed = 0
            for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
                if not line.strip():
                    continue
                line_failures, line_scanned, line_allowed = source_confidence_scan_json_value(
                    value=json.loads(line),
                    path_key=path_key,
                    location=f"${line_number}",
                )
                path_failures.extend(line_failures)
                path_scanned += line_scanned
                path_allowed += line_allowed
        else:
            context_allowed = bool(USAGE_SOURCE_CONFIDENCE_ALLOWED_CONTEXT_RE.search(path.read_text(encoding="utf-8")))
            path_failures, path_scanned, path_allowed = source_confidence_scan_text_assignments(
                text=path.read_text(encoding="utf-8"),
                path_key=path_key,
                start_line=1,
                allowed_context=context_allowed,
            )
        failures.extend(path_failures)
        scanned += path_scanned
        allowed += path_allowed
    return failures, scanned, allowed


def cmd_validate_usage_contract_drift(args: argparse.Namespace) -> dict[str, Any]:
    failures: list[dict[str, Any]] = []
    scanned_occurrences = 0
    allowed_occurrences = 0
    scanned_source_confidence_assignments = 0
    allowed_source_confidence_assignments = 0
    scanned_docs = 0
    source_lineage_docs = 0
    lineage_keys = {
        "source_lineage",
        "preserved_exact_tokens",
        "compatibility_only_notes",
        "stale_retired_dispositions",
    }
    schema_path = PLANS / "runtime_artifact_cost_usage.schema.json"
    try:
        cost_usage_schema = load_json(schema_path)
        schema_values = set(
            cost_usage_schema.get("$defs", {})
            .get("authorityFields", {})
            .get("properties", {})
            .get("source_confidence", {})
            .get("enum", [])
        )
    except Exception as exc:  # noqa: BLE001
        failures.append({"path": rel(schema_path), "error": "source_confidence_schema_read_failed", "detail": str(exc)})
        schema_values = set()
    if schema_values != USAGE_SOURCE_CONFIDENCE_VALUES:
        failures.append(
            {
                "path": rel(schema_path),
                "error": "source_confidence_enum_mismatch",
                "expected": sorted(USAGE_SOURCE_CONFIDENCE_VALUES),
                "actual": sorted(schema_values),
            }
        )

    for path in sorted(PLANS.glob("*.md")):
        path_key = rel(path)
        if path_key in USAGE_DRIFT_SOURCE_LINEAGE_DOCS:
            source_lineage_docs += 1
            continue
        scanned_docs += 1
        lines = path.read_text(encoding="utf-8").splitlines()
        for index, line in enumerate(lines):
            context: str | None = None
            matches = sorted(set(LEGACY_USAGE_TERM_RE.findall(line)))
            if matches:
                scanned_occurrences += len(matches)
                context = "\n".join(lines[max(0, index - 3) : min(len(lines), index + 4)])
                if usage_drift_in_yaml_list(lines, index, lineage_keys):
                    allowed_occurrences += len(matches)
                elif USAGE_DRIFT_ALLOWED_CONTEXT_RE.search(context):
                    allowed_occurrences += len(matches)
                else:
                    failures.append(
                        {
                            "path": path_key,
                            "line": index + 1,
                            "terms": matches,
                            "error": "active_legacy_usage_vocabulary_without_mapping_or_retirement",
                            "text": line.strip()[:240],
                        }
                    )
    source_confidence_failures, source_confidence_scanned, source_confidence_allowed = source_confidence_scan_active_examples()
    failures.extend(source_confidence_failures)
    scanned_source_confidence_assignments += source_confidence_scanned
    allowed_source_confidence_assignments += source_confidence_allowed

    return report_status(
        "validate-usage-contract-drift",
        failures,
        scanned_docs=scanned_docs,
        source_lineage_docs=source_lineage_docs,
        scanned_occurrences=scanned_occurrences,
        allowed_occurrences=allowed_occurrences,
        scanned_source_confidence_assignments=scanned_source_confidence_assignments,
        allowed_source_confidence_assignments=allowed_source_confidence_assignments,
    )


def cmd_validate_usage_gui_fixtures(args: argparse.Namespace) -> dict[str, Any]:
    failures: list[dict[str, Any]] = []
    fixture_path = ROOT / "tests/fixtures/usage_gui/golden/usage_gui_acceptance_fixtures.json"
    if not fixture_path.exists():
        failures.append({"path": rel(fixture_path), "error": "missing_usage_gui_fixture_matrix"})
        return report_status("validate-usage-gui-fixtures", failures)

    fixture_matrix = load_json(fixture_path)
    if fixture_matrix.get("schema_id") != "pm.usage_gui.acceptance_fixture_matrix.v1":
        failures.append({"path": rel(fixture_path), "error": "wrong_schema_id"})
    if fixture_matrix.get("owner_plan_unit") != "UF-088":
        failures.append({"path": rel(fixture_path), "error": "wrong_owner_plan_unit"})

    fixtures = fixture_matrix.get("fixtures", [])
    if not isinstance(fixtures, list):
        return report_status("validate-usage-gui-fixtures", [{"path": rel(fixture_path), "error": "fixtures_not_list"}])

    by_id: dict[str, dict[str, Any]] = {}
    for index, fixture in enumerate(fixtures):
        if not isinstance(fixture, dict):
            failures.append({"path": rel(fixture_path), "fixture_index": index, "error": "fixture_not_object"})
            continue
        fixture_id = fixture.get("fixture_id")
        if not isinstance(fixture_id, str):
            failures.append({"path": rel(fixture_path), "fixture_index": index, "error": "fixture_id_missing"})
            continue
        if fixture_id in by_id:
            failures.append({"path": rel(fixture_path), "fixture_id": fixture_id, "error": "duplicate_fixture_id"})
        by_id[fixture_id] = fixture

        for field in ["surfaces", "source_lineage", "must", "must_not"]:
            values = fixture.get(field)
            if not isinstance(values, list) or not values or not all(isinstance(value, str) and value for value in values):
                failures.append({"path": rel(fixture_path), "fixture_id": fixture_id, "field": field, "error": "missing_or_invalid_fixture_list"})

        fixture_text = json.dumps(fixture, sort_keys=True)
        for token in USAGE_GUI_REQUIRED_FIXTURE_TOKENS.get(fixture_id, []):
            if token not in fixture_text:
                failures.append({"path": rel(fixture_path), "fixture_id": fixture_id, "token": token, "error": "missing_required_fixture_assertion_token"})

    expected = set(USAGE_GUI_REQUIRED_FIXTURE_IDS)
    actual = set(by_id)
    for fixture_id in sorted(expected - actual):
        failures.append({"path": rel(fixture_path), "fixture_id": fixture_id, "error": "missing_required_usage_gui_fixture"})
    for fixture_id in sorted(actual - expected):
        failures.append({"path": rel(fixture_path), "fixture_id": fixture_id, "error": "unexpected_usage_gui_fixture"})

    return report_status(
        "validate-usage-gui-fixtures",
        failures,
        required_fixture_count=len(USAGE_GUI_REQUIRED_FIXTURE_IDS),
        fixture_count=len(fixtures),
    )


COMMAND_TOKEN_RE = re.compile(r"(?<![A-Za-z0-9_])cmd\.[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)*(?![A-Za-z0-9_])")
HANDLER_LOCATION_RE = re.compile(r"^(crate::)?[A-Za-z_][A-Za-z0-9_]*(::[A-Za-z_][A-Za-z0-9_]*)+$")
RETIRED_CHAT_USAGE_COMMAND_IDS = {
    "cmd.chat.open_thread_usage",
    "cmd.chat.focus_thread_usage",
    "cmd.chat.close_thread_usage",
}
RETIRED_WEB_COMMAND_RE = re.compile(r"^cmd\.web(?:\.|$)")
USAGE_ROUTE_COMMAND_IDS = {
    "cmd.nav.open_usage_subject",
    "cmd.artifacts.show_in_usage",
    "cmd.artifacts.show_in_ledger",
}
BROWSER_COMMAND_EXPECTED_EVENTS = {
    "cmd.browser.open_workspace_preview": ["workspace.layout_changed", "browser.session.created", "browser.session.state_changed"],
    "cmd.browser.open_detached_preview": ["browser.session.created", "browser.session.state_changed"],
    "cmd.browser.detach_browser_tab": ["browser.session.state_changed"],
    "cmd.browser.pick_element_for_chat": ["browser.context_captured"],
    "cmd.browser.add_selection_to_chat": ["browser.context_captured"],
    "cmd.browser.add_selection_screenshot_to_chat": ["browser.context_captured", "runtime_artifact.created"],
    "cmd.browser.add_selection_full_screenshot_to_chat": ["browser.context_captured", "runtime_artifact.created"],
    "cmd.browser.add_screenshot_to_chat": ["runtime_artifact.created"],
    "cmd.browser.add_full_screenshot_to_chat": ["runtime_artifact.created"],
    "cmd.browser.share_with_agent": ["browser.context_shared"],
    "cmd.browser.revoke_share_with_agent": ["browser.context_share_revoked"],
    "cmd.browser.take_over": ["browser.session.takeover_state_changed"],
    "cmd.browser.pause_agent": ["browser.session.takeover_state_changed"],
    "cmd.browser.let_agent_continue": ["browser.session.takeover_state_changed"],
    "cmd.browser.stop_agent_keep_browser": ["browser.session.takeover_state_changed", "dev.session.stopped"],
    "cmd.browser.promote_to_normal_browsing": ["browser.session.promoted"],
    "cmd.browser.reopen": ["browser.session.state_changed"],
    "cmd.browser.retry": ["browser.session.state_changed"],
    "cmd.browser.keep_closed": ["browser.session.closed"],
}
BROWSER_LAYOUT_ONLY_COMMAND_IDS = {
    "cmd.browser.focus_browser_tab",
    "cmd.browser.open_devtools",
    "cmd.browser.toggle_devtools_dock",
}
BROWSER_FORBIDDEN_PRODUCTION_COMMAND_IDS = {
    "cmd.browser.run_code",
    "cmd.browser.evaluate",
}
USAGE_ROUTE_PASSTHROUGH_FIELDS = {
    "usage_event_ref",
    "usage_record_id",
    "provider_attempt_ref",
    "attempt_id",
    "node_id",
    "tool_call_id",
    "trace_ref",
    "receipt_ref",
    "receipt_refs",
    "raw_payload_ref",
    "artifact_id",
    "run_id",
    "thread_id",
    "source_class",
    "source_confidence",
    "source_authority",
    "settlement_status",
    "projection_freshness",
    "projection_health",
}


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
        if command_id in RETIRED_CHAT_USAGE_COMMAND_IDS:
            failures.append({"path": row_path, "command_id": command_id, "error": "retired_chat_usage_alias_in_production_wiring"})
        if RETIRED_WEB_COMMAND_RE.match(command_id):
            failures.append({"path": row_path, "command_id": command_id, "error": "retired_web_command_alias_in_production_wiring"})
        if command_id in BROWSER_FORBIDDEN_PRODUCTION_COMMAND_IDS:
            failures.append({"path": row_path, "command_id": command_id, "error": "browser_page_evaluation_command_in_production_wiring"})
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
            effect_kind = effect_contract.get("effect_kind")
        else:
            effect_refs = []
            effect_kind = None
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
            stale_no_event_tokens = ["no declared persisted event", "no-persist", "emits no unexpected persisted domain event"]
            for item in test_evidence:
                if not isinstance(item, dict):
                    continue
                requirement_text = str(item.get("requirement", ""))
                if any(token in requirement_text for token in stale_no_event_tokens):
                    failures.append(
                        {
                            "path": row_path,
                            "command_id": command_id,
                            "test_id": item.get("test_id"),
                            "error": "event_row_contains_no_persist_assertion_text",
                        }
                    )
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

        if command_id in BROWSER_COMMAND_EXPECTED_EVENTS:
            expected_browser_events = BROWSER_COMMAND_EXPECTED_EVENTS[command_id]
            if expected_events != expected_browser_events:
                failures.append(
                    {
                        "path": row_path,
                        "command_id": command_id,
                        "expected": expected_browser_events,
                        "actual": expected_events,
                        "error": "browser_wiring_events_not_catalog_canonical",
                    }
                )
            if effect_kind != "event":
                failures.append(
                    {
                        "path": row_path,
                        "command_id": command_id,
                        "effect_kind": effect_kind,
                        "error": "browser_event_command_not_event_effect",
                    }
                )
            if "event_test" not in evidence_kinds:
                failures.append({"path": row_path, "command_id": command_id, "error": "browser_event_command_missing_event_test"})
        elif command_id in BROWSER_LAYOUT_ONLY_COMMAND_IDS:
            if expected_events:
                failures.append(
                    {
                        "path": row_path,
                        "command_id": command_id,
                        "actual": expected_events,
                        "error": "browser_layout_only_command_declares_domain_event",
                    }
                )
            description = str(effect_contract.get("description", "")) if isinstance(effect_contract, dict) else ""
            if "layout/UI state only" not in description:
                failures.append({"path": row_path, "command_id": command_id, "error": "browser_layout_only_command_missing_layout_disposition"})
        if command_id in USAGE_ROUTE_COMMAND_IDS:
            if effect_kind not in {"route_open", "mixed"}:
                failures.append(
                    {
                        "path": row_path,
                        "command_id": command_id,
                        "effect_kind": effect_kind,
                        "error": "usage_route_command_not_route_open",
                    }
                )
            if "route_open_fixture" not in evidence_kinds:
                failures.append({"path": row_path, "command_id": command_id, "error": "usage_route_missing_route_open_fixture"})
            route_contract = row.get("route_contract")
            if not isinstance(route_contract, dict):
                failures.append({"path": row_path, "command_id": command_id, "error": "usage_route_missing_route_contract"})
            else:
                if route_contract.get("route_target_required") is not True:
                    failures.append({"path": row_path, "command_id": command_id, "error": "usage_route_target_not_required"})
                if route_contract.get("open_subject_required") is not True:
                    failures.append({"path": row_path, "command_id": command_id, "error": "usage_route_open_subject_not_required"})
                if route_contract.get("route_target_object_kind_when_usage_event_ref") != "usage_event":
                    failures.append(
                        {
                            "path": row_path,
                            "command_id": command_id,
                            "error": "usage_route_wrong_object_kind_for_usage_event_ref",
                        }
                    )
                passthrough = route_contract.get("correlation_passthrough", [])
                if not isinstance(passthrough, list):
                    failures.append({"path": row_path, "command_id": command_id, "error": "usage_route_invalid_correlation_passthrough"})
                    passthrough_set: set[str] = set()
                else:
                    passthrough_set = {str(item) for item in passthrough}
                missing_passthrough = sorted(USAGE_ROUTE_PASSTHROUGH_FIELDS - passthrough_set)
                for field in missing_passthrough:
                    failures.append(
                        {
                            "path": row_path,
                            "command_id": command_id,
                            "field": field,
                            "error": "usage_route_missing_correlation_passthrough_field",
                        }
                    )

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


def cmd_validate_gui_asset_policy(args: argparse.Namespace) -> dict[str, Any]:
    failures: list[dict[str, Any]] = []
    validator = ROOT / "scripts/pm-gui-asset-policy.py"
    if not validator.exists():
        return report_status("validate-gui-asset-policy", [{"path": rel(validator), "error": "missing_gui_asset_policy_validator"}])

    timeout_seconds = int(getattr(args, "subcheck_timeout_seconds", 0) or 0)
    proc, timeout_report = run_validator_subprocess(
        "validate-gui-asset-policy",
        [sys.executable, str(validator), "validate"],
        timeout_seconds=timeout_seconds,
        extra_failure_fields={"path": rel(validator)},
    )
    if timeout_report is not None:
        return timeout_report
    # Classify signal death / empty output explicitly so a killed/OOMed GUI asset
    # validator is not mislabeled as a JSON defect.
    early_failure = classify_validator_result(
        "validate-gui-asset-policy",
        proc,
        extra_failure_fields={"path": rel(validator)},
    )
    if early_failure is not None:
        return early_failure
    raw_report: dict[str, Any] = {}
    try:
        parsed = json.loads(proc.stdout)
        if isinstance(parsed, dict):
            raw_report = parsed
        else:
            failures.append({"path": rel(validator), "error": "gui_asset_policy_report_not_object"})
    except json.JSONDecodeError as exc:
        failures.append(
            {
                "path": rel(validator),
                "error": "gui_asset_policy_report_invalid_json",
                "detail": str(exc),
                "stdout_excerpt": (proc.stdout or "")[-_EXCERPT_LIMIT:],
                "stderr_excerpt": (proc.stderr or "")[-_EXCERPT_LIMIT:],
                "returncode": proc.returncode,
            }
        )

    raw_status = raw_report.get("status")
    if raw_status not in {"pass", "not_applicable"}:
        failures.append(
            {
                "path": rel(validator),
                "error": "gui_asset_policy_failed",
                "status": raw_status,
                "policy_state": raw_report.get("policy_state"),
                "failures": raw_report.get("failures", [])[:50] if isinstance(raw_report.get("failures"), list) else [],
            }
        )
    if proc.returncode != 0 and raw_status in {"pass", "not_applicable"}:
        failures.append(
            {
                "path": rel(validator),
                "error": "gui_asset_policy_exit_nonzero_with_passing_status",
                "returncode": proc.returncode,
            }
        )

    report = report_status(
        "validate-gui-asset-policy",
        failures,
        raw_status=raw_status,
        policy_state=raw_report.get("policy_state"),
        checked_files=raw_report.get("checked_files"),
        source_roots=raw_report.get("source_roots"),
        warning_count=len(raw_report.get("warnings", [])) if isinstance(raw_report.get("warnings"), list) else 0,
    )
    if proc.stderr:
        report["stderr"] = proc.stderr
    return report


def cmd_validate_web_capability_contracts(args: argparse.Namespace) -> dict[str, Any]:
    failures: list[dict[str, Any]] = []

    web_schema_path = PLANS / "web_operation_contracts.schema.json"
    evidence_schema_path = PLANS / "evidence.schema.json"
    api_schema_path = PLANS / "runtime_artifact_api_web_call.schema.json"
    browser_schema_path = PLANS / "runtime_artifact_browser_recording.schema.json"
    gui_manifest_schema_path = PLANS / "gui_automation_manifest.schema.json"
    provider_seed_path = PLANS / "web_provider_adapter_registry.seed.json"
    projection_fixture_path = PLANS / "web_provider_projection_fixtures.json"
    source_packet_receipt_path = PLANS / "web_capability_source_packet_receipt.json"
    source_packet_receipt_schema_path = PLANS / "web_capability_source_packet_receipt.schema.json"
    findings_coverage_path = PLANS / "web_capability_findings_coverage.json"
    findings_coverage_schema_path = PLANS / "web_capability_findings_coverage.schema.json"
    card_fixture_path = PLANS / "web_operation_card_fixtures.json"
    job_fixture_path = PLANS / "web_operation_job_fixtures.json"
    agent_policy_fixture_path = PLANS / "web_agent_policy_fixtures.json"
    research_fixture_path = PLANS / "web_research_run_fixtures.json"
    intent_fixture_path = PLANS / "web_intent_routing_fixtures.json"
    policy_fixture_path = PLANS / "web_policy_negative_fixtures.json"
    policy_fixture_schema_path = PLANS / "web_policy_negative_fixtures.schema.json"
    required_paths = [
        web_schema_path,
        evidence_schema_path,
        api_schema_path,
        browser_schema_path,
        gui_manifest_schema_path,
        provider_seed_path,
        projection_fixture_path,
        source_packet_receipt_path,
        source_packet_receipt_schema_path,
        findings_coverage_path,
        findings_coverage_schema_path,
        card_fixture_path,
        job_fixture_path,
        agent_policy_fixture_path,
        research_fixture_path,
        intent_fixture_path,
        policy_fixture_path,
        policy_fixture_schema_path,
    ]
    for path in required_paths:
        if not path.exists():
            failures.append({"path": rel(path), "error": "missing_web_capability_contract_input"})
    if failures:
        return report_status("validate-web-capability-contracts", failures)

    web_schema = load_json(web_schema_path)
    evidence_schema = load_json(evidence_schema_path)
    api_schema = load_json(api_schema_path)
    browser_schema = load_json(browser_schema_path)
    gui_manifest_schema = load_json(gui_manifest_schema_path)
    provider_seed = load_json(provider_seed_path)
    projection_fixtures = load_json(projection_fixture_path)
    source_packet_receipt = load_json(source_packet_receipt_path)
    source_packet_receipt_schema = load_json(source_packet_receipt_schema_path)
    findings_coverage = load_json(findings_coverage_path)
    findings_coverage_schema = load_json(findings_coverage_schema_path)
    card_fixtures = load_json(card_fixture_path)
    job_fixtures = load_json(job_fixture_path)
    agent_policy_fixtures = load_json(agent_policy_fixture_path)
    research_fixtures = load_json(research_fixture_path)
    intent_fixtures = load_json(intent_fixture_path)
    policy_fixtures = load_json(policy_fixture_path)
    policy_fixture_schema = load_json(policy_fixture_schema_path)

    required_defs = {
        "InvocationProvenance",
        "WebActionInput",
        "WebActionResult",
        "WebPermissionDecision",
        "WebProviderAdapterRegistry",
        "ProviderCapability",
        "ProviderSupportTier",
        "McpProjection",
        "ProviderProjectionArtifact",
        "CachePolicy",
        "CacheRecord",
        "WebOperationJob",
        "WebEgressPolicy",
        "ReadReceipt",
        "CitationRecord",
        "ResearchSource",
        "ResearchSynthesisStep",
        "ResearchSubagentRecord",
        "ResearchRun",
        "DeepResearchRun",
        "PageRepresentation",
        "BrowserSession",
        "BrowserRuntimeState",
        "BrowserActionInput",
        "BrowserActionResult",
        "BrowserRecordingArtifact",
        "ResearchProgressCard",
        "WebDeniedOperationCard",
        "WebBatchOperationCard",
        "WebOperationCard",
        "TestingBrowserManifest",
    }
    web_defs = web_schema.get("$defs", {})
    evidence_defs = evidence_schema.get("$defs", {})
    api_defs = api_schema.get("$defs", {})
    for def_name in sorted(required_defs):
        if def_name not in web_defs:
            failures.append({"path": rel(web_schema_path), "definition": def_name, "error": "missing_web_contract_definition"})
    for def_name in ["WebOperationJob", "ResearchSynthesisStep", "ResearchSubagentRecord"]:
        if def_name not in evidence_defs:
            failures.append({"path": rel(evidence_schema_path), "definition": def_name, "error": "missing_web_evidence_contract_definition"})
    if "WebOperationJob" not in api_defs:
        failures.append({"path": rel(api_schema_path), "definition": "WebOperationJob", "error": "missing_api_web_call_job_definition"})

    invocation_sources = set(
        web_defs.get("InvocationProvenance", {})
        .get("properties", {})
        .get("invocation_source", {})
        .get("enum", [])
    )
    required_sources = {"slash", "palette", "nl_user", "agent_initiated", "goal", "prd", "planning_wizard", "subagent"}
    for source in sorted(required_sources - invocation_sources):
        failures.append({"path": rel(web_schema_path), "invocation_source": source, "error": "missing_invocation_source"})

    for error in validate_schema(findings_coverage, findings_coverage_schema, findings_coverage_schema):
        failures.append({"path": rel(findings_coverage_path), "schema": rel(findings_coverage_schema_path), "error": error})
    for error in validate_schema(source_packet_receipt, source_packet_receipt_schema, source_packet_receipt_schema):
        failures.append({"path": rel(source_packet_receipt_path), "schema": rel(source_packet_receipt_schema_path), "error": error})
    for error in validate_schema(policy_fixtures, policy_fixture_schema, policy_fixture_schema):
        failures.append({"path": rel(policy_fixture_path), "schema": rel(policy_fixture_schema_path), "error": error})

    bad_agentic_invocation = {"invocation_source": "agent_initiated"}
    if not validate_schema(bad_agentic_invocation, web_defs.get("InvocationProvenance", {}), web_schema, "$.bad_agentic_invocation"):
        failures.append({"path": rel(web_schema_path), "definition": "InvocationProvenance", "error": "agentic_invocation_without_reason_unexpectedly_valid"})
    mirrored_invocation_defs = [
        (evidence_schema_path, evidence_schema, evidence_schema.get("$defs", {}).get("InvocationProvenance", {}), "evidence_agentic_invocation_without_reason_unexpectedly_valid"),
        (api_schema_path, api_schema, api_schema.get("$defs", {}).get("InvocationProvenance", {}), "api_web_call_agentic_invocation_without_reason_unexpectedly_valid"),
        (browser_schema_path, browser_schema, browser_schema.get("$defs", {}).get("InvocationProvenance", {}), "browser_recording_agentic_invocation_without_reason_unexpectedly_valid"),
    ]
    for schema_path, schema_root, invocation_def, error_code in mirrored_invocation_defs:
        if not validate_schema(bad_agentic_invocation, invocation_def, schema_root, "$.bad_agentic_invocation"):
            failures.append({"path": rel(schema_path), "definition": "InvocationProvenance", "error": error_code})

    web_operations = set(web_defs.get("WebOperation", {}).get("enum", []))
    for operation in ["search", "read", "extract", "research", "deep_research", "crawl", "map"]:
        if operation not in web_operations:
            failures.append({"path": rel(web_schema_path), "web_operation": operation, "error": "missing_web_operation"})

    support_tiers = set(web_defs.get("ProviderSupportTier", {}).get("enum", []))
    required_support_tiers = {"native", "model_native", "native_ish", "near_native", "pm_composed", "partial", "fallback_only", "unsupported", "unavailable"}
    for support_tier in sorted(required_support_tiers - support_tiers):
        failures.append({"path": rel(web_schema_path), "support_tier": support_tier, "error": "missing_provider_support_tier"})

    web_tool_ids = set(web_defs.get("WebToolId", {}).get("enum", []))
    for tool_id in ["websearch", "webfetch", "webextract", "webresearch", "webcrawl", "webmap"]:
        if tool_id not in web_tool_ids:
            failures.append({"path": rel(web_schema_path), "tool_id": tool_id, "error": "missing_web_tool_id"})
    required_web_tool_labels = {"websearch", "webfetch", "webextract", "webresearch", "webcrawl", "webmap", "BrowserAction/Site Reader"}

    if agent_policy_fixtures.get("schema_id") != "pm.web_agent_policy_fixtures.v1":
        failures.append({"path": rel(agent_policy_fixture_path), "error": "invalid_web_agent_policy_fixture_schema_id"})
    if agent_policy_fixtures.get("dispatcher") != "PM WebOperation/BrowserAction dispatcher":
        failures.append({"path": rel(agent_policy_fixture_path), "error": "web_agent_policy_dispatcher_not_pm_dispatcher"})
    affordance = agent_policy_fixtures.get("capability_affordance", {}) if isinstance(agent_policy_fixtures, dict) else {}
    if affordance.get("slice_id") != "WebCapabilityAffordance":
        failures.append({"path": rel(agent_policy_fixture_path), "field": "capability_affordance.slice_id", "error": "missing_web_capability_affordance_fixture"})
    affordance_ops = set(affordance.get("operations", [])) if isinstance(affordance.get("operations"), list) else set()
    for operation in sorted(required_web_tool_labels - affordance_ops):
        failures.append({"path": rel(agent_policy_fixture_path), "operation": operation, "error": "web_capability_affordance_missing_operation"})
    if affordance.get("provider_catalog_mode") != "lazy_registry_summary":
        failures.append({"path": rel(agent_policy_fixture_path), "field": "capability_affordance.provider_catalog_mode", "error": "web_capability_affordance_not_lazy_registry_summary"})
    if affordance.get("native_browser_runtime") != "pm_managed_native_browser":
        failures.append({"path": rel(agent_policy_fixture_path), "field": "capability_affordance.native_browser_runtime", "error": "web_capability_affordance_not_pm_native_browser"})
    if "playwright_cdp_status" in affordance:
        failures.append(
            {
                "path": rel(agent_policy_fixture_path),
                "field": "capability_affordance.playwright_cdp_status",
                "error": "forbidden_pm_playwright_compatibility_surface",
            }
        )
    forbidden_affordance_data = set(affordance.get("must_not_include", [])) if isinstance(affordance.get("must_not_include"), list) else set()
    for forbidden in ["raw_secrets", "full_provider_config", "provider_private_prompt_files"]:
        if forbidden not in forbidden_affordance_data:
            failures.append({"path": rel(agent_policy_fixture_path), "forbidden": forbidden, "error": "web_capability_affordance_missing_forbidden_data_boundary"})

    persona_policies = agent_policy_fixtures.get("persona_policies", []) if isinstance(agent_policy_fixtures, dict) else []
    if not isinstance(persona_policies, list) or not persona_policies:
        failures.append({"path": rel(agent_policy_fixture_path), "error": "missing_web_agent_persona_policies"})
        persona_policies = []
    required_policy_surfaces = {
        "assistant",
        "collaborator",
        "researcher",
        "deep_researcher",
        "goal_runtime",
        "prd_builder",
        "planning_wizard",
        "orchestrator",
        "subagent",
    }
    seen_policy_surfaces = {policy.get("surface") for policy in persona_policies if isinstance(policy, dict)}
    for surface in sorted(required_policy_surfaces - seen_policy_surfaces):
        failures.append({"path": rel(agent_policy_fixture_path), "surface": surface, "error": "missing_web_agent_policy_surface"})
    source_by_surface = {
        "assistant": "agent_initiated",
        "collaborator": "agent_initiated",
        "researcher": "agent_initiated",
        "deep_researcher": "agent_initiated",
        "goal_runtime": "goal",
        "prd_builder": "prd",
        "planning_wizard": "planning_wizard",
        "orchestrator": "goal",
        "subagent": "subagent",
    }
    for policy in persona_policies:
        if not isinstance(policy, dict):
            failures.append({"path": rel(agent_policy_fixture_path), "error": "invalid_web_agent_policy_row"})
            continue
        surface = policy.get("surface")
        policy_id = policy.get("policy_id")
        if policy.get("dispatcher") != "PM WebOperation/BrowserAction dispatcher":
            failures.append({"path": rel(agent_policy_fixture_path), "policy_id": policy_id, "error": "web_agent_policy_dispatcher_mismatch"})
        expected_source = source_by_surface.get(surface)
        if expected_source and policy.get("invocation_source") != expected_source:
            failures.append({"path": rel(agent_policy_fixture_path), "policy_id": policy_id, "expected": expected_source, "actual": policy.get("invocation_source"), "error": "web_agent_policy_invocation_source_mismatch"})
        if policy.get("agent_reason_required") is not True:
            failures.append({"path": rel(agent_policy_fixture_path), "policy_id": policy_id, "error": "web_agent_policy_reason_not_required"})
        if policy.get("permission_gate") != "required":
            failures.append({"path": rel(agent_policy_fixture_path), "policy_id": policy_id, "error": "web_agent_policy_permission_gate_not_required"})
        if policy.get("visible_card_required") is not True:
            failures.append({"path": rel(agent_policy_fixture_path), "policy_id": policy_id, "error": "web_agent_policy_missing_visible_card_requirement"})
        if policy.get("read_only_default") is not True or policy.get("mutating_tools_denied") is not True:
            failures.append({"path": rel(agent_policy_fixture_path), "policy_id": policy_id, "error": "web_agent_policy_not_read_only"})
        allowed_tools = set(policy.get("allowed_tools", [])) if isinstance(policy.get("allowed_tools"), list) else set()
        for tool_label in sorted(required_web_tool_labels - allowed_tools):
            failures.append({"path": rel(agent_policy_fixture_path), "policy_id": policy_id, "tool": tool_label, "error": "web_agent_policy_missing_allowed_tool"})
        triggers = set(policy.get("self_initiates_when", [])) if isinstance(policy.get("self_initiates_when"), list) else set()
        if not triggers:
            failures.append({"path": rel(agent_policy_fixture_path), "policy_id": policy_id, "error": "web_agent_policy_missing_self_initiation_triggers"})
        if surface in {"prd_builder", "planning_wizard"}:
            if policy.get("evidence_destination") != "ledger_or_plan_source_evidence":
                failures.append({"path": rel(agent_policy_fixture_path), "policy_id": policy_id, "error": "planning_web_policy_wrong_evidence_destination"})
            forbidden_targets = set(policy.get("must_not_create", [])) if isinstance(policy.get("must_not_create"), list) else set()
            for forbidden in ["WorkNode", "NodeSeed", "runtime_queue", "build_task"]:
                if forbidden not in forbidden_targets:
                    failures.append({"path": rel(agent_policy_fixture_path), "policy_id": policy_id, "forbidden": forbidden, "error": "planning_web_policy_missing_forbidden_runtime_target"})

    agent_run_mode_assertions = agent_policy_fixtures.get("run_mode_policy_assertions", []) if isinstance(agent_policy_fixtures, dict) else []
    if not isinstance(agent_run_mode_assertions, list) or not agent_run_mode_assertions:
        failures.append({"path": rel(agent_policy_fixture_path), "error": "missing_web_agent_run_mode_assertions"})
        agent_run_mode_assertions = []
    required_agent_run_mode_cases = {
        "ask_mode_websearch_visible_ask",
        "plan_mode_webfetch_visible_ask",
        "deep_plan_research_visible_ask",
        "no_network_denies_with_visible_card",
    }
    seen_agent_run_mode_cases = {case.get("case_id") for case in agent_run_mode_assertions if isinstance(case, dict)}
    for case_id in sorted(required_agent_run_mode_cases - seen_agent_run_mode_cases):
        failures.append({"path": rel(agent_policy_fixture_path), "case_id": case_id, "error": "missing_web_agent_run_mode_assertion"})
    for assertion in agent_run_mode_assertions:
        if not isinstance(assertion, dict):
            continue
        case_id = assertion.get("case_id")
        if assertion.get("run_mode") not in {"ask", "plan", "regular", "yolo"}:
            failures.append({"path": rel(agent_policy_fixture_path), "case_id": case_id, "run_mode": assertion.get("run_mode"), "error": "web_agent_run_mode_not_canonical_runtime_mode"})
        if assertion.get("effective_overlay") == "deep_plan" and assertion.get("normalized_runtime_mode") != "plan":
            failures.append({"path": rel(agent_policy_fixture_path), "case_id": case_id, "error": "deep_plan_overlay_not_normalized_to_plan"})
        expected_decision = "deny" if assertion.get("network_policy") == "deny" else "ask"
        if assertion.get("expected_decision") != expected_decision:
            failures.append({"path": rel(agent_policy_fixture_path), "case_id": case_id, "expected": expected_decision, "actual": assertion.get("expected_decision"), "error": "web_agent_run_mode_decision_mismatch"})
        if assertion.get("must_show_card") is not True:
            failures.append({"path": rel(agent_policy_fixture_path), "case_id": case_id, "error": "web_agent_run_mode_missing_visible_card"})

    parity_rows = agent_policy_fixtures.get("surface_owner_policy_parity", []) if isinstance(agent_policy_fixtures, dict) else []
    if not isinstance(parity_rows, list) or not parity_rows:
        failures.append({"path": rel(agent_policy_fixture_path), "error": "missing_surface_owner_policy_parity"})
        parity_rows = []
    required_parity_surfaces = {"prd_builder", "planning_wizard", "orchestrator", "subagent", "personas", "run_modes", "prompt_pipeline"}
    seen_parity_surfaces = {row.get("surface") for row in parity_rows if isinstance(row, dict)}
    for surface in sorted(required_parity_surfaces - seen_parity_surfaces):
        failures.append({"path": rel(agent_policy_fixture_path), "surface": surface, "error": "missing_surface_owner_policy_parity_row"})
    policies_by_id = {policy.get("policy_id"): policy for policy in persona_policies if isinstance(policy, dict)}
    for row in parity_rows:
        if not isinstance(row, dict):
            failures.append({"path": rel(agent_policy_fixture_path), "error": "invalid_surface_owner_policy_parity_row"})
            continue
        surface = row.get("surface")
        owner_doc = row.get("owner_doc")
        if not isinstance(owner_doc, str) or owner_doc.startswith("/"):
            failures.append({"path": rel(agent_policy_fixture_path), "surface": surface, "owner_doc": owner_doc, "error": "invalid_surface_owner_policy_owner_doc"})
            continue
        owner_path = ROOT / owner_doc
        if not owner_path.exists():
            failures.append({"path": rel(agent_policy_fixture_path), "surface": surface, "owner_doc": owner_doc, "error": "missing_surface_owner_policy_owner_doc"})
            continue
        owner_text = owner_path.read_text(encoding="utf-8")
        for token in row.get("required_owner_tokens", []):
            if token not in owner_text:
                failures.append({"path": rel(agent_policy_fixture_path), "surface": surface, "owner_doc": owner_doc, "token": token, "error": "surface_owner_policy_required_token_missing"})
        policy_ids: list[str] = []
        if isinstance(row.get("policy_id"), str):
            policy_ids.append(row["policy_id"])
        if isinstance(row.get("policy_ids"), list):
            policy_ids.extend(policy_id for policy_id in row["policy_ids"] if isinstance(policy_id, str))
        required_tools_for_row = set(row.get("required_tools", [])) if isinstance(row.get("required_tools"), list) else set()
        for policy_id in policy_ids:
            policy = policies_by_id.get(policy_id)
            if not isinstance(policy, dict):
                failures.append({"path": rel(agent_policy_fixture_path), "surface": surface, "policy_id": policy_id, "error": "surface_owner_policy_missing_policy"})
                continue
            policy_tools = set(policy.get("allowed_tools", [])) if isinstance(policy.get("allowed_tools"), list) else set()
            for tool_label in sorted(required_tools_for_row - policy_tools):
                failures.append({"path": rel(agent_policy_fixture_path), "surface": surface, "policy_id": policy_id, "tool": tool_label, "error": "surface_owner_policy_tool_mismatch"})
            if row.get("invocation_source") and policy.get("invocation_source") != row.get("invocation_source"):
                failures.append({"path": rel(agent_policy_fixture_path), "surface": surface, "policy_id": policy_id, "expected": row.get("invocation_source"), "actual": policy.get("invocation_source"), "error": "surface_owner_policy_invocation_source_mismatch"})
            if row.get("evidence_destination") and policy.get("evidence_destination") != row.get("evidence_destination"):
                failures.append({"path": rel(agent_policy_fixture_path), "surface": surface, "policy_id": policy_id, "expected": row.get("evidence_destination"), "actual": policy.get("evidence_destination"), "error": "surface_owner_policy_evidence_destination_mismatch"})
        if surface == "run_modes":
            if row.get("runtime_mode") not in {"ask", "plan", "regular", "yolo"}:
                failures.append({"path": rel(agent_policy_fixture_path), "surface": surface, "run_mode": row.get("runtime_mode"), "error": "surface_owner_policy_run_mode_not_canonical"})
            if row.get("effective_overlay") == "deep_plan" and row.get("normalized_runtime_mode") != "plan":
                failures.append({"path": rel(agent_policy_fixture_path), "surface": surface, "error": "surface_owner_policy_deep_plan_not_normalized_to_plan"})

    agent_negative_cases = agent_policy_fixtures.get("negative_cases", []) if isinstance(agent_policy_fixtures, dict) else []
    if not isinstance(agent_negative_cases, list) or not agent_negative_cases:
        failures.append({"path": rel(agent_policy_fixture_path), "error": "missing_web_agent_policy_negative_cases"})
        agent_negative_cases = []
    required_agent_negative_cases = {
        "prompt_affordance_raw_secret_leakage",
        "persona_policy_missing_agent_reason",
        "plan_mode_web_silent_deny",
        "planning_policy_runtime_queue_leakage",
        "deep_researcher_mutating_tool_leakage",
        "browser_primary_runtime_not_pm_native",
        "slash_help_hides_agent_capability",
    }
    seen_agent_negative_cases = {case.get("case_id") for case in agent_negative_cases if isinstance(case, dict)}
    for case_id in sorted(required_agent_negative_cases - seen_agent_negative_cases):
        failures.append({"path": rel(agent_policy_fixture_path), "case_id": case_id, "error": "missing_web_agent_policy_negative_case"})

    required_finding_ids = {
        "WGUI-001",
        "WGUI-002",
        "WGUI-003",
        "WSCH-001",
        "WSCH-002",
        "WPERM-001",
        "WGUI-004",
        "WBRO-001",
        "WBRO-002",
        "WPROV-001",
        "WRES-001",
        "WSEC-001",
        "WPLAN-001",
        "WROUTE-002",
        "WAGENT-001",
        "WAGENT-002",
        "WAGENT-003",
        "WAGENT-004",
        "WAGENT-005",
    }
    allowed_finding_statuses = {
        "covered_by_contracts_and_validators",
        "fixture_projection_ready_live_projection_sync_pending",
    }
    allowed_validator_surfaces = {
        "validate-web-capability-contracts",
        "validate-runtime-artifact-schemas",
        "validate-wiring-matrix",
        "validate-project-output-fixtures",
    }
    finding_rows = findings_coverage.get("findings", []) if isinstance(findings_coverage, dict) else []
    source_packet = findings_coverage.get("source_packet", {}) if isinstance(findings_coverage, dict) else {}
    if isinstance(source_packet, dict):
        for key in ["review", "matrix", "receipt"]:
            value = source_packet.get(key)
            if not isinstance(value, str) or value.startswith("/"):
                failures.append({"path": rel(findings_coverage_path), "field": f"source_packet.{key}", "error": "web_capability_coverage_source_packet_must_not_be_absolute_local_path"})
        if source_packet.get("receipt") != rel(source_packet_receipt_path):
            failures.append({"path": rel(findings_coverage_path), "field": "source_packet.receipt", "expected": rel(source_packet_receipt_path), "actual": source_packet.get("receipt"), "error": "web_capability_source_packet_receipt_ref_mismatch"})
    packet_files = source_packet_receipt.get("files", []) if isinstance(source_packet_receipt, dict) else []
    if not isinstance(packet_files, list) or not packet_files:
        failures.append({"path": rel(source_packet_receipt_path), "error": "missing_web_capability_source_packet_files"})
        packet_files = []
    packet_file_by_name = {row.get("artifact_name"): row for row in packet_files if isinstance(row, dict)}
    expected_packet_files = {
        "WEB_CAPABILITY_AGENTIC_ROUTING_REVIEW.md": "review_addendum",
        "FINDINGS_MATRIX_V3.json": "findings_matrix",
        "CODEX_GOAL_PROMPT_UNDER_4000.txt": "goal_prompt",
        "pm_web_capability_codex_packet_v3.zip": "source_packet_archive",
    }
    for artifact_name, artifact_role in expected_packet_files.items():
        row = packet_file_by_name.get(artifact_name)
        if not isinstance(row, dict):
            failures.append({"path": rel(source_packet_receipt_path), "artifact_name": artifact_name, "error": "missing_web_capability_source_packet_file"})
            continue
        if row.get("artifact_role") != artifact_role:
            failures.append({"path": rel(source_packet_receipt_path), "artifact_name": artifact_name, "expected": artifact_role, "actual": row.get("artifact_role"), "error": "web_capability_source_packet_role_mismatch"})
        if "/" in artifact_name or artifact_name.startswith("."):
            failures.append({"path": rel(source_packet_receipt_path), "artifact_name": artifact_name, "error": "web_capability_source_packet_artifact_name_not_basename"})
    receipt_text = json.dumps(source_packet_receipt, sort_keys=True)
    for forbidden in ["/Users/", "jaredsmacbookair", "Downloads/", "api_key", "access_token", "refresh_token", "client_secret", "cookie", "authorization_header"]:
        if forbidden in receipt_text:
            failures.append({"path": rel(source_packet_receipt_path), "token": forbidden, "error": "web_capability_source_packet_receipt_leaks_local_or_secret_state"})
    if not isinstance(finding_rows, list) or not finding_rows:
        failures.append({"path": rel(findings_coverage_path), "error": "missing_web_capability_findings_coverage_rows"})
        finding_rows = []
    seen_finding_ids = {row.get("finding_id") for row in finding_rows if isinstance(row, dict)}
    packet_finding_ids = set(
        source_packet_receipt.get("finding_matrix", {}).get("finding_ids", [])
        if isinstance(source_packet_receipt.get("finding_matrix", {}), dict)
        else []
    )
    if packet_finding_ids != required_finding_ids:
        failures.append({"path": rel(source_packet_receipt_path), "missing": sorted(required_finding_ids - packet_finding_ids), "extra": sorted(packet_finding_ids - required_finding_ids), "error": "web_capability_source_packet_finding_id_set_mismatch"})
    if packet_finding_ids and seen_finding_ids != packet_finding_ids:
        failures.append({"path": rel(findings_coverage_path), "missing": sorted(packet_finding_ids - seen_finding_ids), "extra": sorted(seen_finding_ids - packet_finding_ids), "error": "web_capability_findings_coverage_not_aligned_to_packet_receipt"})
    for finding_id in sorted(required_finding_ids - seen_finding_ids):
        failures.append({"path": rel(findings_coverage_path), "finding_id": finding_id, "error": "missing_v3_finding_coverage"})
    for finding_id in sorted(seen_finding_ids - required_finding_ids):
        failures.append({"path": rel(findings_coverage_path), "finding_id": finding_id, "error": "unknown_v3_finding_coverage"})
    for row in finding_rows:
        if not isinstance(row, dict):
            failures.append({"path": rel(findings_coverage_path), "error": "invalid_v3_finding_coverage_row"})
            continue
        finding_id = row.get("finding_id")
        status = row.get("status")
        if status not in allowed_finding_statuses:
            failures.append({"path": rel(findings_coverage_path), "finding_id": finding_id, "status": status, "error": "invalid_v3_finding_coverage_status"})
        evidence_files = row.get("evidence_files", [])
        if not isinstance(evidence_files, list) or not evidence_files:
            failures.append({"path": rel(findings_coverage_path), "finding_id": finding_id, "error": "missing_v3_finding_evidence_files"})
        else:
            for evidence_file in evidence_files:
                if not isinstance(evidence_file, str) or evidence_file.startswith("/"):
                    failures.append({"path": rel(findings_coverage_path), "finding_id": finding_id, "evidence_file": evidence_file, "error": "invalid_v3_finding_evidence_path"})
                    continue
                evidence_path = ROOT / evidence_file
                if not evidence_path.exists():
                    failures.append({"path": rel(findings_coverage_path), "finding_id": finding_id, "evidence_file": evidence_file, "error": "missing_v3_finding_evidence_file"})
        validators = row.get("validator_surfaces", [])
        if not isinstance(validators, list) or not validators:
            failures.append({"path": rel(findings_coverage_path), "finding_id": finding_id, "error": "missing_v3_finding_validator_surfaces"})
        else:
            for validator in validators:
                if validator not in allowed_validator_surfaces:
                    failures.append({"path": rel(findings_coverage_path), "finding_id": finding_id, "validator": validator, "error": "unknown_v3_finding_validator_surface"})
    for validator in [
        "python3 scripts/pm-plans-verify.py validate-web-capability-contracts",
        "python3 scripts/pm-plans-verify.py validate-runtime-artifact-schemas",
        "python3 scripts/pm-plans-verify.py validate-wiring-matrix",
        "python3 scripts/pm-plans-verify.py validate-project-output-fixtures",
    ]:
        if validator not in findings_coverage.get("required_validator_surfaces", []):
            failures.append({"path": rel(findings_coverage_path), "validator": validator, "error": "missing_required_web_capability_validator_surface"})

    permission_required = set(web_defs.get("WebPermissionDecision", {}).get("required", []))
    if "invocation" not in permission_required:
        failures.append({"path": rel(web_schema_path), "definition": "WebPermissionDecision", "field": "invocation", "error": "web_permission_decision_missing_invocation_provenance"})
    bad_denied_permission = {
        "permission_snapshot_id": "perm:web-denied-bad",
        "decision": "deny",
        "invocation": {"invocation_source": "goal", "agent_reason": "fixture denial path"},
    }
    if not validate_schema(bad_denied_permission, web_defs.get("WebPermissionDecision", {}), web_schema, "$.bad_denied_permission"):
        failures.append({"path": rel(web_schema_path), "definition": "WebPermissionDecision", "error": "denied_permission_without_reason_unexpectedly_valid"})

    citation_required = set(web_defs.get("CitationRecord", {}).get("required", []))
    if "snippet_only" not in citation_required:
        failures.append({"path": rel(web_schema_path), "definition": "CitationRecord", "field": "snippet_only", "error": "shared_citation_record_snippet_only_not_required"})

    for schema_path, defs in [
        (web_schema_path, web_defs),
        (evidence_schema_path, evidence_defs),
        (api_schema_path, api_defs),
    ]:
        job_required = set(defs.get("WebOperationJob", {}).get("required", []))
        if "not_runtime_queue" not in job_required:
            failures.append({"path": rel(schema_path), "definition": "WebOperationJob", "field": "not_runtime_queue", "error": "web_operation_job_non_queue_marker_not_required"})
    for schema_path, defs in [
        (web_schema_path, web_defs),
        (evidence_schema_path, evidence_defs),
    ]:
        result_props = defs.get("WebActionResult", {}).get("properties", {})
        for field in ["job_ref", "job"]:
            if field not in result_props:
                failures.append({"path": rel(schema_path), "definition": "WebActionResult", "field": field, "error": "web_action_result_missing_job_field"})
        research_props = defs.get("ResearchRun", {}).get("properties", {})
        for field in ["synthesis_steps", "subagent_records"]:
            if field not in research_props:
                failures.append({"path": rel(schema_path), "definition": "ResearchRun", "field": field, "error": "research_run_missing_synthesis_or_subagent_field"})
    job_fixture_owner = job_fixtures.get("owner_schema") if isinstance(job_fixtures, dict) else None
    if job_fixture_owner != "Plans/web_operation_contracts.schema.json#/$defs/WebOperationJob":
        failures.append({"path": rel(job_fixture_path), "owner_schema": job_fixture_owner, "error": "web_operation_job_fixture_owner_schema_mismatch"})
    valid_jobs = job_fixtures.get("valid_jobs", []) if isinstance(job_fixtures, dict) else []
    if not isinstance(valid_jobs, list) or not valid_jobs:
        failures.append({"path": rel(job_fixture_path), "error": "missing_valid_web_operation_job_fixtures"})
        valid_jobs = []
    seen_job_statuses: set[str] = set()
    seen_job_operations: set[str] = set()
    for job in valid_jobs:
        if not isinstance(job, dict):
            failures.append({"path": rel(job_fixture_path), "error": "invalid_web_operation_job_fixture_row"})
            continue
        case_id = job.get("case_id")
        job_payload = {key: value for key, value in job.items() if key != "case_id"}
        for error in validate_schema(job_payload, web_defs.get("WebOperationJob", {}), web_schema, f"$.valid_jobs[{case_id}]"):
            failures.append({"path": rel(job_fixture_path), "case_id": case_id, "error": "valid_web_operation_job_fixture_rejected", "detail": error})
        if job_payload.get("not_runtime_queue") is not True:
            failures.append({"path": rel(job_fixture_path), "case_id": case_id, "error": "valid_web_operation_job_not_marked_non_queue"})
        if isinstance(job_payload.get("status"), str):
            seen_job_statuses.add(job_payload["status"])
        if isinstance(job_payload.get("web_operation"), str):
            seen_job_operations.add(job_payload["web_operation"])
    for status in ["polling", "timeout"]:
        if status not in seen_job_statuses:
            failures.append({"path": rel(job_fixture_path), "status": status, "error": "missing_web_operation_job_status_fixture"})
    for operation in ["crawl", "research"]:
        if operation not in seen_job_operations:
            failures.append({"path": rel(job_fixture_path), "web_operation": operation, "error": "missing_web_operation_job_operation_fixture"})
    invalid_jobs = job_fixtures.get("invalid_jobs", []) if isinstance(job_fixtures, dict) else []
    if not isinstance(invalid_jobs, list) or not invalid_jobs:
        failures.append({"path": rel(job_fixture_path), "error": "missing_invalid_web_operation_job_fixtures"})
        invalid_jobs = []
    invalid_job_ids = {case.get("case_id") for case in invalid_jobs if isinstance(case, dict)}
    for case_id in ["failed_job_missing_failure_reason", "job_missing_non_queue_marker"]:
        if case_id not in invalid_job_ids:
            failures.append({"path": rel(job_fixture_path), "case_id": case_id, "error": "missing_invalid_web_operation_job_fixture"})
    for invalid in invalid_jobs:
        if not isinstance(invalid, dict):
            continue
        job_payload = invalid.get("job", {})
        if not validate_schema(job_payload, web_defs.get("WebOperationJob", {}), web_schema, f"$.invalid_jobs[{invalid.get('case_id')}]"):
            failures.append({"path": rel(job_fixture_path), "case_id": invalid.get("case_id"), "error": "invalid_web_operation_job_fixture_unexpectedly_valid"})
    constraints_text = "\n".join(job_fixtures.get("negative_constraints", [])) if isinstance(job_fixtures, dict) else ""
    for token in ["WorkNodes", "NodeSeeds", "runtime queues", "build tasks", "PM registry source of truth"]:
        if token not in constraints_text:
            failures.append({"path": rel(job_fixture_path), "token": token, "error": "web_operation_job_negative_constraint_missing_token"})

    bad_stored_cache = {"cache_state": "stored", "ttl_seconds": 3600, "no_secret_verified": True}
    if not validate_schema(bad_stored_cache, web_defs.get("CacheRecord", {}), web_schema, "$.bad_stored_cache"):
        failures.append({"path": rel(web_schema_path), "definition": "CacheRecord", "error": "stored_cache_without_redaction_profile_unexpectedly_valid"})
    if not validate_schema(bad_stored_cache, evidence_schema.get("$defs", {}).get("CacheRecord", {}), evidence_schema, "$.bad_stored_cache"):
        failures.append({"path": rel(evidence_schema_path), "definition": "CacheRecord", "error": "evidence_stored_cache_without_redaction_profile_unexpectedly_valid"})
    bad_stored_cache_secret_unverified = {
        "cache_state": "stored",
        "ttl_seconds": 3600,
        "no_secret_verified": False,
        "redaction_profile_id": "redaction:web.default",
    }
    if not validate_schema(bad_stored_cache_secret_unverified, web_defs.get("CacheRecord", {}), web_schema, "$.bad_stored_cache_secret_unverified"):
        failures.append({"path": rel(web_schema_path), "definition": "CacheRecord", "error": "stored_cache_with_no_secret_verified_false_unexpectedly_valid"})
    if not validate_schema(bad_stored_cache_secret_unverified, evidence_schema.get("$defs", {}).get("CacheRecord", {}), evidence_schema, "$.bad_stored_cache_secret_unverified"):
        failures.append({"path": rel(evidence_schema_path), "definition": "CacheRecord", "error": "evidence_stored_cache_with_no_secret_verified_false_unexpectedly_valid"})

    bad_snippet_citation = {
        "citation_id": "citation:bad-snippet",
        "url": "https://example.com",
        "source_ref": "source:snippet",
        "read_receipt_ref": "receipt:read-001",
        "evidence_kind": "read",
        "snippet_only": True,
    }
    if not validate_schema(bad_snippet_citation, web_defs.get("CitationRecord", {}), web_schema, "$.bad_snippet_citation"):
        failures.append({"path": rel(web_schema_path), "definition": "CitationRecord", "error": "snippet_only_citation_unexpectedly_valid"})

    shared_mismatch_result = {
        "web_operation": "search",
        "tool_id": "websearch",
        "invocation": {"invocation_source": "nl_user"},
        "operation_input": {"web_operation": "read", "tool_id": "webfetch", "url": "https://example.com"},
        "success": True,
        "provider_fallback_occurred": False,
    }
    if not validate_schema(shared_mismatch_result, web_defs.get("WebActionResult", {}), web_schema, "$.shared_mismatch_result"):
        failures.append({"path": rel(web_schema_path), "definition": "WebActionResult", "error": "web_action_result_mismatch_unexpectedly_valid"})

    evidence_mismatch_result = {
        "web_operation": "search",
        "tool_id": "websearch",
        "invocation": {"invocation_source": "nl_user"},
        "operation_input": {"web_operation": "read", "tool_id": "webfetch"},
        "success": True,
        "provider_fallback_occurred": False,
    }
    if not validate_schema(evidence_mismatch_result, evidence_schema.get("$defs", {}).get("WebActionResult", {}), evidence_schema, "$.evidence_mismatch_result"):
        failures.append({"path": rel(evidence_schema_path), "definition": "WebActionResult", "error": "evidence_web_action_result_mismatch_unexpectedly_valid"})

    bad_prompt_injection_page = {
        "page_representation_id": "page:bad-prompt-injection",
        "url": "https://example.com",
        "detail_level": "standard",
        "prompt_injection_detected": True,
        "observed_at_utc": "2026-07-09T00:00:00Z",
    }
    if not validate_schema(bad_prompt_injection_page, web_defs.get("PageRepresentation", {}), web_schema, "$.bad_prompt_injection_page"):
        failures.append({"path": rel(web_schema_path), "definition": "PageRepresentation", "error": "prompt_injection_without_visible_chips_unexpectedly_valid"})

    bad_runtime_unavailable_manifest = {
        "browser_session_id": "browser:runtime-unavailable-bad",
        "visibility_state": "runtime_unavailable",
        "open_watch_state": "unavailable",
        "evidence_refs": ["evidence:browser-unavailable"],
        "redaction_manifest_ref": "redaction:browser-unavailable",
    }
    if not validate_schema(bad_runtime_unavailable_manifest, gui_manifest_schema.get("$defs", {}).get("TestingBrowserManifest", {}), gui_manifest_schema, "$.bad_runtime_unavailable_manifest"):
        failures.append({"path": rel(gui_manifest_schema_path), "definition": "TestingBrowserManifest", "error": "runtime_unavailable_without_remediation_unexpectedly_valid"})
    if not validate_schema(bad_runtime_unavailable_manifest, web_defs.get("TestingBrowserManifest", {}), web_schema, "$.bad_runtime_unavailable_manifest"):
        failures.append({"path": rel(web_schema_path), "definition": "TestingBrowserManifest", "error": "shared_testing_runtime_unavailable_without_remediation_unexpectedly_valid"})
    gui_artifact_schema = gui_manifest_schema.get("properties", {}).get("artifacts", {}).get("items", {})
    bad_browser_artifact_missing_redaction = {
        "artifact_id": "browser-artifact-missing-redaction",
        "kind": "browser_screenshot",
        "relative_path": "artifacts/browser/screenshot.png",
        "mime_type": "image/png",
        "sha256": "0" * 64,
        "size_bytes": 12,
    }
    if not validate_schema(bad_browser_artifact_missing_redaction, gui_artifact_schema, gui_manifest_schema, "$.bad_browser_artifact_missing_redaction"):
        failures.append({"path": rel(gui_manifest_schema_path), "definition": "artifacts.items", "error": "browser_artifact_without_redaction_status_unexpectedly_valid"})
    bad_browser_artifact_failed_redaction = {
        **bad_browser_artifact_missing_redaction,
        "artifact_id": "browser-artifact-failed-redaction",
        "redaction_status": "failed",
    }
    if not validate_schema(bad_browser_artifact_failed_redaction, gui_artifact_schema, gui_manifest_schema, "$.bad_browser_artifact_failed_redaction"):
        failures.append({"path": rel(gui_manifest_schema_path), "definition": "artifacts.items", "error": "browser_artifact_failed_redaction_unexpectedly_valid"})
    bad_runtime_unavailable_state = {
        "runtime_state": "runtime_unavailable",
        "requested_runtime": "pm_native_browser",
        "effective_runtime": "none",
    }
    if not validate_schema(bad_runtime_unavailable_state, web_defs.get("BrowserRuntimeState", {}), web_schema, "$.bad_runtime_unavailable_state"):
        failures.append({"path": rel(web_schema_path), "definition": "BrowserRuntimeState", "error": "browser_runtime_state_unavailable_without_remediation_unexpectedly_valid"})
    browser_runtime_state_schema = (
        browser_schema.get("$defs", {})
        .get("BrowserRecordingPayload", {})
        .get("properties", {})
        .get("runtime_state", {})
    )
    if not validate_schema(bad_runtime_unavailable_state, browser_runtime_state_schema, browser_schema, "$.bad_runtime_unavailable_state"):
        failures.append({"path": rel(browser_schema_path), "definition": "BrowserRecordingPayload.runtime_state", "error": "browser_recording_runtime_unavailable_without_remediation_unexpectedly_valid"})

    bad_planning_research_run = {
        "research_run_id": "research:bad-planning-source-evidence",
        "mode": "standard",
        "task": "verify current platform support",
        "invocation": {
            "invocation_source": "planning_wizard",
            "agent_reason": "Planning Wizard question depends on current support."
        },
        "sources": [
            {"source_id": "source:one", "url": "https://example.com", "selection_reason": "fixture", "read_state": "read", "read_receipt_ref": "receipt:one"}
        ],
        "read_receipts": [
            {"receipt_id": "receipt:one", "url": "https://example.com", "web_operation": "read", "tool_id": "webfetch", "content_ref": "content:one", "read_at_utc": "2026-07-09T00:00:00Z"}
        ],
        "citations": [
            {"citation_id": "citation:one", "url": "https://example.com", "source_ref": "source:one", "read_receipt_ref": "receipt:one", "evidence_kind": "read", "snippet_only": False}
        ],
        "closure_state": "sufficient"
    }
    if not validate_schema(bad_planning_research_run, web_defs.get("ResearchRun", {}), web_schema, "$.bad_planning_research_run"):
        failures.append({"path": rel(web_schema_path), "definition": "ResearchRun", "error": "planning_research_without_source_evidence_unexpectedly_valid"})
    if not validate_schema(bad_planning_research_run, evidence_schema.get("$defs", {}).get("ResearchRun", {}), evidence_schema, "$.bad_planning_research_run"):
        failures.append({"path": rel(evidence_schema_path), "definition": "ResearchRun", "error": "evidence_planning_research_without_source_evidence_unexpectedly_valid"})
    bad_planning_research_leakage = {
        "research_run_id": "research:bad-planning-worknode-leakage",
        "mode": "standard",
        "task": "verify current platform support",
        "invocation": {
            "invocation_source": "planning_wizard",
            "agent_reason": "Planning Wizard question depends on current support."
        },
        "sources": [
            {"source_id": "source:one", "url": "https://example.com", "selection_reason": "fixture", "read_state": "read", "read_receipt_ref": "receipt:one"}
        ],
        "read_receipts": [
            {"receipt_id": "receipt:one", "url": "https://example.com", "web_operation": "read", "tool_id": "webfetch", "content_ref": "content:one", "read_at_utc": "2026-07-09T00:00:00Z"}
        ],
        "citations": [
            {"citation_id": "citation:one", "url": "https://example.com", "source_ref": "source:one", "read_receipt_ref": "receipt:one", "evidence_kind": "read", "snippet_only": False}
        ],
        "closure_state": "sufficient",
        "ledger_source_evidence_ref": "ledger-source:one",
        "WorkNode": "forbidden"
    }
    if not validate_schema(bad_planning_research_leakage, evidence_schema.get("$defs", {}).get("ResearchRun", {}), evidence_schema, "$.bad_planning_research_leakage"):
        failures.append({"path": rel(evidence_schema_path), "definition": "ResearchRun", "error": "evidence_planning_research_worknode_leakage_unexpectedly_valid"})
    valid_research_with_synthesis = {
        "research_run_id": "research:valid-synthesis-subagent",
        "mode": "standard",
        "task": "compare current docs with release notes",
        "invocation": {
            "invocation_source": "goal",
            "agent_reason": "Goal requires current external evidence before answering."
        },
        "provider_mode": "pm_composed",
        "sources": [
            {
                "source_id": "source:docs",
                "url": "https://example.com/docs",
                "selection_reason": "Official documentation source.",
                "read_state": "read",
                "read_receipt_ref": "receipt:docs"
            }
        ],
        "read_receipts": [
            {
                "receipt_id": "receipt:docs",
                "url": "https://example.com/docs",
                "web_operation": "read",
                "tool_id": "webfetch",
                "content_ref": "content:docs",
                "read_at_utc": "2026-07-09T00:00:00Z"
            }
        ],
        "citations": [
            {
                "citation_id": "citation:docs",
                "url": "https://example.com/docs",
                "source_ref": "source:docs",
                "read_receipt_ref": "receipt:docs",
                "evidence_kind": "read",
                "snippet_only": False
            }
        ],
        "synthesis_steps": [
            {
                "step_id": "synthesis:source-selection",
                "step_kind": "source_selection",
                "input_source_refs": ["source:docs"],
                "read_receipt_refs": ["receipt:docs"],
                "citation_refs": ["citation:docs"],
                "output_ref": "research-output:source-selection",
                "created_at_utc": "2026-07-09T00:00:05Z"
            },
            {
                "step_id": "synthesis:closure",
                "step_kind": "closure_check",
                "input_source_refs": ["source:docs"],
                "citation_refs": ["citation:docs"],
                "output_ref": "research-output:closure",
                "created_at_utc": "2026-07-09T00:00:10Z"
            }
        ],
        "subagent_records": [
            {
                "subagent_record_id": "research-subagent:docs",
                "source_subagent_id": "agent:read-only-research",
                "assignment": "Read selected documentation source and return evidence refs only.",
                "source_scope_refs": ["source:docs"],
                "status": "completed",
                "result_ref": "research-output:docs-subagent",
                "created_at_utc": "2026-07-09T00:00:00Z",
                "finished_at_utc": "2026-07-09T00:00:09Z"
            }
        ],
        "coverage_report_ref": "research-coverage:docs",
        "closure_state": "sufficient"
    }
    for schema_path, schema_root, research_def in [
        (web_schema_path, web_schema, web_defs.get("ResearchRun", {})),
        (evidence_schema_path, evidence_schema, evidence_defs.get("ResearchRun", {})),
    ]:
        for error in validate_schema(valid_research_with_synthesis, research_def, schema_root, "$.valid_research_with_synthesis"):
            failures.append({"path": rel(schema_path), "definition": "ResearchRun", "error": "valid_research_synthesis_subagent_fixture_rejected", "detail": error})
    if research_fixtures.get("schema_id") != "pm.web_research_run_fixtures.v1":
        failures.append({"path": rel(research_fixture_path), "error": "invalid_web_research_run_fixture_schema_id"})
    if research_fixtures.get("owner_schema") != "Plans/web_operation_contracts.schema.json#/$defs/ResearchRun":
        failures.append({"path": rel(research_fixture_path), "owner_schema": research_fixtures.get("owner_schema"), "error": "web_research_fixture_owner_schema_mismatch"})
    valid_research_runs = research_fixtures.get("valid_runs", []) if isinstance(research_fixtures, dict) else []
    if not isinstance(valid_research_runs, list) or not valid_research_runs:
        failures.append({"path": rel(research_fixture_path), "error": "missing_valid_web_research_run_fixtures"})
        valid_research_runs = []
    def research_semantic_errors(run: dict[str, Any]) -> list[str]:
        semantic_errors: list[str] = []
        sources = run.get("sources", [])
        read_receipts = run.get("read_receipts", [])
        citations = run.get("citations", [])
        source_ids = {
            source.get("source_id")
            for source in sources
            if isinstance(source, dict) and isinstance(source.get("source_id"), str)
        }
        source_urls = {
            source.get("source_id"): source.get("url")
            for source in sources
            if isinstance(source, dict) and isinstance(source.get("source_id"), str) and isinstance(source.get("url"), str)
        }
        read_receipt_ids = {
            receipt.get("receipt_id")
            for receipt in read_receipts
            if isinstance(receipt, dict) and isinstance(receipt.get("receipt_id"), str)
        }
        read_receipt_urls = {
            receipt.get("receipt_id"): receipt.get("url")
            for receipt in read_receipts
            if isinstance(receipt, dict) and isinstance(receipt.get("receipt_id"), str) and isinstance(receipt.get("url"), str)
        }
        citation_ids = {
            citation.get("citation_id")
            for citation in citations
            if isinstance(citation, dict) and isinstance(citation.get("citation_id"), str)
        }
        for source in sources if isinstance(sources, list) else []:
            if not isinstance(source, dict):
                continue
            source_id = source.get("source_id")
            if source.get("read_state") == "read" and source.get("read_receipt_ref") not in read_receipt_ids:
                semantic_errors.append(f"source_read_receipt_ref_missing:{source_id}")
            if source.get("read_state") == "extracted" and not (source.get("extract_receipt_ref") or source.get("read_receipt_ref") in read_receipt_ids):
                semantic_errors.append(f"source_extract_or_read_receipt_ref_missing:{source_id}")
        for citation in citations if isinstance(citations, list) else []:
            if not isinstance(citation, dict):
                continue
            citation_id = citation.get("citation_id")
            if citation.get("source_ref") not in source_ids:
                semantic_errors.append(f"citation_source_ref_missing:{citation_id}")
            elif citation.get("url") != source_urls.get(citation.get("source_ref")):
                semantic_errors.append(f"citation_source_url_mismatch:{citation_id}")
            if citation.get("read_receipt_ref") and citation.get("read_receipt_ref") not in read_receipt_ids:
                semantic_errors.append(f"citation_read_receipt_ref_missing:{citation_id}")
            elif citation.get("read_receipt_ref") and citation.get("url") != read_receipt_urls.get(citation.get("read_receipt_ref")):
                semantic_errors.append(f"citation_read_receipt_url_mismatch:{citation_id}")
        for step in run.get("synthesis_steps", []) if isinstance(run.get("synthesis_steps", []), list) else []:
            if not isinstance(step, dict):
                continue
            step_id = step.get("step_id")
            for source_ref in step.get("input_source_refs", []) if isinstance(step.get("input_source_refs", []), list) else []:
                if source_ref not in source_ids:
                    semantic_errors.append(f"synthesis_source_ref_missing:{step_id}:{source_ref}")
            for receipt_ref in step.get("read_receipt_refs", []) if isinstance(step.get("read_receipt_refs", []), list) else []:
                if receipt_ref not in read_receipt_ids:
                    semantic_errors.append(f"synthesis_read_receipt_ref_missing:{step_id}:{receipt_ref}")
            for citation_ref in step.get("citation_refs", []) if isinstance(step.get("citation_refs", []), list) else []:
                if citation_ref not in citation_ids:
                    semantic_errors.append(f"synthesis_citation_ref_missing:{step_id}:{citation_ref}")
        return semantic_errors

    seen_research_schemas: set[str] = set()
    seen_provider_modes: set[str] = set()
    for fixture in valid_research_runs:
        if not isinstance(fixture, dict):
            failures.append({"path": rel(research_fixture_path), "error": "invalid_web_research_run_fixture_row"})
            continue
        case_id = fixture.get("case_id")
        schema_name = fixture.get("schema")
        run = fixture.get("run", {})
        if isinstance(schema_name, str):
            seen_research_schemas.add(schema_name)
        if isinstance(run, dict) and isinstance(run.get("provider_mode"), str):
            seen_provider_modes.add(run["provider_mode"])
        if not isinstance(run, dict):
            failures.append({"path": rel(research_fixture_path), "case_id": case_id, "error": "web_research_run_fixture_payload_not_object"})
            continue
        if schema_name not in {"ResearchRun", "DeepResearchRun"}:
            failures.append({"path": rel(research_fixture_path), "case_id": case_id, "schema": schema_name, "error": "unknown_web_research_run_fixture_schema"})
            continue
        for schema_path, schema_root, defs in [
            (web_schema_path, web_schema, web_defs),
            (evidence_schema_path, evidence_schema, evidence_defs),
        ]:
            for error in validate_schema(run, defs.get(schema_name, {}), schema_root, f"$.valid_runs[{case_id}]"):
                failures.append({"path": rel(research_fixture_path), "schema_path": rel(schema_path), "case_id": case_id, "schema": schema_name, "error": "valid_web_research_run_fixture_rejected", "detail": error})
        for field in ["sources", "read_receipts", "citations", "synthesis_steps", "subagent_records"]:
            if not run.get(field):
                failures.append({"path": rel(research_fixture_path), "case_id": case_id, "field": field, "error": "valid_web_research_run_missing_required_evidence_flow"})
        if run.get("invocation", {}).get("invocation_source") in {"prd", "planning_wizard"} and not (run.get("ledger_source_evidence_ref") or run.get("plan_source_evidence_ref")):
            failures.append({"path": rel(research_fixture_path), "case_id": case_id, "error": "planning_web_research_missing_source_evidence_destination"})
        for error in research_semantic_errors(run):
            failures.append({"path": rel(research_fixture_path), "case_id": case_id, "error": error})
    for schema_name in ["ResearchRun", "DeepResearchRun"]:
        if schema_name not in seen_research_schemas:
            failures.append({"path": rel(research_fixture_path), "schema": schema_name, "error": "missing_valid_web_research_run_schema_fixture"})
    for provider_mode in ["pm_composed", "provider_autonomous"]:
        if provider_mode not in seen_provider_modes:
            failures.append({"path": rel(research_fixture_path), "provider_mode": provider_mode, "error": "missing_web_research_provider_mode_fixture"})
    invalid_research_runs = research_fixtures.get("invalid_runs", []) if isinstance(research_fixtures, dict) else []
    if not isinstance(invalid_research_runs, list) or not invalid_research_runs:
        failures.append({"path": rel(research_fixture_path), "error": "missing_invalid_web_research_run_fixtures"})
        invalid_research_runs = []
    required_invalid_research_cases = {
        "planning_research_missing_source_evidence",
        "snippet_only_citation_rejected",
        "research_runtime_target_leakage",
        "deep_research_mode_mismatch",
        "research_dangling_refs_rejected",
        "research_mismatched_citation_url_rejected",
    }
    seen_invalid_research_cases = {case.get("case_id") for case in invalid_research_runs if isinstance(case, dict)}
    for case_id in sorted(required_invalid_research_cases - seen_invalid_research_cases):
        failures.append({"path": rel(research_fixture_path), "case_id": case_id, "error": "missing_invalid_web_research_run_fixture"})
    for fixture in invalid_research_runs:
        if not isinstance(fixture, dict):
            continue
        case_id = fixture.get("case_id")
        schema_name = fixture.get("schema")
        run = fixture.get("run", {})
        if schema_name not in {"ResearchRun", "DeepResearchRun"} or not isinstance(run, dict):
            failures.append({"path": rel(research_fixture_path), "case_id": case_id, "schema": schema_name, "error": "invalid_web_research_run_fixture_malformed"})
            continue
        schema_valid = validate_schema(run, web_defs.get(schema_name, {}), web_schema, f"$.invalid_runs[{case_id}]")
        evidence_schema_valid = validate_schema(run, evidence_defs.get(schema_name, {}), evidence_schema, f"$.invalid_runs[{case_id}]")
        semantic_errors = research_semantic_errors(run)
        if not schema_valid and not semantic_errors:
            failures.append({"path": rel(research_fixture_path), "case_id": case_id, "schema": schema_name, "error": "invalid_web_research_run_fixture_unexpectedly_valid"})
        if not evidence_schema_valid and not semantic_errors:
            failures.append({"path": rel(research_fixture_path), "case_id": case_id, "schema": schema_name, "error": "invalid_evidence_research_run_fixture_unexpectedly_valid"})
    research_constraints_text = "\n".join(research_fixtures.get("negative_constraints", [])) if isinstance(research_fixtures, dict) else ""
    for token in ["read or extract receipts", "ledger or plan source evidence", "WorkNodes", "NodeSeeds", "runtime queues", "mode=deep"]:
        if token not in research_constraints_text:
            failures.append({"path": rel(research_fixture_path), "token": token, "error": "web_research_fixture_negative_constraint_missing_token"})

    shared_web_action_input = web_defs.get("WebActionInput", {})
    shared_branches = shared_web_action_input.get("anyOf", []) if isinstance(shared_web_action_input, dict) else []
    if not isinstance(shared_branches, list) or not shared_branches:
        failures.append({"path": rel(web_schema_path), "definition": "WebActionInput", "error": "shared_web_action_input_not_validator_supported_anyof"})
        shared_branches = []
    shared_pairs = set()
    for branch in shared_branches:
        props = branch.get("properties", {}) if isinstance(branch, dict) else {}
        operation_const = props.get("web_operation", {}).get("const")
        tool_const = props.get("tool_id", {}).get("const")
        if operation_const and tool_const:
            shared_pairs.add((operation_const, tool_const))
    for pair in [("crawl", "webcrawl"), ("map", "webmap"), ("research", "webresearch"), ("deep_research", "webresearch")]:
        if pair not in shared_pairs:
            failures.append({"path": rel(web_schema_path), "pair": list(pair), "error": "missing_shared_web_action_operation_tool_pair"})
    for invalid_pair in [("crawl", "webmap"), ("map", "webcrawl")]:
        if invalid_pair in shared_pairs:
            failures.append({"path": rel(web_schema_path), "pair": list(invalid_pair), "error": "shared_web_action_invalid_operation_tool_pair"})

    required_browser_actions = {
        "open_tab",
        "select_tab",
        "close_tab",
        "click",
        "type",
        "fill_form",
        "select_option",
        "hover",
        "drag",
        "press_key",
        "upload_file",
        "handle_dialog",
        "wait_for",
        "verify_text",
        "verify_element",
        "verify_value",
        "snapshot",
        "screenshot",
        "console",
        "network",
        "set_viewport",
    }
    shared_browser_actions = set(
        web_defs.get("BrowserActionInput", {})
        .get("properties", {})
        .get("action_type", {})
        .get("enum", [])
    )
    for action_type in sorted(required_browser_actions - shared_browser_actions):
        failures.append({"path": rel(web_schema_path), "definition": "BrowserActionInput", "action_type": action_type, "error": "missing_required_browser_action"})
    shared_action_aliases = set(
        web_defs.get("BrowserActionInput", {})
        .get("properties", {})
        .get("input_action_label", {})
        .get("enum", [])
    )
    for alias in ["press key", "select option", "fill form", "file upload", "dialog handle", "verify visible text"]:
        if alias not in shared_action_aliases:
            failures.append({"path": rel(web_schema_path), "definition": "BrowserActionInput", "alias": alias, "error": "missing_browser_action_alias"})
    shared_extract_branch = next(
        (
            branch for branch in shared_branches
            if isinstance(branch, dict)
            and branch.get("properties", {}).get("web_operation", {}).get("const") == "extract"
        ),
        {},
    )
    shared_extract_props = shared_extract_branch.get("properties", {}) if isinstance(shared_extract_branch, dict) else {}
    shared_extract_actions = shared_extract_props.get("actions", {})
    if shared_extract_actions.get("maxItems") != 10:
        failures.append({"path": rel(web_schema_path), "definition": "WebActionInput.extract", "field": "actions.maxItems", "error": "shared_web_extract_actions_cap_missing"})
    if shared_extract_actions.get("items", {}).get("$ref") != "#/$defs/BrowserActionInput":
        failures.append({"path": rel(web_schema_path), "definition": "WebActionInput.extract", "field": "actions.items", "error": "shared_web_extract_actions_not_typed_browser_actions"})
    if shared_extract_props.get("actions_total_timeout_ms", {}).get("maximum") != 30000:
        failures.append({"path": rel(web_schema_path), "definition": "WebActionInput.extract", "field": "actions_total_timeout_ms.maximum", "error": "shared_web_extract_actions_timeout_cap_missing"})
    for operation in ["research", "deep_research"]:
        research_branch = next(
            (
                branch for branch in shared_branches
                if isinstance(branch, dict)
                and branch.get("properties", {}).get("web_operation", {}).get("const") == operation
            ),
            {},
        )
        starting_urls = research_branch.get("properties", {}).get("starting_urls", {}) if isinstance(research_branch, dict) else {}
        if starting_urls.get("maxItems") != 5:
            failures.append({"path": rel(web_schema_path), "definition": "WebActionInput", "web_operation": operation, "field": "starting_urls.maxItems", "error": "starting_urls_cap_missing"})

    web_activity = evidence_schema.get("properties", {}).get("web_activity", {}).get("properties", {})
    for evidence_key in ["websearch", "webfetch", "webextract", "webresearch", "deep_research", "webcrawl", "webmap"]:
        if evidence_key not in web_activity:
            failures.append({"path": rel(evidence_schema_path), "evidence_key": evidence_key, "error": "missing_web_activity_evidence_branch"})
        branch_required = set(web_activity.get(evidence_key, {}).get("required", [])) if isinstance(web_activity.get(evidence_key), dict) else set()
        if evidence_key in {"websearch", "webfetch", "webcrawl", "webmap"} and "invocation" not in branch_required:
            failures.append({"path": rel(evidence_schema_path), "evidence_key": evidence_key, "field": "invocation", "error": "web_activity_branch_missing_invocation"})

    api_payload = api_schema.get("$defs", {}).get("ApiWebCallPayload", {})
    api_required = set(api_payload.get("required", []))
    for field in ["web_operation", "tool_id", "operation_input", "invocation", "success", "provider_fallback_occurred"]:
        if field not in api_required:
            failures.append({"path": rel(api_schema_path), "field": field, "error": "api_web_call_payload_missing_required_field"})
    api_payload_props = api_payload.get("properties", {})
    if "job_ref" not in api_payload_props:
        failures.append({"path": rel(api_schema_path), "definition": "ApiWebCallPayload", "field": "job_ref", "error": "api_web_call_payload_missing_job_ref"})
    if api_payload_props.get("job", {}).get("$ref") != "#/$defs/WebOperationJob":
        failures.append({"path": rel(api_schema_path), "definition": "ApiWebCallPayload", "field": "job", "error": "api_web_call_payload_job_not_typed"})
    operation_input_schema = api_payload.get("properties", {}).get("operation_input", {})
    if not isinstance(operation_input_schema, dict) or "$ref" not in operation_input_schema:
        failures.append({"path": rel(api_schema_path), "field": "operation_input", "error": "api_web_call_operation_input_not_discriminated"})
    web_action_input = api_schema.get("$defs", {}).get("WebActionInput", {})
    if not isinstance(web_action_input, dict) or "anyOf" not in web_action_input:
        failures.append({"path": rel(api_schema_path), "definition": "WebActionInput", "error": "api_web_call_missing_operation_input_branches"})
    runtime_input_required_fields = {
        "WebSearchInput": {"adapter_hint", "time_range"},
        "WebFetchInput": {"adapter_hint"},
        "WebExtractInput": {"adapter_hint", "actions", "schema_mode"},
        "WebResearchInput": {"adapter_hint", "depth_hint", "schema_ref", "schema_mode"},
        "WebTraversalInput": {"adapter_hint", "include_paths", "exclude_paths", "dedup", "search"},
    }
    for def_name, required_fields in runtime_input_required_fields.items():
        properties = api_schema.get("$defs", {}).get(def_name, {}).get("properties", {})
        for field in sorted(required_fields):
            if field not in properties:
                failures.append({"path": rel(api_schema_path), "definition": def_name, "field": field, "error": "api_web_call_input_field_dropped_from_replay_contract"})
    api_browser_actions = set(
        api_schema.get("$defs", {})
        .get("BrowserActionInput", {})
        .get("properties", {})
        .get("action_type", {})
        .get("enum", [])
    )
    for action_type in sorted(required_browser_actions - api_browser_actions):
        failures.append({"path": rel(api_schema_path), "definition": "BrowserActionInput", "action_type": action_type, "error": "api_web_call_missing_required_browser_action"})
    api_extract_actions = api_schema.get("$defs", {}).get("WebExtractInput", {}).get("properties", {}).get("actions", {})
    if api_extract_actions.get("maxItems") != 10:
        failures.append({"path": rel(api_schema_path), "definition": "WebExtractInput", "field": "actions.maxItems", "error": "api_web_call_extract_actions_cap_missing"})
    if api_extract_actions.get("items", {}).get("$ref") != "#/$defs/BrowserActionInput":
        failures.append({"path": rel(api_schema_path), "definition": "WebExtractInput", "field": "actions.items", "error": "api_web_call_extract_actions_not_typed_browser_actions"})
    api_extract_timeout = api_schema.get("$defs", {}).get("WebExtractInput", {}).get("properties", {}).get("actions_total_timeout_ms", {})
    if api_extract_timeout.get("maximum") != 30000:
        failures.append({"path": rel(api_schema_path), "definition": "WebExtractInput", "field": "actions_total_timeout_ms.maximum", "error": "api_web_call_extract_actions_timeout_cap_missing"})
    api_research_starting_urls = api_schema.get("$defs", {}).get("WebResearchInput", {}).get("properties", {}).get("starting_urls", {})
    if api_research_starting_urls.get("maxItems") != 5:
        failures.append({"path": rel(api_schema_path), "definition": "WebResearchInput", "field": "starting_urls.maxItems", "error": "api_web_call_research_starting_urls_cap_missing"})
    payload_consistency = api_payload.get("allOf", [])
    if not isinstance(payload_consistency, list) or not payload_consistency or "anyOf" not in payload_consistency[0]:
        failures.append({"path": rel(api_schema_path), "definition": "ApiWebCallPayload", "error": "api_web_call_missing_top_level_input_consistency_branches"})

    browser_payload = browser_schema.get("$defs", {}).get("BrowserRecordingPayload", {})
    browser_required = set(browser_payload.get("required", []))
    for field in ["browser_session_id", "invocation", "session_class", "state", "show_when_possible", "open_watch_state", "recording_ref", "runtime_state", "actions", "artifact_refs", "redaction_profile_id"]:
        if field not in browser_required:
            failures.append({"path": rel(browser_schema_path), "field": field, "error": "browser_recording_payload_missing_required_field"})
    browser_states = set(browser_payload.get("properties", {}).get("state", {}).get("enum", []))
    for state in ["collapsed", "detached", "background", "runtime_unavailable"]:
        if state not in browser_states:
            failures.append({"path": rel(browser_schema_path), "state": state, "error": "browser_recording_missing_state"})
    browser_action = browser_schema.get("$defs", {}).get("BrowserActionResult", {})
    browser_action_required = set(browser_action.get("required", []))
    for field in ["browser_session_id", "action", "invocation"]:
        if field not in browser_action_required:
            failures.append({"path": rel(browser_schema_path), "field": f"BrowserActionResult.{field}", "error": "browser_action_result_missing_required_field"})
    browser_recording_actions = set(
        browser_schema.get("$defs", {})
        .get("BrowserActionInput", {})
        .get("properties", {})
        .get("action_type", {})
        .get("enum", [])
    )
    for action_type in sorted(required_browser_actions - browser_recording_actions):
        failures.append({"path": rel(browser_schema_path), "definition": "BrowserActionInput", "action_type": action_type, "error": "browser_recording_missing_required_browser_action"})
    if "action_type" in browser_action.get("properties", {}):
        failures.append({"path": rel(browser_schema_path), "field": "BrowserActionResult.action_type", "error": "browser_action_result_legacy_action_type_field"})
    if browser_action.get("properties", {}).get("page_representation", {}).get("$ref") != "#/$defs/PageRepresentation":
        failures.append({"path": rel(browser_schema_path), "field": "BrowserActionResult.page_representation", "error": "browser_action_result_missing_inline_page_representation"})
    page_representation_schema = browser_schema.get("$defs", {}).get("PageRepresentation", {})
    page_representation_props = page_representation_schema.get("properties", {})
    for field in ["observe_ref", "find_results_ref", "detail_ref", "accessibility_tree_ref", "layout_bounds_ref", "form_refs", "iframe_refs", "console_ref", "network_ref", "screenshot_artifact_ref", "pdf_artifact_ref", "prompt_injection_chips", "visible_card_ref", "redaction_profile_id"]:
        if field not in page_representation_props:
            failures.append({"path": rel(browser_schema_path), "definition": "PageRepresentation", "field": field, "error": "browser_page_representation_missing_field"})

    artifact_kinds = set(
        gui_manifest_schema.get("properties", {})
        .get("artifacts", {})
        .get("items", {})
        .get("properties", {})
        .get("kind", {})
        .get("enum", [])
    )
    for artifact_kind in ["browser_screenshot", "browser_pdf", "console", "network"]:
        if artifact_kind not in artifact_kinds:
            failures.append({"path": rel(gui_manifest_schema_path), "artifact_kind": artifact_kind, "error": "gui_manifest_missing_browser_artifact_kind"})
    if "browser_sessions" not in gui_manifest_schema.get("properties", {}):
        failures.append({"path": rel(gui_manifest_schema_path), "error": "gui_manifest_missing_browser_sessions"})
    if "browser_sessions" not in set(gui_manifest_schema.get("required", [])):
        failures.append({"path": rel(gui_manifest_schema_path), "field": "browser_sessions", "error": "gui_manifest_browser_sessions_not_required"})
    testing_manifest = gui_manifest_schema.get("$defs", {}).get("TestingBrowserManifest", {})
    testing_required = set(testing_manifest.get("required", []))
    for field in ["browser_session_id", "visibility_state", "open_watch_state", "evidence_refs", "redaction_manifest_ref"]:
        if field not in testing_required:
            failures.append({"path": rel(gui_manifest_schema_path), "field": f"TestingBrowserManifest.{field}", "error": "testing_browser_manifest_missing_required_field"})
    if testing_manifest.get("properties", {}).get("evidence_refs", {}).get("minItems") != 1:
        failures.append({"path": rel(gui_manifest_schema_path), "field": "TestingBrowserManifest.evidence_refs.minItems", "error": "testing_browser_manifest_evidence_refs_not_required_nonempty"})
    shared_testing_manifest = web_defs.get("TestingBrowserManifest", {})
    shared_testing_required = set(shared_testing_manifest.get("required", []))
    for field in ["browser_session_id", "visibility_state", "open_watch_state", "evidence_refs", "redaction_manifest_ref"]:
        if field not in shared_testing_required:
            failures.append({"path": rel(web_schema_path), "field": f"TestingBrowserManifest.{field}", "error": "shared_testing_browser_manifest_missing_required_field"})
    if shared_testing_manifest.get("properties", {}).get("evidence_refs", {}).get("minItems") != 1:
        failures.append({"path": rel(web_schema_path), "field": "TestingBrowserManifest.evidence_refs.minItems", "error": "shared_testing_browser_manifest_evidence_refs_not_required_nonempty"})
    shared_browser_session = web_defs.get("BrowserSession", {})
    shared_session_required = set(shared_browser_session.get("required", []))
    for field in ["browser_session_id", "session_class", "state", "show_when_possible", "open_watch_state", "created_at_utc", "redaction_profile_id"]:
        if field not in shared_session_required:
            failures.append({"path": rel(web_schema_path), "field": f"BrowserSession.{field}", "error": "shared_browser_session_missing_required_field"})
    shared_browser_recording = web_defs.get("BrowserRecordingArtifact", {})
    shared_recording_required = set(shared_browser_recording.get("required", []))
    for field in ["session", "invocation", "actions", "runtime_state", "artifact_refs", "redaction_profile_id"]:
        if field not in shared_recording_required:
            failures.append({"path": rel(web_schema_path), "field": f"BrowserRecordingArtifact.{field}", "error": "shared_browser_recording_missing_required_field"})

    registry_rows = provider_seed.get("registry_rows", []) if isinstance(provider_seed, dict) else []
    if not isinstance(registry_rows, list) or not registry_rows:
        failures.append({"path": rel(provider_seed_path), "error": "missing_provider_registry_seed_rows"})
        registry_rows = []
    registry_def = web_defs.get("WebProviderAdapterRegistry", {})
    registry_required = set(registry_def.get("required", []))
    for field in ["capability_source_refs", "capability_claim_state", "last_health_check_ref"]:
        if field not in registry_required:
            failures.append({"path": rel(web_schema_path), "definition": "WebProviderAdapterRegistry", "field": field, "error": "provider_registry_missing_provenance_or_health_required_field"})
    registry_ids = {row.get("registry_id") for row in registry_rows if isinstance(row, dict)}
    required_capability_source_refs = {
        "WEB_CAPABILITY_AGENTIC_ROUTING_REVIEW.md",
        "FINDINGS_MATRIX_V3.json",
        "Plans/web_capability_source_packet_receipt.json",
    }
    for index, row in enumerate(registry_rows):
        row_errors = validate_schema(row, registry_def, web_schema, f"$.registry_rows[{index}]")
        for error in row_errors:
            failures.append({"path": rel(provider_seed_path), "error": "invalid_provider_registry_seed_row", "detail": error})
        source_refs = row.get("capability_source_refs", []) if isinstance(row, dict) else []
        if not isinstance(source_refs, list) or not source_refs:
            failures.append({"path": rel(provider_seed_path), "adapter_id": row.get("adapter_id"), "error": "provider_seed_missing_capability_source_refs"})
            source_refs = []
        for source_ref in source_refs:
            if not isinstance(source_ref, str) or source_ref.startswith("/") or "Downloads/" in source_ref or "/Users/" in source_ref:
                failures.append({"path": rel(provider_seed_path), "adapter_id": row.get("adapter_id"), "source_ref": source_ref, "error": "provider_seed_capability_source_ref_leaks_local_path"})
        for required_source_ref in sorted(required_capability_source_refs - set(source_refs)):
            failures.append({"path": rel(provider_seed_path), "adapter_id": row.get("adapter_id"), "source_ref": required_source_ref, "error": "provider_seed_missing_packet_capability_source_ref"})
        capability_claim_state = row.get("capability_claim_state") if isinstance(row, dict) else None
        if provider_seed.get("status") == "canonical_seed_no_secrets" and capability_claim_state != "source_packet_seed_pending_live_health":
            failures.append({"path": rel(provider_seed_path), "adapter_id": row.get("adapter_id"), "claim_state": capability_claim_state, "error": "provider_seed_claim_state_not_marked_pending_live_health"})
        capability_health_states = {
            capability.get("health_state")
            for capability in row.get("capabilities", []) if isinstance(row, dict) and isinstance(capability, dict)
        }
        if capability_claim_state == "source_packet_seed_pending_live_health":
            health_ref = row.get("last_health_check_ref") if isinstance(row, dict) else None
            if not (isinstance(health_ref, str) and health_ref.startswith("health:web.")):
                failures.append({"path": rel(provider_seed_path), "adapter_id": row.get("adapter_id"), "error": "provider_seed_pending_health_missing_health_ref"})
            for health_state in sorted(state for state in capability_health_states if state != "unknown"):
                failures.append({"path": rel(provider_seed_path), "adapter_id": row.get("adapter_id"), "health_state": health_state, "error": "provider_seed_pending_health_claims_live_health"})
        if capability_claim_state == "live_health_checked" and capability_health_states == {"unknown"}:
            failures.append({"path": rel(provider_seed_path), "adapter_id": row.get("adapter_id"), "error": "provider_seed_live_health_claim_without_materialized_health"})
        credential_ref = row.get("credential_ref") if isinstance(row, dict) else None
        if credential_ref is not None and not (isinstance(credential_ref, str) and credential_ref.startswith("secret_ref:")):
            failures.append({"path": rel(provider_seed_path), "adapter_id": row.get("adapter_id"), "error": "provider_seed_credential_not_secret_ref"})
        capabilities = row.get("capabilities", []) if isinstance(row, dict) else []
        capability_refs = {
            capability.get("operation"): capability.get("ssrf_private_host_policy_ref")
            for capability in capabilities
            if isinstance(capability, dict)
            and isinstance(capability.get("operation"), str)
            and isinstance(capability.get("ssrf_private_host_policy_ref"), str)
        }
        row_policy_id = row.get("egress_policy", {}).get("policy_id") if isinstance(row.get("egress_policy"), dict) else None
        capability_policy_values = set(capability_refs.values())
        if len(capability_policy_values) > 1:
            policy_map = row.get("capability_egress_policy_map")
            if not isinstance(policy_map, dict):
                failures.append({"path": rel(provider_seed_path), "adapter_id": row.get("adapter_id"), "error": "mixed_capability_egress_without_policy_map"})
            else:
                for operation, policy_ref in sorted(capability_refs.items()):
                    if policy_map.get(operation) != policy_ref:
                        failures.append({
                            "path": rel(provider_seed_path),
                            "adapter_id": row.get("adapter_id"),
                            "operation": operation,
                            "expected": policy_ref,
                            "actual": policy_map.get(operation),
                            "error": "capability_egress_policy_map_mismatch",
                        })
        elif len(capability_policy_values) == 1 and row_policy_id and next(iter(capability_policy_values)) != row_policy_id:
            failures.append({"path": rel(provider_seed_path), "adapter_id": row.get("adapter_id"), "error": "row_egress_policy_does_not_match_capability_policy"})
    provider_seed_constraints_text = "\n".join(provider_seed.get("negative_constraints", [])) if isinstance(provider_seed, dict) else ""
    for token in ["packet/receipt provenance", "health_state=unknown", "live health/projection sync"]:
        if token not in provider_seed_constraints_text:
            failures.append({"path": rel(provider_seed_path), "token": token, "error": "provider_seed_negative_constraint_missing_provenance_token"})
    provider_ids = {row.get("provider_id") for row in registry_rows if isinstance(row, dict)}
    required_provider_ids = {"pm_native", "exa", "tavily", "firecrawl", "duckduckgo", "google", "jina", "openai", "anthropic", "zai_coding_plan"}
    for provider_id in sorted(required_provider_ids - provider_ids):
        failures.append({"path": rel(provider_seed_path), "provider_id": provider_id, "error": "missing_provider_registry_seed_provider"})
    seen_registry_operations: set[str] = set()
    for row in registry_rows:
        if not isinstance(row, dict):
            continue
        for capability in row.get("capabilities", []):
            if isinstance(capability, dict) and isinstance(capability.get("operation"), str):
                seen_registry_operations.add(capability["operation"])
    for operation in ["search", "read", "extract", "research", "deep_research", "crawl", "map"]:
        if operation not in seen_registry_operations:
            failures.append({"path": rel(provider_seed_path), "web_operation": operation, "error": "missing_provider_registry_seed_operation"})
    mcp_projection_def = web_defs.get("McpProjection", {})
    mcp_projections = provider_seed.get("mcp_projection_examples", []) if isinstance(provider_seed, dict) else []
    if not isinstance(mcp_projections, list) or not mcp_projections:
        failures.append({"path": rel(provider_seed_path), "error": "missing_mcp_projection_examples"})
        mcp_projections = []
    for index, projection in enumerate(mcp_projections):
        projection_errors = validate_schema(projection, mcp_projection_def, web_schema, f"$.mcp_projection_examples[{index}]")
        for error in projection_errors:
            failures.append({"path": rel(provider_seed_path), "error": "invalid_mcp_projection_example", "detail": error})
        if isinstance(projection, dict) and projection.get("no_secret_serialization") is not True:
            failures.append({"path": rel(provider_seed_path), "projection_id": projection.get("projection_id"), "error": "mcp_projection_allows_secret_serialization"})
    coding_projections = provider_seed.get("coding_agent_projection_examples", []) if isinstance(provider_seed, dict) else []
    coding_targets = {row.get("target_runtime") for row in coding_projections if isinstance(row, dict)}
    required_coding_targets = {"claude_code_cli", "cursor_cli", "codex", "gemini_direct", "github_copilot", "zai_coding_plan", "opencode_server"}
    for target in sorted(required_coding_targets - coding_targets):
        failures.append({"path": rel(provider_seed_path), "target_runtime": target, "error": "missing_coding_agent_projection_example"})
    for projection in coding_projections:
        if not isinstance(projection, dict):
            continue
        for provider_id in projection.get("provider_ids", []):
            if provider_id not in provider_ids:
                failures.append({"path": rel(provider_seed_path), "provider_id": provider_id, "target_runtime": projection.get("target_runtime"), "error": "coding_projection_provider_missing_registry_row"})
    coding_projection_by_target = {
        row.get("target_runtime"): set(row.get("provider_ids", []))
        for row in coding_projections if isinstance(row, dict)
    }
    required_coding_projection_providers = {
        "claude_code_cli": {"firecrawl", "exa", "tavily", "jina"},
        "cursor_cli": {"firecrawl", "exa", "tavily", "jina"},
        "codex": {"pm_native", "openai", "zai_coding_plan"},
        "zai_coding_plan": {"pm_native", "zai_coding_plan"},
    }
    for target_runtime, required_target_providers in required_coding_projection_providers.items():
        observed_target_providers = coding_projection_by_target.get(target_runtime, set())
        for provider_id in sorted(required_target_providers - observed_target_providers):
            failures.append({
                "path": rel(provider_seed_path),
                "target_runtime": target_runtime,
                "provider_id": provider_id,
                "error": "missing_required_coding_agent_projection_provider",
            })

    projection_artifact_def = web_defs.get("ProviderProjectionArtifact", {})
    projection_artifacts = projection_fixtures.get("projection_fixtures", []) if isinstance(projection_fixtures, dict) else []
    if not isinstance(projection_artifacts, list) or not projection_artifacts:
        failures.append({"path": rel(projection_fixture_path), "error": "missing_provider_projection_fixtures"})
        projection_artifacts = []
    projection_ids = {projection.get("projection_id") for projection in projection_artifacts if isinstance(projection, dict)}
    seed_projection_ids = {projection.get("projection_id") for projection in mcp_projections if isinstance(projection, dict)}
    for projection_id in sorted(seed_projection_ids - projection_ids):
        failures.append({"path": rel(projection_fixture_path), "projection_id": projection_id, "error": "missing_projection_fixture_for_seed_projection"})
    required_projection_targets = {".claude/mcp.json", ".cursor/mcp.json", ".codex/config.toml"}
    seen_projection_targets = {projection.get("target_config_path") for projection in projection_artifacts if isinstance(projection, dict)}
    for target_path in sorted(required_projection_targets - seen_projection_targets):
        failures.append({"path": rel(projection_fixture_path), "target_config_path": target_path, "error": "missing_provider_projection_target_fixture"})
    projected_provider_ids = {
        provider_id
        for projection in projection_artifacts if isinstance(projection, dict)
        for provider_id in projection.get("provider_ids", [])
    }
    required_projected_provider_ids = {"pm_native", "firecrawl", "exa", "tavily", "jina", "openai", "anthropic", "zai_coding_plan"}
    for provider_id in sorted(required_projected_provider_ids - projected_provider_ids):
        failures.append({
            "path": rel(projection_fixture_path),
            "provider_id": provider_id,
            "error": "missing_required_provider_projection_fixture",
        })
    projection_pairs = {
        (projection.get("target_runtime"), provider_id)
        for projection in projection_artifacts if isinstance(projection, dict)
        for provider_id in projection.get("provider_ids", [])
    }
    required_projection_pairs = {
        ("claude_code_cli", "firecrawl"),
        ("claude_code_cli", "exa"),
        ("claude_code_cli", "tavily"),
        ("claude_code_cli", "jina"),
        ("cursor_cli", "firecrawl"),
        ("cursor_cli", "exa"),
        ("cursor_cli", "tavily"),
        ("cursor_cli", "jina"),
        ("codex", "pm_native"),
        ("codex", "openai"),
        ("codex", "zai_coding_plan"),
        ("claude_code_cli", "anthropic"),
    }
    for target_runtime, provider_id in sorted(required_projection_pairs - projection_pairs):
        failures.append({
            "path": rel(projection_fixture_path),
            "target_runtime": target_runtime,
            "provider_id": provider_id,
            "error": "missing_required_provider_projection_pair",
        })

    def check_projection_secret_values(value: Any, value_path: str, projection_id: str | None) -> None:
        if isinstance(value, dict):
            for key, item in value.items():
                key_lower = str(key).lower()
                item_path = f"{value_path}.{key}"
                if isinstance(item, str):
                    sensitive_key = any(token in key_lower for token in ["api_key", "token", "authorization", "password", "cookie", "secret"])
                    allowed_ref = item.startswith(("secret_ref:", "secret_env_ref:", "provider_account:", "redacted:"))
                    forbidden_value = any(marker in item for marker in ["sk-", "AIza", "AKIA", "-----BEGIN", "Bearer ", "oauth_"])
                    if (sensitive_key and not allowed_ref) or forbidden_value:
                        failures.append({"path": rel(projection_fixture_path), "projection_id": projection_id, "field": item_path, "error": "raw_secret_in_provider_projection_fixture"})
                check_projection_secret_values(item, item_path, projection_id)
        elif isinstance(value, list):
            for index, item in enumerate(value):
                check_projection_secret_values(item, f"{value_path}[{index}]", projection_id)

    for index, projection in enumerate(projection_artifacts):
        projection_errors = validate_schema(projection, projection_artifact_def, web_schema, f"$.projection_fixtures[{index}]")
        for error in projection_errors:
            failures.append({"path": rel(projection_fixture_path), "error": "invalid_provider_projection_fixture", "detail": error})
        if not isinstance(projection, dict):
            continue
        projection_id = projection.get("projection_id")
        if projection.get("no_secret_serialization") is not True:
            failures.append({"path": rel(projection_fixture_path), "projection_id": projection_id, "error": "provider_projection_allows_secret_serialization"})
        for provider_id in projection.get("provider_ids", []):
            if provider_id not in provider_ids:
                failures.append({"path": rel(projection_fixture_path), "provider_id": provider_id, "projection_id": projection_id, "error": "provider_projection_provider_missing_registry_row"})
        for capability_ref in projection.get("capability_refs", []):
            if capability_ref not in registry_ids:
                failures.append({"path": rel(projection_fixture_path), "capability_ref": capability_ref, "projection_id": projection_id, "error": "provider_projection_capability_missing_registry_row"})
        for credential_ref in projection.get("credential_refs", []):
            if isinstance(credential_ref, str) and not credential_ref.startswith("secret_ref:"):
                failures.append({"path": rel(projection_fixture_path), "credential_ref": credential_ref, "projection_id": projection_id, "error": "provider_projection_credential_not_secret_ref"})
        check_projection_secret_values(projection.get("projected_config", {}), "$.projected_config", projection_id)

    card_def = web_defs.get("WebOperationCard", {})
    valid_cards = card_fixtures.get("valid_cards", []) if isinstance(card_fixtures, dict) else []
    if not isinstance(valid_cards, list) or not valid_cards:
        failures.append({"path": rel(card_fixture_path), "error": "missing_web_operation_card_fixtures"})
        valid_cards = []
    seen_card_kinds = set()
    for index, card in enumerate(valid_cards):
        if isinstance(card, dict):
            seen_card_kinds.add(card.get("card_kind"))
            card_payload = {key: value for key, value in card.items() if key != "case_id"}
        else:
            card_payload = card
        card_errors = validate_schema(card_payload, card_def, web_schema, f"$.valid_cards[{index}]")
        for error in card_errors:
            failures.append({"path": rel(card_fixture_path), "error": "invalid_web_operation_card_fixture", "detail": error})
    for card_kind in ["operation", "progress", "refs", "denied", "partial", "fallback", "settings_health", "approval", "session", "batch"]:
        if card_kind not in seen_card_kinds:
            failures.append({"path": rel(card_fixture_path), "card_kind": card_kind, "error": "missing_web_operation_card_kind_fixture"})
    invalid_card_case_ids = {
        invalid.get("case_id")
        for invalid in card_fixtures.get("invalid_cards", []) if isinstance(invalid, dict)
    } if isinstance(card_fixtures, dict) else set()
    if "command_operation_tool_mismatch" not in invalid_card_case_ids:
        failures.append({"path": rel(card_fixture_path), "case_id": "command_operation_tool_mismatch", "error": "missing_invalid_web_operation_card_fixture"})
    for invalid in card_fixtures.get("invalid_cards", []) if isinstance(card_fixtures, dict) else []:
        if not isinstance(invalid, dict):
            continue
        card = invalid.get("card", {})
        if not validate_schema(card, card_def, web_schema, "$.invalid_cards[*].card"):
            failures.append({"path": rel(card_fixture_path), "case_id": invalid.get("case_id"), "error": "invalid_web_operation_card_fixture_unexpectedly_valid"})

    intent_routes = intent_fixtures.get("valid_routes", []) if isinstance(intent_fixtures, dict) else []
    browser_dispatch_invariant = intent_fixtures.get("browser_action_dispatch_invariant", {}) if isinstance(intent_fixtures, dict) else {}
    expected_browser_dispatch_invariant = {
        "parent_command_id": "cmd.chat.web.fetch",
        "parent_web_operation": "read",
        "parent_tool_id": "webfetch",
        "browser_action_field": "browser_action",
        "not_a_separate_slash_family": True,
        "not_a_separate_browser_tool_id": True,
    }
    for field, expected in expected_browser_dispatch_invariant.items():
        if not isinstance(browser_dispatch_invariant, dict) or browser_dispatch_invariant.get(field) != expected:
            failures.append({
                "path": rel(intent_fixture_path),
                "field": f"browser_action_dispatch_invariant.{field}",
                "expected": expected,
                "actual": browser_dispatch_invariant.get(field) if isinstance(browser_dispatch_invariant, dict) else None,
                "error": "browser_action_dispatch_invariant_mismatch",
            })
    if not isinstance(intent_routes, list) or not intent_routes:
        failures.append({"path": rel(intent_fixture_path), "error": "missing_web_intent_routing_fixtures"})
        intent_routes = []
    route_operations = {route.get("web_operation") for route in intent_routes if isinstance(route, dict)}
    route_sources = {route.get("invocation_source") for route in intent_routes if isinstance(route, dict)}
    for operation in ["search", "read", "extract", "research", "deep_research", "crawl", "map"]:
        if operation not in route_operations:
            failures.append({"path": rel(intent_fixture_path), "web_operation": operation, "error": "missing_intent_route_operation"})
    for source in sorted(required_sources):
        if source not in route_sources:
            failures.append({"path": rel(intent_fixture_path), "invocation_source": source, "error": "missing_intent_route_invocation_source"})
    for route in intent_routes:
        if not isinstance(route, dict):
            continue
        if route.get("agent_reason_required") is True and route.get("invocation_source") not in {"agent_initiated", "goal", "prd", "planning_wizard", "subagent"}:
            failures.append({"path": rel(intent_fixture_path), "case_id": route.get("case_id"), "error": "agent_reason_required_on_non_agentic_source"})
        if route.get("agent_reason_required") is True and not route.get("agent_reason"):
            failures.append({"path": rel(intent_fixture_path), "case_id": route.get("case_id"), "error": "missing_agent_reason_for_agentic_intent_route"})
        if route.get("web_operation") == "read" and route.get("tool_id") != "webfetch":
            failures.append({"path": rel(intent_fixture_path), "case_id": route.get("case_id"), "error": "url_read_route_not_webfetch"})
        if "browser_action" in route:
            browser_action = route.get("browser_action")
            if not isinstance(browser_action, dict):
                failures.append({"path": rel(intent_fixture_path), "case_id": route.get("case_id"), "error": "browser_action_not_object"})
            else:
                for error in validate_schema(browser_action, web_defs.get("BrowserActionInput", {}), web_schema, "$.browser_action"):
                    failures.append({"path": rel(intent_fixture_path), "case_id": route.get("case_id"), "error": "browser_action_invalid", "detail": error})
    route_equivalence_groups = intent_fixtures.get("route_equivalence_groups", []) if isinstance(intent_fixtures, dict) else []
    if not isinstance(route_equivalence_groups, list) or not route_equivalence_groups:
        failures.append({"path": rel(intent_fixture_path), "error": "missing_route_equivalence_groups"})
        route_equivalence_groups = []
    required_equivalence_group_ids = {
        "search_equivalence",
        "read_equivalence",
        "extract_equivalence",
        "research_equivalence",
        "deep_research_equivalence",
        "crawl_equivalence",
        "map_equivalence",
        "browser_visual_evidence_equivalence",
    }
    seen_equivalence_group_ids = {
        group.get("group_id")
        for group in route_equivalence_groups
        if isinstance(group, dict)
    }
    for group_id in sorted(required_equivalence_group_ids - seen_equivalence_group_ids):
        failures.append({"path": rel(intent_fixture_path), "group_id": group_id, "error": "missing_route_equivalence_group"})
    required_equivalence_sources = {"slash", "palette", "nl_user", "agent_initiated"}
    for group in route_equivalence_groups:
        if not isinstance(group, dict):
            failures.append({"path": rel(intent_fixture_path), "error": "invalid_route_equivalence_group"})
            continue
        group_id = group.get("group_id")
        group_operation = group.get("web_operation")
        group_command_id = group.get("command_id")
        group_tool_id = group.get("tool_id")
        declared_sources = set(group.get("required_invocation_sources", [])) if isinstance(group.get("required_invocation_sources"), list) else set()
        if not required_equivalence_sources.issubset(declared_sources):
            failures.append({"path": rel(intent_fixture_path), "group_id": group_id, "missing_sources": sorted(required_equivalence_sources - declared_sources), "error": "route_equivalence_group_missing_required_sources"})
        routes = group.get("routes", [])
        if not isinstance(routes, list) or not routes:
            failures.append({"path": rel(intent_fixture_path), "group_id": group_id, "error": "route_equivalence_group_missing_routes"})
            continue
        seen_sources: set[str] = set()
        for route in routes:
            if not isinstance(route, dict):
                failures.append({"path": rel(intent_fixture_path), "group_id": group_id, "error": "invalid_route_equivalence_route"})
                continue
            case_id = route.get("case_id")
            source = route.get("invocation_source")
            if isinstance(source, str):
                seen_sources.add(source)
            for field, expected in [("command_id", group_command_id), ("web_operation", group_operation), ("tool_id", group_tool_id)]:
                if route.get(field) != expected:
                    failures.append({"path": rel(intent_fixture_path), "group_id": group_id, "case_id": case_id, "field": field, "expected": expected, "actual": route.get(field), "error": "route_equivalence_mismatch"})
            if route.get("agent_reason_required") is True and route.get("invocation_source") not in {"agent_initiated", "goal", "prd", "planning_wizard", "subagent"}:
                failures.append({"path": rel(intent_fixture_path), "group_id": group_id, "case_id": case_id, "error": "agent_reason_required_on_non_agentic_equivalence_route"})
            if route.get("agent_reason_required") is True and not route.get("agent_reason"):
                failures.append({"path": rel(intent_fixture_path), "group_id": group_id, "case_id": case_id, "error": "missing_agent_reason_for_agentic_equivalence_route"})
            if group.get("browser_action_required") is True and "browser_action" not in route:
                failures.append({"path": rel(intent_fixture_path), "group_id": group_id, "case_id": case_id, "error": "route_equivalence_missing_browser_action"})
            if "browser_action" in route:
                browser_action = route.get("browser_action")
                if not isinstance(browser_action, dict):
                    failures.append({"path": rel(intent_fixture_path), "group_id": group_id, "case_id": case_id, "error": "route_equivalence_browser_action_not_object"})
                else:
                    for error in validate_schema(browser_action, web_defs.get("BrowserActionInput", {}), web_schema, "$.browser_action"):
                        failures.append({"path": rel(intent_fixture_path), "group_id": group_id, "case_id": case_id, "error": "route_equivalence_browser_action_invalid", "detail": error})
        if not required_equivalence_sources.issubset(seen_sources):
            failures.append({"path": rel(intent_fixture_path), "group_id": group_id, "missing_sources": sorted(required_equivalence_sources - seen_sources), "error": "route_equivalence_group_routes_missing_required_sources"})
    invalid_intent_case_ids = {route.get("case_id") for route in intent_fixtures.get("invalid_routes", []) if isinstance(route, dict)} if isinstance(intent_fixtures, dict) else set()
    for case_id in ["url_read_must_not_search", "bare_web_must_not_execute", "deep_research_not_seventh_slash_family", "agentic_route_missing_reason"]:
        if case_id not in invalid_intent_case_ids:
            failures.append({"path": rel(intent_fixture_path), "case_id": case_id, "error": "missing_invalid_intent_route_fixture"})
    agentic_matrix = intent_fixtures.get("agentic_dispatch_matrix", []) if isinstance(intent_fixtures, dict) else []
    if not isinstance(agentic_matrix, list) or not agentic_matrix:
        failures.append({"path": rel(intent_fixture_path), "error": "missing_agentic_dispatch_matrix"})
        agentic_matrix = []
    expected_agentic_command_tool = {
        "search": ("cmd.chat.web.search", "websearch"),
        "read": ("cmd.chat.web.fetch", "webfetch"),
        "extract": ("cmd.chat.web.extract", "webextract"),
        "research": ("cmd.chat.web.research", "webresearch"),
        "deep_research": ("cmd.chat.web.research", "webresearch"),
        "crawl": ("cmd.chat.web.crawl", "webcrawl"),
        "map": ("cmd.chat.web.map", "webmap"),
    }
    required_agentic_sources = {"agent_initiated", "goal", "prd", "planning_wizard", "subagent"}
    matrix_ops = {row.get("web_operation") for row in agentic_matrix if isinstance(row, dict) and row.get("browser_action_required") is not True}
    for operation in sorted(set(expected_agentic_command_tool) - matrix_ops):
        failures.append({"path": rel(intent_fixture_path), "web_operation": operation, "error": "missing_agentic_dispatch_matrix_operation"})
    browser_matrix_rows = [row for row in agentic_matrix if isinstance(row, dict) and row.get("browser_action_required") is True]
    if not browser_matrix_rows:
        failures.append({"path": rel(intent_fixture_path), "error": "missing_agentic_browser_visual_evidence_matrix_row"})
    for row in agentic_matrix:
        if not isinstance(row, dict):
            failures.append({"path": rel(intent_fixture_path), "error": "invalid_agentic_dispatch_matrix_row"})
            continue
        operation = row.get("web_operation")
        case_id = row.get("case_id")
        expected_command_tool = expected_agentic_command_tool.get(operation)
        if expected_command_tool is None:
            failures.append({"path": rel(intent_fixture_path), "case_id": case_id, "web_operation": operation, "error": "unknown_agentic_dispatch_matrix_operation"})
            continue
        expected_command_id, expected_tool_id = expected_command_tool
        if row.get("command_id") != expected_command_id or row.get("tool_id") != expected_tool_id:
            failures.append({
                "path": rel(intent_fixture_path),
                "case_id": case_id,
                "web_operation": operation,
                "expected_command_id": expected_command_id,
                "expected_tool_id": expected_tool_id,
                "error": "agentic_dispatch_matrix_command_tool_mismatch",
            })
        observed_sources = set(row.get("invocation_sources", [])) if isinstance(row.get("invocation_sources"), list) else set()
        if not required_agentic_sources.issubset(observed_sources):
            failures.append({
                "path": rel(intent_fixture_path),
                "case_id": case_id,
                "missing_sources": sorted(required_agentic_sources - observed_sources),
                "error": "agentic_dispatch_matrix_missing_invocation_sources",
            })
        if row.get("agent_reason_required") is not True:
            failures.append({"path": rel(intent_fixture_path), "case_id": case_id, "error": "agentic_dispatch_matrix_reason_not_required"})
        evidence_destinations = set(row.get("source_evidence_destination_for", [])) if isinstance(row.get("source_evidence_destination_for"), list) else set()
        for source in ["prd", "planning_wizard"]:
            if source not in evidence_destinations:
                failures.append({"path": rel(intent_fixture_path), "case_id": case_id, "invocation_source": source, "error": "agentic_dispatch_matrix_missing_source_evidence_destination"})

    negative_cases = policy_fixtures.get("negative_cases", []) if isinstance(policy_fixtures, dict) else []
    if not isinstance(negative_cases, list) or not negative_cases:
        failures.append({"path": rel(policy_fixture_path), "error": "missing_web_policy_negative_fixtures"})
        negative_cases = []
    negative_case_ids = {case.get("case_id") for case in negative_cases if isinstance(case, dict)}
    required_negative_case_ids = {
        "no_raw_secret_projection",
        "ssrf_private_host_denied",
        "localhost_denied_without_explicit_private_host_approval",
        "plan_mode_web_visible_ask_not_silent_deny",
        "strict_no_network_denies_with_card",
        "search_scope_wildcard_not_host",
        "fetch_scope_host_scoped",
        "crawl_robots_denial_recorded",
        "crawl_fanout_depth_cap_recorded",
        "cache_no_secret_and_ttl_required",
        "browser_runtime_unavailable_remediation",
        "prompt_injection_visible_chips_not_hidden",
        "url_query_redaction_required",
        "browser_artifact_missing_redaction_rejected",
        "browser_artifact_failed_redaction_rejected",
        "research_snippet_only_citation_rejected",
        "prd_planning_research_source_evidence_required",
        "evidence_agentic_invocation_missing_reason",
        "api_web_call_agentic_invocation_missing_reason",
        "browser_recording_agentic_invocation_missing_reason",
        "evidence_planning_research_source_evidence_required",
    }
    for case_id in sorted(required_negative_case_ids - negative_case_ids):
        failures.append({"path": rel(policy_fixture_path), "case_id": case_id, "error": "missing_web_policy_negative_fixture"})
    negative_case_by_id = {case.get("case_id"): case for case in negative_cases if isinstance(case, dict)}
    negative_case_required_fields = {
        "no_raw_secret_projection": ["must_reject", "expected_error"],
        "ssrf_private_host_denied": ["input_url", "expected_decision", "expected_reason"],
        "localhost_denied_without_explicit_private_host_approval": ["input_url", "expected_decision", "expected_reason"],
        "plan_mode_web_visible_ask_not_silent_deny": ["run_mode", "tool_id", "expected_decision", "must_show_card"],
        "strict_no_network_denies_with_card": ["network_policy", "tool_id", "expected_decision", "expected_reason", "must_show_card"],
        "search_scope_wildcard_not_host": ["tool_id", "expected_scope", "forbidden_scope"],
        "fetch_scope_host_scoped": ["tool_id", "input_url", "expected_scope"],
        "crawl_robots_denial_recorded": ["tool_id", "root_url", "respect_robots", "expected_reason", "must_record_evidence"],
        "crawl_fanout_depth_cap_recorded": ["tool_id", "root_url", "max_pages", "max_depth", "expected_reason", "must_record_evidence"],
        "cache_no_secret_and_ttl_required": ["tool_id", "cache_state", "must_require"],
        "browser_runtime_unavailable_remediation": ["runtime_state", "must_require"],
        "prompt_injection_visible_chips_not_hidden": ["input_kind", "must_require", "must_not"],
        "url_query_redaction_required": ["input_url", "forbidden_tokens", "expected_error"],
        "browser_artifact_missing_redaction_rejected": ["artifact_kind", "redaction_status", "expected_error"],
        "browser_artifact_failed_redaction_rejected": ["artifact_kind", "redaction_status", "expected_error"],
        "research_snippet_only_citation_rejected": ["evidence_kind", "snippet_only", "expected_error"],
        "prd_planning_research_source_evidence_required": ["invocation_source", "tool_id", "must_require", "must_require_one_of", "must_not"],
        "evidence_agentic_invocation_missing_reason": ["invocation_source", "must_require", "expected_error"],
        "api_web_call_agentic_invocation_missing_reason": ["invocation_source", "must_require", "expected_error"],
        "browser_recording_agentic_invocation_missing_reason": ["invocation_source", "must_require", "expected_error"],
        "evidence_planning_research_source_evidence_required": ["invocation_source", "tool_id", "must_require_one_of", "must_not", "expected_error"],
    }
    for case_id, fields in negative_case_required_fields.items():
        case = negative_case_by_id.get(case_id)
        if not isinstance(case, dict):
            continue
        for field in fields:
            if field not in case:
                failures.append({"path": rel(policy_fixture_path), "case_id": case_id, "field": field, "error": "web_policy_negative_case_missing_semantic_field"})
    for case_id in ["ssrf_private_host_denied", "localhost_denied_without_explicit_private_host_approval", "strict_no_network_denies_with_card"]:
        case = negative_case_by_id.get(case_id, {})
        if isinstance(case, dict) and case.get("expected_decision") != "deny":
            failures.append({"path": rel(policy_fixture_path), "case_id": case_id, "error": "web_policy_negative_case_expected_decision_not_deny"})
    plan_case = negative_case_by_id.get("plan_mode_web_visible_ask_not_silent_deny", {})
    if isinstance(plan_case, dict) and plan_case.get("expected_decision") != "ask":
        failures.append({"path": rel(policy_fixture_path), "case_id": "plan_mode_web_visible_ask_not_silent_deny", "error": "plan_mode_web_case_not_ask"})
    planning_case = negative_case_by_id.get("prd_planning_research_source_evidence_required", {})
    if isinstance(planning_case, dict):
        if set(planning_case.get("must_require_one_of", [])) != {"ledger_source_evidence_ref", "plan_source_evidence_ref"}:
            failures.append({"path": rel(policy_fixture_path), "case_id": "prd_planning_research_source_evidence_required", "error": "planning_source_evidence_case_uses_wrong_schema_fields"})
        forbidden_targets = set(planning_case.get("must_not", []))
        for forbidden in ["WorkNode", "NodeSeed", "runtime_queue"]:
            if forbidden not in forbidden_targets:
                failures.append({"path": rel(policy_fixture_path), "case_id": "prd_planning_research_source_evidence_required", "forbidden": forbidden, "error": "planning_source_evidence_case_missing_forbidden_runtime_target"})
    evidence_planning_case = negative_case_by_id.get("evidence_planning_research_source_evidence_required", {})
    if isinstance(evidence_planning_case, dict):
        if set(evidence_planning_case.get("must_require_one_of", [])) != {"ledger_source_evidence_ref", "plan_source_evidence_ref"}:
            failures.append({"path": rel(policy_fixture_path), "case_id": "evidence_planning_research_source_evidence_required", "error": "evidence_planning_source_case_uses_wrong_schema_fields"})
        forbidden_targets = set(evidence_planning_case.get("must_not", []))
        for forbidden in ["WorkNode", "NodeSeed", "runtime_queue"]:
            if forbidden not in forbidden_targets:
                failures.append({"path": rel(policy_fixture_path), "case_id": "evidence_planning_research_source_evidence_required", "forbidden": forbidden, "error": "evidence_planning_source_case_missing_forbidden_runtime_target"})
    cache_case = negative_case_by_id.get("cache_no_secret_and_ttl_required", {})
    if isinstance(cache_case, dict):
        must_equal = cache_case.get("must_equal", {})
        if not isinstance(must_equal, dict) or must_equal.get("no_secret_verified") is not True:
            failures.append({"path": rel(policy_fixture_path), "case_id": "cache_no_secret_and_ttl_required", "error": "cache_no_secret_fixture_does_not_require_true"})
    for case_id in [
        "evidence_agentic_invocation_missing_reason",
        "api_web_call_agentic_invocation_missing_reason",
        "browser_recording_agentic_invocation_missing_reason",
    ]:
        case = negative_case_by_id.get(case_id, {})
        if isinstance(case, dict) and "agent_reason" not in set(case.get("must_require", [])):
            failures.append({"path": rel(policy_fixture_path), "case_id": case_id, "error": "agentic_invocation_negative_case_missing_agent_reason_requirement"})

    def host_class_for_url(raw_url: str) -> str:
        parsed = urlparse(raw_url)
        if parsed.scheme == "file":
            return "file_scheme"
        host = (parsed.hostname or "").lower()
        if host in {"localhost", "ip6-localhost"}:
            return "localhost"
        try:
            ip = ipaddress.ip_address(host)
        except ValueError:
            return "public"
        if ip.is_loopback:
            return "localhost"
        if ip.is_private or ip.is_link_local or ip.is_reserved or ip.is_multicast or ip.is_unspecified:
            return "private_or_metadata"
        return "public"

    def scope_for_url(raw_url: str) -> str:
        parsed = urlparse(raw_url)
        scheme = parsed.scheme or "https"
        host = parsed.hostname or ""
        return f"{scheme}://{registrable_domain_for_host(host)}/*"

    def registrable_domain_for_host(host: str) -> str:
        normalized = (host or "").strip(".").lower()
        if not normalized:
            return normalized
        try:
            ipaddress.ip_address(normalized)
            return normalized
        except ValueError:
            pass
        if normalized in {"localhost", "ip6-localhost"}:
            return normalized
        labels = [label for label in normalized.split(".") if label]
        if len(labels) <= 2:
            return normalized
        # Fixture-grade approximation: owner docs require registrable-domain
        # normalization; live implementation may use a public suffix list.
        return ".".join(labels[-2:])

    egress_assertions = policy_fixtures.get("egress_assertions", []) if isinstance(policy_fixtures, dict) else []
    if not isinstance(egress_assertions, list) or not egress_assertions:
        failures.append({"path": rel(policy_fixture_path), "error": "missing_executable_egress_assertions"})
        egress_assertions = []
    egress_case_ids = {assertion.get("case_id") for assertion in egress_assertions if isinstance(assertion, dict)}
    required_egress_case_ids = {
        "metadata_ip_denied",
        "localhost_denied",
        "loopback_ip_denied",
        "ipv6_loopback_denied",
        "ipv6_link_local_denied",
        "rfc1918_private_ip_denied",
        "file_url_denied",
        "redirect_to_private_denied",
        "dns_rebind_to_private_denied",
        "public_https_allowed_for_fetch_preflight",
    }
    for case_id in sorted(required_egress_case_ids - egress_case_ids):
        failures.append({"path": rel(policy_fixture_path), "case_id": case_id, "error": "missing_executable_egress_assertion_case"})
    for assertion in egress_assertions:
        if not isinstance(assertion, dict):
            continue
        case_id = assertion.get("case_id")
        observed_class = host_class_for_url(assertion.get("input_url", ""))
        if observed_class != assertion.get("expected_host_class"):
            failures.append({"path": rel(policy_fixture_path), "case_id": case_id, "observed": observed_class, "expected": assertion.get("expected_host_class"), "error": "egress_host_class_mismatch"})
        expected_decision = assertion.get("expected_decision")
        redirect_target_url = assertion.get("redirect_target_url")
        resolved_ip = assertion.get("resolved_ip")
        dns_rebind_detected = assertion.get("dns_rebind_detected") is True
        if isinstance(resolved_ip, str):
            observed_resolved_class = host_class_for_url(f"http://{resolved_ip}")
            if observed_resolved_class != assertion.get("expected_resolved_host_class"):
                failures.append({"path": rel(policy_fixture_path), "case_id": case_id, "observed": observed_resolved_class, "expected": assertion.get("expected_resolved_host_class"), "error": "egress_resolved_host_class_mismatch"})
            if observed_class == "public" and observed_resolved_class in {"localhost", "private_or_metadata"}:
                if not dns_rebind_detected:
                    failures.append({"path": rel(policy_fixture_path), "case_id": case_id, "error": "dns_rebind_fixture_missing_detection_flag"})
                if expected_decision != "deny":
                    failures.append({"path": rel(policy_fixture_path), "case_id": case_id, "error": "dns_rebind_assertion_not_denied"})
        if isinstance(redirect_target_url, str):
            observed_redirect_class = host_class_for_url(redirect_target_url)
            if observed_redirect_class != assertion.get("expected_redirect_host_class"):
                failures.append({"path": rel(policy_fixture_path), "case_id": case_id, "observed": observed_redirect_class, "expected": assertion.get("expected_redirect_host_class"), "error": "egress_redirect_host_class_mismatch"})
            if observed_redirect_class in {"localhost", "private_or_metadata", "file_scheme"} and assertion.get("expected_redirect_decision") != "deny":
                failures.append({"path": rel(policy_fixture_path), "case_id": case_id, "error": "private_redirect_assertion_not_denied"})
        if observed_class in {"localhost", "private_or_metadata", "file_scheme"} and expected_decision != "deny":
            failures.append({"path": rel(policy_fixture_path), "case_id": case_id, "error": "private_host_assertion_not_denied"})
        if observed_class == "public" and not redirect_target_url and not dns_rebind_detected and expected_decision not in {"ask", "allow"}:
            failures.append({"path": rel(policy_fixture_path), "case_id": case_id, "error": "public_host_assertion_not_ask_or_allow"})

    permission_scope_assertions = policy_fixtures.get("permission_scope_assertions", []) if isinstance(policy_fixtures, dict) else []
    if not isinstance(permission_scope_assertions, list) or not permission_scope_assertions:
        failures.append({"path": rel(policy_fixture_path), "error": "missing_executable_permission_scope_assertions"})
        permission_scope_assertions = []
    for assertion in permission_scope_assertions:
        if not isinstance(assertion, dict):
            continue
        tool_id = assertion.get("tool_id")
        case_id = assertion.get("case_id")
        if tool_id in {"websearch", "webresearch"}:
            observed_scope = "*"
        else:
            observed_scope = scope_for_url(assertion.get("input_url") or assertion.get("root_url") or "")
        if observed_scope != assertion.get("expected_scope"):
            failures.append({"path": rel(policy_fixture_path), "case_id": case_id, "observed": observed_scope, "expected": assertion.get("expected_scope"), "error": "permission_scope_assertion_mismatch"})

    run_mode_assertions = policy_fixtures.get("run_mode_assertions", []) if isinstance(policy_fixtures, dict) else []
    if not isinstance(run_mode_assertions, list) or not run_mode_assertions:
        failures.append({"path": rel(policy_fixture_path), "error": "missing_executable_run_mode_assertions"})
        run_mode_assertions = []
    for assertion in run_mode_assertions:
        if not isinstance(assertion, dict):
            continue
        case_id = assertion.get("case_id")
        if assertion.get("run_mode") not in {"ask", "plan", "regular", "yolo"}:
            failures.append({"path": rel(policy_fixture_path), "case_id": case_id, "run_mode": assertion.get("run_mode"), "error": "run_mode_assertion_not_canonical_runtime_mode"})
        if assertion.get("effective_overlay") == "deep_plan" and assertion.get("normalized_runtime_mode") != "plan":
            failures.append({"path": rel(policy_fixture_path), "case_id": case_id, "error": "deep_plan_overlay_not_normalized_to_plan"})
        network_policy = assertion.get("network_policy")
        observed_decision = "deny" if network_policy == "deny" else "ask"
        if observed_decision != assertion.get("expected_decision"):
            failures.append({"path": rel(policy_fixture_path), "case_id": case_id, "observed": observed_decision, "expected": assertion.get("expected_decision"), "error": "run_mode_assertion_decision_mismatch"})
        if assertion.get("must_show_card") is not True:
            failures.append({"path": rel(policy_fixture_path), "case_id": case_id, "error": "run_mode_assertion_missing_visible_card"})

    crawl_policy_assertions = policy_fixtures.get("crawl_policy_assertions", []) if isinstance(policy_fixtures, dict) else []
    if not isinstance(crawl_policy_assertions, list) or not crawl_policy_assertions:
        failures.append({"path": rel(policy_fixture_path), "error": "missing_executable_crawl_policy_assertions"})
        crawl_policy_assertions = []
    for assertion in crawl_policy_assertions:
        if not isinstance(assertion, dict):
            continue
        case_id = assertion.get("case_id")
        observed_reason = None
        if assertion.get("respect_robots") is True and assertion.get("robots_allowed") is False:
            observed_reason = "robots_denied"
        elif assertion.get("requested_max_pages", 0) > assertion.get("policy_fanout_limit", 10**9):
            observed_reason = "fanout_capped"
        elif assertion.get("requested_max_depth", 0) > assertion.get("policy_max_depth", 10**9):
            observed_reason = "depth_capped"
        if observed_reason != assertion.get("expected_reason"):
            failures.append({"path": rel(policy_fixture_path), "case_id": case_id, "observed": observed_reason, "expected": assertion.get("expected_reason"), "error": "crawl_policy_assertion_reason_mismatch"})

    redaction_assertions = policy_fixtures.get("redaction_assertions", []) if isinstance(policy_fixtures, dict) else []
    if not isinstance(redaction_assertions, list) or not redaction_assertions:
        failures.append({"path": rel(policy_fixture_path), "error": "missing_executable_redaction_assertions"})
        redaction_assertions = []
    for assertion in redaction_assertions:
        if not isinstance(assertion, dict):
            continue
        case_id = assertion.get("case_id")
        surface = assertion.get("surface")
        if surface == "url_query":
            redacted = assertion.get("expected_redacted_url", "")
            for token in assertion.get("forbidden_tokens", []):
                if isinstance(token, str) and token and token in redacted:
                    failures.append({"path": rel(policy_fixture_path), "case_id": case_id, "token": token, "error": "redaction_assertion_leaks_forbidden_token"})
            if "REDACTED" not in redacted:
                failures.append({"path": rel(policy_fixture_path), "case_id": case_id, "error": "redaction_assertion_missing_redacted_marker"})
        elif surface == "browser_artifact":
            status = assertion.get("redaction_status")
            expected_error = assertion.get("expected_error")
            if expected_error == "missing_redaction_status" and status is not None:
                failures.append({"path": rel(policy_fixture_path), "case_id": case_id, "error": "missing_redaction_assertion_has_status"})
            if expected_error == "artifact_redaction_failed" and status != "failed":
                failures.append({"path": rel(policy_fixture_path), "case_id": case_id, "error": "failed_redaction_assertion_not_failed"})
        else:
            failures.append({"path": rel(policy_fixture_path), "case_id": case_id, "surface": surface, "error": "unknown_redaction_assertion_surface"})

    fixture_path = ROOT / "tests/fixtures/runtime_artifacts/golden/runtime_artifact_fixtures.json"
    if not fixture_path.exists():
        failures.append({"path": rel(fixture_path), "error": "missing_runtime_artifact_fixture_matrix"})
    else:
        fixture_matrix = load_json(fixture_path)
        valid_payloads = fixture_matrix.get("valid_payloads", []) if isinstance(fixture_matrix, dict) else []
        seen_operations: set[str] = set()
        seen_invocation_sources: set[str] = set()
        for artifact in valid_payloads:
            if not isinstance(artifact, dict) or artifact.get("artifact_type") != "api_web_call":
                continue
            payload = artifact.get("type_payload", {})
            if not isinstance(payload, dict):
                continue
            operation = payload.get("web_operation")
            if isinstance(operation, str):
                seen_operations.add(operation)
            invocation = payload.get("invocation", {})
            if isinstance(invocation, dict):
                invocation_source = invocation.get("invocation_source")
                if isinstance(invocation_source, str):
                    seen_invocation_sources.add(invocation_source)
        for operation in ["search", "read", "extract", "research", "deep_research", "crawl", "map"]:
            if operation not in seen_operations:
                failures.append({"path": rel(fixture_path), "web_operation": operation, "error": "missing_api_web_call_fixture_for_operation"})
        for invocation_source in sorted(required_sources):
            if invocation_source not in seen_invocation_sources:
                failures.append({"path": rel(fixture_path), "invocation_source": invocation_source, "error": "missing_api_web_call_fixture_for_invocation_source"})

    doc_requirements = [
        (PLANS / "00-plans-index.md", ["web_operation_contracts.schema.json", "web_provider_adapter_registry.seed.json", "web_provider_projection_fixtures.json", "web_capability_source_packet_receipt.json", "web_capability_findings_coverage.json", "web_capability_findings_coverage.schema.json", "web_operation_card_fixtures.json", "web_operation_job_fixtures.json", "web_agent_policy_fixtures.json", "web_research_run_fixtures.json", "web_intent_routing_fixtures.json", "web_policy_negative_fixtures.json", "web_policy_negative_fixtures.schema.json", "WebOperation", "BrowserActionResult"]),
        (PLANS / "Commands_System.md", ["/web fetch <url>", "cmd.chat.web.fetch", "WebOperation / BrowserAction dispatcher", "invocation_source", "agent_reason", "webfetch"]),
        (PLANS / "UI_Command_Catalog.md", ["/web fetch <url>", "cmd.chat.web.fetch", "invocation_source", "agent_reason"]),
        (PLANS / "assistant-chat-design.md", ["/web fetch <url>", "cmd.chat.web.fetch", "operation_input", "denial_reason_code"]),
        (PLANS / "Prompt_Pipeline.md", ["WebCapabilityAffordance", "websearch", "webfetch", "BrowserAction"]),
        (PLANS / "Run_Modes.md", ["websearch", "webfetch", "webextract", "webresearch", "webcrawl", "webmap"]),
        (PLANS / "Goal_Runtime_System.md", ["websearch", "webfetch", "webextract", "webresearch", "deep_research", "BrowserAction", "invocation_source"]),
        (PLANS / "Personas.md", ["researcher", "deep-researcher", "websearch", "webfetch", "deep-research"]),
        (PLANS / "PRD_Builder.md", ["websearch", "webfetch", "webcrawl", "webmap", "deep-research", "ledger"]),
        (PLANS / "Planning_Wizard.md", ["websearch", "webfetch", "deep-research", "Planning Context"]),
        (PLANS / "FinalGUISpec.md", ["operation_input", "legacy web_input", "Reading Site", "runtime_unavailable"]),
        (PLANS / "Automated_Testing_System.md", ["SSRF", "robots/fanout/depth", "research/source citation", "runtime_unavailable"]),
        (PLANS / "MCP_Integration.md", ["web_provider_projection_fixtures.json", "WebProviderAdapterRegistry", "no-secret projections"]),
    ]
    for path, tokens in doc_requirements:
        if not path.exists():
            failures.append({"path": rel(path), "error": "missing_web_capability_doc"})
            continue
        text = path.read_text(encoding="utf-8")
        for token in tokens:
            if token not in text:
                failures.append({"path": rel(path), "token": token, "error": "missing_web_capability_doc_token"})

    for path in PLANS.rglob("*"):
        if not path.is_file():
            continue
        path_rel = rel(path)
        if path_rel.startswith(("Plans/ledgers/", "Plans/_shards/", "Plans/.evidence/", "Plans/.plan_index/", "Plans/.plan_migration/")):
            continue
        if path.suffix.lower() not in {".md", ".json", ".jsonl", ".schema"} and ".schema." not in path.name:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        if "Charlotte" in text or "charlotte" in text:
            failures.append({"path": path_rel, "error": "charlotte_term_in_canonical_web_surface"})
        for retired_marker in ["structured `web_input`", "structured web_input"]:
            if retired_marker in text:
                failures.append(
                    {
                        "path": path_rel,
                        "token": retired_marker,
                        "error": "active_web_input_alias_in_canonical_web_surface",
                    }
                )
        # PM canon: the PM-managed built-in Browser Program / Site Reader is native.
        # A user Project may independently run an
        # external suite, but Puppet Master exposes no Playwright/CDP runtime, fallback,
        # facade, compatibility surface, package, port, MCP route, command, or capture
        # engine. Reject wording that re-asserts it as a primary/default/standard/only
        # PM web GUI/test path. Targeted multi-token phrases (not the bare name) keep
        # explicit prohibitions and third-party provenance searchable.
        lowered = text.lower()
        for primary_phrase in (
            "playwright is the standard",
            "playwright is the primary",
            "playwright is the default",
            "playwright is the only",
            "playwright remains the web",
            "playwright remains the web-based gui",
            "playwright suffices",
            "playwright is the web-based gui path",
            "playwright is the web gui path",
            "no (playwright is the standard)",
            "no when playwright used",
        ):
            if primary_phrase in lowered:
                failures.append(
                    {
                        "path": path_rel,
                        "match": primary_phrase,
                        "error": "playwright_as_primary_in_canonical_web_surface",
                    }
                )

    return report_status(
        "validate-web-capability-contracts",
        failures,
        required_definition_count=len(required_defs),
        checked_doc_count=len(doc_requirements),
    )


FILES_SAFE_FENCE_MARKERS = (
    "source-lineage",
    "source lineage",
    "compatibility",
    "retired",
    "noncanonical",
    "preserved_exact_tokens",
    "stale_retired_dispositions",
    "cannot be copied",
    "not active implementation guidance",
)


def window_has_filesafe_fence(lines: list[str], index: int, radius: int = 12) -> bool:
    start = max(0, index - radius)
    end = min(len(lines), index + radius + 1)
    window = "\n".join(lines[start:end]).lower()
    return any(marker in window for marker in FILES_SAFE_FENCE_MARKERS)


def cmd_validate_filesafe_security_policy(args: argparse.Namespace) -> dict[str, Any]:
    filesafe_path = PLANS / "FileSafe.md"
    contracts_path = PLANS / "Contracts_V0.md"
    failures: list[dict[str, Any]] = []

    filesafe_text = filesafe_path.read_text(encoding="utf-8")
    contracts_text = contracts_path.read_text(encoding="utf-8")
    filesafe_lines = filesafe_text.splitlines()

    for index, line in enumerate(filesafe_lines):
        for token in ("BashGuard::disabled()", "SecurityFilter::disabled()"):
            if token in line and not window_has_filesafe_fence(filesafe_lines, index):
                failures.append(
                    {
                        "path": rel(filesafe_path),
                        "line": index + 1,
                        "token": token,
                        "error": "active_disabled_guard_fallback_not_fenced",
                    }
                )

        lowered = line.lower()
        prefix_sensitive = (
            "commands_match" in lowered
            or "approved_command" in lowered
            or "approved commands" in lowered
            or "allowlist" in lowered
            or "whitelist" in lowered
        )
        has_prefix_semantic = "c.starts_with" in line or (
            "prefix match" in lowered and not any(word in lowered for word in ("forbid", "forbidden", "retired", "stale"))
        )
        if prefix_sensitive and has_prefix_semantic and not window_has_filesafe_fence(filesafe_lines, index):
            failures.append(
                {
                    "path": rel(filesafe_path),
                    "line": index + 1,
                    "error": "active_prefix_approved_command_semantics",
                    "line_excerpt": line.strip()[:180],
                }
            )

    required_filesafe_tokens = {
        "filesafe.guard_init_failed": "missing_guard_init_failed_event",
        "filesafe.command_denied": "missing_command_denied_event",
        "filesafe.path_denied": "missing_path_denied_event",
        "filesafe.destructive_override_requested": "missing_override_requested_event",
        "filesafe.destructive_override_granted": "missing_override_granted_event",
        "filesafe.destructive_override_denied": "missing_override_denied_event",
        "filesafe.policy_degraded": "missing_policy_degraded_event",
        "auth_realm": "missing_override_auth_realm",
        "operator_identity": "missing_operator_identity",
        "reason": "missing_override_reason",
        "expires_at": "missing_override_expiry",
        "project_id": "missing_project_scope",
        "run_id": "missing_run_scope",
        "worktree_id": "missing_worktree_scope",
        "receipt": "missing_override_receipt",
        "git status && rm -rf /": "missing_prefix_bypass_acceptance",
        "strict_mode=false": "missing_strict_mode_false_boundary",
        "free-text extraction is advisory": "missing_prompt_extraction_advisory_boundary",
    }
    combined = filesafe_text + "\n" + contracts_text
    combined_lower = combined.lower()
    for token, error in required_filesafe_tokens.items():
        haystack = combined_lower if token == token.lower() else combined
        needle = token.lower() if token == token.lower() else token
        if needle not in haystack:
            failures.append({"path": f"{rel(filesafe_path)}+{rel(contracts_path)}", "token": token, "error": error})

    required_contract_tokens = {
        "filesafe.guard_init_failed": "missing_contract_guard_init_failed",
        "filesafe.command_denied": "missing_contract_command_denied",
        "filesafe.path_denied": "missing_contract_path_denied",
        "filesafe.destructive_override_requested": "missing_contract_override_requested",
        "filesafe.destructive_override_granted": "missing_contract_override_granted",
        "filesafe.destructive_override_denied": "missing_contract_override_denied",
        "filesafe.policy_degraded": "missing_contract_policy_degraded",
        "receipt_id": "missing_contract_receipt_id",
        "event_refs[]": "missing_contract_event_refs",
        "override_expired": "missing_contract_override_expired_denial_code",
        "approved_command_identity_mismatch": "missing_contract_identity_mismatch_denial_code",
        "path_toc_tou_recheck_failed": "missing_contract_toc_tou_denial_code",
    }
    for token, error in required_contract_tokens.items():
        if token not in contracts_text:
            failures.append({"path": rel(contracts_path), "token": token, "error": error})

    return report_status(
        "validate-filesafe-security-policy",
        failures,
        checked_files=[rel(filesafe_path), rel(contracts_path)],
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
    proc, timeout_report = run_validator_subprocess(
        "validate-prd-planning-runtime-contracts",
        [sys.executable, str(validator)],
        timeout_seconds=timeout_seconds,
        extra_failure_fields={"path": rel(validator)},
    )
    if timeout_report is not None:
        return timeout_report
    return parse_validator_json(
        "validate-prd-planning-runtime-contracts",
        proc,
        extra_failure_fields={"path": rel(validator)},
    )


def cmd_validate_implementation_readiness(args: argparse.Namespace) -> dict[str, Any]:
    validator = ROOT / "scripts" / "pm-implementation-readiness.py"
    timeout_seconds = int(getattr(args, "subcheck_timeout_seconds", 0) or 0)
    proc, timeout_report = run_validator_subprocess(
        "validate-implementation-readiness",
        [sys.executable, str(validator), "validate"],
        timeout_seconds=timeout_seconds,
        extra_failure_fields={"path": rel(validator)},
    )
    if timeout_report is not None:
        return timeout_report
    return parse_validator_json(
        "validate-implementation-readiness",
        proc,
        extra_failure_fields={"path": rel(validator)},
    )


def cmd_validate_case_l_non_event_materialization(args: argparse.Namespace) -> dict[str, Any]:
    validator = ROOT / "scripts" / "pm-implementation-readiness.py"
    timeout_seconds = int(getattr(args, "subcheck_timeout_seconds", 0) or 0)
    proc, timeout_report = run_validator_subprocess(
        "validate-case-l-non-event-materialization",
        [sys.executable, str(validator), "validate-case-l"],
        timeout_seconds=timeout_seconds,
        extra_failure_fields={"path": rel(validator)},
    )
    if timeout_report is not None:
        return timeout_report
    return parse_validator_json(
        "validate-case-l-non-event-materialization",
        proc,
        extra_failure_fields={"path": rel(validator)},
    )


def cmd_validate_plan_migration(args: argparse.Namespace) -> dict[str, Any]:
    validator = ROOT / "scripts" / "pm-plan-migration.py"
    run_dir = Path(getattr(args, "run_dir", None) or DEFAULT_PLAN_MIGRATION_RUN)
    if not run_dir.is_absolute():
        run_dir = ROOT / run_dir
    timeout_seconds = int(getattr(args, "subcheck_timeout_seconds", 0) or 0)
    proc, timeout_report = run_validator_subprocess(
        "validate-plan-migration",
        [sys.executable, str(validator), "validate", "--run-dir", rel(run_dir)],
        timeout_seconds=timeout_seconds,
        extra_failure_fields={"path": rel(validator), "run_dir": rel(run_dir)},
    )
    if timeout_report is not None:
        return timeout_report
    return parse_validator_json(
        "validate-plan-migration",
        proc,
        extra_failure_fields={"path": rel(validator), "run_dir": rel(run_dir)},
    )


def cmd_validate_audit_status_index(args: argparse.Namespace) -> dict[str, Any]:
    validator = ROOT / "scripts" / "pm-audit-status-index.py"
    timeout_seconds = int(getattr(args, "subcheck_timeout_seconds", 0) or 0)
    proc, timeout_report = run_validator_subprocess(
        "validate-audit-status-index",
        [sys.executable, str(validator), "validate"],
        timeout_seconds=timeout_seconds,
        extra_failure_fields={"path": rel(validator)},
    )
    if timeout_report is not None:
        return timeout_report
    return parse_validator_json(
        "validate-audit-status-index",
        proc,
        extra_failure_fields={"path": rel(validator)},
    )


def cmd_validate_audit_closure(args: argparse.Namespace) -> dict[str, Any]:
    validator = ROOT / "scripts" / "pm-audit-closure.py"
    registry = Path(getattr(args, "registry", None) or "Plans/.audits/_semantic_closure_registry.jsonl")
    if not registry.is_absolute():
        registry = ROOT / registry
    timeout_seconds = int(getattr(args, "subcheck_timeout_seconds", 0) or 0)
    proc, timeout_report = run_validator_subprocess(
        "validate-audit-closure",
        [sys.executable, str(validator), "validate", "--registry", rel(registry)],
        timeout_seconds=timeout_seconds,
        extra_failure_fields={"path": rel(validator), "registry": rel(registry)},
    )
    if timeout_report is not None:
        return timeout_report
    # Classify signal death / empty output explicitly before parsing, so a killed
    # validator is never mislabeled as a generic JSON-parse defect.
    early_failure = classify_validator_result(
        "validate-audit-closure",
        proc,
        extra_failure_fields={"path": rel(validator), "registry": rel(registry)},
    )
    if early_failure is not None:
        return early_failure
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
                    "stdout_excerpt": (proc.stdout or "")[-_EXCERPT_LIMIT:],
                    "stderr_excerpt": (proc.stderr or "")[-_EXCERPT_LIMIT:],
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
        ("validate_case_l_non_event_materialization", cmd_validate_case_l_non_event_materialization, argparse.Namespace()),
        ("validate_implementation_readiness", cmd_validate_implementation_readiness, argparse.Namespace()),
        ("validate_plan_migration", cmd_validate_plan_migration, argparse.Namespace(subcheck_timeout_seconds=timeout_seconds)),
        ("validate_runtime_artifact_schemas", cmd_validate_runtime_artifact_schemas, argparse.Namespace()),
        ("validate_goal_runtime_event_fixtures", cmd_validate_goal_runtime_event_fixtures, argparse.Namespace()),
        ("validate_project_output_fixtures", cmd_validate_project_output_fixtures, argparse.Namespace()),
        ("validate_usage_gui_fixtures", cmd_validate_usage_gui_fixtures, argparse.Namespace()),
        ("validate_usage_contract_drift", cmd_validate_usage_contract_drift, argparse.Namespace()),
        ("validate_gui_asset_policy", cmd_validate_gui_asset_policy, argparse.Namespace()),
        ("validate_web_capability_contracts", cmd_validate_web_capability_contracts, argparse.Namespace()),
        ("validate_filesafe_security_policy", cmd_validate_filesafe_security_policy, argparse.Namespace()),
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
        ("case_l_non_event_materialization", cmd_validate_case_l_non_event_materialization, argparse.Namespace()),
        ("implementation_readiness", cmd_validate_implementation_readiness, argparse.Namespace()),
        ("plan_migration", cmd_validate_plan_migration, argparse.Namespace(subcheck_timeout_seconds=timeout_seconds)),
        ("runtime_artifact_schemas", cmd_validate_runtime_artifact_schemas, argparse.Namespace()),
        ("goal_runtime_event_fixtures", cmd_validate_goal_runtime_event_fixtures, argparse.Namespace()),
        ("project_output_fixtures", cmd_validate_project_output_fixtures, argparse.Namespace()),
        ("usage_gui_fixtures", cmd_validate_usage_gui_fixtures, argparse.Namespace()),
        ("usage_contract_drift", cmd_validate_usage_contract_drift, argparse.Namespace()),
        ("gui_asset_policy", cmd_validate_gui_asset_policy, argparse.Namespace()),
        ("web_capability_contracts", cmd_validate_web_capability_contracts, argparse.Namespace()),
        ("filesafe_security_policy", cmd_validate_filesafe_security_policy, argparse.Namespace()),
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
        case_l_non_event_materialization=compact_gate_report(check_map["case_l_non_event_materialization"]),
        implementation_readiness=compact_gate_report(check_map["implementation_readiness"]),
        plan_migration=compact_gate_report(check_map["plan_migration"]),
        runtime_artifact_schemas=compact_gate_report(check_map["runtime_artifact_schemas"]),
        goal_runtime_event_fixtures=compact_gate_report(check_map["goal_runtime_event_fixtures"]),
        project_output_fixtures=compact_gate_report(check_map["project_output_fixtures"]),
        usage_gui_fixtures=compact_gate_report(check_map["usage_gui_fixtures"]),
        usage_contract_drift=compact_gate_report(check_map["usage_contract_drift"]),
        gui_asset_policy=compact_gate_report(check_map["gui_asset_policy"]),
        web_capability_contracts=compact_gate_report(check_map["web_capability_contracts"]),
        filesafe_security_policy=compact_gate_report(check_map["filesafe_security_policy"]),
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
    "validate-case-l-non-event-materialization": cmd_validate_case_l_non_event_materialization,
    "validate-implementation-readiness": cmd_validate_implementation_readiness,
    "validate-plan-migration": cmd_validate_plan_migration,
    "validate-runtime-artifact-schemas": cmd_validate_runtime_artifact_schemas,
    "validate-goal-runtime-event-fixtures": cmd_validate_goal_runtime_event_fixtures,
    "validate-project-output-fixtures": cmd_validate_project_output_fixtures,
    "validate-usage-gui-fixtures": cmd_validate_usage_gui_fixtures,
    "validate-usage-contract-drift": cmd_validate_usage_contract_drift,
    "validate-gui-asset-policy": cmd_validate_gui_asset_policy,
    "validate-web-capability-contracts": cmd_validate_web_capability_contracts,
    "validate-filesafe-security-policy": cmd_validate_filesafe_security_policy,
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
    # Standalone validator commands whose check function reads subcheck_timeout_seconds
    # (i.e. they route their inner validator through run_validator_subprocess). These
    # must expose --subcheck-timeout-seconds on the CLI for consistency, so a stuck
    # standalone validator is bounded the same way as inside run-gates/audit-governance.
    _SUBPROCESS_VALIDATORS = {
        "check-shards",
        "validate-prd-planning-runtime-contracts",
        "validate-case-l-non-event-materialization",
        "validate-implementation-readiness",
        "validate-plan-migration",
        "validate-gui-asset-policy",
        "validate-audit-closure",
        "validate-audit-status-index",
    }
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
        if name == "validate-audit-closure":
            sub.add_argument("--registry", default="Plans/.audits/_semantic_closure_registry.jsonl")
        if name in _SUBPROCESS_VALIDATORS:
            sub.add_argument(
                "--subcheck-timeout-seconds",
                type=int,
                default=180,
                help="Maximum seconds for the inner validator subprocess before reporting a structured timeout.",
            )
        if name in {"run-gates", "audit-governance"}:
            sub.add_argument(
                "--subcheck-timeout-seconds",
                type=int,
                default=180,
                help="Maximum seconds for each aggregate subcheck before reporting the stuck check.",
            )
            sub.add_argument("--quiet-progress", action="store_true", help="Suppress aggregate subcheck progress on stderr.")
    args = parser.parse_args()
    if not hasattr(args, "subcheck_timeout_seconds"):
        args.subcheck_timeout_seconds = 180
    if not hasattr(args, "paths"):
        args.paths = []
    report = COMMANDS[args.command](args)
    write_report(report, args.report)
    print(json.dumps({k: report[k] for k in report if k in {"check", "status", "failures", "generated_at_utc"}}, indent=2, sort_keys=True))
    return 0 if report.get("status") == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(main())
