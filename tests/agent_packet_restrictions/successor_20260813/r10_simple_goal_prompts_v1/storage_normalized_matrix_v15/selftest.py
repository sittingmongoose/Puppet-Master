#!/usr/bin/env python3
"""Zero-subject V15 matrix tests. Never launches OMP or creates an App task."""
import copy,json,os,subprocess,sys,tempfile
from pathlib import Path
os.environ["PYTHONDONTWRITEBYTECODE"]="1"
HERE=Path(__file__).resolve().parent; sys.path.insert(0,str(HERE)); import controller as C
checks=0
def check(value,message):
    global checks
    if not value: raise AssertionError(message)
    checks+=1
def rejects(fn,message):
    global checks
    try: fn()
    except Exception: checks+=1; return
    raise AssertionError(message)
def route_contract():
    contract=C.spec(); rows=C.rows(); routes=list(C.route_map().values())
    expected=[("omp_glm53_flash_max","omp_tui","opencode-go/glm-5.3-flash","max"),("omp_cursor_default_auto","omp_tui","cursor/default","auto"),("omp_muse_spark_xhigh","omp_tui","opencode-go/muse-spark-1.2-contributor","xhigh"),("omp_deepseek_v4_flash_max","omp_tui","opencode-go/deepseek-v4-flash","max"),("omp_gemini_37_flash_high","omp_tui","google-antigravity/gemini-3.7-flash","high"),("codex_luna_max","codex_app","gpt-5.6-luna","max"),("codex_luna_medium","codex_app","gpt-5.6-luna","medium"),("codex_gpt54_xhigh","codex_app","gpt-5.4","xhigh"),("codex_gpt54_medium","codex_app","gpt-5.4","medium"),("codex_gpt54mini_xhigh","codex_app","gpt-5.4-mini","xhigh"),("codex_gpt54mini_medium","codex_app","gpt-5.4-mini","medium"),("omp_qwen38_max_xhigh","omp_tui","alibaba-token-plan/qwen3.8-max","xhigh")]
    check([(r["id"],r["surface"],r["model"],r["thinking"]) for r in routes]==expected,"route order")
    check([(r["route_id"],r["surface"],r["model"],r["thinking"]) for r in rows[:12]]==expected,"pass1")
    check([r["route_id"] for r in rows[:12]]==[r["route_id"] for r in rows[12:]],"identical pass2")
    check(len({r["attempt_id"] for r in rows})==len({r["nonce"] for r in rows})==24,"fresh identities")
    check(contract["runtime"]["continue_after_model_specific_failure"] and contract["runtime"]["pass1_row1_spend_harness_gate"],"scheduler")
    check(C.PROMPT.read_bytes().startswith(b"/goal ") and C.CODEX_PROMPT.read_bytes().startswith(b"Create a goal that "),"prompts")
    omp_lines=C.PROMPT.read_text().splitlines(); codex_lines=C.CODEX_PROMPT.read_text().splitlines(); check(codex_lines[1:-1]==omp_lines[1:-1] and '`goal` tool' not in codex_lines[-1] and '"op":"complete"' not in codex_lines[-1] and "create_goal" in codex_lines[-1] and "update_goal" in codex_lines[-1],"surface-only prompt lifecycle delta")
    check(C.DB.verify()==C.DEPENDENCY_RECEIPT and C.DEPENDENCY_RECEIPT["file_count"]==28,"dependencies")
    check(contract["snapshot"]["commit"]==C.G.SNAPSHOT_COMMIT and contract["snapshot"]["entry_count"]==6097,"snapshot")
    check(C.verify_lineage()["status"]=="PASS_V14_LINEAGE_AND_MIMO_429_FALLBACK","lineage")
