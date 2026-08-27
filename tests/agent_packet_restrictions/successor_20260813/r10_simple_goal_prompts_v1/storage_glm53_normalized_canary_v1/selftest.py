#!/usr/bin/env python3
"""Zero-subject GLM-5.3 tests."""
from __future__ import annotations

import contextlib
import copy
import io
import os
import sqlite3
import subprocess
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable

import controller

P, V, V7 = controller.P, controller.V, controller.V7
R10 = controller.R10
MIMO_NATIVE = R10 / "storage_mimo_native_canary_v1/evidence/pass_01/omp_mimo_v25_free_high"
MIMO_RETRY = R10 / "storage_mimo_normalized_canary_v1/evidence/pass_01/omp_mimo_v25_free_high"
OX_NATIVE = V7 / "evidence/pass_01/omp_ox_alpha_free_max"
OX_GLM = R10 / "muse_owned_glm_probe_v1/evidence/probe_01/omp_ox_alpha_free_max"
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
    provider, model = launch["model"].split("/", 1)
    return controller.verify_session(
        path,
        expected_cwd=launch["cwd"], expected_objective=OBJECTIVE,
        expected_provider=provider, expected_model=model, expected_selector=launch["model"],
        expected_thinking=launch["thinking"], require_exit=require_exit,
    )


def fixture_checks() -> int:
    freezes = (
        (MIMO_NATIVE / "postfailure_session.raw.jsonl", 51501, "16260db38f0998ddbb7c18a65724dfff954dc9655d3b62cffa9bcc00c72badf1"),
        (MIMO_RETRY / "postfailure_session.raw.jsonl", 38028, "715cf5d56a93f7ccdfa14b5cbc1f40bc10ad7d6edd7e5f30c6f8314727a5341b"),
        (OX_NATIVE / "session.raw.jsonl", 38353, "472f2f99e46a04d8ad62ee054f115a8c166f1abaeeeaaf14238d7bdd0ad0f304"),
        (OX_GLM / "postfailure_session.raw.jsonl", 34948, "1695208e98a3fd9b141110e0baadaa36eb783f76a13fbef8141a22a9893d0f9d"),
    )
    for path, size, digest in freezes:
        raw = path.read_bytes()
        check(len(raw) == size and P.sha256_bytes(raw) == digest, f"fixture freeze: {path}")
    mimo_launch = P.load_json(MIMO_NATIVE / "launch.json")
    mimo = verify(MIMO_NATIVE / "postfailure_session.raw.jsonl", mimo_launch, require_exit=False)
    check(mimo["result_normalization"]["candidate_count"] == 2, "completed MiMo normalized candidates")
    controller.base.exact_result(mimo["final_text"])
    expect(controller.omp_session.OmpSessionError, lambda: verify(MIMO_NATIVE / "postfailure_session.raw.jsonl", mimo_launch, require_exit=True), "MiMo SIGTERM remains failure", "session exit")
    ox_launch = P.load_json(OX_NATIVE / "launch.json")
    ox = verify(OX_NATIVE / "session.raw.jsonl", ox_launch, require_exit=True)
    check(ox["result_normalization"]["candidate_count"] == 1 and ox["prefix_guard"]["retryRecovery_count"] == 0, "native Ox normalized replay")
    routes = {route["id"]: route for route in P.load_json(V7 / "matrix.json")["ordered_routes"]}
    check(V.verify_row("pass_01", routes["omp_ox_alpha_free_max"])["status"] == "PASS", "unchanged V7 native verifier replay")
    retry_launch = P.load_json(MIMO_RETRY / "launch.json")
    expect(controller.PermanentPrefixError, lambda: verify(MIMO_RETRY / "postfailure_session.raw.jsonl", retry_launch, require_exit=False), "MiMo retry trace fail-fast", "retryRecovery")
    glm_launch = P.load_json(OX_GLM / "launch.json")
    expect(controller.PermanentPrefixError, lambda: verify(OX_GLM / "postfailure_session.raw.jsonl", glm_launch, require_exit=False), "owned GLM rawBlock rejected", "rawBlock")
    return len(freezes) + 7


