#!/usr/bin/env python3
"""Tests."""
import ast
import base64
import contextlib
import copy
import io
import json
import os
import shutil
import tempfile
from pathlib import Path

import controller as ctl
import codex_app_lane as lane

P = ctl.pipeline
V = ctl.verify_matrix
CHECKS=[]
ORIGINAL_TERMINAL_RESULT = V.terminal_result

def check(value,name):
    if not value: raise RuntimeError(name)
    CHECKS.append(name)

def rejects(fn,name,text=""):
    try: fn()
    except Exception as exc:
        check(not text or text in str(exc), name); return
    raise RuntimeError(f"accepted mutation: {name}")

def exact_final():
    return P.RESULT_PREFIX + (ctl.V7 / "oracle.json").read_text().strip()

def synthetic_raw(route,session,directory,*,mutation=""):
    prompt=(ctl.V7/"prompts/codex.prompt.txt").read_text(); objective="Audit the bounded Storage pipeline and return its exact typed result."
    created=1787680000
    active={"threadId":session,"objective":objective,"status":"active","tokensUsed":0,"timeUsedSeconds":0,"createdAt":created,"updatedAt":created}
    complete={**active,"status":"complete","tokensUsed":42,"timeUsedSeconds":2,"updatedAt":created+2}
    source=f"const r = await tools.create_goal({{objective:{json.dumps(objective)}}}); text(r);"
    rows=[
      {"type":"session_meta","payload":{"id":session,"session_id":session,"cwd":f"/tmp/{directory}/outputs"}},
      {"type":"turn_context","payload":{"turn_id":"turn","model":route["model"],"collaboration_mode":{"settings":{"reasoning_effort":route["thinking"]}}}},
      {"type":"response_item","payload":{"type":"message","role":"user","content":[{"type":"input_text","text":prompt}]}},
      {"type":"response_item","payload":{"type":"custom_tool_call","name":"exec","call_id":"create","input":source}},
      {"type":"response_item","payload":{"type":"custom_tool_call_output","call_id":"create","output":[{"type":"input_text","text":P.canonical_json({"goal":active})}]}},
      {"type":"response_item","payload":{"type":"custom_tool_call","name":"exec","call_id":"done","input":'const r = await tools.update_goal({status:"complete"}); text(r);'}},
      {"type":"response_item","payload":{"type":"custom_tool_call_output","call_id":"done","output":[{"type":"input_text","text":P.canonical_json({"goal":complete})}]}},
      {"type":"response_item","payload":{"type":"message","role":"assistant","phase":"final_answer","content":[{"type":"output_text","text":exact_final()}]}}
    ]
    if mutation=="duplicate_user": rows.insert(3,copy.deepcopy(rows[2]))
    if mutation=="wrong_user": rows[2]["payload"]["content"][0]["text"]="follow up"
    if mutation=="ambient_after": rows.insert(-1,{"type":"response_item","payload":{"type":"message","role":"user","content":[{"type":"input_text","text":"<recommended_plugins>\n</recommended_plugins><environment_context></environment_context>"}]}})
    if mutation=="ordinary_call": rows.insert(-1,{"type":"response_item","payload":{"type":"function_call","name":"shell"}})
    if mutation=="event_tool": rows.insert(-1,{"type":"event_msg","payload":{"item":{"type":"CommandExecution"}}})
    if mutation=="model": rows[1]["payload"]["model"]="gpt-5.6-sol"
    if mutation=="effort": rows[1]["payload"]["collaboration_mode"]["settings"]["reasoning_effort"]="low"
    return [{"ordinal":n,**row} for n,row in enumerate(rows)]

