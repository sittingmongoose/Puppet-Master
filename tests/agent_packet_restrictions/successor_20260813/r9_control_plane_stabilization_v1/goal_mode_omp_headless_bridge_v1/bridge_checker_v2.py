#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import re
import stat
import subprocess
import sys
from pathlib import Path
from typing import Any

SCHEMA = "pw-r9-goal-mode-omp-headless-native-bridge-check-v2"
SOURCE_REL = "packages/coding-agent/src/modes/acp/acp-agent.ts"
TEST_REL = "packages/coding-agent/test/acp-agent.test.ts"
EXPECTED_COMMIT = "68874ddd906440da213ff9ee630d6822051ca219"
EXPECTED_BASE_SHA = "bef2774862d75d890fdbbfd3a11e9457c19ff71ebec7b487202ad6a0e51e6812"
EXPECTED_BASE_BYTES = 98072
EXPECTED_PATCHED_SHA = "0517bb16ea36743aae956845f75ad0c4ec19af3214fe84198635299680d86d19"
EXPECTED_PATCHED_BYTES = 108033
EXPECTED_TEST_BASE_SHA = "b68ebc977bd3dc6cfb1fe63a91e67d9f002ceddbe10ae901f6071a13aa2c2242"
EXPECTED_TEST_BASE_BYTES = 123005
EXPECTED_TEST_PATCHED_SHA = "3486a753856e715b77e9e7237c3ebf3d6dd52d85cc7f965c7f3e170e97cd8322"
EXPECTED_TEST_PATCHED_BYTES = 131195
EXPECTED_PATCH_SHA = "593ec8f78b1344e733a57f9620e758bf3b6d901a67646b54b5906d067357f83e"
EXPECTED_PATCH_BYTES = 26523

class Invalid(Exception):
    pass

def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def reject_constant(value: str) -> Any:
    raise Invalid(f"duplicate JSON key: {value}")

def finite(value: str) -> Any:
    parsed = float(value)
    if not math.isfinite(parsed):
        raise Invalid("non-finite JSON number")
    return parsed

def load_canonical_json(path: Path) -> tuple[dict[str, Any], bytes]:
    data = read_regular(path, expected_mode=0o644)
    if data.count(b"\n") != 1 or not data.endswith(b"\n"):
        raise Invalid(f"{path}: expected one terminal LF and no embedded LF")
    try:
        value = json.loads(
            data,
            object_pairs_hook=lambda pairs: _pairs(pairs),
            parse_constant=reject_constant,
            parse_float=finite,
        )
    except (ValueError, TypeError) as exc:
        raise Invalid(f"{path}: invalid JSON: {exc}") from exc
    if not isinstance(value, dict):
        raise Invalid(f"{path}: top level must be object")
    canonical = json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode() + b"\n"
    if data != canonical:
        raise Invalid(f"{path}: noncanonical JSON bytes")
    return value, data

def _pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for key, value in pairs:
        if key in out:
            raise Invalid(f"duplicate JSON key: {key}")
        out[key] = value
    return out

def read_regular(path: Path, expected_mode: int | None = None) -> bytes:
    if not path.is_absolute():
        raise Invalid(f"path must be absolute: {path}")
    try:
        info = path.lstat()
    except OSError as exc:
        raise Invalid(f"cannot stat {path}: {exc}") from exc
    if not stat.S_ISREG(info.st_mode) or path.is_symlink():
        raise Invalid(f"not a regular nonlink file: {path}")
    if expected_mode is not None and stat.S_IMODE(info.st_mode) != expected_mode:
        raise Invalid(f"mode mismatch for {path}: {stat.S_IMODE(info.st_mode):04o}")
    try:
        return path.read_bytes()
    except OSError as exc:
        raise Invalid(f"cannot read {path}: {exc}") from exc

