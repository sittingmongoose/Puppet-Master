#!/usr/bin/env python3
"""Zero-subject regression suite for the formal GLM53/max normalized canary."""
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


def v5_replay() -> tuple[dict[str, Any], Path]:
    frozen = c.spec()["v5_zero_subject_replay"]
    root = Path(frozen["artifact_root"])
    for key, name in (("session", "session.raw.jsonl"), ("structural_projection", "structural_projection.json"), ("normalized_projection", "normalized_projection.json"), ("terminal", "terminal.json"), ("transcript", "transcript.raw")):
        path, expected = root / name, frozen[key]
        check(path.is_file() and not path.is_symlink(), f"V5 {name} regular")
        check(path.stat().st_size == expected["bytes"] and c.P.sha256_file(path) == expected["sha256"], f"V5 {name} frozen")
    prompt = (c.V7 / "prompts/omp.prompt.txt").read_bytes()
    check(c.session_health(root / "session.raw.jsonl"), "V5 terminal health including mode-none row")
    structural = c.ORIGINAL_SESSION(root / "session.raw.jsonl", expected_cwd=str(root / "cwd"), expected_objective=prompt[len(b"/goal "):].decode(), expected_provider="opencode-go", expected_model="glm-5.3-flash", expected_selector="opencode-go/glm-5.3-flash", expected_thinking="max", require_exit=True)
    check(structural == c.P.load_json(root / "structural_projection.json"), "V5 structural replay")
    normalized = c.NORMALIZE(root / "session.raw.jsonl", structural, oracle_path=c.V7 / "oracle.json", schema_path=c.V7 / "response.schema.json", max_text_block_utf8_bytes=4096)
    check(normalized == c.P.load_json(root / "normalized_projection.json"), "V5 normalizer replay")
    c.base.exact_result(normalized["final_text"]); check(normalized["result_normalization"]["candidate_count"] == 1, "V5 unchanged scorer")
    lines = (root / "session.raw.jsonl").read_bytes().splitlines(keepends=True); partial: list[bytes] = []
    for line in lines:
        partial.append(line); value = json.loads(line); goal = value.get("data", {}).get("goal") if isinstance(value.get("data"), dict) else None
        if isinstance(goal, dict) and goal.get("status") == "complete": break
    with tempfile.TemporaryDirectory(prefix="glm53-max-partial-") as raw:
        pending = Path(raw) / "session.jsonl"; c.P.atomic_write(pending, b"".join(partial)); check(c.session_health(pending) is False, "Goal-complete prefix remains pending until terminal assistant")
    active: list[bytes] = []
    for line in lines:
        value = json.loads(line); message = value.get("message") if value.get("type") == "message" else None
        if isinstance(message, dict) and message.get("role") == "assistant": message["stopReason"] = "stop"; line = c.P.canonical_json(value).encode() + b"\n"; active.append(line); break
        active.append(line)
    with tempfile.TemporaryDirectory(prefix="glm53-max-active-") as raw:
        pending = Path(raw) / "session.jsonl"; c.P.atomic_write(pending, b"".join(active)); check(c.session_health(pending) is False, "text-only stop with active Goal remains pending")
    for index, line in enumerate(lines):
        value = json.loads(line); message = value.get("message") if value.get("type") == "message" else None
        if isinstance(message, dict) and message.get("role") == "assistant": message["retryRecovery"] = {"attempt":1}; lines[index] = c.P.canonical_json(value).encode() + b"\n"; break
    with tempfile.TemporaryDirectory(prefix="glm53-max-retry-") as raw:
        mutated = Path(raw) / "session.jsonl"; c.P.atomic_write(mutated, b"".join(lines)); rejects(c.PermanentCanaryError, lambda: c.session_health(mutated), "retryRecovery did not fail fast")
    return structural, root / "cwd"


