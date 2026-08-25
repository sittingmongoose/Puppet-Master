#!/usr/bin/env python3
"""Run the two-row, zero-credit owned-XML compatibility probe."""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parent
R10 = HERE.parent
V7 = R10 / "system_pipeline_sandbox_v7"
sys.path.insert(0, str(V7))

import freeze_check  # type: ignore[import-not-found]  # noqa: E402
import omp_row_runner as base  # type: ignore[import-not-found]  # noqa: E402
import omp_session  # type: ignore[import-not-found]  # noqa: E402
import pipeline  # type: ignore[import-not-found]  # noqa: E402


CONTRACT_PATH = HERE / "probe_contract.json"
OVERLAY_PATH = HERE / "tools_xml.config.yml"
EVIDENCE = HERE / "evidence"
OWNED_SOURCE_NAMES = ("README.md", "probe_contract.json", "probe_runner.py", "tools_xml.config.yml")
REPO = Path("/mnt/Cursor/PuppetMaster")
ORIGINAL_VERIFY_SESSION = omp_session.verify_session


class ProbeError(RuntimeError):
    pass


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ProbeError(message)


def contract() -> dict[str, Any]:
    value = pipeline.load_json(CONTRACT_PATH)
    require(value.get("schema_id") == "pm.r10.storage_pipeline.muse_owned_xml_probe.v1", "probe schema")
    require(value.get("status") == "PREREGISTERED_ZERO_CREDIT", "probe status")
    return value


def rows() -> list[dict[str, Any]]:
    value = contract().get("rows")
    require(isinstance(value, list) and len(value) == 2, "exact two-row probe")
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
    require(len(matches) == 1, "exact planned probe row")
    return matches[0]


def file_record(path: Path) -> dict[str, Any]:
    require(path.is_file() and not path.is_symlink(), f"regular file required: {path}")
    return {
        "path": str(path),
        "bytes": path.stat().st_size,
        "sha256": pipeline.sha256_file(path),
    }


def run_text(argv: list[str], *, environment: dict[str, str] | None = None, timeout: int = 30) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        argv,
        check=False,
        capture_output=True,
        text=True,
        env=environment,
        timeout=timeout,
    )


def git_custody() -> dict[str, Any]:
    head = run_text(["git", "-C", str(REPO), "rev-parse", "HEAD"]).stdout.strip()
    origin = run_text(["git", "-C", str(REPO), "rev-parse", "origin/main"]).stdout.strip()
    backup = run_text(["git", "-C", str(REPO), "rev-parse", "truenas-backup/main"]).stdout.strip()
    require(len(head) == 40 and head == origin == backup, "probe HEAD must be pushed to both remotes")
    source_commit = contract()["source_candidate_commit"]
    ancestry = run_text(["git", "-C", str(REPO), "merge-base", "--is-ancestor", source_commit, head])
    require(ancestry.returncode == 0, "V7 source candidate must be an ancestor")
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


