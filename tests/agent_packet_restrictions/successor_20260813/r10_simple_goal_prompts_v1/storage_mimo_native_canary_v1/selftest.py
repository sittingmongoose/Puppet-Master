#!/usr/bin/env python3
"""Zero-subject tests for the one-row native MiMo canary."""
from __future__ import annotations
import contextlib, copy, io, os, subprocess, tempfile
from pathlib import Path
from typing import Any, Callable
import controller
P, V, R10, V7 = controller.P, controller.V, controller.R10, controller.V7
NATIVE_ROW = V7 / "evidence/pass_01/omp_ox_alpha_free_max"
OBJECTIVE = (V7/"prompts/omp.prompt.txt").read_text(encoding="utf-8")[len("/goal "):]

class TestFailure(RuntimeError): pass
def check(value: bool, message: str) -> None:
    if not value: raise TestFailure(message)
def expect(types: type[BaseException] | tuple[type[BaseException],...], call: Callable[[],Any], message: str, fragment: str | None = None) -> None:
    try: call()
    except types as exc:
        check(fragment is None or fragment in str(exc), f"wrong rejection: {message}: {exc}"); return
    raise TestFailure(f"expected rejection: {message}")

def native_replay_checks() -> int:
    raw = (NATIVE_ROW/"session.raw.jsonl").read_bytes()
    check(len(raw) == 38353 and P.sha256_bytes(raw) == "472f2f99e46a04d8ad62ee054f115a8c166f1abaeeeaaf14238d7bdd0ad0f304", "native fixture freeze")
    launch = P.load_json(NATIVE_ROW/"launch.json"); projection = controller.omp_session.verify_session(
        NATIVE_ROW/"session.raw.jsonl", expected_cwd=launch["cwd"], expected_objective=OBJECTIVE,
        expected_provider="opencode-go", expected_model="ox-alpha-free", expected_selector="opencode-go/ox-alpha-free",
        expected_thinking="max", require_exit=True)
    controller.base.exact_result(projection["final_text"])
    check(projection["assistant_lifecycle_shape"] == "standard_tool_cycle" and projection["ordinary_tool_calls"] == 0, "unmodified native parser/scorer")
    route = next(row for row in P.load_json(V7/"matrix.json")["ordered_routes"] if row["id"] == "omp_ox_alpha_free_max")
    check(V.verify_row("pass_01", route)["status"] == "PASS", "full frozen V7 verifier replay")
    row, mimo = controller.rows()[0], controller.route_map()["omp_mimo_v25_free_high"]
    argv = controller.expected_argv(mimo,row)
    check("--config" not in argv and argv[-4:] == ["--model","opencode-zen/mimo-v2.5-free","--thinking","high"], "MiMo native argv")
    return 5

def catalog_raw(model: dict[str,Any] | None = None, *, duplicate: bool = False) -> bytes:
    target = copy.deepcopy(model if model is not None else controller.spec()["catalog_gate"]["expected_model"])
    target["thinking"] = target.get("thinking",["low","medium","high"])
    models = [target,copy.deepcopy(target)] if duplicate else [target]
    return (P.canonical_json({"models":models})+"\n").encode()
def catalog_receipt(raw: bytes, *, started: str = "2026-08-26T19:40:00.000Z", finished: str = "2026-08-26T19:40:01.000Z") -> dict[str,Any]:
    gate = controller.spec()["catalog_gate"]
    try: projection, error = controller.catalog_projection(raw), None
    except controller.ControllerError as exc: projection, error = None, f"ControllerError: {exc}"
    return {"schema_id":"pm.r10.storage_pipeline.omp_catalog_refresh_preflight.v1","name":"forced_catalog_refresh","started_at_utc":started,"finished_at_utc":finished,
            "duration_ms":int((V.parse_utc(finished)-V.parse_utc(started)).total_seconds()*1000),"argv":gate["argv"],"cwd":str(controller.HERE),"profile_dir":gate["profile_dir"],
            "profile_environment":{"PI_CODING_AGENT_DIR":gate["profile_dir"]},"forced_online":True,"extensions_disabled":True,"timeout_seconds":gate["command_timeout_seconds"],
            "timed_out":False,"exit_code":0,"stdout":controller.raw_record(raw),"stderr":controller.raw_record(b""),"projection":projection,"projection_error":error}

