#!/usr/bin/env python3
"""Zero-subject regressions for the two-row owned-GLM diagnostic."""
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
P, V, R10, V7 = controller.P, controller.V, controller.R10, controller.V7
v7test = controller.external("r10_v7_selftest_for_glm_diag", V7 / "selftest.py", V7)
OBJECTIVE = (V7 / "prompts/omp.prompt.txt").read_text(encoding="utf-8")[len("/goal ") :]
V3_ROW = R10 / "ox_owned_glm_reliability_v3" / "evidence" / "reliability_01" / "omp_ox_alpha_free_max"
V1_ROW = R10 / "muse_owned_glm_probe_v1" / "evidence" / "probe_01" / "omp_ox_alpha_free_max"
V7_ROW = V7 / "evidence" / "pass_01" / "omp_ox_alpha_free_max"
class TestFailure(RuntimeError): pass
def check(value: bool, message: str) -> None:
    if not value:
        raise TestFailure(message)
def expect(types: type[BaseException] | tuple[type[BaseException], ...], call: Callable[[], Any], message: str, fragment: str | None = None) -> None:
    try:
        call()
    except types as exc:
        check(fragment is None or fragment in str(exc), f"wrong rejection: {message}")
        return
    raise TestFailure(f"expected rejection: {message}")
def projection_args(row_dir: Path, model: str, thinking: str, *, require_exit: bool) -> dict[str, Any]:
    launch = P.load_json(row_dir / "launch.json")
    provider, model_name = model.split("/", 1)
    return {"expected_cwd": launch["cwd"], "expected_objective": OBJECTIVE, "expected_provider": provider,
            "expected_model": model_name, "expected_selector": model, "expected_thinking": thinking, "require_exit": require_exit}
def project_bytes(raw: bytes, arguments: dict[str, Any]) -> dict[str, Any]:
    with tempfile.TemporaryDirectory(prefix="pm-r10-glm-diag-projection-") as temporary:
        path = Path(temporary) / "session.jsonl"
        path.write_bytes(raw)
        return controller.projection.verify_session(path, **arguments)
def call_content(rows: list[dict[str, Any]]) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    content = next(row["message"]["content"] for row in rows if row.get("type") == "message" and isinstance(row.get("message"), dict) and row["message"].get("role") == "assistant" and isinstance(row["message"].get("content"), list) and any(isinstance(block, dict) and block.get("type") == "toolCall" for block in row["message"]["content"]))
    return next(block for block in content if block.get("type") == "toolCall"), content
