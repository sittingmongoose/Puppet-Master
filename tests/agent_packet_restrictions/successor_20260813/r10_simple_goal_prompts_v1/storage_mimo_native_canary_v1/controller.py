#!/usr/bin/env python3
"""Thin one-row native MiMo canary over frozen V7 and V2 custody helpers."""
from __future__ import annotations
import argparse, base64, binascii, contextlib, importlib.util, os, subprocess, sys
from pathlib import Path
from typing import Any, Iterator

HERE = Path(__file__).resolve().parent
R10 = HERE.parent
REPO = HERE.parents[4]
V7 = R10 / "system_pipeline_sandbox_v7"
V2_ROOT = R10 / "storage_native_matrix_v2"
sys.path.insert(0, str(V7))
import freeze_check  # type: ignore[import-not-found]  # noqa: E402
import omp_row_runner as base  # type: ignore[import-not-found]  # noqa: E402
import omp_session  # type: ignore[import-not-found]  # noqa: E402
import pipeline as P  # type: ignore[import-not-found]  # noqa: E402
import verify_matrix as V  # type: ignore[import-not-found]  # noqa: E402

def external(name: str, path: Path, search: Path) -> Any:
    module_spec = importlib.util.spec_from_file_location(name, path)
    if module_spec is None or module_spec.loader is None: raise RuntimeError(f"external module unavailable: {path}")
    module = importlib.util.module_from_spec(module_spec); sys.modules[name] = module; sys.path.insert(0, str(search))
    try: module_spec.loader.exec_module(module)
    finally: sys.path.remove(str(search))
    return module

v2 = external("r10_storage_matrix_v2_mimo_helpers", V2_ROOT / "controller.py", V2_ROOT)
CONTRACT = HERE / "canary_contract.json"
EVIDENCE = HERE / "evidence"
SOURCES = ("README.md", "canary_contract.json", "controller.py", "selftest.py")
IDENTITY = ("ordinal", "pass_id", "route_id", "attempt_id", "nonce")
JOURNAL_FIELDS = {"schema_id", *IDENTITY, "started_at_utc", "launch_sha256", "omp_preflight_sha256", "popen_observed", "pid"}
ORIGINAL_ARGV, ORIGINAL_PREFLIGHT, ORIGINAL_SESSION_VERIFY = base.expected_argv, base.row_preflight, omp_session.verify_session
DISPATCH_CUSTODY: dict[str, Any] | None = None

class ControllerError(RuntimeError): pass
def require(value: bool, message: str) -> None:
    if not value: raise ControllerError(message)
def spec() -> dict[str, Any]:
    value = P.load_json(CONTRACT); require(isinstance(value, dict), "contract object"); return value
def rows() -> list[dict[str, Any]]:
    value = spec().get("rows"); require(isinstance(value, list) and len(value) == 1, "one frozen row"); return value
def route_map() -> dict[str, dict[str, Any]]:
    route = spec().get("route"); require(isinstance(route, dict) and route.get("id") == "omp_mimo_v25_free_high", "one MiMo route"); return {route["id"]: route}
def planned_row(pass_id: str, route_id: str) -> dict[str, Any]:
    found = [row for row in rows() if (row["pass_id"], row["route_id"]) == (pass_id, route_id)]
    require(len(found) == 1, "one planned canary row"); return found[0]
def launch_plan_map() -> dict[tuple[str, str], dict[str, Any]]:
    return {(row["pass_id"], row["route_id"]): row for row in rows()}
def file_record(path: Path) -> dict[str, Any]:
    require(path.is_file() and not path.is_symlink(), f"regular file required: {path}")
    return {"path":path.relative_to(REPO).as_posix(), "bytes":path.stat().st_size, "sha256":P.sha256_file(path)}
def frozen_records(field: str) -> list[dict[str, Any]]:
    result = [file_record(REPO / record["path"]) for record in spec()[field]]
    require(result == spec()[field], f"{field} drift"); return result

def raw_record(raw: bytes) -> dict[str, Any]:
    return {"encoding":"base64", "bytes":len(raw), "sha256":P.sha256_bytes(raw), "data":base64.b64encode(raw).decode("ascii")}
def raw_bytes(record: Any, label: str) -> bytes:
    require(isinstance(record,dict) and set(record) == {"encoding","bytes","sha256","data"} and record.get("encoding") == "base64", f"{label} raw receipt shape")
    require(type(record["bytes"]) is int and isinstance(record["sha256"],str) and isinstance(record["data"],str), f"{label} raw receipt types")
    try: raw = base64.b64decode(record["data"],validate=True)
    except (binascii.Error,ValueError,TypeError) as exc: raise ControllerError(f"{label} base64") from exc
    require(record["data"] == base64.b64encode(raw).decode("ascii") and record["bytes"] == len(raw) and record["sha256"] == P.sha256_bytes(raw), f"{label} raw bytes/hash")
    return raw
