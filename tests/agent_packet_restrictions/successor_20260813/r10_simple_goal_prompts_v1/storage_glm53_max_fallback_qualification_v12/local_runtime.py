#!/usr/bin/env python3
"""Local one-row OMP runtime adapter accepting only the verified V12 bootstrap root."""
from __future__ import annotations

import base64
import binascii
import builtins
import contextlib
import copy
import hashlib
import io
import json
import os
import re
import shutil
import stat
import subprocess
import sys
import tarfile
import tempfile
import types
import urllib.parse
from pathlib import Path
from typing import Any, Callable, Iterator

HERE = Path(__file__).resolve().parent
R10 = HERE.parent
REPO = Path("/mnt/Cursor/PuppetMaster")
import dependency_bootstrap as DB
V7 = DB.verified_root()
sys.path.insert(0, str(V7))
import freeze_check  # type: ignore[import-not-found]  # noqa: E402
import omp_row_runner as base  # type: ignore[import-not-found]  # noqa: E402
import omp_session  # type: ignore[import-not-found]  # noqa: E402
import pipeline as P  # type: ignore[import-not-found]  # noqa: E402
import verify_matrix as V  # type: ignore[import-not-found]  # noqa: E402
DB.verify_modules()

ENV_PATHS = {
    "HOME": "home_dir",
    "XDG_CONFIG_HOME": "xdg_config_home",
    "XDG_CACHE_HOME": "xdg_cache_home",
    "XDG_DATA_HOME": "xdg_data_home",
    "CLAUDE_CONFIG_DIR": "claude_config_dir",
    "COPILOT_HOME": "copilot_home",
}
IDENTITY = ("ordinal", "pass_id", "route_id", "attempt_id", "nonce")
PROMPT_READY = "❯".encode()
MCP_SENTINEL = b"MCP finished"
VISIBLE_SELECTION = "GLM-5.3-Flash (2x usage) · ◉ max ·".encode()
PINNED_SNAPSHOT = {
    "commit": "9a9f3068a01652071933582266244cce726a2dd5",
    "complete_tree_roots": ["Plans", "scripts"],
    "content_roster_jsonl_bytes": 1620849,
    "content_roster_sha256": "c1ce5558298ce5d7ed7c66c6d784c348cd9c81df0915186be3eea8a685766150",
    "entry_count": 6097,
    "git_modes": ["100644", "100755"],
    "git_types": ["blob"],
    "live_plans_open_or_read_forbidden": True,
    "materialized_directory_mode": "0555",
    "materialized_executable_file_mode": "0555",
    "materialized_regular_file_mode": "0444",
    "plans_tree_oid": "f49b5214ff0a22ec60bebe5b50a27ad5769a2ecd",
    "post_run_materialization_retained": False,
    "roster_jsonl_bytes": 1157477,
    "roster_sha256": "aacc99ef10eb0c6a2e66c50d4c0813df080ce8ebd28b4b5c95e52cc46cdadcb7",
    "scripts_tree_oid": "a00c6451d5200148898cd39fb4e3b7863682a110",
    "source_manifest": {
        "bytes": 3171,
        "path": "tests/agent_packet_restrictions/successor_20260813/r10_simple_goal_prompts_v1/system_pipeline_sandbox_v7/source_manifest.json",
        "sha256": "b4950627ff8b4d417325dadb3a0099065253970b0bca1c6a5d2997669ba88b9d",
    },
    "total_blob_bytes": 286212474,
    "verification_rematerializes_from_git_objects": True,
}


class ControllerError(RuntimeError):
    """Local orchestration or custody failure."""


class PermanentCanaryError(RuntimeError):
    """Permanent post-claim or structurally terminal defect."""


class NormalizationError(RuntimeError):
    """Permanent typed-result defect after structural verification."""


MARKER_LIKE = re.compile(r"^PM_RESULT(?=$|[^A-Za-z0-9_])")
CANDIDATE = re.compile(r"^PM_RESULT[ \t]+(?P<payload>.+)$")


def _norm_require(value: bool, message: str) -> None:
    if not value:
        raise NormalizationError(message)


def typed_equal(left: Any, right: Any) -> bool:
    """Semantic object equality with exact types and meaningful list order."""
    if type(left) is not type(right):
        return False
    if isinstance(left, dict):
        return set(left) == set(right) and all(typed_equal(left[key], right[key]) for key in left)
    if isinstance(left, list):
        return len(left) == len(right) and all(typed_equal(a, b) for a, b in zip(left, right))
    return left == right


def validate_schema(value: Any, schema: dict[str, Any]) -> None:
    try:
        import jsonschema

        jsonschema.Draft202012Validator.check_schema(schema)
        jsonschema.Draft202012Validator(schema).validate(value)
    except Exception as exc:
        raise NormalizationError(f"PM_RESULT schema/type rejection: {type(exc).__name__}: {exc}") from exc


def normalize_verified_session(
    path: Path,
    structural: dict[str, Any],
    *,
    oracle_path: Path,
    schema_path: Path,
    max_text_block_utf8_bytes: int,
) -> dict[str, Any]:
    """Project canonical typed output from all structurally admitted assistant text."""
    _norm_require(type(max_text_block_utf8_bytes) is int and max_text_block_utf8_bytes > 0, "text bound")
    oracle, schema = P.load_json(oracle_path), P.load_json(schema_path)
    oracle_text = oracle_path.read_text(encoding="utf-8").strip()
    _norm_require(P.strict_loads(oracle_text) == oracle, "frozen oracle text/object join")
    canonical_line = P.RESULT_PREFIX + oracle_text
    _slot, _header, entries, _raw = omp_session.load_physical_session(path)
    assistants = [
        (entry_index, entry, entry["message"])
        for entry_index, entry in enumerate(entries)
        if entry.get("type") == "message"
        and isinstance(entry.get("message"), dict)
        and entry["message"].get("role") == "assistant"
    ]
    _norm_require(len(assistants) == structural.get("assistant_message_count") and assistants, "verified assistant roster join")
    text_records: list[dict[str, Any]] = []
    candidates: list[tuple[Any, dict[str, Any]]] = []
    total_text_bytes = 0
    for assistant_ordinal, (entry_index, entry, message) in enumerate(assistants, 1):
        content = message.get("content")
        _norm_require(isinstance(content, list), "verified assistant content list")
        for block_index, block in enumerate(content):
            if not isinstance(block, dict) or block.get("type") != "text":
                continue
            text = block.get("text")
            _norm_require(isinstance(text, str), "verified assistant text block")
            raw_text = text.encode("utf-8")
            _norm_require(len(raw_text) <= max_text_block_utf8_bytes, "assistant text block byte ceiling")
            total_text_bytes += len(raw_text)
            text_records.append({
                "assistant_ordinal": assistant_ordinal,
                "entry_index": entry_index,
                "entry_id": entry.get("id"),
                "message_id": message.get("id"),
                "block_index": block_index,
                "utf8_bytes": len(raw_text),
                "sha256": P.sha256_bytes(raw_text),
            })
            for line_index, line in enumerate(text.split("\n"), 1):
                stripped = line.strip(" \t")
                if not MARKER_LIKE.match(stripped):
                    continue
                match = CANDIDATE.fullmatch(stripped)
                _norm_require(match is not None, f"marker-like PM_RESULT line lacks ASCII horizontal separator and payload at assistant {assistant_ordinal} block {block_index} line {line_index}")
                raw_line = line.encode("utf-8")
                record = {
                    "assistant_ordinal": assistant_ordinal,
                    "entry_index": entry_index,
                    "entry_id": entry.get("id"),
                    "message_id": message.get("id"),
                    "block_index": block_index,
                    "line_index": line_index,
                    "raw_line": line,
                    "raw_line_utf8_bytes": len(raw_line),
                    "raw_line_sha256": P.sha256_bytes(raw_line),
                }
                try:
                    value = P.strict_loads(match.group("payload"))
                    validate_schema(value, schema)
                except (P.PipelineError, UnicodeError, ValueError, TypeError, NormalizationError) as exc:
                    raise NormalizationError(f"invalid PM_RESULT candidate at assistant {assistant_ordinal} block {block_index} line {line_index}: {type(exc).__name__}: {exc}") from exc
                candidates.append((value, record))
    _norm_require(total_text_bytes <= max_text_block_utf8_bytes * len(assistants), "bounded assistant text aggregate")
    _norm_require(bool(candidates), "at least one line-start PM_RESULT candidate")
    first = candidates[0][0]
    _norm_require(all(typed_equal(value, first) for value, _record in candidates[1:]), "conflicting PM_RESULT candidates")
    _norm_require(typed_equal(first, oracle), "PM_RESULT candidate value differs from frozen oracle")
    raw_last = structural.get("final_text")
    _norm_require(isinstance(raw_last, str), "raw last-assistant text")
    raw_last_bytes = raw_last.encode("utf-8")
    candidate_records = [record for _value, record in candidates]
    projection = dict(structural)
    projection.update({
        "raw_last_assistant_text": raw_last,
        "raw_last_assistant_utf8_bytes": len(raw_last_bytes),
        "raw_last_assistant_sha256": P.sha256_bytes(raw_last_bytes),
        "verified_assistant_text_blocks": text_records,
        "verified_assistant_text_utf8_bytes": total_text_bytes,
        "result_normalization": {
            "schema_id": "pm.r10.storage_pipeline.result_normalization.v1",
            "result_authority": "deterministic_host_program_over_verified_assistant_text",
            "location_indexing": "entry_and_block_zero_based_line_one_based",
            "candidate_count": len(candidate_records),
            "candidates": candidate_records,
            "canonical_text": canonical_line,
            "canonical_utf8_bytes": len(canonical_line.encode("utf-8")),
            "canonical_sha256": P.sha256_bytes(canonical_line.encode("utf-8")),
            "raw_session_preserved": True,
            "surrounding_prose_authoritative": False,
        },
        "final_text": canonical_line,
        "final_text_sha256": P.sha256_bytes(canonical_line.encode("utf-8")),
    })
    return projection


