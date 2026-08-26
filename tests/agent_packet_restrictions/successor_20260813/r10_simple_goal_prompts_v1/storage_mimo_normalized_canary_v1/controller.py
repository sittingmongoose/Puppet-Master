#!/usr/bin/env python3
"""One fresh normalized-output MiMo canary over frozen V7 mechanics."""
from __future__ import annotations

import argparse
import contextlib
import importlib.util
import os
import subprocess
import sys
from pathlib import Path
from typing import Any, Iterator

HERE = Path(__file__).resolve().parent
R10 = HERE.parent
REPO = HERE.parents[4]
V7 = R10 / "system_pipeline_sandbox_v7"
PRIOR_ROOT = R10 / "storage_mimo_native_canary_v1"
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


prior = external("r10_storage_mimo_native_canary_v1_normalization_base", PRIOR_ROOT / "controller.py", PRIOR_ROOT)
CONTRACT = HERE / "canary_contract.json"
EVIDENCE = HERE / "evidence"
SOURCES = ("README.md", "canary_contract.json", "controller.py", "result_normalizer.py", "selftest.py")
IDENTITY = ("ordinal", "pass_id", "route_id", "attempt_id", "nonce")
JOURNAL_FIELDS = {"schema_id", *IDENTITY, "started_at_utc", "launch_sha256", "omp_preflight_sha256", "popen_observed", "pid"}
DISPATCH_CUSTODY: dict[str, Any] | None = None


class ControllerError(RuntimeError):
    pass


def require(value: bool, message: str) -> None:
    if not value:
        raise ControllerError(message)


def spec() -> dict[str, Any]:
    value = P.load_json(CONTRACT)
    require(isinstance(value, dict), "contract object")
    return value


def rows() -> list[dict[str, Any]]:
    value = spec().get("rows")
    require(isinstance(value, list) and len(value) == 1, "one frozen normalized row")
    return value


def route_map() -> dict[str, dict[str, Any]]:
    route = spec().get("route")
    require(isinstance(route, dict) and route.get("id") == "omp_mimo_v25_free_high", "one MiMo route")
    return {route["id"]: route}


def planned_row(pass_id: str, route_id: str) -> dict[str, Any]:
    found = [row for row in rows() if (row["pass_id"], row["route_id"]) == (pass_id, route_id)]
    require(len(found) == 1, "one planned normalized canary row")
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
    values = {
        "HERE": HERE,
        "REPO": REPO,
        "CONTRACT": CONTRACT,
        "EVIDENCE": EVIDENCE,
        "SOURCES": SOURCES,
        "DISPATCH_CUSTODY": DISPATCH_CUSTODY,
    }
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


def raw_record(raw: bytes) -> dict[str, Any]:
    return convert(prior.raw_record, raw)


def catalog_projection(raw: bytes) -> dict[str, Any]:
    return convert(prior.catalog_projection, raw)


def validate_catalog_projection(projection: Any) -> None:
    convert(prior.validate_catalog_projection, projection)


def validate_catalog_receipt(receipt: Any, launch_started_at: str | None = None) -> None:
    convert(prior.validate_catalog_receipt, receipt, launch_started_at)


def catalog_receipt_digest(receipt: dict[str, Any]) -> str:
    return prior.catalog_receipt_digest(receipt)


def forced_catalog_refresh() -> dict[str, Any]:
    return convert(prior.forced_catalog_refresh)


def git_custody() -> dict[str, Any]:
    return convert(prior.git_custody)


def expected_argv(route: dict[str, Any], row: dict[str, Any]) -> list[str]:
    return convert(prior.expected_argv, route, row)


def verifier_argv(route: dict[str, Any], cwd: str, session_dir: str) -> list[str]:
    found = [row for row in rows() if (row["cwd"], row["session_dir"]) == (cwd, session_dir)]
    require(len(found) == 1, "verifier argv row identity")
    return expected_argv(route, found[0])