def verify_synthetic(route,mutation=""):
    row=next(item for item in ctl.rows() if item["route_id"]==route["id"])
    session="01a09999-1111-7222-8333-444455556666"
    with tempfile.TemporaryDirectory(prefix="r10-storage-app-raw-") as td:
        row_dir=Path(td); P.atomic_write(row_dir/"rollout.raw.jsonl",P.jsonl_bytes(synthetic_raw(route,session,row["projectless_directory_name"],mutation=mutation)))
        launch={"external_prompt_count":1}; terminal={"final_assistant_text":exact_final()}
        lane.raw_projection(row_dir/"rollout.raw.jsonl",route,(ctl.V7/"prompts/codex.prompt.txt").read_text(),session,row["projectless_directory_name"],V,launch,terminal)

def read_fixture(row,create):
    return {"schemaVersion":1,"thread":{"id":create["threadId"],"hostId":create["hostId"],"title":row["title"],"status":{"type":"idle"}},
            "page":{"order":"newest_first","hasMore":False,"nextCursor":None},
            "turns":[{"id":"turn","status":"completed","error":None,"items":[
                {"type":"userMessage","text":(ctl.V7/"prompts/codex.prompt.txt").read_text()}, {"type":"agentMessage","text":exact_final()}]}]}

def wait_fixture(create,revision=2,cursor="cursor-1"):
    return {"polls":[{"schemaVersion":1,"changed":True,"revision":revision,"cursor":cursor,"thread":{"id":create["threadId"],"hostId":create["hostId"],"status":{"type":"idle"}},"latestTurn":{"status":"completed","error":None}}],"timedOut":False,"wake":{"reason":"turnCompleted","threadId":create["threadId"],"hostId":create["hostId"]}}

def raw_copy_bytes(row,create,ordinal,content,observed):
    request=lane.raw_request(row,create); source={"hostId":create["hostId"],"path":f"C:\\Users\\host\\.codex\\sessions\\rollout-{create['threadId']}.jsonl","bytes":len(content),"sha256":P.sha256_bytes(content),"observedAtUtc":observed}
    value={"schema_id":"pm.r10.storage_pipeline.codex_raw_copy_receipt.v1","request":request,"copyOrdinal":ordinal,"source":source,"contentBase64":base64.b64encode(content).decode()}
    return (P.canonical_json(value)+"\n").encode()

def build_direct_app(row_dir):
    row=ctl.rows()[5]; route=ctl.route_map()[row["route_id"]]; prompt=(ctl.V7/"prompts/codex.prompt.txt").read_text(); commit="a"*40
    sources=[ctl.file_record(ctl.HERE/name) for name in ctl.SOURCES]; custody={"candidate_commit":commit,"head":commit,"origin_main":commit,"truenas_backup_main":commit,"sources":sources}; old_now=ctl.base.utc_now; times=iter(("2026-08-26T00:00:00.000Z","2026-08-26T00:00:00.100Z")); ctl.base.utc_now=lambda:next(times)
    try: launch=ctl.reserve_app(row_dir,row,custody)
    finally: ctl.base.utc_now=old_now
    create={"threadId":"01a09999-1111-7222-8333-444455556666","projectlessOutputDirectory":f"C:\\Codex\\{row['projectless_directory_name']}\\outputs","hostId":"windows-local"}
    request=lane.create_request(row,prompt); envelope={"schema_id":"pm.r10.storage_pipeline.codex_app_host_receipt.v1","tool":"create_thread","request":request,"result":create}; ctl.capture_host_receipt(row_dir,row_dir/"create_receipt.raw.json",(P.canonical_json(envelope)+"\n").encode(),"create_thread",request)
    wait=lane.wait_request(create,[],120000); envelope={"schema_id":"pm.r10.storage_pipeline.codex_app_host_receipt.v1","tool":"wait_threads","request":wait,"result":wait_fixture(create)}; ctl.capture_host_receipt(row_dir,row_dir/"wait_001.raw.json",(P.canonical_json(envelope)+"\n").encode(),"wait_threads",wait)
    read=lane.read_request(create,ctl.spec()); envelope={"schema_id":"pm.r10.storage_pipeline.codex_app_host_receipt.v1","tool":"read_thread","request":read,"result":read_fixture(row,create)}; ctl.capture_host_receipt(row_dir,row_dir/"read_receipt.raw.json",(P.canonical_json(envelope)+"\n").encode(),"read_thread",read)
    raw_request=lane.raw_request(row,create); P.atomic_write(row_dir/"raw_copy_request.json",P.pretty_json(raw_request)); content=P.jsonl_bytes(synthetic_raw(route,create["threadId"],row["projectless_directory_name"]))
    for ordinal,observed in ((1,"2026-08-26T00:00:01.000Z"),(2,"2026-08-26T00:00:02.000Z")):
        receipt=raw_copy_bytes(row,create,ordinal,content,observed); P.atomic_write(row_dir/f"raw_copy_{ordinal}.receipt.json",receipt); P.atomic_write(row_dir/f"rollout.read{ordinal}.jsonl",content)
    P.atomic_write(row_dir/"rollout.raw.jsonl",content); terminal=lane.write_terminal(row_dir,row,route,P,status="PASS",final=exact_final(),identity=create["threadId"]); return row,launch,terminal

