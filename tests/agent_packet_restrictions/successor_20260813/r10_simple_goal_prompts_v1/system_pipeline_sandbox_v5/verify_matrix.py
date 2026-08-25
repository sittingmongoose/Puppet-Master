#!/usr/bin/env python3
"""Verify captured OMP/Codex rows for the storage-plan system pipeline."""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

import pipeline
import omp_session


HERE = Path(__file__).resolve().parent
EVIDENCE = HERE / "evidence"
ANSI_CSI = re.compile(rb"\x1b\[[0-?]*[ -/]*[@-~]")
ANSI_OSC = re.compile(rb"\x1b\][^\x07]*(?:\x07|\x1b\\)")


class VerifyError(RuntimeError):
    pass


def require(condition: bool, message: str) -> None:
    if not condition:
        raise VerifyError(message)


def sha256(path: Path) -> str:
    return pipeline.sha256_file(path)


def route_map() -> dict[str, dict[str, Any]]:
    matrix = pipeline.load_json(HERE / "matrix.json")
    return {row["id"]: row for row in matrix["ordered_routes"]}


def launch_plan_map() -> dict[tuple[str, str], dict[str, Any]]:
    plan = pipeline.load_json(HERE / "launch_plan.json")
    require(plan.get("pass_order") == ["pass_01", "pass_02"], "launch-plan pass order")
    require(plan.get("row_count") == 24 and len(plan.get("rows", [])) == 24, "launch-plan row count")
    rows = {(row["pass_id"], row["route_id"]): row for row in plan["rows"]}
    require(len(rows) == 24, "launch-plan unique row identities")
    require(len({row["attempt_id"] for row in plan["rows"]}) == 24, "launch-plan unique attempt IDs")
    require(len({row["nonce"] for row in plan["rows"]}) == 24, "launch-plan unique nonces")
    return rows


def strip_terminal(raw: bytes) -> bytes:
    raw = ANSI_OSC.sub(b"", raw)
    raw = ANSI_CSI.sub(b"", raw)
    return raw.replace(b"\r", b"")


def terminal_result(text: str) -> dict[str, Any]:
    matrix = pipeline.load_json(HERE / "matrix.json")
    oracle = pipeline.load_json(HERE / "oracle.json")
    oracle_text = (HERE / "oracle.json").read_text(encoding="utf-8").strip()
    require(len(text.encode("utf-8")) <= matrix["max_final_assistant_utf8_bytes"], "final byte ceiling")
    lines = [line for line in text.splitlines() if line.startswith(pipeline.RESULT_PREFIX)]
    require(len(lines) == 1, "exactly one PM_RESULT line")
    nonempty = [line for line in text.splitlines() if line.strip()]
    require(nonempty and nonempty[-1] == lines[0], "PM_RESULT must be terminal")
    require(lines[0] == pipeline.RESULT_PREFIX + oracle_text, "exact oracle line")
    parsed = pipeline.strict_loads(lines[0][len(pipeline.RESULT_PREFIX) :])
    require(parsed == oracle, "exact oracle object")
    return parsed


def verify_evidence_hashes(row_dir: Path, terminal: dict[str, Any]) -> None:
    evidence = terminal.get("evidence")
    require(isinstance(evidence, list) and evidence, "evidence roster")
    names: set[str] = set()
    for record in evidence:
        name = record.get("path")
        require(isinstance(name, str) and name and name not in names, "unique evidence path")
        names.add(name)
        path = (row_dir / name).resolve()
        require(path.parent == row_dir.resolve(), "evidence path scope")
        require(path.is_file() and not path.is_symlink(), f"evidence file absent: {name}")
        require(path.stat().st_size == record.get("bytes"), f"evidence bytes: {name}")
        require(sha256(path) == record.get("sha256"), f"evidence hash: {name}")
    actual_entries = list(row_dir.iterdir())
    require(
        all(path.is_file() and not path.is_symlink() for path in actual_entries),
        "row evidence contains non-file or symlink",
    )
    require(
        {path.name for path in actual_entries if path.name != "terminal.json"} == names,
        "row evidence roster must be complete",
    )


def provider_model(route: dict[str, Any]) -> tuple[str, str]:
    model = route["model"]
    provider, selected = model.split("/", 1)
    return provider, selected