class PromptDirectory:
    def __init__(self, v7: Path, prompt: Path) -> None:
        self.v7, self.prompt = v7, prompt

    def __truediv__(self, name: str) -> Path:
        return self.prompt if name == "omp.prompt.txt" else self.v7 / "prompts" / name


class RuntimeRoot(os.PathLike[str]):
    """V7 runtime root whose OMP prompt is owned by the new package."""
    def __init__(self, v7: Path, prompt: Path) -> None:
        self.v7, self.prompt = v7, prompt

    def __fspath__(self) -> str:
        return str(self.v7)

    def __str__(self) -> str:
        return str(self.v7)

    def __truediv__(self, name: str) -> Any:
        if name == "prompts":
            return PromptDirectory(self.v7, self.prompt)
        if name == "prompts/omp.prompt.txt":
            return self.prompt
        return self.v7 / name


class PipelineProxy:
    def __init__(self, runtime: "LocalRuntime") -> None:
        self.runtime = runtime

    def verify(self) -> dict[str, Any]:
        rt = self.runtime
        receipt = rt.verify_input_snapshot()
        rt.require(rt.SNAPSHOT_OWNED and receipt == rt.SNAPSHOT_RECEIPT, "verified owned frozen snapshot receipt")
        rt.require(receipt["commit"] == rt.SNAPSHOT_COMMIT and receipt["live_plans_open_or_read_count"] == 0, "verified object-only snapshot identity")
        old_repo, proxy_state = rt.P.REPO, dict(self.__dict__)
        module_state = {name: id(value) for name, value in vars(rt.P).items() if name != "REPO"}
        try:
            rt.P.REPO = Path(receipt["materialized_root"])
            with rt.forbid_live_plan_reads():
                return rt.ORIGINAL_PIPELINE_VERIFY()
        finally:
            rt.P.REPO = old_repo
            rt.require(self.__dict__ == proxy_state, "pipeline proxy state restored")
            rt.require({name: id(value) for name, value in vars(rt.P).items() if name != "REPO"} == module_state, "only pipeline REPO may be rebound")

    def __getattr__(self, name: str) -> Any:
        return self.runtime.runtime_manifest if name == "load_json" else getattr(self.runtime.P, name)


