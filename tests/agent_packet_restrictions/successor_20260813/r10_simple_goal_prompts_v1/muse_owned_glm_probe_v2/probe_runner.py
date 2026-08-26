#!/usr/bin/env python3
"""Run one fresh, zero-credit Ox probe for owned-GLM verifier compatibility."""

from __future__ import annotations

import argparse
import contextlib
import copy
import io
import os
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any, Callable


HERE = Path(__file__).resolve().parent
R10 = HERE.parent
V7 = R10 / "system_pipeline_sandbox_v7"
V1 = R10 / "muse_owned_glm_probe_v1"
sys.path.insert(0, str(V7))

import freeze_check  # type: ignore[import-not-found]  # noqa: E402
import omp_row_runner as base  # type: ignore[import-not-found]  # noqa: E402
import omp_session  # type: ignore[import-not-found]  # noqa: E402
import pipeline  # type: ignore[import-not-found]  # noqa: E402
import selftest as v7_selftest  # type: ignore[import-not-found]  # noqa: E402


CONTRACT_PATH = HERE / "probe_contract.json"
OVERLAY_PATH = HERE / "tools_glm.config.yml"
EVIDENCE = HERE / "evidence"
OWNED_SOURCE_NAMES = ("README.md", "probe_contract.json", "probe_runner.py", "tools_glm.config.yml")
RUN_ROUTE_IDS = ("omp_ox_alpha_free_max",)
REPO = Path("/mnt/Cursor/PuppetMaster")
ORIGINAL_VERIFY_SESSION = omp_session.verify_session
ASCII_FRAMING_WHITESPACE = frozenset("\t\n\r ")
OBSERVATION_OPEN = "<observation>"
GLM_TOOL_OPEN = "<tool_call>"
GLM_TOOL_CLOSE = "</tool_call>"
GLM_ARG_KEY_OPEN = "<arg_key>"
GLM_ARG_KEY_CLOSE = "</arg_key>"
GLM_ARG_VALUE_OPEN = "<arg_value>"
GLM_ARG_VALUE_CLOSE = "</arg_value>"
IDENTITY_FIELDS = ("ordinal", "pass_id", "route_id", "attempt_id", "nonce")
JOURNAL_KEYS = frozenset(
    {
        "schema_id",
        "ordinal",
        "pass_id",
        "route_id",
        "attempt_id",
        "nonce",
        "started_at_utc",
        "launch_sha256",
        "omp_preflight_sha256",
        "popen_observed",
        "pid",
    }
)
ROW_EVIDENCE_NAMES = (
    "reservation.json",
    "omp_preflight.json",
    "launch.json",
    "pre_prompt.raw",
    "stdin_prompt.raw",
    "prompt_write.json",
    "composer_ack.raw",
    "composer_ack.json",
    "stdin_enter.raw",
    "enter_write.json",
    "session_prefix.raw.jsonl",
    "submission_acceptance.json",
    "transcript.raw",
    "control.raw",
    "session.raw.jsonl",
)


class ProbeError(RuntimeError):
    pass


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ProbeError(message)


def expect_failure(callable_obj: Callable[[], Any], label: str, expected_text: str | None = None) -> None:
    try:
        callable_obj()
    except Exception as exc:
        if expected_text is not None:
            require(expected_text in str(exc), f"{label} exact rejection")
        return
    raise ProbeError(f"expected failure: {label}")


def contract() -> dict[str, Any]:
    value = pipeline.load_json(CONTRACT_PATH)
    require(value.get("schema_id") == "pm.r10.storage_pipeline.owned_glm_ox_compat_probe.v2", "probe schema")
    require(value.get("status") == "PREREGISTERED_ZERO_CREDIT", "probe status")
    return value


def rows() -> list[dict[str, Any]]:
    value = contract().get("rows")
    require(isinstance(value, list) and len(value) == 1, "exact one-row Ox probe")
    return value


def route_map() -> dict[str, dict[str, Any]]:
    return {
        row["route_id"]: {
            "route_id": row["route_id"],
            "surface": row["surface"],
            "model": row["model"],
            "thinking": row["thinking"],
        }
        for row in rows()
    }


def planned_row(pass_id: str, route_id: str) -> dict[str, Any]:
    matches = [row for row in rows() if row["pass_id"] == pass_id and row["route_id"] == route_id]
    require(len(matches) == 1, "exact planned Ox row")
    return matches[0]


def file_record(path: Path) -> dict[str, Any]:
    require(path.is_file() and not path.is_symlink(), f"regular file required: {path}")
    return {"path": str(path), "bytes": path.stat().st_size, "sha256": pipeline.sha256_file(path)}


def require_route_authorized(route_id: str) -> None:
    require(route_id == "omp_ox_alpha_free_max", "only the fresh free-Ox route exists")
    authority = contract()["authority"]
    require(authority.get("current_v2_ox_row_authorized") is True, "current V2 free-Ox authority")
    require(authority.get("muse_or_non_ox_route_authorized") is False, "non-Ox authority remains closed")


def run_text(
    argv: list[str], *, environment: dict[str, str] | None = None, timeout: int = 30
) -> subprocess.CompletedProcess[str]:
    return subprocess.run(argv, check=False, capture_output=True, text=True, env=environment, timeout=timeout)


def git_custody() -> dict[str, Any]:
    head = run_text(["git", "-C", str(REPO), "rev-parse", "HEAD"]).stdout.strip()
    origin = run_text(["git", "-C", str(REPO), "rev-parse", "origin/main"]).stdout.strip()
    backup = run_text(["git", "-C", str(REPO), "rev-parse", "truenas-backup/main"]).stdout.strip()
    require(len(head) == 40 and head == origin == backup, "probe HEAD must be pushed to both remotes")
    source_commit = contract()["source_candidate_commit"]
    ancestry = run_text(["git", "-C", str(REPO), "merge-base", "--is-ancestor", source_commit, head])
    require(ancestry.returncode == 0, "source candidate must be an ancestor")
    records = []
    for name in OWNED_SOURCE_NAMES:
        path = HERE / name
        relative = path.relative_to(REPO).as_posix()
        tracked = run_text(["git", "-C", str(REPO), "ls-files", "--error-unmatch", "--", relative])
        require(tracked.returncode == 0, f"probe source not tracked: {name}")
        blob = subprocess.run(
            ["git", "-C", str(REPO), "show", f"HEAD:{relative}"],
            check=False,
            capture_output=True,
        )
        require(blob.returncode == 0 and blob.stdout == path.read_bytes(), f"probe source differs from pushed HEAD: {name}")
        records.append(file_record(path))
    return {"head": head, "origin_main": origin, "truenas_backup_main": backup, "sources": records}


def prior_identity_rows() -> list[tuple[Path, dict[str, Any]]]:
    sources = [R10 / f"system_pipeline_sandbox_v{version}" / "launch_plan.json" for version in range(1, 8)]
    sources.extend(
        [
            R10 / "muse_owned_xml_probe_v1" / "probe_contract.json",
            R10 / "muse_owned_glm_probe_v1" / "probe_contract.json",
        ]
    )
    result: list[tuple[Path, dict[str, Any]]] = []
    for source in sources:
        require(source.is_file() and not source.is_symlink(), f"prior identity source: {source}")
        value = pipeline.load_json(source)
        prior = value.get("rows")
        require(isinstance(prior, list) and prior, f"prior identity rows: {source}")
        result.extend((source.parent, row) for row in prior)
    return result


def validate_fresh_identity(planned: dict[str, Any]) -> None:
    fields = ("attempt_id", "nonce", "cwd", "session_dir")
    for prior_root, prior in prior_identity_rows():
        for field in fields:
            if field in prior:
                require(planned[field] != prior[field], f"fresh identity collision: {field}")
        current_evidence = (HERE / planned["evidence_path"]).resolve()
        prior_evidence = (prior_root / prior["evidence_path"]).resolve()
        require(current_evidence != prior_evidence, "fresh absolute evidence identity")


