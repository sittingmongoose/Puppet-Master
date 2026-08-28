#!/usr/bin/env python3
from __future__ import annotations
import builtins, contextlib, copy, io, json, os, shutil, subprocess, tempfile
from pathlib import Path
import controller as C
P=C.P
REAL_SENTINEL_RECEIPT:dict[str,object]={}

def check(value:bool,message:str)->None:
    if not value: raise AssertionError(message)
def rejects(call,message:str,needle:str|None=None)->None:
    try: call()
    except Exception as exc:
        if needle: check(needle in str(exc),message)
        return
    raise AssertionError(message)
def marker(value:dict,**kwargs:object)->str: return "PM_RESULT "+json.dumps(value,**kwargs)

def semantic_text(text:str,earlier:tuple[str,...]=(),post_call:str|None=None)->dict:
    entries=[{"type":"message","id":f"entry-{index}","message":{"role":"assistant","id":f"message-{index}","content":[{"type":"text","text":value}]}} for index,value in enumerate((*earlier,text),1)]
    entries[-1]["message"]["content"].append({"type":"toolCall","id":"goal-call","name":"goal","arguments":{"op":"complete"}})
    if post_call is not None: entries[-1]["message"]["content"].append({"type":"text","text":post_call})
    original=C.omp_session.load_physical_session
    try:
        C.omp_session.load_physical_session=lambda _path:(None,None,entries,text.encode())
        return C.semantic_normalize(Path("selftest.raw"),{"assistant_message_count":len(entries),"final_text":text},oracle_path=C.V7/"oracle.json",schema_path=C.V7/"response.schema.json",max_text_block_utf8_bytes=P.load_json(C.V7/"matrix.json")["max_final_assistant_utf8_bytes"])
    finally: C.omp_session.load_physical_session=original

def semantic_tests()->None:
    oracle=P.load_json(C.V7/"oracle.json"); canonical=marker(oracle,separators=(",",":")); reverse={key:oracle[key] for key in reversed(list(oracle))}
    pretty="PM_RESULT \r\n"+json.dumps(reverse,indent=2)+"\r\nprose after"; normalized=semantic_text("prose before\n"+pretty); check(normalized["final_text"]==P.RESULT_PREFIX+(C.V7/"oracle.json").read_text().strip(),"benign pretty/reorder/prose/location")
    check(semantic_text(canonical+"\nprose\n"+marker(reverse))["result_normalization"]["candidate_count"]==2,"identical candidates")
    check(semantic_text("final prose",(canonical,))["assistant_message_count"]==2,"multi-assistant candidate")
    check(semantic_text("PM_RESULTS prose\nPM_RESULT_VALUE prose\n"+canonical)["result_normalization"]["marker_count"]==1,"identifier-suffix prose is not marker")
    for malformed in ("PM_RESULT:"+canonical,"PM_RESULT"+canonical,"PM_RESULT"+(" "*65)+canonical,"PM_RESULT []\n"+canonical,"PM_RESULT {\n"+canonical): rejects(lambda malformed=malformed:semantic_text(malformed),"every malformed marker rejects")
    rejects(lambda:semantic_text(canonical,post_call=canonical),"valid post-call candidate rejects","strictly precedes")
    rejects(lambda:semantic_text(canonical,post_call="PM_RESULT:"),"malformed post-call marker rejects")
    mutations=[]; missing=dict(oracle); missing.pop("source_match"); mutations.append(missing); mutations.append({**oracle,"extra":1}); mutations.append({**oracle,"source_match":1}); mutations.append({**oracle,"pre_worknode_disposition":"ready"}); reordered={**oracle,"blocker_codes":list(reversed(oracle["blocker_codes"]))}; mutations.append(reordered)
    for value in mutations: rejects(lambda value=value:semantic_text(marker(value)),"semantic mutation rejected")
    for raw in ('PM_RESULT {"schema_id":"x","schema_id":"x"}','PM_RESULT {"x":NaN}',canonical+' extra',canonical+'\nPM_RESULT {}','no candidate'):
        rejects(lambda raw=raw:semantic_text(raw),"strict malformed/conflict/absence")