def historical_scanner_controls():
    identity="fresh-v15-disposable-identity"
    with tempfile.TemporaryDirectory() as td:
        repo=Path(td); package=repo/"pkg"; package.mkdir(); (package/"matrix_contract.json").write_text(json.dumps({"attempt_id":identity})+"\n")
        def git(*args): return subprocess.run(["git",*args],cwd=repo,text=True,capture_output=True,check=True)
        git("init","-q"); git("add","pkg/matrix_contract.json"); git("-c","user.name=V15 Test","-c","user.email=v15@example.invalid","commit","-qm","self identity")
        actual=git("grep","-n","-F","-e",identity,"HEAD","--","pkg").stdout; check(C.parse_historical_identity_matches(actual,{"pkg/matrix_contract.json"})==["pkg/matrix_contract.json"],"actual git grep HEAD self identity")
        (repo/"foreign.txt").write_text(identity+"\n"); git("add","foreign.txt"); git("-c","user.name=V15 Test","-c","user.email=v15@example.invalid","commit","-qm","foreign reuse")
        foreign=git("grep","-n","-F","-e",identity,"HEAD","--",".").stdout; rejects(lambda:C.parse_historical_identity_matches(foreign,{"pkg/matrix_contract.json"}),"foreign committed identity reuse")
        rejects(lambda:C.parse_historical_identity_matches(actual.replace("HEAD:","HEAD~1:",1),{"pkg/matrix_contract.json"}),"foreign revision prefix")
        rejects(lambda:C.parse_historical_identity_matches("HEAD:pkg/matrix_contract.json:not-a-line:value\n",{"pkg/matrix_contract.json"}),"malformed grep output")
class Sentinel:
    def __init__(self,*args,**kwargs): calls.append((args,kwargs))
def dispatch_sentinels():
    global calls
    rows=C.rows(); routes=C.route_map(); calls=[]; finalized=[]; old_popen=C.G.ORIGINAL_POPEN; old_custody=C.git_custody; old_load=C.P.load_json; old_snapshot=C.G.verify_input_snapshot; old_finalize=C.finalize_popen_state; custody={"sentinel":"frozen"}; snapshot={"sentinel":"snapshot"}
    C.git_custody=lambda:custody; C.DISPATCH_CUSTODY=custody; C.G.ORIGINAL_POPEN=Sentinel; C.G.verify_input_snapshot=lambda:snapshot; C.P.load_json=lambda path:{"git_custody":custody,"input_snapshot":snapshot,"dependency_snapshot":C.DEPENDENCY_RECEIPT} if Path(path).name=="omp_preflight.json" else old_load(path); C.finalize_popen_state=lambda row,route,argv:finalized.append((row["ordinal"],route["id"],argv)) or {"sentinel":"finalized"}
    try:
        for row in [r for r in rows if r["surface"]=="omp_tui"]:
            with C.selected(row):
                argv=C.expected_argv(routes[row["route_id"]],row); env={"PI_CODING_AGENT_DIR":row["profile_dir"],"OMP_PROFILE":"default","PI_PROFILE":"default"}
                C.SPROXY.Popen(argv,cwd=str(C.V7),env=env); check(calls[-1][0][0]==argv,"OMP argv")
                check(calls[-1][1]["env"]["OMP_PROFILE"]==calls[-1][1]["env"]["PI_PROFILE"]=="default","profile")
                check((calls[-1][1]["env"].get("PI_REQ_DEBUG")=="1")==(row["route_id"]==C.GLM_ROUTE),"HTTP route scope")
        check(len(calls)==len(finalized)==12 and [item[0] for item in finalized]==[row["ordinal"] for row in rows if row["surface"]=="omp_tui"],"12 finalized OMP fake Popen")
    finally: C.G.ORIGINAL_POPEN=old_popen; C.git_custody=old_custody; C.P.load_json=old_load; C.G.verify_input_snapshot=old_snapshot; C.finalize_popen_state=old_finalize; C.DISPATCH_CUSTODY=None
    codex=[r for r in rows if r["surface"]=="codex_app"]; requests=[C.app.create_request(r,C.CODEX_PROMPT.read_text()) for r in codex]
    check(len(requests)==12,"12 Codex fake create")
    for row,request in zip(codex,requests,strict=True):
        check(request["prompt"].startswith("Create a goal that ") and (request["model"],request["thinking"])==(row["model"],row["thinking"]),"Codex dispatch")
        check(set(request)=={"prompt","target","model","thinking","title"},"Codex request")