def request_tests(structural: dict[str, Any], private: Path) -> None:
    old_evidence = c.EVIDENCE; temporary = tempfile.TemporaryDirectory(prefix="glm53-max-http-"); c.EVIDENCE = Path(temporary.name) / "evidence"; c.row_dir().mkdir(parents=True); c.P.atomic_write(c.row_dir() / "normalized_projection.json", (private.parent / "normalized_projection.json").read_bytes())
    requests = [private / f"rr-session-{index}.json" for index in (1, 2)]
    safe = [c.safe_request(path) for path in requests]
    check(all(item["model"] == "glm-5.3-flash" and item["reasoning_effort"] == "max" and item["tool_names"] == ["goal"] for item in safe), "two exact safe request projections")
    pairs = []
    assistants = [structural["entry_ids"]["goal_call_assistant"], structural["entry_ids"]["final_assistant"]]
    for index, request in enumerate(requests):
        pairs.append({"pair_index": index + 1, "assistant_entry_id": assistants[index], "request": safe[index], "response": c.safe_response(private / f"rr-session-{index + 1}.res.log")})
    receipt = {"schema_id":"pm.r10.storage_pipeline.http_final_receipt.v1","phase":"terminal_two_assistant_pairs","request_pair_count":2,"verified_assistant_turn_count":2,"pairs":pairs,"sensitive_material_copied":False}
    c.validate_final_http(receipt, structural, private); c.no_sensitive(receipt); check(True, "valid 2:2 receipt")
    wrong = copy.deepcopy(receipt); wrong["request_pair_count"] = 1
    rejects(c.PermanentCanaryError, lambda: c.validate_final_http(wrong, structural, private), "wrong request count accepted")
    wrong = copy.deepcopy(receipt); wrong["pairs"][0]["assistant_entry_id"] = assistants[1]
    rejects(c.PermanentCanaryError, lambda: c.validate_final_http(wrong, structural, private), "wrong request/turn pairing accepted")
    wrong = copy.deepcopy(receipt); wrong["pairs"][1]["request"]["prior_goal_result_ids"] = ["wrong-call"]
    rejects(c.PermanentCanaryError, lambda: c.validate_final_http(wrong, structural, private), "wrong request/Goal result pairing accepted")
    wrong = copy.deepcopy(receipt); wrong["pairs"][1]["request"]["reasoning_effort"] = "xhigh"
    rejects(c.PermanentCanaryError, lambda: c.validate_final_http(wrong, structural, private), "wrong effort accepted")
    rejects(c.PermanentCanaryError, lambda: c.no_sensitive({"Authorization":"Bearer secret"}), "authorization leakage accepted")
    wrong = copy.deepcopy(receipt); wrong["pairs"][1]["response"]["assistant_text_sha256"] = "0" * 64
    rejects(c.PermanentCanaryError, lambda: c.validate_final_http(wrong, structural, private), "wrong response/assistant join accepted")
    c.EVIDENCE = old_evidence; temporary.cleanup()


def path_tests() -> None:
    with tempfile.TemporaryDirectory(prefix="glm53-max-path-") as raw:
        root = Path(raw)
        for index in (1, 2):
            c.P.atomic_write(root / f"rr-session-{index}.json", b"{}\n"); c.P.atomic_write(root / f"rr-session-{index}.res.log", b"response\n")
        check(len(c.debug_entries(root)) == 4, "closed request-debug roster")
        c.P.atomic_write(root / "unexpected.txt", b"x")
        rejects(c.PermanentCanaryError, lambda: c.debug_entries(root), "path contamination accepted")
        (root / "unexpected.txt").unlink(); (root / "rr-session-2.res.log").unlink(); (root / "rr-session-2.res.log").symlink_to(root / "rr-session-1.res.log")
        rejects(c.PermanentCanaryError, lambda: c.debug_entries(root), "request-debug symlink accepted")


