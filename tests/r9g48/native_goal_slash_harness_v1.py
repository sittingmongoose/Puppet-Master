#!/usr/bin/env python3
"""Minimal native-/goal R9 test-taker harness.

The model receives one self-contained atomic capsule through the native Codex
composer `/goal` command.  Each invocation uses a fresh TUI process, a fresh
empty cwd outside the repository, one native Goal, and no model tool other than
`update_goal({status: "complete"})`.
"""

from __future__ import annotations

import argparse
import gzip
import hashlib
import json
import os
import re
import secrets
import select
import shlex
import stat
import subprocess
import sys
import tempfile
import time
from dataclasses import dataclass
from pathlib import Path

SCHEMA = "pw-r9-native-goal-slash-harness-v1"
MANIFEST_SCHEMA = "pw-r9-native-goal-slash-matrix-pair-011-012-manifest-v1"
PLAN_SCHEMA = "pw-r9-codex-native-goal-atomic-public-manifest-v1"
CELL_SCHEMA = "pw-r9-codex-native-goal-atomic-cell-dag-v1"
NODE_SCHEMA = "pw-r9-codex-native-goal-atomic-node-v1"
PROMPT_MAX = 349
RESULT_MAX = 128
UUID_RE = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")
ATOM_RE = re.compile(r"n[0-9]{5}")
HEX_RE = re.compile(r"[0-9a-f]{64}")
ROUTES = {
    "slot-alpha": ("a", "gpt-5.4-mini", "xhigh"),
    "slot-bravo": ("b", "gpt-5.4-mini", "medium"),
    "slot-charlie": ("c", "gpt-5.6-luna", "medium"),
}
ALLOWED_MATRIX_IDS = {
    "codex-native-slash-goal-matrix-011",
    "codex-native-slash-goal-matrix-012",
}
CODEX = Path("/home/sittingmongoose/.local/bin/codex")
SESSIONS = Path("/home/sittingmongoose/.codex/sessions")
REPO = Path("/mnt/Cursor/PuppetMaster")
BASE = REPO / "tests/r9g48"
MANIFEST = BASE / "native_goal_slash_matrix_pair_011_012_manifest_v1.json"
PLAN_ROOT = (
    REPO
    / "tests/agent_packet_restrictions/successor_20260813/"
    "r9_control_plane_stabilization_v1/"
    "codex_native_goal_direct_canary_002_public_plan_v1"
)
PLAN_MANIFEST = PLAN_ROOT / "manifest.json"


class Invalid(Exception):
    pass


def fail(message: str) -> None:
    raise Invalid(message)


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def canonical_no_lf(value: object) -> bytes:
    return json.dumps(
        value, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    ).encode("utf-8")


def canonical(value: object) -> bytes:
    return canonical_no_lf(value) + b"\n"


def unique_object(pairs: list[tuple[str, object]]) -> dict[str, object]:
    out: dict[str, object] = {}
    for key, value in pairs:
        if key in out:
            fail(f"duplicate-key:{key}")
        out[key] = value
    return out


def parse_json(data: bytes, where: str, require_canonical: bool = True) -> object:
    try:
        value = json.loads(
            data.decode("utf-8"),
            object_pairs_hook=unique_object,
            parse_constant=lambda item: fail(f"nonfinite:{where}:{item}"),
        )
    except Invalid:
        raise
    except Exception as exc:
        fail(f"json:{where}:{type(exc).__name__}")
    if require_canonical and data != canonical(value):
        fail(f"canonical:{where}")
    return value


def read_regular(path: Path, where: str, mode: int | None = 0o644) -> bytes:
    if not path.is_absolute():
        fail(f"absolute:{where}")
    try:
        before = path.lstat()
        resolved = path.resolve(strict=True)
    except OSError as exc:
        fail(f"stat:{where}:{type(exc).__name__}")
    if resolved != path or not stat.S_ISREG(before.st_mode):
        fail(f"type:{where}")
    if mode is not None and stat.S_IMODE(before.st_mode) != mode:
        fail(f"mode:{where}:{stat.S_IMODE(before.st_mode):04o}")
    flags = os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0)
    fd = os.open(path, flags)
    try:
        opened = os.fstat(fd)
        if (opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino):
            fail(f"race:{where}")
        chunks: list[bytes] = []
        while True:
            chunk = os.read(fd, 1024 * 1024)
            if not chunk:
                break
            chunks.append(chunk)
    finally:
        os.close(fd)
    after = path.lstat()
    if (
        after.st_dev,
        after.st_ino,
        after.st_size,
        after.st_mtime_ns,
    ) != (
        before.st_dev,
        before.st_ino,
        before.st_size,
        before.st_mtime_ns,
    ):
        fail(f"drift:{where}")
    return b"".join(chunks)