def verify_omp_raw(row_dir: Path, route: dict[str, Any], launch: dict[str, Any], terminal: dict[str, Any]) -> str:
    transport = pipeline.load_json(HERE / "matrix.json")["omp_runtime"].get("submission_transport")
    require(
        transport
        == {
            "kind": "prompt_then_composer_ack_then_enter",
            "external_submission_count": 1,
            "low_level_input_write_count": 2,
            "prompt_terminator_included": False,
            "composer_ack_required": True,
            "persisted_session_prefix_required": True,
        },
        "frozen OMP submission transport",
    )
    transcript = row_dir / "transcript.raw"
    session = row_dir / "session.raw.jsonl"
    pre_prompt = row_dir / "pre_prompt.raw"
    prompt_raw = row_dir / "stdin_prompt.raw"
    prompt_receipt_path = row_dir / "prompt_write.json"
    composer_raw = row_dir / "composer_ack.raw"
    composer_receipt_path = row_dir / "composer_ack.json"
    enter_raw = row_dir / "stdin_enter.raw"
    enter_receipt_path = row_dir / "enter_write.json"
    session_prefix = row_dir / "session_prefix.raw.jsonl"
    acceptance_path = row_dir / "submission_acceptance.json"
    control = row_dir / "control.raw"
    require(
        all(
            path.is_file() and not path.is_symlink()
            for path in (
                transcript,
                session,
                pre_prompt,
                prompt_raw,
                prompt_receipt_path,
                composer_raw,
                composer_receipt_path,
                enter_raw,
                enter_receipt_path,
                session_prefix,
                acceptance_path,
                control,
            )
        ),
        "OMP raw evidence",
    )
    transcript_bytes = transcript.read_bytes()
    rendered = strip_terminal(transcript_bytes)
    prompt = (HERE / "prompts/omp.prompt.txt").read_bytes()
    require(prompt.startswith(b"/goal "), "OMP command prompt prefix")
    require(prompt_raw.read_bytes() == prompt, "one exact OMP prompt payload")
    require(enter_raw.read_bytes() == b"\r", "one exact standalone OMP Enter")
    require(control.read_bytes() == b"\x04", "one terminal Ctrl-D control")
    prompt_receipt = pipeline.load_json(prompt_receipt_path)
    composer_receipt = pipeline.load_json(composer_receipt_path)
    enter_receipt = pipeline.load_json(enter_receipt_path)
    acceptance = pipeline.load_json(acceptance_path)
    require(prompt_receipt.get("schema_id") == "pm.r10.storage_pipeline.prompt_write.v5", "OMP prompt receipt schema")
    require(composer_receipt.get("schema_id") == "pm.r10.storage_pipeline.composer_ack.v5", "OMP composer receipt schema")
    require(enter_receipt.get("schema_id") == "pm.r10.storage_pipeline.enter_write.v5", "OMP Enter receipt schema")
    require(acceptance.get("schema_id") == "pm.r10.storage_pipeline.submission_acceptance.v5", "OMP acceptance schema")
    for receipt_name, receipt in (
        ("prompt", prompt_receipt),
        ("composer", composer_receipt),
        ("Enter", enter_receipt),
        ("acceptance", acceptance),
    ):
        for field in ("pass_id", "route_id", "ordinal", "attempt_id", "nonce"):
            require(receipt.get(field) == launch.get(field), f"OMP {receipt_name} receipt join: {field}")
        require(receipt.get("pid") == launch.get("pid"), f"OMP {receipt_name} PID join")
    require(prompt_receipt.get("path") == "stdin_prompt.raw", "OMP prompt receipt path")
    require(prompt_receipt.get("bytes") == prompt_raw.stat().st_size, "OMP prompt receipt bytes")
    require(prompt_receipt.get("sha256") == sha256(prompt_raw), "OMP prompt receipt hash")
    require(prompt_receipt.get("write_return_bytes") == prompt_raw.stat().st_size, "OMP exact prompt write return")
    require(
        prompt_receipt.get("low_level_write_ordinal") == 1 and prompt_receipt.get("terminator_included") is False,
        "OMP prompt-only first write",
    )
    require(
        prompt_receipt.get("pre_prompt")
        == {"path": "pre_prompt.raw", "bytes": pre_prompt.stat().st_size, "sha256": sha256(pre_prompt)},
        "OMP pre-prompt snapshot record",
    )
    require(composer_receipt.get("path") == "composer_ack.raw", "OMP composer receipt path")
    require(composer_receipt.get("bytes") == composer_raw.stat().st_size, "OMP composer receipt bytes")
    require(composer_receipt.get("sha256") == sha256(composer_raw), "OMP composer receipt hash")
    pre_prompt_bytes = pre_prompt.read_bytes()
    composer_bytes = composer_raw.read_bytes()
    require(composer_bytes.startswith(pre_prompt_bytes), "OMP composer snapshot extends pre-prompt snapshot")
    require(transcript_bytes.startswith(composer_bytes), "OMP final transcript retains composer snapshot")
    pre_prompt_rendered = strip_terminal(pre_prompt_bytes)
    composer_rendered = strip_terminal(composer_bytes)
    require(
        b"MCP finished" in pre_prompt_rendered and "❯".encode("utf-8") in pre_prompt_rendered,
        "OMP startup ready before prompt",
    )
    prompt_markers = ("📄 #1".encode("utf-8"), b"/goal Audit", "❯ 📄 #1".encode("utf-8"))
    require(all(marker not in pre_prompt_rendered for marker in prompt_markers), "OMP prompt markers absent before write")
    require(all(marker in composer_rendered for marker in prompt_markers), "OMP prompt-specific composer acknowledgement")
    require(len(composer_bytes) > len(pre_prompt_bytes), "OMP composer transcript advanced after write")
    require(
        composer_receipt.get("mcp_startup_finished") is True
        and composer_receipt.get("prompt_card") == "📄 #1"
        and composer_receipt.get("prompt_preview") == "/goal Audit"
        and composer_receipt.get("composer_state") == "❯ 📄 #1"
        and composer_receipt.get("pre_prompt_bytes") == len(pre_prompt_bytes)
        and composer_receipt.get("pre_prompt_sha256") == sha256(pre_prompt)
        and composer_receipt.get("new_raw_bytes") == len(composer_bytes) - len(pre_prompt_bytes),
        "OMP composer projection",
    )
    require(enter_receipt.get("path") == "stdin_enter.raw", "OMP Enter receipt path")
    require(enter_receipt.get("bytes") == 1 and enter_receipt.get("sha256") == sha256(enter_raw), "OMP Enter bytes/hash")
    require(enter_receipt.get("write_return_bytes") == 1, "OMP exact Enter write return")
    require(
        enter_receipt.get("low_level_write_ordinal") == 2
        and enter_receipt.get("external_submission_count") == 1
        and enter_receipt.get("terminator_hex") == "0d",
        "OMP standalone Enter second write",
    )
    require(enter_receipt.get("prompt_write_sha256") == sha256(prompt_receipt_path), "OMP Enter/prompt receipt join")
    require(enter_receipt.get("composer_ack_sha256") == sha256(composer_receipt_path), "OMP Enter/composer join")
    require(
        parse_utc(launch["started_at_utc"])
        <= parse_utc(prompt_receipt.get("written_at_utc"))
        <= parse_utc(composer_receipt.get("observed_at_utc"))
        <= parse_utc(enter_receipt.get("written_at_utc"))
        <= parse_utc(acceptance.get("accepted_at_utc")),
        "OMP two-phase submission chronology",
    )
    objective = prompt[len(b"/goal ") :].decode("utf-8")
    prefix_projection = omp_session.verify_submission_prefix(
        session_prefix,
        expected_cwd=launch["cwd"],
        expected_objective=objective,
        expected_selector=route["model"],
        expected_thinking=route["thinking"],
    )
    require(
        acceptance.get("external_submission_count") == 1
        and acceptance.get("low_level_input_write_count") == 2,
        "OMP one external submission in two writes",
    )
    require(acceptance.get("session_projection") == prefix_projection, "OMP accepted session-prefix projection")
    require(
        acceptance.get("session_prefix")
        == {"path": "session_prefix.raw.jsonl", "bytes": session_prefix.stat().st_size, "sha256": sha256(session_prefix)},
        "OMP accepted session-prefix record",
    )
    require(acceptance.get("enter_write_sha256") == sha256(enter_receipt_path), "OMP acceptance/Enter join")
    require(session.read_bytes().startswith(session_prefix.read_bytes()), "OMP final session retains accepted prefix")
    require("🎯 Goal".encode("utf-8") in rendered, "OMP visual Goal activation absent")
    require(b"Goal: complete" in rendered, "OMP terminal Goal receipt absent")
    require(b"PM_RESULT" in rendered, "OMP result marker absent from TUI transcript")
    provider, selected = provider_model(route)
    projection = omp_session.verify_session(
        session,
        expected_cwd=launch["cwd"],
        expected_objective=objective,
        expected_provider=provider,
        expected_model=selected,
        expected_selector=route["model"],
        expected_thinking=route["thinking"],
        require_exit=True,
    )
    require(
        parse_utc(launch["started_at_utc"])
        <= parse_utc(projection["session_started_at_utc"])
        <= parse_utc(acceptance["accepted_at_utc"]),
        "OMP session creation chronology",
    )
    terminal_result(projection["final_text"])
    require(projection["final_text"] == terminal.get("final_assistant_text"), "OMP exact final capture")
    require(
        terminal.get("session_projection") == {key: value for key, value in projection.items() if key != "final_text"},
        "OMP independent session projection join",
    )
    require(
        terminal.get("tui_corroboration")
        == {"goal_activation": True, "goal_complete": True, "pm_result_marker": True},
        "OMP TUI corroboration receipt",
    )
    require(
        launch.get("external_prompt_count") == 1
        and launch.get("low_level_input_write_count") == 2
        and launch.get("composer_ack_required") is True
        and launch.get("persisted_submission_acceptance_required") is True,
        "OMP one external prompt/two-phase transport contract",
    )
    require(terminal.get("goal_activation_observed") is True, "OMP activation observation")
    require(terminal.get("goal_complete_observed") is True, "OMP completion observation")
    require(
        terminal.get("external_submission_count") == 1
        and terminal.get("low_level_input_write_count") == 2
        and terminal.get("composer_acknowledged") is True
        and terminal.get("persisted_submission_accepted") is True
        and terminal.get("terminal_control_sent_once") is True,
        "OMP submission/control custody",
    )
    return projection["session_id"]


