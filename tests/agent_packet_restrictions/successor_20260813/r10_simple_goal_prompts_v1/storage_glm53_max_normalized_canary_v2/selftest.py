#!/usr/bin/env python3
"""Zero-subject regressions for the isolated GLM53/max normalized canary V2."""
from __future__ import annotations

import ast
import contextlib
import copy
import io
import json
import os
import tempfile
from pathlib import Path
from typing import Any, Callable

import controller as c

CHECKS = 0
def check(value: bool, label: str) -> None:
    global CHECKS
    if not value: raise AssertionError(label)
    CHECKS += 1
def rejects(error: type[BaseException] | tuple[type[BaseException],...], call: Callable[[],Any], label: str) -> None:
    global CHECKS
    try: call()
    except error: CHECKS += 1; return
    raise AssertionError(label)
def expected_session(path: Path, *, exit_required: bool) -> dict[str, Any]:
    prompt = (c.V7 / "prompts/omp.prompt.txt").read_bytes(); return c.ORIGINAL_SESSION(path,expected_cwd=str(path.parent / "cwd"),expected_objective=prompt[len(b"/goal "):].decode(),expected_provider="opencode-go",expected_model="glm-5.3-flash",expected_selector="opencode-go/glm-5.3-flash",expected_thinking="max",require_exit=exit_required)

def v5_replay() -> tuple[dict[str, Any], Path, Path]:
    frozen = c.spec()["v5_zero_subject_replay"]; root = Path(frozen["artifact_root"])
    for key, name in (("session","session.raw.jsonl"),("structural_projection","structural_projection.json"),("normalized_projection","normalized_projection.json"),("terminal","terminal.json"),("transcript","transcript.raw")):
        path, expected = root / name, frozen[key]; check(path.is_file() and not path.is_symlink() and path.stat().st_size == expected["bytes"] and c.P.sha256_file(path) == expected["sha256"], f"V5 frozen {name}")
    session = root / "session.raw.jsonl"; structural = expected_session(session,exit_required=True); check(structural == c.P.load_json(root / "structural_projection.json"), "V5 structural replay")
    normalized = c.NORMALIZE(session,structural,oracle_path=c.V7 / "oracle.json",schema_path=c.V7 / "response.schema.json",max_text_block_utf8_bytes=4096); check(normalized == c.P.load_json(root / "normalized_projection.json"), "V5 normalizer replay")
    c.base.exact_result(normalized["final_text"]); check(normalized["result_normalization"]["candidate_count"] == 1 and c.session_health(session), "V5 scorer and normal terminal")
    lines = session.read_bytes().splitlines(keepends=True); partial: list[bytes] = []
    for line in lines:
        partial.append(line); value = json.loads(line); goal = value.get("data",{}).get("goal") if isinstance(value.get("data"),dict) else None
        if isinstance(goal,dict) and goal.get("status") == "complete": break
    with tempfile.TemporaryDirectory(prefix="glm53-v2-pending-") as raw:
        path = Path(raw) / "session.jsonl"; c.P.atomic_write(path,b"".join(partial)); check(c.session_health(path) is False, "Goal-complete prefix pending until terminal assistant")
    mutated = list(lines)
    for index, line in enumerate(mutated):
        value = json.loads(line); message = value.get("message") if value.get("type") == "message" else None
        if isinstance(message,dict) and message.get("role") == "assistant": message["retryRecovery"] = {"attempt":1}; mutated[index] = c.P.canonical_json(value).encode() + b"\n"; break
    with tempfile.TemporaryDirectory(prefix="glm53-v2-retry-") as raw:
        path = Path(raw) / "session.jsonl"; c.P.atomic_write(path,b"".join(mutated)); rejects(c.PermanentCanaryError,lambda:c.session_health(path),"retryRecovery accepted")
    return structural, root / "cwd", session

