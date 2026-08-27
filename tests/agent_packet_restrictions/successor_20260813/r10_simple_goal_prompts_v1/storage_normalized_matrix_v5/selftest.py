#!/usr/bin/env python3
"""Zero-subject regression suite for the thin V5 normalized matrix adapter."""
from __future__ import annotations
import contextlib
import copy
import importlib.util
import io
import json
import os
import shutil
import tempfile
import threading
from pathlib import Path
import controller as C
P, V = C.P, C.V
CHECKS: list[str] = []
def check(value: bool, name: str) -> None:
    if not value: raise RuntimeError(name)
    CHECKS.append(name)
def rejects(function: object, name: str, contains: str = "", error: type[BaseException] | tuple[type[BaseException], ...] = Exception) -> None:
    try: function()  # type: ignore[operator]
    except error as exc: check(not contains or contains in str(exc), name); return
    raise RuntimeError(f"accepted mutation: {name}")
def exact_final() -> str: return P.RESULT_PREFIX + (C.V7 / "oracle.json").read_text().strip()
def reordered_final() -> str:
    value = P.strict_loads(exact_final()[len(P.RESULT_PREFIX):]); keys = list(value); reordered = {key: value[key] for key in (*keys[1:], keys[0])}
    return P.RESULT_PREFIX + json.dumps(reordered, ensure_ascii=False, separators=(",", ":"), allow_nan=False)
def inline_whitespace_final() -> str:
    return P.RESULT_PREFIX + json.dumps(P.strict_loads(exact_final()[len(P.RESULT_PREFIX):]), ensure_ascii=False, separators=(", ", ": "), allow_nan=False)
def codex_fixture_module() -> object:
    path = C.V2 / "selftest.py"; spec = importlib.util.spec_from_file_location("normalized_matrix_v2_fixture_source", path)
    if spec is None or spec.loader is None: raise RuntimeError("V2 fixture unavailable")
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module); return module
def v4_module() -> object:
    path = C.R10 / "storage_normalized_matrix_v4/controller.py"; spec = importlib.util.spec_from_file_location("normalized_matrix_v4_failure_source", path)
    if spec is None or spec.loader is None: raise RuntimeError("V4 source unavailable")
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module); return module
def normalize_codex_text(text: str, *, earlier: tuple[str, ...] = (), after: tuple[str, ...] = ()) -> dict:
    row = C.rows()[5]; route = C.route_map()[row["route_id"]]; fixture = codex_fixture_module(); session = "01a09999-1111-7222-8333-444455556666"; raw = fixture.synthetic_raw(route, session, row["projectless_directory_name"]); raw[-1]["payload"]["content"] = [{"type": "output_text", "text": text}]
    assistant = lambda value: {"type": "response_item", "payload": {"type": "message", "role": "assistant", "phase": "commentary", "content": [{"type": "output_text", "text": value}]}}
    raw = [*raw[:5], *(assistant(value) for value in earlier), *raw[5:], *(assistant(value) for value in after)]; raw = [{"ordinal": index, **{key: value for key, value in item.items() if key != "ordinal"}} for index, item in enumerate(raw)]
    with tempfile.TemporaryDirectory(prefix="r10-normalized-app-") as temporary:
        path = Path(temporary) / "rollout.raw.jsonl"; P.atomic_write(path, P.jsonl_bytes(raw)); P.atomic_write(path.parent / "launch.json", P.pretty_json({"external_prompt_count": 1}))
        with C.installed(), C.selected(row): return C.verify_codex_candidate(path.parent, row, {"threadId": session}, (C.V7 / "prompts/codex.prompt.txt").read_text(), text)
def replay_omp(directory: Path) -> dict:
    launch = P.load_json(directory / "launch.json"); prompt = (C.V7 / "prompts/omp.prompt.txt").read_bytes(); objective = prompt[len(b"/goal "):].decode()
    structural = C.G.ORIGINAL_SESSION(directory / "session.raw.jsonl", expected_cwd=launch["cwd"], expected_objective=objective, expected_provider=launch["model"].split("/", 1)[0], expected_model=launch["model"].split("/", 1)[1], expected_selector=launch["model"], expected_thinking=launch["thinking"], require_exit=True); return C.N.normalize_verified_session(directory / "session.raw.jsonl", structural, oracle_path=C.V7 / "oracle.json", schema_path=C.V7 / "response.schema.json", max_text_block_utf8_bytes=P.load_json(C.V7 / "matrix.json")["max_final_assistant_utf8_bytes"])
def normalize_omp_candidate(candidate: str) -> dict:
    directory = C.V6 / "evidence/pass_01/omp_glm53_flash_max"; launch = P.load_json(directory / "launch.json"); raw = (directory / "session.raw.jsonl").read_bytes(); slot = raw[:C.omp_session.TITLE_SLOT_BYTES]; rows = [P.strict_loads(line) for line in raw[C.omp_session.TITLE_SLOT_BYTES:].decode().splitlines()]; replaced = 0
    for row in rows:
        message = row.get("message") if row.get("type") == "message" else None
        if not isinstance(message, dict) or message.get("role") != "assistant": continue
        for block in message.get("content", []):
            if not isinstance(block, dict) or block.get("type") != "text" or not isinstance(block.get("text"), str): continue
            lines = block["text"].split("\n"); replaced += sum(line == exact_final() for line in lines); block["text"] = "\n".join(candidate if line == exact_final() else line for line in lines)
    check(replaced == 2, "V6 two exact candidate mutation sites")
    with tempfile.TemporaryDirectory(prefix="r10-normalized-omp-order-") as temporary:
        path = Path(temporary) / "session.raw.jsonl"; P.atomic_write(path, slot + b"".join((P.canonical_json(row) + "\n").encode() for row in rows)); prompt = (C.V7 / "prompts/omp.prompt.txt").read_bytes()
        with C.installed(), C.selected(C.rows()[0]): return C.verify_session(path, expected_cwd=launch["cwd"], expected_objective=prompt[len(b"/goal "):].decode(), expected_provider="opencode-go", expected_model="glm-5.3-flash", expected_selector=launch["model"], expected_thinking=launch["thinking"], require_exit=False)
def session_variant(raw: bytes, boundary: str, mutation: str = "") -> bytes:
    slot, rows = raw[:C.omp_session.TITLE_SLOT_BYTES], [P.strict_loads(line) for line in raw[C.omp_session.TITLE_SLOT_BYTES:].decode().splitlines()]
    predicates = {"final": lambda row: row.get("type") == "message" and row.get("message", {}).get("role") == "assistant" and row.get("message", {}).get("stopReason") == "stop", "none": lambda row: row.get("type") == "mode_change" and row.get("mode") == "none", "completed": lambda row: row.get("type") == "custom" and row.get("customType") == "goal-completed"}
    if boundary in predicates: rows = rows[:max(index for index, row in enumerate(rows) if predicates[boundary](row)) + 1]
    for row in rows:
        message = row.get("message") if row.get("type") == "message" else None
        if mutation in {"retry", "provider"} and isinstance(message, dict) and message.get("role") == "assistant": message["retryRecovery" if mutation == "retry" else "stopReason"] = {"attempt": 1} if mutation == "retry" else "error"; break
        if mutation == "signal" and row.get("type") == "custom" and row.get("customType") == "session_exit": row["data"]["kind"] = "signal"
    return slot + P.jsonl_bytes(rows)
