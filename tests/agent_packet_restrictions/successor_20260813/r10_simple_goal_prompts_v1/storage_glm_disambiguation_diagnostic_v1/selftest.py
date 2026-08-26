#!/usr/bin/env python3
"""Zero-subject checks for native/GLM three-gate disambiguation."""
from __future__ import annotations
import contextlib, copy, io, os, subprocess, tempfile
from pathlib import Path
from typing import Any, Callable
import controller
P,V,R10,V7=controller.P,controller.V,controller.R10,controller.V7
OBJECTIVE=(V7/"prompts/omp.prompt.txt").read_text(encoding="utf-8")[len("/goal "):]
NATIVE_ROW=V7/"evidence/pass_01/omp_ox_alpha_free_max"
GLM_ROW=R10/"ox_owned_glm_reliability_v3/evidence/reliability_01/omp_ox_alpha_free_max"
OBS_ROW=R10/"muse_owned_glm_probe_v1/evidence/probe_01/omp_ox_alpha_free_max"
class TestFailure(RuntimeError): pass
def check(value: bool,message: str) -> None:
    if not value: raise TestFailure(message)
def expect(types: type[BaseException]|tuple[type[BaseException],...],call: Callable[[],Any],message: str,fragment: str|None=None) -> None:
    try: call()
    except types as exc:
        check(fragment is None or fragment in str(exc),f"wrong rejection: {message}"); return
    raise TestFailure(f"expected rejection: {message}")
def args(row_dir: Path,selector: str,thinking: str,require_exit: bool=True) -> dict[str,Any]:
    launch=P.load_json(row_dir/"launch.json"); provider,model=selector.split("/",1)
    return {"expected_cwd":launch["cwd"],"expected_objective":OBJECTIVE,"expected_provider":provider,"expected_model":model,"expected_selector":selector,"expected_thinking":thinking,"require_exit":require_exit}

def parser_checks() -> int:
    native_raw=(NATIVE_ROW/"session.raw.jsonl").read_bytes(); check(len(native_raw)==38353 and P.sha256_bytes(native_raw)=="472f2f99e46a04d8ad62ee054f115a8c166f1abaeeeaaf14238d7bdd0ad0f304","native fixture freeze")
    native=controller.NATIVE_VERIFY(NATIVE_ROW/"session.raw.jsonl",**args(NATIVE_ROW,"opencode-go/ox-alpha-free","max")); controller.base.exact_result(native["final_text"])
    check(native["assistant_lifecycle_shape"]=="standard_tool_cycle" and native["ordinary_tool_calls"]==0 and "owned_glm_goal_call" not in native,"unmodified V7 native parser")
    check(V.verify_row("pass_01",controller.route_map()["omp_ox_alpha_free_max"])["status"]=="PASS","full V7 native verifier replay")
    glm_raw=(GLM_ROW/"session.raw.jsonl").read_bytes(); check(len(glm_raw)==53071 and P.sha256_bytes(glm_raw)=="0e46e4d154bc2446d026922e42febcf81e750784e20ffba3e39d7ecd59728e33","GLM fixture freeze")
    glm=controller.projection.verify_session(GLM_ROW/"session.raw.jsonl",**args(GLM_ROW,"opencode-go/ox-alpha-free","max")); controller.base.exact_result(glm["final_text"])
    check(glm["owned_glm_goal_call"]=={"present":True,"bytes":82,"sha256":"d6897df63bd35ea8e7b3eb5e036068814b6ed65712b7876879d5f19afdc8e013"} and glm["owned_glm_post_call_framing"]["kind"]=="none","closed GLM replay")
    observed=controller.projection.verify_session(OBS_ROW/"postfailure_session.raw.jsonl",**args(OBS_ROW,"opencode-go/ox-alpha-free","max",False)); controller.base.exact_result(observed["final_text"])
    check(observed["owned_glm_post_call_framing"]["kind"]=="observation_open" and observed["owned_glm_post_call_framing"]["bytes"]==16,"closed observation framing")
    rows=controller.rows(); check(controller.session_verifier(rows[0]["cwd"]) is controller.NATIVE_VERIFY and all(controller.session_verifier(row["cwd"]) is controller.projection.verify_session for row in rows[1:]),"mixed parser order")
    ox=controller.route_map()["omp_ox_alpha_free_max"]; native_argv=controller.expected_argv(ox,rows[0]); glm_argv=controller.expected_argv(ox,rows[1])
    normalize=lambda values:["<fresh-runtime-path>" if isinstance(value,str) and value.startswith("/tmp/pm-r10-storage-v7-") else value for value in values]
    check("--config" not in native_argv and glm_argv[:3]==[native_argv[0],"--config",str(controller.OVERLAY)] and normalize(glm_argv[3:])==normalize(native_argv[1:]),"native then exact GLM argv")
    expect(controller.ControllerError,lambda:controller.session_verifier("/tmp/unknown"),"unknown transport identity")
    return 10

