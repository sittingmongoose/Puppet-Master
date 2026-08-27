#!/usr/bin/env python3
"""Zero-subject runtime, replay, mutation, and fail-stop tests for matrix V6."""
from __future__ import annotations
import contextlib, importlib.util, io, json, tempfile
from pathlib import Path
import controller as C
P=C.P
def check(v:bool,m:str)->None:
    if not v: raise AssertionError(m)
def rejects(call,m:str,needle:str|None=None)->None:
    try: call()
    except Exception as exc:
        if needle: check(needle in str(exc),m)
        return
    raise AssertionError(m)
def fixture()->object:
    path=C.V2/"selftest.py"; spec=importlib.util.spec_from_file_location("v6_fixture",path); check(spec is not None and spec.loader is not None,"fixture"); module=importlib.util.module_from_spec(spec); spec.loader.exec_module(module); return module
def canonical()->str: return P.RESULT_PREFIX+(C.V7/"oracle.json").read_text().strip()
def app_normalize(text:str,earlier:tuple[str,...]=())->dict:
    row=C.rows()[5]; sid="01a09999-1111-7222-8333-444455556666"; raw=fixture().synthetic_raw(C.route_map()[row["route_id"]],sid,row["projectless_directory_name"]); final=raw.pop(); final["payload"]["content"]=[{"type":"output_text","text":text}]; insert=next(i for i,x in enumerate(raw) if x.get("type")=="response_item" and isinstance(x.get("payload"),dict) and x["payload"].get("type")=="custom_tool_call_output")+1; raw[insert:insert]=[{"type":"response_item","payload":{"type":"message","role":"assistant","content":[{"type":"output_text","text":value}]}} for value in earlier]; raw.append(final)
    with tempfile.TemporaryDirectory(prefix="v6-app-") as temporary:
        path=Path(temporary)/"rollout.raw.jsonl"; P.atomic_write(path,P.jsonl_bytes(raw)); return C.normalize_codex(path,text)
def omp_replay(candidate:str)->dict:
    source=C.V3/"evidence/pass_01/omp_mimo_v25_free_high"; launch=P.load_json(source/"launch.json"); raw=P.load_jsonl(source/"session.raw.jsonl"); count=0
    for item in raw:
        message=item.get("message") if item.get("type")=="message" else None
        if isinstance(message,dict) and message.get("role")=="assistant":
            for block in message.get("content",[]):
                if isinstance(block,dict) and block.get("type")=="text" and any(line.strip(" \t").startswith("PM_RESULT ") for line in block.get("text","").splitlines()): block["text"]=candidate; count+=1
    check(count==2,"two real MiMo candidates")
    with tempfile.TemporaryDirectory(prefix="v6-omp-") as temporary:
        path=Path(temporary)/"session.raw.jsonl"; P.atomic_write(path,P.jsonl_bytes(raw)); structural=C.G.ORIGINAL_SESSION(path,expected_cwd=launch["cwd"],expected_objective=(C.V7/"prompts/omp.prompt.txt").read_text().removeprefix("/goal "),expected_provider="opencode-zen",expected_model="mimo-v2.5-free",expected_selector="opencode-zen/mimo-v2.5-free",expected_thinking="high",require_exit=True); return C.semantic_normalize(path,structural,oracle_path=C.V7/"oracle.json",schema_path=C.V7/"response.schema.json",max_text_block_utf8_bytes=P.load_json(C.V7/"matrix.json")["max_final_assistant_utf8_bytes"])
def cursor_test()->None:
    messages=["OMP Cursor aggregate result absent before Goal call","OMP Cursor aggregate result follows Goal call"]; check(all((C.V7/"omp_session.py").read_text().count(x)==1 for x in messages),"Cursor source count"); original=C.omp_session.require; row=C.rows()[1]
    def session(_path:Path,**_kw:object)->dict:
        for message in messages: C.omp_session.require(False,message)
        return {"assistant_message_count":1,"final_text":canonical()}
    old=(C.G.ORIGINAL_SESSION,C.semantic_normalize,C.session_health); C.G.ORIGINAL_SESSION=session; C.semantic_normalize=lambda *_a,**_k:{"final_text":canonical()}; C.session_health=lambda _p:False
    try:
        with C.selected(row): C.verify_session(Path("unused"),require_exit=False)
    finally: C.G.ORIGINAL_SESSION,C.semantic_normalize,C.session_health=old
    check(C.omp_session.require is original,"Cursor finally restoration")