def ascii_framing_whitespace(text: str) -> bool:
    return all(character in ASCII_FRAMING_WHITESPACE for character in text)


def parse_exact_glm_goal_raw_block(call: dict[str, Any]) -> dict[str, Any]:
    require(call.get("name") == "goal", "owned GLM canonical Goal name")
    require(call.get("arguments") == {"op": "complete"}, "owned GLM canonical Goal arguments")
    raw_block = call.get("rawBlock")
    require(isinstance(raw_block, str) and raw_block, "owned GLM Goal rawBlock")
    require(raw_block.startswith(GLM_TOOL_OPEN) and raw_block.endswith(GLM_TOOL_CLOSE), "owned GLM call envelope")
    for token in (
        GLM_TOOL_OPEN,
        GLM_TOOL_CLOSE,
        GLM_ARG_KEY_OPEN,
        GLM_ARG_KEY_CLOSE,
        GLM_ARG_VALUE_OPEN,
        GLM_ARG_VALUE_CLOSE,
    ):
        require(raw_block.count(token) == 1, f"owned GLM sole token: {token}")

    body = raw_block[len(GLM_TOOL_OPEN) : -len(GLM_TOOL_CLOSE)]
    key_open = body.find(GLM_ARG_KEY_OPEN)
    require(key_open >= 0, "owned GLM key opener order")
    name_region = body[:key_open]
    require(name_region.strip("\t\n\r ") == "goal", "owned GLM raw Goal name")
    require(
        ascii_framing_whitespace(name_region.replace("goal", "", 1)),
        "owned GLM raw Goal-name whitespace",
    )

    key_start = key_open + len(GLM_ARG_KEY_OPEN)
    key_close = body.find(GLM_ARG_KEY_CLOSE, key_start)
    require(key_close >= key_start, "owned GLM key closer order")
    key_text = body[key_start:key_close]
    require(key_text.strip("\t\n\r ") == "op", "owned GLM raw argument key")
    require(ascii_framing_whitespace(key_text.replace("op", "", 1)), "owned GLM raw key whitespace")

    value_open = body.find(GLM_ARG_VALUE_OPEN, key_close + len(GLM_ARG_KEY_CLOSE))
    require(value_open >= 0, "owned GLM value opener order")
    between_key_value = body[key_close + len(GLM_ARG_KEY_CLOSE) : value_open]
    require(ascii_framing_whitespace(between_key_value), "owned GLM key/value whitespace")
    value_start = value_open + len(GLM_ARG_VALUE_OPEN)
    value_close = body.find(GLM_ARG_VALUE_CLOSE, value_start)
    require(value_close >= value_start, "owned GLM value closer order")
    value_text = body[value_start:value_close]
    require(value_text.strip("\t\n\r ") == "complete", "owned GLM raw argument value")
    require(ascii_framing_whitespace(value_text.replace("complete", "", 1)), "owned GLM raw value whitespace")
    after_value = body[value_close + len(GLM_ARG_VALUE_CLOSE) :]
    require(ascii_framing_whitespace(after_value), "owned GLM trailing call whitespace")

    raw_bytes = raw_block.encode("utf-8")
    return {
        "present": True,
        "bytes": len(raw_bytes),
        "sha256": pipeline.sha256_bytes(raw_bytes),
        "canonical_name": "goal",
        "canonical_arguments": {"op": "complete"},
    }


def classify_post_call_framing(text: str) -> str:
    require(text != "", "owned GLM post-call text nonempty")
    if ascii_framing_whitespace(text):
        return "ascii_whitespace"
    require(text.count(OBSERVATION_OPEN) == 1, "owned GLM exactly one observation opener")
    before, after = text.split(OBSERVATION_OPEN)
    require(
        ascii_framing_whitespace(before) and ascii_framing_whitespace(after),
        "owned GLM observation framing only",
    )
    return "observation_open"


def compatibility_projection(path: Path) -> tuple[bytes, bytes, dict[str, Any], dict[str, Any]]:
    _slot, header, entries, raw = omp_session.load_physical_session(path)
    calls: list[tuple[int, int, dict[str, Any], list[dict[str, Any]]]] = []
    for entry_index, entry in enumerate(entries):
        if entry.get("type") != "message":
            continue
        message = entry.get("message")
        if not isinstance(message, dict) or message.get("role") != "assistant":
            continue
        content = message.get("content")
        if not isinstance(content, list):
            continue
        for block_index, block in enumerate(content):
            if isinstance(block, dict) and block.get("type") == "toolCall":
                calls.append((entry_index, block_index, block, content))
    require(len(calls) == 1, "owned GLM exactly one sole tool call")
    entry_index, call_index, call, content = calls[0]
    call_receipt = parse_exact_glm_goal_raw_block(call)

    post_call = content[call_index + 1 :]
    require(len(post_call) in (0, 1), "owned GLM zero or one post-call block")
    if not post_call:
        framing_receipt = {"present": False, "block_count": 0, "kind": "none", "bytes": 0}
        return raw, raw, call_receipt, framing_receipt

    block = post_call[0]
    require(isinstance(block, dict) and set(block) == {"type", "text"}, "owned GLM final framing text block")
    require(block.get("type") == "text" and isinstance(block.get("text"), str), "owned GLM framing text")
    framing_text = block["text"]
    kind = classify_post_call_framing(framing_text)
    framing_bytes = framing_text.encode("utf-8")
    framing_receipt = {
        "present": True,
        "block_count": 1,
        "kind": kind,
        "bytes": len(framing_bytes),
        "sha256": pipeline.sha256_bytes(framing_bytes),
    }

    sanitized_entries = copy.deepcopy(entries)
    sanitized_message = sanitized_entries[entry_index]["message"]
    sanitized_message["content"] = sanitized_message["content"][: call_index + 1]
    slot_raw = raw[: omp_session.TITLE_SLOT_BYTES]
    sanitized = slot_raw + pipeline.jsonl_bytes([header, *sanitized_entries])
    return raw, sanitized, call_receipt, framing_receipt


def verify_session_owned(path: Path, **kwargs: Any) -> dict[str, Any]:
    source_raw, projected_raw, call_receipt, framing_receipt = compatibility_projection(path)
    if projected_raw == source_raw:
        projection = ORIGINAL_VERIFY_SESSION(path, **kwargs)
    else:
        with tempfile.TemporaryDirectory(prefix="pm-r10-owned-glm-compat-") as temporary:
            projected_path = Path(temporary) / "session.jsonl"
            projected_path.write_bytes(projected_raw)
            projection = ORIGINAL_VERIFY_SESSION(projected_path, **kwargs)
    projection["session_file_bytes"] = len(source_raw)
    projection["session_file_sha256"] = pipeline.sha256_bytes(source_raw)
    projection["owned_glm_goal_call"] = call_receipt
    projection["owned_glm_post_call_framing"] = framing_receipt
    return projection


def expected_argv(route: dict[str, Any], planned: dict[str, Any]) -> list[str]:
    runtime = contract()["runtime"]
    return [
        runtime["binary"],
        "--config",
        str(OVERLAY_PATH),
        "--session-dir",
        planned["session_dir"],
        "--no-title",
        "--no-tools",
        "--no-skills",
        "--no-rules",
        "--cwd",
        planned["cwd"],
        "--model",
        route["model"],
        "--thinking",
        route["thinking"],
    ]


