#!/usr/bin/env python3
"""Normalized GLM-5.3 fallback canary."""
from __future__ import annotations

import argparse
import base64
import binascii
import contextlib
import copy
import importlib.util
import os
import sqlite3
import stat
import subprocess
import sys
from pathlib import Path
from typing import Any, Iterator

HERE = Path(__file__).resolve().parent
R10 = HERE.parent
REPO = HERE.parents[4]
V7 = R10 / "system_pipeline_sandbox_v7"
PRIOR_ROOT = R10 / "storage_mimo_normalized_canary_v1"
sys.path.insert(0, str(V7))
import freeze_check  # type: ignore[import-not-found]  # noqa: E402
import omp_row_runner as base  # type: ignore[import-not-found]  # noqa: E402
import omp_session  # type: ignore[import-not-found]  # noqa: E402
import pipeline as P  # type: ignore[import-not-found]  # noqa: E402
import verify_matrix as V  # type: ignore[import-not-found]  # noqa: E402
import result_normalizer as normalizer  # noqa: E402


def external(name: str, path: Path, search: Path) -> Any:
    module_spec = importlib.util.spec_from_file_location(name, path)
    if module_spec is None or module_spec.loader is None:
        raise RuntimeError(f"external module unavailable: {path}")
    module = importlib.util.module_from_spec(module_spec)
    sys.modules[name] = module
    sys.path.insert(0, str(search))
    try:
        module_spec.loader.exec_module(module)
    finally:
        sys.path.remove(str(search))
    return module


prior = external("r10_storage_mimo_normalized_canary_v1_glm53_base", PRIOR_ROOT / "controller.py", PRIOR_ROOT)
CONTRACT = HERE / "canary_contract.json"
EVIDENCE = HERE / "evidence"
SOURCES = ("README.md", "canary_contract.json", "controller.py", "result_normalizer.py", "selftest.py")
IDENTITY = ("ordinal", "pass_id", "route_id", "attempt_id", "nonce")
JOURNAL_FIELDS = {"schema_id", *IDENTITY, "started_at_utc", "launch_sha256", "omp_preflight_sha256", "popen_observed", "pid"}
DISPATCH_CUSTODY: dict[str, Any] | None = None
ORIGINAL_POPEN = subprocess.Popen
POPEN_DELEGATE: Any = ORIGINAL_POPEN


class ControllerError(RuntimeError):
    pass


class PermanentPrefixError(RuntimeError):
    """Permanent joined-prefix defect."""


def require(value: bool, message: str) -> None:
    if not value:
        raise ControllerError(message)


def permanent(value: bool, message: str) -> None:
    if not value:
        raise PermanentPrefixError(message)


def spec() -> dict[str, Any]:
    value = P.load_json(CONTRACT)
    require(isinstance(value, dict), "contract object")
    return value


def rows() -> list[dict[str, Any]]:
    value = spec().get("rows")
    require(isinstance(value, list) and len(value) == 1, "one frozen GLM-5.3 row")
    return value


def route_map() -> dict[str, dict[str, Any]]:
    route = spec().get("route")
    require(isinstance(route, dict) and route.get("id") == "omp_glm53_flash_xhigh", "one GLM-5.3 route")
    return {route["id"]: route}


def planned_row(pass_id: str, route_id: str) -> dict[str, Any]:
    found = [row for row in rows() if (row["pass_id"], row["route_id"]) == (pass_id, route_id)]
    require(len(found) == 1, "one planned GLM-5.3 canary row")
    return found[0]


def launch_plan_map() -> dict[tuple[str, str], dict[str, Any]]:
    return {(row["pass_id"], row["route_id"]): row for row in rows()}


def file_record(path: Path) -> dict[str, Any]:
    require(path.is_file() and not path.is_symlink(), f"regular file required: {path}")
    return {"path": path.relative_to(REPO).as_posix(), "bytes": path.stat().st_size, "sha256": P.sha256_file(path)}


def frozen_records(field: str) -> list[dict[str, Any]]:
    records = [file_record(REPO / record["path"]) for record in spec()[field]]
    require(records == spec()[field], f"{field} drift")
    return records


@contextlib.contextmanager
def prior_scope() -> Iterator[None]:
    values = {"HERE": HERE, "REPO": REPO, "CONTRACT": CONTRACT, "EVIDENCE": EVIDENCE, "SOURCES": SOURCES, "DISPATCH_CUSTODY": DISPATCH_CUSTODY}
    saved = {name: getattr(prior, name) for name in values}
    try:
        for name, value in values.items():
            setattr(prior, name, value)
        yield
    finally:
        for name, value in saved.items():
            setattr(prior, name, value)


def convert(call: Any, *args: Any, **kwargs: Any) -> Any:
    try:
        with prior_scope():
            return call(*args, **kwargs)
    except prior.ControllerError as exc:
        raise ControllerError(str(exc)) from exc


def native_convert(call: Any, *args: Any, **kwargs: Any) -> Any:
    return convert(prior.convert, call, *args, **kwargs)


def raw_record(raw: bytes) -> dict[str, Any]:
    return {"encoding": "base64", "bytes": len(raw), "sha256": P.sha256_bytes(raw), "data": base64.b64encode(raw).decode("ascii")}


def raw_bytes(record: Any, label: str) -> bytes:
    require(isinstance(record, dict) and set(record) == {"encoding", "bytes", "sha256", "data"} and record.get("encoding") == "base64", f"{label} raw receipt shape")
    require(type(record["bytes"]) is int and isinstance(record["sha256"], str) and isinstance(record["data"], str), f"{label} raw receipt types")
    try:
        raw = base64.b64decode(record["data"], validate=True)
    except (binascii.Error, ValueError, TypeError) as exc:
        raise ControllerError(f"{label} base64") from exc
    require(record["data"] == base64.b64encode(raw).decode("ascii") and record["bytes"] == len(raw) and record["sha256"] == P.sha256_bytes(raw), f"{label} raw bytes/hash")
    return raw


def catalog_projection(raw: bytes) -> dict[str, Any]:
    require(raw.endswith(b"\n") and raw.count(b"\n") == 1 and b"\r" not in raw, "catalog stdout one exact LF-terminated JSON line")
    try:
        value = P.strict_loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, P.PipelineError, ValueError, TypeError) as exc:
        raise ControllerError("catalog stdout strict JSON") from exc
    require(isinstance(value, dict) and set(value) == {"models"} and isinstance(value["models"], list), "catalog JSON shape")
    models = value["models"]
    require(all(isinstance(model, dict) and isinstance(model.get("selector"), str) for model in models), "catalog model selector shape")
    selector = spec()["catalog_gate"]["expected_cli_model"]["selector"]
    matches = [model for model in models if model.get("selector") == selector]
    require(len(matches) == 1, "catalog exact unique GLM-5.3 selector")
    expected_keys = {"provider", "id", "selector", "name", "contextWindow", "maxTokens", "reasoning", "thinking", "input", "cost"}
    require(set(matches[0]) == expected_keys, "catalog GLM-5.3 model shape")
    return {"model_count": len(models), "exact_selector_count": 1, "model": matches[0]}


def validate_catalog_projection(projection: Any) -> None:
    gate = spec()["catalog_gate"]
    require(isinstance(projection, dict) and set(projection) == {"model_count", "exact_selector_count", "model"}, "catalog projection shape")
    require(type(projection["model_count"]) is int and projection["model_count"] > 0 and projection["exact_selector_count"] == 1, "catalog projection counts")
    require(projection["model"] == gate["expected_cli_model"], "catalog exact GLM-5.3 projection")
    cost = projection["model"]["cost"]
    require(all(type(cost[key]) in (int, float) and not isinstance(cost[key], bool) for key in cost), "catalog price types")
    require(cost["input"] > 0 and cost["output"] > 0 and cost["cacheRead"] > 0 and cost["cacheWrite"] == 0, "catalog exact nonzero price class")
    require(projection["model"]["reasoning"] is True and gate["required_thinking_effort"] in projection["model"]["thinking"], "catalog reasoning/xhigh")