def issuance_test()->None:
    row=C.rows()[5]
    with tempfile.TemporaryDirectory(prefix="v6-issue-") as temporary:
        d=Path(temporary); custody={"candidate_commit":"a"*40,"sources":[],"dependencies":[]}; old=C.git_custody; C.git_custody=lambda:custody
        try:
            P.atomic_write(d/"launch.json",P.pretty_json({"started_at_utc":"2026-08-27T00:00:00.000Z","git_custody":custody})); C.issue_create(d,row,custody); before={x.name:x.read_bytes() for x in d.iterdir()}; rejects(lambda:C.issue_create(d,row,custody),"issuance collision","ALREADY_ISSUED_NO_MUTATION"); check(before=={x.name:x.read_bytes() for x in d.iterdir()},"collision immutability")
        finally: C.git_custody=old
def aggregate_limit_test()->None:
    limit=len(canonical().encode()); entries=[{"type":"message","id":"e","message":{"role":"assistant","id":"m","content":[{"type":"text","text":canonical()},{"type":"text","text":"x"*limit}]}}]; old=C.omp_session.load_physical_session; C.omp_session.load_physical_session=lambda _p:(None,None,entries,b"")
    try: rejects(lambda:C.semantic_normalize(Path("unused"),{"assistant_message_count":1,"final_text":canonical()},oracle_path=C.V7/"oracle.json",schema_path=C.V7/"response.schema.json",max_text_block_utf8_bytes=limit),"multi-block aggregate overflow","bounded aggregate")
    finally: C.omp_session.load_physical_session=old
def app_pipeline_test()->None:
    receipt={"live_plans_open_or_read_count":0}; old_verify=C.G.verify_input_snapshot; old_proxy=C.G.PROXY.verify; old_receipt=C.G.SNAPSHOT_RECEIPT; C.G.SNAPSHOT_RECEIPT=receipt; C.G.verify_input_snapshot=lambda:receipt; C.G.PROXY.verify=lambda:{"status":"PASS_MATERIALIZED_ONLY"}
    try: rejects(C.verify_selected_pipeline,"materialized-only App snapshot","full frozen pre-WorkNode pipeline")
    finally: C.G.verify_input_snapshot=old_verify; C.G.PROXY.verify=old_proxy; C.G.SNAPSHOT_RECEIPT=old_receipt
def transitive_contract_test()->None:
    declared={record["path"] for record in C.spec()["dependencies"]}; runtime_contracts={C.G.CONTRACT,C.G.legacy.CONTRACT}; check(not hasattr(C.app,"CONTRACT") and {path.relative_to(C.REPO).as_posix() for path in runtime_contracts}<=declared,"all runtime-read transitive contracts custody-bound")
    for path in runtime_contracts: check(C.file_record(path)==next(record for record in C.spec()["dependencies"] if record["path"]==path.relative_to(C.REPO).as_posix()),"transitive contract bytes/hash")
