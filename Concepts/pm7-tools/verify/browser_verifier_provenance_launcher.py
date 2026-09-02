#!/usr/bin/env python3
"""External trust-root launcher for PM7 browser-concept provenance runs.

This module intentionally uses only the Python standard library.  It validates
every externally pinned denominator before Node or Playwright starts, stages the
exact verifier/helper/Playwright bytes in a private directory, passes stable
artifact/browser descriptors to the child, binds an independently issued
OS-egress receipt to the current network namespace, and always writes a durable
launcher result or failure receipt.

The launcher does not claim native Slint or production certification.  It also
does not claim to create a firewall: a certifying run requires an independently
issued, hash-pinned network-boundary receipt for the namespace in which both the
launcher and child execute.

Invocation contract:
  1. Invoke a direct, externally pinned Python executable (not a symlink) with
     ``-I -S -E`` and this launcher's externally pinned absolute path.
  2. Compute Playwright/browser package denominators with the ``manifest``
     subcommand. The content manifest intentionally excludes mode bits so the
     private read-only stage has the same byte/path identity as its source.
  3. Invoke ``run`` with every required ``--expected-*`` denominator and a
     separately issued network-boundary receipt/digest. Optional verifier-only
     pairs are supplied as one strict JSON array through
     ``--verifier-extra-args-json`` (for example
     ``["--focused-smoke","on"]``); protected provenance arguments cannot be
     overridden.

The outer caller is the trust root for the direct Python binary, launcher bytes,
expected digests, and network-boundary receipt digest. This module closes all
subsequent preload gaps it can bind portably; it never represents its own
post-load hash check as an independent outer trust root.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import secrets
import stat
import subprocess
import sys
import tempfile
import time
from pathlib import Path
from typing import Any, Iterable


SCHEMA_VERSION = "2.0.0"
LAUNCH_RECEIPT_SCHEMA = "pm.browser_verifier_provenance.launch_receipt.v2"
LAUNCH_RESULT_SCHEMA = "pm.browser_verifier_provenance.launch_result.v2"
NETWORK_BOUNDARY_SCHEMA = "pm.browser_verifier_network_boundary.v1"
DIGEST_LENGTH = 64
O_NOFOLLOW = getattr(os, "O_NOFOLLOW", 0)
O_DIRECTORY = getattr(os, "O_DIRECTORY", 0)


class LaunchError(RuntimeError):
    def __init__(self, message: str, *, stage: str, details: Any = None):
        super().__init__(message)
        self.stage = stage
        self.details = details


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def canonical_bytes(value: Any) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")


def is_digest(value: Any) -> bool:
    return isinstance(value, str) and len(value) == DIGEST_LENGTH and all(character in "0123456789abcdef" for character in value)


def require_digest(name: str, value: str) -> str:
    if not is_digest(value):
        raise LaunchError(f"{name} must be a lowercase SHA-256 digest", stage="argv")
    return value


def stat_record(value: os.stat_result) -> dict[str, Any]:
    return {
        "device": value.st_dev,
        "inode": value.st_ino,
        "mode": value.st_mode,
        "size_bytes": value.st_size,
        "mtime_ns": value.st_mtime_ns,
        "ctime_ns": value.st_ctime_ns,
    }


def same_stat(left: dict[str, Any], right: dict[str, Any]) -> bool:
    return all(left.get(key) == right.get(key) for key in ("device", "inode", "mode", "size_bytes", "mtime_ns", "ctime_ns"))


def absolute_path(raw: str) -> str:
    if not isinstance(raw, str) or not raw:
        raise LaunchError("path must be a non-empty string", stage="path")
    return os.path.abspath(raw)


def open_directory_no_symlinks(raw: str) -> int:
    target = absolute_path(raw)
    components = [part for part in target.split(os.sep) if part]
    current_fd = os.open(os.sep, os.O_RDONLY | O_DIRECTORY)
    try:
        for component in components:
            next_fd = os.open(component, os.O_RDONLY | O_DIRECTORY | O_NOFOLLOW, dir_fd=current_fd)
            current_stat = os.fstat(next_fd)
            if not stat.S_ISDIR(current_stat.st_mode):
                os.close(next_fd)
                raise LaunchError(f"non-directory path component: {target}", stage="path")
            os.close(current_fd)
            current_fd = next_fd
        return current_fd
    except Exception:
        os.close(current_fd)
        raise


def open_file_no_symlinks(raw: str, *, executable: bool = False) -> tuple[int, dict[str, Any], bytes]:
    target = absolute_path(raw)
    parent_fd = open_directory_no_symlinks(os.path.dirname(target))
    try:
        descriptor = os.open(os.path.basename(target), os.O_RDONLY | O_NOFOLLOW, dir_fd=parent_fd)
    finally:
        os.close(parent_fd)
    try:
        before = os.fstat(descriptor)
        if not stat.S_ISREG(before.st_mode):
            raise LaunchError(f"not a regular file: {target}", stage="path")
        if executable and not before.st_mode & 0o111:
            raise LaunchError(f"not executable: {target}", stage="path")
        chunks: list[bytes] = []
        offset = 0
        while True:
            chunk = os.pread(descriptor, 1024 * 1024, offset)
            if not chunk:
                break
            chunks.append(chunk)
            offset += len(chunk)
        after = os.fstat(descriptor)
        if not same_stat(stat_record(before), stat_record(after)):
            raise LaunchError(f"file changed while read: {target}", stage="path")
        return descriptor, stat_record(before), b"".join(chunks)
    except Exception:
        os.close(descriptor)
        raise


def binding_from_open_file(label: str, path: str, expected_sha256: str, *, executable: bool = False) -> tuple[int, dict[str, Any], bytes]:
    descriptor, file_stat, content = open_file_no_symlinks(path, executable=executable)
    actual = sha256_bytes(content)
    if actual != require_digest(f"expected {label} SHA-256", expected_sha256):
        os.close(descriptor)
        raise LaunchError(
            f"{label} SHA-256 mismatch",
            stage="denominator",
            details={"path": absolute_path(path), "expected": expected_sha256, "actual": actual},
        )
    return descriptor, {
        "label": label,
        "requested_path": path,
        "absolute_path": absolute_path(path),
        "sha256": actual,
        "expected_sha256": expected_sha256,
        "stat": file_stat,
    }, content


def iter_tree(root: str, *, retain_content: bool) -> tuple[list[dict[str, Any]], dict[str, bytes]]:
    root_path = absolute_path(root)
    root_fd = open_directory_no_symlinks(root_path)
    os.close(root_fd)
    rows: list[dict[str, Any]] = []
    contents: dict[str, bytes] = {}

    def visit(relative_directory: str) -> None:
        current_path = os.path.join(root_path, relative_directory) if relative_directory else root_path
        current_fd = open_directory_no_symlinks(current_path)
        try:
            with os.scandir(current_fd) as iterator:
                entries = sorted(
                    ((entry.name, entry.stat(follow_symlinks=False)) for entry in iterator),
                    key=lambda row: row[0],
                )
        finally:
            os.close(current_fd)
        for entry_name, entry_stat in entries:
            relative = os.path.join(relative_directory, entry_name) if relative_directory else entry_name
            if stat.S_ISLNK(entry_stat.st_mode):
                raise LaunchError(f"tree contains symlink: {os.path.join(root_path, relative)}", stage="tree")
            if stat.S_ISDIR(entry_stat.st_mode):
                rows.append({"path": relative.replace(os.sep, "/"), "kind": "directory", "mode": entry_stat.st_mode})
                visit(relative)
                continue
            if not stat.S_ISREG(entry_stat.st_mode):
                raise LaunchError(f"tree contains non-regular entry: {os.path.join(root_path, relative)}", stage="tree")
            descriptor, file_stat, content = open_file_no_symlinks(os.path.join(root_path, relative))
            os.close(descriptor)
            if not same_stat(stat_record(entry_stat), file_stat):
                raise LaunchError(f"tree entry changed during enumeration: {relative}", stage="tree")
            rows.append({
                "path": relative.replace(os.sep, "/"),
                "kind": "file",
                "mode": file_stat["mode"],
                "size_bytes": len(content),
                "sha256": sha256_bytes(content),
            })
            if retain_content:
                contents[relative] = content

    visit("")
    return rows, contents


def tree_manifest(root: str, *, retain_content: bool = False) -> tuple[dict[str, Any], dict[str, bytes]]:
    rows, contents = iter_tree(root, retain_content=retain_content)
    manifest = {
        "schema_id": "pm.browser_verifier_tree_manifest.v1",
        "root": absolute_path(root),
        "rows": rows,
        "file_count": sum(1 for row in rows if row["kind"] == "file"),
        "directory_count": sum(1 for row in rows if row["kind"] == "directory"),
    }
    digest_rows = [{key: value for key, value in row.items() if key != "mode"} for row in rows]
    manifest["manifest_sha256"] = sha256_bytes(canonical_bytes({
        "schema_id": manifest["schema_id"],
        "rows": digest_rows,
        "file_count": manifest["file_count"],
        "directory_count": manifest["directory_count"],
    }))
    return manifest, contents


def verify_tree_manifest(label: str, root: str, expected: str, *, retain_content: bool = False) -> tuple[dict[str, Any], dict[str, bytes]]:
    manifest, contents = tree_manifest(root, retain_content=retain_content)
    if manifest["manifest_sha256"] != require_digest(f"expected {label} manifest SHA-256", expected):
        raise LaunchError(
            f"{label} manifest SHA-256 mismatch",
            stage="denominator",
            details={"root": absolute_path(root), "expected": expected, "actual": manifest["manifest_sha256"]},
        )
    return manifest, contents


def ensure_output_directory(path: str) -> tuple[str, int]:
    absolute = absolute_path(path)
    try:
        descriptor = open_directory_no_symlinks(absolute)
    except FileNotFoundError as error:
        raise LaunchError("outdir must already exist with no symlink components", stage="outdir", details={"path": absolute}) from error
    return absolute, descriptor


def atomic_write_json(directory_fd: int, filename: str, value: Any) -> str:
    if os.sep in filename or filename in {"", ".", ".."}:
        raise LaunchError("invalid receipt filename", stage="receipt")
    temporary = f".{filename}.{os.getpid()}.{secrets.token_hex(8)}.tmp"
    payload = json.dumps(value, indent=2, sort_keys=True, ensure_ascii=False).encode("utf-8") + b"\n"
    descriptor = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_EXCL | O_NOFOLLOW, 0o600, dir_fd=directory_fd)
    try:
        offset = 0
        while offset < len(payload):
            offset += os.write(descriptor, payload[offset:])
        os.fsync(descriptor)
    finally:
        os.close(descriptor)
    os.replace(temporary, filename, src_dir_fd=directory_fd, dst_dir_fd=directory_fd)
    os.fsync(directory_fd)
    return sha256_bytes(payload)


def load_network_boundary(path: str, expected_sha256: str) -> tuple[dict[str, Any], dict[str, Any]]:
    descriptor, binding, content = binding_from_open_file("network_boundary_receipt", path, expected_sha256)
    os.close(descriptor)
    try:
        receipt = json.loads(content)
    except json.JSONDecodeError as error:
        raise LaunchError("network boundary receipt is invalid JSON", stage="network_boundary") from error
    expected_keys = {
        "schema_id", "schema_version", "receipt_id", "evidence_class", "enforcement", "enforced",
        "loopback_allowed", "loopback_only", "non_loopback_egress_denied", "network_namespace", "issuer"
    }
    if set(receipt) != expected_keys:
        raise LaunchError("network boundary receipt has non-exact keys", stage="network_boundary", details={"keys": sorted(receipt)})
    current_namespace = os.readlink("/proc/self/ns/net") if sys.platform.startswith("linux") else None
    valid = (
        receipt["schema_id"] == NETWORK_BOUNDARY_SCHEMA
        and receipt["schema_version"] == "1.0.0"
        and receipt["evidence_class"] == "independently_verified_os_process_boundary"
        and receipt["enforcement"] in {"linux_network_namespace_firewall", "host_firewall_process_policy"}
        and receipt["enforced"] is True
        and receipt["loopback_allowed"] is True
        and receipt["loopback_only"] is True
        and receipt["non_loopback_egress_denied"] is True
        and isinstance(receipt["receipt_id"], str) and receipt["receipt_id"]
        and isinstance(receipt["issuer"], str) and receipt["issuer"]
        and current_namespace is not None
        and receipt["network_namespace"] == current_namespace
    )
    if not valid:
        raise LaunchError(
            "network boundary receipt does not prove loopback-only enforcement for this namespace",
            stage="network_boundary",
            details={"receipt": receipt, "current_network_namespace": current_namespace},
        )
    return receipt, binding


def copy_stage_file(destination: str, content: bytes, mode: int = 0o400) -> None:
    descriptor = os.open(destination, os.O_WRONLY | os.O_CREAT | os.O_EXCL | O_NOFOLLOW, mode)
    try:
        offset = 0
        while offset < len(content):
            offset += os.write(descriptor, content[offset:])
        os.fsync(descriptor)
    finally:
        os.close(descriptor)


def stage_playwright(stage_root: str, contents: dict[str, bytes], rows: Iterable[dict[str, Any]]) -> tuple[str, str]:
    modules_root = os.path.join(stage_root, "node_modules")
    package_root = os.path.join(modules_root, "playwright-core")
    os.mkdir(modules_root, 0o700)
    os.mkdir(package_root, 0o700)
    directories = [row["path"] for row in rows if row["kind"] == "directory"]
    for relative in sorted(directories, key=lambda value: (value.count("/"), value)):
        os.mkdir(os.path.join(package_root, *relative.split("/")), 0o700)
    for relative, content in sorted(contents.items()):
        copy_stage_file(os.path.join(package_root, relative), content)
    for relative in sorted(directories, key=lambda value: (value.count("/"), value), reverse=True):
        os.chmod(os.path.join(package_root, *relative.split("/")), 0o500)
    os.chmod(package_root, 0o500)
    os.chmod(modules_root, 0o500)
    return modules_root, package_root


def reject_duplicate_or_equals_options(argv: list[str]) -> None:
    seen: set[str] = set()
    for token in argv:
        if token.startswith("--"):
            if "=" in token:
                raise LaunchError(f"equals-form option is not allowed: {token}", stage="argv")
            if token in seen:
                raise LaunchError(f"duplicate option is not allowed: {token}", stage="argv")
            seen.add(token)


def parser() -> argparse.ArgumentParser:
    value = argparse.ArgumentParser(allow_abbrev=False)
    subcommands = value.add_subparsers(dest="operation", required=True)
    manifest = subcommands.add_parser("manifest", allow_abbrev=False)
    manifest.add_argument("--directory", required=True)
    run = subcommands.add_parser("run", allow_abbrev=False)
    for name in (
        "verifier", "helper", "node", "playwright-package", "browser", "browser-package-root", "artifact", "outdir",
        "network-boundary-receipt", "expected-network-boundary-receipt-sha256", "expected-launcher-sha256", "expected-python-sha256", "expected-verifier-sha256",
        "expected-helper-sha256", "expected-node-sha256", "expected-playwright-manifest-sha256",
        "expected-browser-sha256", "expected-browser-package-manifest-sha256", "expected-artifact-sha256"
    ):
        run.add_argument(f"--{name}", required=True)
    run.add_argument("--verifier-extra-args-json", default="[]")
    return value


def verifier_extra_arguments(raw: str) -> list[str]:
    try:
        value = json.loads(raw)
    except json.JSONDecodeError as error:
        raise LaunchError("verifier extra arguments must be valid JSON", stage="argv") from error
    if not isinstance(value, list) or len(value) % 2 != 0 or len(value) > 64:
        raise LaunchError("verifier extra arguments must be a bounded pair-form JSON array", stage="argv")
    protected = {
        "file", "outdir", "modules", "chromium", "expected-artifact-sha256",
        "expected-verifier-sha256", "expected-helper-sha256",
        "provenance-launch-receipt", "expected-launch-receipt-sha256",
    }
    observed: set[str] = set()
    for index in range(0, len(value), 2):
        token, argument = value[index:index + 2]
        if not isinstance(token, str) or not token.startswith("--") or len(token) == 2 or "=" in token:
            raise LaunchError("verifier extra option names must use strict pair-form --name syntax", stage="argv")
        name = token[2:]
        if name in protected or name in observed:
            raise LaunchError(f"verifier extra option collides or duplicates: {token}", stage="argv")
        if not isinstance(argument, str) or not argument or argument.startswith("--") or "\x00" in argument or len(argument) > 8192:
            raise LaunchError(f"verifier extra option has an unsafe value: {token}", stage="argv")
        observed.add(name)
    return value


def launcher_binding(args: argparse.Namespace) -> dict[str, Any]:
    if not sys.platform.startswith("linux"):
        raise LaunchError("certifying launcher process identity currently requires Linux /proc", stage="launcher_identity")
    launcher_path = absolute_path(__file__)
    launcher_fd, launcher_record, _ = binding_from_open_file("launcher", launcher_path, args.expected_launcher_sha256)
    os.close(launcher_fd)
    python_fd, python_record, _ = binding_from_open_file("python_executable", sys.executable, args.expected_python_sha256, executable=True)
    os.close(python_fd)
    process_descriptor = os.open("/proc/self/exe", os.O_RDONLY)
    try:
        process_stat_value = os.fstat(process_descriptor)
        process_bytes_value = b""
        offset = 0
        while True:
            chunk = os.pread(process_descriptor, 1024 * 1024, offset)
            if not chunk:
                break
            process_bytes_value += chunk
            offset += len(chunk)
        process_stat = stat_record(process_stat_value)
        process_bytes = process_bytes_value
    finally:
        os.close(process_descriptor)
    process_sha = sha256_bytes(process_bytes or b"")
    if process_sha != python_record["sha256"]:
        raise LaunchError("running Python executable does not match pinned sys.executable", stage="launcher_identity")
    return {
        "source": launcher_record,
        "python": python_record,
        "running_process": {
            "proc_exe_path": os.readlink("/proc/self/exe") if sys.platform.startswith("linux") else sys.executable,
            "sha256": process_sha,
            "stat": process_stat,
        },
    }


def run_child(args: argparse.Namespace, raw_argv: list[str]) -> int:
    started = time.time_ns()
    output_path, output_fd = ensure_output_directory(args.outdir)
    inherited: list[int] = []
    launch_receipt_path: str | None = None
    child_result: dict[str, Any] | None = None
    stage_root: str | None = None
    try:
        extra_verifier_args = verifier_extra_arguments(args.verifier_extra_args_json)
        launcher = launcher_binding(args)
        artifact_fd, artifact, artifact_bytes = binding_from_open_file("artifact", args.artifact, args.expected_artifact_sha256)
        inherited.append(artifact_fd)
        browser_fd, browser, _ = binding_from_open_file("browser_executable", args.browser, args.expected_browser_sha256, executable=True)
        inherited.append(browser_fd)
        node_fd, node, _ = binding_from_open_file("node_executable", args.node, args.expected_node_sha256, executable=True)
        inherited.append(node_fd)
        verifier_fd, verifier, verifier_bytes = binding_from_open_file("verifier", args.verifier, args.expected_verifier_sha256)
        os.close(verifier_fd)
        helper_fd, helper, helper_bytes = binding_from_open_file("helper", args.helper, args.expected_helper_sha256)
        os.close(helper_fd)
        playwright_manifest, playwright_contents = verify_tree_manifest(
            "playwright", args.playwright_package, args.expected_playwright_manifest_sha256, retain_content=True
        )
        browser_package_manifest, _ = verify_tree_manifest(
            "browser package", args.browser_package_root, args.expected_browser_package_manifest_sha256
        )
        network_receipt, network_binding = load_network_boundary(
            args.network_boundary_receipt,
            args.expected_network_boundary_receipt_sha256,
        )
        stage_root = tempfile.mkdtemp(prefix="pm-browser-provenance-stage-", dir=output_path)
        os.chmod(stage_root, 0o700)
        staged_verifier = os.path.join(stage_root, os.path.basename(verifier["absolute_path"]))
        staged_helper = os.path.join(stage_root, "browser_verifier_provenance.mjs")
        copy_stage_file(staged_verifier, verifier_bytes)
        copy_stage_file(staged_helper, helper_bytes)
        modules_root, staged_playwright_root = stage_playwright(stage_root, playwright_contents, playwright_manifest["rows"])
        staged_manifest, _ = tree_manifest(staged_playwright_root)
        if staged_manifest["manifest_sha256"] != playwright_manifest["manifest_sha256"]:
            raise LaunchError("staged Playwright manifest mismatch", stage="stage")
        nonce = secrets.token_hex(32)
        launch_receipt = {
            "schema_id": LAUNCH_RECEIPT_SCHEMA,
            "schema_version": SCHEMA_VERSION,
            "created_at_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "nonce": nonce,
            "launcher_pid": os.getpid(),
            "launcher_command": {
                "cwd": os.getcwd(),
                "raw_argv": raw_argv,
                "raw_argv_sha256": sha256_bytes(canonical_bytes(raw_argv)),
                "verifier_extra_args": extra_verifier_args,
            },
            "launcher": launcher,
            "stage": {
                "root": stage_root,
                "verifier_path": staged_verifier,
                "helper_path": staged_helper,
                "modules_path": modules_root,
                "playwright_package_path": staged_playwright_root,
                "playwright_manifest_sha256": staged_manifest["manifest_sha256"],
                "playwright_file_count": staged_manifest["file_count"],
            },
            "inputs": {
                "artifact": {**artifact, "inherited_fd": artifact_fd},
                "browser": {**browser, "inherited_fd": browser_fd},
                "node": {**node, "inherited_fd": node_fd},
                "verifier": verifier,
                "helper": helper,
                "playwright": {
                    "requested_path": args.playwright_package,
                    "manifest_sha256": playwright_manifest["manifest_sha256"],
                    "file_count": playwright_manifest["file_count"],
                },
                "browser_package": {
                    "requested_path": args.browser_package_root,
                    "manifest_sha256": browser_package_manifest["manifest_sha256"],
                    "file_count": browser_package_manifest["file_count"],
                },
            },
            "network_boundary": {
                "binding": network_binding,
                "receipt": network_receipt,
            },
        }
        launch_receipt_bytes = json.dumps(launch_receipt, indent=2, sort_keys=True).encode("utf-8") + b"\n"
        launch_receipt_path = os.path.join(stage_root, "launch-receipt.json")
        copy_stage_file(launch_receipt_path, launch_receipt_bytes)
        launch_receipt_sha = sha256_bytes(launch_receipt_bytes)
        child_argv = [
            args.node,
            staged_verifier,
            "--file", artifact["absolute_path"],
            "--outdir", output_path,
            "--modules", modules_root,
            "--chromium", browser["absolute_path"],
            "--expected-artifact-sha256", artifact["sha256"],
            "--expected-verifier-sha256", verifier["sha256"],
            "--expected-helper-sha256", helper["sha256"],
            "--provenance-launch-receipt", launch_receipt_path,
            "--expected-launch-receipt-sha256", launch_receipt_sha,
            *extra_verifier_args,
        ]
        environment = {
            "PATH": os.environ.get("PATH", "/usr/bin:/bin"),
            "LANG": os.environ.get("LANG", "C.UTF-8"),
            "LC_ALL": os.environ.get("LC_ALL", "C.UTF-8"),
            "TZ": "UTC",
            "TMPDIR": os.environ.get("TMPDIR", "/tmp"),
            "HOME": os.environ.get("HOME", output_path),
            "PM_PROVENANCE_LAUNCHED": "1",
            "PM_PROVENANCE_NONCE": nonce,
            "PM_PROVENANCE_LAUNCH_RECEIPT": launch_receipt_path,
            "PM_PROVENANCE_LAUNCH_RECEIPT_SHA256": launch_receipt_sha,
        }
        completed = subprocess.run(
            child_argv,
            executable=f"/proc/self/fd/{node_fd}" if sys.platform.startswith("linux") else node["absolute_path"],
            env=environment,
            pass_fds=tuple(inherited),
            cwd=os.getcwd(),
            check=False,
        )
        child_result = {
            "schema_id": LAUNCH_RESULT_SCHEMA,
            "schema_version": SCHEMA_VERSION,
            "status": "complete" if completed.returncode == 0 else "failed",
            "stage": "child_exit",
            "child_exit_code": completed.returncode,
            "launch_receipt_path": launch_receipt_path,
            "launch_receipt_sha256": launch_receipt_sha,
            "elapsed_ns": time.time_ns() - started,
            "browser_only": True,
            "native_runtime_certified": False,
            "production_runtime_certified": False,
        }
        atomic_write_json(output_fd, "browser-verifier-provenance-launch-result.json", child_result)
        return completed.returncode
    except Exception as error:
        stage = error.stage if isinstance(error, LaunchError) else "launcher_unhandled"
        details = error.details if isinstance(error, LaunchError) else None
        failure = {
            "schema_id": LAUNCH_RESULT_SCHEMA,
            "schema_version": SCHEMA_VERSION,
            "status": "failed",
            "stage": stage,
            "error_type": type(error).__name__,
            "error": str(error),
            "details": details,
            "launch_receipt_path": launch_receipt_path,
            "elapsed_ns": time.time_ns() - started,
            "browser_only": True,
            "native_runtime_certified": False,
            "production_runtime_certified": False,
        }
        try:
            atomic_write_json(output_fd, "browser-verifier-provenance-launch-failure.json", failure)
        except Exception as receipt_error:
            print(json.dumps({"failure": failure, "receipt_error": str(receipt_error)}, sort_keys=True), file=sys.stderr)
        return 1
    finally:
        for descriptor in inherited:
            try:
                os.close(descriptor)
            except OSError:
                pass
        os.close(output_fd)


def main(argv: list[str] | None = None) -> int:
    raw = list(sys.argv[1:] if argv is None else argv)
    try:
        reject_duplicate_or_equals_options(raw)
        args = parser().parse_args(raw)
        if args.operation == "manifest":
            manifest, _ = tree_manifest(args.directory)
            print(json.dumps(manifest, indent=2, sort_keys=True))
            return 0
        return run_child(args, raw)
    except LaunchError as error:
        print(json.dumps({"status": "failed", "stage": error.stage, "error": str(error), "details": error.details}, sort_keys=True), file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
