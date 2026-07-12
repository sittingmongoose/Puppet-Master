#!/usr/bin/env python3
"""Future one-shot receipt runner. Preparation does not execute this file."""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import re
import shutil
import stat
import subprocess
import sys
import time
from pathlib import Path
from typing import Any, Dict, Iterable, List, Mapping, Optional, Sequence, Tuple


REPO = Path("/Users/jaredsmacbookair/Documents/PuppetMaster")
HERE = REPO / "Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive/master/governance_command_receipt_harness_v31"
AUTHORITY_PATH = HERE / "IMMUTABLE_AUTHORITY.json"
INVENTORY_CONTRACT_PATH = HERE / "no_canonical_write_inventory_contract.json"
PACING_POLICY_PATH = REPO / "Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive/master/coordination/CONCURRENCY_POLICY_V32.json"
RUN_ID_RE = re.compile(r"^GCRH-[0-9]{8}T[0-9]{6}Z-[A-F0-9]{8}$")
SHA256_RE = re.compile(r"^[0-9a-f]{64}$")
HARNESS_REL = HERE.relative_to(REPO).as_posix()
EXCLUDED_SUBTREES = (".git", HARNESS_REL)


class HarnessError(RuntimeError):
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
        raise HarnessError("not-object:" + str(path))
    return value


def write_exclusive(path: Path, data: bytes, mode: int = 0o444) -> None:
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL
    fd = os.open(str(path), flags, mode)
    try:
        offset = 0
        while offset < len(data):
            offset += os.write(fd, data[offset:])
        os.fsync(fd)
    finally:
        os.close(fd)


def exact_keys(value: Mapping[str, Any], expected: Iterable[str], label: str) -> None:
    actual = set(value)
    required = set(expected)
    if actual != required:
        raise HarnessError("keys:" + label + ":" + repr(sorted(actual ^ required)))


def current_interpreter_binding() -> Dict[str, Any]:
    which_value = shutil.which("python3")
    if not which_value:
        raise HarnessError("python3-not-found")
    which_path = Path(which_value)
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


def validate_authority(authority: Mapping[str, Any]) -> None:
    if authority.get("schema_version") != "audit005-governance-command-receipt-harness-authority-v1":
        raise HarnessError("authority-schema")
    if authority.get("status") != "PREPARATION_ONLY_ZERO_EXECUTION_ZERO_CREDIT":
        raise HarnessError("authority-status")
    if authority.get("namespace") != str(HERE):
        raise HarnessError("authority-namespace")
    expected_artifacts = authority.get("artifact_bindings")
    if not isinstance(expected_artifacts, dict):
        raise HarnessError("artifact-bindings")
    for name, expected_hash in expected_artifacts.items():
        if not isinstance(name, str) or not isinstance(expected_hash, str) or not SHA256_RE.fullmatch(expected_hash):
            raise HarnessError("artifact-binding-shape")
        path = HERE / name
        if not path.is_file() or path.is_symlink() or sha_path(path) != expected_hash:
            raise HarnessError("artifact-binding-mismatch:" + name)
    if authority.get("interpreter") != current_interpreter_binding():
        raise HarnessError("interpreter-binding-mismatch")
    pacing = authority.get("current_no_execution_pacing_authority")
    if pacing != {
        "path": str(PACING_POLICY_PATH),
        "sha256": "4826ade4c38db47ee184b34e5d7b7bd5ba6cabeecc9baa686cb9d99eeff8a3ed",
        "schema_version": "audit005-concurrency-policy-v32",
        "state": "PROSPECTIVE_ACTIVE_NO_EXECUTION",
        "sealed": False,
        "execution_authority": False,
    }:
        raise HarnessError("pacing-authority")
    if not PACING_POLICY_PATH.is_file() or PACING_POLICY_PATH.is_symlink() or sha_path(PACING_POLICY_PATH) != pacing["sha256"]:
        raise HarnessError("pacing-authority-drift")
    commands = authority.get("governed_commands")
    if not isinstance(commands, list) or len(commands) != 2:
        raise HarnessError("command-count")
    expected_ids = ["plans-run-gates", "shards-check"]
    if [item.get("command_id") for item in commands if isinstance(item, dict)] != expected_ids:
        raise HarnessError("command-order")
    for ordinal, command in enumerate(commands, start=1):
        if not isinstance(command, dict) or command.get("ordinal") != ordinal:
            raise HarnessError("command-ordinal")
        script = command.get("script")
        if not isinstance(script, dict):
            raise HarnessError("command-script")
        script_path = REPO / str(script.get("repository_relative_path", ""))
        if not script_path.is_file() or script_path.is_symlink():
            raise HarnessError("script-path")
        if sha_path(script_path) != script.get("sha256") or script_path.stat().st_size != script.get("bytes"):
            raise HarnessError("script-binding-mismatch:" + command.get("command_id", "unknown"))
    if authority.get("execution_constraints") != {
        "maximum_terminal_runs": 1,
        "command_executions_per_terminal_run": 2,
        "retries": 0,
        "descendants": 0,
        "followups": 0,
        "credit": 0,
        "certification": False,
        "stop_remaining_commands_on_protected_write": True,
    }:
        raise HarnessError("execution-constraints")