def prompt_lifecycle_tests()->None:
    prompt=C.PROMPT.read_text(); required='For this bounded task, the admitted receipts are the complete authoritative evidence and are sufficient for the required decision; do not access files. Native Goal completion is mandatory in the same assistant turn as your result: emit the required `PM_RESULT` candidate, then make one actual call to the provided `goal` tool as `goal({"op":"complete"})`.'
    check(prompt==C.expected_prompt() and prompt.count(required)==1,"exact prompt transform and Goal paragraph"); check(all(token not in prompt for token in ("final nonempty line","minified JSON","fields in this exact order")),"carrier brittleness removed")
    session=(C.V7/"omp_session.py").read_text(); runner=(C.V7/"omp_row_runner.py").read_text(); check(all(session.count(text)==1 for text in ("OMP exactly one Goal tool call","OMP exact Goal completion operation","OMP exactly one tool result","OMP Goal completed event","OMP one terminal session exit")),"independent lifecycle gates"); check(runner.count('control = b"\\x04"')==1 and runner.count('require(written_control == 1, "one Ctrl-D write")')==1,"exact Ctrl-D gate")

def frozen_tests()->None:
    planned=C.rows()[0]
    with C.installed(),C.active_row(planned):
        receipt=C.verify_selected_pipeline(); check(receipt["entry_count"]==6097 and receipt["git_objects_only"] is True and receipt["materialized_root"]==planned["snapshot_dir"],"complete Git-object snapshot")
        original=C.G.verify_input_snapshot; forged=dict(receipt); forged["entry_count"]=6096; C.G.verify_input_snapshot=lambda:forged
        try: rejects(C.verify_selected_pipeline,"forged snapshot rejected","receipt")
        finally: C.G.verify_input_snapshot=original
        check(C.base.HERE is C.RUNTIME_ROOT and C.G.V7 is C.RUNTIME_ROOT and os.fspath(C.RUNTIME_ROOT)==str(C.V7),"exact runtime/prompt root binding")
        live_v7=C.REPO/C.G.snapshot["source_manifest"]["path"]
        for call in (lambda:builtins.open(live_v7,"rb"),lambda:io.open(live_v7,"rb"),lambda:os.open(live_v7,os.O_RDONLY),lambda:os.stat(live_v7)):
            with C.G.forbid_live_plan_reads(): rejects(call,"working-tree V7 fallback accepted","forbidden")
    check(not os.path.lexists(planned["snapshot_dir"]) and not C.G.SNAPSHOT_OWNED and C.G.SNAPSHOT_RECEIPT is None,"snapshot cleanup/restoration")

def snapshot_failure_cleanup_test()->None:
    planned=C.rows()[0]; target=Path(planned["snapshot_dir"]); check(not target.exists() and not C.G.SNAPSHOT_OWNED,"clean snapshot fault precondition"); original=C.G.materialize_snapshot
    def broken(*_args,**_kwargs):
        target.mkdir(); C.G.SNAPSHOT_OWNED=True; raise C.G.ControllerError("injected materialization fault")
    C.G.materialize_snapshot=broken
    try:
        with C.installed(),C.selected(planned): rejects(C.G.prepare_input_snapshot,"snapshot materialization fault","injected materialization fault")
        check(not target.exists() and not C.G.SNAPSHOT_OWNED and C.G.SNAPSHOT_RECEIPT is None and not C.EVIDENCE.exists(),"partial snapshot cleanup before reservation")
    finally: C.G.materialize_snapshot=original

def snapshot_join_mutations()->None:
    snapshot={"materialized_root":"/tmp/frozen","live_plans_open_or_read_count":0}; digest="d"*64; original=(C.G.verify_input_snapshot,C.G.snapshot_digest); C.G.verify_input_snapshot=lambda:snapshot; C.G.snapshot_digest=lambda _receipt:digest
    try:
        with tempfile.TemporaryDirectory(prefix="pm-r10-v8-snapshot-fields-") as temporary:
            directory=Path(temporary); dependency=C.DB.verify(); dependency_digest=P.sha256_bytes((P.canonical_json(dependency)+"\n").encode()); preflight={"input_snapshot":snapshot,"input_snapshot_sha256":digest,"dependency_snapshot":dependency,"dependency_snapshot_sha256":dependency_digest,"popen_state_receipt_sha256":"e"*64}; P.atomic_write(directory/"omp_preflight.json",P.pretty_json(preflight)); preflight_sha=P.sha256_file(directory/"omp_preflight.json"); good={"input_snapshot_commit":C.G.SNAPSHOT_COMMIT,"input_snapshot_sha256":digest,"dependency_snapshot":dependency,"dependency_snapshot_sha256":dependency_digest,"final_omp_preflight_sha256":preflight_sha,"popen_state_receipt_sha256":"e"*64}; P.atomic_write(directory/"launch.json",P.pretty_json(good)); P.atomic_write(directory/"terminal.json",P.pretty_json(good)); C.verify_omp_snapshot_fields(directory,preflight)
            bad=dict(preflight); bad["input_snapshot_sha256"]="bad"; rejects(lambda:C.verify_omp_snapshot_fields(directory,bad),"preflight snapshot mutation","snapshot join")
            for name,field in (("launch.json","input_snapshot_commit"),("terminal.json","input_snapshot_sha256")):
                value=P.load_json(directory/name); value[field]="bad"; P.atomic_write(directory/name,P.pretty_json(value)); rejects(lambda:C.verify_omp_snapshot_fields(directory,preflight),f"{name} snapshot mutation","snapshot join"); P.atomic_write(directory/name,P.pretty_json(good))
            for name,field in (("launch.json","final_omp_preflight_sha256"),("terminal.json","popen_state_receipt_sha256")):
                value=P.load_json(directory/name); value[field]="bad"; P.atomic_write(directory/name,P.pretty_json(value)); rejects(lambda:C.verify_omp_snapshot_fields(directory,preflight),f"{name} finalized preflight mutation","preflight/Popen-state joins"); P.atomic_write(directory/name,P.pretty_json(good))
    finally: C.G.verify_input_snapshot,C.G.snapshot_digest=original