def final_http_tests(structural: dict[str, Any], private: Path, session: Path) -> None:
    assistants = c.assistant_receipts(session,structural); check(len(assistants) == 2, "V5 two verified assistant receipts")
    pairs = [{"pair_index":index,"assistant":assistants[index-1],"request":c.safe_request(private / f"rr-session-{index}.json"),"response":c.safe_response(private / f"rr-session-{index}.res.log")} for index in (1,2)]
    receipt = {"schema_id":"pm.r10.storage_pipeline.http_final_receipt.v2","phase":"post_structural_normalized_normal_exit_complete_pairs","request_pair_count":2,"verified_assistant_turn_count":2,"pairs":pairs,"sensitive_material_copied":False}
    c.validate_final_http(receipt,structural,private,session); check(True,"valid terminal 2:2 HTTP/assistant receipt")
    wrong = copy.deepcopy(receipt); wrong["request_pair_count"] = 1; rejects(c.PermanentCanaryError,lambda:c.validate_final_http(wrong,structural,private,session),"missing pair accepted")
    wrong = copy.deepcopy(receipt); wrong["pairs"] = list(reversed(wrong["pairs"])); rejects(c.PermanentCanaryError,lambda:c.validate_final_http(wrong,structural,private,session),"reordered pairs accepted")
    wrong = copy.deepcopy(receipt); wrong["pairs"][1]["request"]["prior_assistant_text_sha256"] = []; rejects(c.PermanentCanaryError,lambda:c.validate_final_http(wrong,structural,private,session),"request/assistant history mismatch accepted")
    wrong = copy.deepcopy(receipt); wrong["pairs"][1]["request"]["prior_goal_result_ids"] = ["wrong"]; rejects(c.PermanentCanaryError,lambda:c.validate_final_http(wrong,structural,private,session),"request/Goal history mismatch accepted")
    wrong = copy.deepcopy(receipt); wrong["pairs"][0]["response"]["assistant_text_sha256"] = "0" * 64; rejects(c.PermanentCanaryError,lambda:c.validate_final_http(wrong,structural,private,session),"response/assistant mismatch accepted")
    with tempfile.TemporaryDirectory(prefix="glm53-v2-prior-args-") as raw:
        root = Path(raw) / "private"; root.mkdir(mode=0o700); [c.P.atomic_write(root / path.name,path.read_bytes()) for path in private.iterdir()]; [os.chmod(path,0o600) for path in root.iterdir()]; target = root / "rr-session-2.json"; data = target.read_bytes(); old, new = b'{\\"op\\":\\"complete\\"}', b'{\\"op\\":\\"get\\"}'; check(data.count(old) == 1,"preserved direct-v5 sole prior complete argument")
        c.P.atomic_write(target,data.replace(old,new,1)); os.chmod(target,0o600); changed = copy.deepcopy(receipt); changed["pairs"][1]["request"] = c.safe_request(target); check(changed["pairs"][1]["request"]["prior_goal_calls"][0]["arguments"] == {"op":"get"},"rehashed prior get projection")
        records = [record for pair in changed["pairs"] for record in (pair["request"],pair["response"])]; check({path.name for path in root.iterdir()} == {record["name"] for record in records} and all((c.safe_request(root / record["name"]) if record["name"].endswith(".json") else c.safe_response(root / record["name"])) == record for record in records),"regenerated complete private hash/projection chain")
        receipt_path = Path(raw) / "http_final_receipt.json"; c.P.atomic_write(receipt_path,c.P.pretty_json(changed)); rejects(c.PermanentCanaryError,lambda:c.validate_final_http(c.P.load_json(receipt_path),structural,root,session),"rehashed prior get accepted by full formal HTTP verifier")
    rejects(c.PermanentCanaryError,lambda:c.no_sensitive({"Authorization":"Bearer secret"}),"auth leakage accepted")
    with tempfile.TemporaryDirectory(prefix="glm53-v2-http-") as raw:
        root = Path(raw); [c.P.atomic_write(root / path.name,path.read_bytes()) for path in private.iterdir()]; os.chmod(root,0o700); [os.chmod(path,0o600) for path in root.iterdir()]
        c.P.atomic_write(root / "extra",b"x"); rejects(c.PermanentCanaryError,lambda:c.validate_final_http(receipt,structural,root,session),"extra private file accepted"); (root / "extra").unlink()
        (root / "rr-session-2.res.log").unlink(); rejects(c.PermanentCanaryError,lambda:c.validate_final_http(receipt,structural,root,session),"incomplete pair accepted")
    with tempfile.TemporaryDirectory(prefix="glm53-v2-tools-") as raw:
        path = Path(raw) / "rr-session-1.json"; value = c.P.load_json(private / "rr-session-1.json"); value["body"]["tools"].append({"type":"function","function":{"name":"context7"}}); c.P.atomic_write(path,c.P.pretty_json(value)); rejects(c.PermanentCanaryError,lambda:c.safe_request(path),"MCP tool roster accepted")

