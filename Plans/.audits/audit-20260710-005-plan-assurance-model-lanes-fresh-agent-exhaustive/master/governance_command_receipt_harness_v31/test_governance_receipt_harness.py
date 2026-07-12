#!/usr/bin/env python3
"""In-memory and read-only tests; never launch the governed commands."""
from __future__ import annotations

import ast
import copy
import hashlib
import json
from pathlib import Path
from typing import Any, Callable, Dict, List, Mapping, Optional, Sequence, Tuple

import verify_governance_receipt_harness as verifier


HERE = verifier.HERE
REPO = verifier.REPO


class TestFailure(AssertionError):
    pass


def check(condition: bool, message: str) -> None:
    if not condition:
        raise TestFailure(message)


def load_authority() -> Dict[str, Any]:
    return verifier.load_object(verifier.AUTHORITY_PATH)


def valid_receipt(authority: Mapping[str, Any], command: Mapping[str, Any]) -> Dict[str, Any]:
    empty_sha = hashlib.sha256(b"").hexdigest()
    empty_paths_sha = verifier.sha_bytes(verifier.canonical_bytes([]))
    inventory_sha = "1" * 64
    return {
        "schema_version": "audit005-governance-command-receipt-v1",
        "audit_id": authority["audit_id"],
        "harness_authority_sha256": verifier.sha_path(verifier.AUTHORITY_PATH),
        "run_id": "GCRH-20260712T120000Z-A1B2C3D4",
        "command_id": command["command_id"],
        "ordinal": command["ordinal"],
        "command": {
            "display": command["display"],
            "argv": command["argv"],
            "cwd": command["cwd"],
            "shell": False,
        },
        "interpreter": authority["interpreter"],
        "script": command["script"],
        "environment_sha256": verifier.sha_bytes(verifier.canonical_bytes(authority["execution_environment"])),
        "started_at_utc": "2026-07-12T12:00:00.000000Z",
        "finished_at_utc": "2026-07-12T12:00:01.000000Z",
        "started_unix_ns": 1_000_000_000,
        "finished_unix_ns": 2_000_000_000,
        "duration_monotonic_ns": 1_000_000_000,
        "termination": {"returncode": 0, "exit_code": 0, "signal": None},
        "stdout": {"artifact": "runs/example/stdout.bin", "bytes": 0, "sha256": empty_sha},
        "stderr": {"artifact": "runs/example/stderr.bin", "bytes": 0, "sha256": empty_sha},
        "inventory": {
            "contract_sha256": authority["artifact_bindings"]["no_canonical_write_inventory_contract.json"],
            "pre_repository_sha256": inventory_sha,
            "post_repository_sha256": inventory_sha,
            "pre_canonical_plans_sha256": inventory_sha,
            "post_canonical_plans_sha256": inventory_sha,
            "pre_entry_count": 100,
            "post_entry_count": 100,
            "pre_artifact": "runs/example/pre-inventory.json",
            "post_artifact": "runs/example/post-inventory.json",
        },
        "inventory_diff": {
            "artifact": "runs/example/inventory-diff.json",
            "sha256": "2" * 64,
            "delta_count": 0,
            "delta_paths_sha256": empty_paths_sha,
        },
        "no_protected_write": True,
        "outcome": "PASS_NO_WRITE",
        "execution_count": 1,
        "retry_count": 0,
        "descendant_count": 0,
        "followup_count": 0,
        "credit": 0,
        "certification": False,
        "independent_luna_authorization": {
            "artifact": "authorizations/example/independent-luna.json",
            "sha256": "3" * 64,
            "task_thread_id": "/root/luna-independent-example",
        },
    }


def receipt_errors(value: Mapping[str, Any], authority: Mapping[str, Any], command: Mapping[str, Any]) -> List[str]:
    return verifier.validate_receipt(value, authority, command)


def negative_case(
    authority: Mapping[str, Any],
    command: Mapping[str, Any],
    mutate: Callable[[Dict[str, Any]], None],
    expected_error: str,
) -> None:
    value = copy.deepcopy(valid_receipt(authority, command))
    mutate(value)
    errors = receipt_errors(value, authority, command)
    check(expected_error in errors, expected_error + ":" + repr(errors))


