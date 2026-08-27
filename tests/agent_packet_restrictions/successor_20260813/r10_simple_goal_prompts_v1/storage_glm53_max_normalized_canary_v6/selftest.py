#!/usr/bin/env python3
"""Zero-subject regressions for the isolated GLM53/max normalized canary V6."""
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
def formal_v5_replay() -> tuple[dict[str, Any], Path]:
    frozen = c.spec()["consumed_v5_pass_replay"]; root = c.REPO / frozen["evidence_root"]
    for record in frozen["records"]: check(c.file_record(c.REPO / record["path"]) == record,f"formal V5 frozen {Path(record['path']).name}")
    terminal = c.P.load_json(root / "terminal.json"); check(terminal["status"] == "PASS" and terminal["process_exit_code"] == terminal["qualification_credit"] == 0 and terminal["no_retry"] is True,"formal V5 PASS remains zero-credit")
    row = c.P.load_json(c.R10 / "storage_glm53_max_normalized_canary_v5/canary_contract.json")["rows"][0]; prompt = (c.V7 / "prompts/omp.prompt.txt").read_bytes(); session = root / "session.raw.jsonl"
    structural = c.ORIGINAL_SESSION(session,expected_cwd=row["cwd"],expected_objective=prompt[len(b"/goal "):].decode(),expected_provider="opencode-go",expected_model="glm-5.3-flash",expected_selector="opencode-go/glm-5.3-flash",expected_thinking="max",require_exit=True)
    check(structural == c.P.load_json(root / "structural_projection.json"),"formal V5 structural replay")
    normalized = c.NORMALIZE(session,structural,oracle_path=c.V7 / "oracle.json",schema_path=c.V7 / "response.schema.json",max_text_block_utf8_bytes=4096); c.base.exact_result(normalized["final_text"])
    check(normalized == c.P.load_json(root / "normalized_projection.json") and normalized["result_normalization"]["candidate_count"] == 2,"formal V5 corrected normalizer replay compatibility/no credit")
    return structural, session

def rewrite_candidates(raw: bytes, replacements: list[str]) -> bytes:
    seen = 0; output: list[bytes] = []
    for physical in raw.splitlines():
        value = json.loads(physical); message = value.get("message") if value.get("type") == "message" else None
        if isinstance(message,dict) and message.get("role") == "assistant" and isinstance(message.get("content"),list):
            for block in message["content"]:
                if not isinstance(block,dict) or block.get("type") != "text" or not isinstance(block.get("text"),str): continue
                lines = block["text"].split("\n")
                for index,line in enumerate(lines):
                    if line.startswith(c.P.RESULT_PREFIX):
                        check(seen < len(replacements),"candidate replacement count"); lines[index] = replacements[seen]; seen += 1
                block["text"] = "\n".join(lines)
        output.append(c.P.canonical_json(value).encode()+b"\n")
    check(seen == len(replacements),"all candidate replacements applied"); return b"".join(output)

def order_sensitive_normalizer_tests(structural: dict[str, Any], source: Path) -> None:
    oracle = c.P.load_json(c.V7 / "oracle.json"); canonical = c.P.RESULT_PREFIX + (c.V7 / "oracle.json").read_text().strip(); spaced = c.P.RESULT_PREFIX + json.dumps(oracle,ensure_ascii=False,separators=(", ",": "))
    reversed_value = dict(reversed(tuple(oracle.items()))); reordered = c.P.RESULT_PREFIX + json.dumps(reversed_value,ensure_ascii=False,separators=(",",":")); conflict = dict(oracle); conflict["plan_unit_count"] += 1; conflicting = c.P.RESULT_PREFIX + json.dumps(conflict,ensure_ascii=False,separators=(",",":"))
    nonfinite = canonical.replace('"plan_unit_count":248','"plan_unit_count":NaN'); wrong_type = canonical.replace('"source_match":true','"source_match":1')
    def project(lines: list[str]) -> dict[str, Any]:
        with tempfile.TemporaryDirectory(prefix="glm53-v6-normalizer-") as raw:
            path = Path(raw) / "session.jsonl"; c.P.atomic_write(path,rewrite_candidates(source.read_bytes(),lines)); return c.NORMALIZE(path,structural,oracle_path=c.V7 / "oracle.json",schema_path=c.V7 / "response.schema.json",max_text_block_utf8_bytes=4096)
    value = project([spaced,spaced]); check(value["final_text"] == canonical and value["result_normalization"]["candidate_count"] == 2,"same-order inline whitespace and identical duplicates canonicalize")
    rejects(c._normalizer.NormalizationError,lambda:project([reordered,reordered]),"recursive top-level key reorder accepted")
    rejects(c._normalizer.NormalizationError,lambda:project([canonical,conflicting]),"conflicting typed candidates accepted")
    rejects(c._normalizer.NormalizationError,lambda:project([nonfinite,canonical]),"nonfinite candidate accepted")
    rejects(c._normalizer.NormalizationError,lambda:project([wrong_type,canonical]),"wrong candidate type accepted")
    check(c._normalizer.typed_equal({"outer":{"a":1,"b":2}}, {"outer":{"a":1,"b":2}}) and not c._normalizer.typed_equal({"outer":{"a":1,"b":2}}, {"outer":{"b":2,"a":1}}) and c._normalizer.typed_equal([1,"x",True],[1,"x",True]) and not c._normalizer.typed_equal([1,"x",True],["x",1,True]) and not c._normalizer.typed_equal([1],[True]),"recursive dict order plus list order/type/value semantics exact")

