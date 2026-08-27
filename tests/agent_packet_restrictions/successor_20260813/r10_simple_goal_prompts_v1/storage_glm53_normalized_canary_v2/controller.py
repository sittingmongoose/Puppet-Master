#!/usr/bin/env python3
"""Fresh GLM-5.3 semantic-cache successor diagnostic."""
from __future__ import annotations

import argparse
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
PRIOR_ROOT = R10 / "storage_glm53_normalized_canary_v1"
HELPER = HERE / "provider_catalog_helper.ts"
OMP_SOURCE = Path("/home/sittingmongoose/OMP-G3-SOURCE")
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


prior = external("r10_storage_glm53_normalized_canary_v1_base", PRIOR_ROOT / "controller.py", PRIOR_ROOT)
CONTRACT = HERE / "canary_contract.json"
EVIDENCE = HERE / "evidence"
SOURCES = ("README.md", "canary_contract.json", "controller.py", "provider_catalog_helper.ts", "result_normalizer.py", "selftest.py")
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


def git_bytes(argv: list[str], *, cwd: Path) -> bytes:
    result = subprocess.run(argv, cwd=str(cwd), capture_output=True, check=False)
    require(result.returncode == 0 and result.stderr == b"", f"Git plumbing failed: {' '.join(argv)}")
    return result.stdout


def helper_runtime_sources() -> list[dict[str, Any]]:
    """Rejoin each direct OMP helper API source to the exact clean HEAD blob."""
    runtime = spec()["catalog_gate"]["helper_runtime"]
    require(runtime["omp_source_root"] == str(OMP_SOURCE), "OMP source root")
    head = git_bytes(["git", "rev-parse", "HEAD"], cwd=OMP_SOURCE).decode("ascii").strip()
    require(head == runtime["omp_source_commit"], "OMP source commit drift")
    actual: list[dict[str, Any]] = []
    for expected in runtime["omp_source_files"]:
        require(set(expected) == {"path", "bytes", "sha256", "git_mode", "git_blob_oid"}, "OMP source record shape")
        path = Path(expected["path"])
        require(path.is_relative_to(OMP_SOURCE) and path.is_file() and not path.is_symlink(), "OMP source regular path")
        current = OMP_SOURCE
        require(not current.is_symlink(), "OMP source root symlink")
        for part in path.relative_to(OMP_SOURCE).parts[:-1]:
            current /= part
            require(current.is_dir() and not current.is_symlink(), "OMP source parent symlink")
        relative = path.relative_to(OMP_SOURCE).as_posix()
        index = git_bytes(["git", "ls-files", "-s", "--", relative], cwd=OMP_SOURCE).decode("utf-8").splitlines()
        tree = git_bytes(["git", "ls-tree", "HEAD", "--", relative], cwd=OMP_SOURCE).decode("utf-8").splitlines()
        require(len(index) == len(tree) == 1, "OMP source exact index/tree entry")
        index_meta, index_path = index[0].split("\t", 1)
        tree_meta, tree_path = tree[0].split("\t", 1)
        index_mode, index_oid, stage = index_meta.split()
        tree_mode, object_type, tree_oid = tree_meta.split()
        require(index_path == tree_path == relative and stage == "0" and object_type == "blob", "OMP source path/stage/type")
        require(index_mode == tree_mode == expected["git_mode"] and index_oid == tree_oid == expected["git_blob_oid"], "OMP source index/tree blob drift")
        raw = path.read_bytes()
        require(raw == git_bytes(["git", "cat-file", "blob", tree_oid], cwd=OMP_SOURCE), "OMP source live/HEAD blob drift")
        record = {**expected, "bytes": len(raw), "sha256": P.sha256_bytes(raw)}
        require(record == expected, "OMP source bytes/hash drift")
        actual.append(record)
    return actual


@contextlib.contextmanager
def prior_scope() -> Iterator[None]:
    values = {"HERE": HERE, "REPO": REPO, "CONTRACT": CONTRACT, "EVIDENCE": EVIDENCE, "SOURCES": SOURCES, "DISPATCH_CUSTODY": DISPATCH_CUSTODY, "spec": spec}
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
    return convert(prior.native_convert, call, *args, **kwargs)


def raw_record(raw: bytes) -> dict[str, Any]:
    return convert(prior.raw_record, raw)


def raw_bytes(record: Any, label: str) -> bytes:
    return convert(prior.raw_bytes, record, label)


