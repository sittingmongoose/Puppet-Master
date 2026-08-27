#!/usr/bin/env python3
"""Fail-closed preflight for the once-only V14 native-Goal Matrix 001 launch."""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import sqlite3
import stat
import subprocess
import sys
from typing import Any


BASE = Path(__file__).resolve().parent
WORKSPACE = BASE.parents[3]
MATRIX_ID = "goal-mode-v14-structural-context-matrix-001"
OUTPUT = BASE / "goal_mode_v14_structural_context_matrix_001_evidence"
MATRIX_002_OUTPUT = BASE / "goal_mode_v14_structural_context_matrix_002_evidence"
CONTROLLER = BASE / "r9_goal_mode_v14_structural_context_matrix_controller_v1.py"
ADMISSION = BASE / "r9_goal_mode_v14_structural_context_matrix_001_admission_v1.json"
SOURCES = (
    ("r9_goal_mode_v14_structural_context_matrix_controller_v1.py", CONTROLLER, 17713, "e1831e003217d138b6a83a24e3d57687a18a48e17852986f8186e33686945b13"),
    ("r9_goal_mode_v14_structural_context_matrix_001_admission_v1.json", ADMISSION, 3190, "c2910f59e342a4a766e75b95343f21db0a28245d6b5e2d3444675ab13073006e"),
    ("r9_goal_mode_v14_structural_context_matrix_controller_v1_independent_static_review_v1.json", BASE / "r9_goal_mode_v14_structural_context_matrix_controller_v1_independent_static_review_v1.json", 3234, "f6124a7147777531082f565bae5010a52ec29c0fd30c57990aebe7d89e426cb1"),
    ("r9_goal_mode_v14_structural_context_matrix_pair_independent_review_v1.json", BASE / "r9_goal_mode_v14_structural_context_matrix_pair_independent_review_v1.json", 2826, "6854a015b265a56b5f9e97a513b25f02e42bbf6aef6bff0f938054d2cd60ab8b"),
    ("goal_mode_v14_structural_context_matrix_pair_001_002_inputs_v1/manifest.json", BASE / "goal_mode_v14_structural_context_matrix_pair_001_002_inputs_v1" / "manifest.json", 522058, "5b2901787502545e94fef87b358416989c9ee41390f4bf11789604ec66eb4cc0"),
    ("goal_mode_empirical_harness_v14/goal_mode_harness.py", BASE / "goal_mode_empirical_harness_v14" / "goal_mode_harness.py", 10096, "c0f147659ea0dc34bd2c8daf69fca6e51fba2396558312cad71b0bd51dbca3d4"),
    ("r9_goal_mode_v14_structural_context_matrix_independent_runtime_verify_v1.py", BASE / "r9_goal_mode_v14_structural_context_matrix_independent_runtime_verify_v1.py", 26679, "6a738a2dd51ad56398bf3a2597d49cb84f5b927437e44113245eebee5f41aee3"),
    ("r9_goal_mode_v14_structural_context_matrix_runtime_verifier_independent_static_review_v1.json", BASE / "r9_goal_mode_v14_structural_context_matrix_runtime_verifier_independent_static_review_v1.json", 2219, "d78d7781893b7446c8e83b34ddc01f4617bbc68f40492b2a96959f08870cbd83"),
    ("r9_goal_mode_v13_structural_context_terminal_closure_canary_001_success_receipt_v1.json", BASE / "r9_goal_mode_v13_structural_context_terminal_closure_canary_001_success_receipt_v1.json", 5322, "d76900fed272d1e2378541228988cde770ca702edab4aefa6e53111354c3f5f3"),
    ("r9_goal_mode_current_work_goal_activation_receipt_v1.json", BASE / "r9_goal_mode_current_work_goal_activation_receipt_v1.json", 1937, "313dd055972624861426515ee9ccba828b2f1401e4070fcabfb51db4f0696042"),
    ("r9_goal_mode_per_test_taker_binding_correction_v2.json", BASE / "r9_goal_mode_per_test_taker_binding_correction_v2.json", 5976, "6c846d9cfe24b3e199f96ed3ea6829d631091284b636c5ac11ee0a7dd12d06f8"),
    ("r9_goal_mode_omp_windows_transport_clarification_v3.json", BASE / "r9_goal_mode_omp_windows_transport_clarification_v3.json", 1440, "a8b5fc0d064dabe923b9ea6072c8a4b7b663d14133c4334b8dcc98e5a1d185e2"),
)
CODEX_BYTES = 251271488
CODEX_SHA256 = "ac2cfed85fb647d61e0150b8548102b330e4799d9d81ad5d354de701edf6b074"
SCHEMA = "pw-r9-goal-mode-v14-structural-context-matrix-001-preflight-v1"


class Invalid(RuntimeError):
    pass


def require(ok: bool, message: str) -> None:
    if not ok:
        raise Invalid(message)


def canon(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8") + b"\n"


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def read_regular(path: Path, limit: int = 512_000_000) -> bytes:
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not path.is_symlink() and 0 <= before.st_size <= limit, f"unsafe file:{path}")
    raw = path.read_bytes()
    after = os.lstat(path)
    require((before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) == (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns), f"changing file:{path}")
    require(len(raw) == before.st_size, f"short read:{path}")
    return raw


def identity(label: str, path: Path, expected_bytes: int, expected_sha256: str) -> dict[str, Any]:
    raw = read_regular(path)
    mode = stat.S_IMODE(os.lstat(path).st_mode)
    require(len(raw) == expected_bytes and sha(raw) == expected_sha256 and mode == 0o644, f"source identity:{label}")
    return {"bytes": len(raw), "mode": "0644", "path": label, "sha256": sha(raw)}