def validate_luna_authorization(path: Path, run_id: str, authority: Mapping[str, Any]) -> Dict[str, Any]:
    expected_path = HERE / "authorizations" / run_id / "independent-luna.json"
    if path.resolve() != expected_path.resolve() or not path.is_file() or path.is_symlink():
        raise HarnessError("luna-authorization-path")
    value = load_object(path)
    exact_keys(value, [
        "schema_version", "decision", "audit_id", "namespace", "run_id", "authority_sha256",
        "bound_artifact_hashes", "reviewer", "verification", "execution_constraints",
    ], "luna")
    if value["schema_version"] != "audit005-governance-command-independent-luna-authorization-v1":
        raise HarnessError("luna-schema")
    if value["decision"] != "AUTHORIZE_ONE_TERMINAL_RUN":
        raise HarnessError("luna-decision")
    if value["audit_id"] != authority["audit_id"] or value["namespace"] != str(HERE) or value["run_id"] != run_id:
        raise HarnessError("luna-scope")
    authority_hash = sha_path(AUTHORITY_PATH)
    if value["authority_sha256"] != authority_hash:
        raise HarnessError("luna-authority-hash")
    expected_bound = {
        "runner_sha256": authority["artifact_bindings"]["run_governance_commands_once.py"],
        "verifier_sha256": authority["artifact_bindings"]["verify_governance_receipt_harness.py"],
        "tests_sha256": authority["artifact_bindings"]["test_governance_receipt_harness.py"],
        "receipt_schema_sha256": authority["artifact_bindings"]["governance_command_receipt.schema.json"],
        "inventory_contract_sha256": authority["artifact_bindings"]["no_canonical_write_inventory_contract.json"],
    }
    if value["bound_artifact_hashes"] != expected_bound:
        raise HarnessError("luna-bound-artifacts")
    reviewer = value["reviewer"]
    if not isinstance(reviewer, dict):
        raise HarnessError("luna-reviewer")
    exact_keys(reviewer, [
        "lane", "task_thread_id", "fresh_identity", "independent_of_preparer",
        "independent_of_controller", "reviewed_at_utc",
    ], "luna-reviewer")
    if reviewer["lane"] != "independent_luna_max" or not reviewer["task_thread_id"]:
        raise HarnessError("luna-identity")
    if reviewer["task_thread_id"] == authority["preparer_task_path"]:
        raise HarnessError("luna-not-independent")
    if [reviewer["fresh_identity"], reviewer["independent_of_preparer"], reviewer["independent_of_controller"]] != [True, True, True]:
        raise HarnessError("luna-independence-assertions")
    verification = value["verification"]
    if not isinstance(verification, dict):
        raise HarnessError("luna-verification")
    exact_keys(verification, [
        "static_verifier_exit_code", "tests_exit_code", "static_verifier_stdout_sha256",
        "tests_stdout_sha256", "observed_zero_execution_state", "observed_zero_credit",
        "governed_commands_executed_during_review",
    ], "luna-verification")
    if verification["static_verifier_exit_code"] != 0 or verification["tests_exit_code"] != 0:
        raise HarnessError("luna-verification-exit")
    if not SHA256_RE.fullmatch(str(verification["static_verifier_stdout_sha256"])) or not SHA256_RE.fullmatch(str(verification["tests_stdout_sha256"])):
        raise HarnessError("luna-verification-hashes")
    if [verification["observed_zero_execution_state"], verification["observed_zero_credit"], verification["governed_commands_executed_during_review"]] != [True, True, False]:
        raise HarnessError("luna-zero-state")
    if value["execution_constraints"] != {
        "command_ids_in_order": ["plans-run-gates", "shards-check"],
        "maximum_terminal_runs": 1,
        "retries": 0,
        "descendants": 0,
        "followups": 0,
        "credit": 0,
    }:
        raise HarnessError("luna-execution-constraints")
    return value