def catalog_result(raw: bytes) -> dict[str, Any]:
    require(raw.endswith(b"\n") and raw.count(b"\n") == 1 and b"\r" not in raw, "provider helper stdout one exact LF JSON line")
    try:
        value = P.strict_loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, P.PipelineError, ValueError, TypeError) as exc:
        raise ControllerError("provider helper stdout strict JSON") from exc
    fields = {"schema_id", "runtime_version", "provider_filter", "strategy", "discovery_invocation_count", "local_model_config_loaded", "extensions_loaded", "online_if_uncached_followup", "models"}
    require(isinstance(value, dict) and set(value) == fields and value["schema_id"] == "pm.r10.storage_pipeline.omp_provider_only_catalog_result.v1", "provider helper result shape/schema")
    require(value["runtime_version"] == "1.4.0" and value["provider_filter"] == ["opencode-go"] and value["strategy"] == "online" and value["discovery_invocation_count"] == 1, "provider helper exact runtime/scoped discovery")
    require(value["local_model_config_loaded"] is False and value["extensions_loaded"] is False and value["online_if_uncached_followup"] is False, "provider helper no local config/extensions/followup")
    require(isinstance(value["models"], list) and value["models"] and all(isinstance(model, dict) and model.get("provider") == "opencode-go" and isinstance(model.get("selector"), str) for model in value["models"]), "provider helper result provider roster")
    require(len({model["selector"] for model in value["models"]}) == len(value["models"]), "provider helper duplicate selector")
    return value


def catalog_projection(raw: bytes) -> dict[str, Any]:
    value = catalog_result(raw)
    models = value["models"]
    selector = spec()["catalog_gate"]["expected_cli_model"]["selector"]
    matches = [model for model in models if model.get("selector") == selector]
    require(len(matches) == 1, "catalog exact unique GLM-5.3 selector")
    expected_keys = {"provider", "id", "selector", "name", "contextWindow", "maxTokens", "reasoning", "thinking", "input", "cost"}
    require(set(matches[0]) == expected_keys, "catalog GLM-5.3 model shape")
    return {"model_count": len(models), "exact_selector_count": 1, "provider_filter": value["provider_filter"], "strategy": value["strategy"], "discovery_invocation_count": value["discovery_invocation_count"], "local_model_config_loaded": value["local_model_config_loaded"], "model": matches[0]}


def validate_catalog_projection(projection: Any) -> None:
    gate = spec()["catalog_gate"]
    require(isinstance(projection, dict) and set(projection) == {"model_count", "exact_selector_count", "provider_filter", "strategy", "discovery_invocation_count", "local_model_config_loaded", "model"}, "catalog projection shape")
    require(type(projection["model_count"]) is int and projection["model_count"] > 0 and projection["exact_selector_count"] == 1, "catalog projection counts")
    require(projection["provider_filter"] == ["opencode-go"] and projection["strategy"] == "online" and projection["discovery_invocation_count"] == 1 and projection["local_model_config_loaded"] is False, "catalog scoped isolated discovery projection")
    require(projection["model"] == gate["expected_cli_model"], "catalog exact GLM-5.3 projection")
    cost = projection["model"]["cost"]
    require(all(type(cost[key]) in (int, float) and not isinstance(cost[key], bool) for key in cost), "catalog price types")
    require(cost["input"] > 0 and cost["output"] > 0 and cost["cacheRead"] > 0 and cost["cacheWrite"] == 0, "catalog exact nonzero price class")
    require(projection["model"]["reasoning"] is True and gate["required_thinking_effort"] in projection["model"]["thinking"], "catalog reasoning/xhigh")


def provider_projection(raw: bytes) -> dict[str, Any]:
    try:
        projection = convert(prior.provider_projection, raw)
        row = P.strict_loads(raw.decode("utf-8"))
    except (UnicodeError, P.PipelineError, ValueError, TypeError) as exc:
        raise ControllerError("models.db provider record strict projection") from exc
    projection.update({
        "header_omitted_model_ids": P.strict_loads(row["header_omitted_model_ids"]),
        "unrestorable_header_model_ids": P.strict_loads(row["unrestorable_header_model_ids"]),
        "header_restore_version": row["header_restore_version"],
    })
    return projection


def receipt_digest(receipt: dict[str, Any]) -> str:
    return P.sha256_bytes((P.canonical_json(receipt) + "\n").encode("utf-8"))


