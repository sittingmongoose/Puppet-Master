#!/usr/bin/env python3
import argparse
import contextlib
import os
import stat
import subprocess
import sys
from pathlib import Path
HERE = Path(__file__).resolve().parent
R10 = HERE.parent
REPO = HERE.parents[4]
V7 = R10 / "system_pipeline_sandbox_v7"
sys.path.insert(0, str(V7))
import freeze_check
import omp_row_runner as base
import omp_session
import pipeline as P
import verify_matrix as V
import codex_app_lane as app
CONTRACT = HERE / "matrix_contract.json"
EVIDENCE = HERE / "evidence"
SOURCES = ("README.md", "matrix_contract.json", "controller.py", "codex_app_lane.py", "selftest.py")
IDENTITY = ("ordinal", "pass_id", "route_id", "attempt_id", "nonce")
ORIGINAL_PREFLIGHT = base.row_preflight
ORIGINAL_EXACT = base.exact_result
ORIGINAL_ARGV = base.expected_argv; DISPATCH_CUSTODY = None
class ControllerError(RuntimeError): pass
class PermanentTerminalResultFailure(RuntimeError): pass
def require(value,message):
    if not value:
        raise ControllerError(message)
def spec():
    value = P.load_json(CONTRACT); require(isinstance(value, dict), "contract"); return value
def rows():
    value = spec().get("rows"); require(isinstance(value, list) and len(value) == 24, "rows"); return value
def route_map():
    return {route["id"]: route for route in P.load_json(V7 / "matrix.json")["ordered_routes"]}
def launch_plan_map():
    return {(row["pass_id"], row["route_id"]): row for row in rows()}
def file_record(path,root=REPO):
    require(path.is_file() and not path.is_symlink(), f"file: {path}")
    return {"path": path.relative_to(root).as_posix(), "bytes": path.stat().st_size, "sha256": P.sha256_file(path)}
def records(field,root):
    result = []
    for expected in spec()[field]:
        path = root / expected["path"]
        actual = {"path":expected["path"], "bytes":path.stat().st_size, "sha256":P.sha256_file(path)} if path.is_file() and not path.is_symlink() else {}
        require(actual == expected, f"{field} drift: {expected['path']}"); result.append(actual)
    return result
def run_git(*args,binary=False):
    return subprocess.run(["git", "-C", str(REPO), *args], check=False, capture_output=True, text=not binary)

def live_source(path):
    relative=path.relative_to(REPO); current=REPO
    for part in relative.parts[:-1]:
        current/=part; require(current.is_dir() and not current.is_symlink(),"source parent")
    mode=path.lstat().st_mode; require(stat.S_ISREG(mode) and not path.is_symlink(),"source file")
    return relative.as_posix(),mode

def git_entry(relative,index):
    args=("ls-files","--stage","--",relative) if index else ("ls-tree","HEAD","--",relative); result=run_git(*args)
    lines=result.stdout.splitlines(); require(result.returncode==0 and len(lines)==1,"Git entry")
    metadata,seen=lines[0].split("\t",1); fields=metadata.split(); require(seen==relative,"path")
    if index: require(len(fields)==3 and fields[2]=="0","stage"); return fields[0],fields[1]
    require(len(fields)==3 and fields[1]=="blob","blob"); return fields[0],fields[2]

def git_custody():
    results=[run_git("rev-parse",ref) for ref in ("HEAD","origin/main","truenas-backup/main")]; refs=[result.stdout.strip() for result in results]
    require(all(result.returncode==0 for result in results) and all(len(ref)==40 for ref in refs) and refs[0]==refs[1]==refs[2],"refs")
    owned = []
    for name in SOURCES:
        path=HERE/name; relative,live_mode=live_source(path); index=git_entry(relative,True); head=git_entry(relative,False)
        require(index==head and head[0] in {"100644","100755"},f"index: {name}")
        blob=run_git("cat-file","blob",head[1],binary=True); require(blob.returncode==0 and blob.stdout==path.read_bytes(),f"live: {name}")
        require(bool(live_mode&0o111)==(head[0]=="100755"),f"mode: {name}")
        record=file_record(path); record.update(git_mode=head[0],git_oid=head[1]); owned.append(record)
    return {"candidate_commit":refs[0],"head":refs[0],"origin_main":refs[1],"truenas_backup_main":refs[2],"sources":owned}

def exact_result(text):
    try:
        ORIGINAL_EXACT(text)
    except base.RunnerError as exc:
        raise PermanentTerminalResultFailure(str(exc)) from exc