def journal_rows(evidence_root: Path | None = None) -> list[dict[str, Any]]:
    root = EVIDENCE if evidence_root is None else evidence_root
    path = root / "launch_journal.jsonl"
    if not os.path.lexists(path):
        return []
    require(path.is_file() and not path.is_symlink(), "probe journal file")
    raw = path.read_bytes()
    require(raw and raw.endswith(b"\n"), "probe journal nonempty canonical JSONL")
    lines = raw.decode("utf-8").splitlines()
    require(lines and all(line for line in lines), "probe journal has no blank rows")
    result = []
    for line in lines:
        value = pipeline.strict_loads(line)
        require(isinstance(value, dict), "probe journal object")
        result.append(value)
    require(raw == pipeline.jsonl_bytes(result), "probe journal canonical JSONL bytes")
    return result


def row_evidence_dir(row: dict[str, Any], evidence_root: Path | None = None) -> Path:
    root = EVIDENCE if evidence_root is None else evidence_root
    require(
        Path(row["evidence_path"]).parts == ("evidence", row["pass_id"], row["route_id"]),
        "probe planned evidence leaf",
    )
    return root / row["pass_id"] / row["route_id"]


def verify_completed_row(row: dict[str, Any], evidence_root: Path | None = None) -> dict[str, Any]:
    row_dir = row_evidence_dir(row, evidence_root)
    require(row_dir.is_dir() and not row_dir.is_symlink(), "probe evidence leaf directory")
    terminal_path = row_dir / "terminal.json"
    require(terminal_path.is_file() and not terminal_path.is_symlink(), "probe terminal file")
    terminal = pipeline.load_json(terminal_path)
    require(terminal.get("status") == "PASS", "prior Ox probe row not PASS")
    require(terminal.get("qualification_credit") == 0 and terminal.get("no_retry") is True, "probe credit/retry")
    for field in IDENTITY_FIELDS:
        require(terminal.get(field) == row[field], f"probe terminal identity: {field}")
    launch_path = row_dir / "launch.json"
    preflight_path = row_dir / "omp_preflight.json"
    require(launch_path.is_file() and not launch_path.is_symlink(), "probe launch file")
    require(preflight_path.is_file() and not preflight_path.is_symlink(), "probe preflight file")
    launch = pipeline.load_json(launch_path)
    for field in IDENTITY_FIELDS:
        require(launch.get(field) == row[field], f"probe launch identity: {field}")
    require(launch.get("argv") == expected_argv(route_map()[row["route_id"]], row), "probe launch argv")
    require(launch.get("model") == row["model"] and launch.get("thinking") == row["thinking"], "probe launch route")
    require(isinstance(launch.get("pid"), int) and not isinstance(launch.get("pid"), bool) and launch["pid"] > 0, "probe launch PID")
    preflight = pipeline.load_json(preflight_path)
    for field in IDENTITY_FIELDS:
        require(preflight.get(field) == row[field], f"probe preflight identity: {field}")
    require(preflight.get("tools_format_requested") == "glm", "probe GLM preflight")
    require(preflight.get("row_time_budget_seconds") == 3600, "probe time budget")
    require(preflight.get("overlay") == file_record(OVERLAY_PATH), "probe overlay receipt")
    require(preflight.get("expected_argv") == launch["argv"], "probe preflight/launch argv join")
    source_session = row_dir / "session.raw.jsonl"
    projection = verify_session_owned(
        source_session,
        expected_cwd=row["cwd"],
        expected_objective=(V7 / "prompts" / "omp.prompt.txt").read_text(encoding="utf-8")[len("/goal ") :],
        expected_provider="opencode-go",
        expected_model="ox-alpha-free",
        expected_selector=row["model"],
        expected_thinking=row["thinking"],
        require_exit=True,
    )
    base.exact_result(projection["final_text"])
    require(projection["ordinary_tool_calls"] == 0, "probe ordinary tools")
    require(projection["assistant_lifecycle_shape"] == "standard_tool_cycle", "distinct final assistant lifecycle")
    require(terminal.get("session_projection", {}).get("goal_id") == projection["goal_id"], "probe Goal identity")
    require(terminal.get("goal_activation_observed") is True and terminal.get("goal_complete_observed") is True, "probe Goal terminal")
    require(terminal.get("observed_non_goal_tool_calls") == 0 and terminal.get("process_exit_code") == 0, "probe tools/process terminal")
    evidence = terminal.get("evidence")
    require(isinstance(evidence, list) and len(evidence) == 15, "probe terminal evidence roster")
    recorded = []
    for record in evidence:
        require(isinstance(record, dict) and set(record) == {"path", "bytes", "sha256"}, "probe evidence record")
        relative = record["path"]
        require(isinstance(relative, str) and "/" not in relative, "probe evidence relative path")
        path = row_dir / relative
        require(path.is_file() and not path.is_symlink(), f"probe evidence file: {relative}")
        require(path.stat().st_size == record["bytes"] and pipeline.sha256_file(path) == record["sha256"], f"probe evidence join: {relative}")
        recorded.append(relative)
    require(len(set(recorded)) == len(recorded) and set(recorded) == set(ROW_EVIDENCE_NAMES), "probe exact named evidence roster")
    actual_entries = list(row_dir.iterdir())
    require(all(path.is_file() and not path.is_symlink() for path in actual_entries), "probe row contains only regular files")
    require({path.name for path in actual_entries} == {*ROW_EVIDENCE_NAMES, "terminal.json"}, "probe exact evidence roster")
    return {
        "route_id": row["route_id"],
        "status": "PASS",
        "session_id": projection["session_id"],
        "goal_id": projection["goal_id"],
        "framing": projection["owned_glm_post_call_framing"],
    }


def verify_prefix_state(evidence_root: Path | None = None) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    root = EVIDENCE if evidence_root is None else evidence_root
    journal = journal_rows(root)
    require(len(journal) in (0, 1), "probe journal length is exactly zero or one")
    if not journal:
        require(not os.path.lexists(root), "zero-row prefix requires absent evidence root and leaf")
        return journal, []

    require(root.is_dir() and not root.is_symlink(), "probe evidence root directory")
    root_entries = {path.name: path for path in root.iterdir()}
    require(set(root_entries) == {"launch_journal.jsonl", "probe_01"}, "probe exact evidence-root entries")
    require(root_entries["launch_journal.jsonl"].is_file() and not root_entries["launch_journal.jsonl"].is_symlink(), "probe regular journal")
    pass_dir = root_entries["probe_01"]
    require(pass_dir.is_dir() and not pass_dir.is_symlink(), "probe pass directory")
    pass_entries = {path.name: path for path in pass_dir.iterdir()}
    require(set(pass_entries) == {"omp_ox_alpha_free_max"}, "probe exact pass entries")
    row = rows()[0]
    row_dir = pass_entries["omp_ox_alpha_free_max"]
    require(row_dir == row_evidence_dir(row, root), "probe exact evidence leaf")
    require(row_dir.is_dir() and not row_dir.is_symlink(), "probe regular evidence leaf")

    actual = journal[0]
    require(set(actual) == JOURNAL_KEYS, "probe exact journal receipt shape")
    require(actual.get("schema_id") == "pm.r10.storage_pipeline.launch_journal.v2", "probe journal schema")
    for field in IDENTITY_FIELDS:
        require(actual.get(field) == row[field], f"probe journal identity: {field}")
    launch_path = row_dir / "launch.json"
    preflight_path = row_dir / "omp_preflight.json"
    require(launch_path.is_file() and not launch_path.is_symlink(), "probe journal launch leaf")
    require(preflight_path.is_file() and not preflight_path.is_symlink(), "probe journal preflight leaf")
    require(actual.get("launch_sha256") == pipeline.sha256_file(launch_path), "probe journal launch hash")
    require(actual.get("omp_preflight_sha256") == pipeline.sha256_file(preflight_path), "probe journal preflight hash")
    launch = pipeline.load_json(launch_path)
    preflight = pipeline.load_json(preflight_path)
    for field in IDENTITY_FIELDS:
        require(launch.get(field) == row[field], f"probe journal/launch identity: {field}")
        require(preflight.get(field) == row[field], f"probe journal/preflight identity: {field}")
    require(actual.get("started_at_utc") == launch.get("started_at_utc"), "probe journal start-time join")
    require(actual.get("popen_observed") is True, "probe journal Popen receipt")
    require(
        isinstance(actual.get("pid"), int)
        and not isinstance(actual.get("pid"), bool)
        and actual["pid"] > 0
        and actual["pid"] == launch.get("pid"),
        "probe journal PID join",
    )
    return journal, [verify_completed_row(row, root)]