class LocalRuntime:
    """G-shaped, controller-injected runtime with one owned mutable state cell."""
    ENV_PATHS = ENV_PATHS
    PINNED_SNAPSHOT = PINNED_SNAPSHOT
    PROMPT_READY = PROMPT_READY
    MCP_SENTINEL = MCP_SENTINEL
    VISIBLE_SELECTION = VISIBLE_SELECTION

    def __init__(
        self,
        *,
        repo: Path,
        here: Path,
        v7: Path,
        prompt: Path,
        evidence: Path,
        spec: Callable[[], dict[str, Any]],
        rows: Callable[[], list[dict[str, Any]]],
        row_dir: Callable[[dict[str, Any] | None], Path] | None,
        git_custody: Callable[[], dict[str, Any]],
        normalizer: Callable[..., dict[str, Any]] | None = normalize_verified_session,
        error_type: type[Exception] = ControllerError,
        permanent_error_type: type[Exception] = PermanentCanaryError,
        snapshot: dict[str, Any] = PINNED_SNAPSHOT,
        snapshot_contract: Callable[[], dict[str, Any]] | None = None,
        cleanup_prefix: str = "/tmp/pm-r10-storage-v7-snapshot-fallback-v12-",
        route_id: str = "omp_glm53_flash_max",
        visible_selection: bytes = VISIBLE_SELECTION,
        run_process: Callable[..., subprocess.CompletedProcess[Any]] = subprocess.run,
    ) -> None:
        self.REPO, self.HERE, self.V7 = Path(repo).absolute(), Path(here).absolute(), Path(v7).absolute()
        self.PROMPT, self.EVIDENCE = Path(prompt).absolute(), Path(evidence).absolute()
        self.spec, self.rows, self._row_dir, self.git_custody = spec, rows, row_dir, git_custody
        self.ControllerError, self.PermanentCanaryError = error_type, permanent_error_type
        self.NORMALIZE = normalizer
        self.snapshot, self.snapshot_contract = copy.deepcopy(snapshot), snapshot_contract
        self.SNAPSHOT_COMMIT = self.snapshot["commit"]
        self.cleanup_prefix, self.ROUTE_ID = cleanup_prefix, route_id
        self.VISIBLE_SELECTION = visible_selection
        self.P, self.V, self.base, self.omp_session, self.freeze_check = P, V, base, omp_session, freeze_check
        self.ORIGINAL_PREFLIGHT = base.row_preflight
        self.ORIGINAL_ATOMIC = base.atomic_json
        self.ORIGINAL_EXPECTED_ARGV = base.expected_argv
        self.ORIGINAL_VERIFY_ARGV = V.expected_argv
        self.ORIGINAL_RUN_ROW = base.run_row
        self.ORIGINAL_VERIFY_OMP_RAW = V.verify_omp_raw
        self.ORIGINAL_PREFIX = omp_session.verify_submission_prefix
        self.ORIGINAL_SESSION = omp_session.verify_session
        self.ORIGINAL_POPEN = subprocess.Popen
        self.ORIGINAL_RUN = run_process
        self.ORIGINAL_PIPELINE_VERIFY = P.verify
        self.DISPATCH_CUSTODY: dict[str, Any] | None = None
        self.SNAPSHOT_OWNED = False
        self.SNAPSHOT_RECEIPT: dict[str, Any] | None = None
        self.RUNTIME_ROOT = RuntimeRoot(self.V7, self.PROMPT)
        self.PROXY = PipelineProxy(self)
        self.PROMPT_READY_RUN_ROW = self.literal_clone(self.ORIGINAL_RUN_ROW, {MCP_SENTINEL: PROMPT_READY}, "runner prompt-ready")
        self.PROMPT_READY_VERIFY_OMP_RAW = self.literal_clone(self.ORIGINAL_VERIFY_OMP_RAW, {MCP_SENTINEL: PROMPT_READY, "mcp_startup_finished": "prompt_ready_observed"}, "verifier prompt-ready")

    def require(self, value: bool, message: str) -> None:
        if not value:
            raise self.ControllerError(message)

    def permanent(self, value: bool, message: str) -> None:
        if not value:
            raise self.PermanentCanaryError(message)

    def row(self) -> dict[str, Any]:
        frozen = self.rows()
        self.require(isinstance(frozen, list) and len(frozen) == 1, "one local runtime row")
        return frozen[0]

    def row_dir(self, row: dict[str, Any] | None = None) -> Path:
        item = row or self.row()
        if self._row_dir is not None:
            return self._row_dir(item)
        return self.EVIDENCE / item["pass_id"] / item["route_id"]

    def file_record(self, path: Path, root: Path | None = None) -> dict[str, Any]:
        anchor = root or self.REPO
        self.require(path.is_file() and not path.is_symlink(), f"regular file: {path}")
        return {"path": path.relative_to(anchor).as_posix(), "bytes": path.stat().st_size, "sha256": self.P.sha256_file(path)}

    def runtime_record(self, path: Path) -> dict[str, Any]:
        self.require(path.is_file() and not path.is_symlink(), f"regular runtime file: {path}")
        return {"path": str(path), "bytes": path.stat().st_size, "sha256": self.P.sha256_file(path), "mode": oct(path.stat().st_mode & 0o777)}

    def run_git(self, *args: str, binary: bool = False) -> subprocess.CompletedProcess[Any]:
        return self.ORIGINAL_RUN(["git", "-C", str(self.REPO), *args], check=False, capture_output=True, text=not binary)

    def _live_plan_path(self, value: Any, dir_fd: int | None = None) -> bool:
        if isinstance(value, int):
            return False
        try:
            raw = os.fspath(value)
            raw = os.fsdecode(raw) if isinstance(raw, bytes) else raw
            candidate = Path(raw)
            if not candidate.is_absolute():
                base_path = Path(os.readlink(f"/proc/self/fd/{dir_fd}")) if dir_fd is not None else Path.cwd()
                candidate = base_path / candidate
            candidate = Path(os.path.abspath(os.path.normpath(candidate)))
        except (OSError, TypeError, ValueError):
            return False
        live_roots = (self.REPO / "Plans", self.REPO / Path(self.snapshot["source_manifest"]["path"]).parent)
        for _depth in range(40):
            if any(candidate == live or live in candidate.parents for live in live_roots):
                return True
            parts, current, redirected = candidate.parts, Path(candidate.anchor), False
            for index, part in enumerate(parts[1:], 1):
                current /= part
                if any(current == live or live in current.parents for live in live_roots):
                    return True
                try:
                    mode = os.lstat(current).st_mode
                except FileNotFoundError:
                    return False
                if stat.S_ISLNK(mode):
                    target = Path(os.readlink(current))
                    if not target.is_absolute():
                        target = current.parent / target
                    candidate = Path(os.path.abspath(os.path.normpath(target.joinpath(*parts[index + 1 :]))))
                    redirected = True
                    break
            if not redirected:
                return False
        return True

    @contextlib.contextmanager
    def forbid_live_plan_reads(self) -> Iterator[None]:
        original_builtin, original_io, original_os, original_stat = builtins.open, io.open, os.open, os.stat

        def checked(call: Any) -> Any:
            def wrapper(file: Any, *args: Any, **kwargs: Any) -> Any:
                self.require(not self._live_plan_path(file, kwargs.get("dir_fd")), f"live Plans read forbidden: {file}")
                return call(file, *args, **kwargs)
            return wrapper

        builtins.open, io.open, os.open, os.stat = checked(original_builtin), checked(original_io), checked(original_os), checked(original_stat)
        try:
            yield
        finally:
            builtins.open, io.open, os.open, os.stat = original_builtin, original_io, original_os, original_stat

    def validate_snapshot_contract(self) -> None:
        self.require(self.snapshot["entry_count"] == 6097, "exact 6097-entry snapshot")
        self.require(self.snapshot["commit"] == PINNED_SNAPSHOT["commit"] and self.snapshot["plans_tree_oid"] == PINNED_SNAPSHOT["plans_tree_oid"] and self.snapshot["scripts_tree_oid"] == PINNED_SNAPSHOT["scripts_tree_oid"], "pinned snapshot identity")
        if self.snapshot_contract is not None:
            self.require(self.snapshot_contract() == self.snapshot, "literal/contract snapshot freeze")

    def snapshot_records(self, expected: dict[str, Any] | None = None) -> list[dict[str, Any]]:
        frozen = expected or self.snapshot
        if expected is None:
            self.validate_snapshot_contract()
        resolved = self.run_git("rev-parse", "--verify", f"{frozen['commit']}^{{commit}}")
        self.require(resolved.returncode == 0 and resolved.stdout.strip() == frozen["commit"], "pinned snapshot commit")
        roots = frozen["complete_tree_roots"]
        trees = self.run_git("ls-tree", frozen["commit"], "--", *roots)
        self.require(trees.returncode == 0, "snapshot root trees")
        observed_trees: dict[str, str] = {}
        for line in trees.stdout.splitlines():
            metadata, path = line.split("\t", 1)
            mode, kind, oid = metadata.split()
            self.require(mode == "040000" and kind == "tree" and path in roots and path not in observed_trees, "snapshot tree shape")
            observed_trees[path] = oid
        self.require(observed_trees == {"Plans": frozen["plans_tree_oid"], "scripts": frozen["scripts_tree_oid"]}, "snapshot tree OIDs")
        result = self.run_git("ls-tree", "-rz", "-l", frozen["commit"], "--", *roots, binary=True)
        self.require(result.returncode == 0 and result.stderr == b"", "recursive snapshot tree read")
        records: list[dict[str, Any]] = []
        for item in result.stdout.split(b"\0"):
            if not item:
                continue
            metadata, encoded = item.split(b"\t", 1)
            mode, kind, oid, size = metadata.decode("ascii").split()
            path = encoded.decode("utf-8")
            parts = Path(path).parts
            self.require(mode in frozen["git_modes"] and kind in frozen["git_types"] and len(oid) == 40 and size.isdigit(), "snapshot blob shape")
            self.require(parts and parts[0] in roots and all(part not in {"", ".", ".."} for part in parts) and not Path(path).is_absolute(), "safe snapshot path")
            records.append({"mode": mode, "type": kind, "oid": oid, "bytes": int(size), "path": path})
        roster = b"".join((self.P.canonical_json(record) + "\n").encode() for record in records)
        self.require(len(records) == frozen["entry_count"] and sum(record["bytes"] for record in records) == frozen["total_blob_bytes"], "snapshot count/bytes")
        self.require(len(roster) == frozen["roster_jsonl_bytes"] and self.P.sha256_bytes(roster) == frozen["roster_sha256"], "snapshot roster freeze")
        manifest_path = self.V7 / "source_manifest.json"
        self.require(manifest_path.is_file() and not manifest_path.is_symlink(), "bootstrapped snapshot source manifest")
        manifest = {"path": frozen["source_manifest"]["path"], "bytes": manifest_path.stat().st_size, "sha256": self.P.sha256_file(manifest_path)}
        self.require(manifest == frozen["source_manifest"], "snapshot source manifest freeze")
        return records

    def expected_snapshot_dirs(self, records: list[dict[str, Any]]) -> set[str]:
        directories = set(self.snapshot["complete_tree_roots"])
        for record in records:
            parent = Path(record["path"]).parent
            while str(parent) != ".":
                directories.add(parent.as_posix())
                parent = parent.parent
        return directories

    def verify_materialized_snapshot(self, root: Path, records: list[dict[str, Any]] | None = None) -> dict[str, Any]:
        frozen, rows_ = self.snapshot, records or self.snapshot_records()
        self.require(root.is_dir() and not root.is_symlink() and f"{root.lstat().st_mode & 0o777:04o}" == frozen["materialized_directory_mode"], "safe read-only snapshot root")
        expected_files = {record["path"]: record for record in rows_}
        expected_dirs = self.expected_snapshot_dirs(rows_)
        actual_files: set[str] = set()
        actual_dirs: set[str] = set()
        content_records: list[dict[str, Any]] = []
        for base_dir, dirs, files in os.walk(root, topdown=True, followlinks=False):
            base_path = Path(base_dir)
            for name in dirs:
                path = base_path / name
                relative = path.relative_to(root).as_posix()
                self.require(not path.is_symlink() and stat.S_ISDIR(path.lstat().st_mode) and f"{path.lstat().st_mode & 0o777:04o}" == frozen["materialized_directory_mode"], "snapshot directory roster/mode")
                actual_dirs.add(relative)
            for name in files:
                path = base_path / name
                relative = path.relative_to(root).as_posix()
                self.require(relative in expected_files and not path.is_symlink() and stat.S_ISREG(path.lstat().st_mode), "snapshot file roster/type")
                record = expected_files[relative]
                expected_mode = frozen["materialized_executable_file_mode"] if record["mode"] == "100755" else frozen["materialized_regular_file_mode"]
                self.require(f"{path.lstat().st_mode & 0o777:04o}" == expected_mode and path.stat().st_size == record["bytes"], "snapshot file mode/bytes")
                digest, git_digest = hashlib.sha256(), hashlib.sha1()
                git_digest.update(f"blob {record['bytes']}\0".encode())
                with path.open("rb") as handle:
                    for chunk in iter(lambda: handle.read(1024 * 1024), b""):
                        digest.update(chunk)
                        git_digest.update(chunk)
                self.require(git_digest.hexdigest() == record["oid"], "snapshot file Git blob identity")
                content_records.append({**record, "sha256": digest.hexdigest()})
                actual_files.add(relative)
        self.require(actual_files == set(expected_files) and actual_dirs == expected_dirs, "complete snapshot file/directory roster")
        content_records.sort(key=lambda value: value["path"].encode())
        content = b"".join((self.P.canonical_json(record) + "\n").encode() for record in content_records)
        self.require(len(content) == frozen["content_roster_jsonl_bytes"] and self.P.sha256_bytes(content) == frozen["content_roster_sha256"], "snapshot content roster freeze")
        return {
            "schema_id": "pm.r10.storage_pipeline.input_snapshot_receipt.v1",
            "commit": frozen["commit"],
            "complete_tree_roots": frozen["complete_tree_roots"],
            "tree_oids": {"Plans": frozen["plans_tree_oid"], "scripts": frozen["scripts_tree_oid"]},
            "entry_count": frozen["entry_count"],
            "total_blob_bytes": frozen["total_blob_bytes"],
            "roster_jsonl_bytes": frozen["roster_jsonl_bytes"],
            "roster_sha256": frozen["roster_sha256"],
            "content_roster_jsonl_bytes": frozen["content_roster_jsonl_bytes"],
            "content_roster_sha256": frozen["content_roster_sha256"],
            "materialized_root": str(root),
            "materialized_modes": {"directory": frozen["materialized_directory_mode"], "regular_file": frozen["materialized_regular_file_mode"], "executable_file": frozen["materialized_executable_file_mode"]},
            "source_manifest": frozen["source_manifest"],
            "git_objects_only": True,
            "live_plans_open_or_read_count": 0,
            "post_run_materialization_retained": False,
            "verification_rematerializes_from_git_objects": True,
        }

    def snapshot_digest(self, receipt: dict[str, Any]) -> str:
        return self.P.sha256_bytes((self.P.canonical_json(receipt) + "\n").encode())

    def remove_private_tree(self, root: Path) -> None:
        if not os.path.lexists(root):
            return
        self.require(root.is_dir() and not root.is_symlink(), "owned private tree root")
        for base_dir, dirs, files in os.walk(root, topdown=True, followlinks=False):
            base_path = Path(base_dir)
            os.chmod(base_path, 0o700)
            self.require(all(not (base_path / name).is_symlink() for name in dirs + files), "owned private tree symlink")
            for name in files:
                os.chmod(base_path / name, 0o600)
        shutil.rmtree(root)

    def materialize_snapshot(self, target: Path, records: list[dict[str, Any]]) -> None:
        self.require(not os.path.lexists(target), "fresh snapshot target")
        staging = Path(tempfile.mkdtemp(prefix="pm-r10-snapshot-build-", dir=str(target.parent)))
        archive, output = staging / "snapshot.tar", staging / "root"
        try:
            output.mkdir(mode=0o700)
            with archive.open("xb") as handle:
                result = self.ORIGINAL_RUN(["git", "-C", str(self.REPO), "archive", "--format=tar", self.SNAPSHOT_COMMIT, *self.snapshot["complete_tree_roots"]], check=False, stdout=handle, stderr=subprocess.PIPE)
            self.require(result.returncode == 0 and result.stderr == b"", "snapshot Git archive")
            expected_files = {record["path"]: record for record in records}
            expected_dirs = self.expected_snapshot_dirs(records)
            seen_files: set[str] = set()
            seen_dirs: set[str] = set()
            with tarfile.open(archive, "r:") as bundle:
                for member in bundle:
                    name = member.name.rstrip("/")
                    self.require(name and not Path(name).is_absolute() and all(part not in {"", ".", ".."} for part in Path(name).parts), "safe archive member")
                    destination = output / name
                    if member.isdir():
                        self.require(name in expected_dirs and not os.path.lexists(destination), "archive directory roster")
                        destination.mkdir(mode=0o700)
                        seen_dirs.add(name)
                        continue
                    self.require(member.isfile() and name in expected_files and name not in seen_files, "archive regular file roster")
                    record = expected_files[name]
                    self.require(member.size == record["bytes"] and bool(member.mode & 0o111) == (record["mode"] == "100755"), "archive file metadata")
                    source = bundle.extractfile(member)
                    self.require(source is not None and destination.parent.is_dir(), "archive file stream/parent")
                    digest, git_digest = hashlib.sha256(), hashlib.sha1()
                    git_digest.update(f"blob {record['bytes']}\0".encode())
                    with source, destination.open("xb") as handle:
                        for chunk in iter(lambda: source.read(1024 * 1024), b""):
                            handle.write(chunk)
                            digest.update(chunk)
                            git_digest.update(chunk)
                    self.require(destination.stat().st_size == record["bytes"] and git_digest.hexdigest() == record["oid"], "archive Git blob")
                    os.chmod(destination, 0o555 if record["mode"] == "100755" else 0o444)
                    seen_files.add(name)
            self.require(seen_files == set(expected_files) and seen_dirs == expected_dirs, "archive complete trees")
            for path in sorted((path for path in output.rglob("*") if path.is_dir()), key=lambda item: len(item.parts), reverse=True):
                os.chmod(path, 0o555)
            archive.unlink()
            os.replace(output, target)
            os.chmod(target, 0o555)
        finally:
            self.remove_private_tree(staging)

    def cleanup_owned_snapshot(self) -> None:
        target = Path(self.row()["snapshot_dir"])
        if not self.SNAPSHOT_OWNED or not os.path.lexists(target):
            self.SNAPSHOT_OWNED = False
            self.SNAPSHOT_RECEIPT = None
            return
        self.require(target == Path(self.row()["snapshot_dir"]) and str(target).startswith(self.cleanup_prefix), "owned snapshot cleanup scope")
        self.remove_private_tree(target)
        self.SNAPSHOT_OWNED = False
        self.SNAPSHOT_RECEIPT = None

    def prepare_input_snapshot(self) -> dict[str, Any]:
        target = Path(self.row()["snapshot_dir"])
        self.require(not self.SNAPSHOT_OWNED and not os.path.lexists(target), "fresh one-use input snapshot")
        records = self.snapshot_records()
        self.SNAPSHOT_OWNED = True
        try:
            self.materialize_snapshot(target, records)
            self.SNAPSHOT_RECEIPT = self.verify_materialized_snapshot(target, records)
            return copy.deepcopy(self.SNAPSHOT_RECEIPT)
        except BaseException:
            if self.SNAPSHOT_OWNED:
                self.cleanup_owned_snapshot()
            raise

    def verify_input_snapshot(self) -> dict[str, Any]:
        return self.verify_materialized_snapshot(Path(self.row()["snapshot_dir"]), self.snapshot_records())

    @contextlib.contextmanager
    def verification_snapshot(self) -> Iterator[dict[str, Any]]:
        target = Path(self.row()["snapshot_dir"])
        ephemeral = not os.path.lexists(target)
        receipt = self.prepare_input_snapshot() if ephemeral else self.verify_input_snapshot()
        self.require(receipt == self.SNAPSHOT_RECEIPT and self.SNAPSHOT_OWNED, "owned verification snapshot")
        try:
            yield receipt
        finally:
            if ephemeral:
                self.cleanup_owned_snapshot()

    def runtime_paths(self, row: dict[str, Any] | None = None) -> list[str]:
        item = row or self.row()
        return [item[name] for name in ("cwd", "session_dir", "profile_dir", "snapshot_dir", *ENV_PATHS.values(), "private_capture_dir") if item.get(name)]

    def isolated_env(self, source: dict[str, str]) -> dict[str, str]:
        row, environment = self.row(), dict(source)
        environment["PI_CODING_AGENT_DIR"] = row["profile_dir"]
        for key, field in ENV_PATHS.items():
            environment[key] = row[field]
        environment["OMP_PROFILE"] = environment["PI_PROFILE"] = "default"
        environment.pop("PI_REQ_DEBUG", None)
        return environment

    def prepare_profile(self) -> dict[str, Any]:
        row, target = self.row(), Path(self.row()["profile_dir"])
        roots = [Path(row[field]) for field in ENV_PATHS.values()]
        self.require(not any(os.path.lexists(path) for path in [target, *roots]), "fresh isolated profile/environment roots")
        source = Path(self.spec()["runtime"]["source_profile_dir"])
        self.require(source.is_dir() and not source.is_symlink(), "safe approved source profile")
        target.mkdir(mode=0o700)
        origins = []
        for name in ("config.yml", "agent.db", "models.db"):
            path = source / name
            self.require(path.is_file() and not path.is_symlink(), f"safe profile source: {name}")
            origins.append(self.runtime_record(path))
            shutil.copy2(path, target / name)
            os.chmod(target / name, 0o600)
        overlay = b"\ngoal:\n  enabled: true\n  continuationModes: []\nrecap:\n  enabled: false\n"
        with (target / "config.yml").open("ab") as handle:
            handle.write(overlay)
        models_override=b"providers:\n  opencode-go:\n    modelOverrides:\n      glm-5.3-flash:\n        thinking:\n          mode: effort\n          efforts: [low, high, max]\n"
        with (target / "models.yml").open("xb") as handle:
            handle.write(models_override)
        os.chmod(target / "models.yml",0o600)
        seeds = [self.runtime_record(target / name) for name in ("config.yml", "agent.db", "models.db", "models.yml")]
        for path in roots:
            path.mkdir(mode=0o700)
        self.require({path.name for path in target.iterdir()} == {"config.yml", "agent.db", "models.db", "models.yml"}, "exact four-file profile seed")
        self.require(all(not any(path.iterdir()) for path in roots), "empty isolated environment roots")
        config = (target / "config.yml").read_bytes()
        self.require(b"!" not in config and b"agentAdvisor" in config and b"enabled: false" in config, "safe advisor-off profile seed")
        return {"source_profile": str(source), "source_records": origins, "seed_records": seeds, "seed_roster": ["agent.db", "config.yml", "models.db", "models.yml"], "mcp_tool_extension_seed_files": 0, "environment_roots": {key: row[field] for key, field in ENV_PATHS.items()}, "environment_roots_initially_empty": True, "omp_profile": "default", "pi_profile": "default", "config_overlay": {"goal.continuationModes": [], "recap.enabled": False}, "config_overlay_utf8_bytes": len(overlay), "config_overlay_sha256": self.P.sha256_bytes(overlay), "models_override":{"git_commit":"4beba8892ec3fd82a5b83c6ec403b4ebd56e7512","git_blob":"f71494ecbb66cbed545bdfa72bd09de0b65cf971","bytes":144,"sha256":"f1a585a1ec9c1a89f2d7533322bad3b7897117cd5fe3e1899bf6bf1139969a69","mode":"0o600"}}

    def raw_record(self, raw: bytes) -> dict[str, Any]:
        return {"encoding": "base64", "bytes": len(raw), "sha256": self.P.sha256_bytes(raw), "data": base64.b64encode(raw).decode("ascii")}

    def raw_bytes(self, record: Any, label: str) -> bytes:
        self.require(isinstance(record, dict) and set(record) == {"encoding", "bytes", "sha256", "data"} and record.get("encoding") == "base64", f"{label} raw receipt shape")
        self.require(type(record["bytes"]) is int and isinstance(record["sha256"], str) and isinstance(record["data"], str), f"{label} raw receipt types")
        try:
            raw = base64.b64decode(record["data"], validate=True)
        except (binascii.Error, ValueError, TypeError) as exc:
            raise self.ControllerError(f"{label} base64") from exc
        self.require(record["data"] == base64.b64encode(raw).decode("ascii") and record["bytes"] == len(raw) and record["sha256"] == self.P.sha256_bytes(raw), f"{label} raw bytes/hash")
        return raw

    def catalog_projection(self, raw: bytes) -> dict[str, Any]:
        self.require(raw.endswith(b"\n") and raw.count(b"\n") == 1 and b"\r" not in raw, "catalog stdout one exact LF-terminated JSON line")
        try:
            value = self.P.strict_loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, self.P.PipelineError, ValueError, TypeError) as exc:
            raise self.ControllerError("catalog stdout strict JSON") from exc
        self.require(isinstance(value, dict) and set(value) == {"models"} and isinstance(value["models"], list), "catalog JSON shape")
        models = value["models"]
        selectors = [model.get("selector") for model in models if isinstance(model, dict)]
        self.require(len(selectors) == len(models) and all(isinstance(selector, str) and selector for selector in selectors), "catalog model selector shape")
        target = self.spec()["catalog_gate"]["expected_model"]
        matches = [model for model in models if model["selector"] == target["selector"]]
        self.require(len(matches) == 1, "catalog exact unique MiMo selector")
        model = matches[0]
        self.require(set(model) == {"provider", "id", "selector", "name", "contextWindow", "maxTokens", "reasoning", "thinking", "input", "cost"}, "catalog MiMo model shape")
        return {"model_count": len(models), "exact_selector_count": 1, "model": model}

    def validate_catalog_projection(self, projection: Any) -> None:
        gate, expected = self.spec()["catalog_gate"], self.spec()["catalog_gate"]["expected_model"]
        self.require(isinstance(projection, dict) and set(projection) == {"model_count", "exact_selector_count", "model"}, "catalog projection shape")
        self.require(type(projection["model_count"]) is int and projection["model_count"] > 0 and type(projection["exact_selector_count"]) is int and projection["exact_selector_count"] == 1, "catalog projection counts")
        model = projection["model"]
        self.require(isinstance(model, dict), "catalog model projection")
        for field in ("provider", "id", "selector", "name", "input"):
            self.require(model.get(field) == expected[field], f"catalog MiMo {field}")
        self.require(type(model.get("contextWindow")) is int and model["contextWindow"] == expected["contextWindow"] and type(model.get("maxTokens")) is int and model["maxTokens"] == expected["maxTokens"], "catalog MiMo limits")
        self.require(model.get("reasoning") is True, "catalog MiMo reasoning")
        cost = model.get("cost")
        self.require(isinstance(cost, dict) and set(cost) == {"input", "output", "cacheRead", "cacheWrite"} and all(type(value) is int and value == 0 for value in cost.values()), "catalog MiMo exact zero pricing")
        thinking = model.get("thinking")
        self.require(isinstance(thinking, list) and thinking and len(thinking) == len(set(thinking)) and all(value in gate["recognized_thinking_efforts"] for value in thinking), "catalog MiMo thinking capability shape")
        self.require(gate["required_thinking_effort"] in thinking, "catalog MiMo high effort unavailable")

    def catalog_digest(self, receipt: dict[str, Any]) -> str:
        return self.P.sha256_bytes((self.P.canonical_json(receipt) + "\n").encode())

    def forced_catalog_refresh(self) -> dict[str, Any]:
        gate = self.spec()["catalog_gate"]
        started, timed_out = self.base.utc_now(), False
        try:
            result = self.ORIGINAL_RUN(gate["argv"], cwd=str(self.HERE), env=self.isolated_env(dict(os.environ)), capture_output=True, text=False, timeout=gate["command_timeout_seconds"], check=False)
            exit_code, stdout, stderr = result.returncode, result.stdout, result.stderr
        except subprocess.TimeoutExpired as exc:
            timed_out, exit_code = True, None
            stdout = exc.stdout if isinstance(exc.stdout, bytes) else b""
            stderr = exc.stderr if isinstance(exc.stderr, bytes) else b""
        finished = self.base.utc_now()
        projection, projection_error = None, None
        try:
            projection = self.catalog_projection(stdout)
        except (self.ControllerError, self.P.PipelineError, self.V.VerifyError, ValueError, TypeError) as exc:
            projection_error = f"{type(exc).__name__}: {exc}"
        return {"schema_id": "pm.r10.storage_pipeline.omp_catalog_refresh_preflight.v2", "name": "forced_catalog_refresh", "started_at_utc": started, "finished_at_utc": finished, "duration_ms": int((self.V.parse_utc(finished) - self.V.parse_utc(started)).total_seconds() * 1000), "argv": gate["argv"], "cwd": str(self.HERE), "profile_dir": self.row()["profile_dir"], "profile_environment": {"PI_CODING_AGENT_DIR": self.row()["profile_dir"], "OMP_PROFILE": "default", "PI_PROFILE": "default"}, "forced_online": True, "extensions_disabled": True, "timeout_seconds": gate["command_timeout_seconds"], "timed_out": timed_out, "exit_code": exit_code, "stdout": self.raw_record(stdout), "stderr": self.raw_record(stderr), "projection": projection, "projection_error": projection_error}

    def validate_catalog_receipt(self, receipt: Any, launch_time: str | None = None) -> None:
        gate = self.spec()["catalog_gate"]
        keys = {"schema_id", "name", "started_at_utc", "finished_at_utc", "duration_ms", "argv", "cwd", "profile_dir", "profile_environment", "forced_online", "extensions_disabled", "timeout_seconds", "timed_out", "exit_code", "stdout", "stderr", "projection", "projection_error"}
        self.require(isinstance(receipt, dict) and set(receipt) == keys, "catalog receipt shape")
        self.require(receipt["schema_id"] == "pm.r10.storage_pipeline.omp_catalog_refresh_preflight.v2" and receipt["name"] == "forced_catalog_refresh", "catalog receipt identity")
        self.require(receipt["argv"] == gate["argv"] and receipt["cwd"] == str(self.HERE) and receipt["profile_dir"] == self.row()["profile_dir"], "catalog command/profile")
        self.require(receipt["profile_environment"] == {"PI_CODING_AGENT_DIR": self.row()["profile_dir"], "OMP_PROFILE": "default", "PI_PROFILE": "default"}, "catalog isolated profiles")
        stdout, stderr = self.raw_bytes(receipt["stdout"], "catalog stdout"), self.raw_bytes(receipt["stderr"], "catalog stderr")
        self.require(receipt["forced_online"] is receipt["extensions_disabled"] is True and receipt["timeout_seconds"] == gate["command_timeout_seconds"] and receipt["timed_out"] is False and receipt["exit_code"] == 0 and stderr == b"", "catalog clean forced refresh")
        self.require(receipt["projection_error"] is None and receipt["projection"] == self.catalog_projection(stdout), "catalog projection receipt")
        self.validate_catalog_projection(receipt["projection"])
        started, finished = self.V.parse_utc(receipt["started_at_utc"]), self.V.parse_utc(receipt["finished_at_utc"])
        self.require(receipt["duration_ms"] == int((finished - started).total_seconds() * 1000) and 0 <= receipt["duration_ms"] <= gate["command_timeout_seconds"] * 1000, "catalog chronology")
        if launch_time is not None:
            age = (self.V.parse_utc(launch_time) - finished).total_seconds()
            self.require(0 <= age <= gate["freshness_to_popen_max_seconds"], "catalog freshness to Popen")

    def runtime_manifest(self, path: Any) -> Any:
        value = self.P.load_json(path)
        if Path(os.fspath(path)).absolute() == (self.V7 / "runtime_manifest.json").absolute():
            value = copy.deepcopy(value)
            runtime = self.spec()["runtime"]
            for key in ("binary", "binary_bytes", "binary_sha256"):
                value["omp"][key] = runtime[key]
            value["omp"]["version"] = runtime.get("version", runtime.get("omp_version"))
            value["omp"]["profile_dir"] = self.row()["profile_dir"]
        return value

    def with_no_extensions(self, argv: list[str]) -> list[str]:
        self.permanent("--config" not in argv and "--no-extensions" not in argv and argv.count("--cwd") == 1, "base native argv")
        index = argv.index("--cwd")
        return [*argv[:index], "--no-extensions", *argv[index:]]

    def expected_argv(self, route: dict[str, Any], row: dict[str, Any]) -> list[str]:
        return self.with_no_extensions(self.ORIGINAL_EXPECTED_ARGV(route, row))

    def verify_expected_argv(self, route: dict[str, Any], cwd: str, session_dir: str) -> list[str]:
        return self.with_no_extensions(self.ORIGINAL_VERIFY_ARGV(route, cwd, session_dir))

    def literal_clone(self, function: Any, replacements: dict[Any, Any], label: str) -> Any:
        code = function.__code__
        for old in replacements:
            self.permanent(sum(value == old for value in code.co_consts) == 1, f"one {label} literal")
        patched = code.replace(co_consts=tuple(replacements.get(value, value) for value in code.co_consts))
        clone = types.FunctionType(patched, function.__globals__, function.__name__, function.__defaults__, function.__closure__)
        clone.__kwdefaults__ = function.__kwdefaults__
        return clone

    def composer_transition(self, before: bytes, after: bytes) -> dict[str, Any]:
        self.permanent(isinstance(before, bytes) and isinstance(after, bytes) and before and after.startswith(before), "composer snapshot contamination")
        pre, post, delta = self.base.strip_terminal(before), self.base.strip_terminal(after), self.base.strip_terminal(after[len(before):])
        markers = ("📄 #1".encode(), b"/goal Audit", "❯ 📄 #1".encode())
        submitted = self.row_dir() / "stdin_prompt.raw"
        self.permanent(submitted.is_file() and not submitted.is_symlink() and submitted.read_bytes() == self.PROMPT.read_bytes(), "exact prompt bytes before composer")
        self.permanent(PROMPT_READY in pre and MCP_SENTINEL not in pre and MCP_SENTINEL not in post and self.VISIBLE_SELECTION in pre and all(marker not in pre for marker in markers), "safe MiMo prompt-ready state")
        previews = re.findall(rb"/goal ([A-Za-z]+)", delta)
        cards = re.findall("📄 #([0-9]+)".encode(), delta)
        ready = all(marker in post for marker in markers) and len(after) > len(before)
        self.permanent(all(b"Audit".startswith(value) for value in previews) and all(value == b"1" for value in cards) and (not ready or (previews[-1:] == [b"Audit"] and cards[-1:] == [b"1"])), "composer contradiction")
        if not ready:
            raise self.base.RunnerError("prompt-specific composer transition pending")
        return {"mcp_startup_finished": False, "mcp_finished_banner_observed": False, "prompt_ready_observed": True, "prompt_ready_glyph": "❯", "prompt_card": "📄 #1", "prompt_preview": "/goal Audit", "composer_state": "❯ 📄 #1", "pre_prompt_bytes": len(before), "pre_prompt_sha256": self.P.sha256_bytes(before), "new_raw_bytes": len(after) - len(before), "visible_model": "MiMo V2.5 Free", "visible_thinking": "high", "visible_selection_sha256": self.P.sha256_bytes(self.VISIBLE_SELECTION)}

    def verify_omp_raw(self, path: Path, route: dict[str, Any], launch: dict[str, Any], terminal: dict[str, Any]) -> str:
        receipt = self.P.load_json(path / "composer_ack.json")
        pre = self.base.strip_terminal((path / "pre_prompt.raw").read_bytes())
        composer = self.base.strip_terminal((path / "composer_ack.raw").read_bytes())
        self.permanent(receipt.get("prompt_ready_observed") is True and receipt.get("mcp_startup_finished") is False and receipt.get("mcp_finished_banner_observed") is False, "truthful empty-MCP readiness")
        self.permanent(MCP_SENTINEL not in pre and MCP_SENTINEL not in composer and self.VISIBLE_SELECTION in pre, "MiMo selection/MCP raw custody")
        return self.PROMPT_READY_VERIFY_OMP_RAW(path, route, launch, terminal)

    def session_health(self, path: Path) -> bool:
        _slot, _header, entries, _raw = self.omp_session.load_physical_session(path)
        explicit_exit = False
        for entry in entries:
            message = entry.get("message") if entry.get("type") == "message" else None
            if isinstance(message, dict) and message.get("role") == "assistant":
                self.permanent(message.get("retryRecovery") is None and message.get("stopReason") != "error", "retry/provider error is permanent")
            explicit_exit |= entry.get("type") == "custom" and entry.get("customType") == "session_exit"
        assistants=[entry["message"] for entry in entries if entry.get("type")=="message" and isinstance(entry.get("message"),dict) and entry["message"].get("role")=="assistant"]
        goal_states=[entry.get("data",{}).get("goal") for entry in entries if entry.get("type")=="mode_change" and entry.get("mode")=="goal"]
        if assistants and goal_states and isinstance(goal_states[-1],dict) and goal_states[-1].get("status")=="active" and assistants[-1].get("stopReason")=="stop":
            calls=[block for block in assistants[-1].get("content",[]) if isinstance(block,dict) and block.get("type")=="toolCall"]
            self.permanent(calls,"assistant stopped with active Goal and no mandatory completion call")
        return explicit_exit

    def verify_submission_prefix(self, path: Path, **expected: Any) -> dict[str, Any]:
        self.session_health(path)
        transport=(self.row_dir()/"stdin_prompt.raw").read_bytes()
        self.permanent(transport.startswith(b"/goal ") and transport.endswith(b"\n") and len(transport)>7,"exact Goal transport framing")
        try: expected["expected_objective"]=transport[6:-1].decode("utf-8")
        except UnicodeDecodeError as exc: raise self.PermanentCanaryError("Goal transport UTF-8") from exc
        return self.ORIGINAL_PREFIX(path, **expected)

    def assistant_api(self, path: Path, structural: dict[str, Any]) -> dict[str, Any]:
        _slot, _header, entries, _raw = self.omp_session.load_physical_session(path)
        shutdown_id=structural.get("post_exit_shutdown_artifact",{}).get("entry_id")
        assistants = [entry["message"] for entry in entries if entry.get("id")!=shutdown_id and entry.get("type") == "message" and isinstance(entry.get("message"), dict) and entry["message"].get("role") == "assistant"]
        expected = self.spec()["catalog_gate"]["expected_assistant_api"]
        self.permanent(len(assistants) == structural.get("assistant_message_count") and assistants and all(message.get("api") == expected for message in assistants), "MiMo assistant API exact")
        return {"assistant_api": expected, "assistant_api_message_count": len(assistants)}

    def write_once(self, path: Path, value: Any) -> None:
        self.require(not os.path.lexists(path), f"immutable receipt exists: {path.name}")
        self.P.atomic_write(path, self.P.pretty_json(value))

    def request_response_binding(self) -> dict[str, Any]:
        row=self.row(); value={"schema_id":"pm.r10.storage_pipeline.glm_request_response_binding.v1","ordinal":row["ordinal"],"pass_id":row["pass_id"],"route_id":row["route_id"],"attempt_id":row["attempt_id"],"nonce":row["nonce"],"provider":"opencode-go","selector":"opencode-go/glm-5.3-flash","model":"glm-5.3-flash","reasoning_effort":"max","completed_pair_count":1,"post_exit_aborted_request_count":1,"projection_path":"request_response_projection.json"}
        return {"value":value,"sha256":self.P.sha256_bytes((self.P.canonical_json(value)+"\n").encode())}

    def _verify_response_log(self, path: Path, request: dict[str, Any], assistant: dict[str, Any], call: dict[str, Any]) -> dict[str, Any]:
        raw=path.read_bytes(); self.permanent(raw and len(raw)<=4*1024*1024,"nonempty bounded GLM response capture")
        split=b"\r\n\r\n" if b"\r\n\r\n" in raw else b"\n\n"; self.permanent(split in raw,"GLM response header/body boundary"); header,body=raw.split(split,1); header_lines=header.replace(b"\r\n",b"\n").split(b"\n")
        self.permanent(header_lines and header_lines[0]==b"HTTP 200 OK" and any(line.lower()==b"content-type: text/event-stream" for line in header_lines[1:]),"successful event-stream response")
        data=[]
        for line in body.replace(b"\r\n",b"\n").split(b"\n"):
            if not line: continue
            self.permanent(line.startswith(b"data: "),"exact SSE data framing"); data.append(line[6:])
        self.permanent(len(data)>=2 and data[-1]==b"[DONE]" and data.count(b"[DONE]")==1,"one terminal SSE DONE")
        chunks=[]
        for encoded in data[:-1]:
            try: value=self.P.strict_loads(encoded.decode("utf-8"))
            except Exception as exc: raise self.PermanentCanaryError(f"invalid GLM response chunk: {type(exc).__name__}: {exc}") from exc
            self.permanent(isinstance(value,dict) and value.get("model")=="glm-5.3-flash" and isinstance(value.get("id"),str) and value["id"] and isinstance(value.get("choices"),list) and len(value["choices"])==1,"GLM response chunk identity"); chunks.append(value)
        ids={item["id"] for item in chunks}; self.permanent(len(ids)==1,"one GLM completion id")
        content_parts=[]; tool_parts={}; finishes=[]
        for item in chunks:
            choice=item["choices"][0]; self.permanent(choice.get("index")==0 and isinstance(choice.get("delta"),dict),"GLM response choice zero"); delta=choice["delta"]
            if delta.get("content") is not None: self.permanent(isinstance(delta["content"],str),"GLM response content string"); content_parts.append(delta["content"])
            for fragment in delta.get("tool_calls",[]):
                self.permanent(isinstance(fragment,dict) and fragment.get("index")==0 and fragment.get("type") in {None,"function"},"one response tool index"); part=tool_parts.setdefault(0,{"id":"","name":"","arguments":""}); part["id"]+=fragment.get("id",""); function=fragment.get("function",{}); self.permanent(isinstance(function,dict),"response tool function"); part["name"]+=function.get("name",""); part["arguments"]+=function.get("arguments","")
            if choice.get("finish_reason") is not None: finishes.append(choice["finish_reason"])
        text="".join(content_parts); expected_text="".join(block.get("text","") for block in assistant.get("content",[])[:assistant["content"].index(call)] if isinstance(block,dict) and block.get("type")=="text")
        self.permanent(text==expected_text and text,"response content joins sole non-shutdown assistant"); self.permanent(finishes==["tool_calls"] and set(tool_parts)=={0},"response terminal tool-call condition"); tool=tool_parts[0]
        try: arguments=self.P.strict_loads(tool["arguments"])
        except Exception as exc: raise self.PermanentCanaryError(f"invalid response tool arguments: {type(exc).__name__}: {exc}") from exc
        self.permanent(tool["id"]==call.get("id") and tool["name"]=="goal" and arguments=={"op":"complete"},"response Goal call joins session")
        parsed=urllib.parse.urlsplit(request["url"]); self.permanent((parsed.scheme,parsed.netloc,parsed.path,parsed.query,parsed.fragment)==("https","opencode.ai","/zen/go/v1/chat/completions","",""),"safe GLM route")
        return {"raw_response_bytes":len(raw),"raw_response_sha256":self.P.sha256_bytes(raw),"http_status":200,"content_type":"text/event-stream","completion_id_sha256":self.P.sha256_bytes(next(iter(ids)).encode()),"sse_chunk_count":len(chunks),"terminal":"DONE","finish_reason":"tool_calls","assistant_text_utf8_bytes":len(text.encode()),"assistant_text_sha256":self.P.sha256_bytes(text.encode()),"tool_call_id":call.get("id"),"tool_name":"goal","tool_arguments":{"op":"complete"},"route":{"scheme":"https","host":"opencode.ai","path":"/zen/go/v1/chat/completions"}}

    def _verify_durable_request_response(self, receipt: dict[str, Any], structural: dict[str, Any], assistant: dict[str, Any], call: dict[str, Any]) -> None:
        binding=self.request_response_binding(); self.permanent(isinstance(receipt,dict) and set(receipt)=={"schema_id","binding","completed_pair_count","post_exit_aborted_request_count","pairs","aborted_requests"} and receipt["schema_id"]=="pm.r10.storage_pipeline.glm_request_response_projection.v1" and receipt["binding"]==binding,"durable request/response receipt schema/binding")
        self.permanent(receipt["completed_pair_count"]==1 and receipt["post_exit_aborted_request_count"]==1 and isinstance(receipt["pairs"],list) and len(receipt["pairs"])==1 and isinstance(receipt["aborted_requests"],list) and len(receipt["aborted_requests"])==1,"exact durable pair counts")
        pair=receipt["pairs"][0]; self.permanent(set(pair)=={"ordinal","assistant_entry_id","request","response"} and pair["ordinal"]==1 and pair["assistant_entry_id"]==structural["entry_ids"]["goal_call_assistant"],"durable pair assistant join"); request=pair["request"]; response=pair["response"]
        self.permanent(set(request)=={"raw_request_bytes","raw_request_sha256","method","model","reasoning_effort","tool_names"} and request["raw_request_bytes"]>0 and re.fullmatch(r"[0-9a-f]{64}",request["raw_request_sha256"]) is not None and request["method"]=="POST" and request["model"]=="glm-5.3-flash" and request["reasoning_effort"]=="max" and request["tool_names"]==["goal"],"durable request projection")
        response_keys={"raw_response_bytes","raw_response_sha256","http_status","content_type","completion_id_sha256","sse_chunk_count","terminal","finish_reason","assistant_text_utf8_bytes","assistant_text_sha256","tool_call_id","tool_name","tool_arguments","route"}; self.permanent(set(response)==response_keys and response["raw_response_bytes"]>0 and response["sse_chunk_count"]>0 and all(re.fullmatch(r"[0-9a-f]{64}",response[key]) is not None for key in ("raw_response_sha256","completion_id_sha256","assistant_text_sha256")) and response["http_status"]==200 and response["content_type"]=="text/event-stream" and response["terminal"]=="DONE" and response["finish_reason"]=="tool_calls" and response["tool_call_id"]==call.get("id") and response["tool_name"]=="goal" and response["tool_arguments"]=={"op":"complete"} and response["route"]=={"scheme":"https","host":"opencode.ai","path":"/zen/go/v1/chat/completions"},"durable response projection")
        text="".join(block.get("text","") for block in assistant.get("content",[])[:assistant["content"].index(call)] if isinstance(block,dict) and block.get("type")=="text"); self.permanent((response["assistant_text_utf8_bytes"],response["assistant_text_sha256"])==(len(text.encode()),self.P.sha256_bytes(text.encode())),"durable response assistant text join")
        aborted=receipt["aborted_requests"][0]; self.permanent(set(aborted)=={"ordinal","raw_request_bytes","raw_request_sha256","post_exit_aborted"} and aborted["ordinal"]==2 and aborted["raw_request_bytes"]>0 and re.fullmatch(r"[0-9a-f]{64}",aborted["raw_request_sha256"]) is not None and aborted["post_exit_aborted"] is True,"durable shutdown request projection")

    def verify_session(self, path: Path, **expected: Any) -> dict[str, Any]:
        terminal_hint = self.session_health(path)
        transport=(self.row_dir()/"stdin_prompt.raw").read_bytes()
        self.permanent(transport.startswith(b"/goal ") and transport.endswith(b"\n") and len(transport)>7,"exact Goal transport framing")
        try: expected["expected_objective"]=transport[6:-1].decode("utf-8")
        except UnicodeDecodeError as exc: raise self.PermanentCanaryError("Goal transport UTF-8") from exc
        original_require=self.omp_session.require; original_load=self.omp_session.load_physical_session; skipped=[]; trailing="OMP standard Goal call is final assistant block"; adapted={"used":False}; shutdown={"used":False}
        def scoped_require(value:bool,message:str)->None:
            if message==trailing: skipped.append(message); return
            original_require(value,message)
        def scoped_load(candidate:Path):
            slot,header,entries,raw=original_load(candidate); exits=[(index,entry) for index,entry in enumerate(entries) if entry.get("type")=="custom" and entry.get("customType")=="session_exit"]
            if exits and exits[0][0]+1<len(entries):
                self.permanent(len(exits)==1 and exits[0][1].get("data",{}).get("kind")=="normal","one normal exit before shutdown artifact"); exit_index,exit_entry=exits[0]; tail=entries[exit_index+1:]; self.permanent(len(tail)==1,"at most one post-exit shutdown artifact"); artifact=tail[0]; message=artifact.get("message")
                zero_usage={"input":0,"output":0,"cacheRead":0,"cacheWrite":0,"totalTokens":0,"cost":{"input":0,"output":0,"cacheRead":0,"cacheWrite":0,"total":0}}
                self.permanent(set(artifact)=={"type","id","parentId","timestamp","message"} and artifact.get("type")=="message" and artifact.get("parentId")==exit_entry.get("id") and isinstance(artifact.get("id"),str) and artifact["id"] and isinstance(artifact.get("timestamp"),str) and artifact["timestamp"]>exit_entry.get("timestamp","") and isinstance(message,dict) and set(message)=={"role","content","api","provider","model","usage","stopReason","errorMessage","errorId","timestamp"},"exact post-exit artifact envelope")
                self.permanent(message=={"role":"assistant","content":[],"api":self.spec()["catalog_gate"]["expected_assistant_api"],"provider":expected["expected_provider"],"model":expected["expected_model"],"usage":zero_usage,"stopReason":"aborted","errorMessage":"Request was aborted","errorId":134221824,"timestamp":message.get("timestamp")} and type(message["timestamp"]) is int,"exact empty aborted shutdown assistant")
                raw_lines=[]
                for line in raw.splitlines(keepends=True):
                    try: value=json.loads(line)
                    except (json.JSONDecodeError,UnicodeDecodeError): continue
                    if value==artifact: raw_lines.append(line)
                self.permanent(len(raw_lines)==1 and raw_lines[0].endswith(b"\n"),"exact raw shutdown artifact custody"); encoded=raw_lines[0]; shutdown.update({"used":True,"entry_id":artifact["id"],"parent_exit_id":exit_entry["id"],"entry_timestamp":artifact["timestamp"],"message_timestamp":message["timestamp"],"raw_jsonl_bytes":len(encoded),"raw_jsonl_sha256":self.P.sha256_bytes(encoded),"content_block_count":0,"tool_call_count":0,"semantic_candidate_count":0,"stopReason":"aborted","errorMessage":"Request was aborted","errorId":134221824}); entries=entries[:exit_index+1]
            assistants=[(index,entry) for index,entry in enumerate(entries) if entry.get("type")=="message" and isinstance(entry.get("message"),dict) and entry["message"].get("role")=="assistant"]
            if len(assistants)!=1: return slot,header,entries,raw
            call_index,call_entry=assistants[0]; content=call_entry["message"].get("content"); calls=[block for block in content if isinstance(block,dict) and block.get("type")=="toolCall"] if isinstance(content,list) else []
            if len(calls)!=1 or calls[0].get("name")!="goal" or calls[0].get("arguments")!={"op":"complete"}: return slot,header,entries,raw
            call_id=calls[0].get("id"); results=[(index,entry) for index,entry in enumerate(entries) if entry.get("type")=="message" and entry.get("message",{}).get("role")=="toolResult" and entry["message"].get("toolCallId")==call_id]
            self.permanent(len(results)==1,"one-turn exact Goal result"); result_index,result_entry=results[0]; tail=entries[result_index+1:]; none=[entry for entry in tail if entry.get("type")=="mode_change" and entry.get("mode")=="none"]; completed=[entry for entry in tail if entry.get("type")=="custom" and entry.get("customType")=="goal-completed"]; exits=[entry for entry in tail if entry.get("type")=="custom" and entry.get("customType")=="session_exit"]
            if expected.get("require_exit") is True:
                full_tail=len(none)==len(completed)==len(exits)==1 and tail==[none[0],completed[0],exits[0]]; exit_only=len(none)==len(completed)==0 and len(exits)==1 and tail==[exits[0]] and exits[0].get("data",{}).get("kind")=="normal"; self.permanent(full_tail or exit_only,"one-turn exact completed normal tail")
            else:
                self.permanent(tail==[] or (len(none)==len(completed)==1 and not exits and tail==[none[0],completed[0]]),"one-turn stable pre-exit tail")
            pre_text="".join(block["text"] for block in content[:content.index(calls[0])] if isinstance(block,dict) and block.get("type")=="text" and isinstance(block.get("text"),str)); self.permanent(pre_text and "PM_RESULT" in pre_text,"one-turn pre-completion result payload")
            fake_id="pm-r10-dev-one-turn-final"; fake={"type":"message","id":fake_id,"parentId":result_entry.get("id"),"timestamp":result_entry.get("timestamp"),"message":{"role":"assistant","content":[{"type":"text","text":pre_text}],"api":call_entry["message"].get("api"),"provider":call_entry["message"].get("provider"),"model":call_entry["message"].get("model"),"retryRecovery":None,"stopReason":"stop","timestamp":result_entry["message"].get("timestamp")}}
            if tail and not (len(tail)==1 and tail[0].get("type")=="custom" and tail[0].get("customType")=="session_exit"): synthetic=entries[:result_index+1]+[fake]+tail
            else:
                complete=next(entry["data"]["goal"] for entry in entries if entry.get("type")=="mode_change" and entry.get("mode")=="goal" and entry.get("data",{}).get("goal",{}).get("status")=="complete")
                prefix=entries[:result_index+1]; none_entry={"type":"mode_change","id":"pm-r10-dev-one-turn-none","parentId":fake_id,"timestamp":result_entry.get("timestamp"),"mode":"none","data":{"goal":None}}; completed_entry={"type":"custom","id":"pm-r10-dev-one-turn-completed","parentId":"pm-r10-dev-one-turn-none","timestamp":result_entry.get("timestamp"),"customType":"goal-completed","data":{"objective":complete["objective"],"tokensUsed":complete["tokensUsed"],"timeUsedSeconds":complete["timeUsedSeconds"]}}; suffix=copy.deepcopy(tail) if tail else []
                if suffix: suffix[0]["parentId"]=completed_entry["id"]
                synthetic=prefix+[fake,none_entry,completed_entry]+suffix
            adapted.update({"used":True,"actual_entry_count":len(entries),"actual_assistant_count":1,"payload":pre_text,"actual_leaf_id":entries[-1]["id"]}); return slot,header,synthetic,raw
        try:
            self.omp_session.require=scoped_require
            self.omp_session.load_physical_session=scoped_load
            structural = self.ORIGINAL_SESSION(path, **expected)
        except self.omp_session.OmpSessionError as exc:
            if terminal_hint:
                raise self.PermanentCanaryError(f"terminal structural failure: {exc}") from exc
            raise
        finally: self.omp_session.require=original_require; self.omp_session.load_physical_session=original_load
        self.permanent(skipped==[trailing],"exactly one benign post-call assistant-text location check disabled")
        if adapted["used"]:
            structural.update({"assistant_lifecycle_shape":"standard_single_turn_goal_complete","assistant_message_count":1,"final_text":adapted["payload"],"final_text_sha256":self.P.sha256_bytes(adapted["payload"].encode()),"logical_entry_count":1+adapted["actual_entry_count"],"leaf_id":adapted["actual_leaf_id"],"native_continuation_count":0,"one_turn_final_payload_before_goal_complete":True}); structural["entry_ids"]["final_assistant"]=structural["entry_ids"]["goal_call_assistant"]
        if shutdown["used"]: structural["post_exit_shutdown_artifact"]={key:value for key,value in shutdown.items() if key!="used"}
        structural.update(self.assistant_api(path, structural))
        if expected.get("require_exit") is True and self.row()["model"]=="opencode-go/glm-5.3-flash":
            cwd=Path(self.row()["cwd"]); private=Path(self.row()["private_capture_dir"]); count=structural["assistant_message_count"]; aborted=1 if structural.get("post_exit_shutdown_artifact") else 0; self.permanent((count,aborted)==(1,1),"one completed response pair and one shutdown request")
            _slot,_header,physical,_raw=original_load(path); shutdown_id=structural.get("post_exit_shutdown_artifact",{}).get("entry_id"); assistant_entries=[entry for entry in physical if entry.get("id")!=shutdown_id and entry.get("type")=="message" and isinstance(entry.get("message"),dict) and entry["message"].get("role")=="assistant"]; self.permanent(len(assistant_entries)==1,"sole non-shutdown assistant for HTTP join"); assistant_entry=assistant_entries[0]; assistant=assistant_entry["message"]; calls=[block for block in assistant.get("content",[]) if isinstance(block,dict) and block.get("type")=="toolCall"]; self.permanent(len(calls)==1 and calls[0].get("name")=="goal" and calls[0].get("arguments")=={"op":"complete"},"sole session Goal call for HTTP join"); call=calls[0]
            receipt_path=self.row_dir()/"request_response_projection.json"; expected_names={"rr-session-1.json","rr-session-1.res.log","rr-session-2.json"}; private_exists=os.path.lexists(private); cwd_entries=sorted(cwd.iterdir()); raw_available=private_exists or bool(cwd_entries)
            if raw_available:
                source=private if private_exists else cwd; entries=sorted(source.iterdir())
                if private_exists: self.permanent(private.is_dir() and not private.is_symlink() and (private.stat().st_mode&0o777)==0o700 and not cwd_entries,"immutable private GLM replay root")
                self.permanent({item.name for item in entries}==expected_names and all(item.is_file() and not item.is_symlink() and item.stat().st_size>0 for item in entries),"complete nonempty GLM request/response roster")
                request_records=[]; requests=[]
                for index in (1,2):
                    request=source/f"rr-session-{index}.json"; value=self.P.load_json(request); body=value.get("body"); tools=body.get("tools") if isinstance(body,dict) else None
                    self.permanent(value.get("method")=="POST" and isinstance(value.get("url"),str) and isinstance(body,dict) and body.get("model")=="glm-5.3-flash" and body.get("reasoning_effort")=="max","literal GLM/max request effort"); self.permanent(isinstance(tools,list) and len(tools)==1 and tools[0].get("type")=="function" and tools[0].get("function",{}).get("name")=="goal","sole native Goal request tool")
                    request_records.append({"raw_request_bytes":request.stat().st_size,"raw_request_sha256":self.P.sha256_file(request),"method":"POST","model":"glm-5.3-flash","reasoning_effort":"max","tool_names":["goal"]}); requests.append({"ordinal":index,"request_bytes":request.stat().st_size,"request_sha256":self.P.sha256_file(request),"model":"glm-5.3-flash","reasoning_effort":"max","tool_names":["goal"],"post_exit_aborted":index>count})
                response=self._verify_response_log(source/"rr-session-1.res.log",self.P.load_json(source/"rr-session-1.json"),assistant,call); receipt={"schema_id":"pm.r10.storage_pipeline.glm_request_response_projection.v1","binding":self.request_response_binding(),"completed_pair_count":1,"post_exit_aborted_request_count":1,"pairs":[{"ordinal":1,"assistant_entry_id":assistant_entry.get("id"),"request":request_records[0],"response":response}],"aborted_requests":[{"ordinal":2,"raw_request_bytes":request_records[1]["raw_request_bytes"],"raw_request_sha256":request_records[1]["raw_request_sha256"],"post_exit_aborted":True}]}; self._verify_durable_request_response(receipt,structural,assistant,call)
                if receipt_path.exists(): self.permanent(self.P.load_json(receipt_path)==receipt,"immutable durable request/response projection")
                else: self.write_once(receipt_path,receipt)
                if not private_exists:
                    private.mkdir(mode=0o700)
                    for item in entries: os.replace(item,private/item.name); os.chmod(private/item.name,0o600)
                self.permanent(all((item.stat().st_mode&0o777)==0o600 and item.stat().st_nlink==1 for item in private.iterdir()),"private GLM capture file custody")
            else:
                self.permanent(receipt_path.is_file() and not receipt_path.is_symlink(),"durable request/response projection required after private cleanup"); receipt=self.P.load_json(receipt_path); self._verify_durable_request_response(receipt,structural,assistant,call); requests=[]
                for pair in receipt["pairs"]: requests.append({"ordinal":pair["ordinal"],"request_bytes":pair["request"]["raw_request_bytes"],"request_sha256":pair["request"]["raw_request_sha256"],"model":"glm-5.3-flash","reasoning_effort":"max","tool_names":["goal"],"post_exit_aborted":False})
                for item in receipt["aborted_requests"]: requests.append({"ordinal":item["ordinal"],"request_bytes":item["raw_request_bytes"],"request_sha256":item["raw_request_sha256"],"model":"glm-5.3-flash","reasoning_effort":"max","tool_names":["goal"],"post_exit_aborted":True})
            structural.update({"persisted_thinking_literal":"max","request_effort_receipt":{"schema_id":"pm.r10.storage_pipeline.dev_glm_request_effort.v1","completed_pair_count":count,"post_exit_aborted_request_count":aborted,"requests":requests,"raw_private_root":str(private),"raw_copied_to_evidence":False},"request_response_projection":{"path":"request_response_projection.json","bytes":receipt_path.stat().st_size,"sha256":self.P.sha256_file(receipt_path),"binding_sha256":receipt["binding"]["sha256"]}})
        self.permanent(self.NORMALIZE is not None, "local normalizer unavailable")
        normalized = self.NORMALIZE(path, structural, oracle_path=self.V7 / "oracle.json", schema_path=self.V7 / "response.schema.json", max_text_block_utf8_bytes=self.P.load_json(self.V7 / "matrix.json")["max_final_assistant_utf8_bytes"])
        if expected.get("require_exit") is True:
            for target, value in ((self.row_dir() / "structural_projection.json", structural), (self.row_dir() / "normalized_projection.json", normalized)):
                if target.exists():
                    self.permanent(self.P.load_json(target) == value, f"immutable {target.name}")
                else:
                    self.write_once(target, value)
        return normalized

    def current_runtime_preflight(self) -> dict[str, Any]:
        runtime = self.spec()["runtime"]
        binary, profile = Path(runtime["binary"]), Path(runtime["source_profile_dir"])
        self.require(binary.is_file() and not binary.is_symlink() and stat.S_ISREG(binary.lstat().st_mode), "current OMP binary absent or unsafe")
        self.require(binary.stat().st_size == runtime["binary_bytes"] and self.P.sha256_file(binary) == runtime["binary_sha256"] and oct(binary.stat().st_mode & 0o777) == runtime["binary_mode"], "current OMP binary identity")
        self.require(profile.is_dir() and not profile.is_symlink(), "approved profile absent or unsafe")
        environment = dict(os.environ)
        environment["PI_CODING_AGENT_DIR"] = str(profile)
        environment["OMP_PROFILE"] = environment["PI_PROFILE"] = "default"
        version = self.ORIGINAL_RUN([str(binary), "--version"], check=False, capture_output=True, text=True, env=environment, timeout=30)
        expected_version = runtime.get("version", runtime.get("omp_version"))
        self.require(version.returncode == 0 and version.stdout.strip() == expected_version, "current OMP version")
        observed, commands = {}, []
        for key, expected in runtime["effective_config"].items():
            process = self.ORIGINAL_RUN([str(binary), "config", "get", key], check=False, capture_output=True, text=True, env=environment, timeout=30)
            raw = process.stdout.strip()
            self.require(process.returncode == 0, f"current OMP config command: {key}")
            value = self.P.strict_loads(raw) if raw in {"true", "false"} or raw.startswith(("{", "[", '"')) else raw
            self.require(value == expected, f"current OMP config drift: {key}")
            observed[key] = value
            commands.append({"key": key, "exit_code": process.returncode, "stdout": raw})
        return {"status": "PASS_OMP_RUNTIME_18_0_7", "binary": str(binary), "binary_bytes": binary.stat().st_size, "binary_sha256": self.P.sha256_file(binary), "binary_mode": oct(binary.stat().st_mode & 0o777), "version": version.stdout.strip(), "profiles": {"OMP_PROFILE": "default", "PI_PROFILE": "default"}, "effective_config": observed, "commands": commands, "subject_calls": 0}

    def row_claimed(self, row: dict[str, Any]) -> bool:
        directory = self.row_dir(row)
        return all(path.is_dir() and not path.is_symlink() for path in (self.EVIDENCE, directory.parent, directory))

    def claim_after_failure(self, row: dict[str, Any], before: tuple[bool, bool, bool] | None) -> bool:
        directory = self.row_dir(row)
        paths = (self.EVIDENCE, directory.parent, directory)
        if self.row_claimed(row):
            return True
        if before is None or not any(os.path.lexists(path) and not old for path, old in zip(paths, before, strict=True)):
            return False
        for path in paths:
            if not os.path.lexists(path):
                path.mkdir()
            self.require(path.is_dir() and not path.is_symlink(), "safe claim")
        return self.row_claimed(row)

    def exact_reservation(self, row: dict[str, Any]) -> bool:
        path = self.row_dir(row) / "reservation.json"
        if not self.row_claimed(row) or not path.is_file() or path.is_symlink():
            return False
        try:
            value = self.P.load_json(path)
        except Exception:
            return False
        return value.get("schema_id") == "pm.r10.storage_pipeline.reservation.v2" and all(value.get(key) == row[key] for key in IDENTITY)

    def preserve_failure(self, row: dict[str, Any]) -> None:
        target = self.row_dir(row) / "postfailure_session.raw.jsonl"
        session_dir = Path(row["session_dir"])
        live = self.base.session_file(session_dir) if session_dir.is_dir() else None
        if live is not None and not os.path.lexists(target):
            self.P.atomic_write(target, live.read_bytes())

    def prior_rows(self) -> Iterator[tuple[Path, dict[str, Any]]]:
        queue = [self.spec()["historic_identity_root"]]
        seen: set[str] = set()
        while queue:
            record = queue.pop(0)
            path = self.REPO / record["path"]
            self.require(not self._live_plan_path(path), "historical manifest must not be live Plans")
            self.require(record["path"] not in seen and self.file_record(path) == record, f"historic manifest drift: {record['path']}")
            seen.add(record["path"])
            manifest = self.P.load_json(path)
            for row in manifest.get("rows", []):
                yield path.parent, row
            nested = manifest.get("historic_identity_root")
            if isinstance(nested, dict):
                queue.append(nested)
            queue.extend(item for item in manifest.get("historic_identity_manifests", []) if isinstance(item, dict))


__all__ = [
    "ControllerError", "PermanentCanaryError", "NormalizationError", "LocalRuntime", "PipelineProxy",
    "RuntimeRoot", "ENV_PATHS", "PINNED_SNAPSHOT", "PROMPT_READY", "MCP_SENTINEL", "VISIBLE_SELECTION",
    "typed_equal", "validate_schema", "normalize_verified_session", "P", "V", "base", "omp_session", "freeze_check",
]