@contextlib.contextmanager
def isolated_evidence():
    prior=C.EVIDENCE
    with tempfile.TemporaryDirectory(prefix="pm-r10-fallback-v14-selftest-") as temporary:
        C.EVIDENCE=Path(temporary)/"evidence"
        try: yield
        finally: C.EVIDENCE=prior

def popen_tests()->None:
    global REAL_SENTINEL_RECEIPT
    planned=C.rows()[0]; route=C.route_map()[planned["route_id"]]; saved=(C.DISPATCH_CUSTODY,C.G.SNAPSHOT_OWNED,C.G.SNAPSHOT_RECEIPT,C.G.verify_input_snapshot,C.G.ORIGINAL_POPEN,C.G.ORIGINAL_RUN,C.G.ORIGINAL_ATOMIC,C.git_custody,C.base.utc_now)
    with isolated_evidence(),C.installed(),C.selected(planned):
        seed=C.G.prepare_profile(); seed_map={Path(item["path"]).name:item for item in seed["seed_records"]}; seed_base=[{"path":name,**{key:seed_map[name][key] for key in ("mode","bytes","sha256")}} for name in ("agent.db","config.yml","models.db","models.yml")]; custody={"candidate_commit":"sentinel","sources":[],"dependencies":[]}; snapshot={"commit":C.spec()["snapshot"]["commit"],"entry_count":6097,"git_objects_only":True,"live_plans_open_or_read_count":0,"materialized_root":planned["snapshot_dir"]}; directory=C.row_dir(planned); directory.mkdir(parents=True); initial={"observed_at_utc":"2026-08-28T00:00:00.000Z","git_custody":custody,"profile_seed":seed,"preflight_profile_state":{"immutable_profile_records":seed_base,"sqlite_sidecar_records":[]},"input_snapshot":snapshot,"input_snapshot_sha256":C.G.snapshot_digest(snapshot)}; P.atomic_write(directory/"omp_preflight.json",P.pretty_json(initial)); calls=[]
        C.DISPATCH_CUSTODY=custody; C.G.SNAPSHOT_OWNED=True; C.G.SNAPSHOT_RECEIPT=snapshot; C.G.verify_input_snapshot=lambda:snapshot; C.git_custody=lambda:custody; C.G.ORIGINAL_POPEN=lambda argv,*args,**kwargs:calls.append(kwargs["cwd"]) or object(); C.base.utc_now=lambda:"2026-08-28T00:01:26.772Z"
        try:
            argv=C.expected_argv(route,planned); C.SPROXY.Popen(argv,cwd=C.RUNTIME_ROOT,env={}); check(calls==[C.RUNTIME_ROOT],"exact-state 86.771s Popen sentinel once")
            final=P.load_json(directory/"omp_preflight.json"); state=final["popen_state_receipt"]; launch={"started_at_utc":"2026-08-28T00:01:26.771Z","final_omp_preflight_sha256":P.sha256_file(directory/"omp_preflight.json")}; check(C.verify_popen_state(final,launch,planned,custody)==state and [item["path"] for item in state["sqlite_sidecar_records"]]==["agent.db-shm","agent.db-wal"],"real OMP queries bind SQLite sidecars and reach fake Popen once"); REAL_SENTINEL_RECEIPT={"popen_count":len(calls),"popen_state_receipt_sha256":final["popen_state_receipt_sha256"],"sqlite_sidecar_records":copy.deepcopy(state["sqlite_sidecar_records"])}
            rejects(lambda:C.verify_popen_state(final,{**launch,"started_at_utc":"2026-08-28T00:01:26.773Z"},planned,custody),"launch after Popen-state rejected","chronology"); rejects(lambda:C.verify_popen_state(final,{**launch,"started_at_utc":"2026-08-27T23:59:59.999Z"},planned,custody),"launch before preflight rejected","chronology")
            captured=[]; C.G.ORIGINAL_ATOMIC=lambda path,value:captured.append((path,copy.deepcopy(value))); supplied={"started_at_utc":"2026-08-28T00:01:26.771Z"}; C.atomic_json(directory/"launch.json",supplied); check(supplied["started_at_utc"]=="2026-08-28T00:01:26.771Z" and captured[0][1]["started_at_utc"]==supplied["started_at_utc"],"atomic_json preserves runner-supplied launch timestamp byte-for-byte")
            for mutation in ("missing","extra"):
                bad=copy.deepcopy(final)
                if mutation=="missing": bad.pop("popen_state_receipt")
                else: bad["popen_state_receipt"]["extra"]=True; bad["popen_state_receipt_sha256"]=C.popen_state_sha256(bad["popen_state_receipt"])
                rejects(lambda bad=bad:C.verify_popen_state(bad,launch,planned,custody),f"Popen receipt {mutation} rejected")
            for field in state:
                bad=copy.deepcopy(final); bad["popen_state_receipt"][field]="changed" if state[field] is None else None; bad["popen_state_receipt_sha256"]=C.popen_state_sha256(bad["popen_state_receipt"]); rejects(lambda bad=bad:C.verify_popen_state(bad,launch,planned,custody),f"Popen-state {field} mutation rejected")
            for label,mutate in (
                ("immutable missing",lambda value:value["popen_state_receipt"]["immutable_profile_records"].pop()),
                ("immutable extra",lambda value:value["popen_state_receipt"]["immutable_profile_records"].append(copy.deepcopy(value["popen_state_receipt"]["immutable_profile_records"][0]))),
                ("immutable hash",lambda value:value["popen_state_receipt"]["immutable_profile_records"][0].update(sha256="0"*64)),
                ("sidecar hash",lambda value:value["popen_state_receipt"]["sqlite_sidecar_records"][0].update(sha256="0"*64)),
                ("sidecar extra",lambda value:value["popen_state_receipt"]["sqlite_sidecar_records"].append({"path":"other","mode":"0o600","bytes":0,"sha256":"0"*64})),
            ):
                bad=copy.deepcopy(final); mutate(bad); bad["popen_state_receipt_sha256"]=C.popen_state_sha256(bad["popen_state_receipt"]); rejects(lambda bad=bad:C.verify_popen_state(bad,launch,planned,custody),f"Popen-state nested {label} rejected")
            bad=copy.deepcopy(final); bad["popen_state_receipt_sha256"]="0"*64; rejects(lambda:C.verify_popen_state(bad,launch,planned,custody),"Popen-state altered hash rejected")
            runtime=C.spec()["runtime"]; last_key=next(reversed(runtime["effective_config"])); profile=Path(planned["profile_dir"])
            for kind in ("missing","extra","symlink","special","base_mutation"):
                for field in ("profile_dir",*C.ENV_FIELDS): shutil.rmtree(planned[field],ignore_errors=True)
                fresh_seed=C.G.prepare_profile(); fresh_map={Path(item["path"]).name:item for item in fresh_seed["seed_records"]}; fresh_base=[{"path":name,**{key:fresh_map[name][key] for key in ("mode","bytes","sha256")}} for name in ("agent.db","config.yml","models.db","models.yml")]; fresh={"observed_at_utc":"2026-08-28T00:00:00.000Z","git_custody":custody,"profile_seed":fresh_seed,"preflight_profile_state":{"immutable_profile_records":fresh_base,"sqlite_sidecar_records":[]},"input_snapshot":snapshot,"input_snapshot_sha256":C.G.snapshot_digest(snapshot)}; P.atomic_write(directory/"omp_preflight.json",P.pretty_json(fresh))
                def mutation_run(command,*_args,kind=kind,**_kwargs):
                    if command[-1]=="--version": return subprocess.CompletedProcess(command,0,runtime["version"]+"\n","")
                    key=command[-1]; value=runtime["effective_config"][key]; raw=P.canonical_json(value) if isinstance(value,(dict,list,bool)) else str(value)
                    if key==last_key:
                        if kind=="missing": (profile/"models.db").unlink()
                        elif kind=="extra": (profile/"foreign").write_bytes(b"x"); os.chmod(profile/"foreign",0o600)
                        elif kind=="symlink": os.symlink("agent.db",profile/"agent.db-shm")
                        elif kind=="special": os.mkfifo(profile/"agent.db-shm",0o600)
                        else: (profile/"config.yml").write_bytes((profile/"config.yml").read_bytes()+b"\n")
                    return subprocess.CompletedProcess(command,0,raw+"\n","")
                C.G.ORIGINAL_RUN=mutation_run; rejects(lambda:C.SPROXY.Popen(argv,cwd=C.RUNTIME_ROOT,env={}),f"post-query profile {kind} rejected","profile"); check(len(calls)==1,f"{kind} rejected before subject Popen")
            rejects(lambda:C.SPROXY.Popen(argv,cwd=C.HERE,env={}),"wrong cwd rejected","exact V7"); C.DISPATCH_CUSTODY={"candidate_commit":"drift"}; rejects(lambda:C.SPROXY.Popen(argv,cwd=C.RUNTIME_ROOT,env={}),"custody drift rejected","custody"); check(len(calls)==1,"no Popen after any failed state gate")
        finally:
            C.DISPATCH_CUSTODY,C.G.SNAPSHOT_OWNED,C.G.SNAPSHOT_RECEIPT,C.G.verify_input_snapshot,C.G.ORIGINAL_POPEN,C.G.ORIGINAL_RUN,C.G.ORIGINAL_ATOMIC,C.git_custody,C.base.utc_now=saved
            for field in ("profile_dir",*C.ENV_FIELDS): shutil.rmtree(planned[field],ignore_errors=True)