def semantic_carriers():
    oracle=C.P.load_json(C.V7/"oracle.json"); canonical=json.dumps(oracle,separators=(",",":"),ensure_ascii=False); old=C.N.omp_session.load_physical_session
    try:
        for text in ["before\nPM_RESULT "+canonical+"\nafter","PM_RESULT\n  "+json.dumps(oracle,indent=2),"PM_RESULTS prose\nPM_RESULT\r\n\t"+json.dumps(oracle,sort_keys=True)]:
            entries=[{"type":"message","id":"a","message":{"role":"assistant","id":"a","content":[{"type":"text","text":text}]}}]; C.N.omp_session.load_physical_session=lambda _:(None,None,entries,b"raw")
            with tempfile.TemporaryDirectory() as td:
                p=Path(td)/"raw"; p.write_text("{}\n"); result=C.semantic_normalize(p,{"assistant_message_count":1,"final_text":text},oracle_path=C.V7/"oracle.json",schema_path=C.V7/"response.schema.json",max_text_block_utf8_bytes=32768); check(result["result_normalization"]["candidate_count"]==1,"carrier")
        for text in ["PM_RESULT:"+canonical,"PM_RESULT "+canonical+" trailing","PM_RESULT "+" "*65+canonical,"PM_RESULT []\nPM_RESULT "+canonical,"PM_RESULT {\"x\":NaN}\nPM_RESULT "+canonical]:
            entries=[{"type":"message","id":"a","message":{"role":"assistant","id":"a","content":[{"type":"text","text":text}]}}]; C.N.omp_session.load_physical_session=lambda _:(None,None,entries,b"raw")
            with tempfile.TemporaryDirectory() as td:
                p=Path(td)/"raw"; p.write_text("{}\n"); rejects(lambda:C.semantic_normalize(p,{"assistant_message_count":1,"final_text":text},oracle_path=C.V7/"oracle.json",schema_path=C.V7/"response.schema.json",max_text_block_utf8_bytes=32768),"strict carrier")
    finally: C.N.omp_session.load_physical_session=old
def continuation_controls():
    old=C.omp_session.load_physical_session
    try:
        C.omp_session.load_physical_session=lambda _:(None,None,[],b""); C.enforce_no_continuation_or_recap(Path("unused"),{"native_continuation_count":0}); check(True,"zero continuation/recap")
        C.omp_session.load_physical_session=lambda _:(None,None,[{"type":"custom","customType":"goal-continuation"}],b""); rejects(lambda:C.enforce_no_continuation_or_recap(Path("unused"),{"native_continuation_count":1}),"one continuation")
        C.omp_session.load_physical_session=lambda _:(None,None,[{"type":"custom","customType":"recap"}],b""); rejects(lambda:C.enforce_no_continuation_or_recap(Path("unused"),{"native_continuation_count":0}),"recap")
    finally: C.omp_session.load_physical_session=old
