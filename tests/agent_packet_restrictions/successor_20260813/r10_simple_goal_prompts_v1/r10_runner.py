#!/usr/bin/env python3
"""Once-only R10 Codex diagnostic runner. Captures bytes; grants no qualification credit."""

from __future__ import annotations

import argparse
import gzip
import hashlib
import os
import re
import subprocess
import sys
import tempfile
import time
from importlib.metadata import version as package_version
from pathlib import Path
from typing import Any

import jsonschema

import r10_contract as contract

ROOT = Path(__file__).resolve().parent
CANARY_EVIDENCE_ROOT = (ROOT / "canary_003" / "r10-codex-canary-003-evidence").resolve()

CANARY_ROSTER = {
    "alpha": ("gpt-5.4-mini", "xhigh"),
}
CANARY_ROW_IDS = {"alpha": "row-alpha-003"}
CANARY_FROZEN_PATHS = {
    "ARCHITECTURE.md",
    "prompt_capsule.schema.json",
    "r10_contract.py",
    "r10_runner.py",
    "r10_verify.py",
    "r10_selftest.py",
    "workflow_coverage.json",
    "canary_003/response.schema.json",
    "canary_003/capsule.json",
    "canary_003/oracle.json",
}
CANARY_ACCEPTANCE = {
    "external_user_submission_count_per_row": 1,
    "goal_create_count_per_row": 1,
    "goal_get_max_per_row": 4,
    "goal_terminal_count_per_row": 1,
    "goal_tool_call_max_per_row": 6,
    "same_goal_thread_identity": True,
    "activation_before_semantic_result": True,
    "actual_tool_calls_subset": ["create_goal", "get_goal", "update_goal"],
    "filesystem_writes_by_subject": 0,
    "network_calls_by_subject": 0,
    "schema_validation": "strict",
    "semantic_score": "exact_json_value",
    "deterministic_result_checks": ["source_ids_unique"],
    "provider_output_schema_enforcement": "host_only",
    "required_pass": 1,
    "allowed_fail": 0,
}
CANARY_RUNTIME = {
    "repository": "/mnt/Cursor/PuppetMaster",
    "codex_home": "/home/sittingmongoose/.codex",
    "timeout_seconds": 900,
    "sandbox": "read-only",
    "working_directory": "fresh_temporary_directory",
    "temporary_root": "/tmp",
    "stdin_submission_count": 1,
    "strict_config": True,
    "ignore_user_config": True,
    "ignore_rules": True,
    "environment": {
        "CODEX_HOME": "/home/sittingmongoose/.codex",
        "HOME": "/home/sittingmongoose",
        "LANG": "C.UTF-8",
        "LC_ALL": "C.UTF-8",
        "LOGNAME": "sittingmongoose",
        "PATH": "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
        "SHELL": "/bin/bash",
        "USER": "sittingmongoose",
    },
}
CANARY_CONTROLLER_RUNTIME = {
    "python_executable": "/usr/bin/python3.13",
    "python_version": "3.13.7",
    "jsonschema_version": "4.19.2",
}


class RunnerError(RuntimeError):
    pass


class PostPopenRunnerError(RunnerError):
    def __init__(self, row_id: str, pid: int, cause: Exception):
        self.row_id = row_id
        self.pid = pid
        super().__init__(f"post-Popen controller failure for {row_id}, pid={pid}: {type(cause).__name__}: {cause}")


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RunnerError(message)


def require_designated_evidence_root(path: Path) -> Path:
    resolved = path.resolve()
    require(resolved == CANARY_EVIDENCE_ROOT, "evidence root identity")
    return resolved