def verify_next_row(planned: dict[str, Any]) -> list[dict[str, Any]]:
    journal, reports = verify_prefix_state()
    require(len(journal) == 0, "fresh Ox probe already consumed")
    require(not reports, "fresh Ox probe has no completed prefix")
    require(planned["ordinal"] == 1 and planned["route_id"] == "omp_ox_alpha_free_max", "exact sole Ox ordinal")
    return journal


def row_preflight(row_dir: Path, planned: dict[str, Any], route: dict[str, Any]) -> dict[str, Any]:
    spec = contract()
    runtime = spec["runtime"]
    binary = Path(runtime["binary"])
    environment = dict(os.environ)
    environment["PI_CODING_AGENT_DIR"] = runtime["profile_dir"]
    version_process = run_text([str(binary), "--version"], environment=environment)
    require(version_process.returncode == 0 and version_process.stdout.strip() == runtime["version"], "OMP version preflight")

    frozen_runtime = pipeline.load_json(V7 / "runtime_manifest.json")["omp"]
    commands = []
    observed: dict[str, Any] = {}
    for key, expected in frozen_runtime["effective_config"].items():
        process = run_text([str(binary), "config", "get", key], environment=environment)
        raw = process.stdout.strip()
        commands.append({"argv": [str(binary), "config", "get", key], "key": key, "exit_code": process.returncode, "stdout": raw})
        require(process.returncode == 0, f"OMP config command: {key}")
        value = pipeline.strict_loads(raw) if raw in {"true", "false"} or raw.startswith(("{", "[", '"')) else raw
        require(value == expected, f"OMP baseline config drift: {key}")
        observed[key] = value
    require(observed["advisor.enabled"] is False, "advisor disabled")
    require(observed["task.agentAdvisor"] == {"task": "off"}, "task advisor disabled")

    receipt = {
        "schema_id": "pm.r10.storage_pipeline.glm_ox_compat_preflight.v2",
        **{field: planned[field] for field in ("pass_id", "route_id", "ordinal", "attempt_id", "nonce")},
        "surface": route["surface"],
        "model": route["model"],
        "thinking": route["thinking"],
        "binary": str(binary),
        "binary_bytes": binary.stat().st_size,
        "binary_sha256": pipeline.sha256_file(binary),
        "version": version_process.stdout.strip(),
        "profile_dir": runtime["profile_dir"],
        "profile_config": file_record(Path(runtime["profile_dir"]) / "config.yml"),
        "baseline_config_commands": commands,
        "baseline_effective_config": observed,
        "tools_format_requested": "glm",
        "row_time_budget_seconds": runtime["row_time_budget_seconds"],
        "overlay": file_record(OVERLAY_PATH),
        "compatibility_adapter": spec["compatibility_adapter"],
        "expected_argv": expected_argv(route, planned),
        "probe_contract": file_record(CONTRACT_PATH),
        "git_custody": git_custody(),
        "observed_at_utc": base.utc_now(),
        "subject_calls": 0,
        "qualification_credit": 0,
    }
    base.atomic_json(row_dir / "omp_preflight.json", receipt)
    return receipt


def preserve_postfailure(planned: dict[str, Any]) -> None:
    row_dir = HERE / planned["evidence_path"]
    session_dir = Path(planned["session_dir"])
    if not row_dir.is_dir():
        return
    candidates = []
    if session_dir.is_dir() and not session_dir.is_symlink():
        candidates = [path for path in session_dir.iterdir() if path.is_file() and not path.is_symlink() and path.suffix == ".jsonl"]
    snapshot: dict[str, Any] = {
        "schema_id": "pm.r10.storage_pipeline.glm_ox_compat_postfailure.v2",
        **{field: planned[field] for field in ("pass_id", "route_id", "ordinal", "attempt_id", "nonce")},
        "captured_at_utc": base.utc_now(),
        "session_dir": str(session_dir),
        "session_dir_roster": base.diagnostic_roster(session_dir),
        "qualification_credit": 0,
        "no_retry": True,
    }
    if len(candidates) == 1:
        destination = row_dir / "postfailure_session.raw.jsonl"
        if not os.path.lexists(destination):
            pipeline.atomic_write(destination, candidates[0].read_bytes())
        snapshot["session_snapshot"] = file_record(destination)
    state_path = row_dir / "postfailure_state.json"
    if not os.path.lexists(state_path):
        base.atomic_json(state_path, snapshot)


def install_base_adapter() -> None:
    base.EVIDENCE = EVIDENCE
    base.route_map = route_map
    base.plan_rows = rows
    base.planned_row = planned_row
    base.journal_rows = journal_rows
    base.verify_next_row = verify_next_row
    base.row_preflight = row_preflight
    base.expected_argv = expected_argv
    omp_session.verify_session = verify_session_owned


def verify_prefix() -> dict[str, Any]:
    install_base_adapter()
    journal, reports = verify_prefix_state()
    return {
        "status": "PASS_DIAGNOSTIC_PREFIX",
        "rows": reports,
        "row_count": len(journal),
        "subject_calls": 0,
        "qualification_credit": 0,
    }


def session_kwargs(*, require_exit: bool) -> dict[str, Any]:
    route = rows()[0]
    return {
        "expected_cwd": "/tmp/pm-r10-storage-v7-selftest",
        "expected_objective": (V7 / "prompts" / "omp.prompt.txt").read_text(encoding="utf-8")[len("/goal ") :],
        "expected_provider": "opencode-go",
        "expected_model": "ox-alpha-free",
        "expected_selector": route["model"],
        "expected_thinking": route["thinking"],
        "require_exit": require_exit,
    }


def mutate_tool_cycle(raw: bytes, *, raw_block: str | None, post_blocks: list[dict[str, Any]]) -> bytes:
    def mutation(session_rows: list[dict[str, Any]]) -> None:
        call_message = next(
            row["message"]
            for row in session_rows
            if row.get("type") == "message"
            and row.get("message", {}).get("role") == "assistant"
            and any(block.get("type") == "toolCall" for block in row["message"]["content"])
        )
        call = next(block for block in call_message["content"] if block.get("type") == "toolCall")
        if raw_block is None:
            call.pop("rawBlock", None)
        else:
            call["rawBlock"] = raw_block
        call_position = call_message["content"].index(call)
        call_message["content"] = [*call_message["content"][: call_position + 1], *copy.deepcopy(post_blocks)]

    return v7_selftest.mutate_session(raw, mutation)