def catalog_projection(raw: bytes) -> dict[str, Any]:
    require(raw.endswith(b"\n") and raw.count(b"\n") == 1 and b"\r" not in raw, "catalog stdout one exact LF-terminated JSON line")
    try: value = P.strict_loads(raw.decode("utf-8"))
    except (UnicodeDecodeError,P.PipelineError,ValueError,TypeError) as exc: raise ControllerError("catalog stdout strict JSON") from exc
    require(isinstance(value,dict) and set(value) == {"models"} and isinstance(value["models"],list), "catalog JSON shape")
    models = value["models"]; selectors = [model.get("selector") for model in models if isinstance(model,dict)]
    require(len(selectors) == len(models) and all(isinstance(selector,str) and selector for selector in selectors), "catalog model selector shape")
    target = spec()["catalog_gate"]["expected_model"]
    matches = [model for model in models if model["selector"] == target["selector"]]
    require(len(matches) == 1, "catalog exact unique MiMo selector")
    model = matches[0]; expected_keys = {"provider","id","selector","name","contextWindow","maxTokens","reasoning","thinking","input","cost"}
    require(set(model) == expected_keys, "catalog MiMo model shape")
    return {"model_count":len(models), "exact_selector_count":1, "model":model}
def validate_catalog_projection(projection: Any) -> None:
    gate = spec()["catalog_gate"]; expected = gate["expected_model"]
    require(isinstance(projection,dict) and set(projection) == {"model_count","exact_selector_count","model"}, "catalog projection shape")
    require(type(projection["model_count"]) is int and projection["model_count"] > 0 and type(projection["exact_selector_count"]) is int and projection["exact_selector_count"] == 1, "catalog projection counts")
    model = projection["model"]; require(isinstance(model,dict), "catalog model projection")
    for field in ("provider","id","selector","name","input"):
        require(model.get(field) == expected[field], f"catalog MiMo {field}")
    require(type(model.get("contextWindow")) is int and model["contextWindow"] == expected["contextWindow"] and type(model.get("maxTokens")) is int and model["maxTokens"] == expected["maxTokens"], "catalog MiMo limits")
    require(model.get("reasoning") is True, "catalog MiMo reasoning")
    cost = model.get("cost"); require(isinstance(cost,dict) and set(cost) == {"input","output","cacheRead","cacheWrite"} and all(type(value) is int and value == 0 for value in cost.values()), "catalog MiMo exact zero pricing")
    thinking = model.get("thinking")
    require(isinstance(thinking,list) and thinking and len(thinking) == len(set(thinking)) and all(value in gate["recognized_thinking_efforts"] for value in thinking), "catalog MiMo thinking capability shape")
    require(gate["required_thinking_effort"] in thinking, "catalog MiMo high effort unavailable")
def catalog_receipt_digest(receipt: dict[str, Any]) -> str:
    return P.sha256_bytes((P.canonical_json(receipt)+"\n").encode("utf-8"))
def validate_catalog_receipt(receipt: Any, launch_started_at: str | None = None) -> None:
    gate = spec()["catalog_gate"]
    required = {"schema_id","name","started_at_utc","finished_at_utc","duration_ms","argv","cwd","profile_dir","profile_environment","forced_online","extensions_disabled","timeout_seconds","timed_out","exit_code","stdout","stderr","projection","projection_error"}
    require(isinstance(receipt,dict) and set(receipt) == required, "catalog receipt shape")
    require(receipt["schema_id"] == "pm.r10.storage_pipeline.omp_catalog_refresh_preflight.v1" and receipt["name"] == "forced_catalog_refresh", "catalog receipt schema/name")
    require(receipt["argv"] == gate["argv"] and receipt["cwd"] == str(HERE) and receipt["profile_dir"] == gate["profile_dir"] and receipt["profile_environment"] == {"PI_CODING_AGENT_DIR":gate["profile_dir"]}, "catalog command/profile")
    require(receipt["forced_online"] is True and receipt["extensions_disabled"] is True and type(receipt["timeout_seconds"]) is int and receipt["timeout_seconds"] == gate["command_timeout_seconds"], "catalog forced refresh flags")
    started, finished = V.parse_utc(receipt["started_at_utc"]), V.parse_utc(receipt["finished_at_utc"])
    duration = int((finished-started).total_seconds()*1000)
    require(0 <= duration <= gate["command_timeout_seconds"]*1000 and type(receipt["duration_ms"]) is int and receipt["duration_ms"] == duration, "catalog command chronology")
    stdout, stderr = raw_bytes(receipt["stdout"],"catalog stdout"), raw_bytes(receipt["stderr"],"catalog stderr")
    require(receipt["timed_out"] is False and type(receipt["exit_code"]) is int and receipt["exit_code"] == 0 and stderr == b"", "catalog command clean exit")
    require(receipt["projection_error"] is None and receipt["projection"] == catalog_projection(stdout), "catalog parsed projection receipt")
    validate_catalog_projection(receipt["projection"])
    if launch_started_at is not None:
        freshness = (V.parse_utc(launch_started_at)-finished).total_seconds()
        require(0 <= freshness <= gate["freshness_to_popen_max_seconds"], "catalog refresh freshness to Popen")