def text_blocks(value: Any) -> str:
    if isinstance(value, str):
        return value
    if isinstance(value, list):
        return "".join(text_blocks(item) for item in value)
    if isinstance(value, dict):
        if isinstance(value.get("text"), str):
            return value["text"]
        return "".join(text_blocks(child) for child in value.values())
    return ""


CREATE_WRAPPER = re.compile(
    r"\A\s*const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*await\s+tools\.create_goal\(\s*"
    r"\{\s*objective\s*:\s*(\"(?:\\.|[^\"\\])*\")\s*\}\s*\)\s*;\s*"
    r"text\(\s*\1\s*\)\s*;?\s*\Z",
    re.DOTALL,
)
UPDATE_WRAPPER = re.compile(
    r"\A\s*const\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*await\s+tools\.update_goal\(\s*"
    r"\{\s*status\s*:\s*\"complete\"\s*\}\s*\)\s*;\s*"
    r"text\(\s*\1\s*\)\s*;?\s*\Z",
    re.DOTALL,
)


def parse_goal_wrapper(source: str) -> tuple[str, str | None]:
    create = CREATE_WRAPPER.fullmatch(source)
    if create:
        objective = pipeline.strict_loads(create.group(2))
        require(isinstance(objective, str) and objective.strip(), "Codex create objective string")
        return "create_goal", objective
    if UPDATE_WRAPPER.fullmatch(source):
        return "update_goal", None
    raise VerifyError("Codex wrapper outside exact Goal-only grammar")


