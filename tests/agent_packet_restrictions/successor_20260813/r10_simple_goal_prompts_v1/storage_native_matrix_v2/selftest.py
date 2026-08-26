#!/usr/bin/env python3
import ast
import base64
import contextlib as X
import copy as K
import io
import os
import shutil
import tempfile as T
from pathlib import Path
import controller as C
import codex_app_lane as L
P = C.P
V = C.V
CHECKS=[]
SESSION="01a09999-1111-7222-8333-444455556666"
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
    return P.RESULT_PREFIX + (C.V7 / "oracle.json").read_text().strip()
def synthetic_raw(route,session,directory,*,mutation=""):
    prompt=(C.V7/"prompts/codex.prompt.txt").read_text(); objective="Audit the bounded Storage pipeline and return its exact typed result."
    created=1787680000
    active={"threadId":session,"objective":objective,"status":"active","tokensUsed":0,"timeUsedSeconds":0,"createdAt":created,"updatedAt":created}
    complete={**active,"status":"complete","tokensUsed":42,"timeUsedSeconds":2,"updatedAt":created+2}
    source=f"const r=await tools.create_goal({{objective:{P.canonical_json(objective)}}});text(r);"; item=lambda payload:{"type":"response_item","payload":payload}
    rows=[
      {"type":"session_meta","payload":{"id":session,"session_id":session,"cwd":f"/tmp/{directory}/outputs"}},
      {"type":"turn_context","payload":{"turn_id":"turn","model":route["model"],"collaboration_mode":{"settings":{"reasoning_effort":route["thinking"]}}}},
      item({"type":"message","role":"user","content":[{"type":"input_text","text":prompt}]}),
      item({"type":"custom_tool_call","name":"exec","call_id":"create","input":source}),
      item({"type":"custom_tool_call_output","call_id":"create","output":[{"type":"input_text","text":P.canonical_json({"goal":active})}]}),
      item({"type":"custom_tool_call","name":"exec","call_id":"done","input":'const r=await tools.update_goal({status:"complete"});text(r);'}),
      item({"type":"custom_tool_call_output","call_id":"done","output":[{"type":"input_text","text":P.canonical_json({"goal":complete})}]}),
      item({"type":"message","role":"assistant","phase":"final_answer","content":[{"type":"output_text","text":exact_final()}]})
    ]
    if mutation=="duplicate_user": rows.insert(3,K.deepcopy(rows[2]))
    if mutation=="wrong_user": rows[2]["payload"]["content"][0]["text"]="follow up"
    if mutation=="ambient_after": rows.insert(-1,item({"type":"message","role":"user","content":[{"type":"input_text","text":"<recommended_plugins>\n</recommended_plugins><environment_context></environment_context>"}]}))
    if mutation=="ordinary_call": rows.insert(-1,item({"type":"function_call","name":"shell"}))
    if mutation=="event_tool": rows.insert(-1,{"type":"event_msg","payload":{"item":{"type":"CommandExecution"}}})
    if mutation=="model": rows[1]["payload"]["model"]="gpt-5.6-sol"
    if mutation=="effort": rows[1]["payload"]["collaboration_mode"]["settings"]["reasoning_effort"]="low"
    return [{"ordinal":n,**row} for n,row in enumerate(rows)]
def verify_synthetic(route,mutation=""):
    row=next(item for item in C.rows() if item["route_id"]==route["id"])
    session=SESSION
    with T.TemporaryDirectory(prefix="r10-app-raw-") as td:
        d=Path(td); P.atomic_write(d/"rollout.raw.jsonl",P.jsonl_bytes(synthetic_raw(route,session,row["projectless_directory_name"],mutation=mutation)))
        launch={"external_prompt_count":1}; terminal={"final_assistant_text":exact_final()}
        L.raw_projection(d/"rollout.raw.jsonl",route,(C.V7/"prompts/codex.prompt.txt").read_text(),session,row["projectless_directory_name"],V,launch,terminal)
