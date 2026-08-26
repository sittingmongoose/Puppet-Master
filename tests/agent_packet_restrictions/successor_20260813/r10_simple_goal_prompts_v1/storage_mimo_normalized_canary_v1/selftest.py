#!/usr/bin/env python3
"""Zero-subject tests for deterministic MiMo result normalization and custody."""
from __future__ import annotations

import contextlib
import copy
import io
import json
import os
import subprocess
import tempfile
from pathlib import Path
from typing import Any, Callable

import controller

P, V, V7 = controller.P, controller.V, controller.V7
MIMO = controller.PRIOR_ROOT / "evidence/pass_01/omp_mimo_v25_free_high"
OX = V7 / "evidence/pass_01/omp_ox_alpha_free_max"
CURSOR = V7 / "evidence/pass_01/omp_cursor_default_auto"
OBJECTIVE = (V7 / "prompts/omp.prompt.txt").read_text(encoding="utf-8")[len("/goal ") :]


class TestFailure(RuntimeError):
    pass


def check(value: bool, message: str) -> None:
    if not value:
        raise TestFailure(message)


def expect(types: type[BaseException] | tuple[type[BaseException], ...], call: Callable[[], Any], message: str, fragment: str | None = None) -> None:
    try:
        call()
    except types as exc:
        check(fragment is None or fragment in str(exc), f"wrong rejection: {message}: {exc}")
        return
    raise TestFailure(f"expected rejection: {message}")


def verify(path: Path, launch: dict[str, Any], *, require_exit: bool) -> dict[str, Any]:
    selector = launch["model"]
    provider, model = selector.split("/", 1)
    return controller.verify_session(
        path,
        expected_cwd=launch["cwd"],
        expected_objective=OBJECTIVE,
        expected_provider=provider,
        expected_model=model,
        expected_selector=selector,
        expected_thinking=launch["thinking"],
        require_exit=require_exit,
    )


def fixture_checks() -> int:
    fixtures = (
        (MIMO / "postfailure_session.raw.jsonl", MIMO / "launch.json", 51501, "16260db38f0998ddbb7c18a65724dfff954dc9655d3b62cffa9bcc00c72badf1", False),
        (OX / "session.raw.jsonl", OX / "launch.json", 38353, "472f2f99e46a04d8ad62ee054f115a8c166f1abaeeeaaf14238d7bdd0ad0f304", True),
        (CURSOR / "session.raw.jsonl", CURSOR / "launch.json", 28785, "13dfc72b1d3abae8f6d1def28b0b52f294caf45e80bd858826229ca8562d2759", True),
    )
    checks = 0
    for path, launch_path, size, digest, require_exit in fixtures:
        raw = path.read_bytes()
        check(len(raw) == size and P.sha256_bytes(raw) == digest, f"fixture freeze: {path}")
        projection = verify(path, P.load_json(launch_path), require_exit=require_exit)
        result = projection["result_normalization"]
        controller.base.exact_result(projection["final_text"])
        check(result["candidate_count"] >= 1 and result["canonical_text"] == projection["final_text"] and result["result_authority"] == "deterministic_host_program_over_verified_assistant_text", "normalized canonical result")
        check(all(set(record) == {"assistant_ordinal", "entry_index", "entry_id", "message_id", "block_index", "line_index", "raw_line", "raw_line_utf8_bytes", "raw_line_sha256"} for record in result["candidates"]), "candidate provenance roster")
        check(projection["raw_last_assistant_sha256"] == P.sha256_bytes(projection["raw_last_assistant_text"].encode()), "raw last-assistant preservation")
        checks += 4
    mimo_launch = P.load_json(MIMO / "launch.json")
    expect(controller.omp_session.OmpSessionError, lambda: verify(MIMO / "postfailure_session.raw.jsonl", mimo_launch, require_exit=True), "consumed SIGTERM remains failure", "session exit")
    check(verify(MIMO / "postfailure_session.raw.jsonl", mimo_launch, require_exit=False)["result_normalization"]["candidate_count"] == 2, "consumed MiMo diagnostic normalization")
    matrix_routes = {route["id"]: route for route in P.load_json(V7 / "matrix.json")["ordered_routes"]}
    check(V.verify_row("pass_01", matrix_routes["omp_ox_alpha_free_max"])["status"] == "PASS", "full native Ox verifier replay")
    check(V.verify_row("pass_01", matrix_routes["omp_cursor_default_auto"])["status"] == "PASS", "full native Cursor verifier replay")
    return checks + 4