def parse_goal(output: Any) -> dict[str, Any] | None:
    text = text_blocks(output)
    for candidate in re.findall(r"\{[^\n]*\}", text):
        try:
            parsed = pipeline.strict_loads(candidate)
        except Exception:
            continue
        if isinstance(parsed, dict) and isinstance(parsed.get("goal"), dict):
            return parsed["goal"]
    return None


def verify_codex_raw(row_dir: Path, route: dict[str, Any], launch: dict[str, Any], terminal: dict[str, Any]) -> str:
    rollout = row_dir / "rollout.raw.jsonl"
    require(rollout.is_file(), "Codex raw rollout")
    rows = pipeline.load_jsonl(rollout)
    prompt = (HERE / "prompts/codex.prompt.txt").read_text(encoding="utf-8")
    prompt_occurrences = 0
    turn_contexts = []
    calls: dict[str, tuple[int, dict[str, Any]]] = {}
    outputs: dict[str, tuple[int, Any]] = {}
    assistant_finals: list[tuple[int, str]] = []
    session_ids: list[str] = []
    for ordinal, row in enumerate(rows):
        kind = row.get("type")
        payload = row.get("payload")
        if kind == "session_meta" and isinstance(payload, dict):
            session_id = payload.get("id", payload.get("session_id"))
            if isinstance(session_id, str):
                session_ids.append(session_id)
        if kind == "turn_context" and isinstance(payload, dict):
            turn_contexts.append(payload)
        if kind != "response_item" or not isinstance(payload, dict):
            continue
        if payload.get("type") == "message":
            content = text_blocks(payload.get("content"))
            prompt_occurrences += content.count(prompt)
            if payload.get("role") == "assistant" and payload.get("phase") == "final_answer":
                assistant_finals.append((ordinal, content))
        elif payload.get("type") == "custom_tool_call":
            call_id = payload.get("call_id")
            require(isinstance(call_id, str) and call_id not in calls, "Codex unique tool call")
            calls[call_id] = (ordinal, payload)
        elif payload.get("type") == "custom_tool_call_output":
            call_id = payload.get("call_id")
            require(isinstance(call_id, str) and call_id not in outputs, "Codex unique tool output")
            outputs[call_id] = (ordinal, payload.get("output"))
        elif "call" in str(payload.get("type", "")).lower():
            raise VerifyError(f"unexpected Codex call projection: {payload.get('type')}")
    require(len(set(session_ids)) == 1, "Codex session identity")
    require(prompt_occurrences == 1, "one exact Codex task prompt")
    require(turn_contexts, "Codex turn context")
    require(all(row.get("model") == route["model"] for row in turn_contexts), "Codex effective model")
    efforts = [row.get("collaboration_mode", {}).get("settings", {}).get("reasoning_effort") for row in turn_contexts]
    require(all(effort == route["thinking"] for effort in efforts), "Codex effective reasoning effort")
    require(len(calls) == 2 and set(calls) == set(outputs), "exactly two Codex Goal wrapper calls")
    create = []
    complete = []
    for call_id, (ordinal, call) in calls.items():
        require(call.get("name") == "exec", "Codex only exec Goal wrappers")
        source = call.get("input")
        require(isinstance(source, str), "Codex wrapper source")
        wrapper_kind, wrapper_objective = parse_goal_wrapper(source)
        if wrapper_kind == "create_goal":
            create.append((call_id, ordinal, source, wrapper_objective))
        elif wrapper_kind == "update_goal":
            complete.append((call_id, ordinal, source))
        else:
            raise VerifyError("Codex non-Goal or mixed wrapper")
    require(len(create) == 1 and len(complete) == 1, "one create and one complete")
    active = parse_goal(outputs[create[0][0]][1])
    completed = parse_goal(outputs[complete[0][0]][1])
    require(isinstance(active, dict) and active.get("status") == "active", "Codex active Goal receipt")
    require(isinstance(completed, dict) and completed.get("status") == "complete", "Codex complete Goal receipt")
    session_id = session_ids[0]
    require(active.get("threadId") == session_id and completed.get("threadId") == session_id, "Codex Goal/thread identity")
    require(active.get("createdAt") == completed.get("createdAt"), "Codex Goal createdAt identity")
    require(active.get("objective") == completed.get("objective"), "Codex Goal objective identity")
    require(active.get("objective") == create[0][3], "Codex wrapper/receipt objective join")
    objective = str(active.get("objective", "")).lower()
    require("storage" in objective and ("pipeline" in objective or "worknode" in objective or "work-node" in objective), "Codex bounded Goal objective")
    create_call_index = create[0][1]
    create_output_index = outputs[create[0][0]][0]
    complete_call_index = complete[0][1]
    complete_output_index = outputs[complete[0][0]][0]
    require(len(assistant_finals) == 1, "one Codex final answer")
    final_index, final_text = assistant_finals[0]
    require(create_call_index < create_output_index < complete_call_index < complete_output_index < final_index, "Codex Goal lifecycle order")
    require(final_text == terminal.get("final_assistant_text"), "Codex final capture exact")
    require(launch.get("external_prompt_count") == 1, "Codex one external prompt")
    return session_id


