#!/usr/bin/env python3
"""Independent structural-context and prefix check for Goal harness V13."""

from __future__ import annotations

import argparse
import ast
import copy
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import stat
import subprocess
import sys
from typing import Any, Callable


SCHEMA = "pw-r9-goal-mode-harness-v13-independent-static-check-v1"
EXPECTED = {
    "goal_mode_contract.json": (2760, "86659e586ad19a586c47d129ccafd36e4d5bdd9c62d6ff246ed8e1d04adad5c1"),
    "goal_mode_harness.py": (11464, "c1d9207f65c17869aeb6ef5edf63706b9ab134ae6ab0d08a6c712509da7b1faf"),
    "goal_mode_terminal_closure_attestor.py": (7121, "39e3ad541ae7522bd704418185811b0a511e9ea9b9cd72e3636a420dcaa14056"),
}
ROLLOUT = Path("/home/sittingmongoose/.codex/sessions/2026/08/22/rollout-2026-08-22T10-19-37-01a028fb-ad2a-7112-9af2-0421a65722a6.jsonl")
ROLLOUT_BYTES = 135131
ROLLOUT_SHA256 = "2401fd509d5d80d38552c8e3ca1ec4075fa4dc8c7aa2cc5800b799985eed8034"


class Invalid(RuntimeError):
    pass


def require(ok: bool, message: str) -> None:
    if not ok:
        raise Invalid(message)