def diagnostic_sol_replay():
    record=ctl.spec()["diagnostic_replays"][2]; matches=list((Path.home()/".codex"/"sessions").rglob(f"*{record['thread_id']}*.jsonl")); check(len(matches)==1,"Sol raw located")
    path=matches[0]; check((path.stat().st_size,P.sha256_file(path))==(record["bytes"],record["sha256"]),"Sol raw frozen"); rows=P.load_jsonl(path)
    contexts=[x["payload"] for x in rows if x.get("type")=="turn_context" and isinstance(x.get("payload"),dict)]; items=[(n,x["payload"]) for n,x in enumerate(rows) if x.get("type")=="response_item" and isinstance(x.get("payload"),dict)]
    sessions=[x["payload"].get("id") for x in rows if x.get("type")=="session_meta" and isinstance(x.get("payload"),dict)]; check(sessions==[record["thread_id"]] and contexts and all(x.get("model")==record["model"] for x in contexts),"Sol identity/model")
    check(all(x.get("collaboration_mode",{}).get("settings",{}).get("reasoning_effort")==record["thinking"] for x in contexts),"Sol effort")
    calls={x["call_id"]:(n,x) for n,x in items if x.get("type")=="custom_tool_call"}; outputs={x["call_id"]:(n,x.get("output")) for n,x in items if x.get("type")=="custom_tool_call_output"}; finals=[(n,V.text_blocks(x.get("content"))) for n,x in items if x.get("type")=="message" and x.get("role")=="assistant" and x.get("phase")=="final_answer"]
    parsed=[(cid,*V.parse_goal_wrapper(call[1]["input"]),call[0],outputs[cid][0],V.parse_goal(outputs[cid][1])) for cid,call in calls.items()]
    create=[x for x in parsed if x[1]=="create_goal"]; done=[x for x in parsed if x[1]=="update_goal"]
    check(len(calls)==len(outputs)==2 and len(create)==len(done)==len(finals)==1,"Sol Goal count")
    check(create[0][3]<create[0][4]<done[0][3]<done[0][4]<finals[0][0],"Sol order")
    check(create[0][5]["status"]=="active" and done[0][5]["status"]=="complete","Sol lifecycle")