def session_health_tests() -> None:
    source = C.V6 / "evidence/pass_01/omp_glm53_flash_max"; launch = P.load_json(source / "launch.json"); raw = (source / "session.raw.jsonl").read_bytes(); objective = (C.V7 / "prompts/omp.prompt.txt").read_bytes()[len(b"/goal "):].decode(); ctrl_d = []
    def verify(path: Path, require_exit: bool) -> dict:
        with C.installed(), C.selected(C.rows()[0]): return C.verify_session(path, expected_cwd=launch["cwd"], expected_objective=objective, expected_provider="opencode-go", expected_model="glm-5.3-flash", expected_selector="opencode-go/glm-5.3-flash", expected_thinking="max", require_exit=require_exit)
    with tempfile.TemporaryDirectory(prefix="r10-v5-session-health-") as temporary:
        root = Path(temporary); paths = {name: root / f"{name}.jsonl" for name in ("final", "none", "completed", "signal", "retry", "provider")}
        for name in paths: P.atomic_write(paths[name], session_variant(raw, "full" if name in {"signal", "retry", "provider"} else name, name if name in {"signal", "retry", "provider"} else ""))
        for name in ("final", "none", "completed"):
            try: result = verify(paths[name], False)
            except C.omp_session.OmpSessionError: continue
            ctrl_d.append(b"\x04"); check(name == "completed" and result["final_text"] == exact_final(), "Goal-completed structural and normalized pass")
        check(ctrl_d == [b"\x04"] and C.session_health(paths["final"]) is C.session_health(paths["none"]) is C.session_health(paths["completed"]) is False, "final-none-completed reaches one Ctrl-D only at grammar pass")
        rejects(lambda: verify(paths["signal"], True), "stopped V2-shape signal full require-exit failure", "terminal structural failure", C.G.PermanentCanaryError)
        rejects(lambda: C.session_health(paths["retry"]), "retryRecovery immediate permanent", "retry/provider error", C.PermanentMatrixError)
        rejects(lambda: C.session_health(paths["provider"]), "provider error immediate permanent", "retry/provider error", C.PermanentMatrixError)
def preservation_order_test() -> None:
    held = C.EVIDENCE, C.validate_static, C.verify_prefix, C.require_launch_authority, C.git_custody, C.G.current_runtime_preflight, C.G.PROMPT_READY_RUN_ROW, C.M.claim_after_failure, C.G.preserve_failure, C.base.record_failure; order = []
    with tempfile.TemporaryDirectory(prefix="r10-v3-preserve-") as temporary:
        C.EVIDENCE = Path(temporary) / "evidence"; C.validate_static = lambda **_kwargs: {"status": "TEST"}; C.verify_prefix = lambda: {"row_count": 0}; C.require_launch_authority = lambda _row: None; C.git_custody = lambda: {}; C.G.current_runtime_preflight = lambda: {"status":"PASS_OMP_RUNTIME_18_0_7","subject_calls":0}; C.G.PROMPT_READY_RUN_ROW = lambda *_args: (_ for _ in ()).throw(C.MatrixError("post-reservation failure")); C.M.claim_after_failure = lambda *_args: True; C.G.preserve_failure = lambda _row: order.append("preserve"); C.base.record_failure = lambda *_args: order.append("terminal")
        try:
            with contextlib.redirect_stdout(io.StringIO()) as output: rc = C.dispatch(["run-omp", "1", "--max-seconds", "3600"])
        finally: C.EVIDENCE, C.validate_static, C.verify_prefix, C.require_launch_authority, C.git_custody, C.G.current_runtime_preflight, C.G.PROMPT_READY_RUN_ROW, C.M.claim_after_failure, C.G.preserve_failure, C.base.record_failure = held
    check(rc == 1 and order == ["preserve", "terminal"] and "FAIL_CONSUMED_STOP_SUFFIX" in output.getvalue(), "preserve_failure precedes bound terminalization")
    row = C.rows()[0]
    with tempfile.TemporaryDirectory(prefix="r10-v5-preserve-error-") as temporary:
        C.EVIDENCE = Path(temporary) / "evidence"; C.validate_static = lambda **_kwargs: {"status": "TEST"}; C.verify_prefix = lambda: {"row_count": 0}; C.require_launch_authority = lambda _row: None; C.git_custody = lambda: {}; C.G.current_runtime_preflight = lambda: {"status":"PASS_OMP_RUNTIME_18_0_7","subject_calls":0}; C.M.claim_after_failure = held[7]; C.base.record_failure = held[9]
        def claimed_failure(*_args: object) -> None:
            directory = C.row_dir(row); directory.mkdir(parents=True); P.atomic_write(directory / "reservation.json", P.pretty_json({"status": "CONSUMED_TEST_CLAIM"})); raise C.MatrixError("primary post-reservation failure")
        C.G.PROMPT_READY_RUN_ROW = claimed_failure
        C.G.preserve_failure = lambda _row: (_ for _ in ()).throw(OSError("unsafe multiple session files"))
        try:
            with contextlib.redirect_stdout(io.StringIO()) as preserve_output: preserve_rc = C.dispatch(["run-omp", "1", "--max-seconds", "3600"])
            directory = C.row_dir(row); failure = P.load_json(directory / "runner_failure.json"); terminal = P.load_json(directory / "terminal.json")
            check(preserve_rc == 1 and terminal["status"] == "FAIL" and terminal["no_retry"] is True and failure["qualification_credit"] == 0 and "primary post-reservation failure; failure preservation error: OSError: unsafe multiple session files" in failure["error"] and "FAIL_CONSUMED_STOP_SUFFIX" in preserve_output.getvalue() and not os.path.lexists(C.row_dir(C.rows()[1])), "preservation error still durably terminalizes consumed row and blocks suffix")
        finally: C.EVIDENCE, C.validate_static, C.verify_prefix, C.require_launch_authority, C.git_custody, C.G.current_runtime_preflight, C.G.PROMPT_READY_RUN_ROW, C.M.claim_after_failure, C.G.preserve_failure, C.base.record_failure = held
    source = C.V6 / "evidence/pass_01/omp_glm53_flash_max/session.raw.jsonl"; calls, prefixes, snapshot = [], [], []
    with tempfile.TemporaryDirectory(prefix="r10-v3-postpass-") as temporary:
        C.EVIDENCE = Path(temporary) / "evidence"; live_dir = Path(row["session_dir"]); check(not os.path.lexists(live_dir), "post-PASS fixture fresh live session"); live_dir.mkdir(parents=True); live = live_dir / "session.jsonl"; P.atomic_write(live, source.read_bytes())
        def prefix() -> dict:
            prefixes.append(True)
            if len(prefixes) == 1: return {"row_count": 0}
            raise C.MatrixError("post-row prefix failure")
        def passed(*_args: object) -> dict:
            directory = C.row_dir(row); directory.mkdir(parents=True); receipt = directory / "pass_receipt.json"; P.atomic_write(receipt, P.pretty_json({"status": "PASS_RECEIPT"})); terminal = {"status": "PASS", "evidence": [C.file_record(receipt, directory)]}; P.atomic_write(directory / "terminal.json", P.pretty_json(terminal)); snapshot[:] = [(directory / "terminal.json").read_bytes(), tuple(sorted(path.name for path in directory.iterdir()))]; return terminal
        original_preserve, original_record = C.G.preserve_failure, C.base.record_failure
        C.validate_static = lambda **_kwargs: {"status": "TEST"}; C.verify_prefix = prefix; C.require_launch_authority = lambda _row: None; C.git_custody = lambda: {}; C.G.current_runtime_preflight = lambda: {"status":"PASS_OMP_RUNTIME_18_0_7","subject_calls":0}; C.G.PROMPT_READY_RUN_ROW = passed; C.G.preserve_failure = lambda item: (calls.append("preserve"), original_preserve(item))[1]; C.base.record_failure = lambda *args: (calls.append("record"), original_record(*args))[1]
        try:
            with contextlib.redirect_stdout(io.StringIO()) as post_output: post_rc = C.dispatch(["run-omp", "1", "--max-seconds", "3600"])
            directory = C.row_dir(row); check(post_rc == 1 and calls == ["record"] and prefixes == [True, True] and live.is_file() and not os.path.lexists(directory / "postfailure_session.raw.jsonl") and (directory / "terminal.json").read_bytes() == snapshot[0] and tuple(sorted(path.name for path in directory.iterdir())) == snapshot[1] == ("pass_receipt.json", "terminal.json") and "FAIL_CONSUMED_STOP_SUFFIX" in post_output.getvalue(), "post-PASS verifier failure preserves no session and leaves terminal roster unchanged")
        finally: C.EVIDENCE, C.validate_static, C.verify_prefix, C.require_launch_authority, C.git_custody, C.G.current_runtime_preflight, C.G.PROMPT_READY_RUN_ROW, C.M.claim_after_failure, C.G.preserve_failure, C.base.record_failure = held; shutil.rmtree(live_dir, ignore_errors=True)