def read_fixture(row,create):
    return {"schemaVersion":1,"thread":{"id":create["threadId"],"hostId":create["hostId"],"title":row["title"],"status":{"type":"idle"}},
            "page":{"order":"newest_first","hasMore":False,"nextCursor":None},
            "turns":[{"id":"turn","status":"completed","error":None,"items":[
                {"type":"userMessage","text":(C.V7/"prompts/codex.prompt.txt").read_text()}, {"type":"agentMessage","text":exact_final()}]}]}
def wait_fixture(create,revision=2,cursor="cursor-1"):
    return {"polls":[{"schemaVersion":1,"changed":True,"revision":revision,"cursor":cursor,"thread":{"id":create["threadId"],"hostId":create["hostId"],"status":{"type":"idle"}},"latestTurn":{"status":"completed","error":None}}],"timedOut":False,"wake":{"reason":"turnCompleted","threadId":create["threadId"],"hostId":create["hostId"]}}
def raw_copy_bytes(row,create,ordinal,content,observed):
    request=L.raw_request(row,create); source={"hostId":create["hostId"],"path":f"C:\\Users\\host\\.codex\\sessions\\rollout-{create['threadId']}.jsonl","bytes":len(content),"sha256":P.sha256_bytes(content),"observedAtUtc":observed}
    value={"schema_id":"pm.r10.storage_pipeline.codex_raw_copy_receipt.v1","request":request,"copyOrdinal":ordinal,"source":source,"contentBase64":base64.b64encode(content).decode()}
    return (P.canonical_json(value)+"\n").encode()
def fake_custody(sources):
    commit="a"*40; return {"candidate_commit":commit,"head":commit,"origin_main":commit,"truenas_backup_main":commit,"sources":sources}
def build_direct_app(d):
    row=C.rows()[5]; route=C.route_map()[row["route_id"]]; prompt=(C.V7/"prompts/codex.prompt.txt").read_text(); custody=fake_custody([C.file_record(C.HERE/name) for name in C.SOURCES]); old_now=C.base.utc_now; times=iter(("2026-08-26T00:00:00.000Z","2026-08-26T00:00:00.100Z")); C.base.utc_now=lambda:next(times)
    try: launch=C.reserve_app(d,row,custody)
    finally: C.base.utc_now=old_now
    create={"threadId":SESSION,"projectlessOutputDirectory":f"C:\\Codex\\{row['projectless_directory_name']}\\outputs","hostId":"windows-local"}
    def capture(tool,request,result,name):
        envelope={"schema_id":"pm.r10.storage_pipeline.codex_app_host_receipt.v1","tool":tool,"request":request,"result":result}; C.capture_host_receipt(d,d/name,(P.canonical_json(envelope)+"\n").encode(),tool,request)
    request=L.create_request(row,prompt); capture("create_thread",request,create,"create_receipt.raw.json")
    wait=L.wait_request(create,[],120000); capture("wait_threads",wait,wait_fixture(create),"wait_001.raw.json")
    read=L.read_request(create,C.spec()); capture("read_thread",read,read_fixture(row,create),"read_receipt.raw.json")
    raw_request=L.raw_request(row,create); P.atomic_write(d/"raw_copy_request.json",P.pretty_json(raw_request)); content=P.jsonl_bytes(synthetic_raw(route,create["threadId"],row["projectless_directory_name"]))
    for ordinal,observed in ((1,"2026-08-26T00:00:01.000Z"),(2,"2026-08-26T00:00:02.000Z")):
        receipt=raw_copy_bytes(row,create,ordinal,content,observed); P.atomic_write(d/f"raw_copy_{ordinal}.receipt.json",receipt); P.atomic_write(d/f"rollout.read{ordinal}.jsonl",content)
    P.atomic_write(d/"rollout.raw.jsonl",content); terminal=L.write_terminal(d,row,route,P,status="PASS",final=exact_final(),identity=create["threadId"]); return row,launch,terminal
