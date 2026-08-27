#!/usr/bin/env python3
"""Zero-subject tests for the immutable-input MiMo normalized canary V3."""
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
from unittest import mock

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
    check(report["status"] == "PASS_LOCAL_MIMO_NORMALIZED_CANARY_V3_PRELAUNCH" and report["subject_calls"] == report["qualification_credit"] == 0, "static zero-subject prelaunch")
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
    receipt = "tests/agent_packet_restrictions/successor_20260813/r10_simple_goal_prompts_v1/STORAGE_MIMO_NORMALIZED_CANARY_V2_PRELAUNCH_FAILURE_REVIEW.json"
    owned = {receipt, *((c.HERE / name).relative_to(c.REPO).as_posix() for name in c.SOURCES)}
    status = c.run_git("status", "--porcelain=v1", "-z", "--untracked-files=all", "--", *sorted(owned))
    changed = {item[3:] for item in status.stdout.split("\0") if item}
    check(status.returncode == 0 and changed in (set(), owned) and all(not path.startswith("Plans/") for path in owned), "owned diff is only V3 package plus corrected noncanonical lineage")


def snapshot_tests() -> None:
    records = c.snapshot_records()
    check(len(records) == 6097 and sum(record["bytes"] for record in records) == 286212474, "complete pinned Plans/scripts Git roster")
    lineage = c.verify_v2_lineage()
    check(lineage["evidence_and_runtime_absent"] is True and lineage["live_source_file_count"] == 5 and c.rows()[0]["attempt_id"] != c.P.load_json(c.R10 / "storage_mimo_normalized_canary_v2/canary_contract.json")["rows"][0]["attempt_id"], "V2 live/frozen source/failure/absence and V3 identity lineage")
    for field, value, label in (("commit", "0" * 40, "changed commit"), ("plans_tree_oid", "0" * 40, "changed tree OID"), ("roster_sha256", "0" * 64, "changed roster hash")):
        changed = copy.deepcopy(c.PINNED_SNAPSHOT); changed[field] = value
        with patched(PINNED_SNAPSHOT=changed, spec=lambda changed=changed: {"input_snapshot": changed}):
            rejects(c.ControllerError, c.snapshot_records, f"{label} accepted")
    original_git = c.run_git
    for mode, kind, label in (("120000", "blob", "symlink object"), ("160000", "commit", "submodule object")):
        def fake_git(*args: str, binary: bool = False, mode: str = mode, kind: str = kind):
            if args[:3] == ("ls-tree", "-rz", "-l"):
                raw = f"{mode} {kind} {'0' * 40} 1\tPlans/unsafe\0".encode()
                return c.subprocess.CompletedProcess(args, 0, raw, b"")
            return original_git(*args, binary=binary)
        with patched(run_git=fake_git):
            rejects(c.ControllerError, c.snapshot_records, f"{label} accepted")

    target = Path(c.rows()[0]["snapshot_dir"])
    check(not os.path.lexists(target), "snapshot starts absent")
    builds = lambda: {path.name for path in Path("/tmp").glob("pm-r10-snapshot-build-*")}
    before_builds = builds()
    with mock.patch.object(c.os, "replace", side_effect=PermissionError("after chmod")):
        rejects(PermissionError, lambda: c.prepare_input_snapshot(), "post-extraction replacement failure escaped cleanup")
    check(not os.path.lexists(target) and builds() == before_builds and not c.SNAPSHOT_OWNED and not os.path.lexists(c.EVIDENCE), "post-extraction/chmod failure leaves no staging, target, or evidence")
    with mock.patch.object(c, "verify_materialized_snapshot", side_effect=c.ControllerError("after replace")):
        rejects(c.ControllerError, lambda: c.prepare_input_snapshot(), "post-replace verification failure escaped cleanup")
    check(not os.path.lexists(target) and builds() == before_builds and not c.SNAPSHOT_OWNED and not os.path.lexists(c.EVIDENCE), "post-replace failure leaves no staging, target, or evidence")

    receipt = c.prepare_input_snapshot()
    try:
        check(receipt["commit"] == c.SNAPSHOT_COMMIT and receipt["live_plans_open_or_read_count"] == 0 and receipt["post_run_materialization_retained"] is False, "deterministic read-only snapshot receipt")
        live = c.REPO / "Plans/storage-plan.md"
        with tempfile.TemporaryDirectory(prefix="mimo-v3-live-plan-alias-") as raw:
            alias = Path(raw) / "alias"; alias.symlink_to(c.REPO / "Plans", target_is_directory=True)
            underlying: list[str] = []; original_lstat = c.os.lstat
            def no_live_stat(path: Any, *args: Any, **kwargs: Any):
                lexical = os.path.abspath(os.fsdecode(os.fspath(path)))
                check(not (lexical == str(c.REPO / "Plans") or lexical.startswith(str(c.REPO / "Plans") + os.sep)), "guard touched live Plan metadata")
                return original_lstat(path, *args, **kwargs)
            def trapped_open(file: Any, *_args: Any, **_kwargs: Any): underlying.append(os.fsdecode(os.fspath(file))); raise AssertionError("underlying open reached")
            with mock.patch("builtins.open", side_effect=trapped_open), mock.patch.object(c.os, "lstat", side_effect=no_live_stat):
                with c.forbid_live_plan_reads():
                    rejects(c.ControllerError, lambda: open(live, "rb"), "direct live Plan open permitted")
                    rejects(c.ControllerError, lambda: open(os.fsencode(live), "rb"), "bytes-path live Plan open permitted")
                    rejects(c.ControllerError, lambda: open(alias / "storage-plan.md", "rb"), "symlink-alias live Plan open permitted")
            check(underlying == [], "forbidden live Plan open reached underlying IO")
        old_repo, old_proxy = c.P.REPO, dict(c.PROXY.__dict__)
        result = c.PROXY.verify()
        check(result["status"] == "PASS_VERIFIED_NO_WORKNODES" and c.P.REPO == old_repo and c.PROXY.__dict__ == old_proxy, "snapshot pipeline verify succeeds without live Plans and restores state")
        with mock.patch.object(c, "ORIGINAL_PIPELINE_VERIFY", side_effect=c.P.PipelineError("synthetic")):
            rejects(c.P.PipelineError, c.PROXY.verify, "pipeline exception swallowed")
        check(c.P.REPO == old_repo and c.PROXY.__dict__ == old_proxy, "pipeline REPO/proxy restored after exception")

        regular = next(record for record in records if record["mode"] == "100644" and record["bytes"] > 0)
        path = target / regular["path"]; parent = path.parent; original = path.read_bytes()
        os.chmod(path, 0o600); path.write_bytes(original + b"x"); os.chmod(path, 0o444)
        rejects(c.ControllerError, c.verify_input_snapshot, "blob-byte mutation accepted")
        os.chmod(path, 0o600); path.write_bytes(original); os.chmod(path, 0o444)
        os.chmod(path, 0o600); rejects(c.ControllerError, c.verify_input_snapshot, "mode mutation accepted"); os.chmod(path, 0o444)
        os.chmod(parent, 0o700); path.unlink(); path.symlink_to(target / records[1]["path"]); os.chmod(parent, 0o555)
        rejects(c.ControllerError, c.verify_input_snapshot, "materialized symlink accepted")
        os.chmod(parent, 0o700); path.unlink(); path.write_bytes(original); os.chmod(path, 0o444); os.chmod(parent, 0o555)
        os.chmod(parent, 0o700); path.unlink(); os.chmod(parent, 0o555)
        rejects(c.ControllerError, c.verify_input_snapshot, "missing snapshot member accepted")
        os.chmod(parent, 0o700); path.write_bytes(original); os.chmod(path, 0o444); os.chmod(parent, 0o555)
        os.chmod(target, 0o700); extra = target / "unexpected"; extra.write_bytes(b"x"); os.chmod(extra, 0o444); os.chmod(target, 0o555)
        rejects(c.ControllerError, c.verify_input_snapshot, "extra snapshot member accepted")
        os.chmod(target, 0o700); extra.unlink(); os.chmod(target, 0o555)
        scripts, held = target / "scripts", target.with_name(target.name + "-scripts-held")
        os.chmod(target, 0o700); os.chmod(scripts, 0o700); os.replace(scripts, held); os.chmod(target, 0o555); os.chmod(held, 0o555)
        rejects(c.ControllerError, c.verify_input_snapshot, "Plan-only snapshot accepted")
        os.chmod(target, 0o700); os.chmod(held, 0o700); os.replace(held, scripts); os.chmod(scripts, 0o555); os.chmod(target, 0o555)
        digest = c.snapshot_digest(receipt)
        preflight = {"input_snapshot": receipt, "input_snapshot_sha256": digest}
        downstream = {"input_snapshot_commit": c.SNAPSHOT_COMMIT, "input_snapshot_sha256": digest}
        with patched(verify_input_snapshot=lambda: receipt):
            check(c.verify_snapshot_chain(preflight, downstream, downstream) == receipt, "snapshot receipt chain positive")
            bad = copy.deepcopy(preflight); bad["input_snapshot"]["entry_count"] -= 1
            rejects(c.ControllerError, lambda: c.verify_snapshot_chain(bad, downstream, downstream), "tampered snapshot receipt accepted")
    finally:
        if c.SNAPSHOT_OWNED:
            c.cleanup_owned_snapshot()
    check(not os.path.lexists(target), "run-finally snapshot cleanup state")
    with c.verification_snapshot() as rematerialized:
        check(Path(rematerialized["materialized_root"]).is_dir(), "standalone verification rematerializes")
    check(not os.path.lexists(target), "standalone verification cleans rematerialization")

    old_row = c.rows()[0]
    with tempfile.TemporaryDirectory(prefix="mimo-v3-presnapshot-fail-") as raw:
        root = Path(raw); row = copy.deepcopy(old_row)
        for field in ("cwd", "session_dir", "profile_dir", "snapshot_dir", *c.ENV_PATHS.values()): row[field] = str(root / field)
        events: list[str] = []
        def fail_snapshot() -> dict[str, Any]: events.append("snapshot"); raise c.ControllerError("snapshot gate")
        with patched(EVIDENCE=root / "evidence", rows=lambda: [row], validate_static=lambda **_k: {}, git_custody=lambda: {"candidate_commit": "a" * 40}, verify_prefix=lambda: {"row_count": 0}, current_runtime_preflight=lambda: {"status": "PASS_OMP_RUNTIME_18_0_7", "subject_calls": 0}, prepare_input_snapshot=fail_snapshot, forced_catalog_refresh=lambda: events.append("catalog"), SNAPSHOT_OWNED=False, SNAPSHOT_RECEIPT=None):
            with contextlib.redirect_stdout(io.StringIO()): rc = c.dispatch(["run", "1"])
        check(rc == 1 and events == ["snapshot"] and not os.path.lexists(root / "evidence") and not any(os.path.lexists(path) for path in c.runtime_paths(row)), "snapshot defect pre-reservation/no catalog/Popen/prompt/runtime mutation")


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
    def fake_prepare() -> dict[str, Any]:
        c.SNAPSHOT_RECEIPT = {"synthetic": True}
        return c.SNAPSHOT_RECEIPT
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
        with patched(EVIDENCE=root / "evidence", rows=lambda: [row], validate_static=lambda **_k: {}, git_custody=lambda: {"candidate_commit": "a" * 40}, current_runtime_preflight=lambda: {"status": "PASS_OMP_RUNTIME_18_0_7", "subject_calls": 0}, prepare_input_snapshot=fake_prepare, SNAPSHOT_OWNED=False, SNAPSHOT_RECEIPT=None, verify_prefix=prefix, BINDINGS=bindings, preserve_failure=lambda _row: events.append("preserve")):
            before = None
            with contextlib.redirect_stdout(io.StringIO()): rc = c.dispatch(["run", "1", "--max-seconds", "3600"])
            terminal = (c.row_dir() / "terminal.json").read_bytes()
            check(rc == 1 and events == [] and b'"status": "PASS"' in terminal and not (c.row_dir() / "postfailure_session.raw.jsonl").exists(), "post-PASS verifier fault cannot preserve or record failure")
    with tempfile.TemporaryDirectory(prefix="mimo-v2-preterminal-") as raw:
        root = Path(raw); row = copy.deepcopy(old_row); row.update({"cwd": str(root / "cwd"), "session_dir": str(root / "session")}); events = []
        def fail_run(*_args: Any) -> None: c.row_dir().mkdir(parents=True); raise c.base.RunnerError("preterminal")
        def record(*_args: Any) -> None: events.append("record")
        bindings = tuple((module, name, fail_run if module is c.base and name == "run_row" else record if module is c.base and name == "record_failure" else value) for module, name, value in (*old_bindings, (c.base, "record_failure", c.base.record_failure)))
        with patched(EVIDENCE=root / "evidence", rows=lambda: [row], validate_static=lambda **_k: {}, git_custody=lambda: {"candidate_commit": "a" * 40}, current_runtime_preflight=lambda: {"status": "PASS_OMP_RUNTIME_18_0_7", "subject_calls": 0}, prepare_input_snapshot=fake_prepare, SNAPSHOT_OWNED=False, SNAPSHOT_RECEIPT=None, verify_prefix=lambda: {"row_count": 0}, BINDINGS=bindings, preserve_failure=lambda _row: events.append("preserve")):
            with contextlib.redirect_stdout(io.StringIO()): rc = c.dispatch(["run", "1"])
            check(rc == 1 and events == ["preserve", "record"], "genuine pre-terminal claim preserves then terminalizes")


def main() -> None:
    static_tests()
    snapshot_tests()
    normalizer_tests()
    catalog_tests()
    composer_and_profile_tests()
    retry_and_settling_tests()
    binding_and_failure_tests()
    check(not list(c.HERE.rglob("*.pyc")) and not list(c.HERE.rglob("__pycache__")), "no cache residue")
    print(c.P.canonical_json({"status": "PASS_ZERO_SUBJECT_SELFTEST", "checks": CHECKS, "subject_calls": 0, "qualification_credit": 0}))


if __name__ == "__main__":
    main()