def verify_session(path: Path, **expected: Any) -> dict[str, Any]:
    structural = convert(prior.verify_session, path, **expected)
    matrix = P.load_json(V7 / "matrix.json")
    return normalizer.normalize_verified_session(
        path,
        structural,
        oracle_path=V7 / "oracle.json",
        schema_path=V7 / "response.schema.json",
        max_text_block_utf8_bytes=matrix["max_final_assistant_utf8_bytes"],
    )


def row_preflight(row_dir: Path, row: dict[str, Any], route: dict[str, Any]) -> dict[str, Any]:
    receipt = convert(prior.row_preflight, row_dir, row, route)
    require(git_custody() == DISPATCH_CUSTODY, "source custody changed before normalization receipt")
    receipt.update(
        {
            "normalization_contract": spec()["normalization"],
            "normalization_authority_receipt": spec()["authority"]["normalization_exchange"],
            "governance_goal_receipt": spec()["governance_goal_receipt"],
        }
    )
    base.atomic_json(row_dir / "omp_preflight.json", receipt)
    return receipt


def verify_catalog_chain(row_dir: Path, receipt: dict[str, Any], launch: dict[str, Any], terminal: dict[str, Any]) -> str:
    return convert(prior.verify_catalog_chain, row_dir, receipt, launch, terminal)


def verify_receipt(row: dict[str, Any], custody: dict[str, Any]) -> None:
    convert(prior.verify_receipt, row, custody)
    row_dir = EVIDENCE / row["pass_id"] / row["route_id"]
    receipt = P.load_json(row_dir / "omp_preflight.json")
    terminal = P.load_json(row_dir / "terminal.json")
    require(receipt.get("normalization_contract") == spec()["normalization"], "normalization contract receipt")
    require(receipt.get("normalization_authority_receipt") == spec()["authority"]["normalization_exchange"], "normalization authority receipt")
    require(receipt.get("governance_goal_receipt") == spec()["governance_goal_receipt"], "governance Goal receipt")
    projection = terminal.get("session_projection")
    require(isinstance(projection, dict), "terminal normalized projection")
    result = projection.get("result_normalization")
    require(isinstance(result, dict) and result.get("schema_id") == "pm.r10.storage_pipeline.result_normalization.v1", "normalization projection schema")
    require(result.get("result_authority") == "deterministic_host_program_over_verified_assistant_text", "programmatic result authority")
    require(type(result.get("candidate_count")) is int and result["candidate_count"] >= 1 and len(result.get("candidates", [])) == result["candidate_count"], "candidate roster")
    require(result.get("canonical_text") == terminal.get("final_assistant_text") and result.get("canonical_sha256") == P.sha256_bytes(terminal["final_assistant_text"].encode("utf-8")), "canonical terminal join")
    raw_last = projection.get("raw_last_assistant_text")
    require(isinstance(raw_last, str) and projection.get("raw_last_assistant_utf8_bytes") == len(raw_last.encode("utf-8")) and projection.get("raw_last_assistant_sha256") == P.sha256_bytes(raw_last.encode("utf-8")), "raw last-assistant preservation")
    base.exact_result(terminal["final_assistant_text"])


def generic_journal(reports: list[dict[str, Any]]) -> None:
    convert(prior.generic_journal, reports)


BINDING_NAMES = (
    "omp_row_runner.EVIDENCE",
    "omp_row_runner.route_map",
    "omp_row_runner.plan_rows",
    "omp_row_runner.planned_row",
    "omp_row_runner.expected_argv",
    "omp_row_runner.row_preflight",
    "omp_session.verify_session",
    "verify_matrix.EVIDENCE",
    "verify_matrix.launch_plan_map",
    "verify_matrix.expected_argv",
    "verify_matrix.verify_launch_journal",
)


def bindings() -> tuple[tuple[Any, str, Any], ...]:
    return (
        (base, "EVIDENCE", EVIDENCE),
        (base, "route_map", route_map),
        (base, "plan_rows", rows),
        (base, "planned_row", planned_row),
        (base, "expected_argv", expected_argv),
        (base, "row_preflight", row_preflight),
        (omp_session, "verify_session", verify_session),
        (V, "EVIDENCE", EVIDENCE),
        (V, "launch_plan_map", launch_plan_map),
        (V, "expected_argv", verifier_argv),
        (V, "verify_launch_journal", generic_journal),
    )