def forced_catalog_refresh() -> dict[str, Any]:
    gate = spec()["catalog_gate"]; environment = dict(os.environ); environment["PI_CODING_AGENT_DIR"] = gate["profile_dir"]
    started = base.utc_now(); timed_out = False
    try:
        result = subprocess.run(gate["argv"],cwd=str(HERE),env=environment,capture_output=True,text=False,timeout=gate["command_timeout_seconds"],check=False)
        exit_code, stdout, stderr = result.returncode, result.stdout, result.stderr
    except subprocess.TimeoutExpired as exc:
        timed_out = True; exit_code = None
        stdout = exc.stdout if isinstance(exc.stdout,bytes) else b""; stderr = exc.stderr if isinstance(exc.stderr,bytes) else b""
    finished = base.utc_now(); projection: dict[str,Any] | None = None; projection_error: str | None = None
    try: projection = catalog_projection(stdout)
    except (ControllerError,P.PipelineError,V.VerifyError,ValueError,TypeError) as exc: projection_error = f"{type(exc).__name__}: {exc}"
    return {"schema_id":"pm.r10.storage_pipeline.omp_catalog_refresh_preflight.v1","name":"forced_catalog_refresh","started_at_utc":started,"finished_at_utc":finished,
            "duration_ms":int((V.parse_utc(finished)-V.parse_utc(started)).total_seconds()*1000),"argv":gate["argv"],"cwd":str(HERE),"profile_dir":gate["profile_dir"],
            "profile_environment":{"PI_CODING_AGENT_DIR":gate["profile_dir"]},"forced_online":True,"extensions_disabled":True,"timeout_seconds":gate["command_timeout_seconds"],
            "timed_out":timed_out,"exit_code":exit_code,"stdout":raw_record(stdout),"stderr":raw_record(stderr),"projection":projection,"projection_error":projection_error}

@contextlib.contextmanager
def v2_scope() -> Iterator[None]:
    values = {"HERE":HERE, "REPO":REPO, "CONTRACT":CONTRACT, "EVIDENCE":EVIDENCE, "SOURCES":SOURCES}
    prior = {name:getattr(v2, name) for name in values}
    try:
        for name, value in values.items(): setattr(v2, name, value)
        yield
    finally:
        for name, value in prior.items(): setattr(v2, name, value)
def git_custody() -> dict[str, Any]:
    try:
        with v2_scope(): return v2.git_custody()
    except v2.ControllerError as exc: raise ControllerError(f"pushed source custody: {exc}") from exc

def expected_argv(route: dict[str, Any], row: dict[str, Any]) -> list[str]:
    argv = ORIGINAL_ARGV(route, row); require("--config" not in argv, "native/default argv cannot carry config"); return argv
def verifier_argv(route: dict[str, Any], cwd: str, session_dir: str) -> list[str]:
    found = [row for row in rows() if (row["cwd"], row["session_dir"]) == (cwd, session_dir)]
    require(len(found) == 1, "verifier argv row identity"); return expected_argv(route, found[0])
def verify_session(path: Path, **expected: Any) -> dict[str, Any]:
    projection = ORIGINAL_SESSION_VERIFY(path,**expected)
    if expected.get("expected_selector") != spec()["catalog_gate"]["expected_model"]["selector"]: return projection
    _slot, _header, entries, _raw = omp_session.load_physical_session(path)
    assistants = [entry.get("message") for entry in entries if entry.get("type") == "message" and isinstance(entry.get("message"),dict) and entry["message"].get("role") == "assistant"]
    expected_api = spec()["catalog_gate"]["expected_assistant_api"]
    require(len(assistants) == projection.get("assistant_message_count") and assistants, "MiMo assistant API roster")
    require(all(message.get("api") == expected_api for message in assistants), "MiMo assistant API exact")
    return {**projection,"assistant_api":expected_api,"assistant_api_message_count":len(assistants)}
def row_preflight(row_dir: Path, row: dict[str, Any], route: dict[str, Any]) -> dict[str, Any]:
    custody = git_custody(); require(custody == DISPATCH_CUSTODY, "source custody changed before Popen")
    receipt = ORIGINAL_PREFLIGHT(row_dir, row, route); config = receipt.get("effective_config", {})
    require(config.get("advisor.enabled") is False and config.get("task.agentAdvisor") == {"task":"off"}, "both advisor controls off")
    argv = expected_argv(route, row); require("--no-tools" in argv and "--no-skills" in argv and "--no-rules" in argv, "native restrictions")
    catalog = forced_catalog_refresh()
    receipt.update({"catalog_refresh":catalog, "catalog_refresh_sha256":catalog_receipt_digest(catalog)})
    base.atomic_json(row_dir / "omp_preflight.json", receipt)
    require(git_custody() == custody == DISPATCH_CUSTODY, "source custody changed during catalog refresh")
    receipt.update({"canary_contract":file_record(CONTRACT), "owned_sources":custody["sources"], "git_custody":custody,
                    "protocol_adapter":"native_default", "config_overlay":None, "expected_argv":argv,
                    "dependencies":frozen_records("dependencies"), "frozen_storage_artifacts":frozen_records("frozen_storage_artifacts"),
                    "authority_receipt":spec()["authority"]["paired_exchange"], "substitution":spec()["substitution"],
                    "row_time_budget_seconds":3600, "qualification_credit":0, "matrix_credit":0})
    base.atomic_json(row_dir / "omp_preflight.json", receipt)
    validate_catalog_receipt(catalog)
    return receipt