def journal_global_controls():
    old_rows,old_dir=C.rows,C.row_dir
    with tempfile.TemporaryDirectory() as td:
        root=Path(td); synthetic=[]; journal=[]; reports=[]
        for index in range(2):
            row=copy.deepcopy(C.spec()["rows"][index]); row["surface"]="omp_tui"; directory=root/str(index); directory.mkdir(); started=f"2026-08-28T00:00:0{index}.000Z"; C.P.atomic_write(directory/"launch.json",C.P.pretty_json({"started_at_utc":started,"pid":100+index})); C.P.atomic_write(directory/"omp_preflight.json",C.P.pretty_json({"row":index})); entry={"schema_id":"pm.r10.storage_pipeline.launch_journal.v2",**{key:row[key] for key in C.IDENTITY},"started_at_utc":started,"launch_sha256":C.P.sha256_file(directory/"launch.json"),"omp_preflight_sha256":C.P.sha256_file(directory/"omp_preflight.json"),"pid":100+index,"popen_observed":True}; report={**{key:row[key] for key in ("ordinal","pass_id","route_id","attempt_id","nonce")},"status":"PASS","started_at_utc":started,"launch_sha256":entry["launch_sha256"],"omp_preflight_sha256":entry["omp_preflight_sha256"],"pid":100+index,"cwd":f"/tmp/cwd-{index}","session_dir":f"/tmp/session-{index}","projectless_directory_name":None,"observed_identity":f"session-{index}","goal_id":f"goal-{index}","raw_sha256":f'{index+1:064x}'}; synthetic.append(row); journal.append(entry); reports.append(report)
        C.rows=lambda:synthetic; C.row_dir=lambda row=None:root/str((row or synthetic[0])["ordinal"]-1)
        try:
            C.mixed_journal(journal,reports); C.verify_global_outcomes(reports); check(True,"mixed journal/global positive")
            for mutate in (lambda x:x[0].update(schema_id="foreign"),lambda x:x[1].update(started_at_utc=x[0]["started_at_utc"]),lambda x:x[1].update(started_at_utc="2026-08-27T23:59:59.000Z"),lambda x:x[0].update(pid=None),lambda x:x[0].update(pid=999),lambda x:x[0].update(popen_observed=False),lambda x:x[0].update(omp_preflight_sha256="0"*64)):
                changed=copy.deepcopy(journal); mutate(changed); rejects(lambda:C.mixed_journal(changed,reports),"mixed journal mutation")
            for field in ("cwd","session_dir","raw_sha256","observed_identity"):
                changed=copy.deepcopy(reports); changed[1][field]=changed[0][field]; rejects(lambda:C.verify_global_outcomes(changed),"global duplicate")
            for field,value in (("observed_identity",None),("observed_identity",""),("raw_sha256",None),("raw_sha256","f"*63),("raw_sha256","g"*64)):
                changed=copy.deepcopy(reports); changed[0][field]=value; rejects(lambda:C.verify_global_outcomes(changed),"PASS verified identity/raw required")
            row=synthetic[0]; directory=root/"0"; (directory/"session.raw.jsonl").write_bytes(b'{"raw":true}\n'); C.P.atomic_write(directory/"structural_projection.json",C.P.pretty_json({"goal_id":"verified-goal"})); terminal={**{key:row[key] for key in C.IDENTITY},"surface":row["surface"],"model":row["model"],"thinking":row["thinking"],"status":"PASS","finished_at_utc":"2026-08-28T00:00:01.000Z","observed_identity":"terminal-self-assertion"}; verified={"status":"PASS","observed_identity":"verified-session","raw_primary_sha256":C.P.sha256_file(directory/"session.raw.jsonl"),"pid":100}; built=C.build_row_report(row,journal[0],terminal,verified); check(built["observed_identity"]=="verified-session" and built["raw_sha256"]==verified["raw_primary_sha256"] and built["pid"]==100,"PASS report uses verified provenance")
            for mutate in (lambda x:x.pop("observed_identity"),lambda x:x.update(observed_identity=""),lambda x:x.update(raw_primary_sha256="0"*64),lambda x:x.update(pid=999)):
                changed=copy.deepcopy(verified); mutate(changed); rejects(lambda:C.build_row_report(row,journal[0],terminal,changed),"forged verified PASS report")
            app_row=copy.deepcopy(C.spec()["rows"][5]); app_row["ordinal"]=1; appdir=root/"app"; appdir.mkdir(); started="2026-08-28T00:00:03.000Z"; C.P.atomic_write(appdir/"launch.json",C.P.pretty_json({"started_at_utc":started})); C.P.atomic_write(appdir/C.ISSUED,C.P.pretty_json({"issued":True})); issued=C.file_record(appdir/C.ISSUED,appdir); app_entry={"schema_id":"pm.r10.storage_pipeline.launch_journal.v2",**{key:app_row[key] for key in C.IDENTITY},"started_at_utc":started,"launch_sha256":C.P.sha256_file(appdir/"launch.json"),"omp_preflight_sha256":None,"pid":None,"app_create_observed":True,"create_request_issued":issued}; app_report={"ordinal":1,"started_at_utc":started,"launch_sha256":app_entry["launch_sha256"],"omp_preflight_sha256":None}; C.rows=lambda:[app_row]; C.row_dir=lambda row=None:appdir; C.mixed_journal([app_entry],[app_report]); check(True,"App journal positive")
            for mutate in (lambda x:x.update(app_create_observed=False),lambda x:x.update(pid=7)):
                changed=copy.deepcopy(app_entry); mutate(changed); rejects(lambda:C.mixed_journal([changed],[app_report]),"App journal create/PID")
        finally: C.rows, C.row_dir=old_rows,old_dir