def row_preflight(d,planned,route):
    custody=git_custody(); require(custody==DISPATCH_CUSTODY,"custody changed before Popen"); receipt=ORIGINAL_PREFLIGHT(d,planned,route)
    argv = ORIGINAL_ARGV(route, planned)
    require("--config" not in argv and receipt.get("effective_config", {}).get("advisor.enabled") is False, "native argv")
    require(receipt.get("effective_config", {}).get("task.agent.advisor") == {"task":"off"}, "advisor off")
    receipt.update({"matrix_contract":file_record(CONTRACT), "owned_sources":custody["sources"],
                    "git_custody":custody, "protocol_adapter":"native_default", "config_overlay":None,
                    "row_time_budget_seconds":3600, "expected_argv":argv, "qualification_credit":0})
    base.atomic_json(d / "omp_preflight.json", receipt); return receipt

BINDINGS = ((base,"EVIDENCE",EVIDENCE), (base,"plan_rows",rows), (base,"row_preflight",row_preflight),
            (base,"exact_result",exact_result), (V,"EVIDENCE",EVIDENCE), (V,"launch_plan_map",launch_plan_map))

@contextlib.contextmanager
def installed():
    prior = [(module, name, getattr(module, name)) for module, name, _ in BINDINGS]
    try:
        for module, name, value in BINDINGS: setattr(module, name, value)
        yield
    finally:
        for module, name, value in reversed(prior): setattr(module, name, value)

def prior_rows():
    paths = [R10 / f"system_pipeline_sandbox_v{n}" / "launch_plan.json" for n in range(1, 8)]
    paths += [R10 / name / filename for name, filename in (
        ("muse_owned_xml_probe_v1","probe_contract.json"), ("muse_owned_glm_probe_v1","probe_contract.json"),
        ("muse_owned_glm_probe_v2","probe_contract.json"), ("ox_owned_glm_reliability_v3","reliability_contract.json"),
        ("ox_native_reliability_v1","reliability_contract.json"))]
    for path in paths:
        if path.is_file():
            yield from P.load_json(path).get("rows", [])

def metric(path):
    return {"lines":len(path.read_bytes().splitlines()), "bytes":path.stat().st_size}