def journal_checks() -> int:
    original,checks=controller.EVIDENCE,0
    try:
        with tempfile.TemporaryDirectory(prefix="pm-r10-glm-disamb-journal-") as temporary:
            controller.EVIDENCE=Path(temporary)/"evidence"; controller.EVIDENCE.mkdir(); reports:list[dict[str,Any]]=[]; journal:list[dict[str,Any]]=[]
            for row in controller.rows():
                report={"ordinal":row["ordinal"],"started_at_utc":f"2026-08-26T15:30:0{row['ordinal']}.000Z","launch_sha256":f"launch-{row['ordinal']}","omp_preflight_sha256":f"preflight-{row['ordinal']}","pid":9300+row["ordinal"]}
                reports.append({"pass_id":row["pass_id"],"rows":[report]}); journal.append({"schema_id":"pm.r10.storage_pipeline.launch_journal.v2",**{field:row[field] for field in controller.IDENTITY},**{field:report[field] for field in ("started_at_utc","launch_sha256","omp_preflight_sha256","pid")},"popen_observed":True})
                P.atomic_write(controller.EVIDENCE/"launch_journal.jsonl",P.jsonl_bytes(journal)); controller.generic_journal(reports); checks+=1
            for change,label in ((lambda x:x.append(copy.deepcopy(x[-1])),"extra"),(lambda x:x[0].update({"nonce":"0"*32}),"identity"),(lambda x:x[1].update({"launch_sha256":"wrong"}),"launch hash"),(lambda x:x[2].update({"popen_observed":False}),"Popen"),(lambda x:x[2].update({"pid":0}),"PID")):
                candidate=copy.deepcopy(journal); change(candidate); P.atomic_write(controller.EVIDENCE/"launch_journal.jsonl",P.jsonl_bytes(candidate)); expect(controller.ControllerError,lambda:controller.generic_journal(reports),label); checks+=1
    finally: controller.EVIDENCE=original
    return checks