def runtime_catalog_tests()->None:
    runtime=C.spec()["runtime"]; original_run=C.G.ORIGINAL_RUN; calls=[]
    def runtime_run(argv,*_args,**_kwargs):
        calls.append(argv)
        if argv[-1]=="--version": return subprocess.CompletedProcess(argv,0,"omp/18.0.7\n","")
        key=argv[-1]; value=runtime["source_effective_config"][key]
        raw=json.dumps(value,separators=(",",":")) if not isinstance(value,str) else value
        return subprocess.CompletedProcess(argv,0,raw+"\n","")
    C.G.ORIGINAL_RUN=runtime_run
    try:
        receipt=C.current_runtime_preflight(); check(receipt["effective_config"]==runtime["source_effective_config"] and len(receipt["commands"])==9 and len(calls)==10,"production source runtime preflight through safe stub")
    finally: C.G.ORIGINAL_RUN=original_run
    original_spec=C.spec; original_g_spec=C.G.spec
    try:
        for mutation in ("missing","changed"):
            altered=copy.deepcopy(original_spec())
            if mutation=="missing": altered["runtime"]["source_effective_config"].pop("advisor.enabled")
            else: altered["runtime"]["source_effective_config"]["advisor.enabled"]=True
            C.spec=lambda altered=altered:altered; C.G.spec=C.spec
            rejects(C.current_runtime_preflight,f"runtime contract {mutation} rejected")
    finally: C.spec=original_spec; C.G.spec=original_g_spec
    check(C.spec()["catalog_gate"]["enabled"] is False and C.spec()["runtime"]["models_yml"]=={"bytes":144,"sha256":"f1a585a1ec9c1a89f2d7533322bad3b7897117cd5fe3e1899bf6bf1139969a69","mode":"0o600","git_commit":"4beba8892ec3fd82a5b83c6ec403b4ebd56e7512","git_blob":"f71494ecbb66cbed545bdfa72bd09de0b65cf971"},"GLM models override/no MiMo catalog")