def real_v7_and_crlf():
    route=ctl.route_map()["omp_ox_alpha_free_max"]
    report=V.verify_row("pass_01",route); check(report["status"]=="PASS","V7 replay")
    source=ctl.V7/"evidence/pass_01/omp_ox_alpha_free_max"
    with tempfile.TemporaryDirectory(prefix="r10-storage-crlf-") as td:
        evidence=Path(td)/"evidence"; target=evidence/"pass_01/omp_ox_alpha_free_max"; target.parent.mkdir(parents=True); shutil.copytree(source,target)
        P.atomic_write(target/"stdin_enter.raw",b"\n"); terminal=P.load_json(target/"terminal.json")
        for item in terminal["evidence"]:
            if item["path"]=="stdin_enter.raw": item.update(bytes=1,sha256=P.sha256_file(target/"stdin_enter.raw"))
        P.atomic_write(target/"terminal.json",P.pretty_json(terminal)); prior=V.EVIDENCE; V.EVIDENCE=evidence
        try: rejects(lambda:V.verify_row("pass_01",route),"CRLF reject","standalone OMP Enter")
        finally: V.EVIDENCE=prior

def app_contract_tests():
    row=ctl.rows()[5]; prompt=(ctl.V7/"prompts/codex.prompt.txt").read_text(); request=lane.create_request(row,prompt)
    check(request["prompt"].startswith("Create a goal that") and len(request["prompt"].encode())==3050,"Codex prompt")
    create={"threadId":"01a09999-1111-7222-8333-444455556666","projectlessOutputDirectory":f"C:\\Codex\\{row['projectless_directory_name']}\\outputs","hostId":"local"}
    envelope={"schema_id":"pm.r10.storage_pipeline.codex_app_host_receipt.v1","tool":"create_thread","request":request,"result":create}
    raw=(P.canonical_json(envelope)+"\n").encode(); parsed=lane.canonical_receipt(raw,P,"create_thread",request); check(lane._create_result(parsed["result"],row)==create,"create envelope")
    rejects(lambda:lane.canonical_receipt(raw[:-1],P,"create_thread",request),"noncanonical","newline")
    rejects(lambda:lane.canonical_receipt(raw,P,"create_thread",{**request,"title":"wrong"}),"wrong request")
    bad_target=copy.deepcopy(request); bad_target["target"]["directoryName"]="wrong"; rejects(lambda:lane.canonical_receipt(raw,P,"create_thread",bad_target),"wrong target")
    bad_create={**create,"projectlessOutputDirectory":"C:\\Codex\\wrong\\outputs"}; rejects(lambda:lane._create_result(bad_create,row),"wrong directory","projectless output join")
    wait=lane.wait_request(create,[],120000); wait_result=wait_fixture(create)
    check(lane.validate_wait(wait_result,create) and wait=={"targets":[{"threadId":create["threadId"],"hostId":"local"}],"timeoutMs":120000},"wait envelope")
    bad_wait=copy.deepcopy(wait_result); del bad_wait["polls"][0]["revision"]; rejects(lambda:lane.validate_wait(bad_wait,create),"wait revision")
    read=read_fixture(row,create); lane.validate_read(read,create,row,prompt,exact_final(),["turn"]); check(True,"read/raw")
    rejects(lambda:lane.validate_read(read,create,row,prompt,exact_final(),["other"]),"turn mismatch")
    bad=copy.deepcopy(read); bad["turns"][0]["items"].append({"type":"userMessage","text":"follow up"}); rejects(lambda:lane.validate_read(bad,create,row,prompt,exact_final()),"follow-up")
    with tempfile.TemporaryDirectory(prefix="r10-storage-malformed-receipt-") as td:
        root=Path(td); path=root/"create.raw.json"
        rejects(lambda:ctl.capture_host_receipt(root,path,b"{}\n","create_thread",request),"malformed receipt")
        check(path.read_bytes()==b"{}\n" and not (root/"host_events.jsonl").exists(),"raw preserved")
        P.atomic_write(root/"launch.json",P.pretty_json({"started_at_utc":"2026-08-26T00:00:00.000Z"})); prior_now=ctl.base.utc_now; ctl.base.utc_now=lambda:"2026-08-26T01:00:00.001Z"
        try: rejects(lambda:ctl.app_budget(root),"Codex 3600-second budget enforced","time budget")
        finally: ctl.base.utc_now=prior_now
    with tempfile.TemporaryDirectory(prefix="r10-storage-app-reserve-") as td:
        root=Path(td)/"row"; sources=[ctl.file_record(ctl.HERE/name) for name in ctl.SOURCES]; commit="a"*40; custody={"candidate_commit":commit,"head":commit,"origin_main":commit,"truenas_backup_main":commit,"sources":sources}; launch=ctl.reserve_app(root,row,custody)
        check(launch["owned_sources"]==sources and launch["git_custody"]==custody and launch["parent_allowed_calls"]==["create_thread","wait_threads","read_thread"],"App custody")
    with tempfile.TemporaryDirectory(prefix="r10-storage-host-events-") as td:
        root=Path(td); events=[{"ordinal":1,"tool":"create_thread"},{"ordinal":2,"tool":"send_message_to_thread"},{"ordinal":3,"tool":"read_thread"}]
        P.atomic_write(root/"host_events.jsonl",P.jsonl_bytes(events)); rejects(lambda:lane.verify_host_events(root,P),"parent follow-up rejected","allowlist")
        events=[{"ordinal":1,"tool":"create_thread"},{"ordinal":2,"tool":"create_thread"},{"ordinal":3,"tool":"read_thread"}]
        P.atomic_write(root/"host_events.jsonl",P.jsonl_bytes(events)); rejects(lambda:lane.verify_host_events(root,P),"duplicate App create rejected","denominator")
    with tempfile.TemporaryDirectory(prefix="r10-storage-direct-") as td:
        root=Path(td)/"row"; row,launch,terminal=build_direct_app(root); projection=lane.verify_direct_evidence(root,row,prompt,ctl.spec(),P,V,launch,terminal)
        check(projection["session_id"]=="01a09999-1111-7222-8333-444455556666","remote raw PASS")
        wait_path=root/"wait_001.raw.json"; held=Path(td)/"held"; wait_path.rename(held); rejects(lambda:lane.verify_direct_evidence(root,row,prompt,ctl.spec(),P,V,launch,terminal),"missing receipt"); held.rename(wait_path)
        original=wait_path.read_bytes(); forged=P.strict_loads(original.decode()); forged["request"]["timeoutMs"]=1; P.atomic_write(wait_path,(P.canonical_json(forged)+"\n").encode()); rejects(lambda:lane.verify_direct_evidence(root,row,prompt,ctl.spec(),P,V,launch,terminal),"forged receipt"); P.atomic_write(wait_path,original)
        copy2=root/"raw_copy_2.receipt.json"; original=copy2.read_bytes(); forged=P.strict_loads(original.decode()); forged["source"]["hostId"]="wrong"; P.atomic_write(copy2,(P.canonical_json(forged)+"\n").encode()); rejects(lambda:lane.verify_direct_evidence(root,row,prompt,ctl.spec(),P,V,launch,terminal),"wrong raw host"); P.atomic_write(copy2,original)
        extra=root/"fabricated.txt"; extra.write_text("x"); rejects(lambda:lane.verify_direct_evidence(root,row,prompt,ctl.spec(),P,V,launch,terminal),"extra file","file roster"); extra.unlink()