def forced_catalog_refresh() -> dict[str, Any]:
    gate, runtime = spec()["catalog_gate"], spec()["catalog_gate"]["helper_runtime"]
    helper_source = file_record(HELPER)
    require(helper_source == gate["helper_source"], "provider helper source drift")
    sources_before = helper_runtime_sources()
    environment = dict(os.environ)
    environment.update(gate["profile_environment"])
    started = base.utc_now()
    timed_out = False
    try:
        completed = subprocess.run(gate["argv"], cwd=str(HERE), env=environment, capture_output=True, text=False, timeout=gate["command_timeout_seconds"], check=False)
        exit_code, stdout, stderr = completed.returncode, completed.stdout, completed.stderr
    except subprocess.TimeoutExpired as exc:
        timed_out, exit_code = True, None
        stdout = exc.stdout if isinstance(exc.stdout, bytes) else b""
        stderr = exc.stderr if isinstance(exc.stderr, bytes) else b""
    finished = base.utc_now()
    helper_source_after: dict[str, Any] | None = None
    sources_after: list[dict[str, Any]] | None = None
    runtime_custody_error: str | None = None
    try:
        helper_source_after = file_record(HELPER)
        sources_after = helper_runtime_sources()
    except (ControllerError, OSError, ValueError, TypeError) as exc:
        runtime_custody_error = f"{type(exc).__name__}: {exc}"
    result: dict[str, Any] | None = None
    projection: dict[str, Any] | None = None
    projection_error: str | None = None
    try:
        result = catalog_result(stdout)
        projection = catalog_projection(stdout)
    except (ControllerError, P.PipelineError, V.VerifyError, ValueError, TypeError) as exc:
        projection_error = f"{type(exc).__name__}: {exc}"
    return {
        "schema_id": "pm.r10.storage_pipeline.omp_provider_only_catalog_refresh_preflight.v2", "name": "forced_provider_only_catalog_refresh",
        "started_at_utc": started, "finished_at_utc": finished,
        "duration_ms": int((V.parse_utc(finished) - V.parse_utc(started)).total_seconds() * 1000),
        "argv": gate["argv"], "cwd": str(HERE), "profile_dir": gate["profile_dir"], "profile_environment": gate["profile_environment"],
        "helper_source": helper_source, "helper_source_after": helper_source_after, "helper_runtime": runtime,
        "runtime_sources_before": sources_before, "runtime_sources_after": sources_after, "runtime_custody_error": runtime_custody_error,
        "provider_filter": gate["provider_filter"], "strategy": gate["strategy"], "forced_online": True, "local_model_config_loaded": False, "extensions_disabled": True,
        "timeout_seconds": gate["command_timeout_seconds"], "timed_out": timed_out, "exit_code": exit_code,
        "stdout": raw_record(stdout), "stderr": raw_record(stderr), "result": raw_record(stdout), "result_sha256": P.sha256_bytes(stdout),
        "result_value": result, "projection": projection, "projection_error": projection_error,
    }


PROVIDER_FIELDS = ("provider_id", "version", "updated_at", "authoritative", "static_fingerprint", "header_omitted_model_ids", "unrestorable_header_model_ids", "header_restore_version", "models")


def path_safety(path: Path) -> dict[str, Any]:
    """Describe only safety, never physical cache authority."""
    for parent in [path.parent, *path.parents[1:]]:
        if parent == Path("/"):
            break
        require(os.path.lexists(parent) and not parent.is_symlink(), f"unsafe or absent cache parent: {path}")
    require(os.path.lexists(path), f"required cache file absent: {path}")
    value = path.lstat()
    require(stat.S_ISREG(value.st_mode) and not stat.S_ISLNK(value.st_mode), f"cache path not a regular non-symlink: {path}")
    mode = stat.S_IMODE(value.st_mode)
    require(mode & 0o022 == 0, f"cache path group/world writable: {path}")
    return {"path": str(path), "present": True, "file_type": "regular", "path_chain_symlink_safe": True, "mode": mode}


def optional_path_safety(path: Path) -> dict[str, Any]:
    if not os.path.lexists(path):
        return {"path": str(path), "present": False, "file_type": None, "path_chain_symlink_safe": True, "mode": None}
    return path_safety(path)


def semantic_projection(projection: dict[str, Any]) -> dict[str, Any]:
    fields = ("provider_id", "provider_cache_schema_version", "authoritative", "static_fingerprint", "header_omitted_model_ids", "unrestorable_header_model_ids", "header_restore_version", "target_canonical_utf8_bytes", "target_canonical_sha256", "model")
    require(all(field in projection for field in fields), "provider semantic projection fields")
    return {field: projection[field] for field in fields}


