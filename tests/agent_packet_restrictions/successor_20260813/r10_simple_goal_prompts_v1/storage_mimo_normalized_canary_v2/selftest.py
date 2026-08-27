#!/usr/bin/env python3
"""Zero-subject tests for the current-runtime MiMo normalized canary V2."""
from __future__ import annotations

import ast
import contextlib
import copy
import io
import json
import os
import tempfile
from pathlib import Path
from typing import Any, Callable

import controller as c

CHECKS = 0


def check(value: bool, label: str) -> None:
    global CHECKS
    if not value:
        raise AssertionError(label)
    CHECKS += 1


def rejects(error: type[BaseException] | tuple[type[BaseException], ...], call: Callable[[], Any], label: str) -> None:
    global CHECKS
    try:
        call()
    except error:
        CHECKS += 1
        return
    raise AssertionError(label)


@contextlib.contextmanager
def patched(**values: Any):
    saved = {name: getattr(c, name) for name in values}
    try:
        for name, value in values.items():
            setattr(c, name, value)
        yield
    finally:
        for name, value in saved.items():
            setattr(c, name, value)


def static_tests() -> None:
    for name in ("controller.py", "result_normalizer.py", "selftest.py"):
        ast.parse((c.HERE / name).read_text())
        check(True, f"AST {name}")
    report = c.validate_static(unused=True)
    check(report["status"] == "PASS_LOCAL_MIMO_NORMALIZED_CANARY_V2_PRELAUNCH" and report["subject_calls"] == report["qualification_credit"] == 0, "static zero-subject prelaunch")
    check(report["runtime_preflight"]["status"] == "PASS_OMP_RUNTIME_18_0_7" and set(report["runtime_preflight"]["effective_config"]) == set(c.spec()["runtime"]["effective_config"]), "full current runtime config")
    check(c.verify_prefix()["row_count"] == 0 and not os.path.lexists(c.EVIDENCE), "empty prefix no mutation")
    check({path.name for path in c.HERE.iterdir()} == set(c.SOURCES) and "models.yml" not in c.SOURCES, "truthful five-file package without GLM override")
    row, route = c.rows()[0], c.route_map()[c.ROUTE_ID]
    argv = c.expected_argv(route, row)
    check("--config" not in argv and "--no-extensions" in argv and argv[-4:] == ["--model", "opencode-zen/mimo-v2.5-free", "--thinking", "high"], "exact native MiMo argv")
    check(c.spec()["runtime"]["pre_submission_jsonl_required"] is False and c.spec()["verification"]["pre_submission_jsonl_required"] is False, "no pre-submit JSONL gate")
    objective = c.spec()["governance_goal_receipt"]
    check(objective["updated_at"] == 1787861158 and objective["tokens_used_observation"] == 1562040 and objective["token_usage_is_semantic_authority"] is False, "current re-anchor receipt")
    correction = c.spec()["authority"]["normalization_course_correction"]
    raw_correction = correction["text_utf8"].encode()
    check(len(raw_correction) == correction["text_utf8_bytes"] == 976 and c.P.sha256_bytes(raw_correction) == correction["text_sha256"] == "cebc005f707144a0efe7c33ae54b0971e43ef6039f3416814fc41b85928ce184", "current semantic-normalization course correction")


def normalizer_fixture() -> tuple[list[dict[str, Any]], dict[str, Any]]:
    root = c.R10 / "storage_glm53_max_normalized_canary_v6/evidence/pass_01/omp_glm53_flash_max"
    session = root / "session.raw.jsonl"
    structural = c.P.load_json(root / "structural_projection.json")
    entries = [json.loads(line) for line in session.read_bytes().splitlines()]
    check(c.P.sha256_file(session) == c.P.load_json(root / "terminal.json")["formal_chain"]["records"]["session.raw.jsonl"]["sha256"], "V6 raw replay custody")
    return entries, structural


def write_session(root: Path, entries: list[dict[str, Any]]) -> Path:
    path = root / "session.jsonl"
    c.P.atomic_write(path, b"".join(c.P.canonical_json(entry).encode() + b"\n" for entry in entries))
    return path