def omp_snapshot_mutations()->None:
    snapshot={"materialized_root":"/tmp/frozen","live_plans_open_or_read_count":0}; digest="d"*64; old_verify=C.G.verify_input_snapshot; old_digest=C.G.snapshot_digest; C.G.verify_input_snapshot=lambda:snapshot; C.G.snapshot_digest=lambda _r:digest
    with tempfile.TemporaryDirectory(prefix="v6-snapshot-fields-") as temporary:
        d=Path(temporary); good={"input_snapshot_commit":C.G.SNAPSHOT_COMMIT,"input_snapshot_sha256":digest}; P.atomic_write(d/"launch.json",P.pretty_json(good)); P.atomic_write(d/"terminal.json",P.pretty_json(good)); pre={"input_snapshot":snapshot,"input_snapshot_sha256":digest}; C.verify_omp_snapshot_fields(d,pre)
        for target,field in (("preflight","input_snapshot_sha256"),("launch","input_snapshot_commit"),("terminal","input_snapshot_sha256")):
            if target=="preflight": bad=dict(pre); bad[field]="bad"; rejects(lambda:C.verify_omp_snapshot_fields(d,bad),"preflight snapshot mutation","snapshot join")
            else:
                path=d/f"{target}.json"; value=P.load_json(path); value[field]="bad"; P.atomic_write(path,P.pretty_json(value)); rejects(lambda:C.verify_omp_snapshot_fields(d,pre),f"{target} snapshot mutation","snapshot join"); P.atomic_write(path,P.pretty_json(good))
    C.G.verify_input_snapshot=old_verify; C.G.snapshot_digest=old_digest
def open_app_corruption_test()->None:
    row=C.rows()[5]; names=("EVIDENCE","validate_static","require_launch_authority","git_custody","active_row","installed","exact_reservation","fail_app"); old={name:getattr(C,name) for name in names}; old_verify=C.V.verify_row
    with tempfile.TemporaryDirectory(prefix="v6-open-corrupt-") as temporary:
        C.EVIDENCE=Path(temporary)/"evidence"; d=C.row_dir(row); d.mkdir(parents=True); P.atomic_write(d/"reservation.json",P.pretty_json({"schema_id":"pm.r10.storage_pipeline.reservation.v2",**{k:row[k] for k in C.IDENTITY}})); before={p.relative_to(C.EVIDENCE).as_posix():p.read_bytes() for p in C.EVIDENCE.rglob("*") if p.is_file()}; C.validate_static=lambda **_:{"status":"TEST"}; C.require_launch_authority=lambda _r:None; C.git_custody=lambda:{}; C.exact_reservation=lambda _r:True
        @contextlib.contextmanager
        def noop(*_a): yield
        C.active_row=C.installed=noop; C.V.verify_row=lambda *_:(_ for _ in ()).throw(C.MatrixError("corrupt prior PASS")); C.fail_app=lambda _r,_e:(P.atomic_write(d/"runner_failure.json",b"consumed\n") or P.atomic_write(d/"terminal.json",b"consumed\n") or False)
        try:
            output=io.StringIO()
            with contextlib.redirect_stdout(output): rc=C._dispatch(["codex-wait-request",str(row["ordinal"])])
            after={p.relative_to(C.EVIDENCE).as_posix():p.read_bytes() for p in C.EVIDENCE.rglob("*") if p.is_file()}; check(rc==1 and "FAIL_CONSUMED_STOP_SUFFIX" in output.getvalue() and set(after)-set(before)=={f'{row["pass_id"]}/{row["route_id"]}/runner_failure.json',f'{row["pass_id"]}/{row["route_id"]}/terminal.json'} and "createThread" not in output.getvalue(),"reserved App corruption consumes without external request")
        finally:
            for name,value in old.items(): setattr(C,name,value)
            C.V.verify_row=old_verify
def late_mcp_test()->None:
    import shutil
    row=C.rows()[3]
    with tempfile.TemporaryDirectory(prefix="v6-late-mcp-") as temporary:
        d=Path(temporary)/"row"; shutil.copytree(C.V3/"evidence/pass_01/omp_mimo_v25_free_high",d); (d/"composer_ack.raw").write_bytes((d/"composer_ack.raw").read_bytes()+b"MCP finished")
        with C.selected(row): rejects(lambda:C.verify_omp_raw(d,C.route_map()[row["route_id"]],P.load_json(d/"launch.json"),P.load_json(d/"terminal.json")),"late MCP mutation","late/fabricated MCP banner")
