#!/usr/bin/env python3
"""Zero-subject checks for the thin native/default Ox controller."""
from __future__ import annotations

import ast
import contextlib
import copy
import io
import os
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Any, Callable

import controller
import omp_session
import pipeline
import selftest as v7_selftest  # type: ignore[import-not-found]
import verify_matrix

V7 = controller.V7
OBJECTIVE = (V7 / "prompts/omp.prompt.txt").read_text(encoding="utf-8")[len("/goal "):]
FINAL = pipeline.RESULT_PREFIX + (V7 / "oracle.json").read_text(encoding="utf-8").strip()
V7_ROW = V7 / "evidence/pass_01/omp_ox_alpha_free_max"
V3_ROW = controller.R10 / "ox_owned_glm_reliability_v3/evidence/reliability_04/omp_ox_alpha_free_max"

class TestFailure(RuntimeError):
    pass

def check(condition: bool, message: str) -> None:
    if not condition:
        raise TestFailure(message)

def expect(types: type[BaseException] | tuple[type[BaseException], ...], call: Callable[[], Any], message: str) -> BaseException:
    try:
        call()
    except types as exc:
        return exc
    raise TestFailure(f"expected rejection: {message}")

def session_args(root: Path, *, require_exit: bool) -> dict[str, Any]:
    launch = pipeline.load_json(root / "launch.json")
    return {"expected_cwd":launch["cwd"], "expected_objective":OBJECTIVE,
            "expected_provider":"opencode-go", "expected_model":"ox-alpha-free",
            "expected_selector":"opencode-go/ox-alpha-free", "expected_thinking":"max",
            "require_exit":require_exit}

def verify_raw(raw: bytes, arguments: dict[str, Any]) -> dict[str, Any]:
    with tempfile.TemporaryDirectory(prefix="pm-r10-native-v1-session-") as temporary:
        path = Path(temporary) / "session.jsonl"
        path.write_bytes(raw)
        return controller.ORIGINAL_VERIFY_SESSION(path, **arguments)

def replay_checks() -> int:
    checks = 0
    route = controller.base.route_map()["omp_ox_alpha_free_max"]
    report = verify_matrix.verify_row("pass_01", route)
    check(report["status"] == "PASS" and report["raw_primary_sha256"] == "472f2f99e46a04d8ad62ee054f115a8c166f1abaeeeaaf14238d7bdd0ad0f304", "real V7 native PASS"); checks += 1
    native = controller.ORIGINAL_VERIFY_SESSION(V7_ROW / "session.raw.jsonl", **session_args(V7_ROW, require_exit=True))
    controller.fail_fast_exact_result(native["final_text"])
    check(native["ordinary_tool_calls"] == 0 and native["native_continuation_count"] == 0 and verify_matrix.terminal_result(native["final_text"]) == pipeline.load_json(V7 / "oracle.json"), "native structural/scorer/exit positive"); checks += 1
    prefix = (V3_ROW / "session_prefix.raw.jsonl").read_bytes()
    expect(omp_session.OmpSessionError, lambda: verify_raw(prefix, session_args(V3_ROW, require_exit=False)), "V3 row4 active prefix remains pending"); checks += 1
    completed_raw = (V3_ROW / "postfailure_session.raw.jsonl").read_bytes()
    completed = verify_raw(completed_raw, session_args(V3_ROW, require_exit=False))
    check(completed["native_continuation_count"] == 1 and completed["ordinary_tool_calls"] == 0, "V3 row4 structurally complete"); checks += 1
    failure = expect(controller.PermanentTerminalResultFailure, lambda: controller.fail_fast_exact_result(completed["final_text"]), "completed wrong final fails immediately")
    check(isinstance(failure.__cause__, controller.base.RunnerError), "fail-fast preserves original scorer cause"); checks += 1
    expect(omp_session.OmpSessionError, lambda: verify_raw(completed_raw, session_args(V3_ROW, require_exit=True)), "SIGTERM is not normal exit"); checks += 1
    ceiling = pipeline.load_json(V7 / "matrix.json")["max_final_assistant_utf8_bytes"]
    bad = ("missing", FINAL + "x", FINAL + "\n" + FINAL, "x" * (ceiling + 1) + "\n" + FINAL)
    for text in bad:
        expect(controller.PermanentTerminalResultFailure, lambda text=text: controller.fail_fast_exact_result(text), "fail-fast scorer mutation")
        expect(verify_matrix.VerifyError, lambda text=text: verify_matrix.terminal_result(text), "terminal scorer mutation")
        checks += 1
    raw = (V7_ROW / "session.raw.jsonl").read_bytes()
    def no_context(rows: list[dict[str, Any]]) -> None:
        rows[:] = [row for row in rows if not (row.get("type") == "custom_message" and row.get("customType") == "goal-mode-context")]
    def ordinary_call(rows: list[dict[str, Any]]) -> None:
        blocks = [block for row in rows if row.get("type") == "message" for block in row.get("message", {}).get("content", []) if isinstance(block, dict)]
        next(block for block in blocks if block.get("type") == "toolCall")["name"] = "read"
    def wrong_thinking(rows: list[dict[str, Any]]) -> None:
        next(row for row in rows if row.get("type") == "thinking_level_change")["thinkingLevel"] = "low"
    for mutation in (no_context, ordinary_call, wrong_thinking):
        calls: list[str] = []
        def structural_then_score() -> None:
            projection = verify_raw(v7_selftest.mutate_session(raw, mutation), session_args(V7_ROW, require_exit=True))
            calls.append("scorer"); controller.fail_fast_exact_result(projection["final_text"])
        expect(omp_session.OmpSessionError, structural_then_score, "structural mutation")
        check(not calls, "structural rejection never reaches scorer"); checks += 1
    check(not issubclass(controller.PermanentTerminalResultFailure, (controller.base.RunnerError, omp_session.OmpSessionError)), "permanent exception outside poll catches"); checks += 1
    return checks

