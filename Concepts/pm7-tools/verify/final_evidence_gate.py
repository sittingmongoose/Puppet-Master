#!/usr/bin/env python3
"""Fail-closed aggregate gate for the final PMConcept7 evidence campaign.

This verifier consumes one explicit JSON manifest.  It never searches for or
selects evidence by filename.  Browser reports are admitted only through a
run receipt that binds the exact generated artifact, report, runner, browser,
command, scenarios, and observed/expected census.  Browser evidence remains
browser-concept evidence; native Slint, production-runtime, and platform
certification must remain explicitly open.

All ordinary manifest/receipt ``path`` values resolve from the final manifest
directory.  Root-hash-manifest entries resolve from ``evidence_root``;
capture-artifact entries resolve from the campaign-report directory; relative
contact-sheet entries resolve from the contact-sheet-index directory.  The
final manifest, root-hash manifest, and gate report are deliberately kept out
of the root manifest's self-referential hash census as described below.

Exit 0 means only that the supplied, content-addressed browser/evidence
campaign is internally complete.  It is not native or runtime certification.
Use ``--self-test`` for deterministic positive and negative fixture tests.
"""
from __future__ import annotations

import argparse
import copy
import errno
import hashlib
import json
import math
import os
import re
import shutil
import struct
import subprocess
import sys
import stat
import tempfile
import zlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import review_capture_frames as frame_review


MANIFEST_SCHEMA = "pm.pmconcept7.final_evidence_manifest.v1"
REPORT_SCHEMA = "pm.pmconcept7.final_evidence_gate_report.v1"
ROOT_SCHEMA = "pm.pmconcept7.final_evidence_root_hash_manifest.v1"
RUN_RECEIPT_SCHEMA = "pm.pmconcept7.browser_run_receipt.v1"
INTERACTIVE_SCHEMA = "pm.pmconcept7.interactive_review_receipt.v1"
REVIEW_LEDGER_SCHEMA = "pm.capture.full_frame_review_ledger.v2"
CONTACT_INDEX_SCHEMA = "pm.capture.contact_sheet_index.v2"
FRAME_FINDINGS_SCHEMA = "pm.capture.frame_review_findings.v1"
FINDING_DISPOSITIONS_SCHEMA = "pm.capture.frame_review_finding_dispositions.v1"
PRIMARY_REVIEW_SCHEMA = "pm.capture.primary_integrator_review_receipt.v1"
TERMINAL_REVIEW_SCHEMA = "pm.capture.terminal_frame_review_receipt.v1"
MULTI_VIEW_INDEX_SCHEMA = "pm.capture.multi_view_index.v1"
FINDING_TERMINAL_STATUSES = {"repaired", "not_a_defect"}
DENOMINATOR_SCHEMA = "pm.pmconcept7.final_campaign_denominator.v1"
DENOMINATOR_PATH = Path(__file__).with_name("final_campaign_denominator.json").resolve()
DENOMINATOR_SCHEMA_PATH = Path(__file__).with_name("final_campaign_denominator.schema.json").resolve()
FINAL_DENOMINATOR_SEMANTIC_SHA256 = "2334cda45a023e7b00264175d92e18e6f653c48249de4ac88cc53d79d6b5f56a"
EXACT_REQUIRED_WIDTHS = [320, 520, 680, 720, 750, 760, 860, 900, 960, 975, 980, 1180, 1200, 1280, 1440, 1700, 2200, 2500]
EXACT_DENOMINATOR_SOURCE_REFS = [
    "Plans/Test_Capture_and_Motion_Evidence.md#TCME-007",
    "Plans/FinalGUISpec.md#F3-524",
    "Plans/Automated_Testing_System.md#ATS-039",
]

REQUIRED_BROWSER_RUNS = {
    "home_workspace": "pm.home_workspace_live_matrix.v1",
    "settings_transactions": "pm.pmconcept7.settings_transaction_browser_verification.v1",
    "hover_tags": "pm.hover_tag.browser_verification.v1",
    "onboarding_cinematic": "pm.onboarding_cinematic_live_matrix.v1",
    "guided_tour": "pm.guided_tour_live_shell_matrix.v1",
    "systems_integration": "pm.pmconcept7.systems_integration_browser_verification.v1",
    "plugin_projection": "pm.pmconcept7.plugin_projection_browser_verification.v1",
    "backup_browser_scm": "pm.pmconcept7.backup_browser_scm_matrix.v1",
    "accessibility_visual": "pm.pmconcept7.accessibility_visual_browser_matrix.v1",
    "full_thread_performance": "pm.pmconcept7.full_thread_performance_browser_verification.v1",
}
K3_RUNS = {"settings_transactions", "systems_integration", "plugin_projection", "accessibility_visual"}
REQUIRED_INTERACTIVE_SURFACES = {
    "system_chrome", "chrome_extension", "codex_in_app_browser"
}
HEX64 = re.compile(r"^[0-9a-f]{64}$")
SUCCESS_WORDS = {"pass", "passed", "complete", "completed", "certified", "ready", "success", "succeeded", "closed"}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def lexical_absolute(path: Path) -> Path:
    return Path(os.path.abspath(os.fspath(path)))


def open_parent_dir_absolute_nofollow(path: Path) -> tuple[int, str, Path]:
    absolute = lexical_absolute(path)
    parts = absolute.parts
    if len(parts) < 2:
        raise ValueError(f"path has no leaf name: {path}")
    flags = os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_CLOEXEC", 0)
    fd = os.open(parts[0], flags)
    try:
        for component in parts[1:-1]:
            next_fd = os.open(component, flags, dir_fd=fd)
            os.close(fd)
            fd = next_fd
        return fd, parts[-1], absolute
    except Exception:
        os.close(fd)
        raise


