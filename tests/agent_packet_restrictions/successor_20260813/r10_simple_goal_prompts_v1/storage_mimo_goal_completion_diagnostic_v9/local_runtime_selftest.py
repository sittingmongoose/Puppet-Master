#!/usr/bin/env python3
"""Zero-subject unit tests for the self-contained V8 OMP runtime."""
from __future__ import annotations

import builtins
import contextlib
import copy
import json
import os
import shutil
import stat
import subprocess
import tempfile
from pathlib import Path
from typing import Any, Callable, Iterator
from unittest import mock

import dependency_bootstrap as DB
DB.materialize()
import local_runtime as L


CHECKS = 0
HERE = Path(__file__).resolve().parent
REPO = HERE.parents[4]
V7 = L.V7


def check(value: bool, label: str) -> None:
    global CHECKS
    if not value:
        raise AssertionError(label)
    CHECKS += 1


def rejects(errors: type[BaseException] | tuple[type[BaseException], ...], call: Callable[[], Any], label: str) -> None:
    global CHECKS
    try:
        call()
    except errors:
        CHECKS += 1
        return
    raise AssertionError(label)


@contextlib.contextmanager
def attributes(target: Any, **values: Any) -> Iterator[None]:
    saved = {name: getattr(target, name) for name in values}
    try:
        for name, value in values.items():
            setattr(target, name, value)
        yield
    finally:
        for name, value in saved.items():
            setattr(target, name, value)