def sqlite_semantic_receipt(name: str) -> dict[str, Any]:
    """Capture one complete provider query inside a read-only read transaction."""
    gate, path = spec()["catalog_gate"], Path(spec()["catalog_gate"]["models_db_path"])
    started = base.utc_now()
    rows_found: list[tuple[Any, ...]] = []
    before: dict[str, Any] | None = None
    after: dict[str, Any] | None = None
    journal_mode: str | None = None
    query_only: bool | None = None
    error: str | None = None
    connection: sqlite3.Connection | None = None
    transaction_started = False
    try:
        before = {"main": path_safety(path), "wal": optional_path_safety(Path(str(path) + "-wal"))}
        connection = sqlite3.connect(f"file:{path}?mode=ro", uri=True, isolation_level=None, timeout=0.0)
        connection.execute("PRAGMA query_only=ON")
        query_only = connection.execute("PRAGMA query_only").fetchone() == (1,)
        journal_mode_row = connection.execute("PRAGMA journal_mode").fetchone()
        journal_mode = journal_mode_row[0] if isinstance(journal_mode_row, tuple) and len(journal_mode_row) == 1 else None
        connection.execute("BEGIN")
        transaction_started = True
        rows_found = connection.execute(gate["models_db_query"], (gate["models_db_query_parameter"],)).fetchall()
        connection.execute("ROLLBACK")
        transaction_started = False
        after = {"main": path_safety(path), "wal": optional_path_safety(Path(str(path) + "-wal"))}
    except (ControllerError, sqlite3.Error, OSError) as exc:
        error = f"{type(exc).__name__}: {exc}"
    finally:
        if connection is not None:
            if transaction_started:
                try:
                    connection.execute("ROLLBACK")
                except sqlite3.Error:
                    pass
            connection.close()
    finished = base.utc_now()
    row_objects = [dict(zip(PROVIDER_FIELDS, row)) if len(row) == len(PROVIDER_FIELDS) else {"malformed_column_count": len(row)} for row in rows_found]
    query_raw = (P.canonical_json({"rows": row_objects}) + "\n").encode("utf-8")
    provider_raw = (P.canonical_json(row_objects[0]) + "\n").encode("utf-8") if len(row_objects) == 1 and set(row_objects[0]) == set(PROVIDER_FIELDS) else b""
    projection: dict[str, Any] | None = None
    projection_error: str | None = None
    semantic: dict[str, Any] | None = None
    try:
        projection = provider_projection(provider_raw)
        semantic = semantic_projection(projection)
    except (ControllerError, P.PipelineError, V.VerifyError, ValueError, TypeError) as exc:
        projection_error = f"{type(exc).__name__}: {exc}"
    return {
        "schema_id": "pm.r10.storage_pipeline.sqlite_semantic_provider_receipt.v1", "name": name,
        "started_at_utc": started, "finished_at_utc": finished,
        "duration_ms": int((V.parse_utc(finished) - V.parse_utc(started)).total_seconds() * 1000),
        "database_path": str(path), "uri_mode": "ro", "query_only": query_only,
        "transaction": "explicit_read_rollback", "journal_mode": journal_mode,
        "path_safety_before": before, "path_safety_after": after,
        "query": gate["models_db_query"], "query_parameter": gate["models_db_query_parameter"], "row_count": len(rows_found),
        "query_result": raw_record(query_raw), "provider_record": raw_record(provider_raw),
        "projection": projection, "projection_error": projection_error, "semantic_projection": semantic,
        "semantic_sha256": receipt_digest(semantic) if semantic is not None else None, "transaction_error": error,
    }


def validate_catalog_receipt(receipt: Any, launch_started_at: str | None = None) -> None:
    gate = spec()["catalog_gate"]
    fields = {"schema_id", "name", "started_at_utc", "finished_at_utc", "duration_ms", "argv", "cwd", "profile_dir", "profile_environment", "helper_source", "helper_source_after", "helper_runtime", "runtime_sources_before", "runtime_sources_after", "runtime_custody_error", "provider_filter", "strategy", "forced_online", "local_model_config_loaded", "extensions_disabled", "timeout_seconds", "timed_out", "exit_code", "stdout", "stderr", "result", "result_sha256", "result_value", "projection", "projection_error"}
    require(isinstance(receipt, dict) and set(receipt) == fields, "provider-only catalog receipt shape")
    require(receipt["schema_id"] == "pm.r10.storage_pipeline.omp_provider_only_catalog_refresh_preflight.v2" and receipt["name"] == "forced_provider_only_catalog_refresh", "provider-only catalog receipt schema/name")
    require(receipt["argv"] == gate["argv"] and receipt["cwd"] == str(HERE) and receipt["profile_dir"] == gate["profile_dir"] and receipt["profile_environment"] == gate["profile_environment"], "provider helper invocation/profile")
    require(receipt["runtime_custody_error"] is None, "provider helper post-call runtime custody")
    require(receipt["helper_source"] == receipt["helper_source_after"] == gate["helper_source"] == file_record(HELPER) and receipt["helper_runtime"] == gate["helper_runtime"], "provider helper source/runtime receipt")
    require(receipt["runtime_sources_before"] == receipt["runtime_sources_after"] == gate["helper_runtime"]["omp_source_files"], "provider helper runtime source custody")
    started, finished = V.parse_utc(receipt["started_at_utc"]), V.parse_utc(receipt["finished_at_utc"])
    require(receipt["duration_ms"] == int((finished - started).total_seconds() * 1000) and 0 <= receipt["duration_ms"] <= gate["command_timeout_seconds"] * 1000, "provider helper chronology")
    stdout = raw_bytes(receipt["stdout"], "provider helper stdout")
    stderr = raw_bytes(receipt["stderr"], "provider helper stderr")
    result_raw = raw_bytes(receipt["result"], "provider helper result")
    require(stdout == result_raw and receipt["result_sha256"] == P.sha256_bytes(result_raw), "provider helper stdout/result raw join")
    require(receipt["provider_filter"] == gate["provider_filter"] == ["opencode-go"] and receipt["strategy"] == gate["strategy"] == "online", "provider-only filter/strategy")
    require(receipt["forced_online"] is True and receipt["local_model_config_loaded"] is gate["helper_runtime"]["local_model_config_loaded"] is False and receipt["extensions_disabled"] is True and receipt["timeout_seconds"] == gate["command_timeout_seconds"], "provider helper forced online/no local config/extensions")
    require(receipt["timed_out"] is False and receipt["exit_code"] == 0 and stderr == b"", "provider helper clean exit")
    result = catalog_result(result_raw)
    require(receipt["result_value"] == result and receipt["projection_error"] is None and receipt["projection"] == catalog_projection(result_raw), "provider helper raw/result/projection join")
    validate_catalog_projection(receipt["projection"])
    if launch_started_at is not None:
        freshness = (V.parse_utc(launch_started_at) - finished).total_seconds()
        require(0 <= freshness <= gate["freshness_to_popen_max_seconds"], "provider helper freshness to Popen")


