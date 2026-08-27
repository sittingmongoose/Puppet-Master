#!/usr/bin/env python3
"""Zero-subject regression suite for the thin normalized matrix adapter."""
from __future__ import annotations
import contextlib
import copy
import importlib.util
import io
import os
import shutil
import tempfile
import threading
from pathlib import Path
import controller as C
P, V = C.P, C.V
CHECKS: list[str] = []
def check(value: bool, name: str) -> None:
    if not value:
        raise RuntimeError(name)
    CHECKS.append(name)
def rejects(function: object, name: str, contains: str = "") -> None:
    try:
        function()  # type: ignore[operator]
    except Exception as exc:
        check(not contains or contains in str(exc), name)
        return
    raise RuntimeError(f"accepted mutation: {name}")
def exact_final() -> str:
    return P.RESULT_PREFIX + (C.V7 / "oracle.json").read_text().strip()
def codex_fixture_module() -> object:
    path = C.V2 / "selftest.py"
    spec = importlib.util.spec_from_file_location("normalized_matrix_v2_fixture_source", path)
    if spec is None or spec.loader is None:
        raise RuntimeError("V2 fixture unavailable")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module
def normalize_codex_text(text: str, *, earlier: tuple[str, ...] = (), after: tuple[str, ...] = ()) -> dict:
    row = C.rows()[5]
    route = C.route_map()[row["route_id"]]
    fixture = codex_fixture_module()
    session = "01a09999-1111-7222-8333-444455556666"
    raw = fixture.synthetic_raw(route, session, row["projectless_directory_name"])
    raw[-1]["payload"]["content"] = [{"type": "output_text", "text": text}]
    assistant = lambda value: {"type": "response_item", "payload": {"type": "message", "role": "assistant", "phase": "commentary", "content": [{"type": "output_text", "text": value}]}}
    raw = [*raw[:5], *(assistant(value) for value in earlier), *raw[5:], *(assistant(value) for value in after)]
    raw = [{"ordinal": index, **{key: value for key, value in item.items() if key != "ordinal"}} for index, item in enumerate(raw)]
    with tempfile.TemporaryDirectory(prefix="r10-normalized-app-") as temporary:
        path = Path(temporary) / "rollout.raw.jsonl"
        P.atomic_write(path, P.jsonl_bytes(raw))
        launch = {"external_prompt_count": 1}
        P.atomic_write(path.parent / "launch.json", P.pretty_json(launch))
        with C.installed(), C.selected(row):
            return C.verify_codex_candidate(path.parent, row, {"threadId": session}, (C.V7 / "prompts/codex.prompt.txt").read_text(), text)
def replay_omp(directory: Path) -> dict:
    launch = P.load_json(directory / "launch.json")
    prompt = (C.V7 / "prompts/omp.prompt.txt").read_bytes()
    objective = prompt[len(b"/goal "):].decode()
    structural = C.G.ORIGINAL_SESSION(directory / "session.raw.jsonl", expected_cwd=launch["cwd"], expected_objective=objective, expected_provider=launch["model"].split("/", 1)[0], expected_model=launch["model"].split("/", 1)[1], expected_selector=launch["model"], expected_thinking=launch["thinking"], require_exit=True)
    return C.N.normalize_verified_session(directory / "session.raw.jsonl", structural, oracle_path=C.V7 / "oracle.json", schema_path=C.V7 / "response.schema.json", max_text_block_utf8_bytes=P.load_json(C.V7 / "matrix.json")["max_final_assistant_utf8_bytes"])