def catalog_and_api_checks() -> int:
    good_raw = catalog_raw(); good = catalog_receipt(good_raw); controller.validate_catalog_receipt(good,"2026-08-26T19:40:30.000Z"); checks = 1
    absent = copy.deepcopy(controller.spec()["catalog_gate"]["expected_model"]); absent.update({"id":"other","selector":"opencode-zen/other"})
    for call,label in ((lambda:controller.catalog_projection(catalog_raw(absent)),"selector absence"),(lambda:controller.catalog_projection(catalog_raw(duplicate=True)),"selector duplicate"),(lambda:controller.validate_catalog_receipt(catalog_receipt(b"{not-json}\n")),"malformed JSON"),(lambda:controller.validate_catalog_receipt(good,"2026-08-26T19:41:02.000Z"),"stale refresh")):
        expect((controller.ControllerError,V.VerifyError),call,label); checks += 1
    bad_hash = copy.deepcopy(good); bad_hash["stdout"]["sha256"] = "0"*64
    expect(controller.ControllerError,lambda:controller.validate_catalog_receipt(bad_hash),"raw hash"); checks += 1
    for mutate,label in ((lambda model:model["cost"].update({"input":0.01}),"wrong price"),(lambda model:model.update({"reasoning":False}),"reasoning capability"),(lambda model:model.update({"thinking":["low","medium"]}),"high capability"),(lambda model:model.update({"contextWindow":199999}),"context limit"),(lambda model:model.update({"maxTokens":31999}),"output limit"),(lambda model:model.update({"input":["text"]}),"input capability")):
        model = copy.deepcopy(controller.spec()["catalog_gate"]["expected_model"]); model["thinking"] = ["low","medium","high"]; mutate(model)
        candidate = catalog_receipt(catalog_raw(model)); expect(controller.ControllerError,lambda candidate=candidate:controller.validate_catalog_receipt(candidate),label); checks += 1
    saved = controller.ORIGINAL_SESSION_VERIFY
    try:
        controller.ORIGINAL_SESSION_VERIFY = lambda *_a,**_k:{"assistant_message_count":2,"final_text":"fixture"}
        expected = {"expected_selector":"opencode-zen/mimo-v2.5-free"}
        projection = controller.verify_session(NATIVE_ROW/"session.raw.jsonl",**expected)
        check(projection["assistant_api"] == "openai-completions" and projection["assistant_api_message_count"] == 2, "every MiMo assistant API")
        checks += 1; raw = (NATIVE_ROW/"session.raw.jsonl").read_bytes()
        for needle,replacement,label in ((b'"api":"openai-completions"',b'"api":"wrong-api"',"wrong assistant API"),(b'"api":"openai-completions"',b'"zzz":"openai-completions"',"missing assistant API")):
            with tempfile.TemporaryDirectory(prefix="pm-r10-mimo-api-") as temporary:
                path = Path(temporary)/"session.jsonl"; path.write_bytes(raw.replace(needle,replacement,1))
                expect(controller.ControllerError,lambda path=path:controller.verify_session(path,**expected),label); checks += 1
    finally: controller.ORIGINAL_SESSION_VERIFY = saved
    saved_run, saved_now = subprocess.run, controller.base.utc_now
    observed: list[dict[str,Any]] = []; times = iter(("2026-08-26T19:40:00.000Z","2026-08-26T19:40:01.000Z"))
    def fake_run(argv: list[str], **kwargs: Any) -> subprocess.CompletedProcess[bytes]:
        observed.append({"argv":argv,**kwargs}); return subprocess.CompletedProcess(argv,0,good_raw,b"")
    try:
        subprocess.run = fake_run  # type: ignore[assignment]
        controller.base.utc_now = lambda:next(times)
        receipt = controller.forced_catalog_refresh(); controller.validate_catalog_receipt(receipt,"2026-08-26T19:40:30.000Z")
        gate = controller.spec()["catalog_gate"]
        check(len(observed) == 1 and observed[0]["argv"] == gate["argv"] and observed[0]["cwd"] == str(controller.HERE) and observed[0]["env"]["PI_CODING_AGENT_DIR"] == gate["profile_dir"] and observed[0]["timeout"] == 30 and observed[0]["capture_output"] is True and observed[0]["text"] is False, "forced refresh invocation")
        checks += 1
    finally: subprocess.run, controller.base.utc_now = saved_run, saved_now
    saved_preflight = (controller.git_custody,controller.ORIGINAL_PREFLIGHT,controller.forced_catalog_refresh,controller.DISPATCH_CUSTODY,subprocess.Popen)
    custody = {"candidate_commit":"a"*40,"head":"a"*40,"origin_main":"a"*40,"truenas_backup_main":"a"*40,"sources":[]}
    try:
        controller.git_custody = lambda:custody; controller.DISPATCH_CUSTODY = custody
        controller.ORIGINAL_PREFLIGHT = lambda *_a:{"effective_config":{"advisor.enabled":False,"task.agentAdvisor":{"task":"off"}}}
        controller.forced_catalog_refresh = lambda:copy.deepcopy(good)
        with tempfile.TemporaryDirectory(prefix="pm-r10-mimo-preflight-") as temporary:
            row_dir = Path(temporary); receipt = controller.row_preflight(row_dir,controller.rows()[0],controller.route_map()["omp_mimo_v25_free_high"])
            persisted = P.load_json(row_dir/"omp_preflight.json")
            check(receipt == persisted and persisted["catalog_refresh_sha256"] == controller.catalog_receipt_digest(good), "catalog embedded before Popen")
            checks += 1
        wrong = copy.deepcopy(controller.spec()["catalog_gate"]["expected_model"]); wrong["thinking"] = ["low","medium","high"]; wrong["cost"]["output"] = 1
        rejected = catalog_receipt(catalog_raw(wrong)); controller.forced_catalog_refresh = lambda:copy.deepcopy(rejected)
        with tempfile.TemporaryDirectory(prefix="pm-r10-mimo-preflight-fail-") as temporary:
            row_dir = Path(temporary); expect(controller.ControllerError,lambda:controller.row_preflight(row_dir,controller.rows()[0],controller.route_map()["omp_mimo_v25_free_high"]),"invalid catalog preflight")
            persisted = P.load_json(row_dir/"omp_preflight.json")
            check(persisted["catalog_refresh"]["stdout"] == rejected["stdout"] and persisted["catalog_refresh_sha256"] == controller.catalog_receipt_digest(rejected), "rejected catalog raw preserved")
            checks += 2
        sequence = iter((custody,{**custody,"candidate_commit":"b"*40})); controller.git_custody = lambda:next(sequence); controller.forced_catalog_refresh = lambda:copy.deepcopy(good); popen: list[str] = []
        def forbidden_popen(*_args:Any,**_kwargs:Any) -> Any: popen.append("Popen"); raise TestFailure("subject Popen reached")
        subprocess.Popen = forbidden_popen  # type: ignore[assignment]
        with tempfile.TemporaryDirectory(prefix="pm-r10-mimo-catalog-drift-") as temporary:
            row_dir = Path(temporary); expect(controller.ControllerError,lambda:controller.row_preflight(row_dir,controller.rows()[0],controller.route_map()["omp_mimo_v25_free_high"]),"custody drift during refresh")
            persisted = P.load_json(row_dir/"omp_preflight.json")
            check(persisted["catalog_refresh"] == good and persisted["catalog_refresh_sha256"] == controller.catalog_receipt_digest(good) and "git_custody" not in persisted and not popen, "post-refresh drift preserves catalog before no-Popen FAIL")
            checks += 2
    finally: controller.git_custody,controller.ORIGINAL_PREFLIGHT,controller.forced_catalog_refresh,controller.DISPATCH_CUSTODY,subprocess.Popen = saved_preflight
    saved_evidence = controller.EVIDENCE
    try:
        for label,accepted in (("positive chain",True),("catalog digest",False),("launch hash",False),("journal hash",False),("terminal hash",False)):
            with tempfile.TemporaryDirectory(prefix="pm-r10-mimo-chain-") as temporary:
                controller.EVIDENCE = Path(temporary)/"evidence"; row_dir = controller.EVIDENCE/"pass_01"/"omp_mimo_v25_free_high"; row_dir.mkdir(parents=True)
                preflight = {"catalog_refresh":copy.deepcopy(good),"catalog_refresh_sha256":controller.catalog_receipt_digest(good)}
                if label == "catalog digest": preflight["catalog_refresh_sha256"] = "0"*64
                controller.base.atomic_json(row_dir/"omp_preflight.json",preflight); digest = P.sha256_file(row_dir/"omp_preflight.json")
                launch = {"started_at_utc":"2026-08-26T19:40:30.000Z","omp_preflight_bytes":(row_dir/"omp_preflight.json").stat().st_size,"omp_preflight_sha256":digest}
                terminal = {"evidence":[{"path":"omp_preflight.json","bytes":(row_dir/"omp_preflight.json").stat().st_size,"sha256":digest}]}; journal = [{"omp_preflight_sha256":digest}]
                if label == "launch hash": launch["omp_preflight_sha256"] = "0"*64
                if label == "journal hash": journal[0]["omp_preflight_sha256"] = "0"*64
                if label == "terminal hash": terminal["evidence"][0]["sha256"] = "0"*64
                P.atomic_write(controller.EVIDENCE/"launch_journal.jsonl",P.jsonl_bytes(journal))
                call = lambda:controller.verify_catalog_chain(row_dir,preflight,launch,terminal)
                if accepted: check(call() == digest,label)
                else: expect(controller.ControllerError,call,label)
                checks += 1
    finally: controller.EVIDENCE = saved_evidence
    return checks

