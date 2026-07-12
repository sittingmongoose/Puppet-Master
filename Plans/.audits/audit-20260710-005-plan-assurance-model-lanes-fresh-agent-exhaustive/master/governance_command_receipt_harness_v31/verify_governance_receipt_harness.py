#!/usr/bin/env python3
"""Read-only preparation verifier for the Audit005 governance receipt harness."""
from __future__ import annotations

import ast
import hashlib
import json
import os
import re
import shutil
import sys
from pathlib import Path
from typing import Any, Dict, Iterable, List, Mapping, Optional, Sequence


REPO = Path("/Users/jaredsmacbookair/Documents/PuppetMaster")
HERE = REPO / "Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive/master/governance_command_receipt_harness_v31"
AUTHORITY_PATH = HERE / "IMMUTABLE_AUTHORITY.json"
READINESS_PATH = HERE / "readiness.json"
INVENTORY_CONTRACT_PATH = HERE / "no_canonical_write_inventory_contract.json"
RECEIPT_SCHEMA_PATH = HERE / "governance_command_receipt.schema.json"
LUNA_SCHEMA_PATH = HERE / "independent_luna_authorization.schema.json"
RUNNER_PATH = HERE / "run_governance_commands_once.py"
TEST_PATH = HERE / "test_governance_receipt_harness.py"
PACING_POLICY_PATH = REPO / "Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive/master/coordination/CONCURRENCY_POLICY_V32.json"
SHA256_RE = re.compile(r"^[0-9a-f]{64}$")
RUN_ID_RE = re.compile(r"^GCRH-[0-9]{8}T[0-9]{6}Z-[A-F0-9]{8}$")


class VerificationError(ValueError):
    pass