def validate_static(*,unused=True):
    contract, frozen, routes = spec(), rows(), list(route_map().values())
    require(contract.get("schema_id") == "pm.r10.storage_pipeline.storage_native_matrix.v1", "schema")
    actual_root = {path.name for path in HERE.iterdir()}
    require(actual_root == set(SOURCES) if unused else actual_root in (set(SOURCES), set(SOURCES) | {"evidence"}), "root roster")
    require(contract.get("owned_file_roster") == list(SOURCES) and all((HERE/name).is_file() and not (HERE/name).is_symlink() for name in SOURCES), "roster")
    limits = contract["architecture_limits"]; metrics = {name:metric(HERE/name) for name in SOURCES}
    require(metrics["controller.py"]["lines"] <= limits["controller_max_physical_lines"], "ctl lines")
    require(metrics["codex_app_lane.py"]["lines"] <= limits["codex_app_lane_max_physical_lines"], "lane lines")
    require(metrics["selftest.py"]["lines"] <= limits["selftest_max_physical_lines"], "test lines")
    python = [metrics[name] for name in ("controller.py","codex_app_lane.py","selftest.py")]
    require(sum(x["lines"] for x in python) <= limits["all_python_max_physical_lines"] and sum(x["bytes"] for x in python) <= limits["all_python_max_bytes"], "Python budget")
    require(sum(x["lines"] for x in metrics.values()) <= limits["total_max_physical_lines"] and sum(x["bytes"] for x in metrics.values()) <= limits["total_max_bytes"], "package budget")
    freeze = contract["v7_freeze_manifest"]
    require((V7/"freeze_manifest.json").stat().st_size == freeze["bytes"] and P.sha256_file(V7/"freeze_manifest.json") == freeze["sha256"], "V7 freeze")
    require(len(records("immutable_v7_files", V7)) == 10 and len(records("declared_inputs", REPO)) == 10, "10 inputs")
    expected_outputs = records("derived_outputs", V7); derived = P.derive()
    require(len(expected_outputs) == len(derived) == 13 and all(len(derived[item["path"]]) == item["bytes"] and P.sha256_bytes(derived[item["path"]]) == item["sha256"] for item in expected_outputs), "outputs")
    for name, expected in contract["prompts"].items():
        path = V7 / expected["path"]; require(path.stat().st_size == expected["bytes"] and P.sha256_file(path) == expected["sha256"], f"{name} prompt")
    capsule = contract["capsule"]; value = P.load_json(V7/capsule["path"]); canonical = P.canonical_json(value).encode()
    require((V7/capsule["path"]).stat().st_size == capsule["pretty_bytes"] and P.sha256_file(V7/capsule["path"]) == capsule["pretty_sha256"], "capsule")
    require(len(canonical) == capsule["canonical_bytes"] and P.sha256_bytes(canonical) == capsule["canonical_sha256"], "canonical")
    require([row["ordinal"] for row in frozen] == list(range(1,25)) and [row["pass_id"] for row in frozen] == ["pass_01"]*12+["pass_02"]*12, "row order")
    require([row["route_id"] for row in frozen[:12]] == [route["id"] for route in routes] == [row["route_id"] for row in frozen[12:]], "routes")
    require(frozen[0]["route_id"] == frozen[12]["route_id"] == "omp_ox_alpha_free_max" and frozen[1]["route_id"] == frozen[13]["route_id"] == "omp_cursor_default_auto", "gates")
    require(frozen[2]["route_id"] == frozen[14]["route_id"] == "omp_muse_spark_xhigh" and frozen[11]["route_id"] == frozen[23]["route_id"] == "omp_qwen3_8_max_xhigh", "Muse/Qwen")
    for row in frozen:
        route = route_map()[row["route_id"]]; suffix = row["nonce"][:10]
        require(all(row[k] == route[k] for k in ("surface","model","thinking")), "route")
        require(row["attempt_id"] == f"storage-native-matrix-v1-{row['pass_id']}-{row['ordinal']:02d}-{suffix}", "attempt")
        expected_prompt = contract["prompts"]["omp" if row["surface"] == "omp_tui" else "codex"]
        require((row["prompt_utf8_bytes"],row["prompt_sha256"]) == (expected_prompt["bytes"],expected_prompt["sha256"]), "row prompt")
        require(row["evidence_path"] == f"evidence/{row['pass_id']}/{row['route_id']}", "evidence path")
        if row["surface"] == "omp_tui":
            require(row["cwd"].startswith("/tmp/pm-r10-storage-v7-") and row["session_dir"].startswith("/tmp/pm-r10-storage-v7-session-"), "temp prefixes")
            argv = ORIGINAL_ARGV(route,row)
            require("--config" not in argv and all(flag in argv for flag in ("--no-tools","--no-skills","--no-rules")), "native flags")
        else:
            request = app.create_request(row,(V7/"prompts/codex.prompt.txt").read_text()); require(set(request) == {"prompt","target","model","thinking","title"}, "create request")
    for field in ("attempt_id","nonce","evidence_path"):
        require(len({row[field] for row in frozen}) == 24, f"unique {field}")
    require(len({row.get("cwd",row.get("projectless_directory_name")) for row in frozen}) == 24, "directories")
    old = list(prior_rows())
    for row in frozen:
        require(all(row.get(field) != prior.get(field) for prior in old for field in ("attempt_id","nonce","cwd","session_dir","projectless_directory_name") if row.get(field) is not None), "prior disjointness")
    authority = contract["authority"]
    require(authority.get("source_thread_id")=="01a034b9-a1c8-7a80-937f-4e45e3f2ae45", "thread")
    raw = authority["free_ox_user_text_utf8"].encode(); require(len(raw) == 69 and P.sha256_bytes(raw) == authority["free_ox_user_text_sha256"] == "99df1f43d62da6ae6314c385f43208ac159374deed46c8b16382d3c9909d54e8", "Ox authority")
    grant = authority.get("matrix_launch_grant")
    require(all(authority[key] is True for key in ("full_matrix_subject_calls_authorized","codex_app_task_creation_authorized","non_ox_provider_calls_authorized")), "authority")
    require(isinstance(grant,dict) and grant.get("status")=="AUTHORIZED_EXACT_FROZEN_24_ROWS_ONLY" and grant.get("source_thread_id")==authority["source_thread_id"], "provenance")
    require((grant.get("source_goal_message_ordinal"),grant.get("source_goal_message_utf8_bytes"),grant.get("source_goal_message_sha256"))==(8,6298,"7aa6d83584c6bc46f5554bd3a9ff409c3caacab3cf32842ae75df528faf78ce3"), "goal receipt")
    excerpt=grant.get("source_goal_exact_excerpt_utf8","").encode(); require(len(excerpt)==grant.get("source_goal_exact_excerpt_utf8_bytes")==149 and P.sha256_bytes(excerpt)==grant.get("source_goal_exact_excerpt_sha256")=="ade93166ac207c58554e24a78ff4a6bf190376daf870a5e94cc04a4972ecd83e", "goal bytes")
    messages=grant.get("later_exact_user_messages"); require(isinstance(messages,list) and len(messages)==3, "messages")
    expected_messages=((13748,122,"5715c13d462b22afa481b8ae7d0764b540bf5192664861911e70a47f92b48788"),(14829,371,"5cb4e366adf20ec27742c0a6e4fc419332eeab9f30c8de5c93405f13829729de"),(23490,854,"c532a6447d45d9d2d0200281010b5e989fbe12f108d27eb913d60b772fb16ca6"))
    for message,expected in zip(messages,expected_messages,strict=True):
        message_raw=message.get("user_text_utf8","").encode(); require(len(message_raw)==message.get("user_text_utf8_bytes") and P.sha256_bytes(message_raw)==message.get("user_text_sha256"), "message bytes")
        require((message.get("source_ordinal"),message.get("user_text_utf8_bytes"),message.get("user_text_sha256"))==expected, "message receipt")
    projection=[{k:row[k] for k in IDENTITY} for row in frozen]; projection_raw=P.canonical_json(projection).encode()
    require(len(projection_raw)==grant.get("authorized_rows_projection_utf8_bytes") and P.sha256_bytes(projection_raw)==grant.get("authorized_rows_projection_sha256"), "authority rows")
    require(grant.get("authorized_row_count")==24 and grant.get("authorized_surfaces")==["omp_tui","codex_app"] and grant.get("authorized_passes")==["pass_01","pass_02"], "grant")
    require(all(grant.get(key) is False for key in ("follow_up_or_send_authorized","retry_or_replacement_authorized","unfrozen_route_or_identity_authorized","other_task_creation_authorized")), "ceiling")
    require(authority.get("pushed_source_custody")=="LIVE_RAW_GIT_5_PATH_V1" and "source_candidate_commit" not in authority,"custody mode")
    require(contract.get("status")=="FROZEN_ZERO_SUBJECT_AUTHORIZED_LIVE_PUSHED_CUSTODY_GATE", "status")
    runtime = contract["runtime"]; frozen_runtime = P.load_json(V7/"runtime_manifest.json")["omp"]
    require(runtime["omp_version"] == frozen_runtime["version"] and runtime["omp_advisor_enabled"] is False and runtime["omp_task_agent_advisor"] == {"task":"off"}, "runtime")
    require(runtime["foreign_windows_omp_terminal_boundary"] == "DO_NOT_INSPECT_FOCUS_INJECT_SIGNAL_REUSE_CLOSE_OR_CLEANUP", "Windows")
    require((runtime["row_time_budget_seconds"],runtime["codex_wait_timeout_ms"],runtime["codex_wait_max_receipts"],runtime["codex_raw_stable_read_count"])==(3600,120000,30,2), "bounds")
    require(runtime["codex_parent_allowed_calls"]==["create_thread","wait_threads","read_thread"] and not set(runtime["codex_parent_allowed_calls"])&set(runtime["codex_parent_forbidden_calls"]), "allowlist")
    tool_bytes=P.canonical_json(contract["codex_tool_contracts"]).encode()
    require(len(tool_bytes)==574 and P.sha256_bytes(tool_bytes)=="2ef82493d06148eec140b8b44e3a47ea064c75ff0fc67a01586e46e691729ef9","App schemas")
    require(runtime["codex_raw_ingest"]=="two_explicit_creating_host_copy_receipts" and runtime["codex_local_home_session_discovery_allowed"] is False, "raw-copy")
    require(P.preflight_inputs()["status"] == "PASS" and P.omp_runtime_preflight()["status"] == "PASS_OMP_RUNTIME", "preflights")
    verified = P.verify(); require(verified["status"] == "PASS_VERIFIED_NO_WORKNODES" and freeze_check.verify_freeze()["status"] == "PASS_FROZEN_ZERO_SUBJECT", "verify/freeze")
    if unused:
        require(not os.path.lexists(EVIDENCE), "evidence absent")
        for row in frozen:
            require(not os.path.lexists(HERE/row["evidence_path"]), "evidence absent")
            for field in ("cwd","session_dir"): require(field not in row or not os.path.lexists(row[field]), "runtime absent")
    require(not list(HERE.rglob("*.pyc")) and not list(HERE.rglob("__pycache__")), "no cache")
    return {"status":"PASS_LOCAL_STORAGE_NATIVE_MATRIX_PRELAUNCH", "rows":24, "subject_calls":0, "qualification_credit":0, "metrics":metrics}