def journal_and_spy_tests():
    reports=[]; journal=[]
    for row in ctl.rows():
        report={**{k:row[k] for k in ctl.IDENTITY},"surface":row["surface"],"launch_sha256":f"launch-{row['ordinal']}","omp_preflight_sha256":f"pre-{row['ordinal']}" if row["surface"]=="omp_tui" else None,"pid":1000+row["ordinal"]}
        entry={"schema_id":"pm.r10.storage_pipeline.launch_journal.v2",**{k:row[k] for k in ctl.IDENTITY},"launch_sha256":report["launch_sha256"],"omp_preflight_sha256":report["omp_preflight_sha256"]}
        entry.update({"popen_observed":True,"pid":report["pid"]} if row["surface"]=="omp_tui" else {"app_create_observed":True,"pid":None})
        reports.append(report); journal.append(entry)
    for count in range(25): ctl.mixed_journal(journal[:count],reports[:count])
    check(True,"prefixes 0..24")
    for key,value in (("nonce","wrong"),("launch_sha256","wrong"),("popen_observed",False),("pid",999)):
        bad=copy.deepcopy(journal[:1]); bad[0][key]=value; rejects(lambda b=bad:ctl.mixed_journal(b,reports[:1]),f"journal {key}")
    bad=copy.deepcopy(journal[:6]); bad[5]["app_create_observed"]=False; rejects(lambda:ctl.mixed_journal(bad,reports[:6]),"App create")
    bad=copy.deepcopy(journal[:6]); bad[5]["popen_observed"]=True; rejects(lambda:ctl.mixed_journal(bad,reports[:6]),"App/Popen")
    bad=copy.deepcopy(journal[:6]); bad[5]["pid"]=999; rejects(lambda:ctl.mixed_journal(bad,reports[:6]),"App PID")
    unique=[]
    for n in range(2): unique.append({"attempt_id":f"a{n}","nonce":f"n{n}","cwd_identity":f"cwd{n}","started_at_utc":f"2026-08-26T00:00:0{n}Z","status":"PASS","observed_identity":f"thread{n}","raw_primary_sha256":f"raw{n}"})
    for field in ("attempt_id","cwd_identity","observed_identity","raw_primary_sha256"):
        duplicate=copy.deepcopy(unique); duplicate[1][field]=duplicate[0][field]
        rejects(lambda d=duplicate:V.verify_global_uniqueness([{"rows":d}]),f"reused {field} rejected","uniqueness")
    original_validate,original_git,original_popen=ctl.validate_static,ctl.git_custody,ctl.base.subprocess.Popen
    calls=[]; custody=[]
    ctl.validate_static=lambda **_kw:{"status":"TEST"}; ctl.git_custody=lambda:(custody.append(1),(_ for _ in ()).throw(ctl.ControllerError("unpushed")))[1]; ctl.base.subprocess.Popen=lambda *_a,**_k:calls.append(1)
    try:
        for row in ctl.rows():
            command="run-omp" if row["surface"]=="omp_tui" else "codex-reserve"; output=io.StringIO()
            with contextlib.redirect_stdout(output): rc=ctl.dispatch([command,str(row["ordinal"])])
            check(rc==1 and "FAIL_PRELAUNCH_NO_MUTATION" in output.getvalue(),f"ordinal {row['ordinal']} authority fail-stop")
        check(len(custody)==24 and not calls and not os.path.lexists(ctl.EVIDENCE),"absent stays prelaunch")
    finally: ctl.validate_static,ctl.git_custody,ctl.base.subprocess.Popen=original_validate,original_git,original_popen