def completed_prefix_test(private: Path) -> None:
    old_evidence, old_rows, old_prefix = c.EVIDENCE, c.rows, c.ORIGINAL_PREFIX
    root = private.parent; projection = c.P.load_json(root / "submission_acceptance.json")["session_projection"]
    with tempfile.TemporaryDirectory(prefix="glm53-max-prefix-") as raw:
        row = copy.deepcopy(old_rows()[0]); row["cwd"] = str(Path(raw) / "cwd"); row["private_capture_dir"] = str(private); Path(row["cwd"]).mkdir(); c.EVIDENCE = Path(raw) / "evidence"; c.rows = lambda: [row]; c.ORIGINAL_PREFIX = lambda *_a, **_k: projection
        try:
            c.row_dir().mkdir(parents=True); receipt = {"schema_id":"pm.r10.storage_pipeline.http_prefix_receipt.v1","phase":"active_goal_request_1","session_id":projection["session_id"],"goal_id":projection["goal_id"],"session_prefix_bytes":projection["session_prefix_bytes"],"session_prefix_sha256":projection["session_prefix_sha256"],"request":c.safe_request(private / "rr-session-1.json"),"sensitive_material_copied":False}; c.P.atomic_write(c.row_dir() / "http_prefix_receipt.json", c.P.pretty_json(receipt))
            check(c.verify_submission_prefix(root / "session.raw.jsonl") == projection, "completed private prefix replay")
            receipt["phase"] = "overwritten"; c.P.atomic_write(c.row_dir() / "http_prefix_receipt.json", c.P.pretty_json(receipt)); rejects(c.PermanentCanaryError, lambda: c.verify_submission_prefix(root / "session.raw.jsonl"), "overwritten completed prefix accepted")
        finally: c.EVIDENCE, c.rows, c.ORIGINAL_PREFIX = old_evidence, old_rows, old_prefix


def profile_test() -> None:
    original = c.rows
    with tempfile.TemporaryDirectory(prefix="glm53-max-profile-") as raw:
        row = copy.deepcopy(original()[0]); row["profile_dir"] = str(Path(raw) / "profile"); c.rows = lambda: [row]
        try:
            c.prepare_profile(); profile = Path(row["profile_dir"])
            check({path.name for path in profile.iterdir()} == {"config.yml","agent.db","models.db","models.yml"}, "minimal disposable profile")
            check((profile / "models.yml").read_bytes() == c.MODELS_BYTES and all((path.stat().st_mode & 0o777) == 0o600 for path in profile.iterdir()), "exact private profile override")
        finally: c.rows = original


def chain_tests() -> None:
    old = c.EVIDENCE
    with tempfile.TemporaryDirectory(prefix="glm53-max-chain-") as raw:
        c.EVIDENCE = Path(raw) / "evidence"; row = c.row_dir(); row.mkdir(parents=True)
        for name in ("reservation.json", "omp_preflight.json", "session.raw.jsonl", "structural_projection.json", "normalized_projection.json", "http_final_receipt.json"):
            c.P.atomic_write(row / name, b"{}\n")
        preflight_hash = c.P.sha256_file(row / "omp_preflight.json")
        c.P.atomic_write(row / "launch.json", c.P.pretty_json({"omp_preflight_sha256":preflight_hash}))
        prefix = {"session_prefix_sha256":"a" * 64,"session_id":"s"}; c.P.atomic_write(row / "http_prefix_receipt.json", c.P.pretty_json(prefix))
        c.P.atomic_write(row / "submission_acceptance.json", c.P.pretty_json({"session_prefix":{"sha256":prefix["session_prefix_sha256"]},"session_projection":{"session_id":"s"}}))
        chain = c.formal_chain(); check(chain["ordered_paths"][0] == "reservation.json" and len(chain["records"]) == 9, "formal chain positive")
        c.P.atomic_write(row / "http_prefix_receipt.json", c.P.pretty_json({**prefix,"overwritten":True}))
        rejects(c.PermanentCanaryError, lambda: c.permanent(chain == c.formal_chain(), "immutable formal chain"), "overwritten receipt accepted")
        (row / "launch.json").unlink(); rejects(c.CanaryError, c.formal_chain, "missing launch accepted")
        c.P.atomic_write(row / "launch.json", c.P.pretty_json({"omp_preflight_sha256":"0" * 64}))
        rejects(c.PermanentCanaryError, c.formal_chain, "missing launch/preflight join accepted")
    c.EVIDENCE = old