def verify_catalog_chain(row_dir: Path, receipt: dict[str, Any], launch: dict[str, Any], terminal: dict[str, Any]) -> str:
    preflight_path = row_dir/"omp_preflight.json"; require(preflight_path.is_file() and not preflight_path.is_symlink(), "catalog preflight file")
    digest = P.sha256_file(preflight_path)
    require(launch.get("omp_preflight_bytes") == preflight_path.stat().st_size and launch.get("omp_preflight_sha256") == digest, "launch/preflight bytes/hash")
    catalog = receipt.get("catalog_refresh"); require(isinstance(catalog,dict) and receipt.get("catalog_refresh_sha256") == catalog_receipt_digest(catalog), "catalog receipt digest")
    validate_catalog_receipt(catalog,launch.get("started_at_utc"))
    preflight_record = {"path":"omp_preflight.json","bytes":preflight_path.stat().st_size,"sha256":digest}
    require([record for record in terminal.get("evidence",[]) if isinstance(record,dict) and record.get("path") == "omp_preflight.json"] == [preflight_record], "terminal/preflight evidence hash")
    journal = P.load_jsonl(EVIDENCE/"launch_journal.jsonl"); require(len(journal) == 1 and journal[0].get("omp_preflight_sha256") == digest, "journal/preflight hash")
    return digest

def verify_receipt(row: dict[str, Any], custody: dict[str, Any]) -> None:
    row_dir = EVIDENCE / row["pass_id"] / row["route_id"]
    receipt, launch, terminal = (P.load_json(row_dir / name) for name in ("omp_preflight.json","launch.json","terminal.json"))
    require(receipt.get("canary_contract") == file_record(CONTRACT), "contract receipt")
    require(receipt.get("owned_sources") == custody["sources"] and receipt.get("git_custody") == custody, "exact pushed custody receipt")
    require(receipt.get("dependencies") == frozen_records("dependencies") and receipt.get("frozen_storage_artifacts") == frozen_records("frozen_storage_artifacts"), "dependency/artifact receipt")
    require(receipt.get("authority_receipt") == spec()["authority"]["paired_exchange"] and receipt.get("substitution") == spec()["substitution"], "authority/substitution receipt")
    require(receipt.get("expected_argv") == expected_argv(route_map()[row["route_id"]], row) and launch.get("argv") == receipt["expected_argv"], "argv receipt")
    require(receipt.get("protocol_adapter") == "native_default" and receipt.get("config_overlay") is None and "--config" not in launch["argv"], "native/default receipt")
    config = receipt.get("effective_config", {}); require(config.get("advisor.enabled") is False and config.get("task.agentAdvisor") == {"task":"off"}, "advisor receipt")
    require(receipt.get("row_time_budget_seconds") == 3600 and receipt.get("qualification_credit") == receipt.get("matrix_credit") == 0, "budget/credit receipt")
    verify_catalog_chain(row_dir,receipt,launch,terminal)
    session = terminal.get("session_projection", {}); ids = session.get("entry_ids", {})
    lifecycle = ("goal_active","goal_call_assistant","goal_tool_start","goal_result","goal_complete_mode","goal_completed","goal_exit","final_assistant")
    require(session.get("assistant_lifecycle_shape") == "standard_tool_cycle" and all(isinstance(ids.get(key),str) and ids[key] for key in lifecycle), "native Goal lifecycle")
    require(ids["goal_call_assistant"] != ids["final_assistant"] and session.get("assistant_message_count",0) >= 2, "distinct final assistant")
    require(terminal.get("goal_activation_observed") is True and terminal.get("goal_complete_observed") is True and terminal.get("observed_non_goal_tool_calls") == 0, "Goal/tool receipt")
    require(terminal.get("process_exit_code") == 0 and terminal.get("status") == "PASS" and terminal.get("no_retry") is True, "normal exit/PASS receipt")
    require(session.get("assistant_api") == spec()["catalog_gate"]["expected_assistant_api"] and session.get("assistant_api_message_count") == session.get("assistant_message_count"), "terminal MiMo assistant API receipt")
    base.exact_result(terminal.get("final_assistant_text")); require(session.get("final_text_sha256") == P.sha256_bytes(terminal["final_assistant_text"].encode()), "final receipt")

def generic_journal(reports: list[dict[str, Any]]) -> None:
    verified = [row for report in reports for row in report["rows"]]; require(len(verified) == 1 and verified[0]["ordinal"] == 1, "journal one-row prefix")
    path = EVIDENCE / "launch_journal.jsonl"; require(path.is_file() and not path.is_symlink(), "launch journal absent")
    journal = P.load_jsonl(path); require(path.read_bytes() == P.jsonl_bytes(journal) and len(journal) == 1, "canonical journal length")
    frozen, report, actual = rows()[0], verified[0], journal[0]
    require(set(actual) == JOURNAL_FIELDS and actual.get("schema_id") == "pm.r10.storage_pipeline.launch_journal.v2", "journal shape")
    require(all(actual.get(field) == frozen[field] for field in IDENTITY), "journal frozen identity")
    require(all(actual.get(field) == report[field] for field in ("started_at_utc","launch_sha256","omp_preflight_sha256","pid")), "journal report joins")
    require(actual.get("popen_observed") is True and isinstance(actual.get("pid"),int) and actual["pid"] > 0, "journal Popen/PID")

BINDING_NAMES = ("omp_row_runner.EVIDENCE","omp_row_runner.route_map","omp_row_runner.plan_rows","omp_row_runner.planned_row","omp_row_runner.expected_argv","omp_row_runner.row_preflight","omp_session.verify_session","verify_matrix.EVIDENCE","verify_matrix.launch_plan_map","verify_matrix.expected_argv","verify_matrix.verify_launch_journal")
def bindings() -> tuple[tuple[Any,str,Any],...]:
    return ((base,"EVIDENCE",EVIDENCE),(base,"route_map",route_map),(base,"plan_rows",rows),(base,"planned_row",planned_row),(base,"expected_argv",expected_argv),(base,"row_preflight",row_preflight),(omp_session,"verify_session",verify_session),(V,"EVIDENCE",EVIDENCE),(V,"launch_plan_map",launch_plan_map),(V,"expected_argv",verifier_argv),(V,"verify_launch_journal",generic_journal))