def pairs(items: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in items:
        require(key not in result, f"duplicate JSON key:{key}")
        result[key] = value
    return result


def canon(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode() + b"\n"


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def read_regular(path: Path, limit: int = 256_000_000) -> bytes:
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not path.is_symlink() and before.st_size <= limit, f"unsafe file:{path}")
    raw = path.read_bytes()
    after = os.lstat(path)
    require(
        (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns)
        == (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns)
        and len(raw) == before.st_size,
        f"changing file:{path}",
    )
    return raw


def load_module(path: Path) -> Any:
    sys.path.insert(0, str(path.parent))
    spec = importlib.util.spec_from_file_location("_r9_goal_mode_v13_attestor_check_target", path)
    require(spec is not None and spec.loader is not None, "attestor loader")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def source_checks(root: Path) -> dict[str, Any]:
    identities: list[dict[str, Any]] = []
    for name, (size, digest) in EXPECTED.items():
        path = root / name
        raw = read_regular(path)
        require(len(raw) == size and sha(raw) == digest, f"identity:{name}")
        require(stat.S_IMODE(os.lstat(path).st_mode) == 0o644, f"mode:{name}")
        if name.endswith(".py"):
            ast.parse(raw.decode("utf-8"), filename=name)
        identities.append({"bytes": len(raw), "mode": "0644", "path": f"goal_mode_empirical_harness_v13/{name}", "sha256": sha(raw)})
    attestor_text = (root / "goal_mode_terminal_closure_attestor.py").read_text(encoding="utf-8")
    require("Only use status `blocked`" not in attestor_text, "stale prose literal retained")
    for marker in (
        "CONTEXT_SECTIONS = (",
        'text.startswith(\'<codex_internal_context source="goal">',
        "text.count(objective_block) == 1",
        "section_offsets == sorted(section_offsets)",
        "not prior_reasoning and not prior_actions",
    ):
        require(marker in attestor_text, f"attestor source marker:{marker}")
    return {"ast": "PASS", "identities": identities, "stale_sentence_authority_absent": True}


def context_fixture(base: Path, ga: Any) -> dict[str, Any]:
    raw = read_regular(ROLLOUT)
    require(len(raw) == ROLLOUT_BYTES and sha(raw) == ROLLOUT_SHA256, "V12 rollout identity")
    records, reopened = ga.base._rollout_records(ROLLOUT)
    require(reopened == raw, "rollout reopen")
    capture = base / "goal_mode_v12_prefix_aware_terminal_closure_canary_001_evidence" / "rows" / "row-000"
    closure_prompt = read_regular(capture / "closure_prompt.txt", 2_000_000).decode("utf-8")
    row = ga.load_json(base / "goal_mode_v12_prefix_aware_terminal_closure_canary_001_inputs" / "row-000.row.json", 2_000_000)
    prompt_lines = ga.base._message_lines(records, "user", closure_prompt)
    require(len(prompt_lines) == 1, "fixture closure prompt")
    prompt_line = prompt_lines[0]
    turns = ga.base._line_turns(records)
    turn_id = turns.get(prompt_line)
    require(isinstance(turn_id, str), "fixture closure turn")
    passed = ga._native_goal_context(records, prompt_line, turn_id, row["objective"])
    require(
        passed.get("contract") == ga.CONTEXT_CONTRACT
        and passed.get("objective_bound") is True
        and [item["heading"] for item in passed.get("section_offsets", [])] == list(ga.CONTEXT_SECTIONS),
        "fixture pass projection",
    )
    context_line = passed["line"]

    def context_entry(items: list[dict[str, Any]]) -> dict[str, Any]:
        matches = [entry for entry in items if entry["line"] == context_line]
        require(len(matches) == 1, "fixture context entry")
        return matches[0]

    def context_text(entry: dict[str, Any]) -> str:
        return entry["record"]["payload"]["content"][0]["text"]

    def set_context_text(entry: dict[str, Any], text: str) -> None:
        entry["record"]["payload"]["content"][0]["text"] = text

    objective_block = f"<objective>\n{row['objective']}\n</objective>"
    mutations: dict[str, Callable[[list[dict[str, Any]]], None]] = {
        "wrong_source": lambda items: set_context_text(context_entry(items), context_text(context_entry(items)).replace('source="goal"', 'source="other"', 1)),
        "missing_objective": lambda items: set_context_text(context_entry(items), context_text(context_entry(items)).replace(objective_block, "", 1)),
        "duplicate_objective": lambda items: set_context_text(context_entry(items), context_text(context_entry(items)).replace(objective_block, objective_block + "\n" + objective_block, 1)),
        "missing_continuation": lambda items: set_context_text(context_entry(items), context_text(context_entry(items)).replace("\n\nContinuation behavior:\n", "\n\n", 1)),
        "missing_completion_audit": lambda items: set_context_text(context_entry(items), context_text(context_entry(items)).replace("\n\nCompletion audit:\n", "\n\n", 1)),
        "missing_blocked_audit": lambda items: set_context_text(context_entry(items), context_text(context_entry(items)).replace("\n\nBlocked audit:\n", "\n\n", 1)),
    }

    def reorder(items: list[dict[str, Any]]) -> None:
        entry = context_entry(items)
        text = context_text(entry)
        text = text.replace("\n\nContinuation behavior:\n", "\n\n__TEMP_SECTION__:\n", 1)
        text = text.replace("\n\nBlocked audit:\n", "\n\nContinuation behavior:\n", 1)
        text = text.replace("\n\n__TEMP_SECTION__:\n", "\n\nBlocked audit:\n", 1)
        set_context_text(entry, text)

    mutations["section_reorder"] = reorder

    def insert_prior(items: list[dict[str, Any]], payload_type: str) -> None:
        index = next(i for i, entry in enumerate(items) if entry["line"] == prompt_line)
        items.insert(index, {"line": prompt_line - 0.5, "record": {"payload": {"type": payload_type}, "type": "response_item"}})

    mutations["prior_action"] = lambda items: insert_prior(items, "function_call")
    mutations["prior_reasoning"] = lambda items: insert_prior(items, "reasoning")
    rejected: list[str] = []
    for name, mutate in mutations.items():
        mutant = copy.deepcopy(records)
        mutate(mutant)
        try:
            ga._native_goal_context(mutant, prompt_line, turn_id, row["objective"])
        except ga.Invalid:
            rejected.append(name)
        else:
            raise Invalid(f"context mutation accepted:{name}")
    require(sorted(rejected) == sorted(mutations), "fixture mutation coverage")
    return {
        "accepted_v12_current_goal_context": {"bytes": passed["bytes"], "sha256": passed["sha256"]},
        "mutations_rejected": rejected,
        "section_count": len(ga.CONTEXT_SECTIONS),
    }


def run_harness_check(root: Path, codex: Path) -> dict[str, Any]:
    process = subprocess.run(
        [sys.executable, "-B", str(root / "goal_mode_harness.py"), "check", "--codex", str(codex)],
        cwd=root.parents[4],
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"},
        check=False,
        timeout=60,
    )
    require(process.returncode == 0 and process.stderr == b"", "harness check process")
    result = json.loads(process.stdout, object_pairs_hook=pairs)
    require(process.stdout == canon(result), "harness check canonical")
    require(
        result.get("status") == "PASS_STATIC_STRUCTURAL_GOAL_CONTEXT_DATA_ONLY_NO_MODEL_CALL_NO_LAUNCH_ZERO_CREDIT"
        and result.get("authority") == {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
        "harness check result",
    )
    return {
        "bindings": result["bindings"],
        "rc": process.returncode,
        "stderr_bytes": len(process.stderr),
        "stderr_sha256": sha(process.stderr),
        "stdout_bytes": len(process.stdout),
        "stdout_sha256": sha(process.stdout),
    }


def check(base: Path, codex: Path) -> dict[str, Any]:
    root = base / "goal_mode_empirical_harness_v13"
    source = source_checks(root)
    ga = load_module(root / "goal_mode_terminal_closure_attestor.py")
    fixture = context_fixture(base, ga)
    harness_process = run_harness_check(root, codex)
    bindings = harness_process.pop("bindings")
    return {
        "authority": {"canary_admission_eligible": True, "canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
        "bindings": bindings,
        "checks": {"context_fixture": fixture, "harness_process": harness_process, "source": source},
        "first_mismatch": None,
        "lineage": {"v10_canary": "PERMANENT_FAIL_ZERO_CREDIT", "v11_canary": "PERMANENT_FAIL_ZERO_CREDIT", "v12_canary": "PERMANENT_FAIL_ZERO_CREDIT"},
        "omp_lane": {"duplicate_spawn": False, "host": "WINDOWS", "launch_argv": ["omp", "--cwd", "P:\\"], "linux_process_inference": False},
        "schema_id": SCHEMA,
        "status": "PASS_INDEPENDENT_STRUCTURAL_GOAL_CONTEXT_CHECK_ZERO_CREDIT_NO_LAUNCH",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", type=Path, required=True)
    parser.add_argument("--codex", type=Path, required=True)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    try:
        require(args.check and args.base.is_absolute() and args.codex.is_absolute(), "CLI")
        result, rc = check(args.base, args.codex), 0
    except (Invalid, OSError, subprocess.SubprocessError, UnicodeError, json.JSONDecodeError) as exc:
        result = {"first_mismatch": str(exc), "schema_id": SCHEMA, "status": "FAIL_ZERO_CREDIT_NO_LAUNCH"}
        rc = 1
    sys.stdout.buffer.write(canon(result))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