class PopenSentinel(RuntimeError): pass
def imported_runner_sentinel(row: dict) -> None:
    original_evidence, original_custody, original_popen = C.EVIDENCE, C.git_custody, C.G.ORIGINAL_POPEN
    custody, calls = {"candidate_commit": "a" * 40}, []
    with tempfile.TemporaryDirectory(prefix="r10-v3-runner-sentinel-") as temporary:
        C.EVIDENCE = Path(temporary) / "evidence"; C.git_custody = lambda: custody
        def popen(*_args: object, **_kwargs: object) -> None: calls.append(row["route_id"]); raise PopenSentinel("zero-subject Popen sentinel")
        def preflight(path: Path, planned: dict, _route: dict) -> dict: C.validate_omp_paths(planned); receipt = {"status": "ZERO_SUBJECT_PREFLIGHT_STUB"}; P.atomic_write(path / "omp_preflight.json", P.pretty_json(receipt)); return receipt
        C.G.ORIGINAL_POPEN = popen
        try:
            with C.installed(), C.selected(row):
                prior_next = C.base.verify_next_row; C.base.verify_next_row = lambda _row: []
                C.base.row_preflight = preflight; C.DISPATCH_CUSTODY = C.G.DISPATCH_CUSTODY = custody
                try: C.base.run_row(row["pass_id"], row["route_id"], 3600)
                except PopenSentinel: pass
                finally: C.base.verify_next_row = prior_next; C.DISPATCH_CUSTODY = C.G.DISPATCH_CUSTODY = None
        finally: C.EVIDENCE, C.git_custody, C.G.ORIGINAL_POPEN = original_evidence, original_custody, original_popen; [shutil.rmtree(path, ignore_errors=True) for path in C.runtime_paths(row)]
    check(calls == [row["route_id"]], f"imported runner reached one {row['route_id']} Popen sentinel")
def runtime_pre_reservation_tests() -> None:
    held = C.EVIDENCE, C.validate_static, C.verify_prefix, C.require_launch_authority, C.git_custody, C.G.current_runtime_preflight, C.G.ORIGINAL_POPEN
    row, popens = C.rows()[0], []
    with tempfile.TemporaryDirectory(prefix="r10-v5-runtime-gate-") as temporary:
        C.EVIDENCE = Path(temporary) / "evidence"; C.validate_static = lambda **_kwargs: {"status":"TEST"}; C.verify_prefix = lambda: {"row_count":0}; C.require_launch_authority = lambda _row: None; C.G.ORIGINAL_POPEN = lambda *_args, **_kwargs: popens.append(True)
        custody = {"candidate_commit":"a" * 40}
        try:
            C.git_custody = lambda: custody; C.G.current_runtime_preflight = lambda: (_ for _ in ()).throw(C.MatrixError("runtime drift before reservation"))
            with contextlib.redirect_stdout(io.StringIO()) as output: rc = C.dispatch(["run-omp","1","--max-seconds","3600"])
            check(rc == 1 and "FAIL_PRELAUNCH_NO_MUTATION" in output.getvalue() and "runtime drift before reservation" in output.getvalue() and not popens and not os.path.lexists(C.EVIDENCE), "runtime drift stops before reservation/Popen")
            observed = [custody, {"candidate_commit":"b" * 40}]
            C.git_custody = lambda: observed.pop(0) if observed else {"candidate_commit":"b" * 40}; C.G.current_runtime_preflight = lambda: {"status":"PASS_OMP_RUNTIME_18_0_7","subject_calls":0}
            with contextlib.redirect_stdout(io.StringIO()) as output: rc = C.dispatch(["run-omp","1","--max-seconds","3600"])
            check(rc == 1 and "source custody unchanged across runtime preflight" in output.getvalue() and not popens and not os.path.lexists(C.EVIDENCE), "source drift across runtime gate stops before reservation/Popen")
        finally:
            C.EVIDENCE, C.validate_static, C.verify_prefix, C.require_launch_authority, C.git_custody, C.G.current_runtime_preflight, C.G.ORIGINAL_POPEN = held