def verify_extended(path,adapter,custody=None):
    receipt=P.load_json(path); custody=custody or git_custody(); expected=custody["sources"]
    require(all(set(item)=={"path","bytes","sha256","git_mode","git_oid"} for item in expected),"shape")
    require(receipt.get("matrix_contract")==file_record(CONTRACT) and receipt.get("owned_sources")==expected, "source hashes")
    require(receipt.get("git_custody")==custody and custody["candidate_commit"]==custody["head"]==custody["origin_main"]==custody["truenas_backup_main"] and custody["sources"]==expected,"pushed custody")
    require(receipt.get("protocol_adapter")==adapter and receipt.get("row_time_budget_seconds")==3600, "receipt")
    return receipt

def verify_omp_receipt(row,custody):
    receipt=verify_extended(EVIDENCE/row["pass_id"]/row["route_id"]/"omp_preflight.json","native_default",custody)
    require(receipt.get("config_overlay") is None and "--config" not in receipt.get("expected_argv",[]), "argv")

def verify_app_launch(row,custody):
    launch=verify_extended(EVIDENCE/row["pass_id"]/row["route_id"]/"launch.json","codex_app_host_receipt",custody)
    require(launch.get("parent_allowed_calls")==["create_thread","wait_threads","read_thread"], "calls"); return launch