def provider_projection(raw: bytes) -> dict[str, Any]:
    gate = spec()["catalog_gate"]
    require(raw.endswith(b"\n") and raw.count(b"\n") == 1 and b"\r" not in raw, "models.db provider record one LF JSON line")
    try:
        row = P.strict_loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, P.PipelineError, ValueError, TypeError) as exc:
        raise ControllerError("models.db provider record strict JSON") from exc
    fields = {"provider_id", "version", "updated_at", "authoritative", "static_fingerprint", "header_omitted_model_ids", "unrestorable_header_model_ids", "header_restore_version", "models"}
    require(isinstance(row, dict) and set(row) == fields, "models.db provider row shape")
    require(isinstance(row["provider_id"], str) and row["provider_id"].startswith(gate["provider_id_prefix"]), "models.db provider id")
    require(type(row["version"]) is int and row["version"] == gate["provider_cache_schema_version"], "models.db provider schema version")
    require(type(row["updated_at"]) is int and row["updated_at"] > 0 and row["authoritative"] == 1, "models.db authoritative timestamp")
    require(isinstance(row["static_fingerprint"], str) and row["static_fingerprint"], "models.db static fingerprint")
    omitted = P.strict_loads(row["header_omitted_model_ids"])
    unrestorable = P.strict_loads(row["unrestorable_header_model_ids"])
    require(omitted == gate["provider_header_omitted_model_ids"] and unrestorable == gate["provider_unrestorable_header_model_ids"], "models.db header omissions")
    require(row["header_restore_version"] == gate["provider_header_restore_version"], "models.db header restore version")
    models_raw = row["models"].encode("utf-8")
    models = P.strict_loads(row["models"])
    require(isinstance(models, list) and all(isinstance(model, dict) for model in models), "models.db model array")
    expected = gate["expected_cache_model"]
    matches = [model for model in models if model.get("provider") == expected["provider"] and model.get("id") == expected["id"]]
    require(len(matches) == 1, "models.db exact unique GLM-5.3 model")
    model = matches[0]
    canonical = P.canonical_json(model).encode("utf-8")
    require(len(canonical) == gate["expected_cache_target_canonical_utf8_bytes"] and P.sha256_bytes(canonical) == gate["expected_cache_target_canonical_sha256"], "models.db exact canonical target model")
    relevant = {field: model.get(field) for field in ("provider", "id", "name", "api", "baseUrl", "contextWindow", "maxTokens", "reasoning", "thinking", "input", "cost")}
    relevant["supportsTools_field_present"] = "supportsTools" in model
    compat = model.get("compat")
    require(isinstance(compat, dict) and isinstance(compat.get("whenThinking"), dict), "models.db compat shape")
    relevant["compat_subset"] = {
        "supportsToolChoice": compat.get("supportsToolChoice"),
        "supportsForcedToolChoice": compat.get("supportsForcedToolChoice"),
        "supportsNamedToolChoice": compat.get("supportsNamedToolChoice"),
        "supportsReasoningEffort": compat.get("supportsReasoningEffort"),
        "supportsReasoningParams": compat.get("supportsReasoningParams"),
        "thinkingFormat": compat.get("thinkingFormat"),
        "whenThinking.requiresReasoningContentForToolCalls": compat["whenThinking"].get("requiresReasoningContentForToolCalls"),
        "wireModelIdMode": compat.get("wireModelIdMode"),
    }
    require(relevant == expected, "models.db GLM-5.3 metadata/capability/API")
    return {
        "provider_id": row["provider_id"],
        "provider_cache_schema_version": row["version"],
        "updated_at_epoch_ms": row["updated_at"],
        "authoritative": True,
        "static_fingerprint": row["static_fingerprint"],
        "model_count": len(models),
        "models_utf8_bytes": len(models_raw),
        "models_sha256": P.sha256_bytes(models_raw),
        "exact_selector_count": 1,
        "target_canonical_utf8_bytes": len(canonical),
        "target_canonical_sha256": P.sha256_bytes(canonical),
        "model": relevant,
    }


def receipt_digest(receipt: dict[str, Any]) -> str:
    return P.sha256_bytes((P.canonical_json(receipt) + "\n").encode("utf-8"))


def forced_catalog_refresh() -> dict[str, Any]:
    gate = spec()["catalog_gate"]
    environment = dict(os.environ)
    environment["PI_CODING_AGENT_DIR"] = gate["profile_dir"]
    started = base.utc_now()
    timed_out = False
    try:
        result = subprocess.run(gate["argv"], cwd=str(HERE), env=environment, capture_output=True, text=False, timeout=gate["command_timeout_seconds"], check=False)
        exit_code, stdout, stderr = result.returncode, result.stdout, result.stderr
    except subprocess.TimeoutExpired as exc:
        timed_out, exit_code = True, None
        stdout = exc.stdout if isinstance(exc.stdout, bytes) else b""
        stderr = exc.stderr if isinstance(exc.stderr, bytes) else b""
    finished = base.utc_now()
    projection: dict[str, Any] | None = None
    projection_error: str | None = None
    try:
        projection = catalog_projection(stdout)
    except (ControllerError, P.PipelineError, V.VerifyError, ValueError, TypeError) as exc:
        projection_error = f"{type(exc).__name__}: {exc}"
    return {
        "schema_id": "pm.r10.storage_pipeline.omp_catalog_refresh_preflight.v1", "name": "forced_catalog_refresh",
        "started_at_utc": started, "finished_at_utc": finished,
        "duration_ms": int((V.parse_utc(finished) - V.parse_utc(started)).total_seconds() * 1000),
        "argv": gate["argv"], "cwd": str(HERE), "profile_dir": gate["profile_dir"],
        "profile_environment": {"PI_CODING_AGENT_DIR": gate["profile_dir"]}, "forced_online": True,
        "extensions_disabled": True, "timeout_seconds": gate["command_timeout_seconds"], "timed_out": timed_out,
        "exit_code": exit_code, "stdout": raw_record(stdout), "stderr": raw_record(stderr),
        "projection": projection, "projection_error": projection_error,
    }


def file_snapshot(path: Path, *, required: bool) -> dict[str, Any]:
    for parent in [path.parent, *path.parents[1:]]:
        if parent == Path("/"):
            break
        require(not parent.is_symlink(), f"unsafe symlink parent: {path}")
    present = os.path.lexists(path)
    require(present or not required, f"required cache file absent: {path}")
    empty = {"path": str(path), "present": False, "file_type": None, "path_chain_symlink_safe": True, "bytes": 0, "sha256": None, "mode": None, "mtime_ns": None, "device": None, "inode": None}
    if not present:
        return empty
    before = path.lstat()
    require(stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode), f"cache path not a regular non-symlink: {path}")
    raw, again, after = path.read_bytes(), path.read_bytes(), path.lstat()
    identity = lambda value: (value.st_dev, value.st_ino, stat.S_IFMT(value.st_mode), stat.S_IMODE(value.st_mode), value.st_size, value.st_mtime_ns)
    require(raw == again and identity(before) == identity(after) and len(raw) == before.st_size, f"cache file changed during snapshot: {path}")
    return {"path": str(path), "present": True, "file_type": "regular", "path_chain_symlink_safe": True, "bytes": len(raw), "sha256": P.sha256_bytes(raw), "mode": stat.S_IMODE(before.st_mode), "mtime_ns": before.st_mtime_ns, "device": before.st_dev, "inode": before.st_ino}