def session_health_boundary_tests(source: Path) -> None:
    row = c.P.load_json(c.R10 / "storage_glm53_max_normalized_canary_v5/canary_contract.json")["rows"][0]; prompt = (c.V7 / "prompts/omp.prompt.txt").read_bytes(); common = {"expected_cwd":row["cwd"],"expected_objective":prompt[len(b"/goal "):].decode(),"expected_provider":"opencode-go","expected_model":"glm-5.3-flash","expected_selector":"opencode-go/glm-5.3-flash","expected_thinking":"max"}
    entries = [json.loads(line) for line in source.read_bytes().splitlines()]
    def write(values: list[dict[str, Any]], root: str) -> Path:
        path = Path(root) / "session.jsonl"; c.P.atomic_write(path,b"".join(c.P.canonical_json(value).encode()+b"\n" for value in values)); return path
    no_exit = [value for value in entries if not (value.get("type") == "custom" and value.get("customType") == "session_exit")]
    with tempfile.TemporaryDirectory(prefix="glm53-v6-settling-") as raw:
        path = write(no_exit,raw); check(c.session_health(path) is False,"final/Goal-complete/mode-none prefix remains settling without explicit exit"); normalized = c.verify_session(path,**common,require_exit=False); c.base.exact_result(normalized["final_text"]); rejects(c.omp_session.OmpSessionError,lambda:c.verify_session(path,**common,require_exit=True),"missing exit became permanent before explicit session_exit")
    malformed = [value for value in entries if not (value.get("type") == "message" and isinstance(value.get("message"),dict) and value["message"].get("role") == "toolResult")]
    with tempfile.TemporaryDirectory(prefix="glm53-v6-exit-bound-") as raw:
        path = write(malformed,raw); check(c.session_health(path) is True,"explicit session_exit health bound"); rejects(c.PermanentCanaryError,lambda:c.verify_session(path,**common,require_exit=False),"post-exit structural defect remained transient")
    for field,value,label in (("retryRecovery",{"attempt":1},"retry recovery"),("stopReason","error","provider/assistant error")):
        changed = copy.deepcopy(entries)
        for entry in changed:
            message = entry.get("message") if entry.get("type") == "message" else None
            if isinstance(message,dict) and message.get("role") == "assistant": message[field] = value; break
        with tempfile.TemporaryDirectory(prefix="glm53-v6-permanent-") as raw: rejects(c.PermanentCanaryError,lambda:c.session_health(write(changed,raw)),f"{label} not immediately permanent")