def journal_checks() -> int:
    original, checks = controller.EVIDENCE, 0
    try:
        with tempfile.TemporaryDirectory(prefix="pm-r10-mimo-journal-") as temporary:
            controller.EVIDENCE = Path(temporary)/"evidence"; controller.EVIDENCE.mkdir(); row = controller.rows()[0]
            report = {"ordinal":1,"started_at_utc":"2026-08-26T19:40:00.000Z","launch_sha256":"launch","omp_preflight_sha256":"preflight","pid":9901}
            reports = [{"pass_id":"pass_01","rows":[report]}]
            journal = [{"schema_id":"pm.r10.storage_pipeline.launch_journal.v2",**{field:row[field] for field in controller.IDENTITY},**{field:report[field] for field in ("started_at_utc","launch_sha256","omp_preflight_sha256","pid")},"popen_observed":True}]
            P.atomic_write(controller.EVIDENCE/"launch_journal.jsonl",P.jsonl_bytes(journal)); controller.generic_journal(reports); checks += 1
            for change,label in ((lambda x:x.append(copy.deepcopy(x[0])),"extra"),(lambda x:x[0].update({"nonce":"0"*32}),"identity"),(lambda x:x[0].update({"launch_sha256":"wrong"}),"hash"),(lambda x:x[0].update({"popen_observed":False}),"Popen"),(lambda x:x[0].update({"pid":0}),"PID"),(lambda x:x[0].update({"extra":1}),"extra field")):
                candidate = copy.deepcopy(journal); change(candidate); P.atomic_write(controller.EVIDENCE/"launch_journal.jsonl",P.jsonl_bytes(candidate))
                expect(controller.ControllerError,lambda:controller.generic_journal(reports),label); checks += 1
    finally: controller.EVIDENCE = original
    return checks