def candidate_blocks(entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [block for entry in entries if entry.get("type") == "message" and isinstance(entry.get("message"), dict) and entry["message"].get("role") == "assistant" for block in entry["message"].get("content", []) if isinstance(block, dict) and block.get("type") == "text" and "PM_RESULT " in block.get("text", "")]


def normalize(path: Path, structural: dict[str, Any]) -> dict[str, Any]:
    return c.NORMALIZE(path, structural, oracle_path=c.V7 / "oracle.json", schema_path=c.V7 / "response.schema.json", max_text_block_utf8_bytes=c.P.load_json(c.V7 / "matrix.json")["max_final_assistant_utf8_bytes"])


def normalizer_tests() -> None:
    entries, structural = normalizer_fixture()
    oracle = c.P.load_json(c.V7 / "oracle.json")
    check(c._normalizer.typed_equal(oracle, copy.deepcopy(oracle)), "same typed value")
    reordered = {key: oracle[key] for key in reversed(tuple(oracle))}
    check(c._normalizer.typed_equal(oracle, reordered), "top-level object key order benign")
    check(c._normalizer.typed_equal({"outer": {"a": 1, "b": 2}}, {"outer": {"b": 2, "a": 1}}), "nested object key order benign")
    check(not c._normalizer.typed_equal({"items": ["a", "b"]}, {"items": ["b", "a"]}), "meaningful list order exact")
    with tempfile.TemporaryDirectory(prefix="mimo-v2-normalizer-") as raw:
        root = Path(raw)
        baseline = normalize(write_session(root, entries), structural)
        check(baseline["result_normalization"]["candidate_count"] >= 1 and baseline["final_text"] == c.P.RESULT_PREFIX + (c.V7 / "oracle.json").read_text().strip(), "durable V6 replay canonicalizes under current normalizer")
    def mutate_lines(*values: str) -> list[dict[str, Any]]:
        changed = copy.deepcopy(entries)
        block = candidate_blocks(changed)[0]
        lines = block["text"].split("\n")
        index = next(i for i, line in enumerate(lines) if line.startswith(c.P.RESULT_PREFIX))
        lines[index : index + 1] = list(values)
        block["text"] = "\n".join(lines)
        return changed
    cases: list[tuple[str, bool, str]] = []
    cases.append((c.P.RESULT_PREFIX + json.dumps(oracle, separators=(", ", ": ")), True, "inline JSON whitespace"))
    cases.append((" \tPM_RESULT\t" + json.dumps(reordered, separators=(",", ":")) + "\t ", True, "reordered keys and marker whitespace"))
    conflicting = copy.deepcopy(oracle); conflicting["plan_unit_count"] += 1
    cases.append((c.P.RESULT_PREFIX + json.dumps(conflicting, separators=(",", ":")), False, "wrong typed value"))
    cases.append((c.P.RESULT_PREFIX + "{bad", False, "malformed candidate"))
    cases.append((c.P.RESULT_PREFIX + json.dumps({**oracle, "plan_unit_count": float("nan")}, separators=(",", ":")), False, "nonfinite candidate"))
    duplicate_key = '{"schema_id":"wrong",' + json.dumps(oracle, separators=(",", ":"))[1:]
    cases.append((c.P.RESULT_PREFIX + duplicate_key, False, "duplicate JSON key"))
    missing = copy.deepcopy(oracle); missing.pop("source_match")
    cases.append((c.P.RESULT_PREFIX + json.dumps(missing, separators=(",", ":")), False, "missing field"))
    cases.append((c.P.RESULT_PREFIX + json.dumps({**oracle, "extra": 1}, separators=(",", ":")), False, "extra field"))
    cases.append((c.P.RESULT_PREFIX + json.dumps({**oracle, "plan_unit_count": "248"}, separators=(",", ":")), False, "wrong type"))
    list_reordered = copy.deepcopy(oracle); list_reordered["blocker_codes"].reverse()
    cases.append((c.P.RESULT_PREFIX + json.dumps(list_reordered, separators=(",", ":")), False, "meaningful list reordered"))
    cases.append(("PM_RESULT:" + json.dumps(oracle, separators=(",", ":")), False, "colon marker separator"))
    cases.append(("PM_RESULT", False, "bare marker"))
    cases.append(("PM_RESULT\u00a0" + json.dumps(oracle, separators=(",", ":")), False, "Unicode marker separator"))
    for index, (line, allowed, label) in enumerate(cases):
        with tempfile.TemporaryDirectory(prefix=f"mimo-v2-candidate-{index}-") as raw:
            call = lambda line=line, raw=raw: normalize(write_session(Path(raw), mutate_lines(line)), structural)
            if allowed:
                check(call()["result_normalization"]["canonical_text"] == c.P.RESULT_PREFIX + (c.V7 / "oracle.json").read_text().strip(), label)
            else:
                rejects(c._normalizer.NormalizationError, call, f"{label} accepted")
    with tempfile.TemporaryDirectory(prefix="mimo-v2-duplicate-") as raw:
        first = c.P.RESULT_PREFIX + json.dumps(oracle, separators=(", ", ": "))
        second = "\tPM_RESULT  " + json.dumps(reordered, separators=(",", ":")) + " \t"
        result = normalize(write_session(Path(raw), mutate_lines(first, second)), structural)
        check(result["result_normalization"]["candidate_count"] >= 2 and result["result_normalization"]["canonical_text"] == baseline["result_normalization"]["canonical_text"], "identical duplicate candidates canonicalize")
    with tempfile.TemporaryDirectory(prefix="mimo-v2-conflict-") as raw:
        first = c.P.RESULT_PREFIX + json.dumps(oracle, separators=(",", ":"))
        second = c.P.RESULT_PREFIX + json.dumps(conflicting, separators=(",", ":"))
        rejects(c._normalizer.NormalizationError, lambda: normalize(write_session(Path(raw), mutate_lines(first, second)), structural), "conflicting duplicate candidates accepted")
    with tempfile.TemporaryDirectory(prefix="mimo-v2-inline-prose-") as raw:
        prose = "prose mentions PM_RESULT " + json.dumps(conflicting, separators=(",", ":"))
        result = normalize(write_session(Path(raw), mutate_lines(c.P.RESULT_PREFIX + json.dumps(oracle, separators=(",", ":")), prose)), structural)
        check(result["result_normalization"]["candidate_count"] == baseline["result_normalization"]["candidate_count"], "inline prose marker ignored")
    def relocate_candidate(include: bool) -> list[dict[str, Any]]:
        changed = copy.deepcopy(entries)
        target = None
        for entry in changed:
            message = entry.get("message")
            if entry.get("type") != "message" or not isinstance(message, dict) or message.get("role") != "assistant":
                continue
            for block in message.get("content", []):
                if not isinstance(block, dict) or block.get("type") != "text":
                    continue
                lines = block["text"].split("\n")
                had_candidate = any(c._normalizer.MARKER_LIKE.match(line.strip(" \t")) for line in lines)
                block["text"] = "\n".join("candidate moved" if c._normalizer.MARKER_LIKE.match(line.strip(" \t")) else line for line in lines)
                if target is None and not had_candidate:
                    target = block
        if include:
            if target is None:
                raise AssertionError("assistant text target absent")
            target["text"] += "\n\tPM_RESULT\t" + json.dumps(reordered, separators=(",", ":")) + "\t"
        return changed
    with tempfile.TemporaryDirectory(prefix="mimo-v2-location-") as raw:
        result = normalize(write_session(Path(raw), relocate_candidate(True)), structural)
        candidates = result["result_normalization"]["candidates"]
        check(result["result_normalization"]["candidate_count"] == 1 and candidates[0]["assistant_ordinal"] == 2 and result["result_normalization"]["canonical_text"] == baseline["result_normalization"]["canonical_text"], "candidate assistant/block/line location benign")
    with tempfile.TemporaryDirectory(prefix="mimo-v2-zero-candidate-") as raw:
        rejects(c._normalizer.NormalizationError, lambda: normalize(write_session(Path(raw), relocate_candidate(False)), structural), "zero candidates accepted")


def catalog_tests() -> None:
    model = c.spec()["catalog_gate"]["expected_model"]
    raw = (c.P.canonical_json({"models": [model]}) + "\n").encode()
    projection = c.catalog_projection(raw)
    c.validate_catalog_projection(projection)
    check(projection["exact_selector_count"] == 1 and projection["model"]["thinking"] == ["low", "medium", "high"], "exact current MiMo catalog projection")
    for mutation, label in (({"models": []}, "missing selector"), ({"models": [model, model]}, "duplicate selector")):
        payload = (c.P.canonical_json(mutation) + "\n").encode()
        rejects(c.ControllerError, lambda payload=payload: c.catalog_projection(payload), f"{label} accepted")
    for field, value, label in (("cost", {"input": 1, "output": 0, "cacheRead": 0, "cacheWrite": 0}, "nonzero price"), ("reasoning", False, "reasoning false"), ("thinking", ["low", "medium"], "high absent")):
        changed = copy.deepcopy(model); changed[field] = value
        payload = (c.P.canonical_json({"models": [changed]}) + "\n").encode()
        parsed = c.catalog_projection(payload)
        rejects(c.ControllerError, lambda parsed=parsed: c.validate_catalog_projection(parsed), f"{label} accepted")


def composer_and_profile_tests() -> None:
    old_row = c.rows()[0]
    with tempfile.TemporaryDirectory(prefix="mimo-v2-profile-") as raw:
        root = Path(raw); row = copy.deepcopy(old_row)
        mapping = {"cwd": "cwd", "session_dir": "session", "profile_dir": "profile", "home_dir": "home", "xdg_config_home": "xdg-config", "xdg_cache_home": "xdg-cache", "xdg_data_home": "xdg-data", "claude_config_dir": "claude", "copilot_home": "copilot"}
        row.update({field: str(root / name) for field, name in mapping.items()})
        with patched(rows=lambda: [row]):
            seed = c.prepare_profile(); profile = Path(row["profile_dir"])
            check(seed["seed_roster"] == ["agent.db", "config.yml", "models.db"] and {path.name for path in profile.iterdir()} == set(seed["seed_roster"]), "route-local three-file profile without GLM override")
            check(all((path.stat().st_mode & 0o777) == 0o600 for path in profile.iterdir()) and all(not any(Path(row[field]).iterdir()) for field in c.ENV_PATHS.values()), "private seed/empty environment roots")
            check(c.isolated_env({"HOME": "/foreign"})["HOME"] == row["home_dir"] and c.isolated_env({})["OMP_PROFILE"] == c.isolated_env({})["PI_PROFILE"] == "default", "host profile isolated")
    old_evidence = c.EVIDENCE
    with tempfile.TemporaryDirectory(prefix="mimo-v2-composer-") as raw:
        c.EVIDENCE = Path(raw) / "evidence"; c.row_dir().mkdir(parents=True)
        c.P.atomic_write(c.row_dir() / "stdin_prompt.raw", (c.V7 / "prompts/omp.prompt.txt").read_bytes())
        before = b"startup " + c.VISIBLE_SELECTION + b" " + c.PROMPT_READY
        ready = before + " ❯ 📄 #1 /goal Audit".encode()
        pending = 0
        for snapshot in (before, before + b" redraw", before + " 📄 #1".encode(), ready):
            try:
                result = c.composer_transition(before, snapshot)
            except c.base.RunnerError:
                pending += 1
                continue
            break
        check(pending == 3 and result["prompt_ready_observed"] is True and result["visible_thinking"] == "high", "partial TUI snapshots then exact ready")
        rejects(c.PermanentCanaryError, lambda: c.composer_transition(b"startup " + c.PROMPT_READY, ready), "missing visible MiMo selection accepted")
        rejects(c.PermanentCanaryError, lambda: c.composer_transition(before + c.MCP_SENTINEL, ready + c.MCP_SENTINEL), "MCP banner accepted")
    c.EVIDENCE = old_evidence
    original, patched_code = c.ORIGINAL_RUN_ROW.__code__, c.PROMPT_READY_RUN_ROW.__code__
    check([(a, b) for a, b in zip(original.co_consts, patched_code.co_consts, strict=True) if a != b] == [(c.MCP_SENTINEL, c.PROMPT_READY)] and original.co_code == patched_code.co_code, "literal-only runner readiness clone")


def retry_and_settling_tests() -> None:
    retry = c.R10 / "storage_mimo_normalized_canary_v1/evidence/pass_01/omp_mimo_v25_free_high/postfailure_session.raw.jsonl"
    rejects(c.PermanentCanaryError, lambda: c.session_health(retry), "durable MiMo retryRecovery not fail-fast")
    entries, _structural = normalizer_fixture()
    no_exit = [entry for entry in entries if not (entry.get("type") == "custom" and entry.get("customType") == "session_exit")]
    with tempfile.TemporaryDirectory(prefix="mimo-v2-settling-") as raw:
        check(c.session_health(write_session(Path(raw), no_exit)) is False, "completed-looking prefix stays transient without explicit exit")


def binding_and_failure_tests() -> None:
    originals = [(module, name, getattr(module, name)) for module, name, _value in c.BINDINGS]
    with c.installed():
        check(all(getattr(module, name) is value for module, name, value in c.BINDINGS), "bindings installed")
    check(all(getattr(module, name) is value for module, name, value in originals), "bindings restored")
    old_row, old_bindings = c.rows()[0], c.BINDINGS
    with tempfile.TemporaryDirectory(prefix="mimo-v2-postpass-") as raw:
        root = Path(raw); row = copy.deepcopy(old_row); row.update({"cwd": str(root / "cwd"), "session_dir": str(root / "session")})
        events: list[str] = []
        def fake_run(*_args: Any) -> dict[str, Any]:
            c.row_dir().mkdir(parents=True); c.P.atomic_write(c.row_dir() / "terminal.json", c.P.pretty_json({"status": "PASS", "evidence": [{"path": "closed", "bytes": 1, "sha256": "x"}]})); return {"status": "PASS"}
        def no_record(*_args: Any) -> None: events.append("record")
        sequence = iter(({"row_count": 0}, c.ControllerError("post-PASS prefix fault")))
        def prefix() -> dict[str, Any]:
            value = next(sequence)
            if isinstance(value, BaseException): raise value
            return value
        bindings = tuple((module, name, fake_run if module is c.base and name == "run_row" else no_record if module is c.base and name == "record_failure" else value) for module, name, value in (*old_bindings, (c.base, "record_failure", c.base.record_failure)))
        with patched(EVIDENCE=root / "evidence", rows=lambda: [row], validate_static=lambda **_k: {}, git_custody=lambda: {"candidate_commit": "a" * 40}, current_runtime_preflight=lambda: {"status": "PASS_OMP_RUNTIME_18_0_7", "subject_calls": 0}, verify_prefix=prefix, BINDINGS=bindings, preserve_failure=lambda _row: events.append("preserve")):
            before = None
            with contextlib.redirect_stdout(io.StringIO()): rc = c.dispatch(["run", "1", "--max-seconds", "3600"])
            terminal = (c.row_dir() / "terminal.json").read_bytes()
            check(rc == 1 and events == [] and b'"status": "PASS"' in terminal and not (c.row_dir() / "postfailure_session.raw.jsonl").exists(), "post-PASS verifier fault cannot preserve or record failure")
    with tempfile.TemporaryDirectory(prefix="mimo-v2-preterminal-") as raw:
        root = Path(raw); row = copy.deepcopy(old_row); row.update({"cwd": str(root / "cwd"), "session_dir": str(root / "session")}); events = []
        def fail_run(*_args: Any) -> None: c.row_dir().mkdir(parents=True); raise c.base.RunnerError("preterminal")
        def record(*_args: Any) -> None: events.append("record")
        bindings = tuple((module, name, fail_run if module is c.base and name == "run_row" else record if module is c.base and name == "record_failure" else value) for module, name, value in (*old_bindings, (c.base, "record_failure", c.base.record_failure)))
        with patched(EVIDENCE=root / "evidence", rows=lambda: [row], validate_static=lambda **_k: {}, git_custody=lambda: {"candidate_commit": "a" * 40}, current_runtime_preflight=lambda: {"status": "PASS_OMP_RUNTIME_18_0_7", "subject_calls": 0}, verify_prefix=lambda: {"row_count": 0}, BINDINGS=bindings, preserve_failure=lambda _row: events.append("preserve")):
            with contextlib.redirect_stdout(io.StringIO()): rc = c.dispatch(["run", "1"])
            check(rc == 1 and events == ["preserve", "record"], "genuine pre-terminal claim preserves then terminalizes")


def main() -> None:
    static_tests()
    normalizer_tests()
    catalog_tests()
    composer_and_profile_tests()
    retry_and_settling_tests()
    binding_and_failure_tests()
    check(not list(c.HERE.rglob("*.pyc")) and not list(c.HERE.rglob("__pycache__")), "no cache residue")
    print(c.P.canonical_json({"status": "PASS_ZERO_SUBJECT_SELFTEST", "checks": CHECKS, "subject_calls": 0, "qualification_credit": 0}))


if __name__ == "__main__":
    main()