def diagnostic_sol_replay():
    record=C.spec()["diagnostic_replays"][2]; matches=list((Path.home()/".codex"/"sessions").rglob(f"*{record['thread_id']}*.jsonl")); check(len(matches)==1,"Sol raw located")
    path=matches[0]; check((path.stat().st_size,P.sha256_file(path))==(record["bytes"],record["sha256"]),"Sol raw frozen"); rows=P.load_jsonl(path)
    contexts=[x["payload"] for x in rows if x.get("type")=="turn_context" and isinstance(x.get("payload"),dict)]; items=[(n,x["payload"]) for n,x in enumerate(rows) if x.get("type")=="response_item" and isinstance(x.get("payload"),dict)]
    sessions=[x["payload"].get("id") for x in rows if x.get("type")=="session_meta" and isinstance(x.get("payload"),dict)]; check(sessions==[record["thread_id"]] and contexts and all(x.get("model")==record["model"] for x in contexts),"Sol identity")
    check(all(x.get("collaboration_mode",{}).get("settings",{}).get("reasoning_effort")==record["thinking"] for x in contexts),"Sol effort")
    calls={x["call_id"]:(n,x) for n,x in items if x.get("type")=="custom_tool_call"}; outputs={x["call_id"]:(n,x.get("output")) for n,x in items if x.get("type")=="custom_tool_call_output"}; finals=[(n,V.text_blocks(x.get("content"))) for n,x in items if x.get("type")=="message" and x.get("role")=="assistant" and x.get("phase")=="final_answer"]
    parsed=[(cid,*V.parse_goal_wrapper(call[1]["input"]),call[0],outputs[cid][0],V.parse_goal(outputs[cid][1])) for cid,call in calls.items()]
    create=[x for x in parsed if x[1]=="create_goal"]; done=[x for x in parsed if x[1]=="update_goal"]
    check(len(calls)==len(outputs)==2 and len(create)==len(done)==len(finals)==1,"Sol count")
    check(create[0][3]<create[0][4]<done[0][3]<done[0][4]<finals[0][0],"Sol order")
    check(create[0][5]["status"]=="active" and done[0][5]["status"]=="complete","Sol states")
def real_v7_and_crlf():
    route=C.route_map()["omp_ox_alpha_free_max"]
    report=V.verify_row("pass_01",route); check(report["status"]=="PASS","V7 replay")
    source=C.V7/"evidence/pass_01/omp_ox_alpha_free_max"
    with T.TemporaryDirectory(prefix="r10-crlf-") as td:
        evidence=Path(td)/"evidence"; target=evidence/"pass_01/omp_ox_alpha_free_max"; target.parent.mkdir(parents=True); shutil.copytree(source,target)
        P.atomic_write(target/"stdin_enter.raw",b"\n"); terminal=P.load_json(target/"terminal.json")
        for item in terminal["evidence"]:
            if item["path"]=="stdin_enter.raw": item.update(bytes=1,sha256=P.sha256_file(target/"stdin_enter.raw"))
        P.atomic_write(target/"terminal.json",P.pretty_json(terminal)); prior=V.EVIDENCE; V.EVIDENCE=evidence
        try: rejects(lambda:V.verify_row("pass_01",route),"CRLF reject","standalone OMP Enter")
        finally: V.EVIDENCE=prior