def read_regular_nofollow(path: Path, label: str) -> tuple[Path, bytes, os.stat_result]:
    parent_fd, basename, absolute = open_parent_dir_absolute_nofollow(path)
    fd = None
    try:
        fd = os.open(basename, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_CLOEXEC", 0), dir_fd=parent_fd)
        before = os.fstat(fd)
        if not stat.S_ISREG(before.st_mode):
            raise ValueError(f"{label} must be a direct regular file")
        chunks: list[bytes] = []
        while block := os.read(fd, 1024 * 1024):
            chunks.append(block)
        data = b"".join(chunks)
        after = os.fstat(fd)
        if len(data) != before.st_size or (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns) != (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns):
            raise ValueError(f"{label} changed while being read")
        return absolute, data, before
    except OSError as error:
        if error.errno in {errno.ELOOP, errno.ENOTDIR}:
            raise ValueError(f"{label} traverses a symlink or non-directory ancestor") from error
        raise
    finally:
        if fd is not None:
            os.close(fd)
        os.close(parent_fd)


def load_json_with_digest(path: Path, label: str = "JSON file") -> tuple[Path, Any, str, os.stat_result]:
    absolute, data, info = read_regular_nofollow(path, label)
    try:
        value = json.loads(data.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise ValueError(f"{label} is not valid UTF-8 JSON: {error}") from error
    return absolute, value, hashlib.sha256(data).hexdigest(), info


def sha256(path: Path) -> str:
    return hashlib.sha256(read_regular_nofollow(path, "hashed file")[1]).hexdigest()


def canonical_sha256(value: Any) -> str:
    payload = json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def denominator_semantic_sha256(value: dict[str, Any]) -> str:
    return canonical_sha256({
        key: value.get(key)
        for key in ("target_fps", "required_widths", "source_refs", "touched_modules", "chapters")
    })


def png_dimensions(path: Path) -> tuple[int, int]:
    _, data, _ = read_regular_nofollow(path, "PNG evidence")
    header = data[:24]
    if len(header) < 24 or header[:8] != b"\x89PNG\r\n\x1a\n" or header[12:16] != b"IHDR":
        raise ValueError(f"not a structurally recognizable PNG: {path}")
    width, height = struct.unpack(">II", header[16:24])
    if width <= 0 or height <= 0:
        raise ValueError(f"PNG has invalid dimensions: {path}")
    return width, height


def write_json(path: Path, value: Any) -> None:
    payload = (json.dumps(value, indent=2, sort_keys=True) + "\n").encode("utf-8")
    path = lexical_absolute(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    parent_fd, basename, _ = open_parent_dir_absolute_nofollow(path)
    fd = None
    try:
        fd = os.open(basename, os.O_WRONLY | os.O_CREAT | os.O_TRUNC | getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_CLOEXEC", 0), 0o600, dir_fd=parent_fd)
        if not stat.S_ISREG(os.fstat(fd).st_mode):
            raise ValueError(f"JSON output must be a direct regular file: {path}")
        view = memoryview(payload)
        while view:
            view = view[os.write(fd, view):]
        os.fsync(fd)
    finally:
        if fd is not None:
            os.close(fd)
        os.close(parent_fd)


def load_json(path: Path) -> Any:
    return load_json_with_digest(path)[1]


def open_directory_absolute_nofollow(path: Path, label: str) -> tuple[Path, int]:
    parent_fd, basename, absolute = open_parent_dir_absolute_nofollow(path)
    fd = None
    try:
        fd = os.open(basename, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_CLOEXEC", 0), dir_fd=parent_fd)
        if not stat.S_ISDIR(os.fstat(fd).st_mode):
            raise ValueError(f"{label} must be a direct directory")
        result = fd
        fd = None
        return absolute, result
    except OSError as error:
        if error.errno in {errno.ELOOP, errno.ENOTDIR}:
            raise ValueError(f"{label} traverses a symlink or non-directory ancestor") from error
        raise
    finally:
        if fd is not None:
            os.close(fd)
        os.close(parent_fd)


def exact_file_census(root: Path, excluded_paths: set[Path] | None = None) -> list[tuple[Path, dict[str, Any]]]:
    root, root_fd = open_directory_absolute_nofollow(root, "evidence root")
    excluded = {lexical_absolute(path) for path in (excluded_paths or set())}
    rows: list[tuple[Path, dict[str, Any]]] = []

    def walk(directory_fd: int, relative_parent: Path) -> None:
        with os.scandir(directory_fd) as entries:
            ordered = sorted(entries, key=lambda entry: entry.name)
        for entry in ordered:
            relative_path = relative_parent / entry.name
            absolute_path = root / relative_path
            before = entry.stat(follow_symlinks=False)
            if stat.S_ISLNK(before.st_mode):
                raise ValueError(f"evidence census contains a symlink: {relative_path.as_posix()}")
            if stat.S_ISDIR(before.st_mode):
                child_fd = os.open(entry.name, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_CLOEXEC", 0), dir_fd=directory_fd)
                try:
                    opened = os.fstat(child_fd)
                    if (opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino):
                        raise ValueError(f"evidence census directory changed while opening: {relative_path.as_posix()}")
                    walk(child_fd, relative_path)
                finally:
                    os.close(child_fd)
            elif stat.S_ISREG(before.st_mode):
                if absolute_path in excluded:
                    continue
                fd = os.open(entry.name, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0) | getattr(os, "O_CLOEXEC", 0), dir_fd=directory_fd)
                try:
                    opened = os.fstat(fd)
                    if (opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino) or not stat.S_ISREG(opened.st_mode):
                        raise ValueError(f"evidence census file changed while opening: {relative_path.as_posix()}")
                    chunks: list[bytes] = []
                    while block := os.read(fd, 1024 * 1024):
                        chunks.append(block)
                    data = b"".join(chunks)
                    after = os.fstat(fd)
                    if len(data) != opened.st_size or (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns) != (opened.st_dev, opened.st_ino, opened.st_size, opened.st_mtime_ns):
                        raise ValueError(f"evidence census file changed while reading: {relative_path.as_posix()}")
                    rows.append((absolute_path, {"path": relative_path.as_posix(), "sha256": hashlib.sha256(data).hexdigest(), "bytes": opened.st_size}))
                finally:
                    os.close(fd)
            else:
                raise ValueError(f"evidence census contains a non-regular entry: {relative_path.as_posix()}")

    try:
        walk(root_fd, Path())
    finally:
        os.close(root_fd)
    return sorted(rows, key=lambda item: item[1]["path"])


def pointer(value: Any, expression: str) -> Any:
    if expression == "":
        return value
    if not isinstance(expression, str) or not expression.startswith("/"):
        raise ValueError(f"invalid JSON pointer: {expression!r}")
    current = value
    for raw in expression[1:].split("/"):
        token = raw.replace("~1", "/").replace("~0", "~")
        if isinstance(current, list):
            current = current[int(token)]
        elif isinstance(current, dict):
            current = current[token]
        else:
            raise KeyError(expression)
    return current


def count_collection(value: Any) -> int:
    if not isinstance(value, (list, dict)):
        raise TypeError("census target is not an array or object")
    return len(value)


def collection_rows(value: Any) -> list[Any]:
    if isinstance(value, list):
        return value
    if isinstance(value, dict):
        return list(value.values())
    raise TypeError("check collection is not an array or object")


def percentile(values: list[float], fraction: float) -> float | None:
    if not values:
        return None
    ordered = sorted(values)
    index = min(len(ordered) - 1, max(0, math.ceil(fraction * len(ordered)) - 1))
    return round(ordered[index], 3)


def recompute_frame_timing(frames: list[dict[str, Any]], requested_fps: float) -> dict[str, Any]:
    if len(frames) < 2:
        raise ValueError("at least two delivered frames are required")
    cdp = [row.get("cdp_timestamp_s") for row in frames]
    receiver = [row.get("received_monotonic_ms") for row in frames]
    if any(isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) for value in cdp + receiver):
        raise ValueError("every frame requires finite CDP and receiver timestamps")
    cdp_intervals = [(cdp[index] - cdp[index - 1]) * 1000 for index in range(1, len(cdp))]
    receiver_intervals = [receiver[index] - receiver[index - 1] for index in range(1, len(receiver))]
    if any(value <= 0 for value in cdp_intervals + receiver_intervals):
        raise ValueError("CDP and receiver timestamps must be strictly increasing")
    interval_target = 1000 / requested_fps
    duration = (cdp[-1] - cdp[0]) * 1000
    hashes = [row.get("sha256") for row in frames]
    if any(not isinstance(value, str) or not HEX64.fullmatch(value) for value in hashes):
        raise ValueError("every frame requires one valid SHA-256")
    consecutive = sum(hashes[index] == hashes[index - 1] for index in range(1, len(hashes)))
    return {
        "delivered_frame_count": len(frames),
        "delivered_fps": round((len(frames) - 1) * 1000 / duration, 3),
        "interval_ms": {
            "p50": percentile(cdp_intervals, .50), "p95": percentile(cdp_intervals, .95),
            "p99": percentile(cdp_intervals, .99), "max": round(max(cdp_intervals), 3),
        },
        "receiver_interval_ms": {
            "p50": percentile(receiver_intervals, .50), "p95": percentile(receiver_intervals, .95),
            "p99": percentile(receiver_intervals, .99), "max": round(max(receiver_intervals), 3),
        },
        "delayed_interval_count": sum(value > interval_target * 1.5 for value in cdp_intervals),
        "dropped_frame_equivalent_estimate": sum(max(0, math.floor(value / interval_target + .5) - 1) for value in cdp_intervals),
        "repeated_frame_count": consecutive,
        "distinct_frame_hash_count": len(set(hashes)),
    }


class Gate:
    def __init__(self, manifest_path: Path):
        self.manifest_path = lexical_absolute(manifest_path)
        self.base = self.manifest_path.parent
        self.errors: list[dict[str, str]] = []
        self.checks: list[dict[str, Any]] = []
        self.referenced_evidence: set[Path] = set()
        self.root_entries: dict[Path, dict[str, Any]] = {}
        self.artifact_sha = ""
        self.evidence_root: Path | None = None
        self.manifest: dict[str, Any] = {}
        self.manifest_sha = ""
        self.film_denominator_sha = ""
        self.film_runner_sha = ""
        self.film_configuration_sha = ""
        self.film_chapter_actions: dict[str, list[str]] = {}

    def fail(self, code: str, message: str) -> None:
        self.errors.append({"code": code, "message": message})

    def check(self, code: str, condition: bool, message: str, evidence: Any = None) -> None:
        self.checks.append({"id": code, "pass": bool(condition), "evidence": evidence})
        if not condition:
            self.fail(code, message)

    def validate_exact_browser_identity(self, identity: Any, label: str) -> bool:
        string_fields = (
            "product", "version", "channel", "user_agent", "executable_path",
            "executable_sha256", "playwright_version",
        )
        stat_fields = ("executable_bytes", "executable_device", "executable_inode", "executable_mtime_ns")
        if (not isinstance(identity, dict)
                or set(identity) != set(string_fields) | set(stat_fields)
                or not all(isinstance(identity.get(key), str) and identity[key] for key in string_fields)
                or not HEX64.fullmatch(str(identity.get("executable_sha256", "")))
                or not all(isinstance(identity.get(key), int) and not isinstance(identity[key], bool) and identity[key] >= 0 for key in stat_fields)):
            self.fail("missing_browser_identity", f"{label} lacks exact browser path/hash/stat/version identity")
            return False
        executable = Path(identity["executable_path"])
        if not executable.is_absolute() or lexical_absolute(executable) != executable:
            self.fail("browser_identity_unverifiable", f"{label} browser executable path is not exact absolute lexical identity")
            return False
        try:
            _, data, info = read_regular_nofollow(executable, f"{label} browser executable")
        except Exception as error:
            self.fail("browser_identity_unverifiable", f"{label} browser executable is missing, indirect, or non-regular: {error}")
            return False
        observed = {
            "executable_sha256": hashlib.sha256(data).hexdigest(),
            "executable_bytes": info.st_size,
            "executable_device": info.st_dev,
            "executable_inode": info.st_ino,
            "executable_mtime_ns": info.st_mtime_ns,
        }
        if any(identity.get(key) != value for key, value in observed.items()):
            self.fail("browser_identity_unverifiable", f"{label} browser executable hash/stat identity drifted")
            return False
        return True

    def resolve(self, raw: Any) -> Path:
        if not isinstance(raw, str) or not raw.strip():
            raise ValueError("path must be a non-empty string")
        path = Path(raw)
        return lexical_absolute(path if path.is_absolute() else self.base / path)

    def ensure_under(self, path: Path, root: Path, label: str) -> None:
        if path != root and root not in path.parents:
            raise ValueError(f"{label} escapes evidence root: {path}")

    def load_ref(self, spec: Any, label: str, *, evidence: bool = True,
                 expected_schema: str | None = None) -> tuple[Path, Any] | tuple[None, None]:
        if not isinstance(spec, dict):
            self.fail("invalid_reference", f"{label} must be an object")
            return None, None
        try:
            path = self.resolve(spec["path"])
        except (KeyError, ValueError) as error:
            self.fail("invalid_reference", f"{label}: {error}")
            return None, None
        if evidence:
            if self.evidence_root is None:
                self.fail("evidence_root_unavailable", f"cannot admit {label} before evidence root")
                return None, None
            try:
                self.ensure_under(path, self.evidence_root, label)
            except ValueError as error:
                self.fail("evidence_path_escape", str(error))
                return None, None
            self.referenced_evidence.add(path)
        try:
            path, value, actual_hash, _ = load_json_with_digest(path, label)
        except Exception as error:
            self.fail("invalid_json", f"{label} cannot be opened as one direct regular UTF-8 JSON file: {error}")
            return path, None
        expected_hash = spec.get("sha256")
        if not isinstance(expected_hash, str) or not HEX64.fullmatch(expected_hash):
            self.fail("invalid_declared_hash", f"{label} does not declare a lowercase SHA-256")
        elif actual_hash != expected_hash:
            self.fail("hash_mismatch", f"{label} hash mismatch: expected {expected_hash}, got {actual_hash}")
        schema = expected_schema or spec.get("schema_id")
        if schema and (not isinstance(value, dict) or value.get("schema_id") != schema):
            self.fail("wrong_schema", f"{label} expected schema {schema!r}, got {value.get('schema_id') if isinstance(value, dict) else None!r}")
        return path, value

    def root_has(self, path: Path, label: str) -> None:
        entry = self.root_entries.get(path)
        if entry is None:
            self.fail("root_manifest_missing_entry", f"root evidence hash manifest omits {label}: {path}")
        elif path.is_file() and entry.get("sha256") != sha256(path):
            self.fail("root_manifest_hash_mismatch", f"root evidence hash entry is stale for {label}: {path}")

    def scan_false_certification(self, value: Any, label: str, trail: str = "") -> None:
        if isinstance(value, dict):
            for key, child in value.items():
                location = f"{trail}/{key}"
                normalized = key.lower().replace("-", "_")
                certification_key = normalized in {
                    "native_slint_certified", "slint_certified", "native_runtime_certified",
                    "production_runtime_certified", "platform_certified",
                    "native_slint_1_17_1_certification", "production_runtime_certification",
                    "platform_hardware_certification", "buildability_gate_passed",
                } or ("certif" in normalized and any(word in normalized for word in ("native", "slint", "runtime", "platform")))
                successful = child is True or (isinstance(child, str) and child.lower() in SUCCESS_WORDS)
                if certification_key and successful:
                    self.fail("false_native_runtime_certification", f"{label}{location} makes a forbidden native/runtime/platform success claim")
                self.scan_false_certification(child, label, location)
        elif isinstance(value, list):
            for index, child in enumerate(value):
                self.scan_false_certification(child, label, f"{trail}/{index}")

    def load_manifest(self) -> bool:
        try:
            self.manifest_path, value, self.manifest_sha, _ = load_json_with_digest(self.manifest_path, "final evidence manifest")
        except Exception as error:
            self.fail("invalid_manifest_json", str(error))
            return False
        if not isinstance(value, dict) or value.get("schema_id") != MANIFEST_SCHEMA:
            self.fail("wrong_manifest_schema", f"expected {MANIFEST_SCHEMA}")
            return False
        self.manifest = value
        try:
            self.evidence_root = self.resolve(value["evidence_root"])
        except (KeyError, ValueError) as error:
            self.fail("invalid_evidence_root", str(error))
            return False
        try:
            self.evidence_root, evidence_fd = open_directory_absolute_nofollow(self.evidence_root, "evidence root")
            os.close(evidence_fd)
        except Exception as error:
            self.fail("missing_evidence_root", f"evidence root is missing or aliases another path: {error}")
            return False
        if self.manifest_path == self.evidence_root or self.evidence_root in self.manifest_path.parents:
            self.fail("manifest_inside_evidence_root", "final evidence manifest must be outside evidence_root to avoid a hash cycle")
            return False
        return True

    def validate_artifact_and_residuals(self) -> None:
        artifact = self.manifest.get("artifact")
        if not isinstance(artifact, dict):
            self.fail("missing_artifact", "artifact reference is required")
            return
        try:
            path = self.resolve(artifact["path"])
        except (KeyError, ValueError) as error:
            self.fail("invalid_artifact", str(error))
            return
        if not path.is_file():
            self.fail("missing_artifact", f"generated artifact is missing: {path}")
            return
        declared = artifact.get("sha256")
        actual = sha256(path)
        self.artifact_sha = actual
        self.check("artifact_hash", isinstance(declared, str) and declared == actual and bool(HEX64.fullmatch(actual)), "generated artifact SHA-256 does not match manifest", {"actual": actual, "declared": declared})
        residuals = self.manifest.get("residuals")
        required = {
            "native_slint_1_17_1_certification": "open",
            "production_runtime_certification": "open",
            "platform_hardware_certification": "open",
            "browser_evidence_scope": "browser_concept_only",
        }
        self.check("explicit_residuals", isinstance(residuals, dict) and all(residuals.get(k) == v for k, v in required.items()), "native Slint/runtime/platform residuals are not explicitly open", residuals)
        self.scan_false_certification(self.manifest, "manifest")

    def validate_root_manifest(self) -> None:
        spec = self.manifest.get("root_evidence_hash_manifest")
        path, root = self.load_ref(spec, "root evidence hash manifest", evidence=False, expected_schema=ROOT_SCHEMA)
        if path is None or not isinstance(root, dict) or self.evidence_root is None:
            return
        try:
            self.ensure_under(path, self.evidence_root, "root evidence hash manifest")
        except ValueError as error:
            self.fail("root_manifest_outside_evidence", str(error))
            return
        if root.get("artifact_sha256") != self.artifact_sha:
            self.fail("root_manifest_artifact_mismatch", "root evidence manifest is bound to another generated artifact")
        if root.get("complete_file_census") is not True:
            self.fail("root_manifest_not_complete", "root evidence manifest must attest a complete evidence-root file census")
        entries = root.get("files")
        if not isinstance(entries, list) or not entries:
            self.fail("empty_root_manifest", "root evidence manifest must contain files")
            return
        for index, entry in enumerate(entries):
            if not isinstance(entry, dict):
                self.fail("invalid_root_entry", f"root files[{index}] is not an object")
                continue
            raw = entry.get("path")
            if not isinstance(raw, str) or not raw or Path(raw).is_absolute():
                self.fail("invalid_root_path", f"root files[{index}] path must be relative")
                continue
            target = lexical_absolute(self.evidence_root / raw)
            try:
                self.ensure_under(target, self.evidence_root, f"root files[{index}]")
            except ValueError as error:
                self.fail("root_path_escape", str(error))
                continue
            if target in self.root_entries:
                self.fail("duplicate_root_entry", f"duplicate root evidence path: {raw}")
                continue
            self.root_entries[target] = entry
            try:
                _, data, info = read_regular_nofollow(target, f"root evidence file {raw}")
            except Exception as error:
                self.fail("root_entry_missing", f"root evidence file is missing or aliases another path: {target}: {error}")
                continue
            actual_hash = hashlib.sha256(data).hexdigest()
            actual_bytes = info.st_size
            if entry.get("sha256") != actual_hash or entry.get("bytes") != actual_bytes:
                self.fail("root_entry_stale", f"root evidence entry does not match bytes: {raw}")
        try:
            actual_rows = exact_file_census(self.evidence_root, {path})
        except Exception as error:
            self.fail("root_file_census_unsafe", str(error))
            return
        actual_files = {item[0] for item in actual_rows}
        actual_by_path = {item[0]: item[1] for item in actual_rows}
        for target, entry in self.root_entries.items():
            if target in actual_by_path and entry != actual_by_path[target]:
                self.fail("root_entry_stale", f"root evidence entry differs from the descriptor-opened census: {entry.get('path')}")
        if set(self.root_entries) != actual_files:
            missing = sorted(str(item.relative_to(self.evidence_root)) for item in actual_files - set(self.root_entries))
            extra = sorted(str(item.relative_to(self.evidence_root)) for item in set(self.root_entries) - actual_files)
            self.fail("root_file_census_mismatch", f"root evidence file census differs; missing={missing[:20]}, extra={extra[:20]}")

    def validate_runners_and_k3(self) -> dict[str, dict[str, Any]]:
        runners: dict[str, dict[str, Any]] = {}
        rows = self.manifest.get("runners")
        if not isinstance(rows, list) or not rows:
            self.fail("missing_runners", "at least one runner is required")
            return runners
        for index, row in enumerate(rows):
            if not isinstance(row, dict) or not isinstance(row.get("id"), str):
                self.fail("invalid_runner", f"runner[{index}] is invalid")
                continue
            runner_id = row["id"]
            if runner_id in runners:
                self.fail("duplicate_runner_id", f"duplicate runner id: {runner_id}")
                continue
            try:
                path = self.resolve(row["path"])
            except (KeyError, ValueError) as error:
                self.fail("invalid_runner", f"{runner_id}: {error}")
                continue
            if not path.is_file():
                self.fail("missing_runner", f"runner is missing: {path}")
                continue
            actual = sha256(path)
            if row.get("sha256") != actual:
                self.fail("runner_hash_mismatch", f"runner hash mismatch: {runner_id}")
            runners[runner_id] = {"path": path, "sha256": actual}
        k3_spec = self.manifest.get("k3_geometry_manifest")
        path, value = self.load_ref(k3_spec, "K3 geometry manifest", evidence=False, expected_schema="pm.pmconcept7.k3_geometry_manifest.v1")
        if path is not None and isinstance(value, dict):
            self.scan_false_certification(value, "K3 geometry manifest")
        return runners

    def validate_build_reports(self, runners: dict[str, dict[str, Any]]) -> None:
        reports = self.manifest.get("build_reports")
        if not isinstance(reports, list) or len(reports) < 2:
            self.fail("missing_reproducible_build", "at least final and reproducibility build reports are required")
            return
        seen_paths: set[Path] = set()
        for index, row in enumerate(reports):
            if not isinstance(row, dict):
                self.fail("invalid_build_report", f"build_reports[{index}] is invalid")
                continue
            path, report = self.load_ref(row, f"build report {index}")
            if path is None or not isinstance(report, dict):
                continue
            if path in seen_paths:
                self.fail("duplicate_build_report", f"build report path reused: {path}")
            seen_paths.add(path)
            self.root_has(path, f"build report {index}")
            if report.get("output_sha256") != self.artifact_sha:
                self.fail("mixed_artifact_hash", f"build report {index} targets another artifact")
            if report.get("gates_all_pass") is not True:
                self.fail("build_gate_failure", f"build report {index} is not gate-clean")
            gates = report.get("gates")
            if not isinstance(gates, list) or not gates or any(item.get("pass") is not True for item in gates if isinstance(item, dict)) or any(not isinstance(item, dict) for item in gates):
                self.fail("incomplete_build_gates", f"build report {index} has missing or failed gates")
            portability = report.get("portability_evidence_scope")
            if not isinstance(portability, dict) or portability.get("slint_1_17_1_compilation_runtime_certification") is not False:
                self.fail("false_native_runtime_certification", f"build report {index} does not preserve the native certification boundary")
            runner = runners.get(row.get("runner_id"))
            pipeline = report.get("build_provenance", {}).get("pipeline", {})
            if runner is None or pipeline.get("sha256") != runner.get("sha256"):
                self.fail("build_runner_unbound", f"build report {index} is not bound to its declared runner")
            self.scan_false_certification(report, f"build report {index}")

    def validate_check_rows(self, report: dict[str, Any], run_id: str) -> int:
        checks = report.get("checks")
        try:
            rows = collection_rows(checks)
        except TypeError:
            self.fail("missing_checks", f"browser report {run_id} lacks a checks collection")
            return 0
        if not rows:
            self.fail("empty_checks", f"browser report {run_id} has no checks")
        for index, row in enumerate(rows):
            if not isinstance(row, dict) or row.get("pass") is not True:
                self.fail("failed_check", f"browser report {run_id} check {index} is missing or failed")
        for key in ("runtime_errors", "network_errors", "findings", "failure_screenshots"):
            value = report.get(key)
            if value not in (None, []):
                self.fail("browser_findings_present", f"browser report {run_id} has non-empty {key}")
        summary = report.get("summary")
        if isinstance(summary, dict):
            for key, value in summary.items():
                lowered = key.lower()
                is_failure = lowered in {"failed", "checks_failed", "matrix_failures", "runtime_errors", "network_errors", "findings", "scenario_browser_findings", "topics_missing_browser_probe", "runtime_error_case_count"}
                if is_failure and value not in (0, [], None):
                    self.fail("failed_summary", f"browser report {run_id} summary {key} is not zero")
                if lowered == "failed_checks" and value not in ([], None):
                    self.fail("failed_summary", f"browser report {run_id} has failed_checks")
                if lowered == "status" and value not in ("PASS", "pass"):
                    self.fail("failed_summary", f"browser report {run_id} summary status is not pass")
        return len(rows)

    def validate_censuses(self, report: dict[str, Any], run: dict[str, Any], run_id: str) -> int:
        censuses = run.get("case_censuses")
        if not isinstance(censuses, list) or not censuses:
            self.fail("missing_case_census", f"browser run {run_id} must declare at least one exact case census")
            return 0
        total = 0
        for index, census in enumerate(censuses):
            if not isinstance(census, dict) or not isinstance(census.get("expected_count"), int) or census["expected_count"] < 1:
                self.fail("invalid_case_census", f"browser run {run_id} census {index} is invalid")
                continue
            try:
                rows_value = pointer(report, census["pointer"])
                count = count_collection(rows_value)
                rows = collection_rows(rows_value)
            except Exception as error:
                self.fail("missing_case_census", f"browser run {run_id} census {index}: {error}")
                continue
            expected = census["expected_count"]
            if count != expected:
                self.fail("incomplete_case_census", f"browser run {run_id} census {index}: expected {expected}, observed {count}")
            id_pointer = census.get("id_pointer")
            expected_ids = census.get("expected_ids")
            if expected_ids is not None:
                if not isinstance(expected_ids, list) or len(expected_ids) != len(set(expected_ids)):
                    self.fail("invalid_expected_ids", f"browser run {run_id} census {index} expected_ids are invalid")
                else:
                    actual_ids = []
                    try:
                        for row in rows:
                            actual_ids.append(pointer(row, id_pointer or "/id"))
                    except Exception as error:
                        self.fail("missing_case_id", f"browser run {run_id} census {index}: {error}")
                        actual_ids = []
                    if actual_ids != expected_ids:
                        self.fail("case_id_census_mismatch", f"browser run {run_id} census {index} identifiers differ")
            total += expected
        return total

    def validate_browser_runs(self, runners: dict[str, dict[str, Any]]) -> None:
        rows = self.manifest.get("browser_runs")
        if not isinstance(rows, list):
            self.fail("missing_browser_runs", "browser_runs must be an array")
            return
        indexed = {row.get("id"): row for row in rows if isinstance(row, dict) and isinstance(row.get("id"), str)}
        if len(indexed) != len(rows):
            self.fail("duplicate_or_invalid_browser_run", "browser run ids must be unique non-empty strings")
        if set(indexed) != set(REQUIRED_BROWSER_RUNS):
            missing = sorted(set(REQUIRED_BROWSER_RUNS) - set(indexed))
            extra = sorted(set(indexed) - set(REQUIRED_BROWSER_RUNS))
            self.fail("browser_run_census_mismatch", f"required browser run set differs; missing={missing}, extra={extra}")
        k3_hash = self.manifest.get("k3_geometry_manifest", {}).get("sha256")
        for run_id, expected_schema in REQUIRED_BROWSER_RUNS.items():
            run = indexed.get(run_id)
            if not isinstance(run, dict):
                continue
            report_path, report = self.load_ref(run.get("report"), f"{run_id} browser report", expected_schema=expected_schema)
            receipt_path, receipt = self.load_ref(run.get("receipt"), f"{run_id} browser run receipt", expected_schema=RUN_RECEIPT_SCHEMA)
            if report_path is None or receipt_path is None or not isinstance(report, dict) or not isinstance(receipt, dict):
                continue
            self.root_has(report_path, f"{run_id} report")
            self.root_has(receipt_path, f"{run_id} receipt")
            report_hash = sha256(report_path)
            if receipt.get("run_id") != run_id or receipt.get("artifact_sha256") != self.artifact_sha or receipt.get("report_sha256") != report_hash:
                self.fail("browser_receipt_binding_mismatch", f"browser run receipt {run_id} does not bind the exact run/report/artifact")
            runner = runners.get(run.get("runner_id"))
            receipt_runner = receipt.get("runner")
            if runner is None or not isinstance(receipt_runner, dict) or receipt_runner.get("sha256") != runner.get("sha256") or receipt_runner.get("path") != str(run.get("runner_path", self.manifest.get("runners", [{}])[0].get("path", ""))):
                # Path comparison is optional only when runner_path is omitted; hash is never optional.
                if runner is None or not isinstance(receipt_runner, dict) or receipt_runner.get("sha256") != (runner or {}).get("sha256"):
                    self.fail("browser_runner_unbound", f"browser run {run_id} does not bind its runner hash")
            self.validate_exact_browser_identity(receipt.get("browser_identity"), f"browser run {run_id}")
            command = receipt.get("command")
            if not isinstance(command, dict) or not isinstance(command.get("argv"), list) or not command["argv"] or not all(isinstance(v, str) and v for v in command["argv"]) or not isinstance(command.get("cwd"), str) or not command["cwd"]:
                self.fail("missing_browser_command", f"browser run {run_id} lacks its exact command")
            elif command != run.get("expected_command"):
                self.fail("browser_command_mismatch", f"browser run {run_id} command differs from the manifest-bound command")
            expected_scenarios = run.get("expected_scenario_ids")
            scenarios = receipt.get("scenarios")
            if not isinstance(expected_scenarios, list) or not expected_scenarios or not all(isinstance(item, str) and item for item in expected_scenarios) or len(expected_scenarios) != len(set(expected_scenarios)):
                self.fail("invalid_expected_scenarios", f"browser run {run_id} expected scenario ids are invalid")
                expected_scenarios = []
            if not isinstance(scenarios, list):
                self.fail("missing_scenarios", f"browser run {run_id} lacks scenario receipts")
                scenarios = []
            actual_scenarios = [row.get("id") for row in scenarios if isinstance(row, dict)]
            if actual_scenarios != expected_scenarios:
                self.fail("scenario_census_mismatch", f"browser run {run_id} scenario ids differ")
            declared_scenario_dispositions = run.get("allowed_scenario_dispositions", ["pass", "browser_checks_passed", "browser_partial_checks_passed", "routed_outside_browser_with_residual_open"])
            allowed_scenario_dispositions = set(declared_scenario_dispositions) if isinstance(declared_scenario_dispositions, list) and all(isinstance(item, str) for item in declared_scenario_dispositions) else set()
            if any(not isinstance(row, dict) or row.get("disposition") not in allowed_scenario_dispositions for row in scenarios):
                self.fail("scenario_failure", f"browser run {run_id} has a missing or failed scenario disposition")
            check_count = self.validate_check_rows(report, run_id)
            case_count = self.validate_censuses(report, run, run_id)
            counts = receipt.get("counts")
            expected_counts = {
                "checks_expected": check_count, "checks_observed": check_count,
                "cases_expected": case_count, "cases_observed": case_count,
                "scenarios_expected": len(expected_scenarios), "scenarios_observed": len(scenarios),
            }
            if not isinstance(counts, dict) or any(counts.get(key) != value for key, value in expected_counts.items()):
                self.fail("receipt_count_mismatch", f"browser run {run_id} receipt census does not match report/manifest")
            assertions = run.get("success_assertions")
            if not isinstance(assertions, list) or not assertions:
                self.fail("missing_success_assertions", f"browser run {run_id} has no explicit success assertions")
            else:
                for index, assertion in enumerate(assertions):
                    try:
                        actual = pointer(report, assertion["pointer"])
                        expected = assertion["equals"]
                    except Exception as error:
                        self.fail("invalid_success_assertion", f"browser run {run_id} assertion {index}: {error}")
                        continue
                    if actual != expected:
                        self.fail("failed_success_assertion", f"browser run {run_id} assertion {index} expected {expected!r}, got {actual!r}")
            dispositions = run.get("allowed_dispositions")
            if not isinstance(dispositions, list) or not dispositions or receipt.get("disposition") not in dispositions:
                self.fail("browser_disposition_failure", f"browser run {run_id} has an unapproved disposition")
            for expression in run.get("artifact_sha256_pointers", []):
                try:
                    bound = pointer(report, expression)
                except Exception as error:
                    self.fail("missing_report_artifact_hash", f"browser run {run_id} artifact pointer {expression}: {error}")
                    continue
                if bound != self.artifact_sha:
                    self.fail("mixed_artifact_hash", f"browser report {run_id} targets another artifact")
            if run_id in K3_RUNS and receipt.get("k3_geometry_manifest_sha256") != k3_hash:
                self.fail("k3_manifest_unbound", f"browser run {run_id} is not bound to the exact K3 geometry manifest")
            if receipt.get("native_slint_certified") is not False or receipt.get("production_runtime_certified") is not False:
                self.fail("false_native_runtime_certification", f"browser receipt {run_id} does not preserve certification residuals")
            boundary = receipt.get("evidence_boundary")
            if not isinstance(boundary, str) or "browser" not in boundary.lower() or "native" not in boundary.lower():
                self.fail("missing_evidence_boundary", f"browser receipt {run_id} lacks a browser/native boundary")
            self.scan_false_certification(report, f"browser report {run_id}")
            self.scan_false_certification(receipt, f"browser receipt {run_id}")
        # Fixed campaign denominators cannot be weakened by the manifest.
        fixed = {
            "accessibility_visual": [("/matrix", 288)],
            "full_thread_performance": [("/scenario_coverage", 19), ("/topic_coverage", 85)],
            "onboarding_cinematic": [("/paths", 4), ("/themes", 8)],
            "guided_tour": [("/themes", 8)],
            "plugin_projection": [("/doctor_routes", 8)],
        }
        for run_id, obligations in fixed.items():
            run = indexed.get(run_id)
            if not isinstance(run, dict):
                continue
            _, report = self.load_ref(run.get("report"), f"{run_id} fixed-census report", expected_schema=REQUIRED_BROWSER_RUNS[run_id])
            if not isinstance(report, dict):
                continue
            for expression, expected in obligations:
                try:
                    observed = count_collection(pointer(report, expression))
                except Exception as error:
                    self.fail("missing_fixed_census", f"{run_id} {expression}: {error}")
                    continue
                if observed != expected:
                    self.fail("fixed_census_mismatch", f"{run_id} {expression}: expected {expected}, observed {observed}")

    def validate_interactive_reviews(self) -> None:
        rows = self.manifest.get("interactive_reviews")
        if not isinstance(rows, list):
            self.fail("missing_interactive_reviews", "interactive_reviews must be an array")
            return
        indexed: dict[str, tuple[Path, dict[str, Any]]] = {}
        paths: set[Path] = set()
        for index, spec in enumerate(rows):
            path, receipt = self.load_ref(spec, f"interactive review {index}", expected_schema=INTERACTIVE_SCHEMA)
            if path is None or not isinstance(receipt, dict):
                continue
            surface = receipt.get("surface")
            if not isinstance(surface, str) or surface in indexed:
                self.fail("duplicate_interactive_surface", f"interactive review surface is invalid or duplicated: {surface!r}")
                continue
            indexed[surface] = (path, receipt)
            paths.add(path)
            self.root_has(path, f"interactive review {surface}")
        if set(indexed) != REQUIRED_INTERACTIVE_SURFACES or len(paths) != 3:
            self.fail("interactive_review_census_mismatch", f"required separate interactive receipts are {sorted(REQUIRED_INTERACTIVE_SURFACES)}")
        for surface, (path, receipt) in indexed.items():
            if receipt.get("artifact_sha256") != self.artifact_sha:
                self.fail("mixed_artifact_hash", f"interactive review {surface} targets another artifact")
            self.validate_exact_browser_identity(receipt.get("browser_identity"), f"interactive review {surface}")
            extension = receipt.get("extension_identity")
            if surface == "chrome_extension":
                if not isinstance(extension, dict) or extension.get("enabled") is not True or not all(isinstance(extension.get(key), str) and extension[key] for key in ("name", "id", "version")):
                    self.fail("missing_extension_identity", "Chrome-extension review lacks exact enabled extension identity")
            elif extension is not None:
                self.fail("unexpected_extension_identity", f"interactive review {surface} must not impersonate the extension pass")
            scenarios = receipt.get("scenarios")
            if not isinstance(scenarios, list) or not scenarios:
                self.fail("missing_interactive_scenarios", f"interactive review {surface} has no scenarios")
                continue
            for scenario_index, scenario in enumerate(scenarios):
                if not isinstance(scenario, dict) or not isinstance(scenario.get("id"), str) or scenario.get("disposition") not in {"pass", "pass_with_native_residuals_open"}:
                    self.fail("interactive_scenario_failure", f"interactive review {surface} scenario {scenario_index} is invalid or failed")
                    continue
                observations = scenario.get("observations")
                screenshots = scenario.get("screenshots")
                if not isinstance(observations, list) or not observations or not all(isinstance(item, str) and item.strip() for item in observations):
                    self.fail("missing_interactive_observations", f"interactive review {surface} scenario {scenario_index} lacks observations")
                if not isinstance(screenshots, list) or not screenshots:
                    self.fail("missing_interactive_screenshots", f"interactive review {surface} scenario {scenario_index} lacks screenshots")
            if receipt.get("disposition") not in {"pass", "pass_with_native_residuals_open"}:
                self.fail("interactive_review_failure", f"interactive review {surface} did not pass")
            if receipt.get("native_slint_certified") is not False or receipt.get("production_runtime_certified") is not False:
                self.fail("false_native_runtime_certification", f"interactive review {surface} overclaims certification")
            self.scan_false_certification(receipt, f"interactive review {surface}")

    def validate_binary_ref(self, spec: Any, label: str) -> Path | None:
        if not isinstance(spec, dict):
            self.fail("invalid_binary_reference", f"{label} must be an object")
            return None
        try:
            path = self.resolve(spec["path"])
            assert self.evidence_root is not None
            self.ensure_under(path, self.evidence_root, label)
        except (KeyError, ValueError, AssertionError) as error:
            self.fail("invalid_binary_reference", f"{label}: {error}")
            return None
        self.referenced_evidence.add(path)
        if not path.is_file():
            self.fail("missing_file", f"{label} is missing: {path}")
            return path
        actual = sha256(path)
        if spec.get("sha256") != actual:
            self.fail("hash_mismatch", f"{label} hash mismatch")
        self.root_has(path, label)
        if "screenshot" in label.lower() and path.suffix.lower() not in {".png", ".webp", ".jpg", ".jpeg"}:
            self.fail("invalid_screenshot_format", f"{label} is not a supported retained image: {path}")
        return path

    def validate_media_stream(self, path: Path, *, master: bool,
                              expected_width: int, expected_height: int,
                              expected_frame_count: int,
                              expected_timestamps_s: list[float]) -> None:
        ffprobe = shutil.which("ffprobe")
        ffmpeg = shutil.which("ffmpeg")
        if not ffprobe or not ffmpeg:
            self.fail("media_probe_unavailable", "independent ffprobe and ffmpeg are required to admit final film media")
            return
        probe = subprocess.run(
            [ffprobe, "-v", "error", "-count_frames", "-show_entries", "format=format_name:stream=index,codec_type,codec_name,width,height,nb_read_frames:frame=best_effort_timestamp_time", "-of", "json", str(path)],
            text=True, capture_output=True, check=False, timeout=120,
        )
        try:
            parsed = json.loads(probe.stdout) if probe.returncode == 0 else None
        except json.JSONDecodeError:
            parsed = None
        streams = parsed.get("streams", []) if isinstance(parsed, dict) else []
        video = next((row for row in streams if isinstance(row, dict) and row.get("codec_type") == "video"), None)
        format_name = parsed.get("format", {}).get("format_name", "") if isinstance(parsed, dict) else ""
        expected_codec = "ffv1" if master else "h264"
        expected_container = "matroska" if master else "mp4"
        probe_ok = (
            probe.returncode == 0 and isinstance(video, dict) and video.get("codec_name") == expected_codec
            and expected_container in str(format_name).split(",")
            and video.get("width") == expected_width and video.get("height") == expected_height
            and str(video.get("nb_read_frames")) == str(expected_frame_count)
        )
        self.check(
            "ffv1_master_probe" if master else "review_mp4_probe", probe_ok,
            f"{path.name} is not an independently proven {expected_codec}/{expected_container} video with the exact delivered-frame dimensions/census",
            {"returncode": probe.returncode, "format_name": format_name, "video": video, "stderr": probe.stderr[-1000:]},
        )
        media_timestamps: list[float] = []
        for row in parsed.get("frames", []) if isinstance(parsed, dict) else []:
            try:
                value = float(row.get("best_effort_timestamp_time"))
            except (TypeError, ValueError):
                value = math.nan
            media_timestamps.append(value)
        normalized = [value - media_timestamps[0] for value in media_timestamps] if media_timestamps and all(math.isfinite(value) for value in media_timestamps) else []
        timing_ok = (
            len(normalized) == expected_frame_count == len(expected_timestamps_s)
            and all(abs(actual - expected) <= .003 for actual, expected in zip(normalized, expected_timestamps_s))
        )
        self.check(
            "ffv1_master_media_timing" if master else "review_mp4_media_timing", timing_ok,
            f"{path.name} decoded timestamps do not reproduce the CDP-derived delivered-frame timeline",
            {"expected_frame_count": expected_frame_count, "observed_timestamp_count": len(normalized), "max_error_s": max((abs(actual - expected) for actual, expected in zip(normalized, expected_timestamps_s)), default=None)},
        )
        decode = subprocess.run(
            [ffmpeg, "-v", "error", "-i", str(path), "-map", "0:v:0", "-f", "null", "-"],
            text=True, capture_output=True, check=False, timeout=180,
        )
        self.check(
            "ffv1_master_decode" if master else "review_mp4_decode", decode.returncode == 0,
            f"{path.name} does not independently decode to completion",
            {"returncode": decode.returncode, "stderr": decode.stderr[-1000:]},
        )

    def admit_custody_path(self, raw: Any, base: Path, label: str,
                           expected_hash: Any = None) -> Path | None:
        if not isinstance(raw, str) or not raw.strip():
            self.fail("invalid_custody_path", f"{label} path must be a non-empty string")
            return None
        candidate = Path(raw)
        path = lexical_absolute(candidate if candidate.is_absolute() else base / candidate)
        try:
            assert self.evidence_root is not None
            self.ensure_under(path, self.evidence_root, label)
        except (ValueError, AssertionError) as error:
            self.fail("custody_path_escape", str(error))
            return None
        self.referenced_evidence.add(path)
        if not path.is_file():
            self.fail("missing_custody_file", f"{label} is missing: {path}")
            return path
        if expected_hash is not None and (not isinstance(expected_hash, str) or sha256(path) != expected_hash):
            self.fail("custody_hash_mismatch", f"{label} hash mismatch")
        self.root_has(path, label)
        return path

    def validate_replacement_capture(self, replacement: Any, ledger: dict[str, Any],
                                     finding: dict[str, Any], label: str) -> dict[str, Any] | None:
        try:
            projected = frame_review.validate_replacement_capture(replacement, ledger, finding)
        except Exception as error:
            self.fail("replacement_package_invalid", f"{label}: {error}")
            return None
        if projected.get("artifact_sha256") != self.artifact_sha or projected.get("denominator_sha256") != self.film_denominator_sha or projected.get("configuration_sha256") != self.film_configuration_sha or projected.get("runner_sha256") != self.film_runner_sha:
            self.fail("replacement_package_provenance_mismatch", f"{label} replacement package targets another artifact/denominator/runner/configuration")
        chapter = finding.get("chapter")
        expected_actions = self.film_chapter_actions.get(chapter)
        if not isinstance(expected_actions, list) or projected.get("required_action_ids") != expected_actions:
            self.fail("replacement_package_chapter_denominator_mismatch", f"{label} does not re-record the authoritative action census for chapter {chapter}")
        package_path = self.admit_custody_path(
            projected.get("package_manifest_path"), Path(ledger.get("campaign_dir", "")),
            f"{label} replacement package manifest", projected.get("package_manifest_sha256")
        )
        if package_path is None:
            return None
        for index, record in enumerate(projected.get("custody_files", [])):
            self.admit_custody_path(record.get("path"), package_path.parent, f"{label} replacement custody {index}", record.get("sha256"))
        for index, binding in enumerate(projected.get("frame_hashes", [])):
            # Frame files are transitively checked by the package validator; root coverage
            # independently ensures no admitted evidence byte is omitted.
            if not isinstance(binding, dict) or not isinstance(binding.get("sha256"), str):
                self.fail("replacement_frame_binding", f"{label} replacement frame binding {index} is invalid")
        reruns = projected.get("aggregate_rerun_receipts")
        all_chapters = list(self.film_chapter_actions)
        all_actions = [action for chapter_actions in self.film_chapter_actions.values() for action in chapter_actions]
        if not isinstance(reruns, list) or len(reruns) != 2 or reruns[0].get("scope") != "chapter" or reruns[0].get("chapter_ids") != [chapter] or reruns[0].get("action_ids") != expected_actions or reruns[1].get("scope") != "aggregate" or reruns[1].get("chapter_ids") != all_chapters or reruns[1].get("action_ids") != all_actions:
            self.fail("replacement_aggregate_rerun_denominator_mismatch", f"{label} chapter/aggregate reruns do not close the authoritative campaign denominator")
        elif package_path is not None:
            aggregate_spec = reruns[1].get("campaign_report")
            aggregate_path = self.admit_custody_path(
                aggregate_spec.get("path") if isinstance(aggregate_spec, dict) else None,
                package_path.parent, f"{label} aggregate rerun campaign",
                aggregate_spec.get("sha256") if isinstance(aggregate_spec, dict) else None,
            )
            if aggregate_path is not None:
                aggregate_campaign = projected.get("aggregate_campaign")
                if not isinstance(aggregate_campaign, dict):
                    self.fail("replacement_aggregate_campaign_invalid", f"{label} aggregate rerun campaign was not descriptor-opened and projected")
                else:
                    self.validate_exact_browser_identity(aggregate_campaign.get("browser_identity"), f"{label} aggregate rerun")
                    aggregate_chapters = [row.get("id") for row in aggregate_campaign.get("chapters", []) if isinstance(row, dict)]
                    aggregate_actions = [row.get("id") for row in aggregate_campaign.get("actions", []) if isinstance(row, dict)]
                    if (aggregate_campaign.get("schema_id") != "pm.pmconcept7.final_capture_campaign.v1"
                            or aggregate_campaign.get("campaign") != "final"
                            or aggregate_campaign.get("source_sha256") != self.artifact_sha
                            or aggregate_campaign.get("denominator", {}).get("sha256") != self.film_denominator_sha
                            or aggregate_campaign.get("configuration_sha256") != self.film_configuration_sha
                            or aggregate_campaign.get("runner", {}).get("sha256") != self.film_runner_sha
                            or aggregate_campaign.get("target_fps") != 60
                            or aggregate_campaign.get("no_resampling_claim") is not True
                            or aggregate_campaign.get("disposition") != "captured_browser_concept_evidence"
                            or aggregate_campaign.get("runtime_errors") not in (None, [])
                            or aggregate_chapters != all_chapters or aggregate_actions != all_actions
                            or any(row.get("disposition") != "captured" for row in aggregate_campaign.get("actions", []) if isinstance(row, dict))):
                        self.fail("replacement_aggregate_campaign_incomplete", f"{label} aggregate rerun is not backed by one distinct complete final-campaign report")
        replacement_frames = projected.get("replacement_frames")
        if isinstance(replacement_frames, list) and replacement_frames:
            media_width = max(row.get("width", 0) for row in replacement_frames if isinstance(row, dict))
            media_height = max(row.get("height", 0) for row in replacement_frames if isinstance(row, dict))
            first_cdp = replacement_frames[0].get("cdp_timestamp_s")
            timestamps = [row.get("cdp_timestamp_s") - first_cdp for row in replacement_frames] if isinstance(first_cdp, (int, float)) and not isinstance(first_cdp, bool) else []
            for key, master in (("ffv1_master", True), ("review_mp4", False)):
                media_spec = projected.get(key)
                media_path = self.admit_custody_path(media_spec.get("path") if isinstance(media_spec, dict) else None, package_path.parent, f"{label} {key}", media_spec.get("sha256") if isinstance(media_spec, dict) else None)
                if media_path is not None and media_path.is_file():
                    self.validate_media_stream(media_path, master=master, expected_width=media_width, expected_height=media_height, expected_frame_count=len(replacement_frames), expected_timestamps_s=timestamps)
        else:
            self.fail("replacement_frame_census_missing", f"{label} replacement package has no media/frame denominator")
        aggregate_frames = projected.get("aggregate_frames")
        if isinstance(aggregate_frames, list) and aggregate_frames:
            media_width = max(row.get("width", 0) for row in aggregate_frames if isinstance(row, dict))
            media_height = max(row.get("height", 0) for row in aggregate_frames if isinstance(row, dict))
            first_cdp = aggregate_frames[0].get("cdp_timestamp_s")
            timestamps = [row.get("cdp_timestamp_s") - first_cdp for row in aggregate_frames] if isinstance(first_cdp, (int, float)) and not isinstance(first_cdp, bool) else []
            for key, master in (("aggregate_ffv1_master", True), ("aggregate_review_mp4", False)):
                media_spec = projected.get(key)
                media_path = self.admit_custody_path(media_spec.get("path") if isinstance(media_spec, dict) else None, package_path.parent, f"{label} {key}", media_spec.get("sha256") if isinstance(media_spec, dict) else None)
                if media_path is not None:
                    self.validate_media_stream(media_path, master=master, expected_width=media_width, expected_height=media_height, expected_frame_count=len(aggregate_frames), expected_timestamps_s=timestamps)
        else:
            self.fail("replacement_aggregate_frame_census_missing", f"{label} aggregate replacement package has no distinct frame/media/review denominator")
        return projected

    def validate_film(self, runners: dict[str, dict[str, Any]]) -> None:
        film = self.manifest.get("film")
        if not isinstance(film, dict):
            self.fail("missing_film", "film evidence is required")
            return
        labels = {
            "campaign_report": ("campaign report", "pm.pmconcept7.final_capture_campaign.v1"),
            "artifact_manifest": ("capture artifact manifest", "pm.capture.artifact_manifest.v1"),
            "frame_index": ("frame index", "pm.capture.delivered_compositor_frame_index.v1"),
            "scenario_manifest": ("film scenario manifest", "pm.capture.scenario_manifest.v1"),
            "coverage_manifest": ("film coverage manifest", "pm.capture.final_campaign_coverage.v1"),
            "action_timing": ("film action timing", "pm.capture.action_timing.v1"),
            "timing_report": ("film timing report", "pm.capture.delivered_frame_timing.v1"),
            "review_ledger": ("full-frame review ledger", REVIEW_LEDGER_SCHEMA),
            "contact_sheet_index": ("contact-sheet index", CONTACT_INDEX_SCHEMA),
            "full_frame_review_index": ("full-frame review index", None),
            "terminal_review_receipt": ("terminal frame-review receipt", TERMINAL_REVIEW_SCHEMA),
        }
        loaded: dict[str, tuple[Path, dict[str, Any]]] = {}
        for key, (label, schema) in labels.items():
            if schema is None:
                path = self.validate_binary_ref(film.get(key), label)
                if path is not None:
                    loaded[key] = (path, {})
            else:
                path, value = self.load_ref(film.get(key), label, expected_schema=schema)
                if path is not None and isinstance(value, dict):
                    loaded[key] = (path, value)
                    self.root_has(path, label)
                    self.scan_false_certification(value, label)
        if len(loaded) != len(labels):
            return
        campaign_path, campaign = loaded["campaign_report"]
        artifact_manifest_path, artifact_manifest = loaded["artifact_manifest"]
        frame_index_path, frame_index = loaded["frame_index"]
        scenario_manifest_path, scenario_manifest = loaded["scenario_manifest"]
        coverage_path, coverage = loaded["coverage_manifest"]
        action_timing_path, action_timing = loaded["action_timing"]
        timing_path, timing = loaded["timing_report"]
        ledger_path, ledger = loaded["review_ledger"]
        contact_path, contact = loaded["contact_sheet_index"]
        terminal_path, terminal = loaded["terminal_review_receipt"]
        denominator_path, denominator = self.load_ref(film.get("denominator"), "authoritative final campaign denominator", evidence=False, expected_schema=DENOMINATOR_SCHEMA)
        if denominator_path != DENOMINATOR_PATH or not isinstance(denominator, dict) or sha256(DENOMINATOR_PATH) != film.get("denominator", {}).get("sha256"):
            self.fail("film_denominator_not_authoritative", "film denominator is not the exact repo-owned final campaign denominator")
            return
        chapter_contracts = denominator.get("chapters")
        if not isinstance(chapter_contracts, list) or len(chapter_contracts) < 14:
            self.fail("film_denominator_incomplete", "authoritative final campaign denominator has no complete chapter census")
            return
        if (denominator.get("semantic_census_sha256") != FINAL_DENOMINATOR_SEMANTIC_SHA256
                or denominator_semantic_sha256(denominator) != FINAL_DENOMINATOR_SEMANTIC_SHA256
                or denominator.get("required_widths") != EXACT_REQUIRED_WIDTHS
                or denominator.get("source_refs") != EXACT_DENOMINATOR_SOURCE_REFS):
            self.fail("film_denominator_semantic_drift", "repo-owned denominator differs from the pinned 18-width/ATS-039/189-action semantic census")
            return
        expected_scenarios = [row.get("id") for row in chapter_contracts if isinstance(row, dict)]
        expected_actions = [action for row in chapter_contracts if isinstance(row, dict) for action in row.get("actions", [])]
        touched_modules = denominator.get("touched_modules")
        module_ids = [row.get("id") for row in touched_modules if isinstance(row, dict)] if isinstance(touched_modules, list) else []
        module_chapters = {chapter for row in touched_modules or [] if isinstance(row, dict) for chapter in row.get("chapter_ids", [])}
        if len(expected_scenarios) != 14 or len(expected_actions) != 189 or len(expected_scenarios) != len(set(expected_scenarios)) or len(expected_actions) != len(set(expected_actions)) or "usage-ats039-motion" not in expected_scenarios or not module_ids or len(module_ids) != len(set(module_ids)) or "usage-workspace-motion" not in module_ids or module_chapters != set(expected_scenarios):
            self.fail("film_denominator_incomplete", "authoritative denominator IDs are duplicated or omit ATS-039 Usage motion")
        denominator_hash = sha256(denominator_path)
        self.film_chapter_actions = {row["id"]: list(row["actions"]) for row in chapter_contracts}
        if campaign.get("campaign") != "final" or campaign.get("source_sha256") != self.artifact_sha or campaign.get("disposition") != "captured_browser_concept_evidence":
            self.fail("film_campaign_failure", "final capture campaign is failed, partial, or bound to another artifact")
        if campaign.get("no_resampling_claim") is not True or campaign.get("target_fps") != 60 or film.get("target_fps") != 60:
            self.fail("film_fps_claim_invalid", "capture FPS/no-resampling binding is invalid")
        campaign_denominator = campaign.get("denominator")
        if not isinstance(campaign_denominator, dict) or campaign_denominator.get("sha256") != denominator_hash or campaign_denominator.get("schema_id") != DENOMINATOR_SCHEMA:
            self.fail("film_denominator_binding", "campaign report does not bind the authoritative denominator hash")
        runner = runners.get(film.get("runner_id"))
        campaign_runner = campaign.get("runner")
        if runner is None or not isinstance(campaign_runner, dict) or campaign_runner.get("sha256") != runner.get("sha256") or campaign_runner.get("path") != str(runner.get("path")):
            self.fail("film_runner_unbound", "campaign report is not bound to the manifest-admitted capture runner")
        self.film_denominator_sha = denominator_hash
        self.film_runner_sha = str((runner or {}).get("sha256", ""))
        command = campaign.get("command")
        if command != film.get("expected_command") or not isinstance(command, dict) or not isinstance(command.get("argv"), list) or not command["argv"] or not isinstance(command.get("cwd"), str):
            self.fail("film_command_unbound", "campaign command differs from the exact manifest-bound invocation")
        configuration = campaign.get("configuration")
        configuration_hash = canonical_sha256(configuration) if isinstance(configuration, dict) else None
        if configuration_hash != film.get("expected_configuration_sha256") or campaign.get("configuration_sha256") != configuration_hash or not isinstance(configuration, dict) or configuration.get("target_fps") != 60 or configuration.get("spatial_downscaling") is not False or configuration.get("denominator_sha256") != denominator_hash:
            self.fail("film_configuration_unbound", "campaign capture configuration is missing, stale, or permits spatial/timing substitution")
        self.film_configuration_sha = str(configuration_hash or "")
        identity = campaign.get("browser_identity")
        identity_fields = ("product", "version", "channel", "user_agent", "executable_path", "executable_sha256", "playwright_version")
        if not isinstance(identity, dict) or not all(isinstance(identity.get(key), str) and identity[key] for key in identity_fields) or not HEX64.fullmatch(str(identity.get("executable_sha256", ""))):
            self.fail("film_browser_identity_missing", "campaign lacks exact browser binary and Playwright provenance")
        else:
            browser_executable = Path(identity["executable_path"])
            browser_identity_ok = (
                browser_executable.is_absolute()
                and not browser_executable.is_symlink()
                and browser_executable.is_file()
                and browser_executable.resolve() == browser_executable
                and sha256(browser_executable) == identity["executable_sha256"]
            )
            if not browser_identity_ok:
                self.fail("film_browser_identity_unverifiable", "campaign browser executable is missing, symlinked, noncanonical, or differs from its recorded SHA-256")
        campaign_media = campaign.get("media")
        if not isinstance(campaign_media, dict) or campaign_media.get("disposition") != "encoded" or campaign.get("runtime_errors") not in (None, []):
            self.fail("film_media_incomplete", "film media is missing/failed or the campaign has runtime errors")
        actions = campaign.get("actions")
        if not isinstance(actions, list) or not actions or any(not isinstance(row, dict) or row.get("disposition") == "failed" for row in actions):
            self.fail("film_action_failure", "film actions are missing or failed")
        scenario_rows = scenario_manifest.get("scenarios")
        actual_scenarios = [row.get("id") for row in scenario_rows if isinstance(row, dict)] if isinstance(scenario_rows, list) else []
        if actual_scenarios != expected_scenarios:
            self.fail("film_scenario_census_mismatch", "film scenario identifiers are missing or incomplete")
        if scenario_manifest.get("source_sha256") != self.artifact_sha or scenario_manifest.get("campaign") != "final" or scenario_manifest.get("denominator_sha256") != denominator_hash or scenario_manifest.get("configuration_sha256") != configuration_hash:
            self.fail("film_scenario_artifact_mismatch", "film scenario manifest targets another campaign/artifact")
        scenario_contract_rows = []
        for row, contract in zip(scenario_rows or [], chapter_contracts):
            if not isinstance(row, dict) or row.get("id") != contract.get("id") or row.get("capabilities") != contract.get("capabilities") or row.get("required_action_ids") != contract.get("actions"):
                self.fail("film_scenario_contract_drift", f"scenario {contract.get('id')} differs from the authoritative capability/action contract")
            scenario_contract_rows.append(row)
        campaign_actions = campaign.get("actions")
        actual_action_ids = [row.get("id") for row in campaign_actions if isinstance(row, dict)] if isinstance(campaign_actions, list) else []
        if actual_action_ids != expected_actions or any(row.get("disposition") != "captured" for row in campaign_actions or [] if isinstance(row, dict)):
            self.fail("film_action_census_mismatch", "campaign action order/census/disposition differs from the authoritative denominator")
        campaign_chapters = campaign.get("chapters")
        actual_chapter_ids = [row.get("id") for row in campaign_chapters if isinstance(row, dict)] if isinstance(campaign_chapters, list) else []
        if actual_chapter_ids != expected_scenarios:
            self.fail("film_chapter_census_mismatch", "campaign chapter census differs from the authoritative denominator")
        else:
            for row, contract in zip(campaign_chapters, chapter_contracts):
                if row.get("action_ids") != contract.get("actions") or row.get("missing_action_ids") != [] or row.get("unexpected_action_ids") != [] or row.get("failed_action_ids") != [] or row.get("coverage_complete") is not True:
                    self.fail("film_chapter_contract_drift", f"campaign chapter {contract.get('id')} is incomplete or has unexpected actions")
        coverage_chapters = coverage.get("chapters")
        if coverage.get("campaign") != "final" or coverage.get("source_sha256") != self.artifact_sha or coverage.get("denominator_sha256") != denominator_hash or coverage.get("configuration_sha256") != configuration_hash or coverage.get("requested_fps") != 60 or coverage.get("no_resampling_claim") is not True:
            self.fail("film_coverage_binding", "coverage manifest is stale or bound to another campaign configuration")
        if not isinstance(coverage.get("observed"), dict) or coverage["observed"].get("complete") is not True or [row.get("id") for row in coverage_chapters or [] if isinstance(row, dict)] != expected_scenarios:
            self.fail("film_coverage_census", "coverage manifest does not close the authoritative chapter denominator")
        else:
            for row, contract in zip(coverage_chapters, chapter_contracts):
                if row.get("required_action_ids") != contract.get("actions") or row.get("action_ids") != contract.get("actions") or row.get("missing_action_ids") != [] or row.get("failed_action_ids") != [] or row.get("coverage_complete") is not True:
                    self.fail("film_coverage_action_drift", f"coverage chapter {contract.get('id')} differs from the authoritative action denominator")
        if action_timing.get("source_sha256") != self.artifact_sha or action_timing.get("denominator_sha256") != denominator_hash or action_timing.get("actions") != campaign_actions:
            self.fail("film_action_timing_drift", "action timing does not exactly bind the admitted campaign action census")
        artifact_rows = artifact_manifest.get("artifacts")
        campaign_dir = campaign_path.parent
        artifact_index: dict[Path, dict[str, Any]] = {}
        if not isinstance(artifact_rows, list) or not artifact_rows:
            self.fail("empty_capture_artifact_manifest", "capture artifact manifest is empty")
        else:
            for index, row in enumerate(artifact_rows):
                if not isinstance(row, dict) or not isinstance(row.get("path"), str) or Path(row["path"]).is_absolute():
                    self.fail("invalid_capture_artifact", f"capture artifact {index} is invalid")
                    continue
                path = lexical_absolute(campaign_dir / row["path"])
                try:
                    assert self.evidence_root is not None
                    self.ensure_under(path, self.evidence_root, f"capture artifact {index}")
                except (ValueError, AssertionError) as error:
                    self.fail("capture_artifact_escape", str(error))
                    continue
                self.referenced_evidence.add(path)
                artifact_index[path] = row
                if not path.is_file() or row.get("sha256") != sha256(path) or row.get("bytes") != path.stat().st_size:
                    self.fail("capture_artifact_stale", f"capture artifact {index} is missing or stale")
                self.root_has(path, f"capture artifact {index}")
        required_capture_names = {"frame-index.json", "console-log.json", "network-log.json", "scenario-manifest.json", "coverage-manifest.json", "action-timing.json", "timing-report.json"}
        observed_capture_names = {path.name for path in artifact_index}
        if not required_capture_names.issubset(observed_capture_names):
            self.fail("capture_artifact_census_incomplete", f"capture artifact manifest omits {sorted(required_capture_names - observed_capture_names)}")
        admitted_media_paths: dict[str, Path] = {}
        media = film.get("required_media")
        if not isinstance(media, list) or len(media) < 2:
            self.fail("missing_film_media", "FFV1/MKV master and review MP4 are required")
        else:
            suffixes = set()
            media_paths: dict[str, Path] = {}
            for index, spec in enumerate(media):
                path = self.validate_binary_ref(spec, f"film media {index}")
                if path is not None:
                    suffixes.add(path.suffix.lower())
                    media_paths[path.suffix.lower()] = path
                    if path not in artifact_index:
                        self.fail("media_not_in_capture_manifest", f"film media is absent from capture artifact manifest: {path}")
            if ".mkv" not in suffixes or ".mp4" not in suffixes:
                self.fail("missing_film_format", "both .mkv FFV1 master and .mp4 review media are required")
            else:
                admitted_media_paths = media_paths
                master_report = campaign_media.get("ffv1_master") if isinstance(campaign_media, dict) else None
                review_report = campaign_media.get("review_mp4") if isinstance(campaign_media, dict) else None
                if not isinstance(master_report, dict) or master_report.get("success") is not True or master_report.get("probe_proves_ffv1") is not True or master_report.get("path") != media_paths[".mkv"].name or master_report.get("sha256") != sha256(media_paths[".mkv"]):
                    self.fail("film_master_report_drift", "campaign FFV1 probe/hash/path does not bind the admitted MKV")
                if not isinstance(review_report, dict) or review_report.get("success") is not True or review_report.get("path") != media_paths[".mp4"].name or review_report.get("sha256") != sha256(media_paths[".mp4"]):
                    self.fail("film_review_media_drift", "campaign review-MP4 hash/path does not bind the admitted MP4")
        if frame_index.get("source_sha256") != self.artifact_sha or frame_index.get("no_resampling_claim") is not True or frame_index.get("target_fps") != 60 or frame_index.get("denominator_sha256") != denominator_hash or frame_index.get("configuration_sha256") != configuration_hash or frame_index.get("full_resolution_census_complete") is not True:
            self.fail("frame_index_binding_failure", "frame index target/hash/FPS binding is invalid")
        frames = frame_index.get("frames")
        if not isinstance(frames, list) or not frames:
            self.fail("missing_frames", "frame index is empty")
            frames = []
        indexes = [row.get("index") for row in frames if isinstance(row, dict)]
        if indexes != list(range(len(frames))):
            self.fail("frame_index_not_contiguous", "frame indexes must be ordered, unique, contiguous, and zero-based")
        frame_by_index: dict[int, dict[str, Any]] = {}
        observed_frame_chapters: set[str] = set()
        responsive_widths: set[int] = set()
        for row in frames:
            if not isinstance(row, dict) or not isinstance(row.get("path"), str):
                self.fail("invalid_frame", "frame row is invalid")
                continue
            path = lexical_absolute(frame_index_path.parent / row["path"])
            try:
                assert self.evidence_root is not None
                self.ensure_under(path, self.evidence_root, f"frame {row.get('index')}")
            except (ValueError, AssertionError) as error:
                self.fail("frame_path_escape", str(error))
                continue
            self.referenced_evidence.add(path)
            if not path.is_file() or row.get("sha256") != sha256(path):
                self.fail("frame_hash_mismatch", f"frame {row.get('index')} is missing or stale")
            try:
                actual_png_width, actual_png_height = png_dimensions(path)
            except Exception as error:
                actual_png_width, actual_png_height = None, None
                self.fail("frame_png_invalid", f"frame {row.get('index')} is not a valid lossless PNG: {error}")
            self.root_has(path, f"frame {row.get('index')}")
            width, height = row.get("width"), row.get("height")
            viewport_width, viewport_height, dpr = row.get("viewport_width"), row.get("viewport_height"), row.get("device_scale_factor")
            expected_width = round(viewport_width * dpr) if isinstance(viewport_width, (int, float)) and not isinstance(viewport_width, bool) and isinstance(dpr, (int, float)) and not isinstance(dpr, bool) else None
            expected_height = round(viewport_height * dpr) if isinstance(viewport_height, (int, float)) and not isinstance(viewport_height, bool) and isinstance(dpr, (int, float)) and not isinstance(dpr, bool) else None
            if dpr != 1 or not isinstance(viewport_height, (int, float)) or viewport_height <= 0 or width != actual_png_width or height != actual_png_height or width != expected_width or height != expected_height or row.get("expected_width") != expected_width or row.get("expected_height") != expected_height or row.get("full_resolution") is not True:
                self.fail("frame_not_full_viewport_resolution", f"frame {row.get('index')} is not exact viewport x DPR lossless source evidence")
            chapter_id = row.get("chapter")
            if chapter_id not in expected_scenarios:
                self.fail("frame_unknown_chapter", f"frame {row.get('index')} is assigned to an unknown or missing chapter")
            else:
                observed_frame_chapters.add(chapter_id)
                if chapter_id == "responsive-matrix" and isinstance(viewport_width, int):
                    responsive_widths.add(viewport_width)
            frame_by_index[row.get("index")] = row
        if observed_frame_chapters != set(expected_scenarios):
            self.fail("frame_chapter_census_incomplete", f"delivered frames omit authoritative chapters: {sorted(set(expected_scenarios) - observed_frame_chapters)}")
        required_widths = set(denominator.get("required_widths", []))
        if not required_widths.issubset(responsive_widths):
            self.fail("responsive_full_resolution_census_incomplete", f"responsive delivered-frame widths are missing: {sorted(required_widths - responsive_widths)}")
        if frames and {".mkv", ".mp4"}.issubset(admitted_media_paths):
            media_width = max(row.get("width", 0) for row in frames if isinstance(row, dict))
            media_height = max(row.get("height", 0) for row in frames if isinstance(row, dict))
            if not isinstance(media_width, int) or not isinstance(media_height, int) or media_width <= 0 or media_height <= 0:
                self.fail("film_media_spatial_denominator_invalid", "delivered frames do not yield a valid media dimension denominator")
            else:
                first_cdp = frames[0].get("cdp_timestamp_s")
                expected_media_timestamps = [row.get("cdp_timestamp_s") - first_cdp for row in frames] if isinstance(first_cdp, (int, float)) and not isinstance(first_cdp, bool) and all(isinstance(row.get("cdp_timestamp_s"), (int, float)) and not isinstance(row.get("cdp_timestamp_s"), bool) for row in frames) else []
                self.validate_media_stream(admitted_media_paths[".mkv"], master=True, expected_width=media_width, expected_height=media_height, expected_frame_count=len(frames), expected_timestamps_s=expected_media_timestamps)
                self.validate_media_stream(admitted_media_paths[".mp4"], master=False, expected_width=media_width, expected_height=media_height, expected_frame_count=len(frames), expected_timestamps_s=expected_media_timestamps)
        observations = timing.get("observations")
        if timing.get("requested_fps") != 60 or timing.get("no_resampling_claim") is not True or timing.get("source_sha256") != self.artifact_sha or timing.get("denominator_sha256") != denominator_hash or timing.get("clock_domain") != "Chrome DevTools screencast metadata timestamp" or observations != campaign.get("observations"):
            self.fail("film_timing_binding", "timing report is stale, incomplete, or differs from the campaign report")
        try:
            recomputed = recompute_frame_timing(frames, 60)
        except Exception as error:
            self.fail("film_timing_invalid", str(error))
            recomputed = None
        if recomputed is not None:
            census_ok = (
                isinstance(observations, dict) and observations.get("cadence_valid") is True
                and observations.get("capture_evidence_admissible") is True
                and observations.get("cadence_claim_available") is True
                and observations.get("cadence_failure_reasons") == []
                and observations.get("delivered_frame_count") == recomputed["delivered_frame_count"]
                and observations.get("delivered_fps") == recomputed["delivered_fps"]
                and observations.get("interval_ms") == recomputed["interval_ms"]
                and observations.get("receiver_interval_ms") == recomputed["receiver_interval_ms"]
                and observations.get("delayed_interval_count") == recomputed["delayed_interval_count"]
                and observations.get("dropped_frame_equivalent_estimate") == recomputed["dropped_frame_equivalent_estimate"]
                and observations.get("cdp_timestamp_census", {}).get("raw_frame_count") == len(frames)
                and observations.get("cdp_timestamp_census", {}).get("usable_timestamp_count") == len(frames)
                and observations.get("cdp_timestamp_census", {}).get("complete") is True
                and observations.get("cdp_timestamp_census", {}).get("strictly_monotonic") is True
                and observations.get("receiver_timestamp_census", {}).get("raw_frame_count") == len(frames)
                and observations.get("receiver_timestamp_census", {}).get("usable_timestamp_count") == len(frames)
                and observations.get("receiver_timestamp_census", {}).get("complete") is True
                and observations.get("receiver_timestamp_census", {}).get("strictly_monotonic") is True
                and observations.get("repeated_frame_estimate", {}).get("hash_census_complete") is True
                and observations.get("repeated_frame_estimate", {}).get("estimated_repeated_frame_count") == recomputed["repeated_frame_count"]
                and observations.get("repeated_frame_estimate", {}).get("distinct_lossless_frame_hash_count") == recomputed["distinct_frame_hash_count"]
            )
            if not census_ok:
                self.fail("film_timing_recomputation_mismatch", "timing/cadence/degradation fields do not recompute from every delivered frame")
        ledger_source_path = lexical_absolute(Path(ledger.get("source_frame_index", ""))) if isinstance(ledger.get("source_frame_index"), str) else None
        ledger_campaign_dir = lexical_absolute(Path(ledger.get("campaign_dir", ""))) if isinstance(ledger.get("campaign_dir"), str) else None
        if ledger.get("source_frame_index_sha256") != sha256(frame_index_path) or ledger_source_path != lexical_absolute(frame_index_path) or ledger_campaign_dir != frame_index_path.parent:
            self.fail("review_ledger_source_mismatch", "review ledger is not bound to the exact frame index")
        ledger_frames = ledger.get("frames")
        if not isinstance(ledger_frames, list) or len(ledger_frames) != len(frames):
            self.fail("review_frame_census_mismatch", "review ledger frame census differs from frame index")
            ledger_frames = []
        finding_ids_from_reviews: set[str] = set()
        review_source_records: set[tuple[str, str, str]] = set()
        for row in ledger_frames:
            source = frame_by_index.get(row.get("index")) if isinstance(row, dict) else None
            if not isinstance(row, dict) or source is None or row.get("path") != source.get("path") or row.get("sha256") != source.get("sha256"):
                self.fail("review_frame_binding_mismatch", "review ledger frame does not bind the indexed source frame")
                continue
            required = row.get("required_review_count")
            reviews = row.get("reviews")
            valid_reviewers = {review.get("reviewer") for review in reviews or [] if isinstance(review, dict) and review.get("full_resolution_attested") is True}
            assigned = row.get("assigned_reviewers")
            if row.get("status") != "complete" or not isinstance(required, int) or required < 1 or not isinstance(assigned, list) or len(valid_reviewers) < required or not valid_reviewers.issubset(set(assigned)):
                self.fail("incomplete_frame_review", f"frame {row.get('index')} lacks required completed full-resolution reviews")
            for review in reviews or []:
                if isinstance(review, dict):
                    if review.get("frame_index") != row.get("index") or review.get("frame_sha256") != row.get("sha256"):
                        self.fail("frame_review_custody_mismatch", f"frame {row.get('index')} review does not bind its exact frame hash")
                    source_path = self.admit_custody_path(review.get("findings_path"), ledger_path.parent, f"frame {row.get('index')} review findings", review.get("findings_sha256"))
                    if source_path is None:
                        self.fail("missing_review_findings_receipt", f"frame {row.get('index')} review lacks an immutable findings receipt")
                    else:
                        review_source_records.add((str(source_path), str(review.get("findings_sha256")), str(review.get("reviewer"))))
                    finding_ids_from_reviews.update(value for value in (review.get("finding_ids") or []) if isinstance(value, str) and value)
        ledger_summary = ledger.get("summary")
        if not isinstance(ledger_summary, dict) or ledger_summary.get("complete") != len(frames) or ledger_summary.get("pending") != 0 or ledger_summary.get("partial") != 0:
            self.fail("review_summary_incomplete", "frame review summary is not fully complete")
        contact_ref = ledger.get("contact_sheet_index")
        if not isinstance(contact_ref, dict) or self.admit_custody_path(contact_ref.get("path"), ledger_path.parent, "ledger contact-sheet index", contact_ref.get("sha256")) != contact_path:
            self.fail("contact_sheet_ledger_binding", "ledger does not bind the exact admitted contact-sheet index")
        sheets = contact.get("sheets")
        if contact.get("all_frames_covered_exactly_once") is not True or contact.get("navigation_only") is not True or not isinstance(sheets, list) or not sheets:
            self.fail("contact_sheet_census_incomplete", "contact sheets are missing or do not cover every frame exactly once")
            sheets = []
        covered: list[int] = []
        stable_contact: list[dict[str, Any]] = []
        contact_surfaces: list[dict[str, Any]] = []
        for index, sheet in enumerate(sheets):
            if not isinstance(sheet, dict) or not isinstance(sheet.get("frame_indexes"), list):
                self.fail("invalid_contact_sheet", f"contact sheet {index} is invalid")
                continue
            covered.extend(sheet["frame_indexes"])
            for kind in ("html", "png"):
                raw_path = sheet.get(kind)
                declared_hash = sheet.get(f"{kind}_sha256")
                if not isinstance(raw_path, str) or not isinstance(declared_hash, str):
                    self.fail("missing_contact_sheet_artifact", f"contact sheet {index} lacks {kind} and hash")
                    continue
                path = lexical_absolute(Path(raw_path) if Path(raw_path).is_absolute() else contact_path.parent / raw_path)
                try:
                    assert self.evidence_root is not None
                    self.ensure_under(path, self.evidence_root, f"contact sheet {index} {kind}")
                except (ValueError, AssertionError) as error:
                    self.fail("contact_sheet_escape", str(error))
                    continue
                self.referenced_evidence.add(path)
                if not path.is_file() or sha256(path) != declared_hash:
                    self.fail("contact_sheet_hash_mismatch", f"contact sheet {index} {kind} is missing or stale")
                self.root_has(path, f"contact sheet {index} {kind}")
            stable = {
                "surface_id": sheet.get("surface_id"), "kind": "contact_sheet",
                "frame_indexes": sheet.get("frame_indexes"), "html_sha256": sheet.get("html_sha256"),
                "png_sha256": sheet.get("png_sha256"),
            }
            stable["surface_sha256"] = canonical_sha256(stable)
            if not isinstance(stable["surface_id"], str) or sheet.get("kind") != "contact_sheet" or sheet.get("surface_sha256") != stable["surface_sha256"]:
                self.fail("contact_surface_hash_mismatch", f"contact sheet {index} surface identity/hash is invalid")
            stable_contact.append(stable)
            contact_surfaces.append({key: stable[key] for key in ("surface_id", "kind", "surface_sha256", "frame_indexes")})
        if covered != list(range(len(frames))):
            self.fail("contact_sheet_frame_mismatch", "contact sheet frame coverage is not exact, ordered, and once-only")
        if contact.get("deterministic_sheet_set_sha256") != canonical_sha256(stable_contact):
            self.fail("contact_sheet_set_hash_mismatch", "contact-sheet deterministic set hash is stale")

        multi_surfaces: list[dict[str, Any]] = []
        for record_index, record in enumerate(ledger.get("multi_view_indexes", [])):
            if not isinstance(record, dict):
                self.fail("invalid_multi_view_index", f"multi-view record {record_index} is invalid")
                continue
            multi_path = self.admit_custody_path(record.get("path"), ledger_path.parent, f"multi-view index {record_index}", record.get("sha256"))
            if multi_path is None or not multi_path.is_file():
                continue
            try:
                multi = load_json(multi_path)
            except Exception as error:
                self.fail("invalid_multi_view_index", f"multi-view index {record_index}: {error}")
                continue
            if multi.get("schema_id") != MULTI_VIEW_INDEX_SCHEMA or not isinstance(multi.get("sheets"), list):
                self.fail("invalid_multi_view_index", f"multi-view index {record_index} schema/sheets are invalid")
                continue
            ids = []
            for surface_index, item in enumerate(multi["sheets"]):
                if not isinstance(item, dict) or not isinstance(item.get("surface_id"), str):
                    self.fail("invalid_multi_view_surface", f"multi-view {record_index}/{surface_index} is invalid")
                    continue
                artifact_path = self.admit_custody_path(item.get("path"), multi_path.parent, f"multi-view surface {item.get('surface_id')}", item.get("sha256"))
                if artifact_path is None:
                    continue
                ids.append(item["surface_id"])
                projection = {
                    "surface_id": item["surface_id"], "kind": "multi_view_sheet",
                    "artifact_sha256": item.get("sha256"), "frame_indexes": item.get("frame_indexes", []),
                }
                multi_surfaces.append({
                    "surface_id": projection["surface_id"], "kind": projection["kind"],
                    "artifact_path": str(artifact_path), "artifact_sha256": projection["artifact_sha256"],
                    "frame_indexes": projection["frame_indexes"], "surface_sha256": canonical_sha256(projection),
                })
            if record.get("surface_ids") != ids:
                self.fail("multi_view_surface_census_mismatch", f"multi-view index {record_index} surface IDs differ")
        expected_surfaces = contact_surfaces + multi_surfaces
        if ledger.get("review_surfaces") != expected_surfaces:
            self.fail("review_surface_projection_mismatch", "ledger review surfaces differ from contact/multi-view source indexes")
        surface_ids = [row.get("surface_id") for row in expected_surfaces]
        if len(surface_ids) != len(set(surface_ids)):
            self.fail("duplicate_review_surface", "review surface IDs are not globally unique")

        findings = ledger.get("findings")
        if not isinstance(findings, list):
            self.fail("invalid_frame_findings", "ledger findings must be an array")
            findings = []
        findings_by_id = {row.get("id"): row for row in findings if isinstance(row, dict) and isinstance(row.get("id"), str)}
        if len(findings_by_id) != len(findings):
            self.fail("duplicate_frame_finding", "ledger finding IDs are invalid or duplicated")
        discovered: dict[str, dict[str, Any]] = {}
        findings_sources = ledger.get("finding_sources")
        if not isinstance(findings_sources, list):
            self.fail("invalid_finding_sources", "ledger finding_sources must be an array")
            findings_sources = []
        for source_index, source_record in enumerate(findings_sources):
            if not isinstance(source_record, dict):
                self.fail("invalid_finding_source", f"finding source {source_index} is invalid")
                continue
            source_path = self.admit_custody_path(source_record.get("path"), ledger_path.parent, f"finding source {source_index}", source_record.get("sha256"))
            if source_path is None or not source_path.is_file():
                continue
            raw = load_json(source_path)
            reporter = source_record.get("reviewer")
            if raw.get("schema_id") != FRAME_FINDINGS_SCHEMA or raw.get("reviewer") != reporter or not isinstance(raw.get("findings"), list):
                self.fail("finding_source_schema", f"finding source {source_index} schema/reviewer/census is invalid")
                continue
            for item in raw["findings"]:
                if not isinstance(item, dict) or not isinstance(item.get("id"), str):
                    self.fail("invalid_discovered_finding", f"finding source {source_index} contains an invalid finding")
                    continue
                finding_id = item["id"]
                indexes = item.get("frame_indexes")
                expected_hashes = [{"index": index, "sha256": frame_by_index[index]["sha256"]} for index in indexes or [] if index in frame_by_index]
                evidence = item.get("evidence")
                artifact_refs = evidence.get("artifact_refs") if isinstance(evidence, dict) else None
                chapter = item.get("chapter")
                if not isinstance(indexes, list) or not indexes or indexes != sorted(set(indexes)) or len(expected_hashes) != len(indexes) or any(frame_by_index[index].get("chapter") != chapter for index in indexes if index in frame_by_index) or not isinstance(evidence, dict) or not isinstance(evidence.get("summary"), str) or not evidence["summary"].strip() or not isinstance(artifact_refs, list) or not artifact_refs or not all(isinstance(ref, str) and ref.strip() for ref in artifact_refs) or evidence.get("frame_hashes") != expected_hashes or item.get("severity") not in {"blocker", "critical", "major", "minor", "note"} or item.get("status") != "unresolved" or item.get("repaired_by") is not None or item.get("replacement_capture") is not None:
                    self.fail("discovered_finding_custody", f"discovered finding {finding_id} does not bind exact source frames or initial state")
                normalized = {
                    "id": finding_id, "chapter": item.get("chapter"), "frame_indexes": indexes,
                    "severity": item.get("severity"), "evidence": evidence, "reported_by": reporter,
                }
                if finding_id in discovered and discovered[finding_id] != normalized:
                    self.fail("conflicting_discovered_finding", f"finding {finding_id} has conflicting immutable sources")
                discovered[finding_id] = normalized
        source_record_set = {
            (str(lexical_absolute(Path(record.get("path", "")))), str(record.get("sha256")), str(record.get("reviewer")))
            for record in findings_sources if isinstance(record, dict) and isinstance(record.get("path"), str)
        }
        if review_source_records != source_record_set:
            self.fail("review_finding_source_projection", "frame reviews and ledger finding_sources do not carry the same immutable receipt set")
        if set(discovered) != set(findings_by_id):
            self.fail("finding_source_census_mismatch", "ledger findings differ from immutable finding sources")
        for finding_id, source in discovered.items():
            current = findings_by_id[finding_id]
            if any(current.get(key) != value for key, value in source.items()):
                self.fail("finding_projection_drift", f"ledger finding {finding_id} drifted from its discovery source")
        if finding_ids_from_reviews != set(findings_by_id):
            self.fail("frame_review_finding_census", "frame review finding IDs differ from the ledger finding registry")
        ledger_frame_map = {row.get("index"): row for row in ledger_frames if isinstance(row, dict)}
        for finding_id, finding in findings_by_id.items():
            for frame_index in finding.get("frame_indexes", []):
                reporter_reviews = [
                    review for review in ledger_frame_map.get(frame_index, {}).get("reviews", [])
                    if isinstance(review, dict) and review.get("reviewer") == finding.get("reported_by")
                    and finding_id in (review.get("finding_ids") or []) and review.get("full_resolution_attested") is True
                ]
                if len(reporter_reviews) != 1:
                    self.fail("finding_reporter_review_custody", f"finding {finding_id} lacks one exact reporter review on frame {frame_index}")

        disposed: set[str] = set()
        disposition_receipts = ledger.get("finding_disposition_receipts")
        if not isinstance(disposition_receipts, list):
            self.fail("invalid_finding_dispositions", "finding_disposition_receipts must be an array")
            disposition_receipts = []
        for receipt_index, record in enumerate(disposition_receipts):
            if not isinstance(record, dict):
                self.fail("invalid_finding_disposition", f"finding disposition {receipt_index} is invalid")
                continue
            disposition_path = self.admit_custody_path(record.get("path"), ledger_path.parent, f"finding disposition {receipt_index}", record.get("sha256"))
            if disposition_path is None or not disposition_path.is_file():
                continue
            raw = load_json(disposition_path)
            if raw.get("schema_id") != FINDING_DISPOSITIONS_SCHEMA or not isinstance(raw.get("dispositions"), list) or not isinstance(raw.get("adjudicator"), str):
                self.fail("finding_disposition_schema", f"finding disposition {receipt_index} schema is invalid")
                continue
            receipt_ids = []
            for row in raw["dispositions"]:
                if not isinstance(row, dict) or row.get("finding_id") not in findings_by_id or row.get("finding_id") in disposed:
                    self.fail("finding_disposition_census", f"finding disposition {receipt_index} has duplicate/unknown IDs")
                    continue
                finding_id = row["finding_id"]
                disposed.add(finding_id); receipt_ids.append(finding_id)
                current = findings_by_id[finding_id]
                status = row.get("status")
                replacement = self.validate_replacement_capture(row.get("replacement_capture"), ledger, current, finding_id) if status == "repaired" else None
                evidence = row.get("evidence")
                refs = evidence.get("refs") if isinstance(evidence, dict) else None
                if status not in FINDING_TERMINAL_STATUSES or not isinstance(row.get("disposition_reason"), str) or not row["disposition_reason"].strip() or not isinstance(refs, list) or not refs or not all(isinstance(ref, str) and ref.strip() for ref in refs) or current.get("status") != status or current.get("disposition_reason") != row.get("disposition_reason") or current.get("disposition_evidence") != evidence or current.get("adjudicated_by") != raw.get("adjudicator"):
                    self.fail("finding_disposition_drift", f"finding {finding_id} terminal disposition drifted")
                if status == "repaired":
                    if not isinstance(row.get("repaired_by"), str) or not row["repaired_by"].strip() or not isinstance(row.get("repair_ref"), str) or not row["repair_ref"].strip() or current.get("repaired_by") != row.get("repaired_by") or current.get("repair_ref") != row.get("repair_ref") or current.get("replacement_capture") != replacement:
                        self.fail("finding_repair_custody", f"finding {finding_id} repair/replacement custody drifted")
                elif any(row.get(key) is not None or current.get(key) is not None for key in ("repaired_by", "repair_ref", "replacement_capture")):
                    self.fail("not_a_defect_repair_claim", f"finding {finding_id} not_a_defect disposition carries repair claims")
            if record.get("finding_ids") != sorted(receipt_ids):
                self.fail("finding_disposition_id_projection", f"finding disposition {receipt_index} ID projection drifted")
        if disposed != set(findings_by_id) or any(row.get("status") not in FINDING_TERMINAL_STATUSES for row in findings_by_id.values()):
            self.fail("unresolved_frame_finding", "not every frame finding has one immutable terminal disposition")

        primary_covered_surfaces: set[str] = set()
        primary_covered_findings: set[str] = set()
        primary_reviewers: set[str] = set()
        primary_records = ledger.get("primary_review_receipts")
        if not isinstance(primary_records, list) or not primary_records:
            self.fail("primary_review_missing", "ledger has no primary integrator review receipt")
            primary_records = []
        surface_map = {row["surface_id"]: row for row in expected_surfaces if isinstance(row.get("surface_id"), str)}
        for receipt_index, record in enumerate(primary_records):
            if not isinstance(record, dict):
                self.fail("primary_review_invalid", f"primary receipt {receipt_index} projection is invalid")
                continue
            primary_path = self.admit_custody_path(record.get("path"), ledger_path.parent, f"primary review {receipt_index}", record.get("sha256"))
            if primary_path is None or not primary_path.is_file():
                continue
            raw = load_json(primary_path)
            reviewer = record.get("reviewer")
            if raw.get("schema_id") != PRIMARY_REVIEW_SCHEMA or raw.get("reviewer") != reviewer or raw.get("reviewer_role") != "primary_integrator" or not isinstance(raw.get("surfaces"), list) or not isinstance(raw.get("defect_candidates"), list):
                self.fail("primary_review_schema", f"primary review {receipt_index} schema/identity is invalid")
                continue
            if not isinstance(raw.get("reviewed_at_utc"), str) or not raw["reviewed_at_utc"].strip() or not isinstance(raw.get("attestation"), str) or not raw["attestation"].strip():
                self.fail("primary_review_attestation_missing", f"primary review {receipt_index} lacks time/attestation")
            surface_receipt_ids = []
            for row in raw["surfaces"]:
                surface_id = row.get("surface_id") if isinstance(row, dict) else None
                if surface_id not in surface_map or row.get("surface_sha256") != surface_map[surface_id].get("surface_sha256") or row.get("status") != "reviewed" or not isinstance(row.get("observation"), str) or not row["observation"].strip():
                    self.fail("primary_surface_review_invalid", f"primary review {receipt_index} contains an invalid surface review")
                    continue
                surface_receipt_ids.append(surface_id)
            finding_receipt_ids = []
            for row in raw["defect_candidates"]:
                finding_id = row.get("finding_id") if isinstance(row, dict) else None
                if finding_id not in findings_by_id or row.get("status") != "reviewed" or not isinstance(row.get("observation"), str) or not row["observation"].strip():
                    self.fail("primary_finding_review_invalid", f"primary review {receipt_index} contains an invalid finding review")
                    continue
                finding_receipt_ids.append(finding_id)
            if record.get("surface_ids") != sorted(surface_receipt_ids) or record.get("finding_ids") != sorted(finding_receipt_ids):
                self.fail("primary_review_projection_drift", f"primary review {receipt_index} coverage projection drifted")
            primary_covered_surfaces.update(surface_receipt_ids); primary_covered_findings.update(finding_receipt_ids); primary_reviewers.add(reviewer)
        if primary_covered_surfaces != set(surface_map) or primary_covered_findings != set(findings_by_id):
            self.fail("primary_review_incomplete", "primary integrator review does not cover every contact/multi-view surface and defect candidate")

        terminal_expected = {
            "disposition": "complete", "complete": True,
            "ledger_path": str(lexical_absolute(ledger_path)), "ledger_sha256": sha256(ledger_path),
            "source_frame_index_sha256": sha256(frame_index_path), "failures": [],
        }
        if any(terminal.get(key) != value for key, value in terminal_expected.items()):
            self.fail("terminal_review_receipt_invalid", "terminal review receipt is incomplete, failed, stale, or bound to another ledger/frame index")
        terminal_boundary = terminal.get("evidence_boundary")
        if not isinstance(terminal_boundary, str) or not all(token in terminal_boundary.lower() for token in ("browser", "native slint", "production-runtime")):
            self.fail("terminal_review_boundary_missing", "terminal review receipt lacks native/runtime residual separation")
        source_result = terminal.get("source_integrity")
        surface_result = terminal.get("review_surface_integrity")
        coverage_result = terminal.get("review_coverage")
        closure_result = terminal.get("defect_closure")
        primary_result = terminal.get("primary_integrator_review")
        if not isinstance(source_result, dict) or source_result.get("complete") is not True:
            self.fail("terminal_source_integrity_incomplete", "terminal source integrity is not complete")
        expected_surface_result = {
            "complete": True, "surface_count": len(expected_surfaces),
            "contact_sheet_count": len(contact_surfaces), "multi_view_sheet_count": len(multi_surfaces),
            "sheet_set_sha256": canonical_sha256(stable_contact), "contact_sheet_index_sha256": sha256(contact_path),
        }
        if not isinstance(surface_result, dict) or any(surface_result.get(key) != value for key, value in expected_surface_result.items()):
            self.fail("terminal_review_surface_integrity_incomplete", "terminal review-surface integrity/census is incomplete or stale")
        defect_frames = {index for finding in findings for index in finding.get("frame_indexes", [])}
        high_risk_chapters = set(ledger.get("high_risk_chapters", [])) if isinstance(ledger.get("high_risk_chapters"), list) else set()
        for frame_row in ledger_frames:
            base_expected = 2 if frame_row.get("chapter") in high_risk_chapters else 1
            required_expected = 2 if base_expected == 2 or frame_row.get("index") in defect_frames else 1
            assigned = frame_row.get("assigned_reviewers")
            if frame_row.get("base_required_review_count") != base_expected or frame_row.get("required_review_count") != required_expected or not isinstance(assigned, list) or len(assigned) < required_expected or len(assigned) != len(set(assigned)):
                self.fail("frame_review_requirement_drift", f"frame {frame_row.get('index')} review requirement/assignment drifted")
        expected_coverage = {
            "complete": True, "frame_total": len(frames), "frame_complete": len(frames),
            "incomplete_count": 0, "first_incomplete": [],
            "high_risk_frames": sum(row.get("base_required_review_count") == 2 for row in ledger_frames),
            "defect_span_frames": len(defect_frames),
        }
        if not isinstance(coverage_result, dict) or any(coverage_result.get(key) != value for key, value in expected_coverage.items()):
            self.fail("terminal_frame_review_coverage_incomplete", "terminal full-resolution frame coverage is incomplete or stale")
        expected_closure = {"complete": True, "finding_count": len(findings), "terminal_findings": len(findings), "unresolved_findings": []}
        if not isinstance(closure_result, dict) or any(closure_result.get(key) != value for key, value in expected_closure.items()):
            self.fail("terminal_defect_closure_incomplete", "terminal defect closure is incomplete or stale")
        expected_primary = {
            "complete": True, "primary_reviewers": sorted(primary_reviewers),
            "surface_total": len(surface_map), "surface_reviewed": len(surface_map),
            "finding_total": len(findings), "finding_reviewed": len(findings),
            "missing_surface_ids": [], "missing_finding_ids": [],
        }
        if not isinstance(primary_result, dict) or any(primary_result.get(key) != value for key, value in expected_primary.items()):
            self.fail("terminal_primary_review_incomplete", "terminal primary-integrator review is incomplete or stale")

    def validate_interactive_screenshot_refs(self) -> None:
        # Binary screenshot validation is separate from JSON receipt loading.
        for index, spec in enumerate(self.manifest.get("interactive_reviews", [])):
            if not isinstance(spec, dict):
                continue
            try:
                path = self.resolve(spec.get("path", ""))
            except ValueError:
                continue
            if not path.is_file():
                continue
            try:
                receipt = load_json(path)
            except Exception:
                continue
            surface = receipt.get("surface", f"interactive-{index}")
            for scenario_index, scenario in enumerate(receipt.get("scenarios", [])):
                if not isinstance(scenario, dict):
                    continue
                for shot_index, shot in enumerate(scenario.get("screenshots", [])):
                    self.validate_binary_ref(shot, f"{surface} scenario {scenario_index} screenshot {shot_index}")

    def validate_root_coverage(self) -> None:
        try:
            root_path = self.resolve(self.manifest.get("root_evidence_hash_manifest", {}).get("path", ""))
        except ValueError:
            return
        for path in sorted(self.referenced_evidence):
            if path != root_path:
                self.root_has(path, "referenced evidence")

    def run(self) -> dict[str, Any]:
        if self.load_manifest():
            try:
                self.validate_artifact_and_residuals()
                self.validate_root_manifest()
                runners = self.validate_runners_and_k3()
                self.validate_build_reports(runners)
                self.validate_browser_runs(runners)
                self.validate_interactive_reviews()
                self.validate_interactive_screenshot_refs()
                self.validate_film(runners)
                self.validate_root_coverage()
            except Exception as error:
                self.fail("validator_exception", f"malformed evidence caused a fail-closed validator exception: {type(error).__name__}: {error}")
        report = {
            "schema_id": REPORT_SCHEMA,
            "generated_at_utc": utc_now(),
            "manifest": str(self.manifest_path),
            "manifest_sha256": self.manifest_sha or None,
            "artifact_sha256": self.artifact_sha or None,
            "disposition": "pass_with_native_runtime_platform_residuals_open" if not self.errors else "fail",
            "certification_boundary": "Aggregate browser/evidence integrity only; not native Slint 1.17.1, production-runtime, or platform/hardware certification.",
            "native_slint_1_17_1_certification": "open",
            "production_runtime_certification": "open",
            "platform_hardware_certification": "open",
            "summary": {"checks": len(self.checks), "errors": len(self.errors), "root_files": len(self.root_entries), "referenced_evidence_files": len(self.referenced_evidence)},
            "checks": self.checks,
            "errors": self.errors,
        }
        return report


def binary_spec(path: Path, base: Path) -> dict[str, Any]:
    return {"path": os.path.relpath(path, base), "sha256": sha256(path)}


def json_spec(path: Path, base: Path, schema_id: str | None = None) -> dict[str, Any]:
    result = binary_spec(path, base)
    if schema_id:
        result["schema_id"] = schema_id
    return result


def exact_browser_identity_fixture(executable: Path, product: str, channel: str) -> dict[str, Any]:
    executable, data, info = read_regular_nofollow(executable, "fixture browser executable")
    return {
        "product": product, "version": "fixture-1.0", "channel": channel,
        "user_agent": "fixture-agent", "executable_path": str(executable),
        "executable_sha256": hashlib.sha256(data).hexdigest(), "executable_bytes": info.st_size,
        "executable_device": info.st_dev, "executable_inode": info.st_ino,
        "executable_mtime_ns": info.st_mtime_ns, "playwright_version": "fixture-1.0",
    }


def make_png(path: Path, width: int = 1, height: int = 1, tone: int = 0) -> None:
    def chunk(kind: bytes, payload: bytes) -> bytes:
        return struct.pack(">I", len(payload)) + kind + payload + struct.pack(">I", zlib.crc32(kind + payload) & 0xffffffff)
    pixel = bytes((tone % 251, (tone * 3) % 251, (tone * 7) % 251, 255))
    raw = b"".join(b"\x00" + pixel * width for _ in range(height))
    path.write_bytes(
        b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    )


_MEDIA_FIXTURE_CACHE: dict[tuple[int, int, int, bool], tuple[bytes, bytes]] = {}


def make_media_fixture(mkv: Path, mp4: Path, *, width: int, height: int,
                       frame_count: int, wrong_master_codec: bool = False) -> None:
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise RuntimeError("ffmpeg is required for the final evidence gate self-test")
    key = (width, height, frame_count, wrong_master_codec)
    cached = _MEDIA_FIXTURE_CACHE.get(key)
    if cached is not None:
        mkv.write_bytes(cached[0]); mp4.write_bytes(cached[1]); return
    common = [ffmpeg, "-y", "-v", "error", "-f", "lavfi", "-i", f"color=c=black:s={width}x{height}:r=60", "-frames:v", str(frame_count)]
    master_codec = "libx264" if wrong_master_codec else "ffv1"
    master = subprocess.run([*common, "-c:v", master_codec, str(mkv)], capture_output=True, text=True, timeout=120)
    review = subprocess.run([*common, "-c:v", "libx264", "-pix_fmt", "yuv420p", str(mp4)], capture_output=True, text=True, timeout=120)
    if master.returncode or review.returncode:
        raise RuntimeError(f"media fixture encoding failed: {master.stderr} {review.stderr}")
    _MEDIA_FIXTURE_CACHE[key] = (mkv.read_bytes(), mp4.read_bytes())


def build_self_test_fixture(root: Path) -> Path:
    evidence = root / "evidence"
    evidence.mkdir(parents=True)
    artifact = root / "PMConcept7.html"
    artifact.write_text("<!doctype html><title>fixture</title>", encoding="utf-8")
    artifact_sha = sha256(artifact)
    k3 = root / "k3.json"
    write_json(k3, {"schema_id": "pm.pmconcept7.k3_geometry_manifest.v1", "breakpoints": [320, 520]})
    build_runner = root / "build.py"
    build_runner.write_text("# fixture build runner\n", encoding="utf-8")
    browser_runner = root / "browser.mjs"
    browser_runner.write_text("// fixture browser runner\n", encoding="utf-8")
    capture_runner = root / "final_campaign_capture.mjs"
    capture_runner.write_text("// fixture final campaign runner\n", encoding="utf-8")
    browser_executable = root / "browser-executable"
    browser_executable.write_bytes(b"synthetic direct browser executable identity\n")
    runners = [
        {"id": "build", "path": "build.py", "sha256": sha256(build_runner)},
        {"id": "browser", "path": "browser.mjs", "sha256": sha256(browser_runner)},
        {"id": "final_capture", "path": "final_campaign_capture.mjs", "sha256": sha256(capture_runner)},
    ]
    build_reports = []
    for name in ("final", "repro"):
        path = evidence / f"build-{name}.json"
        write_json(path, {
            "output_sha256": artifact_sha, "gates_all_pass": True,
            "gates": [{"name": "fixture", "pass": True}],
            "build_provenance": {"pipeline": {"path": "build.py", "sha256": sha256(build_runner)}},
            "portability_evidence_scope": {"slint_1_17_1_compilation_runtime_certification": False},
        })
        build_reports.append({**json_spec(path, root), "runner_id": "build"})
    browser_runs = []
    for run_id, schema in REQUIRED_BROWSER_RUNS.items():
        checks = {"fixture": {"pass": True}}
        report: dict[str, Any] = {"schema_id": schema, "artifact_sha256": artifact_sha, "checks": checks, "summary": {"failed": 0}, "runtime_errors": [], "findings": []}
        census_pointer = "/checks"
        expected_count = 1
        if run_id == "accessibility_visual":
            report["matrix"] = [{"id": f"case-{i}", "pass": True} for i in range(288)]
            census_pointer, expected_count = "/matrix", 288
        elif run_id == "full_thread_performance":
            report["scenario_coverage"] = [{"id": f"scenario-{i}", "pass": True} for i in range(19)]
            report["topic_coverage"] = [{"id": f"topic-{i}", "pass": True} for i in range(85)]
            census_pointer, expected_count = "/topic_coverage", 85
        elif run_id == "onboarding_cinematic":
            report["paths"] = [{"id": f"path-{i}", "pass": True} for i in range(4)]
            report["themes"] = [{"id": f"theme-{i}", "pass": True} for i in range(8)]
            census_pointer, expected_count = "/paths", 4
        elif run_id == "guided_tour":
            report["themes"] = [{"id": f"theme-{i}", "pass": True} for i in range(8)]
            census_pointer, expected_count = "/themes", 8
        elif run_id == "plugin_projection":
            report["doctor_routes"] = [{"id": f"doctor.plugin.fixture_{i}", "pass": True} for i in range(8)]
            census_pointer, expected_count = "/doctor_routes", 8
        report_path = evidence / f"{run_id}-report.json"
        write_json(report_path, report)
        scenario_id = f"{run_id}.complete"
        receipt_path = evidence / f"{run_id}-receipt.json"
        receipt = {
            "schema_id": RUN_RECEIPT_SCHEMA, "run_id": run_id,
            "artifact_sha256": artifact_sha, "report_sha256": sha256(report_path),
            "runner": {"path": "browser.mjs", "sha256": sha256(browser_runner)},
            "browser_identity": exact_browser_identity_fixture(browser_executable, "Google Chrome", "system"),
            "command": {"argv": ["node", "browser.mjs"], "cwd": str(root)},
            "scenarios": [{"id": scenario_id, "disposition": "pass"}],
            "counts": {"checks_expected": 1, "checks_observed": 1, "cases_expected": expected_count, "cases_observed": expected_count, "scenarios_expected": 1, "scenarios_observed": 1},
            "disposition": "pass", "native_slint_certified": False,
            "production_runtime_certified": False,
            "evidence_boundary": "Browser concept evidence only; not native certification.",
        }
        if run_id in K3_RUNS:
            receipt["k3_geometry_manifest_sha256"] = sha256(k3)
        write_json(receipt_path, receipt)
        browser_runs.append({
            "id": run_id, "runner_id": "browser",
            "report": json_spec(report_path, root, schema),
            "receipt": json_spec(receipt_path, root, RUN_RECEIPT_SCHEMA),
            "expected_command": {"argv": ["node", "browser.mjs"], "cwd": str(root)},
            "expected_scenario_ids": [scenario_id], "allowed_dispositions": ["pass"],
            "artifact_sha256_pointers": ["/artifact_sha256"],
            "case_censuses": [{"pointer": census_pointer, "expected_count": expected_count}],
            "success_assertions": [{"pointer": "/summary/failed", "equals": 0}],
        })
    screenshot_specs = []
    interactive = []
    for surface in sorted(REQUIRED_INTERACTIVE_SURFACES):
        shot = evidence / f"{surface}.png"
        make_png(shot)
        shot_spec = binary_spec(shot, root)
        screenshot_specs.append(shot_spec)
        receipt_path = evidence / f"interactive-{surface}.json"
        receipt = {
            "schema_id": INTERACTIVE_SCHEMA, "surface": surface,
            "artifact_sha256": artifact_sha,
            "browser_identity": exact_browser_identity_fixture(browser_executable, "Chrome" if surface != "codex_in_app_browser" else "Codex in-app Browser", surface),
            "extension_identity": {"name": "ChatGPT", "id": "fixture-extension", "version": "fixture", "enabled": True} if surface == "chrome_extension" else None,
            "scenarios": [{"id": f"{surface}.review", "observations": ["fixture observation"], "screenshots": [shot_spec], "disposition": "pass"}],
            "disposition": "pass_with_native_residuals_open", "native_slint_certified": False, "production_runtime_certified": False,
        }
        write_json(receipt_path, receipt)
        interactive.append(json_spec(receipt_path, root, INTERACTIVE_SCHEMA))
    denominator = load_json(DENOMINATOR_PATH)
    denominator_hash = sha256(DENOMINATOR_PATH)
    chapter_contracts = denominator["chapters"]
    campaign_dir = evidence / "film"; frames_dir = campaign_dir / "frames"; review_dir = campaign_dir / "review"
    frames_dir.mkdir(parents=True); review_dir.mkdir()
    capture_command = {"argv": ["node", str(capture_runner), "--campaign", "final", "--target-fps", "60"], "cwd": str(root)}
    capture_configuration = {
        "schema_id": "pm.capture.final_campaign_configuration.v1", "campaign": "final", "target_fps": 60,
        "capture_format": "png", "every_nth_frame": 1, "spatial_downscaling": False,
        "initial_viewport": {"width": 1440, "height": 900}, "device_scale_factor": 1,
        "locale": "en-US", "timezone_id": "UTC", "reduced_motion": "no-preference",
        "hold_ms": 280, "denominator_sha256": denominator_hash,
    }
    configuration_hash = canonical_sha256(capture_configuration)
    frames: list[dict[str, Any]] = []
    for contract in chapter_contracts:
        widths = denominator["required_widths"] if contract["id"] == "responsive-matrix" else [1440, 1440]
        for width in widths:
            index = len(frames); frame_path = frames_dir / f"frame-{index:07d}.png"
            make_png(frame_path, width, 900, index + 1)
            frames.append({
                "index": index, "path": os.path.relpath(frame_path, campaign_dir), "sha256": sha256(frame_path),
                "chapter": contract["id"], "elapsed_ms": round(index * (1000 / 60), 6),
                "received_monotonic_ms": 1000 + index * (1000 / 60), "cdp_timestamp_s": 100 + index / 60,
                "width": width, "height": 900, "viewport_width": width, "viewport_height": 900,
                "device_scale_factor": 1, "expected_width": width, "expected_height": 900, "full_resolution": True,
            })
    recomputed = recompute_frame_timing(frames, 60)
    frame_count = len(frames)
    census = {"raw_frame_count": frame_count, "raw_timestamp_field_count": frame_count, "usable_timestamp_count": frame_count, "missing_timestamp_count": 0, "nonfinite_timestamp_count": 0, "nonmonotonic_interval_count": 0, "complete": True, "at_least_two_usable_timestamps": True, "strictly_monotonic": True}
    observations = {
        "delivered_frame_count": frame_count, "requested_fps": 60, "requested_interval_ms": 16.666667,
        "cadence_claim_available": True, "cadence_valid": True, "capture_evidence_admissible": True,
        "cadence_failure_reasons": [], "cdp_timestamp_census": census, "receiver_timestamp_census": census,
        "delivered_fps": recomputed["delivered_fps"], "cdp_timestamp_fps": recomputed["delivered_fps"],
        "receiver_observed_fps": recomputed["delivered_fps"], "interval_ms": recomputed["interval_ms"],
        "receiver_interval_ms": recomputed["receiver_interval_ms"], "delayed_interval_threshold_ms": 25,
        "delayed_interval_count": recomputed["delayed_interval_count"],
        "dropped_frame_equivalent_estimate": recomputed["dropped_frame_equivalent_estimate"],
        "repeated_frame_estimate": {"raw_frame_count": frame_count, "usable_lossless_frame_hash_count": frame_count, "missing_or_invalid_lossless_frame_hash_count": 0, "distinct_lossless_frame_hash_count": recomputed["distinct_frame_hash_count"], "consecutive_identical_hash_pair_count": recomputed["repeated_frame_count"], "estimated_repeated_frame_count": recomputed["repeated_frame_count"], "hash_census_complete": True},
    }
    actions = []
    chapters = []
    serial = 0
    for contract in chapter_contracts:
        chapter_actions = []
        for action_id in contract["actions"]:
            serial += 1; chapter_actions.append(action_id)
            actions.append({"serial": serial, "id": action_id, "chapter": contract["id"], "disposition": "captured", "started_ms": serial * 10, "finished_ms": serial * 10 + 1, "elapsed_ms": 1})
        chapters.append({"id": contract["id"], "capabilities": contract["capabilities"], "required_action_ids": contract["actions"], "action_ids": chapter_actions, "missing_action_ids": [], "unexpected_action_ids": [], "failed_action_ids": [], "coverage_complete": True})
    scenarios = [{"id": row["id"], "capabilities": row["capabilities"], "required_action_ids": row["actions"]} for row in chapter_contracts]
    frame_index_path = campaign_dir / "frame-index.json"
    write_json(frame_index_path, {"schema_id": "pm.capture.delivered_compositor_frame_index.v1", "source_sha256": artifact_sha, "target_fps": 60, "no_resampling_claim": True, "denominator_sha256": denominator_hash, "configuration_sha256": configuration_hash, "full_resolution_census_complete": True, "frames": frames})
    scenario_path = campaign_dir / "scenario-manifest.json"
    write_json(scenario_path, {"schema_id": "pm.capture.scenario_manifest.v1", "campaign": "final", "source_sha256": artifact_sha, "requested_fps": 60, "denominator_sha256": denominator_hash, "configuration_sha256": configuration_hash, "no_resampling_claim": True, "scenarios": scenarios, "chapters": chapters})
    coverage_path = campaign_dir / "coverage-manifest.json"
    write_json(coverage_path, {"schema_id": "pm.capture.final_campaign_coverage.v1", "campaign": "final", "source_sha256": artifact_sha, "denominator_sha256": denominator_hash, "configuration_sha256": configuration_hash, "requested_fps": 60, "no_resampling_claim": True, "observed": {"complete": True, "chapter_count": len(chapters), "action_count": len(actions)}, "chapters": [{"id": row["id"], "required_action_ids": row["required_action_ids"], "action_ids": row["action_ids"], "missing_action_ids": [], "failed_action_ids": [], "coverage_complete": True} for row in chapters]})
    console_path = campaign_dir / "console-log.json"; write_json(console_path, [])
    network_path = campaign_dir / "network-log.json"; write_json(network_path, [])
    action_path = campaign_dir / "action-timing.json"; write_json(action_path, {"schema_id": "pm.capture.action_timing.v1", "source_sha256": artifact_sha, "denominator_sha256": denominator_hash, "actions": actions})
    timing_path = campaign_dir / "timing-report.json"; write_json(timing_path, {"schema_id": "pm.capture.delivered_frame_timing.v1", "source_sha256": artifact_sha, "denominator_sha256": denominator_hash, "requested_fps": 60, "no_resampling_claim": True, "clock_domain": "Chrome DevTools screencast metadata timestamp", "observations": observations})
    mkv = campaign_dir / "final-ffv1.mkv"; mp4 = campaign_dir / "review.mp4"
    make_media_fixture(mkv, mp4, width=max(row["width"] for row in frames), height=max(row["height"] for row in frames), frame_count=frame_count)
    campaign_path = campaign_dir / "campaign-report.json"
    executable = Path(shutil.which("ffmpeg") or sys.executable).resolve()
    write_json(campaign_path, {
        "schema_id": "pm.pmconcept7.final_capture_campaign.v1", "campaign": "final", "source_sha256": artifact_sha,
        "disposition": "captured_browser_concept_evidence", "no_resampling_claim": True, "target_fps": 60,
        "denominator": {"schema_id": DENOMINATOR_SCHEMA, "path": str(DENOMINATOR_PATH), "sha256": denominator_hash},
        "runner": {"path": str(capture_runner.resolve()), "sha256": sha256(capture_runner)}, "command": capture_command,
        "configuration": capture_configuration, "configuration_sha256": configuration_hash,
        "browser_identity": {"product": "chromium", "version": "fixture", "channel": "system_chrome", "user_agent": "fixture", "executable_path": str(executable), "executable_sha256": sha256(executable), "playwright_version": "fixture"},
        "media": {"disposition": "encoded", "ffv1_master": {"path": mkv.name, "success": True, "sha256": sha256(mkv), "probe_proves_ffv1": True}, "review_mp4": {"path": mp4.name, "success": True, "sha256": sha256(mp4)}},
        "runtime_errors": [], "actions": actions, "chapters": chapters, "observations": observations,
    })
    artifact_manifest_path = campaign_dir / "artifact-manifest.json"
    artifact_paths = [frame_index_path, scenario_path, coverage_path, console_path, network_path, action_path, timing_path, mkv, mp4]
    write_json(artifact_manifest_path, {"schema_id": "pm.capture.artifact_manifest.v1", "artifacts": [{"path": os.path.relpath(path, campaign_dir), "bytes": path.stat().st_size, "sha256": sha256(path)} for path in artifact_paths]})

    ledger_path = review_dir / "review-ledger.json"
    high_risk = {row["id"] for row in chapter_contracts}
    ledger = frame_review.build_ledger(frame_index_path, ["r1", "r2"], high_risk)
    full_review_path = review_dir / "full-frame-review.html"; frame_review.render_review_html(ledger, full_review_path, campaign_dir)
    contact = frame_review.render_contact_sheets(ledger, review_dir / "contact-sheets", campaign_dir, None)
    contact_path = Path(contact["index_path"]); contact_value = load_json(contact_path)
    stable_contact = []
    for index, sheet in enumerate(contact_value["sheets"]):
        png_path = contact_path.parent / f"contact-sheet-{index + 1:04d}.png"; make_png(png_path, 16, 16, index + 1)
        sheet["png"] = png_path.name; sheet["png_sha256"] = sha256(png_path)
        seed = {"surface_id": sheet["surface_id"], "kind": "contact_sheet", "frame_indexes": sheet["frame_indexes"], "html_sha256": sheet["html_sha256"], "png_sha256": sheet["png_sha256"]}
        sheet["surface_sha256"] = canonical_sha256(seed); stable_contact.append({**seed, "surface_sha256": sheet["surface_sha256"]})
    contact_value["deterministic_sheet_set_sha256"] = canonical_sha256(stable_contact); write_json(contact_path, contact_value)
    ledger["contact_sheet_index"] = {"path": str(contact_path), "sha256": sha256(contact_path)}
    ledger["review_surfaces"] = [{"surface_id": row["surface_id"], "kind": "contact_sheet", "surface_sha256": row["surface_sha256"], "frame_indexes": row["frame_indexes"]} for row in contact_value["sheets"]]
    write_json(ledger_path, ledger)
    for reviewer in ("r1", "r2"):
        findings_path = review_dir / f"findings-{reviewer}.json"
        write_json(findings_path, {"schema_id": FRAME_FINDINGS_SCHEMA, "reviewer": reviewer, "reviewed_at_utc": utc_now(), "findings": []})
        frame_review.mark_reviewed(ledger_path, reviewer, f"0:{frame_count - 1}", findings_path, True)
    primary_path = review_dir / "primary-review.json"; current = load_json(ledger_path)
    write_json(primary_path, {"schema_id": PRIMARY_REVIEW_SCHEMA, "reviewer": "primary", "reviewer_role": "primary_integrator", "reviewed_at_utc": utc_now(), "attestation": "Synthetic exhaustive aggregate-gate surface review.", "surfaces": [{"surface_id": row["surface_id"], "surface_sha256": row["surface_sha256"], "status": "reviewed", "observation": "Synthetic surface review."} for row in current["review_surfaces"]], "defect_candidates": []})
    frame_review.record_primary_review(ledger_path, "primary", primary_path, True)
    terminal_path = review_dir / "terminal-review-receipt.json"
    if frame_review.check_complete(ledger_path, terminal_path, emit=False) != 0:
        raise AssertionError("exhaustive self-test review fixture did not close")
    film = {
        "target_fps": 60, "denominator": json_spec(DENOMINATOR_PATH, root, DENOMINATOR_SCHEMA),
        "runner_id": "final_capture", "expected_command": capture_command,
        "expected_configuration_sha256": configuration_hash,
        "campaign_report": json_spec(campaign_path, root, "pm.pmconcept7.final_capture_campaign.v1"),
        "artifact_manifest": json_spec(artifact_manifest_path, root, "pm.capture.artifact_manifest.v1"),
        "frame_index": json_spec(frame_index_path, root, "pm.capture.delivered_compositor_frame_index.v1"),
        "scenario_manifest": json_spec(scenario_path, root, "pm.capture.scenario_manifest.v1"),
        "coverage_manifest": json_spec(coverage_path, root, "pm.capture.final_campaign_coverage.v1"),
        "action_timing": json_spec(action_path, root, "pm.capture.action_timing.v1"),
        "timing_report": json_spec(timing_path, root, "pm.capture.delivered_frame_timing.v1"),
        "review_ledger": json_spec(ledger_path, root, REVIEW_LEDGER_SCHEMA),
        "contact_sheet_index": json_spec(contact_path, root, CONTACT_INDEX_SCHEMA),
        "full_frame_review_index": binary_spec(full_review_path, root),
        "terminal_review_receipt": json_spec(terminal_path, root, TERMINAL_REVIEW_SCHEMA),
        "required_media": [binary_spec(mkv, root), binary_spec(mp4, root)],
    }
    # Root manifest covers every evidence byte, excluding itself.
    root_manifest_path = evidence / "root-hash-manifest.json"
    files = []
    for path in sorted(item for item in evidence.rglob("*") if item.is_file() and item != root_manifest_path):
        files.append({"path": os.path.relpath(path, evidence), "bytes": path.stat().st_size, "sha256": sha256(path)})
    write_json(root_manifest_path, {"schema_id": ROOT_SCHEMA, "artifact_sha256": artifact_sha, "complete_file_census": True, "files": files})
    manifest_path = root / "manifest.json"
    write_json(manifest_path, {
        "schema_id": MANIFEST_SCHEMA, "evidence_root": "evidence",
        "artifact": {"path": "PMConcept7.html", "sha256": artifact_sha},
        "root_evidence_hash_manifest": json_spec(root_manifest_path, root, ROOT_SCHEMA),
        "k3_geometry_manifest": json_spec(k3, root, "pm.pmconcept7.k3_geometry_manifest.v1"),
        "runners": runners, "build_reports": build_reports, "browser_runs": browser_runs,
        "interactive_reviews": interactive, "film": film,
        "residuals": {"native_slint_1_17_1_certification": "open", "production_runtime_certification": "open", "platform_hardware_certification": "open", "browser_evidence_scope": "browser_concept_only"},
    })
    return manifest_path


def run_self_test() -> int:
    results = []
    denominator_fixture = load_json(DENOMINATOR_PATH)
    for case, mutate in (
        ("negative_denominator_width_census_drift", lambda value: value.update({"required_widths": [2500]})),
        ("negative_denominator_ATS039_ref_drift", lambda value: value.update({"source_refs": ["bogus-a", "bogus-b", "bogus-c"]})),
        ("negative_denominator_action_census_drift", lambda value: value["chapters"][0].update({"actions": ["invented-action"]})),
    ):
        mutant = copy.deepcopy(denominator_fixture); mutate(mutant)
        results.append({"case": case, "pass": denominator_semantic_sha256(mutant) != FINAL_DENOMINATOR_SEMANTIC_SHA256})
    def refresh_root_entry(manifest_path: Path, manifest: dict[str, Any], changed_path: Path) -> None:
        root_manifest_path = (manifest_path.parent / manifest["root_evidence_hash_manifest"]["path"]).resolve()
        root_manifest = load_json(root_manifest_path)
        evidence_root = (manifest_path.parent / manifest["evidence_root"]).resolve()
        relative = os.path.relpath(changed_path, evidence_root)
        next(row for row in root_manifest["files"] if row["path"] == relative).update({"sha256": sha256(changed_path), "bytes": changed_path.stat().st_size})
        write_json(root_manifest_path, root_manifest)
        manifest["root_evidence_hash_manifest"]["sha256"] = sha256(root_manifest_path)
    def refresh_capture_artifacts(manifest_path: Path, manifest: dict[str, Any], changed: list[Path]) -> None:
        campaign_path = (manifest_path.parent / manifest["film"]["campaign_report"]["path"]).resolve()
        campaign_dir = campaign_path.parent
        artifact_spec = manifest["film"]["artifact_manifest"]
        artifact_path = (manifest_path.parent / artifact_spec["path"]).resolve()
        artifact = load_json(artifact_path)
        by_path = {row["path"]: row for row in artifact["artifacts"]}
        for path in changed:
            relative = os.path.relpath(path, campaign_dir)
            if relative in by_path:
                by_path[relative].update({"sha256": sha256(path), "bytes": path.stat().st_size})
            refresh_root_entry(manifest_path, manifest, path)
        write_json(artifact_path, artifact)
        artifact_spec["sha256"] = sha256(artifact_path)
        refresh_root_entry(manifest_path, manifest, artifact_path)
    with tempfile.TemporaryDirectory(prefix="pm7-final-evidence-gate-") as temp:
        root = Path(temp)
        manifest_path = build_self_test_fixture(root)
        positive = Gate(manifest_path).run()
        results.append({"case": "positive_complete_campaign", "pass": positive["disposition"].startswith("pass"), "errors": positive["errors"][:4]})

        original = load_json(manifest_path)
        receipt_spec = original["browser_runs"][0]["receipt"]
        receipt_path = (manifest_path.parent / receipt_spec["path"]).resolve()
        receipt = load_json(receipt_path)
        receipt["artifact_sha256"] = "0" * 64
        write_json(receipt_path, receipt)
        receipt_spec["sha256"] = sha256(receipt_path)
        # Refresh root hash entry so the negative is semantic, not merely stale bytes.
        refresh_root_entry(manifest_path, original, receipt_path)
        write_json(manifest_path, original)
        stale = Gate(manifest_path).run()
        results.append({"case": "negative_mixed_artifact", "pass": stale["disposition"] == "fail" and any(row["code"] == "browser_receipt_binding_mismatch" for row in stale["errors"])})

        manifest_path = build_self_test_fixture(root / "ordinary-browser-identity")
        manifest = load_json(manifest_path); receipt_spec = manifest["browser_runs"][0]["receipt"]
        receipt_path = lexical_absolute(manifest_path.parent / receipt_spec["path"]); receipt = load_json(receipt_path)
        receipt["browser_identity"]["executable_path"] = "/definitely/missing/browser"
        write_json(receipt_path, receipt); receipt_spec["sha256"] = sha256(receipt_path)
        refresh_root_entry(manifest_path, manifest, receipt_path); write_json(manifest_path, manifest)
        fake_ordinary = Gate(manifest_path).run()
        results.append({"case": "negative_ordinary_fake_browser_identity", "pass": fake_ordinary["disposition"] == "fail" and any(row["code"] == "browser_identity_unverifiable" for row in fake_ordinary["errors"])})

        manifest_path = build_self_test_fixture(root / "interactive-browser-identity")
        manifest = load_json(manifest_path); interactive_spec = manifest["interactive_reviews"][0]
        interactive_path = lexical_absolute(manifest_path.parent / interactive_spec["path"]); interactive_receipt = load_json(interactive_path)
        direct_executable = Path(interactive_receipt["browser_identity"]["executable_path"])
        executable_link = manifest_path.parent / "browser-executable-link"; executable_link.symlink_to(direct_executable)
        interactive_receipt["browser_identity"]["executable_path"] = str(executable_link)
        write_json(interactive_path, interactive_receipt); interactive_spec["sha256"] = sha256(interactive_path)
        refresh_root_entry(manifest_path, manifest, interactive_path); write_json(manifest_path, manifest)
        linked_interactive = Gate(manifest_path).run()
        results.append({"case": "negative_interactive_symlink_browser_identity", "pass": linked_interactive["disposition"] == "fail" and any(row["code"] == "browser_identity_unverifiable" for row in linked_interactive["errors"])})

        manifest_path = build_self_test_fixture(root / "second")
        manifest = load_json(manifest_path)
        manifest["interactive_reviews"] = manifest["interactive_reviews"][:2]
        write_json(manifest_path, manifest)
        missing_interactive = Gate(manifest_path).run()
        results.append({"case": "negative_missing_interactive_surface", "pass": missing_interactive["disposition"] == "fail" and any(row["code"] == "interactive_review_census_mismatch" for row in missing_interactive["errors"])})

        manifest_path = build_self_test_fixture(root / "third")
        manifest = load_json(manifest_path)
        terminal_spec = manifest["film"]["terminal_review_receipt"]
        terminal_path = (manifest_path.parent / terminal_spec["path"]).resolve()
        terminal = load_json(terminal_path)
        terminal.update({"disposition": "incomplete", "complete": False, "failures": [{"code": "fixture", "message": "synthetic"}]})
        write_json(terminal_path, terminal)
        terminal_spec["sha256"] = sha256(terminal_path)
        refresh_root_entry(manifest_path, manifest, terminal_path)
        write_json(manifest_path, manifest)
        incomplete_terminal = Gate(manifest_path).run()
        results.append({"case": "negative_incomplete_terminal_receipt", "pass": incomplete_terminal["disposition"] == "fail" and any(row["code"] == "terminal_review_receipt_invalid" for row in incomplete_terminal["errors"])})

        manifest_path = build_self_test_fixture(root / "fourth")
        manifest = load_json(manifest_path)
        scenario_spec = manifest["film"]["scenario_manifest"]
        scenario_path = (manifest_path.parent / scenario_spec["path"]).resolve()
        scenario = load_json(scenario_path); scenario["scenarios"] = scenario["scenarios"][:-1]
        write_json(scenario_path, scenario); scenario_spec["sha256"] = sha256(scenario_path)
        refresh_capture_artifacts(manifest_path, manifest, [scenario_path]); write_json(manifest_path, manifest)
        missing_scenario = Gate(manifest_path).run()
        results.append({"case": "negative_authoritative_scenario_omission", "pass": missing_scenario["disposition"] == "fail" and any(row["code"] == "film_scenario_census_mismatch" for row in missing_scenario["errors"])})

        manifest_path = build_self_test_fixture(root / "fifth")
        manifest = load_json(manifest_path); manifest["film"]["target_fps"] = 30; write_json(manifest_path, manifest)
        wrong_target = Gate(manifest_path).run()
        results.append({"case": "negative_non_60_target", "pass": wrong_target["disposition"] == "fail" and any(row["code"] == "film_fps_claim_invalid" for row in wrong_target["errors"])})

        manifest_path = build_self_test_fixture(root / "sixth")
        manifest = load_json(manifest_path); mkv_spec = next(row for row in manifest["film"]["required_media"] if row["path"].endswith(".mkv"))
        mkv = (manifest_path.parent / mkv_spec["path"]).resolve(); mkv.write_bytes(b"not a media container")
        mkv_spec["sha256"] = sha256(mkv)
        campaign_spec = manifest["film"]["campaign_report"]; campaign_path = (manifest_path.parent / campaign_spec["path"]).resolve(); campaign = load_json(campaign_path); campaign["media"]["ffv1_master"]["sha256"] = sha256(mkv); write_json(campaign_path, campaign); campaign_spec["sha256"] = sha256(campaign_path)
        refresh_capture_artifacts(manifest_path, manifest, [mkv]); refresh_root_entry(manifest_path, manifest, campaign_path); write_json(manifest_path, manifest)
        fake_media = Gate(manifest_path).run()
        results.append({"case": "negative_fake_mkv", "pass": fake_media["disposition"] == "fail" and any(row["code"] in {"ffv1_master_probe", "ffv1_master_decode"} for row in fake_media["errors"])})

        manifest_path = build_self_test_fixture(root / "seventh")
        manifest = load_json(manifest_path); mkv_spec = next(row for row in manifest["film"]["required_media"] if row["path"].endswith(".mkv")); mp4_spec = next(row for row in manifest["film"]["required_media"] if row["path"].endswith(".mp4"))
        mkv = (manifest_path.parent / mkv_spec["path"]).resolve(); mp4 = (manifest_path.parent / mp4_spec["path"]).resolve()
        frame_value = load_json((manifest_path.parent / manifest["film"]["frame_index"]["path"]).resolve()); media_frames = frame_value["frames"]
        make_media_fixture(mkv, mp4, width=max(row["width"] for row in media_frames), height=max(row["height"] for row in media_frames), frame_count=len(media_frames), wrong_master_codec=True)
        mkv_spec["sha256"] = sha256(mkv); mp4_spec["sha256"] = sha256(mp4)
        campaign_spec = manifest["film"]["campaign_report"]; campaign_path = (manifest_path.parent / campaign_spec["path"]).resolve(); campaign = load_json(campaign_path); campaign["media"]["ffv1_master"].update({"sha256": sha256(mkv), "probe_proves_ffv1": True}); campaign["media"]["review_mp4"]["sha256"] = sha256(mp4); write_json(campaign_path, campaign); campaign_spec["sha256"] = sha256(campaign_path)
        refresh_capture_artifacts(manifest_path, manifest, [mkv, mp4]); refresh_root_entry(manifest_path, manifest, campaign_path); write_json(manifest_path, manifest)
        wrong_codec = Gate(manifest_path).run()
        results.append({"case": "negative_wrong_master_codec", "pass": wrong_codec["disposition"] == "fail" and any(row["code"] == "ffv1_master_probe" for row in wrong_codec["errors"])})

        manifest_path = build_self_test_fixture(root / "eighth")
        manifest = load_json(manifest_path); mkv_spec = next(row for row in manifest["film"]["required_media"] if row["path"].endswith(".mkv")); mp4_spec = next(row for row in manifest["film"]["required_media"] if row["path"].endswith(".mp4"))
        mkv = (manifest_path.parent / mkv_spec["path"]).resolve(); mp4 = (manifest_path.parent / mp4_spec["path"]).resolve(); make_media_fixture(mkv, mp4, width=16, height=16, frame_count=1)
        mkv_spec["sha256"] = sha256(mkv); mp4_spec["sha256"] = sha256(mp4)
        campaign_spec = manifest["film"]["campaign_report"]; campaign_path = (manifest_path.parent / campaign_spec["path"]).resolve(); campaign = load_json(campaign_path); campaign["media"]["ffv1_master"].update({"sha256": sha256(mkv), "probe_proves_ffv1": True}); campaign["media"]["review_mp4"]["sha256"] = sha256(mp4); write_json(campaign_path, campaign); campaign_spec["sha256"] = sha256(campaign_path)
        refresh_capture_artifacts(manifest_path, manifest, [mkv, mp4]); refresh_root_entry(manifest_path, manifest, campaign_path); write_json(manifest_path, manifest)
        valid_fake = Gate(manifest_path).run()
        results.append({"case": "negative_codec_valid_wrong_media_census", "pass": valid_fake["disposition"] == "fail" and any(row["code"] in {"ffv1_master_probe", "review_mp4_probe"} for row in valid_fake["errors"])})

        manifest_path = build_self_test_fixture(root / "ninth")
        manifest = load_json(manifest_path); frame_spec = manifest["film"]["frame_index"]; frame_path = (manifest_path.parent / frame_spec["path"]).resolve(); frame_index = load_json(frame_path)
        wide = next(row for row in frame_index["frames"] if row["viewport_width"] == 2500); wide.update({"width": 1440, "expected_width": 2500, "full_resolution": True})
        write_json(frame_path, frame_index); frame_spec["sha256"] = sha256(frame_path); refresh_capture_artifacts(manifest_path, manifest, [frame_path]); write_json(manifest_path, manifest)
        downscaled = Gate(manifest_path).run()
        results.append({"case": "negative_spatial_downscale", "pass": downscaled["disposition"] == "fail" and any(row["code"] == "frame_not_full_viewport_resolution" for row in downscaled["errors"])})

        manifest_path = build_self_test_fixture(root / "tenth")
        manifest = load_json(manifest_path); timing_spec = manifest["film"]["timing_report"]; campaign_spec = manifest["film"]["campaign_report"]
        timing_path = (manifest_path.parent / timing_spec["path"]).resolve(); campaign_path = (manifest_path.parent / campaign_spec["path"]).resolve(); timing = load_json(timing_path); campaign = load_json(campaign_path)
        timing["observations"]["delivered_fps"] = 999; campaign["observations"]["delivered_fps"] = 999
        write_json(timing_path, timing); write_json(campaign_path, campaign); timing_spec["sha256"] = sha256(timing_path); campaign_spec["sha256"] = sha256(campaign_path)
        refresh_capture_artifacts(manifest_path, manifest, [timing_path]); refresh_root_entry(manifest_path, manifest, campaign_path); write_json(manifest_path, manifest)
        timing_drift = Gate(manifest_path).run()
        results.append({"case": "negative_timing_recomputation", "pass": timing_drift["disposition"] == "fail" and any(row["code"] == "film_timing_recomputation_mismatch" for row in timing_drift["errors"])})

        manifest_path = build_self_test_fixture(root / "eleventh")
        manifest = load_json(manifest_path); campaign_spec = manifest["film"]["campaign_report"]
        campaign_path = (manifest_path.parent / campaign_spec["path"]).resolve(); campaign = load_json(campaign_path)
        campaign["browser_identity"].update({"executable_path": "/does/not/exist/chrome", "executable_sha256": "f" * 64})
        write_json(campaign_path, campaign); campaign_spec["sha256"] = sha256(campaign_path)
        refresh_root_entry(manifest_path, manifest, campaign_path); write_json(manifest_path, manifest)
        fake_browser = Gate(manifest_path).run()
        results.append({"case": "negative_unverifiable_browser_binary", "pass": fake_browser["disposition"] == "fail" and any(row["code"] == "film_browser_identity_unverifiable" for row in fake_browser["errors"])})
    passed = all(row["pass"] for row in results)
    print(json.dumps({"schema_id": "pm.pmconcept7.final_evidence_gate_self_test.v1", "pass": passed, "cases": results}, indent=2))
    return 0 if passed else 1


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", type=Path, help="explicit final evidence manifest")
    parser.add_argument("--report", type=Path, help="write machine-readable gate report here")
    parser.add_argument("--self-test", action="store_true", help="run deterministic positive/negative fixture tests")
    args = parser.parse_args()
    if args.self_test:
        return run_self_test()
    if not args.manifest:
        parser.error("--manifest is required unless --self-test is used")
    gate = Gate(args.manifest)
    report = gate.run()
    if args.report and gate.evidence_root is not None:
        report_path = lexical_absolute(args.report)
        if report_path == gate.evidence_root or gate.evidence_root in report_path.parents:
            error = {"code": "gate_report_inside_evidence_root", "message": "gate report must be outside evidence_root so it cannot invalidate a passing root hash census"}
            report["errors"].append(error)
            report["summary"]["errors"] = len(report["errors"])
            report["disposition"] = "fail"
    rendered = json.dumps(report, indent=2, sort_keys=True) + "\n"
    if args.report:
        write_json(lexical_absolute(args.report), report)
    print(rendered, end="")
    return 0 if report["disposition"].startswith("pass") else 1


if __name__ == "__main__":
    raise SystemExit(main())