def diagnostic_journal_tests()->None:
    planned=C.rows()[0]; report={"ordinal":1,"route_id":planned["route_id"],"attempt_id":planned["attempt_id"],"nonce":planned["nonce"],"started_at_utc":"2026-08-28T00:00:01.000Z","launch_sha256":"a"*64,"omp_preflight_sha256":"b"*64,"pid":4321}; grouped=[{"pass_id":"qualification_01","rows":[report]}]
    entry={"schema_id":"pm.r10.storage_pipeline.launch_journal.v2","pass_id":"qualification_01",**{key:planned[key] for key in ("ordinal","route_id","attempt_id","nonce")},"started_at_utc":report["started_at_utc"],"launch_sha256":report["launch_sha256"],"omp_preflight_sha256":report["omp_preflight_sha256"],"popen_observed":True,"pid":4321}
    with isolated_evidence():
        directory=C.row_dir(planned); directory.mkdir(parents=True); P.atomic_write(directory/"reservation.json",P.pretty_json({"reserved_at_utc":"2026-08-28T00:00:00.000Z"})); P.atomic_write(directory/"launch.json",P.pretty_json({"started_at_utc":report["started_at_utc"]})); P.atomic_write(directory/"terminal.json",P.pretty_json({"finished_at_utc":"2026-08-28T00:00:02.000Z"})); P.atomic_write(C.EVIDENCE/"launch_journal.jsonl",(P.canonical_json(entry)+"\n").encode())
        C.verify_diagnostic_launch_journal(grouped)
        rejects(lambda:C.verify_diagnostic_launch_journal([{"pass_id":"pass_01","rows":[report]}]),"pass_01 journal grouping rejected","one diagnostic")
        P.atomic_write(C.EVIDENCE/"launch_journal.jsonl",(P.canonical_json(entry)+"\n"+P.canonical_json(entry)+"\n").encode()); rejects(lambda:C.verify_diagnostic_launch_journal(grouped),"extra journal row rejected","exact length")
        for field,value in (("pass_id","pass_01"),("launch_sha256","c"*64),("popen_observed",False),("pid",0)):
            bad=dict(entry); bad[field]=value; P.atomic_write(C.EVIDENCE/"launch_journal.jsonl",(P.canonical_json(bad)+"\n").encode()); rejects(lambda:C.verify_diagnostic_launch_journal(grouped),f"journal {field} mutation rejected")