def app_contract_tests():
    row=C.rows()[5]; prompt=(C.V7/"prompts/codex.prompt.txt").read_text(); request=L.create_request(row,prompt)
    check(request["prompt"].startswith("Create a goal that") and len(request["prompt"].encode())==3050,"Codex prompt")
    create={"threadId":SESSION,"projectlessOutputDirectory":f"C:\\Codex\\{row['projectless_directory_name']}\\outputs","hostId":"local"}
    envelope={"schema_id":"pm.r10.storage_pipeline.codex_app_host_receipt.v1","tool":"create_thread","request":request,"result":create}
    raw=(P.canonical_json(envelope)+"\n").encode(); parsed=L.canonical_receipt(raw,P,"create_thread",request); check(L._create_result(parsed["result"],row)==create,"create envelope")
    rejects(lambda:L.canonical_receipt(raw[:-1],P,"create_thread",request),"noncanonical","newline")
    rejects(lambda:L.canonical_receipt(raw,P,"create_thread",{**request,"title":"wrong"}),"wrong request")
    bad_target=K.deepcopy(request); bad_target["target"]["directoryName"]="wrong"; rejects(lambda:L.canonical_receipt(raw,P,"create_thread",bad_target),"wrong target")
    bad_create={**create,"projectlessOutputDirectory":"C:\\Codex\\wrong\\outputs"}; rejects(lambda:L._create_result(bad_create,row),"wrong directory","projectless output join")
    wait=L.wait_request(create,[],120000); wait_result=wait_fixture(create)
    check(L.validate_wait(wait_result,create) and wait=={"targets":[{"threadId":create["threadId"],"hostId":"local"}],"timeoutMs":120000},"wait envelope")
    bad_wait=K.deepcopy(wait_result); del bad_wait["polls"][0]["revision"]; rejects(lambda:L.validate_wait(bad_wait,create),"wait revision")
    read=read_fixture(row,create); L.validate_read(read,create,row,prompt,exact_final(),["turn"]); check(True,"read/raw")
    rejects(lambda:L.validate_read(read,create,row,prompt,exact_final(),["other"]),"turn mismatch")
    bad=K.deepcopy(read); bad["turns"][0]["items"].append({"type":"userMessage","text":"follow up"}); rejects(lambda:L.validate_read(bad,create,row,prompt,exact_final()),"follow-up")
    with T.TemporaryDirectory(prefix="r10-malformed-receipt-") as td:
        root=Path(td); path=root/"create.raw.json"
        rejects(lambda:C.capture_host_receipt(root,path,b"{}\n","create_thread",request),"malformed receipt")
        check(path.read_bytes()==b"{}\n" and not (root/"host_events.jsonl").exists(),"raw preserved")
        P.atomic_write(root/"launch.json",P.pretty_json({"started_at_utc":"2026-08-26T00:00:00.000Z"})); prior_now=C.base.utc_now; C.base.utc_now=lambda:"2026-08-26T01:00:00.001Z"
        try: rejects(lambda:C.app_budget(root),"App budget","time budget")
        finally: C.base.utc_now=prior_now
    with T.TemporaryDirectory(prefix="r10-app-reserve-") as td:
        root=Path(td)/"row"; sources=[C.file_record(C.HERE/name) for name in C.SOURCES]; custody=fake_custody(sources); launch=C.reserve_app(root,row,custody)
        check(launch["owned_sources"]==sources and launch["git_custody"]==custody and launch["parent_allowed_calls"]==["create_thread","wait_threads","read_thread"],"App custody")
    with T.TemporaryDirectory(prefix="r10-host-events-") as td:
        root=Path(td); events=[{"ordinal":1,"tool":"create_thread"},{"ordinal":2,"tool":"send_message_to_thread"},{"ordinal":3,"tool":"read_thread"}]
        P.atomic_write(root/"host_events.jsonl",P.jsonl_bytes(events)); rejects(lambda:L.verify_host_events(root,P),"follow-up","allowlist")
        events=[{"ordinal":1,"tool":"create_thread"},{"ordinal":2,"tool":"create_thread"},{"ordinal":3,"tool":"read_thread"}]
        P.atomic_write(root/"host_events.jsonl",P.jsonl_bytes(events)); rejects(lambda:L.verify_host_events(root,P),"duplicate create","denominator")
    with T.TemporaryDirectory(prefix="r10-direct-") as td:
        root=Path(td)/"row"; row,launch,terminal=build_direct_app(root); projection=L.verify_direct_evidence(root,row,prompt,C.spec(),P,V,launch,terminal)
        check(projection["session_id"]==SESSION,"remote raw PASS")
        wait_path=root/"wait_001.raw.json"; held=Path(td)/"held"; wait_path.rename(held); rejects(lambda:L.verify_direct_evidence(root,row,prompt,C.spec(),P,V,launch,terminal),"missing receipt"); held.rename(wait_path)
        original=wait_path.read_bytes(); forged=P.strict_loads(original.decode()); forged["request"]["timeoutMs"]=1; P.atomic_write(wait_path,(P.canonical_json(forged)+"\n").encode()); rejects(lambda:L.verify_direct_evidence(root,row,prompt,C.spec(),P,V,launch,terminal),"forged receipt"); P.atomic_write(wait_path,original)
        copy2=root/"raw_copy_2.receipt.json"; original=copy2.read_bytes(); forged=P.strict_loads(original.decode()); forged["source"]["hostId"]="wrong"; P.atomic_write(copy2,(P.canonical_json(forged)+"\n").encode()); rejects(lambda:L.verify_direct_evidence(root,row,prompt,C.spec(),P,V,launch,terminal),"wrong raw host"); P.atomic_write(copy2,original)
        extra=root/"fabricated.txt"; extra.write_text("x"); rejects(lambda:L.verify_direct_evidence(root,row,prompt,C.spec(),P,V,launch,terminal),"extra file","file roster"); extra.unlink()