def context_test()->None:
    frozen=C.rows(); current=frozen[7]; seen=[]; names=("EVIDENCE","git_custody","verify_omp_receipt","verify_app_launch","verify_issued","verify_issued_journal","mixed_journal","active_row"); old={name:getattr(C,name) for name in names}; old_v=(C.V.verify_row,C.V.verify_launch_journal,C.V.verify_evidence_tree,C.V.verify_global_uniqueness,C.app.verify_direct_evidence)
    with tempfile.TemporaryDirectory(prefix="v6-prefix-") as temporary:
        C.EVIDENCE=Path(temporary)/"evidence"; C.EVIDENCE.mkdir(); journal=[]
        for row in frozen[:3]: C.row_dir(row).mkdir(parents=True); P.atomic_write(C.row_dir(row)/"terminal.json",P.pretty_json({"status":"PASS"})); journal.append({**{k:row[k] for k in C.IDENTITY},"launch_sha256":"x","omp_preflight_sha256":"y"})
        P.atomic_write(C.EVIDENCE/"launch_journal.jsonl",P.jsonl_bytes(journal)); C.git_custody=lambda:{}
        @contextlib.contextmanager
        def active(row:dict):
            prior=C.CURRENT_ROW; C.CURRENT_ROW=row; seen.append(("enter",row["ordinal"]))
            try: yield
            finally: C.CURRENT_ROW=prior; seen.append(("exit",row["ordinal"]))
        C.active_row=active; C.V.verify_row=lambda p,r:{"status":"PASS","ordinal":next(x["ordinal"] for x in frozen if x["pass_id"]==p and x["route_id"]==r["id"]),"surface":r["surface"],"launch_sha256":"x","omp_preflight_sha256":"y"}; C.verify_omp_receipt=lambda *_:None; C.verify_app_launch=lambda *_:{}; C.verify_issued=lambda *_:{"record":{}}; C.verify_issued_journal=lambda *_:None; C.mixed_journal=lambda *_:None; C.V.verify_launch_journal=C.V.verify_evidence_tree=C.V.verify_global_uniqueness=lambda *_:None; C.app.verify_direct_evidence=lambda *_:{}
        try:
            with C.selected(current): check(C.verify_prefix()["row_count"]==3 and C.selected_row() is current,"prefix restoration")
            check(seen==[("enter",1),("exit",1),("enter",2),("exit",2),("enter",3),("exit",3)],"per-prior context")
        finally:
            for name,value in old.items(): setattr(C,name,value)
            C.V.verify_row,C.V.verify_launch_journal,C.V.verify_evidence_tree,C.V.verify_global_uniqueness,C.app.verify_direct_evidence=old_v
def snapshot_sequence_test()->None:
    first,second=C.rows()[0],C.rows()[1]; seen=[]
    with C.installed():
        with C.active_row(first): seen.append((C.selected_row()["ordinal"],C.G.rows()[0]["profile_dir"],C.G.SNAPSHOT_RECEIPT["materialized_root"])); check(Path(first["snapshot_dir"]).is_dir(),"prior snapshot materialized")
        check(not Path(first["snapshot_dir"]).exists(),"prior snapshot cleaned")
        with C.active_row(second): seen.append((C.selected_row()["ordinal"],C.G.rows()[0]["profile_dir"],C.G.SNAPSHOT_RECEIPT["materialized_root"])); check(Path(second["snapshot_dir"]).is_dir(),"current snapshot before Popen seam")
        check(not Path(second["snapshot_dir"]).exists(),"current snapshot cleaned")
    check(seen==[(1,first["profile_dir"],first["snapshot_dir"]),(2,second["profile_dir"],second["snapshot_dir"])],"prior cleanup then current route/profile snapshot")