def excluded(rel: str) -> bool:
    return any(rel == prefix or rel.startswith(prefix + "/") for prefix in EXCLUDED_SUBTREES)


def entry_for(path: Path, rel: str) -> Dict[str, Any]:
    info = path.lstat()
    mode = stat.S_IMODE(info.st_mode)
    if stat.S_ISLNK(info.st_mode):
        target = os.readlink(str(path))
        return {
            "path": rel,
            "type": "symbolic_link",
            "mode": mode,
            "target": target,
            "target_sha256": sha_bytes(target.encode("utf-8", "surrogateescape")),
        }
    if stat.S_ISDIR(info.st_mode):
        return {"path": rel, "type": "directory", "mode": mode}
    if stat.S_ISREG(info.st_mode):
        return {
            "path": rel,
            "type": "regular_file",
            "mode": mode,
            "bytes": info.st_size,
            "sha256": sha_path(path),
        }
    raise HarnessError("unsupported-entry:" + rel)


def build_inventory() -> Dict[str, Any]:
    entries: List[Dict[str, Any]] = []
    for root_text, dir_names, file_names in os.walk(str(REPO), topdown=True, followlinks=False):
        root = Path(root_text)
        kept_dirs: List[str] = []
        for name in sorted(dir_names):
            path = root / name
            rel = path.relative_to(REPO).as_posix()
            if excluded(rel):
                continue
            entries.append(entry_for(path, rel))
            if not path.is_symlink():
                kept_dirs.append(name)
        dir_names[:] = kept_dirs
        for name in sorted(file_names):
            path = root / name
            rel = path.relative_to(REPO).as_posix()
            if not excluded(rel):
                entries.append(entry_for(path, rel))
    entries.sort(key=lambda item: item["path"])
    canonical_entries = [
        item for item in entries
        if item["path"].startswith("Plans/")
        and not item["path"].startswith("Plans/.audits/")
        and not item["path"].startswith("Plans/ledgers/")
    ]
    return {
        "schema_version": "audit005-protected-repository-inventory-v1",
        "algorithm": "sorted-lstat-sha256-inventory-v1",
        "repository_root": str(REPO),
        "excluded_subtrees_repository_relative": list(EXCLUDED_SUBTREES),
        "entry_count": len(entries),
        "repository_sha256": sha_bytes(canonical_bytes(entries)),
        "canonical_plans_entry_count": len(canonical_entries),
        "canonical_plans_sha256": sha_bytes(canonical_bytes(canonical_entries)),
        "entries": entries,
    }


def inventory_diff(before: Mapping[str, Any], after: Mapping[str, Any]) -> Dict[str, Any]:
    before_map = {item["path"]: item for item in before["entries"]}
    after_map = {item["path"]: item for item in after["entries"]}
    paths = sorted(set(before_map) | set(after_map))
    changes = []
    for path in paths:
        left = before_map.get(path)
        right = after_map.get(path)
        if left != right:
            changes.append({"path": path, "before": left, "after": right})
    changed_paths = [item["path"] for item in changes]
    return {
        "schema_version": "audit005-protected-repository-inventory-diff-v1",
        "delta_count": len(changes),
        "delta_paths_sha256": sha_bytes(canonical_bytes(changed_paths)),
        "changes": changes,
    }


