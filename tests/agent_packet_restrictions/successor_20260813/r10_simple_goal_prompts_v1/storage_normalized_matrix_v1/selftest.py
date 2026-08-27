#!/usr/bin/env python3
"""Zero-subject regression suite for the thin normalized matrix adapter."""
from __future__ import annotations

import contextlib
import copy
import importlib.util
import io
import os
import tempfile
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


def main() -> int:
    static = C.validate_static()
    check(static["status"] == "PASS_LOCAL_NORMALIZED_MATRIX_PRELAUNCH" and static["rows"] == 24 and static["subject_calls"] == 0, "static lint")
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

    calls = []
    original = C.G.ORIGINAL_POPEN
    C.G.ORIGINAL_POPEN = lambda *_args, **_kwargs: calls.append(True)  # type: ignore[assignment]
    try:
        with contextlib.redirect_stdout(io.StringIO()) as output:
            rc = C.dispatch(["run-omp", "1", "--max-seconds", "3600"])
        check(rc == 1 and not calls and "FAIL_PRELAUNCH_NO_MUTATION" in output.getvalue(), "runtime authority no-Popen")
        check(not os.path.lexists(C.EVIDENCE) and not any(os.path.lexists(path) for path in C.runtime_paths(frozen[0])), "authority failure no mutation")
        with contextlib.redirect_stdout(io.StringIO()) as output:
            rc = C.dispatch(["codex-reserve", "6"])
        check(rc == 1 and "FAIL_PRELAUNCH_NO_MUTATION" in output.getvalue() and not os.path.lexists(C.EVIDENCE), "App authority no reservation")
        original_prefix = C.verify_prefix
        C.verify_prefix = lambda: (_ for _ in ()).throw(RuntimeError("continuation called prefix"))
        try:
            with contextlib.redirect_stdout(io.StringIO()) as output:
                rc = C.dispatch(["codex-create-request", "6"])
            check(rc == 1 and "FAIL_PRELAUNCH_NO_MUTATION" in output.getvalue(), "reserved App continuation bypasses closed-prefix verifier")
        finally:
            C.verify_prefix = original_prefix
    finally:
        C.G.ORIGINAL_POPEN = original

    check(P.verify()["status"] == "PASS_VERIFIED_NO_WORKNODES", "no WorkNodes")
    check(not list(C.HERE.rglob("*.pyc")) and not list(C.HERE.rglob("__pycache__")), "no cache")
    print(P.canonical_json({"status": "PASS_ZERO_SUBJECT_SELFTEST", "checks": len(CHECKS), "subject_calls": 0, "qualification_credit": 0}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