def identity_bytes(relative: str, raw: bytes) -> dict[str, Any]:
    return {"path": relative, "utf8_bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest()}


def require_live_binary_identity(path: Path, expected: dict[str, Any]) -> dict[str, Any]:
    resolved = path.resolve()
    require(resolved.is_file() and os.access(resolved, os.X_OK), "Codex binary missing or not executable")
    raw = resolved.read_bytes()
    observed = {"path": str(resolved), "bytes": len(raw), "sha256": contract.sha256(raw)}
    require(observed == expected, "Codex binary drift immediately before Popen")
    return observed


def fsync_directory(path: Path) -> None:
    descriptor = os.open(path, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
    try:
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def exclusive_bytes(path: Path, raw: bytes, mode: int = 0o644) -> None:
    path.parent.mkdir(mode=0o755, parents=True, exist_ok=True)
    descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_CLOEXEC", 0), mode)
    try:
        with os.fdopen(descriptor, "wb", closefd=False) as handle:
            handle.write(raw)
            handle.flush()
            os.fsync(handle.fileno())
    finally:
        os.close(descriptor)
    fsync_directory(path.parent)


def exclusive_json(path: Path, value: Any) -> None:
    exclusive_bytes(path, contract.canonical_bytes(value) + b"\n")


def resolve_owned(relative: str) -> Path:
    path = (ROOT / relative).resolve()
    require(path == ROOT or ROOT in path.parents, f"path escapes R10 root: {relative}")
    require(path.is_file(), f"missing file: {relative}")
    return path


def load_commitment(path: Path, manifest_relative: str, manifest_raw: bytes) -> tuple[dict[str, Any], bytes]:
    require(path.is_file(), "missing detached manifest commitment")
    raw = path.read_bytes()
    value = contract.load_json_bytes(raw, "manifest commitment")
    require(
        value == {
            "schema_id": "pm.r10.manifest_commitment.v1",
            "manifest_path": manifest_relative,
            "manifest_sha256": contract.sha256(manifest_raw),
        },
        "detached manifest commitment mismatch",
    )
    return value, raw


def validate_static_manifest(manifest: dict[str, Any]) -> None:
    require(manifest.get("schema_id") == "pm.r10.run_manifest.v1", "manifest schema")
    require(manifest.get("run_id") == "r10-codex-canary-003", "run identity")
    require(manifest.get("kind") == "single_route_output_schema_diagnostic", "canary kind")
    require(manifest.get("status") == "FROZEN_ZERO_CREDIT", "manifest not frozen")
    require(manifest.get("platform") == "codex", "runner platform")
    require(manifest.get("profile_id") == contract.PROFILE, "profile")
    require(manifest.get("attempts_per_row") == 1, "attempt count")
    require(manifest.get("retry") is False and manifest.get("replacement") is False, "retry/replacement policy")
    require(manifest.get("best_of") == 0 and manifest.get("max_parallel") == 1, "selection/parallel policy")
    require(manifest.get("qualification_credit") == 0 and manifest.get("qualification_streak") == 0, "canary credit")
    require(manifest.get("acceptance") == CANARY_ACCEPTANCE, "acceptance contract drift")
    require(manifest.get("runtime") == CANARY_RUNTIME, "runtime contract drift")
    require(manifest.get("controller_runtime") == CANARY_CONTROLLER_RUNTIME, "controller runtime contract drift")
    require(str(Path(sys.executable).resolve()) == CANARY_CONTROLLER_RUNTIME["python_executable"], "controller Python executable drift")
    require(".".join(map(str, sys.version_info[:3])) == CANARY_CONTROLLER_RUNTIME["python_version"], "controller Python version drift")
    require(package_version("jsonschema") == CANARY_CONTROLLER_RUNTIME["jsonschema_version"], "jsonschema version drift")
    rows = manifest.get("rows")
    require(isinstance(rows, list) and len(rows) == len(CANARY_ROSTER), "diagnostic row denominator")
    require([row.get("route_id") for row in rows] == list(CANARY_ROSTER), "route order/set drift")
    require(len({row.get("row_id") for row in rows}) == len(CANARY_ROSTER), "row IDs not unique")
    require(len({row.get("nonce") for row in rows}) == len(CANARY_ROSTER), "nonces not unique")
    require(all(isinstance(row.get("nonce"), str) and re.fullmatch(r"[0-9a-f]{32}", row["nonce"]) for row in rows), "nonce format")
    for row in rows:
        route = row["route_id"]
        model, effort = CANARY_ROSTER[route]
        require(row.get("row_id") == CANARY_ROW_IDS[route], f"row identity drift: {route}")
        require(row.get("model") == model and row.get("reasoning_effort") == effort, f"route binding drift: {route}")


def preflight_manifest(manifest_path: Path, commitment_path: Path) -> dict[str, Any]:
    manifest_path = manifest_path.resolve()
    commitment_path = commitment_path.resolve()
    require(manifest_path == ROOT or ROOT in manifest_path.parents, "manifest outside R10")
    require(commitment_path == ROOT or ROOT in commitment_path.parents, "commitment outside R10")
    manifest_relative = manifest_path.relative_to(ROOT).as_posix()
    commitment_relative = commitment_path.relative_to(ROOT).as_posix()
    require(manifest_relative == "canary_003/manifest.json", "manifest launch path")
    require(commitment_relative == "canary_003/manifest.commitment.json", "manifest commitment launch path")
    manifest_raw = manifest_path.read_bytes()
    manifest = contract.load_json_bytes(manifest_raw, "manifest")
    commitment, commitment_raw = load_commitment(commitment_path, manifest_relative, manifest_raw)
    validate_static_manifest(manifest)

    require(manifest.get("schema_id") == "pm.r10.run_manifest.v1", "manifest schema")
    require(manifest.get("run_id") == "r10-codex-canary-003", "run identity")
    require(manifest.get("kind") == "single_route_output_schema_diagnostic", "canary kind")
    require(manifest.get("status") == "FROZEN_ZERO_CREDIT", "manifest not frozen")
    require(manifest.get("platform") == "codex", "runner platform")
    require(manifest.get("profile_id") == contract.PROFILE, "profile")
    require(manifest.get("attempts_per_row") == 1, "attempt count")
    require(manifest.get("retry") is False and manifest.get("replacement") is False, "retry/replacement policy")
    require(manifest.get("best_of") == 0 and manifest.get("max_parallel") == 1, "selection/parallel policy")
    require(manifest.get("qualification_credit") == 0 and manifest.get("qualification_streak") == 0, "canary credit")
    require(manifest.get("acceptance") == CANARY_ACCEPTANCE, "acceptance contract drift")
    require(manifest.get("runtime") == CANARY_RUNTIME, "runtime contract drift")

    frozen_entries = manifest.get("frozen_files")
    require(isinstance(frozen_entries, list), "frozen_files must be an array")
    frozen_paths = [item.get("path") for item in frozen_entries if isinstance(item, dict)]
    require(len(frozen_paths) == len(frozen_entries), "malformed frozen entry")
    require(len(frozen_paths) == len(set(frozen_paths)), "duplicate frozen path")
    require(set(frozen_paths) == CANARY_FROZEN_PATHS, "frozen path set drift")

    frozen_bytes: dict[str, bytes] = {}
    for expected in frozen_entries:
        relative = expected["path"]
        raw = resolve_owned(relative).read_bytes()
        require(identity_bytes(relative, raw) == expected, f"frozen identity drift: {relative}")
        frozen_bytes[relative] = raw

    codex_record = manifest.get("codex_binary")
    require(isinstance(codex_record, dict), "Codex binary record")
    codex_path = Path(codex_record.get("path", "")).resolve()
    observed_codex = require_live_binary_identity(codex_path, codex_record)
    version = subprocess.run(
        [str(codex_path), "--version"],
        env=CANARY_RUNTIME["environment"],
        capture_output=True,
        check=False,
        timeout=15,
    )
    require(version.returncode == 0 and version.stderr == b"", "Codex version probe failed")
    require(version.stdout.decode("utf-8").strip() == f"codex-cli {manifest.get('codex_cli_version')}", "Codex version drift")

    rows = manifest.get("rows")
    require(isinstance(rows, list) and len(rows) == len(CANARY_ROSTER), "diagnostic row denominator")
    require([row.get("route_id") for row in rows] == list(CANARY_ROSTER), "route order/set drift")
    require(len({row.get("row_id") for row in rows}) == len(CANARY_ROSTER), "row IDs not unique")
    require(len({row.get("nonce") for row in rows}) == len(CANARY_ROSTER), "nonces not unique")
    require(all(isinstance(row.get("nonce"), str) and re.fullmatch(r"[0-9a-f]{32}", row["nonce"]) for row in rows), "nonce format")

    oracle_path = manifest.get("oracle_path")
    require(oracle_path == "canary_003/oracle.json" and oracle_path in frozen_bytes, "oracle binding")
    oracle = contract.load_json_bytes(frozen_bytes[oracle_path], "oracle")
    capsule_schema = contract.load_json_bytes(frozen_bytes["prompt_capsule.schema.json"], "capsule schema")
    jsonschema.Draft202012Validator.check_schema(capsule_schema)
    prepared_rows: dict[str, dict[str, Any]] = {}
    unit_ids: set[str] = set()
    for row in rows:
        route = row["route_id"]
        model, effort = CANARY_ROSTER[route]
        require(row.get("row_id") == CANARY_ROW_IDS[route], f"row identity drift: {route}")
        require(row.get("model") == model and row.get("reasoning_effort") == effort, f"route binding drift: {route}")
        require(row.get("capsule_path") == "canary_003/capsule.json", f"capsule binding drift: {route}")
        require(row.get("response_schema_path") == "canary_003/response.schema.json", f"response schema binding drift: {route}")
        capsule = contract.load_json_bytes(frozen_bytes[row["capsule_path"]], f"capsule {route}")
        prompt, metrics = contract.render_prompt(capsule, "codex", capsule_schema)
        require(row.get("capsule_sha256") == metrics["capsule_sha256"], f"capsule hash drift: {route}")
        require(row.get("submitted_user_prompt_sha256") == metrics["prompt_sha256"], f"prompt hash drift: {route}")
        require(row.get("submitted_user_prompt_utf8_bytes") == metrics["prompt_utf8_bytes"], f"prompt size drift: {route}")
        response_schema = contract.load_json_bytes(frozen_bytes[row["response_schema_path"]], f"response schema {route}")
        jsonschema.Draft202012Validator.check_schema(response_schema)
        contract.validate_provider_response_schema(response_schema)
        require(contract.canonical_bytes(response_schema) == contract.canonical_bytes(capsule["output_contract"]["inline_schema"]), f"inline/external schema mismatch: {route}")
        unit_id = capsule["unit_id"]
        unit_ids.add(unit_id)
        require(unit_id in oracle, f"oracle missing unit: {unit_id}")
        jsonschema.Draft202012Validator(response_schema).validate(oracle[unit_id])
        source_ids = oracle[unit_id].get("source_ids")
        require(isinstance(source_ids, list) and len(source_ids) == len(set(source_ids)), f"oracle source_ids uniqueness: {route}")
        prepared_rows[row["row_id"]] = {
            "capsule": capsule,
            "prompt": prompt,
            "metrics": metrics,
            "response_schema": response_schema,
        }
    require(set(oracle) == unit_ids, "oracle key set drift")

    return {
        "manifest": manifest,
        "manifest_raw": manifest_raw,
        "manifest_sha256": commitment["manifest_sha256"],
        "commitment": commitment,
        "commitment_raw": commitment_raw,
        "frozen_bytes": frozen_bytes,
        "codex_path": codex_path,
        "codex_record": observed_codex,
        "prepared_rows": prepared_rows,
    }


def git_command(repository: Path, arguments: list[str]) -> bytes:
    result = subprocess.run(
        ["git", *arguments],
        cwd=repository,
        env=CANARY_RUNTIME["environment"],
        capture_output=True,
        check=False,
        timeout=30,
    )
    require(result.returncode == 0, f"git custody command failed: {' '.join(arguments)}: {result.stderr.decode('utf-8', 'replace').strip()}")
    return result.stdout


def verify_pushed_git_custody(bundle: dict[str, Any], manifest_path: Path, commitment_path: Path) -> dict[str, Any]:
    repository = Path(bundle["manifest"]["runtime"]["repository"]).resolve()
    require(repository == Path("/mnt/Cursor/PuppetMaster") and repository.is_dir(), "repository custody root")
    require(git_command(repository, ["rev-parse", "--show-toplevel"]).decode().strip() == str(repository), "git top-level drift")
    require(git_command(repository, ["branch", "--show-current"]).decode().strip() == "main", "launch branch is not main")
    head = git_command(repository, ["rev-parse", "HEAD"]).decode().strip()
    origin_main = git_command(repository, ["rev-parse", "origin/main"]).decode().strip()
    require(re.fullmatch(r"[0-9a-f]{40}", head) is not None and head == origin_main, "HEAD/origin-main push custody mismatch")

    current: dict[Path, bytes] = {
        manifest_path.resolve(): bundle["manifest_raw"],
        commitment_path.resolve(): bundle["commitment_raw"],
    }
    current.update({resolve_owned(relative): raw for relative, raw in bundle["frozen_bytes"].items()})
    tracked_paths: list[str] = []
    for path, raw in current.items():
        require(repository in path.parents, f"launch input outside repository: {path}")
        relative = path.relative_to(repository).as_posix()
        git_command(repository, ["ls-files", "--error-unmatch", "--", relative])
        committed = git_command(repository, ["show", f"HEAD:{relative}"])
        require(committed == raw, f"launch input differs from pushed HEAD: {relative}")
        tracked_paths.append(relative)
    return {
        "repository": str(repository),
        "branch": "main",
        "head": head,
        "origin_main": origin_main,
        "tracked_launch_inputs": sorted(tracked_paths),
        "status": "PASS_PUSHED_HEAD_EXACT_INPUTS",
    }


def snapshot_bundle(bundle: dict[str, Any], evidence_root: Path) -> Path:
    exclusive_bytes(evidence_root / "manifest.json", bundle["manifest_raw"], mode=0o444)
    exclusive_bytes(evidence_root / "manifest.commitment.json", bundle["commitment_raw"], mode=0o444)
    snapshot_root = evidence_root / "frozen_snapshot"
    for relative, raw in bundle["frozen_bytes"].items():
        exclusive_bytes(snapshot_root / relative, raw, mode=0o444)
    gates = evidence_root / "gates"
    gates.mkdir(mode=0o755)
    fsync_directory(evidence_root)
    preflight = {
        "schema_id": "pm.r10.preflight_receipt.v1",
        "run_id": bundle["manifest"]["run_id"],
        "manifest_sha256": bundle["manifest_sha256"],
        "codex_binary": bundle["codex_record"],
        "runtime": bundle["manifest"]["runtime"],
        "controller_runtime": bundle["manifest"]["controller_runtime"],
        "git_custody": bundle["git_custody"],
        "frozen_files": bundle["manifest"]["frozen_files"],
        "row_prompt_metrics": {row_id: value["metrics"] for row_id, value in bundle["prepared_rows"].items()},
        "subject_launch_count": 0,
        "status": "PASS_BEFORE_ANY_SUBJECT_LAUNCH",
        "qualification_credit": 0,
    }
    exclusive_json(evidence_root / "preflight_receipt.json", preflight)
    return snapshot_root


def snapshot_errors(snapshot_root: Path, manifest: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    for expected in manifest["frozen_files"]:
        path = snapshot_root / expected["path"]
        if not path.is_file():
            errors.append(f"missing:{expected['path']}")
            continue
        if identity_bytes(expected["path"], path.read_bytes()) != expected:
            errors.append(f"drift:{expected['path']}")
    return errors


def parse_thread_id(stdout: bytes) -> str | None:
    ids: list[str] = []
    for number, line in enumerate(stdout.splitlines(), 1):
        value = contract.load_json_bytes(line, f"Codex stdout JSONL line {number}")
        require(isinstance(value, dict), f"Codex stdout line is not an object: {number}")
        if value.get("type") == "thread.started" and isinstance(value.get("thread_id"), str):
            ids.append(value["thread_id"])
    return ids[0] if len(ids) == 1 else None


def locate_rollout(codex_home: Path, thread_id: str) -> Path:
    matches = list((codex_home / "sessions").glob(f"**/*{thread_id}*.jsonl"))
    require(len(matches) == 1, f"rollout match count for {thread_id}: {len(matches)}")
    return matches[0]


def terminate(process: subprocess.Popen[bytes]) -> None:
    if process.poll() is not None:
        return
    process.terminate()
    try:
        process.wait(timeout=10)
    except subprocess.TimeoutExpired:
        process.kill()
        process.wait(timeout=10)


def raise_post_popen_failure(
    process: subprocess.Popen[bytes],
    row_id: str,
    cause: Exception,
) -> None:
    """Best-effort cleanup that cannot hide the observed Popen lower bound."""

    try:
        terminate(process)
    except Exception:
        pass
    try:
        process.communicate(timeout=10)
    except Exception:
        pass
    raise PostPopenRunnerError(row_id, process.pid, cause) from cause


def canonical_record(path: Path, label: str) -> tuple[dict[str, Any], bytes]:
    raw = path.read_bytes()
    value = contract.load_json_bytes(raw, label)
    require(isinstance(value, dict), f"{label} is not an object")
    require(raw == contract.canonical_bytes(value) + b"\n", f"{label} is not canonical")
    return value, raw


def runner_row_evidence_identities(run_root: Path, row_ids: list[str]) -> list[dict[str, Any]]:
    names = (
        "attempt.json",
        "launch_receipt.json",
        "process_capture.json",
        "submitted_user_prompt.txt",
        "stdout.jsonl",
        "stderr.bin",
        "rollout.jsonl.gz",
        "last_message.txt",
    )
    identities: list[dict[str, Any]] = []
    for row_id in row_ids:
        for name in names:
            path = run_root / "rows" / row_id / name
            require(path.is_file(), f"missing prefix row evidence: {row_id}/{name}")
            raw = path.read_bytes()
            identities.append({"path": path.relative_to(run_root).as_posix(), "bytes": len(raw), "sha256": contract.sha256(raw)})
    return identities


def validate_pass_prefix_gate(bundle: dict[str, Any], run_root: Path, prefix_index: int) -> tuple[dict[str, Any], bytes]:
    manifest = bundle["manifest"]
    rows = manifest["rows"]
    require(0 <= prefix_index < len(rows), "prefix validation index")
    row = rows[prefix_index]
    gate_path = run_root / "gates" / f"prefix-{row['row_id']}.json"
    gate, raw = canonical_record(gate_path, f"prefix gate {row['row_id']}")
    predecessor_sha: str | None = None
    if prefix_index > 0:
        _predecessor, predecessor_raw = validate_pass_prefix_gate(bundle, run_root, prefix_index - 1)
        predecessor_sha = contract.sha256(predecessor_raw)
    expected_row_ids = [item["row_id"] for item in rows[: prefix_index + 1]]
    frozen = {item["path"]: item for item in manifest["frozen_files"]}
    require(gate.get("schema_id") == "pm.r10.prefix_gate.v1", "prefix gate schema")
    require(gate.get("status") == "PASS_PREFIX_FOR_NEXT_LAUNCH_ZERO_CREDIT", "prefix gate not PASS")
    require(gate.get("run_id") == manifest["run_id"] and gate.get("manifest_sha256") == bundle["manifest_sha256"], "prefix gate run/manifest")
    require(gate.get("through_row_id") == row["row_id"] and gate.get("through_route_id") == row["route_id"], "prefix gate row/route")
    require(gate.get("prefix_index") == prefix_index, "prefix gate index")
    require(gate.get("predecessor_gate_sha256") == predecessor_sha, "prefix gate predecessor chain")
    require(gate.get("verified_row_ids") == expected_row_ids and gate.get("pass_count") == len(expected_row_ids), "prefix gate denominator")
    require(gate.get("executing_verifier_sha256") == frozen["r10_verify.py"]["sha256"], "prefix verifier identity")
    require(gate.get("executing_contract_sha256") == frozen["r10_contract.py"]["sha256"], "prefix contract identity")
    require(gate.get("row_evidence") == runner_row_evidence_identities(run_root, expected_row_ids), "prefix row-evidence identity")
    receipts = gate.get("row_receipts")
    require(isinstance(receipts, list) and [item.get("row_id") for item in receipts] == expected_row_ids, "prefix row receipts")
    require(all(item.get("status") == "PASS" and item.get("qualification_credit") == 0 for item in receipts), "prefix row receipt status")
    require(gate.get("qualification_credit") == 0 and gate.get("qualification_streak") == 0, "prefix gate credit")

    process, _process_raw = canonical_record(
        run_root / "gates" / f"prefix-{row['row_id']}.process.json",
        f"prefix gate process {row['row_id']}",
    )
    stdout = (run_root / "gates" / f"prefix-{row['row_id']}.stdout.jsonl").read_bytes()
    stderr = (run_root / "gates" / f"prefix-{row['row_id']}.stderr.bin").read_bytes()
    expected_argv = [
        manifest["controller_runtime"]["python_executable"],
        "-B",
        str(run_root / "frozen_snapshot" / "r10_verify.py"),
        "--evidence-root",
        str(run_root),
        "--prefix-row",
        row["row_id"],
        "--write-prefix-receipt",
    ]
    require(process.get("schema_id") == "pm.r10.prefix_gate_process.v1", "prefix process schema")
    require(process.get("run_id") == manifest["run_id"] and process.get("manifest_sha256") == bundle["manifest_sha256"], "prefix process run/manifest")
    require(process.get("row_id") == row["row_id"] and process.get("route_id") == row["route_id"], "prefix process row/route")
    require(process.get("argv") == expected_argv, "prefix process argv")
    require(process.get("returncode") == 0 and process.get("status") == "PASS" and process.get("validation_error") is None, "prefix process result")
    require(process.get("stdout_sha256") == contract.sha256(stdout) and process.get("stdout_bytes") == len(stdout), "prefix stdout identity")
    require(process.get("stderr_sha256") == contract.sha256(stderr) and process.get("stderr_bytes") == len(stderr), "prefix stderr identity")
    require(stdout == raw and stderr == b"", "prefix process output/gate join")
    require(process.get("gate_sha256") == contract.sha256(raw), "prefix process gate hash")
    return gate, raw


def validate_launch_authorization(
    bundle: dict[str, Any],
    run_root: Path,
    row: dict[str, Any],
    authorization: dict[str, Any],
) -> None:
    require(set(authorization) == {"kind", "path", "sha256", "predecessor_row_id"}, "launch authorization shape")
    require(authorization["kind"] in {"pushed_preflight", "prefix_gate"}, "launch authorization kind")
    rows = bundle["manifest"]["rows"]
    row_index = next((position for position, item in enumerate(rows) if item["row_id"] == row["row_id"]), None)
    require(row_index is not None, "launch row absent from roster")
    require(authorization["kind"] == ("pushed_preflight" if row_index == 0 else "prefix_gate"), "launch authorization stage")
    if row_index > 0:
        require(authorization["predecessor_row_id"] == rows[row_index - 1]["row_id"], "launch authorization immediate predecessor")
    path = (run_root / authorization["path"]).resolve()
    require(path == run_root or run_root in path.parents, "launch authorization path escape")
    require(path.is_file(), "launch authorization missing")
    raw = path.read_bytes()
    require(contract.sha256(raw) == authorization["sha256"], "launch authorization hash")
    value = contract.load_json_bytes(raw, "launch authorization")
    require(raw == contract.canonical_bytes(value) + b"\n", "launch authorization not canonical")
    if authorization["kind"] == "pushed_preflight":
        require(authorization["path"] == "preflight_receipt.json", "preflight authorization path")
        require(value.get("status") == "PASS_BEFORE_ANY_SUBJECT_LAUNCH", "preflight authorization status")
        require(value.get("run_id") == bundle["manifest"]["run_id"] and value.get("manifest_sha256") == bundle["manifest_sha256"], "preflight authorization run/manifest")
        require(value.get("subject_launch_count") == 0 and value.get("qualification_credit") == 0, "preflight authorization counts")
        require(authorization["predecessor_row_id"] is None, "preflight predecessor")
    else:
        row_id = authorization["predecessor_row_id"]
        index = next((position for position, row in enumerate(bundle["manifest"]["rows"]) if row["row_id"] == row_id), None)
        require(index is not None, "prefix predecessor absent from roster")
        require(authorization["path"] == f"gates/prefix-{row_id}.json", "prefix authorization path")
        _gate, validated_raw = validate_pass_prefix_gate(bundle, run_root, index)
        require(validated_raw == raw, "prefix authorization/full validation join")


def subject_command(
    codex_path: Path,
    runtime: dict[str, Any],
    row: dict[str, Any],
    temp_dir: str,
    last_message_path: Path,
) -> list[str]:
    """Build the exact host-validated argv; Canary 003 deliberately omits provider output-schema attachment."""

    return [
        str(codex_path), "exec", "--strict-config", "-C", temp_dir,
        "--skip-git-repo-check", "--ignore-user-config", "--ignore-rules",
        "--sandbox", runtime["sandbox"], "--color", "never", "--json",
        "-m", row["model"], "-c", f'model_reasoning_effort="{row["reasoning_effort"]}"',
        "-c", "suppress_unstable_features_warning=true",
        "-o", str(last_message_path), "-",
    ]


def run_row(
    bundle: dict[str, Any],
    row: dict[str, Any],
    run_root: Path,
    snapshot_root: Path,
    launch_authorization: dict[str, Any],
) -> dict[str, Any]:
    manifest = bundle["manifest"]
    prepared = bundle["prepared_rows"][row["row_id"]]
    row_root = run_root / "rows" / row["row_id"]
    require(not row_root.exists(), f"row already exists: {row['row_id']}")
    require(not snapshot_errors(snapshot_root, manifest), "snapshot drift before row launch")
    validate_launch_authorization(bundle, run_root, row, launch_authorization)
    row_root.mkdir(mode=0o755, parents=True)
    fsync_directory(row_root.parent)

    prompt_raw = prepared["prompt"].encode("utf-8")
    exclusive_bytes(row_root / "submitted_user_prompt.txt", prompt_raw, mode=0o444)
    last = row_root / "last_message.txt"
    runtime = manifest["runtime"]
    codex_home = Path(runtime["codex_home"])

    stdout = b""
    stderr = b""
    timed_out = False
    process: subprocess.Popen[bytes] | None = None
    with tempfile.TemporaryDirectory(
        prefix=f"r10-{manifest['run_id']}-{row['row_id']}-",
        dir=runtime["temporary_root"],
    ) as temp_dir:
        command = subject_command(bundle["codex_path"], runtime, row, temp_dir, last)
        attempt = {
            "schema_id": "pm.r10.attempt.v1",
            "run_id": manifest["run_id"],
            "row_id": row["row_id"],
            "unit_id": prepared["capsule"]["unit_id"],
            "route_id": row["route_id"],
            "attempt": 0,
            "nonce": row["nonce"],
            "manifest_sha256": bundle["manifest_sha256"],
            "submitted_user_prompt_sha256": prepared["metrics"]["prompt_sha256"],
            "submitted_user_prompt_utf8_bytes": prepared["metrics"]["prompt_utf8_bytes"],
            "codex_binary": bundle["codex_record"],
            "argv": command,
            "environment": runtime["environment"],
            "timeout_seconds": runtime["timeout_seconds"],
            "launch_authorization": launch_authorization,
            "started_at_unix_ms": int(time.time() * 1000),
            "retry": False,
            "replacement": False,
            "qualification_credit": 0,
        }
        exclusive_json(row_root / "attempt.json", attempt)
        started = time.monotonic()
        observed_codex = require_live_binary_identity(bundle["codex_path"], bundle["codex_record"])
        process = subprocess.Popen(
            command,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=temp_dir,
            env=runtime["environment"],
        )
        launch_receipt = {
            "schema_id": "pm.r10.launch_receipt.v1",
            "run_id": manifest["run_id"],
            "row_id": row["row_id"],
            "route_id": row["route_id"],
            "attempt": 0,
            "manifest_sha256": bundle["manifest_sha256"],
            "pid": process.pid,
            "codex_binary": observed_codex,
            "argv": command,
            "launch_authorization": launch_authorization,
            "started_at_unix_ms": attempt["started_at_unix_ms"],
            "popen_returned_at_unix_ms": int(time.time() * 1000),
            "status": "POPEN_RETURNED_LAUNCH_OBSERVED",
            "qualification_credit": 0,
        }
        try:
            exclusive_json(row_root / "launch_receipt.json", launch_receipt)
            try:
                stdout, stderr = process.communicate(input=prompt_raw, timeout=runtime["timeout_seconds"])
            except subprocess.TimeoutExpired:
                timed_out = True
                terminate(process)
                stdout, stderr = process.communicate()
        except Exception as exc:
            raise_post_popen_failure(process, row["row_id"], exc)
        elapsed_ms = int((time.monotonic() - started) * 1000)

    exclusive_bytes(row_root / "stdout.jsonl", stdout)
    exclusive_bytes(row_root / "stderr.bin", stderr)
    thread_id = parse_thread_id(stdout)
    rollout_capture: dict[str, Any] | None = None
    rollout_error: str | None = None
    if thread_id:
        try:
            rollout_path = locate_rollout(codex_home, thread_id)
            raw = rollout_path.read_bytes()
            compressed = gzip.compress(raw, compresslevel=9, mtime=0)
            exclusive_bytes(row_root / "rollout.jsonl.gz", compressed, mode=0o444)
            rollout_capture = {
                "raw_sha256": contract.sha256(raw),
                "raw_bytes": len(raw),
                "gzip_sha256": contract.sha256(compressed),
                "gzip_bytes": len(compressed),
            }
        except (OSError, RunnerError) as exc:
            rollout_error = str(exc)

    last_capture: dict[str, Any] | None = None
    if last.is_file():
        raw = last.read_bytes()
        last_capture = {"sha256": contract.sha256(raw), "bytes": len(raw)}
    integrity_errors = snapshot_errors(snapshot_root, manifest)
    receipt = {
        "schema_id": "pm.r10.process_capture.v1",
        "run_id": manifest["run_id"],
        "row_id": row["row_id"],
        "route_id": row["route_id"],
        "attempt": 0,
        "manifest_sha256": bundle["manifest_sha256"],
        "thread_id": thread_id,
        "pid": process.pid if process else None,
        "returncode": process.returncode if process else None,
        "timed_out": timed_out,
        "elapsed_ms": elapsed_ms,
        "stdin_submission_count": 1,
        "stdin_closed": True,
        "stdout_sha256": contract.sha256(stdout),
        "stdout_bytes": len(stdout),
        "stderr_sha256": contract.sha256(stderr),
        "stderr_bytes": len(stderr),
        "last_message": last_capture,
        "rollout": rollout_capture,
        "rollout_error": rollout_error,
        "snapshot_integrity_after": "PASS" if not integrity_errors else "FAIL",
        "snapshot_integrity_errors": integrity_errors,
        "status": "CAPTURED_UNVERIFIED",
        "qualification_credit": 0,
    }
    exclusive_json(row_root / "process_capture.json", receipt)
    return receipt


def run_prefix_gate(
    bundle: dict[str, Any],
    row: dict[str, Any],
    run_root: Path,
    snapshot_root: Path,
) -> dict[str, Any]:
    require(not snapshot_errors(snapshot_root, bundle["manifest"]), "snapshot drift before prefix verification")
    gate_root = run_root / "gates"
    verifier = snapshot_root / "r10_verify.py"
    command = [
        bundle["manifest"]["controller_runtime"]["python_executable"],
        "-B",
        str(verifier),
        "--evidence-root",
        str(run_root),
        "--prefix-row",
        row["row_id"],
        "--write-prefix-receipt",
    ]
    result = subprocess.run(
        command,
        cwd=bundle["manifest"]["runtime"]["temporary_root"],
        env=bundle["manifest"]["runtime"]["environment"],
        capture_output=True,
        check=False,
        timeout=120,
    )
    stdout_path = gate_root / f"prefix-{row['row_id']}.stdout.jsonl"
    stderr_path = gate_root / f"prefix-{row['row_id']}.stderr.bin"
    exclusive_bytes(stdout_path, result.stdout, mode=0o444)
    exclusive_bytes(stderr_path, result.stderr, mode=0o444)

    gate_path = gate_root / f"prefix-{row['row_id']}.json"
    validation_error: str | None = None
    gate: dict[str, Any] | None = None
    gate_raw: bytes | None = None
    try:
        require(gate_path.is_file(), "prefix verifier did not write a gate receipt")
        gate_raw = gate_path.read_bytes()
        value = contract.load_json_bytes(gate_raw, f"prefix gate {row['row_id']}")
        require(isinstance(value, dict), "prefix gate is not an object")
        require(gate_raw == contract.canonical_bytes(value) + b"\n", "prefix gate not canonical")
        require(result.stdout == gate_raw, "prefix stdout/receipt mismatch")
        require(result.stderr == b"", "prefix verifier stderr")
        require(result.returncode == 0, "prefix verifier nonzero")
        require(value.get("schema_id") == "pm.r10.prefix_gate.v1", "prefix gate schema")
        require(value.get("run_id") == bundle["manifest"]["run_id"], "prefix gate run identity")
        require(value.get("manifest_sha256") == bundle["manifest_sha256"], "prefix gate manifest identity")
        require(value.get("through_row_id") == row["row_id"] and value.get("through_route_id") == row["route_id"], "prefix gate row/route")
        require(value.get("status") == "PASS_PREFIX_FOR_NEXT_LAUNCH_ZERO_CREDIT", "prefix gate status")
        require(value.get("qualification_credit") == 0 and value.get("qualification_streak") == 0, "prefix gate credit")
        gate = value
    except Exception as exc:
        validation_error = f"{type(exc).__name__}: {exc}"

    process_receipt = {
        "schema_id": "pm.r10.prefix_gate_process.v1",
        "run_id": bundle["manifest"]["run_id"],
        "manifest_sha256": bundle["manifest_sha256"],
        "row_id": row["row_id"],
        "route_id": row["route_id"],
        "argv": command,
        "returncode": result.returncode,
        "stdout_sha256": contract.sha256(result.stdout),
        "stdout_bytes": len(result.stdout),
        "stderr_sha256": contract.sha256(result.stderr),
        "stderr_bytes": len(result.stderr),
        "gate_sha256": contract.sha256(gate_raw) if gate_raw is not None else None,
        "validation_error": validation_error,
        "status": "PASS" if gate is not None else "FAIL_BLOCK_NEXT_LAUNCH",
        "qualification_credit": 0,
    }
    exclusive_json(gate_root / f"prefix-{row['row_id']}.process.json", process_receipt)
    if gate is None or gate_raw is None:
        return {"passed": False, "error": validation_error or "prefix gate invalid"}
    return {
        "passed": True,
        "gate": gate,
        "gate_sha256": contract.sha256(gate_raw),
        "authorization": {
            "kind": "prefix_gate",
            "path": gate_path.relative_to(run_root).as_posix(),
            "sha256": contract.sha256(gate_raw),
            "predecessor_row_id": row["row_id"],
        },
    }


def next_launch_authorization(gate_result: dict[str, Any], predecessor_row: dict[str, Any]) -> dict[str, Any]:
    require(gate_result.get("passed") is True, "prefix gate did not authorize another launch")
    gate = gate_result.get("gate")
    authorization = gate_result.get("authorization")
    gate_sha = gate_result.get("gate_sha256")
    require(isinstance(gate, dict) and gate.get("status") == "PASS_PREFIX_FOR_NEXT_LAUNCH_ZERO_CREDIT", "prefix PASS receipt")
    require(gate.get("through_row_id") == predecessor_row["row_id"] and gate.get("through_route_id") == predecessor_row["route_id"], "prefix predecessor row/route")
    require(isinstance(gate_sha, str) and re.fullmatch(r"[0-9a-f]{64}", gate_sha) is not None, "prefix gate hash")
    require(isinstance(authorization, dict), "prefix launch authorization")
    require(authorization == {
        "kind": "prefix_gate",
        "path": f"gates/prefix-{predecessor_row['row_id']}.json",
        "sha256": gate_sha,
        "predecessor_row_id": predecessor_row["row_id"],
    }, "prefix launch authorization drift")
    return authorization


def execute_fail_stopped_rows(
    bundle: dict[str, Any],
    evidence_root: Path,
    snapshot_root: Path,
    initial_authorization: dict[str, Any],
    *,
    row_runner: Any = run_row,
    prefix_runner: Any = run_prefix_gate,
) -> dict[str, Any]:
    captures: list[dict[str, Any]] = []
    prefix_gate_sha256_by_row: dict[str, str] = {}
    post_popen_failure_row_ids: list[str] = []
    launch_authorization = initial_authorization
    stop_reason: str | None = None
    for row in bundle["manifest"]["rows"]:
        try:
            capture = row_runner(bundle, row, evidence_root, snapshot_root, launch_authorization)
            captures.append(capture)
            gate_result = prefix_runner(bundle, row, evidence_root, snapshot_root)
            if not gate_result["passed"]:
                stop_reason = f"prefix gate failed for {row['row_id']}: {gate_result['error']}"
                break
            prefix_gate_sha256_by_row[row["row_id"]] = gate_result["gate_sha256"]
            launch_authorization = next_launch_authorization(gate_result, row)
        except Exception as exc:  # Preserve consumed first-attempt evidence; never retry or replace.
            stop_reason = f"{type(exc).__name__}: {exc}"
            launch_path = evidence_root / "rows" / row["row_id"] / "launch_receipt.json"
            popen_observed = isinstance(exc, PostPopenRunnerError) or launch_path.exists()
            observed_pid: int | None = exc.pid if isinstance(exc, PostPopenRunnerError) else None
            if popen_observed and observed_pid is None:
                try:
                    launch_value, _launch_raw = canonical_record(launch_path, f"launch receipt {row['row_id']}")
                    candidate_pid = launch_value.get("pid")
                    if isinstance(candidate_pid, int) and not isinstance(candidate_pid, bool) and candidate_pid > 0:
                        observed_pid = candidate_pid
                except Exception:
                    pass
            if popen_observed:
                post_popen_failure_row_ids.append(row["row_id"])
            failure = {
                "schema_id": "pm.r10.runner_failure.v1",
                "run_id": bundle["manifest"]["run_id"],
                "row_id": row["row_id"],
                "route_id": row["route_id"],
                "attempt": 0,
                "manifest_sha256": bundle["manifest_sha256"],
                "popen_observed": popen_observed,
                "pid": observed_pid,
                "error": stop_reason,
                "status": "FAIL_CONSUMED_OR_CONTROLLER_INVALID_NO_RETRY",
                "qualification_credit": 0,
            }
            failure_path = evidence_root / "rows" / row["row_id"] / "runner_failure.json"
            if not failure_path.exists():
                failure_path.parent.mkdir(mode=0o755, parents=True, exist_ok=True)
                exclusive_json(failure_path, failure)
            captures.append(failure)
            break
    return {
        "captures": captures,
        "prefix_gate_sha256_by_row": prefix_gate_sha256_by_row,
        "post_popen_failure_row_ids": post_popen_failure_row_ids,
        "stop_reason": stop_reason,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--manifest-commitment", type=Path, required=True)
    parser.add_argument("--evidence-root", type=Path, required=True)
    args = parser.parse_args(argv)
    try:
        evidence_root = require_designated_evidence_root(args.evidence_root)
        require(not evidence_root.exists(), "evidence root already exists")

        # Compile every route, scorer, byte binding, and runtime invariant before Popen.
        bundle = preflight_manifest(args.manifest, args.manifest_commitment)
        bundle["git_custody"] = verify_pushed_git_custody(bundle, args.manifest, args.manifest_commitment)
        evidence_root.mkdir(mode=0o755, parents=True)
        fsync_directory(evidence_root.parent)
        snapshot_root = snapshot_bundle(bundle, evidence_root)

        rows = bundle["manifest"]["rows"]
        preflight_path = evidence_root / "preflight_receipt.json"
        launch_authorization = {
            "kind": "pushed_preflight",
            "path": preflight_path.relative_to(evidence_root).as_posix(),
            "sha256": contract.sha256(preflight_path.read_bytes()),
            "predecessor_row_id": None,
        }
        sequence = execute_fail_stopped_rows(bundle, evidence_root, snapshot_root, launch_authorization)
        prefix_gate_sha256_by_row = sequence["prefix_gate_sha256_by_row"]
        post_popen_failure_row_ids = sequence["post_popen_failure_row_ids"]
        stop_reason = sequence["stop_reason"]
        attempted_row_ids = [row["row_id"] for row in rows if (evidence_root / "rows" / row["row_id"] / "attempt.json").is_file()]
        launched_row_ids: list[str] = []
        for row in rows:
            path = evidence_root / "rows" / row["row_id"] / "launch_receipt.json"
            if not path.is_file():
                continue
            try:
                launch, _raw = canonical_record(path, f"launch receipt {row['row_id']}")
                require(launch.get("schema_id") == "pm.r10.launch_receipt.v1", "launch receipt schema")
                require(launch.get("run_id") == bundle["manifest"]["run_id"] and launch.get("manifest_sha256") == bundle["manifest_sha256"], "launch receipt run/manifest")
                require(launch.get("row_id") == row["row_id"] and launch.get("route_id") == row["route_id"], "launch receipt row/route")
                require(launch.get("status") == "POPEN_RETURNED_LAUNCH_OBSERVED" and isinstance(launch.get("pid"), int) and launch["pid"] > 0, "launch receipt observation")
                launched_row_ids.append(row["row_id"])
            except Exception:
                continue
        captured_row_ids = [row["row_id"] for row in rows if (evidence_root / "rows" / row["row_id"] / "process_capture.json").is_file()]
        prefix_passed_row_ids = [row["row_id"] for row in rows if row["row_id"] in prefix_gate_sha256_by_row]
        launch_lower_bound_row_ids = [row["row_id"] for row in rows if row["row_id"] in set(launched_row_ids) | set(post_popen_failure_row_ids)]
        launch_count_exact = all(row_id in launched_row_ids for row_id in post_popen_failure_row_ids)
        unconsumed_row_ids = [row["row_id"] for row in rows if row["row_id"] not in launch_lower_bound_row_ids]
        complete = len(prefix_passed_row_ids) == len(rows) == len(CANARY_ROSTER) and not stop_reason and launch_count_exact
        if complete:
            status = "CAPTURE_COMPLETE_PENDING_FINAL_VERIFICATION_ZERO_CREDIT"
        elif post_popen_failure_row_ids:
            status = "FAIL_CONTROLLER_AFTER_LAUNCH_ZERO_CREDIT_NO_RETRY"
        elif launched_row_ids:
            status = "FAIL_CONSUMED_PREFIX_ZERO_CREDIT_NO_RETRY"
        else:
            status = "FAIL_PRELAUNCH_ZERO_SUBJECT"
        summary = {
            "schema_id": "pm.r10.run_capture_summary.v2",
            "run_id": bundle["manifest"]["run_id"],
            "manifest_sha256": bundle["manifest_sha256"],
            "row_count": len(rows),
            "attempt_count": len(attempted_row_ids),
            "subject_launch_count": len(launched_row_ids),
            "subject_launch_count_exact": launch_count_exact,
            "subject_launch_lower_bound": len(launch_lower_bound_row_ids),
            "capture_count": len(captured_row_ids),
            "prefix_pass_count": len(prefix_passed_row_ids),
            "attempted_row_ids": attempted_row_ids,
            "launched_row_ids": launched_row_ids,
            "launch_lower_bound_row_ids": launch_lower_bound_row_ids,
            "post_popen_failure_row_ids": post_popen_failure_row_ids,
            "captured_row_ids": captured_row_ids,
            "prefix_passed_row_ids": prefix_passed_row_ids,
            "unconsumed_row_ids": unconsumed_row_ids,
            "unconsumed_dispositions": [
                {"row_id": row_id, "status": "NOT_LAUNCHED_AFTER_CANARY_FAILURE"}
                for row_id in unconsumed_row_ids
            ],
            "prefix_gate_sha256_by_row": prefix_gate_sha256_by_row,
            "stop_reason": stop_reason,
            "status": status,
            "qualification_credit": 0,
            "qualification_streak": 0,
        }
        exclusive_json(evidence_root / "capture_summary.json", summary)
        sys.stdout.buffer.write(contract.canonical_bytes(summary) + b"\n")
        return 0 if complete else 1
    except Exception as exc:
        failure = {
            "schema_id": "pm.r10.runner_terminal.v1",
            "status": "FAIL_NO_LAUNCH_OR_PARTIAL_CAPTURE",
            "error": f"{type(exc).__name__}: {exc}",
            "qualification_credit": 0,
        }
        sys.stdout.buffer.write(contract.canonical_bytes(failure) + b"\n")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