@contextlib.contextmanager
def installed() -> Iterator[None]:
    current = bindings(); require(len(current) == 11, "exactly eleven adapter bindings")
    prior = [(module,name,getattr(module,name)) for module,name,_value in current]
    try:
        for module,name,value in current: setattr(module,name,value)
        yield
    finally:
        for module,name,value in reversed(prior): setattr(module,name,value)

def _prefix() -> dict[str, Any]:
    journal = base.journal_rows(); require(len(journal) <= 1, "at most one journal row")
    if not journal: require(not os.path.lexists(EVIDENCE), "zero prefix requires absent evidence root")
    else:
        custody = git_custody(); row = rows()[0]; report = V.verify_row(row["pass_id"], route_map()[row["route_id"]])
        require(report.get("status") == "PASS", "fail-stop: canary is not PASS"); verify_receipt(row, custody)
        reports = [{"pass_id":row["pass_id"], "rows":[report]}]; V.verify_launch_journal(reports); V.verify_evidence_tree(reports); V.verify_global_uniqueness(reports)
        cwd, session_dir = Path(row["cwd"]), Path(row["session_dir"])
        require(cwd.is_dir() and not cwd.is_symlink() and not any(cwd.iterdir()), "completed cwd empty")
        live = base.session_file(session_dir); require(live is not None and P.sha256_file(live) == report["raw_primary_sha256"], "persistent/raw session join")
    return {"status":"PASS_MIMO_NATIVE_CANARY_ZERO_CREDIT" if journal else "PASS_EMPTY_CANARY_PREFIX_ZERO_CREDIT", "row_count":len(journal), "required_rows":1, "subject_calls":0, "qualification_credit":0, "matrix_credit":0}
def verify_prefix() -> dict[str, Any]:
    with installed(): return _prefix()

def prior_rows() -> Iterator[tuple[Path,dict[str,Any]]]:
    queue = [spec()["historic_identity_root"]]; seen: set[str] = set()
    while queue:
        record = queue.pop(0); path = REPO / record["path"]
        require(record["path"] not in seen and file_record(path) == record, f"historic manifest drift: {record['path']}"); seen.add(record["path"])
        manifest = P.load_json(path)
        for row in manifest.get("rows", []): yield path.parent, row
        nested = manifest.get("historic_identity_root")
        if isinstance(nested, dict): queue.append(nested)
        queue.extend(record for record in manifest.get("historic_identity_manifests", []) if isinstance(record, dict))
def metric(path: Path) -> dict[str,int]:
    raw = path.read_bytes(); return {"lines":len(raw.splitlines()), "bytes":len(raw)}

def validate_authority(authority: dict[str, Any]) -> None:
    pair = authority["paired_exchange"]; proposal, reply = pair["proposal"], pair["user_reply"]
    proposal_raw = proposal["text_utf8"].encode(); visible = reply["visible_excerpt_utf8"].encode(); raw = reply["raw_input_text_utf8"].encode()
    require(authority["source_thread_id"] == "01a034b9-a1c8-7a80-937f-4e45e3f2ae45", "authority thread")
    require((proposal["source_jsonl_basename"],proposal["physical_line"],proposal["ordinal"],proposal["timestamp"],proposal["turn_id"],proposal["message_id"],proposal["role"],proposal["phase"]) == ("rollout-2026-08-24T17-02-55-01a034b9-a1c8-7a80-937f-4e45e3f2ae45.jsonl",28542,28541,"2026-08-26T19:22:49.358Z","01a03e40-8122-7a03-9b49-1a569213eb14","msg_09747b8db7972cfa016a8f3d05e1f487d19d05231bbbdf75f3","assistant","final_answer"), "proposal event identity")
    require(len(proposal_raw) == proposal["text_utf8_bytes"] == 690 and P.sha256_bytes(proposal_raw) == proposal["text_sha256"] == "5848f27d6c3bc2de956bba63ef3edbfc7c8859784dbcfab4a2b1dadbaa8b708b", "proposal bytes")
    require((proposal["jsonl_line_bytes_including_lf"],proposal["jsonl_line_sha256_including_lf"]) == (1050,"f1f7db0d43cc2b22b0277d25b3d5f4315bde0d1ca38258ddcd9366be377c17a3"), "proposal raw line receipt")
    require("preceded by one fresh zero-credit native-Goal canary" in proposal["text_utf8"] and "Do you authorize the recommended MiMo replacement?" in proposal["text_utf8"], "proposal scope")
    require((reply["source_jsonl_basename"],reply["physical_line"],reply["ordinal"],reply["timestamp"],reply["turn_id"],reply["message_id"],reply["role"]) == (proposal["source_jsonl_basename"],28589,28588,"2026-08-26T19:27:23.642Z","01a03f8a-9682-7322-8e20-d0eca31fe653","msg_01a03f8a-9bfa-7e43-b40f-d54b5a8f19a9","user"), "reply event identity")
    require(len(visible) == reply["visible_excerpt_utf8_bytes"] == 51 and P.sha256_bytes(visible) == reply["visible_excerpt_sha256"] == "c3f2a0295a896aaa1a78e13230163a9672ff651b9d9c9c382da55c7528d2d37d", "reply excerpt bytes")
    require(raw == visible + b"\n" and len(raw) == reply["raw_input_text_utf8_bytes"] == 52 and P.sha256_bytes(raw) == reply["raw_input_text_sha256"] == "bc4118a608ea44eab2375e9c7b37774cafe6f12f64caac4a29c003797f916a5d", "reply raw bytes")
    require((reply["jsonl_line_bytes_including_lf"],reply["jsonl_line_sha256_including_lf"]) == (397,"708a7c9b6fb4cde4a1e08b34a361a88006b50757882298b997764aef34021f5b"), "reply raw line receipt")
    require((reply["corroborating_event_physical_line"],reply["corroborating_event_timestamp"],reply["corroborating_event_ordinal"],reply["corroborating_event_turn_id"],reply["corroborating_event_item_id"],reply["corroborating_event_jsonl_line_bytes_including_lf"],reply["corroborating_event_jsonl_line_sha256_including_lf"]) == (28590,"2026-08-26T19:27:23.659Z",28589,reply["turn_id"],"01a03f8a-9c0b-72c3-b5a7-dd8dd3b8c3dc",509,"5c0c7925243ef8cc694b77d3b415ba8a42c84929585ee11d0efbb9ca685a4154"), "reply corroborating event")
    require(proposal["timestamp"] < reply["timestamp"] < reply["corroborating_event_timestamp"] and proposal["role"] == "assistant" and reply["role"] == "user", "paired chronology")
    require(reply["turn_id"] == reply["corroborating_event_turn_id"] and authority["authorized_selector"] == "opencode-zen/mimo-v2.5-free" and authority["authorized_thinking"] == "high", "paired selector authority")

