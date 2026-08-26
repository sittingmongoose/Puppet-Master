#!/usr/bin/env python3
"""Zero-subject checks for the thin Ox/GLM reliability controller."""

from __future__ import annotations

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
import glm_projection

sys_path_added = str(controller.V7)
import omp_session  # type: ignore[import-not-found]  # noqa: E402
import pipeline  # type: ignore[import-not-found]  # noqa: E402
import selftest as v7_selftest  # type: ignore[import-not-found]  # noqa: E402
import verify_matrix  # type: ignore[import-not-found]  # noqa: E402


R10 = controller.R10
V7 = controller.V7
OBJECTIVE = (V7 / "prompts/omp.prompt.txt").read_text(encoding="utf-8")[len("/goal ") :]
FINAL = pipeline.RESULT_PREFIX + (V7 / "oracle.json").read_text(encoding="utf-8").strip()
GLM_RAW = "<tool_call>goal<arg_key>op</arg_key><arg_value>complete</arg_value></tool_call>"
V1 = R10 / "muse_owned_glm_probe_v1" / "evidence" / "probe_01" / "omp_ox_alpha_free_max"
V2 = R10 / "muse_owned_glm_probe_v2" / "evidence" / "probe_01" / "omp_ox_alpha_free_max"
V7_ROW = V7 / "evidence" / "pass_01" / "omp_ox_alpha_free_max"


class TestFailure(RuntimeError):
    pass


def check(condition: bool, message: str) -> None:
    if not condition:
        raise TestFailure(message)


def expect(types: type[BaseException] | tuple[type[BaseException], ...], call: Callable[[], Any], message: str, fragment: str | None = None) -> None:
    try:
        call()
    except types as exc:
        check(fragment is None or fragment in str(exc), f"wrong rejection: {message}")
        return
    raise TestFailure(f"expected rejection: {message}")


def kwargs(root: Path, *, require_exit: bool) -> dict[str, Any]:
    launch = pipeline.load_json(root / "launch.json")
    return {
        "expected_cwd": launch["cwd"], "expected_objective": OBJECTIVE,
        "expected_provider": "opencode-go", "expected_model": "ox-alpha-free",
        "expected_selector": "opencode-go/ox-alpha-free", "expected_thinking": "max",
        "require_exit": require_exit,
    }


def verify_bytes(raw: bytes, arguments: dict[str, Any]) -> dict[str, Any]:
    with tempfile.TemporaryDirectory(prefix="pm-r10-glm-v3-session-") as temporary:
        path = Path(temporary) / "session.jsonl"
        path.write_bytes(raw)
        return glm_projection.verify_session(path, **arguments)


def mutate(raw: bytes, change: Callable[[list[dict[str, Any]]], None]) -> bytes:
    return v7_selftest.mutate_session(raw, change)


def tool_content(rows: list[dict[str, Any]]) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    message = next(row["message"] for row in rows if row.get("type") == "message" and isinstance(row.get("message"), dict) and isinstance(row["message"].get("content"), list) and any(isinstance(block, dict) and block.get("type") == "toolCall" for block in row["message"]["content"]))
    call = next(block for block in message["content"] if block.get("type") == "toolCall")
    return call, message["content"]