def snapshot_failure_cleanup_test()->None:
    row=C.rows()[0]; target=Path(row["snapshot_dir"]); check(not target.exists() and not C.G.SNAPSHOT_OWNED and C.G.SNAPSHOT_RECEIPT is None,"clean snapshot fault precondition"); old=C.G.materialize_snapshot
    def broken(path:Path,_records:list)->None: path.mkdir(); (path/"partial").write_text("partial"); raise C.MatrixError("injected materialization fault")
    C.G.materialize_snapshot=broken
    try:
        with C.installed(),C.selected(row): rejects(C.G.prepare_input_snapshot,"snapshot materialization fault","injected materialization fault")
        check(not target.exists() and not C.G.SNAPSHOT_OWNED and C.G.SNAPSHOT_RECEIPT is None and not C.EVIDENCE.exists(),"fault cleanup before reservation/evidence")
    finally: C.G.materialize_snapshot=old
def post_pass_test()->None:
    row=C.rows()[0]; names=("EVIDENCE","validate_static","verify_prefix","require_launch_authority","git_custody","claim_after_failure","active_row","installed"); old={name:getattr(C,name) for name in names}; old_runtime=C.G.current_runtime_preflight; old_run=C.base.run_row; old_record=C.base.record_failure
    with tempfile.TemporaryDirectory(prefix="v6-post-pass-") as temporary:
        C.EVIDENCE=Path(temporary)/"evidence"; d=C.row_dir(row); d.mkdir(parents=True); P.atomic_write(d/"terminal.json",P.pretty_json({"status":"PASS","immutable":True})); before=(d/"terminal.json").read_bytes(); state=[{"row_count":0}]; calls=[]
        C.validate_static=lambda **_:{"status":"TEST"}; C.verify_prefix=lambda:state.pop() if state else (_ for _ in ()).throw(C.MatrixError("post-PASS verifier fault")); C.require_launch_authority=lambda _r:None; C.git_custody=lambda:{}; C.claim_after_failure=lambda *_:True; C.G.current_runtime_preflight=lambda:{"status":"PASS_OMP_RUNTIME_18_0_7","subject_calls":0}; C.base.run_row=lambda *_:{"status":"PASS"}; C.base.record_failure=lambda *_:calls.append("record")
        @contextlib.contextmanager
        def noop(*_a): yield
        C.active_row=C.installed=noop
        try:
            output=io.StringIO()
            with contextlib.redirect_stdout(output): rc=C._dispatch(["run","1","--max-seconds","3600"])
            check(rc==1 and "HOLD_POST_PASS_CONTROLLER_FAULT" in output.getvalue() and (d/"terminal.json").read_bytes()==before and calls==[] and (C.EVIDENCE/"HOLD.json").is_file(),"post-PASS isolation")
        finally:
            for name,value in old.items(): setattr(C,name,value)
            C.G.current_runtime_preflight=old_runtime; C.base.run_row=old_run; C.base.record_failure=old_record
    app_row=C.rows()[5]; old_evidence=C.EVIDENCE
    with tempfile.TemporaryDirectory(prefix="v6-app-post-pass-") as temporary:
        C.EVIDENCE=Path(temporary)/"evidence"; d=C.row_dir(app_row); d.mkdir(parents=True); P.atomic_write(d/"terminal.json",P.pretty_json({"status":"PASS","immutable":True})); before=(d/"terminal.json").read_bytes()
        try: C.fail_app(app_row,C.MatrixError("late App global verifier fault")); check((d/"terminal.json").read_bytes()==before and (C.EVIDENCE/"HOLD.json").is_file(),"App post-PASS HOLD without mutation"); rejects(C.verify_prefix,"App HOLD blocks suffix","matrix HOLD")
        finally: C.EVIDENCE=old_evidence
    names=("EVIDENCE","validate_static","require_launch_authority","git_custody","claim_after_failure","active_row","installed","exact_reservation","verify_open_app","verify_issued","app_budget","ingest","verify_prefix"); old={name:getattr(C,name) for name in names}
    with tempfile.TemporaryDirectory(prefix="v6-app-dispatch-pass-") as temporary:
        C.EVIDENCE=Path(temporary)/"evidence"; d=C.row_dir(app_row); d.mkdir(parents=True); P.atomic_write(d/"launch.json",P.pretty_json({"git_custody":{}})); C.validate_static=lambda **_:{"status":"TEST"}; C.require_launch_authority=lambda _r:None; C.git_custody=lambda:{}; C.claim_after_failure=lambda *_:True; C.exact_reservation=lambda _r:True; C.verify_open_app=lambda *_:{}; C.verify_issued=lambda *_:{}; C.app_budget=lambda _d:None
        @contextlib.contextmanager
        def noop(*_a): yield
        C.active_row=C.installed=noop; C.ingest=lambda *_:(P.atomic_write(d/"terminal.json",P.pretty_json({"status":"PASS","immutable":True})) or {"status":"PASS"}); C.verify_prefix=lambda:(_ for _ in ()).throw(C.MatrixError("late App global prefix fault"))
        try:
            output=io.StringIO(); old_stdin=C.sys.stdin; C.sys.stdin=io.TextIOWrapper(io.BytesIO(b"receipt"))
            with contextlib.redirect_stdout(output): rc=C._dispatch(["codex-ingest-raw2",str(app_row["ordinal"])])
            C.sys.stdin=old_stdin
            check(rc==1 and "HOLD_POST_PASS_CONTROLLER_FAULT" in output.getvalue() and P.load_json(d/"terminal.json")["immutable"] is True and (C.EVIDENCE/"HOLD.json").is_file(),f"end-to-end App post-PASS HOLD rc={rc} output={output.getvalue()!r}")
        finally:
            C.sys.stdin=old_stdin
            for name,value in old.items(): setattr(C,name,value)