def database_snapshot(path: Path) -> dict[str, Any]:
    return {**file_snapshot(path, required=True), "wal": file_snapshot(Path(str(path) + "-wal"), required=False)}


def models_db_receipt() -> dict[str, Any]:
    gate = spec()["catalog_gate"]
    path = Path(gate["models_db_path"])
    before = database_snapshot(path)
    connection = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
    try:
        found = connection.execute(gate["models_db_query"], (gate["models_db_query_parameter"],)).fetchall()
    finally:
        connection.close()
    require(before == database_snapshot(path), "models.db or WAL changed during read-only capture")
    require(len(found) == 1 and len(found[0]) == 9, "models.db exact unique provider row")
    names = ("provider_id", "version", "updated_at", "authoritative", "static_fingerprint", "header_omitted_model_ids", "unrestorable_header_model_ids", "header_restore_version", "models")
    provider_raw = (P.canonical_json(dict(zip(names, found[0]))) + "\n").encode("utf-8")
    projection: dict[str, Any] | None = None
    projection_error: str | None = None
    try:
        projection = provider_projection(provider_raw)
    except (ControllerError, P.PipelineError, V.VerifyError, ValueError, TypeError) as exc:
        projection_error = f"{type(exc).__name__}: {exc}"
    return {
        "schema_id": "pm.r10.storage_pipeline.omp_models_db_provider_preflight.v1", "name": "authoritative_models_db_provider_record",
        "captured_at_utc": base.utc_now(), "database": before,
        "query": gate["models_db_query"], "query_parameter": gate["models_db_query_parameter"], "row_count": len(found),
        "provider_record": raw_record(provider_raw), "projection": projection, "projection_error": projection_error,
    }


def validate_catalog_receipt(receipt: Any, launch_started_at: str | None = None) -> None:
    gate = spec()["catalog_gate"]
    required = {"schema_id", "name", "started_at_utc", "finished_at_utc", "duration_ms", "argv", "cwd", "profile_dir", "profile_environment", "forced_online", "extensions_disabled", "timeout_seconds", "timed_out", "exit_code", "stdout", "stderr", "projection", "projection_error"}
    require(isinstance(receipt, dict) and set(receipt) == required, "catalog receipt shape")
    require(receipt["schema_id"] == "pm.r10.storage_pipeline.omp_catalog_refresh_preflight.v1" and receipt["name"] == "forced_catalog_refresh", "catalog receipt schema/name")
    require(receipt["argv"] == gate["argv"] and receipt["cwd"] == str(HERE) and receipt["profile_dir"] == gate["profile_dir"] and receipt["profile_environment"] == {"PI_CODING_AGENT_DIR": gate["profile_dir"]}, "catalog command/profile")
    started, finished = V.parse_utc(receipt["started_at_utc"]), V.parse_utc(receipt["finished_at_utc"])
    require(receipt["duration_ms"] == int((finished - started).total_seconds() * 1000) and 0 <= receipt["duration_ms"] <= gate["command_timeout_seconds"] * 1000, "catalog chronology")
    stdout, stderr = raw_bytes(receipt["stdout"], "catalog stdout"), raw_bytes(receipt["stderr"], "catalog stderr")
    require(receipt["forced_online"] is True and receipt["extensions_disabled"] is True and receipt["timeout_seconds"] == gate["command_timeout_seconds"], "catalog forced online flags")
    require(receipt["timed_out"] is False and receipt["exit_code"] == 0 and stderr == b"", "catalog clean exit")
    require(receipt["projection_error"] is None and receipt["projection"] == catalog_projection(stdout), "catalog raw/projection join")
    validate_catalog_projection(receipt["projection"])
    if launch_started_at is not None:
        freshness = (V.parse_utc(launch_started_at) - finished).total_seconds()
        require(0 <= freshness <= gate["freshness_to_popen_max_seconds"], "catalog freshness to Popen")


def validate_models_db_receipt(receipt: Any, catalog: dict[str, Any], launch_started_at: str | None = None) -> None:
    gate = spec()["catalog_gate"]
    required = {"schema_id", "name", "captured_at_utc", "database", "query", "query_parameter", "row_count", "provider_record", "projection", "projection_error"}
    require(isinstance(receipt, dict) and set(receipt) == required, "models.db receipt shape")
    require(receipt["schema_id"] == "pm.r10.storage_pipeline.omp_models_db_provider_preflight.v1" and receipt["name"] == "authoritative_models_db_provider_record", "models.db receipt schema/name")
    database = receipt["database"]
    validate_database_snapshot(database)
    require(receipt["query"] == gate["models_db_query"] and receipt["query_parameter"] == gate["models_db_query_parameter"] and receipt["row_count"] == 1, "models.db exact query")
    raw = raw_bytes(receipt["provider_record"], "models.db provider record")
    require(receipt["projection_error"] is None and receipt["projection"] == provider_projection(raw), "models.db raw/projection join")
    projection = receipt["projection"]
    started_ms = int(V.parse_utc(catalog["started_at_utc"]).timestamp() * 1000)
    captured = V.parse_utc(receipt["captured_at_utc"])
    require(V.parse_utc(catalog["finished_at_utc"]) <= captured and started_ms <= projection["updated_at_epoch_ms"] <= int(captured.timestamp() * 1000), "catalog/cache update chronology")
    cli = catalog["projection"]["model"]
    cached = projection["model"]
    require(all(cli[field] == cached[field] for field in ("provider", "id", "name", "contextWindow", "maxTokens", "reasoning", "input", "cost")), "catalog/cache exact model agreement")
    require(cli["thinking"] == cached["thinking"]["efforts"] and cached["api"] == gate["expected_assistant_api"] and cached["supportsTools_field_present"] is False, "catalog/cache effort/API/native agreement")
    if launch_started_at is not None:
        freshness = (V.parse_utc(launch_started_at) - captured).total_seconds()
        require(0 <= freshness <= gate["freshness_to_popen_max_seconds"], "models.db freshness to Popen")


def validate_file_snapshot(value: Any, path: str, *, required: bool) -> None:
    fields = {"path", "present", "file_type", "path_chain_symlink_safe", "bytes", "sha256", "mode", "mtime_ns", "device", "inode"}
    require(isinstance(value, dict) and set(value) == fields and value.get("path") == path and type(value.get("present")) is bool and value.get("path_chain_symlink_safe") is True, "cache file snapshot shape/path")
    if value["present"]:
        require(value["file_type"] == "regular" and type(value["bytes"]) is int and value["bytes"] >= int(required) and isinstance(value["sha256"], str) and len(value["sha256"]) == 64, "present cache file snapshot")
        require(type(value["mode"]) is int and value["mode"] & 0o022 == 0 and type(value["mtime_ns"]) is int and value["mtime_ns"] > 0 and type(value["device"]) is int and type(value["inode"]) is int, "cache file mode/stat identity")
    else:
        require(not required and tuple(value[key] for key in ("file_type", "sha256", "mode", "mtime_ns", "device", "inode")) == (None,) * 6 and value["bytes"] == 0, "absent cache file snapshot")


def validate_database_snapshot(value: Any) -> None:
    gate = spec()["catalog_gate"]
    main_fields = {"path", "present", "file_type", "path_chain_symlink_safe", "bytes", "sha256", "mode", "mtime_ns", "device", "inode", "wal"}
    require(isinstance(value, dict) and set(value) == main_fields, "models.db snapshot shape")
    validate_file_snapshot({key: item for key, item in value.items() if key != "wal"}, gate["models_db_path"], required=True)
    validate_file_snapshot(value["wal"], gate["models_db_path"] + "-wal", required=False)


