#!/usr/bin/env python3
"""Read-only independent verifier for R9 native `/goal` Matrix011/012."""

from __future__ import annotations

import argparse
import gzip
import hashlib
import json
import os
import re
import select
import stat
import subprocess
import sys
import time
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path

SCHEMA = "pw-r9-native-goal-slash-matrix-verifier-v1"
RUNNER_SCHEMA = "pw-r9-native-goal-slash-matrix-runner-v1"
ADMISSION_SCHEMA = "pw-r9-native-goal-slash-matrix-admission-v1"
RUN_SCHEMA = "pw-r9-native-goal-slash-matrix-run-v1"
TASK_SCHEMA = "pw-r9-native-goal-slash-matrix-task-v1"
TERMINAL_SCHEMA = "pw-r9-native-goal-slash-matrix-terminal-v1"
ACCOUNTING_SCHEMA = "pw-r9-native-goal-slash-matrix-accounting-v1"
INVENTORY_SCHEMA = "pw-r9-native-goal-slash-matrix-inventory-v1"
PLAN_SCHEMA = "pw-r9-codex-native-goal-atomic-public-manifest-v1"
CELL_SCHEMA = "pw-r9-codex-native-goal-atomic-cell-dag-v1"
NODE_SCHEMA = "pw-r9-codex-native-goal-atomic-node-v1"
SCORER_SCHEMA = "pw-r9-codex-native-goal-atomic-scorer-v1"

REPO = Path("/mnt/Cursor/PuppetMaster")
BASE = REPO / "tests/r9g48"
HARNESS = BASE / "native_goal_slash_harness_v1.py"
MANIFEST = BASE / "native_goal_slash_matrix_pair_011_012_manifest_v1.json"
CANARY = BASE / "native_goal_slash_roster_canary_v1.json"
RUNNER = BASE / "native_goal_slash_matrix_runner_v1.py"
PUBLIC_ROOT = (
    REPO
    / "tests/agent_packet_restrictions/successor_20260813/"
    "r9_control_plane_stabilization_v1/"
    "codex_native_goal_direct_canary_002_public_plan_v1"
)
SCORER_ROOT = (
    REPO
    / "tests/agent_packet_restrictions/successor_20260813/"
    "r9_control_plane_stabilization_v1/"
    "codex_native_goal_direct_canary_002_scorer_plan_v1"
)
CODEX = Path("/home/sittingmongoose/.local/bin/codex")
CODEX_REAL = Path(
    "/home/sittingmongoose/.codex/packages/standalone/releases/"
    "0.148.0-x86_64-unknown-linux-musl/bin/codex"
)

HARNESS_ID = {
    "bytes": 44090,
    "mode": "0644",
    "path": "tests/r9g48/native_goal_slash_harness_v1.py",
    "sha256": "a0a898f2cd64b63db2a2dd75a5adc524a64477cf2445f085dd49bdec7a55558a",
}
MANIFEST_ID = {
    "bytes": 5416,
    "mode": "0644",
    "path": "tests/r9g48/native_goal_slash_matrix_pair_011_012_manifest_v1.json",
    "sha256": "b0821a4857b6b11effdde833b2b66dce167b2c33d63aefd4a6bc0f181fcf4bbd",
}
CANARY_ID = {
    "bytes": 3261,
    "mode": "0644",
    "path": "tests/r9g48/native_goal_slash_roster_canary_v1.json",
    "sha256": "3d28bb94e54fb2a62b15f537eec0b86c0c925696e853ee970fdf2c6261a2be9d",
}
RUNNER_ID = {
    "bytes": 28328,
    "mode": "0644",
    "path": "tests/r9g48/native_goal_slash_matrix_runner_v1.py",
    "sha256": "5a19806638eb1d50ea35fc3c2487dbff832b883f3576426ed0dc511b1d54aecf",
}
RUNTIME_ID = {
    "bytes": 251271488,
    "mode": "0755",
    "path": str(CODEX_REAL),
    "sha256": "ac2cfed85fb647d61e0150b8548102b330e4799d9d81ad5d354de701edf6b074",
    "version": "codex-cli 0.148.0",
}
PLAN_ID = {
    "bytes": 98424,
    "sha256": "d840adca04316ef54aa220b44a1778638616e53275d4723e5f923520bbe18606",
}
SCORER_ID = {
    "bytes": 26213,
    "sha256": "4b3f50be0907974de9f58e1d95571260926b7701cf750dca19fffa5c813d09d8",
}

ROUTES = {
    "slot-alpha": ("a", "gpt-5.4-mini", "xhigh"),
    "slot-bravo": ("b", "gpt-5.4-mini", "medium"),
    "slot-charlie": ("c", "gpt-5.6-luna", "medium"),
}
ROUTE_ORDER = tuple(ROUTES)
MATRICES = {
    "codex-native-slash-goal-matrix-011": 1,
    "codex-native-slash-goal-matrix-012": 2,
}
ADMISSIONS = {
    "codex-native-slash-goal-matrix-011": BASE / "native_goal_slash_matrix_011_admission_v1.json",
    "codex-native-slash-goal-matrix-012": BASE / "native_goal_slash_matrix_012_admission_v1.json",
}
PREDECESSOR_VERIFICATION = BASE / "native_goal_slash_matrix_011_verification_v1.json"
UUID_RE = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")
ATOM_RE = re.compile(r"n[0-9]{5}")
SAFE_RE = re.compile(r"[A-Za-z0-9._:-]+")
PROMPT_MAX = 349
RESULT_MAX = 128


class Invalid(Exception):
    pass