def main()->None:
    check(C.validate_static()["status"]=="PASS_LOCAL_MATRIX_V6_PRELAUNCH","static"); check(C.verify_prefix()["row_count"]==0,"empty prefix"); oracle=P.load_json(C.V7/"oracle.json"); top={k:oracle[k] for k in reversed(list(oracle))}; varied="  PM_RESULT\t"+json.dumps(top,separators=(",",":"))+"  "; pretty="PM_RESULT \n"+json.dumps(top,indent=2); pretty_crlf=pretty.replace("\n","\r\n"); check(app_normalize("PM_RESULTS is prose\n"+varied+"\nafter")["final_text"]==canonical() and omp_replay(varied)["final_text"]==canonical(),"benign key/prose/location replay"); check(app_normalize(pretty)["final_text"]==canonical() and omp_replay(pretty_crlf+"\r\nfollowing prose")["final_text"]==canonical(),"LF/CRLF pretty multiline semantic replay"); check(C.N.typed_equal({"outer":{"a":1,"b":2}},{"outer":{"b":2,"a":1}}),"nested object order benign"); check(app_normalize(canonical(),(varied,))["result_normalization"]["candidate_count"]==2,"semantic duplicates"); changed=dict(oracle); changed["blocker_codes"]=list(reversed(changed["blocker_codes"])); rejects(lambda:app_normalize("PM_RESULT "+json.dumps(changed,separators=(",",":"))),"list reorder strict"); rejects(lambda:app_normalize(canonical()+"\nPM_RESULT {}"),"conflict"); rejects(lambda:app_normalize("PM_RESULT {\n\"x\":NaN\n}"),"multiline nonfinite"); rejects(lambda:app_normalize("PM_RESULT {\n\"x\":1,\n\"x\":1\n}"),"multiline duplicate"); rejects(lambda:app_normalize("PM_RESULT {\n\"schema_id\":"),"truncated"); rejects(lambda:app_normalize(canonical()+" garbage"),"extra same-line"); rejects(lambda:app_normalize("none"),"missing"); cursor_test(); issuance_test(); aggregate_limit_test(); app_pipeline_test(); transitive_contract_test(); omp_snapshot_mutations(); open_app_corruption_test(); late_mcp_test(); context_test(); snapshot_sequence_test(); snapshot_failure_cleanup_test(); post_pass_test(); print(P.canonical_json({"status":"PASS_MATRIX_V6_SELFTEST","tests":52,"subject_calls":0,"qualification_credit":0}))
if __name__=="__main__": main()