def live_models_db_recheck(captured: Any) -> dict[str, Any]:
    validate_database_snapshot(captured)
    started = base.utc_now()
    live = database_snapshot(Path(spec()["catalog_gate"]["models_db_path"]))
    finished = base.utc_now()
    require(live == captured, "live models.db/WAL drift before Popen")
    return {"schema_id": "pm.r10.storage_pipeline.glm53_models_db_live_recheck.v1", "started_at_utc": started, "finished_at_utc": finished, "duration_ms": int((V.parse_utc(finished) - V.parse_utc(started)).total_seconds() * 1000), "database": live, "database_sha256": receipt_digest(live)}


def validate_live_models_db_recheck(value: Any, captured: Any, admitted_at: str) -> None:
    fields = {"schema_id", "started_at_utc", "finished_at_utc", "duration_ms", "database", "database_sha256"}
    require(isinstance(value, dict) and set(value) == fields and value.get("schema_id") == "pm.r10.storage_pipeline.glm53_models_db_live_recheck.v1", "live models.db recheck shape")
    started, finished, admitted = V.parse_utc(value["started_at_utc"]), V.parse_utc(value["finished_at_utc"]), V.parse_utc(admitted_at)
    require(value["duration_ms"] == int((finished - started).total_seconds() * 1000) and V.parse_utc(captured["captured_at_utc"]) <= started <= finished <= admitted, "live models.db recheck chronology")
    validate_database_snapshot(value["database"])
    require(value["database"] == captured["database"] and value["database_sha256"] == receipt_digest(value["database"]), "live models.db recheck/capture join")


def git_custody() -> dict[str, Any]:
    return convert(prior.git_custody)


def expected_argv(route: dict[str, Any], row: dict[str, Any]) -> list[str]:
    argv = convert(prior.expected_argv, route, row)
    require("--config" not in argv, "native/default argv cannot carry config")
    return argv


def verifier_argv(route: dict[str, Any], cwd: str, session_dir: str) -> list[str]:
    found = [row for row in rows() if (row["cwd"], row["session_dir"]) == (cwd, session_dir)]
    require(len(found) == 1, "verifier argv row identity")
    return expected_argv(route, found[0])


def guarded_popen(argv: Any, *args: Any, **kwargs: Any) -> Any:
    """Recheck the frozen Popen gate."""
    require(DISPATCH_CUSTODY is not None, "subject Popen outside dispatch custody")
    actual_argv = list(argv)
    found = [row for row in rows() if actual_argv == expected_argv(route_map()[row["route_id"]], row)]
    require(len(found) == 1, "subject Popen argv is not the sole frozen row")
    row = found[0]
    require(kwargs.get("cwd") == str(V7), "subject Popen host cwd")
    row_dir = EVIDENCE / row["pass_id"] / row["route_id"]
    receipt = P.load_json(row_dir / "omp_preflight.json")
    custody = git_custody()
    require(custody == DISPATCH_CUSTODY == receipt.get("git_custody") and receipt.get("owned_sources") == custody["sources"], "source custody changed immediately before Popen")
    catalog, cache = receipt.get("catalog_refresh"), receipt.get("models_db_provider")
    require(isinstance(catalog, dict) and receipt.get("catalog_refresh_sha256") == receipt_digest(catalog), "pre-Popen catalog digest")
    require(isinstance(cache, dict) and receipt.get("models_db_provider_sha256") == receipt_digest(cache), "pre-Popen models.db digest")
    require("pre_popen_admission" not in receipt, "subject Popen admission already used")
    live = live_models_db_recheck(cache["database"])
    admitted_at = base.utc_now()
    validate_catalog_receipt(catalog, admitted_at)
    validate_models_db_receipt(cache, catalog, admitted_at)
    validate_live_models_db_recheck(live, cache, admitted_at)
    admission = {
        "schema_id": "pm.r10.storage_pipeline.glm53_pre_popen_admission.v1",
        **{field: row[field] for field in IDENTITY},
        "admitted_at_utc": admitted_at,
        "argv_sha256": P.sha256_bytes((P.canonical_json(actual_argv) + "\n").encode("utf-8")),
        "catalog_refresh_sha256": receipt["catalog_refresh_sha256"],
        "models_db_provider_sha256": receipt["models_db_provider_sha256"],
        "models_db_live_recheck": live,
        "models_db_live_recheck_sha256": receipt_digest(live),
        "git_custody_sha256": receipt_digest(custody),
        "subject_popen_call_ordinal": 1,
    }
    receipt["pre_popen_admission"] = admission
    base.atomic_json(row_dir / "omp_preflight.json", receipt)
    require(P.load_json(row_dir / "omp_preflight.json").get("pre_popen_admission") == admission, "durable pre-Popen admission")
    return POPEN_DELEGATE(argv, *args, **kwargs)


class BaseSubprocessProxy:
    Popen = staticmethod(guarded_popen)

    def __getattr__(self, name: str) -> Any:
        return getattr(subprocess, name)


BASE_SUBPROCESS = BaseSubprocessProxy()


def prefix_path(path: Path, expected_cwd: str) -> Path:
    found = [row for row in rows() if row["cwd"] == expected_cwd]
    if found:
        return EVIDENCE / found[0]["pass_id"] / found[0]["route_id"] / "session_prefix.raw.jsonl"
    return path.parent / "session_prefix.raw.jsonl"


def stable_prefix_entry(entry: dict[str, Any]) -> dict[str, Any]:
    stable = copy.deepcopy(entry)
    message = stable.get("message")
    if stable.get("type") == "message" and isinstance(message, dict) and message.get("role") == "assistant":
        if "errorId" in message:
            permanent(type(message["errorId"]) is int and not isinstance(message["errorId"], bool) and message["errorId"] >= 0, "assistant errorId shape")
            message.pop("errorId")
        message.pop("retryRecovery", None)
    return stable


def verify_live_prefix(path: Path, **expected: Any) -> dict[str, Any]:
    prefix = prefix_path(path, expected["expected_cwd"])
    permanent(prefix.is_file() and not prefix.is_symlink(), "accepted session prefix absent or unsafe")
    kwargs = {key: expected[key] for key in ("expected_cwd", "expected_objective", "expected_selector", "expected_thinking")}
    stored = omp_session.verify_submission_prefix(prefix, **kwargs)
    live = omp_session.verify_submission_prefix(path, **kwargs)
    immutable = ("session_id", "session_started_at_utc", "goal_id", "goal_active_entry_id", "user_entry_id", "selector", "thinking", "external_user_message_count")
    permanent(all(live.get(field) == stored.get(field) for field in immutable), "live/accepted submission identity")
    permanent(live.get("goal_context_entry_ids", [])[: len(stored.get("goal_context_entry_ids", []))] == stored.get("goal_context_entry_ids"), "live/accepted Goal context prefix")
    _pslot, pheader, pentries, praw = omp_session.load_physical_session(prefix)
    _lslot, lheader, lentries, lraw = omp_session.load_physical_session(path)
    permanent(pheader == lheader and len(lentries) >= len(pentries), "live session header/entry extension")
    permanent([entry.get("id") for entry in lentries[: len(pentries)]] == [entry.get("id") for entry in pentries], "accepted entry ids are live prefix")
    permanent(all(stable_prefix_entry(left) == stable_prefix_entry(right) for left, right in zip(pentries, lentries)), "accepted prefix stable bytes drift")
    retry_records: list[dict[str, Any]] = []
    raw_block_records: list[dict[str, Any]] = []
    for entry_index, entry in enumerate(lentries):
        message = entry.get("message") if entry.get("type") == "message" else None
        if not isinstance(message, dict) or message.get("role") != "assistant":
            continue
        if message.get("retryRecovery") is not None:
            retry_records.append({"entry_index": entry_index, "entry_id": entry.get("id"), "message_id": message.get("id"), "retryRecovery": message["retryRecovery"]})
        content = message.get("content")
        if isinstance(content, list):
            for block_index, block in enumerate(content):
                if isinstance(block, dict) and "rawBlock" in block:
                    raw_block_records.append({"entry_index": entry_index, "entry_id": entry.get("id"), "message_id": message.get("id"), "block_index": block_index})
    permanent(not retry_records, f"OMP retryRecovery is permanent: {P.canonical_json(retry_records)}")
    permanent(not raw_block_records, f"native/default assistant rawBlock forbidden: {P.canonical_json(raw_block_records)}")
    return {"schema_id": "pm.r10.storage_pipeline.safe_live_prefix_guard.v1", "accepted_prefix_bytes": len(praw), "accepted_prefix_sha256": P.sha256_bytes(praw), "live_bytes": len(lraw), "live_sha256": P.sha256_bytes(lraw), "accepted_entry_count": len(pentries), "live_entry_count": len(lentries), "retryRecovery_count": 0, "rawBlock_count": 0}