def projection_checks() -> int:
    checks = 0
    raw = (V3_ROW / "session.raw.jsonl").read_bytes()
    check(len(raw) == 53071 and P.sha256_bytes(raw) == "0e46e4d154bc2446d026922e42febcf81e750784e20ffba3e39d7ecd59728e33", "real V3 GLM row freeze"); checks += 1
    args = projection_args(V3_ROW, "opencode-go/ox-alpha-free", "max", require_exit=True)
    result = controller.projection.verify_session(V3_ROW / "session.raw.jsonl", **args)
    controller.base.exact_result(result["final_text"])
    check(result["owned_glm_goal_call"] == {"present":True,"bytes":82,"sha256":"d6897df63bd35ea8e7b3eb5e036068814b6ed65712b7876879d5f19afdc8e013"} and result["owned_glm_post_call_framing"]["kind"] == "none" and result["ordinary_tool_calls"] == 0, "real canonical GLM/native Goal/scorer/exit replay"); checks += 1
    v1raw = (V1_ROW / "postfailure_session.raw.jsonl").read_bytes()
    check(len(v1raw) == 34948 and P.sha256_bytes(v1raw) == "1695208e98a3fd9b141110e0baadaa36eb783f76a13fbef8141a22a9893d0f9d", "observation trace freeze"); checks += 1
    v1args = projection_args(V1_ROW, "opencode-go/ox-alpha-free", "max", require_exit=False)
    observed = controller.projection.verify_session(V1_ROW / "postfailure_session.raw.jsonl", **v1args)
    controller.base.exact_result(observed["final_text"])
    check(observed["owned_glm_goal_call"]["bytes"] == 82 and observed["owned_glm_post_call_framing"]["kind"] == "observation_open" and observed["owned_glm_post_call_framing"]["bytes"] == 16, "sole observation framing unscored"); checks += 1
    expect(controller.omp_session.OmpSessionError, lambda: controller.projection.verify_session(V1_ROW / "postfailure_session.raw.jsonl", **{**v1args,"require_exit":True}), "abnormal exit never PASS"); checks += 1
    def changed(change: Callable[[dict[str, Any], list[dict[str, Any]]], None]) -> bytes:
        def apply(rows: list[dict[str, Any]]) -> None:
            call, content = call_content(rows)
            change(call, content)
        return v7test.mutate_session(raw, apply)
    def frame(text: str, *, extra: bool = False) -> bytes:
        def apply(call: dict[str, Any], content: list[dict[str, Any]]) -> None:
            index = content.index(call)
            content[index + 1 :] = [{"type":"text","text":text}]
            if extra:
                content.append({"type":"text","text":" "})
        return changed(apply)
    for text, kind in ((" \r\n", "ascii_whitespace"), ("\n" * 5000 + "<observation>\r", "observation_open")):
        candidate = project_bytes(frame(text), args)
        check(candidate["owned_glm_post_call_framing"]["kind"] == kind and candidate["final_text"] == result["final_text"], f"allowed {kind} framing"); checks += 1
    invalid = (
        (lambda call, content: content.append(copy.deepcopy(call)), "multiple call"),
        (lambda call, _content: call.update({"name":"read"}), "ordinary call"),
        (lambda call, _content: call.update({"arguments":{"op":"get"}}), "wrong arguments"),
        (lambda call, _content: call.pop("rawBlock"), "missing rawBlock"),
        (lambda call, _content: call.update({"rawBlock":"<invoke name='goal'/>"}), "foreign raw grammar"),
    )
    for change, label in invalid:
        expect(controller.projection.ProjectionError, lambda change=change: project_bytes(changed(change), args), label); checks += 1
    for text, extra, label in (("\u00a0<observation>",False,"Unicode whitespace"),("<observation><observation>",False,"duplicate marker"),("<observation></observation>",False,"closing marker"),("prose",False,"prose"),("<tool_response>",False,"tool response"),("PM_RESULT",False,"result leakage"),("<observation>",True,"following block")):
        expect(controller.projection.ProjectionError, lambda text=text, extra=extra: project_bytes(frame(text, extra=extra), args), label); checks += 1
    return checks
def transport_mutation_check() -> int:
    route = P.load_json(V7 / "matrix.json")["ordered_routes"][0]
    clean = V.verify_row("pass_01", route)
    check(clean["status"] == "PASS", "real V7 transport fixture")
    with tempfile.TemporaryDirectory(prefix="pm-r10-glm-diag-enter-") as temporary:
        evidence = Path(temporary) / "evidence"
        row = evidence / "pass_01" / route["id"]
        shutil.copytree(V7_ROW, row)
        enter = row / "stdin_enter.raw"
        enter.write_bytes(b"\n")
        receipt_path = row / "enter_write.json"
        receipt = P.load_json(receipt_path); receipt["sha256"] = P.sha256_file(enter); P.atomic_write(receipt_path, P.pretty_json(receipt))
        terminal_path = row / "terminal.json"
        terminal = P.load_json(terminal_path)
        for record in terminal["evidence"]:
            if record["path"] in {"stdin_enter.raw", "enter_write.json"}:
                path = row / record["path"]; record.update({"bytes":path.stat().st_size,"sha256":P.sha256_file(path)})
        P.atomic_write(terminal_path, P.pretty_json(terminal))
        original = V.EVIDENCE
        try:
            V.EVIDENCE = evidence
            expect(V.VerifyError, lambda: V.verify_row("pass_01", route), "rehash cannot hide CR-to-LF mutation")
        finally:
            V.EVIDENCE = original
    return 2