def controller_admission() -> None:
    spec = importlib.util.spec_from_file_location("_r9_v14_matrix_001_preflight_controller", CONTROLLER)
    require(spec is not None and spec.loader is not None, "controller loader")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    manifest = module.load_manifest()
    module.load_admission(ADMISSION, manifest, MATRIX_ID)


def database_counts(codex_home: Path) -> dict[str, int]:
    goal_paths = list(codex_home.glob("goals_*.sqlite"))
    state_paths = list(codex_home.glob("state_*.sqlite"))
    require(len(goal_paths) == 1 and len(state_paths) == 1, "Codex databases")
    pattern = f"%{MATRIX_ID}%"
    with sqlite3.connect(f"file:{goal_paths[0]}?mode=ro", uri=True) as con:
        goal_rows = con.execute("SELECT COUNT(*) FROM thread_goals WHERE objective LIKE ?", (pattern,)).fetchone()[0]
    with sqlite3.connect(f"file:{state_paths[0]}?mode=ro", uri=True) as con:
        thread_rows = con.execute(
            "SELECT COUNT(DISTINCT id) FROM threads WHERE COALESCE(title,'') LIKE ? OR COALESCE(first_user_message,'') LIKE ? OR COALESCE(preview,'') LIKE ? OR COALESCE(name,'') LIKE ?",
            (pattern, pattern, pattern, pattern),
        ).fetchone()[0]
    require(goal_rows == 0 and thread_rows == 0, "consumed Matrix001 identities")
    return {"goal_rows_containing_matrix_id": int(goal_rows), "thread_rows_containing_matrix_id": int(thread_rows)}


def matching_processes() -> list[int]:
    matches: list[int] = []
    controller_token = CONTROLLER.name.encode("utf-8")
    harness_token = b"goal_mode_empirical_harness_v14/goal_mode_harness.py"
    matrix_token = MATRIX_ID.encode("utf-8")
    for proc in Path("/proc").iterdir():
        if not proc.name.isdigit():
            continue
        try:
            cmdline = (proc / "cmdline").read_bytes()
        except (FileNotFoundError, PermissionError, ProcessLookupError):
            continue
        if matrix_token in cmdline and (controller_token in cmdline or harness_token in cmdline):
            matches.append(int(proc.name))
    require(not matches, "matching Matrix001 process")
    return matches


def check(args: argparse.Namespace) -> dict[str, Any]:
    require(args.workspace.resolve() == WORKSPACE.resolve(), "workspace")
    require(args.codex_home.is_absolute() and args.codex_home.is_dir() and not args.codex_home.is_symlink(), "Codex home")
    source_bindings = [identity(label, path, size, digest) for label, path, size, digest in SOURCES]
    codex = read_regular(args.codex)
    require(len(codex) == CODEX_BYTES and sha(codex) == CODEX_SHA256 and stat.S_IMODE(os.lstat(args.codex).st_mode) & 0o111, "Codex binary identity")
    version = subprocess.run([str(args.codex), "--version"], stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=args.workspace, timeout=20, check=False)
    require(version.returncode == 0 and version.stdout.strip() == b"codex-cli 0.148.0" and version.stderr == b"", "Codex version")
    require(not OUTPUT.exists() and not MATRIX_002_OUTPUT.exists(), "matrix evidence root already exists")
    require(not (BASE / "r9_goal_mode_v14_structural_context_matrix_001_success_receipt_v1.json").exists(), "Matrix001 receipt exists")
    controller_admission()
    counts = database_counts(args.codex_home)
    processes = matching_processes()
    return {
        "authority": {"matrix_id": MATRIX_ID, "matrix_launch": True, "max_parallel": 1, "qualification_credit": 0, "retry": False, "row_count": 291},
        "checks": {
            "codex": {"bytes": len(codex), "sha256": sha(codex), "version": "0.148.0"},
            "controller_admission": "PASS_EXACT",
            "existing_runtime_identities": counts,
            "matching_matrix_processes": processes,
            "matrix_001_evidence_absent": True,
            "matrix_002_evidence_absent": True,
            "omp_process_inspection_performed": False,
            "sources": source_bindings,
        },
        "first_mismatch": None,
        "lineage": {"matrix005": "PERMANENT_FAIL", "matrix006": "INVALIDATED", "v13_canary": "PASS_ZERO_CREDIT"},
        "omp_lane": {"duplicate_launch": False, "launch_boundary": "omp --cwd P:\\", "linux_process_inference": False, "status": "UNTOUCHED"},
        "schema_id": SCHEMA,
        "status": "PASS_EXACT_PRELAUNCH_V14_STRUCTURAL_CONTEXT_MATRIX_001_ONCE_ONLY_ZERO_CREDIT",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--codex-home", type=Path, required=True)
    parser.add_argument("--codex", type=Path, required=True)
    parser.add_argument("--workspace", type=Path, required=True)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    try:
        require(args.check and args.codex.is_absolute() and args.workspace.is_absolute(), "CLI")
        result, rc = check(args), 0
    except (Invalid, OSError, UnicodeError, sqlite3.Error, subprocess.SubprocessError, json.JSONDecodeError) as exc:
        result = {"authority": {"matrix_launch": False, "qualification_credit": 0}, "error": str(exc), "first_mismatch": str(exc), "schema_id": SCHEMA, "status": "FAIL_ZERO_CREDIT_NO_MATRIX_LAUNCH"}
        rc = 1
    sys.stdout.buffer.write(canon(result))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