def failure_tests()->None:
    planned=C.rows()[0]
    with isolated_evidence(),C.installed(),C.selected(planned):
        C.row_dir(planned).mkdir(parents=True); session=Path(planned["session_dir"]); check(not os.path.lexists(session),"fresh postfailure session"); session.mkdir(); (session/"session.jsonl").write_bytes(b'{"raw":"failure"}\n')
        try: C.G.preserve_failure(planned); C.base.record_failure(planned["pass_id"],planned["route_id"],RuntimeError("pre-Popen sentinel"))
        finally: shutil.rmtree(session)
        failure=P.load_json(C.row_dir(planned)/"runner_failure.json"); terminal=P.load_json(C.row_dir(planned)/"terminal.json"); check(failure["popen_observed"] is False and terminal["status"]=="FAIL" and terminal["no_retry"] is True and terminal["qualification_credit"]==0 and (C.row_dir(planned)/"postfailure_session.raw.jsonl").read_bytes()==b'{"raw":"failure"}\n',"pre-Popen permanent failure and raw custody")
    with isolated_evidence(),C.installed(),C.selected(planned):
        C.row_dir(planned).mkdir(parents=True); C.base.record_failure(planned["pass_id"],planned["route_id"],C.base.PostPopenRunnerError(4321,RuntimeError("post-Popen sentinel"))); failure=P.load_json(C.row_dir(planned)/"runner_failure.json"); check(failure["popen_observed"] is True and failure["pid"]==4321,"post-Popen permanent failure")

def post_pass_hold_test()->None:
    planned=C.rows()[0]
    with isolated_evidence():
        C.row_dir(planned).mkdir(parents=True); terminal=P.pretty_json({"status":"PASS","qualification_credit":0}); P.atomic_write(C.row_dir(planned)/"terminal.json",terminal); calls=[0]
        saved=(C.validate_static,C.verify_prefix,C.validate_omp_paths,C.require_launch_authority,C.git_custody,C.installed,C.active_row,C.current_runtime_preflight,C.base.run_row)
        C.validate_static=lambda **_kwargs:{}
        def prefix():
            calls[0]+=1
            if calls[0]==1: return {"row_count":0}
            raise C.MatrixError("post-PASS verifier sentinel")
        C.verify_prefix=prefix; C.validate_omp_paths=lambda _row:{}; C.require_launch_authority=lambda _row:None; custody={"candidate_commit":"stable"}; C.git_custody=lambda:custody; C.installed=lambda:contextlib.nullcontext(); C.active_row=lambda _row:contextlib.nullcontext(); C.current_runtime_preflight=lambda:{"status":"PASS_OMP_RUNTIME_18_0_7","subject_calls":0}; C.base.run_row=lambda *_args:P.load_json(C.row_dir(planned)/"terminal.json")
        try:
            with contextlib.redirect_stdout(io.StringIO()): check(C._dispatch(["run","1","--max-seconds","3600"])==1,"post-PASS verifier returns HOLD failure")
        finally: C.validate_static,C.verify_prefix,C.validate_omp_paths,C.require_launch_authority,C.git_custody,C.installed,C.active_row,C.current_runtime_preflight,C.base.run_row=saved
        check((C.EVIDENCE/"HOLD.json").is_file() and (C.row_dir(planned)/"terminal.json").read_bytes()==terminal,"post-PASS HOLD and immutable terminal")