def mixed_journal(journal,reports):
    require(len(journal) == len(reports), "journal length")
    for expected, actual in zip(reports,journal,strict=True):
        frozen = rows()[expected["ordinal"]-1]
        require(all(actual.get(k) == frozen[k] for k in IDENTITY), "journal identity")
        require(actual.get("launch_sha256") == expected["launch_sha256"] and actual.get("omp_preflight_sha256") == expected["omp_preflight_sha256"], "journal hashes")
        if expected["surface"] == "omp_tui":
            require(actual.get("popen_observed") is True and actual.get("pid")==expected.get("pid") and actual.get("app_create_observed") is None, "OMP launch")
        else:
            require(actual.get("app_create_observed") is True and actual.get("pid") is None and actual.get("popen_observed") is None, "App launch")

def verify_prefix():
    frozen, routes, journal = rows(), route_map(), base.journal_rows()
    require(len(journal) <= 24, "journal max")
    custody=git_custody() if journal else None
    reports = []
    if not journal:
        require(not os.path.lexists(EVIDENCE), "zero prefix requires absent evidence root")
    else:
        for row in frozen[:len(journal)]:
            report = V.verify_row(row["pass_id"],routes[row["route_id"]]); require(report["status"] == "PASS", "fail-stop prior row")
            if row["surface"] == "omp_tui": verify_omp_receipt(row,custody)
            else:
                d=EVIDENCE/row["pass_id"]/row["route_id"]; launch=verify_app_launch(row,custody); terminal=P.load_json(d/"terminal.json")
                app.verify_direct_evidence(d,row,(V7/"prompts/codex.prompt.txt").read_text(),spec(),P,V,launch,terminal)
            reports.append(report)
        mixed_journal(journal,reports)
        grouped=[{"pass_id":pid,"rows":[report for report in reports if rows()[report["ordinal"]-1]["pass_id"]==pid]} for pid in ("pass_01","pass_02")]
        grouped=[group for group in grouped if group["rows"]]
        V.verify_launch_journal(grouped); V.verify_evidence_tree(grouped); V.verify_global_uniqueness(grouped)
    for row in frozen[len(journal):]:
        require(not os.path.lexists(EVIDENCE/row["pass_id"]/row["route_id"]), "future evidence")
        for field in ("cwd","session_dir"): require(field not in row or not os.path.lexists(row[field]), "future runtime")
    return {"status":"PASS_TWO_CLEAN_PASSES" if len(journal)==24 else "PASS_EXACT_PREFIX_ZERO_CREDIT", "row_count":len(journal), "required_rows":24, "qualification_credit":1 if len(journal)==24 else 0, "subject_calls":0}

def require_launch_authority(row):
    authority=spec()["authority"]
    require(authority.get("full_matrix_subject_calls_authorized") is True, "matrix authority")
    if row["surface"] == "codex_app": require(authority.get("codex_app_task_creation_authorized") is True, "App authority")
    elif row["model"] != "opencode-go/ox-alpha-free": require(authority.get("non_ox_provider_calls_authorized") is True, "provider authority")
    grant=authority.get("matrix_launch_grant",{}); require(all(grant.get(key) is False for key in ("follow_up_or_send_authorized","retry_or_replacement_authorized","unfrozen_route_or_identity_authorized","other_task_creation_authorized")), "matrix authority cannot widen")
    matches=[frozen for frozen in rows() if all(row.get(key)==frozen.get(key) for key in (*IDENTITY,"surface","model","thinking"))]
    require(len(matches)==1 and grant.get("authorized_row_count")==24, "exact frozen row")

def row_claimed(row):
    d=EVIDENCE/row["pass_id"]/row["route_id"]
    return all(path.is_dir() and not path.is_symlink() for path in (EVIDENCE,d.parent,d))

def claim_after_failure(row,before):
    d=EVIDENCE/row["pass_id"]/row["route_id"]; paths=(EVIDENCE,d.parent,d)
    if row_claimed(row): return True
    if before is None or not any(os.path.lexists(path) and not prior for path,prior in zip(paths,before,strict=True)): return False
    for path in paths:
        if not os.path.lexists(path): path.mkdir()
        require(path.is_dir() and not path.is_symlink(),"unsafe claim")
    return row_claimed(row)