class PopenSentinel(RuntimeError): pass
def imported_runner_sentinel(row: dict) -> None:
    original_evidence, original_custody, original_popen = C.EVIDENCE, C.git_custody, C.G.ORIGINAL_POPEN
    custody, calls = {"candidate_commit": "a" * 40}, []
    with tempfile.TemporaryDirectory(prefix="r10-v2-runner-sentinel-") as temporary:
        C.EVIDENCE = Path(temporary) / "evidence"; C.git_custody = lambda: custody
        def popen(*_args: object, **_kwargs: object) -> None:
            calls.append(row["route_id"]); raise PopenSentinel("zero-subject Popen sentinel")
        def preflight(path: Path, planned: dict, _route: dict) -> dict:
            C.validate_omp_paths(planned); receipt = {"status": "ZERO_SUBJECT_PREFLIGHT_STUB"}; P.atomic_write(path / "omp_preflight.json", P.pretty_json(receipt)); return receipt
        C.G.ORIGINAL_POPEN = popen
        try:
            with C.installed(), C.selected(row):
                prior_next = C.base.verify_next_row; C.base.verify_next_row = lambda _row: []
                C.base.row_preflight = preflight; C.DISPATCH_CUSTODY = C.G.DISPATCH_CUSTODY = custody
                try: C.base.run_row(row["pass_id"], row["route_id"], 3600)
                except PopenSentinel: pass
                finally: C.base.verify_next_row = prior_next; C.DISPATCH_CUSTODY = C.G.DISPATCH_CUSTODY = None
        finally:
            C.EVIDENCE, C.git_custody, C.G.ORIGINAL_POPEN = original_evidence, original_custody, original_popen
            for path in C.runtime_paths(row): shutil.rmtree(path, ignore_errors=True)
    check(calls == [row["route_id"]], f"imported runner reached one {row['route_id']} Popen sentinel")
def issuance_fixture(root: Path, row: dict, custody: dict) -> Path:
    C.EVIDENCE = root / "evidence"
    directory = C.row_dir(row)
    launch = C.M.app.reserve(directory, row, (C.V7 / "prompts/codex.prompt.txt").read_text(), P, lambda: "2026-08-26T00:00:00.000Z")
    launch["git_custody"] = custody
    P.atomic_write(directory / "launch.json", P.pretty_json(launch))
    return directory