def validate_static(*, require_unused: bool) -> dict[str, Any]:
    spec = contract()
    runtime = spec["runtime"]
    prompt_spec = spec["source_prompt"]
    prompt_path = (HERE / prompt_spec["path"]).resolve()
    require(prompt_path == V7 / "prompts" / "omp.prompt.txt", "exact V7 prompt path")
    require(prompt_path.stat().st_size == prompt_spec["utf8_bytes"], "prompt bytes")
    require(pipeline.sha256_file(prompt_path) == prompt_spec["sha256"], "prompt hash")
    require(prompt_path.read_bytes().startswith(b"/goal "), "OMP native Goal prefix")
    require(
        pipeline.sha256_file(V7 / "freeze_manifest.json") == spec["source_freeze_manifest_sha256"],
        "V7 freeze-manifest lineage hash",
    )

    binary = Path(runtime["binary"])
    require(binary.is_file() and not binary.is_symlink(), "OMP binary")
    require(binary.stat().st_size == runtime["binary_bytes"], "OMP binary bytes")
    require(pipeline.sha256_file(binary) == runtime["binary_sha256"], "OMP binary hash")
    profile_config = Path(runtime["profile_dir"]) / "config.yml"
    require(profile_config.stat().st_size == runtime["profile_config_bytes"], "profile config bytes")
    require(pipeline.sha256_file(profile_config) == runtime["profile_config_sha256"], "profile config hash")
    require(OVERLAY_PATH.read_bytes() == b"tools:\n  format: xml\n", "exact XML overlay bytes")
    require(OVERLAY_PATH.stat().st_size == runtime["overlay_bytes"], "overlay bytes")
    require(pipeline.sha256_file(OVERLAY_PATH) == runtime["overlay_sha256"], "overlay hash")
    require(runtime["row_time_budget_seconds"] == 3600, "exact diagnostic row time budget")

    planned = rows()
    require([row["ordinal"] for row in planned] == [1, 2], "probe ordinals")
    require([row["route_id"] for row in planned] == spec["sequencing"]["exact_order"], "probe route order")
    require(len({row["attempt_id"] for row in planned}) == 2, "unique attempts")
    require(len({row["nonce"] for row in planned}) == 2, "unique nonces")
    require(all(len(row["nonce"]) == 32 for row in planned), "nonce width")
    require(planned[0]["model"] == "opencode-go/ox-alpha-free" and planned[0]["thinking"] == "max", "free Ox first")
    require(
        planned[1]["model"] == "opencode-go/muse-spark-1.2-contributor" and planned[1]["thinking"] == "xhigh",
        "Muse second",
    )
    require(spec["sequencing"] == {
        "exact_order": ["omp_ox_alpha_free_max", "omp_muse_spark_xhigh"],
        "fail_stop": True,
        "retry_count": 0,
        "replacement_count": 0,
        "best_of": False,
        "qualification_credit": 0,
    }, "fail-stop contract")
    for row in planned:
        require(str(row["cwd"]).startswith("/tmp/pm-r10-storage-v7-xml-probe-"), "probe cwd scope")
        require(str(row["session_dir"]).startswith("/tmp/pm-r10-storage-v7-session-xml-probe-"), "probe session scope")
        require(row["evidence_path"] == f"evidence/probe_01/{row['route_id']}", "probe evidence path")
        if require_unused:
            require(not os.path.lexists(row["cwd"]), f"probe cwd already used: {row['route_id']}")
            require(not os.path.lexists(row["session_dir"]), f"probe session already used: {row['route_id']}")
            require(not os.path.lexists(HERE / row["evidence_path"]), f"probe evidence already used: {row['route_id']}")
    if require_unused:
        require(not os.path.lexists(EVIDENCE), "probe evidence root already consumed")

    pipeline.verify()
    freeze = freeze_check.verify_freeze()
    require(freeze["status"] == "PASS_FROZEN_ZERO_SUBJECT", "V7 frozen source package")
    return {
        "status": "PASS_STATIC_ZERO_SUBJECT",
        "subject_calls": 0,
        "qualification_credit": 0,
        "prompt": file_record(prompt_path),
        "overlay": file_record(OVERLAY_PATH),
        "v7_freeze": freeze,
    }


def journal_rows() -> list[dict[str, Any]]:
    path = EVIDENCE / "launch_journal.jsonl"
    if not path.exists():
        return []
    require(path.is_file() and not path.is_symlink(), "probe journal file")
    result = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.strip():
            value = pipeline.strict_loads(line)
            require(isinstance(value, dict), "probe journal object")
            result.append(value)
    return result


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


def owned_xml_goal_call(path: Path) -> dict[str, Any]:
    _title, _header, entries, _raw = omp_session.load_physical_session(path)
    calls = []
    for entry in entries:
        if entry.get("type") != "message":
            continue
        message = entry.get("message")
        if not isinstance(message, dict) or message.get("role") != "assistant":
            continue
        content = message.get("content")
        if not isinstance(content, list):
            continue
        for block in content:
            if isinstance(block, dict) and block.get("type") == "toolCall" and block.get("name") == "goal":
                calls.append(block)
    require(len(calls) == 1, "owned XML exactly one canonical Goal call")
    call = calls[0]
    raw_block = call.get("rawBlock")
    require(isinstance(raw_block, str), "owned XML Goal call rawBlock")
    raw_bytes = raw_block.encode("utf-8")
    require(1 <= len(raw_bytes) <= 2048, "owned XML Goal rawBlock byte ceiling")
    require(re.match(r"^<(?:antml:)?invoke(?:\s|>)", raw_block) is not None, "owned XML Goal invoke grammar")
    return {
        "present": True,
        "bytes": len(raw_bytes),
        "sha256": pipeline.sha256_bytes(raw_bytes),
        "canonical_name": call["name"],
        "canonical_arguments": call["arguments"],
    }