def validate_static(*, unused: bool) -> dict[str, Any]:
    contract, row, route = spec(), rows()[0], next(iter(route_map().values()))
    require(contract.get("schema_id") == "pm.r10.storage_pipeline.storage_mimo_native_canary.v1", "schema")
    actual = {path.name for path in HERE.iterdir()}; require(actual == set(SOURCES) if unused else actual in (set(SOURCES), set(SOURCES)|{"evidence"}), "package root roster")
    require(contract.get("owned_file_roster") == list(SOURCES) and all((HERE/name).is_file() and not (HERE/name).is_symlink() for name in SOURCES), "four regular sources")
    metrics = {name:metric(HERE/name) for name in SOURCES}; limits = contract["architecture_limits"]
    require(metrics["controller.py"]["lines"] <= limits["controller_max_physical_lines"] and metrics["controller.py"]["bytes"] <= limits["controller_max_bytes"], "controller budget")
    require(metrics["selftest.py"]["lines"] <= limits["selftest_max_physical_lines"] and metrics["selftest.py"]["bytes"] <= limits["selftest_max_bytes"], "selftest budget")
    python = [metrics[name] for name in ("controller.py","selftest.py")]
    require(sum(x["lines"] for x in python) <= limits["all_python_max_physical_lines"] and sum(x["bytes"] for x in python) <= limits["all_python_max_bytes"], "Python budget")
    require(sum(x["lines"] for x in metrics.values()) <= limits["total_max_physical_lines"] and sum(x["bytes"] for x in metrics.values()) <= limits["total_max_bytes"], "package budget")
    require(contract.get("temporary_bindings") == list(BINDING_NAMES) and limits["temporary_binding_count"] == 11 and limits["copied_v7_runner_parser_scorer_verifier_body_count"] == 0, "architecture freeze")
    dependency_paths = [record["path"] for record in frozen_records("dependencies")]
    require(dependency_paths == [f"tests/agent_packet_restrictions/successor_20260813/r10_simple_goal_prompts_v1/{path}" for path in ("system_pipeline_sandbox_v7/omp_row_runner.py","system_pipeline_sandbox_v7/omp_session.py","system_pipeline_sandbox_v7/verify_matrix.py","system_pipeline_sandbox_v7/pipeline.py","system_pipeline_sandbox_v7/freeze_check.py","system_pipeline_sandbox_v7/freeze_manifest.json","system_pipeline_sandbox_v7/matrix.json","system_pipeline_sandbox_v7/runtime_manifest.json","storage_native_matrix_v2/controller.py")], "exact dependency roster")
    artifacts = frozen_records("frozen_storage_artifacts")
    require([record["path"] for record in artifacts] == [f"tests/agent_packet_restrictions/successor_20260813/r10_simple_goal_prompts_v1/system_pipeline_sandbox_v7/{path}" for path in ("prompts/omp.prompt.txt","host_outputs/capsule.json","oracle.json","response.schema.json")], "exact subject artifact roster")
    require(file_record(REPO/contract["historic_identity_root"]["path"]) == contract["historic_identity_root"], "historic root freeze")
    prompt = V7/"prompts/omp.prompt.txt"; require(artifacts[0] == file_record(prompt) and prompt.stat().st_size == 3036 and P.sha256_file(prompt) == "eff40a61579a080ce6e21bb71bcae2dd0640c100c9d61c199f45ac5dece43638", "exact V7 prompt")
    suffix = row["nonce"][:10]
    require((row["ordinal"],row["pass_id"],row["route_id"],row["surface"],row["model"],row["thinking"],row["protocol_adapter"]) == (1,"pass_01","omp_mimo_v25_free_high","omp_tui","opencode-zen/mimo-v2.5-free","high","native_default"), "route identity")
    require(route == {"id":row["route_id"],"surface":row["surface"],"model":row["model"],"thinking":row["thinking"]}, "route join")
    require(row["attempt_id"] == f"storage-mimo-native-canary-v1-01-{suffix}" and len(row["nonce"]) == 32 and all(c in "0123456789abcdef" for c in row["nonce"]), "attempt/nonce")
    require(row["cwd"] == f"/tmp/pm-r10-storage-v7-mimo-native-canary-v1-01-{suffix}" and row["session_dir"] == f"/tmp/pm-r10-storage-v7-session-mimo-native-canary-v1-01-{suffix}", "runtime identity")
    require(row["evidence_path"] == "evidence/pass_01/omp_mimo_v25_free_high" and row["prompt_utf8_bytes"] == 3036 and row["prompt_sha256"] == P.sha256_file(prompt), "evidence/prompt")
    argv = expected_argv(route, row); require("--config" not in argv and "--no-tools" in argv and argv[-4:] == ["--model",row["model"],"--thinking",row["thinking"]], "native argv")
    for root, prior in prior_rows():
        require(all(field not in prior or row[field] != prior[field] for field in ("attempt_id","nonce","cwd","session_dir")), "historic identity disjointness")
        if "evidence_path" in prior: require((HERE/row["evidence_path"]).resolve() != (root/prior["evidence_path"]).resolve(), "historic evidence disjointness")
    runtime, sequence, authority, substitution = contract["runtime"], contract["sequencing"], contract["authority"], contract["substitution"]
    binary = Path(runtime["binary"]); require(binary.is_file() and not binary.is_symlink() and binary.stat().st_size == runtime["binary_bytes"] and P.sha256_file(binary) == runtime["binary_sha256"] and runtime["version"] == "omp/18.0.4", "OMP binary/version")
    require(runtime["row_time_budget_seconds"] == 3600 and runtime["advisor_enabled"] is False and runtime["task_agent_advisor"] == {"task":"off"} and runtime["ordinary_tools_enabled"] is runtime["skills_enabled"] is runtime["rules_enabled"] is False, "runtime restrictions")
    require(runtime["config_overlay"] is None and runtime["external_goal_prompt_count"] == 1 and runtime["native_goal_required"] is runtime["normal_exit_required"] is runtime["isolated_linux_only"] is runtime["windows_omp_terminal_processes_are_foreign"] is True, "native/Linux runtime")
    require(runtime["profile_dir"] == "/home/sittingmongoose/.omp/pmdev-r10-simple-canary-v1", "isolated profile")
    catalog = contract["catalog_gate"]; expected_model = catalog["expected_model"]
    require(set(catalog) == {"schema_id","argv","profile_dir","command_timeout_seconds","freshness_to_popen_max_seconds","forced_online","extensions_disabled","stderr_must_be_empty","exact_selector_count","zero_price_required","required_thinking_effort","recognized_thinking_efforts","expected_assistant_api","expected_model"}, "catalog gate shape")
    require(catalog["schema_id"] == "pm.r10.storage_pipeline.omp_catalog_gate.v1" and catalog["argv"] == [runtime["binary"],"models","refresh","opencode-zen","--json","--no-extensions"], "exact forced catalog refresh argv")
    require(catalog["profile_dir"] == runtime["profile_dir"] and catalog["command_timeout_seconds"] == 30 and catalog["freshness_to_popen_max_seconds"] == 60 and catalog["forced_online"] is catalog["extensions_disabled"] is catalog["stderr_must_be_empty"] is True, "catalog execution gate")
    require(expected_model == {"provider":"opencode-zen","id":"mimo-v2.5-free","selector":row["model"],"name":"MiMo V2.5 Free","contextWindow":200000,"maxTokens":32000,"reasoning":True,"input":["text","image"],"cost":{"input":0,"output":0,"cacheRead":0,"cacheWrite":0}}, "catalog model freeze")
    require(catalog["required_thinking_effort"] == row["thinking"] and catalog["recognized_thinking_efforts"] == ["none","minimal","low","medium","high","xhigh","max"], "catalog thinking gate")
    require(catalog["expected_assistant_api"] == "openai-completions" and catalog["zero_price_required"] is True and catalog["exact_selector_count"] == 1, "catalog price/API/uniqueness gate")
    require(sequence == {"required_rows":1,"exact_route_order":[row["route_id"]],"all_rows_count":True,"only_next_ordinal_launchable":True,"fail_stop_on_first_failure_or_custody_mismatch":True,"retry_count":0,"replacement_count":0,"best_of":False,"qualification_credit":0,"matrix_credit":0,"production_credit":0,"automatically_authorizes_matrix_or_successor":False}, "one-row fail-stop")
    validate_authority(authority); require(authority["authorized_attempt_ids"] == [row["attempt_id"]] and authority["authorized_fresh_canary_count"] == 1, "one-row authority")
    require(all(authority[key] is False for key in ("retry_replacement_reuse_or_retro_credit_authorized","other_route_or_subject_authorized_by_this_contract","matrix_launch_authorized_by_this_canary_contract")) and contract["source_candidate_commit"] is None, "authority ceiling")
    require(substitution == {"from_selector":"opencode-go/ox-alpha-free","from_thinking":"max","to_selector":row["model"],"to_thinking":row["thinking"],"provider_model_effort_changed":True,"provider_data_processing_boundary_changed":True,"data_policy_privacy_retention_availability_or_quality_equivalence_claimed":False,"subject_prompt_changed":False,"scorer_changed":False}, "substitution freeze")
    require(P.preflight_inputs()["status"] == "PASS" and P.verify()["status"] == "PASS_VERIFIED_NO_WORKNODES" and freeze_check.verify_freeze()["status"] == "PASS_FROZEN_ZERO_SUBJECT", "V7 pipeline/freeze")
    if unused:
        require(not os.path.lexists(EVIDENCE) and not os.path.lexists(row["cwd"]) and not os.path.lexists(row["session_dir"]), "unused evidence/runtime absent")
    require(not list(HERE.rglob("*.pyc")) and not list(HERE.rglob("__pycache__")), "no cache")
    return {"status":"PASS_LOCAL_MIMO_NATIVE_CANARY_PRELAUNCH", "rows":1, "temporary_bindings":11, "metrics":metrics, "subject_calls":0, "qualification_credit":0, "matrix_credit":0}