def v1_failure_and_prefix_tests() -> None:
    v2 = c.spec()["consumed_v2_failure_replay"]
    for record in v2["records"]: path = c.REPO / record["path"]; check(path.is_file() and not path.is_symlink() and path.stat().st_size == record["bytes"] and c.P.sha256_file(path) == record["sha256"],f"consumed V2 immutable {path.name}")
    terminal = c.P.load_json(c.REPO / next(record["path"] for record in v2["records"] if record["path"].endswith("/terminal.json"))); check(terminal["status"] == "FAIL" and terminal["no_retry"] is True and terminal["qualification_credit"] == 0 and terminal["goal_activation_observed"] is terminal["goal_complete_observed"] is False,"consumed V2 permanent zero-credit failure")
    frozen = c.spec()["consumed_v1_failure_replay"]; session = c.REPO / frozen["path"]; check(session.stat().st_size == frozen["bytes"] and c.P.sha256_file(session) == frozen["sha256"], "consumed V1 session immutable")
    prompt = (c.V7 / "prompts/omp.prompt.txt").read_bytes(); expected = {"expected_cwd":frozen["prefix_debug_runtime"]["cwd"],"expected_objective":prompt[len(b"/goal "):].decode(),"expected_provider":"opencode-go","expected_model":"glm-5.3-flash","expected_selector":"opencode-go/glm-5.3-flash","expected_thinking":"max","require_exit":False}
    rejects(c.omp_session.OmpSessionError,lambda:c.ORIGINAL_SESSION(session,**expected),"consumed V1 full structural failure promoted")
    prefix_expected = {key:expected[key] for key in ("expected_cwd","expected_objective","expected_selector","expected_thinking")}; projection = c.verify_submission_prefix(session,**prefix_expected); check(projection["goal_id"] and projection["session_id"], "V1 two-request active-Goal prefix accepted by unchanged V7 session prefix")
    debug = frozen["prefix_debug_runtime"]; check(all(record["bytes"] > 0 and len(record["sha256"]) == 64 for name,record in debug.items() if name != "cwd"),"V1 ephemeral debug receipt retained as historical custody only")
    old = c.ORIGINAL_PREFIX; c.ORIGINAL_PREFIX = lambda *_a, **_k: projection
    try:
        for count in (0,1,2):
            with tempfile.TemporaryDirectory(prefix=f"glm53-v5-prefix-{count}-") as raw:
                root = Path(raw); [c.P.atomic_write(root / f"rr-session-{index}.json",b"debug") for index in range(1,count+1)]; check(c.verify_submission_prefix(session,**prefix_expected) == projection,f"prefix independent of {count} debug requests")
    finally: c.ORIGINAL_PREFIX = old