def journal_and_spy_tests():
    reports=[]; journal=[]
    for row in C.rows():
        report={**{k:row[k] for k in C.IDENTITY},"surface":row["surface"],"launch_sha256":f"launch-{row['ordinal']}","omp_preflight_sha256":f"pre-{row['ordinal']}" if row["surface"]=="omp_tui" else None,"pid":1000+row["ordinal"]}
        entry={"schema_id":"pm.r10.storage_pipeline.launch_journal.v2",**{k:row[k] for k in C.IDENTITY},"launch_sha256":report["launch_sha256"],"omp_preflight_sha256":report["omp_preflight_sha256"]}
        entry.update({"popen_observed":True,"pid":report["pid"]} if row["surface"]=="omp_tui" else {"app_create_observed":True,"pid":None})
        reports.append(report); journal.append(entry)
    for count in range(25): C.mixed_journal(journal[:count],reports[:count])
    check(True,"prefixes 0..24")
    for key,value in (("nonce","wrong"),("launch_sha256","wrong"),("popen_observed",False),("pid",999)):
        bad=K.deepcopy(journal[:1]); bad[0][key]=value; rejects(lambda b=bad:C.mixed_journal(b,reports[:1]),f"journal {key}")
    bad=K.deepcopy(journal[:6]); bad[5]["app_create_observed"]=False; rejects(lambda:C.mixed_journal(bad,reports[:6]),"App create")
    bad=K.deepcopy(journal[:6]); bad[5]["popen_observed"]=True; rejects(lambda:C.mixed_journal(bad,reports[:6]),"App/Popen")
    bad=K.deepcopy(journal[:6]); bad[5]["pid"]=999; rejects(lambda:C.mixed_journal(bad,reports[:6]),"App PID")
    unique=[]
    for n in range(2): unique.append({"attempt_id":f"a{n}","nonce":f"n{n}","cwd_identity":f"cwd{n}","started_at_utc":f"2026-08-26T00:00:0{n}Z","status":"PASS","observed_identity":f"thread{n}","raw_primary_sha256":f"raw{n}"})
    for field in ("attempt_id","cwd_identity","observed_identity","raw_primary_sha256"):
        duplicate=K.deepcopy(unique); duplicate[1][field]=duplicate[0][field]
        rejects(lambda d=duplicate:V.verify_global_uniqueness([{"rows":d}]),f"reused {field}","uniqueness")
    original_validate,original_git,original_run_git,original_popen=C.validate_static,C.git_custody,C.run_git,C.base.subprocess.Popen
    calls=[]; custody=[]
    C.validate_static=lambda **_kw:{"status":"TEST"}; C.git_custody=lambda:(custody.append(1),(_ for _ in ()).throw(C.ControllerError("unpushed")))[1]; C.base.subprocess.Popen=lambda *_a,**_k:calls.append(1)
    try:
        for row in C.rows():
            command="run-omp" if row["surface"]=="omp_tui" else "codex-reserve"; output=io.StringIO()
            with X.redirect_stdout(output): rc=C.dispatch([command,str(row["ordinal"])])
            check(rc==1 and "FAIL_PRELAUNCH_NO_MUTATION" in output.getvalue(),f"gate {row['ordinal']}")
        check(len(custody)==24 and not calls and not os.path.lexists(C.EVIDENCE),"absent stays prelaunch")
        C.git_custody=original_git; head="a"*40
        def fake(mode):
            relative=""
            def run(*args,binary=False):
                nonlocal relative
                if args[0]=="rev-parse": out=("b"*40 if mode=="ref" and args[1]=="origin/main" else head)+"\n"
                elif args[0]=="ls-files":
                    relative=args[-1]; out=f"{'100755' if mode in ('exec','imode') else '100644'} {'d'*40 if mode=='index' else 'c'*40} {'1' if mode=='stage' else '0'}\t{relative}\n"
                    if mode=="multi": out+=out
                elif args[0]=="ls-tree":
                    relative=args[-1]; out=f"{'100755' if mode=='exec' else '100644'} blob {'c'*40}\t{relative}\n"
                else: out=b"wrong" if mode=="blob" else (C.REPO/relative).read_bytes()
                return C.subprocess.CompletedProcess(args,0,stdout=out)
            return run
        C.run_git=fake("ok"); good=C.git_custody(); check(good["head"]==head and len(good["sources"])==5 and all(item["git_mode"]=="100644" for item in good["sources"]),"raw Git custody")
        for mode in ("ref","index","imode","stage","multi","blob","exec"):
            C.run_git=fake(mode); output=io.StringIO()
            with X.redirect_stdout(output): rc=C.dispatch(["run-omp","1"])
            check(rc==1 and "FAIL_PRELAUNCH_NO_MUTATION" in output.getvalue() and not calls and not os.path.lexists(C.EVIDENCE),f"{mode} pre-reserve")
        with T.TemporaryDirectory(prefix="r10-link-") as td:
            root=Path(td); real=root/"real"; real.mkdir(); (real/"source").write_text("x"); (root/"link").symlink_to(real,True); prior=C.REPO; C.REPO=root
            try: rejects(lambda:C.live_source(root/"link"/"source"),"symlink parent","source parent")
            finally: C.REPO=prior
    finally: C.validate_static,C.git_custody,C.run_git,C.base.subprocess.Popen=original_validate,original_git,original_run_git,original_popen