def verify_session(path: Path, **expected: Any) -> dict[str, Any]:
    guard = verify_live_prefix(path, **expected)
    structural = prior.prior.ORIGINAL_SESSION_VERIFY(path, **expected)
    if expected.get("expected_selector") == spec()["catalog_gate"]["expected_cli_model"]["selector"]:
        _slot, _header, entries, _raw = omp_session.load_physical_session(path)
        assistants = [entry["message"] for entry in entries if entry.get("type") == "message" and isinstance(entry.get("message"), dict) and entry["message"].get("role") == "assistant"]
        expected_api = spec()["catalog_gate"]["expected_assistant_api"]
        require(len(assistants) == structural.get("assistant_message_count") and assistants, "GLM-5.3 assistant API roster")
        require(all(message.get("api") == expected_api for message in assistants), "GLM-5.3 assistant API exact")
        structural = {**structural, "assistant_api": expected_api, "assistant_api_message_count": len(assistants)}
    matrix = P.load_json(V7 / "matrix.json")
    normalized = normalizer.normalize_verified_session(path, structural, oracle_path=V7 / "oracle.json", schema_path=V7 / "response.schema.json", max_text_block_utf8_bytes=matrix["max_final_assistant_utf8_bytes"])
    normalized["prefix_guard"] = guard
    return normalized


def row_preflight(row_dir: Path, row: dict[str, Any], route: dict[str, Any]) -> dict[str, Any]:
    custody = git_custody()
    require(custody == DISPATCH_CUSTODY, "source custody changed before preflight")
    receipt = native_convert(prior.prior.ORIGINAL_PREFLIGHT, row_dir, row, route)
    config = receipt.get("effective_config", {})
    require(config.get("advisor.enabled") is False and config.get("task.agentAdvisor") == {"task": "off"}, "both advisor controls off")
    argv = expected_argv(route, row)
    require("--no-tools" in argv and "--no-skills" in argv and "--no-rules" in argv and "--config" not in argv, "native restrictions")
    catalog = forced_catalog_refresh()
    receipt.update({"catalog_refresh": catalog, "catalog_refresh_sha256": receipt_digest(catalog)})
    base.atomic_json(row_dir / "omp_preflight.json", receipt)
    cache = models_db_receipt()
    receipt.update({"models_db_provider": cache, "models_db_provider_sha256": receipt_digest(cache)})
    base.atomic_json(row_dir / "omp_preflight.json", receipt)
    validate_catalog_receipt(catalog)
    validate_models_db_receipt(cache, catalog)
    require(git_custody() == custody == DISPATCH_CUSTODY, "source custody changed during catalog/cache preflight")
    receipt.update({
        "canary_contract": file_record(CONTRACT), "owned_sources": custody["sources"], "git_custody": custody,
        "protocol_adapter": "native_default_with_host_result_normalization_and_retry_recovery_failfast", "config_overlay": None,
        "expected_argv": argv, "dependencies": frozen_records("dependencies"), "frozen_storage_artifacts": frozen_records("frozen_storage_artifacts"),
        "authority_receipt": spec()["authority"], "normalization_contract": spec()["normalization"], "prefix_retry_gate": spec()["prefix_retry_gate"],
        "row_time_budget_seconds": 3600, "qualification_credit": 0, "matrix_credit": 0,
    })
    base.atomic_json(row_dir / "omp_preflight.json", receipt)
    return receipt


def verify_catalog_chain(row_dir: Path, receipt: dict[str, Any], launch: dict[str, Any], terminal: dict[str, Any]) -> str:
    preflight_path = row_dir / "omp_preflight.json"
    require(preflight_path.is_file() and not preflight_path.is_symlink(), "preflight file")
    digest = P.sha256_file(preflight_path)
    require(launch.get("omp_preflight_bytes") == preflight_path.stat().st_size and launch.get("omp_preflight_sha256") == digest, "launch/preflight bytes/hash")
    catalog, cache = receipt.get("catalog_refresh"), receipt.get("models_db_provider")
    require(isinstance(catalog, dict) and receipt.get("catalog_refresh_sha256") == receipt_digest(catalog), "catalog receipt digest")
    require(isinstance(cache, dict) and receipt.get("models_db_provider_sha256") == receipt_digest(cache), "models.db receipt digest")
    validate_catalog_receipt(catalog, launch.get("started_at_utc"))
    validate_models_db_receipt(cache, catalog, launch.get("started_at_utc"))
    admission = receipt.get("pre_popen_admission")
    admission_fields = {"schema_id", *IDENTITY, "admitted_at_utc", "argv_sha256", "catalog_refresh_sha256", "models_db_provider_sha256", "models_db_live_recheck", "models_db_live_recheck_sha256", "git_custody_sha256", "subject_popen_call_ordinal"}
    require(isinstance(admission, dict) and set(admission) == admission_fields and admission.get("schema_id") == "pm.r10.storage_pipeline.glm53_pre_popen_admission.v1", "pre-Popen admission shape")
    frozen = rows()[0]
    require(all(admission.get(field) == frozen[field] for field in IDENTITY), "pre-Popen frozen row identity")
    require(admission.get("argv_sha256") == P.sha256_bytes((P.canonical_json(launch.get("argv")) + "\n").encode("utf-8")), "pre-Popen argv digest")
    require(admission.get("catalog_refresh_sha256") == receipt["catalog_refresh_sha256"] and admission.get("models_db_provider_sha256") == receipt["models_db_provider_sha256"], "pre-Popen catalog/cache digests")
    require(admission.get("models_db_live_recheck_sha256") == receipt_digest(admission.get("models_db_live_recheck")), "pre-Popen live cache recheck digest")
    require(admission.get("git_custody_sha256") == receipt_digest(receipt["git_custody"]) and admission.get("subject_popen_call_ordinal") == 1, "pre-Popen custody/ordinal")
    launch_started, admitted = V.parse_utc(launch["started_at_utc"]), V.parse_utc(admission["admitted_at_utc"])
    require(0 <= (admitted - launch_started).total_seconds() <= 30, "pre-Popen admission chronology")
    validate_catalog_receipt(catalog, admission["admitted_at_utc"])
    validate_models_db_receipt(cache, catalog, admission["admitted_at_utc"])
    validate_live_models_db_recheck(admission["models_db_live_recheck"], cache, admission["admitted_at_utc"])
    record = {"path": "omp_preflight.json", "bytes": preflight_path.stat().st_size, "sha256": digest}
    require([item for item in terminal.get("evidence", []) if isinstance(item, dict) and item.get("path") == "omp_preflight.json"] == [record], "terminal/preflight evidence hash")
    journal = P.load_jsonl(EVIDENCE / "launch_journal.jsonl")
    require(len(journal) == 1 and journal[0].get("omp_preflight_sha256") == digest, "journal/preflight hash")
    return digest