def canonical_bytes(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode("utf-8")


def sha_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha_path(path: Path) -> str:
    return sha_bytes(path.read_bytes())


def load_object(path: Path) -> Dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise VerificationError("not-object:" + path.name)
    return value


def require(condition: bool, message: str) -> None:
    if not condition:
        raise VerificationError(message)


def exact_keys(value: Mapping[str, Any], expected: Iterable[str], label: str) -> None:
    require(set(value) == set(expected), "keys:" + label)


def live_interpreter() -> Dict[str, Any]:
    which_value = shutil.which("python3")
    require(which_value is not None, "python3-not-found")
    which_path = Path(str(which_value))
    sys_path = Path(sys.executable)
    real_path = Path(os.path.realpath(sys.executable))
    return {
        "token": "python3",
        "which_path": str(which_path),
        "which_sha256": sha_path(which_path),
        "runtime_sys_executable": str(sys_path),
        "runtime_sys_executable_sha256": sha_path(sys_path),
        "runtime_realpath": str(real_path),
        "runtime_realpath_sha256": sha_path(real_path),
        "version": ".".join(str(part) for part in sys.version_info[:3]),
    }


def expected_commands() -> List[Dict[str, Any]]:
    return [
        {
            "command_id": "plans-run-gates",
            "ordinal": 1,
            "display": "python3 scripts/pm-plans-verify.py run-gates",
            "argv": ["python3", "scripts/pm-plans-verify.py", "run-gates"],
            "cwd": str(REPO),
            "script_path": "scripts/pm-plans-verify.py",
            "script_sha256": "1ce51088f55bcc9810dc51fcd74cb4283505b20532f81835285b419113d5e100",
            "script_bytes": 332564,
        },
        {
            "command_id": "shards-check",
            "ordinal": 2,
            "display": "python3 scripts/pm-shard-plans.py --check",
            "argv": ["python3", "scripts/pm-shard-plans.py", "--check"],
            "cwd": str(REPO),
            "script_path": "scripts/pm-shard-plans.py",
            "script_sha256": "b6ba0d9ad3e8609af4e78874b270e9f70f2084ae815435aaac7119de5fb8325e",
            "script_bytes": 21612,
        },
    ]


def validate_receipt(receipt: Mapping[str, Any], authority: Mapping[str, Any], command: Mapping[str, Any]) -> List[str]:
    errors: List[str] = []

    def check(condition: bool, label: str) -> None:
        if not condition:
            errors.append(label)

    expected_top = {
        "schema_version", "audit_id", "harness_authority_sha256", "run_id", "command_id", "ordinal",
        "command", "interpreter", "script", "environment_sha256", "started_at_utc", "finished_at_utc",
        "started_unix_ns", "finished_unix_ns", "duration_monotonic_ns", "termination", "stdout", "stderr",
        "inventory", "inventory_diff", "no_protected_write", "outcome", "execution_count", "retry_count",
        "descendant_count", "followup_count", "credit", "certification", "independent_luna_authorization",
    }
    check(set(receipt) == expected_top, "receipt-keys")
    check(receipt.get("schema_version") == "audit005-governance-command-receipt-v1", "receipt-schema")
    check(receipt.get("audit_id") == authority.get("audit_id"), "receipt-audit")
    check(receipt.get("harness_authority_sha256") == sha_path(AUTHORITY_PATH), "receipt-authority")
    check(isinstance(receipt.get("run_id"), str) and RUN_ID_RE.fullmatch(str(receipt.get("run_id"))) is not None, "receipt-run-id")
    check(receipt.get("command_id") == command.get("command_id"), "receipt-command-id")
    check(receipt.get("ordinal") == command.get("ordinal"), "receipt-ordinal")
    expected_command = {
        "display": command.get("display"),
        "argv": command.get("argv"),
        "cwd": command.get("cwd"),
        "shell": False,
    }
    check(receipt.get("command") == expected_command, "receipt-command")
    check(receipt.get("interpreter") == authority.get("interpreter"), "receipt-interpreter")
    check(receipt.get("script") == command.get("script"), "receipt-script")
    expected_env_hash = sha_bytes(canonical_bytes(authority.get("execution_environment")))
    check(receipt.get("environment_sha256") == expected_env_hash, "receipt-environment")
    started = receipt.get("started_unix_ns")
    finished = receipt.get("finished_unix_ns")
    duration = receipt.get("duration_monotonic_ns")
    check(isinstance(started, int) and started >= 0, "receipt-started-ns")
    check(isinstance(finished, int) and isinstance(started, int) and finished >= started, "receipt-finished-ns")
    check(isinstance(duration, int) and duration >= 0, "receipt-duration")
    termination = receipt.get("termination")
    if isinstance(termination, dict):
        check(set(termination) == {"returncode", "exit_code", "signal"}, "receipt-termination-keys")
        rc = termination.get("returncode")
        check(isinstance(rc, int), "receipt-returncode")
        if isinstance(rc, int) and rc >= 0:
            check(termination.get("exit_code") == rc and termination.get("signal") is None, "receipt-exit-shape")
        elif isinstance(rc, int):
            check(termination.get("exit_code") is None and termination.get("signal") == -rc, "receipt-signal-shape")
    else:
        errors.append("receipt-termination")
    for stream_name in ("stdout", "stderr"):
        stream = receipt.get(stream_name)
        check(isinstance(stream, dict) and set(stream) == {"artifact", "bytes", "sha256"}, "receipt-" + stream_name + "-shape")
        if isinstance(stream, dict):
            check(isinstance(stream.get("bytes"), int) and stream.get("bytes", -1) >= 0, "receipt-" + stream_name + "-bytes")
            check(isinstance(stream.get("sha256"), str) and SHA256_RE.fullmatch(str(stream.get("sha256"))) is not None, "receipt-" + stream_name + "-hash")
    inventory = receipt.get("inventory")
    if isinstance(inventory, dict):
        check(inventory.get("contract_sha256") == authority.get("artifact_bindings", {}).get("no_canonical_write_inventory_contract.json"), "receipt-inventory-contract")
        repo_equal = inventory.get("pre_repository_sha256") == inventory.get("post_repository_sha256")
        canonical_equal = inventory.get("pre_canonical_plans_sha256") == inventory.get("post_canonical_plans_sha256")
    else:
        errors.append("receipt-inventory")
        repo_equal = False
        canonical_equal = False
    diff = receipt.get("inventory_diff")
    if isinstance(diff, dict):
        check(isinstance(diff.get("delta_count"), int) and diff.get("delta_count", -1) >= 0, "receipt-delta-count")
        zero_delta = diff.get("delta_count") == 0
    else:
        errors.append("receipt-diff")
        zero_delta = False
    no_write = receipt.get("no_protected_write") is True
    check(no_write == (repo_equal and canonical_equal and zero_delta), "receipt-no-write-consistency")
    rc_value = termination.get("returncode") if isinstance(termination, dict) else None
    outcome = receipt.get("outcome")
    if not no_write:
        check(outcome == "FAIL_PROTECTED_WRITE", "receipt-write-outcome")
    elif rc_value == 0:
        check(outcome == "PASS_NO_WRITE", "receipt-pass-outcome")
    elif isinstance(rc_value, int) and rc_value < 0:
        check(outcome == "FAIL_SIGNAL_NO_WRITE", "receipt-signal-outcome")
    else:
        check(outcome == "FAIL_EXIT_NO_WRITE", "receipt-exit-outcome")
    check(receipt.get("execution_count") == 1, "receipt-execution-count")
    check(receipt.get("retry_count") == 0, "receipt-retry-count")
    check(receipt.get("descendant_count") == 0, "receipt-descendant-count")
    check(receipt.get("followup_count") == 0, "receipt-followup-count")
    check(receipt.get("credit") == 0, "receipt-credit")
    check(receipt.get("certification") is False, "receipt-certification")
    luna = receipt.get("independent_luna_authorization")
    check(isinstance(luna, dict) and set(luna) == {"artifact", "sha256", "task_thread_id"}, "receipt-luna-shape")
    return sorted(set(errors))


def verify_runner_ast() -> None:
    source = RUNNER_PATH.read_text(encoding="utf-8")
    tree = ast.parse(source, filename=str(RUNNER_PATH))
    run_calls = []
    forbidden_calls = []
    for node in ast.walk(tree):
        if not isinstance(node, ast.Call):
            continue
        name = ""
        if isinstance(node.func, ast.Attribute) and isinstance(node.func.value, ast.Name):
            name = node.func.value.id + "." + node.func.attr
        elif isinstance(node.func, ast.Name):
            name = node.func.id
        if name == "subprocess.run":
            run_calls.append(node)
        if name in {"os.system", "os.popen", "subprocess.Popen", "subprocess.call", "subprocess.check_call", "subprocess.check_output"}:
            forbidden_calls.append(name)
    require(len(run_calls) == 1, "runner-subprocess-run-count")
    require(not forbidden_calls, "runner-forbidden-process-api")
    keywords = {item.arg: item.value for item in run_calls[0].keywords if item.arg is not None}
    require(isinstance(keywords.get("shell"), ast.Constant) and keywords["shell"].value is False, "runner-shell-false")
    require(isinstance(keywords.get("check"), ast.Constant) and keywords["check"].value is False, "runner-check-false")
    require("cwd" in keywords and "env" in keywords and "stdout" in keywords and "stderr" in keywords, "runner-capture-bindings")
    require("pm-plans-verify.py" not in source and "pm-shard-plans.py" not in source, "runner-command-literals-duplicated")


def verify_schema_surfaces() -> None:
    receipt_schema = load_object(RECEIPT_SCHEMA_PATH)
    require(receipt_schema.get("$schema") == "https://json-schema.org/draft/2020-12/schema", "receipt-schema-draft")
    require(receipt_schema.get("additionalProperties") is False, "receipt-schema-open-root")
    required = receipt_schema.get("required")
    require(isinstance(required, list) and len(required) == 29 and len(set(required)) == 29, "receipt-schema-required")
    properties = receipt_schema.get("properties")
    require(isinstance(properties, dict) and set(properties) == set(required), "receipt-schema-properties")
    for key in ("command", "interpreter", "script", "termination", "inventory", "inventory_diff", "independent_luna_authorization"):
        require(properties[key].get("additionalProperties") is False, "receipt-schema-open:" + key)
    luna_schema = load_object(LUNA_SCHEMA_PATH)
    require(luna_schema.get("$schema") == "https://json-schema.org/draft/2020-12/schema", "luna-schema-draft")
    require(luna_schema.get("additionalProperties") is False, "luna-schema-open-root")
    luna_properties = luna_schema.get("properties")
    require(isinstance(luna_properties, dict), "luna-schema-properties")
    require(luna_properties["decision"].get("const") == "AUTHORIZE_ONE_TERMINAL_RUN", "luna-decision-const")
    require(luna_properties["reviewer"]["properties"]["lane"].get("const") == "independent_luna_max", "luna-lane-const")


def run_verification() -> Dict[str, Any]:
    checks: List[str] = []
    errors: List[str] = []

    def perform(name: str, fn: Any) -> None:
        try:
            fn()
            checks.append(name)
        except Exception as exc:
            errors.append(name + ":" + str(exc))

    authority_holder: Dict[str, Any] = {}
    readiness_holder: Dict[str, Any] = {}

    def authority_check() -> None:
        authority = load_object(AUTHORITY_PATH)
        authority_holder.update(authority)
        require(authority.get("schema_version") == "audit005-governance-command-receipt-harness-authority-v1", "authority-schema")
        require(authority.get("status") == "PREPARATION_ONLY_ZERO_EXECUTION_ZERO_CREDIT", "authority-status")
        require(authority.get("audit_id") == "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive", "authority-audit")
        require(authority.get("namespace") == str(HERE), "authority-namespace")
        require(authority.get("preparer_task_path") == "/root/sol_controller_v29/v31_governance_receipt_harness_prep", "authority-preparer")
        require(authority.get("write_scope") == {"authorized_root": str(HERE), "writes_outside_authorized_root": False, "append_only": True}, "authority-write-scope")
        require(authority.get("interpreter") == live_interpreter(), "authority-interpreter")
        require(authority.get("activation") is False and authority.get("execution_authorized") is False, "authority-activation")
        require(authority.get("credit") == 0, "authority-credit")
        require(authority.get("independent_luna_requirement", {}).get("required_before_execution") is True, "authority-luna")
        require(authority.get("execution_constraints") == {
            "maximum_terminal_runs": 1,
            "command_executions_per_terminal_run": 2,
            "retries": 0,
            "descendants": 0,
            "followups": 0,
            "credit": 0,
            "certification": False,
            "stop_remaining_commands_on_protected_write": True,
        }, "authority-execution-constraints")
        artifact_bindings = authority.get("artifact_bindings")
        require(isinstance(artifact_bindings, dict), "authority-artifact-bindings")
        expected_names = {
            "governance_command_receipt.schema.json",
            "independent_luna_authorization.schema.json",
            "no_canonical_write_inventory_contract.json",
            "run_governance_commands_once.py",
            "verify_governance_receipt_harness.py",
            "test_governance_receipt_harness.py",
        }
        require(set(artifact_bindings) == expected_names, "authority-artifact-names")
        for name, digest in artifact_bindings.items():
            require(SHA256_RE.fullmatch(str(digest)) is not None, "authority-artifact-hash-shape:" + name)
            path = HERE / name
            require(path.is_file() and not path.is_symlink() and sha_path(path) == digest, "authority-artifact-hash:" + name)
        expected = expected_commands()
        actual = authority.get("governed_commands")
        require(isinstance(actual, list) and len(actual) == 2, "authority-command-count")
        for expected_item, actual_item in zip(expected, actual):
            require(actual_item.get("command_id") == expected_item["command_id"], "authority-command-id")
            require(actual_item.get("ordinal") == expected_item["ordinal"], "authority-command-ordinal")
            require(actual_item.get("display") == expected_item["display"], "authority-command-display")
            require(actual_item.get("argv") == expected_item["argv"], "authority-command-argv")
            require(actual_item.get("cwd") == expected_item["cwd"], "authority-command-cwd")
            require(actual_item.get("shell") is False, "authority-command-shell")
            script = actual_item.get("script")
            require(script == {
                "repository_relative_path": expected_item["script_path"],
                "absolute_path": str(REPO / expected_item["script_path"]),
                "sha256": expected_item["script_sha256"],
                "bytes": expected_item["script_bytes"],
            }, "authority-command-script")
            script_path = REPO / expected_item["script_path"]
            require(sha_path(script_path) == expected_item["script_sha256"] and script_path.stat().st_size == expected_item["script_bytes"], "live-command-script")
        pacing = authority.get("current_no_execution_pacing_authority")
        require(pacing == {
            "path": str(PACING_POLICY_PATH),
            "sha256": "4826ade4c38db47ee184b34e5d7b7bd5ba6cabeecc9baa686cb9d99eeff8a3ed",
            "schema_version": "audit005-concurrency-policy-v32",
            "state": "PROSPECTIVE_ACTIVE_NO_EXECUTION",
            "sealed": False,
            "execution_authority": False,
        }, "authority-pacing")
        require(sha_path(PACING_POLICY_PATH) == pacing["sha256"], "live-pacing-hash")

    def inventory_check() -> None:
        value = load_object(INVENTORY_CONTRACT_PATH)
        require(value.get("status") == "PREPARATION_ONLY", "inventory-status")
        protected = value.get("protected_repository_inventory")
        require(isinstance(protected, dict), "inventory-protected")
        require(protected.get("excluded_subtrees_repository_relative") == [
            ".git",
            "Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive/master/governance_command_receipt_harness_v31",
        ], "inventory-exclusions")
        require(protected.get("exclusion_expansion_forbidden") is True, "inventory-expansion")
        comparison = value.get("comparison_contract")
        require(isinstance(comparison, dict), "inventory-comparison")
        require(comparison.get("capture_before_each_governed_command") is True, "inventory-pre")
        require(comparison.get("capture_after_each_governed_command") is True, "inventory-post")
        require(comparison.get("delta_count_must_equal") == 0, "inventory-zero-delta")
        require(comparison.get("rollback_authorized") is False and comparison.get("mutation_credit") == 0, "inventory-mutation")
        projection = value.get("canonical_and_governance_plans_projection")
        require(isinstance(projection, dict) and projection.get("include_prefix") == "Plans/", "inventory-projection")
        require(projection.get("excluded_prefixes") == ["Plans/.audits/", "Plans/ledgers/"], "inventory-projection-excludes")

    def readiness_check() -> None:
        readiness = load_object(READINESS_PATH)
        readiness_holder.update(readiness)
        require(readiness.get("schema_version") == "audit005-governance-command-receipt-harness-readiness-v1", "readiness-schema")
        require(readiness.get("status") == "PASS_BLOCKED_PREPARATION_ONLY", "readiness-status")
        require(readiness.get("authority_sha256") == sha_path(AUTHORITY_PATH), "readiness-authority")
        require(readiness.get("governed_command_execution_count") == 0, "readiness-execution")
        require(readiness.get("receipt_count") == 0 and readiness.get("stdout_capture_count") == 0 and readiness.get("stderr_capture_count") == 0, "readiness-captures")
        require(readiness.get("credit") == 0 and readiness.get("certification") is False, "readiness-credit")
        require(readiness.get("activation") is False and readiness.get("execution_authorized") is False, "readiness-activation")
        require(readiness.get("independent_luna_authorization_present") is False, "readiness-luna")
        require(readiness.get("blockers") == [
            "INDEPENDENT_LUNA_AUTHORIZATION_ABSENT",
            "EXECUTION_NOT_AUTHORIZED",
            "GOVERNED_COMMANDS_NOT_EXECUTED_BY_DESIGN",
            "FUTURE_RECEIPTS_ABSENT_BY_DESIGN",
        ], "readiness-blockers")
        bound = readiness.get("bound_artifact_hashes")
        require(isinstance(bound, dict), "readiness-bound")
        require(bound == authority_holder.get("artifact_bindings"), "readiness-bound-artifacts")

    def zero_state_check() -> None:
        require(not (HERE / "runs").exists(), "runs-present")
        require(not (HERE / "authorizations").exists(), "authorizations-present")
        receipt_paths = list(HERE.rglob("receipt.json")) + list(HERE.rglob("terminal-receipt.json"))
        require(not receipt_paths, "receipt-present")
        require(not list(HERE.rglob("stdout.bin")) and not list(HERE.rglob("stderr.bin")), "stream-present")

    def file_safety_check() -> None:
        for path in HERE.iterdir():
            require(not path.is_symlink(), "namespace-symlink:" + path.name)

    perform("authority_and_live_bindings", authority_check)
    perform("inventory_contract", inventory_check)
    perform("closed_world_schemas", verify_schema_surfaces)
    perform("runner_ast_single_process_api", verify_runner_ast)
    perform("readiness", readiness_check)
    perform("zero_execution_state", zero_state_check)
    perform("namespace_file_safety", file_safety_check)
    status = "PASS_BLOCKED_PREPARATION_ONLY" if not errors else "FAIL_CLOSED"
    return {
        "schema_version": "audit005-governance-command-receipt-harness-verification-v1",
        "status": status,
        "checks": checks,
        "check_count": len(checks),
        "errors": errors,
        "error_count": len(errors),
        "governed_commands_executed": False,
        "receipt_count": 0,
        "credit": 0,
        "independent_luna_required": True,
        "activation": False,
    }


def main(argv: Optional[Sequence[str]] = None) -> int:
    del argv
    report = run_verification()
    print(json.dumps(report, sort_keys=True))
    return 0 if report["status"] == "PASS_BLOCKED_PREPARATION_ONLY" else 1


if __name__ == "__main__":
    raise SystemExit(main())