def binding_and_ast_tests():
    originals=[getattr(module,name) for module,name,_ in C.BINDINGS]
    try:
        with C.installed():
            check(all(getattr(module,name) is value for module,name,value in C.BINDINGS),"bindings installed")
            raise RuntimeError("restore")
    except RuntimeError: pass
    check(all(getattr(module,name) is value for (module,name,_),value in zip(C.BINDINGS,originals,strict=True)),"restored")
    check(V.terminal_result is ORIGINAL_TERMINAL_RESULT,"scorer restored")
    forbidden={"run_row","verify_row","verify_codex_raw","verify_omp_raw","verify_evidence_tree","derive"}
    for name in ("controller.py","codex_app_lane.py"):
        tree=ast.parse((C.HERE/name).read_text()); defs={node.name for node in ast.walk(tree) if isinstance(node,(ast.FunctionDef,ast.AsyncFunctionDef))}
        check(not defs & forbidden,f"no copy {name}")
    lane_tree=ast.parse((C.HERE/"codex_app_lane.py").read_text()); calls=[node for node in ast.walk(lane_tree) if isinstance(node,ast.Call)]
    check(not any(isinstance(node.func,ast.Attribute) and node.func.attr in {"Popen","run","create_thread","wait_threads","read_thread"} for node in calls),"no launcher")
def extended_custody_tests():
    sources=[{**C.file_record(C.HERE/name),"git_mode":"100644","git_oid":"c"*40} for name in C.SOURCES]; custody=fake_custody(sources)
    record={"matrix_contract":C.file_record(C.CONTRACT),"owned_sources":sources,"git_custody":custody,"protocol_adapter":"native_default","row_time_budget_seconds":3600}
    with T.TemporaryDirectory(prefix="r10-custody-") as td:
        path=Path(td)/"receipt.json"; P.atomic_write(path,P.pretty_json(record)); C.verify_extended(path,"native_default",custody); check(True,"full custody")
        bad=K.deepcopy(record); bad["owned_sources"]=bad["owned_sources"][:-1]; P.atomic_write(path,P.pretty_json(bad)); rejects(lambda:C.verify_extended(path,"native_default",custody),"missing source","source hashes")
        bad=K.deepcopy(record); bad["git_custody"]["head"]="b"*40; P.atomic_write(path,P.pretty_json(bad)); rejects(lambda:C.verify_extended(path,"native_default",custody),"head drift","pushed custody")
