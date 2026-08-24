#!/usr/bin/env python3
"""Reserve, capture, and verify one top-level Codex Desktop Goal probe."""

from __future__ import annotations

import argparse
import hashlib
import os
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import jsonschema

import r10_contract as contract
import r10_verify as shared

ROOT = Path(__file__).resolve().parent
EXPECTED_MANIFEST = "canary_004/manifest.json"
EXPECTED_COMMITMENT = "canary_004/manifest.commitment.json"
EXPECTED_EVIDENCE = "canary_004/r10-codex-app-canary-004-evidence"
EXPECTED_PROJECT = "/mnt/Cursor/PuppetMaster"
EXPECTED_PARENT_THREAD = "01a034b9-a1c8-7a80-937f-4e45e3f2ae45"
EXPECTED_PROJECT_ID = "c5745cb0-d3aa-4fe8-a5dd-cdadf6fff531"
EXPECTED_HOST_ID = "remote-ssh-discovered:pm-dev"
OWNED_PREFIX = "tests/agent_packet_restrictions/successor_20260813/r10_simple_goal_prompts_v1/"


class AppProbeError(ValueError):
    pass


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AppProbeError(message)


def sha256(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def canonical(value: Any) -> bytes:
    return contract.canonical_bytes(value)


def write_bytes_exclusive(path: Path, raw: bytes) -> None:
    fd = os.open(path, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o444)
    try:
        with os.fdopen(fd, "wb", closefd=False) as stream:
            stream.write(raw)
            stream.flush()
            os.fsync(stream.fileno())
    finally:
        os.close(fd)
    directory_fd = os.open(path.parent, os.O_RDONLY | os.O_DIRECTORY)
    try:
        os.fsync(directory_fd)
    finally:
        os.close(directory_fd)


def write_record(path: Path, value: Any) -> None:
    write_bytes_exclusive(path, canonical(value) + b"\n")


def parse_utc(value: Any, label: str) -> datetime:
    require(isinstance(value, str) and value.endswith("Z"), f"{label} UTC timestamp")
    try:
        parsed = datetime.fromisoformat(value[:-1] + "+00:00")
    except ValueError as exc:
        raise AppProbeError(f"{label} UTC timestamp") from exc
    require(parsed.tzinfo is not None, f"{label} timezone")
    return parsed


def run_git(*args: str) -> bytes:
    process = subprocess.run(
        ["git", *args],
        cwd=EXPECTED_PROJECT,
        check=False,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    require(process.returncode == 0, f"git {' '.join(args)}: {process.stderr.decode('utf-8', 'replace').strip()}")
    return process.stdout


def relative_owned(path: Path) -> str:
    try:
        return path.resolve(strict=True).relative_to(ROOT.resolve(strict=True)).as_posix()
    except (OSError, ValueError) as exc:
        raise AppProbeError(f"path outside R10 root: {path}") from exc


def load_pair(manifest_path: Path, commitment_path: Path) -> tuple[dict[str, Any], dict[str, Any], bytes, bytes]:
    require(relative_owned(manifest_path) == EXPECTED_MANIFEST, "manifest path")
    require(relative_owned(commitment_path) == EXPECTED_COMMITMENT, "commitment path")
    manifest_raw = manifest_path.read_bytes()
    commitment_raw = commitment_path.read_bytes()
    manifest = contract.load_json_bytes(manifest_raw, "app manifest")
    commitment = contract.load_json_bytes(commitment_raw, "app manifest commitment")
    require(isinstance(manifest, dict) and isinstance(commitment, dict), "manifest/commitment object")
    require(
        set(commitment) == {"schema_id", "run_id", "manifest_path", "manifest_utf8_bytes", "manifest_sha256"},
        "commitment key set",
    )
    require(commitment["schema_id"] == "pm.r10.manifest_commitment.v1", "commitment schema")
    require(commitment["run_id"] == manifest.get("run_id"), "commitment run join")
    require(commitment["manifest_path"] == EXPECTED_MANIFEST, "commitment manifest path")
    require(commitment["manifest_utf8_bytes"] == len(manifest_raw), "commitment manifest bytes")
    require(commitment["manifest_sha256"] == sha256(manifest_raw), "commitment manifest hash")
    return manifest, commitment, manifest_raw, commitment_raw


def launch_request(manifest: dict[str, Any], prompt: str) -> dict[str, Any]:
    row = manifest["row"]
    project = manifest["project"]
    return {
        "model": row["model"],
        "prompt": prompt,
        "target": {
            "environment": {"type": "local"},
            "projectId": project["project_id"],
            "type": "project",
        },
        "thinking": row["reasoning_effort"],
        "title": manifest["launcher"]["title"],
    }


def read_request(thread_id: str) -> dict[str, Any]:
    require(
        isinstance(thread_id, str)
        and re.fullmatch(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", thread_id) is not None,
        "child thread id",
    )
    return {
        "threadId": thread_id,
        "hostId": EXPECTED_HOST_ID,
        "turnLimit": 16,
        "includeOutputs": False,
        "maxOutputCharsPerItem": 8192,
    }


def validate_manifest(
    manifest_path: Path,
    commitment_path: Path,
    *,
    require_git: bool,
    require_absent_evidence: bool = True,
) -> dict[str, Any]:
    manifest, commitment, manifest_raw, commitment_raw = load_pair(manifest_path, commitment_path)
    require(
        set(manifest)
        == {
            "schema_id", "run_id", "kind", "status", "created_at_utc", "platform", "surface",
            "profile_id", "attempts_per_row", "retry", "replacement", "best_of", "qualification_credit",
            "qualification_streak", "project", "launcher", "row", "runtime_expected", "oracle_path",
            "evidence_root", "frozen_files", "acceptance", "nonclaims",
        },
        "manifest key set",
    )
    require(manifest["schema_id"] == "pm.r10.app_probe_manifest.v1", "manifest schema")
    require(manifest["run_id"] == "r10-codex-app-canary-004", "run identity")
    require(manifest["kind"] == "single_route_codex_desktop_goal_surface_probe", "run kind")
    require(manifest["status"] == "FROZEN_ZERO_CREDIT", "run status")
    require(manifest["platform"] == "codex", "platform")
    require(manifest["surface"] == "codex_desktop_top_level_project_task", "surface")
    require(manifest["profile_id"] == contract.PROFILE, "profile")
    require(manifest["attempts_per_row"] == 1, "attempt count")
    require(manifest["retry"] is False and manifest["replacement"] is False and manifest["best_of"] == 0, "retry policy")
    require(manifest["qualification_credit"] == 0 and manifest["qualification_streak"] == 0, "credit policy")
    parse_utc(manifest["created_at_utc"], "manifest creation")

    project = manifest["project"]
    require(
        project
        == {
            "project_id": EXPECTED_PROJECT_ID,
            "path": EXPECTED_PROJECT,
            "host_id": EXPECTED_HOST_ID,
            "is_git_repository": True,
            "environment": {"type": "local"},
        },
        "project binding",
    )
    launcher = manifest["launcher"]
    require(
        set(launcher) == {"tool", "parent_thread_id", "title", "external_message_count", "followup_message_count"},
        "launcher key set",
    )
    require(launcher["tool"] == "codex_app.create_thread", "launcher tool")
    require(launcher["parent_thread_id"] == EXPECTED_PARENT_THREAD, "parent thread")
    require(launcher["external_message_count"] == 1 and launcher["followup_message_count"] == 0, "message counts")
    require(isinstance(launcher["title"], str) and launcher["title"].startswith("R10-C4-"), "title")

    row = manifest["row"]
    require(
        set(row)
        == {
            "row_id", "route_id", "model", "reasoning_effort", "nonce", "capsule_path", "capsule_sha256",
            "response_schema_path", "submitted_user_prompt_utf8_bytes", "submitted_user_prompt_sha256",
        },
        "row key set",
    )
    require(row["row_id"] == "row-alpha-004" and row["route_id"] == "alpha", "row/route")
    require(row["model"] == "gpt-5.4-mini" and row["reasoning_effort"] == "xhigh", "requested route")
    require(row["nonce"] == "57382dbf267c964f1ec781cc15c3b3f9", "nonce")
    require(row["capsule_path"] == "canary_004/capsule.json", "capsule path")
    require(row["response_schema_path"] == "canary_004/response.schema.json", "response schema path")
    require(launcher["title"].endswith(row["nonce"][:12]), "title/nonce join")

    capsule = contract.load_json(ROOT / row["capsule_path"])
    capsule_schema = contract.load_json(ROOT / "prompt_capsule.schema.json")
    prompt, metrics = contract.render_prompt(capsule, "codex", capsule_schema)
    require(row["capsule_sha256"] == metrics["capsule_sha256"], "row capsule hash")
    require(row["submitted_user_prompt_utf8_bytes"] == metrics["prompt_utf8_bytes"], "row prompt bytes")
    require(row["submitted_user_prompt_sha256"] == metrics["prompt_sha256"], "row prompt hash")
    require(prompt.startswith("Create a goal that "), "ordinary Goal prefix")
    require("create_goal" not in prompt and "update_goal" not in prompt and "get_goal" not in prompt, "lifecycle API leaked into prompt")
    for phrase in contract.FORBIDDEN_SUBJECT_CHOREOGRAPHY:
        require(phrase not in prompt.lower(), f"forbidden subject choreography: {phrase}")

    response_schema = contract.load_json(ROOT / row["response_schema_path"])
    require(response_schema == capsule["output_contract"]["inline_schema"], "external/inline schema equality")
    contract.validate_provider_response_schema(response_schema)
    oracle = contract.load_json(ROOT / manifest["oracle_path"])
    require(set(oracle) == {capsule["unit_id"]}, "oracle denominator")
    result = oracle[capsule["unit_id"]]
    jsonschema.Draft202012Validator(response_schema).validate(result)
    require(result["source_ids"] == [result["selected_source_id"]], "oracle source set")
    require(set(result["source_ids"]).issubset(capsule["lineage"]["allowed_source_ids"]), "oracle lineage")

    request = launch_request(manifest, prompt)
    require(manifest["evidence_root"] == EXPECTED_EVIDENCE, "evidence path")
    evidence = ROOT / manifest["evidence_root"]
    if require_absent_evidence:
        require(not os.path.lexists(evidence), "designated evidence path already consumed")

    frozen = manifest["frozen_files"]
    require(isinstance(frozen, list) and frozen, "frozen files")
    paths = [item.get("path") for item in frozen]
    require(len(paths) == len(set(paths)), "duplicate frozen path")
    required_frozen = {
        "ARCHITECTURE.md", "prompt_capsule.schema.json", "r10_contract.py", "r10_verify.py",
        "r10_app_probe.py", "r10_app_selftest.py", "canary_004/response.schema.json",
        "canary_004/capsule.json", "canary_004/oracle.json",
    }
    require(set(paths) == required_frozen, "frozen denominator")
    for item in frozen:
        require(set(item) == {"path", "utf8_bytes", "sha256"}, f"frozen record shape: {item.get('path')}")
        path = ROOT / item["path"]
        require(path.is_file() and not path.is_symlink(), f"frozen file missing/symlink: {item['path']}")
        raw = path.read_bytes()
        raw.decode("utf-8")
        require(item["utf8_bytes"] == len(raw), f"frozen bytes: {item['path']}")
        require(item["sha256"] == sha256(raw), f"frozen hash: {item['path']}")

    acceptance = manifest["acceptance"]
    require(
        acceptance
        == {
            "external_user_submission_count": 1,
            "goal_create_count": 1,
            "goal_get_max": 4,
            "goal_terminal_count": 1,
            "goal_tool_call_max": 6,
            "goal_objective_max_utf8_bytes": 512,
            "goal_objective_allowed_prefixes": [
                ["complete", "bounded", "promptcapsule", "canary_evidence_04"],
                ["complete", "the", "bounded", "promptcapsule", "canary_evidence_04"],
                ["completes", "bounded", "promptcapsule", "canary_evidence_04"],
                ["completes", "the", "bounded", "promptcapsule", "canary_evidence_04"],
            ],
            "goal_objective_allowed_suffix_terms": [
                "and", "below", "json", "matching", "object", "one", "only", "output_contract.inline_schema",
                "produce", "produces", "required", "result", "return", "returns", "schema", "the", "typed",
            ],
            "same_goal_thread_identity": True,
            "activation_before_semantic_result": True,
            "app_create_event_count": 1,
            "app_terminal_read_event_count": 1,
            "app_wait_event_max": 8,
            "app_other_event_count": 0,
            "stable_rollout_reads": 2,
            "actual_tool_calls_subset": ["create_goal", "get_goal", "update_goal"],
            "non_goal_tool_calls": 0,
            "followup_messages": 0,
            "trace_observed_file_change_events": 0,
            "trace_observed_command_execution_events": 0,
            "schema_validation": "strict",
            "semantic_score": "exact_json_value",
            "deterministic_result_checks": ["source_ids_unique"],
            "required_pass": 1,
            "allowed_fail": 0,
        },
        "acceptance contract",
    )
    runtime = manifest["runtime_expected"]
    require(
        runtime
        == {
            "originator": "Codex Desktop",
            "source": "vscode",
            "thread_source": "user",
            "model_provider": "openai",
            "cwd": EXPECTED_PROJECT,
            "sandbox_policy": {"type": "danger-full-access"},
            "approval_policy": "never",
            "permission_profile": {"type": "disabled"},
        },
        "runtime expectation",
    )
    nonclaims = manifest["nonclaims"]
    require(isinstance(nonclaims, list) and len(nonclaims) >= 6 and all(isinstance(item, str) for item in nonclaims), "nonclaims")
    require(any("unsigned" in item and "trust boundary" in item for item in nonclaims), "unsigned-host nonclaim")

    if require_git:
        head = run_git("rev-parse", "HEAD").decode().strip()
        origin = run_git("rev-parse", "origin/main").decode().strip()
        require(head == origin, "HEAD/origin-main mismatch")
        for rel in [EXPECTED_MANIFEST, EXPECTED_COMMITMENT, *paths]:
            run_git("ls-files", "--error-unmatch", OWNED_PREFIX + rel)
            blob = run_git("show", f"HEAD:{OWNED_PREFIX}{rel}")
            require(blob == (ROOT / rel).read_bytes(), f"working bytes differ from HEAD: {rel}")
    else:
        head = None

    return {
        "manifest": manifest,
        "commitment": commitment,
        "manifest_raw": manifest_raw,
        "commitment_raw": commitment_raw,
        "capsule": capsule,
        "prompt": prompt,
        "metrics": metrics,
        "request": request,
        "oracle": oracle,
        "response_schema": response_schema,
        "head": head,
    }


def parse_rollout(raw: bytes, label: str) -> tuple[list[dict[str, Any]], list[bytes]]:
    lines = raw.splitlines(keepends=True)
    require(lines and all(line.endswith(b"\n") for line in lines), f"{label} incomplete final line")
    rows: list[dict[str, Any]] = []
    for number, line in enumerate(lines, 1):
        value = contract.load_json_bytes(line, f"{label} line {number}")
        require(isinstance(value, dict), f"{label} non-object line {number}")
        require(isinstance(value.get("ordinal"), int), f"{label} ordinal line {number}")
        rows.append(value)
    require(all(a["ordinal"] < b["ordinal"] for a, b in zip(rows, rows[1:])), f"{label} ordinal order")
    return rows, lines


def has_error_flag(value: Any) -> bool:
    if isinstance(value, dict):
        if value.get("isError") is True or value.get("is_error") is True:
            return True
        return any(has_error_flag(item) for item in value.values())
    if isinstance(value, list):
        return any(has_error_flag(item) for item in value)
    return False


def app_event_text(item: dict[str, Any], label: str) -> str:
    content = item.get("content_items")
    require(isinstance(content, list) and len(content) == 1, f"{label} result content count")
    part = content[0]
    require(
        isinstance(part, dict)
        and set(part) == {"type", "text"}
        and part.get("type") == "inputText"
        and isinstance(part.get("text"), str),
        f"{label} result content",
    )
    return part["text"]


def validate_wait_arguments(arguments: Any, thread_id: str) -> None:
    require(isinstance(arguments, dict) and set(arguments) == {"targets", "timeoutMs"}, "wait_threads arguments")
    timeout = arguments["timeoutMs"]
    require(isinstance(timeout, int) and not isinstance(timeout, bool) and 0 <= timeout <= 120000, "wait_threads timeout")
    targets = arguments["targets"]
    require(isinstance(targets, list) and len(targets) == 1 and isinstance(targets[0], dict), "wait_threads target")
    target = targets[0]
    require(set(target).issubset({"threadId", "hostId", "afterCursor"}), "wait_threads target keys")
    require(set(target).issuperset({"threadId", "hostId"}), "wait_threads target identity keys")
    require(target["threadId"] == thread_id and target["hostId"] == EXPECTED_HOST_ID, "wait_threads target identity")
    if "afterCursor" in target:
        require(isinstance(target["afterCursor"], str) and target["afterCursor"], "wait_threads cursor")


def parent_event_projection(raw: bytes, bundle: dict[str, Any], reservation: dict[str, Any]) -> dict[str, Any]:
    rows, _lines = parse_rollout(raw, "parent rollout")
    sessions = [row.get("payload", {}) for row in rows if row.get("type") == "session_meta"]
    require(len(sessions) == 1, "parent session_meta count")
    session = sessions[0]
    require(session.get("id") == session.get("session_id") == EXPECTED_PARENT_THREAD, "parent session identity")
    require(
        session.get("originator") == "Codex Desktop"
        and session.get("source") == "vscode"
        and session.get("thread_source") == "user"
        and session.get("model_provider") == "openai",
        "parent runtime",
    )
    prefix_bytes = reservation["parent_rollout_prefix_bytes"]
    require(len(raw) >= prefix_bytes, "parent rollout shorter than reservation")
    require(sha256(raw[:prefix_bytes]) == reservation["parent_rollout_prefix_sha256"], "parent prefix drift")
    prefix_rows, _prefix_lines = parse_rollout(raw[:prefix_bytes], "reserved parent prefix")
    baseline = reservation["parent_rollout_last_ordinal"]
    require(prefix_rows[-1]["ordinal"] == baseline, "parent prefix ordinal")

    events: list[tuple[int, dict[str, Any]]] = []
    for row in rows:
        if row["ordinal"] <= baseline or row.get("type") != "event_msg":
            continue
        payload = row.get("payload", {})
        item = payload.get("item")
        if not isinstance(item, dict) or item.get("type") != "DynamicToolCall" or item.get("namespace") != "codex_app":
            continue
        require(payload.get("type") == "item_completed", "parent app event terminality")
        require(payload.get("thread_id") == EXPECTED_PARENT_THREAD, "parent app event thread")
        event_id = item.get("id")
        require(isinstance(event_id, str) and event_id, "parent app event id")
        events.append((row["ordinal"], item))
    require(events, "parent app event window absent")
    event_ids = [item["id"] for _ordinal, item in events]
    require(len(event_ids) == len(set(event_ids)), "duplicate parent app event id")
    tools = [item.get("tool") for _ordinal, item in events]
    require(tools[0] == "create_thread" and tools[-1] == "read_thread", "parent app event endpoints")
    require(tools.count("create_thread") == 1 and tools.count("read_thread") == 1, "parent create/read denominator")
    require(all(tool in {"create_thread", "wait_threads", "read_thread"} for tool in tools), "disallowed parent app event")
    require(all(tool == "wait_threads" for tool in tools[1:-1]), "parent app event order")
    require(len(tools) - 2 <= bundle["manifest"]["acceptance"]["app_wait_event_max"], "wait_threads event ceiling")

    create_ordinal, create_item = events[0]
    require(create_item.get("status") == "completed" and create_item.get("success") is True, "create_thread event failure")
    require(not has_error_flag(create_item), "create_thread event error")
    require(create_item.get("arguments") == bundle["request"], "create_thread arguments")
    create_raw = app_event_text(create_item, "create_thread")
    create_result = contract.load_json_text(create_raw, "create_thread result")
    require(isinstance(create_result, dict) and set(create_result) == {"threadId", "hostId"}, "create_thread result shape")
    thread_id = create_result.get("threadId")
    read_request(thread_id)
    require(create_result.get("hostId") == EXPECTED_HOST_ID, "create_thread host")
    for _ordinal, item in events[1:-1]:
        validate_wait_arguments(item.get("arguments"), thread_id)

    read_ordinal, read_item = events[-1]
    require(read_item.get("status") == "completed" and read_item.get("success") is True, "read_thread event failure")
    require(not has_error_flag(read_item), "read_thread event error")
    require(read_item.get("arguments") == read_request(thread_id), "read_thread arguments")
    read_raw = app_event_text(read_item, "read_thread")
    read_result = contract.load_json_text(read_raw, "read_thread result")
    require(isinstance(read_result, dict) and read_result.get("schemaVersion") == 1, "read_thread result")
    return {
        "thread_id": thread_id,
        "host_id": EXPECTED_HOST_ID,
        "create_result": create_result,
        "create_result_raw": create_raw.encode("utf-8"),
        "terminal_response": read_result,
        "terminal_response_raw": read_raw.encode("utf-8"),
        "create_event_id": create_item["id"],
        "create_event_ordinal": create_ordinal,
        "terminal_read_event_id": read_item["id"],
        "terminal_read_event_ordinal": read_ordinal,
        "wait_event_count": len(events) - 2,
        "app_event_count": len(events),
    }


def locate_rollout(thread_id: str) -> Path:
    require(isinstance(thread_id, str) and thread_id and "/" not in thread_id, "thread id")
    directory = Path("/home/sittingmongoose/.codex/sessions")
    matches = [path for path in directory.rglob(f"*{thread_id}*.jsonl") if path.is_file()] if directory.is_dir() else []
    unique = {path.resolve(strict=True) for path in matches}
    require(len(unique) == 1, "rollout path count")
    return next(iter(unique))


def item_text(item: dict[str, Any]) -> str:
    if isinstance(item.get("text"), str):
        return item["text"]
    content = item.get("content")
    if not isinstance(content, list):
        return ""
    return "".join(part["text"] for part in content if isinstance(part, dict) and isinstance(part.get("text"), str))


def validate_terminal_response(
    response: dict[str, Any],
    manifest: dict[str, Any],
    thread_id: str,
    prompt: str,
    expected_result: dict[str, Any],
    expected_turn_ids: list[str],
    semantic_turn: str | None = None,
) -> None:
    require(response.get("schemaVersion") == 1, "terminal response schema")
    thread = response.get("thread")
    require(isinstance(thread, dict), "terminal thread")
    require(thread.get("id") == thread_id and thread.get("hostId") == EXPECTED_HOST_ID and thread.get("kind") == "codex", "terminal thread identity")
    require(thread.get("title") == manifest["launcher"]["title"] and thread.get("cwd") == EXPECTED_PROJECT, "terminal title/cwd")
    require(thread.get("archived") in {None, False} and thread.get("isArchived") in {None, False}, "archived terminal task")
    status = thread.get("status")
    require(
        isinstance(status, dict)
        and status.get("type") == "idle"
        and set(status).issubset({"type", "activeFlags"})
        and status.get("activeFlags", []) == [],
        "app task not terminal idle",
    )
    page = response.get("page")
    require(
        isinstance(page, dict)
        and page.get("order") == "newest_first"
        and page.get("hasMore") is False
        and page.get("nextCursor") is None,
        "terminal turn denominator",
    )
    turns = response.get("turns")
    require(isinstance(turns, list) and 1 <= len(turns) <= read_request(thread_id)["turnLimit"], "terminal turns")
    turn_ids = [turn.get("id") for turn in turns if isinstance(turn, dict)]
    require(len(turn_ids) == len(turns) and all(isinstance(item, str) and item for item in turn_ids), "terminal turn ids")
    require(len(turn_ids) == len(set(turn_ids)) and turn_ids == list(reversed(expected_turn_ids)), "terminal/raw turn denominator")
    if semantic_turn is not None:
        require(turn_ids[0] == semantic_turn, "terminal semantic turn join")
    require(
        all(
            turn.get("status") == "completed"
            and turn.get("error") is None
            and isinstance(turn.get("completedAt"), int)
            for turn in turns
        ),
        "terminal turn status",
    )
    items = [item for turn in turns for item in turn.get("items", []) if isinstance(item, dict)]
    user_texts = [item_text(item) for item in items if item.get("type") == "userMessage"]
    require(user_texts == [prompt], "terminal external submission projection")
    expected_text = canonical(expected_result).decode("utf-8")
    agent_texts = [item_text(item) for item in items if item.get("type") == "agentMessage"]
    newest_agents = [item_text(item) for item in turns[0].get("items", []) if isinstance(item, dict) and item.get("type") == "agentMessage"]
    require(newest_agents and newest_agents[-1] == expected_text, "terminal app final projection")
    require(agent_texts.count(expected_text) == 1, "terminal app typed-result count")


def snapshot_paths(manifest: dict[str, Any]) -> list[str]:
    return [EXPECTED_MANIFEST, EXPECTED_COMMITMENT, *[item["path"] for item in manifest["frozen_files"]]]


def reservation_record(bundle: dict[str, Any], parent_raw: bytes, parent_last_ordinal: int) -> dict[str, Any]:
    manifest = bundle["manifest"]
    request_raw = canonical(bundle["request"])
    return {
        "schema_id": "pm.r10.app_launch_reservation.v2",
        "run_id": manifest["run_id"],
        "row_id": manifest["row"]["row_id"],
        "reserved_at_utc": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "launch_head": bundle["head"],
        "manifest_sha256": sha256(bundle["manifest_raw"]),
        "commitment_sha256": sha256(bundle["commitment_raw"]),
        "prompt_utf8_bytes": bundle["metrics"]["prompt_utf8_bytes"],
        "prompt_sha256": bundle["metrics"]["prompt_sha256"],
        "launch_request_utf8_bytes": len(request_raw),
        "launch_request_sha256": sha256(request_raw),
        "parent_rollout_prefix_bytes": len(parent_raw),
        "parent_rollout_prefix_sha256": sha256(parent_raw),
        "parent_rollout_last_ordinal": parent_last_ordinal,
        "snapshot_file_count": len(snapshot_paths(manifest)),
        "subject_call_lower_bound": 0,
        "status": "RESERVED_ZERO_SUBJECT",
        "qualification_credit": 0,
    }


def validate_reservation(evidence: Path, bundle: dict[str, Any]) -> dict[str, Any]:
    require(evidence.is_dir() and not evidence.is_symlink(), "reserved evidence directory")
    reservation = contract.load_json(evidence / "reservation.json")
    require(
        set(reservation)
        == {
            "schema_id", "run_id", "row_id", "reserved_at_utc", "launch_head", "manifest_sha256",
            "commitment_sha256", "prompt_utf8_bytes", "prompt_sha256", "launch_request_utf8_bytes",
            "launch_request_sha256", "parent_rollout_prefix_bytes", "parent_rollout_prefix_sha256",
            "parent_rollout_last_ordinal", "snapshot_file_count", "subject_call_lower_bound", "status",
            "qualification_credit",
        },
        "reservation key set",
    )
    manifest = bundle["manifest"]
    require(reservation["schema_id"] == "pm.r10.app_launch_reservation.v2", "reservation schema")
    require(reservation["run_id"] == manifest["run_id"] and reservation["row_id"] == manifest["row"]["row_id"], "reservation identity")
    require(reservation["launch_head"] == bundle["head"], "reservation HEAD")
    require(reservation["manifest_sha256"] == sha256(bundle["manifest_raw"]), "reservation manifest")
    require(reservation["commitment_sha256"] == sha256(bundle["commitment_raw"]), "reservation commitment")
    require(reservation["prompt_utf8_bytes"] == bundle["metrics"]["prompt_utf8_bytes"], "reservation prompt bytes")
    require(reservation["prompt_sha256"] == bundle["metrics"]["prompt_sha256"], "reservation prompt hash")
    request_raw = (evidence / "launch_request.json").read_bytes()
    require(request_raw == canonical(bundle["request"]), "reserved launch request")
    require(reservation["launch_request_utf8_bytes"] == len(request_raw), "reservation request bytes")
    require(reservation["launch_request_sha256"] == sha256(request_raw), "reservation request hash")
    prefix_raw = (evidence / "parent_prefix.raw.jsonl").read_bytes()
    require(reservation["parent_rollout_prefix_bytes"] == len(prefix_raw), "reservation parent bytes")
    require(reservation["parent_rollout_prefix_sha256"] == sha256(prefix_raw), "reservation parent hash")
    prefix_rows, _lines = parse_rollout(prefix_raw, "reserved parent prefix")
    require(reservation["parent_rollout_last_ordinal"] == prefix_rows[-1]["ordinal"], "reservation parent ordinal")
    parse_utc(reservation["reserved_at_utc"], "reservation")
    require(reservation["snapshot_file_count"] == len(snapshot_paths(manifest)), "reservation snapshot count")
    require(reservation["subject_call_lower_bound"] == 0 and reservation["status"] == "RESERVED_ZERO_SUBJECT", "reservation status")
    require(reservation["qualification_credit"] == 0, "reservation credit")
    snapshot = evidence / "frozen_snapshot"
    for rel in snapshot_paths(manifest):
        require((snapshot / rel).read_bytes() == (ROOT / rel).read_bytes(), f"reservation snapshot drift: {rel}")
    return reservation


def reserve(bundle: dict[str, Any], parent_rollout_path: Path | None = None) -> dict[str, Any]:
    manifest = bundle["manifest"]
    evidence = ROOT / manifest["evidence_root"]
    require(not os.path.lexists(evidence), "designated evidence path already consumed")
    parent_path = locate_rollout(EXPECTED_PARENT_THREAD) if parent_rollout_path is None else parent_rollout_path
    parent_raw = parent_path.read_bytes()
    parent_rows, _lines = parse_rollout(parent_raw, "parent rollout at reservation")
    sessions = [row.get("payload", {}) for row in parent_rows if row.get("type") == "session_meta"]
    require(len(sessions) == 1, "reservation parent session count")
    require(sessions[0].get("id") == sessions[0].get("session_id") == EXPECTED_PARENT_THREAD, "reservation parent session")
    require(
        sessions[0].get("originator") == "Codex Desktop"
        and sessions[0].get("source") == "vscode"
        and sessions[0].get("thread_source") == "user"
        and sessions[0].get("model_provider") == "openai",
        "reservation parent runtime",
    )
    evidence.mkdir(mode=0o755, parents=False, exist_ok=False)
    try:
        snapshot = evidence / "frozen_snapshot"
        snapshot.mkdir(mode=0o755)
        for rel in snapshot_paths(manifest):
            destination = snapshot / rel
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / rel, destination)
            destination.chmod(0o444)
        write_bytes_exclusive(evidence / "parent_prefix.raw.jsonl", parent_raw)
        write_bytes_exclusive(evidence / "launch_request.json", canonical(bundle["request"]))
        record = reservation_record(bundle, parent_raw, parent_rows[-1]["ordinal"])
        write_record(evidence / "reservation.json", record)
        return record
    except BaseException as exc:
        try:
            write_record(
                evidence / "reservation_failure.json",
                {
                    "schema_id": "pm.r10.app_launch_reservation_failure.v2",
                    "run_id": manifest["run_id"],
                    "row_id": manifest["row"]["row_id"],
                    "error": f"{type(exc).__name__}: {exc}",
                    "status": "FAIL_RESERVED_ZERO_SUBJECT_NO_REUSE",
                    "qualification_credit": 0,
                },
            )
        except OSError:
            pass
        raise


def record_capture_failure(evidence: Path, exc: BaseException) -> None:
    if not evidence.is_dir() or evidence.is_symlink():
        return
    if os.path.lexists(evidence / "capture.json") or os.path.lexists(evidence / "capture_failure.json"):
        return
    preserved: dict[str, dict[str, Any]] = {}
    for name in (
        "parent_capture.raw.jsonl", "create_result.raw.json", "terminal_read_result.raw.json",
        "rollout.read1.jsonl", "rollout.read2.jsonl",
    ):
        path = evidence / name
        if path.is_file() and not path.is_symlink():
            raw = path.read_bytes()
            preserved[name] = {"bytes": len(raw), "sha256": sha256(raw)}
    try:
        write_record(
            evidence / "capture_failure.json",
            {
                "schema_id": "pm.r10.app_capture_failure.v2",
                "run_id": "r10-codex-app-canary-004",
                "row_id": "row-alpha-004",
                "error": f"{type(exc).__name__}: {exc}",
                "preserved_files": preserved,
                "status": "FAIL_CONSUMED_ZERO_CREDIT_NO_RETRY",
                "qualification_credit": 0,
            },
        )
    except OSError:
        pass


def capture(bundle: dict[str, Any], parent_rollout_path: Path | None = None) -> dict[str, Any]:
    manifest = bundle["manifest"]
    evidence = ROOT / manifest["evidence_root"]
    try:
        require(not os.path.lexists(evidence / "capture.json"), "capture already complete")
        require(not os.path.lexists(evidence / "capture_failure.json"), "capture already failed")
        reservation = validate_reservation(evidence, bundle)
        parent_path = locate_rollout(EXPECTED_PARENT_THREAD) if parent_rollout_path is None else parent_rollout_path
        parent_raw = parent_path.read_bytes()
        write_bytes_exclusive(evidence / "parent_capture.raw.jsonl", parent_raw)
        projection = parent_event_projection(parent_raw, bundle, reservation)
        write_bytes_exclusive(evidence / "create_result.raw.json", projection["create_result_raw"])
        write_bytes_exclusive(evidence / "terminal_read_result.raw.json", projection["terminal_response_raw"])

        child_path = locate_rollout(projection["thread_id"])
        child_first = child_path.read_bytes()
        write_bytes_exclusive(evidence / "rollout.read1.jsonl", child_first)
        child_second = child_path.read_bytes()
        write_bytes_exclusive(evidence / "rollout.read2.jsonl", child_second)
        require(child_first == child_second, "child rollout changed between stable reads")
        trace, _lines = parse_rollout(child_first, "captured child rollout")
        intervals = shared.task_intervals(trace)
        ordered_turn_ids = [item[0] for item in sorted(intervals.items(), key=lambda item: item[1][0])]
        validate_terminal_response(
            projection["terminal_response"],
            manifest,
            projection["thread_id"],
            bundle["prompt"],
            bundle["oracle"][bundle["capsule"]["unit_id"]],
            ordered_turn_ids,
        )
        record = {
            "schema_id": "pm.r10.app_capture.v2",
            "run_id": manifest["run_id"],
            "row_id": manifest["row"]["row_id"],
            "thread_id": projection["thread_id"],
            "host_id": projection["host_id"],
            "launch_head": reservation["launch_head"],
            "manifest_sha256": sha256(bundle["manifest_raw"]),
            "commitment_sha256": sha256(bundle["commitment_raw"]),
            "reservation_sha256": sha256((evidence / "reservation.json").read_bytes()),
            "parent_capture_bytes": len(parent_raw),
            "parent_capture_sha256": sha256(parent_raw),
            "create_result_bytes": len(projection["create_result_raw"]),
            "create_result_sha256": sha256(projection["create_result_raw"]),
            "terminal_read_result_bytes": len(projection["terminal_response_raw"]),
            "terminal_read_result_sha256": sha256(projection["terminal_response_raw"]),
            "rollout_read1_bytes": len(child_first),
            "rollout_read1_sha256": sha256(child_first),
            "rollout_read2_bytes": len(child_second),
            "rollout_read2_sha256": sha256(child_second),
            "create_event_id": projection["create_event_id"],
            "create_event_ordinal": projection["create_event_ordinal"],
            "terminal_read_event_id": projection["terminal_read_event_id"],
            "terminal_read_event_ordinal": projection["terminal_read_event_ordinal"],
            "wait_event_count": projection["wait_event_count"],
            "app_event_count": projection["app_event_count"],
            "snapshot_file_count": len(snapshot_paths(manifest)),
            "subject_call_lower_bound": 1,
            "status": "CAPTURED_UNVERIFIED",
            "qualification_credit": 0,
        }
        write_record(evidence / "capture.json", record)
        return record
    except BaseException as exc:
        record_capture_failure(evidence, exc)
        raise


def response_user_texts(
    trace: list[dict[str, Any]],
    prompt: str,
    intervals: dict[str, tuple[int, int]],
    external_turn: str,
) -> None:
    exact = 0
    continuation_turns: list[str] = []
    first_start = min(start for start, _end in intervals.values())
    for row in trace:
        if row.get("type") != "response_item":
            continue
        payload = row.get("payload", {})
        if payload.get("type") != "message" or payload.get("role") != "user":
            continue
        text = shared.message_text(payload)
        if text == prompt:
            require(shared.turn_id(payload) == external_turn, "prompt response turn")
            shared.require_inside(intervals, external_turn, row["ordinal"], "prompt response")
            exact += 1
            continue
        if text.startswith("<recommended_plugins>"):
            require(row["ordinal"] < first_start and shared.turn_id(payload) is None, "platform bootstrap placement")
            continue
        if text.startswith('<codex_internal_context source="goal">'):
            current_turn = shared.turn_id(payload)
            require(text.endswith("</codex_internal_context>"), "Goal continuation envelope")
            require(current_turn in intervals and current_turn != external_turn, "Goal continuation turn")
            shared.require_inside(intervals, current_turn, row["ordinal"], "Goal continuation")
            continuation_turns.append(current_turn)
            continue
        raise AppProbeError("unexpected user-role message")
    require(exact == 1, "exact prompt user-role count")
    expected_continuations = set(intervals) - {external_turn}
    require(len(continuation_turns) == len(set(continuation_turns)), "duplicate Goal continuation turn")
    require(set(continuation_turns) == expected_continuations, "Goal continuation/task denominator")


def validate_event_projection(
    trace: list[dict[str, Any]],
    intervals: dict[str, tuple[int, int]],
    thread_id: str,
) -> None:
    allowed_rows = {"session_meta", "world_state", "turn_context", "event_msg", "response_item"}
    allowed_events = {"task_started", "task_complete", "token_count", "agent_message", "item_started", "item_completed"}
    allowed_responses = {"message", "reasoning", "custom_tool_call", "custom_tool_call_output"}
    allowed_items = {"UserMessage", "Reasoning", "AgentMessage", "ContextCompaction"}
    started: dict[str, tuple[str, str, int]] = {}
    completed: dict[str, tuple[str, str, int]] = {}
    for row in trace:
        require(row.get("type") in allowed_rows, "unsupported child record type")
        if row.get("type") == "world_state":
            payload = row.get("payload")
            require(
                isinstance(payload, dict)
                and set(payload) == {"full", "state"}
                and isinstance(payload.get("full"), bool)
                and isinstance(payload.get("state"), dict),
                "world_state shape",
            )
        if row.get("type") in {"session_meta", "turn_context"}:
            require(row.get("payload", {}).get("type") is None, "action-shaped metadata record")
        if row.get("type") == "response_item":
            require(row.get("payload", {}).get("type") in allowed_responses, "unsupported child response item")
        if row.get("type") != "event_msg":
            continue
        payload = row.get("payload", {})
        event_type = payload.get("type")
        require(event_type in allowed_events, "unsupported child event type")
        if event_type in {"task_started", "task_complete"}:
            require(payload.get("thread_id") == thread_id, "task lifecycle thread identity")
        item = payload.get("item")
        if item is not None:
            require(event_type in {"item_started", "item_completed"}, "item on non-item child event")
            require(isinstance(item, dict) and item.get("type") in allowed_items, "event-only or disallowed item")
        if event_type not in {"item_started", "item_completed"}:
            continue
        require(payload.get("thread_id") == thread_id, "item event thread identity")
        current_turn = shared.turn_id(payload)
        shared.require_inside(intervals, current_turn, row["ordinal"], "item event")
        require(isinstance(item, dict) and item.get("type") in allowed_items, "event-only or disallowed item")
        item_id = item.get("id")
        require(isinstance(item_id, str) and item_id, "item event id")
        record = (current_turn, item["type"], row["ordinal"])
        target = started if event_type == "item_started" else completed
        require(item_id not in target, f"duplicate {event_type} item")
        target[item_id] = record
    for item_id, (current_turn, item_type, start_ordinal) in started.items():
        require(item_id in completed, "started item lacks completion")
        complete_turn, complete_type, complete_ordinal = completed[item_id]
        require(
            current_turn == complete_turn and item_type == complete_type and start_ordinal < complete_ordinal,
            "item lifecycle mismatch",
        )


def objective_tokens(value: str) -> list[str]:
    return re.findall(r"[a-z0-9_]+(?:\.[a-z0-9_]+)*", value.lower())


def verify_trace(
    manifest: dict[str, Any],
    prompt: str,
    trace: list[dict[str, Any]],
    oracle: dict[str, Any],
    response_schema: dict[str, Any],
    thread_id: str,
    launch_head: str,
) -> dict[str, Any]:
    sessions = [row["payload"] for row in trace if row.get("type") == "session_meta"]
    require(len(sessions) == 1, "session_meta count")
    session = sessions[0]
    require(session.get("id") == session.get("session_id") == thread_id, "session/thread identity")
    expected_runtime = manifest["runtime_expected"]
    for key in ("originator", "source", "thread_source", "model_provider", "cwd"):
        require(session.get(key) == expected_runtime[key], f"session {key}")
    require(isinstance(session.get("git"), dict) and session["git"].get("commit_hash") == launch_head, "session launch commit")

    intervals = shared.task_intervals(trace)
    validate_event_projection(trace, intervals, thread_id)
    submissions = shared.completed_user_submissions(trace)
    require(len(submissions) == 1, "exactly one authoritative external submission")
    external = submissions[0]
    require(external["text"] == prompt and external["thread_id"] == thread_id, "external prompt bytes/thread")
    shared.require_inside(intervals, external["turn_id"], external["ordinal"], "external prompt")
    response_user_texts(trace, prompt, intervals, external["turn_id"])
    require(not any(row.get("type") == "inter_agent_communication_metadata" for row in trace), "inter-agent provenance present")
    require(not any(row.get("type") == "response_item" and row.get("payload", {}).get("type") == "agent_message" for row in trace), "inter-agent task envelope present")

    contexts = [row for row in trace if row.get("type") == "turn_context"]
    require(len(contexts) == len(intervals), "turn context denominator")
    seen_turns: set[str] = set()
    for row in contexts:
        payload = row["payload"]
        current_turn = shared.turn_id(payload)
        require(current_turn in intervals and current_turn not in seen_turns, "turn context identity")
        seen_turns.add(current_turn)
        shared.require_inside(intervals, current_turn, row["ordinal"], "turn context")
        require(payload.get("model") == manifest["row"]["model"], "effective model")
        require(payload.get("effort") == manifest["row"]["reasoning_effort"], "effective effort")
        require(payload.get("cwd") == expected_runtime["cwd"], "effective cwd")
        roots = payload.get("workspace_roots")
        require(isinstance(roots, list) and roots and roots[0] == expected_runtime["cwd"], "workspace root")
        require(
            all(
                item == expected_runtime["cwd"]
                or (isinstance(item, str) and item.startswith("/home/sittingmongoose/.codex/visualizations/") and item.endswith("/" + thread_id))
                for item in roots
            ),
            "unexpected workspace root",
        )
        require(payload.get("sandbox_policy") == expected_runtime["sandbox_policy"], "effective sandbox")
        require(payload.get("approval_policy") == expected_runtime["approval_policy"], "effective approval")
        require(payload.get("permission_profile") == expected_runtime["permission_profile"], "effective permission")
    require(seen_turns == set(intervals), "turn context/task join")

    calls, outputs = shared.tool_projection(trace)
    by_tool = {name: [call for call in calls if call["tool"] == name] for name in shared.GOAL_TOOLS}
    require(len(by_tool["create_goal"]) == 1, "create_goal count")
    require(len(by_tool["update_goal"]) == 1, "update_goal count")
    require(len(by_tool["get_goal"]) <= 4 and len(calls) <= 6, "Goal tool ceiling")
    create = by_tool["create_goal"][0]
    update = by_tool["update_goal"][0]
    require(external["turn_id"] == create["turn_id"] and external["ordinal"] < create["ordinal"], "prompt/create causality")
    for call in calls:
        output = outputs[call["call_id"]]
        require(not has_error_flag(output["payload"]), "Goal tool output error")
        require(call["ordinal"] < output["ordinal"], "tool call/output order")
        require(call["turn_id"] == output["turn_id"], "tool call/output turn")
        shared.require_inside(intervals, call["turn_id"], call["ordinal"], "Goal call")
        shared.require_inside(intervals, output["turn_id"], output["ordinal"], "Goal output")

    create_output = outputs[create["call_id"]]
    update_output = outputs[update["call_id"]]
    active_goal = shared.goal_from_output(create_output["payload"])
    complete_goal = shared.goal_from_output(update_output["payload"])
    require(active_goal is not None and complete_goal is not None, "Goal receipts")
    require(active_goal.get("status") == "active" and complete_goal.get("status") == "complete", "Goal states")
    require(active_goal.get("threadId") == complete_goal.get("threadId") == thread_id, "Goal/thread identity")
    require(active_goal.get("objective") == create["args"]["objective"] == complete_goal.get("objective"), "Goal objective")
    require(active_goal.get("createdAt") == complete_goal.get("createdAt") and isinstance(active_goal.get("createdAt"), int), "Goal creation identity")
    require(active_goal.get("updatedAt") <= complete_goal.get("updatedAt"), "Goal receipt time order")
    unit_id = manifest["row"].get("unit_id", "canary_evidence_04")
    require(unit_id in active_goal["objective"], "Goal objective lacks unit id")
    require(len(active_goal["objective"].encode("utf-8")) <= manifest["acceptance"]["goal_objective_max_utf8_bytes"], "Goal objective byte ceiling")
    tokens = objective_tokens(active_goal["objective"])
    prefixes = manifest["acceptance"]["goal_objective_allowed_prefixes"]
    matches = [prefix for prefix in prefixes if tokens[: len(prefix)] == prefix]
    require(len(matches) == 1, "Goal objective positive capsule prefix")
    require(
        set(tokens[len(matches[0]) :]).issubset(manifest["acceptance"]["goal_objective_allowed_suffix_terms"]),
        "Goal objective outside closed positive suffix vocabulary",
    )

    assistant_messages: list[tuple[int, str, str, str]] = []
    json_candidates: list[tuple[int, str, str, dict[str, Any]]] = []
    for row in trace:
        if row.get("type") != "response_item":
            continue
        payload = row.get("payload", {})
        if payload.get("type") != "message" or payload.get("role") != "assistant":
            continue
        text = shared.message_text(payload)
        message_turn = shared.turn_id(payload)
        phase = payload.get("phase")
        require(message_turn in intervals, "assistant message task turn")
        shared.require_inside(intervals, message_turn, row["ordinal"], "assistant message")
        require(phase in {"commentary", "final_answer"}, "assistant message phase")
        assistant_messages.append((row["ordinal"], text, message_turn, phase))
        try:
            value = contract.load_json_text(text, "assistant JSON")
        except contract.ContractError:
            continue
        require(isinstance(value, dict) and phase == "final_answer", "typed result final object")
        json_candidates.append((row["ordinal"], text, message_turn, value))
    require(len(json_candidates) == 1, "exactly one typed assistant result")
    semantic_ordinal, semantic_text, semantic_turn, result = json_candidates[0]
    ordered_turns = [item[0] for item in sorted(intervals.items(), key=lambda item: item[1][0])]
    require(semantic_turn == ordered_turns[-1], "semantic result not in latest task turn")
    by_turn: dict[str, list[tuple[int, str, str, str]]] = {turn: [] for turn in intervals}
    for item in assistant_messages:
        by_turn[item[2]].append(item)
    for current_turn in ordered_turns:
        turn_messages = sorted(by_turn[current_turn], key=lambda item: item[0])
        finals = [item for item in turn_messages if item[3] == "final_answer"]
        require(len(finals) == 1 and turn_messages[-1] == finals[0], "assistant final/task denominator")
        if current_turn == semantic_turn:
            require(finals[0][0] == semantic_ordinal, "terminal task final/result join")
        else:
            try:
                contract.load_json_text(finals[0][1], "continuation assistant JSON")
            except contract.ContractError:
                pass
            else:
                raise AppProbeError("nonterminal task emitted JSON final")
    jsonschema.Draft202012Validator(response_schema).validate(result)
    require(isinstance(result.get("source_ids"), list) and len(result["source_ids"]) == len(set(result["source_ids"])), "source_ids uniqueness")
    require(result == oracle[unit_id], "exact oracle result")

    sequence: list[tuple[int, dict[str, Any]]] = []
    identity = (active_goal.get("threadId"), active_goal.get("objective"), active_goal.get("createdAt"))
    for call in sorted(calls, key=lambda item: item["ordinal"]):
        output = outputs[call["call_id"]]
        goal = shared.goal_from_output(output["payload"])
        require(goal is not None, f"{call['tool']} Goal receipt")
        require((goal.get("threadId"), goal.get("objective"), goal.get("createdAt")) == identity, "Goal receipt identity drift")
        require(goal.get("status") in {"active", "complete"}, "Goal receipt state")
        require(output["ordinal"] < semantic_ordinal, "Goal receipt after semantic final")
        sequence.append((output["ordinal"], goal))
    completed_seen = False
    for _ordinal, goal in sorted(sequence, key=lambda item: item[0]):
        if completed_seen:
            require(goal.get("status") == "complete", "Goal state regressed after completion")
        completed_seen = completed_seen or goal.get("status") == "complete"
    require(sorted(sequence, key=lambda item: item[0])[-1][1].get("status") == "complete", "latest Goal receipt not terminal")
    require(update["turn_id"] == semantic_turn, "terminal/result turn")
    require(
        create["ordinal"] < create_output["ordinal"] < update["ordinal"] < update_output["ordinal"] < semantic_ordinal,
        "Goal activation/terminal/result order",
    )
    require(semantic_ordinal < intervals[semantic_turn][1], "semantic/task-complete order")
    require(semantic_text.encode("utf-8") == canonical(result), "semantic result canonical bytes")

    return {
        "schema_id": "pm.r10.app_verified_row.v2",
        "run_id": manifest["run_id"],
        "row_id": manifest["row"]["row_id"],
        "route_id": manifest["row"]["route_id"],
        "thread_id": thread_id,
        "goal_thread_id": active_goal["threadId"],
        "task_turn_count": len(intervals),
        "external_user_submission_count": 1,
        "followup_message_count": 0,
        "actual_tool_calls": [call["tool"] for call in calls],
        "goal_activation_output_ordinal": create_output["ordinal"],
        "goal_terminal_output_ordinal": update_output["ordinal"],
        "semantic_turn_id": semantic_turn,
        "semantic_result_ordinal": semantic_ordinal,
        "submitted_user_prompt_sha256": sha256(prompt.encode("utf-8")),
        "result": result,
        "status": "PASS",
        "qualification_credit": 0,
    }


def verify_evidence(evidence: Path) -> dict[str, Any]:
    require(not evidence.is_symlink() and evidence.is_dir(), "evidence directory")
    require(evidence.name == Path(EXPECTED_EVIDENCE).name and evidence.parent.name == "canary_004", "evidence path")
    require(not (evidence / "verification.json").exists(), "terminal verification receipt already exists")
    snapshot = evidence / "frozen_snapshot"
    require((snapshot / "r10_app_probe.py").resolve() == Path(__file__).resolve(), "verifier must execute from snapshot")
    require(Path(contract.__file__).resolve() == (snapshot / "r10_contract.py").resolve(), "contract import outside snapshot")
    require(Path(shared.__file__).resolve() == (snapshot / "r10_verify.py").resolve(), "shared verifier import outside snapshot")
    bundle = validate_manifest(
        snapshot / EXPECTED_MANIFEST,
        snapshot / EXPECTED_COMMITMENT,
        require_git=False,
        require_absent_evidence=False,
    )
    reservation_seed = contract.load_json(evidence / "reservation.json")
    bundle["head"] = reservation_seed.get("launch_head")
    reservation = validate_reservation(evidence, bundle)
    for rel in snapshot_paths(bundle["manifest"]):
        require(run_git("show", f"{reservation['launch_head']}:{OWNED_PREFIX}{rel}") == (snapshot / rel).read_bytes(), f"launch commit blob drift: {rel}")

    capture_record = contract.load_json(evidence / "capture.json")
    expected_capture_keys = {
        "schema_id", "run_id", "row_id", "thread_id", "host_id", "launch_head", "manifest_sha256",
        "commitment_sha256", "reservation_sha256", "parent_capture_bytes", "parent_capture_sha256",
        "create_result_bytes", "create_result_sha256", "terminal_read_result_bytes", "terminal_read_result_sha256",
        "rollout_read1_bytes", "rollout_read1_sha256", "rollout_read2_bytes", "rollout_read2_sha256",
        "create_event_id", "create_event_ordinal", "terminal_read_event_id", "terminal_read_event_ordinal",
        "wait_event_count", "app_event_count", "snapshot_file_count", "subject_call_lower_bound", "status",
        "qualification_credit",
    }
    require(set(capture_record) == expected_capture_keys, "capture key set")
    manifest = bundle["manifest"]
    require(capture_record["schema_id"] == "pm.r10.app_capture.v2", "capture schema")
    require(capture_record["run_id"] == manifest["run_id"] and capture_record["row_id"] == manifest["row"]["row_id"], "capture identity")
    require(capture_record["launch_head"] == reservation["launch_head"], "capture HEAD")
    require(capture_record["manifest_sha256"] == sha256(bundle["manifest_raw"]), "capture manifest")
    require(capture_record["commitment_sha256"] == sha256(bundle["commitment_raw"]), "capture commitment")
    require(capture_record["reservation_sha256"] == sha256((evidence / "reservation.json").read_bytes()), "capture reservation")
    require(capture_record["snapshot_file_count"] == len(snapshot_paths(manifest)), "capture snapshot count")
    require(capture_record["subject_call_lower_bound"] == 1, "capture subject lower bound")
    require(capture_record["status"] == "CAPTURED_UNVERIFIED" and capture_record["qualification_credit"] == 0, "capture status")

    parent_raw = (evidence / "parent_capture.raw.jsonl").read_bytes()
    require(capture_record["parent_capture_bytes"] == len(parent_raw) and capture_record["parent_capture_sha256"] == sha256(parent_raw), "parent capture identity")
    projection = parent_event_projection(parent_raw, bundle, reservation)
    create_raw = (evidence / "create_result.raw.json").read_bytes()
    terminal_raw = (evidence / "terminal_read_result.raw.json").read_bytes()
    require(create_raw == projection["create_result_raw"], "create result raw join")
    require(terminal_raw == projection["terminal_response_raw"], "terminal result raw join")
    require(capture_record["create_result_bytes"] == len(create_raw) and capture_record["create_result_sha256"] == sha256(create_raw), "create result identity")
    require(capture_record["terminal_read_result_bytes"] == len(terminal_raw) and capture_record["terminal_read_result_sha256"] == sha256(terminal_raw), "terminal result identity")
    for key in ("thread_id", "host_id", "create_event_id", "create_event_ordinal", "terminal_read_event_id", "terminal_read_event_ordinal", "wait_event_count", "app_event_count"):
        require(capture_record[key] == projection[key], f"capture projection join: {key}")

    read1 = (evidence / "rollout.read1.jsonl").read_bytes()
    read2 = (evidence / "rollout.read2.jsonl").read_bytes()
    require(read1 == read2, "stable child rollout reads")
    require(capture_record["rollout_read1_bytes"] == len(read1) and capture_record["rollout_read1_sha256"] == sha256(read1), "child read1 identity")
    require(capture_record["rollout_read2_bytes"] == len(read2) and capture_record["rollout_read2_sha256"] == sha256(read2), "child read2 identity")
    trace, _lines = parse_rollout(read1, "captured child rollout")
    verified = verify_trace(
        manifest,
        bundle["prompt"],
        trace,
        bundle["oracle"],
        bundle["response_schema"],
        projection["thread_id"],
        reservation["launch_head"],
    )
    intervals = shared.task_intervals(trace)
    ordered_turn_ids = [item[0] for item in sorted(intervals.items(), key=lambda item: item[1][0])]
    validate_terminal_response(
        projection["terminal_response"],
        manifest,
        projection["thread_id"],
        bundle["prompt"],
        bundle["oracle"][bundle["capsule"]["unit_id"]],
        ordered_turn_ids,
        verified["semantic_turn_id"],
    )
    return {
        "schema_id": "pm.r10.app_probe_verification.v2",
        "run_id": manifest["run_id"],
        "manifest_sha256": sha256(bundle["manifest_raw"]),
        "commitment_sha256": sha256(bundle["commitment_raw"]),
        "row": verified,
        "pass_count": 1,
        "fail_count": 0,
        "status": "PASS_ZERO_CREDIT_DIAGNOSTIC",
        "qualification_credit": 0,
        "qualification_streak": 0,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    for name in ("lint", "preflight", "reserve"):
        item = sub.add_parser(name)
        item.add_argument("--manifest", type=Path, default=ROOT / EXPECTED_MANIFEST)
        item.add_argument("--manifest-commitment", type=Path, default=ROOT / EXPECTED_COMMITMENT)
        if name == "reserve":
            item.add_argument("--parent-rollout", type=Path)
    capture_parser = sub.add_parser("capture")
    capture_parser.add_argument("--manifest", type=Path, default=ROOT / EXPECTED_MANIFEST)
    capture_parser.add_argument("--manifest-commitment", type=Path, default=ROOT / EXPECTED_COMMITMENT)
    capture_parser.add_argument("--parent-rollout", type=Path)
    verify_parser = sub.add_parser("verify")
    verify_parser.add_argument("--evidence-root", type=Path, required=True)
    args = parser.parse_args(argv)

    try:
        if args.command in {"lint", "preflight", "reserve"}:
            bundle = validate_manifest(
                args.manifest,
                args.manifest_commitment,
                require_git=args.command in {"preflight", "reserve"},
            )
            if args.command == "reserve":
                result = reserve(bundle, args.parent_rollout)
            else:
                result = {
                    "schema_id": "pm.r10.app_probe_preflight.v2",
                    "run_id": bundle["manifest"]["run_id"],
                    "manifest_sha256": sha256(bundle["manifest_raw"]),
                    "commitment_sha256": sha256(bundle["commitment_raw"]),
                    "prompt_utf8_bytes": bundle["metrics"]["prompt_utf8_bytes"],
                    "prompt_sha256": bundle["metrics"]["prompt_sha256"],
                    "launch_request_sha256": sha256(canonical(bundle["request"])),
                    "head": bundle["head"],
                    "subject_calls": 0,
                    "qualification_credit": 0,
                    "status": "PASS_NO_SUBJECT" if args.command == "preflight" else "PASS_LOCAL_NO_SUBJECT",
                }
            sys.stdout.buffer.write(canonical(result) + b"\n")
            return 0
        if args.command == "capture":
            bundle = validate_manifest(
                args.manifest,
                args.manifest_commitment,
                require_git=True,
                require_absent_evidence=False,
            )
            result = capture(bundle, args.parent_rollout)
            sys.stdout.buffer.write(canonical(result) + b"\n")
            return 0
        if args.command == "verify":
            result = verify_evidence(args.evidence_root.absolute())
            write_record(args.evidence_root / "verification.json", result)
            sys.stdout.buffer.write(canonical(result) + b"\n")
            return 0
        raise AppProbeError("unknown command")
    except (AppProbeError, contract.ContractError, shared.VerifyError, jsonschema.ValidationError, jsonschema.SchemaError, OSError) as exc:
        if getattr(args, "command", None) == "capture":
            record_capture_failure(ROOT / EXPECTED_EVIDENCE, exc)
        result = {
            "schema_id": "pm.r10.app_probe_failure.v2",
            "status": "FAIL_ZERO_CREDIT_NO_RETRY",
            "error": f"{type(exc).__name__}: {exc}",
            "qualification_credit": 0,
        }
        if getattr(args, "command", None) == "verify":
            try:
                write_record(args.evidence_root / "verification.json", result)
            except OSError:
                pass
        sys.stdout.buffer.write(canonical(result) + b"\n")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