def verify_receipt(row: dict[str, Any], custody: dict[str, Any]) -> None:
    row_dir = EVIDENCE / row["pass_id"] / row["route_id"]
    receipt, launch, terminal = (P.load_json(row_dir / name) for name in ("omp_preflight.json", "launch.json", "terminal.json"))
    require(receipt.get("canary_contract") == file_record(CONTRACT), "contract receipt")
    require(receipt.get("owned_sources") == custody["sources"] and receipt.get("git_custody") == custody, "exact pushed custody receipt")
    require(receipt.get("dependencies") == frozen_records("dependencies") and receipt.get("frozen_storage_artifacts") == frozen_records("frozen_storage_artifacts"), "dependency/artifact receipt")
    require(receipt.get("authority_receipt") == spec()["authority"] and receipt.get("normalization_contract") == spec()["normalization"] and receipt.get("prefix_retry_gate") == spec()["prefix_retry_gate"], "authority/adapter receipt")
    require(receipt.get("expected_argv") == expected_argv(route_map()[row["route_id"]], row) and launch.get("argv") == receipt["expected_argv"], "argv receipt")
    require(receipt.get("protocol_adapter") == row["protocol_adapter"] and receipt.get("config_overlay") is None and "--config" not in launch["argv"], "native/default receipt")
    config = receipt.get("effective_config", {})
    require(config.get("advisor.enabled") is False and config.get("task.agentAdvisor") == {"task": "off"}, "advisor receipt")
    require(receipt.get("row_time_budget_seconds") == 3600 and receipt.get("qualification_credit") == receipt.get("matrix_credit") == 0, "budget/credit receipt")
    verify_catalog_chain(row_dir, receipt, launch, terminal)
    session = terminal.get("session_projection", {})
    ids = session.get("entry_ids", {})
    lifecycle = ("goal_active", "goal_call_assistant", "goal_tool_start", "goal_result", "goal_complete_mode", "goal_completed", "goal_exit", "final_assistant")
    require(session.get("assistant_lifecycle_shape") == "standard_tool_cycle" and all(isinstance(ids.get(key), str) and ids[key] for key in lifecycle), "standard native Goal lifecycle")
    require(ids["goal_call_assistant"] != ids["final_assistant"] and session.get("assistant_message_count", 0) >= 2, "distinct final assistant")
    require(terminal.get("goal_activation_observed") is True and terminal.get("goal_complete_observed") is True and terminal.get("observed_non_goal_tool_calls") == 0, "Goal/tool receipt")
    require(terminal.get("process_exit_code") == 0 and terminal.get("status") == "PASS" and terminal.get("no_retry") is True, "normal exit/PASS receipt")
    require(session.get("assistant_api") == spec()["catalog_gate"]["expected_assistant_api"] and session.get("assistant_api_message_count") == session.get("assistant_message_count"), "assistant API receipt")
    guard = session.get("prefix_guard")
    require(isinstance(guard, dict) and guard.get("retryRecovery_count") == guard.get("rawBlock_count") == 0, "prefix retry/dialect receipt")
    result = session.get("result_normalization")
    require(isinstance(result, dict) and result.get("result_authority") == "deterministic_host_program_over_verified_assistant_text" and result.get("candidate_count", 0) >= 1, "normalized result receipt")
    require(result.get("canonical_text") == terminal.get("final_assistant_text") and result.get("canonical_sha256") == P.sha256_bytes(terminal["final_assistant_text"].encode("utf-8")), "canonical terminal join")
    base.exact_result(terminal["final_assistant_text"])


def generic_journal(reports: list[dict[str, Any]]) -> None:
    convert(prior.generic_journal, reports)


BINDING_NAMES = (
    "omp_row_runner.EVIDENCE", "omp_row_runner.route_map", "omp_row_runner.plan_rows", "omp_row_runner.planned_row",
    "omp_row_runner.expected_argv", "omp_row_runner.row_preflight", "omp_session.verify_session", "verify_matrix.EVIDENCE",
    "verify_matrix.launch_plan_map", "verify_matrix.expected_argv", "verify_matrix.verify_launch_journal", "omp_row_runner.subprocess",
)


def bindings() -> tuple[tuple[Any, str, Any], ...]:
    return (
        (base, "EVIDENCE", EVIDENCE), (base, "route_map", route_map), (base, "plan_rows", rows), (base, "planned_row", planned_row),
        (base, "expected_argv", expected_argv), (base, "row_preflight", row_preflight), (omp_session, "verify_session", verify_session),
        (V, "EVIDENCE", EVIDENCE), (V, "launch_plan_map", launch_plan_map), (V, "expected_argv", verifier_argv), (V, "verify_launch_journal", generic_journal),
        (base, "subprocess", BASE_SUBPROCESS),
    )


@contextlib.contextmanager
def installed() -> Iterator[None]:
    current = bindings()
    require(len(current) == 12, "exactly twelve adapter bindings")
    saved = [(module, name, getattr(module, name)) for module, name, _value in current]
    try:
        for module, name, value in current:
            setattr(module, name, value)
        yield
    finally:
        for module, name, value in reversed(saved):
            setattr(module, name, value)


def _prefix() -> dict[str, Any]:
    journal = base.journal_rows()
    require(len(journal) <= 1, "at most one journal row")
    if not journal:
        require(not os.path.lexists(EVIDENCE), "zero prefix requires absent evidence root")
    else:
        custody = git_custody()
        row = rows()[0]
        report = V.verify_row(row["pass_id"], route_map()[row["route_id"]])
        require(report.get("status") == "PASS", "fail-stop: GLM-5.3 canary is not PASS")
        verify_receipt(row, custody)
        reports = [{"pass_id": row["pass_id"], "rows": [report]}]
        V.verify_launch_journal(reports)
        V.verify_evidence_tree(reports)
        V.verify_global_uniqueness(reports)
        cwd, session_dir = Path(row["cwd"]), Path(row["session_dir"])
        require(cwd.is_dir() and not cwd.is_symlink() and not any(cwd.iterdir()), "completed cwd empty")
        live = base.session_file(session_dir)
        require(live is not None and P.sha256_file(live) == report["raw_primary_sha256"], "persistent/raw session join")
    return {"status": "PASS_GLM53_NORMALIZED_CANARY_ZERO_CREDIT" if journal else "PASS_EMPTY_GLM53_NORMALIZED_CANARY_PREFIX_ZERO_CREDIT", "row_count": len(journal), "required_rows": 1, "subject_calls": 0, "qualification_credit": 0, "matrix_credit": 0}


def verify_prefix() -> dict[str, Any]:
    with installed():
        return _prefix()


def prior_rows() -> Iterator[tuple[Path, dict[str, Any]]]:
    yield from convert(lambda: list(prior.prior_rows()))


def metric(path: Path) -> dict[str, int]:
    raw = path.read_bytes()
    return {"lines": len(raw.splitlines()), "bytes": len(raw)}