def exact_reservation(row):
    path=EVIDENCE/row["pass_id"]/row["route_id"]/"reservation.json"
    if not row_claimed(row) or not path.is_file() or path.is_symlink(): return False
    try: value=P.load_json(path)
    except Exception: return False
    return value.get("schema_id")=="pm.r10.storage_pipeline.reservation.v2" and all(value.get(k)==row[k] for k in IDENTITY)

def app_created(d,row):
    request=P.load_json(d/"create_request.json"); raw=(d/"create_receipt.raw.json").read_bytes()
    receipt=app.canonical_receipt(raw,P,"create_thread",request); require("result" in receipt,"create success")
    return app._create_result(receipt["result"],row)

def app_waits(d,create):
    result=[]; previous=None
    paths=sorted(d.glob("wait_[0-9][0-9][0-9].raw.json"))
    require(len(paths)<=spec()["runtime"]["codex_wait_max_receipts"],"wait count")
    for path in paths:
        request=app.wait_request(create,result,spec()["runtime"]["codex_wait_timeout_ms"])
        receipt=app.canonical_receipt(path.read_bytes(),P,"wait_threads",request); require("result" in receipt,"wait success")
        state=app.wait_state(receipt["result"],create)
        if previous is not None: require(state["revision"]>=previous["revision"],"wait revision")
        previous=state; result.append(receipt)
    return result

def app_budget(d):
    launch=P.load_json(d/"launch.json")
    elapsed=(V.parse_utc(base.utc_now())-V.parse_utc(launch.get("started_at_utc"))).total_seconds()
    require(0<=elapsed<=spec()["runtime"]["row_time_budget_seconds"],"Codex row time budget")

def capture_host_receipt(d,path,raw,tool,request):
    require(not path.exists(),f"one {tool} receipt path"); P.atomic_write(path,raw)
    receipt=app.canonical_receipt(raw,P,tool,request)
    app.append_host_event(d,tool,request,path,P); return receipt

def append_app_journal(row,d):
    journal=base.journal_rows(); require(len(journal)==row["ordinal"]-1,"App journal")
    launch=P.load_json(d/"launch.json")
    entry={"schema_id":"pm.r10.storage_pipeline.launch_journal.v2", **{k:row[k] for k in IDENTITY}, "started_at_utc":launch["started_at_utc"],
           "launch_sha256":P.sha256_file(d/"launch.json"), "omp_preflight_sha256":None, "app_create_observed":True, "pid":None}
    P.atomic_write(EVIDENCE/"launch_journal.jsonl",P.jsonl_bytes([*journal,entry]))

def reserve_app(d,row,custody):
    launch=app.reserve(d,row,(V7/"prompts/codex.prompt.txt").read_text(),P,base.utc_now)
    launch.update({"matrix_contract":file_record(CONTRACT),"owned_sources":custody["sources"],"git_custody":custody,
                   "protocol_adapter":"codex_app_host_receipt","parent_allowed_calls":["create_thread","wait_threads","read_thread"],
                   "row_time_budget_seconds":3600,"qualification_credit":0})
    P.atomic_write(d/"launch.json",P.pretty_json(launch)); return launch

def fail_app(row,exc,replace_pass=False):
    d=EVIDENCE/row["pass_id"]/row["route_id"]
    if not row_claimed(row): return
    if (d/"terminal.json").exists() and (not replace_pass or P.load_json(d/"terminal.json").get("status")!="PASS"): return
    events=P.load_jsonl(d/"host_events.jsonl") if (d/"host_events.jsonl").is_file() else []
    created=bool(events and events[0].get("tool")=="create_thread")
    failure={"schema_id":"pm.r10.storage_pipeline.runner_failure.v2", **{k:row[k] for k in IDENTITY}, "error":f"{type(exc).__name__}: {exc}",
             "app_create_observed":created, "captured_at_utc":base.utc_now(), "qualification_credit":0, "no_retry":True}
    P.atomic_write(d/"runner_failure.json",P.pretty_json(failure))
    app.write_terminal(d,row,route_map()[row["route_id"]],P,status="FAIL",failure="APP_RECEIPT_OR_EVIDENCE_FAILURE",external_submissions=int(created))

def verify_codex_candidate(d,row,create,prompt,final):
    launch=P.load_json(d/"launch.json"); provisional={"final_assistant_text":final}
    projection=app.raw_projection(d/"rollout.raw.jsonl",route_map()[row["route_id"]],prompt,create["threadId"],row["projectless_directory_name"],V,launch,provisional)
    V.terminal_result(final)
    return projection