def composer_and_patch_tests() -> None:
    old_evidence = c.EVIDENCE
    with tempfile.TemporaryDirectory(prefix="glm53-v5-composer-") as raw:
        c.EVIDENCE = Path(raw) / "evidence"; row = c.row_dir(); row.mkdir(parents=True); prompt = (c.V7 / "prompts/omp.prompt.txt").read_bytes(); c.P.atomic_write(row / "stdin_prompt.raw",prompt)
        before = b"startup " + c.VISIBLE_MAX + b" " + c.PROMPT_READY; after = before + " ❯ 📄 #1 /goal Audit".encode(); pending = entered = 0
        for snapshot in (before,before + b" redraw " + c.PROMPT_READY,before + " 📄 #1".encode(),after):
            try: value = c.composer_transition(before,snapshot)
            except c.base.RunnerError: pending += 1; continue
            entered += 1; break
        check(pending == 3 and entered == 1 and value["prompt_ready_glyph"] == "❯" and value["prompt_ready_observed"] is True and value["mcp_startup_finished"] is value["mcp_finished_banner_observed"] is False,"partial composer snapshots poll then ready/Enter once")
        bad_before = b"startup MCP finished " + c.VISIBLE_MAX + b" " + c.PROMPT_READY; rejects(c.PermanentCanaryError,lambda:c.composer_transition(bad_before,bad_before + " ❯ 📄 #1 /goal Audit".encode()),"MCP-banner-only startup accepted")
        rejects(c.PermanentCanaryError,lambda:c.composer_transition(before,after + c.MCP_SENTINEL),"post-prompt MCP banner accepted"); rejects(c.PermanentCanaryError,lambda:c.composer_transition(before,b"contaminated"),"non-prefix composer contamination accepted")
        rejects(c.PermanentCanaryError,lambda:c.composer_transition(before,after + b" /goal Wrong"),"post-readiness prompt contradiction accepted"); rejects(c.PermanentCanaryError,lambda:c.composer_transition(before,before + " 📄 #2".encode()),"wrong prompt card accepted")
        c.P.atomic_write(row / "stdin_prompt.raw",prompt + b"x"); rejects(c.PermanentCanaryError,lambda:c.composer_transition(before,after),"wrong prompt bytes accepted")
    c.EVIDENCE = old_evidence
    original, patched = c.ORIGINAL_RUN_ROW.__code__, c.PROMPT_READY_RUN_ROW.__code__; differences = [(left,right) for left,right in zip(original.co_consts,patched.co_consts,strict=True) if left != right]
    check(differences == [(c.MCP_SENTINEL,c.PROMPT_READY)] and patched.co_code == original.co_code, "literal-only V7 readiness patch")
    original, patched = c.ORIGINAL_VERIFY_OMP_RAW.__code__, c.PROMPT_READY_VERIFY_OMP_RAW.__code__; differences = [(left,right) for left,right in zip(original.co_consts,patched.co_consts,strict=True) if left != right]
    check(differences == [(c.MCP_SENTINEL,c.PROMPT_READY),("mcp_startup_finished","prompt_ready_observed")] and patched.co_code == original.co_code, "literal-only V7 verifier compatibility patch")

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
        with tempfile.TemporaryDirectory(prefix="glm53-v5-verify-row-") as raw:
            root = Path(raw) / "evidence"; zero_mcp_fixture(root); c.V.EVIDENCE,c.V.verify_omp_raw = root,c.verify_omp_raw; check(c.V.verify_row("pass_01",route)["status"] == "PASS","end-to-end zero-MCP V.verify_row")
        with tempfile.TemporaryDirectory(prefix="glm53-v5-ready-mutation-") as raw:
            root = Path(raw) / "evidence"; row = zero_mcp_fixture(root); composer = c.P.load_json(row / "composer_ack.json"); composer["prompt_ready_observed"] = False; c.P.atomic_write(row / "composer_ack.json",c.P.pretty_json(composer)); refresh_zero_mcp_fixture(row); c.V.EVIDENCE = root; rejects(c.PermanentCanaryError,lambda:c.V.verify_row("pass_01",route),"false prompt-ready receipt accepted")
        with tempfile.TemporaryDirectory(prefix="glm53-v5-banner-mutation-") as raw:
            root = Path(raw) / "evidence"; row = zero_mcp_fixture(root); replacement = c.PROMPT_READY + b" " * (len(c.MCP_SENTINEL)-len(c.PROMPT_READY))
            for name in ("pre_prompt.raw","composer_ack.raw","transcript.raw"): path = row / name; c.P.atomic_write(path,path.read_bytes().replace(replacement,c.MCP_SENTINEL,1))
            refresh_zero_mcp_fixture(row); c.V.EVIDENCE = root; rejects(c.PermanentCanaryError,lambda:c.V.verify_row("pass_01",route),"hidden MCP banner accepted")
        with tempfile.TemporaryDirectory(prefix="glm53-v5-post-banner-mutation-") as raw:
            root = Path(raw) / "evidence"; row = zero_mcp_fixture(root); pre = (row / "pre_prompt.raw").read_bytes(); check(c.MCP_SENTINEL not in c.base.strip_terminal(pre),"post-banner mutation pre-prompt clean")
            for name in ("composer_ack.raw","transcript.raw"): path = row / name; value = path.read_bytes(); c.P.atomic_write(path,value[:len(pre)] + c.MCP_SENTINEL + value[len(pre):])
            refresh_zero_mcp_fixture(row); c.V.EVIDENCE = root; rejects(c.PermanentCanaryError,lambda:c.V.verify_row("pass_01",route),"post-boundary MCP banner accepted")
    finally: c.V.EVIDENCE,c.V.verify_omp_raw = old_evidence,old_verify

def profile_and_subprocess_tests() -> None:
    old_rows, old_git, old_popen, old_run, old_custody = c.rows,c.git_custody,c.ORIGINAL_POPEN,c.ORIGINAL_RUN,c.DISPATCH_CUSTODY
    with tempfile.TemporaryDirectory(prefix="glm53-v5-profile-") as raw:
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
    with tempfile.TemporaryDirectory(prefix="glm53-v5-chain-") as raw:
        c.EVIDENCE = Path(raw) / "evidence"; row = c.row_dir(); row.mkdir(parents=True)
        for name in ("reservation.json","omp_preflight.json","session.raw.jsonl","http_final_receipt.json","normalized_projection.json"): c.P.atomic_write(row / name,b"{}\n")
        session_hash = c.P.sha256_file(row / "session.raw.jsonl"); c.P.atomic_write(row / "structural_projection.json",c.P.pretty_json({"session_id":"s","goal_id":"g","session_file_sha256":session_hash})); preflight_hash = c.P.sha256_file(row / "omp_preflight.json")
        c.P.atomic_write(row / "launch.json",c.P.pretty_json({"omp_preflight_sha256":preflight_hash})); c.P.atomic_write(row / "submission_acceptance.json",c.P.pretty_json({"session_projection":{"session_id":"s","goal_id":"g"}}))
        chain = c.formal_chain(); check(len(chain["records"]) == 8 and "http_prefix_receipt.json" not in chain["records"],"prefix-free formal chain")
        (row / "launch.json").unlink(); rejects(c.CanaryError,c.formal_chain,"missing launch accepted"); c.P.atomic_write(row / "launch.json",c.P.pretty_json({"omp_preflight_sha256":"0" * 64})); rejects(c.PermanentCanaryError,c.formal_chain,"broken launch/preflight join accepted")
        target = row / "http_final_receipt.json"; rejects(c.CanaryError,lambda:c.write_once(target,{}),"final receipt overwrite accepted")
    c.EVIDENCE = old