def rehashed_enter_check() -> int:
    route = controller.base.route_map()["omp_ox_alpha_free_max"]
    with tempfile.TemporaryDirectory(prefix="pm-r10-native-v1-enter-") as temporary:
        evidence = Path(temporary) / "evidence"
        row = evidence / "pass_01" / route["id"]
        shutil.copytree(V7_ROW, row)
        enter = row / "stdin_enter.raw"; enter.write_bytes(b"\n")
        receipt_path = row / "enter_write.json"
        receipt = pipeline.load_json(receipt_path); receipt["sha256"] = pipeline.sha256_file(enter)
        pipeline.atomic_write(receipt_path, pipeline.pretty_json(receipt))
        terminal_path = row / "terminal.json"; terminal = pipeline.load_json(terminal_path)
        for record in terminal["evidence"]:
            if record["path"] in {"stdin_enter.raw", "enter_write.json"}:
                path = row / record["path"]
                record.update({"bytes":path.stat().st_size, "sha256":pipeline.sha256_file(path)})
        pipeline.atomic_write(terminal_path, pipeline.pretty_json(terminal))
        original = verify_matrix.EVIDENCE
        try:
            verify_matrix.EVIDENCE = evidence
            expect(verify_matrix.VerifyError, lambda: verify_matrix.verify_row("pass_01", route), "rehashed CR-to-LF")
        finally:
            verify_matrix.EVIDENCE = original
    return 1

def journal_checks() -> int:
    checks, original = 1, controller.EVIDENCE
    check(controller.verify_prefix()["row_count"] == 0, "zero-row exact prefix")
    try:
        with tempfile.TemporaryDirectory(prefix="pm-r10-native-v1-journal-") as temporary:
            controller.EVIDENCE = Path(temporary) / "evidence"; controller.EVIDENCE.mkdir()
            reports: list[dict[str, Any]] = []; journal: list[dict[str, Any]] = []
            for row in controller.rows():
                report = {"ordinal":row["ordinal"], "started_at_utc":f"2026-08-26T08:00:0{row['ordinal']}.000Z", "launch_sha256":f"launch-{row['ordinal']}", "omp_preflight_sha256":f"preflight-{row['ordinal']}", "pid":9100 + row["ordinal"]}
                reports.append({"pass_id":row["pass_id"], "rows":[report]})
                journal.append({"schema_id":"pm.r10.storage_pipeline.launch_journal.v2", **{field:row[field] for field in controller.IDENTITY_FIELDS}, **{field:report[field] for field in ("started_at_utc","launch_sha256","omp_preflight_sha256","pid")}, "popen_observed":True})
                pipeline.atomic_write(controller.EVIDENCE / "launch_journal.jsonl", pipeline.jsonl_bytes(journal))
                controller.generic_journal(reports); checks += 1
            def rejected(change: Callable[[list[dict[str, Any]]], None]) -> None:
                candidate = copy.deepcopy(journal); change(candidate)
                pipeline.atomic_write(controller.EVIDENCE / "launch_journal.jsonl", pipeline.jsonl_bytes(candidate))
                expect(controller.ControllerError, lambda: controller.generic_journal(reports), "journal mutation")
            mutations = (
                lambda value: value.append(copy.deepcopy(value[-1])), lambda value: value.pop(),
                lambda value: value[1].update({"attempt_id":value[0]["attempt_id"]}),
                lambda value: value[0].update({"launch_sha256":"wrong"}),
                lambda value: value[0].update({"popen_observed":False}),
                lambda value: value[0].update({"pid":0}),
            )
            for mutation in mutations:
                rejected(mutation); checks += 1
    finally:
        controller.EVIDENCE = original
    return checks