def expected_argv(route: dict[str, Any], cwd: str, session_dir: str) -> list[str]:
    matrix = pipeline.load_json(HERE / "matrix.json")
    runtime = matrix["omp_runtime"]
    return [
        runtime["binary"],
        "--session-dir",
        session_dir,
        "--no-title",
        "--no-tools",
        "--no-skills",
        "--no-rules",
        "--cwd",
        cwd,
        "--model",
        route["model"],
        "--thinking",
        route["thinking"],
    ]


def parse_utc(value: str) -> datetime:
    require(isinstance(value, str) and value.endswith("Z"), "UTC timestamp shape")
    return datetime.fromisoformat(value[:-1] + "+00:00")


def verify_omp_preflight(row_dir: Path, launch: dict[str, Any], planned: dict[str, Any]) -> str:
    path = row_dir / "omp_preflight.json"
    require(path.is_file() and not path.is_symlink(), "row-bound OMP preflight absent")
    require(path.stat().st_size == launch.get("omp_preflight_bytes"), "OMP preflight bytes")
    digest = sha256(path)
    require(digest == launch.get("omp_preflight_sha256"), "OMP preflight hash")
    receipt = pipeline.load_json(path)
    for field in ("pass_id", "route_id", "ordinal", "attempt_id", "nonce"):
        require(receipt.get(field) == planned[field], f"OMP preflight join: {field}")
    for field in ("surface", "model", "thinking"):
        require(receipt.get(field) == planned[field], f"OMP preflight runtime join: {field}")
    runtime = pipeline.load_json(HERE / "runtime_manifest.json")["omp"]
    require(receipt.get("schema_id") == "pm.r10.storage_pipeline.omp_preflight.v2", "OMP preflight schema")
    require(receipt.get("binary") == runtime["binary"], "OMP preflight binary path")
    require(receipt.get("binary_bytes") == runtime["binary_bytes"], "OMP preflight binary bytes")
    require(receipt.get("binary_sha256") == runtime["binary_sha256"], "OMP preflight binary hash")
    require(receipt.get("version_stdout") == runtime["version"], "OMP preflight version")
    require(
        receipt.get("version_command")
        == {"argv": [runtime["binary"], "--version"], "exit_code": 0, "stdout": runtime["version"]},
        "OMP preflight exact version command",
    )
    require(receipt.get("profile_dir") == runtime["profile_dir"], "OMP preflight profile")
    commands = receipt.get("config_commands")
    require(isinstance(commands, list) and len(commands) == len(runtime["effective_config"]), "OMP preflight config command roster")
    observed: dict[str, Any] = {}
    for row in commands:
        require(row.get("exit_code") == 0 and isinstance(row.get("stdout"), str), "OMP preflight config command result")
        key = row.get("key")
        require(key in runtime["effective_config"] and key not in observed, "OMP preflight unique config key")
        require(
            row.get("argv") == [runtime["binary"], "config", "get", key],
            "OMP preflight exact config argv",
        )
        raw = row["stdout"]
        if raw in {"true", "false"} or raw.startswith(("{", "[", '"')):
            observed[key] = pipeline.strict_loads(raw)
        else:
            observed[key] = raw
    require(observed == runtime["effective_config"], "OMP row-bound effective config")
    require(receipt.get("effective_config") == observed, "OMP preflight effective-config projection")
    require(receipt.get("subject_calls") == 0, "OMP preflight zero subject calls")
    observed_at = receipt.get("observed_at_utc")
    delta = (parse_utc(launch["started_at_utc"]) - parse_utc(observed_at)).total_seconds()
    require(0 <= delta <= 60, "OMP preflight must immediately precede launch")
    return digest