@contextlib.contextmanager
def installed() -> Iterator[None]:
    current = bindings()
    require(len(current) == 11, "exactly eleven adapter bindings")
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
        require(report.get("status") == "PASS", "fail-stop: normalized canary is not PASS")
        verify_receipt(row, custody)
        reports = [{"pass_id": row["pass_id"], "rows": [report]}]
        V.verify_launch_journal(reports)
        V.verify_evidence_tree(reports)
        V.verify_global_uniqueness(reports)
        cwd, session_dir = Path(row["cwd"]), Path(row["session_dir"])
        require(cwd.is_dir() and not cwd.is_symlink() and not any(cwd.iterdir()), "completed cwd empty")
        live = base.session_file(session_dir)
        require(live is not None and P.sha256_file(live) == report["raw_primary_sha256"], "persistent/raw session join")
    return {
        "status": "PASS_MIMO_NORMALIZED_CANARY_ZERO_CREDIT" if journal else "PASS_EMPTY_NORMALIZED_CANARY_PREFIX_ZERO_CREDIT",
        "row_count": len(journal),
        "required_rows": 1,
        "subject_calls": 0,
        "qualification_credit": 0,
        "matrix_credit": 0,
    }


def verify_prefix() -> dict[str, Any]:
    with installed():
        return _prefix()


def prior_rows() -> Iterator[tuple[Path, dict[str, Any]]]:
    found = convert(lambda: list(prior.prior_rows()))
    yield from found


def metric(path: Path) -> dict[str, int]:
    raw = path.read_bytes()
    return {"lines": len(raw.splitlines()), "bytes": len(raw)}


def validate_record(record: dict[str, Any], expected: tuple[Any, ...], text_bytes: int, text_sha: str, line_bytes: int, line_sha: str) -> None:
    fields = ("physical_line", "ordinal", "timestamp", "turn_id", "message_id", "role", "phase")
    require(tuple(record.get(field) for field in fields) == expected, "authority event identity")
    raw = record["text_utf8"].encode("utf-8")
    require(len(raw) == record["text_utf8_bytes"] == text_bytes and P.sha256_bytes(raw) == record["text_sha256"] == text_sha, "authority text bytes/hash")
    require((record["jsonl_line_bytes_including_lf"], record["jsonl_line_sha256_including_lf"]) == (line_bytes, line_sha), "authority raw line receipt")