def matrix_context_prefix_tests() -> None:
    F = v4_module(); prior1, prior2 = F.rows()[:2]; custody = P.load_json(F.row_dir(prior1) / "omp_preflight.json")["git_custody"]
    with F.installed(), F.selected(prior2):
        rejects(lambda: F.V.verify_row(prior1["pass_id"], F.route_map()[prior1["route_id"]]), "V4 row2 reproduces prior-row profile failure", "OMP preflight profile", F.V.VerifyError)
        old_rows, old_formal, formal = F.G.rows, F.G.verify_formal, []
        F.G.rows = lambda: [prior1]; F.G.verify_formal = lambda *_args: formal.append(True)
        try: unsafe = F.base.verify_next_row(prior2)
        finally: F.G.rows, F.G.verify_formal = old_rows, old_formal
        check(len(unsafe) == 1 and not formal, "profile-only substitution reproduces formal/private HTTP bypass")
    held = C.EVIDENCE, C.rows, C.route_map, C.launch_plan_map, C.git_custody, C.verify_omp_receipt, C.V.verify_row
    observed = []
    C.EVIDENCE, C.rows, C.route_map, C.launch_plan_map, C.git_custody = F.EVIDENCE, F.rows, F.route_map, F.launch_plan_map, lambda: custody
    original_verify_row = C.V.verify_row
    def observed_row(pass_id: str, route: dict) -> dict:
        current = C.selected_row(); observed.append(("row", current["ordinal"], C.G.rows()[0]["ordinal"], C.G.PROXY.load_json(C.V7 / "runtime_manifest.json")["omp"]["profile_dir"] == current["profile_dir"])); return original_verify_row(pass_id, route)
    def observed_receipt(row: dict, got: dict) -> None:
        observed.append(("formal", C.selected_row()["ordinal"], row["ordinal"], Path(row["private_capture_dir"]).is_dir()))
        previous = F.EVIDENCE; F.EVIDENCE = C.EVIDENCE
        try:
            with F.installed(), F.selected(row): F.verify_omp_receipt(row, got)
        finally: F.EVIDENCE = previous
    C.V.verify_row, C.verify_omp_receipt = observed_row, observed_receipt
    try:
        with C.installed(), C.selected(prior2):
            journal = C.verify_next_row_in_matrix_context(prior2)
            check(len(journal) == 1 and C.selected_row()["ordinal"] == 2 and observed == [("row", 1, 1, True), ("formal", 1, 1, True)], "V5 full prefix selects prior GLM profile/formal/private and restores current row")
            original_prefix = C.verify_prefix
            def failed_prefix() -> dict:
                with C.selected(prior1): check(C.selected_row()["ordinal"] == 1, "exception prefix prior context")
                raise C.MatrixError("synthetic full-prefix failure")
            C.verify_prefix = failed_prefix
            try: rejects(lambda: C.verify_next_row_in_matrix_context(prior2), "inner prefix exception propagates", "synthetic full-prefix failure", C.MatrixError); check(C.selected_row()["ordinal"] == 2, "current row restored after inner prefix exception")
            finally: C.verify_prefix = original_prefix
        for mutation in ("profile", "formal"):
            with tempfile.TemporaryDirectory(prefix=f"r10-v5-prior-{mutation}-") as temporary:
                C.EVIDENCE = Path(temporary) / "evidence"; shutil.copytree(F.EVIDENCE, C.EVIDENCE); directory = C.EVIDENCE / "pass_01/omp_glm53_flash_max"
                if mutation == "profile": value = P.load_json(directory / "omp_preflight.json"); value["profile_dir"] = prior2["profile_dir"]; P.atomic_write(directory / "omp_preflight.json", P.pretty_json(value))
                else: value = P.load_json(directory / "terminal.json"); value["formal_chain"]["records"]["normalized_projection.json"]["sha256"] = "0" * 64; P.atomic_write(directory / "terminal.json", P.pretty_json(value))
                with C.installed(), C.selected(prior2): rejects(lambda: C.verify_next_row_in_matrix_context(prior2), f"tampered prior {mutation} rejects full matrix prefix")
        with tempfile.TemporaryDirectory(prefix="r10-v5-prior-private-") as temporary:
            private = Path(temporary) / "private"; shutil.copytree(prior1["private_capture_dir"], private); target = private / "rr-session-2.res.log"; P.atomic_write(target, target.read_bytes() + b"X")
            changed = copy.deepcopy(F.rows()); changed[0]["private_capture_dir"] = str(private); C.EVIDENCE, C.rows = F.EVIDENCE, lambda: changed
            with C.installed(), C.selected(changed[1]): rejects(lambda: C.verify_next_row_in_matrix_context(changed[1]), "tampered prior private HTTP rejects full matrix prefix", "private raw hash/projection join", C.G.PermanentCanaryError)
    finally: C.EVIDENCE, C.rows, C.route_map, C.launch_plan_map, C.git_custody, C.verify_omp_receipt, C.V.verify_row = held
def mixed_context_and_event_order_tests() -> None:
    held = C.EVIDENCE, C.git_custody, C.V.verify_row, C.verify_omp_receipt, C.M.verify_app_launch, C.verify_issued, C.verify_issued_journal, C.app_verify_direct, C.M.mixed_journal, C.V.verify_launch_journal, C.V.verify_evidence_tree, C.V.verify_global_uniqueness
    frozen, seen = C.rows(), []
    with tempfile.TemporaryDirectory(prefix="r10-v5-mixed-prefix-") as temporary:
        C.EVIDENCE = Path(temporary) / "evidence"; C.EVIDENCE.mkdir(); P.atomic_write(C.EVIDENCE / "launch_journal.jsonl", P.jsonl_bytes([{key: row[key] for key in C.IDENTITY} for row in frozen[:6]])); (C.row_dir(frozen[5])).mkdir(parents=True); P.atomic_write(C.row_dir(frozen[5]) / "terminal.json", P.pretty_json({"status":"PASS"})); C.git_custody = lambda: {}
        C.V.verify_row = lambda _pass, _route: (seen.append(("row", C.selected_row()["ordinal"])), {"status":"PASS", "ordinal":C.selected_row()["ordinal"]})[1]
        C.verify_omp_receipt = lambda row, _custody: seen.append(("omp", C.selected_row()["ordinal"], row["ordinal"])); C.M.verify_app_launch = lambda row, _custody: {"row":row}; C.verify_issued = lambda _directory, row, _custody: {"record":{"row":row["ordinal"]}}
        C.verify_issued_journal = lambda _journal, row, _issued: seen.append(("issued", C.selected_row()["ordinal"], row["ordinal"])); C.app_verify_direct = lambda *_args: seen.append(("app", C.selected_row()["ordinal"])); C.M.mixed_journal = lambda *_args: None; C.V.verify_launch_journal = C.V.verify_evidence_tree = C.V.verify_global_uniqueness = lambda *_args: None
        try:
            with C.selected(frozen[6]): report = C.verify_prefix(); check(C.selected_row()["ordinal"] == 7, "mixed prefix restores selected Codex current row")
            check(report["row_count"] == 6 and [item[1] for item in seen if item[0] == "row"] == list(range(1, 7)) and len([item for item in seen if item[0] == "omp"]) == 5 and seen[-1] == ("app", 6), "mixed OMP/Codex prefix uses each prior selected context")
        finally: C.EVIDENCE, C.git_custody, C.V.verify_row, C.verify_omp_receipt, C.M.verify_app_launch, C.verify_issued, C.verify_issued_journal, C.app_verify_direct, C.M.mixed_journal, C.V.verify_launch_journal, C.V.verify_evidence_tree, C.V.verify_global_uniqueness = held
    held = C.EVIDENCE, C.validate_static, C.verify_prefix, C.require_launch_authority, C.git_custody, C.G.current_runtime_preflight, C.G.PROMPT_READY_RUN_ROW, C.M.claim_after_failure
    events, row1, row2 = [], frozen[0], frozen[1]
    with tempfile.TemporaryDirectory(prefix="r10-v5-event-order-") as temporary:
        C.EVIDENCE = Path(temporary) / "evidence"; C.EVIDENCE.mkdir(); P.atomic_write(C.EVIDENCE / "launch_journal.jsonl", P.jsonl_bytes([{key: row1[key] for key in C.IDENTITY}]))
        def prefix() -> dict:
            if C.CURRENT_ROW is None: events.append("outer_prefix")
            else:
                events.append("inner_prefix")
                with C.selected(row1): events.extend(("prior_selected", "prior_formal_http")); check(C.G.rows()[0]["ordinal"] == 1, "inner prior G.rows")
            return {"row_count":1}
        def run(*_args: object) -> dict:
            C.base.verify_next_row(C.planned_row(row2["pass_id"], row2["route_id"])); events.append("reservation"); check(C.G.rows()[0]["ordinal"] == 2 and C.G.PROXY.load_json(C.V7 / "runtime_manifest.json")["omp"]["profile_dir"] == row2["profile_dir"], "row2 Popen sentinel uses row2 profile"); events.append("Popen"); raise C.MatrixError("zero-subject sentinel")
        C.validate_static = lambda **_kwargs: {"status":"TEST"}; C.verify_prefix = prefix; C.require_launch_authority = lambda _row: None; C.git_custody = lambda: {}; C.G.current_runtime_preflight = lambda: (events.append("live_runtime"), {"status":"PASS_OMP_RUNTIME_18_0_7","subject_calls":0})[1]; C.G.PROMPT_READY_RUN_ROW = run; C.M.claim_after_failure = lambda *_args: False
        try:
            with contextlib.redirect_stdout(io.StringIO()) as output: rc = C.dispatch(["run-omp","2","--max-seconds","3600"])
            check(rc == 1 and "FAIL_PRELAUNCH_NO_MUTATION" in output.getvalue() and events == ["outer_prefix","live_runtime","inner_prefix","prior_selected","prior_formal_http","reservation","Popen"], "outer prefix then runtime then inner exact prefix then reservation/Popen")
        finally: C.EVIDENCE, C.validate_static, C.verify_prefix, C.require_launch_authority, C.git_custody, C.G.current_runtime_preflight, C.G.PROMPT_READY_RUN_ROW, C.M.claim_after_failure = held