def verify_row(pass_id: str, route: dict[str, Any]) -> dict[str, Any]:
    planned = launch_plan_map()[(pass_id, route["id"])]
    row_dir = EVIDENCE / pass_id / route["id"]
    require(row_dir.is_dir() and not row_dir.is_symlink(), f"row evidence absent: {route['id']}")
    launch = pipeline.load_json(row_dir / "launch.json")
    terminal = pipeline.load_json(row_dir / "terminal.json")
    require(launch.get("schema_id") == "pm.r10.storage_pipeline.launch.v2", "launch schema")
    require(terminal.get("schema_id") == "pm.r10.storage_pipeline.terminal.v2", "terminal schema")
    for row in (launch, terminal):
        require(row.get("pass_id") == pass_id and row.get("route_id") == route["id"], "row identity")
        require(row.get("surface") == route["surface"], "row surface")
        require(row.get("model") == route["model"] and row.get("thinking") == route["thinking"], "row runtime")
        require(row.get("ordinal") == planned["ordinal"], "planned ordinal")
        require(row.get("attempt_id") == planned["attempt_id"], "planned attempt ID")
        require(row.get("nonce") == planned["nonce"], "planned nonce")
    prompt_path = HERE / "prompts" / ("omp.prompt.txt" if route["surface"] == "omp_tui" else "codex.prompt.txt")
    require(launch.get("prompt_utf8_bytes") == prompt_path.stat().st_size, "prompt bytes")
    require(launch.get("prompt_sha256") == sha256(prompt_path), "prompt hash")
    require(launch.get("prompt_utf8_bytes") == planned["prompt_utf8_bytes"] and launch.get("prompt_sha256") == planned["prompt_sha256"], "planned prompt binding")
    require(isinstance(launch.get("started_at_utc"), str) and launch["started_at_utc"], "launch timestamp")
    require(terminal.get("status") in {"PASS", "FAIL"}, "terminal status")
    verify_evidence_hashes(row_dir, terminal)
    if route["surface"] == "omp_tui":
        runtime = pipeline.load_json(HERE / "matrix.json")["omp_runtime"]
        omp_preflight_sha = verify_omp_preflight(row_dir, launch, planned)
        require(launch.get("cwd") == planned["cwd"], "planned OMP cwd")
        require(launch.get("session_dir") == planned["session_dir"], "planned OMP session dir")
        require(launch.get("session_dir_absent_before") is True, "fresh OMP session directory")
        require(
            launch.get("argv") == expected_argv(route, launch.get("cwd"), launch.get("session_dir")),
            "OMP exact argv",
        )
        require(launch.get("advisor_enabled") is runtime["advisor_enabled"], "OMP advisor off")
        require(launch.get("task_agent_advisor") == runtime["task_agent_advisor"], "OMP task advisor off")
        require(launch.get("cwd_entries_before") == 0 and terminal.get("cwd_entries_after") == 0, "OMP empty sandbox cwd")
        if terminal["status"] == "PASS":
            require(terminal.get("process_exit_code") == 0, "OMP clean process exit")
            require(parse_utc(terminal.get("finished_at_utc")) >= parse_utc(launch["started_at_utc"]), "OMP terminal chronology")
            observed_identity = verify_omp_raw(row_dir, route, launch, terminal)
    else:
        require(launch.get("omp_preflight_sha256") is None and launch.get("omp_preflight_bytes") is None, "Codex has no OMP preflight")
        omp_preflight_sha = None
        require(launch.get("projectless_directory_name") == planned["projectless_directory_name"], "planned Codex directory")
        if terminal["status"] == "PASS":
            observed_identity = verify_codex_raw(row_dir, route, launch, terminal)
    if terminal["status"] == "PASS":
        terminal_result(terminal.get("final_assistant_text"))
        require(terminal.get("observed_non_goal_tool_calls") == 0, "non-Goal tool calls")
        require(terminal.get("no_retry") is True, "no retry")
    else:
        require(isinstance(terminal.get("failure_code"), str) and terminal["failure_code"], "failure code")
        require(terminal.get("qualification_credit") == 0, "failed row zero credit")
        observed_identity = terminal.get("observed_identity")
    primary = row_dir / ("session.raw.jsonl" if route["surface"] == "omp_tui" else "rollout.raw.jsonl")
    primary_hash = sha256(primary) if primary.is_file() else None
    return {
        "route_id": route["id"],
        "surface": route["surface"],
        "status": terminal["status"],
        "failure_code": terminal.get("failure_code"),
        "ordinal": planned["ordinal"],
        "attempt_id": planned["attempt_id"],
        "nonce": planned["nonce"],
        "observed_identity": observed_identity,
        "raw_primary_sha256": primary_hash,
        "cwd_identity": launch.get("cwd", launch.get("projectless_directory_name")),
        "started_at_utc": launch["started_at_utc"],
        "launch_sha256": sha256(row_dir / "launch.json"),
        "omp_preflight_sha256": omp_preflight_sha,
        "pid": launch.get("pid"),
    }