def journal_checks() -> int:
    original, checks = controller.EVIDENCE, 0
    try:
        with tempfile.TemporaryDirectory(prefix="pm-r10-glm-diag-journal-") as temporary:
            controller.EVIDENCE = Path(temporary) / "evidence"; controller.EVIDENCE.mkdir()
            reports: list[dict[str, Any]] = []; journal: list[dict[str, Any]] = []
            for row in controller.rows():
                report = {"ordinal":row["ordinal"],"started_at_utc":f"2026-08-26T14:30:0{row['ordinal']}.000Z","launch_sha256":f"launch-{row['ordinal']}","omp_preflight_sha256":f"preflight-{row['ordinal']}","pid":9100+row["ordinal"]}
                reports = [{"pass_id":"diagnostic_01","rows":[*(reports[0]["rows"] if reports else []),report]}]
                journal.append({"schema_id":"pm.r10.storage_pipeline.launch_journal.v2",**{field:row[field] for field in controller.IDENTITY},**{field:report[field] for field in ("started_at_utc","launch_sha256","omp_preflight_sha256","pid")},"popen_observed":True})
                P.atomic_write(controller.EVIDENCE / "launch_journal.jsonl", P.jsonl_bytes(journal)); controller.generic_journal(reports); checks += 1
            for change, label in ((lambda value:value.append(copy.deepcopy(value[-1])),"extra"),(lambda value:value[0].update({"nonce":"0"*32}),"identity"),(lambda value:value[0].update({"launch_sha256":"wrong"}),"launch hash"),(lambda value:value[0].update({"omp_preflight_sha256":"wrong"}),"preflight hash"),(lambda value:value[0].update({"popen_observed":False}),"Popen"),(lambda value:value[0].update({"pid":0}),"PID")):
                candidate = copy.deepcopy(journal); change(candidate); P.atomic_write(controller.EVIDENCE / "launch_journal.jsonl", P.jsonl_bytes(candidate))
                expect(controller.ControllerError, lambda: controller.generic_journal(reports), label); checks += 1
    finally:
        controller.EVIDENCE = original
    return checks
def repeat_after_pass_check() -> int:
    saved = (subprocess.Popen, controller.git_custody, controller._prefix, controller.base.run_row,
             controller.base.record_failure, controller.preserve_postfailure, controller.EVIDENCE)
    calls: list[str] = []
    def forbidden(label: str) -> Callable[..., Any]:
        def call(*_args: Any, **_kwargs: Any) -> Any:
            calls.append(label); raise TestFailure(f"forbidden repeat path: {label}")
        return call
    try:
        with tempfile.TemporaryDirectory(prefix="pm-r10-glm-diag-repeat-") as temporary:
            controller.EVIDENCE = Path(temporary) / "evidence"; row = controller.rows()[0]
            row_dir = controller.EVIDENCE / row["pass_id"] / row["route_id"]
            row_dir.mkdir(parents=True)
            for name, raw in (("terminal.json",b"immutable prior PASS terminal\n"),("session.raw.jsonl",b"immutable prior PASS raw\n")):
                (row_dir / name).write_bytes(raw)
            frozen = {path.name:path.read_bytes() for path in row_dir.iterdir()}
            custody = {"candidate_commit":"a"*40,"head":"a"*40,"origin_main":"a"*40,"truenas_backup_main":"a"*40,"sources":[]}
            controller.git_custody = lambda: custody; controller._prefix = lambda: {"row_count":1}
            controller.base.run_row = forbidden("run_row"); controller.base.record_failure = forbidden("record_failure")
            controller.preserve_postfailure = lambda _row: (row_dir / "postfailure_session.raw.jsonl").write_bytes(b"forbidden mutation")
            subprocess.Popen = forbidden("Popen")  # type: ignore[assignment]
            output = io.StringIO()
            with contextlib.redirect_stdout(output):
                check(controller.dispatch(["run","1"]) == 1, "repeat ordinal rejected")
            receipt = P.strict_loads(output.getvalue())
            check(receipt["status"] == "FAIL_PRELAUNCH_NO_MUTATION", "repeat remains prelaunch/no mutation")
            check({path.name:path.read_bytes() for path in row_dir.iterdir()} == frozen, "repeat row byte-identical")
            check(not (row_dir / "postfailure_session.raw.jsonl").exists() and not calls, "repeat has no preservation/run/Popen")
    finally:
        subprocess.Popen, controller.git_custody, controller._prefix, controller.base.run_row, controller.base.record_failure, controller.preserve_postfailure, controller.EVIDENCE = saved
    return 4