def binding_and_gate_checks() -> int:
    current = controller.bindings(); originals = [(module,name,getattr(module,name)) for module,name,_ in current]; checks = 0
    with controller.installed(): check(all(getattr(module,name) is value for module,name,value in controller.bindings()), "bindings installed")
    check(all(getattr(module,name) is value for module,name,value in originals), "bindings restored"); checks += 2
    check(controller.verify_prefix()["row_count"] == 0, "empty exact prefix"); checks += 1
    saved = (subprocess.Popen,controller.validate_static,controller.git_custody,controller._prefix,controller.base.run_row,controller.require_authority,controller.EVIDENCE,controller.ORIGINAL_PREFLIGHT)
    popen: list[str] = []; reached: list[str] = []
    def forbidden(*_args:Any,**_kwargs:Any) -> Any: popen.append("Popen"); raise TestFailure("Popen reached")
    custody = {"candidate_commit":"a"*40,"head":"a"*40,"origin_main":"a"*40,"truenas_backup_main":"a"*40,"sources":[]}
    try:
        try:
            live = controller.git_custody(); check(live["head"] == live["origin_main"] == live["truenas_backup_main"] and len(live["sources"]) == 4, "pushed source custody")
        except controller.ControllerError:
            status = subprocess.run(["git","-C",str(controller.REPO),"status","--porcelain=v1","--",*[str(controller.HERE/name) for name in controller.SOURCES]],check=False,capture_output=True,text=True)
            check(status.returncode == 0 and status.stdout and all(line.startswith("?? ") for line in status.stdout.splitlines()), "untracked source custody")
        checks += 1
        subprocess.Popen = forbidden  # type: ignore[assignment]
        controller.validate_static = lambda *,unused:{"subject_calls":0}; controller.git_custody = lambda:custody; controller._prefix = lambda:{"row_count":0}
        controller.base.run_row = lambda *_args:(_ for _ in ()).throw(controller.base.ReservationConflict("synthetic consumed"))
        with contextlib.redirect_stdout(io.StringIO()):
            check(controller.dispatch(["run","1","--max-seconds","3599"]) == 1, "budget gate"); checks += 1
            check(controller.dispatch(["run","1"]) == 1, "reservation gate"); checks += 1
        controller.require_authority = lambda _row:(_ for _ in ()).throw(controller.ControllerError("authority closed"))
        with contextlib.redirect_stdout(io.StringIO()): check(controller.dispatch(["run","1"]) == 1, "authority gate")
        checks += 1; controller.require_authority = saved[5]; controller.git_custody = lambda:(_ for _ in ()).throw(controller.ControllerError("unpushed"))
        with contextlib.redirect_stdout(io.StringIO()): check(controller.dispatch(["run","1"]) == 1, "custody gate")
        checks += 1; controller.DISPATCH_CUSTODY = custody; controller.git_custody = lambda:{**custody,"candidate_commit":"b"*40}; controller.ORIGINAL_PREFLIGHT = forbidden
        expect(controller.ControllerError,lambda:controller.row_preflight(Path("/tmp/never"),controller.rows()[0],controller.route_map()["omp_mimo_v25_free_high"]),"pre-Popen custody drift"); checks += 1
    finally:
        subprocess.Popen,controller.validate_static,controller.git_custody,controller._prefix,controller.base.run_row,controller.require_authority,controller.EVIDENCE,controller.ORIGINAL_PREFLIGHT = saved; controller.DISPATCH_CUSTODY = None
    check(not popen and not reached, "zero-subject gates never Popen"); check(all(getattr(module,name) is value for module,name,value in originals), "bindings restored after dispatch")
    return checks + 2