def issuance_fixture(root: Path, row: dict, custody: dict) -> Path:
    C.EVIDENCE = root / "evidence"; directory = C.row_dir(row)
    launch = C.M.app.reserve(directory, row, (C.V7 / "prompts/codex.prompt.txt").read_text(), P, lambda: "2026-08-26T00:00:00.000Z")
    launch["git_custody"] = custody; P.atomic_write(directory / "launch.json", P.pretty_json(launch)); return directory
def complete_app_fixture(directory: Path, row: dict, custody: dict) -> None:
    fixture, lane = codex_fixture_module(), C.M.app
    prompt, route = (C.V7 / "prompts/codex.prompt.txt").read_text(), C.route_map()[row["route_id"]]; session = "01a09999-1111-7222-8333-444455556666"; create = {"threadId": session, "projectlessOutputDirectory": f"C:\\Codex\\{row['projectless_directory_name']}\\outputs", "hostId": "windows-local"}
    def capture(tool: str, request: dict, result: dict, name: str) -> None:
        envelope = {"schema_id": "pm.r10.storage_pipeline.codex_app_host_receipt.v1", "tool": tool, "request": request, "result": result}; C.M.capture_host_receipt(directory, directory / name, (P.canonical_json(envelope) + "\n").encode(), tool, request)
    request = lane.create_request(row, prompt); capture("create_thread", request, create, "create_receipt.raw.json")
    original_journal = C.base.journal_rows; C.base.journal_rows = lambda: [{"ordinal": number} for number in range(1, row["ordinal"])]
    try: 
        with C.installed(): C.app_append_journal(row, directory)
    finally: C.base.journal_rows = original_journal
    journal, issued = P.load_jsonl(C.EVIDENCE / "launch_journal.jsonl"), C.verify_issued(directory, row, custody); C.verify_issued_journal(journal, row, issued); check(True, "issuance journal join")
    bad_journal = copy.deepcopy(journal); bad_journal[-1]["create_request_issued"]["sha256"] = "0" * 64; rejects(lambda: C.verify_issued_journal(bad_journal, row, issued), "issuance journal mutation")
    wait = lane.wait_request(create, [], 120000); capture("wait_threads", wait, fixture.wait_fixture(create), "wait_001.raw.json")
    read = lane.read_request(create, C.spec()); capture("read_thread", read, fixture.read_fixture(row, create), "read_receipt.raw.json")
    raw_request = lane.raw_request(row, create); P.atomic_write(directory / "raw_copy_request.json", P.pretty_json(raw_request)); content = P.jsonl_bytes(fixture.synthetic_raw(route, session, row["projectless_directory_name"]))
    for ordinal, observed in ((1, "2026-08-27T00:00:01.000Z"), (2, "2026-08-27T00:00:02.000Z")):
        receipt = fixture.raw_copy_bytes(row, create, ordinal, content, observed); P.atomic_write(directory / f"raw_copy_{ordinal}.receipt.json", receipt); P.atomic_write(directory / f"rollout.read{ordinal}.jsonl", content)
    P.atomic_write(directory / "rollout.raw.jsonl", content)
    terminal = C.app_write_terminal(directory, row, route, P, status="PASS", final=exact_final(), identity=session)
    V.verify_evidence_hashes(directory, terminal)
    projection = C.app_verify_direct(directory, row, prompt, C.spec(), P, V, P.load_json(directory / "launch.json"), terminal)
    check(terminal["create_request_issued"] in terminal["evidence"] and projection["session_id"] == session, "issuance direct/terminal join")