def lineage_tests()->None:
    fork=C.spec()["v6_fork_custody"]; check(fork["commit"]=="7a83f6d2d662d17b52c62e117d79242da1a9dda0","V6 parent pin"); review=C.pinned_json(fork["commit"],fork["failure_review"]["path"])[1]; evidence=review["evidence_custody"]; check(all(evidence[name]["sha256"] for name in ("journal","terminal","runner_failure","postfailure_session")),"V6 failure evidence blobs bound")
    check(C.verify_v8_prelaunch_failure_lineage()["status"]=="PASS_PINNED_V8_PRELAUNCH_FAILURE_LINEAGE","V8 prelaunch failure lineage")
    lineage=C.spec()["v8_prelaunch_failure_lineage"]; record,raw=C.pinned_record(lineage["commit"],lineage["path"]); value=P.strict_loads(raw.decode()); original=C.pinned_record
    try:
        missing=copy.deepcopy(value); missing["absence_custody"].pop("provider_call_absent"); C.pinned_record=lambda *_args:(record,P.pretty_json(missing)); rejects(C.verify_v8_prelaunch_failure_lineage,"V8 missing absence rejected","absence")
        mutated=copy.deepcopy(value); mutated["disposition"]["attempt_consumed"]=True; C.pinned_record=lambda *_args:(record,P.pretty_json(mutated)); rejects(C.verify_v8_prelaunch_failure_lineage,"V8 consumed mutation rejected","unconsumed")
    finally: C.pinned_record=original
    check(C.verify_development_lineage()["status"]=="PASS_NONQUALIFICATION_DEVELOPMENT_LINEAGE","GLM development lineage")
    original_load=P.load_json; lineage=original_load(C.HERE/"development_lineage.json")
    try:
        bad=copy.deepcopy(lineage); bad["development_passes"][0]["qualification_credit"]=1; P.load_json=lambda path:bad if Path(path).name=="development_lineage.json" else original_load(path); rejects(C.verify_development_lineage,"development credit mutation rejected","receipts")
    finally: P.load_json=original_load
    check(C.verify_v11_pre_popen_failure_lineage()["status"]=="PASS_V11_PRE_POPEN_FAILURE_ZERO_CREDIT_LINEAGE","V11 consumed pre-Popen failure lineage")
    frozen=C.spec()["v11_pre_popen_failure_lineage"]; original_record=C.file_record
    try:
        C.file_record=lambda path,root=None:{**original_record(path,root),"sha256":"0"*64} if Path(path).name=="runner_failure.json" else original_record(path,root); rejects(C.verify_v11_pre_popen_failure_lineage,"V11 evidence mutation rejected","custody")
    finally: C.file_record=original_record
    check(C.verify_v12_pre_popen_failure_lineage()["status"]=="PASS_V12_PRE_POPEN_FAILURE_ZERO_CREDIT_LINEAGE","V12 consumed pre-Popen failure lineage")
    try:
        C.file_record=lambda path,root=None:{**original_record(path,root),"sha256":"0"*64} if Path(path).name=="omp_preflight.json" else original_record(path,root); rejects(C.verify_v12_pre_popen_failure_lineage,"V12 evidence mutation rejected","custody")
    finally: C.file_record=original_record
    check(C.verify_v13_post_popen_failure_lineage()["status"]=="PASS_V13_POST_POPEN_FAILURE_ZERO_CREDIT_LINEAGE","V13 consumed post-Popen failure lineage")
    try:
        C.file_record=lambda path,root=None:{**original_record(path,root),"sha256":"0"*64} if Path(path).name=="session.raw.jsonl" else original_record(path,root); rejects(C.verify_v13_post_popen_failure_lineage,"V13 session mutation rejected","custody")
    finally: C.file_record=original_record