def complete_app_fixture(directory: Path, row: dict, custody: dict) -> None:
    fixture, lane = codex_fixture_module(), C.M.app
    prompt, route = (C.V7 / "prompts/codex.prompt.txt").read_text(), C.route_map()[row["route_id"]]
    session = "01a09999-1111-7222-8333-444455556666"
    create = {"threadId": session, "projectlessOutputDirectory": f"C:\\Codex\\{row['projectless_directory_name']}\\outputs", "hostId": "windows-local"}
    def capture(tool: str, request: dict, result: dict, name: str) -> None:
        envelope = {"schema_id": "pm.r10.storage_pipeline.codex_app_host_receipt.v1", "tool": tool, "request": request, "result": result}
        C.M.capture_host_receipt(directory, directory / name, (P.canonical_json(envelope) + "\n").encode(), tool, request)
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
    static = C.validate_static()
    check(static["status"] == "PASS_LOCAL_NORMALIZED_MATRIX_V2_PRELAUNCH" and static["rows"] == 24 and static["subject_calls"] == 0, "static lint")
    prefix = C.verify_prefix()
    check(prefix == {"status": "PASS_EXACT_PREFIX_ZERO_CREDIT", "row_count": 0, "required_rows": 24, "qualification_credit": 0, "subject_calls": 0}, "empty prefix")
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
        check(C.base.EVIDENCE == C.EVIDENCE and C.V.EVIDENCE == C.EVIDENCE and C.M.app.write_terminal is C.app_write_terminal, "bindings installed")
    check(all(getattr(module, name) is value for module, name, value in before), "bindings restored")
    canonical = exact_final()
    prose = "Analysis complete.\n" + canonical + "\nSurrounding prose is not authoritative."
    normalized = normalize_codex_text(prose)
    check(normalized["final_text"] == canonical and normalized["result_normalization"]["candidate_count"] == 1, "Codex prose normalization")
    duplicate = normalize_codex_text(canonical + "\n" + canonical)
    check(duplicate["result_normalization"]["candidate_count"] == 2 and duplicate["final_text"] == canonical, "Codex identical duplicates")
    wrong = canonical.replace('"plan_unit_count":248', '"plan_unit_count":249')
    rejects(lambda: normalize_codex_text(canonical, earlier=(wrong,)), "earlier wrong typed candidate")
    rejects(lambda: normalize_codex_text(canonical, earlier=("PM_RESULT: {}",)), "earlier malformed marker candidate")
    earlier_duplicate = normalize_codex_text(canonical, earlier=(canonical,))
    check(earlier_duplicate["assistant_message_count"] == 2 and [item["assistant_ordinal"] for item in earlier_duplicate["result_normalization"]["candidates"]] == [1, 2] and earlier_duplicate["final_text"] == canonical, "Codex identical earlier and final candidates")
    earlier_prose = normalize_codex_text(canonical, earlier=("Bounded commentary without a typed candidate.",))
    check(earlier_prose["assistant_message_count"] == 2 and earlier_prose["result_normalization"]["candidate_count"] == 1, "Codex earlier commentary prose")
    rejects(lambda: normalize_codex_text(canonical, after=("late assistant text",)), "assistant after Codex final", "last assistant terminal")
    rejects(lambda: normalize_codex_text("No typed result"), "missing candidate")
    rejects(lambda: normalize_codex_text("PM_RESULT: {}"), "marker delimiter")
    rejects(lambda: normalize_codex_text(canonical + "\nPM_RESULT {}"), "conflicting or invalid candidate")
    rejects(lambda: normalize_codex_text(wrong), "wrong typed value")
    glm_dir = C.V5 / "evidence/pass_01/omp_glm53_flash_max"
    glm = replay_omp(glm_dir)
    check(glm["result_normalization"]["candidate_count"] == 2 and glm["final_text"] == canonical, "real V5 GLM replay")
    cursor_dir = C.V7 / "evidence/pass_01/omp_cursor_default_auto"
    cursor = replay_omp(cursor_dir)
    check(cursor["result_normalization"]["candidate_count"] == 1 and cursor["final_text"] == canonical, "real Cursor replay")
    app_row = frozen[5]
    with tempfile.TemporaryDirectory(prefix="r10-codex-structural-") as temporary:
        directory = Path(temporary)
        fixture = codex_fixture_module()
        raw = fixture.synthetic_raw(C.route_map()[app_row["route_id"]], "01a09999-1111-7222-8333-444455556666", app_row["projectless_directory_name"])
        P.atomic_write(directory / "rollout.raw.jsonl", P.jsonl_bytes(raw))
        with C.installed(), C.selected(app_row):
            projection = C.M.app.raw_projection(directory / "rollout.raw.jsonl", C.route_map()[app_row["route_id"]], (C.V7 / "prompts/codex.prompt.txt").read_text(), "01a09999-1111-7222-8333-444455556666", app_row["projectless_directory_name"], V, {"external_prompt_count": 1}, {"final_assistant_text": exact_final()})
        check(projection["ordinary_tool_calls"] == 0 and projection["external_prompt_count"] == 1, "Codex Goal structural fixture")
    app_issuance_tests()
    C.require_launch_authority(frozen[0])
    C.require_launch_authority(frozen[5])
    check(True, "exact OMP and App authority active")
    original_spec = C.spec
    closed_false = ("retry_replacement_or_reuse_authorized", "extra_routes_or_rows_authorized", "followups_or_choreography_authorized", "worknodes_authorized", "plans_or_ledgers_authorized", "windows_interaction_authorized", "assistant_chat_authorized", "config_drift_authorized", "unpushed_or_unfrozen_sources_authorized", "retro_credit_authorized")
    try:
        for field in closed_false:
            mutated = copy.deepcopy(original_spec()); mutated["authority"][field] = True
            C.spec = lambda value=mutated: value
            rejects(lambda: C.require_launch_authority(frozen[0]), f"authority cannot widen {field}", "closed post-canary authority")
        for mutation in ("runtime_launch_authorized", "provider_calls_authorized", "codex_app_creation_authorized"):
            mutated = copy.deepcopy(original_spec()); mutated["authority"][mutation] = False
            C.spec = lambda value=mutated: value
            rejects(lambda row=frozen[5] if mutation == "codex_app_creation_authorized" else frozen[0]: C.require_launch_authority(row), f"required authority {mutation}")
        for path, value in ((["authorized_attempt_ids"], [*original_spec()["authority"]["authorized_attempt_ids"], "extra"]), (["user_directions", 0, "exact_text"], "widened"), (["v5_canary_pass", "terminal", "sha256"], "0" * 64)):
            mutated = copy.deepcopy(original_spec()); target = mutated["authority"]
            for key in path[:-1]: target = target[key]
            target[path[-1]] = value; C.spec = lambda item=mutated: item
            rejects(lambda: C.require_launch_authority(frozen[0]), f"authority provenance mutation {path[-1]}")
    finally:
        C.spec = original_spec
    imported_runner_sentinel(frozen[0])
    imported_runner_sentinel(frozen[1])
    for field, value in (("cwd", f"/tmp/pm-r10-storage-normalized-matrix-v1-cwd-{frozen[0]['nonce']}"), ("session_dir", f"/tmp/pm-r10-storage-normalized-matrix-v1-session-{frozen[0]['nonce']}")):
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