def v1_failure_and_prefix_tests() -> None:
    frozen = c.spec()["consumed_v1_failure_replay"]; session = c.REPO / frozen["path"]; check(session.stat().st_size == frozen["bytes"] and c.P.sha256_file(session) == frozen["sha256"], "consumed V1 session immutable")
    prompt = (c.V7 / "prompts/omp.prompt.txt").read_bytes(); expected = {"expected_cwd":frozen["prefix_debug_runtime"]["cwd"],"expected_objective":prompt[len(b"/goal "):].decode(),"expected_provider":"opencode-go","expected_model":"glm-5.3-flash","expected_selector":"opencode-go/glm-5.3-flash","expected_thinking":"max","require_exit":False}
    rejects(c.omp_session.OmpSessionError,lambda:c.ORIGINAL_SESSION(session,**expected),"consumed V1 full structural failure promoted")
    prefix_expected = {key:expected[key] for key in ("expected_cwd","expected_objective","expected_selector","expected_thinking")}; projection = c.verify_submission_prefix(session,**prefix_expected); check(projection["goal_id"] and projection["session_id"], "V1 two-request active-Goal prefix accepted by unchanged V7 session prefix")
    debug = frozen["prefix_debug_runtime"]
    for name, record in debug.items():
        if name == "cwd": continue
        path = Path(debug["cwd"]) / name; check(path.stat().st_size == record["bytes"] and c.P.sha256_file(path) == record["sha256"], f"V1 debug frozen {name}")
    old = c.ORIGINAL_PREFIX; c.ORIGINAL_PREFIX = lambda *_a, **_k: projection
    try:
        for count in (0,1,2):
            with tempfile.TemporaryDirectory(prefix=f"glm53-v2-prefix-{count}-") as raw:
                root = Path(raw); [c.P.atomic_write(root / f"rr-session-{index}.json",b"debug") for index in range(1,count+1)]; check(c.verify_submission_prefix(session,**prefix_expected) == projection,f"prefix independent of {count} debug requests")
    finally: c.ORIGINAL_PREFIX = old

def composer_and_patch_tests() -> None:
    before = b"startup " + c.VISIBLE_MAX + b" " + c.PROMPT_READY; after = before + " ❯ 📄 #1 /goal Audit".encode(); value = c.composer_transition(before,after)
    check(value["prompt_ready_glyph"] == "❯" and value["prompt_ready_observed"] is True and value["mcp_startup_finished"] is value["mcp_finished_banner_observed"] is False, "empty-MCP prompt-ready transition")
    original, patched = c.ORIGINAL_RUN_ROW.__code__, c.PROMPT_READY_RUN_ROW.__code__; differences = [(left,right) for left,right in zip(original.co_consts,patched.co_consts,strict=True) if left != right]
    check(differences == [(c.MCP_SENTINEL,c.PROMPT_READY)] and patched.co_code == original.co_code, "literal-only V7 readiness patch")
    original, patched = c.ORIGINAL_VERIFY_OMP_RAW.__code__, c.PROMPT_READY_VERIFY_OMP_RAW.__code__; differences = [(left,right) for left,right in zip(original.co_consts,patched.co_consts,strict=True) if left != right]
    check(differences == [(c.MCP_SENTINEL,c.PROMPT_READY),("mcp_startup_finished","prompt_ready_observed")] and patched.co_code == original.co_code, "literal-only V7 verifier compatibility patch")
    rejects(c.PermanentCanaryError,lambda:c.composer_transition(b"startup MCP finished " + c.VISIBLE_MAX,after),"MCP-banner-only startup accepted")
    rejects(c.PermanentCanaryError,lambda:c.composer_transition(before,after + c.MCP_SENTINEL),"post-prompt MCP banner accepted")