def failure_custody_checks() -> int:
    saved = (subprocess.Popen,controller.validate_static,controller.git_custody,controller._prefix,controller.base.run_row,controller.EVIDENCE); checks = 0; popen: list[str] = []
    custody = {"candidate_commit":"a"*40,"head":"a"*40,"origin_main":"a"*40,"truenas_backup_main":"a"*40,"sources":[]}
    try:
        subprocess.Popen = lambda *_a,**_k:popen.append("Popen")  # type: ignore[assignment]
        controller.validate_static = lambda *,unused:{}; controller.git_custody = lambda:custody; controller._prefix = lambda:{"row_count":0}
        for kind in ("root","parent","row"):
            with tempfile.TemporaryDirectory(prefix=f"pm-r10-mimo-{kind}-") as temporary:
                controller.EVIDENCE = Path(temporary)/"evidence"; row = controller.rows()[0]
                def partial(*_args:Any, kind=kind, row=row) -> Any:
                    if kind == "root": controller.EVIDENCE.mkdir()
                    elif kind == "parent": (controller.EVIDENCE/row["pass_id"]).mkdir(parents=True)
                    else: (controller.EVIDENCE/row["pass_id"]/row["route_id"]).mkdir(parents=True)
                    raise controller.ControllerError(f"{kind} partial reserve")
                controller.base.run_row = partial
                with contextlib.redirect_stdout(io.StringIO()): check(controller.dispatch(["run","1"]) == 1, f"{kind} consumed")
                leaf = controller.EVIDENCE/row["pass_id"]/row["route_id"]
                check(P.load_json(leaf/"terminal.json")["status"] == "FAIL" and (leaf/"runner_failure.json").is_file(), f"{kind} durable failure"); checks += 2
        with tempfile.TemporaryDirectory(prefix="pm-r10-mimo-absent-") as temporary:
            controller.EVIDENCE = Path(temporary)/"evidence"; controller.base.run_row = lambda *_a:(_ for _ in ()).throw(controller.ControllerError("before mutation"))
            with contextlib.redirect_stdout(io.StringIO()): check(controller.dispatch(["run","1"]) == 1, "absent prelaunch failure")
            check(not os.path.lexists(controller.EVIDENCE), "truly absent remains absent"); checks += 2
    finally: subprocess.Popen,controller.validate_static,controller.git_custody,controller._prefix,controller.base.run_row,controller.EVIDENCE = saved
    check(not popen, "partial failures do not hit Popen spy"); return checks + 1

