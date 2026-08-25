#!/usr/bin/env python3
"""Zero-subject checks for the storage-plan pipeline and result scorer."""

from __future__ import annotations

import copy
import json
import tempfile
from pathlib import Path

import jsonschema

import pipeline
import freeze_check
import omp_session
import omp_row_runner
import verify_matrix


def expect_failure(callable_obj, label: str) -> None:
    try:
        callable_obj()
    except Exception:
        return
    raise AssertionError(f"expected failure: {label}")


def check(condition: bool, label: str) -> None:
    if not condition:
        raise AssertionError(label)


class FakeMultilineComposer:
    """Minimal reproduction of the V3 PTY boundary: coalesced CR loads but does not submit."""

    def __init__(self, prompt: bytes):
        self.prompt = prompt
        self.loaded = False
        self.submitted = False
        self.writes: list[bytes] = []

    def write(self, payload: bytes) -> int:
        self.writes.append(payload)
        if payload == self.prompt or payload == self.prompt + b"\r":
            self.loaded = True
        elif payload == b"\r" and self.loaded:
            self.submitted = True
        return len(payload)


def synthetic_omp_session(route: dict[str, object], objective: str, final_text: str) -> bytes:
    header_time = "2026-08-25T16:00:00.000Z"
    slot = {"type": "title", "v": 1, "title": "", "updatedAt": header_time, "pad": ""}
    unpadded = (pipeline.canonical_json(slot) + "\n").encode()
    slot["pad"] = " " * (omp_session.TITLE_SLOT_BYTES - len(unpadded))
    slot_raw = (pipeline.canonical_json(slot) + "\n").encode()
    check(len(slot_raw) == omp_session.TITLE_SLOT_BYTES, "synthetic title slot")
    rows: list[dict[str, object]] = [
        {
            "type": "session",
            "version": 3,
            "id": "01a039ff-0000-7000-8000-000000000001",
            "timestamp": header_time,
            "cwd": "/tmp/pm-r10-storage-v6-selftest",
        }
    ]
    parent: str | None = None
    index = 0

    def add(entry_type: str, **fields: object) -> dict[str, object]:
        nonlocal parent, index
        index += 1
        entry_id = f"{index:08x}"
        entry = {
            "type": entry_type,
            "id": entry_id,
            "parentId": parent,
            "timestamp": f"2026-08-25T16:00:{index:02d}.000Z",
            **fields,
        }
        rows.append(entry)
        parent = entry_id
        return entry

    provider, model = str(route["model"]).split("/", 1)
    thinking = str(route["thinking"])
    goal_active = {
        "id": "999000111222333",
        "objective": objective,
        "status": "active",
        "tokensUsed": 0,
        "timeUsedSeconds": 0,
        "createdAt": 1787673600000,
        "updatedAt": 1787673600000,
    }
    goal_complete = {**goal_active, "status": "complete", "tokensUsed": 321, "timeUsedSeconds": 4, "updatedAt": 1787673604000}
    add("model_change", model=route["model"], resolvedModelIsFallback=False)
    add("thinking_level_change", thinkingLevel=thinking, configured=thinking)
    add("mode_change", mode="goal", data={"goal": goal_active})
    add(
        "custom_message",
        customType="goal-mode-context",
        content=omp_session.render_goal_active(objective, goal_active),
        display=False,
        attribution="agent",
    )
    add("message", message={"role": "user", "content": objective, "attribution": "user", "timestamp": 1787673600100})
    add(
        "message",
        message={
            "role": "assistant",
            "provider": provider,
            "model": model,
            "content": [{"type": "toolCall", "id": "goal_call_1", "name": "goal", "arguments": {"op": "complete"}}],
            "stopReason": "toolUse",
            "usage": {},
            "timestamp": 1787673601000,
        },
    )
    add(
        "custom",
        customType="tool_execution_start",
        data={"toolCallId": "goal_call_1", "toolName": "goal", "startedAt": "2026-08-25T16:00:05.100Z"},
    )
    add("mode_change", mode="goal", data={"goal": goal_complete})
    add(
        "message",
        message={
            "role": "toolResult",
            "toolCallId": "goal_call_1",
            "toolName": "goal",
            "content": [{"type": "text", "text": "Status: complete"}],
            "details": {"op": "complete", "goal": goal_complete, "remainingTokens": None, "completionBudgetReport": None},
            "isError": False,
            "timestamp": 1787673602000,
        },
    )
    add(
        "message",
        message={
            "role": "assistant",
            "provider": provider,
            "model": model,
            "content": [{"type": "text", "text": final_text}],
            "stopReason": "stop",
            "usage": {},
            "timestamp": 1787673603000,
        },
    )
    add("mode_change", mode="none")
    add(
        "custom",
        customType="goal-completed",
        data={"objective": objective, "tokensUsed": 321, "timeUsedSeconds": 4},
    )
    add(
        "custom",
        customType="session_exit",
        data={"reason": "dispose", "kind": "normal", "recordedAt": "2026-08-25T16:00:12.100Z", "pendingToolCalls": []},
    )
    return slot_raw + pipeline.jsonl_bytes(rows)


def synthetic_cursor_aggregate_session(route: dict[str, object], objective: str, final_text: str) -> bytes:
    """Observed OMP 18.0.4 cursor/default-auto lifecycle: one aggregate assistant record."""
    raw = synthetic_omp_session(route, objective, final_text)

    def convert(rows: list[dict[str, object]]) -> None:
        rows[:] = [row for row in rows if row.get("type") != "thinking_level_change"]
        assistants = [
            row
            for row in rows
            if row.get("type") == "message" and row.get("message", {}).get("role") == "assistant"
        ]
        call_entry, final_entry = assistants
        tool_call = next(block for block in call_entry["message"]["content"] if block.get("type") == "toolCall")
        aggregate = copy.deepcopy(call_entry)
        aggregate["id"] = "cursor-aggregate-assistant"
        aggregate["message"] = {
            "role": "assistant",
            "provider": "cursor",
            "model": "default",
            "api": "cursor-agent",
            "content": [
                {"type": "thinking", "thinking": "bounded audit"},
                {"type": "text", "text": "bounded receipt summary\n"},
                copy.deepcopy(tool_call),
                {"type": "thinking", "thinking": "terminal response"},
                {"type": "text", "text": final_text},
            ],
            "stopReason": "stop",
            "usage": {},
            "timestamp": 1787673603000,
        }
        rows.remove(call_entry)
        rows.remove(final_entry)
        result_index = next(
            index
            for index, row in enumerate(rows)
            if row.get("type") == "message" and row.get("message", {}).get("role") == "toolResult"
        )
        aggregate["timestamp"] = rows[result_index - 1]["timestamp"]
        rows.insert(result_index, aggregate)

    return mutate_session(raw, convert)