def refresh_zero_mcp_fixture(row: Path) -> None:
    composer = c.P.load_json(row / "composer_ack.json"); pre, ack = row / "pre_prompt.raw", row / "composer_ack.raw"; composer.update({"bytes":ack.stat().st_size,"pre_prompt_bytes":pre.stat().st_size,"pre_prompt_sha256":c.P.sha256_file(pre),"sha256":c.P.sha256_file(ack),"new_raw_bytes":ack.stat().st_size-pre.stat().st_size}); c.P.atomic_write(row / "composer_ack.json",c.P.pretty_json(composer))
    prompt = c.P.load_json(row / "prompt_write.json"); prompt["pre_prompt"]["sha256"] = c.P.sha256_file(row / "pre_prompt.raw"); c.P.atomic_write(row / "prompt_write.json",c.P.pretty_json(prompt))
    enter = c.P.load_json(row / "enter_write.json"); enter.update({"prompt_write_sha256":c.P.sha256_file(row / "prompt_write.json"),"composer_ack_sha256":c.P.sha256_file(row / "composer_ack.json")}); c.P.atomic_write(row / "enter_write.json",c.P.pretty_json(enter))
    acceptance = c.P.load_json(row / "submission_acceptance.json"); acceptance["enter_write_sha256"] = c.P.sha256_file(row / "enter_write.json"); c.P.atomic_write(row / "submission_acceptance.json",c.P.pretty_json(acceptance))
    terminal = c.P.load_json(row / "terminal.json")
    for record in terminal["evidence"]: path = row / record["path"]; record.update({"bytes":path.stat().st_size,"sha256":c.P.sha256_file(path)})
    c.P.atomic_write(row / "terminal.json",c.P.pretty_json(terminal))

def zero_mcp_fixture(root: Path) -> Path:
    source = c.V7 / "evidence/pass_01/omp_ox_alpha_free_max"; row = root / "pass_01/omp_ox_alpha_free_max"; row.mkdir(parents=True)
    for path in source.iterdir():
        if path.is_file() and path.name != "failure_review.json": c.P.atomic_write(row / path.name,path.read_bytes())
    replacement = c.PROMPT_READY + b" " * (len(c.MCP_SENTINEL)-len(c.PROMPT_READY))
    for name in ("pre_prompt.raw","composer_ack.raw","transcript.raw"): path = row / name; c.P.atomic_write(path,path.read_bytes().replace(c.MCP_SENTINEL,replacement))
    composer = c.P.load_json(row / "composer_ack.json"); composer.update({"mcp_startup_finished":False,"mcp_finished_banner_observed":False,"prompt_ready_observed":True}); c.P.atomic_write(row / "composer_ack.json",c.P.pretty_json(composer)); refresh_zero_mcp_fixture(row); return row

def zero_mcp_verify_row_tests() -> None:
    route = c.P.load_json(c.V7 / "matrix.json")["ordered_routes"][0]; old_evidence, old_verify = c.V.EVIDENCE,c.V.verify_omp_raw
    try:
        with tempfile.TemporaryDirectory(prefix="glm53-v2-verify-row-") as raw:
            root = Path(raw) / "evidence"; zero_mcp_fixture(root); c.V.EVIDENCE,c.V.verify_omp_raw = root,c.verify_omp_raw; check(c.V.verify_row("pass_01",route)["status"] == "PASS","end-to-end zero-MCP V.verify_row")
        with tempfile.TemporaryDirectory(prefix="glm53-v2-ready-mutation-") as raw:
            root = Path(raw) / "evidence"; row = zero_mcp_fixture(root); composer = c.P.load_json(row / "composer_ack.json"); composer["prompt_ready_observed"] = False; c.P.atomic_write(row / "composer_ack.json",c.P.pretty_json(composer)); refresh_zero_mcp_fixture(row); c.V.EVIDENCE = root; rejects(c.PermanentCanaryError,lambda:c.V.verify_row("pass_01",route),"false prompt-ready receipt accepted")
        with tempfile.TemporaryDirectory(prefix="glm53-v2-banner-mutation-") as raw:
            root = Path(raw) / "evidence"; row = zero_mcp_fixture(root); replacement = c.PROMPT_READY + b" " * (len(c.MCP_SENTINEL)-len(c.PROMPT_READY))
            for name in ("pre_prompt.raw","composer_ack.raw","transcript.raw"): path = row / name; c.P.atomic_write(path,path.read_bytes().replace(replacement,c.MCP_SENTINEL,1))
            refresh_zero_mcp_fixture(row); c.V.EVIDENCE = root; rejects(c.PermanentCanaryError,lambda:c.V.verify_row("pass_01",route),"hidden MCP banner accepted")
        with tempfile.TemporaryDirectory(prefix="glm53-v2-post-banner-mutation-") as raw:
            root = Path(raw) / "evidence"; row = zero_mcp_fixture(root); pre = (row / "pre_prompt.raw").read_bytes(); check(c.MCP_SENTINEL not in c.base.strip_terminal(pre),"post-banner mutation pre-prompt clean")
            for name in ("composer_ack.raw","transcript.raw"): path = row / name; value = path.read_bytes(); c.P.atomic_write(path,value[:len(pre)] + c.MCP_SENTINEL + value[len(pre):])
            refresh_zero_mcp_fixture(row); c.V.EVIDENCE = root; rejects(c.PermanentCanaryError,lambda:c.V.verify_row("pass_01",route),"post-boundary MCP banner accepted")
    finally: c.V.EVIDENCE,c.V.verify_omp_raw = old_evidence,old_verify