def postpass_scope_tests() -> None:
    frozen = c.spec()["consumed_v4_pass_replay"]; v4 = c.R10 / "storage_glm53_max_normalized_canary_v4"; evidence = v4 / "evidence"; terminal = c.P.load_json(evidence / "pass_01" / c.ROUTE_ID / "terminal.json")
    check(terminal["status"] == "PASS" and terminal["no_retry"] is True and terminal["process_exit_code"] == terminal["qualification_credit"] == 0 and len(terminal["evidence"]) == frozen["terminal_evidence_join_count"],"V4 PASS subject remains zero-credit/no-retro")
    check(all(c.file_record(c.REPO / item["path"]) == item for item in frozen["records"]),"V4 durable source/evidence replay freeze; ephemeral private capture not required after reboot")
    names = c.verify_formal.__code__.co_names; source = (c.HERE / "controller.py").read_text(); check("NORMALIZE" in names and source.index("with installed():",source.index("def verify_prefix")) < source.index("verify_formal(row,custody)",source.index("def verify_prefix")),"local normalizer formal replay stays inside installed postpass scope")
    reports = [{"pass_id":"pass_01","rows":[{"route_id":c.ROUTE_ID}]}]; old_evidence = c.V.EVIDENCE
    with tempfile.TemporaryDirectory(prefix="glm53-v5-tree-") as raw:
        root = Path(raw) / "evidence"; row_path = root / "pass_01" / c.ROUTE_ID; row_path.mkdir(parents=True); c.P.atomic_write(root / "launch_journal.jsonl",b"{}\n"); c.V.EVIDENCE = root; c.V.verify_evidence_tree(reports); check(True,"exact one-row evidence tree")
        c.P.atomic_write(root / "extra",b"x"); rejects(c.V.VerifyError,lambda:c.V.verify_evidence_tree(reports),"extra evidence contamination accepted"); (root / "extra").unlink(); row_path.rmdir(); rejects(c.V.VerifyError,lambda:c.V.verify_evidence_tree(reports),"missing planned row path accepted")
    c.V.EVIDENCE = old_evidence
    row = c.rows()[0]
    with tempfile.TemporaryDirectory(prefix="glm53-v5-identity-") as raw:
        root,current,prior = Path(raw),Path(raw) / "current",Path(raw) / "prior"; current.mkdir(); prior.mkdir(); c.P.atomic_write(current / "contract.json",c.P.pretty_json({"attempt_id":row["attempt_id"],"nonce":row["nonce"]})); c.historical_identity_clean(row,root,current); check(True,"current-root planned identity self-inclusion")
        c.P.atomic_write(prior / "evidence.json",c.P.pretty_json({"attempt_id":row["attempt_id"],"nonce":row["nonce"]})); rejects(c.CanaryError,lambda:c.historical_identity_clean(row,root,current),"prior-root identity reuse accepted")