def finish_app(d,row,create,prompt):
    raw_rows=P.load_jsonl(d/"rollout.raw.jsonl"); finals=[]
    for raw_row in raw_rows:
        payload=raw_row.get("payload")
        if raw_row.get("type")=="response_item" and isinstance(payload,dict) and payload.get("type")=="message" and payload.get("role")=="assistant" and payload.get("phase")=="final_answer": finals.append(V.text_blocks(payload.get("content")))
    require(len(finals)==1,"final"); projection=verify_codex_candidate(d,row,create,prompt,finals[0])
    terminal=app.write_terminal(d,row,route_map()[row["route_id"]],P,status="PASS",final=finals[0],identity=projection["session_id"])
    try:
        app.verify_direct_evidence(d,row,prompt,spec(),P,V,P.load_json(d/"launch.json"),terminal)
        report=V.verify_row(row["pass_id"],route_map()[row["route_id"]]); require(report["status"]=="PASS","Codex row")
    except Exception as exc:
        fail_app(row,exc,replace_pass=True); raise
    return {"status":"PASS_CODEX_ROW_ZERO_CREDIT","terminal":terminal,"qualification_credit":0}

def ingest(row,stage,raw):
    d=EVIDENCE/row["pass_id"]/row["route_id"]; require(exact_reservation(row),"reservation")
    require(not (d/"terminal.json").exists(),"terminal")
    app_budget(d)
    prompt=(V7/"prompts/codex.prompt.txt").read_text(); create_request=app.create_request(row,prompt)
    if stage=="create":
        path=d/"create_receipt.raw.json"; receipt=capture_host_receipt(d,path,raw,"create_thread",create_request)
        append_app_journal(row,d); require("result" in receipt,"create error")
        create=app._create_result(receipt["result"],row); return {"status":"PASS_CREATE_CAPTURED_CONSUMED",**create,"qualification_credit":0}
    create=app_created(d,row); prior=app_waits(d,create)
    if stage=="wait":
        require(len(prior)<spec()["runtime"]["codex_wait_max_receipts"] and (not prior or not app.validate_wait(prior[-1]["result"],create)),"wait closed")
        request=app.wait_request(create,prior,spec()["runtime"]["codex_wait_timeout_ms"]); path=d/f"wait_{len(prior)+1:03d}.raw.json"
        receipt=capture_host_receipt(d,path,raw,"wait_threads",request); require("result" in receipt,"wait error")
        complete=app.validate_wait(receipt["result"],create); return {"status":"PASS_WAIT_TERMINAL_READY" if complete else "PASS_WAIT_PENDING", "wait_count":len(prior)+1,"qualification_credit":0}
    require(prior and app.validate_wait(prior[-1]["result"],create),"wait before read")
    if stage=="read":
        request=app.read_request(create,spec()); receipt=capture_host_receipt(d,d/"read_receipt.raw.json",raw,"read_thread",request); require("result" in receipt,"read error")
        raw_request=app.raw_request(row,create); P.atomic_write(d/"raw_copy_request.json",P.pretty_json(raw_request))
        return {"status":"PASS_READ_CAPTURED_AWAIT_RAW_COPY_1","raw_copy_request":raw_request,"qualification_credit":0}
    require(stage in {"raw1","raw2"} and (d/"read_receipt.raw.json").is_file(),"raw/read")
    read_receipt=app.canonical_receipt((d/"read_receipt.raw.json").read_bytes(),P,"read_thread",app.read_request(create,spec())); require("result" in read_receipt,"read receipt success")
    request=app.raw_request(row,create); require(P.load_json(d/"raw_copy_request.json")==request,"raw-copy request join")
    ordinal=1 if stage=="raw1" else 2; path=d/f"raw_copy_{ordinal}.receipt.json"; require(not path.exists(),"one raw-copy receipt"); P.atomic_write(path,raw)
    receipt,content=app.raw_copy_receipt(raw,P,request,ordinal)
    if ordinal==1:
        P.atomic_write(d/"rollout.read1.jsonl",content); return {"status":"PASS_RAW_COPY_1_CAPTURED_AWAIT_COPY_2","qualification_credit":0}
    first_receipt,first=app.raw_copy_receipt((d/"raw_copy_1.receipt.json").read_bytes(),P,request,1)
    require(first==content and all(first_receipt["source"][key]==receipt["source"][key] for key in ("hostId","path","bytes","sha256")),"stable raw copies")
    require(V.parse_utc(first_receipt["source"]["observedAtUtc"])<V.parse_utc(receipt["source"]["observedAtUtc"]),"ordered raw reads")
    P.atomic_write(d/"rollout.read2.jsonl",content); P.atomic_write(d/"rollout.raw.jsonl",content); app_budget(d)
    return finish_app(d,row,create,prompt)