def validate_authority(authority: dict[str, Any]) -> None:
    historical = P.load_json(PRIOR_ROOT / "canary_contract.json")["authority"]
    require(authority["source_thread_id"] == "01a034b9-a1c8-7a80-937f-4e45e3f2ae45", "authority thread")
    historical_pair = historical["paired_exchange"]
    require(authority["original_mimo_authority_source"] == file_record(PRIOR_ROOT / "canary_contract.json"), "original MiMo authority source")
    require(authority["original_mimo_paired_exchange_sha256"] == P.sha256_bytes(P.canonical_json(historical_pair).encode("utf-8")) == "c4b4dc272fa732b4f83c66e7cebcd73c135648798f4e1b57cd757b0213e05425", "original MiMo paired authority digest")
    exchange = authority["normalization_exchange"]
    source = "rollout-2026-08-24T17-02-55-01a034b9-a1c8-7a80-937f-4e45e3f2ae45.jsonl"
    require(exchange.get("source_jsonl_basename") == source, "normalization authority source")
    validate_record(exchange["user_correction"], (28922, 28921, "2026-08-26T21:30:06.005Z", "01a03f9b-da82-7a93-b8c7-6974cc7f563d", "msg_01a03ffa-f335-71b0-bca2-c69f0727786c", "user", None), 220, "00e40f2fb20461d8714a37cc5380fa126312621ca6ce5efed9c540c9920b426e", 565, "36969d325f589bc533babc46dd38c32437a45195602e40afa0b034b210eec97c")
    validate_record(exchange["assistant_contract"], (28927, 28926, "2026-08-26T21:30:18.154Z", "01a03f9b-da82-7a93-b8c7-6974cc7f563d", "msg_09747b8db7972cfa016a8f5ae67af887d1abb585a8a8783f7e", "assistant", "commentary"), 731, "00bbefdf07b901f3665bb3c27e778bb53f325bc48095ce2f6cb678787e7a2acd", 1093, "cada218ad7952e36572e7dcb297f30e28d4a4cc0c9b7cff4284b268dad9cc351")
    validate_record(exchange["user_host_question"], (28942, 28941, "2026-08-26T21:32:31.476Z", "01a03f9b-da82-7a93-b8c7-6974cc7f563d", "msg_01a03ffd-2b73-7051-9c8d-3872550c5304", "user", None), 134, "24f91eb464f288176b8bcc8b7911db9f80205fe336b00b6aa705ecf80beec5db", 481, "0dab2444dc8e8ba9c7ccc62bcf8f6fcf1446f9695c7c42aa9696d6e394a1cdf1")
    validate_record(exchange["assistant_program_answer"], (28947, 28946, "2026-08-26T21:32:47.399Z", "01a03f9b-da82-7a93-b8c7-6974cc7f563d", "msg_09747b8db7972cfa016a8f5b7cb43887d19b351f7f6ca3612e", "assistant", "final_answer"), 593, "e9c484ce848b0aa2638ac3bf11250d6bdc2490f6770371b8860dd8bf379e3e44", 958, "eaefd3b7971cc283d72b11125803ccab28464e9e133751fe8b8904f428b5243d")
    require(exchange["user_correction"]["text_utf8"].startswith("Keep in mind, the harness") and exchange["user_host_question"]["text_utf8"].startswith('In this case "the host deterministically extracts'), "exact user correction/question")
    require(exchange["assistant_program_answer"]["text_utf8"].startswith("A program, not another agent."), "programmatic host authority")
    stamps = [exchange[name]["timestamp"] for name in ("user_correction", "assistant_contract", "user_host_question", "assistant_program_answer")]
    require(stamps == sorted(stamps), "normalization authority chronology")
    row = rows()[0]
    require(authority["authorized_attempt_ids"] == [row["attempt_id"]] and authority["authorized_fresh_normalized_canary_count"] == 1, "one fresh normalized canary authority")
    require(authority["authorized_selector"] == row["model"] and authority["authorized_thinking"] == row["thinking"], "selector authority")
    require(all(authority[key] is False for key in ("retry_replacement_reuse_or_retro_credit_authorized", "other_route_or_subject_authorized_by_this_contract", "matrix_launch_authorized_by_this_canary_contract")), "authority ceiling")


def validate_goal_receipt(receipt: dict[str, Any]) -> None:
    objective = receipt["objective_utf8"]
    raw = objective.encode("utf-8")
    require(receipt["source_thread_id"] == "01a034b9-a1c8-7a80-937f-4e45e3f2ae45" and receipt["goal_thread_id"] == receipt["source_thread_id"], "Goal identity")
    require(receipt["status"] == "active" and receipt["tokens_used"] == receipt["time_used_seconds"] == 0 and receipt["created_at"] == receipt["updated_at"] == 1787781232, "Goal active creation")
    require(len(raw) == receipt["objective_utf8_bytes"] == 2703 and P.sha256_bytes(raw) == receipt["objective_sha256"] == "560a6b2e6852f351fd5d95e1ed44ec0f5044dab367318b20458c3cd76139c406", "Goal objective bytes/hash")
    require("The host must be deterministic program code, not another agent" in objective and "First qualify exactly one fresh zero-credit normalized native OMP Goal canary" in objective, "Goal normalization/canary scope")
    require((receipt["create_call_physical_line"], receipt["create_call_ordinal"], receipt["create_call_timestamp"], receipt["create_call_id"], receipt["create_call_jsonl_line_bytes_including_lf"], receipt["create_call_jsonl_line_sha256_including_lf"]) == (29055, 29054, "2026-08-26T21:53:52.879Z", "call_Rklj1ZlFk4yF18PFKEOaeCrm", 3161, "333f17c24805d52e0073474113fe2d50a930e84934bc1ba2108f302aa36f40d0"), "Goal create call receipt")
    require((receipt["create_output_physical_line"], receipt["create_output_ordinal"], receipt["create_output_timestamp"], receipt["create_output_call_id"], receipt["create_output_jsonl_line_bytes_including_lf"], receipt["create_output_jsonl_line_sha256_including_lf"]) == (29056, 29055, "2026-08-26T21:53:52.955Z", receipt["create_call_id"], 3425, "ec0894967ff91de3f068495d17e8060d5be5970312ec202c67b33a618b816fd1"), "Goal create output receipt")