def fail(message: str) -> None:
    raise Invalid(message)


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def canonical_no_lf(value: object) -> bytes:
    return json.dumps(
        value,
        ensure_ascii=False,
        allow_nan=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")


def canonical(value: object) -> bytes:
    return canonical_no_lf(value) + b"\n"


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            fail(f"duplicate-key:{key}")
        result[key] = value
    return result


def parse_json(data: bytes, label: str, canonical_lf: bool = True):
    try:
        value = json.loads(
            data.decode("utf-8"),
            object_pairs_hook=unique_object,
            parse_constant=lambda item: fail(f"nonfinite:{label}:{item}"),
        )
    except Invalid:
        raise
    except Exception as exc:
        fail(f"json:{label}:{type(exc).__name__}")
    if canonical_lf and data != canonical(value):
        fail(f"canonical:{label}")
    return value


def read_exact(path: Path, label: str, mode: int = 0o644) -> bytes:
    if not path.is_absolute():
        fail(f"absolute:{label}")
    try:
        before = path.lstat()
        resolved = path.resolve(strict=True)
    except OSError as exc:
        fail(f"stat:{label}:{type(exc).__name__}")
    if resolved != path or not stat.S_ISREG(before.st_mode):
        fail(f"type:{label}")
    if stat.S_IMODE(before.st_mode) != mode:
        fail(f"mode:{label}")
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    try:
        opened = os.fstat(fd)
        if (opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino):
            fail(f"race:{label}")
        chunks = []
        while True:
            chunk = os.read(fd, 1024 * 1024)
            if not chunk:
                break
            chunks.append(chunk)
    finally:
        os.close(fd)
    after = path.lstat()
    if (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns) != (
        before.st_dev,
        before.st_ino,
        before.st_size,
        before.st_mtime_ns,
    ):
        fail(f"drift:{label}")
    return b"".join(chunks)


def bind(path: Path, identity: dict[str, object], label: str) -> bytes:
    raw = read_exact(path, label)
    if len(raw) != identity["bytes"] or sha(raw) != identity["sha256"]:
        fail(f"identity:{label}")
    return raw


def object_file(path: Path, label: str) -> dict[str, object]:
    value = parse_json(read_exact(path, label), label)
    if not isinstance(value, dict):
        fail(f"object:{label}")
    return value


def checked_text(value: object, label: str) -> str:
    if not isinstance(value, dict) or set(value) != {"bytes", "sha256", "utf8"}:
        fail(f"text-shape:{label}")
    text = value.get("utf8")
    if not isinstance(text, str):
        fail(f"text-type:{label}")
    raw = text.encode("utf-8")
    if value.get("bytes") != len(raw) or value.get("sha256") != sha(raw):
        fail(f"text-identity:{label}")
    return text


def substitute(value: object, replacements: dict[str, str], seen: set[str]):
    if isinstance(value, dict):
        return {key: substitute(child, replacements, seen) for key, child in value.items()}
    if isinstance(value, list):
        return [substitute(child, replacements, seen) for child in value]
    if isinstance(value, str) and value in replacements:
        seen.add(value)
        return replacements[value]
    return value


def materialize(node: dict[str, object], prior: dict[str, str]):
    dependencies = node.get("dependencies")
    if not isinstance(dependencies, list):
        fail("dependencies")
    if node.get("dynamic") is False:
        if dependencies or prior:
            fail("static-dependencies")
        return parse_json(
            checked_text(node.get("subject_payload"), "subject-payload").encode("utf-8"),
            "subject-payload",
            False,
        )
    if node.get("dynamic") is not True or list(prior) != dependencies:
        fail("dynamic-dependency-order")
    template = node.get("subject_template")
    if not isinstance(template, dict):
        fail("subject-template")
    limits = template.get("dependency_result_max_bytes")
    if not isinstance(limits, list) or len(limits) != len(dependencies):
        fail("dependency-limits")
    for index, atom_id in enumerate(dependencies):
        if len(prior[atom_id].encode("utf-8")) > limits[index]:
            fail("dependency-result-limit")
    if len(dependencies) == 1:
        replacements = {"${SUMMARY_RESULT}": prior[dependencies[0]]}
    elif len(dependencies) == 2:
        replacements = {
            "${LEFT_RESULT}": prior[dependencies[0]],
            "${RIGHT_RESULT}": prior[dependencies[1]],
        }
    else:
        fail("dependency-fanin")
    seen = set()
    result = substitute(template.get("canonical_json_template"), replacements, seen)
    if seen != set(replacements):
        fail("template-placeholders")
    raw = canonical_no_lf(result)
    if not isinstance(template.get("max_payload_bytes"), int) or len(raw) > template["max_payload_bytes"]:
        fail("dynamic-payload-limit")
    return result


def capsule(node: dict[str, object], payload: object) -> bytes:
    return canonical_no_lf(
        {
            "c": checked_text(node.get("acceptance_criterion"), "acceptance"),
            "p": payload,
            "q": checked_text(node.get("output_contract"), "output-contract"),
        }
    )


def execution_id(matrix_id, route, wave, cell_sha, atom_id, capsule_raw):
    parts = [matrix_id, route, str(wave), cell_sha, atom_id, sha(capsule_raw)]
    return sha(b"\0".join(item.encode("utf-8") for item in parts))[:24]


def objective(identifier: str, capsule_raw: bytes) -> str:
    value = parse_json(capsule_raw, "capsule", False)
    data = canonical_no_lf(value["p"]).decode("utf-8")
    result = (
        f"x={identifier}; Task: {value['c']} Data JSON: {data}. Output: {value['q']} "
        "Complete Goal with update_goal; use no other tool; answer only."
    )
    command = "/goal " + result
    if len(command.encode("utf-8")) > PROMPT_MAX or any(ord(char) < 32 for char in command):
        fail("prompt-contract")
    return result


def validate_result(node: dict[str, object], result: str) -> None:
    if not isinstance(result, str):
        fail("result-type")
    raw = result.encode("utf-8")
    if not 1 <= len(raw) <= RESULT_MAX or "\n" in result or "\r" in result:
        fail("result-bytes")
    kind = node.get("kind")
    if kind in {"EVIDENCE_SLICE_LABEL", "ENDPOINT_SLICE_LABEL", "PAIR_SIGNAL_REDUCER"}:
        if len(raw) > node.get("result_max_bytes", -1) or not SAFE_RE.fullmatch(result):
            fail("result-signal")
    elif kind == "FINAL_OPTION_SELECTOR":
        value = parse_json(raw, "result-option", False)
        options = node["subject_template"]["canonical_json_template"].get("o")
        if (
            not isinstance(value, dict)
            or set(value) != {"selected_choice"}
            or value.get("selected_choice") not in options
            or raw != canonical_no_lf(value)
        ):
            fail("result-option")
    elif kind == "FINAL_EDGE_VERDICT":
        value = parse_json(raw, "result-edge", False)
        if value not in ({"verdict": "supported"}, {"verdict": "unsupported"}) or raw != canonical_no_lf(value):
            fail("result-edge")
    elif kind == "FINAL_TENSION_VERDICT":
        value = parse_json(raw, "result-tension", False)
        if (
            not isinstance(value, dict)
            or set(value) != {"preserve_boundary"}
            or not isinstance(value.get("preserve_boundary"), bool)
            or raw != canonical_no_lf(value)
        ):
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
class Spec:
    route: str
    route_code: str
    model: str
    effort: str
    cell: str
    cell_index: int
    cell_sha256: str
    atom_id: str
    node: dict[str, object]
    recipe: dict[str, object]


def load_schedule():
    plan_raw = bind(PUBLIC_ROOT / "manifest.json", PLAN_ID, "public-manifest")
    plan = parse_json(plan_raw, "public-manifest")
    scorer_raw = bind(SCORER_ROOT / "manifest.json", SCORER_ID, "scorer-manifest")
    scorer = parse_json(scorer_raw, "scorer-manifest")
    if not isinstance(plan, dict) or plan.get("schema_id") != PLAN_SCHEMA:
        fail("public-schema")
    if not isinstance(scorer, dict) or scorer.get("schema_id") != SCORER_SCHEMA:
        fail("scorer-schema")
    entries = plan.get("cells")
    if not isinstance(entries, list) or len(entries) != 291:
        fail("public-cells")
    schedule = {route: [] for route in ROUTES}
    for entry in sorted(entries, key=lambda row: (row["route"], row["cell_index"])):
        route = entry.get("route")
        if route not in ROUTES:
            fail("entry-route")
        code, model, effort = ROUTES[route]
        identity = entry.get("cell_file")
        if not isinstance(identity, dict) or set(identity) != {"bytes", "path", "sha256"}:
            fail("cell-identity-shape")
        path = (PUBLIC_ROOT / identity["path"]).resolve(strict=True)
        if not path.is_relative_to(PUBLIC_ROOT):
            fail("cell-path")
        raw = read_exact(path, "cell")
        if len(raw) != identity["bytes"] or sha(raw) != identity["sha256"]:
            fail("cell-identity")
        cell = parse_json(raw, "cell")
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
            fail("cell-fixed")
        nodes = cell.get("nodes")
        if not isinstance(nodes, list) or len(nodes) != entry.get("atom_count"):
            fail("node-count")
        seen = set()
        for node in nodes:
            atom_id = node.get("atom_id") if isinstance(node, dict) else None
            dependencies = node.get("dependencies") if isinstance(node, dict) else None
            if (
                not isinstance(node, dict)
                or node.get("schema_id") != NODE_SCHEMA
                or not isinstance(atom_id, str)
                or not ATOM_RE.fullmatch(atom_id)
                or atom_id in seen
                or not isinstance(dependencies, list)
                or len(dependencies) != len(set(dependencies))
                or any(dep not in seen for dep in dependencies)
            ):
                fail("node-order")
            seen.add(atom_id)
            schedule[route].append(
                Spec(
                    route,
                    code,
                    model,
                    effort,
                    cell["cell"],
                    cell["cell_index"],
                    identity["sha256"],
                    atom_id,
                    node,
                    cell["assembly_recipe"],
                )
            )
    if {route: len(rows) for route, rows in schedule.items()} != {route: 5204 for route in ROUTES}:
        fail("schedule-count")
    for wave in range(5204):
        if len(
            {
                (
                    schedule[route][wave].cell_index,
                    schedule[route][wave].cell,
                    schedule[route][wave].atom_id,
                    schedule[route][wave].node.get("kind"),
                )
                for route in ROUTE_ORDER
            }
        ) != 1:
            fail("wave-alignment")
    rows = scorer.get("cells")
    if (
        scorer.get("cell_count") != 97
        or scorer.get("route_outcome_count") != 291
        or scorer.get("qualification_credit") != 0
        or scorer.get("comparator") != "EXACT_UTF8_AND_SHA256_AFTER_PUBLIC_RECIPE_ASSEMBLY"
        or not isinstance(rows, list)
        or len(rows) != 97
    ):
        fail("scorer-fixed")
    scorer_by_cell = {}
    for index, row in enumerate(rows):
        if (
            not isinstance(row, dict)
            or row.get("cell_index") != index
            or not isinstance(row.get("expected_output_utf8"), str)
        ):
            fail("scorer-row")
        raw = row["expected_output_utf8"].encode("utf-8")
        if len(raw) != row.get("expected_output_bytes") or sha(raw) != row.get("expected_output_sha256"):
            fail("scorer-row-identity")
        scorer_by_cell[index] = row
    return schedule, scorer_by_cell


def content_text(content: object, allowed: set[str]) -> str:
    if not isinstance(content, list):
        fail("content")
    parts = []
    for item in content:
        if not isinstance(item, dict) or item.get("type") not in allowed or not isinstance(item.get("text"), str):
            fail("content-item")
        parts.append(item["text"])
    return "".join(parts)


def trace_rows(raw: bytes):
    if not raw.endswith(b"\n"):
        fail("trace-terminal-lf")
    rows = []
    for ordinal, line in enumerate(raw.splitlines()):
        value = parse_json(line, f"trace:{ordinal}", False)
        if not isinstance(value, dict) or value.get("ordinal") != ordinal:
            fail("trace-ordinal")
        rows.append(value)
    return rows


def embedded_direct_receipt(payload: dict[str, object]):
    output = payload.get("output")
    if not isinstance(output, str):
        fail("direct-output")
    candidates = []
    for start in (index for index, char in enumerate(output) if char == "{"):
        try:
            value = json.loads(output[start:])
        except ValueError:
            continue
        if isinstance(value, dict) and isinstance(value.get("goal"), dict):
            candidates.append(value["goal"])
    if len(candidates) != 1:
        fail("direct-receipt-count")
    return candidates[0]


def verify_trace(raw: bytes, record: dict[str, object], expected_objective: str, model: str, effort: str):
    rows = trace_rows(raw)
    if not rows or rows[0].get("type") != "session_meta" or not isinstance(rows[0].get("payload"), dict):
        fail("session-meta")
    meta = rows[0]["payload"]
    session_id = meta.get("id")
    cwd = meta.get("cwd")
    if (
        not isinstance(session_id, str)
        or not UUID_RE.fullmatch(session_id)
        or meta.get("session_id") != session_id
        or meta.get("originator") != "codex-tui"
        or meta.get("source") != "cli"
        or meta.get("cli_version") != "0.148.0"
        or meta.get("model_provider") != "openai"
        or meta.get("thread_source") != "user"
        or not isinstance(cwd, str)
        or not re.fullmatch(r"/tmp/r9g48-native-goal-[a-z0-9_]+", cwd)
    ):
        fail("session-fixed")
    active = []
    starts = []
    completes = []
    contexts = []
    finals = []
    assistant_messages = []
    calls = []
    outputs = {}
    developer = ""
    for row in rows:
        ordinal = row["ordinal"]
        payload = row.get("payload")
        if not isinstance(payload, dict):
            continue
        row_type = row.get("type")
        if row_type == "event_msg" and payload.get("type") == "thread_goal_updated":
            goal = payload.get("goal")
            if isinstance(goal, dict) and goal.get("status") == "active":
                active.append((ordinal, goal))
        elif row_type == "event_msg" and payload.get("type") == "task_started":
            starts.append(ordinal)
        elif row_type == "event_msg" and payload.get("type") == "task_complete":
            completes.append(ordinal)
        elif row_type == "turn_context":
            contexts.append(payload)
        elif row_type == "response_item" and payload.get("type") in {"function_call", "custom_tool_call"}:
            calls.append((ordinal, payload))
        elif row_type == "response_item" and payload.get("type") in {"function_call_output", "custom_tool_call_output"}:
            call_id = payload.get("call_id")
            if not isinstance(call_id, str) or call_id in outputs:
                fail("tool-output")
            outputs[call_id] = (ordinal, payload)
        elif row_type == "response_item" and payload.get("type") == "message" and payload.get("role") == "assistant":
            message = content_text(payload.get("content"), {"output_text"})
            assistant_messages.append((ordinal, payload.get("phase"), message))
            if payload.get("phase") == "final_answer":
                finals.append((ordinal, message))
        elif row_type == "response_item" and payload.get("type") == "message" and payload.get("role") == "developer":
            developer += content_text(payload.get("content"), {"input_text"})
    if len(active) != 1 or len(starts) != 1 or active[0][0] >= starts[0]:
        fail("goal-active-order")
    if active[0][1].get("threadId") != session_id or active[0][1].get("objective") != expected_objective:
        fail("goal-active-identity")
    if len(contexts) != 1 or contexts[0].get("model") != model or contexts[0].get("effort") != effort:
        fail("context-route")
    if contexts[0].get("cwd") != cwd or contexts[0].get("sandbox_policy") != {"type": "read-only"}:
        fail("context-fixed")
    if "r9-goal-" in developer or "/mnt/Cursor/PuppetMaster/.agents/skills/" in developer:
        fail("goal-skill-visible")
    if len(calls) != 1 or len(outputs) != 1:
        fail("tool-call-count")
    call_ordinal, call = calls[0]
    call_id = call.get("call_id")
    if not isinstance(call_id, str) or call_id not in outputs:
        fail("tool-call-output")
    direct = call.get("type") == "function_call"
    if direct:
        if call.get("name") != "update_goal" or call.get("arguments") != '{"status":"complete"}':
            fail("direct-call")
    else:
        source = call.get("input")
        compact = re.sub(r"\s+", "", source) if isinstance(source, str) else None
        if call.get("name") != "exec" or compact not in {
            'constr=awaittools.update_goal({status:"complete"});text(r)',
            'constr=awaittools.update_goal({status:"complete"});text(r);',
            'constr=awaittools.update_goal({status:"complete"});text("")',
            'constr=awaittools.update_goal({status:"complete"});text("");',
        }:
            fail("nested-call")
    output_ordinal, tool_output = outputs[call_id]
    if output_ordinal <= call_ordinal:
        fail("tool-order")
    if (
        len(finals) != 1
        or assistant_messages != [(finals[0][0], "final_answer", finals[0][1])]
        or len(completes) != 1
        or not output_ordinal < finals[0][0] < completes[0]
    ):
        fail("terminal-order")
    if any(
        row.get("type") == "event_msg"
        and isinstance(row.get("payload"), dict)
        and row["payload"].get("type") in {"turn_aborted", "task_aborted"}
        for row in rows
    ):
        fail("abort")
    goal = record.get("verification", {}).get("goal_receipt")
    if (
        not isinstance(goal, dict)
        or set(goal)
        != {
            "createdAt",
            "objective",
            "status",
            "threadId",
            "timeUsedSeconds",
            "tokenBudget",
            "tokensUsed",
            "updatedAt",
        }
        or goal.get("threadId") != session_id
        or goal.get("objective") != expected_objective
        or goal.get("status") != "complete"
        or goal.get("tokenBudget") is not None
        or any(
            not isinstance(goal.get(field), int) or goal[field] < 0
            for field in ("createdAt", "timeUsedSeconds", "tokensUsed", "updatedAt")
        )
    ):
        fail("recorded-terminal-goal")
    if direct:
        embedded = embedded_direct_receipt(tool_output)
        if embedded.get("threadId") != session_id or embedded.get("objective") != expected_objective or embedded.get("status") != "complete":
            fail("embedded-terminal-goal")
    expected_verification = {
        "active_goal_ordinal": active[0][0],
        "completion_call_ordinal": call_ordinal,
        "completion_output_ordinal": output_ordinal,
        "completion_representation": "DIRECT_FUNCTION_CALL" if direct else "NESTED_FUNCTIONS_EXEC",
        "completion_tool_receipt_preserved": direct,
        "cwd": cwd,
        "final_ordinal": finals[0][0],
        "goal_receipt": goal,
        "process_exit_status": 0,
        "process_signal_status": None,
        "result_utf8": finals[0][1],
        "session_id": session_id,
        "task_complete_ordinal": completes[0],
        "trace_bytes": len(raw),
        "trace_path": record["verification"].get("trace_path"),
        "trace_sha256": sha(raw),
        "tui_bytes": record["verification"].get("tui_bytes"),
        "tui_sha256": record["verification"].get("tui_sha256"),
        "verification_error": None,
    }
    trace_path = expected_verification["trace_path"]
    if not isinstance(trace_path, str) or session_id not in trace_path or not trace_path.endswith(".jsonl"):
        fail("trace-path")
    if record.get("verification") != expected_verification:
        fail("verification-projection")
    return session_id, cwd, finals[0][1], goal


class GoalReader:
    def __init__(self):
        self.process = subprocess.Popen(
            [str(CODEX), "app-server", "--stdio", "--strict-config"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
        )
        if self.process.stdin is None or self.process.stdout is None or self.process.stderr is None:
            fail("goal-reader-pipes")
        self.next_id = 2
        self._send(
            {
                "id": 1,
                "method": "initialize",
                "params": {
                    "capabilities": {"experimentalApi": True},
                    "clientInfo": {"name": "r9-native-goal-verifier", "version": "1"},
                },
            }
        )
        response = self._receive(1)
        if set(response) != {"id", "result"}:
            fail("goal-reader-init")
        self._send({"method": "initialized", "params": {}})

    def _send(self, value):
        self.process.stdin.write(canonical_no_lf(value).decode("utf-8") + "\n")
        self.process.stdin.flush()

    def _receive(self, request_id):
        deadline = time.monotonic() + 10
        while time.monotonic() < deadline:
            ready, _write, _error = select.select(
                [self.process.stdout, self.process.stderr], [], [], 0.25
            )
            for handle in ready:
                line = handle.readline()
                if handle is self.process.stderr:
                    if line:
                        fail(f"goal-reader-stderr:{line.strip()}")
                    continue
                if not line:
                    fail("goal-reader-eof")
                message = parse_json(line.encode("utf-8"), "goal-reader", False)
                if isinstance(message, dict) and message.get("id") == request_id:
                    return message
                if not isinstance(message, dict) or message.get("method") != "remoteControl/status/changed":
                    fail("goal-reader-unexpected")
        fail("goal-reader-timeout")

    def get(self, thread_id):
        request_id = self.next_id
        self.next_id += 1
        self._send(
            {
                "id": request_id,
                "method": "thread/goal/get",
                "params": {"threadId": thread_id},
            }
        )
        response = self._receive(request_id)
        if set(response) != {"id", "result"} or not isinstance(response.get("result"), dict):
            fail("goal-reader-response")
        result = response["result"]
        if set(result) != {"goal"} or not isinstance(result.get("goal"), dict):
            fail("goal-reader-result")
        return result["goal"]

    def close(self):
        try:
            self.process.stdin.close()
        except OSError:
            pass
        self.process.terminate()
        try:
            self.process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            self.process.kill()
            self.process.wait(timeout=5)


def assemble(recipe, results):
    kind = recipe.get("kind")
    if kind == "MODEL_FINAL_CANONICAL_ONE_FIELD_JSON":
        raw = results[recipe["dynamic_node"]].encode("utf-8")
        value = parse_json(raw, "assembly-final", False)
        if not isinstance(value, dict) or list(value) != [recipe["output_key"]] or value[recipe["output_key"]] not in recipe["allowed_values"] or raw != canonical_no_lf(value):
            fail("assembly-final")
        return raw
    if kind == "DETERMINISTIC_S50_ASSEMBLY_FROM_EIGHT_COMPACT_VERDICTS":
        fixed = recipe["fixed"]
        verdicts = []
        for edge in recipe["ordered_edge_items"]:
            code = results[edge["verdict_from_compact_node"]]
            if code not in {"S", "U"}:
                fail("assembly-s50")
            verdicts.append({"edge_id": edge["edge_id"], "source_decision_ids": edge["source_decision_ids"], "verdict": "supported" if code == "S" else "unsupported"})
        return canonical_no_lf({
            "protocol_id": fixed["protocol_id"],
            "stage": fixed["stage"],
            "topic_artifact_hashes": fixed["topic_artifact_hashes"],
            "checked_edge_ids": fixed["checked_edge_ids"],
            "edge_verdicts": verdicts,
            "claim_boundary": fixed["claim_boundary"],
            "external_audit_status": fixed["external_audit_status"],
            "forbidden_action_violations": fixed["forbidden_action_violations"],
        })
    if kind == "DETERMINISTIC_S60_ASSEMBLY_FROM_COMPACT_SPECIALIST_CODE":
        fixed = recipe["fixed"]
        code = results[recipe["compact_node"]]
        expected_class = {"provenance_gap": "P", "authority_conflation": "C", "counterfactual_failure": "K"}[fixed["classification"]]
        if code not in {f"S:{expected_class}", f"U:{expected_class}"}:
            fail("assembly-s60")
        return canonical_no_lf({
            "protocol_id": fixed["protocol_id"],
            "stage": fixed["stage"],
            "role": fixed["role"],
            "candidate_edge_id": fixed["candidate_edge_id"],
            "candidate_lineage_sha256": fixed["candidate_lineage_sha256"],
            "integration_candidate_sha256": fixed["integration_candidate_sha256"],
            "verdict": "supported" if code.startswith("S:") else "unsupported",
            "classification": fixed["classification"],
            "source_record_ids": fixed["source_record_ids"],
            "claim_boundary": fixed["claim_boundary"],
            "external_audit_status": fixed["external_audit_status"],
            "forbidden_action_violations": fixed["forbidden_action_violations"],
        })
    fail("assembly-kind")


def fixed_inputs():
    bind(HARNESS, HARNESS_ID, "harness")
    bind(MANIFEST, MANIFEST_ID, "manifest")
    bind(CANARY, CANARY_ID, "canary")
    bind(RUNNER, RUNNER_ID, "runner")
    runtime_raw = read_exact(CODEX_REAL, "codex-runtime", 0o755)
    if (
        len(runtime_raw) != RUNTIME_ID["bytes"]
        or sha(runtime_raw) != RUNTIME_ID["sha256"]
        or RUNTIME_ID["mode"] != "0755"
        or str(CODEX_REAL) != RUNTIME_ID["path"]
    ):
        fail("codex-runtime-identity")
    try:
        if not CODEX.is_symlink() or CODEX.resolve(strict=True) != CODEX_REAL:
            fail("codex-launcher-target")
    except OSError as exc:
        fail(f"codex-launcher:{type(exc).__name__}")
    version = subprocess.run(
        [str(CODEX), "--version"],
        cwd=REPO,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=10,
        check=False,
    )
    if (
        version.returncode != 0
        or version.stderr
        or version.stdout != (RUNTIME_ID["version"] + "\n").encode("utf-8")
    ):
        fail("codex-runtime-version")
    manifest = object_file(MANIFEST, "manifest-json")
    canary = object_file(CANARY, "canary-json")
    if manifest.get("qualification", {}).get("credit") != "0/2" or manifest.get("authority", {}).get("qualification") is not False:
        fail("manifest-authority")
    if canary.get("status") != "PASS_ROSTER_CANARY_ONLY_ZERO_CREDIT_NO_MATRIX_AUTHORITY":
        fail("canary-status")
    return load_schedule()


def self_identity():
    path = Path(__file__).resolve(strict=True)
    raw = read_exact(path, "self")
    return {
        "bytes": len(raw),
        "path": str(path.relative_to(REPO)),
        "sha256": sha(raw),
    }


def inventory_actual(root: Path):
    rows = []
    directories = set()
    for path in sorted(root.rglob("*")):
        relative = path.relative_to(root).as_posix()
        info = path.lstat()
        if stat.S_ISDIR(info.st_mode):
            if stat.S_IMODE(info.st_mode) != 0o755:
                fail(f"dir-mode:{relative}")
            directories.add(relative)
        elif stat.S_ISREG(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o644:
            if relative not in {"matrix_inventory.json", "matrix_terminal.json", "matrix_accounting.json"}:
                raw = read_exact(path.resolve(strict=True), f"inventory:{relative}")
                rows.append({"bytes": len(raw), "path": relative, "sha256": sha(raw)})
        else:
            fail(f"tree-type-mode:{relative}")
    return rows, directories


def previous_ids(root: Path):
    sessions = set()
    executions = set()
    for record_path in sorted(root.glob("tasks/wave-*/*/task.json")):
        record = object_file(record_path.resolve(strict=True), "previous-task")
        session = record.get("verification", {}).get("session_id")
        execution = record.get("execution_id")
        if not isinstance(session, str) or not isinstance(execution, str):
            fail("previous-ids")
        sessions.add(session)
        executions.add(execution)
    if len(sessions) != 15612 or len(executions) != 15612:
        fail("previous-id-count")
    return sessions, executions


def verify_run(matrix_id: str, root: Path, predecessor_root: Path | None):
    if matrix_id not in MATRICES or root != BASE / "evidence" / matrix_id:
        fail("verify-root")
    if not root.is_dir() or root.resolve(strict=True) != root or stat.S_IMODE(root.stat().st_mode) != 0o755:
        fail("verify-root-custody")
    schedule, scorer = fixed_inputs()
    run = object_file(root / "run.json", "run")
    expected_bindings = {"canary": CANARY_ID, "harness": HARNESS_ID, "manifest": MANIFEST_ID, "runner": RUNNER_ID}
    if (
        set(run)
        != {
            "admission",
            "authority",
            "bindings",
            "matrix_id",
            "pair_position",
            "qualification_credit",
            "route_order",
            "runtime",
            "schema_id",
            "status",
            "subject_task_count",
            "wave_count",
        }
        or
        run.get("schema_id") != RUN_SCHEMA
        or run.get("matrix_id") != matrix_id
        or run.get("pair_position") != MATRICES[matrix_id]
        or run.get("bindings") != expected_bindings
        or run.get("route_order") != list(ROUTE_ORDER)
        or run.get("subject_task_count") != 15612
        or run.get("wave_count") != 5204
        or run.get("qualification_credit") != 0
        or run.get("authority") is not False
        or run.get("runtime") != RUNTIME_ID
        or run.get("status") != "RUNNING_UNSCORED_ZERO_CREDIT"
    ):
        fail("run-fixed")
    admission_identity = run.get("admission")
    if not isinstance(admission_identity, dict) or set(admission_identity) != {"bytes", "path", "sha256"}:
        fail("run-admission-identity")
    admission_path = (REPO / admission_identity["path"]).resolve(strict=True)
    if admission_path != ADMISSIONS[matrix_id]:
        fail("admission-path")
    admission_raw = read_exact(admission_path, "admission")
    if len(admission_raw) != admission_identity["bytes"] or sha(admission_raw) != admission_identity["sha256"]:
        fail("admission-identity")
    admission = parse_json(admission_raw, "admission")
    if (
        not isinstance(admission, dict)
        or set(admission)
        != {
            "authority",
            "bindings",
            "matrix_id",
            "mechanical_validation",
            "pair_position",
            "predecessor_verification",
            "qualification_credit",
            "runtime",
            "schema_id",
            "status",
            "verification_component",
        }
        or admission.get("schema_id") != ADMISSION_SCHEMA
        or admission.get("authority") is not True
        or admission.get("matrix_id") != matrix_id
        or admission.get("pair_position") != MATRICES[matrix_id]
        or admission.get("bindings") != expected_bindings
        or admission.get("qualification_credit") != 0
        or admission.get("runtime") != RUNTIME_ID
        or admission.get("status") != "ADMIT_EXACT_MATRIX_ONCE"
    ):
        fail("admission-fixed")
    if admission.get("verification_component") != self_identity():
        fail("admission-verifier-identity")
    mechanical = admission.get("mechanical_validation")
    if (
        not isinstance(mechanical, dict)
        or set(mechanical) != {"bytes", "path", "sha256"}
        or mechanical.get("path")
        != "tests/r9g48/native_goal_slash_components_mechanical_validation_v2.json"
    ):
        fail("admission-mechanical-shape")
    mechanical_raw = read_exact((REPO / mechanical["path"]).resolve(strict=True), "mechanical")
    if len(mechanical_raw) != mechanical["bytes"] or sha(mechanical_raw) != mechanical["sha256"]:
        fail("admission-mechanical-identity")
    prior_sessions = set()
    prior_executions = set()
    if MATRICES[matrix_id] == 1:
        if predecessor_root is not None or admission.get("predecessor_verification") is not None:
            fail("first-predecessor")
    else:
        if predecessor_root != BASE / "evidence" / "codex-native-slash-goal-matrix-011":
            fail("second-predecessor-root")
        predecessor = admission.get("predecessor_verification")
        if (
            not isinstance(predecessor, dict)
            or set(predecessor) != {"bytes", "path", "sha256"}
            or predecessor.get("path") != str(PREDECESSOR_VERIFICATION.relative_to(REPO))
        ):
            fail("second-predecessor-verification-shape")
        predecessor_raw = read_exact(PREDECESSOR_VERIFICATION, "predecessor-verification")
        if (
            len(predecessor_raw) != predecessor["bytes"]
            or sha(predecessor_raw) != predecessor["sha256"]
        ):
            fail("second-predecessor-verification-identity")
        predecessor_receipt = parse_json(predecessor_raw, "predecessor-verification")
        if (
            not isinstance(predecessor_receipt, dict)
            or predecessor_receipt.get("matrix_id") != "codex-native-slash-goal-matrix-011"
            or predecessor_receipt.get("status") != "PASS_CLEAN_MATRIX_ZERO_QUALIFICATION_CREDIT"
            or predecessor_receipt.get("clean") is not True
            or predecessor_receipt.get("qualification_credit") != 0
        ):
            fail("second-predecessor-verification-status")
        prior_sessions, prior_executions = previous_ids(predecessor_root)
    state = defaultdict(dict)
    sessions = set()
    executions = set()
    cwds = set()
    recorded_goals = []
    for wave in range(5204):
        for route in ROUTE_ORDER:
            spec = schedule[route][wave]
            task_dir = root / "tasks" / f"wave-{wave:05d}" / spec.route_code
            if not task_dir.is_dir() or stat.S_IMODE(task_dir.stat().st_mode) != 0o755:
                fail(f"task-dir:{wave}:{route}")
            names = {path.name for path in task_dir.iterdir()}
            if names != {"rollout.jsonl.gz", "task.json", "tui.txt.gz"}:
                fail(f"task-files:{wave}:{route}")
            record = object_file(task_dir / "task.json", f"task:{wave}:{route}")
            if (
                set(record)
                != {
                    "atom_id",
                    "authority",
                    "capsule",
                    "cell",
                    "cell_index",
                    "cell_sha256",
                    "execution_id",
                    "first_mismatch",
                    "goal_command_bytes",
                    "goal_objective",
                    "goal_objective_sha256",
                    "kind",
                    "matrix_id",
                    "model_requested",
                    "qualification_credit",
                    "reasoning_effort_requested",
                    "result",
                    "route",
                    "route_code",
                    "schema_id",
                    "status",
                    "trace_copy",
                    "tui_copy",
                    "verification",
                    "wave",
                }
                or record.get("schema_id") != TASK_SCHEMA
                or record.get("status") != "PASS_ATOM_ZERO_CREDIT"
                or record.get("first_mismatch") is not None
                or record.get("authority") is not False
                or record.get("qualification_credit") != 0
            ):
                fail(f"task-status:{wave}:{route}")
            prior = {atom_id: state[(route, spec.cell_index)][atom_id] for atom_id in spec.node["dependencies"]}
            payload = materialize(spec.node, prior)
            capsule_raw = capsule(spec.node, payload)
            identifier = execution_id(matrix_id, route, wave, spec.cell_sha256, spec.atom_id, capsule_raw)
            expected_objective = objective(identifier, capsule_raw)
            expected_capsule = {"bytes": len(capsule_raw), "sha256": sha(capsule_raw), "utf8": capsule_raw.decode("utf-8")}
            if (
                record.get("atom_id") != spec.atom_id
                or record.get("capsule") != expected_capsule
                or record.get("cell") != spec.cell
                or record.get("cell_index") != spec.cell_index
                or record.get("cell_sha256") != spec.cell_sha256
                or record.get("execution_id") != identifier
                or record.get("goal_command_bytes") != len(("/goal " + expected_objective).encode("utf-8"))
                or record.get("goal_objective") != expected_objective
                or record.get("goal_objective_sha256") != sha(expected_objective.encode("utf-8"))
                or record.get("kind") != spec.node["kind"]
                or record.get("matrix_id") != matrix_id
                or record.get("model_requested") != spec.model
                or record.get("reasoning_effort_requested") != spec.effort
                or record.get("route") != route
                or record.get("route_code") != spec.route_code
                or record.get("wave") != wave
            ):
                fail(f"task-projection:{wave}:{route}")
            trace_gzip = read_exact(task_dir / "rollout.jsonl.gz", "trace-gzip")
            tui_gzip = read_exact(task_dir / "tui.txt.gz", "tui-gzip")
            try:
                trace_raw = gzip.decompress(trace_gzip)
                tui_raw = gzip.decompress(tui_gzip)
            except OSError:
                fail("gzip")
            if gzip.compress(trace_raw, compresslevel=9, mtime=0) != trace_gzip or gzip.compress(tui_raw, compresslevel=9, mtime=0) != tui_gzip:
                fail("gzip-canonical")
            if record.get("trace_copy") != {"bytes": len(trace_gzip), "raw_bytes": len(trace_raw), "raw_sha256": sha(trace_raw), "sha256": sha(trace_gzip)}:
                fail("trace-copy")
            if record.get("tui_copy") != {"bytes": len(tui_gzip), "raw_bytes": len(tui_raw), "raw_sha256": sha(tui_raw), "sha256": sha(tui_gzip)}:
                fail("tui-copy")
            session, cwd, result_text, goal = verify_trace(trace_raw, record, expected_objective, spec.model, spec.effort)
            result_projection = {"bytes": len(result_text.encode("utf-8")), "sha256": sha(result_text.encode("utf-8")), "utf8": result_text}
            if record.get("result") != result_projection:
                fail("result-projection")
            validate_result(spec.node, result_text)
            if session in sessions or session in prior_sessions or identifier in executions or identifier in prior_executions or cwd in cwds:
                fail("global-reuse")
            sessions.add(session)
            executions.add(identifier)
            cwds.add(cwd)
            recorded_goals.append((session, goal))
            state[(route, spec.cell_index)][spec.atom_id] = result_text
    if len(sessions) != 15612 or len(executions) != 15612 or len(cwds) != 15612:
        fail("global-count")
    assembly_rows = []
    seen_cells = set()
    for route in ROUTE_ORDER:
        for spec in schedule[route]:
            key = (route, spec.cell_index)
            if key in seen_cells:
                continue
            seen_cells.add(key)
            raw = assemble(spec.recipe, state[key])
            expected = scorer[spec.cell_index]
            if len(raw) != expected["expected_output_bytes"] or sha(raw) != expected["expected_output_sha256"] or raw.decode("utf-8") != expected["expected_output_utf8"]:
                fail(f"score:{spec.cell_index}:{route}")
            assembly_rows.append({"bytes": len(raw), "cell_index": spec.cell_index, "route": route, "sha256": sha(raw), "utf8": raw.decode("utf-8")})
    assembly = object_file(root / "assembly_results.json", "assembly")
    expected_assembly = {"matrix_id": matrix_id, "qualification_credit": 0, "rows": sorted(assembly_rows, key=lambda row: (row["route"], row["cell_index"])), "schema_id": "pw-r9-native-goal-slash-assembly-results-v1", "status": "UNSCORED"}
    if assembly != expected_assembly:
        fail("assembly-results")
    inventory = object_file(root / "matrix_inventory.json", "inventory")
    actual_rows, directories = inventory_actual(root)
    if inventory != {"entries": actual_rows, "matrix_id": matrix_id, "schema_id": INVENTORY_SCHEMA}:
        fail("inventory")
    expected_dirs = {"tasks"}
    for wave in range(5204):
        expected_dirs.add(f"tasks/wave-{wave:05d}")
        for code, _model, _effort in ROUTES.values():
            expected_dirs.add(f"tasks/wave-{wave:05d}/{code}")
    if directories != expected_dirs:
        fail("directories")
    terminal = object_file(root / "matrix_terminal.json", "terminal")
    inventory_raw = read_exact(root / "matrix_inventory.json", "inventory-raw")
    expected_terminal = {
        "assembly_count": 291,
        "authority": False,
        "completed_task_count": 15612,
        "expected_task_count": 15612,
        "first_mismatch": None,
        "inventory": {"bytes": len(inventory_raw), "sha256": sha(inventory_raw)},
        "matrix_id": matrix_id,
        "qualification_credit": 0,
        "schema_id": TERMINAL_SCHEMA,
        "status": "EXECUTION_COMPLETE_UNSCORED_ZERO_CREDIT",
    }
    if terminal != expected_terminal:
        fail("terminal")
    terminal_raw = read_exact(root / "matrix_terminal.json", "terminal-raw")
    accounting = object_file(root / "matrix_accounting.json", "accounting")
    expected_accounting = {
        "assembly_count": 291,
        "completed_task_count": 15612,
        "files_before_accounting": len(actual_rows) + 2,
        "matrix_id": matrix_id,
        "qualification_credit": 0,
        "relaunch_count": 0,
        "replacement_count": 0,
        "resend_count": 0,
        "retry_count": 0,
        "schema_id": ACCOUNTING_SCHEMA,
        "status": "EXECUTION_COMPLETE_UNSCORED_ZERO_CREDIT",
        "terminal": {"bytes": len(terminal_raw), "sha256": sha(terminal_raw)},
    }
    if accounting != expected_accounting:
        fail("accounting")
    goal_reader = GoalReader()
    try:
        for thread_id, recorded in recorded_goals:
            if goal_reader.get(thread_id) != recorded:
                fail(f"live-goal-drift:{thread_id}")
    finally:
        goal_reader.close()
    accounting_raw = read_exact(root / "matrix_accounting.json", "accounting-raw")
    return {
        "accounting": {"bytes": len(accounting_raw), "sha256": sha(accounting_raw)},
        "authority": False,
        "clean": True,
        "execution_id_set_sha256": sha(canonical_no_lf(sorted(executions))),
        "first_mismatch": None,
        "matrix_id": matrix_id,
        "qualification_credit": 0,
        "schema_id": SCHEMA,
        "session_id_set_sha256": sha(canonical_no_lf(sorted(sessions))),
        "status": "PASS_CLEAN_MATRIX_ZERO_QUALIFICATION_CREDIT",
        "verified_assembly_count": 291,
        "verified_task_count": 15612,
        "workspace_writes": 0,
    }


def check_static():
    schedule, scorer = fixed_inputs()
    return {
        "authority": False,
        "first_mismatch": None,
        "matrix_launch": False,
        "qualification_credit": 0,
        "route_atom_counts": {route: len(schedule[route]) for route in ROUTE_ORDER},
        "schema_id": SCHEMA,
        "scorer_cell_count": len(scorer),
        "status": "PASS_STATIC_INDEPENDENT_VERIFIER_ZERO_CREDIT_NO_LAUNCH_AUTHORITY",
        "subject_task_count": 15612,
        "verifier": {"mode": "0644", **self_identity()},
        "workspace_writes": 0,
    }


def parser():
    result = argparse.ArgumentParser(add_help=False)
    sub = result.add_subparsers(dest="command", required=True)
    check = sub.add_parser("check", add_help=False)
    check.add_argument("--check", action="store_true")
    verify = sub.add_parser("verify", add_help=False)
    verify.add_argument("--matrix-id", required=True)
    verify.add_argument("--run-root", required=True)
    verify.add_argument("--predecessor-root")
    return result


def main():
    try:
        args, extra = parser().parse_known_args()
        if extra:
            fail("CLI-extra")
        if args.command == "check":
            if not args.check:
                fail("CLI-check")
            output = check_static()
        else:
            predecessor = None if args.predecessor_root is None else Path(args.predecessor_root)
            output = verify_run(args.matrix_id, Path(args.run_root), predecessor)
        code = 0
    except (Invalid, OSError, ValueError, TypeError, KeyError, subprocess.SubprocessError) as exc:
        output = {
            "authority": False,
            "clean": False,
            "first_mismatch": str(exc),
            "qualification_credit": 0,
            "schema_id": SCHEMA,
            "status": "FAIL_ZERO_CREDIT_NO_QUALIFICATION_AUTHORITY",
            "workspace_writes": 0,
        }
        code = 1
    sys.stdout.buffer.write(canonical(output))
    return code


if __name__ == "__main__":
    raise SystemExit(main())