def compatibility_selftest() -> dict[str, Any]:
    checks = 0
    route = rows()[0]
    objective = (V7 / "prompts" / "omp.prompt.txt").read_text(encoding="utf-8")[len("/goal ") :]
    final_text = "bounded result\n" + pipeline.RESULT_PREFIX + pipeline.ORACLE_PATH.read_text(encoding="utf-8").strip()
    source = v7_selftest.synthetic_omp_session(route, objective, final_text)
    canonical_raw = "<tool_call>goal\n<arg_key>op</arg_key>\n<arg_value>complete</arg_value>\n</tool_call>"

    with tempfile.TemporaryDirectory(prefix="pm-r10-glm-v2-selftest-") as temporary:
        path = Path(temporary) / "session.jsonl"

        def verify(raw: bytes, *, require_exit: bool = True) -> dict[str, Any]:
            path.write_bytes(raw)
            return verify_session_owned(path, **session_kwargs(require_exit=require_exit))

        def verify_default(raw: bytes, *, require_exit: bool = True) -> dict[str, Any]:
            path.write_bytes(raw)
            return ORIGINAL_VERIFY_SESSION(path, **session_kwargs(require_exit=require_exit))

        def positive(label: str, post_blocks: list[dict[str, Any]], expected_kind: str) -> None:
            nonlocal checks
            raw = mutate_tool_cycle(source, raw_block=canonical_raw, post_blocks=post_blocks)
            projection = verify(raw)
            require(projection["final_text"] == final_text, f"{label} distinct final preserved")
            require(
                projection["assistant_lifecycle_shape"] == "standard_tool_cycle",
                f"{label} distinct final lifecycle preserved",
            )
            require(projection["pre_goal_call_text_utf8_bytes"] == 0, f"{label} framing absent from pre-call")
            require(projection["owned_glm_post_call_framing"]["kind"] == expected_kind, f"{label} framing kind")
            require("text" not in projection["owned_glm_post_call_framing"], f"{label} framing not projected as result")
            base.exact_result(projection["final_text"])
            require(projection["ordinary_tool_calls"] == 0, f"{label} zero ordinary tools")
            checks += 1

        positive("zero post-call blocks", [], "none")
        positive("ASCII whitespace", [{"type": "text", "text": "\t\r\n "}], "ascii_whitespace")
        positive("long ASCII whitespace", [{"type": "text", "text": " " * 10000}], "ascii_whitespace")
        positive("observed observation framing", [{"type": "text", "text": "\n\n<observation>\n"}], "observation_open")
        positive("bounded observation whitespace", [{"type": "text", "text": "\t<observation>\r\n"}], "observation_open")

        invalid_blocks = (
            ("empty text block", [{"type": "text", "text": ""}]),
            ("Unicode whitespace", [{"type": "text", "text": "\u00a0"}]),
            ("duplicate observation", [{"type": "text", "text": "<observation>\n<observation>"}]),
            ("closing observation", [{"type": "text", "text": "<observation>\n</observation>"}]),
            ("tool response", [{"type": "text", "text": "<observation>\n<tool_response>"}]),
            ("arbitrary prose", [{"type": "text", "text": "done"}]),
            ("PM_RESULT", [{"type": "text", "text": pipeline.RESULT_PREFIX + "{}"}]),
            ("observation plus prose", [{"type": "text", "text": "<observation>\nnot framing"}]),
            ("multiple following blocks", [{"type": "text", "text": "\n"}, {"type": "text", "text": "\n"}]),
            ("following thinking block", [{"type": "text", "text": "\n"}, {"type": "thinking", "thinking": "later"}]),
        )
        for label, blocks in invalid_blocks:
            raw = mutate_tool_cycle(source, raw_block=canonical_raw, post_blocks=blocks)
            expect_failure(lambda raw=raw: verify(raw), label)
            checks += 1

        invalid_raw_blocks = (
            ("missing rawBlock", None),
            ("generic XML rawBlock", '<invoke name="goal"><parameter name="op">complete</parameter></invoke>'),
            ("duplicate GLM call", canonical_raw + canonical_raw),
            ("Unicode raw whitespace", "<tool_call>goal\u00a0<arg_key>op</arg_key><arg_value>complete</arg_value></tool_call>"),
            ("wrong GLM argument", "<tool_call>goal\n<arg_key>op</arg_key>\n<arg_value>get</arg_value>\n</tool_call>"),
        )
        for label, raw_block in invalid_raw_blocks:
            raw = mutate_tool_cycle(source, raw_block=raw_block, post_blocks=[])
            expect_failure(lambda raw=raw: verify(raw), label)
            checks += 1

        framed = mutate_tool_cycle(source, raw_block=canonical_raw, post_blocks=[{"type": "text", "text": "\n<observation>\n"}])
        expect_failure(lambda: verify_default(framed), "underlying V7 remains strict", "final assistant block")
        checks += 1

        replay = contract()["diagnostic_replay"]
        replay_path = (HERE / replay["path"]).resolve()
        expect_failure(
            lambda: ORIGINAL_VERIFY_SESSION(replay_path, **{
                "expected_cwd": "/tmp/pm-r10-storage-v7-glm-probe-01-a58a224856",
                "expected_objective": objective,
                "expected_provider": "opencode-go",
                "expected_model": "ox-alpha-free",
                "expected_selector": "opencode-go/ox-alpha-free",
                "expected_thinking": "max",
                "require_exit": False,
            }),
            "consumed V1 default replay",
            "final assistant block",
        )
        checks += 1
        replay_projection = verify_session_owned(
            replay_path,
            expected_cwd="/tmp/pm-r10-storage-v7-glm-probe-01-a58a224856",
            expected_objective=objective,
            expected_provider="opencode-go",
            expected_model="ox-alpha-free",
            expected_selector="opencode-go/ox-alpha-free",
            expected_thinking="max",
            require_exit=False,
        )
        base.exact_result(replay_projection["final_text"])
        require(replay_projection["assistant_lifecycle_shape"] == "standard_tool_cycle", "consumed replay distinct final lifecycle")
        require(replay_projection["session_file_bytes"] == replay["bytes"], "consumed replay source bytes")
        require(replay_projection["session_file_sha256"] == replay["sha256"], "consumed replay source hash")
        require(replay_projection["owned_glm_goal_call"] == {
            "present": True,
            "bytes": 82,
            "sha256": "d6897df63bd35ea8e7b3eb5e036068814b6ed65712b7876879d5f19afdc8e013",
            "canonical_name": "goal",
            "canonical_arguments": {"op": "complete"},
        }, "consumed replay exact owned-GLM call receipt")
        require(replay_projection["owned_glm_post_call_framing"] == {
            "present": True,
            "block_count": 1,
            "kind": "observation_open",
            "bytes": 16,
            "sha256": "5883e677b1d882f0376d9aa1ea1d87cd67d6b5e9180e790535c40ee2efa23278",
        }, "consumed replay exact framing receipt")
        checks += 1
        expect_failure(
            lambda: verify_session_owned(
                replay_path,
                expected_cwd="/tmp/pm-r10-storage-v7-glm-probe-01-a58a224856",
                expected_objective=objective,
                expected_provider="opencode-go",
                expected_model="ox-alpha-free",
                expected_selector="opencode-go/ox-alpha-free",
                expected_thinking="max",
                require_exit=True,
            ),
            "consumed V1 abnormal exit remains failure",
            "normal session exit",
        )
        checks += 1

    require(checks == 24, "exact compatibility selftest count")
    return {"status": "PASS_COMPATIBILITY_ZERO_SUBJECT", "checks": checks, "subject_calls": 0}