def repeat_and_output_checks() -> int:
    saved = (controller.validate_static,controller.git_custody,controller._prefix,controller.base.run_row,controller.base.record_failure,controller.preserve_postfailure,controller.EVIDENCE); calls: list[str] = []; checks = 0
    custody = {"candidate_commit":"a"*40,"head":"a"*40,"origin_main":"a"*40,"truenas_backup_main":"a"*40,"sources":[]}
    try:
        controller.validate_static = lambda *,unused:{}; controller.git_custody = lambda:custody
        with tempfile.TemporaryDirectory(prefix="pm-r10-mimo-repeat-") as temporary:
            controller.EVIDENCE = Path(temporary)/"evidence"; row = controller.rows()[0]; leaf = controller.EVIDENCE/row["pass_id"]/row["route_id"]; leaf.mkdir(parents=True); (leaf/"sentinel").write_bytes(b"prior PASS")
            controller._prefix = lambda:{"row_count":1}; controller.base.run_row = lambda *_a:calls.append("run"); controller.base.record_failure = lambda *_a:calls.append("failure"); controller.preserve_postfailure = lambda *_a:calls.append("preserve")
            before = (leaf/"sentinel").read_bytes()
            with contextlib.redirect_stdout(io.StringIO()): check(controller.dispatch(["run","1"]) == 1, "repeat rejected")
            check((leaf/"sentinel").read_bytes() == before and calls == [], "repeat byte-identical/no handlers"); checks += 2
        class Closed(io.StringIO):
            def write(self, _value: str) -> int: raise BrokenPipeError("closed after PASS")
        with tempfile.TemporaryDirectory(prefix="pm-r10-mimo-output-") as temporary:
            controller.EVIDENCE = Path(temporary)/"evidence"; controller._prefix = lambda:{"row_count":0}; frozen: dict[str,bytes] = {}
            def passed(*_a:Any) -> dict[str,str]:
                calls.append("run"); row = controller.rows()[0]; leaf = controller.EVIDENCE/row["pass_id"]/row["route_id"]; leaf.mkdir(parents=True); (leaf/"terminal.json").write_bytes(b"durable PASS"); frozen.update({p.name:p.read_bytes() for p in leaf.iterdir()}); return {"status":"PASS"}
            controller.base.run_row = passed; controller.base.record_failure = lambda *_a:calls.append("failure"); controller.preserve_postfailure = lambda *_a:calls.append("preserve"); calls.clear()
            with contextlib.redirect_stdout(Closed()): expect(BrokenPipeError,lambda:controller.dispatch(["run","1"]),"post-PASS output")
            row = controller.rows()[0]; leaf = controller.EVIDENCE/row["pass_id"]/row["route_id"]
            check({p.name:p.read_bytes() for p in leaf.iterdir()} == frozen and calls == ["run"], "post-PASS output cannot corrupt evidence"); checks += 1
    finally: controller.validate_static,controller.git_custody,controller._prefix,controller.base.run_row,controller.base.record_failure,controller.preserve_postfailure,controller.EVIDENCE = saved
    return checks