def mutate_session(raw: bytes, mutator) -> bytes:
    slot = raw[: omp_session.TITLE_SLOT_BYTES]
    rows = [pipeline.strict_loads(line) for line in raw[omp_session.TITLE_SLOT_BYTES :].decode("utf-8").splitlines()]
    mutator(rows)
    parent = None
    for entry in rows[1:]:
        entry["parentId"] = parent
        parent = entry["id"]
    return slot + pipeline.jsonl_bytes(rows)


def main() -> int:
    checks = 0
    check(pipeline.preflight_inputs()["status"] == "PASS", "input preflight"); checks += 1
    check(pipeline.omp_runtime_preflight()["status"] == "PASS_OMP_RUNTIME", "OMP runtime preflight"); checks += 1
    check(pipeline.verify()["status"] == "PASS_VERIFIED_NO_WORKNODES", "derived verification"); checks += 1
    check(freeze_check.verify_freeze()["status"] == "PASS_FROZEN_ZERO_SUBJECT", "freeze verification"); checks += 1
    matrix = pipeline.load_json(pipeline.MATRIX_PATH)
    check(len(matrix["ordered_routes"]) == 12, "route count"); checks += 1
    check(matrix["ordered_routes"][0]["id"] == "omp_ox_alpha_free_max", "Ox first"); checks += 1
    check(matrix["ordered_routes"][1]["id"] == "omp_cursor_default_auto", "Cursor second"); checks += 1
    check(matrix["ordered_routes"][-1]["id"] == "omp_qwen3_8_max_xhigh", "Qwen last"); checks += 1
    check(len({(row["surface"], row["model"], row["thinking"]) for row in matrix["ordered_routes"]}) == 12, "unique route tuples"); checks += 1
    check(
        matrix["omp_runtime"].get("submission_transport")
        == {
            "kind": "prompt_then_composer_ack_then_enter",
            "external_submission_count": 1,
            "low_level_input_write_count": 2,
            "prompt_terminator_included": False,
            "composer_ack_required": True,
            "persisted_session_prefix_required": True,
        },
        "frozen V6 OMP submission transport",
    ); checks += 1
    launch_plan = pipeline.load_json(pipeline.HERE / "launch_plan.json")
    check(launch_plan["pass_order"] == ["pass_01", "pass_02"] and launch_plan["row_count"] == 24, "launch plan pass/row contract"); checks += 1
    check(len({row["attempt_id"] for row in launch_plan["rows"]}) == 24 and len({row["nonce"] for row in launch_plan["rows"]}) == 24, "launch identity uniqueness"); checks += 1
    omp_plans = [row for row in launch_plan["rows"] if row["surface"] == "omp_tui"]
    check(
        len({row["cwd"] for row in omp_plans}) == len(omp_plans)
        and len({row["session_dir"] for row in omp_plans}) == len(omp_plans),
        "unique OMP cwd/session identities",
    ); checks += 1
    check(
        all(row["cwd"].startswith("/tmp/pm-r10-storage-v6-") for row in omp_plans)
        and all(row["session_dir"].startswith("/tmp/pm-r10-storage-v6-session-") for row in omp_plans),
        "V6 OMP path scope",
    ); checks += 1
    omp = (pipeline.PROMPTS / "omp.prompt.txt").read_text(); codex = (pipeline.PROMPTS / "codex.prompt.txt").read_text()
    check(omp.startswith("/goal ") and codex.startswith("Create a goal that "), "native prefixes"); checks += 1
    check("Create a goal that" not in omp and not codex.startswith("/goal "), "surface isolation"); checks += 1
    oracle = pipeline.load_json(pipeline.ORACLE_PATH); schema = pipeline.load_json(pipeline.SCHEMA_PATH)
    capsule = pipeline.load_json(pipeline.HOST_OUTPUTS / "capsule.json")
    jsonschema.Draft202012Validator.check_schema(schema); jsonschema.validate(oracle, schema); checks += 1
    projection = pipeline.verify_typed_projection(capsule, oracle)
    check(projection == {key: value for key, value in oracle.items() if key != "schema_id"}, "typed projection covers oracle"); checks += 1
    check(pipeline.ORACLE_PATH.read_text().strip() not in omp and pipeline.ORACLE_PATH.read_text().strip() not in codex, "full oracle not admitted"); checks += 1
    swapped = copy.deepcopy(capsule)
    next(source["facts"] for source in swapped["sources"] if source["source_id"] == "comparison_and_gate_receipt")["blocker_codes"].reverse()
    expect_failure(lambda: pipeline.verify_typed_projection(swapped, oracle), "swapped blocker projection"); checks += 1
    wrong_type = copy.deepcopy(capsule)
    next(source["facts"] for source in wrong_type["sources"] if source["source_id"] == "comparison_and_gate_receipt")["source_match"] = "true"
    expect_failure(lambda: pipeline.verify_typed_projection(wrong_type, oracle), "wrong projection type"); checks += 1
    missing = copy.deepcopy(capsule)
    del next(source["facts"] for source in missing["sources"] if source["source_id"] == "comparison_and_gate_receipt")["pre_worknode_disposition"]
    expect_failure(lambda: pipeline.verify_typed_projection(missing, oracle), "missing projection field"); checks += 1
    aliased = copy.deepcopy(capsule)
    facts = next(source["facts"] for source in aliased["sources"] if source["source_id"] == "comparison_and_gate_receipt")
    facts["public_blockers"] = facts.pop("blocker_codes")
    expect_failure(lambda: pipeline.verify_typed_projection(aliased, oracle), "aliased projection field"); checks += 1
    exact = "brief\n" + pipeline.RESULT_PREFIX + pipeline.ORACLE_PATH.read_text().strip()
    check(verify_matrix.terminal_result(exact) == oracle, "positive typed result"); checks += 1
    expect_failure(lambda: verify_matrix.terminal_result(exact + "\nextra"), "nonterminal result"); checks += 1
    expect_failure(lambda: verify_matrix.terminal_result(exact + "\n" + pipeline.RESULT_PREFIX + pipeline.ORACLE_PATH.read_text().strip()), "duplicate result"); checks += 1
    wrong = copy.deepcopy(oracle); wrong["pre_worknode_disposition"] = "ready"
    expect_failure(lambda: verify_matrix.terminal_result(pipeline.RESULT_PREFIX + json.dumps(wrong, separators=(",", ":"))), "readiness widening"); checks += 1
    expect_failure(lambda: pipeline.strict_loads('{"a":1,"a":2}'), "duplicate JSON key"); checks += 1
    expect_failure(lambda: pipeline.strict_loads('{"a":NaN}'), "nonfinite JSON"); checks += 1
    check(verify_matrix.parse_goal_wrapper('const r=await tools.create_goal({objective:"storage pipeline"}); text(r)') == ("create_goal", "storage pipeline"), "safe create wrapper"); checks += 1
    check(verify_matrix.parse_goal_wrapper('const result = await tools.update_goal({status: "complete"});\ntext(result);') == ("update_goal", None), "safe update wrapper"); checks += 1
    expect_failure(lambda: verify_matrix.parse_goal_wrapper("await tools['create_goal']({})"), "computed Goal access"); checks += 1
    expect_failure(lambda: verify_matrix.parse_goal_wrapper('const r=await tools.create_goal({objective:"storage pipeline"}); await tools.exec_command({}); text(r)'), "mixed wrapper"); checks += 1
    expect_failure(lambda: verify_matrix.parse_goal_wrapper('const t=tools; const r=await t.exec_command({}); "tools.create_goal({})"; text(r)'), "aliased wrapper bypass"); checks += 1
    first = launch_plan["rows"][0]
    runtime = pipeline.load_json(pipeline.RUNTIME_PATH)["omp"]
    receipt = {
        "schema_id": "pm.r10.storage_pipeline.omp_preflight.v2",
        **{key: first[key] for key in ("pass_id", "route_id", "ordinal", "attempt_id", "nonce")},
        **{key: first[key] for key in ("surface", "model", "thinking")},
        "observed_at_utc": "2026-08-25T14:59:00Z",
        "binary": runtime["binary"],
        "binary_bytes": runtime["binary_bytes"],
        "binary_sha256": runtime["binary_sha256"],
        "version_stdout": runtime["version"],
        "version_command": {
            "argv": [runtime["binary"], "--version"],
            "exit_code": 0,
            "stdout": runtime["version"],
        },
        "profile_dir": runtime["profile_dir"],
        "config_commands": [
            {
                "argv": [runtime["binary"], "config", "get", key],
                "key": key,
                "exit_code": 0,
                "stdout": json.dumps(value, separators=(",", ":")) if not isinstance(value, str) else value,
            }
            for key, value in runtime["effective_config"].items()
        ],
        "effective_config": runtime["effective_config"],
        "subject_calls": 0,
    }
    with tempfile.TemporaryDirectory(prefix="pm-r10-omp-preflight-test-") as temporary:
        path = Path(temporary) / "omp_preflight.json"
        path.write_bytes(pipeline.pretty_json(receipt))
        launch = {
            "started_at_utc": "2026-08-25T14:59:30Z",
            "omp_preflight_bytes": path.stat().st_size,
            "omp_preflight_sha256": pipeline.sha256_file(path),
        }
        check(verify_matrix.verify_omp_preflight(path.parent, launch, first) == launch["omp_preflight_sha256"], "row-bound OMP preflight"); checks += 1
        receipt["config_commands"][0]["stdout"] = "true"
        path.write_bytes(pipeline.pretty_json(receipt))
        launch["omp_preflight_bytes"] = path.stat().st_size
        launch["omp_preflight_sha256"] = pipeline.sha256_file(path)
        expect_failure(lambda: verify_matrix.verify_omp_preflight(path.parent, launch, first), "advisor-on OMP preflight"); checks += 1
        receipt["config_commands"][0]["stdout"] = json.dumps(runtime["effective_config"][receipt["config_commands"][0]["key"]], separators=(",", ":"))
        receipt["config_commands"][0]["argv"] = ["/bin/echo", "fabricated"]
        path.write_bytes(pipeline.pretty_json(receipt))
        launch["omp_preflight_bytes"] = path.stat().st_size
        launch["omp_preflight_sha256"] = pipeline.sha256_file(path)
        expect_failure(lambda: verify_matrix.verify_omp_preflight(path.parent, launch, first), "fabricated OMP config argv"); checks += 1
    first_route = matrix["ordered_routes"][0]
    expected_omp_argv = omp_row_runner.expected_argv(first_route, first)
    check("--session-dir" in expected_omp_argv and "--no-session" not in expected_omp_argv, "persistent OMP argv"); checks += 1
    prompt_bytes = omp.encode("utf-8")
    transport = omp_row_runner.validate_two_phase_payloads(prompt_bytes, b"\r")
    check(
        transport["external_submission_count"] == 1
        and transport["low_level_input_write_count"] == 2
        and transport["prompt_sha256"] == pipeline.sha256_bytes(prompt_bytes),
        "two-phase transport contract",
    ); checks += 1
    expect_failure(
        lambda: omp_row_runner.validate_two_phase_payloads(prompt_bytes + b"\r", b"\r"),
        "coalesced prompt terminator",
    ); checks += 1
    expect_failure(
        lambda: omp_row_runner.validate_two_phase_payloads(prompt_bytes, b"\n"),
        "non-Enter second payload",
    ); checks += 1
    coalesced = FakeMultilineComposer(prompt_bytes)
    coalesced.write(prompt_bytes + b"\r")
    check(coalesced.loaded and not coalesced.submitted, "V3 coalesced-write reproduction"); checks += 1
    separated = FakeMultilineComposer(prompt_bytes)
    separated.write(prompt_bytes)
    separated.write(b"\r")
    check(
        separated.submitted and separated.writes == [prompt_bytes, b"\r"],
        "V6 separate prompt and Enter submission",
    ); checks += 1
    startup = b"boot\nMCP finished\n\xe2\x9d\xaf "
    composer = startup + "\n/goal Audit...\n❯ 📄 #1".encode("utf-8")
    composer_projection = omp_row_runner.verify_composer_transition(startup, composer)
    check(
        composer_projection["pre_prompt_sha256"] == pipeline.sha256_bytes(startup)
        and composer_projection["new_raw_bytes"] == len(composer) - len(startup),
        "causal composer acknowledgement",
    ); checks += 1
    expect_failure(lambda: omp_row_runner.verify_composer_transition(startup, startup), "startup alone is not prompt acknowledgement"); checks += 1
    expect_failure(
        lambda: omp_row_runner.verify_composer_transition(composer, composer + b"\nredraw"),
        "prompt marker pre-exists before write",
    ); checks += 1
    expect_failure(
        lambda: omp_row_runner.verify_composer_transition(startup, b"different transcript\n" + composer),
        "composer snapshot is not append-only",
    ); checks += 1
    with tempfile.TemporaryDirectory(prefix="pm-r10-omp-session-dir-test-") as temporary:
        session_dir = Path(temporary)
        session_path = session_dir / "fresh-session.jsonl"
        session_path.write_bytes(b"session")
        artifacts = session_dir / "fresh-session"
        artifacts.mkdir()
        (artifacts / ".draft-only-session").write_bytes(b"")
        (artifacts / "draft.txt").write_bytes(b"draft")
        check(omp_row_runner.session_file(session_dir) is None, "draft artifact state is not submission acceptance"); checks += 1
        (artifacts / ".draft-only-session").unlink()
        (artifacts / "draft.txt").unlink()
        check(omp_row_runner.session_file(session_dir) == session_path, "consumed empty artifact directory accepted"); checks += 1
        rogue = session_dir / "shadow.jsonl"
        rogue.symlink_to(session_path)
        expect_failure(lambda: omp_row_runner.session_file(session_dir), "symlinked second session rejected"); checks += 1
    with tempfile.TemporaryDirectory(prefix="pm-r10-omp-timeout-custody-test-") as temporary:
        root = Path(temporary)
        row_dir = root / "row"
        session_dir = root / "sessions"
        row_dir.mkdir(); session_dir.mkdir()
        session_raw_fixture = b'{"type":"session"}\n'
        (session_dir / "fresh.jsonl").write_bytes(session_raw_fixture)
        artifact_dir = session_dir / "fresh"
        artifact_dir.mkdir()
        (artifact_dir / ".draft-only-session").write_bytes(b"")
        receipt = omp_row_runner.preserve_submission_timeout(
            row_dir=row_dir,
            session_dir=session_dir,
            planned=first,
            pid=12345,
            last_parser_error="OmpSessionError: bounded rejection",
            last_session_raw=session_raw_fixture,
            last_session_name="fresh.jsonl",
        )
        check(
            receipt["last_parser_error"] == "OmpSessionError: bounded rejection"
            and receipt["last_session_snapshot"]["sha256"] == pipeline.sha256_bytes(session_raw_fixture)
            and [entry["name"] for entry in receipt["session_dir_roster"]] == ["fresh", "fresh.jsonl"]
            and (row_dir / "submission_timeout.json").is_file()
            and (row_dir / "submission_timeout_session.raw.jsonl").read_bytes() == session_raw_fixture,
            "submission-timeout parser/raw/roster custody",
        ); checks += 1
    post_popen = omp_row_runner.PostPopenRunnerError(12345, OSError("receipt write"))
    check(post_popen.pid == 12345 and "post-Popen failure" in str(post_popen), "post-Popen lower-bound custody"); checks += 1
    check(issubclass(omp_row_runner.ReservationConflict, omp_row_runner.RunnerError), "reservation conflict is nonmutating"); checks += 1
    objective = omp[len("/goal ") :]
    final_text = "bounded result\n" + pipeline.RESULT_PREFIX + pipeline.ORACLE_PATH.read_text().strip()
    session_raw = synthetic_omp_session(first_route, objective, final_text)
    with tempfile.TemporaryDirectory(prefix="pm-r10-omp-session-test-") as temporary:
        path = Path(temporary) / "session.jsonl"
        path.write_bytes(session_raw)
        provider, model = first_route["model"].split("/", 1)

        def verify(raw: bytes, *, require_exit: bool = True) -> dict[str, object]:
            path.write_bytes(raw)
            return omp_session.verify_session(
                path,
                expected_cwd="/tmp/pm-r10-storage-v6-selftest",
                expected_objective=objective,
                expected_provider=provider,
                expected_model=model,
                expected_selector=first_route["model"],
                expected_thinking=first_route["thinking"],
                require_exit=require_exit,
            )

        def verify_prefix(raw: bytes) -> dict[str, object]:
            path.write_bytes(raw)
            return omp_session.verify_submission_prefix(
                path,
                expected_cwd="/tmp/pm-r10-storage-v6-selftest",
                expected_objective=objective,
                expected_selector=first_route["model"],
                expected_thinking=first_route["thinking"],
            )

        prefix_projection = verify_prefix(session_raw)
        check(
            prefix_projection["external_user_message_count"] == 1
            and prefix_projection["goal_context_count"] == 1
            and prefix_projection["selector"] == first_route["model"]
            and prefix_projection["thinking"] == first_route["thinking"],
            "persisted submission prefix positive",
        ); checks += 1

        def mark_model_fallback(rows: list[dict[str, object]]) -> None:
            next(row for row in rows if row.get("type") == "model_change")["resolvedModelIsFallback"] = True

        fallback_session = mutate_session(session_raw, mark_model_fallback)
        expect_failure(lambda: verify_prefix(fallback_session), "submission selector fallback"); checks += 1
        expect_failure(lambda: verify(fallback_session), "full selector fallback"); checks += 1

        def goal_context(rows: list[dict[str, object]]) -> dict[str, object]:
            return next(
                row
                for row in rows
                if row.get("type") == "custom_message" and row.get("customType") == "goal-mode-context"
            )

        def remove_goal_context(rows: list[dict[str, object]]) -> None:
            rows.remove(goal_context(rows))

        def duplicate_goal_context(rows: list[dict[str, object]]) -> None:
            original = goal_context(rows)
            duplicate = copy.deepcopy(original)
            duplicate["id"] = "duplicate-goal-context"
            rows.insert(rows.index(original) + 1, duplicate)

        def relocate_goal_context_after_user(rows: list[dict[str, object]]) -> None:
            context = goal_context(rows)
            rows.remove(context)
            user_index = next(
                index
                for index, row in enumerate(rows)
                if row.get("type") == "message" and row.get("message", {}).get("role") == "user"
            )
            context["timestamp"] = rows[user_index]["timestamp"]
            rows.insert(user_index + 1, context)

        def expose_goal_context(rows: list[dict[str, object]]) -> None:
            goal_context(rows)["display"] = True

        def misattribute_goal_context(rows: list[dict[str, object]]) -> None:
            goal_context(rows)["attribution"] = "user"

        def alter_goal_context(rows: list[dict[str, object]]) -> None:
            goal_context(rows)["content"] = final_text + "\n" + str(goal_context(rows)["content"])

        def relabel_goal_context(rows: list[dict[str, object]]) -> None:
            goal_context(rows)["customType"] = "goal-continuation"

        def unknown_custom_message(rows: list[dict[str, object]]) -> None:
            goal_context(rows)["customType"] = "foreign-context"

        for label, mutation in (
            ("missing Goal context", remove_goal_context),
            ("duplicate Goal context", duplicate_goal_context),
            ("misordered Goal context", relocate_goal_context_after_user),
            ("visible Goal context", expose_goal_context),
            ("misattributed Goal context", misattribute_goal_context),
            ("altered Goal context", alter_goal_context),
            ("Goal context relabeled as continuation", relabel_goal_context),
            ("unknown custom message", unknown_custom_message),
        ):
            expect_failure(lambda mutation=mutation: verify_prefix(mutate_session(session_raw, mutation)), f"prefix {label}")
            checks += 1
            expect_failure(lambda mutation=mutation: verify(mutate_session(session_raw, mutation)), f"full {label}")
            checks += 1

        def remove_submission_user(rows: list[dict[str, object]]) -> None:
            rows[:] = [
                row
                for row in rows
                if not (
                    row.get("type") == "message"
                    and isinstance(row.get("message"), dict)
                    and row["message"].get("role") == "user"
                )
            ]

        expect_failure(
            lambda: verify_prefix(mutate_session(session_raw, remove_submission_user)),
            "submission prefix missing external user",
        ); checks += 1

        def replace_submission_objective(rows: list[dict[str, object]]) -> None:
            user = next(
                row["message"]
                for row in rows
                if row.get("type") == "message"
                and isinstance(row.get("message"), dict)
                and row["message"].get("role") == "user"
            )
            user["content"] = "different bounded objective"

        expect_failure(
            lambda: verify_prefix(mutate_session(session_raw, replace_submission_objective)),
            "submission prefix objective mismatch",
        ); checks += 1

        def draft_only(rows: list[dict[str, object]]) -> None:
            rows[:] = [row for row in rows if row.get("type") in {"session", "model_change", "thinking_level_change"}]

        expect_failure(lambda: verify_prefix(mutate_session(session_raw, draft_only)), "draft-only session is not submission"); checks += 1

        projection = verify(session_raw)
        check(
            projection["final_text"] == final_text
            and projection["ordinary_tool_calls"] == 0
            and projection["goal_context_count"] == 1
            and projection["native_continuation_count"] == 0,
            "session-backed Goal positive",
        ); checks += 1
        def split_final_text(rows: list[dict[str, object]]) -> None:
            final = [
                row["message"]
                for row in rows
                if row.get("type") == "message" and row.get("message", {}).get("role") == "assistant"
            ][-1]
            midpoint = len(final_text) // 2
            final["content"] = [
                {"type": "text", "text": final_text[:midpoint]},
                {"type": "text", "text": final_text[midpoint:]},
            ]

        check(verify(mutate_session(session_raw, split_final_text))["final_text"] == final_text, "ordered final text concatenation"); checks += 1

        def add_native_continuation(rows: list[dict[str, object]]) -> None:
            call_index = next(
                index
                for index, row in enumerate(rows)
                if row.get("type") == "message"
                and row.get("message", {}).get("role") == "assistant"
                and any(block.get("type") == "toolCall" for block in row["message"]["content"])
            )
            timestamp = rows[call_index]["timestamp"]
            continuation_goal = copy.deepcopy(
                next(
                    row["data"]["goal"]
                    for row in rows
                    if row.get("type") == "mode_change"
                    and row.get("mode") == "goal"
                    and row.get("data", {}).get("goal", {}).get("status") == "active"
                )
            )
            continuation_goal["tokensUsed"] = 111
            continuation_goal["timeUsedSeconds"] = 2
            continuation_goal["updatedAt"] = 1787673602000
            rows[call_index:call_index] = [
                {
                    "type": "message",
                    "id": "native-continuation-source",
                    "parentId": None,
                    "timestamp": timestamp,
                    "message": {
                        "role": "assistant",
                        "provider": provider,
                        "model": model,
                        "content": [{"type": "text", "text": "I am still checking the bounded receipt."}],
                        "stopReason": "stop",
                        "usage": {},
                        "timestamp": 1787673600500,
                    },
                },
                {
                    "type": "mode_change",
                    "id": "native-goal-accounting",
                    "parentId": None,
                    "timestamp": timestamp,
                    "mode": "goal",
                    "data": {"goal": continuation_goal},
                },
                {
                    "type": "custom_message",
                    "id": "native-goal-continuation-context",
                    "parentId": None,
                    "timestamp": timestamp,
                    "customType": "goal-mode-context",
                    "content": omp_session.render_goal_active(objective, continuation_goal),
                    "display": False,
                    "attribution": "agent",
                },
                {
                    "type": "custom_message",
                    "id": "native-goal-continuation",
                    "parentId": None,
                    "timestamp": timestamp,
                    "customType": "goal-continuation",
                    "content": omp_session.render_goal_continuation(objective, continuation_goal),
                    "display": False,
                    "attribution": "agent",
                },
            ]

        continued_session = mutate_session(session_raw, add_native_continuation)
        continued_projection = verify(continued_session)
        check(
            continued_projection["final_text"] == final_text
            and continued_projection["goal_context_count"] == 2
            and continued_projection["native_continuation_count"] == 1,
            "one native Goal continuation positive",
        ); checks += 1

        def remove_continuation_context(rows: list[dict[str, object]]) -> None:
            add_native_continuation(rows)
            contexts = [
                row
                for row in rows
                if row.get("type") == "custom_message" and row.get("customType") == "goal-mode-context"
            ]
            rows.remove(contexts[-1])

        expect_failure(
            lambda: verify(mutate_session(session_raw, remove_continuation_context)),
            "native continuation missing its Goal context",
        ); checks += 1

        def corrupt_continuation_context(rows: list[dict[str, object]]) -> None:
            add_native_continuation(rows)
            contexts = [
                row
                for row in rows
                if row.get("type") == "custom_message" and row.get("customType") == "goal-mode-context"
            ]
            contexts[-1]["content"] = final_text + "\n" + str(contexts[-1]["content"])

        expect_failure(
            lambda: verify(mutate_session(session_raw, corrupt_continuation_context)),
            "native continuation Goal context answer leakage",
        ); checks += 1

        def relabel_continuation_as_context(rows: list[dict[str, object]]) -> None:
            add_native_continuation(rows)
            next(
                row
                for row in rows
                if row.get("type") == "custom_message" and row.get("customType") == "goal-continuation"
            )["customType"] = "goal-mode-context"

        expect_failure(
            lambda: verify(mutate_session(session_raw, relabel_continuation_as_context)),
            "native continuation relabeled as Goal context",
        ); checks += 1

        def invert_continuation_accounting_order(rows: list[dict[str, object]]) -> None:
            add_native_continuation(rows)
            assistant_index = next(
                index
                for index, row in enumerate(rows)
                if row.get("type") == "message" and row.get("id") == "native-continuation-source"
            )
            accounting_index = next(
                index
                for index, row in enumerate(rows)
                if row.get("type") == "mode_change" and row.get("id") == "native-goal-accounting"
            )
            rows[assistant_index], rows[accounting_index] = rows[accounting_index], rows[assistant_index]

        expect_failure(
            lambda: verify(mutate_session(session_raw, invert_continuation_accounting_order)),
            "native continuation accounting before intermediate assistant",
        ); checks += 1

        def corrupt_continuation(rows: list[dict[str, object]]) -> None:
            add_native_continuation(rows)
            continuation = next(
                row
                for row in rows
                if row.get("type") == "custom_message" and row.get("customType") == "goal-continuation"
            )
            continuation["content"] = continuation["content"].replace(
                omp_session.escape_xml_text(objective), "different objective"
            )

        expect_failure(lambda: verify(mutate_session(session_raw, corrupt_continuation)), "foreign native continuation objective"); checks += 1

        def leak_into_continuation(rows: list[dict[str, object]]) -> None:
            add_native_continuation(rows)
            continuation = next(
                row
                for row in rows
                if row.get("type") == "custom_message" and row.get("customType") == "goal-continuation"
            )
            continuation["content"] = final_text + "\n" + continuation["content"]

        expect_failure(lambda: verify(mutate_session(session_raw, leak_into_continuation)), "native continuation answer leakage"); checks += 1

        def corrupt_intermediate_goal(rows: list[dict[str, object]]) -> None:
            add_native_continuation(rows)
            active_states = [
                row["data"]["goal"]
                for row in rows
                if row.get("type") == "mode_change"
                and row.get("mode") == "goal"
                and row.get("data", {}).get("goal", {}).get("status") == "active"
            ]
            active_states[-1]["createdAt"] = 0
            active_states[-1]["tokensUsed"] = -99

        expect_failure(lambda: verify(mutate_session(session_raw, corrupt_intermediate_goal)), "corrupt intermediate Goal state"); checks += 1

        def regress_goal_accounting(rows: list[dict[str, object]]) -> None:
            add_native_continuation(rows)
            active_states = [
                row["data"]["goal"]
                for row in rows
                if row.get("type") == "mode_change"
                and row.get("mode") == "goal"
                and row.get("data", {}).get("goal", {}).get("status") == "active"
            ]
            active_states[0]["tokensUsed"] = 200

        expect_failure(lambda: verify(mutate_session(session_raw, regress_goal_accounting)), "regressed Goal accounting"); checks += 1
        check(verify(mutate_session(session_raw, lambda rows: rows.pop()), require_exit=False)["final_text"] == final_text, "pre-exit session positive"); checks += 1
        expect_failure(lambda: verify(mutate_session(session_raw, lambda rows: rows.pop())), "missing terminal session exit"); checks += 1

        def rename_goal_call(rows: list[dict[str, object]]) -> None:
            call = next(
                block
                for row in rows
                if row.get("type") == "message" and row.get("message", {}).get("role") == "assistant"
                for block in row["message"]["content"]
                if block.get("type") == "toolCall"
            )
            call["name"] = "read"

        expect_failure(lambda: verify(mutate_session(session_raw, rename_goal_call)), "ordinary tool substitution"); checks += 1

        def duplicate_user(rows: list[dict[str, object]]) -> None:
            original = next(row for row in rows if row.get("type") == "message" and row.get("message", {}).get("role") == "user")
            duplicate = copy.deepcopy(original)
            duplicate["id"] = "duplicate-user-entry"
            duplicate["timestamp"] = rows[-1]["timestamp"]
            rows.append(duplicate)

        expect_failure(lambda: verify(mutate_session(session_raw, duplicate_user)), "duplicate external user"); checks += 1

        def wrong_goal_id(rows: list[dict[str, object]]) -> None:
            completes = [
                row
                for row in rows
                if row.get("type") == "mode_change"
                and row.get("mode") == "goal"
                and row.get("data", {}).get("goal", {}).get("status") == "complete"
            ]
            completes[0]["data"]["goal"]["id"] = "wrong-goal"

        expect_failure(lambda: verify(mutate_session(session_raw, wrong_goal_id)), "Goal identity mismatch"); checks += 1

        def reactivate_after_complete(rows: list[dict[str, object]]) -> None:
            active = copy.deepcopy(
                next(
                    row
                    for row in rows
                    if row.get("type") == "mode_change"
                    and row.get("mode") == "goal"
                    and row.get("data", {}).get("goal", {}).get("status") == "active"
                )
            )
            active["id"] = "reactivated-after-complete"
            none_index = next(index for index, row in enumerate(rows) if row.get("type") == "mode_change" and row.get("mode") == "none")
            active["timestamp"] = rows[none_index]["timestamp"]
            rows.insert(none_index, active)

        expect_failure(lambda: verify(mutate_session(session_raw, reactivate_after_complete)), "Goal reactivation after complete"); checks += 1

        def alternate_mode_after_complete(rows: list[dict[str, object]]) -> None:
            next(row for row in rows if row.get("type") == "mode_change" and row.get("mode") == "none")["mode"] = "goal_paused"

        expect_failure(lambda: verify(mutate_session(session_raw, alternate_mode_after_complete)), "alternate terminal mode"); checks += 1

        def append_after_exit(rows: list[dict[str, object]]) -> None:
            rows.append(
                {
                    "type": "service_tier_change",
                    "id": "after-terminal-exit",
                    "parentId": None,
                    "timestamp": rows[-1]["timestamp"],
                    "serviceTier": None,
                }
            )

        expect_failure(lambda: verify(mutate_session(session_raw, append_after_exit)), "entry after terminal exit"); checks += 1

        def wrong_thinking(rows: list[dict[str, object]]) -> None:
            next(row for row in rows if row.get("type") == "thinking_level_change")["thinkingLevel"] = "low"

        expect_failure(lambda: verify(mutate_session(session_raw, wrong_thinking)), "thinking effort mismatch"); checks += 1

        def relocate_after_inference(rows: list[dict[str, object]], entry_type: str) -> None:
            source_index = next(index for index, row in enumerate(rows) if row.get("type") == entry_type)
            entry = rows.pop(source_index)
            none_index = next(index for index, row in enumerate(rows) if row.get("type") == "mode_change" and row.get("mode") == "none")
            entry["timestamp"] = rows[none_index]["timestamp"]
            rows.insert(none_index, entry)

        expect_failure(
            lambda: verify(mutate_session(session_raw, lambda rows: relocate_after_inference(rows, "thinking_level_change"))),
            "thinking receipt after inference",
        ); checks += 1
        expect_failure(
            lambda: verify(mutate_session(session_raw, lambda rows: relocate_after_inference(rows, "model_change"))),
            "model receipt after inference",
        ); checks += 1

        def relocate_between_continuation_inferences(rows: list[dict[str, object]], entry_type: str) -> None:
            add_native_continuation(rows)
            source_index = next(index for index, row in enumerate(rows) if row.get("type") == entry_type)
            entry = rows.pop(source_index)
            call_index = next(
                index
                for index, row in enumerate(rows)
                if row.get("type") == "message"
                and row.get("message", {}).get("role") == "assistant"
                and any(block.get("type") == "toolCall" for block in row["message"]["content"])
            )
            entry["timestamp"] = rows[call_index]["timestamp"]
            rows.insert(call_index, entry)

        expect_failure(
            lambda: verify(
                mutate_session(
                    session_raw,
                    lambda rows: relocate_between_continuation_inferences(rows, "thinking_level_change"),
                )
            ),
            "thinking receipt after first continuation inference",
        ); checks += 1
        expect_failure(
            lambda: verify(
                mutate_session(
                    session_raw,
                    lambda rows: relocate_between_continuation_inferences(rows, "model_change"),
                )
            ),
            "model receipt after first continuation inference",
        ); checks += 1

        branched = bytearray(session_raw)
        path.write_bytes(branched)
        slot = bytes(branched[: omp_session.TITLE_SLOT_BYTES])
        branch_rows = [pipeline.strict_loads(line) for line in bytes(branched[omp_session.TITLE_SLOT_BYTES :]).decode().splitlines()]
        branch_rows[-1]["parentId"] = branch_rows[-3]["id"]
        expect_failure(lambda: verify(slot + pipeline.jsonl_bytes(branch_rows)), "branched session lineage"); checks += 1

    cursor_route = matrix["ordered_routes"][1]
    cursor_raw = synthetic_cursor_aggregate_session(cursor_route, objective, final_text)
    with tempfile.TemporaryDirectory(prefix="pm-r10-cursor-aggregate-test-") as temporary:
        cursor_path = Path(temporary) / "cursor-session.jsonl"

        def verify_cursor(raw: bytes, *, provider: str = "cursor", model: str = "default", require_exit: bool = True) -> dict[str, object]:
            cursor_path.write_bytes(raw)
            return omp_session.verify_session(
                cursor_path,
                expected_cwd="/tmp/pm-r10-storage-v6-selftest",
                expected_objective=objective,
                expected_provider=provider,
                expected_model=model,
                expected_selector="cursor/default",
                expected_thinking="auto",
                require_exit=require_exit,
            )

        def verify_cursor_prefix(raw: bytes, *, selector: str = "cursor/default", thinking: str = "auto") -> dict[str, object]:
            cursor_path.write_bytes(raw)
            return omp_session.verify_submission_prefix(
                cursor_path,
                expected_cwd="/tmp/pm-r10-storage-v6-selftest",
                expected_objective=objective,
                expected_selector=selector,
                expected_thinking=thinking,
            )

        cursor_prefix = verify_cursor_prefix(cursor_raw)
        check(cursor_prefix["thinking_receipt_count"] == 0, "Cursor auto prefix permits omitted thinking receipt"); checks += 1
        cursor_projection = verify_cursor(cursor_raw)
        check(
            cursor_projection["assistant_lifecycle_shape"] == "cursor_aggregate"
            and cursor_projection["assistant_message_count"] == 1
            and cursor_projection["thinking_receipt_count"] == 0
            and cursor_projection["ordinary_tool_calls"] == 0,
            "Cursor aggregate Goal positive",
        ); checks += 1
        check(verify_matrix.terminal_result(cursor_projection["final_text"]) == oracle, "Cursor aggregate exact result"); checks += 1

        def move_cursor_result_before_goal(rows: list[dict[str, object]]) -> None:
            aggregate = next(row["message"] for row in rows if row.get("type") == "message" and row.get("message", {}).get("role") == "assistant")
            call_index = next(index for index, block in enumerate(aggregate["content"]) if block.get("type") == "toolCall")
            pre_text = next(block for block in aggregate["content"][:call_index] if block.get("type") == "text")
            post_text = next(block for block in aggregate["content"][call_index + 1 :] if block.get("type") == "text")
            pre_text["text"] = final_text
            post_text["text"] = "\n"

        expect_failure(
            lambda: verify_cursor(mutate_session(cursor_raw, move_cursor_result_before_goal)),
            "Cursor result before Goal call",
        ); checks += 1

        def remove_thinking(rows: list[dict[str, object]]) -> None:
            rows[:] = [row for row in rows if row.get("type") != "thinking_level_change"]

        ox_without_thinking = mutate_session(session_raw, remove_thinking)
        def verify_ox_without_thinking() -> dict[str, object]:
            cursor_path.write_bytes(ox_without_thinking)
            return omp_session.verify_submission_prefix(
                cursor_path,
                expected_cwd="/tmp/pm-r10-storage-v6-selftest",
                expected_objective=objective,
                expected_selector=first_route["model"],
                expected_thinking=first_route["thinking"],
            )

        expect_failure(verify_ox_without_thinking, "missing thinking remains forbidden outside Cursor auto"); checks += 1

        def add_foreign_thinking(rows: list[dict[str, object]]) -> None:
            active_index = next(index for index, row in enumerate(rows) if row.get("type") == "mode_change" and row.get("mode") == "goal")
            rows.insert(
                active_index,
                {
                    "type": "thinking_level_change",
                    "id": "cursor-foreign-thinking",
                    "parentId": None,
                    "timestamp": rows[active_index - 1]["timestamp"],
                    "thinkingLevel": "max",
                    "configured": "max",
                },
            )

        expect_failure(lambda: verify_cursor_prefix(mutate_session(cursor_raw, add_foreign_thinking)), "Cursor foreign thinking receipt"); checks += 1

        def add_late_auto_thinking(rows: list[dict[str, object]]) -> None:
            aggregate_index = next(
                index
                for index, row in enumerate(rows)
                if row.get("type") == "message" and row.get("message", {}).get("role") == "assistant"
            )
            rows.insert(
                aggregate_index,
                {
                    "type": "thinking_level_change",
                    "id": "cursor-late-auto-thinking",
                    "parentId": None,
                    "timestamp": rows[aggregate_index - 1]["timestamp"],
                    "thinkingLevel": "max",
                    "configured": "auto",
                },
            )

        expect_failure(lambda: verify_cursor(mutate_session(cursor_raw, add_late_auto_thinking)), "Cursor late auto thinking receipt"); checks += 1

        def add_late_cursor_model(rows: list[dict[str, object]]) -> None:
            original = next(row for row in rows if row.get("type") == "model_change")
            duplicate = copy.deepcopy(original)
            duplicate["id"] = "cursor-late-model"
            aggregate_index = next(
                index
                for index, row in enumerate(rows)
                if row.get("type") == "message" and row.get("message", {}).get("role") == "assistant"
            )
            duplicate["timestamp"] = rows[aggregate_index - 1]["timestamp"]
            rows.insert(aggregate_index, duplicate)

        expect_failure(lambda: verify_cursor(mutate_session(cursor_raw, add_late_cursor_model)), "Cursor late model receipt"); checks += 1

        def wrong_cursor_api(rows: list[dict[str, object]]) -> None:
            next(row["message"] for row in rows if row.get("type") == "message" and row.get("message", {}).get("role") == "assistant")["api"] = "foreign-agent"

        expect_failure(lambda: verify_cursor(mutate_session(cursor_raw, wrong_cursor_api)), "Cursor aggregate API mismatch"); checks += 1
        expect_failure(lambda: verify_cursor(cursor_raw, provider="opencode-go", model="default"), "Cursor aggregate provider mismatch"); checks += 1

        def ordinary_cursor_tool(rows: list[dict[str, object]]) -> None:
            call = next(
                block
                for row in rows
                if row.get("type") == "message" and row.get("message", {}).get("role") == "assistant"
                for block in row["message"]["content"]
                if block.get("type") == "toolCall"
            )
            call["name"] = "read"

        expect_failure(lambda: verify_cursor(mutate_session(cursor_raw, ordinary_cursor_tool)), "Cursor ordinary tool substitution"); checks += 1

        def mismatch_cursor_result(rows: list[dict[str, object]]) -> None:
            next(row["message"] for row in rows if row.get("type") == "message" and row.get("message", {}).get("role") == "toolResult")["toolCallId"] = "foreign-call"

        expect_failure(lambda: verify_cursor(mutate_session(cursor_raw, mismatch_cursor_result)), "Cursor Goal result mismatch"); checks += 1

        def duplicate_cursor_assistant(rows: list[dict[str, object]]) -> None:
            aggregate = next(row for row in rows if row.get("type") == "message" and row.get("message", {}).get("role") == "assistant")
            duplicate = copy.deepcopy(aggregate)
            duplicate["id"] = "duplicate-cursor-assistant"
            result_index = next(index for index, row in enumerate(rows) if row.get("type") == "message" and row.get("message", {}).get("role") == "toolResult")
            rows.insert(result_index, duplicate)

        expect_failure(lambda: verify_cursor(mutate_session(cursor_raw, duplicate_cursor_assistant)), "Cursor extra assistant"); checks += 1

        def duplicate_cursor_result_line(rows: list[dict[str, object]]) -> None:
            aggregate = next(row["message"] for row in rows if row.get("type") == "message" and row.get("message", {}).get("role") == "assistant")
            aggregate["content"][-1]["text"] = final_text + "\n" + pipeline.RESULT_PREFIX + pipeline.ORACLE_PATH.read_text().strip()

        duplicate_result_projection = verify_cursor(mutate_session(cursor_raw, duplicate_cursor_result_line))
        expect_failure(lambda: verify_matrix.terminal_result(duplicate_result_projection["final_text"]), "Cursor duplicate terminal result"); checks += 1

        def abnormal_cursor_exit(rows: list[dict[str, object]]) -> None:
            exit_row = next(row for row in rows if row.get("type") == "custom" and row.get("customType") == "session_exit")
            exit_row["data"] = {"reason": "sigterm", "kind": "signal", "recordedAt": exit_row["timestamp"]}

        expect_failure(lambda: verify_cursor(mutate_session(cursor_raw, abnormal_cursor_exit)), "Cursor abnormal exit"); checks += 1

    check(oracle["blocker_codes"] == ["canonical_node_readiness_artifact_stale", "pnc019_runtime_certification_incomplete"], "blocker order"); checks += 1
    check(oracle["no_worknodes_created"] is True, "stop boundary"); checks += 1
    print(pipeline.canonical_json({"status": "PASS", "checks": checks, "subject_calls": 0, "qualification_credit": 0}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
