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
GLM53_V1 = R10 / "storage_glm53_normalized_canary_v1/evidence/pass_01/omp_glm53_flash_xhigh"
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
    v1_failure = (
        (GLM53_V1 / "reservation.json", 352, "e285b7d7361c7dde9b5605271cd7f330ed5256368a47fb9125447988d6aa11e0"),
        (GLM53_V1 / "omp_preflight.json", 17661, "8a84d1ae83e5662e093ae15ac902300af18c3f79bdc89e08b439e519d2dfca23"),
        (GLM53_V1 / "runner_failure.json", 478, "15701e0c455bf7a57b16aac7ce2d824d641e313fda0a81de6cc0d2a1ea441f15"),
        (GLM53_V1 / "terminal.json", 1207, "75e5d4ae7df4299e0ba5a4c0db0582690e9aa35f7bb36d92ad1d33a154109392"),
    )
    for path, size, digest in v1_failure:
        check(path.stat().st_size == size and P.sha256_file(path) == digest, f"consumed V1 immutable: {path.name}")
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
    return len(freezes) + len(v1_failure) + 7


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
        "schema_id": "pm.r10.storage_pipeline.omp_provider_only_catalog_refresh_preflight.v2", "name": "forced_provider_only_catalog_refresh",
        "started_at_utc": iso(started_ms), "finished_at_utc": iso(finished_ms), "duration_ms": finished_ms - started_ms,
        "argv": gate["argv"], "cwd": str(controller.HERE), "profile_dir": gate["profile_dir"],
        "profile_environment": copy.deepcopy(gate["profile_environment"]), "helper_source": copy.deepcopy(gate["helper_source"]), "helper_source_after": copy.deepcopy(gate["helper_source"]), "helper_runtime": copy.deepcopy(gate["helper_runtime"]),
        "runtime_sources_before": copy.deepcopy(gate["helper_runtime"]["omp_source_files"]), "runtime_sources_after": copy.deepcopy(gate["helper_runtime"]["omp_source_files"]), "runtime_custody_error": None,
        "provider_filter": copy.deepcopy(gate["provider_filter"]), "strategy": gate["strategy"], "forced_online": True, "local_model_config_loaded": False,
        "extensions_disabled": True, "timeout_seconds": gate["command_timeout_seconds"], "timed_out": False, "exit_code": 0,
        "stdout": controller.raw_record(raw), "stderr": controller.raw_record(b""), "result": controller.raw_record(raw), "result_sha256": P.sha256_bytes(raw),
        "result_value": controller.catalog_result(raw), "projection": controller.catalog_projection(raw), "projection_error": None,
    }


def helper_result(models: list[dict[str, Any]]) -> bytes:
    value = {"schema_id": "pm.r10.storage_pipeline.omp_provider_only_catalog_result.v1", "runtime_version": "1.4.0", "provider_filter": ["opencode-go"], "strategy": "online", "discovery_invocation_count": 1, "local_model_config_loaded": False, "extensions_loaded": False, "online_if_uncached_followup": False, "models": models}
    return (P.canonical_json(value) + "\n").encode("utf-8")

def model_row(gate: dict[str, Any]) -> dict[str, Any]:
    expected = gate["expected_cache_model"]
    compat = {key: value for key, value in expected["compat_subset"].items() if "." not in key}
    compat["whenThinking"] = {"requiresReasoningContentForToolCalls": expected["compat_subset"]["whenThinking.requiresReasoningContentForToolCalls"]}
    value = {field: expected[field] for field in ("provider", "id", "name", "api", "baseUrl", "contextWindow", "maxTokens", "reasoning", "thinking", "input", "cost")}
    value["compat"] = compat
    return value


def replace_provider(state: dict[str, Any], **changes: Any) -> None:
    provider = {**state["provider"], **changes}
    state["connection"].execute("DELETE FROM model_cache WHERE provider_id LIKE 'opencode-go:models-v3:%'")
    state["connection"].execute("INSERT INTO model_cache VALUES(?,?,?,?,?,?,?,?,?)", tuple(provider[field] for field in controller.PROVIDER_FIELDS))
    state["connection"].commit()
    state["provider"] = provider