def authority_mutation_checks() -> int:
    authority = copy.deepcopy(controller.spec()["authority"]); controller.validate_authority(authority); checks = 1
    for mutate,label in ((lambda a:a["paired_exchange"]["proposal"].update({"text_utf8":a["paired_exchange"]["proposal"]["text_utf8"].replace("one fresh","two fresh")}),"proposal widening"),(lambda a:a["paired_exchange"]["proposal"].update({"timestamp":"2026-08-26T19:22:49.359Z"}),"proposal event drift"),(lambda a:a["paired_exchange"]["user_reply"].update({"visible_excerpt_utf8":"You can use MiMo"}),"reply drift"),(lambda a:a["paired_exchange"]["user_reply"].update({"corroborating_event_item_id":"wrong"}),"reply event drift"),(lambda a:a.update({"authorized_selector":"opencode-zen/hy3-free"}),"selector widening")):
        candidate = copy.deepcopy(authority); mutate(candidate); expect(controller.ControllerError,lambda:controller.validate_authority(candidate),label); checks += 1
    return checks

def main() -> int:
    static = controller.validate_static(unused=True); check(static["rows"] == 1 and static["temporary_bindings"] == 11 and static["subject_calls"] == 0, "static canary"); checks = 1
    checks += native_replay_checks()+catalog_and_api_checks()+journal_checks()+binding_and_gate_checks()+failure_custody_checks()+repeat_and_output_checks()+authority_mutation_checks()
    row = controller.rows()[0]; check(not os.path.lexists(controller.EVIDENCE) and not os.path.lexists(row["cwd"]) and not os.path.lexists(row["session_dir"]) and not list(controller.HERE.rglob("*.pyc")) and not list(controller.HERE.rglob("__pycache__")), "no evidence/runtime/cache residue"); checks += 1
    print(P.canonical_json({"status":"PASS_ZERO_SUBJECT_SELFTEST","checks":checks,"metrics":static["metrics"],"temporary_bindings":11,"subject_calls":0,"qualification_credit":0,"matrix_credit":0})); return 0
if __name__ == "__main__": raise SystemExit(main())