def write_exact(path: Path, data: bytes) -> None:
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0)
    fd = os.open(path, flags, 0o644)
    try:
        offset = 0
        while offset < len(data):
            offset += os.write(fd, data[offset:])
        os.fsync(fd)
    finally:
        os.close(fd)
    os.chmod(path, 0o644, follow_symlinks=False)
    dfd = os.open(path.parent, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
    try:
        os.fsync(dfd)
    finally:
        os.close(dfd)
    if read_regular(path, f"written:{path.name}") != data:
        fail(f"write-reopen:{path.name}")


def make_dir(path: Path) -> None:
    path.mkdir(mode=0o755)
    os.chmod(path, 0o755)
    dfd = os.open(path.parent, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
    try:
        os.fsync(dfd)
    finally:
        os.close(dfd)


def checked_text(value: object, where: str) -> str:
    if not isinstance(value, dict) or set(value) != {"bytes", "sha256", "utf8"}:
        fail(f"text-shape:{where}")
    text = value.get("utf8")
    if not isinstance(text, str):
        fail(f"text-type:{where}")
    data = text.encode("utf-8")
    if value.get("bytes") != len(data) or value.get("sha256") != sha256(data):
        fail(f"text-identity:{where}")
    return text


def substitute(value: object, replacements: dict[str, str], seen: set[str]) -> object:
    if isinstance(value, dict):
        return {key: substitute(child, replacements, seen) for key, child in value.items()}
    if isinstance(value, list):
        return [substitute(child, replacements, seen) for child in value]
    if isinstance(value, str) and value in replacements:
        seen.add(value)
        return replacements[value]
    return value


def materialize_payload(node: dict[str, object], results: dict[str, str]) -> object:
    dependencies = node.get("dependencies")
    if not isinstance(dependencies, list):
        fail("dependencies")
    if node.get("dynamic") is False:
        if dependencies or results:
            fail("static-dependencies")
        raw = checked_text(node.get("subject_payload"), "subject-payload").encode("utf-8")
        return parse_json(raw, "subject-payload", require_canonical=False)
    if node.get("dynamic") is not True or list(results) != dependencies:
        fail("dynamic-dependency-order")
    template = node.get("subject_template")
    if not isinstance(template, dict):
        fail("subject-template")
    limits = template.get("dependency_result_max_bytes")
    if not isinstance(limits, list) or len(limits) != len(dependencies):
        fail("dependency-limits")
    for index, atom_id in enumerate(dependencies):
        result = results.get(atom_id)
        if not isinstance(result, str) or len(result.encode("utf-8")) > limits[index]:
            fail("dependency-result-limit")
    if len(dependencies) == 1:
        replacements = {"${SUMMARY_RESULT}": results[dependencies[0]]}
    elif len(dependencies) == 2:
        replacements = {
            "${LEFT_RESULT}": results[dependencies[0]],
            "${RIGHT_RESULT}": results[dependencies[1]],
        }
    else:
        fail("dependency-fanin")
    seen: set[str] = set()
    value = substitute(template.get("canonical_json_template"), replacements, seen)
    if seen != set(replacements):
        fail("template-placeholders")
    encoded = canonical_no_lf(value)
    maximum = template.get("max_payload_bytes")
    if not isinstance(maximum, int) or len(encoded) > maximum:
        fail("dynamic-payload-limit")
    return value


def build_capsule(node: dict[str, object], payload: object) -> dict[str, object]:
    return {
        "c": checked_text(node.get("acceptance_criterion"), "acceptance"),
        "p": payload,
        "q": checked_text(node.get("output_contract"), "output-contract"),
    }


def execution_id(
    matrix_id: str,
    route: str,
    wave: int,
    cell_sha256: str,
    atom_id: str,
    capsule: bytes,
) -> str:
    parts = [matrix_id, route, str(wave), cell_sha256, atom_id, sha256(capsule)]
    return sha256(b"\0".join(item.encode("utf-8") for item in parts))[:24]


def goal_objective(execution: str, capsule: bytes) -> str:
    value = parse_json(capsule, "goal-capsule", require_canonical=False)
    if not isinstance(value, dict) or set(value) != {"c", "p", "q"}:
        fail("goal-capsule-shape")
    task = value.get("c")
    output = value.get("q")
    if not isinstance(task, str) or not isinstance(output, str):
        fail("goal-capsule-text")
    data = canonical_no_lf(value.get("p")).decode("utf-8")
    objective = (
        f"x={execution}; Task: {task} Data JSON: {data}. Output: {output} "
        "Complete Goal with update_goal; use no other tool; answer only."
    )
    command = f"/goal {objective}"
    if len(command.encode("utf-8")) > PROMPT_MAX:
        fail(f"prompt-limit:{len(command.encode('utf-8'))}")
    if any(ord(character) < 32 for character in command):
        fail("prompt-control-character")
    return objective


def validate_result(node: dict[str, object], result: str) -> None:
    if not isinstance(result, str):
        fail("result-type")
    data = result.encode("utf-8")
    if not 1 <= len(data) <= RESULT_MAX or "\n" in result or "\r" in result:
        fail("result-bytes")
    kind = node.get("kind")
    if kind in {"EVIDENCE_SLICE_LABEL", "ENDPOINT_SLICE_LABEL", "PAIR_SIGNAL_REDUCER"}:
        if len(data) > node.get("result_max_bytes", -1) or not re.fullmatch(
            r"[A-Za-z0-9._:-]+", result
        ):
            fail("result-signal")
    elif kind == "FINAL_OPTION_SELECTOR":
        value = parse_json(data, "result-option", require_canonical=False)
        options = node["subject_template"]["canonical_json_template"].get("o")
        if not isinstance(value, dict) or set(value) != {"selected_choice"}:
            fail("result-option-shape")
        if value.get("selected_choice") not in options or data != canonical_no_lf(value):
            fail("result-option")
    elif kind == "FINAL_EDGE_VERDICT":
        value = parse_json(data, "result-edge", require_canonical=False)
        if value not in ({"verdict": "supported"}, {"verdict": "unsupported"}):
            fail("result-edge")
        if data != canonical_no_lf(value):
            fail("result-edge-canonical")
    elif kind == "FINAL_TENSION_VERDICT":
        value = parse_json(data, "result-tension", require_canonical=False)
        if not isinstance(value, dict) or set(value) != {"preserve_boundary"}:
            fail("result-tension-shape")
        if not isinstance(value.get("preserve_boundary"), bool) or data != canonical_no_lf(value):
            fail("result-tension")
    elif kind == "FINAL_EDGE_VERDICT_PER_EDGE":
        if result not in {"S", "U"}:
            fail("result-per-edge")
    elif kind == "FINAL_SPECIALIST_CODE":
        if not re.fullmatch(r"[SU]:[A-Z0-9]", result):
            fail("result-specialist")
    else:
        fail(f"result-kind:{kind}")


@dataclass(frozen=True)
class NodeSpec:
    route: str
    route_code: str
    model: str
    effort: str
    cell: str
    cell_index: int
    cell_path: Path
    cell_sha256: str
    atom_id: str
    node: dict[str, object]


def load_manifest() -> dict[str, object]:
    data = read_regular(MANIFEST, "manifest")
    value = parse_json(data, "manifest")
    if not isinstance(value, dict) or value.get("schema_id") != MANIFEST_SCHEMA:
        fail("manifest-schema")
    for binding_name, binding in value.get("bindings", {}).items():
        if not isinstance(binding, dict) or set(binding) != {"bytes", "mode", "path", "sha256"}:
            fail(f"binding-shape:{binding_name}")
        path = REPO / binding["path"]
        raw = read_regular(path.resolve(strict=True), f"binding:{binding_name}")
        if (
            len(raw) != binding["bytes"]
            or sha256(raw) != binding["sha256"]
            or binding["mode"] != "0644"
        ):
            fail(f"binding-identity:{binding_name}")
    return value


def load_schedule() -> dict[str, list[NodeSpec]]:
    plan_data = read_regular(PLAN_MANIFEST.resolve(strict=True), "plan-manifest")
    plan = parse_json(plan_data, "plan-manifest")
    if not isinstance(plan, dict) or plan.get("schema_id") != PLAN_SCHEMA:
        fail("plan-schema")
    schedule: dict[str, list[NodeSpec]] = {route: [] for route in ROUTES}
    entries = plan.get("cells")
    if not isinstance(entries, list) or len(entries) != 291:
        fail("plan-cells")
    entries = sorted(entries, key=lambda item: (item["route"], item["cell_index"]))
    seen_paths: set[Path] = set()
    for entry in entries:
        route = entry.get("route")
        if route not in ROUTES:
            fail("entry-route")
        code, model, effort = ROUTES[route]
        identity = entry.get("cell_file")
        if not isinstance(identity, dict) or set(identity) != {"bytes", "path", "sha256"}:
            fail("cell-identity-shape")
        path = (PLAN_ROOT / identity["path"]).resolve(strict=True)
        if path in seen_paths or not path.is_relative_to(PLAN_ROOT):
            fail("cell-path")
        seen_paths.add(path)
        raw = read_regular(path, f"cell:{entry.get('cell_index')}")
        if len(raw) != identity["bytes"] or sha256(raw) != identity["sha256"]:
            fail("cell-identity")
        cell = parse_json(raw, f"cell:{entry.get('cell_index')}")
        if (
            not isinstance(cell, dict)
            or cell.get("schema_id") != CELL_SCHEMA
            or cell.get("route") != route
            or cell.get("route_code") != code
            or cell.get("model_requested") != model
            or cell.get("reasoning_effort_requested") != effort
            or cell.get("cell_index") != entry.get("cell_index")
            or cell.get("cell") != entry.get("cell")
        ):
            fail("cell-fixed-fields")
        nodes = cell.get("nodes")
        if not isinstance(nodes, list) or len(nodes) != entry.get("atom_count"):
            fail("cell-node-count")
        previous: set[str] = set()
        for node in nodes:
            if not isinstance(node, dict) or node.get("schema_id") != NODE_SCHEMA:
                fail("node-schema")
            atom_id = node.get("atom_id")
            dependencies = node.get("dependencies")
            if (
                not isinstance(atom_id, str)
                or not ATOM_RE.fullmatch(atom_id)
                or atom_id in previous
                or not isinstance(dependencies, list)
                or len(dependencies) != len(set(dependencies))
                or any(item not in previous for item in dependencies)
            ):
                fail("node-order")
            previous.add(atom_id)
            schedule[route].append(
                NodeSpec(
                    route=route,
                    route_code=code,
                    model=model,
                    effort=effort,
                    cell=cell["cell"],
                    cell_index=cell["cell_index"],
                    cell_path=path,
                    cell_sha256=identity["sha256"],
                    atom_id=atom_id,
                    node=node,
                )
            )
    if {route: len(items) for route, items in schedule.items()} != {
        "slot-alpha": 5204,
        "slot-bravo": 5204,
        "slot-charlie": 5204,
    }:
        fail("route-counts")
    return schedule


def worst_case_prompt(spec: NodeSpec, matrix_id: str, wave: int) -> int:
    node = spec.node
    dependencies = node["dependencies"]
    if node["dynamic"]:
        results = {
            atom_id: "X" * node["subject_template"]["dependency_result_max_bytes"][index]
            for index, atom_id in enumerate(dependencies)
        }
    else:
        results = {}
    payload = materialize_payload(node, results)
    capsule = canonical_no_lf(build_capsule(node, payload))
    identifier = execution_id(
        matrix_id, spec.route, wave, spec.cell_sha256, spec.atom_id, capsule
    )
    objective = goal_objective(identifier, capsule)
    return len(f"/goal {objective}".encode("utf-8"))


def check_static() -> dict[str, object]:
    manifest = load_manifest()
    schedule = load_schedule()
    maximum = 0
    maximum_owner: dict[str, object] | None = None
    for wave in range(5204):
        for route in ("slot-alpha", "slot-bravo", "slot-charlie"):
            spec = schedule[route][wave]
            size = worst_case_prompt(spec, "codex-native-slash-goal-matrix-011", wave)
            if size > maximum:
                maximum = size
                maximum_owner = {
                    "atom_id": spec.atom_id,
                    "cell": spec.cell,
                    "route": route,
                    "wave": wave,
                }
    if maximum != PROMPT_MAX:
        fail(f"prompt-maximum:{maximum}")
    return {
        "authority": False,
        "first_mismatch": None,
        "manifest_sha256": sha256(read_regular(MANIFEST, "manifest-final")),
        "matrix_launch": False,
        "maximum_prompt_bytes": maximum,
        "maximum_prompt_owner": maximum_owner,
        "qualification_credit": 0,
        "route_atom_counts": {route: len(items) for route, items in schedule.items()},
        "schema_id": SCHEMA,
        "status": "PASS_STATIC_MINIMAL_NATIVE_SLASH_GOAL_ZERO_CREDIT_NO_LAUNCH_AUTHORITY",
        "subject_task_count": sum(len(items) for items in schedule.values()),
        "workspace_writes": 0,
        "manifest_status": manifest["status"],
    }


def session_files() -> set[Path]:
    if not SESSIONS.is_dir():
        fail("sessions-root")
    return set(SESSIONS.glob("[0-9][0-9][0-9][0-9]/[0-9][0-9]/[0-9][0-9]/rollout-*.jsonl"))


def trace_for_cwd(paths: set[Path], cwd: Path) -> Path | None:
    matches: list[Path] = []
    for path in paths:
        try:
            with path.open("rb") as handle:
                first = handle.readline()
            value = json.loads(first)
        except (OSError, ValueError, UnicodeDecodeError):
            continue
        if value.get("type") == "session_meta" and value.get("payload", {}).get("cwd") == str(cwd):
            matches.append(path)
    if len(matches) > 1:
        fail("multiple-traces-for-cwd")
    return matches[0] if matches else None


def read_trace_rows(path: Path) -> tuple[bytes, list[dict[str, object]]]:
    raw = read_regular(path.resolve(strict=True), "trace", mode=0o664)
    if not raw.endswith(b"\n"):
        fail("trace-terminal-lf")
    rows: list[dict[str, object]] = []
    for index, line in enumerate(raw.splitlines()):
        value = parse_json(line, f"trace:{index}", require_canonical=False)
        if not isinstance(value, dict) or value.get("ordinal") != index:
            fail(f"trace-ordinal:{index}")
        rows.append(value)
    return raw, rows


def content_text(content: object, allowed_types: set[str]) -> str:
    if not isinstance(content, list):
        fail("message-content")
    parts: list[str] = []
    for item in content:
        if not isinstance(item, dict) or item.get("type") not in allowed_types:
            fail("message-content-item")
        text = item.get("text")
        if not isinstance(text, str):
            fail("message-text")
        parts.append(text)
    return "".join(parts)


def completion_from_output(payload: dict[str, object], direct: bool) -> dict[str, object]:
    output = payload.get("output")
    if direct:
        if not isinstance(output, str):
            fail("direct-completion-output")
        texts = [output]
    else:
        if not isinstance(output, list):
            fail("nested-completion-output")
        texts = []
        for item in output:
            if not isinstance(item, dict) or item.get("type") != "input_text":
                fail("nested-completion-item")
            text = item.get("text")
            if not isinstance(text, str):
                fail("nested-completion-text")
            texts.append(text)
    candidates: list[dict[str, object]] = []
    for text in texts:
        starts = [index for index, char in enumerate(text) if char == "{"]
        for start in starts:
            try:
                value = json.loads(text[start:])
            except ValueError:
                continue
            if isinstance(value, dict) and isinstance(value.get("goal"), dict):
                candidates.append(value)
    if len(candidates) != 1:
        fail("completion-receipt-count")
    return candidates[0]


def terminal_goal_get(thread_id: str) -> dict[str, object]:
    """Read the terminal Goal state through Codex app-server without a model turn."""
    if not UUID_RE.fullmatch(thread_id):
        fail("goal-get-thread-id")
    process = subprocess.Popen(
        [str(CODEX), "app-server", "--stdio", "--strict-config"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1,
    )
    if process.stdin is None or process.stdout is None or process.stderr is None:
        fail("goal-get-pipes")

    def send(value: object) -> None:
        process.stdin.write(canonical_no_lf(value).decode("utf-8") + "\n")
        process.stdin.flush()

    def receive(request_id: int) -> dict[str, object]:
        deadline = time.monotonic() + 10
        while time.monotonic() < deadline:
            ready, _write, _error = select.select(
                [process.stdout, process.stderr], [], [], 0.25
            )
            for handle in ready:
                line = handle.readline()
                if handle is process.stderr:
                    if line:
                        fail(f"goal-get-stderr:{line.strip()}")
                    continue
                if not line:
                    fail("goal-get-eof")
                message = parse_json(line.encode("utf-8"), "goal-get", False)
                if not isinstance(message, dict):
                    fail("goal-get-message")
                if message.get("id") == request_id:
                    return message
                if message.get("method") != "remoteControl/status/changed":
                    fail("goal-get-unexpected-message")
        fail("goal-get-timeout")

    try:
        send(
            {
                "id": 1,
                "method": "initialize",
                "params": {
                    "capabilities": {"experimentalApi": True},
                    "clientInfo": {"name": "r9-native-goal-harness", "version": "1"},
                },
            }
        )
        initialized = receive(1)
        if set(initialized) != {"id", "result"} or initialized.get("id") != 1:
            fail("goal-get-initialize")
        send({"method": "initialized", "params": {}})
        send(
            {
                "id": 2,
                "method": "thread/goal/get",
                "params": {"threadId": thread_id},
            }
        )
        response = receive(2)
        if set(response) != {"id", "result"} or response.get("id") != 2:
            fail("goal-get-response")
        result = response.get("result")
        if not isinstance(result, dict) or set(result) != {"goal"}:
            fail("goal-get-result")
        goal = result.get("goal")
        required = {
            "createdAt",
            "objective",
            "status",
            "threadId",
            "timeUsedSeconds",
            "tokenBudget",
            "tokensUsed",
            "updatedAt",
        }
        if not isinstance(goal, dict) or set(goal) != required:
            fail("goal-get-shape")
        if (
            goal.get("threadId") != thread_id
            or goal.get("tokenBudget") is not None
            or any(
                not isinstance(goal.get(field), int) or goal[field] < 0
                for field in (
                    "createdAt",
                    "timeUsedSeconds",
                    "tokensUsed",
                    "updatedAt",
                )
            )
        ):
            fail("goal-get-fixed")
        return goal
    finally:
        try:
            process.stdin.close()
        except OSError:
            pass
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait(timeout=5)


def verify_trace(
    rows: list[dict[str, object]],
    expected_cwd: Path,
    objective: str,
    model: str,
    effort: str,
    expected_result: str | None,
    terminal_goal: dict[str, object],
) -> dict[str, object]:
    if not rows or rows[0].get("type") != "session_meta":
        fail("session-meta")
    meta = rows[0].get("payload")
    if not isinstance(meta, dict):
        fail("session-meta-payload")
    session_id = meta.get("id")
    if (
        not isinstance(session_id, str)
        or not UUID_RE.fullmatch(session_id)
        or meta.get("session_id") != session_id
        or meta.get("cwd") != str(expected_cwd)
        or meta.get("originator") != "codex-tui"
        or meta.get("source") != "cli"
    ):
        fail("session-meta-fixed")
    active: list[tuple[int, dict[str, object]]] = []
    task_started: list[int] = []
    task_complete: list[int] = []
    finals: list[tuple[int, str]] = []
    turn_contexts: list[dict[str, object]] = []
    calls: list[tuple[int, dict[str, object]]] = []
    outputs: dict[str, tuple[int, dict[str, object]]] = {}
    developer_text = ""
    for row in rows:
        ordinal = row["ordinal"]
        row_type = row.get("type")
        payload = row.get("payload")
        if not isinstance(payload, dict):
            continue
        if row_type == "event_msg" and payload.get("type") == "thread_goal_updated":
            goal = payload.get("goal")
            if isinstance(goal, dict) and goal.get("status") == "active":
                active.append((ordinal, goal))
        elif row_type == "event_msg" and payload.get("type") == "task_started":
            task_started.append(ordinal)
        elif row_type == "event_msg" and payload.get("type") == "task_complete":
            task_complete.append(ordinal)
        elif row_type == "turn_context":
            turn_contexts.append(payload)
        elif row_type == "response_item" and payload.get("type") in {
            "function_call",
            "custom_tool_call",
        }:
            calls.append((ordinal, payload))
        elif row_type == "response_item" and payload.get("type") in {
            "function_call_output",
            "custom_tool_call_output",
        }:
            call_id = payload.get("call_id")
            if not isinstance(call_id, str) or call_id in outputs:
                fail("tool-output-id")
            outputs[call_id] = (ordinal, payload)
        elif (
            row_type == "response_item"
            and payload.get("type") == "message"
            and payload.get("role") == "assistant"
            and payload.get("phase") == "final_answer"
        ):
            finals.append((ordinal, content_text(payload.get("content"), {"output_text"})))
        elif (
            row_type == "response_item"
            and payload.get("type") == "message"
            and payload.get("role") == "developer"
        ):
            developer_text += content_text(payload.get("content"), {"input_text"})
    if len(active) != 1 or len(task_started) != 1 or active[0][0] >= task_started[0]:
        fail("goal-active-order")
    goal = active[0][1]
    if goal.get("threadId") != session_id or goal.get("objective") != objective:
        fail("goal-active-identity")
    if len(turn_contexts) != 1:
        fail("turn-context-count")
    context = turn_contexts[0]
    if context.get("model") != model or context.get("effort") != effort:
        fail("model-effort")
    if context.get("cwd") != str(expected_cwd) or context.get("sandbox_policy") != {"type": "read-only"}:
        fail("turn-context-fixed")
    if "r9-goal-" in developer_text or "/mnt/Cursor/PuppetMaster/.agents/skills/" in developer_text:
        fail("project-goal-skill-visible")
    if len(calls) != 1:
        fail(f"model-tool-call-count:{len(calls)}")
    call_ordinal, call = calls[0]
    call_id = call.get("call_id")
    if not isinstance(call_id, str) or call_id not in outputs:
        fail("completion-call-output")
    direct = call.get("type") == "function_call"
    if direct:
        if call.get("name") != "update_goal" or call.get("arguments") != '{"status":"complete"}':
            fail("direct-completion-call")
    else:
        source = call.get("input")
        if call.get("name") != "exec" or not isinstance(source, str):
            fail("nested-completion-call")
        compact = re.sub(r"\s+", "", source)
        if compact not in {
            'constr=awaittools.update_goal({status:"complete"});text(r)',
            'constr=awaittools.update_goal({status:"complete"});text(r);',
            'constr=awaittools.update_goal({status:"complete"});text("")',
            'constr=awaittools.update_goal({status:"complete"});text("");',
        }:
            fail("nested-completion-source")
    output_ordinal, output = outputs[call_id]
    if output_ordinal <= call_ordinal:
        fail("completion-output-order")
    tool_receipt_preserved = direct
    if direct:
        completion = completion_from_output(output, True)
        embedded_goal = completion.get("goal")
        if (
            not isinstance(embedded_goal, dict)
            or embedded_goal.get("threadId") != session_id
            or embedded_goal.get("objective") != objective
            or embedded_goal.get("status") != "complete"
        ):
            fail("goal-tool-receipt-identity")
    completed_goal = terminal_goal
    if (
        not isinstance(completed_goal, dict)
        or completed_goal.get("threadId") != session_id
        or completed_goal.get("objective") != objective
        or completed_goal.get("status") != "complete"
    ):
        fail("goal-completion-identity")
    if len(finals) != 1 or len(task_complete) != 1:
        fail("terminal-cardinality")
    final_ordinal, result = finals[0]
    if not (output_ordinal < final_ordinal < task_complete[0]):
        fail("terminal-order")
    if expected_result is not None and result != expected_result:
        fail("probe-result")
    if any(
        row.get("type") == "event_msg"
        and isinstance(row.get("payload"), dict)
        and row["payload"].get("type") in {"turn_aborted", "task_aborted"}
        for row in rows
    ):
        fail("abort-event")
    return {
        "active_goal_ordinal": active[0][0],
        "completion_call_ordinal": call_ordinal,
        "completion_output_ordinal": output_ordinal,
        "completion_representation": "DIRECT_FUNCTION_CALL" if direct else "NESTED_FUNCTIONS_EXEC",
        "completion_tool_receipt_preserved": tool_receipt_preserved,
        "final_ordinal": final_ordinal,
        "goal_receipt": completed_goal,
        "result_utf8": result,
        "session_id": session_id,
        "task_complete_ordinal": task_complete[0],
    }


def launch_goal(
    objective: str,
    model: str,
    effort: str,
    expected_result: str | None,
    timeout_seconds: int,
) -> dict[str, object]:
    before = session_files()
    temp_text = tempfile.mkdtemp(prefix="r9g48-native-goal-")
    cwd = Path(temp_text).resolve(strict=True)
    os.chmod(cwd, 0o700)
    args = [
        "--no-alt-screen",
        "--strict-config",
        "-C",
        str(cwd),
        "--sandbox",
        "read-only",
        "--ask-for-approval",
        "never",
        "--model",
        model,
        "-c",
        f'model_reasoning_effort="{effort}"',
        "-c",
        "suppress_unstable_features_warning=true",
        "-c",
        "notice.model_migrations={}",
    ]
    tmux_name = f"r9g48-{secrets.token_hex(8)}"
    shell_command = shlex.join(
        ["env", "PYTHONDONTWRITEBYTECODE=1", str(CODEX), *args]
    )

    def tmux_call(arguments: list[str], timeout: int = 10) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            ["tmux", *arguments],
            check=False,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=timeout,
        )

    def capture() -> str:
        value = tmux_call(["capture-pane", "-p", "-t", tmux_name, "-S", "-2000"])
        if value.returncode != 0:
            return ""
        return value.stdout

    def pane_value(format_string: str) -> str | None:
        value = tmux_call(
            ["display-message", "-p", "-t", tmux_name, format_string]
        )
        if value.returncode != 0:
            return None
        return value.stdout.strip()

    start = tmux_call(
        [
            "new-session",
            "-d",
            "-s",
            tmux_name,
            "-x",
            "120",
            "-y",
            "40",
            "-c",
            str(cwd),
            shell_command,
        ]
    )
    if start.returncode != 0:
        fail(f"tmux-start:{start.stderr.strip()}")
    retained = tmux_call(["set-option", "-w", "-t", tmux_name, "remain-on-exit", "on"])
    if retained.returncode != 0:
        tmux_call(["kill-session", "-t", tmux_name])
        fail("tmux-remain-on-exit")
    screen = ""
    trace: Path | None = None
    terminal_seen = False
    started = time.monotonic()
    try:
        trust_sent = False
        while time.monotonic() - started < 30:
            screen = capture()
            if "Do you trust the contents of this directory?" in screen and not trust_sent:
                accepted = tmux_call(["send-keys", "-t", tmux_name, "Enter"])
                if accepted.returncode != 0:
                    fail("tmux-trust-enter")
                trust_sent = True
                time.sleep(0.1)
                continue
            model_ready = f"model:     {model} {effort}" in screen
            if model_ready and re.search(r"(?:^|\n)›\s", screen):
                break
            if pane_value("#{pane_dead}") == "1":
                fail("tui-exited-before-ready")
            time.sleep(0.1)
        else:
            fail("tui-ready-timeout")
        typed = tmux_call(["send-keys", "-t", tmux_name, "-l", f"/goal {objective}"])
        entered = tmux_call(["send-keys", "-t", tmux_name, "Enter"])
        if typed.returncode != 0 or entered.returncode != 0:
            fail("tmux-send-keys")
        # The first Enter accepts the slash-command completion in Codex 0.148.
        # Submit the still-buffered command with one second Enter, never by
        # retyping or resending the objective bytes.
        submit_deadline = time.monotonic() + 1
        while time.monotonic() < submit_deadline:
            trace = trace_for_cwd(session_files() - before, cwd)
            if trace is not None:
                break
            time.sleep(0.1)
        if trace is None:
            screen = capture()
            if f"› /goal x={objective.split(';', 1)[0].split('=', 1)[1]}" not in screen:
                fail("slash-goal-not-buffered-after-first-enter")
            submitted = tmux_call(["send-keys", "-t", tmux_name, "Enter"])
            if submitted.returncode != 0:
                fail("tmux-submit-enter")
        while time.monotonic() - started < timeout_seconds:
            screen = capture()
            if "Use existing model" in screen or "Switch to GPT" in screen:
                fail("model-migration-interstitial")
            if trace is None:
                trace = trace_for_cwd(session_files() - before, cwd)
            if trace is not None:
                try:
                    _raw, rows = read_trace_rows(trace)
                except Invalid as exc:
                    if str(exc) == "trace-terminal-lf":
                        continue
                    raise
                terminal_seen = any(
                    row.get("type") == "event_msg"
                    and isinstance(row.get("payload"), dict)
                    and row["payload"].get("type") == "task_complete"
                    for row in rows
                )
                if terminal_seen:
                    break
            if pane_value("#{pane_dead}") == "1":
                break
            time.sleep(0.25)
        if trace is None:
            trace = trace_for_cwd(session_files() - before, cwd)
        if trace is None:
            fail("trace-not-found")
        if not terminal_seen:
            fail("task-timeout-or-early-exit")
        tmux_call(["send-keys", "-t", tmux_name, "C-c"])
        exit_deadline = time.monotonic() + 5
        while time.monotonic() < exit_deadline and pane_value("#{pane_dead}") != "1":
            time.sleep(0.1)
        process_exit = pane_value("#{pane_dead_status}")
        process_signal = pane_value("#{pane_dead_signal}")
        raw_trace, rows = read_trace_rows(trace)
        meta = rows[0].get("payload")
        if not isinstance(meta, dict) or not isinstance(meta.get("id"), str):
            fail("goal-get-session-meta")
        terminal_goal = terminal_goal_get(meta["id"])
        try:
            verified = verify_trace(
                rows,
                cwd,
                objective,
                model,
                effort,
                expected_result,
                terminal_goal,
            )
            verification_error = None
        except Invalid as exc:
            verified = {"terminal_goal_receipt": terminal_goal}
            verification_error = str(exc)
        screen = capture() or screen
        tui = screen.encode("utf-8", errors="replace")
        verified.update(
            {
                "cwd": str(cwd),
                "process_exit_status": int(process_exit) if process_exit and process_exit.isdigit() else None,
                "process_signal_status": int(process_signal) if process_signal and process_signal.isdigit() else None,
                "trace_bytes": len(raw_trace),
                "trace_path": str(trace),
                "trace_sha256": sha256(raw_trace),
                "trace_raw": raw_trace,
                "tui_bytes": len(tui),
                "tui_sha256": sha256(tui),
                "tui_raw": tui,
                "verification_error": verification_error,
            }
        )
        return verified
    finally:
        tmux_call(["kill-session", "-t", tmux_name])
        try:
            cwd.rmdir()
        except OSError:
            pass


PROBES = {
    "slot-alpha": (
        {"c": "Uppercase the letter in p.", "p": "m", "q": "One uppercase ASCII letter only."},
        "M",
    ),
    "slot-bravo": (
        {"c": "Uppercase the letter in p.", "p": "m", "q": "One uppercase ASCII letter only."},
        "M",
    ),
    "slot-charlie": (
        {"c": "Uppercase the letter in p.", "p": "m", "q": "One uppercase ASCII letter only."},
        "M",
    ),
}


def run_probe(route: str, output_root: Path, timeout_seconds: int) -> dict[str, object]:
    load_manifest()
    if route not in ROUTES or route not in PROBES:
        fail("probe-route")
    if output_root.exists() or output_root.resolve(strict=False) != output_root:
        fail("probe-output-root")
    make_dir(output_root)
    code, model, effort = ROUTES[route]
    capsule_value, expected = PROBES[route]
    capsule = canonical_no_lf(capsule_value)
    identifier = sha256(b"probe\0" + route.encode("utf-8") + b"\0" + capsule)[:24]
    objective = goal_objective(identifier, capsule)
    # Preserve the terminal trace before applying the scored output predicate.
    # A wrong answer is a consumed test-taker result, not a host exception.
    result = launch_goal(objective, model, effort, None, timeout_seconds)
    trace_raw = result.pop("trace_raw")
    tui_raw = result.pop("tui_raw")
    trace_gzip = gzip.compress(trace_raw, compresslevel=9, mtime=0)
    tui_gzip = gzip.compress(tui_raw, compresslevel=9, mtime=0)
    trace_path = output_root / "rollout.jsonl.gz"
    tui_path = output_root / "tui.txt.gz"
    write_exact(trace_path, trace_gzip)
    write_exact(tui_path, tui_gzip)
    verification_error = result.get("verification_error")
    passed = verification_error is None and result.get("result_utf8") == expected
    first_mismatch = (
        verification_error
        if verification_error is not None
        else None if passed else "probe-result"
    )
    if passed:
        status = "PASS_PROBE_ONLY_ZERO_CREDIT_NO_MATRIX_AUTHORITY"
    elif verification_error is not None:
        status = "FAIL_PROBE_PROTOCOL_CONSUMED_ZERO_CREDIT_NO_RETRY_NO_MATRIX_AUTHORITY"
    else:
        status = "FAIL_PROBE_RESULT_CONSUMED_ZERO_CREDIT_NO_RETRY_NO_MATRIX_AUTHORITY"
    receipt = {
        "authority": False,
        "expected_result_utf8": expected,
        "execution_id": identifier,
        "first_mismatch": first_mismatch,
        "goal_command_bytes": len(f"/goal {objective}".encode("utf-8")),
        "goal_objective": objective,
        "goal_objective_sha256": sha256(objective.encode("utf-8")),
        "model_requested": model,
        "qualification_credit": 0,
        "reasoning_effort_requested": effort,
        "route": route,
        "route_code": code,
        "schema_id": SCHEMA,
        "status": status,
        "trace_copy": {
            "bytes": len(trace_gzip),
            "raw_bytes": result["trace_bytes"],
            "raw_sha256": result["trace_sha256"],
            "sha256": sha256(trace_gzip),
        },
        "tui_copy": {
            "bytes": len(tui_gzip),
            "raw_bytes": result["tui_bytes"],
            "raw_sha256": result["tui_sha256"],
            "sha256": sha256(tui_gzip),
        },
        "verification": result,
    }
    receipt_path = output_root / ("receipt.json" if passed else "failure.json")
    write_exact(receipt_path, canonical(receipt))
    return {
        "authority": False,
        "first_mismatch": first_mismatch,
        "output_root": str(output_root),
        "qualification_credit": 0,
        "artifact": {
            "bytes": receipt_path.stat().st_size,
            "sha256": sha256(read_regular(receipt_path.resolve(strict=True), "probe-receipt")),
        },
        "route": route,
        "schema_id": SCHEMA,
        "status": status,
    }


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(add_help=False)
    sub = result.add_subparsers(dest="command", required=True)
    check = sub.add_parser("check", add_help=False)
    check.add_argument("--check", action="store_true")
    probe = sub.add_parser("probe", add_help=False)
    probe.add_argument("--route", required=True)
    probe.add_argument("--output-root", required=True)
    probe.add_argument("--timeout-seconds", type=int, default=180)
    return result


def main() -> int:
    try:
        args, extra = parser().parse_known_args()
        if extra:
            fail("CLI-extra")
        if args.command == "check":
            if not args.check:
                fail("CLI-check")
            output = check_static()
        else:
            output_path = Path(args.output_root)
            if not output_path.is_absolute():
                fail("probe-output-absolute")
            output = run_probe(args.route, output_path, args.timeout_seconds)
        code = 0 if output.get("first_mismatch") is None else 1
    except (Invalid, OSError, ValueError, TypeError, KeyError, subprocess.SubprocessError) as exc:
        output = {
            "authority": False,
            "first_mismatch": str(exc),
            "qualification_credit": 0,
            "schema_id": SCHEMA,
            "status": "FAIL_ZERO_CREDIT_NO_MATRIX_AUTHORITY",
        }
        code = 1
    sys.stdout.buffer.write(canonical(output))
    return code


if __name__ == "__main__":
    raise SystemExit(main())