def dispatch_gate_checks() -> int:
    checks=0; current=controller.bindings(); originals=[(module,name,getattr(module,name)) for module,name,_ in current]
    try:
        with controller.installed(): check(all(getattr(module,name) is value for module,name,value in controller.bindings()),"bindings installed")
    finally: check(all(getattr(module,name) is value for module,name,value in originals),"bindings restored")
    checks+=2; check(controller.verify_prefix()["row_count"]==0,"zero prefix"); checks+=1
    saved=(subprocess.Popen,controller.validate_static,controller.git_custody,controller._prefix,controller.base.run_row,controller.require_authority,controller.EVIDENCE,controller.ORIGINAL_PREFLIGHT)
    popen:list[str]=[]; reached:list[tuple[int,int]]=[]
    def forbidden(*_args:Any,**_kwargs:Any)->Any: popen.append("Popen"); raise TestFailure("Popen reached")
    custody={"candidate_commit":"a"*40,"head":"a"*40,"origin_main":"a"*40,"truenas_backup_main":"a"*40,"sources":[]}
    try:
        expect(controller.ControllerError,controller.git_custody,"untracked custody"); checks+=1
        subprocess.Popen=forbidden  # type: ignore[assignment]
        controller.validate_static=lambda *,unused:{"subject_calls":0}; controller.git_custody=lambda:custody
        def consumed(pass_id:str,route_id:str,_seconds:int)->Any:
            ordinal=next(row["ordinal"] for row in controller.rows() if (row["pass_id"],row["route_id"])==(pass_id,route_id)); reached.append((prefix,ordinal)); raise controller.base.ReservationConflict("synthetic consumed")
        controller.base.run_row=consumed
        with contextlib.redirect_stdout(io.StringIO()):
            check(controller.dispatch(["run","1","--max-seconds","3599"])==1,"budget gate"); checks+=1
            for prefix in range(4):
                controller._prefix=lambda prefix=prefix:{"row_count":prefix}
                for ordinal in (1,2,3): check(controller.dispatch(["run",str(ordinal)])==1,f"gate {prefix}/{ordinal}"); checks+=1
        check(reached==[(0,1),(1,2),(2,3)],"only exact next gate reaches run_row"); checks+=1
        controller.require_authority=lambda _row:(_ for _ in ()).throw(controller.ControllerError("authority closed"))
        with contextlib.redirect_stdout(io.StringIO()): check(controller.dispatch(["run","1"])==1,"authority gate")
        checks+=1; controller.require_authority=saved[5]; controller.git_custody=lambda:(_ for _ in ()).throw(controller.ControllerError("unpushed"))
        with contextlib.redirect_stdout(io.StringIO()): check(controller.dispatch(["run","1"])==1,"custody gate")
        checks+=1; controller.DISPATCH_CUSTODY={"candidate_commit":"a"*40}; controller.git_custody=lambda:{"candidate_commit":"b"*40}; controller.ORIGINAL_PREFLIGHT=forbidden
        expect(controller.ControllerError,lambda:controller.row_preflight(Path("/tmp/never"),controller.rows()[0],controller.route_map()["omp_ox_alpha_free_max"]),"pre-Popen custody drift"); checks+=1
    finally:
        subprocess.Popen,controller.validate_static,controller.git_custody,controller._prefix,controller.base.run_row,controller.require_authority,controller.EVIDENCE,controller.ORIGINAL_PREFLIGHT=saved; controller.DISPATCH_CUSTODY=None
    check(not popen,"zero-subject gates never Popen"); check(all(getattr(module,name) is value for module,name,value in originals),"bindings restored after dispatch"); return checks+2

def failure_custody_checks() -> int:
    saved=(subprocess.Popen,controller.validate_static,controller.git_custody,controller._prefix,controller.base.run_row,controller.EVIDENCE); checks=0; popen:list[str]=[]
    custody={"candidate_commit":"a"*40,"head":"a"*40,"origin_main":"a"*40,"truenas_backup_main":"a"*40,"sources":[]}
    try:
        subprocess.Popen=lambda *_a,**_k:popen.append("Popen")  # type: ignore[assignment]
        controller.validate_static=lambda *,unused:{"subject_calls":0}; controller.git_custody=lambda:custody
        for ordinal in (1,2,3):
            with tempfile.TemporaryDirectory(prefix=f"pm-r10-glm-disamb-fail-{ordinal}-") as temporary:
                controller.EVIDENCE=Path(temporary)/"evidence"; controller._prefix=lambda ordinal=ordinal:{"row_count":ordinal-1}; row=controller.rows()[ordinal-1]
                def parent_failure(*_args:Any,row=row)->Any:
                    controller.EVIDENCE.mkdir(); (controller.EVIDENCE/row["pass_id"]).mkdir(); raise controller.ControllerError(f"gate {row['ordinal']} partial reserve")
                controller.base.run_row=parent_failure
                with contextlib.redirect_stdout(io.StringIO()): check(controller.dispatch(["run",str(ordinal)])==1,f"gate {ordinal} consumed failure")
                leaf=controller.EVIDENCE/row["pass_id"]/row["route_id"]; check(P.load_json(leaf/"terminal.json")["status"]=="FAIL" and (leaf/"runner_failure.json").is_file(),f"gate {ordinal} durable terminal")
                for future in controller.rows()[ordinal:]: check(not os.path.lexists(controller.EVIDENCE/future["pass_id"]/future["route_id"]),"suffix absent")
                checks+=3
        with tempfile.TemporaryDirectory(prefix="pm-r10-glm-disamb-absent-") as temporary:
            controller.EVIDENCE=Path(temporary)/"evidence"; controller._prefix=lambda:{"row_count":0}; controller.base.run_row=lambda *_a:(_ for _ in ()).throw(controller.ControllerError("before mutation"))
            with contextlib.redirect_stdout(io.StringIO()): check(controller.dispatch(["run","1"])==1,"absent failure")
            check(not os.path.lexists(controller.EVIDENCE),"absent failure has no mutation"); checks+=2
    finally: subprocess.Popen,controller.validate_static,controller.git_custody,controller._prefix,controller.base.run_row,controller.EVIDENCE=saved
    check(not popen,"partial failures never invoked Popen spy"); return checks+1