def binding_and_ast_tests():
    originals=[getattr(module,name) for module,name,_ in ctl.BINDINGS]
    try:
        with ctl.installed():
            check(all(getattr(module,name) is value for module,name,value in ctl.BINDINGS),"bindings installed")
            raise RuntimeError("restore")
    except RuntimeError: pass
    check(all(getattr(module,name) is value for (module,name,_),value in zip(ctl.BINDINGS,originals,strict=True)),"restored")
    check(V.terminal_result is ORIGINAL_TERMINAL_RESULT,"scorer restored")
    forbidden={"run_row","verify_row","verify_codex_raw","verify_omp_raw","verify_evidence_tree","derive"}
    for name in ("controller.py","codex_app_lane.py"):
        tree=ast.parse((ctl.HERE/name).read_text()); defs={node.name for node in ast.walk(tree) if isinstance(node,(ast.FunctionDef,ast.AsyncFunctionDef))}
        check(not defs & forbidden,f"no copy {name}")
    lane_tree=ast.parse((ctl.HERE/"codex_app_lane.py").read_text()); calls=[node for node in ast.walk(lane_tree) if isinstance(node,ast.Call)]
    check(not any(isinstance(node.func,ast.Attribute) and node.func.attr in {"Popen","run","create_thread","wait_threads","read_thread"} for node in calls),"no launcher")