def validate_authority(authority: dict[str, Any]) -> None:
    source_record = authority["source_normalized_canary_contract"]
    require(source_record == file_record(PRIOR_ROOT / "canary_contract.json"), "fallback authority source contract")
    source = P.load_json(PRIOR_ROOT / "canary_contract.json")
    goal = source["governance_goal_receipt"]
    exchange = source["authority"]["normalization_exchange"]
    require(P.sha256_bytes(P.canonical_json(goal).encode("utf-8")) == authority["source_governance_goal_receipt_canonical_sha256"] == "25d37bd7e204d6b721b95f06fed22a06206252741bce829e85844e9d1df8e754", "active Goal receipt digest")
    require(P.sha256_bytes(P.canonical_json(exchange).encode("utf-8")) == authority["source_normalization_exchange_canonical_sha256"] == "bf88c286efe4f4f3a6049569d3fe859b12746bb9e2d8d7762e7fbfd29d298ae2", "normalization authority digest")
    active = authority["active_goal_receipt"]
    require(authority["source_thread_id"] == goal["source_thread_id"] == active["goal_thread_id"] and active["status"] == goal["status"] == "active", "active Goal identity/status")
    for key in ("created_at", "updated_at", "objective_utf8_bytes", "objective_sha256", "create_call_id", "create_call_timestamp", "create_call_jsonl_line_sha256_including_lf", "create_output_timestamp", "create_output_jsonl_line_sha256_including_lf"):
        require(active[key] == goal[key], f"active Goal receipt {key}")
    clause = authority["exact_fallback_clause_utf8"]
    raw = clause.encode("utf-8")
    require(len(raw) == authority["exact_fallback_clause_utf8_bytes"] == 210 and P.sha256_bytes(raw) == authority["exact_fallback_clause_sha256"] == "6aa43063b1681d07a008fdeb3bc6679bc2cee5ad10fb3f5364fd48adcdda05b4", "fallback clause bytes/hash")
    require(clause in goal["objective_utf8"] and "host must be deterministic program code, not another agent" in goal["objective_utf8"], "Goal fallback/normalization authority")
    row = rows()[0]
    require(authority["authorized_attempt_ids"] == [row["attempt_id"]] and authority["authorized_selector"] == row["model"] and authority["authorized_thinking"] == row["thinking"] and authority["authorized_fresh_fallback_canary_count"] == 1, "one exact fallback authority")
    require(all(authority[key] is False for key in ("retry_replacement_reuse_or_retro_credit_authorized", "other_route_or_subject_authorized_by_this_contract", "matrix_launch_authorized_by_this_canary_contract")), "authority ceiling")


def validate_static(*, unused: bool) -> dict[str, Any]:
    contract, row, route = spec(), rows()[0], next(iter(route_map().values()))
    require(contract.get("schema_id") == "pm.r10.storage_pipeline.storage_glm53_normalized_canary.v1", "schema")
    actual = {path.name for path in HERE.iterdir()}
    require(actual == set(SOURCES) if unused else actual in (set(SOURCES), set(SOURCES) | {"evidence"}), "package root roster")
    require(contract.get("owned_file_roster") == list(SOURCES) and all((HERE / name).is_file() and not (HERE / name).is_symlink() for name in SOURCES), "five regular sources")
    metrics = {name: metric(HERE / name) for name in SOURCES}
    limits = contract["architecture_limits"]
    for name, prefix in (("controller.py", "controller"), ("result_normalizer.py", "normalizer"), ("selftest.py", "selftest")):
        require(metrics[name]["lines"] <= limits[f"{prefix}_max_physical_lines"] and metrics[name]["bytes"] <= limits[f"{prefix}_max_bytes"], f"{prefix} budget")
    python = [metrics[name] for name in ("controller.py", "result_normalizer.py", "selftest.py")]
    require(sum(item["lines"] for item in python) <= limits["all_python_max_physical_lines"] and sum(item["bytes"] for item in python) <= limits["all_python_max_bytes"], "Python budget")
    require(sum(item["lines"] for item in metrics.values()) <= limits["total_max_physical_lines"] and sum(item["bytes"] for item in metrics.values()) <= limits["total_max_bytes"], "package budget")
    require(contract["temporary_bindings"] == list(BINDING_NAMES) and limits["temporary_binding_count"] == 12 and limits["copied_v7_runner_parser_scorer_verifier_body_count"] == 0, "architecture freeze")
    frozen_records("dependencies")
    artifacts = frozen_records("frozen_storage_artifacts")
    require(file_record(REPO / contract["historic_identity_root"]["path"]) == contract["historic_identity_root"], "historic root freeze")
    require((HERE / "result_normalizer.py").read_bytes() == (PRIOR_ROOT / "result_normalizer.py").read_bytes() and P.sha256_file(HERE / "result_normalizer.py") == "382cb5bb0b357bc223010a813dbef7e9c8daf8f952568db0ce4d5e1620129a43", "byte-identical normalized result program")
    prompt = V7 / "prompts/omp.prompt.txt"
    require(artifacts[0] == file_record(prompt) and prompt.stat().st_size == 3036 and P.sha256_file(prompt) == "eff40a61579a080ce6e21bb71bcae2dd0640c100c9d61c199f45ac5dece43638", "exact V7 prompt")
    suffix = row["nonce"][:10]
    require((row["ordinal"], row["pass_id"], row["route_id"], row["surface"], row["model"], row["thinking"]) == (1, "pass_01", "omp_glm53_flash_xhigh", "omp_tui", "opencode-go/glm-5.3-flash", "xhigh"), "route identity")
    require(route == {"id": row["route_id"], "surface": row["surface"], "model": row["model"], "thinking": row["thinking"]}, "route join")
    require(row["attempt_id"] == f"storage-glm53-normalized-canary-v1-01-{suffix}" and len(row["nonce"]) == 32 and all(character in "0123456789abcdef" for character in row["nonce"]), "attempt/nonce")
    require(row["cwd"] == f"/tmp/pm-r10-storage-v7-glm53-normalized-canary-v1-01-{suffix}" and row["session_dir"] == f"/tmp/pm-r10-storage-v7-session-glm53-normalized-canary-v1-01-{suffix}", "runtime identity")
    require(row["evidence_path"] == "evidence/pass_01/omp_glm53_flash_xhigh" and row["prompt_utf8_bytes"] == 3036 and row["prompt_sha256"] == P.sha256_file(prompt), "evidence/prompt")
    argv = expected_argv(route, row)
    require("--config" not in argv and "--no-tools" in argv and argv[-4:] == ["--model", row["model"], "--thinking", row["thinking"]], "native argv")
    for root, historical in prior_rows():
        require(all(field not in historical or row[field] != historical[field] for field in ("attempt_id", "nonce", "cwd", "session_dir")), "historic identity disjointness")
        if "evidence_path" in historical:
            require((HERE / row["evidence_path"]).resolve() != (root / historical["evidence_path"]).resolve(), "historic evidence disjointness")
    runtime = contract["runtime"]
    binary = Path(runtime["binary"])
    require(binary.is_file() and not binary.is_symlink() and binary.stat().st_size == runtime["binary_bytes"] and P.sha256_file(binary) == runtime["binary_sha256"] and runtime["version"] == "omp/18.0.4", "OMP binary/version")
    require(runtime["row_time_budget_seconds"] == 3600 and runtime["advisor_enabled"] is False and runtime["task_agent_advisor"] == {"task": "off"} and runtime["ordinary_tools_enabled"] is runtime["skills_enabled"] is runtime["rules_enabled"] is False, "runtime restrictions")
    require(runtime["config_overlay"] is None and runtime["external_goal_prompt_count"] == 1 and runtime["native_goal_required"] is runtime["normal_exit_required"] is runtime["isolated_linux_only"] is runtime["windows_omp_terminal_processes_are_foreign"] is True, "native/Linux runtime")
    gate = contract["catalog_gate"]
    require(gate["argv"] == [runtime["binary"], "models", "refresh", "opencode-go", "--json", "--no-extensions"] and gate["profile_dir"] == runtime["profile_dir"] and gate["models_db_path"] == f'{runtime["profile_dir"]}/models.db', "catalog/profile path")
    require(gate["command_timeout_seconds"] == 30 and gate["freshness_to_popen_max_seconds"] == 60 and gate["expected_assistant_api"] == "openai-completions" and gate["resolved_model_is_fallback"] is False and gate["nonzero_exact_price_required"] is True, "catalog/API/fallback gate")
    require(gate["pre_popen_live_database_recheck_required"] is gate["live_recheck_bound_through_preflight_launch_journal_terminal"] is True and gate["captured_file_identity_fields"] == ["path", "present", "file_type", "path_chain_symlink_safe", "bytes", "sha256", "mode", "mtime_ns", "device", "inode"], "live cache recheck contract")
    require(gate["expected_cli_model"]["selector"] == row["model"] and gate["required_thinking_effort"] == row["thinking"] and gate["expected_cli_model"]["cost"] == {"input": 0.075, "output": 0.25, "cacheRead": 0.015, "cacheWrite": 0}, "catalog selector/price")
    require(gate["expected_cache_target_canonical_utf8_bytes"] == 3593 and gate["expected_cache_target_canonical_sha256"] == "b7e47808c4031e222503e2c5e1ed4163f56350ba2ad46893018a755661c67cce", "cache target freeze")
    require(contract["normalization"] == P.load_json(PRIOR_ROOT / "canary_contract.json")["normalization"], "unchanged normalization contract")
    require(contract["prefix_retry_gate"] == {"accepted_prefix_verified_by_v7": True, "live_trace_reverified_by_v7_submission_prefix": True, "accepted_entry_ids_must_be_exact_prefix_of_live_entry_ids": True, "stable_prefix_entries_may_add_only_nonnegative_errorId_and_retryRecovery_fields": True, "non_null_retryRecovery_is_permanent_terminal_failure": True, "active_retry_free_trace_remains_transient_pending": True, "assistant_rawBlock_is_permanent_terminal_failure": True, "owned_glm_projection_allowed": False}, "closed retry/dialect gate")
    sequence = contract["sequencing"]
    require(sequence == {"required_rows": 1, "exact_route_order": [row["route_id"]], "all_rows_count": True, "only_next_ordinal_launchable": True, "fail_stop_on_first_failure_or_custody_mismatch": True, "retry_count": 0, "replacement_count": 0, "best_of": False, "qualification_credit": 0, "matrix_credit": 0, "production_credit": 0, "automatically_authorizes_matrix_or_successor": False}, "one-row fail-stop")
    validate_authority(contract["authority"])
    require(contract["source_candidate_commit"] is None, "non-self-referential live Git custody")
    require(P.preflight_inputs()["status"] == "PASS" and P.verify()["status"] == "PASS_VERIFIED_NO_WORKNODES" and freeze_check.verify_freeze()["status"] == "PASS_FROZEN_ZERO_SUBJECT", "V7 pipeline/freeze")
    if unused:
        require(not os.path.lexists(EVIDENCE) and not os.path.lexists(row["cwd"]) and not os.path.lexists(row["session_dir"]), "unused evidence/runtime absent")
    require(not list(HERE.rglob("*.pyc")) and not list(HERE.rglob("__pycache__")), "no cache")
    return {"status": "PASS_LOCAL_GLM53_NORMALIZED_CANARY_PRELAUNCH", "rows": 1, "temporary_bindings": 12, "metrics": metrics, "subject_calls": 0, "qualification_credit": 0, "matrix_credit": 0}


