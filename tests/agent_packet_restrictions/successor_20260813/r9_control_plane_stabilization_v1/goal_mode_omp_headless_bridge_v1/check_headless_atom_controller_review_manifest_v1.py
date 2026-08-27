#!/usr/bin/env python3
"""Independently derive the compact controller-review atom evidence from source."""

from __future__ import annotations

import ast
import hashlib
import json
import os
from pathlib import Path
import re
import stat
import sys
from typing import Any


BASE = Path(__file__).resolve().parent
CONTROLLER = BASE / "headless_atom_controller_v1.py"
MANIFEST = BASE / "headless_atom_controller_independent_review_atom_manifest_v1.json"
CONTROLLER_ID = (41_303, "6113abc67757e48df563d21aad7c93d2377e2bff6bfd125084ac22ae363ca3ee")
MANIFEST_ID = (17_438, "3a315293480ae1e645b1e6f448266a3da376b7632bfe8dc36e14a857832738da")
SCHEMA_ID = "pw-r9-goal-mode-omp-headless-atom-controller-review-manifest-source-check-v1"


class CheckFailure(RuntimeError):
    pass


def require(value: bool, message: str) -> None:
    if not value:
        raise CheckFailure(message)


def digest(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def pairs(items: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in items:
        require(key not in result, f"duplicate JSON key:{key}")
        result[key] = value
    return result


def canon(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8") + b"\n"


def read_regular(path: Path, limit: int) -> bytes:
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not path.is_symlink(), f"unsafe file:{path}")
    require(0 <= before.st_size <= limit, f"file size:{path}")
    raw = path.read_bytes()
    after = os.lstat(path)
    require(
        (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns)
        == (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns),
        f"changing file:{path}",
    )
    require(len(raw) == before.st_size, f"short read:{path}")
    return raw


def load_json(path: Path, expected: tuple[int, str]) -> tuple[dict[str, Any], bytes]:
    raw = read_regular(path, 2_000_000)
    require((len(raw), digest(raw)) == expected, f"identity:{path.name}")
    require(raw.endswith(b"\n") and raw[:-1].count(b"\n") == 0 and b"\r" not in raw, f"framing:{path.name}")
    value = json.loads(raw, object_pairs_hook=pairs, parse_constant=lambda token: (_ for _ in ()).throw(CheckFailure(f"nonfinite:{token}")))
    require(isinstance(value, dict) and raw == canon(value), f"canonical:{path.name}")
    return value, raw


def definitions(tree: ast.AST) -> dict[str, ast.AST]:
    result: dict[str, ast.AST] = {}
    for node in ast.iter_child_nodes(tree):
        if isinstance(node, (ast.FunctionDef, ast.ClassDef)):
            result[node.name] = node
    return result


def constants(tree: ast.Module) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for node in tree.body:
        if isinstance(node, ast.Assign) and len(node.targets) == 1 and isinstance(node.targets[0], ast.Name):
            try:
                result[node.targets[0].id] = ast.literal_eval(node.value)
            except (ValueError, TypeError):
                pass
    return result


def segment(source: str, node: ast.AST) -> str:
    value = ast.get_source_segment(source, node)
    require(isinstance(value, str), "source segment")
    return value


def request_sequence(run_node: ast.AST, resolved: dict[str, Any]) -> list[str]:
    values: list[tuple[int, str]] = []
    for node in ast.walk(run_node):
        if not (isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == "request" and node.args):
            continue
        arg = node.args[0]
        if isinstance(arg, ast.Constant) and isinstance(arg.value, str):
            value = arg.value
        elif isinstance(arg, ast.Name) and isinstance(resolved.get(arg.id), str):
            value = resolved[arg.id]
        else:
            raise CheckFailure("dynamic RPC method")
        values.append((node.lineno, value))
    return [value for _, value in sorted(values)]


def derived_evidence(source: str, tree: ast.Module) -> list[str]:
    defs = definitions(tree)
    const = constants(tree)
    run = defs["run_atom"]
    run_source = segment(source, run)
    load_source = segment(source, defs["load_admission"])
    quiescence_source = segment(source, defs["validate_quiescence"])
    reader_source = segment(source, defs["DurableLineReader"])
    peer_source = segment(source, defs["RpcPeer"])
    terminal_source = segment(source, defs["validate_terminal"])
    atom_source = segment(source, defs["find_atom"])

    require(const["EXECUTABLE_BYTES"] == 157_500_928, "executable byte pin")
    require(const["EXECUTABLE_SHA256"] == "124c3b65b09c3bf34d5a0864b5815997360e7cc4f0f639aabd2189118ed01f93", "executable hash pin")
    require("reviewed reproducible executable pin" in load_source, "executable pin enforcement")

    sequence = request_sequence(run, const)
    expected_sequence = [
        "initialize",
        "session/new",
        "session/set_config_option",
        "session/set_config_option",
        const["ACTIVATE_METHOD"],
        "session/prompt",
        const["SETTLE_METHOD"],
        "session/close",
    ]
    require(sequence == expected_sequence, "RPC lifecycle order")
    require("activeTools" in segment(source, defs["validate_activation"]) and '["goal"]' in segment(source, defs["validate_activation"]), "Goal-only activation")

    popen = [node for node in ast.walk(tree) if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == "Popen"]
    require(len(popen) == 1, "process launch site")
    require(sequence.count("session/new") == 1 and sequence.count("session/prompt") == 1, "session/prompt cardinality")
    require(all(token not in sequence for token in ("session/load", "session/resume", "session/fork")), "reuse methods")

    require(const["QUIESCENCE_MAX_AGE_NS"] == 300_000_000_000, "quiescence age")
    require('{"lock_held": False, "original_pid": 14520, "pid_live": False}' in quiescence_source, "quiescence state")
    require("before = windows_omp_snapshot()" in run_source and 'before["processes"] == []' in run_source, "prelaunch process census")

    require(reader_source.index("append_durable(self.capture_fd, raw)") < reader_source.index("self.items.put(raw)"), "incoming durability order")
    require(peer_source.index("append_durable(self.outgoing_fd, raw)") < peer_source.index("self.stdin.write(raw)"), "outgoing durability order")
    require("ACP trailing output after session close" in peer_source, "trailing output rejection")

    require('response["goal"].get("status") == "complete"' in terminal_source, "Goal complete status")
    require('response["modeChange"].get("mode") == "none"' in terminal_source, "mode none")
    require('response["goalCompletedRecord"].get("type") == "goal-completed"' in terminal_source, "goal-completed record")
    require('process.returncode == 0' in run_source and "peer.require_clean_eof()" in run_source, "rc0 and EOF")

    authority = const["EXPECTED_AUTHORITY"]
    require(authority == {"canary_launch": False, "matrix_launch": False, "qualification": False, "release": False, "retry": False, "run_atom": True}, "zero authority")
    require("FAIL_CONSUMED_ZERO_CREDIT_NO_RETRY" in run_source, "consumed failure")

    require('atom.get("atom_count") == 1' in atom_source, "atom count")
    for limit in (256, 512, 128):
        require(str(limit) in atom_source, f"atom limit:{limit}")

    require(const["OWNER_TASK"] == "019fbb7d-29ac-7e82-93b3-fff057d7a561", "owner task")
    require(const["OWNER_HOST"] == "remote-ssh-discovered:pm-dev", "owner host")
    require('[str(paths["executable_path"]), "--cwd", "P:\\\\", "acp"]' in run_source, "headless argv")
    require("existing OMP process blocks launch" in run_source, "duplicate process rejection")

    values = [
        {"bytes": 157500928, "pin_enforced": True, "sha256": const["EXECUTABLE_SHA256"]},
        {"active_tools": ["goal"], "order": ["session/new", "route", "activate", "prompt", "settle", "session/close"]},
        {"forbidden": ["load", "resume", "fork"], "goal_count": 1, "process_count": 1, "prompt_count": 1, "session_count": 1},
        {"lock_held": False, "max_age_seconds": 300, "pid_live": False, "prelaunch_omp_processes": 0},
        {"incoming": "fsync-before-parse", "outgoing": "fsync-before-pipe", "trailing_output": "reject"},
        {"eof": "exact", "goal_status": "complete", "mode": "none", "process_rc": 0, "record": "goal-completed"},
        {"canary": False, "credit": 0, "failure": "consumed", "matrix": False, "relaunch": 0, "retry": 0},
        {"atom_count": 1, "criterion_max": 256, "objective_max": 256, "output_contract_max": 128, "subject_max": 512},
        {"argv": ["omp", "--cwd", "P:\\", "acp"], "duplicate_processes": 0, "host": const["OWNER_HOST"], "owner_task": const["OWNER_TASK"]},
    ]
    return [json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")) for value in values]


def check_manifest(manifest: dict[str, Any], evidence: list[str]) -> int:
    require(manifest["status"] == "PREDECLARED_NINE_BITE_SIZE_GOAL_REVIEW_ATOMS_NOT_EXECUTED_ZERO_CREDIT_NO_LAUNCH", "manifest status")
    require(manifest["authority"] == {"canary_launch": False, "independent_review_launch": False, "matrix_launch": False, "omp_process_launch": False, "qualification_credit": 0, "release": False, "review_atom_launch": False}, "manifest authority")
    atoms = manifest["atoms"]
    require(isinstance(atoms, list) and len(atoms) == len(evidence) == 9, "atom count")
    for index, (atom, expected_evidence) in enumerate(zip(atoms, evidence, strict=True)):
        require(atom["atom_index"] == index and atom["operation_count"] == 1 and atom["dependency_atom_ids"] == [], f"atom shape:{index}")
        require(atom["evidence_slice_utf8"] == expected_evidence, f"source-derived evidence:{index}")
        for key, limit in (
            ("acceptance_criterion_utf8", 256),
            ("evidence_slice_utf8", 256),
            ("goal_objective_utf8", 256),
            ("output_contract_utf8", 128),
            ("prompt_utf8", 512),
        ):
            raw = atom[key].encode("utf-8")
            require(1 <= len(raw) <= limit, f"atom limit:{index}:{key}")
            require(atom[key + "_bytes"] == len(raw) and atom[key + "_sha256"] == digest(raw), f"atom identity:{index}:{key}")
        require("Then mark the active Goal complete." in atom["prompt_utf8"], f"Goal terminal instruction:{index}")
    for ref in manifest["bindings"]:
        path = BASE / ref["path"]
        raw = read_regular(path, 512_000_000)
        require(len(raw) == ref["bytes"] and digest(raw) == ref["sha256"], f"binding identity:{ref['path']}")
        require(f"{stat.S_IMODE(os.stat(path).st_mode):04o}" == ref["mode"], f"binding mode:{ref['path']}")
    return len(atoms)


def run() -> dict[str, Any]:
    controller_raw = read_regular(CONTROLLER, 2_000_000)
    require((len(controller_raw), digest(controller_raw)) == CONTROLLER_ID, "controller identity")
    manifest, _ = load_json(MANIFEST, MANIFEST_ID)
    source = controller_raw.decode("utf-8")
    tree = ast.parse(source)
    evidence = derived_evidence(source, tree)
    atom_count = check_manifest(manifest, evidence)
    return {
        "authority": {"canary_launch": False, "independent_review_launch": False, "matrix_launch": False, "omp_process_launch": False, "qualification_credit": 0},
        "atom_count": atom_count,
        "controller": {"bytes": CONTROLLER_ID[0], "sha256": CONTROLLER_ID[1]},
        "first_mismatch": None,
        "manifest": {"bytes": MANIFEST_ID[0], "sha256": MANIFEST_ID[1]},
        "schema_id": SCHEMA_ID,
        "source_derived_evidence_count": len(evidence),
        "status": "PASS_SOURCE_DERIVED_REVIEW_MANIFEST_ZERO_CREDIT_NO_LAUNCH",
        "workspace_writes": 0,
    }


def main() -> int:
    try:
        result, rc = run(), 0
    except BaseException as exc:
        result = {
            "authority": {"canary_launch": False, "independent_review_launch": False, "matrix_launch": False, "omp_process_launch": False, "qualification_credit": 0},
            "error": str(exc),
            "error_type": type(exc).__name__,
            "schema_id": SCHEMA_ID,
            "status": "FAIL_SOURCE_DERIVED_REVIEW_MANIFEST_ZERO_CREDIT_NO_LAUNCH",
            "workspace_writes": 0,
        }
        rc = 1
    sys.stdout.buffer.write(canon(result))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