def model() -> dict[str, Any]:
    return {
        "provider": "opencode-zen",
        "id": "mimo-v2.5-free",
        "selector": "opencode-zen/mimo-v2.5-free",
        "name": "MiMo V2.5 Free",
        "contextWindow": 262144,
        "maxTokens": 65536,
        "reasoning": True,
        "thinking": ["low", "medium", "high"],
        "input": ["text"],
        "cost": {"input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0},
    }


def row_for(root: Path) -> dict[str, Any]:
    row = {
        "ordinal": 1,
        "pass_id": "pass_01",
        "route_id": "omp_mimo_v25_free_high",
        "attempt_id": "storage-mimo-goal-completion-diagnostic-v9-pass_01-01-0123456789",
        "nonce": "0123456789abcdef0123456789abcdef",
        "cwd": str(root / "cwd"),
        "session_dir": str(root / "session"),
        "profile_dir": str(root / "profile"),
        "snapshot_dir": str(root / "snapshot"),
    }
    for key, field in L.ENV_PATHS.items():
        row[field] = str(root / key.lower().replace("_", "-"))
    return row


def runtime_for(
    root: Path,
    *,
    repo: Path = REPO,
    snapshot: dict[str, Any] = L.PINNED_SNAPSHOT,
    run_process: Callable[..., subprocess.CompletedProcess[Any]] = subprocess.run,
) -> tuple[L.LocalRuntime, dict[str, Any], dict[str, Any]]:
    root.mkdir(parents=True, exist_ok=True)
    row = row_for(root)
    source = root / "source-profile"
    binary = root / "omp"
    effective = {
        "advisor.enabled": False,
        "task.agentAdvisor": {"task": "off"},
        "goal.enabled": True,
        "goal.continuationModes": ["interactive"],
        "plan.defaultOnStartup": False,
        "memory.backend": "off",
        "autolearn.enabled": False,
        "mcp.enableProjectConfig": False,
        "tools.approvalMode": "yolo",
    }
    contract: dict[str, Any] = {
        "runtime": {
            "source_profile_dir": str(source),
            "binary": str(binary),
            "binary_bytes": 0,
            "binary_sha256": L.P.sha256_bytes(b""),
            "binary_mode": "0o755",
            "version": "18.0.7",
            "effective_config": effective,
        },
        "catalog_gate": {
            "argv": ["omp", "models", "refresh", "opencode-zen", "--force", "--json", "--no-extensions"],
            "command_timeout_seconds": 30,
            "freshness_to_popen_max_seconds": 60,
            "recognized_thinking_efforts": ["low", "medium", "high", "xhigh", "max"],
            "required_thinking_effort": "high",
            "expected_model": model(),
            "expected_assistant_api": "openai-completions",
        },
        "historic_identity_root": {"path": "unused.json", "bytes": 0, "sha256": "0" * 64},
    }
    evidence = root / "evidence"
    runtime = L.LocalRuntime(
        repo=repo,
        here=HERE,
        v7=V7,
        prompt=HERE / "prompt.txt",
        evidence=evidence,
        spec=lambda: contract,
        rows=lambda: [row],
        row_dir=lambda item=None: evidence / (item or row)["pass_id"] / (item or row)["route_id"],
        git_custody=lambda: {"candidate_commit": "a" * 40},
        snapshot=snapshot,
        snapshot_contract=lambda: snapshot,
        cleanup_prefix=str(root / "snapshot"),
        run_process=run_process,
    )
    return runtime, row, contract


def git(repo: Path, *args: str, binary: bool = False) -> Any:
    return subprocess.run(["git", "-C", str(repo), *args], check=True, capture_output=True, text=not binary).stdout


def tiny_repository(root: Path) -> tuple[Path, dict[str, Any]]:
    repo = root / "git"
    repo.mkdir()
    git(repo, "init", "-q")
    git(repo, "config", "user.email", "selftest@example.invalid")
    git(repo, "config", "user.name", "selftest")
    (repo / "Plans").mkdir()
    (repo / "scripts").mkdir()
    (repo / "Plans" / "a.txt").write_bytes(b"pinned plan\n")
    script = repo / "scripts" / "b.py"
    script.write_bytes(b"#!/usr/bin/env python3\n")
    script.chmod(0o755)
    (repo / "source_manifest.json").write_bytes(b"{}\n")
    git(repo, "add", "Plans", "scripts", "source_manifest.json")
    git(repo, "commit", "-qm", "fixture")
    commit = git(repo, "rev-parse", "HEAD").strip()
    trees: dict[str, str] = {}
    for line in git(repo, "ls-tree", commit, "--", "Plans", "scripts").splitlines():
        metadata, path = line.split("\t", 1)
        trees[path] = metadata.split()[2]
    raw = git(repo, "ls-tree", "-rz", "-l", commit, "--", "Plans", "scripts", binary=True)
    records: list[dict[str, Any]] = []
    for item in raw.split(b"\0"):
        if not item:
            continue
        metadata, encoded = item.split(b"\t", 1)
        mode, kind, oid, size = metadata.decode().split()
        records.append({"mode": mode, "type": kind, "oid": oid, "bytes": int(size), "path": encoded.decode()})
    roster = b"".join((L.P.canonical_json(record) + "\n").encode() for record in records)
    content: list[dict[str, Any]] = []
    for record in records:
        data = git(repo, "cat-file", "blob", record["oid"], binary=True)
        content.append({**record, "sha256": L.P.sha256_bytes(data)})
    content.sort(key=lambda value: value["path"].encode())
    content_raw = b"".join((L.P.canonical_json(record) + "\n").encode() for record in content)
    manifest = repo / "source_manifest.json"
    snapshot = {
        "commit": commit,
        "complete_tree_roots": ["Plans", "scripts"],
        "content_roster_jsonl_bytes": len(content_raw),
        "content_roster_sha256": L.P.sha256_bytes(content_raw),
        "entry_count": len(records),
        "git_modes": ["100644", "100755"],
        "git_types": ["blob"],
        "live_plans_open_or_read_forbidden": True,
        "materialized_directory_mode": "0555",
        "materialized_executable_file_mode": "0555",
        "materialized_regular_file_mode": "0444",
        "plans_tree_oid": trees["Plans"],
        "post_run_materialization_retained": False,
        "roster_jsonl_bytes": len(roster),
        "roster_sha256": L.P.sha256_bytes(roster),
        "scripts_tree_oid": trees["scripts"],
        "source_manifest": {"path": "source_manifest.json", "bytes": manifest.stat().st_size, "sha256": L.P.sha256_file(manifest)},
        "total_blob_bytes": sum(record["bytes"] for record in records),
        "verification_rematerializes_from_git_objects": True,
    }
    return repo, snapshot


def static_and_snapshot_tests() -> None:
    source = Path(L.__file__).read_text(encoding="utf-8")
    banned = ("storage_mimo_normalized_canary", "storage_native_matrix", "codex_app_lane", "importlib.util")
    check(all(token not in source for token in banned), "no historical controller or Codex-lane imports")
    check(set(L.__all__) >= {"LocalRuntime", "PipelineProxy", "normalize_verified_session", "typed_equal", "validate_schema"}, "stable exported interface")
    with tempfile.TemporaryDirectory(prefix="v8-object-roster-") as raw:
        runtime, _row, _contract = runtime_for(Path(raw))
        records = runtime.snapshot_records()
        check(len(records) == 6097 and sum(record["bytes"] for record in records) == 286212474, "exact pinned 6097-entry Git-object roster")
        changed = copy.deepcopy(L.PINNED_SNAPSHOT)
        changed["commit"] = "0" * 40
        runtime.snapshot = changed
        rejects(L.ControllerError, runtime.snapshot_records, "changed pinned commit accepted")

    with tempfile.TemporaryDirectory(prefix="v8-tiny-snapshot-") as raw:
        root = Path(raw)
        repo, snapshot = tiny_repository(root)
        runtime, row, _contract = runtime_for(root / "runtime", repo=repo, snapshot=snapshot)
        runtime.validate_snapshot_contract = lambda: None  # production keeps the exact 6097-entry freeze
        records = runtime.snapshot_records()
        receipt = runtime.prepare_input_snapshot()
        target = Path(row["snapshot_dir"])
        check(receipt["entry_count"] == 2 and target.is_dir() and (target.stat().st_mode & 0o777) == 0o555, "Git-object snapshot materializes read-only")
        check(runtime.verify_input_snapshot() == receipt and receipt["live_plans_open_or_read_count"] == 0, "materialized snapshot exact recheck")
        old_repo = L.P.REPO
        def verify_pipeline() -> dict[str, Any]:
            check(L.P.REPO == target and (L.P.REPO / "Plans" / "a.txt").read_bytes() == b"pinned plan\n", "pipeline receives only frozen snapshot")
            return {"status": "PASS_SYNTHETIC"}
        runtime.ORIGINAL_PIPELINE_VERIFY = verify_pipeline
        check(runtime.PROXY.verify()["status"] == "PASS_SYNTHETIC" and L.P.REPO == old_repo, "PipelineProxy success restores P.REPO")
        runtime.ORIGINAL_PIPELINE_VERIFY = lambda: (_ for _ in ()).throw(L.P.PipelineError("synthetic"))
        rejects(L.P.PipelineError, runtime.PROXY.verify, "pipeline exception swallowed")
        check(L.P.REPO == old_repo, "PipelineProxy exception restores P.REPO")
        runtime.cleanup_owned_snapshot()
        check(not os.path.lexists(target), "owned snapshot cleanup")
        with runtime.verification_snapshot() as fresh:
            check(Path(fresh["materialized_root"]).is_dir(), "standalone verification rematerializes")
        check(not os.path.lexists(target), "standalone verification cleans ephemeral snapshot")


def no_live_plan_guard_tests() -> None:
    with tempfile.TemporaryDirectory(prefix="v8-live-guard-") as raw:
        root = Path(raw)
        fake_repo = root / "repo"
        (fake_repo / "Plans").mkdir(parents=True)
        forbidden = fake_repo / "Plans" / "mutable.md"
        forbidden.write_bytes(b"never read")
        safe = fake_repo / "safe.txt"
        safe.write_bytes(b"safe")
        alias = root / "alias"
        alias.symlink_to(fake_repo / "Plans", target_is_directory=True)
        runtime, _row, _contract = runtime_for(root / "runtime", repo=fake_repo)
        reached: list[str] = []
        original = builtins.open
        def trapped(file: Any, *args: Any, **kwargs: Any) -> Any:
            reached.append(os.fsdecode(os.fspath(file)))
            return original(file, *args, **kwargs)
        with mock.patch("builtins.open", side_effect=trapped):
            with runtime.forbid_live_plan_reads():
                rejects(L.ControllerError, lambda: open(forbidden, "rb"), "direct live Plans read permitted")
                rejects(L.ControllerError, lambda: open(os.fsencode(forbidden), "rb"), "bytes live Plans read permitted")
                rejects(L.ControllerError, lambda: open(alias / "mutable.md", "rb"), "symlink alias live Plans read permitted")
                check(open(safe, "rb").read() == b"safe", "non-Plan read remains available")
        check(reached == [str(safe)], "forbidden reads stopped before underlying open")


def profile_catalog_and_runtime_tests() -> None:
    with tempfile.TemporaryDirectory(prefix="v8-profile-") as raw:
        root = Path(raw)
        runtime, row, contract = runtime_for(root)
        source = Path(contract["runtime"]["source_profile_dir"])
        source.mkdir(parents=True)
        (source / "config.yml").write_bytes(b"advisor:\n  enabled: false\ntask:\n  agentAdvisor:\n    task: off\n")
        (source / "agent.db").write_bytes(b"agent")
        (source / "models.db").write_bytes(b"models")
        receipt = runtime.prepare_profile()
        profile = Path(row["profile_dir"])
        check(receipt["seed_roster"] == ["agent.db", "config.yml", "models.db"] and {path.name for path in profile.iterdir()} == set(receipt["seed_roster"]), "truthful three-file MiMo profile")
        check(all((path.stat().st_mode & 0o777) == 0o600 for path in profile.iterdir()), "profile files mode 0600")
        environment = runtime.isolated_env({"HOME": "/foreign", "OMP_PROFILE": "hostile", "PI_PROFILE": "hostile", "PI_REQ_DEBUG": "/foreign"})
        check(environment["HOME"] == row["home_dir"] and environment["OMP_PROFILE"] == environment["PI_PROFILE"] == "default" and "PI_REQ_DEBUG" not in environment, "full environment isolation")
        check(all(not any(Path(row[field]).iterdir()) for field in L.ENV_PATHS.values()), "isolated environment roots initially empty")

    with tempfile.TemporaryDirectory(prefix="v8-catalog-") as raw:
        root = Path(raw)
        calls: list[tuple[list[str], dict[str, str]]] = []
        payload = (L.P.canonical_json({"models": [model()]}) + "\n").encode()
        def run(argv: list[str], **kwargs: Any) -> subprocess.CompletedProcess[Any]:
            calls.append((list(argv), dict(kwargs.get("env", {}))))
            return subprocess.CompletedProcess(argv, 0, payload, b"")
        runtime, row, contract = runtime_for(root, run_process=run)
        receipt = runtime.forced_catalog_refresh()
        runtime.validate_catalog_receipt(receipt, receipt["finished_at_utc"])
        check(len(calls) == 1 and calls[0][0] == contract["catalog_gate"]["argv"] and calls[0][1]["PI_CODING_AGENT_DIR"] == row["profile_dir"], "one isolated forced catalog refresh")
        for mutation, label in (({"models": []}, "missing selector"), ({"models": [model(), model()]}, "duplicate selector")):
            raw_payload = (L.P.canonical_json(mutation) + "\n").encode()
            rejects(L.ControllerError, lambda raw_payload=raw_payload: runtime.catalog_projection(raw_payload), f"{label} accepted")
        for field, value, label in (("cost", {"input": 1, "output": 0, "cacheRead": 0, "cacheWrite": 0}, "nonzero price"), ("reasoning", False, "reasoning false"), ("thinking", ["low"], "high absent")):
            changed = copy.deepcopy(model())
            changed[field] = value
            projection = runtime.catalog_projection((L.P.canonical_json({"models": [changed]}) + "\n").encode())
            rejects(L.ControllerError, lambda projection=projection: runtime.validate_catalog_projection(projection), f"{label} accepted")

    with tempfile.TemporaryDirectory(prefix="v8-runtime-") as raw:
        root = Path(raw)
        calls: list[tuple[list[str], dict[str, str]]] = []
        runtime, _row, contract = runtime_for(root)
        binary = Path(contract["runtime"]["binary"])
        binary.parent.mkdir(parents=True, exist_ok=True)
        binary.write_bytes(b"omp-18.0.7")
        binary.chmod(0o755)
        contract["runtime"].update({"binary_bytes": binary.stat().st_size, "binary_sha256": L.P.sha256_file(binary), "binary_mode": "0o755"})
        Path(contract["runtime"]["source_profile_dir"]).mkdir()
        def run(argv: list[str], **kwargs: Any) -> subprocess.CompletedProcess[Any]:
            calls.append((list(argv), dict(kwargs["env"])))
            if argv[-1] == "--version":
                return subprocess.CompletedProcess(argv, 0, "18.0.7\n", "")
            key = argv[-1]
            expected = contract["runtime"]["effective_config"][key]
            value = json.dumps(expected, separators=(",", ":")) if not isinstance(expected, str) else expected
            return subprocess.CompletedProcess(argv, 0, value + "\n", "")
        runtime.ORIGINAL_RUN = run
        with mock.patch.dict(os.environ, {"OMP_PROFILE": "hostile", "PI_PROFILE": "hostile"}, clear=False):
            report = runtime.current_runtime_preflight()
        check(report["status"] == "PASS_OMP_RUNTIME_18_0_7" and report["effective_config"] == contract["runtime"]["effective_config"], "full current runtime/config gate")
        check(all(env["OMP_PROFILE"] == env["PI_PROFILE"] == "default" for _argv, env in calls), "runtime preflight ignores hostile inherited profiles")


def argv_composer_and_raw_tests() -> None:
    with tempfile.TemporaryDirectory(prefix="v8-composer-") as raw:
        root = Path(raw)
        runtime, row, _contract = runtime_for(root)
        runtime.ORIGINAL_EXPECTED_ARGV = lambda _route, _row: ["omp", "--no-title", "--cwd", row["cwd"], "--model", "opencode-zen/mimo-v2.5-free", "--thinking", "high"]
        runtime.ORIGINAL_VERIFY_ARGV = lambda _route, cwd, session: ["omp", "--no-title", "--session-dir", session, "--cwd", cwd, "--model", "opencode-zen/mimo-v2.5-free", "--thinking", "high"]
        argv = runtime.expected_argv({}, row)
        check(argv.count("--no-extensions") == 1 and "--config" not in argv and argv.index("--no-extensions") < argv.index("--cwd"), "native argv gains only no-extensions")
        runtime.ORIGINAL_EXPECTED_ARGV = lambda _route, _row: ["omp", "--config", "bad", "--cwd", row["cwd"]]
        rejects(L.PermanentCanaryError, lambda: runtime.expected_argv({}, row), "config overlay accepted")

        prompt = root / "prompt.txt"
        prompt.write_bytes(b"Audit")
        runtime.PROMPT = prompt
        directory = runtime.row_dir()
        directory.mkdir(parents=True)
        (directory / "stdin_prompt.raw").write_bytes(b"Audit")
        before = b"startup " + runtime.VISIBLE_SELECTION + b" " + L.PROMPT_READY
        ready = before + " ❯ 📄 #1 /goal Audit".encode()
        rejects(L.base.RunnerError, lambda: runtime.composer_transition(before, before + b" redraw"), "partial composer treated terminal")
        result = runtime.composer_transition(before, ready)
        check(result["prompt_ready_observed"] is True and result["mcp_startup_finished"] is False and result["visible_thinking"] == "high", "exact zero-MCP MiMo composer transition")
        rejects(L.PermanentCanaryError, lambda: runtime.composer_transition(before + L.MCP_SENTINEL, ready + L.MCP_SENTINEL), "MCP banner accepted")
        rejects(L.PermanentCanaryError, lambda: runtime.composer_transition(before, before + " ❯ 📄 #1 /goal Audix".encode()), "wrong prompt preview accepted")

        (directory / "pre_prompt.raw").write_bytes(before)
        (directory / "composer_ack.raw").write_bytes(ready)
        L.P.atomic_write(directory / "composer_ack.json", L.P.pretty_json({"prompt_ready_observed": True, "mcp_startup_finished": False, "mcp_finished_banner_observed": False}))
        runtime.PROMPT_READY_VERIFY_OMP_RAW = lambda *_args: "ok"
        check(runtime.verify_omp_raw(directory, {}, {}, {}) == "ok", "empty-MCP raw verifier delegates after local custody")
        changed = L.P.load_json(directory / "composer_ack.json")
        changed["mcp_finished_banner_observed"] = True
        L.P.atomic_write(directory / "composer_ack.json", L.P.pretty_json(changed))
        rejects(L.PermanentCanaryError, lambda: runtime.verify_omp_raw(directory, {}, {}, {}), "foreign composer receipt accepted")

        raw_receipt = runtime.raw_record(b"exact\x00bytes")
        check(runtime.raw_bytes(raw_receipt, "fixture") == b"exact\x00bytes", "raw receipt round trip")
        raw_receipt["sha256"] = "0" * 64
        rejects(L.ControllerError, lambda: runtime.raw_bytes(raw_receipt, "fixture"), "raw hash drift accepted")


def normalization_and_session_tests() -> None:
    oracle = L.P.load_json(V7 / "oracle.json")
    reordered = {key: oracle[key] for key in reversed(tuple(oracle))}
    canonical = L.P.RESULT_PREFIX + json.dumps(reordered, separators=(",", ":"))
    entries = [{"type": "message", "id": "entry-a", "message": {"id": "assistant-a", "role": "assistant", "api": "openai-completions", "content": [{"type": "text", "text": "prose\n\t" + canonical + "\t"}]}}]
    structural = {"assistant_message_count": 1, "final_text": entries[0]["message"]["content"][0]["text"]}
    def normalize(values: list[dict[str, Any]], shape: dict[str, Any] = structural) -> dict[str, Any]:
        with mock.patch.object(L.omp_session, "load_physical_session", return_value=(None, None, values, b"raw")):
            return L.normalize_verified_session(Path("/synthetic/session.jsonl"), shape, oracle_path=V7 / "oracle.json", schema_path=V7 / "response.schema.json", max_text_block_utf8_bytes=4096)
    projection = normalize(entries)
    check(projection["result_normalization"]["candidate_count"] == 1 and projection["final_text"] == L.P.RESULT_PREFIX + (V7 / "oracle.json").read_text().strip(), "object key order/whitespace canonicalizes deterministically")
    duplicate = copy.deepcopy(entries)
    duplicate[0]["message"]["content"][0]["text"] += "\nPM_RESULT " + json.dumps(oracle, separators=(", ", ": "))
    check(normalize(duplicate)["result_normalization"]["candidate_count"] == 2, "semantically identical duplicate accepted")
    moved = copy.deepcopy(entries)
    moved[0]["message"]["content"][0]["text"] = "earlier commentary"
    moved.append({"type": "message", "id": "entry-b", "message": {"id": "assistant-b", "role": "assistant", "api": "openai-completions", "content": [{"type": "text", "text": canonical}]}})
    moved_shape = {"assistant_message_count": 2, "final_text": canonical}
    check(normalize(moved, moved_shape)["result_normalization"]["candidates"][0]["assistant_ordinal"] == 2, "candidate assistant/block location is benign")
    conflicting = copy.deepcopy(oracle)
    conflicting["plan_unit_count"] += 1
    malformed = copy.deepcopy(entries)
    malformed[0]["message"]["content"][0]["text"] = "PM_RESULT {bad"
    conflict = copy.deepcopy(entries)
    conflict[0]["message"]["content"][0]["text"] += "\nPM_RESULT " + json.dumps(conflicting, separators=(",", ":"))
    list_reordered = copy.deepcopy(oracle)
    list_reordered["blocker_codes"].reverse()
    wrong_list = copy.deepcopy(entries)
    wrong_list[0]["message"]["content"][0]["text"] = "PM_RESULT " + json.dumps(list_reordered, separators=(",", ":"))
    duplicate_key = copy.deepcopy(entries)
    duplicate_key[0]["message"]["content"][0]["text"] = 'PM_RESULT {"schema_id":"wrong",' + json.dumps(oracle, separators=(",", ":"))[1:]
    nonfinite = copy.deepcopy(entries)
    nonfinite[0]["message"]["content"][0]["text"] = "PM_RESULT " + json.dumps({**oracle, "plan_unit_count": float("nan")}, separators=(",", ":"))
    zero = copy.deepcopy(entries)
    zero[0]["message"]["content"][0]["text"] = "surrounding prose only"
    for values, label in ((malformed, "malformed"), (conflict, "conflict"), (wrong_list, "meaningful list reorder"), (duplicate_key, "duplicate key"), (nonfinite, "nonfinite"), (zero, "zero candidate")):
        rejects(L.NormalizationError, lambda values=values: normalize(values), f"{label} candidate accepted")

    with tempfile.TemporaryDirectory(prefix="v8-session-") as raw:
        root = Path(raw)
        runtime, _row, _contract = runtime_for(root)
        directory = runtime.row_dir()
        directory.mkdir(parents=True)
        active = copy.deepcopy(entries)
        exited = [*active, {"type": "custom", "customType": "session_exit"}]
        with mock.patch.object(L.omp_session, "load_physical_session", return_value=(None, None, active, b"raw")):
            check(runtime.session_health(Path("/synthetic")) is False, "active retry-free session remains transient")
        retry = copy.deepcopy(active)
        retry[0]["message"]["retryRecovery"] = {"attempt": 1}
        with mock.patch.object(L.omp_session, "load_physical_session", return_value=(None, None, retry, b"raw")):
            rejects(L.PermanentCanaryError, lambda: runtime.session_health(Path("/synthetic")), "retryRecovery accepted")
        runtime.ORIGINAL_SESSION = lambda _path, **_expected: copy.deepcopy(structural)
        runtime.NORMALIZE = lambda _path, shape, **_expected: {**shape, "normalized": True}
        with mock.patch.object(L.omp_session, "load_physical_session", return_value=(None, None, exited, b"raw")):
            result = runtime.verify_session(Path("/synthetic"), require_exit=True)
            stored = L.P.load_json(directory / "structural_projection.json")
            check(result["normalized"] is True and stored["final_text"] == structural["final_text"] and stored["assistant_api"] == "openai-completions", "structural-first normalized final receipts")
            check(runtime.verify_session(Path("/synthetic"), require_exit=True) == result, "immutable session receipts reverify")
        runtime.ORIGINAL_SESSION = lambda _path, **_expected: {**structural, "final_text": "changed"}
        with mock.patch.object(L.omp_session, "load_physical_session", return_value=(None, None, exited, b"raw")):
            rejects(L.PermanentCanaryError, lambda: runtime.verify_session(Path("/synthetic"), require_exit=True), "changed final projection overwrote receipt")
        runtime.ORIGINAL_SESSION = lambda _path, **_expected: (_ for _ in ()).throw(L.omp_session.OmpSessionError("settling"))
        with mock.patch.object(L.omp_session, "load_physical_session", return_value=(None, None, active, b"raw")):
            rejects(L.omp_session.OmpSessionError, lambda: runtime.verify_session(Path("/synthetic"), require_exit=False), "active structural error made permanent")
        with mock.patch.object(L.omp_session, "load_physical_session", return_value=(None, None, exited, b"raw")):
            rejects(L.PermanentCanaryError, lambda: runtime.verify_session(Path("/synthetic"), require_exit=True), "terminal structural error stayed transient")


def failure_and_history_tests() -> None:
    with tempfile.TemporaryDirectory(prefix="v8-failure-") as raw:
        root = Path(raw)
        runtime, row, _contract = runtime_for(root)
        directory = runtime.row_dir(row)
        before = (False, False, False)
        check(runtime.claim_after_failure(row, before) is False, "truly absent row remains unclaimed")
        runtime.EVIDENCE.mkdir()
        check(runtime.claim_after_failure(row, before) is True and runtime.row_claimed(row), "parent-only mutation safely claims consumed row")
        reservation = {"schema_id": "pm.r10.storage_pipeline.reservation.v2", **{key: row[key] for key in L.IDENTITY}}
        L.P.atomic_write(directory / "reservation.json", L.P.pretty_json(reservation))
        check(runtime.exact_reservation(row), "exact reservation identity")
        reservation["nonce"] = "wrong"
        L.P.atomic_write(directory / "reservation.json", L.P.pretty_json(reservation))
        check(not runtime.exact_reservation(row), "reservation mismatch rejects")
        session_dir = Path(row["session_dir"])
        session_dir.mkdir()
        (session_dir / "one.jsonl").write_bytes(b"raw session\n")
        runtime.preserve_failure(row)
        target = directory / "postfailure_session.raw.jsonl"
        check(target.read_bytes() == b"raw session\n", "one safe session preserved after failure")
        (session_dir / "one.jsonl").write_bytes(b"changed")
        runtime.preserve_failure(row)
        check(target.read_bytes() == b"raw session\n", "postfailure receipt never overwritten")

    with tempfile.TemporaryDirectory(prefix="v8-history-") as raw:
        root = Path(raw)
        repo = root / "repo"
        repo.mkdir()
        child = repo / "child.json"
        child.write_bytes(L.P.pretty_json({"rows": [{"attempt_id": "child"}]}))
        child_record = {"path": "child.json", "bytes": child.stat().st_size, "sha256": L.P.sha256_file(child)}
        parent = repo / "parent.json"
        parent.write_bytes(L.P.pretty_json({"rows": [{"attempt_id": "parent"}], "historic_identity_manifests": [child_record]}))
        parent_record = {"path": "parent.json", "bytes": parent.stat().st_size, "sha256": L.P.sha256_file(parent)}
        runtime, _row, contract = runtime_for(root / "runtime", repo=repo)
        contract["historic_identity_root"] = parent_record
        observed = [(path.name, value["attempt_id"]) for path, value in runtime.prior_rows()]
        check([value for _path, value in observed] == ["parent", "child"], "nested historical rows traverse once")
        child.write_bytes(b"{}\n")
        rejects(L.ControllerError, lambda: list(runtime.prior_rows()), "historical manifest drift accepted")


def main() -> None:
    static_and_snapshot_tests()
    no_live_plan_guard_tests()
    profile_catalog_and_runtime_tests()
    argv_composer_and_raw_tests()
    normalization_and_session_tests()
    failure_and_history_tests()
    check(not list(HERE.rglob("*.pyc")) and not list(HERE.rglob("__pycache__")), "no cache residue")
    print(L.P.canonical_json({"status": "PASS_LOCAL_RUNTIME_ZERO_SUBJECT", "checks": CHECKS, "subject_calls": 0}))


if __name__ == "__main__":
    try: main()
    finally: DB.cleanup()