def partial_claim_tests():
    old=(C.EVIDENCE,C.BINDINGS,C.validate_static,C.git_custody,C.verify_prefix,C.base.run_row,C.reserve_app); base_evidence=C.base.EVIDENCE; popen=C.base.subprocess.Popen; v7=C.V7/"evidence"
    snap=lambda:[(p.relative_to(v7).as_posix(),p.stat().st_size,P.sha256_file(p)) for p in v7.rglob("*") if p.is_file()]; before=snap()
    def setup(td,index,custody):
        evidence=Path(td)/"evidence"; row=C.rows()[index]; d=evidence/row["pass_id"]/row["route_id"]; C.EVIDENCE=evidence; C.BINDINGS=tuple((m,n,evidence if n=="EVIDENCE" else value) for m,n,value in old[1]); C.validate_static=lambda **_kw:{"status":"TEST"}; C.git_custody=custody if callable(custody) else lambda:custody; C.verify_prefix=lambda:{"row_count":index}; return evidence,row,d
    def restore():
        C.EVIDENCE,C.BINDINGS,C.validate_static,C.git_custody,C.verify_prefix,C.base.run_row,C.reserve_app=old; C.base.EVIDENCE=base_evidence; C.base.subprocess.Popen=popen; C.DISPATCH_CUSTODY=None
    for index,command in ((0,"run-omp"),(5,"codex-create-request")):
        for parent_only in (False,True):
            with T.TemporaryDirectory(prefix="r10-partial-") as td:
                evidence,row,d=setup(td,index,{"status":"TEST"})
                def partial(path):
                    path.parent.mkdir(parents=True)
                    if not parent_only: path.mkdir(); P.atomic_write(path/"reservation.json",b"{")
                    raise OSError("partial reserve")
                C.base.run_row=lambda pass_id,route_id,_seconds:partial(C.base.EVIDENCE/pass_id/route_id); C.reserve_app=lambda path,*_args:partial(path); output=io.StringIO()
                try:
                    with X.redirect_stdout(output): rc=C.dispatch(["codex-reserve" if index else command,str(index+1)])
                    terminal=P.load_json(d/"terminal.json"); files={p.name for p in d.iterdir()}; required={"runner_failure.json","terminal.json"}|(set() if parent_only else {"reservation.json"})
                    check(rc==1 and "FAIL_CONSUMED_STOP_SUFFIX" in output.getvalue() and terminal["status"]=="FAIL" and required<=files,f"partial {index}/{parent_only}")
                    with C.installed(): rejects(old[4],"suffix block","absent evidence root")
                    suffix=C.rows()[index+1]; check(not os.path.lexists(evidence/suffix["pass_id"]/suffix["route_id"]),"suffix absent")
                finally: restore()
    sources=[{**C.file_record(C.HERE/name),"git_mode":"100644","git_oid":"c"*40} for name in C.SOURCES]; first=fake_custody(sources); second=K.deepcopy(first)
    for key in ("candidate_commit","head","origin_main","truenas_backup_main"): second[key]="b"*40
    with T.TemporaryDirectory(prefix="r10-app-drift-") as td:
        evidence,row,d=setup(td,5,second); C.reserve_app(d,row,first); output=io.StringIO()
        try:
            with X.redirect_stdout(output): rc=C.dispatch(["codex-create-request","6"])
            terminal=P.load_json(d/"terminal.json"); check(rc==1 and "FAIL_CONSUMED_STOP_SUFFIX" in output.getvalue() and "prompt" not in output.getvalue() and terminal["status"]=="FAIL" and terminal["external_submission_count"]==0 and (d/"runner_failure.json").is_file() and not (d/"host_events.jsonl").exists() and not (d/"create_receipt.raw.json").exists(),"App drift no request")
        finally: restore()
    with T.TemporaryDirectory(prefix="r10-omp-drift-") as td:
        sequence=iter((first,second)); evidence,row,d=setup(td,0,lambda:next(sequence)); calls=[]; C.base.subprocess.Popen=lambda *_a,**_k:calls.append(1)
        def drift_run(pass_id,route_id,_seconds):
            d.mkdir(parents=True); P.atomic_write(d/"reservation.json",b"{}\n"); return C.base.row_preflight(d,row,C.route_map()[route_id])
        C.base.run_row=drift_run; output=io.StringIO()
        try:
            with X.redirect_stdout(output): rc=C.dispatch(["run-omp","1"])
            check(rc==1 and "FAIL_CONSUMED_STOP_SUFFIX" in output.getvalue() and not calls and not (d/"omp_preflight.json").exists() and C.DISPATCH_CUSTODY is None,"OMP drift no Popen")
        finally: restore()
    check(before==snap() and C.base.EVIDENCE==base_evidence,"V7 unchanged")