def validate_static(*, unused: bool) -> dict[str, Any]:
    contract, row, route = spec(), rows()[0], next(iter(route_map().values()))
    require(contract.get("schema_id") == "pm.r10.storage_pipeline.storage_mimo_normalized_canary.v1", "schema")
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
    require(contract["temporary_bindings"] == list(BINDING_NAMES) and limits["temporary_binding_count"] == 11 and limits["copied_v7_runner_parser_scorer_verifier_body_count"] == 0, "architecture freeze")
    frozen_records("dependencies")
    artifacts = frozen_records("frozen_storage_artifacts")
    require(file_record(REPO / contract["historic_identity_root"]["path"]) == contract["historic_identity_root"], "historic root freeze")
    prompt = V7 / "prompts/omp.prompt.txt"
    require(artifacts[0] == file_record(prompt) and prompt.stat().st_size == 3036 and P.sha256_file(prompt) == "eff40a61579a080ce6e21bb71bcae2dd0640c100c9d61c199f45ac5dece43638", "exact V7 prompt")
    suffix = row["nonce"][:10]
    require((row["ordinal"], row["pass_id"], row["route_id"], row["surface"], row["model"], row["thinking"], row["protocol_adapter"]) == (1, "pass_01", "omp_mimo_v25_free_high", "omp_tui", "opencode-zen/mimo-v2.5-free", "high", "native_default_with_host_result_normalization"), "route identity")
    require(route == {"id": row["route_id"], "surface": row["surface"], "model": row["model"], "thinking": row["thinking"]}, "route join")
    require(row["attempt_id"] == f"storage-mimo-normalized-canary-v1-01-{suffix}" and len(row["nonce"]) == 32 and all(character in "0123456789abcdef" for character in row["nonce"]), "attempt/nonce")
    require(row["cwd"] == f"/tmp/pm-r10-storage-v7-mimo-normalized-canary-v1-01-{suffix}" and row["session_dir"] == f"/tmp/pm-r10-storage-v7-session-mimo-normalized-canary-v1-01-{suffix}", "runtime identity")
    require(row["evidence_path"] == "evidence/pass_01/omp_mimo_v25_free_high" and row["prompt_utf8_bytes"] == 3036 and row["prompt_sha256"] == P.sha256_file(prompt), "evidence/prompt")
    argv = expected_argv(route, row)
    require("--config" not in argv and "--no-tools" in argv and argv[-4:] == ["--model", row["model"], "--thinking", row["thinking"]], "native argv")
    for root, historical in prior_rows():
        require(all(field not in historical or row[field] != historical[field] for field in ("attempt_id", "nonce", "cwd", "session_dir")), "historic identity disjointness")
        if "evidence_path" in historical:
            require((HERE / row["evidence_path"]).resolve() != (root / historical["evidence_path"]).resolve(), "historic evidence disjointness")
    historical_contract = P.load_json(PRIOR_ROOT / "canary_contract.json")
    require(contract["runtime"] == historical_contract["runtime"] and contract["catalog_gate"] == historical_contract["catalog_gate"], "unchanged runtime/catalog gates")
    sequence = contract["sequencing"]
    require(sequence == {"required_rows": 1, "exact_route_order": [row["route_id"]], "all_rows_count": True, "only_next_ordinal_launchable": True, "fail_stop_on_first_failure_or_custody_mismatch": True, "retry_count": 0, "replacement_count": 0, "best_of": False, "qualification_credit": 0, "matrix_credit": 0, "production_credit": 0, "automatically_authorizes_matrix_or_successor": False}, "one-row fail-stop")
    normalization = contract["normalization"]
    require(normalization == {"schema_id": "pm.r10.storage_pipeline.result_normalization_contract.v1", "implementation": "deterministic_host_program", "structural_verifier_runs_first": True, "scan_scope": "text_blocks_of_structurally_verified_assistant_messages_only", "location_indexing": "entry_and_block_zero_based_line_one_based", "candidate_prefix": "PM_RESULT ", "marker_like_regex": "^PM_RESULT(?=$|[^A-Za-z0-9_])", "marker_like_nonexact_delimiter_fails": True, "candidate_must_start_line": True, "strict_duplicate_key_json": True, "schema_type_and_frozen_value_validation": True, "at_least_one_candidate": True, "identical_semantic_duplicates_allowed": True, "conflicting_or_any_invalid_candidate_fails": True, "surrounding_prose_ignored": True, "raw_session_and_last_assistant_preserved": True, "canonical_output": "frozen_oracle_order_minified_PM_RESULT_line", "normalization_exception_is_permanent_and_not_transient": True, "max_text_block_utf8_bytes": 4096, "normal_exit_still_required": True}, "closed normalization contract")
    validate_authority(contract["authority"])
    validate_goal_receipt(contract["governance_goal_receipt"])
    require(contract["source_candidate_commit"] is None, "non-self-referential live Git custody")
    require(P.preflight_inputs()["status"] == "PASS" and P.verify()["status"] == "PASS_VERIFIED_NO_WORKNODES" and freeze_check.verify_freeze()["status"] == "PASS_FROZEN_ZERO_SUBJECT", "V7 pipeline/freeze")
    if unused:
        require(not os.path.lexists(EVIDENCE) and not os.path.lexists(row["cwd"]) and not os.path.lexists(row["session_dir"]), "unused evidence/runtime absent")
    require(not list(HERE.rglob("*.pyc")) and not list(HERE.rglob("__pycache__")), "no cache")
    return {"status": "PASS_LOCAL_MIMO_NORMALIZED_CANARY_PRELAUNCH", "rows": 1, "temporary_bindings": 11, "metrics": metrics, "subject_calls": 0, "qualification_credit": 0, "matrix_credit": 0}