def profile_and_subprocess_tests() -> None:
    old_rows, old_git, old_popen, old_run, old_custody = c.rows,c.git_custody,c.ORIGINAL_POPEN,c.ORIGINAL_RUN,c.DISPATCH_CUSTODY
    with tempfile.TemporaryDirectory(prefix="glm53-v2-profile-") as raw:
        root = Path(raw); row = copy.deepcopy(old_rows()[0]); fields = {"cwd":"cwd","session_dir":"session","profile_dir":"profile","private_capture_dir":"private","home_dir":"home","xdg_config_home":"xdg-config","xdg_cache_home":"xdg-cache","xdg_data_home":"xdg-data","claude_config_dir":"claude","copilot_home":"copilot"}; row.update({field:str(root / name) for field,name in fields.items()}); c.rows = lambda:[row]
        host = root / "host"; (host / ".cursor").mkdir(parents=True); c.P.atomic_write(host / ".cursor/mcp.json",b"foreign sentinel"); seed = c.prepare_profile(); profile = Path(row["profile_dir"])
        check(seed["seed_roster"] == ["agent.db","config.yml","models.db","models.yml"] and {p.name for p in profile.iterdir()} == set(seed["seed_roster"]), "exact four-file profile seed")
        check(all((path.stat().st_mode & 0o777) == 0o600 for path in profile.iterdir()) and all(not any(Path(row[field]).iterdir()) for field in c.ENV_PATHS.values()), "private seed and empty environment roots")
        isolated = c.isolated_env({"HOME":str(host)}); check(isolated["HOME"] == row["home_dir"] and isolated["OMP_PROFILE"] == isolated["PI_PROFILE"] == "default" and not os.path.lexists(Path(isolated["HOME"]) / ".cursor"), "host Cursor sentinel isolated")
        Path(row["cwd"]).mkdir(); custody = {"candidate_commit":"a" * 40}; calls: list[Any] = []
        def popen_spy(argv: Any, *args: Any, **kwargs: Any) -> str: calls.append(("popen",argv,kwargs)); return "delegated"
        def run_spy(argv: Any, *args: Any, **kwargs: Any) -> str: calls.append(("run",argv,kwargs)); return "checked"
        c.git_custody,c.ORIGINAL_POPEN,c.ORIGINAL_RUN,c.DISPATCH_CUSTODY = (lambda:custody),popen_spy,run_spy,custody
        try:
            argv = c.expected_argv(c.route_map()[c.ROUTE_ID],row); check("--no-extensions" in argv and "--config" not in argv,"native no-extension argv")
            rejects(c.PermanentCanaryError,lambda:c.SPROXY.Popen([*argv,"--config","bad"],env={}),"wrong argv delegated")
            check(c.SPROXY.Popen(argv,env={}) == "delegated" and calls[-1][2]["env"]["PI_REQ_DEBUG"] == "1" and calls[-1][2]["env"]["HOME"] == row["home_dir"],"isolated exact subject delegate")
            binary = c.P.load_json(c.V7 / "runtime_manifest.json")["omp"]["binary"]; check(c.SPROXY.run([binary,"--version"],env={}) == "checked" and calls[-1][2]["env"]["XDG_CONFIG_HOME"] == row["xdg_config_home"],"isolated preflight delegate")
        finally: c.rows,c.git_custody,c.ORIGINAL_POPEN,c.ORIGINAL_RUN,c.DISPATCH_CUSTODY = old_rows,old_git,old_popen,old_run,old_custody