def app_issuance_tests() -> None:
    row, other = C.rows()[5], C.rows()[6]
    commit = "a" * 40
    custody = {"candidate_commit": commit, "head": commit, "origin_main": commit, "truenas_backup_main": commit, "sources": [], "dependencies": []}
    original_evidence, original_custody, original_atomic = C.EVIDENCE, C.git_custody, P.atomic_write
    C.git_custody = lambda: custody
    try:
        with tempfile.TemporaryDirectory(prefix="r10-app-issuance-") as temporary:
            directory = issuance_fixture(Path(temporary), row, custody)
            request = C.issue_create(directory, row, custody)
            issued = C.verify_issued(directory, row, custody)
            marker_bytes = (directory / C.ISSUED).read_bytes()
            check(request == C.M.app.create_request(row, (C.V7 / "prompts/codex.prompt.txt").read_text()) and issued["record"] == C.file_record(directory / C.ISSUED, directory), "atomic issuance positive")
            rejects(lambda: C.atomic_issue(directory / C.ISSUED, b"replacement"), "atomic no-replace issuance")
            check((directory / C.ISSUED).read_bytes() == marker_bytes and not list(directory.glob(f".{C.ISSUED}.*.tmp")), "atomic issuance immutable")
            for field, value in (("request_sha256", "0" * 64), ("attempt_id", "wrong"), ("request", {}), ("git_custody", {"head": "wrong"}), ("issued_at_utc", "2020-01-01T00:00:00.000Z")):
                mutation = P.load_json(directory / C.ISSUED); mutation[field] = value; P.atomic_write(directory / C.ISSUED, P.pretty_json(mutation))
                rejects(lambda: C.verify_issued(directory, row, custody), f"issuance mismatch {field}")
                P.atomic_write(directory / C.ISSUED, marker_bytes)
            launch = P.load_json(directory / "launch.json"); saved_launch = P.pretty_json(launch); launch["create_request_issued"]["sha256"] = "0" * 64; P.atomic_write(directory / "launch.json", P.pretty_json(launch))
            rejects(lambda: C.verify_issued(directory, row, custody), "issuance launch hash mismatch")
            P.atomic_write(directory / "launch.json", saved_launch)
            second = issuance_fixture(Path(temporary), other, custody); P.atomic_write(second / C.ISSUED, marker_bytes)
            mixed_launch = P.load_json(second / "launch.json"); mixed_launch["create_request_issued"] = C.file_record(second / C.ISSUED, second); P.atomic_write(second / "launch.json", P.pretty_json(mixed_launch))
            rejects(lambda: C.verify_issued(second, other, custody), "cross-row issuance replay")
            before = (directory / C.ISSUED).read_bytes()
            try:
                C.issue_create(directory, row, custody)
            except C.AlreadyIssuedNoMutation as exc:
                check(str(exc) == "ALREADY_ISSUED_NO_MUTATION", "second create is silent no-mutation collision")
            else:
                raise RuntimeError("second create request accepted")
            check((directory / C.ISSUED).read_bytes() == before and not (directory / "terminal.json").exists() and not (directory / "runner_failure.json").exists() and not (directory / "create_receipt.raw.json").exists() and not (directory / "host_events.jsonl").exists(), "repeat issuance no mutation or App call")
        def race(directory: Path, concurrent_terminal: bool) -> tuple[list[str], list[str]]:
            original_link, barrier = C.os.link, threading.Barrier(2)
            won, release, emissions, outcomes = threading.Event(), threading.Event(), [], []
            def gated_link(*args: object, **kwargs: object) -> object:
                barrier.wait(timeout=5); return original_link(*args, **kwargs)  # type: ignore[arg-type]
            def issuer() -> None:
                try:
                    C.issue_create(directory, row, custody); won.set()
                    if concurrent_terminal: release.wait(timeout=5)
                    emissions.append(C.emittable_create(directory, row, custody)); outcomes.append("winner")
                except C.AlreadyIssuedNoMutation:
                    outcomes.append("silent")
                except Exception as exc:
                    outcomes.append(f"error:{type(exc).__name__}:{exc}")
            C.os.link = gated_link
            threads = [threading.Thread(target=issuer) for _ in range(2)]
            try:
                for thread in threads: thread.start()
                if concurrent_terminal:
                    check(won.wait(timeout=5), "concurrent issuer won marker")
                    P.atomic_write(directory / "terminal.json", P.pretty_json({"status": "CONCURRENT_TERMINAL"})); release.set()
                for thread in threads: thread.join(timeout=5)
            finally:
                release.set(); C.os.link = original_link
            check(not any(thread.is_alive() for thread in threads) and not any(item.startswith("error:") for item in outcomes), f"two issuer race completed {concurrent_terminal}")
            return emissions, outcomes
        for concurrent_terminal in (False, True):
            with tempfile.TemporaryDirectory(prefix="r10-app-issuance-race-") as temporary:
                directory = issuance_fixture(Path(temporary), row, custody)
                emissions, outcomes = race(directory, concurrent_terminal)
                check(outcomes.count("silent") == (2 if concurrent_terminal else 1) and outcomes.count("winner") == (0 if concurrent_terminal else 1) and len(emissions) == (0 if concurrent_terminal else 1) and len(emissions) <= 1, f"two issuer single emission {concurrent_terminal}")
                check((directory / C.ISSUED).is_file() and not (directory / "runner_failure.json").exists() and ((directory / "terminal.json").exists() is concurrent_terminal), f"two issuer custody {concurrent_terminal}")
        for partial in (False, True):
            with tempfile.TemporaryDirectory(prefix="r10-app-issuance-write-") as temporary:
                directory = issuance_fixture(Path(temporary), row, custody)
                def fail_write(path: Path, raw: bytes) -> None:
                    if path.name.startswith(f".{C.ISSUED}."):
                        if partial: original_atomic(path, b"{")
                        raise OSError("issuance write failure")
                    original_atomic(path, raw)
                P.atomic_write = fail_write
                try:
                    C.issue_create(directory, row, custody)
                except Exception as exc:
                    P.atomic_write = original_atomic
                    with C.installed(), C.selected(row): C.M.fail_app(row, exc)
                else:
                    raise RuntimeError("issuance write failure accepted")
                terminal = P.load_json(directory / "terminal.json")
                marker, temporaries = directory / C.ISSUED, list(directory.glob(f".{C.ISSUED}.*.tmp"))
                check(terminal["status"] == "FAIL" and not (directory / "create_receipt.raw.json").exists() and not os.path.lexists(marker) and (len(temporaries) == 1 and temporaries[0].read_bytes() == b"{") is partial, f"issuance write failure consumed {partial}")
        with tempfile.TemporaryDirectory(prefix="r10-app-issuance-dispatch-") as temporary:
            directory = issuance_fixture(Path(temporary), row, custody)
            held = C.validate_static, C.require_launch_authority, C.M.verify_app_launch, C.M.app_budget
            C.validate_static = lambda **_kwargs: {"status": "TEST"}; C.require_launch_authority = lambda _row: None
            C.M.verify_app_launch = lambda _row, _custody: P.load_json(directory / "launch.json"); C.M.app_budget = lambda _directory: None
            try:
                first, second = io.StringIO(), io.StringIO()
                with contextlib.redirect_stdout(first): first_rc = C.dispatch(["codex-create-request", "6"])
                marker_before = (directory / C.ISSUED).read_bytes()
                with contextlib.redirect_stdout(second): second_rc = C.dispatch(["codex-create-request", "6"])
                check(first_rc == 0 and P.strict_loads(first.getvalue())["prompt"].startswith("Create a goal that") and second_rc == 2 and second.getvalue() == "" and (directory / C.ISSUED).read_bytes() == marker_before and not (directory / "terminal.json").exists() and not (directory / "runner_failure.json").exists() and not (directory / "host_events.jsonl").exists(), "dispatch loser is silent no-mutation")
            finally:
                C.validate_static, C.require_launch_authority, C.M.verify_app_launch, C.M.app_budget = held
        for failure in ("partial_join", "output"):
            with tempfile.TemporaryDirectory(prefix="r10-app-issuance-owner-") as temporary:
                directory = issuance_fixture(Path(temporary), row, custody)
                held = C.validate_static, C.require_launch_authority, C.M.verify_app_launch, C.M.app_budget
                C.validate_static = lambda **_kwargs: {"status": "TEST"}; C.require_launch_authority = lambda _row: None
                C.M.verify_app_launch = lambda _row, _custody: P.load_json(directory / "launch.json"); C.M.app_budget = lambda _directory: None
                if failure == "partial_join":
                    def fail_join(path: Path, raw: bytes) -> None:
                        if path == directory / "launch.json" and os.path.lexists(directory / C.ISSUED):
                            P.atomic_write = original_atomic; original_atomic(path, b"{"); raise OSError("partial issuance join")
                        original_atomic(path, raw)
                    P.atomic_write = fail_join
                output = type("BrokenOutput", (io.StringIO,), {"write": lambda *_args: (_ for _ in ()).throw(BrokenPipeError("issuance output"))})() if failure == "output" else io.StringIO()
                try:
                    with contextlib.redirect_stdout(output): rc = C.dispatch(["codex-create-request", "6"])
                finally:
                    P.atomic_write = original_atomic; C.validate_static, C.require_launch_authority, C.M.verify_app_launch, C.M.app_budget = held
                terminal = P.load_json(directory / "terminal.json")
                check(rc == 1 and terminal["status"] == "FAIL" and terminal["create_request_issued"] in terminal["evidence"] and terminal["external_submission_count"] == 0 and not (directory / "host_events.jsonl").exists(), f"winning issuer {failure} terminalized")
        with tempfile.TemporaryDirectory(prefix="r10-app-reserve-output-") as temporary:
            C.EVIDENCE = Path(temporary) / "evidence"; held = C.validate_static, C.require_launch_authority, C.verify_prefix
            C.validate_static = lambda **_kwargs: {"status": "TEST"}; C.require_launch_authority = lambda _row: None; C.verify_prefix = lambda: {"row_count": 5}
            try:
                output = io.StringIO()
                with contextlib.redirect_stdout(output): rc = C.dispatch(["codex-reserve", "6"])
                value = P.strict_loads(output.getvalue()); directory = C.row_dir(row)
                check(rc == 0 and value["status"] == "RESERVED_CONSUMED_AWAIT_CREATE" and "prompt" not in output.getvalue() and "create_request" not in output.getvalue() and not os.path.lexists(directory / C.ISSUED), "reservation emits no create request")
            finally:
                C.validate_static, C.require_launch_authority, C.verify_prefix = held
        with tempfile.TemporaryDirectory(prefix="r10-app-issuance-direct-") as temporary:
            directory = issuance_fixture(Path(temporary), row, custody); original_now = C.base.utc_now; C.base.utc_now = lambda: "2026-08-27T00:00:00.000Z"
            try: C.issue_create(directory, row, custody)
            finally: C.base.utc_now = original_now
            complete_app_fixture(directory, row, custody)
    finally:
        P.atomic_write = original_atomic
        C.EVIDENCE, C.git_custody = original_evidence, original_custody