def success_output_failure_check() -> int:
    saved = (subprocess.Popen, controller.base.run_row, controller.base.record_failure, controller.preserve_postfailure, controller.EVIDENCE, controller.git_custody, controller._prefix); calls: list[str] = []; frozen: dict[str, bytes] = {}
    class Closed(io.StringIO):
        def write(self, _value: str) -> int: raise BrokenPipeError("closed stdout after PASS")
    def passed(*_args: Any) -> dict[str, str]:
        calls.append("run_row"); row = controller.rows()[0]; row_dir = controller.EVIDENCE / row["pass_id"] / row["route_id"]; row_dir.mkdir(parents=True)
        for name, raw in (("terminal.json",b"durable PASS terminal\n"),("session.raw.jsonl",b"durable PASS raw\n")): (row_dir / name).write_bytes(raw)
        frozen.update({path.name:path.read_bytes() for path in row_dir.iterdir()}); return {"status":"PASS"}
    try:
        with tempfile.TemporaryDirectory(prefix="pm-r10-glm-diag-pass-output-") as temporary:
            controller.EVIDENCE = Path(temporary) / "evidence"; controller.git_custody = lambda: {"candidate_commit":"a"*40,"head":"a"*40,"origin_main":"a"*40,"truenas_backup_main":"a"*40,"sources":[]}; controller._prefix = lambda: {"row_count":0}; controller.base.run_row = passed
            controller.preserve_postfailure = lambda *_args: calls.append("preserve"); controller.base.record_failure = lambda *_args: calls.append("record_failure"); subprocess.Popen = lambda *_args, **_kwargs: calls.append("Popen")  # type: ignore[assignment]
            with contextlib.redirect_stdout(Closed()): expect(BrokenPipeError, lambda: controller.dispatch(["run","1"]), "closed stdout after durable PASS")
            row = controller.rows()[0]; row_dir = controller.EVIDENCE / row["pass_id"] / row["route_id"]
            check({path.name:path.read_bytes() for path in row_dir.iterdir()} == frozen and not (row_dir / "postfailure_session.raw.jsonl").exists(), "post-PASS output error leaves row byte-identical"); check(calls == ["run_row"], "post-PASS output error has no preserve/record/Popen")
    finally:
        subprocess.Popen, controller.base.run_row, controller.base.record_failure, controller.preserve_postfailure, controller.EVIDENCE, controller.git_custody, controller._prefix = saved
    return 3