def chain_tests() -> None:
    old = c.EVIDENCE
    with tempfile.TemporaryDirectory(prefix="glm53-v2-chain-") as raw:
        c.EVIDENCE = Path(raw) / "evidence"; row = c.row_dir(); row.mkdir(parents=True)
        for name in ("reservation.json","omp_preflight.json","session.raw.jsonl","http_final_receipt.json","normalized_projection.json"): c.P.atomic_write(row / name,b"{}\n")
        session_hash = c.P.sha256_file(row / "session.raw.jsonl"); c.P.atomic_write(row / "structural_projection.json",c.P.pretty_json({"session_id":"s","goal_id":"g","session_file_sha256":session_hash})); preflight_hash = c.P.sha256_file(row / "omp_preflight.json")
        c.P.atomic_write(row / "launch.json",c.P.pretty_json({"omp_preflight_sha256":preflight_hash})); c.P.atomic_write(row / "submission_acceptance.json",c.P.pretty_json({"session_projection":{"session_id":"s","goal_id":"g"}}))
        chain = c.formal_chain(); check(len(chain["records"]) == 8 and "http_prefix_receipt.json" not in chain["records"],"prefix-free formal chain")
        (row / "launch.json").unlink(); rejects(c.CanaryError,c.formal_chain,"missing launch accepted"); c.P.atomic_write(row / "launch.json",c.P.pretty_json({"omp_preflight_sha256":"0" * 64})); rejects(c.PermanentCanaryError,c.formal_chain,"broken launch/preflight join accepted")
        target = row / "http_final_receipt.json"; rejects(c.CanaryError,lambda:c.write_once(target,{}),"final receipt overwrite accepted")
    c.EVIDENCE = old

def static_and_prelaunch_tests() -> None:
    report = c.validate_static(unused=True); check(report["status"] == "PASS_LOCAL_GLM53_MAX_NORMALIZED_CANARY_V2" and report["subject_calls"] == 0,"static package")
    source = (c.HERE / "controller.py").read_text(); tree = ast.parse(source); imports = {alias.name for node in ast.walk(tree) if isinstance(node,(ast.Import,ast.ImportFrom)) for alias in node.names}
    check("sqlite3" not in imports and "models refresh" not in source.lower() and c.spec()["architecture_limits"]["copied_v7_body_count"] == 0,"no catalog/copied verifier")
    check(len(c.BINDINGS) == 18 and c._normalizer.NormalizationError in c.ERRORS,"thin terminal binding surface")
    saved = [(module,name,getattr(module,name)) for module,name,_ in c.BINDINGS]
    with c.installed():
        check(all(getattr(module,name) is value for module,name,value in c.BINDINGS),"bindings installed"); argv = c.base.expected_argv(c.route_map()[c.ROUTE_ID],c.rows()[0]); verify = c.V.expected_argv(c.route_map()[c.ROUTE_ID],c.rows()[0]["cwd"],c.rows()[0]["session_dir"]); check(argv == verify and "--no-extensions" in argv,"runner/verifier argv identity")
    check(all(getattr(module,name) is value for module,name,value in saved),"bindings restored")
    prompt = (c.V7 / "prompts/omp.prompt.txt").read_bytes(); transport = c.base.validate_two_phase_payloads(prompt,b"\r"); check(transport["prompt_bytes"] == 3036 and transport["enter_bytes"] == 1,"prompt then standalone CR")
    original, popen = c.git_custody,c.ORIGINAL_POPEN; calls: list[Any] = []
    c.git_custody = lambda: (_ for _ in ()).throw(c.CanaryError("synthetic custody failure")); c.ORIGINAL_POPEN = lambda *args,**kwargs: calls.append((args,kwargs))
    try:
        with contextlib.redirect_stdout(io.StringIO()) as out: rc = c.dispatch(["run","1","--max-seconds","3600"])
        check(rc == 1 and "FAIL_PRELAUNCH_NO_MUTATION" in out.getvalue() and not calls and not os.path.lexists(c.EVIDENCE),"custody failure zero subject/no reservation")
    finally: c.git_custody,c.ORIGINAL_POPEN = original,popen

def main() -> int:
    static_and_prelaunch_tests(); structural, private, session = v5_replay(); final_http_tests(structural,private,session); v1_failure_and_prefix_tests(); composer_and_patch_tests(); zero_mcp_verify_row_tests(); profile_and_subprocess_tests(); chain_tests()
    check(not list(c.HERE.rglob("*.pyc")) and not list(c.HERE.rglob("__pycache__")),"no cache residue"); print(c.P.canonical_json({"status":"PASS_ZERO_SUBJECT_SELFTEST","checks":CHECKS,"subject_calls":0,"qualification_credit":0})); return 0

if __name__ == "__main__": raise SystemExit(main())