def write_session(path: Path, source: Path, mutate: Callable[[list[dict[str, Any]]], None]) -> None:
    raw = source.read_bytes()
    _slot, header, entries, _full = controller.omp_session.load_physical_session(source)
    entries = copy.deepcopy(entries)
    mutate(entries)
    path.write_bytes(raw[: controller.omp_session.TITLE_SLOT_BYTES] + P.jsonl_bytes([header, *entries]))


def assistant_messages(entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [entry["message"] for entry in entries if entry.get("type") == "message" and isinstance(entry.get("message"), dict) and entry["message"].get("role") == "assistant"]


def retry_and_native_shape_checks() -> int:
    launch = P.load_json(MIMO_RETRY / "launch.json")
    checks = 0
    with tempfile.TemporaryDirectory(prefix="pm-r10-glm53-prefix-") as temporary:
        root = Path(temporary)
        prefix = MIMO_RETRY / "session_prefix.raw.jsonl"
        (root / "session_prefix.raw.jsonl").write_bytes(prefix.read_bytes())
        (root / "session.jsonl").write_bytes(prefix.read_bytes())
        expect(controller.omp_session.OmpSessionError, lambda: verify(root / "session.jsonl", launch, require_exit=False), "retry-free active trace stays pending", "complete Goal state")
        checks += 1

        def nullable(entries: list[dict[str, Any]]) -> None:
            message = assistant_messages(entries)[0]
            message["errorId"] = 0
            message["retryRecovery"] = None
        write_session(root / "session.jsonl", prefix, nullable)
        expect(controller.omp_session.OmpSessionError, lambda: verify(root / "session.jsonl", launch, require_exit=False), "nullable retry receipt stays pending", "complete Goal state")
        checks += 1

        def recovered(entries: list[dict[str, Any]]) -> None:
            assistant_messages(entries)[0]["retryRecovery"] = {"attempt": 1, "kind": "auto-retry"}
        write_session(root / "session.jsonl", prefix, recovered)
        expect(controller.PermanentPrefixError, lambda: verify(root / "session.jsonl", launch, require_exit=False), "one retryRecovery permanent", "retryRecovery")
        checks += 1

        def raw_block(entries: list[dict[str, Any]]) -> None:
            message = assistant_messages(entries)[0]
            message["content"].append({"type": "text", "text": "", "rawBlock": "<tool_call>"})
        write_session(root / "session.jsonl", prefix, raw_block)
        expect(controller.PermanentPrefixError, lambda: verify(root / "session.jsonl", launch, require_exit=False), "native rawBlock or accepted-prefix mutation permanent")
        checks += 1

        def bad_error_id(entries: list[dict[str, Any]]) -> None:
            assistant_messages(entries)[0]["errorId"] = "0"
        write_session(root / "session.jsonl", prefix, bad_error_id)
        expect(controller.PermanentPrefixError, lambda: verify(root / "session.jsonl", launch, require_exit=False), "errorId shape", "errorId")
        checks += 1

        (root / "session_prefix.raw.jsonl").unlink()
        expect(controller.PermanentPrefixError, lambda: verify(root / "session.jsonl", launch, require_exit=False), "missing accepted prefix", "absent")
        checks += 1
    check(not issubclass(controller.PermanentPrefixError, (controller.omp_session.OmpSessionError, controller.base.RunnerError)), "permanent prefix exception outside transient poll catches")
    return checks + 1


def target_native_fixture(api: str) -> tuple[tempfile.TemporaryDirectory[str], Path, dict[str, Any]]:
    temporary = tempfile.TemporaryDirectory(prefix="pm-r10-glm53-native-")
    root = Path(temporary.name)
    source, prefix = OX_NATIVE / "session.raw.jsonl", OX_NATIVE / "session_prefix.raw.jsonl"
    (root / "session_prefix.raw.jsonl").write_bytes(prefix.read_bytes())

    def mutate(entries: list[dict[str, Any]]) -> None:
        for entry in entries:
            if entry.get("type") == "model_change":
                entry["model"] = "opencode-go/glm-5.3-flash"
                entry["resolvedModelIsFallback"] = False
            elif entry.get("type") == "thinking_level_change":
                entry["thinkingLevel"] = "xhigh"
                entry["configured"] = "xhigh"
            message = entry.get("message") if entry.get("type") == "message" else None
            if isinstance(message, dict) and message.get("role") == "assistant":
                message["provider"] = "opencode-go"
                message["model"] = "glm-5.3-flash"
                message["api"] = api
    write_session(root / "session.jsonl", source, mutate)
    write_session(root / "session_prefix.raw.jsonl", prefix, mutate)
    launch = P.load_json(OX_NATIVE / "launch.json")
    launch.update({"model": "opencode-go/glm-5.3-flash", "thinking": "xhigh"})
    return temporary, root / "session.jsonl", launch


def api_and_normalization_checks() -> int:
    temporary, path, launch = target_native_fixture("openai-completions")
    try:
        projection = verify(path, launch, require_exit=True)
        check(projection["assistant_api"] == "openai-completions" and projection["assistant_api_message_count"] == projection["assistant_message_count"], "exact GLM-5.3 assistant API")
        controller.base.exact_result(projection["final_text"])
    finally:
        temporary.cleanup()
    temporary, path, launch = target_native_fixture("wrong-api")
    try:
        expect(controller.ControllerError, lambda: verify(path, launch, require_exit=True), "wrong assistant API", "API exact")
    finally:
        temporary.cleanup()
    checks = 3

    oracle = (V7 / "oracle.json").read_text(encoding="utf-8").strip()
    source = OX_NATIVE / "session.raw.jsonl"
    prefix = OX_NATIVE / "session_prefix.raw.jsonl"
    launch = P.load_json(OX_NATIVE / "launch.json")
    for text, accepted, label in (
        ("Harness lead\n" + P.RESULT_PREFIX + oracle + "\n" + P.RESULT_PREFIX + oracle + "\nHarness tail", True, "identical duplicates"),
        (P.RESULT_PREFIX + oracle + "\nPM_RESULT:{}", False, "marker-like invalid"),
        (P.RESULT_PREFIX + oracle + "\n" + P.RESULT_PREFIX + P.canonical_json({**P.load_json(V7 / "oracle.json"), "plan_unit_count": 249}), False, "conflicting value"),
    ):
        with tempfile.TemporaryDirectory(prefix="pm-r10-glm53-normalize-") as temporary:
            root = Path(temporary)
            (root / "session_prefix.raw.jsonl").write_bytes(prefix.read_bytes())
            def mutate(entries: list[dict[str, Any]], text: str = text) -> None:
                message = assistant_messages(entries)[-1]
                block = next(block for block in message["content"] if block.get("type") == "text")
                block["text"] = text
            write_session(root / "session.jsonl", source, mutate)
            if accepted:
                result = verify(root / "session.jsonl", launch, require_exit=True)
                check(result["result_normalization"]["candidate_count"] == 2, label)
            else:
                expect(controller.normalizer.NormalizationError, lambda: verify(root / "session.jsonl", launch, require_exit=True), label)
            checks += 1
    return checks


def iso(epoch_ms: int) -> str:
    return datetime.fromtimestamp(epoch_ms / 1000, tz=timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def catalog_receipt(raw: bytes, started_ms: int, finished_ms: int) -> dict[str, Any]:
    gate = controller.spec()["catalog_gate"]
    return {
        "schema_id": "pm.r10.storage_pipeline.omp_catalog_refresh_preflight.v1", "name": "forced_catalog_refresh",
        "started_at_utc": iso(started_ms), "finished_at_utc": iso(finished_ms), "duration_ms": finished_ms - started_ms,
        "argv": gate["argv"], "cwd": str(controller.HERE), "profile_dir": gate["profile_dir"],
        "profile_environment": {"PI_CODING_AGENT_DIR": gate["profile_dir"]}, "forced_online": True,
        "extensions_disabled": True, "timeout_seconds": gate["command_timeout_seconds"], "timed_out": False, "exit_code": 0,
        "stdout": controller.raw_record(raw), "stderr": controller.raw_record(b""),
        "projection": controller.catalog_projection(raw), "projection_error": None,
    }

@contextlib.contextmanager
def live_cache_fixture(*, wal: bool = True) -> Any:
    original_spec = controller.spec
    contract = copy.deepcopy(original_spec())
    with tempfile.TemporaryDirectory(prefix="pm-r10-glm53-live-cache-") as temporary:
        root, gate = Path(temporary), contract["catalog_gate"]
        path = root / "models.db"
        gate["models_db_path"] = str(path)
        compat = {key: value for key, value in gate["expected_cache_model"]["compat_subset"].items() if "." not in key}
        compat["whenThinking"] = {"requiresReasoningContentForToolCalls": gate["expected_cache_model"]["compat_subset"]["whenThinking.requiresReasoningContentForToolCalls"]}
        model = {field: gate["expected_cache_model"][field] for field in ("provider", "id", "name", "api", "baseUrl", "contextWindow", "maxTokens", "reasoning", "thinking", "input", "cost")}
        model["compat"] = compat
        canonical = P.canonical_json(model).encode("utf-8")
        gate.update({"expected_cache_target_canonical_utf8_bytes": len(canonical), "expected_cache_target_canonical_sha256": P.sha256_bytes(canonical)})
        updated = int(datetime.now(timezone.utc).timestamp() * 1000)
        provider = ("opencode-go:models-v3:synthetic", 12, updated, 1, "synthetic", "[]", "[]", 1, P.canonical_json([model]))
        keeper = sqlite3.connect(path)
        try:
            keeper.execute("PRAGMA journal_mode=" + ("WAL" if wal else "DELETE"))
            if wal:
                keeper.execute("PRAGMA wal_autocheckpoint=0")
            keeper.execute("CREATE TABLE model_cache(provider_id TEXT,version INTEGER,updated_at INTEGER,authoritative INTEGER,static_fingerprint TEXT,header_omitted_model_ids TEXT,unrestorable_header_model_ids TEXT,header_restore_version INTEGER,models TEXT)")
            keeper.execute("INSERT INTO model_cache VALUES(?,?,?,?,?,?,?,?,?)", provider)
            keeper.commit()
            os.chmod(path, 0o600)
            if wal:
                check(Path(str(path) + "-wal").is_file(), "faithful live WAL fixture")
            controller.spec = lambda: contract
            cli_raw = (P.canonical_json({"models": [gate["expected_cli_model"]]}) + "\n").encode("utf-8")
            catalog = catalog_receipt(cli_raw, updated - 1000, updated)
            yield root, catalog, controller.models_db_receipt(), path
        finally:
            controller.spec = original_spec
            with contextlib.suppress(sqlite3.Error):
                keeper.close()

def catalog_and_cache_checks() -> int:
    with live_cache_fixture() as (_root, catalog, cache, _path):
        gate = controller.spec()["catalog_gate"]
        cli_raw = controller.raw_bytes(catalog["stdout"], "catalog stdout")
        projection = controller.catalog_projection(cli_raw)
        controller.validate_catalog_projection(projection)
        controller.validate_catalog_receipt(catalog)
        controller.validate_models_db_receipt(cache, catalog)
        live = controller.live_models_db_recheck(cache["database"])
        controller.validate_live_models_db_recheck(live, cache, controller.base.utc_now())
        check(cache["projection"]["model"]["api"] == "openai-completions" and cache["projection"]["model"]["supportsTools_field_present"] is False, "cache API/native dialect")
        checks = 7
        duplicate = (P.canonical_json({"models": [gate["expected_cli_model"], gate["expected_cli_model"]]}) + "\n").encode("utf-8")
        expect(controller.ControllerError, lambda: controller.catalog_projection(duplicate), "duplicate catalog selector", "unique")
        wrong_price = copy.deepcopy(projection)
        wrong_price["model"]["cost"]["output"] = 0
        expect(controller.ControllerError, lambda: controller.validate_catalog_projection(wrong_price), "wrong catalog price")
        disagreement = copy.deepcopy(catalog)
        disagreement["projection"]["model"]["name"] = "different"
        expect(controller.ControllerError, lambda: controller.validate_models_db_receipt(cache, disagreement), "catalog/cache disagreement", "agreement")
        bad_cache = copy.deepcopy(cache)
        bad_cache["provider_record"]["sha256"] = "0" * 64
        expect(controller.ControllerError, lambda: controller.validate_models_db_receipt(bad_cache, catalog), "cache raw hash", "bytes/hash")
        stale = iso(int(V.parse_utc(cache["captured_at_utc"]).timestamp() * 1000) + 61000)
        expect(controller.ControllerError, lambda: controller.validate_catalog_receipt(catalog, stale), "stale catalog", "freshness")
        expect(controller.ControllerError, lambda: controller.validate_models_db_receipt(cache, catalog, stale), "stale cache", "freshness")
        return checks + 6


def binding_and_prefix_checks() -> int:
    current = controller.bindings()
    originals = [(module, name, getattr(module, name)) for module, name, _value in current]
    with controller.installed():
        check(all(getattr(module, name) is value for module, name, value in controller.bindings()), "bindings installed")
    check(all(getattr(module, name) is value for module, name, value in originals), "bindings restored")
    check(controller.verify_prefix()["row_count"] == 0, "empty exact prefix")
    return 3


def popen_guard_checks() -> int:
    saved = (controller.EVIDENCE, controller.DISPATCH_CUSTODY, controller.git_custody, controller.POPEN_DELEGATE)
    custody = {"candidate_commit": "a" * 40, "head": "a" * 40, "origin_main": "a" * 40, "truenas_backup_main": "a" * 40, "sources": []}
    calls: list[tuple[str, Any]] = []
    checks = 0
    try:
        controller.DISPATCH_CUSTODY = custody
        controller.git_custody = lambda: custody
        controller.POPEN_DELEGATE = lambda *_a, **_k: calls.append(("delegate", None)) or "process"
        def attempt(label: str, mutate: Callable[[Path, Path], None], *, wal: bool = True) -> None:
            nonlocal checks
            with live_cache_fixture(wal=wal) as (root, catalog, cache, path):
                controller.EVIDENCE = root / "evidence"
                row = controller.rows()[0]
                row_dir = controller.EVIDENCE / row["pass_id"] / row["route_id"]
                row_dir.mkdir(parents=True)
                receipt = {"git_custody": custody, "owned_sources": custody["sources"], "catalog_refresh": catalog, "catalog_refresh_sha256": controller.receipt_digest(catalog), "models_db_provider": cache, "models_db_provider_sha256": controller.receipt_digest(cache)}
                controller.base.atomic_json(row_dir / "omp_preflight.json", receipt)
                mutate(path, Path(str(path) + "-wal"))
                delegated = len(calls)
                expect(controller.ControllerError, lambda: controller.guarded_popen(controller.expected_argv(controller.route_map()[row["route_id"]], row), cwd=str(V7)), label)
                check(len(calls) == delegated and not (row_dir / "reservation.json").exists() and "pre_popen_admission" not in P.load_json(row_dir / "omp_preflight.json"), label + " zero delegate/reservation/admission")
                checks += 2
        with live_cache_fixture() as (root, catalog, cache, _path):
            controller.EVIDENCE = root / "evidence"
            row = controller.rows()[0]
            row_dir = controller.EVIDENCE / row["pass_id"] / row["route_id"]
            row_dir.mkdir(parents=True)
            receipt = {"git_custody": custody, "owned_sources": custody["sources"], "catalog_refresh": catalog, "catalog_refresh_sha256": controller.receipt_digest(catalog), "models_db_provider": cache, "models_db_provider_sha256": controller.receipt_digest(cache)}
            controller.base.atomic_json(row_dir / "omp_preflight.json", receipt)
            argv = controller.expected_argv(controller.route_map()[row["route_id"]], row)
            check(controller.guarded_popen(argv, cwd=str(V7)) == "process", "guarded Popen delegates once")
            persisted = P.load_json(row_dir / "omp_preflight.json")
            admission = persisted["pre_popen_admission"]
            check([name for name, _value in calls] == ["delegate"] and admission["models_db_live_recheck"]["database"] == cache["database"], "live recheck immediately precedes delegate")
            check(admission["git_custody_sha256"] == controller.receipt_digest(custody) and admission["models_db_live_recheck_sha256"] == controller.receipt_digest(admission["models_db_live_recheck"]), "durable custody/live-recheck admission")
            checks += 3
            before = (row_dir / "omp_preflight.json").read_bytes()
            expect(controller.ControllerError, lambda: controller.guarded_popen(argv, cwd=str(V7)), "second Popen rejected", "already used")
            check((row_dir / "omp_preflight.json").read_bytes() == before and [name for name, _value in calls].count("delegate") == 1, "second Popen no mutation/delegate")
            checks += 2
            controller.base.atomic_json(row_dir / "omp_preflight.json", receipt)
            controller.git_custody = lambda: {**custody, "head": "b" * 40}
            expect(controller.ControllerError, lambda: controller.guarded_popen(argv, cwd=str(V7)), "pre-Popen custody drift", "custody changed")
            check("pre_popen_admission" not in P.load_json(row_dir / "omp_preflight.json") and [name for name, _value in calls].count("delegate") == 1, "custody drift no admission/delegate")
            checks += 2
            controller.git_custody = lambda: custody
        attempt("main byte drift", lambda main, _wal: main.write_bytes(main.read_bytes() + b"drift"))
        attempt("WAL created", lambda _main, wal_path: wal_path.write_bytes(b"created"), wal=False)
        attempt("WAL deleted", lambda _main, wal_path: wal_path.unlink())
        attempt("WAL byte drift", lambda _main, wal_path: wal_path.write_bytes(bytes([wal_path.read_bytes()[0] ^ 1]) + wal_path.read_bytes()[1:]))
        attempt("WAL stat drift", lambda _main, wal_path: os.utime(wal_path, ns=(wal_path.stat().st_atime_ns, wal_path.stat().st_mtime_ns + 1_000_000)))
        attempt("main symlink", lambda main, _wal: (main.rename(main.with_suffix(".saved")), main.symlink_to(main.with_suffix(".saved"))))
        attempt("WAL symlink", lambda _main, wal_path: (wal_path.rename(wal_path.with_suffix(".saved")), wal_path.symlink_to(wal_path.with_suffix(".saved"))))
    finally:
        controller.EVIDENCE, controller.DISPATCH_CUSTODY, controller.git_custody, controller.POPEN_DELEGATE = saved
    return checks


def dispatch_custody_checks() -> int:
    saved = (subprocess.Popen, controller.POPEN_DELEGATE, controller.validate_static, controller.git_custody, controller._prefix, controller.base.run_row, controller.base.record_failure, controller.preserve_postfailure, controller.EVIDENCE)
    custody = {"candidate_commit": "a" * 40, "head": "a" * 40, "origin_main": "a" * 40, "truenas_backup_main": "a" * 40, "sources": []}
    popen: list[str] = []
    checks = 0
    try:
        subprocess.Popen = lambda *_a, **_k: popen.append("Popen")  # type: ignore[assignment]
        controller.POPEN_DELEGATE = lambda *_a, **_k: popen.append("delegate")
        controller.validate_static = lambda *, unused: {"subject_calls": 0}
        controller.git_custody = lambda: custody
        controller._prefix = lambda: {"row_count": 0}
        with contextlib.redirect_stdout(io.StringIO()):
            check(controller.dispatch(["run", "1", "--max-seconds", "3599"]) == 1, "budget prelaunch gate")
        controller.git_custody = lambda: (_ for _ in ()).throw(controller.ControllerError("unpushed"))
        with contextlib.redirect_stdout(io.StringIO()):
            check(controller.dispatch(["run", "1"]) == 1, "custody prelaunch gate")
        checks += 2
        controller.git_custody = lambda: custody
        for kind in ("root", "parent", "row"):
            with tempfile.TemporaryDirectory(prefix=f"pm-r10-glm53-{kind}-") as temporary:
                controller.EVIDENCE = Path(temporary) / "evidence"
                row = controller.rows()[0]
                def partial(*_args: Any, kind: str = kind, row: dict[str, Any] = row) -> Any:
                    target = controller.EVIDENCE if kind == "root" else controller.EVIDENCE / row["pass_id"] if kind == "parent" else controller.EVIDENCE / row["pass_id"] / row["route_id"]
                    target.mkdir(parents=True)
                    raise controller.PermanentPrefixError(f"{kind} permanent failure")
                controller.base.run_row = partial
                with contextlib.redirect_stdout(io.StringIO()):
                    check(controller.dispatch(["run", "1"]) == 1, f"{kind} consumed")
                leaf = controller.EVIDENCE / row["pass_id"] / row["route_id"]
                check(P.load_json(leaf / "terminal.json")["status"] == "FAIL" and (leaf / "runner_failure.json").is_file(), f"{kind} durable failure")
                checks += 2
        with tempfile.TemporaryDirectory(prefix="pm-r10-glm53-absent-") as temporary:
            controller.EVIDENCE = Path(temporary) / "evidence"
            controller.base.run_row = lambda *_a: (_ for _ in ()).throw(controller.ControllerError("before mutation"))
            with contextlib.redirect_stdout(io.StringIO()):
                check(controller.dispatch(["run", "1"]) == 1, "absent prelaunch failure")
            check(not os.path.lexists(controller.EVIDENCE), "absent remains absent")
            checks += 2
        with live_cache_fixture() as (root, catalog, cache, path):
            controller.EVIDENCE = root / "evidence"
            row = controller.rows()[0]
            def drift_after_claim(*_args: Any) -> Any:
                leaf = controller.EVIDENCE / row["pass_id"] / row["route_id"]
                leaf.mkdir(parents=True)
                controller.base.atomic_json(leaf / "reservation.json", {"attempt_id": row["attempt_id"]})
                receipt = {"git_custody": custody, "owned_sources": custody["sources"], "catalog_refresh": catalog, "catalog_refresh_sha256": controller.receipt_digest(catalog), "models_db_provider": cache, "models_db_provider_sha256": controller.receipt_digest(cache)}
                controller.base.atomic_json(leaf / "omp_preflight.json", receipt)
                path.write_bytes(path.read_bytes() + b"post-claim drift")
                return controller.guarded_popen(controller.expected_argv(controller.route_map()[row["route_id"]], row), cwd=str(V7))
            controller.base.run_row = drift_after_claim
            with contextlib.redirect_stdout(io.StringIO()):
                check(controller.dispatch(["run", "1"]) == 1, "post-claim cache drift consumed")
            leaf = controller.EVIDENCE / row["pass_id"] / row["route_id"]
            check(P.load_json(leaf / "terminal.json")["status"] == "FAIL" and not popen, "post-claim drift durable FAIL without Popen")
            checks += 2
    finally:
        subprocess.Popen, controller.POPEN_DELEGATE, controller.validate_static, controller.git_custody, controller._prefix, controller.base.run_row, controller.base.record_failure, controller.preserve_postfailure, controller.EVIDENCE = saved
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
        with tempfile.TemporaryDirectory(prefix="pm-r10-glm53-repeat-") as temporary:
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

        with tempfile.TemporaryDirectory(prefix="pm-r10-glm53-output-") as temporary:
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
    checks = 1
    for mutate, label in (
        (lambda value: value.update({"authorized_selector": "opencode-go/other"}), "selector widening"),
        (lambda value: value.update({"retry_replacement_reuse_or_retro_credit_authorized": True}), "retry widening"),
        (lambda value: value.update({"exact_fallback_clause_utf8": "fallback"}), "fallback clause drift"),
        (lambda value: value["active_goal_receipt"].update({"objective_sha256": "0" * 64}), "Goal receipt drift"),
    ):
        candidate = copy.deepcopy(authority)
        mutate(candidate)
        expect(controller.ControllerError, lambda candidate=candidate: controller.validate_authority(candidate), label)
        checks += 1
    return checks


def main() -> int:
    static = controller.validate_static(unused=True)
    check(static["rows"] == 1 and static["temporary_bindings"] == 12 and static["subject_calls"] == 0, "static package")
    checks = 1
    checks += fixture_checks()
    checks += retry_and_native_shape_checks()
    checks += api_and_normalization_checks()
    checks += catalog_and_cache_checks()
    checks += binding_and_prefix_checks()
    checks += popen_guard_checks()
    checks += dispatch_custody_checks()
    checks += repeat_and_output_checks()
    checks += authority_checks()
    row = controller.rows()[0]
    check(not os.path.lexists(controller.EVIDENCE) and not os.path.lexists(row["cwd"]) and not os.path.lexists(row["session_dir"]) and not list(controller.HERE.rglob("*.pyc")) and not list(controller.HERE.rglob("__pycache__")), "no evidence/runtime/cache residue")
    checks += 1
    print(P.canonical_json({"status": "PASS_ZERO_SUBJECT_SELFTEST", "checks": checks, "metrics": static["metrics"], "temporary_bindings": 12, "subject_calls": 0, "qualification_credit": 0, "matrix_credit": 0}))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