def verify_session_owned(path: Path, **kwargs: Any) -> dict[str, Any]:
    projection = ORIGINAL_VERIFY_SESSION(path, **kwargs)
    projection["owned_xml_goal_call"] = owned_xml_goal_call(path)
    return projection


def verify_completed_row(row: dict[str, Any]) -> dict[str, Any]:
    row_dir = HERE / row["evidence_path"]
    terminal = pipeline.load_json(row_dir / "terminal.json")
    require(terminal.get("status") == "PASS", f"prior probe row not PASS: {row['route_id']}")
    require(terminal.get("qualification_credit") == 0 and terminal.get("no_retry") is True, "probe terminal credit/retry")
    for field in ("pass_id", "route_id", "ordinal", "attempt_id", "nonce"):
        require(terminal.get(field) == row[field], f"probe terminal identity: {field}")
    launch = pipeline.load_json(row_dir / "launch.json")
    require(launch.get("argv") == expected_argv(route_map()[row["route_id"]], row), "probe launch argv")
    require(launch.get("model") == row["model"] and launch.get("thinking") == row["thinking"], "probe launch route")
    preflight = pipeline.load_json(row_dir / "omp_preflight.json")
    require(preflight.get("tools_format_requested") == "xml", "probe XML preflight")
    require(preflight.get("row_time_budget_seconds") == contract()["runtime"]["row_time_budget_seconds"], "probe time-budget receipt")
    require(preflight.get("overlay") == file_record(OVERLAY_PATH), "probe overlay receipt")
    source_session = row_dir / "session.raw.jsonl"
    projection = omp_session.verify_session(
        source_session,
        expected_cwd=row["cwd"],
        expected_objective=(V7 / "prompts" / "omp.prompt.txt").read_text(encoding="utf-8")[len("/goal ") :],
        expected_provider=row["model"].split("/", 1)[0],
        expected_model=row["model"].split("/", 1)[1],
        expected_selector=row["model"],
        expected_thinking=row["thinking"],
        require_exit=True,
    )
    base.exact_result(projection["final_text"])
    require(projection["ordinary_tool_calls"] == 0, "probe ordinary tools")
    require(terminal.get("session_projection", {}).get("goal_id") == projection["goal_id"], "probe Goal identity")
    require(terminal.get("goal_activation_observed") is True and terminal.get("goal_complete_observed") is True, "probe Goal terminal")
    require(terminal.get("observed_non_goal_tool_calls") == 0 and terminal.get("process_exit_code") == 0, "probe tools/process terminal")
    evidence = terminal.get("evidence")
    require(isinstance(evidence, list) and len(evidence) == 15, "probe terminal evidence roster")
    recorded_names = []
    for record in evidence:
        require(isinstance(record, dict) and set(record) == {"path", "bytes", "sha256"}, "probe evidence record")
        relative = record["path"]
        require(isinstance(relative, str) and "/" not in relative, "probe evidence relative path")
        path = row_dir / relative
        require(path.is_file() and not path.is_symlink(), f"probe evidence file: {relative}")
        require(path.stat().st_size == record["bytes"] and pipeline.sha256_file(path) == record["sha256"], f"probe evidence join: {relative}")
        recorded_names.append(relative)
    actual_names = sorted(path.name for path in row_dir.iterdir() if path.is_file() and not path.is_symlink() and path.name != "terminal.json")
    require(sorted(recorded_names) == actual_names, "probe exact row evidence roster")
    return {"route_id": row["route_id"], "status": "PASS", "session_id": projection["session_id"], "goal_id": projection["goal_id"]}