def binding_and_main_checks() -> int:
    checks = 0
    originals = [(module, name, getattr(module, name)) for module, name, _value in controller.BINDINGS]
    try:
        with controller.installed():
            check(all(getattr(module, name) is value for module, name, value in controller.BINDINGS), "seven bindings installed")
            check(verify_matrix.terminal_result is controller.ORIGINAL_TERMINAL_RESULT, "terminal_result identity preserved")
            raise TestFailure("exercise finally")
    except TestFailure:
        pass
    check(all(getattr(module, name) is value for module, name, value in originals), "seven bindings restored"); checks += 3
    expect(controller.ControllerError, controller.git_custody, "untracked package custody gate"); checks += 1
    source = ast.parse((controller.HERE / "controller.py").read_text(encoding="utf-8"))
    definitions = {node.name for node in ast.walk(source) if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))}
    check(not definitions.intersection({"run_row","verify_row","verify_session","terminal_result"}), "no copied V7 bodies"); checks += 1
    saved = (subprocess.Popen, controller.validate_static, controller.require_authority, controller.git_custody, controller._prefix, controller.base.run_row)
    popen: list[str] = []
    def forbidden(*_args: Any, **_kwargs: Any) -> Any:
        popen.append("Popen"); raise TestFailure("Popen reached")
    try:
        subprocess.Popen = forbidden  # type: ignore[assignment]
        controller.validate_static = lambda **_kwargs: {"subject_calls":0}  # type: ignore[assignment]
        with contextlib.redirect_stdout(io.StringIO()):
            check(controller.dispatch(["run","1","--max-seconds","3599"]) == 1, "budget gate")
            controller.require_authority = lambda: (_ for _ in ()).throw(controller.ControllerError("closed authority"))
            check(controller.dispatch(["run","1"]) == 1, "authority gate")
            controller.require_authority = saved[2]
            controller.git_custody = lambda: (_ for _ in ()).throw(controller.ControllerError("unpushed"))
            check(controller.dispatch(["run","1"]) == 1, "custody gate")
            controller.git_custody = lambda: {}; controller._prefix = lambda: {"row_count":0}
            check(controller.dispatch(["run","2"]) == 1, "ordinal gate")
            controller.base.run_row = lambda *_args: (_ for _ in ()).throw(controller.base.ReservationConflict("consumed"))
            check(controller.dispatch(["run","1"]) == 1, "reuse gate")
    finally:
        subprocess.Popen, controller.validate_static, controller.require_authority, controller.git_custody, controller._prefix, controller.base.run_row = saved
    check(not popen and not os.path.lexists(controller.EVIDENCE), "all main gates pre-Popen/no evidence"); checks += 6
    check(all(getattr(module, name) is value for module, name, value in originals), "main-path bindings restored"); checks += 1
    return checks

def main() -> int:
    static = controller.validate_static(unused=True)
    checks = 1
    check(static["temporary_bindings"] == 7 and static["subject_calls"] == 0, "static architecture")
    check(controller.spec()["runtime"]["foreign_windows_omp_terminal_boundary"] == "DO_NOT_INSPECT_FOCUS_INJECT_SIGNAL_REUSE_CLOSE_OR_CLEANUP", "foreign Windows boundary"); checks += 1
    checks += replay_checks() + rehashed_enter_check() + journal_checks() + binding_and_main_checks()
    check(not os.path.lexists(controller.EVIDENCE) and not any(controller.HERE.glob("__pycache__")), "no evidence/cache residue"); checks += 1
    print(pipeline.canonical_json({"status":"PASS_ZERO_SUBJECT_SELFTEST", "checks":checks, "metrics":static["metrics"], "temporary_bindings":7, "subject_calls":0, "qualification_credit":0}))
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