@contextlib.contextmanager
def live_cache_fixture(*, wal: bool = True) -> Any:
    original_spec, contract = controller.spec, copy.deepcopy(controller.spec())
    with tempfile.TemporaryDirectory(prefix="pm-r10-glm53-semantic-cache-") as temporary:
        root, gate = Path(temporary), contract["catalog_gate"]
        path = root / "models.db"
        gate["models_db_path"] = str(path)
        model = model_row(gate)
        canonical = P.canonical_json(model).encode("utf-8")
        gate.update({"expected_cache_target_canonical_utf8_bytes": len(canonical), "expected_cache_target_canonical_sha256": P.sha256_bytes(canonical)})
        updated = int(datetime.now(timezone.utc).timestamp() * 1000)
        provider = dict(zip(controller.PROVIDER_FIELDS, ("opencode-go:models-v3:synthetic", 12, updated, 1, "synthetic", "[]", "[]", 1, P.canonical_json([model]))))
        connection = sqlite3.connect(path, isolation_level=None)
        try:
            connection.execute("PRAGMA journal_mode=" + ("WAL" if wal else "DELETE"))
            if wal:
                connection.execute("PRAGMA wal_autocheckpoint=0")
            connection.execute("CREATE TABLE model_cache(provider_id TEXT,version INTEGER,updated_at INTEGER,authoritative INTEGER,static_fingerprint TEXT,header_omitted_model_ids TEXT,unrestorable_header_model_ids TEXT,header_restore_version INTEGER,models TEXT)")
            connection.execute("INSERT INTO model_cache VALUES(?,?,?,?,?,?,?,?,?)", tuple(provider[field] for field in controller.PROVIDER_FIELDS))
            os.chmod(path, 0o600)
            controller.spec = lambda: contract
            cli_raw = helper_result([gate["expected_cli_model"]])
            catalog = catalog_receipt(cli_raw, updated - 1000, updated)
            state = {"root": root, "path": path, "connection": connection, "contract": contract, "provider": provider, "catalog": catalog}
            state["initial"] = controller.sqlite_semantic_receipt("initial_post_refresh")
            yield state
        finally:
            controller.spec = original_spec
            with contextlib.suppress(sqlite3.Error):
                connection.close()