def validate_path_safety(value: Any, path: str, *, required: bool) -> None:
    fields = {"path", "present", "file_type", "path_chain_symlink_safe", "mode"}
    require(isinstance(value, dict) and set(value) == fields and value.get("path") == path and type(value.get("present")) is bool and value.get("path_chain_symlink_safe") is True, "cache path safety shape")
    if value["present"]:
        require(value["file_type"] == "regular" and type(value["mode"]) is int and value["mode"] & 0o022 == 0, "cache regular nonsymlink mode")
    else:
        require(not required and value["file_type"] is value["mode"] is None, "optional cache path absence")


def validate_semantic_receipt(receipt: Any, catalog: dict[str, Any], *, initial: dict[str, Any] | None = None, admitted_at: str | None = None) -> None:
    gate = spec()["catalog_gate"]
    fields = {"schema_id", "name", "started_at_utc", "finished_at_utc", "duration_ms", "database_path", "uri_mode", "query_only", "transaction", "journal_mode", "path_safety_before", "path_safety_after", "query", "query_parameter", "row_count", "query_result", "provider_record", "projection", "projection_error", "semantic_projection", "semantic_sha256", "transaction_error"}
    require(isinstance(receipt, dict) and set(receipt) == fields, "SQLite semantic receipt shape")
    require(receipt["schema_id"] == "pm.r10.storage_pipeline.sqlite_semantic_provider_receipt.v1" and receipt["name"] in ("initial_post_refresh", "immediate_pre_popen"), "SQLite semantic receipt schema/name")
    started, finished = V.parse_utc(receipt["started_at_utc"]), V.parse_utc(receipt["finished_at_utc"])
    require(receipt["duration_ms"] == int((finished - started).total_seconds() * 1000) and started <= finished, "SQLite semantic receipt chronology")
    require(receipt["database_path"] == gate["models_db_path"] and receipt["uri_mode"] == "ro" and receipt["query_only"] is True and receipt["transaction"] == "explicit_read_rollback", "SQLite read-only transaction")
    require(isinstance(receipt["journal_mode"], str) and receipt["journal_mode"].lower() in ("delete", "truncate", "persist", "memory", "wal", "off"), "SQLite journal mode receipt")
    for safety in (receipt["path_safety_before"], receipt["path_safety_after"]):
        require(isinstance(safety, dict) and set(safety) == {"main", "wal"}, "SQLite path safety pair")
        validate_path_safety(safety["main"], gate["models_db_path"], required=True)
        validate_path_safety(safety["wal"], gate["models_db_path"] + "-wal", required=False)
    require(receipt["transaction_error"] is None and receipt["query"] == gate["models_db_query"] and receipt["query_parameter"] == gate["models_db_query_parameter"] and receipt["row_count"] == 1, "SQLite exact provider transaction")
    query_raw = raw_bytes(receipt["query_result"], "SQLite query result")
    try:
        query_value = P.strict_loads(query_raw.decode("utf-8"))
    except (UnicodeDecodeError, P.PipelineError, ValueError, TypeError) as exc:
        raise ControllerError("SQLite query result strict JSON") from exc
    require(query_raw == (P.canonical_json(query_value) + "\n").encode("utf-8") and isinstance(query_value, dict) and set(query_value) == {"rows"} and isinstance(query_value["rows"], list) and len(query_value["rows"]) == 1, "SQLite canonical query result")
    provider_raw = raw_bytes(receipt["provider_record"], "SQLite provider record")
    require(provider_raw == (P.canonical_json(query_value["rows"][0]) + "\n").encode("utf-8"), "SQLite query/provider raw join")
    projection = provider_projection(provider_raw)
    semantic = semantic_projection(projection)
    require(receipt["projection_error"] is None and receipt["projection"] == projection and receipt["semantic_projection"] == semantic and receipt["semantic_sha256"] == receipt_digest(semantic), "SQLite raw/projection/semantic digest join")
    cli, cached = catalog["projection"]["model"], projection["model"]
    require(all(cli[field] == cached[field] for field in ("provider", "id", "name", "contextWindow", "maxTokens", "reasoning", "input", "cost")), "catalog/cache exact model agreement")
    require(cli["thinking"] == cached["thinking"]["efforts"] and cached["api"] == gate["expected_assistant_api"] and cached["baseUrl"] == gate["expected_base_url"] and cached["supportsTools_field_present"] is False, "catalog/cache API/base/native agreement")
    updated_ms = projection["updated_at_epoch_ms"]
    if initial is None:
        require(receipt["name"] == "initial_post_refresh", "initial SQLite receipt name")
        lower = int(V.parse_utc(catalog["started_at_utc"]).timestamp() * 1000)
        upper = int(V.parse_utc(catalog["finished_at_utc"]).timestamp() * 1000)
        require(lower <= updated_ms <= upper and V.parse_utc(catalog["finished_at_utc"]) <= started, "initial provider update within refresh interval")
    else:
        require(receipt["name"] == "immediate_pre_popen", "pre-Popen SQLite receipt name")
        validate_semantic_receipt(initial, catalog)
        require(receipt["semantic_sha256"] == initial["semantic_sha256"], "initial/pre-Popen provider semantic digest drift")
        require(V.parse_utc(initial["finished_at_utc"]) <= started, "initial/pre-Popen receipt order")
        require(updated_ms >= initial["projection"]["updated_at_epoch_ms"] and updated_ms <= int(finished.timestamp() * 1000), "pre-Popen provider timestamp nondecreasing/nonfuture")
        require(admitted_at is not None, "pre-Popen admission timestamp")
        admitted = V.parse_utc(admitted_at)
        require(finished <= admitted and 0 <= (admitted.timestamp() * 1000 - updated_ms) <= gate["freshness_to_popen_max_seconds"] * 1000, "pre-Popen provider freshness")
        require(0 <= (admitted - finished).total_seconds() <= gate["freshness_to_popen_max_seconds"], "pre-Popen transaction freshness")


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
    """Run the second independent semantic transaction at the frozen Popen gate."""
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
    catalog, initial = receipt.get("catalog_refresh"), receipt.get("sqlite_initial_receipt")
    require(isinstance(catalog, dict) and receipt.get("catalog_refresh_sha256") == receipt_digest(catalog), "pre-Popen catalog digest")
    require(isinstance(initial, dict) and receipt.get("sqlite_initial_receipt_sha256") == receipt_digest(initial), "pre-Popen initial SQLite digest")
    require("pre_popen_admission" not in receipt, "subject Popen admission already used")
    require("sqlite_pre_popen_receipt" not in receipt, "subject Popen semantic recheck already used")
    recheck = sqlite_semantic_receipt("immediate_pre_popen")
    receipt.update({"sqlite_pre_popen_receipt": recheck, "sqlite_pre_popen_receipt_sha256": receipt_digest(recheck)})
    base.atomic_json(row_dir / "omp_preflight.json", receipt)
    durable = P.load_json(row_dir / "omp_preflight.json")
    require(durable.get("sqlite_pre_popen_receipt") == recheck and durable.get("sqlite_pre_popen_receipt_sha256") == receipt_digest(recheck), "durable pre-Popen SQLite receipt before comparison")
    admitted_at = base.utc_now()
    validate_catalog_receipt(catalog, admitted_at)
    validate_semantic_receipt(initial, catalog)
    validate_semantic_receipt(recheck, catalog, initial=initial, admitted_at=admitted_at)
    admission = {
        "schema_id": "pm.r10.storage_pipeline.glm53_semantic_pre_popen_admission.v2",
        **{field: row[field] for field in IDENTITY},
        "admitted_at_utc": admitted_at,
        "argv_sha256": P.sha256_bytes((P.canonical_json(actual_argv) + "\n").encode("utf-8")),
        "catalog_refresh_sha256": receipt["catalog_refresh_sha256"],
        "local_model_config_loaded": catalog["local_model_config_loaded"],
        "sqlite_initial_receipt_sha256": receipt["sqlite_initial_receipt_sha256"],
        "sqlite_pre_popen_receipt_sha256": receipt["sqlite_pre_popen_receipt_sha256"],
        "provider_semantic_sha256": initial["semantic_sha256"],
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
    structural = prior.prior.prior.ORIGINAL_SESSION_VERIFY(path, **expected)
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
    receipt = native_convert(prior.prior.prior.ORIGINAL_PREFLIGHT, row_dir, row, route)
    config = receipt.get("effective_config", {})
    require(config.get("advisor.enabled") is False and config.get("task.agentAdvisor") == {"task": "off"}, "both advisor controls off")
    argv = expected_argv(route, row)
    require("--no-tools" in argv and "--no-skills" in argv and "--no-rules" in argv and "--config" not in argv, "native restrictions")
    catalog = forced_catalog_refresh()
    receipt.update({"catalog_refresh": catalog, "catalog_refresh_sha256": receipt_digest(catalog)})
    base.atomic_json(row_dir / "omp_preflight.json", receipt)
    initial = sqlite_semantic_receipt("initial_post_refresh")
    receipt.update({"sqlite_initial_receipt": initial, "sqlite_initial_receipt_sha256": receipt_digest(initial)})
    base.atomic_json(row_dir / "omp_preflight.json", receipt)
    validate_catalog_receipt(catalog)
    validate_semantic_receipt(initial, catalog)
    require(git_custody() == custody == DISPATCH_CUSTODY, "source custody changed during catalog/SQLite preflight")
    receipt.update({
        "canary_contract": file_record(CONTRACT), "owned_sources": custody["sources"], "git_custody": custody,
        "protocol_adapter": "native_default_with_host_result_normalization_retry_failfast_and_sqlite_semantic_admission", "config_overlay": None,
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
    catalog, initial, recheck = receipt.get("catalog_refresh"), receipt.get("sqlite_initial_receipt"), receipt.get("sqlite_pre_popen_receipt")
    require(isinstance(catalog, dict) and receipt.get("catalog_refresh_sha256") == receipt_digest(catalog), "catalog receipt digest")
    require(isinstance(initial, dict) and receipt.get("sqlite_initial_receipt_sha256") == receipt_digest(initial), "initial SQLite receipt digest")
    require(isinstance(recheck, dict) and receipt.get("sqlite_pre_popen_receipt_sha256") == receipt_digest(recheck), "pre-Popen SQLite receipt digest")
    validate_catalog_receipt(catalog, launch.get("started_at_utc"))
    admission = receipt.get("pre_popen_admission")
    admission_fields = {"schema_id", *IDENTITY, "admitted_at_utc", "argv_sha256", "catalog_refresh_sha256", "local_model_config_loaded", "sqlite_initial_receipt_sha256", "sqlite_pre_popen_receipt_sha256", "provider_semantic_sha256", "git_custody_sha256", "subject_popen_call_ordinal"}
    require(isinstance(admission, dict) and set(admission) == admission_fields and admission.get("schema_id") == "pm.r10.storage_pipeline.glm53_semantic_pre_popen_admission.v2", "pre-Popen admission shape")
    frozen = rows()[0]
    require(all(admission.get(field) == frozen[field] for field in IDENTITY), "pre-Popen frozen row identity")
    require(admission.get("argv_sha256") == P.sha256_bytes((P.canonical_json(launch.get("argv")) + "\n").encode("utf-8")), "pre-Popen argv digest")
    require(admission.get("catalog_refresh_sha256") == receipt["catalog_refresh_sha256"] and admission.get("local_model_config_loaded") is False and admission.get("sqlite_initial_receipt_sha256") == receipt["sqlite_initial_receipt_sha256"] and admission.get("sqlite_pre_popen_receipt_sha256") == receipt["sqlite_pre_popen_receipt_sha256"], "pre-Popen isolated catalog/SQLite digests")
    require(admission.get("provider_semantic_sha256") == initial["semantic_sha256"] == recheck["semantic_sha256"], "pre-Popen provider semantic digest")
    require(admission.get("git_custody_sha256") == receipt_digest(receipt["git_custody"]) and admission.get("subject_popen_call_ordinal") == 1, "pre-Popen custody/ordinal")
    launch_started, admitted = V.parse_utc(launch["started_at_utc"]), V.parse_utc(admission["admitted_at_utc"])
    require(0 <= (admitted - launch_started).total_seconds() <= 30, "pre-Popen admission chronology")
    validate_catalog_receipt(catalog, admission["admitted_at_utc"])
    validate_semantic_receipt(initial, catalog)
    validate_semantic_receipt(recheck, catalog, initial=initial, admitted_at=admission["admitted_at_utc"])
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
    yield PRIOR_ROOT, prior.rows()[0]
    yield from prior.prior_rows()


def metric(path: Path) -> dict[str, int]:
    raw = path.read_bytes()
    return {"lines": len(raw.splitlines()), "bytes": len(raw)}


def validate_authority(authority: dict[str, Any]) -> None:
    fields = {"status", "source_thread_id", "source_normalized_canary_contract", "source_consumed_v1_contract", "consumed_v1_attempt_id", "consumed_v1_credit", "this_is_not_a_retry", "source_governance_goal_receipt_canonical_sha256", "source_normalization_exchange_canonical_sha256", "active_goal_receipt", "exact_fallback_clause_utf8", "exact_fallback_clause_utf8_bytes", "exact_fallback_clause_sha256", "authorized_attempt_ids", "authorized_selector", "authorized_thinking", "authorized_fresh_successor_canary_count", "retry_replacement_reuse_or_retro_credit_authorized", "other_route_or_subject_authorized_by_this_contract", "matrix_launch_authorized_by_this_canary_contract"}
    require(isinstance(authority, dict) and set(authority) == fields and authority["status"] == "AUTHORIZED_EXACT_ONE_FRESH_GLM53_SQLITE_SEMANTIC_SUCCESSOR_ZERO_CREDIT", "closed successor authority shape/status")
    source_record = authority["source_normalized_canary_contract"]
    source_path = REPO / source_record["path"]
    require(source_record == file_record(source_path), "normalization/fallback authority source contract")
    require(authority["source_consumed_v1_contract"] == file_record(PRIOR_ROOT / "canary_contract.json"), "consumed V1 lineage contract")
    source = P.load_json(source_path)
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
    require(authority["authorized_attempt_ids"] == [row["attempt_id"]] and authority["authorized_selector"] == row["model"] and authority["authorized_thinking"] == row["thinking"] and authority["authorized_fresh_successor_canary_count"] == 1 and authority["consumed_v1_attempt_id"] == prior.rows()[0]["attempt_id"], "one exact successor authority")
    require(authority["this_is_not_a_retry"] is True and authority["consumed_v1_credit"] == 0, "fresh successor/no retro-credit authority")
    require(all(authority[key] is False for key in ("retry_replacement_reuse_or_retro_credit_authorized", "other_route_or_subject_authorized_by_this_contract", "matrix_launch_authorized_by_this_canary_contract")), "authority ceiling")


def validate_static(*, unused: bool) -> dict[str, Any]:
    contract, row, route = spec(), rows()[0], next(iter(route_map().values()))
    require(contract.get("schema_id") == "pm.r10.storage_pipeline.storage_glm53_normalized_canary.v2", "schema")
    actual = {path.name for path in HERE.iterdir()}
    require(actual == set(SOURCES) if unused else actual in (set(SOURCES), set(SOURCES) | {"evidence"}), "package root roster")
    require(contract.get("owned_file_roster") == list(SOURCES) and all((HERE / name).is_file() and not (HERE / name).is_symlink() for name in SOURCES), "six regular sources")
    metrics = {name: metric(HERE / name) for name in SOURCES}
    limits = contract["architecture_limits"]
    for name, prefix in (("controller.py", "controller"), ("provider_catalog_helper.ts", "helper"), ("result_normalizer.py", "normalizer"), ("selftest.py", "selftest")):
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
    require(row["attempt_id"] == f"storage-glm53-normalized-canary-v2-01-{suffix}" and len(row["nonce"]) == 32 and all(character in "0123456789abcdef" for character in row["nonce"]), "attempt/nonce")
    require(row["cwd"] == f"/tmp/pm-r10-storage-v7-glm53-normalized-canary-v2-01-{suffix}" and row["session_dir"] == f"/tmp/pm-r10-storage-v7-session-glm53-normalized-canary-v2-01-{suffix}", "runtime identity")
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
    helper = gate["helper_runtime"]
    require(gate["argv"] == [runtime["binary"], "run", str(HELPER)] and gate["profile_environment"] == {"BUN_BE_BUN": "1", "PI_CODING_AGENT_DIR": runtime["profile_dir"]}, "provider helper invocation")
    require(gate["helper_source"] == file_record(HELPER) and helper["embedded_runtime"] == "Bun 1.4.0 via OMP BUN_BE_BUN=1" and helper["omp_binary"] == runtime["binary"] and helper["omp_binary_sha256"] == runtime["binary_sha256"], "provider helper source/runtime freeze")
    require(helper["provider_filter"] == gate["provider_filter"] == ["opencode-go"] and helper["strategy"] == gate["strategy"] == "online" and helper["local_model_config_loaded"] is helper["extensions_loaded"] is helper["online_if_uncached_followup"] is False, "provider-only isolated helper contract")
    require(helper_runtime_sources() == helper["omp_source_files"] and gate["profile_dir"] == runtime["profile_dir"] and gate["models_db_path"] == f'{runtime["profile_dir"]}/models.db', "provider helper OMP source/profile custody")
    require(gate["command_timeout_seconds"] == 30 and gate["freshness_to_popen_max_seconds"] == 60 and gate["expected_assistant_api"] == "openai-completions" and gate["resolved_model_is_fallback"] is False and gate["nonzero_exact_price_required"] is True, "catalog/API/fallback gate")
    require(gate["sqlite_uri_mode"] == "ro" and gate["query_only_required"] is gate["explicit_read_transaction_required"] is gate["persist_both_receipts_before_comparison"] is True, "SQLite transaction contract")
    require(gate["physical_main_wal_equality_is_admission_authority"] is False and gate["unrelated_rows_and_physical_wal_checkpoint_inode_mtime_changes_allowed"] is True, "semantic not physical cache authority")
    require(gate["semantic_digest_fields"] == ["provider_id", "provider_cache_schema_version", "authoritative", "static_fingerprint", "header_omitted_model_ids", "unrestorable_header_model_ids", "header_restore_version", "target_canonical_utf8_bytes", "target_canonical_sha256", "model"], "semantic digest field freeze")
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