def dependency_hold_controls():
    old_verify=C.DB.verify; C.DB.verify=lambda:(_ for _ in ()).throw(RuntimeError("receipt unavailable"))
    try:
        try: C.dependency_verify()
        except C.DependencyContamination as exc: check(C.global_contamination(exc),"typed dependency contamination")
        else: raise AssertionError("dependency fault accepted")
    finally: C.DB.verify=old_verify
    old_here=C.HERE
    with tempfile.TemporaryDirectory() as td:
        C.HERE=Path(td); evidence=C.HERE/"evidence"; directory=evidence/"pass_01"/"route"; directory.mkdir(parents=True); (evidence/"launch_journal.jsonl").write_text(json.dumps({"ordinal":1,"pass_id":"pass_01","route_id":"route"})+"\n"); C._early_dependency_hold(RuntimeError("post-terminal receipt unavailable")); hold=json.loads((evidence/"HOLD.json").read_text()); check(hold["suffix_blocked"] is True and hold["qualification_credit"]==0,"early dependency HOLD")
    C.HERE=old_here
def post_pass_hold_controls():
    old_evidence=C.EVIDENCE
    with tempfile.TemporaryDirectory() as td:
        C.EVIDENCE=Path(td); row=C.rows()[0]; hold=C.write_hold(row,C.MatrixError("post-terminal exact evidence roster")); check(hold["suffix_blocked"] is True and C.P.load_json(C.EVIDENCE/"HOLD.json")["qualification_credit"]==0,"post-PASS exact-roster HOLD")
    C.EVIDENCE=old_evidence