def verify_pass(pass_id: str) -> dict[str, Any]:
    routes = pipeline.load_json(HERE / "matrix.json")["ordered_routes"]
    rows = [verify_row(pass_id, route) for route in routes]
    failed = [row for row in rows if row["status"] != "PASS"]
    return {
        "pass_id": pass_id,
        "status": "PASS" if not failed else "FAIL",
        "rows": rows,
        "pass_count": len(rows) - len(failed),
        "fail_count": len(failed),
        "qualification_credit": 1 if not failed else 0,
    }


def verify_launch_journal(reports: list[dict[str, Any]]) -> None:
    rows = [row for report in reports for row in report["rows"]]
    rows.sort(key=lambda row: row["ordinal"])
    journal_path = EVIDENCE / "launch_journal.jsonl"
    require(journal_path.is_file() and not journal_path.is_symlink(), "launch journal absent")
    journal = pipeline.load_jsonl(journal_path)
    require(len(journal) == len(rows), "launch journal must exactly match verified rows")
    previous_time = ""
    for expected, actual in zip(rows, journal, strict=True):
        require(actual.get("schema_id") == "pm.r10.storage_pipeline.launch_journal.v2", "launch journal schema")
        for field in ("ordinal", "pass_id", "route_id", "attempt_id", "nonce", "started_at_utc", "launch_sha256", "omp_preflight_sha256"):
            expected_value = expected[field] if field in expected else None
            if field == "pass_id":
                expected_value = "pass_01" if expected["ordinal"] <= 12 else "pass_02"
            require(actual.get(field) == expected_value, f"launch journal join: {field}")
        require(actual["started_at_utc"] > previous_time, "strict launch chronology")
        if expected["surface"] == "omp_tui":
            require(
                actual.get("popen_observed") is True and actual.get("pid") == expected.get("pid"),
                "launch journal Popen custody",
            )
        else:
            require(actual.get("app_create_observed") is True, "launch journal Codex app custody")
        previous_time = actual["started_at_utc"]