def require_authority(row: dict[str, Any]) -> None:
    authority = spec()["authority"]
    validate_authority(authority)
    require(authority["authorized_attempt_ids"] == [row["attempt_id"]] and row["model"] == authority["authorized_selector"] and row["thinking"] == authority["authorized_thinking"], "exact GLM-5.3 fallback authority")


def claim_after_failure(row: dict[str, Any], before: tuple[bool, bool, bool] | None) -> bool:
    return bool(convert(prior.claim_after_failure, row, before))


def preserve_postfailure(row: dict[str, Any]) -> None:
    convert(prior.preserve_postfailure, row)


ERRORS = (ControllerError, PermanentPrefixError, normalizer.NormalizationError, base.RunnerError, omp_session.OmpSessionError, V.VerifyError, P.PipelineError, sqlite3.Error, subprocess.SubprocessError, OSError, ValueError, KeyError, TypeError, AssertionError)


def dispatch(argv: list[str] | None = None) -> int:
    global DISPATCH_CUSTODY
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=("lint", "verify-prefix", "run"))
    parser.add_argument("ordinal", nargs="?", type=int, choices=(1,))
    parser.add_argument("--max-seconds", type=int, default=3600)
    args = parser.parse_args(argv)
    row = None
    before = None
    try:
        require((args.command == "run") == (args.ordinal is not None), "ordinal only for run")
        static = validate_static(unused=args.command == "lint")
        if args.command == "lint":
            print(P.canonical_json({"status": "PASS_ZERO_SUBJECT_LINT", **static}))
            return 0
        if args.command == "verify-prefix":
            print(P.canonical_json(verify_prefix()))
            return 0
        require(args.max_seconds == 3600, "frozen 3600-second row budget")
        row = rows()[0]
        require_authority(row)
        DISPATCH_CUSTODY = git_custody()
        with installed():
            prefix = _prefix()
            require(prefix["row_count"] == 0, "GLM-5.3 canary already consumed")
            row_dir = EVIDENCE / row["pass_id"] / row["route_id"]
            before = tuple(os.path.lexists(path) for path in (EVIDENCE, row_dir.parent, row_dir))
            terminal = base.run_row(row["pass_id"], row["route_id"], 3600)
    except base.ReservationConflict as exc:
        print(P.canonical_json({"status": "FAIL_ALREADY_CONSUMED_NO_MUTATION", "error": f"{type(exc).__name__}: {exc}", "qualification_credit": 0, "matrix_credit": 0}))
        return 1
    except ERRORS as exc:
        claimed = row is not None and before is not None and claim_after_failure(row, before)
        if claimed:
            try:
                preserve_postfailure(row)
            except ERRORS as preserve_exc:
                exc = ControllerError(f"{type(exc).__name__}: {exc}; postfailure preserve: {type(preserve_exc).__name__}: {preserve_exc}")
            with installed():
                base.record_failure(row["pass_id"], row["route_id"], exc)
            failure = P.load_json(EVIDENCE / row["pass_id"] / row["route_id"] / "terminal.json")
            require(failure.get("status") == "FAIL" and failure.get("no_retry") is True, "durable failure terminal")
        print(P.canonical_json({"status": "FAIL_GLM53_NORMALIZED_CANARY_CONSUMED_NO_RETRY" if claimed else "FAIL_PRELAUNCH_NO_MUTATION", "error": f"{type(exc).__name__}: {exc}", "qualification_credit": 0, "matrix_credit": 0}))
        return 1
    finally:
        DISPATCH_CUSTODY = None
    print(P.canonical_json({"status": "PASS_GLM53_NORMALIZED_CANARY_ZERO_CREDIT", "ordinal": 1, "terminal": terminal, "qualification_credit": 0, "matrix_credit": 0}))
    return 0


if __name__ == "__main__":
    raise SystemExit(dispatch())