def git(root: Path, *args: str) -> str:
    result = subprocess.run(
        ["git", *args],
        cwd=root,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if result.returncode != 0:
        raise Invalid(f"git {' '.join(args)} failed: {result.stderr.decode(errors='replace').strip()}")
    return result.stdout.decode("utf-8", errors="strict").strip()

HUNK = re.compile(r"^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@")

def split_file_patches(patch: bytes) -> dict[str, bytes]:
    try:
        lines = patch.decode("utf-8").splitlines(keepends=True)
    except UnicodeDecodeError as exc:
        raise Invalid(f"non-UTF-8 patch: {exc}") from exc
    starts = [index for index, line in enumerate(lines) if line.startswith("diff --git ")]
    if not starts:
        raise Invalid("patch contains no file headers")
    starts.append(len(lines))
    result: dict[str, bytes] = {}
    for left, right in zip(starts, starts[1:]):
        header = lines[left].rstrip("\n")
        match = re.fullmatch(r"diff --git a/(.+) b/(.+)", header)
        if not match or match.group(1) != match.group(2):
            raise Invalid(f"malformed or cross-path patch header: {header}")
        relative = match.group(1)
        if relative in result:
            raise Invalid(f"duplicate patch path: {relative}")
        result[relative] = "".join(lines[left:right]).encode("utf-8")
    if list(result) != [SOURCE_REL, TEST_REL]:
        raise Invalid("patch must modify exactly acp-agent.ts then acp-agent.test.ts")
    return result

def apply_unified_patch(source: bytes, patch: bytes, expected_rel: str) -> bytes:
    try:
        source_lines = source.decode("utf-8").splitlines(keepends=True)
        patch_lines = patch.decode("utf-8").splitlines(keepends=True)
    except UnicodeDecodeError as exc:
        raise Invalid(f"non-UTF-8 source or patch: {exc}") from exc
    diff_headers = [line for line in patch_lines if line.startswith("diff --git ")]
    expected_header = f"diff --git a/{expected_rel} b/{expected_rel}\n"
    if diff_headers != [expected_header]:
        raise Invalid(f"patch segment must modify exactly {expected_rel}")
    index = 0
    while index < len(patch_lines) and not patch_lines[index].startswith("@@ "):
        index += 1
    source_pos = 0
    output: list[str] = []
    saw_hunk = False
    while index < len(patch_lines):
        line = patch_lines[index]
        if not line.startswith("@@ "):
            raise Invalid(f"unexpected patch line outside hunk: {line.rstrip()}")
        match = HUNK.match(line.rstrip("\n"))
        if not match:
            raise Invalid(f"malformed hunk header: {line.rstrip()}")
        old_start = int(match.group(1))
        old_count = int(match.group(2) or "1")
        new_count = int(match.group(4) or "1")
        target_pos = old_start - 1
        if target_pos < source_pos or target_pos > len(source_lines):
            raise Invalid("overlapping or out-of-range hunk")
        output.extend(source_lines[source_pos:target_pos])
        source_pos = target_pos
        index += 1
        old_seen = 0
        new_seen = 0
        while index < len(patch_lines) and not patch_lines[index].startswith("@@ "):
            body = patch_lines[index]
            if body.startswith("\\ No newline at end of file"):
                index += 1
                continue
            if not body or body[0] not in " +-":
                raise Invalid(f"malformed hunk body: {body.rstrip()}")
            payload = body[1:]
            if body[0] == " ":
                if source_pos >= len(source_lines) or source_lines[source_pos] != payload:
                    raise Invalid("context mismatch while applying patch")
                output.append(payload)
                source_pos += 1
                old_seen += 1
                new_seen += 1
            elif body[0] == "-":
                if source_pos >= len(source_lines) or source_lines[source_pos] != payload:
                    raise Invalid("removal mismatch while applying patch")
                source_pos += 1
                old_seen += 1
            else:
                output.append(payload)
                new_seen += 1
            index += 1
        if old_seen != old_count or new_seen != new_count:
            raise Invalid(f"hunk count mismatch: old {old_seen}/{old_count}, new {new_seen}/{new_count}")
        saw_hunk = True
    if not saw_hunk:
        raise Invalid("patch contains no hunks")
    output.extend(source_lines[source_pos:])
    return "".join(output).encode("utf-8")

def between(text: str, start: str, end: str) -> str:
    left = text.find(start)
    if left < 0:
        raise Invalid(f"missing source marker: {start}")
    right = text.find(end, left + len(start))
    if right < 0:
        raise Invalid(f"missing source marker: {end}")
    return text[left:right]

REQUIRED = [
    'const R9_GOAL_BRIDGE_ENABLED = process.env.PW_R9_OMP_GOAL_BRIDGE_V1 === "1";',
    'const R9_GOAL_BRIDGE_ACTIVATE_METHOD = "_omp/r9/goal/activate";',
    'const R9_GOAL_BRIDGE_SETTLE_METHOD = "_omp/r9/goal/settle";',
    'const R9_GOAL_BRIDGE_MAX_SUBJECT_BYTES = 4_096;',
    'const R9_GOAL_BRIDGE_MAX_OBJECTIVE_BYTES = 512;',
    'phase: "FRESH" | "ACTIVE" | "PROMPT_CONSUMED" | "SETTLED" | "CONSUMED_FAILED";',
    'loadSession: !R9_GOAL_BRIDGE_ENABLED,',
    'if (R9_GOAL_BRIDGE_ENABLED && params.mcpServers.length !== 0)',
    'if (R9_GOAL_BRIDGE_ENABLED) throw new Error("R9 Goal bridge forbids session/load");',
    'if (R9_GOAL_BRIDGE_ENABLED) throw new Error("R9 Goal bridge forbids session/resume");',
    'if (R9_GOAL_BRIDGE_ENABLED) throw new Error("R9 Goal bridge forbids session/fork");',
    'const r9Converted = record.r9GoalBridge ? this.#consumeR9GoalSubject(record, params.prompt) : undefined;',
    'this.#assertR9ExactKeys(params, ["controlSha256", "rowId", "sessionId"]);',
    'const state = await record.session.goalRuntime.createGoal({ objective });',
    'await record.session.setActiveToolsByName(["goal"]);',
    'record.session.getActiveToolNames().length !== 1',
    'record.session.getActiveToolNames()[0] !== "goal"',
    'await record.session.sessionManager.flush();',
    'state?.enabled !== false',
    'state.mode !== "exiting"',
    'state.reason !== "completed"',
    'state.goal.status !== "complete"',
    'record.session.setGoalModeState(undefined);',
    'record.session.sessionManager.appendModeChange("none")',
    'record.session.sessionManager.appendCustomEntry("goal-completed", completedData)',
    'if (blocks.length !== 1 || blocks[0]?.type !== "text")',
    'if (bridge.phase !== "ACTIVE")',
    'Buffer.byteLength(text, "utf8")',
    'text.trimStart().startsWith("/")',
    'bridge.phase = "PROMPT_CONSUMED";',
    'return { text, images: [] };',
]
FORBIDDEN = [
    "completeGoalFromTool(",
    'const ACP_GOAL_MODE_ID = "goal";',
    'id: "goal", name: "Goal"',
    'setGoalModeState({ enabled: true',
]

def check_patched_source(base_text: str, patched_text: str) -> int:
    assertions = 0
    for token in REQUIRED:
        if token not in patched_text:
            raise Invalid(f"patched source missing invariant: {token}")
        assertions += 1
    for token in FORBIDDEN:
        if token in patched_text:
            raise Invalid(f"patched source contains forbidden shortcut: {token}")
        assertions += 1
    if patched_text.count("await record.session.sessionManager.flush();") < 2:
        raise Invalid("activation and settlement each require a durable flush")
    assertions += 1
    base_modes = between(base_text, "\t#getAvailableModes(", "\t#getCurrentModeId(")
    patched_modes = between(patched_text, "\t#getAvailableModes(", "\t#getCurrentModeId(")
    if base_modes != patched_modes:
        raise Invalid("stock ACP available-mode implementation changed")
    assertions += 1
    base_apply = between(base_text, "\t#applyModeChange(", "\t/**\n\t * Plan-proposal handler")
    patched_apply = between(patched_text, "\t#applyModeChange(", "\t/**\n\t * Plan-proposal handler")
    if base_apply != patched_apply:
        raise Invalid("stock ACP apply-mode implementation changed")
    assertions += 1
    prompt_pos = patched_text.index("async prompt(params: PromptRequest)")
    consume_pos = patched_text.index("this.#consumeR9GoalSubject", prompt_pos)
    queue_pos = patched_text.index("return await this.#queuePrompt", prompt_pos)
    if not prompt_pos < consume_pos < queue_pos:
        raise Invalid("subject phase must be consumed before prompt queueing")
    assertions += 1
    create_pos = patched_text.index("goalRuntime.createGoal")
    activation_flush = patched_text.index("sessionManager.flush()", create_pos)
    response_pos = patched_text.index("schemaId: R9_GOAL_BRIDGE_ACTIVATION_SCHEMA", activation_flush)
    if not create_pos < activation_flush < response_pos:
        raise Invalid("native Goal creation must be flushed before activation response")
    assertions += 1
    settle_pos = patched_text.index("async #settleR9Goal")
    complete_check = patched_text.index('state.goal.status !== "complete"', settle_pos)
    clear_pos = patched_text.index("setGoalModeState(undefined)", settle_pos)
    none_pos = patched_text.index('appendModeChange("none")', clear_pos)
    completed_pos = patched_text.index('appendCustomEntry("goal-completed"', none_pos)
    terminal_flush = patched_text.index("sessionManager.flush()", completed_pos)
    if not settle_pos < complete_check < clear_pos < none_pos < completed_pos < terminal_flush:
        raise Invalid("terminal reconciliation order mismatch")
    assertions += 1
    objective = (
        "R9 row <row>; control " + ("a" * 64) +
        "; answer exactly one admitted atomic subject; use no tools except goal; "
        "call goal complete only after the final answer is verified."
    )
    if len(objective.encode("utf-8")) > 512:
        raise Invalid("frozen objective template exceeds 512 bytes")
    assertions += 1
    return assertions

REQUIRED_TEST = [
    'const describeStockAcp = R9_GOAL_BRIDGE_TEST_ENABLED ? describe.skip : describe;',
    'const describeR9GoalBridge = R9_GOAL_BRIDGE_TEST_ENABLED ? describe : describe.skip;',
    'describeR9GoalBridge("R9 native Goal bridge", () => {',
    'GoalRuntime',
    'session.goalRuntime.completeGoalFromTool()',
    'expect(session.promptCalls).toEqual([]);',
    'expect(session.getActiveToolNames()).toEqual(["goal"]);',
    'rejects and consumes a subject prompt before Goal activation',
    'enforces one small text-only non-command subject',
    'prompt: [{ type: "text", text: "x".repeat(4_097) }]',
    'prompt: [{ type: "text", text: "/goal status" }]',
    'rejects non-fresh session surfaces and mode changes',
    'settle rejects every non-complete native Goal state without a second prompt',
    'mints distinct native Goal and ACP session identities for fresh rows',
    'describeStockAcp("ACP agent", () => {',
    'describeStockAcp("ACP agent MCP server configuration (late-connecting servers)", () => {',
]

def check_patched_test(base_text: str, patched_text: str) -> int:
    assertions = 0
    for token in REQUIRED_TEST:
        if token not in patched_text:
            raise Invalid(f"patched test missing invariant: {token}")
        assertions += 1
    if base_text.count('describe("ACP agent"') != 1 or patched_text.count('describe("ACP agent"') != 0:
        raise Invalid("stock ACP suite must be gated by describeStockAcp")
    assertions += 1
    if patched_text.count('describeR9GoalBridge("R9 native Goal bridge"') != 1:
        raise Invalid("bridge test suite cardinality mismatch")
    assertions += 1
    if patched_text.count('it("') - base_text.count('it("') != 6:
        raise Invalid("bridge test count must be exactly six")
    assertions += 1
    return assertions

MUTATIONS = [
    ('PW_R9_OMP_GOAL_BRIDGE_V1 === "1"', 'PW_R9_OMP_GOAL_BRIDGE_V1 === "0"'),
    ("R9_GOAL_BRIDGE_MAX_SUBJECT_BYTES = 4_096", "R9_GOAL_BRIDGE_MAX_SUBJECT_BYTES = 4_097"),
    ('params.mcpServers.length !== 0', 'params.mcpServers.length < 0'),
    ('forbids session/load', 'permits session/load'),
    ('forbids session/resume', 'permits session/resume'),
    ('forbids session/fork', 'permits session/fork'),
    ('bridge.phase !== "ACTIVE"', 'bridge.phase !== "FRESH"'),
    ('blocks.length !== 1', 'blocks.length < 1'),
    ('text.trimStart().startsWith("/")', 'false'),
    ('bridge.phase = "PROMPT_CONSUMED";', 'bridge.phase = "ACTIVE";'),
    ('goalRuntime.createGoal({ objective })', 'setGoalModeState({ enabled: true })'),
    ('setActiveToolsByName(["goal"])', 'setActiveToolsByName(["read", "goal"])'),
    ('state.mode !== "exiting"', 'state.mode !== "active"'),
    ('state.goal.status !== "complete"', 'state.goal.status !== "active"'),
    ('appendModeChange("none")', 'appendModeChange("goal")'),
    ('appendCustomEntry("goal-completed"', 'appendCustomEntry("goal-pending"'),
]

TEST_MUTATIONS = [
    ('R9_GOAL_BRIDGE_TEST_ENABLED ? describe.skip : describe', 'R9_GOAL_BRIDGE_TEST_ENABLED ? describe : describe'),
    ('R9_GOAL_BRIDGE_TEST_ENABLED ? describe : describe.skip', 'R9_GOAL_BRIDGE_TEST_ENABLED ? describe.skip : describe'),
    ('session.goalRuntime.completeGoalFromTool()', 'session.setGoalModeState(undefined)'),
    ('expect(session.getActiveToolNames()).toEqual(["goal"])', 'expect(session.getActiveToolNames()).toEqual([])'),
    ('"x".repeat(4_097)', '"x".repeat(4_096)'),
    ('prompt: [{ type: "text", text: "/goal status" }]', 'prompt: [{ type: "text", text: "goal status" }]'),
]

def mutation_self_test(base_text: str, patched_text: str, base_test: str, patched_test: str) -> int:
    rejected = 0
    for old, new in MUTATIONS:
        if old not in patched_text:
            raise Invalid(f"mutation source token absent: {old}")
        mutant = patched_text.replace(old, new, 1)
        try:
            check_patched_source(base_text, mutant)
        except Invalid:
            rejected += 1
        else:
            raise Invalid(f"mutation was not rejected: {old} -> {new}")
    for old, new in TEST_MUTATIONS:
        if old not in patched_test:
            raise Invalid(f"test mutation source token absent: {old}")
        mutant = patched_test.replace(old, new, 1)
        try:
            check_patched_test(base_test, mutant)
        except Invalid:
            rejected += 1
        else:
            raise Invalid(f"test mutation was not rejected: {old} -> {new}")
    return rejected

def validate_contract(contract: dict[str, Any], patch_data: bytes) -> int:
    assertions = 0
    if contract.get("schema_id") != "pw-r9-goal-mode-omp-headless-native-bridge-contract-v2":
        raise Invalid("contract schema mismatch")
    assertions += 1
    files = contract.get("exact_upstream", {}).get("files", [])
    expected = [
        {
            "baseline_bytes": EXPECTED_BASE_BYTES,
            "baseline_mode": "100644",
            "baseline_sha256": EXPECTED_BASE_SHA,
            "patched_bytes": EXPECTED_PATCHED_BYTES,
            "patched_mode": "100644",
            "patched_sha256": EXPECTED_PATCHED_SHA,
            "path": SOURCE_REL,
        },
        {
            "baseline_bytes": EXPECTED_TEST_BASE_BYTES,
            "baseline_mode": "100644",
            "baseline_sha256": EXPECTED_TEST_BASE_SHA,
            "patched_bytes": EXPECTED_TEST_PATCHED_BYTES,
            "patched_mode": "100644",
            "patched_sha256": EXPECTED_TEST_PATCHED_SHA,
            "path": TEST_REL,
        },
    ]
    if files != expected:
        raise Invalid("contract source and test identities mismatch")
    assertions += 1
    if len(patch_data) != EXPECTED_PATCH_BYTES or sha256(patch_data) != EXPECTED_PATCH_SHA:
        raise Invalid("patch identity mismatch")
    assertions += 1
    bridge = contract.get("bridge", {})
    if bridge.get("max_subject_utf8_bytes") != 4096 or bridge.get("max_goal_objective_utf8_bytes") != 512:
        raise Invalid("contract byte ceilings mismatch")
    assertions += 1
    if contract.get("qualification", {}).get("current_value") != "0/2":
        raise Invalid("qualification must remain 0/2")
    assertions += 1
    if contract.get("authority", {}).get("canary_launch") is not False:
        raise Invalid("contract grants canary authority")
    assertions += 1
    return assertions

def run(command: str, contract_path: Path, patch_path: Path, omp_root: Path) -> dict[str, Any]:
    contract, contract_data = load_canonical_json(contract_path)
    patch_data = read_regular(patch_path, expected_mode=0o644)
    assertions = validate_contract(contract, patch_data)
    if not omp_root.is_absolute() or not omp_root.is_dir() or omp_root.is_symlink():
        raise Invalid("omp root must be an absolute nonlink directory")
    commit = git(omp_root, "rev-parse", "HEAD")
    if commit != EXPECTED_COMMIT:
        raise Invalid(f"OMP commit mismatch: {commit}")
    assertions += 1
    patch_segments = split_file_patches(patch_data)
    base_data = read_regular(omp_root / SOURCE_REL)
    if len(base_data) != EXPECTED_BASE_BYTES or sha256(base_data) != EXPECTED_BASE_SHA:
        raise Invalid("baseline acp-agent.ts identity mismatch")
    assertions += 1
    base_test_data = read_regular(omp_root / TEST_REL)
    if len(base_test_data) != EXPECTED_TEST_BASE_BYTES or sha256(base_test_data) != EXPECTED_TEST_BASE_SHA:
        raise Invalid("baseline acp-agent.test.ts identity mismatch")
    assertions += 1
    for relative in (SOURCE_REL, TEST_REL):
        index_mode = git(omp_root, "ls-files", "-s", relative).split()[0]
        if index_mode != "100644":
            raise Invalid(f"baseline Git mode mismatch for {relative}: {index_mode}")
    assertions += 1
    apply_check = subprocess.run(
        ["git", "apply", "--check", "--whitespace=error-all", str(patch_path)],
        cwd=omp_root,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    if apply_check.returncode != 0:
        raise Invalid(f"git apply --check failed: {apply_check.stderr.decode(errors='replace').strip()}")
    assertions += 1
    patched_data = apply_unified_patch(base_data, patch_segments[SOURCE_REL], SOURCE_REL)
    if len(patched_data) != EXPECTED_PATCHED_BYTES or sha256(patched_data) != EXPECTED_PATCHED_SHA:
        raise Invalid("in-memory patched source identity mismatch")
    assertions += 1
    patched_test_data = apply_unified_patch(base_test_data, patch_segments[TEST_REL], TEST_REL)
    if len(patched_test_data) != EXPECTED_TEST_PATCHED_BYTES or sha256(patched_test_data) != EXPECTED_TEST_PATCHED_SHA:
        raise Invalid("in-memory patched test identity mismatch")
    assertions += 1
    try:
        base_text = base_data.decode("utf-8")
        patched_text = patched_data.decode("utf-8")
        base_test_text = base_test_data.decode("utf-8")
        patched_test_text = patched_test_data.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise Invalid(f"source or test decode failed: {exc}") from exc
    assertions += check_patched_source(base_text, patched_text)
    assertions += check_patched_test(base_test_text, patched_test_text)
    mutations = 0
    if command == "mutation-self-test":
        mutations = mutation_self_test(base_text, patched_text, base_test_text, patched_test_text)
        if mutations < 18:
            raise Invalid("mutation count below contract minimum")
        assertions += 1
    return {
        "assertion_count": assertions,
        "baseline_sha256": sha256(base_data),
        "check": "PASS",
        "contract_bytes": len(contract_data),
        "contract_sha256": sha256(contract_data),
        "first_mismatch": None,
        "mutation_count": mutations,
        "omp_commit": commit,
        "patch_bytes": len(patch_data),
        "patch_sha256": sha256(patch_data),
        "patched_bytes": len(patched_data),
        "patched_sha256": sha256(patched_data),
        "patched_test_bytes": len(patched_test_data),
        "patched_test_sha256": sha256(patched_test_data),
        "provider_calls": 0,
        "schema_id": SCHEMA,
        "subject_calls": 0,
        "test_baseline_sha256": sha256(base_test_data),
        "workspace_writes": 0,
    }

def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=["check", "mutation-self-test"])
    parser.add_argument("--contract", required=True)
    parser.add_argument("--patch", required=True)
    parser.add_argument("--omp-root", required=True)
    args = parser.parse_args()
    try:
        result = run(args.command, Path(args.contract), Path(args.patch), Path(args.omp_root))
        code = 0
    except Exception as exc:
        result = {
            "assertion_count": 0,
            "check": "FAIL",
            "first_mismatch": str(exc),
            "mutation_count": 0,
            "provider_calls": 0,
            "schema_id": SCHEMA,
            "subject_calls": 0,
            "workspace_writes": 0,
        }
        code = 1
    sys.stdout.write(json.dumps(result, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")) + "\n")
    return code

if __name__ == "__main__":
    raise SystemExit(main())