def write_synthetic_prefix_fixture(root: Path) -> Path:
    row = rows()[0]
    row_dir = root / row["pass_id"] / row["route_id"]
    row_dir.mkdir(parents=True)
    objective = (V7 / "prompts" / "omp.prompt.txt").read_text(encoding="utf-8")[len("/goal ") :]
    final_text = "bounded result\n" + pipeline.RESULT_PREFIX + pipeline.ORACLE_PATH.read_text(encoding="utf-8").strip()
    source = v7_selftest.synthetic_omp_session(row, objective, final_text)
    canonical_raw = "<tool_call>goal\n<arg_key>op</arg_key>\n<arg_value>complete</arg_value>\n</tool_call>"

    def customize(session_rows: list[dict[str, Any]]) -> None:
        session_rows[0]["cwd"] = row["cwd"]
        call = next(
            block
            for entry in session_rows
            if entry.get("type") == "message" and entry.get("message", {}).get("role") == "assistant"
            for block in entry["message"]["content"]
            if block.get("type") == "toolCall"
        )
        call["rawBlock"] = canonical_raw

    session_raw = v7_selftest.mutate_session(source, customize)
    session_path = row_dir / "session.raw.jsonl"
    session_path.write_bytes(session_raw)
    projection = verify_session_owned(
        session_path,
        expected_cwd=row["cwd"],
        expected_objective=objective,
        expected_provider="opencode-go",
        expected_model="ox-alpha-free",
        expected_selector=row["model"],
        expected_thinking=row["thinking"],
        require_exit=True,
    )
    base.exact_result(projection["final_text"])

    started_at = "2026-08-26T03:00:00Z"
    pid = 424242
    identity = {field: row[field] for field in IDENTITY_FIELDS}
    launch = {
        "schema_id": "pm.r10.storage_pipeline.launch.v2",
        **identity,
        "surface": row["surface"],
        "model": row["model"],
        "thinking": row["thinking"],
        "argv": expected_argv(route_map()[row["route_id"]], row),
        "pid": pid,
        "started_at_utc": started_at,
    }
    preflight = {
        "schema_id": "pm.r10.storage_pipeline.glm_ox_compat_preflight.v2",
        **identity,
        "tools_format_requested": "glm",
        "row_time_budget_seconds": 3600,
        "overlay": file_record(OVERLAY_PATH),
        "expected_argv": launch["argv"],
    }
    (row_dir / "launch.json").write_bytes(pipeline.pretty_json(launch))
    (row_dir / "omp_preflight.json").write_bytes(pipeline.pretty_json(preflight))
    for name in ROW_EVIDENCE_NAMES:
        path = row_dir / name
        if not path.exists():
            path.write_bytes(("synthetic-prefix-fixture:" + name + "\n").encode("utf-8"))
    evidence_records = [
        {
            "path": name,
            "bytes": (row_dir / name).stat().st_size,
            "sha256": pipeline.sha256_file(row_dir / name),
        }
        for name in ROW_EVIDENCE_NAMES
    ]
    terminal = {
        "schema_id": "pm.r10.storage_pipeline.terminal.v2",
        **identity,
        "surface": row["surface"],
        "model": row["model"],
        "thinking": row["thinking"],
        "status": "PASS",
        "goal_activation_observed": True,
        "goal_complete_observed": True,
        "final_assistant_text": projection["final_text"],
        "observed_non_goal_tool_calls": 0,
        "no_retry": True,
        "process_exit_code": 0,
        "qualification_credit": 0,
        "session_projection": {"goal_id": projection["goal_id"]},
        "evidence": evidence_records,
    }
    (row_dir / "terminal.json").write_bytes(pipeline.pretty_json(terminal))
    journal = {
        "schema_id": "pm.r10.storage_pipeline.launch_journal.v2",
        **identity,
        "started_at_utc": started_at,
        "launch_sha256": pipeline.sha256_file(row_dir / "launch.json"),
        "omp_preflight_sha256": pipeline.sha256_file(row_dir / "omp_preflight.json"),
        "popen_observed": True,
        "pid": pid,
    }
    (root / "launch_journal.jsonl").write_bytes(pipeline.jsonl_bytes([journal]))
    return row_dir


def prefix_custody_selftest() -> dict[str, Any]:
    checks = 0

    def write_journal(root: Path, records: list[dict[str, Any]]) -> None:
        (root / "launch_journal.jsonl").write_bytes(pipeline.jsonl_bytes(records))

    def mutate_journal(root: Path, field: str, value: Any) -> None:
        records = journal_rows(root)
        records[0][field] = value
        write_journal(root, records)

    def mutate_receipt(root: Path, row_dir: Path, name: str, field: str, value: Any) -> None:
        path = row_dir / name
        receipt = pipeline.load_json(path)
        receipt[field] = value
        path.write_bytes(pipeline.pretty_json(receipt))
        hash_field = "launch_sha256" if name == "launch.json" else "omp_preflight_sha256"
        mutate_journal(root, hash_field, pipeline.sha256_file(path))

    with tempfile.TemporaryDirectory(prefix="pm-r10-glm-v2-prefix-zero-") as temporary:
        root = Path(temporary) / "evidence"
        journal, reports = verify_prefix_state(root)
        require(journal == [] and reports == [] and not os.path.lexists(root), "zero-row prefix positive")
        checks += 1

    with tempfile.TemporaryDirectory(prefix="pm-r10-glm-v2-prefix-one-") as temporary:
        root = Path(temporary) / "evidence"
        write_synthetic_prefix_fixture(root)
        journal, reports = verify_prefix_state(root)
        require(len(journal) == 1 and len(reports) == 1 and reports[0]["status"] == "PASS", "one-row prefix positive")
        checks += 1

    def negative(label: str, mutation: Callable[[Path, Path], None]) -> None:
        nonlocal checks
        with tempfile.TemporaryDirectory(prefix="pm-r10-glm-v2-prefix-negative-") as temporary:
            root = Path(temporary) / "evidence"
            row_dir = write_synthetic_prefix_fixture(root)
            mutation(root, row_dir)
            expect_failure(lambda: verify_prefix_state(root), label)
            checks += 1

    negative("two journal rows", lambda root, _row: write_journal(root, [*journal_rows(root), *journal_rows(root)]))
    negative("empty-journal consumed leaf", lambda root, _row: (root / "launch_journal.jsonl").unlink())
    negative("unexpected root entry", lambda root, _row: (root / "unexpected").write_bytes(b"unexpected"))
    negative("unexpected pass entry", lambda root, _row: (root / "probe_01" / "unexpected").write_bytes(b"unexpected"))
    negative("unexpected row entry", lambda _root, row: (row / "unexpected").write_bytes(b"unexpected"))

    with tempfile.TemporaryDirectory(prefix="pm-r10-glm-v2-prefix-root-link-") as temporary:
        parent = Path(temporary)
        target = parent / "target"
        target.mkdir()
        root = parent / "evidence"
        root.symlink_to(target, target_is_directory=True)
        expect_failure(lambda: verify_prefix_state(root), "symlink evidence root")
        checks += 1

    def replace_row_with_symlink(root: Path, row_dir: Path) -> None:
        target = root.parent / "real-row"
        row_dir.rename(target)
        row_dir.symlink_to(target, target_is_directory=True)

    negative("symlink evidence leaf", replace_row_with_symlink)
    negative("journal identity mismatch", lambda root, _row: mutate_journal(root, "attempt_id", "wrong-attempt"))
    negative("launch identity mismatch", lambda root, row: mutate_receipt(root, row, "launch.json", "nonce", "0" * 32))
    negative("preflight identity mismatch", lambda root, row: mutate_receipt(root, row, "omp_preflight.json", "route_id", "wrong-route"))
    negative("journal launch hash mismatch", lambda root, _row: mutate_journal(root, "launch_sha256", "0" * 64))
    negative("journal preflight hash mismatch", lambda root, _row: mutate_journal(root, "omp_preflight_sha256", "0" * 64))
    negative("journal Popen mismatch", lambda root, _row: mutate_journal(root, "popen_observed", False))
    negative("journal PID mismatch", lambda root, _row: mutate_journal(root, "pid", 424243))

    require(checks == 16, "exact prefix-custody selftest count")
    return {"status": "PASS_PREFIX_CUSTODY_ZERO_SUBJECT", "checks": checks, "subject_calls": 0}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("lint")
    subparsers.add_parser("verify-prefix")
    run_parser = subparsers.add_parser("run")
    run_parser.add_argument("route_id", choices=RUN_ROUTE_IDS)
    run_parser.add_argument("--max-seconds", type=int, default=3600)
    return parser


PRELAUNCH_ERRORS = (
    ProbeError,
    pipeline.PipelineError,
    subprocess.SubprocessError,
    OSError,
    ValueError,
    KeyError,
    TypeError,
    AssertionError,
)