def utc_from_ns(value: int) -> str:
    return dt.datetime.fromtimestamp(value / 1_000_000_000, tz=dt.timezone.utc).isoformat(timespec="microseconds").replace("+00:00", "Z")


def relative_artifact(path: Path) -> str:
    return path.relative_to(HERE).as_posix()


def make_stream_record(path: Path, payload: bytes) -> Dict[str, Any]:
    return {"artifact": relative_artifact(path), "bytes": len(payload), "sha256": sha_bytes(payload)}


def execute_once(run_id: str, luna_path: Path) -> Dict[str, Any]:
    if not RUN_ID_RE.fullmatch(run_id):
        raise HarnessError("run-id")
    authority = load_object(AUTHORITY_PATH)
    validate_authority(authority)
    luna = validate_luna_authorization(luna_path, run_id, authority)
    runs_root = HERE / "runs"
    if runs_root.exists():
        raise HarnessError("terminal-run-already-attempted")
    os.mkdir(str(runs_root), 0o755)
    run_dir = runs_root / run_id
    os.mkdir(str(run_dir), 0o755)
    authority_hash = sha_path(AUTHORITY_PATH)
    luna_hash = sha_path(luna_path)
    inventory_contract_hash = sha_path(INVENTORY_CONTRACT_PATH)
    environment = authority["execution_environment"]
    environment_hash = sha_bytes(canonical_bytes(environment))
    receipt_refs = []
    protected_write_seen = False
    for command in authority["governed_commands"]:
        command_dir = run_dir / ("%02d-%s" % (command["ordinal"], command["command_id"]))
        os.mkdir(str(command_dir), 0o755)
        pre = build_inventory()
        start_wall_ns = time.time_ns()
        start_mono_ns = time.monotonic_ns()
        process = subprocess.run(
            list(command["argv"]),
            cwd=command["cwd"],
            env=dict(environment),
            stdin=subprocess.DEVNULL,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            shell=False,
            check=False,
        )
        finish_mono_ns = time.monotonic_ns()
        finish_wall_ns = time.time_ns()
        post = build_inventory()
        diff = inventory_diff(pre, post)
        stdout_path = command_dir / "stdout.bin"
        stderr_path = command_dir / "stderr.bin"
        pre_path = command_dir / "pre-inventory.json"
        post_path = command_dir / "post-inventory.json"
        diff_path = command_dir / "inventory-diff.json"
        write_exclusive(stdout_path, process.stdout)
        write_exclusive(stderr_path, process.stderr)
        write_exclusive(pre_path, canonical_bytes(pre))
        write_exclusive(post_path, canonical_bytes(post))
        write_exclusive(diff_path, canonical_bytes(diff))
        no_write = (
            diff["delta_count"] == 0
            and pre["repository_sha256"] == post["repository_sha256"]
            and pre["canonical_plans_sha256"] == post["canonical_plans_sha256"]
        )
        if not no_write:
            outcome = "FAIL_PROTECTED_WRITE"
            protected_write_seen = True
        elif process.returncode == 0:
            outcome = "PASS_NO_WRITE"
        elif process.returncode < 0:
            outcome = "FAIL_SIGNAL_NO_WRITE"
        else:
            outcome = "FAIL_EXIT_NO_WRITE"
        receipt = {
            "schema_version": "audit005-governance-command-receipt-v1",
            "audit_id": authority["audit_id"],
            "harness_authority_sha256": authority_hash,
            "run_id": run_id,
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
            "environment_sha256": environment_hash,
            "started_at_utc": utc_from_ns(start_wall_ns),
            "finished_at_utc": utc_from_ns(finish_wall_ns),
            "started_unix_ns": start_wall_ns,
            "finished_unix_ns": finish_wall_ns,
            "duration_monotonic_ns": finish_mono_ns - start_mono_ns,
            "termination": {
                "returncode": process.returncode,
                "exit_code": process.returncode if process.returncode >= 0 else None,
                "signal": -process.returncode if process.returncode < 0 else None,
            },
            "stdout": make_stream_record(stdout_path, process.stdout),
            "stderr": make_stream_record(stderr_path, process.stderr),
            "inventory": {
                "contract_sha256": inventory_contract_hash,
                "pre_repository_sha256": pre["repository_sha256"],
                "post_repository_sha256": post["repository_sha256"],
                "pre_canonical_plans_sha256": pre["canonical_plans_sha256"],
                "post_canonical_plans_sha256": post["canonical_plans_sha256"],
                "pre_entry_count": pre["entry_count"],
                "post_entry_count": post["entry_count"],
                "pre_artifact": relative_artifact(pre_path),
                "post_artifact": relative_artifact(post_path),
            },
            "inventory_diff": {
                "artifact": relative_artifact(diff_path),
                "sha256": sha_path(diff_path),
                "delta_count": diff["delta_count"],
                "delta_paths_sha256": diff["delta_paths_sha256"],
            },
            "no_protected_write": no_write,
            "outcome": outcome,
            "execution_count": 1,
            "retry_count": 0,
            "descendant_count": 0,
            "followup_count": 0,
            "credit": 0,
            "certification": False,
            "independent_luna_authorization": {
                "artifact": relative_artifact(luna_path),
                "sha256": luna_hash,
                "task_thread_id": luna["reviewer"]["task_thread_id"],
            },
        }
        receipt_path = command_dir / "receipt.json"
        write_exclusive(receipt_path, canonical_bytes(receipt))
        os.chmod(command_dir, 0o555)
        receipt_refs.append({
            "command_id": command["command_id"],
            "receipt": relative_artifact(receipt_path),
            "receipt_sha256": sha_path(receipt_path),
            "outcome": outcome,
        })
        if protected_write_seen:
            break
    if protected_write_seen:
        status_value = "FAIL_PROTECTED_WRITE_STOPPED_ZERO_CREDIT"
    elif len(receipt_refs) != 2:
        status_value = "FAIL_INCOMPLETE_ZERO_CREDIT"
    elif all(item["outcome"] == "PASS_NO_WRITE" for item in receipt_refs):
        status_value = "PASS_NO_WRITE_ZERO_CREDIT"
    else:
        status_value = "FAIL_COMMAND_ZERO_CREDIT"
    terminal = {
        "schema_version": "audit005-governance-command-terminal-receipt-v1",
        "status": status_value,
        "audit_id": authority["audit_id"],
        "run_id": run_id,
        "harness_authority_sha256": authority_hash,
        "independent_luna_authorization_sha256": luna_hash,
        "command_receipts": receipt_refs,
        "governed_command_execution_count": len(receipt_refs),
        "maximum_terminal_runs": 1,
        "retries": 0,
        "descendants": 0,
        "followups": 0,
        "credit": 0,
        "certification": False,
        "activation": False,
    }
    terminal_path = run_dir / "terminal-receipt.json"
    write_exclusive(terminal_path, canonical_bytes(terminal))
    os.chmod(run_dir, 0o555)
    os.chmod(runs_root, 0o555)
    return {"status": status_value, "terminal_receipt": relative_artifact(terminal_path), "sha256": sha_path(terminal_path)}


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Execute the two pinned governance commands once after independent Luna authorization.")
    parser.add_argument("--run-id", required=True)
    parser.add_argument("--luna-authorization", required=True, type=Path)
    args = parser.parse_args(argv)
    try:
        result = execute_once(args.run_id, args.luna_authorization)
    except HarnessError as exc:
        print(json.dumps({"status": "FAIL_CLOSED", "error": str(exc)}, sort_keys=True))
        return 1
    print(json.dumps(result, sort_keys=True))
    return 0 if result["status"] == "PASS_NO_WRITE_ZERO_CREDIT" else 1


if __name__ == "__main__":
    raise SystemExit(main())