def authority_tests():
    for row in C.rows(): C.require_launch_authority(row)
    check(True,"24 authorized")
    fake=K.deepcopy(C.rows()[0]); fake["model"]="opencode-go/other"
    rejects(lambda:C.require_launch_authority(fake),"unfrozen","exact frozen row")
    original=C.spec
    for field in ("follow_up_or_send_authorized","retry_or_replacement_authorized","unfrozen_route_or_identity_authorized","other_task_creation_authorized"):
        mutated=K.deepcopy(original()); mutated["authority"]["matrix_launch_grant"][field]=True; C.spec=lambda value=mutated:value
        try: rejects(lambda:C.require_launch_authority(mutated["rows"][0]),f"widen {field}","cannot widen")
        finally: C.spec=original

def main():
    check(C.validate_static(unused=True)["status"]=="PASS_LOCAL_STORAGE_NATIVE_MATRIX_PRELAUNCH","static")
    check(C.advisor_off({"effective_config":{"task.agentAdvisor":{"task":"off"}}}) and not C.advisor_off({"effective_config":{"task.agent.advisor":{"task":"off"}}}),"advisor key")
    v1=P.load_json(C.R10/"storage_native_matrix_v1/matrix_contract.json")["rows"]; check(all(row in list(C.prior_rows()) for row in v1),"V1 disjoint")
    real_v7_and_crlf(); diagnostic_sol_replay(); app_contract_tests()
    good=exact_final(); C.exact_result(good); check(True,"scorer accepts oracle")
    for name,text in (("wrong","PM_RESULT {}"),("missing","no result"),("duplicate",good+"\n"+good),("overlimit","x"*100000+"\n"+good)):
        rejects(lambda value=text:C.exact_result(value),f"scorer {name}")
    row=C.rows()[5]; create={"threadId":SESSION,"hostId":"local","projectlessOutputDirectory":"C:/x/outputs"}
    with T.TemporaryDirectory(prefix="r10-order-") as td:
        d=Path(td); P.atomic_write(d/"launch.json",P.pretty_json({"external_prompt_count":1})); old_raw,old_score=L.raw_projection,V.terminal_result; scored=[]
        L.raw_projection=lambda *_a,**_k:(_ for _ in ()).throw(L.LaneError("structural first")); V.terminal_result=lambda text:scored.append(text)
        try: rejects(lambda:C.verify_codex_candidate(d,row,create,(C.V7/"prompts/codex.prompt.txt").read_text(),good),"structure first","structural first"); check(not scored,"no score")
        finally: L.raw_projection,V.terminal_result=old_raw,old_score
    for route in [r for r in C.route_map().values() if r["surface"]=="codex_app"]: verify_synthetic(route); check(True,f"synthetic raw {route['id']}")
    for mutation in ("duplicate_user","wrong_user","ambient_after","ordinary_call","event_tool","model","effort"):
        rejects(lambda m=mutation:verify_synthetic(C.route_map()["codex_luna_max"],m),f"Codex raw {mutation} rejected")
    authority_tests(); journal_and_spy_tests(); binding_and_ast_tests(); extended_custody_tests(); partial_claim_tests()
    check(not list(C.HERE.rglob("*.pyc")) and not list(C.HERE.rglob("__pycache__")),"no cache residue")
    print(P.canonical_json({"status":"PASS_ZERO_SUBJECT_SELFTEST","checks":len(CHECKS),"optimized":not __debug__,"subject_calls":0,"qualification_credit":0})); return 0

if __name__=="__main__": raise SystemExit(main())