def require_authority(row: dict[str, Any]) -> None:
    authority = spec()["authority"]
    validate_authority(authority)
    require(authority["authorized_attempt_ids"] == [row["attempt_id"]] and row["model"] == authority["authorized_selector"] and row["thinking"] == authority["authorized_thinking"], "exact normalized canary authority")


def claim_after_failure(row: dict[str, Any], before: tuple[bool, bool, bool] | None) -> bool:
    return bool(convert(prior.claim_after_failure, row, before))


def preserve_postfailure(row: dict[str, Any]) -> None:
    convert(prior.preserve_postfailure, row)


ERRORS = (ControllerError, normalizer.NormalizationError, base.RunnerError, omp_session.OmpSessionError, V.VerifyError, P.PipelineError, subprocess.SubprocessError, OSError, ValueError, KeyError, TypeError, AssertionError)


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
            require(prefix["row_count"] == 0, "normalized canary already consumed")
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
        print(P.canonical_json({"status": "FAIL_MIMO_NORMALIZED_CANARY_CONSUMED_NO_RETRY" if claimed else "FAIL_PRELAUNCH_NO_MUTATION", "error": f"{type(exc).__name__}: {exc}", "qualification_credit": 0, "matrix_credit": 0}))
        return 1
    finally:
        DISPATCH_CUSTODY = None
    print(P.canonical_json({"status": "PASS_MIMO_NORMALIZED_CANARY_ZERO_CREDIT", "ordinal": 1, "terminal": terminal, "qualification_credit": 0, "matrix_credit": 0}))
    return 0


if __name__ == "__main__":
    raise SystemExit(dispatch())