def codex_grammar():
    row=C.rows()[8]; final=C.P.RESULT_PREFIX+(C.V7/"oracle.json").read_text().strip(); turn="turn-1"; item=lambda payload:{"type":"response_item","payload":payload}; objective="Audit the bounded storage pipeline evidence."
    goal=lambda status:json.dumps({"goal":{"status":status,"threadId":"thread","createdAt":"now","objective":objective},"remainingTokens":None,"completionBudgetReport":None},separators=(",",":"))
    raw=[{"type":"event_msg","payload":{"type":"task_started","turn_id":turn}},{"type":"turn_context","payload":{"turn_id":turn,"model":row["model"],"effort":row["thinking"],"collaboration_mode":{"settings":{"model":row["model"],"reasoning_effort":row["thinking"]}}}},item({"type":"message","role":"user","content":[{"type":"input_text","text":C.CODEX_PROMPT.read_text()}]}),item({"type":"function_call","name":"create_goal","call_id":"c1","arguments":json.dumps({"objective":objective})}),item({"type":"function_call_output","call_id":"c1","output":goal("active")}),item({"type":"function_call","name":"update_goal","call_id":"c2","arguments":json.dumps({"status":"complete"})}),item({"type":"function_call_output","call_id":"c2","output":goal("complete")}),item({"type":"message","role":"assistant","phase":"final_answer","content":[{"type":"output_text","text":final}]}),{"type":"event_msg","payload":{"type":"task_complete","turn_id":turn,"last_agent_message":final}}]
    with tempfile.TemporaryDirectory() as td:
        p=Path(td)/"raw"; p.write_bytes(C.P.jsonl_bytes(raw));
        with C.selected(row): check(C.normalize_codex(p,final)["result_normalization"]["candidate_count"]==1,"Codex final after complete")
        for candidate in [item for item in C.rows() if item["surface"]=="codex_app"]:
            replay=copy.deepcopy(raw); replay[1]["payload"].update({"model":candidate["model"],"effort":candidate["thinking"]}); replay[1]["payload"]["collaboration_mode"]["settings"]={"model":candidate["model"],"reasoning_effort":candidate["thinking"]}; p.write_bytes(C.P.jsonl_bytes(replay))
            with C.selected(candidate): check(C.normalize_codex(p,final)["result_normalization"]["candidate_count"]==1,"all 12 Codex raw replays")
        directory=Path(td)/"row"; directory.mkdir(); (directory/"rollout.raw.jsonl").write_bytes(C.P.jsonl_bytes([{"type":"session_meta","payload":{"id":"session-1","cwd":"/tmp/app/outputs"}},*raw])); launch={"model":row["model"],"thinking":row["thinking"],"prompt_utf8_bytes":4190,"prompt_sha256":"3b46fff91df4b73819d7504557e17b81f51ecf032ca4921bf90f08f68afff26e"}; terminal={"raw_final_assistant_text":final,"final_assistant_text":final,"qualification_credit":0,"no_retry":True}
        with C.selected(row): check(C.verify_codex_raw(directory,C.route_map()[row["route_id"]],launch,terminal)=="session-1","local direct Codex raw verifier")
        luna=C.rows()[5]; wrapped=copy.deepcopy(raw); wrapped[1]["payload"].update({"model":luna["model"],"effort":luna["thinking"]}); wrapped[1]["payload"]["collaboration_mode"]["settings"]={"model":luna["model"],"reasoning_effort":luna["thinking"]}; wrapped[3]["payload"]={"type":"custom_tool_call","name":"exec","call_id":"c1","input":'const r = await tools.create_goal({objective:'+json.dumps(objective)+'}); text(r);'}; wrapped[4]["payload"]["type"]="custom_tool_call_output"; wrapped[5]["payload"]={"type":"custom_tool_call","name":"exec","call_id":"c2","input":'const r = await tools.update_goal({status:"complete"}); text(r);'}; wrapped[6]["payload"]["type"]="custom_tool_call_output"; p.write_bytes(C.P.jsonl_bytes(wrapped));
        with C.selected(luna): check(C.normalize_codex(p,final)["result_normalization"]["candidate_count"]==1,"Luna wrapper final after complete")
        output_mutations=[]
        duplicate=copy.deepcopy(raw); duplicate.insert(5,copy.deepcopy(duplicate[4])); output_mutations.append(duplicate)
        cross=copy.deepcopy(raw); cross[4]["payload"]["type"]="custom_tool_call_output"; output_mutations.append(cross)
        orphan=copy.deepcopy(raw); orphan[4]["payload"]["call_id"]="orphan"; output_mutations.append(orphan)
        missing=copy.deepcopy(raw); missing.pop(4); output_mutations.append(missing)
        for changed in output_mutations:
            p.write_bytes(C.P.jsonl_bytes(changed));
            with C.selected(row): rejects(lambda:C.normalize_codex(p,final),"Codex output cardinality/style")
        for mutate in (lambda x:x.pop(),lambda x:x.insert(-1,copy.deepcopy(x[-1])),lambda x:x[-1]["payload"].update(last_agent_message="wrong")):
            changed=copy.deepcopy(raw); mutate(changed); p.write_bytes(C.P.jsonl_bytes(changed));
            with C.selected(row): rejects(lambda:C.normalize_codex(p,final),"Codex terminal mutation")
try:
    route_contract(); historical_scanner_controls(); dispatch_sentinels(); semantic_carriers(); continuation_controls(); journal_global_controls(); dependency_hold_controls(); post_pass_hold_controls(); codex_grammar(); print(C.P.canonical_json({"status":"PASS_V15_ZERO_SUBJECT_SELFTEST","checks":checks,"omp_fake_popen":12,"codex_fake_create":12,"subject_calls":0,"qualification_credit":0}))
finally: C.DB.cleanup()