def mutated_session(transform: Callable[[list[dict[str, Any]], str], None]) -> tuple[tempfile.TemporaryDirectory[str], Path, dict[str, Any]]:
    source = MIMO / "postfailure_session.raw.jsonl"
    raw = source.read_bytes()
    _slot, header, entries, _full = controller.omp_session.load_physical_session(source)
    entries = copy.deepcopy(entries)
    oracle = (V7 / "oracle.json").read_text(encoding="utf-8").strip()
    for entry in entries:
        message = entry.get("message")
        if entry.get("type") != "message" or not isinstance(message, dict) or message.get("role") != "assistant":
            continue
        for block in message.get("content", []):
            if isinstance(block, dict) and block.get("type") == "text" and isinstance(block.get("text"), str):
                kept = [line for line in block["text"].split("\n") if not line.startswith(P.RESULT_PREFIX)]
                block["text"] = "\n".join(kept) or "Harness prose."
    transform(entries, oracle)
    temporary = tempfile.TemporaryDirectory(prefix="pm-r10-mimo-normalized-")
    path = Path(temporary.name) / "session.jsonl"
    path.write_bytes(raw[: controller.omp_session.TITLE_SLOT_BYTES] + P.jsonl_bytes([header, *entries]))
    return temporary, path, P.load_json(MIMO / "launch.json")