def main() -> int:
    static = C.validate_static(); check(static["status"] == "PASS_LOCAL_NORMALIZED_MATRIX_V5_PRELAUNCH" and static["rows"] == 24 and static["subject_calls"] == 0, "static lint")
    prefix = C.verify_prefix(); check(prefix == {"status": "PASS_EXACT_PREFIX_ZERO_CREDIT", "row_count": 0, "required_rows": 24, "qualification_credit": 0, "subject_calls": 0}, "empty prefix")
    frozen, routes = C.rows(), list(C.route_map().values())
    expected = ["omp_glm53_flash_max", "omp_cursor_default_auto", "omp_muse_spark_xhigh", "omp_deepseek_v4_flash_max", "omp_gemini_37_flash_high", "codex_luna_max", "codex_luna_medium", "codex_gpt54_xhigh", "codex_gpt54_medium", "codex_gpt54mini_xhigh", "codex_gpt54mini_medium", "omp_qwen38_max_xhigh"]
    check([route["id"] for route in routes] == expected and [row["route_id"] for row in frozen[:12]] == expected == [row["route_id"] for row in frozen[12:]], "route order twice")
    check(len({row["attempt_id"] for row in frozen}) == len({row["nonce"] for row in frozen}) == 24, "fresh identities")
    check(all(row["prompt_utf8_bytes"] == (3036 if row["surface"] == "omp_tui" else 3050) for row in frozen), "prompt metrics")
    check(C.next_row(1, 0)["route_id"] == "omp_glm53_flash_max" and C.next_row(24, 23)["route_id"] == "omp_qwen38_max_xhigh", "ordinal endpoints")
    rejects(lambda: C.next_row(2, 0), "suffix gate")
    rejects(lambda: C.next_row(13, 11), "pass two gate")
    before = [(module, name, getattr(module, name)) for module, name, _value in C.bindings()]
    with C.installed():
        check(C.base.EVIDENCE == C.EVIDENCE and C.V.EVIDENCE == C.EVIDENCE and C.M.app.write_terminal is C.app_write_terminal and C.G.session_health is C.session_health and C.G.NORMALIZE is C.N.normalize_verified_session, "bindings installed")
    check(all(getattr(module, name) is value for module, name, value in before), "bindings restored")
    session_health_tests(); preservation_order_test(); runtime_pre_reservation_tests(); matrix_context_prefix_tests(); mixed_context_and_event_order_tests()
    canonical = exact_final(); prose = "Analysis complete.\n" + canonical + "\nSurrounding prose is not authoritative."; normalized = normalize_codex_text(prose)
    check(normalized["final_text"] == canonical and normalized["result_normalization"]["candidate_count"] == 1, "Codex prose normalization")
    reordered = reordered_final(); check(P.strict_loads(reordered[len(P.RESULT_PREFIX):]) == P.strict_loads(canonical[len(P.RESULT_PREFIX):]), "reordered fixture same values and types")
    check(not C.N.typed_equal({"a": {"x": 1, "y": [2, 3]}}, {"a": {"y": [2, 3], "x": 1}}) and C.N.typed_equal({"a": {"x": 1, "y": [2, 3]}}, {"a": {"x": 1, "y": [2, 3]}}) and not C.N.typed_equal({"a": [2, 3]}, {"a": [3, 2]}), "recursive dict sequence and exact list order")
    rejects(lambda: normalize_codex_text(reordered), "Codex top-level key sequence is authoritative", "differs from frozen oracle", C.N.NormalizationError)
    rejects(lambda: normalize_omp_candidate(reordered), "OMP top-level key sequence is authoritative", "differs from frozen oracle", C.N.NormalizationError)
    spaced = inline_whitespace_final(); spaced_codex, spaced_omp = normalize_codex_text(spaced), normalize_omp_candidate(spaced)
    check(spaced != canonical and spaced_codex["final_text"] == spaced_omp["final_text"] == canonical, "same-order inline whitespace canonicalizes on OMP and Codex")
    duplicate = normalize_codex_text(canonical + "\n" + canonical); check(duplicate["result_normalization"]["candidate_count"] == 2 and duplicate["final_text"] == canonical, "Codex identical duplicates")
    wrong = canonical.replace('"plan_unit_count":248', '"plan_unit_count":249')
    rejects(lambda: normalize_codex_text(canonical, earlier=(wrong,)), "earlier wrong typed candidate")
    rejects(lambda: normalize_codex_text(canonical, earlier=("PM_RESULT: {}",)), "earlier malformed marker candidate")
    earlier_duplicate = normalize_codex_text(canonical, earlier=(canonical,)); check(earlier_duplicate["assistant_message_count"] == 2 and [item["assistant_ordinal"] for item in earlier_duplicate["result_normalization"]["candidates"]] == [1, 2] and earlier_duplicate["final_text"] == canonical, "Codex identical earlier and final candidates")
    earlier_prose = normalize_codex_text(canonical, earlier=("Bounded commentary without a typed candidate.",)); check(earlier_prose["assistant_message_count"] == 2 and earlier_prose["result_normalization"]["candidate_count"] == 1, "Codex earlier commentary prose")
    rejects(lambda: normalize_codex_text(canonical, after=("late assistant text",)), "assistant after Codex final", "last assistant terminal")
    rejects(lambda: normalize_codex_text("No typed result"), "missing candidate")
    rejects(lambda: normalize_codex_text("PM_RESULT: {}"), "marker delimiter")
    rejects(lambda: normalize_codex_text(canonical + "\nPM_RESULT {}"), "conflicting or invalid candidate")
    rejects(lambda: normalize_codex_text(wrong), "wrong typed value")
    v6 = C.V6 / "evidence/pass_01/omp_glm53_flash_max"; before = (P.sha256_file(v6 / "session.raw.jsonl"), P.sha256_file(v6 / "terminal.json")); glm = replay_omp(v6); oracle_keys = tuple(P.load_json(C.V7 / "oracle.json"))
    check(glm["result_normalization"]["candidate_count"] == 2 and glm["final_text"] == canonical and all(tuple(P.strict_loads(item["raw_line"][len(P.RESULT_PREFIX):])) == oracle_keys for item in glm["result_normalization"]["candidates"]) and before == (P.sha256_file(v6 / "session.raw.jsonl"), P.sha256_file(v6 / "terminal.json")), "real V6 exact-order GLM replay without evidence mutation")
    cursor = replay_omp(C.V7 / "evidence/pass_01/omp_cursor_default_auto"); check(cursor["result_normalization"]["candidate_count"] == 1 and cursor["final_text"] == canonical, "real Cursor replay")
    app_row = frozen[5]
    with tempfile.TemporaryDirectory(prefix="r10-codex-structural-") as temporary:
        directory = Path(temporary); fixture = codex_fixture_module(); raw = fixture.synthetic_raw(C.route_map()[app_row["route_id"]], "01a09999-1111-7222-8333-444455556666", app_row["projectless_directory_name"]); P.atomic_write(directory / "rollout.raw.jsonl", P.jsonl_bytes(raw))
        with C.installed(), C.selected(app_row):
            projection = C.M.app.raw_projection(directory / "rollout.raw.jsonl", C.route_map()[app_row["route_id"]], (C.V7 / "prompts/codex.prompt.txt").read_text(), "01a09999-1111-7222-8333-444455556666", app_row["projectless_directory_name"], V, {"external_prompt_count": 1}, {"final_assistant_text": exact_final()})
        check(projection["ordinary_tool_calls"] == 0 and projection["external_prompt_count"] == 1, "Codex Goal structural fixture")
    app_issuance_tests()
    C.require_launch_authority(frozen[0]); C.require_launch_authority(frozen[5]); check(True, "exact OMP and App authority active")
    original_spec = C.spec
    closed_false = ("retry_replacement_or_reuse_authorized", "extra_routes_or_rows_authorized", "followups_or_choreography_authorized", "worknodes_authorized", "plans_or_ledgers_authorized", "windows_interaction_authorized", "assistant_chat_authorized", "config_drift_authorized", "unpushed_or_unfrozen_sources_authorized", "retro_credit_authorized")
    try:
        for field in closed_false:
            mutated = copy.deepcopy(original_spec()); mutated["authority"][field] = True
            C.spec = lambda value=mutated: value
            rejects(lambda: C.require_launch_authority(frozen[0]), f"authority cannot widen {field}", "closed explicit matrix authority")
        for mutation in ("runtime_launch_authorized", "provider_calls_authorized", "codex_app_creation_authorized"):
            mutated = copy.deepcopy(original_spec()); mutated["authority"][mutation] = False
            C.spec = lambda value=mutated: value
            rejects(lambda row=frozen[5] if mutation == "codex_app_creation_authorized" else frozen[0]: C.require_launch_authority(row), f"required authority {mutation}")
        for path, value in ((["authorized_attempt_ids"], [*original_spec()["authority"]["authorized_attempt_ids"], "extra"]), (["user_directions", 0, "exact_text"], "widened")):
            mutated = copy.deepcopy(original_spec()); target = mutated["authority"]
            for key in path[:-1]: target = target[key]
            target[path[-1]] = value; C.spec = lambda item=mutated: item
            rejects(lambda: C.require_launch_authority(frozen[0]), f"authority provenance mutation {path[-1]}")
        mutated = copy.deepcopy(original_spec()); mutated["canary_authority"]["push_custody_record"]["sha256"] = "0" * 64; C.spec = lambda item=mutated: item
        rejects(C.verify_pinned_canary, "pinned canary custody mutation")
        original_pinned = C.pinned_record
        def drifted_pinned(commit: str, relative: str) -> tuple[dict, bytes]:
            record, raw = original_pinned(commit, relative)
            if relative.endswith("normalized_projection.json"): record = {**record, "sha256":"0" * 64}
            return record, raw
        C.spec = original_spec; C.pinned_record = drifted_pinned
        try: rejects(C.verify_pinned_canary, "pinned Git blob mutation rejects")
        finally: C.pinned_record = original_pinned
        mutated = copy.deepcopy(original_spec()); mutated["authority"]["extra_routes_or_rows_authorized"] = True; mutated["authority_canonical_sha256"] = P.sha256_bytes(P.canonical_json(mutated["authority"]).encode()); C.spec = lambda item=mutated: item
        rejects(lambda: C.require_launch_authority(frozen[0]), "authority cannot self-authorize by recomputing contract digest", "closed explicit matrix authority")
    finally:
        C.spec = original_spec
    imported_runner_sentinel(frozen[0])
    imported_runner_sentinel(frozen[1])
    for field, value in (("cwd", f"/tmp/pm-r10-storage-v7-normalized-matrix-v2-cwd-{frozen[0]['nonce']}"), ("session_dir", f"/tmp/pm-r10-storage-v7-session-normalized-matrix-v2-{frozen[0]['nonce']}")):
        bad, sentinel = copy.deepcopy(frozen[0]), []
        bad[field] = value
        rejects(lambda row=bad: (C.validate_omp_paths(row), sentinel.append(True)), f"old {field} rejected before imported runner sentinel")
        check(not sentinel, f"old {field} no sentinel")
    calls = []
    original, original_custody = C.G.ORIGINAL_POPEN, C.git_custody
    C.G.ORIGINAL_POPEN = lambda *_args, **_kwargs: calls.append(True)  # type: ignore[assignment]
    C.git_custody = lambda: (_ for _ in ()).throw(C.MatrixError("dry unpushed custody stop"))
    try:
        with contextlib.redirect_stdout(io.StringIO()) as output:
            rc = C.dispatch(["run-omp", "1", "--max-seconds", "3600"])
        check(rc == 1 and not calls and "FAIL_PRELAUNCH_NO_MUTATION" in output.getvalue() and "dry unpushed custody stop" in output.getvalue(), "authorized OMP dry custody no-Popen")
        check(not os.path.lexists(C.EVIDENCE) and not any(os.path.lexists(path) for path in C.runtime_paths(frozen[0])), "dry custody failure no mutation")
        with contextlib.redirect_stdout(io.StringIO()) as output:
            rc = C.dispatch(["codex-create-request", "6"])
        check(rc == 1 and "FAIL_PRELAUNCH_NO_MUTATION" in output.getvalue() and "dry unpushed custody stop" in output.getvalue() and not os.path.lexists(C.EVIDENCE), "authorized App dry custody no reservation")
    finally:
        C.G.ORIGINAL_POPEN = original
        C.git_custody = original_custody
    check(P.verify()["status"] == "PASS_VERIFIED_NO_WORKNODES", "no WorkNodes")
    check(not list(C.HERE.rglob("*.pyc")) and not list(C.HERE.rglob("__pycache__")), "no cache")
    print(P.canonical_json({"status": "PASS_ZERO_SUBJECT_SELFTEST", "checks": len(CHECKS), "subject_calls": 0, "qualification_credit": 0}))
    return 0
if __name__ == "__main__":
    raise SystemExit(main())