def verify_evidence_tree(reports: list[dict[str, Any]]) -> None:
    require(EVIDENCE.is_dir() and not EVIDENCE.is_symlink(), "matrix evidence root absent or unsafe")
    pass_ids = [report["pass_id"] for report in reports]
    expected_root = {"launch_journal.jsonl", *pass_ids}
    require({path.name for path in EVIDENCE.iterdir()} == expected_root, "matrix evidence root roster")
    journal = EVIDENCE / "launch_journal.jsonl"
    require(journal.is_file() and not journal.is_symlink(), "matrix launch journal unsafe")
    for report in reports:
        pass_dir = EVIDENCE / report["pass_id"]
        require(pass_dir.is_dir() and not pass_dir.is_symlink(), "matrix pass directory unsafe")
        expected_routes = {row["route_id"] for row in report["rows"]}
        require({path.name for path in pass_dir.iterdir()} == expected_routes, "matrix pass row roster")
        require(
            all(path.is_dir() and not path.is_symlink() for path in pass_dir.iterdir()),
            "matrix row directory unsafe",
        )


def verify_global_uniqueness(reports: list[dict[str, Any]]) -> None:
    rows = [row for report in reports for row in report["rows"]]
    for field in ("attempt_id", "nonce", "cwd_identity", "started_at_utc"):
        values = [row[field] for row in rows]
        require(all(isinstance(value, str) and value for value in values), f"global {field} present")
        require(len(set(values)) == len(values), f"global {field} uniqueness")
    passed = [row for row in rows if row["status"] == "PASS"]
    for field in ("observed_identity", "raw_primary_sha256"):
        values = [row[field] for row in passed]
        require(all(isinstance(value, str) and value for value in values), f"passed-row {field} present")
        require(len(set(values)) == len(values), f"passed-row {field} uniqueness")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("pass_ids", nargs="+", choices=("pass_01", "pass_02"))
    args = parser.parse_args()
    try:
        require(args.pass_ids in (["pass_01"], ["pass_01", "pass_02"]), "pass IDs must be pass_01 or exact ordered pair pass_01 pass_02")
        pipeline.verify()
        reports = [verify_pass(pass_id) for pass_id in args.pass_ids]
        verify_launch_journal(reports)
        verify_evidence_tree(reports)
        verify_global_uniqueness(reports)
        if args.pass_ids == ["pass_01", "pass_02"]:
            require([row["route_id"] for row in reports[0]["rows"]] == [row["route_id"] for row in reports[1]["rows"]], "unchanged route roster")
        status = "PASS" if all(report["status"] == "PASS" for report in reports) else "FAIL"
        print(pipeline.canonical_json({"schema_id": "pm.r10.storage_pipeline.matrix_verification.v1", "status": status, "passes": reports, "qualification_credit": 1 if status == "PASS" and args.pass_ids == ["pass_01", "pass_02"] else 0}))
        return 0 if status == "PASS" else 1
    except (
        VerifyError,
        omp_session.OmpSessionError,
        pipeline.PipelineError,
        OSError,
        ValueError,
        KeyError,
        TypeError,
        AssertionError,
    ) as exc:
        print(pipeline.canonical_json({"status": "FAIL_VERIFIER", "error": f"{type(exc).__name__}: {exc}", "qualification_credit": 0}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