def assistant_rows(entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [entry for entry in entries if entry.get("type") == "message" and isinstance(entry.get("message"), dict) and entry["message"].get("role") == "assistant"]


def final_text_block(entries: list[dict[str, Any]]) -> dict[str, Any]:
    rows = assistant_rows(entries)
    blocks = [block for block in rows[-1]["message"]["content"] if isinstance(block, dict) and block.get("type") == "text"]
    check(bool(blocks), "fixture final text block")
    return blocks[-1]


def candidate_mutation_checks() -> int:
    oracle_value = P.load_json(V7 / "oracle.json")
    ordered = (V7 / "oracle.json").read_text(encoding="utf-8").strip()
    reordered = P.canonical_json(oracle_value)
    spaced = json.dumps(oracle_value, ensure_ascii=False, separators=(", ", ": "))
    checks = 0

    def accepted(lines: list[str], label: str, *, pre_call: bool = False) -> None:
        nonlocal checks
        def mutate(entries: list[dict[str, Any]], _oracle: str) -> None:
            if pre_call:
                call = next(entry for entry in assistant_rows(entries) if any(isinstance(block, dict) and block.get("type") == "toolCall" for block in entry["message"]["content"]))
                position = next(index for index, block in enumerate(call["message"]["content"]) if isinstance(block, dict) and block.get("type") == "toolCall")
                call["message"]["content"].insert(position, {"type": "text", "text": "prefix\n" + "\n".join(lines)})
            else:
                final_text_block(entries)["text"] = "Harness lead.\n" + "\n".join(lines) + "\nHarness tail."
        temporary, path, launch = mutated_session(mutate)
        try:
            projection = verify(path, launch, require_exit=False)
            check(projection["result_normalization"]["candidate_count"] == len(lines), label)
            controller.base.exact_result(projection["final_text"])
            checks += 2
        finally:
            temporary.cleanup()

    accepted([P.RESULT_PREFIX + ordered], "one candidate with prose")
    accepted([P.RESULT_PREFIX + reordered, P.RESULT_PREFIX + spaced], "semantic duplicates/key order/whitespace")
    accepted([P.RESULT_PREFIX + ordered], "pre-Goal-call candidate", pre_call=True)
    def identifier_prose(entries: list[dict[str, Any]], _oracle: str) -> None:
        final_text_block(entries)["text"] = P.RESULT_PREFIX + ordered + "\nPM_RESULTS remains ordinary prose"
    temporary, path, launch = mutated_session(identifier_prose)
    try:
        projection = verify(path, launch, require_exit=False)
        check(projection["result_normalization"]["candidate_count"] == 1, "PM_RESULTS is prose, not marker-like")
        checks += 1
    finally:
        temporary.cleanup()

    wrong = copy.deepcopy(oracle_value)
    wrong["plan_unit_count"] += 1
    invalid_cases = (
        ([P.RESULT_PREFIX + P.canonical_json(wrong)], "wrong frozen value", "differs"),
        ([P.RESULT_PREFIX + ordered, P.RESULT_PREFIX + P.canonical_json(wrong)], "conflicting candidates", "conflicting"),
        ([P.RESULT_PREFIX + ordered, P.RESULT_PREFIX + "{"], "good plus invalid candidate", "invalid"),
        ([P.RESULT_PREFIX + ordered, "PM_RESULT:{}"], "correct plus colon marker", "lacks exact space delimiter"),
        ([P.RESULT_PREFIX + ordered, "PM_RESULT\t{}"], "correct plus tab marker", "lacks exact space delimiter"),
        ([P.RESULT_PREFIX + ordered, "PM_RESULT"], "correct plus bare marker", "lacks exact space delimiter"),
        ([P.RESULT_PREFIX + '{"schema_id":"x","schema_id":"pm.r10.storage_pipeline.subject_result.v1"}'], "duplicate JSON key", "duplicate"),
        ([P.RESULT_PREFIX + "{"], "malformed candidate", "invalid"),
        ([P.RESULT_PREFIX + P.canonical_json({**oracle_value, "plan_unit_count": "248"})], "wrong type", "schema/type"),
    )
    for lines, label, fragment in invalid_cases:
        def mutate(entries: list[dict[str, Any]], _oracle: str, lines: list[str] = lines) -> None:
            final_text_block(entries)["text"] = "\n".join(lines)
        temporary, path, launch = mutated_session(mutate)
        try:
            expect(controller.normalizer.NormalizationError, lambda path=path, launch=launch: verify(path, launch, require_exit=False), label, fragment)
            checks += 1
        finally:
            temporary.cleanup()

    for label, mutate in (
        ("missing result", lambda entries, oracle: final_text_block(entries).update({"text": "prose only"})),
        ("not line-start", lambda entries, oracle: final_text_block(entries).update({"text": "x " + P.RESULT_PREFIX + oracle})),
        ("overlimit text", lambda entries, oracle: final_text_block(entries).update({"text": "x" * 4097 + "\n" + P.RESULT_PREFIX + oracle})),
        ("thinking-only marker", lambda entries, oracle: final_text_block(entries).update({"text": "prose only"}) or assistant_rows(entries)[-1]["message"]["content"].append({"type": "thinking", "thinking": P.RESULT_PREFIX + oracle})),
    ):
        temporary, path, launch = mutated_session(mutate)
        try:
            expect(controller.normalizer.NormalizationError, lambda path=path, launch=launch: verify(path, launch, require_exit=False), label)
            checks += 1
        finally:
            temporary.cleanup()

    def tool_result_only(entries: list[dict[str, Any]], oracle: str) -> None:
        final_text_block(entries)["text"] = "prose only"
        result = next(entry for entry in entries if entry.get("type") == "message" and isinstance(entry.get("message"), dict) and entry["message"].get("role") == "toolResult")
        result["message"]["content"] = P.RESULT_PREFIX + oracle
    temporary, path, launch = mutated_session(tool_result_only)
    try:
        expect(controller.normalizer.NormalizationError, lambda: verify(path, launch, require_exit=False), "tool-result marker is non-authoritative")
        checks += 1
    finally:
        temporary.cleanup()
    def nonassistant_marker(entries: list[dict[str, Any]], oracle: str) -> None:
        final_text_block(entries)["text"] = "prose only"
        custom = next(entry for entry in entries if entry.get("type") == "custom" and entry.get("customType") == "tool_execution_start")
        custom["data"]["tui_corroboration_text"] = P.RESULT_PREFIX + oracle
    temporary, path, launch = mutated_session(nonassistant_marker)
    try:
        expect(controller.normalizer.NormalizationError, lambda: verify(path, launch, require_exit=False), "custom/TUI marker is non-authoritative")
        checks += 1
    finally:
        temporary.cleanup()
    def ordinary_tool(entries: list[dict[str, Any]], _oracle: str) -> None:
        call = next(entry for entry in assistant_rows(entries) if any(isinstance(block, dict) and block.get("type") == "toolCall" for block in entry["message"]["content"]))
        call["message"]["content"].insert(-1, {"type": "toolCall", "id": "ordinary", "name": "read", "arguments": {}})
    temporary, path, launch = mutated_session(ordinary_tool)
    try:
        expect(controller.omp_session.OmpSessionError, lambda: verify(path, launch, require_exit=False), "ordinary tool rejected structurally")
        checks += 1
    finally:
        temporary.cleanup()
    return checks


def structural_and_exception_checks() -> int:
    checks = 0
    check(controller.normalizer.MARKER_LIKE.pattern == r"^PM_RESULT(?=$|[^A-Za-z0-9_])", "exact marker-like regex")
    checks += 1
    check(not issubclass(controller.normalizer.NormalizationError, (controller.omp_session.OmpSessionError, controller.base.RunnerError)), "permanent exception disjoint from transient catches")
    checks += 1
    saved = controller.prior.verify_session
    reached: list[str] = []
    try:
        controller.prior.verify_session = lambda *_a, **_k: (_ for _ in ()).throw(controller.omp_session.OmpSessionError("active incomplete"))
        original = controller.normalizer.normalize_verified_session
        controller.normalizer.normalize_verified_session = lambda *_a, **_k: reached.append("normalizer")  # type: ignore[assignment]
        expect(controller.omp_session.OmpSessionError, lambda: controller.verify_session(MIMO / "postfailure_session.raw.jsonl"), "structural verifier runs first")
        check(not reached, "incomplete structural state never normalizes")
        controller.normalizer.normalize_verified_session = original  # type: ignore[assignment]
        checks += 2
    finally:
        controller.prior.verify_session = saved
    raw = (MIMO / "postfailure_session.raw.jsonl").read_bytes()
    with tempfile.TemporaryDirectory(prefix="pm-r10-mimo-api-") as temporary:
        path = Path(temporary) / "session.jsonl"
        path.write_bytes(raw.replace(b'"api":"openai-completions"', b'"api":"wrong-api"', 1))
        expect(controller.ControllerError, lambda: verify(path, P.load_json(MIMO / "launch.json"), require_exit=False), "MiMo API exact")
        checks += 1
    return checks


def catalog_and_binding_checks() -> int:
    model = copy.deepcopy(controller.spec()["catalog_gate"]["expected_model"])
    model["thinking"] = ["low", "medium", "high"]
    raw = (P.canonical_json({"models": [model]}) + "\n").encode()
    projection = controller.catalog_projection(raw)
    controller.validate_catalog_projection(projection)
    check(projection["model"]["selector"] == "opencode-zen/mimo-v2.5-free", "catalog selector")
    bad = copy.deepcopy(model)
    bad["cost"]["output"] = 1
    bad_projection = controller.catalog_projection((P.canonical_json({"models": [bad]}) + "\n").encode())
    expect(controller.ControllerError, lambda: controller.validate_catalog_projection(bad_projection), "catalog price")
    current = controller.bindings()
    originals = [(module, name, getattr(module, name)) for module, name, _value in current]
    with controller.installed():
        check(all(getattr(module, name) is value for module, name, value in controller.bindings()), "bindings installed")
    check(all(getattr(module, name) is value for module, name, value in originals), "bindings restored")
    check(controller.verify_prefix()["row_count"] == 0, "empty exact prefix")
    return 5


def dispatch_custody_checks() -> int:
    saved = (subprocess.Popen, controller.validate_static, controller.git_custody, controller._prefix, controller.base.run_row, controller.base.record_failure, controller.preserve_postfailure, controller.EVIDENCE)
    custody = {"candidate_commit": "a" * 40, "head": "a" * 40, "origin_main": "a" * 40, "truenas_backup_main": "a" * 40, "sources": []}
    popen: list[str] = []
    checks = 0
    try:
        subprocess.Popen = lambda *_a, **_k: popen.append("Popen")  # type: ignore[assignment]
        controller.validate_static = lambda *, unused: {"subject_calls": 0}
        controller.git_custody = lambda: custody
        controller._prefix = lambda: {"row_count": 0}
        with contextlib.redirect_stdout(io.StringIO()):
            check(controller.dispatch(["run", "1", "--max-seconds", "3599"]) == 1, "budget prelaunch gate")
        checks += 1
        controller.git_custody = lambda: (_ for _ in ()).throw(controller.ControllerError("unpushed"))
        with contextlib.redirect_stdout(io.StringIO()):
            check(controller.dispatch(["run", "1"]) == 1, "custody prelaunch gate")
        checks += 1
        controller.git_custody = lambda: custody
        for kind in ("root", "parent", "row"):
            with tempfile.TemporaryDirectory(prefix=f"pm-r10-mimo-normalized-{kind}-") as temporary:
                controller.EVIDENCE = Path(temporary) / "evidence"
                row = controller.rows()[0]
                def partial(*_args: Any, kind: str = kind, row: dict[str, Any] = row) -> Any:
                    target = controller.EVIDENCE if kind == "root" else controller.EVIDENCE / row["pass_id"] if kind == "parent" else controller.EVIDENCE / row["pass_id"] / row["route_id"]
                    target.mkdir(parents=True)
                    raise controller.normalizer.NormalizationError(f"{kind} synthetic permanent result failure")
                controller.base.run_row = partial
                with contextlib.redirect_stdout(io.StringIO()):
                    check(controller.dispatch(["run", "1"]) == 1, f"{kind} consumed")
                leaf = controller.EVIDENCE / row["pass_id"] / row["route_id"]
                check(P.load_json(leaf / "terminal.json")["status"] == "FAIL" and (leaf / "runner_failure.json").is_file(), f"{kind} durable fail")
                checks += 2
        with tempfile.TemporaryDirectory(prefix="pm-r10-mimo-normalized-absent-") as temporary:
            controller.EVIDENCE = Path(temporary) / "evidence"
            controller.base.run_row = lambda *_a: (_ for _ in ()).throw(controller.ControllerError("before mutation"))
            with contextlib.redirect_stdout(io.StringIO()):
                check(controller.dispatch(["run", "1"]) == 1, "absent prelaunch failure")
            check(not os.path.lexists(controller.EVIDENCE), "absent remains absent")
            checks += 2
    finally:
        subprocess.Popen, controller.validate_static, controller.git_custody, controller._prefix, controller.base.run_row, controller.base.record_failure, controller.preserve_postfailure, controller.EVIDENCE = saved
    check(not popen, "zero-subject dispatch never Popen")
    return checks + 1


def repeat_and_output_checks() -> int:
    saved = (controller.validate_static, controller.git_custody, controller._prefix, controller.base.run_row, controller.base.record_failure, controller.preserve_postfailure, controller.EVIDENCE)
    custody = {"candidate_commit": "a" * 40, "head": "a" * 40, "origin_main": "a" * 40, "truenas_backup_main": "a" * 40, "sources": []}
    calls: list[str] = []
    checks = 0
    try:
        controller.validate_static = lambda *, unused: {}
        controller.git_custody = lambda: custody
        with tempfile.TemporaryDirectory(prefix="pm-r10-mimo-normalized-repeat-") as temporary:
            controller.EVIDENCE = Path(temporary) / "evidence"
            row = controller.rows()[0]
            leaf = controller.EVIDENCE / row["pass_id"] / row["route_id"]
            leaf.mkdir(parents=True)
            (leaf / "sentinel").write_bytes(b"prior PASS")
            controller._prefix = lambda: {"row_count": 1}
            controller.base.run_row = lambda *_a: calls.append("run")
            controller.base.record_failure = lambda *_a: calls.append("failure")
            controller.preserve_postfailure = lambda *_a: calls.append("preserve")
            before = (leaf / "sentinel").read_bytes()
            with contextlib.redirect_stdout(io.StringIO()):
                check(controller.dispatch(["run", "1"]) == 1, "repeat rejected")
            check((leaf / "sentinel").read_bytes() == before and calls == [], "repeat no mutation")
            checks += 2

        class Closed(io.StringIO):
            def write(self, _value: str) -> int:
                raise BrokenPipeError("closed after PASS")

        with tempfile.TemporaryDirectory(prefix="pm-r10-mimo-normalized-output-") as temporary:
            controller.EVIDENCE = Path(temporary) / "evidence"
            controller._prefix = lambda: {"row_count": 0}
            frozen: dict[str, bytes] = {}
            def passed(*_args: Any) -> dict[str, str]:
                row = controller.rows()[0]
                leaf = controller.EVIDENCE / row["pass_id"] / row["route_id"]
                leaf.mkdir(parents=True)
                (leaf / "terminal.json").write_bytes(b"durable PASS")
                frozen.update({path.name: path.read_bytes() for path in leaf.iterdir()})
                calls.append("run")
                return {"status": "PASS"}
            calls.clear()
            controller.base.run_row = passed
            with contextlib.redirect_stdout(Closed()):
                expect(BrokenPipeError, lambda: controller.dispatch(["run", "1"]), "post-PASS stdout")
            row = controller.rows()[0]
            leaf = controller.EVIDENCE / row["pass_id"] / row["route_id"]
            check({path.name: path.read_bytes() for path in leaf.iterdir()} == frozen and calls == ["run"], "post-PASS output cannot corrupt evidence")
            checks += 1
    finally:
        controller.validate_static, controller.git_custody, controller._prefix, controller.base.run_row, controller.base.record_failure, controller.preserve_postfailure, controller.EVIDENCE = saved
    return checks


def authority_checks() -> int:
    authority = copy.deepcopy(controller.spec()["authority"])
    controller.validate_authority(authority)
    controller.validate_goal_receipt(controller.spec()["governance_goal_receipt"])
    checks = 2
    for mutate, label in (
        (lambda value: value["normalization_exchange"]["user_correction"].update({"text_utf8": "normalizing"}), "correction drift"),
        (lambda value: value["normalization_exchange"]["assistant_program_answer"].update({"text_utf8": "another agent"}), "program authority drift"),
        (lambda value: value.update({"authorized_selector": "opencode-zen/hy3-free"}), "selector widening"),
        (lambda value: value.update({"retry_replacement_reuse_or_retro_credit_authorized": True}), "retry widening"),
    ):
        candidate = copy.deepcopy(authority)
        mutate(candidate)
        expect(controller.ControllerError, lambda candidate=candidate: controller.validate_authority(candidate), label)
        checks += 1
    goal = copy.deepcopy(controller.spec()["governance_goal_receipt"])
    goal["objective_utf8"] = goal["objective_utf8"].replace("deterministic program code", "another agent")
    expect(controller.ControllerError, lambda: controller.validate_goal_receipt(goal), "Goal objective drift")
    return checks + 1


def main() -> int:
    static = controller.validate_static(unused=True)
    check(static["rows"] == 1 and static["temporary_bindings"] == 11 and static["subject_calls"] == 0, "static package")
    checks = 1
    checks += fixture_checks()
    checks += candidate_mutation_checks()
    checks += structural_and_exception_checks()
    checks += catalog_and_binding_checks()
    checks += dispatch_custody_checks()
    checks += repeat_and_output_checks()
    checks += authority_checks()
    row = controller.rows()[0]
    check(not os.path.lexists(controller.EVIDENCE) and not os.path.lexists(row["cwd"]) and not os.path.lexists(row["session_dir"]) and not list(controller.HERE.rglob("*.pyc")) and not list(controller.HERE.rglob("__pycache__")), "no evidence/runtime/cache residue")
    checks += 1
    print(P.canonical_json({"status": "PASS_ZERO_SUBJECT_SELFTEST", "checks": checks, "metrics": static["metrics"], "temporary_bindings": 11, "subject_calls": 0, "qualification_credit": 0, "matrix_credit": 0}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
