#!/usr/bin/env python3
"""Once-only R10 Codex canary runner. Captures bytes; grants no semantic credit."""

from __future__ import annotations

import argparse
import gzip
import hashlib
import json
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

CANARY_ROSTER = {
    "alpha": ("gpt-5.4-mini", "xhigh"),
    "bravo": ("gpt-5.4-mini", "medium"),
    "charlie": ("gpt-5.6-luna", "medium"),
}
CANARY_FROZEN_PATHS = {
    "ARCHITECTURE.md",
    "prompt_capsule.schema.json",
    "r10_contract.py",
    "r10_runner.py",
    "r10_verify.py",
    "r10_selftest.py",
    "workflow_coverage.json",
    "canary/response.schema.json",
    "canary/capsule.json",
    "canary/oracle.json",
}
CANARY_ACCEPTANCE = {
    "external_user_submission_count_per_row": 1,
    "goal_create_count_per_row": 1,
    "goal_terminal_count_per_row": 1,
    "same_goal_thread_identity": True,
    "activation_before_semantic_result": True,
    "actual_tool_calls_subset": ["create_goal", "get_goal", "update_goal"],
    "filesystem_writes_by_subject": 0,
    "network_calls_by_subject": 0,
    "schema_validation": "strict",
    "semantic_score": "exact_json_value",
    "required_pass": 3,
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


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RunnerError(message)


def identity_bytes(relative: str, raw: bytes) -> dict[str, Any]:
    return {"path": relative, "utf8_bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest()}


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
    require(manifest.get("run_id") == "r10-codex-canary-001", "run identity")
    require(manifest.get("kind") == "three_route_codex_canary", "canary kind")
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
    require(isinstance(rows, list) and len(rows) == 3, "canary must contain exactly three rows")
    require([row.get("route_id") for row in rows] == list(CANARY_ROSTER), "route order/set drift")
    require(len({row.get("row_id") for row in rows}) == 3, "row IDs not unique")
    require(len({row.get("nonce") for row in rows}) == 3, "nonces not unique")
    require(all(isinstance(row.get("nonce"), str) and re.fullmatch(r"[0-9a-f]{32}", row["nonce"]) for row in rows), "nonce format")
    for row in rows:
        route = row["route_id"]
        model, effort = CANARY_ROSTER[route]
        require(row.get("row_id") == f"row-{route}-000", f"row identity drift: {route}")
        require(row.get("model") == model and row.get("reasoning_effort") == effort, f"route binding drift: {route}")


def preflight_manifest(manifest_path: Path, commitment_path: Path) -> dict[str, Any]:
    manifest_path = manifest_path.resolve()
    commitment_path = commitment_path.resolve()
    require(manifest_path == ROOT or ROOT in manifest_path.parents, "manifest outside R10")
    require(commitment_path == ROOT or ROOT in commitment_path.parents, "commitment outside R10")
    manifest_relative = manifest_path.relative_to(ROOT).as_posix()
    manifest_raw = manifest_path.read_bytes()
    manifest = contract.load_json_bytes(manifest_raw, "manifest")
    commitment, commitment_raw = load_commitment(commitment_path, manifest_relative, manifest_raw)
    validate_static_manifest(manifest)

    require(manifest.get("schema_id") == "pm.r10.run_manifest.v1", "manifest schema")
    require(manifest.get("run_id") == "r10-codex-canary-001", "run identity")
    require(manifest.get("kind") == "three_route_codex_canary", "canary kind")
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
    require(codex_path.is_file() and os.access(codex_path, os.X_OK), "Codex binary missing or not executable")
    codex_raw = codex_path.read_bytes()
    observed_codex = {"path": str(codex_path), "bytes": len(codex_raw), "sha256": contract.sha256(codex_raw)}
    require(observed_codex == codex_record, "Codex binary drift")
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
    require(isinstance(rows, list) and len(rows) == 3, "canary must contain exactly three rows")
    require([row.get("route_id") for row in rows] == list(CANARY_ROSTER), "route order/set drift")
    require(len({row.get("row_id") for row in rows}) == 3, "row IDs not unique")
    require(len({row.get("nonce") for row in rows}) == 3, "nonces not unique")
    require(all(isinstance(row.get("nonce"), str) and re.fullmatch(r"[0-9a-f]{32}", row["nonce"]) for row in rows), "nonce format")

    oracle_path = manifest.get("oracle_path")
    require(oracle_path == "canary/oracle.json" and oracle_path in frozen_bytes, "oracle binding")
    oracle = contract.load_json_bytes(frozen_bytes[oracle_path], "oracle")
    capsule_schema = contract.load_json_bytes(frozen_bytes["prompt_capsule.schema.json"], "capsule schema")
    jsonschema.Draft202012Validator.check_schema(capsule_schema)
    prepared_rows: dict[str, dict[str, Any]] = {}
    unit_ids: set[str] = set()
    for row in rows:
        route = row["route_id"]
        model, effort = CANARY_ROSTER[route]
        require(row.get("row_id") == f"row-{route}-000", f"row identity drift: {route}")
        require(row.get("model") == model and row.get("reasoning_effort") == effort, f"route binding drift: {route}")
        require(row.get("capsule_path") == "canary/capsule.json", f"capsule binding drift: {route}")
        require(row.get("response_schema_path") == "canary/response.schema.json", f"response schema binding drift: {route}")
        capsule = contract.load_json_bytes(frozen_bytes[row["capsule_path"]], f"capsule {route}")
        prompt, metrics = contract.render_prompt(capsule, "codex", capsule_schema)
        require(row.get("capsule_sha256") == metrics["capsule_sha256"], f"capsule hash drift: {route}")
        require(row.get("submitted_user_prompt_sha256") == metrics["prompt_sha256"], f"prompt hash drift: {route}")
        require(row.get("submitted_user_prompt_utf8_bytes") == metrics["prompt_utf8_bytes"], f"prompt size drift: {route}")
        response_schema = contract.load_json_bytes(frozen_bytes[row["response_schema_path"]], f"response schema {route}")
        jsonschema.Draft202012Validator.check_schema(response_schema)
        require(contract.canonical_bytes(response_schema) == contract.canonical_bytes(capsule["output_contract"]["inline_schema"]), f"inline/external schema mismatch: {route}")
        unit_id = capsule["unit_id"]
        unit_ids.add(unit_id)
        require(unit_id in oracle, f"oracle missing unit: {unit_id}")
        jsonschema.Draft202012Validator(response_schema).validate(oracle[unit_id])
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
    for line in stdout.splitlines():
        try:
            value = json.loads(line)
        except json.JSONDecodeError:
            continue
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


def run_row(bundle: dict[str, Any], row: dict[str, Any], run_root: Path, snapshot_root: Path) -> dict[str, Any]:
    manifest = bundle["manifest"]
    prepared = bundle["prepared_rows"][row["row_id"]]
    row_root = run_root / "rows" / row["row_id"]
    require(not row_root.exists(), f"row already exists: {row['row_id']}")
    require(not snapshot_errors(snapshot_root, manifest), "snapshot drift before row launch")
    row_root.mkdir(mode=0o755, parents=True)
    fsync_directory(row_root.parent)

    prompt_raw = prepared["prompt"].encode("utf-8")
    exclusive_bytes(row_root / "submitted_user_prompt.txt", prompt_raw, mode=0o444)
    last = row_root / "last_message.txt"
    response_schema = snapshot_root / row["response_schema_path"]
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
        command = [
            str(bundle["codex_path"]), "exec", "--strict-config", "-C", temp_dir,
            "--skip-git-repo-check", "--ignore-user-config", "--ignore-rules",
            "--sandbox", runtime["sandbox"], "--color", "never", "--json",
            "-m", row["model"], "-c", f'model_reasoning_effort="{row["reasoning_effort"]}"',
            "-c", "suppress_unstable_features_warning=true",
            "--output-schema", str(response_schema), "-o", str(last), "-",
        ]
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
            "argv": command,
            "environment": runtime["environment"],
            "timeout_seconds": runtime["timeout_seconds"],
            "started_at_unix_ms": int(time.time() * 1000),
            "retry": False,
            "replacement": False,
            "qualification_credit": 0,
        }
        exclusive_json(row_root / "attempt.json", attempt)
        started = time.monotonic()
        process = subprocess.Popen(
            command,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=temp_dir,
            env=runtime["environment"],
        )
        try:
            stdout, stderr = process.communicate(input=prompt_raw, timeout=runtime["timeout_seconds"])
        except subprocess.TimeoutExpired:
            timed_out = True
            terminate(process)
            stdout, stderr = process.communicate()
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


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--manifest-commitment", type=Path, required=True)
    parser.add_argument("--evidence-root", type=Path, required=True)
    args = parser.parse_args(argv)
    try:
        evidence_root = args.evidence_root.resolve()
        require(evidence_root == ROOT or ROOT in evidence_root.parents, "evidence outside R10")
        require(not evidence_root.exists(), "evidence root already exists")

        # Compile every route, scorer, byte binding, and runtime invariant before Popen.
        bundle = preflight_manifest(args.manifest, args.manifest_commitment)
        bundle["git_custody"] = verify_pushed_git_custody(bundle, args.manifest, args.manifest_commitment)
        evidence_root.mkdir(mode=0o755, parents=True)
        fsync_directory(evidence_root.parent)
        snapshot_root = snapshot_bundle(bundle, evidence_root)

        captures: list[dict[str, Any]] = []
        subject_launch_count = 0
        for row in bundle["manifest"]["rows"]:
            try:
                capture = run_row(bundle, row, evidence_root, snapshot_root)
                subject_launch_count += 1
                captures.append(capture)
                if capture["snapshot_integrity_after"] != "PASS":
                    break
            except Exception as exc:  # Preserve consumed first-attempt evidence; never retry or replace.
                failure = {
                    "schema_id": "pm.r10.runner_failure.v1",
                    "run_id": bundle["manifest"]["run_id"],
                    "row_id": row["row_id"],
                    "error": f"{type(exc).__name__}: {exc}",
                    "status": "FAIL_CONSUMED_OR_CONTROLLER_INVALID_NO_RETRY",
                    "qualification_credit": 0,
                }
                failure_path = evidence_root / "rows" / row["row_id"] / "runner_failure.json"
                if not failure_path.exists():
                    exclusive_json(failure_path, failure)
                captures.append(failure)
                break
        summary = {
            "schema_id": "pm.r10.run_capture_summary.v1",
            "run_id": bundle["manifest"]["run_id"],
            "row_count": len(bundle["manifest"]["rows"]),
            "capture_count": len(captures),
            "subject_launch_count": subject_launch_count,
            "status": "TERMINAL_UNVERIFIED",
            "qualification_credit": 0,
        }
        exclusive_json(evidence_root / "capture_summary.json", summary)
        sys.stdout.buffer.write(contract.canonical_bytes(summary) + b"\n")
        return 0
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