def verify_next_row(planned: dict[str, Any]) -> list[dict[str, Any]]:
    journal = journal_rows()
    planned_rows = rows()
    require(len(journal) < len(planned_rows), "probe already terminal")
    require(planned["ordinal"] == len(journal) + 1, "probe exact next ordinal")
    for expected, actual in zip(planned_rows[: len(journal)], journal, strict=True):
        for field in ("ordinal", "pass_id", "route_id", "attempt_id", "nonce"):
            require(actual.get(field) == expected[field], f"probe journal identity: {field}")
        row_dir = HERE / expected["evidence_path"]
        require(actual.get("launch_sha256") == pipeline.sha256_file(row_dir / "launch.json"), "probe journal launch hash")
        require(actual.get("omp_preflight_sha256") == pipeline.sha256_file(row_dir / "omp_preflight.json"), "probe journal preflight hash")
        launch = pipeline.load_json(row_dir / "launch.json")
        require(actual.get("popen_observed") is True and actual.get("pid") == launch.get("pid"), "probe journal process join")
        verify_completed_row(expected)
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
        "schema_id": "pm.r10.storage_pipeline.xml_probe_preflight.v1",
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
        "tools_format_requested": "xml",
        "row_time_budget_seconds": runtime["row_time_budget_seconds"],
        "overlay": file_record(OVERLAY_PATH),
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
        "schema_id": "pm.r10.storage_pipeline.xml_probe_postfailure.v1",
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
    path = row_dir / "postfailure_state.json"
    if not os.path.lexists(path):
        base.atomic_json(path, snapshot)


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
    reports = [verify_completed_row(row) for row in rows()[: len(journal_rows())]]
    return {
        "status": "PASS_DIAGNOSTIC_PREFIX",
        "rows": reports,
        "row_count": len(reports),
        "subject_calls": 0,
        "qualification_credit": 0,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("lint")
    subparsers.add_parser("verify-prefix")
    run_parser = subparsers.add_parser("run")
    run_parser.add_argument("route_id", choices=("omp_ox_alpha_free_max", "omp_muse_spark_xhigh"))
    run_parser.add_argument("--max-seconds", type=int, default=3600)
    args = parser.parse_args()
    try:
        if args.command == "lint":
            print(pipeline.canonical_json(validate_static(require_unused=True)))
            return 0
        validate_static(require_unused=False)
        if args.command == "verify-prefix":
            print(pipeline.canonical_json(verify_prefix()))
            return 0
        require(args.max_seconds == contract()["runtime"]["row_time_budget_seconds"], "max-seconds differs from frozen diagnostic budget")
        git_custody()
        install_base_adapter()
        planned = planned_row("probe_01", args.route_id)
        try:
            terminal = base.run_row("probe_01", args.route_id, args.max_seconds)
            print(pipeline.canonical_json({"status": "PASS_ZERO_CREDIT_DIAGNOSTIC", "terminal": terminal, "qualification_credit": 0}))
            return 0
        except base.ReservationConflict as exc:
            print(pipeline.canonical_json({"status": "FAIL_ALREADY_CONSUMED_NO_MUTATION", "error": f"{type(exc).__name__}: {exc}", "qualification_credit": 0}))
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
                print(pipeline.canonical_json({"status": "FAIL_PRELAUNCH_NO_MUTATION", "error": f"{type(exc).__name__}: {exc}", "qualification_credit": 0}))
                return 1
            preserve_postfailure(planned)
            base.record_failure("probe_01", args.route_id, exc)
            print(pipeline.canonical_json({"status": "FAIL_CONSUMED_ZERO_CREDIT_NO_RETRY", "error": f"{type(exc).__name__}: {exc}", "qualification_credit": 0}))
            return 1
    except (ProbeError, pipeline.PipelineError, subprocess.SubprocessError, OSError, ValueError, KeyError, TypeError, AssertionError) as exc:
        print(pipeline.canonical_json({"status": "FAIL_PRELAUNCH", "error": f"{type(exc).__name__}: {exc}", "qualification_credit": 0}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