def projection_checks() -> int:
    checks = 0
    v1_raw = (V1 / "postfailure_session.raw.jsonl").read_bytes()
    check(len(v1_raw) == 34948 and pipeline.sha256_bytes(v1_raw) == "1695208e98a3fd9b141110e0baadaa36eb783f76a13fbef8141a22a9893d0f9d", "real V1 trace freeze"); checks += 1
    projected = glm_projection.verify_session(V1 / "postfailure_session.raw.jsonl", **kwargs(V1, require_exit=False))
    controller.base.exact_result(projected["final_text"])
    check(projected["owned_glm_goal_call"]["bytes"] == 82 and projected["owned_glm_post_call_framing"]["bytes"] == 16 and projected["session_file_sha256"] == pipeline.sha256_bytes(v1_raw), "real V1 GLM/scorer/raw replay"); checks += 1
    expect(omp_session.OmpSessionError, lambda: glm_projection.verify_session(V1 / "postfailure_session.raw.jsonl", **kwargs(V1, require_exit=True)), "real V1 SIGTERM is not a row PASS"); checks += 1

    v2_prefix = (V2 / "session_prefix.raw.jsonl").read_bytes()
    check(len(v2_prefix) == 22176 and pipeline.sha256_bytes(v2_prefix) == "a9b949762db9859db4f80bb4f4466178337c34f6250dc2d7f41b35a1f2a688af", "real V2 prefix freeze"); checks += 1
    pending_args = kwargs(V2, require_exit=False)
    expect(omp_session.OmpSessionError, lambda: verify_bytes(v2_prefix, pending_args), "accepted zero-call active Goal is pending"); checks += 1
    v2_full = (V2 / "postfailure_session.raw.jsonl").read_bytes()
    check(len(v2_full) == 22383 and pipeline.sha256_bytes(v2_full) == "f3d3323a57a4fdcfff220659e45c9c241e3b2a1480de567449eb5162da87ba95", "real V2 failure freeze"); checks += 1
    v2_presignal = mutate(v2_full, lambda rows: rows.pop())
    expect(omp_session.OmpSessionError, lambda: verify_bytes(v2_presignal, pending_args), "completed first text-only turn remains pending"); checks += 1
    def active_goals(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
        return [row["data"]["goal"] for row in rows if row.get("type") == "mode_change" and row.get("mode") == "goal" and row.get("data", {}).get("goal", {}).get("status") == "active"]
    def rollback_into_frozen_second(rows: list[dict[str, Any]]) -> None:
        first, second = active_goals(rows)
        check({key:second[key] for key in ("updatedAt","tokensUsed","timeUsedSeconds")} == {"updatedAt":1787714517215,"tokensUsed":9737,"timeUsedSeconds":45}, "exact frozen V2 second snapshot")
        first.update({"updatedAt":1787714517216,"tokensUsed":9738,"timeUsedSeconds":46})
        next(row for row in rows if row.get("type") == "custom_message" and row.get("customType") == "goal-mode-context")["content"] = omp_session.render_goal_active(OBJECTIVE, first)
    expect(glm_projection.ProjectionError, lambda: verify_bytes(mutate(v2_presignal, rollback_into_frozen_second), pending_args), "exact V2 second snapshot accounting rollback", "zero-call Goal accounting monotonic"); checks += 1
    def drift_budget(rows: list[dict[str, Any]]) -> None:
        active_goals(rows)[1]["tokenBudget"] = 20000
    expect(glm_projection.ProjectionError, lambda: verify_bytes(mutate(v2_presignal, drift_budget), pending_args), "active Goal tokenBudget drift", "zero-call Goal creation/budget identity"); checks += 1
    expect(glm_projection.ProjectionError, lambda: verify_bytes(v2_full, pending_args), "signal-exit zero-call state is hard failure"); checks += 1
    for _turn in range(2):
        expect(omp_session.OmpSessionError, lambda: verify_bytes(v2_prefix, pending_args), "repeated idle remains pending, never PASS")
    expect(controller.base.RunnerError, lambda: (_ for _ in ()).throw(controller.base.RunnerError("row time budget expired")), "second idle exhausts only as row failure"); checks += 1

    def changed(change: Callable[[dict[str, Any], list[dict[str, Any]]], None]) -> bytes:
        def apply(rows: list[dict[str, Any]]) -> None:
            call, content = tool_content(rows)
            change(call, content)
        return mutate(v1_raw, apply)

    invalid = (
        (lambda call, content: content.append(copy.deepcopy(call)), "multiple call"),
        (lambda call, _content: call.update({"name": "read"}), "ordinary call"),
        (lambda call, _content: call.update({"arguments": {"op": "get"}}), "wrong arguments"),
        (lambda call, _content: call.pop("rawBlock"), "missing rawBlock"),
        (lambda call, _content: call.update({"rawBlock": "<invoke name='goal'/>"}), "foreign raw grammar"),
    )
    for change, label in invalid:
        expect(glm_projection.ProjectionError, lambda change=change: verify_bytes(changed(change), kwargs(V1, require_exit=False)), label); checks += 1

    def frame(text: str, *, extra: bool = False) -> bytes:
        def change(_call: dict[str, Any], content: list[dict[str, Any]]) -> None:
            content[-1] = {"type": "text", "text": text}
            if extra:
                content.append({"type": "text", "text": " "})
        return changed(change)

    long_projection = verify_bytes(frame("\n" * 5000 + "<observation>\r"), kwargs(V1, require_exit=False))
    check(long_projection["owned_glm_post_call_framing"]["bytes"] == 5014, "unbounded scanner-valid ASCII framing"); checks += 1
    for text, extra, label in (
        ("\u00a0<observation>", False, "Unicode whitespace"),
        ("<observation><observation>", False, "duplicate opener"),
        ("<observation></observation>", False, "closing marker"),
        ("prose", False, "post-call prose"),
        ("<tool_response>", False, "tool response"),
        ("PM_RESULT", False, "result leakage"),
        ("<observation>", True, "following block"),
    ):
        expect(glm_projection.ProjectionError, lambda text=text, extra=extra: verify_bytes(frame(text, extra=extra), kwargs(V1, require_exit=False)), label); checks += 1

    route = controller.route_map()["omp_ox_alpha_free_max"]
    synthetic = v7_selftest.synthetic_omp_session(route, OBJECTIVE, FINAL)
    provider, model = route["model"].split("/", 1)
    def continuation(rows: list[dict[str, Any]]) -> None:
        call, _content = tool_content(rows)
        call["rawBlock"] = GLM_RAW
        call_index = next(index for index, row in enumerate(rows) if row.get("type") == "message" and row.get("message", {}).get("role") == "assistant" and isinstance(row["message"].get("content"), list) and any(isinstance(block, dict) and block.get("type") == "toolCall" for block in row["message"]["content"]))
        goal = copy.deepcopy(next(row["data"]["goal"] for row in rows if row.get("type") == "mode_change" and row.get("mode") == "goal" and row.get("data", {}).get("goal", {}).get("status") == "active"))
        goal.update({"tokensUsed": 111, "timeUsedSeconds": 2, "updatedAt": 1787673602000})
        stamp = rows[call_index]["timestamp"]
        rows[call_index:call_index] = [
            {"type":"message","id":"v3-intermediate","parentId":None,"timestamp":stamp,"message":{"role":"assistant","provider":provider,"model":model,"content":[{"type":"text","text":"still checking"}],"stopReason":"stop","usage":{},"timestamp":1787673600500}},
            {"type":"mode_change","id":"v3-accounting","parentId":None,"timestamp":stamp,"mode":"goal","data":{"goal":goal}},
            {"type":"custom_message","id":"v3-context","parentId":None,"timestamp":stamp,"customType":"goal-mode-context","content":omp_session.render_goal_active(OBJECTIVE, goal),"display":False,"attribution":"agent"},
            {"type":"custom_message","id":"v3-continuation","parentId":None,"timestamp":stamp,"customType":"goal-continuation","content":omp_session.render_goal_continuation(OBJECTIVE, goal),"display":False,"attribution":"agent"},
        ]
    continued = mutate(synthetic, continuation)
    synthetic_args = {"expected_cwd":"/tmp/pm-r10-storage-v7-selftest","expected_objective":OBJECTIVE,"expected_provider":provider,"expected_model":model,"expected_selector":route["model"],"expected_thinking":"max","require_exit":True}
    result = verify_bytes(continued, synthetic_args)
    check(result["native_continuation_count"] == 1 and result["goal_context_count"] == 2 and result["final_text"] == FINAL, "one native continuation success"); checks += 1
    def second_idle(rows: list[dict[str, Any]]) -> None:
        call, content = tool_content(rows)
        call_entry = next(row for row in rows if row.get("type") == "message" and isinstance(row.get("message"), dict) and content is row["message"].get("content"))
        call_entry["message"].update({"content":[{"type":"text","text":"still no tool"}],"stopReason":"stop"})
        keep = {"v3-intermediate", call_entry["id"]}
        rows[:] = [row for row in rows if not ((row.get("type") == "message" and row.get("message", {}).get("role") == "toolResult") or (row.get("type") == "message" and row.get("message", {}).get("role") == "assistant" and row.get("id") not in keep) or (row.get("type") == "custom" and row.get("customType") in {"tool_execution_start","goal-completed","session_exit"}) or (row.get("type") == "mode_change" and (row.get("mode") == "none" or row.get("data", {}).get("goal", {}).get("status") == "complete")))]
    second_pending = mutate(continued, second_idle)
    synthetic_args["require_exit"] = False
    expect(omp_session.OmpSessionError, lambda: verify_bytes(second_pending, synthetic_args), "second no-tool native turn remains pending"); checks += 1
    inherited = (V7 / "omp_row_runner.py").read_text(encoding="utf-8")
    check("except (omp_session.OmpSessionError, RunnerError, OSError, ValueError, KeyError, TypeError):" in inherited and 'raise RunnerError("row time budget expired before exact Goal terminal result")' in inherited, "unchanged poll catches pending then fails at real deadline"); checks += 1
    return checks


def rehashed_enter_check() -> int:
    route = pipeline.load_json(V7 / "matrix.json")["ordered_routes"][0]
    check(route["id"] == "omp_ox_alpha_free_max", "V7 preserved Ox route first")
    clean = verify_matrix.verify_row("pass_01", route)
    check(clean["status"] == "PASS" and clean["raw_primary_sha256"] == "472f2f99e46a04d8ad62ee054f115a8c166f1abaeeeaaf14238d7bdd0ad0f304", "real V7 full row verification")
    with tempfile.TemporaryDirectory(prefix="pm-r10-glm-v3-enter-") as temporary:
        evidence = Path(temporary) / "evidence"
        row = evidence / "pass_01" / route["id"]
        shutil.copytree(V7_ROW, row)
        enter = row / "stdin_enter.raw"
        enter.write_bytes(b"\n")
        receipt_path = row / "enter_write.json"
        receipt = pipeline.load_json(receipt_path)
        receipt["sha256"] = pipeline.sha256_file(enter)
        pipeline.atomic_write(receipt_path, pipeline.pretty_json(receipt))
        terminal_path = row / "terminal.json"
        terminal = pipeline.load_json(terminal_path)
        for record in terminal["evidence"]:
            path = row / record["path"]
            if record["path"] in {"stdin_enter.raw", "enter_write.json"}:
                record.update({"bytes": path.stat().st_size, "sha256": pipeline.sha256_file(path)})
        pipeline.atomic_write(terminal_path, pipeline.pretty_json(terminal))
        original = verify_matrix.EVIDENCE
        try:
            verify_matrix.EVIDENCE = evidence
            expect(verify_matrix.VerifyError, lambda: verify_matrix.verify_row("pass_01", route), "rehashed CR-to-LF transport mutation")
        finally:
            verify_matrix.EVIDENCE = original
    return 2


def journal_checks() -> int:
    original = controller.EVIDENCE
    checks = 0
    try:
        with tempfile.TemporaryDirectory(prefix="pm-r10-glm-v3-journal-") as temporary:
            controller.EVIDENCE = Path(temporary) / "evidence"
            controller.EVIDENCE.mkdir()
            reports, journal = [], []
            for row in controller.rows():
                report = {"ordinal":row["ordinal"],"started_at_utc":f"2026-08-26T05:00:0{row['ordinal']}.000Z","launch_sha256":f"launch-{row['ordinal']}","omp_preflight_sha256":f"preflight-{row['ordinal']}","pid":9000 + row["ordinal"]}
                reports.append({"pass_id":row["pass_id"],"rows":[report]})
                journal.append({"schema_id":"pm.r10.storage_pipeline.launch_journal.v2",**{field:row[field] for field in controller.IDENTITY_FIELDS},**{field:report[field] for field in ("started_at_utc","launch_sha256","omp_preflight_sha256","pid")},"popen_observed":True})
                pipeline.atomic_write(controller.EVIDENCE / "launch_journal.jsonl", pipeline.jsonl_bytes(journal))
                controller.generic_journal(reports); checks += 1
            def rejected(change: Callable[[list[dict[str, Any]]], None], label: str) -> None:
                candidate = copy.deepcopy(journal)
                change(candidate)
                pipeline.atomic_write(controller.EVIDENCE / "launch_journal.jsonl", pipeline.jsonl_bytes(candidate))
                expect(controller.ControllerError, lambda: controller.generic_journal(reports), label)
            for change, label in (
                (lambda value: value.append(copy.deepcopy(value[-1])), "extra row"),
                (lambda value: value[0].update({"nonce":"0" * 32}), "identity mismatch"),
                (lambda value: value[0].update({"launch_sha256":"wrong"}), "launch hash mismatch"),
                (lambda value: value[0].update({"omp_preflight_sha256":"wrong"}), "preflight hash mismatch"),
                (lambda value: value[0].update({"popen_observed":False}), "Popen mismatch"),
                (lambda value: value[0].update({"pid":0}), "PID mismatch"),
            ):
                rejected(change, label); checks += 1
    finally:
        controller.EVIDENCE = original
    return checks


def binding_and_main_checks() -> int:
    originals = [(module, name, getattr(module, name)) for module, name, _value in controller.BINDINGS]
    try:
        with controller.installed():
            check(all(getattr(module, name) is value for module, name, value in controller.BINDINGS), "all eleven bindings installed")
            raise TestFailure("exercise finally")
    except TestFailure:
        pass
    check(all(getattr(module, name) is value for module, name, value in originals), "all eleven bindings restored")
    check(controller.verify_prefix()["row_count"] == 0, "zero-row prefix positive")

    saved = (subprocess.Popen, controller.require_authority, controller.git_custody, controller._prefix, controller.base.run_row)
    calls: list[str] = []
    def forbidden(*_args: Any, **_kwargs: Any) -> Any:
        calls.append("Popen")
        raise TestFailure("Popen reached")
    try:
        subprocess.Popen = forbidden  # type: ignore[assignment]
        with contextlib.redirect_stdout(io.StringIO()):
            check(controller.dispatch(["run", "1", "--max-seconds", "3599"]) == 1, "budget gate")
            controller.require_authority = lambda: (_ for _ in ()).throw(controller.ControllerError("closed authority"))
            check(controller.dispatch(["run", "1"]) == 1, "authority gate")
            controller.require_authority = saved[1]
            controller.git_custody = lambda: (_ for _ in ()).throw(controller.ControllerError("unpushed"))
            check(controller.dispatch(["run", "1"]) == 1, "custody gate")
            controller.git_custody = lambda: {}
            controller._prefix = lambda: {"row_count": 0}
            check(controller.dispatch(["run", "2"]) == 1, "ordinal gate")
            controller.base.run_row = lambda *_args: (_ for _ in ()).throw(controller.base.ReservationConflict("consumed"))
            check(controller.dispatch(["run", "1"]) == 1, "reuse gate")
    finally:
        subprocess.Popen, controller.require_authority, controller.git_custody, controller._prefix, controller.base.run_row = saved
    check(not calls, "no Popen on prelaunch/reuse gates")
    check(all(getattr(module, name) is value for module, name, value in originals), "main-path bindings restored")
    return 8


def main() -> int:
    checks = 0
    static = controller.validate_static(unused=True)
    check(static["temporary_bindings"] == 11 and static["subject_calls"] == 0, "static simple architecture"); checks += 1
    limits = controller.spec()["architecture_limits"]
    metrics = {}
    for name, prefix in (("controller.py", "controller"), ("glm_projection.py", "projection"), ("selftest.py", "selftest")):
        raw = (controller.HERE / name).read_bytes()
        metrics[name] = {"lines": len(raw.splitlines()), "bytes": len(raw)}
        check(metrics[name]["lines"] <= limits[f"{prefix}_max_physical_lines"] and metrics[name]["bytes"] <= limits[f"{prefix}_max_bytes"], f"{name} budget"); checks += 1
    check(sum(row["lines"] for row in metrics.values()) <= limits["all_python_max_physical_lines"] and sum(row["bytes"] for row in metrics.values()) <= limits["all_python_max_bytes"], "aggregate Python budget"); checks += 1
    checks += projection_checks()
    checks += rehashed_enter_check()
    checks += journal_checks()
    checks += binding_and_main_checks()
    check(not os.path.lexists(controller.EVIDENCE) and not any(controller.HERE.glob("__pycache__")), "no evidence/cache residue"); checks += 1
    print(pipeline.canonical_json({"status":"PASS_ZERO_SUBJECT_SELFTEST","checks":checks,"metrics":metrics,"temporary_bindings":11,"subject_calls":0,"qualification_credit":0}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