ERRORS=(ControllerError,PermanentTerminalResultFailure,app.LaneError,base.RunnerError,omp_session.OmpSessionError,V.VerifyError,P.PipelineError,OSError,ValueError,KeyError,TypeError,subprocess.SubprocessError,AssertionError)

def dispatch(argv=None):
    global DISPATCH_CUSTODY; parser=argparse.ArgumentParser(); parser.add_argument("command",choices=("lint","verify-prefix","run-omp","codex-reserve","codex-create-request","codex-wait-request","codex-read-request","codex-raw-request","codex-ingest-create","codex-ingest-wait","codex-ingest-read","codex-ingest-raw1","codex-ingest-raw2")); parser.add_argument("ordinal",nargs="?",type=int,choices=range(1,25)); parser.add_argument("--max-seconds",type=int,default=3600); args=parser.parse_args(argv)
    row=claim_before=None
    try:
        require((args.command in {"lint","verify-prefix"})==(args.ordinal is None),"ordinal command shape")
        static=validate_static(unused=args.command=="lint")
        if args.command=="lint": print(P.canonical_json({"status":"PASS_ZERO_SUBJECT_LINT",**static})); return 0
        with installed():
            if args.command=="verify-prefix": print(P.canonical_json(verify_prefix())); return 0
            row=rows()[args.ordinal-1]; require_launch_authority(row); custody=git_custody()
            if args.command=="run-omp":
                require(args.max_seconds==3600 and row["surface"]=="omp_tui","frozen OMP command/budget"); prefix=verify_prefix(); require(prefix["row_count"]==args.ordinal-1,"only exact next row"); d=EVIDENCE/row["pass_id"]/row["route_id"]; claim_before=tuple(os.path.lexists(path) for path in (EVIDENCE,d.parent,d)); DISPATCH_CUSTODY=custody
                try: terminal=base.run_row(row["pass_id"],row["route_id"],3600)
                finally: DISPATCH_CUSTODY=None
                print(P.canonical_json({"status":"PASS_OMP_ROW_ZERO_CREDIT","terminal":terminal,"qualification_credit":0})); return 0
            require(row["surface"]=="codex_app","Codex command requires Codex row"); d=EVIDENCE/row["pass_id"]/row["route_id"]
            if args.command=="codex-reserve":
                prefix=verify_prefix(); require(prefix["row_count"]==args.ordinal-1,"only exact next row"); claim_before=tuple(os.path.lexists(path) for path in (EVIDENCE,d.parent,d)); launch=reserve_app(d,row,custody); print(P.canonical_json({"status":"RESERVED_CONSUMED_AWAIT_CREATE","launch":launch,"qualification_credit":0})); return 0
            require(exact_reservation(row),"exact App reservation")
            require(not (d/"terminal.json").exists(),"row terminal; no retry"); verify_app_launch(row,custody); app_budget(d)
            if args.command=="codex-create-request": require(not (d/"create_receipt.raw.json").exists(),"create receipt absent"); request=P.load_json(d/"create_request.json")
            elif args.command=="codex-wait-request":
                create=app_created(d,row); prior=app_waits(d,create); require(len(prior)<spec()["runtime"]["codex_wait_max_receipts"] and (not prior or not app.validate_wait(prior[-1]["result"],create)),"wait closed"); request=app.wait_request(create,prior,spec()["runtime"]["codex_wait_timeout_ms"])
            elif args.command=="codex-read-request":
                create=app_created(d,row); prior=app_waits(d,create); require(prior and app.validate_wait(prior[-1]["result"],create) and not (d/"read_receipt.raw.json").exists(),"completed wait/read absent"); request=app.read_request(create,spec())
            elif args.command=="codex-raw-request":
                create=app_created(d,row); request=app.raw_request(row,create); require(P.load_json(d/"raw_copy_request.json")==request,"captured read/raw request")
            else:
                result=ingest(row,args.command.removeprefix("codex-ingest-"),sys.stdin.buffer.read()); print(P.canonical_json(result)); return 0
            print(P.canonical_json(request)); return 0
    except base.ReservationConflict as exc:
        print(P.canonical_json({"status":"FAIL_ALREADY_CONSUMED_NO_MUTATION","error":f"{type(exc).__name__}: {exc}","qualification_credit":0})); return 1
    except ERRORS as exc:
        claimed=row is not None and claim_after_failure(row,claim_before)
        if claimed:
            if row.get("surface") == "codex_app": fail_app(row,exc)
            else:
                with installed(): base.record_failure(row["pass_id"],row["route_id"],exc)
        print(P.canonical_json({"status":"FAIL_CONSUMED_STOP_SUFFIX" if claimed else "FAIL_PRELAUNCH_NO_MUTATION","error":f"{type(exc).__name__}: {exc}","qualification_credit":0})); return 1

if __name__=="__main__": raise SystemExit(dispatch())