def dependency_bootstrap_tests()->None:
    import builtins, io as stdio
    receipt=C.DB.verify(); check(receipt==C.DEPENDENCY_RECEIPT and receipt["commit"]=="c71705e045480f7a73a0d7449d0cf7df048a9bc9" and receipt["tree_oid"]=="facc375e2335350d557eb9e51ccd0b076bbdba00" and receipt["file_count"]==28,"exact dependency snapshot")
    C.DB.verify_modules(); check(all(Path(getattr(__import__(name),"__file__")).resolve().is_relative_to(C.V7.resolve()) for name in C.DB.MODULES),"all V7 modules originate in bootstrap root")
    source=(C.HERE/"dependency_bootstrap.py").read_text(); check(all(token not in source for token in ("git archive","worktree","system_pipeline_sandbox_v7\" /","copytree")),"no archive/worktree/live fallback")
    live=(C.R10/"system_pipeline_sandbox_v7").resolve(); originals=(builtins.open,os.open,stdio.open)
    def guard(function):
        def wrapped(path,*args,**kwargs):
            try: candidate=Path(os.fspath(path)).resolve()
            except TypeError: return function(path,*args,**kwargs)
            if candidate==live or live in candidate.parents: raise AssertionError("live V7 read")
            return function(path,*args,**kwargs)
        return wrapped
    builtins.open,os.open,stdio.open=guard(builtins.open),guard(os.open),guard(stdio.open)
    try: check(C.DB.verify()==receipt,"open/os.open/io.open live guards")
    finally: builtins.open,os.open,stdio.open=originals
    target=C.V7/"oracle.json"; os.chmod(target,0o644); target.write_bytes(b"{}\n"); rejects(C.DB.verify,"dependency mutation rejected","dependency"); C.DB.cleanup(); check(not C.DB.BASE.exists(),"dependency cleanup after mutation")
    scripts=[
        "import dependency_bootstrap as D,types,sys;sys.modules['pipeline']=types.ModuleType('pipeline');\ntry:D.materialize();raise SystemExit(2)\nexcept RuntimeError:pass\nassert not D.BASE.exists()",
        "import dependency_bootstrap as D;D.BASE.mkdir();\ntry:D.materialize();raise SystemExit(2)\nexcept RuntimeError:pass\nD.cleanup();assert not D.BASE.exists()",
        "import dependency_bootstrap as D,tempfile,pathlib,os; t=tempfile.TemporaryDirectory();os.symlink(t.name,D.BASE);\ntry:D.materialize();raise SystemExit(2)\nexcept RuntimeError:pass\nD.BASE.unlink();t.cleanup()",
        "import dependency_bootstrap as D,os;D.materialize();p=D.ROOT/'extra';os.chmod(D.ROOT,0o755);p.write_bytes(b'x');\ntry:D.verify();raise SystemExit(2)\nexcept RuntimeError:pass\nD.cleanup();assert not D.BASE.exists()",
        "import dependency_bootstrap as D,tempfile,pathlib,os,stat;D.materialize();t=tempfile.TemporaryDirectory();v=pathlib.Path(t.name)/'victim';v.write_bytes(b'FOREIGN');os.chmod(v,0o640);p=D.ROOT/'oracle.json';os.chmod(D.ROOT,0o755);p.unlink();p.symlink_to(v);D.cleanup();assert v.read_bytes()==b'FOREIGN' and stat.S_IMODE(v.stat().st_mode)==0o640 and not D.BASE.exists();t.cleanup()",
        "import dependency_bootstrap as D,tempfile,pathlib,os,stat;D.materialize();t=tempfile.TemporaryDirectory();v=pathlib.Path(t.name)/'victim';v.write_bytes(b'FOREIGN');os.chmod(v,0o640);p=D.ROOT/'oracle.json';os.chmod(D.ROOT,0o755);p.unlink();os.link(v,p);assert v.stat().st_nlink==2;\ntry:D.verify();raise SystemExit(2)\nexcept RuntimeError:pass\nD.cleanup();assert v.read_bytes()==b'FOREIGN' and stat.S_IMODE(v.stat().st_mode)==0o640 and v.stat().st_nlink==1 and not p.exists() and not D.BASE.exists();t.cleanup()",
    ]
    for script in scripts:
        result=subprocess.run([os.sys.executable,"-B","-c",script],cwd=C.HERE,capture_output=True,text=True,check=False); check(result.returncode==0,"bootstrap fail-closed subprocess: "+result.stderr)
    check(not C.DB.BASE.exists() and not list(C.HERE.rglob("*.pyc")) and not list(C.HERE.rglob("__pycache__")),"dependency root/cache cleanup")

def main()->None:
    check(C.validate_static()["status"]=="PASS_FALLBACK_V14_PRELAUNCH","static"); prompt_lifecycle_tests(); semantic_tests(); frozen_tests(); snapshot_failure_cleanup_test(); snapshot_join_mutations(); popen_tests(); runtime_catalog_tests(); diagnostic_journal_tests(); failure_tests(); post_pass_hold_test(); lineage_tests(); dependency_bootstrap_tests(); print(P.canonical_json({"status":"PASS_FALLBACK_V14_SELFTEST","tests":130,"subject_calls":0,"qualification_credit":0,"real_popen_sentinel_receipt":REAL_SENTINEL_RECEIPT}))
if __name__=="__main__": main()