def run_tests() -> Dict[str, Any]:
    authority = load_authority()
    commands = authority["governed_commands"]
    first = commands[0]
    tests: List[Tuple[str, Callable[[], None]]] = []

    def add(name: str, function: Callable[[], None]) -> None:
        tests.append((name, function))

    add("static_verifier_pass_blocked", lambda: check(verifier.run_verification()["status"] == "PASS_BLOCKED_PREPARATION_ONLY", "static-verifier"))
    add("exactly_two_commands", lambda: check(len(commands) == 2, "command-count"))
    add("exact_command_ids", lambda: check([item["command_id"] for item in commands] == ["plans-run-gates", "shards-check"], "command-ids"))
    add("exact_command_argv", lambda: check([item["argv"] for item in commands] == [
        ["python3", "scripts/pm-plans-verify.py", "run-gates"],
        ["python3", "scripts/pm-shard-plans.py", "--check"],
    ], "command-argv"))
    add("exact_command_cwd", lambda: check(all(item["cwd"] == str(REPO) for item in commands), "command-cwd"))
    add("shell_false", lambda: check(all(item["shell"] is False for item in commands), "shell"))
    add("interpreter_live_binding", lambda: check(authority["interpreter"] == verifier.live_interpreter(), "interpreter"))
    add("plan_verifier_script_hash", lambda: check(verifier.sha_path(REPO / first["script"]["repository_relative_path"]) == first["script"]["sha256"], "plan-script"))
    add("shard_verifier_script_hash", lambda: check(verifier.sha_path(REPO / commands[1]["script"]["repository_relative_path"]) == commands[1]["script"]["sha256"], "shard-script"))
    add("pacing_v32_hash", lambda: check(verifier.sha_path(verifier.PACING_POLICY_PATH) == authority["current_no_execution_pacing_authority"]["sha256"], "pacing"))
    add("pacing_no_execution", lambda: check(authority["current_no_execution_pacing_authority"]["execution_authority"] is False, "pacing-execution"))
    add("artifact_hashes_live", lambda: check(all(verifier.sha_path(HERE / name) == digest for name, digest in authority["artifact_bindings"].items()), "artifact-hashes"))
    add("receipt_schema_closed", lambda: check(verifier.load_object(verifier.RECEIPT_SCHEMA_PATH)["additionalProperties"] is False, "receipt-schema"))
    add("luna_schema_closed", lambda: check(verifier.load_object(verifier.LUNA_SCHEMA_PATH)["additionalProperties"] is False, "luna-schema"))
    add("inventory_exclusions_exact", lambda: check(verifier.load_object(verifier.INVENTORY_CONTRACT_PATH)["protected_repository_inventory"]["excluded_subtrees_repository_relative"] == [
        ".git",
        "Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive/master/governance_command_receipt_harness_v31",
    ], "inventory-exclusions"))
    add("canonical_projection_bound", lambda: check(verifier.load_object(verifier.INVENTORY_CONTRACT_PATH)["canonical_and_governance_plans_projection"]["include_prefix"] == "Plans/", "canonical-projection"))
    add("runner_single_subprocess_api", verifier.verify_runner_ast)
    add("runner_parses", lambda: ast.parse(verifier.RUNNER_PATH.read_text(encoding="utf-8")))
    add("verifier_parses", lambda: ast.parse(Path(verifier.__file__).read_text(encoding="utf-8")))
    add("zero_runs", lambda: check(not (HERE / "runs").exists(), "runs"))
    add("zero_authorizations", lambda: check(not (HERE / "authorizations").exists(), "authorizations"))
    add("zero_receipts", lambda: check(not list(HERE.rglob("receipt.json")), "receipts"))
    add("readiness_zero_state", lambda: check(verifier.load_object(verifier.READINESS_PATH)["governed_command_execution_count"] == 0, "readiness-execution"))
    add("readiness_zero_credit", lambda: check(verifier.load_object(verifier.READINESS_PATH)["credit"] == 0, "readiness-credit"))
    add("valid_receipt_accepted", lambda: check(receipt_errors(valid_receipt(authority, first), authority, first) == [], "valid-receipt"))
    add("reject_extra_root_key", lambda: negative_case(authority, first, lambda value: value.__setitem__("unexpected", True), "receipt-keys"))
    add("reject_wrong_authority_hash", lambda: negative_case(authority, first, lambda value: value.__setitem__("harness_authority_sha256", "0" * 64), "receipt-authority"))
    add("reject_bad_run_id", lambda: negative_case(authority, first, lambda value: value.__setitem__("run_id", "retry-2"), "receipt-run-id"))
    add("reject_wrong_command_id", lambda: negative_case(authority, first, lambda value: value.__setitem__("command_id", "shards-check"), "receipt-command-id"))
    add("reject_wrong_ordinal", lambda: negative_case(authority, first, lambda value: value.__setitem__("ordinal", 2), "receipt-ordinal"))
    add("reject_extra_argv", lambda: negative_case(authority, first, lambda value: value["command"]["argv"].append("--extra"), "receipt-command"))
    add("reject_wrong_cwd", lambda: negative_case(authority, first, lambda value: value["command"].__setitem__("cwd", "/tmp"), "receipt-command"))
    add("reject_shell_true", lambda: negative_case(authority, first, lambda value: value["command"].__setitem__("shell", True), "receipt-command"))
    add("reject_interpreter_drift", lambda: negative_case(authority, first, lambda value: value["interpreter"].__setitem__("which_sha256", "0" * 64), "receipt-interpreter"))
    add("reject_script_drift", lambda: negative_case(authority, first, lambda value: value["script"].__setitem__("sha256", "0" * 64), "receipt-script"))
    add("reject_environment_drift", lambda: negative_case(authority, first, lambda value: value.__setitem__("environment_sha256", "0" * 64), "receipt-environment"))
    add("reject_negative_start", lambda: negative_case(authority, first, lambda value: value.__setitem__("started_unix_ns", -1), "receipt-started-ns"))
    add("reject_reverse_wall_clock", lambda: negative_case(authority, first, lambda value: value.__setitem__("finished_unix_ns", 0), "receipt-finished-ns"))
    add("reject_negative_duration", lambda: negative_case(authority, first, lambda value: value.__setitem__("duration_monotonic_ns", -1), "receipt-duration"))
    add("reject_exit_signal_conflict", lambda: negative_case(authority, first, lambda value: value["termination"].__setitem__("signal", 9), "receipt-exit-shape"))
    add("reject_stdout_hash_shape", lambda: negative_case(authority, first, lambda value: value["stdout"].__setitem__("sha256", "bad"), "receipt-stdout-hash"))
    add("reject_inventory_contract_drift", lambda: negative_case(authority, first, lambda value: value["inventory"].__setitem__("contract_sha256", "0" * 64), "receipt-inventory-contract"))
    add("reject_repository_inventory_mismatch", lambda: negative_case(authority, first, lambda value: value["inventory"].__setitem__("post_repository_sha256", "4" * 64), "receipt-no-write-consistency"))
    add("reject_canonical_inventory_mismatch", lambda: negative_case(authority, first, lambda value: value["inventory"].__setitem__("post_canonical_plans_sha256", "4" * 64), "receipt-no-write-consistency"))
    add("reject_nonzero_delta_as_no_write", lambda: negative_case(authority, first, lambda value: value["inventory_diff"].__setitem__("delta_count", 1), "receipt-no-write-consistency"))
    add("reject_nonzero_exit_as_pass", lambda: negative_case(authority, first, lambda value: value["termination"].update({"returncode": 1, "exit_code": 1}), "receipt-exit-outcome"))
    add("reject_write_without_fail_outcome", lambda: negative_case(authority, first, lambda value: value.update({"no_protected_write": False, "outcome": "PASS_NO_WRITE"}), "receipt-write-outcome"))
    add("reject_execution_count_two", lambda: negative_case(authority, first, lambda value: value.__setitem__("execution_count", 2), "receipt-execution-count"))
    add("reject_retry_credit", lambda: negative_case(authority, first, lambda value: value.__setitem__("retry_count", 1), "receipt-retry-count"))
    add("reject_descendant", lambda: negative_case(authority, first, lambda value: value.__setitem__("descendant_count", 1), "receipt-descendant-count"))
    add("reject_followup", lambda: negative_case(authority, first, lambda value: value.__setitem__("followup_count", 1), "receipt-followup-count"))
    add("reject_nonzero_credit", lambda: negative_case(authority, first, lambda value: value.__setitem__("credit", 1), "receipt-credit"))
    add("reject_certification", lambda: negative_case(authority, first, lambda value: value.__setitem__("certification", True), "receipt-certification"))
    add("reject_luna_shape", lambda: negative_case(authority, first, lambda value: value["independent_luna_authorization"].__setitem__("extra", True), "receipt-luna-shape"))

    passed: List[str] = []
    failures: List[str] = []
    for name, function in tests:
        try:
            function()
            passed.append(name)
        except Exception as exc:
            failures.append(name + ":" + str(exc))
    return {
        "schema_version": "audit005-governance-command-receipt-harness-tests-v1",
        "status": "PASS" if not failures else "FAIL",
        "tests": len(tests),
        "passed": len(passed),
        "failed": len(failures),
        "passed_names": passed,
        "failures": failures,
        "governed_commands_executed": False,
        "filesystem_test_writes": 0,
        "credit": 0,
    }


def main(argv: Optional[Sequence[str]] = None) -> int:
    del argv
    report = run_tests()
    print(json.dumps(report, sort_keys=True))
    return 0 if report["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