def static_tests() -> None:
    report = c.validate_static(unused=True); check(report["status"] == "PASS_LOCAL_GLM53_MAX_NORMALIZED_CANARY" and report["subject_calls"] == 0, "static package")
    source = (c.HERE / "controller.py").read_text(); tree = ast.parse(source)
    imports = {alias.name for node in ast.walk(tree) if isinstance(node, (ast.Import, ast.ImportFrom)) for alias in node.names}
    check("sqlite3" not in imports and "models refresh" not in source.lower() and "catalog" not in source.lower(), "no catalog SQLite helper")
    check(c._normalizer.NormalizationError in c.ERRORS, "normalization failure terminalization")
    check(len(c.BINDINGS) == 14 and c.spec()["architecture_limits"]["copied_v7_body_count"] == 0, "thin imported binding surface")
    saved = [(module, name, getattr(module, name)) for module, name, _ in c.BINDINGS]
    with c.installed():
        check(all(getattr(module, name) is value for module, name, value in c.BINDINGS), "bindings installed")
        argv = c.base.expected_argv(c.route_map()[c.ROUTE_ID], c.rows()[0]); check("--config" not in argv and argv[-2:] == ["--thinking", "max"], "native max argv")
    check(all(getattr(module, name) is value for module, name, value in saved), "bindings restored")
    prompt = (c.V7 / "prompts/omp.prompt.txt").read_bytes(); transport = c.base.validate_two_phase_payloads(prompt, b"\r")
    check(transport["prompt_bytes"] == 3036 and transport["enter_bytes"] == 1, "prompt then CR")


def prelaunch_test() -> None:
    original, popen = c.git_custody, c.ORIGINAL_POPEN; calls: list[Any] = []
    def blocked() -> dict[str, Any]: raise c.CanaryError("synthetic custody failure")
    def spy(*args: Any, **kwargs: Any) -> Any: calls.append((args, kwargs)); raise AssertionError("Popen reached")
    c.git_custody, c.ORIGINAL_POPEN = blocked, spy
    try:
        with contextlib.redirect_stdout(io.StringIO()) as out: rc = c.dispatch(["run", "1", "--max-seconds", "3600"])
        check(rc == 1 and "FAIL_PRELAUNCH_NO_MUTATION" in out.getvalue() and not calls and not os.path.lexists(c.EVIDENCE), "custody failure zero subject/no reservation")
    finally: c.git_custody, c.ORIGINAL_POPEN = original, popen


def popen_proxy_test() -> None:
    original_rows, original_git, original_popen, original_custody = c.rows, c.git_custody, c.ORIGINAL_POPEN, c.DISPATCH_CUSTODY
    with tempfile.TemporaryDirectory(prefix="glm53-max-popen-") as raw:
        row = copy.deepcopy(original_rows()[0]); row.update({"cwd":str(Path(raw) / "cwd"),"profile_dir":str(Path(raw) / "profile"),"private_capture_dir":str(Path(raw) / "private")}); Path(row["cwd"]).mkdir(); calls: list[Any] = []; custody = {"candidate_commit":"a" * 40}
        def spy(argv: Any, *args: Any, **kwargs: Any) -> str: calls.append((argv, kwargs)); return "delegated"
        c.rows, c.git_custody, c.ORIGINAL_POPEN, c.DISPATCH_CUSTODY = (lambda: [row]), (lambda: custody), spy, custody
        try:
            argv = c.base.expected_argv(c.route_map()[c.ROUTE_ID], row); env = {"PI_CODING_AGENT_DIR":row["profile_dir"]}
            rejects(c.PermanentCanaryError, lambda: c.SPROXY.Popen([*argv,"--config","bad"], env=env), "wrong argv delegated")
            check(c.SPROXY.Popen(argv, env=env) == "delegated" and len(calls) == 1 and calls[0][1]["env"]["PI_REQ_DEBUG"] == "1", "one exact request-debug Popen delegate")
        finally: c.rows, c.git_custody, c.ORIGINAL_POPEN, c.DISPATCH_CUSTODY = original_rows, original_git, original_popen, original_custody


def main() -> int:
    static_tests(); structural, private = v5_replay(); request_tests(structural, private); path_tests(); completed_prefix_test(private); profile_test(); chain_tests(); prelaunch_test(); popen_proxy_test()
    check(not list(c.HERE.rglob("*.pyc")) and not list(c.HERE.rglob("__pycache__")), "no cache residue")
    print(c.P.canonical_json({"status":"PASS_ZERO_SUBJECT_SELFTEST","checks":CHECKS,"subject_calls":0,"qualification_credit":0})); return 0


if __name__ == "__main__": raise SystemExit(main())