def repeat_and_output_checks() -> int:
    saved=(controller.validate_static,controller.git_custody,controller._prefix,controller.base.run_row,controller.base.record_failure,controller.preserve_postfailure,controller.EVIDENCE); calls:list[str]=[]; checks=0
    custody={"candidate_commit":"a"*40,"head":"a"*40,"origin_main":"a"*40,"truenas_backup_main":"a"*40,"sources":[]}
    try:
        controller.validate_static=lambda *,unused:{}; controller.git_custody=lambda:custody
        with tempfile.TemporaryDirectory(prefix="pm-r10-glm-disamb-repeat-") as temporary:
            controller.EVIDENCE=Path(temporary)/"evidence"; row=controller.rows()[0]; leaf=controller.EVIDENCE/row["pass_id"]/row["route_id"]; leaf.mkdir(parents=True); (leaf/"sentinel").write_bytes(b"prior PASS")
            controller._prefix=lambda:{"row_count":1}; controller.base.run_row=lambda *_a:calls.append("run"); controller.base.record_failure=lambda *_a:calls.append("failure"); controller.preserve_postfailure=lambda *_a:calls.append("preserve")
            before=(leaf/"sentinel").read_bytes()
            with contextlib.redirect_stdout(io.StringIO()): check(controller.dispatch(["run","1"])==1,"repeat rejected")
            check((leaf/"sentinel").read_bytes()==before and calls==[],"repeat byte-identical/no handler"); checks+=2
        class Closed(io.StringIO):
            def write(self,_value:str)->int: raise BrokenPipeError("closed after PASS")
        with tempfile.TemporaryDirectory(prefix="pm-r10-glm-disamb-output-") as temporary:
            controller.EVIDENCE=Path(temporary)/"evidence"; controller._prefix=lambda:{"row_count":0}; frozen:dict[str,bytes]={}
            def passed(*_a:Any)->dict[str,str]:
                calls.append("run"); row=controller.rows()[0]; leaf=controller.EVIDENCE/row["pass_id"]/row["route_id"]; leaf.mkdir(parents=True); (leaf/"terminal.json").write_bytes(b"durable PASS"); frozen.update({p.name:p.read_bytes() for p in leaf.iterdir()}); return {"status":"PASS"}
            controller.base.run_row=passed; controller.base.record_failure=lambda *_a:calls.append("failure"); controller.preserve_postfailure=lambda *_a:calls.append("preserve"); calls.clear()
            with contextlib.redirect_stdout(Closed()): expect(BrokenPipeError,lambda:controller.dispatch(["run","1"]),"post-PASS output")
            row=controller.rows()[0]; leaf=controller.EVIDENCE/row["pass_id"]/row["route_id"]; check({p.name:p.read_bytes() for p in leaf.iterdir()}==frozen and calls==["run"],"post-PASS output cannot corrupt evidence"); checks+=1
    finally: controller.validate_static,controller.git_custody,controller._prefix,controller.base.run_row,controller.base.record_failure,controller.preserve_postfailure,controller.EVIDENCE=saved
    return checks

def main() -> int:
    static=controller.validate_static(unused=True); check(static["rows"]==3 and static["temporary_bindings"]==11 and static["subject_calls"]==0,"static diagnostic"); checks=1
    checks+=parser_checks()+journal_checks()+dispatch_gate_checks()+failure_custody_checks()+repeat_and_output_checks()
    check(not os.path.lexists(controller.EVIDENCE) and not list(controller.HERE.rglob("*.pyc")) and not list(controller.HERE.rglob("__pycache__")),"no evidence/cache residue"); checks+=1
    print(P.canonical_json({"status":"PASS_ZERO_SUBJECT_SELFTEST","checks":checks,"metrics":static["metrics"],"temporary_bindings":11,"subject_calls":0,"qualification_credit":0})); return 0
if __name__=="__main__": raise SystemExit(main())