def static_and_prelaunch_tests() -> None:
    report = c.validate_static(unused=True); check(report["status"] == "PASS_LOCAL_GLM53_MAX_NORMALIZED_CANARY_V6" and report["subject_calls"] == report["runtime_preflight"]["subject_calls"] == 0 and report["runtime_preflight"]["status"] == "PASS_OMP_RUNTIME_18_0_7" and report["runtime_preflight"]["profiles"] == {"OMP_PROFILE":"default","PI_PROFILE":"default"},"static package/current runtime")
    old_run = c.ORIGINAL_RUN; environments: list[dict[str,str]] = []; runtime = c.spec()["runtime"]
    def runtime_spy(argv: list[str], **kwargs: Any) -> Any:
        environments.append(kwargs["env"]); value: Any = runtime["version"] if argv[-1] == "--version" else runtime["effective_config"][argv[-1]]; stdout = ("true" if value is True else "false" if value is False else c.P.canonical_json(value) if isinstance(value,(dict,list)) else value) + "\n"; return c.subprocess.CompletedProcess(argv,0,stdout=stdout,stderr="")
    c.ORIGINAL_RUN = runtime_spy
    try: isolated = c.current_runtime_preflight(); check(isolated["status"] == "PASS_OMP_RUNTIME_18_0_7" and environments and all(env["PI_CODING_AGENT_DIR"] == runtime["source_profile_dir"] and env["OMP_PROFILE"] == env["PI_PROFILE"] == "default" for env in environments),"runtime preflight forces exact default profiles despite inherited environment")
    finally: c.ORIGINAL_RUN = old_run
    old_evidence, old_runtime = c.EVIDENCE,c.current_runtime_preflight; runtime_calls: list[str] = []
    with tempfile.TemporaryDirectory(prefix="glm53-v6-captured-runtime-") as raw:
        c.EVIDENCE = Path(raw) / "evidence"; c.EVIDENCE.mkdir(); c.current_runtime_preflight = lambda: runtime_calls.append("forbidden") or (_ for _ in ()).throw(c.CanaryError("live runtime drift"))
        try: completed = c.validate_static(unused=False); check(completed["runtime_preflight"]["status"] == "NOT_RUN_POST_RESERVATION_USES_CAPTURED_PREFLIGHT" and not runtime_calls,"completed/partial evidence verification ignores later live runtime drift")
        finally: c.EVIDENCE,c.current_runtime_preflight = old_evidence,old_runtime
    source = (c.HERE / "controller.py").read_text(); tree = ast.parse(source); imports = {alias.name for node in ast.walk(tree) if isinstance(node,(ast.Import,ast.ImportFrom)) for alias in node.names}
    check("sqlite3" not in imports and "models refresh" not in source.lower() and c.spec()["architecture_limits"]["copied_v7_body_count"] == 0,"no catalog/copied verifier")
    check(len(c.BINDINGS) == 18 and c._normalizer.NormalizationError in c.ERRORS and c.NORMALIZER == c.HERE / "result_normalizer.py","thin local-normalizer terminal binding surface")
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
    old_git,old_runtime,old_prefix,old_popen = c.git_custody,c.current_runtime_preflight,c.verify_prefix,c.ORIGINAL_POPEN; prelaunch_runtime_calls: list[str] = []; popen_calls: list[Any] = []; c.git_custody = lambda:{"candidate_commit":"a" * 40}; c.ORIGINAL_POPEN = lambda *args,**kwargs:popen_calls.append((args,kwargs))
    try:
        c.current_runtime_preflight = lambda: prelaunch_runtime_calls.append("drift") or (_ for _ in ()).throw(c.CanaryError("synthetic runtime drift"))
        with contextlib.redirect_stdout(io.StringIO()) as out: rc = c.dispatch(["run","1","--max-seconds","3600"])
        check(rc == 1 and prelaunch_runtime_calls == ["drift"] and not popen_calls and not os.path.lexists(c.EVIDENCE) and "FAIL_PRELAUNCH_NO_MUTATION" in out.getvalue(),"fresh runtime drift fails before reservation/Popen")
        prelaunch_runtime_calls.clear(); c.verify_prefix = lambda:{"status":"PASS_ALREADY_CONSUMED","row_count":1}; c.current_runtime_preflight = lambda:prelaunch_runtime_calls.append("forbidden") or {"status":"PASS_OMP_RUNTIME_18_0_7","subject_calls":0}
        with contextlib.redirect_stdout(io.StringIO()) as out: rc = c.dispatch(["run","1","--max-seconds","3600"])
        check(rc == 1 and not prelaunch_runtime_calls and not popen_calls and "canary already consumed" in out.getvalue(),"repeat stops at prefix before current runtime or subject")
    finally: c.git_custody,c.current_runtime_preflight,c.verify_prefix,c.ORIGINAL_POPEN = old_git,old_runtime,old_prefix,old_popen

def main() -> int:
    static_and_prelaunch_tests(); corrected, formal = formal_v5_replay(); order_sensitive_normalizer_tests(corrected,formal); session_health_boundary_tests(formal); v1_failure_and_prefix_tests(); composer_and_patch_tests(); zero_mcp_verify_row_tests(); profile_and_subprocess_tests(); chain_tests(); postpass_scope_tests()
    check(not list(c.HERE.rglob("*.pyc")) and not list(c.HERE.rglob("__pycache__")),"no cache residue"); print(c.P.canonical_json({"status":"PASS_ZERO_SUBJECT_SELFTEST","checks":CHECKS,"subject_calls":0,"qualification_credit":0})); return 0

if __name__ == "__main__": raise SystemExit(main())