def extended_custody_tests():
    original=ctl.spec; contract=copy.deepcopy(original()); commit="a"*40; contract["authority"]["source_candidate_commit"]=commit
    sources=[ctl.file_record(ctl.HERE/name) for name in ctl.SOURCES]; custody={"candidate_commit":commit,"head":commit,"origin_main":commit,"truenas_backup_main":commit,"sources":sources}
    record={"matrix_contract":ctl.file_record(ctl.CONTRACT),"owned_sources":sources,"git_custody":custody,"protocol_adapter":"native_default","row_time_budget_seconds":3600}
    with tempfile.TemporaryDirectory(prefix="r10-storage-custody-") as td:
        path=Path(td)/"receipt.json"; ctl.spec=lambda:contract
        try:
            P.atomic_write(path,P.pretty_json(record)); ctl.verify_extended(path,"native_default",custody); check(True,"full custody")
            bad=copy.deepcopy(record); bad["owned_sources"]=bad["owned_sources"][:-1]; P.atomic_write(path,P.pretty_json(bad)); rejects(lambda:ctl.verify_extended(path,"native_default",custody),"missing source","source hashes")
            bad=copy.deepcopy(record); bad["git_custody"]["head"]="b"*40; P.atomic_write(path,P.pretty_json(bad)); rejects(lambda:ctl.verify_extended(path,"native_default",custody),"head drift","pushed custody")
        finally: ctl.spec=original

def partial_claim_tests():
    old=(ctl.EVIDENCE,ctl.BINDINGS,ctl.validate_static,ctl.git_custody,ctl.verify_prefix,ctl.base.run_row,ctl.reserve_app); base_evidence=ctl.base.EVIDENCE; v7=ctl.V7/"evidence"
    snap=lambda:[(p.relative_to(v7).as_posix(),p.stat().st_size,P.sha256_file(p)) for p in v7.rglob("*") if p.is_file()]; before=snap()
    for index,command in ((0,"run-omp"),(5,"codex-create-request")):
        for parent_only in (False,True):
            with tempfile.TemporaryDirectory(prefix="r10-storage-partial-") as td:
                evidence=Path(td)/"evidence"; row=ctl.rows()[index]; row_dir=evidence/row["pass_id"]/row["route_id"]
                ctl.EVIDENCE=evidence; ctl.BINDINGS=tuple((m,n,evidence if n=="EVIDENCE" else value) for m,n,value in old[1]); ctl.validate_static=lambda **_kw:{"status":"TEST"}; ctl.git_custody=lambda:{"status":"TEST"}; ctl.verify_prefix=lambda:{"row_count":index}
                def partial(path):
                    path.parent.mkdir(parents=True)
                    if not parent_only: path.mkdir(); P.atomic_write(path/"reservation.json",b"{")
                    raise OSError("partial reserve")
                ctl.base.run_row=lambda pass_id,route_id,_seconds:partial(ctl.base.EVIDENCE/pass_id/route_id); ctl.reserve_app=lambda path,*_args:partial(path); output=io.StringIO()
                try:
                    with contextlib.redirect_stdout(output): rc=ctl.dispatch(["codex-reserve" if index else command,str(index+1)])
                    terminal=P.load_json(row_dir/"terminal.json"); files={p.name for p in row_dir.iterdir()}; required={"runner_failure.json","terminal.json"}|(set() if parent_only else {"reservation.json"})
                    check(rc==1 and "FAIL_CONSUMED_STOP_SUFFIX" in output.getvalue() and terminal["status"]=="FAIL" and required<=files,f"partial {'App' if index else 'OMP'} {'parent' if parent_only else 'row'} FAIL")
                    with ctl.installed(): rejects(old[4],"partial blocks suffix","absent evidence root")
                    suffix=ctl.rows()[index+1]; check(not os.path.lexists(evidence/suffix["pass_id"]/suffix["route_id"]),"suffix absent")
                finally: ctl.EVIDENCE,ctl.BINDINGS,ctl.validate_static,ctl.git_custody,ctl.verify_prefix,ctl.base.run_row,ctl.reserve_app=old; ctl.base.EVIDENCE=base_evidence
    check(before==snap() and ctl.base.EVIDENCE==base_evidence,"V7 unchanged")