def require_authority(row: dict[str, Any]) -> None:
    authority = spec()["authority"]; validate_authority(authority)
    require(authority["authorized_attempt_ids"] == [row["attempt_id"]] and row["model"] == authority["authorized_selector"] and row["thinking"] == authority["authorized_thinking"], "exact canary authority")
    require(all(authority[key] is False for key in ("retry_replacement_reuse_or_retro_credit_authorized","other_route_or_subject_authorized_by_this_contract","matrix_launch_authorized_by_this_canary_contract")), "authority cannot widen")
def claim_after_failure(row: dict[str, Any], before: tuple[bool,bool,bool] | None) -> bool:
    try:
        with v2_scope(): return bool(v2.claim_after_failure(row, before))
    except v2.ControllerError as exc: raise ControllerError(f"failure claim: {exc}") from exc
def preserve_postfailure(row: dict[str, Any]) -> None:
    row_dir, session_dir = EVIDENCE/row["pass_id"]/row["route_id"], Path(row["session_dir"])
    source = base.session_file(session_dir) if session_dir.is_dir() else None
    if source is not None:
        target = row_dir/"postfailure_session.raw.jsonl"; require(not os.path.lexists(target), "postfailure receipt already exists"); P.atomic_write(target, source.read_bytes())

ERRORS = (ControllerError,base.RunnerError,omp_session.OmpSessionError,V.VerifyError,P.PipelineError,subprocess.SubprocessError,OSError,ValueError,KeyError,TypeError,AssertionError)
def dispatch(argv: list[str] | None = None) -> int:
    global DISPATCH_CUSTODY
    parser = argparse.ArgumentParser(); parser.add_argument("command",choices=("lint","verify-prefix","run")); parser.add_argument("ordinal",nargs="?",type=int,choices=(1,)); parser.add_argument("--max-seconds",type=int,default=3600); args = parser.parse_args(argv)
    row = None; before = None
    try:
        require((args.command == "run") == (args.ordinal is not None), "ordinal only for run"); static = validate_static(unused=args.command == "lint")
        if args.command == "lint": print(P.canonical_json({"status":"PASS_ZERO_SUBJECT_LINT",**static})); return 0
        if args.command == "verify-prefix": print(P.canonical_json(verify_prefix())); return 0
        require(args.max_seconds == 3600, "frozen 3600-second row budget"); row = rows()[0]; require_authority(row); DISPATCH_CUSTODY = git_custody()
        with installed():
            prefix = _prefix(); require(prefix["row_count"] == 0, "canary already consumed")
            row_dir = EVIDENCE/row["pass_id"]/row["route_id"]; before = tuple(os.path.lexists(path) for path in (EVIDENCE,row_dir.parent,row_dir))
            terminal = base.run_row(row["pass_id"],row["route_id"],3600)
    except base.ReservationConflict as exc:
        print(P.canonical_json({"status":"FAIL_ALREADY_CONSUMED_NO_MUTATION","error":f"{type(exc).__name__}: {exc}","qualification_credit":0,"matrix_credit":0})); return 1
    except ERRORS as exc:
        claimed = row is not None and before is not None and claim_after_failure(row, before)
        if claimed:
            try: preserve_postfailure(row)
            except ERRORS as preserve_exc: exc = ControllerError(f"{type(exc).__name__}: {exc}; postfailure preserve: {type(preserve_exc).__name__}: {preserve_exc}")
            with installed(): base.record_failure(row["pass_id"],row["route_id"],exc)
            failure = P.load_json(EVIDENCE/row["pass_id"]/row["route_id"]/"terminal.json"); require(failure.get("status") == "FAIL" and failure.get("no_retry") is True, "durable failure terminal")
        print(P.canonical_json({"status":"FAIL_MIMO_CANARY_CONSUMED_NO_RETRY" if claimed else "FAIL_PRELAUNCH_NO_MUTATION","error":f"{type(exc).__name__}: {exc}","qualification_credit":0,"matrix_credit":0})); return 1
    finally: DISPATCH_CUSTODY = None
    print(P.canonical_json({"status":"PASS_MIMO_NATIVE_CANARY_ZERO_CREDIT","ordinal":1,"terminal":terminal,"qualification_credit":0,"matrix_credit":0})); return 0
if __name__ == "__main__": raise SystemExit(dispatch())