def dispatch(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        if args.command == "lint":
            print(pipeline.canonical_json(validate_static(require_unused=True, include_selftests=True)))
            return 0
        validate_static(require_unused=False, include_selftests=False)
        if args.command == "verify-prefix":
            print(pipeline.canonical_json(verify_prefix()))
            return 0
        require(args.max_seconds == 3600, "max-seconds differs from frozen diagnostic budget")
        require_route_authorized(args.route_id)
        git_custody()
        install_base_adapter()
        planned = planned_row("probe_01", args.route_id)
        try:
            terminal = base.run_row("probe_01", args.route_id, args.max_seconds)
            print(
                pipeline.canonical_json(
                    {"status": "PASS_ZERO_CREDIT_DIAGNOSTIC", "terminal": terminal, "qualification_credit": 0}
                )
            )
            return 0
        except base.ReservationConflict as exc:
            print(
                pipeline.canonical_json(
                    {
                        "status": "FAIL_ALREADY_CONSUMED_NO_MUTATION",
                        "error": f"{type(exc).__name__}: {exc}",
                        "qualification_credit": 0,
                    }
                )
            )
            return 1
        except (
            base.RunnerError,
            omp_session.OmpSessionError,
            pipeline.PipelineError,
            ProbeError,
            subprocess.SubprocessError,
            OSError,
            ValueError,
            KeyError,
            TypeError,
            AssertionError,
        ) as exc:
            row_dir = HERE / planned["evidence_path"]
            if not os.path.lexists(row_dir):
                print(
                    pipeline.canonical_json(
                        {
                            "status": "FAIL_PRELAUNCH_NO_MUTATION",
                            "error": f"{type(exc).__name__}: {exc}",
                            "qualification_credit": 0,
                        }
                    )
                )
                return 1
            preserve_postfailure(planned)
            base.record_failure("probe_01", args.route_id, exc)
            print(
                pipeline.canonical_json(
                    {
                        "status": "FAIL_CONSUMED_ZERO_CREDIT_NO_RETRY",
                        "error": f"{type(exc).__name__}: {exc}",
                        "qualification_credit": 0,
                    }
                )
            )
            return 1
    except PRELAUNCH_ERRORS as exc:
        print(
            pipeline.canonical_json(
                {
                    "status": "FAIL_PRELAUNCH_NO_MUTATION",
                    "error": f"{type(exc).__name__}: {exc}",
                    "qualification_credit": 0,
                }
            )
        )
        return 1


def main_path_selftest() -> dict[str, Any]:
    require(not os.path.lexists(EVIDENCE), "main-path selftest requires absent evidence root")
    popen_calls = 0
    saved = {
        "validate_static": globals()["validate_static"],
        "require_route_authorized": globals()["require_route_authorized"],
        "git_custody": globals()["git_custody"],
        "install_base_adapter": globals()["install_base_adapter"],
        "run_row": base.run_row,
        "popen": subprocess.Popen,
    }

    def forbidden_popen(*args: Any, **kwargs: Any) -> Any:
        nonlocal popen_calls
        popen_calls += 1
        raise ProbeError("zero-subject Popen forbidden")

    def raised(message: str) -> Callable[..., Any]:
        def reject(*args: Any, **kwargs: Any) -> Any:
            raise ProbeError(message)

        return reject

    def run_case(expected_status: str) -> None:
        stream = io.StringIO()
        with contextlib.redirect_stdout(stream), contextlib.redirect_stderr(io.StringIO()):
            code = dispatch(["run", "omp_ox_alpha_free_max", "--max-seconds", "3600"])
        require(code == 1, f"{expected_status} exit code")
        lines = [line for line in stream.getvalue().splitlines() if line.strip()]
        require(len(lines) == 1, f"{expected_status} one terminal receipt")
        receipt = pipeline.strict_loads(lines[0])
        require(receipt.get("status") == expected_status, f"{expected_status} receipt")
        require(not os.path.lexists(EVIDENCE), f"{expected_status} leaves evidence absent")

    try:
        subprocess.Popen = forbidden_popen
        globals()["validate_static"] = lambda **kwargs: {"status": "SYNTHETIC_STATIC"}
        globals()["install_base_adapter"] = lambda: None
        globals()["require_route_authorized"] = raised("synthetic authority failure")
        globals()["git_custody"] = raised("custody must not run after authority")
        base.run_row = raised("runner must not run after authority")
        run_case("FAIL_PRELAUNCH_NO_MUTATION")

        globals()["require_route_authorized"] = lambda route_id: None
        globals()["git_custody"] = raised("synthetic pushed custody failure")
        base.run_row = raised("runner must not run after custody")
        run_case("FAIL_PRELAUNCH_NO_MUTATION")

        globals()["git_custody"] = lambda: {"head": "synthetic"}
        base.run_row = raised("synthetic reservation reuse")
        original_conflict = base.ReservationConflict

        def reused(*args: Any, **kwargs: Any) -> Any:
            raise original_conflict("synthetic row already consumed")

        base.run_row = reused
        run_case("FAIL_ALREADY_CONSUMED_NO_MUTATION")
    finally:
        globals()["validate_static"] = saved["validate_static"]
        globals()["require_route_authorized"] = saved["require_route_authorized"]
        globals()["git_custody"] = saved["git_custody"]
        globals()["install_base_adapter"] = saved["install_base_adapter"]
        base.run_row = saved["run_row"]
        subprocess.Popen = saved["popen"]

    require(popen_calls == 0, "authority/custody/reuse paths perform zero Popen calls")
    require(RUN_ROUTE_IDS == ("omp_ox_alpha_free_max",), "only Ox is mechanically launchable")
    expect_failure(lambda: require_route_authorized("omp_muse_spark_xhigh"), "non-Ox route authority")
    require(not os.path.lexists(EVIDENCE), "main-path selftests leave evidence absent")
    return {
        "status": "PASS_MAIN_PATH_ZERO_SUBJECT",
        "checks": 4,
        "popen_calls": popen_calls,
        "subject_calls": 0,
    }


def validate_static(*, require_unused: bool, include_selftests: bool) -> dict[str, Any]:
    spec = contract()
    runtime = spec["runtime"]
    authority_text = "You can run as many free Ox runs as you want.  Dont ask going forward"
    authority = spec.get("authority")
    require(
        authority
        == {
            "status": "AUTHORIZED_FREE_OX_NO_FUTURE_PERMISSION_PROMPT",
            "source_thread_id": "01a034b9-a1c8-7a80-937f-4e45e3f2ae45",
            "recorded_at_utc": "2026-08-26T01:09:54Z",
            "user_text_utf8": authority_text,
            "user_text_utf8_bytes": 69,
            "user_text_sha256": "99df1f43d62da6ae6314c385f43208ac159374deed46c8b16382d3c9909d54e8",
            "preparation_authorizes_subject_call": False,
            "current_v2_ox_row_authorized": True,
            "current_v2_ox_row_one_use": True,
            "unlimited_fresh_free_ox_development_probes_authorized": True,
            "fresh_identity_required_for_each_additional_free_ox_run": True,
            "future_free_ox_permission_prompt_required": False,
            "consumed_v1_row_retry_authorized": False,
            "consumed_v1_row_retro_credit_authorized": False,
            "muse_or_non_ox_route_authorized": False,
            "further_dialect_authorized": False,
        },
        "exact standing free-Ox authority",
    )
    authority_bytes = authority_text.encode("utf-8")
    require(len(authority_bytes) == 69 and pipeline.sha256_bytes(authority_bytes) == authority["user_text_sha256"], "authority bytes/hash")

    actual_sources = sorted(path.name for path in HERE.iterdir() if path.is_file() and not path.is_symlink())
    require(actual_sources == sorted(OWNED_SOURCE_NAMES), "exact four-file V2 source roster")
    require(all((HERE / name).is_file() and not (HERE / name).is_symlink() for name in OWNED_SOURCE_NAMES), "regular V2 sources")

    prompt_spec = spec["source_prompt"]
    prompt_path = (HERE / prompt_spec["path"]).resolve()
    require(prompt_path == V7 / "prompts" / "omp.prompt.txt", "exact V7 prompt path")
    require(prompt_path.stat().st_size == 3036 and pipeline.sha256_file(prompt_path) == prompt_spec["sha256"], "exact prompt bytes/hash")
    require(prompt_path.read_bytes().startswith(b"/goal "), "native Goal prefix")
    require(pipeline.sha256_file(V7 / "freeze_manifest.json") == spec["source_freeze_manifest_sha256"], "V7 freeze lineage")

    verifier = spec["source_verifier"]
    parser_path = (HERE / verifier["v7_session_parser_path"]).resolve()
    scorer_path = (HERE / verifier["v7_runner_scorer_path"]).resolve()
    require(parser_path == V7 / "omp_session.py" and scorer_path == V7 / "omp_row_runner.py", "exact V7 verifier paths")
    require(parser_path.stat().st_size == verifier["v7_session_parser_bytes"] and pipeline.sha256_file(parser_path) == verifier["v7_session_parser_sha256"], "unchanged V7 parser")
    require(scorer_path.stat().st_size == verifier["v7_runner_scorer_bytes"] and pipeline.sha256_file(scorer_path) == verifier["v7_runner_scorer_sha256"], "unchanged V7 scorer")

    replay = spec["diagnostic_replay"]
    replay_path = (HERE / replay["path"]).resolve()
    require(replay_path == V1 / "evidence/probe_01/omp_ox_alpha_free_max/postfailure_session.raw.jsonl", "exact V1 replay path")
    require(replay_path.stat().st_size == replay["bytes"] and pipeline.sha256_file(replay_path) == replay["sha256"], "exact V1 replay bytes/hash")

    binary = Path(runtime["binary"])
    require(binary.is_file() and not binary.is_symlink(), "OMP binary")
    require(binary.stat().st_size == runtime["binary_bytes"] and pipeline.sha256_file(binary) == runtime["binary_sha256"], "OMP binary bytes/hash")
    profile_config = Path(runtime["profile_dir"]) / "config.yml"
    require(profile_config.stat().st_size == runtime["profile_config_bytes"] and pipeline.sha256_file(profile_config) == runtime["profile_config_sha256"], "profile bytes/hash")
    require(OVERLAY_PATH.read_bytes() == b"tools:\n  format: glm\n", "exact GLM overlay")
    require(OVERLAY_PATH.stat().st_size == 21 and pipeline.sha256_file(OVERLAY_PATH) == runtime["overlay_sha256"], "overlay bytes/hash")
    require(runtime["row_time_budget_seconds"] == 3600, "exact one-hour budget")
    require(runtime["advisor_enabled"] is False and runtime["task_agent_advisor"] == {"task": "off"}, "advisor-off contract")
    require(runtime["ordinary_tools_enabled"] is False, "no ordinary tools contract")

    planned = rows()[0]
    require(planned["ordinal"] == 1 and planned["route_id"] == "omp_ox_alpha_free_max", "sole Ox ordinal")
    require(planned["model"] == "opencode-go/ox-alpha-free" and planned["thinking"] == "max", "exact Ox selector")
    require(planned["attempt_id"] == "glm-probe-v2-01-" + planned["nonce"][:10], "attempt/nonce binding")
    require(len(planned["nonce"]) == 32, "nonce width")
    require(planned["cwd"] == "/tmp/pm-r10-storage-v7-glm-probe-v2-01-" + planned["nonce"][:10], "cwd identity")
    require(planned["session_dir"] == "/tmp/pm-r10-storage-v7-session-glm-probe-v2-01-" + planned["nonce"][:10], "session identity")
    require(planned["evidence_path"] == "evidence/probe_01/omp_ox_alpha_free_max", "evidence identity")
    require(spec["sequencing"] == {
        "exact_order": ["omp_ox_alpha_free_max"],
        "fail_stop": True,
        "retry_count": 0,
        "replacement_count": 0,
        "best_of": False,
        "qualification_credit": 0,
        "muse_or_suffix_route_count": 0,
    }, "Ox-only fail-stop sequencing")
    require(RUN_ROUTE_IDS == tuple(spec["sequencing"]["exact_order"]), "CLI route closure")
    validate_fresh_identity(planned)
    if require_unused:
        require(not os.path.lexists(planned["cwd"]), "fresh cwd absent")
        require(not os.path.lexists(planned["session_dir"]), "fresh session path absent")
        require(not os.path.lexists(HERE / planned["evidence_path"]), "fresh evidence path absent")
        require(not os.path.lexists(EVIDENCE), "fresh evidence root absent")

    adapter = spec["compatibility_adapter"]
    require(adapter["source_defined_ascii_whitespace_codepoints"] == [9, 10, 13, 32], "closed ASCII whitespace set")
    require(adapter["allowed_post_call_block_counts"] == [0, 1], "closed post-call block counts")
    require(adapter["optional_literal"] == OBSERVATION_OPEN and adapter["optional_literal_exact_count"] == 1, "exact observation opener")
    require(adapter["post_call_byte_ceiling"] is None, "no invented framing byte ceiling")
    require(all(adapter[key] is False for key in (
        "unicode_whitespace_allowed",
        "closing_observation_marker_allowed",
        "tool_response_marker_allowed",
        "arbitrary_prose_allowed",
        "pm_result_allowed",
        "multiple_or_following_blocks_allowed",
        "framing_in_pre_call_text",
        "framing_in_final_text",
        "framing_in_scoring",
        "framing_in_goal_lifecycle",
    )), "closed compatibility exclusions")
    require(spec["prefix_custody"] == {
        "allowed_journal_row_counts": [0, 1],
        "zero_rows_require_absent_evidence_root_and_leaf": True,
        "one_row_requires_exact_root_pass_row_layout": True,
        "one_row_requires_exact_planned_identity": True,
        "one_row_requires_launch_and_preflight_hash_joins": True,
        "one_row_requires_popen_observed_true": True,
        "one_row_requires_positive_launch_joined_pid": True,
        "one_row_requires_exact_terminal_evidence_roster": True,
        "extra_or_symlinked_root_pass_row_entries_allowed": False,
    }, "closed prefix-custody contract")
    require(spec["row_acceptance"]["distinct_final_assistant_required"] is True, "distinct final required")
    require(spec["row_acceptance"]["normal_process_exit_required"] is True, "normal exit required")

    pipeline_report = pipeline.verify()
    require(pipeline_report["status"] == "PASS_VERIFIED_NO_WORKNODES", "V7 derived verification")
    freeze = freeze_check.verify_freeze()
    require(freeze["status"] == "PASS_FROZEN_ZERO_SUBJECT", "V7 frozen source package")
    compatibility = compatibility_selftest() if include_selftests else {"status": "NOT_RUN"}
    prefix_custody = prefix_custody_selftest() if include_selftests else {"status": "NOT_RUN"}
    main_path = main_path_selftest() if include_selftests else {"status": "NOT_RUN"}
    return {
        "status": "PASS_LOCAL_GLM_V2_ZERO_SUBJECT",
        "subject_calls": 0,
        "qualification_credit": 0,
        "source_roster": list(OWNED_SOURCE_NAMES),
        "prompt": file_record(prompt_path),
        "overlay": file_record(OVERLAY_PATH),
        "row": planned,
        "compatibility_selftest": compatibility,
        "prefix_custody_selftest": prefix_custody,
        "main_path_selftest": main_path,
        "v7_freeze": freeze,
    }


def main() -> int:
    return dispatch()


if __name__ == "__main__":
    raise SystemExit(main())