def authority_tests():
    for row in ctl.rows(): ctl.require_launch_authority(row)
    check(True,"24 authorized")
    fake=copy.deepcopy(ctl.rows()[0]); fake["model"]="opencode-go/other"
    rejects(lambda:ctl.require_launch_authority(fake),"unfrozen route","exact frozen row")
    original=ctl.spec
    for field in ("follow_up_or_send_authorized","retry_or_replacement_authorized","unfrozen_route_or_identity_authorized","other_task_creation_authorized"):
        mutated=copy.deepcopy(original()); mutated["authority"]["matrix_launch_grant"][field]=True; ctl.spec=lambda value=mutated:value
        try: rejects(lambda:ctl.require_launch_authority(mutated["rows"][0]),f"{field} widening rejected","cannot widen")
        finally: ctl.spec=original

def main():
    check(ctl.validate_static(unused=True)["status"]=="PASS_LOCAL_STORAGE_NATIVE_MATRIX_PRELAUNCH","static")
    real_v7_and_crlf(); diagnostic_sol_replay(); app_contract_tests()
    good=exact_final(); ctl.exact_result(good); check(True,"scorer accepts oracle")
    for name,text in (("wrong","PM_RESULT {}"),("missing","no result"),("duplicate",good+"\n"+good),("overlimit","x"*100000+"\n"+good)):
        rejects(lambda value=text:ctl.exact_result(value),f"fail-fast scorer rejects {name} result")
    row=ctl.rows()[5]; create={"threadId":"01a09999-1111-7222-8333-444455556666","hostId":"local","projectlessOutputDirectory":"C:/x/outputs"}
    with tempfile.TemporaryDirectory(prefix="r10-storage-order-") as td:
        row_dir=Path(td); P.atomic_write(row_dir/"launch.json",P.pretty_json({"external_prompt_count":1})); old_raw,old_score=lane.raw_projection,V.terminal_result; scored=[]
        lane.raw_projection=lambda *_a,**_k:(_ for _ in ()).throw(lane.LaneError("structural first")); V.terminal_result=lambda text:scored.append(text)
        try: rejects(lambda:ctl.verify_codex_candidate(row_dir,row,create,(ctl.V7/"prompts/codex.prompt.txt").read_text(),good),"structure first","structural first"); check(not scored,"no score")
        finally: lane.raw_projection,V.terminal_result=old_raw,old_score
    for route in [r for r in ctl.route_map().values() if r["surface"]=="codex_app"]: verify_synthetic(route); check(True,f"synthetic raw {route['id']}")
    for mutation in ("duplicate_user","wrong_user","ambient_after","ordinary_call","event_tool","model","effort"):
        rejects(lambda m=mutation:verify_synthetic(ctl.route_map()["codex_luna_max"],m),f"Codex raw {mutation} rejected")
    authority_tests(); journal_and_spy_tests(); binding_and_ast_tests(); extended_custody_tests(); partial_claim_tests()
    check(not list(ctl.HERE.rglob("*.pyc")) and not list(ctl.HERE.rglob("__pycache__")),"no cache residue")
    print(P.canonical_json({"status":"PASS_ZERO_SUBJECT_SELFTEST","checks":len(CHECKS),"optimized":not __debug__,"subject_calls":0,"qualification_credit":0})); return 0

if __name__=="__main__": raise SystemExit(main())