def binding_and_dispatch_checks() -> int:
    current = controller.bindings(); originals = [(module,name,getattr(module,name)) for module,name,_value in current]
    try:
        with controller.installed():
            check(all(getattr(module,name) is value for module,name,value in controller.bindings()), "all bindings installed")
            raise TestFailure("exercise finally")
    except TestFailure:
        pass
    check(all(getattr(module,name) is value for module,name,value in originals), "all bindings restored")
    check(controller.verify_prefix()["row_count"] == 0, "zero prefix")
    checks = 3
    saved = (subprocess.Popen, controller.require_authority, controller.git_custody, controller._prefix, controller.base.run_row, controller.EVIDENCE, controller.ORIGINAL_PREFLIGHT)
    popen: list[str] = []
    def forbidden(*_args: Any, **_kwargs: Any) -> Any:
        popen.append("Popen"); raise TestFailure("Popen reached")
    try:
        expect(controller.ControllerError, controller.git_custody, "untracked package has no pushed custody"); checks += 1
        subprocess.Popen = forbidden  # type: ignore[assignment]
        with contextlib.redirect_stdout(io.StringIO()):
            check(controller.dispatch(["run","1","--max-seconds","3599"]) == 1, "budget gate"); checks += 1
            controller.require_authority = lambda _row: (_ for _ in ()).throw(controller.ControllerError("closed authority"))
            check(controller.dispatch(["run","1"]) == 1, "authority gate"); checks += 1
            controller.require_authority = saved[1]
            controller.git_custody = lambda: (_ for _ in ()).throw(controller.ControllerError("unpushed"))
            check(controller.dispatch(["run","1"]) == 1, "untracked custody gate"); checks += 1
            controller.git_custody = lambda: {"candidate_commit":"a"*40,"head":"a"*40,"origin_main":"a"*40,"truenas_backup_main":"a"*40,"sources":[]}
            controller._prefix = lambda: {"row_count":0}
            controller.base.run_row = lambda *_args: (_ for _ in ()).throw(controller.base.ReservationConflict("consumed"))
            check(controller.dispatch(["run","1"]) == 1, "reuse gate"); checks += 1
            check(controller.dispatch(["run","2"]) == 1, "Muse order gate"); checks += 1
        controller.DISPATCH_CUSTODY = {"candidate_commit":"a"*40}
        controller.git_custody = lambda: {"candidate_commit":"b"*40}
        controller.ORIGINAL_PREFLIGHT = forbidden
        expect(controller.ControllerError, lambda: controller.row_preflight(Path("/tmp/never"), controller.rows()[0], controller.route_map()["omp_ox_alpha_free_max"]), "pre-Popen custody drift"); checks += 1
        with tempfile.TemporaryDirectory(prefix="pm-r10-glm-diag-claim-") as temporary:
            controller.EVIDENCE = Path(temporary) / "evidence"
            controller.ORIGINAL_PREFLIGHT = saved[6]
            controller.git_custody = lambda: {"candidate_commit":"a"*40,"head":"a"*40,"origin_main":"a"*40,"truenas_backup_main":"a"*40,"sources":[]}
            controller._prefix = lambda: {"row_count":0}
            def parent_failure(*_args: Any) -> Any:
                controller.EVIDENCE.mkdir(); (controller.EVIDENCE / "diagnostic_01").mkdir(); raise controller.ControllerError("partial reserve")
            controller.base.run_row = parent_failure
            with contextlib.redirect_stdout(io.StringIO()):
                check(controller.dispatch(["run","1"]) == 1, "partial parent consumed"); checks += 1
            row = controller.EVIDENCE / "diagnostic_01" / "omp_ox_alpha_free_max"
            check(P.load_json(row / "terminal.json")["status"] == "FAIL" and (row / "runner_failure.json").is_file(), "durable new-root failure")
            check(not os.path.lexists(controller.EVIDENCE / "diagnostic_01" / "omp_muse_spark_xhigh"), "suffix absent"); checks += 2
        with tempfile.TemporaryDirectory(prefix="pm-r10-glm-diag-absent-") as temporary:
            controller.EVIDENCE = Path(temporary) / "evidence"; controller.base.run_row = lambda *_args: (_ for _ in ()).throw(controller.ControllerError("before mutation"))
            with contextlib.redirect_stdout(io.StringIO()):
                check(controller.dispatch(["run","1"]) == 1, "absent prelaunch failure"); checks += 1
            check(not os.path.lexists(controller.EVIDENCE), "truly absent remains absent"); checks += 1
    finally:
        subprocess.Popen, controller.require_authority, controller.git_custody, controller._prefix, controller.base.run_row, controller.EVIDENCE, controller.ORIGINAL_PREFLIGHT = saved
        controller.DISPATCH_CUSTODY = None
    check(not popen, "no Popen on zero-subject gates"); checks += 1
    check(all(getattr(module,name) is value for module,name,value in originals), "bindings restored after dispatch"); checks += 1
    return checks
def main() -> int:
    checks = 0
    static = controller.validate_static(unused=True)
    check(static["rows"] == 2 and static["temporary_bindings"] == 11 and static["subject_calls"] == 0, "static diagnostic"); checks += 1
    checks += projection_checks()
    checks += transport_mutation_check()
    checks += journal_checks()
    checks += repeat_after_pass_check()
    checks += success_output_failure_check()
    checks += binding_and_dispatch_checks()
    check(not os.path.lexists(controller.EVIDENCE) and not list(controller.HERE.rglob("*.pyc")) and not list(controller.HERE.rglob("__pycache__")), "no evidence/cache residue"); checks += 1
    print(P.canonical_json({"status":"PASS_ZERO_SUBJECT_SELFTEST","checks":checks,"metrics":static["metrics"],"temporary_bindings":11,"subject_calls":0,"qualification_credit":0}))
    return 0
if __name__ == "__main__":
    raise SystemExit(main())