def provider_helper_checks() -> int:
    gate = controller.spec()["catalog_gate"]
    environment = dict(os.environ)
    environment["BUN_BE_BUN"] = "1"
    completed = subprocess.run(gate["argv"] + ["--selftest-spy"], cwd=controller.HERE, env=environment, capture_output=True, timeout=30, check=False)
    check(completed.returncode == 0 and completed.stderr == b"" and completed.stdout.endswith(b"\n") and completed.stdout.count(b"\n") == 1, "provider helper two-provider spy clean exit")
    spy = P.strict_loads(completed.stdout.decode("utf-8"))
    production = spy["production_result"]
    check(spy["schema_id"] == "pm.r10.storage_pipeline.omp_provider_only_helper_spy.v1" and spy["opencode_go_discovery_calls"] == 1 and spy["second_provider_attempts"] == 0 and spy["command_sentinel_absent"] is spy["second_provider_fetch_would_throw"] is True, "exact one-provider zero-network spy call roster")
    check(production["provider_filter"] == ["opencode-go"] and production["discovery_invocation_count"] == 1 and production["local_model_config_loaded"] is production["online_if_uncached_followup"] is False and all(model["provider"] == "opencode-go" for model in production["models"]), "two-provider spy cannot load local config or widen discovery")
    raw = helper_result([gate["expected_cli_model"]])
    receipt = catalog_receipt(raw, 1_800_000_000_000, 1_800_000_000_001)
    controller.validate_catalog_receipt(receipt)
    checks = 4

    missing = copy.deepcopy(receipt)
    del missing["result"]
    expect(controller.ControllerError, lambda: controller.validate_catalog_receipt(missing), "missing helper result", "shape")
    duplicate_value = copy.deepcopy(receipt["result_value"])
    duplicate_value["models"] *= 2
    duplicate_raw = helper_result(duplicate_value["models"])
    expect(controller.ControllerError, lambda: controller.catalog_result(duplicate_raw), "duplicate provider result", "duplicate")
    wrong_value = copy.deepcopy(receipt["result_value"])
    wrong_value["provider_filter"] = ["other-provider"]
    wrong_raw = (P.canonical_json(wrong_value) + "\n").encode("utf-8")
    expect(controller.ControllerError, lambda: controller.catalog_result(wrong_raw), "wrong provider filter", "scoped")
    absent_value = copy.deepcopy(receipt["result_value"])
    absent_value["models"] = []
    absent_raw = (P.canonical_json(absent_value) + "\n").encode("utf-8")
    expect(controller.ControllerError, lambda: controller.catalog_result(absent_raw), "missing provider result", "roster")
    local_config = copy.deepcopy(receipt["result_value"]); local_config["local_model_config_loaded"] = True
    expect(controller.ControllerError, lambda: controller.catalog_result((P.canonical_json(local_config) + "\n").encode()), "local model config result", "local config")
    local_receipt = copy.deepcopy(receipt); local_receipt["local_model_config_loaded"] = True
    expect(controller.ControllerError, lambda: controller.validate_catalog_receipt(local_receipt), "local model config receipt", "local config")
    result_drift = copy.deepcopy(receipt)
    result_drift["result"]["sha256"] = "0" * 64
    expect(controller.ControllerError, lambda: controller.validate_catalog_receipt(result_drift), "helper raw result drift", "bytes/hash")
    helper_drift = copy.deepcopy(receipt)
    helper_drift["helper_source_after"]["sha256"] = "0" * 64
    expect(controller.ControllerError, lambda: controller.validate_catalog_receipt(helper_drift), "helper source drift", "source/runtime")
    source_missing = copy.deepcopy(receipt)
    source_missing["runtime_sources_after"] = source_missing["runtime_sources_after"][:-1]
    expect(controller.ControllerError, lambda: controller.validate_catalog_receipt(source_missing), "helper runtime source missing", "custody")
    source_duplicate = copy.deepcopy(receipt)
    source_duplicate["runtime_sources_before"] += source_duplicate["runtime_sources_before"][:1]
    expect(controller.ControllerError, lambda: controller.validate_catalog_receipt(source_duplicate), "helper runtime source duplicate", "custody")
    saved_run, saved_sources = controller.subprocess.run, controller.helper_runtime_sources
    source_calls = 0
    try:
        def sources() -> list[dict[str, Any]]:
            nonlocal source_calls
            source_calls += 1
            if source_calls == 1:
                return copy.deepcopy(gate["helper_runtime"]["omp_source_files"])
            raise controller.ControllerError("post-call source drift")
        controller.helper_runtime_sources = sources
        controller.subprocess.run = lambda *_a, **_k: subprocess.CompletedProcess(gate["argv"], 0, raw, b"")
        drift_receipt = controller.forced_catalog_refresh()
    finally:
        controller.subprocess.run, controller.helper_runtime_sources = saved_run, saved_sources
    check(controller.raw_bytes(drift_receipt["stdout"], "drift stdout") == raw == controller.raw_bytes(drift_receipt["result"], "drift result") and drift_receipt["runtime_sources_after"] is None and "post-call source drift" in drift_receipt["runtime_custody_error"], "post-call drift preserves raw helper causality")
    expect(controller.ControllerError, lambda: controller.validate_catalog_receipt(drift_receipt), "post-call source drift rejects", "post-call runtime custody")
    return checks + 12


def semantic_receipt_checks() -> int:
    with live_cache_fixture() as state:
        catalog, initial, connection = state["catalog"], state["initial"], state["connection"]
        controller.validate_catalog_receipt(catalog)
        controller.validate_semantic_receipt(initial, catalog)
        wal_path = Path(str(state["path"]) + "-wal")
        wal_before = (wal_path.stat().st_size, P.sha256_file(wal_path))
        connection.execute("INSERT INTO model_cache VALUES(?,?,?,?,?,?,?,?,?)", ("unrelated:models-v1:x", 1, 1, 0, "other", "[]", "[]", 1, "[]"))
        connection.execute("PRAGMA wal_checkpoint(TRUNCATE)")
        check(wal_before != (wal_path.stat().st_size, P.sha256_file(wal_path)), "fixture performs real WAL/checkpoint churn")
        second = controller.sqlite_semantic_receipt("immediate_pre_popen")
        admitted = controller.base.utc_now()
        controller.validate_semantic_receipt(second, catalog, initial=initial, admitted_at=admitted)
        check(initial["semantic_sha256"] == second["semantic_sha256"] and second["row_count"] == 1, "WAL/checkpoint/unrelated-row semantic PASS")
        bad_raw = copy.deepcopy(initial)
        bad_raw["query_result"]["sha256"] = "0" * 64
        expect(controller.ControllerError, lambda: controller.validate_semantic_receipt(bad_raw, catalog), "query raw hash", "bytes/hash")
        duplicate_catalog = helper_result([controller.spec()["catalog_gate"]["expected_cli_model"]] * 2)
        expect(controller.ControllerError, lambda: controller.catalog_projection(duplicate_catalog), "duplicate catalog target", "duplicate")
        checks = 8
    for field, value, label in (("provider_id", "opencode-go:models-v3:other", "provider"), ("version", 11, "schema"), ("authoritative", 0, "authoritative"), ("header_restore_version", 2, "header")):
        with live_cache_fixture() as state:
            replace_provider(state, **{field: value})
            receipt = controller.sqlite_semantic_receipt("immediate_pre_popen")
            expect(controller.ControllerError, lambda: controller.validate_semantic_receipt(receipt, state["catalog"], initial=state["initial"], admitted_at=controller.base.utc_now()), label)
            checks += 1
    for field, value, label in (("id", "other", "target"), ("api", "wrong", "API"), ("baseUrl", "https://wrong", "baseUrl"), ("cost", {"input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0}, "cost"), ("thinking", {"mode": "effort", "efforts": ["high"]}, "thinking")):
        with live_cache_fixture() as state:
            model = model_row(state["contract"]["catalog_gate"])
            model[field] = value
            replace_provider(state, models=P.canonical_json([model]))
            receipt = controller.sqlite_semantic_receipt("immediate_pre_popen")
            expect(controller.ControllerError, lambda: controller.validate_semantic_receipt(receipt, state["catalog"], initial=state["initial"], admitted_at=controller.base.utc_now()), label)
            checks += 1
    with live_cache_fixture() as state:
        replace_provider(state, static_fingerprint="changed")
        drift = controller.sqlite_semantic_receipt("immediate_pre_popen")
        expect(controller.ControllerError, lambda: controller.validate_semantic_receipt(drift, state["catalog"], initial=state["initial"], admitted_at=controller.base.utc_now()), "semantic digest drift", "semantic digest")
        checks += 1
    return checks


def semantic_failure_checks() -> int:
    checks = 0
    with live_cache_fixture() as state:
        initial, catalog = state["initial"], state["catalog"]
        updated = initial["projection"]["updated_at_epoch_ms"]
        late_catalog = copy.deepcopy(catalog)
        late_catalog.update({"started_at_utc": iso(updated + 1), "finished_at_utc": iso(updated + 2), "duration_ms": 1})
        expect(controller.ControllerError, lambda: controller.validate_semantic_receipt(initial, late_catalog), "initial timestamp outside refresh", "refresh interval")
        replace_provider(state, updated_at=updated - 1)
        rollback = controller.sqlite_semantic_receipt("immediate_pre_popen")
        expect(controller.ControllerError, lambda: controller.validate_semantic_receipt(rollback, catalog, initial=initial, admitted_at=controller.base.utc_now()), "updated_at rollback", "nondecreasing")
        replace_provider(state, updated_at=int(datetime.now(timezone.utc).timestamp() * 1000) + 10000)
        future = controller.sqlite_semantic_receipt("immediate_pre_popen")
        expect(controller.ControllerError, lambda: controller.validate_semantic_receipt(future, catalog, initial=initial, admitted_at=controller.base.utc_now()), "updated_at future", "nonfuture")
        stale_receipt = copy.deepcopy(initial)
        second_start = int(V.parse_utc(initial["finished_at_utc"]).timestamp() * 1000) + 1
        stale_receipt.update({"name": "immediate_pre_popen", "started_at_utc": iso(second_start), "finished_at_utc": iso(second_start + 1), "duration_ms": 1})
        stale = iso(max(updated + 61002, second_start + 1))
        expect(controller.ControllerError, lambda: controller.validate_semantic_receipt(stale_receipt, catalog, initial=initial, admitted_at=stale), "provider stale", "freshness")
        checks += 4
    with live_cache_fixture() as state:
        state["connection"].execute("INSERT INTO model_cache VALUES(?,?,?,?,?,?,?,?,?)", tuple(state["provider"][field] for field in controller.PROVIDER_FIELDS))
        duplicate = controller.sqlite_semantic_receipt("immediate_pre_popen")
        expect(controller.ControllerError, lambda: controller.validate_semantic_receipt(duplicate, state["catalog"], initial=state["initial"], admitted_at=controller.base.utc_now()), "duplicate provider", "exact provider")
        replace_provider(state, models="{")
        malformed = controller.sqlite_semantic_receipt("immediate_pre_popen")
        expect(controller.ControllerError, lambda: controller.validate_semantic_receipt(malformed, state["catalog"], initial=state["initial"], admitted_at=controller.base.utc_now()), "malformed provider", "strict")
        checks += 2
    with live_cache_fixture(wal=False) as state:
        state["connection"].execute("BEGIN EXCLUSIVE")
        busy = controller.sqlite_semantic_receipt("immediate_pre_popen")
        expect(controller.ControllerError, lambda: controller.validate_semantic_receipt(busy, state["catalog"], initial=state["initial"], admitted_at=controller.base.utc_now()), "busy database")
        checks += 1
    with live_cache_fixture(wal=False) as state:
        state["connection"].close()
        saved = state["path"].with_suffix(".saved")
        state["path"].rename(saved)
        state["path"].symlink_to(saved)
        symlink = controller.sqlite_semantic_receipt("immediate_pre_popen")
        expect(controller.ControllerError, lambda: controller.validate_semantic_receipt(symlink, state["catalog"], initial=state["initial"], admitted_at=controller.base.utc_now()), "symlink database")
        checks += 1
    with live_cache_fixture(wal=False) as state:
        state["connection"].close()
        state["path"].write_bytes(b"not sqlite")
        corrupt = controller.sqlite_semantic_receipt("immediate_pre_popen")
        expect(controller.ControllerError, lambda: controller.validate_semantic_receipt(corrupt, state["catalog"], initial=state["initial"], admitted_at=controller.base.utc_now()), "corrupt database")
        checks += 1
    return checks


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
    calls: list[str] = []
    try:
        controller.DISPATCH_CUSTODY = custody
        controller.git_custody = lambda: custody
        controller.POPEN_DELEGATE = lambda *_a, **_k: calls.append("delegate") or "process"
        with live_cache_fixture() as state:
            controller.EVIDENCE = state["root"] / "evidence"
            row = controller.rows()[0]
            row_dir = controller.EVIDENCE / row["pass_id"] / row["route_id"]
            row_dir.mkdir(parents=True)
            receipt = {"git_custody": custody, "owned_sources": custody["sources"], "catalog_refresh": state["catalog"], "catalog_refresh_sha256": controller.receipt_digest(state["catalog"]), "sqlite_initial_receipt": state["initial"], "sqlite_initial_receipt_sha256": controller.receipt_digest(state["initial"])}
            controller.base.atomic_json(row_dir / "omp_preflight.json", receipt)
            state["connection"].execute("INSERT INTO model_cache VALUES(?,?,?,?,?,?,?,?,?)", ("unrelated:provider", 1, 1, 0, "unrelated", "[]", "[]", 1, "[]"))
            state["connection"].execute("PRAGMA wal_checkpoint(PASSIVE)")
            argv = controller.expected_argv(controller.route_map()[row["route_id"]], row)
            check(controller.guarded_popen(argv, cwd=str(V7)) == "process", "guarded Popen delegates once")
            persisted = P.load_json(row_dir / "omp_preflight.json")
            admission = persisted["pre_popen_admission"]
            check(calls == ["delegate"] and admission["provider_semantic_sha256"] == persisted["sqlite_initial_receipt"]["semantic_sha256"] == persisted["sqlite_pre_popen_receipt"]["semantic_sha256"], "semantic recheck immediately precedes one delegate")
            check(admission["git_custody_sha256"] == controller.receipt_digest(custody) and admission["sqlite_pre_popen_receipt_sha256"] == controller.receipt_digest(persisted["sqlite_pre_popen_receipt"]), "durable custody/two-transaction admission")
            def outer_join(value: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any]]:
                controller.base.atomic_json(row_dir / "omp_preflight.json", value)
                digest = P.sha256_file(row_dir / "omp_preflight.json")
                launch = {"started_at_utc": admission["admitted_at_utc"], "argv": argv, "omp_preflight_bytes": (row_dir / "omp_preflight.json").stat().st_size, "omp_preflight_sha256": digest}
                terminal = {"evidence": [{"path": "omp_preflight.json", "bytes": launch["omp_preflight_bytes"], "sha256": digest}]}
                (controller.EVIDENCE / "launch_journal.jsonl").write_bytes(P.jsonl_bytes([{"omp_preflight_sha256": digest}]))
                return launch, terminal
            launch, terminal = outer_join(persisted)
            controller.verify_catalog_chain(row_dir, persisted, launch, terminal)
            broken = copy.deepcopy(persisted)
            broken["sqlite_pre_popen_receipt_sha256"] = "0" * 64
            launch, terminal = outer_join(broken)
            expect(controller.ControllerError, lambda: controller.verify_catalog_chain(row_dir, broken, launch, terminal), "downstream semantic receipt digest join", "digest")
            controller.base.atomic_json(row_dir / "omp_preflight.json", persisted)
            before = (row_dir / "omp_preflight.json").read_bytes()
            expect(controller.ControllerError, lambda: controller.guarded_popen(argv, cwd=str(V7)), "second Popen rejected", "already used")
            check((row_dir / "omp_preflight.json").read_bytes() == before and calls == ["delegate"], "second Popen no mutation/delegate")
            controller.base.atomic_json(row_dir / "omp_preflight.json", receipt)
            controller.git_custody = lambda: {**custody, "head": "b" * 40}
            expect(controller.ControllerError, lambda: controller.guarded_popen(argv, cwd=str(V7)), "pre-Popen custody drift", "custody changed")
            check("sqlite_pre_popen_receipt" not in P.load_json(row_dir / "omp_preflight.json") and calls == ["delegate"], "custody drift no semantic read/admission/delegate")
            controller.git_custody = lambda: custody
        with live_cache_fixture() as state:
            controller.EVIDENCE = state["root"] / "evidence"
            row = controller.rows()[0]
            row_dir = controller.EVIDENCE / row["pass_id"] / row["route_id"]
            row_dir.mkdir(parents=True)
            receipt = {"git_custody": custody, "owned_sources": [], "catalog_refresh": state["catalog"], "catalog_refresh_sha256": controller.receipt_digest(state["catalog"]), "sqlite_initial_receipt": state["initial"], "sqlite_initial_receipt_sha256": controller.receipt_digest(state["initial"])}
            controller.base.atomic_json(row_dir / "omp_preflight.json", receipt)
            replace_provider(state, static_fingerprint="semantic-drift")
            expect(controller.ControllerError, lambda: controller.guarded_popen(controller.expected_argv(controller.route_map()[row["route_id"]], row), cwd=str(V7)), "semantic drift before Popen", "semantic digest")
            persisted = P.load_json(row_dir / "omp_preflight.json")
            check("sqlite_pre_popen_receipt" in persisted and persisted["sqlite_pre_popen_receipt_sha256"] == controller.receipt_digest(persisted["sqlite_pre_popen_receipt"]) and "pre_popen_admission" not in persisted and calls == ["delegate"], "failed comparison preserves second raw receipt and never delegates")
    finally:
        controller.EVIDENCE, controller.DISPATCH_CUSTODY, controller.git_custody, controller.POPEN_DELEGATE = saved
    return 10


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
        with live_cache_fixture() as state:
            controller.EVIDENCE = state["root"] / "evidence"
            row = controller.rows()[0]
            def drift_after_claim(*_args: Any) -> Any:
                leaf = controller.EVIDENCE / row["pass_id"] / row["route_id"]
                leaf.mkdir(parents=True)
                controller.base.atomic_json(leaf / "reservation.json", {"attempt_id": row["attempt_id"]})
                receipt = {"git_custody": custody, "owned_sources": custody["sources"], "catalog_refresh": state["catalog"], "catalog_refresh_sha256": controller.receipt_digest(state["catalog"]), "sqlite_initial_receipt": state["initial"], "sqlite_initial_receipt_sha256": controller.receipt_digest(state["initial"])}
                controller.base.atomic_json(leaf / "omp_preflight.json", receipt)
                replace_provider(state, static_fingerprint="post-claim-drift")
                return controller.guarded_popen(controller.expected_argv(controller.route_map()[row["route_id"]], row), cwd=str(V7))
            controller.base.run_row = drift_after_claim
            with contextlib.redirect_stdout(io.StringIO()):
                check(controller.dispatch(["run", "1"]) == 1, "post-claim semantic drift consumed")
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
        (lambda value: value.update({"status": "WIDENED"}), "authority status drift"),
        (lambda value: value.update({"authorized_selector": "opencode-go/other"}), "selector widening"),
        (lambda value: value.update({"retry_replacement_reuse_or_retro_credit_authorized": True}), "retry widening"),
        (lambda value: value.update({"this_is_not_a_retry": False}), "successor/retry drift"),
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
    checks += provider_helper_checks()
    checks += semantic_receipt_checks()
    checks += semantic_failure_checks()
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
